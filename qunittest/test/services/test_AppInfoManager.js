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


QUnit.test('Test AppInfoManager - getSessionAutoComplete', function( assert ){
    AppInfoManager.updateUserInfo( { "autoComplete": true } );

    var autoComplete = AppInfoManager.getSessionAutoComplete();
    assert.equal( autoComplete, true, "Get SessionAutoComplete successfully !!!" );
});


QUnit.test('Test AppInfoManager - updateSWInfo and getSWInfo', function( assert ){
    AppInfoManager.updateSWInfo( { "test": "testVal" } );

    var data = AppInfoManager.getSWInfo();
    assert.equal( data.test, "testVal", "Update and get SWInfo successfully !!!" );
});


QUnit.test('Test AppInfoManager - updateLangTerms and getLangTerms', function( assert ){
    AppInfoManager.updateLangTerms( { "test": "testVal" } );

    var data = AppInfoManager.getLangTerms();
    assert.equal( data.test, "testVal", "Update and get LangTerms successfully !!!" );
    
});


QUnit.test('Test AppInfoManager - updateSyncMsg and getSyncMsg', function( assert ){
    AppInfoManager.updateSyncMsg( { "msgList": [] } );

    var data = AppInfoManager.getSyncMsg();
    assert.equal( data.msgList != undefined, true, "Update and get SyncMsg successfully !!!" );
});



QUnit.test('Test AppInfoManager - updateDownloadInfo and getDownloadInfo', function( assert ){
    
    var data = AppInfoManager.getDownloadInfo();
    assert.equal( data, undefined, "Check undefined DowndownInfo." );

    AppInfoManager.updateDownloadInfo( "2020-07-03" );

    data = AppInfoManager.getDownloadInfo();
    assert.equal( data, "2020-07-03T00:00:00.000Z", "Update and get DownloadInfo successfully !!!" );
});



QUnit.test('Test AppInfoManager - updateFavIcons, getFavIcons and removeFavIcon', function( assert ){
    AppInfoManager.updateFavIcons( { "test": "testVal" } );

    var data = AppInfoManager.getFavIcons();
    assert.equal( data.test, "testVal", "Update and get FavIcons successfully !!!" );

    AppInfoManager.removeFavIcons();
    assert.equal( AppInfoManager.getFavIcons() == undefined, true, "Remove FavIcons successfully !!!" );
});


QUnit.test('Test AppInfoManager - updateNetworkConnectionObs and getNetworkConnectionObs', function( assert ){
    AppInfoManager.updateNetworkConnectionObs( { "test": "testVal" } );

    var data = AppInfoManager.getNetworkConnectionObs();
    assert.equal( data.test, "testVal", "Update and get NetworkConnectionObs successfully !!!" );
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


QUnit.test('Test AppInfoManager - updateLogoutDelay', function( assert ){

    AppInfoManager.updateLogoutDelay( "10" );

    var data = AppInfoManager.getUserInfo();
    assert.equal( data[AppInfoManager.KEY_LOGOUTDELAY], "10", "Update LogoutDelay successfully !!!" );
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
