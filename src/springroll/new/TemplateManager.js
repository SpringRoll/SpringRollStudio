(function($){
	
	if (APP)
	{
		var fs = require('fs');
		var path = require('path');
		var gui = require('nw.gui');
	}

	/**
	*  Class for managing the templates
	*  @class TemplateManager
	*  @namespace springroll.new
	*  @constructor
	*  @param {string} select Jquery selector for the <select> dom element
	*  @param {string} modal Jquery selector for the modal element
	*  @param {string} button Jquery selector for the accept button
	*/
	var TemplateManager = function(select, modal, button)
	{
		/**
		*  The select element
		*  @property {jquery} _select
		*  @private
		*/
		this._select = $(select);

		/**
		*  The modal element
		*  @property {jquery} _modal
		*  @private
		*/
		this._modal = $(modal);

		/**
		*  The button element
		*  @property {jquery} _button
		*  @private
		*/
		this._button = $(button).click(this._addTemplate.bind(this));

		// Get the list of templates
		this.load();
	};

	// Reference to the prototype
	var p = TemplateManager.prototype;

	/**
	*  Add the template
	*  @method _addTemplate
	*  @private
	*/
	p._addTemplate = function()
	{
		// List for adding the template:
		//    1. Check for existing template
		//    1a. If found, compare version
		//    1b. Confirm replace
		//    2. Copy the local template to: gui.App.dataPath
		//    3. Save this.templates
		//    4. Add new select option

		// Dismiss the modal
		this._modal.modal('hide');
	};

	/**
	*  Add a template to the list of templates
	*  @method append
	*  @param {string} dir The path to the template
	*/
	p.append = function(dir, name)
	{
		// Deselect all items
		this._select.find('option').removeProp('selected');

		// Add the new option
		var option= $('<option value="' + dir + '">').text(name);

		// Auto select new items
		option.prop('selected', true);

		this._select.append(option);
	};

	/**
	*  Save the current set of templates
	*  @method save
	*/
	p.save = function()
	{
		localStorage.setItem('templates', JSON.stringify(this.templates));
	};

	/**
	*  Load the saved templates
	*  @method load
	*/
	p.load = function()
	{
		try
		{
			this.templates = JSON.parse(localStorage.getItem('templates'));
		}
		catch(e){}

		if (!this.templates)
		{
			this.templates = {};
			this.templates[path.resolve('.', 'assets', 'templates', 'default')] = "Default";
			this.save();
		}

		// Load the existing templates
		for(var dir in this.templates)
		{
			this.append(dir, this.templates[dir]);
		}
	};

	/**
	*  Get the currently selected template
	*  @method current
	*  @return {string} Path to the source files
	*/
	p.val = function()
	{
		return this._select.val();
	};

	// Assign to namespace
	namespace('springroll.new').TemplateManager = TemplateManager;

}(jQuery));