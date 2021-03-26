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


// TODO: Need to work on this - rename method & activity/client id related..
ActivityDataManager.removeTempClient_Activity = function( activityId )
{
    try
    {
        // 1. remove from activityList
        Util.RemoveFromArray( ActivityDataManager._activityList, "id", activityId );
        
        // 2. remove from activityClientMap, 3. remove from client activities
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
        console.customLog( 'Error on ActivityDataManager.removePayloadActivityById, errMsg: ' + errMsg );
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

        ActivityDataManager.updateActivityList_NIndexes_wtTempClientDelete( activity, client, option );
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


ActivityDataManager.updateActivityList_NIndexes_wtTempClientDelete = function( activity, client, option )
{
    // Check if the same activity id exists in the '_acitivtyList'.  If so, remove it
    var activityId = activity.id;

    if ( activityId ) 
    {
        var existingActivity = Util.getFromList( ActivityDataManager._activityList, activityId, "id" );    

        // Remove activity?  Why?
        // NOTE: This also removes temporary client ('client_').
        if ( existingActivity ) ActivityDataManager.removeTempClient_Activity( activityId );


        // TODO: Might use 'unshift' to add to top?
        if ( option && option.addToTop ) {
            ActivityDataManager._activityList.unshift( activity );
        }
        else {
            ActivityDataManager._activityList.push( activity );
        }
        ActivityDataManager._activityToClient[ activityId ] = client;
    }
    else 
    {
        throw "ERROR, Downloaded activity does not contain 'id'.";
    }    
};


ActivityDataManager.addToActivityList_NIndexes = function( client )
{
    if ( client.activities ) 
    {
        for ( var x = 0; x < client.activities.length; x++ )
        {
            var activity = client.activities[ x ];

            ActivityDataManager.updateActivityList_NIndexes_wtTempClientDelete( activity, client );
        }
    }
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
            }
        }
        catch( errMsg )
        {
            console.customLog( 'Error during ActivityDataManager.mergeDownloadedActivities: ', dwActivity, appClientActivity );
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

ActivityDataManager.generateActivityPayloadJson = function( actionUrl, formsJsonActivityPayload, actionDefJson )
{
    var activityJson = {};

    if ( !formsJsonActivityPayload.payload ) throw 'activityPayloadsJson.payload not exists';
    else
    {
        var createdDT = new Date();
        var payload = formsJsonActivityPayload.payload;


        // CONVERT 'searchValues'/'captureValues' structure ==> 'captureValues.processing': { 'searchValues' }
        activityJson = payload.captureValues; // Util.getJsonDeepCopy( payload.captureValues );

        // FAILED TO GENERATE - ERROR MESSAGE..
        if ( !activityJson ) throw 'payload captureValues not exists!';
        
        // If activityId were not generated by the payload generation methods, create one.
        if ( !activityJson.id ) activityJson.id = SessionManager.sessionData.login_UserName + '_' + $.format.date( createdDT.toUTCString(), 'yyyyMMdd_HHmmssSSS' );
        
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

    }

    return activityJson;
};


// Add new activity with client generation
ActivityDataManager.createNewPayloadActivity = function( actionUrl, formsJsonActivityPayload, actionDefJson, callBack )
{
    try
    {
        var activityJson = ActivityDataManager.generateActivityPayloadJson( actionUrl, formsJsonActivityPayload, actionDefJson );

        var activityPayloadClient = ClientDataManager.createActivityPayloadClient( activityJson );
    
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
        "payload": undefined
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
        var activityJson_Copy = Util.getJsonDeepCopy( activityJson );
        delete activityJson_Copy.processing;
        
        payloadJson.payload = {
            'searchValues': activityJson.processing.searchValues,
            'captureValues': activityJson_Copy
        };
    }

    return payloadJson;
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
        processingInfo = Util.getJsonDeepCopy( prev_ProcessingInfo );
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
    if ( activity )
    {
        if ( activity.processing ) 
        {
            // Update the 'processing' data with 'status' & 'history'
            activity.processing.status = newProcessingInfo.status;
            Util.appendArray( activity.processing.history, Util.getJsonDeepCopy( newProcessingInfo.history ) );
        }
        else
        {
            // Create New 'processing' data.
            activity.processing = Util.getJsonDeepCopy( newProcessingInfo );

            // update the 'created' as mongoDB one if exists..            
            if ( activity.date ) ActivityDataManager.updateProcessing_CreatedDate( activity );
        }
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


/*
ActivityDataManager.activityUpdate_Status_WtHistory = function( activityId, status, activityCard, msg, httpResponseCode, returnFunc )
{
    if ( status )
    {
        var activityJson = ActivityDataManager.getActivityById( activityId );

        if ( activityJson && activityJson.processing )
        {
            var oldStatus = activityJson.processing.status;         

            var processingInfo = ActivityDataManager.createProcessingInfo_Other( status, httpResponseCode, msg );
            ActivityDataManager.insertToProcessing( activityJson, processingInfo );	
    
            // Need to save storage afterwards..
            ClientDataManager.saveCurrent_ClientsStore( function() 
            {
                if ( oldStatus !== status )
                {
                    if ( !activityCard ) activityCard = new ActivityCard( activityId, SessionManager.cwsRenderObj );
                    // Update ActivityCard is visible..                        
                    activityCard.displayActivitySyncStatus_Wrapper( activityJson, activityCard.getActivityCardDivTag() );
                }

                if ( returnFunc ) returnFunc();
            });
        }    
    }
};
*/

// --------------------------------------------
// --- Other Methods

ActivityDataManager.getCombinedTrans = function( activityJson )
{
    var jsonCombined = {};

    try
    {
        var tranList = activityJson.transactions;

        if ( tranList )
        {
            for( var i = 0; i < tranList.length; i++ )
            {
                var tranData_dv = tranList[i].dataValues;
                var tranData_cd = tranList[i].clientDetails;
    
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
        var tranList = activityJson.transactions;

        if ( tranList )
        {
            // TranList could be object type or array list..
            if ( Util.isTypeArray( tranList ) )
            {
                tranList.forEach( tran => 
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
            else if ( Util.isTypeObject( tranList ) )
            {
                for ( var tranTypeKey in tranList ) 
                {
                    var tran = tranList[ tranTypeKey ];

                    var tranData_cd = tran[ propName ];
                    if ( tranData_cd )
                    {
                        for ( var prop in tranData_cd ) 
                        {
                            dataJson[ prop ] = tranData_cd[ prop ];
                        }
                    }
                }

            }
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
            var localDateTime = Util.dateUTCToLocal( activityJson.date.capturedUTC );
            if ( localDateTime ) activityJson.date.capturedLoc = Util.formatDateTime( localDateTime );
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error in ActivityDataManager.setActivityDateLocal, errMsg: ' + errMsg );
    }
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
                var activityCardObj = new ActivityCard( activityJson.id, SessionManager.cwsRenderObj );
                activityCardObj.displayActivitySyncStatus_Wrapper( activityJson, activityCardObj.getActivityCardDivTag() );
                //activityCardObj.reRenderActivityDiv();

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

// ----------------------------------------------

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

ActivityDataManager.checkActivityCoolDown = function( activityId, optionalCallBack )
{
	var coolDownPassed = true;  // 'false' means it is still during/within coolDown time.

	try
	{
        var lastSynced = ActivityDataManager.getActivityLastSyncedUp( activityId );

		if ( lastSynced )
		{
			var coolDownMs = ConfigManager.getSyncUpCoolDownTime();
    
			// 0 ~ 90000 check..
			var timePassedMs = UtilDate.getTimePassedMs( lastSynced );

			if ( timePassedMs > 0 && coolDownMs && timePassedMs <= coolDownMs )
			{
                var timeRemain = coolDownMs - timePassedMs;

                coolDownPassed = false;
                if ( optionalCallBack ) optionalCallBack( timeRemain );
			}
		}
	}
	catch( errMsg )
	{
		console.customLog( 'ERROR in ActivityDataManager.checkActivityCoolDown, errMsg: ' + errMsg );
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
