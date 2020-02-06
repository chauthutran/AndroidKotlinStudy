// -------------------------------------------
// -- ConnManager NEW Class/Methods

function ConnManagerNew() {};

ConnManagerNew._cwsRenderObj;  // <-- Tran wants to make this class instantiating if we use 'cwsRenderObj'..

ConnManagerNew.networkConnStableCheckTime = 5000; // ms, 5000ms = 5 seconds
ConnManagerNew.networkConnTimeOut;

ConnManagerNew.statusInfo = {
    'networkConn': {
        'currentStableMode': 'Offline',
    },
    'serverAvailable': false,
	'appMode': 'Offline', 	// 'Online' = ( statusInfo.serverAvailable = true && statusInfo.networkConn.currentStableMode == 'Online' )
	'appMode_PromptedMode': ''
};

ConnManagerNew.switchPrompt_reservedMsgID;
//ConnManagerNew.switchPromptObj = new AppModeSwitchPrompt();


// ====================================================
// ===============================

// THIS IS EXCEPTION CASE - NOT MAIN CASE...
// On start of the app, we set this initially..
ConnManagerNew.appStartUp_SetStatus = function( cwsRenderObj, callBack ) 
{
	ConnManagerNew._cwsRenderObj = cwsRenderObj;

	try
	{
		// to start off > update UI to 'defaults' for connection settings
		ConnManagerNew.update_UI( ConnManagerNew.statusInfo );

		// These 2 below checks/change will each trigger appModeSwitchRequest
		//	But, since this is before logged In, they will simply set them accordingly..

		// sets 'networkConn.crrentStableMode'
		ConnManagerNew.changeNetworkConnStatus( ConnManagerNew.statusInfo, navigator.onLine );

		// Below will trigger another 
		ConnManagerNew.checkNSet_ServerAvailable( ConnManagerNew.statusInfo, function() 
		{
			// called again to update UI to new connect settings
			ConnManagerNew.update_UI( ConnManagerNew.statusInfo );

			callBack( true );
		});
	}
	catch( errMsg )
	{
		console.log( 'ERROR during ConnManagerNew.firstNetworkConnSet, errMsg: ' + errMsg );
		callBack( false );
	}
};


// ===============================================
// ------------------------------------------


// CHECK #1
// Event Handler for checking / updating consistant(not frequently changed) network connection status.
ConnManagerNew.updateNetworkConnStatus = function() 
{
	clearTimeout( ConnManagerNew.networkConnTimeOut );

	var modeOnline = navigator.onLine;
	
	ConnManagerNew.networkConnTimeOut = setTimeout( ConnManagerNew.changeNetworkConnStatus
		, ConnManagerNew.networkConnStableCheckTime
		, ConnManagerNew.statusInfo
		, modeOnline );
	
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
		if ( statusInfo.networkConn.currentStableMode === 'Online' )
		{
			FormUtil.getDataServerAvailable( function ( success, jsonData ) {

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
}

// ===============================================
// ------------------------------------------

// Change Network Connection
ConnManagerNew.changeNetworkConnStatus = function( statusInfo, modeOnline )
{
	statusInfo.networkConn.currentStableMode = ( modeOnline ) ? 'Online': 'Offline';

	// Do we need a secondary-level function to switch Server:OFFLINE if network==='Offline'?
	// --> it would be added here

	// Trigger AppMode Change Check
	ConnManagerNew.appModeSwitchRequest( statusInfo );

	// update UI icons to reflect current network change
	ConnManagerNew.update_UI( statusInfo );
};


// Server
ConnManagerNew.changeServerAvailableIfDiff =  function( newAvailable, statusInfo )
{
	// If there was a change in this status, trigger the appModeCheck
	if ( newAvailable !== statusInfo.serverAvailable )
	{
		statusInfo.serverAvailable = newAvailable;

		ConnManagerNew.appModeSwitchRequest( statusInfo );
	}
};

// ===============================================
// --- App Mode Switch Related --------------------

//
ConnManagerNew.appModeSwitchRequest = function( statusInfo ) 
{
	var appModeNew = ConnManagerNew.produceAppMode_FromStatusInfo( statusInfo );

	// If appModeNew is same as existing Prmopt MOde, ignore it.
	if ( appModeNew !== statusInfo.appMode_PromptedMode )
	{
		// Only if appMode New is diff from current appmode proceed with setAppMode
		if ( appModeNew !== statusInfo.appMode )
		{
			ConnManagerNew.setAppMode_WithCondition( appModeNew, statusInfo );
		}
		else 
		{
			// If appModeNew is same as existing appMode, but we have Prompt, then, we cancel the prompt.
			if ( statusInfo.appMode_PromptedMode !== '' )
			{
				ConnManagerNew.cancelAndHide_promptModeSwitch( statusInfo );
			}
		}
	}
};


ConnManagerNew.setAppMode_WithCondition = function( appModeNew, statusInfo ) 
{
	// if there is any pending prompted switch request, clear them out.
	//ConnManagerNew.hidePrompt_AppSwitch( statusInfo );

	// If Logged In, display Prompt for user confirmation rather than switch.
	if ( FormUtil.checkLogin() ) ConnManagerNew.prompt_AppModeSwitch_WithCondition( appModeNew, statusInfo );
	else ConnManagerNew.setAppMode( appModeNew, statusInfo );
};


ConnManagerNew.setAppMode = function( appModeNew, statusInfo ) 
{
	statusInfo.appMode = appModeNew;

	console.log( 'AppMode Set to: ' + appModeNew );

	// TODO: NEED TO TRIGGER SOME UI (Or others) CHANGES DUE TO AppMode Change
	ConnManagerNew.update_UI( statusInfo );
};


ConnManagerNew.produceAppMode_FromStatusInfo = function( statusInfo ) 
{
	return ( statusInfo.networkConn.currentStableMode === 'Online'
		&& statusInfo.serverAvailable ) ? 'Online': 'Offline';
};


// ===============================================
// --- Prompt App Mode Switch Related --------------------

ConnManagerNew.prompt_AppModeSwitch_WithCondition = function( appModeNew, statusInfo ) 
{
	// only show switch prompt if current mode different to appModeNew
	if ( appModeNew != statusInfo.appMode )
	{
		statusInfo.appMode_PromptedMode = appModeNew;

		ConnManagerNew.showPrompt_AppSwitchMode( statusInfo );
	}
	else
	{
		if ( ConnManagerNew.switchPrompt_reservedMsgID ) 
		{
			console.log( 'clearing existing Prompt > Switch to - ' + appModeNew );
			ConnManagerNew.hidePrompt_AppSwitch();
		}
	}
};

ConnManagerNew.showPrompt_AppSwitchMode = function( statusInfo )
{

	//ConnManagerNew.switchPrompt_reservedMsgID = ConnManagerNew.switchPromptObj.showPrompt( statusInfo );


	var questionStr = "switch to [" + statusInfo.appMode_PromptedMode.toUpperCase() + "] "; //"Network changed: switch to '" + changeConnStr.toUpperCase() + "' mode?";
	var btnSwitch = $( '<a term="" class="notifBtn" ">SWITCH</a>' );

	$( btnSwitch ).click( function(){

		// make part of cwsRender obj > think about
		ConnManagerNew.acceptPrompt_AppModeSwitch( statusInfo );

	});

	ConnManagerNew.switchPrompt_reservedMsgID = 'ConnManagerNew_switch_' + statusInfo.appMode_PromptedMode.toUpperCase();

	MsgManager.notificationMessage( questionStr, 'notificationDark', btnSwitch,'', 'right', 'top', 20000, true, ConnManagerNew.rejectPrompt_AppModeSwitch, ConnManagerNew.switchPrompt_reservedMsgID );

}

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
	MsgManager.clearReservedMessage( ConnManagerNew.switchPrompt_reservedMsgID );
}


// ===============================================
// --- Others --------------------



// ===============================================
// --- Event Listeners for Connection Changes ---

ConnManagerNew.createNetworkConnListeners = function()
{
    window.addEventListener('online', ConnManagerNew.updateNetworkConnStatus);
	window.addEventListener('offline', ConnManagerNew.updateNetworkConnStatus);
};


ConnManagerNew.isAppMode_Online = function()
{
	return ( ConnManagerNew.statusInfo.appMode === 'Online' );
}

//  replaced by ConnManagerNew.isAppMode_Online()
//ConnManagerNew.networkSyncConditions = function()
//{
//	return ( ConnManagerNew.statusInfo.appMode === 'Online' );
//}



// ===============================================
// --- Scheduler related Tasks ---

ConnManagerNew.scheduled_checkNSet_ServerAvailable = function()
{
	// Below will trigger another 
	ConnManagerNew.checkNSet_ServerAvailable( ConnManagerNew.statusInfo, function() 
	{
		// called again to update UI to new connect settings
		ConnManagerNew.update_UI( ConnManagerNew.statusInfo );

		//if ( callBack ) callBack( true );
	});

}

// ===============================================================
// =====================================




// ===============================================
// --- UI section ----

ConnManagerNew.update_UI = function( statusInfo )
{
    // update MODE for PWA - cascade throughout app (rebuild menus + repaint screens where required)

    if ( ! FormUtil.checkLogin() ) ConnManagerNew.update_UI_LoginStatusIcon( statusInfo );
	else ConnManagerNew.update_UI_NetworkIcons( statusInfo );
}


ConnManagerNew.update_UI_LoginStatusIcon = function( statusInfo )
{
	// update loginScreen Logo (grayscale = offline): offline indicator before logging in
    if ( statusInfo.appMode === 'Online' ) {
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
	var networkServerConditionsGood = ( statusInfo.networkConn.currentStableMode === 'Online' && statusInfo.appMode === 'Online' );
	
	// if all conditions good > show online, else if only networkOnline, show red icon (reserved for server unavailable), else show as offline
	var imgSrc = ( networkServerConditionsGood ) ? 'images/sharp-cloud_queue-24px.svg': ( statusInfo.networkConn.currentStableMode === 'Online' ? 'images/baseline-cloud_off-24px-unavailable.svg' : 'images/baseline-cloud_off-24px.svg' );

	$( '#imgNetworkStatus' ).css( 'transform', ( networkServerConditionsGood ) ? '' : 'rotateY(180deg)' );

	// timeout (500) used to create image rotation effect (requires 1s transition on img obj)
	setTimeout( function() { 
		$( '#imgNetworkStatus' ).attr( 'src', imgSrc );
	}, 500 );

	$( '#divNetworkStatus' ).css( 'display', 'block' );
};
