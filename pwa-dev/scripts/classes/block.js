// -------------------------------------------
// -- Block Class/Methods
function Block( cwsRenderObj, blockDefJson, blockId, parentTag, passedData, options, actionJson )
{	
	var me = this;

    me.cwsRenderObj = cwsRenderObj;

	me.blockType = ( blockDefJson ) ? blockDefJson.blockType : undefined;
	me.blockDefJson =  Util.cloneJson( blockDefJson );  // Make a deep copy so that changes to blockDefJson does not affect original config
	me.blockId = blockId;	// TODO: Should be 'blockName' but since used in config as 'blockId', need to replace together..
	// TODO: CHANGE ABOVE 'blockId' with Greg

	me.blockUid = Util.generateTimedUid();  //<-- Can generate timed unique id..
	me.parentTag = parentTag;

	me.passedData = passedData;
	me.options = ( options ) ? options: {};  // Not used much for now anymore..
	me.actionJson = actionJson; // if block were created from 'action', the clickActionJson data(config) passed.  Use it when rendering

	me.blockTag;

	// -- Sub class objects -----
	//me.actionObj; // <-- Moved to inside of blockButton class..

	// TODO: Below reference might be obsolete
	me.blockFormObj;
	//me.blockListObj;
	me.activityListObj;
	me.dataListObj;
	me.blockButtonObj;
	me.blockMsgObj;

	me.blockButtonListObj;  // New Class/Object to implement
	
	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setInitialData();				
	}

	me.render = function( areaType )
	{
		// Form BlockTag generate/assign
		//me.clearClassTag( me.blockId, me.parentTag );
		me.blockTag = me.createBlockTag( me.blockId, me.blockType, me.blockDefJson, me.parentTag, me.options );


		if ( me.blockDefJson )
		{					
			// gAnalytics Event
			GAnalytics.setEvent( 'BlockOpen', me.blockId, me.blockType, 1 );

			
			// Render Form
			if ( me.blockDefJson.form ) 
			{
				// TODO: me.blockFormObj should be change to var blockFormObj = new --
				me.blockFormObj = new BlockForm( me.cwsRenderObj, me, me.actionJson );
				me.blockFormObj.render( me.blockDefJson.form, me.blockTag, me.passedData );
			}
			
			//me.blockListObj = new BlockList( me.cwsRenderObj, me, me.blockDefJson );
			//me.blockListObj.render( me.blockTag, me.passedData ); //, me.options );

			// Render List ( 'redeemList' is block with listing items.  'dataList' is web service returned data rendering )
			if ( me.blockDefJson.list === 'redeemList' || me.blockDefJson.list === 'activityList' )
			{
				me.activityListObj = new ActivityList( me.cwsRenderObj, me, me.blockDefJson, me.options );
				me.activityListObj.render( me.blockTag, me.passedData );				
			}
			else if ( me.blockDefJson.list === 'clientList' )
			{
				me.clientListObj = new ClientList( me.cwsRenderObj, me, me.blockDefJson );
				me.clientListObj.render( me.blockTag, me.passedData );
			}
			else if ( me.blockDefJson.list === 'dataList' )
			{
				me.dataListObj = new DataList( me.cwsRenderObj, me );
				me.dataListObj.render( me.blockDefJson, me.blockTag, me.passedData ); //, me.options );
			} 
			else if ( me.blockDefJson.list === 'itemCardList' )
			{
				me.itemCardListObj = new ItemCardList( me.cwsRenderObj, me, me.blockDefJson );
				me.itemCardListObj.render( me.blockTag, me.passedData );
			} 

			// Render Buttons
			if ( me.blockDefJson.buttons ) 
			{
				me.blockButtonObj = new BlockButton( me.cwsRenderObj, me );
				me.blockButtonObj.render( me.blockDefJson.buttons, me.blockTag, undefined );
			}


			// Render Msg
			if ( me.blockDefJson.message ) 
			{
				me.blockMsgObj = new BlockMsg( me.cwsRenderObj, me );
				me.blockMsgObj.render( me.blockDefJson.message, me.blockTag, me.passedData );
			}			
		}

		TranslationManager.translatePage();
	}

	// ------------------

	me.setInitialData = function()
	{
		// Set to be able to reference this object in either 'blockUid' or 'blockId'
		me.cwsRenderObj.blocks[ me.blockUid ] = me;  // add this block object to the main block memory list - for global referencing
		me.cwsRenderObj.blocks[ me.blockId ] = me;  // add this block object to the main block memory list - for global referencing

		if ( me.blockDefJson ) me.blockType = me.blockDefJson.blockType;
	}

	// =============================================


	// =============================================
	// === EVENT HANDLER METHODS ===================
	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	// Not being used
	me.clearClassTag = function( blockId, parentTag )
    {
        // Clear any previous ones of this class
		//parentTag.find( 'div.block[blockId="' + blockId + '"]' ).remove(); //Greg: remove for v1.3?

		// QUESTION: WHY BELOW WERE IMPLEMENTED?
		//parentTag.removeAttr( 'blockId' );
		//parentTag.removeAttr( 'activityType' );
		//parentTag.empty();
	};
	

	me.createBlockTag = function( blockId, blockType, blockDefJson, parentTag, options )
	{
		//var blockTag = $( '<div class="block" blockId="' + blockId + '" activityType="' + blockDefJson.activityType + '"></div>' );
		var blockTag = $( '<div class="block" blockId="' + blockId + '" activityType="' + Util.getStr( blockDefJson.activityType ) + '"></div>' );
		blockTag.addClass( blockType );

		// NEW TRIAL..  CURRENTLY, NOT BEING USED..
		if ( options.blockCssWidth ) blockTag.css( 'width', blockCssWidth );

		// Put it under parentTag
		parentTag.append( blockTag.addClass( 'blockStyle' ) );		

		return blockTag;
	}

	// QUESTION: BELOW Option is being used??
	// If 'me.options.notClear' exists and set to be true, do not clear the parent Tag contents
	//if ( me.options && me.options.notClear ) {};
	//{
		// Clear any existing block - not always..  We could have option to hide instead for 'back' feature.
		//parentTag.find( 'div.block' ).remove();
		//parentTag.find( 'div.wrapper' ).empty();

	// ===============================
	// === External Methods ====

	me.hideBlock = function()
	{
		me.blockTag.hide();
	}

	me.getBlockTag = function()
	{
		return me.blockTag;
	}

	me.getParentTag = function()
	{
		return me.parentTag;
	}

	// -------------------------------
	
	me.initialize();
}