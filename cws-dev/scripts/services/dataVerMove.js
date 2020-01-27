function DataVerMove() {}

// Not Used, yet!!!
// The version methods should also add the version..
// should call one after another in order..
DataVerMove.verRunList = [];


DataVerMove.dataChangeHandle = function()
{
    // List the version methods here, since we need to define this first..
    // Put this in 'initalize'?  'setUp'?
    DataVerMove.verRunList = [
        { 'ver': 1, 'run': DataVerMove.redeemListLS_IDB }
        ,{ 'ver': 2, 'run': DataVerMove.blankTest }
    ];

    DataVerMove.getDataVersionNumber( function( versionNumber )
    {
        var dataObj = { 'currVer': versionNumber, 'list': DataVerMove.verRunList };

        Util.recursiveCalls( dataObj, 0, function( itemData, continueNext, finishCall ) {

            if ( itemData.ver > dataObj.currVer )
            {
                itemData.run( function() {
                    
                    DataVerMove.markDataVersionNumber( itemData.ver );

                    continueNext();                    
                });
            }
            else continueNext();

        }, function() {
            // Finished
            console.log( 'Finished running DataVerMove.dataChangeHandle()' );
        });
        
    });

        


        /*
        if( !dataVersion )
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

                DataVerMove.moveOneData( moveKeys[ i ], value, function( container, newData ){

                    // LocalStorageDataManager.saveData( container, newData );
                    //localStorage.removeItem( moveKeys[ i ] );
                    LocalStorageDataManager.saveData("dataVersion", "1");

                } );
            }

            //for ( i = 0; i < moveKeys.length; i++ ) localStorage.removeItem( moveKeys[ i ] );

        }
        */
};

DataVerMove.redeemListLS_IDB = function( callBack )
{
    // Get all items in localStorage
    var keys = Object.keys( localStorage );
    var moveKeys = [];

    // Compose 'moveKeys' with intertested to move ones 'redeemList' in our case.
    for ( var key in keys ) 
    {
        if ( DataManager.protectedContainer( keys[ key ] ) ) moveKeys.push( keys[ key ] )
    }

    // For moving keys, copy from localStorage to IndexedDB.
    for ( i = 0; i < moveKeys.length; i++ )
    {
        var value = localStorage.getItem( moveKeys[ i ] );

        DataVerMove.moveToIDB( moveKeys[ i ], value, function( container, newData ){

            console.log( 'Moved key to indexedDB ' );
            // LocalStorageDataManager.saveData( container, newData );
            //localStorage.removeItem( moveKeys[ i ] );
            //LocalStorageDataManager.saveData("dataVersion", "1");

        } );
    }

    console.log( ' ===> Ran DataVerMove.redeemListLS_IDB()' );
    callBack();
};

DataVerMove.blankTest = function( callBack )
{
    console.log( ' ===> Ran DataVerMove.blankTest()' );
    callBack();
};


DataVerMove.moveToIDB = function( key, value, callBack )
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

// -----------------------------------

DataVerMove.getDataVersionNumber = function( callBack )
{    
    LocalStorageDataManager.getData( "dataVersion", function( dataVersion )
    {
        var versionNumber = 0;

        if ( dataVersion && dataVersion.ver ) versionNumber = Number( dataVersion.ver );

        callBack( versionNumber );
    });
};

DataVerMove.markDataVersionNumber = function( versionNumber )
{    
    var dataJson = { 'ver': versionNumber };

    LocalStorageDataManager.saveData( "dataVersion", dataJson );
}

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

DataVerMove.moveDataNew = function(){

    // modify old localstorage data base
    var keys = Object.keys( localStorage );

    DataVerMove.lsKeyChange( keys, 0, function() {

        DataVerMove.dataCopyToIDB();
    });
};

DataVerMove.lsKeyChange = function( keys, index, returnFunc )
{
    
    //DataVerMove.idx++;
    console.log( index + " / " +  keys.length );

    // 
    if( index < keys.length )
    {
        // If within, move localStorage keys from '--' -> 'localforage/'
        var keyVal = keys[ DataVerMove.idx ];
        index++;

        if( !( keyVal.indexOf( "localforage/" ) == 0 ) )
        {
            var jsonData = JSON.parse( localStorage[ keyVal ] )
          
            // Change key name
            DataManager2.saveDataByStorageType( StorageMng.StorageType_LocalStorage, keyVal, jsonData, function(){
                DataVerMove.lsKeyChange( keys, index, returnFunc );
            } );
        }
        else
        {
            // go to next one..
            DataVerMove.lsKeyChange( keys, index, returnFunc );
        }
    }
    else // MOVE DATA
    {
        returnFunc();
    }
};

DataVerMove.dataCopyToIDB = function()
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

        DataVerMove.moveOneDataNew( moveKeys[ i ], value, function(){
            // DataManager2.deleteDataByStorageType( StorageMng.StorageType_LocalStorage, moveKeys[ i ] );

        } );
    }
};


// Save to indexedDB storage with same key..
DataVerMove.moveOneDataNew = function( key, value, callBack )
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
