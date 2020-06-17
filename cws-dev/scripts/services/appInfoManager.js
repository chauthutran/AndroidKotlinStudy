function AppInfoManager() {}

AppInfoManager.KEY_APPINFO = "appInfo";

AppInfoManager.KEY_USERINFO = "userInfo"; 
AppInfoManager.KEY_SWINFO = "swInfo"; 
AppInfoManager.KEY_LANGUAGE = "langTerms"; 
AppInfoManager.KEY_SYNCMSG = "syncMsg"; 
AppInfoManager.KEY_DOWNLOADINFO = "lastDownload"; 
AppInfoManager.KEY_FAVICONS = "favIcons"; 
AppInfoManager.KEY_NETWORKCONNECTION = "networkConnectionObs";

AppInfoManager.KEY_NETWORKSYNC = "networkSync";
AppInfoManager.KEY_LOGOUTDELAY = "logoutDelay";


AppInfoManager.data = {};



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
    console.log( "removeUserInfo" );
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
		console.log( 'Error on AppInfoManager.getSessionAutoComplete, errMsg - ' + errMsg );
	}

	return autoComplete;
}



// ------------------------------------------------------------------------------------  
// ----------------  swInfo


AppInfoManager.updateSWInfo = function( jsonData )
{
    AppInfoManager.updateData( AppInfoManager.KEY_SWINFO, jsonData );
}	

AppInfoManager.getSWInfo = function()
{
    return AppInfoManager.getData( AppInfoManager.KEY_SWINFO );
}	


// ------------------------------------------------------------------------------------  
// ----------------  langTerms


AppInfoManager.updateLangTerms = function( jsonData )
{
    AppInfoManager.updateData( AppInfoManager.KEY_LANGUAGE, jsonData );
}	

AppInfoManager.getLangTerms = function()
{
    return AppInfoManager.getData( AppInfoManager.KEY_LANGUAGE );
}	



// ------------------------------------------------------------------------------------  
// ----------------  syncMsg

AppInfoManager.updateSyncMsg = function( jsonData )
{
    AppInfoManager.updateData( AppInfoManager.KEY_SYNCMSG, jsonData );
}	

AppInfoManager.getSyncMsg = function()
{
    return AppInfoManager.getData( AppInfoManager.KEY_SYNCMSG );
}	



// ------------------------------------------------------------------------------------  
// ----------------  lastDownload


AppInfoManager.updateDownloadInfo = function( dateStr )
{
    var jsonData = {};
    jsonData[AppInfoManager.KEY_DOWNLOADINFO] = dateStr;
    AppInfoManager.updateData( AppInfoManager.KEY_DOWNLOADINFO, jsonData );
}	

AppInfoManager.getDownloadInfo = function()
{
    var jsonData = AppInfoManager.getData( AppInfoManager.KEY_DOWNLOADINFO );
    if ( jsonData && jsonData.lastDownload ) 
    {
        return ( new Date( jsonData.lastDownload ) ).toISOString();	
    }

    return undefined;
}	


// ------------------------------------------------------------------------------------  
// ----------------  favIcons


AppInfoManager.updateFavIcons = function( jsonData )
{
    AppInfoManager.updateData( AppInfoManager.KEY_FAVICONS, jsonData );
}	

AppInfoManager.getFavIcons = function()
{
    return AppInfoManager.getData( AppInfoManager.KEY_FAVICONS );
}

AppInfoManager.removeFavIcons = function()
{
    AppInfoManager.removeData( AppInfoManager.KEY_FAVICONS );
}


// ------------------------------------------------------------------------------------  
// ----------------  networkConnectionObs


AppInfoManager.updateNetworkConnectionObs = function( jsonData )
{
    AppInfoManager.updateData( AppInfoManager.KEY_NETWORKCONNECTION, jsonData );
}	

AppInfoManager.getNetworkConnectionObs = function()
{
    return AppInfoManager.getData( AppInfoManager.KEY_NETWORKCONNECTION );
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
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_USERINFO, AppInfoManager.KEY_LANGUAGE, dataStr );
}	

// logoutDelay
AppInfoManager.updateLogoutDelay = function( dataStr ) 
{
    AppInfoManager.updatePropertyValue( AppInfoManager.KEY_LOGOUTDELAY, AppInfoManager.KEY_LANGUAGE, dataStr );
}


// ------------------------------------------------------------------------------------  
// ------------------------------------------------------------------------------------  
// ------------------------------------------------------------------------------------  

AppInfoManager.getData = function( keyword )
{
    return AppInfoManager.data[keyword];
}	


AppInfoManager.updateData = function( keyword, jsonData )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.loadAppInfo();
    
    // Update data of appInfo by using keyword
    appInfo[keyword] = jsonData;
    LocalStgMng.saveJsonData( AppInfoManager.KEY_APPINFO, appInfo );

    // Set new data info in memory
    AppInfoManager.data = appInfo;
}


AppInfoManager.removeData = function( keyword )
{
     // Get appInfo from localStorage if any. If not, use default appInfo
     var appInfo = AppInfoManager.loadAppInfo();
    
     // Update data of appInfo by using keyword
     delete appInfo[keyword];
     
     // Update the 'appInfo' data
     LocalStgMng.saveJsonData( AppInfoManager.KEY_APPINFO, appInfo );
}
	

// Get appInfo from localStorage if any. If not, use default appInfo
AppInfoManager.loadAppInfo = function()
{
    var appInfo = LocalStgMng.getJsonData( AppInfoManager.KEY_APPINFO );
    return ( appInfo == undefined ) ? AppInfoManager.data : appInfo;
}


AppInfoManager.updatePropertyValue = function( mainKey, subKey, valStr )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.loadAppInfo();
    
    // Update sub value by using keyword
    if( appInfo[mainKey] == undefined )
    {
        appInfo[mainKey] = {};
    }
    
    appInfo[mainKey][subKey] = valStr;

    // Update data in memory
    LocalStgMng.saveJsonData( AppInfoManager.KEY_APPINFO, appInfo );

    // Set new data info in memory
    AppInfoManager.data = appInfo;
}

AppInfoManager.getPropertyValue = function( mainKey, subKey )
{
    // Get appInfo from localStorage if any. If not, use default appInfo
    var appInfo = AppInfoManager.loadAppInfo();
    
    var mainInfo = appInfo[mainKey];
    if( mainInfo == undefined )
    {
        return undefined;
    }

    // Get Sub data if any
    return appInfo[mainKey][subKey];
}

// =========================================
// === Other Related Methods..

AppInfoManager.getLangCode = function()
{
	var lang = '';

	try
	{
		var userInfo = AppInfoManager.getUserInfo();
	
		if ( userInfo && userInfo.language ) lang = userInfo.language;
		else ( navigator.language ).toString().substring(0,2);
	}
	catch ( err )
	{
		console.log( 'Error in AppInfoManager.getLangCode: ' + err );
	}

	return lang;
};


AppInfoManager.createUpdateUserInfo = function( userName )
{
    var lastSession = AppInfoManager.getUserInfo();
    
    if ( lastSession )
    {
        lastSession.user = userName;
    
        if ( lastSession.soundEffects == undefined ) lastSession.soundEffects = ( Util.isMobi() );
        if ( lastSession.autoComplete == undefined ) lastSession.autoComplete = true; 
        if ( lastSession.logoutDelay == undefined ) lastSession.logoutDelay = 60;
    }
    else
    {
        lastSession = { 
            user: userName, lastUpdated: dtmNow
            , language: AppInfoManager.getLangCode()
            , soundEffects: ( Util.isMobi() )
            , autoComplete: true
            , logoutDelay: 60 
        };
    }    
};
