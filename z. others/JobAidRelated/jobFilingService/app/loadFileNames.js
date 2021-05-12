
var fs = require('fs');
var path = require('path');

class FileNameList {
	constructor() {}
	
 	walk (dir, done) {
		var self = this;

		var results = [];
		fs.readdir(dir, function(err, list) 
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
						self.walk(file, function(err, res) {
							results = results.concat(res);
							next();
						});
					} 
					else 
					{
						var filePath = file.split("webapps")[1].split("\\").join("/");
						results.push(filePath);
						next();
					}
				});
			})();

		});
  	};


}
  
module.exports = { FileNameList };


// var fs = require('fs');
// var path = require('path');


// function walk (dir, done) {
// 	var results = [];
// 	fs.readdir(dir, function(err, list) {
// 	  if (err) return done(err);
// 	  var i = 0;
// 	  (function next() {
// 		var file = list[i++];
// 		if (!file) return done(null, results);
// 		file = path.resolve(dir, file);
// 		fs.stat(file, function(err, stat) {
// 		  if (stat && stat.isDirectory()) {
// 			walk(file, function(err, res) {
// 			  results = results.concat(res);
// 			  next();
// 			});
// 		  } else {
// 			results.push(file);
// 			next();
// 		  }
// 		});
// 	  })();
// 	});
//   };



// // walk("c:\\WORKS\\SOFTWARES\\apache-tomcat\\webapps\\pwa-dev\\jobs\\", function(err, results) {
// //     if (err) throw err;
// //     console.log(results);
// //   });