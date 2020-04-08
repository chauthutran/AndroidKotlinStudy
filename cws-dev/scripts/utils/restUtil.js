// -------------------------------------------
// -- RESTUtil Class/Methods
//      - Not DWS specific, but general request 'fetch' util.
// -------------------------------------

function RESTUtil() {}

// ==== Methods ======================
RESTUtil.performGet = function( url, requestOption, returnFunc )
{
    var requestData = {
        method: 'GET', 
    };

    if ( requestOption ) Util.mergeJson( requestData, requestOption );
    
    RESTUtil.performREST( url, requestData, returnFunc );
};


RESTUtil.performPost = function( url, requestOption, returnFunc )
{
    var requestData = {
        method: 'POST', 
        body: '{}'
    };

    if ( requestOption ) Util.mergeJson( requestData, requestOption );

    RESTUtil.performREST( url, requestData, returnFunc );
};


// Only for JSON return type of REST call.
RESTUtil.performREST = function( url, requestData, returnFunc )
{
    fetch( url, requestData )
    .then( response => {
        if ( response.ok ) return response.json();
        else if ( response.statusText ) throw Error( response.statusText )
    })
    .then( jsonData => {
        returnFunc( true, jsonData );
    })
    .catch( error => {
        console.log( 'ErrorCatched, RESTUtil.performREST, url: ' + url );
        console.log( error );  

        returnFunc( false, { "response": error.toString() } );
    });
};


try {
    module.exports = RESTUtil;
} catch (error) { }
