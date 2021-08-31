// -------------------------------------------
// -- FavIconList Class/Methods
function FavIcons( favType, parentTag, favItemTargetBlockContainerTag, beforeItemClickActionCall, afterItemClickActionCall )
{
    var me = this;

    // NEW 1: Take in param as paranetTag, favName
    me.favType = favType;
    me.parentTag = parentTag;
    me.favItemTargetBlockContainerTag = favItemTargetBlockContainerTag;
    me.beforeItemClickActionCall = beforeItemClickActionCall;
    me.afterItemClickActionCall = afterItemClickActionCall;
    // ---------------

    me.favIconsTag;
    me.favMainButtonTag;
    me.favReRenderTag;

    // --------------

    me.favListByType;

    // ========================================

    me.initialize = function() 
    {
        // 1. Create FavIcons Tag 
        me.favIconsTag = $( FavIcons.favButtonContainer );
        me.parentTag.append( me.favIconsTag );
        me.favReRenderTag = me.favIconsTag.find( 'div.favReRender' );
        me.favMainButtonTag = me.favIconsTag.find( 'div.fab' );
        
        // 2. Events Setup
        me.setFavMainClickEvent( me.favMainButtonTag, me.favIconsTag ); //  Default '+' button event..
        me.setReRenderClickEvent( me.favReRenderTag );

        // 3. Set favList by type
        me.favListByType = me.getFavListByType( me.favType );
    }

    // -----------------------------------------    

    // Fav Main + button click events
    me.setFavMainClickEvent = function( favMainButtonTag, favIconsTag )
    {
        favMainButtonTag.click( function () 
        {
            var thisTag = $( this );
            var favItemsTag = favIconsTag.find( '.fab__child-section' );

            if ( thisTag.hasClass( 'c_600' ) )
            {
                favItemsTag.css( 'display', 'table-row' );
                thisTag.addClass( 'w_button' ).removeClass( 'c_600' ).css( 'transform', 'rotate(45deg)' );
            }
            else
            {
                favItemsTag.css( 'display', 'none' );
                thisTag.removeClass( 'w_button' ).addClass( 'c_600' ).css( 'transform', 'rotate(0deg)' );
            }
        });
    };

    me.isFavMainButtonOpen = function()
    {
        return me.favMainButtonTag.hasClass( 'w_button' );
    };


    me.closeFavMainButton = function()
    {
        if ( me.isFavMainButtonOpen() ) me.favMainButtonTag.click();
    };

    me.setReRenderClickEvent = function( favReRenderTag )
    {
        favReRenderTag.click( function () 
        {
            me.render();
        });
    };

    // -----------------------------------------

    me.getFavListByType = function( favType )
    {
        var favList = ConfigManager.getConfigJson().favList;

        // 'favType': 'activityListFav', 'clientListFav', 'clientActivityFav', 'clientRelFav'
        var favListByType = favList[ favType ];

        return ( favListByType ) ? favListByType: favList;
    };

    // -----------------------------------------

    // NEW 2: Clear /Reset existing list
    // NEW 3: Depending on online/offline, relist the 'favList' selections.
    me.render = function() 
    {        
        try
        {            
            // 1. Clear any previous generated item
            me.clearExistingFavItems( me.favIconsTag );
            me.closeFavMainButton();

            // 2. Get favListArr from online status
            var favListArr = ( ConnManagerNew.isAppMode_Online() ) ? me.favListByType.online : me.favListByType.offline;

            // 3. favItems populate
            me.populateFavItems( favListArr, me.favIconsTag );

            // 4. Translate the favItem terms
            TranslationManager.translatePage();
        }
        catch( errMsg )
        {
            console.log( 'ERROR in FavIcon.render(), ' + errMsg );
        }
    };

    // ---------------------------------------

    me.clearExistingFavItems = function( favIconsTag )
    {
        favIconsTag.find( 'div.fab__child-section' ).remove();
    };
    
    // -------------------------------------------
    // ---- POPULATE FAV ITEMS RELATED
    me.populateFavItems = function( favItems, favIconsTag )
    {
        if ( favItems )
        {
            var favButtonSectionTag = favIconsTag.find( '.fab__section' );

            favItems.forEach( favItem => 
            {
                // 1. FavItem Tag from template
                var favItemTag = $( FavIcons.favButtonRowItem );
                favItemTag.insertBefore( favButtonSectionTag );
                
                // 2. Click event
                me.setFavItemClickEvent( favItemTag, favItem, me.favItemTargetBlockContainerTag );

                // 3. populate the favItem content
                me.populateFavItemDetail( favItemTag, favItem );
            });
        }
    };


    me.setFavItemClickEvent = function( favItemTag, favItem, targetBlockContainerTag )
    {
        favItemTag.click( function() 
        {
            //if ( $( 'div.scrim').is( ':visible' ) ) $( 'div.scrim').hide();
            if ( favItem.target )
            {
                // What if we pass 'me' instead?  That would make all the class variables available..
                if ( me.beforeItemClickActionCall ) me.beforeItemClickActionCall( me.parentTag );

                //SessionManager.cwsRenderObj.setAppTitle( favItem.target.blockId, favItem.name, favItem.term );
                SessionManager.cwsRenderObj.renderFavItemBlock( favItem.target.blockId, favItem.target.options
                    ,targetBlockContainerTag, favItem );

                // Also, close this FavMainButton just in case..
                me.closeFavMainButton();

                if ( me.afterItemClickActionCall )  me.afterItemClickActionCall();                
            }
        });
    };


    me.populateFavItemDetail = function( favItemTag, favItem )
    {
        var svgIconTag = favItemTag.find( 'div.svgIcon' ); // fab__child c_200 
        var contentTag = favItemTag.find( '.fab__child-text' );
        var activityTypeDef = ( favItem.activityType ) ? me.getActivityTypeByRef( 'name', favItem.activityType ) : undefined;

        contentTag.attr( 'term', favItem.term );        
        contentTag.attr( 'displayName', favItem.name );
        contentTag.attr( 'blockId', favItem.target.blockId );
        contentTag.attr( 'actionType', favItem.target.actionType );
        contentTag.html( favItem.name );

        // svg icon setup - if available (by local file path reference)
        me.generateSvgIconFromPath( favItem, activityTypeDef, svgIconTag );        
        //svgIconTag.css( 'background-color', 'transparent' ); // SHOULD ALWAYS BE TRANSPARENT, RIGHT?
    };


    me.generateSvgIconFromPath = function( favItem, activityTypeDef, svgIconTag )
    {
        var svgPathStr;
        if ( activityTypeDef && activityTypeDef.icon ) svgPathStr = activityTypeDef.icon.path;
        else if ( favItem.img ) svgPathStr = favItem.img;

        if ( svgPathStr )
        {
            // get 'svg' file from local image path
            $.get( svgPathStr, function( data ) 
            {
                var htmlElement = $( data )[0].documentElement;
                var svgTagStr = htmlElement.outerHTML;

                // Modify svgTagStr, append to svgIconTag
                me.createSvgIconAndAppend( favItem, activityTypeDef, svgTagStr, svgIconTag );
            });
        }
    };

    me.createSvgIconAndAppend = function( favItem, activityTypeDef, svgTagStr, svgIconTag )
    {
        var colorInfo = me.getColorInfo( favItem, activityTypeDef );
               
        svgTagStr = svgTagStr.replace( /{icon.bgfill}/g, colorInfo.background );
        svgTagStr = svgTagStr.replace( /{icon.color}/g, colorInfo.foreground );

        svgIconTag.append( svgTagStr );
    };

    me.getColorInfo = function( favItem, activityTypeDef )
    {
        var colorInfo = { background: '#CCC', foreground: '#333333' };

        // Overwrite the colors in priority order..
        me.setColorInfo( favItem.colors, colorInfo );

        if ( favItem.style && favItem.style.icon ) me.setColorInfo( favItem.style.icon.colors, colorInfo ); 

        if ( activityTypeDef && activityTypeDef.icon ) me.setColorInfo( activityTypeDef.icon.colors, colorInfo ); 

        return colorInfo;
    };

    me.setColorInfo = function( colorsJson, colorInfo )
    {
        if ( colorsJson )
        {
            if ( colorsJson.background ) colorInfo.background = colorsJson.background;
            if ( colorsJson.foreground ) colorInfo.foreground = colorsJson.foreground;
        }
    };
    
    //-----------------------------------

    me.getActivityTypeByRef = function( prop, activityType )
    {
        var activityTypeStyle;

        try
        {
            if ( activityType )
            {
                var itemList = ConfigManager.getConfigJson().settings.redeemDefs.activityTypes; 
                
                var styleInfo = Util.getFromList( itemList, activityType, prop );

                if ( styleInfo ) activityTypeStyle = Util.cloneJson( styleInfo );
            }    
        }
        catch( errMsg ) {
            console.log( 'ERROR in FavIcons.getActivityTypeByRef, activityType: ' + activityType + ', ' + errMsg );
        }
        
        return activityTypeStyle;
    };

    // ------------------------------------

	me.initialize();
}


FavIcons.favButtonContainer = `<div class="fab-wrapper">
    <div class="fab__section">
        <div class="fab c_600" style="transform: rotate(0deg);">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M35 27H29V21H27V27H21V29H27V35H29V29H35V27V27Z" class="c_600"></path>
            </svg>
        </div>
    </div>
    <div class="favReRender" style="float: left; width: 1px; height: 1px;"></div>
</div> `;

FavIcons.favButtonRowItem = `<div class="fab__child-section">
    <div class="fab__child c_200 svgIcon" style="background-color: transparent;" />
    <div class="fab__child-text" />
</div>`;
