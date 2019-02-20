// =========================================

function syncManager() 
{
    var me = this;

    me.storage_offline_SyncExecutionTimerInterval;          //uses setTimeout
    me.storage_offline_SyncConditionsTimerInterval;    //uses setInterval
    me.syncTimer;

    me.appShell;
    me.dcdConfig;
    me.offLineData;
    me.cwsRenderObj;

    me.dataQueued = {};
    me.dataFailed = {};
    me.dataCombine = {};

    me.syncRunning = 0;
    me.subProgressBar;

    me.conditionsCheckTimer = 0;
    me.syncAutomationRunTimer = 0;

    me.pauseProcess = false;
    me.lastSyncAttempt = 0;

    var syncAutomationInteruptedTimer = 0;
    var progClass;
    var showMessaging = false;

	// -----------------------------
    // syncManager: uses timerInterval for 'conditionCheck', then uses timeOut to call automated Sync (unless already clicked by user)
    // -----------------------------

    me.initialize = function( cwsRenderObj ) 
    {
        me.cwsRenderObj = cwsRenderObj;
        me.updateInitVars();
        me.subProgressBar = $( '#divProgressBar' ).children()[0]; /* store progress bar class - to be upgraded to it's own class later */
        progClass = me.subProgressBar.className;

        if ( showMessaging ) console.log( 'initialize syncManager >> me.storage_offline_SyncConditionsTimerInterval: ' + me.storage_offline_SyncConditionsTimerInterval + ' me.storage_offline_SyncExecutionTimerInterval: ' + me.storage_offline_SyncExecutionTimerInterval + ' {me.conditionsCheckTimer: ' + me.conditionsCheckTimer + '}');
    }

    me.reinitialize = function( cwsRenderObj )
    {
        if ( me.conditionsCheckTimer )
        {
             clearTimeout( me.conditionsCheckTimer );
             me.conditionsCheckTimer = 0;
        }

        if ( me.syncAutomationRunTimer )
        {
            clearTimeout( me.syncAutomationRunTimer );
            me.syncAutomationRunTimer = 0;
        }

        me.cwsRenderObj = cwsRenderObj;
        me.updateInitVars();

        if ( showMessaging ) console.log( 'restarted syncManager.scheduledSyncConditionsTest >> me.storage_offline_SyncConditionsTimerInterval: ' + me.storage_offline_SyncConditionsTimerInterval + ' me.storage_offline_SyncExecutionTimerInterval: ' + me.storage_offline_SyncExecutionTimerInterval + ' {me.conditionsCheckTimer: ' + me.conditionsCheckTimer + '}');

    }

    me.updateInitVars = function()
    {
        me.cwsRenderObj.updateFromSession();

        if ( showMessaging ) console.log( '>> me.cwsRenderObj.storage_offline_SyncExecutionTimerInterval: ' + me.cwsRenderObj.storage_offline_SyncExecutionTimerInterval + ', me.cwsRenderObj.storage_offline_SyncConditionsTimerInterval: ' + me.cwsRenderObj.storage_offline_SyncConditionsTimerInterval);

        me.storage_offline_SyncConditionsTimerInterval = me.cwsRenderObj.storage_offline_SyncConditionsTimerInterval;
        me.storage_offline_SyncExecutionTimerInterval = me.cwsRenderObj.storage_offline_SyncExecutionTimerInterval;

        /*if ( DataManager.getSessionDataValue( 'networkSync') )
        {
            me.storage_offline_SyncExecutionTimerInterval = DataManager.getSessionDataValue( 'networkSync' );
        }
        else
        {
            me.storage_offline_SyncExecutionTimerInterval = me.cwsRenderObj.storage_offline_SyncExecutionTimerInterval;
        }*/

        if ( me.storage_offline_SyncConditionsTimerInterval > 0 )
        {
            me.conditionsCheckTimer = setInterval( function() {
                me.scheduledSyncConditionsTest();
            }, me.storage_offline_SyncConditionsTimerInterval );
        }

    }

    me.evalDataListContent = function()
    {
        if ( FormUtil.checkLogin() ) // correct valid-login test?
        {
            if ( me.cwsRenderObj )
            {
                var myData = FormUtil.getMyListData( me.cwsRenderObj.storageName_RedeemList );

                if ( myData )
                {
                    var myQueue = myData.filter( a=>a.status == me.cwsRenderObj.status_redeem_queued );
                    var myFailed = myData.filter( a=>a.status == me.cwsRenderObj.status_redeem_failed && (!a.networkAttempt || a.networkAttempt < me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit) );

                    me.dataQueued = myQueue;
                    me.dataFailed = myFailed;
                }
            }
        }

    }

    me.evalSyncConditions = function()
    {
        if ( FormUtil.checkLogin() ) // correct valid-login test?
        {
            if ( ConnManager.networkSyncConditions() )
            {
                if ( me.dataQueued.length + me.dataFailed.length )
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
    }

    me.scheduledSyncConditionsTest = function()
    {
        me.evalDataListContent();

        if ( me.evalSyncConditions() )
        {
            if ( showMessaging ) console.log ( 'STARTING >> scheduledSyncConditionsTest.GOOD, syncAutomationInteruptedTimer: ' + syncAutomationInteruptedTimer + ', me.syncAutomationRunTimer: ' + me.syncAutomationRunTimer + ', me.syncRunning: ' + me.syncRunning + ', me.storage_offline_SyncConditionsTimerInterval: ' + me.storage_offline_SyncConditionsTimerInterval + ', me.lastSyncAttempt: ' + me.lastSyncAttempt );
            // NO interupted timer exists AND NO existing timer AND syncProcess NOT CURRENTLY RUNNING (clicked icon)
            if ( ( !syncAutomationInteruptedTimer && !me.syncAutomationRunTimer && me.syncAutomationRunTimer == 0 ) && ( !me.syncRunning ) )
            {
                me.scheduleSyncAutomationRun();
                if ( showMessaging ) console.log( 'if test 1' );
            }
            // interupted timer exists AND equal to existing timer AND syncProcess NOT CURRENTLY RUNNING
            else if ( ( syncAutomationInteruptedTimer && me.syncAutomationRunTimer ) && ( syncAutomationInteruptedTimer == me.syncAutomationRunTimer ) && ( !me.syncRunning ) )
            {
                me.scheduleSyncAutomationRun();
                if ( showMessaging ) console.log( 'if test 2' );
            }
            // no timer exists (sync = OFF) AND no existing timer AND syncProcess NOT CURRENTLY RUNNING (i.e. manual sync clicked)
            else if ( me.storage_offline_SyncConditionsTimerInterval ==0 && !me.syncAutomationRunTimer && !me.syncRunning ) 
            {
                me.scheduleSyncAutomationRun();
                if ( showMessaging ) console.log( 'if test 3' );
            }
            else
            {

            }
            if ( showMessaging ) console.log ( 'ENDING >> scheduledSyncConditionsTest.GOOD, syncAutomationInteruptedTimer: ' + syncAutomationInteruptedTimer + ', me.syncAutomationRunTimer: ' + me.syncAutomationRunTimer + ', me.syncRunning: ' + me.syncRunning + ', me.storage_offline_SyncConditionsTimerInterval: ' + me.storage_offline_SyncConditionsTimerInterval + ', me.lastSyncAttempt: ' + me.lastSyncAttempt );
        }
        else
        {
            if ( me.syncAutomationRunTimer )
            {
                clearTimeout( me.syncAutomationRunTimer );
                syncAutomationInteruptedTimer = me.syncAutomationRunTimer;
            }
        }

    }

    me.scheduleSyncAutomationRun = function()
    {
        if ( me.storage_offline_SyncExecutionTimerInterval > 0 )
        {
            me.syncAutomationRunTimer = setTimeout( function() {
                me.syncOfflineData();
            }, me.storage_offline_SyncExecutionTimerInterval );
        }

        if ( showMessaging ) console.log ( 'syncAutomationRunTimer [' + me.syncAutomationRunTimer + '] to run in ' +me.storage_offline_SyncExecutionTimerInterval+'ms : ' + (new Date() ).toISOString() );
    }

    me.appShellVersionTest = function( btnTag )
    {
		// api/dataStore/Connect_config/pwa_info

		var queryLoc = FormUtil.getWsUrl( '/api/getPWAInfo' ); 
        var loadingTag = undefined;
        
        if ( ConnManager.isOnline() )
        {
            // Do silently?  translate it afterwards?  <-- how do we do this?
            // config should also note all the 'term' into tags..
            FormUtil.wsRetrievalGeneral( queryLoc, loadingTag, function( returnJson )
            {
                var appShellVersion = $( '#spanVersion' ).html().replace('v','');

                if ( returnJson && returnJson.version )
                {
                    if ( showMessaging ) console.log ( appShellVersion.toString() + ' vs ' + returnJson.version );

                    if ( appShellVersion.toString() < ( returnJson.version ).toString() )
                    {
                        if ( btnTag )
                        {
                            //btnTag.text( 'Update to v' +returnJson.version );
                            $( '#aboutInfo_AppNewVersion ' ).html( returnJson.version );
                            if ( $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).removeClass( 'disabled' );
                            if ( ! $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).addClass( 'enabled' );

                            btnTag.show( 'fast' );
                        }
                    }
                    else
                    {
                        btnTag.hide( 'fast' );
                        if ( ! $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).addClass( 'disabled' );
                        if ( $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).removeClass( 'enabled' );

                    }

                }
                else
                {
                    // try running the dailyCache
                    FormUtil.wsSubmitGeneral( queryLoc, new Object(), loadingTag, function( success, allJson ) {
                        if ( success && allJson )
                        {
                            if ( showMessaging ) console.log ( appShellVersion.toString() + ' vs ' + returnJson.version );

                            if ( appShellVersion.toString() < ( returnJson.version ).toString() )
                            {
                                if ( btnTag )
                                {
                                    $( '#aboutInfo_AppNewVersion ' ).html( returnJson.version );
                                    if ( $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).removeClass( 'disabled' );
                                    if ( ! $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).addClass( 'enabled' );

                                    btnTag.show( 'fast' );
                                }
                            }
                            else
                            {
                                btnTag.hide( 'fast' );
                                if ( ! $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).addClass( 'disabled' );
                                if ( $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).removeClass( 'enabled' );

                            }

                        }
                        else
                        {
                            if ( showMessaging ) console.log( 'all appShellInfo FAILED: ' );
                            btnTag.hide();
                            if ( ! $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).addClass( 'disabled' );
                            if ( $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).removeClass( 'enabled' );

                        }
                    });			
                }
            });

        }
        else
        {
            btnTag.hide();
            if ( ! $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).addClass( 'disabled' );
            if ( $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).removeClass( 'enabled' );

        }

    }

    me.dcdConfigVersionTest = function( btnTag )
    {
        if ( FormUtil.checkLogin() ) // correct valid-login test?
        {
            if ( ConnManager.isOnline() )
            {

                var loadingTag = undefined;
                var userName = JSON.parse( localStorage.getItem('session') ).user;
                var userPin = Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4);
                var userConfig = JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem('session') ).user ) );

                FormUtil.submitLogin( userName, userPin, loadingTag, function( success, loginData ) 
                {
                    if ( success )
                    {
                        if ( showMessaging ) console.log ( userConfig.dcdConfig.version + ' vs ' + loginData.dcdConfig.version );
                        if ( ( userConfig.dcdConfig.version ).toString() < ( loginData.dcdConfig.version ).toString() )
                        {
                            if ( btnTag )
                            {
                                //btnTag.text( 'Update to v' +loginData.dcdConfig.version );
                                $( '#aboutInfo_dcdNewVersion' ).html( loginData.dcdConfig.version );
                                if ( $( '#imgaboutInfo_dcdVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgaboutInfo_dcdVersion_Less' ).removeClass( 'disabled' );
                                if ( ! $( '#imgaboutInfo_dcdVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgaboutInfo_dcdVersion_Less' ).addClass( 'enabled' );
                                //$( '#imgaboutInfo_dcdVersion_Less' ).show();
                                btnTag.show();
                            }
                        }
                        else
                        {
                            btnTag.hide();
                            //$( '#imgaboutInfo_dcdVersion_Less' ).hide();
                            if ( ! $( '#imgaboutInfo_dcdVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgaboutInfo_dcdVersion_Less' ).addClass( 'disabled' );
                            if ( $( '#imgaboutInfo_dcdVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgaboutInfo_dcdVersion_Less' ).removeClass( 'enabled' );

                        }
                    }
                    else
                    {
                        var errDetail = ( loginData && loginData.returnCode === 502 ) ? " - Server not available" : "";
                        //MsgManager.msgAreaShow( ' DCD Config SERVER not available: ' + errDetail );
                        btnTag.hide();
                        //$( '#imgaboutInfo_dcdVersion_Less' ).hide();
                        if ( ! $( '#imgaboutInfo_dcdVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgaboutInfo_dcdVersion_Less' ).addClass( 'disabled' );
                        if ( $( '#imgaboutInfo_dcdVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgaboutInfo_dcdVersion_Less' ).removeClass( 'enabled' );
                    }
                } );

            }
        }

    }

    me.recursiveSyncItemData = function( listItem, btnTag )
    {

        me.syncRunning = 1;
        FormUtil.showProgressBar();

        var bProcess = false;
        var itemData = me.dataCombine[ listItem ];
        var itemClone;

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
                if ( itemData.networkAttempt < me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit )
                {
                    bProcess = true;
                }
                else
                {
                    //MsgManager.msgAreaShow( ' network TEST LIMIT exceeded: ' + me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit );
                }
            }
        }

        if ( ! ConnManager.networkSyncConditions() )
        {
            me.pauseSync( itemData, itemClone);
            bProcess = false;
        }
        else
        {
            if ( !me.pauseProcess && ConnManager.networkSyncConditions() )
            {
                me.pauseProcess = false;
            }
        }

        if ( bProcess && !me.pauseProcess )
        {
            // SKIP ITEM IF ALREADY BEING SYNCRONIZED ELSEWHERE IN THE SYSTEM
            if ( DataManager.getItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id ).syncActionStarted != 0 )
            {
                // MOVE TO NEXT ITEM
                me.recursiveSyncItemData ( (listItem + 1), btnTag )
            }
            else
            {
                var mySyncIcon = $( '#listItem_icon_sync_' + itemData.id );

                if ( mySyncIcon )
                {
                    mySyncIcon.rotate({ count:999, forceJS: true, startDeg: 0 });
    
                    var myResultTag = $( '#listItem_networkResults_' + itemData.id );
                    var loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;">Connecting... </div>' );
    
                    myResultTag.empty();
                    myResultTag.append( loadingTag );
    
                }

                me.lastSyncAttempt = listItem;

                if ( showMessaging ) console.log ( 'SyncItem > ' + (listItem+1) + ' / ' + me.dataCombine.length + ' = ' + parseFloat( ( (listItem+1) / me.dataCombine.length) * 100).toFixed(0) );
                FormUtil.updateProgressWidth( parseFloat( ( (listItem+1) / me.dataCombine.length) * 100).toFixed(0) + '%' );

                var dtmRedeemAttempt = (new Date() ).toISOString();

                itemData.lastAttempt = dtmRedeemAttempt;
                itemData.syncActionStarted = 1;

                if ( ! me.pauseProcess )
                {
                    DataManager.updateItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id, itemData ); //ensure 'syncActionStarted' is set in event another sync process is attempted against current [itemData]
                }

                //itemData.state = 1; //added to avoid duplicate calls sometimes occurring??? 1=in use, 0=unused
                FormUtil.submitRedeem( itemData.data.url, itemData.data.payloadJson, itemData.data.actionJson, undefined, function( success, returnJson )
                {

                    //console.log( '1. Response: ' + success );

                    // network conditions deteriorate during sync process run
                    if ( !success && !returnJson && !ConnManager.networkSyncConditions() )
                    {
                        me.pauseSync( itemData, itemClone);

                        FormUtil.hideProgressBar();

                        $( me.subProgressBar ).removeClass( 'determinate' );
                        $( me.subProgressBar ).addClass( progClass );
            
                        $( '#imgAppDataSyncStatus' ).stop();

                        if ( btnTag )
                        {
                            if ( btnTag.hasClass( 'clicked' ) )
                            { 
                                btnTag.removeClass( 'clicked' );
                            }
                        }
            
                        me.syncRunning = 0;
            
                        if ( me.pauseProcess )
                        {
                            MsgManager.msgAreaShow ( 'dataSync PAUSED > network conditions' )
                        }

                    }
                    else
                    {

                        var itmHistory = itemData.history;
                        var syncType = ( btnTag ) ? 'manual-Sync-Manager' : 'auto-Sync-Manager';
                        var newTitle;

                        itemData.returnJson = returnJson;

                        // added by Greg (2019-01-14) > record network sync attempts (for limit management)
                        if ( itemData.networkAttempt ) itemData.networkAttempt += 1;
                        else itemData.networkAttempt = 1;

                        // Added 2019-01-08 > check returnJson.resultData.status != 'fail' value as SUCCESS == true always occurring
                        if ( success && ( returnJson.resultData.status != 'fail' ) )
                        {
                            var dtmRedeemDate = (new Date() ).toISOString();

                            itemData.redeemDate = dtmRedeemDate;
                            itemData.status = me.cwsRenderObj.status_redeem_submit;
                            newTitle = 'success > ' + dtmRedeemAttempt;

                        }
                        else 
                        {
                            if ( returnJson && returnJson.displayData && ( returnJson.displayData.length > 0 ) && ConnManager.networkSyncConditions() & !me.pauseProcess ) 
                            {
                                var msg = JSON.parse( returnJson.displayData[0].value ).msg;
        
                                itemData.title = msg.toString().replace(/--/g,'<br>'); // hardcoding to create better layout

                                newTitle = 'error > ' + msg.toString().replace(/--/g,'<br>');
                            }

                            /* only when sync-test exceeds limit do we mark item as FAIL */
                            if ( itemData.networkAttempt >= me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit && ConnManager.networkSyncConditions() & !me.pauseProcess )
                            {
                                itemData.status = me.cwsRenderObj.status_redeem_failed;
                                newTitle = 'error occurred > exceeded network attempt limit';
                            }                       

                        }

                        if ( mySyncIcon )
                        {
                            mySyncIcon.stop();
                            myResultTag.html( newTitle );
                        }

                        if ( returnJson )
                        {
                            itmHistory.push ( { "syncType": syncType, "syncAttempt": dtmRedeemAttempt, "success": success, "restultStatus": returnJson.resultData.status, "returnJson": returnJson } );
                        }
                        else
                        {
                            itmHistory.push ( { "syncType": syncType, "syncAttempt": dtmRedeemAttempt, "success": success } );
                        }

                        itemData.history = itmHistory;
                        itemData.syncActionStarted = 0;

                        if ( ConnManager.networkSyncConditions() & !me.pauseProcess )
                        {
                            DataManager.updateItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id, itemData );
                            FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + itemData.id ), FormUtil.getActivityType ( itemData ), FormUtil.getStatusOpt ( itemData ) )
                            FormUtil.setStatusOnTag( $( '#listItem_action_sync_' + itemData.id ).find( 'div.icons-status' ), itemData, me.cwsRenderObj );

                            me.recursiveSyncItemData ( (listItem + 1), btnTag )
                        }
                        else
                        {
                            if ( me.pauseProcess )
                            {
                                me.pauseSync( itemData, itemClone);
                            }
                            else
                            {
                                me.endSync( btnTag );
                            }

                            DataManager.updateItemFromData( me.cwsRenderObj.storageName_RedeemList, itemClone.id, itemClone );
                            FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + itemClone.id ), FormUtil.getActivityType ( itemClone ), FormUtil.getStatusOpt ( itemClone ) )
                            FormUtil.setStatusOnTag( $( '#listItem_action_sync_' + itemClone.id ).find( 'div.icons-status' ), itemClone, me.cwsRenderObj );

                        }

                    }

                } );

            }

        }
        else
        {
            me.endSync( btnTag );
        }

    }

    me.endSync = function( btnTag )
    {
        if ( showMessaging ) console.log( 'ending sync' );
        FormUtil.hideProgressBar();

        $( me.subProgressBar ).removeClass( 'determinate' );
        $( me.subProgressBar ).addClass( progClass );

        $( '#imgAppDataSyncStatus' ).stop();

        if ( !me.pauseProcess )
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

        me.syncRunning = 0;

        if ( me.pauseProcess )
        {
            MsgManager.msgAreaShow ( 'dataSync PAUSED > network conditions' )
        }
        else
        {
            // added by Greg (2019-02-18) > test track googleAnalytics
            ga('send', { 'hitType': 'event', 'eventCategory': 'data-Sync', 'eventAction': FormUtil.gAnalyticsEventAction(), 'eventLabel': FormUtil.gAnalyticsEventLabel() });

            MsgManager.msgAreaShow ( 'dataSync COMPLETED > processed ' + ( me.lastSyncAttempt + 1) )
            me.lastSyncAttempt = 0;
        }
    }

    me.syncOfflineData = function( btnTag )
    {
        var Proceed = false;

        if ( showMessaging ) console.log( 'syncOfflineData' );
        if ( me.syncRunning == 0 )
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
                        if ( me.dataQueued.length + me.dataFailed.length )
                        {
                            me.evalDataListContent();
            
                            me.dataCombine = me.dataQueued.concat(me.dataFailed);

                            (me.dataCombine).sort(function (a, b) {
                                var a1st = -1, b1st =  1, equal = 0; // zero means objects are equal
                                if (b.created > a.created) return b1st;
                                else if (a.created > b.created) return a1st;
                                else return equal;
                            });

                            $( '#imgAppDataSyncStatus' ).rotate({ count: 99999, forceJS: true, startDeg: 0 });

                            $( me.subProgressBar ).removeClass( progClass );
                            $( me.subProgressBar ).addClass( 'determinate' );

                            syncAutomationInteruptedTimer = me.syncAutomationRunTimer;

                            FormUtil.updateProgressWidth( 0 );
                            FormUtil.showProgressBar( 0 );

                            if ( !FormUtil.dcdConfig ) 
                            {
                                FormUtil.dcdConfig = JSON.parse( DataManager.getData ( me.cwsRenderObj.storageName_RedeemList ) ).dcdConfig;
                                MsgManager.msgAreaShow( 'syncManager > reloading FormUtil.dcdConfig :(' );
                            } 

                            if ( me.pauseProcess )
                            {
                                me.pauseProcess = 0;
                            }

                            me.recursiveSyncItemData ( (me.lastSyncAttempt), btnTag )

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

    me.pauseSync = function(  itmObj, itmClone )
    {
        if ( showMessaging ) console.log( 'pause Sync' );
        DataManager.updateItemFromData( me.cwsRenderObj.storageName_RedeemList, itmObj.id, itmClone ); //ensure 'syncActionStarted' is set in event another sync process is attempted against current [itemData]
        me.pauseProcess = true;
    }

}
