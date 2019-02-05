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
ConnManager.dataServer_curr_Online = true;
ConnManager.dataServer_prev_Online = true;
ConnManager.dataServer_timerIntv = 30000;	// milliseconds - each is 30 sec..

ConnManager.connChangeAsked = false;  // For asking AppConnMode change only once per mode change

ConnManager.switch_waitMaxCount = 20;	// After manually switching AppConnMode, let it not botter(ask) for this count..
ConnManager.switchActionStarted = false;
ConnManager.switchBuildUp = 0;

ConnManager._cwsRenderObj;

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

	if ( modeStr === "interval" ) 
	{
		if ( requestConnMode !== undefined ) changeConnModeTo = requestConnMode;
		var changeConnStr = ConnManager.connStatusStr( changeConnModeTo );
	
		questionStr = "Network changed to '" + changeConnStr + "'.  Do  you want to switch App Mode to '" + changeConnStr + "'?";
	}
	else if ( modeStr === "switch" ) 
	{
		var currConnStat = ConnManager.appConnMode_Online;
		var currConnStr = ConnManager.connStatusStr( currConnStat );
	
		changeConnModeTo = !currConnStat;	
		var changeConnStr = ConnManager.connStatusStr( changeConnModeTo );

		questionStr = "App Connection Mode is '" + currConnStr + "'.  Do you want to switch to '" + changeConnStr + "'?";
	}

	var reply = confirm( questionStr );

	if ( reply )
	{
		// Switch the mode to ...
		ConnManager.setAppConnMode( changeConnModeTo );

		// This is not being called..
		if ( ConnManager._cwsRenderObj ) 
		{
			//console.log( 'from reply, this is called.' );
			ConnManager._cwsRenderObj.startBlockExecuteAgain();
		}

		if ( modeStr === "interval" ) ConnManager.IntvCountBuildUp = 0;
		else if ( modeStr === "switch" ) 
		{
			ConnManager.switchActionStarted = true;
			ConnManager.switchBuildUp = 0;
		}
	}	
};

// ----------------------------------
// --- Mode Detection and Switch ----

ConnManager.setUp_dataServerModeDetection = function() {

	setInterval( function() 
	{
		var bNetworkOnline = ConnManager.isOnline();
		
		ConnManager.currIntv_Online = bNetworkOnline;

		var connStateChanged = ( ConnManager.currIntv_Online != ConnManager.prevIntv_Online );

		ConnManager.dataServer_Online = true;
		ConnManager.dataServer_curr_Online = true;
		ConnManager.dataServer_prev_Online = true;

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

	}, ConnManager.dataServer_timerIntv );
}
