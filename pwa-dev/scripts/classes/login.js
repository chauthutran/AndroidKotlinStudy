// -------------------------------------------
// -- Login Class/Methods
function Login( cwsRenderObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;

	me.loginFormDivTag = $( '#loginFormDiv' );
	me.pageDivTag = $( '#pageDiv' );	// Get it from cwsRender object?
	me.navTitleTextTag = $( '.Nav__Title' );
	//me.pageTitleDivTab = $( 'div.logo-desc-all' );
	me.scrimTag = $('.scrim');
	me.sheetBottomTag = $('.sheet_bottom');

	me.loginBtnTag = $( '.loginBtn' );
	me.passRealTag = $( '#passReal' );
	me.loginUserNameTag = $( '.loginUserName' );
	me.loginUserPinTag = $( '.loginUserPin' );
	me.loginFormTag = $( 'div.login_data' );
	me.advanceOptionLoginBtnTag = $( '#advanceOptionLoginBtn' );

	
	me.loginFormTag = $( '.login_data__fields' );
	me.loginFieldTag = $( '#loginField' );

	me.lastPinTrigger = false;

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setEvents_OnInit();
	}

	me.render = function()
	{	
		me.appVersionInfoDisplay();

		me.openForm();  // with reset Val

		me.mobileCssSetup();

		//FormUtil.setUpLoginInputsEvents();

		me.browserResizeHandle();  // For keyboard resizing on mobile, and other resize blinker move..
		
		//FormUtil.positionLoginPwdBlinker();

		// Translate the page..
		TranslationManager.translatePage();
	};

	// ------------------

	me.setEvents_OnInit = function()
	{
		// Tab & Anchor UI related click events
		FormUtil.setUpTabAnchorUI( me.loginFormDivTag );

		me.setLoginFormEvents();
	}
	// =============================================


	// =============================================
	// === EVENT HANDLER METHODS ===================

	me.setLoginFormEvents = function()
	{
		me.setLoginBtnEvents();
		me.setAdvOptBtnClick();
	}

	// ---------------------------
	

	me.setLoginBtnEvents = function()
	{
		me.scrimTag.click( function() 
		{
			console.customLog( 'scrimTag click - unblock Page' );

			me.unblockPage();
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

				MsgManager.notificationMessage ( 'Please enter username / fill all pin', 'notificationRed', undefined, '', 'right', 'top' );
			}
			else
			{
				if ( me.lastPinTrigger ) $( '.pin_pw_loading' ).show();

				me.processLogin( loginUserNameVal, loginUserPinVal, location.origin, $( this ), function( success ) {

					console.customLog( 'finished processLogin' );

					me.clearResetPasswords();
					//$( '.pin_pw_loading' ).hide();
				});
			}
			
			//$( '.pin_pw_loading' ).hide();
		});
		
		$( ".onKeyboardOnOff" ).focus( function () 
		{ // Focus
			$( ".login_cta" ).hide();
		});
	
		$( ".onKeyboardOnOff" ).blur( function () 
		{ // Lost focus
			$( ".login_cta" ).show();
		});
	
		$( ".pin_pw" ).keyup( function ( event ) 
		{		
			// 'keyup' - comes here after the value has been affected/entered to the field.

			//console.log( event.keyCode );
			var isDeleteKey = ( event.keyCode == 46 || event.keyCode == 8 );
			var hasVal = ( this.value.length > 0 );
			// Should delete current one if not empty.
			// if empty, delete previous one and set focus on previous one
			if ( isDeleteKey ) 
			{ 
				console.log( 'Delete Key Pressed' ); 

				if ( !hasVal ) 
				{
					// go to previous pin tag.
					var prevTag = $(this).prev( '.pin_pw' );
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
						var nextTag = $(this).next( '.pin_pw' );
						if ( nextTag ) nextTag.focus();
					} 
				}
			}
		});
	};

	
	me.blockPage = function()
	{
		me.scrimTag.show();

		me.scrimTag.off( 'click' ).click( function(){
			me.unblockPage();
		} );

		me.scrimTag.css( 'z-Index', 1 );
	}

	me.unblockPage = function()
	{
		me.scrimTag.hide();
		me.sheetBottomTag.html( '' );
		me.scrimTag.css( 'z-Index', 1 );
	}
	
	me.setAdvOptBtnClick = function()
	{

		me.advanceOptionLoginBtnTag.click( function() {

			if ( ! me.advanceOptionLoginBtnTag.hasClass( 'dis' ) )
			{
				me.blockPage();

				// create and reference templatesManager here:
				me.sheetBottomTag.html ( Templates.Advance_Login_Buttons );
				TranslationManager.translatePage();

				me.sheetBottomTag.show();
			}


			$( '#switchToStagBtn' ).click( function() {

				if ( ! $( this ).hasClass( 'dis' ) )
				{
					me.unblockPage();
					alert('switchToStagBtn');	
				}
	
			});
	
			$( '#demoBtn' ).click( function() {
	
				if ( ! $( this ).hasClass( 'dis' ) )
				{
					me.unblockPage();
					alert('demo');
				}
	
			});
	
			$( '#changeUserBtn' ).click( function() {
	
				if ( ! $( this ).hasClass( 'dis' ) )
				{
					me.sheetBottomTag.html ( Templates.Change_User_Form );
					TranslationManager.translatePage();
	
					$( '#accept' ).click( function() {

						DataManager2.deleteAllStorageData( function() {
							AppUtil.appRefresh();
							//me.cwsRenderObj.swManagerObj.reGetAppShell(); 
						});

					});
	
					$( '#cancel' ).click( function() {

						$( '.sheet_bottom-btn3' ).remove();
						me.unblockPage();
					});

					me.sheetBottomTag.show();

				}
	
			});

		});
	};

	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.appVersionInfoDisplay = function()
	{
		$( '#spanVersion' ).text( 'Version ' + _ver );
		$( '#spanVerDate' ).text( ' [' + _verDate + ']' );    
		$( '#loginVersionNote' ).append( '<label style="color: #999999; font-weight: 350;"> ' + _versionNote + '</label>' );

		$( '#spanLoginAppUpdate' ).off( 'click' ).click( () => {
			AppUtil.appRefresh();
		});
	};
	
	
	me.openForm = function()
	{
		// Reset vals and set focus
		me.clearResetPasswords();

		if ( !me.loginUserNameTag.val() ) me.loginUserNameTag.focus();
		else $( '.pin1' ).focus();


		// Hide non login related tags..
		$( '.Nav1' ).hide();

		me.pageDivTag.hide();		
		me.loginFormDivTag.show( 'fast' );

		//if ( ! me.loginFormDivTag.is( ":visible" ) ) me.loginFormDivTag.show();

		Menu.setInitialLogInMenu( me.cwsRenderObj );
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
		if ( me.lastPinTrigger ) $( '.pin1' ).focus();

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


		// ONLINE vs OFFLINE HANDLING
		if ( !ConnManagerNew.isAppMode_Online() )
		{
			me.loginOffline( userName, password, function( isSuccess, offlineUserData ) 
			{
				if ( isSuccess ) me.loginSuccessProcess( userName, offlineUserData );

				if ( callAfterDone ) callAfterDone( isSuccess );
			});
		}
		else
		{
			var loadingTag = FormUtil.generateLoadingTag( btnTag.find( '.button-label' ) );

			me.loginOnline( userName, password, loadingTag, function( isSuccess, loginData ) 
			{
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
		// Load config and continue the CWS App process
		if ( !loginData.dcdConfig ) MsgManager.msgAreaShow( 'Login Failed > unexpected error, cannot proceed', 'ERROR' );
		else
		{
			// Load Activities
			me.cwsRenderObj.loadActivityListData_AfterLogin( function() 
			{
				me.loginAfterProcess( userName );
				
				// call CWS start with this config data..
				me.cwsRenderObj.startWithConfigLoad( loginData.dcdConfig );
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
				MsgManager.notificationMessage ( 'Login Failed > invalid pin', 'notificationRed', undefined, '', 'right', 'top' );
			}
		}
		else
		{
			// MISSING TRANSLATION
			MsgManager.notificationMessage ( 'No Offline UserData Available', 'notificationDark', undefined, '', 'right', 'top' );
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
				MsgManager.notificationMessage ( 'Error - loginData Empty!', 'notificationRed', undefined, '', 'right', 'top' );
				resultSuccess = false;
			} 
			else if ( !loginData.orgUnitData ) 
			{
				MsgManager.notificationMessage ( 'Error - loginData orgUnitData Empty!', 'notificationRed', undefined, '', 'right', 'top' );
				resultSuccess = false;
			}
			else if ( !loginData.dcdConfig ) 
			{
				MsgManager.notificationMessage ( 'Error - loginData dcdConfig Empty!', 'notificationRed', undefined, '', 'right', 'top' );
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
			MsgManager.notificationMessage ( 'Login Failed' + errDetail, 'notificationRed', undefined, '', 'right', 'top' );

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
		
		$( '#advanceOptionLoginBtn' ).removeClass( 'dis' ).addClass( 'l-emphasis' );

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
	
	me.getInputBtnPairTags = function( formDivStr, pwdInputStr, btnStr, returnFunc )
	{
		$( formDivStr ).each( function( i ) {

			var formDivTag = $( this );
			var loginUserPinTag = formDivTag.find( pwdInputStr );
			var loginBtnTag = formDivTag.find( btnStr );

			returnFunc( loginUserPinTag, loginBtnTag );

		});	
	}

	me.setUpInputTypeCopy = function( inputTags ) {
		inputTags.keyup( function() {  // keydown vs keypress
			// What about copy and paste?
			var changedVal = $( this ).val();
			console.customLog( 'changedVal: ' + changedVal );
			inputTags.val( changedVal );
		});	
	};

	me.setUpEnterKeyExecute = function( inputTag, btnTag ) {
		inputTag.keypress( function(e) {
			if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
				btnTag.click();
				return false;
			} else {
				return true;
			}			
		});		
	};


	// ================================

	me.initialize();
}