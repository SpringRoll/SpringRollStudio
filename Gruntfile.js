module.exports = function(grunt)
{
	var path = require('path'),
		_ = require('lodash');

	// Combine the game builder and current project
	// configs into one object
	var config = require('project-grunt')(grunt, {
		autoInit: false,
		data: { 
			buildDir : './build',
			installerDir : './installer',
		}
	});

	// Add the modules to config
	var build = grunt.file.readJSON('build.json');

	// Filter an array of files and only return the javascript files
	var isJS = function(file){ return /\.js$/.test(file); };

	// Filter an array of files and only return CSS and LESS files
	var isCSS = function(file){ return /\.(less|css)$/.test(file); };

	var moduleTasks = [];
	var moduleTasksDebug = [];

	// Loop through the modules and add each one
	// to the existing list of tasks, this is more 
	// maintainable if done dynamically
	_.each(build.modules, function(files, name){

		var js = _.filter(files, isJS);
		var css = _.filter(files, isCSS);
		var clean = [];
		var output;

		moduleTasks.push('clean:'+name);
		moduleTasksDebug.push('clean:'+name);

		if (js)
		{
			output = {};
			output['<%= jsFolder %>/'+name+'.js'] = js;			

			// Add the build
			config.uglify[name] = {
				files: output, 
				options: '<%= uglify.app.options %>'
			};

			// The replacements for web
			config.replace[name] = {
				src: '<%= jsFolder %>/'+name+'.js',
				overwrite: true,
				replacements: '<%= replace.main.replacements %>'
			};

			// The replacements for app
			config.replace[name+'App'] = {
				src: '<%= jsFolder %>/'+name+'.js',
				overwrite: true,
				replacements: '<%= replace.app.replacements %>'
			};

			// Add to hinting
			config.jshint.main.push(js);

			// Add to source maps
			config.concat[name] = {
				src: js,
				dest: '<%= jsFolder %>/'+name+'.js'
			};

			// add files to clean
			clean.push(
				'<%= jsFolder %>/'+name+'.js.map',
				'<%= jsFolder %>/'+name+'.js'
			);

			config.watch.main.files.push(js);
			config.watch.main.tasks.push(
				'concat:'+name, 
				'replace:'+name
			);

			moduleTasks.push('uglify:'+name);
			moduleTasksDebug.push(
				'concat:'+name,
				'replace:'+name+'App'
			);
		}

		if (css)
		{
			output = {};
			output['<%= cssFolder %>/'+name+'.css'] = css;

			// Add the Less building
			config.less[name]=  {
				files: output,
				options: '<%= less.release.options %>'
			};

			// Add LESS debug building
			config.less[name+'Debug'] = {
				files: '<%= less.'+name+'.files %>',
				options: {
					sourceMap: true,
					sourceMapFilename: '<%= cssFolder %>/'+name+'.css.map',
					sourceMapURL: name + '.css.map',
					sourceMapBasepath: '<%= cssFolder %>'
				}
			};

			// Add the watch css task
			config.watch.css.tasks.push('less:'+name+'Debug');

			// Add files to clean
			clean.push(
				'<%= cssFolder %>/'+name+'.css.map',
				'<%= cssFolder %>/'+name+'.css'
			);

			moduleTasks.push('less:'+name);
			moduleTasksDebug.push('less:'+name+'Debug');
		}

		// Clean options
		config.clean[name] = clean;
	});

	// Add the dynamic list of tasks
	grunt.registerTask('moduleTasks', moduleTasks);
	grunt.registerTask('moduleTasksDebug', moduleTasksDebug);

	// Finally add the config
	grunt.initConfig(config);
};