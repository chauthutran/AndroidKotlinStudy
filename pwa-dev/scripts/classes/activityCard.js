// -------------------------------------------
// -- ActivityCard Class/Methods
//      - Mainly used for syncManager run one activity item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where activity items are processed (in sync)
//              without being displayed on the app list.  
//
function ActivityCard( activityId, options )
{
	var me = this;

    me.activityId = activityId;
    me.options = ( options ) ? options : {};

    me.cardHighlightColor = '#fcffff'; // #fffff9

	// =============================================
	// === Initialize Related ========================

    me.initialize = function() { };

    // ----------------------------------------------------

    me.render = function()
    {        
        var activityCardDivTag = me.getActivityCardDivTag();

        // If tag has been created), perform render
        if ( activityCardDivTag.length > 0 )
        {
            var activityJson = ActivityDataManager.getActivityById( me.activityId );
            var detailViewCase = ( me.options.detailViewCase ) ? true: false;  // Used for detailed view popup - which reuses 'render' method.

            try
            {
                var activityContainerTag = activityCardDivTag.find( '.activityContainer' );
                var activityTypeIconTag = activityCardDivTag.find( '.activityIcon' );
                var activityContentTag = activityCardDivTag.find( '.activityContent' );
                var activityRerenderTag = activityCardDivTag.find( '.activityRerender' );
                var activityPhoneCallTag = activityCardDivTag.find( '.activityPhone' );

                // 1. activityType (Icon) display (LEFT SIDE)
                me.activityTypeDisplay( activityTypeIconTag, activityJson );
                me.activityIconClick_displayInfo( activityTypeIconTag, activityJson );


                // 2. previewText/main body display (MIDDLE)
                me.setActivityContentDisplay( activityContentTag, activityJson );
                if ( !detailViewCase ) me.activityContentClick_FullView( activityContentTag, activityJson.id );


                // 3. 'SyncUp' Button Related
                // click event - for activitySubmit.., icon/text populate..
                me.setupSyncBtn( activityCardDivTag, me.activityId, detailViewCase );  // clickEnable - not checked for SyncBtn/Icon

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

    // -----------------------------------------------------

    me.getActivityCardDivTag = function()
    {
        //if ( me.options.parentTag_Override ) return me.options.parentTag_Override.find( 'div.card[itemid="' + me.activityId + '"]' );            
        return $( 'div.card[itemid="' + me.activityId + '"]' );
    };

    // -----------------------------------------------------

    me.activityIconClick_displayInfo = function( activityIconTag, activityJson )
    {
        activityIconTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..
            console.log( activityJson );
        });
    };

    me.activityContentClick_FullView = function( activityContentTag, activityId )
    {
        activityContentTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();

            var activityCardDetail = new ActivityCardDetail( activityId );
            activityCardDetail.render();
        });
    };

    
    me.setupSyncBtn = function( activityCardDivTag, activityId, detailViewCase )
    {
        var divSyncIconTag = activityCardDivTag.find( '.activityStatusIcon' ).attr( 'activityId', activityId );
        var divSyncStatusTextTag = activityCardDivTag.find( '.activityStatusText' ).attr( 'activityId', activityId );

        // if 'detailView' mode, the bottom message should not show..
        if ( detailViewCase ) divSyncIconTag.addClass( 'detailViewCase' );


        // NOTE: This is setting for this tag only, so might not need to set for others??
        ActivitySyncUtil.displayActivitySyncStatus( activityId );
 
        ActivitySyncUtil.setSyncIconClickEvent( divSyncIconTag, activityCardDivTag, activityId );
    };


    me.setupPhoneCallBtn = function( divPhoneCallTag, activityId )
    {        
        var clientObj = ClientDataManager.getClientByActivityId( activityId );

        divPhoneCallTag.empty();
        //divPhoneCallTag.off( 'click' );

        // Override the icon if 'favId' exists..  <-- scheduled..
        var activityJson = ActivityDataManager.getActivityById( activityId );
        if ( activityJson.formData && activityJson.formData.favId )
        {
            // display favId instead.. + click event..            
            var favItemJson = FavIcons.getFavItemJson( 'clientActivityFav', activityJson.formData.favId );

            if ( favItemJson )
            {
                FavIcons.populateFavItemIcon( divPhoneCallTag, favItemJson );

                divPhoneCallTag.attr( 'title', favItemJson.name );  // if term is available, make it term..
                //divPhoneCallTag.append( favItemIconTag );
                divPhoneCallTag.show();    


                var targetBlockTag = divPhoneCallTag.closest( '[tabButtonId=tab_clientActivities]' );
                if ( targetBlockTag.length >= 1 ) 
                {
                    FavIcons.setFavItemClickEvent( divPhoneCallTag, favItemJson, targetBlockTag, targetBlockTag, function() {
                        targetBlockTag.empty();
                    } );
                }
            }
        }
        else       
        {
            if ( clientObj.clientDetails && clientObj.clientDetails.phoneNumber )
            {
                var phoneNumber = Util.trim( clientObj.clientDetails.phoneNumber ); // should we define phoneNumber field in config? might change to something else in the future
    
                if ( phoneNumber && phoneNumber !== '+' )
                {
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
                }
            }
        }
    };

    // ------------------------------------------

    me.setUpReRenderByClick = function( activityRerenderTag )
    {
        activityRerenderTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..
            me.render();
        } );    
    };


    me.setActivityContentDisplay = function( divActivityContentTag, activity )
    {
        try
        {
            var activitySettings = ConfigManager.getActivityTypeConfig( activity );

            // Choose to use generic display (Base/Settings) or activity display ones (if available).
            var displayBase = '';
            var displaySettings = [];
                    
            if ( me.options.displaySetting === 'clientActivity' )
            {
                displayBase = ConfigManager.getClientActivityCardDefDisplayBase();
                displaySettings = ConfigManager.getClientActivityCardDefDisplaySettings();
            }
            else 
            {
                displayBase = ( activitySettings && activitySettings.displayBase ) ? activitySettings.displayBase : ConfigManager.getActivityDisplayBase();
                displaySettings = ( activitySettings && activitySettings.displaySettings ) ? activitySettings.displaySettings : ConfigManager.getActivityDisplaySettings();
            }


            InfoDataManager.setINFOdata( 'activity', activity );
            InfoDataManager.setINFOclientByActivity( activity );
    
            FormUtil.setCardContentDisplay( divActivityContentTag, displayBase, displaySettings, Templates.cardContentDivTag );
        }
        catch ( errMsg )
        {
            console.customLog( 'ERROR in activityCard.setActivityContentDisplay, errMsg: ' + errMsg );
        }
    };

    
    me.reRenderActivityDiv = function()
    {
        // There are multiple places presenting same activityId info.
        // We can find them all and reRender their info..
        var activityCardTags = $( 'div.card[itemid="' + me.activityId + '"]' );
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
        var activityDivTag = $( 'div.card[itemid="' + me.activityId + '"]' );

        if ( activityDivTag.length > 0 )
        {
            if ( bHighlight ) activityDivTag.css( 'background-color', me.cardHighlightColor );
            else activityDivTag.css( 'background-color', '' );
        }
    }

    // -------------------------------


    // Perform Submit Operation..
    me.performSyncUp = function( afterDoneCall )
    {
        var activityJson_Orig;
        var activityId = me.activityId;
        var syncIconTag = ActivitySyncUtil.getSyncButtonDivTag( activityId );

        try
        {

            // gAnalytics Event
            GAnalytics.setEvent( 'SyncRun', activityId, 'activity', 1 );
            //GAnalytics.setEvent = function(category, action, label, value = null) 

            activityJson_Orig = ActivityDataManager.getActivityById( activityId );

            if ( !activityJson_Orig.processing ) throw 'Activity.performSyncUp, activity.processing not available';
            if ( !activityJson_Orig.processing.url ) throw 'Activity.performSyncUp, activity.processing.url not available';

            var mockResponseJson = ConfigManager.getMockResponseJson( activityJson_Orig.processing.useMockResponse );


            // NOTE: On 'afterDoneCall', 'reRenderActivityDiv()' gets used to reRender of activity.  
            //  'displayActivitySyncStatus()' also has 'FormUtil.rotateTag()' in it.
            //  Probably do not need to save data here.  All the error / success case probably are covered and saves data afterwards.
            activityJson_Orig.processing.status = Constants.status_processing;
            activityJson_Orig.processing.syncUpCount = Util.getNumber( activityJson_Orig.processing.syncUpCount ) + 1;

            ActivitySyncUtil.displayActivitySyncStatus( activityId );

            try
            {
                // Fake Test Response Json
                if ( mockResponseJson )
                {
                    WsCallManager.mockRequestCall( mockResponseJson, undefined, function( success, responseJson )
                    {
                        me.syncUpWsCall_ResultHandle( syncIconTag, activityJson_Orig, success, responseJson, afterDoneCall );
                    });
                }
                else
                {
                    var payload = ActivityDataManager.activityPayload_ConvertForWsSubmit( activityJson_Orig );

                    // NOTE: We need to add app timeout, from 'request'... and throw error...
                    WsCallManager.wsActionCall( activityJson_Orig.processing.url, payload, undefined, function( success, responseJson )
                    {
                        me.syncUpWsCall_ResultHandle( syncIconTag, activityJson_Orig, success, responseJson, afterDoneCall );
                    });       
                }
            }
            catch ( errMsg )
            {
                throw ' Error on wsActionCall - ' + errMsg;  // Go to next 'catch'
            }
        }
        catch( errMsg )
        {
            // Stop the Sync Icon rotation
            FormUtil.rotateTag( syncIconTag, false );

            // Set the status as 'Error' with detail.  Save to storage.  And then, display the changes on visible.
            var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_error, 404, 'Error.  Can not be synced.  msg - ' + errMsg );
            ActivityDataManager.insertToProcessing( activityJson_Orig, processingInfo );
            
            ClientDataManager.saveCurrent_ClientsStore( () => {
                ActivitySyncUtil.displayActivitySyncStatus( activityId );
                afterDoneCall( false, errMsg );
            });
        }
    };

    // ----------------------------------------------

    me.syncUpWsCall_ResultHandle = function( syncIconTag, activityJson_Orig, success, responseJson, afterDoneCall )
    {        
        var activityId = me.activityId;
        // Stop the Sync Icon rotation
        FormUtil.rotateTag( syncIconTag, false );

        // NOTE: 'activityJson_Orig' is used for failed case only.  If success, we create new activity

        // Based on response(success/fail), perform app/activity/client data change
        me.syncUpResponseHandle( activityJson_Orig, success, responseJson, function( success, errMsg ) 
        {
            // Updates UI & perform any followUp actions - 'responseCaseAction'

            // On failure, if the syncUpCount has rearched the limit, set the appropriate status.
            var newActivityJson = ActivityDataManager.getActivityById( activityId );
            // If 'syncUpResponse' changed status, make the UI applicable..
            //var newActivityJson = ActivityDataManager.getActivityById( activityId );

            if ( newActivityJson )
            {
                ActivitySyncUtil.displayActivitySyncStatus( activityId );

                // [*NEW] Process 'ResponseCaseAction' - responseJson.report - This changes activity status again if applicable
                if ( responseJson && responseJson.report ) 
                {
                    ActivityDataManager.processResponseCaseAction( responseJson.report, activityId );
                }    
            }
            else
            {
                throw 'FAILED to handle syncUp response, activityId lost: ' + activityId;
            }

            afterDoneCall( success, responseJson );
        });   
    };

    // =============================================

    me.syncUpResponseHandle = function( activityJson_Orig, success, responseJson, callBack )
    {
        var operationSuccess = false;
        var activityId = me.activityId;

        // 1. Check success
        if ( success && responseJson && responseJson.result && responseJson.result.client )
        {
            var clientJson = ConfigManager.downloadedData_UidMapping( responseJson.result.client );

            // #1. Check if current activity Id exists in 'result.client' activities..
            if ( clientJson.activities && Util.getFromList( clientJson.activities, activityId, "id" ) )
            {
                operationSuccess = true;

                // 'syncedUp' processing data - OPTIONALLY, We could preserve 'failed' history...
                var processingInfo = ActivityDataManager.createProcessingInfo_Success( Constants.status_submit, 'SyncedUp processed.', activityJson_Orig.processing );

                // [NOTE: STILL USED?]
                // If this is 'fixActivityCase' request success result, remove the flag on 'processing' & delete the record in database.
                if ( processingInfo.fixActivityCase )
                {
                    delete processingInfo.fixActivityCase;
                    me.deleteFixActivityRecord( activityId );
                }

                
                ClientDataManager.setActivityDateLocal_client( clientJson );

                // TODO: NOTE!!  COMPLECATED MERGING AND SYNC UP CASES!!
                // We usually have to delete App version activity at this point!!!! - since the merge only takes in the new activity.
                // But have the merge take care of this!!

                //else throw "ERROR, Downloaded activity does not contain 'id'.";

                // Removal of existing activity/client happends within 'mergeDownloadClients()'
                ClientDataManager.mergeDownloadedClients( { 'clients': [ clientJson ], 'case': 'syncUpActivity', 'syncUpActivityId': activityId }, processingInfo, function() 
                {
                    // relationship target clients update sync..
                    /*
                    var otherClients = responseJson.result.otherClients;
                    if ( otherClients )
                    {
                        ClientDataManager.setActivityDateLocal_clientList( otherClients );

                        ClientDataManager.mergeDownloadedClients( { 'clients': otherClients, 'case': 'syncUpActivity' }, undefined, function() 
                        {
                            console.log( 'merged sync otherClients' );
                        });
                    }
                    */
                   
                    // 'mergeDownload' does saving if there were changes..  do another save?  for fix casese?  No Need?
                    ClientDataManager.saveCurrent_ClientsStore( () => {
                        if ( callBack ) callBack( operationSuccess );
                    });
                });
            }
            else
            {
                var errMsg = 'No matching activity with id, ' + activityId + ', found on result.client.';
                var errStatusCode = 400;
    
                // 'syncedUp' processing data                
                var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_failed, errStatusCode, 'ErrMsg: ' + errMsg );
                ActivityDataManager.insertToProcessing( activityJson_Orig, processingInfo );

                ClientDataManager.saveCurrent_ClientsStore( () => {
                    if ( callBack ) callBack( operationSuccess, errMsg );
                });                                      
            }            
        }
        else
        {
            var errMsg = 'Error: ';
            var errStatusCode = 400;
            var newStatus = Constants.status_failed;

            if ( responseJson )
            {
                try
                {
                    if ( responseJson.errStatus ) errStatusCode = responseJson.errStatus;
    
                    if ( responseJson.result )
                    {
                        if ( responseJson.result.operation ) errMsg += ' [result.operation]: ' + responseJson.result.operation;
                        if ( responseJson.result.errData ) errMsg += ' [result.errData]: ' + Util.getJsonStr( responseJson.result.errData ); 
                    }
                    else if ( responseJson.errMsg ) 
                    {
                        errMsg += ' [errMsg]: ' + responseJson.errMsg;
                    }
                    else if ( responseJson.errorMsg ) 
                    {
                        errMsg += ' [errorMsg]: ' + responseJson.errorMsg;
                    }
                    else if ( responseJson.report )
                    {
                        errMsg += ' [report.msg]: ' + responseJson.report.msg;
                    }
                    else
                    {
                        // TODO: Need to simplify this...
                        me.cleanUpErrJson( responseJson );
                        errMsg += ' [else]: ' + Util.getJsonStr( responseJson );
                    }
    
                    // TODO: NOTE: Not enabled, yet.  Discuss with Susan 1st.
                    if ( responseJson.subStatus === 'errorStop' || responseJson.subStatus === 'errorRepeatFail' ) newStatus = Constants.status_error;
                } 
                catch ( errMsgCatched )
                {
                    errMsg += ' [errMsgCatched]: ' + Util.getJsonStr( responseJson ) + 'errMsgCatched: ' + errMsgCatched;
                }
            }

            // 'syncedUp' processing data                
            var processingInfo = ActivityDataManager.createProcessingInfo_Other( newStatus, errStatusCode, errMsg );
            ActivityDataManager.insertToProcessing( activityJson_Orig, processingInfo );

            ClientDataManager.saveCurrent_ClientsStore( () => {
                // Add activityJson processing
                if ( callBack ) callBack( operationSuccess, errMsg );
            });                                      
        } 
    };


    me.deleteFixActivityRecord = function( activityId )
	{
        try
        {
            //if ( fixedActivityList && fixedActivityList.length > 0 )
            var payloadJson = { 'find': { 'activityId': activityId } }; //{ '$in': fixedActivityList } } };

            WsCallManager.requestDWS_DELETE( WsCallManager.EndPoint_PWAFixActivitiesDEL, payloadJson, undefined, function() 
            {
                console.customLog( 'Deleted fixActivityRecord, activityId ' + activityId );
            });
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR during ActivityCard.deleteFixActivityRecord(), activityId: ' + activityId + ', errMsg: ' + errMsg );
        }
	};


    me.cleanUpErrJson = function( responseJson )
    {
        try
        {
            if ( responseJson.report )
            {
                var report = responseJson.report;
                if ( report.process ) delete report.process;
                if ( report.log ) delete report.log;
                if ( report.req ) delete report.req;
            }
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR during ActivityCard.cleanUpErrJson, errMsg: ' + errMsg );
        }        
    };

    // remove this activity from list  (me.activityJson.id ) <-- from common client 

    // =============================================

    // === Full Detail Popup Related METHODS ========================

          
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
        if ( btnTag.length > 0 )
        {
            if ( btnTag.hasClass( 'clicked' ) )
            { 
                btnTag.removeClass( 'clicked' );
            }
        }        
    };

    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

};


ActivityCard.cardDivTag = `<div class="activity card">

    <div class="activityContainer card__container">

        <card__support_visuals class="activityIcon card__support_visuals" />

        <card__content class="activityContent card__content" />

        <card__cta class="activityStatus card__cta">
            <div class="activityStatusText card__cta_status"></div>
            <div class="activityPhone card__cta_one" style="cursor: pointer;"></div>
            <div class="activityStatusIcon card__cta_two" style="cursor:pointer;"></div>
        </card__cta>

        <div class="activityRerender" style="float: left; width: 1px; height: 1px;"></div>

    </div>

</div>`;
