
// -------------------------------------------
// -- ItemCard Class/Methods
//      - Mainly used for syncManager run one client item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where client items are processed (in sync)
//              without being displayed on the app list.  
//
function ItemCard( itemJson, parentTag, blockDefJson, blockObj, itemClickFunc )
{
	var me = this;

    me.itemJson = itemJson;
    me.parentTag = parentTag;
    me.blockDefJson = blockDefJson;
    me.blockObj = blockObj;
    me.itemClickFunc = itemClickFunc;


    me.itemCardDivTag;
    me.cardHighlightColor = '#fcffff'; // #fffff9

    me.option;

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
            
            me.setStatusIconText( itemCardDivTag, me.itemJson, me.blockDefJson );
        }
        catch( errMsg )
        {
            console.log( 'Error on ItemCard.render, errMsg: ' + errMsg );
        }
    };

    // -----------------------------------------------------
    
    me.setStatusIconText = function( itemCardDivTag, itemJson, blockDefJson )
    {
        try
        {            
            var itemId = itemJson._id;
            var operationType = ( blockDefJson.operationType ) ? blockDefJson.operationType : '';

            var divStatusIconTag = itemCardDivTag.find( '.itemStatusIcon' );
            var divStatusTextTag = itemCardDivTag.find( '.itemStatusText' );

            // reset..
            divStatusIconTag.empty();
            divStatusTextTag.empty();


            if ( operationType === 'localDownload' )
            {
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
                        if ( me.itemClickFunc ) me.itemClickFunc();

                        var processingInfo = ActivityDataManager.createProcessingInfo_Success( Constants.status_downloaded, 'Downloaded and stored.' );
    
                        ClientDataManager.mergeDownloadedClients( { 'clients': [ itemJson ] }, processingInfo, function() 
                        {
                            MsgManager.msgAreaShow( '<span term="msg_clientDownloaded">The client downloaded and stored.</span>' )
    
                            me.itemJson = ClientDataManager.getClientById( itemId );
    
                            // reload the status <-- or this card..
                            me.render();
                        });    
                    });
                }
            }
            else if ( operationType === 'selectItem' )
            {
                // Icon / Label
                ActivitySyncUtil.displayStatusLabelIcon( divStatusIconTag, divStatusTextTag, Constants.status_custom, { text: 'Choose This Client', term: 'card_chooseThisClient', img: 'sync_24.svg' } );

                // On click, remove the icon/text and allow to load..
                divStatusIconTag.off( 'click' ).click( function() 
                {
                    if ( me.itemClickFunc ) me.itemClickFunc();

                    if ( blockDefJson.selectActions )
                    {
                        var formsJson = Util.cloneJson( itemJson.clientDetails );
                        formsJson.clientId = itemJson._id;
                        var blockPassingData = { formsJson: formsJson };

                        var actionObj = new Action( SessionManager.cwsRenderObj, me.blockObj );
                        actionObj.handleClickActions( undefined, blockDefJson.selectActions, me.blockObj.parentTag, me.blockObj.blockTag, undefined, blockPassingData );
                    }
                });
            }
            else if ( blockDefJson.operation && Util.isTypeObject( blockDefJson.operation ) )
            {
                var opDef = blockDefJson.operation;
                var icon = ( opDef.icon ) ? opDef.icon: {};
                var confirmMsg  = ( opDef.confirmMsg ) ? opDef.confirmMsg: undefined;

                // Icon / Label
                ActivitySyncUtil.displayStatusLabelIcon( divStatusIconTag, divStatusTextTag, Constants.status_custom, { text: icon.title, term: icon.term, imgFull: icon.path, color: icon.titleColor } );

                // On click, remove the icon/text and allow to load..
                divStatusIconTag.off( 'click' ).click( function() 
                {
                    if ( me.itemClickFunc ) me.itemClickFunc();

                    var confirmPass = ( confirmMsg ) ? confirm( TranslationManager.translateText( confirmMsg.title, confirmMsg.term ) ) : true;
  
                    if ( opDef.onClick && confirmPass )
                    {
                        //var formsJson = Util.cloneJson( itemJson.clientDetails );
                        //formsJson.clientId = itemJson._id;
                        //var blockPassingData = { formsJson: formsJson };

                        var actionObj = new Action( SessionManager.cwsRenderObj, me.blockObj );
                        actionObj.handleClickActions( undefined, opDef.onClick, me.blockObj.parentTag, me.blockObj.blockTag );
                    }
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
            console.log( 'ERROR in itemCard.setItemContentDisplay, errMsg: ' + errMsg );
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
            console.log( 'Error on ItemCard.clientTypeDisplay, errMsg: ' + errMsg );
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
            <div class="favIcon card__cta_one" style="cursor: pointer; display:none;"></div>
            <div class="itemPhone card__cta_one" style="cursor: pointer; display:none;"></div>
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

