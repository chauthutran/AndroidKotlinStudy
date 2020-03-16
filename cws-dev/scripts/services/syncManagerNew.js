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

// 1. Run 'sync' on a activityItem
SyncManagerNew.syncItem = function( activityItem, callBack )
{
    try
    {
        // if there is error, it will be handled within the method..
        if ( SyncManagerNew.checkCondition_SyncReady() )
        {
            // run UI animations
            activityItem.updateItem_UI_StartSync();

            // Calls Server
            SyncManagerNew.performActivity( activityItem.itemJson, function( success, responseJson ) {

                // mark in activityItem of success...
                activityItem.updateItem_Data( success, responseJson, function() {

                    activityItem.updateItem_UI_FinishSync();

                    callBack( success );
                } );
            });
        }
        else
        {
            console.log( 'checkCondition_SyncReady Failed' );
            callBack( false );
        }
    }
    catch( errMsg )
    {
        // NOTE: Even with error, we want to return with 'callBack' since we want next item to continue if multiple run case.
        console.log( 'Error happened during SyncManagerNew.syncItem - ' + errMsg );
        callBack( false );
    }
};


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
    
                SyncManagerNew.syncItem_RecursiveProcess( itemDataList, 0, cwsRenderObj, function() {
    
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
    SyncManagerNew.downloadActivities( function( downloadSuccess, mongoClients ) 
    {
        var changeOccurred = false;        
        //console.log( success ); //console.log( mongoClients );
        // S2. NOTE: Mark that download done as just log?

        if ( !downloadSuccess ) 
        { 
            if ( callBack ) callBack( downloadSuccess, changeOccurred ); 
        }
        else
        {
            // For each client record, convert to activity and add it..
            DataFormatConvert.convertToActivityItems( mongoClients, function( newActivityItems ) 
            {
                SyncManagerNew.mergeDownloadedList( ActivityListManager.getActivityList(), newActivityItems, function( changeOccurred ) 
                {
                    // S3. NOTE: Mark the last download at here, instead of right after 'downloadActivities'?
                    LocalStgMng.lastDownload_Save( ( new Date() ).toISOString() );

                    if ( callBack ) callBack( downloadSuccess, changeOccurred );
                });
            });
        }
    });    
};

// ===================================================
// === 1. 'syncItem' Related Methods =============

SyncManagerNew.checkCondition_SyncReady = function() // callBack_success, callBack_failure )
{
    return ConnManagerNew.isAppMode_Online();
};


// Perform Server Operation..
SyncManagerNew.performActivity = function( itemData, callBack )
{
    try
    {
        // if the activity type is 'redeem'..
        //FormUtil.submitRedeem( itemData, undefined, function( success, returnJson ) {
        FormUtil.submitRedeem( itemData.data.url, itemData.data.payloadJson, itemData.data.actionJson, undefined, function( success, returnJson ) {
            callBack( success, returnJson );
        });
    }
    catch( errMsg )
    {
        console.log( 'Error in SyncManagerNew.performActivity - ' + errMsg );
        callBack( false );
    }
};


// ===================================================
// === 2. 'syncAll' Related Methods =============

SyncManagerNew.getActivityItems_ForSync = function( cwsRenderObj, callBack )
{    
    var uploadItems = [];
    
    var newList = ActivityListManager.getActivityList().filter( a => ( a.status === Constants.status_queued || a.status === Constants.status_failed ) );
    //var myQueue = myItems.filter( a=>a.status == Constants.status_queued );
    //var myFailed = myItems.filter( a=>a.status == Constants.status_failed ); 
    uploadItems = Util.sortByKey( newList, 'created', undefined, 'Decending' ); // combined list

    callBack( uploadItems );

	//});
};

SyncManagerNew.syncItem_RecursiveProcess = function( itemDataList, i, cwsRenderObj, callBack )
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

        var divItemTag = $( '#listItem_table_' + itemData.id ).parent( 'div.listItem' );

        var activityItem = new ActivityItem( itemData, divItemTag, cwsRenderObj );

        // Process the item
        SyncManagerNew.syncItem( activityItem, function( success ) {

            if ( !success ) console.log( 'activityItem sync not success, i=' + i + ', id: ' + itemData.id );

            // update on progress bar
            FormUtil.updateProgressWidth( ( ( i + 1 ) / itemDataList.length * 100 ).toFixed( 1 ) + '%' );

            // Process next item.
            SyncManagerNew.syncItem_RecursiveProcess( itemDataList, i + 1, cwsRenderObj, callBack );
        });
    }
};


// ===================================================
// === 2. 'syncDown' Related Methods =============

// Perform Server Operation..
SyncManagerNew.downloadActivities = function( callBack )
{
    try
    {
        // TODO: 
        var activeUser = "qwertyuio1";  // Replace with 'loginUser'?  8004?    
        var dateRange_gtStr;
        //var url = 'https://pwa-dev.psi-connect.org/ws/PWA.activities';
        var url = WsApiManager.wsApi_NEW_Dev + '/PWA.activities';
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

        FormUtil.wsSubmitGeneral( url, payloadJson, loadingTag, function( success, mongoClientsJson ) {

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


SyncManagerNew.mergeDownloadedList = function( mainList, newList, callBack )
{
    var changeOccurred = false;
    var newList_filtered = [];

    // Check list for matching activityId
    //  If does not exists in mainList, put into the mainList..
    //  If exists, and if new one is later one, copy the content into main item (merging) 

    for ( var i = 0; i < newList.length; i++ )
    {        
        var newItem = newList[i];
        var existingItem = Util.getFromList( mainList, newItem.id, "id" );

        try
        {
            // If matching id item(activity) already exists in device, 
            // if mongoDB one is later one, overwrite the device one.  // <-- test the this overwrite..
            if ( existingItem )
            {
                if ( newItem.created > existingItem.created ) 
                {
                    // Merge newItem into existingItem (it does not delete existing attributes)
                    Util.mergeJson( existingItem, newItem );
                    //console.log( 'Item content merged' );
                    changeOccurred = true;
                }
                //else console.log( 'Item content not merged - new one not latest..' );
            }
            else
            {
                // If not existing on device, simply add it.
                newList_filtered.push( newItem );
                //console.log( 'Item content merged' );
                changeOccurred = true;
            }
        }
        catch( errMsg )
        {
            console.log( 'Error during SyncManagerNew.mergeDownloadedList: ' );
            console.log( newItem );
            console.log( existingItem );
        }
    }


    // if new list to push to mainList exists, add to the list.
    if ( newList_filtered.length > 0 ) 
    {
        // 'changeOccurred' already set to 'true' when adding to 'newList_filtered' above.
        Util.appendArray( mainList, newList_filtered );
    }


    if ( changeOccurred ) 
    {
        ActivityListManager.saveCurrent_ActivitiesStore( function() {
            if ( callBack ) callBack( changeOccurred );
        });
    } 
    else 
    {
        if ( callBack ) callBack( changeOccurred );
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

    $( syncManager.subProgressBar ).removeClass( 'determinate' );
    $( syncManager.subProgressBar ).addClass( 'indeterminate' );
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
