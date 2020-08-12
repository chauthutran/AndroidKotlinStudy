function DataVerMove() {}

DataVerMove.verRunList = [];

// =====================================
// ===== MAIN STARTING CALL ============

DataVerMove.dataChangeHandle = function()
{
    // List the version methods here, since we need to define this first..
    // Put this in 'initalize'?  'setUp'?
    DataVerMove.verRunList = [
        //{ 'ver': 2, 'run': DataVerMove.lsLocalForageMove }
        //{ 'ver': undefined, 'run': DataVerMove.lsRedeemListMove }
        { 'ver': undefined, 'run': DataVerMove.idbLocalForageMove }
    ];


    DataVerMove.getDataVersionNumber_LF( function( versionNumber )
    {
        console.customLog( ' ===> DataVerMove Current versionNumber: ' + versionNumber  );

        var dataObj = { 'currVer': versionNumber, 'list': DataVerMove.verRunList };

        Util.recursiveCalls( dataObj, 0, function( itemData, continueNext, finishCall ) {

            if ( !itemData.ver || itemData.ver > dataObj.currVer )
            {
                console.customLog( ' ===> DataVerMove RUN [VER: ' + itemData.ver + ']' );

                itemData.run( function() {
                    
                    DataVerMove.markDataVersionNumber_LF( itemData.ver, function() {
                        continueNext();                    
                    } );
                });
            }
            else continueNext();

        }, function() {
            // Finished
            console.customLog( ' ===> DataVerMove.dataChangeHandle() FINISHED' );
        });
        
    });
};

// =====================================
// ===== VERSION GET/MARK CALLS  ============

// ---------------------------------------
// --- localForage Version

DataVerMove.getDataVersionNumber_LF = function( callBack )
{    
    DataManager2.getData_LS( "dataVersion", function( dataVersion )
    {
        var versionNumber = 0;

        if ( dataVersion && dataVersion.ver ) versionNumber = Number( dataVersion.ver );
        
        callBack( versionNumber );
    });
};

DataVerMove.markDataVersionNumber_LF = function( versionNumber, callBack )
{    
    if ( !versionNumber ) callBack();
    else
    {
        var dataJson = { 'ver': versionNumber };

        console.customLog( 'markDataVersionNumber_LF, versionNumber ' + versionNumber  );
    
        DataManager2.saveData_LS( "dataVersion", dataJson, callBack );    
    }
}

// ---------------------------------------
// --- old Versions

DataVerMove.getDataVersionNumber = function( callBack )
{    
    var dataVersion = LocalStgMng.getJsonData( "dataVersion" );
    var versionNumber = 0;

    if ( dataVersion && dataVersion.ver ) versionNumber = Number( dataVersion.ver );

    callBack( versionNumber );
};

DataVerMove.markDataVersionNumber = function( versionNumber )
{    
    var dataJson = { 'ver': versionNumber };

    LocalStgMng.saveData( "dataVersion", dataJson );
}

// =====================================
// ===== CALLING METHODS  ============

DataVerMove.lsLocalForageMove = function( callBack )
{
    DataVerMove.checkLS_LocalForageNeedMove( function( needToMove, moveKeys ) 
    {
        if ( needToMove )
        {
            console.customLog( ' ===> NEED TO MOVE LS LF, moveKeys: ' );
            console.customLog( moveKeys );

            var dataObj = { 'list': moveKeys };

            Util.recursiveCalls( dataObj, 0, function( keyStr, continueNext, finishCall ) {

                var jsonData = JSON.parse( localStorage[ keyStr ] )
                
                // Change key name
                DataManager2.saveData_LS( keyStr, jsonData, function(){
                    continueNext();
                } );

            }, function() {
                // Finished
                console.customLog( ' ===> Ran DataVerMove.lsLocalForageMove()' );
                callBack();

                //DataVerMove.dataCopyToIDBs();
            });
        }
        else callBack();
    });
};


DataVerMove.blankTest = function( callBack )
{    
    console.customLog( ' ===> Ran DataVerMove.blankTest()' );
    callBack();
};


DataVerMove.idbLocalForageMove = function( callBack )
{    
    DataVerMove.checkIDB_LocalForageNeedMove( function( needToMove, moveKeys ) 
    {
        if ( needToMove )
        {
            console.customLog( ' IDB, needToMove: ' + needToMove );

            var dataObj = { 'list': moveKeys };
            
            Util.recursiveCalls( dataObj, 0, function( keyStr, continueNext, finishCall ) {

                DataManager2.getData_IDB( keyStr, function( jsonData )
                {
                    // Change key name
                    DataManager2.saveData_IDB( keyStr, jsonData, function(){

                        console.customLog( ' ===> IDB COPIED - keyStr: ' + keyStr );
                        continueNext();
                    } );

                });
                
            }, function() {
                // Finished
                console.customLog( ' ===> Ran DataVerMove.idbLocalForageMove()' );
                callBack();
            });
            
        }
        else callBack();

    });
};


DataVerMove.lsRedeemListMove = function( callBack )
{    
    // Add Try/Catch Wrapper?
    Util.tryCatchCallBack( callBack, function( callBackInner ) {

        DataVerMove.checkRedeemListNeedMove( function( needToMove ) 
        {
            if ( needToMove )
            {
                console.customLog( ' lsRedeemList, needToMove: ' + needToMove );
    
                // get from LocalStorage and put it on IDB with localForage..
                var redeemListDataStr = localStorage.getItem( Constants.storageName_redeemList );

                if ( redeemListDataStr )
                {
                    var redeemListJson = JSON.parse( redeemListDataStr );
    
                    DataManager2.saveData_RedeemList( redeemListJson, function( retData )
                    {
                        console.customLog( ' ===> RedeemList LS Moved.' );                    
                        localStorage.setItem( Constants.lsFlag_dataMoved_redeemListIDB, "Y" );
    
                        callBackInner();
                    });
                }
                else callBackInner();
            }
            else callBackInner();
        });
    });
};

// =====================================
// ===== SUPPORTING METHODS  ============


// NOTE: Just checks if missing match exists..
DataVerMove.checkLS_LocalForageNeedMove = function( callBack )
{
    var moveKeys = [];
    var keys = Object.keys( localStorage );

    for ( var i = 0; i < keys.length; i++ )
    {
        var keyStr = keys[i];

        if ( keyStr != 'dataVersion' ) // skip 'dataVersion' on LF move..
        {
            // if key is not 'localForage' type 
            if( !( keyStr.indexOf( "localforage/" ) == 0 ) )
            {
                // and if the matching 'localForage' version does not exists..
                if ( keys.indexOf( "localforage/" + keyStr ) < 0 )
                {
                    moveKeys.push( keyStr );
                }
            }    
        }
    }

    var needToMove = ( moveKeys.length > 0 );

    callBack( needToMove, moveKeys );
};


DataVerMove.checkIDB_LocalForageNeedMove = function( callBack )
{
    var moveKeys = DataManager2.securedContainers; //[ Constants.storageName_redeemList ];
    // LATER, use 'recursiveCall' method to go through the list..

    var keyStr = Constants.storageName_redeemList;
    // var fixedKeys = [ Constants.storageName_redeemList ];

    // Get IndexedDB using old storage..
    DataManager2.getData_IDB( keyStr, function( searched )
    {
        // If exists, check the 'localForage' one
        if( searched )
        {
            // 
            DataManager2.getData_IDB( keyStr, function( retData )
            {
                // If exists in LS, but Not in IDB, callBack with true..
                if ( !retData )
                {
                    //console.customLog( searched );
                    callBack( true, [ keyStr ] );
                }
                else callBack( false, [] );
            } );
        }
        else callBack( false, [] );
    });
};


DataVerMove.checkRedeemListNeedMove = function( callBack )
{    
    var needToMove = true;

    var moveFlag = localStorage.getItem( Constants.lsFlag_dataMoved_redeemListIDB );

    if ( moveFlag === "Y" ) needToMove = false;
    else 
    {
        
    }

    callBack( needToMove );
};

// -----------------------------------------

DataVerMove.dataCopyToIDBs = function()
{
    // Move to indexedDB for all the secured ones (Constants.storageName_redeemList)
    var moveKeys = DataManager2.securedContainers;

    for ( var i = 0; i < moveKeys.length; i++ )
    {
        var value = localStorage.getItem( moveKeys[ i ] );

        DataVerMove.dataCopyToIDB( moveKeys[ i ], value, function(){
            // DataManager2.deleteDataByStorageType( StorageMng.StorageType_LocalStorage, moveKeys[ i ] );

        } );
    }
};


// Save to indexedDB storage with same key..
DataVerMove.dataCopyToIDB = function( key, value, callBack )
{
    //DataManager2.getDataByStorageType( StorageMng.StorageType_IndexedDB, key, function( searched )
    DataManager2.getData_IDB( key, function( searched )
    {
        // If there is already info in IndexedDB, do not save it..
        if( searched === null )
        {
            DataManager2.saveData_IDB( key, JSON.parse( value ), function( retData ){
                console.customLog( ' ===> [NEW]: DATA MOVED to indexedDB, key: ' + key + '.' );

                if ( callBack ) callBack( key, retData );
            } );
        }
        else
        {
            console.customLog( ' ===> [NEW]: DATA NOT MOVED.  Data in IndexedDB already exists.' );
        }
    })
};


