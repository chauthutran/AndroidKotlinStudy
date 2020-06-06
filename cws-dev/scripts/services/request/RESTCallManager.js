// -------------------------------------------
// -- RESTCallManager Class/Methods
//      - Not DWS specific, but general request 'fetch' util.
// -------------------------------------

function RESTCallManager() {}

RESTCallManager.defaultTimeOut = 60000;  // 1 min.

// ==== Methods ======================
RESTCallManager.performGet = function( url, requestOption, returnFunc )
{
    var requestData = {
        method: 'GET'
    };

    if ( requestOption ) Util.mergeJson( requestData, requestOption );
    
    RESTCallManager.performREST( url, requestData, returnFunc );
};


RESTCallManager.performPost = function( url, requestOption, returnFunc )
{
    var requestData = {
        method: 'POST', 
        body: '{}'
    };

    if ( requestOption ) Util.mergeJson( requestData, requestOption );

    RESTCallManager.performREST( url, requestData, returnFunc );
};


// NEW
RESTCallManager.timeoutPromise = function( promise, timeout, error ) 
{
    return new Promise( ( resolve, reject ) => {

        setTimeout(() => {
        reject(error);
      }, timeout );

      promise.then( resolve, reject );
    });
};

RESTCallManager.fetchTimeout = function( url, options ) 
{
    options = options || {};
    var timeOutErrMsg = ( options.timeOutErrMsg ) ? options.timeOutErrMsg : 'Timeout error';
    var timeOut = ( options.timeOut ) ? options.timeOut : RESTCallManager.defaultTimeOut;
    return RESTCallManager.timeoutPromise( fetch( url, options ), timeOut, timeOutErrMsg );
};


// Only for JSON return type of REST call.
RESTCallManager.performREST = function( url, requestData, returnFunc )
{
    //fetch( url, requestData )
    RESTCallManager.fetchTimeout( url, requestData )
    .then( response => {
        if ( response.ok ) return response.json();
        else if ( response.statusText ) throw Error( response.statusText )
    })
    .then( jsonData => {
        returnFunc( true, jsonData );
    })
    .catch( error => {
        console.log( 'ErrorCatched, RESTCallManager.performREST, url: ' + url );
        console.log( error );  

        returnFunc( false, { "response": error.toString() } );
    });
};


try {
    module.exports = RESTCallManager;
} catch (error) { }
