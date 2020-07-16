

QUnit.test('Test ConnManagerNew - appStartUp_SetStatus and changeNetworkConnStableStatus', function( assert ){
    
    var cwsRenderObj = new cwsRender();
    var modeOnline = navigator.onLine;
    ConnManagerNew.appStartUp_SetStatus( cwsRenderObj );

    assert.equal( ConnManagerNew._cwsRenderObj != undefined, true, "cwsRenderObj is set up successfully !!!" );
    assert.equal( ConnManagerNew.statusInfo.networkConn.online_Current, modeOnline, "online_Current is set up successfully !!!" );
    assert.equal( ConnManagerNew.statusInfo.networkConn.online_Stable, modeOnline, "changeNetworkConnStableStatus runs successfully !!!" );

});


QUnit.test('Test ConnManagerNew - updateNetworkConnStatus', function( assert ){
    
    var modeOnline = navigator.onLine;
    ConnManagerNew.updateNetworkConnStatus();

    assert.equal( ConnManagerNew.statusInfo.networkConn.online_Current, modeOnline, "online_Current is set up successfully !!!" );

});


QUnit.asyncTest('Test ConnManagerNew - checkNSet_ServerAvailable', function( assert ){
    
    expect(1);
    ConnManagerNew.statusInfo.networkConn.online_Stable = true;

    ConnManagerNew.checkNSet_ServerAvailable( function(){
        assert.equal( 1, 1, "checkNSet_ServerAvailable runs successfully !!!" );    
        QUnit.start();
    });

});



QUnit.asyncTest('Test ConnManagerNew - serverAvailable', function( assert ){
   
    expect(1);
    ConnManagerNew.statusInfo.networkConn.online_Stable = true;

    ConnManagerNew.serverAvailable( function(){
        assert.equal( 1, 1, "serverAvailable runs successfully !!!" );  
        QUnit.start();  
    });

});


QUnit.test('Test ConnManagerNew - changeServerAvailableIfDiff', function( assert ){
    
    var newAvailable = true;
    var statusInfo = { 
        "serverAvailable" : false,
        "appMode" : ConnManagerNew.OFFLINE,
        "manual_Offline": {
            "enabled" : false
        },
        "networkConn" : {
            "online_Stable" : true
        }
    }

    ConnManagerNew.changeServerAvailableIfDiff( newAvailable, statusInfo );
    
    assert.equal( statusInfo.serverAvailable, newAvailable, "serverAvailable is updated successfully !!!" );   
    assert.equal( statusInfo.appMode, ConnManagerNew.ONLINE, "appMode is updated successfully !!!" );      
});


QUnit.test('Test ConnManagerNew - produceAppMode_FromStatusInfo', function( assert ){
    
    var statusInfo = { 
        "serverAvailable" : true,
        "networkConn" : {
            "online_Stable" : true
        }
    }

    var status = ConnManagerNew.produceAppMode_FromStatusInfo( statusInfo );
    assert.equal( status, ConnManagerNew.ONLINE, "serverAvailable is updated successfully !!!" );  
});


QUnit.test('Test ConnManagerNew - isAppMode_Online', function( assert ){
   
    ConnManagerNew.statusInfo.appMode = ConnManagerNew.ONLINE;

    var status = ConnManagerNew.isAppMode_Online();
    assert.equal( status, true, "isAppMode_Online runs successfully !!!" );  
});


QUnit.test('Test ConnManagerNew - isStrONLINE', function( assert ){
    var status = ConnManagerNew.isStrONLINE( ConnManagerNew.ONLINE );
    assert.equal( status, true, "isStrONLINE runs successfully !!!" );  
});


QUnit.test('Test ConnManagerNew - isStrOFFLINE', function( assert ){
    var status = ConnManagerNew.isStrOFFLINE( ConnManagerNew.OFFLINE );
    assert.equal( status, true, "isStrOFFLINE runs successfully !!!" );  
});


QUnit.test('Test ConnManagerNew - connStatusStr', function( assert ){
    ConnManagerNew.statusInfo.appMode = ConnManagerNew.ONLINE;

    var status = ConnManagerNew.connStatusStr( ConnManagerNew.OFFLINE );
    assert.equal( status, ConnManagerNew.ONLINE, "connStatusStr runs successfully !!!" );  
});


QUnit.test('Test ConnManagerNew - createNetworkConnListeners', function( assert ){
  
    ConnManagerNew.createNetworkConnListeners();
    assert.equal( true, true, "createNetworkConnListeners runs successfully !!!" );  
});


QUnit.test('Test ConnManagerNew - cloudConnStatusClickSetup', function( assert ){
  
    var divNetworkStatusTag = $("<div></div>");

    ConnManagerNew.statusInfo.appMode = ConnManagerNew.ONLINE;
    ConnManagerNew.cloudConnStatusClickSetup( divNetworkStatusTag );
    assert.equal( true, true, "cloudConnStatusClickSetup - online runs successfully !!!" );

    
    ConnManagerNew.statusInfo.appMode = ConnManagerNew.OFFLINE;
    ConnManagerNew.cloudConnStatusClickSetup( divNetworkStatusTag );
    assert.equal( true, true, "cloudConnStatusClickSetup - offline runs successfully !!!" );

});


QUnit.test('Test ConnManagerNew - setManualAppModeSwitch', function( assert ){
  
    ConnManagerNew.statusInfo.appMode = ConnManagerNew.OFFLINE;
    ConnManagerNew.setManualAppModeSwitch( ConnManagerNew.OFFLINE, 10 );
    assert.equal( true, true, "setManualAppModeSwitch - Offline runs successfully !!!" );  

    ConnManagerNew.statusInfo.appMode = ConnManagerNew.ONLINE;
    ConnManagerNew.setManualAppModeSwitch( ConnManagerNew.ONLINE, 0 );
    assert.equal( true, true, "setManualAppModeSwitch - online runs successfully !!!" ); 
      
});


QUnit.test('Test ConnManagerNew - update_UI', function( assert ){
  
    var statusInfo = { 
        "appMode" : ConnManagerNew.OFFLINE,
        "networkConn" : {
            "online_Current" : true
        }
    }

    ConnManagerNew.statusInfo.appMode = ConnManagerNew.ONLINE;
    ConnManagerNew.update_UI( statusInfo );
    assert.equal( true, true, "update_UI runs successfully !!!" );  
    
      
});


QUnit.test('Test ConnManagerNew -update_UI_LoginStatusIcon', function( assert ){
  
    ConnManagerNew.update_UI_LoginStatusIcon( );
    assert.equal( true, true, "update_UI_LoginStatusIcon runs successfully !!!" );  
    
      
});


QUnit.test('Test ConnManagerNew - update_UI_NetworkIcons', function( assert ){
  
    ConnManagerNew.update_UI_NetworkIcons();
    assert.equal( true, true, "update_UI_NetworkIcons runs successfully !!!" );  
    
      
});


QUnit.test('Test ConnManagerNew - update_UI_statusDots', function( assert ){
  
    var statusInfo = {
        "serverAvailable" : true,
        "networkConn" : {
            "online_Current" : true,
            "online_Stable" : true,
        },
        "manual_Offline": {
            "enabled" : false
        },
    };

    ConnManagerNew.update_UI_statusDots( statusInfo );
    assert.equal( true, true, "update_UI_statusDots runs successfully !!!" );  
    
      
});


QUnit.test('Test ConnManagerNew - setStatusCss', function( assert ){
  
    ConnManagerNew.setStatusCss( $("<div></div>"), true );
    assert.equal( true, true, "setStatusCss runs successfully !!!" );  
});


QUnit.test('Test ConnManagerNew - cloudConnStatusClickSetup', function( assert ){

    var divNetworkStatusTag =  $("<div></div>");
    var cwsRenderObj = new cwsRender();
    var modeOnline = navigator.onLine;
    ConnManagerNew.appStartUp_SetStatus( cwsRenderObj );

    // ONLINE test
    ConnManagerNew.statusInfo.appMode = ConnManagerNew.ONLINE;
    ConnManagerNew.cloudConnStatusClickSetup( divNetworkStatusTag );
    
    divNetworkStatusTag.click();
    assert.equal( true, true, "cloudConnStatusClickSetup ONLINE runs successfully !!!" );  


    // OFFLINE test
    var statusInfo = {
        "serverAvailable" : false,
        "appMode" : ConnManagerNew.OFFLINE,
        "networkConn" : {
            "online_Stable" : false,
            "online_Current" : false
        },
        "manual_Offline" : {
            "enabled" : false
        }
    };
    ConnManagerNew.statusInfo = statusInfo;
    ConnManagerNew.cloudConnStatusClickSetup( divNetworkStatusTag );
    divNetworkStatusTag.click();
    assert.equal( true, true, "cloudConnStatusClickSetup OFFLINE runs successfully !!!" );  

});

