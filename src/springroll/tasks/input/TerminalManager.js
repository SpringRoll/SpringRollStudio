(function(){

	// Import node modules
	var spawn = require("child_process").spawn;
	var exec = require("child_process").exec;
	
	/**
	*  Manage the terminal window
	*  @class TerminalManager
	*  @namespace springroll.tasks
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
		this.command = (process.platform === 'win32') ? 'grunt.cmd' : 'grunt';

		/**
		*  The list of current processes by project id
		*  @property {dict} process_list
		*/
		this.process_list = {};
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
		_.forEach(self.process_list,
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

		var project = this.process_list[project_id];

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

		if (_.isUndefined(this.process_list[project_id]))
		{
			this.process_list[project_id] = {};
		}

		this.process_list[project_id][task_name] = {
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
		if (!_.isUndefined(this.process_list[project_id]))
		{
			try
			{
				this.killTask(project_id, task_name);
				var pid = this.process_list[project_id][task_name].status = "stop";
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
		if (process.platform === 'win32')
		{
			var pid = this.process_list[project_id][task_name].terminal.pid;
			exec('taskkill /pid ' + pid + ' /T /F');
		}
		else
		{
			this.process_list[project_id][task_name].terminal.kill();
		}
	};

	// Assign to global space
	namespace('springroll.tasks').TerminalManager = TerminalManager;
	
}());