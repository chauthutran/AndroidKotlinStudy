
function MoveLocalStorageData() {}

MoveLocalStorageData.moveData = function(){
    
        
        LocalStorageDataManager.getData("movedData", function( movedData ){
            if( movedData == undefined )
            {
                // Get all items in localStorage
                var keys = Object.keys( localStorage );

                for ( var key in keys ) {
                        var value = LocalStorageDataManager.getData( key );
                        MoveLocalStorageData.moveOneData( key, value );
                }

                LocalStorageDataManager.saveData("movedData", "true");

                //console.log("All data from localStorage is moved to IndexDb.");
            }
            else
            {
                //console.log("All data from localStorage was moved to IndexDb alreadly.");
            }
        } );
        
};

MoveLocalStorageData.moveOneData = function( key, value )
{
    var dbStorage = new DBStorage();

    dbStorage.getData( key, function( searched ){
        if( searched === undefined )
        {
            //console.log(' --saving  key : ' + key );
            var dbStorage1 = new DBStorage();
            dbStorage1.addData( key, key );
        }
    })
};
