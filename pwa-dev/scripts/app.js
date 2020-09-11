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

  me._cwsRenderObj;
  me.count = 0;

  //me.isApp_standAlone = ( window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true );

  // ----------------------------------------------------

	me.initialize = function()
	{

    // Default Behavior Modify
    me.detectStandAlone();
    me.windowEvent_BlockBackBtnAction();
    window.addEventListener( 'error', me.catchErrorInCustomLog );
  

    // Setup Static Classes
    MsgManager.initialSetup();


    // Instantiate Classes
    me._cwsRenderObj = new cwsRender();

    // Set cwsRenderObj for ValidationUtil so that we can use this class later
    ValidationUtil.setCWSRenderObj( me._cwsRenderObj );

    // Does this get loaded also when we login?
    AppInfoManager.initialLoad_FromStorage();

    me.App_UI_startUp_loading(); // << should we move this into cwsRender?


    // Service Worker Related Initial Setup
    SwManager.initialSetup( me._cwsRenderObj, function() 
    { 
      console.log( 'swManger Processed..' );

      // NOTE: This could be placed right before 'ScheduleManager.runSchedules_AppStart();' in 'me.startAppProcess()'
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

      DevHelper.setUp( me._cwsRenderObj );

      me.App_UI_startUp_Progress( '50%' );


      // --------------------
      // 2. START PHASE
      // EVENT SETUP - TODO: Could be placed in cwsRender <-- Or menu setup area..  Not here..
      ConnManagerNew.cloudConnStatusClickSetup( $( '#divNetworkStatus' ) );

      // Start Connection..
      ConnManagerNew.appStartUp_SetStatus( me._cwsRenderObj );

      // Start the scheduling on app start
      ScheduleManager.runSchedules_AppStart();

      me.App_UI_startUp_Progress( '70%' );

      // --------------------
      // 3. FINISH APP START PHASE

      me.App_syncIcon_UI_event();

      me.App_UI_startUp_Progress( '80%' );

      me._cwsRenderObj.render();

      //me.App_UI_startUp_Progress( '90%' );

      //me.App_checkUpdates_found_prompt();

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

      //$( 'input.loginUserName' ).focus();

      //$( '.Nav1' ).dblclick( function(){
      //  DevHelper.loadSampleData();
      //} )

    }, 500);

  };


  me.App_UI_startUp_Progress = function( perc )
  {
    $( 'div.startUpProgress' ).css( 'width', perc );
  };


  me.App_syncIcon_UI_event = function()
  {
    // move into cwsRender?
    $( SyncManagerNew.imgAppSyncActionButtonId ).click( () => {

      // if already running, no message..
      // if offline, also, no message in this case about offline...

      if ( SyncManagerNew.syncStart_CheckNSet( { 'hideMsg': true } ) )
      {
        SyncManagerNew.syncAll( me._cwsRenderObj, 'Manual', function( success ) 
        {
          SyncManagerNew.syncFinish_Set();

          setTimeout( SyncManagerNew.SyncMsg_ShowBottomMsg, 700 );
        });  
      }
      else
      {
        setTimeout( SyncManagerNew.SyncMsg_ShowBottomMsg, 700 );
        //SyncManagerNew.SyncMsg_ShowBottomMsg();
      }

    });
  };
  
  //me.App_checkUpdates_found_prompt = function()
  //{
  //  if ( me._swManagerObj.createRefreshPrompt ) me.createRefreshIntervalTimer();
  //};


  me.App_installed_done = function( event ) {

    /*
    // Track event: The app was installed (banner or manual installation)
    FormUtil.gAnalyticsEventAction(function (analyticsEvent) {
      // Track event: The app was installed (banner or manual installation)
      ga('send', { 'hitType': 'event', 'eventCategory': 'appinstalled', 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });
      playSound("coin");
    });
    */
  };

  // ---------------------------------------

  me.windowEvent_BlockBackBtnAction = function()
  {
    // Method 1
    history.pushState(null, document.title, location.href);

    window.addEventListener('popstate', function (event)
    {
      console.log( '[[popstate]]' );

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
      console.customLog( "Running as standalone." );
    }  
  };

  me.catchErrorInCustomLog = function( e )
  {
    // const { message, source, lineno, colno, error } = e; 
    console.customLog( e.message );
  };

	// ======================================

	me.initialize();

}