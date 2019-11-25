// -------------------------------------------
// -- RESTUtil Class/Methods

function RESTUtil() {}

// ==== Methods ======================
RESTUtil.retrieveJson = function( url, returnFunc )
{
   RESTUtil.performREST( url, undefined, returnFunc );
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
   RESTUtil.performDWSrest( url, {}, returnFunc );
};

RESTUtil.performDWSrest = function( url, payloadData, returnFunc )
{
    var dws_headers = { 'Authorization': 'Basic cHdhOjUyOW4zS3B5amNOY0JNc1A=' };

    //dws_headers.append( 'Authorization', 'Basic ' + base64.encode( "pwa:529n3KpyjcNcBMsP" ) );
    //dws_headers.append( 'Authorization', 'Basic cHdhOjUyOW4zS3B5amNOY0JNc1A=' );
    console.log ( dws_headers );
    fetch( url, { headers: dws_headers } )
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