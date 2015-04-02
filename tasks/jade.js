module.exports = {
	debug: {
		options: {
			pretty: true,
			data: {
				debug: true,
				name: "<%= project.name %>",
				version: "<%= project.version %>"
			}
		},
		files: {
			"<%= distFolder %>/captions.html": "src/jade/captions.jade",
			"<%= distFolder %>/index.html": "src/jade/index.jade",
			"<%= distFolder %>/new.html": "src/jade/new.jade",
			"<%= distFolder %>/preview.html": "src/jade/preview.jade",
			"<%= distFolder %>/remote.html": "src/jade/remote.jade",
			"<%= distFolder %>/tasks-terminal.html": "src/jade/tasks-terminal.jade",
			"<%= distFolder %>/tasks-test.html": "src/jade/tasks-test.jade",
			"<%= distFolder %>/tasks.html": "src/jade/tasks.jade"
		}
	},
	release: {
		options: {
			data: {
				debug: false,
				name: "<%= project.name %>",
				version: "<%= project.version %>"
			}
		},
		files: "<%= jade.debug.files %>"
	}
};