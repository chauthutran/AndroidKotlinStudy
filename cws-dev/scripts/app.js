(function () {
  'use strict';

  let _registrationObj;

  const _cwsRenderObj = new cwsRender();

  var debugMode = WsApiManager.isDebugMode;
  var SWinfoObj;
  var swStateChanges = false;
  var swNewInstallStartup = false;
  var swPromptRefresh = false;


  window.onload = function () {
    // see service worker registration/update handler below
  }

  // ----------------------------------------------------

  $('#imgAppDataSyncStatus').click(() => {

    SyncManagerNew.syncAll( _cwsRenderObj, 'Manual' );

    //syncManager.syncOfflineData(this);

  });


  function appInfoOperation( returnFunc ) 
  {
    // Only online mode and by app.psi-mis.org, check the version diff.
    //if (ConnManager.getAppConnMode_Online()) // && FormUtil.isAppsPsiServer()
    if (ConnManagerNew.networkOnline_CurrState) // && FormUtil.isAppsPsiServer()
    {
      WsApiManager.setupWsApiVariables( returnFunc );
    }
    else {
      if ( debugMode ) console.log('Offline Mode'); //console.log('not PSI server')

      if ( returnFunc ) returnFunc();
    }

  };



  function recordInstallEvent(event) {
    // Track event: The app was installed (banner or manual installation)
    FormUtil.gAnalyticsEventAction(function (analyticsEvent) {
      // Track event: The app was installed (banner or manual installation)
      ga('send', { 'hitType': 'event', 'eventCategory': 'appinstalled', 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });
      playSound("coin");
    });
  }

  function updateOnlineStatus(event) {

    ConnManager.network_Online = navigator.onLine;
    ConnManagerNew.setNetworkStatus( navigator.onLine );

    if ( _cwsRenderObj.initializeStartBlock ) {
      syncManager.initialize( _cwsRenderObj );
    }

  };

  function updateSyncManager(event) {
    syncManager.initialize(_cwsRenderObj);
  }

  // ----------------------------------------------------

  function initialize() {


    if ( Util.getURLParameterByName(window.location.href, 'diagnostic').length || Util.getURLParameterByName(window.location.href, 'kill').length ) {

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
    else {

      FormMsgManager.appBlockTemplate('appLoad');

      if ('serviceWorker' in navigator) {

        navigator.serviceWorker.register('./service-worker.js').then(registration => {

          SWinfoObj = localStorage.getItem('swInfo');

          if (!SWinfoObj) {
            SWinfoObj = { 'reloadRequired': false, 'datetimeInstalled': (new Date()).toISOString(), 'currVersion': _ver, 'lastVersion': _ver, 'datetimeApplied': (new Date()).toISOString() };
          }
          else {
            SWinfoObj = JSON.parse(SWinfoObj);

            SWinfoObj['reloadRequired'] = false;
          }

          if (registration.active == null) {
            swNewInstallStartup = true;
            SWinfoObj.lastState = '';
          }
          else {
            swNewInstallStartup = false;
            SWinfoObj.lastState = registration.active.state;
          }

          localStorage.setItem('swInfo', JSON.stringify(SWinfoObj));


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

              switch (installingWorker.state) {
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

                  //if ( mySWupdates )
                  {
                    //mySWupdates = JSON.parse( mySWupdates );

                    if (mySWupdates.reloadRequired) {
                      mySWupdates['datetimeApplied'] = (new Date()).toISOString();
                      mySWupdates['reloadRequired'] = false;

                      localStorage.setItem('swInfo', JSON.stringify(mySWupdates));
                    }

                  }

                  if (swNewInstallStartup) {
                    startApp();
                  }
                  else {
                    SWinfoObj['reloadRequired'] = true;
                    _cwsRenderObj.createRefreshIntervalTimer(_ver);
                  }
                  break;
              }

              localStorage.setItem('swInfo', JSON.stringify(SWinfoObj));

            };

          };

          _cwsRenderObj.setRegistrationObject(registration); //added by Greg (2018/12/13)
          _registrationObj = registration;

          localStorage.setItem('swInfo', JSON.stringify(SWinfoObj));

          if (debugMode) console.log('Service Worker Registered');

        })
          .then(function () {

            if (debugMode) console.log('swStateChanges: ' + swStateChanges);
            if (debugMode) console.log('swNewInstallStartup: ' + swNewInstallStartup);

            localStorage.setItem('swInfo', JSON.stringify(SWinfoObj));

            if (Util.getURLParameterByName(window.location.href, 'diagnose').length) {

              MsgManager.notificationMessage('1. diagnostics Initiating', 'notificationDark', undefined, '', 'right', 'top', 10000, false, undefined, 'diagnostics1');

              Util.cacheSizeCheckAndRepair(function (restart, details) {

                console.log(details);

                if (restart) {
                  //MsgManager.notificationMessage( '3. Clearing Session Storage', 'notificationDark', undefined,'', 'right', 'top', 10000, false, undefined,'diagnostics3' );

                  //LocalStorageDataManager.clearSessionStorage( function(){

                  MsgManager.notificationMessage('3. Clearning Cache', 'notificationDark', undefined, '', 'right', 'top', 10000, false, undefined, 'diagnostics4');

                  cacheManager.clearCacheKeys(false, function () {

                    MsgManager.notificationMessage('4. Restarting Service Worker', 'notificationDark', undefined, '', 'right', 'top', 10000, false, undefined, 'diagnostics5');

                    _cwsRenderObj.reGetAppShell(function () {

                      MsgManager.notificationMessage('5. SUCCESS ~ restarting', 'notificationGreen', undefined, '', 'right', 'top', 10000, false, undefined, 'diagnostics6');

                      window.location = (window.location.href).split( '?' )[ 0 ]; //(window.location.href).replace('?diagnose=' + Util.getURLParameterByName(window.location.href, 'diagnose'), '').replace('&diagnose=' + Util.getURLParameterByName(window.location.href, 'diagnose'), '')

                    });

                  });

                  //})

                }
                else {
                  if (swNewInstallStartup == false) startApp();
                }

              });

            }
            else {
              // Start the app after service worker is ready && not a new install/upgrade.
              if (swNewInstallStartup == false) startApp();
            }

          })
          .catch(err =>
            // MISSING TRANSLATION
            MsgManager.notificationMessage('SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000)
          );


      }

    }

  }

  function startApp() {
    // 1. Online/Offline related event setup
    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('appinstalled', recordInstallEvent);

    // Set App Connection Mode
    //ConnManager.initialize();

    // 2. Do 'appInfoOperation' that does app Version Check & action first
    //  & set web service type for the app
    // , then, proceed with 'cwsRenderObj' rendering.

    appInfoOperation( function () {

      ConnManagerNew.initialize();

      $('#spanVersion').text('v' + _ver);

      //ConnManager._cwsRenderObj = _cwsRenderObj;

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

  initialize();

})();
