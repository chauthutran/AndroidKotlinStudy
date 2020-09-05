cleanAll();

QUnit.test('Test AppInfoManager - Init, Save and Get data', function( assert ){
    
    AppInfoManager.initialLoad_FromStorage();
    var data = AppInfoManager.data;
    assert.equal( JSON.stringify( data ) == "{}", true, "Init empty data successfully !!!" );
    
    var keyword = "key_TestAppInfoManager";
    var jsonData = {
        "name": "Name1",
        "code" : "Code1"
    };
    
    // Update and get data
    AppInfoManager.updateData( keyword, jsonData );
    data = AppInfoManager.getData( keyword );
    assert.equal( data.name, "Name1", "Saved and retrieved data successully !!!" );

    AppInfoManager.initialLoad_FromStorage();
    data = AppInfoManager.getData( keyword );
    assert.equal( data.name, "Name1", "Data is loaded by using db successfully !!!" );

    // Remove data
    AppInfoManager.removeData( keyword );
    var loadedData = AppInfoManager.getData( keyword );
    assert.equal( loadedData, undefined, "Removed data successully !!!" );
});



QUnit.test('Test AppInfoManager - updateUserInfo, getUserInfo and removeUserInfo', function( assert ){
    AppInfoManager.updateUserInfo( {"user": "username_test"} );

    var data = AppInfoManager.getUserInfo();
    assert.equal( data.user, "username_test", "Update and get userInfo successfully !!!" );

    AppInfoManager.removeUserInfo();
    var data = AppInfoManager.getUserInfo();
    assert.equal( data == undefined, true, "Update and get userInfo successfully !!!" );

});


QUnit.test('Test AppInfoManager - updateLangTerms and getLangTerms', function( assert ){
    AppInfoManager.updateLangTerms( { "test": "testVal" } );

    var data = AppInfoManager.getLangTerms();
    assert.equal( data.test, "testVal", "Update and get LangTerms successfully !!!" );
    
});


QUnit.test('Test AppInfoManager - updateNetworkSync and getNetworkSync', function( assert ){
    AppInfoManager.updateNetworkSync( "testVal" );

    var data = AppInfoManager.getNetworkSync();
    assert.equal( data, "testVal", "Update and get NetworkSync successfully !!!" );
});


QUnit.test('Test AppInfoManager - updateLanguage', function( assert ){
    AppInfoManager.updateLanguage( "testVal" );

    var data = AppInfoManager.getUserInfo();
    assert.equal( data[AppInfoManager.KEY_LANGUAGE], "testVal", "Update Language successfully !!!" );
});


QUnit.test('Test AppInfoManager - getLangCode', function( assert ){
    var jsonData = {
        "language": "en"
    };
    
    // Update and get data
    AppInfoManager.updateUserInfo( jsonData );
    data = AppInfoManager.getLangCode();
    assert.equal( data, "en", "Get LangCode successully !!!" );
});


QUnit.test('Test AppInfoManager - createUpdateUserInfo', function( assert ){
    
    // Update and get data
    AppInfoManager.createUpdateUserInfo( "username_test" );

    data = AppInfoManager.getUserInfo();
    assert.equal( data.user, "username_test", "createUpdateUserInfo runs successully !!!" );
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
