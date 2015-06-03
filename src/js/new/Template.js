(function(){
	
	if (APP)
	{
		var fs = require('fs-extra');
		var path = require('path');
	}

	var TemplateModule = include('springroll.new.TemplateModule'),
		JSONUtils = include('springroll.new.JSONUtils'),
		$ = include('jQuery');

	/**
	*  A single template
	*  @class Template
	*  @namespace springroll.new
	*  @constructor
	*  @param {string} templatePath The path to the template
	*/
	var Template = function(templatePath)
	{
		var templateFile = path.join(templatePath, Template.MAIN);
		if (!fs.existsSync(templateFile))
		{
			throw "Not a valid template.";
		}

		// Get the JSON data
		var data = JSONUtils.read(templateFile);

		// Data validation
		if (!data.id || !data.name || !data.version)
		{
			throw "The following fields are required for the template: 'id', 'name', 'version'";
		}

		/**
		 * The path to the source directory
		 * @property {string} path
		 */
		this.path = templatePath;

		/**
		 * The human-readable name
		 * @property {string} name
		 */
		this.name = data.name;

		/**
		 * The bundle id for this template
		 * @property {string} id
		 */
		this.id = data.id;

		/**
		 * The semver version of this template
		 * @property {string} version
		 */
		this.version = data.version;

		/**
		 * The array of local files to remove
		 * @property {array} remove
		 */
		this.remove = data.remove || null;

		/**
		 * Files to rename where key is the original and value
		 * is the output (renamed) file
		 * @property {object} rename
		 */
		this.rename = data.rename || null;

		/**
		 * The collection of parent modules that are required,
		 * these are checked by default
		 * @property {array} _required
		 * @private
		 */
		this._required = data.required || [];

		/**
		 * The modules to exclude from the listing, these
		 * will show up unchecked and disabled
		 * @property {array} _disabled
		 * @private
		 */
		this._disabled = data.disabled || [];

		/**
		 * Template to extend to
		 * @property {string} extend
		 */
		this.extend = data.extend || null;

		/**
		 * The username/repo for github
		 * @property {string} github
		 */
		this.github = data.github || null;

		/**
		 * The parent template
		 * @property {springroll.new.Template} parent
		 */
		this.parent = null;

		/**
		 * The modules that define this template
		 * @property {array} _modules
		 * @private
		 */
		this._modules = data.modules || [];

		// Create modules
		for(var i = 0; i < this._modules.length; i++)
		{
			this._modules[i] = new TemplateModule(this._modules[i]);
		}
	};

	/**
	 * The main template file
	 * @property {string} MAIN
	 * @static
	 * @default "springroll-template.json"
	 * @readOnly
	 */
	Template.MAIN = "springroll-template.json";

	// Reference to the prototype
	var p = Template.prototype;

	/**
	 * Copy a template to a destination
	 * @method  copyTo
	 * @param  {string} dest The destination location
	 */
	p.copyTo = function(dest)
	{
		// Copy the parent first
		if (this.parent)
		{
			this.parent.copyTo(dest);
		}

		if (DEBUG)
		{
			console.log("Copy " + this.path + " to " + dest);
		}

		// Copy the files from the template to the destination
		fs.copySync(this.path, dest);

		// Rename any local files that should actually
		// be hidden
		if (this.rename)
		{
			for(var file in this.rename)
			{
				fs.renameSync(
					path.join(dest, file), 
					path.join(dest, this.rename[file])
				);
			}
		}

		// Any files to remove, this can be if we're overriding
		// another template, we can delete things in the parent
		if (this.remove)
		{
			for (var i = 0; i < this.remove.length; i++)
			{
				fs.unlinkSync(path.join(dest, this.remove[i]));
			}
		}

		// Remove the template file
		fs.unlinkSync(path.join(dest, Template.MAIN));
	};

	/**
	 * Get the map of modules
	 * @property {array} modules
	 */
	Object.defineProperty(p, "modules", {
		get: function()
		{
			var modules = [];
			if (this.parent)
			{
				modules = modules.concat(this.parent.modules);
			}
			return modules.concat(this._modules);
		}
	});

	/**
	 * Get the list of required module ids
	 * @property {object} required
	 */
	Object.defineProperty(p, "required", {
		get: function()
		{
			var required = [];
			if (this.parent)
			{
				required = required.concat(this.parent.required);
			}
			return required.concat(this._required);
		}
	});

	/**
	 * Get the list of disabled module ids
	 * @property {object} disabled
	 */
	Object.defineProperty(p, "disabled", {
		get: function()
		{
			var disabled = [];
			if (this.parent)
			{
				disabled = disabled.concat(this.parent.disabled);
			}
			return disabled.concat(this._disabled);
		}
	});

	/**
	 * Convert the template to JSON
	 * @method  toJSON
	 * @return {object} the output json
	 */
	p.toJSON = function()
	{
		return {
			"version": this.version,
			"id": this.id
		};
	};

	// Assign to namespace
	namespace('springroll.new').Template = Template;

}());