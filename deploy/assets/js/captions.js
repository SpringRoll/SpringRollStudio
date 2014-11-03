(function(undefined){

	/**
	*  Create the file browser
	*  @class Browser
	*  @namespace cloudkid
	*/
	var Browser = function()
	{
		instance = this;

		if (window.$ === undefined)
		{
			throw "jQuery must be included to use cloudkid.Browser";
		}

		// Add the hidden input for browsing files
		this.file = $('<input type="file" />')
			.css('visibility', 'hidden')
			.change(function(e) {
				var input = $(this);
				input.removeAttr('accept');
				var file = input.val();
				var callback = instance._fileCallback;
				instance._fileCallback = null;
				input.val('');
				callback(file);
			});

		// Add the hidden input for browsing files
		this.saveAs = $('<input type="file" nwsaveas />')
			.css('visibility', 'hidden')
			.change(function(e) {
				var input = $(this);
				input.attr('nwsaveas', '');
				var file = input.val();
				var callback = instance._fileCallback;
				instance._fileCallback = null;
				input.val('');
				callback(file);
			});


		// Add the hidden input for browsing folders
		var param = true ? 'nwdirectory' : 'webkitdirectory';
		this.folder = $('<input type="file" '+param+' />')
			.css('visibility', 'hidden')
			.change(function(e){
				var input = $(this);
				var folder = input.val();
				var callback = instance._folderCallback;
				instance._folderCallback = null;
				input.val('');
				callback(folder);
			});

		// Add to the body
		$('body').append(
			this.file, 
			this.folder,
			this.saveAs
		);

		// The callback functions
		this._fileCallback = null;
		this._folderCallback = null;
	};

	var p = Browser.prototype = {};

	/**
	*  Singleton instance of the browser
	*/
	var instance;

	/**
	*  Create a new version of the Browser
	*  @method  init
	*  @static
	*  @return {cloudkid.Browser} Instnace of the file browser
	*/
	Browser.init = function()
	{
		if (instance) 
		{
			throw "Only once instance file created at once";
		}
		return new Browser();
	};

	/**
	*  Get the single instance
	*  @property {cc.Browser} instance
	*/
	Object.defineProperty(Browser, "instance", 
		{
			get : function()
			{ 
				return instance; 
			}
		}
	);

	/**
	*  Browse for a folder
	*  @method  folder
	*  @static
	*  @param  {Function} callback The function to call when we selected a folder
	*/
	Browser.folder = function(callback, workingDir)
	{
		if (!instance)
		{
			throw "Call cloudkid.Browser.init() first";
		}
		instance.folder.removeAttr('nwworkingdir');
		if (true && workingDir)
		{
			instance.folder.attr('nwworkingdir', workingDir);
		}
		instance._folderCallback = callback;
		instance.folder.trigger('click');
	};

	/**
	*  Browse for a file
	*  @method  file
	*  @static
	*  @param  {Function} callback The function to call when we selected a file
	*  @param  {string}   [types]    The file types e.g., ".doc,.docx,.xml"
	*  @param {string}	[workingDir] The current working directory
	*/
	Browser.file = function(callback, types, workingDir)
	{
		if (!instance)
		{
			throw "Call cloudkid.Browser.init() first";
		}
		instance.file.removeAttr('accept');
		if (types)
		{
			instance.file.attr('accept', types);
		}
		if (true && workingDir)
		{
			instance.file.attr('nwworkingdir', workingDir);
		}
		instance._fileCallback = callback;
		instance.file.trigger('click');
	};

	/**
	*  Save file as
	*  @method  saveAs
	*  @static
	*  @param  {Function} callback The function to call when we selected a file
	*  @param  {string}   [types]    The file types e.g., ".doc,.docx,.xml"
	*  @param {string}	[workingDir] The current working directory
	*/
	Browser.saveAs = function(callback, filename, workingDir)
	{
		if (!instance)
		{
			throw "Call cloudkid.Browser.init() first";
		}
		instance.saveAs.attr('nwsaveas', filename || "");
		if (true && workingDir)
		{
			instance.saveAs.attr('nwworkingdir', workingDir);
		}
		instance._fileCallback = callback;
		instance.saveAs.trigger('click');
	};

	/**
	*  Remove the singleton
	*  @method destroy
	*/
	Browser.destroy = function()
	{
		if (instance)
		{
			instance.destroy();
		}
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.file.off('change').remove();
		this.folder.off('change').remove();
		this.saveAs.off('change').remove();
		this.file = null;
		this.folder = null;
		this.saveAs = null;
		instance = null;
	};

	// Assign to namespace
	namespace('cloudkid').Browser = Browser;

}());
(function(undefined){
	
	var gui = window.require ? require('nw.gui') : null;
	
	/**
	*  A class for managing dialogs. This class should be contained in your main application
	*  window.
	*  To use a dialog, first register the dialog with ModalManager.register(). You then can
	*  create the registered dialog using ModalManager.open(). When a dialog is opened, the parent
	*  window has a blocker created with a css class of "modal-dialog-blocker".
	*  If the parent window is closed, the dialog will automatically be closed.
	*
	*  @class ModalManager
	*  @namespace cloudkid
	*  @static
	*/
	var ModalManager = {};
	
	/**
	 * Initialization data for dialogs, stored by dialog type.
	 * @property {Object} _dialogInitData
	 * @static
	 * @private
	 */
	ModalManager._dialogInitData = {};
	
	/**
	 * Entries for all active dialogs, to facilitate keeping them on top as well as
	 * callbacks and cleanup.
	 * @property {Array} _activeDialogs
	 * @static
	 * @private
	 */
	ModalManager._activeDialogs = [];
	
	/**
	 * Registers some basic dialog window information under a name for easy creation later.
	 * @method registerDialog
	 * @param {String} type The type of dialog. This value will be the one referenced when creating
	 *                      dialogs with ModalManager.open().
	 * @param {String} pageUrl The HTML page that should be opened by the dialog.
	 * @param {Object} windowOptions Standard Node WebKit window options.
	 * @param {Object} dialogOptions Default options for the dialog, so they don't have to be passed
	 *                               to open() each time.
	 * @param {String} dialogOptions.dialogClass The namespace and class name of the ModalDialog
	 *                                           subclass that should be created.
	 * @static
	 */
	ModalManager.register = function(type, pageUrl, windowOptions, dialogOptions)
	{
		//modal dialogs should always have focus when they open
		windowOptions.focus = true;
		//hide dialogs until they have initialized
		windowOptions.show = false;
		//create an entry for later retrieval
		ModalManager._dialogInitData[type] =
		{
			url: pageUrl,
			windowOptions: windowOptions,
			dialogOptions: dialogOptions
		};
	};
	
	/**
	 * Opens a modal dialog.
	 * @method open
	 * @param {String} type The type of dialog to create.
	 * @param {nw.gui.Window} parent The parent window of the dialog.
	 * @param {Function} callback A callback function for when the dialog is closed.
	 *                            Parameters are dependent on what the specific dialog code
	 *                            sends.
	 * @param {Object} [dialogOptions] Options specific to the dialog system. This will be passed
	 *                               on to the dialog as initialization data. Properties in
	 *                               dialogOptions have priority over the default options passed
	 *                               to registerDialog().
	 * @return {Boolean} true if the dialog was opened successfully, false if the dialog type
	 *                        does not exist or the window already has an open modal dialog.
	 * @static
	 */
	ModalManager.open = function(type, parent, callback, dialogOptions)
	{
		if(!gui)
		{
			if(callback)
				callback();
			return;
		}
		var dialogInitData = ModalManager._dialogInitData[type];
		if(!dialogInitData)
			return false;
		for(var i = 0; i < ModalManager._activeDialogs.length; ++i)
		{
			if(ModalManager._activeDialogs[i].parentWindow == parent)
				return false;
		}
		//create an entry to keep track of the window on
		var data =
		{
			parentWindow: parent,
			focusListener: onFocus.bind(this, parent),
			closedListener: onClosed.bind(this, parent),
			callback: callback,
			options: dialogOptions || {},
			dialogWindow: gui.Window.open(dialogInitData.url, dialogInitData.windowOptions)
		};
		//apply default dialog options.
		for(var key in dialogInitData.dialogOptions)
		{
			if(!data.options.hasOwnProperty(key))
			{
				data.options[key] = dialogInitData.dialogOptions[key];
			}
		}
		ModalManager._activeDialogs.push(data);
		//add an input blocker to the parent window
		var doc = parent.window.document;
		var blocker = doc.createElement("div");
		blocker.className = "modal-dialog-blocker";
		blocker.style.top = "0px";
		blocker.style.left = "0px";
		blocker.style.width = "100%";
		blocker.style.paddingBottom = "100%";
		blocker.style.position = "absolute";
		blocker.style.zIndex = "10";
		parent.window.document.body.appendChild(blocker);
		//add listeners to the parent window to prevent focus nonsense
		//and detect closing of windows
		parent.addListener("focus", data.focusListener);
		parent.addListener("closed", data.closedListener);
		//add a listener for when the dialog is loaded
		data.onLoaded = onDialogLoaded.bind(this, data.dialogWindow);
		data.dialogWindow.addListener("loaded", data.onLoaded);
	};
	
	function onDialogLoaded(dialogWindow)
	{
		for(var i = 0; i < ModalManager._activeDialogs.length; ++i)
		{
			if(ModalManager._activeDialogs[i].dialogWindow == dialogWindow)
			{
				data = ModalManager._activeDialogs[i];
				//remove the listener
				dialogWindow.removeListener("loaded", data.onLoaded);
				delete data.onLoaded;
				//initialize the dialog
				dialogWindow.window.cloudkid.ModalDialog._init(this, dialogWindow, data.options);
			}
		}
	}
	
	/**
	 * Closes a dialog. The dialog will automatically call this function, you do not need to.
	 * @method close
	 * @param {nw.gui.Window} dialogWindow The Window object for the dialog.
	 * @param {*} arguments Additional arguments to pass to the callback for the dialog.
	 * @static
	 * @private
	 */
	ModalManager.close = function(dialogWindow)
	{
		var data;
		for(var i = 0; i < ModalManager._activeDialogs.length; ++i)
		{
			if(ModalManager._activeDialogs[i].dialogWindow == dialogWindow)
			{
				data = ModalManager._activeDialogs[i];
				break;
			}
		}
		if(data)
		{
			var callback = data.callback;
			if(callback)
			{
				if(arguments.length > 1)
					callback.apply(data.parentWindow, Array.prototype.slice.call(arguments, 1));
				else
					callback();
			}
			cleanupDialog(data);
		}
	};
	
	/**
	 * A listener for when a parent of an active dialog receives focus. This function
	 * will be bound on a per-window basis.
	 * @method onFocus
	 * @param {nw.gui.Window} parent The parent window.
	 * @static
	 * @private
	 */
	function onFocus(parent)
	{
		var data;
		for(var i = 0; i < ModalManager._activeDialogs.length; ++i)
		{
			if(ModalManager._activeDialogs[i].parentWindow == parent)
			{
				data = ModalManager._activeDialogs[i];
				//redirect focus
				data.dialogWindow.focus();
				break;
			}
		}
	}
	
	/**
	 * A listener for when a parent of an active dialog is closed. This function
	 * will be bound on a per-window basis.
	 * @method onClosed
	 * @param {nw.gui.Window} parent The parent window.
	 * @static
	 * @private
	 */
	function onClosed(parent)
	{
		var data;
		for(var i = 0; i < ModalManager._activeDialogs.length; ++i)
		{
			if(ModalManager._activeDialogs[i].parentWindow == parent)
			{
				data = ModalManager._activeDialogs[i];
				//remove the window data
				cleanupDialog(data);
				break;
			}
		}
	}
	
	/**
	 * Closes a dialog window and cleans up the dialog.
	 * @method cleanupDialog
	 * @param {Object} data The internal data from _activeDialogs.
	 * @private
	 * @static
	 */
	function cleanupDialog(data)
	{
		var i = ModalManager._activeDialogs.indexOf(data);
		if(i < 0) return;
		
		//remove from the list
		ModalManager._activeDialogs.splice(i, 1);
		var parentWindow = data.parentWindow;
		//remove the blocker
		var nodes = parentWindow.window.document.getElementsByClassName("modal-dialog-blocker");
		for(i = 0; i < nodes.length; ++i)
		{
			nodes[i].parentNode.removeChild(nodes[i]);
		}
		//clean up listeners
		parentWindow.removeListener("focus", data.focusListener);
		parentWindow.removeListener("closed", data.closedListener);
		//tell the dialog to clean itself up
		data.dialogWindow.window.cloudkid.ModalDialog._cleanup();
		//close the dialog
		data.dialogWindow.close(true);
	}
	
	// Assign to namespace
	namespace('cloudkid').ModalManager = ModalManager;

}());
(function ($, window) {

	$.fn.contextMenu = function(settings)
	{
		return this.each(function()
		{
			// Open context menu
			$(this).on("contextmenu", function(e)
			{
				// Open the menu
				if (settings.menuOpened)
				{
					settings.menuOpened.call(this, $(e.target));
				}
				//open menu
				$(settings.menuSelector)
					.data("invokedOn", $(e.target))
					.show()
					.css({
						position: "absolute",
						left: getLeftLocation(e),
						top: getTopLocation(e)
					})
					.off('click')
					.on('click', function (e) {
						$(this).hide();
						var $invokedOn = $(this).data("invokedOn");
						var $selectedMenu = $(e.target);
						
						settings.menuSelected.call(this, $invokedOn, $selectedMenu);
				});
				
				return false;
			});

			//make sure menu closes on any click
			$(document).click(function(){
				$(settings.menuSelector).hide();
			});
		});

		function getLeftLocation(e)
		{
			var mouseWidth = e.pageX;
			var pageWidth = $(window).width();
			var menuWidth = $(settings.menuSelector).width();
			
			// opening menu would pass the side of the page
			if (mouseWidth + menuWidth > pageWidth &&
				menuWidth < mouseWidth)
			{
				return mouseWidth - menuWidth;
			} 
			return mouseWidth;
		}        
		
		function getTopLocation(e)
		{
			var mouseHeight = e.pageY;
			var pageHeight = $(window).height();
			var menuHeight = $(settings.menuSelector).height();

			// opening menu would pass the bottom of the page
			if (mouseHeight + menuHeight > pageHeight &&
				menuHeight < mouseHeight)
			{
				return mouseHeight - menuHeight;
			} 
			return mouseHeight;
		}
	};
})(jQuery, window);
(function(){
	
	/**
	*  Save a captions object as SBV
	*  @class SBVFormat
	*  @namespace springroll.captions.formats  
	*/
	var SBVFormat = {};

	/**
	*  Convert captions array to SBV string
	*  @method format
	*  @static
	*  @param {array} captions The collection of captions
	*  @return {string} The formatted captions
	*/
	SBVFormat.format = function(captions)
	{
		var sbv = "",
			len = captions.length,
			caption;

		for(var i = 0; i < len; i++)
		{
			caption = captions[i];

			sbv += SBVFormat.toTimeCode(caption.start) + "," + 
					SBVFormat.toTimeCode(caption.end) + "\r\n";
			sbv += caption.content + "\r\n";
				
			if (i < len - 1) sbv += "\r\n";
		}
		return sbv;
	};

	/**
	*  Convert milliseconds to timecode H:MM:SS.mmm 
	*  @method toTimeCode
	*  @static
	*  @param {int} milliseconds
	*  @return {String} the formatted timecode
	*/
	SBVFormat.toTimeCode = function(milliseconds)
	{
		var seconds = milliseconds / 1000;
		var timecode;
		if (seconds >= 60)
		{
			timecode = seconds < 3600 ? "0:" : (seconds / 3600) + ":";
			seconds %= 3600;
			var min = parseInt(seconds / 60);
			seconds %= 60;
			timecode += (min < 10 ? "0" + min : min) + ":";
		}
		else
		{
			timecode = "0:00:";
		}
		timecode += seconds < 10 ? "0" + seconds.toFixed(3) : seconds.toFixed(3);
		return timecode;
	};

	// assign to namespace
	namespace('springroll.captions.formats').SBVFormat = SBVFormat;

}());
(function(){
	
	/**
	*  Save a captions object as XML
	*  @class XMLFormat
	*  @namespace springroll.captions.formats  
	*/
	var XMLFormat = {};

	/**
	*  Convert captions array to XML string
	*  @method format
	*  @static
	*  @param {array} captions The collection of captions
	*  @return {string} The formatted captions
	*/
	XMLFormat.format = function(captions)
	{
		var xml = "", 
			len = captions.length,
			caption;

		for(var i = 0; i < len; i++)
		{
			caption = captions[i];

			xml += "\t\t<line startTime=\""+caption.start+"\" endTime=\""+caption.end+"\">\r\n";
			xml += "\t\t\t<![CDATA[" + caption.content + "]]>\r\n";
			xml += "\t\t</line>\r\n";
		}
		return xml;
	};

	/**
	*  Convert a dictionary of all captions
	*  @method formatAll
	*  @static
	*  @param {dictionary} dictionary The map of all captions
	*  @return {string} XML formatted string
	*/
	XMLFormat.formatAll = function(dictionary)
	{
		var captions;
		var xml = "<captions>\r\n";
		for (var alias in dictionary)
		{
			captions = dictionary[alias];

			if (captions)
			{
				captions = captions.lines || captions.lines;

				if (!Array.isArray(captions) || !captions.length) continue;

				xml += "\t<caption alias=\""+alias+"\">\r\n";
				xml += XMLFormat.format(captions);
				xml += "\t</caption>\r\n";
			}
		}
		xml += "</captions>";
		return xml;
	};

	// assign to namespace
	namespace('springroll.captions.formats').XMLFormat = XMLFormat;

}());
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
(function(){

	// Import node modules
	if (true)
	{
		var gui = require('nw.gui'),
			SubMenu = gui.Menu,
			Window = gui.Window,
			MenuItem = gui.MenuItem,
			isOSX = process.platform === 'darwin';
	}

	/**
	*  Application-only system menu
	*  @class Menu
	*  @namespace springroll.captions 
	*  @constructor
	*  @param {function} callback Handler for menu item clicks
	*/
	var Menu = function(callback)
	{
		var main = Window.get();

		/**
		*  The root menu
		*  @property {gui.Menu} parent
		*/
		this.parent = new SubMenu({ type: 'menubar' });

		/**
		*  Handler for the menu click callback
		*  @property {function} callback
		*/
		this.callback = callback;

		/**
		*  The file menu
		*  @property {gui.Menu} file
		*/
		this.file = new SubMenu();

		/**
		*  The file export menu
		*  @property {gui.Menu} export
		*/
		this.exportMenu = new SubMenu();

		if (isOSX)
		{
			// Create the build in mac menubar
			// this needs to happen BEFORE assigning the menu
			this.parent.createMacBuiltin("CaptionCreator");
		}

		// Create the file menu
		this.createFileMenu(this.file, this.exportMenu);

		// Add menu access to dev tools
		if (true)
		{
			// mac already has the windows menu
			if (isOSX)
			{
				var items = this.parent.items;
				this.winMenu = items[items.length - 1].submenu;
				this.addSeparator(this.winMenu);
			}
			else
			{
				this.winMenu = new SubMenu();
				this.parent.append(new MenuItem({
					label: 'Window',
					submenu: this.winMenu
				}));
			}

			// Add menu access for the dev console
			this.addItem({
				label: "Show Developer Tools",
				key: "j",
				modifiers: "cmd-alt",
				click: function()
				{
					main.showDevTools();
				}
			}, this.winMenu);
		}

		// Assign the new menu to the window
		main.menu = this.parent;

		this.enabled = false;
	};

	// Reference to the prototype
	var p = Menu.prototype;

	/**
	*  Add a new item to a menu
	*  @method addItem
	*  @param {object} settings MenuItem settings
	*  @param {MenuItem} submenu The Menu to add the item to
	*/
	p.addItem = function(settings, submenu)
	{
		var item = new MenuItem(settings);
		if (!settings.click)
		{
			item.click = this._onClick.bind(this, item);
		}
		submenu.append(item);
		return item;
	};

	/**
	*  Construct the file menu
	*  @method createFileMenu
	*  @param {gui.Menu} file The root file menu
	*  @
	*/
	p.createFileMenu = function(file, exportMenu)
	{
		// add after the app menu
		this.parent.insert(new MenuItem({
			label: 'File',
			submenu: file
		}), (isOSX ? 1 : 0));

		// Create the file menu
		this.open = this.addItem({
			label:"Open Project...",
			key: "o",
			modifiers: "cmd"
		}, file);

		this.save = this.addItem({
			label:"Save Project",
			key: "s",
			modifiers: "cmd"
		}, file);

		this.reload = this.addItem({
			label:"Reload Project",
			key: "r",
			modifiers: "cmd-shift"
		}, file);

		this.addSeparator(file);
		this.sync = this.addItem({label:"Sync Audio Files"}, file);
		this.addSeparator(file);

		this.exports = this.addItem({
			label:"Export",
			submenu: exportMenu
		}, file);

		this.exportXML = this.addItem({label:"Export XML..."}, exportMenu);
		this.exportSBV = this.addItem({label:"Export SBV..."}, exportMenu);

		this.addSeparator(file);

		this.close = this.addItem({
			label:"Close Project",
			key: "w",
			modifiers: "cmd"
		}, file);
	};

	/**
	*  The click handler
	*  @method _onClick
	*/
	p._onClick = function(item)
	{
		if (this.callback)
		{
			this.callback(item);
		}
	};

	/**
	*  Add a new separator to a menu
	*  @method addSeparator
	*  @param {object} settings MenuItem settings
	*  @param {MenuItem} submenu The Menu to add the separator to
	*/
	p.addSeparator = function(submenu)
	{
		submenu.append(new MenuItem({
			type: 'separator'
		}));
	};

	/**
	*  If the menu is enabled for a project
	*  @property {boolean} enabled
	*/
	Object.defineProperty(p, 'enabled', {
		set: function(enabled)
		{
			this._enabled = enabled;
			this.close.enabled = enabled;
			this.exports.enabled = enabled;
			this.save.enabled = enabled;
			this.sync.enabled = enabled;
			this.reload.enabled = enabled;
		}
	});

	// Assign to namespace
	namespace('springroll.captions').Menu = Menu;

}());
(function(undefined){

	/**
	*  Class for managing the project data
	*  @class Project
	*/
	var Project = function()
	{
		/**
		*  The current project folder
		*  @property {string} dir
		*/
		this.dir = null;

		/**
		*  The dictionary collection of locales
		*  @property {Dictionary} locales
		*/
		this.locales = null;

		/**
		*  The collection of assets with id and src fields
		*  @property {Array} assets
		*/
		this.assets = null;

		/**
		*  The collection of captions by alias
		*  @property {Dictionary} captions
		*/
		this.captions = null;

		/**
		 * The modal dialog
		 * @property {jquery} modal
		 */
		this.modal = new springroll.captions.ProjectModal("#newProject");

		/**
		*  The currently selected locale
		*  @property {string} _local
		*  @private
		*/
		this._locale = null;

		/**
		*  If the project has been loaded
		*  @property {boolean} loaded
		*/
		this.loaded = false;
	};

	// Reference to the prototype
	var p = Project.prototype;

	/**
	*  Load the caption file and project for the current locale
	*  @method open
	*  @param {string} dir The directory to load
	*  @param {function} callback Function handler when completed
	*/
	p.open = function(dir, callback)
	{
		this.close();
		this.dir = dir;
		var self = this;

		if (true)
		{
			var path = require('path');
			var fs = require('fs');
			var file = path.join(dir, '.captions');

			if (!fs.existsSync(file))
			{
				if (true)
				{
					console.info("Project file doesn't exist!");
				}
				// create a new project
				this.create(file, callback);
				return;
			}
			fs.readFile(file, function(err, data){

				if (err)
				{
					callback(null);
					throw err;
				}
				// Finish the loading
				self.onProjectLoaded(JSON.parse(data), callback);
			});
		}
		if (false)
		{
			$.getJSON(
				// cache bust the file request for AJAX request
				dir + "/.captions?cb=" + Math.random() * 10000,
				function(data)
				{
					self.onProjectLoaded(data, callback);
				}
			);
		}
	};

	/**
	 * The project is loadd
	 * @method  onProjectLoaded
	 * @private
	 * @param  {object}   data     The JSON data object
	 * @param  {Function} callback Callback when done
	 */
	p.onProjectLoaded = function(data, callback)
	{
		// No projects file!
		if (!data)
		{
			callback(null);
			return;
		}
		this.locales = data.locales;
		this.assets = data.assets;
		this.setLocale('default', function(project){
			this.loaded = !!project;
			callback(project);
		}.bind(this), true);
	};

	/**
	 * Create a new project
	 * @param  {string}   file     The .caption file path
	 * @param  {Function} callback Callback when done
	 */
	p.create = function(file, callback)
	{
		var fs = require('fs'),
			path = require('path'),
			glob = require('glob'),
			self = this,
			dir = path.dirname(file);

		this.modal.open(dir, function(result){

			// Failed!
			if (!result)
			{
				callback(null);
				return;
			}

			var audioPath = result.audioPath,
				exportPath = result.exportPath,
				cwd = path.join(dir, audioPath);

			// Select all OGG file from the audio folder
			glob('**/*.ogg', {cwd:cwd}, function(err, files) {

				if (err)
				{
					callback(null);
					throw err;
				}

				var assets = [];

				_.each(files, function(file){
					assets.push({
						id : path.basename(file, '.ogg'),
						src : file
					});
				});

				// Add an empty export file if there isn't one
				var exportFile = path.join(dir, exportPath);
				if (!fs.existsSync(exportFile))
				{
					if (true)
					{
						console.log("Save empty captions file " + exportFile);
					}
					fs.writeFileSync(exportFile, "{}");
				}

				// Dummy project file
				var data = {
					"assets" : assets,
					"locales" : {
						"default" : {
							"path" : audioPath,
							"export" : exportPath
						}
					}
				};

				// Write the project to file
				fs.writeFileSync(file, JSON.stringify(data, null, "\t"));

				// Continue with loading the new created project
				self.onProjectLoaded(data, callback);
			});
		});
	};

	/**
	*  Load the current locale
	*  @method setLocale
	*  @param {string} lang The current locale
	*  @param {fuction} callback The callback when done setting
	*  @param {boolean} [init=false] If this is the initial load
	*/
	p.setLocale = function(lang, callback, init)
	{
		// If not initial check if we're loaded
		if (!init) this._isLoaded();

		var locale = this._isLocale(lang);

		// Update the local
		this._locale = lang;

		if (!locale.export)
		{
			throw "No export file is available for the locale " + lang;
		}

		var exportPath;
		if (true)
		{
			var path = require('path');
			var fs = require('fs');
			exportPath = path.join(this.dir, locale.export);
			this.captions = JSON.parse(fs.readFileSync(exportPath) || '{}');
			callback(this);
		}
		if (false)
		{
			exportPath = this.dir + "/" + locale.export;
			// The load captions dictionary for the current locale
			$.getJSON(exportPath + "?cb=" + Date.now(), function(data){

				this.captions = data || {};
				callback(this);

			}.bind(this));
		}
	};

	/**
	*  Save the current project
	*  @method save
	*/
	p.save = function()
	{
		this._isLoaded();
		var locale = this._isLocale();

		if (true)
		{
			var fs = require('fs');
			var path = require('path');
			fs.writeFileSync(
				path.join(this.dir, locale.export),
				JSON.stringify(this.captions, null, "\t")
			);
			fs.writeFileSync(
				path.join(this.dir, ".captions"),
				JSON.stringify({
					locales: this.locales,
					assets: this.assets
				}, null, "\t")
			);
		}
		if (false && true)
		{
			console.log("Saving... " + this.dir + "/" + locale.export);
			console.log("Saving... " + this.dir + "/.captions");
		}
	};

	/**
	*  Add a new local to the project
	*  @method addLocale
	*  @param {string} lang The language identifier ("en", "fr", etc)
	*  @param {string} path The local path to the audio assets
	*  @param {string} exportPath The local path to the export JSON file,
	*         including the file name.
	*/
	p.addLocale = function(lang, path, exportPath)
	{
		this._isLoaded();
		if (this.locales[lang] !== undefined)
		{
			throw "Locale is added alrady with the language " + lang;
		}
		this.locales[lang] = {
			path : path,
			export : exportPath
		};
	};

	/**
	*  Remove the localization
	*  @method removeLocale
	*  @param {string} lang The language identifier ("en", "fr", etc)
	*/
	p.removeLocale = function(lang)
	{
		this._isLoaded();
		this._isLocale(lang);
		delete this.locales[lang];
	};

	/**
	*  Delete the caption by alias also remove asset
	*  @method removeCaption
	*/
	p.removeCaptions = function(alias)
	{
		this._isLoaded();
		var asset = this._isAsset(alias, true);
		delete this.captions[alias];

		if (asset)
		{
			// Remove the asset
			var len = this.assets.length;
			for(var i = 0; i < len; i++)
			{
				if (this.assets[i].id == alias)
				{
					this.assets.splice(i, 1);
					return;
				}
			}
		}
	};

	/**
	*  Look at the audio folder and re-sync the project
	*  @method resync
	*  @param {function} callback Callback when new assets are added.
	*/
	p.resync = function(callback)
	{
		this._isLoaded();
		var locale = this._isLocale();

		if (true)
		{
			var path = require('path'),
				glob = require('glob'),
				self = this,
				assets = [];

			_.each(this.assets, function(asset){
				assets.push(asset.src);
			});

			// Select all OGG file from the audio folder
			glob('**/*.ogg', {cwd: this.getAudioPath() }, function(err, files){

				if (err)
				{
					throw err;
				}

				var newAssets = [];
				_.each(files, function(file){
					if (assets.indexOf(file) === -1)
					{
						if (true)
						{
							console.log("Found new audio file: " + file);
						}
						var asset = {
							id: path.basename(file, '.ogg'),
							src: file
						};
						self.assets.push(asset);
						newAssets.push(asset);
					}
				});

				// If new assets were added re-save and refresh
				if (newAssets.length)
				{
					callback(newAssets);
				}
			});
		}
	};

	/**
	*  Get the audio source path for an alias on the current local
	*  @method getAudioSource
	*  @param {string} alias to get audio for
	*  @return {string} full path to the audio file
	*/
	p.getAudioSource = function(alias)
	{
		this._isLoaded();
		var locale = this._isLocale();
		var asset = this._isAsset(alias);

		if (true)
		{
			var path = require('path');
			return path.join(this.dir, locale.path, asset.src);
		}
		if (false)
		{
			return this.dir + "/" + locale.path + "/" + asset.src;
		}
	};

	/**
	 * Get the current locale path to audio files
	 * @method  getAudioPath
	 * @return {string} The path to the path
	 */
	p.getAudioPath = function()
	{
		var locale = this._isLocale();
		if (true)
		{
			var path = require('path');
			return path.join(this.dir, locale.path);
		}
		if (false)
		{
			return this.dir + "/" + locale.path;
		}
	};

	/**
	*  Update the aliase for an asset
	*  @method updateAlias
	*  @param {string} oldAlias The old alias to change
	*  @param {string} newAlias The new alias to change to
	*  @return {boolean} If it was changed
	*/
	p.changeAlias = function(oldAlias, newAlias)
	{
		this._isLoaded();

		if (this.captions[newAlias])
		{
			throw "Caption alias conflict when changing '" +
				oldAlias + "' to '" + newAlias + "'";
		}

		if (this._isAsset(newAlias, true))
		{
			throw "Asset alias conflict when changing to '" +
				oldAlias + "' to '" + newAlias + "'";
		}

		var asset = this._isAsset(oldAlias, true);

		// Asset COULD be optional if the caption doesn't have an
		// audio file associated with it.
		if (asset)
		{
			// Update current asset
			asset.id = newAlias;
		}

		// Replace the captions object
		this.captions[newAlias] = this.captions[oldAlias];
		delete this.captions[oldAlias];

		return true;
	};

	/**
	*  Get the current list of captions
	*  @method getCaptions
	*  @param {string} alias The caption alias
	*  @return {array} The list of caption lines
	*/
	p.getCaptions = function(alias)
	{
		this._isLoaded();
		this._isAsset(alias);

		var captions = this.captions[alias];

		if (_.isObject(captions) && captions.lines)
		{
			return captions.lines;
		}
		else if (_.isArray(captions))
		{
			return captions;
		}
		else
		{
			return [];
		}
	};

	/**
	*  Set the captions for an alias
	*  @method setCaptions
	*  @param {string} alias The optional alias, default uses currently opened
	*  @param {array} captions The new collection of captions
	*/
	p.setCaptions = function(alias, captions)
	{
		this._isLoaded();
		this._isAsset(alias);
		this.captions[alias] = captions;
	};

	/**
	*  Is the current alias valid
	*  @method _isAsset
	*  @private
	*  @param {string} alias
	*  @param {boolean} suppressError if throwing should be suppressed
	*/
	p._isAsset = function(alias, suppressError)
	{
		var len = this.assets.length;
		for(var i = 0; i < len; i++)
		{
			if (this.assets[i].id == alias)
			{
				return this.assets[i];
			}
		}
		if (!suppressError)
		{
			throw "Unable to find an alias matching : " + alias;
		}
		return null;
	};

	/**
	*  Is the current alias is a valid caption
	*  @method _isCaption
	*  @private
	*  @param {string} alias
	*  @param {boolean} suppressError if throwing should be suppressed
	*  @return {boolean} If a caption is found
	*/
	p._isCaption = function(alias, suppressError)
	{
		if (this.captions[alias] === undefined)
		{
			if (!suppressError)
			{
				throw "Caption doesn't exist for alias : " + alias;
			}
			return false;
		}
		return true;
	};

	/**
	*  Check to see if the current project is loaded
	*  @method _isLoaded
	*  @private
	*/
	p._isLoaded = function()
	{
		if (!this.loaded)
		{
			throw "Project isn't loaded yet!";
		}
	};

	/**
	*  Check for a locale if it exists
	*  @method _isLocale
	*  @private
	*  @param {string} [lang] The locale to check for
	*  @return {object} The current local
	*/
	p._isLocale = function(lang)
	{
		lang = lang || this._locale;

		if (this.locales[lang] === undefined)
		{
			throw "Locale is not found for " + lang;
		}
		return this.locales[lang];
	};

	/**
	*  Close the current project
	*  @method close
	*/
	p.close = function()
	{
		this.assets = null;
		this.locales = null;
		this._locale = null;
		this.loaded = false;
		this.captions = null;
		this.dir = null;
	};

	/**
	*  Represent the class as a string
	*  @method toString
	*  @return {string} string rep of the project
	*/
	p.toString = function()
	{
		return "[Project dir='" + this.dir + "']";
	};

	// Assign to namespace
	namespace('springroll.captions').Project = Project;

}(!!window.require));
(function(){

	// Import classes
	var Browser = cloudkid.Browser;

	/**
	*  The list of aliases
	*  @class List
	*  @namespace springroll.captions 
	*  @constructor
	*  @param {string} selector The jquery select for the parent node
	*/
	var List = function(selector)
	{
		this.parent = $(selector);
		this._onSelect = this._onSelect.bind(this);

		this.filename = $("#filename");

		/**
		*  The currently selected button
		*  @property {jquery} current
		*/
		this.current = null;

		// Set the context menu settings
		// these don't change for each item
		// so we'll only create it once
		contextMenu = {
			menuSelector: "#aliasMenu",
			menuOpened: this.menuItemOpened.bind(this),
			menuSelected: this.menuItemSelected.bind(this)
		};
	};

	// Reference to the prototype
	var p = List.prototype;

	/**
	*  List item context menu settings
	*  @property {object} contextMenu
	*  @private
	*/
	var contextMenu;

	/**
	*  Handler when a context menu is opened
	*  @method menuItemOpened
	*  @private
	*  @param {jquery} button The jquery button element
	*/
	p.menuItemOpened = function(button)
	{
		var src = button.data('src');

		if (src)
		{
			if (true)
			{
				var path = require('path');
				src = path.basename(src);
			}
			if (false)
			{
				var index = src.lastIndexOf("/");
				if (index > -1)
					src = src.substr(index + 1);
			}
		}
		else
		{
			src = "[no audio file]";
		}

		this.filename.html(src);
	};

	/**
	*  Handler when a menu item is selected
	*  @method menuItemSelected
	*  @private
	*  @param {jquery} button The jquery button element
	*  @param {jquery} menuItem The menu item selected
	*/
	p.menuItemSelected = function(button, menuItem)
	{
		var alias = button.text();
		switch(menuItem.text())
		{
			case "Rename" :
			{
				var newAlias = prompt("Rename the alias", alias);
				if (newAlias && newAlias !== alias)
				{
					if (this.getButton(newAlias).length)
					{
						throw "Button already matches with alias '"+newAlias+"'";
					}
					button.text(newAlias)
						.attr('data-alias', newAlias)
						.data('alias', newAlias);
					this.parent.trigger('change', [alias, newAlias]);
				}
				break;
			}
			case "Delete" :
			{
				if (confirm("Are you sure you want to delete '" + alias + "'?"))
				{
					this.parent.trigger('delete', [alias]);
				}
				break;
			}
			case "Choose Audio..." :
			{
				this.parent.trigger('selectAudioSrc', [
					alias,
					button.data('status') == -2,
					button
				]);
				break;
			}
		}
	};

	/**
	*  Remove all items
	*  @method removeAll
	*/
	p.removeAll = function()
	{
		// Remove all elements
		this.parent.find('button').off('click');
		this.parent.empty();

		// Remove current selected
		this.current = null;
	};

	/**
	*  Remove the current selected item
	*  @method remove
	*/
	p.remove = function(alias)
	{
		this.getButton(alias).off('click').remove();
		if (this.current && this.current.data('alias') == alias)
		{
			this.current = null;
		}
	};

	/**
	*  Deselect the button
	*  @method delect a button by alias
	*  @param {string} alias The caption alias
	*  @return {boolean} If it was successfully deselected
	*/
	p.deselect = function(alias)
	{
		if (this.current && this.current.data('alias') == alias)
		{
			this.current.removeClass('active');
			this.current = null;
			return true;
		}
		return false;
	};

	/**
	*  Get a button by alias
	*  @method getButton
	*  @param {string} alias The alias to search for
	*/
	p.getButton = function(alias)
	{
		return $("button[data-alias='"+alias+"']");
	};

	/**
	*  Add an item to the display
	*  @method addAlias
	*  @param {string} alias The caption alias
	*  @param {int} status 0 = no captions, 1 = has captions, -1 = no audio file, -2 = no asset connection
	*  @param {string} src Audio file location
	*/
	p.addAlias = function(alias, status, src)
	{
		// check that file exists!
		var button = $("<button></button>")
			.addClass("btn btn-sm")
			.html(alias)
			.attr('data-alias', alias)
			.data('alias', alias)
			.data('status', status)
			.data('src', src)
			.click(this._onSelect)
			.contextMenu(contextMenu);

		resetStatus(button);

		this.parent.append(button);
	};

	/**
	*  Get the current status by alias
	*  @method setStatus
	*  @param {string} alias the name of the alias
	*  @param {int} The status
	*/
	p.setStatus = function(button, status)
	{
		button.data('status', status);
		resetStatus(button);
	};

	/**
	*  Refresh the button status style
	*  @method resetStatus
	*  @private
	*  @param {jquery} button The button object
	*/
	var resetStatus = function(button)
	{
		var c;
		switch(button.data('status'))
		{
			case -2 :
			case -1 : c = "btn-danger"; break;
			case 0 : c = "btn-default"; break;
			case 1 : c = "btn-success"; break;
		}
		button.removeClass("btn-success btn-default btn-danger")
			.addClass(c);
	};

	/**
	*  Clicking on an item
	*  @method _onSelect
	*  @private
	*/
	p._onSelect = function(e)
	{
		if (this.current)
		{
			this.current.removeClass('active');
		}

		var button = $(e.currentTarget),
			src = button.data('src'),
			status = button.data('status'),
			alias = button.data('alias');

		if (status < 0)
		{
			var message = !src ?
				"No audio file found for this caption. Locate it?" :
				"Unable to locate audio file '" + src + "' for asset '" + alias + "'. Locate it?";

			if (confirm(message))
			{
				this.parent.trigger('selectAudioSrc', [alias, status == -2]);
			}
			return;
		}

		// Remove any custom class and set as selected
		button.addClass("active").blur();

		resetStatus(button);

		// Fire the event
		this.parent.trigger('selectAlias', [alias]);

		this.current = button;
	};

	// Assign to namespace
	namespace('springroll.captions').List = List;

}());

(function(){

	/**
	*  The playback controls
	*  @class Timeline
	*  @namespace springroll.captions 
	*  @constructor
	*  @param {string} selector The jquery select for the parent node
	*/
	var Controls = function(selector)
	{
		this.parent = $(selector);

		this.addButton = $("#addButton");
		this.deleteButton = $("#deleteButton");
		this.backwardButton = $("#backwardButton");
		this.forwardButton = $("#forwardButton");
		var playButton = this.playButton = $("#playButton");
		this.stopButton = $("#stopButton");
		this.saveButton = $("#saveButton");
		this.volumeButton = $("#volumeButton");

		$('[data-toggle="confirmation"]').confirmation({
			onConfirm : this.onDelete.bind(this)
		});

		/**
		*  The wave form display and playback control
		*  @property WaveSurfer
		*/
		var waveform = this.waveform = Object.create(WaveSurfer);

		this.waveform.init({
			container: $('#wave')[0],
			waveColor:  'rgba(0,0,0,0.2)',
			progressColor: 'rgba(0,0,0,0)',
			minPxPerSec: 100,
			height:80,
			normalize: true,
			fillParent: false,
			//interact: false,
			cursorWidth: 1,
			cursorColor:"#c00"
		});

		var finish = function(){
			if (!waveform.backend.isPaused())
				waveform.stop();
			playButton.removeClass('active');
		};

		waveform.on('finish', finish);

		// Hack to catch some progress event not triggering finish
		waveform.on('progress', function(p){
			if (1 - p < 0.005) {
				finish();
			}
		});

		waveform.on('ready', function(){
			this.setVolume(localStorage.getItem('isLow'));
			this.enabled = true;
		}.bind(this));

		if (true)
		{
			waveform.on('error', function(e){
				console.error(e);
			});
		}

		this.enabled = false;
	};

	// Reference to the prototype
	var p = Controls.prototype;

	/**
	 * The lower volume amount
	 * @property {Number} LOW_VOLUME
	 * @private
	 * @readOnly
	 */
	var LOW_VOLUME = 0.33;

	/**
	*  If the controls are enabled
	*  @property {boolean} enabled
	*/
	Object.defineProperty(p, "enabled", {
		get: function()
		{
			return this._enabled;
		},
		set: function(enabled)
		{
			var oldEnabled = this._enabled;
			this._enabled = enabled;
			var buttons = this.parent.find('button');
			buttons.removeClass('disabled').attr('disabled', !enabled);
			this.parent.removeClass('disabled');
			
			var waveform = this.waveform;

			var playButton = this.playButton.click(function(){
				waveform.playPause();
				playButton.removeClass('active');
				if (!waveform.backend.isPaused()) {
					playButton.addClass('active');
				}
			});
			this.stopButton.click(function(){
				if (!waveform.backend.isPaused())
					waveform.stop();
				else
					waveform.seekTo(0);
				playButton.removeClass('active');
			});
			this.forwardButton.click(function(){
				waveform.skipForward();
			});
			this.backwardButton.click(function(){
				waveform.skipBackward();
			});
			this.volumeButton.click(function(){
				this.setVolume(!this.volumeButton.hasClass('active'));
			}.bind(this));

			$(document).keyup(function(e){
				
				// Different key commants for textareas
				if (e.target.nodeName == "TEXTAREA") return;
				
				switch(e.keyCode)
				{
					case 32 : //space
						this.playButton.click(); 
						break;
					
					case 39 : // right
						this.forwardButton.click(); 
						break;
					
					case 37 : // left
						this.backwardButton.click(); 
						break;
					
					case 13 : // enter
						this.addButton.click(); 
						break;
					
					case 27 : // esc
						this.stopButton.click(); 
						break;

					case 38 : // up
						this.setVolume();
						break;
					
					case 40 : // down
						this.setVolume(true);
						break;
					
				}			
			}.bind(this));

			if (oldEnabled != enabled)
			{
				this.addButton.toggleClass('btn-primary')
					.toggleClass('btn-default');

				this.saveButton.toggleClass('btn-success')
					.toggleClass('btn-default');

				this.deleteButton.toggleClass('btn-danger')
					.toggleClass('btn-default');
			}

			if (!enabled)
			{
				$(document).off('keyup');

				playButton.off('click');
				this.volumeButton.off('click');
				this.stopButton.off('click');
				this.forwardButton.off('click');
				this.backwardButton.off('click');

				buttons.addClass('disabled');
				this.parent.addClass('disabled');
			}
		}
	});

	/**
	*  Open an audio file
	*  @method open
	*  @param {string} src The path to the audio file
	*/
	p.open = function(src)
	{
		this.close();

		if (true)
		{
			var waveform = this.waveform;
			var xhr = new XMLHttpRequest();
		    xhr.onload=function()
		    {  
		        waveform.loadArrayBuffer(xhr.response);
		    };
		    xhr.open("GET", src, true);
		    xhr.responseType = "arraybuffer"; 
		    xhr.send();
		}
		else
		{
			this.waveform.load(src);
		}
	};


	/**
	 * Set the current volume
	 * @method setVolume
	 * @param {boolean} [isLow=false] If the volume is highest
	 */
	p.setVolume = function(isLow)
	{
		if (!isLow)
		{
			this.volumeButton.removeClass('active');
		}
		else
		{
			this.volumeButton.addClass("active");
		}
		localStorage.setItem('isLow', isLow);
		this.waveform.setVolume(isLow ? LOW_VOLUME : 1);
	};

	/**
	*  Close the audio file and clear the audio buffer
	*  @method close
	*/
	p.close = function()
	{
		try {
			// Throws and error if no audio is loaded
			// we'll just ignore that and seek if we can
			this.waveform.seekTo(0);
		} catch(e){}
		
		this.waveform.empty();
		this.enabled = false;
		this.playButton.removeClass('active');
	};

	/**
	*  Handler for confirm delete
	*  @method onDelete
	*  @private
	*/
	p.onDelete = function()
	{
		this.parent.trigger('delete');
	};

	// Assign to namespace
	namespace('springroll.captions').Controls = Controls;

}());
(function(undefined){

	/**
	*  Manage the timeline area
	*  @class Timeline
	*  @namespace springroll.captions 
	*  @constructor
	*  @param {string} selector The jquery select for the parent node
	*/
	var Timeline = function(selector)
	{
		this._onResizeCurrent = this._onResizeCurrent.bind(this);

		var dragOptions = {
			axis: "x",
			drag: this._onResizeCurrent,
			stop: this._onResizeCurrent
		};

		this.parent = $(selector).scroll(this._onScroll.bind(this));
		this.captions = $("#captions");
		this.removeButton = $("#removeButton");
		this.resizeLeft = $("#resizeLeft").draggable(dragOptions);
		this.resizeRight = $("#resizeRight").draggable(dragOptions);

		// Currently focused caption
		this.currentCaption = null;

		// function binds
		this.onCaptionsFocus = this.onCaptionsFocus.bind(this);
		this.blur = this.blur.bind(this);
		this.removeCurrent = this.removeCurrent.bind(this);
		this._onKeyUp = this._onKeyUp.bind(this);

		// Remove the current caption
		this.removeButton.click(this.removeCurrent);

		// Set the current 
		this.enabled = false;
		this.hideControls();

		$(document).mouseup(this._onBlur.bind(this));
	};

	// Reference to the prototype
	var p = Timeline.prototype;

	// The timeline rate in pixels per millseconds
	var RATE = 100 / 1000;

	// The min width
	var MIN_WIDTH = 75;

	/**
	*  The list of controls
	*  @property {array} CONTROLS_IDS
	*  @readOnly
	*  @static
	*/
	var CONTROLS_IDS = ['removeButton', 'resizeLeft', 'resizeRight'];

	/**
	*  Add a new caption to the timeline
	*  @method addCaption
	*  @param {string} text The text to add
	*  @param {int} [start] start time in milliseconds
	*  @param {int} [end] start time in milliseconds
	*  @param {boolean} [focus=false] if we should focus after adding
	*  @return {jquery} caption object
	*/
	p.addCaption = function(text, start, end, focus)
	{
		var textarea = $("<textarea class='form-control'></textarea>");
		textarea.text(text || "");

		// Handlers
		textarea.focus(this.onCaptionsFocus)
			.keyup(this._onKeyUp)
			.attr('disabled', !this._enabled);

		if (start !== undefined && end !== undefined)
		{
			textarea.css('left', start * RATE)
				.width((end - start) * RATE);
		}

		// Add to the list of captions
		this.captions.append(textarea);

		if (!!focus)
		{
			textarea.trigger('focus');
		}

		return textarea;
	};

	/**
	*  Key up handler for the textareas
	*  @method _onKeyUp
	*  @private
	*/
	p._onKeyUp = function(e)
	{
		if (e.keyCode == 27) // Esc
		{
			this.blur();
			e.preventDefault();
		}
		else if (e.keyCode == 46) // del
		{
			this.removeCurrent();
			e.preventDefault();
		}
	};

	/**
	*  Focus handler for the captions
	*  @method onCaptionsFocus
	*  @private
	*  @param {event} jquery focus event
	*/
	p.onCaptionsFocus = function(e)
	{
		if (this.currentCaption)
		{
			this.currentCaption.removeClass('current');
		}

		var textarea = $(e.currentTarget);
		var pos = textarea.position();
		var right = textarea.outerWidth() + pos.left;

		this.resizeLeft.show().css('left', pos.left);
		this.resizeRight.show().css('left', right - this.resizeRight.outerWidth());
		this.removeButton.show().css('left', right);

		this.currentCaption = textarea.addClass('current');
	};

	/**
	*  Drag event to resize the current element
	*  @method _onResizeCurrent
	*  @private
	*/
	p._onResizeCurrent = function()
	{
		var scrollLeft = this.parent.scrollLeft();
		var left = scrollLeft + this.resizeLeft.position().left;
		var right = scrollLeft + this.resizeRight.position().left + this.resizeRight.outerWidth();

		this.currentCaption.outerWidth(right - left).css('left', left);
		this.removeButton.css('left', right);
	};

	/**
	*  Get the current scroll position and updat background
	*  @method _onScroll
	*  @private
	*/
	p._onScroll = function()
	{
		this.parent.css('background-position-x', -1 * this.parent.scrollLeft());
	};

	/**
	*  Blur on clicking outside the target
	*  @method _onBlur
	*  @private
	*/
	p._onBlur = function(e)
	{
		// Cannot be a decent of parent
		if (this.parent.has(e.target).length === 0)
		{
			this.blur();
		}
	};

	/**
	*  Blur the current selection
	*  @method blur
	*/
	p.blur = function()
	{
		this.hideControls();
		if (this.currentCaption)
		{
			this.currentCaption.blur();
			this.currentCaption.removeClass('current');
		}
		this.currentCaption = null;
	};

	/**
	*  Hide the controls
	*  @method hideControls
	*/
	p.hideControls = function()
	{
		this.resizeLeft.hide();
		this.resizeRight.hide();
		this.removeButton.hide();
	};

	/**
	*  If we have a caption at the current time
	*  @method hasCaption
	*  @param {int} time The time in millseconds
	*/
	p.hasCaption = function(time)
	{
		// convert time to length
		time *= RATE;
		var captions = this.captions.find('textarea');
		var pos, caption;
		for (var i = 0; i < captions.length; i++)
		{
			caption = captions.eq(i);
			pos = caption.position();
			if (time >= pos.left && time <= pos.left + caption.outerWidth())
			{
				return caption;
			}
		}
		return null;
	};

	/**
	*  If the panel is enabled and ready to changed captions
	*  @property {boolean} enabled
	*/
	Object.defineProperty(p, 'enabled', {
		set: function(enabled)
		{
			this._enabled = enabled;

			this.parent.removeClass('disabled');
			var captions = this.captions.find('textarea')
				.attr('disabled', !enabled);

			if (!enabled)
			{
				this.parent.addClass('disabled');
				this.blur();
			}
		},
		get: function()
		{
			return this._enabled;
		}
	});

	/**
	*  Get the data representation for this
	*  @property {array} data
	*/
	Object.defineProperty(p, 'data', {
		get : function()
		{
			var data = [];
			this.captions.find('textarea').each(function(){
				var textarea = $(this);
				var content = textarea.val().trim().replace('/\n|\r/', '');

				// Block adding empty captions
				if (!content) return;
				
				var left = textarea.position().left;
				data.push({
					content: textarea.val(),
					start: (left / RATE) | 0,
					end: ((left + textarea.outerWidth()) / RATE) | 0
				});
			});
			return data;
		},
		set : function(lines)
		{
			this.removeAll();
			var self = this;
			_.each(lines, function(line){
				self.addCaption(
					line.content || "",
					line.start || 0,
					line.end || 2000
				);
			});
		}
	});

	/**
	*  Remove all the captions
	*  @method removeAll
	*/
	p.removeAll = function()
	{
		this.parent.scrollLeft(0);
		this.removeCurrent();
		this.captions.children()
			.off('keyup focus')
			.remove();
			
		this.enabled = false;
	};

	/**
	*  Remove the current caption
	*  @method removeCurrent
	*/
	p.removeCurrent = function()
	{
		var currentCaption = this.currentCaption;
		this.blur();
		if (currentCaption)
		{
			currentCaption.off('keyup focus').remove();
		}
	};

	// Assign to namespace
	namespace('springroll.captions').Timeline = Timeline;

}());

(function(){

	// Import classes
	var NodeWebkitApp = cloudkid.NodeWebkitApp,
		Browser = cloudkid.Browser,
		Controls = springroll.captions.Controls,
		Timeline = springroll.captions.Timeline,
		List = springroll.captions.List,
		Project = springroll.captions.Project,
		Menu = springroll.captions.Menu,
		ModalManager = cloudkid.ModalManager,
		XMLFormat = springroll.captions.formats.XMLFormat,
		SBVFormat = springroll.captions.formats.SBVFormat;

	/**
	*  The main application
	*  @class Captions
	*  @namespace springroll.captions 
	*/
	var Captions = function()
	{
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
			.click(this.close.bind(this))
			.hide();

		/**
		*  The node webkit menu
		*  @property {gui.Menu} menu The GUI menu
		*/
		this.menu = null;

		// Lets create the menu
		if (true)
		{
			this.menu = new Menu(this._menuHandler.bind(this));
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

		if (false && true)
		{
			this.open('example');
		}

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
			if (true)
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

			self.open(true ? file.path : file.name);
		});
		
		//Register the unsaved changes dialog
		ModalManager.register(
			"SaveDialog",
			"assets/dialogs/saveDialog.html",
			// Window options:
			{
				title: "Save Changes",
				position: "center",
				resizable: false,
				width: 400,
				height: 125,
				toolbar: false,
				frame: true,
				fullscreen: false
			},
			// Dialog options:
			{
				dialogClass: "springroll.captions.SaveDialog",
				message: "You have unsaved changes. Would you like to save?",
				buttons:
				[
					{id:"save", value:"Save"},
					{id:"cancel", value:"Cancel"},
					{id:"doNotSave", value:"Don't Save"}
				]
			});
	};

	// Reference to the prototype
	var p = Captions.prototype;

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

			if (true)
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

	if (true)
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
					this.close();
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
								if (true)
								{
									var fs = require('fs');
									fs.writeFileSync(file, SBVFormat.format(caption));
								}
								if (false)
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
					if (true)
					{
						var path = require('path');
						defaultName = path.basename(this.project.dir);
					}
					if (false)
					{
						defaultName = "Project";
					}
					var captions = this.project.captions;
					Browser.saveAs(
						function(file)
						{
							if (true)
							{
								var fs = require('fs');
								fs.writeFileSync(file, XMLFormat.formatAll(captions));
							}
							if (false)
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

				if (true)
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
				exists = true ? require('fs').existsSync(src) : true;

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
		this.close();

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
					if (true)
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
		if(this.pending)
		{
			ModalManager.open(
				"SaveDialog",
				this.main,
				this._saveDialogClosed.bind(
					this,
					this.open.bind(this, this.project.dir)
				)
			);
		}
		else
		{
			this.open(this.project.dir);
		}
	};

	/**
	*  Handler when the main node-webkit window closes
	*  @method _onClose
	*  @method protected
	*  @param {event} e The event close
	*/
	p._onClose = function(e)
	{
		if(this.pending)
		{
			if (e) e.preventDefault();

			ModalManager.open(
				"SaveDialog",
				this.main,
				this._saveDialogClosed.bind(this, s._onClose.bind(this))
			);
		}
		else
		{
			s._onClose.call(this);
		}
	};
	
	/**
	*  Callback on the on saved dialog closed
	*  @method _saveDialogClosed
	*  @param {function} next Method to do after 
	*  @param {String} result
	*/
	p._saveDialogClosed = function(next, result)
	{
		if (result == "Save")
		{
			this.project.save();
			this.pending = false;
			next();
		}
		else if (result == "Don't Save")
		{
			this.pending = false;
			next();
		}
	};

	/**
	*  Close the current project
	*  @method close
	*/
	p.close = function()
	{
		if(this.pending)
		{
			ModalManager.open(
				"SaveDialog",
				this.main,
				this._saveDialogClosed.bind(this, this.close.bind(this))
			);
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

	// Assign to namespace
	//namespace('springroll.captions').Captions = Captions;

	// Create the app on window loaded
	$(function(){ window.module = new Captions(); });

}());
//# sourceMappingURL=captions.js.map