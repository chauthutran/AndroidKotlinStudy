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
ClientListManager._activityList = [];
ClientListManager._userLoginId;  // ??
ClientListManager._userLoginPwd;

// ===================================================
// === MAIN FEATURES =============


// Get ClientList from memory
ClientListManager.getClientList = function()
{
    return ClientListManager._clientsStore.list;
};

// ClientListManager.getActivityStore = function()  // <-- Will need if we store other data than list..


ClientListManager.updateActivityListFromClient = function()
{
    return ClientListManager._clientsStore.list;


};


// Called After Login
ClientListManager.loadClientsStoreFromStorage = function( callBack )
{
    DataManager2.getData_ClientsStore( function( jsonData_FromStorage ) {

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
    DataManager2.saveData_ClientsStore( ClientListManager._clientsStore, callBack );
};


// Get single client Item (by property value search) from the list
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



// =======================================================

// TODO: START FROM HERE..
//
//  1. simply check 'updated' and save to storage..  
//
//
ClientListManager.mergeDownloadedClients = function( newList, callBack )
{
    var mainList = ClientListManager.getClientList();
    var changeOccurred = false;
    var newList_filtered = [];

    // Check list for matching client

    //  If does not exists in mainList, put into the mainList..
    //  If exists, and if new one is later one, copy the content into main item (merging) 

    for ( var i = 0; i < newList.length; i++ )
    {        
        var newItem = newList[i];
        var existingItem = Util.getFromList( mainList, newItem._id, "_id" );

        try
        {
            // If matching id item(activity) already exists in device, 
            // if mongoDB one is later one, overwrite the device one.  // <-- test the this overwrite..
            if ( existingItem )
            {
                if ( newItem.updated > existingItem.updated ) 
                {

                    // TODO: Need to rewrite the client .. just reusing the object container...

                    // IDEA: WHAT ABOUT WE JUST OVERWRITE THEM AND REFRESH THE LIST??

                    ClientListManager.setClientPWAFormat( newItem );

                    existingItem = newItem;  // IMPORETANT NOTE: Reference Changed, thus, need refresh!!!

                    //Util.mergeJson( existingItem, newItem );
                    // NOTE: Activity List Refrences would also get changed 

                    changeOccurred = true;
                }
                //else console.log( 'Item content not merged - new one not latest..' );
            }
            else
            {
                // TODO: Need to add 'searchValues' & 'captureValues' in each activities...




                // If not existing on device, simply add it.
                newList_filtered.push( newItem );
                //console.log( 'Item content merged' );
                changeOccurred = true;
            }
        }
        catch( errMsg )
        {
            console.log( 'Error during SyncManagerNew.mergeDownloadedList: ' );
            console.log( newItem );
            console.log( existingItem );
        }
    }


    // if new list to push to mainList exists, add to the list.
    if ( newList_filtered.length > 0 ) 
    {
        // 'changeOccurred' already set to 'true' when adding to 'newList_filtered' above.
        Util.appendArray( mainList, newList_filtered );
    }


    if ( changeOccurred ) 
    {
        // Need to create clientListManager..
        ClientListManager.saveCurrent_ClientsStore( function() {
            if ( callBack ) callBack( changeOccurred );
        });
    } 
    else 
    {
        if ( callBack ) callBack( changeOccurred );
    }
}; 

ClientListManager.setClientPWAFormat = function( newClient )
{
    if ( newClient.activities )
    {
        for ( var i = 0; i < newClient.activities.length; i++ )
        {
            var activity = newClient.activities[ i ];

        }
    }
};


ClientListManager.setActivityPWAFormat = function( newActivity )
{
    if ( newActivity )
    {
        var hasSearch = ( newActivity.searchValues ) ? true: false;
        var hasCapture = ( newActivity.captureValues ) ? true: false;
        var searchValuesNew = {};

        // Add Capture..
        if ( !hasCapture )
        {
            newActivity.captureValues = newActivity;
        }


        if ( !hasSearch )
        {
            // put client id and activity id?
            searchValuesNew = { '_id': };

            payloadJson.searchValues._id = mongoClientId;   // Downloaded ones are searched by client mongoDB id
            payloadJson.captureValues = mongoActivityJson;

        }
    }
};

// When sync, do we do client level?  or activity level?
//      --> for new activity, we download..
//      --> for existing activity not yet submitted, we also need to update this...


// Merge Cases:

//      1. New Device: 
//          Get All Clients with the activeUser Id..
//              --> no date range..
//
//      2. SyncDown with date
//          Add clientId, but with Date range.. 
//              --> new clients  <-- simply add to client list
//              --> existing client with differnt update
//                  - follow mongoDB data!!!
//
//              - Update client List and activity List..
//
//      3. SyncUp
//          - one new activity ISS case
//          - How do we tell if client of this activity exists?
//          A. if PWA store has client, online/offline, use this client Id in search
//              '_id' : clientId.
//              For activity, generate activityId and send 'activityId' : activityId <-- in search..
//              <-- If client not found, new client case.  If found, but activity not found, new activity case.
//
//          B. 
//          - one new activity REDEEM case
//              clientId
//              
//
//    If client detail is updated, it will be by/through activity.  Thus, we can simply check 'update'
//          date.  See which one is later one, and simply take the client Detail update..
//          - Which means, for 'SyncDown', if same client exists, it should always get mongo's clientDetail 
//            and overwrite to PWA one - if mongo one is later one.
//
//    If the 'updated' date is different, 
//      even if PWA one is later one, there could be case there both got updated, THUS
//    IF 'updated' is same, no changes..
//    IF DIFF, we look at activities...
//          --> ** We do not need to check activity ID since it is only created or not.
//          We only get activities not exists in both mongo and PWA
//          And run them in order <-- by activityDate (UTC)?
//              --> But PWA one would not have mongoUTC date, thus, these are still pending ones...
//                  <-- Not influence details..

//          Thus, we only get the mongo ones that does not exist in PWA 
//              + update client detail...
//              + add these activities on PWA activity list.
//              - while keeping the not, yet, submitted activities...
//
//
//      ** 'SyncUp'
//          - We only save 'updated' time mark if we successfully get mongo save confirmation!!
//              --> Better, yet, get it from mongo, so that the 'updated' date is same..
//
//