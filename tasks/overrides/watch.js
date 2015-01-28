module.exports = {
	css: {
		files: [
			'<%= project.css.main %>',
			'<%= project.file %>',
			'src/**/*.less'
		],
		tasks: [
			'less:development'
		]
	}
};