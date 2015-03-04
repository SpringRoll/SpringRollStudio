(function(undefined){

	// Import classes
	if (APP)
	{
		var WebSocketServer = require('ws').Server;
		var gui = require('nw.gui');
	}

	// Import classes
	var Module = include('springroll.Module'),
		Browser = include('cloudkid.Browser');

	/**
	*  The application for receiving WebSocket messages from other applications
	*  @class RemoteTrace
	*/
	var RemoteTrace = function()
	{
		Module.call(this);

		if (APP)
		{
			/**
			*  The new websocket server
			*  @property {WebSocketServer} server
			*/
			this.server = new WebSocketServer({port: 1026});

			// Handle incoming messages
			this.server.on('connection', this._onInit.bind(this));

			// Initialize the menu
			this.initMenubar(false, true);
		}

		/**
		*  The output DOM container for log statements
		*  @property {jquery} output
		*/
		this.output = $("#trace");
		
		/**
		 * A stack of jquery elements representing log groups, so that logs can be
		 * added to the proper groups.
		 * @property {Array} groupStack
		 */
		this.groupStack = [];
		
		/**
		 * The next id for a group to ensure unique ids for each one.
		 * @property {Number} nextGroupId
		 */
		this.nextGroupId = 0;

		/**
		*  Clear the output on a new session
		*  @property {boolean} clearOnNewSession
		*  @default  true
		*/
		var clear = localStorage.getItem('clearOnNewSession');
		this.clearOnNewSession = clear !== null ? !!clear : false;

		/**
		*  The max log limit, 0 is off
		*  @property {int} maxLogs
		*  @default  500
		*/
		var maxLogs = localStorage.getItem('maxLogs');
		this.maxLogs = maxLogs !== null ? parseInt(maxLogs, 10) : 500;

		//******** INIT THE UI COMPONENTS

		// Max logs input
		$("#maxLogs").keydown(function(e){
			var code = e.which || e.keyCode;
			if (!(code >= 48 && code <= 57) && // numbers
				!(code >= 96 && code <= 106) && // keypad
				!(code >= 37 && code <= 40) && //toggle keys
				code != 8 && //backspace
				code != 46 // del
			){
				e.preventDefault();
				return false;
			}
		}).keyup(function(e){
			this.maxLogs = parseInt(e.currentTarget.value);
		}.bind(this)).change(function(){
			localStorage.setItem('maxLogs', this.value);
		}).val(this.maxLogs);

		// Setup tooltips on buttons
		$('.buttons .btn').tooltip({ container: 'body' });

		// Button to toggle timestamps
		var output = this.output;
		this.timestampButton = $("#timestampButton").click(function(){
			$(this).toggleClass('active');
			output.toggleClass('timestamps');
			localStorage.setItem('timestamps', output.hasClass('timestamps'));
		});
		if (localStorage.getItem('timestamps') === "true")
		{
			this.timestampButton.addClass('active');
			output.addClass('timestamps');
		}

		// Button to wrap text
		this.wrapButton = $("#wrapButton").click(function(){
			$(this).toggleClass('active');
			output.toggleClass('wrap');
			localStorage.setItem('wrap', output.hasClass('wrap'));
		});
		if (localStorage.getItem('wrap') === "true")
		{
			this.wrapButton.addClass('active');
			output.addClass('wrap');
		}

		/**
		*  Button for clearing the output
		*  @property {jquery} clearButton
		*/
		this.clearButton = $("#clearButton")
			.click(this.clear.bind(this));

		/**
		*  Button for saving the output to a file
		*  @property {jquery} saveButton
		*/
		this.saveButton = $("#saveButton")
			.click(this.save.bind(this));

		this.filters = $(".filters a").click(this._onFiltersChanged.bind(this));
		this.themes = $(".themes a").click(this._onThemesChanged.bind(this));

		/**
		*  The color scheme, the name of the CSS class
		*  @property {String} theme
		*/
		this.setTheme(localStorage.getItem('theme') || "default");

		// Set the current filters
		var filters = localStorage.getItem('filters');
		this.setFilters(filters ? filters.split(',') : allFilters);

		this.clear();
		
		if(DEBUG)
			window.RemoteTrace = this;
	};

	// Reference to the prototype
	var p = extend(RemoteTrace, Module);

	// The collection of all themes
	var allFilters = ['general','debug','info','warning','error'];

	/**
	*  When the WebSocketServer is initialized
	*  @method  _onInit
	*  @private
	*  @param  {WebSocket} ws The websocket instance
	*/
	p._onInit = function(ws)
	{
		ws.on('message', this._onMessage.bind(this));
	};

	/**
	 * Handler for the filters
	 * @method  _onFiltersChanged
	 * @private
	 * @param  {event} e Jquery click event
	 */
	p._onFiltersChanged = function(e)
	{
		e.preventDefault();
		var a = $(e.currentTarget);
		if (a.data('toggle-all'))
		{
			this.setFilters(allFilters);
		}
		else
		{
			a.toggleClass('selected');

			var filters = [];
			this.filters.filter('.selected').each(function(){
				filters.push($(this).data('filter'));
			});
			this.setFilters(filters);
		}
	};

	/**
	*  Set the filters to show
	*  @method setFilters
	*  @param {array} filters The collection of string filters to show
	*/
	p.setFilters = function(filters)
	{
		var i;

		// Remove all
		for(i = 0; i < allFilters.length; i++)
		{
			this.output.removeClass('show-' + allFilters[i]);
		}

		// Set based on the input filteres
		for(i = 0; i < filters.length; i++)
		{
			var f = this.filters.filter("[data-filter='" + filters[i] + "']");

			if (f)
			{
				f.addClass('selected');
				this.output.addClass('show-'+filters[i]);
			}
		}
		localStorage.setItem('filters', filters);
	};

	/**
	 * Handler for the theme selection
	 * @method _onThemesChanged
	 * @private
	 * @param  {event} e Jquery click event
	 */
	p._onThemesChanged = function(e)
	{
		e.preventDefault();
		this.setTheme($(e.currentTarget).data('theme'));
	};

	/**
	*  Set the current theme
	*  @method  setTheme
	*  @param {String} theme The theme name, CSS class name
	*/
	p.setTheme = function(theme)
	{
		this.themes.removeClass('selected')
			.filter("[data-theme='" + theme + "']")
			.addClass('selected');

		this.output
			.removeClass(this.theme)
			.addClass(theme);

		this.theme = theme;

		localStorage.setItem('theme', theme);
	};

	/**
	*  Clear the output
	*  @method clear
	*/
	p.clear = function()
	{
		this.output.empty();
		this.groupStack.length = 0;
		this.saveButton.addClass('disabled');
		this.clearButton.addClass('disabled');
	};

	/**
	*  Save the current log
	*  @method save
	*/
	p.save = function()
	{
		// Lets massage the output so it looks better in a log file
		var output = [];
		this.output.clone().children().each(function(){
			var child = $(this);

			// extra line breaks for session
			if (child.hasClass('session'))
			{
				child.append("\n").prepend("\n");
			}
			// Add some character around date
			var date = child.children('.timestamp');
			date.text(" : " + date.text() + " : ");
			output.push(child.text());
		});
		output = output.join("\n");

		if (APP)
		{
			// Browse for file and save output
			Browser.saveAs(
				function(file)
				{
					var fs = require('fs');
					var path = require('path');

					if (!/\.txt$/.test(file))
					{
						file += ".txt";
					}
					localStorage.setItem('workingDir', path.dirname(file));
					fs.writeFileSync(file, output);
				},
				(new Date()).toUTCString() + ".txt",
				localStorage.getItem('workingDir') || undefined
			);
		}
		if (WEB)
		{
			console.log(output);
		}
	};

	/**
	*  Callback when a message is received by the server
	*  @method _onMessage
	*  @private
	*  @param  {String} result The result object to be parsed as JSON
	*/
	p._onMessage = function(result)
	{
		var output = this.output,
			height = output.outerHeight(),
			scrollTop = output.scrollTop(),
			scrollHeight = output[0].scrollHeight,
			atBottom = scrollTop + height >= scrollHeight;

		result = JSON.parse(result);

		var level = (result.level || "GENERAL").toLowerCase(),
			stack = result.stack;
		
		var now = new Date();
		if(result.time)
			now.setTime(result.time);
		now = now.toLocaleString();

		this.saveButton.removeClass('disabled');
		this.clearButton.removeClass('disabled');

		if (level === "session")
		{
			this.logSession(now);
		}
		else if(level == "clear")
		{
			this.clear();
		}
		else if(level == "group" || level == "groupcollapsed")
		{
			var log = this.prepareAndLogMessage(now, result.message, "general", stack),
				groupId = "group_" + this.nextGroupId++;
			var chevron = $("<span class='groupToggle' data-toggle='collapse' data-target='#" + groupId + "'></span>");
			chevron.append(
				$("<span class='glyphicon glyphicon-chevron-right right'></span>"),
				$("<span class='glyphicon glyphicon-chevron-down down'></span>")
			);
			log.prepend(chevron);
			
			var group = $("<div class='group log collapse in' id='" + groupId + "'></div>");
			this.getLogParent().append(group);
			this.groupStack.push(group);
			
			if(level == "groupcollapsed")
			{
				chevron.addClass("collapsed");
				group.collapse("hide");//.removeClass("in");
			}
		}
		else if(level == "groupend")
		{
			this.groupStack.pop();
		}
		else if (Array.isArray(result.message))
		{
			this.prepareAndLogMessage(now, result.message, level, stack);
		}

		if (this.maxLogs)
		{
			this.output.html(this.output.children(".log").slice(-this.maxLogs));
		}

		// Scroll to the bottom of the log display
		if (atBottom)
		{
			this.output.scrollTop(this.output[0].scrollHeight);
		}
	};
	
	p.prepareAndLogMessage = function(now, messages, level, stack)
	{
		if(!messages || !messages.length)
		{
			return this.logMessage(now, [""], level, stack);
		}
		
		var message, j, tokens, token, sub;

		message = messages[0];

		//if the first message is a string, then check it for string formatting tokens
		if (typeof message == "string")
		{
			tokens = message.match(/%[sdifoObxec]/g);

			if (tokens)
			{
				for (j = 0; j < tokens.length; j++)
				{
					token = tokens[j];
					sub = messages[1];

					// CSS substitution check
					if (token == "%c")
					{
						sub = '<span style="'+ sub + '">';
						message += '</span>';
					}
					// Do object substitution
					else if (token == "%o" || token == "%O")
					{
						sub = JSON.stringify(sub, null, "\t");
					}
					else if(token == "%d" || token == "%i")
					{
						sub = parseInt(sub);
					}
					message = message.replace(token, String(sub));
					
					messages.splice(1, 1);
				}
			}
			messages[0] = message;
		}
		return this.logMessage(now, messages, level, stack);
	};

	/**
	 * Log a new message
	 * @method logMessage
	 * @param {String} now The current time name
	 * @param {Array} messages The message to log
	 * @param {String} level The level to use
	 * @param {Array} [stack] The stack trace for the log.
	 */
	p.logMessage = function(now, messages, level, stack)
	{
		var message = "";
		for(var i = 0; i < messages.length; ++i)
		{
			if(i > 0)
				message += " ";
			if (typeof message === "object")
			{
				message += JSON.stringify(messages[i], null, "\t");
			}
			else
				message += messages[i];
		}
		var log = $("<div class='log'></div>")
			.addClass(level)
			.append(
				$("<span class='type'></span>").text(level.toUpperCase()),
				$("<span class='timestamp'></span>").text(now),
				$("<span class='message'></span>").html(message)
			);
		this.getLogParent().append(log);
		return log;
	};
	
	/**
	 * Gets the JQuery element that logs should be added to.
	 * @method getLogParent
	 * @return {jquery} The div to add logs to.
	 */
	p.getLogParent = function()
	{
		if(this.groupStack.length)
			return this.groupStack[this.groupStack.length - 1];
		return this.output;
	};

	/**
	 * Log a new session
	 * @method logSession
	 * @param {String} now The current time name
	 */
	p.logSession = function(now)
	{
		if (this.clearOnNewSession)
		{
			this.clear();
		}
		this.output.append(
			$("<div class='log session'></div>")
				.text("New Session Began at " + now)
		);
	};

	/**
	*  Close the application
	*  @method shutdown
	*/
	p.shutdown = function()
	{
		if (this.server)
		{
			this.server.close();
			this.server = null;
		}
		this.close(true);
	};

	// Create the new Remote trace
	Module.create(RemoteTrace);

}());