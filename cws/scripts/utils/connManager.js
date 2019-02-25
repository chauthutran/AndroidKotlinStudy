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

ConnManager.connChangeAsked = false;  // For asking AppConnMode change only once per mode change

ConnManager.switch_waitMaxCount = 20;	// After manually switching AppConnMode, let it not botter(ask) for this count..
ConnManager.switchActionStarted = false;
ConnManager.switchBuildUp = 0;

ConnManager._cwsRenderObj;
ConnManager.changeConnModeTo;
ConnManager.changeConnModeStr;

// TODO:
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
	ConnManager.setAppConnMode( ConnManager.isOnline() );
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
		var bNetworkOnline = ConnManager.isOnline();
		ConnManager.currIntv_Online = bNetworkOnline;

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
				if ( ConnManager.IntvCountBuildUp == ConnManager.IntvCountCheckPoint )
				{
					// Ask for the appConnMode Change..
					if ( ConnManager.appConnMode_Online != ConnManager.currIntv_Online )
					{
						ConnManager.connChangeAsked = true;
						ConnManager.change_AppConnMode( "interval", ConnManager.currIntv_Online );
					}
				}	
			}
		}

		// ---- End of Interval -----
		ConnManager.prevIntv_Online = bNetworkOnline;

	}, ConnManager.IntvTime );
}


ConnManager.change_AppConnMode = function( modeStr, requestConnMode )
{
	var changeConnModeTo = false;
	var questionStr = "Unknown Mode";

	ConnManager.changeConnModeStr = modeStr;

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
		console.log( 'ConnManager.change_AppConnMode: ' + ConnManager.changeConnModeStr + ', ' + ConnManager.changeConnModeTo )
		var btnSwitch = $( '<a term="" class="notifBtn">SWITCH</a>' );

		$( btnSwitch ).click( () => {
			ConnManager.switchPreDeterminedConnMode();
		});

		MsgManager.notificationMessage( questionStr, 'notificationDark', btnSwitch,'', 'right', 'top', 0 );
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
			//console.log( 'from reply, this is called.' );
			ConnManager._cwsRenderObj.startBlockExecuteAgain();
		}

		if ( ConnManager.changeConnModeStr === "interval" ) ConnManager.IntvCountBuildUp = 0;
		else if ( ConnManager.changeConnModeStr === "switch" ) 
		{
			ConnManager.switchActionStarted = true;
			ConnManager.switchBuildUp = 0;
		}

		console.log( 'switchPreDeterminedConnMode: ' + ConnManager.changeConnModeTo)

		ConnManager.setUp_dataServerModeDetection();

		ConnManager.changeConnModeStr = '';

	}
}

// ----------------------------------
// --- Mode Detection and Switch ----

ConnManager.setUp_dataServerModeDetection = function() 
{
	console.log( 'initiate setUp_dataServerModeDetection' );
	if ( ConnManager.dataServer_timerID )
	{
		clearInterval(  ConnManager.dataServer_timerID );
		ConnManager.dataServer_timerID = 0;
	}

	ConnManager.detectDataServerOnline();

	ConnManager.dataServer_timerID = setInterval( function() 
	{
		console.log( 'timer: ' + ConnManager.dataServer_timerID );
		ConnManager.detectDataServerOnline();

	}, ConnManager.dataServer_timerIntv );
}

ConnManager.detectDataServerOnline = function()
{
	console.log( 'detectDataServerOnline' );
	var bNetworkOnline = ConnManager.isOnline();

	if ( ! bNetworkOnline )
	{
		ConnManager.dataServer_Online = false;
		ConnManager.connStatTagUpdate( ConnManager.network_Online, ConnManager.dataServer_Online );
	}
	else
	{
		FormUtil.getDataServerAvailable( function( success, jsonData ) 
		{			  
			if ( success && jsonData )
			{
				ConnManager.dataServer_Online = jsonData.available;
			}
			else
			{
				ConnManager.dataServer_Online = false;
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
  var imgSrc = ( bOnline && bDataServerOnline ) ? 'images/sharp-cloud_queue-24px.svg': ( ( bDataServerOnline ) ? 'images/baseline-cloud_off-24px.svg' : 'images/baseline-cloud_off-24px-unavailable.svg' );

  $( '#imgNetworkStatus' ).css( 'transform', ( bOnline && bDataServerOnline ) ? '' : 'rotateY(180deg)' );

  setTimeout( function() { // timeout (500) used to create image rotation effect (requires 1s transition on img obj)
	  $( '#imgNetworkStatus' ).attr( 'src', imgSrc );
  }, 500 );

  $( '#divNetworkStatus' ).css( 'display', 'block' );

}