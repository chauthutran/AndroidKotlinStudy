// -------------------------------------------
// -- ConnManagerNew Class/Methods

function ConnManagerNew() {};

ConnManagerNew._cwsRenderObj;  // <-- Tran wants to make this class instantiating if we use 'cwsRenderObj'..

ConnManagerNew.networkConnStableCheckTime = 10000; // ms, 5000ms = 5 seconds
ConnManagerNew.networkConnTimeOut;

ConnManagerNew.ONLINE = 'Online';
ConnManagerNew.OFFLINE = 'Offline';

ConnManagerNew.statusInfo = {
    'networkConn': {
		'online_Current': false,
        'online_Stable': false // 'Offline',  // CHANGE TO boolean <-- with variable 'networkConn'?
    },
    'serverAvailable': true,	// Start with 'true' for serverAvailable (webService)
	'appMode': ConnManagerNew.OFFLINE, 	// 'Online' = ( statusInfo.serverAvailable = true && statusInfo.networkConn.connected_Stable == 'Online' )
	'appMode_PromptedMode': '',
	'manual_Offline': {
		'enabled': false, 	// 'mode': ConnManagerNew.OFFLINE, 	// either online:boolean or named 'Offline' >> manual offline is only 'provisioned' networkMode setting 
		'retryOption': '',
		'retryDateTime': '',
		'initiated': ''
    }
};

ConnManagerNew.efficiency = {
	'wsAvailCheck_Immediate': true  // After network Stable become online (from offline), try the ws available check immedicatley..
	,'networkConnOnline_Immediate': false  // If there is any one online signal, consider it as online stable
};

ConnManagerNew.switchPrompt_reservedMsgID;
//ConnManagerNew.switchPromptObj = new AppModeSwitchPrompt();


// ====================================================
// ===============================

// THIS IS EXCEPTION CASE - NOT MAIN CASE...
// On start of the app, we set this initially..
ConnManagerNew.appStartUp_SetStatus = function( cwsRenderObj ) //, callBack ) 
{
	ConnManagerNew._cwsRenderObj = cwsRenderObj;

	try
	{
		// To start off > update UI to 'defaults' for connection settings
		var modeOnline = navigator.onLine;  // 'navigator.online' return 'true' if network connect exists.  Otherwise, return 'false'.
		ConnManagerNew.statusInfo.networkConn.online_Current = modeOnline;
		ConnManagerNew.update_UI( ConnManagerNew.statusInfo );

		// WsAvailable is by default set to 'true'
		
		// Set the start off network connection status to 'stable' one (only on this start process)
		// And Trigger to update the AppMode (with the WsAvailable value + additional submit afterwards)
		ConnManagerNew.changeNetworkConnStableStatus( ConnManagerNew.statusInfo, modeOnline, 'startUp' );

	}
	catch( errMsg )
	{
		console.log( 'ERROR during ConnManagerNew.firstNetworkConnSet, errMsg: ' + errMsg );
		//callBack( false );
	}
};


// ===============================================
// ------------------------------------------


// CHECK #1
// Event Handler for checking / updating consistant(not frequently changed) network connection status.
ConnManagerNew.updateNetworkConnStatus = function() 
{
	// Whenever there is network status change, clear the timeout that would have set 'online_Stable' 
	//	if no change has happened in some period of time.
	clearTimeout( ConnManagerNew.networkConnTimeOut );

	var modeOnline = navigator.onLine;	
	ConnManagerNew.statusInfo.networkConn.online_Current = modeOnline;
	ConnManagerNew.update_UI( ConnManagerNew.statusInfo );

	
	// If there is any one online signal, consider it as online stable
	if ( modeOnline && ConnManagerNew.efficiency.networkConnOnline_Immediate )
	{
		ConnManagerNew.changeNetworkConnStableStatus( ConnManagerNew.statusInfo, modeOnline );
	}
	else
	{
		ConnManagerNew.networkConnTimeOut = setTimeout( ConnManagerNew.changeNetworkConnStableStatus
			, ConnManagerNew.networkConnStableCheckTime
			, ConnManagerNew.statusInfo
			, modeOnline );
	}
};


// CHECK #2 - SERVER AVAILABLE CHECK
ConnManagerNew.checkNSet_ServerAvailable = function( statusInfo, callBack ) 
{
	ConnManagerNew.serverAvailable( statusInfo, function( newAvailable )
	{
		ConnManagerNew.changeServerAvailableIfDiff( newAvailable, statusInfo );

		callBack( newAvailable );
	});	

};


ConnManagerNew.serverAvailable = function( statusInfo, callBack )
{
	try
	{
		if ( statusInfo.networkConn.online_Stable )
		{
			WsCallManager.getDataServerAvailable( function ( success, jsonData ) {

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
		else
		{	
			callBack( false );
		}
		
	}
	catch (err)
	{
		console.log( 'error in ConnManagerNew.serverAvailable ')
		callBack( false );
	}
};

// ===============================================
// ------------------------------------------

// Change Network Connection
ConnManagerNew.changeNetworkConnStableStatus = function( statusInfo, modeOnline, optionStr )
{
	statusInfo.networkConn.online_Stable = modeOnline;

	// Trigger AppMode Change Check
	ConnManagerNew.appModeSwitchRequest( statusInfo );
	// update UI icons to reflect current network change
	ConnManagerNew.update_UI( statusInfo );


	// After network Stable become online (from offline), try the ws work immedicatley..
	if ( statusInfo.networkConn.online_Stable )
	{
		if ( optionStr === 'startUp' || ConnManagerNew.efficiency.wsAvailCheck_Immediate )
		{
			// Below will trigger another 
			ConnManagerNew.checkNSet_ServerAvailable( ConnManagerNew.statusInfo, function() 
			{
				// called again to update UI to new connect settings
				ConnManagerNew.update_UI( ConnManagerNew.statusInfo );
			});
		}	
	}		
};


// Server
ConnManagerNew.changeServerAvailableIfDiff =  function( newAvailable, statusInfo )
{
	// If there was a change in this status, trigger the appModeCheck
	if ( newAvailable !== statusInfo.serverAvailable )
	{
		statusInfo.serverAvailable = newAvailable;

		ConnManagerNew.update_UI( statusInfo );

		ConnManagerNew.appModeSwitchRequest( statusInfo );
	}
};

// ===============================================
// --- App Mode Switch Related --------------------

// TEMP: CHANGED the 'Request' to happen right away without prompt interaction..
ConnManagerNew.appModeSwitchRequest = function( statusInfo ) 
{
	var appModeNew = ConnManagerNew.produceAppMode_FromStatusInfo( statusInfo );

	ConnManagerNew.setAppMode( appModeNew, statusInfo );

	if ( FormUtil.checkLogin() ) ConnManagerNew.refreshUI_networkModeDependencies();

};

ConnManagerNew.setAppMode = function( appModeNew, statusInfo ) 
{
	statusInfo.appMode = appModeNew;
	console.log( 'AppMode Set to: ' + appModeNew );
	console.log( statusInfo );

	// TODO: NEED TO TRIGGER SOME UI (Or others) CHANGES DUE TO AppMode Change
	ConnManagerNew.update_UI( statusInfo );
};

ConnManagerNew.refreshUI_networkModeDependencies = function()
{
	ConnManagerNew._cwsRenderObj.handleAppMode_Switch();
};


ConnManagerNew.produceAppMode_FromStatusInfo = function( statusInfo ) 
{
	return ( statusInfo.networkConn.online_Stable && statusInfo.serverAvailable ) ? ConnManagerNew.ONLINE: ConnManagerNew.OFFLINE;
};


// ===============================================
// --- Prompt App Mode Switch Related --------------------


ConnManagerNew.cancelPrompt_AppModeSwitch = function( appModeNew, statusInfo ) 
{
	//if ( appModeNew === statusInfo.appMode )
	if ( appModeNew !== statusInfo.appMode_PromptedMode )
	ConnManagerNew.hidePrompt_AppSwitch();

};

// Called from other place - event handler click..
ConnManagerNew.acceptPrompt_AppModeSwitch = function( statusInfo )
{
	ConnManagerNew.setAppMode( statusInfo.appMode_PromptedMode, statusInfo );

	ConnManagerNew._cwsRenderObj.handleAppMode_Switch(); //rename function to something like cwsRenderObj.handleAppMode_StartSwitch

	ConnManagerNew.cancelAndHide_promptModeSwitch( statusInfo );
};

// 
ConnManagerNew.rejectPrompt_AppModeSwitch = function()
{
	ConnManagerNew.hidePrompt_AppSwitch();
}

ConnManagerNew.cancelAndHide_promptModeSwitch = function( statusInfo )
{
	statusInfo.appMode_PromptedMode = '';

	ConnManagerNew.hidePrompt_AppSwitch();
}

ConnManagerNew.hidePrompt_AppSwitch = function()
{
	//ConnManagerNew.switchPrompt_reservedMsgID = ConnManagerNew.switchPromptObj.hidePrompt( ConnManagerNew.switchPrompt_reservedMsgID );
	//MsgManager.clearReservedMessage( ConnManagerNew.switchPrompt_reservedMsgID );
}


// ===============================================
// --- Others --------------------



// ===============================================
// --- Event Listeners for Connection Changes ---

ConnManagerNew.createNetworkConnListeners = function()
{
    window.addEventListener( 'online', ConnManagerNew.updateNetworkConnStatus );
	window.addEventListener( 'offline', ConnManagerNew.updateNetworkConnStatus );
};


ConnManagerNew.isAppMode_Online = function()
{
	return ( ConnManagerNew.statusInfo.appMode === ConnManagerNew.ONLINE );
}


// ===============================================
// --- Scheduler related Tasks ---

ConnManagerNew.scheduled_checkNSet_ServerAvailable = function()
{
	console.log( ' ~ running ConnManagerNew.scheduled_checkNSet_ServerAvailable' );
	if ( ! ConnManagerNew.statusInfo.manual_Offline.enabled )
	{
		// Below will trigger another 
		ConnManagerNew.checkNSet_ServerAvailable( ConnManagerNew.statusInfo, function() 
		{
			// called again to update UI to new connect settings
			ConnManagerNew.update_UI( ConnManagerNew.statusInfo );

			//if ( callBack ) callBack( true );
		});
	}
	else
	{
		ConnManagerNew.checkRestoreBlockedManualMode( ConnManagerNew.statusInfo );
		// called again to update UI to new connect settings
		ConnManagerNew.update_UI( ConnManagerNew.statusInfo );
	}

}

ConnManagerNew.checkManualMode_Restore = function()
{
	return ( statusInfo.manual_Offline.enabled && 
		( statusInfo.manual_Offline.retryOption > 0 ) && 
			( new Date ) >= new Date( statusInfo.manual_Offline.retryDateTime ) );
}

ConnManagerNew.checkRestoreBlockedManualMode = function( statusInfo )
{
	if ( statusInfo.manual_Offline.enabled && 
		( statusInfo.manual_Offline.retryOption > 0 ) && 
			( new Date ) >= new Date( statusInfo.manual_Offline.retryDateTime ) )
	{

		ConnManagerNew.serverAvailable( ConnManagerNew.statusInfo, function( available ){

			var prompt =  new AppModeSwitchPrompt( ConnManagerNew );

			if ( available )
			{
				ConnManagerNew.checkNSet_ServerAvailable( ConnManagerNew.statusInfo, function() 
				{
					prompt.showManualSwitch_Dialog( 'Online' );
				})
			}
			else
			{
				if ( ! ConnManagerNew.statusInfo.networkConn.online_Stable )
				{
					prompt.showManualSwitch_NetworkUnavailable_Dialog( true );
				}
				else
				{
					//if ( ! ConnManagerNew.statusInfo.serverAvailable )  << only remaining 'available=false' option is server unavailable
					prompt.showManualSwitch_ServerUnavailable_Dialog();
				}
			}

		});
	}
}


// ===============================================================
// =====================================




// ===============================================
// --- UI section ----

ConnManagerNew.update_UI = function( statusInfo )
{
	// update MODE for PWA - cascade throughout app (rebuild menus + repaint screens where required)
	if ( ! FormUtil.checkLogin() ) ConnManagerNew.update_UI_LoginStatusIcon( statusInfo );
	else
	{
		ConnManagerNew.update_UI_NetworkIcons( statusInfo );
	}

	ConnManagerNew.update_UI_statusDots( statusInfo );
}


ConnManagerNew.update_UI_LoginStatusIcon = function( statusInfo )
{
	// update loginScreen Logo (grayscale = offline): offline indicator before logging in
	//$('#ConnectingWithSara').removeClass( ( ConnManagerNew.isAppMode_Online() ) ? 'logoOffline' : 'logoOnline' );
	//$('#ConnectingWithSara').addClass( ( ConnManagerNew.isAppMode_Online() ) ? 'logoOnline' : 'logoOffline' );
	
    if ( ConnManagerNew.isAppMode_Online() ) {
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
	var networkServerConditionsGood = ConnManagerNew.isAppMode_Online();

	// if all conditions good > show online, else if only networkOnline, show red icon (reserved for server unavailable), else show as offline
	//var imgSrc = ( networkServerConditionsGood ) ? 'images/sharp-cloud_queue-24px.svg': ( ( statusInfo.networkConn.online_Stable ) ? 'images/baseline-cloud_off-24px-unavailable.svg' : 'images/baseline-cloud_off-24px.svg' );
	var imgSrc = ( networkServerConditionsGood ? 'images/cloud_online_nav.svg': 'images/cloud_offline_nav.svg' );

	//$( '#imgNetworkStatus' ).css( 'transform', ( networkServerConditionsGood ) ? '' : 'rotateY(180deg)' );

	// timeout (500) used to create image rotation effect (requires 1s transition on img obj)
	//setTimeout( function() { 
		$( '#imgNetworkStatus' ).attr( 'src', imgSrc );
	//}, 500 );

	$( '#divNetworkStatus' ).css( 'display', 'block' );
};


ConnManagerNew.update_UI_statusDots = function( statusInfo ) 
{	
	var divStatusDot_networkTag = $( '#divStatusDot_network' );
	var divStatusDot_networkStableTag = $( '#divStatusDot_networkStable' );
	var divStatusDot_serverTag = $( '#divStatusDot_server' );

	ConnManagerNew.setStatusCss( divStatusDot_networkTag, statusInfo.networkConn.online_Current );
	ConnManagerNew.setStatusCss( divStatusDot_networkStableTag, statusInfo.networkConn.online_Stable );
	ConnManagerNew.setStatusCss( divStatusDot_serverTag, statusInfo.serverAvailable );
};


ConnManagerNew.setStatusCss = function( tag, isOn ) 
{
	var colorStr = ( isOn ) ? '#F5F5F5' : 'transparent';	//'lightGreen' : 'red'
	tag.css( 'background-color', colorStr );
};
