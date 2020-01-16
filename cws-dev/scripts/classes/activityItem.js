
// Sync List Item could be named 'ActivityItem'
//  - This 'ActivityItemService' class is for ...
// 
// -------------------------------------------
// -- Block Class/Methods
function ActivityItem( itemJson, itemTag, cwsRenderObj )
{
	var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.itemJson = itemJson;
    me.itemTag = itemTag;


    me.itemTagActivityType; // activityType display icon (img tag)
    me.itemTagSyncButton;         // sync icon action button (img tag)



    /* Greg notes: */
    /* Assumptions: 1) not all cards (itemData objects) are visible/loaded on screen >> initialize() can determine this
                    2) cards layout contain (referenceable) attribute + id information as per v1.2.1 design
    */

    


	// =============================================
	// === TEMPLATE METHODS ========================

    me.initialize = function() 
    {

        if ( me.itemTag )
        {
            me.initializeUI_Tags()
        }

    }


	//me.render = function() {}  // <-- if we create it to display on the list initially...



    // -------------

    me.initializeUI_Tags = function()
    {
        // reference card template tags (required for class to update interface)
        me.itemTagActivityType = me.itemTag.find( '#listItem_icon_activityType_' + me.itemJson.id );

        me.itemTagSyncButton = me.itemTag.find( '#listItem_icon_sync_' + me.itemJson.id );
    }


    me.updateItem_Data = function( success, responseJson, callBack )
    {
        if ( success )
        {
            me.syncSuccess( responseJson, callBack );
        }
        else
        {
            me.syncFail( responseJson, callBack );
        }

    };

    me.updateItem_UI_StartSync = function()
    {
        // check is item loaded in screen list 
        if ( me.itemTag )
        {
            me.syncIcon_Animate( true ); // start spinning "busy/working" icon
        }

    };

    me.updateItem_UI_FinishSync = function()
    {
        // check is item loaded in screen list 
        if ( me.itemTag )
        {
            // stop spinning "busy" icon
            me.syncIcon_Animate( false );

            // update card status + activityType 
            me.updateItem_UI_Icons();
        }

    };

    me.updateItem_UI_Icons = function()
    {
        // update card 'status' (submit/fail/queue)
        FormUtil.setStatusOnTag( $( '#listItem_action_sync_' + me.itemData.id ).find( 'div.icons-status' ), me.itemData, syncManager.cwsRenderObj );

        // update activityType Icon (opacity of SUBMIT status = 100%, opacity of permanent FAIL = 100%, else 40%)
        FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + me.itemData.id ), FormUtil.getActivityType ( me.itemData ), FormUtil.getStatusOpt ( me.itemData ), syncManager.cwsRenderObj )

    }


    me.syncIcon_Animate = function( runAnimation )
    {
        if ( runAnimation )
        {
            me.itemTagSyncButton.rotate({ count:999, forceJS: true, startDeg: 0 });
        }
        else
        {
            me.itemTagSyncButton.stop();
        }
    }



    me.syncSuccess = function( responseJson, callBack )
    {
        // 1. update 'root' field values [redeemedDate, msg, status, title, etc]
        // 2. increment [log]
        // 3. clean up itemData record, remove 'bloat'
        // 4. save to indexedDB

        callBack();

    }

    me.syncFail = function( responseJson, callBack )
    {
        // 0. run 'fail check' routine (e.g. exceeded limit, special errors/actions, etc)
        // 1. update 'root' field values [redeemedDate, msg, status, title, etc]
        // 2. increment [log]
        // 3. save to indexedDB

        callBack();

    }


    me.initialize();

}
