(function(){
	
	var _ = include('_');

	/**
	*  A module attached to a template
	*  @class TemplateModule
	*  @namespace springroll.new
	*  @constructor
	*  @param {string} id The unique module ID
	*  @param {object} data JSON data to construct
	*/
	var TemplateModule = function(id, data)
	{
		/**
		 * The bundle id for this template
		 * @property {string} id
		 */
		this.id = id;

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
		this.depends = toArray(data.depends);

		/**
		 * If the module is required
		 * @property {boolean} required
		 */
		this.required = _.isUndefined(data.required) ? false : data.required;
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

	// Assign to namespace
	namespace('springroll.new').TemplateModule = TemplateModule;

}());