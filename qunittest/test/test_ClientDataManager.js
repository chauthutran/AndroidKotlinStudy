
var clientDataManager_Username = "TestClientDataManager_Username";

var clientList = {
  "list" : [
    {
      "id": "id1",
      "clientDetails": {
        "firstName": "Test1",
        "lastName": "Last1"
      },
      "activities": [{
        "id": "activityId1",
        "activityDate" : {
          "createdOnDeviceUTC" : "2010-07-06"
        },
        "transactions" : [
          {
            "dataValues" : [],
            "clientDetails" : []
          }
        ]
      },
      {
        "id": "activityId3",
        "activityDate" : {
          "createdOnMdbUTC" : "2010-07-07"
        }
      }],
      "_id": "_id1",
      "updated": "2020-05-17T02:12:35.170"
    }
  ]
}


var clientData = {
    "id": "id2",
    "updated": "2020-05-20T02:12:35.170",
    "_id": "_id2",
    "clientDetails": {
      "firstName": "Test2",
      "lastName": "Last2"
    },
    "activities": [{
      "id": "activityId2",
      "activityDate" : {
        "createdOnDeviceUTC" : "2010-07-06"
      }
  },
  {
    "id": "activityId4",
    "activityDate" : {
      "createdOnMdbUTC" : "2010-07-05"
    }
  }]
}

QUnit.asyncTest('Test ClientDataManager - loadClientsStore_FromStorage, saveCurrent_ClientsStore and getClientItem', function( assert ){
  
  expect(2);

  ClientDataManager._clientsStore = JSON.parse( JSON.stringify(  clientList ));
  SessionManager.sessionData.login_UserName = Db_Username;

  ClientDataManager.saveCurrent_ClientsStore( function(){

    var searched = ClientDataManager.getClientItem( "id", "id1" );
    assert.equal( searched.clientDetails.firstName == "Test1", true, "Saved and Get client successfully !!!");

    ClientDataManager.loadClientsStore_FromStorage( function( clientList ){

      assert.equal( clientList.list.length == 1, true, "Loaded clients successfully !!!");

      QUnit.start();

    });
  });

});


QUnit.asyncTest('Test ClientDataManager - insertClient, removeClient and getClientByActivityId', function( assert ){
  
  expect(3);
  var data =  JSON.parse( JSON.stringify( clientData ) );
  ClientDataManager.insertClient( data );

  var searched = ClientDataManager.getClientById( "_id2");
  assert.equal( searched.id == "id2", true, "Insert client and Get clientById successfully !!!");

  searched = ClientDataManager.getClientByActivityId( "activityId2" );
  assert.equal( searched.id == "id2", true, "Get ClientByActivityId successfully !!!");
  

  ClientDataManager.removeClient( data );
  var searched = ClientDataManager.getClientById( "id2");
  assert.equal( searched == undefined, true, "Remove client successfully !!!");


  QUnit.start();
});



QUnit.asyncTest('Test ClientDataManager - regenClientIndex and removeClientIndex', function( assert ){
  
  expect(2);
  ClientDataManager._clientsStore = JSON.parse( JSON.stringify(  clientList ));;
  ClientDataManager.regenClientIndex();

  var searched = ClientDataManager.getClientById( "_id1");
  assert.equal( searched !== undefined, true, "regenClientIndex runs successfully !!!");

  ClientDataManager.removeClientIndex( {"id": "id1"} );
  var searched = ClientDataManager.getClientById( "id1");
  assert.equal( searched == undefined, true, "Remove ClientIndex successfully !!!");

  
  QUnit.start();
});


QUnit.asyncTest('Test ClientDataManager - createActivityPayloadClient', function( assert ){
  
  expect(2);

  var activityId = "activityId3";
  var clientId = "client_" + activityId;
  ClientDataManager._clientsStore = JSON.parse( JSON.stringify(  clientList ));;

  ClientDataManager.payloadClientNameStart = "client_";
  ClientDataManager.createActivityPayloadClient( { "id": activityId } );

  var searched = ClientDataManager.getClientById( clientId );
  assert.equal( searched._id, clientId, "createActivityPayloadClient runs successfully !!!");

  ClientDataManager.removeClientIndex( {"_id": clientId } );
  searched = ClientDataManager.getClientById( clientId );
  assert.equal( searched == undefined, true, "Remove ClientIndex successfully !!!");

  
  QUnit.start();
});


QUnit.asyncTest('Test ClientDataManager - mergeDownloadedClients - Update cases', function( assert ){

  expect(1);

  var data = JSON.parse( JSON.stringify( clientData ) );
  data.updated = "2020-05-18T02:12:35.170";
  data.clientDetails.firstName = "Test2_1";
  data.activities[0].id = "new_activityId";

  var listData = JSON.parse( JSON.stringify(  clientList )); 
  listData.list.push( data );
  ClientDataManager._clientsStore = listData;

  var mongoClients = [];
  mongoClients[0] = clientData;



  ClientDataManager.mergeDownloadedClients( mongoClients, { "statusRead": true, "status" : "sync", "history":[] } , function(){
    var searched = ClientDataManager.getClientItem( "id", "id2" );
    assert.equal( searched.activities[0].id == "new_activityId", true, "mergeDownloadedClients successfully !!!");
    
    QUnit.start();
  });

});



QUnit.asyncTest('Test ClientDataManager - mergeDownloadedClients  - Add new cases', function( assert ){

  expect(1);
  ClientDataManager._clientsStore = JSON.parse( JSON.stringify( clientList ));

  var mongoClients = [];
  mongoClients[0] = clientData;
  
  
  ClientDataManager.mergeDownloadedClients( mongoClients, { "statusRead": true, "status" : "sync", "history":[] } , function(){
    assert.equal( ClientDataManager.getClientList().length, 2, "mergeDownloadedClients successfully !!!");
    
    QUnit.start();
  });

});



QUnit.test('Test ClientDataManager - clientsActivities_AddProcessingInfo', function( assert ){

  var data = JSON.parse( JSON.stringify( clientData ) );

  var clientList = [];
  clientList.push( data );

  ClientDataManager.clientsActivities_AddProcessingInfo( clientList, { "statusRead": true, "status" : "sync", "history":[] });

  assert.equal(1,1, "clientsActivities_AddProcessingInfo run successfylly !!!" );
});

