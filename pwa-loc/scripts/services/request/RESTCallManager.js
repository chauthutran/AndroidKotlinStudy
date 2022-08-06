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
    return new Promise( ( resolve, reject ) => 
    {
        setTimeout(() => {
            reject( { 'errMsg': error, 'errType': 'timeout' } );
        }, timeout );

        promise.then( resolve, reject );  // .catch( errMsg => {} )

        // For availability check, server not available case (due to offline, etc..)
        // We could handle the catch above?

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
    var reponseNotOK = false;
    //var notOKJson = {};

    //fetch( url, requestData )
    RESTCallManager.fetchTimeout( url, requestData )
    .then( response => 
    {
        // 'ok' means response status code is 2XX        
        if ( response.ok ) return response.json();
        else
        {
            reponseNotOK = true;
            console.log( response.headers.get('Content-Type') );
            // NOTE: Failed request has a couple types: 1. DWS json response with status 400/500, 2. server failure/unreach with text, 3. etc..
            // Since we do not know if the content is text or json (), GET IT AS TEXT and try to convert it to json.
            //  ( ? Maybe with response.headers.get('Content-Type'); ?  We can get? )
            return response.text();            
        }         
    })
    .then( responseBody => 
    {
        if ( reponseNotOK ) throw RESTCallManager.getDwsErrMsgJson( responseBody );
        else returnFunc( true, responseBody );
    })
    .catch( ( error ) => 
    {
        if ( url.indexOf( '/availability' ) > 0 ) { } // For availability one, be silent about error.
        else console.log( 'RESTCallManager.performREST Error, ' + Util.getStr( error, 300 ) );

        var errJson;
        if ( Util.isTypeObject( error ) ) errJson = error;
        else if ( Util.isTypeString( error ) ) errJson = { 'errMsg': error, 'errType': 'unknown' };
        else errJson = { 'errMsg': 'unknwon error', 'errType': 'unknown' };

        returnFunc( false, errJson );
    });
};


RESTCallManager.getDwsErrMsgJson = function( responseBodyStr )
{
    // NOTE: Failed request has a couple types: 1. DWS json response with status 400/500, 2. server failure/unreach with text, 3. etc..
    // Since we do not know if the content is text or json (), GET IT AS TEXT and try to convert it to json.
    var notOKJson = { errMsg: '' };
    var responseJson;

    // try catch to see if we can get 'responseJson..
    try { responseJson = JSON.parse( responseBodyStr ); }
    catch ( errMsg ) { }

    try
    {
        if ( responseJson && Util.isTypeObject( responseJson ) )
        {
            notOKJson = { 'errMsg': responseJson.statusText, 'errType': 'responseErr', 'errResponse': responseJson, 'errStatus': responseJson.status };

            if ( responseBodyStr.indexOf( 'ERROR_CASE' ) ) notOKJson.errMsg += ' ERROR_MSG: ' + responseJson.ERROR_MSG;
        }
        else
        {
            // text version..
            notOKJson.errMsg = ' ErrMsg: ' + ( responseBodyStr.length > 50 ) ? responseBodyStr.substring( 0, 50 ) + '...' : responseBodyStr;         
        }
    }
    catch ( errMsgInner )
    {
        notOKJson.errMsg += ' ErrMsg: ' + errMsgInner;
    }

    return notOKJson;
};