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

// ===================================================
// === MAIN 2 FEATURES =============

// 2. Run 'sync' on All activityItems
SyncManagerNew.syncAll = function( cwsRenderObj, runType, callBack )
{
    try
    {
        if ( SyncManagerNew.syncStart() )
        {
            // initialise UI + animation
            SyncManagerNew.update_UI_StartSyncAll();
    
            // get activityItems (for upload) > not already uploaded (to be processed)
            SyncManagerNew.getActivityItems_ForSync( cwsRenderObj, function( itemDataList ){
    
                SyncManagerNew.syncUpItem_RecursiveProcess( itemDataList, 0, cwsRenderObj, function() {
    
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
        console.log( 'syncAll not run properly - ' + errMsg );
        SyncManagerNew.syncFinish();
        if( callBack ) callBack( false );
    }
};


// NEW: JAMES: ----
SyncManagerNew.syncDown = function( cwsRenderObj, runType, callBack )
{
    // NOTE: We can check network connection here, or from calling place.  
    //  Choose to check on calling place for now.  ConnManagerNew.isAppMode_Online();

    // Retrieve data..
    SyncManagerNew.downloadClients( function( downloadSuccess, returnJson ) 
    {
        var changeOccurred = false;        
        //console.log( success ); //console.log( mongoClients );
        // S2. NOTE: Mark that download done as just log?
        var mongoClients = [];
        
        if ( returnJson && returnJson.response && returnJson.response.dataList ) mongoClients = returnJson.response.dataList;


        console.log( 'SyncManagerNew.downloadClients, after, downloadSuccess: ' + downloadSuccess );

        if ( !downloadSuccess ) 
        { 
            if ( callBack ) callBack( downloadSuccess, changeOccurred ); 
        }
        else
        {
            //DataFormatConvert.convertToActivityItems( mongoClients, function( newActivityItems ) 
            //SyncManagerNew.mergeDownloadedList( ----.getActivityList(), newActivityItems, function( changeOccurred ) 
            ClientDataManager.mergeDownloadedClients( mongoClients, function( changeOccurred_atMerge ) 
            {
                // S3. NOTE: Mark the last download at here, instead of right after 'downloadActivities'?
                LocalStgMng.lastDownload_Save( ( new Date() ).toISOString() );

                if ( callBack ) callBack( downloadSuccess, changeOccurred_atMerge );
            });
            
        }
    });    
};

// ===================================================
// === 1. 'syncUpItem' Related Methods =============

SyncManagerNew.checkCondition_SyncReady = function() // callBack_success, callBack_failure )
{
    return ConnManagerNew.isAppMode_Online();
};


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
        var lastDownloadDateISOStr = LocalStgMng.lastDownload_Get();

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
        var lastDownloadDateISOStr = LocalStgMng.lastDownload_Get();

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
    SyncManagerNew.updateSyncButton_UI_Animation( true, SyncManagerNew.imgAppSyncActionButton )

};

SyncManagerNew.update_UI_FinishSyncAll = function()
{
    SyncManagerNew.hideProgressBar();
    SyncManagerNew.updateSyncButton_UI_Animation( false, SyncManagerNew.imgAppSyncActionButton ); 
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
}

SyncManagerNew.updateSyncButton_UI_Animation = function( runAnimation, itemTagSyncButton )
{
    if ( runAnimation )
    {
        itemTagSyncButton.rotate({ count:999, forceJS: true, startDeg: 0 });
    }
    else
    {
        itemTagSyncButton.stop();
    }
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
        SyncManagerNew.sync_Running = true;
        isOkToStart = true;
    }

    return isOkToStart;
};

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
        $('#divAppDataSyncStatus').show(); 
        //$('#divAppDataSyncDownStatus').show(); 
        //$('#imgAppDataSyncStatus').show();        
    }
    else
    {
        $('#divAppDataSyncStatus').hide();
        //$('#divAppDataSyncDownStatus').show(); 
        //$('#imgAppDataSyncStatus').hide()
    } 
};


SyncManagerNew.syncAll_WithChecks = function()
{
    // automated sync process
}

SyncManagerNew.syncFinish = function()
{
    SyncManagerNew.sync_Running = false;  
};


// ===================================================
// === OTHERS Methods =============

SyncManagerNew.setBlockListObj = function( blockListObj )
{
    SyncManagerNew.blockListObj = blockListObj;
};
