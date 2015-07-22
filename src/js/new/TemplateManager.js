(function($){
	
	if (APP)
	{
		var fs = require('fs-extra');
		var path = require('path');
		var gui = require('nw.gui');
		var semver = require('semver');
		var http = require('http');
		var request = require('request');
	}

	var Template = include('springroll.new.Template'),
		JSONUtils = include('springroll.new.JSONUtils'),
		Extract = include('springroll.new.Extract'),
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
		this._select = $("#templates")
			.change(this.updateModules.bind(this));

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
		this._listTemp = $("#templateTemplate").html().trim();

		/**
		*  The module checkbox markup
		*  @property {string} _moduleTemplate
		*  @private
		*/
		this._moduleTemplate = $("#moduleTemplate").html().trim();

		/**
		*  The modules display element
		*  @property {jquery} _modules
		*  @private
		*/
		this._modules = $("#modules");

		// Empty the list
		this._list.empty();

		/**
		 * The collection of templates
		 * @property {Object} templates
		 */
		this.templates = {};

		/**
		*  The modal element
		*  @property {jquery} _modal
		*  @private
		*/
		this._modal = $("#templateModal")
			.on('hidden.bs.modal', this.onModalClose.bind(this));

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
	 * Update the modules for the current template
	 * @method updateModules
	 * @private
	 */
	p.updateModules = function()
	{
		// Clear the current modules
		this._modules.empty();

		// The currently selected templates
		var template = this.val();

		// Make sure we have a valid template
		if (!template) return;

		var modules = template.modules,
			required = template.required,
			disabled = template.disabled,
			checkbox,
			id, 
			input, 
			module,
			description;
	
		// Loop through all modules
		for (var i = 0; i < modules.length; i++)
		{
			module = modules[i];
			id = module.id;
			checkbox = $(this._moduleTemplate);
			checkbox.find('.name').text(module.name);
			checkbox.find('.id').text(module.id);
			description = checkbox.find('.description');
			if (module.description)
				description.text(module.description);
			else
				description.remove();
			input = checkbox.find('.module')
				.prop('checked', module.default)
				.val(id);

			// Give the jquery node a reference to the 
			// template module
			input.data('module', module);

			// Either the module is required
			// or the template requires the plugin
			if (required.indexOf(module.id) > -1)
			{
				input.attr('disabled', true)
					.prop('checked', true);
			}
			// Explicitly disable modules
			if (disabled.indexOf(module.id) > -1)
			{
				input.attr('disabled', true)
					.prop('checked', false);
			}
			if (module.display)
			{
				input.data('display', module.display);
			}
			this._modules.append(checkbox);
		}
	};

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

		this.reset();
		this.dropTemplate.addClass(FOLDER_CLASS)
			.find('.folder')
			.text(source);

		var template;
		try 
		{
			template = new Template(source);

			// Add the parent template
			this.addParent(template);
		}
		catch(e)
		{
			this.error(e);
			return;
		}

		// Check for existing template
		var destination = path.join(gui.App.dataPath, 'Templates', template.id);

		// Check for existing
		if (fs.existsSync(destination))
		{
			var temp = this.templates[template.id] || {"version" : "0.0.1"};
			var message = "Attempting to replace and older version of the "+
				"template " + template.name + ". Continue?";

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

		// Remove stuff we don't want included in template
		fs.removeSync(path.join(destination, '.git'));
		fs.removeSync(path.join(destination, '.DS_Store'));

		// Update the path destination
		template.path = destination;

		// Add template and save it
		this.templates[template.id] = template;
		this.save();
		this.append(template);
		this.updateModules();

		// Dismiss the modal
		this._modal.modal('hide');

		// Clear everything
		this.reset();
	};

	/**
	 * Handler when the modal becomes hidden
	 * @private
	 * @method onModalClose
	 */
	p.onModalClose = function()
	{
		this.reset();
		this.updateModules();
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
		html.find('button').click(this.removeTemplate.bind(this, template));

		// Add the name of the template
		html.find('.name').text(template.name + " (v" + template.version + ")");
		
		// Give the template an id
		html.prop('id', template.id.replace(/\./g, '-'));

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

		// Remove the id
		this.removeTemplateUI(template.id);

		// Remove the template
		fs.removeSync(template.path);

		// Save the saved templates
		this.save();
	};

	/**
	 * Remove the select list and template in modal
	 * @method  removeTemplateUI
	 * @param  {String} templateId The template id
	 */
	p.removeTemplateUI = function(templateId)
	{
		// Remove the select option
		this._select.find("option[value='" + templateId + "']").remove();

		// Remove the template from list
		$("#" + templateId.replace(/\./g, '-')).remove();
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
		var id, templates, template;

		try
		{
			templates = JSON.parse(
				localStorage.getItem('installedTemplates')
			);
		}
		catch(e)
		{
			if (DEBUG)
			{
				console.error(e.stack);
			}
			else
			{
				alert('Unable to read saved templates');
			}
			return;
		}

		for (id in templates)
		{
			try
			{
				template = new Template(templates[id]);
			}
			catch(e)
			{
				alert(e);
				if (DEBUG) console.error(e);
				continue;
			}
			this.templates[id] = template;
		}

		// First-Time run, copy the default template
		// to the setting folder
		if (!_.keys(this.templates).length)
		{
			// Install the default template
			console.log("Install the default template : assets/templates/default");
			this.addTemplate(path.join('assets','templates','default'));
			return;
		}
		else
		{
			// Loop throught the existing templates
			for (id in this.templates)
			{
				try
				{
					// Add the parent template
					this.addParent(this.templates[id]);
				}
				catch(e)
				{
					alert(e);
				}		

				// Add to the select list
				this.append(this.templates[id]);
			}

			// Populate with modules
			this.updateModules();
		}
	};

	/**
	 * Add the parent template to the child 
	 * @method addParent 
	 * @param {springroll.new.Template} template [description]
	 */
	p.addParent = function(template)
	{
		// Check for the base template
		if (template.extend)
		{
			if (!this.templates[template.extend])
			{
				throw "This template extends '" + template.extend + "' "+
					"but no matching template is found with that ID. Please "+
					"install the base template before using this template.";
			}
			// Add the parent
			template.parent = this.templates[template.extend];
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
				this.downloadZip(
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
	p.downloadZip = function(template, zipUrl, sha)
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
		
		var self = this;
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
			
			console.log("Finished downloading zip, now extracting...");
			
			// Remove the existing project
			fs.removeSync(template.path);

			// Extract the file to directory
			Extract.run(zipFile, template.path, function()
			{
				// Remove the ZIP file downloaded
				fs.removeSync(zipFile);

				// Remove the UI
				self.removeTemplateUI(template.id);

				// Add the updated template
				self.append(new Template(template.path));

				alert("Updated " + template.name + " template.");
			});
		});
	};

	/**
	*  Get the currently selected template
	*  @method current
	*  @return {springroll.new.Template} The template to use
	*/
	p.val = function()
	{
		return this.templates[this._select.val()];
	};

	/**
	* Get the list of displays
	* @method displays
	* @return {array} Array of display classes
	*/
	p.displays = function()
	{
		var displays = [];
		$(".module:data(display):checked").each(function(){
			displays.push($(this).data('display'));
		});
		return displays;
	};

	// Assign to namespace
	namespace('springroll.new').TemplateManager = TemplateManager;

}(jQuery));