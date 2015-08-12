(function(){
	
	if (APP)
	{
		var connect = require('connect');
		var serveStatic = require('serve-static');
		var path = require('path');
	}

	// Import classes
	var Module = springroll.Module,
		PreviewContainer = springroll.PreviewContainer;

	// The local port to use for the preview server
	var SERVER_PORT = 3030;

	/**
	 *  Preview the current project
	 *  @class Preview
	 *  @extends springroll.Module
	 */
	var Preview = function()
	{
		Module.call(this);

		/**
		 * The web server
		 * @property {Server} server
		 */
		this.server = null;

		/**
		 * The local location for the iframe
		 * @property {string} location
		 */
		this.location = "http://localhost:" + SERVER_PORT;

		/**
		 * The current iframe
		 * @property {jquery} iframe
		 */
		this.container = new PreviewContainer();

		// Grab the opened project
		this.project = localStorage.getItem('project');

		$("#refreshButton").click(this.refresh.bind(this));
		$("#devToolsButton").click(this.toggleDevTools.bind(this));
		
		// Disable the form submitting
		$('form').submit(function(e)
		{
			return false;
		});

		if (APP)
		{
			var app = connect();
			this.server = app.listen(SERVER_PORT);
			app.use(serveStatic(
				path.join(this.project, 'deploy'),
				{'index': ['index.html']}
			));

			// Initialize the menu
			this.initMenubar(false, true);
		}

		// When the app closes re-open it
		this.open();
	};

	// Reference to the prototype
	var p = extend(Preview, Module);

	/**
	 * Refresh the window
	 * @method refresh
	 */
	p.refresh = function()
	{
		this.container.close();
	};

	/**
	 * Open the project's deploy folder
	 * @method  open
	 */
	p.open = function()
	{
		if (APP)
		{
			// Set the project title and 
			this.container.appTitle.text(path.basename(this.project));
			this.container.remoteChannel.val(path.basename(this.project));
			this.container.connectLoggingService();
		}

		this.container.open(this.location);
		this.container.once('closed', this.open.bind(this));
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
			this.main.showDevTools(this.container.dom);
		}
	};

	/**
	*  Close the application
	*  @method shutdown
	*/
	p.shutdown = function()
	{
		this.container = null;
		this.project = null;

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