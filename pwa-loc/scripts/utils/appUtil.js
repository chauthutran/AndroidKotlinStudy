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
