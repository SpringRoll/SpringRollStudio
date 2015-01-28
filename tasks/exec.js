module.exports = {
	appModules : {
		command: 'npm install',
		cwd: '<%= distFolder %>',
		stdout: false,
	    stderr: false
	},
	createWinInstall: {
		cmd: 'makensis <%= installerDir %>/win.nsi'
	},
	createOSXInstall: {
		cmd: 'appdmg <%= installerDir %>/osx.json <%= buildDir %>/<%= project.name %>-Setup.dmg'
	},
	openOSXApp : {
		cmd: 'open <%= buildDir %>/<%= project.name %>/osx/<%= project.name %>.app'
	}
};