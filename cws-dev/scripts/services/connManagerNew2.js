// -------------------------------------------
// -- ConnManager Class/Methods

// ConnManager() - network status info & server connection status info store..  for quick access of this info.
// 		Other Task Run or Not Check - Fetch doable..  Others. ?

// Scheduling For Interval Checks - 
//			- What kind of things do we do on these interval ones...
//				- Online/Offline (of network)
//				- Data Server availabilty Check
//				- 3G/2G switch check?
//	  - Setup methods that 
//		LVL 1:
//		1. Create method to run network status checks ( online/offline )
//		2. Create method to run server status ( available/not )

//		3. Create method to prompt switch networkMODE 
//		3.1 run change networkMODE (before login)
//		3.2 create method to CANCEL switch networkMODE (conditions are restored)
//		5. Create method to run change networkMODE (before login)
//		6. DO LATER: Create method to monitor + track connectionType changes (history)
//	
//		LVL 2:
//			- Create each task schedule calls - with intervals.
//				- Have flag to start in the beginning of interval or not.


function ConnManagerNew() {};

ConnManagerNew._cwsRenderObj;
ConnManagerNew.pwaApplicationMode; // controls app networkMode (as per dcdConfig area: offline + online)


ConnManagerNew.networkOnline_NewState = navigator.onLine;
ConnManagerNew.networkOnline_PrevState = navigator.onLine;
ConnManagerNew.networkOnline_Changed = false;

ConnManagerNew.serverOnline_NewState = false;
ConnManagerNew.serverOnline_PrevState; 
ConnManagerNew.serverOnline_Changed = false;

ConnManagerNew.switchPrompt_ShowNotification = false;
ConnManagerNew.switchPrompt_ChangeTo = false;
ConnManagerNew.switchPrompt_PrevState = false;
ConnManagerNew.switchPrompt_Underway = false;
ConnManagerNew.switchPrompt_reservedMsgID;

ConnManagerNew.connection;  //v1.3
ConnManagerNew.type;		//v1.3
ConnManagerNew.connType_lastObs;

ConnManagerNew.debugMode = WsApiManager.isDebugMode;


// 1. NETWORK status check
ConnManagerNew.networkStatus_Check = function( callBack )
{
	// runs every 5 seconds
	//ConnManagerNew.networkOnline_Changed = ( ConnManagerNew.networkOnline_NewState != ConnManagerNew.networkOnline_PrevState );
	//ConnManagerNew.networkOnline_Changed = ( ConnManagerNew.networkOnline_NewState != ConnManagerNew.networkOnline_PrevState );
	ConnManagerNew.networkOnline_Changed = ( ConnManagerNew.networkConnect_NewState != ConnManagerNew.pwaApplicationMode );

	ConnManagerNew.update_UI_CheckResults();

	ConnManagerNew.networkOnline_Changed_After();

	if ( callBack ) callBack();
};


// 2. SERVER status check
ConnManagerNew.serverStatus_Check = function ( callBack ) 
{
	// runs every 30 seconds

	try {

		if ( ConnManagerNew.networkOnline_NewState ) // ONLY attempt if networkStatus == online
		{

			FormUtil.getDataServerAvailable( function ( success, jsonData ) {

				ConnManagerNew.processDataServerCheck_Response( success, jsonData, function() {

					ConnManagerNew.update_UI_CheckResults();

					if ( callBack ) callBack();

				} )

			});
		}
		else
		{
			var offLineDefault = { 'available': false };

			ConnManagerNew.processDataServerCheck_Response( true, offLineDefault, function() {

				ConnManagerNew.update_UI_CheckResults();

				if ( callBack ) callBack();

			} )

		}

	}
	catch( err ) 
	{
		console.log( ' ~ error caught during ConnManagerNew.serverStatus_Check() ' + err );
		console.log( ex );
		if ( callBack ) callBack();
	}

};

// 3. CHECK should switchPROMPT be shown
ConnManagerNew.runSwitchNetworkMode_Prompt_Check = function( NotRunRightAway )
{
	// run every 5 seconds
	var switchToState;
	var switchCondition;
	var proceedCheck = false;

	//switchNetworkModePrompt_InitialiseDefaults > sets all existing checked variables to 'new' defaults
	if ( NotRunRightAway != undefined && NotRunRightAway == false )
	{
		ConnManagerNew.switchNetworkModePrompt_InitialiseDefaults();
	}

	// exit if no need to process prompt checks
	proceedCheck = ( ConnManagerNew.networkOnline_Changed || ConnManagerNew.serverOnline_Changed );

	if ( ! proceedCheck ) return;

	// determine reasons for switching networkMODE
	if ( ConnManagerNew.networkOnline_Changed )
	{
		switchCondition = 'network_' + ConnManagerNew.pwaApplicationMode;
		// pwaMode is ONLINE but network is OFFLINE
		if ( ConnManagerNew.pwaApplicationMode && ! ConnManagerNew.networkOnline_NewState )
		{
			switchCondition = 'switch to network OFFLINE (from ONLINE)';
			switchToState = ConnManagerNew.networkOnline_NewState;
			ConnManagerNew.switchPrompt_ShowNotification = FormUtil.checkLogin();
		}
		// pwaMode is OFFLINE but network is ONLINE && server is ONLINE
		if ( ! ConnManagerNew.pwaApplicationMode && ConnManagerNew.networkOnline_NewState && ConnManagerNew.serverOnline_NewState )
		{
			switchCondition = 'switch to network+server ONLINE (from OFFLINE)';
			switchToState = ConnManagerNew.networkOnline_NewState;
			ConnManagerNew.switchPrompt_ShowNotification = FormUtil.checkLogin();
		}
	}
	else if ( ConnManagerNew.serverOnline_Changed )
	{
		switchCondition = 'server_';
		// pwaMode is OFFLINE but server is ONLINE
		if ( ! ConnManagerNew.pwaApplicationMode && ConnManagerNew.serverOnline_NewState )
		{
			switchCondition = 'switch to server ONLINE (from OFFLINE)';
			switchToState = ConnManagerNew.serverOnline_NewState;
			ConnManagerNew.switchPrompt_ShowNotification = FormUtil.checkLogin();
		}
		// pwaMode is ONLINE but server is OFFLINE		
		if ( ConnManagerNew.pwaApplicationMode && ! ConnManagerNew.serverOnline_NewState )
		{
			switchCondition = 'switch to server OFFLINE (from ONLINE)';
			switchToState = ConnManagerNew.serverOnline_NewState;
			ConnManagerNew.switchPrompt_ShowNotification = FormUtil.checkLogin();
		}
	}

	console.log( ConnManagerNew.switchPrompt_ShowNotification, switchToState, switchCondition );

	if ( ConnManagerNew.switchPrompt_ShowNotification && switchToState != undefined && ! ConnManagerNew.switchPrompt_Underway ) 
	{
		var labelSwitchToState = ( switchToState ) ? 'online' : 'offline';

		ConnManagerNew.createNetworkSwitchPrompt( labelSwitchToState, switchToState );
	}
	else
	{
		if ( ConnManagerNew.switchPrompt_Underway )
		{
			ConnManagerNew.cancelSwitchNetwork_Check();
		}
		else
		{
			if ( switchToState != undefined )
			{
				ConnManagerNew.switchPrompt_ChangeTo = switchToState;
				ConnManagerNew.setNetworkConnectionMode();
			}

		}
	}

};

// 4. 
ConnManagerNew.cancelSwitchNetwork_Check = function()
{
	// run every 1 second
	var conditionsRestored = ConnManagerNew.switchConditionsRestored_Check();

	console.log( ' ~ ' + conditionsRestored );

	ConnManagerNew.switchPrompt_ShowNotification = ! ( conditionsRestored > 0 );

	// if conditions restored OR user logs out during switchPrompt
	if ( ( ConnManagerNew.switchPrompt_Underway && ! ConnManagerNew.switchPrompt_ShowNotification ) || ! FormUtil.checkLogin() )
	{
		MsgManager.clearReservedMessage( ConnManagerNew.switchPrompt_reservedMsgID );

		ConnManagerNew.switchPrompt_reservedMsgID = undefined;
		ConnManagerNew.networkOnline_NewState = ConnManagerNew.networkOnline_PrevState;
		ConnManagerNew.switchPrompt_Underway = false;
	}

};



ConnManagerNew.initialize = function( cwsRenderObj )
{
	ConnManagerNew._cwsRenderObj = cwsRenderObj;

	ConnManagerNew.createNetworkConnEventListeners();
	ConnManagerNew.setDefaults();
	ConnManagerNew.update_UI_CheckResults();
};




ConnManagerNew.createNetworkConnEventListeners = function()
{
    window.addEventListener('online', ConnManagerNew.updateNetworkOnlineStatus);
    window.addEventListener('offline', ConnManagerNew.updateNetworkOnlineStatus);
};

ConnManagerNew.updateNetworkOnlineStatus = function( event )
{
	ConnManagerNew.setNetworkStatus( navigator.onLine );
};

ConnManagerNew.setDefaults = function()
{
	ConnManagerNew.updateNetworkOnlineStatus();

};

ConnManagerNew.processDataServerCheck_Response = function( success, jsonData, callBack )
{
	// if check succeeds with valid [jsonData] payload
	if ( success && jsonData && jsonData.available != undefined ) 
	{
		ConnManagerNew.serverOnline_NewState = jsonData.available;
	}
	else 
	{
		ConnManagerNew.serverOnline_NewState = false;
	}

	// only run 1st time class starts
	if ( ConnManagerNew.serverOnline_PrevState == undefined )
	{
		ConnManagerNew.serverOnline_PrevState = ConnManagerNew.serverOnline_NewState;
		console.log( ConnManagerNew.serverOnline_NewState );
	}

	ConnManagerNew.serverOnline_Changed = ( ConnManagerNew.serverOnline_NewState != ConnManagerNew.serverOnline_PrevState );

	if ( ConnManagerNew.pwaApplicationMode == undefined ) ConnManagerNew.pwaApplicationMode = ConnManagerNew.serverOnline_NewState;

	callBack();

};



ConnManagerNew.switchNetworkModePrompt_InitialiseDefaults = function()
{
	//ConnManagerNew.serverOnline_PrevState = ConnManagerNew.serverOnline_NewState;
	//ConnManagerNew.serverOnline_PrevState = ConnManagerNew.serverOnline_NewState;
	//ConnManagerNew.pwaApplicationMode = ConnManagerNew.serverOnline_NewState;
	//console.log( ' ~ ' + ConnManagerNew.serverOnline_NewState );
}


ConnManagerNew.createNetworkSwitchPrompt = function( switchStateText, switchStateOnlineBoolean, togglepwaApplicationMode )
{
	// create popup prompt to switch to current networkMode
	//ConnManagerNew.switchPrompt_PrevState = ConnManagerNew.switchPrompt_ChangeTo
	ConnManagerNew.switchPrompt_ChangeTo = switchStateOnlineBoolean;

	if ( FormUtil.checkLogin() )
	{
		var questionStr = "switch to [" + switchStateText.toUpperCase() + "] "; //"Network changed: switch to '" + changeConnStr.toUpperCase() + "' mode?";
		var btnSwitch = $( '<a term="" class="notifBtn" togglepwaApplicationMode="' + ( togglepwaApplicationMode != undefined && togglepwaApplicationMode ) + '">SWITCH</a>' );

		$( btnSwitch ).click( function(){

			ConnManagerNew.switchPrompt_reservedMsgID = undefined;
			ConnManagerNew.switchToNetworkPromptedMode();

		});

		ConnManagerNew.switchPrompt_reservedMsgID = 'ConnManagerNew_' + switchStateText.toUpperCase();

		MsgManager.notificationMessage( questionStr, 'notificationDark', btnSwitch,'', 'right', 'top', 20000, true, ConnManagerNew.cancelSwitchPrompt, ConnManagerNew.switchPrompt_reservedMsgID );

		ConnManagerNew.switchPrompt_Underway = true;
	}

};

ConnManagerNew.switchToNetworkPromptedMode = function()
{
	if ( FormUtil.checkLogin() )
	{
		// Switch the mode to ...
		ConnManagerNew.setNetworkConnectionMode(); // falls to serverOnline setting as override
		ConnManagerNew._cwsRenderObj.startBlockExecuteAgain();
		ConnManagerNew.switchPrompt_Underway = false;
	}
};


ConnManagerNew.setNetworkConnectionMode = function() 
{
	ConnManagerNew.networkOnline_PrevState = ConnManagerNew.switchPrompt_ChangeTo; //networkOnline_NewState;
	ConnManagerNew.serverOnline_PrevState = ConnManagerNew.serverOnline_NewState; //switchPrompt_ChangeTo; //serverOnline_NewState;
	ConnManagerNew.switchPrompt_PrevState = ConnManagerNew.switchPrompt_ChangeTo;
	ConnManagerNew.serverOnline_NewState = ConnManagerNew.switchPrompt_ChangeTo;

	ConnManagerNew.networkOnline_Changed = false;
	ConnManagerNew.serverOnline_Changed = false;

	ConnManagerNew.pwaApplicationMode = ConnManagerNew.switchPrompt_ChangeTo;

	console.log( 'set network connection mode ~ ' + ConnManagerNew.switchPrompt_ChangeTo );
};


// Check IF SwitchPrompt showing and conditions return to they way they were before completing switch...
ConnManagerNew.switchConditionsRestored_Check = function()
{
	var restored = 0; // used numbers to determine which condition found
	console.log( StatusInfoManager.getCurrentStatusSummary() );
	if ( ConnManagerNew.networkOnline_Changed )
	{
		// switching to OFFLINE BUT switched back to ONLINE (network + server)
		if ( ! ConnManagerNew.switchPrompt_ChangeTo && ConnManagerNew.networkOnline_NewState && ConnManagerNew.serverOnline_NewState )
		{
			restored = 1;
		}

		// switching to ONLINE BUT switched back to OFFLINE (network + server)
		if ( ConnManagerNew.switchPrompt_ChangeTo && ! ConnManagerNew.networkOnline_NewState || ! ConnManagerNew.serverOnline_NewState )
		{
			restored = 2;
		}

	}
	else if ( ConnManagerNew.serverOnline_Changed )
	{
		// switching to OFFLINE BUT switched back to ONLINE (network + server)
		if ( ! ConnManagerNew.switchPrompt_ChangeTo && ConnManagerNew.networkOnline_NewState && ConnManagerNew.serverOnline_NewState )
		{
			restored = 3;
		}

		// switching to ONLINE BUT switched back to OFFLINE (server)
		if ( ConnManagerNew.switchPrompt_ChangeTo && ! ConnManagerNew.serverOnline_NewState )
		{
			restored = 4;
		}

	}

	return restored;

}

ConnManagerNew.networkSyncConditions = function()
{
	return ( ConnManagerNew.networkOnline_NewState && ConnManagerNew.serverOnline_NewState );
};

ConnManagerNew.setNetworkStatus = function( bOnline )
{
	ConnManagerNew.networkOnline_NewState = bOnline;
	console.log( '~ ConnManagerNew.setNetworkStatus-Online: ' + bOnline );
};

ConnManagerNew.networkOnline_Changed_After = function()
{
	if ( ConnManagerNew.networkOnline_Changed )
	{
		// if network OFFLINE > automatically set server OFFLINE too
		// this prevents additional waiting time for switch prompt
		if ( ! ConnManagerNew.networkOnline_NewState )
		{
			ConnManagerNew.serverOnline_NewState = ConnManagerNew.networkOnline_NewState;
			ConnManagerNew.serverStatus_Check();
		}
	}
}

ConnManagerNew.update_UI_CheckResults = function()
{
	var conditionsGood = ( ConnManagerNew.networkOnline_NewState && ConnManagerNew.serverOnline_NewState );
	//console.log( '<***> UI_ConnectionResults >> conditionsGood: ' + conditionsGood + ' netw: ' + ConnManagerNew.networkOnline_NewState + ', serv: ' + ConnManagerNew.serverOnline_NewState );
	ConnManagerNew.update_UI_LoginStatusIcon( conditionsGood );
	ConnManagerNew.update_UI_NetworkIcons( conditionsGood );
};

ConnManagerNew.update_UI_LoginStatusIcon = function( networkServerConditionsGood )
{
	// update loginScreen Logo (grayscale = offline): offline indicator before logging in
    if ( networkServerConditionsGood ) {
		$('#ConnectingWithSara').removeClass('logoOffline');
		$('#ConnectingWithSara').addClass('logoOnline');
	  }
	  else {
		$('#ConnectingWithSara').removeClass('logoOnline');
		$('#ConnectingWithSara').addClass('logoOffline');
	  }
};

ConnManagerNew.update_UI_NetworkIcons = function( networkServerConditionsGood )
{
	// if all conditions good > show online, else if only networkOnline, show red icon (reserved for server unavailable), else show as offline
	var imgSrc = ( networkServerConditionsGood ) ? 'images/sharp-cloud_queue-24px.svg': ( ConnManagerNew.networkOnline_NewState ? 'images/baseline-cloud_off-24px-unavailable.svg' : 'images/baseline-cloud_off-24px.svg' );

	$( '#imgNetworkStatus' ).css( 'transform', networkServerConditionsGood ? '' : 'rotateY(180deg)' );

	// timeout (500) used to create image rotation effect (requires 1s transition on img obj)
	setTimeout( function() { 
		$( '#imgNetworkStatus' ).attr( 'src', imgSrc );
	}, 500 );

	$( '#divNetworkStatus' ).css( 'display', 'block' );
};


// TO BE COMPLETED LATER > Move to it's own class
ConnManagerNew.trackConnectionType = function()
{
	var connTypeChangedTo = ConnManagerNew.connection.effectiveType;

	if ( FormUtil.checkLogin() )
	{
		var dtmObs = new Date();
		var dtmHr = dtmObs.getHours();
		var bProceed = false;

		// Util Method for something like this..  
		if ( ! ConnManagerNew.connType_lastObs )
		{
			bProceed = true;
		}
		else if ( $.format.date( ConnManagerNew.connType_lastObs, "yyyymmddHHmm" ) != $.format.date( dtmObs, "yyyymmddHHmm" ) )
		{
			bProceed = true;
		}


		if ( bProceed )
		{

			DataManager.getData( 'networkConnectionObs', function( dataObs ) {

				var dtmLast = '';
	
				if ( ! dataObs )
				{
					var data = { 'first': dtmObs.toISOString(), 'last': dtmObs.toISOString(), 'observations': { 'slow-2g': {}, '2g': {}, '3g': {}, '4g': {}, 'offline': {} } };
				}
				else
				{
					var data = dataObs;
					dtmLast = $.format.date( new Date( data.last ), "yyyymmddHHmm" )
				}
	
				// block collection of connectivityType data when multiple observations occur in same minute
				if ( dtmLast != $.format.date( dtmObs, "yyyymmddHHmm" ) )
				{
					var hrs = ( data.observations[ connTypeChangedTo ][ dtmHr ] ? data.observations[ connTypeChangedTo ][ dtmHr ] : 0 ) + 1;
	
					data.observations[ connTypeChangedTo ][ dtmHr ] = hrs
					data.last = dtmObs.toISOString();
	
					DataManager.saveData( 'networkConnectionObs', data );
	
					ConnManagerNew.connType_lastObs = dtmObs;
	
				}
	
			})
		}

	}
};

ConnManagerNew.update_ConnectionTypeObservation = function () 
{
	//console.log( ' ~ run ConnManagerNew.update_ConnectionTypeObservation' );
	ConnManagerNew.connection = navigator.onLine ? ( navigator.connection || navigator.mozConnection || navigator.webkitConnection ) : { effectiveType: 'offline' };

	if ( WsApiManager.isDebugMode ) console.log( "Connection type changed from " + ConnManagerNew.type + " to " + ConnManagerNew.connection.effectiveType + " (online:" + navigator.onLine + ")" );

	ConnManagerNew.type = ConnManagerNew.connection.effectiveType; //( navigator.onLine ? ConnManagerNew.connection.effectiveType : 'offline' );
	//console.log( ' ~ RAN ConnManagerNew.update_ConnectionTypeObservation' );
};

ConnManagerNew.initialiseConnectionTypeMonitors = function()
{
	//console.log( ' ~ run ConnManagerNew.initialiseConnectionTypeMonitors' );
	ConnManagerNew.update_ConnectionTypeObservation();

	// monitor connectionType changes (2g/3g/etc)
	ConnManagerNew.connection.addEventListener( 'change', ConnManagerNew.update_ConnectionTypeObservation );
	//console.log( ' ~ RAN ConnManagerNew.initialiseConnectionTypeMonitors' );
};

/*


*/

// Calling it on method from 'statusInfoManager.js' instead.
/*
// TODO: MOVE: Create statusInfoSummary class to get all status data at once?
ConnManagerNew.getCurrentStatusSummary = function()
{
	// TODO: Need to change 'ConnManager' to ..?.
	var connSummary = {
		'networkOnline': ConnManagerNew.network_Online,
		'dataServerOnline': ConnManagerNew.dataServer_Online,
		'serverStateChanged': ConnManagerNew.serverStateChanged,
		'promptSwitchNetworkMode': ConnManagerNew.network_Online,
		'promptSwitchpwaApplicationMode': ConnManagerNew.promptSwitchpwaApplicationMode		
	};

	// create  Server Available changes
	return connSummary;
}
*/