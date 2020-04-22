// ------------------------  [Ideally]
// 1. run ServiceWorker
// 2. set up DWS connection settings for API calls
// 3. start connectionManager (+ scheduler)
// 4. run other things (memory swap?)


( function () {

  'use strict';

  const _cwsRenderObj = new cwsRender();
  const _swManagerObj = new swManager( _cwsRenderObj );

  var debugMode = WsApiManager.isDebugMode;

  // ----------------------------------------------------

  App_UI_startUp_loading();

  _swManagerObj.run( function(){

    App_UI_startUp_Progress( '25%' );

    startApp();

  } );   


  function startApp() 
  {

    WsCallManager.setWsOriginUrl();

    // app startup event setup (for listeners)
    window.addEventListener('appinstalled', App_installed_done);

    ConnManagerNew.createNetworkConnListeners();

    ScheduleManager.runSchedules_AppStart(); //here? before network+server 1st checked
    
    DevHelper.setUp( _cwsRenderObj );

    App_UI_startUp_Progress( '50%' );

    try {

      WsApiManager.setupWsApiVariables( function () {

        App_UI_startUp_Progress( '75%' );

        ConnManagerNew.appStartUp_SetStatus( _cwsRenderObj, function () {

          App_version_UI_Update();

          App_syncIcon_UI_event();

          App_UI_startUp_Progress( '80%' );

          _cwsRenderObj.render();

          FormUtil.createNumberLoginPinPad(); // BUG here - blinker not always showing

          App_UI_startUp_Progress( '90%' );

          App_checkUpdates_found_prompt();

          App_UI_startUp_Progress( '100%' );

          App_UI_startUp_ready();

        });

      });
    }
    catch( err )
    {
      console.log( 'error starting App > startApp() error: ' + err );

    }


  }

  function App_UI_startUp_loading()
  {

    // show PWA (loading) screen
    FormMsgManager.appBlockTemplate('appLoad');

    App_UI_startUp_Progress( '10%' );

  }

  function App_UI_startUp_ready()
  {
    // hide PWA (loading) screen: timeout used for delay (UI effect)
    setTimeout(function () {

      FormMsgManager.appUnblock();

      $( 'input.loginUserName' ).focus();

    }, 500)

  }

  function App_UI_startUp_Progress( perc )
  {
    $( 'div.startUpProgress' ).css( 'width', perc );
    //$( 'div.Nav__Title' ).html( perc );
  }

  function App_version_UI_Update()
  {
    $('#spanVersion').text('v' + _ver);
  }

  function App_syncIcon_UI_event()
  {
    // move into cwsRender?
    $('#imgAppDataSyncStatus').click(() => {
      SyncManagerNew.syncAll( _cwsRenderObj, 'Manual' );
    });

  }

  function App_checkUpdates_found_prompt()
  {
    if ( _swManagerObj.swPromptRefresh ) {
      _cwsRenderObj.createRefreshIntervalTimer(_ver);
    }
  }
  
  function App_installed_done(event) {

    // Track event: The app was installed (banner or manual installation)
    FormUtil.gAnalyticsEventAction(function (analyticsEvent) {
      // Track event: The app was installed (banner or manual installation)
      ga('send', { 'hitType': 'event', 'eventCategory': 'appinstalled', 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });
      playSound("coin");
    });

  }


})();
