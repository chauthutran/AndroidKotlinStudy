// -------------------------------------------
// -- Login Class/Methods
//
//  - Collect userName input and pin in real time..
//		- use it on 'render' as needed (load it.)
//		- clear on render..
// 
// -------------------------------------------- 
function Login( cwsRenderObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;

	me.loginFormDivTag = $( '#loginFormDiv' );
	me.pageDivTag = $( '#pageDiv' );	// Get it from cwsRender object?
	//me.navTitleTextTag = $( '.Nav__Title' );
	//me.pageTitleDivTab = $( 'div.logo-desc-all' );
	//me.scrimTag = $('.scrim');
	//me.sheetBottomTag = $('.sheet_bottom');

	me.loginBtnTag = $( '.loginBtn' );
	me.passRealTag = $( '#passReal' );
	me.loginUserNameTag = $( '.loginUserName' );
	me.loginUserPinTag = $( '.loginUserPin' );
	me.loginFormTag = $( 'div.login_data' );
	me.advanceOptionLoginBtnTag = $( '#advanceOptionLoginBtn' );

	me.loginPinClearTag = $( '#loginPinClear' );
	me.loginFieldTag = $( '#loginField' );

	// ------------

	// Flags
	me.lastPinTrigger = false;
	me.loginPage1stTouchFlag = false;
	me.loginBtn_NotHideFlag = false;

	me.current_userName = "";	// Used to load the userName/password when it got refreshed by mistake - or by appUpdate
	me.current_password = {};
	
	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setEvents_OnInit();
	}

	me.render = function()
	{	
		// In test version with special url param, do not hide login buttons
		me.testVersion_LoginBtn_NotHide( window.location.href, 'test', 'Y' );

		me.appVersionInfoDisplay();

		me.openForm();  // with reset Val

		me.mobileCssSetup();

		me.browserResizeHandle();  // For keyboard resizing on mobile, and other resize blinker move..
		
		//FormUtil.positionLoginPwdBlinker();

		// Translate the page..
		TranslationManager.translatePage();

		// Perform autoCheckIn Flag (dateTimeStr), and run the auto checkIn..
		me.autoLoginCheck( function() {
			me.populateSessionPin();
			me.lastPinTrigger = true;
			me.loginBtnTag.click();
		});

		// If AppUpdate Refresh happened during Login, restore the current key typings
		me.tempCurrentKeysRestore();
	};

	// -----------------------------------

	
	// =============================================
	// === TEMP CURRENT KEYS RESTORE RELATED =======
	
	me.tempCurrentKeysRestore = function()
	{
		me.resetLoginCurrentKeys();

		var tempCurrentKeys = AppInfoManager.getLoginCurrentKeys();
		if ( tempCurrentKeys )
		{
			// load the keys to login page..
			me.restoreLoginKeys( tempCurrentKeys );

			AppInfoManager.clearLoginCurrentKeys();
		}
	};


	// This method is used by 'swManager'
	me.getLoginCurrentKeys = function()
	{
		return { 'userName': me.current_userName, 'password': me.current_password };
	};

	me.resetLoginCurrentKeys = function()
	{
		me.current_userName = '';
		me.current_password = {};		
	};

	me.restoreLoginKeys = function( keysJson )
	{
		if ( keysJson.keys )
		{
			if ( keysJson.keys.userName	) me.loginUserNameTag.val( keysJson.keys.userName );
			if ( keysJson.keys.password	) me.restoreCurrentPassword( keysJson.keys.password );
		}
	};
	
	me.getCurrentPassword = function()
	{
		var splitPasswordTag = $( '.split_password' );

		return { 
			'p1': splitPasswordTag.find( '.pin1' ).val()
			,'p2': splitPasswordTag.find( '.pin2' ).val()
			,'p3': splitPasswordTag.find( '.pin3' ).val()
			,'p4': splitPasswordTag.find( '.pin4' ).val()
		};
	};

	me.restoreCurrentPassword = function( pwdJson )
	{
		var splitPasswordTag = $( '.split_password' );

		if ( pwdJson )
		{
			if ( pwdJson.p1 ) splitPasswordTag.find( '.pin1' ).val( pwdJson.p1 );
			if ( pwdJson.p2 ) splitPasswordTag.find( '.pin2' ).val( pwdJson.p2 );
			if ( pwdJson.p3 ) splitPasswordTag.find( '.pin3' ).val( pwdJson.p3 );
			if ( pwdJson.p4 ) splitPasswordTag.find( '.pin4' ).val( pwdJson.p4 );
		}
	};

	// =============================================

	me.setEvents_OnInit = function()
	{
		// Tab & Anchor UI related click events
		FormUtil.setUpTabAnchorUI( me.loginFormDivTag );

		me.setLoginEvents();
		me.setAdvOptBtnClick();
	}

	// =============================================
	// === EVENT HANDLER METHODS ===================
	
	me.setLoginEvents = function()
	{
		// Save userName that user has entered - to restore when App refreshed by appUpdate
		me.loginUserNameTag.keyup( function() {
			me.current_userName = me.loginUserNameTag.val();
		});


		// Disable this...
		me.loginBtnTag.focus( function() {
			me.passRealTag.hide();
		});

		me.loginBtnTag.click( function() 
		{
			$( '.pin_pw_loading' ).hide();

			var loginUserNameVal = me.loginUserNameTag.val();
			var loginUserPinVal = ''; //me.loginUserPinTag.val();

			var splitPasswordTag = $( '.split_password' );
			
			var pin1Val = Util.trim( splitPasswordTag.find( '.pin1' ).val() );
			var pin2Val = Util.trim( splitPasswordTag.find( '.pin2' ).val() );
			var pin3Val = Util.trim( splitPasswordTag.find( '.pin3' ).val() );
			var pin4Val = Util.trim( splitPasswordTag.find( '.pin4' ).val() );

			if ( pin1Val && pin2Val && pin3Val && pin4Val )
			{
				loginUserPinVal = pin1Val + pin2Val + pin3Val + pin4Val;
			}

			if( loginUserNameVal == "" || loginUserPinVal == "" )
			{
				me.clearResetPasswords();

				MsgManager.notificationMessage ( 'Please enter username / fill all pin', 'notifRed', undefined, '', 'right', 'top' );
			}
			else
			{
				if ( me.lastPinTrigger ) $( '.pin_pw_loading' ).show();

				me.processLogin( loginUserNameVal, loginUserPinVal, location.origin, $( this ), function( success ) {

					me.clearResetPasswords();
					if ( !success ) $( '.pin1' ).focus();
				});
			}			
		});
		
		$( ".onKeyboardOnOff" ).focus( function () 
		{ // Focus		
			me.loginBottomButtonsVisible( false );
		});
	
		$( ".onKeyboardOnOff" ).blur( function () 
		{ // Lost focus
			me.loginBottomButtonsVisible( true );
		});
	
		$( ".pin_pw" ).keyup( function ( event ) 
		{		
			// 'keyup' - comes here after the value has been affected/entered to the field.
			var tag = $( this );
			var tagVal = tag.val();

			var isDeleteKey = ( event.keyCode == FormUtil.keyCode_Delete || event.keyCode == FormUtil.keyCode_Backspace );
			var hasVal = ( tagVal.length > 0 );

			if ( isDeleteKey ) 
			{ 
				if ( !hasVal ) 
				{
					// go to previous pin tag.
					var prevTag = tag.prev( '.pin_pw' );
					if ( prevTag ) prevTag.focus();
				}
			}
			else
			{
				if ( hasVal ) //== this.maxLength ) 
				{
					if ( $(this).hasClass( 'pin4' ) ) 
					{ 
						// if userName is already selected /filled
						if ( Util.trim( me.loginUserNameTag.val() ).length > 0 )
						{
							me.lastPinTrigger = true;
							me.loginBtnTag.click();
						}
					}
					else
					{
						// If multiple char entered, just leave last one. <-- Obsolete by 'keydown' implementation
						//if ( tagVal.length > 1 ) tag.val( Util.getStrLastChar( tagVal ) );

						var nextTag = $(this).next( '.pin_pw' );
						if ( nextTag ) nextTag.focus();
					} 
				}
			}

			me.current_password = me.getCurrentPassword();
		});

		// 
		$( ".pin_pw" ).keydown( function ( event ) 
		{		
			var isDeleteKey = ( event.keyCode == FormUtil.keyCode_Delete || event.keyCode == FormUtil.keyCode_Backspace );

			// If there is already a char in the pin, do not add it.
			// However, if that is delete key, allow it.
			if ( !isDeleteKey && $( this ).val().length >= 1 ) return false;			
		});

		me.loginPinClearTag.off( 'click' ).click( function() 
		{
			me.clearResetPasswords();
			$( '.pin1' ).focus();

			// NOTE: We also need to cancel the current login process..
		});
	};

	me.setAdvOptBtnClick = function()
	{
		me.advanceOptionLoginBtnTag.click( function() {

			FormUtil.blockPage( undefined, function( scrimTag ) 
			{
				scrimTag.off( 'click' ).click( function() 
				{
					FormUtil.emptySheetBottomTag();
					FormUtil.unblockPage( scrimTag );
				});
			});


			FormUtil.genTagByTemplate( FormUtil.getSheetBottomTag(), Templates.Advance_Login_Buttons, function( tag ) 
			{
				// Template events..
				tag.find( '.switchToStagBtn' ).click( function() {
					alert('switchToStagBtn');		
					FormUtil.emptySheetBottomTag();
					FormUtil.unblockPage();
				});
		
				tag.find( '.demoBtn' ).click( function() {	
					alert('demo');
					FormUtil.emptySheetBottomTag();
					FormUtil.unblockPage();
				});
		
				tag.find( '.changeUserBtn' ).click( function() {
					me.changeUserBtnClick();
				});
			});
		});
	};

	
	me.changeUserBtnClick = function()
	{		
		FormUtil.getScrimTag().off( 'click' );  // Make it not cancelable by clicking on scrim anymore...

		// Populates the center aligned #dialog_confirmation div
		FormUtil.genTagByTemplate( FormUtil.getSheetBottomTag(), Templates.Change_User_Form, function( tag ) 
		{
			$( '#accept' ).click( function() {
				DataManager2.deleteAllStorageData( function() {					
					FormUtil.emptySheetBottomTag();
					
					FormMsgManager.appBlockTemplate('appLoad');
	
					AppUtil.appReloadWtMsg( "User Change - Deleteting Existing Data.." );
				});
			});

			$( '#cancel' ).click( function() 
			{				
				FormUtil.emptySheetBottomTag();
				FormUtil.unblockPage();
			});
		});
	};

	
	// ============================================

	me.testVersion_LoginBtn_NotHide = function( url, paramName, paramVal )
	{
		Util.tryCatchContinue( function() 
		{
			me.loginBtn_NotHideFlag = ( Util.getURLParameterByName( url, paramName ) === paramVal );			
		}, 'Login.testVersion_LoginBtn_NotHide' );
	};

	me.loginBottomButtonsVisible = function( bShow )
	{
		var buttonsDivTag = $( ".login_cta" );

		if ( me.loginBtn_NotHideFlag )
		{
			// Always show
			buttonsDivTag.show();
		}
		else
		{		
			if ( bShow) buttonsDivTag.show();
			else buttonsDivTag.hide();
		}
	};

	// =============================================
	// == Auto Login Related

	me.autoLoginCheck = function( runFunc )
	{
		if ( AppInfoManager.getAutoLogin() )
		{
			AppInfoManager.clearAutoLogin();

			runFunc();
		}
	};

	me.populateSessionPin = function()
	{
		Util.tryCatchContinue( function() 
		{
			var userName = me.loginUserNameTag.val();
			var offlineUserData = SessionManager.getOfflineUserData( userName );
			if ( offlineUserData )
			{
				var password = SessionManager.getOfflineUserPin( offlineUserData );
				if ( password )
				{
					var splitPasswordTag = $( '.split_password' );

					for ( var i = 0; i < password.length; i++ ) 
					{
						var charVal = password.charAt(i);
						var pinClassName = '.pin' + ( i + 1 );
	
						splitPasswordTag.find( pinClassName ).val( charVal );
					}	
				}
			}	
		}, 'populateSessionPin' );
	};

	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.appVersionInfoDisplay = function()
	{
		$( '#spanVersion' ).text( 'Version ' + _ver );
		$( '#spanVerDate' ).text( ' [' + _verDate + ']' );    
		$( '#loginVersionNote' ).append( '<label style="color: #999999; font-weight: 350;"> ' + _versionNote + '</label>' );

		$( '#spanLoginAppUpdate' ).off( 'click' ).click( () => {
			AppUtil.appReloadWtMsg();
		});

		if ( WsCallManager.isLocalDevCase )
		{
			var localSiteInfoTag = $( '#localSiteInfo' );
			localSiteInfoTag.show();

			var localStageTag = $( '#localStage' );
		
			//var savedLocalStageName = AppInfoManager.getLocalStageName();
			localStageTag.val( WsCallManager.stageName );			

			localStageTag.off( 'change' ).change( () => {
				var stage = localStageTag.val();
				AppInfoManager.setLocalStageName( stage );
				WsCallManager.setWsTarget_Stage( stage );
				alert( 'Changed to [' + stage + ']' );
			});
		}
	};
	


	// // ---- Localhost Stage related..
	//AppInfoManager.getLocalStageName = function() 

	//AppInfoManager.setLocalStageName = function( stageName ) 


	// -----------------------------------

	
	me.openForm = function()
	{
		// ReSet the 1st touch/focus flag..
		me.loginPage1stTouchFlag = false;


		// Hide non login related tags..
		$( '.Nav1' ).hide();

		me.pageDivTag.hide();		
		me.loginFormDivTag.show();

		Menu.setInitialLogInMenu( me.cwsRenderObj );


		// Reset vals and set focus
		me.clearResetPasswords();

		if ( !me.loginUserNameTag.val() ) 
		{
			me.loginUserNameTag.focus();
		}
		else 
		{
			//setTimeout( function() { $( '.pin1' ).focus(); }, 100 );			
		}

		me.loginBottomButtonsVisible( true );
	};


	me.closeForm = function()
	{
		// '.Nav1' show should be moved to cwsRender.startWithConfigLoad
		$( '.Nav1' ).css( 'display', 'flex' );			
		//me.pageTitleDivTab.hide(); 

		me.loginFormDivTag.hide();
		me.pageDivTag.show( 'fast' );

		me.loginFieldTag.show();		
	};

	me.clearResetPasswords = function()
	{
		// If last pin cause error, move the focus to 1st one.
		// if ( me.lastPinTrigger ) $( '.pin1' ).focus();

		me.lastPinTrigger = false;
		$( '#pass' ).val( '' );
		$( '.pin_pw' ).val( '' );
		$( '.pin_pw_loading' ).hide();
	};

	// ------------------------------------------
	// --- Perform Login Related...

	me.processLogin = function( userName, password, server, btnTag, callAfterDone )
	{
		var parentTag = btnTag.parent();
		var dtmNow = ( new Date() ).toISOString();

		parentTag.find( 'div.loadingImg' ).remove();

		SessionManager.Status_LogIn_InProcess = true;


		// ONLINE vs OFFLINE HANDLING
		if ( ConnManagerNew.isAppMode_Offline() )
		{
			me.loginOffline( userName, password, function( isSuccess, offlineUserData ) 
			{
				SessionManager.Status_LogIn_InProcess = false;

				if ( isSuccess ) me.loginSuccessProcess( userName, offlineUserData );

				if ( callAfterDone ) callAfterDone( isSuccess );
			});
		}
		else
		{
			var loadingTag = FormUtil.generateLoadingTag( btnTag.find( '.button-label' ) );

			me.loginOnline( userName, password, loadingTag, function( isSuccess, loginData ) 
			{
				SessionManager.Status_LogIn_InProcess = false;

				if ( isSuccess )
				{
					me.retrieveStatisticPage( ( fileName, statPageData ) => { me.saveStatisticPage( fileName, statPageData ); } );
					me.loginSuccessProcess( userName, loginData );	
				}

				if ( callAfterDone ) callAfterDone( isSuccess );
			});
		}
	};

	
	me.loginSuccessProcess = function( userName, loginData ) 
	{	
		// Reset this value
		//AppInfoManager.clearAutoLogin();
		AppInfoManager.clearLoginCurrentKeys();
		me.resetLoginCurrentKeys();
		
		// Load config and continue the CWS App process
		if ( !loginData.dcdConfig || loginData.dcdConfig.ERROR ) MsgManager.msgAreaShow( '<span term="msgNotif_loginSuccess_noConfig">Login Success, but country config not available.</span> <span>Msg: ' + loginData.dcdConfig.ERROR + '</span>', 'ERROR' );
		else 
		{
			FormMsgManager.appBlockTemplate( 'loginAfterLoad' );

			// Load Activities
			me.cwsRenderObj.loadActivityListData_AfterLogin( function() 
			{
				me.loginAfterProcess( userName );
				
				FormMsgManager.appUnblock();

				// call CWS start with this config data..
				me.cwsRenderObj.startWithConfigLoad( loginData.dcdConfig );

				// Call server available check again <-- since the dhis2 sourceType of user could have been loaded at this point.
				// For availableType 'v2' only.
				ConnManagerNew.checkNSet_ServerAvailable();
			});			
		}
	};


	me.loginAfterProcess = function( userName )
	{
		// 1. Data Related Process
		SyncManagerNew.SyncMsg_Reset();

		// Save userName to 'appInfo.userInfo'
		AppInfoManager.createUpdateUserInfo( userName );
		
		SessionManager.setLoginStatus( true );		
		InfoDataManager.setDataAfterLogin(); // sessionData.login_UserName update to 'INFO' object

		//AppInfoManager.setLastLoginMark( new Date() );

		// menu area user name show
		$( 'div.navigation__user' ).html( userName );


		// 2. UI Related Process
		me.closeForm();
		FormUtil.geolocationAllowed();

		me.cwsRenderObj.renderDefaultTheme();
		MsgManager.initialSetup();

		ScheduleManager.runSchedules_AfterLogin( me.cwsRenderObj );

		me.loginAfter_LoginPageUIUpdate();
	};

	// ----------------------------------------------
	
	me.loginOnline = function( userName, password, loadingTag, returnFunc )
	{
		WsCallManager.submitLogin( userName, password, loadingTag, function( success, loginData ) 
		{			
			me.checkLoginData_wthErrMsg( success, loginData, function( resultSuccess ) 
			{
				if ( resultSuccess )
				{
					// Save 'loginData' in localStorage and put it on session memory
					SessionManager.saveUserSessionToStorage( loginData, userName, password );
					SessionManager.loadDataInSession( userName, password, loginData );
				}

				if( returnFunc ) returnFunc( resultSuccess, loginData );
			});								
		});
	};

	
	me.loginOffline = function( userName, password, returnFunc )
	{
		var isSuccess = false;

		// OFFLINE Login - validate encrypted pwd against already stored+encrypted pwd
		var offlineUserData = SessionManager.getOfflineUserData( userName );

		if ( offlineUserData )
		{
			if ( password === SessionManager.getOfflineUserPin( offlineUserData ) )
			{					
				if ( SessionManager.checkLoginData( offlineUserData ) )
				{
					// Update current user login information ( lastUpdated, stayLoggedIn )
					SessionManager.updateUserSessionToStorage( offlineUserData, userName );
					SessionManager.loadDataInSession( userName, password, offlineUserData );

					isSuccess = true;
				}
			}
			else
			{
				// MISSING TRANSLATION
				MsgManager.notificationMessage ( 'Login Failed > invalid pin', 'notifRed', undefined, '', 'right', 'top' );
			}
		}
		else
		{
			// MISSING TRANSLATION
			MsgManager.notificationMessage ( 'No Offline UserData Available', 'notifDark', undefined, '', 'right', 'top' );
		}

		if ( returnFunc ) returnFunc( isSuccess, offlineUserData );
	};

	// ----------------------------


	me.checkLoginData_wthErrMsg = function ( success, loginData, callBack )
	{
		var resultSuccess = false;

		if ( success )
		{
			if ( !loginData )
			{
				MsgManager.notificationMessage ( 'Error - loginData Empty!', 'notifRed', undefined, '', 'right', 'top' );
				resultSuccess = false;
			} 
			else if ( !loginData.orgUnitData ) 
			{
				MsgManager.notificationMessage ( 'Error - loginData orgUnitData Empty!', 'notifRed', undefined, '', 'right', 'top' );
				resultSuccess = false;
			}
			else if ( !loginData.dcdConfig ) 
			{
				MsgManager.notificationMessage ( 'Error - loginData dcdConfig Empty!', 'notifRed', undefined, '', 'right', 'top' );
				resultSuccess = false;
			}
			else
			{
				resultSuccess = true;
			}
		}
		else
		{
			var errDetail = ( loginData && loginData.returnCode === 502 ) ? " - Server not available" : "";

			// MISSING TRANSLATION
			MsgManager.notificationMessage ( 'Login Failed' + errDetail, 'notifRed', undefined, '', 'right', 'top' );

			resultSuccess = false;
		}

		if ( callBack ) callBack( resultSuccess );
	};

	// ----------------------------------------------
	
	// Only online version - download and set to localStorage or IndexedDB
	me.retrieveStatisticPage = function( execFunc )
	{
		var statJson = ConfigManager.getStatisticJson();

		if ( statJson.fileName )
		{
			// per apiPath (vs per fileName)
			var apiPath = ConfigManager.getStatisticApiPath();
			
			WsCallManager.requestGetDws( apiPath, {}, undefined, function( success, returnJson ) {

				if ( success && returnJson && returnJson.response )
				{
					execFunc( statJson.fileName, returnJson.response );
				}
			});
		}
	};

	me.saveStatisticPage = function( fileName, dataStr )
	{
		// Either store it on localHost, IDB
		AppInfoManager.updateStatisticPages( fileName, dataStr );
	};

	// ----------------------------------------------

	me.regetDCDconfig = function()
	{
		var userName = SessionManager.sessionData.login_UserName;
		var userPin = SessionManager.sessionData.login_Password;

		me.processLogin( userName, userPin, location.origin, $( this ) );
	};


	me.loginAfter_LoginPageUIUpdate = function()
	{
		var loginUserNameH4Tag = $( '#loginUserNameH4' );

		// Div (Input) part of Login UserName
		$( '#loginField' ).hide();

		// input parts..  Below will be hidden, though...
		//$( 'input.loginUserName' ).val( lastSession.user );	
		$( 'input.loginUserName' ).attr( 'readonly',true );

		// Display login name as Big text part - if we already have user..
		loginUserNameH4Tag.text( me.loginUserNameTag.val() ).show();
		

		//$( '#advanceOptionLoginBtn' ).removeClass( 'dis' ).addClass( 'l-emphasis' );

		FormUtil.hideProgressBar();
	};

	// --------------------------------------
	// --- Mobile Phone related Setups

	me.isMobileDevice = function()
	{
		return ( Util.isAndroid() || Util.isIOS() );
	};


	// TODO: HOW IS THIS APPLIED TO NEW LOGIN PAGE 4 DIGIT PIN?
	me.browserResizeHandle = function()
	{
		if ( me.isMobileDevice() )
		{
			// Track width+height sizes for detecting android keyboard popup (which triggers resize)
			$( 'body' ).attr( 'initialWidth', $( 'body' ).css( 'width' ) );
			$( 'body' ).attr( 'initialHeight', $( 'body' ).css( 'height' ) );

			// Set defaults for Tags to be hidden when keyboard triggers resize
			$( '#ConnectingWithSara' ).addClass( 'hideOnKeyboardVisible' );
			$( '#advanceOptionLoginBtn' ).addClass( 'hideOnKeyboardVisible' );

			// Window Resize detection
			$( window ).on( 'resize', function () {

				// TODO: Could do login page visible further detection!!!
				if ( $( '#pass' ).is( ':visible' ) )   // !SessionManager.getLoginStatus() )
				{
					//InitialWidth = $( 'body' ).attr( 'initialWidth' );
					initialHeight = $( 'body' ).attr( 'initialHeight' );

					// height ( change ) only value we're interested in comparing
					if ( $( 'body' ).css( 'height' ) !== initialHeight )  //|| $( 'body' ).css( 'width' ) !== $( 'body' ).attr( 'initialWidth' ) 
					{
						//$( 'div.login_title').find( 'h1' ).html( 'IS keyboard' ); //console.customLog( 'IS keyboard' );
						$( '.hideOnKeyboardVisible' ).hide();
					} 
					else
					{
						//$( 'div.login_title').find( 'h1' ).html( 'not keyboard' ); //console.customLog( 'not keyboard' );
						$( '.hideOnKeyboardVisible' ).show();
					}

					//FormUtil.setTimedOut_PositionLoginPwdBlinker();
				}
			});
		}
		else
		{
			// Window Resize detection
			$( window ).on( 'resize', function () 
			{
				//FormUtil.setTimedOut_PositionLoginPwdBlinker();		
			});
		}
	};


	me.mobileCssSetup = function()
	{
		if ( me.isMobileDevice() ) me.override_MobileClassStyles();
	};


	me.override_MobileClassStyles = function()
	{
		var style = $('<style> #pageDiv { padding: 4px 2px 0px 2px !important; }</style>');

		$( 'html > head' ).append(style);
	};


	me.setNewAppFileStatus = function( newAppFilesFound )
	{
		var loginAppUpdateTag = $( '#spanLoginAppUpdate' );

		if ( newAppFilesFound ) loginAppUpdateTag.show();
		else loginAppUpdateTag.hide();
	};

	// --------------------------------------
	

	// --------------------------------------

	me.getInputBtnPairTags = function( formDivStr, pwdInputStr, btnStr, returnFunc )
	{
		$( formDivStr ).each( function( i ) {

			var formDivTag = $( this );
			var loginUserPinTag = formDivTag.find( pwdInputStr );
			var loginBtnTag = formDivTag.find( btnStr );

			returnFunc( loginUserPinTag, loginBtnTag );

		});	
	};

	me.setUpInputTypeCopy = function( inputTags ) {
		inputTags.keyup( function() {  // keydown vs keypress
			// What about copy and paste?
			var changedVal = $( this ).val();
			inputTags.val( changedVal );
		});	
	};

	/*
	me.setUpEnterKeyExecute = function( inputTag, btnTag ) {
		inputTag.keypress( function(e) {
			if ((e.which && e.which == FormUtil.keyCode_Enter) || (e.keyCode && e.keyCode == FormUtil.keyCode_Enter)) {
				btnTag.click();
				return false;
			} else {
				return true;
			}			
		});		
	};
	*/

	// ================================

	me.initialize();
}