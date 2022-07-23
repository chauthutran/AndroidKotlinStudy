// -------------------------------------------
// -- BlockMsg Class/Methods
function jobAidPage( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;

    me.options = {
        'title': 'Job Aid',
        'term': 'form_title_jobAid',
        'cssClasses': ['divJobAidPage'],
        'zIndex': 1600
    };

    me.sheetFullTag;


	// =============================================
	// === TEMPLATE METHODS ========================

    me.initialize = function() 
    {
        //me.setEvents_OnInit();
    }

	// ------------------

    me.render = function() 
    {
        //me.options.preCall = function(sheetFullTag) {};

		me.sheetFullTag = FormUtil.sheetFullSetup( Templates.sheetFullFrame, me.options );
		
        // blockParentAreaTag = sheetFullTag.find( '.contentBody' );

        //me.populateAboutPageData( ConfigManager.getConfigJson() );
        
        TranslationManager.translatePage();
    }

	// ------------------

	// ------------------------------------

	me.initialize();
}