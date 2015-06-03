module.exports = {
	options: {
		"title": "<%= project.name %>",
		"icon": "<%= distFolder %>/assets/images/icon.icns",
		"background": "<%= installerDir %>/assets/background.png",
		"icon-size": 80
	},
	osx64: {
		options: {
			"contents": [
				{
					"x": 448,
					"y": 344,
					"type": "link",
					"path": "/Applications"
				},
				{
					"x": 192,
					"y": 344,
					"type": "file",
					"path": "<%= buildDir %>/<%= project.name %>/osx64/<%= project.name %>.app"
				}
			]
		},
		dest: '<%= buildDir %>/<%= project.name %>-Setup-x64.dmg'
	},
	osx32: {
		options: {
			"contents": [
				{
					"x": 448,
					"y": 344,
					"type": "link",
					"path": "/Applications"
				},
				{
					"x": 192,
					"y": 344,
					"type": "file",
					"path": "<%= buildDir %>/<%= project.name %>/osx32/<%= project.name %>.app"
				}
			]
		},
		dest: '<%= buildDir %>/<%= project.name %>-Setup-x32.dmg'
	}

};