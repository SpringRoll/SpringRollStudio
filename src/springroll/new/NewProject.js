(function(undefined){

	// Import classes
	var Module = springroll.Module;

	/**
	*  Create a new project
	*  @class NewProject
	*/
	var NewProject = function()
	{
		Module.call(this);

		var noNative = $('.no-native');
		
		$('input[name="display"]').change(function(){
			if (this.value === "native")
			{
				noNative.hide();
			} 
			else
			{
				noNative.show();
			}
		});

		// Add close button handler
		$("#closeButton").click(this.shutdown.bind(this));

		// Add create button handler
		$("#createButton").click(this.create.bind(this));

		// Browse for a folder
		$("#folderBrowse").click(this.browse.bind(this));
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

	p.browser = function()
	{
		Browser.folder(function(folder){
			
		});
	};

	// Create the new Remote trace
	Module.create(NewProject);

}());