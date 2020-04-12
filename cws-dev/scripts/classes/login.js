// -------------------------------------------
// -- Login Class/Methods
function Login( cwsRenderObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;

	me.loginFormDivTag = $( "#loginFormDiv" );
	me.pageDivTag = $( "#pageDiv" );	// Get it from cwsRender object?
	me.menuTopDivTag; // = $( '#menuTopDiv' ); //edited by Greg (2018/12/10)

	me.loggedInDivTag = $( '#loggedInDiv' );
	me.spanOuNameTag = $( '#spanOuName' );
	me.pageTitleDivTab = $( 'div.logo-desc-all' );

  	// Greg added: 2018/11/23 -- below 3 lines
	me._userName = '';
	//me._pHash = '';
	//me._staySignedIn = false;

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setEvents_OnInit();

		//me.createSubClasses();	
	}

	me.render = function()
	{
		me.openForm();
	}

	// ------------------

	//me.createSubClasses = function() { }

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
		me.setLoginBtnClick();
	}

	// ---------------------------

	me.setLoginBtnClick = function()
	{
		// New UI Button click
		$( '.loginBtn' ).click( function() {

			var parentTag = $( this ).parent();
			var loginUserNameVal = parentTag.find( 'input.loginUserName' ).val();
			var loginUserPinVal = parentTag.find( 'input.loginUserPin' ).val();

			// greg: use location.origin for server parameter? Always records server location
			me.processLogin( loginUserNameVal, loginUserPinVal, location.origin, $( this ) );
		});

		// dev/test code for Pilar (Greg: 2019/08/06)
		$( '#loginFormDiv' ).find( '.icon-row' ).click( function() {
			playSound("notify");
		});
		$( '#loginFormDiv' ).find( 'ul.tabs' ).click( function() {
			playSound("notify");
		});
	}

	me.setUpEnterKeyLogin = function()
	{

	}
	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.openForm = function()
	{
		me.pageDivTag.hide();		
		me.loginFormDivTag.show( 'fast' );

		/* START > Added by Greg (2018/12/10) */
		var divIcon = $( 'div.logo_top' );
		if ( ! me.loginFormDivTag.is( ":visible" ) )
        {
            me.loginFormDivTag.show();
		}

		//$( '#nav-toggle' ).hide();
		$( '#loggedInDiv' ).hide();		

		me.pageTitleDivTab.show();
		me.pageTitleDivTab.html ( 'CONNECT' );
		/* END > Added by Greg (2018/12/10) */


		// TODO: NEW JAMES - 2019/01/22
		Menu.setInitialLogInMenu( me.cwsRenderObj );
	};


	me.closeForm = function()
	{
		me.loginFormDivTag.hide();
		me.pageDivTag.show( 'fast' );

		$( '#loggedInDiv' ).show();		

		//me.cwsRenderObj.configureMobileMenuIcon();
	};


	me.processLogin = function( userName, password, server, btnTag )
	{
		var parentTag = btnTag.parent();
		var dtmNow = ( new Date() ).toISOString();

		me._userName = userName;

		parentTag.find( 'div.loadingImg' ).remove();

		// ONLINE vs OFFLINE HANDLING
		//if ( ! ConnManager.networkSyncConditions() )
		if ( ! ConnManagerNew.isAppMode_Online() )
		{
			// OFFLINE Login
			// validate encrypted pwd against already stored+encrypted pwd
			if ( FormUtil.getUserSessionAttr( userName,'pin' ) )
			{
				if ( password === Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4) )
				{
					//var loginData = DataManager.getData( userName );
					DataManager.getData( userName, function( loginData ) {

						//if ( loginData.mySession.pin ) me._pHash = loginData.mySession.pin;
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
				if ( !ConnManager.isOnline() )
				{
					// MISSING TRANSLATION
					MsgManager.notificationMessage ( 'No network connection > cannot login', 'notificationDark', undefined, '', 'right', 'top' );
				}
				else
				{
					// MISSING TRANSLATION
					MsgManager.notificationMessage ( 'Data server offline > cannot verify login details', 'notificationPurple', undefined, '', 'right', 'top' );
				}
			}
			/* END > Added by Greg: 2018/11/26 */
		}
		else
		{
			// ONLINE Login
			var loadingTag = FormUtil.generateLoadingTag( btnTag );

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

			var lastSession = localStorage.getItem( Constants.storageName_session );

			if ( lastSession == undefined || lastSession == null )
			{
				lastSession = { user: userName, lastUpdated: dtmNow, language: defaultLang, soundEffects: ( Util.isMobi() ), autoComplete: true, logoutDelay: 60 };
			}
			else
			{
				lastSession = JSON.parse( lastSession );

				lastSession.user = userName;

				if ( lastSession.soundEffects == undefined ) lastSession.soundEffects = ( Util.isMobi() );
				if ( lastSession.autoComplete == undefined ) lastSession.autoComplete = true; 
				if ( lastSession.logoutDelay == undefined ) lastSession.logoutDelay = 60;
			}


			localStorage.setItem( Constants.storageName_session, JSON.stringify( lastSession ) );

			//DataManager.saveData( Constants.storageName_session, lastSession );

		});
	};


	me.regetDCDconfig = function()
	{
		var userName = JSON.parse( localStorage.getItem(Constants.storageName_session) ).user;
		var userPin = Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4);

		// greg: use location.origin for server parameter? Always records server location
		me.processLogin( userName, userPin, location.origin, $( this ) );
	};


	me.loginSuccessProcess = function( loginData ) 
	{		
		me.cwsRenderObj.loadActivityListData_AfterLogin( function() 
		{
			me.closeForm();
			me.pageTitleDivTab.hide(); 

			// Set Logged in orgUnit info
			if ( loginData.orgUnitData )
			{
				me.loggedInDivTag.show();
				me.spanOuNameTag.show();
				me.spanOuNameTag.text( ' ' + SessionManager.sessionData.orgUnitData.userName + ' ' ).attr( 'title', SessionManager.sessionData.orgUnitData.ouName );
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

			$( 'nav' ).show();

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
		$( 'input.loginUserName' ).attr( 'readonly',true );
		$( 'div.loginSwitchUserNotification' ).show();
		FormUtil.hideProgressBar();
	}

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