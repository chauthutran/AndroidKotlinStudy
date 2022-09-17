
var fs = require('fs');
var path = require('path');

// { fileBase: fileBase, reqData: req.body, settings }
// req.body: isLocal: true/false, app: 'pwa-dev', isListingApp: ture/false

class ManifestsCollect
{
	constructor() {};

 	collect( dir, dataJson, doneCallBack ) 
	{
		var topManifest = {};
		var results = [];  // {};

		try
		{
			var topLvl_files = fs.readdirSync( dir );
		
			topLvl_files.forEach( fileName => 
			{
				var file_wtPath = path.resolve( dir, fileName );
			
				// #1. Top level (overall) manifest file
				if ( fileName === 'manifest.json' ) 
				{
					try
					{
						var topManifestStr = fs.readFileSync( file_wtPath, { encoding:'utf8', flag:'r' } );
						topManifest = JSON.parse( topManifestStr );	
					}
					catch( errMsg )  {  console.log( errMsg );  }
				} 
				// #2. Out of folder (prefered) manifest file - changed from each folder manifest file
				else if ( fileName.indexOf( '_manifest.json' ) > 0 )
				{
					try
					{
						var dataStr = fs.readFileSync( file_wtPath, { encoding:'utf8', flag:'r' } );
						results.push( JSON.parse( dataStr ) );	
					}
					catch( errMsg )  {  console.log( errMsg );  }
				}
			});
		}
		catch( errMsg )  {  console.log( errMsg );  }

		doneCallBack( results, topManifest );
  	};
};
  
module.exports = { ManifestsCollect };

