
var fs = require('fs');
var path = require('path');


// { fileBase: fileBase, reqData: req.body, settings }
// req.body: isLocal: true/false, app: 'pwa-dev', isListingApp: ture/false

class FileNameList 
{
	constructor() {}

	//self = this;

 	walk( dir, dataJson, done ) 
	{
		var self = this;
		var results = [];

		//var dir = self.getDirLocation( dataJson );

		fs.readdir( dir, function( err, list ) 
		{
			if (err) return done(err);
			var i = 0;

			(function next() {
				var file = list[i++];

				if (!file) return done(null, results);

				file = path.resolve(dir, file);

				fs.stat(file, function(err, stat) 
				{
					if (stat && stat.isDirectory()) 
					{
						if ( self.isListingApp_jobAidFoler( dataJson, file ) ) 
						{ 
							next(); 
						}
						else
						{
							self.walk(file, dataJson, function(err, res) {
								results = results.concat(res);
								next();
							});	
						}
					} 
					else 
					{
						var filePath = file.split( dataJson.reqData.appName )[1].split("\\").join("/");
						results.push( filePath );
						next();
					}
				});
			})();

		});
  	};

	isListingApp_jobAidFoler( dataJson, file )
	{
		return ( dataJson.reqData.isListingApp && file.indexOf( dataJson.settings.jobAidDir ) >= 0 );
	};
}
  
module.exports = { FileNameList };
