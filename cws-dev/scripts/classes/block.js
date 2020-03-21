// -------------------------------------------
// -- Block Class/Methods
function Block( cwsRenderObj, blockJson, blockId, parentTag, passedData, options, actionJson )
{	
	var me = this;

    me.cwsRenderObj = cwsRenderObj;

	me.blockType = ( blockJson ) ? blockJson.blockType : undefined;
	me.blockJson =  Util.getJsonDeepCopy( blockJson );  // Make a deep copy so that changes to blockJson does not affect original config
	me.blockId = blockId;	// TODO: Should be 'blockName' but since used in config as 'blockId', need to replace together..
	// TODO: CHANGE ABOVE 'blockId' with Greg

	me.blockUid = Util.generateTimedUid();  //<-- Can generate timed unique id..
	me.parentTag = parentTag;
	me.passedData = passedData;
	me.options = options;
	me.actionJson = actionJson; // if block were created from 'action', the clickActionJson data(config) passed.  Use it when rendering

	me.blockTag;

	// -- Sub class objects -----
	//me.actionObj; // <-- Moved to inside of blockButton class..
	
	me.validationObj;  // <-- Should be static Class/Method..

	// TODO: Below reference might be obsolete
	me.blockFormObj;
	me.blockListObj;
	me.dataListObj;
	me.blockButtonObj;
	me.blockMsgObj;

	me.blockButtonListObj;  // New Class/Object to implement
	
	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setInitialData();

		me.validationObj = new Validation( me.cwsRenderObj, me );
		//me.createSubClasses();				
	}

	me.render = function()
	{
		// Form BlockTag generate/assign
		me.clearClassTag( me.blockId, me.parentTag );
		me.blockTag = me.createBlockTag( me.blockId, me.blockType, me.parentTag );


		if ( me.blockJson )
		{
			// Render Form
			if ( me.blockJson.form ) 
			{
				// TODO: me.blockFormObj should be change to var blockFormObj = new --
				me.blockFormObj = new BlockForm( me.cwsRenderObj, me, me.validationObj, me.actionJson );
				me.blockFormObj.render( me.blockJson.form, me.blockTag, me.passedData );
			}


			// Render List ( 'redeemList' is block with listing items.  'dataList' is web service returned data rendering )
			if ( me.blockJson.list === 'redeemList' || me.blockJson.list === 'activityList' )
			{
				me.blockListObj = new BlockList( me.cwsRenderObj, me, me.blockJson );
				me.blockListObj.render( me.blockTag, me.passedData, me.options );
			}
			else if ( me.blockJson.list === 'dataList' )
			{
				me.dataListObj = new DataList( me.cwsRenderObj, me );
				me.dataListObj.render( me.blockJson, me.blockTag, me.passedData, me.options );
			} 


			// Render Buttons
			if ( me.blockJson.buttons ) 
			{
				me.blockButtonObj = new BlockButton( me.cwsRenderObj, me, me.validationObj );
				me.blockButtonObj.render( me.blockJson.buttons, me.blockTag, undefined );
			}


			// Render Msg
			if ( me.blockJson.message ) 
			{
				me.blockMsgObj = new BlockMsg( me.cwsRenderObj, me );
				me.blockMsgObj.render( me.blockJson.message, me.blockTag, me.passedData );
			}
		}

		me.cwsRenderObj.langTermObj.translatePage();
	}

	// ------------------

	me.setInitialData = function()
	{
		// Set to be able to reference this object in either 'blockUid' or 'blockId'
		me.cwsRenderObj.blocks[ me.blockUid ] = me;  // add this block object to the main block memory list - for global referencing
		me.cwsRenderObj.blocks[ me.blockId ] = me;  // add this block object to the main block memory list - for global referencing

		if ( me.blockJson ) me.blockType = me.blockJson.blockType;
	}

	me.createSubClasses = function()
	{
		//me.actionObj = new Action( me.cwsRenderObj, me );
		//me.validationObj = new Validation( me.cwsRenderObj, me );
	}

	//me.setEvents_OnInit = function() { }

	// =============================================


	// =============================================
	// === EVENT HANDLER METHODS ===================
	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.clearClassTag = function( blockId, parentTag )
    {
        // Clear any previous ones of this class
        parentTag.find( 'div.block[blockId="' + blockId + '"]' ).remove();
	};
	

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