function DBStorageSelector()
{
    var me = this;

    me.init = function()
    {
        document.getElementById("dbStorageSelector").onchange = me.handleChange;
    }

    me.handleChange = function(event) {
        var selectedValue = this.value;

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