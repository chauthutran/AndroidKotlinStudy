// 1. check Network and Server status
// 2. set app Mode
// 3. inform user of switchedMode > with 'REFRESH' (applied after clicking)
// -------------------------------------------
// -- ConnManager NEW Class/Methods

function ConnManagerNew() {};

//ConnManagerNew._cwsRenderObj;  // <-- Tran wants to make this class instantiating if we use 'cwsRenderObj'..

ConnManagerNew.networkConnStableCheckTime = 5000;

ConnManagerNew.networkConnTimeOut;

ConnManagerNew.statusInfo = {
    'networkConn': {
        'currentStableMode': 'Offline', // 'Online'
    },
    'serverAvailable': false,
    'serverAvailablePrev': false,
    'appMode': 'Offline' // 'Online'
};


// ====================================================
// ===============================

// On start of the app, we set this initially..
ConnManagerNew.firstNetworkConnSet = function( callBack ) 
{
	// sets 'networkConn.crrentStableMode'
	ConnManagerNew.checkNetworkThenServerStatus( ConnManagerNew.statusInfo, navigator.onLine, function( statusInfo ){

		// Trigger AppMode Change Check
		ConnManagerNew.appModeSwitch( statusInfo );

		callBack();

	} );

};


// ===============================================
// ------------------------------------------


// CHECK #1
// Event Handler for checking / updating consistant(not frequently changed) network connection status.
ConnManagerNew.updateNetworkConnStatus = function() 
{
	clearTimeout( ConnManagerNew.networkConnTimeOut );

	var modeOnline = navigator.onLine;

	ConnManagerNew.networkConnTimeOut = setTimeout( ConnManagerNew.checkNetworkThenServerStatus
		, ConnManagerNew.networkConnStableCheckTime
		, modeOnline );

};

ConnManagerNew.checkNetworkThenServerStatus = function( statusInfo, modeOnline, callBack )
{
	statusInfo.networkConn.currentStableMode = ( modeOnline ) ? 'Online': 'Offline';

	if ( modeOnline )
	{
		// roll onto serverCheck (if changed to online)
		ConnManagerNew.checkNSet_ServerAvailable( statusInfo, function() 
		{
			ConnManagerNew.setAppMode( statusInfo );
	
			if ( callBack ) callBack( statusInfo );
		});
	
	}
	else
	{
		//proceed
		ConnManagerNew.setAppMode ( statusInfo );

		// Trigger AppMode Change Check
		ConnManagerNew.appModeSwitch( statusInfo );

		if ( callBack ) callBack( statusInfo );

	}

}



// CHECK #2 - SERVER AVAILABLE CHECK
ConnManagerNew.checkNSet_ServerAvailable = function( statusInfo, callBack ) 
{
	// Below Method Not Exists Yet
	// FormUtil.getDataServerAvailable = function( returnFunc )
	if ( statusInfo.networkConn.currentStableMode === 'Online' )
	{
		ConnManagerNew.serverAvailable( function ( available ) {

			ConnManagerNew.statusInfo.serverAvailable = available;
			callBack( available );
		});	
	}
	else
	{
		ConnManagerNew.statusInfo.serverAvailable = false;
		callBack( false );
	}
};



// ===============================================
// ------------------------------------------


ConnManagerNew.serverAvailable = function( callBack )
{
	try
	{
		FormUtil.getDataServerAvailable( function ( success, jsonData ) {

			// if check succeeds with valid [jsonData] payload
			if ( success && jsonData && jsonData.available != undefined ) 
			{
				callBack( jsonData.available );
			}
			else 
			{
				callBack( false );
			}

		});
	}
	catch (err)
	{
		console.log( 'error in ConnManagerNew.serverAvailable ')
		callBack( false );
	}
}

// Be carefule to used it - 1st app start time & by prompt allowed, use it.
ConnManagerNew.setAppMode = function( statusInfo ) 
{
	statusInfo.appMode = ConnManagerNew.nameAppMode( ( statusInfo.networkConn.currentStableMode === 'Online'
	&& statusInfo.serverAvailable ) );
};

ConnManagerNew.appModeSwitch = function( statusInfo ) 
{
	// Need to check login.. decides we prompt or go ahead...
	// If not login, then, just perform the switch of appMode..

	ConnManagerNew.update_UI( statusInfo );

    if ( FormUtil.checkLogin() )
    {
        ConnManagerNew.PrompAppModeSwitch( statusInfo );
    }
}

ConnManagerNew.networkSyncConditions = function()
{
	return ( ConnManagerNew.statusInfo.appMode === 'Online' );
}

ConnManagerNew.PrompAppModeSwitch = function( statusInfo ) 
{
    // Use here or call other plalce?  Probably here..
	//
	console.log(' creating prompt switch to ' + ConnManagerNew.statusInfo.appMode );
    //
    //
};

ConnManagerNew.update_UI = function( statusInfo )
{
    // update MODE for PWA - cascade throughout app (rebuild menus + repaint screens where required)
    //
    //
    if ( ! FormUtil.checkLogin() ) ConnManagerNew.update_UI_LoginStatusIcon( statusInfo );

	ConnManagerNew.update_UI_NetworkIcons( statusInfo );
}


ConnManagerNew.initialize = function() 
{
    ConnManagerNew.firstNetworkConnSet( function(){

        ConnManagerNew.createNetworkConnListeners();

    });
};

ConnManagerNew.createNetworkConnListeners = function()
{
    window.addEventListener('online', ConnManagerNew.updateNetworkOnlineListener);
	window.addEventListener('offline', ConnManagerNew.updateNetworkOnlineListener);
};

ConnManagerNew.updateNetworkOnlineListener = function()
{
    ConnManagerNew.checkNetworkThenServerStatus( ConnManagerNew.statusInfo, navigator.onLine, function( statusInfo ){

		// Trigger AppMode Change Check
		ConnManagerNew.appModeSwitch( statusInfo );

	} );
}

ConnManagerNew.nameAppMode = function( bOnline )
{
	if ( bOnline ) return 'Online'
	else return 'Offline';
}


ConnManagerNew.update_UI_LoginStatusIcon = function( statusInfo )
{
	console.log( statusInfo );
	console.log( statusInfo.appMode );
	// update loginScreen Logo (grayscale = offline): offline indicator before logging in
    if ( statusInfo.appMode === 'Online' ) {
		$('#ConnectingWithSara').removeClass('logoOffline');
		$('#ConnectingWithSara').addClass('logoOnline');
	  }
	  else {
		$('#ConnectingWithSara').removeClass('logoOnline');
		$('#ConnectingWithSara').addClass('logoOffline');
	  }
};

ConnManagerNew.update_UI_NetworkIcons = function( statusInfo )
{
	var networkServerConditionsGood = ( statusInfo.appMode === 'Online' );

	// if all conditions good > show online, else if only networkOnline, show red icon (reserved for server unavailable), else show as offline
	var imgSrc = ( networkServerConditionsGood ) ? 'images/sharp-cloud_queue-24px.svg': ( statusInfo.networkConn.currentStableMode === 'Online' ? 'images/baseline-cloud_off-24px-unavailable.svg' : 'images/baseline-cloud_off-24px.svg' );

	$( '#imgNetworkStatus' ).css( 'transform', ( networkServerConditionsGood ) ? '' : 'rotateY(180deg)' );

	// timeout (500) used to create image rotation effect (requires 1s transition on img obj)
	setTimeout( function() { 
		$( '#imgNetworkStatus' ).attr( 'src', imgSrc );
	}, 500 );

	$( '#divNetworkStatus' ).css( 'display', 'block' );
};

// called from scheduler
ConnManagerNew.scheduledServerCheck = function( callBack )
{
	ConnManagerNew.checkNSet_ServerAvailable( ConnManagerNew.statusInfo, function() 
	{
		console.log( 'scheduledServerCheck' );
		ConnManagerNew.setAppMode( ConnManagerNew.statusInfo );

		callBack();
	});
}


// Maybe new class:
// NetworkType();  <-- Has all the methods related to 3G/2G etc..


