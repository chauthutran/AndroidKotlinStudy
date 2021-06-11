
// -------------------------------------------
// -- ClientCard Class/Methods
//      - Mainly used for syncManager run one client item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where client items are processed (in sync)
//              without being displayed on the app list.  
//
function ClientCard( clientId, options )
{
	var me = this;

    me.clientId = clientId;
    me.options = ( options ) ? options : {};

    me.cardHighlightColor = '#fcffff'; // #fffff9
    me.coolDownMoveRate = 300; // 100 would move 10 times per sec..

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
                var clientContainerTag = clientCardDivTag.find( '.clientContainer' );
                var clientIconTag = clientCardDivTag.find( '.clientIcon' );
                var clientContentTag = clientCardDivTag.find( '.clientContent' );
                var clientRerenderTag = clientCardDivTag.find( '.clientRerender' );
                var clientPhoneCallTag = clientCardDivTag.find( '.clientPhone' );

                var clientEditPaylayLoadBtnTag = clientCardDivTag.find( '#editPaylayLoadBtn' );

                var lastActivityJson = me.getLastActivity( clientJson );


                // 1. clientType (Icon) display (LEFT SIDE)
                me.clientIconDisplay( clientIconTag, clientJson );
                //if ( clickEnable ) me.clientIconClick_displayInfo( clientIconTag, clientJson );


                // 2. previewText/main body display (MIDDLE)
                me.setClientContentDisplay( clientContentTag, clientJson );
                if ( clickEnable ) me.clientContentClick_FullView( clientContentTag, clientContainerTag, clientJson );


                // 3. 'SyncUp' Button Related
                // click event - for clientSubmit.., icon/text populate..
                me.setupSyncBtn( clientCardDivTag, lastActivityJson, !clickEnable );  // clickEnable - not checked for SyncBtn/Icon

                // 4. 'phoneNumber' action  button setup
                me.setupPhoneCallBtn( clientPhoneCallTag, clientJson );

                // 5. clickable rerender setup
                //me.setUpReRenderByClick( clientRerenderTag );

                // Set up "editPaylayLoadBtn"
                //me.setUpEditActivitiesLoadBtn( clientEditPaylayLoadBtnTag, clientJson );
            }
            catch( errMsg )
            {
                console.customLog( 'Error on ClientCard.render, errMsg: ' + errMsg );
            }
        }
    };

    
    me.setupSyncBtn = function( clientCardDivTag, activityJson, detailViewCase )
    {
        var divSyncIconTag = clientCardDivTag.find( '.activityStatusIcon' );
        var divSyncStatusTextTag = clientCardDivTag.find( '.activityStatusText' );
        var statusVal = ( activityJson.processing ) ? activityJson.processing.status : '';

        // if 'detailView' mode, the bottom message should not show..
        if ( detailViewCase ) divSyncIconTag.addClass( 'detailViewCase' );

        me.displayActivitySyncStatus( statusVal, divSyncStatusTextTag, divSyncIconTag, activityJson );

        //me.setSyncIconClickEvent( divSyncIconTag, clientCardDivTag, activityJson.id ); //me.activityId );   
    };


    me.getLastActivity = function( clientJson )
    {
        var lastActivityJson;

        try
        {
            if ( clientJson.activities.length > 0 )
            {
                // TODO: Need to sort by activity date?
                lastActivityJson = clientJson.activities[ clientJson.activities.length - 1 ];
            }
        }
        catch( errMsg )
        {
            console.log( 'ERROR in ClientCard.getLastActivity(), errMsg: ' + errMsg );
        }

        return lastActivityJson;
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
            imgIcon.attr( 'src', 'images/sync.svg' );
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
            imgIcon.attr( 'src', 'images/sync.svg' );
        }
        else if ( statusVal === Constants.status_queued )
        {
            divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Pending' ).attr( 'term', 'activitycard_status_pending' );
            imgIcon.attr( 'src', 'images/sync-pending_36.svg' );
        }
        else if ( statusVal === Constants.status_processing )
        {
            divSyncStatusTextTag.css( 'color', '#B1B1B1' ).html( 'Processing' ).attr( 'term', 'activitycard_status_processing' );
            imgIcon.attr( 'src', 'images/sync-pending_36.svg' );

            // NOTE: We are rotating if in 'processing' status!!!
            FormUtil.rotateTag( divSyncIconTag, true );
        }        
        else if ( statusVal === Constants.status_failed )
        {
            // Not closed status, yet
            divSyncStatusTextTag.css( 'color', '#FF0000' ).html( 'Failed' ).attr( 'term', 'activitycard_status_failed' );
            imgIcon.attr( 'src', 'images/sync-postponed_36.svg' );
        }
        else if ( statusVal === Constants.status_error )
        {
            divSyncStatusTextTag.css( 'color', '#FF0000' ).html( 'Error' );
            imgIcon.attr( 'src', 'images/sync-error_36.svg' );
        }

        divSyncIconTag.append( imgIcon );

        // If the SyncUp is in Cooldown time range, display the FadeIn UI with left time
        //if ( SyncManagerNew.isSyncReadyStatus( statusVal ) ) me.syncUpCoolDownTime_CheckNProgressSet( divSyncIconTag );
    };
    

    // ---------------------------------------

    me.generateCardTrTag = function( groupAttrVal )
    {        
        var clientCardTrTag = $( ClientCardTemplate.cardDivTag );

        clientCardTrTag.attr( 'itemId', me.clientId );

        clientCardTrTag.attr( 'group', groupAttrVal );

        return clientCardTrTag;
    };

    // -----------------------------------------------------

    me.getClientCardDivTag = function()
    {
        if ( me.options.parentTag_Override )
        {
            return me.options.parentTag_Override.find( '.client[itemid="' + me.clientId + '"]' );
        }
        else
        {
            return $( '.client[itemid="' + me.clientId + '"]' );
        }
    };


    me.getSyncButtonDivTag = function( clientId )
    {
        var clientCardTags = ( clientId ) ? $( '.client[itemid="' + clientId + '"]' ) : me.getClientCardDivTag();

        return clientCardTags.find( '.activityStatusIcon' );
    };

    // -----------------------------------------------------

    me.clientIconClick_displayInfo = function( clientIconTag, clientJson )
    {
        clientIconTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..
            console.log( clientJson );
        });
    };

    me.clientContentClick_FullView = function( clientContentTag, clientContainerTag, clientJson )
    {
        clientContentTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();
            me.showFullPreview( clientJson, clientContainerTag );            
        });
    };

    me.setClientContentDisplay = function( divClientContentTag, client )
    {
        try
        {
            var appendContent = '';
            
            var displayBase = ConfigManager.getClientDisplayBase();
            var displaySettings = ConfigManager.getClientDisplaySettings();

            divClientContentTag.find( 'div.clientContentDisplay' ).remove();
        
            InfoDataManager.setINFOdata( 'client', client );

            
            // Display 1st line - as date
            var displayBaseContent = Util.evalTryCatch( displayBase, InfoDataManager.getINFO(), 'ClientCard.setClientContentDisplay, displayBase' );
            if ( displayBaseContent 
                && displayBaseContent.length 
                && displayBaseContent.trim().length ) divClientContentTag.append( $( ClientCardTemplate.cardContentDivTag ).html( displayBaseContent ) );


            // Display 2nd lines and more
            if ( displaySettings )
            {            
                // If custom config display, remove 
                for( var i = 0; i < displaySettings.length; i++ )
                {
                    // Need 'client', 'clientTrans'
                    var dispSettingEvalStr = displaySettings[ i ].trim();

                    if ( dispSettingEvalStr )
                    {
                        var displayEvalResult = Util.evalTryCatch( dispSettingEvalStr, InfoDataManager.getINFO(), 'ClientCard.setClientContentDisplay' );

                        if ( displayEvalResult 
                            && displayEvalResult.length 
                            && displayEvalResult.trim().length ) divClientContentTag.append( $( ClientCardTemplate.cardContentDivTag ).html( displayEvalResult ) );
                    }
                }
            }
    
            //divClientContentTag.append( $( me.template_ClientContentDateTag ).html( appendContent ) );
        }
        catch ( errMsg )
        {
            console.customLog( 'ERROR in clientCard.setClientContentDisplay, errMsg: ' + errMsg );
        }
    };


    // -------------------------------
    // --- Display Icon/Content related..

    me.clientIconDisplay = function( clientIconTag, clientJson )
    {
        try
        {
            //<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:v="https://vecta.io/nano" viewBox="0 0 6.35 6.35" colors.background="#b2df8a" colors.foreground="#4F4F4F" style="opacity: 1;" width="100%" height="100%"><g xmlns="http://www.w3.org/2000/svg" transform="matrix(.333365 0 0 .333092 -2.211667 -97.578864)"><ellipse ry="7.943" rx="7.937" cy="302.481" cx="16.158" fill="#b2df8a" fill-rule="evenodd"></ellipse><g fill="#4F4F4F"><path d="M20.426 304.27a.15.15 0 0 0-.149.15v1.806a.88.88 0 0 1-.876.877h-6.236a.88.88 0 0 1-.876-.877V301.6a.15.15 0 0 0-.149-.15.15.15 0 0 0-.149.15v4.617c0 .648.527 1.176 1.175 1.176H19.4c.648 0 1.175-.528 1.175-1.176v-1.806a.15.15 0 0 0-.149-.15z"></path><path d="M19.4 297.196h-6.236c-.648 0-1.175.528-1.175 1.176v2.64a.15.15 0 0 0 .149.15.15.15 0 0 0 .149-.15v-2.64a.88.88 0 0 1 .876-.877H19.4a.88.88 0 0 1 .876.877v5.45a.15.15 0 0 0 .149.15.15.15 0 0 0 .149-.15v-5.45c0-.648-.527-1.176-1.175-1.176z"></path><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#B"></use><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#B" x="3.904"></use><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#B" y="2.672"></use><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#B" x="3.904" y="2.672"></use><path d="M14.33 304.283a1.09 1.09 0 0 0-1.086 1.087 1.09 1.09 0 0 0 1.086 1.087 1.09 1.09 0 0 0 1.086-1.087 1.09 1.09 0 0 0-1.086-1.087zm-.787 1.087a.79.79 0 0 1 .787-.787.78.78 0 0 1 .44.135L13.68 305.8c-.085-.126-.135-.278-.135-.44zm.787.787a.78.78 0 0 1-.44-.135l1.092-1.093c.085.126.135.278.135.44a.79.79 0 0 1-.787.788z"></path><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#B" x="3.904" y="5.343"></use><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#C"></use><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#C" x="2.672"></use><path d="M16.7 298.235a.15.15 0 0 0-.211.014c-.053.06-.132.095-.217.095s-.165-.035-.217-.095a.15.15 0 0 0-.211-.014.15.15 0 0 0-.014.211c.11.125.27.197.442.197s.333-.072.442-.197a.15.15 0 0 0-.014-.211z"></path></g></g><defs xmlns="http://www.w3.org/2000/svg"><path id="B" d="M14.33 298.94a1.09 1.09 0 0 0-1.086 1.087 1.09 1.09 0 0 0 1.086 1.087 1.09 1.09 0 0 0 1.086-1.087 1.09 1.09 0 0 0-1.086-1.087zm-.787 1.087a.79.79 0 0 1 .787-.787.78.78 0 0 1 .44.135l-1.092 1.093c-.085-.126-.135-.278-.135-.44zm.787.787a.78.78 0 0 1-.44-.135l1.092-1.093c.085.126.135.278.135.44a.79.79 0 0 1-.787.788z"></path><path id="C" d="M14.946 297.973a.15.15 0 0 0-.149.15v.242a.15.15 0 0 0 .149.15.15.15 0 0 0 .149-.15v-.242a.15.15 0 0 0-.149-.15z"></path></defs></svg>
            var iconName = ClientCardTemplate.cardIconTag.replace( '{NAME}', me.getNameSimbol( clientJson ) );

            var svgIconTag = $( iconName );

            clientIconTag.empty().append( svgIconTag );
        }
        catch( errMsg )
        {
            console.customLog( 'Error on ClientCard.clientTypeDisplay, errMsg: ' + errMsg );
        }        
    };                


    me.setupPhoneCallBtn = function( divPhoneCallTag, clientJson )
    {        
        divPhoneCallTag.empty();

        if ( clientJson.clientDetails && clientJson.clientDetails.phoneNumber )
        {
            var phoneNumber = Util.trim( clientJson.clientDetails.phoneNumber );

            if ( phoneNumber ) // && phoneNumber !== '+' )  <-- why '+' check?
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


    // ----------------------------

    me.getNameSimbol = function( clientJson )
    {
        var nameSimbol = '--';

        try
        {
            if ( clientJson && clientJson.clientDetails )
            {
                var cDetail = clientJson.clientDetails;
    
                if ( cDetail.firstName || cDetail.lastName )
                {
                    var firstNameSimbol = ( cDetail.firstName ) ? cDetail.firstName.charAt(0) : '-';
                    var lastNameSimbol = ( cDetail.lastName ) ? cDetail.lastName.charAt(0) : '-';
    
                    nameSimbol = firstNameSimbol + lastNameSimbol;
                }
            }    
        }
        catch( errMsg )
        {
            console.log( 'ERROR in ClientCard.getNameSimbol(), errMsg: ' + errMsg );
        }
        
        return nameSimbol;
    };


    me.highlightClientDiv = function( bHighlight )
    {
        // If the clientTag is found on the list, highlight it during SyncAll processing.
        var clientDivTag = $( '.client[itemid="' + me.clientId + '"]' );

        if ( clientDivTag.length > 0 )
        {
            if ( bHighlight ) clientDivTag.css( 'background-color', me.cardHighlightColor );
            else clientDivTag.css( 'background-color', '' );
        }
    }

    // -------------------------------

    // === Full Detail Popup Related METHODS ========================

    me.showFullPreview = function( clientJson, clientContainerTag )
    {
        if ( clientJson ) 
        {
            var clientId = clientJson._id;

            // initialize
            var sheetFull = $( '#clientDetail_FullScreen' );

            // populate template
            sheetFull.html( $( ClientCardTemplate.cardFullScreen ) );

            // create tab click events
            FormUtil.setUpEntryTabClick( sheetFull.find( '.tab_fs' ) ); 
        
            // ADD TEST/DUMMY VALUE
            sheetFull.find( '.client' ).attr( 'itemid', clientId )
            

            // Header content set
            var itemCard = new ClientCard( clientId,
                { 'parentTag_Override': sheetFull, 'disableClicks': true } 
            );
            itemCard.render();

            // set tabs contents
            me.setFullPreviewTabContent( clientJson, sheetFull );
        
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

            TranslationManager.translatePage();            
        }
    };

    me.setFullPreviewTabContent = function( clientJson, sheetFullTag )
    {
        //var clientJson = ActivityDataManager.getActivityById( clientId );
    
        var arrDetails = [];
    
        // #1 clientDetails properties = key
        for ( var key in clientJson.clientDetails ) 
        {
            arrDetails.push( { 'name': key, 'value': me.getFieldOption_LookupValue( key, clientJson.clientDetails[ key ] ) } );
        }

        var clientDetailsTabTag = sheetFullTag.find( '[tabButtonId=tab_clientDetails]' );
        var titleTag = $( '<label term="clientDetail_details_title">clientDetails:</label>' );

        clientDetailsTabTag.html( FormUtil.displayData_Array( titleTag, arrDetails, 'clientDetail' ) ); //clientListPreviewTable
    

        // #2. payload Preview

        // LIST ACTIVITIES... <-- LIST
        var listTableTbodyTag = sheetFullTag.find( '[tabButtonId=tab_clientActivities]' ).find( '.list' );
        
        me.populateActivityCardList( clientJson.activities, listTableTbodyTag );

        // #3. relationship?
    };    

    // ----------------------------------------------

    // TODO: THIS SHOULD BE MOVED TO 'Option' statis class.. part..
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

    // =============================================

    me.populateActivityCardList = function( activityList, listTableTbodyTag )
    {
        if ( activityList.length === 0 ) 
        {
        }
        else
        {
            //var listBottomDivTag = $( '.listBottom' );

            for( var i = 0; i < activityList.length; i++ )
            {
                var activityJson = activityList[i];

                var activityCardObj = me.createActivityCard( activityJson, listTableTbodyTag );

                activityCardObj.render();
            }    

            //listBottomDivTag.show().css( 'color', '#4753A3' ).text( ( currPosJson.endReached ) ? '[END]' : 'MORE' );

            TranslationManager.translatePage();
            //if ( scrollEndFunc ) scrollEndFunc();
        }
    };

    me.createActivityCard = function( activityJson, listTableTbodyTag )
    {
        var activityCardTrTag = $( ActivityCardTemplate.cardDivTag );

        activityCardTrTag.attr( 'itemId', activityJson.id );
        //activityCardTrTag.attr( 'group', groupAttrVal );

        listTableTbodyTag.append( activityCardTrTag );

        return new ActivityCard( activityJson.id );
    };


    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

};


function ClientCardTemplate() {};

ClientCardTemplate.cardContentDivTag = `<div class="clientContentDisplay card__row"></div>`;

ClientCardTemplate.cardDivTag = `<div class="client card">

    <div class="clientContainer card__container">

        <card__support_visuals class="clientIcon card__support_visuals" />

        <card__content class="clientContent card__content" style="color: #444; cursor: pointer;" title="Click for detail" />

        <card__cta class="clientStatus card__cta">
            <div class="activityStatusText card__cta_status"></div>
            <div class="clientPhone card__cta_one" style="cursor: pointer;"></div>
            <div class="activityStatusIcon card__cta_two" style="cursor:pointer;"></div>
        </card__cta>

        <div class="clientRerender" style="float: left; width: 1px; height: 1px;"></div>

    </div>

</div>`;

ClientCardTemplate.cardIconTag = `<svg xlink="http://www.w3.org/1999/xlink" width="50" height="50">
    <g id="UrTavla">
        <circle style="fill:url(#toning);stroke:#ccc;stroke-width:1;stroke-miterlimit:10;" cx="25" cy="25" r="23">
        </circle>
        <text x="50%" y="50%" text-anchor="middle" stroke="#ccc" stroke-width="1.5px" dy=".3em">{NAME}</text>
    </g>
</svg>`;


ClientCardTemplate.cardFullScreen = `<div class="wapper_card">

<div class="sheet-title c_900">
    <img src='images/arrow_back.svg' class='btnBack'>
    <span>Details</span>
</div>

<div class="card _tab client">
    <div class="card__container">
        <card__support_visuals class="clientIcon card__support_visuals" />
        <card__content class="clientContent card__content" />
        <card__cta class="clientStatus card__cta">
            <div class="activityStatusText card__cta_status" />
            <div class="clientPhone card__cta_one"></div>
            <div class="activityStatusIcon card__cta_two"></div>
        </card__cta>
    </div>

    <div class="tab_fs">

        <ul class="tab_fs__head" style="background-color: #fff;">

            <li class="primary active" rel="tab_clientDetails">
                <div class="tab_fs__head-icon i-details_24" rel="tab_clientDetails"></div>
                <span term="activityDetail_tab_details" rel="tab_clientDetails">Details</span>

                <ul class="2ndary" style="display: none; z-index: 1;">

                    <li class="2ndary" style="display:none" rel="tab_clientActivities">
                        <div class="tab_fs__head-icon i-payloads_24" rel="tab_clientActivities"></div>
                        <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activity</span>
                    </li>  

                    <li class="2ndary" style="display:none" rel="tab_relationships">
                        <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_relationships"></div>
                        <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                    </li>
      
                </ul>
            </li>

            <li class="primary" rel="tab_clientActivities">
                <div class="tab_fs__head-icon i-payloads_24" rel="tab_clientActivities"></div>
                <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>

                <ul class="2ndary" style="display: none; z-index: 1;">

                    <li class="2ndary" style="display:none" rel="tab_clientDetails">
                        <div class="tab_fs__head-icon i-details_24" rel="tab_clientDetails"></div>
                        <span term="activityDetail_tab_details" rel="tab_clientDetails">Details</span>
                    </li>

                    <li class="2ndary" style="display:none" rel="tab_relationships">
                        <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_relationships"></div>
                        <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                    </li>
                      
                </ul>
            </li>
            
            <li class="primary" rel="tab_relationships">
                <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_relationships"></div>
                <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                <ul class="2ndary" style="display: none; z-index: 1;">

                    <li class="2ndary" style="display:none" rel="tab_clientDetails">
                        <div class="tab_fs__head-icon i-details_24" rel="tab_clientDetails"></div>
                        <span term="activityDetail_tab_details" rel="tab_clientDetails">Details</span>
                    </li>

                    <li class="2ndary" style="display:none" rel="tab_clientActivities">
                        <div class="tab_fs__head-icon i-payloads_24" rel="tab_clientActivities"></div>
                        <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>
                    </li>

                </ul>
            </li>

        </ul>
        <div class="tab_fs__head-icon_exp"></div>
    </div>

    <div class="tab_fs__container">

        <div class="tab_fs__container-content active sheet_preview" tabButtonId="tab_clientDetails"
            blockid="tab_clientDetails" />

        <div class="tab_fs__container-content" tabButtonId="tab_clientActivities" blockid="tab_clientActivities" style="display:none;">
            <div class="list"></div>
        </div>

        <div class="tab_fs__container-content" tabButtonId="tab_relationships" blockid="tab_relationships" style="display:none;" />

    </div>

</div>
</div>`;


