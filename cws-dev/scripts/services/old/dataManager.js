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
DataManager.trackOpenDelays = {};

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
		DataManager.trackOpenEventDelay( secName, false );

		IndexdbDataManager.getData( secName, function( data ){

			DataManager.trackOpenEventDelay( secName, true );

			if ( secName == 'redeemList' && data && data.list )
			{

				var returnList = data.list.filter( a => a.owner == FormUtil.login_UserName );
				var myQueue = returnList.filter( a=>a.status == Constants.status_redeem_queued );
				var myFailed = returnList.filter( a=>a.status == Constants.status_redeem_failed ); //&& (!a.networkAttempt || a.networkAttempt < syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit) );
				var mySubmit = returnList.filter( a=>a.status == Constants.status_redeem_submit );

				FormUtil.records_redeem_submit = mySubmit.length;
				FormUtil.records_redeem_queued = myQueue.length;
				FormUtil.records_redeem_failed = myFailed.length;

				syncManager.dataQueued = myQueue;
				syncManager.dataFailed = returnList.filter( a=>a.status == Constants.status_redeem_failed && ( a.networkAttempt && a.networkAttempt < syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit) );;

			}

			if ( callBack ) callBack( data );

		});
	}
	else
	{

		DataManager.trackOpenEventDelay( secName, false );

		LocalStorageDataManager.getData( secName, function( data ){

			DataManager.trackOpenEventDelay( secName, true );

			if ( callBack ) callBack( data );

		});

	}
};

DataManager.trackOpenEventDelay = function( secName, trackClose )
{
	if ( ! trackClose ) DataManager.trackOpenDelays[ secName ] = {};

	DataManager.trackOpenDelays[ secName ][ ( trackClose ? 'response' : 'request' ) ] = new Date().toISOString();

	if ( trackClose )
	{
		DataManager.trackOpenDelays[ secName ][ 'delay' ] = new Date( DataManager.trackOpenDelays[ secName ][ 'response' ] ) - new Date( DataManager.trackOpenDelays[ secName ][ 'request' ] );

		if ( secName == 'redeemList' ) console.log( DataManager.trackOpenDelays[ secName ] );

	}

}

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

/*DataManager.initialiseStorageEstimates = function()
{
	for ( var i = 0; i < DataManager.securedContainers.length; i++ )
	{
		FormUtil.updateSyncListItems( DataManager.securedContainers[i], function (data) {

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

}*/

DataManager.migrateIndexedDBtoLocalStorage = function( callBack )
{
	MsgManager.notificationMessage( '1.1: removed localStorage "moveData"', 'notificatioDark', undefined,'', 'right', 'top', 10000, false, undefined,'diagnostics1.1' );
	localStorage.removeItem( Constants.lsFlag_dataMoved_redeemListIDB );

	MsgManager.notificationMessage( '1.2: opening indexedDB', 'notificationBlue', undefined,'', 'right', 'top', 10000, false, undefined,'diagnostics1.2' );
	DataManager2.getData_RedeemList( function( activityData ){

		MsgManager.notificationMessage( '1.3: copying to localStorage', 'notificationBlue', undefined,'', 'right', 'top', 10000, false, undefined,'diagnostics1.3' );
		localStorage.setItem( Constants.storageName_redeemList, JSON.stringify( activityData ) );

		MsgManager.notificationMessage( '1.4: deleting IndexedDB', 'notificationBlue', undefined,'', 'right', 'top', 10000, false, undefined,'diagnostics1.4' );

		DataManager.dropMyIndexedDB_CAUTION_DANGEROUS( function( result, msg ){

			if ( callBack ) callBack( result, msg );

		});

	});

}

DataManager.dropMyIndexedDB_CAUTION_DANGEROUS = function( callBack )
{
	var req = indexedDB.deleteDatabase( 'cwsdb' );

	req.onsuccess = function () {
		var msg = "SUCCESS: indexedDB removed";
		MsgManager.notificationMessage( '2: diagnostics > indexedDB MOVED', 'notificationBlue', undefined,'', 'right', 'top', 10000, false, undefined,'diagnostics2' );
		if ( callBack ) callBack( true, msg );
	};

	req.onerror = function () {
		var msg = "Error unable to delete database";
		MsgManager.notificationMessage( '2: diagnostics > indexedDB ERROR', 'notificationPurple', undefined,'', 'right', 'top', 10000, false, undefined,'diagnostics2' );
		if ( callBack ) callBack( false, msg );
	};

	req.onblocked = function () {
		var msg = "DB blocked from being deleted";
		MsgManager.notificationMessage( '2: diagnostics > indexedDB LOCKED', 'notificationPurple', undefined,'', 'right', 'top', 10000, false, undefined,'diagnostics2' );
		if ( callBack ) callBack( false, msg );
	};
}