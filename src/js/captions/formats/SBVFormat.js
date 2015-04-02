(function(){
	
	/**
	*  Save a captions object as SBV
	*  @class SBVFormat
	*  @namespace springroll.captions.formats  
	*/
	var SBVFormat = {};

	/**
	*  Convert captions array to SBV string
	*  @method format
	*  @static
	*  @param {array} captions The collection of captions
	*  @return {string} The formatted captions
	*/
	SBVFormat.format = function(captions)
	{
		var sbv = "",
			len = captions.length,
			caption;

		for(var i = 0; i < len; i++)
		{
			caption = captions[i];

			sbv += SBVFormat.toTimeCode(caption.start) + "," + 
					SBVFormat.toTimeCode(caption.end) + "\r\n";
			sbv += caption.content + "\r\n";
				
			if (i < len - 1) sbv += "\r\n";
		}
		return sbv;
	};

	/**
	*  Convert milliseconds to timecode H:MM:SS.mmm 
	*  @method toTimeCode
	*  @static
	*  @param {int} milliseconds
	*  @return {String} the formatted timecode
	*/
	SBVFormat.toTimeCode = function(milliseconds)
	{
		var seconds = milliseconds / 1000;
		var timecode;
		if (seconds >= 60)
		{
			timecode = seconds < 3600 ? "0:" : (seconds / 3600) + ":";
			seconds %= 3600;
			var min = parseInt(seconds / 60);
			seconds %= 60;
			timecode += (min < 10 ? "0" + min : min) + ":";
		}
		else
		{
			timecode = "0:00:";
		}
		timecode += seconds < 10 ? "0" + seconds.toFixed(3) : seconds.toFixed(3);
		return timecode;
	};

	// assign to namespace
	namespace('springroll.captions.formats').SBVFormat = SBVFormat;

}());