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
    me.createRefreshPrompt = false;

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

        var standAlone = ( window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true );

        console.customLog( 'App StandAlone Status..: ' + standAlone );

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


    // TODO: TEMP...
    window.addEventListener('beforeinstallprompt', e => {
        // this event does not fire if the application is already installed
        // then your button still hidden ;)
        console.customLog( 'before install prompt - windows' );
    });

  
    // --------------------------------------------

     // 1. main one
    me.runSWregistration = function ( callBack ) 
    {
        navigator.serviceWorker.register( me.swFile ).then( registration => 
        {
            me.swRegObj = registration;

            // If fresh registration case, we use 'callBack'..
            me.createInstallAndStateChangeEvents( me.swRegObj, callBack );

            // share registration obj with cwsRender (for reset App, etc)
            // me.setRegistrationObject( me.swRegObj );  <-- no need.  Methods are moved to this class..
        }).then(function () 
        {
            if ( !me.newRegistration ) callBack();

        }).catch(err =>
            // MISSING TRANSLATION
            MsgManager.notificationMessage('SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000)
        );
    };


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

        if ( me.debugMode) console.customLog( ' - ' + me.registrationState );

        // SW update change event 
        swRegObj.onupdatefound = () => {

            me.swInstallObj = swRegObj.installing;

            if ( me.debugMode) console.customLog( me.installStateProgress[ me.swInstallObj.state ] + ' {' + Math.round( eval( me.installStateProgress[ me.swInstallObj.state ] ) * 100 ) + '%}' );

            // sw state changes 1-4 (ref: me.installStateProgress )
            me.swInstallObj.onstatechange = () => {

                me.registrationUpdates = true;

                if ( me.debugMode) console.customLog( me.installStateProgress[ me.swInstallObj.state ] + ' {' + Math.round( eval( me.installStateProgress[ me.swInstallObj.state ] ) * 100 ) + '%}' );

                switch ( me.swInstallObj.state ) {

                    case 'installing':
                        // SW installing (1) - applying changes
                        break; // do nothing

                    case 'installed':
                        // SW installed (2) - changes applied
                        // controller present means existing SW was replaced to be made redundant
                        if ( navigator.serviceWorker.controller ) me.createRefreshPrompt = true;
                        break;

                    case 'activating':
                        // SW activating (3) - starting up 
                        break; // do nothing

                    case 'activated':
                        // SW activated (4) - start up completed: ready
                        if ( me.createRefreshPrompt ) me.createRefreshIntervalTimer();
                        else callBack();
                        break;
                }

            };


            me.swInstallObj.beforeinstallprompt = () => {
                console.customLog( 'before install prompt' );
            };

        };
    }

    // -----------------------------------

    // Restarting the service worker...
	me.reGetAppShell = function( callBack )
	{
		if ( me.swRegObj !== undefined )
		{
			me.swRegObj.unregister().then(function(boolean) {

				if ( callBack )
				{
					callBack();
				}
				else
				{
					location.reload( true );
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
						location.reload( true );
					}

				}, 100 )		
			
			});
		}
		else
		{
			// MISSING TRANSLATION
			MsgManager.notificationMessage ( 'SW unavailable - restarting app', 'notificationDark', undefined, '', 'left', 'bottom', 5000 );
			setTimeout( function() {
				location.reload( true );
			}, 100 )		
		}
	};


	me.createRefreshIntervalTimer = function()
	{		
		me.newSWrefreshNotification();

		var refreshIntV = setInterval( function() {

			me.newSWrefreshNotification();

		}, me._newUpdateInstallMsg_interval );
	};


	me.newSWrefreshNotification = function()
	{
		// new update available
		var btnUpgrade = $( '<a class="notifBtn" term=""> REFRESH </a>');

		// move to cwsRender ?
		btnUpgrade.click ( () => {  location.reload( true );  });

		// MISSING TRANSLATION
		MsgManager.notificationMessage( 'Updates installed. Refresh to apply', 'notificationDark', btnUpgrade, '', 'right', 'top', 25000 );
	};

    // -----------------------------------

    me.initialize( callBack );

};
