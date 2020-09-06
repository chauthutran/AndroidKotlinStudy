// -------------------------------------------
// -- AppUtil Class/Methods

function AppUtil() {}

// Browser refresh/reload
// Set this before refreshing, thus, sw state event not display the update message.
AppUtil.appRefreshing = false;  

// ==== Methods ======================

AppUtil.appRefresh = function()
{    
	AppUtil.appRefreshing = true;
	window.location.reload();
};
