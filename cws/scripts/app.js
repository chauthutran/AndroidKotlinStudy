(function() {
  'use strict';

  let _registrationObj;
  const _cwsRenderObj = new cwsRender();
  //const _syncManager = new syncManager();
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

  }

  // ----------------------------------------------------

  $( '#spanVersion' ).text( 'v' + _ver );
  
  $( '.reget' ).click( () => {
    FormUtil.performReget( _registrationObj );
  });

  $( '#swRefresh' ).click( () => {
    FormUtil.performReget( _registrationObj, "update" );
  });

  $( '#imgAppDataSyncStatus' ).click ( () => {
    window._syncManager.syncOfflineData( this );
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
          console.log( 'AppInfo Retrieved: ' + JSON.stringify( jsonData ) );

          // App version check and possibly reload into the new version
          appVersionCheckAndReload( jsonData.version );

          // get proper web service - Should not implement this due to offline possibility
          webServiceSet( jsonData.appWS );
        }

        returnFunc();
      });
    }
    else
    {      
      returnFunc();
    }

  };


  function appVersionCheckAndReload( version ) 
  {
    var latestVersionStr = ( version ) ? version : '';

    // compare the version..  true if online version (retrieved one) is higher..
    if ( _ver < latestVersionStr )
    {
      if ( confirm( 'Version Outdated. ' + _ver + ' --> ' + latestVersionStr + '  Do you want to update App?' ) ) 
      {
        //$( '.reget' ).click();
        FormUtil.performReget( _registrationObj );
      }
      else 
      {
        console.log( 'Using old version.  This app version: ' + _ver + ', latestVersion: ' + latestVersionStr );
      }
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


  function updateOnlineStatus( event ) {

    ConnManager.network_Online = navigator.onLine;
    connStatTagUpdate( ConnManager.network_Online );

    if ( _cwsRenderObj.initializeStartBlock )
    {
      window._syncManager.initialize( _cwsRenderObj );
    }

  };

  function updateSyncManager( event ) {

    window._syncManager.initialize( _cwsRenderObj );

  }

  function connStatTagUpdate( bOnline ) {

    var imgSrc = ( bOnline ) ? 'images/sharp-cloud_queue-24px.svg': 'images/baseline-cloud_off-24px.svg';

    $( '#imgNetworkStatus' ).css( 'transform', ( bOnline ) ? 'rotateY(180deg)' : '' );

    setTimeout( function() { // timeout (500) used to create image rotation effect (requires 1s transition on img obj)
        $( '#imgNetworkStatus' ).attr( 'src', imgSrc );
    }, 500 );

    $( '#divNetworkStatus' ).css( 'display', 'block' );

    //console.log( '=== Network Online: ' + bOnline );
  };

  // ----------------------------------------------------

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(function( registration ) 
      { 
        _cwsRenderObj.setRegistrationObject( registration ); //added by Greg (2018/12/13)
        
        // '_cwsRenderObj' is available at this time?
        //console.log( _cwsRenderObj );

        _registrationObj = registration;
        console.log('Service Worker Registered'); 
      });
  };
})();
