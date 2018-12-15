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
	me._pHash = '';
	me._staySignedIn = true;

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.createSubClasses();

		me.setEvents_OnInit();
	}

	me.render = function()
	{
		me.openForm();
	}

	// ------------------

	me.createSubClasses = function() { }

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

		//me.setSkipLoginBtnClick();

		me.setloginBtnClearClick();

		//me.setUpEnterKeyLogin(); // Not working, thus, disabled for now
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

		// New UI Button click
		$( '.loginBtnAdv' ).click( function() {
			var parentTag = $( this ).parent();
			var loginServer = parentTag.find( 'input.loginServerAdv' ).val();
			var loginUserNameVal = parentTag.find( 'input.loginUserNameAdv' ).val();
			var loginUserPinVal = parentTag.find( 'input.loginUserPinAdv' ).val();

			me.processLogin( loginUserNameVal, loginUserPinVal, loginServer, $( this ) );
		});
	}

	me.setloginBtnClearClick = function()
	{
		$( '.loginBtnClear' ).click( function() {
	
			$( 'input.loginUserName' ).val('');
			$( 'input.loginUserPin' ).val('');
			$( 'input.loginUserNameAdv' ).val('');
			$( 'input.loginUserPinAdv' ).val('');

			me.openForm();
 
		} );	
	}
	
	me.setUpEnterKeyLogin = function()
	{
		/*
		me.setUpEnterKeyExecute( me.loginPasswordTag, me.loginBtnTag );
		
		me.getInputBtnPairTags( 'div.loginFormDiv', 'input.loginUserPin', '.loginBtn', function( loginUserPinTag, loginBtnTag )
		{
			me.setUpEnterKeyExecute( loginUserPinTag, loginBtnTag );			
		});
		*/
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
		divIcon.html( $( '<img src="img/logo_top.svg">' ) );
		/*if ( me.cwsRenderObj.manifest )
		{
			me.pageTitleDivTab.show();
			me.pageTitleDivTab.html ( JSON.parse(me.cwsRenderObj.manifest).short_name );
		}*/
		me.pageTitleDivTab.show();
		me.pageTitleDivTab.html ( 'CONNECT' );
		/* END > Added by Greg (2018/12/10) */

	}

	me.closeForm = function()
	{
		me.loginFormDivTag.hide();
		me.pageDivTag.show( 'fast' );

		me.cwsRenderObj.configureMobileMenuIcon();
	}

	me.processLogin = function( userName, password, server, btnTag )
	{
		var parentTag = btnTag.parent();

    	// Greg added: 2018/11/23
		var dtmNow = ( new Date() ).toISOString();
		me._staySignedIn = ( btnTag.parent().find( 'input.stayLoggedIn' ). prop("checked") == true );
		me._userName = userName;

		parentTag.find( 'div.loadingImg' ).remove();

		FormUtil.login_server = server;

		// ONLINE vs OFFLINE HANDLING
		if ( ConnManager.getAppConnMode_Offline() )
		{
			/* START > Added by Greg: 2018/11/26 */
			// validate encrypted pwd against already stored+encrypted pwd
			if ( password == Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4) )
			{
				var loginData = DataManager.getData( userName );

				if ( loginData ) 
				{
					if ( loginData.mySession.pin ) me._pHash = loginData.mySession.pin;
					FormUtil.setLogin( userName, password ); /* Added by Greg: 2018/11/27 */
					me.loginSuccessProcess( loginData );
				}
			}
			else
			{
				alert( 'Offline Login Failed - userName/pin does not match' );
			}
			/* END > Added by Greg: 2018/11/26 */
		}
		else
		{
			var loadingTag = FormUtil.generateLoadingTag( btnTag );

			FormUtil.submitLogin( userName, password, loadingTag, function( success, loginData ) 
			{
				if ( success )
				{
					me._pHash = Util.encrypt(password,4);
					me.loginSuccessProcess( loginData );
				}
				else
				{
					var errDetail = ( loginData && loginData.returnCode === 502 ) ? " - Server not available" : "";
					
					alert( 'Login Failed' + errDetail );
				}
			} );
		}

		/* START: Added by Greg: 2018/11/23 */
		var lastSession = { user: userName, lastUpdated: dtmNow }; //, networkOnline: ConnManager.getAppConnMode_Offline()
		DataManager.saveData( 'session', lastSession );	
		/* END: Added by Greg: 2018/11/23 */

	}

	me.regetDCDconfig = function()
	{
		var userName = JSON.parse( localStorage.getItem('session') ).user;
		var userPin = Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4);

		// greg: use location.origin for server parameter? Always records server location
		me.processLogin( userName, userPin, location.origin, $( this ) );
	}

	me.loginSuccessProcess = function( loginData ) 
	{		

		me.closeForm();
		me.pageTitleDivTab.hide(); 

		// Set Logged in orgUnit info
		if ( loginData.orgUnitData )
		{
			me.loggedInDivTag.show();
			me.spanOuNameTag.show();
			me.spanOuNameTag.text( '[' + loginData.orgUnitData.userName + ']' ).attr( 'title', loginData.orgUnitData.ouName );	
		} 

		// Load config and continue the CWS App process
		if ( loginData.dcdConfig ) 
		{
			FormUtil.dcdConfig = loginData.dcdConfig; 
			// call CWS start with this config data..
			me.cwsRenderObj.startWithConfigLoad( loginData.dcdConfig );
		}


		var dtmNow = ( new Date() ).toISOString();

		// if session data exists, update the lastUpdated date else create new session data
		if ( loginData.mySession ) 
		{
			loginData.mySession.lastUpdated = dtmNow;
			loginData.mySession.stayLoggedIn = me._staySignedIn;

			DataManager.saveData( me._userName, loginData );	
		}
		else
		{
			var newSaveObj = Object.assign( {} , loginData);

			newSaveObj.mySession = { createdDate: dtmNow, lastUpdated: dtmNow, server: FormUtil.login_server, pin: me._pHash, stayLoggedIn: me._staySignedIn };

			DataManager.saveData( me._userName, newSaveObj );

			FormUtil.dcdConfig = newSaveObj.dcdConfig; 
		}

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