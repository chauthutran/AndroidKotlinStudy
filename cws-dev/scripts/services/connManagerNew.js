// -------------------------------------------
// -- ConnManager Class/Methods

// ConnManager() - network status info & server connection status info store..  for quick access of this info.
// 		Other Task Run or Not Check - Fetch doable..  Others. ?

// Maybe new class:
// BackgroundTask();
// Scheduling For Interval Checks - 
//			- What kind of things do we do on these interval ones...
//				- Online/Offline (of network)
//				- Data Server availabilty Check
//				- 3G/2G switch check?

// ------------------------  [Ideally]
//  Run();
//		--> CheckNetworkStatus(Online/Offline)()
//		--> CheckDataServerAvailabiility()		(DataServerAvailability.-------)
//		--> NetworkSpeedType (3G/2G) Check()    (NetworkType.------)
//				--> StoreData()
// -------------------------

// Maybe new class:
// NetworkType();  <-- Has all the methods related to 3G/2G etc..


function ConnManagerNew() {};

ConnManagerNew._cwsRenderObj;
//ConnManagerNew.networkOnline = false; 


ConnManagerNew.networkOnline_CurrState = false;
ConnManagerNew.networkOnline_PrevState = false;
ConnManagerNew.networkOnline_StateChanged = false;


ConnManagerNew.serverOnline_StatusCheck_ID; // timeout id (timer created then removed ... repeat)
ConnManagerNew.serverOnline_CurrState = false;
ConnManagerNew.serverOnline_PrevState = false; 
ConnManagerNew.serverOnline_StateChanged = false;

ConnManagerNew.switchPrompt_CurrState;
ConnManagerNew.switchPrompt_PrevState;
ConnManagerNew.switchPrompt_Underway = false;
ConnManagerNew.switchPrompt_reservedMsgID;

ConnManagerNew.connection;  //v1.3
ConnManagerNew.type;		//v1.3
ConnManagerNew.connType_lastObs;

ConnManagerNew.debugMode = WsApiManager.isDebugMode;


ConnManagerNew.initialize = function()
{
	ConnManagerNew.setDefaults();

	// start up > run network status Online/Offline check
	ConnManagerNew.networkStatus_Check( function(){

		//console.log( ' ~ startup >> networkStatus ');

		ConnManagerNew.initialiseConnectionTypeMonitors();

		// start up > run server status Online/Offline check
		ConnManagerNew.serverStatus_Check( function(){ 

			console.log( '>>> network: ' + ConnManagerNew.networkOnline_CurrState + ', server: ' + ConnManagerNew.serverOnline_CurrState );

			// first paint of UI layout with connection "results"
			ConnManagerNew.update_UI_CheckResults();

			// create scheduler events
			ScheduleManager.initialize_ConnectionManagerChecks();

		});

	});

}

ConnManagerNew.setDefaults = function()
{
	ConnManagerNew.serverOnline_CurrState = navigator.onLine;
	ConnManagerNew.networkOnline_PrevState = navigator.onLine;
}

ConnManagerNew.networkStatus_Check = function( callBack )
{

	// run every 5 seconds
	ConnManagerNew.networkOnline_StateChanged = ( ConnManagerNew.networkOnline_CurrState != ConnManager.networkOnline_PrevState );

	if ( ConnManagerNew.networkOnline_StateChanged ) //&& ConnManagerNew.networkOnline_CurrState != ConnManagerNew.serverOnline_CurrState )
	{
		if ( ! ConnManagerNew.networkOnline_CurrState )
		{
			ConnManagerNew.serverOnline_CurrState = ConnManagerNew.networkOnline_CurrState;
		}

		ConnManagerNew.update_UI_CheckResults();
	}

	// remove timer interval to check SERVER-ONLINE if networkMode = offline
	if ( ! ConnManagerNew.networkOnline_CurrState )
	{
		ConnManagerNew.clearExistingTimeout( ConnManagerNew.serverOnline_StatusCheck_ID );
	}
	else
	{
		if ( ConnManagerNew.serverOnline_StatusCheck_ID == 0 ) ScheduleManager.schedule_serverStatus_Check();
	}

	ConnManager.networkOnline_PrevState = ConnManagerNew.networkOnline_CurrState;

	console.log( ' ~ network statusCheck >> ' + ConnManagerNew.networkOnline_CurrState );
	console.log( ' ~ network networkOnline_StateChanged >> ' + ConnManagerNew.networkOnline_StateChanged );

	if ( callBack ) callBack();


};

ConnManagerNew.serverStatus_Check = function ( callBack ) 
{
	// run every 30 seconds

	// initialise defaults for new server check
	ConnManagerNew.serverOnline_StateChanged = false;

	try {

		if ( ConnManagerNew.networkOnline_CurrState ) // ONLY if networkStatus == online
		{
			console.log( '~checkSERVERstatus')
			// clear last schedule for repeating data server check (in case of slow DWS reponse causes a 2nd serverCheck before 1st one completes)
			ConnManagerNew.clearExistingTimeout( ConnManagerNew.serverOnline_StatusCheck_ID );

			FormUtil.getDataServerAvailable( function ( success, jsonData ) {

				ConnManagerNew.processDataServerCheck_Response( success, jsonData, function() {

					// callBack only included on startup/initialise
					if ( callBack == undefined )
					{
						//console.log( ' ~ dataServerAvailable > stateChanged: ' + ConnManagerNew.serverOnline_StateChanged );
						if ( ConnManagerNew.serverOnline_StateChanged )
						{
							var labelSwitchToState = ( ConnManagerNew.serverOnline_CurrState ) ? 'online' : 'offline';
							ConnManagerNew.createNetworkSwitchPrompt( labelSwitchToState, ConnManagerNew.serverOnline_CurrState );
						}
					}
					
					ScheduleManager.schedule_serverStatus_Check(); //recreate timer 

					if ( callBack ) callBack();

				} )

			});
		}

	}
	catch( err ) 
	{
		console.log( ' ~ error caught during ConnManagerNew.serverStatus_Check() ' + err );
		console.log( ex );
		if ( callBack ) callBack();
	}

};

ConnManagerNew.clearExistingTimeout = function( timerID )
{
	if ( timerID ) 
	{
		clearTimeout( timerID );
		timerID = 0;
	}
}

ConnManagerNew.processDataServerCheck_Response = function( success, jsonData, callBack )
{
	// if check succeeds with valid [jsonData] payload
	if ( success && jsonData && jsonData.available != undefined ) 
	{
		ConnManagerNew.serverOnline_CurrState = jsonData.available;
	}
	else 
	{
		ConnManagerNew.serverOnline_CurrState = false;
	}

	ConnManagerNew.serverOnline_StateChanged = ( ConnManagerNew.serverOnline_CurrState != ConnManagerNew.serverOnline_PrevState );

	callBack();

}

ConnManagerNew.createNetworkSwitchPrompt = function( switchStateText, switchStateOnlineBoolean, toggleUserNetworkMode )
{
	// create popup prompt to switch away from current networkMode
	// referenced from ConnManager.change_AppConnModePrompt();

	ConnManagerNew.switchPrompt_CurrState = switchStateOnlineBoolean;
	ConnManagerNew.userNetworkMode_dtmPrompt = (new Date() ).toISOString();

	if ( FormUtil.checkLogin() )
	{
		var questionStr = "Switching network mode [" + switchStateText.toUpperCase() + "]?";
		var btnSwitch = $( '<a term="" class="notifBtn" toggleUserNetworkMode="' + ( toggleUserNetworkMode != undefined && toggleUserNetworkMode ) + '">SWITCH</a>' );

		$( btnSwitch ).click( function(){

			ConnManagerNew.switchPrompt_reservedMsgID = undefined;
			ConnManagerNew.switchToNetworkPromptedMode();

		});

		ConnManagerNew.switchPrompt_reservedMsgID = 'ConnManagerNew_' + switchStateText.toUpperCase();

		MsgManager.notificationMessage( questionStr, 'notificationDark', btnSwitch,'', 'right', 'top', 20000, true, ConnManagerNew.cancelSwitchPrompt, ConnManagerNew.switchPrompt_reservedMsgID );

		ConnManagerNew.switchPrompt_Underway = true;
	}

}

ConnManagerNew.switchToNetworkPromptedMode = function()
{
	if ( FormUtil.checkLogin() )
	{

		// Switch the mode to ...
		ConnManager.setNetworkConnectionMode( ConnManagerNew.networkOnline_CurrState );

		// This is not being called..
		if ( ConnManagerNew._cwsRenderObj ) 
		{
			ConnManagerNew._cwsRenderObj.startBlockExecuteAgain();
		}

		ConnManager.switchPrompt_Underway = false;

	}
}


ConnManagerNew.setNetworkConnectionMode = function( bOnline ) 
{
	ConnManagerNew.networkOnline_CurrState = bOnline;
	ConnManagerNew.networkOnline_PrevState = bOnline;
	ConnManagerNew.switchPrompt_Underway = false;
}

ConnManagerNew.switchNetworkModePrompt_Check = function()
{
	// run every 5 seconds

	// if prompt already underway, cancel
	if ( ! ConnManagerNew.switchPrompt_Underway )
	{
		// ONLY if logged prompt to switch user mode || if stateChange detected
		if ( FormUtil.checkLogin() && ( ConnManagerNew.networkOnline_StateChanged || ConnManagerNew.serverOnline_StateChanged ) )
		{
			var labelSwitchToState = ( ConnManagerNew.networkOnline_CurrState ) ? 'online' : 'offline';
			ConnManagerNew.createNetworkSwitchPrompt( labelSwitchToState, ConnManagerNew.networkOnline_CurrState );
		}

	}
}

ConnManagerNew.promptSwitchNetworkCancelCheck = function()
{
	// run every 1 second
	if ( ConnManagerNew.switchPrompt_Underway )
	{

	}

}

ConnManagerNew.networkSyncConditions = function()
{
	return ( ConnManagerNew.networkOnline_CurrState && ConnManagerNew.serverOnline_CurrState );
}

ConnManagerNew.setNetworkStatus = function( bOnline )
{
	ConnManagerNew.networkOnline_CurrState = bOnline;
	console.log( '~ ConnManagerNew.setNetworkStatus-Online: ' + bOnline );
}

ConnManagerNew.update_UI_CheckResults = function()
{
	var conditionsGood = ( ConnManagerNew.networkOnline_CurrState && ConnManagerNew.serverOnline_CurrState );
	//console.log( '<***> UI_ConnectionResults >> conditionsGood: ' + conditionsGood + ' netw: ' + ConnManagerNew.networkOnline_CurrState + ', serv: ' + ConnManagerNew.serverOnline_CurrState );
	ConnManagerNew.update_UI_LoginStatusIcon( conditionsGood );
	ConnManagerNew.update_UI_NetworkIcons( conditionsGood );
}

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
}

ConnManagerNew.update_UI_NetworkIcons = function( networkServerConditionsGood )
{
	// if all conditions good > show online, else if only networkOnline, show red icon (reserved for server unavailable), else show as offline
	var imgSrc = ( networkServerConditionsGood ) ? 'images/sharp-cloud_queue-24px.svg': ( ConnManagerNew.networkOnline_CurrState ? 'images/baseline-cloud_off-24px-unavailable.svg' : 'images/baseline-cloud_off-24px.svg' );

	$( '#imgNetworkStatus' ).css( 'transform', networkServerConditionsGood ? '' : 'rotateY(180deg)' );

	// timeout (500) used to create image rotation effect (requires 1s transition on img obj)
	setTimeout( function() { 
		$( '#imgNetworkStatus' ).attr( 'src', imgSrc );
	}, 500 );

	$( '#divNetworkStatus' ).css( 'display', 'block' );
}



ConnManagerNew.update_ConnectionTypeObservation = function () 
{
	ConnManagerNew.connection = navigator.onLine ? ( navigator.connection || navigator.mozConnection || navigator.webkitConnection ) : { effectiveType: 'offline' };

	if ( WsApiManager.isDebugMode ) console.log( "Connection type changed from " + ConnManager.type + " to " + ConnManager.connection.effectiveType + " (online:" + navigator.onLine + ")" );

	ConnManagerNew.type = ConnManagerNew.connection.effectiveType; //( navigator.onLine ? ConnManager.connection.effectiveType : 'offline' );
}

ConnManagerNew.initialiseConnectionTypeMonitors = function()
{
	ConnManagerNew.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
	ConnManagerNew.type = ConnManager.connection.effectiveType;

	// monitor connectionType changes (2g/3g/etc)
	ConnManagerNew.connection.addEventListener( 'change', ConnManagerNew.update_ConnectionTypeObservation );

}

/* TO BE COMPLETED LATER */
ConnManagerNew.incrementConnectionTypeMonitor = function()
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
		else if ( $.format.date( ConnManager.connType_lastObs, "yyyymmddHHmm" ) != $.format.date( dtmObs, "yyyymmddHHmm" ) )
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
	
					ConnManager.connType_lastObs = dtmObs;
	
				}
	
			})
		}

	}
}


// Calling it on method from 'statusInfoManager.js' instead.
/*
// TODO: MOVE: Create statusInfoSummary class to get all status data at once?
ConnManagerNew.getCurrentStatusSummary = function()
{
	// TODO: Need to change 'ConnManager' to ..?.
	var connSummary = {
		'networkOnline': ConnManager.network_Online,
		'dataServerOnline': ConnManager.dataServer_Online,
		'serverStateChanged': ConnManager.serverStateChanged,
		'promptSwitchNetworkMode': ConnManager.network_Online,
		'promptSwitchUserNetworkMode': ConnManager.promptSwitchUserNetworkMode		
	};

	// create  Server Available changes
	return connSummary;
}
*/