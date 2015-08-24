$(function()
{
	// Get the server info like the path etc
	$.getJSON('/title', function(title)
	{
		var container = new springroll.PreviewContainer();
		container.appTitle.text(title);
		container.remoteChannel.val(title);
		container.connectLoggingService();
		container.open('/game');
	});

});