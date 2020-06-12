// -------------------------------------------
// -- BlockMsg Class/Methods
function favIcons( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.favIconsTag; //= $( '#pageDiv' ).find( 'div.floatListMenuSubIcons' ); //$( '#pageDiv' ).find( 'div.floatListMenuSubIcons' );
    me.incr = 0;

    me.favItemTemplate = `<div class="fab__child-section" style="display: table-row;">
                            <div class="fab__child c_200 svgIcon" />
                            <div class="fab__child-text" />
                        </div>`;

    me.initialize = function() 
    {
        if ( ConfigManager.getConfigJson() && ConfigManager.getConfigJson().favList )
        {
            console.log( ConfigManager.getConfigJson().favList );
            me.createIconButtons( ConfigManager.getConfigJson().favList );
        }

        return me;

    }

    me.createIconButtons = function( favData ) 
    {
// TODO: GREG: BUG FIX HERE
        me.configFavUserRole( ( ConnManagerNew.statusInfo.appMode === 'Online' ), favData, function( favList ){

            var networkStatus = ConnManagerNew.statusInfo.appMode.toLowerCase();

            (favList).sort(function (a, b) {
                var a1st = -1, b1st =  1, equal = 0; // zero means objects are equal
                if (b.id < a.id) {
                    return b1st;
                }
                else if (a.id < b.id) {
                    return a1st;
                }
                else {
                    return equal;
                }
            });

            //me.favIconsTag = $( '#pageDiv' ).find( 'div.floatListMenuSubIcons' ); //$( '#pageDiv' ).find( 'div.floatListMenuSubIcons' );
            //me.favIconsTag.empty();

            $( '#pageDiv' ).find( 'div.fab__child-section' ).remove();

            me.favIconsTag = $( '#pageDiv' ).find( 'div.fab-wrapper' ); //$( '#pageDiv' ).find( 'div.floatListMenuSubIcons' );

            var favItems = AppInfoManager.getFavIcons();

            me.createRecursiveFavIcons ( favList, 0, ( favItems != undefined && favItems.length > 0 ) )

        } );


    }

    me.configFavUserRole = function( bOnline, favData, callBack )
    {
        var compareList = ( bOnline ) ? favData.online : favData.offline;
        var retAreaList = [];

        for ( var i=0; i< compareList.length; i++ )
        {
           if ( compareList[ i ].userRoles )
           {
               for ( var p=0; p< compareList[ i ].userRoles.length; p++ )
               {
                   if ( FormUtil.login_UserRole.includes( compareList[ i ].userRoles[ p ] ) )
                   {
                       retAreaList.push( compareList[ i ] );
                       break;
                   }
               }
           }
           else
           {
            retAreaList.push( compareList[ i ] );
           }
        }

        if ( callBack ) callBack( retAreaList );
    
    };

	me.createRecursiveFavIcons = function( favList, favItm, bAppend, callBack )
	{

        if ( favList[ favItm ] )
        {

            if ( bAppend && bAppend == true )
            {
                var unqID = Util.generateRandomId();
                var favItem = $( me.favItemTemplate );

                favItem.find( '.fab__child-text' ).attr( 'term', favList[ favItm ].term );
                favItem.find( '.fab__child-text' ).attr( 'term', favList[ favItm ].term );

                var divTag = $( '<div id="favIcon_'+unqID+'" seq="' + favList[ favItm ].id + '" name="' + (favList[ favItm ].name).toString().toLowerCase().replace(' ','_') + '" class="iconClicker pointer" />');
                var svgObject = me.fetchFavIcon( favList[ favItm ].id );

                $( svgObject ).attr( 'id', 'svg_'+unqID );

                divTag.append( svgObject );
                me.favIconsTag.append( divTag );

                if ( favList[ favItm ].target )
                {
                    me.setFavIconClickTarget ( favList[ favItm ].target, unqID );

                    if ( favList.length > ( parseInt(favItm) +1  ) && favList[ parseInt(favItm) +1  ] )
                    {
                        me.createRecursiveFavIcons( favList, ( parseInt(favItm) +1 ), bAppend );
                    }
                    else
                    {
                        me.cwsRenderObj.langTermObj.translatePage();
                    }
                }
                else
                {
                    me.cwsRenderObj.langTermObj.translatePage();
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

    me.setFavIconClickTarget = function( favTarget, targetID )
    {
        // Greg: you modified this code 2020-04-22 @ 08h43 (maybe revert?)
        $( '#favIcon_'+targetID ).off( 'click' );

        // Weird > bindings being lost after 1st click event: solved
        //$(document).on('click', '#favIcon_'+targetID, function() {

        $( '#favIcon_'+targetID ).click( function() {
            console.log( favTarget );
            if ( favTarget.blockId )
            {
                $( 'div.scrim').hide();
                me.cwsRenderObj.renderBlock( favTarget.blockId, favTarget.options )
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

        if ( favIconObj )
        {
            for ( var i = 0; i < favIconObj.length; i++ )
            {
                var favItm = ( favIconObj[ i ] );

                if ( favItm.id == iconID )
                {
                    //console.log( decodeURI( favItm.svg ) );
                    return $( decodeURI( favItm.svg ) );
                }
            }

        }
    }

    // empty existing container - force a recreate of SVG content
    AppInfoManager.removeFavIcons();

	// ------------------------------------

	me.initialize();
}