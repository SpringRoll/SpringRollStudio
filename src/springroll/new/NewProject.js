(function(undefined){

	if (APP)
	{
		var path = require('path');
		var fs = require('fs');
	}

	// Import classes
	var Module = include('springroll.Module'),
		Browser = include('cloudkid.Browser'),
		TemplateManager = include('springroll.new.TemplateManager'),
		Installer = include('springroll.new.Installer');

	/**
	*  Create a new project
	*  @class NewProject
	*/
	var NewProject = function()
	{
		Module.call(this);

		Browser.init();

		if (APP)
		{
			this.initMenubar(false, true);
		}

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
		$('input:data(restrict)').keyup(function(e){
			var input = $(this),
				restrict = new RegExp("[^" + input.data('restrict') + "]"),
				value = input.val(),
				newValue = value.replace(restrict, "");

			if (value !== newValue)
			{
				input.val(newValue);
			}
		});
	};

	// Reference to the prototype
	var p = extend(NewProject, Module);

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
	 * Utility to merge objects or merge arrays
	 * @method concat
	 * @private
	 * @param {object|array} target The target object
	 * @param {object|array} source The source to add
	 */
	var concat = function(target, source)
	{
		if (source)
		{
			if (Array.isArray(target))
			{
				target = target.concat(source);
			}
			else
			{
				$.extend(target, source);
			}
		}
		return target;
	};

	/**
	*  Create the new project
	*  @method  create
	*/
	p.create = function()
	{
		this.enabled = false;
		
		try
		{
			// Get the list of displays to show
			var displays = this.templates.displays();
			var template = this.templates.val();

			if (!displays.length)
			{
				throw "Please select a renderer to use.";
			}

			// Create a collection of selected modules
			var modules = [];
			var checkboxes = $(".module:checkbox:checked")
				.each(function(){
					modules.push(this.value);
				});

			// The colection of modules
			var main = [],
				mainDebug = [],
				libraries = [],
				librariesDebug = [],
				librariesCopy = {},
				bower = {};

			$(".module:checkbox:checked").each(function(){
				var module = $(this).data('module');

				// Validate against all selections
				module.validate(modules);

				main = concat(main, module.main);
				mainDebug = concat(mainDebug, module.mainDebug);
				bower = concat(bower, module.bower);
				libraries = concat(libraries, module.libraries);
				librariesDebug = concat(librariesDebug, module.librariesDebug);
				librariesCopy = concat(librariesCopy, module.librariesCopy);
			});

			this.validate(this.folder);
			this.installer.run(
				template,
				{
					name: this.validate(this.name),
					className: this.validate(this.className),
					namespace: this.validate(this.namespace),
					width: this.validate(this.appWidth),
					height: this.validate(this.appHeight),
					destination: this.folder.data('folder'),
					version: this.validate(this.version),
					libraries: libraries.concat(main),
					librariesDebug: librariesDebug.concat(mainDebug),
					librariesCopy: librariesCopy,
					displayClass: displays[0],
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
				console.error(e);
				if (e.stack)
					console.error(e.stack);
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
		localStorage.setItem('project', this.folder.data('folder'));
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