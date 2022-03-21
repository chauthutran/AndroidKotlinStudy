//	TODO: ?: Rename to 'LSAppInfoLSManager'?
function AppInfoLSManager() {}

// ---------------------------

AppInfoLSManager.KEY_APPINFO = "appInfo";

AppInfoLSManager.appInfo_LS;

AppInfoLSManager.KEY_LASTLOGINDATA = "lastLoginData";  // It actually is 'lastLoginData'

AppInfoLSManager.KEY_USERNAME = "userName"; 
AppInfoLSManager.KEY_CONFIGSOURCETYPE = "configSourceType"; 
AppInfoLSManager.KEY_BLACKLISTED = "blackListed"; 
AppInfoLSManager.KEY_LAST_ONLINELOGIN_DT = "lastOnlineLoginDt"; 
AppInfoLSManager.KEY_NETWORKSYNC = "networkSync";
AppInfoLSManager.KEY_LOCAL_STAGENAME = "localStageName"; 
AppInfoLSManager.KEY_JOBAID_FOLDER_NAMES = "jobAidFolderNames";

// Old and obsolete keys
AppInfoLSManager.KEY_USERINFO = "userInfo";  // It actually is 'lastLoginData'
AppInfoLSManager.KEY_LOGINOUT = "logInOut"; 
AppInfoLSManager.KEY_SYNC = "sync"; 
AppInfoLSManager.KEY_DEBUG = "debug"; 

//AppInfoLSManager.KEY_SYNC_LAST_DOWNLOADINFO = "syncLastDownloaded"; 
//AppInfoLSManager.KEY_FIX_OPERATION_LAST = "fixOperationLast"; 

// ---------------------------

AppInfoLSManager.KEY_LASTLOGINOUT = "lastLogInOut"; 
//AppInfoLSManager.KEY_AUTOLOGINSET = "autoLoginSet"; 
AppInfoLSManager.KEY_CURRENTKEYS = "currentKeys";

// ------------------------------------------------------------------------------------  
// ----------------  User info

// NOTE: Normally, we load in the beginning of app load <-- in 'app.js'
// But we like to move things everything but last username logged in..

AppInfoLSManager.initialDataLoad_LocalStorage = function()
{
    var appInfo_LS = LocalStgMng.getJsonData( AppInfoLSManager.KEY_APPINFO );
    if ( !appInfo_LS ) appInfo_LS = {}; // if not exists, set as emtpy obj to store data.

    AppInfoLSManager.appInfo_LS = appInfo_LS;

    // Data Migration: check if new data not exits, but old ones do, copy over.  
    AppInfoLSManager.migrateData( appInfo_LS );
};


AppInfoLSManager.migrateData = function( appInfo_LS )
{
    // Run EveryTime.
    // If old data is found, try to copy
    // If new data already holds data/exists, do not copy
    // Delete the old data, so that this part migration does not happen next time.


    var lastLoginData = appInfo_LS.lastLoginData;

    // If 'lastLoginData' is not available, get from old data..
    if ( !lastLoginData ) // [ AppInfoLSManager.KEY_LASTLOGINDATA ] ) 
    {
        appInfo_LS.lastLoginData = {};
        lastLoginData = appInfo_LS.lastLoginData;
    }


    // 1. Look at 'userInfo'
    var userInfo = appInfo_LS.userInfo; //[ AppInfoLSManager.KEY_USERINFO ];
    if ( userInfo )
    {
        if ( userInfo.user && !lastLoginData.userName ) lastLoginData.userName = userInfo.user;
        if ( userInfo.networkSync && !lastLoginData.networkSync ) lastLoginData.networkSync = userInfo.networkSync;

        // Delete 'userInfo' from appInfo_LS
        delete appInfo_LS.userInfo; //[ AppInfoLSManager.KEY_USERINFO ];
    }
    

    // 2. Get old 'loginResp' data --> stored as 
    var userName = lastLoginData.userName;
    if ( userName )
    {
        var loginRespOLD = LocalStgMng.getJsonData( userName );

        if ( loginRespOLD )
        {
            var mergeNotContinue = AppInfoLSManager.mergeNotContinueCheck( loginRespOLD );

            if ( !mergeNotContinue )
            {
                // Config SourceType..
                if ( loginRespOLD.dcdConfig && loginRespOLD.dcdConfig.sourceType )
                {
                    lastLoginData.configSourceType = loginRespOLD.dcdConfig.sourceType;
                }

                // 'blackListed' value set - from 'blackListing'
                if ( loginRespOLD.blackListing ) lastLoginData.blackListed = true;


                // 'mySession' related data move 
                if ( loginRespOLD.mySession )
                {
                    if ( loginRespOLD.mySession.createdDate )
                    {
                        lastLoginData.lastOnlineLoginDt = loginRespOLD.mySession.createdDate;
                    }

                    // If 'pin' is available, user userName & pin for creating 'indexedDB'
                    if ( loginRespOLD.mySession.pin )
                    {
                        var passwd = Util.decrypt( loginRespOLD.mySession.pin, 4);

                        // A1. After moving 'loginResp' data to indexedDB, delete it on old.
                        DataManager2.saveData_LoginResp( userName, passwd, loginRespOLD, function( ) {
                            // Delete userNamed 'loginResp' 
                            LocalStgMng.deleteData( userName );                            
                        } );    

                                                
                        // A2. move 'sync', 'logInOut', 'debug' to indexDB and remove old.
                        AppInfoManager.setUserName_Passwd( userName, passwd );  // Use this to get 'userName/passwd' for indexedDB encript save

                        // TODO: If 'sync' is changed to be stored in localStorage, remove below.
                        if ( appInfo_LS.sync )
                        {                            
                            AppInfoManager.updateData( AppInfoManager.KEY_SYNC, appInfo_LS.sync );
                            delete appInfo_LS.sync;
                        }

                        if ( appInfo_LS.logInOut )
                        {                            
                            AppInfoManager.updateData( AppInfoManager.KEY_LOGINOUT, appInfo_LS.logInOut );
                            delete appInfo_LS.logInOut;
                        }

                        if ( appInfo_LS.debug )
                        {                            
                            AppInfoManager.updateData( AppInfoManager.KEY_DEBUG, appInfo_LS.debug );
                            delete appInfo_LS.debug;
                        }
                    }
                }
            }
        }
    }

    // Save the data..
    AppInfoLSManager.saveAppInfoData( appInfo_LS );
};


AppInfoLSManager.mergeNotContinueCheck = function( loginRespOLD )
{
    var mergeNotContinue = false;
            
    // How to tell if this one is a new one or not? - if there is a date element, it will be easier..
    var newIDB_lastOnlineLoginDT = AppInfoLSManager.getLastOnlineLoginDt();
    var old_createdDT = AppInfoLSManager.getLoginRespOLD_createdDT( loginRespOLD );

    if ( old_createdDT  )
    {
        if ( newIDB_lastOnlineLoginDT )
        {
            // We can compare if newIDB is later one..
            if ( newIDB_lastOnlineLoginDT >= old_createdDT ) mergeNotContinue = true;
        }
    }

    return mergeNotContinue;
};


// --------------------------------------------

AppInfoLSManager.saveAppInfoData = function( appInfo_LS )
{
    // 2 ways to save 'appInfo_LS'.  1. get appInfo_LS by parameter.  2. get appInfo_LS from memory (AppInfoLSManager.data).

    // Get appInfo_LS from localStorage if any. If not, use default appInfo_LS
    if ( !appInfo_LS ) appInfo_LS = AppInfoLSManager.appInfo_LS;
    
    LocalStgMng.saveJsonData( AppInfoLSManager.KEY_APPINFO, appInfo_LS );
};

// ------------------------------------------------------------------------------------  
// ----------------  GET / UPDATE/ REMOVE Data by Key

AppInfoLSManager.getData = function( keyword )
{
    if ( keyword ) return AppInfoLSManager.appInfo_LS[keyword];
    else return AppInfoLSManager.appInfo_LS;
};

AppInfoLSManager.updateData = function( keyword, jsonData )
{
    // Get appInfo_LS from localStorage if any. If not, use default appInfo_LS
    var appInfo_LS = AppInfoLSManager.appInfo_LS;
    
    // Update data of appInfo_LS by using keyword
    appInfo_LS[keyword] = jsonData;

    AppInfoLSManager.saveAppInfoData( appInfo_LS );
};

AppInfoLSManager.removeData = function( keyword )
{
     // Get appInfo_LS from localStorage if any. If not, use default appInfo_LS
     var appInfo_LS = AppInfoLSManager.appInfo_LS;
    
     // Update data of appInfo_LS by using keyword
     delete appInfo_LS[keyword];
     
     // Update the 'appInfo_LS' data
     AppInfoLSManager.saveAppInfoData( appInfo_LS );     
};
    
    
// --------------------------------------------------
// ------ 1st level 'key': 'value' get/update

AppInfoLSManager.updateKey_StrValue = function( key, valueStr )
{
    var appInfo_LS = AppInfoLSManager.appInfo_LS;
        
    appInfo_LS[key] = valueStr;

    // Update data in memory
    AppInfoLSManager.saveAppInfoData( appInfo_LS );
};

AppInfoLSManager.getKeyValue = function( key )
{
    var appInfo_LS = AppInfoLSManager.appInfo_LS;
        
    var value = appInfo_LS[key];
    if ( value === undefined ) value = '';

    return value;
};

// ------------------------------------

AppInfoLSManager.getPropertyValue = function( mainKey, subKey )
{
    // Get appInfo_LS from localStorage if any. If not, use default appInfo_LS
    var appInfo_LS = AppInfoLSManager.appInfo_LS;    
    var mainInfo = appInfo_LS[mainKey];

    return ( mainInfo == undefined ) ? undefined : appInfo_LS[mainKey][subKey];
};

AppInfoLSManager.updatePropertyValue = function( mainKey, subKey, valStr )
{
    // Get appInfo_LS from localStorage if any. If not, use default appInfo_LS
    var appInfo_LS = AppInfoLSManager.appInfo_LS;
    
    // Update sub value by using keyword
    if( appInfo_LS[mainKey] == undefined )
    {
        appInfo_LS[mainKey] = {};
    }
    
    appInfo_LS[mainKey][subKey] = valStr;

    // Update data in memory
    AppInfoLSManager.saveAppInfoData( appInfo_LS );
};

AppInfoLSManager.removeProperty = function( mainKey, subKey )
{
    // Get appInfo_LS from localStorage if any. If not, use default appInfo_LS
    var appInfo_LS = AppInfoLSManager.appInfo_LS;

    if ( appInfo_LS[mainKey] )
    {
        Util.tryCatchContinue( function() 
        {
            delete appInfo_LS[mainKey][subKey];

            // Update the 'appInfo_LS' data
            AppInfoLSManager.saveAppInfoData( appInfo_LS );  

        }, 'AppInfoLSManager.removeProperty' );
    }
};
// ------------------

// ------------------------------------------------------------------------------------  
// ----------------  Local Storage Saving... ----------

// After success login, mark the userName in localStorage as last used username
AppInfoLSManager.setUserName = function( userName )
{
    AppInfoLSManager.updatePropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_USERNAME, userName );
};

AppInfoLSManager.getUserName = function()
{
    return AppInfoLSManager.getPropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_USERNAME );
};

// ----------------------------------------------------

AppInfoLSManager.getBlackListed = function()
{
    return AppInfoLSManager.getPropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_BLACKLISTED );
};

// Use this to set 'blackListed' as true or false;
AppInfoLSManager.setBlackListed = function( blackListed )
{    
    AppInfoLSManager.updatePropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_BLACKLISTED, blackListed );
};

// ----------------------------------------------------

// After success login, mark the userName in localStorage as last used username
AppInfoLSManager.setJobAidFolderNames = function( namesJsonStr )
{
    AppInfoLSManager.updatePropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_JOBAID_FOLDER_NAMES, namesJsonStr );
};

AppInfoLSManager.getJobAidFolderNames = function()
{
    return AppInfoLSManager.getPropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_JOBAID_FOLDER_NAMES );
};

// ------------------------------------------------------------------------------------  
// ----------------  Login Current Keys Related..

// TODO: remove --> replace with userName in 'lastLoginData'

/*
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
*/



// TODO: NEED TO REPLACE THIS!!!
AppInfoLSManager.getConfigSourceType = function()
{
    var configSourceType = 'mongo'; // <-- default one.  Should be between 'mongo' / 'dhis2'

    try
    {
        var appInfo_LS = AppInfoLSManager.appInfo_LS;
         
        if ( appInfo_LS && appInfo_LS.lastLoginData && appInfo_LS.lastLoginData.configSourceType ) configSourceType = appInfo_LS.lastLoginData.configSourceType;
    }
    catch ( errMsg )
    {
		console.customLog( 'ERROR in AppInfoLSManager.getConfigSourceType: ' + errMsg );
    }

    return configSourceType;
};


AppInfoLSManager.saveConfigSourceType = function( loginResp )
{
    if ( loginResp && loginResp.dcdConfig && loginResp.dcdConfig.sourceType )
    {        
        AppInfoLSManager.updatePropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_CONFIGSOURCETYPE, loginResp.dcdConfig.sourceType );
    }    
};


// -----------------------------

AppInfoLSManager.getLastOnlineLoginDt = function()
{
    return AppInfoLSManager.getPropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_LAST_ONLINELOGIN_DT );
}

AppInfoLSManager.setLastOnlineLoginDt = function( lastOnlineLoginDt )
{
    AppInfoLSManager.updatePropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_LAST_ONLINELOGIN_DT, lastOnlineLoginDt );
};


// -----------------------------

// networkSync
AppInfoLSManager.updateNetworkSync = function( dataStr ) 
{
    AppInfoLSManager.updatePropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_NETWORKSYNC, dataStr );
};

AppInfoLSManager.getNetworkSync = function() 
{
    var networkSync = AppInfoLSManager.getPropertyValue( AppInfoLSManager.KEY_LASTLOGINDATA, AppInfoLSManager.KEY_NETWORKSYNC );

    if ( !networkSync )
    {
        networkSync = ConfigManager.getSettingNetworkSync();  // If not available, get it from config
        AppInfoLSManager.updateNetworkSync( networkSync );
    }

    return networkSync;
};

// ---- Localhost Stage related..

AppInfoLSManager.getLocalStageName = function() 
{
    return AppInfoLSManager.getKeyValue( AppInfoLSManager.KEY_LOCAL_STAGENAME );
};

AppInfoLSManager.setLocalStageName = function( stageName ) 
{
    AppInfoLSManager.updateKey_StrValue( AppInfoLSManager.KEY_LOCAL_STAGENAME, stageName );
};


// ------------------------------------------------------------------------------------  
// ----------------  Auto Login Related..

//AppInfoLSManager.setAutoLogin = function( dateObj )
//{
//    AppInfoLSManager.updatePropertyValue( AppInfoLSManager.KEY_LOGINOUT, AppInfoLSManager.KEY_AUTOLOGINSET, Util.formatDateTime( dateObj ) );
//};

//AppInfoLSManager.getAutoLogin = function()
//{
//    return AppInfoLSManager.getPropertyValue( AppInfoLSManager.KEY_LOGINOUT, AppInfoLSManager.KEY_AUTOLOGINSET );
//};

//AppInfoLSManager.clearAutoLogin = function()
//{    
//    AppInfoLSManager.removeProperty( AppInfoLSManager.KEY_LOGINOUT, AppInfoLSManager.KEY_AUTOLOGINSET );
//};




AppInfoLSManager.getLoginRespOLD_createdDT = function( loginRespOLD ) 
{
    var createdDate;

    if ( loginRespOLD.mySession )
    {
        createdDate = loginRespOLD.mySession.createdDate;
    }

    return createdDate;
};


/*
// ------------------------------------------------------------------------------------  
// ----------------  sync Last Downloaded

AppInfoLSManager.updateSyncLastDownloadInfo = function( dateStr )
{
    AppInfoLSManager.updatePropertyValue( AppInfoLSManager.KEY_SYNC, AppInfoLSManager.KEY_SYNC_LAST_DOWNLOADINFO, dateStr );

    // Update the 'INFO' when updated - since we use this through 'INFO' object.
    InfoDataManager.setINFO_lastDownloaded( dateStr );
};	

AppInfoLSManager.getSyncLastDownloadInfo = function()
{
    return AppInfoLSManager.getPropertyValue( AppInfoLSManager.KEY_SYNC, AppInfoLSManager.KEY_SYNC_LAST_DOWNLOADINFO );
};	


// ------------------------------------------------------------------------------------  
// ----------------  fix Operation Last Performed

AppInfoLSManager.updateFixOperationLast = function( dateStr )
{
    AppInfoLSManager.updatePropertyValue( AppInfoLSManager.KEY_SYNC, AppInfoLSManager.KEY_FIX_OPERATION_LAST, dateStr );

    // Update the 'INFO' when updated - since we use this through 'INFO' object.
    InfoDataManager.setINFO_fixOperationLast( dateStr );
};	

AppInfoLSManager.getFixOperationLast = function()
{
    return AppInfoLSManager.getPropertyValue( AppInfoLSManager.KEY_SYNC, AppInfoLSManager.KEY_FIX_OPERATION_LAST );
};
*/