// -------------------------------------------
// -- AppUtil Class/Methods

function AppUtil() {}

// Browser refresh/reload
// Set this before refreshing, thus, sw state event not display the update message.
AppUtil.appReloading = false;  

// ==== Methods ======================

AppUtil.appReloadWtMsg = function( optionalMsg )
{    
	var defaultMsg = 'App Reloading!!';

	if ( optionalMsg === undefined ) MsgManager.msgAreaShow( defaultMsg );
	else if ( optionalMsg !== '' ) // if 'optionMsg' is '', skip the msgAreaShow.
	{
		MsgManager.msgAreaShow( optionalMsg );		
	}

	AppUtil.appReloading = true;
	window.location.reload();
};
