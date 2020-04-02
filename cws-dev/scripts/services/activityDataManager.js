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
    // 1. remove index?
    // 2. remove from array List
    // 3. save entire data?   <-- or after merge, we could save..
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

ActivityDataManager.generateActivityPayloadJson = function( formsJson, formsJsonGroup, actionDefJson, payloadTemplates )
{
    var activityJson = {};
    var createdDT = new Date();

    var payload = ActivityDataManager.generatePayload( createdDT, formsJson, formsJsonGroup, actionDefJson, payloadTemplates );

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
ActivityDataManager.createNewPayloadActivity = function( activityJson, callBack )
{
    var commonPayloadClient = ClientDataManager.getCommonPayloadClient();

    ActivityDataManager.insertActivityToClient( activityJson, commonPayloadClient );

    ClientDataManager.saveCurrent_ClientsStore( callBack );    
};


// This has moved from FormUtil
ActivityDataManager.generateWsUrl = function( inputsJson, actionJson )
{
    var url;

    if ( actionJson.url !== undefined || WsApiManager.isSite_psiConnect  )
    {
        if ( WsApiManager.isSite_psiConnect && actionJson.dws && actionJson.dws.url )
        {
            url = WsApiManager.composeWsFullUrl( actionJson.dws.url );
        }
        else
        {
            url = WsApiManager.composeWsFullUrl( actionJson.url );
        }

        if ( actionJson.urlParamNames !== undefined 
            && actionJson.urlParamInputs !== undefined 
            && actionJson.urlParamNames.length == actionJson.urlParamInputs.length )
        {
            var paramAddedCount = 0;
    
            for ( var i = 0; i < actionJson.urlParamNames.length; i++ )
            {
                var paramName = actionJson.urlParamNames[i];
                var inputName = actionJson.urlParamInputs[i];
    
                if ( inputsJson[ inputName ] !== undefined )
                {
                    var value = inputsJson[ inputName ];
    
                    url += ( paramAddedCount == 0 ) ? '?': '&';
    
                    url += paramName + '=' + value;
                }
    
                paramAddedCount++;
            }
        }
    }
    
    return url;
};
  
	
// 1. We need to get dcdConfig data..
// 2. Need to get 'definitionPayloadTemplate'
// 3. Need actionDef property <-- which fires this..
ActivityDataManager.generatePayload = function( dateTimeObj, formsJson, formsJsonGroup, actionDefJson, definitionPayloadTemplates )
{	
    var payloadJson;

    // If 'ActionJson' has "payloadTemplate": "clientActivity1", use it as template.
    //		Otherwise, simply use 'formsJson' as payloadJson.
    if ( actionDefJson.payloadTemplate
        && definitionPayloadTemplates 
        && definitionPayloadTemplates[ actionDefJson.payloadTemplate ] )
    {
        var payloadTemplate = definitionPayloadTemplates[ actionDefJson.payloadTemplate ];

        // hard copy from payloadTemplate...
        payloadJson = Util.getJsonDeepCopy( payloadTemplate );	
        payloadJson.DATE = dateTimeObj; //new Date();

        ActivityDataManager.traverseEval( payloadJson, payloadJson, formsJsonGroup, formsJson, 0, 30 );
    }
    else 
    {
        payloadJson = formsJson;			
    }

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