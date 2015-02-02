(function($, undefined){

	if (APP)
	{
		var gui = require('nw.gui');
		var fs = require('fs');
		var path = require('path');
	}

	// Import classes
	var NodeWebkitApp = cloudkid.NodeWebkitApp,
		ModuleButton = springroll.ModuleButton,
		Browser = cloudkid.Browser;

	/**
	*  Node Webkit Application
	*  @class SpringRollStudio
	*  @extends cloudkid.NodeWebkitApp
	*/
	var SpringRollStudio = function()
	{
		NodeWebkitApp.call(this, 0.25); // update blocker: 15 minutes

		var modules = this.modules = [];

		/**
		 * The buttons only active when a project is opened
		 * @property {jquery} requiresProject
		 */
		this.requiresProject = $(".requires-project")
			.addClass('disabled');

		if (APP)
		{
			this.menu = new gui.Menu({ type: 'menubar' });

			if (process.platform === "darwin")
			{
				this.menu.createMacBuiltin("SpringRoll Studio", {
					hideEdit: true,
					hideWindow: true
				});
			}

			this.main.on('focus', this.focus.bind(this));
			this.focus();

			// Local cache of instance
			var app = this;

			// Add the modules
			$(".modules a").each(function(){
				modules.push(new ModuleButton(this, app));
			});
		}

		// Bind reference to the open project handler
			var openProject = this.openProject.bind(this);

		/**
		 * Open button
		 * @property {jquery} openButton
		 */
		this.openButton = $("#openButton")
			.click(function(){
				Browser.folder(openProject);
			});

		/**
		 * Close button
		 * @property {jquery} closeButton
		 */
		this.closeButton = $("#closeButton")
			.click(this.closeProject.bind(this));

		// Set the current project state based on the project
		var project = localStorage.getItem('project');
		if (project)
		{
			this.openProject(project);
		}
		else
		{
			this.closeProject();
		}

		// Listen for a new project being created
		$(window).on('storage', function(event){
			if (event.key == 'project' && /new\.html/.test(event.url))
			{
				var project = event.newValue;
				if (project)
				{
					console.log("New project created " + project);
					this.openProject(project);
				}
			}
		});
	};

	// Reference to the prototype
	var p = SpringRollStudio.prototype = Object.create(NodeWebkitApp.prototype);

	/**
	*  Re-add the menu on focus
	*  @method focus
	*  @private
	*/
	p.focus = function()
	{
		this.main.menu = this.menu;
	};

	/**
	 * Open a project file
	 * @method  openProject
	 * @param  {string} project Path to the folder
	 */
	p.openProject = function(project)
	{
		this.requiresProject.removeClass('disabled');

		if (!fs.existsSync(path.join(project, 'springroll.json')))
		{
			alert("Folder is not a valid SpringRoll project");
			return;
		}
		this.closeButton.removeClass('disabled');
		if (localStorage.getItem('project') != project)
		{
			localStorage.setItem('project', project);
			this.closeModules(true);
		}		
	};

	/**
	 * Open a project file
	 * @method  closeProject
	 */
	p.closeProject = function()
	{
		this.requiresProject.addClass('disabled');
		this.closeButton.addClass('disabled');
		localStorage.removeItem('project');
		this.closeModules();
	};

	/**
	 * Close the window
	 * @method closeModules
	 * @param {boolean} [force=false] Force-close the window
	 */
	p.closeModules = function(force)
	{
		for (var i = 0; i < this.modules.length; i++)
		{
			this.modules[i].close(force);
		}
	};

	/**
	 * Close the window
	 * @method  close
	 */
	p.close = function()
	{
	};

	// Create the application
	$(function(){ window.app = new SpringRollStudio(); });

}(jQuery));