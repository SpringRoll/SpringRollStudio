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
	*  @param {nw.gui.Window} main Reference to the window
	*  @param {function} callback Handler for menu item clicks
	*/
	var Menu = function(main, callback)
	{
		// Create the new menu
		var parent = new gui.Menu({ type: 'menubar' });

		if (isOSX)
		{
			parent.createMacBuiltin("SpringRoll Studio");
		}

		/**
		*  The root menu
		*  @property {gui.Menu} parent
		*/
		this.parent = parent;

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
		this.view = new SubMenu();

		// Create menus
		this.createFileMenu(this.file);
		this.createViewMenu(this.view);

		// Assign the new menu to the window
		main.menu = parent;

		// Listen for focus and re-assign menu
		main.on('focus', function(){
			main.menu = parent;
		});

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
	*/
	p.createFileMenu = function(file)
	{
		// add after the app menu
		this.parent.insert(new MenuItem({
			label: 'File',
			submenu: file
		}), (isOSX ? 1 : 0));

		this.new = this.addItem({
			label:"New Project",
			key: "n",
			modifiers: "cmd"
		}, file);

		this.open = this.addItem({
			label:"Open...",
			key: "o",
			modifiers: "cmd"
		}, file);

		this.addSeparator(file);

		this.close = this.addItem({
			label:"Close Project",
			key: "w",
			modifiers: "cmd"
		}, file);
	};

	/**
	*  Construct the view menu
	*  @method createViewMenu
	*  @param {gui.Menu} view The root view menu
	*/
	p.createViewMenu = function(view)
	{
		// add after the app menu
		this.parent.insert(new MenuItem({
			label: 'View',
			submenu: view
		}), (isOSX ? 3 : 1));

		this.captions = this.addItem({
			label:"Captions",
			key: "c",
			modifiers: "cmd-alt"
		}, view);

		this.tasks = this.addItem({
			label:"Tasks",
			key: "t",
			modifiers: "cmd-alt"
		}, view);

		this.preview = this.addItem({
			label:"Preview",
			key: "p",
			modifiers: "cmd-alt"
		}, view);

		this.remote = this.addItem({
			label:"Remote Trace",
			key: "r",
			modifiers: "cmd-alt"
		}, view);

		// Add menu access to dev tools
		if (DEBUG)
		{
			this.addSeparator(view);

			// Add menu access for the dev console
			this.tools = this.addItem({
				label: "Show Developer Tools",
				key: "j",
				modifiers: "cmd-alt"
			}, view);
		}
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
			this.captions.enabled = enabled;
			this.preview.enabled = enabled;
			this.tasks.enabled = enabled;
		}
	});

	// Assign to namespace
	namespace('springroll').SpringRollStudioMenu = Menu;

}());