// -------------------------------------------
// -- WsApiManager Class/Methods

function WsApiManager() {}

WsApiManager.wsApiListJson = {
    "cws": 		 "https://cws.psi-mis.org/ws/eRefWSProd",
    "cws-train": "https://cws-train.psi-mis.org/ws/eRefWSTrain",
    "cws-stage": "https://cws-stage.psi-mis.org/ws/eRefWSStage",
    "cws-dev":   "https://cws-dev.psi-mis.org/ws/eRefWSDev3" 
    //use 'eRefWSDev4' (4) when server issues exist
};

// psi-connect.org (NEW)
// psi-mis.org (OLD)

WsApiManager.wsApiUrl = ''; 
WsApiManager.wsApiName_Dev = 'cws-dev';  // Dev Default is 'cws-dev'
WsApiManager.wsApiUrl_Dev = WsApiManager.wsApiListJson[ WsApiManager.wsApiName_Dev ]; 

WsApiManager.cwsDash = 'cws-';  // 

WsApiManager.wsName = 'eRefWSDev3';     // default 'wsName' value..
WsApiManager.serverUrl = '';  // "https://cws.psi-mis.org/ws  // Was _serverOverride before


// Below should be named differently?..
WsApiManager.serverUrl_appsPsiOrg = 'https://apps.psi-mis.org';  // Apps WebService version
WsApiManager.domain_appsPsiOrg = 'apps.psi-mis.org';  // change to '.psi-connect.org';
WsApiManager.domain_psiMIS = '.psi-mis.org';  // change to '.psi-connect.org';
WsApiManager.domain_psiConnect = '.psi-connect.org';  // change to '.psi-connect.org';


// ----------------------------------------------
// User usage site approaching types..
WsApiManager.isSite_appsPsiOrg = ( location.host.indexOf( WsApiManager.domain_appsPsiOrg ) >= 0 );
WsApiManager.isSite_psiOrg =    ( location.host.indexOf( WsApiManager.domain_psiMIS ) >= 0 )
WsApiManager.isSite_cwsDash =   ( location.host.indexOf( WsApiManager.cwsDash ) >= 0 );
WsApiManager.isSite_psiConnect =   ( location.host.indexOf( WsApiManager.domain_psiConnect ) >= 0 );

WsApiManager.isSite_DevType = ( location.host.indexOf( 'localhost' ) >= 0 
                        || location.host.indexOf( 'ngrok' ) >= 0 
                        || location.host.indexOf( '127.0.0.1:8080' ) >= 0 );
                        // location.href).substring((location.href).length - 4, (location.href).length) == '/cws' || >> last 4 chars of url
    
WsApiManager.isDebugMode = ( !WsApiManager.isSite_psiOrg || WsApiManager.isSite_cwsDash );
// ----------------------------------------------

// WsApiManager._getPWAInfo = { "reloadInstructions": {"session": "false","allCaches": "false","serviceWorker": "false"},"appWS": {"cws-dev": "eRefWSDev3","cws-train": "eRefWSTrain","cws": "eRefWSDev3"},"version": _ver};


// ==== Methods ======================

WsApiManager.setupWsApiVariables = function( returnFunc )
{
    var urlListJson = WsApiManager.wsApiListJson;

    WsApiManager.wsApiUrl = WsApiManager.getWsApiUrl( urlListJson );

    WsApiManager.wsName = WsApiManager.getWSNameFromUrl( WsApiManager.wsApiUrl );

    WsApiManager.serverUrl = WsApiManager.getServerUrl( WsApiManager.wsApiUrl, WsApiManager.wsName );

    //FormUtil._getPWAInfo = WsApiManager.wsApiUrl;  // Does not get used?

    if ( returnFunc ) returnFunc();
};

WsApiManager.getWsApiList = function( returnFunc )
{
	returnFunc( true, WsApiManager.wsApiListJson );
};

WsApiManager.getWsApiUrl = function( wsApiListJson ) 
{
    var wsApiUrl = WsApiManager.wsApiUrl_Dev;

    // If error occurs here, add try/catch
    var locHostName = location.host;

    if ( WsApiManager.isSite_psiOrg ) 
    {
        var locHostNameFront = locHostName.replace( WsApiManager.domain_psiMIS, '');
        var wsApiUrlFound = wsApiListJson[ locHostNameFront ];
    
        if ( wsApiUrlFound ) wsApiUrl = wsApiUrlFound;
    }

    return wsApiUrl;
};

WsApiManager.getWSNameFromUrl = function( wsUrl ) 
{
    var wsName = '';

    if ( wsUrl )
    {
        var wsUrlSlashArr = wsUrl.split('/');

        if ( wsUrlSlashArr.length > 0 )
        {
            var lastSlashIndex = wsUrlSlashArr.length - 1;
    
            wsName = wsUrlSlashArr[ lastSlashIndex ];    
        }
    }

    return wsName;
};

WsApiManager.getServerUrl = function( wsUrl, wsName ) 
{
    var serverUrl = '';
        
    if ( wsUrl && wsName )
    {
        var indexPos = wsUrl.indexOf( '/' + wsName );

        if ( indexPos >= 0 ) 
        {
            serverUrl = wsUrl.substring( 0, indexPos );
        }
    }

    return serverUrl;
};

WsApiManager.composeWsFullUrl = function( subUrl )
{
    // Used in config -> request url part --> could be partial or full url..
    // if 'subUrl' is full url, use it.  Otherwise, add server url in front.

    var arrHost = location.origin.split( '://' )
    var arrPlace= arrHost[ 1 ].split( '.' );
    var arrServ = arrPlace[ 0 ].split( '-' );

    if ( WsApiManager.isSite_psiConnect )
    {
        // api-dev
        return arrHost[ 0 ] + '://' + 'api-' + arrServ[ 1 ] + '.' + arrPlace[ 1 ] + '.' + arrPlace[ 2 ] + subUrl;
    }
    else
    {
        if ( subUrl.indexOf( 'http' ) === 0 )
        {
            return subUrl;  // THIS WOULD NOT NORMALY WORK DUE TO CORS policy
        } 
        else 
        {
            //return WsApiManager.getServerUrl() + "/" + WsApiManager.wsName + subUrl;
            return WsApiManager.wsApiUrl + subUrl;
        }
    }

};

WsApiManager.getServerUrl = function()
{
	var serverUrl = "";

	if ( WsApiManager.serverUrl )
	{
		serverUrl = WsApiManager.serverUrl; 
	}
	else
	{
		serverUrl = WsApiManager.serverUrl_appsPsiOrg;
	}

	return serverUrl;
};

WsApiManager.getSubDomainName_PsiOrg = function()
{
    return location.host.replace( WsApiManager.domain_psiMIS, '' );
};

// How is this used?
WsApiManager.getStageName = function()
{
    return ( WsApiManager.isSite_DevType ) ? WsApiManager.wsApiName_Dev : WsApiManager.getSubDomainName_PsiOrg();
};

WsApiManager.useDWS = function()
{
    return ( location.host.indexOf( WsApiManager.domain_psiConnect ) > 0 );
};