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
ClientListManager._activityToClient = {};  // 

//ClientListManager._userLoginId;  // ??
//ClientListManager._userLoginPwd;

// ===================================================
// === MAIN FEATURES =============


// Get ClientList from memory
ClientListManager.getClientList = function()
{
    return ClientListManager._clientsStore.list;
};


ClientListManager.setActivityListNMap_FromClients = function()
{
    var clientList = ClientListManager.getClientList();

    // Reset the activityList and mapping to client
    ClientListManager._activityList = [];
    ClientListManager._activityToClient = {};

    for ( var i = 0; i < clientList.length; i++ )
    {        
        var client = clientList[i];

        if ( client.activities ) 
        {
            for ( var x = 0; x < client.activities.length; x++ )
            {
                var activity = client.activities[ x ];
                ClientListManager._activityList.push( activity );

                if ( activity.activityId ) ClientListManager._activityToClient[ activity.activityId ] = client;
            }    
        }
    }
};


// Called After Login
ClientListManager.loadClientsStore_FromStorage = function( callBack )
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



// --------------------------------------------
// -------- Below are not implemented properly

/*

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

*/

// =======================================================

// TODO: START FROM HERE..
//
//  1. simply check 'updated' and save to storage..  
//
//
ClientListManager.mergeDownloadedClients = function( mongoClients, callBack )
{
    var pwaClients = ClientListManager.getClientList();
    var changeOccurred = false;
    var newClients = [];

    // Check list for matching client

    //  If does not exists in pwaClients, put into the pwaClients..
    //  If exists, and if new one is later one, copy the content into main item (merging) 

    for ( var i = 0; i < mongoClients.length; i++ )
    {        
        var mongoClient = mongoClients[i];
        var pwaClient = Util.getFromList( pwaClients, mongoClient._id, "_id" );

        try
        {
            // If matching id item(activity) already exists in device, 
            // if mongoDB one is later one, overwrite the device one.  // <-- test the this overwrite..
            if ( pwaClient )
            {
                if ( mongoClient.updated > pwaClient.updated ) 
                {
                    // Get activities in mongoClient that does not exists...
                    ClientListManager.mergeDownloadedActivities( mongoClient.activities, pwaClient.activities );

                    // Update clientDetail from mongoClient
                    pwaClient.clientDetails = mongoClient.clientDetails;
                    pwaClient.updated = mongoClient.updated;

                    changeOccurred = true;
                }
                //else console.log( 'Item content not merged - new one not latest..' );
            }
            else
            {
                // If not existing on device, simply add it.
                newClients.push( mongoClient );

                //console.log( 'Item content merged' );
                changeOccurred = true;
            }
        }
        catch( errMsg )
        {
            console.log( 'Error during ClientListManager.mergeDownloadedClients', mongoClient, pwaClient );
        }
    }


    // if new list to push to pwaClients exists, add to the list.
    if ( newClients.length > 0 ) 
    {
        Util.appendArray( pwaClients, newClients );
    }


    if ( changeOccurred ) 
    {
        // Need to update the activityList and activity-client mapping list..
        // Update the list...
        ClientListManager.setActivityListNMap_FromClients();

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


ClientListManager.mergeDownloadedActivities = function( mongoActivities, pwaActivities )
{
    var newActivities = [];

    for ( var i = 0; i < mongoActivities.length; i++ )
    {        
        var mongoActivity = mongoActivities[i];
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
            console.log( 'Error during ClientListManager.mergeDownloadedActivities: ', mongoActivity, pwaActivity );
        }
    }

    // if new list to push to pwaActivities exists, add to the list.
    if ( newActivities.length > 0 ) 
    {
        Util.appendArray( pwaActivities, newActivities );
    }

    // Return the number of added ones.
    return newActivities.length;
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


//     NOTE:
//          'searchValues' & 'captureValues' only exists on draft ready for Sync Item.
//          Once synced, it will be removed since it will get Mongo updated one
//               - which does not have 'searchValues' & 'captureValues' format.

// Merge Cases:

//      1. New Device: 
//          Get All Clients with the activeUser Id..
//              --> no date range..
//              - But if clients data exists on PWA, we need merging..
//                  if 'updated' is later on mongo side, get activities that PWA does not have..
//                  and update the PWA client details (from mongo one)
//                  - Otherwise, if PWA 'updated' is same or higher(Not possible), do not do update?
//
//      2. SyncDown with date
//          In search json, 'find', do by clientId, but with Date range.. 
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
//              After mongo SyncUp, get mongo info and save here..
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