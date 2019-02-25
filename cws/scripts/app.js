(function() {
  'use strict';

  let _registrationObj;
  const _cwsRenderObj = new cwsRender();
  
  window._syncManager = new syncManager(); //i realise this is bad practice > but I need access to _syncManager object from aboutApp.js

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
  
/*
  $( '#spanVersion' ).click( () => {

    var btn = $( '<a class="notifBtn">CLICK HERE</a>' );

    $( btn ).click( () => {
      MsgManager.notificationMessage( 'you clicked here', 'notificationDark', undefined,'background-Color: blue;color:#fff', 'left', 'top' );
    });

    MsgManager.notificationMessage( 'gregs first test notification', 'notificationDark', btn,'backgroundColor: #404040;color:#fff', 'right', 'top' );

});
*/
  $( '.reget' ).click( () => {
    FormUtil.performReget( _registrationObj );
  });

  $( '#imgAppDataSyncStatus' ).click ( () => {
    window._syncManager.syncOfflineData( this );
  });

  // move to cwsRender 
  $( '#btnUpgrade' ).click ( () => {

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

  });

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
    if ( ConnManager.getAppConnMode_Online() && FormUtil.isAppsPsiServer() )
    {

      FormMsgManager.appBlock( "Loading App Data..." );

      FormUtil.getAppInfo( function( success, jsonData ) 
      {
        FormMsgManager.appUnblock();

        if ( jsonData )
        {

          FormUtil._getPWAInfo = jsonData;

          console.log( 'AppInfo Retrieved: ' + FormUtil._getPWAInfo );

          // App version check and possibly reload into the new version
          appVersionUpgradeReview( jsonData );

          // get proper web service - Should not implement this due to offline possibility
          webServiceSet( jsonData.appWS );
        }

        returnFunc();
      });
    }
    else
    {

      FormUtil._getPWAInfo = { "reloadInstructions": {"session": "false","allCaches": "false"},"appWS": {"cws-dev": "eRefWSDev3","cws-train": "eRefWSTrain","cws": "eRefWSDev3"},"version": "1.0.0.400"};
      appVersionUpgradeReview(FormUtil._getPWAInfo );
      returnFunc();
    }

  };


  function appVersionUpgradeReview( jsonData ) 
  {
    var latestVersionStr = ( jsonData.version ) ? jsonData.version : '';

    // compare the version..  true if online version (retrieved one) is higher..
    if ( _ver < latestVersionStr )
    {
      $( '#notificationUpgrade').show( 'slow' );

      // hide automatically after 30seconds of no action
      setTimeout( function() {
        if ( $( '#notificationUpgrade').is(':visible') )
        {
          $( '#notificationUpgrade').hide( 'slow' );
        }
      }, 15000 ); 

    }
    else
    {
      $( '#notificationUpgrade').hide( 'slow' );
    }
  };

  
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
        console.log( 'setting staticWSName: ' + wsName );
        FormUtil.staticWSName = wsName;
      }
    }
  };


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

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(function( registration ) 
      { 
        _cwsRenderObj.setRegistrationObject( registration ); //added by Greg (2018/12/13)
        _registrationObj = registration;
        console.log('Service Worker Registered'); 

      });
  };
})();
