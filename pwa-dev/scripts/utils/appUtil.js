// -------------------------------------------
// -- AppUtil Class/Methods

function AppUtil() {}

// Browser refresh/reload
// Set this before refreshing, thus, sw state event not display the update message.
AppUtil.appReloading = false;  

// ==== Methods ======================

AppUtil.appReload = function()
{    
	MsgManager.msgAreaShow( 'App Reloading!!' );

	AppUtil.appReloading = true;
	window.location.reload();
};
