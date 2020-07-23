
QUnit.test('Test LocalStgMng - saveJsonData and getJsonData', function( assert ){

    var key = "testKey";
    var jsonData = { "test" : "testVal" };

    LocalStgMng.saveJsonData( key, jsonData );
    var data = LocalStgMng.getJsonData ( key );
    assert.equal( data.test, "testVal", "Save and Get data successfully !!!" );

    LocalStgMng.deleteData( key );
    var data = LocalStgMng.getJsonData ( key );
    assert.equal( data, undefined, "Delete data successfully !!!" );

});


QUnit.test('Test LocalStgMng - clear', function( assert ){

    var key = "testKey";
    var jsonData = { "test" : "testVal" };

    LocalStgMng.saveJsonData( key, jsonData );
    LocalStgMng.clear();
    var data = LocalStgMng.getJsonData( key );
    assert.equal( data, undefined, "Clear data successfully !!!" );

});

