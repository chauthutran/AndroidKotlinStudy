// -------------------------------------------
// -- ConnManager NEW Class/Methods

function ConnManagerNew() {};

ConnManagerNew._cwsRenderObj;  // <-- Tran wants to make this class instantiating if we use 'cwsRenderObj'..

ConnManagerNew.networkConnStableCheckTime = 5000; // ms, 5000ms = 5 seconds
ConnManagerNew.networkConnTimeOut;

ConnManagerNew.ONLINE = 'Online';
ConnManagerNew.OFFLINE = 'Offline';

ConnManagerNew.statusInfo = {
    'networkConn': {
		'online_Current': false,
        'online_Stable': false // 'Offline',  // CHANGE TO boolean <-- with variable 'networkConn'?
    },
    'serverAvailable': false,
	'appMode': ConnManagerNew.OFFLINE, 	// 'Online' = ( statusInfo.serverAvailable = true && statusInfo.networkConn.connected_Stable == 'Online' )
	'appMode_PromptedMode': '',
	'manual_Offline': {
		'enabled': false, 	// 'mode': ConnManagerNew.OFFLINE, 	// either online:boolean or named 'Offline' >> manual offline is only 'provisioned' networkMode setting 
		'retryOption': '',
		'retryDateTime': '',
		'initiated': ''
    }
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
		var modeOnline = navigator.onLine;
		ConnManagerNew.statusInfo.networkConn.online_Current = modeOnline;
		ConnManagerNew.update_UI( ConnManagerNew.statusInfo );

		
		// These 2 below checks/change will each trigger appModeSwitchRequest
		//	But, since this is before logged In, they will simply set them accordingly..

		// sets 'networkConn.crrentStableMode'
		ConnManagerNew.changeNetworkConnStatus( ConnManagerNew.statusInfo, modeOnline );

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
	// Whenever there is network status change, clear the timeout that would have set 'online_Stable' 
	//	if no change has happened in some period of time.
	clearTimeout( ConnManagerNew.networkConnTimeOut );

	//if ( ! ConnManagerNew.statusInfo.manual_Offline.enabled )
	{
		var modeOnline = navigator.onLine;	
		ConnManagerNew.statusInfo.networkConn.online_Current = modeOnline;
		ConnManagerNew.update_UI( ConnManagerNew.statusInfo );

		ConnManagerNew.networkConnTimeOut = setTimeout( ConnManagerNew.changeNetworkConnStatus
			, ConnManagerNew.networkConnStableCheckTime
			, ConnManagerNew.statusInfo
			, modeOnline );
	}

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
		if ( statusInfo.networkConn.online_Stable )
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
	statusInfo.networkConn.online_Stable = modeOnline;

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

		ConnManagerNew.update_UI( statusInfo );

		ConnManagerNew.appModeSwitchRequest( statusInfo );
	}
};

// ===============================================
// --- App Mode Switch Related --------------------

//
ConnManagerNew.appModeSwitchRequest = function( statusInfo ) 
{
	var appModeNew = ConnManagerNew.produceAppMode_FromStatusInfo( statusInfo );

	ConnManagerNew.setAppMode( appModeNew, statusInfo );

	if ( FormUtil.checkLogin() ) ConnManagerNew.refreshUI_forNetworkModeOnly( appModeNew );

	/*
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
	*/
};


/*ConnManagerNew.setAppMode_WithCondition = function( appModeNew, statusInfo ) 
{
	// if there is any pending prompted switch request, clear them out.
	//ConnManagerNew.hidePrompt_AppSwitch( statusInfo );

	// If Logged In, display Prompt for user confirmation rather than switch.
	if ( FormUtil.checkLogin() ) ConnManagerNew.prompt_AppModeSwitch_WithCondition( appModeNew, statusInfo );
	else ConnManagerNew.setAppMode( appModeNew, statusInfo );
};*/


ConnManagerNew.setAppMode = function( appModeNew, statusInfo ) 
{
	statusInfo.appMode = appModeNew;
	console.log( 'AppMode Set to: ' + appModeNew );
	console.log( statusInfo );

	// TODO: NEED TO TRIGGER SOME UI (Or others) CHANGES DUE TO AppMode Change
	ConnManagerNew.update_UI( statusInfo );
};

ConnManagerNew.refreshUI_forNetworkModeOnly = function( appModeNew )
{

};


ConnManagerNew.produceAppMode_FromStatusInfo = function( statusInfo ) 
{
	return ( statusInfo.networkConn.online_Stable && statusInfo.serverAvailable ) ? ConnManagerNew.ONLINE: ConnManagerNew.OFFLINE;
};


// ===============================================
// --- Prompt App Mode Switch Related --------------------

/*ConnManagerNew.prompt_AppModeSwitch_WithCondition = function( appModeNew, statusInfo ) 
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
};*/


/*ConnManagerNew.showPrompt_AppSwitchModeNew = function( statusInfo )
{
	console.log( statusInfo );
	console.log( ConnManagerNew.switchPromptObj );


	var switchPromptTag = $( '#networkSwitch' );
	var switchTemplatContent = ( statusInfo.appMode_PromptedMode.toUpperCase() === 'ONLINE' ? Templates.ConnManagerNew_Dialog_SwitchMode_Opts : Templates.ConnManagerNew_Dialog_SwitchMode_NoOpts );
	var switchPromptContentObj = $( Templates.ConnManagerNew_Dialog_SwitchMode_NoOpts );
	var switchPromptText = Templates.ConnManagerNew_Dialog_prompt_online;

	var friendlyTitle = ( statusInfo.appMode_PromptedMode.toUpperCase() === 'ONLINE' ? 'Back Online!' : 'No internet :-(' );
	var btnActionText = ( statusInfo.appMode_PromptedMode.toUpperCase() === 'ONLINE' ? 'ACCEPT' : 'GO OFFLINE' );

	switchPromptTag.empty();
	switchPromptTag.append( switchPromptContentObj );

	var dvTitle = switchPromptTag.find( '.title' );
	var dvPrompt = switchPromptTag.find( '.prompt' );
	var btnCancel = switchPromptTag.find( '.cancel' );
	var btnAction = switchPromptTag.find( '.runAction' );

	dvTitle.html( friendlyTitle );
	dvPrompt.html( dvPrompt.html().replace( /{SWITCH_LABEL}/g, questionStr.toUpperCase() ) );
	btnAction.html( btnActionText.toUpperCase() );

	btnCancel.click( function(){

		$( '.scrim' ).hide();
		$( '#networkSwitch' ).empty();
		$( '#networkSwitch' ).hide();

	});

	btnAction.click( function(){

		$( '.scrim' ).hide();
		$( '#networkSwitch' ).empty();
		$( '#networkSwitch' ).hide();

		ConnManagerNew.acceptPrompt_AppModeSwitch( statusInfo );

	});

	$( '.scrim' ).show();
	$( '#networkSwitch' ).fadeIn();

	ConnManagerNew._cwsRenderObj.langTermObj.translatePage(); 
}*/

/*ConnManagerNew.showPrompt_AppSwitchMode = function( statusInfo )
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

}*/

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
	//MsgManager.clearReservedMessage( ConnManagerNew.switchPrompt_reservedMsgID );
}


// ===============================================
// --- Others --------------------



// ===============================================
// --- Event Listeners for Connection Changes ---

ConnManagerNew.createNetworkConnListeners = function()
{
    window.addEventListener( 'online', ConnManagerNew.updateNetworkConnStatus );
	window.addEventListener( 'offline', ConnManagerNew.updateNetworkConnStatus );
};


ConnManagerNew.isAppMode_Online = function()
{
	return ( ConnManagerNew.statusInfo.appMode === ConnManagerNew.ONLINE );
}


// ===============================================
// --- Scheduler related Tasks ---

ConnManagerNew.scheduled_checkNSet_ServerAvailable = function()
{
	console.log( ' ~ running ConnManagerNew.scheduled_checkNSet_ServerAvailable' );
	if ( ! ConnManagerNew.statusInfo.manual_Offline.enabled )
	{
		// Below will trigger another 
		ConnManagerNew.checkNSet_ServerAvailable( ConnManagerNew.statusInfo, function() 
		{
			// called again to update UI to new connect settings
			ConnManagerNew.update_UI( ConnManagerNew.statusInfo );

			//if ( callBack ) callBack( true );
		});
	}
	else
	{
		ConnManagerNew.checkRestoreBlockedManualMode( ConnManagerNew.statusInfo );
		// called again to update UI to new connect settings
		ConnManagerNew.update_UI( ConnManagerNew.statusInfo );
	}

}

ConnManagerNew.checkManualMode_Restore = function()
{
	return ( statusInfo.manual_Offline.enabled && 
		( statusInfo.manual_Offline.retryOption > 0 ) && 
			( new Date ) >= new Date( statusInfo.manual_Offline.retryDateTime ) );
}

ConnManagerNew.checkRestoreBlockedManualMode = function( statusInfo )
{
	if ( statusInfo.manual_Offline.enabled && 
		( statusInfo.manual_Offline.retryOption > 0 ) && 
			( new Date ) >= new Date( statusInfo.manual_Offline.retryDateTime ) )
	{

		ConnManagerNew.serverAvailable( ConnManagerNew.statusInfo, function( available ){

			var prompt =  new AppModeSwitchPrompt( ConnManagerNew );

			if ( available )
			{
				ConnManagerNew.checkNSet_ServerAvailable( ConnManagerNew.statusInfo, function() 
				{
					prompt.showManualSwitch_Dialog( 'Online' );
				})
			}
			else
			{
				if ( ! ConnManagerNew.statusInfo.networkConn.online_Stable )
				{
					prompt.showManualSwitch_NetworkUnavailable_Dialog( true );
				}
				else
				{
					//if ( ! ConnManagerNew.statusInfo.serverAvailable )  << only remaining 'available=false' option is server unavailable
					prompt.showManualSwitch_ServerUnavailable_Dialog();
				}
			}

		});
	}
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

	ConnManagerNew.update_UI_statusDots( statusInfo );
}


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
	var imgSrc = ( networkServerConditionsGood ? 'images/sharp-cloud_queue-24px.svg': 'images/baseline-cloud_off-24px.svg' );

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
