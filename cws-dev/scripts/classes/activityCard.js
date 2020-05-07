// -------------------------------------------
// -- ActivityCard Class/Methods
//      - Mainly used for syncManager run one activity item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where activity items are processed (in sync)
//              without being displayed on the app list.  
//
function ActivityCard( activityId, cwsRenderObj, parentTag )
{
	var me = this;

    me.activityId = activityId;
    me.cwsRenderObj = cwsRenderObj;
    me.parentTag = parentTag;

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
    
    me.template_ActivityContentDateTag = `<div class="activityContentDisplay list_three_line-date"></div>`;
    me.template_ActivityContentTextTag = `<div class="activityContentDisplay list_three_line-text"></div>`;

	// =============================================
	// === Initialize Related ========================

    me.initialize = function() { };

    // ----------------------------------------------------

    me.getActivityCardTrTag = function()
    {
        if ( me.parentTag )
        {
            return $( me.parentTag ).find( '.activity[itemid="' + me.activityId + '"]' );
        }
        else
        {
            return $( 'tr.activity[itemid="' + me.activityId + '"]' );
        }
    };

    me.getSyncButtonTag = function()
    {
        return me.getActivityCardTrTag().find( '.activityStatusIcon' );
    };

    // ----------------------------------------------------

    me.render = function()
    {        
        var activityCardTrTag = me.getActivityCardTrTag();

        // If tag is visible (has been created), perform render
        if ( activityCardTrTag )
        {
            var activityJson = ActivityDataManager.getActivityItem( "activityId", me.activityId );

            try
            {
                var activityTrans = ActivityDataManager.getCombinedTrans( activityJson );

                var activityTypeTdTag = activityCardTrTag.find( 'div.activityIcon' );
                var activityContentTag = activityCardTrTag.find( 'div.activityContent' );


                // 1. activityType (Icon) display (LEFT SIDE)
                me.activityTypeDisplay( activityTypeTdTag, activityJson );                
                me.activityIconClick_displayInfo( activityTypeTdTag, activityJson );


                // 2. previewText/main body display (MIDDLE)
                me.setActivityContentDisplay( activityContentTag
                    , activityJson, activityTrans, ConfigManager.getConfigJson() );
                me.activityContentClick_FullView( activityContentTag, activityJson.activityId );


                // 3. 'SyncUp' Button Related
                // click event - for activitySubmit.., icon/text populate..
                me.setupSyncBtn( activityCardTrTag, activityJson );    

            }
            catch( errMsg )
            {
                console.log( 'Error on ActivityCard.render, errMsg: ' + errMsg );
            }
        }
    };

    
    me.activityIconClick_displayInfo = function( activityIconTag, activityJson )
    {
        activityIconTag.off( 'click' ).click( function( e ) {
            e.stopPropagation();  // Stops calling parent tags event calls..
            console.log( activityJson );
        });
    };

    me.activityContentClick_FullView = function( activityContentTag, activityId )
    {
        activityContentTag.off( 'click' ).click( function( e ) {
            e.stopPropagation();
            DevHelper.showFullPreview( activityId );
        });
    };
                
    me.setupSyncBtn = function( activityCardTrTag, activityJson )
    {
        var divSyncIconTag = activityCardTrTag.find( '.activityStatusIcon' );
        var divSyncStatusTextTag = activityCardTrTag.find( '.activityStatusText' );
        
        // reset..
        divSyncIconTag.off( 'click' );
        divSyncIconTag.css( 'background-image', '' );
        divSyncStatusTextTag.html( '' );


        var statusVal = ( activityJson.processing ) ? activityJson.processing.status: '';


        if ( statusVal === Constants.status_submit )        
        {
            // already sync..
            divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync' );
            divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
        }
        else if ( statusVal === Constants.status_submit_wMsg )        
        {
            // already sync..
            divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync/Msg' );

            if ( activityJson.processing.statusRead ) divSyncIconTag.css( 'background-image', 'url(images/sync_msdr.svg)' );
            else divSyncIconTag.css( 'background-image', 'url(images/sync_msd.svg)' );
        }
        else if ( statusVal === Constants.status_downloaded )        
        {
            // already sync..
            divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Downloaded' );
            divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
        }
        else if ( statusVal === Constants.status_queued )
        {
            divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Pending' );
            divSyncIconTag.css( 'background-image', 'url(images/sync-pending_36.svg)' );
        }
        else if ( statusVal === Constants.status_failed )
        {
            divSyncStatusTextTag.css( 'color', '#FF0000' ).html( 'Sync error' );
            divSyncIconTag.css( 'background-image', 'url(images/sync-error_36.svg)' );
        }

    
        divSyncIconTag.on( 'click', function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..

            // Need ref to existing tag... or find?
            me.syncResultMsgShow( statusVal, activityJson, activityCardTrTag );

            if ( statusVal === Constants.status_queued ) me.activitySubmitSyncClick(); 
            else if ( statusVal === Constants.submit_wMsg )        
            {
                activityJson.processing.statusRead = true;
                // Need to save storage afterwards..
                ClientDataManager.saveCurrent_ClientsStore();                
            }
        });        
    };

    
    me.syncResultMsgShow = function( statusVal, activityJson, activityCardTrTag )
    {
        // If 'activityCardTrTag ref is not workign with fresh data, we might want to get it by activityId..

        Templates.setMsgAreaBottom( function( syncInfoAreaTag ) 
        {
            me.syncResultMsg_header( syncInfoAreaTag, activityCardTrTag );

            me.syncResultMsg_content( syncInfoAreaTag, activityCardTrTag, activityJson );
        });

        // activityJson.processing  <-- activityJson.appData?
        // activityJson.processing.history..  <-- save error / downloaded / synced info..
        // activityJson.processing.status       <-- quick info of current (last)
    };

    me.syncResultMsg_header = function( syncInfoAreaTag, activityCardTrTag )
    {        
        var divHeaderTag = syncInfoAreaTag.find( 'div.msgHeader' );

        var statusLabel = activityCardTrTag.find( 'div.activityStatusText' ).text();

        divHeaderTag.html( '<div class="msgHeaderLabel sync_all__header_title">' + statusLabel + '</div>' );
    };


    me.syncResultMsg_content = function( syncInfoAreaTag, activityCardTrTag, activityJson )
    {
        var divBottomTag = syncInfoAreaTag.find( 'div.msgContent' );

        // 1. ActivityCard Info Add - From Activity Card Tag
        divBottomTag.append( Templates.msgActivityCard );

        var activityContainerTag = divBottomTag.find( 'div.activityContainer' );

        activityContainerTag.append( activityCardTrTag.find( 'div.activityIcon' ).clone() );
        activityContainerTag.append( activityCardTrTag.find( 'div.activityContent' ).clone() );
        

        // 2. Add 'processing' sync message.. - last one?
        
        Util.tryCatchContinue( function() 
        {
            var historyList = activityJson.processing.history;

            if ( historyList.length > 0 )
            {
                var historyList_Sorted = Util.sortByKey_Reverse( activityJson.processing.history, "dateTime" );
                var latestItem = historyList_Sorted[0];    
        
                var msgSectionTag = $( Templates.msgSection );
    
                msgSectionTag.find( 'div.msgSectionTitle' ).text( 'Response code: ' + Util.getStr( latestItem.responseCode ) );
        
                msgSectionTag.find( 'div.msgSectionLog' ).text( Util.getStr( latestItem.msg ) );        
    
                divBottomTag.append( msgSectionTag );
            }        
        }, "syncResultMsg_content, activity processing history lookup" );

    };


    me.setActivityContentDisplay = function( divActivityContentTag, activity, activityTrans, configJson )
    {

        var activitySettings = FormUtil.getActivityType( activity );      
        var displaySettings = ( activitySettings && activitySettings.displaySettings ) ? activitySettings.displaySettings : ConfigManager.getActivityDisplaySettings();
        
        divActivityContentTag.find( 'div.activityContentDisplay' ).remove();


        // Display 1st line - as date
        if ( activity.processing )
        {
            var dateStr = $.format.date( activity.processing.created, "MMM dd, yyyy - HH:mm" );
    
            divActivityContentTag.append( $( me.template_ActivityContentDateTag ).html( dateStr ) );
        }


        if ( displaySettings )
        {            
            var INFO = { 'activityTrans': activityTrans, 'activity': activity, 'activityItem': activity };

            // If custom config display, remove 
            for( var i = 0; i < displaySettings.length; i++ )
            {
                // Need 'activity', 'activityTrans'
                var dispSettingEvalStr = displaySettings[ i ];
                var displayEvalResult = "------------";
                
                displayEvalResult = Util.evalTryCatch( dispSettingEvalStr, INFO, 'ActivityCard.setActivityContentDisplay' );
    
                divActivityContentTag.append( $( me.template_ActivityContentTextTag ).html( displayEvalResult ) );
            }

        }
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


    me.activityTypeDisplay = function( activityTypeTdTag, activityJson )
    {
        try
        {
            var activityTypeConfig = ConfigManager.getActivityTypeConfig( activityJson );
    
            // SyncUp icon also gets displayed right below ActivityType (as part of activity type icon..)
            var activitySyncUpStatusConfig = ConfigManager.getActivitySyncUpStatusConfig( activityJson );

            // TODO: Bring this method up from 'formUtil' to 'activityCard'?
            // update activityType Icon (opacity of SUBMIT status = 100%, opacity of permanent FAIL = 100%, else 40%)

            FormUtil.appendActivityTypeIcon( activityTypeTdTag
                , activityTypeConfig
                , activitySyncUpStatusConfig
                , undefined
                , undefined
                , activityJson );
                
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
    
                var activityJson_Orig = ActivityDataManager.getActivityItem( "activityId", me.activityId );
                // Do not delete 'processing' until success..

                var activityJson_Copy = Util.getJsonDeepCopy( activityJson_Orig );
                delete activityJson_Copy.processing;
    
                var payload = {
                    'searchValues': activityJson_Orig.processing.searchValues,
                    'captureValues': activityJson_Copy
                };


                // TODO: add 'processing' history on trial?!!!


                try
                {
                    var loadingTag = undefined;
                    //FormUtil.submitRedeem = function( apiPath, payloadJson, activityJson, loadingTag, returnFunc, asyncCall, syncCall )
                    WsCallManager.requestPost( processing.url, payload, loadingTag, function( success, responseJson )
                    {
                        if ( activityCardTrTag ) me.updateItem_UI_FinishSync();
                        
                        // Replace the downloaded activity with existing one.
                        me.syncUpResponseHandle( activityJson_Orig, success, responseJson, callBack );
                    });         
                }
                catch ( errMsg )
                {
                    var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_failed, 401, 'Failed to syncUp, msg - ' + errMsg );
                    ActivityDataManager.insertToProcessing( activityJson_Orig, processingInfo );                

                    throw ' in WsCallManager.requestPost - ' + errMsg;
                }    
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

    me.syncUpResponseHandle = function( activityJson_Orig, success, responseJson, callBack )
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

            // remove client as well if started with 'client_'
            ActivityDataManager.removeActivityNClientById( me.activityId );
            

            // 'syncedUp' processing data                
            var processingInfo = ActivityDataManager.createProcessingInfo_Success( Constants.status_submit, 'SyncedUp processed.' );


            ClientDataManager.mergeDownloadedClients( [ responseJson.result.client ], processingInfo, function( changeOccurred_atMerge ) 
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
            // 'syncedUp' processing data                
            var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_failed, 401, 'Failed to syncUp, msg - ' + JSON.stringify( responseJson ) );

            ActivityDataManager.insertToProcessing( activityJson_Orig, processingInfo );

            // Add activityJson processing
            if ( callBack ) callBack( operationSuccess );
        } 
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

