(function(undefined){

	// Import classes
	var Module = springroll.Module,
		Browser = cloudkid.Browser;

	/**
	*  Create a new project
	*  @class NewProject
	*/
	var NewProject = function()
	{
		Module.call(this);

		var noNative = $('.no-native input');
		
		$('input[name="display"]').change(function(){

			noNative.removeAttr('disabled')
				.parent().removeClass('disabled');

			if (this.value === "native")
			{
				noNative.attr('checked', false)
					.attr('disabled', true)
					.parent().addClass('disabled');
			} 
		});

		Browser.init();

		// Add close button handler
		this.closeButton = $("#closeButton").click(
			this.shutdown.bind(this)
		);

		// Add create button handler
		this.createButton = $("#createButton").click(
			this.create.bind(this)
		);

		// Browse for a folder
		this.folderBrowse = $("#folderBrowse").click(
			this.browse.bind(this)
		);

		this.folder = $("#folder");
	};

	// Reference to the prototype
	var p = NewProject.prototype = Object.create(Module.prototype);

	/**
	*  Create the new project
	*  @method  create
	*/
	p.create = function()
	{
		if (DEBUG)
		{
			Debug.log("Create new application!");
		}
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
			Browser.folder(function(uri){
				var path = require('path');
				console.log(uri);
				folder.data('folder', uri)
					.val(path.basename(uri));
			});
		}
		
	};

	// Create the new Remote trace
	Module.create(NewProject);

}());