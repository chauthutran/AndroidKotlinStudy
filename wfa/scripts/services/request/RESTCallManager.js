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
    var reponseNotOK = false;
    var notOKJson = {};

    //fetch( url, requestData )
    RESTCallManager.fetchTimeout( url, requestData )
    .then( response => {
        //console.customLog( response );
        if ( response.ok ) 
        {            
            if ( requestData.returnDataType === 'text' ) return response.text();
            else return response.json();
        }
        else
        {
            reponseNotOK = true;
            notOKJson = { 'errMsg': response.statusText, 'errType': 'responseErr', 'errResponse': response, 'errStatus': response.status };

            return response.text();            
        }         
    })
    .then( responseBody => {
        try
        {
            if ( reponseNotOK )
            {
                RESTCallManager.setDwsErrMsg( notOKJson, responseBody );
                throw notOKJson;
            }
            else
            {
                returnFunc( true, responseBody );
            }
        }
        catch ( errMsg )
        {
            errMag = 'RESTCallManager.performREST, responseBody handling err: ' + errMsg;
            console.customLog( errMsg );
            throw errMsg;
        }
    })
    .catch( ( error ) => {
        console.customLog( 'RESTCallManager.performREST Cached Error: ' );
        console.customLog( error ); 

        var errJson;
        if ( Util.isTypeObject( error ) ) errJson = error;
        else if ( Util.isTypeString( error ) ) errJson = { 'errMsg': error, 'errType': 'unknown' };
        else errJson = { 'errMsg': 'unknwon error', 'errType': 'unknown' };

        returnFunc( false, errJson );
    });
};


RESTCallManager.setDwsErrMsg = function( notOKJson, responseBodyStr )
{
    try
    {
        if ( responseBodyStr.indexOf( 'ERROR_CASE' ) )
        {
            var returnJson = JSON.parse( responseBodyStr );

            notOKJson.errMsg += ' ERROR_MSG: ' + returnJson.ERROR_MSG;
        }
        else
        {
            var msg = ( responseBodyStr.length > 50 ) ? responseBodyStr.substring( 0, 50 ) + '...' : responseBodyStr;
            notOKJson.errMsg += ' ErrMsg: ' + msg;            
        }
    }
    catch ( errMsgInner )
    {
        notOKJson.errMsg += ' ErrMsg: ' + errMsgInner;
    }
};