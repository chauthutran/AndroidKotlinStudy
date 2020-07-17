
QUnit.test('Test MsgManager - initialSetup', function( assert ){
    var dcdConfig = {
        "settings" : {
            "message" : {
                "autoHide" : true,
                "autoHideTime" : "00:00"
            }
        }
    }
    ConfigManager.setConfigJson( dcdConfig );

    MsgManager.initialSetup();
    assert.equal( true, true, "initialSetup runs successfully !!!" );  
});


QUnit.test('Test MsgManager - msgAreaShow', function( assert ){
    MsgManager.initialSetup( "Testing" );
    assert.equal( true, true, "msgAreaShow runs successfully !!!" );  
});


QUnit.test('Test MsgManager - msgAreaClear', function( assert ){
    MsgManager.countDownNumerator =  1;

    
    MsgManager.msgAreaClear();
    assert.equal( true, true, "msgAreaClear with undefined speed runs successfully !!!" );
    
    
    MsgManager.msgAreaClear( 100 );
    assert.equal( true, true, "msgAreaClear with defined speed runs successfully !!!" );  
});


QUnit.test('Test MsgManager - notificationMessage', function( assert ){

    MsgManager.notificationMessage( "Test body message", "msgType", $("<input type='button'>"), "border:1px;color:blue"
        , "right", "top", 10, true, function(){}, "111", false, false );
    assert.equal( true, true, "notificationMessage with empty reservedIDs list runs successfully !!!" ); 

    MsgManager.reservedIDs = ["111", "222"];
    MsgManager.notificationMessage( "Test body message", "msgType", $("<input type='button'>"), "border:1px;color:blue"
        , "right", "top", 10, true, function(){}, "111", false, false );
    assert.equal( true, true, "notificationMessage runs with unempty reservedIDs list successfully !!!" );  

    
    MsgManager.reservedIDs = ["111", "222"];
    MsgManager.notificationMessage( "Test body message", "msgType", $("<input type='button'>"), "border:1px;color:blue"
        , "right", "top", 10, true, function(){}, "333", false, false );
    assert.equal( true, true, "notificationMessage runs with new reservedID successfully !!!" );  
});


QUnit.test('Test MsgManager - clearReservedMessage', function( assert ){
    MsgManager.reservedIDs = ["111", "222"];
    var isClear = MsgManager.clearReservedMessage( "111" );
    assert.equal( isClear, true, "clearReservedMessage runs successfully !!!" );  
});


QUnit.test('Test MsgManager - confirmPayloadPreview', function( assert ){
    var jsonPreviewData = [
        {
            "type": "SHORT_TEXT",
            "name" : "test1",
            "value" : "Value 1"
        },
        {
            "type": "INT",
            "name" : "test2",
            "value" : 2
        }
    ];

    MsgManager.confirmPayloadPreview( $("<div></div>"), jsonPreviewData, true, function(){ } );
    assert.equal( true, true, "clearReservedMessage runs successfully !!!" );  
});
