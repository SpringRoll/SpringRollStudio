(function(){

	if (APP)
	{
		// Global node modules
		var fs = require('fs');
		var path = require("path");
	}

	// Import classes
	var TerminalWindow = springroll.tasks.TerminalWindow,
		Settings = springroll.tasks.Settings;
	
	/**
	*  The main interface class
	*  @class Interface
	*  @namespace springroll.tasks
	*  @constructor
	*  @param {springroll.tasks.TaskRunner} app The instance of the app
	*/
	var Interface = function(app)
	{
		$("#refreshTasks").click(function(){
			app.refreshTasks();
		});

		var body = $('body').on(
			'dblclick',
			'.JS-Task-Toggle-Info',
			function()
			{
				var button = $(this).find('.JS-Task-Run');
				app.toggleTask(button.data('task-name'));
				return false;
			}
		)
		.on(
			'click',
			'.JS-Task-Run',
			function()
			{
				app.toggleTask($(this).data('task-name'));
				return false;
			}
		)
		.on(
			'click',
			'.JS-Task-Terminal',
			function(e)
			{
				var button = $(this);
				var taskName = button.data('task-name').toString();

				if (!app.terminal)
				{
					app.terminal = new TerminalWindow(taskName);
				}
				else
				{
					app.terminal.open(taskName);
				}
				return false;
			}
		)
		.on(
			'click',
			'.JS-Task-Stop',
			function()
			{
				app.toggleTask($(this).data('task-name'));
				return false;
			}
		);

		$(document).on(
			'dragover',
			function handleDragOver(event)
			{
				event.stopPropagation();
				event.preventDefault();
			}
		);
	};

	// Assign to namespace
	namespace('springroll.tasks').Interface = Interface;

}());