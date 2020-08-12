// =========================================
// -------------------------------------------------
//     ClientDataManager
//          - Keeps client list data & Related Methods.
//
//      - FEATURES:
//          1. Get Client - by Id, by activityId, get all clientList, etc..
//          2. Insert Client - by Id, by activityId, get all clientList, etc..
//          3. loadClientsStore_FromStorage - Load client data from IDB
//          4. saveCurrent_ClientsStore - Save client data to IDB
//          5. Client Index Add/Remove Related Methods
//          6. Merge Related Methods - After SyncUp/Down client/activities data merge
//          7. Othe Methods - Activity Add ProcessingInfo, createActivityPayloadClient 
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

    if ( activityId && ActivityDataManager._activityToClient[ activityId ] )
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


// ----- Remove Client ----------------

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
        console.customLog( 'Error in ClientDataManager.removeClient, errMsg: ' + errMsg );
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
            // CASE #1. Client Update (Server version has later update)
            // If matching id item(activity) already exists in device, 
            // if mongoDB one is later one, overwrite the device one.  // <-- test the this overwrite..
            if ( pwaClient )
            {
                //ClientDataManager.getDateStr_LastUpdated = function( clientJson )
                if ( ClientDataManager.getDateStr_LastUpdated( mongoClient ) 
                        > ClientDataManager.getDateStr_LastUpdated( pwaClient ) ) 
                {
                    // Get activities in mongoClient that does not exists...
                    ActivityDataManager.mergeDownloadedActivities( mongoClient.activities, pwaClient.activities, pwaClient
                        , Util.getJsonDeepCopy( processingInfo ) );

                    // Update clientDetail from mongoClient
                    pwaClient.clientDetails = mongoClient.clientDetails;
                    pwaClient.clientConsent = mongoClient.clientConsent;

                    pwaClient.date = mongoClient.date;

                    changeOccurred = true;
                    updateOccurred = true;
                }
            }
            else
            {
                // CASE #2. New Client Download Case
                // If not existing on device, simply add it.
                newClients.push( mongoClient );

                changeOccurred = true;
            }
        }
        catch( errMsg )
        {
            console.customLog( 'Error during ClientDataManager.mergeDownloadedClients', mongoClient, pwaClient );
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


// ----- Othe Methods - Activity Add ProcessingInfo, createActivityPayloadClient ----------------

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

    acitivityPayloadClient._id = ClientDataManager.payloadClientNameStart + activity.id;
    acitivityPayloadClient.clientDetails = ActivityDataManager.getData_FromTrans( activity, "clientDetails" );
    acitivityPayloadClient.clientConsent = ActivityDataManager.getData_FromTrans( activity, "clientConsent" );

    ClientDataManager.insertClient( acitivityPayloadClient );

    return acitivityPayloadClient;
};


ClientDataManager.getDateStr_LastUpdated = function( clientJson )
{
    var dateStr = '';

    if ( clientJson && clientJson.date && clientJson.date.updatedOnMdbUTC )
    {
        dateStr = clientJson.date.updatedOnMdbUTC;
    }

    return dateStr;
};