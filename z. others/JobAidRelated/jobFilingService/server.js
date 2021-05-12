var express = require('express');
var cors = require('cors');
const { FileNameList } = require('./app/loadFileNames.js');
const fileNameList = new FileNameList();

var app = express();
app.use(cors());

app.get('/list', function (req, res, next) {
  // res.json({msg: 'This is CORS-enabled for all origins!'});
  fileNameList.walk("c:\\Work\\tomcat8\\webapps\\pwa-dev\\jobs\\", function(err, results) {
        if (err) throw err;
        res.json({list: results});
      });

})

const PORT = process.env.PORT || 8383;
app.listen(PORT, function () {
  console.log('CORS-enabled web server listening on port 8383')
})