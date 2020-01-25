function MoveLocalStorageData() {}

MoveLocalStorageData.moveData = function(){

    LocalStorageDataManager.getData( "movedData", function( movedData ){

        if( movedData == undefined || movedData == false )
        {
            // Get all items in localStorage
            var keys = Object.keys( localStorage );
            var moveKeys = [];

            for ( var key in keys ) 
            {
                if ( DataManager.protectedContainer( keys[ key ] ) ) moveKeys.push( keys[ key ] )
            }

            for ( i = 0; i < moveKeys.length; i++ )
            {
                var value = localStorage.getItem( moveKeys[ i ] );

                MoveLocalStorageData.moveOneData( moveKeys[ i ], value, function( container, newData ){

                    // LocalStorageDataManager.saveData( container, newData );
                    localStorage.removeItem( moveKeys[ i ] );

                } );
            }

            LocalStorageDataManager.saveData("movedData", "true");

            for ( i = 0; i < moveKeys.length; i++ )
            {
                localStorage.removeItem( moveKeys[ i ] );
            }

        }
        else
        {
            //console.log("All data from localStorage was moved to IndexDb alreadly.");
            // initiate Diagnostics process:
            // 1. check current cacheSize against recorded cacheSize history?
            // 2. if conditions correct [from 1]
            //     > decrpyt+move indexedDB content to localStorage
            //       > erase indexedDB + set movedData = false
            //         > run other clean up routines
            //           > run page refresh ()
        }
    } );

};

MoveLocalStorageData.moveOneData = function( key, value, callBack )
{
    var dbStorage = new DBStorage();

    dbStorage.getData( key, function( searched ){

        if( searched === undefined )
        {
            IndexdbDataManager.saveData( key, JSON.parse( value ), function( retData ){

                if ( callBack ) callBack( key, retData )

            } );
        }
    })
};


// ====================================================

// ---------------------------
// Before Login, when app start, to check user login?
// But, we can do this right when user click on 'login' as well.
//  - Right before login is performed, we can do below 'modifyDataNew( keys )'
//  - Right after login, we can move localStorage to indexedDB - as needed..
//  * Create AppInfo json in localStorage <-- has database/storage version..
//      - By looking at the storage version, we can decide to upgrade, move, or modify accordingly..
//          (What about  )
//

MoveLocalStorageData.moveDataNew = function(){

    // modify old localstorage data base
    var keys = Object.keys( localStorage );

    MoveLocalStorageData.lsKeyChange( keys, 0, function() {

        MoveLocalStorageData.dataCopyToIDB();
    });
};

MoveLocalStorageData.lsKeyChange = function( keys, index, returnFunc )
{
    
    //MoveLocalStorageData.idx++;
    console.log( index + " / " +  keys.length );

    // 
    if( index < keys.length )
    {
        // If within, move localStorage keys from '--' -> 'localforage/'
        var keyVal = keys[ MoveLocalStorageData.idx ];
        index++;

        if( !( keyVal.indexOf( "localforage/" ) == 0 ) )
        {
            var jsonData = JSON.parse( localStorage[ keyVal ] )
          
            // Change key name
            DataManager2.saveDataByStorageType( StorageMng.StorageType_LocalStorage, keyVal, jsonData, function(){
                MoveLocalStorageData.lsKeyChange( keys, index, returnFunc );
            } );
        }
        else
        {
            // go to next one..
            MoveLocalStorageData.lsKeyChange( keys, index, returnFunc );
        }
    }
    else // MOVE DATA
    {
        returnFunc();
    }
};

MoveLocalStorageData.dataCopyToIDB = function()
{
    // If does not exists, it copies..
    // However, we should check the database version number
    // and if the database version number is lower than expected
    // we should move data..  regardless of existing or not?

    // Move to indexedDB for all the secured ones ('redeemlist')
    var moveKeys = DataManager2.securedContainers;

    for ( i = 0; i < moveKeys.length; i++ )
    {
        var value = localStorage.getItem( moveKeys[ i ] );

        MoveLocalStorageData.moveOneDataNew( moveKeys[ i ], value, function(){
            // DataManager2.deleteDataByStorageType( StorageMng.StorageType_LocalStorage, moveKeys[ i ] );

        } );
    }
};


// Save to indexedDB storage with same key..
MoveLocalStorageData.moveOneDataNew = function( key, value, callBack )
{
    DataManager2.getDataByStorageType( StorageMng.StorageType_IndexedDB, key, function( searched )
    {
        // If there is already info in IndexedDB, do not save it..
        if( searched === null )
        {
            DataManager2.saveDataByStorageType( StorageMng.StorageType_IndexedDB, key, JSON.parse( value ), function( retData ){
                console.log( ' ===> [NEW]: DATA MOVED to indexedDB, key: ' + key + '.' );

                if ( callBack ) callBack( key, retData );
            } );
        }
        else
        {
            console.log( ' ===> [NEW]: DATA NOT MOVED.  Data in IndexedDB already exists.' );
        }
    })
};
