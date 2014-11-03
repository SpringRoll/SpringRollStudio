module.exports = function(grunt)
{
	grunt.registerTask('app', 'Build the Application', [
		'clean:main',
		'jshint:main',
		'uglify:app',
		'clean:captions',
		'uglify:captions',
		'clean:remote',
		'uglify:remote',
		'clean:saveDialog',
		'uglify:saveDialog',
		'clean:css',
		'less:release',
		'less:captions',
		'less:remote',
		'libs',
		'exec:app_modules',
		'nodewebkit'
	]);
	
	grunt.registerTask('app-debug', 'Build the Application in debug mode', [
		'clean:main',
		'jshint:main',
		'concat_sourcemap:main',
		'replace:app',
		'clean:captions',
		'concat_sourcemap:captions',
		'replace:captions',
		'clean:remote',
		'concat_sourcemap:remote',
		'replace:remote',
		'clean:saveDialog',
		'concat_sourcemap:saveDialog',
		'replace:saveDialog',
		'clean:css',
		'less:development',
		'less:captionsDebug',
		'less:remoteDebug',
		'libs-debug',
		'exec:app_modules',
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