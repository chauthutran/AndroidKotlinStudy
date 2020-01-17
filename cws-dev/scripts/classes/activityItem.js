
// Sync List Item could be named 'ActivityItem'
//  - This 'ActivityItemService' class is for ...
// 
// -------------------------------------------
// -- Block Class/Methods
function ActivityItem( itemJson, itemTag, cwsRenderObj )
{
	var me = this;

    me.itemJson = itemJson;
    me.itemTag = itemTag;
    me.cwsRenderObj = cwsRenderObj;

    me.itemTagActivityType; // activityType display icon (img tag)
    me.itemTagSyncButton;   // sync icon action button (img tag)

    // Greg notes: 
    // Assumptions: 1) not all cards (itemData objects) are visible/loaded on screen >> initialize() can determine this
    //              2) cards layout contain (referenceable) attribute + id information as per v1.2.1 design
    // Reorganized class layout: 
    //              [UI] methods grouped together above [DATA] methods 


	// =============================================
	// === TEMPLATE METHODS ========================

    me.initialize = function() 
    {

        if ( me.itemTag )
        {
            me.initializeUI_Tags()
        }

    }


    // -------------

    me.initializeUI_Tags = function()
    {
        // reference card template tags (required for class to update interface)

        me.itemTagActivityType = me.itemTag.find( '#listItem_icon_activityType_' + me.itemJson.id );

        me.itemTagSyncButton = me.itemTag.find( '#listItem_icon_sync_' + me.itemJson.id );
    }

    me.updateItem_UI_StartSync = function()
    {
        // check is item loaded in screen list 
        if ( me.itemTag )
        {
            // start spinning "busy/working" icon
            me.updateItem_UI_Animation( true, me.itemTagSyncButton ); 
        }

    };

    me.updateItem_UI_FinishSync = function()
    {
        // check is item loaded in screen list 
        if ( me.itemTag )
        {
            // stop spinning "busy" icon
            me.updateItem_UI_Animation( false, me.itemTagSyncButton );

            // update card status + activityType 
            me.updateItem_UI_Icons( me.itemJson, me.cwsRenderObj );
        }

    };

    me.updateItem_UI_Icons = function( itemJson, cwsRenderObj )
    {
        // update card 'status' (submit/fail/queue)
        FormUtil.setStatusOnTag( $( '#listItem_action_sync_' + itemJson.id ).find( 'div.icons-status' ), itemJson, cwsRenderObj );

        // update activityType Icon (opacity of SUBMIT status = 100%, opacity of permanent FAIL = 100%, else 40%)
        FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + itemJson.id )
            , FormUtil.getActivityType ( itemJson )
            , FormUtil.getStatusOpt ( itemJson )
            , cwsRenderObj );
    };

    me.updateItem_UI_Animation = function( runAnimation, itemTagSyncButton )
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



    me.updateItem_Data = function( success, responseJson, callBack )
    {

        me.updateItem_DataFields( success, responseJson, me.itemJson, me.cwsRenderObj, function( dtmSyncAttempt ){

            if ( success ) me.updateItem_Data_CleanUp( me.itemJson );

            me.updateItem_Data_saveHistory( me.itemJson, dtmSyncAttempt, success, returnJson, function(){

                me.updateItem_Data_saveToDB( me.itemJson, callBack );

            } );    

        } );

    };

    me.updateItem_DataFields = function( success, responseJson, itemJson, cwsRenderObj, callBack )
    {
        var dtmDateNow = (new Date() ).toISOString();

        if ( success )
        {
            itemJson.status = Constants.status_redeem_submit;
            itemJson.queueStatus = 'success'; 
            itemJson.title = 'saved to network' + ' [' + dtmDateNow + ']'; 
            itemJson.redeemDate = dtmDateNow;
        }
        else
        {
            // Failed case: 
            // 1. PUT the error message to the title part.. [CHECK responseJson 'msg' format] <- based on old WS response format
            if ( responseJson 
                && responseJson.displayData 
                && ( responseJson.displayData.length > 0 ) ) 
            {
                var msg = JSON.parse( responseJson.displayData[0].value ).msg;
                itemJson.title = msg.toString().replace(/--/g,'<br>'); // create better layout
            }

            // 2. When fail attempt count reaches ##, Mark item as FAIL
            if ( itemJson.networkAttempt >= cwsRenderObj.storage_offline_ItemNetworkAttemptLimit )
            {
                // evaluate conditions for elligible reattempt (for retry)
                itemJson.status = Constants.status_redeem_failed;
            }

        }

        callBack( itemJson, dtmDateNow );

    };

    me.updateItem_Data_CleanUp = function( itemJson )
    {
        //clean out unnecessary 'track history of user naviation' under [activityList]
        if ( itemJson.activityList ) delete itemJson.activityList;
    }


    me.updateItem_Data_saveHistory = function( itemJson, dtmSyncAttempt, success, returnJson )
    {
        var itmHistory = itemJson.history;
        if ( returnJson )
        {
            itmHistory.push ( { "syncAttempt": dtmSyncAttempt, "success": success, "returnJson": returnJson } );
        }
        else
        {
            itmHistory.push ( { "syncAttempt": dtmSyncAttempt, "success": success } );
        }

        itemJson.history = itmHistory; 
    }

    me.updateItem_Data_saveToDB = function( itemJson, callBack )
    {
        // where do we fetch our activityList item from? a new classHandler?
        DataManager.getData( 'redeemList', function( activityData ){

            var bFound = false; 
            for ( var i = 0; i < activityData.list.length; i++ )
            {

                if ( activityData.list[ i ].id === itemJson.id )
                {

                    activityData.list[ i ][ 'lastAttempt' ] = itemJson[ 'lastAttempt' ];
                    activityData.list[ i ][ 'network' ] = itemJson[ 'network' ];
                    activityData.list[ i ][ 'networkAttempt' ] = itemJson[ 'networkAttempt' ];
                    activityData.list[ i ][ 'data' ] = itemJson[ 'data' ];
                    activityData.list[ i ][ 'history' ] = itemJson[ 'history' ];
                    activityData.list[ i ][ 'status' ] = itemJson[ 'status' ];

                    bFound = true;

                }

                if ( bFound ) break;

            }

            DataManager.saveData( 'redeemList', activityData, callBack );

        });


    }

    me.initialize();

}
