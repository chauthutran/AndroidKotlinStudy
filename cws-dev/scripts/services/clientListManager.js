// =========================================
// -------------------------------------------------
//     ClientListManager
//          - keeps client list data & has methods related to that.
//
// -- Pseudo WriteUp:   Create Pseudo Codes with Flow of App (High Level --> to Lower Level)
//
//
// -------------------------------------------------

function ClientListManager()  {};

ClientListManager._clientsStore = { 'list': [] };


// ===================================================
// === MAIN FEATURES =============

// Get ClientList from memory
ClientListManager.getClientList = function()
{
    return ClientListManager._clientsStore.list;
};

// ClientListManager.getActivityStore = function()  // <-- Will need if we store other data than list..


// Called After Login
ClientListManager.loadClientsStoreFromStorage = function( callBack )
{
    // TODO: NEED TO REPLACE ALL CODES...
    DataManager2.getData_ClientList( function( jsonData_FromStorage ) {

        if ( jsonData_FromStorage && jsonData_FromStorage.list )
        {
            ClientListManager._clientsStore.list = jsonData_FromStorage.list;
        }

        if ( callBack ) callBack( ClientListManager._clientsStore );
    });
};


// After making changes to the list/activityStore (directly), call this to save to storage (IndexedDB)
ClientListManager.saveCurrent_ClientsStore = function( callBack )
{
    DataManager2.saveData_ClientList( ClientListManager._clientsStore, callBack );
};


// Get single activity Item (by property value search) from the list
ClientListManager.getClientItem = function( propName, propVal )
{
    return Util.getFromList( ClientListManager.getClientList(), propVal, propName );    
};


// --------------------------------------
// -- Ways to add data to main list

ClientListManager.insertNewActivity = function( newActivity, callBack )
{
    ClientListManager.insertNewActivities( [ newActivity ], callBack );
};

ClientListManager.insertNewActivities = function( newActivities, callBack )
{
    // Add to the beginning of the list..
    var list = ClientListManager.getClientList();

    // Due to using 'unshift' to add to top, we are pushing the back of newActivities list item.
    for ( var i = newActivities.length - 1; i >= 0; i-- )
    {
        list.unshift( newActivities[ i ] ); 
    }

    ClientListManager.saveCurrent_clientsStore( callBack );
};


// blockList.mergeDownloadedList does it's own saving/modify..
// ClientListManager.mergeActivities = function( newActivity, callBack )

// ===================================================
// === OTHERS Methods =============


// Not sure below should be here or create it's own class..

// Add new activity to the list <-- from/by action
ClientListManager.createNewActivity = function( dataJson, statusStr, callBack )
{
    // 1. create proper json for adding to the ClientList
    var activityData = ClientListManager.generateActivityData( dataJson, statusStr );

    console.log( 'blockList.createNewActivity, activityData' );
    console.log( activityData );


    // 2. Add to the main list and display list
    // me.insertNewActivityData( activityData, function() 
    ClientListManager.insertNewActivity( activityData, function() 
    {
        console.log( 'added new activity' );
        if ( callBack ) callBack();
        // In sequence of actions, have this done and have next action to go to area with blockList..
        // me.reRender( callBack );
    } );
    BDA
};


ClientListManager.generateActivityData = function( dataJson, statusStr )
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
