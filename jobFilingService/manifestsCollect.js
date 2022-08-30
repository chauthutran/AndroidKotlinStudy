
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

		var files = fs.readdirSync( dir );
		
		files.forEach( fileName => 
		{
			var file_wtPath = path.resolve( dir, fileName );
		
			if ( fileName === 'manifest.json' ) 
			{
				try
				{
					var topManifestStr = fs.readFileSync( file_wtPath, { encoding:'utf8', flag:'r' } );
					topManifest = JSON.parse( topManifestStr );	
				}
				catch( errMsg )  {  console.log( errMsg );  }
			} 
			else
			{			
				var stat = fs.statSync( file_wtPath );

				if ( stat && stat.isDirectory() ) 
				{
					try
					{
						var projFiles = fs.readdirSync( file_wtPath );
	
						for ( var i = 0; i < projFiles.length; i++ )
						{
							var projFileName = projFiles[i];

							if ( projFileName === 'manifest.json' )
							{
								var manifestFile_wtPath = path.resolve( file_wtPath, 'manifest.json' );
	
								var dataStr = fs.readFileSync( manifestFile_wtPath, { encoding:'utf8', flag:'r' } );
			
								results.push( JSON.parse( dataStr ) );	

								break;
							}
						}
					}
					catch( errMsg )  {  console.log( errMsg );  }
				}
			}
		});

		doneCallBack( results, topManifest );
  	};
};
  
module.exports = { ManifestsCollect };
