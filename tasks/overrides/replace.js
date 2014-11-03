module.exports = {
	main: {
		src: '<%= jsFolder %>/main.js',
		overwrite: true,
		replacements: [{
			from: /\bDEBUG\b/g,
			to: "true"
		},{
			from: /\bRELEASE\b/g,
			to: "false"
		},{
			from: /\bWEB\b/g,
			to: "true"
		},{
			from: /\bAPP\b/g,
			to: "false"
		}]
	},
	app: {
		src: '<%= jsFolder %>/main.js',
		overwrite: true,
		replacements: [{
			from: /\bDEBUG\b/g,
			to: "true"
		},{
			from: /\bRELEASE\b/g,
			to: "false"
		},{
			from: /\bWEB\b/g,
			to: "false"
		},{
			from: /\bAPP\b/g,
			to: "true"
		}]
	},
	captions: {
		src: '<%= jsFolder %>/captions.js',
		overwrite: true,
		replacements: '<%= replace.app.replacements %>'
	},
	remote: {
		src: '<%= jsFolder %>/remote.js',
		overwrite: true,
		replacements: '<%= replace.app.replacements %>'
	},
	saveDialog: {
		src: '<%= jsFolder %>/saveDialog.js',
		overwrite: true,
		replacements: '<%= replace.app.replacements %>'
	}
};