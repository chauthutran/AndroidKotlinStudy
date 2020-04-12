// -------------------------------------------
// -- SessionManager Class/Methods

function SessionManager() {}

SessionManager.sessionData = {
	login_UserName: '',
	login_Password: '',
	orgUnitData: undefined,
	dcdConfig: undefined
};

// ---------------------------------------

SessionManager.loadDataInSession = function( userName, password, loginData ) 
{
	var newSessionInfo = { 
		login_UserName: userName,
		login_Password: password,
		orgUnitData: loginData.orgUnitData,
		dcdConfig: loginData.dcdConfig
	};	

	Util.mergeJson( SessionManager.sessionData, newSessionInfo );
	
	// TODO: Need to set 'configManager'
	ConfigManager.setConfigJson( SessionManager.sessionData );

};

SessionManager.saveUserSessionToStorage = function( loginData, userName, password )
{
	// NOTE!!!!
	//	- session data management!!!!  Not here!!!
	var dtmNow = ( new Date() ).toISOString();

	var newSaveObj = Object.assign( {} , loginData);

	FormUtil.defaultLanguage( function( defaultLang )
	{
		newSaveObj.mySession = { 
			createdDate: dtmNow, 
			lastUpdated: dtmNow, 
			pin: Util.encrypt( password, 4 ), 
			stayLoggedIn: false, 
			theme: loginData.dcdConfig.settings.theme, 
			language: defaultLang 
		};

		DataManager.saveData( userName, newSaveObj );
	});
};


SessionManager.updateUserSessionToStorage = function( loginData, userName )
{
	var dtmNow = ( new Date() ).toISOString();

	// if session data exists, update the lastUpdated date else create new session data
	if ( loginData.mySession ) 
	{
		loginData.mySession.lastUpdated = dtmNow;
		loginData.mySession.stayLoggedIn = false;

		DataManager.saveData( userName, loginData );			
	}
};

/*
SessionManager.saveUserSessionToStorage = function( loginData, userName, password )
{
	// NOTE!!!!
	//	- session data management!!!!  Not here!!!
	var dtmNow = ( new Date() ).toISOString();

	// if session data exists, update the lastUpdated date else create new session data
	if ( loginData.mySession ) 
	{
		loginData.mySession.lastUpdated = dtmNow;
		loginData.mySession.stayLoggedIn = false;

		DataManager.saveData( userName, loginData );			
	}
	else
	{
		var newSaveObj = Object.assign( {} , loginData);

		FormUtil.defaultLanguage( function( defaultLang )
		{
			newSaveObj.mySession = { 
				createdDate: dtmNow, 
				lastUpdated: dtmNow, 
				pin: Util.encrypt( password, 4 ), 
				stayLoggedIn: false, 
				theme: loginData.dcdConfig.settings.theme, 
				language: defaultLang 
			};

			DataManager.saveData( userName, newSaveObj );
		});
	}
};
*/
