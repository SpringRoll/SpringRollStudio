(function(){
	
	// Import node plugins
	if (APP)
	{
		var fs = require('fs-extra');
		var path = require('path');
		var replace = require("replace");
		var glob = require("glob");
	}

	// Import classes
	var JSONUtils = include('springroll.new.JSONUtils');

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
	*  The meta project file
	*  @property {String} META_FILE
	*  @readOnly
	*  @static
	*  @default  ".springroll"
	*/
	Installer.META_FILE = '.springroll';

	/**
	*  The main execution point for creating a new project
	*  @method run
	*  @param {springroll.new.Template} template The path to the template to use
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

		// Copy the template files
		template.copyTo(dest);

		// Add subsitution options for the version and name	
		options.templateVersion = template.version;
		options.templateName = template.name;
		options.templateId = template.id;

		if (Object.keys(options.bower).length > 0)
		{
			// Update the bower file added dependencies
			var bower = this.readJSON('bower.json');
			$.extend(bower.dependencies, options.bower);
			this.writeJSON('bower.json', bower);
		}

		// Update the build file with libraries and modules
		var build = this.readJSON(Installer.FILE);

		// Save the template we're using
		this.writeJSON(Installer.META_FILE, {
			"template": template.toJSON()
		});
		
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
		source.splice(i, 1);
		if (items.length)
		{	
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
		return JSONUtils.read(
			path.join(
				this.options.destination, 
				file
			)
		);  
	};

	/**
	*  Write a JSON file
	*  @method writeJSON
	*  @param {string} file The file name
	*  @param {object} obj The object to update
	*/
	p.writeJSON = function(file, obj)
	{
		JSONUtils.write(
			path.join(
				this.options.destination,
				file
			), 
			obj
		);
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