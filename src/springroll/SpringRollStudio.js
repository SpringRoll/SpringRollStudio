(function($, undefined){

	if (APP)
	{
		var gui = require('nw.gui');
	}

	// Import classes
	var NodeWebkitApp = cloudkid.NodeWebkitApp,
		ModuleButton = springroll.ModuleButton;

	/**
	*  Node Webkit Application
	*  @class SpringRollStudio
	*  @extends cloudkid.NodeWebkitApp
	*/
	var SpringRollStudio = function()
	{
		NodeWebkitApp.call(this, 0.25); // update blocker: 15 minutes

		var modules = this.modules = [];

		if (APP)
		{
			this.menu = new gui.Menu({ type: 'menubar' });

			if (process.platform === "darwin")
			{
				this.menu.createMacBuiltin("SpringRoll Studio", {
					hideEdit: true,
					hideWindow: true
				});
			}

			this.main.on('focus', this.focus.bind(this));
			this.focus();

			var main = this.main;

			// Add the modules
			$(".modules a").each(function(){
				modules.push(new ModuleButton(this, main));
			});
		}
	};

	// Reference to the prototype
	var p = SpringRollStudio.prototype = Object.create(NodeWebkitApp.prototype);

	/**
	*  Re-add the menu on focus
	*  @method focus
	*  @private
	*/
	p.focus = function()
	{
		this.main.menu = this.menu;
	};

	// Create the application
	$(function(){ window.app = new SpringRollStudio(); });

}(jQuery));