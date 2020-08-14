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
    
    //me.template_ActivityContentDateTag = `<div class="activityContentDisplay card-date" style="cursor: pointer;"></div>`;
    me.template_ActivityContentTextTag = `<div class="activityContentDisplay card__row"></div>`;

	// =============================================
	// === Initialize Related ========================

    me.initialize = function() { };

    // ----------------------------------------------------

    me.getActivityCardDivTag = function()
    {
        if ( me.options.parentTag_Override )
        {
            return me.options.parentTag_Override.find( '.activity[itemid="' + me.activityId + '"]' );
        }
        else
        {
            return $( '.activity[itemid="' + me.activityId + '"]' );
        }
    };


    me.getSyncButtonTag = function( activityId )
    {
        var activityCardTags = ( activityId ) ? $( '.activity[itemid="' + activityId + '"]' ) : me.getActivityCardDivTag();

        return activityCardTags.find( '.activityStatusIcon' );
    };


    // ----------------------------------------------------

    me.render = function()
    {        
        var activityCardDivTag = me.getActivityCardDivTag();

        // If tag has been created), perform render
        if ( activityCardDivTag )
        {
            var activityJson = ActivityDataManager.getActivityItem( "id", me.activityId );
            var clickEnable = ( me.options.disableClicks ) ? false: true;

            try
            {
                var activityContainerTag = activityCardDivTag.find( '.activityContainer' );
                var activityTypeIconTag = activityCardDivTag.find( '.activityIcon' );
                var activityContentTag = activityCardDivTag.find( '.activityContent' );
                var activityRerenderTag = activityCardDivTag.find( '.activityRerender' );
                var activityPhoneCallTag = activityCardDivTag.find( '.activityPhone' );


                // 1. activityType (Icon) display (LEFT SIDE)
                me.activityTypeDisplay( activityTypeIconTag, activityJson );
                if ( clickEnable ) me.activityIconClick_displayInfo( activityTypeIconTag, activityJson );


                // 2. previewText/main body display (MIDDLE)
                me.setActivityContentDisplay( activityContentTag, activityJson );
                if ( clickEnable ) me.activityContentClick_FullView( activityContentTag, activityContainerTag, activityJson.id );


                // 3. 'SyncUp' Button Related
                // click event - for activitySubmit.., icon/text populate..
                me.setupSyncBtn( clickEnable, activityCardDivTag, activityJson );    

                // 4. 'phoneNumber' action  button setup
                me.setupPhoneCallBtn( activityPhoneCallTag, me.activityId );

                // 5. clickable rerender setup
                me.setUpReRenderByClick( activityRerenderTag );
            }
            catch( errMsg )
            {
                console.customLog( 'Error on ActivityCard.render, errMsg: ' + errMsg );
            }
        }
    };


    me.activityIconClick_displayInfo = function( activityIconTag, activityJson )
    {
        activityIconTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..
            console.customLog( activityJson );
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
                
    me.setupSyncBtn = function( clickEnable, activityCardDivTag, activityJson )
    {
        var divSyncIconTag = activityCardDivTag.find( '.activityStatusIcon' );
        var divSyncStatusTextTag = activityCardDivTag.find( '.activityStatusText' );
        
        var statusVal = ( activityJson.processing ) ? activityJson.processing.status: '';

        //divSyncIconTag.css( "cursor", "pointer" );
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
                    me.syncResultMsgShow( statusVal, activityJson, activityCardDivTag );
    
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
                    //me.displayActivitySyncStatus_Wrapper( activityJson, activityCardDivTag );

                    // Case 2. Cancel the Sync Process..
                
                
            });     
        }
    };

    me.setupPhoneCallBtn = function( divPhoneCallTag, activityId )
    {        
        var clientObj = ClientDataManager.getClientByActivityId( activityId );

        divPhoneCallTag.empty();

        //if ( activityType && activityType.calls && activityType.calls )
        if ( clientObj.clientDetails && clientObj.clientDetails.phoneNumber )
        {
            var phoneNumber = clientObj.clientDetails.phoneNumber; // should we define phoneNumber field in config? might change to something else in the future
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
            imgIcon.attr( 'src', 'images/sync_msd.svg' ); //sync.svg //divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
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
            imgIcon.attr( 'src', 'images/sync_msd.svg' ); //sync.svg //divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
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
    me.displayActivitySyncStatus_Wrapper = function( activityJson, activityCardDivTag )
    {
        //var activityCardDivTag = me.getActivityCardDivTag();
        if ( activityCardDivTag && activityCardDivTag.length > 0 )
        {
            var divSyncIconTag = activityCardDivTag.find( '.activityStatusIcon' );
            var divSyncStatusTextTag = activityCardDivTag.find( '.activityStatusText' );
            
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

    
    me.syncResultMsgShow = function( statusVal, activityJson, activityCardDivTag )
    {
        // If 'activityCardDivTag ref is not workign with fresh data, we might want to get it by activityId..
        Templates.setMsgAreaBottom( function( syncInfoAreaTag ) 
        {
            me.syncResultMsg_header( syncInfoAreaTag, activityCardDivTag );
            me.syncResultMsg_content( syncInfoAreaTag, activityCardDivTag, activityJson );
        });

        // activityJson.processing  <-- activityJson.appData?
        // activityJson.processing.history..  <-- save error / downloaded / synced info..
        // activityJson.processing.status       <-- quick info of current (last)
    };

    me.syncResultMsg_header = function( syncInfoAreaTag, activityCardDivTag )
    {        
        var divHeaderTag = syncInfoAreaTag.find( 'div.msgHeader' );
        var statusLabel = activityCardDivTag.find( 'div.activityStatusText' ).text();

        var syncMsg_HeaderPartTag = $( Templates.syncMsg_Header );
        syncMsg_HeaderPartTag.find( '.msgHeaderLabel' ).text = statusLabel;

        divHeaderTag.html( syncMsg_HeaderPartTag );
    };


    me.syncResultMsg_content = function( syncInfoAreaTag, activityCardDivTag, activityJson )
    {
        var divBottomTag = syncInfoAreaTag.find( 'div.msgContent' );
        divBottomTag.empty();

        // 1. ActivityCard Info Add - From Activity Card Tag  
        divBottomTag.append( $( activityCardDivTag.parent().find( '[itemid=' + activityJson.id + ']' )[ 0 ].outerHTML ) ); // << was activityJson.activityId

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


    me.setActivityContentDisplay = function( divActivityContentTag, activity )
    {
        try
        {
            var appendContent = '';

            var activitySettings = ConfigManager.getActivityTypeConfig( activity );

            // Choose to use generic display (Base/Settings) or activity display ones (if available).
            var displayBase = ( activitySettings && activitySettings.displayBase ) ? activitySettings.displayBase : ConfigManager.getActivityDisplayBase();
            var displaySettings = ( activitySettings && activitySettings.displaySettings ) ? activitySettings.displaySettings : ConfigManager.getActivityDisplaySettings();
            
            divActivityContentTag.find( 'div.activityContentDisplay' ).remove();
        
            InfoDataManager.setINFOdata( 'activity', activity );
            InfoDataManager.setINFOclientByActivity( activity );
    
            // Display 1st line - as date
            var displayBaseContent = Util.evalTryCatch( displayBase, InfoDataManager.getINFO(), 'ActivityCard.setActivityContentDisplay, displayBase' );
            if ( displayBaseContent && displayBaseContent.length && displayBaseContent.trim().length ) divActivityContentTag.append( $( me.template_ActivityContentTextTag ).html( displayBaseContent ) );


            // Display 2nd lines and more
            if ( displaySettings )
            {            
                // If custom config display, remove 
                for( var i = 0; i < displaySettings.length; i++ )
                {
                    // Need 'activity', 'activityTrans'
                    var dispSettingEvalStr = displaySettings[ i ].trim();

                    if ( dispSettingEvalStr )
                    {
                        var displayEvalResult = Util.evalTryCatch( dispSettingEvalStr, InfoDataManager.getINFO(), 'ActivityCard.setActivityContentDisplay' );

                        if ( displayEvalResult && displayEvalResult.length && displayEvalResult.trim().length ) divActivityContentTag.append( $( me.template_ActivityContentTextTag ).html( displayEvalResult ) );
                    }
                }
            }
    
            //divActivityContentTag.append( $( me.template_ActivityContentDateTag ).html( appendContent ) );
        }
        catch ( errMsg )
        {
            console.customLog( 'ERROR in activityCard.setActivityContentDisplay, errMsg: ' + errMsg );
        }
    };


    me.activitySubmitSyncClick = function()
    {        
        if ( SyncManagerNew.syncStart_CheckNSet() )
        {
            try
            {
                me.performSyncUp( function( success ) {
    
                    SyncManagerNew.syncFinish_Set();     

                    me.reRenderActivityDiv();
                });    
            }
            catch( errMsg )
            {
                console.customLog( 'ERROR on running on activityCard.SyncUpItem, errMsg - ' + errMsg );
                SyncManagerNew.syncFinish_Set();     
            }
        }
    };
              

    me.reRenderActivityDiv = function()
    {
        console.customLog( 'reRenderByActivityId' );
        // There are multiple places presenting same activityId info.
        // We can find them all and reRender their info..
        var activityCardTags = $( '.activity[itemid="' + me.activityId + '"]' );
        var reRenderClickDivTags = activityCardTags.find( 'div.activityRerender' );   
        
        reRenderClickDivTags.click();
    }
    
    // -------------------------------
    // --- Display Icon/Content related..
    
    me.syncUpStatusDisplay = function( activityCardDivTag, activityJson )
    {
        try
        {
            // 1. Does it find hte matching status?
            var activitySyncUpStatusConfig = ConfigManager.getActivitySyncUpStatusConfig( activityJson );
            if ( activitySyncUpStatusConfig ) activityCardDivTag.find( '.listItem_statusOption' ).html( activitySyncUpStatusConfig.label );

            me.setActivitySyncUpStatus( activityCardDivTag, activityJson.processing );
        }
        catch( errMsg )
        {
            console.customLog( 'Error on ActivityCard.syncUpStatusDisplay, errMsg: ' + errMsg );
        }        
    };


    me.activityTypeDisplay = function( activityTypeIconTag, activityJson )
    {
        try
        {
            var activityTypeConfig = ConfigManager.getActivityTypeConfig( activityJson );
    
            // SyncUp icon also gets displayed right below ActivityType (as part of activity type icon..)
            var activitySyncUpStatusConfig = ConfigManager.getActivitySyncUpStatusConfig( activityJson );

            // TODO: Bring this method up from 'formUtil' to 'activityCard'?
            // update activityType Icon (opacity of SUBMIT status = 100%, opacity of permanent FAIL = 100%, else 40%)

            FormUtil.appendActivityTypeIcon( activityTypeIconTag
                , activityTypeConfig
                , activitySyncUpStatusConfig
                , undefined
                , undefined
                , activityJson );
                
        }
        catch( errMsg )
        {
            console.customLog( 'Error on ActivityCard.activityTypeDisplay, errMsg: ' + errMsg );
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


    me.setActivitySyncUpStatus = function( activityCardDivTag, activityProcessing ) 
    {
        try
        {
            var imgSyncIconTag = activityCardDivTag.find( 'small.syncIcon img' );

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
            console.customLog( 'Error on ActivityCard.setActivitySyncUpStatus, errMsg: ' + errMsg );
        }
    };


    me.highlightActivityDiv = function( bHighlight )
    {
        // If the activityTag is found on the list, highlight it during SyncAll processing.
        var activityDivTag = $( '.activity[itemid="' + me.activityId + '"]' );

        if ( activityDivTag )
        {
            if ( bHighlight ) activityDivTag.css( 'background-color', 'lightyellow' );
            else activityDivTag.css( 'background-color', '' );
        }
    }

    // -------------------------------


    // Perform Submit Operation..
    me.performSyncUp = function( afterDoneCall )
    {
        var activityJson_Orig;
        var syncIconTag = me.getSyncButtonTag( me.activityId );

        try
        {
            activityJson_Orig = ActivityDataManager.getActivityItem( "id", me.activityId );
            // Do not delete 'processing' until success..


            // Set the status as processing..
            activityJson_Orig.processing.status = Constants.status_processing;
            me.displayActivitySyncStatus_Wrapper( activityJson_Orig, me.getActivityCardDivTag() );
            // Run UI Animation..
            FormUtil.rotateTag( syncIconTag, true );

            
            var payload = ActivityDataManager.activityPayload_ConvertForWsSubmit( activityJson_Orig );

            if ( !activityJson_Orig.processing ) throw 'Activity.performSyncUp, activity.processing not available';
            if ( !activityJson_Orig.processing.url ) throw 'Activity.performSyncUp, activity.processing.url not available';

            try
            {
                var loadingTag = undefined;
                //FormUtil.submitRedeem = function( apiPath, payloadJson, activityJson, loadingTag, returnFunc, asyncCall, syncCall )

                WsCallManager.wsActionCall( activityJson_Orig.processing.url, payload, loadingTag, function( success, responseJson )
                {
                    // Stop the Sync Icon rotation
                    FormUtil.rotateTag( syncIconTag, false );

                    // Replace the downloaded activity with existing one - thus 'processing.status' gets emptyed out/undefined
                    me.syncUpResponseHandle( activityJson_Orig, success, responseJson, function( success, errMsg ) {

                        if ( success ) 
                        {
                            afterDoneCall( true );
                        }
                        else 
                        {
                            // Error - responseJson
                            console.customLog( responseJson );

                            // 'syncedUp' processing data                
                            var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_failed, 401, 'Failed to syncUp, msg - ' + Util.getStr( errMsg ) );
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

                throw ' in WsCallManager.requestPostDws - ' + errMsg;  // Go to next 'catch'
            }    
        }
        catch( errMsg )
        {
            console.customLog( 'Error in ActivityCard.syncUp - ' + errMsg );

            // Stop the Sync Icon rotation
            FormUtil.rotateTag( syncIconTag, false );

            afterDoneCall( false );
        }
    };


    // =============================================

    me.syncUpResponseHandle = function( activityJson_Orig, success, responseJson, callBack )
    {
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

                if ( callBack ) callBack( operationSuccess );
            });
        }
        else
        {
            var errMsg = '';
            
            try
            {
                if ( responseJson.result )
                {
                    if ( responseJson.result.operation ) errMsg += ' operation: ' + responseJson.result.operation;
                    if ( responseJson.result.errData ) errMsg += ' errorData: ' + JSON.stringify( responseJson.result.errData );    
                }
                else
                {
                    errMsg += ' Error Response: ' + JSON.stringify( responseJson );
                }
            } catch 
            { 
                try
                {
                    errMsg += ' Error Response: ' + JSON.stringify( responseJson );
                }
                catch {}
            }

            // Add activityJson processing
            if ( callBack ) callBack( operationSuccess, errMsg );
        } 
    };

    // remove this activity from list  (me.activityJson.id ) <-- from common client 
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
            FormUtil.setUpEntryTabClick( sheetFull.find( '.tab_fs' ) ); 
        
            // ADD TEST/DUMMY VALUE
            sheetFull.find( '.activity' ).attr( 'itemid', activityId )
            

            // Header content set
            var actCard = new ActivityCard( activityId, me.cwsRenderObj
                , { 'parentTag_Override': sheetFull, 'disableClicks': true } );
            actCard.render();

            // set tabs contents
            me.setFullPreviewTabContent( activityId, sheetFull );
        
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
    
    me.setFullPreviewTabContent = function( activityId, sheetFull )
    {
        var clientObj = ClientDataManager.getClientByActivityId( activityId );
        var activityJson = ActivityDataManager.getActivityById( activityId );
    
        var arrDetails = [];
    
        // 1 clientDetails
        for ( var key in clientObj.clientDetails ) 
        {
            arrDetails.push( { 'name': key, 'value': clientObj.clientDetails[ key ] } );
        }

        $( '[tabButtonId=tab_previewDetails]' ).html( Util2.arrayPreviewRecord( 'clientDetails:', arrDetails) ); //activityListPreviewTable
    
    
        // 2. payload Preview
        var jv_payload = new JSONViewer();
        $( '[tabButtonId=tab_previewPayload]' ).append( jv_payload.getContainer() );
        jv_payload.showJSON( activityJson );
    

        // 3. sync History
        $( '[tabButtonId=tab_previewSync]' ).html( JsonBuiltTable.buildTable( activityJson.processing.history ) );

        
        // Set event for "Remove" button for "Pending" client
        var activity = ActivityDataManager.getActivityById( activityId );
        var removeActivityBtn = sheetFull.find("#removeActivity");
        if( activity.processing.status == "queued" )
        {
            removeActivityBtn.click( function(){

                console.customLog("=================================");
                console.customLog( activityJson );
    
                var result = confirm("Are you sure you want to delete this client ?");
                if( result )
                {
                    var client = ClientDataManager.getClientByActivityId( activityId );
                    ClientDataManager.removeClient( client );
                    ClientDataManager.saveCurrent_ClientsStore( function(){
                        $( '#pageDiv' ).find("[itemid='" + activityId + "']").remove();
                        sheetFull.find( 'img.btnBack' ).click();
                    });
                }
    
               
            });
        }
        else
        {
            removeActivityBtn.remove();
        }
        
        
    };
    
    
    // =============================================
	// === Other Supporting METHODS ========================

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

