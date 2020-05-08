// =========================================
// -------------------------------------------------
//     ClientDataManager
//          - keeps client list data & has methods related to that.
//
// -- Pseudo WriteUp:   Create Pseudo Codes with Flow of App (High Level --> to Lower Level)
//
//
// -------------------------------------------------

function ClientDataManager()  {};

ClientDataManager._clientsStore = { 'list': [] };
ClientDataManager._clientsIdx = {};

ClientDataManager.template_Client = {
    '_id': '',
    'clientDetails': {},
    'activities': []        
};

ClientDataManager.payloadClientNameStart = 'client_';

// ===================================================
// === MAIN FEATURES =============

// ----- Get  Client ----------------

// Get ClientList from memory
ClientDataManager.getClientList = function()
{
    return ClientDataManager._clientsStore.list;
};


// Get single client Item (by property value search) from the list
// TODO: SHOULD BE OBSOLETE
ClientDataManager.getClientItem = function( propName, propVal )
{
    return Util.getFromList( ClientDataManager.getClientList(), propVal, propName );    
};

ClientDataManager.getClientById = function( idStr )
{
    return ClientDataManager._clientsIdx[ idStr ];
};


ClientDataManager.getClientByActivityId = function( activityId )
{
    var client;

    if ( ActivityDataManager._activityToClient[ activityId ] )
    {
        client = ActivityDataManager._activityToClient[ activityId ];
    }

    return client;
};

// ----- Insert Client ----------------

ClientDataManager.insertClient = function( client )
{
    ClientDataManager.insertClients( [ client ] );
};

ClientDataManager.insertClients = function( clients )
{
    // Add to the beginning of the list..
    var list = ClientDataManager.getClientList();

    // Due to using 'unshift' to add to top, we are pushing the back of newActivities list item.
    for ( var i = clients.length - 1; i >= 0; i-- )
    {
        var client = clients[ i ];
        list.unshift( client );         
        ClientDataManager.addClientIndex( client );
        ActivityDataManager.addToActivityList_NIndexes( client );
    }
    // NOTE: Not automatically saved. Manually call 'save' after insert.
};


// Add processing info if does not exists - with 'downloaded detail'
ClientDataManager.clientsActivities_AddProcessingInfo = function( newClients, processingInfo )
{
    for ( var i = 0; i < newClients.length; i++ )
    {
        var client = newClients[ i ];

        for ( var x = 0; x < client.activities.length; x++ )
        {
            var activity = client.activities[ x ];

            ActivityDataManager.insertToProcessing( activity, processingInfo );
        }
    }
};


ClientDataManager.createActivityPayloadClient = function( activity )
{
    // Call it from template?
    var acitivityPayloadClient = Util.getJsonDeepCopy( ClientDataManager.template_Client );

    acitivityPayloadClient._id = ClientDataManager.payloadClientNameStart + activity.activityId;
    acitivityPayloadClient.clientDetails = ActivityDataManager.getCombinedTrans( activity );

    ClientDataManager.insertClient( acitivityPayloadClient );

    return acitivityPayloadClient;
};


ClientDataManager.removeClient = function( client )
{
    try
    {
        // Remove activities in it
        ActivityDataManager.removeActivities( client.activities );

        // remove client ones..
        ClientDataManager.removeClientIndex( client );        
        Util.RemoveFromArray( ClientDataManager.getClientList(), "_id", client._id );
    }
    catch( errMsg )
    {
        console.log( 'Error in ClientDataManager.removeClient, errMsg: ' + errMsg );
    } 
};


// --------------------------------------------

// Called After Login
ClientDataManager.loadClientsStore_FromStorage = function( callBack )
{
    DataManager2.getData_ClientsStore( function( jsonData_FromStorage ) {

        if ( jsonData_FromStorage && jsonData_FromStorage.list )
        {
            ClientDataManager._clientsStore.list = jsonData_FromStorage.list;
            ClientDataManager.regenClientIndex();
        }

        if ( callBack ) callBack( ClientDataManager._clientsStore );
    });
};


// After making changes to the list/activityStore (directly), call this to save to storage (IndexedDB)
ClientDataManager.saveCurrent_ClientsStore = function( callBack )
{
    DataManager2.saveData_ClientsStore( ClientDataManager._clientsStore, callBack );
};


// ---------- Client Index..

ClientDataManager.regenClientIndex = function()
{
    ClientDataManager._clientsIdx = {};

    var clientList = ClientDataManager._clientsStore.list;

    for ( var i = 0; i < clientList.length; i++ )
    {
        ClientDataManager.addClientIndex( clientList[ i ] );
    }
};


ClientDataManager.addClientIndex = function( client )
{
    if ( client._id )
    {
        ClientDataManager._clientsIdx[ client._id ] = client;
    }
};


ClientDataManager.removeClientIndex = function( client )
{
    if ( client._id )
    {
        if ( ClientDataManager._clientsIdx[ client._id ] )
        {
            delete ClientDataManager._clientsIdx[ client._id ];
        }
    }
};

// ======================================================
// === MERGE RELATED =====================

ClientDataManager.mergeDownloadedClients = function( mongoClients, processingInfo, callBack )
{
    var pwaClients = ClientDataManager.getClientList();
    var changeOccurred = false;
    var updateOccurred = false;
    var newClients = [];

    // Check list for matching client

    //  If does not exists in pwaClients, put into the pwaClients..
    //  If exists, and if new one is later one, copy the content into main item (merging) 

    for ( var i = 0; i < mongoClients.length; i++ )
    {        
        // OPTION 1.  We can simply add the download info to all activities in Monogo?

        var mongoClient = mongoClients[i];
        // TODO: This pwaClientList should be indexed on 'clientDataManager' for performance..
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
                    ActivityDataManager.mergeDownloadedActivities( mongoClient.activities, pwaClient.activities, pwaClient
                        , Util.getJsonDeepCopy( processingInfo ) );

                    // Update clientDetail from mongoClient
                    pwaClient.clientDetails = mongoClient.clientDetails;
                    pwaClient.updated = mongoClient.updated;

                    changeOccurred = true;
                    updateOccurred = true;
                }
            }
            else
            {
                // If not existing on device, simply add it.
                newClients.push( mongoClient );

                changeOccurred = true;
            }
        }
        catch( errMsg )
        {
            console.log( 'Error during ClientDataManager.mergeDownloadedClients', mongoClient, pwaClient );
        }
    }


    if ( changeOccurred ) 
    {
        // if new list to push to pwaClients exists, add to the list.
        if ( newClients.length > 0 ) 
        {
            ClientDataManager.clientsActivities_AddProcessingInfo( newClients, processingInfo );

            ClientDataManager.insertClients( newClients );        
        }        

        // Need to create ClientDataManager..
        ClientDataManager.saveCurrent_ClientsStore( function() {
            if ( callBack ) callBack( changeOccurred );
        });
    } 
    else 
    {
        if ( callBack ) callBack( changeOccurred );
    }
}; 



// --------------------------------------------
// -------- Below are not implemented properly


// --------------------------------------
// -- Ways to add data to main list

// ===================================================
// === OTHERS Methods =============


// =======================================================


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