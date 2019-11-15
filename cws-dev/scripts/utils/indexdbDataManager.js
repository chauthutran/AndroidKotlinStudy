// -------------------------------------------
// -- IndexdbDataManager Class/Methods
//		Currently 'IndexdbDataManager' uses 'localStorage' for now...
//		Should be move to IndexDB...

function IndexdbDataManager() {}

// -------------------------------------
// ---- Overall Data Save/Get/Delete ---

IndexdbDataManager.saveData = function( secName, jsonData, callBack ) 
{
	var dbStorage = new DBStorage();
	var pushData;

	if ( DataManager.protectedContainer( secName ) )
	{

		// preparation for WACO-179: here is where we upgrade secured container content to use array values per Username
		var JSONcontainerData = {};

		IndexdbDataManager.getIV( function( iv ){

			var pushData = CryptoJS.AES.encrypt( JSON.stringify( jsonData ), iv,
			{
			   keySize: 128 / 8,
			   iv: iv,
			   mode: CryptoJS.mode.CBC,
			   padding: CryptoJS.pad.Pkcs7
			 }).toString();

			 dbStorage.addData( secName, pushData );

			 if ( callBack ) callBack( pushData );
		} )
	}
	else
	{
		pushData = JSON.stringify( jsonData );

		dbStorage.addData( secName, pushData );

		if ( callBack ) callBack();
	}

};

IndexdbDataManager.getData = function( secName, callBack ) 
{
	if( secName !== undefined )
	{
		var dbStorage = new DBStorage();

		dbStorage.getData( secName, function( data ){

			var jsonData;

			if ( data ) 
			{
				if ( DataManager.protectedContainer( secName ) )
				{

					IndexdbDataManager.getIV( function( iv ){

						IndexdbDataManager.trackOpenEventDelay( false );

						jsonData = JSON.parse( CryptoJS.enc.Utf8.stringify( CryptoJS.AES.decrypt( data.value.toString(), iv, 
						{
							keySize: 128 / 8,
							iv: iv,
							mode: CryptoJS.mode.CBC,
							padding: CryptoJS.pad.Pkcs7
						} ) ) );

						IndexdbDataManager.trackOpenEventDelay( true );

						if ( callBack ) callBack( jsonData );

					} )

				}
				else
				{
					jsonData = JSON.parse( data.value );

					if ( callBack ) callBack( jsonData );
				}
			}
			else
			{
				if ( callBack ) callBack( jsonData );
			}
		} );
	}
	else 
	{
		if ( callBack ) callBack();
	}

};

IndexdbDataManager.trackOpenEventDelay = function( lastEntry )
{
	if ( lastEntry == false )
	{

	}
	else
	{
		
	}

}

IndexdbDataManager.getIV = function( callBack )
{
	if ( FormUtil.login_Password ) 
	{ 
		if ( callBack ) callBack( FormUtil.login_Password );
	}
	else
	{
		DataManager.getSessionData( function( data ) { 

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

IndexdbDataManager.getOrCreateData = function( secName, callBack ) {
	IndexdbDataManager.getData( secName, function( lastSessionAll ){
		if ( !lastSessionAll ) lastSessionAll = {};
		if ( callBack ) callBack( lastSessionAll );
	});
	
};

IndexdbDataManager.deleteData = function( secName ) {
	var dbStorage = new DBStorage();
	dbStorage.deleteData( secName );
};

// -------------------------------------
// ---- List Item Data Save/Get/Delete ---


IndexdbDataManager.insertDataItem = function( secName, jsonInsertData, callBack ) {

	IndexdbDataManager.getOrCreateData( secName, function( jsonMainData ){
		// We assume that this has 'list' as jsonArray (of data)
		if ( jsonMainData.list === undefined ) jsonMainData.list = [];
		jsonMainData.list.push( jsonInsertData );

		IndexdbDataManager.saveData( secName, jsonMainData, callBack );
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

IndexdbDataManager.getItemFromData = function( secName, id, callBack ) 
{
	var itemData;

	if ( secName && id )
	{
		IndexdbDataManager.getOrCreateData( secName, function( jsonMainData ){

			if ( DataManager.protectedContainer( secName ) )
			{
				var decrData = jsonMainData; 

				itemData = Util.getFromList( decrData.list, id, "id" );

				if ( callBack ) callBack( itemData );

			}
			else
			{
				if ( jsonMainData.list !== undefined ) 
				{			
					itemData = Util.getFromList( jsonMainData.list, id, "id" );

					if ( callBack ) callBack( itemData );

				}
				else
				{
					if ( callBack ) callBack();
				}
			}

		} );
	}
	else
	{
		if ( callBack ) callBack();
	}

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
