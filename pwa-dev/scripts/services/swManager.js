// 1. register sw
// 2. run install/update
// 3. 

function swManager( _cwsRenderObj, callBack ) {

    var me = this;

    me.swFile =  './service-worker.js';
    me._cwsRenderObj = _cwsRenderObj;

    me.swRegObj;
    me.swInstallObj;
    me.swSupported = false;
    me.newRegistration = false;
    me.registrationState;
    me.registrationUpdates = false;
    me.createRefreshPrompt = false;

    me.installStateProgress = {
            'installing': '1/4',
            'installed': '2/4',
            'activating': '3/4',
            'activated': '4/4'
    };

    me.debugMode = true;

    me.initialize = function ( callBack ) 
    {
        me.checkRegisterSW( callBack );
    }

    me.checkRegisterSW = function ( callBack ) 
    {
        me.swSupported = ('serviceWorker' in navigator);

        if ( me.swSupported )
        {
            me.runSWregistration( callBack );
        }
        else
        {
            alert ( 'SERVICE WORKER not supported. Cannot continue' );
        }
    };

     // 1. main one
    me.runSWregistration = function ( callBack ) 
    {
        navigator.serviceWorker.register( me.swFile ).then( registration => {

            me.swRegObj = registration;

            // If fresh registration case, we use 'callBack'..
            me.createInstallAndStateChangeEvents( me.swRegObj, callBack );

            // share registration obj with cwsRender (for reset App, etc)
            me._cwsRenderObj.setRegistrationObject( me.swRegObj );

        }).then(function () {

            //console.log( me.registrationState );

            if ( ! me.newRegistration ) 
            {
                callBack();
            }

        }).catch(err =>
            // MISSING TRANSLATION
            MsgManager.notificationMessage('SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000)
        );

    }

    me.createInstallAndStateChangeEvents = function( swRegObj, callBack ) 
    {
        // track status of registration object (for observing updates + install events > prompt)

        if ( ! swRegObj.active )
        {
            me.newRegistration = true; // 1st time running SW registration (1st time running PWA)
            me.registrationState = 'sw: new install';
        }
        else 
        {
            me.newRegistration = false; // installed previously
            me.registrationState = 'sw: existing';
        }

        if ( me.debugMode) console.log( ' - ' + me.registrationState );

        // SW update change event 
        swRegObj.onupdatefound = () => {

            me.swInstallObj = swRegObj.installing;

            if ( me.debugMode) console.log( me.installStateProgress[ me.swInstallObj.state ] + ' {' + Math.round( eval( me.installStateProgress[ me.swInstallObj.state ] ) * 100 ) + '%}' );

            // sw state changes 1-4 (ref: me.installStateProgress )
            me.swInstallObj.onstatechange = () => {

                me.registrationUpdates = true;

                if ( me.debugMode) console.log( me.installStateProgress[ me.swInstallObj.state ] + ' {' + Math.round( eval( me.installStateProgress[ me.swInstallObj.state ] ) * 100 ) + '%}' );

                switch ( me.swInstallObj.state ) {

                    case 'installing':
                        // SW installing (1) - applying changes
                        break; // do nothing

                    case 'installed':
                        // SW installed (2) - changes applied
                        if ( navigator.serviceWorker.controller )
                        {
                            // controller present means existing SW was replaced to be made redundant
                            me.createRefreshPrompt = (true);
                        }
                        break;

                    case 'activating':
                        // SW activating (3) - starting up 
                        break; // do nothing

                    case 'activated':
                        // SW activated (4) - start up completed: ready
                        if ( me.createRefreshPrompt ) 
                        {
                            // ready for refresh 
                            me._cwsRenderObj.createRefreshIntervalTimer( _ver );
                        }
                        else 
                        {
                            // PWA ready - continue with app.js callBack
                            callBack();
                        }
                        break;
                }

            };

        };
    }

    me.initialize( callBack );

};
