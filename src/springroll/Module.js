(function($, undefined){

	if (APP)
	{
		var gui = require('nw.gui');
	}

	/**
	*  The module is a sub-section of the app
	*  @class Module
	*  @namespace springroll
	*  @constructor
	*/
	var Module = function()
	{
		/**
		*  The main window
		*  @property {nw.gui.Window} main
		*/
		this.main = null;

		if (APP)
		{
			this.main = gui.Window.get();
			this.main.on('close', this.shutdown.bind(this));
		}		
	};

	/**
	*  Construct the new module on load
	*  @method create
	*  @static
	*  @param {funtion} func The module to create
	*/
	Module.create = function(func)
	{
		$(function(){ window.module = new func(); });
	};

	// Reference to the prototype
	var p = Module.prototype;

	/**
	*  When this module is focused in
	*  @method focus
	*/
	p.focus = function()
	{
		// override
	};

	/**
	*  When this window is being closed
	*  @method shutdown
	*  @param {event} e The event to prevent default
	*/
	p.shutdown = function()
	{
		this.close(true);
	};

	/**
	*  Actually force-close close the window
	*  @method close
	*  @param {Boolean} [force=false] To force close
	*/
	p.close = function(force)
	{
		this.main.close(force);
		this.main = null;
	};

	// Assign to namespace
	namespace('springroll').Module = Module;

}(jQuery));