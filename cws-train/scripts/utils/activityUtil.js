function ActivityUtil(){}
ActivityUtil.activityList=[];ActivityUtil.addAsActivity=function(type,defJson,defId)
{var activityJson={};activityJson.type=type;activityJson.defJson=defJson;activityJson.defId=(typeof defId==='string')?defId:"";if(type==="area")ActivityUtil.clearActivity();ActivityUtil.activityList.push(activityJson)};ActivityUtil.getActivityList=function()
{return ActivityUtil.activityList}
ActivityUtil.clearActivity=function()
{ActivityUtil.activityList=[]}