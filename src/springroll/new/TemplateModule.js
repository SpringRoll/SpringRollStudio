(function(){
	
	var _ = include('_');

	/**
	*  A module attached to a template
	*  @class TemplateModule
	*  @namespace springroll.new
	*  @constructor
	*  @param {object} data JSON data to construct
	*/
	var TemplateModule = function(data)
	{
		/**
		 * The bundle id for this template
		 * @property {string} id
		 */
		this.id = data.id;

		/**
		 * The human-readable name
		 * @property {string} name
		 */
		this.name = data.name;

		/**
		 * The list of release module files
		 * @property {array} main
		 */
		this.main = toArray(data.main);

		/**
		 * The list of debug module files
		 * @property {array} mainDebug
		 */
		this.mainDebug = toArray(data.mainDebug) || this.main;

		/**
		 * The list of release library files
		 * @property {array} libraries
		 */
		this.libraries = toArray(data.libraries);

		/**
		 * The list of debug library files
		 * @property {array} librariesDebug
		 */
		this.librariesDebug = toArray(data.librariesDebug) || this.libraries;

		/**
		 * The Bower dependencies
		 * @property {object} bower
		 */
		this.bower = data.bower || null;

		/**
		 * The files to copy from the libraries
		 * @property {object} librariesCopy
		 */
		this.librariesCopy = data.librariesCopy || null;

		/**
		 * The other modules this depends on
		 * @property {Array} depends
		 */
		this.depends = data.depends || [];

		/**
		 * If the module is a display module, a special classification
		 * this property is the name of the class to use
		 * @property {string} display
		 */
		this.display = data.display || null;

		/**
		 * If the module is selected by default
		 * @property {boolean} default
		 * @default true
		 */
		this.default = _.isUndefined(data.default) ? true : !!data.default;
	};

	/**
	 * Convert to an array
	 * @method toArray
	 * @private
	 * @param  {string|array} obj The object to convert
	 * @return {array} The array
	 */
	var toArray = function(obj)
	{
		if (!obj) return null;
		return !Array.isArray(obj) ? [obj] : obj;
	};

	var p = TemplateModule.prototype;

	/**
	 * See if this modules satisfies the collection
	 * @method validate
	 * @param {array} haystack User selection of modules IDs
	 */
	p.validate = function(haystack)
	{
		var i, j, needle, orResult;

		for (i = 0; i < this.depends.length; i++)
		{
			needle = this.depends[i];

			// if the value is an array, do an OR commparision
			if (Array.isArray(needle))
			{
				orResult = false;
				for (j = 0; j < needle.length; j++)
				{
					if (haystack.indexOf(needle[j]) > -1)
					{
						orResult = true;
						break;
					}
				}
				if (!orResult)
				{
					throw this.name + " module requires one of these " +
						"modules: '" + needle.join("', '") + "'";
				}
			}
			else if (haystack.indexOf(needle) == -1)
			{
				throw this.name + " module requires '" + needle + "'";
			}
		}
	};

	// Assign to namespace
	namespace('springroll.new').TemplateModule = TemplateModule;

}());