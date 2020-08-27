// =========================================
// -------------------------------------------------
//     TranslationManager (old 'langTerm.js')
//          - Downloads and stores the translation data
//          - Provide html tag translation
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

// Retrieve All Languages Term.
// MAIN METHOD 1.
// USED TO BE: 'retrieveAllLangTerm'
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
		console.customLog( '=== LOAD LANG TERMS ==> Local Storage Data Loaded' );

		returnFunc( allLangTerms_stored );
	}
	else
	{
		console.customLog( '=== LOAD LANG TERMS ==> download' );

		$( "#imgSettingLangTermRotate" ).addClass( "rot_l_anim" );

		TranslationManager.downloadLangTerms( function( allLangTerms_downloaded )
		{
			$( "#imgSettingLangTermRotate" ).removeClass( "rot_l_anim" );
			AppInfoManager.setLangLastDateTime( new Date() );

			$( '#settingsInfo_userLanguage_Update' ).val( 'Refresh date: ' + AppInfoManager.getLangLastDateTime() );

			console.customLog( 'LangTerm Retrieve Result:' );
			console.customLog( allLangTerms_downloaded );

			if ( allLangTerms_downloaded ) AppInfoManager.updateLangTerms( allLangTerms_downloaded );
			
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


// =================================================

// MAIN METHOD 2.
TranslationManager.translatePage = function()
{
	console.customLog( 'translating page: ' + TranslationManager.currentLangcode );

	var currLangTerms = TranslationManager.currentLangTerms;

	if ( currLangTerms )
	{
		// 1. Get the terms unique collection from site/page
		var tagsWithTerm = $( '[term]' );
	
		tagsWithTerm.each( function() 
		{
			var tag = $( this );
			var termName = tag.attr( 'term' );
	
			if ( termName ) 
			{
				var termVal = currLangTerms[ termName ];
	
				if ( termVal )
				{
					tag.html( termVal );
				}
			}
		});		
	}
};


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

