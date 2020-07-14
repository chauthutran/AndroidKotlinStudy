// -------------------------------------------
// -- DataManager2 Class/Methods
// ---- USES 'LocalForage' version of 'DataManager'

function DataManager2() {}

DataManager2.StorageName_session = "session";
// DataManager2.StorageName_langTerms = "langTerms";

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

// GetData - IndexedDB
DataManager2.getData_IDB = function( secName, callBack ) 
{
	DataManager2.getDataByStorageType( StorageMng.StorageType_IndexedDB, secName, function( data ) {

		var descriptedJson = DataManager2.decriptData( data );

		callBack( descriptedJson );
	});
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
		if ( callBack ) callBack( data );		
	});
};


// ------------------------------------------------
// -------- Encrypt/Decript Methods --------------
DataManager2.encryptData = function( dataJson )
{
	var iv = SessionManager.sessionData.login_Password;

	var encryptedDataStr = CryptoJS.AES.encrypt( JSON.stringify( dataJson ), iv, {
		keySize: 128 / 8,
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString();

	return encryptedDataStr;
};

DataManager2.decriptData = function( data )
{
	var jsonData = data;

	if ( data )
	{
		// TODO: For Performance, we can create a simple data (like 'T') - for data decrypt testing.. <-- on top of redeem one..
		try
		{
			var iv = SessionManager.sessionData.login_Password;

			var descriptedVal = CryptoJS.AES.decrypt( data.toString(), iv, {
				keySize: 128 / 8,
				iv: iv,
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			});

			var utf8StrVal = CryptoJS.enc.Utf8.stringify( descriptedVal );

			jsonData = JSON.parse( utf8StrVal );	
		}
		catch ( errMsg )
		{
			alert( 'Error during data decryption with current password.  If User has been changed, clear all data to resolve this issue.' );
		}
	}

	return jsonData;
};

// ------------------------------------------------
// -------- SAVE Methods --------------

// saveData - IndexedDB
DataManager2.saveData_IDB = function( secName, jsonData, retFunc ) 
{
	var encryptedDataStr = DataManager2.encryptData( jsonData );
	DataManager2.saveDataByStorageType( StorageMng.StorageType_IndexedDB, secName, encryptedDataStr, retFunc );
};

// saveData - LocalStorage
DataManager2.saveData_LS = function( secName, jsonData, retFunc ) 
{
	DataManager2.saveDataByStorageType( StorageMng.StorageType_LocalStorage, secName, jsonData, retFunc );
};

// Base SaveData - by storage type
DataManager2.saveDataByStorageType = function( storageTypeStr, secName, data, callBack ) 
{		
	StorageMng.setItem( storageTypeStr, secName, data, function() {
		if ( callBack ) callBack( data );
	});		
}

// ------------------------------------------------
// -------- Get/Save Specific Operations Methods --------------

DataManager2.getData_RedeemList = function( callBack ) { };

DataManager2.saveData_RedeemList = function( jsonData, callBack ) { };

// ------------------

// NOTE: If we use user name + fixed name, this has to be only done after login..
//  --> Which makes sense since we also need password to descript data..
DataManager2.getData_ActivityList = function( callBack )
{
	// TODO: Need to change 'storageName_redeemList' --> 'storageName_activityList'
	DataManager2.getData( Constants.storageName_redeemList, callBack );
};

DataManager2.saveData_ActivityList = function( jsonData, callBack )
{
	DataManager2.saveData( Constants.storageName_redeemList, jsonData, callBack );
};

// ---------------------------------

DataManager2.getData_ClientsStore = function( callBack )
{
	var keyName = Constants.storageName_clientList + '_' + SessionManager.sessionData.login_UserName;
	DataManager2.getData_IDB( keyName, callBack );
};

DataManager2.saveData_ClientsStore = function( jsonData, callBack )
{
	var keyName = Constants.storageName_clientList + '_' + SessionManager.sessionData.login_UserName;
	DataManager2.saveData_IDB( keyName, jsonData, callBack );
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

DataManager2.deleteAllStorageData = function( callBack ) 
{
	LocalStgMng.clear();
	
	StorageMng.clear( StorageMng.StorageType_IndexedDB, callBack );
};

DataManager2.deleteDataByStorageType = function( storageTypeStr, secName ) 
{
	StorageMng.removeItem ( storageTypeStr, secName, function(){ 
		console.log( secName + " DELETE successfully !!!");
	} );
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
}

// -------------------------------------
// ---- Supporting Methods ------------

DataManager2.getStorageType = function( secName )
{
	var storageTypeStr = ( DataManager2.protectedContainer( secName ) ) ? StorageMng.StorageType_IndexedDB : StorageMng.StorageType_LocalStorage;
	return storageTypeStr;
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
