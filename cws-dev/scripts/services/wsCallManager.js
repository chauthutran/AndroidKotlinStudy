// -------------------------------------------
// -- WsApiManager Class/Methods
//
//  - Almost all calls should be directed to DWS
//      - pwa.psi-connect.org app will use pwa.psi-connect.org/ws/dws
//      - pwa-dev.psi-connect.org app will use pwa.psi-connect.org/ws/dws-dev
//
// -------------------------------------------

function WsCallManager() {}

WsCallManager.wsOriginUrl = '';  // get set when start..
WsCallManager.localhostProxyUrl = 'http://localhost:3020';

WsCallManager.wsUrlList = {
    'prod': 'https://pwa.psi-connect.org/ws/dws',
    'stage': 'https://pwa-stage.psi-connect.org/ws/dws-stage',
    'dev': 'https://pwa-dev.psi-connect.org/ws/dws-dev'
};

WsCallManager.requestBasicAuth = 'Basic cHdhOjUyOW4zS3B5amNOY0JNc1A='; // { 'Authorization': 


// ============================================
// Setup / Set on Start of App Related ========

WsCallManager.setWsOriginUrl = function()
{
    var originUrl = window.location.origin;  // https://pwa.psi-connect.. OR http://localhsot

    var stageName = 'dev';  // Default to 'dev'.

    // use current site 
    // localhost is set to use 'stage'
    if ( originUrl.indexOf( 'http://localhost' ) === 0 ) stageName = 'stage';
    else if ( originUrl.indexOf( 'https://pwa.' ) === 0 ) stageName = 'prod';
    else if ( originUrl.indexOf( 'https://pwa-stage.' ) === 0 ) stageName = 'stage';
    else if ( originUrl.indexOf( 'https://pwa-dev.' ) === 0 ) stageName = 'dev';    
    
    WsCallManager.wsOriginUrl = WsCallManager.wsUrlList[ stageName ];
};


WsCallManager.localhostProxyCaseHandle = function( url, requestOption )
{
    if ( window.location.origin.indexOf( 'http://localhost' ) === 0 )
    {
        //requestOption.headers[ 'Target-URL' ] = url;

        url = WsCallManager.localhostProxyUrl + '/' + url;
    }
    
    return url;
};


// =======================================
// === Specific Usage Calls =========

WsCallManager.submitLogin = function( userName, password, loadingTag, returnFunc )
{        
    var requestOption = { 'userName': userName, 'password': password };

	WsCallManager.requestPost( '/PWA.loginCheck', requestOption, loadingTag, function( success, returnJson )
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
    WsCallManager.requestGet( '/PWA.available', undefined, returnFunc );
};


// ========================================
// === Basic 'Post' and 'Get' =====

// 'action' calls will be using this..
WsCallManager.requestPost = function( apiPath, payloadJson, loadingTag, returnFunc )
{	    
    var url = WsCallManager.composeWsFullUrl( apiPath );

    var requestOption = {
        headers: {
            'Authorization': WsCallManager.requestBasicAuth
        },        
        body: JSON.stringify( payloadJson )
    };

    url = WsCallManager.localhostProxyCaseHandle( url, requestOption );

	// Send the POST reqesut	
	RESTUtil.performPost( url, requestOption, function( success, returnJson ) 
	{
		if ( loadingTag ) loadingTag.remove();

		if ( returnFunc ) returnFunc( success, returnJson );
	});
};

WsCallManager.requestGet = function( apiPath, loadingTag, returnFunc )
{	
    var url = WsCallManager.composeWsFullUrl( apiPath );

    var requestOption = {
        headers: {
            'Authorization': WsCallManager.requestBasicAuth
        }
    };

    url = WsCallManager.localhostProxyCaseHandle( url, requestOption );

	// Send the POST reqesut	
	RESTUtil.performGet( url, requestOption, function( success, returnJson ) 
	{
		if ( loadingTag ) loadingTag.remove();

		if ( returnFunc ) returnFunc( success, returnJson );
	});
};

// ========================================


WsCallManager.composeWsFullUrl = function( targetUrl )
{
    if ( targetUrl.indexOf( 'http' ) === 0 )
    {
        // target has full path.
        return targetUrl;
    }
    else
    {
        // If partial data, add ws origin..
        return WsCallManager.wsOriginUrl + targetUrl;        
    }
};

