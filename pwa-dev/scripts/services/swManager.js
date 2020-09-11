// -------------------------------------------
// -- Service Worker Manager Class/Methods
//	  - Register Service Worker and setup app updates
// -----------------------------------------
function SwManager() {};

//function swManager( _cwsRenderObj, callBack ) {
SwManager.swFile =  './service-worker.js';
SwManager._cwsRenderObj;

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
    SwManager._cwsRenderObj = cwsRenderObj;

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
        MsgManager.notificationMessage('SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000)
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
        // 
        if ( !AppUtil.appReloading )
        {
            if ( SwManager._cwsRenderObj ) SwManager._cwsRenderObj.setNewAppFileStatus( true );
            if ( SwManager.newAppFileExists_EventCallBack ) SwManager.newAppFileExists_EventCallBack();

            // NEW:  
            //  - If login page, not in login state, refresh it..
            if ( !SessionManager.getLoginStatus() )
            {
                AppUtil.appReload();
            }
        }
    })
};

// -----------------------------------

SwManager.registerEvent_newAppFileExists = function( eventCallBack )
{
    SwManager.newAppFileExists_EventCallBack = eventCallBack;
};

SwManager.newSWrefreshNotification = function()
{
    // new update available
    var btnUpgrade = $( '<a class="notifBtn" term=""> REFRESH </a>');

    // move to cwsRender ?
    btnUpgrade.click ( () => {  AppUtil.appReload();  });

    // MISSING TRANSLATION
    MsgManager.notificationMessage( 'Updates installed. Refresh to apply', 'notificationDark', btnUpgrade, '', 'right', 'top', 25000 );
};


SwManager.checkNewAppFile = function( runFunction )
{
    SwManager.registerEvent_newAppFileExists( runFunction );

    // Trigger the sw change/update check event..
    if ( SwManager.swRegObj ) SwManager.swRegObj.update();
};


SwManager.checkNewAppFile_OnlyOnline = function( runFunction )
{
    console.customLog( 'swManager.checkNewAppFile_OnlyOnline called, time: ' + new Date().toString() );

    if ( ConnManagerNew.isAppMode_Online() ) SwManager.checkNewAppFile( runFunction );
};

// -----------------------------------

// NEED TO CONFIRM/REVIEW/REDO THIS METHOD!!
// Restarting the service worker...
SwManager.reGetAppShell = function( callBack )
{
    if ( SwManager.swRegObj )
    {
        SwManager.swRegObj.unregister().then( function(boolean) 
        {
            MsgManager.notificationMessage ( 'SW UnRegistered', 'notificationDark', undefined, '', 'left', 'bottom', 1000 );
            
            if ( callBack ) callBack();
            else AppUtil.appReload();
        })
        .catch(err => 
        {
            // MISSING TRANSLATION
            MsgManager.notificationMessage ( 'SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000 );

            setTimeout( function() 
            {                
                if ( callBack ) callBack();
                else AppUtil.appReload();
            }, 100 )		        
        });
    }
    else
    {
        // MISSING TRANSLATION
        MsgManager.notificationMessage ( 'SW unavailable - restarting app', 'notificationDark', undefined, '', 'left', 'bottom', 5000 );
        setTimeout( function() {
            AppUtil.appReload();
        }, 100 )		
    }
};

// -----------------------------------