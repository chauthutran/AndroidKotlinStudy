
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

                    //console.log( 'moved [' + container + '] now updating to  ~ ' );

                    LocalStorageDataManager.saveData( container, newData );

                } );
            }

            LocalStorageDataManager.saveData("movedData", "true");

            //console.log("All data from localStorage is moved to IndexDb.");
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
