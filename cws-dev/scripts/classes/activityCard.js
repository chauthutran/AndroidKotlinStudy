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
   
    me.getActivityCardTrTag = function()
    {
        return $( 'tr.activity[itemid="' + me.activityId + '"]' );
    };

    me.getSyncButtonTag = function()
    {
        return me.getActivityCardTrTag().find( '.list_three_item_cta2' );
    };
    
    // ----------------------------------------------------

    me.render = function()
    {        
        var activityCardTrTag = me.getActivityCardTrTag();

        //console.log( 'render' );
        //console.log( 'activityCardTrTag' );

        // If tag is visible (has been created), perform render
        if ( activityCardTrTag )
        {
            var activityJson = ActivityDataManager.getActivityItem( "activityId", me.activityId );

            try
            {
                var divListItemContentTag = activityCardTrTag.find( 'div.list_three_item_content' );


                // NOT APPLICABLE...
                var activityCardAnchorTag = activityCardTrTag.find( 'a.expandable' );
                var contentDivTag = activityCardTrTag.find( 'div.listItem' );
                // --- See More Related Tags
                var divSeeMoreTag = activityCardTrTag.find( 'div.act-l' );
                var divSeeMoreBtnTag = divSeeMoreTag.find( 'div.act-l-more' );
                //var divSeeMoreContentTag = divSeeMoreTag.find( 'div.act-l-expander' );
                var divSeeMoreIconBtnTag = divSeeMoreTag.find( 'div.act-l-expander' );
                var divSeeMoreContentTag = activityCardTrTag.find( 'div.act-preview' );
    
                    

                var activityTrans = me.getCombinedTrans( activityJson );
                // activity
                //      - tran1
                //      - tran2


                // 1. activityType (Icon) display (LEFT SIDE)
                me.activityTypeDisplay( activityCardTrTag, activityJson );
                
                // 2. previewText/main body display (MIDDLE)
                me.setActivityContentDisplay( activityJson, activityTrans, divListItemContentTag, SessionManager.sessionData.dcdConfig );


                // 3. 'SyncUp' Button Related
                // click event - for activitySubmit.., icon/text populate..
                me.setupSyncBtn( activityCardTrTag, activityJson );

                

                // 4. 'SeeMore' Related - divSeeMoreBtnTag click to display more/less --> By toggling class
                contentDivTag.off( 'click' );
                contentDivTag.on( 'click', function( e ) 
                {
                    e.stopPropagation();         

                    // remove all other 'expanded' tags (and run click > hideMoreDetails if preview is showing)
                    var blockListUlTag = activityCardTrTag.closest( 'ul.tab__content_act' );
                    blockListUlTag.find('a.expanded').each( function(){

                        if ( $( this ) !== activityCardAnchorTag ) 
                        {
                            if ( $( this ).find( 'div.act-preview' ).hasClass( 'act-l-more-open' ) )
                            {
                                $( this ).find( 'div.act-l-expander' ).click();
                            }
                            $( this ).toggleClass( 'expanded' );
                        }

                    });

                    // run click event to flip arrowIcon (if already showing)
                    if ( activityCardAnchorTag.hasClass( 'expanded' ) && divSeeMoreContentTag.hasClass( 'act-l-more-open' ) )
                    {
                        divSeeMoreBtnTag.click();
                    }
    
                    activityCardAnchorTag.toggleClass( 'expanded' ); 
                });

                
                divSeeMoreBtnTag.off( 'click' );
                divSeeMoreBtnTag.on( 'click', function( e ) 
                {
                    e.stopPropagation();
                    divSeeMoreContentTag.toggleClass( 'act-l-more-open' );
                    divSeeMoreIconBtnTag.find( '.expandable-arrow' ).toggleClass( 'flipVertical' ); // flip downArrow
    
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
                divSeeMoreIconBtnTag.click( function(){
                    divSeeMoreBtnTag.click();
                });           

            }
            catch( errMsg )
            {
                console.log( 'Error on ActivityCard.render, errMsg: ' + errMsg );
            }
        }
    };


    me.setupSyncBtn = function( activityCardTrTag, activityJson )
    {
        var divSyncIconTag = activityCardTrTag.find( '.list_three_item_cta2' );
        var divSyncStatusTag = activityCardTrTag.find( '.list_three_item_status' );
        
        // reset..
        divSyncIconTag.off( 'click' );
        divSyncIconTag.css( 'background-image', '' );
        divSyncStatusTag.html( '' );


        var statusVal = ( !activityJson.processing ) ? Constants.status_submit : activityJson.processing.status;


        if ( statusVal === Constants.status_submit )        
        {
            // already sync..
            divSyncStatusTag.css( 'color', '#2aad5c' ).html( 'Sync' );
            divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
        }
        else if ( statusVal === Constants.status_queued )
        {
            divSyncStatusTag.css( 'color', '#B1B1B1' ).html( 'Pending' );
            divSyncIconTag.css( 'background-image', 'url(images/sync-pending_36.svg)' );
        }
        else if ( statusVal === Constants.status_failed )
        {
            divSyncStatusTag.css( 'color', '#FF0000' ).html( 'Sync error' );
            divSyncIconTag.css( 'background-image', 'url(images/sync-error_36.svg)' );
        }

    
        divSyncIconTag.on( 'click', function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..

            me.syncInfoShow( statusVal, activityJson );

            if ( statusVal === Constants.status_queued ) me.activitySubmitSyncClick(); 
        });        
    };

    
    me.syncInfoShow = function( statusVal, activityJson )
    {
        Templates.setMsgAreaBottom( function( syncInfoAreaTag ) {
        
            var divBottomWrapperTag = syncInfoAreaTag.find( 'div.bottom__wrapper' );


            // activityJson.processing  <-- activityJson.appData?
            // activityJson.processing.history..  <-- save error / downloaded / synced info..
            // activityJson.processing.status       <-- quick info of current (last)


            if ( activityJson.activityId === "LA_TEST_PROV_20200407_081636003" )
            {

                // results..
                //  <-- We need to collect the response...


                var testMsg = `
                <div class="sync_all__section">

                    <div class="sync_all__section_title">Services Deliveries 4/6</div>
                    <div class="sync_all__section_log">
                        20-02-01 17:07 Starting sync_all.
                        <br>20-02-01 17:07 Synchronizing...
                        <br>20-02-01 17:07 sync_all completed.
                    </div>
                </div>

                <div class="sync_all__section">

                    <div class="sync_all__section_title">Client details</div>
                    <div class="sync_all__section_log">
                        <span class="color_status_sync">Sync - read message 2</span>
                        <br><span class="color_status_pending_msg">Sync postponed 2</span>
                        <br><span class="color_status_error">Sync error 1</span>
                    </div>
                </div>
                
                <div class="sync_all__section_msg">Show next sync: in 32m</div>
                `;
        
                divBottomWrapperTag.append( testMsg );    
            }
    
        });

    };


    me.setActivityContentDisplay = function( activity, activityTrans, divListItemContentTag, configJson )
    {
        //var displaySettings = ConfigManager.getActivityDisplaySettings();
        var divLabelTag = divListItemContentTag.find( 'div.list_three_line-date' );

        var activityItem = activity;  // Temporarily backward compatible..
        var activitySettings = FormUtil.getActivityType( activity ); 
        if ( activitySettings && activitySettings.displaySettings )
        {
            var displaySettings = activitySettings.displaySettings;
        }
        else
        {
            var displaySettings = ConfigManager.getActivityDisplaySettings();
        }

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
            var divItemInfoTag = divListItemContentTag.find( 'div.list_three_line-text' ).html( '' );
            
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
    
                divItemInfoTag.append( '<div class="activityContentDisplay">' + displayEvalResult + '</div>' );    
            }

        }

        if ( activitySettings && activitySettings.previewData )
        {
            var previewDivTag = me.getListPreviewData( activityTrans, activitySettings.previewData );
            divListItemContentTag.append( previewDivTag );    
        }                

        divListItemContentTag.html( divListItemContentTag.html().replace( /undefined/g, '' ) )
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
              
    
    // -------------------------------
    // --- Display Icon/Content related..
    
    me.syncUpStatusDisplay = function( activityCardTrTag, activityJson )
    {
        try
        {
            // 1. Does it find hte matching status?
            var activitySyncUpStatusConfig = ConfigManager.getActivitySyncUpStatusConfig( activityJson );
            if ( activitySyncUpStatusConfig ) activityCardTrTag.find( '.listItem_statusOption' ).html( activitySyncUpStatusConfig.label );

            me.setActivitySyncUpStatus( activityCardTrTag, activityJson.processing );
        }
        catch( errMsg )
        {
            console.log( 'Error on ActivityCard.syncUpStatusDisplay, errMsg: ' + errMsg );
        }        
    };


    me.activityTypeDisplay = function( activityCardTrTag, activityJson )
    {
        try
        {
            var activityTypeConfig = ConfigManager.getActivityTypeConfig( activityJson );
    
            var activityTypeTdTag = activityCardTrTag.find( '.listItem_icon_activityType' ); // Left side activityType part - for icon

            // SyncUp icon also gets displayed right below ActivityType (as part of activity type icon..)
            var activitySyncUpStatusConfig = ConfigManager.getActivitySyncUpStatusConfig( activityJson );

            // TODO: Bring this method up from 'formUtil' to 'activityCard'?
            // update activityType Icon (opacity of SUBMIT status = 100%, opacity of permanent FAIL = 100%, else 40%)
            FormUtil.appendActivityTypeIcon ( activityTypeTdTag
                , activityTypeConfig
                , activitySyncUpStatusConfig );
                
        }
        catch( errMsg )
        {
            console.log( 'Error on ActivityCard.activityTypeDisplay, errMsg: ' + errMsg );
        }        
    };                

    me.getListPreviewData = function( dataJson, previewConfig )
    { 
        if ( previewConfig )
        {
            var dataRet = $( '<div class="previewData listDataPreview" ></div>' );
        
            for ( var i=0; i< previewConfig.length; i++ ) 
            {
                var dat = me.mergePreviewData( previewConfig[ i ], dataJson );
                dataRet.append ( $( '<div class="listDataItem" >' + dat + '</div>' ) );
            }
        }
        return dataRet;
    };

    
    me.mergePreviewData = function ( previewField, Json )
    {
        var ret = '';
        var flds = previewField.split( ' ' );
        if ( flds.length )
        {
            for ( var f=0; f < flds.length; f++ )
            {
                for ( var key in Json ) 
                {
                    if ( flds[f] == key && Json[ key ] )
                    {
                        ret += flds[ f ] + ' ';
                        ret = ret.replace( flds[f] , Json[ key ] );
                    }
                }
            }
        }
        else
        {
            if ( previewField.length )
            {
                ret = previewField;
                for ( var key in Json ) 
                {
                    if ( previewField == key && Json[ key ] )
                    {
                        ret = ret.replace( previewField , Json[ key ] );
                    }
                }
            }
        }
        return ret;
    };


    me.setActivitySyncUpStatus = function( activityCardTrTag, activityProcessing ) 
    {
        try
        {
            var imgSyncIconTag = activityCardTrTag.find( 'small.syncIcon img' );

            if ( activityProcessing.status === Constants.status_queued )
            {
                imgSyncIconTag.attr ( 'src', 'images/sync-banner.svg' );
            }
            else if ( activityProcessing.status === Constants.status_failed )
            {        
                imgSyncIconTag.attr ( 'src', 'images/sync_error.svg' );
                //imgSyncIconTag.attr ( 'src', 'images/sync-n.svg' );
            }

            imgSyncIconTag.css ( 'transform', '' );
        }
        catch ( errMsg )
        {
            console.log( 'Error on ActivityCard.setActivitySyncUpStatus, errMsg: ' + errMsg );
        }
    };


    // -------------------------------


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
            var activityCardTrTag = me.getActivityCardTrTag();

            try
            {
                // run UI animations
                if ( activityCardTrTag ) me.updateItem_UI_StartSync();
    
                var activityJson = ActivityDataManager.getActivityItem( "activityId", me.activityId );            
                var processing = Util.getJsonDeepCopy( activityJson.processing );
                delete activityJson.processing;
    
                var payload = {
                    'searchValues': processing.searchValues,
                    'captureValues': activityJson
                };
    
                //console.log( 'ActivityCard syncUp payload: ' );
                //console.log( payload );
                
                var loadingTag = undefined;
                //FormUtil.submitRedeem = function( apiPath, payloadJson, activityJson, loadingTag, returnFunc, asyncCall, syncCall )
                WsCallManager.requestPost( processing.url, payload, loadingTag, function( success, responseJson )
                {
                    if ( activityCardTrTag ) me.updateItem_UI_FinishSync();
                    
                    me.syncUpResponseHandle( success, responseJson, callBack );
                });            
    
            }
            catch( errMsg )
            {
                if ( activityCardTrTag ) me.updateItem_UI_FinishSync();
    
                console.log( 'Error in ActivityCard.syncUp - ' + errMsg );
                callBack( false );
            }
        }
    };


    // =============================================

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

