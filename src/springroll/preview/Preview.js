(function(){
	
	if (APP)
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