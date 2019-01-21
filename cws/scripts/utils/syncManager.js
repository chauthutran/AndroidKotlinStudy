// =========================================

function syncManager() 
{
    var me = this;

    me.storage_offline_SyncTimerAutomationRun;      //uses setTimeout
    me.storage_offline_SyncTimerConditionsCheck;    //uses setInterval

    //me.haltTimers = false;
    me.appShell;
    me.dcdConfig;
    me.offLineData;
    me.cwsRenderObj;

    me.dataQueued = {};
    me.dataFailed = {};
    me.dataCombine = {};

    me.syncRunning = 0;
    me.subProgressBar;

    var syncConditionCheckTimer = 0;
    var syncAutomationRunTimeout = 0;
    var syncAutomationLastTimeout = 0;
    var progClass;

	// -----------------------------
    // syncManager: uses timerInterval for 'conditionCheck', then uses timeOut to call automated Sync (unless already clicked by user)
    // -----------------------------

    me.initialize = function( cwsRenderObj ) 
    {

        //console.log( 'initialize syncManager' );

        me.cwsRenderObj = cwsRenderObj;
        me.storage_offline_SyncTimerAutomationRun = cwsRenderObj.storage_offline_SyncTimerAutomationRun;
        me.storage_offline_SyncTimerConditionsCheck = cwsRenderObj.storage_offline_SyncTimerConditionsCheck;

        /* store progress bar class - to be upgraded to it's own class later */
        me.subProgressBar = $( '#divProgressBar' ).children()[0];
        progClass = me.subProgressBar.className;

        syncConditionCheckTimer = setInterval( function() {
            me.scheduleSyncConditionsTest();
        }, me.storage_offline_SyncTimerConditionsCheck );

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

    me.scheduleSyncConditionsTest = function()
    {
        me.evalDataListContent();

        if ( me.evalSyncConditions() )
        {
            if ( ( syncAutomationLastTimeout && syncAutomationRunTimeout ) && ( syncAutomationLastTimeout == syncAutomationRunTimeout ) )
            {
                if ( !me.syncRunning ) me.scheduleSyncAutomationRun();
            }
            else
            {
                if ( !syncAutomationRunTimeout && !me.syncRunning ) me.scheduleSyncAutomationRun();
            }
            //console.log ( 'scheduleSyncConditionsTest.GOOD, syncAutomationRunTimeout: ' + syncAutomationRunTimeout );
        }
        else
        {
            if ( syncAutomationRunTimeout )
            {
                clearTimeout( syncAutomationRunTimeout );
                syncAutomationLastTimeout = syncAutomationRunTimeout;
            }
        }


    }

    me.scheduleSyncAutomationRun = function()
    {
        if ( me.evalSyncConditions() && !me.syncRunning )
        {
            console.log ( 'scheduleSyncAutomationRun.evalSyncConditions.GOOD > creating timer in ' +me.storage_offline_SyncTimerAutomationRun+'ms : ' + (new Date() ).toISOString() );
            syncAutomationRunTimeout = setTimeout( function() {
                //me.scheduleSyncAutomationRun();
                console.log('syncOfflineData, running SYNC');
                me.syncOfflineData();
            }, me.storage_offline_SyncTimerAutomationRun );
        }
        else
        {
            console.log('evalSyncConditions = FALSE, skilling timer creation');
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
			if ( returnJson && returnJson.version )
			{
				console.log( 'appShellVersionTest: ' + queryLoc );
                //console.log( returnJson );

                var appShellVersion = $( '#spanVersion' ).html().replace('v','');
                
                if ( appShellVersion.toString() < ( returnJson.version ).toString() )
                {
                    MsgManager.msgAreaShow( ' newer AppShell available: ' + returnJson.version + ', you currently use: ' + appShellVersion );
                    if ( btnTag )
                    {
                        btnTag.text( 'Update to v' +returnJson.version );
                        btnTag.show();
                    }
                }

				//if ( returnFunc ) returnFunc( returnJson );
			}
			else
			{
                console.log( 'error checking appShellInfo, trying again : ' + queryLoc );

				// try running the dailyCache
				FormUtil.wsSubmitGeneral( queryLoc, new Object(), loadingTag, function( success, allJson ) {
					if ( success && allJson )
					{
						//console.log( 'all appShellInfo: ' );
						//console.log( allJson );

                        if ( appShellVersion.toString() < ( returnJson.version ).toString() )
                        {
                            //console.log( ' newer DCD Config available: ' + loginData.dcdConfig.version + ', you currently use: ' + userConfig.dcdConfig.version );
                            MsgManager.msgAreaShow( ' newer AppShell available: ' + returnJson.version + ', you currently use: ' + appShellVersion );
                            if ( btnTag )
                            {
                                btnTag.text( 'Update to v' +returnJson.version );
                                btnTag.show();
                            }
                        }

						/*if ( allJson.langauges )
						{
							var enLang = Util.getFromList( allJson.langauges, "en", "code" );
							if ( enLang ) enLangTerm = enLang.terms;
						}*/

						//if ( returnFunc ) returnFunc( enLangTerm );
					}
					else
					{
						console.log( 'all appShellInfo FAILED: ' );

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

    me.recursiveSyncItemData = function( listItem, btnTag )
    {

        me.syncRunning = 1;
        FormUtil.showProgressBar();

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
            console.log ( 'SyncItem > ' + (listItem+1) + ' / ' + me.dataCombine.length + ' = ' + parseFloat( ( (listItem+1) / me.dataCombine.length) * 100).toFixed(0) );
            FormUtil.updateProgressWidth( parseFloat( ( (listItem+1) / me.dataCombine.length) * 100).toFixed(0) + '%' );

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

                me.recursiveSyncItemData ( (listItem + 1), btnTag )

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


            if ( btnTag )
            {
                if ( btnTag.hasClass( 'clicked' ) )
                { 
                    btnTag.removeClass( 'clicked' );
                }
            }

            me.syncRunning = 0;

            //if ( syncAutomationRunTimeout ) clearTimeout( syncAutomationRunTimeout );

            //me.scheduleSyncConditionsTest();

            // refresh list if currently visible > ideally each itemData block should be refreshed
            /*if ( $( 'div.listDiv').is(':visible') )
            {
                me.cwsRenderObj.startBlockExecuteAgain();
            }*/
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

                            $( '#imgAppDataSyncStatus' ).rotate({ count: 99999, forceJS: true, startDeg: true });

                            $( me.subProgressBar ).removeClass( progClass );
                            $( me.subProgressBar ).addClass( 'determinate' );

                            syncAutomationLastTimeout = syncAutomationRunTimeout;

                            FormUtil.updateProgressWidth( 0 );
                            FormUtil.showProgressBar( 0 );

                            me.recursiveSyncItemData ( 0, btnTag )

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

}
