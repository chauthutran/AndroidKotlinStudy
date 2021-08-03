// -------------------------------------------
//      SessionManager Class/Methods
//          - Keeps Session Data in Memory.
//			- FOR NOW, we only store login data in Session.
//				userName/password, orgUnit, configJson

//      - FEATURES:
//          1. Load session data and use the loaded session country configJson to ConfigManager. - 'loadDataInSession'
//			2. Unload session data
//			3. Save session data to local storage - 'saveUserSessionToStorage'
//			4. Update some of session data to local storage - 'updateUserSessionToStorage'
//
//		- NOTE:
//			'LA_TEST_IPC' - in local storage, user name key stores last session data
//			'session' - in local storage, 'session' key stores user name..
//				--> This should be renamed..  Not 'session', but more of 
//				--> 'log'?  'info'?  'storedData'?
//					+ move all other data info this..
//					<-- Create a class to manage the 'storedData'
//
// -------------------------------------------------
function SessionManager() {}

SessionManager.sessionData = {
	login_UserName: '',
	login_Password: '',
	orgUnitData: undefined,
	dcdConfig: undefined
};

SessionManager.Status_LoggedIn = false;  // Login Flag is kept in here, sessionManager.
SessionManager.Status_LogIn_InProcess = false;

// TODO: SHOULD BE MOVED --> GlobalVar..?   AppRef?
SessionManager.cwsRenderObj;  // Login Flag is kept in here, sessionManager.

// ---------------------------------------

// Only used in Login..
SessionManager.loadDataInSession = function( userName, password, loginData ) 
{
	// If dcdConfig or orgUnitData does not exists, we need to notify!!!
	// SessionManager.checkLoginData( loginData );

	var newSessionInfo = { 
		login_UserName: userName,
		login_Password: password,
		orgUnitData: loginData.orgUnitData,
		dcdConfig: loginData.dcdConfig
	};	

	Util.mergeJson( SessionManager.sessionData, newSessionInfo );
	
	// TODO: Need to set 'configManager'
	ConfigManager.setConfigJson( loginData.dcdConfig );
};


// Used in login.js --> validate offline user data
SessionManager.checkLoginData = function( loginData ) 
{
	var validLoginData = false;

	try
	{
		if ( !loginData ) MsgManager.notificationMessage ( 'Error - loginData Empty!', 'notifRed', undefined, '', 'right', 'top' );
		else if ( !loginData.orgUnitData ) MsgManager.notificationMessage ( 'Error - loginData orgUnitData Empty!', 'notifRed', undefined, '', 'right', 'top' );
		else if ( !loginData.dcdConfig ) MsgManager.notificationMessage ( 'Error - loginData dcdConfig Empty!', 'notifRed', undefined, '', 'right', 'top' );
		else 
		{
			validLoginData = true;
		}
	}
	catch ( errMsg )
	{
		console.customLog( 'Error in SessionManager.checkLoginData, errMsg: ' + errMsg );
	}

	return validLoginData;
};


SessionManager.unloadDataInSession = function() 
{
	SessionManager.sessionData = {
		login_UserName: '',
		login_Password: '',
		orgUnitData: undefined,
		dcdConfig: undefined
	};	

	ConfigManager.clearConfigJson();
};

// --------------------------------------------------
// ----- Login Status Check/Set

SessionManager.getLoginStatus = function()
{
	return SessionManager.Status_LoggedIn;
};

SessionManager.setLoginStatus = function( bLoggedIn )
{
	SessionManager.Status_LoggedIn = bLoggedIn;
};

// --------------------------------------------------
// ----- Country Ou Code Check

SessionManager.getLoginCountryOuCode = function()
{
	var ouCode = '';

	try
	{
		ouCode = SessionManager.sessionData.orgUnitData.countryOuCode;
	}
	catch( errMsg ) { console.log( 'ERROR in SessionManager.getLoginCountryOuCode, errMsg: ' + errMsg ); }

	return ouCode;
};

SessionManager.checkLoginCountryOuCode = function( ouCode )
{
	// CountryOuCode <-- 'TZ', 'T_TZ'  <-- Create method for country ou comparison..
	var loginCountryOuCode = SessionManager.getLoginCountryOuCode();

	// Disregard 'T_' in comparison
	ouCode = ouCode.replace( 'T_', '' );
	loginCountryOuCode = loginCountryOuCode.replace( 'T_', '' );

	return ( ouCode === loginCountryOuCode );
};


// --------------------------------------------------

// -- Called after login --> to update the 'User' session data in localStorage.
SessionManager.saveUserSessionToStorage = function( loginData, userName, password )
{
	try
	{
		var newSaveObj = Util.cloneJson( loginData );

		var dtmNow = ( new Date() ).toISOString();
		
		var themeStr = ( loginData 
			&& loginData.dcdConfig 
			&& loginData.dcdConfig.settings 
			&& loginData.dcdConfig.settings.theme ) ? loginData.dcdConfig.settings.theme : "default";
	

		// NOTE: ...
		newSaveObj.mySession = { 
			createdDate: dtmNow // Last online login
			//,lastUpdated: dtmNow // Last offline login? <-- do we need this?
			,pin: Util.encrypt( password, 4 ) // Used on Offline Login password check
			,theme: themeStr 
			//,language: AppInfoManager.getLangCode() // Not Used - Instead, saved in AppInfo.
		};
	
		LocalStgMng.saveJsonData( userName, newSaveObj );
	}
	catch( errMsg )
	{
		console.customLog( 'Error in SessionManager.saveUserSessionToStorage, errMsg: ' + errMsg );
	}

};


SessionManager.getMySessionOnLocalStorage = function( userName )
{
	var userLoginLocalData = SessionManager.getLoginDataFromStorage( userName );

	return ( userLoginLocalData ) ? userLoginLocalData.mySession: undefined;
};

SessionManager.getMySessionCreatedDate = function( userName )
{
	var mySession = SessionManager.getMySessionOnLocalStorage( userName );

	return ( mySession ) ? mySession.createdDate: undefined;
};

// -- Called after offline login --> updates just datetime..
// SessionManager.updateUserSessionToStorage = function( loginData, userName )
// {
// 	var dtmNow = ( new Date() ).toISOString();

// 	// if session data exists, update the lastUpdated date else create new session data
// 	if ( loginData.mySession ) 
// 	{
// 		loginData.mySession.lastUpdated = dtmNow;

// 		LocalStgMng.saveJsonData( userName, loginData );
// 	}
// };


SessionManager.check_warnLastConfigCheck = function( configUpdate )
{
	try
	{
		var lastSessionCreatedDate = SessionManager.getMySessionCreatedDate( SessionManager.sessionData.login_UserName );

		if ( lastSessionCreatedDate && configUpdate.lastTimeCheckedWarning_days !== undefined )
		{
			var warningDays = Number( configUpdate.lastTimeCheckedWarning_days );
			if ( warningDays > 0 )
			{				
				var daysSince = UtilDate.getDaysSince( lastSessionCreatedDate );

				if ( daysSince >= warningDays )
				{
					var warningMsg = ( configUpdate.warningMsg ) ? configUpdate.warningMsg : "WARNING: Last online login were " + warningDays + " days old!!";
					var msgSpanTag = $( '<span term="' + configUpdate.warningMsgTerm + '"></span>' );
					msgSpanTag.text( warningMsg );

					//MsgManager.msgAreaShow( msgSpanTag, 'ERROR' );
					FormMsgManager.showFormMsg( msgSpanTag );  // Shoud display in center!!!
				}
			}
		}	
	}
	catch( errMsg )
	{
		console.log( 'ERROR in SessionManager.check_warnLastConfigCheck, ' + errMsg );
	}
};

// -------------------------------------

SessionManager.getLoginDataFromStorage = function( userName )
{
	return LocalStgMng.getJsonData( userName );
};


SessionManager.saveLoginDataFromStorage = function( userName, loginData )
{
	LocalStgMng.saveJsonData( userName, loginData );
};

// -------------------------------------

// Same call, diff name of 'getLoginDataFromStorage'
SessionManager.getOfflineUserData = function( userName )
{
	return SessionManager.getLoginDataFromStorage( userName );
};

SessionManager.getOfflineUserPin = function( offlineUserData )
{
	var pin = "";
	
	if ( offlineUserData && offlineUserData.mySession && offlineUserData.mySession.pin )
	{
		pin = Util.decrypt( offlineUserData.mySession.pin, 4);
	}

	return pin;
};
