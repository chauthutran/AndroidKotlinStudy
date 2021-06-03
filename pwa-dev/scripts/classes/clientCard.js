// -------------------------------------------
// -- ClientCard Class/Methods
//      - Mainly used for syncManager run one activity item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where activity items are processed (in sync)
//              without being displayed on the app list.  
//
function ClientCard( activityId, cwsRenderObj, options )
{
	var me = this;

    me.activityId = activityId;
    me.cwsRenderObj = cwsRenderObj;
    me.options = ( options ) ? options : {};

    me.cardHighlightColor = '#fcffff'; // #fffff9
    me.coolDownMoveRate = 300; // 100 would move 10 times per sec..

    // -----------------------------------

    me.template_ActivityContentTextTag = `<div class="activityContentDisplay card__row"></div>`;

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
            var clickEnable = ( me.options.disableClicks ) ? false: true;  // Used for detailed view popup - which reuses 'render' method.

            try
            {
                var activityContainerTag = activityCardDivTag.find( '.activityContainer' );
                var activityTypeIconTag = activityCardDivTag.find( '.activityIcon' );
                var activityContentTag = activityCardDivTag.find( '.activityContent' );
                var activityRerenderTag = activityCardDivTag.find( '.activityRerender' );
                var activityPhoneCallTag = activityCardDivTag.find( '.activityPhone' );

                var activityEditPaylayLoadBtnTag = activityCardDivTag.find( '#editPaylayLoadBtn' );


                // 1. activityType (Icon) display (LEFT SIDE)
                me.activityTypeDisplay( activityTypeIconTag, activityJson );
                if ( clickEnable ) me.activityIconClick_displayInfo( activityTypeIconTag, activityJson );


                // 2. previewText/main body display (MIDDLE)
                me.setActivityContentDisplay( activityContentTag, activityJson );
                if ( clickEnable ) me.activityContentClick_FullView( activityContentTag, activityContainerTag, activityJson.id );


                // 3. 'SyncUp' Button Related
                // click event - for activitySubmit.., icon/text populate..
                me.setupSyncBtn( activityCardDivTag, activityJson, !clickEnable );  // clickEnable - not checked for SyncBtn/Icon

                // 4. 'phoneNumber' action  button setup
                me.setupPhoneCallBtn( activityPhoneCallTag, me.activityId );

                // 5. clickable rerender setup
                me.setUpReRenderByClick( activityRerenderTag );

                // Set up "editPaylayLoadBtn"
                me.setUpEditPayloadLoadBtn( activityEditPaylayLoadBtnTag, activityJson );
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
        if ( me.options.parentTag_Override )
        {
            return me.options.parentTag_Override.find( '.activity[itemid="' + me.activityId + '"]' );
        }
        else
        {
            return $( '.activity[itemid="' + me.activityId + '"]' );
        }
    };


    me.getSyncButtonDivTag = function( activityId )
    {
        var activityCardTags = ( activityId ) ? $( '.activity[itemid="' + activityId + '"]' ) : me.getActivityCardDivTag();

        return activityCardTags.find( '.activityStatusIcon' );
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

    me.activityContentClick_FullView = function( activityContentTag, activityContainerTag, activityId )
    {
        activityContentTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();
            me.showFullPreview( activityId, activityContainerTag );            
        });
    };

    
    me.setupSyncBtn = function( activityCardDivTag, activityJson, detailViewCase )
    {
        var divSyncIconTag = activityCardDivTag.find( '.activityStatusIcon' );
        var divSyncStatusTextTag = activityCardDivTag.find( '.activityStatusText' );
        var statusVal = ( activityJson.processing ) ? activityJson.processing.status: '';

        // if 'detailView' mode, the bottom message should not show..
        if ( detailViewCase ) divSyncIconTag.addClass( 'detailViewCase' );

        me.displayActivitySyncStatus( statusVal, divSyncStatusTextTag, divSyncIconTag, activityJson );

        me.setSyncIconClickEvent( divSyncIconTag, activityCardDivTag, activityJson.id ); //me.activityId );   
    };


    me.setSyncIconClickEvent = function( divSyncIconTag, activityCardDivTag, activityId )
    {
        divSyncIconTag.off( 'click' ).on( 'click', function( e ) 
        {
            // This could be called again after activityJson/status is changed, thus, get everything again from activityId
            e.stopPropagation();  // Stops calling parent tags event calls..

            var activityJson = ActivityDataManager.getActivityById( activityId );
            var statusVal = ( activityJson.processing ) ? activityJson.processing.status: '';
            
            // NOTE:
            //  - If status is not syncable one, display bottom message
            //  - If offline, display the message about it.
            if ( SyncManagerNew.isSyncReadyStatus( statusVal ) )
            {
                // If Sync Btn is clicked while in coolDown mode, display msg...  Should be changed..
                ActivityDataManager.checkActivityCoolDown( activityId, function( timeRemainMs )
                {         
                    // Display Left Msg <-- Do not need if?                          
                    var leftSec = Util.getSecFromMiliSec( timeRemainMs );
                    var coolTime = UtilDate.getSecFromMiliSec( ConfigManager.coolDownTime );
                    MsgManager.msgAreaShow( '<span term="' + ConfigManager.getSettingsTermId( "coolDownMsgTerm" ) + '">In coolDown mode, left: </span>' + '<span>' + leftSec + 's / ' + coolTime + 's' + '</span>' ); 

                }, function() 
                {
                    // Main SyncUp Processing --> Calls 'activityCard.performSyncUp' eventually.
                    if ( ConnManagerNew.isAppMode_Online() ) SyncManagerNew.syncUpActivity( activityId );
                    else MsgManager.msgAreaShow( 'Sync is not available with offline AppMode..' );
                });
            }  
            else 
            {
                if ( !divSyncIconTag.hasClass( 'detailViewCase' ) )
                {
                    // Display the popup
                    me.bottomMsgShow( statusVal, activityJson, activityCardDivTag );

                    // NOTE: STATUS CHANGED!!!!
                    // If submitted with msg one, mark it as 'read' and rerender the activity Div.
                    if ( statusVal === Constants.status_submit_wMsg )        
                    {
                        // TODO: Should create a history...
                        ActivityDataManager.activityUpdate_Status( activityId, Constants.status_submit_wMsgRead );                        
                    }
                }
            }
        });  
    };


    me.setupPhoneCallBtn = function( divPhoneCallTag, activityId )
    {        
        var clientObj = ClientDataManager.getClientByActivityId( activityId );

        divPhoneCallTag.empty();

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
    };


    me.displayActivitySyncStatus = function( statusVal, divSyncStatusTextTag, divSyncIconTag )
    {
        // reset..
        divSyncIconTag.empty();
        divSyncStatusTextTag.empty();

        var imgIcon = $( '<img>' );

        if ( statusVal === Constants.status_submit )        
        {
            // already sync..
            divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync' ).attr( 'term', 'activitycard_status_sync' );
            imgIcon.attr( 'src', 'images/sync.svg' ); //sync.svg //divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
        }
        else if ( statusVal === Constants.status_submit_wMsg )        
        {
            // already sync..
            divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync/Msg*' );
            imgIcon.attr( 'src', 'images/sync_msd.svg' ); 
        }
        else if ( statusVal === Constants.status_submit_wMsgRead )        
        {
            // already sync..
            divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Sync/Msg' );
            imgIcon.attr( 'src', 'images/sync_msdr.svg' );
        }
        else if ( statusVal === Constants.status_downloaded )        
        {
            // already sync..
            divSyncStatusTextTag.css( 'color', '#2aad5c' ).html( 'Downloaded' ).attr( 'term', 'activitycard_status_downloaded' );
            imgIcon.attr( 'src', 'images/sync.svg' ); //sync.svg //divSyncIconTag.css( 'background-image', 'url(images/sync.svg)' );
        }
        else if ( statusVal === Constants.status_queued )
        {
            divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Pending' ).attr( 'term', 'activitycard_status_pending' );
            imgIcon.attr( 'src', 'images/sync-pending_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-pending_36.svg)' );
        }
        else if ( statusVal === Constants.status_processing )
        {
            divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Processing' ).attr( 'term', 'activitycard_status_processing' );
            imgIcon.attr( 'src', 'images/sync-pending_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-pending_36.svg)' );    

            // NOTE: We are rotating if in 'processing' status!!!
            FormUtil.rotateTag( divSyncIconTag, true );
        }        
        else if ( statusVal === Constants.status_failed )
        {
            // Not closed status, yet
            divSyncStatusTextTag.css( 'color', '#FF0000' ).html( 'Failed' ).attr( 'term', 'activitycard_status_failed' );
            imgIcon.attr( 'src', 'images/sync-postponed_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-postponed_36.svg)' );
        }
        else if ( statusVal === Constants.status_error )
        {
            divSyncStatusTextTag.css( 'color', '#FF0000' ).html( 'Error' );
            imgIcon.attr( 'src', 'images/sync-error_36.svg' ); //divSyncIconTag.css( 'background-image', 'url(images/sync-error_36.svg)' );
        }

        divSyncIconTag.append( imgIcon );


        // If the SyncUp is in Cooldown time range, display the FadeIn UI with left time
        if ( SyncManagerNew.isSyncReadyStatus( statusVal ) ) me.syncUpCoolDownTime_CheckNProgressSet( divSyncIconTag );
    };
    

    // Wrapper to call displayActivitySyncStatus with fewer parameters
    me.displayActivitySyncStatus_Wrapper = function( activityJson, activityCardDivTag )
    {
        //var activityCardDivTag = me.getActivityCardDivTag();
        if ( activityCardDivTag && activityCardDivTag.length > 0 )
        {
            var divSyncIconTag = activityCardDivTag.find( '.activityStatusIcon' );
            var divSyncStatusTextTag = activityCardDivTag.find( '.activityStatusText' );
            
            var statusVal = ( activityJson && activityJson.processing ) ? activityJson.processing.status: '';
    
            me.displayActivitySyncStatus( statusVal, divSyncStatusTextTag, divSyncIconTag ); 
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

    
    me.bottomMsgShow = function( statusVal, activityJson, activityCardDivTag )
    {
        // If 'activityCardDivTag ref is not workign with fresh data, we might want to get it by activityId..
        MsgAreaBottom.setMsgAreaBottom( function( syncInfoAreaTag ) 
        {
            me.syncResultMsg_header( syncInfoAreaTag, activityCardDivTag );
            me.syncResultMsg_content( syncInfoAreaTag, activityCardDivTag, activityJson, statusVal );
        });
    };

    me.syncResultMsg_header = function( syncInfoAreaTag, activityCardDivTag )
    {        
        var divHeaderTag = syncInfoAreaTag.find( 'div.msgHeader' );
        var statusLabel = activityCardDivTag.find( 'div.activityStatusText' ).text();

        var syncMsg_HeaderPartTag = $( Templates.syncMsg_Header );
        syncMsg_HeaderPartTag.find( '.msgHeaderLabel' ).text = statusLabel;

        divHeaderTag.html( syncMsg_HeaderPartTag );
    };


    me.syncResultMsg_content = function( syncInfoAreaTag, activityCardDivTag, activityJson, statusVal )
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
                //var historyList_Sorted = Util.sortByKey_Reverse( activityJson.processing.history, "dateTime" );
                var latestItem = historyList[ historyList.length - 1];    
                var msgSectionTag = $( Templates.msgSection );
    
                msgSectionTag.find( 'div.msgSectionTitle' ).text( 'Response code: ' + Util.getStr( latestItem.responseCode ) );

                var formattedMsg = me.getMsgFormatted( latestItem.msg, statusVal );
                msgSectionTag.find( 'div.msgSectionLog' ).text( formattedMsg );
    
                divBottomTag.append( msgSectionTag );
            }        
        }, "syncResultMsg_content, activity processing history lookup" );
    };


    me.getMsgFormatted = function( msg, statusVal )
    {
        var formattedMsg = '';

        if ( msg )
        {
            if ( statusVal === Constants.status_error || statusVal === Constants.status_failed ) 
            {
                if ( msg.indexOf( 'Value is not valid' ) >= 0 ) formattedMsg = 'One of the field has not acceptable value.';
                else if ( msg.indexOf( 'not a valid' ) >= 0 ) formattedMsg = 'One of the field has wrong Dhis2 Uid in the country setting.';
                else if ( msg.indexOf( 'Voucher not in Issue status' ) >= 0 ) formattedMsg = 'The voucher is not in issue status.';
                else if ( msg.indexOf( 'Repeat Fail Marked as ERROR' ) >= 0 ) formattedMsg = 'Marked as error status due to more than 10 failure in sync attempts.';
                else if ( msg.indexOf( 'Multiple vouchers with the code exists' ) >= 0 ) formattedMsg = 'Found multiple vouchers with the voucherCode.';
                else
                {
                    if ( msg.length > 140 ) formattedMsg = msg.substr( 0, 70 ) + '....' + msg.substr( msg.length - 71, 70 );
                    else formattedMsg = msg;
                }
            }   
            else formattedMsg = Util.getStr( msg, 200 );
        }

        return formattedMsg;
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

    me.reRenderActivityDiv = function()
    {
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
        var syncIconTag = me.getSyncButtonDivTag( activityId );
        //syncIconTag.attr( 'tmpactid', me.activityId ); // Temp debugging id add

        try
        {
            activityJson_Orig = ActivityDataManager.getActivityById( activityId );

            if ( !activityJson_Orig.processing ) throw 'Activity.performSyncUp, activity.processing not available';
            if ( !activityJson_Orig.processing.url ) throw 'Activity.performSyncUp, activity.processing.url not available';

            var mockResponseJson = ConfigManager.getMockResponseJson( activityJson_Orig.processing.useMockResponse );


            // NOTE: On 'afterDoneCall', 'reRenderActivityDiv()' gets used to reRender of activity.  
            //  'displayActivitySyncStatus_Wrapper()' gets used to refresh status only. 'displayActivitySyncStatus()' also has 'FormUtil.rotateTag()' in it.
            //  Probably do not need to save data here.  All the error / success case probably are covered and saves data afterwards.
            activityJson_Orig.processing.status = Constants.status_processing;
            activityJson_Orig.processing.syncUpCount = Util.getNumber( activityJson_Orig.processing.syncUpCount ) + 1;

            me.displayActivitySyncStatus_Wrapper( activityJson_Orig, me.getActivityCardDivTag() );

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
            ClientDataManager.saveCurrent_ClientsStore();

            me.displayActivitySyncStatus_Wrapper( activityJson_Orig, me.getActivityCardDivTag() );

            afterDoneCall( false, errMsg );
        }
    };

    // ----------------------------------------------
    // -- CoolDown 
    me.syncUpCoolDownTime_CheckNProgressSet = function( syncIconDivTag )
    {
        var activityId = me.activityId;

        // Unwrap previous one 1st..
        me.clearCoolDownWrap( syncIconDivTag );

        ActivityDataManager.checkActivityCoolDown( activityId, function( timeRemainMs ) 
        {            
            //var syncIconTag = me.getSyncButtonDivTag( activityId );
            if ( syncIconDivTag.length > 0 && timeRemainMs > 0 )
            {
                // New one can be called here..
                me.syncUpCoolDownTime_disableUI2( activityId, syncIconDivTag, timeRemainMs );
                // me.syncUpCoolDownTime_disableUI( activityId, syncIconDivTag, timeRemainMs );
            }
        });
    };

    me.syncUpCoolDownTime_disableUI = function( activityId, syncIconDivTag, timeRemainMs )
    {
        ActivityDataManager.clearSyncUpCoolDown_TimeOutId( activityId );

        syncIconDivTag.addClass( 'syncUpCoolDown' );

        var timeOutId = setTimeout( function() {

            // TODO: This sometimes does not work - if the tag is re-rendered..  <-- get class instead..
            syncIconDivTag.removeClass( 'syncUpCoolDown' );
        }, timeRemainMs );

        ActivityDataManager.setSyncUpCoolDown_TimeOutId( activityId, timeOutId );
    };


    me.syncUpCoolDownTime_disableUI2 = function( activityId, syncIconDivTag, timeRemainMs )
    {
        // Set CoolDown UI (Tags) & related valriable for 'interval' to use.

        syncIconDivTag.addClass( 'syncUpCoolDown' );
        var imgTag = syncIconDivTag.find( 'img' );
        imgTag.wrap( '<div class="myBar" style="position: absolute; background-color: lightGray;"></div>' );

        var myBarTag = syncIconDivTag.find( '.myBar' );        
        var fullWidthSize = syncIconDivTag.width();
        var coolDownTime = ConfigManager.coolDownTime;
        
        myBarTag.width( me.getPercentageWidth( timeRemainMs, coolDownTime, fullWidthSize ) );


        // Interval..
        var intervalId = setInterval( function() 
        {
            var myBarTag = syncIconDivTag.find( '.myBar' );

            if ( myBarTag.length === 0 ) 
            {
                clearInterval( intervalId );
                syncIconDivTag.removeClass( 'syncUpCoolDown' );
            } 
            else
            {
                timeRemainMs -= me.coolDownMoveRate;
                
                if ( timeRemainMs <= 0 ) // or check perc..
                {
                    clearInterval( intervalId );
                    me.clearCoolDownWrap( syncIconDivTag ); // imgTag.unwrap();
                }
                else 
                {
                    myBarTag.width( me.getPercentageWidth( timeRemainMs, coolDownTime, fullWidthSize ) );
                }
            }

        }, me.coolDownMoveRate );  // update refresh rate
    };


    // NOTE: Use Div width changes by time..
    // http://ww2.cs.fsu.edu/~faizian/cgs3066/resources/Lecture12-Animating%20Elements%20in%20Javascript.pdf
    me.clearCoolDownWrap = function( syncIconDivTag ) // pass id instead?  
    {
        if ( syncIconDivTag.length > 0 )
        {
            syncIconDivTag.removeClass( 'syncUpCoolDown' );

            var imgTag = syncIconDivTag.find( 'img' );
            if ( imgTag.length > 0 && imgTag.parent( '.myBar' ).length > 0 ) imgTag.unwrap();
        }
    };


    me.getPercentageWidth = function( timeRemainMs, coolDownTime, fullWidthSize )
    {
        var perc = ( timeRemainMs / coolDownTime );
        var width = ( fullWidthSize * perc ).toFixed( 1 );
        //console.log( 'width: ' + width + ', timeRemainMs: ' + timeRemainMs );
        return width;
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
                me.displayActivitySyncStatus_Wrapper( newActivityJson, me.getActivityCardDivTag() );

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

            afterDoneCall( success );
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
                ClientDataManager.setActivityDateLocal_client( clientJson );


                // If this is 'fixActivityCase' request success result, remove the flag on 'processing' & delete the record in database.
                if ( processingInfo.fixActivityCase )
                {
                    delete processingInfo.fixActivityCase;
                    me.deleteFixActivityRecord( activityId );
                }

                // TODO: NOTE!!  COMPLECATED MERGING AND SYNC UP CASES!!
                // We usually have to delete App version activity at this point!!!! - since the merge only takes in the new activity.
                // But have the merge take care of this!!

                //else throw "ERROR, Downloaded activity does not contain 'id'.";

                // Removal of existing activity/client happends within 'mergeDownloadClients()'
                ClientDataManager.mergeDownloadedClients( { 'clients': [ clientJson ], 'case': 'syncUpActivity', 'syncUpActivityId': activityId }, processingInfo, function() 
                {
                    // 'mergeDownload' does saving if there were changes..
                    ClientDataManager.saveCurrent_ClientsStore();

                    if ( callBack ) callBack( operationSuccess );
                });
            }
            else
            {
                var errMsg = 'No matching activity with id, ' + activityId + ', found on result.client.';
                var errStatusCode = 400;
    
                // 'syncedUp' processing data                
                var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_failed, errStatusCode, 'ErrMsg: ' + errMsg );
                ActivityDataManager.insertToProcessing( activityJson_Orig, processingInfo );

                ClientDataManager.saveCurrent_ClientsStore();                                      

                // Add activityJson processing
                if ( callBack ) callBack( operationSuccess, errMsg );
            }
            
        }
        else
        {
            var errMsg = 'Error Msg: ';
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

            ClientDataManager.saveCurrent_ClientsStore();                                      

            // Add activityJson processing
            if ( callBack ) callBack( operationSuccess, errMsg );
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

    me.showFullPreview = function( activityId, activityContainerTag )
    {
        if ( activityId ) 
        {
            // initialize
            var sheetFull = $( '#fullScreenPreview' );

            // populate template
            sheetFull.html( $( Templates.activityCardFullScreen ) );

            // If devMode, show Dev tab (primary) + li ones (2ndary <-- smaller screen hidden li)
            if ( DevHelper.devMode )
            {
                me.setUpActivityDetailTabDev( sheetFull, activityId );
            } 

            // create tab click events
            FormUtil.setUpEntryTabClick( sheetFull.find( '.tab_fs' ) ); 
        
            // ADD TEST/DUMMY VALUE
            sheetFull.find( '.activity' ).attr( 'itemid', activityId )
            

            // Header content set
            var actCard = new ClientCard( activityId, me.cwsRenderObj
                , { 'parentTag_Override': sheetFull, 'disableClicks': true } );
            actCard.render();

            // set tabs contents
            me.setFullPreviewTabContent( activityId, sheetFull );
        
            // set other events
            var cardCloseTag = sheetFull.find( 'img.btnBack' );
        
            cardCloseTag.off( 'click' ).click( function(){ 
                sheetFull.empty();
                sheetFull.fadeOut();
                //$( '#pageDiv' ).show();
            });
        
        
            // render
            sheetFull.fadeIn();

// NEW: PREVIEW STYLE CHANGES
            sheetFull.find( '.tab_fs__container' ).css( '--width', sheetFull.find( '.tab_fs__container' ).css( 'width' ) );
        
            //$( '#pageDiv' ).hide();

            TranslationManager.translatePage();            
        }
    };
    
    me.setUpActivityDetailTabDev = function( sheetFullTag, activityId )
    {
        sheetFullTag.find( 'li.primary[rel="tab_optionalDev"]' ).attr( 'style', '' );
        sheetFullTag.find( 'li.2ndary[rel="tab_optionalDev"]' ).removeClass( 'tabHide' );

        var statusSelTag = sheetFullTag.find( '.devActivityStatusSel' );
        var statusSelResultTag = sheetFullTag.find( '.devActivityStatusResult' );

        statusSelTag.change( function() 
        {
            var statusVal = $( this ).val();

            ActivityDataManager.activityUpdate_Status( activityId, statusVal, function() 
            {
                var msg = "With 'DEV' mode, activity status has been manually changed to '" + statusVal + "'";

                statusSelResultTag.text( msg );
                ActivityDataManager.activityUpdate_History( activityId, statusVal, msg, 0 );                         
            });
        });
    };


    me.setFullPreviewTabContent = function( activityId, sheetFull )
    {
        var clientObj = ClientDataManager.getClientByActivityId( activityId );
        var activityJson = ActivityDataManager.getActivityById( activityId );
    
        var arrDetails = [];
    
        // 1 clientDetails properties = key
        for ( var key in clientObj.clientDetails ) 
        {
            arrDetails.push( { 'name': key, 'value': me.getFieldOption_LookupValue( key, clientObj.clientDetails[ key ] ) } );
        }

        var clientDetailsTabTag = $( '[tabButtonId=tab_previewDetails]' );
        var titleTag = $( '<label term="activityDetail_details_title">clientDetails:</label>' );

        clientDetailsTabTag.html( FormUtil.displayData_Array( titleTag, arrDetails, 'clientDetail' ) ); //activityListPreviewTable
    
        // 2. payload Preview
        var jv_payload = new JSONViewer();
        $( '[tabButtonId=tab_previewPayload]' ).find(".payloadData").append( jv_payload.getContainer() );
        jv_payload.showJSON( activityJson );
    

        // 3. sync History
        var syncHistoryTag = $( '[tabButtonId=tab_previewSync]' ).html( JsonBuiltTable.buildTable( activityJson.processing.history ) );
        syncHistoryTag.find( '.bt_td_head' ).filter( function( i, tag ) { return ( $( tag ).html() === 'responseCode' ); } ).html( 'response code' );
        
        // Set event for "Remove" button for "Pending" client
        var activity = ActivityDataManager.getActivityById( activityId );
        var removeActivityBtn = sheetFull.find("#removeActivity");
        if (activity.processing.status == Constants.status_queued || activity.processing.status == Constants.status_failed )
        {
            removeActivityBtn.click( function()
            {    
                var result = confirm("Are you sure you want to delete this activity?");
                if( result )
                {                    
                    me.removeActivityNCard( activityId, sheetFull.find( 'img.btnBack' ) );
                }               
            });
        }
        else
        {
            removeActivityBtn.remove();
        }
    };    
    
    me.getFieldOption_LookupValue = function( key, val )
    {
        var fieldOptions = me.getFieldOptions( key );
        var retValue = val;

        // If the field is in 'definitionFields' & the field def has 'options' name, get the option val.
        try
        {
            if ( fieldOptions )
            {
                var matchingOption = Util.getFromList( fieldOptions, val, "value" );
    
                if ( matchingOption )
                {
                    retValue = ( matchingOption.term ) ? TranslationManager.translateText( matchingOption.defaultName, matchingOption.term ) : matchingOption.defaultName;
                }
            }    
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR in AcitivityCard.getFieldOptionLookupValue, errMsg: ' + errMsg );
        }

        //console.log( key + ': ' + retValue + ' (' + val + ')' );
        return retValue;
    };

    me.getFieldOptions = function( fieldId )
    {
        var defFields = ConfigManager.getConfigJson().definitionFields;
        var defOptions = ConfigManager.getConfigJson().definitionOptions;

        var matchingOptions;
        var optionsName;

        // 1. Check if the field is defined in definitionFields & has 'options' field for optionsName used.
        if ( defFields )
        {
			var matchField = Util.getFromList( defFields, fieldId, "id" );

            if ( matchField && matchField.options )
            {
               optionsName =  matchField.options;
            }
        }

        // 2. Get options by name.
        if ( optionsName && defOptions )
        {
            matchingOptions = defOptions[ optionsName ];
        }

        return matchingOptions;
    };

    me.removeActivityNCard = function( activityId, btnBackTag )
    {
        ActivityDataManager.removeTempClient_Activity( activityId );

        //var client = ClientDataManager.getClientByActivityId( activityId );
        //ClientDataManager.removeClient( client );

        ClientDataManager.saveCurrent_ClientsStore( function()
        {
            $( '#pageDiv' ).find("[itemid='" + activityId + "']").remove();
            btnBackTag.click();
        });
    };

    // =============================================
	// === Activity 'EDIT' Form - Related Methods ========================

    me.setUpEditPayloadLoadBtn = function( activityEditPaylayLoadBtnTag, activityJson )
    {
        try
        {
            if( activityJson )
            {
                var statusVal = ( activityJson.processing ) ? activityJson.processing.status: '';
                var editReadyStatus = ( statusVal === Constants.status_error );  // SyncManagerNew.isSyncReadyStatus( statusVal ) ||
        
                //if ( DevHelper.devMode && editReadyStatus && activityJson.processing.form )
                if ( editReadyStatus && activityJson.processing.form )
                {
                    activityEditPaylayLoadBtnTag.show();
                    var editForm = activityJson.processing.form;
        
                    activityEditPaylayLoadBtnTag.off( 'click' ).click( function( e ) 
                    {
                        var blockJson = FormUtil.getObjFromDefinition( editForm.blockId, ConfigManager.getConfigJson().definitionBlocks );
        
                        if( blockJson )
                        {
                            var activityCardDivTag = activityEditPaylayLoadBtnTag.parent();
                            var payloadTag = activityCardDivTag.find(".payloadData");                    
                            var editFormTag = activityCardDivTag.find(".editForm");                    
                            
                            activityEditPaylayLoadBtnTag.hide();
                            payloadTag.hide();
                            editFormTag.show();

                            var passedData = { 'showCase': editForm.showCase, 'hideCase': editForm.hideCase };

                            var newBlockObj = new Block( me.cwsRenderObj, blockJson, editForm.blockId, editFormTag, passedData, undefined, undefined );
                            newBlockObj.render( 'blockList' );

                            if ( activityJson )
                            {
                                // Populate data in the form
                                var formTag = $("[blockId='" + editForm.blockId + "']");

                                // TODO: Do we get this on processing?  <-- means, users can only edit the not synced ones!!!
                                var data = editForm.data;

                                if ( data )
                                {
                                    for( var i in data )
                                    {
                                        var fieldName = data[i].name;
                                        var value = data[i].value;
                                        var displayValue = data[i].displayValue;
            
                                        var divFieldTag = formTag.find( "[name='" + fieldName + "']" ).parent();
                                        FormUtil.setTagVal( divFieldTag.find(".displayValue"), displayValue );
                                        FormUtil.setTagVal( formTag.find( "[name='displayValue_" + fieldName + "']" ), displayValue );
            
                                        FormUtil.setTagVal( divFieldTag.find(".dataValue"), value );
                                        divFieldTag.find(".dataValue").change();
                                    }    
                                }
                            }
                            // else
                            // {
                            //     FormUtil.block_payloadConfig = ''; // ??
                            // }

                            formTag.append("<input type='hidden' id='editModeActivityId' value='" + activityJson.id + "'>");
                        }
                        else
                        {
                            alert("Cannot find block with id '" + editForm.blockId + "'");
                        }
                        
                    });
                }
                else activityEditPaylayLoadBtnTag.hide();    
            }
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR in ActivityCard.setUpEditPayloadLoadBtn, errMsg: ' + errMsg );
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
        if ( btnTag.length > 0 )
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

