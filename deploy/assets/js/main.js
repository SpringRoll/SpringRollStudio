(function(undefined){
	
	/**
	*  Utility to check whether an update is available for the app. For this to work
	*  the package.json must contain a respository.url property and the GitHub account
	*  must uses Semantic Versioning and tagged releases.
	*  @class UpdateChecker
	*  @namespace cloudkid
	*  @constructor
	*  @param {Number} [remindHours=2] Numer of hours until check for another update
	*/
	var UpdateChecker = function(remindHours)
	{
		if (window.$ === undefined)
		{
			throw "jQuery must be included to use cloudkid.UpdateChecker";
		}

		// The number of seconds until we can try another update
		// this remove the nag-factor when opening the app every time
		remindHours = remindHours || 2; 

		// The last time that we checked for updates
		var lastUpdateCheck = localStorage.getItem('lastUpdateCheck') || 0;

		// Check against the last time we updates
		// reminderSec need to be converted to milliseconds to compare to now()
		if (Date.now() - lastUpdateCheck <= remindHours * 1000 * 3600)
		{
			if (true)
			{
				console.log("Ignore update until the blocker has expired");
			}
			return;
		}

		if (true)
		{
			console.log("Checking for updates...");
		}

		/**
		*  The repository URL
		*  @property {string} repository
		*/
		this.repository = null;

		/**
		*  The current tag
		*  @property {string} currentTag
		*/
		this.currentTag = null;

		/**
		*  Add a destroyed check
		*  @property {boolean} _destroyed
		*  @default
		*/
		this._destroyed = false;

		// The name of the package file
		var packagePath = "package.json";
		var self = this;

		// Load the package json file
		$.getJSON(packagePath, function(data){

			if (self._destroyed) return;

			if (!data.repository || data.repository.url.search(/github\.com/) === -1)
			{
				if (true)
				{
					console.debug("No repository set in the package.json or " +
						"repository url not supported (only GitHub), unable " + 
						"to check for updates.");
				}
				return;
			}

			self.currentTag = data.version;
			self.repository = data.repository.url;

			// Format the repository url to get the tags
			var url = data.repository.url
				.replace('http:', 'https:')
				.replace('github.com', 'api.github.com/repos') + "/tags";
				
			// Load the tags json from the github api
			$.getJSON(url, self.onTagsLoaded);
		});

		// Bind functions
		this.onTagsLoaded = this.onTagsLoaded.bind(this);
	};

	// The prototype reference
	var p = UpdateChecker.prototype;

	/**
	*  Handler for loading the releases JSON from the github API
	*  @method onTagsLoaded
	*  @param {array} tags The list of tags
	*/
	p.onTagsLoaded = function(tags)
	{
		if (this._destroyed) return;

		localStorage.setItem('lastUpdateCheck', Date.now());

		if (!tags || !Array.isArray(tags) || tags.length === 0)
		{
			if (true)
			{
				console.debug("No tags found for this project, no update-check.");
			}
			return;
		}

		var semver = require('semver');
		var i, len = tags.length, tag;

		for(i = 0; i < len; i++)
		{
			tag = tags[i];
			if (semver.valid(tag.name) && semver.gt(tag.name, this.currentTag))
			{
				if (confirm("An update is available. Download now?"))
				{
					if (true)
					{
						// Load native UI library.
						var gui = require('nw.gui');

						// Open URL with default browser.
						gui.Shell.openExternal(this.repository + "/releases/latest");
					}
					if (false)
					{
						window.open(this.repository + '/releases/latest');
					}
				}
				return;
			}
		}

		if (true)
		{
			console.log("No updates");
		}
	};

	/**
	*  Don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this._destroyed = true;
	};

	// Assign to window
	namespace('cloudkid').UpdateChecker = UpdateChecker;

}());
(function(window){

	window.cloudkid = window.cloudkid || {};

	/**
	*  A base web kit application
	*  @class NodeWebkitApp
	*  @namespace cloudkid
	*  @constructor
	*  @param {Number} [updaterTime=2] The minimum amount of time before reminding the user they're
	*          is a new update for the application.
	*/
	var NodeWebkitApp = function(updaterTime)
	{
		/**
		*  The optional utility that checks for update
		*  @property {cloudkid.UpdateChecker} updater
		*/
		this.updater = null;

		/**
		*  The file browser which uses a file input form element behind the scenes
		*  the Browser class can also be called statically
		*  @property {cloudkid.Browser} browser
		*/
		this.browser = null;

		/**
		*  Application only, the node-webkit gui module
		*  @property {nw.gui} gui
		*/
		this.gui = null;

		/**
		*  The main node webkit window
		*  @property {Window} main
		*/
		this.main = null;

		if (true)
		{
			var gui = this.gui = require('nw.gui');
			var main = this.main = this.gui.Window.get();

			if (true)
			{
				// Show the development tools
				main.showDevTools();

				// Add a listener for debug function key commands
				window.addEventListener('keydown', this._onKeyDown.bind(this));
			}

			// Listen for when the window close and remember window size
			main.on('close', this._onClose.bind(this));

			// Load the saved window size
			try
			{
				var rect = JSON.parse(localStorage.getItem('windowSettings') || 'null');
				if (rect)
				{
					main.width = rect.width;
					main.height = rect.height;
					main.x = rect.x;
					main.y = rect.y;
				}
			}
			catch(e){}

			// Check for application updates
			if (cloudkid.UpdateChecker)
			{
				this.updater = new cloudkid.UpdateChecker(updaterTime);
			}

			// Initialize the browser utility
			if (cloudkid.Browser)
			{
				this.browser = cloudkid.Browser.init();
			}

			// The application is hidden by default, lets show it
			main.show();
		}

		// Catch any uncaught errors or fatal exceptions
		if (true)
		{
			process.on("uncaughtException", this._handleErrors.bind(this));
		}
		if (false)
		{
			window.onerror = this._handleErrors.bind(this);
		}
	};

	// Reference to the prototype
	var p = NodeWebkitApp.prototype;

	if (true)
	{
		/**
		*  Key handler for the window key down
		*  @method _onKeyDown
		*  @private
		*  @param {event} e The window keyboard event
		*/
		p._onKeyDown = function(e)
		{
			if (e.keyIdentifier === 'F12')
			{
				this.main.showDevTools();
			}
			else if (e.keyIdentifier === 'F5')
			{
				location.reload();
			}
		};
	}

	/**
	*  Handle any fatal or uncaught errors
	*  @method _handleErrors
	*  @method private
	*  @param {error} e The error thrown
	*/
	p._handleErrors = function(e)
	{
		if (false)
		{
			alert(e);
		}
		if (true)
		{
			console.error(e);
		}
	};

	/**
	*  Handler when the main node-webkit window closes
	*  @method _onClose
	*  @method private
	*/
	p._onClose = function()
	{
		var main = this.main;
		var gui = this.gui;

		localStorage.setItem('windowSettings', JSON.stringify({
			width : main.width,
			height : main.height,
			x : main.x,
			y : main.y
		}));
		main.hide();

		if (this.browser)
		{
			this.browser.destroy();
			this.browser = null;
		}

		if (this.updater)
		{
			this.updater.destroy();
			this.updater = null;
		}

		this.close();
		gui.App.closeAllWindows();
		gui.App.quit();
	};

	/**
	*  Called whenever the application closes
	*  @method close
	*/
	p.close = function()
	{
		// Implementation specific
	};

	// Assign to namespace
	namespace('cloudkid').NodeWebkitApp = NodeWebkitApp;

}(window));
(function($, undefined){
	
	if (true)
	{
		var gui = require('nw.gui');
	}

	/**
	*  The module is a sub-section of the app
	*  @class Module
	*  @namespace springroll
	*  @constructor
	*  @param {Element} dom The DOM element link
	*/
	var Module = function(dom)
	{
		/**
		*  The reference to the DOM link
		*  @property {Element} dom
		*/
		this.dom = dom;

		// jquery object
		var link = $(dom).click(this._onOpen.bind(this));

		/**
		*  The default window size
		*  @property {object} defaultSize
		*/
		this.defaultSize = {
			width: link.data('width'),
			height: link.data('height'),
			minWidth: link.data('min-width'),
			minHeight: link.data('min-height')
		};

		/**
		*  The current opened window
		*  @property {nw.gui.Window} win
		*/
		this.win = null;
	};

	// Reference to the prototype
	var p = Module.prototype;

	/**
	*  When the link is clicked to open the window
	*  @method  _onOpen
	*  @private
	*/
	p._onOpen = function(e)
	{
		e.preventDefault();

		// If the window is opened, focus on it
		if (this.win)
		{
			this.win.focus();
			return;
		}

		// Get the size from saved settings or get the default size
		var size = JSON.parse(localStorage.getItem(this.dom.id) || 'null') || this.defaultSize;

		// The node-webkit window options
		var options = {
			title: this.dom.title,
			resizable: true,
			width: size.width,
			height: size.height,
			toolbar: false,
			frame: true,
			fullscreen: false,
			show: false
		};

		// Move the window if we have coordinates
		if (size.x !== undefined && size.y !== undefined)
		{
			options.x = size.x;
			options.y = size.y;
		}
		else
		{
			options.position = "center";
		}

		// The minimum window size
		if (this.defaultSize.minWidth !== undefined)
		{
			options.min_width = this.defaultSize.minWidth;
		}

		// The maximum window size
		if (this.defaultSize.minHeight !== undefined)
		{
			options.min_height = this.defaultSize.minHeight;
		}

		// Open a new window
		this.win = gui.Window.open(this.dom.href, options);

		// Add a listener when the window closes to save the position
		this.win.on('close', this._onClose.bind(this));
		this.win.on('loaded', this._onLoaded.bind(this));
	};

	/**
	*  When the window is finished loading
	*  @method  _onLoaded
	*  @private
	*/
	p._onLoaded = function()
	{
		this.win.show();
		this.win.focus();
	};

	/**
	*  When the module's window is closing
	*  @method _onClose
	*  @private
	*/
	p._onClose = function()
	{
		localStorage.setItem(this.dom.id, JSON.stringify({
			width : this.win.width,
			height : this.win.height,
			x : this.win.x,
			y : this.win.y
		}));
		
		// Close the module contents
		this.win.window.module.close();

		// Close the window
		this.close();
	};

	/**
	*  Close the module's window
	*  @method  close
	*/
	p.close = function()
	{		
		if (this.win)
		{
			this.win.close(true);
			this.win = null;
		}
	};

	// Assign to namespace
	namespace('springroll').Module = Module;

}(jQuery));
(function($, undefined){

	// Import classes
	var NodeWebkitApp = cloudkid.NodeWebkitApp,
		Module = springroll.Module;

	/**
	*  Node Webkit Application
	*  @class SpringRollStudio
	*  @extends cloudkid.NodeWebkitApp
	*/
	var SpringRollStudio = function()
	{
		NodeWebkitApp.call(this);

		var modules = this.modules = [];

		if (true)
		{
			// Create the standard OSX menu
			if (process.platform === "darwin")
			{	
				var gui = require('nw.gui');
				var menu = new gui.Menu({ type: 'menubar' });
				menu.createMacBuiltin("SpringRollStudio");
				gui.Window.get().menu = menu;
			}

			// Add the modules
			$(".modules a").each(function(){
				modules.push(new Module(this));
			});
		}
	};

	// Reference to the prototype
	var p = SpringRollStudio.prototype = Object.create(NodeWebkitApp.prototype);

	/**
	*  Called when the application is quit. Should do any cleanup here to be safe.
	*  @method close
	*/
	p.close = function()
	{
		// close any modules
		for (var i = 0; i < this.modules.length; i++)
		{
			this.modules[i].close();
		}
		this.modules = null;
	};

	// Assign to namespace
	//namespace("springroll").SpringRollStudio = SpringRollStudio;

	// Create the application
	$(function(){ window.app = new SpringRollStudio(); });

}(jQuery));
//# sourceMappingURL=main.js.map