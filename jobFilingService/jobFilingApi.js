var express = require('express');
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();

app.use("/", router);  // add router in the Express app.


const { FileNameList } = require('./loadFileNames.js');
const fileNameList = new FileNameList();

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

const portNum = 8383;
const PORT = process.env.PORT || portNum;


router.get('/list', (req, res) => 
{
  // reqData = { 'isLocal': localCase, 'appName': appName, 'isListingApp': true, projDir: 'proj1' };
  var reqData = JSON.parse( req.query.optionsStr );
  dataJson = { reqData: reqData, settings: settings };

  var dir = getDirLocation( dataJson );

  fileNameList.walk( dir, dataJson, function(err, results) 
  {
    if (err) throw err;

    console.log( results );

    res.json({list: results});
  });

});


function getDirLocation( dataJson )
{
  var dir = '';
  var divider = '/';
  var fileBaseDir = dataJson.settings.fileBaseServ;

  if ( dataJson.reqData.isLocal )
  {
    divider = '\\';
    fileBaseDir = dataJson.settings.fileBaseLocl;
  }
  
  dir = fileBaseDir + divider + dataJson.reqData.appName + divider + dataJson.settings.jobsDir;

  // If not listing app, add more sub folder..
	if ( !dataJson.reqData.isListingApp ) dir = dir + divider + dataJson.settings.jobAidDir + divider + dataJson.reqData.projDir;

  
  return dir;
};

app.listen(PORT, function () {
  console.log( 'jobsFiling service listening on port ' + portNum );
});