function DBStorageSelector()
{
    var me = this;

    me.init = function()
    {
        //me.handleChange( 'indexdb' );
        //document.getElementById("dbStorageSelector").onchange = me.handleChange;
        setTimeout( function(){
            me.setDefaultDataHandler();
          }, 2500 ); 
    }

    /*me.handleChange = function(event) {
        var selectedValue = this.value;

        LocalStorageDataManager.saveData( "dbStorageType", selectedValue );
        IndexdbDataManager.saveData( "dbStorageType", selectedValue );

        DataManager.dbStorageType = selectedValue;
    };*/

    me.setDefaultDataHandler = function() {
        var selectedValue = 'indexdb';

        LocalStorageDataManager.saveData( "dbStorageType", selectedValue );
        IndexdbDataManager.saveData( "dbStorageType", selectedValue );

        DataManager.dbStorageType = selectedValue;
    };

    me.setStorageDb = function()
    {
        LocalStorageDataManager.getData( "dbStorageType", function(value){
            if( value == undefined ) {
                document.getElementById("dbStorageSelector").value = DataManager.dbStorageType_localStorage;
            }
            else{
                document.getElementById("dbStorageSelector").value = value;
            }
        });
    };

    // --------------------------------------------------------------------------------------

    me.init();
    
}