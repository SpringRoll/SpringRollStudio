module.exports = function(grunt)
{
	var path = require('path'),
		_ = require('lodash');

	/**
	*  Get the sub-module for the application
	*  @method  getModule
	*  @param  {array} files The collection of files
	*  @return {object} The object as JS and CSS
	*/
	var getModule = function(files)
	{
		// Filter an array of files and only return the javascript files
		var isJS = function(file){ return /\.js$/.test(file); };

		// Filter an array of files and only return CSS and LESS files
		var isCSS = function(file){ return /\.(less|css)$/.test(file); };

		return {
			js : _.filter(files, isJS),
			css: _.filter(files, isCSS)
		};
	};

	var build = grunt.file.readJSON('build.json');

	// Combine the game builder and current project
	// configs into one object
	grunt.initConfig(_.extend(

		// Setup the default game tasks
		require('grunt-game-builder')(grunt, { autoInit: false }), 

		// Setup the current project tasks
		require('load-grunt-config')(grunt, {
			// The path for the tasks
			configPath: path.join(process.cwd(), 'tasks'),
			autoInit: false, 

			// We don't want to reload builder
			loadGruntTasks: { pattern: [
				'grunt-*', 
				'!grunt-game-builder'
			] },

			// Share the deploy folder with the tasks
			data: { 
				buildDir : './build',
				installerDir : './installer',
				modules: {
					captions : getModule(build.modules.captions),
					saveDialog: getModule(build.modules.saveDialog),
					remote: getModule(build.modules.remote)
				}
			}
		})
	));
};