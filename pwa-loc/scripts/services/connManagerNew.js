// -------------------------------------------
// -- ConnManagerNew Class/Methods

function ConnManagerNew() { };

ConnManagerNew.networkConnStableCheckTime = Util.MS_SEC * 10; // ms, 10000ms = 10 seconds
ConnManagerNew.networkConnTimeOut;

ConnManagerNew.ONLINE = 'Online';
ConnManagerNew.OFFLINE = 'Offline';

ConnManagerNew.statusInfo = {
	'networkConn': {
		'online_Current': false
		, 'online_Stable': false // false == 'Offline'
	},
	'serverAvailable': true,	// Start with 'true' for serverAvailable (webService)
	'appMode': ConnManagerNew.OFFLINE, 	// 'Online' = ( statusInfo.serverAvailable = true && statusInfo.networkConn.connected_Stable == 'Online' )
	'appMode_PromptedMode': '',
	'manual_Offline': {
		'enabled': false, 	// 'mode': ConnManagerNew.OFFLINE, 	// either online:boolean or named 'Offline' >> manual offline is only 'provisioned' networkMode setting 
		'timeOutRef': undefined, // CallBack timeout reference
		'retryOption': '',
		'retryDateTime': '',
		'initiated': ''
	}
};

ConnManagerNew.efficiency = {
	'Immediate_wsAvailCheck': true  // After network Stable become online (from offline), try the ws available check immedicatley..
	, 'Immediate_OneCheckOnline': false  // If there is any one online signal, consider it as online stable
};

ConnManagerNew.switchPrompt_reservedMsgID;

// Changed by 'Availability' call - methods in WsCallManager.
ConnManagerNew.REPLICA_Available = true;
ConnManagerNew.POEDITOR_Available = true;

// ====================================================
// ===============================

// THIS IS EXCEPTION CASE - NOT MAIN CASE...
// On start of the app, we set this initially..
ConnManagerNew.appStartUp_SetStatus = function () //, callBack ) 
{
	try {
		// To start off > update UI to 'defaults' for connection settings
		var modeOnline = navigator.onLine;  // 'navigator.online' return 'true' if network connect exists.  Otherwise, return 'false'.
		ConnManagerNew.statusInfo.networkConn.online_Current = modeOnline;
		ConnManagerNew.update_UI(ConnManagerNew.statusInfo);

		// WsAvailable is by default set to 'true'

		// Set the start off network connection status to 'stable' one (only on this start process)
		// And Trigger to update the AppMode (with the WsAvailable value + additional submit afterwards)
		ConnManagerNew.changeNetworkConnStableStatus(ConnManagerNew.statusInfo, modeOnline, 'startUp');

	}
	catch (errMsg) {
		console.log('ERROR during ConnManagerNew.firstNetworkConnSet, errMsg: ' + errMsg);
		//callBack( false );
	}
};


// =====================================================
// ------ Network Connection Status Check Related -----

// Event Listeners for Network Change - call for 'stable' network deciding/waiting method
ConnManagerNew.createNetworkConnListeners = function () {
	window.addEventListener('online', ConnManagerNew.updateNetworkConnStatus);
	window.addEventListener('offline', ConnManagerNew.updateNetworkConnStatus);
};


// CHECK #1
// Event Handler for checking / updating consistant(not frequently changed) network connection status.
ConnManagerNew.updateNetworkConnStatus = function () {
	// Whenever there is network status change, clear the timeout that would have set 'online_Stable' 
	//	if no change has happened in some period of time.
	clearTimeout(ConnManagerNew.networkConnTimeOut);

	var bDeviceConnected = navigator.onLine;	// 'navigator.online' returns 'true/false' based on device connectivity
	ConnManagerNew.statusInfo.networkConn.online_Current = bDeviceConnected;
	//ConnManagerNew.update_UI( ConnManagerNew.statusInfo );  <-- Since we do not display 'current' network status, no need to call this now.


	// Start the timer.  If this method is not called again in the time, run 'stable' connection set.
	ConnManagerNew.networkConnTimeOut = setTimeout(function () {
		ConnManagerNew.changeNetworkConnStableStatus(ConnManagerNew.statusInfo, bDeviceConnected);

	}, ConnManagerNew.networkConnStableCheckTime);


	// DIABLED - Optional Immediate stable online - If there is any one online signal
	//if ( bDeviceConnected && ConnManagerNew.efficiency.Immediate_OneCheckOnline )
	//{ ConnManagerNew.changeNetworkConnStableStatus( ConnManagerNew.statusInfo, modeOnline ); } 
	// else

	return bDeviceConnected;
};


// Change Network Connection
ConnManagerNew.changeNetworkConnStableStatus = function (statusInfo, modeOnline, optionStr) {
	// MAIN - Mark the network connection as stable Online/Offline
	statusInfo.networkConn.online_Stable = modeOnline;

	// Trigger AppMode Check
	ConnManagerNew.appModeSwitchRequest(statusInfo);
	// update UI icons to reflect current network change
	// Do not need to anymore since 'Reqeust' is same as Set NOW!!!
	ConnManagerNew.update_UI(statusInfo);


	// If optional flag is to check server available immedicatley, perform it.
	if (optionStr === 'startUp' || ConnManagerNew.efficiency.Immediate_wsAvailCheck) {
		// Below only gets called (has checks inside) if stable online..
		ConnManagerNew.checkNSet_ServerAvailable();
	}
};


// Additional Confirmation Check(Re) - For network change event use method..
//	There are cases when network connection is set wrongly, but does not get adjusted if no network changes after.
//  Call this with schedule - every 5 sec?
ConnManagerNew.networkCurrentRecheck = function () {
	if (ConnManagerNew.statusInfo.networkConn.online_Current !== navigator.onLine) {
		console.log('==> NOTE: Network Connection Discrepancy Detected!! Running Adjustment!');
		console.log('APP CURR: ' + ConnManagerNew.statusInfo.networkConn.online_Current + ' vs NET: ' + navigator.onLine);
		ConnManagerNew.updateNetworkConnStatus();
	}
};


// Alternative Network Stable..every 5 seconds ones..
// 1. On method call, Set Current network status
// 2. Use 'progressCount' = 0..  reset if diff conn status comes
//    If same status, add another count
//	  If reaches the target, set it as 'stable'


// ====================================================
// ------- Server Available Check Related ------------

// CHECK #2 - SERVER AVAILABLE CHECK
ConnManagerNew.checkNSet_ServerAvailable = function (callBack) {
	if (ConnManagerNew.statusInfo.networkConn.online_Stable) {
		ConnManagerNew.serverAvailable(function (bServerAvailableNew) {
			ConnManagerNew.changeServerAvailableIfDiff(bServerAvailableNew, ConnManagerNew.statusInfo);

			if (callBack) callBack(bServerAvailableNew);
		});
	}
	else {
		if (callBack) callBack();
	}
};


ConnManagerNew.serverAvailable = function (callBack) {
	WsCallManager.serverAvailable(callBack);
};


// Server
ConnManagerNew.changeServerAvailableIfDiff = function (newAvailable, statusInfo) {
	// If there was a change in this status, trigger the appModeCheck
	if (newAvailable !== statusInfo.serverAvailable) {
		statusInfo.serverAvailable = newAvailable;

		ConnManagerNew.update_UI(statusInfo);

		ConnManagerNew.appModeSwitchRequest(statusInfo);
	}
};

// ===============================================
// --- App Mode Switch Related --------------------

// TEMP: CHANGED the 'Request' to happen right away without prompt interaction..
ConnManagerNew.appModeSwitchRequest = function (statusInfo) {
	var appModeNew = ConnManagerNew.produceAppMode_FromStatusInfo(statusInfo);

	ConnManagerNew.setAppMode(appModeNew, statusInfo); //, function( appModeChanged ) 
};


ConnManagerNew.produceAppMode_FromStatusInfo = function (statusInfo) {
	return (statusInfo.networkConn.online_Stable && statusInfo.serverAvailable) ? ConnManagerNew.ONLINE : ConnManagerNew.OFFLINE;
};


ConnManagerNew.setAppMode = function (appModeNew, statusInfo) {
	var existingAppMode = statusInfo.appMode;

	// Set appMode
	if (statusInfo.manual_Offline.enabled) statusInfo.appMode = ConnManagerNew.OFFLINE;  // THIS NEVER GETS CALLED PROPERLY?
	else statusInfo.appMode = appModeNew;

	if (statusInfo.appMode !== existingAppMode) {
		ConnManagerNew.update_UI(statusInfo);

		if (SessionManager.getLoginStatus()) {
			SessionManager.cwsRenderObj.appModeSwitch_UIChanges();

			// When Switching From Offline -> Online, perform the runOnceOnline things..
			// However, when WFA App start, 'online' set (forced) could call this.  To block that case, call this only if 'loggedIn'
			if (ConnManagerNew.isAppMode_Online()) ConnManagerNew.runWhenSwitchedToOnline(); //ScheduleManager.runWhenSwitchedToOnline();
		}
	}
};


ConnManagerNew.runWhenSwitchedToOnline = function () {
	// 1. Run schedule specific tasks - that was added for this case.
	ScheduleManager.runWhenSwitchedToOnline();

	// 2. If lastSyncAllTime is quite old (6 hr or from config setting), perform syncAll...
	ConnManagerNew.runSyncAll_ifOldLastSyncAll();

	// 3. Send Google Anlytics Offline cached ones.
	GAnalytics.offlineCacheSend();

	// 4. 'backgroundUpdateWhenOnline' enabled, perform app Update in background.
	// if ( ConfigManager.getAppUpdateSetting().backgroundUpdateWhenOnline ) {	SwManager.checkNewAppFile_OnlyOnline( undefined, { 'delayReload': true } ); 
	// SYNC ALL (ONLINE) Does call NewAppFile with delayed reload.

};


ConnManagerNew.runSyncAll_ifOldLastSyncAll = function () {
	try {
		if (ConfigManager.getSync().autoSyncOnline_lastSyncHour) // This will always exist due to 'default' value merge in 'configManager'
		{
			var lastSyncAllDt = AppInfoLSManager.getLastSyncAllDt();

			if (lastSyncAllDt) {
				var hrSince = UtilDate.getTimeSince(lastSyncAllDt, Util.MS_HR);

				if (hrSince && hrSince >= ConfigManager.getSync().autoSyncOnline_lastSyncHour) {
					SyncManagerNew.syncAll_FromSchedule(SessionManager.cwsRenderObj);
				}
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in ConnManagerNew.runSyncAll_ifOldLastSyncAll, ' + errMsg);
	}
};

// ===============================================
// ---- Status Check Related ----------

ConnManagerNew.isAppMode_Online = function () {
	return (ConnManagerNew.statusInfo.appMode === ConnManagerNew.ONLINE);
};

ConnManagerNew.isAppMode_Offline = function () {
	return !ConnManagerNew.isAppMode_Online();
};


ConnManagerNew.isNetworkCurrent_Online = function () {
	return ConnManagerNew.statusInfo.networkConn.online_Current;
};

ConnManagerNew.isNetworkCurrent_Offline = function () {
	return !ConnManagerNew.isNetworkCurrent_Online();
};


ConnManagerNew.isStrONLINE = function (appModeStr) {
	return (appModeStr === ConnManagerNew.ONLINE);
};

ConnManagerNew.isStrOFFLINE = function (appModeStr) {
	return (appModeStr === ConnManagerNew.OFFLINE);
};

ConnManagerNew.connStatusStr = function () {
	return (ConnManagerNew.isAppMode_Online()) ? ConnManagerNew.ONLINE : ConnManagerNew.OFFLINE;
}

// ===============================================
// --- Others --------------------

// ===============================================
// --- Manual AppMode Swtich related Tasks ---

// Call this when app starts.
ConnManagerNew.cloudConnStatusClickSetup = function (divNetworkStatusTag) {
	divNetworkStatusTag.off('click').click(function () {
		if (ConnManagerNew.isAppMode_Online()) {
			// Show Dialog for Manual Offline - If currently online..
			AppModeSwitchPrompt.showManualSwitch_Dialog(ConnManagerNew.OFFLINE, SessionManager.cwsRenderObj);
		}
		else {
			// Show Dialog for Manual Online - only if was manual offline & netowrk available
			var statusInfoRef = ConnManagerNew.statusInfo;

			if (statusInfoRef.manual_Offline.enabled) {
				// NOTE: TODO: Manual Online Failure --> Could have both condition, thus, show combined issue message?
				if (!statusInfoRef.networkConn.online_Stable) {
					AppModeSwitchPrompt.showManualSwitch_NetworkUnavailable_Dialog(SessionManager.cwsRenderObj);
				}
				else if (!statusInfoRef.serverAvailable) {
					AppModeSwitchPrompt.showManualSwitch_ServerUnavailable_Dialog(SessionManager.cwsRenderObj);
				}
				else {
					// Perform Manual Online 
					AppModeSwitchPrompt.showManualSwitch_Dialog(ConnManagerNew.ONLINE, SessionManager.cwsRenderObj);
				}
			}
			else {
				// CASE: If currently in offline status, 
				//		If not manual offline, we simply sent msg about that it was not manual offline case.
				//		However, we sometimes saw on mobile that it was offline when opening the app back from not using it for a while.
				// 		Thus, We added extra logic for extra network connectivity status re-check
				//			- If current connection is on/true, go for stable (10s) check - with msg.

				var notManualCaseStr = 'Not Manual Offline Case.';

				// Check the online status again.. - For unintended network situation..
				var bIsConnected = ConnManagerNew.updateNetworkConnStatus();
				if (bIsConnected) {
					var sec = UtilDate.getSecFromMiliSec(ConnManagerNew.networkConnStableCheckTime);
					MsgManager.msgAreaShow(notManualCaseStr + ' Network connection exists.  Retry for ' + sec + 's stable network check.');
				}
				else {
					MsgManager.msgAreaShow(notManualCaseStr);
				}

				// Show no manual offline existing..  
				// MsgManager.msgAreaShow( 'AppMode is Offline without manual offline setting.' );
			}
		}
	});

};


ConnManagerNew.setManualAppModeSwitch = function (newAppModeStr, callBackTime) {
	var statusInfoRef = ConnManagerNew.statusInfo;

	if (ConnManagerNew.isStrOFFLINE(newAppModeStr)) {
		// If Manual Offline AppMode Requested, 
		//	1. Set the 'AppMode' to Offline Manually.
		ConnManagerNew.setAppMode(ConnManagerNew.OFFLINE, statusInfoRef);
		statusInfoRef.manual_Offline.enabled = true;


		//  2. Set a Call back in time.. - to remove the manual offline and trigger appMode check..
		statusInfoRef.manual_Offline.timeOutRef = setTimeout(function (statusInfoRef) {

			statusInfoRef.manual_Offline.enabled = false;
			ConnManagerNew.appModeSwitchRequest(statusInfoRef);

		}, callBackTime * Util.MS_SEC, statusInfoRef);
	}
	else {
		// If manual timeout exists, clear that timeout, so that it does not fire later.
		if (statusInfoRef.manual_Offline.timeOutRef) clearTimeout(statusInfoRef.manual_Offline.timeOutRef);

		// If Manual Online, simply perform the check..
		statusInfoRef.manual_Offline.enabled = false;
		ConnManagerNew.appModeSwitchRequest(statusInfoRef);
	}
};


// ===============================================
// --- UI section ----

ConnManagerNew.update_UI = function (statusInfo) {
	// update MODE for PWA - cascade throughout app (rebuild menus + repaint screens where required)
	//if ( !SessionManager.getLoginStatus() ) else {}
	ConnManagerNew.update_UI_LoginStatusIcon(statusInfo);
	ConnManagerNew.update_UI_NetworkIcons(statusInfo);

	ConnManagerNew.update_UI_statusDots(statusInfo);
};


ConnManagerNew.update_UI_LoginStatusIcon = function (statusInfo) {
	// update loginScreen logo (grayscale = offline): offline indicator before logging in
	var loginHeaderTag = $('.login_header');

	if (ConnManagerNew.isAppMode_Online()) loginHeaderTag.removeClass('logoOffline');
	else loginHeaderTag.addClass('logoOffline');
};


ConnManagerNew.update_UI_NetworkIcons = function (statusInfo) {
	var networkServerConditionsGood = ConnManagerNew.isAppMode_Online();

	var imgSrc = (networkServerConditionsGood) ? 'images/cloud_online_nav.svg' : 'images/cloud_offline_nav.svg';

	$('#imgNetworkStatus').attr('src', imgSrc);

	//$( '#divNetworkStatus' ).css( 'display', 'block' );
};


ConnManagerNew.update_UI_statusDots = function (statusInfo) {
	//var divStatusDot_networkTag = $( '#divStatusDot_network' );
	var divStatusDot_networkStableTag = $('#divStatusDot_networkStable');
	var divStatusDot_serverTag = $('#divStatusDot_server');

	//ConnManagerNew.setStatusCss( divStatusDot_networkTag, statusInfo.networkConn.online_Current );
	ConnManagerNew.setStatusCss(divStatusDot_networkStableTag, statusInfo.networkConn.online_Stable);
	ConnManagerNew.setStatusCss(divStatusDot_serverTag, statusInfo.serverAvailable);
};


ConnManagerNew.setStatusCss = function (tag, isOn) {
	var colorStr = (isOn) ? '#F5F5F5' : 'transparent';	//'lightGreen' : 'red'
	tag.css('background-color', colorStr);
};

// ===============================================