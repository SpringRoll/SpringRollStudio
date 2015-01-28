module.exports = function(grunt)
{
	grunt.registerTask('app', 'Build the Application', [
		'clean:main',
		'jshint:main',
		'uglify:app',
		'clean:css',
		'less:release',
		'moduleAppTasks',
		'libs',
		'exec:appModules',
		'nodewebkit'
	]);
	
	grunt.registerTask('app-debug', 'Build the Application in debug mode', [
		'clean:main',
		'jshint:main',
		'concat:main',
		'replace:app',
		'clean:css',
		'less:development',
		'moduleAppTasksDebug',
		'libs-debug',
		'exec:appModules',
		'nodewebkit'
	]);

	grunt.registerTask('package', [
		'clean:installers',
		'exec:createWinInstall',
		'exec:createOSXInstall'
	]);

	grunt.registerTask(
		'open',
		'Open the OS X App', 
		['exec:openOSXApp']
	);
};