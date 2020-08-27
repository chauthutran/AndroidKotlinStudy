// -------------------------------------------
// -- RESTCallManager Class/Methods
//      - Not DWS specific, but general request 'fetch' util.
// -------------------------------------
// Error types:
// { 'errMsg': response.statusText, 'errType': 'responseErr', 'errResponse': response, , 'errStatus': response.status };
// { 'errMsg': 'unknwon error', 'errType': 'unknown' };
// { 'errMsg': error, 'errType': 'timeout' }

function RESTCallManager() {}

RESTCallManager.defaultTimeOut = 180000;  // 3 min.

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
            reject( { 'errMsg': error, 'errType': 'timeout' } );
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
        //console.customLog( response );
        if ( response.ok ) 
        {            
            if ( requestData.returnDataType === 'text' ) return response.text();
            else return response.json();
        }
        else throw { 'errMsg': response.statusText, 'errType': 'responseErr', 'errResponse': response, 'errStatus': response.status };
    })
    .then( jsonData => {
        try
        {
            returnFunc( true, jsonData );
        }
        catch ( errMsg )
        {
            console.customLog( 'RESTCallManager.performREST, Returned Success.  Howerver, had some issue processing the returnFunc somewhere: ' + errMsg );
        }
    })
    .catch( ( error ) => {
        console.customLog( 'RESTCallManager.performREST, Error Catched, url: ' + url + ', error: ' + Util.outputAsStr( error ) );

        var errJson;
        if ( Util.isTypeObject( error ) ) errJson = error;
        else if ( Util.isTypeString( error ) ) errJson = { 'errMsg': error, 'errType': 'unknown' };
        else errJson = { 'errMsg': 'unknwon error', 'errType': 'unknown' };

        returnFunc( false, errJson );
    });
};

