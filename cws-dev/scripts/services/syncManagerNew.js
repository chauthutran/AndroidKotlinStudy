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

//SyncManagerNew.sync_Upload_Running = false;   // to avoid multiple syncRuns in parallel
//SyncManagerNew.sync_Download_Running = false; // for planned download sync

SyncManagerNew.imgAppSyncActionButton = $( '#imgAppDataSyncStatus' );
SyncManagerNew.subProgressBar = $( '#divProgressInfo' );
//.children()[0];
// $( '#divProgressBar.indeterminate' );


// If blockListObj were created and referened..  We could use cwsRenderObj instead..
SyncManagerNew.blockListObj;  // If

SyncManagerNew.template_SyncMsgJson = { 
    "msgList": [], // { "msg": "", "datetime": "" }
    "summaryList": []  // { "msg": "" }
};

SyncManagerNew.syncMsgJson;  // will get loaded on 1st use or on app startup

SyncManagerNew.template_SyncMsg_Header = `<div class="sync_all__header_title">Synchronization Services Deliveries</div>
    <div class="sync_all__anim i-sync-pending_36 rot_l_anim"></div>`;

SyncManagerNew.template_SyncMsg_Section = `<div class="sync_all__section">
      <div class="sync_all__section_title"></div>
      <div class="sync_all__section_log"></div>
  </div>`;


// ===================================================
// === MAIN 2 FEATURES =============

// 2. Run 'sync' on All activityItems
SyncManagerNew.syncAll = function( cwsRenderObj, runType, callBack )
{
    try
    {
        if ( SyncManagerNew.syncStart() )
        {
            SyncManagerNew.SyncMsg_InsertMsg( "Started sync_all.." );

            // initialise UI + animation
            SyncManagerNew.update_UI_StartSyncAll();
    
            // get activityItems (for upload) > not already uploaded (to be processed)
            SyncManagerNew.getActivityItems_ForSync( cwsRenderObj, function( itemDataList ){
    
                SyncManagerNew.syncUpItem_RecursiveProcess( itemDataList, 0, cwsRenderObj, function() 
                {
                    SyncManagerNew.SyncMsg_InsertMsg( "sync_all completed.." );
    

                    SyncManagerNew.SyncMsg_InsertSummaryMsg( "Sync postponed N.." );
                    SyncManagerNew.SyncMsg_InsertSummaryMsg( "Sync error N.." );


                    console.log( 'syncAll finished' );

                    SyncManagerNew.syncFinish();
                    SyncManagerNew.update_UI_FinishSyncAll();

                    if ( callBack ) callBack( true );
                });
            });
        }
        else
        {
            throw "Sync not ready";
        }
    }
    catch( errMsg )
    {
        SyncManagerNew.SyncMsg_InsertSummaryMsg( "sync_all failed - msg: " + errMsg );

        console.log( 'syncAll not run properly - ' + errMsg );

        SyncManagerNew.syncFinish();
        SyncManagerNew.update_UI_FinishSyncAll();
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
        //console.log( success ); //console.log( mongoClients );
        // S2. NOTE: Mark that download done as just log?
        var mongoClients = [];
        
        if ( returnJson && returnJson.response && returnJson.response.dataList ) mongoClients = returnJson.response.dataList;


        console.log( 'SyncManagerNew.downloadClients, after, downloadSuccess: ' + downloadSuccess );

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

//SyncManagerNew.checkCondition_SyncReady = function() // callBack_success, callBack_failure )
//{
//    return ConnManagerNew.isAppMode_Online();
//};


// ===================================================
// === 2. 'syncAll' Related Methods =============

SyncManagerNew.getActivityItems_ForSync = function( cwsRenderObj, callBack )
{    
    var uploadItems = [];
    
    var newList = ActivityDataManager.getActivityList().filter( a => ( a.status === Constants.status_queued || a.status === Constants.status_failed ) );
    //var myQueue = myItems.filter( a=>a.status == Constants.status_queued );
    //var myFailed = myItems.filter( a=>a.status == Constants.status_failed ); 
    uploadItems = Util.sortByKey( newList, 'created', undefined, 'Decending' ); // combined list

    callBack( uploadItems );

	//});
};

SyncManagerNew.syncUpItem_RecursiveProcess = function( itemDataList, i, cwsRenderObj, callBack )
{
    // length is 1  index 'i' = 0; next time 'i' = 1
    if ( itemDataList.length <= i )
    {
        // If index is equal or bigger to list, return back. - End reached.
        return callBack();        
    }
    else
    {    
        // CASE: NOTE: DURING syncAll, if Offline mode detected, cancel the syncAll process in the middle.
        if ( !ConnManagerNew.isAppMode_Online() )
        {
            SyncManagerNew.SyncMsg_InsertMsg( "App offline mode detected.  Stopping syncAll process.." );
            throw 'Stopping syncAll process due to app mode offline detected.';
        }
        else
        {
            var itemData = itemDataList[i];         
        
            var activityCardObj = new ActivityCard( itemData.activityId, cwsRenderObj );
    
            activityCardObj.performSyncUp( function( success ) {
    
                if ( !success ) console.log( 'activityItem sync not success, i=' + i + ', id: ' + itemData.activityId );
    
                // update on progress bar
                FormUtil.updateProgressWidth( ( ( i + 1 ) / itemDataList.length * 100 ).toFixed( 1 ) + '%' );
    
                // Process next item.
                SyncManagerNew.syncUpItem_RecursiveProcess( itemDataList, i + 1, cwsRenderObj, callBack );
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
        // TODO: 
        var activeUser = SessionManager.sessionData.login_UserName; //"qwertyuio2";  // Replace with 'loginUser'?  8004?    
        var dateRange_gtStr;

        var payloadJson = { 'find': {} };

        payloadJson.find = {
            "activities": { "$elemMatch": { "activeUser": activeUser } } 
        };

        // If last download date exists, search after that. Otherwise, get all
        var lastDownloadDateISOStr = AppInfoManager.getDownloadInfo();

        if ( lastDownloadDateISOStr ) 
        { 
            dateRange_gtStr = lastDownloadDateISOStr.replace( 'Z', '' );
            payloadJson.find.updated = { "$gte": dateRange_gtStr };
        }


        var loadingTag = undefined;

        WsCallManager.requestPost( '/PWA.syncDown', payloadJson, loadingTag, function( success, returnJson ) {

            // NOTE: IMPORTANT:
            // Activities could be old since we are downloading all client info.. - mark it to handle this later when converting to activity list
            //if ( mongoClientsJson && dateRange_gtStr ) mongoClientsJson.dateRange_gtStr = dateRange_gtStr;

            callBack( success, returnJson );
        });        
    }
    catch( errMsg )
    {
        console.log( 'Error in SyncManagerNew.downloadClients - ' + errMsg );
        callBack( false );
    }
};



// Perform Server Operation..
SyncManagerNew.downloadActivities = function( callBack )
{
    try
    {
        // TODO: 
        var activeUser = SessionManager.sessionData.login_UserName; //"qwertyuio1";  // Replace with 'loginUser'?  8004?    
        var dateRange_gtStr;
        //var url = 'https://pwa-dev.psi-connect.org/ws/PWA.activities';
		var payloadJson = {
            "activity": { 
                "activeUser": activeUser
            }
        };


        // If last download date exists, search after that. Otherwise, get all
        var lastDownloadDateISOStr = AppInfoManager.getDownloadInfo();

        if ( lastDownloadDateISOStr ) 
        { 
            dateRange_gtStr = lastDownloadDateISOStr.replace( 'Z', '' );

            payloadJson.activity[ 'activityDate.createdOnMdbUTC' ] = {
                "$gt": dateRange_gtStr
            };
        }


        var loadingTag = undefined;

        WsCallManager.requestPost( '/PWA.activities', payloadJson, loadingTag, function( success, mongoClientsJson ) {

            // NOTE: IMPORTANT:
            // Activities could be old since we are downloading all client info.. - mark it to handle this later when converting to activity list
            if ( mongoClientsJson && dateRange_gtStr ) mongoClientsJson.dateRange_gtStr = dateRange_gtStr;

            callBack( success, mongoClientsJson );
        });

        
    }
    catch( errMsg )
    {
        console.log( 'Error in SyncManagerNew.downloadActivities - ' + errMsg );
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
    FormUtil.rotateTag( SyncManagerNew.imgAppSyncActionButton, true );
};

SyncManagerNew.update_UI_FinishSyncAll = function()
{
    SyncManagerNew.hideProgressBar();
    FormUtil.rotateTag( SyncManagerNew.imgAppSyncActionButton, false );
};


SyncManagerNew.initializeProgressBar = function()
{

    $( SyncManagerNew.subProgressBar ).removeClass( 'indeterminate' );
    $( SyncManagerNew.subProgressBar ).addClass( 'determinate' );

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

SyncManagerNew.syncStart = function()
{
    var isOkToStart = false;

    // Return 'false' if there is already running one..
    if ( SyncManagerNew.sync_Running ) 
    {
        isOkToStart = false;
        // TODO: Change to popup message in the app
        alert( 'There is another sync job currenly running..' );        
    }
    else 
    {
        // If not already running sync in process, check the network mode
        // and set it as running
        if ( !ConnManagerNew.isAppMode_Online() )
        {
            alert( 'Sync not available with offline appMode status..' );            
        }
        else
        {
            SyncManagerNew.sync_Running = true;
            isOkToStart = true;    
        }        
    }

    return isOkToStart;
};

/*
SyncManagerNew.syncAllButtonChange = function()
{
    //showSyncIcon = ( ConnManagerNew.isAppMode_Online() );
    showSyncIcon = ConnManagerNew.isAppMode_Online();

    //if ( showSyncIcon )
    //{
    //    showSyncIcon = ( FormUtil.records_redeem_queued + FormUtil.records_redeem_failed  );
    //}
    
    // ( showSyncIcon ) ? $('#divAppDataSyncStatus').show() : $('#divAppDataSyncStatus').hide();
    // ( showSyncIcon ) ? $('#imgAppDataSyncStatus').show() : $('#imgAppDataSyncStatus').hide();

    if ( showSyncIcon )
    {
        //$('#divAppDataSyncStatus').show();
        $( '#imgAppDataSyncStatus' ).show();
        //$('#divAppDataSyncDownStatus').show(); 
        //$('#imgAppDataSyncStatus').show();        
    }
    else
    {
        //$('#divAppDataSyncStatus').hide();
        $( '#imgAppDataSyncStatus' ).hide();
        //$('#divAppDataSyncDownStatus').show(); 
        //$('#imgAppDataSyncStatus').hide()
    } 
};
*/


SyncManagerNew.syncAll_WithChecks = function()
{
    // automated sync process
}

SyncManagerNew.syncFinish = function()
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
                
        console.log( syncMsgJson );

        if ( !syncMsgJson ) syncMsgJson = Util.getJsonDeepCopy( SyncManagerNew.template_SyncMsgJson );    

        console.log( syncMsgJson );

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
        console.log( 'Error SyncManagerNew.SyncMsg_InsertMsg, syncMsgJson undefined.' );
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
        console.log( 'Error SyncManagerNew.SyncMsg_InsertMsg, syncMsgJson undefined.' );
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
        msgHeaderTag.append( SyncManagerNew.template_SyncMsg_Header );
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

        
        //    <div class="sync_all__section_msg">Show next sync: in 32m</div>
    });

};


SyncManagerNew.SyncMsg_createSectionTag = function( sectionTitle, callBack )
{
    var sectionTag = $( SyncManagerNew.template_SyncMsg_Section );

    var sectionTitleTag = sectionTag.find( 'div.sync_all__section_title' ).html( sectionTitle );
    var sectionLogTag = sectionTag.find( 'div.sync_all__section_log' );

    callBack( sectionTag, sectionLogTag );
}

// ===================================================
// === OTHERS Methods =============
