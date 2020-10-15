// -------------------------------------------
// -- Service Worker Manager Class/Methods
//	  - Register Service Worker and setup app updates
//  App Update Detect Feature:
//      - 4 places it does detect..
//      1. At App Start
//      2. At manual check button click
//      3. At log out
//      4. At login 1st activity.. (NotYet)
//          - In all tags in login page, if there is a focus, initiate the check, but only on 1st focus..
//            Thus, we need a flag.. (within login obj)  
//               And the flag gets reset when it 'renders' again?
//
// -----------------------------------------
function SwManager() {};

//function swManager( _cwsRenderObj, callBack ) {
SwManager.swFile =  './service-worker.js';
//SwManager._cwsRenderObj;

SwManager._newUpdateInstallMsg_interval = 30000;  //30 seconds

//SwManager.isApp_standAlone = false;

SwManager.swRegObj;
SwManager.swInstallObj;
SwManager.swSupported = false;
SwManager.newRegistration = false;
SwManager.registrationState;
SwManager.registrationUpdates = false;
//SwManager.newAppFilesFound = false;
SwManager.newAppFileExists_EventCallBack;

SwManager.installStateProgress = {
        'installing': '1/4',
        'installed': '2/4',
        'activating': '3/4',
        'activated': '4/4'
};

SwManager.debugMode = true;

// --------------------------------------------

SwManager.initialSetup = function ( cwsRenderObj, callBack ) 
{
    //SwManager._cwsRenderObj = cwsRenderObj;

    // checkRegisterSW
    if ( ( 'serviceWorker' in navigator ) )
    {
        SwManager.runSWregistration( callBack );
    }
    else
    {
        alert ( 'SERVICE WORKER not supported. Cannot continue!' );
    }
};


// --------------------------------------------

    // 1. main one
SwManager.runSWregistration = function ( callBack ) 
{
    navigator.serviceWorker.register( SwManager.swFile ).then( registration => 
    {
        SwManager.swRegObj = registration;

        // If fresh registration case, we use 'callBack'..
        SwManager.createInstallAndStateChangeEvents( SwManager.swRegObj ); //, callBack );

        callBack();

    }).catch(err =>
        // MISSING TRANSLATION
        MsgManager.notificationMessage('SW ERROR: ' + err, 'notifDark', undefined, '', 'left', 'bottom', 5000)
    );
};


SwManager.createInstallAndStateChangeEvents = function( swRegObj ) //, callBack ) 
{
    // track status of registration object (for observing updates + install events > prompt)

    if ( !swRegObj.active )
    {
        SwManager.newRegistration = true; // 1st time running SW registration (1st time running PWA)
        SwManager.registrationState = 'sw: new install';
    }
    else 
    {
        SwManager.newRegistration = false; // installed previously
        SwManager.registrationState = 'sw: existing';
    }

    if ( SwManager.debugMode) console.customLog( ' - ' + SwManager.registrationState );

    // SW update change event 
    swRegObj.onupdatefound = () => 
    {
        SwManager.swInstallObj = swRegObj.installing;

        if ( SwManager.debugMode) console.customLog( SwManager.installStateProgress[ SwManager.swInstallObj.state ] + ' {' + Math.round( eval( SwManager.installStateProgress[ SwManager.swInstallObj.state ] ) * 100 ) + '%}' );

        // sw state changes 1-4 (ref: SwManager.installStateProgress )
        SwManager.swInstallObj.onstatechange = () => 
        {
            SwManager.registrationUpdates = true;

            if ( SwManager.debugMode) console.customLog( SwManager.installStateProgress[ SwManager.swInstallObj.state ] + ' {' + Math.round( eval( SwManager.installStateProgress[ SwManager.swInstallObj.state ] ) * 100 ) + '%}' );

            switch ( SwManager.swInstallObj.state ) 
            {
                case 'installing':
                    // SW installing (1) - applying changes
                    break; // do nothing

                case 'installed':
                    // SW installed (2) - changes applied
                    break;

                case 'activating':
                    // SW activating (3) - starting up 
                    break; // do nothing

                case 'activated':
                    // SW activated (4) - start up completed: ready
                    break;
            }
        };
    };

    navigator.serviceWorker.addEventListener( 'controllerchange', () => 
    {
        if ( !AppUtil.appReloading )
        {
            if ( SessionManager.cwsRenderObj ) SessionManager.cwsRenderObj.setNewAppFileStatus( true );
            if ( SwManager.newAppFileExists_EventCallBack ) SwManager.newAppFileExists_EventCallBack();
            // 'About page' app update uses above '_EventCallBack'

            
            // Reset this value
            AppInfoManager.clearAutoLogin();
            AppInfoManager.clearLoginCurrentKeys();


            // For Already logged in or in process, reload the app, but also mark 
            //      Mark for auto restart -  once used (on app start), clear this out..
            if ( SessionManager.getLoginStatus() || SessionManager.Status_LogIn_InProcess )
            {            
                if ( SessionManager.getLoginStatus() ) console.log( 'AppUpdate - Already Logged In' );
                if ( SessionManager.Status_LogIn_InProcess ) console.log( 'AppUpdate - In Process of Logging In' );

                AppInfoManager.setAutoLogin( new Date() );
            }
            else
            {
                // If app update happens before login, save the username keys + pins..
                AppInfoManager.setLoginCurrentKeys( new Date(), SessionManager.cwsRenderObj.loginObj.getLoginCurrentKeys() );
            }

            // Not logged in, yet (In login page).  Not in progress of login..
            AppUtil.appReloadWtMsg( 'App Update Found - Reloading!' );
        }
    })
};

// -----------------------------------

SwManager.checkNewAppFile = function( runFunction )
{
    SwManager.newAppFileExists_EventCallBack = runFunction;

    // Trigger the sw change/update check event..
    if ( SwManager.swRegObj ) SwManager.swRegObj.update();
};


SwManager.checkNewAppFile_OnlyOnline = function( runFunction )
{
    if ( ConnManagerNew.isAppMode_Online() ) SwManager.checkNewAppFile( runFunction );
};


// -----------------------------------

// Not used, but might later..
SwManager.newSWrefreshNotification = function()
{
    // new update available
    var btnUpgrade = $( '<a class="notifBtn" term=""> REFRESH </a>');

    // move to cwsRender ?
    btnUpgrade.click ( () => {  AppUtil.appReloadWtMsg();  });

    // MISSING TRANSLATION
    MsgManager.notificationMessage( 'Updates installed. Refresh to apply', 'notifDark', btnUpgrade, '', 'right', 'top', 25000 );
};


// NEED TO CONFIRM/REVIEW/REDO THIS METHOD!!
// Restarting the service worker...
SwManager.reGetAppShell = function( callBack )
{
    if ( SwManager.swRegObj )
    {
        SwManager.swRegObj.unregister().then( function(boolean) 
        {
            MsgManager.notificationMessage ( 'SW UnRegistered', 'notifDark', undefined, '', 'left', 'bottom', 1000 );
            
            if ( callBack ) callBack();
            else AppUtil.appReloadWtMsg();
        })
        .catch(err => 
        {
            // MISSING TRANSLATION
            MsgManager.notificationMessage ( 'SW ERROR: ' + err, 'notifDark', undefined, '', 'left', 'bottom', 5000 );

            setTimeout( function() 
            {                
                if ( callBack ) callBack();
                else AppUtil.appReloadWtMsg();
            }, 100 )		        
        });
    }
    else
    {
        // MISSING TRANSLATION
        MsgManager.notificationMessage ( 'SW unavailable - restarting app', 'notifDark', undefined, '', 'left', 'bottom', 5000 );
        setTimeout( function() {
            AppUtil.appReloadWtMsg();
        }, 100 )		
    }
};

// -----------------------------------