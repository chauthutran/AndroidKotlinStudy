
// Sync List Item could be named 'ActivityItem'
//  - This 'ActivityItemService' class is for ...
// 
// -------------------------------------------
// -- Block Class/Methods
function ActivityItem( itemJson, itemTag, cwsRenderObj )
{
	var me = this;

    me.cwsRenderObj = cwsRenderObj;
    me.itemJson = itemJson;
    me.itemTag = itemTag;
    
	// =============================================
	// === TEMPLATE METHODS ========================

	//me.initialize = function() {}

	//me.render = function() {}  // <-- if we create it to display on the list initially...

    // -------------
    
    me.updateItemData = function( success, responseJson )
    {

    };

    me.updateItemUI_StartSync = function()
    {

    };

    me.updateItemUI_FinishSync = function( success, responseJson )
    {

    };

}