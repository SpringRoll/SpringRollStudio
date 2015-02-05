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

	var Template = include('springroll.new.Template'),
		JSONUtils = include('springroll.new.JSONUtils'),
		Browser = include('cloudkid.Browser');

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
	*  @param  {string} source The folder path to add
	*/
	p.addTemplate = function(source)
	{
		// Check that there's a template to add
		if (!source)
		{
			this.error("No template to add, drag-and-drop template folder.");
			return;
		}

		var templateFile = path.join(source, TemplateManager.FILE);
		if (!fs.existsSync(templateFile))
		{
			this.error("Not a valid template.");
			return;
		}

		this.reset();
		this.dropTemplate.addClass(FOLDER_CLASS)
			.find('.folder')
			.text(source);

		var template;
		try 
		{
			template = JSONUtils.read(templateFile);
		}
		catch(e)
		{
			this.error("Unable to parse the template file");
			return;
		}

		if (!template.id || !template.name || !template.version)
		{
			this.error("The following fields are required for the template: 'id', 'name', 'version'");
			return;
		}

		// Check for the base template
		if (template.extend && !this.templates[template.extend])
		{
			this.error("This template extends '" + template.extend + "' but no matching template"+
				" is found with that ID. Please install the base template before using this template.");
			return;
		}

		// Check for existing template
		var destination = path.join(
			gui.App.dataPath, 
			'Templates', 
			template.id
		);

		// Check for existing
		if (fs.existsSync(destination))
		{
			var temp = this.templates[template.id] || {"version" : "0.0.1"};
			var message = "Attempting to replace and older version of the template " + template.name + ". Continue?";

			// If the version being added is not greater than the existing one
			// we should ask for a confirmation first
			if (!semver.gt(template.version, temp.version) && !confirm(message))
			{
				return;
			}
		}

		// Create the folder
		fs.mkdirpSync(destination);
		
		// Copy the files from the source to the destination
		fs.copySync(source, destination);

		// Add the path to the current template
		template.path = destination;
		
		// Add template and save it
		this.templates[template.id] = new Template(template);
		this.save();

		// Add to the selection list
		this.append(template);

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
	*  @param {springroll.new.Template} template The template configuration
	*/
	p.append = function(template)
	{
		// Add to the list of items
		var html = $(this._listTemp);

		// Make some changes
		if (template.name !== "Default")
		{
			html.find('button')
				.removeClass('disabled btn-default')
				.addClass('btn-danger')
				.prop('disabled', false)
				.click(this.removeTemplate.bind(this, template));

			html.find('.name').text(template.name);
		}
		
		// Add to the list of existing templates
		this._list.append(html);

		// Deselect all items
		this._select.find('option').removeProp('selected');

		// Add the new option
		var option = $('<option value="' + template.id + '">')
			.text(template.name + " (v" + template.version + ")");

		// Auto select new items
		option.prop('selected', true);

		this._select.append(option);

		// Check for template updates!
		if (template.github)
		{
			var github = "https://api.github.com/repos/" + template.github + "/tags";
			$.getJSON(github, this.getTemplateTags.bind(this, template));
		}
	};

	/**
	*  Remove a template
	*  @method  removeTemplate
	*  @private
	*  @param  {springroll.new.Template} template The template to remove
	*  @param  {event} e Click event
  	*/
	p.removeTemplate = function(template, e)
	{
		// Delete from the saved temlates
		delete this.templates[template.id];

		// Remove the select option
		this._select.find("option[value='" + template.id + "']").remove();

		// Remove the template from list
		$(e.currentTarget).closest(".template").remove();

		// Remove the template
		fs.removeSync(template.path);

		// Save the saved templates
		this.save();
	};

	/**
	*  Save the current set of templates
	*  @method save
	*/
	p.save = function()
	{
		var installedTemplates = {};
		for(var id in this.templates)
		{
			installedTemplates[id] = this.templates[id].path;
		}
		localStorage.setItem(
			'installedTemplates',
			JSON.stringify(installedTemplates)
		);
	};

	/**
	*  Load the saved templates
	*  @method load
	*/
	p.load = function()
	{
		try
		{
			this.templates = JSON.parse(
				localStorage.getItem('installedTemplates'),
				function(key, value)
				{
					if (/\.json$/.test(value))
					{
						return new Template(JSONUtils.read(value));
					}
					return value;
				}
			);
		}
		catch(e)
		{
			if (DEBUG)
			{
				console.error(e.stack);
			}
		}

		if (!this.templates)
		{
			var templatePath = path.join('assets', 'templates', 'default');

			// Default template path
			var json = JSONUtils.read(
				path.join(templatePath, TemplateManager.FILE)
			);

			// Create the default template
			var template = new Template(json);
			template.path = templatePath;

			// Create the templates object
			this.templates = {};
			this.templates[template.id] = template;
			this.save();
		}

		// Load the existing templates
		for(var id in this.templates)
		{
			this.append(this.templates[id]);		
		}
	};

	/**
	*  Get a list of tags for template
	*  @method  
	*  @param {springroll.new.Template} template The template
	*  @param  {array} tags List of github tag objects
	*/
	p.getTemplateTags = function(template, tags)
	{
		var message = "A new version of " + template.name + " is available, update?";
		for (var i = 0; i < tags.length; i++)
		{
			if (semver.gt(tags[i].name, template.version) && confirm(message))
			{
				if (DEBUG)
				{
					console.info("Download ZIP : " + tags[i].zipball_url);
				}
				downloadZip(
					template,
					tags[i].zipball_url, 
					tags[i].commit.sha.substr(0,7)
				);
				break;
			}
		}
	};

	/**
	*  Download and unzip a new template 
	*  @method  downloadZip
	*  @private
	*  @param {springroll.new.Template} template The template 
	*  @param  {string} zipUrl The path to the zip to unpack
	*  @param {string} sha The hash to get the folder
	*/
	var downloadZip = function(template, zipUrl, sha)
	{
		var zipFile = path.join(
			gui.App.dataPath, 
			'Templates', 
			template.id + '.zip'
		);		

		if (DEBUG)
		{
			console.log("Downloaded zip for " + template.name + " to " + zipFile);
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
			fs.removeSync(template.path);

			// Extra the folder to the directory
			zip.extractAllTo(path.dirname(template.path), true);

			// Get the extraction path
			var extractPath = path.join(
				path.dirname(template.path), 
				// The zip contains a folder with the name of the repo
				// and then the shortened name of the sha hash
				template.github.replace("/", "-") + "-" + sha
			);
			fs.copySync(extractPath, template.path);

			// Clean up extraction path
			fs.removeSync(extractPath);

			// Remove the zip file
			fs.unlinkSync(zipFile);

			// Let the user know we're done
			alert("Updated " + template.name + " template");
		});
	};

	/**
	*  Get the currently selected template
	*  @method current
	*  @return {array} The collection of templates to use, in order
	*/
	p.val = function()
	{
		var template = this.templates[this._select.val()];
		var result = [template];

		while(true)
		{
			// No extending, we'll ignore this
			if (!template.extend) break;

			// Check for a template
			template = this.templates[template.extend];

			if (!template)
			{
				throw "The base template doesn't exist, please install '" + template.extend + "' first.";
			}
			result.push(template);
		}
		return result;
	};

	// Assign to namespace
	namespace('springroll.new').TemplateManager = TemplateManager;

}(jQuery));