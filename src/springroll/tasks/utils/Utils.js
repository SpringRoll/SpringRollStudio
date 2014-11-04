(function(){

	// Import node modules
	var md5 = require("MD5");
	var fs = require("fs");

	/**
	*  Basic app utilities
	*  @class Utils
	*  @namespace springroll.tasks
	*/
	var Utils = {};

	/** 
	*  The collection of templates for markup
	*  @static
	*  @property {dict} templates
	*  @private
	*/
	Utils.templates = {};

	/**
	*  Get the templates and do the subtitutions
	*  @method getTemplate
	*  @static
	*  @param {string} templateFileName The name of the template
	*  @param {object} obj The object to template
	*  @return {string} The templated string
	*/
	Utils.getTemplate = function(templateFileName, obj)
	{
		if (!Utils.templates[templateFileName])
		{
			var template = fs.readFileSync(
				"assets/templates/" + templateFileName + ".html",
				{encoding: "utf-8"}
			);

			Utils.templates[templateFileName] = template;
			return _.template(template)(obj);
		}
		else
		{
			return _.template(Utils.templates[templateFileName])(obj);
		}
	};

	/**
	*  Get a unique id hash for a string
	*  @method uid
	*  @static
	*  @param {string} str The string to hash
	*  @return {string} The hashed string
	*/
	Utils.uid = function(str)
	{
		return md5((new Date().toISOString() + str)
			.toLowerCase()
			.replace(/\\/gi, '/'))
			.substr(8, 8);
	};

	// Assign to the global space
	namespace('springroll.tasks').Utils = Utils;

}());