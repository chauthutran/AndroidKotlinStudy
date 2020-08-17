// -------------------------------------------
// -- Login Class/Methods
function Login( cwsRenderObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;

	me.loginFormDivTag = $( '#loginFormDiv' );
	me.pageDivTag = $( '#pageDiv' );	// Get it from cwsRender object?
	me.loggedInDivTag = $( '#loggedInDiv' );
	me.navTitleTextTag = $( '.Nav__Title' );
	me.pageTitleDivTab = $( 'div.logo-desc-all' );
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

	me._userName = '';

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setEvents_OnInit();
	}

	me.render = function()
	{
		me.openForm();

		me.mobileCssSetup();

		FormUtil.setUpLoginInputsEvents();

		me.browserResizeHandle();  // For keyboard resizing on mobile, and other resize blinker move..
		
		FormUtil.positionLoginPwdBlinker();
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
		me.scrimTag.click( function() {

			console.customLog( 'scrimTag click - unblock Page' );

			me.unblockPage();
		});

		me.loginBtnTag.focus( function() {
			me.passRealTag.hide();
		});

		me.loginBtnTag.click( function() {

			var loginUserNameVal = me.loginUserNameTag.val();
			var loginUserPinVal = me.loginUserPinTag.val();

			if( loginUserNameVal == "" || loginUserPinVal == "" )
			{
				MsgManager.notificationMessage ( 'Please enter username / password', 'notificationRed', undefined, '', 'right', 'top' );
			}
			else
			{
				me.processLogin( loginUserNameVal, loginUserPinVal, location.origin, $( this ) );
			}
			
		});
		
		
	}
	
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
				me.cwsRenderObj.langTermObj.translatePage();

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
					me.cwsRenderObj.langTermObj.translatePage();
	
					$( '#accept' ).click( function() {

						DataManager2.deleteAllStorageData( function() {
							location.reload( true );
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

	}

	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.openForm = function()
	{
		me.pageDivTag.hide();		
		me.loginFormDivTag.show( 'fast' );

		if ( ! me.loginFormDivTag.is( ":visible" ) )
        {
            me.loginFormDivTag.show();
		}

		me.loggedInDivTag.hide();

		Menu.setInitialLogInMenu( me.cwsRenderObj );
	};


	me.closeForm = function()
	{
		me.loginFormDivTag.hide();
		me.pageDivTag.show( 'fast' );

		me.loginFieldTag.show();		
	};


	// ------------------------------------------
	// --- Perform Login Related...

	me.processLogin = function( userName, password, server, btnTag )
	{
		var parentTag = btnTag.parent();
		var dtmNow = ( new Date() ).toISOString();

		me._userName = userName;

		parentTag.find( 'div.loadingImg' ).remove();


		// ONLINE vs OFFLINE HANDLING
		if ( !ConnManagerNew.isAppMode_Online() )
		{
			me.loginOffline( userName, password, function( offlineUserData ) 
			{
				me.loginSuccessProcess( offlineUserData );
			});
		}
		else
		{
			var loadingTag = FormUtil.generateLoadingTag( btnTag.find( '.button-label' ) );

			me.loginOnline( userName, password, loadingTag, function( loginData ) 
			{
				me.retrieveStatisticPage( ( fileName, statPageData ) => { me.saveStatisticPage( fileName, statPageData ); } );

				me.loginSuccessProcess( loginData );
			});
		}

		// NOTE: Right location to call?  <-- always call even the no login?
		// If to be called only on sucess login, use this on 'loginSuccessProcess' ?
		AppInfoManager.createUpdateUserInfo( userName );
	};

	
	me.loginSuccessProcess = function( loginData ) 
	{		
		// After Login, run/setup below ones.
		SessionManager.setLoginStatus( true );		

		SyncManagerNew.SyncMsg_Reset();

		InfoDataManager.setDataAfterLogin();

		// Load Activities
		me.cwsRenderObj.loadActivityListData_AfterLogin( function() 
		{
			me.closeForm();
			me.pageTitleDivTab.hide(); 

			// Load config and continue the CWS App process
			if ( loginData.dcdConfig ) 
			{
				// call CWS start with this config data..
				me.cwsRenderObj.startWithConfigLoad( loginData.dcdConfig );

				me.loginAfter();
			}
			else
			{
				// MISSING TRANSLATION
				MsgManager.notificationMessage ( 'Login Failed > unexpected error, cannot proceed', 'notificationRed', undefined, '', 'right', 'top' );
			}

			$( '.Nav1' ).css( 'display', 'flex' );

			//me.cwsRenderObj.langTermObj.translatePage();

		});
	};

	me.loginAfter = function()
	{
		FormUtil.geolocationAllowed();

		me.cwsRenderObj.renderDefaultTheme();

		MsgManager.initialSetup();

		ScheduleManager.runSchedules_AfterLogin( me.cwsRenderObj );

		me.loginAfter_UI_Update();
	};

	// ----------------------------------------------
	
	me.loginOnline = function( userName, password, loadingTag, execFunc )
	{
		WsCallManager.submitLogin( userName, password, loadingTag, function( success, loginData ) 
		{			
			me.checkLoginData_wthErrMsg( success, loginData, function() {

				// Save 'loginData' in localStorage and put it on session memory
				SessionManager.saveUserSessionToStorage( loginData, userName, password );
				SessionManager.loadDataInSession( userName, password, loginData );

				if( execFunc ) execFunc( loginData );
			});								
		} );
	};

	
	me.loginOffline = function( userName, password, execFunc )
	{
		var offlineUserData = SessionManager.getOfflineUserData( userName );

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

					execFunc( offlineUserData );
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
	};

	// ----------------------------


	me.checkLoginData_wthErrMsg = function ( success, loginData, noErrorRun )
	{
		if ( success )
		{
			if ( !loginData )
			{
				MsgManager.notificationMessage ( 'Error - loginData Empty!', 'notificationRed', undefined, '', 'right', 'top' );
			} 
			else if ( !loginData.orgUnitData ) 
			{
				MsgManager.notificationMessage ( 'Error - loginData orgUnitData Empty!', 'notificationRed', undefined, '', 'right', 'top' );
			}
			else if ( !loginData.dcdConfig ) 
			{
				MsgManager.notificationMessage ( 'Error - loginData dcdConfig Empty!', 'notificationRed', undefined, '', 'right', 'top' );
			}
			else
			{
				if ( noErrorRun ) noErrorRun();
			}
		}
		else
		{
			var errDetail = ( loginData && loginData.returnCode === 502 ) ? " - Server not available" : "";

			// MISSING TRANSLATION
			MsgManager.notificationMessage ( 'Login Failed' + errDetail, 'notificationRed', undefined, '', 'right', 'top' );
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


	me.loginAfter_UI_Update = function()
	{

		/*me.loginUserNameTag.attr( 'readonly',true );
		$( 'div.loginSwitchUserNotification' ).show();
		$( 'div.Nav__icon' ).addClass( 'closed' );
		me.loginFieldTag.hide();
		me.loginFormTag.find( 'h4' ).remove();
		$( '<h4>'+ me.loginUserNameTag.val() +'<h4>' ).insertBefore( me.loginFieldTag );*/

		var loginUserNameH4Tag = $( '#loginUserNameH4' );

		//loginUserNameH4Tag.show();

		// Div (Input) part of Login UserName
		$( '#loginField' ).hide();

		// input parts..  Below will be hidden, though...
		//$( 'input.loginUserName' ).val( lastSession.user );	
		$( 'input.loginUserName' ).attr( 'readonly',true );

		// Display login name as Big text part - if we already have user..
		loginUserNameH4Tag.text( me.loginUserNameTag.val() ).show();
		
		$( '#advanceOptionLoginBtn' ).removeClass( 'dis' ).addClass( 'l-emphasis' );

		// MOVED TO syncManagerNew
    	//SyncManagerNew.networkStatusClickSetup();

		FormUtil.hideProgressBar();
	};


	me.clearLoginPin = function()
	{
		// clear password pin
		$( '#pass' ).val( '' );
		$( '#passReal' ).val( '' );
	};

	// --------------------------------------
	// --- Mobile Phone related Setups

	me.isMobileDevice = function()
	{
		return ( Util.isAndroid() || Util.isIOS() );
	};


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

					FormUtil.setTimedOut_PositionLoginPwdBlinker();
				}
			});
		}
		else
		{
			// Window Resize detection
			$( window ).on( 'resize', function () 
			{
				FormUtil.setTimedOut_PositionLoginPwdBlinker();		
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