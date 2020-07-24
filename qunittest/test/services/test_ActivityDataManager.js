

QUnit.test('Test ActivityDataManager - generateActivityPayloadJson', function( assert ){
    
    var formsJsonActivityPayload = {
        "payload" : {
            "captureValues" : {
                "processing":  [ "searchValues" ]
            },
            "searchValues": []
        } 
    }

    var activityJson = ActivityDataManager.generateActivityPayloadJson( "www.tes_turl.com", formsJsonActivityPayload );

    assert.equal( !jQuery.isEmptyObject( activityJson ), true, "generateActivityPayloadJson runs successfully !!!" );
});


QUnit.test('Test ActivityDataManager - createNewPayloadActivity', function( assert ){
    
    var done = assert.async();

    var formsJsonActivityPayload = {
        "payload" : {
            "captureValues" : {
                "processing":  [ "searchValues" ]
            },
            "searchValues": []
        } 
    }

    ActivityDataManager.createNewPayloadActivity( "www.tes_turl.com", formsJsonActivityPayload, function(){

        assert.equal( !jQuery.isEmptyObject( ClientDataManager._clientsStore ), true, "createNewPayloadActivity runs successfully !!!" );
        done();
    } );

});


QUnit.test('Test ActivityDataManager - activityPayload_ConvertForWsSubmit', function( assert ){
    
    var _ver = '1.2.1-rc.2';
    var activityJson = {
        "processing" : {
            "searchValues" : []
        }
    }

    var payloadJson = ActivityDataManager.activityPayload_ConvertForWsSubmit( activityJson, _ver );

    assert.equal( JSON.stringify( payloadJson.payload.searchValues ) == JSON.stringify( activityJson.processing.searchValues ), true, "activityPayload_ConvertForWsSubmit runs successfully !!!" );

});


QUnit.test('Test ActivityDataManager - createProcessingInfo_Success', function( assert ){
    
    var processingInfo = ActivityDataManager.createProcessingInfo_Success( "success", "Success message !!!" );
    assert.equal( processingInfo.status == "success" 
        && processingInfo.history[0].msg == "Success message !!!" , true, "createProcessingInfo_Success runs successfully !!!" );
});


 
QUnit.test('Test ActivityDataManager - createProcessingInfo_Other', function( assert ){
    
    var processingInfo = ActivityDataManager.createProcessingInfo_Other( "success", 200, "Success message !!!" );
    assert.equal( processingInfo.status == "success" 
        && processingInfo.history[0].msg == "Success message !!!" 
        && processingInfo.history[0].responseCode == 200, true, "createProcessingInfo_Other runs successfully !!!" );
});

 
QUnit.test('Test ActivityDataManager - getCombinedTrans', function( assert ){
    
    var activityJson = {
        "id": "activityId2",
        "date" : {
          "createdOnDeviceUTC" : true
        },
        "transactions" : [
          {
            "dataValues" : {
                "key_a": "a" ,
                "key_b": "b"
            },
            "clientDetails" : {
                "key_c": "c",
                "key_d": "d"
            }
          }
      ]
    };

    var jsonCombined = ActivityDataManager.getCombinedTrans( activityJson );
    assert.equal( jsonCombined.key_a == "a" && jsonCombined.key_b == "b" 
        && jsonCombined.key_c == "c" && jsonCombined.key_d == "d"  , true, "getCombinedTrans runs successfully !!!" );
});


QUnit.test('Test ActivityDataManager - regenActivityList_NIndexes', function( assert ){

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
                "date" : {
                    "createdOnDeviceUTC" : true
                },
                "transactions" : [
                    {
                    "dataValues" : [],
                    "clientDetails" : []
                    }
                ]}
            ],
            "_id": "_id1",
            "updated": "2020-05-17T02:12:35.170"
            }
        ]
    }

    ClientDataManager._clientsStore = clientList;

    ActivityDataManager.regenActivityList_NIndexes();

    
    assert.equal( ActivityDataManager._activityList.length == 1, true, "regenActivityList_NIndexes runs successfully !!!" );
});




QUnit.test('Test ActivityDataManager - getActivityList', function( assert ){

    ActivityDataManager._activityList = [{
        "id": "activityId1",
        "date" : {
          "createdOnDeviceUTC" : "2010-07-06"
        }
      },
      {
        "id": "activityId2",
        "date" : {
          "createdOnDeviceUTC" : "2010-07-08"
        }
      }];

    var list = ActivityDataManager.getActivityList();

    
    assert.equal( list.length, 2, "getActivityList runs successfully !!!" );
});


QUnit.test('Test ActivityDataManager - getActivityItem', function( assert ){

    ActivityDataManager._activityList = [{
        "id": "activityId1",
        "status" : "failed",
        "date" : {
          "createdOnDeviceUTC" : "2010-07-06"
        }
      },
      {
        "id": "activityId2",
        "status" : "success",
        "date" : {
          "createdOnDeviceUTC" : "2010-07-08"
        }
    }];

    var item = ActivityDataManager.getActivityItem( "status", "success" );
    
    assert.equal( item.id == "activityId2" && item.date.createdOnDeviceUTC == "2010-07-08", true, "getActivityItem runs successfully !!!" );
});


QUnit.test('Test ActivityDataManager - getActivityById', function( assert ){

    ActivityDataManager._activityList = [{
        "id": "activityId1",
        "date" : {
          "createdOnDeviceUTC" : "2010-07-06"
        }
      },
      {
        "id": "activityId2",
        "date" : {
          "createdOnDeviceUTC" : "2010-07-08"
        }
    }];

    var item = ActivityDataManager.getActivityById( "activityId2" );
    
    assert.equal( item.id == "activityId2" && item.date.createdOnDeviceUTC == "2010-07-08", true, "getActivityById runs successfully !!!" );
});


QUnit.test('Test ActivityDataManager - removeActivityNClientById', function( assert ){

    ActivityDataManager._activityList = [{
        "id": "activityId1",
        "date" : {
          "createdOnDeviceUTC" : "2010-07-06"
        }
      },
      {
        "id": "activityId2",
        "date" : {
          "createdOnDeviceUTC" : "2010-07-08"
        }
    }];

    ActivityDataManager._activityToClient = {
        "activityId1": {
            "_id" : "_id1",
            "id": "id2",
            "clientDetails": {
                "firstName": "Test2",
                "lastName": "Last2"
            },
            "activities": [{
                "id": "activityId1"
            }]
        },
        "activityId2": {
            "_id" : "_id2",
            "id": "id2",
            "clientDetails": {
                "firstName": "Test2",
                "lastName": "Last2"
            },
            "activities": [{
                "id": "activityId2"
            }]
        }
    }

    ClientDataManager.payloadClientNameStart = "_id1";
    ActivityDataManager.removeActivityNClientById( "activityId1" );
    
    assert.equal( ActivityDataManager._activityList.length == 1 && ActivityDataManager._activityList[0].id == "activityId2", true, "removeActivityNClientById runs successfully !!!" );
});

