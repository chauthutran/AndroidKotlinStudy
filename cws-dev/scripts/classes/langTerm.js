// -------------------------------------------
// -- LangTerm Class/Methods
function LangTerm( cwsRenderObj )
{
	var me = this;

	me.cwsRenderObj = cwsRenderObj;

	me.currentLangcode = "";

	me.langList = [];
	me.allLangTerms = {};
	me.currentLangTerms;

	me.debugMode = false;

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
		var langTerms = ( forceDownload ) ? undefined : AppInfoManager.getLangTerms();

		if ( langTerms )
		{
			if ( me.debugMode ) console.log( '=== LANG TERMS ==> Local Storage Data Loaded' );
			me.allLangTerms = langTerms;
			me.setLanguageList( me.allLangTerms );
			me.currentLangTerms = me.getLangTerms( me.currentLangcode );

			returnFunc( langTerms );
		}
		else
		{
			if ( me.debugMode ) console.log( '=== LANG TERMS ==> Retrieving from Web Service' );
			me.retrieveAllLangTermInner( function( returnJson )
			{
				me.allLangTerms = returnJson; 
				me.setLanguageList( me.allLangTerms );
				me.currentLangTerms = me.getLangTerms( me.currentLangcode );

				if ( returnJson ) {
					AppInfoManager.updateLangTerms( returnJson );
				}
				returnFunc( returnJson );
			});
		}
	}


	// Retrieve it from ws and put it on local storage or local store location
	me.retrieveAllLangTermInner = function( returnFunc )
	{

		var queryLoc = '/PWA.langTerms' //?lang=' + lang;  // '/api/langTerms' for all lang..
		var dailyCache = '/PWA.dailyCache';
		var options = {};
		var loadingTag = undefined;

		// Do silently?  translate it afterwards?  <-- how do we do this?
		// config should also note all the 'term' into tags..
		WsCallManager.requestGet( queryLoc, options, loadingTag, function( success, returnJson )
		{
			if ( success )
			{
				if ( returnFunc ) returnFunc( returnJson );
			}
			else
			{
				// Try retrieving all dailyCache on WebService..
				if ( me.debugMode ) console.log( '=== LANG TERMS ==> Requesting Web Service To DOWNLOAD TRANSLATIONS' );

				// try running the dailyCache
				WsCallManager.requestPost( dailyCache, { "project": "234823" }, loadingTag, function( success, allLangTermsJson ) {
					if ( success && allLangTermsJson )
					{
						
						if ( returnFunc ) returnFunc( allLangTermsJson );
					}
					else
					{

						if ( returnFunc ) returnFunc( new Object() );
					}
				});			
			}
		});
	}

	
	// MAIN METHOD 2.
	me.translatePage = function()
	{
		if ( me.debugMode ) console.log( 'translating page: ' + me.currentLangcode );

		if ( me.allLangTerms && !me.currentLangTerms )
		{
			me.currentLangTerms = me.getLangTerms( me.currentLangcode );
		}

		var termCollection = {};

		// 1. Get the terms unique collection from site/page
		var tagsWithTerm = $( '[term]' );

		tagsWithTerm.each( function() 
		{
			var tag = $( this );
			var termName = tag.attr( 'term' );

			if ( termName ) 
			{
				// Add to the term collection with termName
				termCollection[ termName ] = "";
			}
		});

		// go through the term and translate them through out the page
		for ( var termName in termCollection )
		{
			var termVal = me.currentLangTerms[ termName ];

			if ( termVal )
			{
				var tag = $( '[term="' + termName + '"]' );
				tag.html( termVal );
				if ( me.debugMode ) console.log( ' ~ found term [' + me.currentLangcode + ']: ' + termName);
			}
			else
			{
				if ( me.debugMode ) console.log( ' ~ missing term [' + me.currentLangcode + ']: ' + termName);
			}
		}
	}

	// Translate single text by current LangTerms.
	me.translateText = function( defaultText, termName )
	{
		if ( termName && me.currentLangTerms && me.currentLangTerms[ termName ] ) return me.currentLangTerms[ termName ];			
		else return defaultText;
	}
	// ==================================================
	// === Used Methods ======


	me.setCurrentLang = function( langCode )
	{

		me.currentLangcode = langCode;

		if ( me.allLangTerms )
		{
			me.currentLangTerms = me.getLangTerms( langCode );
		}

		AppInfoManager.updateLanguage( langCode );
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

			for( i = 0; i < allLangTerms.languages.length; i++ )
			{
				var langJson = allLangTerms.languages[i];

				if ( langJson.code && langJson.name )
				{
					var addLangJson = {};
					addLangJson.id = langJson.code;
					addLangJson.name = langJson.name;
					addLangJson.updated = langJson.updated;

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