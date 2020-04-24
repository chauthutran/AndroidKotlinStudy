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
	me.navTitleUserNameTag = $( '.Nav__Title' );
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
		me.setLoginBtnEvents();
		me.setAdvOptBtnClick();
	}

	// ---------------------------

	me.setLoginBtnEvents = function()
	{

		$( '.loginBtn' ).focus( function() {
			$( '#passReal' ).hide();
		});

		// New UI Button click
		$( '.loginBtn' ).click( function() {

			var parentTag = $( 'div.login_data' );
			var loginUserNameVal = parentTag.find( 'input.loginUserName' ).val();
			var loginUserPinVal = parentTag.find( 'input.loginUserPin' ).val();

			// greg: use location.origin for server parameter? Always records server location
			me.processLogin( loginUserNameVal, loginUserPinVal, location.origin, $( this ) );
		});

	}
		// dev/test code for Pilar (Greg: 2019/08/06)
	me.setAdvOptBtnClick = function()
	{
		$( '.advOptBtn' ).click( function() {

			$('.scrim').show();
			$('.scrim').css( 'opacity', '0.4' );
			$('.scrim').css( 'z-Index', '109' );


			// create and reference templatesManager here:
			$( 'body' ).append (
			`
			<div id="advOpt" class="login_buttons" style="background-color: white">
			<label>Advance options</label>
			<div class="login_buttons__container">
			  <div class="button h-emphasis button-full_width switchToStagBtn" >
				<div class="button__container ">
				  <div class="button-label">switch to Staging</div>
				</div>
			  </div>
			  <div class="button h-emphasis button-full_width demoBtn" >
				<div class="button__container ">
				  <div class="button-label">Demo mode</div>
				</div>
			  </div>
			  <div class="button h-emphasis button-full_width changeUserBtn" >
				<div class="button__container ">
				  <div class="button-label">Change user</div>
				</div>
			  </div>
			</div>
		  	</div>
			`
		  );

		  $(".scrim").click(function () {
			$('.scrim').css('display', 'none');
			$('#advOpt').remove();
			$('dialog').remove();
		});
		$(".switchToStagBtn").click(function () {
			alert('switchToStagBtn');
		});
		$(".demoBtn").click(function () {
			alert('demo')
			$('dialog').remove()
		});
		$(".changeUserBtn").click(function () {
			$('.scrim').append (
				`
				<dialog id="dialog_alert">
				<div class="dialog__title"><label>Change user</label></div>
				<div class="dialog__text">Changing user will delete all data for %username, including any data not syncronized. </div>
				<div class="dialog__text warning">Are you sure that you want to delete the data for %username and allow new user login ? </div>
				<div class="dialog__action">
				  <div id="dialog_act2" class="button-text warning">
					<div class="button__container">
					  <div class="button-label">ACCEPT</div>
					</div>
				  </div>
				  <div id="dialog_act1" class="button-text primary">
					<div class="button__container">
					  <div class="button-label">CANCEL</div>
					</div>
				  </div>
				</div>
			  </dialog>
				`
			);
			$('#advOpt').remove();
			$('#dialog_alert').css('display', 'block');

			$("#dialog_act2").click(function () {
				localStorage.clear();
				sessionStorage.clear();
				DataManager.dropMyIndexedDB_CAUTION_DANGEROUS()
				$('.scrim').css('display', 'none');
				$('#advOpt').remove()
				$('dialog').remove()
			});
		});
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
		//var divIcon = $( 'div.logo_top' );
		if ( ! me.loginFormDivTag.is( ":visible" ) )
        {
            me.loginFormDivTag.show();
		}

		//$( '#nav-toggle' ).hide();
		$( '#loggedInDiv' ).hide();		

		//me.pageTitleDivTab.show();
		//me.pageTitleDivTab.html ( 'CONNECT' );
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
			//var loadingTag = FormUtil.generateLoadingTag( btnTag.children() );
			var loadingTag = FormUtil.generateLoadingTag( btnTag.find( 'div.loginBtnInner' ) );
			//$( '#ConnectingWithSara' ).rotate({ count:6, forceJS: true, startDeg: 0, endDeg: 360, duration: 0.5 });

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
					//$( '#ConnectingWithSara' ).stop(); //{ endDeg: 360, duration: 0.1 });
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
				me.navTitleUserNameTag.show();
				me.navTitleUserNameTag.text( ' ' + SessionManager.sessionData.orgUnitData.userName + ' ' ).attr( 'title', SessionManager.sessionData.orgUnitData.ouName );
				$( 'div.navigation__user').html( SessionManager.sessionData.orgUnitData.userName );
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

			//$( 'nav' ).show();
			$( 'nav' ).css( 'display', 'flex' );

			// added by Greg: to 'repair' the innerText of Login button (which by this point should hold spinning/progress icon)
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
		$( 'input.loginUserName' ).attr( 'readonly',true );
		$( 'div.loginSwitchUserNotification' ).show();
		$( 'div.Nav__icon' ).addClass( 'closed' );
		$( '#loginField' ).hide();
		$( '.login_data__fields').find( 'h4' ).remove();
		$( '<h4>'+ $( 'input.loginUserName' ).val() +'<h4>' ).insertBefore( $('#loginField') );

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