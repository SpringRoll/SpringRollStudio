(function($, undefined){

	if (APP)
	{
		var gui = require('nw.gui');
		var fs = require('fs');
		var path = require('path');
	}

	// Import classes
	var NodeWebkitApp = include('cloudkid.NodeWebkitApp'),
		Menu = include('springroll.SpringRollStudioMenu'),
		ModuleButton = include('springroll.ModuleButton'),
		Browser = include('cloudkid.Browser');

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

		/**
		 * The current project name
		 * @property {jquery} projectName
		 */
		this.projectName = $("#projectName");

		/**
		 * The current project name
		 * @property {jquery} project
		 */
		this.project = $("#project");

		if (APP)
		{
			// Create the menu
			this.menu = new Menu(
				this.main,
				this._menuHandler.bind(this)
			);

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

		// Listen for a new project being created
		$(window).on('storage', function(event){
			var origEvent = event.originalEvent;
			if (origEvent.key == 'project' && /new\.html/.test(origEvent.url))
			{
				var project = origEvent.newValue;
				if (project)
				{
					console.log("New project created " + project);
					this.openProject(project);
				}
			}
		}.bind(this));

		// Set the current project state based on the project
		var project = localStorage.getItem('project');
		if (project)
		{
			this.openProject(project, false);
		}
		else
		{
			this.closeProject();
		}
	};

	// Reference to the prototype
	var p = extend(SpringRollStudio, NodeWebkitApp);

	/**
	*  Handle when an item is clicked on in the system menu
	*  @method _menuHandler
	*  @private
	*  @param {nw.gui.MenuItem} item The selected menu item
	*/
	p._menuHandler = function(item)
	{
		var menu = this.menu;
		switch(item)
		{
			case menu.close: 
			{
				this.closeButton.click();
				break;
			}
			case menu.open: 
			{
				this.openButton.click();
				break;
			}
			case menu.new:
			{
				$("#new").click();
				break;
			}
			case menu.captions:
			{
				$("#captions").click();
				break;
			}
			case menu.tasks:
			{
				$("#tasks").click();
				break;
			}
			case menu.preview:
			{
				$("#preview").click();
				break;
			}
			case menu.remote:
			{
				$("#remote").click();
				break;
			}
			case menu.tools: 
			{
				this.main.showDevTools();
				break;
			}
		}
	};

	/**
	*  Re-add the menu on focus
	*  @method focus
	*  @private
	*/
	// p.focus = function()
	// {
	// 	this.main.menu = this.menu.parent;
	// };

	/**
	 * Open a project file
	 * @method  openProject
	 * @param  {string} project Path to the folder
	 * @param {boolean} [alertError=true] If an alert should show on error
	 */
	p.openProject = function(project, alertError)
	{
		alertError = alertError === undefined ? true : !!alertError;
		this.requiresProject.removeClass('disabled');

		if (!fs.existsSync(path.join(project, 'springroll.json')))
		{
			if (alertError) 
				alert("Folder is not a valid SpringRoll project");
			this.closeProject();
			return;
		}
		this.menu.enabled = true;
		this.projectName.text(path.basename(project));
		this.project.removeClass('empty');
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
		this.menu.enabled = false;
		this.projectName.text('');
		this.project.addClass('empty');
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