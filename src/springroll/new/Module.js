(function(){
	
	/**
	*  A module attached to a template
	*  @class Module
	*  @namespace springroll.new
	*  @constructor
	*  @param {string} id The unique module ID
	*  @param {object} json JSON data to construct
	*/
	var Module = function(id, json)
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
		this.name = null;

		/**
		 * The list of release library files
		 * @property {array} libraries
		 */
		this.libraries = null;

		/**
		 * The list of debug library files
		 * @property {array} librariesDebug
		 */
		this.librariesDebug = null;

		/**
		 * The Bower dependencies
		 * @property {object} bower
		 */
		this.bower = null;

		/**
		 * The other modules this depends on
		 * @property {Array} depends
		 */
		this.depends = null;

		this.fromJSON(json);
	};

	// reference to the prototype
	var p = Module.prototype;

	/**
	 * Convert from JSON
	 * @method fromJSON
	 * @param {object} data The raw JSON data
	 */
	p.fromJSON = function(data)
	{
		this.name = data.name;
		this.libraries = toArray(data.libraries);
		this.librariesDebug = toArray(data.librariesDebug) || this.libraries;
		this.depends = toArray(data.depends);
		this.bower = data.bower;
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
		if (!obj) return;
		return !Array.isArray(obj) ? [obj] : obj;
	};

	// Assign to namespace
	namespace('springroll.new').Module = Module;

}());