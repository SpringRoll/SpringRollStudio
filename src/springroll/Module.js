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
	*  @param {Element} dom The DOM element link
	*/
	var Module = function(dom)
	{
		/**
		*  The reference to the DOM link
		*  @property {Element} dom
		*/
		this.dom = dom;

		// jquery object
		var link = $(dom).click(this._onOpen.bind(this));

		/**
		*  The default window size
		*  @property {object} defaultSize
		*/
		this.defaultSize = {
			width: link.data('width'),
			height: link.data('height'),
			minWidth: link.data('min-width'),
			minHeight: link.data('min-height')
		};

		/**
		*  The current opened window
		*  @property {nw.gui.Window} win
		*/
		this.win = null;
	};

	// Reference to the prototype
	var p = Module.prototype;

	/**
	*  When the link is clicked to open the window
	*  @method  _onOpen
	*  @private
	*/
	p._onOpen = function(e)
	{
		e.preventDefault();

		// If the window is opened, focus on it
		if (this.win)
		{
			this.win.focus();
			this._onFocus();
			return;
		}

		// Get the size from saved settings or get the default size
		var size = JSON.parse(localStorage.getItem(this.dom.id) || 'null') || this.defaultSize;

		// The node-webkit window options
		var options = {
			title: this.dom.title,
			resizable: true,
			width: size.width,
			height: size.height,
			toolbar: false,
			frame: true,
			fullscreen: false,
			show: false
		};

		// Move the window if we have coordinates
		if (size.x !== undefined && size.y !== undefined)
		{
			options.x = size.x;
			options.y = size.y;
		}
		else
		{
			options.position = "center";
		}

		// The minimum window size
		if (this.defaultSize.minWidth !== undefined)
		{
			options.min_width = this.defaultSize.minWidth;
		}

		// The maximum window size
		if (this.defaultSize.minHeight !== undefined)
		{
			options.min_height = this.defaultSize.minHeight;
		}

		// Open a new window
		this.win = gui.Window.open(this.dom.href, options);

		// Add a listener when the window closes to save the position
		this.win.on('close', this._onClose.bind(this));
		this.win.on('loaded', this._onLoaded.bind(this));
		this.win.on('focus', this._onFocus.bind(this));
	};

	/**
	*  When the window is finished loading
	*  @method  _onLoaded
	*  @private
	*/
	p._onLoaded = function()
	{
		this.win.show();
		this.win.focus();
	};

	/**
	*  On focus window event
	*  @method  _onLoaded
	*  @private
	*/
	p._onFocus = function()
	{
		this.win.window.module.focus();
	};

	/**
	*  When the module's window is closing
	*  @method _onClose
	*  @private
	*/
	p._onClose = function()
	{
		localStorage.setItem(this.dom.id, JSON.stringify({
			width : this.win.width,
			height : this.win.height,
			x : this.win.x,
			y : this.win.y
		}));

		// Close the window
		this.close();
	};

	/**
	*  Close the module's window
	*  @method  close
	*/
	p.close = function(force)
	{
		if (this.win)
		{
			// Close the module contents
			this.win.window.module.close();

			this.win.close(force);
			this.win = null;
		}
	};

	// Assign to namespace
	namespace('springroll').Module = Module;

}(jQuery));