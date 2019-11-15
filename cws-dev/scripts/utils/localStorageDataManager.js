// -------------------------------------------
// -- LocalStorageDataManager Class/Methods
//		Currently 'LocalStorageDataManager' uses 'localStorage' for now...
//		Should be move to IndexDB...

function LocalStorageDataManager() {}


// -------------------------------------
// ---- Overall Data Save/Get/Delete ---

LocalStorageDataManager.saveData = function( secName, jsonData ) {
	localStorage[ secName ] = JSON.stringify( jsonData );
};

LocalStorageDataManager.getData = function( secName, callBack ) {
	var jsonData;

	var dataStr = localStorage[ secName ];
	if ( dataStr ) jsonData = JSON.parse( dataStr );

	if ( callBack ) callBack( jsonData );
};

LocalStorageDataManager.getOrCreateData = function( secName, callBack ) {
	LocalStorageDataManager.getData( secName, function( lastSessionAll ){
		if ( !lastSessionAll ) lastSessionAll = {};
		callBack( lastSessionAll );
	});
	
};

LocalStorageDataManager.deleteData = function( secName ) {
	localStorage.removeItem( secName );
};


LocalStorageDataManager.insertDataItem = function( secName, jsonInsertData ) {

	LocalStorageDataManager.getOrCreateData( secName, function( jsonMainData ){
		// We assume that this has 'list' as jsonArray (of data)
		if ( jsonMainData.list === undefined ) jsonMainData.list = [];
		jsonMainData.list.push( jsonInsertData );

		LocalStorageDataManager.saveData( secName, jsonMainData );
	} );
};

LocalStorageDataManager.removeItemFromData = function( secName, id ) {

	if ( secName && id )
	{
		LocalStorageDataManager.getOrCreateData( secName, function(jsonMainData) {

			// We assume that this has 'list' as jsonArray (of data)
			if ( jsonMainData.list !== undefined ) 
			{
				Util.RemoveFromArray( jsonMainData.list, "id", id )
			}

			LocalStorageDataManager.saveData( secName, jsonMainData );
		} );

	}
};

LocalStorageDataManager.getItemFromData = function( secName, id ) 
{
	var itemData;

	if ( secName && id )
	{
		LocalStorageDataManager.getOrCreateData( secName, function( jsonMainData ){
			// We assume that this has 'list' as jsonArray (of data)
			if ( jsonMainData.list !== undefined ) 
			{			
				itemData = Util.getFromList( jsonMainData.list, id, "id" );			
			}
		} );
	}

	return itemData;
};


LocalStorageDataManager.updateItemFromData = function( secName, id, jsonDataItem ) 
{
	if ( secName && id )
	{
		LocalStorageDataManager.getOrCreateData( secName, function( jsonMainData ){

			// We assume that this has 'list' as jsonArray (of data)
			if ( jsonMainData.list !== undefined ) 
			{			
				itemData = Util.getFromList( jsonMainData.list, id, "id" );

				Util.copyProperties( jsonDataItem, itemData );

				LocalStorageDataManager.saveData( secName, jsonMainData );			
			}
			else
			{
				console.log ( 'failed `jsonMainData.list !== undefined`: ' + secName + ' ' + id  );
			}
		} );
	}
	else
	{
		console.log ( 'failed `LocalStorageDataManager.updateItemFromData` on secName && id: ' + secName + ' ' + id  );
	}
};

// =========================

LocalStorageDataManager.getUserConfigData = function( callBack ) 
{
	LocalStorageDataManager.getSessionData(function( sessionJson ){
		//console.log( sessionJson );
		if ( sessionJson && sessionJson.user )	
		{
			LocalStorageDataManager.getData( sessionJson.user, function( userConfigJson ){
				if ( callBack ) callBack( userConfigJson );
			} );
		}
		else
		{
			if ( callBack ) callBack();
		}
	});

	
}

LocalStorageDataManager.getSessionData = function( callBack ) 
{
	LocalStorageDataManager.getData( DataManager.StorageName_session, callBack );
}

LocalStorageDataManager.setSessionDataValue = function( prop, val ) 
{
	LocalStorageDataManager.getData( DataManager.StorageName_session, function( sessionJson ){
		if ( sessionJson )
		{
			sessionJson[ prop ] = val;

			LocalStorageDataManager.saveData( DataManager.StorageName_session, sessionJson );
		}
	} );
}

LocalStorageDataManager.getSessionDataValue = function( prop, defval, callBack ) 
{
	LocalStorageDataManager.getData( DataManager.StorageName_session, function( sessionJson ){
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


LocalStorageDataManager.clearSessionStorage = function()
{
	LocalStorageDataManager.deleteData( 'networkConnectionObs' );
	localStorage.removeItem( 'networkConnectionObs' );

	LocalStorageDataManager.getSessionData( function( sessionData ){
		LocalStorageDataManager.deleteData( DataManager.StorageName_session );
		LocalStorageDataManager.deleteData( sessionData.user );
	});
}