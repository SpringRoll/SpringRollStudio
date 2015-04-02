(function(undefined){

	if (APP)
	{
		var fs = require('fs');
		var path = require('path');
		var glob = require('glob');
	}

	/**
	*  Class for managing the project data
	*  @class Project
	*/
	var Project = function()
	{
		/**
		*  The current project folder
		*  @property {string} dir
		*/
		this.dir = null;

		/**
		*  The dictionary collection of locales
		*  @property {Dictionary} locales
		*/
		this.locales = null;

		/**
		*  The collection of assets with id and src fields
		*  @property {Array} assets
		*/
		this.assets = null;

		/**
		*  The collection of captions by alias
		*  @property {Dictionary} captions
		*/
		this.captions = null;

		/**
		 * The modal dialog
		 * @property {jquery} modal
		 */
		this.modal = new springroll.captions.ProjectModal("#newProject");

		/**
		*  The currently selected locale
		*  @property {string} _local
		*  @private
		*/
		this._locale = null;

		/**
		*  If the project has been loaded
		*  @property {boolean} loaded
		*/
		this.loaded = false;
	};

	// Reference to the prototype
	var p = Project.prototype;

	/**
	*  The name of the project file
	*  @property {String} PROJECT_FILE
	*  @static
	*  @private
	*/
	var PROJECT_FILE = ".springroll";

	// for backward-compatibility
	var OLD_PROJECT_FILE = ".captions";

	/**
	*  Load the caption file and project for the current locale
	*  @method open
	*  @param {string} dir The directory to load
	*  @param {function} callback Function handler when completed
	*/
	p.open = function(dir, callback)
	{
		this.close();
		this.dir = dir;

		if (APP)
		{
			var data;

			// Convert the old project file to the new format
			var oldFile = path.join(dir, OLD_PROJECT_FILE);
			var file = path.join(dir, PROJECT_FILE);

			// backward compatibility with old project file
			if (fs.existsSync(oldFile))
			{
				data = parseJSON(oldFile);

				if (!data)
				{
					callback(null);
					return;
				}

				// Write the new project JSON file
				writeJSON(file, { captions: data });

				// Remove the old project file
				fs.unlinkSync(oldFile);
			}

			// Check for a project file that doesn't exist
			if (!fs.existsSync(file))
			{
				if (DEBUG)
				{
					console.info("Project file doesn't exist!");
				}
				// create a new project
				this.create(file, callback);
				return;
			}

			data = parseJSON(file);

			// Make sure we have some data
			if (!data)
			{
				callback(null);
				return;
			}

			// Check that there's a captions object
			if (!data.captions)
			{
				this.create(file, callback);
				return;
			}

			this.onProjectLoaded(data, callback);
		}
		if (WEB)
		{
			$.getJSON(
				// cache bust the file request for AJAX request
				dir + "/"+PROJECT_FILE+"?cb=" + Math.random() * 10000,
				function(data)
				{
					this.onProjectLoaded(data, callback);
				}.bind(this)
			);
		}
	};

	/**
	 * Handle the parse with an alert
	 * @method parseJSON
	 * @static
	 * @private
	 * @param {string} str The JSON string
	 * @param {string} [create] Default contents if file doesn't exist
	 * @return {object} The JSON object or null
	 */
	var parseJSON = function(file, create)
	{
		if (!fs.existsSync(file))
		{
			if (create)
			{
				fs.writeFileSync(file, create);
			}
			else
			{
				alert("File " + file + " does not exist. Manually create it.");
				return;
			}
		}
		var str = fs.readFileSync(file);
		var data;
		try 
		{
			data = JSON.parse(str);
		}
		catch(e)
		{
			alert("Unable to parse " + file + 
				". Manually fix JSON errors and try again.");
			return;
		}
		return data;
	};

	/**
	 * Write the JSON
	 * @method writeJSON
	 * @static
	 * @private
	 * @param {string} file Output file location
	 * @param {*} data The output data
	 */
	var writeJSON = function(file, data)
	{
		fs.writeFileSync(file, JSON.stringify(data, null, "\t"));
	};

	/**
	 * The project is loadd
	 * @method  onProjectLoaded
	 * @private
	 * @param  {object}   data The JSON data object
	 * @param  {Function} callback Callback when done
	 */
	p.onProjectLoaded = function(data, callback)
	{
		this.locales = data.captions.locales;
		this.assets = data.captions.assets;
		this.setLocale('default', function(project){
			this.loaded = !!project;
			callback(project);
		}.bind(this), true);
	};

	/**
	 * Create a new project
	 * @param  {string}   file     The .caption file path
	 * @param  {Function} callback Callback when done
	 */
	p.create = function(file, callback)
	{
		var dir = path.dirname(file);
		this.modal.open(dir, 
			this.onModalClosed.bind(this, file, dir, callback)
		);
	};

	/**
	 * When the modal project dialog is closed
	 * @method onModalClosed
	 * @private
	 * @param {string} file The project file to save
	 * @param {string} dir Project main path
	 * @param {function} callback The result when we're done
	 * @param {object} result 
	 */
	p.onModalClosed = function(file, dir, callback, result)
	{		
		// Failed!
		if (!result)
		{
			callback(null);
			return;
		}

		var audioPath = result.audioPath,
			exportPath = result.exportPath,
			cwd = path.join(dir, audioPath),
			self = this;

		// Select all OGG file from the audio folder
		glob('**/*.ogg', {cwd:cwd}, function(err, files) {

			if (err)
			{
				callback(null);
				throw err;
			}

			var assets = [];

			_.each(files, function(file){
				assets.push({
					id : path.basename(file, '.ogg'),
					src : file
				});
			});

			// Add an empty export file if there isn't one
			var exportFile = path.join(dir, exportPath);
			if (!fs.existsSync(exportFile))
			{
				if (DEBUG)
				{
					console.log("Save empty captions file " + exportFile);
				}
				fs.writeFileSync(exportFile, "{}");
			}

			// Dummy project file
			var data = {
				"captions" : {
					"assets" : assets,
					"locales" : {
						"default" : {
							"path" : audioPath,
							"export" : exportPath
						}
					}
				}
			};

			// File already exists, but no captions data
			if (fs.existsSync(file))
			{
				var projectData = parseJSON(file);
				projectData.captions = data.captions;
				writeJSON(file, projectData);
			}
			else
			{
				// Write the project to file
				writeJSON(file, data);
			}

			// Continue with loading the new created project
			self.onProjectLoaded(data, callback);
		});
	};

	/**
	*  Load the current locale
	*  @method setLocale
	*  @param {string} lang The current locale
	*  @param {fuction} callback The callback when done setting
	*  @param {boolean} [init=false] If this is the initial load
	*/
	p.setLocale = function(lang, callback, init)
	{
		// If not initial check if we're loaded
		if (!init) this._isLoaded();

		var locale = this._isLocale(lang);

		// Update the local
		this._locale = lang;

		if (!locale.export)
		{
			throw "No export file is available for the locale " + lang;
		}

		var exportPath;
		if (APP)
		{
			exportPath = path.join(this.dir, locale.export);

			this.captions = parseJSON(exportPath, '{}');

			if (!this.captions)
			{
				callback(null);
				return;
			}
			callback(this);
		}
		if (WEB)
		{
			exportPath = this.dir + "/" + locale.export;
			// The load captions dictionary for the current locale
			$.getJSON(exportPath + "?cb=" + Date.now(), function(data){

				this.captions = data || {};
				callback(this);

			}.bind(this));
		}
	};

	/**
	*  Save the current project
	*  @method save
	*/
	p.save = function()
	{
		this._isLoaded();
		var locale = this._isLocale();

		if (APP)
		{
			var projectFile = path.join(this.dir, PROJECT_FILE);
			var exportFile = path.join(this.dir, locale.export);

			// Re-export the captions file
			writeJSON(exportFile, this.captions);

			// Get the project JSON file and update it
			var project = parseJSON(projectFile);

			// Ignore if invalid project JSON
			if (!project)
			{
				return;
			}

			project.captions.locales = this.locales;
			project.captions.assets = this.assets;

			// Update the project file
			writeJSON(projectFile, project);
		}

		if (WEB && DEBUG)
		{
			console.log("Saving... " + this.dir + "/" + locale.export);
			console.log("Saving... " + this.dir + "/" + PROJECT_FILE);
		}
	};

	/**
	*  Add a new local to the project
	*  @method addLocale
	*  @param {string} lang The language identifier ("en", "fr", etc)
	*  @param {string} path The local path to the audio assets
	*  @param {string} exportPath The local path to the export JSON file,
	*         including the file name.
	*/
	p.addLocale = function(lang, path, exportPath)
	{
		this._isLoaded();
		if (this.locales[lang] !== undefined)
		{
			throw "Locale is added alrady with the language " + lang;
		}
		this.locales[lang] = {
			path : path,
			export : exportPath
		};
	};

	/**
	*  Remove the localization
	*  @method removeLocale
	*  @param {string} lang The language identifier ("en", "fr", etc)
	*/
	p.removeLocale = function(lang)
	{
		this._isLoaded();
		this._isLocale(lang);
		delete this.locales[lang];
	};

	/**
	*  Delete the caption by alias also remove asset
	*  @method removeCaption
	*/
	p.removeCaptions = function(alias)
	{
		this._isLoaded();
		var asset = this._isAsset(alias, true);
		delete this.captions[alias];

		if (asset)
		{
			// Remove the asset
			var len = this.assets.length;
			for(var i = 0; i < len; i++)
			{
				if (this.assets[i].id == alias)
				{
					this.assets.splice(i, 1);
					return;
				}
			}
		}
	};

	/**
	*  Look at the audio folder and re-sync the project
	*  @method resync
	*  @param {function} callback Callback when new assets are added.
	*/
	p.resync = function(callback)
	{
		this._isLoaded();
		var locale = this._isLocale();

		if (APP)
		{
			var path = require('path'),
				glob = require('glob'),
				self = this,
				assets = [];

			_.each(this.assets, function(asset){
				assets.push(asset.src);
			});

			// Select all OGG file from the audio folder
			glob('**/*.ogg', {cwd: this.getAudioPath() }, function(err, files){

				if (err)
				{
					throw err;
				}

				var newAssets = [];
				_.each(files, function(file){
					if (assets.indexOf(file) === -1)
					{
						if (DEBUG)
						{
							console.log("Found new audio file: " + file);
						}
						var asset = {
							id: path.basename(file, '.ogg'),
							src: file
						};
						self.assets.push(asset);
						newAssets.push(asset);
					}
				});

				// If new assets were added re-save and refresh
				if (newAssets.length)
				{
					callback(newAssets);
				}
			});
		}
	};

	/**
	*  Get the audio source path for an alias on the current local
	*  @method getAudioSource
	*  @param {string} alias to get audio for
	*  @return {string} full path to the audio file
	*/
	p.getAudioSource = function(alias)
	{
		this._isLoaded();
		var locale = this._isLocale();
		var asset = this._isAsset(alias);

		if (APP)
		{
			var path = require('path');
			return path.join(this.dir, locale.path, asset.src);
		}
		if (WEB)
		{
			return this.dir + "/" + locale.path + "/" + asset.src;
		}
	};

	/**
	 * Get the current locale path to audio files
	 * @method  getAudioPath
	 * @return {string} The path to the path
	 */
	p.getAudioPath = function()
	{
		var locale = this._isLocale();
		if (APP)
		{
			var path = require('path');
			return path.join(this.dir, locale.path);
		}
		if (WEB)
		{
			return this.dir + "/" + locale.path;
		}
	};

	/**
	*  Update the aliase for an asset
	*  @method updateAlias
	*  @param {string} oldAlias The old alias to change
	*  @param {string} newAlias The new alias to change to
	*  @return {boolean} If it was changed
	*/
	p.changeAlias = function(oldAlias, newAlias)
	{
		this._isLoaded();

		if (this.captions[newAlias])
		{
			throw "Caption alias conflict when changing '" +
				oldAlias + "' to '" + newAlias + "'";
		}

		if (this._isAsset(newAlias, true))
		{
			throw "Asset alias conflict when changing to '" +
				oldAlias + "' to '" + newAlias + "'";
		}

		var asset = this._isAsset(oldAlias, true);

		// Asset COULD be optional if the caption doesn't have an
		// audio file associated with it.
		if (asset)
		{
			// Update current asset
			asset.id = newAlias;
		}

		// Replace the captions object
		this.captions[newAlias] = this.captions[oldAlias];
		delete this.captions[oldAlias];

		return true;
	};

	/**
	*  Get the current list of captions
	*  @method getCaptions
	*  @param {string} alias The caption alias
	*  @return {array} The list of caption lines
	*/
	p.getCaptions = function(alias)
	{
		this._isLoaded();
		this._isAsset(alias);

		var captions = this.captions[alias];

		if (_.isObject(captions) && captions.lines)
		{
			return captions.lines;
		}
		else if (_.isArray(captions))
		{
			return captions;
		}
		else
		{
			return [];
		}
	};

	/**
	*  Set the captions for an alias
	*  @method setCaptions
	*  @param {string} alias The optional alias, default uses currently opened
	*  @param {array} captions The new collection of captions
	*/
	p.setCaptions = function(alias, captions)
	{
		this._isLoaded();
		this._isAsset(alias);
		this.captions[alias] = captions;
	};

	/**
	*  Is the current alias valid
	*  @method _isAsset
	*  @private
	*  @param {string} alias
	*  @param {boolean} suppressError if throwing should be suppressed
	*/
	p._isAsset = function(alias, suppressError)
	{
		var len = this.assets.length;
		for(var i = 0; i < len; i++)
		{
			if (this.assets[i].id == alias)
			{
				return this.assets[i];
			}
		}
		if (!suppressError)
		{
			throw "Unable to find an alias matching : " + alias;
		}
		return null;
	};

	/**
	*  Is the current alias is a valid caption
	*  @method _isCaption
	*  @private
	*  @param {string} alias
	*  @param {boolean} suppressError if throwing should be suppressed
	*  @return {boolean} If a caption is found
	*/
	p._isCaption = function(alias, suppressError)
	{
		if (this.captions[alias] === undefined)
		{
			if (!suppressError)
			{
				throw "Caption doesn't exist for alias : " + alias;
			}
			return false;
		}
		return true;
	};

	/**
	*  Check to see if the current project is loaded
	*  @method _isLoaded
	*  @private
	*/
	p._isLoaded = function()
	{
		if (!this.loaded)
		{
			throw "Project isn't loaded yet!";
		}
	};

	/**
	*  Check for a locale if it exists
	*  @method _isLocale
	*  @private
	*  @param {string} [lang] The locale to check for
	*  @return {object} The current local
	*/
	p._isLocale = function(lang)
	{
		lang = lang || this._locale;

		if (this.locales[lang] === undefined)
		{
			throw "Locale is not found for " + lang;
		}
		return this.locales[lang];
	};

	/**
	*  Close the current project
	*  @method close
	*/
	p.close = function()
	{
		this.assets = null;
		this.locales = null;
		this._locale = null;
		this.loaded = false;
		this.captions = null;
		this.dir = null;
	};

	/**
	*  Represent the class as a string
	*  @method toString
	*  @return {string} string rep of the project
	*/
	p.toString = function()
	{
		return "[Project dir='" + this.dir + "']";
	};

	// Assign to namespace
	namespace('springroll.captions').Project = Project;

}(!!window.require));