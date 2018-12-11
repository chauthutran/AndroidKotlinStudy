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

            me.incr += 1; 
			var unqID = Util.generateRandomId();
			var divTag = $( '<div id="'+unqID+'" class="iconClicker pointer" />');
            var svg = ( $(data)[0].documentElement );
            me.blockObj;

			$(svg).find("tspan").html(favIcon.name) 
			//$(divTag).on("click", function() {  alert (' you clicked ' + favIcon.name )  } );

            divTag.append( svg );

            //divTag.on("click", function() {  alert (' you clicked ' + favIcon.name )  } );

            //var newBlockButton = new BlockButton ( me.cwsRenderObj )
            //newBlockButton.initialize();
            //newBlockButton.setUpBtnClick ( divTag, favIcon );

            //var newAct = new Action( me.cwsRenderObj, new Block( me.cwsRenderObj, favIcon) );
            //newAct.handleItemClickActions( divTag, favIcon.onClick, me.incr,  )

            //var startBlockObj = new Block( me, me.configJson.definitionBlocks[ clicked_area.startBlockName ], clicked_area.startBlockName, me.renderBlockTag );
            //startBlockObj.renderBlock();  // should been done/rendered automatically?

            divTag.on("click", function() {
                alert (' you clicked ' + favIcon.name )
                me.cwsRenderObj.ResetAreaDisplay();
				//var startBlockObj = new Block( me, me.configJson.definitionBlocks[ clicked_area.startBlockName ], clicked_area.startBlockName, me.renderBlockTag );
				//startBlockObj.renderBlock();  // should been done/rendered automatically?
            });

            me.favIconsTag.append( divTag );

		});

	}

	// ------------------------------------


	me.initialize();
}