// -------------------------------------------
// -- ActivityItem Class/Methods
//      - Mainly used for syncManager run one activity item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where activity items are processed (in sync)
//              without being displayed on the app list.  
//
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
	// === Initialize Related ========================

    me.initialize = function() 
    {
        me.checkMandatoryData( me.itemJson );

        if ( me.itemTag ) me.initializeUI_Tags( me.itemTag, me.itemJson );
    };


    // -------------
    me.checkMandatoryData = function( itemJson )
    {
        if ( !itemJson ) throw "ActivityItem Create Error - itemJson undefined!";
    };


    me.initializeUI_Tags = function( itemTag, itemJson )
    {
        if ( itemTag )
        {
            // reference card template tags (required for class to update interface)
            me.itemTagActivityType = itemTag.find( '#listItem_icon_activityType_' + itemJson.id );

            me.itemTagSyncButton = itemTag.find( '#listItem_icon_sync_' + itemJson.id );
        }
    };

    // ----------------------------------------------------

    // Perform Submit Operation..
    me.performActivity = function( activityJson, callBack )
    {
        try
        {
           var processing = Util.getJsonDeepCopy( activityJson.processing );

           delete activityJson.processing;

            var loadingTag = undefined;

            var payload = {
                'searchValues': processing.searchValues,
                'captureValues': actionJson
            };

            FormUtil.wsSubmitGeneral( processing.url, payload, loadingTag, function( success, returnJson )
            {
                callBack( success, returnJson );
            });            
            //FormUtil.submitRedeem = function( apiPath, payloadJson, actionJson, loadingTag, returnFunc, asyncCall, syncCall )

        }
        catch( errMsg )
        {
            console.log( 'Error in ActivityItem.performActivity - ' + errMsg );
            callBack( false );
        }
    };




    // TODO: WILL INTEGRATE THE 'ActivityCard' Tag creation..
    /*    
    me.createActivityCard = function( itemData, groupBy )
    {
        var activityCardLiTag;

        try
        {
            activityCardLiTag = $( me.template_ActivityCard );
            var activityCardAnchorTag = activityCardLiTag.find( 'a.expandable' );
    
            // Probably need to populate only one of below 2
            activityCardLiTag.attr( 'itemId', itemData.id );
            activityCardAnchorTag.attr( 'itemId', itemData.id );

            // Title - date description..
            var labelTag = activityCardLiTag.find( 'div.listItem_label_date' );
            labelTag.html( $.format.date( itemData.created, "MMM dd, yyyy - HH:mm" ) );

            // 'QUICK FIX' - Move this to template + move to other class..
            var detailTag = $( '<div style="font-size: 9px; font-style: italic; cursor:pointer;">detail</div>')
            labelTag.append( detailTag );
            detailTag.click( function() {
                e.stopPropagation();  // Stops calling parent tags event calls..
                console.log( itemData );
            });


            var listItem_icon_syncTag = activityCardLiTag.find( '.listItem_icon_sync' );

            // click event - for activitySubmit..
            listItem_icon_syncTag.click( function(e) {                
                e.stopPropagation();  // Stops calling parent tags event calls..
                console.log( 'activityCard Submit Clicked - ' + itemData.id );

                // <-- send request...

            });


            // Populate the button image & click event
            //me.populateData_RedeemItemTag( itemData, activityCardLiTag );

            me.updateActivityCard_UI_Icon( activityCardLiTag, itemData, me.cwsRenderObj );            
        }
        catch( errMsg )
        {
            activityCardLiTag = undefined;
            console.log( 'Error on createActivityCard, errMsg: ' + errMsg );
        }

        return activityCardLiTag;        
    };


    me.updateActivityCard_UI_Icon = function( activityCardLiTag, itemJson, cwsRenderObj )
    {
        try
        {
            // update card 'status' (submit/fail/queue)
            FormUtil.setStatusOnTag( activityCardLiTag.find( 'small.syncIcon' ), itemJson, cwsRenderObj );

            // update activityType Icon (opacity of SUBMIT status = 100%, opacity of permanent FAIL = 100%, else 40%)
            FormUtil.appendActivityTypeIcon ( activityCardLiTag.find( '.listItem_icon_activityType' ) 
                , FormUtil.getActivityType ( itemJson )
                , FormUtil.getStatusOpt ( itemJson )
                , cwsRenderObj );
        }
        catch( errMsg )
        {
            console.log( 'Error on BlockList.updateActivityCard_UI_Icon, errMsg: ' + errMsg );
        }        
    };
    */


    // =============================================
	// === MAIN METHODS - 'syncManager' Related ========================
    // activityItem.updateItem_UI_StartSync();
    // activityItem.updateItem_Data( success, responseJson, function(){
    // activityItem.updateItem_UI_FinishSync();

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

            // TODO: THIS FAILS..  THUS, COMMENTED OUT..
            /*
            // stop spinning "busy" icon
            me.updateItem_UI_Animation( false, me.itemTagSyncButton );

            // update card status + activityType 
            me.updateItem_UI_Icons( me.itemJson, me.cwsRenderObj );

            // TODO:  Update ActivityItem UI based on the updated info.
            //  - Need to get more UI changes from syncManager.endSync()?
            me.updateUI( me.itemTag, me.itemJson );
            */
        }
    };


    me.updateItem_Data = function( success, responseJson, callBack )
    {
        me.updateItem_DataFields( success, responseJson, me.itemJson, me.cwsRenderObj );

        if ( success ) me.updateItem_Data_CleanUp( me.itemJson );

        me.updateItem_Data_saveToDB( me.itemJson, callBack );

        // TODO: LET's not use 'saveHistory' for now.  Let's change other part of app to not use history info.
        //me.updateItem_Data_saveHistory( me.itemJson, dtmSyncAttempt, success, returnJson, function() {
        //} );    
 
    };


    // =============================================
	// === Other Supporting METHODS ========================

    me.updateItem_UI_Icons = function( itemJson, cwsRenderObj )
    {
        // update card 'status' (submit/fail/queue)  <--- TODO: This should be marked as 'Synced'!!!  <-- Only on success
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

    // Update ActivityItem UI based on current activityItem data
    me.updateUI = function( itemTag, itemJson )
    {
        me.updateItem_UI_Button( itemTag.find( 'small.syncIcon img' ) );

        // PUT: Any other changes reflected on the ActivityItem - by submit..
    };


    me.updateItem_UI_Button = function( btnTag )
    {
        if ( btnTag )
        {
            if ( btnTag.hasClass( 'clicked' ) )
            { 
                btnTag.removeClass( 'clicked' );
            }
        }        
    };

    // --------------------------

    me.updateItem_DataFields = function( success, responseJson, itemJson, cwsRenderObj )
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

    };


    me.updateItem_Data_CleanUp = function( itemJson )
    {
        //clean out unnecessary 'track history of user naviation' under [activityList]
        if ( itemJson.activityList ) delete itemJson.activityList;
    };


    // NOT USED FOR NOW.
    //me.updateItem_Data_saveHistory = function( itemJson, dtmSyncAttempt, success, returnJson )
    //{
    //    itemJson.history.push ( { "syncAttempt": dtmSyncAttempt, "success": success, "returnJson": returnJson } );
    //}


    me.updateItem_Data_saveToDB = function( itemJson, callBack )
    {
        var activityItem = ActivityDataManager.getActivityItem( "activityId", itemJson.activityId );

        if ( activityItem )
        {
            activityItem.lastAttempt = itemJson.lastAttempt;
            activityItem.network = itemJson.network;
            activityItem.networkAttempt = itemJson.networkAttempt;
            activityItem.data = itemJson.data;
            // activityItem.history = itemJson.history;
            activityItem.status = itemJson.status;

            ClientDataManager.saveCurrent_ClientsStore( callBack );
        }
        else
        {
            //callBack( false );
            throw "Error in ActivityItem.updateItem_Data_saveToDB - activityItem by id not found";
        }
    };


    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

}

