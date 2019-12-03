// -------------------------------------------
// -- RESTUtil Class/Methods

function RESTUtil() {}

// ==== Methods ======================
RESTUtil.retrieveJson = function( url, returnFunc )
{
    if ( WsApiManager.useDWS() )
    {
        RESTUtil.performDWSfetch( url, undefined, returnFunc );
    }
    else
    {
        RESTUtil.performREST( url, undefined, returnFunc );
    }
};

RESTUtil.performREST = function( url, payloadData, returnFunc )
{
    if ( WsApiManager.useDWS() )
    {
        RESTUtil.performDWSfetch( url, payloadData, returnFunc );
    }
    else
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
            }
            returnFunc( false, { "response": error.toString() } );
        });
    }

};


RESTUtil.retrieveDWSJson = function( url, returnFunc )
{
   RESTUtil.performDWSfetch( url, undefined, returnFunc );
};

RESTUtil.performDWSfetch = function( url, payloadData, returnFunc )
{
    if ( payloadData )
    {
        fetch( url, payloadData )
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
            }
            if ( returnFunc ) returnFunc( false, { "response": error.toString() } );
        });
    }
    else
    {
        fetch( url, { method: 'get', headers: { 'Authorization': 'Basic cHdhOjUyOW4zS3B5amNOY0JNc1A=' } } )
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
    }
    
}