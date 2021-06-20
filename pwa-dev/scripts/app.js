// ------------------------  [Ideally]
// 1. run ServiceWorker
// 2. set up DWS connection settings for API calls
// 3. start connectionManager (+ scheduler)
// 4. run other things (memory swap?)

// NOTE:
//    - app() does not need to be instance..
//  Re-Organize:
//  1. From index.html, we load all files
//      and then, call new app();  app.start();
//      - basically combining 'app' class and 'cwsRender' class.
//  2. On the start, it will 
//    - register windows event
//    - start the service worker manager class (regiser (grab the working ones..) / monitor it)
//    - start other services
//    and do 'render()'

function app()
{
	var me = this;

  me.count = 0;

  var appInstallBtnTag = $( '.appInstall' );

  //me.isApp_standAlone = ( window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true );

  // ----------------------------------------------------

  me.initialize = function()
  {
    // Show footer for DEBUG mode
    var appMode = Util.getParameterByName( "mode" );
    if( appMode == "debug" )
    {
       DebugLog.start();
    }


    // 'pwa-dev' only enabling
    if ( location.href.indexOf( 'pwa-dev' ) >= 0 )
    {
      Menu.jobAids = true;
      // Menu.hnqisRdqa = true;
      $( '.jobAidFiling' ).show();
    }


    // Default Behavior Modify
    //me.detectStandAlone();
    me.windowEvent_BlockBackBtnAction();
    window.addEventListener( 'error', me.catchErrorInCustomLog );
    window.addEventListener( 'beforeinstallprompt', me.beforeinstallprompt );
  
    // Setup Static Classes
    MsgManager.initialSetup();

    // Instantiate Classes
    SessionManager.cwsRenderObj = new cwsRender();  // Global Reference to cwsRenderObj..

    AppInfoManager.initialLoad_FromStorage();

    me.App_UI_startUp_loading(); // << should we move this into cwsRender?


    // Service Worker Related Initial Setup
    SwManager.initialSetup( function() 
    { 
      SwManager.checkNewAppFile_OnlyOnline();

      me.App_UI_startUp_Progress( '40%' );
      me.startAppProcess();
    });
  };

  // ----------------------------------------------------

  me.startAppProcess = function() 
  {
    try {
          
      // --------------------
      // 1. SET UP PHASE
      WsCallManager.setWsTarget();

      ConnManagerNew.createNetworkConnListeners();

      me.App_UI_startUp_Progress( '50%' );


      // --------------------
      // 2. START PHASE
      // EVENT SETUP - TODO: Could be placed in cwsRender <-- Or menu setup area..  Not here..
      ConnManagerNew.cloudConnStatusClickSetup( $( '#divNetworkStatus' ) );

      // Start Connection..
      ConnManagerNew.appStartUp_SetStatus();

      // Start the scheduling on app start
      ScheduleManager.runSchedules_AppStart();

      me.App_UI_startUp_Progress( '70%' );

      // --------------------
      // 3. FINISH APP START PHASE

      me.App_syncIcon_UI_event();

      me.App_UI_startUp_Progress( '80%' );

      SessionManager.cwsRenderObj.render();

      //me.App_UI_startUp_Progress( '90%' );

      me.App_UI_startUp_Progress( '100%' );

      me.App_UI_startUp_ready();

    } catch (err) {
      console.customLog('error starting App > startApp() error: ' + err);
    }
  };


  // ------------------------------

  me.App_UI_startUp_loading = function()
  {
    // show PWA (loading) screen
    FormMsgManager.appBlockTemplate('appLoad');

    me.App_UI_startUp_Progress( '10%' );
  };


  me.App_UI_startUp_ready = function()
  {
    // hide PWA (loading) screen: timeout used for delay (UI effect)
    setTimeout(function () {
      FormMsgManager.appUnblock();
    }, 300);
  };


  me.App_UI_startUp_Progress = function( perc )
  {
    $( 'div.startUpProgress' ).css( 'width', perc );
  };


  me.App_syncIcon_UI_event = function()
  {
    SyncManagerNew.setAppTopSyncAllBtnClick();
  };

  // ---------------------------------------

  me.windowEvent_BlockBackBtnAction = function()
  {
    // Method 1
    history.pushState(null, document.title, location.href);

    window.addEventListener('popstate', function (event)
    {
      history.pushState(null, document.title, location.href);
      
      var backBtnTags = $( '.btnBack:visible' );

      if ( backBtnTags.length > 0 )
      {
        //backBtnTags.click();
        backBtnTags.first().click();
      }
      else
      {
        MsgManager.msgAreaShow( 'Back Button Click Blocked!!' );
      }

    });
    // NEED TO WORK ON SCROLL DOWN TO REFRESH BLOCKING
    // https://stackoverflow.com/questions/29008194/disabling-androids-chrome-pull-down-to-refresh-feature
  };


  me.detectStandAlone = function()
  {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // console.customLog( "Running as standalone." );
    }  
  };


  me.catchErrorInCustomLog = function( e )
  {
    // const { message, source, lineno, colno, error } = e; 
    console.customLog( e.message );
  };


  me.setUpAppInstallNotReadyMsg = function()
  {  
    appInstallBtnTag.off( 'click' ).click( function() 
    {
      MsgManager.msgAreaShow( 'App is already installed in this device.' );
    });  
  };


  me.beforeinstallprompt = function( e )
  {
    // appInstallTag.show();  - not needed since we made it always visible
    appInstallBtnTag.css( 'background-color', 'tomato' );

    var deferredPrompt = e;

    appInstallBtnTag.off( 'click' ).click( function() 
    {
      deferredPrompt.prompt();

      appInstallBtnTag.hide();

      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then( ( choiceResult ) => 
      {
        if ( choiceResult.outcome === 'accepted' ) console.log('User accepted the A2HS prompt');
        else console.log('User dismissed the A2HS prompt');

        deferredPrompt = null;
      });
  
    });

  };


  // ===========================
  // [JOB_AID]    
  window.addEventListener('message', function(event)
  {
    if ( event.data.from === 'jobAidIFrame') JobAidHelper.msgHandle( event.data );      
  });

	// ======================================

	me.initialize();

}