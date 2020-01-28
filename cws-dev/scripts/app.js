// ------------------------  [Ideally]
// 1. run ServiceWorker
// 2. set up DWS connection settings for API calls
// 3. start connectionManager (+ scheduler)
// 4. run other things (memory swap?)


(function () {

  'use strict';

  const _cwsRenderObj = new cwsRender();

  var debugMode = WsApiManager.isDebugMode;
  var SWinfoObj;
  var swStateChanges = false;
  var swNewInstallStartup = false;
  var swPromptRefresh = false;

  // prepare PWA (loading) screen
  FormMsgManager.appBlockTemplate('appLoad');

  registerServiceWorker();

  registerServiceWorker = function()
  {
    
    if ('serviceWorker' in navigator) {

      navigator.serviceWorker.register( './service-worker.js' ).then( registration => {

        SWinfoObj = localStorage.getItem( 'swInfo' );

        if ( ! SWinfoObj ) 
        {
          SWinfoObj = { 'reloadRequired': false, 'datetimeInstalled': (new Date()).toISOString(), 'currVersion': _ver, 'lastVersion': _ver, 'datetimeApplied': (new Date()).toISOString() };
        }
        else 
        {
          SWinfoObj = JSON.parse(SWinfoObj);
          SWinfoObj['reloadRequired'] = false;
        }

        if ( registration.active == null )
        {
          swNewInstallStartup = true;
          SWinfoObj.lastState = '';
        }
        else 
        {
          swNewInstallStartup = false;
          SWinfoObj.lastState = registration.active.state;
        }

        localStorage.setItem( 'swInfo', JSON.stringify( SWinfoObj ) );

        // SW changes detected
        registration.onupdatefound = () => {

          const installingWorker = registration.installing;

          SWinfoObj = JSON.parse(localStorage.getItem('swInfo'));

          SWinfoObj['lastState'] = installingWorker.state;

          localStorage.setItem('swInfo', JSON.stringify(SWinfoObj));

          if (debugMode) console.log(' - sw_state: ' + installingWorker.state);


          installingWorker.onstatechange = () => {

            SWinfoObj = JSON.parse(localStorage.getItem('swInfo'));
            swStateChanges = true;

            if (debugMode) console.log(' ~ sw_state: ' + installingWorker.state);
            SWinfoObj['lastState'] = installingWorker.state;

            switch ( installingWorker.state ) 
            {
              case 'installed':
                // existing controller = existing SW :: new updates installed
                if (navigator.serviceWorker.controller) {
                  swPromptRefresh = true;
                  SWinfoObj['reloadRequired'] = true;
                }
                else {
                  //localStorage.setItem( 'swInfo', JSON.stringify( { 'reloadRequired': false, 'datetimeInstalled': (new Date() ).toISOString() , 'currVersion': _ver, 'lastVersion': _ver, 'datetimeApplied': (new Date() ).toISOString() } ) );
                  SWinfoObj['reloadRequired'] = false;
                }
                break;

              case 'activating':
                break;

              case 'activated':

                var mySWupdates = JSON.parse(localStorage.getItem('swInfo'));

                if (mySWupdates.reloadRequired) 
                {
                  mySWupdates['datetimeApplied'] = (new Date()).toISOString();
                  mySWupdates['reloadRequired'] = false;

                  localStorage.setItem('swInfo', JSON.stringify(mySWupdates));

                }


                if ( swNewInstallStartup ) 
                {
                  startApp();
                }
                else 
                {
                  SWinfoObj['reloadRequired'] = true;
                  _cwsRenderObj.createRefreshIntervalTimer( _ver );
                }
                break;
            }

            localStorage.setItem( 'swInfo', JSON.stringify( SWinfoObj ) );

          };

        };

        _cwsRenderObj.setRegistrationObject( registration ); //added by Greg (2018/12/13)

        localStorage.setItem('swInfo', JSON.stringify(SWinfoObj));

        if (debugMode) console.log('Service Worker Registered');

      })
        .then(function () {

          if (debugMode) console.log('swStateChanges: ' + swStateChanges);
          if (debugMode) console.log('swNewInstallStartup: ' + swNewInstallStartup);

          localStorage.setItem( 'swInfo', JSON.stringify( SWinfoObj ) );

          if (swNewInstallStartup == false) startApp();

        })
        .catch( err =>
          // MISSING TRANSLATION
          MsgManager.notificationMessage('SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000)
        );


    }
  }

  $('#imgAppDataSyncStatus').click(() => {

    SyncManagerNew.syncAll( _cwsRenderObj, 'Manual' );

    //syncManager.syncOfflineData(this);

  });


  function appInfoOperation( returnFunc ) 
  {
    if (ConnManagerNew.networkOnline_CurrState) // && FormUtil.isAppsPsiServer()
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

  function updateOnlineStatus(event) {

    ConnManagerNew.setNetworkStatus( navigator.onLine );

  };

  function updateSyncManager(event) {
    syncManager.initialize(_cwsRenderObj);
  }

  // ----------------------------------------------------

  function initialize() 
  {

    /*if ( Util.getURLParameterByName(window.location.href, 'diagnostic').length || Util.getURLParameterByName(window.location.href, 'kill').length ) {

      FormMsgManager.appBlockTemplate('appDiagnostic');

      if ( Util.getURLParameterByName(window.location.href, 'kill').length )
      {
        cacheManager.clearCacheKeys(false, function () {

          if ( Util.getURLParameterByName(window.location.href, 'kill') == 'indexedDB' )
          {

            MsgManager.notificationMessage( 'deleting IndexedDB...', 'notificationBlue', undefined,'', 'right', 'top', 10000, false, undefined,'diagnostics1.4' );

            localStorage.removeItem( 'movedData' );
  
            DataManager.dropMyIndexedDB_CAUTION_DANGEROUS( function( result, msg ){
  
              MsgManager.notificationMessage('SUCCESS ~ restarting', 'notificationGreen', undefined, '', 'right', 'top', 10000, false, undefined, 'diagnostics6');
  
              setTimeout( function(){
                window.location = (window.location.href).split( '?' )[ 0 ];
              }, 2000 );
              
  
            });
  
          }

        })
      }
      else
      {

      }

    }
    else */{

      //FormMsgManager.appBlockTemplate('appLoad');


    }

  }

  function startApp() {

    window.addEventListener('appinstalled', app_Installed_Done);

    // 2. Do 'appInfoOperation' that does app Version Check & action first

    appInfoOperation( function () {

      ConnManagerNew.initialize();

      App_version_UI_Update();

      _cwsRenderObj.render();

      syncManager.initialize(_cwsRenderObj);

      FormUtil.createNumberLoginPinPad(); //if ( Util.isMobi() )

      if (debugMode) console.log('swPromptRefresh: ' + swPromptRefresh);

      if (swPromptRefresh) {
        _cwsRenderObj.createRefreshIntervalTimer(_ver);
      }

      setTimeout(function () {

        FormMsgManager.appUnblock();

      }, 500)


    });


  }

  function App_version_UI_Update()
  {
    $('#spanVersion').text('v' + _ver);
  }

  initialize();

})();
