module.exports = {
	captions: {
		files: {
			'<%= cssFolder %>/captions.css': '<%= modules.captions.css %>',
		},
		options: '<%= less.release.options %>'
	},
	"captionsDebug": {
		files: '<%= less.captions.files %>',
		options: {
			sourceMap: true,
			sourceMapFilename: '<%= cssFolder %>/captions.css.map',
			sourceMapURL: 'captions.css.map',
			sourceMapBasepath: '<%= cssFolder %>'
		}
	},
	remote: {
		files: {
			'<%= cssFolder %>/remote.css': '<%= modules.remote.css %>',
		},
		options: '<%= less.release.options %>'
	},
	"remoteDebug": {
		files: '<%= less.remote.files %>',
		options: {
			sourceMap: true,
			sourceMapFilename: '<%= cssFolder %>/remote.css.map',
			sourceMapURL: 'remote.css.map',
			sourceMapBasepath: '<%= cssFolder %>'
		}
	}
};