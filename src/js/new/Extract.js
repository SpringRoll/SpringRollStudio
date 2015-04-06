(function()
{
	if (APP)
	{
		var path = require('path');
		var fs = require('fs-extra');
		var unzip = require('unzip');
	}

	/**
	 * Extract abstraction
	 * @class Extract
	 * @static
	 */
	var Extract = {};

	/**
	 * Extract a zip file
	 * @method run
	 * @static
	 * @param  {String}   zipPath    The path to the zip file
	 * @param  {String}   outputPath The output folder
	 * @param  {Function} callback   Callback when completed or errored
	 */
	Extract.run = function(zipPath, outputPath, callback)
	{
		// Read the zipfile
		fs.createReadStream(zipPath)

			// Parse the contents
			.pipe(unzip.Parse())

			// Read each entry
			.on('entry', function(entry)
			{
				console.log(entry.type + " :: " + entry.path);

				// remove the root directory which is <team>-<Repo>-<sha>
				var localFile = entry.path.substr(entry.path.indexOf('/') + 1);
				var outputFile = path.join(outputPath, localFile);

				if (entry.type == "Directory")
				{
					fs.mkdirsSync(outputFile);
				}
				else
				{
					console.log("Copy file " + outputFile);

					// Copy the file to output location
					entry.pipe(fs.createWriteStream(outputFile));
				}
			})
			.on('close', function()
			{
				console.log("Completed unzip");
				callback();
			});
	};

	// Assign to namespace
	namespace('springroll.new').Extract = Extract;
	
}());