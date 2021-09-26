
// -------------------------------------------
// -- ItemCard Class/Methods
//      - Mainly used for syncManager run one client item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where client items are processed (in sync)
//              without being displayed on the app list.  
//
function ItemCard( itemJson, parentTag, blockDefJson )
{
	var me = this;

    me.itemJson = itemJson;
    me.parentTag = parentTag;
    me.blockDefJson = blockDefJson;

    me.itemCardDivTag;
    me.cardHighlightColor = '#fcffff'; // #fffff9

	// =============================================
	// === Initialize Related ========================

    me.initialize = function() 
    { 
        me.itemCardDivTag = $( ItemCardTemplate.cardDivTag );
        me.parentTag.append( me.itemCardDivTag );
    };

    // ----------------------------------------------------

    me.render = function()
    {        
        var itemCardDivTag = me.itemCardDivTag;

        try
        {
            var itemContainerTag = itemCardDivTag.find( '.itemContainer' );
            var itemIconTag = itemCardDivTag.find( '.itemIcon' );
            var itemContentTag = itemCardDivTag.find( '.itemContent' );

            // 1. itemType (Icon) display (LEFT SIDE)
            me.itemIconDisplay( itemIconTag, me.itemJson );
            me.itemIconClick_displayInfo( itemIconTag, me.itemJson );


            // 2. previewText/main body display (MIDDLE)
            // TODO: Need to pass the displaySettings Config part..
            me.setItemContentDisplay( itemContentTag, me.itemJson, me.blockDefJson );
            me.itemContentClick_FullView( itemContentTag, me.itemJson._id );
            
            me.setStatusIconText( itemCardDivTag, me.itemJson );
        }
        catch( errMsg )
        {
            console.customLog( 'Error on ItemCard.render, errMsg: ' + errMsg );
        }
    };

    // -----------------------------------------------------
    
    me.setStatusIconText = function( itemCardDivTag, itemJson )
    {
        try
        {            
            var itemId = itemJson._id;

            var divStatusIconTag = itemCardDivTag.find( '.itemStatusIcon' );
            var divStatusTextTag = itemCardDivTag.find( '.itemStatusText' );

            // reset..
            divStatusIconTag.empty();
            divStatusTextTag.empty();


            if ( me.hasMatchingLocalData( itemId ) )
            {
                // Icon / Label
                ActivitySyncUtil.displayStatusLabelIcon( divStatusIconTag, divStatusTextTag, Constants.status_downloaded );
                divStatusTextTag.html( 'In Local' ).attr( 'term', '' );
            }
            else
            {
                // Icon / Label
                ActivitySyncUtil.displayStatusLabelIcon( divStatusIconTag, divStatusTextTag, Constants.status_queued );
                divStatusTextTag.html( 'Not downloaded' ).attr( 'term', '' );

                // On click, remove the icon/text and allow to load..
                divStatusIconTag.off( 'click' ).click( function() 
                {
                    var processingInfo = ActivityDataManager.createProcessingInfo_Success( Constants.status_downloaded, 'Downloaded and stored.' );

                    ClientDataManager.mergeDownloadedClients( { 'clients': [ itemJson ] }, processingInfo, function() 
                    {
                        MsgManager.msgAreaShow( 'The client downloaded and stored.' )

                        me.itemJson = ClientDataManager.getClientById( itemId );

                        // reload the status <-- or this card..
                        me.render();
                    });    
                });
            }
        }
        catch ( errMsg )
        {
            console.log( 'ERROR in ItemCard.setStatusIconText, ' + errMsg );
        }
    };



    me.itemIconClick_displayInfo = function( itemIconTag, itemJson )
    {
        itemIconTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();  // Stops calling parent tags event calls..
            console.log( itemJson );
        });
    };

    me.hasMatchingLocalData = function( itemId )
    {
        return ClientDataManager.getClientById( itemId );
    };


    me.itemContentClick_FullView = function( itemContentTag, itemId )
    {
        itemContentTag.off( 'click' ).click( function( e ) 
        {
            e.stopPropagation();

            if ( itemId )
            {
                if ( me.hasMatchingLocalData( itemId ) ) ( new ClientCardDetail( itemId ) ).render();    
                else console.log( 'Search result client data is not available for cardDetail view.' );
            }
        });
    };

    me.setItemContentDisplay = function( divItemContentTag, itemJson, blockDefJson )
    {
        try
        {          
            var displayBase = '';
            var displaySettings = '';

            // TODO: get displayBase/Settings by Config
            if ( blockDefJson.cardDisplaySettings )
            {
                displayBase = blockDefJson.cardDisplaySettings.displayBase;
                displaySettings = blockDefJson.cardDisplaySettings.displaySettings;
            }
            else
            {
                displayBase = ConfigManager.getClientDisplayBase();
                displaySettings = ConfigManager.getClientDisplaySettings();    
            }
        
            InfoDataManager.setINFOdata( 'item', itemJson );

            FormUtil.setCardContentDisplay( divItemContentTag, displayBase, displaySettings, Templates.cardContentDivTag );
        }
        catch ( errMsg )
        {
            console.customLog( 'ERROR in itemCard.setItemContentDisplay, errMsg: ' + errMsg );
        }
    };


    // -------------------------------
    // --- Display Icon/Content related..

    me.itemIconDisplay = function( itemIconTag, itemJson )
    {
        try
        {
            var iconName = ItemCardTemplate.cardIconTag.replace( '{NAME}', me.getNameSimbol( itemJson ) );

            var svgIconTag = $( iconName );

            itemIconTag.empty().append( svgIconTag );
        }
        catch( errMsg )
        {
            console.customLog( 'Error on ItemCard.clientTypeDisplay, errMsg: ' + errMsg );
        }        
    };                

    // ------------------------------------------

    me.getNameSimbol = function( itemJson )
    {
        var nameSimbol = '--';

        try
        {
            if ( itemJson && itemJson.clientDetails )
            {
                var itemDetail = itemJson.clientDetails;
    
                if ( itemDetail.firstName || itemDetail.lastName )
                {
                    var firstNameSimbol = ( itemDetail.firstName ) ? itemDetail.firstName.charAt(0) : '-';
                    var lastNameSimbol = ( itemDetail.lastName ) ? itemDetail.lastName.charAt(0) : '-';
    
                    nameSimbol = firstNameSimbol + lastNameSimbol;
                }
            }    
        }
        catch( errMsg )
        {
            console.log( 'ERROR in ItemCard.getNameSimbol(), errMsg: ' + errMsg );
        }
        
        return nameSimbol;
    };

    // -------------------------------

    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

};


function ItemCardTemplate() {};

ItemCardTemplate.cardDivTag = `<div class="item card">

    <div class="itemContainer card__container">

        <card__support_visuals class="itemIcon card__support_visuals" />

        <card__content class="itemContent card__content" style="color: #444; cursor: pointer;" />

        <card__cta class="itemStatus card__cta">
            <div class="itemStatusText card__cta_status"></div>
            <div class="itemPhone card__cta_one" style="cursor: pointer;"></div>
            <div class="itemStatusIcon card__cta_two" style="cursor:pointer;"></div>
        </card__cta>

    </div>

</div>`;


ItemCardTemplate.cardIconTag = `<svg xlink="http://www.w3.org/1999/xlink" width="50" height="50">
    <g id="UrTavla">
        <circle style="fill:url(#toning);stroke:#ccc;stroke-width:1;stroke-miterlimit:10;" cx="25" cy="25" r="23">
        </circle>
        <text x="50%" y="50%" text-anchor="middle" stroke="#ccc" stroke-width="1.5px" dy=".3em">{NAME}</text>
    </g>
</svg>`;

