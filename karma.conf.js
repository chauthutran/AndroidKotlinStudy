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
      'pwa-dev/scripts/libraries/jquery-3.4.1.min.js',
      'pwa-dev/scripts/libraries/jquery.blockUI.js',
      'pwa-dev/scripts/libraries/jquery-autocomplete.min.js',
      'pwa-dev/scripts/libraries/jquery-dateformat.min.js',
      'pwa-dev/scripts/libraries/aes.js',
      'pwa-dev/scripts/libraries/llqrcode.js',
      'pwa-dev/scripts/libraries/moment.min.js',
      'pwa-dev/scripts/libraries/mdDateTimePicker.min.js',
      'pwa-dev/scripts/libraries/maska.js',
      'pwa-dev/scripts/libraries/localforage.min.js',
      'pwa-dev/scripts/libraries/json-viewer.js',

      'qunittest/src/simple.js',
      
      'pwa-dev/scripts/**/*.js',
      'pwa-dev/scripts/**/**/*.js',
      
      'pwa-dev/scripts/cwsRender.js',
      'pwa-dev/scripts/app.js',

      'qunittest/test/**/*.js',
      'qunittest/test/*.js'
    ],


    // list of files / patterns to exclude
    exclude: [
    ],



    preprocessors: {
      // 'src/*.js' :  'coverage'
    /* 'pwa-dev/scripts/services/appInfoManager.js' : ['coverage'],
     'pwa-dev/scripts/services/clientDataManager.js' : ['coverage'],
     'pwa-dev/scripts/services/configManager.js' : ['coverage'],
     'pwa-dev/scripts/services/sessionManager.js' : ['coverage'],
     'pwa-dev/scripts/services/activityDataManager.js' : ['coverage'],
     
     'pwa-dev/scripts/classes/login.js' : ['coverage']
     */
     

    'pwa-dev/scripts/services/consoleCustomLog.js' : ['coverage'],

     'pwa-dev/scripts/constants/constants.js' : ['coverage'],
     'pwa-dev/scripts/constants/templates.js' : ['coverage'],
     'pwa-dev/scripts/constants/configs.js' : ['coverage'],
   
     'pwa-dev/scripts/utils/util.js' : ['coverage'],
     'pwa-dev/scripts/utils/util2.js' : ['coverage'],
     'pwa-dev/scripts/utils/prototypes.js' : ['coverage'],
     'pwa-dev/scripts/utils/jsonBuiltTable.js' : ['coverage'],
     'pwa-dev/scripts/utils/inputUtil.js' : ['coverage'],
     'pwa-dev/scripts/utils/activityUtil.js' : ['coverage'],
     'pwa-dev/scripts/utils/dbStorageSelector.js' : ['coverage'],
     'pwa-dev/scripts/utils/formUtil.js' : ['coverage'],
     'pwa-dev/scripts/utils/sounds.js' : ['coverage'],
     'pwa-dev/scripts/utils/validationUtil.js' : ['coverage'],
     'pwa-dev/scripts/utils/StatsUtil.js' : ['coverage'],
     
     'pwa-dev/scripts/services/request/RESTCallManager.js' : ['coverage'],
     'pwa-dev/scripts/services/request/wsCallManager.js' : ['coverage'],
     'pwa-dev/scripts/services/storage/storageMng.js' : ['coverage'],
     'pwa-dev/scripts/services/storage/dataManager2.js' : ['coverage'],
     'pwa-dev/scripts/services/storage/localStgMng.js' : ['coverage'],
     'pwa-dev/scripts/services/translationManager.js' : ['coverage'],
     'pwa-dev/scripts/services/clientDataManager.js' : ['coverage'],
     'pwa-dev/scripts/services/activityDataManager.js' : ['coverage'],
     'pwa-dev/scripts/services/payloadTemplateHelper.js' : ['coverage'],
   
     'pwa-dev/scripts/services/syncManagerNew.js' : ['coverage'],
     'pwa-dev/scripts/services/configManager.js' : ['coverage'],
     'pwa-dev/scripts/services/msgManager.js' : ['coverage'],
     'pwa-dev/scripts/services/formMsgManager.js' : ['coverage'],
     'pwa-dev/scripts/services/connManagerNew.js' : ['coverage'],
   
     'pwa-dev/scripts/services/appInfoManager.js' : ['coverage'],
     'pwa-dev/scripts/services/sessionManager.js' : ['coverage'],
     'pwa-dev/scripts/services/infoDataManager.js' : ['coverage'],
     'pwa-dev/scripts/services/dataVerMove.js' : ['coverage'],
     'pwa-dev/scripts/services/scheduleManager.js' : ['coverage'],
     'pwa-dev/scripts/services/swManager.js' : ['coverage'],
     'pwa-dev/scripts/services/devHelper.js' : ['coverage'],
   
     'pwa-dev/scripts/classes/activityCard.js' : ['coverage'],
     'pwa-dev/scripts/classes/appModeSwitchPrompt.js' : ['coverage'],
     'pwa-dev/scripts/classes/statistics.js' : ['coverage'],
     'pwa-dev/scripts/classes/settingsApp.js' : ['coverage'],
     'pwa-dev/scripts/classes/aboutApp.js' : ['coverage'],
     'pwa-dev/scripts/classes/menu.js' : ['coverage'],
     'pwa-dev/scripts/classes/favIcon.js' : ['coverage'],
     'pwa-dev/scripts/classes/login.js' : ['coverage'],
     'pwa-dev/scripts/classes/action.js' : ['coverage'],
     'pwa-dev/scripts/classes/blockForm.js' : ['coverage'],
     'pwa-dev/scripts/classes/blockList.js' : ['coverage'],
     'pwa-dev/scripts/classes/blockListView.js' : ['coverage'],
     'pwa-dev/scripts/classes/dataList.js' : ['coverage'],
     'pwa-dev/scripts/classes/blockButton.js' : ['coverage'],
     'pwa-dev/scripts/classes/blockMsg.js' : ['coverage'],
     'pwa-dev/scripts/classes/block.js' : ['coverage'],
     'pwa-dev/scripts/classes/webqr.js' : ['coverage'],
     'pwa-dev/scripts/classes/qrcode.js' : ['coverage'],
     'pwa-dev/scripts/classes/pwaEpoch.js' : ['coverage'],
     'pwa-dev/scripts/classes/baseConverter.js' : ['coverage']
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
