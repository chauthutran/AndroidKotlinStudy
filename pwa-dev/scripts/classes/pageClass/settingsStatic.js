//	TODO: ?: Rename to 'LSAppInfoManager'?
function SettingsStatic() {};

SettingsStatic.CUT_LIST_MSG = '. [LIST:';

SettingsStatic.fixOperationRun = function( returnFunc )
{
    // TODO:
    //      1. [DO!!] Once when come online operation --> trigger after login & online (has similar operation already)
    //      2. [DONE] This fix operations..
    //      3. [DONE] Post the after operation log --> client Id..
    
    var INFO = InfoDataManager.getINFO();
    var fixOptLast = INFO.fixOperationLast_noZ;
    var userName = SessionManager.sessionData.login_UserName;

    SettingsStatic.retrieveFixOperations( userName, fixOptLast, function( fixOperationList, success ) 
    {
        console.log( 'SettingsStatic.retrieveFixOperations success: ' + success );

        if ( success && fixOperationList )
        {
            var isoDateStr = ( new Date() ).toISOString();                
            AppInfoManager.updateFixOperationLast( isoDateStr );


            if ( fixOperationList.length > 0 )
            {                
                // Eval each one?..
                fixOperationList.forEach( fixOpt => 
                {
                    fixOpt.resultMsg = Util.evalTryCatch( fixOpt.operation, INFO, "fixOperation - " + fixOpt.operationName );

                    if ( fixOpt.resultMsg ) 
                    {
                        console.customLog( fixOpt.resultMsg );
                        SettingsStatic.showMsg( fixOpt.resultMsg );
                    }
                });
                    
                // Add the name of each fixOperations...
                SettingsStatic.updateOnDebugHistory( fixOperationList, isoDateStr );
    
                // Update the user done with this operation..
                SettingsStatic.requestUpdate_FixOperations( fixOperationList, userName, isoDateStr, function() {
                    console.log( 'requestUpdate_FixOperations performed' );
                } );
            }

            if ( returnFunc ) returnFunc();
        }
    } );
};

SettingsStatic.showMsg = function( returnMsg )
{
    try
    {
        if ( returnMsg )
        {
            var cutMsg = str.substring( 0, returnMsg.indexOf( SettingsStatic.CUT_LIST_MSG ) );

            MsgManager.msgAreaShow( '[FIX DATA APPLIED]: ' + cutMsg );
        }    
    }
    catch( errMsg )
    {
        console.customLog( 'ERROR in SettingsStatic.showMsg, errMsg: ' + errMsg );
    }
};


// =============================================
// === FIX OPERATIONS RELATED 

//SettingsStatic.checkFixOperations = function( login_UserName, fixOperationLast, returnFunc )
//{
//	SettingsStatic.retrieveFixOperations( login_UserName, fixOperationLast, returnFunc );
//    // function( resultList ) { returnFunc( resultList ); });
//};


SettingsStatic.retrieveFixOperations = function( userName, fixOperationLast, returnFunc )
{
    // Create document with these fields - 'userName', 'dateTime'
    var payloadJson = { 'find': { 
        'userName': { '$in': [ userName, 'ALL' ] },
        "doneUsers": { "$not": { "$regex": userName } }
    } }; //, 'dateTime': { "$gte": fixOperationLast } } };

    if ( fixOperationLast ) payloadJson.find.dateTime = { "$gte": fixOperationLast };
    //"date.updatedUTC": { "$gte": "Util.getStr( INFO.syncLastDownloaded_noZ );"

    WsCallManager.requestDWS_RETRIEVE( WsCallManager.EndPoint_PWAFixOp_GET, payloadJson, undefined, returnFunc );
};


SettingsStatic.updateOnDebugHistory = function( fixOperationList, isoDateStr )
{
    fixOperationList.forEach( fixOpt => {
        AppInfoManager.addToFixOperationHistory( { 'dateTime': isoDateStr, 'operationName': fixOpt.operationName, 'optId': fixOpt._id } );
    });
};


SettingsStatic.requestUpdate_FixOperations = function( fixOperationList, userName, isoDateStr, returnFunc )
{
    if ( fixOperationList.length > 0 )
    {
        // Create document with these fields - 'userName', 'dateTime'
        var payloadJson = { 'updatelist': [] };

        fixOperationList.forEach( fixOpt => 
        {
            if ( fixOpt._id )
            {
                var recordJson = { 'dateTime': isoDateStr, 'userName': userName, 'result': fixOpt.resultMsg }; 

                var updateCmd = { 
                    'find': { '_id': fixOpt._id }
                    , 'updateData': { 
                        '$addToSet': { 'doneUsers': userName }
                        , '$push': { 'records': recordJson } 
                    }
                };

                payloadJson.updatelist.push( updateCmd );
            }
        });

        WsCallManager.requestDWS_SAVE( WsCallManager.EndPoint_PWAFixOp_RunUpdates, payloadJson, undefined, returnFunc );
    }
    else returnFunc();
};

