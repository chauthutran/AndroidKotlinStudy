
QUnit.test('Test ScheduleManager - runSchedules_AppStart', function( assert ){

    ScheduleManager.runSchedules_AppStart();
    assert.equal( true, true, "runSchedules_AppStart runs successfully !!!" );  
});


QUnit.test('Test ScheduleManager - runSchedules_AfterLogin', function( assert ){

    var cwsRenderObj = new cwsRender();

    ScheduleManager.runSchedules_AfterLogin( cwsRenderObj, function(){
        assert.equal( true, true, "runSchedules_AfterLogin runs successfully !!!" );  
    });
    
});


QUnit.test('Test ScheduleManager - stopSchedules_AfterLogOut', function( assert ){

    ScheduleManager.stopSchedules_AfterLogOut( function(){
        assert.equal( true, true, "stopSchedules_AfterLogOut runs successfully !!!" );  
    } );
    
});


QUnit.test('Test ScheduleManager - schedule_serverStatus_Check', function( assert ){

     var statusInfo = {
        "networkConn" : {
            "online_Stable" : true
        }
    } 
    ConnManagerNew.statusInfo = statusInfo;
    // ConnManagerNew.statusInfo.networkConn.online_Stable = true;
    
    ScheduleManager.schedule_serverStatus_Check( true );
    assert.equal( true, true, "schedule_serverStatus_Check without NotRunRightAway runs successfully !!!" );  

    
    ScheduleManager.schedule_serverStatus_Check( false );
    assert.equal( true, true, "schedule_serverStatus_Check with NotRunRightAway runs successfully !!!" );  
    
});


QUnit.test('Test ScheduleManager - schedule_syncAllRun', function( assert ){

    ScheduleManager.schedule_syncAllRun( true );
    assert.equal( true, true, "schedule_syncAllRun without NotRunRightAway runs successfully !!!" );  


    ScheduleManager.schedule_syncAllRun( false );
    assert.equal( true, true, "schedule_syncAllRun with NotRunRightAway runs successfully !!!" );  
    
});


QUnit.test('Test ScheduleManager - schedule_syncDownRunOnce', function( assert ){
    
    var dcdConfig = {
        "settings": {
            "sync" : {
                "syncDown": {
                    "enable": true,
                    "syncDownPoint": "test"
                }
            }
        }
    };
    var cwsRenderObj = new cwsRender();
    ConfigManager.setConfigJson( dcdConfig );

    ScheduleManager.schedule_syncDownRunOnce( cwsRenderObj );
    assert.equal( true, true, "schedule_syncDownRunOnce runs successfully !!!" );  
    
});


QUnit.test('Test ScheduleManager - syncDownRunIfOnlineSchedule', function( assert ){
    
    SyncManagerNew.syncMsgJson = { "msgList" : [] };
    var dcdConfig = {
        "settings": {
            "sync" : {
                "syncDown": {
                    "enable": true,
                    "syncDownPoint": "test"
                }
            }
        }
    };
    var cwsRenderObj = new cwsRender();
    ConfigManager.setConfigJson( dcdConfig );


    var statusInfo = { "appMode" : ConnManagerNew.ONLINE }
    ConnManagerNew.statusInfo = statusInfo;
    ScheduleManager.syncDownRunIfOnlineSchedule( cwsRenderObj );
    assert.equal( true, true, "syncDownRunIfOnlineSchedule with online appMode runs successfully !!!" );  


    var statusInfo = { "appMode" : ConnManagerNew.OFFLINE }
    ConnManagerNew.statusInfo = statusInfo;
    ScheduleManager.syncDownRunIfOnlineSchedule( cwsRenderObj );
    assert.equal( true, true, "syncDownRunIfOnlineSchedule with offline appMode runs successfully !!!" );  
    
});


QUnit.test('Test ScheduleManager - syncDownTimeoutCall', function( assert ){
    
    var cwsRenderObj = new cwsRender();
    ScheduleManager.syncDownTimeoutCall( cwsRenderObj );
    assert.equal( true, true, "syncDownTimeoutCall runs successfully !!!" );  
    
});

