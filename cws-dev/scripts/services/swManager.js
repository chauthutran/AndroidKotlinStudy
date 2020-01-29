function swManager( callBackStartApp, _cwsRenderObj ) {

    swManager.callBackStartApp = callBackStartApp;
    swManager._cwsRenderObj = _cwsRenderObj;

    swManager.SWinfoObj;

    swManager.swRegObj;
    swManager.swInstallObj;

    swManager.freshSWregistration = false;
    swManager.updatesFound = false;
    swManager.UpdatesRequireRefresh = false;

    swManager.debugMode = true;

    swManager.initialise = function () 
    {
        swManager.createSWinfo();
        swManager.installServiceWorker();
    }

    swManager.createSWinfo = function () 
    {
        swManager.SWinfoObj = localStorage.getItem('swInfo');

        if ( ! swManager.SWinfoObj ) 
        {
            swManager.SWinfoObj = { 'reloadRequired': false, 'datetimeInstalled': (new Date()).toISOString(), 'currVersion': _ver, 'lastVersion': _ver, 'datetimeApplied': (new Date()).toISOString() };
        }
        else 
        {
            swManager.SWinfoObj['reloadRequired'] = false;
        }
    }

    // 1. main purpose of SW class
    swManager.installServiceWorker = function () 
    {
        swManager.checkSWexists(function () {

            swManager.registerServiceWorker()

        });
    }

    swManager.checkSWexists = function (callBack) 
    {
        if ('serviceWorker' in navigator) {
            callBack();
        }
    }

    swManager.saveSWinfo = function () 
    {
        localStorage.setItem('swInfo', JSON.stringify(swManager.SWinfoObj));
    }

    swManager.loadRegistrationObjVars = function (swRegObj) 
    {
        swManager.swRegObj = swRegObj;

        if (swRegObj.active == null) 
        {
            swManager.freshSWregistration = true; // 1st time running SW registration (1st time running PWA)
            swManager.SWinfoObj.lastState = '';
        }
        else 
        {
            swManager.freshSWregistration = false;
            swManager.SWinfoObj.lastState = swRegObj.active.state;
        }
    }

    swManager.monitorUpdatesAndStateChanges = function ( swRegObj ) 
    {

        /**** level 1 SW EVENT ****/

        // SW changes detected
        swRegObj.onupdatefound = () => {

            swManager.swInstallObj = swRegObj.installing;

            swManager.SWinfoObj['lastState'] = swManager.swInstallObj.state;

            swManager.saveSWinfo();

            if (swManager.debugMode) console.log(' - sw_state update: ' + swManager.swInstallObj.state);

            /**** level 2 SW EVENT ****/
            swManager.swInstallObj.onstatechange = () => {

                swManager.updatesFound = true;
                swManager.SWinfoObj['lastState'] = swManager.swInstallObj.state;

                if (swManager.debugMode) console.log(' ~ sw_state: ' + swManager.swInstallObj.state);

                switch (swManager.swInstallObj.state) {

                    // SW installing (1) - applying changes
                    case 'installing':
                        break; // do nothing

                    // SW installed (2) - changes applied
                    case 'installed':
                        if (navigator.serviceWorker.controller) 
                        {
                            swManager.UpdatesRequireRefresh = true;
                            swManager.SWinfoObj['reloadRequired'] = true;
                        }
                        else 
                        {
                            swManager.SWinfoObj['reloadRequired'] = false;
                        }
                        break;


                    // SW activating (3) - starting applied
                    case 'activating':
                        break; // do nothing

                    // SW activated (4) - done > ready for refresh
                    case 'activated':

                        if (swManager.SWinfoObj.reloadRequired) 
                        {
                            swManager.SWinfoObj['datetimeApplied'] = (new Date()).toISOString();
                            swManager.SWinfoObj['reloadRequired'] = false;
                            swManager.saveSWinfo();
                        }

                        if (swManager.freshSWregistration) 
                        {
                            //startApp(); // callBack to App.js
                            swManager.callBackStartApp();
                        }
                        else 
                        {
                            swManager.SWinfoObj['reloadRequired'] = true;
                            swManager._cwsRenderObj.createRefreshIntervalTimer(_ver);
                        }
                        break;
                }

                swManager.saveSWinfo()

            };

        };
    }

    swManager.registerServiceWorker = function () 
    {

        navigator.serviceWorker.register('./service-worker.js').then( registration => {

            swManager.loadRegistrationObjVars( registration );

            swManager.saveSWinfo()

            swManager.monitorUpdatesAndStateChanges( registration )

            // need to share registration obj with cwsRender (for reset App, etc)
            swManager._cwsRenderObj.setRegistrationObject( registration );

            swManager.saveSWinfo()

            if (swManager.debugMode) console.log('Service Worker Registered');

        }).then(function () {

            if (swManager.debugMode) console.log('updatesFound: ' + swManager.updatesFound);
            if (swManager.debugMode) console.log('freshSWregistration: ' + swManager.freshSWregistration);

            swManager.saveSWinfo()

            if (swManager.freshSWregistration == false) 
            {
                // callBack to App.js
                swManager.callBackStartApp();
            }

        }).catch(err =>
            // MISSING TRANSLATION
            MsgManager.notificationMessage('SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000)
        );

    }

    swManager.initialise();

};
