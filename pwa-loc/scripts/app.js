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

//App.username = "";
App.appInstallBtnTag;
App.ver14 = false;

App.paramsJson = {}; // Load all params data in here and get them from here.
App.paramName_keyCloakRemove = 'keyCloakRemove';
App.paramName_authPage = 'authPage';
App.paramName_authChoice = 'authChoice';

// -------------------------------

App.run = function () 
{
	App.appInstallBtnTag = $('.appInstall');

	// NEW
	App.paramsJson = App.paramsHandler_ReloadApp( window.location.href );

	if ( App.getParamVal_ByName( 'ver', { deleteInLS: true } ) === '1.4' ) App.ver14 = true;
	
	// --------------------------
	// Default Behavior Modify
	App.windowEvent_BlockBackBtnAction();
	window.addEventListener('error', App.catchErrorInCustomLog);
	window.addEventListener('beforeinstallprompt', App.beforeinstallprompt);
	if (App.isMobileDevice()) App.mobileUISetup();

	InfoDataManager.setDeviceInfo_OnStart( App.checkDeviceMinSpec );
	InfoDataManager.setAppStartData();
	
	// Setup Static Classes
	MsgManager.initialSetup();

	// Instantiate Classes
	SessionManager.cwsRenderObj = new cwsRender();  // Global Reference to cwsRenderObj..

	PersisDataLSManager.initialDataLoad_LocalStorage();
	AppInfoLSManager.initialDataLoad_LocalStorage();

	App.App_UI_startUp_loading(); // << should we move this into cwsRender?


	// By param 'debug' with pwd - uses AppInfoLSManager
	DevHelper.checkNStartDebugConsole();

	var paramMsg = App.getParamVal_ByName( 'msg', { deleteInLS: true } );
	if ( paramMsg ) MsgManager.msgAreaShowOpt( paramMsg, { hideTimeMs: 4000 } );

	// KeyCloak Start Object + Param case removal
	KeycloakManager.startUp();

	if ( App.getParamVal_ByName( App.paramName_keyCloakRemove, { deleteInLS: true } ) ) 
	{ 
		KeycloakManager.removeKeyCloakInUse(); 
		KeycloakManager.localStorageRemove(); 
	}

	// Service Worker Related Initial Setup
	SwManager.initialSetup(function () 
	{
		//App.App_UI_startUp_Progress('40%');
		App.startAppProcess();

		console.log( 'AppStart statusInfo.appMode: ' + ConnManagerNew.statusInfo.appMode );
		SwManager.checkAppUpdate( '[AppUpdateCheck] - App startUp' );
	});
};

// ----------------------------------------------------
App.startAppProcess = function () 
{
	try 
	{
		// --------------------
		// 1. SET UP PHASE
		WsCallManager.setWsTarget();

		ConnManagerNew.createNetworkConnListeners();
		//App.App_UI_startUp_Progress('50%');

		// --------------------
		// 2. START PHASE
		// EVENT SETUP - TODO: Could be placed in cwsRender <-- Or menu setup area..  Not here..
		ConnManagerNew.cloudConnStatusClickSetup($('#divNetworkStatus'));

		// Start Connection..
		ConnManagerNew.appStartUp_SetStatus();

		// Start the scheduling on app start
		ScheduleManager.runSchedules_AppStart();

		//App.App_UI_startUp_Progress('70%');

		// --------------------
		// 3. FINISH APP START PHASE
		App.App_syncIcon_UI_event();
		//App.App_UI_startUp_Progress('80%');

		SessionManager.cwsRenderObj.render();
		//App.App_UI_startUp_Progress('100%');

		App.App_UI_startUp_ready();


		// KeyCloak Run..
		if ( KeycloakManager.isKeyCloakInUse() ) KeycloakManager.keycloakPart()
	}
	catch (err) {
		console.log('error starting App > startApp() error: ' + err);
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

	window.addEventListener('popstate', function (event) {
		history.pushState(null, document.title, location.href);

		var backBtnTags = $('.btnBack:visible');

		if (backBtnTags.length > 0) {
			//backBtnTags.click();
			backBtnTags.first().click();
		}
		else {
			MsgManager.msgAreaShow('Back Button Click Blocked!!');
		}

	});
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


App.checkDeviceMinSpec = function( info )
{
	try
	{
		if ( info.storage )
		{
			var notPass = false;
	
			var minSpec = InfoDataManager.INFO.deviceMinSpec;  // Only test this once...
			//var currSpec = { memory: info.memory, storage: App.getStorageGB() };
			
			if ( info.memory < minSpec.memory ) 
			{
				notPass = true;
			}
	
			if ( info.storage.quota < ( minSpec.storage * 1000000000 ) )
			{
				notPass = true;
			}
	
			if ( notPass )
			{
				// If POTerm exists (in local storage), translate it..
				detectIncognito().then(function(result) 
				{
					if (result.isPrivate) console.log( '-- In Incognito Mode --' );
					else {
						var msg = 'This device is in either Incognito Mode, \n OR does not meet the minimum spec. \n [Min: ' + JSON.stringify( minSpec ) 
						+ ', Curr: { memory: ' + info.memory + ', storage: ' + AppUtil.getStorageGBStr( info.storage.quota ) + ' }]';		
						alert( msg );
					}
				}).catch(function(error) {  console.log(error);  });
			}
		}	
	}
	catch( errMsg )
	{
		console.log( 'ERROR in InfoDataManager.setDeviceInfo_OnStart, ', errMsg );
	}
};


// ------------------------
// -- Param Related

App.paramsHandler_ReloadApp = function( urlStr )
{
	var paramsLoadJson = {};

	// If param exists, save it on oneTime storage and reload the app..
	var paramObj = Util.getParamObj( urlStr );

	// CASE 1. If Params exists in url, store in LS, and reload app.
	if ( Object.keys( paramObj ).length > 0 )
	{
		var existingParamJson = LocalStgMng.getJsonData( 'paramsLoad' );
		if ( !existingParamJson ) existingParamJson = {};

		if ( paramObj[ App.paramName_keyCloakRemove ] === 'Y' ) paramObj.noReload = 'Y';

		LocalStgMng.saveJsonData( 'paramsLoad', Util.mergeJson( paramObj, existingParamJson ) );

		if ( paramObj.noReload === 'Y' ) { console.log( 'url param reload skipped' ); }
		else AppUtil.appReloadWtMsg( 'Reloading For Params Removal From URL..' );
	}


	// CASE 2. If LS has 'paramsLoad', save it on paramsObj
	if ( LocalStgMng.getJsonData( 'paramsLoad' ) )
	{
		paramsLoadJson = LocalStgMng.getJsonData( 'paramsLoad' );

		if ( paramsLoadJson.action === 'clientDirect' && paramsLoadJson.client ) MsgManager.msgAreaShowErrOpt( 'ClientDirect URL Param Used: ' + paramsLoadJson.client, { hideTimeMs: 7000, styles: 'background-color: green;' } );
	}

	return paramsLoadJson;
};

App.getParamVal_ByName = function( name, option )
{
	if ( !option ) option = {};
	if ( option.deleteInLS ) App.delete_ParamsInLS( name );

	return ( App.paramsJson && App.paramsJson[ name ] ) ? App.paramsJson[ name ]: undefined;
};

App.delete_ParamsInLS = function( propName )
{
	var existingParamJson = LocalStgMng.getJsonData( 'paramsLoad' );
	if ( !existingParamJson ) existingParamJson = {};

	if ( existingParamJson[ propName ] )
	{
		delete existingParamJson[ propName ];
		LocalStgMng.saveJsonData( 'paramsLoad', existingParamJson );
	}
};


App.getClientDirectId = function( actionParamName, clientParamName )
{
	var clientDirectId = '';

   if ( App.getParamVal_ByName( actionParamName ) === 'clientDirect' )
	{
		clientDirectId = App.getParamVal_ByName( clientParamName );
	}

	return clientDirectId;
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

