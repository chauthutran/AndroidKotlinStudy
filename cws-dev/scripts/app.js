(function() {
  'use strict';

  let _registrationObj;

  const _cwsRenderObj = new cwsRender();
  
  var debugMode = false;
  var SWinfoObj;
  var swStateChanges = false;
  var swNewInstallStartup = false;
  var swPromptRefresh = false;


  window.onload = function() {
    // see service worker registration/update handler below
  }

  // ----------------------------------------------------

  $( '#imgAppDataSyncStatus' ).click ( () => {
    syncManager.syncOfflineData( this );
  });


  // App version check and return always..  
  //  (Unless version is outdated and agreed to perform 'reget' for new service worker
  //    - which leads to app reload with new version of service worker.
  function appInfoOperation( returnFunc ) 
  {
    // Only online mode and by app.psi-mis.org, check the version diff.
    if ( ConnManager.getAppConnMode_Online() ) // && FormUtil.isAppsPsiServer()
    {

      FormUtil.getConfigInfo( function( result, data ) 
      {
        try {
          if ( ( location.href ).indexOf( '.psi-mis.org' ) >= 0 )
            FormUtil.dynamicWS = data[ ( location.host ).replace( '.psi-mis.org', '' ) ];
          else
            FormUtil.dynamicWS = data[ "cws-dev" ];
        }
        catch(err) {
          try {
            FormUtil.dynamicWS = data[ "cws-dev" ];
          }
          catch(err) {
            console.log( err.message );
          }
        }

        FormUtil.staticWSName = ( FormUtil.dynamicWS ).toString().split('/')[ ( FormUtil.dynamicWS ).toString().split('/').length-1 ];
        FormUtil._serverUrlOverride = '';

        for (var i = 0; i < ( FormUtil.dynamicWS ).toString().split('/').length -1; i++)
        {
          FormUtil._serverUrlOverride = FormUtil._serverUrlOverride + ( FormUtil.dynamicWS ).toString().split('/')[ i ];
          if ( i < ( FormUtil.dynamicWS ).toString().split('/').length -2 ) FormUtil._serverUrlOverride += '/';
        }

        appVersionUpgradeReview( FormUtil.dynamicWS );

        FormUtil._getPWAInfo = FormUtil.dynamicWS;

        webServiceSet( FormUtil.staticWSName );

        if (returnFunc) returnFunc();

      });

    }
    else
    {
      if ( debugMode ) console.log('not PSI server')

      if ( ! FormUtil._getPWAInfo )
      {
        FormUtil._getPWAInfo = { "reloadInstructions": {"session": "false","allCaches": "false","serviceWorker": "false"},"appWS": {"cws-dev": "eRefWSDev3","cws-train": "eRefWSTrain","cws": "eRefWSDev3"},"version": _ver};
      }

      appVersionUpgradeReview(FormUtil._getPWAInfo );

      if (returnFunc) returnFunc();
    }

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
            if ( debugMode ) console.log( 'btnRefresh > FormUtil.deleteCacheKeys() ' );
            FormUtil.deleteCacheKeys( );
          }

        }

      });

      // MISSING TRANSLATION
      MsgManager.notificationMessage ( 'New version of app is available', 'notificationDark', btnUpgrade, '', 'right', 'bottom', 15000 );

    }

  }

  function webServiceSet( wsName )
  {
    if ( wsName ) FormUtil.staticWSName = wsName;
  }

  function recordInstallEvent( event )
  {
      // Track event: The app was installed (banner or manual installation)
      FormUtil.gAnalyticsEventAction( function( analyticsEvent ) {
          // Track event: The app was installed (banner or manual installation)
          ga('send', { 'hitType': 'event', 'eventCategory': 'appinstalled', 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });
          playSound("coin");
      });
  }

  function updateOnlineStatus( event ) 
  {
    ConnManager.network_Online = navigator.onLine;

    if ( _cwsRenderObj.initializeStartBlock )
    {
      syncManager.initialize( _cwsRenderObj );
    }

  };

  function updateSyncManager( event ) 
  {
    syncManager.initialize( _cwsRenderObj );
  }

  // ----------------------------------------------------

  function initialize()
  {

    FormMsgManager.appBlockTemplate( 'appLoad' );

    if ('serviceWorker' in navigator) {

      navigator.serviceWorker.register( './service-worker.js' ).then( registration => {

        SWinfoObj = localStorage.getItem( 'swInfo' );

        if ( ! SWinfoObj )
        {
          SWinfoObj = { 'reloadRequired': false, 'datetimeInstalled': (new Date() ).toISOString() , 'currVersion': _ver, 'lastVersion': _ver, 'datetimeApplied': (new Date() ).toISOString() };
        }
        else
        {
          SWinfoObj = JSON.parse( SWinfoObj );

          SWinfoObj[ 'reloadRequired' ] = false;
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


        registration.onupdatefound = () => {

          const installingWorker = registration.installing;

          SWinfoObj = JSON.parse( localStorage.getItem( 'swInfo' ) );

          SWinfoObj[ 'lastState' ] = installingWorker.state;

          localStorage.setItem( 'swInfo', JSON.stringify( SWinfoObj ) );

          console.log( ' - sw_state: ' + installingWorker.state );


          installingWorker.onstatechange = () => {

            SWinfoObj = JSON.parse( localStorage.getItem( 'swInfo' ) );
            swStateChanges = true;

            console.log( ' ~ sw_state: ' + installingWorker.state );
            SWinfoObj[ 'lastState' ] = installingWorker.state;

            switch (installingWorker.state) 
            {
              case 'installed':
                  // existing controller = existing SW :: new updates installed
                  if (navigator.serviceWorker.controller) 
                  {
                    swPromptRefresh = true;
                    SWinfoObj[ 'reloadRequired' ] = true;
                  }
                  else
                  {
                    //localStorage.setItem( 'swInfo', JSON.stringify( { 'reloadRequired': false, 'datetimeInstalled': (new Date() ).toISOString() , 'currVersion': _ver, 'lastVersion': _ver, 'datetimeApplied': (new Date() ).toISOString() } ) );
                    SWinfoObj[ 'reloadRequired' ] = false;
                  }
                  break;
              case 'activating':
                  break;
              case 'activated':

                  var mySWupdates = JSON.parse( localStorage.getItem( 'swInfo' ) );

                  //if ( mySWupdates )
                  {
                    //mySWupdates = JSON.parse( mySWupdates );

                    if ( mySWupdates.reloadRequired )
                    {
                      mySWupdates[ 'datetimeApplied' ] = (new Date() ).toISOString();
                      mySWupdates[ 'reloadRequired' ] = false;

                      localStorage.setItem( 'swInfo', JSON.stringify( mySWupdates ) );
                    }

                  }

                  if ( swNewInstallStartup )
                  {
                    startApp();
                  }
                  else
                  {
                    SWinfoObj[ 'reloadRequired' ] = true;
                    _cwsRenderObj.createRefreshIntervalTimer( _ver );
                  }
                  break;
            }

            localStorage.setItem( 'swInfo', JSON.stringify( SWinfoObj ) );

          };

        };

        _cwsRenderObj.setRegistrationObject( registration ); //added by Greg (2018/12/13)
        _registrationObj = registration;

        localStorage.setItem( 'swInfo', JSON.stringify( SWinfoObj ) );

        if ( debugMode ) console.log('Service Worker Registered');

      })
        .then(function() {

          console.log( 'swStateChanges: ' + swStateChanges );
          console.log( 'swNewInstallStartup: ' + swNewInstallStartup );

          localStorage.setItem( 'swInfo', JSON.stringify( SWinfoObj ) );

          // Start the app after service worker is ready && not a new install/upgrade.
          if ( swNewInstallStartup == false ) startApp();

        })
        .catch(err => 
          // MISSING TRANSLATION
          MsgManager.notificationMessage ( 'SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000 )
        );

    }

  }

  function startApp() 
  {
    // 1. Online/Offline related event setup
    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('appinstalled', recordInstallEvent);

    // Set App Connection Mode
    ConnManager.initialize();

    // 2. Do 'appInfoOperation' that does app Version Check & action first
    //  & set web service type for the app
    // , then, proceed with 'cwsRenderObj' rendering.

    appInfoOperation( function() {

      $( '#spanVersion' ).text( 'v' + _ver );

      ConnManager._cwsRenderObj = _cwsRenderObj;
    
      _cwsRenderObj.render();  

      syncManager.initialize( _cwsRenderObj );

      FormUtil.createNumberLoginPinPad(); //if ( Util.isMobi() )

      console.log( 'swPromptRefresh: ' + swPromptRefresh );
      if ( swPromptRefresh )
      {
        _cwsRenderObj.createRefreshIntervalTimer( _ver );
      }

      setTimeout(function(){

        FormMsgManager.appUnblock();

      },500)


    });


  }

  initialize();

})();
