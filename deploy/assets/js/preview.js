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
	*/
	var Module = function()
	{
		/**
		*  The main window
		*  @property {nw.gui.Window} main
		*/
		this.main = null;

		/**
		*  The menubar
		*  @property {nw.gui.Menu} menubar
		*/
		this.menubar = null;

		if (true)
		{
			this.main = gui.Window.get();
			this.main.on('close', this.shutdown.bind(this));

			if (true)
			{
				this.main.showDevTools();
			}
		}		
	};

	/**
	*  Construct the new module on load
	*  @method create
	*  @static
	*  @param {funtion} func The module to create
	*/
	Module.create = function(func)
	{
		$(function(){ window.module = new func(); });
	};

	// Reference to the prototype
	var p = Module.prototype;

	/**
	*  When this module is focused in
	*  @method focus
	*/
	p.focus = function()
	{
		if (true)
		{
			if (this.main && this.menubar)
			{
				this.main.menu = this.menubar;
			}
		}
	};

	/**
	*  Create the menubar
	*  @method  initMenubar
	*  @protected
	*  @param {boolean} [hideEdit=false] Hide the edit menu on OS X
	*  @param {boolean} [hideWindow=false] Hide the window menu on OS X
	*/
	p.initMenubar = function(hideEdit, hideWindow)
	{
		this.menubar = new gui.Menu({ type: 'menubar' });

		// Create the standard OSX menu
		if (process.platform === "darwin")
		{	
			this.menubar.createMacBuiltin("SpringRoll Studio", {
				hideEdit: !!hideEdit,
				hideWindow: !!hideWindow
			});
		}
		this.focus();
		return this.menubar;
	};

	/**
	*  When this window is being closed
	*  @method shutdown
	*  @param {event} e The event to prevent default
	*/
	p.shutdown = function()
	{
		this.close(true);
	};

	/**
	*  Actually force-close close the window
	*  @method close
	*  @param {Boolean} [force=false] To force close
	*/
	p.close = function(force)
	{
		this.main.close(force);
		this.main = null;
		this.menubar = null;
	};

	// Assign to namespace
	namespace('springroll').Module = Module;

}(jQuery));
(function(){
	
	if (true)
	{
		var connect = require('connect');
		var serveStatic = require('serve-static');
		var path = require('path');
	}

	// Import classes
	var Module = springroll.Module;

	/**
	 *  Preview the current project
	 *  @class Preview
	 *  @extends springroll.Module
	 */
	var Preview = function()
	{
		Module.call(this);

		var app = connect();

		var project = localStorage.getItem('project');

		app.use(serveStatic(
			path.join(project, 'deploy'),
			{'index': ['index.html']}
		));

		/**
		 * The web server
		 * @property {Server} server
		 */
		this.server = app.listen(3000);

		/**
		 * The local location for the iframe
		 * @property {string} location
		 */
		this.location = "http://localhost:3000";

		/**
		 * The current iframe
		 * @property {jquery} iframe
		 */
		this.iframe = $("#preview");

		$("#refreshButton").click(this.refresh.bind(this));
		$("#devToolsButton").click(this.toggleDevTools.bind(this));

		// Set the project title
		$("#title").text(path.basename(project));

		this.refresh();
	};

	// Reference to the prototype
	var p = extend(Preview, Module);

	/**
	 * Refresh the window
	 * @method refresh
	 */
	p.refresh = function()
	{
		// Goto the webserver
		this.iframe.prop('src', this.location);
	};

	/**
	 * Open/close the dev tools for the iframe
	 * @method toggleDevTools
	 */
	p.toggleDevTools = function()
	{
		if (this.main.isDevToolsOpen())
		{
			this.main.closeDevTools();
		}
		else
		{
			// Run the dev tools in jailed mode
			// edit the iframe contents only
			this.main.showDevTools(this.iframe[0]);
		}
	};

	/**
	*  Close the application
	*  @method shutdown
	*/
	p.shutdown = function()
	{
		this.iframe = null;

		if (this.server)
		{
			this.server.close();
			this.server = null;
		}
		this.close(true);
	};

	// Create the module
	Module.create(Preview);

}());
//# sourceMappingURL=preview.js.map