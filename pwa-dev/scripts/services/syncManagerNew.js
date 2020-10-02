// =========================================
// -------------------------------------------------
//     SyncManagerNew
//          - Methods related to submitting data to server
//              - Later will have downloading data from server feature.
//
// -- Pseudo WriteUp:   Create Pseudo Codes with Flow of App (High Level --> to Lower Level)
//
//      - LVL 1. The Expected Features of this class..
//          1. Running 'Sync' on Item --> Submit Offline(?) Item to Server to process operation.  MORE: SyncUp, SyncDown
//          2. 'SyncAll' - all the list of items, perform Sync.
//          3. 'SyncDown' - Start download and merge
//
//      - LVL 2. Go through each of 'Lvl 1' Methods to put general operation logics
//          OP1. ""'Sync' on a item"
//              A. Check on Network Status.
//              B. Submit/Perform the operation of item on server..
//              B1(?). Update Data based on B
//              C. Update The App/UI of changes
//
// -------------------------------------------------

function SyncManagerNew()  {};


SyncManagerNew.syncAll_Running_Manual = false;
SyncManagerNew.syncAll_Running_Scheduled = false; // SyncManagerNew.isSyncAll_Running();

// Should be obsolete soon, but use the marker as actiivty processing status as 'processing'
SyncManagerNew.sync_Running = false;   // to avoid multiple syncRuns in parallel

// If scheduled syncAll gets delayed, 
SyncManagerNew.syncAll_conflictShortDelayTime = 10000; // 10 secounds..
SyncManagerNew.syncAll_conflictShortDelayCall; // 


SyncManagerNew.imgAppSyncActionButtonId = '#imgAppDataSyncStatus';
SyncManagerNew.subProgressBarId = '#divProgressInfo';


// If blockListObj were created and referened..  We could use cwsRenderObj instead..
SyncManagerNew.blockListObj;  // If

SyncManagerNew.template_SyncMsgJson = { 
    "msgList": [], // { "msg": "", "datetime": "" }
    "summaryList": []  // { "msg": "" }
};

SyncManagerNew.syncMsgJson;  // will get loaded on 1st use or on app startup

// ===================================================
// === MAIN 2 FEATURES =============


// 2. Run 'sync' on All activityItems - NOTE: 'SyncAll_Running' checking/blocking happenes before this method.
//      - In this method, we simply mark them... by 'runType'
SyncManagerNew.syncAll = function( cwsRenderObj, runType, callBack )
{
    try
    {
        SyncManagerNew.SyncMsg_InsertMsg( 'syncAll ' + runType + ' Started..' );
        SyncManagerNew.setSyncAll_Running( runType, true );

        // initialise UI + animation
        SyncManagerNew.update_UI_StartSyncAll();

        var resultData = { 'success': 0, 'failure': 0 };

        // NOTE: CHECK ONLINE is done within syncUpItem_RecursiveProcess
        SyncManagerNew.syncUpItem_RecursiveProcess( ActivityDataManager.getActivityList(), 0, cwsRenderObj, resultData, function() 
        {
            SyncManagerNew.setSyncAll_Running( runType, false );
            SyncManagerNew.update_UI_FinishSyncAll();

            var successMsg = 'syncAll ' + runType + ' completed..';
            SyncManagerNew.SyncMsg_InsertMsg( successMsg );
            console.customLog( successMsg );

            SyncManagerNew.SyncMsg_InsertSummaryMsg( 'Processed with success ' + resultData.success + ', failure ' + resultData.failure + '..' );

            if ( callBack ) callBack( true );
        });
    }
    catch( errMsg )
    {
        SyncManagerNew.setSyncAll_Running( runType, false );
        SyncManagerNew.update_UI_FinishSyncAll();

        var errMsgDetail = 'syncAll ' + runType + ' failed - msg: ' + errMsg;        
        SyncManagerNew.SyncMsg_InsertSummaryMsg( errMsgDetail );
        MsgManager.msgAreaShow( 'ERR: ' + errMsgDetail );
        console.customLog( errMsgDetail );

        if( callBack ) callBack( false );
    }
};



SyncManagerNew.syncDown = function( runType, callBack )
{
    // NOTE: We can check network connection here, or from calling place.  
    //  Choose to check on calling place for now.  ConnManagerNew.isAppMode_Online();
    SyncManagerNew.update_UI_StartSyncAll();

    SyncManagerNew.SyncMsg_InsertMsg( "download started.." );

    // Retrieve data..
    SyncManagerNew.downloadClients( function( downloadSuccess, returnJson, mockCase ) 
    {
        SyncManagerNew.update_UI_FinishSyncAll();

        var changeOccurred = false;        
 

        if ( !downloadSuccess ) 
        { 
            SyncManagerNew.SyncMsg_InsertMsg( "Failed on download, msg: " + Util.getStr( returnJson ) );

            if ( callBack ) callBack( downloadSuccess, changeOccurred ); 
        }
        else
        {
            var downloadedData = SyncManagerNew.formatDownloadedData( returnJson );
                                
            // 'download' processing data                
            var processingInfo = ActivityDataManager.createProcessingInfo_Success( Constants.status_downloaded, 'Downloaded and synced.' );

            SyncManagerNew.SyncMsg_InsertMsg( "downloaded " + downloadedData.clients.length + " clients: " );

            ClientDataManager.mergeDownloadedClients( downloadedData, processingInfo, function( changeOccurred_atMerge ) 
            {
                SyncManagerNew.SyncMsg_InsertMsg( "Merged data.." );
                SyncManagerNew.SyncMsg_InsertSummaryMsg( "downloaded " + downloadedData.clients.length + " clients: " );

                // S3. NOTE: Mark the last download at here, instead of right after 'downloadActivities'?
                AppInfoManager.updateSyncLastDownloadInfo(( new Date() ).toISOString()); 

                if ( callBack ) callBack( downloadSuccess, changeOccurred_atMerge, mockCase );
            });            
        }
    });    
};

SyncManagerNew.formatDownloadedData = function( returnJson )
{
    var outputData = { 'clients': [] };

    if ( returnJson )
    {
        if ( returnJson.response && returnJson.response.dataList ) 
        {
            // mongo web service return data format.
            outputData.clients = returnJson.response.dataList;
        }
        else if ( returnJson.clientList ) 
        {
            // dws syncUp return format.
            outputData.clients = returnJson.clientList;
        }
        else if ( returnJson.clients )
        {
            outputData.case = 'dhis2RedeemMerge';
            outputData.clients = returnJson.clients;            
        }    
    }
    
    return outputData;
};

// ===================================================
// === 1. 'syncUpItem' Related Methods =============


SyncManagerNew.syncUpActivity = function( activityId, resultData, returnFunc )
{    
    var activityJson = ActivityDataManager.getActivityById( activityId );
    var syncReadyJson = SyncManagerNew.syncUpReadyCheck( activityJson );

    // NOTE: Need try/catch here?
    if ( syncReadyJson.ready )
    {
        var activityCardObj = new ActivityCard( activityJson.id, SessionManager.cwsRenderObj );

        activityCardObj.highlightActivityDiv( true );

        activityCardObj.performSyncUp( function( success, errMsg ) {

            SyncManagerNew.syncUpActivity_ResultUpdate( success, resultData );

            activityCardObj.reRenderActivityDiv();
            activityCardObj.highlightActivityDiv( false );
            
            if ( returnFunc ) returnFunc( syncReadyJson, success );
        });
    }
    else
    {
        if ( returnFunc ) returnFunc( syncReadyJson );
    }
};

SyncManagerNew.syncUpActivity_ResultUpdate = function( success, resultData )
{
    if ( resultData )
    {
        if ( success === true )
        {
            if ( resultData.success === undefined ) resultData.success = 0;
            resultData.success++;
        }
        else if ( success === false )
        {
            if ( resultData.failure === undefined ) resultData.failure = 0;
            resultData.failure++;
        }    
    }
};

// ===================================================
// === 2. 'syncAll' Related Methods =============

// NOT APPLICABLE ANYMORE..
SyncManagerNew.getActivityItems_ForSync = function( callBack )
{    
    var uploadItems = [];
    
    var uploadItems = ActivityDataManager.getActivityList().filter( function( activityItem ) 
    {
        var filterPass = false;
        if ( activityItem.processing && activityItem.processing.status )
        {
            var status = activityItem.processing.status;
            filterPass = ( status === Constants.status_queued || status === Constants.status_failed );
        }

        return filterPass; 
    });

    // Hard to sort --> processing.created
    //uploadItems = Util.sortByKey( uploadItems, 'created', undefined, 'Decending' ); // combined list

    callBack( uploadItems );
};


SyncManagerNew.syncUpItem_RecursiveProcess = function( activityJsonList, i, cwsRenderObj, resultData, callBack )
{
    // length is 1  index 'i' = 0; next time 'i' = 1
    if ( activityJsonList.length <= i )
    {
        // If index is equal or bigger to list, return back. - End reached.
        return callBack();        
    }
    else
    {    
        // CASE: NOTE: DURING syncAll, if Offline mode detected, cancel the syncAll process in the middle.
        if ( !ConnManagerNew.isAppMode_Online() )
        {
            // TODO: CHECK IF THIS IS PROPER MESSAGE...  <-- We need to open up this..
            SyncManagerNew.SyncMsg_InsertMsg( "App offline mode detected.  Stopping syncAll process.." );
            //throw 'Stopping syncAll process due to app mode offline detected.';
            return callBack();  // with summary..
        }
        else
        {
            var activityJson = activityJsonList[i];         
        
            SyncManagerNew.syncUpActivity( activityJson.id, resultData, function( syncReadyJson, syncUpSuccess ) 
            {
                // Update on progress bar
                FormUtil.updateProgressWidth( ( ( i + 1 ) / activityJsonList.length * 100 ).toFixed( 1 ) + '%' );

                // Process next item without performing..
                SyncManagerNew.syncUpItem_RecursiveProcess( activityJsonList, i + 1, cwsRenderObj, resultData, callBack );
            });
        }
    }
};


// ===================================================
// === 2. 'syncDown' Related Methods =============

// Perform Server Operation..
SyncManagerNew.downloadClients = function( callBack )
{
    try
    {
        var syncDownJson = ConfigManager.getSyncDownSetting();
   
        var mockResponseJson = ConfigManager.getMockResponseJson( syncDownJson.useMockResponse );

        // Fake Test Response Json - SHOULD WE DO THIS HERE, OR BEFORE 'performSyncUp' method?
        if ( mockResponseJson )
        {
            WsCallManager.mockRequestCall( mockResponseJson, undefined, function( success, returnJson )
            {
                callBack( success, returnJson, true );
            });
        }
        else
        {            
            var payloadJson = ConfigManager.getSyncDownSearchBodyEvaluated();       
            Util.jsonCleanEmptyRunTimes( payloadJson, 2 );

            if ( payloadJson )
            {
                var loadingTag = undefined;
                WsCallManager.requestPostDws( syncDownJson.url, payloadJson, loadingTag, function( success, returnJson ) 
                {    
                    callBack( success, returnJson );
                });
            }
            else
            {
                callBack( false, ' searchBodyEval not provided' );
            }
        }
    }
    catch( errMsg )
    {
        console.customLog( 'Error in SyncManagerNew.downloadClients - ' + errMsg );
        callBack( false, ' ErrorMsg - ' + errMsg );
    }
};

// ===================================================
// === UI Related Methods =============


SyncManagerNew.update_UI_StartSyncAll = function()
{
    // initialise ProgressBar Defaults
    SyncManagerNew.initializeProgressBar();

    // animate syncButton 'running' 
    FormUtil.rotateTag( $( SyncManagerNew.imgAppSyncActionButtonId ), true );
};

SyncManagerNew.update_UI_FinishSyncAll = function()
{
    SyncManagerNew.hideProgressBar();
    FormUtil.rotateTag( $( SyncManagerNew.imgAppSyncActionButtonId ), false );
};


SyncManagerNew.initializeProgressBar = function()
{

    $( SyncManagerNew.subProgressBarId ).removeClass( 'indeterminate' );
    $( SyncManagerNew.subProgressBarId ).addClass( 'determinate' );

    FormUtil.updateProgressWidth( 0 );
    FormUtil.showProgressBar( 0 );
};

SyncManagerNew.hideProgressBar = function()
{

    FormUtil.hideProgressBar();

    //$( syncManager.subProgressBar ).removeClass( 'determinate' );
    //$( syncManager.subProgressBar ).addClass( 'indeterminate' );
};

// ===================================================
// === 'syncStart/Finish' Related Methods =============

// use as callBack?  
SyncManagerNew.syncUpReadyCheck = function( activityJson )
{    
    var readyJson = { 'ready': false, 'online': false, 'syncableStatus': false };

    readyJson.online = ConnManagerNew.isAppMode_Online();
    readyJson.syncableStatus = SyncManagerNew.checkActivityStatus_SyncUpReady( activityJson );

    readyJson.ready = ( readyJson.online && readyJson.syncableStatus );

    return readyJson;
};
      

// Check Activity Status for 'SyncUp'
SyncManagerNew.checkActivityStatus_SyncUpReady = function( activityJson )
{    
    var bReady = false;

    if ( activityJson && activityJson.processing && activityJson.processing.status )
    {
        bReady = SyncManagerNew.isSyncReadyStatus( activityJson.processing.status ); 
    }    

    return bReady;
};
                  
SyncManagerNew.isSyncReadyStatus = function( status )
{
    return ( status === Constants.status_queued
        || status === Constants.status_failed
        || status === Constants.status_hold );    
};


SyncManagerNew.isSyncAll_Running = function()
{
    return ( SyncManagerNew.syncAll_Running_Manual || SyncManagerNew.syncAll_Running_Scheduled );
};

SyncManagerNew.setSyncAll_Running = function( runType, bRunning )
{
    if ( runType === 'Manual' ) SyncManagerNew.syncAll_Running_Manual = bRunning;
    else if ( runType === 'Scheduled' ) SyncManagerNew.syncAll_Running_Scheduled = bRunning;    
}


SyncManagerNew.syncAll_FromSchedule = function( cwsRenderObj )
{
    console.customLog( ' -- SyncManagerNew.syncAll_FromSchedule CALLED!!!' );

    // Only perform this on online mode - Skip this time if offline..
    if ( ConnManagerNew.isAppMode_Online() )
    {
        // If other syncs are running, delay it?
        if ( SyncManagerNew.sync_Running ) 
        {
            // Delay for some time... and call again?
            // We should simply queue the call with 'type'  <-- so we can decide to clear one type
            //      later..            
            MsgManager.msgAreaShow ( 'Auto Sync Skipped..' );
        }
        else
        {
            SyncManagerNew.syncAll( cwsRenderObj, 'Scheduled', function( success ) 
            {
            });  
        }
    }
};


// ===================================================
// === Sync All Msg to LS Methods =============

// After Login, we want to reset this 'SyncMsg'
SyncManagerNew.SyncMsg_Reset = function()
{
    SyncManagerNew.SyncMsg_SetAsNew();
};

SyncManagerNew.SyncMsg_SetAsNew = function()
{
    SyncManagerNew.syncMsgJson = Util.getJsonDeepCopy( SyncManagerNew.template_SyncMsgJson );
};

SyncManagerNew.SyncMsg_Get = function()
{
    if ( !SyncManagerNew.syncMsgJson ) SyncManagerNew.SyncMsg_SetAsNew();
        
    return SyncManagerNew.syncMsgJson;
};

SyncManagerNew.SyncMsg_InsertMsg = function( msgStr )
{
    try
    {
        var newMsgJson = { "msg": msgStr, "datetime": Util.formatDateTime( new Date() ) };
        SyncManagerNew.SyncMsg_Get().msgList.push( newMsgJson );
    }
    catch( errMsg )
    {
        console.customLog( 'Error SyncManagerNew.SyncMsg_InsertMsg, errMsg: ' + errMsg );
    }
};


SyncManagerNew.SyncMsg_InsertSummaryMsg = function( summaryMsgStr )
{
    var syncMsgJson = SyncManagerNew.SyncMsg_Get();  // SyncManagerNew.syncMsgJson??

    if ( syncMsgJson )
    {
        var newSummaryMsgJson = { "msg": summaryMsgStr };
        
        syncMsgJson.summaryList.push( newSummaryMsgJson );
    }
    else
    {
        console.customLog( 'Error SyncManagerNew.SyncMsg_InsertMsg, syncMsgJson undefined.' );
    }    
};

SyncManagerNew.SyncMsg_ShowBottomMsg = function()
{
    // TODO: Should do toggle of visible - if clicked again, hide it as well..
    //   ?? Where is the hiding logic?

    MsgAreaBottom.setMsgAreaBottom( function( syncInfoAreaTag ) 
    {
        var msgHeaderTag = syncInfoAreaTag.find( 'div.msgHeader' );
        var msgContentTag = syncInfoAreaTag.find( 'div.msgContent' );

        // 1. Set Header
        msgHeaderTag.append( Templates.syncMsg_Header );
        // TODO: Need to update the sync progress status.. and register 

        // 2. Set Body
        var syncMsgJson = SyncManagerNew.SyncMsg_Get();

        // Add Service Deliveries Msg
        SyncManagerNew.SyncMsg_createSectionTag( 'Services Deliveries', function( sectionTag, sectionLogTag )
        {
            for ( var i = 0; i < syncMsgJson.msgList.length; i++ )
            {
                //{ "msg": msgStr, "datetime": Util.formatDateTime( new Date() ) };
                var msgJson = syncMsgJson.msgList[i];
    
                var msgStr = msgJson.datetime + ' ' + msgJson.msg;
    
                sectionLogTag.append( '<div>' + msgStr + '</div>' );
            }

            msgContentTag.append( sectionTag );
        });


        // Add Summaries Msg
        SyncManagerNew.SyncMsg_createSectionTag( 'Summaries', function( sectionTag, sectionLogTag )
        {
            //var syncMsgJson = SyncManagerNew.SyncMsg_Get();

            for ( var i = 0; i < syncMsgJson.summaryList.length; i++ )
            {
                //{ "msg": msgStr, "datetime": Util.formatDateTime( new Date() ) };
                var msgJson = syncMsgJson.summaryList[i];
    
                sectionLogTag.append( '<div>' + msgJson.msg + '</div>' );
            }
    
            msgContentTag.append( sectionTag );
        });
    });
};


SyncManagerNew.SyncMsg_createSectionTag = function( sectionTitle, callBack )
{
    var sectionTag = $( Templates.syncMsg_Section );

    var sectionTitleTag = sectionTag.find( 'div.sync_all__section_title' ).html( sectionTitle );
    var sectionLogTag = sectionTag.find( 'div.sync_all__section_log' );

    callBack( sectionTag, sectionLogTag );
};

// ===================================================
// === OTHERS Methods =============
