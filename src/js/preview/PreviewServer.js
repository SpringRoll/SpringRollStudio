(function()
{
	if (APP)
	{
		var connect = require('connect');
		var serveStatic = require('serve-static');
		var path = require('path');
		var ip = require('ip');
	}

	/**
	 * The server wrapper
	 * @class PreviewServer
	 * @constructor
	 * @param {String} project Full path to the project
	 */
	var PreviewServer = function(project)
	{
		if (APP)
		{
			/**
			 * Instance of the node server
			 * @property {Server} _server
			 * @private
			 */
			this._server = null;

			/**
			 * The default title
			 * @property {String} title
			 */
			this.title = path.basename(project);

			/**
			 * The port to use
			 * @property {int} port
			 * @readOnly
			 */
			this.port = 3333;

			/**
			 * The default ip address
			 * @property {String} address
			 */
			this.address = ip.address();

			var app = connect();

			// Create an alias for the game
			app.use('/game', serveStatic(
				path.join(project, 'deploy'),
				{'index': ['index.html']}
			));

			// Made the main to the prevew page
			app.use(serveStatic(
				path.resolve('.'),
				{'index': ['preview-client.html']} 
			));

			// Handle info for the remote server request
			app.use('/title', function(req, res)
			{
				res.end(JSON.stringify(this.title));
			}
			.bind(this));

			this._server = app.listen(this.port);
			enableDestroy(this._server);
		}
	};

	// Reference to the prototpye
	var p = PreviewServer.prototype;

	/**
	 * Enable destroying of the server
	 * @method enableDestroy
	 * @param {Server} server The server reference
	 */
	function enableDestroy(server)
	{
		var connections = {};
		server.on('connection', function(conn)
		{
			var key = conn.remoteAddress + ':' + conn.remotePort;
			connections[key] = conn;
			conn.on('close', function()
			{
				delete connections[key];
			});
		});

		server.destroy = function(cb)
		{
			server.close(cb);
			for (var key in connections)
				connections[key].destroy();
		};
	}

	/**
	 * Destroy the server
	 * @method destroy
	 * @param {Function} callback Callback function
	 */
	p.destroy = function(callback)
	{
		if (this._server)
		{
			this._server.destroy(callback);
			this._server = null;
		}
	};

	// Assign to namespace
	namespace('springroll').PreviewServer = PreviewServer;

}());