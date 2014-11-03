module.exports = {
	css: {
		files: [
			'<%= build.css.main %>',
			'<%= build.file %>',
			'<%= modules.captions.js %>',
			'<%= modules.remote.js %>',
			'src/less/**/*.less'
		],
		tasks: [
			'less:development',
			'less:captionsDebug',
			'less:remoteDebug'
		]
	}
};