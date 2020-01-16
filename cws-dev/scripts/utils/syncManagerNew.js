// =========================================
// Pseudo Code - of this class
//      High Level Features & Process..
//  Sync Manager Do?
//
//  Run Sync On Item?
//  Run Sync On All Items?

//      RunSyncOnAllItems();
//          - CheckConditions
//             - CheckItemStatus
//                 - RunRedeem (RunTask)
//                      - What do we do After Runn..

// -------------------------------------------------
// -- TODO:
//      - Create Pseudo Codes with Flow of App (High Level --> to Lower Level)
//      - Lvl 1. --> The Expected Features of this class..
//          1. Running 'Sync' on Item --> Submit Offline(?) Item to Server to process operation.
//              - Maybe we should split the terms --> SyncUp, SyncDown
//                 [Manual Run]
//              'SyncItem()';  // 'SyncUpItem();
//
//          2. 'SyncAll' - all the list of items, perform Sync.
//                 [Manual Run]
//
//          3. 'ScheduleSync' - Start running the scheduled sync on the background.
//          
//      - Lvl 2. Go through each of 'Lvl 1' Methods to put general operation logics
//
//          OP1. ""'Sync' on a item"
//              A. Check on Network Status.
//              B. Submit/Perform the operation of item on server..
//              B1(?). Update Data based on B
//              C. Update The App/UI of changes
//
//      - Lvl 3.
//              A. Check on Network Status / Data Server Online Check  <-- Simple One check
//                 If ( SubmitPossibleCheck() ) Fails --> Notify User NetworkCondition is Bad.
//                      'lastAttmeptDateTime' update?
//                  CheckAppNetwork();
//                  Method - 'CheckNetworkNDataServer()'

//              B. Perform Submit on Server - Of Operation.
//                  Method - 'PerformDataSeverSubmit()'

//                      Method - 'OnSbumitFail()'
//                          Fail - 'No Return' with HTTP ReponseCode 404? --> Update Status of Item..
//                      Method - 'OnSubmitSuccess()'
//                        Success - 'Return with response' --> Data Analyze + Update UI

//              C. 
//                      - Update item data with response info..
//                          Method - UpdateItemData( responeInfo );
//                      - Update UI of item.
//                             (UI - Item removal upon success not here, yet)
//                          Method - UpdateUiOfItem() <-- This shoudl be a methond in some other class.  We should just call it.
//
//      - HAPPY CODING!!
//
// -------------------------------------------------

function syncManagerNew()  {};

/*
syncManager.storage_offline_SyncExecutionTimerInterval;          //uses setTimeout
syncManager.storage_offline_SyncConditionsTimerInterval;    //uses setInterval
syncManager.syncTimer;

syncManager.appShell;
syncManager.dcdConfig;
syncManager.offLineData;
syncManager.cwsRenderObj;

syncManager.dataQueued = {};
syncManager.dataFailed = {};
syncManager.dataCombine = {};

syncManager.subProgressBar;

syncManager.conditionsCheckTimer = 0;
syncManager.syncAutomationRunTimer = 0;

syncManager.pauseProcess = false;
syncManager.lastSyncAttempt = 0;
syncManager.lastSyncSuccess = 0;

//syncManager.debugMode = WsApiManager.isDebugMode;

syncManager.syncAutomationInteruptedTimer = 0;
syncManager.progClass;
*/


// ??
syncManagerNew.startSync = function() 
{
};


// One of the main call - We should try to keep this as simple as possible...
syncManagerNew.syncItem = function( itemJson, itemTag ) 
{
    // if there is error, it will be handled within the method..
    syncManagerNew.checkCondition_SyncReady( function() {

        var activityItem = new ActivityItem( itemJson, itemTag ); // cwsRenderObj

        activityItem.updateItem_UI_StartSync();

        // Calls Server
        syncManagerNew.performActivity( function( success, responseJson ) {
            // For both 'success' / 'failure' of response..

            activityItem.updateItem_Data( success, responseJson, function(){

                activityItem.updateItem_UI_FinishSync();

            } );

            //activityItem.updateItem_UI_FinishSync();

        });

    }, function ( errJson ) {
        console.log( 'Sync condition failed - ' + errJson );
    });
};



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
syncManagerNew.performActivity = function( callBack )
{

    // if the activity type is 'redeem'..
    FormUtil.submitRedeem( itemData, undefined, function( success, returnJson ) {

        callBack( success, returnJson );

    });
};




    // Promise - easily catch error..
    /*
    syncManagerNew.checkCondition_SyncReady().then( function() {

    }).catch( function( err ) {
        console.log( 'error during SyncReadyCheck - ' + err );
    });
    */


//syncManagerNew.checkCondition_SyncReady = async function()
//{
//    return ; // return promise..  new Promise(..)
//}
