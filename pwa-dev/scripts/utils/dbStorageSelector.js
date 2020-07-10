function DBStorageSelector()
{
    var me = this;

    me.init = function()
    {
        setTimeout( function(){
            me.setDefaultDataHandler();
          }, 2500 ); 
    }

    me.setDefaultDataHandler = function() {
        var selectedValue = 'indexdb';

        DataManager2.dbStorageType = selectedValue;
    };

    me.setStorageDb = function()
    {
        var  value = LocalStgMng.getJsonData( "dbStorageType" );
        if( value == undefined ) { 
            document.getElementById("dbStorageSelector").value = DataManager2.dbStorageType_localStorage;
        }
        else{
            document.getElementById("dbStorageSelector").value = value;
        }
    };

    // --------------------------------------------------------------------------------------

    me.init();
    
}