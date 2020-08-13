// ------------------------  [Ideally]
// 1. run ServiceWorker
// 2. set up DWS connection settings for API calls
// 3. start connectionManager (+ scheduler)
// 4. run other things (memory swap?)
//

function app()
{
	var me = this;

  me._cwsRenderObj;

  // ----------------------------------------------------

	me.initialize = function()
	{

    // app startup event setup (for listeners)
    //window.addEventListener( 'appinstalled', me.App_installed_done);

    window.addEventListener( 'beforeinstallprompt', me.appBeforeInstallPrompt );

    // Instantiate Classes
    me._cwsRenderObj = new cwsRender();

    // Set cwsRenderObj for ValidationUtil so that we can use this class later
    ValidationUtil.setCWSRenderObj( me._cwsRenderObj );

    // Does this get loaded also when we login?
    AppInfoManager.initialLoad_FromStorage();

    me.App_UI_startUp_loading(); // << should we move this into cwsRender?

    me._cwsRenderObj.swManagerObj = new swManager( me._cwsRenderObj, function() { 
      console.log( 'swManger Processed..' );
    });

    me.App_UI_startUp_Progress( '40%' );
    me.startAppProcess();

    //} );   

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
      
      me.appVersionInfoDisplay();

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

      $( 'input.loginUserName' ).focus();

      $( '.Nav1' ).dblclick( function(){
        DevHelper.loadSampleData();
      } )

    }, 500);

  };


  me.App_UI_startUp_Progress = function( perc )
  {
    $( 'div.startUpProgress' ).css( 'width', perc );
  };


  me.appVersionInfoDisplay = function()
  {
    $( '#spanVersion' ).text( 'v' + _ver );
    $( '#spanVerDate' ).text( ' [' + _verDate + ']' );    
    $( '#loginVersionNote' ).append( '<label> ' + _versionNote + '</label>' );
  };


  me.App_syncIcon_UI_event = function()
  {
    // move into cwsRender?
    $( SyncManagerNew.imgAppSyncActionButtonId ).click( () => {

      // if already running, no message..
      // if offline, also, no message in this case about offline...

      if ( SyncManagerNew.syncStart_CheckNSet( { 'hideMsg': true } ) )
      {
        SyncManagerNew.syncAll( me._cwsRenderObj, '', function( success ) 
        {
          SyncManagerNew.syncFinish_Set();

          SyncManagerNew.SyncMsg_ShowBottomMsg();
        });  
      }
      else
      {
        SyncManagerNew.SyncMsg_ShowBottomMsg();
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

  me.appBeforeInstallPrompt = function( e )
  {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    //e.preventDefault();

    deferredPrompt = e;

    var isApp_standAlone = ( window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true );

    console.customLog( 'App StandAlone Status..: ' + isApp_standAlone );
    // We would allow below link show if not 'standAlone' case only.

    // this event does not fire if the application is already installed
    // then your button still hidden ;)
    console.customLog( 'before install prompt' );


    // Set display for this!
    var divMobileInstallTryTag = $( '#divMobileInstallTry' );
    divMobileInstallTryTag.css( 'cursor', 'pointer' );
    divMobileInstallTryTag.text( '<span>Available - standAlone: ' + isApp_standAlone + '</span>' );

    divMobileInstallTryTag.off( 'click' ).click( function() 
    {
        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then( ( choiceResult ) => {
            if ( choiceResult.outcome === 'accepted' ) console.customLog( 'User accepted the A2HS prompt' );
            else console.customLog( 'User dismissed the A2HS prompt' );
            deferredPrompt = null;
        });
    });
  };

	// ======================================

	me.initialize();

}