(function(undefined){
	
	var ModalDialog = cloudkid.ModalDialog;

	/**
	*  A simple dialog class for dialogs with a message and an arbitrary number of buttons.
	*  In the HTML page, an element with the id of "dialogMessage" contains the message text,
	*  and an element with the id of "dialogButtons" contains the Button elements that are made.
	*  The dialog callback for SaveDialog will be passed the text of the selected button. If
	*  the dialog window was closed without choosing a button, then nothing will be passed to
	*  the dialog callback.
	*
	*  @class SaveDialog
	*  @namespace springroll.captions 
	*  @constructor
	*  @param {Object} options Dialog options, specific to the type of dialog.
	*  @param {String} options.message Message to display in the dialog.
	*  @param {Array} options.buttons String text to display on the buttons. When a button
	*                                 is clicked, the dialog closes and the button text of the
	*                                 clicked button is passed to the callback.
	*/
	var SaveDialog = function(options)
	{
		ModalDialog.call(this);
		
		$("#dialogMessage").text(options.message);

		for(var i = 0; i < options.buttons.length; ++i)
		{
			var buttonData = options.buttons[i];
			$("#"+buttonData.id).click(
				this.onButton.bind(this, buttonData.value)
			);
		}
	};
	
	// Reference to the prototype
	var p = SaveDialog.prototype = Object.create(ModalDialog.prototype);
	
	/**
	*  Close dialog and send the button text to the callback
	*  @method onButton
	*  @param The button value
	*/
	p.onButton = function(buttonValue)
	{
		ModalDialog.close(buttonValue);
	};
	
	/**
	*  Destroy don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		ModalDialog.prototype.destroy.call(this);
		
		$("button").off("click");
	};
	
	// Assign to namespace
	namespace('springroll.captions').SaveDialog = SaveDialog;

}());