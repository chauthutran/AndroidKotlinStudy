//	TODO: ?: Rename to 'KeycloakLSManager'?
function KeycloakLSManager() { }

// ---------------------------------------------------------------------------------------------

KeycloakLSManager.KEY_KEYCLOAK_INFO = "keycloakInfo";
KeycloakLSManager.KEY_LOGIN_DATE = 'loginDate';
KeycloakLSManager.KEY_ACCESS_TOKEN = 'accessToken';
KeycloakLSManager.KEY_REFRESH_TOKEN = 'refreshToken';
KeycloakLSManager.KEY_ID_TOKEN = 'idToken';
KeycloakLSManager.KEY_PROCESSING_ACTION = 'processingAction';
KeycloakLSManager.KEY_KEYCLOCK_USE = "keyClockUse"; 
KeycloakLSManager.KEY_AUTH_CHOICE = "authChoice";
// KeycloakLSManager.KEY_KEYCLOAK_OBJ_INIT = "kcObjInited";


KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT = "logout";
KeycloakLSManager.KEY_LAST_KEYCLOAK_EVENTS = "lastKeycloakEvents";

// ---------------------------------------------------------------------------------------------

KeycloakLSManager.setKeycloakInfo = function (kcObj) {
	KeycloakLSManager.updatePropertyValue(KeycloakLSManager.KEY_LOGIN_DATE, UtilDate.dateStr("DATETIME"));
	KeycloakLSManager.updatePropertyValue(KeycloakLSManager.KEY_ACCESS_TOKEN, kcObj.token);
	KeycloakLSManager.updatePropertyValue(KeycloakLSManager.KEY_REFRESH_TOKEN, kcObj.refreshToken);
	KeycloakLSManager.updatePropertyValue(KeycloakLSManager.KEY_ID_TOKEN, kcObj.idToken);

	KeycloakLSManager.setProcessingAction("");
}


// ----------------------------------------------------
//  Auth Choice (Very 1st Page/Selection - before login)

// Get the 10 latest Keycloak events
KeycloakLSManager.setLastKeycloakEvent = function (value) {
	var lastKeycloakEvents = KeycloakLSManager.getLastKeycloakEvents();
	lastKeycloakEvents.unshift( UtilDate.dateStr("DATETIME") + ":" + value );
	KeycloakLSManager.updatePropertyValue(KeycloakLSManager.KEY_LAST_KEYCLOAK_EVENTS, lastKeycloakEvents.slice(0, 10) );
}

// This is an array
KeycloakLSManager.getLastKeycloakEvents = function () {
	var data = KeycloakLSManager.getPropertyValue(KeycloakLSManager.KEY_LAST_KEYCLOAK_EVENTS);
	return ( data == undefined ) ? [] : data;
}



KeycloakLSManager.setProcessingAction = function (value) {
	if( value == "") KeycloakLSManager.removeProperty( KeycloakLSManager.KEY_PROCESSING_ACTION );
	else KeycloakLSManager.updatePropertyValue(KeycloakLSManager.KEY_PROCESSING_ACTION, value);
}

KeycloakLSManager.getProcessingAction = function () {
	return KeycloakLSManager.getPropertyValue(KeycloakLSManager.KEY_PROCESSING_ACTION);
}


KeycloakLSManager.getLastLoginDate = function () {
	return KeycloakLSManager.getPropertyValue(KeycloakLSManager.KEY_LOGIN_DATE);
}

KeycloakLSManager.getAccessToken = function () {
	return KeycloakLSManager.getPropertyValue(KeycloakLSManager.KEY_ACCESS_TOKEN);
}

KeycloakLSManager.getRefreshToken = function () {
	return KeycloakLSManager.getPropertyValue(KeycloakLSManager.KEY_REFRESH_TOKEN);
}

KeycloakLSManager.getIdToken = function () {
	return KeycloakLSManager.getPropertyValue(KeycloakLSManager.KEY_ID_TOKEN);
}

KeycloakLSManager.getAccessTokenParsed = function () {
	var token = KeycloakLSManager.getAccessToken();
	return KeycloakLSManager.decodeToken(token);
}

KeycloakLSManager.getRefreshTokenParsed = function () {
	var token = KeycloakLSManager.getRefreshToken();
	return KeycloakLSManager.decodeToken(token);
}

KeycloakLSManager.getIdTokenParsed = function () {
	var token = KeycloakLSManager.getIdToken();
	return KeycloakLSManager.decodeToken(token);
}

// ---------------------------------------------
//KeycloakLSManager.removeTokens_LoginDate = function()
KeycloakLSManager.authOut_DataRemoval_wtTokens = function()
{
	KeycloakLSManager.removeProperty( KeycloakLSManager.KEY_ACCESS_TOKEN );
	KeycloakLSManager.removeProperty( KeycloakLSManager.KEY_REFRESH_TOKEN );
	KeycloakLSManager.removeProperty( KeycloakLSManager.KEY_ID_TOKEN );

	KeycloakLSManager.removeProperty( KeycloakLSManager.KEY_LOGIN_DATE );
	KeycloakLSManager.removeProperty( KeycloakLSManager.KEY_PROCESSING_ACTION );
};


// ----------------------------------------------------
//  Auth Choice (Very 1st Page/Selection - before login)
KeycloakLSManager.setAuthChoice = function( authChoice )
{
   KeycloakLSManager.updatePropertyValue( KeycloakLSManager.KEY_AUTH_CHOICE, authChoice );
};

KeycloakLSManager.getAuthChoice = function()
{
   return KeycloakLSManager.getPropertyValue( KeycloakLSManager.KEY_AUTH_CHOICE );
};

// REMOVAL METHOD -->  KeycloakLSManager.removeProperty( KeycloakLSManager.KEY_AUTH_CHOICE );

// ---------------------------------------------------------------------------------------------
// Supportive methods

KeycloakLSManager.removeProperty = function (key) {
	var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);
	delete keycloakInfo[key];

	KeycloakLSManager.saveKeycloakInfoData(keycloakInfo);

};

KeycloakLSManager.getPropertyValue = function(key) {
	var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);

	return (keycloakInfo == undefined) ? undefined : keycloakInfo[key];
};

KeycloakLSManager.updatePropertyValue = function(key, value) {
	var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);
	if (keycloakInfo == undefined) {
		keycloakInfo = {};
	}
	keycloakInfo[key] = value;

	// Update data in memory
	KeycloakLSManager.saveKeycloakInfoData(keycloakInfo);
};


KeycloakLSManager.saveKeycloakInfoData = function(keycloakInfo) {
	LocalStgMng.saveJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO, keycloakInfo);
};

KeycloakLSManager.decodeToken = function (token) 
{
	var output = '';

	try 
	{
		if (token != undefined) {
			token = token.split('.')[1];

			token = token.replace(/-/g, '+');
			token = token.replace(/_/g, '/');
			switch (token.length % 4) {
				case 0:
					break;
				case 2:
					token += '==';
					break;
				case 3:
					token += '=';
					break;
				default:
					throw 'Invalid token';
			}

			token = decodeURIComponent(escape(atob(token)));

			output = JSON.parse(token);
		}
	}
	catch( errMsg ) {  console.log( 'ERROR in KeycloakLSManager.decodeToken' );  }

    return output;
}
