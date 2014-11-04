module.exports = {
	css: {
		files: [
			'<%= build.css.main %>',
			'<%= build.file %>',
			'src/**/*.less'
		],
		tasks: [
			'less:development'
		]
	}
};