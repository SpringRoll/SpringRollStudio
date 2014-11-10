(function(window){

	// Default options
	var options = {
		fps: 24,
		resizeElement: window,
		canvasId: "stage",
		display: _displayClass_,
		displayOptions:	{
			clearView: true,
		}
	};

	if (DEBUG)
	{
		// Add debut options
		options.debug = true;
		options.cacheBust = true;
		options.parseQueryString = true;

		// Create the framerate container
		options.framerate = "framerate";
		var stage = document.getElementById("stage");
		var framerate = document.createElement("div");
		framerate.id = "framerate";
		framerate.innerHTML = "FPS: 00.000";
		stage.parentNode.insertBefore(framerate, stage);
	}

	// Create the new application
	window.app = new _namespace_._className_(options);
	
}(window));