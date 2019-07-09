(function() {
  'use strict';

  let _registrationObj;
  const _cwsRenderObj = new cwsRender();
  
  var debugMode = false;
  var loadLogoDelay = 1000;

  window.onload = function() {
    //startApp();
  }

  function startApp() 
  {

    $( '#appVersion' ).text( 'v' + _ver );

    FormMsgManager.appBlock( "<img src='images/Connect.svg' class='cwsLogoRotateSpin' style='width:44px;height:44px;'>" );

    // 1. Online/Offline related event setup
    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    ConnManager.initialize();

    appInfoOperation( function() {
      // Create a class that represent the object..
      ConnManager._cwsRenderObj = _cwsRenderObj;
      _cwsRenderObj.render();

    });

    window.addEventListener('appinstalled', function(event) 
    {
        // Track event: The app was installed (banner or manual installation)
        //ga('send', { 'hitType': 'event', 'eventCategory': 'appinstalled', 'eventAction': FormUtil.gAnalyticsEventAction(), 'eventLabel': FormUtil.gAnalyticsEventLabel() });
        playSound("coin");

    });

  }

  // ----------------------------------------------------


  // App version check and return always..  
  //  (Unless version is outdated and agreed to perform 'reget' for new service worker
  //    - which leads to app reload with new version of service worker.
  function appInfoOperation( returnFunc ) 
  {
    // Only online mode and by app.psi-mis.org, check the version diff.
    if ( ConnManager.getAppConnMode_Online() ) // && FormUtil.isAppsPsiServer()
    {
      setTimeout( function() 
      {
        FormMsgManager.appUnblock();

        if (returnFunc) returnFunc();

      }, loadLogoDelay );
    }
    else
    {
      if ( debugMode ) console.log('not PSI server')

      if ( ! FormUtil._getPWAInfo )
      {
        FormUtil._getPWAInfo = { "reloadInstructions": {"session": "false","allCaches": "false","serviceWorker": "false"},"appWS": {"cws-dev": "eRefWSDev3","cws-train": "eRefWSTrain","cws": "eRefWSDev3"},"version": _ver};
      }

      FormMsgManager.appUnblock();

      if (returnFunc) returnFunc();
    }

  };


  function updateOnlineStatus( event ) 
  {
    ConnManager.network_Online = navigator.onLine;
  };

  // ----------------------------------------------------

  if ('serviceWorker' in navigator ) {

    navigator.serviceWorker.register('./service-worker.js').then(registration=> {

        registration.onupdatefound = () => {

          const installingWorker = registration.installing;

          installingWorker.onstatechange = () => {

            //console.log( 'SW state changing: ' + installingWorker.state );

            switch (installingWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  // new update available
                  //resolve(true);
                  var btnUpgrade = $( '<a class="notifBtn" term=""> REFRESH </a>');

                  // move to cwsRender ?
                  $( btnUpgrade ).click ( () => {
                    location.reload( true );
                  });

                  MsgManager.notificationMessage ( 'Updates installed. Click refresh', 'notificationDark', btnUpgrade, '', 'right', 'bottom', 15000 );
                } else {
                  // no update available
                  //resolve(false);
                }
                break;
            }

          };

        };

        //_cwsRenderObj.setRegistrationObject( registration ); //added by Greg (2018/12/13)
        _registrationObj = registration;
        if ( debugMode ) console.log('Service Worker Registered');

      })
      .then(function() {

        // Start the app after service worker is ready.
        startApp();

      })
      .catch(err => 
        MsgManager.notificationMessage ( 'SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000 )
      );

  }


})();
