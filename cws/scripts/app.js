(function() {
  'use strict';

  let _registrationObj;
  const _cwsRenderObj = new cwsRender();
  
  var debugMode = false;

  window.onload = function() {
    //startApp();
  }

  function startApp() 
  {
    //FormMsgManager.appBlock( "<br><br><img src='images/icons/logo-44x44.png' class='cwsLogo' style='width:44px;height:44px;'><br><br><br>Connecting with SARA...<br><br>" );
    FormMsgManager.appBlock( "<img src='images/Connect.svg' class='cwsLogoRotateSpin' style='width:44px;height:44px;'>" );

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
      ConnManager._cwsRenderObj = _cwsRenderObj;
      _cwsRenderObj.render();  
      syncManager.initialize( _cwsRenderObj );
    });


    // create numeric input keypad > untidy implementation but it works
    //if ( Util.isMobi() )
    createNumberLoginPinPad();

  }

  // ----------------------------------------------------

  $( '#spanVersion' ).text( 'v' + _ver );


  $( '#imgAppDataSyncStatus' ).click ( () => {
    syncManager.syncOfflineData( this );
  });


  // move to cwsRender 
  /*$( '#hidenotificationUpgrade' ).click ( () => {

    $( '#notificationUpgrade' ).hide( 'slow' );

  });*/


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

        FormMsgManager.appUnblock();

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

      FormMsgManager.appUnblock();

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
      ga('send', { 'hitType': 'event', 'eventCategory': 'appinstalled', 'eventAction': FormUtil.gAnalyticsEventAction(), 'eventLabel': FormUtil.gAnalyticsEventLabel() });
      playSound("coin");
  }

  function updateOnlineStatus( event ) 
  {
    ConnManager.network_Online = navigator.onLine;

    if ( _cwsRenderObj.initializeStartBlock )
    {
      syncManager.initialize( _cwsRenderObj );
    }

  };

  function createNumberLoginPinPad()
  {

      $( "#passReal" ).keydown(function( event ) 
      {
        if ( event.keyCode == 8 || event.keyCode == 46 )
        {
          $( "#passReal" ).val( '' );
          $( "#pass" ).val( '' );
        }
      });

      $( "#passReal" ).keyup(function( event ) 
      {
          $('#pass').val( $('#passReal').val() );
          $('#passReal').css( 'left', $('#pass').position().left + 10 + ( 5.5 * ( $('#pass').val().length ) ) + 'px' );
      });

      $( "#pass" ).focus(function() 
      {
          $('#passReal').focus();
          $('#passReal').css( 'left', $('#pass').position().left + 10 + ( 5.5 * ( $('#pass').val().length ) ) + 'px' );
          $('#passReal').css( 'top', $('#pass').position().top + 8 );
      });

      setTimeout( function() {
          $('#passReal').css( 'top', $('#pass').position().top + 12 );
          $('#passReal').css( 'left', $('#pass').position().left + 20 + 'px' );
      }, 500 );

  }

  function updateSyncManager( event ) 
  {
    syncManager.initialize( _cwsRenderObj );
  }

  // ----------------------------------------------------
  
  //window.isUpdateAvailable = new Promise(function(resolve, reject) {

    if ('serviceWorker' in navigator) {

      navigator.serviceWorker.register('./service-worker.js').then(registration=> {

          registration.onupdatefound = () => {

            const installingWorker = registration.installing;

            installingWorker.onstatechange = () => {

              console.log( ' ~ sw_state: ' + installingWorker.state );

              switch (installingWorker.state) {
                case 'installed':
                  if (navigator.serviceWorker.controller) 
                  {
                    // new update available
                    //resolve(true);
                    var btnUpgrade = $( '<a class="notifBtn" term=""> REFRESH </a>');
                    // move to cwsRender ?
                    $( btnUpgrade ).click ( () => {
                      location.reload( true );
                    });

                    // MISSING TRANSLATION
                    MsgManager.notificationMessage ( 'New updates installed. Click refresh to view changes', 'notificationDark', btnUpgrade, '', 'right', 'bottom', 15000 );
                  } 
                  else 
                  {
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
        .then(function() {

          // Start the app after service worker is ready.
          startApp();

        })
        .catch(err => 
          // MISSING TRANSLATION
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
