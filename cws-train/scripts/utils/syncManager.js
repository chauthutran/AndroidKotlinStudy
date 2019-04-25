function syncManager(){}
syncManager.storage_offline_SyncExecutionTimerInterval;syncManager.storage_offline_SyncConditionsTimerInterval;syncManager.syncTimer;syncManager.appShell;syncManager.dcdConfig;syncManager.offLineData;syncManager.cwsRenderObj;syncManager.dataQueued={};syncManager.dataFailed={};syncManager.dataCombine={};syncManager.syncRunning=0;syncManager.subProgressBar;syncManager.conditionsCheckTimer=0;syncManager.syncAutomationRunTimer=0;syncManager.pauseProcess=!1;syncManager.lastSyncAttempt=0;syncManager.lastSyncSuccess=0;syncManager.debugMode=!1;var syncAutomationInteruptedTimer=0;var progClass;syncManager.initialize=function(cwsRenderObj)
{syncManager.cwsRenderObj=cwsRenderObj;syncManager.updateInitVars();syncManager.subProgressBar=$('#divProgressBar').children()[0];progClass=syncManager.subProgressBar.className;if(syncManager.debugMode)console.log('initialize syncManager >> syncManager.storage_offline_SyncConditionsTimerInterval: '+syncManager.storage_offline_SyncConditionsTimerInterval+' syncManager.storage_offline_SyncExecutionTimerInterval: '+syncManager.storage_offline_SyncExecutionTimerInterval+' {syncManager.conditionsCheckTimer: '+syncManager.conditionsCheckTimer+'}')}
syncManager.reinitialize=function(cwsRenderObj)
{if(syncManager.conditionsCheckTimer)
{clearInterval(syncManager.conditionsCheckTimer);syncManager.conditionsCheckTimer=0}
if(syncManager.syncAutomationRunTimer)
{clearTimeout(syncManager.syncAutomationRunTimer);syncManager.syncAutomationRunTimer=0}
syncManager.cwsRenderObj=cwsRenderObj;syncManager.updateInitVars();if(syncManager.debugMode)console.log('restarted syncManager.scheduledSyncConditionsTest >> syncManager.storage_offline_SyncConditionsTimerInterval: '+syncManager.storage_offline_SyncConditionsTimerInterval+' syncManager.storage_offline_SyncExecutionTimerInterval: '+syncManager.storage_offline_SyncExecutionTimerInterval+' {syncManager.conditionsCheckTimer: '+syncManager.conditionsCheckTimer+'}')}
syncManager.updateInitVars=function()
{syncManager.cwsRenderObj.updateFromSession();if(syncManager.debugMode)console.log('>> syncManager.cwsRenderObj.storage_offline_SyncExecutionTimerInterval: '+syncManager.cwsRenderObj.storage_offline_SyncExecutionTimerInterval+', syncManager.cwsRenderObj.storage_offline_SyncConditionsTimerInterval: '+syncManager.cwsRenderObj.storage_offline_SyncConditionsTimerInterval);syncManager.storage_offline_SyncConditionsTimerInterval=syncManager.cwsRenderObj.storage_offline_SyncConditionsTimerInterval;syncManager.storage_offline_SyncExecutionTimerInterval=syncManager.cwsRenderObj.storage_offline_SyncExecutionTimerInterval;if(syncManager.storage_offline_SyncConditionsTimerInterval>0)
{syncManager.conditionsCheckTimer=setInterval(function(){syncManager.scheduledSyncConditionsTest()},syncManager.storage_offline_SyncConditionsTimerInterval)}}
syncManager.evalDataListContent=function()
{if(FormUtil.checkLogin())
{if(syncManager.cwsRenderObj)
{var myData=FormUtil.getMyListData(syncManager.cwsRenderObj.storageName_RedeemList);if(myData)
{var myQueue=myData.filter(a=>a.status==syncManager.cwsRenderObj.status_redeem_queued);var myFailed=myData.filter(a=>a.status==syncManager.cwsRenderObj.status_redeem_failed&&(!a.networkAttempt||a.networkAttempt<syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit));syncManager.dataQueued=myQueue;syncManager.dataFailed=myFailed}}}}
syncManager.evalSyncConditions=function()
{if(FormUtil.checkLogin())
{if(ConnManager.networkSyncConditions())
{if(syncManager.dataQueued.length+syncManager.dataFailed.length)
{$('#divAppDataSyncStatus').show();$('#imgAppDataSyncStatus').show();return!0}
else{$('#divAppDataSyncStatus').hide();$('#imgAppDataSyncStatus').hide();return!1}}
else{$('#divAppDataSyncStatus').hide();$('#imgAppDataSyncStatus').hide();return!1}}
else{$('#divAppDataSyncStatus').hide();$('#imgAppDataSyncStatus').hide();return!1}}
syncManager.scheduledSyncConditionsTest=function()
{syncManager.evalDataListContent();if(syncManager.evalSyncConditions())
{if(syncManager.debugMode)console.log('STARTING >> scheduledSyncConditionsTest.GOOD, syncAutomationInteruptedTimer: '+syncAutomationInteruptedTimer+', syncManager.syncAutomationRunTimer: '+syncManager.syncAutomationRunTimer+', syncManager.syncRunning: '+syncManager.syncRunning+', syncManager.storage_offline_SyncConditionsTimerInterval: '+syncManager.storage_offline_SyncConditionsTimerInterval+', syncManager.lastSyncAttempt: '+syncManager.lastSyncAttempt);if((!syncAutomationInteruptedTimer&&!syncManager.syncAutomationRunTimer&&syncManager.syncAutomationRunTimer==0)&&(!syncManager.syncRunning))
{syncManager.scheduleSyncAutomationRun();if(syncManager.debugMode)console.log('if test 1')}
else if((syncAutomationInteruptedTimer&&syncManager.syncAutomationRunTimer)&&(syncAutomationInteruptedTimer==syncManager.syncAutomationRunTimer)&&(!syncManager.syncRunning))
{syncManager.scheduleSyncAutomationRun();if(syncManager.debugMode)console.log('if test 2')}
else if(syncManager.storage_offline_SyncConditionsTimerInterval==0&&!syncManager.syncAutomationRunTimer&&!syncManager.syncRunning)
{syncManager.scheduleSyncAutomationRun();if(syncManager.debugMode)console.log('if test 3')}
else{}
if(syncManager.debugMode)console.log('ENDING >> scheduledSyncConditionsTest.GOOD, syncAutomationInteruptedTimer: '+syncAutomationInteruptedTimer+', syncManager.syncAutomationRunTimer: '+syncManager.syncAutomationRunTimer+', syncManager.syncRunning: '+syncManager.syncRunning+', syncManager.storage_offline_SyncConditionsTimerInterval: '+syncManager.storage_offline_SyncConditionsTimerInterval+', syncManager.lastSyncAttempt: '+syncManager.lastSyncAttempt)}
else{if(syncManager.syncAutomationRunTimer)
{clearTimeout(syncManager.syncAutomationRunTimer);syncAutomationInteruptedTimer=syncManager.syncAutomationRunTimer}}}
syncManager.scheduleSyncAutomationRun=function()
{if(syncManager.storage_offline_SyncExecutionTimerInterval>0)
{syncManager.syncAutomationRunTimer=setTimeout(function(){syncManager.syncOfflineData()},syncManager.storage_offline_SyncExecutionTimerInterval)}
if(syncManager.debugMode)console.log('syncAutomationRunTimer ['+syncManager.syncAutomationRunTimer+'] to run in '+syncManager.storage_offline_SyncExecutionTimerInterval+'ms : '+(new Date()).toISOString())}
syncManager.recursiveSyncItemData=function(listItem,btnTag)
{syncManager.syncRunning=1;FormUtil.showProgressBar();var bProcess=!1;var itemData=syncManager.dataCombine[listItem];var itemClone;if(syncManager.debugMode)console.log(itemData);if(itemData)
{itemClone=JSON.parse(JSON.stringify(itemData));if(!itemData.networkAttempt)
{bProcess=!0}
else{if(itemData.networkAttempt<syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit)
{bProcess=!0}
else{if(syncManager.debugMode)console.log('itemData.networkAttempt: '+itemData.networkAttempt)}}}
if(!ConnManager.networkSyncConditions())
{syncManager.pauseSync(itemData,itemClone);bProcess=!1}
else{if(!syncManager.pauseProcess&&ConnManager.networkSyncConditions())
{if(syncManager.debugMode)console.log(bProcess+','+syncManager.pauseProcess);syncManager.pauseProcess=!1}}
if(syncManager.debugMode)console.log((ConnManager.networkSyncConditions())+': '+bProcess+', '+(!syncManager.pauseProcess));if(bProcess&&!syncManager.pauseProcess)
{if(DataManager.getItemFromData(syncManager.cwsRenderObj.storageName_RedeemList,itemData.id).syncActionStarted!=0)
{if(syncManager.debugMode)console.log('SKIPPING item, already being synchronized by another process');syncManager.recursiveSyncItemData((listItem+1),btnTag)}
else{var mySyncIcon=$('#listItem_icon_sync_'+itemData.id);if(mySyncIcon)
{mySyncIcon.rotate({count:999,forceJS:!0,startDeg:0});var myResultTag=$('#listItem_networkResults_'+itemData.id);var loadingTag=$('<div class="loadingImg" style="display: inline-block; margin-left: 8px;">Connecting... </div>');myResultTag.empty();myResultTag.append(loadingTag)}
syncManager.lastSyncAttempt=listItem;if(syncManager.debugMode)console.log('current SyncItem > '+(listItem+1)+' / '+syncManager.dataCombine.length+' = '+parseFloat(((listItem)/syncManager.dataCombine.length)*100).toFixed(0));FormUtil.updateProgressWidth(parseFloat(((listItem+1)/syncManager.dataCombine.length)*100).toFixed(0)+'%');var dtmRedeemAttempt=(new Date()).toISOString();itemData.lastAttempt=dtmRedeemAttempt;itemData.syncActionStarted=1;if(!syncManager.pauseProcess)
{DataManager.updateItemFromData(syncManager.cwsRenderObj.storageName_RedeemList,itemData.id,itemData)}
FormUtil.submitRedeem(itemData.data.url,itemData.data.payloadJson,itemData.data.actionJson,undefined,function(success,returnJson)
{if(!success&&!returnJson&&!ConnManager.networkSyncConditions())
{syncManager.pauseSync(itemData,itemClone);FormUtil.hideProgressBar();$(syncManager.subProgressBar).removeClass('determinate');$(syncManager.subProgressBar).addClass(progClass);$('#imgAppDataSyncStatus').stop();if(btnTag)
{if(btnTag.hasClass('clicked'))
{btnTag.removeClass('clicked')}}
syncManager.syncRunning=0;if(syncManager.pauseProcess)
{MsgManager.msgAreaShow('Sync PAUSED > network conditions')}}
else{var itmHistory=itemData.history;var syncType=(btnTag)?'manual-Sync-Manager':'auto-Sync-Manager';var newTitle;itemData.returnJson=returnJson;if(itemData.networkAttempt)itemData.networkAttempt+=1;else itemData.networkAttempt=1;if(success&&(returnJson.resultData.status!='fail'))
{var dtmRedeemDate=(new Date()).toISOString();itemData.redeemDate=dtmRedeemDate;itemData.status=syncManager.cwsRenderObj.status_redeem_submit;syncManager.lastSyncSuccess ++;newTitle='success > '+dtmRedeemAttempt;if(FormUtil.PWAlaunchFrom()=="homeScreen")
{playSound("coin")}}
else{if(returnJson&&returnJson.displayData&&(returnJson.displayData.length>0)&&ConnManager.networkSyncConditions()&!syncManager.pauseProcess)
{var msg=JSON.parse(returnJson.displayData[0].value).msg;itemData.title=msg.toString().replace(/--/g,'<br>');newTitle='error > '+msg.toString().replace(/--/g,'<br>')}
if(itemData.networkAttempt>=syncManager.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit&&ConnManager.networkSyncConditions()&!syncManager.pauseProcess)
{itemData.status=syncManager.cwsRenderObj.status_redeem_failed;newTitle='error occurred > exceeded network attempt limit'}}
if(mySyncIcon)
{mySyncIcon.stop();myResultTag.html(newTitle)}
if(returnJson)
{itmHistory.push({"syncType":syncType,"syncAttempt":dtmRedeemAttempt,"success":success,"restultStatus":returnJson.resultData.status,"returnJson":returnJson})}
else{itmHistory.push({"syncType":syncType,"syncAttempt":dtmRedeemAttempt,"success":success})}
itemData.history=itmHistory;itemData.syncActionStarted=0;FormUtil.setStatusOnTag($('#listItem_action_sync_'+itemData.id).find('div.icons-status'),itemData,syncManager.cwsRenderObj);FormUtil.appendActivityTypeIcon($('#listItem_icon_activityType_'+itemData.id),FormUtil.getActivityType(itemData),FormUtil.getStatusOpt(itemData),syncManager.cwsRenderObj)
if(ConnManager.networkSyncConditions()&!syncManager.pauseProcess)
{DataManager.updateItemFromData(syncManager.cwsRenderObj.storageName_RedeemList,itemData.id,itemData);syncManager.recursiveSyncItemData((listItem+1),btnTag)}
else{if(syncManager.pauseProcess)
{syncManager.pauseSync(itemData,itemClone)}
else{if(syncManager.debugMode)console.log('ending becuase of sync Conditions: '+ConnManager.networkSyncConditions());syncManager.endSync(btnTag)}
DataManager.updateItemFromData(syncManager.cwsRenderObj.storageName_RedeemList,itemClone.id,itemClone);FormUtil.appendActivityTypeIcon($('#listItem_icon_activityType_'+itemClone.id),FormUtil.getActivityType(itemClone),FormUtil.getStatusOpt(itemClone),syncManager.cwsRenderObj)
FormUtil.setStatusOnTag($('#listItem_action_sync_'+itemClone.id).find('div.icons-status'),itemClone,syncManager.cwsRenderObj)}}})}}
else{if(syncManager.debugMode)console.log(' ending HERE ['+(bProcess&&!syncManager.pauseProcess)+'] >> sync Conditions: '+ConnManager.networkSyncConditions()+' AND ! syncManager.pauseProcess: '+syncManager.pauseProcess);syncManager.endSync(btnTag)}}
syncManager.endSync=function(btnTag)
{if(syncManager.debugMode)console.log('ending sync');FormUtil.hideProgressBar();$(syncManager.subProgressBar).removeClass('determinate');$(syncManager.subProgressBar).addClass(progClass);$('#imgAppDataSyncStatus').stop();if(!syncManager.pauseProcess)
{$('#divAppDataSyncStatus').hide();$('#imgAppDataSyncStatus').hide()}
if(btnTag)
{if(btnTag.hasClass('clicked'))
{btnTag.removeClass('clicked')}}
syncManager.syncRunning=0;if(syncManager.pauseProcess)
{MsgManager.msgAreaShow('Sync PAUSED > network conditions')}
else{if(syncManager.lastSyncSuccess>0)
{ga('send',{'hitType':'event','eventCategory':'data-Sync','eventAction':FormUtil.gAnalyticsEventAction(),'eventLabel':FormUtil.gAnalyticsEventLabel()});MsgManager.msgAreaShow('Sync COMPLETED ['+syncManager.lastSyncSuccess+']')}
syncManager.lastSyncAttempt=0;syncManager.lastSyncSuccess=0}}
syncManager.syncOfflineData=function(btnTag)
{var Proceed=!1;syncManager.lastSyncSuccess=0;if(syncManager.debugMode)console.log('syncOfflineData');if(syncManager.syncRunning==0)
{if(btnTag)
{if(!btnTag.hasClass('clicked'))
{btnTag.addClass('clicked');Proceed=!0}}
else{Proceed=!0}
if(Proceed)
{if(FormUtil.checkLogin())
{if(ConnManager.networkSyncConditions())
{if(syncManager.dataQueued.length+syncManager.dataFailed.length)
{syncManager.evalDataListContent();syncManager.dataCombine=syncManager.dataQueued.concat(syncManager.dataFailed);(syncManager.dataCombine).sort(function(a,b){var a1st=-1,b1st=1,equal=0;if(b.created>a.created)return b1st;else if(a.created>b.created)return a1st;else return equal});$('#imgAppDataSyncStatus').rotate({count:99999,forceJS:!0,startDeg:0});$(syncManager.subProgressBar).removeClass(progClass);$(syncManager.subProgressBar).addClass('determinate');syncAutomationInteruptedTimer=syncManager.syncAutomationRunTimer;FormUtil.updateProgressWidth(0);FormUtil.showProgressBar(0);if(!FormUtil.dcdConfig)
{FormUtil.dcdConfig=JSON.parse(DataManager.getData(syncManager.cwsRenderObj.storageName_RedeemList)).dcdConfig;MsgManager.msgAreaShow('syncManager > reloading FormUtil.dcdConfig :(')}
if(syncManager.pauseProcess)
{syncManager.pauseProcess=0}
if(syncManager.debugMode)
{console.log(syncManager.dataCombine);console.log('syncManager.lastSyncAttempt: '+syncManager.lastSyncAttempt+', syncManager.pauseProcess: '+syncManager.pauseProcess+', ConnManager.networkSyncConditions(): '+ConnManager.networkSyncConditions())}
syncManager.lastSyncSuccess=0;syncManager.recursiveSyncItemData((syncManager.lastSyncAttempt),btnTag)}}
else{MsgManager.msgAreaShow('Network unavailable: cannot Synchronize offline data')}}
else{MsgManager.msgAreaShow('Session error: cannot Synchronize offline data, please login again')}}}}
syncManager.pauseSync=function(itmObj,itmClone)
{if(syncManager.debugMode)console.log('pause Sync');DataManager.updateItemFromData(syncManager.cwsRenderObj.storageName_RedeemList,itmObj.id,itmClone);syncManager.pauseProcess=!0}