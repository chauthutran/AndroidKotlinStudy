// =========================================
// -------------------------------------------------
//     ActivityListManager
//          - keeps activity list data & has methods related to that.
//
// -- Pseudo WriteUp:   Create Pseudo Codes with Flow of App (High Level --> to Lower Level)
//
//
// -------------------------------------------------

function ActivityListManager()  {};

ActivityListManager._activitiesStore = { 'list': [] };


// ===================================================
// === MAIN FEATURES =============

// Get activityList from memory
ActivityListManager.getActivityList = function()
{
    return ActivityListManager._activitiesStore.list;
};

// ActivityListManager.getActivityStore = function()  // <-- Will need if we store other data than list..


// Called After Login
ActivityListManager.loadActivityStoreFromStorage = function( callBack )
{
    DataManager2.getData_ActivityList( function( jsonData_FromStorage ) {

        if ( jsonData_FromStorage && jsonData_FromStorage.list )
        {
            ActivityListManager._activitiesStore.list = jsonData_FromStorage.list;
        }

        if ( callBack ) callBack( ActivityListManager._activitiesStore );
    });
};


// After making changes to the list/activityStore (directly), call this to save to storage (IndexedDB)
ActivityListManager.saveCurrent_ActivitiesStore = function( callBack )
{
    DataManager2.saveData_ActivityList( ActivityListManager._activitiesStore, callBack );
};


// Get single activity Item (by property value search) from the list
ActivityListManager.getActivityItem = function( propName, propVal )
{
    return Util.getFromList( ActivityListManager.getActivityList(), propVal, propName );    
};


// --------------------------------------
// -- Ways to add data to main list

ActivityListManager.insertNewActivity = function( newActivity, callBack )
{
    ActivityListManager.insertNewActivities( [ newActivity ], callBack );
};

ActivityListManager.insertNewActivities = function( newActivities, callBack )
{
    // Add to the beginning of the list..
    var list = ActivityListManager.getActivityList();

    // Due to using 'unshift' to add to top, we are pushing the back of newActivities list item.
    for ( var i = newActivities.length - 1; i >= 0; i-- )
    {
        list.unshift( newActivities[ i ] ); 
    }

    ActivityListManager.saveCurrent_ActivitiesStore( callBack );
};


// blockList.mergeDownloadedList does it's own saving/modify..
// ActivityListManager.mergeActivities = function( newActivity, callBack )

// ===================================================
// === OTHERS Methods =============


// Not sure below should be here or create it's own class..

// Add new activity to the list <-- from/by action
ActivityListManager.createNewActivity = function( dataJson, statusStr, callBack )
{
    // 1. create proper json for adding to the activityList
    var activityData = ActivityListManager.generateActivityData( dataJson, statusStr );

    console.log( 'blockList.createNewActivity, activityData' );
    console.log( activityData );


    // 2. Add to the main list and display list
    // me.insertNewActivityData( activityData, function() 
    ActivityListManager.insertNewActivity( activityData, function() 
    {
        console.log( 'added new activity' );
        if ( callBack ) callBack();
        // In sequence of actions, have this done and have next action to go to area with blockList..
        // me.reRender( callBack );
    } );
    
};


ActivityListManager.generateActivityData = function( dataJson, statusStr )
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
