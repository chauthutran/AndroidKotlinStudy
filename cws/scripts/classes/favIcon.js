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

        //me.favIconsTag.empty();

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

            me.createRecursiveFavIconButton ( favList, 0 )
        }

        //me.favIconsTag.empty();
        //console.log( favList );

        /*for ( var f = 0; f < favList.length; f++ )
        {
            me.createFavIconButton( favList[f] );		
        }*/

    }

	me.createRecursiveFavIconButton = function( favList, favItm )
	{

        if ( favList[favItm] )
        {
            console.log ( 'recursive FavIcon: ' + favItm );
            // Greg: this may be a 'risky' method (reads SVG xml structure, then replacees )
            $.get( favList[favItm].img, function(data) {
                //location.pathname +''+ favList[favItm].img
                var unqID = Util.generateRandomId();
                var divTag = $( '<div id="favIcon_'+unqID+'" seq="' + favList[favItm].id + '" name="' + (favList[favItm].name).toString().toLowerCase().replace(' ','_') + '" class="iconClicker pointer" />');
                var svg = ( $(data)[0].documentElement );

                $(svg).find("tspan").html(favList[favItm].name) 

                divTag.append( svg );
                me.favIconsTag.append( divTag );

                if ( favList[favItm].target )
                {
                    me.setFavIconClickTarget ( favList[favItm].target, unqID )

                    if ( favList.length > (favItm+1) )
                    {
                        me.createRecursiveFavIconButton( favList, (favItm+1)  )
                    }
                }

            });
        }

    }

    /*me.createFavIconButton = function( favIcon )
	{
        // Greg: this may be a 'risky' method (reads SVG xml structure, then replacees )
		$.get( favIcon.img, function(data) {
            //location.pathname +''+ favIcon.img
			var unqID = Util.generateRandomId();
			var divTag = $( '<div id="favIcon_'+unqID+'" seq="' + favIcon.id + '" name="' + (favIcon.name).toString().toLowerCase().replace(' ','_') + '" class="iconClicker pointer" />');
            var svg = ( $(data)[0].documentElement );

            $(svg).find("tspan").html(favIcon.name) 

            divTag.append( svg );
            me.favIconsTag.append( divTag );

            if ( favIcon.target )
            {
                me.setFavIconClickTarget ( favIcon.target, unqID )
            }

		});

    }*/

    me.setFavIconClickTarget = function( favTarget, targetID )
    {
        // Weird > bindings being lost after 1st click event
        //tagTarget.on("click", function() {
        $(document).on('click', '#favIcon_'+targetID, function() {

            if ( favTarget.blockId )
            {
                //console.log ( favTarget.options );
                //$( 'li.active > label' ).html( favTarget.name );
                me.cwsRenderObj.renderBlock( favTarget.blockId, favTarget.options )
            }

        });
    }

	// ------------------------------------

	me.initialize();
}