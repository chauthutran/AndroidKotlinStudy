//	TODO: ?: Rename to 'LSAppInfoLSManager'?
function AppInfoLSManager() {}

// ---------------------------

AppInfoLSManager.KEY_APPINFO = "appInfo";

AppInfoLSManager.appInfo_LS;

AppInfoLSManager.KEY_USERINFO = "userInfo"; 
AppInfoLSManager.KEY_LOGINOUT = "logInOut"; 

// ---------------------------

AppInfoLSManager.KEY_LOCAL_STAGENAME = "localStageName"; 

AppInfoLSManager.KEY_LASTLOGINOUT = "lastLogInOut"; 
AppInfoLSManager.KEY_AUTOLOGINSET = "autoLoginSet"; 
AppInfoLSManager.KEY_CURRENTKEYS = "currentKeys";

AppInfoLSManager.KEY_LAST_LOGIN = "logIn"; // time str
AppInfoLSManager.KEY_LAST_LOGOUT = "logOut"; // time str
AppInfoLSManager.KEY_LAST_LOGOUT_TYPE = "logOut_type"; // manual, auto
AppInfoLSManager.KEY_LAST_LOGIN_TYPE = "logIn_type";  // online, offline

// ------------------------------------------------------------------------------------  
// ----------------  User info

// NOTE: Normally, we load in the beginning of app load <-- in 'app.js'
// But we like to move things everything but last username logged in..

AppInfoLSManager.initialDataLoad_LocalStorage = function()
{
    AppInfoLSManager.appInfo_LS = LocalStgMng.getJsonData( AppInfoLSManager.KEY_APPINFO );
};

// ------------------------------------------------------------------------------------  
// ----------------  GET / UPDATE/ REMOVE Data by Key

AppInfoLSManager.getData = function( keyword )
{
    if ( keyword ) return AppInfoLSManager.appInfo_LS[keyword];
    else AppInfoLSManager.appInfo_LS;
};

AppInfoLSManager.updateData = function( keyword, jsonData )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoLSManager.appInfo_LS;
    
    // Update data of appInfo by using keyword
    appInfo[keyword] = jsonData;

    AppInfoLSManager.saveAppInfoData( appInfo );
};

AppInfoLSManager.removeData = function( keyword )
{
     // Get appInfo from localStorage if any. If not, use default appInfo
     var appInfo = AppInfoLSManager.appInfo_LS;
    
     // Update data of appInfo by using keyword
     delete appInfo[keyword];
     
     // Update the 'appInfo' data
     AppInfoLSManager.saveAppInfoData( appInfo );     
};
    
// ------------------------------------------------------------------------------------  
// ----------------  Local Storage Saving... ----------

// After success login, mark the userName in localStorage as last used username
AppInfoLSManager.markUserName = function( userName )
{
    var appInfo_LS = AppInfoLSManager.appInfo_LS;
    
    if ( !appInfo_LS ) appInfo_LS = { userInfo: { user: '' } };
    else if ( !appInfo_LS.userInfo ) appInfo_LS.userInfo = { user: '' };

    appInfo_LS.userInfo.user = userName;

    
    AppInfoLSManager.saveAppInfoData( appInfo );
};

AppInfoLSManager.getUserInfo = function()
{
    var appInfo_LS = AppInfoLSManager.appInfo_LS;

    if ( !appInfo_LS ) appInfo_LS = { userInfo: { user: '' } };
    else if ( !appInfo_LS.userInfo ) appInfo_LS.userInfo = { user: '' };

    return appInfo_LS.userInfo;    
};

// ------------------------------------------------------------------------------------  
// ----------------  Login Current Keys Related..

AppInfoLSManager.getLoginCurrentKeys = function()
{
    return AppInfoLSManager.getPropertyValue( AppInfoLSManager.KEY_LOGINOUT, AppInfoLSManager.KEY_CURRENTKEYS );
};

AppInfoLSManager.setLoginCurrentKeys = function( dateObj, currentKeysJson )
{
    var dataJson = { 'timestamp': Util.formatDateTime( dateObj ), 'keys': currentKeysJson };
    AppInfoLSManager.updatePropertyValue( AppInfoLSManager.KEY_LOGINOUT, AppInfoLSManager.KEY_CURRENTKEYS, dataJson );
};

AppInfoLSManager.clearLoginCurrentKeys = function()
{    
    AppInfoLSManager.removeProperty( AppInfoLSManager.KEY_LOGINOUT, AppInfoLSManager.KEY_CURRENTKEYS );
};

// --------------------------------------------

AppInfoLSManager.saveAppInfoData = function( appInfo )
{
    // 2 ways to save 'appInfo'.  1. get appInfo by parameter.  2. get appInfo from memory (AppInfoManager.data).

    // Get appInfo from localStorage if any. If not, use default appInfo
    if ( !appInfo ) appInfo = AppInfoManager.appInfo_LS;
    
    LocalStgMng.saveJsonData( AppInfoLSManager.KEY_APPINFO, appInfo );
};

// ------------------------------------

AppInfoLSManager.getPropertyValue = function( mainKey, subKey )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoLSManager.appInfo_LS;    
    var mainInfo = appInfo[mainKey];

    return ( mainInfo == undefined ) ? undefined : appInfo[mainKey][subKey];
};

AppInfoLSManager.updatePropertyValue = function( mainKey, subKey, valStr )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoLSManager.appInfo_LS;
    
    // Update sub value by using keyword
    if( appInfo[mainKey] == undefined )
    {
        appInfo[mainKey] = {};
    }
    
    appInfo[mainKey][subKey] = valStr;

    // Update data in memory
    AppInfoLSManager.saveAppInfoData( appInfo );
};

AppInfoLSManager.removeProperty = function( mainKey, subKey )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoLSManager.appInfo_LS;

    if ( appInfo[mainKey] )
    {
        Util.tryCatchContinue( function() 
        {
            delete appInfo[mainKey][subKey];

            // Update the 'appInfo' data
            AppInfoLSManager.saveAppInfoData( appInfo );  

        }, 'AppInfoLSManager.removeProperty' );
    }
};
// ------------------

