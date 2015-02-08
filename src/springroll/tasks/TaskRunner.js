(function($){

	if (APP)
	{
		// Import node modules
		var ansi2html = require('ansi2html');
		var watch = require('node-watch');
		var path = require('path');
	}

	var Module = springroll.Module,
		Settings = springroll.tasks.Settings,
		ProjectManager = springroll.tasks.ProjectManager,
		TerminalWindow = springroll.tasks.TerminalWindow,
		Interface = springroll.tasks.Interface,
		Utils = springroll.tasks.Utils,
		TerminalManager = springroll.tasks.TerminalManager;

	/**
	*  The main application
	*  @class TaskRunner
	*  @extends springroll.Module
	*  @namespace springroll.tasks
	*/
	var TaskRunner = function()
	{
		Module.call(this);

		/**
		*  The tasks container
		*  @property {jquery} tasks
		*/
		this.tasks = $("#tasks");

		/**
		*  The project manager
		*  @property {springroll.tasks.ProjectManager} projectManager
		*/
		this.projectManager = new ProjectManager(this);

		/**
		*  The console output manager
		*  @property {springroll.tasks.TerminalManager} terminalManager
		*/
		this.terminalManager = new TerminalManager(this);

		/**
		*  The interface instance
		*  @property {springroll.tasks.Interface} ui
		*/
		this.ui = new Interface(this);

		/**
		*  The opened terminal window
		*  @property {springroll.tasks.TerminalWindow} terminal  
		*/
		this.terminal = null;

		if (APP)
		{
			// Create the menu
			this.initMenubar(true, true);
		}

		// Load the project
		var project = localStorage.getItem('project');
		if (!project)
		{
			throw "Not a valid project: " + project;
		}
		this.addProject(project);
	};

	// Reference to the prototype
	var p = extend(TaskRunner, Module);

	/**
	*  Add a project to the list of projects
	*  @method addProject
	*  @param {string} projectPath The directory of the project to load
	*/
	p.addProject = function(projectPath)
	{
		this.projectManager.add(
			projectPath,
			this.addedProject.bind(this)
		);
	};

	/**
	*  Check to see if a file changed
	*  @method watchProject
	*  @param {string} projectPath The project path to watch
	*/
	p.watchProject = function(projectPath)
	{
		var self = this;
		watch(
			path.join(projectPath, "Gruntfile.js"),
			this.refreshTasks.bind(this)
		);
	};

	/**
	 * Refresh the project tasks
	 * @method  refreshTasks
	 */
	p.refreshTasks = function()
	{		
		// Stop any running tasks
		this.terminalManager.killTasks();
		this.terminalManager.tasks = {};

		// Clear the project
		this.projectManager.project = null;

		// Reload
		this.addProject(localStorage.getItem('project'));
	};

	/**
	*  Add the project to the interface
	*  @method addedProject
	*  @param {object} project The project properties
	*/
	p.addedProject = function(project)
	{
		$(Utils.getTemplate('tasks', project))
			.appendTo(this.tasks);

		this.watchProject(project.path);
	};

	/**
	*  Put the commandline log into the terminal window
	*  @method putCliLog
	*  @param {String} data The log data to add
	*  @param {String} taskName The name of the task
	*/
	p.putCliLog = function(data, taskName)
	{
		var output = ansi2html(data);
		$('<p>' + output + '</p>').appendTo($('#console_' + taskName));
		this.terminalScrollToBottom(taskName);
	};

	/**
	*  Scroll to the bottom of the console output
	*  @method terminalScrollToBottom
	*  @param {String} taskName The name of the task
	*/
	p.terminalScrollToBottom = function(taskName)
	{
		_.throttle(function(){
			$('#console_' + taskName).scrollTop(999999999);
		}, 100)();
	};

	/**
	*  Start running or stop running a task
	*  @method toggleTask
	*  @param {String} taskName The name of the task
	*/
	p.toggleTask = function(taskName)
	{
		var item = $('#task_item_' + taskName);

		if (item.hasClass('running'))
		{
			this.terminalManager.stopTask(taskName);
			item.removeClass('running error');
		}
		else
		{
			this.terminalManager.runTask(
				taskName,
				function()
				{
					//start event
					item.addClass('running')
						.removeClass('error');
				},
				function()
				{
					//end event
					item.removeClass('running');
				},
				function()
				{
					//error event
					item.addClass('error')
						.removeClass('running');
				}
			);
		}
	};

	/**
	*  Shutdown the 
	*  @method shutdown
	*/
	p.shutdown = function()
	{
		if (this.terminal)
		{
			this.terminal.destroy();
		}
		this.terminalManager.killTasks();
		this.close(true);
	};

	// Create a new module
	Module.create(TaskRunner);

}(jQuery));