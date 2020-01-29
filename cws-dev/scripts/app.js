// ------------------------  [Ideally]
// 1. run ServiceWorker
// 2. set up DWS connection settings for API calls
// 3. start connectionManager (+ scheduler)
// 4. run other things (memory swap?)


( function () {

  'use strict';

  App_UI_startUp_loading();

  const _cwsRenderObj = new cwsRender();
  const _swManagerObj = new swManager( startApp, _cwsRenderObj );

  var debugMode = WsApiManager.isDebugMode;

  function appInfoOperation( returnFunc ) 
  {
    if ( ConnManagerNew.networkOnline_CurrState ) // && FormUtil.isAppsPsiServer()
    {
      WsApiManager.setupWsApiVariables( returnFunc );
    }
    else {
      if ( debugMode ) console.log('Offline Mode'); //console.log('not PSI server')
      if ( returnFunc ) returnFunc();
    }

  };



  function app_Installed_Done(event) {

    // Track event: The app was installed (banner or manual installation)
    FormUtil.gAnalyticsEventAction(function (analyticsEvent) {
      // Track event: The app was installed (banner or manual installation)
      ga('send', { 'hitType': 'event', 'eventCategory': 'appinstalled', 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });
      playSound("coin");
    });

  }

  // ----------------------------------------------------

  function initialize() 
  {

  }

  function startApp() {

    window.addEventListener('appinstalled', app_Installed_Done);

    // 2. Do 'appInfoOperation' that does app Version Check & action first

    appInfoOperation( function () {

      ConnManagerNew.initialize();

      App_version_UI_Update();
      App_syncIcon_UI_event();

      _cwsRenderObj.render();

      FormUtil.createNumberLoginPinPad(); //if ( Util.isMobi() )

      if (debugMode) console.log('swPromptRefresh: ' + swPromptRefresh);

      if ( _swManagerObj.swPromptRefresh ) {
        _cwsRenderObj.createRefreshIntervalTimer(_ver);
      }

      App_UI_startUp_done();


    });


  }

  function App_UI_startUp_loading()
  {
    // show PWA (loading) screen
    FormMsgManager.appBlockTemplate('appLoad');
  }

  function App_UI_startUp_done()
  {
    // hide PWA (loading) screen
    setTimeout(function () {

      FormMsgManager.appUnblock();

    }, 500)

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

  initialize();

})();
