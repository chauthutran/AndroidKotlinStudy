// -------------------------------------------
// -- AppUtil Class/Methods

function AppUtil() {}

// Browser refresh/reload
// Set this before refreshing, thus, sw state event not display the update message.
AppUtil.appReloading = false;  

AppUtil.MATOMO_URL = 'https://matomo.psi-mis.org';

// ==== Methods ======================

AppUtil.appReloadWtMsg = function( optionalMsg )
{    
	var defaultMsg = 'App Reloading!!';
	if ( !optionalMsg ) optionalMsg = defaultMsg;

	
	MsgManager.msgAreaShowOpt( optionalMsg, { cssClasses: 'notifCBlue', closeOthers: true } );

	AppUtil.appReloading = true;
	window.location.reload();
};


AppUtil.getDiffSize = function( inputVal, dividNum, endingStr )
{
	var returnVal = '';

	try
	{
		if ( endingStr === undefined ) endingStr = '';

		if ( inputVal )
		{
			returnVal = Number( inputVal / dividNum ).toFixed(1) + endingStr;
		}
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in AppUtil.getDiffSize, ' + errMsg );
	}

	return returnVal;
};

AppUtil.getStorageGBStr = function( storage )
{	
	return AppUtil.getDiffSize( storage, 1000000000 );
};


AppUtil.matomoTrackRequest = function()
{
	var _paq = window._paq = window._paq || [];
	_paq.push(['trackPageView']);
	_paq.push(['enableLinkTracking']);
	(function() {
	  var u= AppUtil.MATOMO_URL + '/';
	  _paq.push(['setTrackerUrl', u+'matomo.php']);
	  _paq.push(['setSiteId', 4]);
	  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
	  g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
	})();
};