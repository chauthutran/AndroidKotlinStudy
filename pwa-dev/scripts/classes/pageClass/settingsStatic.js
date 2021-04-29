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
        //console.log( 'SettingsStatic.retrieveFixOperations success: ' + success );

        if ( success && fixOperationList )
        {
            var isoDateStr = ( new Date() ).toISOString();                
            AppInfoManager.updateFixOperationLast( isoDateStr );


            if ( fixOperationList.length > 0 )
            {                
                // Eval each one?..
                fixOperationList.forEach( fixOpt => 
                {
                    // If this fails, we should simply skip to the 'done' list?
                    // -- Then, we should group the log 'records' - by userName?
                    fixOpt.resultMsg = Util.evalTryCatch( fixOpt.operation, INFO, "Fix Operation " + fixOpt.operationName, function( errMsgFull ) {
                        console.customLog( errMsgFull );                        
                    });

                    if ( fixOpt.resultMsg ) 
                    {
                        fixOpt.errCase = ( fixOpt.resultMsg.indexOf( Util.evalTryCatch_ERR ) === 0 );
                        SettingsStatic.showMsg( fixOpt.resultMsg, fixOpt.errCase );
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

SettingsStatic.showMsg = function( returnMsg, errCase )
{
    try
    {
        if ( returnMsg && !errCase )
        {
            var cutListIndex = returnMsg.indexOf( SettingsStatic.CUT_LIST_MSG );

            var cutMsg = ( cutListIndex > 0 ) ? returnMsg.substring( 0, cutListIndex ) : returnMsg;

            MsgManager.msgAreaShow( cutMsg );
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
        AppInfoManager.addToFixOperationHistory( { 'dateTime': isoDateStr, 'operationName': fixOpt.operationName, 'optId': fixOpt._id, 'result': fixOpt.resultMsg } );
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
                var recordJson = { 'dateTime': isoDateStr, 'userName': userName };
                if ( fixOpt.resultMsg ) recordJson.result = fixOpt.resultMsg;

                var updateCmd = { 
                    'find': { '_id': fixOpt._id }
                    , 'updateData': { 
                        '$push': { } 
                        //,'$addToSet': { 'doneUsers': userName }
                    }
                };
            
                // Set the right 'records' target (has resultMsg or not)
                var recordTarget = ( fixOpt.resultMsg ) ? 'records' : 'recordsEmpty';
                updateCmd.updateData.$push[ recordTarget ] = recordJson;

                // If the fix run was successful, add the user to 'doneUsers' list. 
                if ( !fixOpt.errCase ) updateCmd.updateData.$addToSet = { 'doneUsers': userName };


                payloadJson.updatelist.push( updateCmd );
            }
        });

        WsCallManager.requestDWS_SAVE( WsCallManager.EndPoint_PWAFixOp_RunUpdates, payloadJson, undefined, returnFunc );
    }
    else returnFunc();
};

