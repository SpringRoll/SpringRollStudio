(function(){

	// Import classes
	var Module = springroll.Module,
		Browser = cloudkid.Browser,
		Controls = springroll.captions.Controls,
		Timeline = springroll.captions.Timeline,
		List = springroll.captions.List,
		Project = springroll.captions.Project,
		Menu = springroll.captions.Menu,
		XMLFormat = springroll.captions.formats.XMLFormat,
		SBVFormat = springroll.captions.formats.SBVFormat;

	/**
	*  The main application
	*  @class Captions
	*  @namespace springroll.captions 
	*/
	var Captions = function()
	{
		Module.call(this);

		/**
		*  The controls module
		*  @property {springroll.captions.Controls} controls
		*/
		this.controls = new Controls("#controls");

		/**
		*  The timeline module
		*  @property {springroll.captions.Timeline} timeline
		*/
		this.timeline = new Timeline("#timeline");

		/**
		*  The list of aliases
		*  @property {springroll.captions.List} list
		*/
		this.list = new List("#list");

		/**
		*  The modal save dialog
		*  @property {jquery} saveDialog
		*/
		this.saveDialog = $('#saveDialog');

		// Handle the save button actions
		this.saveDialog.find('button[data-action]')
			.click(this._saveClose.bind(this));

		/**
		*  The action to do after a save dialog
		*  @property {function} afterSaveDialog
		*/
		this.afterSaveDialog = null;

		/**
		*  The current project
		*  @property {springroll.captions.Project} project
		*/
		this.project = new Project();

		/**
		*  Keep track of if we have outstanding changes
		*  @property {boolean} pending
		*/
		this.pending = false;

		/**
		 * Refresh the current project
		 * @property {jquery} refreshButton
		 */
		this.refreshButton = $("#refreshButton")
			.click(this.refresh.bind(this))
			.hide();

		/**
		*  Quit the application
		*  @property {jquery} quitButton
		*/
		this.quitButton = $("#quitButton")
			.click(this.clear.bind(this))
			.hide();

		/**
		*  The node webkit menu
		*  @property {gui.Menu} menu The GUI menu
		*/
		this.menu = null;

		// Lets create the menu
		if (APP)
		{
			this.initMenubar();
			this.menu = new Menu(
				this.main, 
				this.menubar, 
				this._menuHandler.bind(this)
			);
		}

		// Initialize the browser utility
		Browser.init();

		// Turn off the site
		this.enabled = false;

		// Bind functions
		this.addCaption = this.addCaption.bind(this);
		this.saveCaption = this.saveCaption.bind(this);
		this.onSelectAlias = this.onSelectAlias.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onChangeAlias = this.onChangeAlias.bind(this);
		this.onSelectAudioSrc = this.onSelectAudioSrc.bind(this);

		var list = this.list.parent;
		var self = this;

		$(document.body).on("dragover drop", function(e) {
            e.preventDefault();
            return false;
       });

		list.on("dragenter", function(event){
			event.preventDefault();
			list.addClass("dragover");
		})
		.on("dragover", function(event) {
			event.preventDefault();
			if(!list.hasClass("dragover"))
				list.addClass("dragover");
		})
		.on("dragleave", function(event) {
			event.preventDefault();
			list.removeClass("dragover");
		})
		.on("drop", function(event) {
			event.preventDefault();
			list.removeClass("dragover");

			var fileList = event.originalEvent.dataTransfer.files;

			if (fileList.length > 1)
			{
				throw "Only one project at a time";
			}

			// Select the first entry
			var file = fileList[0];

			// Directories only!
			if (APP)
			{
				var fs = require('fs');
				if (!fs.lstatSync(file.path).isDirectory())
				{
					throw "Folders only. Please drag a project folder.";
				}
			}
			else
			{
				if (file.type !== "")
				{
					throw "Folders only. Please drag a project folder.";
				}
			}

			self.open(APP ? file.path : file.name);
		});

		// Check for an existing project and open it
		var project = localStorage.getItem('project');
		if (project) this.open(project);
	};

	// Reference to the prototype
	var p = Captions.prototype = Object.create(Module.prototype);

	/**
	*  The default width of a new caption in ms
	*  @property {int} DEFAULT_WIDTH
	*  @private
	*/
	var DEFAULT_WIDTH = 3000;

	/**
	*  If a current project is loaded is enabled
	*  @property {boolean} enabled
	*/
	Object.defineProperty(p, "enabled", {
		get : function()
		{
			return this._enabled;
		},
		set : function(enabled)
		{
			this._enabled = enabled;

			if (APP)
			{
				this.menu.enabled = enabled;
			}

			var addButton = this.controls.addButton;
			var saveButton = this.controls.saveButton;

			var list = this.list.parent;
			var controls = this.controls.parent;

			saveButton.off('click', this.saveCaption);
			addButton.off('click', this.addCaption);
			list.off('selectAlias', this.onSelectAlias)
				.off('delete', this.onDelete)
				.off('selectAudioSrc', this.onSelectAudioSrc)
				.off('change', this.onChangeAlias);
			controls.off('delete', this.onDelete);

			if (enabled)
			{
				saveButton.click(this.saveCaption);
				addButton.click(this.addCaption);
				list.on('selectAlias', this.onSelectAlias)
					.on('delete', this.onDelete)
					.on('selectAudioSrc', this.onSelectAudioSrc)
					.on('change', this.onChangeAlias);
				controls.on('delete', this.onDelete);
			}
		}
	});

	if (APP)
	{
		/**
		*  Handle when an item is clicked on in the system menu
		*  @method _menuHandler
		*  @private
		*/
		p._menuHandler = function(item)
		{
			switch(item)
			{
				case this.menu.open :
				{
					Browser.folder(this.open.bind(this));
					break;
				}
				case this.menu.close :
				{
					this.clear();
					break;
				}
				case this.menu.reload :
				{
					this.refresh();
					break;
				}
				case this.menu.sync :
				{
					this.project.resync(function(assets){
						this.addAssets(assets);
						this.pending = true;
					}.bind(this));
					break;
				}
				case this.menu.save :
				{
					this.project.save();
					this.pending = false;
					break;
				}
				case this.menu.exportSBV :
				{
					var caption = this.timeline.data;
					if (!this.list.current)
					{
						alert("Select a caption first to export as SBV");
					}
					else if (caption.length === 0)
					{
						alert("No captions to export");
					}
					else
					{
						Browser.saveAs(
							function(file)
							{
								if (APP)
								{
									var fs = require('fs');
									fs.writeFileSync(file, SBVFormat.format(caption));
								}
								if (WEB)
								{
									console.log(SBVFormat.format(caption));
								}
							},
							this.list.current.data('alias') + ".sbv",
							this.project.dir
						);
					}
					break;
				}
				case this.menu.exportXML :
				{
					var defaultName;
					if (APP)
					{
						var path = require('path');
						defaultName = path.basename(this.project.dir);
					}
					if (WEB)
					{
						defaultName = "Project";
					}
					var captions = this.project.captions;
					Browser.saveAs(
						function(file)
						{
							if (APP)
							{
								var fs = require('fs');
								fs.writeFileSync(file, XMLFormat.formatAll(captions));
							}
							if (WEB)
							{
								console.log(XMLFormat.formatAll(captions));
							}
						},
						defaultName + ".xml",
						this.project.dir
					);
					break;
				}
			}
		};
	}

	/**
	*  Event handler for changing an alias
	*  @method onChangeAlias
	*  @private
	*  @param {event} e The jquery event
	*  @param {String} oldAlias The old alias to change
	*  @param {String} newAlias The new alias to change to
	*/
	p.onChangeAlias = function(e, oldAlias, newAlias)
	{
		if (this.project.changeAlias(oldAlias, newAlias))
		{
			this.pending = true;
		}
	};

	/**
	*  Select an alias
	*  @method onSelectAlias
	*  @private
	*  @param {alias} alias The selected alias
	*/
	p.onSelectAlias = function(e, alias)
	{
		this.timeline.data = this.project.getCaptions(alias);
		this.timeline.enabled = true;
		this.controls.open(this.project.getAudioSource(alias));
	};

	/**
	 * Select an audio file for a missing caption
	 * @method  onSelectAudioSrc
	 * @param {event} e JQuery event
	 * @param {string} alias The caption alias
	 * @param {boolean} addNewAsset Add a new asset to the project
	 */
	p.onSelectAudioSrc = function(e, alias, addNewAsset, button)
	{
		var audioPath = this.project.getAudioPath();
		Browser.file(
			function(src)
			{
				// Update the button's data source
				button.data('src', src);

				// Make sure we clear the current button
				if (this.list.deselect(alias))
				{
					this.timeline.removeAll();
				}

				if (APP)
				{
					// Get the local path to the file
					var path = require('path');
					src = path.relative(audioPath, src);
				}

				// Ass a new asset
				if (addNewAsset)
				{
					this.project.assets.push({
						id: alias,
						src: src
					});
				}
				else
				{
					// Update the src for the matching asset
					var asset, len = this.project.assets.length;
					for (var i = 0; i < this.project.assets.length; i++)
					{
						asset = this.project.assets[i];
						if (asset.id == alias)
						{
							asset.src = src;
							break;
						}
					}
				}
				this.pending = true;

			}.bind(this),
			".ogg",
			audioPath
		);
	};

	/**
	*  Delete the current alias
	*  @private
	*  @method onDelete
	*  @param {event} e The jquery event
	*  @param {string} [alias] The specific alias to delete, if null
	*         then the currently opened alias is deleted.
	*/
	p.onDelete = function(e, alias)
	{
		var currentAlias = null;
		var current = this.list.current;
		if (current)
		{
			currentAlias = current.data('alias');
		}
		alias = alias || currentAlias;

		if (alias == currentAlias)
		{
			this.timeline.removeAll();
			this.controls.close();
		}
		this.list.remove(alias);
		this.project.removeCaptions(alias);
		this.pending = true;
	};

	/**
	*  Add a collection of assets to the list
	*  @method addAssets
	*  @param {array} projectAssets The list of asset objects with id and src
	*  @return {object} The collection of assets
	*/
	p.addAssets = function(projectAssets)
	{
		var list = this.list,
			project = this.project;

		// The map of assets aliases to sources
		var assets = {};

		// Project is loaded we'll add all the assets
		_.each(projectAssets, function(asset){

			assets[asset.id] = asset.src;

			// If there is a caption, mark as found,
			// or else the caption doesn't exist
			var status = !!project.captions[asset.id] ? 1 : 0,
				src = project.getAudioSource(asset.id),
				exists = APP ? require('fs').existsSync(src) : true;

			if (!exists)
			{
				status = -1;
			}
			list.addAlias(asset.id, status, src);
		});
		return assets;
	};

	/**
	*  Open a new project
	*  @method open
	*  @param  {string} dir The project directory
	*/
	p.open = function(dir)
	{
		this.clear();

		var self = this;
		var list = this.list;

		this.project.open(dir, function(project){

			// No project loaded bail!
			if (project === null) return;

			// The map of assets aliases to sources
			var assets = self.addAssets(project.assets);

			// Next we'll make sure to include any captions without
			// assets, these aren't connected to any audio we should give
			// the user an opportunity to rename/reconnect
			_.each(project.captions, function(caption, id, captions){
				if (!assets[id])
				{
					if (DEBUG)
					{
						console.debug("Caption doesn't have an asset " + id);
					}
					list.addAlias(id, -2);
				}
			});

			this.refreshButton.show();
			this.quitButton.show();

			$('body').removeClass('empty');

			// Enable the interface
			this.enabled = true;

			$('body').removeClass('empty');

		}.bind(this));
	};

	/**
	 * Re-open the current project
	 * @method refresh
	 */
	p.refresh = function()
	{
		if (this.pending)
		{
			this.afterSaveDialog = this.open.bind(this, this.project.dir);
			this.saveDialog.modal('show');
		}
		else
		{
			this.open(this.project.dir);
		}
	};

	/**
	*  Handler when the main node-webkit window closes
	*  @method shutdown
	*  @method protected
	*  @param {event} e The event close
	*/
	p.shutdown = function(e)
	{
		if (this.pending)
		{
			this.afterSaveDialog = this.close.bind(this, true);
			this.saveDialog.modal('show');
		}
		else
		{
			this.close(true);
		}
	};
	
	/**
	*  Callback on the on saved dialog closed
	*  @method _saveClose
	*  @param {function} next Method to do after 
	*  @param {String} result
	*/
	p._saveClose = function()
	{
		if (this.id === "save")
		{
			this.project.save();
		}
		this.saveDialog.modal('hide');
		this.pending = false;
		this.afterSaveDialog();
		this.afterSaveDialog = null;
	};

	/**
	*  Close the current project
	*  @method clear
	*/
	p.clear = function()
	{
		if (this.pending)
		{
			this.afterSaveDialog = this.clear.bind(this);
			this.saveDialog.modal('show');
			return;
		}
		$('body').addClass('empty');

		this.quitButton.hide();
		this.refreshButton.hide();
		this.project.close();
		this.list.removeAll();
		this.timeline.removeAll();
		this.controls.close();

		this.enabled = false;
	};

	/**
	*  Add a new caption on the timeline
	*  @method addCaption
	*/
	p.addCaption = function()
	{
		// The position of the play head
		var waveform = this.controls.waveform;
		var duration = waveform.getDuration() * 1000 | 0;
		var time = waveform.getCurrentTime() * 1000 | 0;
		var current = this.timeline.hasCaption(time);

		if (current !== null)
		{
			current.focus();
		}
		else
		{
			var end = Math.min(duration, time + DEFAULT_WIDTH);
			this.timeline.addCaption("", time, end, true);
		}
	};

	/**
	*  Save the current caption
	*  @method saveCaption
	*/
	p.saveCaption = function()
	{
		var lines = this.timeline.data;
		var button = this.list.current;

		// Update the project with new lines
		this.project.setCaptions(button.data('alias'), lines);

		// Update the status of the file
		this.list.setStatus(button, lines.length > 0 ? 1 : 0);

		this.pending = true;
	};

	// Create the app on window loaded
	Module.create(Captions);

}());