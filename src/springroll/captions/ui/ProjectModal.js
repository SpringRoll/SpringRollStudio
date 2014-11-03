(function(){

	// Import classes
	var Browser = cloudkid.Browser;

	/**
	*  The new project dialog
	*  @class ProjectModal
	*  @namespace springroll.captions 
	*  @constructor
	*/
	var ProjectModal = function(selector)
	{
		/**
		 * The root modal node
		 * @property {jquery} parent
		 */
		this.parent = $(selector)
			.on('show.bs.modal', this._onShow.bind(this))
			.on('hide.bs.modal', this._onHide.bind(this));

		/**
		 * Input for the audio folder path
		 * @property {jquery} audioPath
		 */
		this.audioPath = $('#audioPath');

		/**
		 * Input for the export path
		 * @property {jquery} exportPath
		 */
		this.exportPath = $('#exportPath');

		/**
		 * Node containing the project path
		 * @property {jquery} projectPath
		 */
		this.projectPath = $('#projectPath');

		/**
		 * Button for creating the new project, for confirming
		 * @property {jquery} createButton
		 */
		this.createButton = $("#createButton")
			.click(this._onConfirm.bind(this));

		/**
		 * Button to browse for the audio path
		 * @property {jquery} audioPathBrowse
		 */
		this.audioPathBrowse = $("#audioPathBrowse")
			.click(onBrowseAudio.bind(this));

		/**
		 * Button to browse for the export path
		 * @property {jquery} exportPathBrowse
		 */
		this.exportPathBrowse = $("#exportPathBrowse")
			.click(onBrowseExport.bind(this));

		/**
		 * Callback for the finishing of the dialog
		 * @property {function} _callback
		 * @private
		 */
		this._callback = null;

		/**
		 * Boolean if the dialog was confirmed
		 * @property {Boolean} _confirmed
		 * @private
		 */
		this._confirmed = false;

		/**
		 * The current working directory
		 * @property {string} _dir
		 * @private
		 */
		this._dir = null;
	};

	// Reference to the prototype
	var p = ProjectModal.prototype;

	/**
	*  Remove all items
	*  @method open
	*/
	p.open = function(dir, callback)
	{
		this._dir = dir;
		this._confirmed = false;
		this._callback = callback;
		this.projectPath.html(dir);
		this.parent.modal('show');
	};

	/**
	*  Browse the audio path
	*  @method  onBrowseAudio
	*  @private
	*/
	var onBrowseAudio = function()
	{
		var dir = this._dir;
		Browser.folder(function(folder){
			var path = require('path');
			this.audioPath.val(path.relative(dir, folder));
		}.bind(this), dir);
	};

	/**
	*  Browse the export path
	*  @method  onBrowseExport
	*  @private
	*/
	var onBrowseExport = function()
	{
		var dir = this._dir;
		Browser.file(function(file){
			if (!/\.json/.test(file))
			{
				throw "Export file must end in '.json'";
			}
			var path = require('path');
			this.exportPath.val(path.relative(dir, file));
		}.bind(this), dir);
	};

	/**
	 * Confirm button handler
	 * @method _onConfirm
	 * @private
	 */
	p._onConfirm = function()
	{
		this._confirmed = true;
		this.parent.modal('hide');
	};

	/**
	 * Close handler for the dialog
	 * @method _onHide
	 * @private
	 */
	p._onHide = function()
	{
		if (!this._confirmed)
		{
			this.close(false);
			return;
		}

		var exportPath = this.exportPath.val();
		var audioPath = this.audioPath.val();

		var error = false;
		var fs = require('fs');
		var path = require('path');

		if (!audioPath)
		{
			error = 'Audio Path is empty';
		}
		else if (!fs.existsSync(path.join(this.projectPath.html(), audioPath)))
		{
			error = 'Audio path is not a valid directory';
		}
		else if (!exportPath)
		{
			error = 'Export Path is empty';
		}
		else if (!/\.json$/.test(exportPath))
		{
			error = 'Export path must end in ".json"';
		}

		if (error)
		{
			this.close(false);
			throw error;
		}
		else
		{
			localStorage.setItem('exportPath', exportPath);
			localStorage.setItem('audioPath', audioPath);

			this.close({
				exportPath : exportPath,
				audioPath : audioPath
			});
		}		
	};

	/**
	 * Close the dialog
	 * @method close
	 * @private
	 * @param  {false|object} success If the dialog was closed successfully
	 */
	p.close = function(success)
	{
		var callback = this._callback;
		this._callback = null;
		this._confirmed = false;
		this._dir = null;
		callback(success);
	};

	/**
	 * Upon opening the dialog handler
	 * @method _onShow
	 * @private
	 */
	p._onShow = function()
	{
		// Populate the audio path with the last one saved, or the default
		this.audioPath.val(localStorage.getItem('audioPath') || "deploy/assets/audio/vo");

		// Populate the export path with the last one saved, or the default
		this.exportPath.val(localStorage.getItem('exportPath') || "deploy/assets/config/captions.json");
	};

	// Assign to namespace
	namespace('springroll.captions').ProjectModal = ProjectModal;

}());