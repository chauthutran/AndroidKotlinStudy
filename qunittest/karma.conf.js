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
      '../pwa-dev/scripts/libraries/jquery-3.4.0.min.js',
      '../pwa-dev/scripts/libraries/jquery.blockUI.js',
      '../pwa-dev/scripts/libraries/jquery-ui.min.js',
      '../pwa-dev/scripts/libraries/jquery-autocomplete.js',
      '../pwa-dev/scripts/libraries/jquery-dateformat.min.js',
      '../pwa-dev/scripts/libraries/aes.js',
      '../pwa-dev/scripts/libraries/llqrcode.js',
      '../pwa-dev/scripts/libraries/moment.min.js',
      '../pwa-dev/scripts/libraries/mdDateTimePicker.min.js',
      '../pwa-dev/scripts/libraries/maska.js',
      '../pwa-dev/scripts/libraries/localforage.min.js',
      '../pwa-dev/scripts/libraries/json-viewer.js',
      '../pwa-dev/scripts/libraries/crossfilter.min.js',
      '../pwa-dev/scripts/libraries/d3.min.js',
      '../pwa-dev/scripts/libraries/tabulate.js',

      'src/simple.js',
      
      '../pwa-dev/scripts/**/*.js',



    // 'src/*.js' ,

      'test/*.js'
    ],


    // list of files / patterns to exclude
    exclude: [
    ],



    preprocessors: {
      // 'src/*.js' :  'coverage'
     '../pwa-dev/scripts/services/appInfoManager.js' : ['coverage'],
     '../pwa-dev/scripts/services/clientDataManager.js' : ['coverage'],
     '../pwa-dev/scripts/services/configManager.js' : ['coverage'],
     '../pwa-dev/scripts/services/sessionManager.js' : ['coverage'],
     '../pwa-dev/scripts/services/activityDataManager.js' : ['coverage'],
     
     '../pwa-dev/scripts/classes/login.js' : ['coverage']
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
