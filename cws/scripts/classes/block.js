// -------------------------------------------
// -- Block Class/Methods
function Block( cwsRenderObj, blockJson, blockId, parentTag, passedData, options )
{
	var me = this;

    me.cwsRenderObj = cwsRenderObj;

	me.blockType = ( blockJson ) ? blockJson.blockType : undefined;
	me.blockJson = blockJson;
	me.blockId = blockId;	// Block Type Name <-- from config, blockId
	me.parentTag = parentTag;
	me.passedData = passedData;
	me.options = options;

	//me.uid = // Need to create unique id? (new Date().getTime()).toString(36) + count?

	me.blockTag;

	// -- Sub class objects -----
	me.actionObj;
	me.validationObj;
	me.blockFormObj;
	me.blockListObj;
	me.dataListObj;
	me.blockButtonObj;
	me.blockMsgObj;

	me.blockButtonListObj;  // New Class/Object to implement

	/*
	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		// On subClasses, they need blockTag..
		me.blockTag = me.createBlockTag( me.blockId, me.blockType, me.parentTag );

		me.createSubClasses( me.cwsRenderObj, me.blockJson, me.blockTag, me.passedData );

		me.setEvents_OnInit();
	}
	
	me.render = function()
	{
		if ( me.blockFormObj ) me.blockFormObj.render();
		if ( me.blockListObj ) me.blockListObj.render();
		//if ( me.dataListObj ) me.dataListObj.render();
		if ( me.blockButtonObj ) me.blockButtonObj.render();
		if ( me.blockMsgObj ) me.blockMsgObj.render();
	}

	// ------------------

	me.createSubClasses = function( cwsRenderObj, blockJson, blockTag, passedData )
	{
		if ( blockJson )
		{			
			// Render Form
			if ( blockJson.form ) me.blockFormObj = new blockForm( cwsRenderObj, me, blockJson.form, blockTag, passedData );
			
			// Render List
			if ( blockJson.list ) 
			{
				me.blockListObj = new blockForm( cwsRenderObj, me, blockJson.list, blockTag, passedData );

				// NOTE: WS Result is list
				//me.dataListObj = new DataList( cwsRenderObj, me, blockJson.list, blockTag, passedData );
			}

			if ( me.blockJson.buttons ) me.blockButtonObj = new blockButton( cwsRenderObj, me, blockJson.buttons, blockTag, undefined );
			// TODO: NEED TO CREATE BUTTON LIST CLASS.

			if ( me.blockJson.message ) me.blockMsgObj = new blockMsg( cwsRenderObj, me, blockJson.message, blockTag, passedData );
		}			
	}

	me.setEvents_OnInit = function()
	{		
	}
	// =============================================


	// =============================================
	// === EVENT HANDLER METHODS ===================
	

	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========
	

	*/

	// -----------------------------
	// ---- Methods ----------------
	
	me.initialize = function()
	{
		me.actionObj = new Action( me.cwsRenderObj, me );
		me.validationObj = new Validation( me.cwsRenderObj, me );
		me.blockFormObj = new BlockForm( me.cwsRenderObj, me ); // Do this only if exists/needed
		me.blockListObj = new BlockList( me.cwsRenderObj, me );	// Do this only if exists/needed		
		me.dataListObj = new DataList( me.cwsRenderObj, me );	// Do this only if exists/needed
		me.blockButtonObj = new BlockButton( me.cwsRenderObj, me );
		me.blockMsgObj = new BlockMsg( me.cwsRenderObj, me );
				
		if ( me.blockJson ) me.blockType = me.blockJson.blockType;

		me.blockTag = me.createBlockTag( me.blockId, me.blockType, me.parentTag );
	}

	// --------------------------------------

	me.renderBlock = function()
	{
		// We could appent to parentTag here is desired..

		console.log( 'on renderBlock, me.blockJson: ' + JSON.stringify( me.blockJson ) );

		if ( me.blockJson )
		{			
			// TODO: CREATE BLOCKDATA CLASS TO HANDLE ALL THESE..
			me.cwsRenderObj.blockData[ me.blockId ] = {};

			// Render Form
			me.blockFormObj.renderForm( me.blockJson.form, me.blockTag, me.passedData );

			// Render List
			me.blockListObj.renderList( me.blockJson.list, me.blockTag, me.passedData );

			// Reder Data List
			//me.dataListObj.initialize( me.passedData, me.blockJson );
			me.dataListObj.renderList( me.blockJson, me.blockTag, me.passedData );

			// Render Buttons
			me.blockButtonObj.renderBlockButtons( me.blockJson.buttons, me.blockTag, undefined );


			// Render Msg
			me.blockMsgObj.renderMessage( me.blockJson.message, me.blockTag, me.passedData );
		}			
	}

	// -------------------------------
	// --- Methods -------------------

	me.createBlockTag = function( blockId, blockType, parentTag )
	{
		var blockTag = $( '<div class="block" blockId="' + blockId + '"></div>' );
		blockTag.addClass( blockType );


		// If 'me.options.notClear' exists and set to be true, do not clear the parent Tag contents
		if ( !( me.options && me.options.notClear ) )
		{
			// Clear any existing block - not always..  We could have option to hide instead for 'back' feature.
			parentTag.find( 'div.block' ).remove();
		}


		// Put it under parentTag
		parentTag.append( blockTag.addClass( 'blockStyle' ) );		
		
		return blockTag;
	}

	me.hideBlock = function()
	{
		me.blockTag.hide();
	}

	// -------------------------------
	
	me.initialize();
}