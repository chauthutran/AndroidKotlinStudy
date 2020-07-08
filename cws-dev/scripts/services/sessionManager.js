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


SessionManager.checkLoginData = function( loginData ) 
{
	var validLoginData = false;

	try
	{
		if ( !loginData ) MsgManager.notificationMessage ( 'Error - loginData Empty!', 'notificationRed', undefined, '', 'right', 'top' );
		else if ( !loginData.orgUnitData ) MsgManager.notificationMessage ( 'Error - loginData orgUnitData Empty!', 'notificationRed', undefined, '', 'right', 'top' );
		else if ( !loginData.dcdConfig ) MsgManager.notificationMessage ( 'Error - loginData dcdConfig Empty!', 'notificationRed', undefined, '', 'right', 'top' );
		else 
		{
			validLoginData = true;
		}
	}
	catch ( errMsg )
	{
		console.log( 'Error in SessionManager.checkLoginData, errMsg: ' + errMsg );
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

// -- Called after login --> to update the 'User' session data in localStorage.
SessionManager.saveUserSessionToStorage = function( loginData, userName, password )
{
	try
	{
		var newSaveObj = Util.getJsonDeepCopy( loginData );

		var dtmNow = ( new Date() ).toISOString();
		
		var themeStr = ( loginData 
			&& loginData.dcdConfig 
			&& loginData.dcdConfig.settings 
			&& loginData.dcdConfig.settings.theme ) ? loginData.dcdConfig.settings.theme : "default";
	
		newSaveObj.mySession = { 
			createdDate: dtmNow, 
			lastUpdated: dtmNow, 
			pin: Util.encrypt( password, 4 ), 
			stayLoggedIn: false, 
			theme: themeStr, 
			language: AppInfoManager.getLangCode() 
		};
	
		LocalStgMng.saveJsonData( userName, newSaveObj );
	}
	catch( errMsg )
	{
		console.log( 'Error in SessionManager.saveUserSessionToStorage, errMsg: ' + errMsg );
	}

};

// -- Called after offline login --> updates just datetime..
SessionManager.updateUserSessionToStorage = function( loginData, userName )
{
	var dtmNow = ( new Date() ).toISOString();

	// if session data exists, update the lastUpdated date else create new session data
	if ( loginData.mySession ) 
	{
		loginData.mySession.lastUpdated = dtmNow;
		loginData.mySession.stayLoggedIn = false;

		LocalStgMng.saveJsonData( userName, loginData );
	}
};


SessionManager.getLoginDataFromStorage = function( userName )
{
	return LocalStgMng.getJsonData( userName );
}


SessionManager.saveLoginDataFromStorage = function( userName, loginData )
{
	LocalStgMng.saveJsonData( userName, loginData );
}