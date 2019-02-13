// =========================================

function syncManager() 
{
    var me = this;

    me.storage_offline_SyncTimerAutomationRun;      //uses setTimeout
    me.storage_offline_SyncTimerConditionsCheck;    //uses setInterval
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

    me.syncConditionCheckTimer = 0;
    me.syncAutomationRunTimeout = 0;

    me.pauseProcess = false;
    me.lastSyncAttempt = 0;

    var syncAutomationLastTimeout = 0;
    var progClass;

	// -----------------------------
    // syncManager: uses timerInterval for 'conditionCheck', then uses timeOut to call automated Sync (unless already clicked by user)
    // -----------------------------

    me.initialize = function( cwsRenderObj ) 
    {

        //console.log( 'initialize syncManager' );

        me.cwsRenderObj = cwsRenderObj;
        me.cwsRenderObj.updateFromSession();

        me.storage_offline_SyncTimerAutomationRun = cwsRenderObj.storage_offline_SyncTimerAutomationRun;
        me.storage_offline_SyncTimerConditionsCheck = cwsRenderObj.storage_offline_SyncTimerConditionsCheck;

        /* store progress bar class - to be upgraded to it's own class later */
        me.subProgressBar = $( '#divProgressBar' ).children()[0];
        progClass = me.subProgressBar.className;

        me.syncConditionCheckTimer = setInterval( function() {
            me.scheduledSyncConditionsTest();
        }, me.storage_offline_SyncTimerConditionsCheck );

    }

    me.reinitialize = function( cwsRenderObj )
    {
        //console.log( 'syncManager.reinitialize');
        me.cwsRenderObj = cwsRenderObj;
        me.cwsRenderObj.updateFromSession();

        me.storage_offline_SyncTimerConditionsCheck = cwsRenderObj.storage_offline_SyncTimerConditionsCheck;
        me.storage_offline_SyncTimerAutomationRun = cwsRenderObj.storage_offline_SyncTimerAutomationRun;

        if ( me.syncConditionCheckTimer ) clearTimeout( me.syncConditionCheckTimer );
        if ( me.syncAutomationRunTimeout )
        {
            clearTimeout( me.syncAutomationRunTimeout );
            me.syncAutomationRunTimeout = undefined;

            /*if ( $( '#divAppDataSyncStatus' ).is(':visible') )
            {
                $( '#divAppDataSyncStatus' ).hide();
                $( '#imgAppDataSyncStatus' ).hide();    
            }*/
        } 

        if ( me.storage_offline_SyncTimerConditionsCheck > 0 )
        {
            me.syncConditionCheckTimer = setInterval( function() {
                me.scheduledSyncConditionsTest();
            }, me.storage_offline_SyncTimerConditionsCheck );
        }

        //console.log( 'restarted syncManager.scheduledSyncConditionsTest >> me.storage_offline_SyncTimerConditionsCheck: ' + me.storage_offline_SyncTimerConditionsCheck + ' me.storage_offline_SyncTimerAutomationRun: ' + me.storage_offline_SyncTimerAutomationRun + ' {syncConditionCheckTimer}: ' + me.syncConditionCheckTimer);

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
            if ( ConnManager.isOnline() )
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
                }
            }
            else
            {
                $( '#divAppDataSyncStatus' ).hide();
                $( '#imgAppDataSyncStatus' ).hide();
            }
        }
    }

    me.scheduledSyncConditionsTest = function()
    {
        me.evalDataListContent();

        if ( me.evalSyncConditions() )
        {
            if ( ( syncAutomationLastTimeout && me.syncAutomationRunTimeout ) && ( syncAutomationLastTimeout == me.syncAutomationRunTimeout ) )
            {
                if ( !me.syncRunning ) me.scheduleSyncAutomationRun();
            }
            else
            {
                if ( !me.syncAutomationRunTimeout && !me.syncRunning ) me.scheduleSyncAutomationRun();
            }
            //console.log ( 'scheduledSyncConditionsTest.GOOD, me.syncAutomationRunTimeout: ' + me.syncAutomationRunTimeout );
        }
        else
        {
            if ( me.syncAutomationRunTimeout )
            {
                clearTimeout( me.syncAutomationRunTimeout );
                syncAutomationLastTimeout = me.syncAutomationRunTimeout;
            }
        }

    }

    me.scheduleSyncAutomationRun = function()
    {
        if ( me.evalSyncConditions() && !me.syncRunning && me.syncAutomationRunTimeout > 0 )
        {
            me.syncAutomationRunTimeout = setTimeout( function() {
                me.syncOfflineData();
            }, me.storage_offline_SyncTimerAutomationRun );
            //console.log ( 'scheduleSyncAutomationRun.evalSyncConditions.GOOD > created timer [' + me.syncAutomationRunTimeout + '] to run in ' +me.storage_offline_SyncTimerAutomationRun+'ms : ' + (new Date() ).toISOString() );
        }

    }

    me.appShellVersionTest = function( btnTag )
    {
		// api/dataStore/Connect_config/pwa_info

		var queryLoc = FormUtil.getWsUrl( '/api/getPWAInfo' ); 
		var loadingTag = undefined;

		// Do silently?  translate it afterwards?  <-- how do we do this?
		// config should also note all the 'term' into tags..
		FormUtil.wsRetrievalGeneral( queryLoc, loadingTag, function( returnJson )
		{
            var appShellVersion = $( '#spanVersion' ).html().replace('v','');

			if ( returnJson && returnJson.version )
			{
				console.log ( appShellVersion.toString() + ' vs ' + returnJson.version );

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

				//if ( returnFunc ) returnFunc( returnJson );
			}
			else
			{
                //console.log( 'error checking appShellInfo, trying again : ' + queryLoc );

				// try running the dailyCache
				FormUtil.wsSubmitGeneral( queryLoc, new Object(), loadingTag, function( success, allJson ) {
					if ( success && allJson )
					{
                        console.log ( appShellVersion.toString() + ' vs ' + returnJson.version );

                        if ( appShellVersion.toString() < ( returnJson.version ).toString() )
                        {
                            //console.log( ' newer DCD Config available: ' + loginData.dcdConfig.version + ', you currently use: ' + userConfig.dcdConfig.version );
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

						//if ( returnFunc ) returnFunc( enLangTerm );
					}
					else
					{
                        //console.log( 'all appShellInfo FAILED: ' );
                        btnTag.hide();
                        if ( ! $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).addClass( 'disabled' );
                        if ( $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgaboutInfo_AppVersion_Less' ).removeClass( 'enabled' );

						//if ( returnFunc ) returnFunc( new Object() );
					}
				});			
			}
		});
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
                        console.log ( userConfig.dcdConfig.version + ' vs ' + loginData.dcdConfig.version );
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

        if ( ! ConnManager.isOnline() )
        {
            me.pauseSync( itemData, itemClone);
            bProcess = false;
        }
        else
        {
            if ( !me.pauseProcess && ConnManager.isOnline() )
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

                console.log ( 'SyncItem > ' + (listItem+1) + ' / ' + me.dataCombine.length + ' = ' + parseFloat( ( (listItem+1) / me.dataCombine.length) * 100).toFixed(0) );
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

                    //console.log( success, returnJson, ConnManager.isOnline() );
                    console.log( '1. Response: ' + success );

                    // network conditions deteriorate during sync process run
                    if ( !success && !returnJson && !ConnManager.isOnline() )
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
                            MsgManager.msgAreaShow ( 'Auto-Sync PAUSED > network conditions' )
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
                            if ( returnJson && returnJson.displayData && ( returnJson.displayData.length > 0 ) && ConnManager.isOnline() & !me.pauseProcess ) 
                            {
                                var msg = JSON.parse( returnJson.displayData[0].value ).msg;
        
                                itemData.title = msg.toString().replace(/--/g,'<br>'); // hardcoding to create better layout

                                newTitle = 'error > ' + msg.toString().replace(/--/g,'<br>');
                            }

                            /* only when sync-test exceeds limit do we mark item as FAIL */
                            if ( itemData.networkAttempt >= me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit && ConnManager.isOnline() & !me.pauseProcess )
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

                        if ( ConnManager.isOnline() & !me.pauseProcess )
                        {
                            DataManager.updateItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id, itemData );
                            FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + itemData.id ), FormUtil.getActivityType ( itemData ), FormUtil.getStatusOpt ( itemData ) )

                            me.recursiveSyncItemData ( (listItem + 1), btnTag )
                        }
                        else
                        {
                            if ( !me.pauseProcess )
                            {
                                me.pauseSync( itemData, itemClone);
                            }

                            DataManager.updateItemFromData( me.cwsRenderObj.storageName_RedeemList, itemClone.id, itemClone );
                            FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + itemClone.id ), FormUtil.getActivityType ( itemClone ), FormUtil.getStatusOpt ( itemClone ) )

                            me.endSync( btnTag );
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
            MsgManager.msgAreaShow ( 'Auto-Sync PAUSED > network conditions' )
        }
        else
        {
            MsgManager.msgAreaShow ( 'Auto-Sync COMPLETED > processed ' + ( me.lastSyncAttempt + 1) )
            me.lastSyncAttempt = 0;
        }
    }

    me.syncOfflineData = function( btnTag )
    {
        var Proceed = false;

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
                    if ( ConnManager.isOnline() )
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

                            syncAutomationLastTimeout = me.syncAutomationRunTimeout;

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
        DataManager.updateItemFromData( me.cwsRenderObj.storageName_RedeemList, itmObj.id, itmClone ); //ensure 'syncActionStarted' is set in event another sync process is attempted against current [itemData]
        me.pauseProcess = true;
    }

}
