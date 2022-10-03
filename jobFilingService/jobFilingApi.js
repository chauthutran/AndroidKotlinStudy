var express = require('express');
const bodyParser = require("body-parser");
//const router = express.Router();
const app = express();

const { FileNameList } = require('./loadFileNames.js');
const fileNameList = new FileNameList();
const { ManifestsCollect } = require('./manifestsCollect.js');
const manifestsCollect = new ManifestsCollect();

// app.use("/", router);  // add router in the Express app.

// ---------------------------------
// --- 'list' - Getting the files under a directory
// --- 'manifests' - Getting each folder/dir and collect manifest
//          - 2nd phase will be how to save theses ('even' list) <-- cache the info.. (place in memory - variable)
//          - Unless the file is changed (file update mark on top level.. (for both 'list' & 'manifest'))


// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// "c:\\WORKS\\SOFTWARES\\apache-tomcat\\webapps\\pwa-dev\\jobs\\"
//const fileLoc = '/opt/tomcat/apache-tomcat-9.0.22/webapps/pwa-dev/jobs';

const settings = {
   jobsDir: 'jobs'
   , jobAidDir: 'jobAid'
   , fileBaseServ: '/opt/tomcat/apache-tomcat-9.0.22/webapps'
   , fileBaseLocl: 'C:\\Users\\james\\Documents\\GitHub\\connectPWA\\deploy'
};

// -------------------------------------
// --- Memory Variable
var MEM_manifestResp = undefined;  // Set it as undefined for false case..
var MEM_jobFiles = {}; // Each 'projDir' gets added under this.

// -------------------------------------

const portNum = 8383;
const PORT = process.env.PORT || portNum;

app.listen(PORT, function () {
   console.log('jobsFiling service listening on port ' + portNum);
});

// ----------------------------------
// --- Routs..

app.get('/list', (req, res) => 
{
   try
   {      
      // reqData = { 'isLocal': localCase, 'appName': 'pwa-dev', 'isListingApp': true, projDir: 'EN' };
      var reqData = JSON.parse(req.query.optionsStr);
      var dataJson = getDataJson( reqData, settings );
      var dir = getDirLocation(dataJson);

      fileNameList.filesListing(dir, dataJson, MEM_jobFiles, function (errMsg, results, info) 
      {
         if (errMsg) res.json({ list: [], results: [], errMsg: Util_formatErrMsg( errMsg.toString() ) });
         else
         {               
            // NEW: if outerMediaFoler: 'folderName' is used, walk that folder as well..
            if ( reqData.outerMediaFoler )
            {
               var mediaDir = getDirLocation(dataJson, reqData.outerMediaFoler );

               // For 'MEM_jobFiles', we need to change 'projDir' for this case?  --> or set as 'projDir_media'?
               fileNameList.filesListing(mediaDir, dataJson, MEM_jobFiles, function (errMsg, results_media, info) 
               {
                  if (errMsg) res.json({ list: [], results: [], errMsg: Util_formatErrMsg( errMsg.toString() ) });
                  else
                  { 
                     results = results.concat(results_media);
                     results.sort((a,b) => b.size - a.size);
                     var list = results.map( item => item.filePath );

                     res.json({ list: list, results: results, info: info });
                  }
               });      
            }
            else
            {
               // order the list by size..
               results.sort((a,b) => b.size - a.size);
               var list = results.map( item => item.filePath );

               res.json({ list: list, results: results, info: info });
            }
         }

      });
   }
   catch( errMsg )
   {
      res.json({ list: [], results: [], errMsg: Util_formatErrMsg( errMsg.toString() ) });
   }
});


app.get('/jobFilesInMemory', (req, res) => 
{
   try
   {
      if ( MEM_jobFiles )
      {
         var projDir = req.query.projDir;

         if ( !projDir ) res.json( MEM_jobFiles );
         else 
         {
            if ( MEM_jobFiles[projDir] ) res.json( MEM_jobFiles[projDir] );
            else res.json( { ERROR_NOTE: 'projDir "' + projDir + '" data in memory' } );   
         }
      }
      else res.json( { ERROR_NOTE: 'Nothing in memory' } );   
   }
   catch( errMsg )
   {
      console.log('ERROR in jobFilesInMemory, errMsg: ' + errMsg);
      res.json( { ERROR_NOTE: 'ERROR while processing, ' + errMsg } );   
   }   
});


app.get('/jobFilesClear', (req, res) => 
{
   try
   {
      if ( MEM_jobFiles )
      {
         var projDir = req.query.projDir;

         if ( !projDir ) MEM_jobFiles = {};
         else MEM_jobFiles[projDir] = {};
      }
      else res.json( { ERROR_NOTE: 'Nothing in memory' } );   
   }
   catch( errMsg )
   {
      console.log('ERROR in jobFilesClear, errMsg: ' + errMsg);
      res.json( { ERROR_NOTE: 'ERROR while processing, ' + errMsg } );   
   }  
});


// ----------------------------------

app.get('/manifests', (req, res) => 
{
   // Use existing one.
   if ( MEM_manifestResp ) res.json( MEM_manifestResp );      
   else 
   {
      // reqData = { 'isLocal': localCase, 'appName': appName, 'isListingApp': true, projDir: 'proj1' };
      var reqData = JSON.parse(req.query.optionsStr);

      manifestDataCollect( reqData, function( MEM_manifestResp ) {
         res.json( MEM_manifestResp );
      });
   }
});

app.get('/manifestsReload', (req, res) => 
{
   if ( MEM_manifestResp )
   {
      manifestDataCollect( MEM_manifestResp.reqData, function( mem_manifestResp_new ) {
         res.json( mem_manifestResp_new );
      });      
   }
   else res.json( { ERROR_NOTE: 'Nothing in memory' } );  // simply go ahead with using in app, this will put the resp on memory
});

app.get('/manifestsInMemory', (req, res) => 
{
   if ( MEM_manifestResp )
   {
      res.json( MEM_manifestResp );      
   }
   else res.json( { ERROR_NOTE: 'Nothing in memory' } );
});

// ---------------------------------------------

function manifestDataCollect( reqData, callBack )
{
   var dataJson = getDataJson( reqData, settings );
   var dir = getDirLocation(dataJson); //console.log( dir ); // only show console if local - or by request?

   manifestsCollect.collect(dir, dataJson, function (results, topManifest) 
   {   
      // save to memory
      MEM_manifestResp = { topManifest: topManifest, list: results, reqData: reqData };

      callBack( MEM_manifestResp );
   });
};


// --------------------------------------------------
// ---- Util Methods

function getDataJson( reqData, settings )
{
   var settingsCopy = Util_getJsonDeepCopy( settings );

   try 
   {
      if ( reqData && reqData.settingsOverride )   
      {
         for ( var prop in reqData.settingsOverride )
         {
            settingsCopy[prop] = reqData.settingsOverride[prop];
         }
      }   
   }
   catch (errMsg) {
      console.log('ERROR in getDataJson, errMsg: ' + errMsg);
   }
   
   return { reqData: reqData, settings: settingsCopy };
};


function getDirLocation(dataJson, outerMediaFoler ) 
{
   var dir = '';
   var divider = '/';
   var fileBaseDir = dataJson.settings.fileBaseServ;

   if (dataJson.reqData.isLocal) {
      divider = '\\';
      fileBaseDir = dataJson.settings.fileBaseLocl;
   }

   // By default, this is 'jobs' folder - which 'listingApp' files exists.
   dir = fileBaseDir + divider + dataJson.reqData.appName + divider + dataJson.settings.jobsDir;

   // If not listing app, add more sub folder - for projDir location.
   if ( outerMediaFoler )
   {
      dir = dir + divider + dataJson.settings.jobAidDir + divider + outerMediaFoler;
   }
   else if (!dataJson.reqData.isListingApp) 
   {
      dir = dir + divider + dataJson.settings.jobAidDir + divider + dataJson.reqData.projDir;
   }

   return dir;
};


function Util_getJsonDeepCopy(jsonObj) {
	var newJsonObj;

	if (jsonObj) {
		try {
			newJsonObj = JSON.parse(JSON.stringify(jsonObj));
		}
		catch (errMsg) {
			console.log('ERROR in Util_getJsonDeepCopy, errMsg: ' + errMsg);
		}
	}

	return newJsonObj;
};


function Util_formatErrMsg(inputStr) 
{
   var outputMsg = inputStr;

   try
   {
      outputMsg = outputMsg.replace( settings.fileBaseLocl, '' );
      outputMsg = outputMsg.replace( settings.fileBaseServ, '' );
   }
   catch ( errMsg ) { }

   return outputMsg;
};
// ---------------------------------------------
