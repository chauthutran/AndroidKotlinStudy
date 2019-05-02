// -------------------------------------------
// -- RESTUtil Class/Methods

function RESTUtil() {}

// ==== Methods ======================
RESTUtil.retrieveJson = function( url, returnFunc )
{
   RESTUtil.performREST( url, undefined, returnFunc );
};


// RESTUtil.postJson operation, use 'FormUtil.wsSubmitGeneral'
//FormUtil.wsSubmitGeneral = function( url, payloadJson, loadingTag, returnFunc )


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
        console.log( 'Failed to retrieve url - ' + url );
        console.log( error );  
        //alert( 'Failed to load the config file' );
        returnFunc( false, { "response": error.toString() } );
    });
};