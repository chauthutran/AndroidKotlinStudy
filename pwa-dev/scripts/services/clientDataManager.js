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

ClientDataManager.tempClientNamePre = 'client_';

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

ClientDataManager.getClientByActivity = function( activity )
{
    var client;

    if ( activity && activity.id && ActivityDataManager._activityToClient[ activity.id ] )
    {
        client = ActivityDataManager._activityToClient[ activity.id ];
    }

    return client;
};

// ----- Insert Client ----------------


// Sync Related...
ClientDataManager.insertClients = function( clients, bRemoveActivityTempClient )
{
    // Add to the beginning of the list..
    var list = ClientDataManager.getClientList();

    // Due to using 'unshift' to add to top, we are pushing the back of newActivities list item.
    for ( var i = clients.length - 1; i >= 0; i-- )
    {
        var client = clients[ i ];
        list.unshift( client );         
        ClientDataManager.addClientIndex( client );
        ActivityDataManager.updateActivityListIdx( client, bRemoveActivityTempClient );
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

ClientDataManager.removeClientsAll = function()
{
    try
    {
        var clients = ClientDataManager.getClientList();
        var clientCount = clients.length;

        clients.forEach( client => {
            ClientDataManager.removeClient( client );
        });

        console.customLog( 'Removed ' + clientCount + ' clients.' );
    }
    catch( errMsg )
    {
        console.customLog( 'Error in ClientDataManager.removeAllClient, errMsg: ' + errMsg );
    } 
};


// --------------------------------------------

ClientDataManager.updateClient_wtActivityReload = function( clientId, updateClientJson )
{
    var existingClientJson = ClientDataManager.getClientById( clientId );

    if ( existingClientJson !== updateClientJson )
    {        
        // 0. Make sure the updateClientJson._id has not been altered.. Since this is updating existing client json only.
        updateClientJson._id = clientId;

        // 1. Delete all activities on existingClientJson
        if ( existingClientJson.activities ) 
        {
            for ( var i = existingClientJson.activities.length - 1; i >= 0; i-- )
            {
                var activity = existingClientJson.activities[ i ];
                if ( activity.id ) ActivityDataManager.removeExistingActivity_NTempClient( activity.id );
            }
        }

        // 2. Add activities to existingClientJson + copy other parts as well
        Util.overwriteJsonContent( existingClientJson, updateClientJson );


        // 3. Index the 
        if ( existingClientJson.activities )
        {
            existingClientJson.activities.forEach( activity => 
            {
                if ( activity.id ) ActivityDataManager.updateActivityIdx( activity.id, activity, existingClientJson );
            });
        }
        
        ClientDataManager.saveCurrent_ClientsStore();
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

ClientDataManager.mergeDownloadedClients = function( downloadedData, processingInfo, callBack )
{
    var dataChangeOccurred = false;
    //var activityListChanged = false;
    var case_dhis2RedeemMerge = false;
    var case_noClientDateCheck = false;
    var newClients = [];
    var mergedActivities = [];

    // 1. Compare Client List.  If matching '_id' exists, perform merge,  Otherwise, add straight to clientList.
    if ( downloadedData && downloadedData.clients && Util.isTypeArray( downloadedData.clients ) )
    {
        case_dhis2RedeemMerge = ( downloadedData.case === 'dhis2RedeemMerge' );
        case_noClientDateCheck = ( downloadedData.case === 'syncUpActivity' );

        downloadedData.clients.forEach( dwClient => 
        {
            try 
            {
                if ( dwClient._id )
                {
                    var appClient = ClientDataManager.getClientById( dwClient._id );

                    // If matching client exists in App already.
                    if ( appClient )
                    {
                        var clientDateCheckPass = ( case_dhis2RedeemMerge || case_noClientDateCheck ) ? true : ( ClientDataManager.getDateStr_LastUpdated( dwClient ) > ClientDataManager.getDateStr_LastUpdated( appClient ) );

                        if ( clientDateCheckPass )
                        {
                            // Get activities in dwClient that does not exists...
                            var addedActivities = ActivityDataManager.mergeDownloadedActivities( dwClient.activities, appClient.activities, appClient, Util.cloneJson( processingInfo ), downloadedData );

                            if ( case_dhis2RedeemMerge )
                            {
                                // merge data..
                                Util.mergeJson( appClient.clientDetails, dwClient.clientDetails );                                
                                Util.mergeJson( appClient.clientConsent, dwClient.clientConsent );                                
                                Util.mergeJson( appClient.date, dwClient.date );                                
                            }
                            else
                            {
                                // Update clientDetail from dwClient - other than activities merge?
                                // For activities, shouldn't we simply add them all?  Except the existing on local ones overwriting.
                                //appClient.clientDetails = dwClient.clientDetails;
                                //appClient.clientConsent = dwClient.clientConsent;
                                //appClient.date = dwClient.date;
                                //appClient.relationships = dwClient.relationships;

                                Util.copyProperties( dwClient, appClient, { 'exceptions': { 'activities': true, '_id': true } } );

                                // TODO: All Others?
                            }

                            Util.appendArray( mergedActivities, addedActivities );
                            dataChangeOccurred = true;
                        }
                    }
                    else
                    {
                        // Logic: For 'dhis2RedeemMerge' case, if the downloaded client does not already exists, do not merge it..
                        if ( !case_dhis2RedeemMerge )
                        {
                            newClients.push( dwClient );
                            dataChangeOccurred = true;  

                            if ( dwClient.activities && dwClient.activities.length > 0 )
                            {
                                Util.appendArray( mergedActivities, dwClient.activities );
                            }
                        }
                    }
                }
            }        
            catch( errMsg )
            {
                console.customLog( 'Error during ClientDataManager.mergeDownloadedClients, errMsg: ' + errMsg );
            }
        });
    }


    if ( dataChangeOccurred ) 
    {
        // if new list to push to pwaClients exists, add to the list.
        if ( newClients.length > 0 ) 
        {
            if ( processingInfo ) ClientDataManager.clientsActivities_AddProcessingInfo( newClients, processingInfo );

            // NOTE: new client insert -> new activity insert -> during this, we check if other client (temp client case) has same activityId.
            //   and remove the client (temp) & activity (before sync) in it.
            ClientDataManager.insertClients( newClients, true );
        }        

        // Need to create ClientDataManager..
        ClientDataManager.saveCurrent_ClientsStore( () => {
            if ( callBack ) callBack( true, mergedActivities );
        });
    } 
    else 
    {
        if ( callBack ) callBack( false, mergedActivities );
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
    var acitivityPayloadClient = Util.cloneJson( ClientDataManager.template_Client );

    acitivityPayloadClient._id = ClientDataManager.tempClientNamePre + activity.id;
    acitivityPayloadClient.clientDetails = ActivityDataManager.getData_FromTrans( activity, "clientDetails" );
    acitivityPayloadClient.clientConsent = ActivityDataManager.getData_FromTrans( activity, "clientConsent" );
    acitivityPayloadClient.date = ClientDataManager.dateConvertFromActivityDate( activity );

    ClientDataManager.insertClients( [ acitivityPayloadClient ] );

    return acitivityPayloadClient;
};


ClientDataManager.dateConvertFromActivityDate = function( activity )
{
    var clientDate = {};

    try
    {
        var actDate = activity.date;

        //updatedOnMdbUTC: "2021-06-02T02:02:57.026", createdOnMdbUTC: "2021-06-02T02:02:56.550"
        clientDate.createdOnMdbUTC = ( actDate.capturedUTC ) ? actDate.capturedUTC : Util.formatDate( ( new Date() ).toUTCString(), 'yyyyMMdd_HHmmssSSS' );
        clientDate.updatedOnMdbUTC = clientDate.createdOnMdbUTC;
    }
    catch( errMsg )
    {
        console.log( 'ERROR in ClientDataManager.dateConvertFromActivityDate, errMsg: ' + errMsg );
    }

    return clientDate;
};


ClientDataManager.getDateStr_LastUpdated = function( clientJson )
{
    var dateStr = '';

    if ( clientJson && clientJson.date )
    {
        // NOTE: Temporary fix while we resolve 'updatedUTC' vs 'updatedOnMdbUTC' for client date 
        if ( clientJson.date.updatedOnMdbUTC ) dateStr = clientJson.date.updatedOnMdbUTC;
        else if ( clientJson.date.updatedUTC ) dateStr = clientJson.date.updatedUTC;
    }

    return dateStr;
};


// ===============================================
// === Others ====

ClientDataManager.getClientsByVoucherCode = function( voucherCode, opt_TransType, opt_bGetOnlyOnce )
{
    var clients = [];
    var matchActivities = ActivityDataManager.getActivitiesByVoucherCode( voucherCode, opt_TransType, opt_bGetOnlyOnce );

    matchActivities.forEach( activity => {
        clients.push( ClientDataManager.getClientByActivity( activity ) );
    });

    return clients;
};


// ===============================================
// === Sample Data Generate / Delete Related ====

ClientDataManager.removeSampleData = function( callBack )
{
    var removedCount = 0;

    var clientIdList = ClientDataManager.getClientIdCopyList();

    clientIdList.forEach( clientId => 
    {
        var client = ClientDataManager.getClientById( clientId );

        if ( client )
        {
            if ( ClientDataManager.isSampleData( client ) )
            {
                ClientDataManager.removeClient( client );
                removedCount++;    
            }    
        }
    });

    ClientDataManager.saveCurrent_ClientsStore( () => {
        if ( callBack ) callBack( removedCount );
    } );
};

ClientDataManager.isSampleData = function( client )
{
    return ( client && client.clientDetails && client.clientDetails.autoGenerated === true );
}

// create load data method..  
ClientDataManager.loadSampleData = function( icount, sampleDataTemplate, callBack ) 
{
    var loops = ( icount ? icount : 1 );
    var rndNames = 'Vickey Simpson,Yuri Youngquist,Sherice Sharma,Ariane Albert,Heather Locklear,Taunya Tubb,Lawanda Lord,Quentin Quesenberry,Terrance Tennyson,Rosaria Romberger,Joann Julius,Doyle Dunker,Carolina Casterline,Sherly Shupe,Dorris Degner,Xuan Xu,Mercedez Matheney,Jacque Jamerson,Lillian Lefler,Derek Deegan,Berenice Barboza,Charlene Marriot,Mariam Malott,Cyndy Carrozza,Shaquana Smith,Kendall Kitterman,Reagan Riehle,Mittie Maez,Carry Carstarphen,Nelida Nakano,Christoper Compo,Sadie Shedd,Coleen Samsonite,Estella Eutsler,Pamula Pannone,Keenan Kerber,Tyisha Tisdale,Ashlyn Aguirre,Ashlie Albritton,Willy Wonka,Diann Yowzer,Asha Carpenter,Devin Dashiell,Arvilla Alers,Sheba Sherron,Richard Racca,Elba Early,Coretta Cossey,Brande Bushnell,Larraine Samsung,Pilar Varillas,Gaspar Hernandez,Greg Rowles,James Chang,Bruno Raimbault,Rodolfo Melia,Chris Purdy,Martin Dale,Sam Sox,Joe Soap,Joan Sope,Marty McFly';
    var rndMethod =  'Pills,Injection,Implant,IUD,None,Condom,Other';

    for ( var i = 0; i < loops; i++ )
    {
        var tmp = JSON.stringify( sampleDataTemplate );
        var actType = FormUtil.getActivityTypes()[ Util.generateRandomNumberRange(0, FormUtil.getActivityTypes().length-1).toFixed(0) ].name;
        var status = Configs.statusOptions[ Util.generateRandomNumberRange(0, Configs.statusOptions.length-1).toFixed(0) ].name;
        var shrtDate = new Date();
        var recDate = new Date( shrtDate.setDate( shrtDate.getDate() - ( Util.generateRandomNumberRange(0,10 ) ) ) );
        var earlierDate = new Date( recDate.setDate( recDate.getDate() - ( Util.generateRandomNumberRange(0,60 ) ) ) );
        var myFirst = Util.getRandomWord( rndNames, i ).trim().split(' ')[0];
        var myLast = Util.getRandomWord( rndNames, i ).trim().split(' ')[1];
        var method = Util.getRandomWord( rndMethod, i );

        tmp = tmp.replace( /{ACTIVITY_TYPE}/g, actType );
        tmp = tmp.replace( /{PROGRAM}/g, actType.split('-')[0] );
        tmp = tmp.replace( /{STATUS}/g, status );

        tmp = tmp.replace( /{SHORTDATE}/g, shrtDate.toISOString().split( 'T')[0].replace(/-/g,'') );
        tmp = tmp.replace( /{RECENT_SHORTDATE}/g, recDate.toISOString().split( 'T')[0] );
        tmp = tmp.replace( /{EARLIER_SHORTDATE}/g, earlierDate.toISOString().split( 'T')[0] );
        tmp = tmp.replace( /{TIME}/g, new Date().toISOString().split( 'T')[1].replace(/:/g,'').replace('.','').replace('Z','') );
        tmp = tmp.replace( /{USERNAME}/g, SessionManager.sessionData.login_UserName );
        tmp = tmp.replace( /{8DIGITS}/g, Util.generateRandomNumber(8) );
        tmp = tmp.replace( /{10DIGITS}/g, Util.generateRandomNumber(10) );
        tmp = tmp.replace( /{10RNDCHARS}/g, Util.generateRandomId().substring( 0, 10 ) );
        tmp = tmp.replace( /{AGE}/g, Util.generateRandomNumberRange( i, (50+i) ).toFixed(0) );
        tmp = tmp.replace( /{FIRSTNAME}/g, myFirst );
        tmp = tmp.replace( /{LASTNAME}/g, myLast );
        tmp = tmp.replace( /{METHOD}/g, method );
        

        new Date().toISOString().split( 'T')[0].replace(/-/g,'')
        //console.customLog( ' ~ type: ' + actType + ' ( ' + status + ' ) ', recDate, earlierDate );
    
        ClientDataManager.insertClients( JSON.parse( tmp ) );
    }

    ClientDataManager.saveCurrent_ClientsStore( () => {
        if ( callBack ) callBack();
    });
};

// ------------------------------------------------
// ---- Get Client Id copied list - Used to delete or loop data without being affected by change data.

ClientDataManager.getClientIdCopyList = function()
{
    var clientIdList = [];

    var clientList = ClientDataManager.getClientList();

    clientList.forEach( client => {
        if ( client._id ) clientIdList.push( client._id );
    });

    return clientIdList;
};


ClientDataManager.getClientIdCopyList = function()
{
    var clientIdList = [];

    var clientList = ClientDataManager.getClientList();

    clientList.forEach( client => {
        if ( client._id ) clientIdList.push( client._id );
    });

    return clientIdList;
};

// ----------------------------------------

ClientDataManager.setActivityDateLocal_clientList = function( clientList )
{
    if ( clientList )
    {
        clientList.forEach( client => 
        {
            if ( client.activities ) 
            {
                client.activities.forEach( activity => {
                    ActivityDataManager.setActivityDateLocal( activity );
                });
            }
        });
    }
};

ClientDataManager.setActivityDateLocal_client = function( client )
{
    if ( client ) ClientDataManager.setActivityDateLocal_clientList( [ client ] );
};

ClientDataManager.setActivityDateLocal_clientsAll = function()
{
    ClientDataManager.setActivityDateLocal_clientList( ClientDataManager.getClientList() );
};


// ----------------------------------------


ClientDataManager.getLastVoucherData = function( client )
{
    var lastVoucherData;
    
    var voucherDataList = ClientDataManager.getVoucherDataList( client );

    if ( voucherDataList.length > 0 )
    {
        lastVoucherData = voucherDataList[ voucherDataList.length - 1 ];
    }

    return lastVoucherData;
};


ClientDataManager.getVoucherDataList = function( client )
{
    var voucherDataList = [];
    
    if ( client && client.clientDetails )
    {
        var voucherCodes = [];
        var clientDetails = client.clientDetails;

        if ( clientDetails.voucherCodes && Util.isTypeArray( clientDetails.voucherCodes ) ) voucherCodes = clientDetails.voucherCodes;
        else if ( clientDetails.voucherCode && Util.isTypeArray( clientDetails.voucherCode ) ) voucherCodes = clientDetails.voucherCode;
        else if ( clientDetails.voucherCode && Util.isTypeString( clientDetails.voucherCode ) ) voucherCodes.push( clientDetails.voucherCode );
    
        if ( voucherCodes.length > 0 )
        {
            // 1. Organize data by voucherCode ->  { voucherCode, createdDateStr, activities([]) }
            voucherCodes.forEach( voucherCode => 
            {
                voucherDataList.push( ActivityDataManager.getVoucherActivitiesData( client.activities, voucherCode ) );
            });

            // 2. Sort by 'createdDateStr' in ascending order
            voucherDataList.sort( function(a, b) { 
                    return ( a.createdDateStr >= b.createdDateStr ) ? 1: -1; 
                } 
            );
        }
    }

    return voucherDataList;
};


ClientDataManager.isVoucherNotUsed = function( voucherData )
{
    var usedTrans = voucherData.transList.filter( trans => trans.type && trans.type.indexOf( 'v_rdx' ) === 0 );
    return ( usedTrans.length === 0 );
};

ClientDataManager.getClientListByFields = function( inputJson )
{
    var matchedList = [];

	if ( inputJson )
	{
        var clientList = ClientDataManager.getClientList();

        clientList.forEach( client => 
        {
            if ( Util.compareJsonPropVal( inputJson, client.clientDetails ) )
            {
                matchedList.push( client );
            }
        });
	}

    return matchedList;
};
