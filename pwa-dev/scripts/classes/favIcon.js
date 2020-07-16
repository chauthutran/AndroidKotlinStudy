// -------------------------------------------
// -- BlockMsg Class/Methods
function favIcons( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.favIconsTag = $( '#pageDiv' ).find( 'div.fab-wrapper' ); 
    me.favButtonTag = $( '#pageDiv' ).find( 'div.fab' );
    me.incr = 0;


    me.initialize = function() 
    {
        return me;
    }

    me.render = function() 
    {
        var favData = ConfigManager.getConfigJson().favList;
        var favList = me.getFavIconsByAreaRole( favData );

        me.initialize_UI();

        me.createRecursiveFavIcons ( favList, 0, false ); //( favItems !== undefined )

    }

    me.initialize_UI = function()
    {
        // clear existing favIcons
        $( '#pageDiv' ).find( 'div.fab__child-section' ).remove();
    }

    me.getFavIconsByAreaRole = function( favData, callBack )
    {
        var bOnline = ( ConnManagerNew.statusInfo.appMode === 'Online' );
        var areaItems = ( bOnline ) ? favData.online : favData.offline;
        var areaFavItems = [];

        for ( var i=0; i< areaItems.length; i++ )
        {
           if ( areaItems[ i ].userRoles )
           {
               for ( var p=0; p< areaItems[ i ].userRoles.length; p++ )
               {
                   if ( ConfigManager.login_UserRoles.includes( areaItems[ i ].userRoles[ p ] ) )
                   {
                       areaFavItems.push( areaItems[ i ] );
                       break;
                   }
               }
           }
           else
           {
            areaFavItems.push( areaItems[ i ] );
           }
        }

        Util.sortByKey( areaFavItems, 'id');

        return areaFavItems;
    
    };

	me.createRecursiveFavIcons = function( favList, favItm, bAppend, callBack )
	{
        // 1. create 'precompiled' SVG icons for easy reference;
        // 2. retrieve these compiled SVG files when bAppend = true
        // * NOTE: this implementation is not complete [2020-05-27]

        if ( favList[ favItm ] )
        {
            // 'append' SVG icons to blockList screen
            if ( bAppend && bAppend == true )
            {
                var unqID = Util.generateRandomId();
                var favItem = $( Templates.favButtonRowItem );

                favItem.find( '.fab__child-text' ).attr( 'term', favList[ favItm ].term );
                favItem.find( '.fab__child-text' ).attr( 'displayName', favList[ favItm ].name );
                favItem.find( '.fab__child-text' ).attr( 'blockId', favList[ favItm ].target.blockId );
                favItem.find( '.fab__child-text' ).attr( 'actionType', favList[ favItm ].target.actionType );
                favItem.find( '.fab__child-text' ).html( favList[ favItm ].name );

                //var svgObject = me.fetchFavIcon( favList[ favItm ].id );
                var svgObject = $( favList[ favItm ].svgObject );

                svgObject.attr( 'id', 'svg_' + unqID );

                favItem.find( '.fab__child' ).append( svgObject );
                favItem.insertBefore( me.favIconsTag.find( '.fab__section' ) ); 

                if ( favList[ favItm ].iconStyled === true )
                {
                    // set transparency because SVG icons have color scheme specified by DCDconfig
                    me.favIconsTag.find( '.svgIcon' ).css( 'background-color', 'transparent');
                }

                if ( favList[ favItm ].target )
                {
                    me.setFavIconClickTarget ( favItem, favList[ favItm ] );

                    if ( favList.length > ( parseInt(favItm) +1  ) && favList[ parseInt(favItm) +1  ] )
                    {
                        me.createRecursiveFavIcons( favList, ( parseInt(favItm) +1 ), bAppend );
                    }
                    else
                    {
                        me.cwsRenderObj.langTermObj.translatePage();

                        me.createFavButtonShowHideEvent();
                    }
                }
                else
                {
                    me.cwsRenderObj.langTermObj.translatePage();

                    me.createFavButtonShowHideEvent();
                }
            }
            else
            {
                // create + add SVG styled icons to localStorage
                $.get( favList[ favItm ].img, function( data ) {

                    var svgObject = ( $( data )[0].documentElement );
                    var activityItem = ( favList[ favItm ].activityType ?  FormUtil.getActivityTypeByRef( "name", favList[ favItm ].activityType ) : undefined );
                    //$( svgObject ).find( 'tspan' ).html( favList[ favItm ].name ); // LABELS no longer supported from v1.3

                    if ( favList[ favItm ].term ) $( svgObject ).html( $( svgObject ).html().replace( /{term}/g, favList[ favItm ].term ) );

                    if ( activityItem )
                    {
                        favList[ favItm ][ 'svgObject' ] = me.styleIconByActivityItem( favList[ favItm ], activityItem, svgObject );
                    }
                    else
                    {
                        favList[ favItm ][ 'svgObject' ] = me.styleIconByConfig( favList[ favItm ], svgObject );
                    }


                    if ( favList.length > ( parseInt(favItm) +1 ) && favList[ ( parseInt(favItm) +1 ) ] )
                    {
                        me.createRecursiveFavIcons( favList, ( parseInt(favItm) +1 ), bAppend )
                    }
                    else
                    {
                        me.createRecursiveFavIcons ( favList, 0, true );
                    }

                });
            }

        }

    }

    me.styleIconByActivityItem = function( favObj, actTypeObj, svgObject )
    {
        if ( actTypeObj.icon )
        {
            if (actTypeObj.icon.colors.background )
            {
                favObj.iconStyled = true;
                $( svgObject ).html( $( svgObject ).html().replace( /{icon.bgfill}/g, actTypeObj.icon.colors.background ) );
                $( svgObject ).attr( 'icon.colors.background', actTypeObj.icon.colors.background );
            }
            else
            {
                $( svgObject ).html( $( svgObject ).html().replace( /{icon.bgfill}/g, '#CCC' ) );
                $( svgObject ).attr( 'icon.colors.background', '#CCC' );
            }
            if ( actTypeObj.icon.colors.foreground )
            {
                favObj.iconStyled = true;
                $( svgObject ).html( $( svgObject ).html().replace( /{icon.color}/g, actTypeObj.icon.colors.foreground ) );
                $( svgObject ).attr( 'icon.colors.foreground', actTypeObj.icon.colors.foreground );
            }
            else
            {
                $( svgObject ).html( $( svgObject ).html().replace( /{icon.color}/g, '#333333' ) );
                $( svgObject ).attr( 'icon.colors.foreground', '#333333' );                                
            }
        }

        return $( svgObject )[ 0 ].outerHTML;

    }

    me.styleIconByConfig = function( favObj, svgObject )
    {
        if ( favObj.colors )
        {
            if ( favObj.colors.background )
            {
                favObj.iconStyled = true;
                $( svgObject ).html( $( svgObject ).html().replace( /{bgfill}/g, favObj.colors.background ) );
                $( svgObject ).attr( 'colors.background', favObj.colors.background );
            }
            else
            {
                $( svgObject ).html( $( svgObject ).html().replace( /{bgfill}/g, '#CCCCCC' ) );
                $( svgObject ).attr( 'colors.background', '#CCCCCC' );
            }
            if ( favObj.colors.foreground )
            {
                favObj.iconStyled = true;
                $( svgObject ).html( $( svgObject ).html().replace( /{color}/g, favObj.colors.foreground ) );
                $( svgObject ).attr( 'colors.foreground', favObj.colors.foreground );
            }
            else
            {
                $( svgObject ).html( $( svgObject ).html().replace( /{color}/g, '#333333' ) );
                $( svgObject ).attr( 'colors.foreground', '#333333' );

            }
        }

        if ( favObj.style )
        {
            if ( favObj.style.icon )
            {
                if (favObj.style.icon.colors.background )
                {
                    favObj.iconStyled = true;
                    $( svgObject ).html( $( svgObject ).html().replace( /{icon.bgfill}/g, favObj.style.icon.colors.background ) );
                    $( svgObject ).attr( 'icon.colors.background', favObj.style.icon.colors.background );
                }
                else
                {
                    $( svgObject ).html( $( svgObject ).html().replace( /{icon.bgfill}/g, '#CCC' ) );
                    $( svgObject ).attr( 'icon.colors.background', '#CCC' );
                }
                if ( favObj.style.icon.colors.foreground )
                {
                    favObj.iconStyled = true;
                    $( svgObject ).html( $( svgObject ).html().replace( /{icon.color}/g, favObj.style.icon.colors.foreground ) );
                    $( svgObject ).attr( 'icon.colors.foreground', favObj.style.icon.colors.foreground );
                }
                else
                {
                    $( svgObject ).html( $( svgObject ).html().replace( /{icon.color}/g, '#333333' ) );
                    $( svgObject ).attr( 'icon.colors.foreground', '#333333' );                                
                }
            }

        }

        return $( svgObject )[ 0 ].outerHTML;
    }

    me.setFavIconClickTarget = function( favObjTag, favItem )
    {
        favObjTag.off( 'click' );

        favObjTag.click( function() {

            if ( favItem.target.blockId )
            {
                me.cwsRenderObj.setAppTitle( favItem.target.blockId, favItem.name );
                me.cwsRenderObj.renderBlock( favItem.target.blockId, favItem.target.options );
            }

        });
    }

    me.createFavButtonShowHideEvent = function()
    {

        me.favButtonTag.off( 'click' );

        me.favButtonTag.click(function () {

            if ( $( '.fab__child-section' ).is( ':visible' ) ) 
            {
                $( '.fab__child-section' ).css( 'display', 'none' );
                $( '.fab' ).css( 'transform', 'rotate(0deg)' );
                $( this ).removeClass( 'w_button' );
                $( this ).addClass( 'c_600' );
            } 
            else 
            {
                $( '.fab__child-section' ).css( 'display', 'table-row' );
                $( '.fab' ).css( 'transform', 'rotate(45deg)' );
                $( this ).removeClass( 'c_600' );
                $( this ).addClass( 'w_button' );
            }
        });

    }

    me.storeFavIcon = function( svgObjectCode, iconID, iconName, callBack )
    {

        var favIconObj = AppInfoManager.getFavIcons();

        if ( favIconObj === undefined )
        {
           favIconObj = [];
        }


        favIconObj.push ( { id: iconID, name: iconName, svg: encodeURI( svgObjectCode ) } );

        AppInfoManager.updateFavIcons( favIconObj );

        if ( callBack ) callBack();

    }

    me.fetchFavIcon = function( iconID )
    {
        var favIconObj = AppInfoManager.getFavIcons();
        if ( favIconObj != undefined )
        {
            for ( var i = 0; i < favIconObj.length; i++ )
            {
                var favItm = ( favIconObj[ i ] );

                if ( favItm.id == iconID )
                {
                    return $( decodeURI( favItm.svg ) );
                }
            }

        }
    }

    // empty existing container - force a recreate of SVG content
    // added temporarily (ideally should only be done once login)
    AppInfoManager.removeFavIcons();

	// ------------------------------------

	me.initialize();
}