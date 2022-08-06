// -------------------------------------------
// -- LocalStgMng Class/Methods
//		Currently 'LocalStgMng' uses 'localStorage' for now...
//		Should be move to IndexDB...

function LocalStgMng() {}

LocalStgMng.KEY_lastDownload = "lastDownload";

// ---------------------------------------------------
// -- Last Download Mark Related --------------

// TRAN TODO - this method is not used in any place
LocalStgMng.lastDownload_Save = function( dateISOStr ) 
{
	var jsonData = { 'lastDownload': dateISOStr };

	LocalStgMng.saveJsonData( LocalStgMng.KEY_lastDownload, jsonData );
};

// TRAN TODO - this method is not used in any place
LocalStgMng.lastDownload_Get = function() 
{
	var dateISOStr;

	try
	{
		var jsonData = LocalStgMng.getJsonData( LocalStgMng.KEY_lastDownload );
		if ( jsonData && jsonData.lastDownload ) dateISOStr = ( new Date( jsonData.lastDownload ) ).toISOString();	
	}
	catch ( errMsg )
	{
		console.log( 'Error in LocalStgMng.lastDownload_Get, errMsg: ' + errMsg );
	}

	return dateISOStr;  // return 'undefined' if lastDownload does not exists..
};

// ---------------------------------------------------
// -- SyncMsg Related --------------


//LocalStgMng.syncMsg_Save = function( jsonData ) 
//{
//	LocalStgMng.saveJsonData( LocalStgMng.KEY_syncMsg, jsonData );
//};

//LocalStgMng.syncMsg_Get = function() 
//{
//	return LocalStgMng.getJsonData( LocalStgMng.KEY_syncMsg );
//};


// -------------------------------------
// ---- Overall Data Save/Get/Delete ---

LocalStgMng.saveJsonData = function( key, jsonData ) {
	localStorage[ key ] = JSON.stringify( jsonData );
};

LocalStgMng.getJsonData = function( key ) {
	var jsonData;

	try
	{
		var dataStr = localStorage[ key ];
		if ( dataStr && dataStr !== "undefined" ) jsonData = JSON.parse( dataStr );	
	}
	catch( errMsg )
	{
		console.log( "Error in LocalStgMng.getJsonData, errMsg: " + errMsg );
	}

	return jsonData;
};

LocalStgMng.deleteData = function( key ) {
	localStorage.removeItem( key );
};


LocalStgMng.clear = function() {
	localStorage.clear();
};

// =========================
