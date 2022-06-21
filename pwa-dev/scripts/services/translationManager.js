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
		TranslationManager.currentLangcode = PersisDataLSManager.getLangCode();
	}

	return TranslationManager.currentLangcode;
};


// When we change langCode preference..
TranslationManager.setLangCode = function( langCode )
{
	if ( langCode )
	{
		TranslationManager.currentLangcode = langCode;

		PersisDataLSManager.setLangCode( langCode );	
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
	TranslationManager.setCurrLangTerms_After( currLangcode );
};

TranslationManager.setCurrLangTerms_After = function( currLangcode )
{
	moment.locale( currLangcode ); // ...[ currLangcode, 'en' ] ... will use the first one it has localizations for;
	//moment.format('LLLL');

	TranslationManager.clearDatePicker();
	//TranslationManager.refreshScriptElement_bySource( 'scripts/libraries/mdDateTimePicker.min.js' );
}

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
	var allLangTerms_stored = PersisDataLSManager.getLangTerms();
	
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
			PersisDataLSManager.setLangLastDateTime( new Date() );

			$( '#settingsInfo_userLanguage_Update' ).val( TranslationManager.translateText( 'Refresh date', 'settingsInfo_userLanguage_Update' ) + ': ' + PersisDataLSManager.getLangLastDateTime() );

			if ( allLangTerms_downloaded ) PersisDataLSManager.updateLangTerms( allLangTerms_downloaded );


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
			console.log( '=== LANG TERMS ==> Requesting Web Service To DOWNLOAD TRANSLATIONS' );


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
TranslationManager.translateText = function( defaultText, termName, overrideLangCode )
{
	var transText = defaultText;

	if ( termName )
	{
		var langTerms = TranslationManager.currentLangTerms;
	
		// Override the Language
		if ( overrideLangCode ) 
		{
			try
			{	
				var returnLangTerms = TranslationManager.pullOut_LangTerms( TranslationManager.allLangTerms, overrideLangCode );
				if ( returnLangTerms ) langTerms = returnLangTerms;	
			}
			catch( errMsg )	
			{
				console.log( 'ERROR in TranslationManager.translateText() with overrideLangCode, ' + overrideLangCode + ', errMsg: ' + errMsg );
			}
		}

		if ( langTerms && langTerms[ termName ] )
		{
			transText = langTerms[ termName ];
		}
	}

	return transText;
};


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

// ---------------------------------------------------


// TODO: GREG: ?? THIS WILL NOT WORK IN OFFLINE?
TranslationManager.refreshScriptElement_bySource = function( src )
{
	if ( $('script[src^="' + src + '"]').length ) $('script[src^="' + src + '"]').remove();

	var script = $( '<script type="text/javascript" src="' + src + '?v=' + ( new Date() ).getTime() + '" />' );

	$( "body" ).append( script );
}

TranslationManager.clearDatePicker = function()
{
	$( '#mddtp-picker__date' ).remove();
}