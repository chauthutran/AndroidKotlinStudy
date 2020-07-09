// Karma configuration
// Generated on Fri Jul 03 2020 12:47:51 GMT+0900 (Korean Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['qunit'],


    // list of files / patterns to load in the browser
    files: [  
      '../scripts/libraries/jquery-3.4.0.min.js',
      '../scripts/libraries/jquery.blockUI.js',
      '../scripts/libraries/jquery-ui.min.js',
      '../scripts/libraries/jquery-autocomplete.js',
      '../scripts/libraries/jquery-dateformat.min.js',
      '../scripts/libraries/aes.js',
      '../scripts/libraries/llqrcode.js',
      '../scripts/libraries/moment.min.js',
      '../scripts/libraries/mdDateTimePicker.min.js',
      '../scripts/libraries/maska.js',
      '../scripts/libraries/localforage.min.js',
      '../scripts/libraries/json-viewer.js',
      '../scripts/libraries/crossfilter.min.js',
      '../scripts/libraries/d3.min.js',
      '../scripts/libraries/tabulate.js',

      'src/simple.js',
      
      '../scripts/**/*.js',



    // 'src/*.js' ,

      'test/*.js'
    ],


    // list of files / patterns to exclude
    exclude: [
    ],



    preprocessors: {
      // 'src/*.js' :  'coverage'
     '../scripts/services/appInfoManager.js' : ['coverage'],
     '../scripts/services/clientDataManager.js' : ['coverage'],
     '../scripts/services/configManager.js' : ['coverage'],
     '../scripts/services/sessionManager.js' : ['coverage'],
     '../scripts/services/activityDataManager.js' : ['coverage'],
     
     '../scripts/classes/login.js' : ['coverage']
    },



    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter

   // reporters: ['progress'],
    reporters: ['progress', 'coverage'],


    // web server port
    port: 1984,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Chrome'],
    browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
