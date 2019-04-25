function DataManager(){}
DataManager.StorageName_session="session";DataManager.StorageName_langTerms="langTerms";DataManager.saveData=function(secName,jsonData){localStorage[secName]=JSON.stringify(jsonData)};DataManager.getData=function(secName){var jsonData;var dataStr=localStorage[secName];if(dataStr)jsonData=JSON.parse(dataStr);return jsonData};DataManager.getOrCreateData=function(secName){var jsonData=DataManager.getData(secName);if(!jsonData)jsonData={};return jsonData};DataManager.deleteData=function(secName){localStorage.removeItem(secName)};DataManager.insertDataItem=function(secName,jsonInsertData){var jsonMainData=DataManager.getOrCreateData(secName);if(jsonMainData.list===undefined)jsonMainData.list=[];jsonMainData.list.push(jsonInsertData);DataManager.saveData(secName,jsonMainData)};DataManager.removeItemFromData=function(secName,id){if(secName&&id)
{var jsonMainData=DataManager.getOrCreateData(secName);if(jsonMainData.list!==undefined)
{Util.RemoveFromArray(jsonMainData.list,"id",id)}
DataManager.saveData(secName,jsonMainData)}};DataManager.getItemFromData=function(secName,id)
{var itemData;if(secName&&id)
{var jsonMainData=DataManager.getOrCreateData(secName);if(jsonMainData.list!==undefined)
{itemData=Util.getFromList(jsonMainData.list,id,"id")}}
return itemData};DataManager.updateItemFromData=function(secName,id,jsonDataItem)
{if(secName&&id)
{var jsonMainData=DataManager.getOrCreateData(secName);if(jsonMainData.list!==undefined)
{itemData=Util.getFromList(jsonMainData.list,id,"id");Util.copyProperties(jsonDataItem,itemData);DataManager.saveData(secName,jsonMainData)}
else{console.log('failed `jsonMainData.list !== undefined`: '+secName+' '+id)}}
else{console.log('failed `DataManager.updateItemFromData` on secName && id: '+secName+' '+id)}};DataManager.getUserConfigData=function()
{var userConfigJson;var sessionJson=DataManager.getSessionData();if(sessionJson)
{if(sessionJson.user)
{var userDataStr=localStorage.getItem(sessionJson.user);userConfigJson=JSON.parse(userDataStr)}}
return userConfigJson}
DataManager.getSessionData=function()
{var sessionJson;var sessionDataStr=localStorage.getItem(DataManager.StorageName_session);if(sessionDataStr)
{sessionJson=JSON.parse(sessionDataStr)}
return sessionJson}
DataManager.setSessionDataValue=function(prop,val)
{var sessionDataStr=localStorage.getItem(DataManager.StorageName_session);if(sessionDataStr)
{var sessionJson=JSON.parse(sessionDataStr);sessionJson[prop]=val;DataManager.saveData(DataManager.StorageName_session,sessionJson)
return!0}}
DataManager.getSessionDataValue=function(prop,defval)
{var sessionDataStr=localStorage.getItem(DataManager.StorageName_session);var ret;if(sessionDataStr)
{var sessionJson=JSON.parse(sessionDataStr);if(sessionJson[prop])
{ret=sessionJson[prop]}
else{ret=defval}
return ret}}
DataManager.clearSessionStorage=function()
{if(localStorage.getItem('session'))
{var lastSession=JSON.parse(localStorage.getItem('session'));if(JSON.parse(localStorage.getItem(lastSession.user)))
{localStorage.removeItem('session');localStorage.removeItem(lastSession.user);return!0}}}