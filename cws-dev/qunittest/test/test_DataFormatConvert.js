

// QUnit.asyncTest('Test ClientDataManager - convertToActivityItems', function( assert ){
  
//     expect(1);

//     var mongoClientsJson = {
//             "dateRange_gtStr" : {
//                 "id": "id2",
//                 "updated": "2020-05-20T02:12:35.170",
//                 "_id": "_id2",
//                 "clientDetails": {
//                 "firstName": "Test2",
//                 "lastName": "Last2"
//                 },
//                 "activities": [{
//                 "activityId": "activityId2",
//                 "activityDate" : {
//                     "createdOnDeviceUTC" : true
//                 },
//                 "transactions" : [
//                     {
//                     "dataValues" : [],
//                     "clientDetails" : []
//                     }
//                 ]
//             }]
//         }
        
//     }
  
//     DataFormatConvert.convertToActivityItems( mongoClientsJson, function(){
//         assert.equal( clientList.list.length == 1, true, "convertToActivityItems runs successfully !!!");

//         QUnit.start();
//     } )
   
  
//   });
  
  
  
// QUnit.asyncTest('Test ClientDataManager - getMongo_ClientList', function( assert ){

//     var mongoClients = {
//         "response" : {
//             "dataList" : [ {
//                 "id": "id1",
//                 "clientDetails": {
//                   "firstName": "Test1",
//                   "lastName": "Last1"
//                 },
//                 "activities": []
//             } ]
//         }
//     }

//     var clientList = DataFormatConvert.getMongo_ClientList( mongoClients );

//     assert.equal( clientList.list.length == 1, true, "getMongo_ClientList runs successfully !!!");
  
// });



  
// QUnit.asyncTest('Test ClientDataManager - generatedActivityItems', function( assert ){

    
//     var clientData = {
//         "id": "id2",
//         "updated": "2020-05-20T02:12:35.170",
//         "_id": "_id2",
//         "clientDetails": {
//         "firstName": "Test2",
//         "lastName": "Last2"
//         },
//         "activities": [{
//         "activityId": "activityId1",
//         "activityDate" : {
//             "createdOnDeviceUTC" : true
//         }
//     }]
//     }

//     var activityItems = DataFormatConvert.generatedActivityItems( clientData );

//     assert.equal( activityItems.length == 1, true, "generatedActivityItems runs successfully !!!");
  
// });



// QUnit.asyncTest('Test ClientDataManager - activityDateConfirm', function( assert ){

    
//     var mongoActivityJson = {
//         "activities": [{
//             "activityId": "activityId1",
//             "activityDate" : {
//                 "createdOnMdbUTC" : "2010-07-06"
//             }
//         }]
//     }

//     var dateCheck = DataFormatConvert.activityDateConfirm( "2010-07-07", mongoActivityJson );

//     assert.equal( dateCheck, true, "activityDateConfirm runs successfully !!!");
  
// });



// DataFormatConvert.activityDateConfirm = function( dateRange_gtStr, mongoActivityJson )
// {
//     // mongo Activity date (createdOnMdbUTC) has to be higher than 'dateRagne_gtStr'
//     var dateCheck = false;

//     if ( dateRange_gtStr )
//     {
//         if ( mongoActivityJson.activityDate && mongoActivityJson.activityDate.createdOnMdbUTC )
//         {
//             // Since both date string has no 'Z', we can compare
//             var searchDateObj = new Date( dateRange_gtStr );
//             var activityDateObj = new Date( mongoActivityJson.activityDate.createdOnMdbUTC );

//             if ( searchDateObj < activityDateObj ) dateCheck = true;
//         }
//     }

//     return dateCheck;
// };








// // ===================================================
// // === 1 Related Methods =============


// DataFormatConvert.generatedActivityItems = function( clientJson, dateRange_gtStr )
// {
//     var activityItems = [];

//     if ( clientJson.activities )
//     {
//         var mongoActivities = clientJson.activities;

//         for( var i = 0; i < mongoActivities.length; i++ )
//         {
//             var mongoActivityJson = mongoActivities[ i ];

//             // NOTE: Due to search also returning client data, it could hold other activities that has later date.  Filter that.
//             //if ( dateRange_gtStr && DataFormatConvert.activityDateConfirm( dateRange_gtStr, mongoActivityJson ) )
//             //{
//                 var activityItem = DataFormatConvert.generatedActivityItem( mongoActivityJson, clientJson._id );

//                 if ( activityItem ) activityItems.push( activityItem );
//             //}
//         }
//     }

//     console.log( 'activityItems' );
//     console.log( activityItems );

//     return activityItems;
// };



// DataFormatConvert.generatedActivityItem = function( mongoActivityJson, mongoClientId )
// {
//     var activityItem = Util.getJsonDeepCopy( DataFormatConvert.templateActivityItem );

//     try
//     {
//         // Reference PWA Generation - blockList.redeemList_Add()
//         //      <-- NEED to share the logic

//         activityItem.title = "DW - Voucher: ----";
//         activityItem.created = mongoActivityJson.activityDate.capturedLoc;

//         activityItem.owner = SessionManager.sessionData.login_UserName;  // Do not need this saved in JSON!!
//         activityItem.activityType = mongoActivityJson.activityType;  // <-- Diff between Mongo vs PWA?
//         activityItem.id = mongoActivityJson.activityId //Util.generateRandomId();
//         // activityItem.status = Constants.status_downloaded;  // Need to change as static..
//         // activityItem.queueStatus = Constants.status_downloaded;  // Need to change as static..
//         var payloadJson = activityItem.data.payloadJson;
//         payloadJson.searchValues._id = mongoClientId;   // Downloaded ones are searched by client mongoDB id
//         payloadJson.captureValues = mongoActivityJson;
    
//         // data.url & data.actionJson is omitted for 'downloaded' one.
//     }
//     catch( errMsg )
//     {
//         console.log( 'Error in DataFormatConvert.generatedActivityItem, errMsg + ' + errMsg );
//     }

//     return activityItem;
// };

// // ===================================================
// // === OTHERS Methods =============
