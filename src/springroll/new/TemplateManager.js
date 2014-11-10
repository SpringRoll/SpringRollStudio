(function($){
	
	if (APP)
	{
		var fs = require('fs');
		var path = require('path');
		var gui = require('nw.gui');
		var ncp = require('ncp').ncp;
		var mkdirp = require('mkdirp').sync;
	}

	var Browser = cloudkid.Browser;

	/**
	*  Class for managing the templates
	*  @class TemplateManager
	*  @namespace springroll.new
	*/
	var TemplateManager = function()
	{
		/**
		*  The select element
		*  @property {jquery} _select
		*  @private
		*/
		this._select = $("#templates");

		/**
		*  The modal element
		*  @property {jquery} _modal
		*  @private
		*/
		this._modal = $("#templateModal")
			.on('hidden.bs.modal', this.reset.bind(this));

		/**
		*  The button element
		*  @property {jquery} _button
		*  @private
		*/
		this._button = $("#templateButton").click(this.addTemplate.bind(this));

		// Turn off all file dragging
		$(document.body).on("dragover drop", function(e){
			e.preventDefault();
			return false;
		});

		var self = this;

		// Setup the drop zone for the new templates
		var drop = this.dropTemplate = $("#dropTemplate")
			.click(function(){
				Browser.folder(function(path){
					self.reset();
					self.validate(path);
				});
			})
			.on("dragenter", function(ev){
				ev.preventDefault();
				drop.addClass(DRAG_CLASS);
			})
			.on("dragover", function(ev){
				ev.preventDefault();
				if(!drop.hasClass(DRAG_CLASS))
					drop.addClass(DRAG_CLASS);
			})
			.on("dragleave", function(ev){
				ev.preventDefault();
				drop.removeClass(DRAG_CLASS);
			})
			.on("drop", function(ev){
				ev.preventDefault();
				self.reset();

				var fileList = ev.originalEvent.dataTransfer.files;
				if (fileList.length > 1)
				{
					self.error("Only one template at a time.");
					return;
				}

				// Select the first entry
				var file = fileList[0];

				// Directories only!
				if (APP)
				{
					if (!fs.lstatSync(file.path).isDirectory())
					{
						self.error("Folders only. Please drag a project folder.");
						return;
					}
					self.validate(file.path);
				}
			});
		
		// Get the list of templates
		this.load();
	};

	// Reference to the prototype
	var p = TemplateManager.prototype;

	// The class name for when dragging a file
	var DRAG_CLASS = "dragging";

	// The class name when a folder has been found
	var FOLDER_CLASS = "has-folder";

	// Has an error
	var ERROR_CLASS = "has-error";

	// The springroll template configuration
	var TEMPLATE_FILE = "springroll-template.json";

	/**
	*  Validate a template
	*  @method  validate
	*  @param  {string} path The folder path to add
	*/
	p.validate = function(folder)
	{
		var configFile = path.join(folder, TEMPLATE_FILE);
		if (!fs.existsSync(configFile))
		{
			this.error("Not a valid template.");
			return;
		}
		this.reset();
		this.dropTemplate.addClass(FOLDER_CLASS)
			.data('folder', folder)
			.find('.folder').text(folder);
	};

	/**
	*  Add the template
	*  @method addTemplate
	*  @private
	*/
	p.addTemplate = function()
	{
		var folder = this.dropTemplate.data('folder');

		// Check that there's a template to add
		if (!folder)
		{
			this.error("No template to add, drag-and-drop template folder.");
			return;
		}

		var config = JSON.parse(
			fs.readFileSync(
				path.join(folder, TEMPLATE_FILE)
			)
		);

		// 1. Check for existing template
		var templatePath = path.join(gui.App.dataPath, 'Templates', config.name);
		
		// Check for existing
		if (fs.existsSync(templatePath))
		{
			// Ask if we should proceed
			if (!confirm("Do you want to replace the existing template " + config.name + "?"))
			{
				return;
			}
		}

		// Create the folder
		mkdirp(templatePath);
		
		var self = this;

		// Copy the files
		ncp(
			folder, 
			templatePath, 
			function(err)
			{
				if (err)
				{
					self.error("Error copying: " + err);
					return;
				}

				// Add template
				self.templates[templatePath] = config;
				self.save();

				// Add to the selection list
				self.append(templatePath, config.name);

				// Dismiss the modal
				self._modal.modal('hide');

				// Clear everything
				self.reset();
			}
		);
	};

	/**
	*  Reset the drop zone
	*  @method reset
	*  @private
	*/
	p.reset = function()
	{
		this.dropTemplate
			.removeClass(DRAG_CLASS)
			.removeClass(FOLDER_CLASS)
			.removeClass(ERROR_CLASS)
			.removeData('path')
			.find('.error').text("");
	};

	/**
	*  Show a template error
	*  @method error
	*  @private
	*/
	p.error = function(message)
	{
		this.dropTemplate.addClass(ERROR_CLASS)
			.find('.error').text(message);
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
			// Default template path
			var folder = path.resolve('.', 'assets', 'templates', 'default');

			this.templates = {};
			this.templates[folder] = JSON.parse(
				fs.readFileSync(
					path.join(folder, TEMPLATE_FILE)
				)
			);
			this.save();
		}

		if (DEBUG)
		{
			console.log("TEMPLATES");
			console.log(this.templates);
		}
		// Load the existing templates
		for(var dir in this.templates)
		{
			this.append(dir, this.templates[dir].name);
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