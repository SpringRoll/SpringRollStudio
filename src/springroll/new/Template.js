(function(){
	
	var Module = include('springroll.new.Module');

	/**
	*  A single template
	*  @class Template
	*  @namespace springroll.new
	*  @constructor
	*  @param {object} json JSON data to construct
	*/
	var Template = function(json)
	{
		/**
		 * The path to the source directory
		 * @property {string} path
		 */
		this.path = null;

		/**
		 * The human-readable name
		 * @property {string} name
		 */
		this.name = null;

		/**
		 * The bundle id for this template
		 * @property {string} id
		 */
		this.id = null;

		/**
		 * The semver version of this template
		 * @property {string} version
		 */
		this.version = null;

		/**
		 * The array of local files to remove
		 * @property {array} remove
		 */
		this.remove = null;

		/**
		 * Files to rename where key is the original and value
		 * is the output (renamed) file
		 * @property {object} rename
		 */
		this.rename = null;

		/**
		 * Template to extend to
		 * @property {string} extend
		 */
		this.extend = null;

		/**
		 * The modules that define this template
		 * @property {object} modules
		 */
		this.modules = {};

		this.fromJSON(json);
	};

	// reference to the prototype
	var p = Template.prototype;

	/**
	 * Convert from JSON
	 * @method fromJSON
	 * @param {object} data The raw JSON data
	 */
	p.fromJSON = function(data)
	{
		for(var prop in data)
		{
			// Convert the modules into Module object
			if (prop == "modules")
			{
				for(var id in data.modules)
				{
					this.modules[id] = new Module(id, data.modules[id]);
				}
			}
			// Other files just straight convert
			else if (this.hasOwnProperty(prop))
			{
				this[prop] = data[prop];
			}
		}
	};

	// Assign to namespace
	namespace('springroll.new').Template = Template;

}());