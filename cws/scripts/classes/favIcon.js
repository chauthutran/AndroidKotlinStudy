// -------------------------------------------
// -- BlockMsg Class/Methods
function favIcons( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.favIconsTag = $( 'div.floatListMenuSubIcons' );
    me.incr = 0;

	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================



	// -----------------------------
	// ---- Methods ----------------

	me.initialize = function() {

        if ( FormUtil.dcdConfig && FormUtil.dcdConfig.favList )
        {
            me.createIconButtons( FormUtil.dcdConfig.favList );
        }

        return me;

    }

    me.createIconButtons = function( favData ) {

        var favList = favData;
        var networkStatus = ( ConnManager.getAppConnMode_Online() ) ? 'online' : 'offline';

        if ( favList[ networkStatus ] )
        {
            (favList[ networkStatus ]).sort(function (a, b) {
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

            me.favIconsTag.empty();

            //console.log( favList[ networkStatus ] );
            me.createRecursiveFavIcons ( favList[ networkStatus ], 0 )
        }

    }

	me.createRecursiveFavIcons = function( favList, favItm )
	{

        if ( favList[ favItm ] )
        {

            // read local SVG xml structure, then replace appropriate content 'holders': {TEXT} 
            $.get( favList[ favItm ].img, function(data) {

                var unqID = Util.generateRandomId();
                var divTag = $( '<div id="favIcon_'+unqID+'" seq="' + favList[ favItm ].id + '" name="' + (favList[ favItm ].name).toString().toLowerCase().replace(' ','_') + '" class="iconClicker pointer" />');
                var svgObject = ( $(data)[0].documentElement );

                $( svgObject ).attr( 'id', 'svg_'+unqID );
                $( svgObject ).find("tspan").html( favList[ favItm ].name );

                if ( favList[ favItm ].term )
                {
                    $( svgObject ).html( $(svgObject).html().replace( /{TERM}/g, favList[ favItm ].term ) );
                    //$( svgObject ).attr( 'term', favList[ favItm ].term );
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
                            $( svgObject ).html( $(svgObject).html().replace( /{ICON.BGFILL}/g, '#CCCCCC' ) );
                            $( svgObject ).attr( 'icon.colors.background', '#CCCCCC' );
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
                            $( svgObject ).html( $(svgObject).html().replace( /{LABEL.BGFILL}/g, favList[ favItm ].style.label.colors.background ) );
                            $( svgObject ).attr( 'label.colors.background', favList[ favItm ].style.label.colors.background );
                        }
                        else
                        {
                            $( svgObject ).html( $(svgObject).html().replace( /{LABEL.BGFILL}/g, '#CCCCCC' ) );
                            $( svgObject ).attr( 'label.colors.background', '#CCCCCC' );
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

                divTag.append( svgObject );
                me.favIconsTag.append( divTag );

                if ( favList[ favItm ].target )
                {
                    me.setFavIconClickTarget ( favList[ favItm ].target, unqID )

                    if ( favList.length > (favItm+1) )
                    {
                        me.createRecursiveFavIcons( favList, (favItm+1)  )
                    }
                    else
                    {
                        setTimeout( function() { 
                            //console.log( 'translating favIcons' );
                            me.cwsRenderObj.langTermObj.translatePage()
                        }, 500 );
                    }
                }

            });

        }


        /*
        if ( favList[favItm] )
        {
            var favObj = favList[favItm];
            var networkStatus = ( ConnManager.getAppConnMode_Online() ) ? 'online' : 'offline';

            // 1st test > Current favIcon object supports network connection-status OPTIONS
            if ( favObj.areas )
            {
                // 2nd test > Current favIcon object supports CURRENT network connection-status 
                if ( favObj.areas[ networkStatus ] )
                {
                    //me.recursiveCreateIcon(favObj, )
                    // read local SVG xml structure, then replace appropriate content 'holders': {TEXT} 
                    $.get( favList[favItm].img, function(data) {

                        console.log( 'FavIcon WITH online/offline areas defined ' );

                        var unqID = Util.generateRandomId();
                        var divTag = $( '<div id="favIcon_'+unqID+'" seq="' + favList[favItm].id + '" name="' + (favList[favItm].name).toString().toLowerCase().replace(' ','_') + '" class="iconClicker pointer" />');
                        var svgObject = ( $(data)[0].documentElement );

                        $( svgObject ).attr( 'id', 'svg_'+unqID );
                        $( svgObject ).find("tspan").html( favList[favItm].name );

                        if ( favList[favItm].colors )
                        {
                            if ( favList[favItm].colors.background )
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{BGFILL}/g, favList[favItm].colors.background ).replace( /{ICON.BGFILL}/g, favList[favItm].colors.background ) );
                                $( svgObject ).attr( 'colors.background', favList[favItm].colors.background );
                            }
                            else
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{BGFILL}/g, '#CCCCCC' ).replace( /{ICON.BGFILL}/g, '#CCCCCC' ) );
                                $( svgObject ).attr( 'colors.background', '#CCCCCC' );
                            }
                            if ( favList[favItm].colors.foreground )
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{COLOR}/g, favList[favItm].colors.foreground ).replace( /{ICON.COLOR}/g, favList[favItm].colors.foreground ) );
                                $( svgObject ).attr( 'colors.foreground', favList[favItm].colors.foreground );
                            }
                            else
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{COLOR}/g, '#333333' ).replace( /{ICON.COLOR}/g, '#333333' ) );
                                $( svgObject ).attr( 'colors.foreground', '#333333' );
                            }
                        }
                        if ( favList[favItm].style )
                        {
                            if ( favList[favItm].style.icon)
                            {
                                if (favList[favItm].style.icon.colors.background )
                                {
                                    $( svgObject ).html( $(svgObject).html().replace( /{ICON.BGFILL}/g, favList[favItm].style.icon.colors.background ) );
                                    $( svgObject ).attr( 'icon.colors.background', favList[favItm].style.icon.colors.background );
                                }
                                else
                                {
                                    $( svgObject ).html( $(svgObject).html().replace( /{ICON.BGFILL}/g, '#CCCCCC' ) );
                                    $( svgObject ).attr( 'icon.colors.background', '#CCCCCC' );
                                }
                                if ( favList[favItm].style.icon.colors.foreground )
                                {
                                    $( svgObject ).html( $(svgObject).html().replace( /{ICON.COLOR}/g, favList[favItm].style.icon.colors.foreground ) );
                                    $( svgObject ).attr( 'icon.colors.foreground', favList[favItm].style.icon.colors.foreground );
                                }
                                else
                                {
                                    $( svgObject ).html( $(svgObject).html().replace( /{ICON.COLOR}/g, '#333333' ) );
                                    $( svgObject ).attr( 'icon.colors.foreground', '#333333' );
                                }
                            }
                            if ( favList[favItm].style.label)
                            {
                                if (favList[favItm].style.label.colors.background )
                                {
                                    $( svgObject ).html( $(svgObject).html().replace( /{LABEL.BGFILL}/g, favList[favItm].style.label.colors.background ) );
                                    $( svgObject ).attr( 'label.colors.background', favList[favItm].style.label.colors.background );
                                }
                                else
                                {
                                    $( svgObject ).html( $(svgObject).html().replace( /{LABEL.BGFILL}/g, '#CCCCCC' ) );
                                    $( svgObject ).attr( 'label.colors.background', '#CCCCCC' );
                                }
                                if ( favList[favItm].style.label.colors.foreground )
                                {
                                    $( svgObject ).html( $(svgObject).html().replace( /{LABEL.COLOR}/g, favList[favItm].style.label.colors.foreground ) );
                                    $( svgObject ).attr( 'label.colors.foreground', favList[favItm].style.label.colors.foreground );
                                }
                                else
                                {
                                    $( svgObject ).html( $(svgObject).html().replace( /{LABEL.COLOR}/g, '#333333' ) );
                                    $( svgObject ).attr( 'label.colors.foreground', '#333333' );
                                }
                            }
                        }

                        divTag.append( svgObject );
                        me.favIconsTag.append( divTag );

                        if ( favObj.areas[ networkStatus ].target )
                        {
                            me.setFavIconClickTarget ( favObj.areas[ networkStatus ].target, unqID )

                            if ( favList.length > (favItm+1) )
                            {
                                me.createRecursiveFavIcons( favList, (favItm+1)  )
                            }
                        }
        
                    });

                }
                else
                {
                    if ( favList.length > (favItm+1) )
                    {
                        me.createRecursiveFavIcons( favList, (favItm+1)  )
                    }
                }

            }
            else
            {
                // no online/offline options defined for favIcon - display regardless of network mode/status
                // read local SVG xml structure, then replace appropriate content 'holders': {TEXT} 
                $.get( favList[favItm].img, function(data) {

                    console.log( 'FavIcon withOUT online/offline areas defined ' );

                    var unqID = Util.generateRandomId();
                    var divTag = $( '<div id="favIcon_'+unqID+'" seq="' + favList[favItm].id + '" name="' + (favList[favItm].name).toString().toLowerCase().replace(' ','_') + '" class="iconClicker pointer" />');
                    var svgObject = ( $(data)[0].documentElement );

                    $( svgObject ).attr( 'id', 'svg_'+unqID );
                    $( svgObject ).find("tspan").html( favList[favItm].name );

                    if ( favList[favItm].colors )
                    {
                        if ( favList[favItm].colors.background )
                        {
                            $( svgObject ).html( $(svgObject).html().replace( /{BGFILL}/g, favList[favItm].colors.background ) );
                            $( svgObject ).attr( 'colors.background', favList[favItm].colors.background );
                        }
                        else
                        {
                            $( svgObject ).html( $(svgObject).html().replace( /{BGFILL}/g, '#CCCCCC' ) );
                            $( svgObject ).attr( 'colors.background', '#CCCCCC' );
                        }
                        if ( favList[favItm].colors.foreground )
                        {
                            $( svgObject ).html( $(svgObject).html().replace( /{COLOR}/g, favList[favItm].colors.foreground ) );
                            $( svgObject ).attr( 'colors.foreground', favList[favItm].colors.foreground );
                        }
                        else
                        {
                            $( svgObject ).html( $(svgObject).html().replace( /{COLOR}/g, '#333333' ) );
                            $( svgObject ).attr( 'colors.foreground', '#333333' );

                        }
                    }
                    if ( favList[favItm].style )
                    {
                        if ( favList[favItm].style.icon )
                        {
                            if (favList[favItm].style.icon.colors.background )
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{ICON.BGFILL}/g, favList[favItm].style.icon.colors.background ) );
                                $( svgObject ).attr( 'icon.colors.background', favList[favItm].style.icon.colors.background );
                            }
                            else
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{ICON.BGFILL}/g, '#CCCCCC' ) );
                                $( svgObject ).attr( 'icon.colors.background', '#CCCCCC' );
                            }
                            if ( favList[favItm].style.icon.colors.foreground )
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{ICON.COLOR}/g, favList[favItm].style.icon.colors.foreground ) );
                                $( svgObject ).attr( 'icon.colors.foreground', favList[favItm].style.icon.colors.foreground );
                            }
                            else
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{ICON.COLOR}/g, '#333333' ) );
                                $( svgObject ).attr( 'icon.colors.foreground', '#333333' );                                
                            }
                        }
                        if ( favList[favItm].style.label)
                        {
                            if (favList[favItm].style.label.colors.background )
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{LABEL.BGFILL}/g, favList[favItm].style.label.colors.background ) );
                                $( svgObject ).attr( 'label.colors.background', favList[favItm].style.label.colors.background );
                            }
                            else
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{LABEL.BGFILL}/g, '#CCCCCC' ) );
                                $( svgObject ).attr( 'label.colors.background', '#CCCCCC' );
                            }
                            if ( favList[favItm].style.label.colors.foreground )
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{LABEL.COLOR}/g, favList[favItm].style.label.colors.foreground ) );
                                $( svgObject ).attr( 'label.colors.foreground', favList[favItm].style.label.colors.foreground );
                            }
                            else
                            {
                                $( svgObject ).html( $(svgObject).html().replace( /{LABEL.COLOR}/g, '#333333' ) );
                                $( svgObject ).attr( 'label.colors.foreground', '#333333' );
                            }
                        }
                    }

                    divTag.append( svgObject );
                    me.favIconsTag.append( divTag );

                    if ( favList[favItm].target )
                    {
                        me.setFavIconClickTarget ( favList[favItm].target, unqID )
    
                        if ( favList.length > (favItm+1) )
                        {
                            me.createRecursiveFavIcons( favList, (favItm+1)  )
                        }
                    }

                });

            }

        }*/

    }

    me.setFavIconClickTarget = function( favTarget, targetID )
    {
        // Weird > bindings being lost after 1st click event: solved
        $(document).on('click', '#favIcon_'+targetID, function() {
            if ( favTarget.blockId )
            {
                $( '#focusRelegator').hide();
                me.cwsRenderObj.renderBlock( favTarget.blockId, favTarget.options )
            }

        });
    }

	// ------------------------------------

	me.initialize();
}