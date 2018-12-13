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

        me.favIconsTag.empty();

        if ( FormUtil.dcdConfig && FormUtil.dcdConfig.favActionList )
        {
            me.createIconButtons( FormUtil.dcdConfig.favActionList );
        }

        return me;

    }

    me.createIconButtons = function( favData ) {

        for ( var f = 0; f < favData.length; f++ )
        {
            //let favIcon = favData[f];
            me.createFavIconButton( favData[f] );		
        }
    }

	me.createFavIconButton = function( favIcon )
	{

        // Greg: this may be a 'risky' method (reads SVG xml structure, then replacees )
		$.get( location.pathname +''+ favIcon.img, function(data) {

			var unqID = Util.generateRandomId();
			var divTag = $( '<div id="favIcon_'+unqID+'" class="iconClicker pointer" />');
            var svg = ( $(data)[0].documentElement );

            $(svg).find("tspan").html(favIcon.name) 

            divTag.append( svg );
            me.favIconsTag.append( divTag );

            if ( favIcon.target )
            {
                me.setFavIconClickTarget ( favIcon.target, unqID )
            }

		});

    }

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