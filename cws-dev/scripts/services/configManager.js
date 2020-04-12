// -------------------------------------------
// -- ConfigManager Class/Methods

// -- 1. Define the loading place clearly
//      - On login..  <-- undernearth the call..
//      2. Remove other points..


function ConfigManager() {}

ConfigManager.configJson = {};     // store the configJson here when first loading config?
ConfigManager.configSetting = {};

// -- Default Configs -----
// ----- If not on download config, place below default to 'config' json.

ConfigManager.syncSetting_Default = {
    "syncDown": {
        "clientSearch": {
            "mainSearch": {
                "activities": {
                    "$elemMatch": {
                        "activeUser": "INFO.login_UserName"
                    }
                }
            },
            "dateSearch": {
                "updated": {
                    "$gte": "INFO.dateRange_gtStr"
                }
            }
        },
        "url": "/PWA.syncDown",
        "syncDownPoint": "login",
        "enable": true    
    },
    "syncUp": {
        "dateField": "updated"
    }
};

ConfigManager.setting_Default = {
    "message":{  
       "autoHide":true,
       "autoHideTime":"5000",
       "networkFailedMsgType":"alertMsg"
    },
    "theme":"default",
    "redeemDefs":{  
       "statusOptions":[
          {  
             "name":"submit",
             "label":"Sync",
             "icon":{  
                "path":"images/completed.svg",
                "colors":{  
                   "background":"#7DD11F",
                   "foreground":"#ffffff"
                }
             }
          },
          {  
             "name":"queued",
             "label":"Pending",
             "icon":{  
                "path":"images/pending.svg",
                "colors":{  
                   "background":"#6FCF97",
                   "foreground":"#4F4F4F"
                }
             }
          },
          {  
             "name":"failed",
             "label":"Sync error",
             "icon":{  
                "path":"images/failed.svg",
                "colors":{
                   "background":"#FFFFFF",
                   "foreground":"#FF2B2B"
                }
             }
          },
          {
             "name": "downloaded",
             "label": "historic[1]",
             "icon": {
                "path": "images/arrow-circle-down.svg",
                "colors": {
                   "background": "#FFFFFF",
                   "foreground": "#808080"
                }
             }
          }
       ],
       "statusIconSize":{  
          "width":24,
          "height":24
       },
       "activityIconSize":{  
          "width":56,
          "height":56
       },

       "displaySettings": [
          "'<b><i>' + activityItem.activityDate.capturedLoc + '</i></b>'",
          "activityTrans.firstName + ' ' + activityTrans.lastName"
       ],
       "activityTypes":[  
          {  
             "name":"FPL-SP",
             "term":"",
             "label":"FPL-SP",
             "icon":{  
                "path":"images/act_col.svg",
                "colors":{  
                   "background":"#009C99",
                   "foreground":"#FEFFD1"
                }
             },
             "previewData":[  
                "age phoneNumber",
                "hairStyle"
             ],
             "displaySettings": [
                "'<u>' + activityItem.activityDate.capturedLoc + '</u>: <i>' + activityItem.activityId + '</i>'",
                "activityTrans.activityType"
             ]
          },{  
             "name":"eVoucher",
             "term":"",
             "label":"eVoucher",
             "icon":{  
                "path":"images/act_col.svg",
                "colors":{  
                   "background":"#6FCF97",
                   "foreground":"#4F4F4F"
                }
             },
             "previewData":[  
                "age phoneNumber",
                "voucherCode"
             ],
             "displaySettings": [
                "'<b><i>' + activityItem.activityDate.capturedLoc + '</i></b>'",
                "activityTrans.firstName + ' ' + activityTrans.lastName"
             ]
          },
          {  
             "name":"WalkInB",
             "term":"",
             "label":"Voucher: Walk In",
             "icon":{  
                "path":"images/act_col.svg",
                "colors":{  
                   "background":"#6FCF97",
                   "foreground":"#4F4F4F"
                }
             },
             "previewData":[  
                "phoneNumber",
                "<strong>age</strong>"
             ]
          },
          {  
             "name":"WalkInA",
             "term":"",
             "label":"Walk In",
             "icon":{  
                "path":"images/arrows_col.svg",
                "colors":{  
                   "background":"#ffc61d",
                   "foreground":"#1C1C1C"
                }
             },
             "previewData":[  
                "<strong>age</strong>",
                "phoneNumber"
             ]
          },
          {  
             "name":"PhoneVoucher",
             "term":"",
             "label":"Phone Voucher",
             "icon":{  
                "path":"images/act_col.svg",
                "colors":{  
                   "background":"#ffc61d",
                   "foreground":"#1C1C1C"
                }
             },
             "previewData":[  
                "<u>lastName, firstName",
                "voucherCode"
             ]
          }
       ]
    }
};

// ==== Methods ======================

ConfigManager.getDsConfigJson = function( dsConfigLoc, returnFunc )
{    
    RESTUtil.retrieveJson( dsConfigLoc, returnFunc );
};

ConfigManager.getConfigJson = function () 
{
    return ConfigManager.configJson;
};  

ConfigManager.setConfigJson = function ( configJson ) 
{
    ConfigManager.configJson = configJson;

    // TODO: If default config parts do not exists, insert them....
    // ConfigManager.syncSetting_Default = {
    // ConfigManager.setting_Default = {    
};

ConfigManager.setSettingsJson = function( configJson )
{
    ConfigManager.configSetting = configJson.settings;
};

ConfigManager.getSettings = function( settingName )
{
    if ( settingName )
    {
        return ConfigManager.configSetting[ settingName ];
    }   
    else
    {
        return ConfigManager.configSetting;
    } 
}


// ------------------------------------

ConfigManager.getAreaListByStatus = function( bOnline, callBack )
{
    var configJson = ConfigManager.configJson;

    ConfigManager.configUserRole( function()
    {
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

ConfigManager.getAllAreaList = function()
{
    var combinedAreaList = [];

    return combinedAreaList.concat( ConfigManager.configJson.areas.online, ConfigManager.configJson.areas.offline );
};

ConfigManager.configUserRole = function( callBack )
{
    var defRoles = ConfigManager.configJson.definitionUserRoles;
    var userGroupRole = SessionManager.sessionData.orgUnitData.orgUnit.organisationUnitGroups;

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


ConfigManager.getActivityDisplaySettings = function()
{
    var configJson = ConfigManager.configJson;

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
        console.log( 'Error in ConfigManager.getActivityDisplaySettings, errMsg: ' + errMsg );
    }


    return displaySettings;
};


ConfigManager.getActivitySyncUpStatusConfig = function( activityJson )
{
    var activityStatusConfig;
    var configJson = ConfigManager.configJson;

	try
	{        
        if ( activityJson.processing )
        {
            activityStatusConfig = Util.getFromList( configJson.settings.redeemDefs.statusOptions, activityJson.processing.status, 'name' );
        }
	}
	catch ( errMsg )
	{
		console.log( 'Error on ConfigManager.getActivitySyncUpStatusConfig, errMsg: ' + errMsg );
    }
    
    return activityStatusConfig;
};


ConfigManager.getActivityTypeConfig = function( activityJson )
{
	var activityTypeConfig;
    var configJson = ConfigManager.configJson;

    try
	{
        activityTypeConfig = Util.getFromList( configJson.settings.redeemDefs.activityTypes, activityJson.activityType, 'name' );

        // Removed - if matching acitivity type config does not exists, compose activity type based on 'program'..
        // FormUtil.getActivityTypeComposition = function( itemData )
	}
	catch ( errMsg )
	{
		console.log( 'Error on ConfigManager.getActivityTypeConfig, errMsg: ' + errMsg );
    }
    
    return activityTypeConfig;
};



