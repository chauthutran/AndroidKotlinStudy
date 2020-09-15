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
//
// -------------------------------------------------

function ActivityDataManager()  {};

ActivityDataManager._activityList = []; // Activity reference list - original data are  in each client activities.
ActivityDataManager._activityToClient = {};  // Fast reference - activity to client

ActivityDataManager.jsonSignature_Dhis2 = {
    "client": {}
};

ActivityDataManager.jsonSignature_Mongo = {
    "transactions": []
};

// ActivityDataManager.wsSubmit_AppVersionStr = "1.3";  _ver


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

ActivityDataManager.getActivityById = function( activityId )
{
    return Util.getFromList( ActivityDataManager._activityList, activityId, 'id' );
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

ActivityDataManager.removeActivityNClientById = function( activityId )
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

            if ( client._id.indexOf( ClientDataManager.payloadClientNameStart ) === 0 )
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

ActivityDataManager.insertActivityToClient = function( activity, client )
{
    ActivityDataManager.insertActivitiesToClient( [ activity ], client );
};

ActivityDataManager.insertActivitiesToClient = function( activities, client )
{
    for ( var i = 0; i < activities.length; i++ )
    {
        var activity = activities[ i ];

        client.activities.push( activity );

        ActivityDataManager.updateActivityList_NIndexes( activity, client );
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


ActivityDataManager.updateActivityList_NIndexes = function( activity, client )
{
    // Might use 'unshift' to add to top?
    ActivityDataManager._activityList.push( activity );

    if ( activity.id ) ActivityDataManager._activityToClient[ activity.id ] = client;
};


ActivityDataManager.addToActivityList_NIndexes = function( client )
{
    if ( client.activities ) 
    {
        for ( var x = 0; x < client.activities.length; x++ )
        {
            var activity = client.activities[ x ];

            ActivityDataManager.updateActivityList_NIndexes( activity, client );
        }
    }
};


// ====================================================
// === Merge downloaded activities related

ActivityDataManager.mergeDownloadedActivities = function( mongoActivities, pwaActivities, pwaClient, processingInfo )
{
    var newActivities = [];

    for ( var i = 0; i < mongoActivities.length; i++ )
    {        
        var mongoActivity = mongoActivities[i];

        // TODO: Should use index for faster search
        var pwaActivity = Util.getFromList( pwaActivities, mongoActivity.id, "id" );

        try
        {
            // Only the ones (mongo) that does not exists in PWA, add to the list..
            if ( !pwaActivity )
            {
                ActivityDataManager.insertToProcessing( mongoActivity, processingInfo );

                newActivities.push( mongoActivity );                
            }
        }
        catch( errMsg )
        {
            console.customLog( 'Error during ActivityDataManager.mergeDownloadedActivities: ', mongoActivity, pwaActivity );
        }
    }

    // if new list to push to pwaActivities exists, add to the list.
    if ( newActivities.length > 0 ) 
    {
        ActivityDataManager.insertActivitiesToClient( newActivities, pwaClient );
    }

    // Return the number of added ones.
    return newActivities.length;
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

        if ( actionDefJson ) activityJson.processing.useTestResponse = actionDefJson.useTestResponse;

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
    
        ActivityDataManager.insertActivityToClient( activityJson, activityPayloadClient );
    
        ClientDataManager.saveCurrent_ClientsStore( function() {
            if ( callBack ) callBack( activityJson );    
        });    
    }
    catch( errMsg )
    {    
        MsgManager.notificationMessage ( 'Failed to generate activity! ' + errMsg, 'notificationDark', undefined, '', 'right', 'top' );

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

    // 'activity' are not in 'search/capture' structure.  Change it to that structure.
    var activityJson_Copy = Util.getJsonDeepCopy( activityJson );
    delete activityJson_Copy.processing;
    
    payloadJson.payload = {
        'searchValues': activityJson.processing.searchValues,
        'captureValues': activityJson_Copy
    };

    return payloadJson;
};


// ----------------------------------------------
// --- Create Activity Processing Info Related

ActivityDataManager.createProcessingInfo_Success = function( statusStr, msgStr )
{
    var dateStr = Util.formatDateTimeStr( ( new Date() ).toString() );    
    var processingInfo = {
        'created': dateStr,
        'status': statusStr,
        'history': [ { 'status': statusStr, 'responseCode': 200, 'datetime': dateStr, 'msg': msgStr } ]
    };    

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
        if ( !activity.processing ) 
        {
            activity.processing = Util.getJsonDeepCopy( newProcessingInfo );

            // update the 'created' as mongoDB one if exists..            
            if ( activity.date )
            {
                var activityUtcDate = '';

                if ( activity.date.createdOnDeviceUTC ) activityUtcDate = activity.date.createdOnDeviceUTC;
                else if ( activity.date.createdOnMdbUTC ) activityUtcDate = activity.date.createdOnMdbUTC;

                if ( activityUtcDate )
                {
                    var updateCreated = Util.formatDateTime( Util.dateUTCToLocal( activityUtcDate ) );
                    if ( updateCreated ) activity.processing.created = updateCreated;
                }
            }
        }
        else 
        {
            // update the limited data --> 'status', 'statusRead', 'history' (add)
            activity.processing.status = newProcessingInfo.status;

            //if ( newProcessingInfo.statusRead !== undefined ) activity.processing.statusRead = newProcessingInfo.statusRead;
        
            activity.processing.history.push( Util.getJsonDeepCopy( newProcessingInfo.history[0] ) );        
        }
    }
};

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
            for( var i = 0; i < tranList.length; i++ )
            {
                var tranData_cd = tranList[i][ propName ];
        
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
    catch ( errMsg )
    {
        console.customLog( 'Error during ActivityDataManager.getData_FromTrans, errMsg: ' + errMsg );
    }

    return dataJson;
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


ActivityDataManager.activityUpdate_Status = function( activityId, status )
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
            });
        }    
    }
};

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
