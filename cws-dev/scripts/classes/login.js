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
	me.navTitleUserNameTag = $( '.Nav__Title' );
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
		me.scrimTag.click(function () {

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
	}

	me.unblockPage = function()
	{
		me.scrimTag.hide();
		me.sheetBottomTag.html("");
	}
	
	me.setAdvOptBtnClick = function()
	{
		me.advanceOptionLoginBtnTag.click( function() {

			me.blockPage();

			// create and reference templatesManager here:
			me.sheetBottomTag.html ( Templates.Advance_Login_Buttons );
			me.sheetBottomTag.show();
			me.cwsRenderObj.langTermObj.translatePage();


			$("#switchToStagBtn").click(function () {
				me.unblockPage();
				alert('switchToStagBtn');
			});

			$("#demoBtn").click(function () {
				me.unblockPage();
				alert('demo');
			});

			$("#changeUserBtn").click(function () {
				me.sheetBottomTag.html ( Templates.Change_User_Form );
				me.cwsRenderObj.langTermObj.translatePage();

				$("#accept").click(function () {
					DataManager2.deleteAllStorageData( function() {
						location.reload( true );
						//me.cwsRenderObj.reGetAppShell(); 
					});
				});

				$("#cancel").click(function () {
					me.unblockPage();
				});

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
		// me.loggedInDivTag.show();
		
		Menu.setInitialLogInMenu( me.cwsRenderObj );
	};


	me.closeForm = function()
	{
		me.loginFormDivTag.hide();
		me.pageDivTag.show( 'fast' );

		me.loginFieldTag.show();		
	};


	me.processLogin = function( userName, password, server, btnTag )
	{
		var parentTag = btnTag.parent();
		var dtmNow = ( new Date() ).toISOString();

		me._userName = userName;

		parentTag.find( 'div.loadingImg' ).remove();

		// ONLINE vs OFFLINE HANDLING
		if ( ! ConnManagerNew.isAppMode_Online() )
		{
			// OFFLINE Login
			// validate encrypted pwd against already stored+encrypted pwd
			if ( FormUtil.getUserSessionAttr( userName,'pin' ) )
			{
				if ( password === Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4) )
				{
					DataManager.getData( userName, function( loginData ) {

						SessionManager.updateUserSessionToStorage( loginData, userName );
						
						// load to session in memory
						SessionManager.loadDataInSession( userName, password, loginData );

						me.loginSuccessProcess( loginData );

					});
				}
				else
				{
					// MISSING TRANSLATION
					MsgManager.notificationMessage ( 'Login Failed > invalid userName/pin', 'notificationRed', undefined, '', 'right', 'top' );
				}
			}
			else
			{
				// MISSING TRANSLATION
				MsgManager.notificationMessage ( 'No Offline UserSession Available', 'notificationDark', undefined, '', 'right', 'top' );
			}
		}
		else
		{
			
			var loadingTag = FormUtil.generateLoadingTag( btnTag.find( '.button-label' ) );

			WsCallManager.submitLogin( userName, password, loadingTag, function( success, loginData ) 
			{
				if ( success )
				{
					SessionManager.saveUserSessionToStorage( loginData, userName, password );

					// load to session in memory
					SessionManager.loadDataInSession( userName, password, loginData );

					me.loginSuccessProcess( loginData );
				}
				else
				{
					var errDetail = ( loginData && loginData.returnCode === 502 ) ? " - Server not available" : "";

					// MISSING TRANSLATION
					MsgManager.notificationMessage ( 'Login Failed' + errDetail, 'notificationRed', undefined, '', 'right', 'top' );
				}

			} );
		}


		// TODO: NOTE: SAVING SESSION INFO FOR THE FIRST TIME AT HERE?
		FormUtil.defaultLanguage( function( defaultLang ){

			var lastSession = AppInfoManager.getUserInfo();

			if ( lastSession == undefined )
			{
				lastSession = { user: userName, lastUpdated: dtmNow, language: defaultLang, soundEffects: ( Util.isMobi() ), autoComplete: true, logoutDelay: 60 };
			}
			else
			{
				lastSession.user = userName;

				if ( lastSession.soundEffects == undefined ) lastSession.soundEffects = ( Util.isMobi() );
				if ( lastSession.autoComplete == undefined ) lastSession.autoComplete = true; 
				if ( lastSession.logoutDelay == undefined ) lastSession.logoutDelay = 60;
			}
			
			AppInfoManager.updateUserInfo( lastSession );

		});
	};


	me.regetDCDconfig = function()
	{
		var userName = AppInfoManager.getUserInfo().user;
		var userPin = Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4);

		me.processLogin( userName, userPin, location.origin, $( this ) );
	};


	me.loginSuccessProcess = function( loginData ) 
	{		
		// After Login, reset some things..
		SyncManagerNew.SyncMsg_Reset();

		// Load Activities
		me.cwsRenderObj.loadActivityListData_AfterLogin( function() 
		{
			me.closeForm();
			me.pageTitleDivTab.hide(); 

			// Set Logged in orgUnit info
			if ( loginData.orgUnitData )
			{
				me.loggedInDivTag.show();
				me.navTitleUserNameTag.show();
				me.navTitleUserNameTag.text( ' ' + loginData.orgUnitData.userName + ' ' ).attr( 'title', loginData.orgUnitData.ouName );

				$( 'div.navigation__user').html( loginData.orgUnitData.userName );
			} 

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

			me.cwsRenderObj.langTermObj.translatePage();

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


	me.loginAfter_UI_Update = function()
	{
		me.loginUserNameTag.attr( 'readonly',true );
		$( 'div.loginSwitchUserNotification' ).show();
		$( 'div.Nav__icon' ).addClass( 'closed' );
		me.loginFieldTag.hide();
		me.loginFormTag.find( 'h4' ).remove();
		$( '<h4>'+ me.loginUserNameTag.val() +'<h4>' ).insertBefore( me.loginFieldTag );

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