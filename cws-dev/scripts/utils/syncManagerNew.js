// =========================================
// -------------------------------------------------
// -- Pseudo WriteUp:   Create Pseudo Codes with Flow of App (High Level --> to Lower Level)
//
//      - LVL 1. The Expected Features of this class..
//          1. Running 'Sync' on Item --> Submit Offline(?) Item to Server to process operation.  MORE: SyncUp, SyncDown
//          2. 'SyncAll' - all the list of items, perform Sync.
//          3. 'ScheduleSync' - Start running the scheduled sync on the background.
//          
//      - LVL 2. Go through each of 'Lvl 1' Methods to put general operation logics
//          OP1. ""'Sync' on a item"
//              A. Check on Network Status.
//              B. Submit/Perform the operation of item on server..
//              B1(?). Update Data based on B
//              C. Update The App/UI of changes
//
// -------------------------------------------------
//  TODO:
//      1. Make a real call from outside to 'syncItem'  <--- tie to a button..
//      2. Fix the error case handling during 'syncItem'
// -------------------------------------------------

function syncManagerNew()  {};

syncManagerNew.sync_Running = false;   // to avoid multiple syncRuns in parallel

//syncManagerNew.sync_Upload_Running = false;   // to avoid multiple syncRuns in parallel
//syncManagerNew.sync_Download_Running = false; // for planned download sync

syncManagerNew.imgAppSyncActionButton = $( '#imgAppDataSyncStatus' );
syncManagerNew.subProgressBar = $( '#divProgressBar' ).children()[0];

syncManagerNew.progClass;

// ===================================================
// === MAIN 3 FEATURES =============

// 1. Run 'sync' activity on one item
syncManagerNew.syncItem = function( itemJson, itemTag, cwsRenderObj, callBack )
{
    // if there is error, it will be handled within the method..
    syncManagerNew.checkCondition_SyncReady( function() {

        var activityItem = new ActivityItem( itemJson, itemTag, cwsRenderObj );

        // run UI animations
        activityItem.updateItem_UI_StartSync();

        // Calls Server
        syncManagerNew.performActivity( itemJson, function( success, responseJson ) {

            // For both 'success' / 'failure' of response..
            // think about handling special responseJson 'commands/actions' received from server here (e.g server telling PWA to perform some special action based on content received)

            // TODO: ISSUE WITH THIS!!  We should always process this regardless of error in here!!!
            //  - with this design of 'callback', it only calls back / return, if things are successful.
            //      Solution --> return failed cases or do not use 'callback'.. (in places we do not need to?)

            activityItem.updateItem_Data( success, responseJson, function(){

                activityItem.updateItem_UI_FinishSync();

                callBack();

            } );

        });

    }, function ( errJson ) {
        console.log( 'Sync condition failed - ' + errJson );
    });
};


// 2. Run 'sync' activity on one item
syncManagerNew.startSync_UploadMany = function( btnTag, cwsRenderObj, callBack )
{
    // check upload sync process not already running
    if ( syncManagerNew.syncManyConditions( btnTag ) )
    {
        // get syncItems (for upload)
        syncManagerNew.getSync_UploadItems( function( syncItems ){

            // initialise UI + animation
            syncManagerNew.update_UI_StartSync();

            // syncRunning 'flag'
            syncManagerNew.sync_Running = true;

            for ( var s = 0; s < syncItems.length; s++ )
            {
                // @Tran/@James: callBack or Promise ?
                syncManagerNew.syncItem( itemJson, itemTag, cwsRenderObj, function(){

                    FormUtil.updateProgressWidth( ( s + 1 ) / syncItems.length );

                } )

            }

            syncManagerNew.finishSync_UploadMany()
            
            callBack();

        } )

    }

};


// ===================================================
// === 1. 'syncItem' Related Methods =============

syncManagerNew.checkCondition_SyncReady = function( callBack_success, callBack_failure )
{
    try
    {
        // Check Network Connectivity + Check Server Availability
        if ( ConnManager.networkSyncConditions() ) 
        {
            callBack_success();
        }
        else
        {
            callBack_failure();
        }

    }
    catch( err )
    {

        console.log( 'Error in syncManagerNew.checkCondition_SyncReady' );
        console.log( err );
        // Flag for error?
        if ( callBack_failure ) callBack_failure();
    }
};


// Perform Server Operation..
syncManagerNew.performActivity = function( itemData, callBack )
{

    // if the activity type is 'redeem'..
    FormUtil.submitRedeem( itemData, undefined, function( success, returnJson ) {

        callBack( success, returnJson );

    });

};


syncManagerNew.syncManyConditions = function( btnTag )
{
    // condition 1: not already running upload sync
    return ( ! syncManagerNew.sync_Running )
};

syncManagerNew.getSync_UploadItems = function( callBack )
{

    // get all dataItems belonging to current user, filtered for [Queued] + [Failed]
	DataManager.getData( Constants.storageName_RedeemList, function( activityList ) {

		if ( activityList && activityList.list )
		{
			var myItems = activityList.list.filter( a => a.owner == FormUtil.login_UserName );
			var myQueue = myItems.filter( a=>a.status == Constants.status_queued );
            var myFailed = myItems.filter( a=>a.status == Constants.status_failed ); 
            var uploadItems = myQueue.concat( myFailed ); //combined list

			if ( retFunc ) retFunc( uploadItems );
		}
		else
		{
			if ( retFunc ) retFunc( undefined );
		}

	});

};

syncManagerNew.update_UI_StartSync = function()
{
    // initialise ProgressBar Defaults
    syncManagerNew.initializeProgressBar();

    // animate syncButton 'running' 
    syncManagerNew.updateSyncButton_UI_Animation( true, syncManagerNew.imgAppSyncActionButton )

};

syncManagerNew.initializeProgressBar = function()
{

    $( syncManagerNew.subProgressBar ).removeClass( 'indeterminate' );
    $( syncManagerNew.subProgressBar ).addClass( 'determinate' );

    FormUtil.updateProgressWidth( 0 );
    FormUtil.showProgressBar( 0 );
};

syncManagerNew.hideProgressBar = function()
{

    FormUtil.hideProgressBar();

    $( syncManager.subProgressBar ).removeClass( 'determinate' );
    $( syncManager.subProgressBar ).addClass( 'indeterminate' );
}

syncManagerNew.updateSyncButton_UI_Animation = function( runAnimation, itemTagSyncButton )
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

syncManagerNew.finishSync_UploadMany = function()
{
    syncManagerNew.hideProgressBar();
    syncManagerNew.updateSyncButton_UI_Animation( false, syncManagerNew.imgAppSyncActionButton );

    syncManagerNew.sync_Running = false;

};




// Promise - easily catch error..
//syncManagerNew.checkCondition_SyncReady().then( function() {
//}).catch( function( err ) {
//    console.log( 'error during SyncReadyCheck - ' + err );
//});
//syncManagerNew.checkCondition_SyncReady = async function()
//{
//    return ; // return promise..  new Promise(..)
//}