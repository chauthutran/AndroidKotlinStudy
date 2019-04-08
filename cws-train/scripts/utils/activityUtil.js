// -------------------------------------------
// -- ActivityUtil Class/Methods

function ActivityUtil() {}

ActivityUtil.activityList = [];

// ==== Methods ======================

ActivityUtil.addAsActivity = function( type, defJson, defId )
{    
    var activityJson = {};
    activityJson.type = type;
    activityJson.defJson = defJson;
    activityJson.defId = ( typeof defId === 'string' ) ? defId : "";
 
    // For some types, clear the activity list <-- to track/collect from 
    if ( type === "area" ) ActivityUtil.clearActivity();

    // Add to the activity list.
    ActivityUtil.activityList.push( activityJson );
};

ActivityUtil.getActivityList = function()
{
    return ActivityUtil.activityList;
}

ActivityUtil.clearActivity = function()
{
    ActivityUtil.activityList = [];    
}
