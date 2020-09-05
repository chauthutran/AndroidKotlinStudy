// -------------------------------------------
//      ConfigManager Class/Methods
//          - Loads configJson data from downloaded file or from locally retrieved 
//              and use it as main config data (in memory main place)
//          - Provides configJson related methods (Get/Set)
//
//      - FEATURES:
//          1. Place default config json parts - used if these parts json are not provided in loaded configJson
//          2. 'setConfigJson' - Used to set the downloaded/retrieved country config to main memory config.
//                  - Also keeps original configJson ('configJson_Original') downloaded/retrieved.
//          3. 'resetConfigJson' - reset is to reload the memory configJson from the original configJson.
//          4. Get related methods
//          5. Apply Defaults related methods.
//
// -------------------------------------------------

function ConfigManager() {}

ConfigManager.configJson = {};     // In memory stored configJson
ConfigManager.configJson_Original = {};  // Downloaded country PWA config original

//ConfigManager.configSetting = {}; // Not Yet coded for it.
ConfigManager.login_UserRoles = []; // Populated when session & config is loaded

ConfigManager.defaultActivityDisplayBase = `Util.formatDate( INFO.activity.processing.created, 'MMM dd, yyyy - HH:mm' );`;
ConfigManager.defaultActivityDisplaySettings = `'<i>' + INFO.activity.id + '</i>'`;


// -- Temp placeholder for some setting data..
ConfigManager.staticData = { 
    soundEffects: false //Util.isMobi()
    , autoComplete: true
    , logoutDelay: 60 
};

// -- Default Configs -----

ConfigManager.defaultActivityType = {
    "name":"default",
    "term":"",
    "label":"default",
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
    ]
};
//   display related setting is purposefully removed.. so that real default settings..
//   "displayBase": "Util.formatDate( INFO.activity.processing.created, 'MMM dd, yyyy - HH:mm' );",
//    "displaySettings": [ "INFO.client.clientDetails.firstName + ' ' + INFO.client.clientDetails.lastName" ]

// ----- If not on download config, place below default to 'config' json.
ConfigManager.defaultJsonList = {

   "syncDown": {
      "pathNote": "settings.sync.syncDown",
      "content": {
         "clientSearch": {
            "mainSearch_Eval": {
                  "activities": {
                     "$elemMatch": {
                        "activeUser": "INFO.login_UserName"
                     }
                  }
            },
            "dateSearch_Eval": {
                  "updated": {
                     "$gte": "INFO.dateRange_gtStr"
                  }
            }
         },
         "url": "/PWA.syncDown",
         "syncDownPoint": "login",
         "enable": true
      }
   },

   "mergeCompare": {
      "pathNote": "settings.sync.mergeCompare",
      "content": {
         "dateCompareField": [ "updated" ]
      }
   },

   "favList": {

    "online": [{
            "id": "1",
            "name": "All Contact",
            "term": "menu_list",
            "img": "images/act_arrows.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "#fff",
                        "foreground": "#4F4F4F"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList"
            }
        },
        {
            "id": "2",
            "name": "Queued",
            "term": "",
            "img": "images/sync-pending_36.svg",
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList",
                "options": {
                    "filter": [{
                        "status": "queued"
                    }]
                }
            }
        },
        {
            "id": "3",
            "name": "Completed",
            "term": "",
            "img": "images/sync.svg",
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList",
                "options": {
                    "filter": [{
                        "status": "submit"
                    }]
                }
            }
        },
        {
            "id": "4",
            "name": "Entry Online only",
            "term": "menu_entry",
            "img": "images/act_col.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "none",
                        "foreground": "#B06068"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockDefaultOptionsOnline"
            }
        }
    ],
    "offline": [{
            "id": "1",
            "name": "All Contact",
            "term": "menu_list",
            "img": "images/act_arrows.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "none",
                        "foreground": "#4F4F4F"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList"
            }
        },
        {
            "id": "2",
            "name": "Queued",
            "term": "",
            "img": "images/sync-pending_36.svg",
            "style": {
                "icon": {
                    "colors": {
                        "background": "none",
                        "foreground": "#008234"
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList",
                "options": {
                    "filter": [{
                        "status": "queued"
                    }]
                }
            }
        },
        {
            "id": "3",
            "name": "Completed",
            "term": "",
            "img": "images/sync.svg",
            "target": {
                "actionType": "openBlock",
                "blockId": "blockRedeemList",
                "options": {
                    "filter": [{
                        "status": "submit"
                    }]
                }
            }
        },
        {
            "id": "4",
            "name": "Entry (On + Off)",
            "term": "menu_entry",
            "img": "images/act_col.svg",
            "style": {
                "icon": {
                    "colors": { 
                        "background": "none", 
                        "foreground": "#19DD89" 
                    }
                }
            },
            "target": {
                "actionType": "openBlock",
                "startBlockName": "blockDefaultOptionsOffline",
                "blockId": "blockDefaultOptionsOffline"
            }
        }
    ]
    },

    "themes":[  
        {  
           "id":"default",
           "name":"default",
           "spec":{  
              "navTop":{  
                 "colors":{  
                    "background":"#ffc61d",
                    "foreground":"#101010"
                 }
              },
              "navMiddle":{  
                 "colors":{  
                    "background":"#ffda6d",
                    "foreground":"#50555a"
                 }
              },
              "button":{  
                 "colors":{  
                    "background":"#ffc61d",
                    "foreground":"#333333"
                 }
              }
           }
        },
        {  
           "id":"opule",
           "name":"opule",
           "spec":{  
              "navTop":{  
                 "colors":{  
                    "background":"#00ACC1",
                    "foreground":"#ffffff"
                 }
              },
              "navMiddle":{  
                 "colors":{  
                    "background":"#0093A3",
                    "foreground":"#333333"
                 }
              },
              "button":{  
                 "colors":{  
                    "background":"#0093A3",
                    "foreground":"#ffffff"
                 }
              }
           }
        },
        {  
           "id":"ocean",
           "name":"ocean",
           "spec":{  
              "navTop":{  
                 "colors":{  
                    "background":"#8DC9F7",
                    "foreground":"#E5EBEB"
                 }
              },
              "navMiddle":{  
                 "colors":{  
                    "background":"#059ADC",
                    "foreground":"#FFFFFF"
                 }
              },
              "button":{  
                 "colors":{  
                    "background":"#059ADC",
                    "foreground":"#F8FAF5"
                 }
              }
           }
        }
     ]    
};

ConfigManager.default_SettingPaging = { 
    "enabled": true,
    "pagingSize": 9 
};
// 'pagingSize': ( $( '#pageDiv' ).height() / 90 ) --> 90 = standard height for 1 activityCard


// ==== Methods ======================

ConfigManager.setConfigJson = function ( configJson ) 
{
    try
    {
        if ( configJson )
        {
            ConfigManager.configJson_Original = configJson; 
    
            ConfigManager.configJson = Util.getJsonDeepCopy( ConfigManager.configJson_Original );
        
            ConfigManager.applyDefaults( ConfigManager.configJson, ConfigManager.defaultJsonList );

            ConfigManager.login_UserRoles = ConfigManager.getLogin_UserRoles( ConfigManager.configJson.definitionUserRoles, SessionManager.sessionData.orgUnitData );
        }    
    }
    catch ( errMsg )
    {
        console.customLog( 'Error in ConfigManager.setConfigJson, errMsg: ' + errMsg );
    }
};

// NOTE: We can override any config setting by modifying 'ConfigManager.configJson' in console.


ConfigManager.resetConfigJson = function () 
{
    ConfigManager.setConfigJson( ConfigManager.configJson_Original );
};

ConfigManager.clearConfigJson = function () 
{
    ConfigManager.configJson = {};
    //ConfigManager.configSetting = {};
};

// ------------------------------------
// --- 'Get' related methods

ConfigManager.getConfigJson = function () 
{
    return ConfigManager.configJson;
};  

ConfigManager.getAreaListByStatus = function( bOnline, callBack )
{
    var configJson = ConfigManager.getConfigJson();
    
    var compareList = (bOnline) ? configJson.areas.online : configJson.areas.offline;
    var retAreaList = [];

    for ( var i = 0; i < compareList.length; i++) 
    {
        if ( compareList[i].userRoles) 
        {
            for ( var p = 0; p < compareList[i].userRoles.length; p++) 
            {
                if ( ConfigManager.login_UserRoles.includes(compareList[i].userRoles[p]) ) 
                {
                    retAreaList.push(compareList[i]);
                    break;
                }
            }
        } 
        else {
            retAreaList.push(compareList[i]);
        }
    }

    if ( callBack ) callBack( retAreaList );
};


ConfigManager.getLogin_UserRoles = function( defUserRoles, sessionOrgUnitData )
{
    var userRoles = [];

    try
    {
        // login orgUnit groups list..
        var ouGroups = sessionOrgUnitData.orgUnit.organisationUnitGroups;

        if ( defUserRoles && ouGroups )
        {
            for ( var r=0; r < ouGroups.length; r++ )
            {
                for ( var i=0; i< defUserRoles.length; i++ )
                {
                    // config role definition uid is dhis2 id
                    if ( defUserRoles[ i ].uid == ouGroups[ r ].id )
                    {
                        userRoles.push( defUserRoles[ i ].id );
                    }
                }
            }
        }
    }
    catch( errMsg )
    {
        console.customLog( 'ERROR in ConfigManager.setLogin_UserRoles, errMsg: ' + errMsg );
    }

    return userRoles;
};


ConfigManager.getAllAreaList = function()
{
    var combinedAreaList = [];

    return combinedAreaList.concat( ConfigManager.configJson.areas.online, ConfigManager.configJson.areas.offline );
};

// ----------------------------------------
        
ConfigManager.getSettingPaging = function()
{
    var pagingSetting = ConfigManager.default_SettingPaging

    var configJson = ConfigManager.getConfigJson();

    if ( configJson && configJson.settings && configJson.settings.paging )
    {
        Util.mergeJson( pagingSetting, configJson.settings.paging );
    }
    
    return pagingSetting;
};


ConfigManager.getActivityDisplaySettings = function()
{
    var configJson = ConfigManager.getConfigJson();

    var displaySettings = [  
      ConfigManager.defaultActivityDisplaySettings 
    ];

    // `'<b><i>' + INFO.processing.created + '</i></b>'`;
    // "'<b><i>' + activityItem.created + '</i></b>'"

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
        console.customLog( 'Error in ConfigManager.getActivityDisplaySettings, errMsg: ' + errMsg );
    }


    return displaySettings;
};


ConfigManager.getActivityDisplayBase = function()
{
    var configJson = ConfigManager.getConfigJson();

    var displayBase = ConfigManager.defaultActivityDisplayBase;

    try
    {
        if ( configJson.settings 
            && configJson.settings.redeemDefs
            && configJson.settings.redeemDefs.displayBase )
        {
            displayBase = configJson.settings.redeemDefs.displayBase;
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error in ConfigManager.getActivityDisplayBase, errMsg: ' + errMsg );
    }

    return displayBase;
};

ConfigManager.getActivitySyncUpStatusConfig = function( activityJson )
{
    var activityStatusConfig;
    var configJson = ConfigManager.getConfigJson();

	try
	{        
        if ( activityJson.processing )
        {
            activityStatusConfig = Util.getFromList( configJson.settings.redeemDefs.statusOptions, activityJson.processing.status, 'name' );
        }
	}
	catch ( errMsg )
	{
		console.customLog( 'Error on ConfigManager.getActivitySyncUpStatusConfig, errMsg: ' + errMsg );
    }
    
    return activityStatusConfig;
};


ConfigManager.getActivityTypeConfig = function( activityJson )
{
	var activityTypeConfig;
    var configJson = ConfigManager.getConfigJson();

    try
	{
        activityTypeConfig = Util.getFromList( configJson.settings.redeemDefs.activityTypes, activityJson.type, 'name' );
	}
	catch ( errMsg )
	{
		console.customLog( 'Error on ConfigManager.getActivityTypeConfig, errMsg: ' + errMsg );
    }

    //console.customLog( activityJson.type, activityTypeConfig );
    if ( !activityTypeConfig ) activityTypeConfig = ConfigManager.defaultActivityType;

    return activityTypeConfig;
};


ConfigManager.getSyncMergeDatePaths = function()
{
   var configJson = ConfigManager.getConfigJson();

   return configJson.settings.sync.mergeCompare.dateCompareField; // var pathArr = 
};


ConfigManager.getSyncDownSetting = function()
{
   return ConfigManager.getConfigJson().settings.sync.syncDown;
};


// ---------------------------------------------
// ---- Statistic Related --------------------

/*
ConfigManager.getStatisticJson = function()
{
    var configJson = ConfigManager.getConfigJson();
    
    return ( configJson.settings && configJson.settings.statistic ) ? configJson.settings.statistic : {};
};
*/

ConfigManager.getStatisticJson = function()
{
    var configJson = ConfigManager.getConfigJson();
    var login_UserRoles = ConfigManager.login_UserRoles;

    var statisticJson = {};

    if ( configJson.settings )
    {
        if ( configJson.settings.statistics )
        {
            var selectedRoleArrCount = 0;

            // userRole based statistic info..
            for ( var i = 0; i < configJson.settings.statistics.length; i++ )
            {
                var statJson = configJson.settings.statistics[i];

                var statRoleArr = statJson.userRoles;

                // If 'userRoles' is not defined or empty, assign as the base/default selection
                if ( !statRoleArr || statRoleArr.length === 0 )
                {
                    selectedRoleArrCount = 0;
                    statisticJson = statJson;
                }
                else
                {
                    var checkRoleArrCount = statRoleArr.length;

                    if ( checkRoleArrCount > selectedRoleArrCount
                        && ConfigManager.hasAllRoles( statRoleArr, login_UserRoles ) )
                    {
                        statisticJson = statJson;
                        selectedRoleArrCount = checkRoleArrCount;
                    }
                }
            }
        }
        else if ( configJson.settings.statistic )
        {
            statisticJson = configJson.settings.statistic;
        }
    }

    //console.customLog( 'statisticJson Used: ' + JSON.stringify( statisticJson ) );

    return statisticJson;
};


ConfigManager.hasAllRoles = function( configRoleIds, login_UserRoles )
{
    var hasAllConfigRoles = true;

    for ( var p = 0; p < configRoleIds.length; p++ )
    {
        var roleId = configRoleIds[p];
        
        if ( login_UserRoles.indexOf( roleId ) < 0 ) //!ConfigManager.checkRoleIdInUserRoles( roleId, login_UserRoles ) )
        {
            hasAllConfigRoles = false;
            break;
        }
    }

    return hasAllConfigRoles;
};


// NOT USED:
//  userRoles are object array...  
ConfigManager.checkRoleIdInUserRoles = function( roleId, login_UserRoles )
{
    var inList = false;

    for ( var p = 0; p < login_UserRoles.length; p++ )
    {
        var userRoleDef = login_UserRoles[p];

        //if ( userRoleDef.id === roleId )
        if ( userRoleDef === roleId )
        {
            inList = true;
            break;
        }
    }

    return inList;
};


ConfigManager.getStatisticApiPath = function()
{
    var statisticJson = ConfigManager.getStatisticJson();

    var urlPath = ( statisticJson.url ) ? statisticJson.url : '/PWA.statistic';
    var fileName = ( statisticJson.fileName ) ? statisticJson.fileName : ''; // DWS Endpoint has default value..'dc_pwa@LA@stat1.html';

    return urlPath + '?stage=' + WsCallManager.stageName + '&fileName=' + fileName;
};


// ------------------------------------------------------
// -- Apply Defaults related methods.

ConfigManager.applyDefaults = function( configJson, defaults )
{
   ConfigManager.applyDefault_syncDown( configJson, defaults.syncDown );

   ConfigManager.applyDefault_mergeCompare( configJson, defaults.mergeCompare );

   // Other defaults could be placed here..
   ConfigManager.applyDefault_favList( configJson, defaults.favList );

   ConfigManager.applyDefault_themes( configJson, defaults.themes );

};

ConfigManager.applyDefault_syncDown = function( configJson, syncDownJson )
{
   if ( syncDownJson )
   {
      // 1. Check if 'configJson' has the content in path.
      //    If not exists, set the 'content' of json..
      if ( !configJson.settings ) configJson.settings = {};
      if ( !configJson.settings.sync ) configJson.settings.sync = {};

      if ( !configJson.settings.sync.syncDown ) configJson.settings.sync.syncDown = Util.getJsonDeepCopy( syncDownJson.content );
   }
};


// TODO: Change to 'mergeCompare'
ConfigManager.applyDefault_mergeCompare = function( configJson, mregeCompareJson )
{
   if ( mregeCompareJson )
   {
      // 1. Check if 'configJson' has the content in path.
      //    If not exists, set the 'content' of json..
      if ( !configJson.settings ) configJson.settings = {};
      if ( !configJson.settings.sync ) configJson.settings.sync = {};

      if ( !configJson.settings.sync.mregeCompare ) configJson.settings.sync.mregeCompare = Util.getJsonDeepCopy( mregeCompareJson.content );
   }
};


ConfigManager.applyDefault_favList = function( configJson, favListJson )
{
   if ( favListJson )
   {
      if ( !configJson.favList ) configJson.favList = Util.getJsonDeepCopy( favListJson );
   }
};


ConfigManager.applyDefault_themes = function( configJson, themesJsonArr )
{
   if ( themesJsonArr )
   {
      if ( !configJson.themes ) configJson.themes = themesJsonArr;
   }
};

// ========================================================


// ==================================================


// THIS SHOULD BE OVERWRITTEN BY page ones...

ConfigManager.periodSelectorOptions = {
    "all": {
        "name": "All periods",
        "term": "",
        "from": "",
        "to": "",
        "enabled": "true",
        "defaultOption": "true"
    },
    "thisWeek": {
        "name": "this Week",
        "term": "",
        "from": "Util.dateAddStr( 'DATE', -( new Date().getDay() ) );",
        "to": "Util.dateAddStr( 'DATE', -( new Date().getDay() ) + 6 );",
        "enabled": "true",
        "note": "week starts on Saturday?"
    },
    "lastWeek": {
        "name": "last Week",
        "term": "",
        "from": "Util.dateAddStr( 'DATE', -( new Date().getDay() ) - 7 );",
        "to": "Util.dateAddStr( 'DATE', -( new Date().getDay() ) - 1 );",
        "enabled": "true"
    },
    "thisMonth": {
        "name": "this Month",
        "term": "",
        "from": "Util.dateStr( 'DATE', new Date( new Date().getFullYear(), new Date().getMonth(), 2 ) );",
        "to": "Util.dateStr( 'DATE', new Date( new Date().getFullYear(), new Date().getMonth() + 1, 1 ) );",
        "enabled": "true",
        "note": "month range is from 2nd of month to 1st of next month?"
    },
    "lastMonth": {
        "name": "last Month",
        "term": "",
        "from": "Util.dateStr( 'DATE', new Date( new Date().getFullYear(), new Date().getMonth() - 1, 2 ) );",
        "to": "Util.dateStr( 'DATE', new Date( new Date().getFullYear(), new Date().getMonth(), 1 ) );",
        "enabled": "true"
    },
    "thisYear": {
        "name": "this Year",
        "term": "",
        "from": "Util.dateStr( 'DATE', new Date( new Date().getFullYear(), 0, 2 ) );",
        "to": "Util.dateStr( 'DATE', new Date( new Date().getFullYear() + 1, 0, 1 ) );",
        "enabled": "true"
    },
    "customRange": {
        "name": "custom range",
        "term": "",
        "from": "'custom'",
        "to": "'custom'",
        "enabled": "true"
    }
};


ConfigManager.periodSelectorOptions_Back = {

    "today": {
        "name": "today",
        "term": "",
        "from": "Util.dateStr( 'DATE' );",
        "to": "Util.dateStr( 'DATE' );",
        "enabled": "false"
    },
    "24hours": {
        "name": "last 24 hours",
        "term": "",
        "from": "Util.dateAddStr( 'DATETIME', -1 );",
        "to": "Util.dateStr( 'DATETIME' );",
        "enabled": "false"
    },
    "last3Days": {
        "name": "last 3 Days",
        "term": "",
        "from": "Util.dateAddStr( 'DATE', -2 );",
        "to": "Util.dateStr( 'DATE' );",
        "enabled": "false"
    },
    "last7Days": {
        "name": "last 7 Days",
        "term": "",
        "from": "Util.dateAddStr( 'DATE', -6 );",
        "to": "Util.dateStr( 'DATE' );",
        "enabled": "false"
    },

    "thisPaymentPeriod": {
        "name": "this Payment Period",
        "term": "",
        "from": "new Date(new Date().getFullYear(), new Date().getMonth() - 1, 22).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), new Date().getMonth(), 21).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "lastPaymentPeriod": {
        "name": "last Payment Period",
        "term": "",
        "from": "new Date(new Date().getFullYear(), new Date().getMonth() - 2, 22).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), new Date().getMonth() - 1, 21).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "thisQuarter": {
        "name": "this Quarter",
        "term": "",
        "from": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3 + 3, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "lastQuarter": {
        "name": "last Quarter",
        "term": "",
        "from": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3 - 3, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "last3Months": {
        "name": "last 3 Months",
        "term": "",
        "from": "new Date(new Date().getFullYear(), new Date().getMonth() - 2, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "last6Months": {
        "name": "last 6 Months",
        "term": "",
        "from": "new Date(new Date().getFullYear(), new Date().getMonth() - 5, 2).toISOString().split( 'T' )[ 0 ]",
        "to": "new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split( 'T' )[ 0 ]",
        "enabled": "false"
    },
    "lastYear": {
        "name": "last Year",
        "term": "",
        "from": "Util.dateStr( 'DATE', new Date( new Date().getFullYear() - 1, 0, 2 ) );",
        "to": "Util.dateStr( 'DATE', new Date( new Date().getFullYear(), 0, 1 ) );",
        "enabled": "false"
    }
};