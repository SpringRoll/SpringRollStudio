(function(){

	// Import node modules
	if (APP)
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
			this.parent.createMacBuiltin("Caption Creator");
		}

		// Create the file menu
		this.createFileMenu(this.file, this.exportMenu);

		// Add menu access to dev tools
		if (DEBUG)
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