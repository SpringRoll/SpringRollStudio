(function(){

	if (APP)
	{
		// Import modules
		var gui = require('nw.gui');
	}

	// Import classes
	var Settings = springroll.tasks.Settings;

	/**
	*  The Terminal Window manages the output of a task into it's own console window
	*  @class TerminalWindow
	*  @namespace springroll.tasks
	*  @constructor
	*  @param {String} projectId The unqiue project id
	*  @param {String} taskName The task name
	*/
	var TerminalWindow = function(projectId, taskName)
	{
		/**
		*  The unique project id
		*  @property {String} projectId
		*/
		this.projectId = projectId;

		/**
		*  The name of the task
		*  @property {String} taskName
		*/
		this.taskName = taskName;

		/**
		*  The jQuery node for the task output
		*  @property {jquery} output
		*/
		this.output = null;

		/**
		*  The DOM element on the output window
		*  @property {DOM} terminal
		*/
		this.terminal = null;

		/**
		*  Reference to the nodejs window
		*  @property {nw.gui.Window} main
		*/
		this.main = null;

		/**
		*  The observer to watch changes in the output
		*  @property {MutationObserver} observer
		*/
		this.observer = null;

		// create the new window
		this.create();
	};

	// Reference to the prototype
	var p = TerminalWindow.prototype = {};

	/** 
	*  The window reference
	*  @property {String} WINDOW_ALIAS
	*  @private
	*  @static
	*/
	var WINDOW_ALIAS = 'TasksTerminalWindow';

	/**
	*  Open the dialog
	*  @method create
	*/
	p.create = function()
	{
		// Open the new window
		this.main = gui.Window.get(
			window.open('tasks-terminal.html'), {
				show : false
			}
		);
		this.main.on('close', this.close.bind(this));
		this.main.on('loaded', this.onLoaded.bind(this));
	};

	/**
	*  Open after the DOM is loaded on the new window
	*  @method onLoaded
	*/
	p.onLoaded = function()
	{
		Settings.loadWindow(WINDOW_ALIAS, this.main);

		// Get the dom output
		this.terminal = this.main.window.document.getElementById('terminal');

		// Setup the observer
		this.observer = new MutationObserver(this.onUpdate.bind(this));

		// Open the constructor task
		this.open(this.projectId, this.taskName);
	};

	/**
	*  Everytime the output is updated
	*  @method onUpdate
	*  @private
	*/
	p.onUpdate = function()
	{
		this.terminal.innerHTML = this.output.innerHTML;

		// Scroll to the bottom of the output window
		this.terminal.scrollTop = this.terminal.scrollHeight;
	};

	/**
	*  New
	*  @method open
	*  @param {String} projectId The unqiue project id
	*  @param {String} taskName The task name
	*/
	p.open = function(projectId, taskName)
	{
		if (this.observer)
		{
			this.observer.disconnect();
		}
		this.terminal.innerHTML = "";

		this.projectId = projectId;
		this.taskName = taskName;
		this.output = document.getElementById('console_' + projectId + "_" + taskName);
		
		// Update the title
		this.main.title = this.taskName;

		// define what element should be observed by the observer
		// and what types of mutations trigger the callback
		this.observer.observe(this.output, {
			attributes: true,
			childList: true,
			characterData: true
		});
		this.onUpdate();

		// Reveal the window
		this.main.show();
		this.main.focus();
	};

	/**
	*  Close the window
	*  @method close
	*  @private
	*/
	p.close = function()
	{
		if (this.observer)
		{
			this.observer.disconnect();
		}
		this.output = null;
		this.terminal.innerHTML = "";
		Settings.saveWindow(WINDOW_ALIAS, this.main);
		this.main.hide();
	};

	/**
	*  Destroy and don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.close();
		this.observer = null;
		this.terminal = null;
		this.main.close(true);
		this.main = null;
	};

	// Assign to global space
	namespace('springroll.tasks').TerminalWindow = TerminalWindow;

}());