
QUnit.test('Test StorageMng - setItem, getItem in localStorage', function( assert ){

    var done = assert.async();

    var key = "testKey";
    var jsonData = { "test" : "testVal" };
    var storageTypeStr = StorageMng.StorageType_LocalStorage;

    StorageMng.setItem( storageTypeStr, key, jsonData, function(){
        StorageMng.getItem( storageTypeStr, key, function( err, data ){

            assert.equal( data.test, "testVal", "setItem and getItem in localStorage successfully !!!");
            done();

            // StorageMng.removeItem( storageTypeStr, key, function(){

            //     StorageMng.getItem( storageTypeStr, key, function( err, data ){

            //         assert.equal( data, undefined, "Remove data in localStorage successfully !!!");
            //         done();
            //     });
            // });

        } );

    } );
});


QUnit.test('Test StorageMng - setItem, getItem in IDB', function( assert ){

    var done = assert.async();

    var key = "testKey";
    var jsonData = { "test" : "testVal" };
    var storageTypeStr = StorageMng.StorageType_IndexedDB;

    StorageMng.setItem( storageTypeStr, key, jsonData, function(){

        StorageMng.getItem( storageTypeStr, key, function( err, data ){

            assert.equal( data.test, "testVal", "setItem and getItem in localStorage successfully !!!");
            done();

            // StorageMng.removeItem( storageTypeStr, key, function(){

            //     StorageMng.getItem( storageTypeStr, key, function( err, data ){
                    
            //         assert.equal( data, undefined, "Remove data in localStorage successfully !!!");
            //         done();
            //     });
            // });

        } );

    } );
});



QUnit.test('Test StorageMng - getStorageTypeDriver', function( assert ){
  
    var storageTypeStr = StorageMng.getStorageTypeDriver( StorageMng.StorageType_LocalStorage );
    assert.equal( storageTypeStr, localforage.LOCALSTORAGE, "Get localStorage driver successfully !!!");

    
    var storageTypeStr = StorageMng.getStorageTypeDriver( StorageMng.StorageType_IndexedDB );
    assert.equal( storageTypeStr, localforage.INDEXEDDB, "Get localStorage driver successfully !!!");

});
  



