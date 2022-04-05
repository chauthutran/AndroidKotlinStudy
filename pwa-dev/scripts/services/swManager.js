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

SwManager.swFile =  './service-worker.js';

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

SwManager.debugMode = false;

SwManager.waitNewAppFileCheckDuringOffline = false;

SwManager.swUpdateCase = false;

// --------------------------------------------

SwManager.initialSetup = function ( callBack ) 
{
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

    //if ( SwManager.debugMode) console.customLog( ' - ' + SwManager.registrationState );

    // SW update change event 
    swRegObj.onupdatefound = () => 
    {
        SwManager.swInstallObj = swRegObj.installing;

        // sw state changes 1-4 (ref: SwManager.installStateProgress )
        SwManager.swInstallObj.onstatechange = () => 
        {
            SwManager.registrationUpdates = true;

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


    // This gets triggered after the new files are downloaded already...  Anyway to show 'download in progress'?
    navigator.serviceWorker.addEventListener( 'controllerchange', ( e ) => 
    {
        // The oncontrollerchange property of the ServiceWorkerContainer interface is 
        // an event handler fired whenever a controllerchange event occurs 
        //  — when the document's associated ServiceWorkerRegistration acquires a new active worker.
        console.log( 'swUpdate - controllerchange DETECTED' );

        // The known WFA App triggered App Reloading Process Flag..
	    if ( AppUtil.appReloading )
        {
            // In app reload/refresh, this also gets called since new service worker gets to start.
            console.log( 'App Intentional Reloading.. skip manual reload.' );
        }
        // Service Worker update check requested case.
        else if ( SwManager.swUpdateCase )
        {
            // NOTE: Thus, this gets called whenever there is a page reload.
            // --> ONLY display the message or run this if we called for reload or app Check...
            if ( SessionManager.cwsRenderObj ) SessionManager.cwsRenderObj.showNewAppAvailable( true );
            if ( SwManager.newAppFileExists_EventCallBack ) SwManager.newAppFileExists_EventCallBack();
            // 'About page' app update uses above '_EventCallBack'
            var delayReload = ( SwManager.swUpdateOption && SwManager.swUpdateOption.delayReload ); 
            
            // Reset this value
            //AppInfoManager.clearAutoLogin();
            //AppInfoLSManager.clearLoginCurrentKeys();

            
            var allowAppReload_AfterLogin = ConfigManager.getAppUpdateSetting().allowAppReload_AfterLogin;

            // For Already logged in, simply delay it --> which the logOut will perform the update.
            if ( delayReload || ( SessionManager.getLoginStatus() && !allowAppReload_AfterLogin ) )
            {
                console.log( 'App Reload Delayed (After Update).' );
                e.preventDefault();
                return false;
            }
            else
            {
                // If Not logged in, perform App Reload to show the app update - [?] add 'autoLogin' flag before triggering page reload with below 'appReloadWtMsg'.                                
                // If app update happens before login, save the username keys + pins..
                //if ( SessionManager.Status_LogIn_InProcess ) AppInfoManager.setAutoLogin( new Date() );
                //else AppInfoLSManager.setLoginCurrentKeys( new Date(), SessionManager.cwsRenderObj.loginObj.getLoginCurrentKeys() );
 

                // TODO: In Log in page, if fresh app without never logged in case, app get updated, 
                //      - try to store the userName if typed..

                AppUtil.appReloadWtMsg( 'App Reloading! (After Update)' );
            }   
        }
    });


    navigator.serviceWorker.addEventListener( 'message', event => 
    {
        if ( event.data )
        {
            var msgData = JSON.parse( event.data );

            if ( msgData.type === 'jobFiling' ) JobAidHelper.JobFilingProgress( msgData ); // JobAidHelper.JobFilingFinish( msgData.msg );
            else if ( msgData.msg ) MsgManager.msgAreaShow( msgData.msg );
        }
    });

};

// -----------------------------------

SwManager.checkNewAppFile_OnlyOnline = function( runFunction, option )
{
    //console.log( 'SwManager.checkNewAppFile_OnlyOnline called' );

    SwManager.newAppFileExists_EventCallBack = runFunction;
    SwManager.swUpdateCase = false;
    SwManager.swUpdateOption = option;

    // Trigger the sw change/update check event..
    if ( SwManager.swRegObj ) 
    {        
        console.log( 'SwRegObj.update requested..' );

        // TODO: Mark dateTime on this try - as last dateTime..  But maybe this is not needed since we have online login check + other flags..

        SwManager.swUpdateCase = true;
        SwManager.swRegObj.update();        
    }
}

/*
SwManager.checkNewAppFile_OnlyOnline2 = function( runFunction )
{
    console.log( 'SwManager.checkNewAppFile_OnlyOnline2 called' );

    if ( ConnManagerNew.isAppMode_Online() ) 
    {
        console.log( 'AppMode_Online true' );

        // No need to call this, but just to make sure..
        SwManager.waitNewAppFileCheckDuringOffline = false;

        SwManager.newAppFileExists_EventCallBack = runFunction;

        // Trigger the sw change/update check event..
        if ( SwManager.swRegObj ) 
        {
            console.log( '** swRegObj.update requested - with swUpdateCase = true' );

            SwManager.swUpdateCase = true;
            SwManager.swRegObj.update();
        }        
    }
    else 
    {
        console.log( 'AppMode_Offline' ); // <-- ISSUE: GETS called when app starts...  Why Offline?

        if ( SwManager.waitNewAppFileCheckDuringOffline )
        {
            console.log( 'Already In-Wait NewAppFileCheck - when become online mode' );
        }
        else 
        {
            console.log( 'Adding addToRunSwitchToOnlineList' );

            SwManager.waitNewAppFileCheckDuringOffline = true;

            // If not in AppMode_Online, schedule it to run as soon as it come online..
            ScheduleManager.addToRunSwitchToOnlineList( "appFileUpdateCheck", function() 
            { 
                console.log( 'Switched to Online - calling checkNewAppFile_OnlyOnline()' );

                SwManager.waitNewAppFileCheckDuringOffline = false;
                SwManager.checkNewAppFile_OnlyOnline( runFunction ); 
            });    
        }
    }
};
*/

/*
SwManager.checkNewAppFile_OnlyOnline_Back = function( runFunction )
{
    if ( ConnManagerNew.isAppMode_Online() ) SwManager.checkNewAppFile( runFunction );
};

SwManager.checkNewAppFile = function( runFunction )
{
    SwManager.newAppFileExists_EventCallBack = runFunction;
    SwManager.swUpdateCase = false;

    // Trigger the sw change/update check event..
    if ( SwManager.swRegObj ) 
    {
        SwManager.swUpdateCase = true;
        SwManager.swRegObj.update();
    }
};
*/


// NOTE: Only do this if new refresh?
SwManager.refreshForNewAppFile_IfAvailable = function()
{
    var spanLoginAppUpdateTag = $( '#spanLoginAppUpdate' );
    if ( spanLoginAppUpdateTag.is( ':visible' ) ) spanLoginAppUpdateTag.click();
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

// SwManager.listFilesInCache( 'jobTest2' );
SwManager.listFilesInCache = function( cacheKey )
{
    //caches.keys().then( function( keyList ) 
    caches.open( cacheKey ).then( cache => 
    { 
        cache.keys().then( keys => 
        { 
            keys.forEach( request => 
            { 
                console.log( Util.getUrlLastName( request.url ) );
            }); 
        }); 
    });
};
    
    