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
};


// ------------------------------------

ConfigUtil.getAreaListByStatus = function( bOnline, configJson, callBack )
{
    ConfigUtil.configUserRole( bOnline, configJson, function(){

         var compareList = ( bOnline ) ? configJson.areas.online : configJson.areas.offline;
         var retAreaList = [];

         for ( var i=0; i< compareList.length; i++ )
         {
            if ( compareList[ i ].userRoles )
            {
                var bFound = false;

                for ( var p=0; p< compareList[ i ].userRoles.length; p++ )
                {
                    if ( compareList[ i ].userRoles[ p ] == FormUtil.login_UserRole )
                    {
                        retAreaList.push( compareList[ i ] );
                        break;
                    }
                }
            }
            else
            {
                retAreaList.push( compareList[ i ] );
            }
         }

        if ( callBack ) callBack( retAreaList );

    } );
    
};

ConfigUtil.getAllAreaList = function( configJson )
{
    var combinedAreaList = [];

    return combinedAreaList.concat( configJson.areas.online, configJson.areas.offline );
};

ConfigUtil.configUserRole = function( bOnline, configJson, callBack )
{
    var defRoles = configJson.definitionUserRoles;
    var userGroupRole = FormUtil.orgUnitData.orgUnit.organisationUnitGroups;

    if ( defRoles && userGroupRole )
    {
        var roleID = userGroupRole[ 0 ].id;

        for ( var i=0; i< defRoles.length; i++ )
        {
            if ( defRoles[ i ].uid == roleID )
            {
                FormUtil.login_UserRole = defRoles[ i ].id;
                break;
            }
        }

        if ( callBack ) callBack();
    }
    else
    {
        FormUtil.login_UserRole = '';
        if ( callBack ) callBack();
    }

};