(function()
{
	// Import classes
	var Module = springroll.Module,
		PreviewContainer = springroll.PreviewContainer,
		Server = springroll.PreviewServer;

	/**
	 *  Preview the current project
	 *  @class Preview
	 *  @extends springroll.Module
	 */
	var Preview = function()
	{
		Module.call(this);

		/**
		 * The web server for project view
		 * @property {springroll.PreviewServer} server
		 */
		this.server = new Server(localStorage.getItem('project'));

		/**
		 * The local location for the iframe
		 * @property {string} location
		 */
		this.location = "http://localhost:" + this.server.port + '/game';

		/**
		 * The current iframe
		 * @property {jquery} iframe
		 */
		this.container = new PreviewContainer();

		$("#browserLink").text("http://" + this.server.address + ":" + this.server.port);
		$("#refreshButton").click(this.refresh.bind(this));
		$("#devToolsButton").click(this.toggleDevTools.bind(this));

		if (APP)
		{
			// Initialize the menu
			this.initMenubar(false, true);
		}
		
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
			this.container.appTitle.text(this.server.title);
			this.container.remoteChannel.val(this.server.title);
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

		if (this.server)
		{
			this.server.destroy(function()
			{
				this.server = null;
				this.close(true);
			}
			.bind(this));
		}
		else
		{
			this.close(true);
		}
	};

	// Create the module
	Module.create(Preview);

}());