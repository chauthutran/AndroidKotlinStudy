
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


                // ----------------------------------------------------------------------------------------
                // Set up Add new relationship

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
        
        var passedData = {
            "displayData": [
                { id: "id", value: clientJson._id }
            ],
            "resultData": []
        };

        for( var id in clientJson.clientDetails )
        {
            passedData.displayData.push( {"id": id, "value": clientJson.clientDetails[id] } );
        }

        var clientDetailsTabTag = sheetFullTag.find( '[tabButtonId=tab_clientDetails]' );

        // Get client Profile Block defition from config.
        var clientProfileBlockId = ConfigManager.getConfigJson().settings.clientProfileBlock;

        if ( clientProfileBlockId ) 
        {        
			var clientProfileBlock_DefJson = FormUtil.getObjFromDefinition( clientProfileBlockId, ConfigManager.getConfigJson().definitionBlocks );

            if ( clientProfileBlock_DefJson )
            {            
                var clientProfileBlock = new Block( SessionManager.cwsRenderObj, clientProfileBlock_DefJson, clientProfileBlockId, clientDetailsTabTag, passedData );
                clientProfileBlock.render();    
            }
        }

        // #2. payload Preview

        // LIST ACTIVITIES... <-- LIST
        var listTableTbodyTag = sheetFullTag.find( '[tabButtonId=tab_clientActivities]' ).find( '.list' );        
        me.populateActivityCardList( clientJson.activities, listTableTbodyTag );

        // #3. relationship?
        var relationshipTabTag = sheetFullTag.find( '[tabButtonId=tab_relationships]' );
        
        // Populate relationship..
        me.renderRelationshipList( clientJson, relationshipTabTag );
    };    

    // ----------------------------------------------

    me.renderRelationshipList = function( clientJson, relationshipTabTag )
    {
        // var listTag = $( '<div class="list"></div>' );

        // if ( clientJson.relationships )
        // {
        //     clientJson.relationships.forEach( relObj => 
        //     {

        //         var relationshipClientJson = ClientDataManager.getClientById( relObj.clientId );
                
        //         var clientCardTrTag = $( ClientCardTemplate.relationshipCardDivTag );
        //         clientCardTrTag.attr( 'itemId', relationshipClientJson._id );
        //         // Add Icon
        //         me.clientIconDisplay( clientCardTrTag.find(".clientIcon"), relationshipClientJson );
        //         // Add FullName
        //         var fullName = relationshipClientJson.clientDetails.firstName + relationshipClientJson.clientDetails.lastName;
        //         clientCardTrTag.find(".clientContent").append( $( ClientCardTemplate.cardContentDivTag ).html( "<b>" + fullName + "</b>" ) );
        //         // Add relationship type
        //         clientCardTrTag.find(".clientContent").append( $( ClientCardTemplate.cardContentDivTag ).html( relObj.type ) );

        //         listTag.append( clientCardTrTag );

        //     });
        // }

        // relationshipTabTag.append( listTag );

        var relationshipListObj = new ClientRelationshipList( clientJson, relationshipTabTag );
        relationshipTabTag.append( relationshipListObj.getListTag() );
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


ClientCardTemplate.relationshipCardDivTag = `<div class="clientContainer card__container">

    <card__support_visuals class="clientIcon card__support_visuals" />

    <card__content class="clientContent card__content" style="color: #444; cursor: pointer;" title="Click for detail" />

    <card__cta class="clientStatus card__cta">
        <div class="editRelationship card__cta_one" style="cursor: pointer;"><img src="images/payload_24.png"></div>
        <div class="deleteRelationship card__cta_two" style="cursor:pointer;"><img src="images/hide.png"></div>
    </card__cta>

<div class="clientRerender" style="float: left; width: 1px; height: 1px;"></div>

</div>`


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


