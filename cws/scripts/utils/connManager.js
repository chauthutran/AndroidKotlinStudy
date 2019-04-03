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
ConnManager.connChangeAskedMode = false;  // For asking AppConnMode change only once per mode change

ConnManager.switch_waitMaxCount = 20;	// After manually switching AppConnMode, let it not botter(ask) for this count..
ConnManager.switchActionStarted = false;
ConnManager.switchBuildUp = 0;

ConnManager._cwsRenderObj;
ConnManager.changeConnModeTo;
ConnManager.changeConnModeStr;

ConnManager.userNetworkMode = false;
ConnManager.userNetworkMode_Online = true;
ConnManager.userNetworkMode_TimerPrompt = 1800000;	// 1800000 milliseconds = 30min > only prompt to switch back to actual network conditions again after 30min..
ConnManager.userNetworkMode_dtmSet;
ConnManager.userNetworkMode_dtmPrompt;
ConnManager.userNetworkMode_TestExempt = false;
ConnManager.userNetworkMode_Override = false;

ConnManager.speedMode = 'normal'; //slow,normal,fast

ConnManager.debugMode = false;

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

ConnManager.setAppConnMode_Initial = function() 
{

	// 1. 1st status when coming is the starting status
	if ( ConnManager.isOnline() )
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

ConnManager.setAppConnMode = function( bOnline ) 
{

	ConnManager.appConnMode_Online = ( bOnline != undefined ? bOnline : false);

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

ConnManager.setUp_AppConnModeDetection = function() 
{

	// In the beginning, match it as current status.
	ConnManager.currIntv_Online = ConnManager.network_Online;
	ConnManager.prevIntv_Online = ConnManager.network_Online;

	setInterval( function() 
	{
		var bNetworkOnline = ConnManager.isOnline() && ConnManager.dataServer_Online;
		ConnManager.currIntv_Online = ( bNetworkOnline != undefined ? bNetworkOnline : false);

		if ( !ConnManager.userNetworkMode )
		{
			if ( ConnManager.debugMode ) console.log( 'Interval:setUp_AppConnModeDetection > bNetworkOnline: ' + bNetworkOnline + '('+ConnManager.isOnline()+'), ConnManager.dataServer_Online: ' + ConnManager.dataServer_Online + ', ConnManager.appConnMode_Online: ' + ConnManager.appConnMode_Online + ', ConnManager.connChangeAsked: ' + ConnManager.connChangeAsked);
		}

		var connStateChanged = ( ConnManager.currIntv_Online != ConnManager.prevIntv_Online );

		if ( !ConnManager.userNetworkMode || ( ConnManager.userNetworkMode && ConnManager.userNetworkMode_TestExempt)  )
		{

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

							if ( ConnManager.debugMode ) console.log( 'skipped exemption test 1: ' + ConnManager.currIntv_Online );
							//ConnManager.connChangeAsked = true;
							ConnManager.connChangeAskedMode = ConnManager.currIntv_Online;
							ConnManager.change_AppConnModePrompt( "interval", ConnManager.currIntv_Online );
						}
						else
						{
							if ( ConnManager.isOnline() && !ConnManager.dataServer_Online )
							{
								if ( ! ConnManager.dataServer_timerID ) ConnManager.setUp_dataServerModeDetection();
							}
						}
						ConnManager.IntvCountBuildUp = 0;
					}	
				}
				else
				{
					/* USER CURRENTLY PROMPTED */
					if ( ConnManager.IntvCountBuildUp == 60 ) // 60 = 30000ms / 500ms ( dataServerTimer / networkOnlineTimer )
					{
						if ( ConnManager.isOnline() && !ConnManager.dataServer_Online && !ConnManager.connChangeAsked )
						{
							if ( ConnManager.debugMode ) console.log( 'skipped exemption test 2' );
							//ConnManager.connChangeAsked = true;
							ConnManager.connChangeAskedMode = ConnManager.currIntv_Online;
							ConnManager.change_AppConnModePrompt( "interval", ConnManager.currIntv_Online );
							ConnManager.IntvCountBuildUp = 0;
						}
						else if ( bNetworkOnline != ConnManager.appConnMode_Online && !ConnManager.connChangeAsked )
						{
							if ( ConnManager.debugMode ) console.log( 'skipped exemption test 3' );
							//ConnManager.connChangeAsked = true;
							ConnManager.connChangeAskedMode = ConnManager.currIntv_Online;
							ConnManager.change_AppConnModePrompt( "interval", ConnManager.currIntv_Online );
							ConnManager.IntvCountBuildUp = 0;
						}

						if ( ConnManager.debugMode ) console.log( 'Interval:setUp_AppConnModeDetection DIFFERENT network MODE vs actual ' + bNetworkOnline + '('+ConnManager.isOnline()+'), ConnManager.dataServer_Online: ' + ConnManager.dataServer_Online + ', ConnManager.appConnMode_Online: ' + ConnManager.appConnMode_Online + ', IntvCountBuildUp: ' + ConnManager.IntvCountBuildUp + ', ConnManager.dataServerDetect: ' + ConnManager.dataServerDetect + ', ConnManager.dataServer_timerID: ' + ConnManager.dataServer_timerID );
					}
					else
					{
						//Cancel an existing prompt to switch network (e.g. if in offline mode, network comes on, a prompt to switch modes will show; before it auto-clicks the network changes back to offline; this next step will cancel the prompt)
						if ( ConnManager.connChangeAsked && ConnManager.currIntv_Online != ConnManager.connChangeAskedMode )
						{
							MsgManager.clearReservedMessage( ConnManager.changeConnModeStr.toUpperCase() + '_' + ConnManager.connStatusStr( ConnManager.connChangeAskedMode ).toUpperCase() );

							ConnManager.IntvCountBuildUp = 0;
							ConnManager.userNetworkMode = false;
							ConnManager.switchActionStarted = false;
							ConnManager.switchBuildUp = 0;
							ConnManager.changeConnModeStr = '';
							ConnManager.connChangeAsked = false;
							ConnManager.userNetworkMode_Override = false;
							ConnManager.userNetworkMode_TestExempt = false;
						}
					}

				}
			}

		}
		else
		{

			if ( (new Date() ) - (new Date( ConnManager.userNetworkMode_dtmPrompt ) ) >= ConnManager.userNetworkMode_TimerPrompt )
			{
				if ( ConnManager.userNetworkMode_Online != bNetworkOnline )	
				{
					ConnManager.userNetworkMode_TestExempt = true;
					//ConnManager.userNetworkMode_dtmPrompt = (new Date() ).toISOString();
				}
				else
				{
					ConnManager.userNetworkMode_TestExempt = false;
				}
			}
			else
			{
				ConnManager.userNetworkMode_TestExempt = false;
			}

			if ( ConnManager.debugMode ) console.log( 'userNetworkMode {' + ConnManager.userNetworkMode_Online + '} > ExemptTEST passed: ' + ConnManager.userNetworkMode_TestExempt + ' (' + bNetworkOnline + ') >> ' + ( ( (new Date() ) - (new Date( ConnManager.userNetworkMode_dtmPrompt ) ) ) >= ConnManager.userNetworkMode_TimerPrompt ) + ' > target: ' + ConnManager.userNetworkMode_TimerPrompt );
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
	ConnManager.userNetworkMode_dtmPrompt = (new Date() ).toISOString();

	//if ( ConnManager.debugMode ) console.log( 'ConnManager.change_AppConnModePrompt > modeStr: '+modeStr+', requestConnMode:'+requestConnMode + ', userNetworkMode_Override:' + ConnManager.userNetworkMode_Override);

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

		if ( ConnManager.debugMode ) console.log( 'ConnManager.change_AppConnModePrompt: ' + ConnManager.changeConnModeStr + ', ' + ConnManager.changeConnModeTo + ', userNetworkMode_TestExempt:' + ConnManager.userNetworkMode_TestExempt );

		var btnSwitch = $( '<a term="" class="notifBtn">SWITCH</a>' );

		$( btnSwitch ).click( () => {
			if ( ConnManager.userNetworkMode_TestExempt )
			{
				ConnManager.userNetworkMode_Override = true;
			}
			ConnManager.switchPreDeterminedConnMode();
		});

		MsgManager.notificationMessage( questionStr, 'notificationDark', btnSwitch,'', 'right', 'top', 20000, true, ConnManager.cancelSwitchPrompt, modeStr.toUpperCase() + '_' + changeConnStr.toUpperCase() );
		if ( ConnManager.debugMode ) console.log( 'created notifPrompt "supposedly" : ' + questionStr );
		ConnManager.connChangeAsked = true;
		ConnManager.connChangeAskedMode = ConnManager.changeConnModeTo;
		ConnManager.userNetworkMode_dtmPrompt = (new Date() ).toISOString();
	}

};

ConnManager.switchPreDeterminedConnMode = function()
{
	if ( FormUtil.checkLogin() )
	{
		if ( ConnManager.debugMode ) console.log( 'switchPreDeterminedConnMode > switching to [' + ConnManager.changeConnModeTo + ']' );

		if ( ConnManager.userNetworkMode )
		{
			//if ( ( ConnManager.network_Online == ConnManager.dataServer_Online ) && ConnManager.userNetworkMode_Online )
			if ( ConnManager.userNetworkMode_Override )
			{
				ConnManager.userNetworkMode = false; //this doesn't need to override any network settings	
			}
		}

		// Switch the mode to ...
		ConnManager.setAppConnMode( ConnManager.changeConnModeTo );

		// This is not being called..
		if ( ConnManager._cwsRenderObj ) 
		{
			if ( ConnManager.debugMode ) console.log( 'ConnManager._cwsRenderObj.startBlockExecuteAgain(): to ' + ConnManager.changeConnModeTo );
			ConnManager._cwsRenderObj.startBlockExecuteAgain();
		}

		if ( ConnManager.changeConnModeStr === "interval" ) 
		{
			ConnManager.IntvCountBuildUp = 0;
			ConnManager.userNetworkMode = false;
		}
		else if ( ConnManager.changeConnModeStr === "switch" ) 
		{
			ConnManager.switchActionStarted = true;
			ConnManager.switchBuildUp = 0;
		}

		ConnManager.changeConnModeStr = '';
		ConnManager.connChangeAsked = false;
		ConnManager.userNetworkMode_Override = false;
		ConnManager.userNetworkMode_TestExempt = false;

		ConnManager.setUp_dataServerModeDetection();

	}
}

ConnManager.cancelSwitchPrompt = function()
{
	if ( ConnManager.debugMode ) console.log( 'cancelSwitchPrompt > connChangeAsked: ' + ConnManager.connChangeAsked + ', userNetworkMode: ' + ConnManager.userNetworkMode + ', userNetworkMode_TestExempt: ' + ConnManager.userNetworkMode_TestExempt );

	if ( ConnManager.userNetworkMode && ConnManager.userNetworkMode_TestExempt ) 
	{
		ConnManager.userNetworkMode_TestExempt = false;
		ConnManager.setUserNetworkMode ( true );
	}

	ConnManager.changeConnModeStr = '';
	ConnManager.connChangeAsked = false;
	ConnManager.IntvCountBuildUp = 0;
}

// ----------------------------------
// --- Mode Detection and Switch ----

ConnManager.setUp_dataServerModeDetection = function() 
{
	if ( ConnManager.debugMode ) console.log( 'initiate setUp_dataServerModeDetection > existing timer: ' + ConnManager.dataServer_timerID );

	if ( ConnManager.dataServer_timerID )
	{
		if ( ConnManager.debugMode ) console.log( ' 1st clearing TIMER [ConnManager.dataServer_timerID] :' + ConnManager.dataServer_timerID );
		clearInterval(  ConnManager.dataServer_timerID );
		ConnManager.dataServer_timerID = 0;
		ConnManager.dataServerDetect = 0;
	}

	ConnManager.detectDataServerOnline();

	ConnManager.dataServer_timerID = setInterval( function() 
	{
		if ( ConnManager.debugMode ) console.log( '   eval dataServerMode > existing timer: ' + ConnManager.dataServer_timerID );

		ConnManager.detectDataServerOnline();
		ConnManager.dataServerDetect ++;

	}, ConnManager.dataServer_timerIntv );
}

ConnManager.detectDataServerOnline = function( forceDataServerOnline )
{
	if ( ConnManager.debugMode ) console.log( 'detecting DataServerOnline > ' + (new Date() ).toISOString() );
	if ( forceDataServerOnline != undefined ) ConnManager.dataServer_Online = forceDataServerOnline;

	var bNetworkOnline = ConnManager.isOnline();

	if ( ! bNetworkOnline  )
	{
		ConnManager.dataServer_Online = false;
		ConnManager.connStatTagUpdate( ConnManager.network_Online, ConnManager.dataServer_Online );

		if ( ConnManager.appConnMode_Online != bNetworkOnline && !ConnManager.connChangeAsked )
		{
			if ( ConnManager.debugMode ) console.log( 'skipped exemption test 5' );
			ConnManager.changeConnModeTo = "offline";
			//ConnManager.changeConnModeStr = "interval";
			ConnManager.change_AppConnModePrompt( "interval", false );	
		}
	}
	else
	{
		if ( ConnManager.debugMode ) console.log( ' DataServerOnline > checking server status API call + wait' );

		if ( forceDataServerOnline != undefined )
		{

			if ( ConnManager.network_Online != ConnManager.dataServer_Online )
			{
				if ( !ConnManager.dataServer_Online && ConnManager.dataServer_timerID > 0 && !ConnManager.connChangeAsked )
				{
					if ( ConnManager.debugMode ) console.log( 'skipped exemption test 6: ' + forceDataServerOnline );
					ConnManager.changeConnModeTo = "offline";
					//ConnManager.changeConnModeStr = "interval";
					ConnManager.change_AppConnModePrompt( "interval", false );
				}
				else
				{
					if ( ConnManager.dataServer_Online && !ConnManager.appConnMode_Online && !ConnManager.connChangeAsked )
					{
						if ( ConnManager.debugMode ) console.log( 'skipped exemption test 7' );
						ConnManager.changeConnModeTo = "online";
						//ConnManager.changeConnModeStr = "interval";
						ConnManager.change_AppConnModePrompt( "interval", true );
					}
				}
			}
			else
			{
				if ( FormUtil.checkLogin() && ConnManager.dataServer_Online && !ConnManager.getAppConnMode_Online() && !ConnManager.connChangeAsked && !ConnManager.userNetworkMode )
				{
					if ( ConnManager.debugMode ) console.log( 'skipped exemption test 8' );
					ConnManager.changeConnModeTo = "online";
					//ConnManager.changeConnModeStr = "interval";
					ConnManager.change_AppConnModePrompt( "interval", true );
				}
			}

			ConnManager.connStatTagUpdate( ConnManager.network_Online, ConnManager.dataServer_Online );
		}
		else
		{
			FormUtil.getDataServerAvailable( function( success, jsonData ) 
			{
				if ( ConnManager.debugMode ) console.log( 'DataServerOnline > success:' + success + ' > ' + ConnManager.dataServer_timerID);

				if ( success && jsonData && jsonData.available != undefined )
				{
					ConnManager.dataServer_Online = jsonData.available;
					DataManager.setSessionDataValue( 'dataServerLastRequest', JSON.stringify( jsonData ) );
				}
				else
				{
					ConnManager.dataServer_Online = false;
				}

				if ( ConnManager.dataServer_Online )
				{
					DataManager.setSessionDataValue( 'dataServer_lastOnline', (new Date() ).toISOString() );
				}

				if ( ConnManager.debugMode ) 
				{
					console.log( jsonData );
					console.log( 'DataServerOnline > dataServer_Online:' + ConnManager.dataServer_Online + ', ConnManager.network_Online:' + ConnManager.network_Online + ' {existing ConnManager.dataServer_timerID}: ' + ConnManager.dataServer_timerID);
				}

				if ( ConnManager.network_Online != ConnManager.dataServer_Online && ConnManager.appConnMode_Online )
				{
					if ( !ConnManager.dataServer_Online && ConnManager.dataServer_timerID > 0 && !ConnManager.connChangeAsked )
					{
						if ( ConnManager.debugMode ) console.log( 'skipped exemption test 9' );
						ConnManager.changeConnModeTo = "offline";
						//ConnManager.changeConnModeStr = "interval";
						ConnManager.change_AppConnModePrompt( "interval", false );
					}
					else
					{
						if ( ConnManager.dataServer_Online && !ConnManager.appConnMode_Online && !ConnManager.connChangeAsked )
						{
							if ( ConnManager.debugMode ) console.log( 'skipped exemption test 10' );
							ConnManager.changeConnModeTo = "online";
							//ConnManager.changeConnModeStr = "interval";
							ConnManager.change_AppConnModePrompt( "interval", true );
						}
					}
				}
				else
				{
					if ( FormUtil.checkLogin() && ConnManager.dataServer_Online && !ConnManager.getAppConnMode_Online() && !ConnManager.connChangeAsked && !ConnManager.userNetworkMode )
					{
						if ( ConnManager.debugMode ) console.log( 'skipped exemption test 11' );
						ConnManager.changeConnModeTo = "online";
						//ConnManager.changeConnModeStr = "interval";
						ConnManager.change_AppConnModePrompt( "interval", true );
					}
				}

				ConnManager.connStatTagUpdate( ConnManager.network_Online, ConnManager.dataServer_Online );

				if ( ConnManager.dataServer_timerID > 0 )
				{
					//run App + Dcd version tests: which is more likely to change more frequently? App?
					ConnManager.getAppShellVersion( function( retVersion ) 
					{
						var appShellVersion = $( '#spanVersion' ).html().replace('v','');
						if ( ConnManager.debugMode ) console.log( ' ~ CHECKING APP VERSION' );
						if ( ConnManager.debugMode ) console.log( retVersion );
						if ( ConnManager.debugMode ) console.log( appShellVersion.toString() + ' vs ' + retVersion.toString() );

						if ( appShellVersion.toString() < retVersion.toString() )
						{
							var btnAppShellTag = $( '<a term="" class="notifBtn">UPDATE</a>' );

							$( btnAppShellTag ).click( () => {

								if ( ConnManager.isOffline() )
								{
									//alert( 'Only re-register service-worker while online, please.' );
									MsgManager.notificationMessage ( 'Cannot update when offline, please.', 'notificationDark', undefined, '', 'right', 'top' );
								}
								else
								{
									FormUtil.showProgressBar();
									setTimeout( function() {
										ConnManager._cwsRenderObj.reGetAppShell(); 
									}, 500 );
								}
							});

							MsgManager.notificationMessage( 'New app version available: ' + retVersion.toString(), 'notificationDark', btnAppShellTag,'', 'right', 'bottom', 20000, false, undefined, 'newAPPversion' );

						}
						else
						{
							ConnManager.getDcdConfig( function( retVersion ) 
							{
								var userConfig = JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem('session') ).user ) );
								if ( ConnManager.debugMode ) console.log( ' ~ CHECKING DCD VERSION' );
								if ( ConnManager.debugMode ) console.log( retVersion );
								if ( ConnManager.debugMode ) console.log( userConfig.dcdConfig.version + ' vs ' + retVersion.dcdConfig.version.toString() );

								if ( ( userConfig.dcdConfig.version ).toString() < retVersion.dcdConfig.version.toString() )
								{
									DataManager.setSessionDataValue( 'dcdUpgrade', JSON.stringify( retVersion ) );
									var btnDcdConfigTag = $( '<a term="" class="notifBtn">UPDATE</a>' );

									$( btnDcdConfigTag ).click( () => {

										if ( ConnManager.isOffline() )
										{
											msgManager.msgAreaShow ( 'Please wait until network access is restored.' );
										}
										else
										{
											FormUtil.showProgressBar();

											setTimeout( function() {

												var newConfig = DataManager.getSessionData().dcdUpgrade;
												console.log( userConfig );
												//var userName = JSON.parse( localStorage.getItem('session') ).user;

												//DataManager.saveData( userName, JSON.parse( newConfig ) );
												DataManager.setSessionDataValue( 'dcdUpgrade', '' );

												ConnManager._cwsRenderObj.loginObj._pHash = userConfig.mySession.pin ;
												ConnManager._cwsRenderObj.loginObj._staySignedIn = false; //userConfig.mySession.stayLoggedIn;
												ConnManager._cwsRenderObj.loginObj.loginSuccessProcess( JSON.parse( newConfig ) );

												//ConnManager._cwsRenderObj.loginObj.loginSuccessProcess( JSON.parse( newConfig ) );
												FormUtil.hideProgressBar();

											}, 500 );
										}

									}); 

									MsgManager.notificationMessage( 'New config version available: ' + retVersion.dcdConfig.version.toString(), 'notificationDark', btnDcdConfigTag,'', 'right', 'bottom', 20000, false, undefined, 'newDCDversion' );

								}

							});
						}
					});
				}
				

			});
		}
		

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

ConnManager.setUserNetworkMode = function( requestConnMode )
{
	ConnManager.userNetworkMode_dtmSet = (new Date() ).toISOString();
	ConnManager.userNetworkMode_dtmPrompt = (new Date() ).toISOString();
	ConnManager.userNetworkMode_Online = requestConnMode;
}

ConnManager.getAppShellVersion = function( returnFunc )
{
	var loadingTag = undefined;
	var queryLoc = FormUtil.getWsUrl( '/api/getPWAInfo' ); 

	if ( ConnManager.isOnline() )
	{
		FormUtil.wsRetrievalGeneral( queryLoc, loadingTag, function( returnJson )
		{
			if ( returnFunc )
			{
				if ( returnJson == undefined) returnFunc( 0 );
				else returnFunc( returnJson.version );
			}
			else return false;
		});
	}

}

ConnManager.getDcdConfigVersion = function( returnFunc )
{
	if ( localStorage.getItem('session') !== null )
	{
		var loadingTag = undefined;
		var userName = JSON.parse( localStorage.getItem('session') ).user;
		var userPin = Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4);

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

ConnManager.getDcdConfig = function( returnFunc )
{
	if ( localStorage.getItem('session') !== null )
	{
		var loadingTag = undefined;
		var userName = JSON.parse( localStorage.getItem('session') ).user;
		var userPin = Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4);

		FormUtil.submitLogin( userName, userPin, loadingTag, function( success, loginData ) 
		{
			if ( success )
			{
				if ( returnFunc ) returnFunc( loginData );
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
