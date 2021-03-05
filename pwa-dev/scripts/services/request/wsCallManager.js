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
WsCallManager.versionNumber = '1.3';
WsCallManager.noServerUrl = 'https://pwa-noSrv.psi-connect.org';

// Temp Setting - available check override
WsCallManager.availableAlways = false;  // Used in ConnManagerNew.serverAvailable();
WsCallManager.availableCheckType = 'v2'; // 'v1' - old legacy dhis2 available check. 

// -------------------------

WsCallManager.available_PWAAvailable = '/PWA.available';
WsCallManager.available_Availability = '/availability';

WsCallManager.EndPoint_PWAFixActivitiesGET = '/PWA.fixActivitiesGET';
WsCallManager.EndPoint_PWAFixActivitiesDEL = '/PWA.fixActivitiesDEL';
WsCallManager.EndPoint_ShareDataLoad = '/PWA.loadData';
WsCallManager.EndPoint_ShareDataSave = '/PWA.shareData';

// -------------------------

WsCallManager.stageName = '';
WsCallManager.wsUrlList = {
    'prod': 'https://pwa.psi-connect.org/ws/dws',
    'wfaProd': 'https://wfa[country].psi-connect.org/ws/dws',
    'stage': 'https://pwa-stage.psi-connect.org/ws/dws-stage',
    'train': 'https://pwa-train.psi-connect.org/ws/dws-train',
    'test': 'https://pwa-test.psi-connect.org/ws/dws-test',
    'dev': 'https://pwa-dev.psi-connect.org/ws/dws-dev',
    'noSrv': 'https://pwa-noSrv.psi-connect.org/ws/dws-dev'  // or pwa-dev.---/ws/
};

WsCallManager.requestBasicAuth = 'Basic cHdhOjUyOW4zS3B5amNOY0JNc1A=';  // pwa, 529n3KpyjcNcBMsP

WsCallManager.timeOut_AvailableCheck = 60000; // timeout number used for 'available' request
WsCallManager.timeOut_DwsAvailabilityCheck = 10000; // timeout number used for 'available' request

WsCallManager.mockDelayTimeMS = 1000; // default delay time in milliseconds - 1000ms = 1 sec

// ============================================
// Setup / Set on Start of App Related ========

WsCallManager.setWsTarget = function( overrideOriginUrl, overrideStageName )
{
    var originUrl = ( overrideOriginUrl ) ? overrideOriginUrl : window.location.origin;  // https://pwa.psi-connect.. OR http://localhsot

    WsCallManager.isLocalDevCase = WsCallManager.checkLocalDevCase( originUrl );

    var stageName = 'dev';  // Default to 'dev'.
    var isWfaProd = false;

    // use current site 
    // localhost is set to use 'stage'
    if ( WsCallManager.isLocalDevCase )
    {
        if ( overrideStageName ) stageName = overrideStageName;
        else 
        {
            var savedLocalStageName = AppInfoManager.getLocalStageName();
            stageName = ( savedLocalStageName ) ? savedLocalStageName : 'test';
        }
    }
    else if ( originUrl.indexOf( 'https://pwa.' ) === 0 ) stageName = 'prod';
    else if ( originUrl.indexOf( 'https://pwa-stage.' ) === 0 ) stageName = 'stage';
    else if ( originUrl.indexOf( 'https://pwa-train.' ) === 0 ) stageName = 'train';
    else if ( originUrl.indexOf( 'https://pwa-dev.' ) === 0 ) stageName = 'dev';    
    else if ( originUrl.indexOf( 'https://pwa-test.' ) === 0 ) stageName = 'test';
    else if ( originUrl.indexOf( 'https://pwa-noSrv.' ) === 0 ) stageName = 'noSrv';
    else if ( originUrl.indexOf( 'https://wfa' ) === 0 ) 
    {
        stageName = 'prod';
        isWfaProd = true;
    }

    // Set final data into the 'WsCallManager' global value..
    WsCallManager.stageName = stageName;
    WsCallManager.wsTargetUrl = ( isWfaProd ) ? WsCallManager.getWfaProdWsUrl( originUrl ) : WsCallManager.wsUrlList[ stageName ];
};

// ----------------------------------------------------
// --- Override the target stage ------

// Testing server offline/unreachable case..
WsCallManager.setWsTarget_NoServer = function()
{
    WsCallManager.setWsTarget( WsCallManager.noServerUrl );    
};

// Local 
WsCallManager.setWsTarget_Stage = function( stage )
{
    WsCallManager.setWsTarget( undefined, stage );    
};

// ----------------------------------------------------

// If 'wfa' case, get properly named web service url
WsCallManager.getWfaProdWsUrl = function( originUrl )
{
    var wsTargetUrl = '';
    var wsTargetUrlTemp = WsCallManager.wsUrlList[ 'wfaProd' ];
    //'wfaProd': 'https://wfa[country].psi-connect.org/ws/dws'
    var countryCode = '';

    if ( originUrl.indexOf( 'https://wfa.' ) === 0 ) countryCode = '';
    else if ( originUrl.indexOf( 'https://wfa-mz.' ) === 0 ) countryCode = '-mz';
    else if ( originUrl.indexOf( 'https://wfa-np.' ) === 0 ) countryCode = '-np';
    else if ( originUrl.indexOf( 'https://wfa-tz.' ) === 0 ) countryCode = '-tz';
    else if ( originUrl.indexOf( 'https://wfa-lac.' ) === 0 ) countryCode = '-lac';
    
    wsTargetUrl = wsTargetUrlTemp.replace( '[country]', countryCode );

    return wsTargetUrl;
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

// --------------------------------------------------

WsCallManager.serverAvailable = function( callBack )
{
    try
    {
        if ( WsCallManager.availableAlways ) callBack( true );
        else
        {            
            if ( WsCallManager.availableCheckType === 'v1' )
            {
                WsCallManager.getDataServerAvailable(function (success, jsonData) 
                {    
                    // if check succeeds with valid [jsonData] payload
                    if (success && jsonData && jsonData.available != undefined) {
                        callBack( jsonData.available );
                    }
                    else {
                        callBack(false);
                    }
                });
            }
            else if ( WsCallManager.availableCheckType === 'v2' )
            {
                // If  configManager configJson.souceType is available (after login), use it.  Otherwise (on not login), get localStorage data.
                var configJson = ConfigManager.getConfigJson();
                var sourceType = ( configJson.sourceType ) ? configJson.sourceType : AppInfoManager.getUserConfigSourceType();
                if ( sourceType !== 'mongo' ) sourceType = 'dhis2';
                
                WsCallManager.dwsAvailabilityCheck( sourceType, callBack );   
            }
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'ERROR in WsCallManager.serverAvailable, errMsg: ' + errMsg );
        callBack( false );
    }    
};


//  Old legacy available check.. (use dhis2 ping only)
WsCallManager.getDataServerAvailable = function( returnFunc )
{
    var sourceTypeParam = '';
    
    if ( SessionManager.getLoginStatus() ) 
    {
        var configJson = ConfigManager.getConfigJson();
        if ( configJson ) sourceTypeParam = Util.getStr( configJson.sourceType );
    }
    else sourceTypeParam = 'notLoggedIn';

    WsCallManager.requestGetDws( WsCallManager.available_PWAAvailable + '?sourceType=' + sourceTypeParam, { 'timeOut': WsCallManager.timeOut_AvailableCheck }, undefined, returnFunc );
};


WsCallManager.dwsAvailabilityCheck = function( sourceType, returnFunc )
{
    WsCallManager.requestGetDws( WsCallManager.available_Availability
        , { 'timeOut': WsCallManager.timeOut_DwsAvailabilityCheck }
        , undefined
        , function( success, returnJson ) 
    {
        var bCheck = false;

        try 
        {
            if ( success && returnJson )
            {
                if ( sourceType === 'mongo' )
                {
                    bCheck = ( returnJson.MONGO && returnJson.MONGO.isAvailable );
                    //console.log( bCheck + ' - availability mongo' );
                }
                else if ( sourceType === 'dhis2' )
                {
                    // Check both 'DHIS2' & 'LEGACY'
                    bCheck = ( returnJson.DHIS2 && returnJson.DHIS2.isAvailable 
                        && returnJson.LEGACY && returnJson.LEGACY.isAvailable );
                    //console.log( bCheck + ' - availability dhis2' );
                }
            }
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR in WsCallManager.getDwsAvailabilityCheck, errMsg: ' + errMsg );
        }

        returnFunc( bCheck );
    });
};

// --------------------------------------------------


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
    }

    // OLD: For 'mongo' sourceType, do not need to send userName & password in payload.
    // OLD: For legacy supported calls to DWS, we need to pass userName and password in payloadJson. 
    payloadJson.userName = SessionManager.sessionData.login_UserName;
    payloadJson.password = SessionManager.sessionData.login_Password;    

    WsCallManager.requestPostDws( apiPath, payloadJson, loadingTag, returnFunc );
};


// ========================================
// === Specialized 'Post' and 'Get' =====

// 'action' calls will be using this..
WsCallManager.requestPostDws = function( apiPath, payloadJson, loadingTag, returnFunc )
{	    
    if ( !payloadJson ) payloadJson = {};
    if ( SessionManager.getLoginStatus() ) WsCallManager.addExtraPayload_BySourceType( ConfigManager.getConfigJson(), payloadJson );
    WsCallManager.addExtraPayload_Version( payloadJson );


    var url = WsCallManager.composeDwsWsFullUrl( apiPath );

    var requestOption = {
        headers: {
            'Authorization': WsCallManager.requestBasicAuth
        },        
        body: JSON.stringify( payloadJson )
    };

    // Send the POST reqesut (always catches the error case..)
	WsCallManager.requestPost( url, requestOption, loadingTag, returnFunc );
};

WsCallManager.requestGetDws = function( apiPath, optionJson, loadingTag, returnFunc )
{	
    var url = WsCallManager.composeDwsWsFullUrl( apiPath );
    url = WsCallManager.addUrlParam_Version( url );

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

WsCallManager.addExtraPayload_Version = function( payloadJson )
{
    if ( WsCallManager.versionNumber ) payloadJson.version = WsCallManager.versionNumber;
};  

WsCallManager.addUrlParam_Version = function( url )
{
    if ( WsCallManager.versionNumber ) url = Util.setUrlParam( url, 'version', WsCallManager.versionNumber );

    return url;
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


WsCallManager.mockRequestCall = function( mockResponseJson, loadingTag, returnFunc )
{	    
    try
    {
        if ( mockResponseJson )
        {
            var delayTimeMs = Util.getTimeMs( mockResponseJson.delayTime, WsCallManager.mockDelayTimeMS );
    
            setTimeout( function() 
            {
                var success = ( mockResponseJson.responseCode < 400 );
    
                WsCallManager.loadingTagClear( loadingTag );
    
                returnFunc( success, mockResponseJson.responseJson );
    
            }, delayTimeMs );
        }
        else throw 'mockResponseJson param undefined'; 
    }
    catch( errMsg )
    {
        console.customLog( 'ERROR in WsCallManager.mockRequestCall, errMsg: ' + errMsg );

        WsCallManager.loadingTagClear( loadingTag );

        returnFunc( false, undefined );
    }
};


// ===========================================
// ==== COMMON DWS ENDPOINT - REST Calls (POST)


//WsCallManager.requestPostDws = function( apiPath, payloadJson, loadingTag, returnFunc )

// SEARCH - Mongo
WsCallManager.requestDWS_GET = function( endPoint, payloadJson, loadingTag, returnFunc )
{
    WsCallManager.requestPostDws( endPoint, payloadJson, loadingTag, function( success, returnJson ) 
    {
        var resultList = [];

        if ( success && returnJson )
        {					
            if ( returnJson && returnJson.response && returnJson.response.dataList
                && returnJson.response.dataList.length > 0 )
            {
                resultList = returnJson.response.dataList;
            }
        }

        returnFunc( resultList );
    });	
};
    
// SAVE..
WsCallManager.requestDWS_SAVE = function( endPoint, payloadJson, loadingTag, returnFunc )
{
    WsCallManager.requestPostDws( endPoint, payloadJson, loadingTag, function( success, returnJson ) 
    {    
        var savedResultCount = 0;

        if ( success && returnJson && returnJson.response && returnJson.response.result && returnJson.response.result.n )  // also .result.ok = 1 could be checked?
        {
            savedResultCount = returnJson.response.result.n;
        }

        returnFunc( savedResultCount );
    });	
};

// DELETE..
WsCallManager.requestDWS_DELETE = function( endPoint, payloadJson, loadingTag, returnFunc )
{
    WsCallManager.requestPostDws( endPoint, payloadJson, loadingTag, function( success, returnJson ) 
    {    
        var deletedResultCount = 0;

        if ( success && returnJson && returnJson.response && returnJson.response.result && returnJson.response.result.n )
        {
            deletedResultCount = returnJson.response.result.n;
        }

        returnFunc( deletedResultCount );
    });	
};

