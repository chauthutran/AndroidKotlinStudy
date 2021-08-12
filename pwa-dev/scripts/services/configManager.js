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

ConfigManager.defaultClientDisplayBase = `'<b>' + INFO.client.clientDetails.firstName + ' ' + INFO.client.clientDetails.lastName + ' - ' + INFO.client.clientDetails.age + '</b>'`;
ConfigManager.defaultClientDisplaySettings = `'<i>' + INFO.client._id + '</i>'`;

ConfigManager.defaultClientRelDisplayBase = `'<b>' + INFO.relationship.client.clientDetails.firstName + ' ' + INFO.relationship.client.clientDetails.lastName + ' - ' + INFO.relationship.client.clientDetails.age + '</b>'`;
ConfigManager.defaultClientRelDisplaySettings = `INFO.relationship.type + ', ' + Util.formatDate( INFO.relationship.date, 'MMM dd, yyyy - HH:mm' )`;

ConfigManager.defaultActivityDisplayBase = `Util.formatDate( INFO.activity.processing.created, 'MMM dd, yyyy - HH:mm' );`;
ConfigManager.defaultActivityDisplaySettings = `'<i>' + INFO.activity.id + '</i>'`;

ConfigManager.coolDownTime = '90000'; // 90 seconds - default.  Could be updated by country config setting

// -- Temp placeholder for some setting data..
ConfigManager.staticData = { 
    soundEffects: false //Util.isMobi()
    , autoComplete: true
    , logoutDelay: 30 // WAS 60 min, change to 30
};

ConfigManager.default_SettingPaging = { 
    "enabled": true,
    "pagingSize": 9 
};

ConfigManager.KEY_SourceType_Mongo = 'mongo';
ConfigManager.KEY_SourceType_Dhis2 = 'dhis2';

// ==== Methods ======================

// ---------------------------------
// --- Initial Set (called from session?)

ConfigManager.setConfigJson = function ( configJson, userRolesOverrides ) 
{
    try
    {
        if ( configJson )
        {
            ConfigManager.configJson_Original = configJson; 
    
            ConfigManager.configJson = Util.cloneJson( ConfigManager.configJson_Original );
        
            ConfigManager.applyDefaults( ConfigManager.configJson, ConfigManager.defaultJsonList );

            ConfigManager.login_UserRoles = ConfigManager.setUpLogin_UserRoles( ConfigManager.configJson.definitionUserRoles, SessionManager.sessionData.orgUnitData, userRolesOverrides );

            // If 'sourceType_userRole' exists, override 'sourceType' by userRole
            ConfigManager.setSourceType_ByUserRole( ConfigManager.configJson, ConfigManager.login_UserRoles );

            // Filter some list in config by 'sourceType' / 'userRole'
            ConfigManager.applyFilter_SourceType( ConfigManager.configJson );
            ConfigManager.applyFilter_UserRole( ConfigManager.configJson
                , [ 'favList', 'areas', 'definitionOptions', 'settings.sync.syncDown' ]
                , ConfigManager.login_UserRoles );

            ConfigManager.coolDownTime = ConfigManager.getSyncUpCoolDownTime();
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error in ConfigManager.setConfigJson, errMsg: ' + errMsg );
    }
};


// ----------------------------------------------------

ConfigManager.setSourceType_ByUserRole = function( configJson, login_UserRoles )
{
    var itemList = configJson.sourceType_UserRole;

    if ( itemList && login_UserRoles )
    {
        // Ex. "sourceType_UserRole": [ { "type": "dhis2", "userRoles": ["dhis2"] }, { "type": "mongo", "userRoles": ["mongo"] } ],
        if ( Util.isTypeArray( itemList ) && itemList.length > 0 && login_UserRoles.length > 0 )
        {
            var filteredList = ConfigManager.filterListByUserRoles( itemList, false, login_UserRoles );
            
            if ( filteredList.length > 0 )
            {
                var lastListType = filteredList[ filteredList.length - 1 ].type;
                if ( lastListType ) {
                    configJson.sourceType = lastListType;
                    console.log( 'sourceType set by userRole.  sourceType: ' + lastListType );
                }
            }
        }
    }
};

// ----------------------------------------------------

ConfigManager.applyFilter_SourceType = function( configJson )
{
    try
    {
        // For now, just one item that does filter by soruceType..
        ConfigManager.filterBySourceType_SyncDownList( configJson );        
    }
    catch( errMsg )
    {
        console.customLog( 'ERROR in ConfigManager.applyFilter_SourceType, errMsg: ' + errMsg );
    }   
};

// Adjust/Filter by userRole <--  definitionOptionList, areaList, favList
ConfigManager.applyFilter_UserRole = function( configJson, arrList, loginUserRoles )
{
    try
    {
        if ( arrList && loginUserRoles )
        {
            arrList.forEach( defName => 
            { 
                try
                {
                    var defList;

                    if ( defName === 'settings.sync.syncDown' ) defList = configJson.settings.sync.syncDown;
                    else defList = configJson[ defName ];

                    // If Object, look for arrayList in one level below..
                    if ( Util.isTypeArray( defList ) )
                    {
                        // Type1. list: [ { .. userRoles[ ipc ] }, {} ]
                        ConfigManager.filterListByUserRoles( defList, true, loginUserRoles );
                    }
                    else if ( Util.isTypeObject( defList ) )
                    {
                        Object.keys( defList ).forEach( key => 
                        {
                            var itemObj = defList[key];

                            if ( Util.isTypeArray( itemObj ) )
                            {
                                // Type2. obj: { item: [ { .. userRoles[ ipc ] }, {} ], [...], .. }
                                ConfigManager.filterListByUserRoles( itemObj, true, loginUserRoles );
                            }
                            else if ( Util.isTypeObject( itemObj ) )
                            {
                                // Type3. obj: { { .. userRoles[ ipc ] }, {} }
                                defList[key] = ConfigManager.filterObjsByUserRoles( itemObj, loginUserRoles );
                            }
                        });
                    }
                }
                catch( errMsg )
                {
                    console.customLog( 'ERROR in ConfigManager.applyFilter_UserRole defName: ' + defName + ', errMsg: ' + errMsg );
                }               
            });
        }
    }
    catch( errMsg )
    {
        console.customLog( 'ERROR in ConfigManager.applyFilter_UserRole, errMsg: ' + errMsg );
    }   
};

// ---------------------------------
// --- reset / clear configJson

ConfigManager.resetConfigJson = function( userRolesOverrides ) 
{
    ConfigManager.setConfigJson( ConfigManager.configJson_Original, userRolesOverrides );
};

ConfigManager.clearConfigJson = function() 
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
    var areaList = ( bOnline ) ? configJson.areas.online : configJson.areas.offline;

    if ( callBack ) callBack( Util.cloneJson( areaList ) );
};

// Use this to define the login_userRoles array list.
ConfigManager.setUpLogin_UserRoles = function( defUserRoles, sessionOrgUnitData, userRolesOverrides )
{
    var userRoles = [];

    if ( userRolesOverrides ) userRoles = userRolesOverrides;
    else
    {
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
    }

    return userRoles;
};


ConfigManager.getAllAreaList = function()
{
    var combinedAreaList = [];

    return combinedAreaList.concat( ConfigManager.configJson.areas.online, ConfigManager.configJson.areas.offline );
};


ConfigManager.isSourceTypeDhis2 = function()
{
    return ( ConfigManager.getConfigJson().sourceType === ConfigManager.KEY_SourceType_Dhis2 );
};

// ----------------------------------------


ConfigManager.filterList_ByCountryFilter = function( list )
{
    var filteredList = [];

    try
    {
        if ( list && Util.isTypeArray( list ) )
        {
            list.forEach( item => 
            {
                if ( ConfigManager.checkByCountryFilter( item.countryFilter ) ) filteredList.push( item );
            });
        }
    }
    catch ( errMsg ) { console.log( 'ERROR in ConfigManager.filterList_ByCountryFilter, errMsg: ' + errMsg ); }

    return filteredList;
};


ConfigManager.checkByCountryFilter = function( countryFilterArr )
{
    var bPass = false;

    try
    {
        if ( !countryFilterArr ) bPass = true;
        else
        {
            if ( Util.isTypeArray( countryFilterArr ) )
            {
                for ( var i = 0; i < countryFilterArr.length; i++ )
                {
                    var countryCode = countryFilterArr[i];
    
                    if ( SessionManager.checkLoginCountryOuCode( countryCode ) )
                    {
                        bPass = true;
                        break;
                    }
                }
            }
        }    
    }
    catch ( errMsg ) { console.log( 'ERROR in ConfigManager.checkByCountryFilter, errMsg: ' + errMsg ); }

    return bPass;
};

// ----------------------------------------

ConfigManager.getVoucherCodeReuse = function()
{
    return ( ConfigManager.getConfigJson().voucherCodeReuse === true );
};


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

ConfigManager.getSettingsTermId = function( termName )
{
    var termId = '';

    var configJson = ConfigManager.getConfigJson();

    if ( configJson && configJson.settings && configJson.settings.terms )
    {
        var termIdTemp = configJson.settings.terms[ termName ];
        if ( termIdTemp ) termId = termIdTemp;
    }

    return termId;
};


ConfigManager.getActivityDisplaySettings = function()
{
    var configJson = ConfigManager.getConfigJson();

    var displaySettings = [  
      ConfigManager.defaultActivityDisplaySettings 
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

// ---------------------------------------------

ConfigManager.getClientDisplayBase = function()
{
    var configJson = ConfigManager.getConfigJson();

    var displayBase = ConfigManager.defaultClientDisplayBase;

    try
    {
        if ( configJson.settings 
            && configJson.settings.clientCardDef
            && configJson.settings.clientCardDef.displayBase )
        {
            displayBase = configJson.settings.clientCardDef.displayBase;
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error in ConfigManager.getClientDisplayBase, errMsg: ' + errMsg );
    }

    return displayBase;
};


ConfigManager.getClientDisplaySettings = function()
{
    var configJson = ConfigManager.getConfigJson();

    var displaySettings = [  
      ConfigManager.defaultClientDisplaySettings 
    ];

    try
    {
        if ( configJson.settings 
            && configJson.settings.clientCardDef
            && configJson.settings.clientCardDef.displaySettings )
        {
            displaySettings = configJson.settings.clientCardDef.displaySettings;
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error in ConfigManager.getClientDisplaySettings, errMsg: ' + errMsg );
    }

    return displaySettings;
};


ConfigManager.getClientRelDisplayBase = function()
{
    var configJson = ConfigManager.getConfigJson();
    var displayBase = ConfigManager.defaultClientRelDisplayBase;

    try
    {
        if ( configJson.settings 
            && configJson.settings.clientRelCardDef
            && configJson.settings.clientRelCardDef.displayBase )
        {
            displayBase = configJson.settings.clientRelCardDef.displayBase;
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error in ConfigManager.getClientRelDisplayBase, errMsg: ' + errMsg );
    }

    return displayBase;
};


ConfigManager.getClientRelDisplaySettings = function()
{
    var configJson = ConfigManager.getConfigJson();
    var displaySettings = [  
      ConfigManager.defaultClientRelDisplaySettings 
    ];

    try
    {
        if ( configJson.settings 
            && configJson.settings.clientRelCardDef
            && configJson.settings.clientRelCardDef.displaySettings )
        {
            displaySettings = configJson.settings.clientRelCardDef.displaySettings;
        }
    }
    catch ( errMsg )
    {
        console.customLog( 'Error in ConfigManager.getClientRelDisplaySettings, errMsg: ' + errMsg );
    }

    return displaySettings;
};

// ---------------------------------------------

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


ConfigManager.filterBySourceType_SyncDownList = function( configJson )
{
    try
    {
        var syncDownList = configJson.settings.sync.syncDown;

        if ( syncDownList )
        {
            // 1. filter by 'sourceType'.. if list has sourceType
            if ( configJson.sourceType )
            {
                var syncDownList_New = [];

                syncDownList.forEach( item => {
                    if ( !item.sourceType || item.sourceType === configJson.sourceType ) syncDownList_New.push( item );
                });

                // Change the original list (while keeping the reference)
                Util.arrayReplaceData( syncDownList, syncDownList_New );
            }        
        }    
    }
    catch ( errMsg )
    {
        console.customLog( 'ERROR on ConfigManager.filterBySourceType_SyncDownList, errMsg: ' + errMsg );
    }
};


// -----------  Sync Related ------------

ConfigManager.getSettingNetworkSync = function()
{
    var networkSync = '' + Util.MS_HR;  // 1 hour

    try
    {
        var schedulerTime = ConfigManager.getConfigJson().settings.sync.syncUp.schedulerTime;
		networkSync = UtilDate.getTimeMs( schedulerTime, networkSync );
    }
    catch ( errMsg )
    {
        console.customLog( 'ERROR in ConfigManager.getSettingNetworkSync, errMsg: ' + errMsg );
    }

    //return ConfigManager.getConfigJson().settings.sync.networkSync;
    return networkSync;
};


ConfigManager.getSyncDownSetting = function()
{
    var syncDownList = ConfigManager.getConfigJson().settings.sync.syncDown;

    // get 1st item from the list.  Empty list returns emtpy object.
    var syncDownJson = ( syncDownList.length > 0 ) ? syncDownList[0] : {};

    return syncDownJson;
};

// Called from 'syncManagerNew' 
ConfigManager.getSyncDownSearchBodyEvaluated = function()
{
    var searchBodyJson;

    var searchBodyEval = ConfigManager.getSyncDownSetting().searchBodyEval;

    if ( searchBodyEval )
    {
        searchBodyJson = Util.cloneJson( searchBodyEval );

        Util.traverseEval( searchBodyJson, InfoDataManager.getINFO(), 0, 50 );
    }

    return searchBodyJson;
};


ConfigManager.getMockResponseJson = function( useMockResponse )
{
    var mockResponseJson;

    if ( useMockResponse )
    {
        var mockResponses = ConfigManager.getConfigJson().definitionMockResponses;

        if ( mockResponses ) mockResponseJson = mockResponses[ useMockResponse ];
    }

    return mockResponseJson;
};


ConfigManager.getSyncUpCoolDownTime = function()
{
    var coolDownTime;
    
    try
    {
        var coolDownTimeStr = ConfigManager.getConfigJson().settings.sync.syncUp.coolDownTime;
		coolDownTime = UtilDate.getTimeMs( coolDownTimeStr, coolDownTime );
    }
    catch ( errMsg )
    {
        console.customLog( 'ERROR in ConfigManager.getSyncUpCoolDownTime, errMsg: ' + errMsg );
    }

    return ( coolDownTime ) ? coolDownTime : ConfigManager.coolDownTime;
};


ConfigManager.getResponseCaseActionJson = function( reportJson )
{
    var caseActionJson;

    if ( reportJson && reportJson.code && reportJson.case )
    {        
        var defCaseActions = ConfigManager.getConfigJson().definitionResponseCaseActions;

        if ( defCaseActions ) 
        {
            var codeDef = defCaseActions[ reportJson.code ];

            if ( codeDef ) caseActionJson = codeDef[ reportJson.case ];
        }
    }

    return caseActionJson;
};


ConfigManager.getDefinitionFieldById = function( fieldId )
{
    var fieldJson;

    if ( fieldId )
    {
        var configJson = ConfigManager.getConfigJson();

        try
        {
            if ( configJson.definitionFields )
            {
				fieldJson = Util.getFromList( configJson.definitionFields, fieldId, "id" );
            }
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR in ConfigManager.getDefinitionFieldById, errMsg: ' + errMsg );
        }    
    }

    return fieldJson;
};


ConfigManager.getAppUpdateSetting = function()
{    
    // If not logged in, 'settings' is undefined.
    var settings = ConfigManager.getConfigJson().settings;
    return ( settings && settings.appUpdate ) ? settings.appUpdate: {};
};

ConfigManager.getConfigUpdateSetting = function()
{
    var settings = ConfigManager.getConfigJson().settings;
    return ( settings && settings.configUpdate ) ? settings.configUpdate: {};
};

// ---------------------------------------------
// ---- Statistic Related --------------------

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


ConfigManager.getStatisticApiPath = function()
{
    var statisticJson = ConfigManager.getStatisticJson();

    var urlPath = ( statisticJson.url ) ? statisticJson.url : '/PWA.statistic';
    var fileName = ( statisticJson.fileName ) ? statisticJson.fileName : ''; // DWS Endpoint has default value..'dc_pwa@LA@stat1.html';

    return urlPath + '?stage=' + WsCallManager.stageName + '&fileName=' + fileName;
};


// ------------------------------------------------------
// -- User Role Related Methods

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


ConfigManager.filterListByUserRoles = function( itemList, bChangeToList, loginUserRoles )
{
    var outList = [];

    if ( Util.isTypeArray( itemList ) )
    {
        itemList.forEach( item => 
        {
            // If userRoles exists in item def, filter against loginUserRoles
            if ( item.userRoles ) 
            {
                if ( Util.isTypeArray( item.userRoles ) )
                {
                    var itemAdded = false;
                    item.userRoles.forEach( roleId => 
                    {
                        if ( !itemAdded && loginUserRoles.indexOf( roleId ) >= 0 ) 
                        { 
                            itemAdded = true; // User instead of 'break'
                            outList.push( item ); 
                        }
                    });
                }
            }
            else outList.push( item );  // If itemObj does not have 'userRoles' property, do not filter it!!
        });

        // Optional - Change the original list (while keeping the reference)
        if ( bChangeToList ) Util.arrayReplaceData( itemList, outList );
    }
    
    return outList;    
};


ConfigManager.filterObjsByUserRoles = function( itemObj, loginUserRoles )
{
    var newItemObj = {};

    if ( Util.isTypeObject( itemObj ) )
    {
        for ( var key in itemObj )
        {
            var keyItem = itemObj[ key ];

            if ( keyItem.userRoles ) 
            {
                var itemAdded = false;
                item.userRoles.forEach( roleId => 
                {
                    if ( !itemAdded && loginUserRoles.indexOf( roleId ) >= 0 ) 
                    { 
                        itemAdded = true; // User instead of 'break'
                        newItemObj.key = keyItem;
                    }
                });            
            }
            else newItemObj.key = keyItem;
        }
    }

    return newItemObj;    
};

// ------------------------------------------------------
// -- Apply Defaults related methods.

ConfigManager.applyDefaults = function( configJson, defaults )
{
    if ( configJson.voucherCodeReuse === undefined ) configJson.voucherCodeReuse = defaults.voucherCodeReuse;

    if ( !configJson.settings ) configJson.settings = {};
    if ( !configJson.settings.sync ) configJson.settings.sync = {};

    ConfigManager.applyDefault_syncRelated( configJson, defaults.sync );

    // Other defaults could be placed here..
    ConfigManager.applyDefault_favList( configJson, defaults.favList );
};


ConfigManager.applyDefault_syncRelated = function( configJson, defaultSync )
{
    if ( defaultSync )
    {
        var mergeDest_Sync = Util.cloneJson( defaultSync );
        Util.mergeDeep( mergeDest_Sync, Util.cloneJson( configJson.settings.sync ), { 'arrOverwrite': true } );
        // merge array, 'syncDown' - if 'syncDown' exists, simply overwrite the default?

        configJson.settings.sync = Util.cloneJson( mergeDest_Sync );

        /*
        if ( defaultSync.networkSync && !configJson.settings.sync.networkSync ) configJson.settings.sync.networkSync = defaultSync.networkSync;
        if ( defaultSync.syncUp && !configJson.settings.sync.syncUp ) configJson.settings.sync.syncUp = Util.cloneJson( defaultSync.syncUp );
        if ( defaultSync.syncDown && !configJson.settings.sync.syncDown ) configJson.settings.sync.syncDown = Util.cloneJson( defaultSync.syncDown );
        if ( defaultSync.syncAll && !configJson.settings.sync.syncAll ) configJson.settings.sync.syncAll = Util.cloneJson( defaultSync.syncAll );    
        */
    }
};

ConfigManager.applyDefault_favList = function( configJson, favListJson )
{
   if ( favListJson )
   {
      if ( !configJson.favList ) configJson.favList = Util.cloneJson( favListJson );
   }
};


// ------------------------------------------------------
// -- UidMapping after download..

ConfigManager.downloadedData_UidMapping = function( dataJson )
{
    // Get uidMapping from ConfigManager
    var configJson = ConfigManager.getConfigJson();

    if ( configJson.download_UidMapping && configJson.download_UidMapping.mapping )
    {
        return Util.jsonKeysReplace_Str( dataJson, configJson.download_UidMapping.mapping );        
    }
    else return dataJson;
};

// ========================================================


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


///"mergeCompare": { "dateCompareField": [ "updated" ] },

// ----- If not on download config, place below default to 'config' json.
ConfigManager.defaultJsonList = {

  "voucherCodeReuse": false,

   "sync": {
        "networkSync": "3600000",

        "syncUp": {
            "syncUpAttemptLimit": {
                "maxAttempts": 10,
                "maxAction": {
                    "status": "error",
                    "msg": "Reached the max sync attempt."
                }
            },
            "coolDownTime": "00:01:30",
            "schedulerTime": "01:00:00"            
        },
        "syncDown": [{
            "userRoles": [],
            "enable": true,
            "sourceType": "mongo",
            "url": "/PWA.syncDown",
            "searchBodyEval": {
                "find": {
                    "clientDetails.users": "INFO.login_UserName",
                    "date.updatedOnMdbUTC": { "$gte": "Util.getStr( INFO.syncLastDownloaded_noZ );" }
                }
            }
        }]
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
        }
    ]
    }  
};

// ==================================================

