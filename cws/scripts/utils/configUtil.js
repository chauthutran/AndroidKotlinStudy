// -------------------------------------------
// -- ConfigUtil Class/Methods

function ConfigUtil() {}

// ==== Methods ======================

ConfigUtil.getDsConfigJson = function( dsConfigLoc, returnFunc )
{
    // 1. fetch config json
    fetch( dsConfigLoc )
    .then( response => response.json() )
    .then( configJson => {
        returnFunc( configJson );
    });
    // TODO: NEED TO PROPERLY IMPLEMENT THE 'CATCH' PHRASE
    /*
    .catch( error => {  
        console.log( 'Failed to load the config file: ', error );  
        //alert( 'Failed to load the config file' );
    });
    */			
};

ConfigUtil.getAreaListByStatus = function( bOnline, configJson )
{
    return ( bOnline ) ? configJson.areas.online : configJson.areas.offline;
};

ConfigUtil.getAllAreaList = function( configJson )
{
    var combinedAreaList = [];

    return combinedAreaList.concat( configJson.areas.online, configJson.areas.offline );
};
