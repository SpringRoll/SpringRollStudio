(function($, undefined){

	// Import classes
	var NodeWebkitApp = cloudkid.NodeWebkitApp,
		Module = springroll.Module;

	/**
	*  Node Webkit Application
	*  @class SpringRollStudio
	*  @extends cloudkid.NodeWebkitApp
	*/
	var SpringRollStudio = function()
	{
		NodeWebkitApp.call(this);

		var modules = this.modules = [];

		if (APP)
		{
			// Create the standard OSX menu
			if (process.platform === "darwin")
			{	
				var gui = require('nw.gui');
				var menu = new gui.Menu({ type: 'menubar' });
				menu.createMacBuiltin("SpringRollStudio");
				gui.Window.get().menu = menu;
			}

			// Add the modules
			$(".modules a").each(function(){
				modules.push(new Module(this));
			});
		}
	};

	// Reference to the prototype
	var p = SpringRollStudio.prototype = Object.create(NodeWebkitApp.prototype);

	/**
	*  Called when the application is quit. Should do any cleanup here to be safe.
	*  @method close
	*/
	p.close = function()
	{
		// close any modules
		for (var i = 0; i < this.modules.length; i++)
		{
			this.modules[i].close();
		}
		this.modules = null;
	};

	// Assign to namespace
	//namespace("springroll").SpringRollStudio = SpringRollStudio;

	// Create the application
	$(function(){ window.app = new SpringRollStudio(); });

}(jQuery));