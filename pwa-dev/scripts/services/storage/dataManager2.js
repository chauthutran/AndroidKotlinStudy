// -------------------------------------------
// -- DataManager2 Class/Methods
// ---- USES 'LocalForage' version of 'DataManager'

function DataManager2() {}

DataManager2.StorageName_session = "session";
DataManager2.StorageName_appInfo = "appInfo";
DataManager2.StorageName_persisData = "persisData";

DataManager2.StorageName_loginResp = "loginResp";
DataManager2.StorageName_clientList = "clientList";


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
	try
	{
		DataManager2.getData_ByType( StorageMng.StorageType_IndexedDB, secName, function( data ) {
			callBack( data );
		});	
	}
	catch( errMsg )
	{
		console.log( 'FAILED in DataManager2' );
		callBack();
	}
};

// GetData - LocalStorage
DataManager2.getData_LS = function( secName, callBack ) 
{
	try
	{
		DataManager2.getData_ByType( StorageMng.StorageType_LocalStorage, secName, callBack );
	}
	catch( errMsg )
	{
		console.log( 'FAILED in DataManager2' );
		callBack();
	}
};

// ------------------------------------------------
// -------- SAVE Methods --------------

// saveData - IndexedDB
DataManager2.saveData_IDB = function( secName, data, retFunc ) 
{
	try
	{
		DataManager2.saveData_ByType( StorageMng.StorageType_IndexedDB, secName, data, retFunc );
	}
	catch( errMsg )
	{
		console.log( 'FAILED in DataManager2' );
		if ( retFunc ) retFunc();
	}
};

// saveData - LocalStorage
DataManager2.saveData_LS = function( secName, jsonData, retFunc ) 
{
	try
	{
		DataManager2.saveData_ByType( StorageMng.StorageType_LocalStorage, secName, jsonData, retFunc );
	}
	catch( errMsg )
	{
		console.log( 'FAILED in DataManager2' );
		if ( retFunc ) retFunc();
	}
};

// -----------------------------------

DataManager2.getJsonDecripted_IDB = function( keyName, callBack ) 
{
	DataManager2.getData_IDB( keyName, function( data ) {
		callBack( DataManager2.decriptData( data ) );
	});
};

DataManager2.saveJsonEncripted_IDB = function( keyName, jsonData, retFunc ) 
{
	var encryptedDataStr = DataManager2.encryptData( jsonData );
	DataManager2.saveData_IDB( keyName, encryptedDataStr, retFunc );
};

// -----------------------------------------

// Base GetData - by storage type
DataManager2.getData_ByType = function( storageTypeStr, secName, callBack ) 
{
	StorageMng.getItem( storageTypeStr, secName, function( err, data ) {		
		if ( callBack ) callBack( data );		
	});
};

// Base SaveData - by storage type
DataManager2.saveData_ByType = function( storageTypeStr, secName, data, callBack ) 
{		
	StorageMng.setItem( storageTypeStr, secName, data, function() {
		if ( callBack ) callBack( data );
	});		
}

// ------------------------------------------------
// -------- Encrypt/Decript Methods --------------
DataManager2.encryptData = function( dataJson, passwd )
{
	var iv = ( passwd ) ? passwd : SessionManager.sessionData.login_Password;

	var encryptedDataStr = CryptoJS.AES.encrypt( JSON.stringify( dataJson ), iv, {
		keySize: 128 / 8,
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString();

	return encryptedDataStr;
};

DataManager2.decriptData_CMN = function( dataStr, iv )
{
	var descriptedVal = CryptoJS.AES.decrypt( dataStr.toString(), iv, {
		keySize: 128 / 8,
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});

	var utf8StrVal = CryptoJS.enc.Utf8.stringify( descriptedVal );

	return utf8StrVal;
}

// Decript data with 'passwd'(as key) is passed.  Otherwise, use sessionData.login_Password as decripting key.
DataManager2.decriptData = function( dataStr, passwd )
{
	var jsonData;

	if ( dataStr )
	{
		// TODO: For Performance, we can create a simple data (like 'T') - for data decrypt testing.. <-- on top of redeem one..
		try
		{
			var iv = ( passwd ) ? passwd : SessionManager.sessionData.login_Password;

			var utf8StrVal = DataManager2.decriptData_CMN( dataStr, iv );

			jsonData = JSON.parse( utf8StrVal );	
		}
		catch ( errMsg )
		{
			alert( 'Error during data decryption with current password.  If User has been changed, clear all data to resolve this issue.' );
		}
	}

	return jsonData;
};

// ---------------------------------------

DataManager2.checkDecriptionPasswd = function( keyName, passwd, callBack )
{
	try
	{
		if ( keyName && passwd )
		{
			DataManager2.getData_IDB( keyName, function( itemDataStr ) 
			{
				var isSuccess = false;

				if ( itemDataStr )
				{
					var utf8StrVal = DataManager2.decriptData_CMN( itemDataStr, passwd );
	
					if ( utf8StrVal )
					{
						var jsonData = JSON.parse( utf8StrVal );
						if ( jsonData && Util.isTypeObject( jsonData ) )
						{
							isSuccess = true;
						}
					}	
				}
	
				callBack( isSuccess );
			});
		}
		else callBack( false );
	}
	catch ( errMsg )
	{
		console.log( 'password failed to decript' );
		callBack( false );
	}
};

// ------------------

DataManager2.checkDataExists_IDB = function( keyName, callBack )
{
	try
	{
		DataManager2.getData_IDB( keyName, function( data ) {
			if ( data ) callBack( true );
			else callBack( false );
		});	
	}
	catch ( errMsg )
	{
		console.log( 'FAILED in DataManager2' );
		callBack( false );
	}
};

// ---------------------------------

DataManager2.getData_ClientsStore = function( userName, passwd, callBack )
{
	var keyName = DataManager2.StorageName_clientList + '_' + userName;

	DataManager2.getData_IDB( keyName, function( data ) {
		callBack( DataManager2.decriptData( data, passwd ) );
	});
};

DataManager2.saveData_ClientsStore = function( userName, passwd, jsonData, callBack )
{
	var keyName = DataManager2.StorageName_clientList + '_' + userName;

	var encryptedDataStr = DataManager2.encryptData( jsonData, passwd );
	DataManager2.saveData_IDB( keyName, encryptedDataStr, callBack );
};

// ---- AppInfo ---------

DataManager2.getData_AppInfo = function( userName, passwd, callBack )
{
	var keyName = DataManager2.StorageName_appInfo + '_' + userName;

	DataManager2.getData_IDB( keyName, function( data ) {
		callBack( DataManager2.decriptData( data, passwd ) );
	});	
};

DataManager2.saveData_AppInfo = function( userName, passwd, jsonData, callBack )
{
	var keyName = DataManager2.StorageName_appInfo + '_' + userName;
	
	var encryptedDataStr = DataManager2.encryptData( jsonData, passwd );
	DataManager2.saveData_IDB( keyName, encryptedDataStr, callBack );
};

// -----------------------------------------

DataManager2.getData_LoginResp = function( userName, passwd, callBack )
{
	var keyName = DataManager2.StorageName_loginResp + '_' + userName;

	DataManager2.getData_IDB( keyName, function( data ) {
		callBack( DataManager2.decriptData( data, passwd ) );
	});	
};

DataManager2.saveData_LoginResp = function( userName, passwd, jsonData, callBack )
{
	var keyName = DataManager2.StorageName_loginResp + '_' + userName;
	
	var encryptedDataStr = DataManager2.encryptData( jsonData, passwd );
	DataManager2.saveData_IDB( keyName, encryptedDataStr, callBack );
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
	//LocalStgMng.clear();
	LocalStgMng.deleteData( DataManager2.StorageName_appInfo );
	
	StorageMng.clear( StorageMng.StorageType_IndexedDB, callBack );
};

DataManager2.deleteDataByStorageType = function( storageTypeStr, secName ) 
{
	StorageMng.removeItem ( storageTypeStr, secName, function(){ 
		console.log( secName + " DELETE successfully !!!");
	} );
};

// =========================

// TRAN TODO : this method isn't use any place
DataManager2.getUserConfigData = function( callBack ) 
{
	DataManager2.getData_ByType( StorageMng.StorageType_LocalStorage, DataManager2.StorageName_session, function( err, sessionJson ){
		if ( sessionJson && sessionJson.user )	
		{
			DataManager2.getData_ByType( StorageMng.StorageType_LocalStorage, sessionJson.user, function( err, userConfigJson ){
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

// TRAN TODO : this method isn't use any place
DataManager2.getSessionData = function( callBack ) 
{
	DataManager2.getData_ByType( StorageMng.StorageType_LocalStorage, DataManager2.StorageName_session, callBack );

	// LocalStorageDataManager2.getSessionData( callBack );
}


// TRAN TODO : this method isn't use any place
DataManager2.setSessionDataValue = function( prop, val ) 
{
	var storageTypeStr = StorageMng.StorageType_LocalStorage;
	DataManager2.getData_ByType( storageTypeStr, DataManager2.StorageName_session, function( sessionJson ){
		if ( sessionJson )
		{
			sessionJson[ prop ] = val;

			DataManager2.saveData_ByType( storageTypeStr, DataManager2.StorageName_session, sessionJson );
		}
	} );

	// LocalStorageDataManager2.setSessionDataValue( prop, val );
}

// TRAN TODO : this method isn't use any place
DataManager2.getSessionDataValue = function( prop, defval, callBack ) 
{
	DataManager2.getData_ByType( StorageMng.StorageType_LocalStorage, DataManager2.StorageName_session, function( sessionJson ){
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


// TRAN TODO : this method isn't use any place
DataManager2.clearSessionStorage = function()
{
	DataManager2.deleteDataByStorageType( StorageMng.StorageType_LocalStorage, DataManager2.StorageName_session );
}

// -------------------------------------
// ---- Supporting Methods ------------

// TRAN TODO : this method isn't use any place
DataManager2.getStorageType = function( secName )
{
	var storageTypeStr = ( DataManager2.protectedContainer( secName ) ) ? StorageMng.StorageType_IndexedDB : StorageMng.StorageType_LocalStorage;
	return storageTypeStr;
}

// TRAN TODO : this method isn't use any place
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

// TRAN TODO : this method isn't use any place
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
