
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

	// =============================================
	// === Initialize Related ========================

    me.initialize = function() { };

    // ----------------------------------------------------

    me.render = function()
    {       
        // clientCardDiv Tags(Multiple selections). 
        var clientCardDivTag = me.getClientCardDivTag();

        // If tag has been created), perform render
        if ( clientCardDivTag.length > 0 )
        {
            var clientJson = ClientDataManager.getClientById( me.clientId );
            var detailViewCase = ( me.options.detailViewCase ) ? true: false;  // Used for detailed view popup - which reuses 'render' method.

            try
            {
                var clientContainerTag = clientCardDivTag.find( '.clientContainer' );
                var clientIconTag = clientCardDivTag.find( '.clientIcon' );
                var clientContentTag = clientCardDivTag.find( '.clientContent' );
                var clientRerenderTag = clientCardDivTag.find( '.clientRerender' );
                var clientPhoneCallTag = clientCardDivTag.find( '.clientPhone' );

                //var clientEditPaylayLoadBtnTag = clientCardDivTag.find( '#editPaylayLoadBtn' );

                var lastActivityJson = me.getLastActivity( clientJson );


                // 1. clientType (Icon) display (LEFT SIDE)
                me.clientIconDisplay( clientIconTag, clientJson );
                //if ( clickEnable ) me.clientIconClick_displayInfo( clientIconTag, clientJson );


                // 2. previewText/main body display (MIDDLE)
                me.setClientContentDisplay( clientContentTag, clientJson );
                if ( !detailViewCase ) me.clientContentClick_FullView( clientContentTag, me.clientId );


                // 3. 'SyncUp' Button Related
                // click event - for clientSubmit.., icon/text populate..
                if ( lastActivityJson ) me.setupSyncBtn( clientCardDivTag, lastActivityJson.id, detailViewCase );  // clickEnable - not checked for SyncBtn/Icon

                // 4. 'phoneNumber' action  button setup
                me.setupPhoneCallBtn( clientPhoneCallTag, clientJson );

                // 5. clickable rerender setup
                me.setUpReRenderByClick( clientRerenderTag );

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


    me.setupSyncBtn = function( clientCardDivTag, activityId, detailViewCase )
    {
        try
        {
            var divSyncIconTag = clientCardDivTag.find( '.activityStatusIcon' ).attr( 'activityId', activityId );
            var divSyncStatusTextTag = clientCardDivTag.find( '.activityStatusText' ).attr( 'activityId', activityId );
    
            // if 'detailView' mode, the bottom message should not show..
            if ( detailViewCase ) divSyncIconTag.addClass( 'detailViewCase' );
    
            ActivitySyncUtil.displayActivitySyncStatus( activityId );
    
            ActivitySyncUtil.setSyncIconClickEvent( divSyncIconTag, clientCardDivTag, activityId );
        }
        catch ( errMsg )
        {
            console.log( 'ERROR in ClientCard.setupSyncBtn, ' + errMsg );
        }
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


    // ---------------------------------------

    me.generateCardTrTag = function( groupAttrVal )
    {        
        var divClientCardTag = $( ClientCardTemplate.cardDivTag );

        divClientCardTag.attr( 'itemId', me.clientId );

        divClientCardTag.attr( 'group', groupAttrVal );

        return divClientCardTag;
    };

    // -----------------------------------------------------

    me.getClientCardDivTag = function()
    {            
        return $( 'div.card[itemid="' + me.clientId + '"]' );
    };

    me.getClientCardDivTagById = function( clientId )
    {            
        return $( 'div.card[itemid="' + clientId + '"]' );
    };

    /*
    // Used for ClientCard itemId change from tempClient to newClient Id
    me.clientCardDivTags_ChangeItemId = function( divClientCardTags, newClientId )
    {
        divClientCardTags.attr( 'itemid', newClientId );
    };
    */

    // -----------------------------------------------------

    me.clientIconClick_displayInfo = function( clientIconTag, clientJson )
    {
        clientIconTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..
            console.log( clientJson );
        });
    };

    me.clientContentClick_FullView = function( clientContentTag, clientId )
    {
        clientContentTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();

            var clientCardDetail = new ClientCardDetail( clientId );
            clientCardDetail.render();
        });
    };

    me.setClientContentDisplay = function( divClientContentTag, client )
    {
        try
        {            
            var displayBase = ConfigManager.getClientDisplayBase();
            var displaySettings = ConfigManager.getClientDisplaySettings();            

            InfoDataManager.setINFOdata( 'client', client );


			var view = me.options.viewDef_Selected;
            var preRunEvalStr;
            if ( view )
            {
                var hasViewDisplayData = false;

                if ( view.displayBase ) {
                    hasViewDisplayData = true;
                    displayBase = view.displayBase;
                } 

                if ( view.displaySettings ) {
                    hasViewDisplayData = true;
                    displaySettings = view.displaySettings;
                }

                // preRunEval string set only if there is 'displayBase/Settings'
                if ( hasViewDisplayData && view.preRunEval ) preRunEvalStr = Util.getEvalStr( view.preRunEval );
            }
            
            FormUtil.setCardContentDisplay( divClientContentTag, displayBase, displaySettings, Templates.cardContentDivTag, preRunEvalStr );
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

    // ------------------------------------------

    me.setUpReRenderByClick = function( clientRerenderTag )
    {
        clientRerenderTag.off( 'click' ).click( function( e ) {
            e.stopPropagation();  // Stops calling parent tags event calls..

            // Since this reRender triggers could be multiple same client tags, use this to change just this one.
            var thisReRenderTag = $( this );
            var thisClientCardTag = thisReRenderTag.closest( 'div.client[itemid]' );

            // If tempClient changed to new Client case, do 2 things
            // 1. change me.clientId to new client Id
            // 2. change this tages..

            var newClientId_FromTempClient = ClientDataManager.tempClient_ToNewClientCase( me.clientId );
            if ( newClientId_FromTempClient )
            {
                me.clientId = newClientId_FromTempClient;

                thisClientCardTag.attr( 'itemid', newClientId_FromTempClient );
                //me.clientCardDivTags_ChangeItemId( clientCardDivTag, newClientId_FromTempClient );
            }

            me.render();
        } );    
    };

    me.reRenderClientDiv = function()
    {
        // There are multiple places presenting same activityId info.
        // We can find them all and reRender their info..
        var clientCardTags = $( 'div.card[itemid="' + me.clientId + '"]' );
        var reRenderClickDivTags = clientCardTags.find( 'div.clientRerender' );   
        
        reRenderClickDivTags.click();
    }

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
        var clientDivTag = $( 'div.card[itemid="' + me.clientId + '"]' );

        if ( clientDivTag.length > 0 )
        {
            if ( bHighlight ) clientDivTag.css( 'background-color', me.cardHighlightColor );
            else clientDivTag.css( 'background-color', '' );
        }
    }

    // -------------------------------

    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

};


function ClientCardTemplate() {};

ClientCardTemplate.cardDivTag = `<div class="client card">

    <div class="clientContainer card__container">

        <card__support_visuals class="clientIcon card__support_visuals" />

        <card__content class="clientContent card__content" style="color: #444; cursor: pointer;" title="Click for detail" />

        <card__cta class="activityStatus card__cta">
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

    <card__cta class="activityStatus card__cta">
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
    <div class="clientDetailRerender" style="float: left; width: 1px; height: 1px;"></div>
    <div class="card__container">
        <card__support_visuals class="clientIcon card__support_visuals" />
        <card__content class="clientContent card__content" />
        <card__cta class="activityStatus card__cta">
            <div class="activityStatusText card__cta_status" />
            <div class="clientPhone card__cta_one" style="cursor: pointer;"></div>
            <div class="activityStatusIcon card__cta_two" style="cursor: pointer;"></div>
        </card__cta>
        <div class="clientRerender" style="float: left; width: 1px; height: 1px;"></div>
    </div>

    <div class="tab_fs">

        <ul class="tab_fs__head" style="background-color: #fff;">

            <li class="primary active" rel="tab_clientDetails">
                <div class="tab_fs__head-icon i-details_24" rel="tab_clientDetails"></div>
                <span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>

                <ul class="secondary" style="display: none; z-index: 1;">

                    <li class="secondary" style="display:none" rel="tab_clientActivities">
                        <div class="tab_fs__head-icon i-payloads_24" rel="tab_clientActivities"></div>
                        <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activity</span>
                    </li>  

                    <li class="secondary" style="display:none" rel="tab_relationships">
                        <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_relationships"></div>
                        <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                    </li>
      
                </ul>
            </li>

            <li class="primary" rel="tab_clientActivities">
                <div class="tab_fs__head-icon i-payloads_24" rel="tab_clientActivities"></div>
                <span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>

                <ul class="secondary" style="display: none; z-index: 1;">

                    <li class="secondary" style="display:none" rel="tab_clientDetails">
                        <div class="tab_fs__head-icon i-details_24" rel="tab_clientDetails"></div>
                        <span term="activityDetail_tab_details" rel="tab_clientDetails">Details</span>
                    </li>

                    <li class="secondary" style="display:none" rel="tab_relationships">
                        <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_relationships"></div>
                        <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                    </li>
                      
                </ul>
            </li>
            
            <li class="primary" rel="tab_relationships">
                <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_relationships"></div>
                <span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
                <ul class="secondary" style="display: none; z-index: 1;">

                    <li class="secondary" style="display:none" rel="tab_clientDetails">
                        <div class="tab_fs__head-icon i-details_24" rel="tab_clientDetails"></div>
                        <span term="activityDetail_tab_details" rel="tab_clientDetails">Details</span>
                    </li>

                    <li class="secondary" style="display:none" rel="tab_clientActivities">
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


