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
		'timeOutRef': undefined, // CallBack timeout reference
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


// =====================================================
// ------ Network Connection Status Check Related -----

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


// Change Network Connection
ConnManagerNew.changeNetworkConnStableStatus = function( statusInfo, modeOnline, optionStr )
{
	// MAIN - Mark the network connection as stable Online/Offline
	statusInfo.networkConn.online_Stable = modeOnline;


	// Trigger AppMode Check
	ConnManagerNew.appModeSwitchRequest( statusInfo );
	// update UI icons to reflect current network change
	// Do not need to anymore since 'Reqeust' is same as Set NOW!!!
	ConnManagerNew.update_UI( statusInfo );


	// If optional flag is to check server available immedicatley, perform it.
	if ( optionStr === 'startUp' || ConnManagerNew.efficiency.wsAvailCheck_Immediate )
	{
		// Below only gets called (has checks inside) if stable online..
		ConnManagerNew.checkNSet_ServerAvailable();
	}	
};


// ====================================================
// ------- Server Available Check Related ------------

// CHECK #2 - SERVER AVAILABLE CHECK
ConnManagerNew.checkNSet_ServerAvailable = function( callBack ) 
{
	if ( ConnManagerNew.statusInfo.networkConn.online_Stable )
	{
		ConnManagerNew.serverAvailable( function( bServerAvailableNew )
		{
			ConnManagerNew.changeServerAvailableIfDiff( bServerAvailableNew, ConnManagerNew.statusInfo );

			if ( callBack ) callBack( bServerAvailableNew );		
		});	
	}
};


ConnManagerNew.serverAvailable = function( callBack )
{
	try
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
	catch (err)
	{
		console.log( 'error in ConnManagerNew.serverAvailable ')
		callBack( false );
	}
};


// Server
ConnManagerNew.changeServerAvailableIfDiff = function( newAvailable, statusInfo )
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

	ConnManagerNew.setAppMode( appModeNew, statusInfo ); //, function( appModeChanged ) 
};


ConnManagerNew.setAppMode = function( appModeNew, statusInfo ) //, callBack ) 
{
	var existingAppMode = statusInfo.appMode;

	// Set appMode
	if ( statusInfo.manual_Offline.enabled ) statusInfo.appMode = ConnManagerNew.OFFLINE;
	else statusInfo.appMode = appModeNew;
	

	// call CallBack Method
	if ( statusInfo.appMode !== existingAppMode )
	{
		ConnManagerNew.update_UI( statusInfo );	
		if ( FormUtil.checkLogin() ) ConnManagerNew._cwsRenderObj.handleAppMode_Switch();	
	}
};


ConnManagerNew.produceAppMode_FromStatusInfo = function( statusInfo ) 
{
	return ( statusInfo.networkConn.online_Stable && statusInfo.serverAvailable ) ? ConnManagerNew.ONLINE: ConnManagerNew.OFFLINE;
};

// ===============================================
// ---- Status Check Related ----------

ConnManagerNew.isAppMode_Online = function()
{
	return ( ConnManagerNew.statusInfo.appMode === ConnManagerNew.ONLINE );
};

ConnManagerNew.isStrONLINE = function( appModeStr )
{
	return ( appModeStr === ConnManagerNew.ONLINE );
};

ConnManagerNew.isStrOFFLINE = function( appModeStr )
{
	return ( appModeStr === ConnManagerNew.OFFLINE );
};


// ===============================================
// --- Others --------------------


// ===============================================
// --- Event Listeners for Connection Changes ---

ConnManagerNew.createNetworkConnListeners = function()
{
    window.addEventListener( 'online', ConnManagerNew.updateNetworkConnStatus );
	window.addEventListener( 'offline', ConnManagerNew.updateNetworkConnStatus );
};

// ===============================================
// --- Manual AppMode Swtich related Tasks ---

// Call this when app starts.
ConnManagerNew.cloudConnStatusClickSetup = function( divNetworkStatusTag )
{
    //$( '#divNetworkStatus' ).click( function()
    divNetworkStatusTag.off( 'click' ).click( function()
    {
        if ( ConnManagerNew.isAppMode_Online() )
        {
			// Show Dialog for Manual Offline - If currently online..
			AppModeSwitchPrompt.showManualSwitch_Dialog( ConnManagerNew.OFFLINE, ConnManagerNew._cwsRenderObj );
        }
        else
        {
			// Show Dialog for Manual Online - only if was manual offline & netowrk available
			var statusInfoRef = ConnManagerNew.statusInfo;

			if ( statusInfoRef.manual_Offline.enabled )
			{
				// NOTE: TODO: Manual Online Failure --> Could have both condition, thus, show combined issue message?
				if ( !statusInfoRef.networkConn.online_Stable )
				{
					AppModeSwitchPrompt.showManualSwitch_NetworkUnavailable_Dialog( ConnManagerNew._cwsRenderObj );
				}
				else if ( !statusInfoRef.serverAvailable )
				{
					AppModeSwitchPrompt.showManualSwitch_ServerUnavailable_Dialog( ConnManagerNew._cwsRenderObj );					
				}
				else
				{
					// Perform Manual Online 
					AppModeSwitchPrompt.showManualSwitch_Dialog( ConnManagerNew.ONLINE, ConnManagerNew._cwsRenderObj );
				}
			}
			else
			{
				// Show no manual offline existing..  
				msgManager.msgAreaShow( 'AppMode is Offline without manual offline setting.' );
			}			
        }
	});
	
};


ConnManagerNew.setManualAppModeSwitch = function( newAppModeStr, callBackTime )
{
	var statusInfoRef = ConnManagerNew.statusInfo;
		
	if ( ConnManagerNew.isStrOFFLINE( newAppModeStr ) )
	{
		// If Manual Offline AppMode Requested, 
		//	1. Set the 'AppMode' to Offline Manually.
		ConnManagerNew.setAppMode( ConnManagerNew.OFFLINE, statusInfoRef );
		statusInfoRef.manual_Offline.enabled = true;


		//  2. Set a Call back in time.. - to remove the manual offline and trigger appMode check..
		statusInfoRef.manual_Offline.timeOutRef = setTimeout( function( statusInfoRef ) {

			statusInfoRef.manual_Offline.enabled = false;
			ConnManagerNew.appModeSwitchRequest( statusInfoRef );
		
		}, callBackTime * 1000, statusInfoRef );
	}
	else
	{
		// If manual timeout exists, clear that timeout, so that it does not fire later.
		if ( statusInfoRef.manual_Offline.timeOutRef ) clearTimeout( statusInfoRef.manual_Offline.timeOutRef );

		// If Manual Online, simply perform the check..
		statusInfoRef.manual_Offline.enabled = false;
		ConnManagerNew.appModeSwitchRequest( statusInfoRef );
	}
};


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
};


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


// ===============================================