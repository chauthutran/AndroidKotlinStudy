// =========================================

function syncManager() 
{
    var me = this;

    me.storage_offline_SyncTimerAutoProcessRun = 60000; // make 60 seconds?
    me.storage_offline_SyncTimerConditionsCheck = 10000; // make 60 seconds?

    //me.haltTimers = false;
    me.appShell;
    me.dcdConfig;
    me.offLineData;
    me.cwsRenderObj;

    me.dataQueued = {};
    me.dataFailed = {};
    me.dataCombine = {};

    me.subProgressBar

    var syncTimeout;
    var progClass;;

    // TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================



	// -----------------------------
	// ---- Methods ----------------

    me.initialize = function( cwsRenderObj ) 
    {
        me.cwsRenderObj = cwsRenderObj;

        //console.log( 'initialize syncManager' );
        me.storage_offline_SyncTimerAutoProcessRun = cwsRenderObj.storage_offline_SyncTimerAutoProcessRun;
        me.storage_offline_SyncTimerConditionsCheck = cwsRenderObj.storage_offline_SyncTimerAutoProcessRun;

        me.subProgressBar = $( '#divProgressBar' ).children()[0];
        progClass = me.subProgressBar.className;

        $( me.subProgressBar ).removeClass( progClass );
        $( me.subProgressBar ).addClass( 'determinate' );

        me.scheduleSyncTest();

    }

    me.evalDataListContent = function()
    {
        if ( FormUtil.login_UserName ) // correct valid-login test?
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
        if ( FormUtil.login_UserName ) // correct valid-login test?
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

    me.scheduleSyncTest = function()
    {
        console.log ( 'scheduleSyncTest.syncTimeout: ' + syncTimeout );

        me.evalDataListContent();

        if ( syncTimeout ) clearTimeout( syncTimeout );

        if ( me.evalSyncConditions() )
        {
            console.log('evalSyncConditions = true, running SYNC');
            me.syncOfflineData();
        }
        else
        {
            console.log('evalSyncConditions = FALSE, adding timer');
            syncTimeout = setTimeout( function() {
                me.scheduleSyncTest();
            }, me.storage_offline_SyncTimerConditionsCheck );
        }

    }

    me.dcdConfigVersionTest = function( btnTag )
    {
        if ( FormUtil.login_UserName ) // correct valid-login test?
        {
            if ( ConnManager.isOnline() )
            {
                //console.log( 'dcdConfigVersionTest');
                var userName = JSON.parse( localStorage.getItem('session') ).user;
                var userPin = Util.decrypt( FormUtil.getUserSessionAttr( userName,'pin' ), 4);
                var userConfig = JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem('session') ).user ) );

                FormUtil.submitLogin( userName, userPin, undefined, function( success, loginData ) 
                {
                    if ( success )
                    {
                        if ( ( userConfig.dcdConfig.version ).toString() < ( loginData.dcdConfig.version ).toString() )
                        {
                            //console.log( ' newer DCD Config available: ' + loginData.dcdConfig.version + ', you currently use: ' + userConfig.dcdConfig.version );
                            MsgManager.msgAreaShow( ' newer DCD Config available: ' + loginData.dcdConfig.version + ', you currently use: ' + userConfig.dcdConfig.version );
                            if ( btnTag )
                            {
                                btnTag.text( 'Update to v' +loginData.dcdConfig.version );
                                btnTag.show();
                            }
                        }
                    }
                    else
                    {
                        var errDetail = ( loginData && loginData.returnCode === 502 ) ? " - Server not available" : "";
                        MsgManager.msgAreaShow( ' DCD Config SERVER not available: ' + errDetail );
                        btnTag.hide();
                    }
                } );

            }
        }

    }

    me.recursiveSyncItemData = function( listItem )
    {

        var bProcess = false;
        var itemData = me.dataCombine[ listItem ];

        if ( itemData )
        {
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
                    MsgManager.msgAreaShow( ' network TEST LIMIT exceeded: ' + me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit );
                }
            }
        }

        if ( bProcess )
        {

            FormUtil.updateProgressPercent( parseFloat( ( (listItem+1) / me.dataCombine.length) * 100).toFixed(0) );

            var dtmRedeemAttempt = (new Date() ).toISOString();

            itemData.lastAttempt = dtmRedeemAttempt;

            //itemData.state = 1; //added to avoid duplicate calls sometimes occurring??? 1=in use, 0=unused
            FormUtil.submitRedeem( itemData.data.url, itemData.data.payloadJson, itemData.data.actionJson, undefined, function( success, returnJson )
            {

                itemData.returnJson = returnJson;

                // added by Greg (2019-01-14) > record network sync attempts (for limit management)
                if ( itemData.networkAttempt ) itemData.networkAttempt += 1; //this increments several fold?? e.g. jumps from 1 to 3, then 3 to 7??? 
                else itemData.networkAttempt = 1;

                // Added 2019-01-08 > check returnJson.resultData.status != 'fail' value as SUCCESS == true always occurring
                if ( success && ( returnJson.resultData.status != 'fail' ) )
                {
                    var dtmRedeemDate = (new Date() ).toISOString();

                    itemData.redeemDate = dtmRedeemDate;
                    itemData.status = me.cwsRenderObj.status_redeem_submit;

                }
                else 
                {
                    if ( returnJson && returnJson.displayData && ( returnJson.displayData.length > 0 ) ) 
                    {
                        var msg = JSON.parse( returnJson.displayData[0].value ).msg;

                        itemData.title = msg.toString().replace(/--/g,'<br>'); // hardcoding to create better layout
                    }

                    /* only when sync-test exceeds limit do we mark item as FAIL */
                    if ( itemData.networkAttempt >= me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit )
                    {
                        itemData.status = me.cwsRenderObj.status_redeem_failed;
                    }

                }

                //itemData.state = 0; //1=in use, 0=unused

                /*setTimeout( function() {
                    myTag.html( itemData.title );
                    me.appendStatusOptThemeIcon ( $( '#icon_' + itemData.id ), me.getStatusOpt ( itemData ) )
                }, 2000 );

                me.setStatusOnTag( itemLiTag.find( 'div.icons-status' ), itemData ); */

                DataManager.updateItemFromData( me.cwsRenderObj.storageName_RedeemList, itemData.id, itemData );

                me.recursiveSyncItemData ( (listItem + 1) )

            } );

        }
        else
        {
            FormUtil.hideProgressBar();

            $( me.subProgressBar ).removeClass( 'determinate' );
            $( me.subProgressBar ).addClass( progClass );

            $( '#imgAppDataSyncStatus' ).stop();
            $( '#divAppDataSyncStatus' ).hide();
            $( '#imgAppDataSyncStatus' ).hide();

            console.log( me.dataCombine );


            if ( syncTimeout ) clearTimeout( syncTimeout );

            syncTimeout = setTimeout( function() {
                me.scheduleSyncTest();
            }, me.storage_offline_SyncTimerConditionsCheck );

            /*if ( $( 'div.listDiv').is(':visible') )
            {
                me.cwsRenderObj.startBlockExecuteAgain();
            }*/
        }

    }

    me.syncOfflineData = function()
    {

        if ( FormUtil.login_UserName ) // correct valid-login test?
        {
            if ( ConnManager.isOnline() )
            {
                if ( me.dataQueued.length + me.dataFailed.length )
                {

                    me.dataCombine = me.dataQueued.concat(me.dataFailed);

                    $( '#imgAppDataSyncStatus' ).rotate({ count: 99999, forceJS: true, startDeg: true });

                    if ( syncTimeout ) clearTimeout( syncTimeout );
                    FormUtil.showProgressBar();
                    me.recursiveSyncItemData ( 0 )

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
