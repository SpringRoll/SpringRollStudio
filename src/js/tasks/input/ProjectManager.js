(function(){

	if (APP)
	{
		var exec = require('child_process').exec;
		var path = require('path');
		var fs = require('fs');
		var async = require('async');
		var isWin = /^win/.test(process.platform);
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

		async.waterfall([
			// Check for access to node
			function(done)
			{
				exec('node --version',
					function(err, stdout, stderr)
					{
						if (err) 
						{
							console.error("Unable to access node");
							return done("Unable to access NodeJS on this machine. Is it installed?");
						}
						done(null);
					}
				);
			},
			// check that node modules exists within the project
			function(done)
			{
				var nodeModules = path.join(project.path, 'node_modules');
				fs.exists(nodeModules, function(exists)
				{
					done(null, exists);
				});
			},
			function(exists, done)
			{
				// install the node_modules within the project
				// if the node modules don't exist
				if (!exists)
				{
					self.body.addClass('installing');
					exec('npm install', { cwd : project.path }, done);
				}
				else
				{
					done(null);
				}
			}
		], 
		function(err)
		{
			if (err)
			{
				console.error(String(err));
				return self.failed(err);
			}
			self.body.removeClass('installing');
			self.proceed(success);
		});
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

		async.waterfall([
			function(done)
			{
				fs.exists(gruntPath, function(exists)
				{
					if (!exists)
					{
						return done('Unable to find local grunt.');
					}
					done(null);
				});
			},
			function(done)
			{
				fs.exists(gruntFile, function(exists)
				{
					if (!exists)
					{
						return done('Unable to find Gruntfile.js.');
					}
					done(null);
				});
			}, 
			function(done)
			{
				exec('node ' + self.gruntBin + ' _springroll_usertasks', 
					{ cwd : project.path },
					function(err, stdout, strderr)
					{
						if (err)
						{
							done("Invalid project, must contain Grunt task '_springroll_usertasks'.");
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
						done(null, project);						
					}
				);
			}
		], 
		function(err, project)
		{
			if (err)
			{
				console.error(err);
				return self.failed(err);
			}
			self.body.removeClass('loading');
			success(project);
		});
	};

	// Assign to the global space
	namespace('springroll.tasks').ProjectManager = ProjectManager;

})();