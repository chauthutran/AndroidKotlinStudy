// -------------------------------------------
// -- ConfigUtil Class/Methods

function ConfigUtil() {}

ConfigUtil.configJson = {};     // store the configJson here when first loading config?
ConfigUtil.configSetting = {};

// ==== Methods ======================

ConfigUtil.getDsConfigJson = function( dsConfigLoc, returnFunc )
{    
    RESTUtil.retrieveJson( dsConfigLoc, returnFunc );
};

ConfigUtil.setConfigJson = function ( configJson ) 
{
    ConfigUtil.configJson = configJson;
};  

ConfigUtil.setSettingsJson = function( configJson )
{
    ConfigUtil.configSetting = configJson.settings;
    /*
        "settings": {
            "message": {
                "autoHide": true,
                "autoHideTime": "5000",
                "networkFailedMsgType": "alertMsg"
            }
        },
    */
};

ConfigUtil.getSettings = function( settingName )
{
    if ( settingName )
    {
        return ConfigUtil.configSetting[ settingName ];
    }   
    else
    {
        return ConfigUtil.configSetting;
    } 
}


ConfigUtil.getMsgAutoHide = function( configJson )
{
    ConfigUtil.configSetting = configJson.settings;
    /*
        "settings": {
            "message": {
                "autoHide": true,
                "autoHideTime": "5000",
                "networkFailedMsgType": "alertMsg"
            }
        },
    */
};


// ------------------------------------

ConfigUtil.getAreaListByStatus = function( bOnline, configJson )
{
    return ( bOnline ) ? configJson.areas.online : configJson.areas.offline;
};

ConfigUtil.getAllAreaList = function( configJson )
{
    var combinedAreaList = [];

    return combinedAreaList.concat( configJson.areas.online, configJson.areas.offline );
};
