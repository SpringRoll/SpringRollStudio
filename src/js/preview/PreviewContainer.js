(function(undefined){
	
	// Import classes
	var Container = include('springroll.Container'),
		Features = include('springroll.Features'),
		SavedData = include('springroll.SavedData'),
		Tracker = include('pbskids.Tracker');

	/**
	*  The main class for the site
	*  @class PreviewContainer
	*  @namespace springroll
	*/
	var PreviewContainer = function()
	{
		Container.call(this, "#appContainer", {
			helpButton: "#helpButton",
			captionsButton: "#captionsButton",
			soundButton: "#soundButton",
			voButton: "#voButton",
			sfxButton: "#sfxButton",
			musicButton: "#musicButton",
			pauseButton: "#pauseButton, #resumeButton"
		});

		// Disable the form submitting
		$('form').submit(function(e)
		{
			return false;
		});

		/**
		*  The entire game view including the standard game buttons
		*  @property {jquery} frame
		*/
		this.frame = $("#frame");

		/**
		*  The game player
		*  @property {springroll.Container} container
		*/
		this.on({
			learningEvent: onLearningEvent.bind(this),
			analyticEvent: onAnalyticEvent.bind(this),
			open: onOpen.bind(this),
			opened: onOpened.bind(this),
			pause: onPauseToggle.bind(this),
			helpEnabled: onHelpEnabled.bind(this),
			closed: onClosed.bind(this),
			features: onFeatures.bind(this),
			unsupported: function(){
				alert("Your current web browser doesn't support this games features.");
			},
			remoteFailed: function(){
				alert('Invalid API request');
			},
			remoteError: function(err){
				alert(err);
			}
		});

		/**
		 * The Progress tracker client for sending events 
		 * @property {pbskids.Tracker} tracker
		 */
		this.tracker = new Tracker();
		this.tracker.setEnabled(false);

		/**
		*  The game title area
		*  @property {jquery} appTitle
		*/
		this.appTitle = $("#appTitle");

		/**
		*  Button for connecting to the remote host
		*  @property {jquery} remoteConnect
		*/
		this.remoteConnect = $("#remoteConnect")
			.click(this.connectLoggingService.bind(this));

		/**
		*  The toggle button for captions options
		*  @property {jquery} captionsToggle
		*/
		this.captionsToggle = $("#captionsToggle");

		/**
		*  The toggle button for sound options
		*  @property {jquery} soundToggle
		*/
		this.soundToggle = $("#soundToggle");

		/**
		*  The toggle for the settings
		*  @property {jquery} settingsButton
		*/
		this.settingsButton = $("#settingsButton");

		/**
		*  The name of the remote host or ip address
		*  @property {jquery} remoteHost
		*/
		this.remoteHost = $("#remoteHost")
			.val(SavedData.read('remoteHost'));

		/**
		*  The name of the remote channel name
		*  @property {jquery} remoteChannel
		*/
		this.remoteChannel = $("#remoteChannel");

		/**
		* Toggle the control drop down options
		* @property {jquery} dropdowns
		*/
		var dropdowns = this.dropdowns = $(".drop-down");

		/**
		* The toggle buttons
		* @property {jquery} toggles
		*/
		this.toggles = $("button[data-toggle-div]").each(function(){
			var toggle = $(this);
			var selector = toggle.data('toggle-div');
			var dropdown = $(selector);
			toggle.on('click hover', function(e){
				var showing = dropdown.hasClass('on'); 
				dropdowns.removeClass('on');
				if (!showing)
					dropdown.addClass('on');
			});
		});

		// Change the captions style
		$("#captionsStyles select").change(onCaptionsStyles.bind(this));

		// Get the current saved styles
		var styles = this.getCaptionsStyles();
		$("select[name='color']").val(styles.color);
		$("select[name='background']").val(styles.background);
		$("select[name='align']").val(styles.align);
		$("select[name='font']").val(styles.font);
		$("select[name='size']").val(styles.size);
		$("select[name='edge']").val(styles.edge);

		if (!Features.touch)
		{
			// Turn on the tooltips
			$('[data-toggle="tooltip"]').tooltip();
		}

		// Turn off the tool tip for the help button initially
		this.helpEnabled = false;
	};

	// Reference to the prototype
	var p = extend(PreviewContainer, Container);

	/**
	*  Handle the progress tracker events
	*  @method onAnalyticEvent
	*  @private
	*  @param {object} data THe event data
	*/
	var onAnalyticEvent = function(data)
	{
		this.tracker.remoteSend("ga-event", data);
	};

	/**
	*  Handle the progress tracker events
	*  @method onLearningEvent
	*  @private
	*  @param {object} data THe event data
	*/
	var onLearningEvent = function(data)
	{
		this.tracker.pushEvent(data);
	};

	/**
	*  Handler for change in captions settings
	*  @method onCaptionsStyles
	*  @private
	*/
	var onCaptionsStyles = function(e)
	{
		var select = e.currentTarget;
		this.setCaptionsStyles(select.name, select.value);
	};

	/**
	*  Handle features
	*  @method onFeatures
	*  @private
	*  @param {object} features
	*/
	var onFeatures = function(features)
	{		
		this.captionsToggle.hide();
		this.soundToggle.hide();
		this.settingsButton.hide();

		if (features.captions) this.captionsToggle.show();
		if (features.sound) this.soundToggle.show();
		if (features.learning) this.settingsButton.show();
	};

	/**
	 * Handler to connect to the remote host
	 * @method connectLoggingService
	 * @private
	 */
	p.connectLoggingService = function()
	{
		var host = this.remoteHost.val();
		var channel = this.remoteChannel.val();
		SavedData.write('remoteHost', host);
		if (host)
		{
			this.tracker.remoteConnect(host);
		}
		if (channel)
		{
			this.tracker.remoteChannel(channel);
		}
	};

	/**
	 * Help button changes enabled status
	 * @method onHelpEnabled
	 * @private
	 * @param  {boolean} enabled If the help button is enabled
	 */
	var onHelpEnabled = function(enabled)
	{
		if (Features.touch) return;

		var helpButton = this.helpButton;
		if (enabled)
		{
			helpButton.tooltip();
		}
		else
		{
			helpButton.tooltip('destroy');
		}
	};

	/**
	 * Handler for the paused changed
	 * @method onPauseToggle
	 * @private
	 */
	var onPauseToggle = function(paused)
	{
		this.frame.removeClass('paused');
		if (paused)
		{
			this.frame.addClass('paused');
		}
	};

	/**
	 * Start loading the release
	 * @method  loadRelease
	 * @param {Object} [options] The additional options
	 * @param {boolean} [options.debug=false] Run the debug version
	 * @param {String} [options.queryString=""] Query string parameters
	 */
	var onOpen = function()
	{
		this.dropdowns.removeClass('on');
		this.toggles.addClass('disabled');
		this.frame.addClass('loading');
	};

	/**
	*  Game finishes loading
	*  @method onOpened
	*  @private
	*/
	var onOpened = function()
	{
		this.frame.removeClass('loading');
		this.toggles.removeClass('disabled');
		this.paused = false;
	};

	/**
	*  Handler when a game is closed
	*  @method onClosed
	*  @private
	*/
	var onClosed = function()
	{
		this.dropdowns.removeClass('on');
		this.toggles.addClass('disabled');
	};	

	// Assign to namespace
	namespace('springroll').PreviewContainer = PreviewContainer;

}());