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
	dcdConfig: undefined,
	loginResp: undefined	
};

SessionManager.Status_LoggedIn = false;  // Login Flag is kept in here, sessionManager.
SessionManager.Status_LogIn_InProcess = false;

// TODO: SHOULD BE MOVED --> GlobalVar..?   AppRef?
SessionManager.cwsRenderObj;  // Login Flag is kept in here, sessionManager.

SessionManager.WSblockFormsJson = {};  // Save block payload - search only for now?
SessionManager.WSblockFormsJsonArr = [];  // Save block payload - search only for now?

// ---------------------------------------

// Only used in Login..
SessionManager.loadSessionData_nConfigJson = function( userName, password, loginData ) 
{
	// If dcdConfig or orgUnitData does not exists, we need to notify!!!
	// SessionManager.checkLoginOfflineData( loginData );

	var newSessionInfo = { 
		login_UserName: userName,
		login_Password: password,
		orgUnitData: loginData.orgUnitData,
		dcdConfig: loginData.dcdConfig
	};

	Util.mergeJson( SessionManager.sessionData, newSessionInfo );

	SessionManager.sessionData.loginResp = loginData;  // <-- This will be the matching memory of LoginResp in IndexedDB.

	// Setup/populate data on ConfigManager
	ConfigManager.setConfigJson( loginData );
};


// On logOut..
SessionManager.unloadSessionData_nConfigJson = function() 
{
	SessionManager.sessionData = {
		login_UserName: '',
		login_Password: '',
		orgUnitData: undefined,
		dcdConfig: undefined,
		loginResp: undefined
	};	

	ConfigManager.clearConfigJson();
};

// ----------------------------------------------
// --- IndexedDB loading operations..

// Use for offline loginResp data get.
SessionManager.getLoginRespData_IDB = function( userName, passwd, callBack )
{
	DataManager2.getData_LoginResp( userName, passwd, callBack );  //LocalStgMng.getJsonData( userName );
};

// This is not for updating time to time, but only set after online success login - for offline usage..
SessionManager.setLoginRespData_IDB = function( userName, passwd, loginData, callBack )
{
	DataManager2.saveData_LoginResp( userName, passwd, loginData, callBack );
};

// -----------------------------------------------

// password (& userName) check against the IDB encrpyting
SessionManager.checkPasswordOffline_IDB = function( userName, passwd, callBack )
{
	var IDB_KeyName_appInfo = DataManager2.StorageName_appInfo + '_' + userName;
	
	DataManager2.checkDecriptionPasswd( IDB_KeyName_appInfo, passwd, callBack );
};


SessionManager.checkOfflineDataExists = function( userName, callBack )
{
	var keyName_IDB_appInfo = DataManager2.StorageName_appInfo + '_' + userName;

	DataManager2.checkDataExists_IDB( keyName_IDB_appInfo, callBack );
};


// ----------------------------------------------

// Used in login.js --> validate offline user data
SessionManager.checkLoginOfflineData = function( loginData ) 
{
	var validLoginData = false;

	try
	{
		if ( !loginData ) MsgManager.msgAreaShow( 'Error - loginData Empty!', 'ERROR' );
		else if ( !loginData.orgUnitData ) MsgManager.msgAreaShow( 'Error - loginData orgUnitData Empty!', 'ERROR' );
		else if ( !loginData.dcdConfig ) MsgManager.msgAreaShow( 'Error - loginData dcdConfig Empty!', 'ERROR' );
		else if ( !loginData.dcdConfig.sourceType ) MsgManager.msgAreaShow( 'Error - loginData dcdConfig not valid!', 'ERROR' );
		else validLoginData = true;
	}
	catch ( errMsg )
	{
		console.log( 'Error in SessionManager.checkLoginOfflineData, errMsg: ' + errMsg );
	}

	return validLoginData;
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

SessionManager.getLoginCountryOuCode_NoT = function()
{
	return SessionManager.getLoginCountryOuCode().replace( 'T_', '' );
};

SessionManager.checkLoginCountryOuCode = function( ouCode )
{
	// Disregard 'T_' in comparison
	ouCode = ouCode.replace( 'T_', '' );
	loginCountryOuCode = SessionManager.getLoginCountryOuCode_NoT();

	return ( ouCode === loginCountryOuCode );
};

SessionManager.isTestLoginCountry = function()
{
	return ( SessionManager.getLoginCountryOuCode().indexOf( 'T_' ) === 0 );
};

// --------------------------------------------------

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
		// put this info on 'localStorage' as 'lastOnlineLoginDt'
		var lastOnlineLoginDt = AppInfoLSManager.getLastOnlineLoginDt(); //SessionManager.getMySessionCreatedDate( SessionManager.sessionData.login_UserName );

		if ( lastOnlineLoginDt && configUpdate.lastTimeCheckedWarning_days !== undefined )
		{
			var warningDays = Number( configUpdate.lastTimeCheckedWarning_days );
			if ( warningDays > 0 )
			{				
				var daysSince = UtilDate.getDaysSince( lastOnlineLoginDt );

				if ( daysSince >= warningDays )
				{
					var warningMsg = ( configUpdate.warningMsg ) ? configUpdate.warningMsg : "WARNING: Last online login were " + warningDays + " days old!!";
					var msgSpanTag = $( '<span term="' + configUpdate.warningMsgTerm + '"></span>' );
					msgSpanTag.text( warningMsg );

					//MsgManager.msgAreaShow( msgSpanTag, 'ERROR' );
					MsgFormManager.showFormMsg( 'oldConfigMsg', msgSpanTag );  // Shoud display in center!!!
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

// -----------------------------

// In 'newBlock' button onclick action sequence, we can pass this...  <-- with eval Action..
SessionManager.getWSBlockFormsJson = function( blockId )
{    
	return SessionManager.WSblockFormsJson[ blockId ];
};

SessionManager.getWSBlockFormsJsonLastOnes = function( backCount, optAddBlockId )
{    
	var formsJson;

	backCount = ( backCount ) ? backCount : 1;  // default is '1' which is very last one.

	if ( backCount <= SessionManager.WSblockFormsJsonArr.length ) 
	{
		var idx = SessionManager.WSblockFormsJsonArr.length - backCount;
		var blockId = SessionManager.WSblockFormsJsonArr[ idx ];
		formsJson = SessionManager.getWSBlockFormsJson( blockId );

		if ( optAddBlockId && formsJson ) formsJson.blockId = blockId;
	}

	return ( formsJson ) ? formsJson : undefined;
};

SessionManager.saveWSBlockFormsJson = function( blockId, formsJson )
{    
	if ( blockId && formsJson ) 
	{
		SessionManager.WSblockFormsJson[ blockId ] = formsJson;
		SessionManager.WSblockFormsJsonArr.push( blockId );
	}
};

// Clear this on - login, area start( this should be enough..), tab click?
SessionManager.clearWSBlockFormsJson = function()
{    
	SessionManager.WSblockFormsJson = {};
	SessionManager.WSblockFormsJsonArr = [];
};

// ============================================
// == Session Related DATA MANAGING - IndexedDB
//		- We can only allow this after login, since we need to access data with proper password..
//			- decripted data..

// -- Called after login --> to update the 'User' session data in localStorage.
//SessionManager.saveUserSessionToStorage = function( loginData, userName, password )
	// NOTE: ...
//	newSaveObj.mySession = { 
//		createdDate: dtmNow // Last online login
		//,lastUpdated: dtmNow // Last offline login? <-- do we need this?
//		,pin: Util.encrypt( password, 4 ) // Used on Offline Login password check
//		,theme: 'blue' 
		//,language: PersisDataLSManager.getLangCode() // Not Used - Instead, saved in AppInfo.
//	};

//	LocalStgMng.saveJsonData( userName, newSaveObj );

