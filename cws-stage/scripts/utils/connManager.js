// -------------------------------------------
// -- ConnManager Class/Methods

function ConnManager() {}

ConnManager._cwsRenderObj;

ConnManager.network_Online = true; // current network status.. false if offline.  //  'online';
ConnManager.appConnMode_Online = true; // app mode: Online / Offline (current 'recorded' network setting regardless of navigator online, etc)


ConnManager.scheduledTimer_ID = 0;	// IntervalTimer for checking network conditions
ConnManager.scheduledTimer_intvMS = 1000;	// check navigator.isOnline status every X milli sec (changed from 500ms due to excessive processing placed on device)
ConnManager.scheduledTimer_intvActLimit = 5; // act on [changed network status] after X number of repeat observed outcomes
ConnManager.scheduledTimer_intvCounter = 0;
ConnManager.schedulerTestUnderway = 0;


ConnManager.networkOnline_CurrState = false;
ConnManager.networkOnline_PrevState = false; 


ConnManager.dataServer_Online = false; // dataServerAvailable
ConnManager.dataServer_statusCheck_IntvLimit = 30; // 30 = every 30sec 
ConnManager.dataServer_statusCheck_IntvCounter = 0;


ConnManager.connSwitchPrompted = false;  // For asking AppConnMode change only once per mode change
ConnManager.connChangeAskedMode = false;  // For asking AppConnMode change only once per mode change

ConnManager.reservedMsgID; // when prompting to switch networkMode > this is the msgManager cancellation "messageID" to remove prompt under correct circumstances

ConnManager.changeConnModeTo;
ConnManager.changeConnModeStr;

ConnManager.userNetworkMode = false;
ConnManager.userNetworkMode_Online = true;
ConnManager.userNetworkMode_intvCounter = 0;	// 1800000 milliseconds = 30min > only prompt to switch back to actual network conditions again after 30min..
ConnManager.userNetworkModeSwitch_IntvLimit = 3600; //3600 = 60 * 60sec = 1h (@ 1sec interval checks)

ConnManager.userNetworkMode_dtmSet;
ConnManager.userNetworkMode_dtmPrompt;

ConnManager.debugMode = WsApiManager.isDebugMode;

ConnManager.connection; //v1.3
ConnManager.type;		//v1.3
ConnManager.roundConnectionTestToMins = 5;
ConnManager.lastConnectTypeObs;

// TODO:ConnManager.networkMode_Switch_Prompt
//		- Need to summarize and put into a document about the current logic
//

// ----------------------------------
// ---  --

ConnManager.initialize = function() 
{

    if ( ConnManager.scheduledTimer_ID > 0 )
    {
        clearInterval(  ConnManager.scheduledTimer_ID );
    }

    ConnManager.scheduledTimer_intvCounter = ConnManager.scheduledTimer_intvActLimit;
    ConnManager.dataServer_statusCheck_IntvCounter = ConnManager.dataServer_statusCheck_IntvLimit;

	ConnManager.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
	ConnManager.type = ConnManager.connection.effectiveType;

	ConnManager.connection.addEventListener( 'change', ConnManager.updateConnectionStatus );

	ConnManager.createScheduledConnTests();

	ConnManager.incrementNetworkConnectionMonitor( ConnManager.type, ConnManager.connection.effectiveType );

}

ConnManager.updateConnectionStatus = function () 
{

	ConnManager.connection = ( navigator.onLine ? ( navigator.connection || navigator.mozConnection || navigator.webkitConnection ) : { effectiveType: 'offline' } );

	console.log( "Connection type changed from " + ConnManager.type + " to " + ConnManager.connection.effectiveType + " (online:" + navigator.onLine + ")" );

	//ConnManager.incrementNetworkConnectionMonitor( ConnManager.type, ConnManager.connection.effectiveType );

	ConnManager.type = ConnManager.connection.effectiveType; //( navigator.onLine ? ConnManager.connection.effectiveType : 'offline' );

  }

ConnManager.isOffline = function() 
{
	return !ConnManager.network_Online; 
};

ConnManager.isOnline = function() 
{
	return ConnManager.network_Online;
}

ConnManager.connStatusStr = function( bOnline ) 
{
	return (bOnline) ? 'Online': 'Offline';
}

// ----------------------------------
// --- App Connection Mode ----------

ConnManager.getAppConnMode_Online = function() 
{
	return ConnManager.appConnMode_Online;
}

ConnManager.getAppConnMode_Offline = function() 
{
	return !ConnManager.appConnMode_Online;
}

ConnManager.setAppConnMode = function( bOnline ) 
{
	ConnManager.appConnMode_Online = ( bOnline != undefined ? bOnline : false);
	ConnManager.networkOnline_CurrState = ConnManager.appConnMode_Online;
	ConnManager.networkOnline_PrevState = ConnManager.appConnMode_Online;
	ConnManager.connSwitchPrompted = false;
}

// ----------------------------------
// --- Mode Detection and Switch ----

ConnManager.runScheduledConnTest = function( returnFunc )
{
	ConnManager.schedulerTestUnderway = 1;

	var networkStateChanged = ( ConnManager.network_Online != ConnManager.networkOnline_PrevState );
	var retJson = { 'networkOnline': ConnManager.network_Online, 
					'dataServerOnline': ConnManager.dataServer_Online, 
					'networkStateChanged': networkStateChanged, 
					'serverStateChanged': false, 
					'promptSwitchNetworkMode': false, 
					'promptSwitchUserNetworkMode': false };

	if ( ConnManager.userNetworkMode ) 
	{
		ConnManager.userNetworkMode_intvCounter += 1;

		if ( ConnManager.userNetworkMode_intvCounter > ConnManager.userNetworkModeSwitch_IntvLimit  )
		{
			if ( retJson.networkOnline == retJson.dataServerOnline ) 
			{
				retJson.promptSwitchUserNetworkMode = true;

				ConnManager.userNetworkMode_intvCounter = 0;
			}
		}

		ConnManager.schedulerTestUnderway = 0;

		if ( returnFunc ) returnFunc( retJson );

	}
	else
	{
		if ( networkStateChanged || ( ConnManager.network_Online != ConnManager.dataServer_Online ) )
		{
			ConnManager.scheduledTimer_intvCounter += 1;

			if ( ConnManager.scheduledTimer_intvCounter >= ConnManager.scheduledTimer_intvActLimit  )
			{

				ConnManager.scheduledTimer_intvCounter = 0;

				if ( ConnManager.network_Online )
				{

					FormUtil.getDataServerAvailable( function( success, jsonData ) 
					{

						if ( success && jsonData && jsonData.available != undefined )
						{
							ConnManager.dataServer_Online = jsonData.available;
							retJson.promptSwitchNetworkMode = true; //only prompt switch to 'ONLINE' if both network + server = online
						}
						else
						{
							ConnManager.dataServer_Online = false;
						}

						retJson.serverStateChanged = ( retJson.dataServerOnline != ConnManager.dataServer_Online );
						retJson.dataServerOnline = ConnManager.dataServer_Online;

						ConnManager.dataServer_statusCheck_IntvCounter = 0;
						ConnManager.schedulerTestUnderway = 0;

						//DataManager.estimateStorageUse();
						ConnManager.incrementNetworkConnectionMonitor( ConnManager.type, ConnManager.connection.effectiveType );

						if ( returnFunc ) returnFunc( retJson );

					});
				}
				else
				{
					ConnManager.dataServer_Online = false;

					retJson.serverStateChanged = ( retJson.dataServerOnline != ConnManager.dataServer_Online );
					retJson.dataServerOnline = false;
					retJson.promptSwitchNetworkMode = true;

					ConnManager.dataServer_statusCheck_IntvCounter = 0; //no need to check server status if network offline
					ConnManager.schedulerTestUnderway = 0;

					ConnManager.incrementNetworkConnectionMonitor( ConnManager.type, ConnManager.connection.effectiveType );

					if ( returnFunc ) returnFunc( retJson );
				}
			}
			else
			{
				ConnManager.schedulerTestUnderway = 0;

				if ( returnFunc ) returnFunc( retJson );
			}
		}
		else
		{

			ConnManager.dataServer_statusCheck_IntvCounter += 1;

			if ( ConnManager.scheduledTimer_intvCounter >= ConnManager.scheduledTimer_intvActLimit )
			{
				ConnManager.scheduledTimer_intvCounter = 0;
			}

			// TEST #2: check dataServer (available) Status CHANGED (prompt required?) > prompt same switch status as above (network mode)
			if ( ConnManager.dataServer_statusCheck_IntvCounter >= ConnManager.dataServer_statusCheck_IntvLimit )
			{
				if ( ConnManager.networkOnline_CurrState )
				{

					FormUtil.getDataServerAvailable( function( success, jsonData ) 
					{
						if ( success && jsonData && jsonData.available != undefined )
						{
							ConnManager.dataServer_Online = jsonData.available;
						}
						else
						{
							ConnManager.dataServer_Online = false;
						}

						retJson.serverStateChanged = ( retJson.dataServerOnline != ConnManager.dataServer_Online );
						retJson.dataServerOnline = ConnManager.dataServer_Online;

						ConnManager.dataServer_statusCheck_IntvCounter = 0;
						ConnManager.schedulerTestUnderway = 0;

						//DataManager.estimateStorageUse();
						ConnManager.incrementNetworkConnectionMonitor( ConnManager.type, ConnManager.connection.effectiveType );

						if ( returnFunc ) returnFunc( retJson );
					});
				}
				else
				{
					ConnManager.dataServer_Online = false;

					retJson.serverStateChanged = ( retJson.dataServerOnline != ConnManager.dataServer_Online );
					retJson.dataServerOnline = false;

					ConnManager.dataServer_statusCheck_IntvCounter = 0;
					ConnManager.schedulerTestUnderway = 0;

					ConnManager.incrementNetworkConnectionMonitor( ConnManager.type, ConnManager.connection.effectiveType );

					if ( returnFunc ) returnFunc( retJson );
				}

			}
			else
			{

				if ( ConnManager.userNetworkMode_intvCounter > ConnManager.userNetworkModeSwitch_IntvLimit  )
				{
					if ( retJson.networkOnline == retJson.dataServerOnline ) retJson.promptSwitchUserNetworkMode = true;
				}

				ConnManager.schedulerTestUnderway = 0;

				if ( returnFunc ) returnFunc( retJson );
			}

		}


	}

}

ConnManager.networkSyncConditions = function()
{
	return ( ConnManager.network_Online && ConnManager.dataServer_Online );
}

ConnManager.dataServerOnline = function()
{
	return ConnManager.dataServer_Online;
}

ConnManager.createScheduledConnTests = function() 
{
	// In the beginning, match it as current status.
	ConnManager.networkOnline_CurrState = ConnManager.network_Online;
    ConnManager.networkOnline_PrevState = ConnManager.network_Online;

	ConnManager.scheduledTimer_ID = setInterval( function() 
	{

		if ( ConnManager.schedulerTestUnderway == 0 )
		{

			ConnManager.runScheduledConnTest( function( jsonData ) {

				ConnManager.setScreen_NetworkIcons( jsonData.networkOnline, jsonData.dataServerOnline );

				if ( ( jsonData.promptSwitchNetworkMode && ! ConnManager.connSwitchPrompted && ! ConnManager.userNetworkMode ) || jsonData.promptSwitchUserNetworkMode )
				{
					ConnManager.connChangeAskedMode = jsonData.networkOnline;
					ConnManager.change_AppConnModePrompt( "interval", jsonData.networkOnline, jsonData.promptSwitchUserNetworkMode );
				}
				else
				{
					if ( ConnManager.connSwitchPrompted && ( jsonData.networkOnline != ConnManager.connChangeAskedMode ) && ( jsonData.networkOnline == jsonData.dataServerOnline ) && ConnManager.reservedMsgID )
					{
						MsgManager.clearReservedMessage( ConnManager.reservedMsgID );
						ConnManager.reservedMsgID = undefined;
						ConnManager.networkOnline_PrevState = ConnManager.networkOnline_CurrState;
						ConnManager.connSwitchPrompted = false;
					}
				}

			});
		}

		// ---- End of Interval -----

	}, ConnManager.scheduledTimer_intvMS );

}


ConnManager.change_AppConnModePrompt = function( modeStr, requestConnMode, toggleUserNetworkMode )
{
	var changeConnModeTo = false;
	var questionStr = "Unknown Mode";

	ConnManager.changeConnModeStr = modeStr;
	ConnManager.userNetworkMode_dtmPrompt = (new Date() ).toISOString();

	if ( FormUtil.checkLogin() )
	{
		if ( modeStr === "interval" ) 
		{
			if ( requestConnMode !== undefined )
			{
				ConnManager.changeConnModeTo = requestConnMode;
				changeConnModeTo = requestConnMode;
			}

			var changeConnStr = ConnManager.connStatusStr( changeConnModeTo );

			questionStr = "Network changed: switch to '" + changeConnStr.toUpperCase() + "' mode?";

		}
		else if ( modeStr === "switch" ) 
		{
			var currConnStat = ConnManager.appConnMode_Online;

			changeConnModeTo = !currConnStat;
			ConnManager.changeConnModeTo = !currConnStat;

			var changeConnStr = ConnManager.connStatusStr( changeConnModeTo );

			questionStr = "Network mode: switch to '" + changeConnStr + "'?";

		}

		var btnSwitch = $( '<a term="" class="notifBtn" toggleUserNetworkMode="' + ( toggleUserNetworkMode != undefined && toggleUserNetworkMode ) + '">SWITCH</a>' );

		$( btnSwitch ).click( function(){

			ConnManager.reservedMsgID = undefined;
			ConnManager.switchPreDeterminedConnMode();

			if ( $( this ).attr( 'toggleUserNetworkMode' ) == 'true' )
			{
				ConnManager.userNetworkMode = ( ConnManager.userNetworkMode ? false : true );

				if ( ConnManager._cwsRenderObj ) 
				{
					if ( ConnManager.userNetworkMode )
					{
						me.navDrawerDivTag.append( '<div id="menu_userNetworkMode" style="padding:10px;font-size:11px;color:#A0A0A1;"><span term="">mode</span>: ' + ConnManager.connStatusStr( ConnManager.getAppConnMode_Online() ) + '</div>' );
					}
					else
					{
						$( '#menu_userNetworkMode' ).remove();
					}
				}
			}

		});

		ConnManager.reservedMsgID = modeStr.toUpperCase() + '_' + changeConnStr.toUpperCase();

		MsgManager.notificationMessage( questionStr, 'notificationDark', btnSwitch,'', 'right', 'top', 20000, true, ConnManager.cancelSwitchPrompt, ConnManager.reservedMsgID );

		ConnManager.connSwitchPrompted = true;
		ConnManager.connChangeAskedMode = ConnManager.changeConnModeTo;
		ConnManager.userNetworkMode_dtmPrompt = (new Date() ).toISOString();
	}

};

ConnManager.switchPreDeterminedConnMode = function()
{
	if ( FormUtil.checkLogin() )
	{

		// Switch the mode to ...
		ConnManager.setAppConnMode( ConnManager.changeConnModeTo );

		// This is not being called..
		if ( ConnManager._cwsRenderObj ) 
		{
			ConnManager._cwsRenderObj.startBlockExecuteAgain();
		}

		if ( ConnManager.changeConnModeStr === "interval" ) 
		{
			ConnManager.scheduledTimer_intvCounter = 0;
		}
		else if ( ConnManager.changeConnModeStr === "switch" ) 
		{
			
		}

		ConnManager.changeConnModeStr = '';
		ConnManager.connSwitchPrompted = false;

	}
}

ConnManager.cancelSwitchPrompt = function()
{
	if ( ConnManager.userNetworkMode ) 
	{
		ConnManager.setUserNetworkMode ( true );
	}

	ConnManager.changeConnModeStr = '';
	ConnManager.connSwitchPrompted = false;
	ConnManager.scheduledTimer_intvCounter = 0;
}


ConnManager.setScreen_NetworkIcons = function( bOnline, bDataServerOnline ) 
{
  	var imgSrc = ( bOnline && bDataServerOnline ) ? 'images/sharp-cloud_queue-24px.svg': ( ( bOnline ) ? 'images/baseline-cloud_off-24px-unavailable.svg' : 'images/baseline-cloud_off-24px.svg' );

	$( '#imgNetworkStatus' ).css( 'transform', ( bOnline && bDataServerOnline ) ? '' : 'rotateY(180deg)' );

	setTimeout( function() { // timeout (500) used to create image rotation effect (requires 1s transition on img obj)
		$( '#imgNetworkStatus' ).attr( 'src', imgSrc );
	}, 500 );

	$( '#divNetworkStatus' ).css( 'display', 'block' );

}

ConnManager.setUserNetworkMode = function( requestConnMode )
{
	ConnManager.userNetworkMode_dtmSet = (new Date() ).toISOString();
	ConnManager.userNetworkMode_dtmPrompt = (new Date() ).toISOString();
	ConnManager.userNetworkMode_Online = requestConnMode;
}




/* / * / * / * / * / * / * / * / * / * / * / *  * \ * \ * \ * \ * \ * \ * \ * \ * \ * \ * \ * \
/*      DCD Config       * /
/ * / * / * / * / * / * / * / * / * / * / * / *  * \ * \ * \ * \ * \ * \ * \ * \ * \ * \ * \ * \*/

ConnManager.getDcdConfigVersion = function( returnFunc )
{
	if ( localStorage.getItem('session') !== null && FormUtil.checkLogin() )
	{
		var loadingTag = undefined;
		var userName = FormUtil.login_UserName;
		var userPin = FormUtil.login_Password;

		FormUtil.submitLogin( userName, userPin, loadingTag, function( success, loginData ) 
		{
			if ( success )
			{
				if ( returnFunc ) returnFunc( loginData.dcdConfig.version );
				else return success;
			}
			else
			{
				if ( returnFunc ) returnFunc( undefined );
				else return undefined;
			}
		});
	}

	else return undefined;
}

ConnManager.incrementNetworkConnectionMonitor = function( connChangedFrom, connChangedTo )
{

	if ( FormUtil.checkLogin() )
	{
		var dtmObs = new Date();
		var dtmHr = dtmObs.getHours();
		var bProceed = false;

		if ( ! ConnManager.lastConnectTypeObs )
		{
			bProceed = true;
		}
		else if ( $.format.date( ConnManager.lastConnectTypeObs, "yyyymmddHHmm" ) != $.format.date( dtmObs, "yyyymmddHHmm" ) )
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
					var hrs = ( data.observations[ connChangedTo ][ dtmHr ] ? data.observations[ connChangedTo ][ dtmHr ] : 0 ) + 1;
	
					data.observations[ connChangedTo ][ dtmHr ] = hrs
					data.last = dtmObs.toISOString();
	
					DataManager.saveData( 'networkConnectionObs', data );
	
					ConnManager.lastConnectTypeObs = dtmObs;
	
				}
	
			})
		}

	}

}