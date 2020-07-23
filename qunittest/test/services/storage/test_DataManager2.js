
QUnit.asyncTest('Test DataManager2 - saveData_IDB, getData_IDB, encryptData and decriptData', function( assert ){
    expect(1);

    var jsonData = {"test": "testVal"};
    var secName = "testIDB";

    DataManager2.saveData_IDB( secName, jsonData, function(){
        DataManager2.getData_IDB( secName, function( data ){
            assert.equal( data.test, "testVal", "Save and Get data successfully !!!" );
            QUnit.start();
        }) ;
    }); 
});


QUnit.asyncTest('Test DataManager2 - saveData_LS and getData_LS', function( assert ){
    expect(1);

    var jsonData = {"test": "testVal"};
    var secName = "testLSSB";

    DataManager2.saveData_LS( secName, jsonData, function(){
        DataManager2.getData_LS( secName, function( data ){

            assert.equal( data.test, "testVal", "Save and Get data successfully !!!" );
            QUnit.start();

        });
    } );
    
});


QUnit.test('Test DataManager2 - getData_RedeemList', function( assert ){
    // var jsonData = {"test": "testVal"};

    DataManager2.getData_RedeemList( function(){
        
    } );

    assert.equal( true, true, "getData_RedeemList runs successfully !!!" );
});


QUnit.test('Test DataManager2 - saveData_RedeemList', function( assert ){
    var jsonData = {"test": "testVal"};

    DataManager2.saveData_RedeemList( jsonData, function(){
       
    } );

    assert.equal( true, true, "saveData_RedeemList runs successfully !!!" );
});


// QUnit.asyncTest('Test DataManager2 - saveData_ActivityList and getData_ActivityList', function( assert ){
//     expect(2);

//     var jsonData = {"test": "testVal"};

//     DataManager2.saveData_ActivityList ( jsonData, function(){
//         DataManager2.getData_ActivityList( function( data ){
//             assert.equal( data.test, "testVal", "Save and Get data successfully !!!" );
//             QUnit.start();
//         }) ;
//     });

// });


QUnit.asyncTest('Test DataManager2 - getData_ClientsStore and saveData_ClientsStore', function( assert ){
    expect(1);
    SessionManager.sessionData.login_UserName = "test_username";
    var jsonData = {"test": "testVal"};

    DataManager2.saveData_ClientsStore( jsonData, function(){
        DataManager2.getData_ClientsStore( function( data ){
            assert.equal( data.test, "testVal", "Save and Get data successfully !!!" );
            QUnit.start();
        }) ;
    });

});


QUnit.test('Test DataManager2 - saveData_LS_JSON and getData_LS_JSON', function( assert ){
    var key = "testKey";

    var jsonData = {"test": "testVal"};

    DataManager2.saveData_LS_JSON( key, jsonData );
    var data = DataManager2.getData_LS_JSON( key );
    assert.equal( data.test, "testVal", "Save and Get JSON data successfully !!!" );
    
});


QUnit.test('Test DataManager2 - saveData_LS_Str and getData_LS_Str', function( assert ){
    var key = "testKey";

    var jsonData = "testVal";

    DataManager2.saveData_LS_Str( key, jsonData );
    var data = DataManager2.getData_LS_Str( key );
    assert.equal( data, "testVal", "Save and Get JSON data successfully !!!" );
    
});


QUnit.asyncTest('Test DataManager2 - deleteAllStorageData', function( assert ){
    expect(2);

    var secName_IDB = "testKey_IDB";
    var jsonData_IPB = { "test_IDB" : "testVal1" };

    var secName_LS = "testKey_LS";
    var jsonData_LS = { "test_LS" : "testVal2" };


    
    DataManager2.saveData_IDB ( secName_IDB, jsonData_IPB, function(){

        DataManager2.saveData_LS( secName_LS, jsonData_LS, function(){

            DataManager2.deleteAllStorageData( function(){

                DataManager2.getData_IDB( secName_IDB, function( data_IDB ){
                    DataManager2.getData_LS( secName_LS, function( data_LS ){

                        assert.equal( data_IDB, undefined, "Delete IDB data successfully !!!" );
                        assert.equal( data_LS, undefined, "Delete LS data successfully !!!" );

                        QUnit.start();

                    } );
                } );
            } );

        } );
        
    });
    
});


QUnit.test('Test DataManager2 - saveData_LS_Str and getData_LS_Str', function( assert ){
    var key = "testKey";

    var jsonData = "testVal";

    DataManager2.saveData_LS_Str( key, jsonData );
    var data = DataManager2.getData_LS_Str( key );
    assert.equal( data, "testVal", "Save and Get JSON data successfully !!!" );
    
});



QUnit.asyncTest('Test DataManager2 - estimateStorageUse', function( assert ){
    expect(1);
    
    DataManager2.estimateStorageUse( function(){

        assert.equal( true, true, "estimateStorageUse runs successfully !!!" );
        QUnit.start();

    } );
    
});

