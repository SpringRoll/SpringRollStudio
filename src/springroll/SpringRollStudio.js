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
			var gui = require('nw.gui');
			this.menu = new gui.Menu({ type: 'menubar' });

			// Create the standard OSX menu
			if (process.platform === "darwin")
			{
				this.menu.createMacBuiltin("SpringRoll Studio", {
					hideEdit: true,
					hideWindow: true
				});
			}

			this.main.on('focus', this._onFocus.bind(this));
			this._onFocus();

			// Add the modules
			$(".modules a").each(function(){
				modules.push(new Module(this));
			});
		}
	};

	// Reference to the prototype
	var p = SpringRollStudio.prototype = Object.create(NodeWebkitApp.prototype);

	/**
	*  Re-add the menu on focus
	*  @method _onFocus
	*  @private
	*/
	p._onFocus = function()
	{
		this.main.menu = this.menu;
	};

	/**
	*  Called when the application is quit. Should do any cleanup here to be safe.
	*  @method close
	*/
	p.close = function()
	{
		// close any modules
		for (var i = 0; i < this.modules.length; i++)
		{
			this.modules[i].close(true);
		}
		this.modules = null;
	};

	// Assign to namespace
	//namespace("springroll").SpringRollStudio = SpringRollStudio;

	// Create the application
	$(function(){ window.app = new SpringRollStudio(); });

}(jQuery));