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

ConfigManager.defaultActivity_DisplayBase = `Util.formatDate( INFO.activity.processing.created, 'MMM dd, yyyy - HH:mm' );`;
ConfigManager.defaultActivity_DisplaySettings = `'<i>' + INFO.activity.id + '</i>'`;

ConfigManager.defaultClient_DisplayBase = `'<b>' + INFO.client.clientDetails.firstName + ' ' + INFO.client.clientDetails.lastName + ' - ' + INFO.client.clientDetails.age + '</b>'`;
ConfigManager.defaultClient_DisplaySettings = `'<i>' + INFO.client._id + '</i>'`;

ConfigManager.defaultClientRel_DisplayBase = `'<b>' + INFO.relationship.client.clientDetails.firstName + ' ' + INFO.relationship.client.clientDetails.lastName + ' - ' + INFO.relationship.client.clientDetails.age + '</b>'`;
ConfigManager.defaultClientRel_DisplaySettings = `INFO.relationship.type + ', ' + Util.formatDate( INFO.relationship.date, 'MMM dd, yyyy - HH:mm' )`;

ConfigManager.defaultClientActivityCardDef_DisplayBase = `'Created: ' + Util.formatDate( INFO.activity.date.capturedLoc, 'MMM dd, yyyy - HH:mm' );`;
ConfigManager.defaultClientActivityCardDef_DisplaySettings = `'ActivityType: ' + INFO.activity.type`;

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
            ConfigManager.applyFilter_UserRole( ConfigManager.configJson, ConfigManager.login_UserRoles
                ,[ 'favList', 'areas', 'definitionActivityListViews', 'definitionClientListViews'
                    , 'definitionOptions', 'settings.sync.syncDown' ] );

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
            ConfigManager.filterListItems_ByUserRoles( itemList, login_UserRoles );
            
            if ( itemList.length > 0 )
            {
                var lastListType = itemList[0].type;

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
ConfigManager.applyFilter_UserRole = function( configJson, loginUserRoles, itemList )
{
    try
    {
        if ( loginUserRoles )
        {
            // Limited/Selected Target Case - only look at selected elements on 'configJson' and remove where 'userRoles' exists if match is not found. 
            if ( itemList )
            {
                itemList.forEach( itemName => 
                { 
                    try
                    {
                        var itemJson;
                        if ( itemName === 'settings.sync.syncDown' ) itemJson = configJson.settings.sync.syncDown;
                        else itemJson = configJson[ itemName ];
                        
                        ConfigManager.traverseFind_Filter( itemJson, loginUserRoles, 0, 10 );
                    }
                    catch( errMsg )
                    {
                        console.log( 'ERROR in ConfigManager.applyFilter_UserRole, ' + itemName + ' errMsg: ' + errMsg );
                    }  
                });
            }
            else
            {
                // Traverse for all elements on config and look for 'userRoles' on them.
                console.log( 'ConfigManager.applyFilter_UserRole checking for all leaf' );
                ConfigManager.traverseFind_Filter( configJson, loginUserRoles, 0, 20 );
            }
        }
    }
    catch( errMsg )
    {
        console.log( 'ERROR in ConfigManager.applyFilter_UserRole, errMsg: ' + errMsg );
    }   
};


ConfigManager.traverseFind_Filter = function( obj, inputUserRoles, iDepth, limit )
{
	if ( iDepth === limit )
	{
		throw 'Error in ConfigManager.traverseFind_Filter, Traverse depth limit has reached: ' + iDepth;
	}
	else if ( obj )
	{
		Object.keys( obj ).forEach( key => 
		{
			var prop = obj[key];
	
			if ( Util.isTypeArray( prop ) )
			{
				var iDepthArr = iDepth + 1;

                for ( var i = prop.length - 1; i >= 0;  i-- )
                {
                    var arrItem = prop[i];
        
					if ( Util.isTypeObject( arrItem ) )
                    {
                        if ( arrItem.userRoles )
                        {
                            // If userRoles does not match, delete the object.  If matches, continue to lower levels.
                            if ( !ConfigManager.matchUserRoles( arrItem.userRoles, inputUserRoles ) ) {
                                //console.log( 'REMOVED - ' + JSON.stringify( arrItem ) );
                                prop.splice( i, 1 );
                            }
                            else ConfigManager.traverseFind_Filter( arrItem, inputUserRoles, iDepthArr, limit );
                        }
                        else ConfigManager.traverseFind_Filter( arrItem, inputUserRoles, iDepthArr, limit );
                    }
                    else if ( Util.isTypeArray( arrItem ) ) ConfigManager.traverseFind_Filter( arrItem, inputUserRoles, iDepthArr, limit );
                }
			}
			else if ( Util.isTypeObject( prop ) )
			{
                if ( prop.userRoles )
                {
                    // If userRoles does not match, delete the object.  If matches, continue to lower levels.
                    if ( !ConfigManager.matchUserRoles( prop.userRoles, inputUserRoles ) ) {
                        //console.log( 'REMOVED - ' + JSON.stringify( prop ) );
                        delete obj[key];
                    }
                    else ConfigManager.traverseFind_Filter( prop, inputUserRoles, iDepth + 1, limit );
                }
                else ConfigManager.traverseFind_Filter( prop, inputUserRoles, iDepth + 1, limit );
			}
			// else if ( Util.isTypeString( prop ) ) {	}  // end of the search node
		});
	}
};	

ConfigManager.matchUserRoles = function( itemUserRoles, inputUserRoles )
{
    var isMatch = false;

    for ( var i = 0; i < itemUserRoles.length; i++ )
    {
        var itemUserRole = itemUserRoles[i];

        if ( inputUserRoles.indexOf( itemUserRole ) >= 0 ) 
        {
            isMatch = true;
            break;
        }
    }

    return isMatch;
};


/*
// Adjust/Filter by userRole <--  definitionOptionList, areaList, favList
ConfigManager.applyFilter_UserRole = function( configJson, arrList, loginUserRoles )
{
    try
    {
        if ( arrList && loginUserRoles )
        {
            // [ 'favList', 'areas', 'definitionOptions', 'settings.sync.syncDown' ]
            arrList.forEach( defName => 
            { 
                try
                {
                    var defList;

                    if ( defName === 'settings.sync.syncDown' ) defList = configJson.settings.sync.syncDown;
                    else defList = configJson[ defName ];

                    // NOTE, could be more dynamic - Find the 'userRole[]' list (array or object) in deep level and adjust the list or object based on that..
                    // 'defName' is like 'favList', 'areas', 'definitionOptions', etc..

                    // If Object, look for arrayList in one level below..
                    if ( Util.isTypeArray( defList ) && ConfigManager.hasUserRole_inArraySubItem( defList ) )
                    {
                        // 'syncDown' CASE
                        // Type1. list: [ { .. userRoles[ ipc ] }, {} ]
                        ConfigManager.filterListItems_ByUserRoles( defList, loginUserRoles );
                    }
                    else if ( Util.isTypeObject( defList ) )
                    {
                        // 'favList', areas', definitionOptions' CASE
                        Object.keys( defList ).forEach( key => 
                        {
                            // 'key' = 'online' / 'offline' (in areas case)
                            var itemObj = defList[key];

                            if ( Util.isTypeArray( itemObj ) && ConfigManager.hasUserRole_inArraySubItem( itemObj ) )
                            {
                                // 'areas.online', 'areas.offline', etc..  most of the cases..
                                // Type2. obj: { item: [ { .. userRoles[ ipc ] }, {} ], [...], .. }
                                ConfigManager.filterListItems_ByUserRoles( itemObj, loginUserRoles );
                            }
                            else if ( Util.isTypeObject( itemObj ) )
                            {
                                // If 'favList.activityListFav' itself has userRoles
                                if ( itemObj.userRoles )
                                {
                                    if ( ConfigManager.notMatch_UserRole( itemObj, loginUserRoles ) )
                                    {
                                        delete defList[key];
                                    }
                                }
                                else if ( ConfigManager.hasUserRole_InSubItem( itemObj ) ) 
                                {
                                    // Type3. obj: { { .. userRoles[ ipc ] }, {} }  <-- not used..
                                    ConfigManager.filterSubObjsByUserRoles( itemObj, loginUserRoles );
                                }
                                // if 'TYPE' is 'favList', it could be obj > array.. that has 'userRoles'
                                // 'favList.activityListFav' --> 'online'/'offline'
                                else if ( ConfigManager.hasUserRole_InSubItem_SubArray( itemObj ) )
                                {
                                    Object.keys( itemObj ).forEach( itemKey => 
                                    {
                                        ConfigManager.filterListItems_ByUserRoles( itemObj[ itemKey ], loginUserRoles );
                                    });
                                }
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
*/

// ----------------------------------------------------
// === UserRoles Filter/Check Related Methods

ConfigManager.hasUserRole_InSubItem_SubArray = function( itemObj )
{
    var hasUserRole = false;
    // is the child type the object?

    // 'areas.activityListFav' -> 'online'
    for ( var key in itemObj )
    {
        var subItemObj = itemObj[ key ];

        // does 'online' array's item object has 'UserRole'?
        if ( Util.isTypeArray( subItemObj ) && ConfigManager.hasUserRole_inArraySubItem( subItemObj ) )
        {
            hasUserRole = true;
            break;            
        }
    }

    return hasUserRole;
};


ConfigManager.hasUserRole_inArraySubItem = function( itemObj )
{
    var hasUserRole = false;

    if ( itemObj && Util.isTypeArray( itemObj ) )
    {
        for ( var i = itemObj.length - 1; i >= 0;  i-- )
        {
            var subItem = itemObj[i];

            // If userRoles exists in item def, filter against loginUserRoles
            if ( subItem.userRoles )
            {
                hasUserRole = true;
                break;
            }
        }
    }                
               
    return hasUserRole;
};


ConfigManager.hasUserRole_inSubItem = function( itemObj )
{
    var hasUserRole = false;

    if ( itemObj && Util.isTypeObject( itemObj ) )
    {        
        for ( var i = 0; i < itemObj.length; i++ )
        {
            var subItem = itemObj[i];

            if ( subItem.userRoles )
            {
                hasUserRole = true;
                break;
            }
        }
    }                
               
    return hasUserRole;
};


// -----------------------------------------------------
// ---- Filter / check for UserRoles


ConfigManager.filterListItems_ByUserRoles = function( itemList, loginUserRoles )
{
    if ( itemList && Util.isTypeArray( itemList ) )   // Do not need to check again..
    {
        for ( var i = itemList.length - 1; i >= 0;  i-- )
        {
            var item = itemList[i];

            // If userRoles exists in item def, filter against loginUserRoles
            if ( item.userRoles && Util.isTypeArray( item.userRoles ) )
            {
                var roleMatch = false;
                
                item.userRoles.forEach( roleId => 
                {
                    if ( !roleMatch && loginUserRoles.indexOf( roleId ) >= 0 ) roleMatch = true;
                });

                // If the userRoles does not match, delete this object from list/array
                if ( !roleMatch ) itemList.splice( i, 1 );
            }
        }
    }    
};


ConfigManager.filterSubObjsByUserRoles = function( itemObj, loginUserRoles )
{
    // DEBUG
    //alert( 'ConfigManager.filterSubObjsByUserRoles CASE!!' );
    //console.log( itemObj );

    if ( Util.isTypeObject( itemObj ) )
    {
        for ( var key in itemObj )
        {
            var subItem = itemObj[ key ];

            if ( ConfigManager.notMatch_UserRole( subItem, loginUserRoles ) )
            {
                delete itemObj[ key ];
            }
        }
    }
};


ConfigManager.notMatch_UserRole = function( item, loginUserRoles )
{
    var notMatch = true;
    var itemUserRoles = item.userRoles;

    // if 'userRoles' does not exists, it is always not match case.
    if ( itemUserRoles )
    {
        for ( var i = 0; i < itemUserRoles.length; i++ )
        {
            var roleId = itemUserRoles[ i ];
            if ( loginUserRoles.indexOf( roleId ) >= 0 ) 
            {
                // if match is found, set 'notMatch' false.
                notMatch = false;
                break;
            }
        }
    }

    return notMatch;
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
    var userRolesObj = {};
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
                // Should be opposite way around...
                ouGroups.forEach( oug => 
                {
                    var matchOUG_URole = Util.getFromList( defUserRoles, oug.id, 'uid' );
                    if ( matchOUG_URole )
                    {
                        if ( matchOUG_URole.id ) userRolesObj[ matchOUG_URole.id ] = true;
                        if ( matchOUG_URole.altId ) userRolesObj[ matchOUG_URole.altId ] = true;
                    }

                    var ougsList = oug.orgUnitGroupSets;
                    if ( ougsList )
                    {
                        ougsList.forEach( ougs => 
                        {
                            var matchOUGS_URole = Util.getFromList( defUserRoles, ougs.id, 'uid' );

                            if ( matchOUGS_URole ) 
                            {
                                if ( matchOUGS_URole.id ) userRolesObj[ matchOUGS_URole.id ] = true;
                                if ( matchOUGS_URole.altId ) userRolesObj[ matchOUGS_URole.altId ] = true;
                            }        
                        });
                    }
                });

                userRoles = Object.keys( userRolesObj );
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

ConfigManager.getAreas = function()
{
    return ConfigManager.configJson.areas;
};

ConfigManager.getArea1st = function()
{
    var areaList = ConfigManager.getAllAreaList();
    return ( areaList.length > 0 ) ? areaList[0] : undefined;
};

ConfigManager.getArea1st_Id = function()
{
    var area1st = ConfigManager.getArea1st();
    return ( area1st ) ? area1st.id : '';
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


ConfigManager.getSettingsActivityDef = function()
{
    var configJson = ConfigManager.getConfigJson();

    var activityDef = {};

    // could be named 'redeemDefs' or 'activityDef'
    if ( configJson.settings )
    {
        if ( configJson.settings.activityDef ) activityDef = configJson.settings.activityDef;
        else if ( configJson.settings.redeemDefs ) activityDef = configJson.settings.redeemDefs;
    }

    return activityDef;
};



ConfigManager.getActivityDisplaySettings = function()
{
    var displaySettings = [  
      ConfigManager.defaultActivity_DisplaySettings 
    ];

    var activityDef = ConfigManager.getSettingsActivityDef();

    if ( activityDef.displaySettings )
    {
        displaySettings = activityDef.displaySettings;
    }

    return displaySettings;
};


ConfigManager.getActivityDisplayBase = function()
{
    var displayBase = ConfigManager.defaultActivity_DisplayBase;

    var activityDef = ConfigManager.getSettingsActivityDef();

    if ( activityDef.displayBase )
    {
        displayBase = activityDef.displayBase;
    }

    return displayBase;
};

// ---------------------------------------------

ConfigManager.getSettingsClientDef = function()
{
    var configJson = ConfigManager.getConfigJson();

    var clientDef = {};

    // ClientDef could be settings itself or within 'clientDef'
    if ( configJson.settings )
    {
        if ( configJson.settings.clientDef ) clientDef = configJson.settings.clientDef;
        else clientDef = configJson.settings;
    }

    return clientDef;
};


ConfigManager.getClientDisplayBase = function()
{
    var displayBase = ConfigManager.defaultClient_DisplayBase;

    var clientDef = ConfigManager.getSettingsClientDef();

    if ( clientDef.clientCardDef && clientDef.clientCardDef.displayBase )
    {
        displayBase = clientDef.clientCardDef.displayBase;
    }

    return displayBase;
};


ConfigManager.getClientDisplaySettings = function()
{
    var displaySettings = [  
      ConfigManager.defaultClient_DisplaySettings 
    ];

    var clientDef = ConfigManager.getSettingsClientDef();

    if ( clientDef.clientCardDef && clientDef.clientCardDef.displaySettings )
    {
        displaySettings = clientDef.clientCardDef.displaySettings;
    }

    return displaySettings;
};


ConfigManager.getClientRelDisplayBase = function()
{
    var displayBase = ConfigManager.defaultClientRel_DisplayBase;

    var clientDef = ConfigManager.getSettingsClientDef();

    if ( clientDef.clientRelCardDef && clientDef.clientRelCardDef.displayBase )
    {
        displayBase = clientDef.clientRelCardDef.displayBase;
    }

    return displayBase;
};


ConfigManager.getClientRelDisplaySettings = function()
{
    var displaySettings = [  
      ConfigManager.defaultClientRel_DisplaySettings 
    ];

    var clientDef = ConfigManager.getSettingsClientDef();

    if ( clientDef.clientRelCardDef && clientDef.clientRelCardDef.displaySettings )
    {
        displaySettings = clientDef.clientRelCardDef.displaySettings;
    }

    return displaySettings;
};


ConfigManager.getClientActivityCardDefDisplayBase = function()
{
    var displayBase = ConfigManager.defaultClientActivityCardDef_DisplayBase;

    var clientDef = ConfigManager.getSettingsClientDef();

    if ( clientDef.clientActivityCardDef && clientDef.clientActivityCardDef.displayBase )
    {
        displayBase = clientDef.clientActivityCardDef.displayBase;
    }

    return displayBase;
};


ConfigManager.getClientActivityCardDefDisplaySettings = function()
{
    var displaySettings = [  
      ConfigManager.defaultClientActivityCardDef_DisplaySettings 
    ];

    var clientDef = ConfigManager.getSettingsClientDef();

    if ( clientDef.clientActivityCardDef && clientDef.clientActivityCardDef.displaySettings )
    {
        displaySettings = clientDef.clientActivityCardDef.displaySettings;
    }

    return displaySettings;
};



ConfigManager.getActionQueueActivity = function()
{
    var actionJson;

    var clientDef = ConfigManager.getSettingsClientDef();

    if ( clientDef.action_queueActivity_Template )
    {
        actionJson = clientDef.action_queueActivity_Template;
    }

    return actionJson;
};

// ---------------------------------------------

ConfigManager.getActivitySyncUpStatusConfig = function( activityJson )
{
    var activityStatusConfig;

	try
	{        
        if ( activityJson.processing )
        {
            activityStatusConfig = Util.getFromList( ConfigManager.getSettingsActivityDef().statusOptions, activityJson.processing.status, 'name' );
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

    try
	{
        activityTypeConfig = Util.getFromList( ConfigManager.getSettingsActivityDef().activityTypes, activityJson.type, 'name' );
	}
	catch ( errMsg )
	{
		console.customLog( 'Error on ConfigManager.getActivityTypeConfig, errMsg: ' + errMsg );
    }

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
        
        if ( login_UserRoles.indexOf( roleId ) < 0 )
        {
            hasAllConfigRoles = false;
            break;
        }
    }

    return hasAllConfigRoles;
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

    ConfigManager.applyDefault_clientDetailTab( configJson, defaults.activityDef );

    ConfigManager.applyDefault_actionQueueActivity( configJson, defaults.action_queueActivity_Template );
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

ConfigManager.applyDefault_clientDetailTab = function( configJson, activityDefJson )
{
    if ( activityDefJson && activityDefJson.clientDetailTab )
    {
        // if 'formDef'
        var activityDef = ConfigManager.getSettingsActivityDef();

        if ( activityDef && !activityDef.clientDetailTab ) activityDef.clientDetailTab = Util.cloneJson( activityDefJson.clientDetailTab );
    }
};

ConfigManager.applyDefault_actionQueueActivity = function( configJson, action_queueActivity_Template )
{
    if ( action_queueActivity_Template )
    {
        var clientDef = ConfigManager.getSettingsClientDef();

        if ( clientDef && !clientDef.action_queueActivity_Template ) clientDef.action_queueActivity_Template = Util.cloneJson( action_queueActivity_Template );
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


ConfigManager.getRelationOpposite = function( relValue, optionDefId )
{
    var valueOpposite;

    var optionList = FormUtil.getObjFromDefinition( optionDefId, ConfigManager.getConfigJson().definitionOptions );

    if ( optionList && Util.isTypeArray( optionList ) )
    {
        var optionJson = Util.getFromList( optionList, relValue, 'value' );
        if ( optionJson && optionJson.valueOpposite ) valueOpposite = optionJson.valueOpposite;
    }

	return valueOpposite;
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
ConfigManager.defaultJsonList = 
{
    "voucherCodeReuse": false,

    "action_queueActivity_Template": { "actionType": "queueActivity", "url": "/PWA.mongo_capture", "underClient": true },

    "sync": {
      "networkSync": "3600000",
      "syncUp": {
        "syncUpAttemptLimit": {"maxAttempts": 10, "maxAction": {"status": "error", "msg": "Reached the max sync attempt."}},
        "coolDownTime": "00:01:30",
        "schedulerTime": "01:00:00"
      },

      "syncDown": [
        {
          "userRoles": [],
          "enable": true,
          "sourceType": "mongo",
          "url": "/PWA.syncDown",
          "searchBodyEval": {
            "find": {"clientDetails.users": "INFO.login_UserName", "date.updatedOnMdbUTC": {"$gte": "Util.getStr( INFO.syncLastDownloaded_noZ );"}}
          }
        }
      ]
    },

    "favList": {
      "online": [
        {
          "id": "1", "name": "All Contact", "term": "menu_list", "img": "images/act_arrows.svg",
          "style": {"icon": {"colors": {"background": "#fff", "foreground": "#4F4F4F"}}},
          "target": {"actionType": "openBlock", "blockId": "blockRedeemList"}
        },
        {
          "id": "2", "name": "Entry Online only", "term": "menu_entry", "img": "images/act_col.svg",
          "style": {"icon": {"colors": {"background": "none", "foreground": "#B06068"}}},
          "target": {"actionType": "openBlock", "blockId": "blockDefaultOptionsOnline"}
        }
      ],
      "offline": [
        {
          "id": "1", "name": "All Contact", "term": "menu_list", "img": "images/act_arrows.svg",
          "style": {"icon": {"colors": {"background": "none", "foreground": "#4F4F4F"}}},
          "target": {"actionType": "openBlock", "blockId": "blockRedeemList"}
        }
      ]
    },

    "activityDef": {
      "clientDetailTab": { 
        "formDef": [
            { "defaultName": "First Name", "id": "firstName", "term": "form_std_firstName_label" },
            { "defaultName": "Last Name", "id": "lastName", "term": "form_std_lastName_label" },
            { "defaultName": "Age", "id": "age", "term": "form_std_age_label" },
            { "defaultName": "Gender", "id": "gender", "term": "form_std_gender_label" },
            { "defaultName": "Phone Ownership", "id": "ownershipOfPhone", "term": "form_std_ownershipOfPhone_label" },
            { "defaultName": "Phone Number", "id": "phoneNumber", "term": "form_std_phoneNumberSMSVoice_label" }
        ]
      }
    }
};

// ==================================================

