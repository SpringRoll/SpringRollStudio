module.exports = {
	installers: ['<%= buildDir %>/<%= build.name %>-Setup.*'],
	captions: [
		'<%= jsFolder %>/captions.js.map',
		'<%= jsFolder %>/captions.js',
		'<%= cssFolder %>/captions.css.map',
		'<%= cssFolder %>/captions.css'
	],
	remote: [
		'<%= jsFolder %>/remote.js.map',
		'<%= jsFolder %>/remote.js',
		'<%= cssFolder %>/remote.css.map',
		'<%= cssFolder %>/remote.css'
	]
};