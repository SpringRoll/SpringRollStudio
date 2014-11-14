(function(){
	
	// Import node plugins
	if (APP)
	{
		var fs = require('fs-extra');
		var path = require('path');
		var replace = require("replace");
		var glob = require("glob");
	}

	var TemplateManager = springroll.new.TemplateManager;

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
	};

	// Reference to the prototype
	var p = Installer.prototype;

	/**
	*  The build file required for springroll
	*  @property {String} FILE
	*  @readOnly
	*  @static
	*  @default  "springroll.json"
	*/
	Installer.FILE = 'springroll.json';

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
		this.options = options;
		var dest = options.destination;

		if (DEBUG)
		{
			console.log("Copy " + template + " to " + dest);
		}

		// Copy the files
		fs.copySync(template, dest);

		// Add hidden files		
		var config = this.readJSON(TemplateManager.FILE);
		options.templateVersion = config.version;
		options.templateName = config.name;

		// Rename any local files that should actually
		// be hidden
		if (config.rename)
		{
			for(var file in config.rename)
			{
				fs.renameSync(
					path.join(dest, file), 
					path.join(dest, config.rename[file])
				);
			}
		}

		// Remove the template file
		fs.unlinkSync(path.join(dest, TemplateManager.FILE));

		if (Object.keys(options.bower).length > 0)
		{
			// Update the bower file added dependencies
			var bower = this.readJSON('bower.json');
			$.extend(bower.dependencies, options.bower);
			this.writeJSON('bower.json', bower);
		}

		// Update the build file with libraries and modules
		var build = this.readJSON(Installer.FILE);
		
		// Replace tokens with the list of depdendencies
		insertAt(
			"_libraries_", 
			build.libraries, 
			options.libraries
		);
		insertAt(
			"_librariesDebug_", 
			build.librariesDebug, 
			options.librariesDebug
		);
		this.writeJSON(Installer.FILE, build);
		
		// Replace text in the files
		var type, value, option, replacements = {};

		for (option in options)
		{
			value = options[option];

			// Ignore arrays
			if (Array.isArray(value)) continue;

			// The collection of replacements
			replacements["_" + option + "_"] = value;

			replace({
				regex: "_" + option + "_",
				replacement: value,
				paths: [options.destination],
				recursive: true,
				silent: true
			});
		}

		// local function references
		var processGlob = this._processGlob.bind(this);

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
	*  Add a group of items to an array
	*  @method insertAt
	*  @private
	*  @param {array} arr The array to update
	*  @param {array} items The items to add
	*/
	var insertAt = function(key, source, items)
	{
		var i = source.indexOf(key);
		if (items.length)
		{
			source.splice(i, 1);
			source.splice.apply(source, [i, 0].concat(items));
		}
		return source;
	};

	/**
	*  Read a JSON file
	*  @method readJSON
	*  @param {string} file The file name
	*/
	p.readJSON = function(file)
	{
		var filePath = path.join(this.options.destination, file);
		return JSON.parse(fs.readFileSync(filePath));
	};

	/**
	*  Write a JSON file
	*  @method writeJSON
	*  @param {string} file The file name
	*  @param {object} obj The object to update
	*/
	p.writeJSON = function(file, obj)
	{
		var filePath = path.join(this.options.destination, file);
		fs.writeFileSync(filePath, JSON.stringify(obj, null, "\t"));
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