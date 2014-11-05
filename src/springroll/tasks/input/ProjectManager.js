(function(){

	var exec = require('child_process').exec;

	/**
	*  Add projects to the interface
	*  @class ProjectManager
	*  @namespace springroll.tasks
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
		this.projects = app.settings.getProjects();
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
			this.app.settings.setProjects(this.projects);
		}
		if (DEBUG)
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
		this.app.settings.setProjects(this.projects);
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
		this.app.settings.setProjects(this.projects);

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