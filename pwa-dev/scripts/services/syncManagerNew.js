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

// 2. Run 'sync' on All activityItems
// TRAN TODO : "runType" param doesn't get used in any places
SyncManagerNew.syncAll = function( cwsRenderObj, runType, callBack )
{
    try
    {
        // Move this out of this method..
        //if ( SyncManagerNew.syncStart_CheckNSet() )
        //{
            SyncManagerNew.SyncMsg_InsertMsg( 'syncAll ' + runType + ' Started..' );

            // initialise UI + animation
            SyncManagerNew.update_UI_StartSyncAll();

            // get activityItems (for upload) > not already uploaded (to be processed)
            // NOT APPLICABLE..  SHOULD CHECK WITHIN THE RecursiveProcess...
            //SyncManagerNew.getActivityItems_ForSync( function( activityDataList )
            //{
                SyncManagerNew.syncUpItem_RecursiveProcess( activityDataList, 0, cwsRenderObj, function() 
                {
                    var successMsg = 'syncAll ' + runType + ' completed..';
                    
                    console.customLog( successMsg );

                    SyncManagerNew.update_UI_FinishSyncAll();

                    SyncManagerNew.SyncMsg_InsertMsg( successMsg );

                    SyncManagerNew.SyncMsg_InsertSummaryMsg( "Sync postponed N.." );
                    SyncManagerNew.SyncMsg_InsertSummaryMsg( "Sync error N.." );

                    if ( callBack ) callBack( true );
                });
            //});
        //}
        //else
        //{
        //    throw "Sync not ready";
        //}
    }
    catch( errMsg )
    {
        var errMsgDetail = 'syncAll ' + runType + ' failed - msg: ' + errMsg;
        
        console.customLog( errMsgDetail );

        MsgManager.msgAreaShow( 'ERR: ' + errMsgDetail );

        SyncManagerNew.update_UI_FinishSyncAll();

        SyncManagerNew.SyncMsg_InsertSummaryMsg( errMsgDetail );

        if( callBack ) callBack( false );
    }
};


// NEW: JAMES: ----
SyncManagerNew.syncDown = function( cwsRenderObj, runType, callBack )
{
    // NOTE: We can check network connection here, or from calling place.  
    //  Choose to check on calling place for now.  ConnManagerNew.isAppMode_Online();
    SyncManagerNew.update_UI_StartSyncAll();

    SyncManagerNew.SyncMsg_InsertMsg( "download started.." );

    // Retrieve data..
    SyncManagerNew.downloadClients( function( downloadSuccess, returnJson ) 
    {
        SyncManagerNew.update_UI_FinishSyncAll();

        SyncManagerNew.SyncMsg_InsertMsg( "download finished.." );

        var changeOccurred = false;        
        //console.customLog( success ); //console.customLog( mongoClients );
        // S2. NOTE: Mark that download done as just log?
        var mongoClients = [];
        
        if ( returnJson && returnJson.response && returnJson.response.dataList ) mongoClients = returnJson.response.dataList;
        else if ( returnJson && returnJson.clientList ) mongoClients = returnJson.clientList;

        console.customLog( 'SyncManagerNew.downloadClients, after, downloadSuccess: ' + downloadSuccess );

        if ( !downloadSuccess ) 
        { 
            SyncManagerNew.SyncMsg_InsertMsg( "download result - not success.." );

            if ( callBack ) callBack( downloadSuccess, changeOccurred ); 
        }
        else
        {
            // 'download' processing data                
            var processingInfo = ActivityDataManager.createProcessingInfo_Success( Constants.status_downloaded, 'Downloaded and synced.' );

            SyncManagerNew.SyncMsg_InsertMsg( "downloaded " + mongoClients.length + " clients: " );

            SyncManagerNew.SyncMsg_InsertMsg( "Synchronizing..." );

            ClientDataManager.mergeDownloadedClients( mongoClients, processingInfo, function( changeOccurred_atMerge ) 
            {
                SyncManagerNew.SyncMsg_InsertMsg( "merged.." );
                SyncManagerNew.SyncMsg_InsertSummaryMsg( "downloaded " + mongoClients.length + " clients: " );


                // S3. NOTE: Mark the last download at here, instead of right after 'downloadActivities'?
                AppInfoManager.updateDownloadInfo(( new Date() ).toISOString()); 

                if ( callBack ) callBack( downloadSuccess, changeOccurred_atMerge );
            });
            
        }
    });    
};

// ===================================================
// === 1. 'syncUpItem' Related Methods =============

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


SyncManagerNew.checkActivityStatus_SyncUpReady = function( activity )
{    
    var bReady = false;

    try
    {
        if ( activity.processing && activity.processing.status )
        {
            var status = activity.processing.status;
            bReady = ( status === Constants.status_queued || status === Constants.status_failed );
        }    
    }
    catch( errMsg )
    {
        console.customLog( 'ERROR in SyncManagerNew.checkActivityStatus_SyncUpReady, errMsg: ' + errMsg );
    }

    return bReady;
};


SyncManagerNew.syncUpItem_RecursiveProcess = function( activityDataList, i, cwsRenderObj, callBack )
{
    // length is 1  index 'i' = 0; next time 'i' = 1
    if ( activityDataList.length <= i )
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
            throw 'Stopping syncAll process due to app mode offline detected.';
        }
        else
        {
            var activityData = activityDataList[i];         
        
            if ( !SyncManagerNew.checkActivityStatus_SyncUpReady( activityData ) )
            {
                // Process next item without performing..
                SyncManagerNew.syncUpItem_RecursiveProcess( activityDataList, i + 1, cwsRenderObj, callBack );
            }
            else
            {
                var activityCardObj = new ActivityCard( activityData.id, cwsRenderObj );
    
                // Highlight the activity..
                activityCardObj.highlightActivityDiv( true );
    
                activityCardObj.performSyncUp( function( success ) {
    
                    if ( !success ) console.customLog( 'activityItem sync not success, i=' + i + ', id: ' + activityData.id );
    
                    activityCardObj.reRenderActivityDiv();
    
                    activityCardObj.highlightActivityDiv( false );
    
                    // update on progress bar
                    FormUtil.updateProgressWidth( ( ( i + 1 ) / activityDataList.length * 100 ).toFixed( 1 ) + '%' );
        
                    // Process next item.
                    SyncManagerNew.syncUpItem_RecursiveProcess( activityDataList, i + 1, cwsRenderObj, callBack );
                });    
            }
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
        // TODO: 
        var activeUser = SessionManager.sessionData.login_UserName; //"qwertyuio2";  // Replace with 'loginUser'?  8004?    
        var dateRange_gtStr;

        var payloadJson = { 'find': {} };

        payloadJson.find = {
            "clientDetails.users": activeUser
            //"activities": { "$elemMatch": { "activeUser": activeUser } } 
        };

        // If last download date exists, search after that. Otherwise, get all
        var lastDownloadDateISOStr = AppInfoManager.getDownloadInfo();

        if ( lastDownloadDateISOStr ) 
        { 
            dateRange_gtStr = lastDownloadDateISOStr.replace( 'Z', '' );
            payloadJson.find[ 'date.updatedOnMdbUTC' ] = { "$gte": dateRange_gtStr };
        }

        var loadingTag = undefined;
        WsCallManager.requestPostDws( ConfigManager.getSyncDownSetting().url, payloadJson, loadingTag, function( success, returnJson ) {

            callBack( success, returnJson );
        });        
    }
    catch( errMsg )
    {
        console.customLog( 'Error in SyncManagerNew.downloadClients - ' + errMsg );
        callBack( false );
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

SyncManagerNew.syncStart_CheckNSet = function( option )
{
    var isOkToStart = false;

    var hideMsg = ( option && option.hideMsg );

    // Return 'false' if there is already running one..
    if ( SyncManagerNew.sync_Running ) 
    {
        isOkToStart = false;

        var msg = 'There is another sync job currenly running..';

        if ( !hideMsg ) MsgManager.msgAreaShow( msg );

        console.customLog( msg );
    }
    else 
    {
        // If not already running sync in process, check the network mode
        // and set it as running
        if ( !ConnManagerNew.isAppMode_Online() )
        {
            var msg = 'Sync not available with offline appMode status..';

            if ( !hideMsg ) MsgManager.msgAreaShow( msg );
    
            console.customLog( msg );
        }
        else
        {
            SyncManagerNew.sync_Running = true;
            isOkToStart = true;    
        }        
    }

    return isOkToStart;
};


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
                SyncManagerNew.syncFinish_Set();
            });  
        }
    }
};


SyncManagerNew.syncFinish_Set = function()
{
    SyncManagerNew.sync_Running = false;  
};


// ===================================================
// === Sync All Msg to LS Methods =============


// TODO: Load at load in memory on startup!!!!
SyncManagerNew.SyncMsg_Get = function()
{
    var syncMsgJson;

    if ( SyncManagerNew.syncMsgJson ) syncMsgJson = SyncManagerNew.syncMsgJson;
    else
    {
        syncMsgJson = AppInfoManager.getSyncMsg();
                
        console.customLog( syncMsgJson );

        if ( !syncMsgJson ) syncMsgJson = Util.getJsonDeepCopy( SyncManagerNew.template_SyncMsgJson );    

        console.customLog( syncMsgJson );

        SyncManagerNew.syncMsgJson = syncMsgJson;
    }
    
    return syncMsgJson;
};


SyncManagerNew.SyncMsg_InsertMsg = function( msgStr )
{
    var syncMsgJson = SyncManagerNew.SyncMsg_Get(); // SyncManagerNew.syncMsgJson??

    if ( syncMsgJson )
    {
        var newMsgJson = { "msg": msgStr, "datetime": Util.formatDateTime( new Date() ) };
    
        syncMsgJson.msgList.push( newMsgJson );
    
        AppInfoManager.updateSyncMsg( syncMsgJson );
    }
    else
    {
        console.customLog( 'Error SyncManagerNew.SyncMsg_InsertMsg, syncMsgJson undefined.' );
    }
};


SyncManagerNew.SyncMsg_InsertSummaryMsg = function( summaryMsgStr )
{
    var syncMsgJson = SyncManagerNew.SyncMsg_Get();  // SyncManagerNew.syncMsgJson??

    if ( syncMsgJson )
    {
        var newSummaryMsgJson = { "msg": summaryMsgStr };
        
        syncMsgJson.summaryList.push( newSummaryMsgJson );

        AppInfoManager.updateSyncMsg( syncMsgJson );
    }
    else
    {
        console.customLog( 'Error SyncManagerNew.SyncMsg_InsertMsg, syncMsgJson undefined.' );
    }    
};


// After Login, we want to reset this 'SyncMsg'
SyncManagerNew.SyncMsg_Reset = function()
{
    var syncMsgJson = Util.getJsonDeepCopy( SyncManagerNew.template_SyncMsgJson );
    
    SyncManagerNew.syncMsgJson = syncMsgJson;

    AppInfoManager.updateSyncMsg( syncMsgJson );
};


SyncManagerNew.SyncMsg_ShowBottomMsg = function()
{
    // TODO: Should do toggle of visible - if clicked again, hide it as well..
    //   ?? Where is the hiding logic?

    Templates.setMsgAreaBottom( function( syncInfoAreaTag ) 
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
            var syncMsgJson = SyncManagerNew.SyncMsg_Get();

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
}

// ===================================================
// === OTHERS Methods =============
