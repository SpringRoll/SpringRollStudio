module.exports = {
	main: [
		'Gruntfile.js',
		'<%= build.js.main %>',
		'<%= modules.captions.js %>',
		'<%= modules.remote.js %>'
	]
};