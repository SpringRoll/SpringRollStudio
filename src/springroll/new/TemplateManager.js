(function($){
	
	if (APP)
	{
		var fs = require('fs-extra');
		var path = require('path');
		var gui = require('nw.gui');
		var semver = require('semver');
		var http = require('http');
		var request = require('request');
		var AdmZip = require('adm-zip');
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
		*  The select element
		*  @property {jquery} _list
		*  @private
		*/
		this._list = $("#listTemplates");

		/**
		*  The button markup
		*  @property {string} _listTemp
		*  @private
		*/
		this._listTemp = this._list.html().trim();

		// Empty the list
		this._list.html('');

		/**
		*  The modal element
		*  @property {jquery} _modal
		*  @private
		*/
		this._modal = $("#templateModal")
			.on('hidden.bs.modal', this.reset.bind(this));

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
					self.addTemplate(path);
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
					self.addTemplate(file.path);
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

	/**
	*  The template metadata file
	*  @property {string} FILE
	*  @static
	*  @default "springroll-template.json"
	*/
	TemplateManager.FILE = "springroll-template.json";

	/**
	*  Validate a template
	*  @method  addTemplate
	*  @param  {string} path The folder path to add
	*/
	p.addTemplate = function(folder)
	{
		// Check that there's a template to add
		if (!folder)
		{
			this.error("No template to add, drag-and-drop template folder.");
			return;
		}

		var configFile = path.join(folder, TemplateManager.FILE);
		if (!fs.existsSync(configFile))
		{
			this.error("Not a valid template.");
			return;
		}

		this.reset();
		this.dropTemplate.addClass(FOLDER_CLASS)
			.find('.folder')
			.text(folder);

		var config = JSON.parse(fs.readFileSync(configFile));

		// Check for existing template
		var dir = path.join(
			gui.App.dataPath, 
			'Templates', 
			config.id
		);

		// Check for existing
		if (fs.existsSync(dir))
		{
			var temp = this.templates[dir] || {"version" : "0.0.1"};
			var message = "Attempting to replace and older version of the template " + config.name + ". Continue?";

			// If the version being added is not greater than the existing one
			// we should ask for a confirmation first
			if (!semver.gt(config.version, temp.version) && !confirm(message))
			{
				return;
			}
		}

		// Create the folder
		fs.mkdirpSync(dir);
		
		// Copy the files
		fs.copySync(folder, dir);
		
		// Add template
		this.templates[dir] = config;
		this.save();

		// Add to the selection list
		this.append(dir, config);

		// Dismiss the modal
		this._modal.modal('hide');

		// Clear everything
		this.reset();
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
	*  @param {object} config The template configuration
	*/
	p.append = function(dir, config)
	{
		// Add to the list of items
		var template = $(this._listTemp);

		// Make some changes
		if (config.name !== "Default")
		{
			template.find('button')
				.removeClass('disabled btn-default')
				.addClass('btn-danger')
				.prop('disabled', false)
				.click(this.removeTemplate.bind(this, dir));

			template.find('.name').text(config.name);
		}
		
		// Add to the list of existing templates
		this._list.append(template);

		// Deselect all items
		this._select.find('option').removeProp('selected');

		// Add the new option
		var option= $('<option value="' + dir + '">').text(config.name);

		// Auto select new items
		option.prop('selected', true);

		this._select.append(option);

		// Check for template updates!
		if (config.github)
		{
			var github = "https://api.github.com/repos/" + config.github + "/tags";
			$.getJSON(github, this.getTemplateTags.bind(this, dir, config));
		}
	};

	/**
	*  Remove a template
	*  @method  removeTemplate
	*  @private
	*  @param  {event} e Click event
	*  @param  {String} folder The path to the template
  	*/
	p.removeTemplate = function(folder, e)
	{
		// Delete from the saved temlates
		delete this.templates[folder];

		// Remove the select option
		this._select.find("option[value='" + folder + "']").remove();

		// Remove the template from list
		$(e.currentTarget).closest(".template").remove();

		// Remove the template
		fs.removeSync(folder);

		// Save the saved templates
		this.save();
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
		if (DEBUG)
		{
			localStorage.removeItem('templates');
		}

		try
		{
			this.templates = JSON.parse(localStorage.getItem('templates'));
		}
		catch(e){}

		if (!this.templates)
		{
			// Default template path
			var folder = path.join('assets', 'templates', 'default');

			this.templates = {};
			this.templates[folder] = JSON.parse(
				fs.readFileSync(
					path.join(folder, TemplateManager.FILE)
				)
			);
			this.save();
		}

		// Load the existing templates
		for(var dir in this.templates)
		{
			this.append(dir, this.templates[dir]);		
		}
	};

	/**
	*  Get a list of tags for template
	*  @method  
	*  @param {string} dir The output template directory
	*  @param  {object} config The currently selected template config
	*  @param  {array} tags List of github tag objects
	*/
	p.getTemplateTags = function(dir, config, tags)
	{
		var message = "A new version of " + config.name + " is available, update?";
		for (var i = 0; i < tags.length; i++)
		{
			if (semver.gt(tags[i].name, config.version) && confirm(message))
			{
				if (DEBUG)
				{
					console.info("Download ZIP : " + tags[i].zipball_url);
				}
				downloadZip(dir, config, tags[i].zipball_url, tags[i].commit.sha.substr(0,7));
				break;
			}
		}
	};

	/**
	*  Download and unzip a new template 
	*  @method  downloadZip
	*  @private
	*  @param {string} dir The output template directory
	*  @param  {object} config The currently selected template config
	*  @param  {string} zipUrl The path to the zip to unpack
	*  @param {string} sha The hash to get the folder
	*/
	var downloadZip = function(dir, config, zipUrl, sha)
	{
		var zipFile = path.join(
			gui.App.dataPath, 
			'Templates', 
			config.id + '.zip'
		);		

		if (DEBUG)
		{
			console.log("Downloaded zip for " + config.name + " to " + zipFile);
		}
		var out = fs.createWriteStream(zipFile);
		var apiRequest = request({
			method: 'GET',
			uri: zipUrl,
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11",
				"Accept-Encoding": "gzip,deflate,sdch",
				"encoding": "null"
			}
		});
		apiRequest.pipe(out);
		apiRequest.on('end', function(){
			
			// Create a new zip file and get entries
			var zip = new AdmZip(zipFile);
		
			// Remove the existing project
			fs.removeSync(dir);

			// Extra the folder to the directory
			zip.extractAllTo(path.dirname(dir), true);

			// Get the extraction path
			var extractPath = path.join(
				path.dirname(dir), 
				// The zip contains a folder with the name of the repo
				// and then the shortened name of the sha hash
				config.github.replace("/", "-") + "-" + sha
			);
			fs.copySync(extractPath, dir);

			// Clean up extraction path
			fs.removeSync(extractPath);

			// Remove the zip file
			fs.unlinkSync(zipFile);

			// Let the user know we're done
			alert("Updated " + config.name + " template");
		});
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