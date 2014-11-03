(function(undefined){

	/**
	*  Manage the timeline area
	*  @class Timeline
	*  @namespace springroll.captions 
	*  @constructor
	*  @param {string} selector The jquery select for the parent node
	*/
	var Timeline = function(selector)
	{
		this._onResizeCurrent = this._onResizeCurrent.bind(this);

		var dragOptions = {
			axis: "x",
			drag: this._onResizeCurrent,
			stop: this._onResizeCurrent
		};

		this.parent = $(selector).scroll(this._onScroll.bind(this));
		this.captions = $("#captions");
		this.removeButton = $("#removeButton");
		this.resizeLeft = $("#resizeLeft").draggable(dragOptions);
		this.resizeRight = $("#resizeRight").draggable(dragOptions);

		// Currently focused caption
		this.currentCaption = null;

		// function binds
		this.onCaptionsFocus = this.onCaptionsFocus.bind(this);
		this.blur = this.blur.bind(this);
		this.removeCurrent = this.removeCurrent.bind(this);
		this._onKeyUp = this._onKeyUp.bind(this);

		// Remove the current caption
		this.removeButton.click(this.removeCurrent);

		// Set the current 
		this.enabled = false;
		this.hideControls();

		$(document).mouseup(this._onBlur.bind(this));
	};

	// Reference to the prototype
	var p = Timeline.prototype;

	// The timeline rate in pixels per millseconds
	var RATE = 100 / 1000;

	// The min width
	var MIN_WIDTH = 75;

	/**
	*  The list of controls
	*  @property {array} CONTROLS_IDS
	*  @readOnly
	*  @static
	*/
	var CONTROLS_IDS = ['removeButton', 'resizeLeft', 'resizeRight'];

	/**
	*  Add a new caption to the timeline
	*  @method addCaption
	*  @param {string} text The text to add
	*  @param {int} [start] start time in milliseconds
	*  @param {int} [end] start time in milliseconds
	*  @param {boolean} [focus=false] if we should focus after adding
	*  @return {jquery} caption object
	*/
	p.addCaption = function(text, start, end, focus)
	{
		var textarea = $("<textarea class='form-control'></textarea>");
		textarea.text(text || "");

		// Handlers
		textarea.focus(this.onCaptionsFocus)
			.keyup(this._onKeyUp)
			.attr('disabled', !this._enabled);

		if (start !== undefined && end !== undefined)
		{
			textarea.css('left', start * RATE)
				.width((end - start) * RATE);
		}

		// Add to the list of captions
		this.captions.append(textarea);

		if (!!focus)
		{
			textarea.trigger('focus');
		}

		return textarea;
	};

	/**
	*  Key up handler for the textareas
	*  @method _onKeyUp
	*  @private
	*/
	p._onKeyUp = function(e)
	{
		if (e.keyCode == 27) // Esc
		{
			this.blur();
			e.preventDefault();
		}
		else if (e.keyCode == 46) // del
		{
			this.removeCurrent();
			e.preventDefault();
		}
	};

	/**
	*  Focus handler for the captions
	*  @method onCaptionsFocus
	*  @private
	*  @param {event} jquery focus event
	*/
	p.onCaptionsFocus = function(e)
	{
		if (this.currentCaption)
		{
			this.currentCaption.removeClass('current');
		}

		var textarea = $(e.currentTarget);
		var pos = textarea.position();
		var right = textarea.outerWidth() + pos.left;

		this.resizeLeft.show().css('left', pos.left);
		this.resizeRight.show().css('left', right - this.resizeRight.outerWidth());
		this.removeButton.show().css('left', right);

		this.currentCaption = textarea.addClass('current');
	};

	/**
	*  Drag event to resize the current element
	*  @method _onResizeCurrent
	*  @private
	*/
	p._onResizeCurrent = function()
	{
		var scrollLeft = this.parent.scrollLeft();
		var left = scrollLeft + this.resizeLeft.position().left;
		var right = scrollLeft + this.resizeRight.position().left + this.resizeRight.outerWidth();

		this.currentCaption.outerWidth(right - left).css('left', left);
		this.removeButton.css('left', right);
	};

	/**
	*  Get the current scroll position and updat background
	*  @method _onScroll
	*  @private
	*/
	p._onScroll = function()
	{
		this.parent.css('background-position-x', -1 * this.parent.scrollLeft());
	};

	/**
	*  Blur on clicking outside the target
	*  @method _onBlur
	*  @private
	*/
	p._onBlur = function(e)
	{
		// Cannot be a decent of parent
		if (this.parent.has(e.target).length === 0)
		{
			this.blur();
		}
	};

	/**
	*  Blur the current selection
	*  @method blur
	*/
	p.blur = function()
	{
		this.hideControls();
		if (this.currentCaption)
		{
			this.currentCaption.blur();
			this.currentCaption.removeClass('current');
		}
		this.currentCaption = null;
	};

	/**
	*  Hide the controls
	*  @method hideControls
	*/
	p.hideControls = function()
	{
		this.resizeLeft.hide();
		this.resizeRight.hide();
		this.removeButton.hide();
	};

	/**
	*  If we have a caption at the current time
	*  @method hasCaption
	*  @param {int} time The time in millseconds
	*/
	p.hasCaption = function(time)
	{
		// convert time to length
		time *= RATE;
		var captions = this.captions.find('textarea');
		var pos, caption;
		for (var i = 0; i < captions.length; i++)
		{
			caption = captions.eq(i);
			pos = caption.position();
			if (time >= pos.left && time <= pos.left + caption.outerWidth())
			{
				return caption;
			}
		}
		return null;
	};

	/**
	*  If the panel is enabled and ready to changed captions
	*  @property {boolean} enabled
	*/
	Object.defineProperty(p, 'enabled', {
		set: function(enabled)
		{
			this._enabled = enabled;

			this.parent.removeClass('disabled');
			var captions = this.captions.find('textarea')
				.attr('disabled', !enabled);

			if (!enabled)
			{
				this.parent.addClass('disabled');
				this.blur();
			}
		},
		get: function()
		{
			return this._enabled;
		}
	});

	/**
	*  Get the data representation for this
	*  @property {array} data
	*/
	Object.defineProperty(p, 'data', {
		get : function()
		{
			var data = [];
			this.captions.find('textarea').each(function(){
				var textarea = $(this);
				var content = textarea.val().trim().replace('/\n|\r/', '');

				// Block adding empty captions
				if (!content) return;
				
				var left = textarea.position().left;
				data.push({
					content: textarea.val(),
					start: (left / RATE) | 0,
					end: ((left + textarea.outerWidth()) / RATE) | 0
				});
			});
			return data;
		},
		set : function(lines)
		{
			this.removeAll();
			var self = this;
			_.each(lines, function(line){
				self.addCaption(
					line.content || "",
					line.start || 0,
					line.end || 2000
				);
			});
		}
	});

	/**
	*  Remove all the captions
	*  @method removeAll
	*/
	p.removeAll = function()
	{
		this.parent.scrollLeft(0);
		this.removeCurrent();
		this.captions.children()
			.off('keyup focus')
			.remove();
			
		this.enabled = false;
	};

	/**
	*  Remove the current caption
	*  @method removeCurrent
	*/
	p.removeCurrent = function()
	{
		var currentCaption = this.currentCaption;
		this.blur();
		if (currentCaption)
		{
			currentCaption.off('keyup focus').remove();
		}
	};

	// Assign to namespace
	namespace('springroll.captions').Timeline = Timeline;

}());
