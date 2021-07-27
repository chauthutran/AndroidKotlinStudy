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
SyncManagerNew.coolDownEnabled = true;

// If scheduled syncAll gets delayed, 
SyncManagerNew.syncAll_conflictShortDelayTime = Util.MS_SEC * 10; // 10 secounds..
SyncManagerNew.syncAll_conflictShortDelayCall; // 

SyncManagerNew.imgAppSyncActionButtonId = '#imgAppDataSyncStatus';
SyncManagerNew.subProgressBarId = '#divProgressInfo';

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

        // During the 'sync', it updates the activity list..  
        // Thus, we get below list for just list of activityId..  Copy of the original list. 
        var activityIdCopyList = ActivityDataManager.getActivityIdCopyList();

        // NOTE: CHECK ONLINE is done within syncUpItem_RecursiveProcess
        SyncManagerNew.syncUpItem_RecursiveProcess( activityIdCopyList, 0, cwsRenderObj, resultData, function() 
        {
            SyncManagerNew.setSyncAll_Running( runType, false );
            SyncManagerNew.update_UI_FinishSyncAll();

            var successMsg = 'syncAll ' + runType + ' completed..';
            SyncManagerNew.SyncMsg_InsertMsg( successMsg );

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
        MsgManager.msgAreaShow( 'ERR: ' + errMsgDetail, 'ERROR' );

        console.customLog( errMsgDetail );

        if( callBack ) callBack( false );
    }
};


SyncManagerNew.syncDown = function( runType, callBack )
{
    SyncManagerNew.update_UI_StartSyncAll();
    SyncManagerNew.SyncMsg_InsertMsg( "download started.." );

    // Retrieve data..
    SyncManagerNew.downloadClients( function( downloadSuccess, returnJson, mockCase ) 
    {
        SyncManagerNew.update_UI_FinishSyncAll();

        var changeOccurred = false;        
 
        if ( !downloadSuccess ) 
        { 
            SyncManagerNew.SyncMsg_InsertMsg( "Failed on download, msg: " + Util.getStr( returnJson, 300 ) );

            if ( callBack ) callBack( downloadSuccess, changeOccurred ); 
        }
        else
        {
            var downloadedData = SyncManagerNew.formatDownloadedData( returnJson );
            var clientDwnLength = downloadedData.clients.length;
            downloadedData = ConfigManager.downloadedData_UidMapping( downloadedData );
                                
            // 'download' processing data                
            var processingInfo = ActivityDataManager.createProcessingInfo_Success( Constants.status_downloaded, 'Downloaded and synced.' );

            SyncManagerNew.SyncMsg_InsertMsg( "downloaded " + clientDwnLength + " clients" );

            ClientDataManager.setActivityDateLocal_clientList( downloadedData.clients );

            ClientDataManager.mergeDownloadedClients( downloadedData, processingInfo, function( changeOccurred_atMerge, mergedActivities ) 
            {
                var mergedActivityLength = mergedActivities.length;

                SyncManagerNew.SyncMsg_InsertMsg( "Merged " + mergedActivityLength + " activities.." );
                SyncManagerNew.SyncMsg_InsertSummaryMsg( "downloaded " + clientDwnLength + " clients, merged " + mergedActivityLength + " activities." );

                // S3. NOTE: Mark the last download at here, instead of right after 'downloadActivities'?
                AppInfoManager.updateSyncLastDownloadInfo(( new Date() ).toISOString()); 

                if ( callBack ) callBack( downloadSuccess, changeOccurred_atMerge, mockCase, mergedActivities );
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
        var activityCardObj = new ActivityCard( activityId );

        activityCardObj.highlightActivityDiv( true );

        activityCardObj.performSyncUp( function( success, errMsg ) 
        {
            // gAnalytics Event
            GAnalytics.setEvent( 'SyncEnded', activityId, success, 1 );
            //GAnalytics.setEvent = function(category, action, label, value = null) 
            // ?? might need to change parameters on how to count success vs failure..
            

            SyncManagerNew.syncUpActivity_ResultUpdate( success, resultData );

            // Cool Down Related Last synced time Set ...
            if ( SyncManagerNew.coolDownEnabled ) ActivityDataManager.setActivityLastSyncedUp( activityId );

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


SyncManagerNew.syncUpItem_RecursiveProcess = function( activityIdCopyList, i, cwsRenderObj, resultData, callBack )
{
    // length is 1  index 'i' = 0; next time 'i' = 1
    if ( activityIdCopyList.length <= i )
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
            var activityId = activityIdCopyList[i];         
        
            SyncManagerNew.syncUpActivity( activityId, resultData, function( syncReadyJson, syncUpSuccess ) 
            {
                // Update on progress bar
                FormUtil.updateProgressWidth( ( ( i + 1 ) / activityIdCopyList.length * 100 ).toFixed( 1 ) + '%' );

                // Process next item without performing..
                SyncManagerNew.syncUpItem_RecursiveProcess( activityIdCopyList, i + 1, cwsRenderObj, resultData, callBack );
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
    var readyJson = { 'ready': false, 'loggedIn': false, 'online': false, 'syncableStatus': false, 'coolDownPass': false };

    readyJson.loggedIn = SessionManager.Status_LoggedIn;
    readyJson.online = ConnManagerNew.isAppMode_Online();
    readyJson.syncableStatus = SyncManagerNew.checkActivityStatus_SyncUpReady( activityJson );
    readyJson.coolDownPass = ActivityDataManager.checkActivityCoolDown( activityJson.id );

    readyJson.ready = ( readyJson.loggedIn && readyJson.online && readyJson.syncableStatus && readyJson.coolDownPass );
    // For 'ResponseAction' scheduling case, we should stop the calling in background if 'syncableStatus' is false..
    //      For 'loggedIn' is false, (logged out case), should we stop it?  For now, have it running.
    //          The best would be 

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

// Gets called by 'SyncMsg_Reset' & if this is empty.. (by 'SyncMsg_Get')
SyncManagerNew.SyncMsg_SetAsNew = function()
{
    SyncManagerNew.syncMsgJson = Util.cloneJson( SyncManagerNew.template_SyncMsgJson );
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
        var newMsgJson = { "msg": msgStr, "datetime": Util.formatDateTime( new Date(), Util.dateType_DATETIME_s1 ) };
        SyncManagerNew.SyncMsg_Get().msgList.push( newMsgJson );

        //console.customLog( 'SyncManagerNew.SyncMsg: ' + JSON.stringify( newMsgJson ) );
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

        //console.customLog( 'SyncManagerNew.SummarySyncMsg: ' + JSON.stringify( newSummaryMsgJson ) );
    }
    else
    {
        //console.customLog( 'Error SyncManagerNew.SyncMsg_InsertMsg, syncMsgJson undefined.' );
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
    
                var msgStr = msgJson.datetime + '&nbsp; &nbsp;' + msgJson.msg;
    
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
// === Sync All Button (App Top) Click =============

SyncManagerNew.setAppTopSyncAllBtnClick = function()
{
    $( SyncManagerNew.imgAppSyncActionButtonId ).off( 'click' ).click( () => 
    {
        // if already running, just show message..
        // if offline, also, no message in this case about offline...              
        if ( SyncManagerNew.isSyncAll_Running() )
        {
            SyncManagerNew.SyncMsg_ShowBottomMsg();
        }
        else
        {
            // 1. SyncDown
            if ( ConfigManager.getSyncDownSetting().enable && ConnManagerNew.isAppMode_Online() ) 
            {
                SyncManagerNew.syncDown( 'manualClick_syncAll', function( success, changeOccurred ) 
                {        
                    if ( success ) 
                    {  
                        // NOTE: If there was a new merge, for now, alert the user to reload the list?
                        if ( changeOccurred )
                        {
                            // Display the summary of 'syncDown'.  However, this could be a bit confusing
                            SyncManagerNew.SyncMsg_ShowBottomMsg();

                            var btnRefresh = $( '<a class="notifBtn" term=""> REFRESH </a>');
        
                            $( btnRefresh ).click ( () => {
                                SessionManager.cwsRenderObj.renderArea( SessionManager.cwsRenderObj.areaList[ 0 ].id );
                            });
        
                            MsgManager.notificationMessage ( 'SyncDown data found', 'notifBlue', btnRefresh, '', 'right', 'top', 10000, false );
                        }
                    }
                    else MsgManager.msgAreaShow( 'SyncDown not successful.' );  // Add to syncAll history?
                });   
            }
                
        
            // 2. SyncUp All
            SyncManagerNew.syncAll( SessionManager.cwsRenderObj, 'Manual', function( success ) 
            {
                SyncManagerNew.SyncMsg_ShowBottomMsg();
            });  
        }
    });  
};


// ----------------------------------------------
// Msg Related...


SyncManagerNew.bottomMsgShow = function( statusVal, activityJson, activityCardDivTag )
{
    // If 'activityCardDivTag ref is not workign with fresh data, we might want to get it by activityId..
    MsgAreaBottom.setMsgAreaBottom( function( syncInfoAreaTag ) 
    {
        SyncManagerNew.syncResultMsg_header( syncInfoAreaTag, activityCardDivTag );
        SyncManagerNew.syncResultMsg_content( syncInfoAreaTag, activityCardDivTag, activityJson, statusVal );
    });
};

SyncManagerNew.syncResultMsg_header = function( syncInfoAreaTag, activityCardDivTag )
{        
    var divHeaderTag = syncInfoAreaTag.find( 'div.msgHeader' );
    var statusLabel = activityCardDivTag.find( 'div.activityStatusText' ).text();

    var syncMsg_HeaderPartTag = $( Templates.syncMsg_Header );
    syncMsg_HeaderPartTag.find( '.msgHeaderLabel' ).text = statusLabel;

    divHeaderTag.html( syncMsg_HeaderPartTag );
};


SyncManagerNew.syncResultMsg_content = function( syncInfoAreaTag, activityCardDivTag, activityJson, statusVal )
{
    var divBottomTag = syncInfoAreaTag.find( 'div.msgContent' );
    divBottomTag.empty();

    // 1. ActivityCard Info Add - From Activity Card Tag  
    divBottomTag.append( $( activityCardDivTag[ 0 ].outerHTML ) ); // << was activityJson.activityId

    // 2. Add 'processing' sync message.. - last one?
    Util.tryCatchContinue( function() 
    {
        var historyList = activityJson.processing.history;

        if ( historyList.length > 0 )
        {
            //var historyList_Sorted = Util.sortByKey_Reverse( activityJson.processing.history, "dateTime" );
            var latestItem = historyList[ historyList.length - 1];    
            var msgSectionTag = $( Templates.msgSection );

            msgSectionTag.find( 'div.msgSectionTitle' ).text( 'Response code: ' + Util.getStr( latestItem.responseCode ) );

            var formattedMsg = SyncManagerNew.getMsgFormatted( latestItem.msg, statusVal );
            msgSectionTag.find( 'div.msgSectionLog' ).text( formattedMsg );

            divBottomTag.append( msgSectionTag );
        }        
    }, "syncResultMsg_content, activity processing history lookup" );
};


SyncManagerNew.getMsgFormatted = function( msg, statusVal )
{
    var formattedMsg = '';

    if ( msg )
    {
        if ( statusVal === Constants.status_error || statusVal === Constants.status_failed ) 
        {
            if ( msg.indexOf( 'Value is not valid' ) >= 0 ) formattedMsg = 'One of the field has not acceptable value.';
            else if ( msg.indexOf( 'not a valid' ) >= 0 ) formattedMsg = 'One of the field has wrong Dhis2 Uid in the country setting.';
            else if ( msg.indexOf( 'Voucher not in Issue status' ) >= 0 ) formattedMsg = 'The voucher is not in issue status.';
            else if ( msg.indexOf( 'Repeat Fail Marked as ERROR' ) >= 0 ) formattedMsg = 'Marked as error status due to more than 10 failure in sync attempts.';
            else if ( msg.indexOf( 'Multiple vouchers with the code exists' ) >= 0 ) formattedMsg = 'Found multiple vouchers with the voucherCode.';
            else
            {
                if ( msg.length > 140 ) formattedMsg = msg.substr( 0, 70 ) + '....' + msg.substr( msg.length - 71, 70 );
                else formattedMsg = msg;
            }
        }   
        else formattedMsg = Util.getStr( msg, 200 );
    }

    return formattedMsg;
};


// ===================================================
// === OTHERS Methods =============
