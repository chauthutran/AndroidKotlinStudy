// -------------------------------------------
// -- BlockMsg Class/Methods
function favIcons( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.favIconsTag; //= $( '#pageDiv' ).find( 'div.floatListMenuSubIcons' ); //$( '#pageDiv' ).find( 'div.floatListMenuSubIcons' );
    me.incr = 0;


    me.initialize = function() 
    {
        if ( ConfigManager.getConfigJson() && ConfigManager.getConfigJson().favList )
        {
            console.log( ConfigManager.getConfigJson().favList );

            me.render( ConfigManager.getConfigJson().favList );
        }

        return me;

    }

    me.render = function( favData ) 
    {

        var favList = Util.sortByKey( me.getFavAreaItems( favData ), 'id');
        var networkStatus = ConnManagerNew.statusInfo.appMode.toLowerCase();

        $( '#pageDiv' ).find( 'div.fab__child-section' ).remove();

        me.favIconsTag = $( '#pageDiv' ).find( 'div.fab-wrapper' ); //$( '#pageDiv' ).find( 'div.floatListMenuSubIcons' );

        var favItems = localStorage.getItem( 'favIcons' );

        me.createRecursiveFavIcons ( favList, 0, ( favItems != undefined && favItems.length > 0 ) )

    }

    /*me.initializeOffLineIcons = function( callBack )
    {
        me.createRecursiveFavIcons ( favList, 0, false )
    }*/

    me.getFavAreaItems = function( favData, callBack )
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
                   if ( FormUtil.login_UserRole.includes( areaItems[ i ].userRoles[ p ] ) )
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

        return areaFavItems;
    
    };

	me.createRecursiveFavIcons = function( favList, favItm, bAppend, callBack )
	{

        if ( favList[ favItm ] )
        {

            if ( bAppend && bAppend == true )
            {
                var unqID = Util.generateRandomId();
                var favItem = $( Templates.favButtonRowItem );

                favItem.find( '.fab__child-text' ).attr( 'term', favList[ favItm ].term );
                favItem.find( '.fab__child-text' ).attr( 'blockId', favList[ favItm ].target.blockId );
                favItem.find( '.fab__child-text' ).attr( 'actionType', favList[ favItm ].target.actionType );
                favItem.find( '.fab__child-text' ).html( favList[ favItm ].name );

                var svgObject = me.fetchFavIcon( favList[ favItm ].id );

                $( svgObject ).attr( 'id', 'svg_' + unqID );

                favItem.find( '.fab__child' ).append( svgObject );
                favItem.insertBefore( me.favIconsTag.find( '.fab__section' ) );                

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
                // read local SVG xml structure, then replace appropriate content 'holders': {TEXT} 
                $.get( favList[ favItm ].img, function(data) {

                    var unqID = Util.generateRandomId();
                    var svgTemplate = ( $(data)[0].documentElement );
                    var svgObject = ( $(data)[0].documentElement );

                    $( svgObject ).find("tspan").html( favList[ favItm ].name );

                    if ( favList[ favItm ].term )
                    {
                        $( svgObject ).html( $(svgObject).html().replace( /{TERM}/g, favList[ favItm ].term ) );
                    }

                    if ( favList[ favItm ].colors )
                    {
                        if ( favList[ favItm ].colors.background )
                        {
                            $( svgObject ).html( $(svgObject).html().replace( /{BGFILL}/g, favList[ favItm ].colors.background ) );
                            $( svgObject ).attr( 'colors.background', favList[ favItm ].colors.background );
                        }
                        else
                        {
                            $( svgObject ).html( $(svgObject).html().replace( /{BGFILL}/g, '#CCCCCC' ) );
                            $( svgObject ).attr( 'colors.background', '#CCCCCC' );
                        }
                        if ( favList[ favItm ].colors.foreground )
                        {
                            $( svgObject ).html( $(svgObject).html().replace( /{COLOR}/g, favList[ favItm ].colors.foreground ) );
                            $( svgObject ).attr( 'colors.foreground', favList[ favItm ].colors.foreground );
                        }
                        else
                        {
                            $( svgObject ).html( $(svgObject).html().replace( /{COLOR}/g, '#333333' ) );
                            $( svgObject ).attr( 'colors.foreground', '#333333' );

                        }
                    }
                    if ( favList[ favItm ].style )
                    {
                        if ( favList[ favItm ].style.icon )
                        {
                            if (favList[ favItm ].style.icon.colors.background )
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{ICON.BGFILL}/g, favList[ favItm ].style.icon.colors.background ) );
                                $( svgObject ).attr( 'icon.colors.background', favList[ favItm ].style.icon.colors.background );
                            }
                            else
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{ICON.BGFILL}/g, '#CCC' ) );
                                $( svgObject ).attr( 'icon.colors.background', '#CCC' );
                            }
                            if ( favList[ favItm ].style.icon.colors.foreground )
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{ICON.COLOR}/g, favList[ favItm ].style.icon.colors.foreground ) );
                                $( svgObject ).attr( 'icon.colors.foreground', favList[ favItm ].style.icon.colors.foreground );
                            }
                            else
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{ICON.COLOR}/g, '#333333' ) );
                                $( svgObject ).attr( 'icon.colors.foreground', '#333333' );                                
                            }
                        }
                        if ( favList[ favItm ].style.label)
                        {
                            if (favList[ favItm ].style.label.colors.background )
                            {
                                // edited: 2019/09/05 >> FIGMA Concept v1.0.3 suggested we use permanent 'light' backgrounds for labels... 
                                //$( svgObject ).html( $(svgObject).html().replace( /{LABEL.BGFILL}/g, favList[ favItm ].style.label.colors.background ) );
                                $( svgObject ).html( $(svgObject).html().replace( /{LABEL.BGFILL}/g, '#F5F5F5' ) );
                                $( svgObject ).attr( 'label.colors.background', favList[ favItm ].style.label.colors.background );

                            }
                            else
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{LABEL.BGFILL}/g, '#F5F5F5' ) );
                                $( svgObject ).attr( 'label.colors.background', '#F5F5F5' );
                            }
                            if ( favList[ favItm ].style.label.colors.foreground )
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{LABEL.COLOR}/g, favList[ favItm ].style.label.colors.foreground ) );
                                $( svgObject ).attr( 'label.colors.foreground', favList[ favItm ].style.label.colors.foreground );
                            }
                            else
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{LABEL.COLOR}/g, '#333333' ) );
                                $( svgObject ).attr( 'label.colors.foreground', '#333333' );
                            }
                        }
                    }

                    me.storeFavIcon( svgObject.outerHTML, favList[ favItm ].id, favList[ favItm ].name, function(){

                        if ( favList.length > ( parseInt(favItm) +1 ) && favList[ ( parseInt(favItm) +1 ) ] )
                        {
                            me.createRecursiveFavIcons( favList, ( parseInt(favItm) +1 ), bAppend )
                        }
                        else
                        {
                            me.createRecursiveFavIcons ( favList, 0, true );
                        }

                    } );

                });
            }

        }

    }

    me.setFavIconClickTarget = function( favObjTag, favItem )
    {
        // Greg: you modified this code 2020-04-22 @ 08h43 (maybe revert?)
        favObjTag.off( 'click' );

        favObjTag.click( function() {

            if ( favItem.target.blockId )
            {
                me.cwsRenderObj.renderBlock( favItem.target.blockId, favItem.target.options )
            }

        });
    }

    me.createFavButtonShowHideEvent = function()
    {

        me.favIconsTag.find( 'div.fab' ).click(function () {

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

        if ( localStorage.getItem( 'favIcons' ) )
        {
            var favIconObj = JSON.parse( localStorage.getItem( 'favIcons' ) );
        }
        else
        {
            var favIconObj = [];
        }

        favIconObj.push ( { id: iconID, name: iconName, svg: encodeURI( svgObjectCode ) } );

        localStorage.setItem( 'favIcons', JSON.stringify( favIconObj ) );

        if ( callBack ) callBack();

    }

    me.fetchFavIcon = function( iconID )
    {
        if ( localStorage.getItem( 'favIcons' ) )
        {
            var favIconObj = JSON.parse( localStorage.getItem( 'favIcons' ) );

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
    localStorage.removeItem( 'favIcons' );

	// ------------------------------------

	me.initialize();
}