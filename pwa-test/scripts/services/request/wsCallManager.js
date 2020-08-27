// -------------------------------------------
// -- WsApiManager Class/Methods
//
//  - Almost all calls should be directed to DWS
//      - pwa.psi-connect.org app will use pwa.psi-connect.org/ws/dws
//      - pwa-dev.psi-connect.org app will use pwa.psi-connect.org/ws/dws-dev
//
// -------------------------------------------

function WsCallManager() {}

WsCallManager.wsTargetUrl = '';  // get set when start..
WsCallManager.localhostProxyUrl = 'http://localhost:3020';
WsCallManager.isLocalDevCase = false;

WsCallManager.stageName = '';
WsCallManager.wsUrlList = {
    'prod': 'https://pwa.psi-connect.org/ws/dws',
    'stage': 'https://pwa-stage.psi-connect.org/ws/dws-stage',
    'train': 'https://pwa-train.psi-connect.org/ws/dws-train',
    'dev': 'https://pwa-dev.psi-connect.org/ws/dws-dev',
    'test': 'https://pwa-test.psi-connect.org/ws/dws-test'
};

WsCallManager.requestBasicAuth = 'Basic cHdhOjUyOW4zS3B5amNOY0JNc1A=';  // pwa, 529n3KpyjcNcBMsP

WsCallManager.timeOut_AvailableCheck = 60000; // timeout number used for 'available' request

// ============================================
// Setup / Set on Start of App Related ========

WsCallManager.setWsTarget = function()
{
    var originUrl = window.location.origin;  // https://pwa.psi-connect.. OR http://localhsot

    WsCallManager.isLocalDevCase = WsCallManager.checkLocalDevCase( originUrl );

    var stageName = 'dev';  // Default to 'dev'.

    // use current site 
    // localhost is set to use 'stage'
    if ( WsCallManager.isLocalDevCase ) stageName = 'dev';
    else if ( originUrl.indexOf( 'https://pwa.' ) === 0 ) stageName = 'prod';
    else if ( originUrl.indexOf( 'https://pwa-stage.' ) === 0 ) stageName = 'stage';
    else if ( originUrl.indexOf( 'https://pwa-train.' ) === 0 ) stageName = 'train';
    else if ( originUrl.indexOf( 'https://pwa-dev.' ) === 0 ) stageName = 'dev';    
    else if ( originUrl.indexOf( 'https://pwa-test.' ) === 0 ) stageName = 'test';
    
    WsCallManager.stageName = stageName;
    WsCallManager.wsTargetUrl = WsCallManager.wsUrlList[ stageName ];
};


// =======================================
// === Specific Usage Calls =========

WsCallManager.submitLogin = function( userName, password, loadingTag, returnFunc )
{        
    var requestOption = { 'userName': userName, 'password': password };

	WsCallManager.requestPostDws( '/PWA.loginCheck', requestOption, loadingTag, function( success, returnJson )
	{
		if ( success )
		{
			// Check the login success message in content.. ..			
			var hasLoginStatus = ( returnJson && returnJson.loginStatus );

			if ( returnFunc ) returnFunc( hasLoginStatus, returnJson );
        }
        else
        {
			if ( returnFunc ) returnFunc( false, returnJson );
        }
	});
};


WsCallManager.getDataServerAvailable = function( returnFunc )
{
    var sourceTypeParam = '';
    
    if ( SessionManager.getLoginStatus() ) 
    {
        var configJson = ConfigManager.getConfigJson();
        if ( configJson ) sourceTypeParam = Util.getStr( configJson.sourceType );
    }
    else sourceTypeParam = 'notLoggedIn';

    WsCallManager.requestGetDws( '/PWA.available?sourceType=' + sourceTypeParam, { 'timeOut': WsCallManager.timeOut_AvailableCheck }, undefined, returnFunc );
};


WsCallManager.wsActionCall = function( apiPath, payloadJson, loadingTag, returnFunc )
{	    
    var configJson = ConfigManager.getConfigJson();
    var sourceType = configJson.sourceType;
    var mongoSchemaVersion = configJson.mongoSchemaVersion;

    if ( sourceType )
    {
        payloadJson.sourceType = sourceType;
    }

    if ( sourceType === "mongo" )
    {
        if ( mongoSchemaVersion ) payloadJson.mongoSchemaVersion = mongoSchemaVersion;
        // For 'mongo' sourceType, do not need to send userName & password in payload.
    }
    else
    {
        // if ( sourceType !== "mongo" )
        // For legacy supported calls to DWS, we need to pass userName and password in payloadJson. 
        payloadJson.userName = SessionManager.sessionData.login_UserName;
        payloadJson.password = SessionManager.sessionData.login_Password;    
    }

    WsCallManager.requestPostDws( apiPath, payloadJson, loadingTag, returnFunc );
};


// ========================================
// === Specialized 'Post' and 'Get' =====

// 'action' calls will be using this..
WsCallManager.requestPostDws = function( apiPath, payloadJson, loadingTag, returnFunc )
{	    
    if ( !payloadJson ) payloadJson = {};

    if ( SessionManager.getLoginStatus() ) WsCallManager.addExtraPayload_BySourceType( ConfigManager.getConfigJson(), payloadJson );


    var url = WsCallManager.composeDwsWsFullUrl( apiPath );

    var requestOption = {
        headers: {
            'Authorization': WsCallManager.requestBasicAuth
        },        
        body: JSON.stringify( payloadJson )
    };

    // Send the POST reqesut	
	WsCallManager.requestPost( url, requestOption, loadingTag, returnFunc );
};

WsCallManager.requestGetDws = function( apiPath, optionJson, loadingTag, returnFunc )
{	
    var url = WsCallManager.composeDwsWsFullUrl( apiPath );

    var requestOption = {
        headers: {
            'Authorization': WsCallManager.requestBasicAuth
        }
    };

    if ( optionJson ) Util.mergeJson( requestOption, optionJson );

    WsCallManager.requestGet( url, requestOption, loadingTag, returnFunc );
};

// Temporary text response one - we should unify all the response as json
WsCallManager.requestGet_Text = function( url, requestOption, loadingTag, returnFunc )
{
    requestOption.returnDataType = 'text';
    WsCallManager.requestGet( url, requestOption, loadingTag, returnFunc );
};

// ========================================
// === Basic 'Post' and 'Get' =====

// 'action' calls will be using this..
WsCallManager.requestPost = function( url, requestOption, loadingTag, returnFunc )
{	        
    //var requestOption = { headers: { 'Authorization': WsCallManager.requestBasicAuth },        
    //    body: JSON.stringify( payloadJson )  };

    url = WsCallManager.localhostProxyCaseHandle( url ); //, requestOption );

	// Send the POST reqesut	
	RESTCallManager.performPost( url, requestOption, function( success, returnJson ) 
	{
        WsCallManager.loadingTagClear( loadingTag );

		if ( returnFunc ) returnFunc( success, returnJson );
	});
};

WsCallManager.requestGet = function( url, requestOption, loadingTag, returnFunc )
{	
    //var requestOption = { headers: { 'Authorization': WsCallManager.requestBasicAuth } };
    //if ( optionJson ) Util.mergeJson( requestOption, optionJson );

    url = WsCallManager.localhostProxyCaseHandle( url ); //, requestOption );

	// Send the POST reqesut	
	RESTCallManager.performGet( url, requestOption, function( success, returnJson ) 
	{        
        Util.tryCatchContinue( function() {
            
            WsCallManager.loadingTagClear( loadingTag );

        }, "WsCallManager.requestGet loadingTag Clear" );

		if ( returnFunc ) returnFunc( success, returnJson );
	});
};

// ========================================


WsCallManager.addExtraPayload_BySourceType = function( configJson, payloadJson )
{
    if ( configJson.sourceType )
    {
        payloadJson.sourceType = configJson.sourceType;
    }
    
    if ( configJson.sourceType === "mongo" )
    {
        if ( configJson.mongoSchemaVersion ) payloadJson.mongoSchemaVersion = configJson.mongoSchemaVersion;
        // For 'mongo' sourceType, do not need to send userName & password in payload.
    }
    else
    {
        // if ( sourceType !== "mongo" )
        // For legacy supported calls to DWS, we need to pass userName and password in payloadJson. 
        if ( SessionManager.sessionData.login_UserName ) payloadJson.userName = SessionManager.sessionData.login_UserName;
        if ( SessionManager.sessionData.login_Password ) payloadJson.password = SessionManager.sessionData.login_Password;    
    }      
};


// Used to force the ws target - by console
WsCallManager.forceWsTarget = function( stageName )
{
    WsCallManager.wsTargetUrl = WsCallManager.wsUrlList[ stageName ];
    WsCallManager.isLocalDevCase = true; // if changed to 'stage' (from 'dev'), we should also use 'cors' redirection service.
};


WsCallManager.checkLocalDevCase = function( originUrl )
{
    return ( originUrl.indexOf( 'http://localhost' ) === 0 
    || originUrl.indexOf( 'http://127.0.0.1:' ) === 0 );
};


WsCallManager.localhostProxyCaseHandle = function( url ) //, requestOption )
{
    if ( WsCallManager.isLocalDevCase )
    {
        //requestOption.headers[ 'Target-URL' ] = url;
        url = WsCallManager.localhostProxyUrl + '/' + url;
    }
    
    return url;
};


WsCallManager.loadingTagClear = function( loadingTag )
{
    try
    {
        if ( loadingTag ) loadingTag.remove();
    }
    catch { }
};

// -----------------------------------------

WsCallManager.composeDwsWsFullUrl = function( targetUrl )
{
    if ( targetUrl.indexOf( 'http' ) === 0 )
    {
        // target has full path.
        return targetUrl;
    }
    else
    {
        // If partial data, add ws origin..
        return WsCallManager.wsTargetUrl + targetUrl;        
    }
};

