(function($, undefined){
	
	if (APP)
	{
		var gui = require('nw.gui');
	}

	/**
	*  The module is a sub-section of the app
	*  @class ModuleButton
	*  @namespace springroll
	*  @constructor
	*  @param {Element} dom The DOM element link
	*  @param {springroll.SpringRollStudio} app Reference to the app
	*/
	var ModuleButton = function(dom, app)
	{
		/**
		*  The reference to the DOM link
		*  @property {Element} dom
		*/
		this.dom = dom;

		/**
		 * The parent main app
		 * @property {springroll.SpringRollStudio} parent
		 */
		this.parent = app;

		// jquery object
		var link = $(dom).click(this._onOpen.bind(this));

		/**
		*  The default window size
		*  @property {object} defaultSize
		*/
		var resizable = link.data('resizable');
		this.defaultSize = {
			width: link.data('width'),
			height: link.data('height'),
			minWidth: link.data('min-width'),
			minHeight: link.data('min-height'),
			resizable: resizable !== undefined ? (resizable === true || resizable === "true") : true
		};

		/**
		*  The current opened window
		*  @property {nw.gui.Window} main
		*/
		this.main = null;
	};

	// Reference to the prototype
	var p = ModuleButton.prototype;

	/**
	*  When the link is clicked to open the window
	*  @method  _onOpen
	*  @private
	*/
	p._onOpen = function(e)
	{
		e.preventDefault();

		// If the window is opened, focus on it
		if (this.main)
		{
			this.main.focus();
			return;
		}

		// Get the size from saved settings or get the default size
		var size = JSON.parse(localStorage.getItem(this.dom.id) || 'null') || this.defaultSize;
		var resizable = this.defaultSize.resizable;

		// The node-webkit window options
		var options = {
			title: this.dom.title,
			resizable: resizable,
			toolbar: false,
			frame: true,
			fullscreen: false,
			show: false
		};

		if (resizable)
		{
			options.width = size.width;
			options.height = size.height;

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
		}
		else
		{
			options.width = this.defaultSize.width;
			options.height = this.defaultSize.height;
		}

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

		// Open a new window
		this.main = gui.Window.open(this.dom.href, options);

		// Add a listener when the window closes to save the position
		this.main.on('close', this._onClose.bind(this));
		this.main.on('closed', this._onClosed.bind(this));
		
		this.main.on('focus', onFocus);
		this.main.on('loaded', function()
		{
			// For some reason children windows that are opened
			// count the top frame as part of the height
			// we'll reset the height before we show
			this.height = options.height;
			
			this.show();
			this.focus();
		});
	};

	/**
	*  On focus window event
	*  @method  onFocus
	*  @private
	*/
	var onFocus = function()
	{
		if (this.window.appModule)
		{
			this.window.appModule.focus();
		}
		else
		{
			console.error("Unable to find appModule on window");
		}
	};

	/**
	 * Close the module
	 * @method close
	 * @param {boolean} [force=false] If we should force the close
	 */
	p.close = function(force)
	{
		if (this.main)
		{
			this.main.close(force);
		}
	};

	/**
	*  Upon closing save the window
	*  @method _onClose
	*  @private
	*/
	p._onClose = function()
	{
		localStorage.setItem(this.dom.id, JSON.stringify({
			width : this.main.width,
			height : this.main.height,
			x : this.main.x,
			y : this.main.y
		}));
	};

	/**
	*  When the module's window is closing
	*  @method _onClosed
	*  @private
	*/
	p._onClosed = function()
	{
		this.main = null;
	};

	// Assign to namespace
	namespace('springroll').ModuleButton = ModuleButton;

}(jQuery));