
function MoveLocalStorageData() {}

MoveLocalStorageData.idx = -1;
MoveLocalStorageData.moveData = function(){
    
    MoveLocalStorageData.idx = -1;

    // modify old localstorage data base
    var keys = Object.keys( localStorage );
    MoveLocalStorageData.modifyData( keys );
};

MoveLocalStorageData.modifyData = function( keys )
{
    
    MoveLocalStorageData.idx++;
    console.log( MoveLocalStorageData.idx + " / " +  keys.length );
    if( MoveLocalStorageData.idx < keys.length )
    {
        var keyVal = keys[ MoveLocalStorageData.idx ];

        if( !( keyVal.indexOf( "localforage/" ) == 0 ) )
        {
            var jsonData = JSON.parse( localStorage[ keyVal ] )
          
            DataManager2.saveDataByStorageType( StorageMng.StorageType_LocalStorage, keyVal, jsonData, function(){
                MoveLocalStorageData.modifyData( keys );
            } );
        }
        else
        {
            MoveLocalStorageData.modifyData( keys );
        }
    }
    else // MOVE DATA
    {
        var moveKeys = DataManager2.securedContainers;

        for ( i = 0; i < moveKeys.length; i++ )
        {
            var value = localStorage.getItem( moveKeys[ i ] );
    
            MoveLocalStorageData.moveOneData( moveKeys[ i ], value, function(){
                // DataManager2.deleteDataByStorageType( StorageMng.StorageType_LocalStorage, moveKeys[ i ] );
            } );
        }
    }

}

MoveLocalStorageData.moveOneData = function( key, value, callBack )
{
    DataManager2.getDataByStorageType( StorageMng.StorageType_IndexedDB, key, function( searched ){

        if( searched === null )
        {
            DataManager2.saveDataByStorageType( StorageMng.StorageType_IndexedDB, key, JSON.parse( value ), function( retData ){
                if ( callBack ) callBack( key, retData );
            } );
        }
    })
};