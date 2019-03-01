// -------------------------------------------
// -- ConnManager Class/Methods

function ConnManager() {}

ConnManager.network_Online = true; // current network status.. false if offline.  //  'online';
ConnManager.appConnMode_Online = true; // app mode: Online / Offline 
ConnManager.appShellServer_Online = true;

ConnManager.currIntv_Online = true;
ConnManager.prevIntv_Online = true; 
ConnManager.IntvCountBuildUp = 0;
ConnManager.IntvCountCheckPoint = 5;
ConnManager.IntvTime = 500;	// milliseconds - each is .5 sec..

ConnManager.dataServer_Online = true;
ConnManager.dataServer_timerIntv = 30000;	// milliseconds - each is 30 sec..
ConnManager.dataServer_timerID = 0;
ConnManager.dataServerDetect = 0;

ConnManager.connChangeAsked = false;  // For asking AppConnMode change only once per mode change

ConnManager.switch_waitMaxCount = 20;	// After manually switching AppConnMode, let it not botter(ask) for this count..
ConnManager.switchActionStarted = false;
ConnManager.switchBuildUp = 0;

ConnManager._cwsRenderObj;
ConnManager.changeConnModeTo;
ConnManager.changeConnModeStr;

var debugMode = true;

// TODO:ConnManager.switchActionStarted
//		- Need to summarize and put into a document about the current logic
//

// ----------------------------------
// --- Network (Device) Connection --

ConnManager.isOffline = function() {
	//var connStat = $( '#connectionStatus').attr( 'connstat' );
	return !ConnManager.network_Online; // ( connStat !== 'online' );
};

ConnManager.isOnline = function() {
	return ConnManager.network_Online;
}

ConnManager.connStatusStr = function( bOnline ) {
	return (bOnline) ? 'Online': 'Offline';
}

// ----------------------------------
// --- App Connection Mode ----------

ConnManager.getAppConnMode_Online = function() {
	return ConnManager.appConnMode_Online;
}

ConnManager.getAppConnMode_Offline = function() {
	return !ConnManager.appConnMode_Online;
}

ConnManager.setAppConnMode_Initial = function() {

	// 1. 1st status when coming is the starting status
	if ( ConnManager.isOnline() )
	{
		FormMsgManager.appBlock( "Contacting data server" + "..." );

		FormUtil.getDataServerAvailable( function( success, jsonData ) 
		{
			//if ( FormUtil.isAppsPsiServer()) 
			FormMsgManager.appUnblock();

			if ( success && jsonData )
			{
				ConnManager.dataServer_Online = jsonData.available;
			}
			else
			{
				ConnManager.dataServer_Online = false;
			}
			ConnManager.setAppConnMode( ConnManager.dataServer_Online );
			ConnManager.connStatTagUpdate( ConnManager.network_Online, ConnManager.dataServer_Online );
		});
	}
	else
	{
		ConnManager.setAppConnMode( ConnManager.isOnline() );
		ConnManager.connStatTagUpdate( ConnManager.network_Online, ConnManager.dataServer_Online );
	}

}

ConnManager.setAppConnMode = function( bOnline ) {

	ConnManager.appConnMode_Online = bOnline;

	ConnManager.connChangeAsked = false;

	// Top Nav Color Set
	var navBgColor = ( bOnline ) ? '#0D47A1': '#ee6e73';
	$( '#divNav').css( 'background-color', navBgColor );

	// Text set
    var stat = (bOnline) ? 'online': 'offline';
    var displayText = (bOnline) ? '[online mode]': '[offline mode]';
    $( '#appModeConnStatus' ).attr( 'connStat', stat ).text( displayText );	
}

// ----------------------------------
// --- Mode Detection and Switch ----

ConnManager.setUp_AppConnModeDetection = function() {

	// In the beginning, match it as current status.
	ConnManager.currIntv_Online = ConnManager.network_Online;
	ConnManager.prevIntv_Online = ConnManager.network_Online;

	setInterval( function() 
	{
		var bNetworkOnline = ConnManager.isOnline() && ConnManager.dataServer_Online;
		ConnManager.currIntv_Online = bNetworkOnline;

		if ( debugMode ) console.log( 'Interval:setUp_AppConnModeDetection > bNetworkOnline: ' + bNetworkOnline + '('+ConnManager.isOnline()+'), ConnManager.dataServer_Online: ' + ConnManager.dataServer_Online + ', ConnManager.appConnMode_Online: ' + ConnManager.appConnMode_Online + ', ConnManager.connChangeAsked: ' + ConnManager.connChangeAsked);

		var connStateChanged = ( ConnManager.currIntv_Online != ConnManager.prevIntv_Online );

		// Network Connection Changed - continueous counter build up check
		if ( connStateChanged ) ConnManager.IntvCountBuildUp = 0;
		else ConnManager.IntvCountBuildUp++;

		// Switched mode wait - Manual 'AppConnMode' switched after count check..
		if ( ConnManager.switchActionStarted ) 
		{
			ConnManager.switchBuildUp++;
			if ( ConnManager.switchBuildUp >= ConnManager.switch_waitMaxCount ) ConnManager.switchActionStarted = false;
		}

		// If during switched(manual) mode, wait for it..
		if ( !ConnManager.switchActionStarted )
		{
			// If already asked for AppConnMode change, do not ask.
			if ( !ConnManager.connChangeAsked )
			{
				// Check continuous network counter - to the limit/check point.
				if ( ConnManager.IntvCountBuildUp >= ConnManager.IntvCountCheckPoint )
				{
					// Ask for the appConnMode Change..
					if ( ConnManager.appConnMode_Online != ConnManager.currIntv_Online )
					{
						if ( ConnManager.dataServer_timerID )
						{
							clearInterval(  ConnManager.dataServer_timerID );
							ConnManager.dataServer_timerID = 0;
							ConnManager.dataServerDetect = 0;
						}
						//ConnManager.setUp_dataServerModeDetection();
						ConnManager.connChangeAsked = true;
						ConnManager.change_AppConnModePrompt( "interval", ConnManager.currIntv_Online );
					}
					else
					{
						if ( ConnManager.isOnline() && !ConnManager.dataServer_Online )
						{
							ConnManager.setUp_dataServerModeDetection();
						}
					}
					ConnManager.IntvCountBuildUp = 0;
				}	
			}
			else
			{
				/* USER CURRENTLY PROMPTED */
				if ( ConnManager.IntvCountBuildUp == 60 ) //ConnManager.IntvCountBuildUp >= ConnManager.IntvCountCheckPoint && 
				{
					if ( ConnManager.isOnline() && !ConnManager.dataServer_Online && !ConnManager.connChangeAsked )
					{
						ConnManager.connChangeAsked = true;
						ConnManager.change_AppConnModePrompt( "interval", ConnManager.currIntv_Online );
						ConnManager.IntvCountBuildUp = 0;
					}
					else if ( bNetworkOnline != ConnManager.appConnMode_Online && !ConnManager.connChangeAsked )
					{
						//ConnManager.setUp_dataServerModeDetection();
						ConnManager.connChangeAsked = true;
						ConnManager.change_AppConnModePrompt( "interval", ConnManager.currIntv_Online );
						ConnManager.IntvCountBuildUp = 0;
					}

					if ( debugMode ) console.log( 'Interval:setUp_AppConnModeDetection DIFFERENT network MODE vs actual ' + bNetworkOnline + '('+ConnManager.isOnline()+'), ConnManager.dataServer_Online: ' + ConnManager.dataServer_Online + ', ConnManager.appConnMode_Online: ' + ConnManager.appConnMode_Online + ', IntvCountBuildUp: ' + ConnManager.IntvCountBuildUp + ', ConnManager.dataServerDetect: ' + ConnManager.dataServerDetect + ', ConnManager.dataServer_timerID: ' + ConnManager.dataServer_timerID );
				}

			}
		}

		// ---- End of Interval -----
		ConnManager.prevIntv_Online = bNetworkOnline;

	}, ConnManager.IntvTime );
}


ConnManager.change_AppConnModePrompt = function( modeStr, requestConnMode )
{
	var changeConnModeTo = false;
	var questionStr = "Unknown Mode";

	ConnManager.changeConnModeStr = modeStr;

	if ( debugMode ) console.log( 'ConnManager.change_AppConnModePrompt > modeStr: '+modeStr+', requestConnMode:'+requestConnMode);

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

			//questionStr = "Network changed to '" + changeConnStr + "'.  Do  you want to switch App Mode to '" + changeConnStr + "'?";
			questionStr = "Network changed: switch to '" + changeConnStr.toUpperCase() + "' mode?";

		}
		else if ( modeStr === "switch" ) 
		{
			var currConnStat = ConnManager.appConnMode_Online;
			//var currConnStr = ConnManager.connStatusStr( currConnStat );

			changeConnModeTo = !currConnStat;
			ConnManager.changeConnModeTo = !currConnStat;

			var changeConnStr = ConnManager.connStatusStr( changeConnModeTo );

			//questionStr = "App Connection Mode is '" + currConnStr + "'.  Do you want to switch to '" + changeConnStr + "'?";
			questionStr = "Network mode: switch to '" + changeConnStr + "'?";

		}

		if ( debugMode ) console.log( 'ConnManager.change_AppConnModePrompt: ' + ConnManager.changeConnModeStr + ', ' + ConnManager.changeConnModeTo )

		var btnSwitch = $( '<a term="" class="notifBtn">SWITCH</a>' );

		$( btnSwitch ).click( () => {
			ConnManager.switchPreDeterminedConnMode();
		});

		MsgManager.notificationMessage( questionStr, 'notificationDark', btnSwitch,'', 'right', 'top', 20000, true, ConnManager.cancelSwitchPrompt );
		ConnManager.connChangeAsked = true;
	}

};

ConnManager.switchPreDeterminedConnMode = function()
{
	if ( FormUtil.checkLogin() )
	{
		if ( debugMode ) console.log( 'switchPreDeterminedConnMode > switching to [' + ConnManager.changeConnModeTo + ']' );

		// Switch the mode to ...
		ConnManager.setAppConnMode( ConnManager.changeConnModeTo );

		// This is not being called..
		if ( ConnManager._cwsRenderObj ) 
		{
			ConnManager._cwsRenderObj.startBlockExecuteAgain();
		}

		if ( ConnManager.changeConnModeStr === "interval" ) ConnManager.IntvCountBuildUp = 0;
		else if ( ConnManager.changeConnModeStr === "switch" ) 
		{
			ConnManager.switchActionStarted = true;
			ConnManager.switchBuildUp = 0;
		}

		ConnManager.changeConnModeStr = '';
		ConnManager.connChangeAsked = false;

		ConnManager.setUp_dataServerModeDetection();

	}
}

ConnManager.cancelSwitchPrompt = function()
{
	if ( debugMode ) console.log( 'ConnManager.cancelSwitchPrompt > ConnManager.connChangeAsked: ' + ConnManager.connChangeAsked );

	ConnManager.changeConnModeStr = '';
	ConnManager.connChangeAsked = false;
	ConnManager.IntvCountBuildUp = 0;
}

// ----------------------------------
// --- Mode Detection and Switch ----

ConnManager.setUp_dataServerModeDetection = function() 
{
	if ( debugMode ) console.log( 'initiate setUp_dataServerModeDetection > existing timer: ' + ConnManager.dataServer_timerID );

	if ( ConnManager.dataServer_timerID )
	{
		clearInterval(  ConnManager.dataServer_timerID );
		ConnManager.dataServer_timerID = 0;
		ConnManager.dataServerDetect = 0;
	}

	ConnManager.detectDataServerOnline();

	ConnManager.dataServer_timerID = setInterval( function() 
	{
		if ( debugMode ) console.log( '   eval dataServerMode > existing timer: ' + ConnManager.dataServer_timerID );

		ConnManager.detectDataServerOnline();
		ConnManager.dataServerDetect ++;

	}, ConnManager.dataServer_timerIntv );
}

ConnManager.detectDataServerOnline = function( forceDataServerOnline )
{
	if ( debugMode ) console.log( 'detecting DataServerOnline' );

	var bNetworkOnline = ConnManager.isOnline();

	if ( ! bNetworkOnline  )
	{
		ConnManager.dataServer_Online = false;
		ConnManager.connStatTagUpdate( ConnManager.network_Online, ConnManager.dataServer_Online );

		if ( ConnManager.appConnMode_Online != bNetworkOnline && !ConnManager.connChangeAsked )
		{
			ConnManager.changeConnModeTo = "offline";
			ConnManager.changeConnModeStr = "interval";
			ConnManager.change_AppConnModePrompt( "interval", false );	
		}
	}
	else
	{
		if ( debugMode ) console.log( ' DataServerOnline > checking server status API call + wait' );

		FormUtil.getDataServerAvailable( function( success, jsonData ) 
		{
			if ( debugMode ) console.log( 'DataServerOnline > success:' + success + ' > ' + ConnManager.dataServer_timerID);

			if ( success && jsonData )
			{
				ConnManager.dataServer_Online = jsonData.available;
			}
			else
			{
				ConnManager.dataServer_Online = false;
			}

			var lastServerRequestResults = JSON.parse( JSON.stringify( jsonData ) );

			DataManager.setSessionDataValue( 'dataServerLastRequest', JSON.stringify( lastServerRequestResults ) );

			if ( ConnManager.dataServer_Online )
			{
				DataManager.setSessionDataValue( 'dataServer_lastOnline', (new Date() ).toISOString() );
			}

			if ( debugMode ) 
			{
				console.log( jsonData );
				console.log( 'DataServerOnline > dataServer_Online:' + ConnManager.dataServer_Online + ', ConnManager.network_Online:' + ConnManager.network_Online );
			}

			if ( ConnManager.network_Online != ConnManager.dataServer_Online )
			{
				if ( !ConnManager.dataServer_Online && ConnManager.dataServer_timerID > 0 && !ConnManager.connChangeAsked )
				{
					ConnManager.changeConnModeTo = "offline";
					ConnManager.changeConnModeStr = "interval";
					ConnManager.change_AppConnModePrompt( "interval", false );
				}
				else
				{
					if ( ConnManager.dataServer_Online && !ConnManager.appConnMode_Online && !ConnManager.connChangeAsked )
					{
						ConnManager.changeConnModeTo = "online";
						ConnManager.changeConnModeStr = "interval";
						ConnManager.change_AppConnModePrompt( "interval", true );
					}
				}
			}
			else
			{
				if ( FormUtil.checkLogin() && ConnManager.dataServer_Online && !ConnManager.getAppConnMode_Online() && !ConnManager.connChangeAsked )
				{
					ConnManager.changeConnModeTo = "online";
					ConnManager.changeConnModeStr = "interval";
					ConnManager.change_AppConnModePrompt( "interval", true );
				}
			}

			ConnManager.connStatTagUpdate( ConnManager.network_Online, ConnManager.dataServer_Online );
		});

	}
}

ConnManager.dataServerOnline = function()
{
	return ConnManager.dataServer_Online;
}

ConnManager.networkSyncConditions = function()
{
	return (ConnManager.isOnline() && ConnManager.dataServer_Online);
}

ConnManager.connStatTagUpdate = function( bOnline, bDataServerOnline ) 
{
  var imgSrc = ( bOnline && bDataServerOnline ) ? 'images/sharp-cloud_queue-24px.svg': ( ( bOnline ) ? 'images/baseline-cloud_off-24px-unavailable.svg' : 'images/baseline-cloud_off-24px.svg' );

  $( '#imgNetworkStatus' ).css( 'transform', ( bOnline && bDataServerOnline ) ? '' : 'rotateY(180deg)' );

  setTimeout( function() { // timeout (500) used to create image rotation effect (requires 1s transition on img obj)
	  $( '#imgNetworkStatus' ).attr( 'src', imgSrc );
  }, 500 );

  $( '#divNetworkStatus' ).css( 'display', 'block' );

}