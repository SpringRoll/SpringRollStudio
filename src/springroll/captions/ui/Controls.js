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

		if (DEBUG)
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

		if (APP)
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