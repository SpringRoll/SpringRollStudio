module.exports = {
	defaultTemplate: {
		expand: true,
		cwd: '<%= components %>/default/',
		src: '**',
		dest: '<%= distFolder %>/assets/templates/default/'
	}
};