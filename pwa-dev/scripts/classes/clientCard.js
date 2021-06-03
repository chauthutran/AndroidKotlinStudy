// -------------------------------------------
// -- ClientCard Class/Methods
//      - Mainly used for syncManager run one activity item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where activity items are processed (in sync)
//              without being displayed on the app list.  
//
function ClientCard( clientId, cwsRenderObj, options )
{
	var me = this;

    me.clientId = clientId;
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
        var clientCardDivTag = me.getClientCardDivTag();

        // If tag has been created), perform render
        if ( clientCardDivTag.length > 0 )
        {
            var clientJson = ClientDataManager.getClientById( me.clientId );
            var clickEnable = ( me.options.disableClicks ) ? false: true;  // Used for detailed view popup - which reuses 'render' method.

            try
            {
                var activityContainerTag = clientCardDivTag.find( '.activityContainer' );
                var activityTypeIconTag = clientCardDivTag.find( '.activityIcon' );
                var activityContentTag = clientCardDivTag.find( '.activityContent' );
                var activityRerenderTag = clientCardDivTag.find( '.activityRerender' );
                var activityPhoneCallTag = clientCardDivTag.find( '.activityPhone' );

                var activityEditPaylayLoadBtnTag = clientCardDivTag.find( '#editPaylayLoadBtn' );


                // 1. activityType (Icon) display (LEFT SIDE)
                //me.activityTypeDisplay( activityTypeIconTag, clientJson );
                //if ( clickEnable ) me.activityIconClick_displayInfo( activityTypeIconTag, clientJson );


                // 2. previewText/main body display (MIDDLE)
                me.setClientContentDisplay( activityContentTag, clientJson );

                //if ( clickEnable ) me.activityContentClick_FullView( activityContentTag, activityContainerTag, clientJson.id );


                // 3. 'SyncUp' Button Related
                // click event - for activitySubmit.., icon/text populate..
                //me.setupSyncBtn( clientCardDivTag, clientJson, !clickEnable );  // clickEnable - not checked for SyncBtn/Icon

                // 4. 'phoneNumber' action  button setup
                //me.setupPhoneCallBtn( activityPhoneCallTag, me.clientId );

                // 5. clickable rerender setup
                //me.setUpReRenderByClick( activityRerenderTag );

                // Set up "editPaylayLoadBtn"
                //me.setUpEditPayloadLoadBtn( activityEditPaylayLoadBtnTag, clientJson );
            }
            catch( errMsg )
            {
                console.customLog( 'Error on ClientCard.render, errMsg: ' + errMsg );
            }
        }
    };

    // -----------------------------------------------------

    me.getClientCardDivTag = function()
    {
        if ( me.options.parentTag_Override )
        {
            return me.options.parentTag_Override.find( '.activity[itemid="' + me.clientId + '"]' );
        }
        else
        {
            return $( '.activity[itemid="' + me.clientId + '"]' );
        }
    };


    me.getSyncButtonDivTag = function( clientId )
    {
        var activityCardTags = ( clientId ) ? $( '.activity[itemid="' + clientId + '"]' ) : me.getClientCardDivTag();

        return activityCardTags.find( '.activityStatusIcon' );
    };

    // -----------------------------------------------------

    me.activityIconClick_displayInfo = function( activityIconTag, clientJson )
    {
        activityIconTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..
            console.log( clientJson );
        });
    };

    me.activityContentClick_FullView = function( activityContentTag, activityContainerTag, clientId )
    {
        activityContentTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();
            me.showFullPreview( clientId, activityContainerTag );            
        });
    };

    
    me.setupSyncBtn = function( clientCardDivTag, clientJson, detailViewCase )
    {
        var divSyncIconTag = clientCardDivTag.find( '.activityStatusIcon' );
        var divSyncStatusTextTag = clientCardDivTag.find( '.activityStatusText' );
        var statusVal = ( clientJson.processing ) ? clientJson.processing.status: '';

        // if 'detailView' mode, the bottom message should not show..
        if ( detailViewCase ) divSyncIconTag.addClass( 'detailViewCase' );

        me.displayActivitySyncStatus( statusVal, divSyncStatusTextTag, divSyncIconTag, clientJson );

        me.setSyncIconClickEvent( divSyncIconTag, clientCardDivTag, clientJson.id ); //me.clientId );   
    };


    me.setSyncIconClickEvent = function( divSyncIconTag, clientCardDivTag, clientId )
    {
        divSyncIconTag.off( 'click' ).on( 'click', function( e ) 
        {
            // This could be called again after clientJson/status is changed, thus, get everything again from clientId
            e.stopPropagation();  // Stops calling parent tags event calls..

            var clientJson = ActivityDataManager.getActivityById( clientId );
            var statusVal = ( clientJson.processing ) ? clientJson.processing.status: '';
            
            // NOTE:
            //  - If status is not syncable one, display bottom message
            //  - If offline, display the message about it.
            if ( SyncManagerNew.isSyncReadyStatus( statusVal ) )
            {
                // If Sync Btn is clicked while in coolDown mode, display msg...  Should be changed..
                ActivityDataManager.checkActivityCoolDown( clientId, function( timeRemainMs )
                {         
                    // Display Left Msg <-- Do not need if?                          
                    var leftSec = Util.getSecFromMiliSec( timeRemainMs );
                    var coolTime = UtilDate.getSecFromMiliSec( ConfigManager.coolDownTime );
                    MsgManager.msgAreaShow( '<span term="' + ConfigManager.getSettingsTermId( "coolDownMsgTerm" ) + '">In coolDown mode, left: </span>' + '<span>' + leftSec + 's / ' + coolTime + 's' + '</span>' ); 

                }, function() 
                {
                    // Main SyncUp Processing --> Calls 'activityCard.performSyncUp' eventually.
                    if ( ConnManagerNew.isAppMode_Online() ) SyncManagerNew.syncUpActivity( clientId );
                    else MsgManager.msgAreaShow( 'Sync is not available with offline AppMode..' );
                });
            }  
            else 
            {
                if ( !divSyncIconTag.hasClass( 'detailViewCase' ) )
                {
                    // Display the popup
                    me.bottomMsgShow( statusVal, clientJson, clientCardDivTag );

                    // NOTE: STATUS CHANGED!!!!
                    // If submitted with msg one, mark it as 'read' and rerender the activity Div.
                    if ( statusVal === Constants.status_submit_wMsg )        
                    {
                        // TODO: Should create a history...
                        ActivityDataManager.activityUpdate_Status( clientId, Constants.status_submit_wMsgRead );                        
                    }
                }
            }
        });  
    };


    me.setupPhoneCallBtn = function( divPhoneCallTag, clientId )
    {        
        var clientObj = ClientDataManager.getClientByActivityId( clientId );

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
    me.displayActivitySyncStatus_Wrapper = function( clientJson, clientCardDivTag )
    {
        //var clientCardDivTag = me.getClientCardDivTag();
        if ( clientCardDivTag && clientCardDivTag.length > 0 )
        {
            var divSyncIconTag = clientCardDivTag.find( '.activityStatusIcon' );
            var divSyncStatusTextTag = clientCardDivTag.find( '.activityStatusText' );
            
            var statusVal = ( clientJson && clientJson.processing ) ? clientJson.processing.status: '';
    
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

    
    me.bottomMsgShow = function( statusVal, clientJson, clientCardDivTag )
    {
        // If 'clientCardDivTag ref is not workign with fresh data, we might want to get it by clientId..
        MsgAreaBottom.setMsgAreaBottom( function( syncInfoAreaTag ) 
        {
            me.syncResultMsg_header( syncInfoAreaTag, clientCardDivTag );
            me.syncResultMsg_content( syncInfoAreaTag, clientCardDivTag, clientJson, statusVal );
        });
    };

    me.syncResultMsg_header = function( syncInfoAreaTag, clientCardDivTag )
    {        
        var divHeaderTag = syncInfoAreaTag.find( 'div.msgHeader' );
        var statusLabel = clientCardDivTag.find( 'div.activityStatusText' ).text();

        var syncMsg_HeaderPartTag = $( Templates.syncMsg_Header );
        syncMsg_HeaderPartTag.find( '.msgHeaderLabel' ).text = statusLabel;

        divHeaderTag.html( syncMsg_HeaderPartTag );
    };


    me.syncResultMsg_content = function( syncInfoAreaTag, clientCardDivTag, clientJson, statusVal )
    {
        var divBottomTag = syncInfoAreaTag.find( 'div.msgContent' );
        divBottomTag.empty();

        // 1. ClientCard Info Add - From Activity Card Tag  
        divBottomTag.append( $( clientCardDivTag.parent().find( '[itemid=' + clientJson.id + ']' )[ 0 ].outerHTML ) ); // << was clientJson.clientId

        // 2. Add 'processing' sync message.. - last one?
        Util.tryCatchContinue( function() 
        {
            var historyList = clientJson.processing.history;

            if ( historyList.length > 0 )
            {
                //var historyList_Sorted = Util.sortByKey_Reverse( clientJson.processing.history, "dateTime" );
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


    me.setClientContentDisplay = function( divActivityContentTag, client )
    {
        try
        {
            var appendContent = '';

            //var activitySettings = ConfigManager.getActivityTypeConfig( activity );

            /*
            {  
                "name":"redeemVoucher",
                "term":"",
                "label":"redeemVoucher",
                "icon":{  
                   "path":"images/act_col.svg",
                   "colors":{  
                      "background":"#6FCF97",
                      "foreground":"#4F4F4F"
                   }
                },
                "displaySettings": [
                   "INFO.activity.type + ', voucherCode: ' + INFO.client.clientDetails.voucherCode"
                ],
                "previewData":[ "age phoneNumber", "voucherCode" ]
            }
            */

            // Choose to use generic display (Base/Settings) or activity display ones (if available).
            //var displayBase = ( activitySettings && activitySettings.displayBase ) ? activitySettings.displayBase : ConfigManager.getActivityDisplayBase();
            //var displaySettings = ( activitySettings && activitySettings.displaySettings ) ? activitySettings.displaySettings : ConfigManager.getActivityDisplaySettings();

            
            var displayBase = ConfigManager.getClientDisplayBase();
            var displaySettings = ConfigManager.getClientDisplaySettings();

            divActivityContentTag.find( 'div.activityContentDisplay' ).remove();
        
            InfoDataManager.setINFOdata( 'client', client );

            
            // Display 1st line - as date
            var displayBaseContent = Util.evalTryCatch( displayBase, InfoDataManager.getINFO(), 'ClientCard.setActivityContentDisplay, displayBase' );
            if ( displayBaseContent 
                && displayBaseContent.length 
                && displayBaseContent.trim().length ) divActivityContentTag.append( $( me.template_ActivityContentTextTag ).html( displayBaseContent ) );


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
                        var displayEvalResult = Util.evalTryCatch( dispSettingEvalStr, InfoDataManager.getINFO(), 'ClientCard.setActivityContentDisplay' );

                        if ( displayEvalResult 
                            && displayEvalResult.length 
                            && displayEvalResult.trim().length ) divActivityContentTag.append( $( me.template_ActivityContentTextTag ).html( displayEvalResult ) );
                    }
                }
            }
    
            //divActivityContentTag.append( $( me.template_ActivityContentDateTag ).html( appendContent ) );
        }
        catch ( errMsg )
        {
            console.customLog( 'ERROR in clientCard.setClientContentDisplay, errMsg: ' + errMsg );
        }
    };


    me.reRenderClientDiv = function()
    {
        // There are multiple places presenting same clientId info.
        // We can find them all and reRender their info..
        var clientCardTags = $( '.activity[itemid="' + me.clientId + '"]' );
        var reRenderClickDivTags = clientCardTags.find( 'div.activityRerender' );   
        
        reRenderClickDivTags.click();
    }
    
    // -------------------------------
    // --- Display Icon/Content related..
    
    me.syncUpStatusDisplay = function( clientCardDivTag, clientJson )
    {
        try
        {
            // 1. Does it find hte matching status?
            var activitySyncUpStatusConfig = ConfigManager.getActivitySyncUpStatusConfig( clientJson );
            if ( activitySyncUpStatusConfig ) clientCardDivTag.find( '.listItem_statusOption' ).html( activitySyncUpStatusConfig.label );

            me.setActivitySyncUpStatus( clientCardDivTag, clientJson.processing );
        }
        catch( errMsg )
        {
            console.customLog( 'Error on ClientCard.syncUpStatusDisplay, errMsg: ' + errMsg );
        }        
    };


    me.activityTypeDisplay = function( activityTypeIconTag, clientJson )
    {
        try
        {
            //var activityTypeConfig = ConfigManager.getActivityTypeConfig( clientJson );
    
            // SyncUp icon also gets displayed right below ActivityType (as part of activity type icon..)
            //var activitySyncUpStatusConfig = ConfigManager.getActivitySyncUpStatusConfig( clientJson );

        }
        catch( errMsg )
        {
            console.customLog( 'Error on ClientCard.activityTypeDisplay, errMsg: ' + errMsg );
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


    me.setActivitySyncUpStatus = function( clientCardDivTag, activityProcessing ) 
    {
        try
        {
            var imgSyncIconTag = clientCardDivTag.find( 'small.syncIcon img' );

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
            console.customLog( 'Error on ClientCard.setActivitySyncUpStatus, errMsg: ' + errMsg );
        }
    };


    me.highlightActivityDiv = function( bHighlight )
    {
        // If the activityTag is found on the list, highlight it during SyncAll processing.
        var activityDivTag = $( '.activity[itemid="' + me.clientId + '"]' );

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
        var clientJson_Orig;
        var clientId = me.clientId;
        var syncIconTag = me.getSyncButtonDivTag( clientId );
        //syncIconTag.attr( 'tmpactid', me.clientId ); // Temp debugging id add

        try
        {
            clientJson_Orig = ActivityDataManager.getActivityById( clientId );

            if ( !clientJson_Orig.processing ) throw 'Activity.performSyncUp, activity.processing not available';
            if ( !clientJson_Orig.processing.url ) throw 'Activity.performSyncUp, activity.processing.url not available';

            var mockResponseJson = ConfigManager.getMockResponseJson( clientJson_Orig.processing.useMockResponse );


            // NOTE: On 'afterDoneCall', 'reRenderActivityDiv()' gets used to reRender of activity.  
            //  'displayActivitySyncStatus_Wrapper()' gets used to refresh status only. 'displayActivitySyncStatus()' also has 'FormUtil.rotateTag()' in it.
            //  Probably do not need to save data here.  All the error / success case probably are covered and saves data afterwards.
            clientJson_Orig.processing.status = Constants.status_processing;
            clientJson_Orig.processing.syncUpCount = Util.getNumber( clientJson_Orig.processing.syncUpCount ) + 1;

            me.displayActivitySyncStatus_Wrapper( clientJson_Orig, me.getClientCardDivTag() );

            try
            {
                // Fake Test Response Json
                if ( mockResponseJson )
                {
                    WsCallManager.mockRequestCall( mockResponseJson, undefined, function( success, responseJson )
                    {
                        me.syncUpWsCall_ResultHandle( syncIconTag, clientJson_Orig, success, responseJson, afterDoneCall );
                    });
                }
                else
                {
                    var payload = ActivityDataManager.activityPayload_ConvertForWsSubmit( clientJson_Orig );

                    // NOTE: We need to add app timeout, from 'request'... and throw error...
                    WsCallManager.wsActionCall( clientJson_Orig.processing.url, payload, undefined, function( success, responseJson )
                    {
                        me.syncUpWsCall_ResultHandle( syncIconTag, clientJson_Orig, success, responseJson, afterDoneCall );
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
            ActivityDataManager.insertToProcessing( clientJson_Orig, processingInfo );
            ClientDataManager.saveCurrent_ClientsStore();

            me.displayActivitySyncStatus_Wrapper( clientJson_Orig, me.getClientCardDivTag() );

            afterDoneCall( false, errMsg );
        }
    };

    // ----------------------------------------------
    // -- CoolDown 
    me.syncUpCoolDownTime_CheckNProgressSet = function( syncIconDivTag )
    {
        var clientId = me.clientId;

        // Unwrap previous one 1st..
        me.clearCoolDownWrap( syncIconDivTag );

        ActivityDataManager.checkActivityCoolDown( clientId, function( timeRemainMs ) 
        {            
            //var syncIconTag = me.getSyncButtonDivTag( clientId );
            if ( syncIconDivTag.length > 0 && timeRemainMs > 0 )
            {
                // New one can be called here..
                me.syncUpCoolDownTime_disableUI2( clientId, syncIconDivTag, timeRemainMs );
                // me.syncUpCoolDownTime_disableUI( clientId, syncIconDivTag, timeRemainMs );
            }
        });
    };

    me.syncUpCoolDownTime_disableUI = function( clientId, syncIconDivTag, timeRemainMs )
    {
        ActivityDataManager.clearSyncUpCoolDown_TimeOutId( clientId );

        syncIconDivTag.addClass( 'syncUpCoolDown' );

        var timeOutId = setTimeout( function() {

            // TODO: This sometimes does not work - if the tag is re-rendered..  <-- get class instead..
            syncIconDivTag.removeClass( 'syncUpCoolDown' );
        }, timeRemainMs );

        ActivityDataManager.setSyncUpCoolDown_TimeOutId( clientId, timeOutId );
    };


    me.syncUpCoolDownTime_disableUI2 = function( clientId, syncIconDivTag, timeRemainMs )
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

    me.syncUpWsCall_ResultHandle = function( syncIconTag, clientJson_Orig, success, responseJson, afterDoneCall )
    {        
        var clientId = me.clientId;
        // Stop the Sync Icon rotation
        FormUtil.rotateTag( syncIconTag, false );

        // NOTE: 'clientJson_Orig' is used for failed case only.  If success, we create new activity

        // Based on response(success/fail), perform app/activity/client data change
        me.syncUpResponseHandle( clientJson_Orig, success, responseJson, function( success, errMsg ) 
        {
            // Updates UI & perform any followUp actions - 'responseCaseAction'

            // On failure, if the syncUpCount has rearched the limit, set the appropriate status.
            var newActivityJson = ActivityDataManager.getActivityById( clientId );
            // If 'syncUpResponse' changed status, make the UI applicable..
            //var newActivityJson = ActivityDataManager.getActivityById( clientId );

            if ( newActivityJson )
            {
                me.displayActivitySyncStatus_Wrapper( newActivityJson, me.getClientCardDivTag() );

                // [*NEW] Process 'ResponseCaseAction' - responseJson.report - This changes activity status again if applicable
                if ( responseJson && responseJson.report ) 
                {
                    ActivityDataManager.processResponseCaseAction( responseJson.report, clientId );
                }    
            }
            else
            {
                throw 'FAILED to handle syncUp response, clientId lost: ' + clientId;
            }

            afterDoneCall( success );
        });   
    };

    // =============================================

    me.syncUpResponseHandle = function( clientJson_Orig, success, responseJson, callBack )
    {
        var operationSuccess = false;
        var clientId = me.clientId;

        // 1. Check success
        if ( success && responseJson && responseJson.result && responseJson.result.client )
        {
            var clientJson = ConfigManager.downloadedData_UidMapping( responseJson.result.client );

            // #1. Check if current activity Id exists in 'result.client' activities..
            if ( clientJson.activities && Util.getFromList( clientJson.activities, clientId, "id" ) )
            {
                operationSuccess = true;

                // 'syncedUp' processing data - OPTIONALLY, We could preserve 'failed' history...
                var processingInfo = ActivityDataManager.createProcessingInfo_Success( Constants.status_submit, 'SyncedUp processed.', clientJson_Orig.processing );
                ClientDataManager.setActivityDateLocal_client( clientJson );


                // If this is 'fixActivityCase' request success result, remove the flag on 'processing' & delete the record in database.
                if ( processingInfo.fixActivityCase )
                {
                    delete processingInfo.fixActivityCase;
                    me.deleteFixActivityRecord( clientId );
                }

                // TODO: NOTE!!  COMPLECATED MERGING AND SYNC UP CASES!!
                // We usually have to delete App version activity at this point!!!! - since the merge only takes in the new activity.
                // But have the merge take care of this!!

                //else throw "ERROR, Downloaded activity does not contain 'id'.";

                // Removal of existing activity/client happends within 'mergeDownloadClients()'
                ClientDataManager.mergeDownloadedClients( { 'clients': [ clientJson ], 'case': 'syncUpActivity', 'syncUpActivityId': clientId }, processingInfo, function() 
                {
                    // 'mergeDownload' does saving if there were changes..
                    ClientDataManager.saveCurrent_ClientsStore();

                    if ( callBack ) callBack( operationSuccess );
                });
            }
            else
            {
                var errMsg = 'No matching activity with id, ' + clientId + ', found on result.client.';
                var errStatusCode = 400;
    
                // 'syncedUp' processing data                
                var processingInfo = ActivityDataManager.createProcessingInfo_Other( Constants.status_failed, errStatusCode, 'ErrMsg: ' + errMsg );
                ActivityDataManager.insertToProcessing( clientJson_Orig, processingInfo );

                ClientDataManager.saveCurrent_ClientsStore();                                      

                // Add clientJson processing
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
            ActivityDataManager.insertToProcessing( clientJson_Orig, processingInfo );

            ClientDataManager.saveCurrent_ClientsStore();                                      

            // Add clientJson processing
            if ( callBack ) callBack( operationSuccess, errMsg );
        } 
    };


    me.deleteFixActivityRecord = function( clientId )
	{
        try
        {
            //if ( fixedActivityList && fixedActivityList.length > 0 )
            var payloadJson = { 'find': { 'clientId': clientId } }; //{ '$in': fixedActivityList } } };

            WsCallManager.requestDWS_DELETE( WsCallManager.EndPoint_PWAFixActivitiesDEL, payloadJson, undefined, function() 
            {
                console.customLog( 'Deleted fixActivityRecord, clientId ' + clientId );
            });
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR during ClientCard.deleteFixActivityRecord(), clientId: ' + clientId + ', errMsg: ' + errMsg );
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
            console.customLog( 'ERROR during ClientCard.cleanUpErrJson, errMsg: ' + errMsg );
        }        
    };

    // remove this activity from list  (me.clientJson.id ) <-- from common client 
    // =============================================
	// === Full Detail Popup Related METHODS ========================

    me.setUpActivityDetailTabDev = function( sheetFullTag, clientId )
    {
        sheetFullTag.find( 'li.primary[rel="tab_optionalDev"]' ).attr( 'style', '' );
        sheetFullTag.find( 'li.2ndary[rel="tab_optionalDev"]' ).removeClass( 'tabHide' );

        var statusSelTag = sheetFullTag.find( '.devActivityStatusSel' );
        var statusSelResultTag = sheetFullTag.find( '.devActivityStatusResult' );

        statusSelTag.change( function() 
        {
            var statusVal = $( this ).val();

            ActivityDataManager.activityUpdate_Status( clientId, statusVal, function() 
            {
                var msg = "With 'DEV' mode, activity status has been manually changed to '" + statusVal + "'";

                statusSelResultTag.text( msg );
                ActivityDataManager.activityUpdate_History( clientId, statusVal, msg, 0 );                         
            });
        });
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

    me.removeActivityNCard = function( clientId, btnBackTag )
    {
        ActivityDataManager.removeTempClient_Activity( clientId );

        //var client = ClientDataManager.getClientByActivityId( clientId );
        //ClientDataManager.removeClient( client );

        ClientDataManager.saveCurrent_ClientsStore( function()
        {
            $( '#pageDiv' ).find("[itemid='" + clientId + "']").remove();
            btnBackTag.click();
        });
    };

    // =============================================
	// === Activity 'EDIT' Form - Related Methods ========================

    // =============================================
	// === Other Supporting METHODS ========================

    // Update ClientCard UI based on current activityItem data
    me.updateUI = function( divListItemTag, clientJson )
    {
        me.updateItem_UI_Button( divListItemTag.find( 'small.syncIcon img' ) );

        // PUT: Any other changes reflected on the ClientCard - by submit..
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

