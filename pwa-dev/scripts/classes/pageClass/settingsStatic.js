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
                    // Main eval run..  'INFO' is not used for now..
                    SettingsStatic.fixOptEvalRun( fixOpt, INFO );

                    if ( fixOpt.resultMsg ) SettingsStatic.showMsg( fixOpt.resultMsg, fixOpt.errCase );
                });
                    
                // Add the name of each fixOperations...
                SettingsStatic.updateOnDebugHistory( fixOperationList, isoDateStr );
    
                // Update the user done with this operation..
                SettingsStatic.requestUpdate_FixOperations( fixOperationList, userName, isoDateStr, function() {
                    console.log( 'requestUpdate_FixOperations performed' );
                });
            }

            if ( returnFunc ) returnFunc();
        }
    });
};


SettingsStatic.fixOptEvalRun = function( fixOpt, INFO )
{
	var returnVal;

	try
	{
		if ( fixOpt.operation )
		{
			returnVal = eval( fixOpt.operation );
		}
	}
	catch( errMsg )
	{
		fixOpt.errCase = true;

		var errMsgMain = Util.ERR_FIX_OP + ' ' + fixOpt.operationName + ', ErrMsg: ' + errMsg;
        if ( fixOpt.operation ) errMsgMain += ', EvalVal: ' + fixOpt.operation.substr( 0, 40 );

        console.log( errMsgMain );
		returnVal = errMsgMain;
	}

	fixOpt.resultMsg = returnVal;
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
        console.log( returnMsg );
        console.log( 'ERROR in SettingsStatic.showMsg, errMsg: ' + errMsg );
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

    WsCallManager.requestDWS_RETRIEVE( WsCallManager.EndPoint_PWAFixOp_GET, payloadJson, undefined, returnFunc );
};


SettingsStatic.updateOnDebugHistory = function( fixOperationList, isoDateStr )
{
    fixOperationList.forEach( fixOpt => {
        AppInfoManager.addToFixOperationHistory( { 'dateTime': isoDateStr, 'fixOpt': fixOpt } );
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

                var updateCmd = 
                { 
                    'find': { 
                        '_id': fixOpt._id 
                    }
                    ,'updateData': { 
                        '$push': { }
                    }
                };
                //,'$addToSet': { 'doneUsers': userName }


                // Set the right 'records' target (has resultMsg or not)
                var recordTarget = 'recordsEmpty';
                if ( fixOpt.errCase ) recordTarget = 'recordsErr';
                else if ( fixOpt.resultMsg ) recordTarget = 'records';

                updateCmd.updateData.$push[ recordTarget ] = recordJson;


                // If the fix run was successful, add the user to 'doneUsers' list. Also, if 'doneUsers_Disable is setTo true, do not add it.
                if ( !fixOpt.errCase && !fixOpt.doneUsers_Disable ) updateCmd.updateData.$addToSet = { 'doneUsers': userName };


                payloadJson.updatelist.push( updateCmd );
            }
        });

        WsCallManager.requestDWS_SAVE( WsCallManager.EndPoint_PWAFixOp_RunUpdates, payloadJson, undefined, returnFunc );
    }
    else returnFunc();
};

