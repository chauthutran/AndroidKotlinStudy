function AppInfoManager() {}

AppInfoManager.ActivityHistoryMaxLength = 50;
AppInfoManager.CustomLogHistoryMaxLength = 50;
AppInfoManager.FixOperationMaxLength = 30;

// ---------------------------

AppInfoManager.KEY_APPINFO = "appInfo";

AppInfoManager.appInfo;

AppInfoManager.KEY_DEBUG = "debug"; 
AppInfoManager.KEY_LOGINOUT = "logInOut"; 
AppInfoManager.KEY_SYNC = "sync"; 
AppInfoManager.KEY_STATISTIC_PAGES = "statisticPages"; 
AppInfoManager.KEY_CUSTOM_DATA = "customData";  // 1. if called and does not exists, add the part when creating..

AppInfoManager.template = { 'debug': {}, 'logInOut': {}, 'sync': {} };

// ---------------------------

AppInfoManager.KEY_LASTLOGINOUT = "lastLogInOut"; 
AppInfoManager.KEY_CURRENTKEYS = "currentKeys"; 
AppInfoManager.KEY_NEW_ERROR_ACT = "newErrActivityIds"; 

// DEBUG Related..
AppInfoManager.KEY_ACTIVITY_HISTORY = "activityHistory"; 
AppInfoManager.KEY_CUSTOM_LOG_HISTORY = "customLogHistory"; 
AppInfoManager.KEY_FIX_OPERATION_HISTORY = "fixOperationHistory"; 

AppInfoManager.KEY_SYNC_LAST_DOWNLOADINFO = "syncLastDownloaded"; 
AppInfoManager.KEY_FIX_OPERATION_LAST = "fixOperationLast"; 


// NOTE: Add statisticPages: { '@LA@stat_IPC.html': '' }
// <-- do not keep it on memory?  but get it from localStorage everytime..

// OBSOLETE ONES -----------------
AppInfoManager.KEY_TRANSLATION = "translation"; 
AppInfoManager.KEY_LANG_CODE = "langCode"; 
AppInfoManager.KEY_LANG_LASTTRYDT = "langLastTryDT"; 
AppInfoManager.KEY_LANG_TERMS = "langTerms"; 


// Temp stored..
AppInfoManager.userName; 
AppInfoManager.passwd; 

// ------------------------------------------------------------------------------------  
// ----------------  User info

// Store 'userName' / 'passwd' to be used in indexedDB call (encryption/decription) - remember to unload at logout.
AppInfoManager.setUserName_Passwd = function( userName, passwd )
{
    AppInfoManager.userName = userName; 
    AppInfoManager.passwd = passwd; 
};

AppInfoManager.unsetUserName_Passwd = function()
{
    AppInfoManager.userName = undefined; 
    AppInfoManager.passwd = undefined; 
};

// ---------------------------------

// 2 [DO]
AppInfoManager.loadData_AfterLogin = function( userName, passwd, callBack )
{
    AppInfoManager.setUserName_Passwd( userName, passwd );

    // Also save to 
    AppInfoManager.getAppInfoData_IDB( function( appInfo_IDB ) 
    {
        AppInfoManager.appInfo = appInfo_IDB;
        var appInfo = AppInfoManager.getAppInfo();  // Get from AppInfoManager.appInfo with initial template usage if undefined;

        // Try Merging if things are still left?
        AppInfoManager.mergeOldData( appInfo );

        if ( callBack ) callBack( appInfo );
    });
};


AppInfoManager.unloadData_AfterLogOut = function()
{
    AppInfoManager.appInfo = undefined;
    AppInfoManager.unsetUserName_Passwd();
};

// --------------------------------------

AppInfoManager.mergeOldData = function( appInfo )
{
    var appInfo_LS = AppInfoLSManager.appInfo_LS;

    if ( appInfo_LS.sync && !appInfo.sync )
    {                            
        AppInfoManager.updateData( AppInfoManager.KEY_SYNC, appInfo_LS.sync );
        delete appInfo_LS.sync;
    }

    if ( appInfo_LS.logInOut && !appInfo.logInOut )
    {                            
        AppInfoManager.updateData( AppInfoManager.KEY_LOGINOUT, appInfo_LS.logInOut );
        delete appInfo_LS.logInOut;
    }

    if ( appInfo_LS.debug && !appInfo.debug )
    {                            
        AppInfoManager.updateData( AppInfoManager.KEY_DEBUG, appInfo_LS.debug );
        delete appInfo_LS.debug;
    }

    // Save the data..
    AppInfoLSManager.saveAppInfoData( appInfo_LS );
};


// --------------------------------------

AppInfoManager.getAppInfo = function()
{
    if ( !AppInfoManager.appInfo ) AppInfoManager.appInfo = Util.cloneJson( AppInfoManager.template );

    var appInfo = AppInfoManager.appInfo;

    // if ( !appInfo ) AppInfoManager.saveAppInfoData_IDB( appInfo );

    return appInfo;    
};

// --------------------------------------
// --- IndexedDB get/save call of 'appInfo'

AppInfoManager.getAppInfoData_IDB = function( callBack )
{
    DataManager2.getData_AppInfo( AppInfoManager.userName, AppInfoManager.passwd, callBack );
};

AppInfoManager.saveAppInfoData_IDB = function( appInfo, callBack )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    if ( !appInfo ) appInfo = AppInfoManager.getAppInfo();

    // Need session.login user name
    DataManager2.saveData_AppInfo( AppInfoManager.userName, AppInfoManager.passwd, appInfo, callBack );
};

// ------------------------------------------------------------------------------------  
// ----------------  GET / UPDATE/ REMOVE Data by Key

AppInfoManager.getData = function( keyword )
{
    return AppInfoManager.getAppInfo()[keyword];
};

AppInfoManager.updateData = function( keyword, jsonData )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.getAppInfo();
    
    // Update data of appInfo by using keyword
    appInfo[keyword] = jsonData;

    AppInfoManager.saveAppInfoData_IDB( appInfo );
};

AppInfoManager.removeData = function( keyword )
{
     // Get appInfo from localStorage if any. If not, use default appInfo
     var appInfo = AppInfoManager.getAppInfo();
    
     // Update data of appInfo by using keyword
     delete appInfo[keyword];
     
     // Update the 'appInfo' data
     AppInfoManager.saveAppInfoData_IDB( appInfo );     
};
    
// --------------------------------------------------
// ------ 1st level 'key': 'value' get/update

AppInfoManager.updateKey_StrValue = function( key, valueStr )
{
    var appInfo = AppInfoManager.getAppInfo();
        
    appInfo[key] = valueStr;

    // Update data in memory
    AppInfoManager.saveAppInfoData_IDB( appInfo );
};

AppInfoManager.getKeyValue = function( key )
{
    var appInfo = AppInfoManager.getAppInfo();
        
    var value = appInfo[key];
    if ( value === undefined ) value = '';

    return value;
};

// ------------------------------------

AppInfoManager.getPropertyValue = function( mainKey, subKey )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.getAppInfo();

    if ( !appInfo ) return undefined;
    else
    {
        var mainInfo = appInfo[mainKey];

        return ( mainInfo == undefined ) ? undefined : appInfo[mainKey][subKey];    
    }
};

AppInfoManager.updatePropertyValue = function( mainKey, subKey, valStr, callBack )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.getAppInfo();
    
    // Update sub value by using keyword
    if( appInfo[mainKey] == undefined )
    {
        appInfo[mainKey] = {};
    }
    
    appInfo[mainKey][subKey] = valStr;

    // Update data in memory
    AppInfoManager.saveAppInfoData_IDB( appInfo, callBack );
};

AppInfoManager.removeProperty = function( mainKey, subKey, callBack )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.getAppInfo();

    if ( appInfo[mainKey] )
    {
        Util.tryCatchContinue( function() 
        {
            delete appInfo[mainKey][subKey];

            // Update the 'appInfo' data
            AppInfoManager.saveAppInfoData_IDB( appInfo, callBack );  

        }, 'AppInfoManager.removeProperty' );
    }
};

// ------------------------------------------------------------------------------------  
// ---------------- New Error ActivityId List Related..

AppInfoManager.getNewErrorActivities = function()
{    
    var errList = AppInfoManager.getPropertyValue( AppInfoManager.KEY_LOGINOUT, AppInfoManager.KEY_NEW_ERROR_ACT );
    return ( errList ) ? errList : [];
};

AppInfoManager.addNewErrorActivityId = function( newActivityId )
{    
    if ( newActivityId ) 
    {
        var errList = AppInfoManager.getNewErrorActivities();
        errList.push( newActivityId );
        AppInfoManager.updatePropertyValue( AppInfoManager.KEY_LOGINOUT, AppInfoManager.KEY_NEW_ERROR_ACT, errList );    
    }
};

AppInfoManager.clearNewErrorActivities = function()
{    
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_LOGINOUT, AppInfoManager.KEY_NEW_ERROR_ACT, [] );
};

// ------------------------------------------------------------------------------------  
// ---------------- DEBUG activityHistory List Related..

AppInfoManager.getActivityHistory = function()
{    
    return AppInfoManager.getHistory_CMN( AppInfoManager.KEY_ACTIVITY_HISTORY );
};

AppInfoManager.addToActivityHistory = function( activityJson )
{    
    if ( activityJson ) 
    {
        var activityJsonCopy = Util.cloneJson( activityJson );

        // Remove processing.form
        //if ( activityJsonCopy.processing && activityJsonCopy.processing.form ) delete activityJsonCopy.processing.form;

        AppInfoManager.addHistory_CMN( activityJsonCopy
            , AppInfoManager.KEY_ACTIVITY_HISTORY
            , AppInfoManager.getActivityHistory()
            , AppInfoManager.ActivityHistoryMaxLength
            , 'addToActivityHistory' );    
    }
};

// ------------------------------------------------------------------------------------  
// ---------------- DEBUG customLog List Related..

AppInfoManager.getCustomLogHistory = () => AppInfoManager.getHistory_CMN( AppInfoManager.KEY_CUSTOM_LOG_HISTORY );
AppInfoManager.clearCustomLogHistory = () => AppInfoManager.clearHistory_CMN( AppInfoManager.KEY_CUSTOM_LOG_HISTORY, 'clearCustomLogHistory' );

AppInfoManager.addToCustomLogHistory = function( msg )
{    
    AppInfoManager.addHistory_CMN( msg
        , AppInfoManager.KEY_CUSTOM_LOG_HISTORY
        , AppInfoManager.getCustomLogHistory()
        , AppInfoManager.CustomLogHistoryMaxLength
        , 'addToCustomLogHistory' );
};

// ------------------------------------------------------------------------------------  
// ---------------- DEBUG fix operation List Related..

AppInfoManager.getFixOperationHistory = () => AppInfoManager.getHistory_CMN( AppInfoManager.KEY_FIX_OPERATION_HISTORY );

AppInfoManager.addToFixOperationHistory = function( msg )
{
    AppInfoManager.addHistory_CMN( msg
        , AppInfoManager.KEY_FIX_OPERATION_HISTORY
        , AppInfoManager.getFixOperationHistory()
        , AppInfoManager.FixOperationMaxLength
        , 'addToFixOperationHistory' );
};

// ------------------------------------------------------------------------------------  
// ---------------- DEBUG history List Common Related..

AppInfoManager.getHistory_CMN = function( subKey )
{    
    var history = AppInfoManager.getPropertyValue( AppInfoManager.KEY_DEBUG, subKey );
    return ( history ) ? history : [];
};

AppInfoManager.addHistory_CMN = function( data, subKey, historyList, historyMax, optTitle )
{    
    try
    {
        if ( data ) 
        {
            historyList.unshift( data );

            var exceedCount = historyList.length - historyMax; //AppInfoManager.CustomLogHistoryMaxLength;
    
            // Remove if equal to or exceed to 100.  if 100, remove 1.  if 101, remove 2.
            if ( exceedCount > 0 ) 
            {
                for( var i = 0; i < exceedCount; i++ )
                {
                    historyList.pop();
                }
            }
            
            AppInfoManager.updatePropertyValue( AppInfoManager.KEY_DEBUG, subKey, historyList );
        }
    }
    catch( errMsg )
    {
        console.log( 'ERROR in AppInfoManager.' + optTitle + '(addHistory_CMN), errMsg: ' + errMsg );
    }
};


AppInfoManager.clearHistory_CMN = function( subKey, optTitle )
{    
    try
    {
        AppInfoManager.updatePropertyValue( AppInfoManager.KEY_DEBUG, subKey, [] );
    }
    catch( errMsg )
    {
        console.log( 'ERROR in AppInfoManager.' + optTitle + '(clearHistory_CMN), errMsg: ' + errMsg );
    }
};
// ------------------------------------------------------------------------------------  
// ---------------- Sync Last Downloaded

AppInfoManager.updateSyncLastDownloadInfo = function( dateStr )
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_SYNC, AppInfoManager.KEY_SYNC_LAST_DOWNLOADINFO, dateStr );

    // Update the 'INFO' when updated - since we use this through 'INFO' object.
    InfoDataManager.setINFO_lastDownloaded( dateStr );
};	

AppInfoManager.getSyncLastDownloadInfo = function()
{
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_SYNC, AppInfoManager.KEY_SYNC_LAST_DOWNLOADINFO );
};	

// ------------------------------------------------------------------------------------  
// ---------------- Fix Operation Last Performed

AppInfoManager.updateFixOperationLast = function( dateStr )
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_SYNC, AppInfoManager.KEY_FIX_OPERATION_LAST, dateStr );

    // Update the 'INFO' when updated - since we use this through 'INFO' object.
    InfoDataManager.setINFO_fixOperationLast( dateStr );
};	

AppInfoManager.getFixOperationLast = function()
{
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_SYNC, AppInfoManager.KEY_FIX_OPERATION_LAST );
};

// ------------------------------------------------------------------------------------  
// ---------------- StatisticPages Related

AppInfoManager.getStatisticPages = function( fileName ) 
{
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_STATISTIC_PAGES, fileName );
};

AppInfoManager.updateStatisticPages = function( fileName, dataStr ) 
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_STATISTIC_PAGES, fileName, dataStr );
};

// ------------------------------------------------------------------------------------  
// ---------------- Custom Data Related
//     NOTE: Used for JobAid temporary data.  However, if this last forever, it will get larger..
//          - Should we have expiration date?  Checked when logging in or logging out?

AppInfoManager.getCustomDataPart = function( partName ) 
{
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_CUSTOM_DATA, partName );
};

AppInfoManager.updateCustomDataPart = function( partName, dataJson ) 
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_CUSTOM_DATA, partName, dataJson );
};
