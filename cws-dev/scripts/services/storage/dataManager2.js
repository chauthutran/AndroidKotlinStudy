// -------------------------------------------
// -- DataManager2 Class/Methods
// ---- USES 'LocalForage' version of 'DataManager'

function DataManager2() {}

DataManager2.StorageName_session = "session";
DataManager2.StorageName_langTerms = "langTerms";

DataManager2.dbStorageType_localStorage = "localStorage";
DataManager2.dbStorageType_indexdb = "indexdb";
DataManager2.dbStorageType = DataManager2.dbStorageType_indexdb; // Defaut value. Will be set from databaseSelector.js

DataManager2.securedContainers = [ 'redeemList' ];
DataManager2.indexedDBStorage = [];
DataManager2.storageEstimate;

DataManager2.indexedDBopenRequestTime; // time the opening + 
DataManager2.indexedDBopenResponseTime;// response delay times

// -------------------------------------
// ---- Overall Data Save/Get/Delete ---

// ------------------------------------------------
// -------- GET Methods --------------

// -- GetData - storage type decided by 'secName'
DataManager2.getData = function( secName, callBack ) 
{
	var storageTypeStr = DataManager2.getStorageType( secName );
	DataManager2.getDataByStorageType( storageTypeStr, secName, callBack );
};
// GetData - IndexedDB
DataManager2.getData_IDB = function( secName, callBack ) 
{
	DataManager2.getDataByStorageType( StorageMng.StorageType_IndexedDB, secName, callBack );
};
// GetData - LocalStorage
DataManager2.getData_LS = function( secName, callBack ) 
{
	DataManager2.getDataByStorageType( StorageMng.StorageType_LocalStorage, secName, callBack );
};

// Base GetData - by storage type
DataManager2.getDataByStorageType = function( storageTypeStr, secName, callBack ) 
{
	StorageMng.getItem( storageTypeStr, secName, function( err, data )
	{
		
		if ( data && DataManager2.protectedContainer( secName ) )
		{
			DataManager2.getIV( function( iv ){

				// IndexdbDataManager2.trackOpenEventDelay( false );
				var jsonData;

				try
				{
					// TODO: For Performance, we can create a simple data (like 'T') - for data decrypt testing.. <-- on top of redeem one..
					jsonData = JSON.parse( CryptoJS.enc.Utf8.stringify( CryptoJS.AES.decrypt( data.toString(), iv, 
					{
						keySize: 128 / 8,
						iv: iv,
						mode: CryptoJS.mode.CBC,
						padding: CryptoJS.pad.Pkcs7
					} ) ) );	
				}
				catch ( errMsg )
				{
					alert( 'Error during data decryption with current password.  If User has been changed, clear all data to resolve this issue.' );
				}

				if ( callBack ) callBack( jsonData );

			} )

		}
		// else
		// {
		// 	jsonData = JSON.parse( data.value );// TRAN COMMENT : In data object doesn't have "value" key

		// 	if ( callBack ) callBack( data.value );
		// }
		else
		{
			if ( callBack ) callBack( data );
		}
		
	});
}


// ------------------------------------------------
// -------- SAVE Methods --------------

// -- SaveData - storage type decided by 'secName'
DataManager2.saveData = function( secName, jsonData, retFunc ) 
{
	var storageTypeStr = DataManager2.getStorageType( secName );
	DataManager2.saveDataByStorageType( storageTypeStr, secName, jsonData, retFunc );
};

// saveData - IndexedDB
DataManager2.saveData_IDB = function( secName, jsonData, retFunc ) 
{
	DataManager2.saveDataByStorageType( StorageMng.StorageType_IndexedDB, secName, jsonData, retFunc );
};

// saveData - LocalStorage
DataManager2.saveData_LS = function( secName, jsonData, retFunc ) 
{
	DataManager2.saveDataByStorageType( StorageMng.StorageType_LocalStorage, secName, jsonData, retFunc );
};

// Base SaveData - by storage type
DataManager2.saveDataByStorageType = function( storageTypeStr, secName, jsonData, callBack ) 
{		
	if( storageTypeStr == StorageMng.StorageType_IndexedDB )
	{
		DataManager2.getIV( function( iv ){

			var pushData = CryptoJS.AES.encrypt( JSON.stringify( jsonData ), iv,
			{
				keySize: 128 / 8,
				iv: iv,
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			}).toString();

			StorageMng.setItem( storageTypeStr, secName, pushData, function() {
				if ( callBack ) callBack( pushData );
			});
		} )
		
	}
	else
	{
		StorageMng.setItem( storageTypeStr, secName, jsonData, function() {
			if( callBack ) callBack( jsonData );
		});
	}
}

// ------------------------------------------------
// -------- Get/Save Specific Operations Methods --------------

DataManager2.getData_RedeemList = function( callBack )
{
	DataManager2.getData( Constants.storageName_redeemList, callBack );
};

DataManager2.saveData_RedeemList = function( jsonData, callBack )
{
	DataManager2.saveData( Constants.storageName_redeemList, jsonData, callBack );
};

// ------------------

// NOTE: If we use user name + fixed name, this has to be only done after login..
//  --> Which makes sense since we also need password to descript data..
DataManager2.getData_ActivityList = function( callBack )
{
	DataManager2.getData( Constants.storageName_activityList, callBack );
};

DataManager2.saveData_ActivityList = function( jsonData, callBack )
{
	DataManager2.saveData( Constants.storageName_activityList, jsonData, callBack );
};


// ------------------------------------------------
// -------- Get/Save LocalStorage without LocalForage - No CallBack --------------

// Not Yet Implemented
DataManager2.getData_LS_JSON = function( key )
{
	var jsonData;

	try
	{
		var dataStr = localStorage.getItem( key );
		if ( dataStr ) jsonData = JSON.parse( dataStr );
	}
	catch ( errMsg )
	{
		console.log( 'ERROR during DataManager2.getData_LS_JSON, errMsg - ' + errMsg );
		console.log( ' - LocalStorage data might not be JSON Format String' );
	}

	return jsonData;
};

DataManager2.getData_LS_Str = function( key )
{
	return localStorage.getItem( key );
};

// ------------------

// Not Yet Implemented
DataManager2.saveData_LS_JSON = function( key, jsonData )
{
	localStorage.setItem( key, JSON.stringify( jsonData ) );
};

DataManager2.saveData_LS_Str = function( key, strData )
{
	localStorage.setItem( key, strData );
};

// ------------------------------------------------
// -------- Other Operation Methods --------------


DataManager2.deleteDataByStorageType = function( storageTypeStr, secName ) 
{
	StorageMng.removeItem ( storageTypeStr, secName, function(){ 
		console.log( secName + " DELETE successfully !!!");
	} );
};


DataManager2.getOrCreateData = function( secName, callBack ) 
{
	var storageTypeStr = DataManager2.getStorageType( secName );
	StorageMng.getItem( storageTypeStr, secName, function( err, jsonInfo ){
		if ( !jsonInfo ) jsonInfo = {};
		if( callBack ) callBack( jsonInfo );
	});
	
	// if ( DataManager2.protectedContainer( secName ) )
	// {
	// 	IndexdbDataManager2.getOrCreateData( secName, callBack );
	// }
	// else
	// {
	// 	LocalStorageDataManager2.getOrCreateData( secName, callBack );
	// }
};

DataManager2.deleteData = function( secName ) 
{
	var storageTypeStr = DataManager2.getStorageType( secName );
	StorageMng.removeItem ( storageTypeStr, secName, function(){ 
		console.log( secName + " DELETE successfully !!!");
	} );

	// LocalStorageDataManager2.deleteData( secName );
	// IndexdbDataManager2.deleteData( secName );
};

// -------------------------------------
// ---- List Item Data Save/Get/Delete ---

DataManager2.insertDataItem = function( secName, jsonInsertData, retFunc ) 
{
	var storageTypeStr = DataManager2.getStorageType( secName );
	StorageMng.removeItem ( storageTypeStr, secName, function(){ } );

	DataManager2.getOrCreateData( secName, function( jsonMainData ){
		if ( jsonMainData.list === undefined ) jsonMainData.list = [];
		jsonMainData.list.push( jsonInsertData );
		DataManager2.saveData( secName, jsonMainData, retFunc );
	} );

};


DataManager2.getItemFromData = function( secName, id, callBack ) 
{
	var itemData;

	if ( secName && id )
	{
		DataManager2.getOrCreateData( secName, function( jsonMainData ){

			if ( DataManager2.protectedContainer( secName ) )
			{
				var decrData = jsonMainData; 

				itemData = Util.getFromList( decrData.list, id, "id" );

				if ( callBack ) callBack( itemData );

			}
			else if ( jsonMainData.list !== undefined ) 
			{			
				itemData = Util.getFromList( jsonMainData.list, id, "id" );

				if ( callBack ) callBack( itemData );
			}
			else
			{
				if ( callBack ) callBack();
			}

		} );
	}
	else
	{
		if ( callBack ) callBack();
	}
};


DataManager2.updateItemFromData = function( secName, id, jsonDataItem ) 
{
	if ( secName && id )
	{
		var storageTypeStr = DataManager2.getStorageType( secName );
		DataManager2.getOrCreateData( storageTypeStr, secName, function( jsonMainData ){
			// if ( !jsonMainData ) lastSessionAll = {};
			
			// We assume that this has 'list' as jsonArray (of data)
			if ( jsonMainData.list !== undefined ) 
			{			
				var itemData = Util.getFromList( jsonMainData.list, id, "id" );

				Util.copyProperties( jsonDataItem, itemData );

				// var pushData = JSON.stringify( jsonMainData );
				DataManager2.saveItem( storageTypeStr, secName, jsonMainData ).then( function( jsonInfo ) {
					console.log( ' ===== Save data SUCCESS!!! ====='  );
	
				}).catch( function(err) {
					console.log( ' ===== ERROR ====='  );
					console.log( err );
				});
			}
			else
			{
				console.log ( 'failed `jsonMainData.list !== undefined`: ' + secName + ' ' + id  );
			}
		
		});
	}
	else
	{
		console.log ( 'failed `IndexdbDataManager2.updateItemFromData` on secName && id: ' + secName + ' ' + id  );
	}

	
	// if ( DataManager2.protectedContainer( secName ) )
	// {
	// 	IndexdbDataManager2.updateItemFromData( secName, id, jsonDataItem );
	// }
	// else
	// {
	// 	LocalStorageDataManager2.updateItemFromData( secName, id, jsonDataItem );
	// }
};


// =========================

DataManager2.getUserConfigData = function( callBack ) 
{
	DataManager2.getDataByStorageType( StorageMng.StorageType_LocalStorage, DataManager2.StorageName_session, function( err, sessionJson ){
		if ( sessionJson && sessionJson.user )	
		{
			DataManager2.getDataByStorageType( StorageMng.StorageType_LocalStorage, sessionJson.user, function( err, userConfigJson ){
				if ( callBack ) callBack( userConfigJson );
			} );
		}
		else
		{
			if ( callBack ) callBack();
		}
	});

	// LocalStorageDataManager2.getUserConfigData( callBack );
}

DataManager2.getSessionData = function( callBack ) 
{
	DataManager2.getDataByStorageType( StorageMng.StorageType_LocalStorage, DataManager2.StorageName_session, callBack );

	// LocalStorageDataManager2.getSessionData( callBack );
}

DataManager2.setSessionDataValue = function( prop, val ) 
{
	var storageTypeStr = StorageMng.StorageType_LocalStorage;
	DataManager2.getDataByStorageType( storageTypeStr, DataManager2.StorageName_session, function( sessionJson ){
		if ( sessionJson )
		{
			sessionJson[ prop ] = val;

			DataManager2.saveDataByStorageType( storageTypeStr, DataManager2.StorageName_session, sessionJson );
		}
	} );

	// LocalStorageDataManager2.setSessionDataValue( prop, val );
}

DataManager2.getSessionDataValue = function( prop, defval, callBack ) 
{
	DataManager2.getDataByStorageType( StorageMng.StorageType_LocalStorage, DataManager2.StorageName_session, function( sessionJson ){
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

	// LocalStorageDataManager2.getSessionDataValue( prop, defval, callBack  );
}


DataManager2.clearSessionStorage = function()
{
	DataManager2.deleteDataByStorageType( StorageMng.StorageType_LocalStorage, DataManager2.StorageName_session );

	// //if( DataManager2.dbStorageType == DataManager2.dbStorageType_localStorage )
	// {
	//  	LocalStorageDataManager2.clearSessionStorage();
	// }
	// /*else
	// {
	// 	IndexdbDataManager2.clearSessionStorage();
	// }*/
}

// -------------------------------------
// ---- Supporting Methods ------------

DataManager2.getStorageType = function( secName )
{
	var storageTypeStr = ( DataManager2.protectedContainer( secName ) ) ? StorageMng.StorageType_IndexedDB : StorageMng.StorageType_LocalStorage;
	return storageTypeStr;
}


DataManager2.getIV = function( callBack )
{
	if ( FormUtil.login_Password ) 
	{ 
		if ( callBack ) callBack( FormUtil.login_Password );
	}
	else
	{
		DataManager2.getSessionData( function( data ) { 

			if ( data && data.user )
			{
				if ( callBack ) callBack( Util.decrypt( FormUtil.getUserSessionAttr( data.user,'pin' ), 4) );
			}
			else
			{
				if ( callBack ) callBack();
			}

		} )
	}

}

DataManager2.protectedContainer = function( secName )
{
	var ret = false;
	for ( var i = 0; i < DataManager2.securedContainers.length; i++ )
	{
		if ( secName == DataManager2.securedContainers[ i ] )
		{
			ret = true;
			break;
		} 
	}
	return ret;

}

DataManager2.estimateStorageUse = function( callBack )
{
	if ('storage' in navigator && 'estimate' in navigator.storage) 
	{
		navigator.storage.estimate().then(({usage, quota}) => {

			var retJson = { 'usage': usage, 'quota': quota };

			DataManager2.storageEstimate = retJson;

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

DataManager2.initialiseStorageEstimates = function()
{
	for ( var i = 0; i < DataManager2.securedContainers.length; i++ )
	{
		FormUtil.getMyListData( DataManager2.securedContainers[i], function (data) {

			var dataSize = Util.lengthInUtf8Bytes(JSON.stringify(data));

			DataManager2.indexedDBStorage.push({ container: 'indexedDB', name: DataManager2.securedContainers[i], bytes: dataSize, kb: dataSize / 1024, mb: dataSize / 1024 / 1024 });

		})
	}
}

DataManager2.getStorageSizes = function( callBack )
{
	var arrItems = [];

	arrItems.push( { name: 'indexedDB', data: DataManager2.indexedDBStorage } );
	arrItems.push( { name: 'localStorage', data: Util2.getLocalStorageSizes() } );
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
