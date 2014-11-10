(function(undefined){

	if (APP)
	{
		var path = require('path');
		var fs = require('fs');
	}

	// Import classes
	var Module = springroll.Module,
		Browser = cloudkid.Browser,
		TemplateManager = springroll.new.TemplateManager,
		Installer = springroll.new.Installer;

	/**
	*  Create a new project
	*  @class NewProject
	*/
	var NewProject = function()
	{
		Module.call(this);

		Browser.init();

		/**
		*  Manager of the templates
		*  @property {springroll.new.TemplateManager} manager
		*/
		this.templates = new TemplateManager();

		/**
		*  The close/cancel button
		*  @property {jquery} closeButton
		*/
		this.closeButton = $("#closeButton").click(
			this.shutdown.bind(this)
		);

		/**
		*  The submit button
		*  @property {jquery} createButton
		*/
		this.createButton = $("#createButton").click(
			this.create.bind(this)
		);

		/**
		*  The browse for a folder button
		*  @property {jquery} folderBrowse
		*/
		this.folderBrowse = $("#folderBrowse").click(
			this.browse.bind(this)
		);

		/**
		*  The input for the folder name
		*  @property {jquery} folder
		*/
		this.folder = $("#folder");

		/**
		*  The input for the app width
		*  @property {jquery} width
		*/
		this.appWidth = $("#width");

		/**
		*  The input for the app height
		*  @property {jquery} height
		*/
		this.appHeight = $("#height");

		/**
		*  The input for the app version
		*  @property {jquery} version
		*/
		this.version = $("#version");

		/**
		*  The input for the app namespace
		*  @property {jquery} namespace
		*/
		this.namespace = $("#namespace");

		/**
		*  The installer
		*  @property {springroll.new.Installer} installer
		*/
		this.installer = new Installer();

		/**
		*  The input for the class/code name
		*  @property {jquery} className
		*/
		var className = this.className = $("#className");

		/**
		*  The input for the display name
		*  @property {jquery} name
		*/
		this.name = $("#name").keyup(function(){
			className.val(this.value.replace(/ /g, ""));
		});

		// Reset from local storage
		this.appWidth.val(localStorage.getItem('width') || "");
		this.appHeight.val(localStorage.getItem('height') || "");
		this.namespace.val(localStorage.getItem('namespace') || "");

		// Restrict the input
		$('input[data-restrict]').keyup(function(e){
			var input = $(this),
				restrict = new RegExp("[^" + input.data('restrict') + "]"),
				value = input.val(),
				newValue = value.replace(restrict, "");

			if (value !== newValue)
			{
				input.val(newValue);
			}
		});

		// Hide the unsupported modules for native display
		var noNative = $('.no-native input');
		var optional = $('.optional input');

		this.displays = $(".display:checkbox").change(function(){

			// Get the selected displays
			var displays = this.getDisplays();

			optional.removeAttr('disabled')
				.prop('checked', true)
				.parent()
					.removeClass('disabled');

			// Display modules if only the native display is selected
			if (displays.length === 1 && $("#native").prop('checked'))
			{
				noNative.prop('checked', false)
					.attr('disabled', true)
					.parent()
						.addClass('disabled');
			} 
			else if (displays.length === 0)
			{
				optional.attr('disabled', true)
					.prop('checked', false)
					.parent()
						.addClass('disabled');
			}
		}.bind(this));
	};

	// Reference to the prototype
	var p = NewProject.prototype = Object.create(Module.prototype);

	Object.defineProperty(p, 'enabled', {
		set : function(enabled)
		{
			this.createButton
				.removeAttr('disabled')
				.removeClass('disabled');

			if (!enabled)
			{
				this.createButton
					.attr('disabled', enabled)
					.addClass('disabled');
			}
		}
	});

	/**
	*  Get the list of displays
	*  @method getDisplays
	*/
	p.getDisplays = function()
	{
		var displays = [];
		this.displays.filter(":checked").each(function(){
			displays.push(this.value);
		});
		return displays;
	};

	/**
	*  Create the new project
	*  @method  create
	*/
	p.create = function()
	{
		this.enabled = false;

		// Get the list of displays to show
		var displays = this.getDisplays();

		if (!displays.length)
		{
			alert("Please select a renderer to use.");
			this.enabled = true;
			return;
		}

		// The colection of modules
		var modules = [],
			modulesDebug = [],
			libraries = [],
			librariesDebug = [],
			bower = {};

		$(".module:checkbox:checked").each(function(){
			modules.push(this.value + ".min.js");
			modulesDebug.push(this.value + ".js");

			// Get the depdencencies
			var module = $(this);
			$.extend(bower, module.data('bower'));
			libraries.push.apply(libraries, module.data('libraries'));
			librariesDebug.push.apply(librariesDebug, module.data('libraries-debug'));
		});
		
		if (APP)
		{
			try
			{
				this.validate(this.folder);
				this.installer.run(
					this.templates.val(),
					{
						name: this.validate(this.name),
						className: this.validate(this.className),
						namespace: this.validate(this.namespace),
						width: this.validate(this.appWidth),
						height: this.validate(this.appHeight),
						destination: this.folder.data('folder'),
						version: this.validate(this.version),
						libraries: libraries.concat(modules),
						librariesDebug: librariesDebug.concat(modulesDebug),
						displayClass: this.displays.filter(':checked:first').data('display-class'),
						bower: bower
					},
					this._onCompleted.bind(this)
				);
			}
			catch(e)
			{
				alert(e);

				if (DEBUG)
				{
					console.error(e.stack);
				}
			}
		}
		this.enabled = true;
	};

	/**
	*  Completed the project creation
	*  @method _onCompleted
	*/
	p._onCompleted = function()
	{
		alert(this.name.val() + " created successfully");
		localStorage.setItem('width', this.appWidth.val());
		localStorage.setItem('height', this.appHeight.val());
		localStorage.setItem('namespace', this.namespace.val());
		this.shutdown();
	};

	/**
	*  Validate the input value
	*  @method validate
	*  @param {jquery} input The input text field
	*/
	p.validate = function(input)
	{
		var value = input.val().trim();
		var parent = input.closest('.form-group')
			.removeClass('has-error');

		if (!value)
		{
			parent.addClass('has-error');
			throw "Field is required";
		}
		return value;
	};

	/**
	*  Select a folder
	*  @method browse
	*/
	p.browse = function()
	{
		if (APP)
		{
			var folder = this.folder;
			var name = this.name;
			var className = this.className;

			Browser.folder(function(uri){

				// Check for empty directory
				if (fs.readdirSync(uri).length > 1)
				{
					alert("Please only select an empty folder.");
					return;
				}

				// The name of the project from the folder name
				var project = path.basename(uri);

				folder.data('folder', uri).val(path.basename(uri));
				name.val(project);
				className.val(project.replace(/ /g, ''));
			});
		}
	};

	// Create the new Remote trace
	Module.create(NewProject);

}());