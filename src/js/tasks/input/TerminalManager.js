(function(){

	if (APP)
	{
		// Import node modules
		var spawn = require("child_process").spawn;
		var exec = require("child_process").exec;
		var isWin = /^win/.test(process.platform);
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

		if (APP)
		{
			// Get the command based on the platform
			this.command = isWin ? 'grunt.cmd' : 'grunt';
		}

		/**
		*  The list of current processes by project id
		*  @property {dict} tasks
		*/
		this.tasks = {};
	};

	// Reference to the prototype
	var p = TerminalManager.prototype;

	/**
	*  Kill all the workers for all projects
	*  @method killTasks
	*/
	p.killTasks = function()
	{
		_.forEach(this.tasks,
			function(task, name)
			{
				if (task.status == 'running')
				{
					this.killTask(name);
				}
			}.bind(this)
		);
	};

	/**
	*  Run a task
	*  @method runTask
	*  @param {String} name The name of the task
	*  @param {Function} startCb The starting callback function
	*  @param {Function} endCb The ending callback function
	*  @param {Function} errorCb The error callback function
	*/
	p.runTask = function(name, startCb, endCb, errorCb)
	{
		var app = this.app;
		var project = app.projectManager.project;

		startCb();

		var terminal = spawn(
			this.command,
			[name],
			{cwd: project.path}
		);

		var task = this.tasks[name];

		if (_.isUndefined(task))
		{
			task = {
				name: name,
				terminal: terminal,
				status: 'running'
			};
		}
		else
		{
			task.terminal = terminal;
			task.status = 'running';
		}		

		terminal.stdout.setEncoding('utf8');
		terminal.stdout.on(
			'data',
			function(data)
			{
				app.putCliLog(data, name);
			}
		);

		terminal.stderr.on(
			'data',
			function(data)
			{
				app.putCliLog(data, name);
				errorCb();
			}
		);

		terminal.on(
			'close',
			function(code)
			{
				endCb();
				terminal.status = 'stop';
			}
		);
	};

	/**
	*  Stop a task
	*  @method stopTask
	*  @param {String} name The name of the task
	*/
	p.stopTask = function(name)
	{
		var task = this.tasks[name];

		if (!_.isUndefined(task))
		{
			try
			{
				this.killTask(name);
				task.status = "stop";
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
	*  @param {String} name The name of the task
	*/
	p.killTask = function(name)
	{
		if (APP)
		{
			if (isWin)
			{
				var pid = this.tasks[name].terminal.pid;
				exec('taskkill /pid ' + pid + ' /T /F');
			}
			else
			{
				this.tasks[name].terminal.kill();
			}
		}
	};

	// Assign to global space
	namespace('springroll.tasks').TerminalManager = TerminalManager;
	
}());