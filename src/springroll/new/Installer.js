(function(){
	
	// Import node plugins
	if (APP)
	{
		var fs = require('fs');
		var path = require('path');
		var replace = require("replace");
		var glob = require("glob");
		var mkdirp = require('mkdirp').sync;
		var ncp = require('ncp').ncp;
	}

	/**
	*  Script to install the new springroll project
	*  @class Installer
	*  @namespace springroll.new
	*/
	var Installer = function()
	{
		/**
		*  The collection of install options
		*  @property {object} options
		*/
		this.options = null;

		/**
		*  The path to the template folder
		*  @property {string} options
		*/
		this.template = null;
	};

	// Reference to the prototype
	var p = Installer.prototype;

	/**
	*  The main execution point for creating a new project
	*  @method run
	*  @param {string} template The path to the template to use
	*  @param {object} options The collection of options
	*  @param {int} options.width The width of the new game
	*  @param {int} options.height The height of the new game
	*  @param {string} options.className The new class name
	*  @param {string} options.namespace The new app namespace
	*  @param {string} options.name The new app name
	*  @param {string} options.version The new app version
	*  @param {string} options.modules The list of release modules
	*  @param {string} options.modulesDebug The list of debug modules
	*  @param {string} options.libraries The list of release libraries
	*  @param {string} options.librariesDebug The list of debug libraries
	*  @param {object} options.bower The addition bower files to add
	*  @param {function} complete The function to call when done
	*/
	p.run = function(template, options, complete)
	{
		this.template = template;
		this.options = options;
		this.complete = complete;

		ncp(
			template, 
			this.options.destination, 
			onCopiedFiles.bind(this)
		);
	};

	/**
	*  Handler when the files have been copied
	*  @method onCopiedFiles
	*  @private
	*  @param {string} err if there was an error
	*/
	var onCopiedFiles = function(err)
	{
		if (err)
		{
			throw "Error copying:" + err;
		}

		var options = this.options;
		var dest = options.destination;

		fs.renameSync(
			path.join(dest, "gitignore"), 
			path.join(dest, ".gitignore")
		);

		fs.renameSync(
			path.join(dest, "bowerrc"), 
			path.join(dest, ".bowerrc")
		);

		if (Object.keys(options.bower).length > 0)
		{
			// Update the bower file added dependencies
			var bowerPath = path.join(dest, "bower.json");
			var bower = JSON.parse(fs.readFileSync(bowerPath));
			$.extend(bower.dependencies, options.bower);
			fs.writeFileSync(bowerPath, JSON.stringify(bower, null, "\t"));
		}
		
		// Replace text in the files
		var type, value, option, replacements = {};
		for (option in options)
		{
			value = options[option];

			// The collection of replacements
			replacements["_" + option + "_"] = options[option];

			replace({
				regex: "_" + option + "_",
				replacement: options[option],
				paths: [options.destination],
				recursive: true,
				silent: true
			});
		}

		// local function references
		var processGlob = this._processGlob.bind(this);
		var complete = this.complete;


		// now folder names (we have to do folders and file as two 
		// separate operations due to the issue of renaming a file's
		// parent folder)
		var pattern = options.destination + "/**/*/";
		glob(pattern, function(err, files){

			processGlob(files, replacements);

			//now file names
			glob(options.destination + "/**/*", function(err, files) {

				processGlob(files, replacements);
				complete();
			});
		});
	};

	/**
	 * takes an array of files and a dictionary of {search: replace}
	 * and renames the files it finds whose name contains the key
	 * @param  {Array} files      Array of files from a glob pattern
	 * @param  {Object} replacements Associative array of {searchString: replaceString}
	 */
	p._processGlob = function(files, replacements)
	{
		files.forEach(
			function(file)
			{
				var dir = path.dirname(file);
				var filename = path.basename(file);

				var newFilename;
				var replaceString;
				var searchString;

				for (searchString in replacements)
				{
					replaceString = replacements[searchString];

					if (filename.indexOf(searchString) > -1)
					{
						newFilename = filename.replace(searchString, replaceString);
						fs.renameSync(file, path.join(dir, newFilename));
					}
				}
			}
		);
	};

	// Assign to namespace
	namespace('springroll.new').Installer = Installer;

}());