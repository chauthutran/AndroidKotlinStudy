function AppInfoManager() {}

AppInfoManager.KEY_APPINFO = "appInfo";

AppInfoManager.KEY_USERINFO = "userInfo"; 
AppInfoManager.KEY_SWINFO = "swInfo"; 
AppInfoManager.KEY_LANGUAGE = "langTerms"; 
AppInfoManager.KEY_SYNCMSG = "syncMsg"; 
AppInfoManager.KEY_DOWNLOADINFO = "lastDownload"; 
AppInfoManager.KEY_FAVICONS = "favIcons"; 


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
    // localStorage.setItem( AppInfoManager.KEY_APPINFO, JSON.stringify( appInfo ) );
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
