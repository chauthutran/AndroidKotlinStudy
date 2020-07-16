

var config_userName = "TestSessionManager_Username";
var config_password = "TestSessionManager_Password";
var config_loginData = {
    "dcdConfig" : dcdConfig,
    "loginStatus" : true,
    "orgUnitData" : {
        "orgUnit" :{
            "organisationUnitGroups" : [{
                "id" : "xxx"
            }]
        }
    },
    "status" : "success",
    "mySession" : {}
};

var dcdConfig = {
    "configType" : "dataCapture",
    "countryCode" : "TE",
    "areas" : {
        "offline": [{
            "startArea": true,
            "name": "Entry",
            "icon": "entry",
            "startBlockName": "testAreaOffine",
            "term": "menu_entry",
            "id": "entryOffline",
            "userRoles" : ["111"]
        }],
        "online": [{
            "navArea": {
                "displayName": true
            },
            "startArea": true,
            "name": "List",
            "icon": "list",
            "startBlockName": "testAreaOnline",
            "term": "menu_list",
            "id": "listOnline",
            "userRoles" : ["111"]
        }]
    },
    "definitionUserRoles":[
        {
            "id": "111",
            "uid" : "xxx"
        },
        {
            "id": "222",
            "uid" : "yyy"
        }
    ],
    "orgUnit": {
        "organisationUnitGroups": [{
            "name": "CwS - LA - Promoters",
            "id": "xxx"
        }]
    },
    "settings": {
        "paging": {
            "enabled": false
        },
        "redeemDefs": {
            "displaySettings": ["firstName + ' ' + lastName"],
            "statusOptions": [{
                "name": "test1",
                "label": "Test 1"
            },{
                "name": "test2",
                "label": "Test 2"
            }],
            "activityTypes": [{
                "name": "activityTypes_Test",
                "label": "activityTypes_Label"
            }]
        },
        "sync" : {
            "syncDown": {
                "enable": true,
                "syncDownPoint": "test"
            },
            "mergeCompare": {
                "dateCompareField": ["updated"]
            }
        }
        

    }
    
}

QUnit.test('Test ConfigManager - setConfigJson,  getConfigJson', function( assert ){

    ConfigManager.setConfigJson( dcdConfig );
    var data = ConfigManager.getConfigJson();
    assert.equal( data.countryCode, "TE", "Set and Get configJson successfully !!!");

    // TRAN TODO : We need a function to set some properties for dcdConfig in ConfigManager.js
    //             so that we can test resetConfigJson method
    // ConfigManager.resetConfigJson();
    // data = ConfigManager.getConfigJson();
    // assert.equal( JSON.stringify( data ), "{}", "resetConfigJson configJson successfully !!!");
});
  

QUnit.test('Test ConfigManager - clearConfigJson', function( assert ){

    ConfigManager.setConfigJson( dcdConfig );
    var data = ConfigManager.getConfigJson();
    assert.equal( data.countryCode, "TE", "Set and Get configJson successfully !!!");

    ConfigManager.clearConfigJson();
    data = ConfigManager.getConfigJson();
    assert.equal( JSON.stringify( data ), "{}", "Clear configJson successfully !!!");
});



QUnit.test('Test ConfigManager - getAreaListByStatus - userRoles is defined', function( assert ){

    SessionManager.loadDataInSession( config_userName, config_password, config_loginData );
    ConfigManager.setConfigJson( dcdConfig );

    ConfigManager.getAreaListByStatus( true, function( retAreaList ){
        assert.equal( retAreaList.length == 1 && retAreaList[0].startBlockName == "testAreaOnline", true, "Get online are successfully !!!");
    });
});


QUnit.test('Test ConfigManager - getAreaListByStatus - userRoles is undefined', function( assert ){

    SessionManager.loadDataInSession( config_userName, config_password, config_loginData );

    var testDcdConfig = JSON.parse( JSON.stringify( dcdConfig ) );
    delete testDcdConfig.areas.online[0].userRoles;
    ConfigManager.setConfigJson( testDcdConfig );

    ConfigManager.getAreaListByStatus( true, function( retAreaList ){
        assert.equal( retAreaList.length == 1 && retAreaList[0].startBlockName == "testAreaOnline", true, "Get online are successfully !!!");
    });
});


QUnit.test('Test ConfigManager - resetConfigJson', function( assert ){

    ConfigManager.configJson_Original = {"test": "testVal"};
    ConfigManager.resetConfigJson();
    
    assert.equal( ConfigManager.getConfigJson().test, "testVal", "resetConfigJson runs successfully !!!" );
});


QUnit.test('Test ConfigManager - getAllAreaList', function( assert ){

    ConfigManager.setConfigJson( dcdConfig );
    var data = ConfigManager.getAllAreaList();
    assert.equal( data.length == 2, true, "Get all areas successfully !!!");
});


QUnit.test('Test ConfigManager - getActivityDisplaySettings', function( assert ){
    
    ConfigManager.setConfigJson( dcdConfig );
    assert.equal( ConfigManager.getActivityDisplaySettings()[0], "firstName + ' ' + lastName", "Get configUserRole successfully !!!");
});


QUnit.test('Test ConfigManager - getActivitySyncUpStatusConfig', function( assert ){
    
    ConfigManager.setConfigJson( dcdConfig );

    var activityJson = { "name": "test1", "processing" : { "status" : "test1" } };
    var data = ConfigManager.getActivitySyncUpStatusConfig( activityJson );
    assert.equal( data.name == "test1" && data.label == "Test 1", true, "Get ActivitySyncUpStatusConfig successfully !!!");
});


QUnit.test('Test ConfigManager - getActivityTypeConfig', function( assert ){
    
    ConfigManager.setConfigJson( dcdConfig );

    var activityJson = { "type": "activityTypes_Test" };
    var data = ConfigManager.getActivityTypeConfig( activityJson );
    assert.equal( data.name == "activityTypes_Test" && data.label == "activityTypes_Label", true, "Get ActivityTypeConfig successfully !!!");
});


QUnit.test('Test ConfigManager - getSyncMergeDatePaths', function( assert ){
    
    ConfigManager.setConfigJson( dcdConfig );
    assert.equal( ConfigManager.getSyncMergeDatePaths()[0], "updated", "Get SyncMergeDatePaths successfully !!!");
});


QUnit.test('Test ConfigManager - getSyncDownSetting', function( assert ){
    
    ConfigManager.setConfigJson( dcdConfig );
    var syncDown = ConfigManager.getSyncDownSetting();
    assert.equal( syncDown.enable == true && syncDown.syncDownPoint == "test", true, "Get SyncDownSetting successfully !!!");
});



QUnit.test('Test ConfigManager - getSettingPaging - Paging is defined in configuration', function( assert ){
    
    ConfigManager.setConfigJson( dcdConfig );
    var pagingSetting = ConfigManager.getSettingPaging();
    assert.equal( pagingSetting.enabled, false, "Get getSettingPaging successfully !!!");
});


QUnit.test('Test ConfigManager - getSettingPaging - Paging is defined in configuration', function( assert ){
    
    
    var testDcdConfig = JSON.parse( JSON.stringify( dcdConfig ) );
    delete testDcdConfig.settings.paging;
    ConfigManager.setConfigJson( testDcdConfig );

    var pagingSetting = ConfigManager.getSettingPaging();
    assert.equal( pagingSetting.enabled == false && pagingSetting.pagingSize == 9, true, "Get default setting paging successfully !!!");
});

