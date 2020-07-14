// -------------------------------------------
// -- Login Class/Methods
function Login( cwsRenderObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;

	me.loginFormDivTag = $( "#loginFormDiv" );
	me.pageDivTag = $( "#pageDiv" );	// Get it from cwsRender object?
	me.menuTopDivTag; // = $( '#menuTopDiv' ); //edited by Greg (2018/12/10)

	me.loggedInDivTag = $("#loggedInDiv");
	me.navTitleTextTag = $( '.Nav__Title' );
	me.pageTitleDivTab = $( 'div.logo-desc-all' );
	me.scrimTag = $('.scrim');
	me.sheetBottomTag = $('.sheet_bottom');

	me.loginBtnTag = $( '.loginBtn' );
	me.passRealTag = $( '#passReal' );
	me.loginUserNameTag = $(".loginUserName");
	me.loginUserPinTag = $(".loginUserPin");
	me.loginFormTag = $( 'div.login_data' );
	me.advanceOptionLoginBtnTag = $("#advanceOptionLoginBtn");


	
	me.loginFormTag = $(".login_data__fields");
	me.loginFieldTag = $("#loginField");


  	// Greg added: 2018/11/23 -- below 3 lines
	me._userName = '';
	//me._pHash = '';
	//me._staySignedIn = false;

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setEvents_OnInit();
	}

	me.render = function()
	{
		me.openForm();
	}

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

			console.log( 'scrimTag click - unblock Page' );

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

		me.scrimTag.off( 'click' );

		me.scrimTag.click( function(){
			me.unblockPage();
		} )
	}

	me.unblockPage = function()
	{
		me.scrimTag.hide();
		me.sheetBottomTag.html("");
	}
	
	me.setAdvOptBtnClick = function()
	{
		me.advanceOptionLoginBtnTag.click( function() {

			if ( ! $( this ).hasClass( 'dis' ) )
			{
				me.blockPage();

				// create and reference templatesManager here:
				me.sheetBottomTag.html ( Templates.Advance_Login_Buttons );
				me.sheetBottomTag.show();
				me.cwsRenderObj.langTermObj.translatePage();
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

					$("#accept").click( function() {
						DataManager2.deleteAllStorageData( function() {
							location.reload( true );
							//me.cwsRenderObj.reGetAppShell(); 
						});
					});

					$("#cancel").click( function() {
						me.unblockPage();
					});
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
			// OFFLINE Login
			// validate encrypted pwd against already stored+encrypted pwd
			var offlineUserData = SessionManager.getOfflineUserData( userName );

			if ( offlineUserData )
			{
				if ( password === SessionManager.getOfflineUserPin( offlineUserData ) )
				{					
					if ( SessionManager.checkLoginData( offlineUserData ) )
					{
						// Update current user login information ( lastUpdated, stayLoggedIn )
						SessionManager.updateUserSessionToStorage( offlineUserData, userName );
						
						// load to session in memory
						SessionManager.loadDataInSession( userName, password, offlineUserData );

						me.loginSuccessProcess( offlineUserData );
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
		}
		else
		{
			var loadingTag = FormUtil.generateLoadingTag( btnTag.find( '.button-label' ) );
			me.onlineLogin( userName, password, loadingTag, function( success, loginData ){
				me.showErrorMsgIfAny ( success, loginData );
			} );
		}

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
	
	me.onlineLogin = function( userName, password, loadingTag, execFunc )
	{
		WsCallManager.submitLogin( userName, password, loadingTag, function( success, loginData ) 
		{
			me.setLoginData( loginData, userName, password );

			if( execFunc ) execFunc( success, loginData );
		} );
	}

	me.setLoginData = function( loginData, userName, password )
	{
		if ( loginData != undefined && loginData.orgUnitData != undefined && loginData.dcdConfig != undefined )
		{
			SessionManager.saveUserSessionToStorage( loginData, userName, password );

			// load to session in memory
			SessionManager.loadDataInSession( userName, password, loginData );
		}
	}

	me.showErrorMsgIfAny = function ( success, loginData )
	{
		if ( success )
		{
			me.loginSuccessProcess( loginData );

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
		}
		else
		{
			var errDetail = ( loginData && loginData.returnCode === 502 ) ? " - Server not available" : "";

			// MISSING TRANSLATION
			MsgManager.notificationMessage ( 'Login Failed' + errDetail, 'notificationRed', undefined, '', 'right', 'top' );
		}
	};

	
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
			console.log( 'changedVal: ' + changedVal );
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