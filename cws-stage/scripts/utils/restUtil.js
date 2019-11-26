// -------------------------------------------
// -- RESTUtil Class/Methods

function RESTUtil() {}

// ==== Methods ======================
RESTUtil.retrieveJson = function( url, returnFunc )
{
    if ( WsApiManager.useDWS() )
    {
        RESTUtil.performDWSfetch( url, returnFunc );
    }
    else
    {
        RESTUtil.performREST( url, undefined, returnFunc );
    }
};

RESTUtil.performREST = function( url, payloadData, returnFunc )
{
    fetch( url, payloadData )
    .then( response => {
        if ( response.ok ) return response.json();
        else if ( response.statusText ) throw Error( response.statusText )
    })
    .then( jsonData => {
        returnFunc( true, jsonData );
    })
    .catch( error => {
        if ( WsApiManager.isDebugMode )
        {
            console.log( 'Failed to retrieve url - ' + url );
            console.log( error );  
            //alert( 'Failed to load the config file' );
        }
        returnFunc( false, { "response": error.toString() } );
    });
};


RESTUtil.retrieveDWSJson = function( url, returnFunc )
{
   RESTUtil.performDWSfetch( url, returnFunc );
};

RESTUtil.performDWSfetch = function( url, returnFunc )
{

    //var dws_headers = new Headers();
    //dws_headers.set('Content-Type', 'text/plain');
    //dws_headers.set('Accept', 'application/json');
    //dws_headers.set('Authorization', 'Basic cHdhOjUyOW4zS3B5amNOY0JNc1A=');
    //var request = new Request( url, { method: 'get', mode: 'no-cors', headers: dws_headers } );
    //var dws_headers = { 'Authorization': 'Basic cHdhOjUyOW4zS3B5amNOY0JNc1A=' };
    //fetch( request )
    //fetch( url, { method: 'get', mode: 'no-cors', headers: dws_headers } )

    fetch( url, { method: 'get', mode: 'no-cors', headers: { 'Authorization': 'Basic cHdhOjUyOW4zS3B5amNOY0JNc1A=' } } )
    .then( response => {
        if ( response.ok ) return response.json();
        else if ( response.statusText ) throw Error( response.statusText )
    })
    .then( jsonData => {
        if ( returnFunc ) returnFunc( true, jsonData );
    })
    .catch( error => {
        if ( WsApiManager.isDebugMode )
        {
            console.log( 'Failed to retrieve url - ' + url );
            console.log( error );  
            //alert( 'Failed to load the config file' );
        }
        if ( returnFunc ) returnFunc( false, { "response": error.toString() } );
    });
};