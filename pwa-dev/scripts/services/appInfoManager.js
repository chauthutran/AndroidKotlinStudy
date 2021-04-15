//	TODO: ?: Rename to 'LSAppInfoManager'?
function AppInfoManager() {}

AppInfoManager.ActivityHistoryMaxLength = 100;
AppInfoManager.CustomLogHistoryMaxLength = 100;

// ---------------------------

AppInfoManager.KEY_APPINFO = "appInfo";

AppInfoManager.data;

AppInfoManager.KEY_TRANSLATION = "translation"; 
AppInfoManager.KEY_SYNC = "sync"; 
AppInfoManager.KEY_LOGINOUT = "logInOut"; 
AppInfoManager.KEY_USERINFO = "userInfo"; 
AppInfoManager.KEY_DEBUG = "debug"; 

AppInfoManager.template = { 'translation': {}, 'sync': {}, 'logInOut': {}, 'userInfo': { }, 'debug': {} };

// ---------------------------

AppInfoManager.KEY_LOCAL_STAGENAME = "localStageName"; 

AppInfoManager.KEY_LASTLOGINOUT = "lastLogInOut"; 
AppInfoManager.KEY_AUTOLOGINSET = "autoLoginSet"; 
AppInfoManager.KEY_CURRENTKEYS = "currentKeys"; 
AppInfoManager.KEY_NEW_ERROR_ACT = "newErrActivityIds"; 
AppInfoManager.KEY_ACTIVITY_HISTORY = "activityHistory"; 
AppInfoManager.KEY_CUSTOM_LOG_HISTORY = "customLogHistory"; 

AppInfoManager.KEY_LANG_CODE = "langCode"; 
AppInfoManager.KEY_LANG_LASTTRYDT = "langLastTryDT"; 

AppInfoManager.KEY_LANG_TERMS = "langTerms"; 
AppInfoManager.KEY_SYNC_LAST_DOWNLOADINFO = "syncLastDownloaded"; 


AppInfoManager.KEY_NETWORKSYNC = "networkSync";

AppInfoManager.KEY_STATISTIC_PAGES = "statisticPages"; 


AppInfoManager.KEY_LAST_LOGIN = "logIn"; // time str
AppInfoManager.KEY_LAST_LOGOUT = "logOut"; // time str
AppInfoManager.KEY_LAST_LOGOUT_TYPE = "logOut_type"; // manual, auto
AppInfoManager.KEY_LAST_LOGIN_TYPE = "logIn_type";  // online, offline


// NOTE: Add statisticPages: { '@LA@stat_IPC.html': '' }
// <-- do not keep it on memory?  but get it from localStorage everytime..

// ------------------------------------------------------------------------------------  
// ----------------  User info

AppInfoManager.initialLoad_FromStorage = function()
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    // Set new data info in memory
    AppInfoManager.data = AppInfoManager.loadAppInfo();
};

// ------------------------------------------------------------------------------------  
// ----------------  GET / UPDATE/ REMOVE Data

AppInfoManager.getData = function( keyword )
{
    return AppInfoManager.data[keyword];
};

AppInfoManager.updateData = function( keyword, jsonData )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.data;
    
    // Update data of appInfo by using keyword
    appInfo[keyword] = jsonData;
    LocalStgMng.saveJsonData( AppInfoManager.KEY_APPINFO, appInfo );
};

AppInfoManager.removeData = function( keyword )
{
     // Get appInfo from localStorage if any. If not, use default appInfo
     var appInfo = AppInfoManager.data;
    
     // Update data of appInfo by using keyword
     delete appInfo[keyword];
     
     // Update the 'appInfo' data
     LocalStgMng.saveJsonData( AppInfoManager.KEY_APPINFO, appInfo );
};
    
// --------------------------------------------------
// ------ 1st level 'key': 'value' get/update

AppInfoManager.updateKey_StrValue = function( key, valueStr )
{
    var appInfo = AppInfoManager.data;
        
    appInfo[key] = valueStr;

    // Update data in memory
    LocalStgMng.saveJsonData( AppInfoManager.KEY_APPINFO, appInfo );
};

AppInfoManager.getKeyValue = function( key )
{
    var appInfo = AppInfoManager.data;
        
    var value = appInfo[key];
    if ( value === undefined ) value = '';

    return value;
};

// ------------------------------------

AppInfoManager.getPropertyValue = function( mainKey, subKey )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.data;    
    var mainInfo = appInfo[mainKey];

    return ( mainInfo == undefined ) ? undefined : appInfo[mainKey][subKey];
};

AppInfoManager.updatePropertyValue = function( mainKey, subKey, valStr )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.data;
    
    // Update sub value by using keyword
    if( appInfo[mainKey] == undefined )
    {
        appInfo[mainKey] = {};
    }
    
    appInfo[mainKey][subKey] = valStr;

    // Update data in memory
    LocalStgMng.saveJsonData( AppInfoManager.KEY_APPINFO, appInfo );
};

AppInfoManager.removeProperty = function( mainKey, subKey )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.data;

    if ( appInfo[mainKey] )
    {
        Util.tryCatchContinue( function() 
        {
            delete appInfo[mainKey][subKey];

            // Update the 'appInfo' data
            LocalStgMng.saveJsonData( AppInfoManager.KEY_APPINFO, appInfo );

        }, 'AppInfoManager.removeProperty' );
    }
};
// ------------------------------------------------------------------------------------  
// ----------------  load App Info

// Get appInfo from localStorage if any. If not, use default appInfo
AppInfoManager.loadAppInfo = function()
{
    var appInfo = LocalStgMng.getJsonData( AppInfoManager.KEY_APPINFO );

    if ( !appInfo )
    {
        appInfo = Util.getJsonDeepCopy( AppInfoManager.template );
    }
    else
    {
        // On Local Storage data, check the missing data.
        // Set minial structure - 'translation' and 'sync' shell should always exists..
        if ( !appInfo.translation ) appInfo.translation = Util.getJsonDeepCopy( AppInfoManager.template.translation );
        if ( !appInfo.sync ) appInfo.sync = Util.getJsonDeepCopy( AppInfoManager.template.sync );
        if ( !appInfo.logInOut ) appInfo.logInOut = Util.getJsonDeepCopy( AppInfoManager.template.logInOut );
        if ( !appInfo.userInfo ) appInfo.logInOut = Util.getJsonDeepCopy( AppInfoManager.template.userInfo );
    }

    return appInfo;
};

// ------------------------------------------------------------------------------------  
// ----------------  Auto Login Related..

AppInfoManager.setAutoLogin = function( dateObj )
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_LOGINOUT, AppInfoManager.KEY_AUTOLOGINSET, Util.formatDateTime( dateObj ) );
};

AppInfoManager.getAutoLogin = function()
{
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_LOGINOUT, AppInfoManager.KEY_AUTOLOGINSET );
};

AppInfoManager.clearAutoLogin = function()
{    
    AppInfoManager.removeProperty( AppInfoManager.KEY_LOGINOUT, AppInfoManager.KEY_AUTOLOGINSET );
};

// ------------------------------------------------------------------------------------  
// ----------------  Login Current Keys Related..

AppInfoManager.setLoginCurrentKeys = function( dateObj, currentKeysJson )
{
    var dataJson = { 'timestamp': Util.formatDateTime( dateObj ), 'keys': currentKeysJson };
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_LOGINOUT, AppInfoManager.KEY_CURRENTKEYS, dataJson );
};

AppInfoManager.getLoginCurrentKeys = function()
{
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_LOGINOUT, AppInfoManager.KEY_CURRENTKEYS );
};

AppInfoManager.clearLoginCurrentKeys = function()
{    
    AppInfoManager.removeProperty( AppInfoManager.KEY_LOGINOUT, AppInfoManager.KEY_CURRENTKEYS );
};

// ------------------------------------------------------------------------------------  
// ----------------  New Error ActivityId List Related..

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
// ----------------  DEBUG activityHistory List Related..

AppInfoManager.getActivityHistory = function()
{    
    var activityHistory = AppInfoManager.getPropertyValue( AppInfoManager.KEY_DEBUG, AppInfoManager.KEY_ACTIVITY_HISTORY );
    return ( activityHistory ) ? activityHistory : [];
};

AppInfoManager.addToActivityHistory = function( activityJson )
{    
    if ( activityJson ) 
    {
        try
        {
            var activityJsonCopy = Util.cloneJson( activityJson );

            // Remove processing.form
            if ( activityJsonCopy.processing && activityJsonCopy.processing.form ) delete activityJsonCopy.processing.form;

            
            var activityHistory = AppInfoManager.getActivityHistory();

            activityHistory.unshift( activityJsonCopy );

            var exceedCount = activityHistory.length - AppInfoManager.ActivityHistoryMaxLength;
    
            // Remove if equal to or exceed to 100.  if 100, remove 1.  if 101, remove 2.
            if ( exceedCount > 0 ) 
            {
                for( var i = 0; i < exceedCount; i++ )
                {
                    activityHistory.pop();
                }
            }
            
            AppInfoManager.updatePropertyValue( AppInfoManager.KEY_DEBUG, AppInfoManager.KEY_ACTIVITY_HISTORY, activityHistory );    
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR in AppInfoManager.addToActivityHistory, errMsg: ' + errMsg );
        }
    }
};


// ------------------------------------------------------------------------------------  
// ----------------  DEBUG customLog List Related..

AppInfoManager.getCustomLogHistory = function()
{    
    var customLogHistory = AppInfoManager.getPropertyValue( AppInfoManager.KEY_DEBUG, AppInfoManager.KEY_CUSTOM_LOG_HISTORY );
    return ( customLogHistory ) ? customLogHistory : [];
};

AppInfoManager.addToCustomLogHistory = function( log )
{    
    try
    {
        if ( log && Util.isTypeString( log ) ) 
        {
            var customLogHistory = AppInfoManager.getCustomLogHistory();

            customLogHistory.unshift( log );

            var exceedCount = customLogHistory.length - AppInfoManager.CustomLogHistoryMaxLength;
    
            // Remove if equal to or exceed to 100.  if 100, remove 1.  if 101, remove 2.
            if ( exceedCount > 0 ) 
            {
                for( var i = 0; i < exceedCount; i++ )
                {
                    customLogHistory.pop();
                }
            }
            
            AppInfoManager.updatePropertyValue( AppInfoManager.KEY_DEBUG, AppInfoManager.KEY_CUSTOM_LOG_HISTORY, customLogHistory );    
        }
    }
    catch( errMsg )
    {
        console.customLog( 'ERROR in AppInfoManager.addToCustomLog, errMsg: ' + errMsg );
    }
};


// ------------------------------------------------------------------------------------  
// ----------------  User info

// Called On Login...?  Why?  Maybe on App Start?
AppInfoManager.createUpdateUserInfo = function( userName )
{
    var userInfo = AppInfoManager.getUserInfo();
    
    // UNDERSTAND ABOUT 'userName' saving & use, but... what about lastUpdated, etc?
    // All others should move some place else?
    if ( !userInfo ) userInfo = Util.getJsonDeepCopy( AppInfoManager.template.userInfo );
        
    userInfo.user = userName;
    
    AppInfoManager.updateUserInfo( userInfo );
};


AppInfoManager.updateUserInfo = function( jsonData )
{
    AppInfoManager.updateData( AppInfoManager.KEY_USERINFO, jsonData );
};


AppInfoManager.getUserInfo = function()
{
    //return AppInfoManager.getData( AppInfoManager.KEY_USERINFO );

    return AppInfoManager.getData( AppInfoManager.KEY_USERINFO );
};

//AppInfoManager.removeUserInfo = function() { AppInfoManager.removeData( AppInfoManager.KEY_USERINFO ); };


AppInfoManager.getUserConfigSourceType = function()
{
    var sourceType = 'mongo'; // <-- default one.  Should be between 'mongo' / 'dhis2'

    try
    {
        var userInfo = AppInfoManager.getData( AppInfoManager.KEY_USERINFO );

        if ( userInfo && userInfo.user )
        {
            // get dcdConfig of the user..
            var userLoginData = SessionManager.getLoginDataFromStorage( userInfo.user );
    
            if ( userLoginData && userLoginData.dcdConfig && userLoginData.dcdConfig.sourceType )
            {
                sourceType = userLoginData.dcdConfig.sourceType;
            }    
        }    
    }
    catch ( errMsg )
    {
		console.customLog( 'ERROR in AppInfoManager.getUserConfigSourceType: ' + errMsg );
    }

    return sourceType;
};


// ------------------------------------------------------------------------------------  
// ----------------  langTerms

// TRAN TODO : the method name should be "setLangTerms", instead of using "updateLangTerms"
AppInfoManager.updateLangTerms = function( jsonData )
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_TRANSLATION, AppInfoManager.KEY_LANG_TERMS, jsonData );
};

AppInfoManager.getLangTerms = function()
{
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_TRANSLATION, AppInfoManager.KEY_LANG_TERMS );
};	

// ------------------

// GETS USED WHEN UserInfo gets 1st created..
AppInfoManager.getLangCode = function()
{
	var langCode = '';

	try
	{        
        var langCode = AppInfoManager.getPropertyValue( AppInfoManager.KEY_TRANSLATION, AppInfoManager.KEY_LANG_CODE );
             	        
        if ( !langCode )
        {
            langCode = ( navigator.language ).toString().substring(0,2);

            if ( langCode ) AppInfoManager.setLangCode( langCode );
        }        
	}
	catch ( err )
	{
		console.customLog( 'Error in AppInfoManager.getLangCode: ' + err );
	}

	return langCode;
};

AppInfoManager.setLangCode = function( langCode )
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_TRANSLATION, AppInfoManager.KEY_LANG_CODE, langCode );
};

// ------------------

// TRAN TODO : the result is a string date, but "getSyncLastDownloadInfo" return a Date object.
//             Should we result the same value for two methods, String date OR Date object ???
AppInfoManager.getLangLastDateTime = function()
{
    var langLastDateTime = AppInfoManager.getPropertyValue( AppInfoManager.KEY_TRANSLATION, AppInfoManager.KEY_LANG_LASTTRYDT );
    return ( langLastDateTime ) ? langLastDateTime : "";
};


AppInfoManager.setLangLastDateTime = function( dateObj )
{
    var langLastDateTimeStr = Util.formatDate( dateObj );
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_TRANSLATION, AppInfoManager.KEY_LANG_LASTTRYDT, langLastDateTimeStr );
};


// ------------------------------------------------------------------------------------  
// ----------------  sync Last Downloaded

AppInfoManager.updateSyncLastDownloadInfo = function( dateStr )
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_SYNC, AppInfoManager.KEY_SYNC_LAST_DOWNLOADINFO, dateStr );

    // Update the 'INFO' when updated - since we use this through 'INFO' object.
    InfoDataManager.setINFO_lastDownloaded( dateStr );
}	

AppInfoManager.getSyncLastDownloadInfo = function()
{
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_SYNC, AppInfoManager.KEY_SYNC_LAST_DOWNLOADINFO );
}	


// ------------------------------------------------------------------------------------  
// ----------------  Update properties in "userinfo"

// networkSync
AppInfoManager.updateNetworkSync = function( dataStr ) 
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_USERINFO, AppInfoManager.KEY_NETWORKSYNC, dataStr );
}	

AppInfoManager.getNetworkSync = function() 
{
    var appInfo = AppInfoManager.data;

    if ( !appInfo.userInfo ) appInfo.userInfo = {};
    
    if ( appInfo.userInfo.networkSync === undefined ) 
    {
        AppInfoManager.updatePropertyValue( AppInfoManager.KEY_USERINFO, AppInfoManager.KEY_NETWORKSYNC, ConfigManager.getSettingNetworkSync() );
    }

    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_USERINFO, AppInfoManager.KEY_NETWORKSYNC );
}	

// -----------------------------------------------

// TRAN  TODO : We should use "updateLangTerms" instead of this method "updateLanguage"
// language
AppInfoManager.updateLanguage = function( dataStr ) 
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_USERINFO, AppInfoManager.KEY_LANG_TERMS, dataStr );
}	


// ------------------------------------------------------------------------------------  
// ----------------  Update properties in lastLogin?

// setLastLoginMark

AppInfoManager.getStatisticPages = function( fileName ) 
{
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_STATISTIC_PAGES, fileName );
};

AppInfoManager.updateStatisticPages = function( fileName, dataStr ) 
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_STATISTIC_PAGES, fileName, dataStr );
};


// ------------------------------------------------------------------------------------  
// -----------------------------------------------

// ---- Localhost Stage related..
AppInfoManager.getLocalStageName = function() 
{
    return AppInfoManager.getKeyValue( AppInfoManager.KEY_LOCAL_STAGENAME );
};

AppInfoManager.setLocalStageName = function( stageName ) 
{
    AppInfoManager.updateKey_StrValue( AppInfoManager.KEY_LOCAL_STAGENAME, stageName );
};

// ------------------------------------------------------------------------------------  
// ------------------------------------------------------------------------------------  
