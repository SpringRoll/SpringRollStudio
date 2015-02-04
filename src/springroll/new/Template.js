(function(){
	
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

		this.fromJSON(json);
	};

	// reference to the prototype
	var p = Template.prototype;

	/**
	 * Convert to JSON
	 * @method toJSON
	 * @return {object} JSON ready object
	 */
	p.toJSON = function()
	{
		return {
			path: this.path,
			name: this.name,
			id: this.id,
			extend: this.extend,
			rename: this.rename,
			remove: this.remove,
			__classname: 'springroll.new.Template'
		};
	};

	/**
	 * Convert from JSON
	 * @method fromJSON
	 * @param {object} data The raw JSON data
	 */
	p.fromJSON = function(data)
	{
		for(var prop in data)
		{
			if (this.hasOwnProperty(prop))
			{
				this[prop] = data[prop];
			}
		}
	};

	// Assign to namespace
	namespace('springroll.new').Template = Template;

}());