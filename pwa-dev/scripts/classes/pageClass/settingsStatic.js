//	TODO: ?: Rename to 'LSAppInfoManager'?
function SettingsStatic() {};

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
                INFO.activityList = ActivityDataManager.getActivityList();
                INFO.clientList = ClientDataManager.getClientList();
                
                // Eval each one?..
                fixOperationList.forEach( fixOpt => {
                    Util.evalTryCatch( fixOpt.operation, INFO, "fixOperation - " + fixOpt.operationName );
                });
                    
                // Add the name of each fixOperations...
                SettingsStatic.updateOnDebugHistory( fixOperationList, isoDateStr );
    
                // Update the user done with this operation..
                SettingsStatic.requestUpdate_FixOperations( fixOperationList, userName, function() {
                    console.log( 'requestUpdate_FixOperations performed' );
                } );
            }

            if ( returnFunc ) returnFunc();
        }
    } );
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

    WsCallManager.requestDWS_RETRIEVE( WsCallManager.EndPoint_PWAFixOperationsGET, payloadJson, undefined, returnFunc );
};


SettingsStatic.updateOnDebugHistory = function( fixOperationList, isoDateStr )
{
    fixOperationList.forEach( fixOpt => {
        AppInfoManager.addToFixOperationHistory( { 'dateTime': isoDateStr, 'operationName': fixOpt.operationName, 'optId': fixOpt._id } );
    });
};


SettingsStatic.requestUpdate_FixOperations = function( fixOperationList, userName, returnFunc )
{
    var fixOptIdList = [];

    fixOperationList.forEach( fixOpt => {
        fixOptIdList.push( fixOpt._id );                
    });

    if ( fixOptIdList.length > 0 )
    {
        // Create document with these fields - 'userName', 'dateTime'
        var payloadJson = { 'updateMany': { 
            'find': { '_ids': fixOptIdList }
            , 'updateData': { '$addToSet': { 'doneUsers': userName } } 
        } }; 

        WsCallManager.requestDWS_SAVE( WsCallManager.EndPoint_PWAFixOperationsUserUpdate, payloadJson, undefined, returnFunc );
    }
    else returnFunc();
};


// [OBSOLETE]
// =============================================
// === FIX ACTIVITIES RELATED 

SettingsStatic.checkFixActivities = function( userName, returnFunc )
{
    SettingsStatic.retrieveFixActivities( userName, function( resultList )
    {
        var fixActivityList = [];

        if ( resultList.length > 0 ) fixActivityList = SettingsStatic.filterFixActivities_alreadySet( resultList );            

        returnFunc( fixActivityList );
    });
};


SettingsStatic.retrieveFixActivities = function( userName, returnFunc )
{
    var payloadJson = { 'find': { 'userName': userName } };

    WsCallManager.requestDWS_RETRIEVE( WsCallManager.EndPoint_PWAFixActivitiesGET, payloadJson, undefined, returnFunc );
};


SettingsStatic.filterFixActivities_alreadySet = function( resultList )
{
    var fixActivityList = [];

    resultList.forEach( activity => 
    {
        var activityJson = ActivityDataManager.getActivityById( activity.activityId );

        if ( activityJson )
        {
            if ( activityJson.processing ) 
            {
                if ( activityJson.processing.fixActivityCase !== true )
                {
                    fixActivityList.push( activityJson );
                }
            }
        }
    });

    return fixActivityList;
};


SettingsStatic.performFixActivities = function( fixActivityList )
{
    fixActivityList.forEach( activityJson => 
    {
        try
        {
            var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_failed, 400, 'Redeem status not properly set case - changed from synced to failed status.' );					
            ActivityDataManager.insertToProcessing( activityJson, processingInfo );	
            activityJson.processing.fixActivityCase = true;
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR in performFixActivities, errMsg: ' + errMsg );
        }
    });

    // Save data if there has been any matching activity
    ClientDataManager.saveCurrent_ClientsStore();

    var fullListCount = fixActivityList.length;
    var performCount = 0;

    // Run sync on these items
    fixActivityList.forEach( activityJson => 
    {
        SyncManagerNew.syncUpActivity( activityJson.id, undefined, function() 
        {
            performCount++;
            MsgManager.msgAreaShow ( 'fixActivities performed: ' + performCount + '/' + fullListCount );
        } );
    });
};
