// -------------------------------------------
// -- LocalStgMng Class/Methods
//		Currently 'LocalStgMng' uses 'localStorage' for now...
//		Should be move to IndexDB...

function LocalStgMng() {}

LocalStgMng.KEY_session = "session";
LocalStgMng.KEY_langTerms = "langTerms";
LocalStgMng.KEY_lastDownload = "lastDownload";
// ---------------------------------------------------

LocalStgMng.lastDownload_Save = function( dateObj ) 
{
	var jsonData = { 'lastDownload': dateObj.toISOString() };

	LocalStgMng.saveJsonData( LocalStgMng.KEY_lastDownload, jsonData );
};

LocalStgMng.lastDownload_Get = function() 
{
	var dateObj;

	var jsonData = LocalStgMng.getJsonData( LocalStgMng.KEY_lastDownload );
	if ( jsonData && jsonData.lastDownload ) dateObj = new Date( jsonData.lastDownload );

	return dateObj;  // return 'undefined' if lastDownload does not exists..
};


/*
LocalStgMng.getUserConfigData = function() 
{
	return LocalStgMng.getSessionData( function( sessionJson ){
		//console.log( sessionJson );
		if ( sessionJson && sessionJson.user )	
		{
			LocalStgMng.getData( sessionJson.user, function( userConfigJson ){
				if ( callBack ) callBack( userConfigJson );
			} );
		}
		else
		{
			if ( callBack ) callBack();
		}
	});
}

/*
LocalStgMng.getSessionData = function() 
{
	return LocalStgMng.getJsonData( LocalStgMng.KEY_session );
}

LocalStgMng.setSessionDataValue = function( prop, val ) 
{
	LocalStgMng.getData( LocalStgMng.KEY_session, function( sessionJson ){
		if ( sessionJson )
		{
			sessionJson[ prop ] = val;

			LocalStgMng.saveData( LocalStgMng.KEY_session, sessionJson );
		}
	} );
}

LocalStgMng.getSessionDataValue = function( prop, defval, callBack ) 
{
	LocalStgMng.getData( LocalStgMng.KEY_session, function( sessionJson ){
		var ret;

		if ( sessionJson )
		{
			if ( sessionJson[ prop ] )
			{
				ret = sessionJson[ prop ];
			}
			else
			{
				ret = defval;
			}
		}	
		callBack( ret );
	} );
}


LocalStgMng.clearSessionStorage = function( callBack )
{
	//LocalStgMng.deleteData( 'networkConnectionObs' );
	//localStorage.removeItem( 'networkConnectionObs' );

	LocalStgMng.getSessionData( function( sessionData ){

		LocalStgMng.deleteData( LocalStgMng.KEY_session );
		//LocalStgMng.deleteData( sessionData.user );

		if ( callBack ) callBack();
	});
}
*/

// -------------------------------------
// ---- Overall Data Save/Get/Delete ---

LocalStgMng.saveJsonData = function( key, jsonData ) {
	localStorage[ key ] = JSON.stringify( jsonData );
};

LocalStgMng.getJsonData = function( key ) {
	var jsonData;

	var dataStr = localStorage[ key ];
	if ( dataStr ) jsonData = JSON.parse( dataStr );

	return jsonData;
};

LocalStgMng.deleteData = function( key ) {
	localStorage.removeItem( key );
};


// =========================
