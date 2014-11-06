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
		// override
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
	};

	// Assign to namespace
	namespace('springroll').Module = Module;

}(jQuery));
(function(){

	if (true)
	{
		// Import node modules
		var md5 = require("MD5");
		var fs = require("fs");
	}

	/**
	*  Basic app utilities
	*  @class Utils
	*  @namespace springroll.tasks
	*/
	var Utils = {};

	/** 
	*  The collection of templates for markup
	*  @static
	*  @property {dict} templates
	*  @private
	*/
	Utils.templates = {};

	/**
	*  Get the templates and do the subtitutions
	*  @method getTemplate
	*  @static
	*  @param {string} templateFileName The name of the template
	*  @param {object} obj The object to template
	*  @return {string} The templated string
	*/
	Utils.getTemplate = function(templateFileName, obj)
	{
		if (!Utils.templates[templateFileName])
		{
			var template = fs.readFileSync(
				"assets/templates/" + templateFileName + ".html",
				{encoding: "utf-8"}
			);

			Utils.templates[templateFileName] = template;
			return _.template(template)(obj);
		}
		else
		{
			return _.template(Utils.templates[templateFileName])(obj);
		}
	};

	/**
	*  Get a unique id hash for a string
	*  @method uid
	*  @static
	*  @param {string} str The string to hash
	*  @return {string} The hashed string
	*/
	Utils.uid = function(str)
	{
		return md5((new Date().toISOString() + str)
			.toLowerCase()
			.replace(/\\/gi, '/'))
			.substr(8, 8);
	};

	// Assign to the global space
	namespace('springroll.tasks').Utils = Utils;

}());
(function(){

	/**
	*  For storing and retrieving data
	*  @class Settings
	*  @namespace springroll.tasks
	*/
	var Settings = {};

	/**
	*  Get the current active project
	*  @property {String} activeProject
	*  @static
	*/
	Object.defineProperty(Settings, "activeProject", {
		get : function()
		{
			return localStorage.TasksDataActive || null;
		},
		set : function(projectId)
		{
			localStorage.TasksDataActive = projectId;
		}
	});

	/**
	*  If the sidebar is collapsed or not
	*  @property {Boolean} collapsedSidebar
	*  @static
	*/
	Object.defineProperty(Settings, "collapsedSidebar", {
		get : function()
		{
			return JSON.parse(localStorage.TasksDataSidebar || "false");
		},
		set : function(collapsed)
		{
			localStorage.TasksDataSidebar = JSON.stringify(collapsed);
		}
	});

	/**
	*  Save the collection of projects
	*  @method setProjects
	*  @static
	*  @param {Array} project The projects to set
	*/
	Settings.setProjects = function(projects)
	{
		localStorage.TasksData = JSON.stringify(projects);
	};

	/**
	*  Get the projects
	*  @method getProjects
	*  @static
	*  @return {Array} The collection of projects
	*/
	Settings.getProjects = function()
	{
		var projects;
		try
		{
			projects = JSON.parse(localStorage.TasksData || '[]');
		}
		catch(e)
		{
			alert('Error Reading Tasks! Reverting to defaults.');
		}
		return projects || [];
	};

	/**
	*  Save the window settings
	*  @method saveWindow
	*  @static
	*  @param {String} alias The alias for the window
	*  @param {Window} win Node webkit window object
	*  @param {Boolean} [isTerminal=false] If we're setting the terminal window 
	*/
	Settings.saveWindow = function(alias, win)
	{
		localStorage[alias] = JSON.stringify({
			width : win.width,
			height : win.height,
			x : win.x,
			y : win.y
		});
	};

	/**
	*  Load the window to the saved size
	*  @method loadWIndow
	*  @static
	*  @param {String} alias The alias for the window
	*  @param {Window} win The GUI window object
	*/
	Settings.loadWindow = function(alias, win)
	{
		var rect;
		try
		{
			rect = JSON.parse(localStorage[alias] || 'null');
		}
		catch(e)
		{
			alert('Error Reading Spock Window! Reverting to defaults.');
		}
		if (rect)
		{
			win.width = rect.width;
			win.height = rect.height;
			win.x = rect.x;
			win.y = rect.y;
		}
	};

	// Assign to global space
	namespace('springroll.tasks').Settings = Settings;
	
})();
(function(){

	if (true)
	{
		// Import modules
		var gui = require('nw.gui');
	}

	// Import classes
	var Settings = springroll.tasks.Settings;

	/**
	*  The Terminal Window manages the output of a task into it's own console window
	*  @class TerminalWindow
	*  @namespace springroll.tasks
	*  @constructor
	*  @param {String} projectId The unqiue project id
	*  @param {String} taskName The task name
	*/
	var TerminalWindow = function(projectId, taskName)
	{
		/**
		*  The unique project id
		*  @property {String} projectId
		*/
		this.projectId = projectId;

		/**
		*  The name of the task
		*  @property {String} taskName
		*/
		this.taskName = taskName;

		/**
		*  The jQuery node for the task output
		*  @property {jquery} output
		*/
		this.output = null;

		/**
		*  The DOM element on the output window
		*  @property {DOM} terminal
		*/
		this.terminal = null;

		/**
		*  Reference to the nodejs window
		*  @property {nw.gui.Window} main
		*/
		this.main = null;

		/**
		*  The observer to watch changes in the output
		*  @property {MutationObserver} observer
		*/
		this.observer = null;

		// create the new window
		this.create();
	};

	// Reference to the prototype
	var p = TerminalWindow.prototype = {};

	/** 
	*  The window reference
	*  @property {String} WINDOW_ALIAS
	*  @private
	*  @static
	*/
	var WINDOW_ALIAS = 'TasksTerminalWindow';

	/**
	*  Open the dialog
	*  @method create
	*/
	p.create = function()
	{
		// Open the new window
		this.main = gui.Window.get(
			window.open('tasks-terminal.html'), {
				show : false
			}
		);
		this.main.on('close', this.close.bind(this));
		this.main.on('loaded', this.onLoaded.bind(this));
	};

	/**
	*  Open after the DOM is loaded on the new window
	*  @method onLoaded
	*/
	p.onLoaded = function()
	{
		Settings.loadWindow(WINDOW_ALIAS, this.main);

		// Get the dom output
		this.terminal = this.main.window.document.getElementById('terminal');

		// Setup the observer
		this.observer = new MutationObserver(this.onUpdate.bind(this));

		// Open the constructor task
		this.open(this.projectId, this.taskName);
	};

	/**
	*  Everytime the output is updated
	*  @method onUpdate
	*  @private
	*/
	p.onUpdate = function()
	{
		this.terminal.innerHTML = this.output.innerHTML;

		// Scroll to the bottom of the output window
		this.terminal.scrollTop = this.terminal.scrollHeight;
	};

	/**
	*  New
	*  @method open
	*  @param {String} projectId The unqiue project id
	*  @param {String} taskName The task name
	*/
	p.open = function(projectId, taskName)
	{
		if (this.observer)
		{
			this.observer.disconnect();
		}
		this.terminal.innerHTML = "";

		this.projectId = projectId;
		this.taskName = taskName;
		this.output = document.getElementById('console_' + projectId + "_" + taskName);
		
		// Update the title
		this.main.title = this.taskName;

		// define what element should be observed by the observer
		// and what types of mutations trigger the callback
		this.observer.observe(this.output, {
			attributes: true,
			childList: true,
			characterData: true
		});
		this.onUpdate();

		// Reveal the window
		this.main.show();
		this.main.focus();
	};

	/**
	*  Close the window
	*  @method close
	*  @private
	*/
	p.close = function()
	{
		if (this.observer)
		{
			this.observer.disconnect();
		}
		this.output = null;
		this.terminal.innerHTML = "";
		Settings.saveWindow(WINDOW_ALIAS, this.main);
		this.main.hide();
	};

	/**
	*  Destroy and don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.close();
		this.observer = null;
		this.terminal = null;
		this.main.close(true);
		this.main = null;
	};

	// Assign to global space
	namespace('springroll.tasks').TerminalWindow = TerminalWindow;

}());
(function(){

	if (true)
	{
		// Global node modules
		var fs = require('fs');
		var path = require("path");
	}

	// Import classes
	var TerminalWindow = springroll.tasks.TerminalWindow,
		Settings = springroll.tasks.Settings;
	
	/**
	*  The main interface class
	*  @class Interface
	*  @namespace springroll.tasks
	*  @constructor
	*  @param {springroll.tasks.TaskRunner} app The instance of the app
	*/
	var Interface = function(app)
	{
		var body = $('body').on(
			'click',
			'.JS-Sidebar-Item',
			function()
			{
				app.switchProject($(this).data('id').toString());
				return false;
			}
		)
		.on(
			'click',
			'.JS-Project-Remove',
			function()
			{
				app.removeProject($(this).data('id').toString());
				return false;
			}
		)
		.on(
			'dblclick',
			'.JS-Task-Toggle-Info',
			function()
			{
				var button = $(this).find('.JS-Task-Run');
				app.toggleTask(
					button.data('project-id').toString(),
					button.data('task-name').toString()
				);
				return false;
			}
		)
		.on(
			'click',
			'.JS-Task-Run',
			function()
			{
				var button = $(this);
				app.toggleTask(
					button.data('project-id').toString(), 
					button.data('task-name').toString()
				);
				return false;
			}
		)
		.on(
			'click',
			'.JS-Task-Terminal',
			function(e)
			{
				var button = $(this);
				var projectId = button.data('project-id').toString();
				var taskName = button.data('task-name').toString();

				if (!app.terminal)
				{
					app.terminal = new TerminalWindow(projectId, taskName);
				}
				else
				{
					app.terminal.open(projectId, taskName);
				}
				return false;
			}
		)
		.on(
			'click',
			'.JS-Task-Stop',
			function()
			{
				var button = $(this);
				app.toggleTask(
					button.data('project-id').toString(), 
					button.data('task-name').toString()
				);
				return false;
			}
		);

		$('.sidebar-toggle').click(
			function()
			{
				collapsed = body
					.toggleClass(SIDEBAR_CLASS)
					.hasClass(SIDEBAR_CLASS);

				Settings.collapsedSidebar = collapsed;
			}
		);

		if (Settings.collapsedSidebar)
		{
			body.addClass(SIDEBAR_CLASS);
		}

		// Enable sortable list
		$('.sidebar-list').sortable().on('sortupdate', function(){
			var ids = [];
			$(".sidebar-item").each(
				function()
				{
					ids.push($(this).data('id').toString());
				}
			);
			app.projectManager.reorder(ids);
		});

		$(document).on(
			'dragover',
			function handleDragOver(event)
			{
				event.stopPropagation();
				event.preventDefault();
			}
		)
		.on(
			'drop',
			function handleDrop(event)
			{
				event.stopPropagation();
				event.preventDefault();

				var files = event.originalEvent.dataTransfer.files;

				_.each(files, function(file){

					var stats = fs.statSync(file.path);

					if (stats.isDirectory() && path.dirname(file.path) !== file.path)
					{
						app.addProject(file.path);
					}
					else if (stats.isFile() && path.dirname(path.dirname(file.path)) !== path.dirname(file.path))
					{
						app.addProject(path.dirname(file.path));
					}
				});
				return false;
			}
		);
	};

	/**
	*  The class for the sidebar collapsed
	*  @property {String} SIDEBAR_CLASS
	*  @static
	*  @private
	*/
	var SIDEBAR_CLASS = 'collapsed-sidebar';

	// Assign to namespace
	namespace('springroll.tasks').Interface = Interface;

}());
(function(){

	if (true)
	{
		var exec = require('child_process').exec;
		var path = require('path');
		var fs = require('fs');
	}

	// Import classes
	var Utils = springroll.tasks.Utils,
		Settings = springroll.tasks.Settings;

	/**
	*  Add projects to the interface
	*  @class ProjectManager
	*  @namespace springroll.tasks
	*  @constructor
	*  @param {springroll.tasks.TaskRunner} app The instance of the app
	*/
	var ProjectManager = function(app)
	{
		/**
		*  Reference to the application
		*  @property {springroll.tasks.TaskRunner}
		*/
		this.app = app;

		/**
		*  The collection of currently loaded projects
		*  @property {Array} projects
		*/
		this.projects = Settings.getProjects();
	};

	// The reference to the prototype
	var p = ProjectManager.prototype = {};

	/**
	*  Add a project to the interface
	*  @method add
	*  @param {String} dir The directory of project file
	*  @param {function} init The intialized callback
	*  @param {function} failed The fail callback
	*  @param {function} success The callback when added
	*/
	p.add = function(dir, init, failed, success)
	{
		var self = this,
			project;
			
		_.each(this.projects, function(p){
			if (!path.relative(p.path, dir))
			{
				project = p;
				project.exists = true;
			}
		});

		// Create a new project
		if (!project)
		{
			var name = path.basename(dir);
			project = {
				id: Utils.uid(name),
				name: name,
				path: dir,
				tasks: null,
				exists: false
			};
		}

		// We have a new project
		init(project);

		// Check for grunt within project
		if (!fs.existsSync(path.join(project.path, 'node_modules')))
		{
			exec('npm install',
				{ cwd : project.path },
				function(error, stdout, stderr)
				{
					if (error)
					{
						failed(project.id, 'npm install error: ' + error);
					}
					else
					{
						self.proceed(project, failed, success);
					}
				}
			);
		}
		else
		{
			self.proceed(project, failed, success);
		}
	};

	/**
	*  Proceed with the add
	*  @method proceed
	*  @private
	*  @param {Object} project
	*  @param {function} failed
	*  @param {function} success
	*/
	p.proceed = function(project, failed, success)
	{
		var self = this;

		// Check for grunt within project
		if (!fs.existsSync(path.join(project.path, 'node_modules/grunt')))
		{
			failed(project.id, 'Unable to find local grunt.');
			return;
		}

		// Check for grunt file
		if (!fs.existsSync(path.join(project.path, 'Gruntfile.js')))
		{
			failed(project.id, 'Unable to find Gruntfile.js.');
			return;
		}

		var tasksFromHelp = function()
		{
			exec('grunt -h',
				{ cwd : project.path },
				function (error, stdout, stderr)
				{
					if (error)
					{
						failed(project.id, 'exec error: ' + error);
						return;
					}

					var marker = /Available tasks/,
						endMarker = /\n\nTasks run in the order specified/,
						index = stdout.search(marker),
						endIndex = stdout.search(endMarker);

					if (index === -1)
					{
						failed(project.id, "There was a problem fetching tasks");
						return;
					}

					var tasks = [],
						lines = stdout.substring(index, endIndex).split("\n"),
						lineWithTask = /^\s*[a-zA-Z0-9\-]+\s{2}.*\s*$/, // Check for lines with the task name						
						builtInTask = /\*\s*$/, // Reg exp to check for build in tasks, with an *
						div = null; // The dividing position of task table

					// Remove the first line that says "Available tasks"
					lines.shift();

					// Loop through each line
					_.each(lines, function(line, i){

						// Ignore the tasks with a * at the end or if it's the description
						// from the previous line
						if (builtInTask.test(line) || !lineWithTask.test(line))
						{
							return;
						}

						// Split on the first double space
						if (!div)
						{
							var match = line.match(/^\s*[a-zA-Z0-9\-]+\s{2}/);
							div = match[0].length;
						}

						// Get the name and task description
						var name = line.substr(0, div).trim();
						var task = line.substr(div).trim();
						
						// Check for descriptions on the next line
						var next = i + 1;
						while(lines[next] && !lineWithTask.test(lines[next]))
						{
							task += " " + lines[next].trim();
							next++;
						}

						// Add to the list of tasks
						tasks.push({
							name: name,
							info: task.replace(/&/g, '&amp;')
								.replace(/'/g, '&apos;')
								.replace(/"/g, '&quot;')
								.replace(/</g, '&lt;')
								.replace(/>/g, '&gt;')
						});
					});

					self.addTasks(project, tasks);
					success(project);
				}
			);
		};

		exec('grunt _spock_usertasks',
			{ cwd : project.path },
			function(error, stdout, strderr)
			{
				//console.log("_spock_usertasks callback");
				//try { var a = {}; a.debug(); } catch(ex) {console.log(ex.stack);}
				if (error)
				{
					// Try to get tasks from the help
					tasksFromHelp();
					return;
				}
				var tasksContent = stdout.split("\n");

				var tasks;
				try
				{
					tasks = JSON.parse(tasksContent[1]);
				}
				catch(e)
				{
					console.error(e);
					tasks = [];
				}
				self.addTasks(project, tasks);
				success(project);
			}
		);
	};

	p.addTasks = function(project, tasks)
	{
		// Add the tasks
		project.tasks = tasks || [];

		var exists = project.exists;
		delete project.exists;

		//console.log("project exists: " + exists);

		// If we don't exist yet, add to the 
		// collection of opened projects
		if (!exists)
		{
			this.projects.push(project);
			Settings.setProjects(this.projects);
		}
		if (true)
		{
			console.log(project);
		}
	};

	/**
	*  Reorder the project
	*  @method reorder
	*  @param {Array} ids The new collection of ids
	*/
	p.reorder = function(ids)
	{
		var projects = [];
		for (var i = 0; i < ids.length; i++)
		{
			projects.push(this.getById(ids[i]));
		}
		this.projects = projects;
		Settings.setProjects(this.projects);
	};

	/**
	*  Remove a project from the interface
	*  @method remove
	*  @param {string} id The unique project id
	*/
	p.remove = function(id)
	{
		// Removing from the list of projects
		this.projects = _.reject(
			this.projects,
			function(project)
			{
				return project.id === id;
			}
		);

		// Update projects
		Settings.setProjects(this.projects);

		// Kill all project related tasks
		this.app.terminalManager.killProjectWorkers(id);
	};

	/**
	*  Get a project by id
	*  @method getById
	*  @param {string} id The unique project id
	*  @return {object} The project
	*/
	p.getById = function(id)
	{
		return _.find(
			this.app.projectManager.projects,
			function(project)
			{
				return project.id === id;
			}
		);
	};

	/**
	*  Get a project by id
	*  @method getById
	*  @param {string} path The unique project path
	*  @return {object} The project
	*/
	p.getByPath = function(path)
	{
		return _.find(
			this.app.projectManager.projects,
			function(project)
			{
				return project.path === path;
			}
		);
	};

	// Assign to the global space
	namespace('springroll.tasks').ProjectManager = ProjectManager;

})();
(function(){

	if (true)
	{
		// Import node modules
		var spawn = require("child_process").spawn;
		var exec = require("child_process").exec;
	}
	
	/**
	*  Manage the terminal window
	*  @class TerminalManager
	*  @namespace springroll.tasks
	*  @constructor
	*  @param {springroll.tasks.TaskRunner} app The instance of the app
	*/
	var TerminalManager = function(app)
	{
		/**
		*  Reference to the application
		*  @property {springroll.tasks.TaskRunner}
		*/
		this.app = app;

		/**
		*  The command to use based on the platform, either grunt.cmd or grunt
		*  @property {String} command
		*/
		this.command = null;

		if (true)
		{
			// Get the command based on the platform
			this.command = (process.platform === 'win32') ? 'grunt.cmd' : 'grunt';
		}

		/**
		*  The list of current processes by project id
		*  @property {dict} processList
		*/
		this.processList = {};
	};

	// Reference to the prototype
	var p = TerminalManager.prototype;

	/**
	*  Kill all the workers for all projects
	*  @method killWorkers
	*/
	p.killWorkers = function()
	{
		var self = this;
		_.forEach(self.processList,
			function(project, project_id)
			{
				self.killProjectWorkers(project_id);
			}
		);
	};


	/**
	*  Kill the project workers
	*  @method killProjectWorkers
	*  @param {String} project_id The unqiue project id
	*/
	p.killProjectWorkers = function(project_id)
	{
		var self = this;

		var project = this.processList[project_id];

		if (!project)
		{
			return;
		}

		_.forEach(project,
			function(task, task_name)
			{
				if (task.status === "running")
				{
					self.killTask(project_id, task_name);
				}
			}
		);
	};


	/**
	*  Run a task
	*  @method runTask
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task
	*  @param {Function} startCb The starting callback function
	*  @param {Function} endCb The ending callback function
	*  @param {Function} errorCb The error callback function
	*/
	p.runTask = function(project_id, task_name, startCb, endCb, errorCb)
	{
		var project = this.app.projectManager.getById(project_id);

		startCb();

		var terminal = spawn(this.command, [task_name], {cwd: project.path});

		if (_.isUndefined(this.processList[project_id]))
		{
			this.processList[project_id] = {};
		}

		this.processList[project_id][task_name] = {
			name: task_name,
			terminal: terminal,
			status: 'running'
		};

		var app = this.app;
		terminal.stdout.setEncoding('utf8');
		terminal.stdout.on(
			'data',
			function(data)
			{
				app.putCliLog(data, project_id, task_name);
			}
		);

		terminal.stderr.on(
			'data',
			function(data)
			{
				app.putCliLog(data, project_id, task_name);
				errorCb();
			}
		);

		terminal.on(
			'close',
			function(code)
			{
				endCb();
				//console.log('child process exited with code ', code);
				terminal.status = "stop";
			}
		);
	};

	/**
	*  Stop a task
	*  @method stopTask
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task
	*/
	p.stopTask = function(project_id, task_name)
	{
		if (!_.isUndefined(this.processList[project_id]))
		{
			try
			{
				this.killTask(project_id, task_name);
				var pid = this.processList[project_id][task_name].status = "stop";
			}
			catch(e)
			{
				alert("process end error!");
			}
		}
	};

	/**
	*  Kill a task
	*  @method killTask
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task
	*/
	p.killTask = function(project_id, task_name)
	{
		if (true)
		{
			if (process.platform === 'win32')
			{
				var pid = this.processList[project_id][task_name].terminal.pid;
				exec('taskkill /pid ' + pid + ' /T /F');
			}
			else
			{
				this.processList[project_id][task_name].terminal.kill();
			}
		}
	};

	// Assign to global space
	namespace('springroll.tasks').TerminalManager = TerminalManager;
	
}());
(function($){

	if (true)
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
		$('.sidebar-item-current').removeClass('sidebar-item-current');
		$('#project_' + id).addClass('sidebar-item-current');

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

		if ($('.sidebar-item-current').length === 0 && this.projectManager.projects.length > 0)
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
	*  Start running or stop running a task
	*  @method toggleTask
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task
	*/
	p.toggleTask = function(project_id, task_name)
	{
		var item = $('#task_item_' + project_id + "_" + task_name);

		if (item.hasClass('running'))
		{
			this.terminalManager.stopTask(project_id, task_name);
			item.removeClass('running error');
		}
		else
		{
			this.terminalManager.runTask(
				project_id,
				task_name,
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
		this.terminalManager.killWorkers();
		this.close(true);
	};

	// Create a new module
	Module.create(TaskRunner);

}(jQuery));
//# sourceMappingURL=tasks.js.map