(function(){

	if (APP)
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
		*  @property {Array} project
		*/
		this.project = null;

		/**
		 * The path to the grunt executable
		 * @property {string} gruntBin
		 */
		this.gruntBin = path.resolve('.','node_modules','grunt-cli','bin','grunt');

		/**
		 * The path to the npm executable
		 * @property {string} npmBin
		 */
		this.npmBin = path.resolve('.','node_modules','npm','bin','npm-cli.js');

		/**
		 * The body dom
		 * @property {jquery} body
		 */
		this.body = $(document.body);

		/**
		 * The dom for failed message display
		 * @property {jquery} failedMessage
		 */
		this.failedMessage = $('#failedMessage');
	};

	// The reference to the prototype
	var p = ProjectManager.prototype = {};

	/**
	*  Add a project to the interface
	*  @method add
	*  @param {String} dir The directory of project file
	*  @param {function} success The callback when added
	*/
	p.add = function(dir, success)
	{
		// Reset the classes
		this.body.removeClass('installing failed loading');

		var self = this, project;
		var name = path.basename(dir);
		this.project = project = {
			name: name,
			path: dir,
			tasks: []
		};

		// Check for grunt within project
		if (!fs.existsSync(path.join(project.path, 'node_modules')))
		{
			this.body.addClass('installing');
			exec('node ' + self.npmBin + ' install',
				{ cwd : project.path },
				function(error, stdout, stderr)
				{
					if (error)
					{
						this.failed('Install Error: ' + error);
					}
					else
					{
						this.body.removeClass('installing');
						this.proceed(success);
					}
				}.bind(this)
			);
		}
		else
		{
			this.proceed(success);
		}
	};

	/**
	 * The tasks loading or installing failed
	 * @method failed
	 * @param {string} msg The failed message
	 */
	p.failed = function(msg)
	{
		this.body.removeClass('loading installing')
			.addClass('failed');

		this.failedMessage.text(msg);
	};

	/**
	*  Proceed with the add
	*  @method proceed
	*  @private
	*  @param {Object} project
	*  @param {function} success
	*/
	p.proceed = function(success)
	{
		this.body.addClass('loading');
		
		var self = this;
		var project = this.project;
		var gruntPath = path.join(project.path, 'node_modules', 'grunt');
		var gruntFile = path.join(project.path, 'Gruntfile.js');

		// Check for grunt within project
		if (!fs.existsSync(gruntPath))
		{
			this.failed('Unable to find local grunt.');
			return;
		}

		// Check for grunt file
		if (!fs.existsSync(gruntFile))
		{
			this.failed('Unable to find Gruntfile.js.');
			return;
		}

		var tasksFromHelp = function()
		{
			exec('node ' + self.gruntBin + ' -h',
				{ cwd : project.path },
				function (error, stdout, stderr)
				{
					if (error)
					{
						console.error(error.toString());
						self.failed(error.toString());
						return;
					}

					var marker = /Available tasks/,
						endMarker = /\n\nTasks run in the order specified/,
						index = stdout.search(marker),
						endIndex = stdout.search(endMarker);

					if (index === -1)
					{
						self.failed("There was a problem fetching tasks");
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

						if (name)
						{
							// Add to the list of tasks
							project.tasks.push({
								name: name,
								info: task.replace(/&/g, '&amp;')
									.replace(/'/g, '&apos;')
									.replace(/"/g, '&quot;')
									.replace(/</g, '&lt;')
									.replace(/>/g, '&gt;')
							});
						}						
					});
					self.body.removeClass('loading');
					success(project);
				}
			);
		};

		exec('node ' + self.gruntBin + ' _springroll_usertasks',
			{ cwd : project.path },
			function(error, stdout, strderr)
			{
				if (error)
				{
					console.error(error.toString());

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
				}
				project.tasks = tasks;
				self.body.removeClass('loading');
				success(project);
			}
		);
	};

	// Assign to the global space
	namespace('springroll.tasks').ProjectManager = ProjectManager;

})();