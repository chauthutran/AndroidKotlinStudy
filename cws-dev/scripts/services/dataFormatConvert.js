// =========================================
// -------------------------------------------------
//     DataFormatConvert
//          - Exchange data format between PWA acitivityItem vs MongoDB client Json.
//
// -- Pseudo WriteUp:   Create Pseudo Codes with Flow of App (High Level --> to Lower Level)

function DataFormatConvert()  {};

DataFormatConvert.templateActivityItem = {
    "title": "", //"Voucher: 82092643 - 2020-02-04 21:41:35.00",
    "created": "", // "2020-02-04 21:41:35.00",
    "owner": "", //FormUtil.login_UserName; "DV_TEST_IPC",  <-- WHY NEED THIS?
    "activityType": "", //"FPL-FU",
    "id": "", //"567565045236", 
    "status": "downloaded", //queued", ← ‘downloaded’ for sync down case.
    "queueStatus": "downloaded", //"queued", [x]
    "network": false, // [x]
    "networkAttempt": 0, // [x]
    "history": [],
    "syncActionStarted": 0, // [x]   
    "data": {
        "payloadJson": {
            "searchValues": {
                "_id": ""
            },
            "captureValues": {                
            }
        }
    },
    "url": "", // [x]  <-- This should use the one in 'actionJson'.  Should decide the server only when running... depends on environment..
    "actionJson": {}  // <-- We do not have this..  Need to get it from config...  <-- how?  Need location?

        // In PWA, we do 'redeem' or 'issuing'...  & has action sequence...
        // We do not need to do this for 'downloaded' ones...
        //  <-- 'Downloaded' ones only get applied to analytics..
        //      + display in the activityItem list..
        //      For 'appointments' type, we can have actionDefinition in Config... <-- How to handle it?
        // ===> For 'appointments', it gets opened as a blockForm (definitions found in config...) <-- new Activity Id?

        // 'Client' --> Let's save it on other indexedDB..
};
  

// ===================================================
// === MAIN 2 FEATURES =============

// 1. Downloaded monogoDB Client list --> PWA ActivityItem List
DataFormatConvert.convertToActivityItems = function( mongoClients, callBack )
{
    var activityItems = [];

    try
    {
        var clientList = DataFormatConvert.getMongo_ClientList( mongoClients );

        for( var i = 0; i < clientList.length; i++ )
        {
            Util.mergeArrays( activityItems, DataFormatConvert.generatedActivityItems( clientList[ i ] ) );
        }

        callBack( activityItems );
    }
    catch( errMsg )
    {
        // NOTE: Even with error, we want to return with 'callBack' since we want next item to continue if multiple run case.
        console.log( 'Error happened during DataFormatConvert.convertToActivityItems - ' + errMsg );
        callBack( activityItems );
    }
};


// ===================================================
// === 1 Related Methods =============


DataFormatConvert.getMongo_ClientList = function( mongoClients )
{
    var clientList = [];

    if ( mongoClients )
    {
        if ( mongoClients.response && mongoClients.response.dataList )
        {
            clientList = mongoClients.response.dataList;
        } 
    }

    return clientList;
};

DataFormatConvert.generatedActivityItems = function( clientJson )
{
    var activityItems = [];

    if ( clientJson.activities )
    {
        var mongoActivities = clientJson.activities;

        for( var i = 0; i < mongoActivities.length; i++ )
        {
            var mongoActivityJson = mongoActivities[ i ];

            var activityItem = DataFormatConvert.generatedActivityItem( mongoActivityJson, clientJson._id );

            if ( activityItem ) activityItems.push( activityItem );
        }
    }

    return activityItems;
};

DataFormatConvert.generatedActivityItem = function( mongoActivityJson, mongoClientId )
{
    var activityItem = Util.getJsonDeepCopy( DataFormatConvert.templateActivityItem );

    try
    {
        // Reference PWA Generation - blockList.redeemList_Add()
        //      <-- NEED to share the logic

        activityItem.title = "DW - Voucher: ----";
        activityItem.created = mongoActivityJson.activityDate.capturedLoc;
        activityItem.owner = FormUtil.login_UserName;  // Do not need this saved in JSON!!
        activityItem.activityType = mongoActivityJson.activityType;  // <-- Diff between Mongo vs PWA?
        activityItem.id = mongoActivityJson.activityId //Util.generateRandomId();
        // activityItem.status = Constants.status_downloaded;  // Need to change as static..
        // activityItem.queueStatus = Constants.status_downloaded;  // Need to change as static..
        var payloadJson = activityItem.data.payloadJson;
        payloadJson.searchValues._id = mongoClientId;   // Downloaded ones are searched by client mongoDB id
        payloadJson.captureValues = mongoActivityJson;
    
        // data.url & data.actionJson is omitted for 'downloaded' one.
    }
    catch( errMsg )
    {
        console.log( 'Error in DataFormatConvert.generatedActivityItem, errMsg + ' + errMsg );
    }

    return activityItem;
};

// ===================================================
// === OTHERS Methods =============
