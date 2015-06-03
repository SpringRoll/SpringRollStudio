module.exports = {
	appModules : {
		command: 'npm install',
		cwd: '<%= distFolder %>',
		stdout: false,
	    stderr: false
	},
	"packagewin32": {
		cmd: 'makensis <%= installerDir %>/win32.nsi'
	},
	"packagewin64": {
		cmd: 'makensis <%= installerDir %>/win64.nsi'
	},
	"openosx32" : {
		cmd: 'open <%= buildDir %>/<%= project.name %>/osx32/<%= project.name %>.app'
	},
	"openosx64" : {
		cmd: 'open <%= buildDir %>/<%= project.name %>/osx64/<%= project.name %>.app'
	},
	"openwin32" : {
		cmd: '<%= buildDir %>/<%= project.name %>/win32/<%= project.name %>.exe'
	},
	"openwin64" : {
		cmd: '<%= buildDir %>/<%= project.name %>/win64/<%= project.name %>.exe'
	}
};