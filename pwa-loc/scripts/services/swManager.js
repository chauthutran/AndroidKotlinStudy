// -------------------------------------------
// -- Service Worker Manager Class/Methods
//	  - Register Service Worker and setup app updates
//  App Update Detect Feature:
//      - 4 places it does detect..
//      1. At App Start
//      2. At manual check button click
//      3. At log out
//      4. At login 1st activity.. (NotYet)
//          - In all tags in login page, if there is a focus, initiate the check, but only on 1st focus..
//            Thus, we need a flag.. (within login obj)  
//               And the flag gets reset when it 'renders' again?
//
// -----------------------------------------
function SwManager() { };

SwManager.swFile = './service-worker.js';

SwManager._newUpdateInstallMsg_interval = 30000;  //30 seconds
SwManager._afterLogin_updateSecondsOver = 5;    // 5 seconds
SwManager.lastAppFileUpdateDt;
//SwManager.isApp_standAlone = false;

SwManager.swRegObj;
SwManager.swInstallObj;
SwManager.swSupported = false;
SwManager.newRegistration = false;
SwManager.registrationState;
SwManager.registrationUpdates = false;
//SwManager.newAppFilesFound = false;
SwManager.newAppFileExists_EventCallBack;

SwManager.interval_newAppFileDownloading;
SwManager.newAppFileDownloadingMsgTimeMs = 30000;  // 30 seconds

SwManager.installStateProgress = {
	'installing': '1/4',
	'installed': '2/4',
	'activating': '3/4',
	'activated': '4/4'
};

SwManager.debugMode = false;

SwManager.waitNewAppFileCheckDuringOffline = false;

//SwManager.swUpdateCase = false;

SwManager._swStage1 = '[SW1 CHK] - ';
SwManager._swStage2 = '[SW2 ONUPDATEFOUND] - ';
SwManager._swStage3 = '[SW3 CHK] - ';

// --------------------------------------------

SwManager.initialSetup = function (callBack) {
	// checkRegisterSW
	if (('serviceWorker' in navigator)) {
		SwManager.runSWregistration(callBack);
	}
	else {
		alert('SERVICE WORKER not supported. Cannot continue!');
	}
};


// --------------------------------------------

// 1. main one
SwManager.runSWregistration = function (callBack) {
	navigator.serviceWorker.register(SwManager.swFile).then(registration => {
		SwManager.swRegObj = registration;

		// If fresh registration case, we use 'callBack'..
		SwManager.createInstallAndStateChangeEvents(SwManager.swRegObj); //, callBack );

		callBack();

	}).catch(err =>
		// MISSING TRANSLATION
		MsgManager.notificationMessage('SW ERROR: ' + err, 'notifDark', undefined, '', 'left', 'bottom', 5000)
	);
};


SwManager.createInstallAndStateChangeEvents = function (swRegObj) //, callBack ) 
{
	// 1st time running SW registration (1st time running PWA)    
	if (!swRegObj.active) { SwManager.newRegistration = true; SwManager.registrationState = 'sw: new install'; }
	else { SwManager.newRegistration = false; SwManager.registrationState = 'sw: existing'; }

	// SW update change event 
	swRegObj.onupdatefound = () => {
		SwManager.swInstallObj = swRegObj.installing;

		SwManager.appUpdateUI_DownloadingNewFiles_wtMsg(); // Top Left Dot blinking.. + Msg show 3 seconds

		// sw state changes 1-4 (ref: SwManager.installStateProgress )
		SwManager.swInstallObj.onstatechange = () => {
			SwManager.registrationUpdates = true;
			console.log(SwManager._swStage2 + 'state: ' + SwManager.swInstallObj.state);

			switch (SwManager.swInstallObj.state) {
				case 'installing':
					// SW installing (1) - applying changes
					//console.log( SwManager._swStage2 + '1. installing!' );                    
					break; // do nothing

				case 'installed':
					// SW installed (2) - changes applied
					//console.log( SwManager._swStage2 + '2. installed!' );
					SwManager.appUpdateUI_Downloaded_NewFiles();
					break;

				case 'activating':
					// SW activating (3) - starting up 
					break; // do nothing

				case 'activated':
					// SW activated (4) - start up completed: ready
					break;
			}
		};
	};

	// This gets triggered after the new files are downloaded already...  Anyway to show 'download in progress'?
	navigator.serviceWorker.addEventListener('controllerchange', (e) => {
		// The oncontrollerchange property of the ServiceWorkerContainer interface is 
		// an event handler fired whenever a controllerchange event occurs 
		//  — when the document's associated ServiceWorkerRegistration acquires a new active worker.
		console.log(SwManager._swStage3 + '3. ControllerChange DETECTED');

		// App is in process of reloading/refersh/restarting.  No need to perform restart
		if (AppUtil.appReloading) console.log(SwManager._swStage3 + 'App Intentional Reloading -> DISGARDING THIS MANUAL UPDATE CALL.');
		else // if ( SwManager.swUpdateCase )
		{
			// NOTE: Thus, this gets called whenever there is a page reload.
			// --> ONLY display the message or run this if we called for reload or app Check...
			if (SessionManager.cwsRenderObj) SessionManager.cwsRenderObj.showNewAppAvailable(true);
			if (SwManager.newAppFileExists_EventCallBack) {
				try {
					SwManager.newAppFileExists_EventCallBack();
				} catch (errMsg) { console.log(SwManager._swStage3 + 'ERROR in SwManager.controllerchange, ' + errMsg); }
			}

			if (!SwManager.swUpdateOption) SwManager.swUpdateOption = {};

			// 'About page' app update uses above '_EventCallBack'
			var delayReload = (SwManager.swUpdateOption.delayReload) ? true : false;
			if (!delayReload && SwManager.checkSecondsOverAfterLogin(SwManager._afterLogin_updateSecondsOver)) delayReload = true; // If over 5 seconds after login, do not reload app for update apply - delay it. 

			// For Already logged in, simply delay it --> which the logOut will perform the update.
			if (delayReload) {
				console.log(SwManager._swStage3 + 'App Reload Delayed - After Installing New Update.');
				e.preventDefault();  // WHY USE THIS?
				return false;
			}
			else {
				// If Not logged in, perform App Reload to show the app update - [?] add 'autoLogin' flag before triggering page reload with below 'appReloadWtMsg'.
				var newMsg = 'App Reloading - New Update Installed.';
				console.log(SwManager._swStage3 + newMsg);
				AppUtil.appReloadWtMsg(newMsg);
			}
		}
	});


	navigator.serviceWorker.addEventListener('message', event => {
		if (event.data) {
			var msgData = JSON.parse(event.data);

			if (!msgData.options) msgData.options = {};

			if (msgData.type === 'jobFiling' && msgData.options.target === 'jobAidPage') JobAidPage.jobFilingUpdate(msgData);
			if (msgData.type === 'jobFiling') JobAidHelper.JobFilingProgress(msgData); // JobAidHelper.JobFilingFinish( msgData.msg );
			else if (msgData.msg) MsgManager.msgAreaShow(msgData.msg);
		}
	});

};

// -----------------------------------

SwManager.checkNewAppFile_OnlyOnline = function (runFunction, option) {
	if (!option) option = {};
	// 'checkTypeTitle' Use on below actual msg.
	if (!option.checkTypeTitle) ption.checkTypeTitle = 'UNKNOWN CHECK TYPE';

	SwManager.newAppFileExists_EventCallBack = runFunction;
	//SwManager.swUpdateCase = false;
	SwManager.swUpdateOption = option;

	// Trigger the sw change/update check event..
	if (SwManager.swRegObj) {
		var checkTooClose = false;

		// If it has not passed 1 min since last check, do not proceed.
		if (!option.noMinTimeSkip && SwManager.lastAppFileUpdateDt && UtilDate.getTimeSince(SwManager.lastAppFileUpdateDt, Util.MS_MIN) < 1) checkTooClose = true;

		// NEW: Check last check dateTime and compare..
		if (checkTooClose) console.log(SwManager._swStage1 + option.checkTypeTitle + ' --> Too Frequent Checks, SKIPPED.');
		else {
			SwManager.lastAppFileUpdateDt = new Date().toISOString();
			console.log(SwManager._swStage1 + option.checkTypeTitle + ' --> UPDATES CHECKING..');

			//SwManager.swUpdateCase = true;
			SwManager.swRegObj.update();
		}
	}
	else {
		console.log(SwManager._swStage1 + option.checkTypeTitle + ' --> SwManager.swRegObj not available!');
	}
};


// Wrapper/ShortCut to 'checkNewAppFile_OnlyOnline'
SwManager.checkAppUpdate = function (checkTypeTitle, option, runFunction) {
	if (!option) option = {};

	if (checkTypeTitle) option.checkTypeTitle = checkTypeTitle;

	if (option.skipCheckOnline || ConnManagerNew.isAppMode_Online()) SwManager.checkNewAppFile_OnlyOnline(runFunction, option);
	else console.log('OFFLINE - AppUpdateCheck not performed - ' + checkTypeTitle);
};


// NOTE: Only do this if new refresh?
SwManager.refreshForNewAppFile_IfAvailable = function () {
	var spanLoginAppUpdateTag = $('#spanLoginAppUpdate');
	if (spanLoginAppUpdateTag.is(':visible')) spanLoginAppUpdateTag.click();
};


SwManager.checkSecondsOverAfterLogin = function (secondsAfter) {
	var isOver = false;

	try {
		// If 5 seconds passed after login, delay the app reload after app files update.
		if (SessionManager.getLoginStatus()) {
			if (UtilDate.getTimeSince(AppInfoLSManager.getLastOnlineLoginDt(), Util.MS_SEC) > secondsAfter) isOver = true;
		}
	}
	catch (errMsg) {
		console.log('ERROR in SwManager.checkSecondsAfterLogin, ' + errMsg);
	}

	return isOver;
};

// -----------------------------------

// Not used, but might later..
SwManager.newSWrefreshNotification = function () {
	// new update available
	var btnUpgrade = $('<a class="notifBtn" term=""> REFRESH </a>');

	// move to cwsRender ?
	btnUpgrade.click(() => { AppUtil.appReloadWtMsg(); });

	MsgManager.notificationMessage('Updates installed. Refresh to apply', 'notifDark', btnUpgrade, '', 'right', 'top', 25000);
};


// NEED TO CONFIRM/REVIEW/REDO THIS METHOD!!
// Restarting the service worker...
SwManager.reGetAppShell = function (callBack) {
	if (SwManager.swRegObj) {
		SwManager.swRegObj.unregister().then(function (boolean) {
			MsgManager.notificationMessage('SW UnRegistered', 'notifDark', undefined, '', 'left', 'bottom', 1000);

			if (callBack) callBack();
			else AppUtil.appReloadWtMsg();
		})
			.catch(err => {
				// MISSING TRANSLATION
				MsgManager.notificationMessage('SW ERROR: ' + err, 'notifDark', undefined, '', 'left', 'bottom', 5000);

				setTimeout(function () {
					if (callBack) callBack();
					else AppUtil.appReloadWtMsg();
				}, 100)
			});
	}
	else {
		// MISSING TRANSLATION
		MsgManager.notificationMessage('SW unavailable - restarting app', 'notifDark', undefined, '', 'left', 'bottom', 5000);
		setTimeout(function () {
			AppUtil.appReloadWtMsg();
		}, 100)
	}
};

// -----------------------------------

// SwManager.listFilesInCache( 'jobTest2' );
SwManager.listFilesInCache = function (cacheKey) {
	//caches.keys().then( function( keyList ) 
	caches.open(cacheKey).then(cache => {
		cache.keys().then(keys => {
			keys.forEach(request => {
				console.log(Util.getUrlLastName(request.url));
			});
		});
	});
};

// --------------------------------------

SwManager.appUpdateUI_DownloadingNewFiles_wtMsg = function () {
	var dotPlusingTag = `<div class="lv-dots lv-mid sd" ><div></div><div></div><div></div><div></div></div>`;

	var newUpdateMsg = 'New App Updates Downloading';
	console.log(SwManager._swStage2 + newUpdateMsg);

	var msgTag = MsgManager.msgAreaShowOpt('<span>' + newUpdateMsg + '</span>', { styleArr: [ { name: 'background-color', value: '#50A3C6' } ], hideTimeMs: 45000, tdMid: dotPlusingTag });
	msgTag.attr('noticeId', 'downloading').find('.tdMsg').css('padding', '');
};

SwManager.appUpdateUI_Downloaded_NewFiles = function () {
	//clearInterval(SwManager.interval_newAppFileDownloading);
	//$('.appUpdateStatusDiv').hide();
};

