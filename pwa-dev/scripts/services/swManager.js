// 1. register sw
// 2. run install/update
// 3. 

function swManager( _cwsRenderObj, callBack ) {

    var me = this;

    me.swFile =  './service-worker.js';
    me._cwsRenderObj = _cwsRenderObj;

    me._newUpdateInstallMsg_interval = 30000;  //30 seconds

    me.swRegObj;
    me.swInstallObj;
    me.swSupported = false;
    me.newRegistration = false;
    me.registrationState;
    me.registrationUpdates = false;
    //me.newAppFilesFound = false;
    me.newAppFileExists_EventCallBack;

    me.isApp_standAlone = false;

    me.installStateProgress = {
            'installing': '1/4',
            'installed': '2/4',
            'activating': '3/4',
            'activated': '4/4'
    };

    me.debugMode = true;

    // --------------------------------------------

    me.initialize = function ( callBack ) 
    {
        me.isApp_standAlone = ( window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true );

        // checkRegisterSW
        if ( ( 'serviceWorker' in navigator ) )
        {
            me.runSWregistration( callBack );
        }
        else
        {
            alert ( 'SERVICE WORKER not supported. Cannot continue!' );
        }
    };

  
    // --------------------------------------------

     // 1. main one
    me.runSWregistration = function ( callBack ) 
    {
        navigator.serviceWorker.register( me.swFile ).then( registration => 
        {
            me.swRegObj = registration;

            // If fresh registration case, we use 'callBack'..
            me.createInstallAndStateChangeEvents( me.swRegObj ); //, callBack );

            // share registration obj with cwsRender (for reset App, etc)
            // me.setRegistrationObject( me.swRegObj );  <-- no need.  Methods are moved to this class..
            //}).then(function () 

            callBack();

        }).catch(err =>
            // MISSING TRANSLATION
            MsgManager.notificationMessage('SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000)
        );
    };


    me.createInstallAndStateChangeEvents = function( swRegObj ) //, callBack ) 
    {
        // track status of registration object (for observing updates + install events > prompt)

        if ( !swRegObj.active )
        {
            me.newRegistration = true; // 1st time running SW registration (1st time running PWA)
            me.registrationState = 'sw: new install';
        }
        else 
        {
            me.newRegistration = false; // installed previously
            me.registrationState = 'sw: existing';
        }

        if ( me.debugMode) console.customLog( ' - ' + me.registrationState );

        // SW update change event 
        swRegObj.onupdatefound = () => 
        {
            me.swInstallObj = swRegObj.installing;

            if ( me.debugMode) console.customLog( me.installStateProgress[ me.swInstallObj.state ] + ' {' + Math.round( eval( me.installStateProgress[ me.swInstallObj.state ] ) * 100 ) + '%}' );

            // sw state changes 1-4 (ref: me.installStateProgress )
            me.swInstallObj.onstatechange = () => 
            {
                me.registrationUpdates = true;

                if ( me.debugMode) console.customLog( me.installStateProgress[ me.swInstallObj.state ] + ' {' + Math.round( eval( me.installStateProgress[ me.swInstallObj.state ] ) * 100 ) + '%}' );

                switch ( me.swInstallObj.state ) 
                {
                    case 'installing':
                        // SW installing (1) - applying changes
                        break; // do nothing

                    case 'installed':
                        // SW installed (2) - changes applied
                        // controller present means existing SW was replaced to be made redundant
                        /*
                        if ( !AppUtil.appRefreshing )
                        {
                            if ( navigator.serviceWorker.controller ) {
                                console.customLog( '[sw installed] App updates detected' );
                                //console.log( navigator.serviceWorker.controller );                            
                                me.newAppFilesFound = true;
                            }
                            else
                            {
                                //console.customLog( '[sw installed] App updates NOT detected' );
                                me.newAppFilesFound = false;
                            }
    
                            //if ( me._cwsRenderObj ) me._cwsRenderObj.setNewAppFileStatus( me.newAppFilesFound );    
                        }
                        */
                        break;

                    case 'activating':
                        // SW activating (3) - starting up 
                        break; // do nothing

                    case 'activated':
                        //console.customLog( '[sw activated]' );
                        // SW activated (4) - start up completed: ready
                        
                        /*if ( me.newAppFilesFound && me.newAppFileExists_EventCallBack )
                        {
                            me.newAppFileExists_EventCallBack();
                            me.newAppFileExists_EventCallBack = undefined;    
                        } */
                        break;
                }
            };
        };

        navigator.serviceWorker.addEventListener( 'controllerchange', () => 
        {
            // 
            if ( !AppUtil.appRefreshing )
            {
                if ( me._cwsRenderObj ) me._cwsRenderObj.setNewAppFileStatus( true );
                if ( me.newAppFileExists_EventCallBack ) me.newAppFileExists_EventCallBack();
            }
        })
    };

    // -----------------------------------

    me.registerEvent_newAppFileExists = function( eventCallBack )
    {
        me.newAppFileExists_EventCallBack = eventCallBack;
    };

	me.newSWrefreshNotification = function()
	{
		// new update available
		var btnUpgrade = $( '<a class="notifBtn" term=""> REFRESH </a>');

		// move to cwsRender ?
		btnUpgrade.click ( () => {  AppUtil.appRefresh();  });

		// MISSING TRANSLATION
		MsgManager.notificationMessage( 'Updates installed. Refresh to apply', 'notificationDark', btnUpgrade, '', 'right', 'top', 25000 );
	};


    me.checkNewAppFile = function( runFunction )
    {
        me.registerEvent_newAppFileExists( runFunction );

        // Trigger the sw change/update check event..
        if ( me.swRegObj ) me.swRegObj.update();
    };


    me.checkNewAppFile_OnlyOnline = function( runFunction )
    {
        if ( ConnManagerNew.isAppMode_Online() ) me.checkNewAppFile( runFunction );
    };

    // -----------------------------------

    // Restarting the service worker...
	me.reGetAppShell = function( callBack )
	{
		if ( me.swRegObj )
		{
			me.swRegObj.unregister().then( function(boolean) {

                MsgManager.notificationMessage ( 'SW UnRegistered', 'notificationDark', undefined, '', 'left', 'bottom', 1000 );

				if ( callBack )
				{
					callBack();
				}
				else
				{
					AppUtil.appRefresh();
				}

			})
			.catch(err => {
				// MISSING TRANSLATION
				MsgManager.notificationMessage ( 'SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000 );

                setTimeout( function() {
					
					if ( callBack )
					{
						callBack();
					}
					else
					{
						AppUtil.appRefresh();
					}

				}, 100 )		
			
			});
		}
		else
		{
			// MISSING TRANSLATION
			MsgManager.notificationMessage ( 'SW unavailable - restarting app', 'notificationDark', undefined, '', 'left', 'bottom', 5000 );
			setTimeout( function() {
				AppUtil.appRefresh();
			}, 100 )		
		}
	};

    // -----------------------------------

    me.initialize( callBack );

};
