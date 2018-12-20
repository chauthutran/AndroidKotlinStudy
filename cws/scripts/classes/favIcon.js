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

        if ( FormUtil.dcdConfig && FormUtil.dcdConfig.favActionList )
        {
            me.createIconButtons( FormUtil.dcdConfig.favActionList );
        }

        return me;

    }

    me.createIconButtons = function( favData ) {

        var favList = favData;

        if ( favList )
        {
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

            me.favIconsTag.empty();

            me.createRecursiveFavIcons ( favList, 0 )
        }

    }

	me.createRecursiveFavIcons = function( favList, favItm )
	{
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
                        $( svgObject ).find("tspan").html(favList[favItm].name) 

                        if ( favList[favItm].colors )
                        {
                            if ( favList[favItm].colors.background )
                            {
                                $( svgObject ).html( $(svgObject).html().replace(/{BGFILL}/g, favList[favItm].colors.background) );
                                $( svgObject ).attr( 'colors.background', favList[favItm].colors.background );
                                //console.log ( '   ~ replace bgcolor: ' + favList[favItm].colors.background);
                            }
                            if ( favList[favItm].colors.foreground )
                            {
                                $( svgObject ).html( $(svgObject).html().replace(/{COLOR}/g, favList[favItm].colors.foreground) );
                                $( svgObject ).attr( 'colors.foreground', favList[favItm].colors.foreground );
                                //console.log ( '   ~ replace color: ' + favList[favItm].colors.foreground);
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
                    $( svgObject ).find("tspan").html(favList[favItm].name) 

                    if ( favList[favItm].colors )
                    {
                        if ( favList[favItm].colors.background )
                        {
                            $( svgObject ).html( $(svgObject).html().replace(/{BGFILL}/g, favList[favItm].colors.background) );
                            $( svgObject ).attr( 'colors.background', favList[favItm].colors.background );
                            //console.log ( '   ~ replace bgcolor: ' + favList[favItm].colors.background);
                        }
                        if ( favList[favItm].colors.foreground )
                        {
                            $( svgObject ).html( $(svgObject).html().replace(/{COLOR}/g, favList[favItm].colors.foreground) );
                            $( svgObject ).attr( 'colors.foreground', favList[favItm].colors.foreground );
                            //console.log ( '   ~ replace color: ' + favList[favItm].colors.foreground);
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

        }

    }

    me.setFavIconClickTarget = function( favTarget, targetID )
    {
        // Weird > bindings being lost after 1st click event
        $(document).on('click', '#favIcon_'+targetID, function() {
            if ( favTarget.blockId )
            {
                //me.cwsRenderObj.updateColorScheme ( $( '#favIcon_'+targetID ) );
                me.cwsRenderObj.renderBlock( favTarget.blockId, favTarget.options )
            }

        });
    }

	// ------------------------------------

	me.initialize();
}