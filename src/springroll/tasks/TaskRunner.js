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
		*  The projects container
		*  @property {jquery} sidebar
		*/
		this.sidebar = $(".sidebar-list");

		/**
		*  The tasks container
		*  @property {jquery} tasks
		*/
		this.tasks = $(".task-tab");

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

		// Initialize
		this.init();
	};

	// Reference to the prototype
	var p = TaskRunner.prototype = Object.create(Module.prototype);

	/**
	*  Initalize the application, load any shaved projects
	*  @method init
	*/
	p.init = function()
	{
		var self = this,
			manager = this.projectManager;

		if (manager.projects.length > 0)
		{
			var activeId = Settings.activeProject,
				foundActive = false,
				firstId;
			
			_.each(manager.projects, function(project, i, projects){
				manager.add(project.path,
					self.initProject.bind(self),
					self.clearProject,
					function(project)
					{
						if (!firstId)
						{
							firstId = project.id;
						}
						if (project)
						{
							self.addedProject(project);
						}
						lastId = project.id;

						if (activeId && project.id === activeId)
						{
							foundActive = true;
						}
						// Last project, end of the line
						if (i + 1 === projects.length)
						{
							// If the active project isn't found
							// so we'll use the first project in the list
							if (!foundActive)
							{
								activeId = firstId;
							}
							self.switchProject(activeId);
						}
					}
				);
			});
		}
	};

	/**
	*  Add a project to the list of projects
	*  @method addProject
	*  @param {string} dir The directory of the project to load
	*/
	p.addProject = function(dir)
	{
		var self = this;
		this.projectManager.add(dir,
			this.initProject.bind(this),
			function(projectId, message)
			{
				alert(message);
				self.clearProject(projectId);
			},
			function(project)
			{
				self.addedProject(project);
				self.switchProject(project.id);
			}
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
			function()
			{
				var project = self.projectManager.getByPath(projectPath);
				if (!project)
				{
					console.error("No project found matching " + projectPath);
					return;
				}
				self.removeProject(project.id);
				self.addProject(projectPath);
			}
		);
	};

	/**
	*  Add the project header
	*  @method initProject
	*/
	p.initProject = function(project)
	{
		this.clearProject(project.id);
		var html = Utils.getTemplate('project', project);
		$(html).appendTo(this.sidebar);
	};

	/**
	*  Add the project to the interface
	*  @method addedProject
	*  @param {object} project The project properties
	*/
	p.addedProject = function(project)
	{
		$('#project_' + project.id).removeClass('loading');
		$(Utils.getTemplate('tasks', project)).appendTo(this.tasks);
		this.watchProject(project.path);
	};

	/**
	*  Switch view to another project
	*  @method switchProject
	*  @param {String} id The unique project id
	*/
	p.switchProject = function(id)
	{
		$('.sidebar-item_current').removeClass('sidebar-item_current');
		$('#project_' + id).addClass('sidebar-item_current');

		$('.tasks').hide();
		$('#tasks_' + id).show();

		// Save the current project
		Settings.activeProject = id;
	};

	/**
	*  Clear the project from the display
	*  @method clearProject
	*  @param {String} id The unique project id
	*/
	p.clearProject = function(id)
	{
		$('#project_' + id  + ', #tasks_' + id).remove();
	};

	/**
	*  Remove a project
	*  @method removeProject
	*  @param {String} id The unique project id
	*/
	p.removeProject = function(id)
	{
		this.projectManager.remove(id);

		this.clearProject(id);

		if ($('.sidebar-item_current').length === 0 && this.projectManager.projects.length > 0)
		{
			this.switchProject(this.projectManager.projects[0].id);
		}
	};

	/**
	*  Put the commandline log into the terminal window
	*  @method putCliLog
	*  @param {String} data The log data to add
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task
	*/
	p.putCliLog = function(data, project_id, task_name)
	{
		var output = ansi2html(data);
		$('<p>' + output + '</p>').appendTo($('#console_' + project_id + "_" + task_name));
		this.terminalScrollToBottom(project_id, task_name);
	};

	/**
	*  Scroll to the bottom of the console output
	*  @method terminalScrollToBottom
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task
	*/
	p.terminalScrollToBottom = function(project_id, task_name)
	{
		_.throttle(function(){
			$('#console_' + project_id + "_" + task_name).scrollTop(999999999);
		}, 100)();
	};

	/**
	*  Start running a task
	*  @method runTask
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task
	*/
	p.runTask = function(project_id, task_name)
	{
		var id = '#task_item_' + project_id + "_" + task_name;

		this.terminalManager.runTask(
			project_id,
			task_name,
			function()
			{
				//start event
				$(id).addClass('tasks-item_running')
					.removeClass('tasks-item_error');
				$(id + " .tasks-action-item_terminal").show();
				$(id + " .tasks-action-item_stop").show();
				$(id + " .tasks-action-item_run").hide();
			},
			function()
			{
				//end event
				$(id).removeClass('tasks-item_running');
				$(id + " .tasks-action-item_terminal").hide();
				$(id + " .tasks-action-item_stop").hide();
				$(id + " .tasks-action-item_run").show();
			},
			function()
			{
				//error event
				$(id).addClass('tasks-item_error')
					.removeClass('tasks-item_running');
				$(id + " .tasks-action-item_terminal").hide();
				$(id + " .tasks-action-item_stop").hide();
				$(id + " .tasks-action-item_run").show();
			}
		);
	};

	/**
	*  Stop the task
	*  @method stopTask
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task 
	*/
	p.stopTask = function(project_id, task_name)
	{
		this.terminalManager.stopTask(project_id, task_name);
		$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_running');
		$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_error');
		$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_terminal").hide();
		$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_stop").hide();
		$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_run").show();
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
		this.terminalManager.killWorkers();
		this.close(true);
	};

	// Create a new module
	Module.create(TaskRunner);

}(jQuery));