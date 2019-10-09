// =========================================

function syncManager()  {}

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

    syncManager.syncRunning = 0;
    syncManager.subProgressBar;

    syncManager.conditionsCheckTimer = 0;
    syncManager.syncAutomationRunTimer = 0;

    syncManager.pauseProcess = false;
    syncManager.lastSyncAttempt = 0;
    syncManager.lastSyncSuccess = 0;

    syncManager.debugMode = ( ( location.href ).indexOf( '.psi-mis.org' ) < 0 || ( location.href ).indexOf( 'cws-' ) >= 0 );

    var syncAutomationInteruptedTimer = 0;
    var progClass;

	// -----------------------------
    // syncManager: uses timerInterval for 'conditionCheck', then uses timeOut to call automated Sync (unless already clicked by user)
    // -----------------------------

    syncManager.initialize = function( cwsRenderObj ) 
    {
        syncManager.cwsRenderObj = cwsRenderObj;
        syncManager.updateInitVars();
        syncManager.subProgressBar = $( '#divProgressBar' ).children()[0]; /* store progress bar class - to be upgraded to it's own class later */
        progClass = syncManager.subProgressBar.className;

        if ( syncManager.debugMode ) console.log( 'initialize syncManager >> syncManager.storage_offline_SyncConditionsTimerInterval: ' + syncManager.storage_offline_SyncConditionsTimerInterval + ' syncManager.storage_offline_SyncExecutionTimerInterval: ' + syncManager.storage_offline_SyncExecutionTimerInterval + ' {syncManager.conditionsCheckTimer: ' + syncManager.conditionsCheckTimer + '}');
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

        if ( syncManager.debugMode ) console.log( 'restarted syncManager.scheduledSyncConditionsTest >> syncManager.storage_offline_SyncConditionsTimerInterval: ' + syncManager.storage_offline_SyncConditionsTimerInterval + ' syncManager.storage_offline_SyncExecutionTimerInterval: ' + syncManager.storage_offline_SyncExecutionTimerInterval + ' {syncManager.conditionsCheckTimer: ' + syncManager.conditionsCheckTimer + '}');

    }

    syncManager.updateInitVars = function()
    {
        syncManager.cwsRenderObj.updateFromSession();

        if ( syncManager.debugMode ) console.log( '>> syncManager.cwsRenderObj.storage_offline_SyncExecutionTimerInterval: ' + syncManager.cwsRenderObj.storage_offline_SyncExecutionTimerInterval + ', syncManager.cwsRenderObj.storage_offline_SyncConditionsTimerInterval: ' + syncManager.cwsRenderObj.storage_offline_SyncConditionsTimerInterval);

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
                FormUtil.getMyListData( syncManager.cwsRenderObj.storageName_RedeemList, function( myData ){

                    if ( myData )
                    {
                        var myQueue = myData.filter( a=>a.status == syncManager.cwsRenderObj.status_redeem_queued );
                        var myFailed = myData.filter( a=>a.status == syncManager.cwsRenderObj.status_redeem_failed && (!a.networkAttempt || a.networkAttempt < syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit) );
    
                        syncManager.dataQueued = myQueue;
                        syncManager.dataFailed = myFailed;

                        if ( callBack ) callBack();
                    }

                } );

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

    syncManager.scheduledSyncConditionsTest = function()
    {
        if ( syncManager.debugMode ) console.log( ' ~ syncManager >> scheduledSyncConditionsTest');

        syncManager.evalDataListContent( function(){ 

            if ( syncManager.evalSyncConditions() )
            {
                if ( syncManager.debugMode ) console.log ( 'STARTING >> scheduledSyncConditionsTest.GOOD, syncAutomationInteruptedTimer: ' + syncAutomationInteruptedTimer + ', syncManager.syncAutomationRunTimer: ' + syncManager.syncAutomationRunTimer + ', syncManager.syncRunning: ' + syncManager.syncRunning + ', syncManager.storage_offline_SyncConditionsTimerInterval: ' + syncManager.storage_offline_SyncConditionsTimerInterval + ', syncManager.lastSyncAttempt: ' + syncManager.lastSyncAttempt );
                // NO interupted timer exists AND NO existing timer AND syncProcess NOT CURRENTLY RUNNING (clicked icon)
                if ( ( !syncAutomationInteruptedTimer && !syncManager.syncAutomationRunTimer && syncManager.syncAutomationRunTimer == 0 ) && ( !syncManager.syncRunning ) )
                {
                    if ( syncManager.debugMode ) console.log( 'if test 1' );
                    syncManager.scheduleSyncAutomationRun();
                }
                // interupted timer exists AND equal to existing timer AND syncProcess NOT CURRENTLY RUNNING
                else if ( ( syncAutomationInteruptedTimer && syncManager.syncAutomationRunTimer ) && ( syncAutomationInteruptedTimer == syncManager.syncAutomationRunTimer ) && ( !syncManager.syncRunning ) )
                {
                    if ( syncManager.debugMode ) console.log( 'if test 2' );
                    syncManager.scheduleSyncAutomationRun();
                }
                // no timer exists (sync = OFF) AND no existing timer AND syncProcess NOT CURRENTLY RUNNING (i.e. manual sync clicked)
                else if ( syncManager.storage_offline_SyncConditionsTimerInterval ==0 && !syncManager.syncAutomationRunTimer && !syncManager.syncRunning ) 
                {
                    if ( syncManager.debugMode ) console.log( 'if test 3' );
                    syncManager.scheduleSyncAutomationRun();
                }
                else
                {
                    if ( syncManager.debugMode ) console.log( ' no run, no test passed' );
                    console.log( ' ~ syncAutomationInteruptedTimer: ' + syncAutomationInteruptedTimer );
                    console.log( ' ~ syncManager.syncAutomationRunTimer: ' + syncManager.syncAutomationRunTimer );
                    console.log( ' ~ syncManager.syncRunning: ' + syncManager.syncRunning );
                    console.log( ' ~ syncManager.storage_offline_SyncConditionsTimerInterval: ' + syncManager.storage_offline_SyncConditionsTimerInterval );


                }
                if ( syncManager.debugMode ) console.log ( 'ENDING >> scheduledSyncConditionsTest.GOOD, syncAutomationInteruptedTimer: ' + syncAutomationInteruptedTimer + ', syncManager.syncAutomationRunTimer: ' + syncManager.syncAutomationRunTimer + ', syncManager.syncRunning: ' + syncManager.syncRunning + ', syncManager.storage_offline_SyncConditionsTimerInterval: ' + syncManager.storage_offline_SyncConditionsTimerInterval + ', syncManager.lastSyncAttempt: ' + syncManager.lastSyncAttempt );
            }
            else
            {
                if ( syncManager.syncAutomationRunTimer )
                {
                    clearTimeout( syncManager.syncAutomationRunTimer );
                    syncAutomationInteruptedTimer = syncManager.syncAutomationRunTimer;
                }
            }

        } );


    }

    syncManager.scheduleSyncAutomationRun = function()
    {
        if ( syncManager.storage_offline_SyncExecutionTimerInterval > 0 )
        {
            syncManager.syncAutomationRunTimer = setTimeout( function() {
                syncManager.syncOfflineData();
            }, syncManager.storage_offline_SyncExecutionTimerInterval );
        }

        if ( syncManager.debugMode ) console.log ( 'syncAutomationRunTimer [' + syncManager.syncAutomationRunTimer + '] to run in ' +syncManager.storage_offline_SyncExecutionTimerInterval+'ms : ' + (new Date() ).toISOString() );
    }

    syncManager.recursiveSyncItemData = function( listItem, btnTag )
    {

        syncManager.syncRunning = 1;
        FormUtil.showProgressBar();

        var bProcess = false;
        var itemData = syncManager.dataCombine[ listItem ];
        var itemClone;

        if ( syncManager.debugMode ) console.log( itemData );

        if ( itemData )
        {
            itemClone = JSON.parse( JSON.stringify( itemData ) );

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
                    if ( syncManager.debugMode ) console.log( 'itemData.networkAttempt: ' + itemData.networkAttempt );
                }
            }
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
                if ( syncManager.debugMode ) console.log( bProcess + ',' + syncManager.pauseProcess );
                syncManager.pauseProcess = false;
            }
        }

        if ( syncManager.debugMode ) console.log( (ConnManager.networkSyncConditions()) + ': ' + bProcess + ', ' + (!syncManager.pauseProcess) );

        if ( bProcess && !syncManager.pauseProcess )
        {

            if ( syncManager.debugMode ) console.log( itemData.id );
            //var syncItem = DataManager.getItemFromData( syncManager.cwsRenderObj.storageName_RedeemList, itemData.id )
            DataManager.getItemFromData( syncManager.cwsRenderObj.storageName_RedeemList, itemData.id, function( syncItem ){

                if ( syncManager.debugMode ) console.log( syncItem );
                // SKIP ITEM IF ALREADY BEING SYNCRONIZED ELSEWHERE IN THE SYSTEM
                if ( ( syncItem && syncItem.syncActionStarted == undefined ) || ( syncItem && syncItem.syncActionStarted != undefined && syncItem.syncActionStarted != 0 ) )
                {
                    if ( syncManager.debugMode ) console.log( 'SKIPPING item, already being synchronized)) by another process' );
                    // MOVE TO NEXT ITEM
                    syncManager.recursiveSyncItemData ( (listItem + 1), btnTag )
                }
                else
                {
                    if ( syncManager.debugMode ) console.log( ' ~ processing sync item: ' + itemData.id );
                    var mySyncIcon = $( '#listItem_icon_sync_' + itemData.id );
                    var myQueueStatus = $( '#listItem_queueStatus_' + itemData.id );
    
                    if ( mySyncIcon )
                    {
                        mySyncIcon.rotate({ count:999, forceJS: true, startDeg: 0 });
        
                        var myResultTag = $( '#listItem_networkResults_' + itemData.id );
                        var loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;">Connecting to network... </div>' ); //MISSING TRANSLATION
        
                        myResultTag.empty();
                        myResultTag.append( loadingTag );
        
                    }
    
                    syncManager.lastSyncAttempt = listItem;
    
                    if ( syncManager.debugMode ) console.log ( 'current SyncItem > ' + (listItem +1) + ' / ' + syncManager.dataCombine.length + ' = ' + parseFloat( ( (listItem) / syncManager.dataCombine.length) * 100).toFixed(0) );
                    FormUtil.updateProgressWidth( parseFloat( ( (listItem+1) / syncManager.dataCombine.length) * 100).toFixed(0) + '%' );
    
                    var dtmRedeemAttempt = (new Date() ).toISOString();
    
                    itemData.lastAttempt = dtmRedeemAttempt;
                    itemData.syncActionStarted = 1;
    
                    if ( ! syncManager.pauseProcess )
                    {
                        DataManager.updateItemFromData( syncManager.cwsRenderObj.storageName_RedeemList, itemData.id, itemData ); //ensure 'syncActionStarted' is set in event another sync process is attempted against current [itemData]
                    }
    
                    //itemData.state = 1; //added to avoid duplicate calls sometimes occurring??? 1=in use, 0=unused
                    FormUtil.submitRedeem( itemData.data.url, itemData.data.payloadJson, itemData.data.actionJson, undefined, function( success, returnJson )
                    {
    
                        // network conditions deteriorate during sync process run
                        if ( !success && !returnJson && !ConnManager.networkSyncConditions() )
                        {
                            syncManager.pauseSync( itemData, itemClone);
    
                            FormUtil.hideProgressBar();
    
                            $( syncManager.subProgressBar ).removeClass( 'determinate' );
                            $( syncManager.subProgressBar ).addClass( progClass );
                
                            $( '#imgAppDataSyncStatus' ).stop();
    
                            if ( btnTag )
                            {
                                if ( btnTag.hasClass( 'clicked' ) )
                                { 
                                    btnTag.removeClass( 'clicked' );
                                }
                            }
                
                            syncManager.syncRunning = 0;
                
                            if ( syncManager.pauseProcess )
                            {
                                MsgManager.msgAreaShow ( 'Sync PAUSED > network conditions' )
                            }
    
                        }
                        else
                        {
    
                            var itmHistory = itemData.history;
                            var syncType = ( btnTag ) ? 'manual-Sync-Manager' : 'auto-Sync-Manager';
                            var newTitle;
    
                            itemData.returnJson = returnJson;
    
                            // record network sync attempts (for limit management)
                            if ( itemData.networkAttempt ) itemData.networkAttempt += 1;
                            else itemData.networkAttempt = 1;
    
                            // check returnJson.resultData.status != 'fail' value as SUCCESS == true always occurring
                            if ( success && ( returnJson.resultData.status != 'fail' ) )
                            {
                                var dtmRedeemDate = (new Date() ).toISOString();
    
                                syncManager.lastSyncSuccess ++;
    
                                itemData.redeemDate = dtmRedeemDate;
                                itemData.title = 'saved to network' + ' [' + dtmRedeemDate + ']'; // MISSING TRANSLATION
                                itemData.status = syncManager.cwsRenderObj.status_redeem_submit;
                                itemData.queueStatus = 'success'; // MISSING TRANSLATION
    
                                if ( itemData.activityList ) delete itemData.activityList;
    
                                myQueueStatus.html( itemData.queueStatus )
    
                                //if ( FormUtil.PWAlaunchFrom() == "homeScreen" ) 
                                {
                                    playSound("coin");
                                }
    
                                newTitle = itemData.title; 
    
                            }
                            else 
                            {
                                if ( returnJson && returnJson.displayData && ( returnJson.displayData.length > 0 ) && ConnManager.networkSyncConditions() & !syncManager.pauseProcess ) 
                                {
                                    var msg = JSON.parse( returnJson.displayData[0].value ).msg;
            
                                    itemData.title = msg.toString().replace(/--/g,'<br>'); // hardcoding to create better layout
                                    newTitle = 'error > ' + msg.toString().replace(/--/g,'<br>');
                                }
    
                                /* only when sync-test exceeds limit do we mark item as FAIL */
                                if ( itemData.networkAttempt >= syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit && ConnManager.networkSyncConditions() & !syncManager.pauseProcess )
                                {
                                    itemData.status = syncManager.cwsRenderObj.status_redeem_failed;
                                    itemData.queueStatus = syncManager.cwsRenderObj.status_redeem_failed;
                                    newTitle = 'error occurred > exceeded network attempt limit';
                                }
                                else
                                {
                                    itemData.queueStatus = 'retry'; // MISSING TRANSLATION
                                }
                                myQueueStatus.html( itemData.queueStatus )
                            }
    
                            if ( mySyncIcon )
                            {
                                mySyncIcon.stop();
                                myResultTag.html( newTitle );
                            }
    
                            if ( returnJson )
                            {
                                itmHistory.push ( { "syncType": syncType, "syncAttempt": dtmRedeemAttempt, "success": success, "returnJson": returnJson } );
                            }
                            else
                            {
                                itmHistory.push ( { "syncType": syncType, "syncAttempt": dtmRedeemAttempt, "success": success } );
                            }
    
                            itemData.history = itmHistory;
                            itemData.syncActionStarted = 0;
    
                            FormUtil.setStatusOnTag( $( '#listItem_action_sync_' + itemData.id ).find( 'div.icons-status' ), itemData, syncManager.cwsRenderObj );
                            FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + itemData.id ), FormUtil.getActivityType ( itemData ), FormUtil.getStatusOpt ( itemData ), syncManager.cwsRenderObj )
    
                            if ( ConnManager.networkSyncConditions() & !syncManager.pauseProcess )
                            {
                                DataManager.updateItemFromData( syncManager.cwsRenderObj.storageName_RedeemList, itemData.id, itemData );
    
                                syncManager.recursiveSyncItemData ( (listItem + 1), btnTag )
                            }
                            else
                            {
                                if ( syncManager.pauseProcess )
                                {
                                    syncManager.pauseSync( itemData, itemClone);
                                }
                                else
                                {
                                    if ( syncManager.debugMode ) console.log( 'ending becuase of sync Conditions: ' + ConnManager.networkSyncConditions() );
                                    syncManager.endSync( btnTag );
                                }
    
                                DataManager.updateItemFromData( syncManager.cwsRenderObj.storageName_RedeemList, itemClone.id, itemClone );
                                FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + itemClone.id ), FormUtil.getActivityType ( itemClone ), FormUtil.getStatusOpt ( itemClone ), syncManager.cwsRenderObj )
                                FormUtil.setStatusOnTag( $( '#listItem_action_sync_' + itemClone.id ).find( 'div.icons-status' ), itemClone, syncManager.cwsRenderObj );
    
                            }
    
                        }
    
                    } );
    
                }

            } );

        }
        else
        {
            if ( syncManager.debugMode ) console.log( ' ending HERE [' + ( bProcess && !syncManager.pauseProcess ) + '] >> sync Conditions: ' + ConnManager.networkSyncConditions() + ' AND ! syncManager.pauseProcess: ' + syncManager.pauseProcess );
            syncManager.endSync( btnTag );
        }

    }

    syncManager.endSync = function( btnTag )
    {
        if ( syncManager.debugMode ) console.log( 'ending sync' );
        FormUtil.hideProgressBar();

        $( syncManager.subProgressBar ).removeClass( 'determinate' );
        $( syncManager.subProgressBar ).addClass( progClass );

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

        syncManager.syncRunning = 0;

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
    }

    syncManager.syncOfflineData = function( btnTag )
    {
        var Proceed = false;
        syncManager.lastSyncSuccess = 0;

        if ( syncManager.debugMode ) console.log( 'syncOfflineData' );
        if ( syncManager.syncRunning == 0 )
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
                            syncManager.evalDataListContent();
                            syncManager.dataCombine = syncManager.dataQueued.concat(syncManager.dataFailed);

                            (syncManager.dataCombine).sort(function (a, b) {
                                var a1st = -1, b1st =  1, equal = 0; // zero means objects are equal
                                if (b.created > a.created) return b1st;
                                else if (a.created > b.created) return a1st;
                                else return equal;
                            });

                            $( '#imgAppDataSyncStatus' ).rotate({ count: 99999, forceJS: true, startDeg: 0 });

                            $( syncManager.subProgressBar ).removeClass( progClass );
                            $( syncManager.subProgressBar ).addClass( 'determinate' );

                            syncAutomationInteruptedTimer = syncManager.syncAutomationRunTimer;

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

                            if ( syncManager.debugMode ) 
                            { 
                                console.log( syncManager.dataCombine );
                                console.log( 'syncManager.lastSyncAttempt: ' + syncManager.lastSyncAttempt + ', syncManager.pauseProcess: ' + syncManager.pauseProcess + ', ConnManager.networkSyncConditions(): ' + ConnManager.networkSyncConditions() );
                            }

                            syncManager.lastSyncSuccess = 0;
                            syncManager.recursiveSyncItemData ( (syncManager.lastSyncAttempt), btnTag )

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

    syncManager.pauseSync = function(  itmObj, itmClone )
    {
        if ( syncManager.debugMode ) console.log( 'pause Sync' );
        DataManager.updateItemFromData( syncManager.cwsRenderObj.storageName_RedeemList, itmObj.id, itmClone ); //ensure 'syncActionStarted' is set in event another sync process is attempted against current [itemData]
        syncManager.pauseProcess = true;
    }
