// =========================================

function syncManager() 
{
    var me = this;

    me.timerSyncConditionsCheck = 10000; // make 60 seconds?
    me.timerSyncRun = 300000; // attempt to run sync every X ms
    me.appShell;
    me.dcdConfig;
    me.offLineData;
    me.cwsRenderObj;

    me.dataQueued = {};
    me.dataFailed = {};

    me.evalDataListCounter = 0;
    me.evalSyncConditionsCounter = 0;

    // TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================



	// -----------------------------
	// ---- Methods ----------------

    me.initialize = function( cwsRenderObj ) 
    {
        me.cwsRenderObj = cwsRenderObj;

        //console.log( 'initialize syncManager' );

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
                    var myFailed = myData.filter( a=>a.status == me.cwsRenderObj.status_redeem_failed && (!a.networkAttempt || a.networkAttempt <= me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit) );

                    me.dataQueued = myQueue;
                    me.dataFailed = myFailed;
                }
                //console.log( 'queue: ' + me.dataQueued.length + ' failed: ' + me.dataFailed.length);
            }
        }
        me.evalDataListCounter += 1;
        //console.log( 'evalDataListContent: ' + me.evalDataListCounter );
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
                    //$( '#imgAppDataSyncStatus' ).click();
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
        me.evalSyncConditionsCounter += 1;
        //console.log( 'evalSyncConditions: ' + me.evalSyncConditionsCounter );
    }

    me.scheduleSyncTest = function()
    {
        me.evalDataListContent();
        me.evalSyncConditions();
        
        setTimeout( function() {
            me.scheduleSyncTest();
        }, me.timerSyncConditionsCheck );
    }

    //me.initialize();

}
