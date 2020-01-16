
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
    me.itemTagSyncButton;         // sync icon action button (img tag)



    // Greg notes: 
    // Assumptions: 1) not all cards (itemData objects) are visible/loaded on screen >> initialize() can determine this
    //                2) cards layout contain (referenceable) attribute + id information as per v1.2.1 design
    


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

        // Update itemJson data & history
        me.updateItem_DataFields( success, responseJson, me.itemJson, me.cwsRenderObj );

        // 4. save to indexedDB
        

        if ( success ) me.cleanUpItem_activityList( me.itemJson );
    };

    //if ( success )
    //{
        //me.syncSuccess( responseJson, callBack );

        // 1. update 'root' field values [redeemedDate, msg, status, title, etc]
        // 2. increment [log]

        // 3. clean up itemData record, remove 'bloat'
        // 4. save to indexedDB
    //}
    //else
    //{
        //me.syncFail( responseJson, callBack );

        // 0. run 'fail check' routine (e.g. exceeded limit, special errors/actions, etc)
        // responseCodes Doc [ ]

        // 1. update 'root' field values [msg, status, title, etc]

        // 2. increment [log] (history)
        // 3. save to indexedDB
    //}


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
            , FormUtil.getStatusOpt ( me.itemJson )
            , cwsRenderObj );
    };


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
    };


    me.updateItem_DataFields = function( success, responseJson, itemJson, cwsRenderObj )
    {
        var dtmDateNow = (new Date() ).toISOString();

        if ( success )
        {
            itemJson.redeemDate = dtmDateNow;
            itemJson.title = 'saved to network' + ' [' + dtmDateNow + ']'; // MISSING TRANSLATION
            itemJson.status = Constants.status_redeem_submit;
            itemJson.queueStatus = 'success'; // MISSING TRANSLATION
        }
        else
        {
            // Failed case: 
            // 1. PUT the error message to the title part..
            if ( responseJson 
                && responseJson.displayData 
                && ( responseJson.displayData.length > 0 ) ) //& !syncManager.pauseProcess ) 
            {
                var msg = JSON.parse( responseJson.displayData[0].value ).msg;
        
                itemJson.title = msg.toString().replace(/--/g,'<br>'); // hardcoding to create better layout
                // newTitle = 'error > ' + msg.toString().replace(/--/g,'<br>');
            }
        
            // 2. When fail attempt count reaches ##, Mark item as FAIL
            if ( itemJson.networkAttempt >= cwsRenderObj.storage_offline_ItemNetworkAttemptLimit )
               // && ConnManager.networkSyncConditions() ) // & !syncManager.pauseProcess )
            {
                itemJson.status = Constants.status_redeem_failed;
                itemJson.queueStatus = Constants.status_redeem_failed;
                // newTitle = 'error occurred > exceeded network attempt limit';
            }
            else
            {
                // Move 'retry' string to Constants?
                // itemJson.queueStatus = 'retry'; // MISSING TRANSLATION
            }
        }
        

        // Place Log or History - from responseJson to itemJson.history
    };

    me.cleanUpItem_activityList = function( itemJson )
    {
        //clean out unnecessary 'track history of user naviation'
        if ( itemJson.activityList ) delete itemJson.activityList;
    }

    me.initialize();

}
