// -------------------------------------------
// -- IndexdbDataManager Class/Methods
//		Currently 'IndexdbDataManager' uses 'localStorage' for now...
//		Should be move to IndexDB...

function IndexdbDataManager() {}

// -------------------------------------
// ---- Overall Data Save/Get/Delete ---

IndexdbDataManager.saveData = function( secName, jsonData, retFunc ) {
	var dbStorage = new DBStorage();
	dbStorage.addData( secName, JSON.stringify( jsonData ) );
	if ( retFunc ) retFunc();
};

IndexdbDataManager.getData = function( secName, callBack ) {
	if( secName !== undefined )
	{
		var dbStorage = new DBStorage();

		dbStorage.getData( secName, function( data ){
			var jsonData;
			if ( data ) 
			{
				jsonData = JSON.parse( data.value );
			}
			if ( callBack ) callBack( jsonData );
		} );
	}
	else {
		if ( callBack ) callBack();
	}

};

IndexdbDataManager.getOrCreateData = function( secName, callBack ) {
	IndexdbDataManager.getData( secName, function( lastSessionAll ){
		if ( !lastSessionAll ) lastSessionAll = {};
		callBack( lastSessionAll );
	});
	
};

IndexdbDataManager.deleteData = function( secName ) {
	var dbStorage = new DBStorage();
	dbStorage.deleteData( secName );
};

// -------------------------------------
// ---- List Item Data Save/Get/Delete ---

/*
IndexdbDataManager.getListData = function( secName ) {

	var jsonMainData = IndexdbDataManager.getData( secName );

	if ( !jsonMainData.list ) jsonMainData.list = [];

	return jsonMainData;
}
*/

IndexdbDataManager.insertDataItem = function( secName, jsonInsertData, retFunc ) {

	IndexdbDataManager.getOrCreateData( secName, function( jsonMainData ){
		// We assume that this has 'list' as jsonArray (of data)
		if ( jsonMainData.list === undefined ) jsonMainData.list = [];
		jsonMainData.list.push( jsonInsertData );

		IndexdbDataManager.saveData( secName, jsonMainData, retFunc );
	} );
};

IndexdbDataManager.removeItemFromData = function( secName, id ) {

	if ( secName && id )
	{
		IndexdbDataManager.getOrCreateData( secName, function(jsonMainData) {

			// We assume that this has 'list' as jsonArray (of data)
			if ( jsonMainData.list !== undefined ) 
			{
				Util.RemoveFromArray( jsonMainData.list, "id", id )
			}

			IndexdbDataManager.saveData( secName, jsonMainData );
		} );

	}
};

IndexdbDataManager.getItemFromData = function( secName, id ) 
{
	var itemData;

	if ( secName && id )
	{
		IndexdbDataManager.getOrCreateData( secName, function( jsonMainData ){
			// We assume that this has 'list' as jsonArray (of data)
			if ( jsonMainData.list !== undefined ) 
			{			
				itemData = Util.getFromList( jsonMainData.list, id, "id" );			
			}
		} );
	}

	return itemData;
};


IndexdbDataManager.updateItemFromData = function( secName, id, jsonDataItem ) 
{
	if ( secName && id )
	{
		IndexdbDataManager.getOrCreateData( secName, function( jsonMainData ){

			// We assume that this has 'list' as jsonArray (of data)
			if ( jsonMainData.list !== undefined ) 
			{			
				itemData = Util.getFromList( jsonMainData.list, id, "id" );

				Util.copyProperties( jsonDataItem, itemData );

				IndexdbDataManager.saveData( secName, jsonMainData );			
			}
			else
			{
				console.log ( 'failed `jsonMainData.list !== undefined`: ' + secName + ' ' + id  );
			}
		} );
	}
	else
	{
		console.log ( 'failed `IndexdbDataManager.updateItemFromData` on secName && id: ' + secName + ' ' + id  );
	}
};

// =========================

IndexdbDataManager.getUserConfigData = function( callBack ) 
{
	IndexdbDataManager.getSessionData( function( sessionJson ){
		if ( sessionJson && sessionJson.user )	
		{
			IndexdbDataManager.getData( sessionJson.user, function( userConfigJson ){
				if ( callBack ) callBack( userConfigJson );
			} );
		}
		else
		{
			if ( callBack ) callBack();
		}
	});

	
}

IndexdbDataManager.getSessionData = function( callBack ) 
{
	IndexdbDataManager.getData( DataManager.StorageName_session, callBack );
}

IndexdbDataManager.setSessionDataValue = function( prop, val ) 
{
	IndexdbDataManager.getData( DataManager.StorageName_session, function( sessionJson ){
		if ( sessionJson )
		{
			sessionJson[ prop ] = val;

			IndexdbDataManager.saveData( DataManager.StorageName_session, sessionJson );
		}
	} );
}

IndexdbDataManager.getSessionDataValue = function( prop, defval, callBack ) 
{
	IndexdbDataManager.getData( DataManager.StorageName_session, function( sessionJson ){
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


IndexdbDataManager.clearSessionStorage = function()
{
	IndexdbDataManager.getSessionData( function( sessionData ){
		IndexdbDataManager.deleteData( DataManager.StorageName_session );
		IndexdbDataManager.deleteData( sessionData.user );
	});
}