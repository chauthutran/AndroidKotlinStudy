cleanAll();


QUnit.test('Test AppInfoManager - Init, Save and Get data', function( assert ){
    
    AppInfoManager.initialLoad_FromStorage();
    var data = AppInfoManager.data;

    assert.equal( JSON.stringify( data.translation ) == "{}" 
                    && JSON.stringify( data.sync ) == "{}" 
                    && JSON.stringify( data.logInOut ) == "{}", true, "Init empty data successfully !!!" );
    
    var jsonData = {
        "translation": {
            "langCode": "en"
        },
        "sync": {
            "syncLastDownloaded": "2020-09-17T04:14:27.699Z"
        },
        "userInfo": {
            "user": "TEST_ACCOUNT"
        }
    }
    
    // Update and get data
    AppInfoManager.updateData( AppInfoManager.KEY_APPINFO, jsonData );
    data = AppInfoManager.getData( AppInfoManager.KEY_APPINFO );
    assert.equal( data.translation.langCode == "en" 
                    && data.sync.syncLastDownloaded == "2020-09-17T04:14:27.699Z" 
                    && data.userInfo.user == "TEST_ACCOUNT", true, "Saved and retrieved data successully !!!" );

    AppInfoManager.initialLoad_FromStorage();
    data = AppInfoManager.getData( AppInfoManager.KEY_APPINFO );
    assert.equal( data.translation.langCode == "en" 
                    && data.sync.syncLastDownloaded == "2020-09-17T04:14:27.699Z" 
                    && data.userInfo.user == "TEST_ACCOUNT", true, "Data is loaded by using db successfully !!!" );

    // Remove data
    AppInfoManager.removeData( AppInfoManager.KEY_APPINFO );
    var loadedData = AppInfoManager.getData( AppInfoManager.KEY_APPINFO );
    assert.equal( loadedData, undefined, "Removed data successully !!!" );
});



QUnit.test('Test AppInfoManager - updatePropertyValue and getPropertyValue', function( assert ){
    
    var mainKey = "key1";
    var subKey = "subKey1";

    // Update data
    AppInfoManager.updatePropertyValue( mainKey, subKey, {"test" : "testVal"}  );

    
    // Get data with WORNG keyword
    var data = AppInfoManager.getPropertyValue( "key2" );
    assert.equal( data, undefined, "Retried value with WRONG keyword is returned a undefined value !!!" );

    // Get data with proper keyword
    var data = AppInfoManager.getPropertyValue(mainKey, subKey );
    assert.equal( data.test, "testVal", "updatePropertyValue and getPropertyValue run successully !!!" );
});


QUnit.test('Test AppInfoManager - createUpdateUserInfo, getUserInfo, updateUserInfo and removeUserInfo', function( assert ){
    
    // Update and get data
    AppInfoManager.createUpdateUserInfo( "username_test1" );


    var data = AppInfoManager.getUserInfo();
    assert.equal( data.user, "username_test1", "createUpdateUserInfo runs successully !!!" );


    AppInfoManager.updateUserInfo( {"user" : "username_test2"});
    data = AppInfoManager.getUserInfo();
    assert.equal( data.user, "username_test2", "updateUserInfo runs successully !!!" );

    
    AppInfoManager.removeUserInfo();
    data = AppInfoManager.getUserInfo();
    assert.equal( data, undefined, "removeUserInfo runs successully !!!" );
});


QUnit.test('Test AppInfoManager - updateLangTerms and getLangTerms', function( assert ){
    AppInfoManager.updateLangTerms( { "test": "testVal" } );

    var data = AppInfoManager.getLangTerms();
    assert.equal( data.test, "testVal", "Update and get LangTerms successfully !!!" );
    
});


QUnit.test('Test AppInfoManager - setLangCode and getLangCode', function( assert ){
    
    // Update and get data
    AppInfoManager.setLangCode( "en" );
    var langCode = AppInfoManager.getLangCode();
    assert.equal( langCode, "en", "Get LangCode successully !!!" );
});



QUnit.test('Test AppInfoManager - setLangLastDateTime and getLangLastDateTime', function( assert ){
    
    var date = new Date("2020-01-01T00:00:00");
    
    // Update and get data
    AppInfoManager.setLangLastDateTime( date );
    data = AppInfoManager.getLangLastDateTime();
    assert.equal( data, "2020-01-01T00:00:00.000", "Get LangLastDateTime successully !!!" );
});


QUnit.test('Test AppInfoManager - updateSyncLastDownloadInfo and getSyncLastDownloadInfo', function( assert ){
    
    var date = new Date("2020-01-01T00:00:00");
    
    // Update and get data
    AppInfoManager.updateSyncLastDownloadInfo( date );
    data = AppInfoManager.getSyncLastDownloadInfo();
    assert.equal( data.getTime(), date.getTime(), "Get SyncLastDownloadInfo successully !!!" );
});



QUnit.test('Test AppInfoManager - updateNetworkSync and getNetworkSync', function( assert ){
    AppInfoManager.updateNetworkSync( "testVal" );

    var data = AppInfoManager.getNetworkSync();
    assert.equal( data, "testVal", "Update and get NetworkSync successfully !!!" );
});



QUnit.test('Test AppInfoManager - updateStatisticPages and getStatisticPages', function( assert ){

    AppInfoManager.updateStatisticPages( "statisticPages","testFileName" );

    var data = AppInfoManager.getStatisticPages("statisticPages");
    assert.equal( data, "testFileName", "Update and get StatisticPages successfully !!!" );
});

