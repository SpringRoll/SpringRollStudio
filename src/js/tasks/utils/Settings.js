(function(){

	/**
	*  For storing and retrieving data
	*  @class Settings
	*  @namespace springroll.tasks
	*/
	var Settings = {};

	/**
	*  Save the window settings
	*  @method saveWindow
	*  @static
	*  @param {String} alias The alias for the window
	*  @param {Window} win Node webkit window object
	*  @param {Boolean} [isTerminal=false] If we're setting the terminal window 
	*/
	Settings.saveWindow = function(alias, win)
	{
		localStorage[alias] = JSON.stringify({
			width : win.width,
			height : win.height,
			x : win.x,
			y : win.y
		});
	};

	/**
	*  Load the window to the saved size
	*  @method loadWIndow
	*  @static
	*  @param {String} alias The alias for the window
	*  @param {Window} win The GUI window object
	*/
	Settings.loadWindow = function(alias, win)
	{
		var rect;
		try
		{
			rect = JSON.parse(localStorage[alias] || 'null');
		}
		catch(e)
		{
			alert('Error Reading Spock Window! Reverting to defaults.');
		}
		if (rect)
		{
			win.width = rect.width;
			win.height = rect.height;
			win.x = rect.x;
			win.y = rect.y;
		}
	};

	// Assign to global space
	namespace('springroll.tasks').Settings = Settings;
	
})();