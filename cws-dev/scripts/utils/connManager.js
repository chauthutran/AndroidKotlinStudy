// -------------------------------------------
// -- ConnManager Class/Methods

function ConnManager() {}

ConnManager.network_Online = true; // current network status.. false if offline.  //  'online';
ConnManager.appConnMode_Online = true; // app mode: Online / Offline (current 'recorded' network setting regardless of navigator online, etc)


ConnManager.scheduledTimer_ID = 0;	// Interval timer for checking network conditions
ConnManager.scheduledTimer_intvMS = 1000;	// check navigator.isOnline status every X milli sec (changed from 500ms due to excessive processing placed on device)
ConnManager.scheduledTimer_intvActLimit = 3; // act on [changed network status] after X number of observed tests
ConnManager.scheduledTimer_intvCounter = 0;
ConnManager.scheduledTestBusy = 0;


ConnManager.networkOnline_CurrStatus = false;
ConnManager.networkOnline_PrevStatus = false; 


ConnManager.dataServer_Online = false; // dataServerAvailable
//ConnManager.dataServer_timerIntv = 30000;	// 30,000 milliseconds = 30 sec; 1,800,000 = 30min; 3,600,000 = 1hour
ConnManager.dataServer_statusCheck_IntvLimit = 30; // 60 = every 30sec 
ConnManager.dataServer_statusCheck_IntvCounter = 0;


ConnManager.connChangeAsked = false;  // For asking AppConnMode change only once per mode change
ConnManager.connChangeAskedMode = false;  // For asking AppConnMode change only once per mode change

ConnManager.switch_waitMaxCount = 10;	// After manually switching AppConnMode, let it not for this count..
ConnManager.networkMode_Switch_Prompt = false; //switch prompt has been initiated
//ConnManager.switchBuildUp = 0;


ConnManager.reservedMsgID = '';


//ConnManager.dataServer_timerID = 0;
ConnManager.dataServerDetect = 0;


ConnManager._cwsRenderObj;
ConnManager.changeConnModeTo;
ConnManager.changeConnModeStr;

ConnManager.userNetworkMode = false;
ConnManager.userNetworkMode_Online = true;
ConnManager.userNetworkMode_intvCounter = 0;	// 1800000 milliseconds = 30min > only prompt to switch back to actual network conditions again after 30min..
ConnManager.userNetworkModeSwitch_IntvLimit = 3600; // 60 * 60sec = 1h



ConnManager.userNetworkMode_dtmSet;
ConnManager.userNetworkMode_dtmPrompt;
//ConnManager.userNetworkMode_TestExempt = false;
//ConnManager.userNetworkMode_Override = false;

ConnManager.speedMode = 'normal'; //slow,normal,fast

ConnManager.debugMode = true;

// TODO:ConnManager.networkMode_Switch_Prompt
//		- Need to summarize and put into a document about the current logic
//

// ----------------------------------
// --- Network (Device) Connection --

ConnManager.initialize = function() 
{

    if ( ConnManager.scheduledTimer_ID > 0 )
    {
        clearInterval(  ConnManager.scheduledTimer_ID );
    }

    ConnManager.scheduledTimer_intvCounter = ConnManager.scheduledTimer_intvActLimit;
    ConnManager.dataServer_statusCheck_IntvCounter = ConnManager.dataServer_statusCheck_IntvLimit;

	ConnManager.createScheduledConnTests();

}

ConnManager.isOffline = function() {
	return !ConnManager.network_Online; 
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

ConnManager.setAppConnMode = function( bOnline ) 
{
	ConnManager.appConnMode_Online = ( bOnline != undefined ? bOnline : false);
	ConnManager.networkOnline_CurrStatus = ConnManager.appConnMode_Online;
	ConnManager.networkOnline_PrevStatus = ConnManager.appConnMode_Online;
	ConnManager.connChangeAsked = false;
}

// ----------------------------------
// --- Mode Detection and Switch ----

ConnManager.runScheduledConnTest = function( returnFunc )
{
	ConnManager.scheduledTestBusy = 1;

	var networkStateChanged = ( ConnManager.network_Online != ConnManager.networkOnline_PrevStatus );
	var retJson = { networkOnline: ConnManager.network_Online, serverOnline: ConnManager.dataServer_Online, networkStateChanged: networkStateChanged, serverStateChanged: false, promptSwitchNetworkMode: false, promptSwitchUserNetworkMode: false };

	if ( ConnManager.userNetworkMode ) ConnManager.userNetworkMode_intvCounter += 1;

	if ( networkStateChanged )
	{
		ConnManager.scheduledTimer_intvCounter += 1;
		ConnManager.setScreen_NetworkIcons( ConnManager.network_Online, ConnManager.dataServer_Online );

		if ( ConnManager.scheduledTimer_intvCounter >= ConnManager.scheduledTimer_intvActLimit )
		{
			ConnManager.scheduledTimer_intvCounter = 0;
			console.log( ' ~ here 1st');

			if ( ! ConnManager.network_Online )
			{
				ConnManager.dataServer_Online = false;

				retJson.serverStateChanged = ( retJson.serverOnline != ConnManager.dataServer_Online );
				retJson.serverOnline = false;
				retJson.promptSwitchNetworkMode = true;

				ConnManager.dataServer_statusCheck_IntvCounter = 0; //no need to check server status if network offline
				ConnManager.scheduledTestBusy = 0;

				if ( returnFunc ) returnFunc( retJson );
			}
			else
			{
				console.log( ' ~ FormUtil.getDataServerAvailable ' + ConnManager.network_Online );
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

					retJson.serverStateChanged = ( retJson.serverOnline != ConnManager.dataServer_Online );
					retJson.serverOnline = ConnManager.dataServer_Online;

					ConnManager.dataServer_statusCheck_IntvCounter = 0;
					ConnManager.scheduledTestBusy = 0;

					if ( returnFunc ) returnFunc( retJson );

				});
			}
		}
		else
		{
			ConnManager.scheduledTestBusy = 0;

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
			if ( ConnManager.networkOnline_CurrStatus )
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

					retJson.serverStateChanged = ( retJson.serverOnline != ConnManager.dataServer_Online );
					retJson.serverOnline = ConnManager.dataServer_Online;

					ConnManager.dataServer_statusCheck_IntvCounter = 0;
					ConnManager.scheduledTestBusy = 0;

					if ( returnFunc ) returnFunc( retJson );
				});
			}
			else
			{
				ConnManager.dataServer_Online = false;

				retJson.serverStateChanged = ( retJson.serverOnline != ConnManager.dataServer_Online );
				retJson.serverOnline = false;

				ConnManager.dataServer_statusCheck_IntvCounter = 0;
				ConnManager.scheduledTestBusy = 0;

				if ( returnFunc ) returnFunc( retJson );
			}

		}
		else
		{

			if ( ConnManager.userNetworkMode_intvCounter > ConnManager.userNetworkModeSwitch_IntvLimit  )
			{
				if ( retJson.networkOnline == retJson.serverOnline ) retJson.promptSwitchUserNetworkMode = true;
			}

			ConnManager.scheduledTestBusy = 0;

			if ( returnFunc ) returnFunc( retJson );
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
	ConnManager.networkOnline_CurrStatus = ConnManager.network_Online;
    ConnManager.networkOnline_PrevStatus = ConnManager.network_Online;

	ConnManager.scheduledTimer_ID = setInterval( function() 
	{
		if ( ConnManager.scheduledTestBusy == 0 )
		{

			ConnManager.runScheduledConnTest( function( jsonData ) {

				//console.log( jsonData );
				ConnManager.setScreen_NetworkIcons( jsonData.networkOnline, jsonData.serverOnline );

				if ( ( jsonData.promptSwitchNetworkMode && ! ConnManager.connChangeAsked && ! ConnManager.userNetworkMode ) || jsonData.promptSwitchUserNetworkMode )
				{
					ConnManager.connChangeAskedMode = jsonData.networkOnline;
					ConnManager.change_AppConnModePrompt( "interval", jsonData.networkOnline );
				}
				else
				{
					if ( ConnManager.connChangeAsked && ( jsonData.networkOnline != ConnManager.connChangeAskedMode ) && ( jsonData.networkOnline == jsonData.serverOnline ) )
					{
						MsgManager.clearReservedMessage( ConnManager.reservedMsgID );
						ConnManager.reservedMsgID = '';
					}

					/*if ( ConnManager.connChangeAsked )
					{
						console.log( ' ~ prompted already')
					}*/
				}

				//console.log( ' ~ finish runScheduledConnTest ' + (new Date).toISOString() + ', networkOnline_CurrStatus: ' + ConnManager.networkOnline_CurrStatus + ', networkOnline_PrevStatus: ' + ConnManager.networkOnline_PrevStatus + ', appConnMode_Online: ' + ConnManager.appConnMode_Online );
				//ConnManager.scheduledTestBusy = 0;

			});
		}
		else
		{
			//console.log( 'timer busy');
		}


		// ---- End of Interval -----

	}, ConnManager.scheduledTimer_intvMS );

		/*if ( !ConnManager.userNetworkMode || ( ConnManager.userNetworkMode && ConnManager.userNetworkMode_TestExempt)  )
		{
			// Network Connection Changed - continueous counter build up check
			if ( networkStateChanged ) ConnManager.scheduledTimer_intvCounter = 0;
			else ConnManager.scheduledTimer_intvCounter++;

			// Switched mode wait - Manual 'AppConnMode' switched after count check..
			if ( ConnManager.networkMode_Switch_Prompt ) 
			{
				ConnManager.switchBuildUp++;
				if ( ConnManager.switchBuildUp >= ConnManager.switch_waitMaxCount ) ConnManager.networkMode_Switch_Prompt = false;
			}

			// If during switched(manual) mode, wait for it..
			if ( !ConnManager.networkMode_Switch_Prompt )
			{
				// If already asked for AppConnMode change, do not ask.
				if ( !ConnManager.connChangeAsked )
				{
					// Check continuous network counter - to the limit/check point.
					if ( ConnManager.scheduledTimer_intvCounter >= ConnManager.scheduledTimer_intvActLimit )
					{
						//console.log( 'ConnManager.scheduledTimer_intvCounter >= ConnManager.scheduledTimer_intvActLimit: ' + ConnManager.scheduledTimer_intvActLimit );
						// Ask for the appConnMode Change..
						if ( ConnManager.appConnMode_Online != ConnManager.networkOnline_CurrStatus )
						{
							if ( ConnManager.dataServer_timerID )
							{
								clearInterval(  ConnManager.dataServer_timerID );
								ConnManager.dataServer_timerID = 0;
								ConnManager.dataServerDetect = 0;
							}

							ConnManager.connChangeAskedMode = ConnManager.networkOnline_CurrStatus;
							ConnManager.change_AppConnModePrompt( "interval", ConnManager.networkOnline_CurrStatus );
						}
						else
						{
							if ( ConnManager.isOnline() && !ConnManager.dataServer_Online )
							{
								if ( ! ConnManager.dataServer_timerID ) ConnManager.setUp_dataServerModeDetection();
							}
						}
						ConnManager.scheduledTimer_intvCounter = 0;
					}	
				}
				else
				{
					// USER CURRENTLY PROMPTED 
					if ( ConnManager.scheduledTimer_intvCounter == (parseFloat(ConnManager.dataServer_timerIntv) * 2 / 1000) ) // 60 = 30000ms / 500ms ( dataServerTimer / networkOnlineTimer )
					{
						if ( ConnManager.isOnline() && !ConnManager.dataServer_Online && !ConnManager.connChangeAsked )
						{
							if ( ConnManager.debugMode ) console.log( 'skipped exemption test 2' );
							//ConnManager.connChangeAsked = true;
							ConnManager.connChangeAskedMode = ConnManager.networkOnline_CurrStatus;
							ConnManager.change_AppConnModePrompt( "interval", ConnManager.networkOnline_CurrStatus );
							ConnManager.scheduledTimer_intvCounter = 0;
						}
						else if ( bNetworkOnline != ConnManager.appConnMode_Online && !ConnManager.connChangeAsked )
						{
							if ( ConnManager.debugMode ) console.log( 'skipped exemption test 3' );
							//ConnManager.connChangeAsked = true;
							ConnManager.connChangeAskedMode = ConnManager.networkOnline_CurrStatus;
							ConnManager.change_AppConnModePrompt( "interval", ConnManager.networkOnline_CurrStatus );
							ConnManager.scheduledTimer_intvCounter = 0;
						}

						if ( ConnManager.debugMode ) console.log( 'Interval:createScheduledConnTests DIFFERENT network MODE vs actual ' + bNetworkOnline + '('+ConnManager.isOnline()+'), ConnManager.dataServer_Online: ' + ConnManager.dataServer_Online + ', ConnManager.appConnMode_Online: ' + ConnManager.appConnMode_Online + ', scheduledTimer_intvCounter: ' + ConnManager.scheduledTimer_intvCounter + ', ConnManager.dataServerDetect: ' + ConnManager.dataServerDetect + ', ConnManager.dataServer_timerID: ' + ConnManager.dataServer_timerID );
					}
					else
					{
						//Cancel an existing prompt to switch network (e.g. if in offline mode, network comes on, a prompt to switch modes will show; before it auto-clicks the network changes back to offline; this next step will cancel the prompt)
						if ( ConnManager.connChangeAsked && ConnManager.networkOnline_CurrStatus != ConnManager.connChangeAskedMode )
						{
							MsgManager.clearReservedMessage( ConnManager.changeConnModeStr.toUpperCase() + '_' + ConnManager.connStatusStr( ConnManager.connChangeAskedMode ).toUpperCase() );

							ConnManager.scheduledTimer_intvCounter = 0;
							ConnManager.userNetworkMode = false;
							ConnManager.networkMode_Switch_Prompt = false;
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


		ConnManager.networkOnline_PrevStatus = bNetworkOnline;*/

}


ConnManager.change_AppConnModePrompt = function( modeStr, requestConnMode )
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

		var btnSwitch = $( '<a term="" class="notifBtn">SWITCH</a>' );

		$( btnSwitch ).click( () => {
			/*if ( ConnManager.userNetworkMode_TestExempt )
			{
				ConnManager.userNetworkMode_Override = true;
			}*/
			ConnManager.reservedMsgID = '';
			ConnManager.switchPreDeterminedConnMode();
		});

		ConnManager.reservedMsgID = modeStr.toUpperCase() + '_' + changeConnStr.toUpperCase();

		MsgManager.notificationMessage( questionStr, 'notificationDark', btnSwitch,'', 'right', 'top', 20000, true, ConnManager.cancelSwitchPrompt, ConnManager.reservedMsgID );

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

		/*if ( ConnManager.userNetworkMode )
		{
			if ( ConnManager.userNetworkMode_Override )
			{
				ConnManager.userNetworkMode = false; //this doesn't need to override any network settings	
			}
		}*/

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
			ConnManager.scheduledTimer_intvCounter = 0;
			//ConnManager.userNetworkMode = false;
		}
		else if ( ConnManager.changeConnModeStr === "switch" ) 
		{
			ConnManager.networkMode_Switch_Prompt = true;
			//ConnManager.switchBuildUp = 0;
		}

		ConnManager.changeConnModeStr = '';
		ConnManager.connChangeAsked = false;
		//ConnManager.userNetworkMode_Override = false;
		//ConnManager.userNetworkMode_TestExempt = false;

		//ConnManager.setUp_dataServerModeDetection();

	}
}

ConnManager.cancelSwitchPrompt = function()
{
	//if ( ConnManager.debugMode ) console.log( 'cancelSwitchPrompt > connChangeAsked: ' + ConnManager.connChangeAsked + ', userNetworkMode: ' + ConnManager.userNetworkMode + ', userNetworkMode_TestExempt: ' + ConnManager.userNetworkMode_TestExempt );

	if ( ConnManager.userNetworkMode ) // && ConnManager.userNetworkMode_TestExempt
	{
		//ConnManager.userNetworkMode_TestExempt = false;
		ConnManager.setUserNetworkMode ( true );
	}

	ConnManager.changeConnModeStr = '';
	ConnManager.connChangeAsked = false;
	ConnManager.scheduledTimer_intvCounter = 0;
}

// ----------------------------------
// --- Mode Detection and Switch ----

ConnManager.setUp_dataServerModeDetection = function() 
{
	/*if ( ConnManager.debugMode ) console.log( 'initiate setUp_dataServerModeDetection > existing timer: ' + ConnManager.dataServer_timerID );

	if ( ConnManager.dataServer_timerID )
	{
		if ( ConnManager.debugMode ) console.log( ' 1st clearing TIMER [ConnManager.dataServer_timerID] :' + ConnManager.dataServer_timerID );
		clearInterval(  ConnManager.dataServer_timerID );
		ConnManager.dataServer_timerID = 0;
		ConnManager.dataServerDetect = 0;
	}*/

	ConnManager.detectDataServerOnline();

	/*ConnManager.dataServer_timerID = setInterval( function() 
	{
		if ( ConnManager.debugMode ) console.log( '   eval dataServerMode > existing timer: ' + ConnManager.dataServer_timerID );

		ConnManager.detectDataServerOnline();
		ConnManager.dataServerDetect ++;

	}, ConnManager.dataServer_timerIntv );*/

}


ConnManager.setScreen_NetworkIcons = function( bOnline, bDataServerOnline ) 
{
  	var imgSrc = ( bOnline && bDataServerOnline ) ? 'images/sharp-cloud_queue-24px.svg': ( ( bOnline ) ? 'images/baseline-cloud_off-24px-unavailable.svg' : 'images/baseline-cloud_off-24px.svg' );
	//console.log( ' setScreen_NetworkIcons: ' + ( bOnline && bDataServerOnline ), bOnline , bDataServerOnline );
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

ConnManager.getDcdConfig = function( returnFunc )
{
	if ( localStorage.getItem('session') !== null )
	{
		var loadingTag = undefined;
		var userName = FormUtil.login_UserName; //JSON.parse( localStorage.getItem('session') ).user;
		var userPin = FormUtil.login_Password;

		if ( userName.length * userPin.length ) //FormUtil.getUserSessionAttr( userName,'pin' )
		{
			//var userPin = FormUtil.login_Password; //Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4);

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
	else return undefined;

}

ConnManager.getDcdConfigVersion = function( returnFunc )
{
	if ( localStorage.getItem('session') !== null && FormUtil.checkLogin() )
	{
		//if ( localStorage.getItem('session') && localStorage.getItem('session').user && (localStorage.getItem('session').user).length )
		{
			var loadingTag = undefined;
			var userName = FormUtil.login_UserName; //JSON.parse( localStorage.getItem('session') ).user;
			var userPin = FormUtil.login_Password; //Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4);

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
		//else return undefined;
	}
	else return undefined;
}



/* * / * / * / * / * / * / * / * / * / * / * / *  * \ * \ * \ * \ * \ * \ * \ * \ * \ * \ * \ *\
/*      APP Shell        */
/* / * / * / * / * / * / * / * / * / * / * / *  * \ * \ * \ * \ * \ * \ * \ * \ * \ * \ * \ */

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