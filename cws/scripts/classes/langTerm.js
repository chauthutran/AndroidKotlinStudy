// -------------------------------------------
// -- LangTerm Class/Methods
function LangTerm( cwsRenderObj )
{
	var me = this;

	me.cwsRenderObj = cwsRenderObj;
	
	me.allLangTerms = {};
	me.langList = [];
	
	me.currentLangTerms = {};
	me.currentLangcode = "";

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

	// Retrieve All Languages Term.
	// MAIN METHOD 1.
	me.retrieveAllLangTerm = function( returnFunc, forceDownload )
	{	
		// No Reset?	
		//me.allLangTerms = undefined;

		// If exists in local storage, load it.
		// Otherwise, retrieve it
		var langTerms = ( forceDownload ) ? undefined : DataManager.getData( DataManager.StorageName_langTerms );
		
		if ( langTerms )
		{
			console.log( '=== LANG TERMS ==> Local Storage Data Loaded' );

			me.allLangTerms = langTerms;
			me.setLanguageList( me.allLangTerms );

			console.log( me.allLangTerms );

			returnFunc( langTerms );
		}
		else
		{
			console.log( '=== LANG TERMS ==> Retrieving from Web Service' );
			me.retrieveAllLangTermInner( function( returnJson )
			{				
				me.allLangTerms = returnJson;
				me.setLanguageList( me.allLangTerms );

				console.log( me.allLangTerms );

				if ( returnJson ) DataManager.saveData( DataManager.StorageName_langTerms, returnJson );
				
				returnFunc( returnJson );
			});
		}
	}


	// Retrieve it from ws and put it on local storage or local store location
	me.retrieveAllLangTermInner = function( returnFunc )
	{
		//var lang = "en";

		var queryLoc = '/api/langTerms' //?lang=' + lang;  // '/api/langTerms' for all lang..
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
				console.log( '=== LANG TERMS ==> Requesting Web Service To DOWNLOAD TRANSLATIONS' );

				// try running the dailyCache
				FormUtil.wsSubmitGeneral( '/api/dailyCache', { "project": "234823" }, loadingTag, function( success, allLangTermsJson ) {
					if ( success && allLangTermsJson )
					{
						console.log( 'all langTerm: ' );
						console.log( allLangTermsJson );
						
						if ( returnFunc ) returnFunc( allLangTermsJson );
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
			var termVal = me.currentLangTerms[ termName ];

			if ( termVal )
			{
				console.log( 'translating term: ' + termName + ', val: ' + termVal );
				var tag = $( '[term="' + termName + '"]' );
				tag.html( termVal );
			}
		}
	}


	// ==================================================
	// === Used Methods ======


	me.setCurrentLang = function( langCode )
	{
		me.currentLangcode = langCode;

		me.currentLangTerms = me.getLangTerms( langCode );
	}


	me.getCurrentLangCode = function()
	{
		return me.currentLangcode;
	}


	me.getLangTerms = function( langCode )
	{
		var returnLangTerms = {};

		if ( me.allLangTerms && me.allLangTerms.languages )
		{
			var langTerms = Util.getFromList( me.allLangTerms.languages, langCode, "code" );
			if ( langTerms ) returnLangTerms = langTerms.terms;
		}

		return returnLangTerms;
	}


	me.getLangList = function()
	{
		return me.langList;
	}

	me.setLanguageList = function( allLangTerms )
	{
		me.langList = [];

		if ( allLangTerms && allLangTerms.languages )
		{
			//console.log( 'setLanguageList' );
			for( i = 0; i < allLangTerms.languages.length; i++ )
			{
				var langJson = allLangTerms.languages[i];

				console.log( langJson );

				if ( langJson.code && langJson.name )
				{
					var addLangJson = {};
					addLangJson.id = langJson.code;
					addLangJson.name = langJson.name;

					me.langList.push( addLangJson );
				}
			}
		}
	}



	// 1. On config json, We need to populate 'term' & 'defaultTerm'
	// 2. When rendering as HTML, we need to add 'term'='' on all the tags
	// 3. When translating, look at the 'term' tag

	// -------------------------------
	
	me.initialize();
}