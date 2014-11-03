(function(){
	
	/**
	*  Save a captions object as XML
	*  @class XMLFormat
	*  @namespace springroll.captions.formats  
	*/
	var XMLFormat = {};

	/**
	*  Convert captions array to XML string
	*  @method format
	*  @static
	*  @param {array} captions The collection of captions
	*  @return {string} The formatted captions
	*/
	XMLFormat.format = function(captions)
	{
		var xml = "", 
			len = captions.length,
			caption;

		for(var i = 0; i < len; i++)
		{
			caption = captions[i];

			xml += "\t\t<line startTime=\""+caption.start+"\" endTime=\""+caption.end+"\">\r\n";
			xml += "\t\t\t<![CDATA[" + caption.content + "]]>\r\n";
			xml += "\t\t</line>\r\n";
		}
		return xml;
	};

	/**
	*  Convert a dictionary of all captions
	*  @method formatAll
	*  @static
	*  @param {dictionary} dictionary The map of all captions
	*  @return {string} XML formatted string
	*/
	XMLFormat.formatAll = function(dictionary)
	{
		var captions;
		var xml = "<captions>\r\n";
		for (var alias in dictionary)
		{
			captions = dictionary[alias];

			if (captions)
			{
				captions = captions.lines || captions.lines;

				if (!Array.isArray(captions) || !captions.length) continue;

				xml += "\t<caption alias=\""+alias+"\">\r\n";
				xml += XMLFormat.format(captions);
				xml += "\t</caption>\r\n";
			}
		}
		xml += "</captions>";
		return xml;
	};

	// assign to namespace
	namespace('springroll.captions.formats').XMLFormat = XMLFormat;

}());