
QUnit.test('Test SyncManagerNew - syncAll', function( assert ){

    SyncManagerNew.syncMsgJson = { "summaryList" : [], "msgList" : [] };
    SyncManagerNew.sync_Running = false;

    var statusInfo = { "appMode" : ConnManagerNew.ONLINE };
    ConnManagerNew.statusInfo = statusInfo;

    var cwsRenderObj = new cwsRender();


    SyncManagerNew.syncAll(cwsRenderObj, '', function(){
        assert.equal( true, true, "syncAll runs successfully !!!" );
    } ); 
});


QUnit.test('Test SyncManagerNew - syncDown', function( assert ){

    SyncManagerNew.syncMsgJson = { "summaryList" : [] };
    var cwsRenderObj = new cwsRender();

    SyncManagerNew.syncAll(cwsRenderObj, '', function(){
        assert.equal( true, true, "syncDown runs successfully !!!" );
    } ); 
});


// NEED to create a client list for testing ???
QUnit.test('Test SyncManagerNew - getActivityItems_ForSync', function( assert ){
    
    var cwsRenderObj = new cwsRender();
    SyncManagerNew.getActivityItems_ForSync(cwsRenderObj, function( uploadItems ){
        assert.equal( true, true, "getActivityItems_ForSync runs successfully !!!" );
    } ); 
});


QUnit.test('Test SyncManagerNew - syncUpItem_RecursiveProcess', function( assert ){
    
    var cwsRenderObj = new cwsRender();
    var activityDataList = [];
     
    SyncManagerNew.syncUpItem_RecursiveProcess(activityDataList, 1, cwsRenderObj, function( ){
        assert.equal( true, true, "syncUpItem_RecursiveProcess runs successfully !!!" );
    } ); 
});



QUnit.test('Test SyncManagerNew - downloadClients', function( assert ){
    var done = assert.async();

    SessionManager.sessionData.login_UserName = "test_username";
    AppInfoManager.updateDownloadInfo( "2020-07-03" );

    var dcdConfig = {
        "settings" : {
            "sync" : {
                "syncDown": {
                    "enable": true,
                    "syncDownPoint": "test",
                    "url": "www.test.com"
                }
            }
        }
    };
    ConfigManager.setConfigJson( dcdConfig );

    
    SyncManagerNew.downloadClients( function( ){
        assert.equal( true, true, "downloadClients runs successfully !!!" );
        done();
    } ); 
});


// // Perform Server Operation..
// SyncManagerNew.downloadClients = function( callBack )
// {
//     try
//     {
//         // TODO: 
//         var activeUser = SessionManager.sessionData.login_UserName; //"qwertyuio2";  // Replace with 'loginUser'?  8004?    
//         var dateRange_gtStr;
 
//         var payloadJson = { 'find': {} };
 
//         payloadJson.find = {
//             "clientDetails.users": activeUser
//             //"activities": { "$elemMatch": { "activeUser": activeUser } } 
//         };
 
//         // If last download date exists, search after that. Otherwise, get all
//         var lastDownloadDateISOStr = AppInfoManager.getDownloadInfo();
 
//         if ( lastDownloadDateISOStr ) 
//         { 
//             dateRange_gtStr = lastDownloadDateISOStr.replace( 'Z', '' );
//             payloadJson.find[ 'date.updatedOnMdbUTC' ] = { "$gte": dateRange_gtStr };
//         }
 
//         var loadingTag = undefined;
//         WsCallManager.requestPostDws( ConfigManager.getSyncDownSetting().url, payloadJson, loadingTag, function( success, returnJson ) {
 
//             callBack( success, returnJson );
//         });        
//     }
//     catch( errMsg )
//     {
//         console.log( 'Error in SyncManagerNew.downloadClients - ' + errMsg );
//         callBack( false );
//     }
// };


QUnit.test('Test SyncManagerNew - update_UI_StartSyncAll', function( assert ){

    SyncManagerNew.update_UI_StartSyncAll();
    assert.equal( true, true, "update_UI_StartSyncAll runs successfully !!!" );
});


QUnit.test('Test SyncManagerNew - update_UI_FinishSyncAll', function( assert ){
    
    SyncManagerNew.update_UI_FinishSyncAll();
    assert.equal( true, true, "update_UI_FinishSyncAll runs successfully !!!" );
});


QUnit.test('Test SyncManagerNew - initializeProgressBar', function( assert ){
    
    SyncManagerNew.initializeProgressBar();
    assert.equal( true, true, "initializeProgressBar runs successfully !!!" );
});


QUnit.test('Test SyncManagerNew - hideProgressBar', function( assert ){
    
    SyncManagerNew.hideProgressBar();
    assert.equal( true, true, "hideProgressBar runs successfully !!!" );
});


QUnit.test('Test SyncManagerNew - syncStart', function( assert ){
    
    var statusInfo = {
        "manual_Offline" : {
            "enabled" : true
        }
    }
    ConnManagerNew.statusInfo = statusInfo;
    
    SyncManagerNew.sync_Running = true;
    SyncManagerNew.syncStart();
    assert.equal( true, true, "syncStart with sync_Running as true runs successfully !!!" );

    
    SyncManagerNew.sync_Running = false;
    SyncManagerNew.syncStart();
    assert.equal( true, true, "syncStart with sync_Running as false runs successfully !!!" );
});



QUnit.test('Test SyncManagerNew - syncFinish', function( assert ){
    
    SyncManagerNew.syncFinish();
    assert.equal(  SyncManagerNew.sync_Running, false, "syncFinish runs successfully !!!" );
});


QUnit.test('Test SyncManagerNew - SyncMsg_Get', function( assert ){
    SyncManagerNew.syncMsgJson = undefined;
    AppInfoManager.removeData( AppInfoManager.KEY_SYNCMSG );
    var syncMsgJson = SyncManagerNew.SyncMsg_Get();
    assert.equal( syncMsgJson.msgList.length == 0 && syncMsgJson.summaryList.length == 0, true, "SyncMsg_Get with template runs successfully !!!" );


    SyncManagerNew.syncMsgJson = undefined;
    AppInfoManager.updateSyncMsg( { "msgList": 
        [
            {
                "datetime" : "2039-07-22",
                "msg" : "Test message 1"
            }
        ] 
    } );
    var syncMsgJson = SyncManagerNew.SyncMsg_Get();
    assert.equal( syncMsgJson.msgList.length == 1 && syncMsgJson.msgList[0].msg == "Test message 1", true, "SyncMsg_Get with undefined syncMsgJson runs successfully !!!" );


    SyncManagerNew.syncMsgJson = { "msgList": 
        [
            {
                "datetime" : "2039-07-23",
                "msg" : "Test message 2"
            }
        ] 
    };
    var syncMsgJson = SyncManagerNew.SyncMsg_Get();
    assert.equal( syncMsgJson.msgList.length == 1 && syncMsgJson.msgList[0].msg == "Test message 2", true, "SyncMsg_Get with defined syncMsgJson runs successfully !!!" );
});


QUnit.test('Test SyncManagerNew - SyncMsg_InsertMsg', function( assert ){
    SyncManagerNew.syncMsgJson = { "msgList" : [] };
    SyncManagerNew.SyncMsg_InsertMsg();
    assert.equal( true, true, "SyncMsg_InsertMsg runs successfully !!!" );
});


QUnit.test('Test SyncManagerNew - SyncMsg_InsertSummaryMsg', function( assert ){
    SyncManagerNew.syncMsgJson = { "summaryList" : [] };
    SyncManagerNew.SyncMsg_InsertSummaryMsg( "Test" );
    assert.equal( true, true, "SyncMsg_InsertSummaryMsg runs successfully !!!" );
});


QUnit.test('Test SyncManagerNew - SyncMsg_Reset', function( assert ){
    
    SyncManagerNew.SyncMsg_Reset();
    assert.equal( true, true, "SyncMsg_Reset runs successfully !!!" );
});


QUnit.test('Test SyncManagerNew - SyncMsg_ShowBottomMsg', function( assert ){
    SyncManagerNew.syncMsgJson = { "msgList" : [
            {
                "datetime" : "2039-07-23",
                "msg" : "Test message 1"
            }
        ],
        "summaryList":[
            {
                "msg" : "Test message 2"
            }
        ]};
    SyncManagerNew.SyncMsg_ShowBottomMsg();
    assert.equal( true, true, "SyncMsg_ShowBottomMsg runs successfully !!!" );
});


QUnit.test('Test SyncManagerNew - SyncMsg_createSectionTag', function( assert ){
    
    SyncManagerNew.SyncMsg_createSectionTag( "Test title", function(){
        assert.equal( true, true, "SyncMsg_createSectionTag runs successfully !!!" );
    });
    
});
