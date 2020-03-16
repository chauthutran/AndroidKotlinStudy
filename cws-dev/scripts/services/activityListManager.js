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

