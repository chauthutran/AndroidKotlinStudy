// -------------------------------------------
// -- ActivityCard Class/Methods
//      - Mainly used for syncManager run one activity item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where activity items are processed (in sync)
//              without being displayed on the app list.  
//
function ActivityCard( activityId, cwsRenderObj )
{
	var me = this;

    me.activityId = activityId;
    me.cwsRenderObj = cwsRenderObj;

    // -----------------------------------


    //me.activityCardLiTag = activityCardLiTag;  // <-- This could also be not available..
    //me.divListItemTag = me.activityCardLiTag.find( 'div.listItem' );

    //me.divListItemTag_ActivityType; // activityType display icon (img tag)
    //me.divListItemTag_SyncButton;   // sync icon action button (img tag)

    // Greg notes: 
    // Assumptions: 1) not all cards (itemData objects) are visible/loaded on screen >> initialize() can determine this
    //              2) cards layout contain (referenceable) attribute + id information as per v1.2.1 design
    // Reorganized class layout: 
    //              [UI] methods grouped together above [DATA] methods 


	// =============================================
	// === Initialize Related ========================

    me.initialize = function() { };
   
    // ----------------------------------------------------
   
    me.getActivityCardLiTag = function()
    {
        return $( 'li.activityItemCard[itemid="' + me.activityId + '"]' );
    };

    me.getSyncButtonTag = function()
    {
        return me.getActivityCardLiTag().find( '.listItem_icon_sync' );
    };
    
    // ----------------------------------------------------

    me.render = function()
    {        
        var activityCardLiTag = me.getActivityCardLiTag();

        console.log( 'render' );
        console.log( 'activityCardLiTag' );

        // If tag is visible (has been created), perform render
        if ( activityCardLiTag )
        {
            var activityJson = ActivityDataManager.getActivityItem( "activityId", me.activityId );

            try
            {
                var divListItemContentTag = activityCardLiTag.find( 'div.divListItemContent' );
                var activityCardAnchorTag = activityCardLiTag.find( 'a.expandable' );
                var contentDivTag = activityCardLiTag.find( 'div.listItem' );


                // --- See More Related Tags
                var divSeeMoreTag = activityCardLiTag.find( 'div.act-l' );
                var divSeeMoreBtnTag = divSeeMoreTag.find( 'div.act-l-more' );
                var divSeeMoreContentTag = divSeeMoreTag.find( 'div.act-l-expander' );
        
                var activityTrans = me.getCombinedTrans( activityJson );

                
                // 1. ActivityCard data display (preview)
                me.setActivityContentDisplay( activityJson, activityTrans, divListItemContentTag, me.cwsRenderObj.configJson );


                // 2. 'SyncUp' Button Related
                // click event - for activitySubmit..
                var listItem_icon_syncTag = activityCardLiTag.find( '.listItem_icon_sync' );
                listItem_icon_syncTag.off( 'click' );
                
                if ( activityJson.processing )
                {
                    activityCardLiTag.find( '.divListItem_icon_sync' ).show();

                    listItem_icon_syncTag.on( 'click', function( e ) 
                    {
                        e.stopPropagation();  // Stops calling parent tags event calls..
    
                        me.activitySubmitSyncClick(); 
                    });    

                    // Icons Render
                    me.updateActivityCard_UI_Icon( activityCardLiTag, activityJson, me.cwsRenderObj );                         
                }
                else
                {
                    activityCardLiTag.find( '.divListItem_icon_sync' ).hide();
                }
    
    
                // 3. 'SeeMore' Related - divSeeMoreBtnTag click to display more/less --> By toggling class
                contentDivTag.off( 'click' );
                contentDivTag.on( 'click', function( e ) 
                {
                    e.stopPropagation();                
                    activityCardAnchorTag.toggleClass( 'expanded' ); 
                });

                divSeeMoreBtnTag.off( 'click' );
                divSeeMoreBtnTag.on( 'click', function( e ) 
                {
                    e.stopPropagation();
                    divSeeMoreContentTag.toggleClass( 'act-l-more-open' );
    
                    if ( divSeeMoreContentTag.hasClass( 'act-l-more-open' ) )
                    {
                        console.log( activityJson );
    
                        var jsonViewer = new JSONViewer();
                        divSeeMoreContentTag.append( jsonViewer.getContainer() );
    
                        jsonViewer.showJSON( activityTrans );
                    }
                    else
                    {
                        divSeeMoreContentTag.html( '' );
                    }
                });           

            }
            catch( errMsg )
            {
                console.log( 'Error on ActivityCard.render, errMsg: ' + errMsg );
            }
        }
    };


    me.setActivityContentDisplay = function( activity, activityTrans, divListItemContentTag, configJson )
    {
        var displaySettings = ConfigUtil.getActivityDisplaySettings( configJson );
        var divLabelTag = divListItemContentTag.find( 'div.listItem_label_date' );

        var activityItem = activity;  // Temporarily backward compatible..

        if ( !displaySettings )
        {
            // If displaySettings does not exists, simply display the date label <-- fixed display
            // Title - date description..

            if ( activity.activityDate && activity.activityDate.createdOnDeviceUTC ) 
            {
                var localDateTimeObj = Util.dateUTCToLocal( activity.activityDate.createdOnDeviceUTC );
                divLabelTag.html( $.format.date( localDateTimeObj, "MMM dd, yyyy - HH:mm" ) );
            }
        }
        else
        {
            // If custom config display, remove 
            divLabelTag.remove();
            divListItemContentTag.find( 'div.activityContentDisplay' ).remove();
            
            for( var i = 0; i < displaySettings.length; i++ )
            {
                // Need 'activity', 'activityTrans'
                var dispSettingEvalStr = displaySettings[ i ];
                var displayEvalResult = "------------";
    
                try
                {
                    displayEvalResult = eval( dispSettingEvalStr );
                    //divListItemContentTag.append( '<div class="activityContentDisplay">' + displayEvalResult + '</div>' );
                }
                catch ( errMsg )
                {
                    console.log( 'Error on BlockList.setActivityContentDisplay, errMsg: ' + errMsg );
                }
    
                divListItemContentTag.append( '<div class="activityContentDisplay">' + displayEvalResult + '</div>' );    
            }

            //"displaySetting": [
            //    "'<b><i>' + $.format.date( Util.dateUTCToLocal( activity.activityDate.createdOnDeviceUTC ), 'MMM dd, yyyy - HH:mm' ) + '</i></b>'",
            //    "activityTrans.firstName + ' ' + activityTrans.lastName"
            // ],

        }                    
    };


    me.getCombinedTrans = function( activityJson )
    {
        var jsonShow = {};

        try
        {
            var tranList = activityJson.transactions;

            for( var i = 0; i < tranList.length; i++ )
            {
                var tranData = tranList[i].dataValues;

                if ( tranData )
                {
                    for ( var prop in tranData ) 
                    {
                        jsonShow[ prop ] = tranData[ prop ];
                    }
                }
            }
        }
        catch ( errMsg )
        {
            console.log( 'Error during BlockList.getCombinedTrans, errMsg: ' + errMsg );
        }

        return jsonShow;
    };


    me.activitySubmitSyncClick = function()
    {        
        if ( SyncManagerNew.syncStart() )
        {
            try
            {        
                me.performSyncUp( function( success ) {
    
                    SyncManagerNew.syncFinish();     

                    if ( success ) me.render();
                });    
            }
            catch( errMsg )
            {
                console.log( 'ERROR on running on activityCard.SyncUpItem, errMsg - ' + errMsg );
                SyncManagerNew.syncFinish();     
            }
        }
    };
                
    
    me.updateActivityCard_UI_Icon = function( activityCardLiTag, activityJson, cwsRenderObj )
    {
        try
        {
            // update card 'status' (submit/fail/queue)
            FormUtil.setStatusOnTag( activityCardLiTag.find( 'small.syncIcon' ), activityJson.processing, cwsRenderObj );

            // update activityType Icon (opacity of SUBMIT status = 100%, opacity of permanent FAIL = 100%, else 40%)
            FormUtil.appendActivityTypeIcon ( activityCardLiTag.find( '.listItem_icon_activityType' ) 
                , FormUtil.getActivityType ( activityJson )
                , FormUtil.getStatusOpt ( activityJson )
                , cwsRenderObj );
        }
        catch( errMsg )
        {
            console.log( 'Error on BlockList.updateActivityCard_UI_Icon, errMsg: ' + errMsg );
        }        
    };


    // Perform Submit Operation..
    me.performSyncUp = function( callBack )
    {
        if ( !SyncManagerNew.checkCondition_SyncReady() ) 
        {
            // TODO: Change this as other message showing..
            alert( 'Sync not available with current status..' );
        }
        else
        {
            var activityCardLiTag = me.getActivityCardLiTag();

            try
            {
                // run UI animations
                if ( activityCardLiTag ) me.updateItem_UI_StartSync();
    
                var activityJson = ActivityDataManager.getActivityItem( "activityId", me.activityId );            
                var processing = Util.getJsonDeepCopy( activityJson.processing );
                delete activityJson.processing;
    
                var payload = {
                    'searchValues': processing.searchValues,
                    'captureValues': activityJson
                };
    
                console.log( 'ActivityCard syncUp payload: ' );
                console.log( payload );
                
                var loadingTag = undefined;
                //FormUtil.submitRedeem = function( apiPath, payloadJson, activityJson, loadingTag, returnFunc, asyncCall, syncCall )
                FormUtil.wsSubmitGeneral( processing.url, payload, loadingTag, function( success, responseJson )
                {
                    if ( activityCardLiTag ) me.updateItem_UI_FinishSync();
                    
                    me.syncUpResponseHandle( success, responseJson, callBack );
                });            
    
            }
            catch( errMsg )
            {
                if ( activityCardLiTag ) me.updateItem_UI_FinishSync();
    
                console.log( 'Error in ActivityCard.syncUp - ' + errMsg );
                callBack( false );
            }
        }
    };


    // =============================================
    // TODO: WILL INTEGRATE THE 'ActivityCard' Tag creation..
       
    //me.createActivityCard = function( itemData, groupBy )
    //{
    //    .......
    //    return activityCardLiTag;        
    //};

    //me.updateActivityCard_UI_Icon = function( activityCardLiTag, activityJson, cwsRenderObj )
    //{
    //    .......
    //};


    me.syncUpResponseHandle = function( success, responseJson, callBack )
    {
        // if 'success' and return json content also suggests that, 
        //      <-- existance of 'note' 

        console.log( 'ActivityCard.updateItem_Data, success: ' + success );
        console.log( responseJson );


        var operationSuccess = false;

        // 1. Check success
        if ( success && responseJson && responseJson.result && responseJson.result.client )
        {
            operationSuccess = true;

            ActivityDataManager.removePayloadActivityById( me.activityId );
            
            ClientDataManager.mergeDownloadedClients( [ responseJson.result.client ], function( changeOccurred_atMerge ) 
            {
                ClientDataManager.saveCurrent_ClientsStore();

                // ?? How to refresh current data display in ActivityList?  Without refreshing the list?
                // Either we get reference to blockList or this 'acitivtyList' holds the tag reference!!

                // TODO: Updating/refreshing activityList via 'blockList' is done by 'callBack'?
                if ( callBack ) callBack( operationSuccess );
            });
        }
        else
        {
            // Add activityJson processing
            if ( callBack ) callBack( operationSuccess );
        }

        //me.updateItem_DataFields( success, responseJson, me.activityJson, me.cwsRenderObj );
        //if ( success ) me.updateItem_Data_CleanUp( me.activityJson );
        //me.updateItem_Data_saveToDB( me.activityJson, callBack );

        // TODO: LET's not use 'saveHistory' for now.  Let's change other part of app to not use history info.
        //me.updateItem_Data_saveHistory( me.activityJson, dtmSyncAttempt, success, returnJson, function() {
        //} );    
 
    };


    // remove this activity from list  (me.activityJson.activityId ) <-- from common client


    // =============================================
	// === Other Supporting METHODS ========================

    /*
    me.updateItem_UI_Icons = function( activityJson, cwsRenderObj )
    {
        // update card 'status' (submit/fail/queue)  <--- TODO: This should be marked as 'Synced'!!!  <-- Only on success
        FormUtil.setStatusOnTag( $( '#listItem_action_sync_' + activityJson.activityId ).find( 'div.icons-status' ), activityJson, cwsRenderObj );

        // update activityType Icon (opacity of SUBMIT status = 100%, opacity of permanent FAIL = 100%, else 40%)
        FormUtil.appendActivityTypeIcon ( $( '#listItem_icon_activityType_' + activityJson.activityId )
            , FormUtil.getActivityType ( activityJson )
            , FormUtil.getStatusOpt ( activityJson )
            , cwsRenderObj );
    };
    */

    me.updateItem_UI_Animation = function( runAnimation )
    {
        var syncButtonTag = me.getSyncButtonTag();

        if ( syncButtonTag )
        {
            if ( runAnimation )
            {
                syncButtonTag.rotate({ count:999, forceJS: true, startDeg: 0 });
            }
            else
            {
                syncButtonTag.stop();
            }
        }
    };


    // Update ActivityCard UI based on current activityItem data
    me.updateUI = function( divListItemTag, activityJson )
    {
        me.updateItem_UI_Button( divListItemTag.find( 'small.syncIcon img' ) );

        // PUT: Any other changes reflected on the ActivityCard - by submit..
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


    me.updateItem_UI_StartSync = function()
    {        
        // start spinning "busy/working" icon
        me.updateItem_UI_Animation( true ); 
    };

    me.updateItem_UI_FinishSync = function()
    {
        // stop spinning "busy" icon
        me.updateItem_UI_Animation( false );

        // update card status + activityType 
        //me.updateItem_UI_Icons( me.activityJson, me.cwsRenderObj );

        // TODO:  Update ActivityCard UI based on the updated info.
        //  - Need to get more UI changes from syncManager.endSync()?
        //me.updateUI( me.divListItemTag, me.activityJson );
    };
    // --------------------------

    // =======================================================


    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

}

