(function(){

	// Library depencencies
	var Application = include('springroll.Application');

	/**
	*  The main class of _name_
	*  @class _className_
	*  @extends springroll.Application
	*/
	var _className_ = function()
	{
		Application.call(this, {
			resizeElement: window,
			canvasId: "stage",
			display: _displayClass_,
			framerate: "framerate",
			debug: DEBUG,
			cacheBust: DEBUG,
			parseQueryString: DEBUG,
			displayOptions:	{
				clearView: true,
			}
		});
	};

	// Extend the base game class
	var p = extend(_className_, Application);

	// Create instance
	window.app = new _className_();
	
}());