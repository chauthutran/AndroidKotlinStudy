function swManager( _cwsRenderObj ) {

    var me = this;

    me.swFile =  './service-worker.js';
    me.callBackStartApp;
    me._cwsRenderObj = _cwsRenderObj;

    me.SWinfoObj;

    me.swRegObj;
    me.swInstallObj;

    me.freshSWregistration = false;
    me.updatesFound = false;
    me.UpdatesRequireRefresh = false;

    me.debugMode = true;

    me.run = function ( callBack ) 
    {
        //me.callBackStartApp = callBackStartApp;

        me.createSWinfo();
        me.installServiceWorker( callBack );
    }

    me.createSWinfo = function () 
    {
        var SWinfoStr = localStorage.getItem( 'swInfo' );

        if ( ! SWinfoStr ) 
        {
            me.SWinfoObj = { 'reloadRequired': false, 'datetimeInstalled': (new Date()).toISOString(), 'currVersion': _ver, 'lastVersion': _ver, 'datetimeApplied': (new Date()).toISOString() };
        }
        else 
        {
            me.SWinfoObj = JSON.parse( SWinfoStr );
            me.SWinfoObj.reloadRequired = false;
        }
    };

    // 1. main purpose of SW class
    me.installServiceWorker = function ( callBack ) 
    {
        me.checkSWexists(function () {

            me.registerServiceWorker( callBack );

        }, function() {
            alert ( 'SERVICE WORKER not supported. Cannot continue' );
        });
    };

    me.checkSWexists = function ( callBack, errCallBack ) 
    {
        if ('serviceWorker' in navigator) {
            callBack();
        }
        else
        {
            errCallBack();
        }
    };

    me.saveSWinfo = function () 
    {
        localStorage.setItem('swInfo', JSON.stringify(me.SWinfoObj));
    }

    me.loadRegistrationObjVars = function ( swRegObj ) 
    {
        // track status of registration object 'state'
        me.swRegObj = swRegObj;

        if ( ! swRegObj.active )
        {
            me.freshSWregistration = true; // 1st time running SW registration (1st time running PWA)
            me.SWinfoObj.lastState = '';
        }
        else 
        {
            me.freshSWregistration = false;
            me.SWinfoObj.lastState = swRegObj.active.state;
        }
    }

    me.monitorUpdatesAndStateChanges = function ( swRegObj, callBack ) 
    {

        /**** level 1 SW EVENT ****/

        // SW changes detected
        swRegObj.onupdatefound = () => {

            me.swInstallObj = swRegObj.installing;

            me.SWinfoObj['lastState'] = me.swInstallObj.state;

            me.saveSWinfo();

            if (me.debugMode) console.log(' - sw_state update: ' + me.swInstallObj.state);

            /**** level 2 SW EVENT ****/
            me.swInstallObj.onstatechange = () => {

                me.updatesFound = true;
                me.SWinfoObj['lastState'] = me.swInstallObj.state;

                if (me.debugMode) console.log(' ~ sw_state: ' + me.swInstallObj.state);

                switch (me.swInstallObj.state) {

                    // SW installing (1) - applying changes
                    case 'installing':
                        break; // do nothing

                    // SW installed (2) - changes applied
                    case 'installed':
                        if (navigator.serviceWorker.controller) 
                        {
                            me.UpdatesRequireRefresh = true;
                            me.SWinfoObj['reloadRequired'] = true;
                        }
                        else 
                        {
                            me.SWinfoObj['reloadRequired'] = false;
                        }
                        break;


                    // SW activating (3) - starting applied
                    case 'activating':
                        break; // do nothing

                    // SW activated (4) - done > ready for refresh
                    case 'activated':

                        if (me.SWinfoObj.reloadRequired) 
                        {
                            me.SWinfoObj['datetimeApplied'] = (new Date()).toISOString();
                            me.SWinfoObj['reloadRequired'] = false;
                            me.saveSWinfo();
                        }

                        if (me.freshSWregistration) 
                        {
                            //startApp(); // callBack to App.js
                            //me.callBackStartApp();
                            callBack();
                        }
                        else 
                        {
                            me.SWinfoObj['reloadRequired'] = true;
                            me._cwsRenderObj.createRefreshIntervalTimer(_ver);
                        }
                        break;
                }

                me.saveSWinfo()

            };

        };
    }

    me.registerServiceWorker = function ( callBack ) 
    {

        navigator.serviceWorker.register( me.swFile ).then( registration => {

            me.loadRegistrationObjVars( registration );

            me.saveSWinfo();

            me.monitorUpdatesAndStateChanges( registration, callBack );

            // need to share registration obj with cwsRender (for reset App, etc)
            me._cwsRenderObj.setRegistrationObject( registration );

            me.saveSWinfo();

            if (me.debugMode) console.log('Service Worker Registered');

        }).then(function () {

            if (me.debugMode) console.log('updatesFound: ' + me.updatesFound);
            if (me.debugMode) console.log('freshSWregistration: ' + me.freshSWregistration);

            me.saveSWinfo();

            if (me.freshSWregistration == false) 
            {
                // callBack to App.js
                //me.callBackStartApp();
                callBack();
            }

        }).catch(err =>
            // MISSING TRANSLATION
            MsgManager.notificationMessage('SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000)
        );

    }

};
