// -------------------------------------------
// -- ActivityCard Class/Methods
//      - Mainly used for syncManager run one activity item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where activity items are processed (in sync)
//              without being displayed on the app list.  
//
function ActivityCard( activityId, cwsRenderObj, options )
{
	var me = this;

    me.activityId = activityId;
    me.cwsRenderObj = cwsRenderObj;
    me.options = ( options ) ? options : {};
    //me.parentTag_Override = parentTag_Override;

    // -----------------------------------
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
        if ( me.options.parentTag_Override )
        {
            return me.options.parentTag_Override.find( '.activity[itemid="' + me.activityId + '"]' );
        }
        else
        {
            return $( 'tr.activity[itemid="' + me.activityId + '"]' );
        }
    };


    me.getSyncButtonTag = function( activityId )
    {
        var activityCardTags = ( activityId ) ? $( '.activity[itemid="' + activityId + '"]' ) : me.getActivityCardTrTag();

        return activityCardTags.find( '.activityStatusIcon' );
    };


    // ----------------------------------------------------

    me.render = function()
    {        
        var activityCardTrTag = me.getActivityCardTrTag();

        // If tag has been created), perform render
        if ( activityCardTrTag )
        {
            var activityJson = ActivityDataManager.getActivityItem( "activityId", me.activityId );
            var clickEnable = ( me.options.disableClicks ) ? false: true;

            try
            {
                var activityTrans = ActivityDataManager.getCombinedTrans( activityJson );

                var activityContainerTag = activityCardTrTag.find( 'div.activityContainer' );
                var activityTypeTdTag = activityCardTrTag.find( 'div.activityIcon' );
                var activityContentTag = activityCardTrTag.find( 'div.activityContent' );
                var activityRerenderTag = activityCardTrTag.find( 'div.activityRerender' );
                var activityPhoneCallTag = activityCardTrTag.find( 'div.activityPhone' );


                // 1. activityType (Icon) display (LEFT SIDE)
                me.activityTypeDisplay( activityTypeTdTag, activityJson );
                if ( clickEnable ) me.activityIconClick_displayInfo( activityTypeTdTag, activityJson );


                // 2. previewText/main body display (MIDDLE)
                me.setActivityContentDisplay( activityContentTag
                    , activityJson, activityTrans, ConfigManager.getConfigJson() );
                if ( clickEnable ) me.activityContentClick_FullView( activityContentTag, activityContainerTag, activityJson.activityId );


                // 3. 'SyncUp' Button Related
                // click event - for activitySubmit.., icon/text populate..
                me.setupSyncBtn( clickEnable, activityCardTrTag, activityJson );    

                // 4. 'phoneNumber' action  button setup
                me.setupPhoneCallBtn( activityPhoneCallTag, activityJson );

                // 5. clickable rerender setup
                me.setUpReRenderByClick( activityRerenderTag );
            }
            catch( errMsg )
            {
                console.log( 'Error on ActivityCard.render, errMsg: ' + errMsg );
            }
        }
    };


    me.activityIconClick_displayInfo = function( activityIconTag, activityJson )
    {
        activityIconTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..
            console.log( activityJson );
        });    
    };

    me.activityContentClick_FullView = function( activityContentTag, activityContainerTag, activityId )
    {
        activityContentTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();
            me.showFullPreview( activityId, activityContainerTag );
        });
    };
                
    me.setupSyncBtn = function( clickEnable, activityCardTrTag, activityJson )
    {
        var divSyncIconTag = activityCardTrTag.find( '.activityStatusIcon' );
        var divSyncStatusTextTag = activityCardTrTag.find( '.activityStatusText' );
        
        var statusVal = ( activityJson.processing ) ? activityJson.processing.status: '';


        me.displayActivitySyncStatus( statusVal, divSyncStatusTextTag, divSyncIconTag, activityJson );

    
        /// If in processing, we should be able to cancel it!!!!  <-- if clicked again?
        if ( clickEnable )
        {
            divSyncIconTag.off( 'click' ).on( 'click', function( e ) 
            {
                e.stopPropagation();  // Stops calling parent tags event calls..
                        
                if ( statusVal === Constants.status_queued
                    || statusVal === Constants.status_failed
                    || statusVal === Constants.status_hold )
                {
                    me.activitySubmitSyncClick();
                }  
                else 
                {
                    // if ( statusVal === Constants.status_processing )

                    // Display the popup
                    me.syncResultMsgShow( statusVal, activityJson, activityCardTrTag );
    
                    // TODO: THIS DOES NOT WORK 100% <-- NEED TO REVISIT!!!
                    if ( statusVal === Constants.submit_wMsg )        
                    {
                        activityJson.processing.statusRead = true;
                        // Need to save storage afterwards..
                        ClientDataManager.saveCurrent_ClientsStore();                
                    }    
                }           

                // List the open (action) status
                //if ( statusVal === Constants.status_processing ) //{
                    // TODO: Allow reset to pending?
                    // TODO: SYNC BLOCK DISABLE?

                    // Case 1. Continue to be in 'Sync' case reset
                    //      - simple processing status unset.. But the process will continue..
                    //activityJson.processing.status = Constants.status_queued;
                    //me.displayActivitySyncStatus_Wrapper( activityJson, activityCardTrTag );

                    // Case 2. Cancel the Sync Process..
                
                
            });     
        }
    };

    me.setupPhoneCallBtn = function( divPhoneCallTag, activityJson )
    {
        var activityTrans = ActivityDataManager.getCombinedTrans( activityJson );
        //var activityType = FormUtil.getActivityType( activityJson );

        divPhoneCallTag.empty();

        //if ( activityType && activityType.calls && activityType.calls )
        if ( activityTrans.phoneNumber )
        {
            var phoneNumber = activityTrans.phoneNumber; // should we define phoneNumber field in config? might change to something else in the future
            //var evalConditions = activityType.calls.evalConditions;
            //var paylDetails = Util.jsonToArray ( activityTrans, 'name:value' );

            //for( var i = 0; ( i < evalConditions.length ) ; i++ )
            //{
                //var phoneCondition = evalConditions[ i ].condition;

                //me.checkCondition( phoneCondition, paylDetails, function( passConditionTest ){

                    //if ( passConditionTest )
                    //{
                        var cellphoneTag = $('<img src="images/cellphone.svg" class="phoneCallAction" />');

                        cellphoneTag.click( function(e) {

                            e.stopPropagation();

                            if ( Util.isMobi() )
                            {
                                window.location.href = `tel:${phoneNumber}`;
                            }
                            else
                            {
                                alert( phoneNumber );
                            }
                        });

                        divPhoneCallTag.append( cellphoneTag );
                        divPhoneCallTag.show();

                    //}
    
                //})

            
            //}

        }
        /*else
        {
            divPhoneCallTag.hide();
        }*/

    };


    me.displayActivitySyncStatus = function( statusVal, divSyncStatusTextTag, divSyncIconTag, activityJson )
    {
        // reset..
        divSyncIconTag.empty();
        divSyncStatusTextTag.empty();

        var imgIcon = $( '<img>' );

        if ( statusVal === Constants.status_submit )        
        {
            // already sync..
            divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync' );
            imgIcon.attr( 'src', 'images/sync.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
        }
        else if ( statusVal === Constants.status_submit_wMsg )        
        {
            // already sync..
            divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync/Msg' );
    
            if ( activityJson.processing.statusRead ) imgIcon.attr( 'src', 'images/sync_msdr.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync_msdr.svg)' );
            else imgIcon.attr( 'src', 'images/sync_msd.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync_msd.svg)' );
        }
        else if ( statusVal === Constants.status_downloaded )        
        {
            // already sync..
            divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Downloaded' );
            imgIcon.attr( 'src', 'images/sync.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
        }
        else if ( statusVal === Constants.status_queued )
        {
            divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Pending' );
            imgIcon.attr( 'src', 'images/sync-pending_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-pending_36.svg)' );
        }
        else if ( statusVal === Constants.status_processing )
        {
            divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Processing' );
            imgIcon.attr( 'src', 'images/sync-pending_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-pending_36.svg)' );    
            FormUtil.rotateTag( divSyncIconTag, true );
        }        
        else if ( statusVal === Constants.status_failed )
        {
            // Not closed status, yet
            divSyncStatusTextTag.css( 'color', '#FF0000' ).html( 'Failed' );
            imgIcon.attr( 'src', 'images/sync-postponed_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-postponed_36.svg)' );
        }
        else if ( statusVal === Constants.status_error )
        {
            divSyncStatusTextTag.css( 'color', '#FF0000' ).html( 'Error' );
            imgIcon.attr( 'src', 'images/sync-error_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-error_36.svg)' );
        }
        divSyncIconTag.append( imgIcon );
    };
    

    // Wrapper to call displayActivitySyncStatus with fewer parameters
    me.displayActivitySyncStatus_Wrapper = function( activityJson, activityCardTrTag )
    {
        //var activityCardTrTag = me.getActivityCardTrTag();
        if ( activityCardTrTag && activityCardTrTag.length > 0 )
        {
            var divSyncIconTag = activityCardTrTag.find( '.activityStatusIcon' );
            var divSyncStatusTextTag = activityCardTrTag.find( '.activityStatusText' );
            
            var statusVal = ( activityJson.processing ) ? activityJson.processing.status: '';
    
            me.displayActivitySyncStatus( statusVal, divSyncStatusTextTag, divSyncIconTag, activityJson );    
        }    
    };


    // ------------------------------------------


    me.setUpReRenderByClick = function( activityRerenderTag )
    {
        activityRerenderTag.off( 'click' ).click( function( e ) {
            e.stopPropagation();  // Stops calling parent tags event calls..
            me.render();
        } );    
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

                    // reRender all the places for this activity (popup, full detail, activityList)
                    me.reRenderByActivityId( me.activityId );
                    //me.render();
                });    
            }
            catch( errMsg )
            {
                console.log( 'ERROR on running on activityCard.SyncUpItem, errMsg - ' + errMsg );
                SyncManagerNew.syncFinish();     
            }
        }
    };
              

    me.reRenderByActivityId = function( activityId )
    {
        console.log( 'reRenderByActivityId' );
        // There are multiple places presenting same activityId info.
        // We can find them all and reRender their info..
        var activityCardTags = $( '.activity[itemid="' + activityId + '"]' );
        var reRenderClickDivTags = activityCardTags.find( 'div.activityRerender' );   
        
        reRenderClickDivTags.click();
    }
    
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
    me.performSyncUp = function( afterDoneCall )
    {
        var activityJson_Orig;
        var syncIconTag = me.getSyncButtonTag( me.activityId );

        try
        {
            activityJson_Orig = ActivityDataManager.getActivityItem( "activityId", me.activityId );
            // Do not delete 'processing' until success..


            // Set the status as processing..
            activityJson_Orig.processing.status = Constants.status_processing;
            me.displayActivitySyncStatus_Wrapper( activityJson_Orig, me.getActivityCardTrTag() );
            // Run UI Animation..
            FormUtil.rotateTag( syncIconTag, true );


            
            var payload = ActivityDataManager.activityPayload_ConvertForWsSubmit( activityJson_Orig );

            try
            {
                var loadingTag = undefined;
                //FormUtil.submitRedeem = function( apiPath, payloadJson, activityJson, loadingTag, returnFunc, asyncCall, syncCall )

                WsCallManager.wsActionCall( activityJson_Orig.processing.url, payload, loadingTag, function( success, responseJson )
                {
                    // Stop the Sync Icon rotation
                    //FormUtil.rotateTag( syncIconTag, false );
                    FormUtil.rotateTag( me.getSyncButtonTag( me.activityId ), false );

                    // Replace the downloaded activity with existing one - thus 'processing.status' gets emptyed out/undefined
                    me.syncUpResponseHandle( activityJson_Orig, success, responseJson, function( success ) {

                        if ( success ) 
                        {
                            // Why need to call this again?
                            FormUtil.rotateTag( me.getSyncButtonTag( me.activityId ), false );

                            afterDoneCall( true );
                        }
                        else 
                        {
                            // Why need to call this again?
                            FormUtil.rotateTag( me.getSyncButtonTag( me.activityId ), false );

                            // 'syncedUp' processing data                
                            var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_failed, 401, 'Failed to syncUp, msg - ' + JSON.stringify( responseJson ) );
                            ActivityDataManager.insertToProcessing( activityJson_Orig, processingInfo );
                            afterDoneCall( false );
                        }
                    } );
                });         
            }
            catch ( errMsg )
            {
                var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_failed, 401, 'Failed to syncUp, msg - ' + errMsg );
                ActivityDataManager.insertToProcessing( activityJson_Orig, processingInfo );                

                throw ' in WsCallManager.requestPost - ' + errMsg;  // Go to next 'catch'
            }    
        }
        catch( errMsg )
        {
            console.log( 'Error in ActivityCard.syncUp - ' + errMsg );

            // Stop the Sync Icon rotation
            //FormUtil.rotateTag( syncIconTag, false );
            FormUtil.rotateTag( me.getSyncButtonTag( me.activityId ), false );

            afterDoneCall( false );
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
            // Add activityJson processing
            if ( callBack ) callBack( operationSuccess );
        } 
    };


    // remove this activity from list  (me.activityJson.activityId ) <-- from common client
    

    // =============================================
	// === Full Detail Popup Related METHODS ========================

    me.showFullPreview = function( activityId, activityContainerTag )
    {
        if ( activityId ) 
        {
            // initialize
            var sheetFull = $( '#fullScreenPreview' );

            // populate template
            sheetFull.html( $( Templates.activityCardFullScreen ) );

            // create tab click events
            FormUtil.setUpNewUITab( sheetFull.find( '.tab_fs' ) ); 
        
            // ADD TEST/DUMMY VALUE
            sheetFull.find( '.activity' ).attr( 'itemid', activityId )
            

            // Header content set
            var actCard = new ActivityCard( activityId, me.cwsRenderObj
                , { 'parentTag_Override': sheetFull, 'disableClicks': true } );
            actCard.render();

            // set tabs contents
            me.setFullPreviewTabContent( activityId );
        
            // set other events
            var cardCloseTag = sheetFull.find( 'img.btnBack' );
        
            cardCloseTag.off( 'click' ).click( function(){ 
                sheetFull.empty();
                sheetFull.fadeOut();
                $( '#pageDiv' ).show();
            });
        
        
            // render
            sheetFull.fadeIn();
        
            $( '#pageDiv' ).hide();
        }
    };
    
    me.setFullPreviewTabContent = function( activityId )
    {
        var clientObj = ClientDataManager.getClientByActivityId( activityId );
        var activityJson = ActivityDataManager.getActivityById( activityId );
    
        var arrDetails = [];
    
        for ( var key in clientObj.clientDetails ) 
        {
            arrDetails.push( { 'name': key, 'value': clientObj.clientDetails[ key ] } );
        }
    
        $( '#tab_previewDetails' ).html( Util2.arrayPreviewRecord( 'clientDetails:', arrDetails) ); //activityListPreviewTable
    
    
        //tab_previewPayload
        var jv_payload = new JSONViewer();
        $( '#tab_previewPayload' ).append( jv_payload.getContainer() );
        jv_payload.showJSON( activityJson );
    
    
        $("#tab_previewSync").html( JsonBuiltTable.buildTable( activityJson.processing.history ) );
    };
    
    
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

    // --------------------------

    // =======================================================


    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

}

