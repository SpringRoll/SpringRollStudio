module.exports = {
	main: [
		'Gruntfile.js',
		'<%= build.js.main %>',
		'<%= modules.captions.js %>',
		'<%= modules.saveDialog.js %>',
		'<%= modules.remote.js %>'
	]
};