module.exports = function(grunt)
{
	var _ = require('lodash');

	var config = require('project-grunt')(grunt, {
		autoInit: false,
		data: { 
			buildDir : './build',
			installerDir : './installer',
		}
	});

	// Create the tasks for building the modules
	// in APP mode
	var moduleAppTasks = [],
		moduleAppTasksDebug = [];

	// Loop through the module
	for(var alias in config.project.modules)
	{
		var task, app = alias+'app';

		// Use the APP uglify options
		task = config.uglify[app] = _.cloneDeep(config.uglify[alias]);
		task.options = '<%= uglify.app.options %>';
		
		// Use the APP replacement options
		task = config.replace[app] = _.cloneDeep(config.replace[alias]);
		task.replacements = '<%= replace.app.replacements %>';

		moduleAppTasks.push(
			'clean:'+alias,
			'uglify:'+app
		);

		moduleAppTasksDebug.push(
			'clean:'+alias,
			'concat:'+alias,
			'replace:'+app
		);

		// Add the less tasks if we have css
		if (config.less[alias])
		{
			moduleAppTasks.push('less:'+alias);
			moduleAppTasksDebug.push('less:'+alias+'Debug');
		}
	}

	// Register new tasks
	grunt.registerTask('moduleAppTasks', moduleAppTasks);
	grunt.registerTask('moduleAppTasksDebug', moduleAppTasksDebug);

	grunt.initConfig(config);
};