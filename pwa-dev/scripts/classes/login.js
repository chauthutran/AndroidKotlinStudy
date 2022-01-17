// -------------------------------------------
// -- Login Class/Methods
//
//  - Collect userName input and pin in real time..
//		- use it on 'render' as needed (load it.)
//		- clear on render..
// 
// -------------------------------------------- 
function Login()
{
    var me = this;

	me.loginFormDivTag = $( '#loginFormDiv' );

	me.loginBtnTag = $( '.loginBtn' );
	me.passRealTag = $( '#passReal' );
	me.loginUserNameTag = $( '.loginUserName' );
	me.loginUserPinTag = $( '.loginUserPin' );
	me.loginFormTag = $( 'div.login_data' );
	me.advanceOptionLoginBtnTag = $( '#advanceOptionLoginBtn' );

	me.loginPinClearTag = $( '#loginPinClear' );
	//me.loginFieldTag = $( '#loginField' );

	me.splitPasswordTag = $( '.split_password' );

	// ------------

	// Flags
	me.lastPinTrigger = false;
	me.loginPage1stTouchFlag = false;
	me.loginBtn_NotHideFlag = false;

	me.current_userName = "";	// Used to load the userName/password when it got refreshed by mistake - or by appUpdate
	me.current_password = {};
	
	me.loginAppUpdateCheck = false;

	// -------------
	me.ERR_MSG_blackListing = '> <span term="' + Constants.term_LoginBlackListingMsg + '">Country is blackListed on current stage.</span>';

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setEvents_OnInit();
	}

	me.render = function()
	{	    
    	GAnalytics.setSendPageView( '/' + GAnalytics.PAGE_LOGIN );
		GAnalytics.setEvent( 'LoginOpen', GAnalytics.PAGE_LOGIN, 'login displayed', 1 );

		// In test version with special url param, do not hide login buttons
		me.testVersion_LoginBtn_NotHide( 'test', 'Y' );

		me.appVersionInfoDisplay();

		me.openForm();  // with reset Val

		// Translate the page..
		TranslationManager.translatePage();

		// Perform autoCheckIn Flag (dateTimeStr), and run the auto checkIn..
		/*
		me.autoLoginCheck( function() {
			me.populateSessionPin();
			me.lastPinTrigger = true;
			MsgManager.msgAreaShow( 'Auto Login After AppUpdate.' );
			me.loginBtnTag.click();
		});
		*/



		// If AppUpdate Refresh happened during Login, restore the current key typings
		// me.tempCurrentKeysRestore();
	};

	// -----------------------------------

	
	// =============================================
	// === TEMP CURRENT KEYS RESTORE RELATED =======
	
	/*
	me.tempCurrentKeysRestore = function()
	{
		me.resetLoginCurrentKeys();

		var tempCurrentKeys = AppInfoLSManager.getLoginCurrentKeys();
		if ( tempCurrentKeys && tempCurrentKeys.keys )
		{
			// load the keys to login page..
			me.restoreLoginKeys( tempCurrentKeys.keys );

			AppInfoLSManager.clearLoginCurrentKeys();
		}
	};


	// This method is used by 'swManager'
	me.getLoginCurrentKeys = function()
	{
		return { 'userName': me.current_userName }; //, 'password': me.current_password };
	};

	me.resetLoginCurrentKeys = function()
	{
		me.current_userName = '';
		//me.current_password = {};		
	};

	me.restoreLoginKeys = function( keys )
	{
		if ( keys )
		{
			if ( keys.userName	) me.loginUserNameTag.val( keys.userName );
			//if ( keysJson.keys.password	) me.restoreCurrentPassword( keysJson.keys.password );
		}
	};
	
	me.getCurrentPassword = function()
	{
		return { 
			'p1': me.splitPasswordTag.find( '.pin1' ).val()
			,'p2': me.splitPasswordTag.find( '.pin2' ).val()
			,'p3': me.splitPasswordTag.find( '.pin3' ).val()
			,'p4': me.splitPasswordTag.find( '.pin4' ).val()
		};
	};

	me.restoreCurrentPassword = function( pwdJson )
	{
		if ( pwdJson )
		{
			if ( pwdJson.p1 ) me.splitPasswordTag.find( '.pin1' ).val( pwdJson.p1 );
			if ( pwdJson.p2 ) me.splitPasswordTag.find( '.pin2' ).val( pwdJson.p2 );
			if ( pwdJson.p3 ) me.splitPasswordTag.find( '.pin3' ).val( pwdJson.p3 );
			if ( pwdJson.p4 ) me.splitPasswordTag.find( '.pin4' ).val( pwdJson.p4 );
		}
	};
	*/


	// =============================================

	me.setEvents_OnInit = function()
	{
		// Tab & Anchor UI related click events
		FormUtil.setUpTabAnchorUI( me.loginFormDivTag );

		me.setLoginEvents();
		me.setAdvOptBtnClick();

		me.setUpInteractionDetect();
	}

	// =============================================
	// === EVENT HANDLER METHODS ===================

	me.setUpInteractionDetect = function()
	{
		me.loginFormDivTag.focusin( function() {
			// console.log( 'FUCUS - loginPage On User Focused ' + (new Date()).toString() );
			me.checkAppUpdate_InLoginOnce();
		});

		me.loginFormDivTag.click( function() {
			// console.log( 'CLICK - loginPage On User Clicked ' + (new Date()).toString() );
			me.checkAppUpdate_InLoginOnce();
		});
	};	


	me.checkAppUpdate_InLoginOnce = function()
	{
		if ( !me.loginAppUpdateCheck )
		{
			//console.log( 'checkAppUpdate_InLoginOnce --> SwManager.checkNewAppFile_OnlyOnline()' );
			SwManager.checkNewAppFile_OnlyOnline();

			me.loginAppUpdateCheck = true;
		}
	};


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


		me.splitPasswordTag.find( '.pin1' ).focus( function() {
			SwManager.checkNewAppFile_OnlyOnline();
		});
			

		me.loginBtnTag.click( function() 
		{
			$( '.pin_pw_loading' ).hide();

			var loginUserNameVal = me.loginUserNameTag.val();
			var loginUserPinVal = ''; //me.loginUserPinTag.val();
			
			var pin1Val = Util.trim( me.splitPasswordTag.find( '.pin1' ).val() );
			var pin2Val = Util.trim( me.splitPasswordTag.find( '.pin2' ).val() );
			var pin3Val = Util.trim( me.splitPasswordTag.find( '.pin3' ).val() );
			var pin4Val = Util.trim( me.splitPasswordTag.find( '.pin4' ).val() );

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

				// NOTE: On login button click, also check app update..
				SwManager.checkNewAppFile_OnlyOnline();


				// Main Login Processing
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

			//me.current_password = me.getCurrentPassword();
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

	me.testVersion_LoginBtn_NotHide = function( paramName, paramVal )
	{
		Util.tryCatchContinue( function() 
		{
			me.loginBtn_NotHideFlag = ( Util.getParameterByName( paramName ) === paramVal );			
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

	/*
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
			var offlineUserData = SessionManager.getLoginRespData_IDB( userName );
			if ( offlineUserData )
			{
				var password = SessionManager.getOfflineUserPin( offlineUserData );
				if ( password )
				{
					for ( var i = 0; i < password.length; i++ ) 
					{
						var charVal = password.charAt(i);
						var pinClassName = '.pin' + ( i + 1 );
	
						me.splitPasswordTag.find( pinClassName ).val( charVal );
					}	
				}
			}	
		}, 'populateSessionPin' );
	};

	*/
	
	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.appVersionInfoDisplay = function()
	{
		$( '#spanVersion' ).text( TranslationManager.translateText( 'Version', 'landingPage_version_label' ) + ' ' + _ver );
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
				AppInfoLSManager.setLocalStageName( stage );
				WsCallManager.setWsTarget_Stage( stage );
				alert( 'Changed to [' + stage + ']' );
			});
		}
	};
	
	// -----------------------------------

	me.openForm = function()
	{
		// Reset various login related flags - the 1st touch/focus flag..
		me.loginPage1stTouchFlag = false;
		me.loginAppUpdateCheck = false;
		

		SessionManager.cwsRenderObj.hidePageDiv();


		me.loginFormDivTag.show();
		Menu.setInitialLogInMenu();

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
		var loginUserNameH4Tag = $( '#loginUserNameH4' );

		// Div (Input) part of Login UserName
		$( '#loginField' ).hide();

		
		me.loginFormDivTag.hide();
		
		// input parts..  Below will be hidden, though...
		//$( 'input.loginUserName' ).val( lastSession.user );	
		$( 'input.loginUserName' ).attr( 'readonly',true );

		// Display login name as Big text part - if we already have user..
		loginUserNameH4Tag.text( me.loginUserNameTag.val() ).show();
		

		//$( '#advanceOptionLoginBtn' ).removeClass( 'dis' ).addClass( 'l-emphasis' );

		FormUtil.hideProgressBar();
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
		// Also, if replica login server is not available, use offline process to login.
		if ( !ConnManagerNew.REPLICA_Available || ConnManagerNew.isAppMode_Offline() )
		{
			me.loginOffline( userName, password, function( isSuccess, offlineUserData ) 
			{
				SessionManager.Status_LogIn_InProcess = false;

				if ( isSuccess ) me.loginSuccessProcess( userName, password, offlineUserData, function() 
				{
					// After StartUp Fun - This should be displayed after loading..
					SessionManager.check_warnLastConfigCheck( ConfigManager.getConfigUpdateSetting() );
				});

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
					me.loginSuccessProcess( userName, password, loginData );	
				}

				if ( callAfterDone ) callAfterDone( isSuccess );
			});
		}
	};

	
	me.loginSuccessProcess = function( userName, password, loginData, runAfterFunc ) 
	{	
		// gAnalytics Event
		GAnalytics.setEvent( "Login Process", "Login Button Clicked", "Successful", 1 );
		//GAnalytics.setEvent = function(category, action, label, value = null) 


		// NEW
		AppInfoManager.loadData_AfterLogin( userName, password );


		// Reset this value
		//AppInfoManager.clearAutoLogin();
		//AppInfoLSManager.clearLoginCurrentKeys();
		//me.resetLoginCurrentKeys();

		
		// Load config and continue the CWS App process
		if ( !loginData.dcdConfig || loginData.dcdConfig.ERROR ) MsgManager.msgAreaShow( '<span term="msgNotif_loginSuccess_noConfig">Login Success, but country config not available.</span> <span>Msg: ' + loginData.dcdConfig.ERROR + '</span>', 'ERROR' );
		else 
		{
			FormMsgManager.appBlockTemplate( 'loginAfterLoad' );

			// Load Activities
			SessionManager.cwsRenderObj.loadActivityListData_AfterLogin( function() 
			{
				me.loginAfterProcess( userName );
				
				FormMsgManager.appUnblock();

				// call CWS start with this config data..
				SessionManager.cwsRenderObj.startWithConfigLoad( runAfterFunc );

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
		AppInfoLSManager.setUserName( userName );
		
		SessionManager.setLoginStatus( true );		
		InfoDataManager.setDataAfterLogin(); // sessionData.login_UserName update to 'INFO' object

		//AppInfoManager.setLastLoginMark( new Date() );

		// menu area user name show
		$( 'div.navigation__user' ).html( userName );

		MsgManager.initialSetup();

		// 2. UI Related Process
		me.closeForm();

		SessionManager.cwsRenderObj.showPageDiv();


		// NOTE: After Login Operations BELOW: (Client data are loaded in memory already)

		// #1. "SCH_SyncDown_RunOnce", "SCH_FixOper_RunOnce", "SCH_SyncAll_Background"
		ScheduleManager.runSchedules_AfterLogin( SessionManager.cwsRenderObj );

		// #2
		ConfigManager.runAppRunEvals( 'login' );

		// Config > 'settings' > 'loginTimeRuns'
		ConfigManager.runLoginTimeRuns();
	};

	// ----------------------------------------------
	
	me.loginOnline = function( userName, password, loadingTag, returnFunc )
	{
		WsCallManager.submitLogin( userName, password, loadingTag, function( success, loginData ) 
		{			
			me.checkLoginData_wthErrMsg( success, userName, password, loginData, function( resultSuccess ) 
			{
				if ( resultSuccess )
				{
					me.setModifiedOUAttrList( loginData );
					AppInfoLSManager.setLastOnlineLoginDt( ( new Date() ).toISOString() );
					AppInfoLSManager.saveConfigSourceType( loginData );

					// Save 'loginData' in indexedDB for offline usage and load to session.
					SessionManager.setLoginRespData_IDB( userName, password, loginData );
					SessionManager.loadDataInSession( userName, password, loginData );
				}

				if( returnFunc ) returnFunc( resultSuccess, loginData );
			});								
		});
	};

	
	me.loginOffline = function( userName, password, returnFunc )
	{
		SessionManager.checkOfflineDataExists( userName, function( dataExists ) 
		{
			if ( dataExists )
			{
				if ( AppInfoLSManager.getBlackListed() )
				{			
					// Translation term need to be added - from config?	
					MsgManager.msgAreaShow( me.getLoginFailedMsgSpan() + ' ' + me.ERR_MSG_blackListing, 'ERROR' );
					if ( returnFunc ) returnFunc( false );
				}
				else
				{
					SessionManager.checkPasswordOffline_IDB( userName, password, function( isPass ) 
					{
						if ( isPass )
						{
							SessionManager.getLoginRespData_IDB( userName, password, function( loginResp ) 
							{
								if ( SessionManager.checkLoginData( loginResp ) )
								{
									// load to session
									SessionManager.loadDataInSession( userName, password, loginResp );
								
									// TEST, DEBUG - TO BE REMOVED AFTERWARDS
									GAnalytics.setEvent( 'LoginOffline', GAnalytics.PAGE_LOGIN, 'login Offline Try', 1 );

									if ( returnFunc ) returnFunc( true, loginResp );
								}
								else { if ( returnFunc ) returnFunc( false ); }
							});	
						}
						else
						{
							// MISSING TRANSLATION
							MsgManager.notificationMessage( me.getLoginFailedMsgSpan() + ' > invalid pin', 'notifRed', undefined, '', 'right', 'top' );
							if ( returnFunc ) returnFunc( false );
						}
					});
				}
			}
			else
			{
				// MISSING TRANSLATION
				MsgManager.notificationMessage( 'No Offline UserData Available', 'notifDark', undefined, '', 'right', 'top' );
				if ( returnFunc ) returnFunc( false );
			}				
		} );
	};

	// ----------------------------


	me.checkLoginData_wthErrMsg = function ( success, userName, password, loginData, callBack )
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
			var errDetail = '';

			// NEW: Save 'blackListing' case to localStorage offline user data..  CREATE CLASS?  OTHER THAN appInfo?
			if ( loginData && loginData.blackListing ) 
			{
				AppInfoLSManager.setBlackListed( true );
				errDetail =  me.ERR_MSG_blackListing;
			}
			else if ( loginData && loginData.returnCode === 502 ) errDetail = ' - Server not available';


			// MISSING TRANSLATION
			MsgManager.msgAreaShow( me.getLoginFailedMsgSpan() + ' ' + errDetail, 'ERROR' );	

			resultSuccess = false;
		}

		if ( callBack ) callBack( resultSuccess );
	};


	me.setModifiedOUAttrList = function( loginData )
	{
		try
		{
			var ouAttrVals = {};

			if ( loginData.orgUnitData.orgUnit && loginData.orgUnitData.orgUnit.attributeValuesJson )
			{
				var attrJson = loginData.orgUnitData.orgUnit.attributeValuesJson;

				Object.keys( attrJson ).forEach( key => {
					ouAttrVals[key] = attrJson[key].value;
				});
			}

			loginData.orgUnitData.ouAttrVals = ouAttrVals;
		}
		catch( errMsg )
		{
			console.customLog( 'ERROR in login.setModifiedOUAttrList, errMsg: ' + errMsg );
		}
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

	me.showNewAppAvailable = function( newAppFilesFound )
	{
		me.loginAppUpdateCheck = true;

		var loginAppUpdateTag = $( '#spanLoginAppUpdate' );

		if ( newAppFilesFound ) loginAppUpdateTag.show();
		else loginAppUpdateTag.hide();
	};

	// --------------------------------------
	
	me.getLoginFailedMsgSpan = function()
	{
		return '<span term="' + Constants.term_LoginFailMsg + '">Login Failed</span>';
	};

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