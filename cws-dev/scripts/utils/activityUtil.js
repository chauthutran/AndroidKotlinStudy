// -------------------------------------------
// -- ActivityUtil Class/Methods

function ActivityUtil() {}

ActivityUtil.activityList = [];

// ==== Methods ======================

ActivityUtil.addAsActivity = function( type, defJson, defId, inputsJson )
{    
    // For some types, clear the activity list <-- to track/collect from 
    if ( type === "area" ) ActivityUtil.clearActivity();


    var activityJson = {};
    activityJson.type = type;
    activityJson.defJson = defJson;
    activityJson.defId = ( typeof defId === 'string' ) ? defId : ""; 
    activityJson.inputsJson = inputsJson;

    // Add to the activity list.
    ActivityUtil.activityList.push( activityJson );

    return activityJson;
};


ActivityUtil.setInputsJson = function( activityJson, inputsJson )
{
    activityJson.inputsJson = inputsJson;
};


ActivityUtil.getActivityList = function()
{
    return ActivityUtil.activityList;
};

ActivityUtil.clearActivity = function()
{
    ActivityUtil.activityList = [];    
};
