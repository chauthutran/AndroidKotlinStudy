//	TODO: ?: Rename to 'KeycloakLSManager'?
function KeycloakLSManager() { }

// ---------------------------------------------------------------------------------------------

KeycloakLSManager.KEY_KEYCLOAK_INFO = "keycloakInfo";
KeycloakLSManager.KEY_LOGIN_DATE = 'loginDate';
KeycloakLSManager.KEY_ACCESS_TOKEN = 'accessToken';
KeycloakLSManager.KEY_REFRESH_TOKEN = 'refreshToken';
KeycloakLSManager.KEY_ID_TOKEN = 'idToken';
KeycloakLSManager.KEY_REALM_NAME = 'realmName';
KeycloakLSManager.KEY_PROCESSING_ACTION = 'processingAction';

KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT = "logout";

// ---------------------------------------------------------------------------------------------

KeycloakLSManager.setLastLoginDate = function () {
	updatePropertyValue(KeycloakLSManager.KEY_LOGIN_DATE, UtilDate.dateStr("DATETIME"));
}

KeycloakLSManager.setKeycloakInfo = function (kcObj) {
	updatePropertyValue(KeycloakLSManager.KEY_LOGIN_DATE, UtilDate.dateStr("DATETIME"));
	updatePropertyValue(KeycloakLSManager.KEY_ACCESS_TOKEN, kcObj.token);
	updatePropertyValue(KeycloakLSManager.KEY_REFRESH_TOKEN, kcObj.refreshToken);
	updatePropertyValue(KeycloakLSManager.KEY_ID_TOKEN, kcObj.idToken);
	// updatePropertyValue( KeycloakLSManager.KEY_ACCESS_TOKEN_PARSED, JSON.stringify(kcObj.tokenParsed) );
	// updatePropertyValue( KeycloakLSManager.KEY_REFRESH_TOKEN_PARSED, JSON.stringify(kcObj.refreshTokenParsed) );
	// updatePropertyValue( KeycloakLSManager.KEY_ID_TOKEN_PARSED, JSON.stringify(kcObj.idTokenParsed) );
	// updatePropertyValue( KeycloakLSManager.KEY_REALM_NAME, kcObj.realm );
}

KeycloakLSManager.setProcessingAction = function (value) {
	updatePropertyValue(KeycloakLSManager.KEY_PROCESSING_ACTION, value);
}

KeycloakLSManager.getProcessingAction = function () {
	return getPropertyValue(KeycloakLSManager.KEY_PROCESSING_ACTION);
}


KeycloakLSManager.getLastLoginDate = function () {
	return getPropertyValue(KeycloakLSManager.KEY_LOGIN_DATE);
}

KeycloakLSManager.getAccessToken = function () {
	return getPropertyValue(KeycloakLSManager.KEY_ACCESS_TOKEN);
}

KeycloakLSManager.getRefreshToken = function () {
	return getPropertyValue(KeycloakLSManager.KEY_REFRESH_TOKEN);
}

KeycloakLSManager.getIdToken = function () {
	return getPropertyValue(KeycloakLSManager.KEY_ID_TOKEN);
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

KeycloakLSManager.localStorageRemove = function () {
	saveKeycloakInfoData({});
};

KeycloakLSManager.removeProperty = function (key) {
	var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);
	delete keycloakInfo[key];

	saveKeycloakInfoData(keycloakInfo);

};

// --------------------------------------------
// TODO: NEED TO RELOCATE?  'AppInfoLSManager' used..
KeycloakLSManager.isKeyCloakInUse = function () {
	return (AppInfoLSManager.getKeyCloakUse() === 'Y');
};

KeycloakLSManager.removeKeyCloakInUse = function () {
	AppInfoLSManager.setKeyCloakUse('');
};

// ---------------------------------------------------------------------------------------------
// Supportive methods

function getPropertyValue(key) {
	var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);

	return (keycloakInfo == undefined) ? undefined : keycloakInfo[key];
};

function updatePropertyValue(key, value) {
	var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);
	if (keycloakInfo == undefined) {
		keycloakInfo = {};
	}
	keycloakInfo[key] = value;

	// Update data in memory
	saveKeycloakInfoData(keycloakInfo);
};


function saveKeycloakInfoData(keycloakInfo) {
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
