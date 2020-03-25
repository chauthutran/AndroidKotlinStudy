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
    ConfigUtil.configUserRole( configJson, function(){

         var compareList = ( bOnline ) ? configJson.areas.online : configJson.areas.offline;
         var retAreaList = [];

         for ( var i=0; i< compareList.length; i++ )
         {
            if ( compareList[ i ].userRoles )
            {
                for ( var p=0; p< compareList[ i ].userRoles.length; p++ )
                {
                    if ( FormUtil.login_UserRole.includes( compareList[ i ].userRoles[ p ]  ) )
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

ConfigUtil.configUserRole = function( configJson, callBack )
{
    var defRoles = configJson.definitionUserRoles;
    var userGroupRole = FormUtil.orgUnitData.orgUnit.organisationUnitGroups;

    if ( defRoles && userGroupRole )
    {
        for ( var r=0; r< userGroupRole.length; r++ )
        {
            for ( var i=0; i< defRoles.length; i++ )
            {
                if ( defRoles[ i ].uid == userGroupRole[ r ].id )
                {
                    FormUtil.login_UserRole.push( defRoles[ i ].id );
                }
            }
        }

        if ( callBack ) callBack();
    }
    else
    {
        FormUtil.login_UserRole = [];
        if ( callBack ) callBack();
    }

};


ConfigUtil.getActivityDisplaySettings = function( configJson )
{
    var displaySettings = [ 
        "'<b><i>' + activityItem.created + '</i></b>'"
    ];

    try
    {
        if ( configJson.settings 
            && configJson.settings.redeemDefs
            && configJson.settings.redeemDefs.displaySettings )
        {
            displaySettings = configJson.settings.redeemDefs.displaySettings;
        }
    }
    catch ( errMsg )
    {
        console.log( 'Error in ConfigUtil.getActivityDisplaySettings, errMsg: ' + errMsg );
    }


    return displaySettings;
};

