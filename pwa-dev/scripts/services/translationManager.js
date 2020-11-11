// =========================================
// -------------------------------------------------
//     TranslationManager (old 'langTerm.js')
//          - Downloads and stores the translation data
//          - Provide html tag translation

// 			- Ways to refresh the cache of translation..
// 				https://www.psi-connect.org/connectTranslation/api/retrieveTranslations?project=234823
// -------------------------------------------------

function TranslationManager()  {};

// me.langList = [];
// me.allLangTerms = {};
// me.currentLangTerms;

TranslationManager.allLangTerms = {}; 

TranslationManager.currentLangTerms;
TranslationManager.currentLangcode = "";

TranslationManager.langList = [];


// =============================================
// === EVENT HANDLER METHODS ===================
// =============================================


// =============================================
// === METHODS =========

// --- GET / SET METHODS ------------

TranslationManager.getLangCode = function()
{
	if ( !TranslationManager.currentLangcode ) 
	{
		TranslationManager.currentLangcode = AppInfoManager.getLangCode();
	}

	return TranslationManager.currentLangcode;
};


// When we change langCode preference..
TranslationManager.setLangCode = function( langCode )
{
	if ( langCode )
	{
		TranslationManager.currentLangcode = langCode;

		AppInfoManager.setLangCode( langCode );	
	}
};

// ------------

TranslationManager.getLangList = function()
{
	return TranslationManager.langList;
};

// ------------

TranslationManager.setCurrLangTerms = function()
{
	var currLangcode = TranslationManager.getLangCode();
	TranslationManager.currentLangTerms = TranslationManager.pullOut_LangTerms( TranslationManager.allLangTerms, currLangcode );
};

// =============================================
// MAIN PART 1 - Retrieval / Download of translations

// Retrieve All Languages Term.
// MAIN METHOD 1.   --- USED TO BE: 'retrieveAllLangTerm'
TranslationManager.loadLangTerms_NSetUpData = function( forceDownload, returnFunc )
{
	TranslationManager.loadLangTerms( forceDownload, function( allLangTerms ) 
	{
		TranslationManager.allLangTerms = allLangTerms;
		TranslationManager.langList = TranslationManager.pullOut_LanguageList( allLangTerms );
		
		TranslationManager.setCurrLangTerms();

		returnFunc( allLangTerms );
	});
};


TranslationManager.loadLangTerms = function( forceDownload, returnFunc )
{
	// If exists in local storage, load it, Otherwise, retrieve it
	var allLangTerms_stored = AppInfoManager.getLangTerms();
	
	if ( allLangTerms_stored && !forceDownload )
	{
		returnFunc( allLangTerms_stored );
	}
	else
	{
		$( "#imgSettingLangTermRotate" ).addClass( "rot_l_anim" );

		TranslationManager.downloadLangTerms( function( allLangTerms_downloaded )
		{
			$( "#imgSettingLangTermRotate" ).removeClass( "rot_l_anim" );
			AppInfoManager.setLangLastDateTime( new Date() );

			$( '#settingsInfo_userLanguage_Update' ).val( 'Refresh date: ' + AppInfoManager.getLangLastDateTime() );

			if ( allLangTerms_downloaded ) AppInfoManager.updateLangTerms( allLangTerms_downloaded );


			// CHECK:
			// ?? This does not select the language by default?  Or does it populate the language by default?

			// Ways to refresh the cache of translation..
			// https://www.psi-connect.org/connectTranslation/api/retrieveTranslations?project=234823

			returnFunc( allLangTerms_downloaded );
		});
	}
};


// Retrieve it from ws and put it on local storage or local store location
TranslationManager.downloadLangTerms = function( returnFunc )
{
	// 'PWA.langTerms' get language terms from memory/cache..
	// To get refreshed one, call 'PWA.dailyCache'

	var queryLoc = '/PWA.langTerms' //?lang=' + lang;  // '/api/langTerms' for all lang..
	var options = {};
	var loadingTag = undefined;

	// Do silently?  translate it afterwards?  <-- how do we do this?
	// config should also note all the 'term' into tags..
	WsCallManager.requestGetDws( queryLoc, options, loadingTag, function( success, returnJson )
	{
		if ( success )
		{
			returnFunc( returnJson );
		}
		else
		{
			// Try retrieving all dailyCache on WebService..
			console.customLog( '=== LANG TERMS ==> Requesting Web Service To DOWNLOAD TRANSLATIONS' );


			var dailyCache = '/PWA.dailyCache';

			// try running the dailyCache
			WsCallManager.requestPostDws( dailyCache, { "project": "234823" }, loadingTag, function( success, allLangTermsJson ) 
			{
				if ( success && allLangTermsJson )
				{					
					returnFunc( allLangTermsJson );
				}
				else
				{
					returnFunc( {} ); // return empty object - for emtpy langTerm
				}
			});			
		}
	});
};


// =============================================
// MAIN PART 2 - apply transltaions on page or single text

// MAIN METHOD 2.
TranslationManager.translatePage = function( sectionTag )
{
	var currLangTerms = TranslationManager.currentLangTerms;

	if ( currLangTerms )
	{
		// 1. Get the terms unique collection from site/page
		var tagsWithTerms = ( sectionTag ) ? sectionTag.find( '[term]' ) : $( '[term]' );
	
		// Only apply if the term name is not empty, and the term translation for current langugage exists.

		tagsWithTerms.each( function() 
		{
			var tag = $( this );
			var termName = tag.attr( 'term' );
	
			if ( termName ) 
			{
				var termVal = currLangTerms[ termName ];
	
				if ( termVal )
				{
					if ( tag.is( 'input' ) ) {
						if ( tag.attr( 'placeholder' ) ) tag.attr( 'placeholder', termVal );
					} 
					else tag.html( termVal );
				}
			}
		});		
	}
};

// NOTE: Above logic should work!!!!  Apply to other single term translation...!!!
// 	- Also, we can save the original text...  <-- put it on attribute...
//
//	** Better, yet, in 'origText', we can populate this when we generate page or form/block/terms..


// Translate single text by current LangTerms.
TranslationManager.translateText = function( defaultText, termName )
{
	if ( termName 
		&& TranslationManager.currentLangTerms 
		&& TranslationManager.currentLangTerms[ termName ] ) return TranslationManager.currentLangTerms[ termName ];
	else return defaultText;
}


// ==================================================
// === Used Methods ======


// -------------------------------------------

TranslationManager.pullOut_LanguageList = function( allLangTerms )
{
	var langList = [];

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

				langList.push( addLangJson );
			}
		}
	}

	return langList;
};


//TranslationManager.getLangTerms = function( allLangTerms, langCode )
TranslationManager.pullOut_LangTerms = function( allLangTerms, langCode )
{
	var returnLangTerms;

	if ( allLangTerms && allLangTerms.languages )
	{
		var langTerms = Util.getFromList( allLangTerms.languages, langCode, "code" );

		if ( langTerms ) returnLangTerms = langTerms.terms;
	}

	return returnLangTerms;
};

