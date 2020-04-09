// =========================================
// -------------------------------------------------
//     ActivityDataManager
//          - keeps activity list data & has methods related to that.
//
// -- Pseudo WriteUp:   Create Pseudo Codes with Flow of App (High Level --> to Lower Level)
//
//
// -------------------------------------------------

function ActivityDataManager()  {};

ActivityDataManager._activityList = [];
ActivityDataManager._activityToClient = {};  // 


// ===================================================
// === MAIN FEATURES =============


ActivityDataManager.getActivityList = function()
{
    return ActivityDataManager._activityList;
};



// ** Problem with 2 type of data..
// <-- when we list things, the viewer and others need to sort based on that?
//  <-- 

// Get single activity Item (by property value search) from the list - Called from 'activityItem.js'
ActivityDataManager.getActivityItem = function( propName, propVal )
{
    return Util.getFromList( ActivityDataManager.getActivityList(), propVal, propName );    
};


// not yet implemeted..
ActivityDataManager.getActivityById = function( activityId )
{

};


// ---------------------------------------
// --- Remove Activity

// After 'syncUp', remove the payload <-- after syncDown?
ActivityDataManager.removePayloadActivityById = function( activityId )
{
    try
    {
        // 1. remove from activityList
        Util.RemoveFromArray( ActivityDataManager._activityList, "activityId", activityId );

        // 2. remove from activityClientMap, 3. remove from client activities
        if ( ActivityDataManager._activityToClient[ activityId ] )
        {
            var client = ActivityDataManager._activityToClient[ activityId ];

            delete ActivityDataManager._activityToClient[ activityId ];

            Util.RemoveFromArray( client.activities, "activityId", activityId );
        }    
    }
    catch ( errMsg )
    {
        console.log( 'Error on ActivityDataManager.removePayloadActivityById, errMsg: ' + errMsg );
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

ActivityDataManager.updateActivityList_NIndexes = function( activity, client )
{
    // Might use 'unshift' to add to top?
    ActivityDataManager._activityList.push( activity );

    if ( activity.activityId ) ActivityDataManager._activityToClient[ activity.activityId ] = client;
}

// ============================================

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

            ActivityDataManager.updateActivityList_NIndexes( activity, client );
        }
    }
};


// ====================================================
// === Activity

ActivityDataManager.mergeDownloadedActivities = function( mongoActivities, pwaActivities, pwaClient )
{
    var newActivities = [];

    for ( var i = 0; i < mongoActivities.length; i++ )
    {        
        var mongoActivity = mongoActivities[i];

        // TODO: Should use index for faster search
        var pwaActivity = Util.getFromList( pwaActivities, mongoActivity.activityId, "activityId" );

        try
        {
            // Only the ones (mongo) that does not exists in PWA, add to the list..
            if ( !pwaActivity )
            {
                newActivities.push( mongoActivity );
            }
        }
        catch( errMsg )
        {
            console.log( 'Error during ActivityDataManager.mergeDownloadedActivities: ', mongoActivity, pwaActivity );
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


// ------------------------------------
// --- TODO - MODIFY!!!

/*
ActivityDataManager.generateActivityData = function( dataJson, statusStr )
{
    var activityData = {};

    //activityData.title = 'added' + ' [' + dateTimeStr + ']'; // MISSING TRANSLATION
    activityData.created = Util.formatDateTimeStr( dataJson.payloadJson.DATE.toString() );
    activityData.id = dataJson.payloadJson.activityId;
    activityData.status = statusStr;
    activityData.activityType = "FPL-FU"; // Need more discussion or easier way to get this..        
    activityData.history = [];

    activityData.data = dataJson;

    return activityData;
};
*/

// --------------------------------------
// -- Ways to add data to main list

ActivityDataManager.generateActivityPayloadJson = function( formsJson, formsJsonGroup, blockInfo, actionDefJson )
{
    var activityJson = {};
    var createdDT = new Date();

    // Generate 'payload' json either by 'template' or as formsJson (payload v1/v2)
    var payload = ActivityDataManager.generatePayload( createdDT, formsJson, formsJsonGroup, blockInfo, actionDefJson );

    activityJson = payload.captureValues; // Util.getJsonDeepCopy( payload.captureValues );

    activityJson.processing = { 
        //'created': Util.formatDateTimeStr( createdDT.toString() ),
        'status': Constants.status_redeem_queued,
        'history': [],
        'url': ActivityDataManager.generateWsUrl( formsJson, actionDefJson ),
        'searchValues': payload.searchValues
        // 'actionJson': actionDefJson <-- Do not need this, probably
    };

    return activityJson;
};


// Add new activity to commonPayloadClient
ActivityDataManager.createNewPayloadActivity = function( formsJson, formsJsonGroup, blockInfo, actionDefJson, callBack )
{
    var activityJson = ActivityDataManager.generateActivityPayloadJson( formsJson, formsJsonGroup, blockInfo, actionDefJson );

    var commonPayloadClient = ClientDataManager.getCommonPayloadClient();

    ActivityDataManager.insertActivityToClient( activityJson, commonPayloadClient );

    ClientDataManager.saveCurrent_ClientsStore( function() {
        if ( callBack ) callBack( activityJson );    
    });
};

	
// 1. We need to get dcdConfig data..
// 2. Need to get 'definitionPayloadTemplate'
// 3. Need actionDef property <-- which fires this..
ActivityDataManager.generatePayload = function( dateTimeObj, formsJson, formsJsonGroup, blockInfo, actionDefJson )
{	
    var payloadJson;

    var payloadTemplates = SessionManager.sessionData.dcdConfig.definitionPayloadTemplates;

    // If 'ActionJson' has "payloadTemplate": "clientActivity1", use it as template.
    //		Otherwise, simply use 'formsJson' as payloadJson.
    if ( actionDefJson.payloadTemplate
        && payloadTemplates 
        && payloadTemplates[ actionDefJson.payloadTemplate ] )
    {
        var payloadTemplate = payloadTemplates[ actionDefJson.payloadTemplate ];

        // hard copy from payloadTemplate...
        payloadJson = Util.getJsonDeepCopy( payloadTemplate );	
        payloadJson.DATE = dateTimeObj; //new Date();

        ActivityDataManager.traverseEval( payloadJson, payloadJson, formsJsonGroup, formsJson, 0, 30 );

        try
        {
            // Temporary - replace activeUserId..
            payloadJson.captureValues.activeUser = SessionManager.sessionData.login_UserName;
        }
        catch ( errMsg )
        {
            console.log( 'Error during payloadJson.captureValues.activeUser set, errMsg: ' + errMsg );
        }
            
    }
    else 
    {
        payloadJson = formsJson;			
    }


    // At the end of the payload generation, it should have 'searchValues' & 'captureValues'

    return payloadJson;
};


ActivityDataManager.traverseEval = function( obj, payloadJson, formsJsonGroup, formsJson, iDepth, limit )
{
    if ( iDepth === limit )
    {
        console.log( 'Error in ActivityDataManager.traverseEval, Traverse depth limit has reached: ' + iDepth );
    }
    else
    {
        for ( var prop in obj ) 
        {
            var propVal = obj[prop];
    
            if ( typeof( propVal ) === "object" ) 
            {
                //console.log( prop, propVal );
                ActivityDataManager.traverseEval( propVal, payloadJson, formsJsonGroup, formsJson, iDepth++, limit );
            }
            else if ( typeof( propVal ) === "string" ) 
            {
                //console.log( prop, propVal );
                try
                {
                    obj[prop] = eval( propVal );
                }
                catch( errMsg )
                {
                    console.log( 'Error on Json traverseEval, prop: ' + prop + ', propVal: ' + propVal + ', errMsg: ' + errMsg );
                }
            }
        }
    }
};	


/*
‘Activity’: {
   [activityData]
}

[activityData]
{
   ‘activityId’
   ‘activityDate’: { --- }  <--
   ‘activityType’
   ‘activeUser’
   ‘transactions’: [ ---- ]
}
*/


// <-- EXISTING ACTIVITY LIST STRUCTURE!!!

// WE SHOULD GO WITH 2 STRUCTURE... 
//  1. Not Submitted 
//      - payload Structure with 
//       'payloadJson' - search/captureValues, url, actionJson, etc..
//       
//      - Check 'status' or data signiture - to check if the data is 'not submitted'..
//      - if 'status' is not 
//
//      '      
//


/*        "displaySettings": [
            "'<b><i>' + activityItem.created + '</i></b>'",
            "activityTrans.firstName + ' ' + activityTrans.lastName"
         ],
*/


//  2. Submitted 
//      - mongoDB submittied ones <-- Already
//
//      - { 'activityId': ---, 'transactions': --- }  <-- This will be 'PROCESSED' activity card.
//      - How to display this?  Need 'status', 'activityType', 'created'
//   
//      OPTION.  
//          - We can create new json and populate 'created'...  but, no good?
//          - Modify 'Not Submitted' formatting..