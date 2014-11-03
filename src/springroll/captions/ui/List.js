(function(){

	// Import classes
	var Browser = cloudkid.Browser;

	/**
	*  The list of aliases
	*  @class List
	*  @namespace springroll.captions 
	*  @constructor
	*  @param {string} selector The jquery select for the parent node
	*/
	var List = function(selector)
	{
		this.parent = $(selector);
		this._onSelect = this._onSelect.bind(this);

		this.filename = $("#filename");

		/**
		*  The currently selected button
		*  @property {jquery} current
		*/
		this.current = null;

		// Set the context menu settings
		// these don't change for each item
		// so we'll only create it once
		contextMenu = {
			menuSelector: "#aliasMenu",
			menuOpened: this.menuItemOpened.bind(this),
			menuSelected: this.menuItemSelected.bind(this)
		};
	};

	// Reference to the prototype
	var p = List.prototype;

	/**
	*  List item context menu settings
	*  @property {object} contextMenu
	*  @private
	*/
	var contextMenu;

	/**
	*  Handler when a context menu is opened
	*  @method menuItemOpened
	*  @private
	*  @param {jquery} button The jquery button element
	*/
	p.menuItemOpened = function(button)
	{
		var src = button.data('src');

		if (src)
		{
			if (APP)
			{
				var path = require('path');
				src = path.basename(src);
			}
			if (WEB)
			{
				var index = src.lastIndexOf("/");
				if (index > -1)
					src = src.substr(index + 1);
			}
		}
		else
		{
			src = "[no audio file]";
		}

		this.filename.html(src);
	};

	/**
	*  Handler when a menu item is selected
	*  @method menuItemSelected
	*  @private
	*  @param {jquery} button The jquery button element
	*  @param {jquery} menuItem The menu item selected
	*/
	p.menuItemSelected = function(button, menuItem)
	{
		var alias = button.text();
		switch(menuItem.text())
		{
			case "Rename" :
			{
				var newAlias = prompt("Rename the alias", alias);
				if (newAlias && newAlias !== alias)
				{
					if (this.getButton(newAlias).length)
					{
						throw "Button already matches with alias '"+newAlias+"'";
					}
					button.text(newAlias)
						.attr('data-alias', newAlias)
						.data('alias', newAlias);
					this.parent.trigger('change', [alias, newAlias]);
				}
				break;
			}
			case "Delete" :
			{
				if (confirm("Are you sure you want to delete '" + alias + "'?"))
				{
					this.parent.trigger('delete', [alias]);
				}
				break;
			}
			case "Choose Audio..." :
			{
				this.parent.trigger('selectAudioSrc', [
					alias,
					button.data('status') == -2,
					button
				]);
				break;
			}
		}
	};

	/**
	*  Remove all items
	*  @method removeAll
	*/
	p.removeAll = function()
	{
		// Remove all elements
		this.parent.find('button').off('click');
		this.parent.empty();

		// Remove current selected
		this.current = null;
	};

	/**
	*  Remove the current selected item
	*  @method remove
	*/
	p.remove = function(alias)
	{
		this.getButton(alias).off('click').remove();
		if (this.current && this.current.data('alias') == alias)
		{
			this.current = null;
		}
	};

	/**
	*  Deselect the button
	*  @method delect a button by alias
	*  @param {string} alias The caption alias
	*  @return {boolean} If it was successfully deselected
	*/
	p.deselect = function(alias)
	{
		if (this.current && this.current.data('alias') == alias)
		{
			this.current.removeClass('active');
			this.current = null;
			return true;
		}
		return false;
	};

	/**
	*  Get a button by alias
	*  @method getButton
	*  @param {string} alias The alias to search for
	*/
	p.getButton = function(alias)
	{
		return $("button[data-alias='"+alias+"']");
	};

	/**
	*  Add an item to the display
	*  @method addAlias
	*  @param {string} alias The caption alias
	*  @param {int} status 0 = no captions, 1 = has captions, -1 = no audio file, -2 = no asset connection
	*  @param {string} src Audio file location
	*/
	p.addAlias = function(alias, status, src)
	{
		// check that file exists!
		var button = $("<button></button>")
			.addClass("btn btn-sm")
			.html(alias)
			.attr('data-alias', alias)
			.data('alias', alias)
			.data('status', status)
			.data('src', src)
			.click(this._onSelect)
			.contextMenu(contextMenu);

		resetStatus(button);

		this.parent.append(button);
	};

	/**
	*  Get the current status by alias
	*  @method setStatus
	*  @param {string} alias the name of the alias
	*  @param {int} The status
	*/
	p.setStatus = function(button, status)
	{
		button.data('status', status);
		resetStatus(button);
	};

	/**
	*  Refresh the button status style
	*  @method resetStatus
	*  @private
	*  @param {jquery} button The button object
	*/
	var resetStatus = function(button)
	{
		var c;
		switch(button.data('status'))
		{
			case -2 :
			case -1 : c = "btn-danger"; break;
			case 0 : c = "btn-default"; break;
			case 1 : c = "btn-success"; break;
		}
		button.removeClass("btn-success btn-default btn-danger")
			.addClass(c);
	};

	/**
	*  Clicking on an item
	*  @method _onSelect
	*  @private
	*/
	p._onSelect = function(e)
	{
		if (this.current)
		{
			this.current.removeClass('active');
		}

		var button = $(e.currentTarget),
			src = button.data('src'),
			status = button.data('status'),
			alias = button.data('alias');

		if (status < 0)
		{
			var message = !src ?
				"No audio file found for this caption. Locate it?" :
				"Unable to locate audio file '" + src + "' for asset '" + alias + "'. Locate it?";

			if (confirm(message))
			{
				this.parent.trigger('selectAudioSrc', [alias, status == -2]);
			}
			return;
		}

		// Remove any custom class and set as selected
		button.addClass("active").blur();

		resetStatus(button);

		// Fire the event
		this.parent.trigger('selectAlias', [alias]);

		this.current = button;
	};

	// Assign to namespace
	namespace('springroll.captions').List = List;

}());
