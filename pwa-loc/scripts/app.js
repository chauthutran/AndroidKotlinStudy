// ------------------------  [Ideally]
// 1. run ServiceWorker
// 2. set up DWS connection settings for API calls
// 3. start connectionManager (+ scheduler)
// 4. run other things (memory swap?)

// NOTE:
//    - app() does not need to be instance..
//  Re-Organize:
//  1. From index.html, we load all files
//      and then, call new app();  app.start();
//      - basically combining 'app' class and 'cwsRender' class.
//  2. On the start, it will 
//    - register windows event
//    - start the service worker manager class (regiser (grab the working ones..) / monitor it)
//    - start other services
//    and do 'render()'

function App() { };

App.hrefBase = Util.removeLastMatchChar( window.location.href.split("?")[0], '/' );
App.paramObj = Util.getParamObj( window.location.href );
App.blockMultipleUsageMsg = 'Another Brower Tab is already using this app, ' + App.hrefBase + '.  Multiple tab usage is blocked for this app.';

if ( App.paramObj[ 'blockMultipleUsage' ] !== 'Y' )
{
	const bc = new BroadcastChannel( App.hrefBase );

	bc.onmessage = (event) => {
	if (event.data === 'CheckDuplicateTabCase' ) {
		bc.postMessage('FoundAlreadyExitingTab');
		console.log(`Another tab of this site just got opened`);
	}
	if (event.data === 'FoundAlreadyExitingTab' ) 
	{
			if ( App.paramObj[ 'blockMultipleUsage' ] !== 'Y' )
			{
				alert( App.blockMultipleUsageMsg );
				window.location = App.hrefBase + '?blockMultipleUsage=Y';	
			}
	}
	};

	bc.postMessage('CheckDuplicateTabCase');
}


//App.username = "";
App.appInstallBtnTag;
App.ver14 = false;

App.byPass_BrwsBackBtnActionBlock = false;
// -------------------------------

App.run = function () 
{
	if ( App.paramObj[ 'blockMultipleUsage' ] === 'Y' )
	{
		console.log( App.blockMultipleUsageMsg );
		var issueDivTag = $( '<div class="msg" style="padding: 15px; font-size: 19px;"></div>' );
		issueDivTag.text( App.blockMultipleUsageMsg );
		$( 'body' ).prepend( issueDivTag );		

		return;
	}

	App.appInstallBtnTag = $('.appInstall');

	// --------------------------
	// Default Behavior Modify
	App.windowEvent_BlockBackBtnAction();
	window.addEventListener('error', App.catchErrorInCustomLog);
	window.addEventListener('beforeinstallprompt', App.beforeinstallprompt);
	if (App.isMobileDevice()) App.mobileUISetup();

	InfoDataManager.setDeviceInfo_OnStart( AppUtil.checkDeviceMinSpec );
	InfoDataManager.setAppStartData();
	
	// Setup Static Classes
	MsgManager.initialSetup();


	// [NEW, MOVED]  --- LocalStorage Class Initialize
	PersisDataLSManager.initialDataLoad_LocalStorage();
	AppInfoLSManager.initialDataLoad_LocalStorage();

	ConfigManager.setSourceType_fromAppInfoLS(); // Used by 'WsCallManager.serverAvailable()' which starts from	'ScheduleManager.runSchedules_AppStart()' at below steps.


	// --- Param Handling ( Get params from url, save it on LocalStorage(Persist), remove from url, reload if needed )
	AppUtil.paramsJson = AppUtil.saveMerge_LSParamsLoad( App.paramObj ); // CleanUp Url (remove params), & Reload Page

	// TODO: Move this part / Hide this part into other Class/Method..
	if ( AppUtil.paramsJson.pageReloadCase )
	{
		// If 'AuthChoice' or 'AuthPage' Case, perform KeyCloak Auth 'Check & LogOut'?
		if ( AppUtil.paramsJson.AuthChoiceCase || AppUtil.paramsJson.AuthPageCase )
		{
			DataManager2.deleteAllStorageData( () => 
			{ 
				console.log( 'Delete Existing Data - due to authChoice/authPage param in url.' ); 				
	
				var logoutCase = KeycloakManager.checkAndLogout( true ); // LogOut if keycloak related info exists.

				if ( !logoutCase ) AppUtil.appReloadWtMsg( 'Reloading For AuthPage/AuthChoice - After Deleting Current Data..' );
			});
		}
		else AppUtil.appReloadWtMsg( 'Reloading For Params Removal From URL..' );
	}
	else
	{
		// 'action': 'clientDirect' & 'client' will be used in later phase - opening client when rendering.
		// In here, simply show msg.
		if ( AppUtil.paramsJson.action === 'clientDirect' && AppUtil.paramsJson.client ) MsgManager.msgAreaShowOpt( 'ClientDirect URL Param Used: ' + AppUtil.paramsJson.client, { hideTimeMs: 7000, styles: 'background-color: green;' } );

		if ( AppUtil.getParamVal_ByName( 'ver', { deleteInLS: true } ) === '1.4' ) App.ver14 = true;
	
	
		// Instantiate Classes
		SessionManager.cwsRenderObj = new cwsRender();  // Global Reference to cwsRenderObj..
	
		WsCallManager.setWsTarget();


		AppUtil.param_showMsg( 'msg' );
		AppUtil.param_keyCloakUsage_ForceRemove( AppUtil.paramName_keyCloakRemove );
		AppUtil.param_authChiocePage_DataSet( AppUtil.paramName_authPage, AppUtil.paramName_authChoice, function() {
			// In the "exec_AuthChoicePageCase" function, we did run KeycloakManager.checkAndLogout(),
			// so we don't need to run one more time here
			// KeycloakManager.checkAndLogout();
		}); 
		
		App.App_UI_startUp_loading(); // << should we move this into cwsRender?
	
		// By param 'debug' with pwd - uses AppInfoLSManager
		DevHelper.checkNStartDebugConsole();
	
		// Service Worker Related Initial Setup
		SwManager.initialSetup(function () 
		{
			//App.App_UI_startUp_Progress('40%');
			App.startAppProcess();
	
			console.log( 'AppStart statusInfo.appMode: ' + ConnManagerNew.statusInfo.appMode );
			SwManager.checkAppUpdate( '[AppUpdateCheck] - App startUp' );
		});		
	}
};

// ----------------------------------------------------
App.startAppProcess = function () 
{
	try 
	{
		INFO.AppChangeDeploy = [ 
			{ 	id: "MongoUpgradeMsg", startDT_UTC: "2024-02-06T05:45:19.668Z", endDT_UTC: "2024-02-18T23:59:59.668Z",
				atLoginFormOpen: [ 
					" var tag = $( '#login_inform_msg' ); ",

					" if ( ConfigManager.isSourceTypeMongoOrFhir() ) ", 
					" { ",
					"   var msg = 'During Feb 17 (Sat) ~ Feb 18 (Sun), due to mongoDB upgrade, WFA App will only operate in offline mode.'; ",
					"   tag.text( msg ).show(); ",
					"   MsgManager.msgAreaShowOpt( msg, { hideTimeMs: 36000000, styles: 'background-color: orange;' }); ",
					" } ",
					" else tag.text( '' ).hide(); "
		 		] 
			} 
		];


		// --------------------
		// 1. SET UP PHASE
		ConnManagerNew.createNetworkConnListeners();
		//App.App_UI_startUp_Progress('50%');

		KeycloakManager.clazzInitialSetup();

		// --------------------
		// 2. START PHASE
		// EVENT SETUP - TODO: Could be placed in cwsRender <-- Or menu setup area..  Not here..
		ConnManagerNew.cloudConnStatusClickSetup($('#divNetworkStatus'));

		// Start Connection..
		ConnManagerNew.appStartUp_SetStatus();

		// Start the scheduling on app start
		ScheduleManager.runSchedules_AppStart();


		// --------------------
		// 3. FINISH APP START PHASE
		App.App_syncIcon_UI_event();
		//App.App_UI_startUp_Progress('80%');

		SessionManager.cwsRenderObj.render();
		//App.App_UI_startUp_Progress('100%');

		App.App_UI_startUp_ready();

		// Do Keycloak authentication here
		if ( KeycloakManager.isKeyCloakInUse() ) {
			KeycloakManager.setUpkeycloakPart();
		}


		// --------------------
		// 4. TEST INFO

		// Run AppChangeDeploy - 'atAppStartEval'  
		AppUtil.runAppChangeDeploy( 'atAppStartEval' );
	}
	catch ( errMsg ) {
		console.log( 'ERROR on starting App > startApp() error: ' + errMsg );
		MsgManager.msgAreaShowErrOpt( 'ERROR on App Starting: ' + errMsg );
	}
};


// ------------------------------

App.App_UI_startUp_loading = function () {
	// show PWA (loading) screen
	MsgFormManager.appBlockTemplate( 'appLoad' );
	//App.App_UI_startUp_Progress('10%');
};


App.App_UI_startUp_ready = function () {
	// hide PWA (loading) screen: timeout used for delay (UI effect)
	setTimeout(function () {
		MsgFormManager.appUnblock( 'appLoad' );
	}, 300);
};


//App.App_UI_startUp_Progress = function (perc) {  $('div.startUpProgress').css('width', perc);  };


App.App_syncIcon_UI_event = function () {
	SyncManagerNew.setAppTopSyncAllBtnClick();
};

// ---------------------------------------

App.windowEvent_BlockBackBtnAction = function () {
	// Method 1
	history.pushState(null, document.title, location.href);

	window.addEventListener('popstate', AppUtil.popStateCall );
	// NEED TO WORK ON SCROLL DOWN TO REFRESH BLOCKING
	// https://stackoverflow.com/questions/29008194/disabling-androids-chrome-pull-down-to-refresh-feature
};


App.detectStandAlone = function () {
	if (window.matchMedia('(display-mode: standalone)').matches) {
		// console.log( "Running as standalone." );
	}
};


App.catchErrorInCustomLog = function (e) {
	// const { message, source, lineno, colno, error } = e; 
	console.log(e.message);
};


App.setUpAppInstallNotReadyMsg = function () {
	App.appInstallBtnTag.off('click').click(function () {
		MsgManager.msgAreaShow('App is already installed in this device.');
	});
};


App.beforeinstallprompt = function (e) {
	// appInstallTag.show();  - not needed since we made it always visible
	App.appInstallBtnTag.css('background-color', 'tomato');

	var deferredPrompt = e;

	App.appInstallBtnTag.off('click').click(function () {
		deferredPrompt.prompt();

		App.appInstallBtnTag.hide();

		// Wait for the user to respond to the prompt
		deferredPrompt.userChoice.then((choiceResult) => {
			if (choiceResult.outcome === 'accepted') console.log('User accepted the A2HS prompt');
			else console.log('User dismissed the A2HS prompt');

			deferredPrompt = null;
		});

	});

};


App.isMobileDevice = function () {
	return (Util.isAndroid() || Util.isIOS());
}

App.mobileUISetup = function () {
	//App.mobileCssSetup();
	$('html > head').append('<style> #pageDiv { padding: 4px 2px 0px 2px !important; }</style>');

	App.browserResizeHandle();  // For keyboard resizing on mobile, and other resize blinker move..	
}

// TODO: HOW IS THIS APPLIED TO NEW LOGIN PAGE 4 DIGIT PIN?
App.browserResizeHandle = function () {
	// Track width+height sizes for detecting android keyboard popup (which triggers resize)
	$('body').attr('initialWidth', $('body').css('width'));
	$('body').attr('initialHeight', $('body').css('height'));

	// Set defaults for Tags to be hidden when keyboard triggers resize
	$('#ConnectingWithSara').addClass('hideOnKeyboardVisible');
	$('#advanceOptionLoginBtn').addClass('hideOnKeyboardVisible');

	// Window Resize detection
	$(window).on('resize', function () {

		// TODO: Could do login page visible further detection!!!
		if ($('#pass').is(':visible'))   // !SessionManager.getLoginStatus() )
		{
			//InitialWidth = $( 'body' ).attr( 'initialWidth' );
			initialHeight = $('body').attr('initialHeight');

			// height ( change ) only value we're interested in comparing
			if ($('body').css('height') !== initialHeight)  //|| $( 'body' ).css( 'width' ) !== $( 'body' ).attr( 'initialWidth' ) 
			{
				//$( 'div.login_title').find( 'h1' ).html( 'IS keyboard' ); //console.log( 'IS keyboard' );
				$('.hideOnKeyboardVisible').hide();
			}
			else {
				//$( 'div.login_title').find( 'h1' ).html( 'not keyboard' ); //console.log( 'not keyboard' );
				$('.hideOnKeyboardVisible').show();
			}

		}
	});
};


// ===========================
// [JOB_AID]    
window.addEventListener('message', function ( event ) 
{
	// Have App stay active if 'message' is received
	// Start with jobAid logoutTimer (increased one)
	// Look into the existing index1.html

	InputUtil.updateLogoutTimer();
	
	// NOTE: in below case, from jobAid, add another indicator to set 'jobAideTimeOut', which (within 'updateLogoutTimer') can be used if 'jobAideTimeOut' value is not empty.
	if ( event.data.from === 'jobAidIFrame' ) JobAidHelper.msgHandle( event.data );
});

