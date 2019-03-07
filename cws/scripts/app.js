(function() {
  'use strict';

  let _registrationObj;
  const _cwsRenderObj = new cwsRender();
  
  window._syncManager = new syncManager(); //i realise this is bad practice > but I need access to _syncManager object from aboutApp.js
  var debugMode = false;

  //const _testSection = new testSection();

  window.onload = function() {

    // 1. Online/Offline related event setup
    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Set App Connection Mode
    ConnManager.setAppConnMode_Initial();
    ConnManager.setUp_AppConnModeDetection();

    // 2. Do 'appInfoOperation' that does app Version Check & action first
    //  & set web service type for the app
    // , then, proceed with 'cwsRenderObj' rendering.
    appInfoOperation( function() {

      // Create a class that represent the object..
      ConnManager._cwsRenderObj = _cwsRenderObj;
      _cwsRenderObj.render();
      window._syncManager.initialize( _cwsRenderObj );
      

    });

    window.addEventListener('appinstalled', function(event) 
    {
        // Track event: The app was installed (banner or manual installation)
        ga('send', { 'hitType': 'event', 'eventCategory': 'appinstalled', 'eventAction': FormUtil.gAnalyticsEventAction(), 'eventLabel': FormUtil.gAnalyticsEventLabel() });

    });

  }

  // ----------------------------------------------------

  $( '#spanVersion' ).text( 'v' + _ver );
  
  /*$( '#spanVersion' ).click( () => {
    var btn = $('<a class="notifBtn">click me</a>');
    $( btn ).click( () => {
     alert ('something');
    });
    MsgManager.notificationMessage ( 'bodyMessage', 'notificationDark', btn, '', 'left', 'top', 10000, true )

  });*/
  
  $( '.reget' ).click( () => {
    FormUtil.performReget( _registrationObj );
  });

  $( '#imgAppDataSyncStatus' ).click ( () => {
    window._syncManager.syncOfflineData( this );
  });

  // move to cwsRender 
 /* $( '#btnUpgrade' ).click ( () => {

    if ( FormUtil._getPWAInfo )
    {
      if ( FormUtil._getPWAInfo.reloadInstructions && FormUtil._getPWAInfo.reloadInstructions.session )
      {
        DataManager.clearSessionStorage();
      }
  
      if ( FormUtil._getPWAInfo.reloadInstructions && FormUtil._getPWAInfo.reloadInstructions.allCaches )
      {
        FormUtil.swCacheReset();
      }
  
      FormUtil.performReget( _registrationObj );
    }

  });*/

  // move to cwsRender 
  $( '#hidenotificationUpgrade' ).click ( () => {

    $( '#notificationUpgrade' ).hide( 'slow' );

  });

  

  // App version check and return always..  
  //  (Unless version is outdated and agreed to perform 'reget' for new service worker
  //    - which leads to app reload with new version of service worker.
  function appInfoOperation( returnFunc ) 
  {
    // Only online mode and by app.psi-mis.org, check the version diff.
    if ( ConnManager.getAppConnMode_Online() ) // && FormUtil.isAppsPsiServer()
    {

      FormMsgManager.appBlock( "Loading App Data..." );

      FormUtil.getAppInfo( function( success, jsonData ) 
      {
        FormMsgManager.appUnblock();
        if ( debugMode ) console.log( 'AppInfoOperation: ' + success )

        if ( jsonData )
        {

          FormUtil._getPWAInfo = jsonData;

          if ( debugMode ) console.log( 'AppInfo Retrieved: ' + FormUtil._getPWAInfo );

          // App version check and possibly reload into the new version
          appVersionUpgradeReview( jsonData );

          // get proper web service - Should not implement this due to offline possibility
          webServiceSet( jsonData.appWS );
        }

        returnFunc();
      });
    }
    /*else
    {
      if ( debugMode ) console.log('not PSI server')
      if ( ! FormUtil._getPWAInfo )
      {
        FormUtil._getPWAInfo = { "reloadInstructions": {"session": "false","allCaches": "false","serviceWorker": "false"},"appWS": {"cws-dev": "eRefWSDev3","cws-train": "eRefWSTrain","cws": "eRefWSDev3"},"version": _ver};
      }
      appVersionUpgradeReview(FormUtil._getPWAInfo );
      FormMsgManager.appUnblock();
      returnFunc();
    }*/

  };


  function appVersionUpgradeReview( jsonData ) 
  {
    var latestVersionStr = ( jsonData.version ) ? jsonData.version : '';
    if ( debugMode ) console.log( _ver , ' vs ', latestVersionStr);
    // compare the version..  true if online version (retrieved one) is higher..
    if ( _ver < latestVersionStr )
    {

      var btnUpgrade = $( '<a class="notifBtn" term=""> REFRESH </a>');

      // move to cwsRender 
      $( btnUpgrade ).click ( () => {

        if ( FormUtil._getPWAInfo )
        {
          if ( FormUtil._getPWAInfo.reloadInstructions && FormUtil._getPWAInfo.reloadInstructions.session && FormUtil._getPWAInfo.reloadInstructions.session == "true" )
          {
            if ( debugMode ) console.log( 'btnRefresh > DataManager.clearSessionStorage() ' );
            DataManager.clearSessionStorage();
          }

          if ( FormUtil._getPWAInfo.reloadInstructions && FormUtil._getPWAInfo.reloadInstructions.allCaches && FormUtil._getPWAInfo.reloadInstructions.allCaches == "true" )
          {
            if ( debugMode ) console.log( 'btnRefresh > FormUtil.swCacheReset() ' );
            FormUtil.swCacheReset();
          }

          //if ( FormUtil._getPWAInfo.reloadInstructions && FormUtil._getPWAInfo.reloadInstructions.serviceWorker && FormUtil._getPWAInfo.reloadInstructions.serviceWorker == "true" )
          {
            if ( debugMode ) console.log( 'btnRefresh > _cwsRenderObj.reGetAppShell() ' );
            _cwsRenderObj.reGetAppShell();
          }
          /*else
          {
            if ( debugMode ) console.log( 'btnRefresh > FormUtil.performReget( _registrationObj ) ' );
            FormUtil.performReget( _registrationObj );
          }*/
        }

      });

      MsgManager.notificationMessage ( 'A new version of this app is available', 'notificationDark', btnUpgrade, '', 'right', 'bottom', 15000 );

    }
    
  }

  
  function webServiceSet( appWS )
  {
    if ( appWS )
    {
      var appUrlName = FormUtil.appUrlName;
      var wsName = '';
      try { wsName = appWS[ appUrlName ]; }
      catch(err) {}

      if ( wsName ) 
      {
        if ( debugMode ) console.log( 'setting staticWSName: ' + wsName );
        FormUtil.staticWSName = wsName;
      }

    }
  }


  function updateOnlineStatus( event ) 
  {
    ConnManager.network_Online = navigator.onLine;
    ConnManager.connStatTagUpdate( ConnManager.network_Online, ConnManager.dataServer_Online );

    if ( ConnManager.dataServer_timerID == 0) ConnManager.setUp_dataServerModeDetection();

    if ( _cwsRenderObj.initializeStartBlock )
    {
      window._syncManager.initialize( _cwsRenderObj );
    }

  };

  function updateSyncManager( event ) 
  {
    window._syncManager.initialize( _cwsRenderObj );
  }

  // ----------------------------------------------------
  
  //window.isUpdateAvailable = new Promise(function(resolve, reject) {

    if ('serviceWorker' in navigator) {

      navigator.serviceWorker.register('./service-worker.js').then(registration=> {

          registration.onupdatefound = () => {

            const installingWorker = registration.installing;

            installingWorker.onstatechange = () => {

              switch (installingWorker.state) {
                case 'installed':
                  if (navigator.serviceWorker.controller) {
                    // new update available
                    //resolve(true);
                    //MsgManager.notificationMessage ( 'new updates available: installing', 'notificationDark', undefined, '', 'right', 'bottom', 5000 );
                  } else {
                    // no update available
                    //resolve(false);
                  }
                  break;
              }

            };

          };

          _cwsRenderObj.setRegistrationObject( registration ); //added by Greg (2018/12/13)
          _registrationObj = registration;
          if ( debugMode ) console.log('Service Worker Registered');

        })
        .catch(err => 
          MsgManager.notificationMessage ( 'SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000 )
        );

    }

	//});

  /*window['isUpdateAvailable']
  .then(isAvailable => {
    if (isAvailable) {

      var btnUpgrade = $( '<a class="notifBtn" term=""> REFRESH </a>');

      // move to cwsRender 
      $( btnUpgrade ).click ( () => {
        //_registrationObj.update();
        location.reload( true );
      });

      MsgManager.notificationMessage ( 'New updates applied!', 'notificationDark', btnUpgrade, '', 'left', 'bottom', 5000 );
    }
  });*/

})();
