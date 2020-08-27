function AppInfoManager() {}

AppInfoManager.KEY_APPINFO = "appInfo";

AppInfoManager.KEY_TRANSLATION = "translation"; 
AppInfoManager.KEY_SYNC = "sync"; 
AppInfoManager.KEY_USERINFO = "userInfo"; 


AppInfoManager.KEY_LANG_CODE = "langCode"; 
AppInfoManager.KEY_LANG_LASTTRYDT = "langLastTryDT"; 

AppInfoManager.KEY_LANG_TERMS = "langTerms"; 
AppInfoManager.KEY_SYNC_LAST_DOWNLOADINFO = "syncLastDownloaded"; 


AppInfoManager.KEY_NETWORKSYNC = "networkSync";
AppInfoManager.KEY_LOGOUTDELAY = "logoutDelay";

AppInfoManager.KEY_STATISTIC_PAGES = "statisticPages"; 

AppInfoManager.data = { 'translation': {}, 'sync': {} };  // minimum basic 'appInfo' shell structure


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
// ----------------  User info


AppInfoManager.updateUserInfo = function( jsonData )
{
    AppInfoManager.updateData( AppInfoManager.KEY_USERINFO, jsonData );
}	


AppInfoManager.getUserInfo = function()
{
    return AppInfoManager.getData( AppInfoManager.KEY_USERINFO );
}	


AppInfoManager.removeUserInfo = function()
{
    AppInfoManager.removeData( AppInfoManager.KEY_USERINFO );
}


AppInfoManager.getSessionAutoComplete = function()
{	
	var autoComplete = '';

	try
	{
		autoComplete = AppInfoManager.getUserInfo().autoComplete;
	}
	catch( errMsg )
	{
		console.customLog( 'Error on AppInfoManager.getSessionAutoComplete, errMsg - ' + errMsg );
	}

	return autoComplete;
}


// ------------------------------------------------------------------------------------  
// ----------------  langTerms


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
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_USERINFO, AppInfoManager.KEY_NETWORKSYNC );
}	


// language
AppInfoManager.updateLanguage = function( dataStr ) 
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_USERINFO, AppInfoManager.KEY_LANG_TERMS, dataStr );
}	

// logoutDelay
AppInfoManager.updateLogoutDelay = function( dataStr ) 
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_USERINFO, AppInfoManager.KEY_LOGOUTDELAY, dataStr );
}


// ------------------------------------------------------------------------------------  
// ----------------  Update properties in "statisticPages"


AppInfoManager.updateStatisticPages = function( fileName, dataStr ) 
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_STATISTIC_PAGES, fileName, dataStr );
};

AppInfoManager.getStatisticPages = function( fileName ) 
{
    return AppInfoManager.getPropertyValue( AppInfoManager.KEY_STATISTIC_PAGES, fileName );
};

// ------------------------------------------------------------------------------------  
// ------------------------------------------------------------------------------------  
// ------------------------------------------------------------------------------------  

// 
AppInfoManager.getData = function( keyword )
{
    return AppInfoManager.data[keyword];
}	


AppInfoManager.updateData = function( keyword, jsonData )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.data;
    
    // Update data of appInfo by using keyword
    appInfo[keyword] = jsonData;
    LocalStgMng.saveJsonData( AppInfoManager.KEY_APPINFO, appInfo );
}


AppInfoManager.removeData = function( keyword )
{
     // Get appInfo from localStorage if any. If not, use default appInfo
     var appInfo = AppInfoManager.data;
    
     // Update data of appInfo by using keyword
     delete appInfo[keyword];
     
     // Update the 'appInfo' data
     LocalStgMng.saveJsonData( AppInfoManager.KEY_APPINFO, appInfo );
}
	

// Get appInfo from localStorage if any. If not, use default appInfo
AppInfoManager.loadAppInfo = function()
{
    var appInfo = LocalStgMng.getJsonData( AppInfoManager.KEY_APPINFO );

    if ( !appInfo )
    {
        appInfo = AppInfoManager.data;
    }
    else
    {
        // Set minial structure - 'translation' and 'sync' shell should always exists..
        if ( !appInfo.translation ) appInfo.translation = {};
        if ( !appInfo.sync ) appInfo.sync = {};
    }

    return appInfo;
}


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
}

AppInfoManager.getPropertyValue = function( mainKey, subKey )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.data;
    
    var mainInfo = appInfo[mainKey];
    if( mainInfo == undefined )
    {
        return undefined;
    }

    // Get Sub data if any
    return appInfo[mainKey][subKey];
};


// =========================================
// === Other Related Methods..

// ------------------------------------------

// Called On Login...?  Why?  Maybe on App Start?
AppInfoManager.createUpdateUserInfo = function( userName )
{
    var userInfo = AppInfoManager.getUserInfo();
    
    // UNDERSTAND ABOUT 'userName' saving & use, but... what about lastUpdated, etc?
    // All others should move some place else?
    if ( userInfo )
    {
        userInfo.user = userName;
    
        //if ( userInfo.soundEffects === undefined ) userInfo.soundEffects = ( Util.isMobi() );
        //if ( userInfo.autoComplete === undefined ) userInfo.autoComplete = true; 
        //if ( userInfo.logoutDelay === undefined ) userInfo.logoutDelay = 60;
    }
    else
    {
        //var dtmNow = ( new Date() ).toISOString();
        
        userInfo = { 
            user: userName
            //, language: AppInfoManager.getLangCode()
            , soundEffects: ( Util.isMobi() )
            , autoComplete: true
            , logoutDelay: 60 
        };
    }    
    
    AppInfoManager.updateUserInfo( userInfo );
};
