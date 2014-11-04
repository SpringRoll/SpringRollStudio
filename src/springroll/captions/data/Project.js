(function(undefined){

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
		var self = this;

		if (APP)
		{
			var path = require('path');
			var fs = require('fs');

			// Convert the old project file to the new format
			var oldFile = path.join(dir, OLD_PROJECT_FILE);
			var file = path.join(dir, PROJECT_FILE);

			if (fs.existsSync(oldFile))
			{
				// Read in the project json
				var data = JSON.parse(fs.readFileSync(oldFile));

				// Write the new project JSON file
				fs.writeFileSync(
					file, 
					JSON.stringify({ captions: data }, null, "\t")
				);

				// Remove the old project file
				fs.unlinkSync(oldFile);
			}

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
			fs.readFile(file, function(err, data){

				if (err)
				{
					callback(null);
					throw err;
				}
				// Finish the loading
				self.onProjectLoaded(JSON.parse(data), callback);
			});
		}
		if (WEB)
		{
			$.getJSON(
				// cache bust the file request for AJAX request
				dir + "/"+PROJECT_FILE+"?cb=" + Math.random() * 10000,
				function(data)
				{
					self.onProjectLoaded(data, callback);
				}
			);
		}
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
		// No projects file!
		if (!data || !data.captions)
		{
			callback(null);
			return;
		}
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
		var fs = require('fs'),
			path = require('path'),
			glob = require('glob'),
			self = this,
			dir = path.dirname(file);

		this.modal.open(dir, function(result){

			// Failed!
			if (!result)
			{
				callback(null);
				return;
			}

			var audioPath = result.audioPath,
				exportPath = result.exportPath,
				cwd = path.join(dir, audioPath);

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

				// Write the project to file
				fs.writeFileSync(file, JSON.stringify(data, null, "\t"));

				// Continue with loading the new created project
				self.onProjectLoaded(data, callback);
			});
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
			var path = require('path');
			var fs = require('fs');
			exportPath = path.join(this.dir, locale.export);
			this.captions = JSON.parse(fs.readFileSync(exportPath) || '{}');
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
			var fs = require('fs');
			var path = require('path');
			var projectFile = path.join(this.dir, PROJECT_FILE);
			var exportFile = path.join(this.dir, locale.export);

			// Re-export the captions file
			fs.writeFileSync(
				exportFile, 
				JSON.stringify(this.captions, null, "\t")
			);

			// Get the project JSON file and update it
			var project = JSON.parse(fs.readFileSync(projectFile));
			project.captions.locales = this.locales;
			project.captions.assets = this.assets;

			// Update the project file
			fs.writeFileSync(projectFile, JSON.stringify(project, null, "\t"));
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