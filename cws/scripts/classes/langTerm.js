// -------------------------------------------
// -- LangTerm Class/Methods
function LangTerm( cwsRenderObj )
{
	var me = this;

	me.cwsRenderObj = cwsRenderObj;
	
	me.langTerms = [];
	me.langTermsByLang = {};
	me.currentLangTerm = {};

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

	// MAIN METHOD 1.
	// Retrieve it from ws and put it on local storage or local store location
	me.retrieveLangTermInner = function( lang, returnFunc )
	{
		//var lang = "en";

		var queryLoc = '/api/langTerms?lang=' + lang;  // '/api/langTerms' for all lang..
		var loadingTag = undefined;

		// Do silently?  translate it afterwards?  <-- how do we do this?
		// config should also note all the 'term' into tags..
		FormUtil.wsRetrievalGeneral( queryLoc, loadingTag, function( returnJson )
		{
			if ( returnJson )
			{
				console.log( 'langTerm: ' );
				console.log( returnJson );

				if ( returnFunc ) returnFunc( returnJson );
			}
			else
			{
				// Try retrieving all dailyCache on WebService..

				// try running the dailyCache
				FormUtil.wsSubmitGeneral( '/api/dailyCache', { "project": "234823" }, loadingTag, function( success, allLangTermsJson ) {
					if ( success && allLangTermsJson )
					{
						console.log( 'all langTerm: ' );
						console.log( allLangTermsJson );

						var enLangTerm = {};

						if ( allLangTermsJson.langauges )
						{
							var enLang = Util.getFromList( allLangTermsJson.langauges, "en", "code" );
							if ( enLang ) enLangTerm = enLang.terms;
						}

						if ( returnFunc ) returnFunc( enLangTerm );
					}
					else
					{
						console.log( 'all langTerm FAILED: ' );

						if ( returnFunc ) returnFunc( new Object() );
					}
				});			
			}
		});
	}

	me.retrieveLangTerm = function( lang, returnFunc )
	{
		me.retrieveLangTermInner( lang, function( returnJson )
		{
			me.currentLangTerm = returnJson;
			returnFunc( returnJson );
		});
	}

	
	// MAIN METHOD 2.
	me.translatePage = function()
	{
		var termCollection = {};

		// 1. Get the terms unique collection from site/page
		var tagsWithTerm = $( '[term]' );

		tagsWithTerm.each( function() 
		{
			var tag = $( this );

			var termName = tag.attr( 'term' );

			console.log( 'termName: ' + termName );

			termCollection[ termName ] = "";
		});


		// go through the term and translate them through out the page
		for ( var termName in termCollection )
		{
			var termVal = me.currentLangTerm[ termName ];

			if ( termVal )
			{
				console.log( 'translating term: ' + termName + ', val: ' + termVal );
				var tag = $( '[term="' + termName + '"]' );
				tag.html( termVal );
			}
		}
	}

	// 1. On config json, We need to populate 'term' & 'defaultTerm'
	// 2. When rendering as HTML, we need to add 'term'='' on all the tags
	// 3. When translating, look at the 'term' tag

	// -------------------------------
	
	me.initialize();
}