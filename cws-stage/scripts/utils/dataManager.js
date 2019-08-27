// -------------------------------------------
// -- DataManager Class/Methods
//		Currently 'DataManager' uses 'localStorage' for now...
//		Should be move to IndexDB...

function DataManager() {}

DataManager.StorageName_session = "session";
DataManager.StorageName_langTerms = "langTerms";

DataManager.dbStorageType_localStorage = "localStorage";
DataManager.dbStorageType_indexdb = "indexdb";
DataManager.dbStorageType = DataManager.dbStorageType_indexdb; // Defaut value. Will be set from databaseSelector.js

DataManager.securedContainers = [ 'redeemList' ];


// -------------------------------------
// ---- Overall Data Save/Get/Delete ---

DataManager.saveData = function( secName, jsonData, retFunc ) {
	LocalStorageDataManager.saveData( secName, jsonData );
	IndexdbDataManager.saveData( secName, jsonData, retFunc );
};

DataManager.getData = function( secName, callBack ) {
	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
		LocalStorageDataManager.getData( secName, callBack );
	}
	else
	{
		IndexdbDataManager.getData( secName, callBack );
	}
};

DataManager.getOrCreateData = function( secName, callBack ) {
	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
		LocalStorageDataManager.getOrCreateData( secName, callBack );
	}
	else
	{
		IndexdbDataManager.getOrCreateData( secName, callBack );
	}
};

DataManager.deleteData = function( secName ) {
	LocalStorageDataManager.deleteData( secName );
	IndexdbDataManager.deleteData( secName );
};

// -------------------------------------
// ---- List Item Data Save/Get/Delete ---

DataManager.insertDataItem = function( secName, jsonInsertData, retFunc ) {

	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
		LocalStorageDataManager.insertDataItem( secName, jsonInsertData );
	}
	else
	{
		IndexdbDataManager.insertDataItem( secName, jsonInsertData, retFunc );
	}
};

DataManager.removeItemFromData = function( secName, id ) {

	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
		LocalStorageDataManager.insertDataItem( secName, jsonInsertData );
	}
	else
	{
		IndexdbDataManager.insertDataItem( secName, jsonInsertData );
	}
};

DataManager.getItemFromData = function( secName, id, callBack ) 
{
	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
		return LocalStorageDataManager.getItemFromData( secName, id );
	}
	else
	{
		return IndexdbDataManager.getItemFromData( secName, id, callBack );
	}
};


DataManager.updateItemFromData = function( secName, id, jsonDataItem ) 
{
	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
		LocalStorageDataManager.updateItemFromData( secName, id, jsonDataItem );
	}
	else
	{
		IndexdbDataManager.updateItemFromData( secName, id, jsonDataItem );
	}
};

// =========================

DataManager.getUserConfigData = function( callBack ) 
{
	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
		LocalStorageDataManager.getUserConfigData( callBack );
	}
	else
	{
		IndexdbDataManager.getUserConfigData( callBack );
	}
	
}

DataManager.getSessionData = function( callBack ) 
{
	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
		LocalStorageDataManager.getSessionData( callBack );
	}
	else
	{
		IndexdbDataManager.getSessionData( callBack );
	}
}

DataManager.setSessionDataValue = function( prop, val ) 
{
	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
	 	LocalStorageDataManager.setSessionDataValue( prop, val );
	}
	else
	{
		IndexdbDataManager.setSessionDataValue( prop, val );
	}
}

DataManager.getSessionDataValue = function( prop, defval, callBack ) 
{
	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
	 	LocalStorageDataManager.getSessionDataValue( prop, defval, callBack  );
	}
	else
	{
		IndexdbDataManager.getSessionDataValue( prop, defval, callBack  );
	}
}


DataManager.clearSessionStorage = function()
{
	if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
	 	LocalStorageDataManager.clearSessionStorage();
	}
	else
	{
		IndexdbDataManager.clearSessionStorage();
	}
}

DataManager.protectedContainer = function( secName )
{
	var ret = false;
	for ( var i = 0; i < DataManager.securedContainers.length; i++ )
	{
		if ( secName == DataManager.securedContainers[ i ] )
		{
			ret = true;
			break;
		} 
	}
	return ret;

}