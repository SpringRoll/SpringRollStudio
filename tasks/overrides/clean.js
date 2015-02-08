module.exports = {
	installers: ['<%= buildDir %>/<%= project.name %>-Setup-*.*'],
	defaultTemplate: [
		'<%= components %>/default/',
		'<%= distFolder %>/assets/templates/default/'
	]
};