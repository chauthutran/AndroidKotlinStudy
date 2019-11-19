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
DataManager.indexedDBStorage = [];
DataManager.storageEstimate;

DataManager.indexedDBopenRequestTime; // time the opening + 
DataManager.indexedDBopenResponseTime;// response delay times

// -------------------------------------
// ---- Overall Data Save/Get/Delete ---

DataManager.saveData = function( secName, jsonData, retFunc ) 
{
	if ( DataManager.protectedContainer( secName ) )
	{
		IndexdbDataManager.saveData( secName, jsonData, retFunc );
	}
	else
	{
		LocalStorageDataManager.saveData( secName, jsonData );
		if ( retFunc ) retFunc();
	}
};

DataManager.getData = function( secName, callBack ) 
{
	if ( DataManager.protectedContainer( secName ) )
	{
		IndexdbDataManager.getData( secName, callBack );
	}
	else
	{
		LocalStorageDataManager.getData( secName, callBack );
	}
};

DataManager.getOrCreateData = function( secName, callBack ) 
{
	if ( DataManager.protectedContainer( secName ) )
	{
		IndexdbDataManager.getOrCreateData( secName, callBack );
	}
	else
	{
		LocalStorageDataManager.getOrCreateData( secName, callBack );
	}
};

DataManager.deleteData = function( secName ) 
{
	LocalStorageDataManager.deleteData( secName );
	IndexdbDataManager.deleteData( secName );
};

// -------------------------------------
// ---- List Item Data Save/Get/Delete ---

DataManager.insertDataItem = function( secName, jsonInsertData, retFunc ) 
{
	if ( DataManager.protectedContainer( secName ) )
	{
		IndexdbDataManager.insertDataItem( secName, jsonInsertData, retFunc );
	}
	else
	{
		LocalStorageDataManager.insertDataItem( secName, jsonInsertData );
	}
};


DataManager.getItemFromData = function( secName, id, callBack ) 
{
	if ( DataManager.protectedContainer( secName ) )
	{
		return IndexdbDataManager.getItemFromData( secName, id, callBack );
	}
	else
	{
		return LocalStorageDataManager.getItemFromData( secName, id );
	}
};


DataManager.updateItemFromData = function( secName, id, jsonDataItem ) 
{
	if ( DataManager.protectedContainer( secName ) )
	{
		IndexdbDataManager.updateItemFromData( secName, id, jsonDataItem );
	}
	else
	{
		LocalStorageDataManager.updateItemFromData( secName, id, jsonDataItem );
	}
};

// =========================

DataManager.getUserConfigData = function( callBack ) 
{
	LocalStorageDataManager.getUserConfigData( callBack );
}

DataManager.getSessionData = function( callBack ) 
{
	LocalStorageDataManager.getSessionData( callBack );
}

DataManager.setSessionDataValue = function( prop, val ) 
{
	LocalStorageDataManager.setSessionDataValue( prop, val );
}

DataManager.getSessionDataValue = function( prop, defval, callBack ) 
{
	LocalStorageDataManager.getSessionDataValue( prop, defval, callBack  );
}


DataManager.clearSessionStorage = function()
{
	//if( DataManager.dbStorageType == DataManager.dbStorageType_localStorage )
	{
	 	LocalStorageDataManager.clearSessionStorage();
	}
	/*else
	{
		IndexdbDataManager.clearSessionStorage();
	}*/
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

DataManager.estimateStorageUse = function( callBack )
{
	if ('storage' in navigator && 'estimate' in navigator.storage) 
	{
		navigator.storage.estimate().then(({usage, quota}) => {

			var retJson = { 'usage': usage, 'quota': quota };

			DataManager.storageEstimate = retJson;

		  	if ( callBack )
			{
				callBack( retJson )
			}
			else
			{
				return retJson;
			}

		});

	}
}

DataManager.initialiseStorageEstimates = function()
{
	for ( var i = 0; i < DataManager.securedContainers.length; i++ )
	{
		FormUtil.getMyListData( DataManager.securedContainers[i], function (data) {

			var dataSize = Util.lengthInUtf8Bytes(JSON.stringify(data));

			DataManager.indexedDBStorage.push({ container: 'indexedDB', name: DataManager.securedContainers[i], bytes: dataSize, kb: dataSize / 1024, mb: dataSize / 1024 / 1024 });

		})
	}
}

DataManager.getStorageSizes = function( callBack )
{
	var arrItems = [];

	arrItems.push( { name: 'indexedDB', data: DataManager.indexedDBStorage } );
	arrItems.push( { name: 'localStorage', data: Util.getLocalStorageSizes() } );
	arrItems.push( { name: 'cacheStorage', data: cacheManager.cacheStorage } );

	if ( callBack )
	{
		callBack( arrItems )
	}
	else
	{
		return arrItems;
	}

}
