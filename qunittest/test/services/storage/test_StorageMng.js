
QUnit.asyncTest('Test StorageMng - setItem, getItem in localStorage', function( assert ){

    expect(1);

    var key = "testKey";
    var jsonData = { "test" : "testVal" };
    var storageTypeStr = StorageMng.StorageType_LocalStorage;

    StorageMng.setItem( storageTypeStr, key, jsonData, function(){
        StorageMng.getItem( storageTypeStr, key, function( err, data ){

            assert.equal( data.test, "testVal", "setItem and getItem in localStorage successfully !!!");
            QUnit.start();

            // StorageMng.removeItem( storageTypeStr, key, function(){

            //     StorageMng.getItem( storageTypeStr, key, function( err, data ){

            //         assert.equal( data, undefined, "Remove data in localStorage successfully !!!");
            //         QUnit.start();
            //     });
            // });

        } );

    } );
});


QUnit.asyncTest('Test StorageMng - setItem, getItem in IDB', function( assert ){

    expect(1);

    var key = "testKey";
    var jsonData = { "test" : "testVal" };
    var storageTypeStr = StorageMng.StorageType_IndexedDB;

    StorageMng.setItem( storageTypeStr, key, jsonData, function(){

        StorageMng.getItem( storageTypeStr, key, function( err, data ){

            assert.equal( data.test, "testVal", "setItem and getItem in localStorage successfully !!!");
            QUnit.start();

            // StorageMng.removeItem( storageTypeStr, key, function(){

            //     StorageMng.getItem( storageTypeStr, key, function( err, data ){
                    
            //         assert.equal( data, undefined, "Remove data in localStorage successfully !!!");
            //         QUnit.start();
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
  



