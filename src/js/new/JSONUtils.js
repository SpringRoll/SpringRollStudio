(function(){
	
	if (APP)
	{
		var fs = require('fs');
	}
	
	/**
	 * JSON utiltities for interacting with JSON objects
	 * @class JSONUtils
	 * @namespace  springroll.new
	 */
	var JSONUtils = {};

	/**
	*  Read a JSON file
	*  @method read
	*  @static
	*  @param {string} filePath The file name
	*  @return {obj} The JSON object
	*/
	JSONUtils.read = function(filePath)
	{
		return JSON.parse(fs.readFileSync(filePath));
	};

	/**
	*  Write a JSON file
	*  @method write
	*  @static
	*  @param {string} file The file name
	*  @param {object} obj The object to update
	*/
	JSONUtils.write = function(filePath, obj)
	{
		fs.writeFileSync(filePath, JSON.stringify(obj, null, "\t"));
	};

	// Assign to namespace
	namespace('springroll.new').JSONUtils = JSONUtils;

}());