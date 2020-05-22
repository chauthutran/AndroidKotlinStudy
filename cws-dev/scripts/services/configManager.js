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


ConfigManager.defaultActivityDisplaySettings = `'<b><i>' + INFO.activity.processing.created + '</i></b>'`;

// configJson[sync][syncUp]

// -- Default Configs -----
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
   }
};

ConfigManager.default_SettingPaging = { 
    "enabled": false,
    "pagingSize": 8   // "paging": { "enabled": true, "pagingSize": 5 }, 
};


ConfigManager.statisticConfig = { 
    "statsPageContent": [
        "<div id='statsContent'>",
        "  <div class='statDiv' statId='byYearTable'></div>",
        "  <div class='statDiv' statId='periodTotal'></div>",
        "  <div class='statDiv' statId='allTotal'></div>",
        "</div>"
    ],
    "statsList": {
        "byYearTable": {
            "periodType": "relational",
            "runDataEval": [
                " var cf = crossfilter([ ",
                "    { Country: 'Brazil', Year: 1986, DMFT: 6.7 }, ",
                "    { Country: 'Brazil', Year: 1994, DMFT: 4.9 }, ",
                "    { Country: 'Canada', Year: 1974, DMFT: 4.4 } ",
                " ]); ",

                " var cf_year = cf.dimension( function(d) { return d.Year; } ); ",
            
                " INFO.toTable( INFO.statChartTag, cf_year.filterRange( [ INFO.startPeriod, INFO.endPeriod ] ).top( Infinity ) ); "
            ],
            "divContent": [
                "<div>---Table---</div>",
                "<div>",
                " displaying table content: <br>",
                " <div class='statChart'></div>",
                "</div>"
            ]
        },
        "allTotal": {
            "periodType": "static",
            "runDataEval": [
                " var cf = crossfilter([ ",
                "    { Country: 'Brazil', Year: 1986, DMFT: 6.7 }, ",
                "    { Country: 'Brazil', Year: 1994, DMFT: 4.9 }, ",
                "    { Country: 'Canada', Year: 1974, DMFT: 4.4 } ",
                " ]); ",

                " var cf_year = cf.dimension( function(d) { return d.Year; } ); ",
            
                " INFO.statChartTag.html( cf_year.groupAll().reduceSum( function(d) { return d.DMFT; } ).value() ); "
            ],
            "divContent": [
                "<div>------</div>",
                "<div>All Year Total: <div class='statChart'></div>",
                "</div>"
            ]

        },
        "periodTotal": {
            "periodType": "relational",
            "runDataEval": [
                " var cf = crossfilter([ ",
                "    { Country: 'Brazil', Year: 1986, DMFT: 6.7 }, ",
                "    { Country: 'Brazil', Year: 1994, DMFT: 4.9 }, ",
                "    { Country: 'Canada', Year: 1974, DMFT: 4.4 } ",
                " ]); ",

                " var cf_year = cf.dimension( function(d) { return d.Year; } ); ",
            
                " var filtered = cf_year.filterRange( [ INFO.startPeriod, INFO.endPeriod ] ); ",

                " INFO.statChartTag.html( INFO.getListSum( filtered.top( Infinity ), 'DMFT' ) ); ",

                " /* filtered.groupAll().reduceSum( function(d) { return d.DMFT; } ).value() */"
            ],
            "divContent": [
                "<div>------</div>",
                "<div>Period Total: <div class='statChart'></div>",
                "</div>"
            ]

        }
    },
    "chartMethods": [
        " INFO.toTable = function( tableTag, json ) { ",
        "    var html = ''; ",

        "    json.forEach(function(row) { ",
        "        html += '<tr>'; ",
        "        var dataStr = ''; ",
        
        "        for ( key in row ) { ",
        "              html += '<td>' + row[key] + '</td>'; ",
        
        "              dataStr += row[key] + ', '; ",
        "        }; ",
        
        "        console.log( dataStr ); ",
        "        html += '</tr>'; ",
        "    }); ",
        
        "    tableTag.html( '<table>' + html + '</table>' ); ",
        " }; ",

        " INFO.getListSum = function( list, prop ) { ",
        "    var total = 0; ",
        "    list.forEach(function(item) { ",
        "       if ( item[prop] ) total += Number( item[prop] ); ",
        "    }); ",
        "    return total; ",
        " }; "
    ]
};


//   " toTable( INFO.divStatChartTag, cf_year.filterRange( [ INFO.startPeriod, INFO.endPeriod ] ).top( Infinity ) ); "


// ==== Methods ======================

ConfigManager.setConfigJson = function ( configJson ) 
{
    ConfigManager.configJson_Original = configJson; 

    ConfigManager.configJson = Util.getJsonDeepCopy( ConfigManager.configJson_Original );

    ConfigManager.applyDefaults( ConfigManager.configJson, ConfigManager.defaultJsonList );
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

// ----------------------------------------
        
ConfigManager.getSettingPaging = function()
{
    var pagingSetting;

    var configJson = ConfigManager.getConfigJson();

    if ( configJson && configJson.settings && configJson.settings.paging )
    {
        pagingSetting = configJson.settings.paging;
    }
    else
    {
        pagingSetting = ConfigManager.default_SettingPaging;
    }
    
    return pagingSetting;
}

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
        console.log( 'Error in ConfigManager.getActivityDisplaySettings, errMsg: ' + errMsg );
    }


    return displaySettings;
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
		console.log( 'Error on ConfigManager.getActivitySyncUpStatusConfig, errMsg: ' + errMsg );
    }
    
    return activityStatusConfig;
};


ConfigManager.getActivityTypeConfig = function( activityJson )
{
	var activityTypeConfig;
   var configJson = ConfigManager.getConfigJson();

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


ConfigManager.getSyncMergeDatePaths = function()
{
   var configJson = ConfigManager.getConfigJson();

   return configJson.settings.sync.mergeCompare.dateCompareField; // var pathArr = 
};


ConfigManager.getSyncDownSetting = function()
{
   return ConfigManager.getConfigJson().settings.sync.syncDown;
};


// ------------------------------------------------------
// -- Apply Defaults related methods.

ConfigManager.applyDefaults = function( configJson, defaults )
{
   ConfigManager.applyDefault_syncDown( configJson, defaults.syncDown );

   ConfigManager.applyDefault_mergeCompare( configJson, defaults.mergeCompare )

   // Other defaults could be placed here..

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
// ========================================================


// ==================================================


/*
ConfigManager.applyDefaultJson = function( configJson )
{
   // TODO: later, we might want to create a single list for this?

   // Check for 
   for ( var i = 0; i < ConfigManager.defaultJsonList.length; i++ )
   {
      var defaultJson = ConfigManager.defaultJsonList[ i ];

      var targetLoc = configJson;
      var resultStr = '';


      // check if 'configJson' has this part.  If not, put it there.. (hard copy?)
      for ( var x = 0; x < defaultJson.pathList.length; x++ )
      {
         var pathName = defaultJson.pathList[x];
         var targetLoc = targetLoc[ pathName ];

         var lastPath = ( defaultJson.pathList.length === ( x + 1 ) );
         
         // The pathList follow not found/worked in downloaded 'configJson'.  Can
         if ( !targetLoc )
         {
            if ( lastPath ) resultStr = 'TargetNull';
            else resultStr = 'TargetReachFailed';

            break;
         }
         else
         {
            if ( lastPath ) resultStr = 'TargetExists';
         }
      }


      if ( resultStr === 'TargetNull' )
      {

      }
   }
}; 

*/