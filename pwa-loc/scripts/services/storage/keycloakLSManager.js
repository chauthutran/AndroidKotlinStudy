//	TODO: ?: Rename to 'KeycloakLSManager'?
function KeycloakLSManager() {}

// ---------------------------------------------------------------------------------------------


KeycloakLSManager.KEY_KEYCLOAK_INFO = "keycloakInfo";
KeycloakLSManager.KEY_LOGIN_DATE = 'loginDate';
KeycloakLSManager.KEY_ACCESS_TOKEN = 'accessToken';
KeycloakLSManager.KEY_REFRESH_TOKEN = 'refreshToken';
KeycloakLSManager.KEY_ID_TOKEN = 'idToken';
KeycloakLSManager.KEY_ACCESS_TOKEN_PARSED = 'accessTokenParsed';
KeycloakLSManager.KEY_REFRESH_TOKEN_PARSED = 'refreshTokenParsed';
KeycloakLSManager.KEY_REFRESH_TOKEN_PARSED = 'refreshTokenParsed';
KeycloakLSManager.KEY_AUTH_KEYCLOAK_PENDING = 'authKeycloakPending';


// ---------------------------------------------------------------------------------------------


KeycloakLSManager.setLastLoginDate = function()
{
    updatePropertyValue( KeycloakLSManager.KEY_LOGIN_DATE, UtilDate.dateStr( "DATETIME" ) );
}

KeycloakLSManager.setKeycloakInfo = function( kcObj )
{
    updatePropertyValue( KeycloakLSManager.KEY_LOGIN_DATE, UtilDate.dateStr( "DATETIME" ) );
    updatePropertyValue( KeycloakLSManager.KEY_ACCESS_TOKEN, kcObj.token );
    updatePropertyValue( KeycloakLSManager.KEY_REFRESH_TOKEN, kcObj.refreshToken );
    updatePropertyValue( KeycloakLSManager.KEY_ID_TOKEN, kcObj.idToken );
    updatePropertyValue( KeycloakLSManager.KEY_ACCESS_TOKEN_PARSED, JSON.stringify(kcObj.tokenParsed) );
    updatePropertyValue( KeycloakLSManager.KEY_REFRESH_TOKEN_PARSED, JSON.stringify(kcObj.refreshTokenParsed) );
}

KeycloakLSManager.getLastLoginDate = function()
{
    return getPropertyValue( KeycloakLSManager.KEY_LOGIN_DATE );
}

KeycloakLSManager.getAccessToken = function()
{
    return getPropertyValue( KeycloakLSManager.KEY_ACCESS_TOKEN );
}

KeycloakLSManager.getRefreshToken = function()
{
    return getPropertyValue( KeycloakLSManager.KEY_REFRESH_TOKEN );
}

KeycloakLSManager.getIdToken = function()
{
    return getPropertyValue( KeycloakLSManager.KEY_ID_TOKEN );
}

KeycloakLSManager.getAccessTokenParsed = function()
{
    return getPropertyValue( KeycloakLSManager.KEY_ACCESS_TOKEN_PARSED );
}

KeycloakLSManager.getRefreshTokenParsed = function()
{
    return getPropertyValue( KeycloakLSManager.KEY_REFRESH_TOKEN_PARSED );
}

KeycloakLSManager.localStorageRemove = function() {
    saveKeycloakInfoData( {} );
};

// ---------------------------------------------------------------------------------------------
// Supportive methods

function getPropertyValue( key )
{
    var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);    

    return ( keycloakInfo == undefined ) ? undefined : keycloakInfo[key];
};

function updatePropertyValue( key, value )
{
    var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);
    if( keycloakInfo == undefined )
    {
        keycloakInfo = {};
    }
    keycloakInfo[key] = value;

    // Update data in memory
    saveKeycloakInfoData( keycloakInfo );
};

KeycloakLSManager.removeProperty = function( key )
{
    var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);
    delete keycloakInfo[key];

    saveKeycloakInfoData( keycloakInfo );  

};


// --------------------------------------------

// TODO: NOTE: QUESTION: WHY 'remove---' rather than 'is---'?
KeycloakLSManager.removeKeyCloakInUse = function() 
{
	return ( AppInfoLSManager.getKeyCloakUse() === 'Y' );
};

// --------------------------------------------

function saveKeycloakInfoData( keycloakInfo )
{
    LocalStgMng.saveJsonData( KeycloakLSManager.KEY_KEYCLOAK_INFO, keycloakInfo );
};
