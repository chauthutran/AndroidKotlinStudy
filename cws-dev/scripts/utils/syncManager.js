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

function syncManager()  {};

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

// -----------------------------
// syncManager: uses timerInterval for 'conditionCheck', then uses timeOut to call automated Sync (unless already clicked by user)
// -----------------------------

syncManager.initialize = function( cwsRenderObj ) 
{
    syncManager.cwsRenderObj = cwsRenderObj;
    syncManager.updateInitVars();
    syncManager.subProgressBar = $( '#divProgressBar' ).children()[0]; /* store progress bar class - to be upgraded to it's own class later */
    syncManager.progClass = syncManager.subProgressBar.className;

    if ( WsApiManager.isDebugMode ) console.log( 'initialize syncManager >> syncManager.storage_offline_SyncConditionsTimerInterval: ' + syncManager.storage_offline_SyncConditionsTimerInterval + ' syncManager.storage_offline_SyncExecutionTimerInterval: ' + syncManager.storage_offline_SyncExecutionTimerInterval + ' {syncManager.conditionsCheckTimer: ' + syncManager.conditionsCheckTimer + '}');
}

syncManager.reinitialize = function( cwsRenderObj )
{
    if ( syncManager.conditionsCheckTimer )
    {
        clearInterval( syncManager.conditionsCheckTimer );
            syncManager.conditionsCheckTimer = 0;
    }

    if ( syncManager.syncAutomationRunTimer )
    {
        clearTimeout( syncManager.syncAutomationRunTimer );
        syncManager.syncAutomationRunTimer = 0;
    }

    syncManager.cwsRenderObj = cwsRenderObj;
    syncManager.updateInitVars();

    if ( WsApiManager.isDebugMode ) console.log( 'restarted syncManager.scheduledSyncConditionsTest >> syncManager.storage_offline_SyncConditionsTimerInterval: ' + syncManager.storage_offline_SyncConditionsTimerInterval + ' syncManager.storage_offline_SyncExecutionTimerInterval: ' + syncManager.storage_offline_SyncExecutionTimerInterval + ' {syncManager.conditionsCheckTimer: ' + syncManager.conditionsCheckTimer + '}');

}


// Comments on what this does:
syncManager.updateInitVars = function()
{
    syncManager.cwsRenderObj.updateFromSession();

    if ( WsApiManager.isDebugMode ) console.log( '>> syncManager.cwsRenderObj.storage_offline_SyncExecutionTimerInterval: ' + syncManager.cwsRenderObj.storage_offline_SyncExecutionTimerInterval + ', syncManager.cwsRenderObj.storage_offline_SyncConditionsTimerInterval: ' + syncManager.cwsRenderObj.storage_offline_SyncConditionsTimerInterval);

    syncManager.storage_offline_SyncConditionsTimerInterval = syncManager.cwsRenderObj.storage_offline_SyncConditionsTimerInterval;
    syncManager.storage_offline_SyncExecutionTimerInterval = syncManager.cwsRenderObj.storage_offline_SyncExecutionTimerInterval;

    if ( syncManager.storage_offline_SyncConditionsTimerInterval > 0 )
    {
        syncManager.conditionsCheckTimer = setInterval( function() {
            syncManager.scheduledSyncConditionsTest();
        }, syncManager.storage_offline_SyncConditionsTimerInterval );
    }

}

syncManager.evalDataListContent = function( callBack )
{
    if ( FormUtil.checkLogin() ) // correct valid-login test?
    {

        if ( syncManager.cwsRenderObj )
        {
            console.log('~ syncManager: getMyListData');

            if ( callBack ) callBack();

        }
    }

}

syncManager.evalSyncConditions = function()
{
    if ( FormUtil.checkLogin() ) // correct valid-login test?
    {
        if ( ConnManager.networkSyncConditions() )
        {
            if ( syncManager.dataQueued.length + syncManager.dataFailed.length )
            {
                $( '#divAppDataSyncStatus' ).show();
                $( '#imgAppDataSyncStatus' ).show();

                return true;
            }
            else
            {
                $( '#divAppDataSyncStatus' ).hide();
                $( '#imgAppDataSyncStatus' ).hide();

                return false;
            }
        }
        else
        {
            $( '#divAppDataSyncStatus' ).hide();
            $( '#imgAppDataSyncStatus' ).hide();

            return false;
        }
    }
    else
    {
        $( '#divAppDataSyncStatus' ).hide();
        $( '#imgAppDataSyncStatus' ).hide();

        return false;  
    }
}

// Check to see if it could start the sync process - in background..
//      - has sync in background turned off or not
//      - Is there a sync process going on already
//      - More Checks?
//      - This Runs the Sync Process... <-- 
syncManager.scheduledSyncConditionsTest = function()
{
    if ( syncManager.evalSyncConditions() )
    {
        if ( WsApiManager.isDebugMode ) console.log ( 'STARTING >> scheduledSyncConditionsTest.GOOD, syncManager.syncAutomationInteruptedTimer: ' + syncManager.syncAutomationInteruptedTimer + ', syncManager.syncAutomationRunTimer: ' + syncManager.syncAutomationRunTimer + ', FormUtil.syncRunning: ' + FormUtil.syncRunning + ', syncManager.storage_offline_SyncConditionsTimerInterval: ' + syncManager.storage_offline_SyncConditionsTimerInterval + ', syncManager.lastSyncAttempt: ' + syncManager.lastSyncAttempt );
        // NO interupted timer exists AND NO existing timer AND syncProcess NOT CURRENTLY RUNNING (clicked icon)
        if ( ( !syncManager.syncAutomationInteruptedTimer 
                && !syncManager.syncAutomationRunTimer 
                && syncManager.syncAutomationRunTimer == 0 ) 
            && ( !FormUtil.syncRunning ) )
        {
            if ( WsApiManager.isDebugMode ) console.log( 'if test 1' );
            syncManager.scheduleSyncAutomationRun();
        }
        // interupted timer exists AND equal to existing timer AND syncProcess NOT CURRENTLY RUNNING
        else if ( ( syncManager.syncAutomationInteruptedTimer  
                    && syncManager.syncAutomationRunTimer ) 
                && ( syncManager.syncAutomationInteruptedTimer == syncManager.syncAutomationRunTimer ) 
                && ( !FormUtil.syncRunning ) )
        {
            if ( WsApiManager.isDebugMode ) console.log( 'if test 2' );
            syncManager.scheduleSyncAutomationRun();
        }
        // no timer exists (sync = OFF) AND no existing timer AND syncProcess NOT CURRENTLY RUNNING (i.e. manual sync clicked)
        else if ( syncManager.storage_offline_SyncConditionsTimerInterval ==0 
                && !syncManager.syncAutomationRunTimer 
                && !FormUtil.syncRunning ) 
        {
            if ( WsApiManager.isDebugMode ) console.log( 'if test 3' );
            syncManager.scheduleSyncAutomationRun();
        }
        else
        {
            if ( WsApiManager.isDebugMode ) 
            {
                console.log( ' no run, no test passed' );
                console.log( ' ~ syncManager.syncAutomationInteruptedTimer: ' + syncManager.syncAutomationInteruptedTimer );
                console.log( ' ~ syncManager.syncAutomationRunTimer: ' + syncManager.syncAutomationRunTimer );
                console.log( ' ~ FormUtil.syncRunning: ' + FormUtil.syncRunning );
                console.log( ' ~ syncManager.storage_offline_SyncConditionsTimerInterval: ' + syncManager.storage_offline_SyncConditionsTimerInterval );
            }
        }
        //if ( WsApiManager.isDebugMode ) console.log ( 'ENDING >> scheduledSyncConditionsTest.GOOD, syncManager.syncAutomationInteruptedTimer: ' + syncManager.syncAutomationInteruptedTimer + ', syncManager.syncAutomationRunTimer: ' + syncManager.syncAutomationRunTimer + ', FormUtil.syncRunning: ' + FormUtil.syncRunning + ', syncManager.storage_offline_SyncConditionsTimerInterval: ' + syncManager.storage_offline_SyncConditionsTimerInterval + ', syncManager.lastSyncAttempt: ' + syncManager.lastSyncAttempt );
    }
    else
    {
        if ( syncManager.syncAutomationRunTimer )
        {
            clearTimeout( syncManager.syncAutomationRunTimer );
            syncManager.syncAutomationInteruptedTimer = syncManager.syncAutomationRunTimer;
        }
    }

}

// Clearly define what is 'syncRun()', 'BackgroundSchedule/Start()'
syncManager.scheduleSyncAutomationRun = function()
{
    if ( syncManager.storage_offline_SyncExecutionTimerInterval > 0 )
    {
        syncManager.syncAutomationRunTimer = setTimeout( function() {
            syncManager.syncOfflineData();
        }, syncManager.storage_offline_SyncExecutionTimerInterval );
    }

    if ( WsApiManager.isDebugMode ) console.log ( 'syncAutomationRunTimer [' + syncManager.syncAutomationRunTimer + '] to run in ' +syncManager.storage_offline_SyncExecutionTimerInterval+'ms : ' + (new Date() ).toISOString() );
}

// 'syncRun()?'
SyncManager.runManualSync = function( itemData, btnTag, callBack )
{
    // Maybe a little bit more clear condition description? names?
    if ( ( ( itemData.networkAttempt == undefined ) 
        || ( itemData.networkAttempt != undefined 
            && itemData.networkAttempt < syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit ) ) 
        && ( itemData.status != syncManager.cwsRenderObj.status_redeem_submit ) )
    {
        // Initialize the array for dealing with - indexedDB update/save list - do it just once at the end of handling the list.

        syncManager.dataCombine = [];
        syncManager.dataCombine.push( itemData );

        DataManager.saveData( 'syncList', { 'dataList': [] }, function() {

            syncManager.lastSyncSuccess = 0;
            syncManager.syncItemData ( 0, btnTag, callBack )

        });
    }

}

syncManager.syncItemAll = function()
{
    // for ()
};

// The main 'Sync' method - change it to be called as array of item rather than recurse handling.
syncManager.syncItemData = function( listItem, btnTag, callBack )
{
    FormUtil.StartSync();   // Easy to deal with changes if we have representing method with the class.
    //
    //FormUtil.syncRunning = 1;
    //FormUtil.showProgressBar();

    var bProcess = false
    var processCode = 0;
    var itemData = syncManager.dataCombine[ listItem ];  // holds 'redeem_queued', 'redeem_failed' -  'redeem_success' does not exists in here..
    var itemClone;

    //if ( WsApiManager.isDebugMode ) console.log( itemData );

    if ( itemData )
    {
        itemClone = JSON.parse( JSON.stringify( itemData ) );

        // Will be nice to be a method that checks below about 6 lines - checkNetworkAttemps()
        if ( !itemData.networkAttempt ) // no counter exists for this item
        {
            bProcess = true;
        }
        else
        {
            //  counter exists for this item AND counter is below limit
            if ( itemData.networkAttempt < syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit )
            {
                bProcess = true;
            }
            else
            {
                //MsgManager.msgAreaShow( ' network TEST LIMIT exceeded: ' + syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit );
                processCode = 2;
                itemData.status = syncManager.cwsRenderObj.status_redeem_failed;
                itemData.queueStatus = syncManager.cwsRenderObj.status_redeem_failed;
                if ( WsApiManager.isDebugMode ) console.log( ' #networkAttempts exceeded: ' + itemData.networkAttempt );
            }
        }
    }
    else
    {
        processCode = 1;
    }

    if ( ! ConnManager.networkSyncConditions() )
    {
        syncManager.pauseSync( itemData, itemClone);
        bProcess = false;
    }
    else
    {
        if ( !syncManager.pauseProcess && ConnManager.networkSyncConditions() )
        {
            //if ( WsApiManager.isDebugMode ) console.log( bProcess + ',' + syncManager.pauseProcess );
            syncManager.pauseProcess = false;
        }
    }

    if ( bProcess && !syncManager.pauseProcess )
    {

        //if ( WsApiManager.isDebugMode ) console.log( itemData );
        // SKIP ITEM IF ALREADY BEING SYNCRONIZED ELSEWHERE IN THE SYSTEM
        if ( ( itemData && itemData.syncActionStarted == undefined ) 
            || ( itemData && itemData.syncActionStarted != undefined && itemData.syncActionStarted != 0 ) )
        {
            if ( WsApiManager.isDebugMode ) console.log( 'SKIPPING item, already being synchronized)) by another process' );
            // MOVE TO NEXT ITEM
            syncManager.syncItemData ( (listItem + 1), btnTag, callBack )
        }
        else
        {
            //if ( WsApiManager.isDebugMode ) console.log( ' ~ processing sync item: ' + itemData.id );
            var mySyncIcon = $( '#listItem_icon_sync_' + itemData.id );
            var myQueueStatus = $( '#listItem_queueStatus_' + itemData.id );

            if ( mySyncIcon )
            {
                mySyncIcon.rotate({ count:999, forceJS: true, startDeg: 0 });
            }

            syncManager.lastSyncAttempt = listItem;

            //if ( WsApiManager.isDebugMode ) console.log ( 'current SyncItem > ' + (listItem +1) + ' / ' + syncManager.dataCombine.length + ' = ' + parseFloat( ( (listItem) / syncManager.dataCombine.length) * 100).toFixed(0) );
            FormUtil.updateProgressWidth( parseFloat( ( (listItem+1) / syncManager.dataCombine.length) * 100).toFixed(0) + '%' );

            var dtmRedeemAttempt = (new Date() ).toISOString();

            itemData.lastAttempt = dtmRedeemAttempt;
            itemData.syncActionStarted = 1;

            //itemData.state = 1; //added to avoid duplicate calls sometimes occurring??? 1=in use, 0=unused
            FormUtil.submitRedeem( itemData.data.url, itemData.data.payloadJson, itemData.data.actionJson, undefined, function( success, returnJson ) {

                // network conditions deteriorate during sync process run
                if ( !success 
                    && !returnJson 
                    && !ConnManager.networkSyncConditions() )
                {
                    syncManager.pauseSync( itemData, itemClone);

                    FormUtil.hideProgressBar();

                    $( syncManager.subProgressBar ).removeClass( 'determinate' );
                    $( syncManager.subProgressBar ).addClass( syncManager.progClass );

                    $( '#imgAppDataSyncStatus' ).stop();

                    if ( btnTag )
                    {
                        if ( btnTag.hasClass( 'clicked' ) )
                        { 
                            btnTag.removeClass( 'clicked' );
                        }
                    }

                    if ( syncManager.pauseProcess )
                    {
                        MsgManager.msgAreaShow ( 'Sync PAUSED > network conditions' )
                    }

                }
                else
                {

                    var itmHistory = itemData.history;
                    var syncType = ( btnTag ) ? 'manual-Sync-Manager' : 'auto-Sync-Manager';
                    var newTitle, syncSuccess = false;

                    itemData.returnJson = returnJson;
                    itemData.networkAttempt = 0;

                    // check returnJson.resultData.status != 'fail' value as SUCCESS == true always occurring
                    if ( success && ( returnJson.resultData.status != 'fail' && returnJson.resultData.status != 'notFound' ) )
                    {
                        syncManager.syncSuccess( itemData, myQueueStatus );
                    }
                    else 
                    {
                        syncManager.syncFail( returnJson, itemData, myQueueStatus );
                    }

                    syncManager.stopRotateSyncIcon( itemData );

                    // Set history of item
                    syncManager.setItemHistory( btnTag, itemData, dtmRedeemAttempt, returnJson, success );

                    syncManager.updateDataAfterSync( itemData, itemClone, btnTag, listItem, callBack );

                }

            } );

        }


    }
    else
    {

        if ( syncManager.pauseProcess )
        {
            syncManager.pauseSync( itemData, itemData);
            syncManager.endSync( btnTag, callBack );
        }
        else
        {

            // error in last itemData [ e.g. network limit exceeded ]
            if ( processCode > 1 )
            {

                FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + itemData.id ), FormUtil.getActivityType ( itemData ), FormUtil.getStatusOpt ( itemData ), syncManager.cwsRenderObj )
                FormUtil.setStatusOnTag( $( '#listItem_action_sync_' + itemData.id ).find( 'div.icons-status' ), itemData, syncManager.cwsRenderObj );

                if ( WsApiManager.isDebugMode ) console.log( ' ending HERE [' + ( bProcess && !syncManager.pauseProcess ) + '] >> sync Conditions: ' + ConnManager.networkSyncConditions() + ' AND ! syncManager.pauseProcess: ' + syncManager.pauseProcess );
                //syncManager.endSync( btnTag );

                DataManager.getData( 'syncList', function( processedData ){

                    if ( ! processedData )
                    {
                        processedData = { 'dataList': [] };
                    }

                    processedData.dataList.push( { 'id': itemData.id, 'data': itemData } );
                    
                    DataManager.saveData( 'syncList', processedData, function(){ 

                        syncManager.syncItemData ( (listItem + 1), btnTag )

                    } );

                } );

            }
            else if ( processCode == 1 )
            {

                if ( WsApiManager.isDebugMode ) console.log( ' processCode: 1 ~ ending Sync (with array Update+Save)' );
                syncManager.endSync( btnTag, callBack );

            }

        }

    }

}

syncManager.endSync = function( btnTag, callBack )
{
    if ( WsApiManager.isDebugMode ) console.log( 'ending sync' );

    syncManager.mergeSyncListWithIndexDB();

    FormUtil.hideProgressBar();

    $( syncManager.subProgressBar ).removeClass( 'determinate' );
    $( syncManager.subProgressBar ).addClass( syncManager.progClass );

    $( '#imgAppDataSyncStatus' ).stop();

    if ( !syncManager.pauseProcess )
    {
        $( '#divAppDataSyncStatus' ).hide();
        $( '#imgAppDataSyncStatus' ).hide();    
    }

    if ( btnTag )
    {
        if ( btnTag.hasClass( 'clicked' ) )
        { 
            btnTag.removeClass( 'clicked' );
        }
    }

    FormUtil.syncRunning = 0;

    if ( syncManager.pauseProcess )
    {
        MsgManager.msgAreaShow ( 'Sync PAUSED > network conditions' )
    }
    else
    {
        FormUtil.gAnalyticsEventAction( function( analyticsEvent ) {

            if ( syncManager.lastSyncSuccess > 0 )
            {
                // added by Greg (2019-02-18) > test track googleAnalytics
                ga('send', { 'hitType': 'event', 'eventCategory': 'data-Sync', 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });

                MsgManager.msgAreaShow ( 'Sync COMPLETED [' + syncManager.lastSyncSuccess + ']' );
            }

            syncManager.lastSyncAttempt = 0;
            syncManager.lastSyncSuccess = 0;
        });
    }

    if ( callBack ) callBack();
}


syncManager.syncSuccess = function( itemData, myQueueStatus )
{
    var dtmRedeemDate = (new Date() ).toISOString();

    itemData.redeemDate = dtmRedeemDate;
    itemData.title = 'saved to network' + ' [' + dtmRedeemDate + ']'; // MISSING TRANSLATION
    itemData.status = syncManager.cwsRenderObj.status_redeem_submit;
    itemData.queueStatus = 'success'; // MISSING TRANSLATION

    if ( itemData.activityList ) delete itemData.activityList;

    myQueueStatus.html( itemData.queueStatus )

    // //if ( FormUtil.PWAlaunchFrom() == "homeScreen" ) 
    // {
        playSound("coin");
    // }

    // // newTitle = itemData.title; 
}

syncManager.syncFail = function( returnJson, itemData, myQueueStatus )
{
    if ( returnJson && returnJson.displayData && ( returnJson.displayData.length > 0 ) && ConnManager.networkSyncConditions() & !syncManager.pauseProcess ) 
    {
        var msg = JSON.parse( returnJson.displayData[0].value ).msg;

        itemData.title = msg.toString().replace(/--/g,'<br>'); // hardcoding to create better layout
        // newTitle = 'error > ' + msg.toString().replace(/--/g,'<br>');
    }

    /* only when sync-test exceeds limit do we mark item as FAIL */
    if ( itemData.networkAttempt >= syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit && ConnManager.networkSyncConditions() & !syncManager.pauseProcess )
    {
        itemData.status = syncManager.cwsRenderObj.status_redeem_failed;
        itemData.queueStatus = syncManager.cwsRenderObj.status_redeem_failed;
        // newTitle = 'error occurred > exceeded network attempt limit';
    }
    else
    {
        itemData.queueStatus = 'retry'; // MISSING TRANSLATION
    }
    myQueueStatus.html( itemData.queueStatus )
}

syncManager.stopRotateSyncIcon = function( itemData  )
{
    var mySyncIcon = $( '#listItem_icon_sync_' + itemData.id );

    if ( mySyncIcon )
    {
        mySyncIcon.stop();
        //myResultTag.html( newTitle );
    }

}

syncManager.setItemHistory = function( btnTag, itemData, dtmRedeemAttempt, returnJson, success )
{
    var syncType = ( btnTag ) ? 'manual-Sync-Manager' : 'auto-Sync-Manager';
    var itmHistory = itemData.history;
    if ( returnJson )
    {
        itmHistory.push ( { "syncType": syncType, "syncAttempt": dtmRedeemAttempt, "success": success, "returnJson": returnJson } );
    }
    else
    {
        itmHistory.push ( { "syncType": syncType, "syncAttempt": dtmRedeemAttempt, "success": success } );
    }

    itemData.history = itmHistory; // Dont need to assign again(???)
}

syncManager.setSyncListOutcome = function( btnTag, itemData, listItem, callBack )
{
    
}

syncManager.updateDataAfterSync = function( itemData, itemClone, btnTag, listItem, callBack )
{

    FormUtil.setStatusOnTag( $( '#listItem_action_sync_' + itemData.id ).find( 'div.icons-status' ), itemData, syncManager.cwsRenderObj );
    FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + itemData.id ), FormUtil.getActivityType ( itemData ), FormUtil.getStatusOpt ( itemData ), syncManager.cwsRenderObj )

    if ( ConnManager.networkSyncConditions() & !syncManager.pauseProcess )
    {
        //syncManager.setSyncListOutcome ( btnTag, itemData, listItem, function(){ } )

        DataManager.getData( 'syncList', function( processedData ){

            if ( ! processedData )
            {
                processedData = { 'dataList': [] };
            }

            processedData.dataList.push( { 'id': itemData.id, 'data': itemData } );

            DataManager.saveData( 'syncList', processedData, function(){ 

                syncManager.syncItemData ( (listItem + 1), btnTag, callBack )

            } );

        } );

    }
    else
    {
        if ( syncManager.pauseProcess )
        {
            syncManager.pauseSync( itemData, itemClone);
        }
        else
        {
            if ( WsApiManager.isDebugMode ) console.log( 'ending becuase of sync Conditions: ' + ConnManager.networkSyncConditions() );
            syncManager.endSync( btnTag, callBack );
        }

        FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + itemData.id ), FormUtil.getActivityType ( itemData ), FormUtil.getStatusOpt ( itemData ), syncManager.cwsRenderObj )
        FormUtil.setStatusOnTag( $( '#listItem_action_sync_' + itemData.id ).find( 'div.icons-status' ), itemData, syncManager.cwsRenderObj );

    }

}

syncManager.syncOfflineData = function( btnTag )
{
    var Proceed = false;
    syncManager.lastSyncSuccess = 0;

    if ( WsApiManager.isDebugMode ) console.log( 'syncOfflineData' );
    if ( FormUtil.syncRunning == 0 )
    {
        if ( btnTag ) //called from click_event
        {
            if ( ! btnTag.hasClass( 'clicked' ) )
            {
                btnTag.addClass( 'clicked' );
                Proceed = true;
            }
        }
        else
        {
            Proceed = true;
        }

        if ( Proceed )
        {

            if ( FormUtil.checkLogin() ) // correct valid-login test?
            {
                if ( ConnManager.networkSyncConditions() )
                {
                    if ( syncManager.dataQueued.length + syncManager.dataFailed.length )
                    {
                        //syncManager.evalDataListContent( function()
                        {

                            syncManager.dataCombine = syncManager.dataQueued.concat(syncManager.dataFailed);

                            (syncManager.dataCombine).sort(function (a, b) {
                                var a1st = -1, b1st =  1, equal = 0; // zero means objects are equal
                                if (b.created > a.created) return b1st;
                                else if (a.created > b.created) return a1st;
                                else return equal;
                            });

                            $( '#imgAppDataSyncStatus' ).rotate({ count: 99999, forceJS: true, startDeg: 0 });

                            $( syncManager.subProgressBar ).removeClass( syncManager.progClass );
                            $( syncManager.subProgressBar ).addClass( 'determinate' );

                            syncManager.syncAutomationInteruptedTimer = syncManager.syncAutomationRunTimer;

                            FormUtil.updateProgressWidth( 0 );
                            FormUtil.showProgressBar( 0 );

                            if ( !FormUtil.dcdConfig ) 
                            {
                                FormUtil.dcdConfig = JSON.parse( DataManager.getData ( syncManager.cwsRenderObj.storageName_RedeemList ) ).dcdConfig;
                                MsgManager.msgAreaShow( 'syncManager > reloading FormUtil.dcdConfig :(' );
                            } 

                            if ( syncManager.pauseProcess )
                            {
                                syncManager.pauseProcess = 0;
                            }

                            if ( WsApiManager.isDebugMode ) 
                            { 
                                //console.log( syncManager.dataCombine );
                                console.log( 'syncManager.lastSyncAttempt: ' + syncManager.lastSyncAttempt + ', syncManager.pauseProcess: ' + syncManager.pauseProcess + ', ConnManager.networkSyncConditions(): ' + ConnManager.networkSyncConditions() );
                            }

                            DataManager.saveData( 'syncList', { 'dataList': [] }, function(){

                                syncManager.lastSyncSuccess = 0;
                                syncManager.syncItemData ( (syncManager.lastSyncAttempt), btnTag )

                            })

                        } //);

                    }
                }
                else
                {
                    MsgManager.msgAreaShow( 'Network unavailable: cannot Synchronize offline data' );
                }
            }
            else
            {
                MsgManager.msgAreaShow( 'Session error: cannot Synchronize offline data, please login again' );
            }

        }

    }

}

// proxy code..

// puosuod
syncManager.pauseSync = function(  itmObj, itmClone )
{
    if ( WsApiManager.isDebugMode ) console.log( 'pause Sync' );

    syncManager.pauseProcess = true;
    FormUtil.syncRunning = 0;
}

syncManager.mergeSyncListWithIndexDB = function( callBack )
{
    DataManager.getData( 'redeemList', function( activityData ){

        DataManager.getData( 'syncList', function( syncData ){

            var syncMatch = 0;

            for ( var s = 0; s < syncData.dataList.length; s++ )
            {

                if ( syncData.dataList[ s ][ 'success' ] != 1 )
                {

                    for ( var i = 0; i < activityData.list.length; i++ )
                    {

                        if ( activityData.list[ i ].id === syncData.dataList[ s ].id )
                        {

                            activityData.list[ i ][ 'lastAttempt' ] = syncData.dataList[ s ].data[ 'lastAttempt' ];
                            activityData.list[ i ][ 'network' ] = syncData.dataList[ s ].data[ 'network' ];
                            activityData.list[ i ][ 'networkAttempt' ] = syncData.dataList[ s ].data[ 'networkAttempt' ];
                            activityData.list[ i ][ 'data' ] = syncData.dataList[ s ].data[ 'data' ];
                            activityData.list[ i ][ 'history' ] = syncData.dataList[ s ].data[ 'history' ];
                            activityData.list[ i ][ 'status' ] = syncData.dataList[ s ].data[ 'status' ];
                            activityData.list[ i ][ 'queueStatus' ] = syncData.dataList[ s ].data[ 'queueStatus' ];						
                            syncData.dataList[ s ][ 'success' ] = 1;

                            syncMatch += 1;

                        }

                    }

                }

            }

            if ( WsApiManager.isDebugMode ) console.log( ' ~ sync matched: ' + ( ( syncMatch / syncData.dataList.length ) * 100 ).toFixed(1) + '% ( ' + syncMatch + ' / ' + syncData.dataList.length + ')' );

            if ( syncMatch == syncData.dataList.length )
            {
                DataManager.deleteData( 'syncList' )
            }
            else
            {
                for ( var s = 0; s < syncData.dataList.length; s++ )
                {
                    if ( syncData.dataList[ s ][ 'success' ] == 1 )
                    {
                        //Util.RemoveFromArray( syncData.dataList, "id", syncData.dataList[ s ][ 'id' ] );
                        delete syncData.dataList[ s ]; //.pop()
                    }
                }

                DataManager.saveData( 'syncList', syncData );
            }

            DataManager.saveData( 'redeemList', activityData, callBack );

            DataManager.getData( 'session', function( data ){

                data[ 'syncDate' ] = new Date().toISOString();

                DataManager.saveData( 'session', data );

            } )

        } );

    } );

}