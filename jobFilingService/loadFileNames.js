
var fs = require('fs');
var path = require('path');


// { fileBase: fileBase, reqData: req.body, settings }
// req.body: isLocal: true/false, app: 'pwa-dev', isListingApp: ture/false

class FileNameList 
{
	constructor() {};

	// File Listing Start --> use 'walk'
	filesListing( dir, dataJson, MEM_jobFiles, doneCallBack ) 
	{
		var self = this;
		var newMemoryOne = {};

		try
		{
			var folderInfo = fs.statSync( dir );

			// Check if memory one already has proper version, use that instead.
			var memoryOne = self.checkInMemory( folderInfo, dataJson, MEM_jobFiles );

			if ( memoryOne && memoryOne.results ) {
				doneCallBack(null, memoryOne.results, { msg: 'Memory Used', mtime: memoryOne.mtime });
			}
			else
			{
				newMemoryOne = self.createInMemory( folderInfo, dataJson, MEM_jobFiles );

				self.walk( dir, dataJson, MEM_jobFiles, function( error, results ) {
					newMemoryOne.results = results;
					doneCallBack( error, results, {} );
				});
			}
		}
		catch ( errMsg ) 
		{  
			doneCallBack('ERROR in filesListing try/catch overall level, ' + errMsg, [], {} );			
		}			
	};

	// Property of this class, but as function/method
 	walk( dir, dataJson, MEM_jobFiles, doneCallBack ) 
	{
		var self = this;
		var results = [];

		try
		{
			// STEP 1. Read projDir folder contents (files & folders in it), and recursively traverse them..
			fs.readdir( dir, function( err, list ) 
			{
				if (err) return doneCallBack(err);
				var i = 0;

				(function nextFileProcess() {
					var file = list[i++];

					// Success finish, done step - no more files to process, thus, return with result
					if (!file) 
					{
						return doneCallBack(null, results);
					} 
					else
					{
						file = path.resolve(dir, file);

						fs.stat(file, function(err, stat) 
						{
							if (stat && stat.isDirectory()) 
							{
								if ( self.isListingApp_jobAidFoler( dataJson, file ) ) 
								{ 
									nextFileProcess(); 
								}
								else
								{
									self.walk(file, dataJson, MEM_jobFiles, function(err, res) {
										results = results.concat(res);
										nextFileProcess();
									});	
								}
							} 
							else 
							{
								var filePath = file.split( dataJson.reqData.appName )[1].split("\\").join("/");
								results.push( { filePath: filePath, size: stat.size } );
								
								nextFileProcess();
							}
						});
					}
				})();
			});
		}
		catch ( errMsg ) 
		{  
			return doneCallBack('ERROR in LoadFileNames try/catch overall level, ' + errMsg, [] );			
		}
  	};


	// Property of this class, but as function/method
	isListingApp_jobAidFoler( dataJson, file )
	{
		return ( dataJson.reqData.isListingApp && file.indexOf( dataJson.settings.jobAidDir ) >= 0 );
	};


	// Property of this class, but as function/method
	checkInMemory( folderInfo, dataJson, MEM_jobFiles )
	{
		var memoryOne = {};
		
		try
		{		
			// This could be 'projDir' or 'listingApp'
			var itemName = '';
			
			if ( dataJson.reqData.projDir ) itemName = dataJson.reqData.projDir;
			else if ( dataJson.reqData.isListingApp ) itemName = 'jobListingApp';

			if ( folderInfo && folderInfo.mtime && itemName && MEM_jobFiles[itemName] )
			{
				var memProjItem = MEM_jobFiles[itemName];

				if ( memProjItem && memProjItem.mtime && memProjItem.mtime >= folderInfo.mtime && memProjItem.results )
				{
					memoryOne = memProjItem; //memProjItem.results;
				}
			}
		}
		catch ( errMsg ) 
		{
			console.log( 'ERROR catched, LoadFileNames.check_useMemory, ' + errMsg );
		}

		return memoryOne;		
	};

	createInMemory( folderInfo, dataJson, MEM_jobFiles )
	{		
		var memoryOne = {};

		try
		{		
			// This could be 'projDir' or 'listingApp'
			var itemName = '';
			
			if ( dataJson.reqData.projDir ) itemName = dataJson.reqData.projDir;
			else if ( dataJson.reqData.isListingApp ) itemName = 'jobListingApp';

			if ( itemName )
			{
				MEM_jobFiles[itemName] = {};
				memoryOne = MEM_jobFiles[itemName];	

				memoryOne.mtime = folderInfo.mtime;
			}
		}
		catch ( errMsg ) 
		{
			console.log( 'ERROR catched, LoadFileNames.createInMemory, ' + errMsg );
		}

		return memoryOne;		
	};

}
  
module.exports = { FileNameList };
