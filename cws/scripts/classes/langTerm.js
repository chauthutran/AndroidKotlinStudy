// -------------------------------------------
// -- LangTerm Class/Methods
function LangTerm( cwsRenderObj )
{
	var me = this;

    me.cwsRenderObj = cwsRenderObj;

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setInitialData();

		me.createSubClasses();				
	}

	me.render = function() { }

	// ------------------

	me.setInitialData = function() {}
	me.createSubClasses = function() {}
	//me.setEvents_OnInit = function() { }

	// =============================================


	// =============================================
	// === EVENT HANDLER METHODS ===================
	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========
	// -------------------------------
	
	me.initialize();
}