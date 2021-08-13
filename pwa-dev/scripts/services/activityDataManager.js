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

ActivityDataManager.jsonSignature_Dhis2 = {
    "client": {}
};

ActivityDataManager.jsonSignature_Mongo = {
    "transactions": []
};

// - ActivityCoolTime Variables
ActivityDataManager.activitiesLastSyncedInfo = {};  // "activityId": 'lastSyncDateTime' }, ...
ActivityDataManager.syncUpCoolDownTimeOuts = {};
ActivityDataManager.syncUpCoolDownList = {};

// ===================================================
// === MAIN FEATURES =============

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


ActivityDataManager.removeTempClient_Activity = function( activityId )
{
    // NOTE: Removing temp client (temp) & activity (before sync)
    // In synced up new activity indexing, if same activityId exists, we like to remove the client & all the indexing related to that clinet/activity
    // New activity and existing activity (before sync) has same activityId, but different. 
    // And before sync one should be deleted as well as the temporary client that holds the activity
    // MORE: All the new activities are created with temporary client, not existing client..

    try
    {
        // 1. Remove from activityList Index (We will add back, though)
        Util.RemoveFromArray( ActivityDataManager._activityList, "id", activityId );
        
        // 2. remove from activityClientMap (temporary client, likely), 3. remove from client activities
        if ( ActivityDataManager._activityToClient[ activityId ] )
        {
            var client = ActivityDataManager._activityToClient[ activityId ];

            delete ActivityDataManager._activityToClient[ activityId ];

            Util.RemoveFromArray( client.activities, "id", activityId );

            if ( client._id.indexOf( ClientDataManager.tempClientNamePre ) === 0 )
            {
                // Delete 'client' that was created for the activity payload..
                ClientDataManager.removeClient( client );
            }
        }    
    }
    catch ( errMsg )
    {
        console.customLog( 'Error on ActivityDataManager.removeTempClient_Activity, errMsg: ' + errMsg );
    }
};

// ---------------------------------------
// --- Insert Activity

ActivityDataManager.insertActivityToClient = function( activity, client, option )
{
    ActivityDataManager.insertActivitiesToClient( [ activity ], client, option );
};

ActivityDataManager.insertActivitiesToClient = function( activities, client, option )
{
    for ( var i = 0; i < activities.length; i++ )
    {
        var activity = activities[ i ];

        client.activities.push( activity );

        if ( activity.id ) 
        {
            ActivityDataManager.cleanUp_SyncUp_TempClient( activity.id );
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

        ActivityDataManager.addToActivityList_NIndexes( client );
    }
};


ActivityDataManager.addToActivityList_NIndexes = function( client )
{
    if ( client.activities ) 
    {
        for ( var x = 0; x < client.activities.length; x++ )
        {
            var activity = client.activities[ x ];

            if ( activity.id ) 
            {
                ActivityDataManager.cleanUp_SyncUp_TempClient( activity.id );
                ActivityDataManager.updateActivityIdx( activity.id, activity, client );
            }
        }
    }
};


ActivityDataManager.cleanUp_SyncUp_TempClient = function( activityId )
{
    // If Existing activity Index exists, use it to check if it is tied to other client (temporary client case).  Delete the client?
    var existingActivity = Util.getFromList( ActivityDataManager._activityList, activityId, "id" );    
    if ( existingActivity ) ActivityDataManager.removeTempClient_Activity( activityId );
};

//ActivityDataManager.updateActivityList_NIndexes_wtTempClientDelete = function( activity, client, option )
ActivityDataManager.updateActivityIdx = function( activityId, activity, client, option )
{
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
        ActivityDataManager.insertActivitiesToClient( newActivities, appClient );
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
        activityJson.processing.form = { 
            'blockId': blockId
            ,'activityId': activityJson.id
            ,'showCase': ( blockPassingData ) ? blockPassingData.showCase : ''
            ,'hideCase': ( blockPassingData ) ? blockPassingData.hideCase : ''
            ,'data': ActivityUtil.generateFormsJsonData_ByForm( $("[blockId='" + blockId + "']" ) ) 
        };
    }

    return activityJson;
};


ActivityDataManager.getEditModeActivityId = function( blockId )
{
    return $("[blockId='" + blockId + "']").find( "#editModeActivityId" ).val();
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
        else activityPayloadClient = ClientDataManager.createActivityPayloadClient( activityJson );
        

        ActivityDataManager.insertActivityToClient( activityJson, activityPayloadClient, { 'addToTop': true } );
    
        ClientDataManager.saveCurrent_ClientsStore( function() {
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
            if ( ConfigManager.getConfigJson().sourceAsLocalTime )
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
            ClientDataManager.saveCurrent_ClientsStore( function() 
            {
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
