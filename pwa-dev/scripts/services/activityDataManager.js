// =========================================
// -------------------------------------------------
//     ActivityDataManager
//          - keeps activity list data & related methods.
//
//      - FEATURES:
//          1. Get Activity/ActivityList - by Id, etc..
//          2. Remove Activity/ActivityList/ActivityByClientId, etc..
//          3. Insert/Update Activity
//          4. ActivityList Regen, update, add (with index data)
//          5. Merge downloaded activities related
//          6. Activity Payload Related Methods
//          7. Create Activity Processing Info Related Methods
//          8. getCombinedTrans - get single json that combines all data in transactions
//
//      NEW:
//          - Create any static method to update the 'activityCard' (in case it exists) ?
// -------------------------------------------------

function ActivityDataManager()  {};

ActivityDataManager._activityList = []; // Activity reference list - original data are  in each client activities.
ActivityDataManager._activityToClient = {};  // Fast reference - activity to client
//ActivityDataManager._activitiesIdx = {};  // index..  <-- need to put add / delete

// NOTE: BELOW IS USED?
ActivityDataManager.jsonSignature_Dhis2 = { "client": {} };
ActivityDataManager.jsonSignature_Mongo = { "transactions": [] };

// - ActivityCoolTime Variables
ActivityDataManager.activitiesLastSyncedInfo = {};  // "activityId": 'lastSyncDateTime' }, ...
ActivityDataManager.syncUpCoolDownTimeOuts = {};
ActivityDataManager.syncUpCoolDownList = {};

// ===================================================
// === MAIN FEATURES =============

// - Only call this on logOut
ActivityDataManager.clearActivityDataInMem = function()
{
    ActivityDataManager._activityList = [];
    ActivityDataManager._activityToClient = {};
};

// ---------------------------------------
// --- Get Activity / ActivityList

ActivityDataManager.getActivityList = function()
{
    return ActivityDataManager._activityList;
};

// Get single activity Item (by property value search) from the list - Called from 'activityItem.js'
ActivityDataManager.getActivityItem = function( propName, propVal )
{
    return Util.getFromList( ActivityDataManager.getActivityList(), propVal, propName );    
};

// Use index...  for faster..
ActivityDataManager.getActivityById = function( activityId )
{
    return Util.getFromList( ActivityDataManager._activityList, activityId, 'id' );
};

// ------------------------------------------------
// ---- Get Activity Id copied list - Used to delete or loop data without being affected by change data.
ActivityDataManager.getActivityIdCopyList = function()
{
    var activityIdList = [];

    var activityList = ActivityDataManager.getActivityList();

    activityList.forEach( activity => {
        if ( activity.id ) activityIdList.push( activity.id );
    });

    return activityIdList;
};

// ---------------------------------------
// --- Remove Activity

ActivityDataManager.removeActivities = function( activities )
{
    for ( var i = 0; i < activities.length; i++ )
    {
        var activity = activities[ i ];

        ActivityDataManager.removeActivityById( activity.id );
    }
}

// After 'syncUp', remove the payload <-- after syncDown?
ActivityDataManager.removeActivityById = function( activityId )
{
    try
    {
        if ( activityId )
        {
            // 1. remove from activityList
            Util.RemoveFromArray( ActivityDataManager._activityList, "id", activityId );

            // 2. remove from activityClientMap, 3. remove from client activities
            if ( ActivityDataManager._activityToClient[ activityId ] )
            {
                var client = ActivityDataManager._activityToClient[ activityId ];

                delete ActivityDataManager._activityToClient[ activityId ];

                Util.RemoveFromArray( client.activities, "id", activityId );
            }   
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error on ActivityDataManager.removePayloadActivityById, errMsg: ' + errMsg );
    }
};


ActivityDataManager.removeActivity_NTempClient = function( activityId, bRemoveActivityTempClient )
{
    // NOTE: 2 Cases:
    //  Case 1 - activity in existing client. remove activity.
    //  Case 2 - activity in temp client - remove activity & client.
    
    try
    {      
        // Get client Obj from reference before deleting activity    
        var client = ClientDataManager.getClientByActivityId( activityId );

        // Remove the activity (ref, activity in list, activity in client)
        ActivityDataManager.removeActivityById( activityId );

        // Temporary Client case <-- delete client & activity in it.
        if ( bRemoveActivityTempClient && client && client._id && client._id.indexOf( ClientDataManager.tempClientNamePre ) === 0 )
        {
            ClientDataManager.removeClient( client );
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error on ActivityDataManager.removeActivity_NTempClient, errMsg: ' + errMsg );
    }
};

// ---------------------------------------
// --- Insert Activity

ActivityDataManager.insertActivitiesToClient = function( activities, client, option )
{
    for ( var i = 0; i < activities.length; i++ )
    {
        var activity = activities[ i ];

        client.activities.push( activity );

        if ( activity.id ) 
        {
            ActivityDataManager.removeExistingActivity_NTempClient( activity.id, ( option && option.bRemoveActivityTempClient ) );
            ActivityDataManager.updateActivityIdx( activity.id, activity, client, option );
        }
        //else throw "ERROR, Downloaded activity does not contain 'id'.";
    }
};

// ============================================
// === ActivityList Regen, update, add (with index data)


// Create 'activityList' and 'activityToClient' map.
ActivityDataManager.regenActivityList_NIndexes = function()
{
    var clientList = ClientDataManager.getClientList();

    // Reset the activityList and mapping to client
    ActivityDataManager._activityList = [];
    ActivityDataManager._activityToClient = {};

    for ( var i = 0; i < clientList.length; i++ )
    {        
        var client = clientList[i];

        ActivityDataManager.updateActivityListIdx( client );
    }
};


ActivityDataManager.updateActivityListIdx = function( client, bRemoveActivityTempClient )
{
    if ( client.activities ) 
    {
        for ( var x = 0; x < client.activities.length; x++ )
        {
            var activity = client.activities[ x ];

            if ( activity.id ) 
            {
                ActivityDataManager.removeExistingActivity_NTempClient( activity.id, bRemoveActivityTempClient );
                ActivityDataManager.updateActivityIdx( activity.id, activity, client );
            }
        }
    }
};


ActivityDataManager.removeExistingActivity_NTempClient = function( activityId, bRemoveActivityTempClient )
{
    // If Existing activity Index exists, use it to check if it is tied to other client (temporary client case).  Delete the client?
    var existingActivity = Util.getFromList( ActivityDataManager._activityList, activityId, "id" );    
    if ( existingActivity ) ActivityDataManager.removeActivity_NTempClient( activityId, bRemoveActivityTempClient );
};


ActivityDataManager.updateActivityIdx = function( activityId, activity, client, option )
{
    // NOTE: Not deleting same 'activityId' activityJson from '_activityList'
    if ( option && option.addToTop ) 
    {
        ActivityDataManager._activityList.unshift( activity );
    }
    else 
    {
        ActivityDataManager._activityList.push( activity );
    }

    ActivityDataManager._activityToClient[ activityId ] = client;
};


// ====================================================
// === Processing Activity timeOut to 'Failed' related

ActivityDataManager.updateActivitiesStatus_ProcessingToFailed = function( activityList ) 
{
    if ( activityList )
    {
        activityList.forEach( activity => {
            ActivityDataManager.updateStatus_ProcessingToFailed( activity );
        });
    }
};


ActivityDataManager.updateStatus_ProcessingToFailed = function( activity ) 
{
    if ( activity && activity.processing && activity.processing.status === Constants.status_processing )
    {
        var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_failed, 408, 'Processing activity timed out case changed to failed status.' );
        ActivityDataManager.insertToProcessing( activity, processingInfo );

        // To prevent too fast updates, make the storage update outside..
        // ClientDataManager.saveCurrent_ClientsStore();    
    }
};


// ====================================================
// === Merge downloaded activities related

// Used by both 'SyncUp' or 'Download Merge'.
// 'SyncUp' - Use Temporary Client which gets deleted.
// 'Download Merge' - Normally, both app client and downloaded client exists.  Only get the activities not already exists..
ActivityDataManager.mergeDownloadedActivities = function( downActivities, appClientActivities, appClient, processingInfo, downloadedData )
{
    var newActivities = [];

    downActivities.forEach( dwActivity => 
    {
        try
        {
            // 'syncDown' - NEW ACTIVITY - only add new ones with passed 'processingInfo' ('download')
            // 'syncUp' - NEW ACTIVITY - same as above ('synced')
            // 'syncUp' - EXISTING ACTIVITY - override the status + history..

            // 'appClientActivities' is the matching client (by downloaded client id)'s activities
            // If the matching app client does not already hold the same activity (by id), proceed with ADD!!
            var appClientActivity = Util.getFromList( appClientActivities, dwActivity.id, "id" );

            // New Activity Case
            if ( !appClientActivity )
            {
                ActivityDataManager.insertToProcessing( dwActivity, processingInfo );

                newActivities.push( dwActivity );                
            }
            else
            {
                // Existing Activity Case - On syncUp activity Id matching case, override it.
                if ( downloadedData.syncUpActivityId && dwActivity.id === downloadedData.syncUpActivityId )
                {
                    // This 'processingInfo' is already has 'history' of previous activity..
                    ActivityDataManager.insertToProcessing( dwActivity, processingInfo );
                    newActivities.push( dwActivity );
                }
                else if ( dwActivity.date && dwActivity.date.updateFromMongo 
                        && ( !appClientActivity.date.updateFromMongo 
                            || ( appClientActivity.date.updateFromMongo 
                                && dwActivity.date.updateFromMongo > appClientActivity.date.updateFromMongo ) 
                        ) 
                    ) 
                {
                    // NOTE:
                    // If 'dwActivity.date.updateFromMongo' exists and later then appClientActivity one (if exists)
                    // Adding to 'newActivities' would update/replace the activity in 'appClient'

                    // NEED TO TEST THIS
                    ActivityDataManager.insertToProcessing( dwActivity, processingInfo );
                    newActivities.push( dwActivity );
                }
            }
        }
        catch( errMsg )
        {
            console.customLog( 'Error during ActivityDataManager.mergeDownloadedActivities, errMsg: ' + errMsg );
        }
    });


    // if new list to push to appClientActivities exists, add to the list.
    if ( newActivities.length > 0 ) 
    {
        ActivityDataManager.insertActivitiesToClient( newActivities, appClient, { 'bRemoveActivityTempClient': true } );
    }

    // Return the number of added ones.
    return newActivities;
};

// --------------------------------------
// -- Activity Payload Related Methods

ActivityDataManager.generateActivityPayloadJson = function( actionUrl, blockId, formsJsonActivityPayload, actionDefJson, blockPassingData )
{
    var activityJson = {};

    if ( !formsJsonActivityPayload.payload ) throw 'activityPayloadsJson.payload not exists';
    else
    {
        var createdDT = new Date();
        var payload = formsJsonActivityPayload.payload;


        // CONVERT 'searchValues'/'captureValues' structure ==> 'captureValues.processing': { 'searchValues' }
        activityJson = payload.captureValues; // Util.cloneJson( payload.captureValues );
        // FAILED TO GENERATE - ERROR MESSAGE..
        if ( !activityJson ) throw 'payload captureValues not exists!';
        

        // ===============================================================
        // TRAN NEW 1: If this is an existing activity, then remove the exiting one and add a new one
        var editModeActivityId = ActivityDataManager.getEditModeActivityId( blockId );
        if ( editModeActivityId )
        {
            ActivityDataManager.removeActivityById( editModeActivityId );
            activityJson.id = editModeActivityId;
        }


        // If activityId were not generated by the payload generation methods, create one.
        if ( !activityJson.id ) {
            activityJson.id = SessionManager.sessionData.login_UserName + '_' + $.format.date( createdDT.toUTCString(), 'yyyyMMdd_HHmmss' ) + createdDT.getMilliseconds();
        }

        activityJson.processing = { 
            'created': Util.formatDateTimeStr( createdDT.toString() )
            ,'status': Constants.status_queued
            ,'history': []
            ,'url': actionUrl
            ,'searchValues': payload.searchValues
            //"payloadType": payloadType
            // 'actionJson': actionDefJson <-- Do not need this, probably
        };

        if ( actionDefJson ) activityJson.processing.useMockResponse = actionDefJson.useMockResponse;


        // ===============================================================
        // TRAN NEW 2: SHOULD ADD TO processing!!!
        // Form Information
        if ( blockId )
        {
            activityJson.processing.form = { 
                'blockId': blockId
                ,'activityId': activityJson.id
                ,'showCase': ( blockPassingData ) ? blockPassingData.showCase : ''
                ,'hideCase': ( blockPassingData ) ? blockPassingData.hideCase : ''
                ,'data': ActivityUtil.generateFormsJsonArr( $("[blockId='" + blockId + "']" ) ) 
            };    
        }
    }

    return activityJson;
};


ActivityDataManager.getEditModeActivityId = function( blockId )
{
    return ( blockId ) ? $("[blockId='" + blockId + "']").find( "#editModeActivityId" ).val() : undefined;
};


// Add new activity with client generation
ActivityDataManager.createNewPayloadActivity = function( actionUrl, blockId, formsJsonActivityPayload, actionDefJson, blockPassingData, callBack )
{
    try
    {
        var activityJson = ActivityDataManager.generateActivityPayloadJson( actionUrl, blockId, formsJsonActivityPayload, actionDefJson, blockPassingData );

        // NEW, TEMP
        var activityPayloadClient;
        if ( actionDefJson.underClient && actionDefJson.clientId )
        {
            activityPayloadClient = ClientDataManager.getClientById( actionDefJson.clientId );
        }

        
        if ( !activityPayloadClient ) activityPayloadClient = ClientDataManager.createActivityPayloadClient( activityJson );

        ActivityDataManager.insertActivitiesToClient( [ activityJson ], activityPayloadClient, { 'addToTop': true } );
    
        ClientDataManager.saveCurrent_ClientsStore( () => {
            if ( callBack ) callBack( activityJson );    
        });    
    }
    catch( errMsg )
    {    
        MsgManager.notificationMessage ( 'Failed to generate activity! ' + errMsg, 'notifDark', undefined, '', 'right', 'top' );

        if ( callBack ) callBack();    
    }
};

ActivityDataManager.activityPayload_ConvertForWsSubmit = function( activityJson, _version )
{
    
    if( !_version ) _version = _ver;
    // TRAN TODO : "_ver" is defined in index.html. It is hard to use the variables in index.html for unit test. 
    // We should put this one some place else is better to manager
    var payloadJson = {
        "appVersion": _version,  //ActivityDataManager.wsSubmit_AppVersionStr,
        "payload": undefined,
        "historyData": ActivityDataManager.getHistoryData( activityJson.processing.history )
    };
    
    if ( activityJson.processing.fixActivityCase ) 
    {
        //payloadJson.skipLogDataCheck = true;
        payloadJson.fixActivityCase = true;
        // This uses existing log payload...
        payloadJson.payload = {
            'searchValues': {},
            'captureValues': { "id": activityJson.id }
        };
    }
    else
    {
        // 'activity' are not in 'search/capture' structure.  Change it to that structure.
        var activityJson_Copy = Util.cloneJson( activityJson );
        delete activityJson_Copy.processing;
        
        payloadJson.payload = {
            'searchValues': activityJson.processing.searchValues,
            'captureValues': activityJson_Copy,
            'userFormData': activityJson.processing.form  // New - send 'form' as well.
        };
    }

    // Future Special Cases Flags..

    return payloadJson;
};

ActivityDataManager.getHistoryData = function( history )
{
    var historyData = { 'failedCount': 0, 'failed1stDate': '' };

    if ( history )
    {
        try
        {
            var foundList = Util.getItemsFromList( history, Constants.status_failed, "status" );
            historyData.failedCount = foundList.length;
    
            if ( foundList.length > 0 ) 
            {
                var item1st = foundList[0];    
                if ( item1st.datetime ) historyData.failed1stDate = Util.getUTCDateTimeStr( new Date( item1st.datetime ), 'noZ' );
            }    
        }
        catch ( errMsg )
        {
            console.customLog( 'ERROR on ActivityDataManager.getHistoryData, errMsg: ' + errMsg );
        }
    }

    return historyData;
};


// ----------------------------------------------
// --- Create Activity Processing Info Related

ActivityDataManager.createProcessingInfo_Success = function( statusStr, msgStr, prev_ProcessingInfo )
{
    var dateStr = Util.formatDateTimeStr( ( new Date() ).toString() );    
    var currInfo = { 'status': statusStr, 'responseCode': 200, 'datetime': dateStr, 'msg': msgStr };
    var processingInfo;

    if ( prev_ProcessingInfo )
    {
        processingInfo = Util.cloneJson( prev_ProcessingInfo );
        // delete processingInfo.form;  // Changed to keep the 'form'
    }
    else
    {
        processingInfo = { 'created': dateStr, 'history': [] };
    }

    processingInfo.status = statusStr;
    processingInfo.history.push( currInfo );

    return processingInfo;
};


ActivityDataManager.createProcessingInfo_Other = function( statusStr, responseCode, msgStr )
{
    var dateStr = Util.formatDateTimeStr( ( new Date() ).toString() );    
    var processingInfo = {
        'status': statusStr,
        'history': [ { 'status': statusStr, 'responseCode': responseCode, 'datetime': dateStr, 'msg': msgStr } ]
    };    

    return processingInfo;
};


ActivityDataManager.insertToProcessing = function( activity, newProcessingInfo )
{
    if ( activity && newProcessingInfo )
    {
        if ( activity.processing ) 
        {
            // Update the 'processing' data with 'status' & 'history'
            activity.processing.status = newProcessingInfo.status;
            Util.appendArray( activity.processing.history, Util.cloneJson( newProcessingInfo.history ) );
        }
        else
        {
            // Create New 'processing' data.
            activity.processing = Util.cloneJson( newProcessingInfo );

            // update the 'created' as mongoDB one if exists..            
            if ( activity.date ) ActivityDataManager.updateProcessing_CreatedDate( activity );
        }

        if ( activity.processing.status === Constants.status_error ) AppInfoManager.addNewErrorActivityId( activity.id );
    }
};


ActivityDataManager.updateProcessing_CreatedDate = function( activity )
{
    // Based on 'activity.date' UTC date, create 'processing.created'
    try
    {
        var activityUtcDate = '';

        if ( activity.date.createdOnDeviceUTC ) activityUtcDate = activity.date.createdOnDeviceUTC;
        else if ( activity.date.createdOnMdbUTC ) activityUtcDate = activity.date.createdOnMdbUTC;

        if ( activityUtcDate )
        {                    
            var localDateTime = Util.dateUTCToLocal( activityUtcDate );
            if ( !localDateTime ) localDateTime = new Date();

            var updateCreated = Util.formatDateTime( localDateTime );
            if ( updateCreated ) activity.processing.created = updateCreated;
        }
    }
    catch( errMsg )
    {
        console.customLog( 'ERROR in ActivityDataManager.updateProcessing_Created, errMsg: ' + errMsg );
    }
};

// --------------------------------------------
// --- Other Methods

ActivityDataManager.getCombinedTrans = function( activityJson )
{
    var jsonCombined = {};

    try
    {
        var transList = activityJson.transactions;

        if ( transList )
        {
            for( var i = 0; i < transList.length; i++ )
            {
                var tranData_dv = transList[i].dataValues;
                var tranData_cd = transList[i].clientDetails;
    
                if ( tranData_dv )
                {
                    for ( var prop in tranData_dv ) 
                    {
                        jsonCombined[ prop ] = tranData_dv[ prop ];
                    }
                }
    
                if ( tranData_cd )
                {
                    for ( var prop in tranData_cd ) 
                    {
                        jsonCombined[ prop ] = tranData_cd[ prop ];
                    }
                }
            }
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error during ActivityDataManager.getCombinedTrans, errMsg: ' + errMsg );
    }

    return jsonCombined;
};


ActivityDataManager.getData_FromTrans = function( activityJson, propName )
{
    var dataJson = {};

    try
    {
        var transList = ActivityDataManager.getTransAsList( activityJson.transactions );

        // transList could be object type or array list..
        if ( Util.isTypeArray( transList ) )
        {
            transList.forEach( tran => 
            {
                var tranData_cd = tran[ propName ];
                if ( tranData_cd )
                {
                    for ( var prop in tranData_cd ) 
                    {
                        dataJson[ prop ] = tranData_cd[ prop ];
                    }
                }
            });    
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error during ActivityDataManager.getData_FromTrans, errMsg: ' + errMsg );
    }

    return dataJson;
};

ActivityDataManager.setActivityDateLocal = function( activityJson )
{
    try
    {
        if ( activityJson.date && activityJson.date.capturedUTC )
        {
            if ( ConfigManager.isSourceTypeDhis2()
                    && ( ConfigManager.getConfigJson().sourceAsLocalTime 
                    || ConfigManager.getConfigJson().dhis2UseLocalTime )
                )
            {
                var localDateTime = activityJson.date.capturedUTC;
                if ( localDateTime ) 
                {
                    activityJson.date.capturedLoc = Util.formatDateTime( localDateTime );    
                    activityJson.date.capturedUTC = Util.getUTCDateTimeStr( new Date( localDateTime ), 'noZ' );
                }
            } 
            else
            {
                var localDateTime = Util.dateUTCToLocal( activityJson.date.capturedUTC );
                if ( localDateTime ) activityJson.date.capturedLoc = Util.formatDateTime( localDateTime );    
            }
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error in ActivityDataManager.setActivityDateLocal, errMsg: ' + errMsg );
    }
};

// --------------------------------------------
// --- Duplicate Voucher Code Check

// for each activities that is voucher..
// trans.forEach( trans ) {
// [ 'v_iss', 'v_rdx', 'v_exp' ].indexOf( trans )
// check against  existing activities?  or simply check against clientDetails?  'voucherCode' or 'voucherCodes' check?

// NOTE: ALSO, CREATE CLIENT.CLIENTDETAILS SEARCH FOR VOUCHER..  


// ActivityDataManager.getActivitiesByVoucherCode( voucherCode, opt_TransType, opt_bGetOnlyOnce );
// var matchActivities = ActivityDataManager.getActivitiesByVoucherCode( voucherCode, 'v_iss', true );
// if ( matchActivities.length > 0 )

ActivityDataManager.getActivitiesByVoucherCode = function( voucherCode, opt_TransType, opt_bGetOnlyOnce )
{
    var matchActivities = [];

    if ( voucherCode )
    {
        var activityList = ActivityDataManager.getActivityList();
    
        for( var i = 0; i < activityList.length; i++ )
        {
            var matchingTrans;
            var activityJson = activityList[i];
            var transList = ActivityDataManager.getTransAsList( activityJson.transactions );
    
            for( var p = 0; p < transList.length; p++ )
            {
                var trans = transList[p];                
                var matchingTrans = ActivityDataManager.checkTransByVoucherCode( trans, voucherCode, opt_TransType );
                if ( matchingTrans ) break;
            }   
    
            if ( matchingTrans )
            {
                matchActivities.push( activityJson )            
                if ( opt_bGetOnlyOnce ) break;
            }
        }    
    }

    return matchActivities;
};

ActivityDataManager.checkTransByVoucherCode = function( trans, voucherCode, opt_TransType )
{
    var matchingTrans;

    if ( trans.clientDetails && trans.clientDetails.voucherCode === voucherCode )
    {
        if ( opt_TransType )
        {
            // Match found - with transType
            if ( trans.type === opt_TransType ) matchingTrans = trans;
        }
        // Match found - without transType
        else matchingTrans = trans;
    }   

    return matchingTrans;
};


ActivityDataManager.getTransByTypes = function( activityJson, typesArr )
{
    var transListFound = [];

    if ( activityJson && activityJson.transactions && typesArr )
    {
        var transList = ActivityDataManager.getTransAsList( activityJson.transactions );

        transList.forEach( trans => {
            if ( typesArr.indexOf( trans.type ) >= 0 ) transListFound.push( trans );
        });
    }
    
    return transListFound;
};

// Get Transactions (array or object) as array list
ActivityDataManager.getTransAsList = function( transactions )
{
    var transList = [];

    if ( transactions )
    {
        if ( Util.isTypeArray( transactions ) ) transList = transactions;
        else if ( Util.isTypeObject( transactions ) )
        {
            for ( var tranTypeKey in transactions ) 
            {
                var trans = transactions[ tranTypeKey ];
                trans.type = tranTypeKey;
                transList.push( trans );
            }
        }    
    }

    return transList;
};


// --------------------------------------------
// --- Sync & ActivityCard Related Metods


ActivityDataManager.activityUpdate_ByResponseCaseAction = function( activityId, actionJson )
{
    if ( actionJson )
    {
        // Both below methods does saving to clientStore..
        ActivityDataManager.activityUpdate_Status( activityId, actionJson.status );

        ActivityDataManager.activityUpdate_History( activityId, actionJson.status, actionJson.msg, 0 );
    }   
};


// NOTE: Update Status + 
ActivityDataManager.activityUpdate_Status = function( activityId, status, returnFunc )
{
    if ( status )
    {
        var activityJson = ActivityDataManager.getActivityById( activityId );

        if ( activityJson && activityJson.processing )
        {
            activityJson.processing.status = status;
            
            // Need to save storage afterwards..
            ClientDataManager.saveCurrent_ClientsStore( () => {
                // update ActivityCard is visible..
                ActivitySyncUtil.displayActivitySyncStatus( activityId );

                if ( returnFunc ) returnFunc();
            });
        }    
    }
};


// NOTE: This also saves status as well, but does not refresh the UI status part!!
ActivityDataManager.activityUpdate_History = function( activityId, status, msg, httpResponseCode )
{
    var activityJson = ActivityDataManager.getActivityById( activityId );

    if ( activityJson )
    {
        var processingInfo = ActivityDataManager.createProcessingInfo_Other( status, httpResponseCode, msg );
        ActivityDataManager.insertToProcessing( activityJson, processingInfo );	

        ClientDataManager.saveCurrent_ClientsStore();
    }
};

// =======================================================
// ===== ActivityCoolDownTime Related Methods

ActivityDataManager.setActivityLastSyncedUp = function( activityId )
{
    ActivityDataManager.activitiesLastSyncedInfo[ activityId ] = UtilDate.getDateTimeStr();
};

ActivityDataManager.getActivityLastSyncedUp = function( activityId )
{
    return ActivityDataManager.activitiesLastSyncedInfo[ activityId ];
};

ActivityDataManager.clearActivityLastSyncedUp = function( activityId )
{
    if ( ActivityDataManager.activitiesLastSyncedInfo[ activityId ] ) delete ActivityDataManager.activitiesLastSyncedInfo[ activityId ];
};

// ----------------------------------------------

// OBSOLETE - REMOVE THIS..

ActivityDataManager.setSyncUpCoolDown_TimeOutId = function( activityId, timeOutId )
{
    ActivityDataManager.syncUpCoolDownTimeOuts[ activityId ] = timeOutId;
};

ActivityDataManager.clearSyncUpCoolDown_TimeOutId = function( activityId )
{
    var timeOutId = ActivityDataManager.syncUpCoolDownTimeOuts[ activityId ];
    if ( timeOutId ) clearTimeout( timeOutId );
};

// ----------------------------------------------

ActivityDataManager.checkActivityCoolDown = function( activityId, optCallBack_coolDown, optCallBack_noCoolDown )
{
	var coolDownPassed = true;  // 'false' means it is still during/within coolDown time.
    var timeRemain;

	try
	{
        var lastSynced = ActivityDataManager.getActivityLastSyncedUp( activityId );

		if ( lastSynced )
		{
			var coolDownMs = ConfigManager.coolDownTime;    
			var timePassedMs = UtilDate.getTimePassedMs( lastSynced );

			if ( timePassedMs > 0 && coolDownMs && timePassedMs <= coolDownMs )
			{
                timeRemain = coolDownMs - timePassedMs;
                coolDownPassed = false;
			}
		}
	}
	catch( errMsg )
	{
		console.customLog( 'ERROR in ActivityDataManager.checkActivityCoolDown, errMsg: ' + errMsg );
	}


    // Check coolDown still going on status, and perform some callBacks..
    if ( !coolDownPassed )
    {
        // If cool down time has not passed, perform coolDown callBack.
        if ( timeRemain && optCallBack_coolDown ) optCallBack_coolDown( timeRemain );
    }
    else
    {
        // If coolDown has passed, perform below noCoolDown callback if passed...
        if ( optCallBack_noCoolDown ) 
        {
            ActivityDataManager.clearSyncUpCoolDown_TimeOutId( activityId );            
            optCallBack_noCoolDown();
        }
    }

	return coolDownPassed;
};

// ------------------------------------
//   ResponseCaseAction Related 

ActivityDataManager.processResponseCaseAction = function( reportJson, activityId )
{
    // Check for matching oens..
    var caseActionJson = ConfigManager.getResponseCaseActionJson( reportJson );

    if ( caseActionJson )
    {
        // 1. Activity status + msg update if available..
        ActivityDataManager.activityUpdate_ByResponseCaseAction( activityId, caseActionJson );

        // 2. Schedule the sync - new type of schedule..
        ScheduleManager.syncUpResponseActionListInsert( caseActionJson.syncAction, activityId );
    }
};

// ------------------------------------
//   ResponseCaseAction Related 

ActivityDataManager.getVoucherActivitiesData = function( activities, voucherCode )
{
    var voucherData = { voucherCode: voucherCode, issuedUser: '', createdDateStr: '', v_issDateStr: '', activities: [], transList: [] };  // voucher Activties

    if ( voucherCode && activities && Util.isTypeArray( activities ) )
    {
        // use 'capturedLoc'? (or 'capturedUTC'?) as main date to compare 
        activities.forEach( activity => 
        {
            if ( activity.transactions && Util.isTypeArray( activity.transactions ) )
            {
                activity.transactions.forEach( trans => 
                {
                    try
                    {
                        if ( ( trans.clientDetails && trans.clientDetails.voucherCode === voucherCode )
                            || ( trans.dataValues && trans.dataValues.voucherCode === voucherCode ) )
                        {
                            if ( trans.type === 'v_iss' ) {
                                voucherData.issuedUser = activity.activeUser;
                                if ( activity.date ) {
                                    voucherData.createdDateStr = activity.date.capturedLoc;
                                    voucherData.v_issDateStr = activity.date.capturedLoc;
                                }
                            }

                            voucherData.activities.push( activity );
                        }    
                    }
                    catch ( errMsg ) { console.log( 'ERROR in ActivityDataManager.getVoucherActivitiesData.trans, voucherCode: ' + voucherCode + ', ' + errMsg ); }
                });
            }
        });

        // Sort by 'captureUTC' date
        if ( voucherData.activities.length > 1 )
        {
            try
            {
                voucherData.activities.sort( function(a, b) { 
                        return ( a.date.capturedLoc >= b.date.capturedLoc ) ? 1: -1; 
                    } 
                );
            }
            catch ( errMsg ) { console.log( 'ERROR in ActivityDataManager.getVoucherActivitiesData.sort, voucherCode: ' + voucherCode + ', ' + errMsg ); }
        }

        // Get transactions of the activity and put it ..
        voucherData.activities.forEach( activity => {
            activity.transactions.forEach( trans => voucherData.transList.push( trans ) );
        });
    }

    return voucherData;
};


ActivityDataManager.getTransDataValue = function( transList, transDVProp )
{
    var value;

    transList.forEach( trans => 
    {
        var dvJson = trans.dataValues;

        if ( dvJson && dvJson[transDVProp] ) value = dvJson[transDVProp];
    });    

    return value;
};

ActivityDataManager.getTransClientDetails = function( transList, transCDProp )
{
    var value;

    transList.forEach( trans => 
    {
        var cdJson = trans.clientDetails;

        if ( cdJson && cdJson[transCDProp] ) value = cdJson[transCDProp];
    });    

    return value;
};

// Name changed.  Keep below for backward compatibility
ActivityDataManager.getLastTransDataValue = function( transList, transDVProp )
{
    ActivityDataManager.getTransDataValue( transList, transDVProp );
};

ActivityDataManager.getAllTrans = function( activityList )
{
    // activityList.flatMap( a => a.transactions ); // flat(), flatMap() has later browser compatibility..

    var allTrans = [];

    activityList.forEach( act => 
    {
        act.transactions.forEach( tran => {
            allTrans.push( tran );
        });
    });    

    return allTrans;    
};

// typeList = [ 'v_rdx_hivTEST', 'v_rdx_selfTESTResult' ]  <-- later, create same search by dataValues?
ActivityDataManager.getActivityByTransType = function( activityList, typeList )
{
    var activity;

    if ( Util.isTypeString( typeList ) ) typeList = [ typeList ];
    else if ( !Util.isTypeArray( typeList ) ) throw "ERROR, ActivityDataManager.getActivityByTransType typeList param should be array or string.";

    if ( activityList )
    {
        activityList.forEach( act => 
        {
            act.transactions.forEach( tran => {
                if ( typeList.indexOf( tran.type ) >= 0 ) activity = act;
            });
        });  
    }

    return activity;
};

// matchCondiArr = [ { 'type': '', 'dataValues': {}, 'clientDetails': {}, etc.. } <-- all optional..
ActivityDataManager.getActivityByTrans = function( activityList, matchCondiArr )
{
    var activity;

    if ( activityList )
    {
        activityList.forEach( act => 
        {
            // Look though each 'matchCondi'   If it matches any, set as 'activity'..
            act.transactions.forEach( tran => {
                if ( ActivityDataManager.isTransMatch( tran, matchCondiArr ) ) activity = act;
            });
        });  
    }

    return activity;
};

// [ { type: 'v_iss', clientDetails: { 'firstName': 'Polly' } }, { dataValues: { 'age': '23' } }  ]
// Either one of the condition would work.
ActivityDataManager.isTransMatch = function( tran, matchCondiArr )
{
    var isMatch = false;

    // 0. Look through all array of conditions.  If one of them pass, this 'tran' is a match.
    for ( var i = 0; i < matchCondiArr.length; i++ )
    {
        var matchCondi = matchCondiArr[i];
        var passAllCondition = true;

        // 1. Go through each property of the matching condition: { 'type': --, 'dataValues': --- }
        for ( var propName in matchCondi )
        {
            // type, dataValues, clientDetails
            var matchProp = matchCondi[ propName ];
            var tranProp = tran[ propName ];

            // If tran does not have the prop, return false;
            if ( !tranProp ) 
            {
                passAllCondition = false;
                break;                    
            }
            else
            {
                // If prop is string, like 'type', simply match for value.
                if ( Util.isTypeString( matchProp ) )
                {
                    if ( tranProp !== matchProp ) 
                    {
                        passAllCondition = false;
                        break;
                    }
                } 
                // If prop is object, check for all subProperty of the object
                else if ( Util.isTypeObject( matchProp ) )
                {    
                    // All prop within the object need be met. EX. 'dataValues.---'
                    for ( var spName in matchProp )
                    {
                        var sMatchVal = matchProp[ spName ];

                        if ( tranProp[ spName ] !== sMatchVal ) 
                        {
                            passAllCondition = false;
                            break;    
                        }
                    }
                }
            }
        }

        if ( passAllCondition )
        {
            isMatch = true;
            break;
        }
    }

    return isMatch;
};
