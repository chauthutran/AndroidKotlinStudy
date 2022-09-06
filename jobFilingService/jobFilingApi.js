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
var mem_manifestResp;
var mem_buildDate;

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
   // reqData = { 'isLocal': localCase, 'appName': appName, 'isListingApp': true, projDir: 'proj1' };
   var reqData = JSON.parse(req.query.optionsStr);
   var dataJson = getDataJson( reqData, settings );
   var dir = getDirLocation(dataJson);

   fileNameList.walk(dir, dataJson, function (err, results) {
      if (err) throw err;
      // console.log( results ); // only show console if local - or by request?
      
      // NEW: if outerMediaFoler: 'folderName' is used, walk that folder as well..
      if ( reqData.outerMediaFoler )
      {
         var mediaDir = getDirLocation(dataJson, reqData.outerMediaFoler );

         fileNameList.walk(mediaDir, dataJson, function (err, results_media) {
            if (err) throw err;

            results = results.concat(results_media);

            res.json({ list: results });
         });      
      }
      else
      {
         res.json({ list: results });
      }
   });

});


app.get('/manifests', (req, res) => 
{
   // Use existing one.
   if ( mem_manifestResp ) res.json( mem_manifestResp );      
   else 
   {
      // reqData = { 'isLocal': localCase, 'appName': appName, 'isListingApp': true, projDir: 'proj1' };
      var reqData = JSON.parse(req.query.optionsStr);

      manifestDataCollect( reqData, function( mem_manifestResp ) {
         res.json( mem_manifestResp );
      });
   }
});

app.get('/manifestsReload', (req, res) => 
{
   if ( mem_manifestResp )
   {
      manifestDataCollect( mem_manifestResp.reqData, function( mem_manifestResp_new ) {
         res.json( mem_manifestResp_new );
      });      
   }
   else res.json( { ERROR_NOTE: 'Nothing in memory' } );  // simply go ahead with using in app, this will put the resp on memory
});

app.get('/manifestsInMemory', (req, res) => 
{
   if ( mem_manifestResp )
   {
      res.json( mem_manifestResp );      
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
      mem_manifestResp = { topManifest: topManifest, list: results, reqData: reqData };

      callBack( mem_manifestResp );
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

// ---------------------------------------------
