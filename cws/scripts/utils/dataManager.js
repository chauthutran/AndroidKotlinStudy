// -------------------------------------------
// -- DataManager Class/Methods
//		Currently 'DataManager' uses 'localStorage' for now...
//		Should be move to IndexDB...

function DataManager() {}

DataManager.StorageName_session = "session";
DataManager.StorageName_langTerms = "langTerms";

// -------------------------------------
// ---- Overall Data Save/Get/Delete ---

DataManager.saveData = function( secName, jsonData ) {
	localStorage[ secName ] = JSON.stringify( jsonData );
};

DataManager.getData = function( secName ) {
	var jsonData;

	var dataStr = localStorage[ secName ];
	if ( dataStr ) jsonData = JSON.parse( dataStr );
	//else jsonData = {}; // "list": [] };		// This 'list' should be more generic?  '{}'..  
	// Create 'list' type get?

	return jsonData;
};

DataManager.getOrCreateData = function( secName ) {
	var jsonData = DataManager.getData( secName );
	if ( !jsonData ) jsonData = {};
	return jsonData;
};

DataManager.deleteData = function( secName ) {
	localStorage.removeItem( secName );
};

// -------------------------------------
// ---- List Item Data Save/Get/Delete ---

/*
DataManager.getListData = function( secName ) {

	var jsonMainData = DataManager.getData( secName );

	if ( !jsonMainData.list ) jsonMainData.list = [];

	return jsonMainData;
}
*/

DataManager.insertDataItem = function( secName, jsonInsertData ) {

	var jsonMainData = DataManager.getOrCreateData( secName );

	// We assume that this has 'list' as jsonArray (of data)
	if ( jsonMainData.list === undefined ) jsonMainData.list = [];
	jsonMainData.list.push( jsonInsertData );

	DataManager.saveData( secName, jsonMainData );
};

DataManager.removeItemFromData = function( secName, id ) {

	if ( secName && id )
	{
		var jsonMainData = DataManager.getOrCreateData( secName );

		// We assume that this has 'list' as jsonArray (of data)
		if ( jsonMainData.list !== undefined ) 
		{
			Util.RemoveFromArray( jsonMainData.list, "id", id )
		}

		DataManager.saveData( secName, jsonMainData );
	}
};

DataManager.getItemFromData = function( secName, id ) 
{
	var itemData;

	if ( secName && id )
	{
		var jsonMainData = DataManager.getOrCreateData( secName );

		// We assume that this has 'list' as jsonArray (of data)
		if ( jsonMainData.list !== undefined ) 
		{			
			itemData = Util.getFromList( jsonMainData.list, id, "id" );			
		}
	}

	return itemData;
};


DataManager.updateItemFromData = function( secName, id, jsonDataItem ) 
{
	if ( secName && id )
	{
		var jsonMainData = DataManager.getOrCreateData( secName );

		// We assume that this has 'list' as jsonArray (of data)
		if ( jsonMainData.list !== undefined ) 
		{			
			itemData = Util.getFromList( jsonMainData.list, id, "id" );

			Util.copyProperties( jsonDataItem, itemData );

			DataManager.saveData( secName, jsonMainData );			
		}
		else
		{
			console.log ( 'failed `jsonMainData.list !== undefined`: ' + secName + ' ' + id  );
		}
	}
	else
	{
		console.log ( 'failed `DataManager.updateItemFromData` on secName && id: ' + secName + ' ' + id  );
	}
};

// =========================

DataManager.getUserConfigData = function() 
{
	var userConfigJson;

	var sessionJson = DataManager.getSessionData();

	if ( sessionJson )	
	{
		if ( sessionJson.user )
		{
			var userDataStr = localStorage.getItem( sessionJson.user );
			userConfigJson = JSON.parse( userDataStr );
		}
	}

	return userConfigJson;
}

DataManager.getSessionData = function() 
{
	var sessionJson;

	var sessionDataStr = localStorage.getItem( DataManager.StorageName_session );

	if ( sessionDataStr )
	{
		sessionJson = JSON.parse( sessionDataStr );
	}

	return sessionJson;
}

DataManager.setSessionDataValue = function( prop, val ) 
{
	var sessionDataStr = localStorage.getItem( DataManager.StorageName_session );

	if ( sessionDataStr )
	{
		var sessionJson = JSON.parse( sessionDataStr );

		sessionJson[ prop ] = val;

		DataManager.saveData( DataManager.StorageName_session, sessionJson )

		return true;
	}

}

DataManager.getSessionDataValue = function( prop, defval ) 
{
	console.log( DataManager.StorageName_session );
	var sessionDataStr = localStorage.getItem( DataManager.StorageName_session );
	var ret;

	if ( sessionDataStr )
	{
		var sessionJson = JSON.parse( sessionDataStr );

		if ( sessionJson[ prop ] )
		{
			ret = sessionJson[ prop ];
		}
		else
		{
			ret = defval;
		}

		return ret;
	}

}