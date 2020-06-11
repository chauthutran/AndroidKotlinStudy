// ------------------------  [Ideally]
// 1. run ServiceWorker
// 2. set up DWS connection settings for API calls
// 3. start connectionManager (+ scheduler)
// 4. run other things (memory swap?)

function app()
{
	var me = this;

  me._cwsRenderObj;
  me._swManagerObj;

  // ----------------------------------------------------

	me.initialize = function()
	{
    // Instantiate Classes
    me._cwsRenderObj = new cwsRender();
    me._swManagerObj = new swManager( me._cwsRenderObj );
  };


  me.startApp = function()
  {
    me.App_UI_startUp_loading();

    me._swManagerObj.run( function() {

      me.App_UI_startUp_Progress( '25%' );

      me.startAppProcess();
    } );   
  };

  // ----------------------------------------------------

  me.startAppProcess = function() 
  {
    try {
          
      WsCallManager.setWsTarget();

      // app startup event setup (for listeners)
      window.addEventListener( 'appinstalled', me.App_installed_done);

      ConnManagerNew.createNetworkConnListeners();

      //ScheduleManager.runSchedules_AppStart(); //here? before network+server 1st checked

      DevHelper.setUp( me._cwsRenderObj );

      me.App_UI_startUp_Progress( '50%' );

      // --------------------

      // MOVED FROM login
      ConnManagerNew.cloudConnStatusClickSetup( $( '#divNetworkStatus' ) );


      me.App_UI_startUp_Progress( '75%' );

      // JAMES: Removed the call back wait..
      ConnManagerNew.appStartUp_SetStatus( me._cwsRenderObj );

      me.App_version_UI_Update();

      me.App_syncIcon_UI_event();

      me.App_UI_startUp_Progress( '80%' );

      me._cwsRenderObj.render();

      FormUtil.createNumberLoginPinPad(); // BUG here - blinker not always showing

      me.App_UI_startUp_Progress( '90%' );

      me.App_checkUpdates_found_prompt();

      me.App_UI_startUp_Progress( '100%' );

      me.App_UI_startUp_ready();

    } catch (err) {
      console.log('error starting App > startApp() error: ' + err);
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
    //$( 'div.Nav__Title' ).html( perc );
  };


  me.App_version_UI_Update = function()
  {
    $( '#spanVersion' ).text( 'v' + _ver );
  };


  me.App_syncIcon_UI_event = function()
  {
    // move into cwsRender?
    $('#imgAppDataSyncStatus').click(() => {
      
      //DevHelper.tempCount++;
      //var remainder = ( DevHelper.tempCount % 2 );
      //console.log( 'tempCount: ' + DevHelper.tempCount + ', ' + remainder );
      //if ( remainder === 1 ) FormUtil.rotateTag( SyncManagerNew.imgAppSyncActionButton, true );
      //else FormUtil.rotateTag( SyncManagerNew.imgAppSyncActionButton, false );

      SyncManagerNew.SyncMsg_ShowBottomMsg();
    });
  };


  me.App_checkUpdates_found_prompt = function()
  {
    if ( me._swManagerObj.swPromptRefresh ) {
      me._cwsRenderObj.createRefreshIntervalTimer(_ver);
    }
  };
  

  me.App_installed_done = function( event ) {

    // Track event: The app was installed (banner or manual installation)
    FormUtil.gAnalyticsEventAction(function (analyticsEvent) {
      // Track event: The app was installed (banner or manual installation)
      ga('send', { 'hitType': 'event', 'eventCategory': 'appinstalled', 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });
      playSound("coin");
    });
  };

	// ======================================

	me.initialize();

}