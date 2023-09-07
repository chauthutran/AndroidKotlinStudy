//	TODO: ?: Rename to 'KeycloakLSManager'?
function KeycloakLSManager() {}

// ---------------------------------------------------------------------------------------------


KeycloakLSManager.KEY_KEYCLOAK_INFO = "keycloakInfo";
KeycloakLSManager.KEY_LOGIN_DATE = 'loginDate';

KeycloakLSManager.keycloakInfo_LS;

// ---------------------------------------------------------------------------------------------

KeycloakLSManager.setLastLoginDate = function( value )
{
    KeycloakLSManager.updatePropertyValue( KeycloakLSManager.KEY_LOGIN_DATE, value );
}

KeycloakLSManager.getLastLoginDate = function()
{
    return KeycloakLSManager.getPropertyValue( KeycloakLSManager.KEY_LOGIN_DATE );
}



// ---------------------------------------------------------------------------------------------
// Supportive methods

KeycloakLSManager.getPropertyValue = function( key )
{
    var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);    

    return ( keycloakInfo == undefined ) ? undefined : keycloakInfo[key];
};

KeycloakLSManager.updatePropertyValue = function( key, value )
{
    var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);
    if( keycloakInfo == undefined )
    {
        keycloakInfo = {};
    }
    keycloakInfo[key] = value;

    // Update data in memory
    KeycloakLSManager.saveKeycloakInfoData( keycloakInfo );
};

KeycloakLSManager.removeProperty = function( key )
{
    var keycloakInfo = LocalStgMng.getJsonData(KeycloakLSManager.KEY_KEYCLOAK_INFO);
    delete keycloakInfo[key];

    KeycloakLSManager.saveKeycloakInfoData( keycloakInfo );  

};

// --------------------------------------------

KeycloakLSManager.saveKeycloakInfoData = function( keycloakInfo )
{
    LocalStgMng.saveJsonData( KeycloakLSManager.KEY_KEYCLOAK_INFO, keycloakInfo );
};
