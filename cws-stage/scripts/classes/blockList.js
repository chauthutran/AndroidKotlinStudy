function BlockList(cwsRenderObj,blockObj)
{var me=this;me.cwsRenderObj=cwsRenderObj;me.blockObj=blockObj;me.redeemList;me.redeemListTargetTag;me.redeemListScrollSize=15;me.redeemListScrollingState=0;me.redeemListScrollCount=0;me.redeemListScrollLimit=0;me.redeemListScrollExists=0;me.lastRedeemDate;me.redeemListLimit;me.options;me.newBlockTag;me.storageName_RedeemList=cwsRenderObj.storageName_RedeemList;me.status_redeem_submit=cwsRenderObj.status_redeem_submit;me.status_redeem_queued=cwsRenderObj.status_redeem_queued;me.status_redeem_failed=cwsRenderObj.status_redeem_failed;me.initialize=function(){me.redeemListLimit=!1}
me.render=function(list,newBlockTag,passedData,options)
{if(list==='redeemList')
{if(options)
{me.options=options}
if(newBlockTag)
{me.newBlockTag=newBlockTag}
me.redeemList_Display(me.newBlockTag);FormUtil.setUpTabAnchorUI(me.newBlockTag.find('ul.tab__content_act'));if(FormUtil.dcdConfig&&FormUtil.dcdConfig.favList)
{me.setFloatingListMenuIconEvents(me.newBlockTag.find('.floatListMenuIcon'),me.newBlockTag.find('.floatListMenuSubIcons'))}
else{me.newBlockTag.find('.floatListMenuIcon').hide()}}}
me.redeemList_Display=function(blockTag)
{var jsonStorageData=DataManager.getOrCreateData(me.storageName_RedeemList);me.renderRedeemList(jsonStorageData.list,blockTag)}
me.renderRedeemList=function(redeemList,blockTag)
{$(window).scrollTop(0);blockTag.find('div.listDiv').remove();$('#listTemplateDiv > div.listDiv').clone().appendTo(blockTag);var listUlLiActiveTag=blockTag.find('li.active');var listContentUlTag=blockTag.find('.tab__content_act');me.redeemListTargetTag=listContentUlTag;if(redeemList)
{me.redeemList=redeemList.filter(a=>a.owner==FormUtil.login_UserName);if(me.options&&me.options.filter)
{for(var o=0;o<me.options.filter.length;o++)
{var filterObj=me.options.filter[o];var keys=Object.keys(filterObj);var keyValue=filterObj[keys[0]];me.redeemList=redeemList.filter(a=>a[keys[0]]==keyValue)}}(me.redeemList).sort(function(a,b){var a1st=-1,b1st=1,equal=0;if(b.created>a.created){return b1st}
else if(a.created>b.created){return a1st}
else{return equal}});if(me.lastRedeemDate)me.redeemList=me.redeemList.filter(a=>a.created<me.lastRedeemDate);if(me.redeemList===undefined||me.redeemList.length==0)
{var liTag=$('<li class="emptyListLi"></li>');var spanTag=$('<a class="expandable" style="min-height: 60px; padding: 10px; color: #888;" term="'+Util.termName_listEmpty+'">List is empty.</a>');liTag.append(spanTag);listContentUlTag.append(liTag)}
else{me.cwsRenderObj.pulsatingProgress.show();me.redeemListScrollLimit=me.redeemList.length;if(parseInt(me.redeemListScrollCount)<me.redeemListScrollLimit)
{if(me.redeemListScrollExists==0)
{document.addEventListener('scroll',function(event){me.evalScrollOnBottom()},!0);me.redeemListScrollExists=1;me.evalScrollOnBottom()}}
else{me.redeemListLimit=!0;document.removeEventListener('scroll',me.evalScrollOnBottom());me.redeemListScrollExists=0}
setTimeout(function(){me.cwsRenderObj.pulsatingProgress.hide()},500)}}
else{var liTag=$('<li class="emptyListLi"></li>');var spanTag=$('<a class="expandable" style="min-height: 60px; padding: 10px; color: #888;"><br>&nbsp;<label class="from-string titleDiv" term="'+Util.termName_listEmpty+'">List is empty.</label></a>');liTag.append(spanTag);listContentUlTag.append(liTag)}}
me.evalScrollOnBottom=function()
{if(!me.redeemListLimit&&$('div.listDiv').is(':visible'))
{if(($(window).scrollTop()+$(window).height()+85)>$(document).height())
{if(me.redeemListScrollingState==0)
{me.cwsRenderObj.pulsatingProgress.show();me.redeemListScrollingState=1;setTimeout(function(){me.appendRedeemListOnScrollBottom()},500)}}}}
me.appendRedeemListOnScrollBottom=function()
{if(me.lastRedeemDate)me.redeemList=me.redeemList.filter(a=>a.created<me.lastRedeemDate);for(var i=0;((i<me.redeemList.length)&&(i<parseInt(me.redeemListScrollSize)));i++)
{me.lastRedeemDate=me.redeemList[i].created;me.renderRedeemListItemTag(me.redeemList[i],me.redeemListTargetTag);me.redeemListScrollCount+=1}
FormUtil.setUpTabAnchorUI(me.newBlockTag.find('ul.tab__content_act'),'.expandable','click');if(parseInt(me.redeemListScrollCount)==parseInt(me.redeemListScrollLimit))
{me.redeemListLimit=!0;document.removeEventListener('scroll',me.evalScrollOnBottom());me.redeemListScrollExists=0}
me.cwsRenderObj.pulsatingProgress.hide();me.redeemListScrollingState=0}
me.renderRedeemListItemTag=function(itemData,listContentUlTag)
{var bIsMobile=Util.isMobi();var itemAttrStr='itemId="'+itemData.id+'"';var liContentTag=$('<li '+itemAttrStr+'></li>');var anchorTag=$('<a class="expandable" '+itemAttrStr+' style="'+(!bIsMobile?'padding:4px;':'')+'"></a>');var dateTimeStr=$.format.date(itemData.created,"dd MMM yyyy - HH:mm ");if(FormUtil.dcdConfig.settings&&FormUtil.dcdConfig.settings&&FormUtil.dcdConfig.settings.redeemDefs&&FormUtil.dcdConfig.settings.redeemDefs.activityTypes)
{var activityType=FormUtil.getActivityType(itemData);var statusOpt=FormUtil.getStatusOpt(itemData);if(statusOpt)
{var blockListItemTag=$('<div class="icon-row listItem" />');var tblObj=$('<table id="listItem_table_'+itemData.id+'" style="width:100%;border-spacing:0;'+(!bIsMobile?'padding:4px;':'')+'">');var trObj1=$('<tr>');var tdDragObj=$('<td id="listItem_selector_drag_'+itemData.id+'" rowspan=2 class="" style="'+(bIsMobile?'width:15px;':'width:2px;')+'opacity:0.65;vertical-align:top;" ><div style="overflow-y:hidden;'+(bIsMobile?'width:15px;':'')+'" class="'+(bIsMobile?'dragSelector whitecarbon':'')+' listItem">&nbsp;</div></td>');var tdIconObj=$('<td id="listItem_icon_activityType_'+itemData.id+'" rowspan=2 style="" >');var tdDataPreviewObj=$('<td id="listItem_data_preview_'+itemData.id+'" rowspan=2 style="vertical-align:top;padding:6px 2px;white-space:nowrap;" >');var tdVoucherIdObj=$('<td id="listItem_voucher_code_'+itemData.id+'" rowspan=2 style="vertical-align:top;padding:6px 2px 0 0;" >');var tdActionSyncObj=$('<td id="listItem_action_sync_'+itemData.id+'" style="width:50px;position:relative;top:-2px;" >');var labelDtm=$('<div style="font-weight:400;padding:0 2px">'+dateTimeStr+'</div>');tblObj.append(trObj1);trObj1.append(tdDragObj);trObj1.append(tdIconObj);trObj1.append(tdDataPreviewObj);trObj1.append(tdVoucherIdObj);trObj1.append(tdActionSyncObj);tblObj.append(trObj1);blockListItemTag.append(tblObj);tdDataPreviewObj.append(labelDtm);FormUtil.appendActivityTypeIcon(tdIconObj,activityType,statusOpt,me.cwsRenderObj)}
else{var blockListItemTag=$('<div class="icon-row"><img src="img/act.svg">'+dateTimeStr+'</div>')}}
else{var blockListItemTag=$('<div class="icon-row"><img src="img/act.svg">'+dateTimeStr+'</div>')}
var expandArrowTag=$('<div class="icon-arrow listExpand"><img class="expandable-arrow" src="img/arrow_down.svg" style="width:24px;height:24px;position:relative;top:-2px;"></div>');var trObj2=$('<tr id="listItem_trExpander_'+itemData.id+'">');tblObj.append(trObj2);var tdExpandObj=$('<td id="listItem_expand_'+itemData.id+'" rowspan=1 >');trObj2.append(tdExpandObj);tdExpandObj.append(expandArrowTag);var previewDivTag=me.getListDataPreview(itemData.data.payloadJson,activityType.previewData)
tdDataPreviewObj.append(previewDivTag);var voucherTag=$('<div class="act-r">'+((itemData.data.payloadJson.voucherCode)?itemData.data.payloadJson.voucherCode:'~ pending')+'<br>'+itemData.activityType+'</div>');tdVoucherIdObj.append(voucherTag);var statusSecDivTag=$('<div class="icons-status"><small  class="syncIcon"><img src="img/sync-n.svg" id="listItem_icon_sync_'+itemData.id+'" style="width:24px;height:24px;"></small></div>');tdActionSyncObj.append(statusSecDivTag);var contentDivTag=$('<div class="act-l" id="listItem_networkResults_'+itemData.id+'" style="font-weight:400;"></div>');contentDivTag.append('<span '+FormUtil.getTermAttr(itemData)+'>'+itemData.title+'</span>');me.setContentDivClick(contentDivTag);anchorTag.append(blockListItemTag);anchorTag.append(contentDivTag);liContentTag.append(anchorTag);listContentUlTag.append(liContentTag);me.populateData_RedeemItemTag(itemData,liContentTag)}
me.getListDataPreview=function(payloadJson,previewData)
{if(previewData)
{var dataRet=$('<div class="previewData" style="float:left;padding:4px;"></div>');for(var i=0;i<previewData.length;i++)
{var dat=me.mergePreviewData(previewData[i],payloadJson);dataRet.append($('<div class="" style="padding-right: 2px;">'+dat+'</div>'))}}
return dataRet}
me.mergePreviewData=function(previewField,Json)
{var ret='';var flds=previewField.split(' ');if(flds.length)
{for(var f=0;f<flds.length;f++)
{for(var key in Json)
{if(flds[f]==key&&Json[key])
{ret+=flds[f]+' ';ret=ret.replace(flds[f],Json[key])}}}}
else{if(previewField.length)
{ret=previewField;for(var key in Json)
{if(previewField==key&&Json[key])
{ret=ret.replace(previewField,Json[key])}}}}
return ret}
me.populateData_RedeemItemTag=function(itemData,itemLiTag)
{var statusSecDivTag=itemLiTag.find('div.icons-status');FormUtil.setStatusOnTag(statusSecDivTag,itemData,me.cwsRenderObj);me.submitButtonListUpdate(statusSecDivTag,itemLiTag,itemData)}
me.setContentDivClick=function(contentDivTag)
{contentDivTag.click(function(){contentDivClickedTag=$(this);var itemId=contentDivClickedTag.attr('itemId');var itemClicked=Util.getFromList(me.redeemList,itemId,"id")})}
me.submitButtonListUpdate=function(statusSecDivTag,itemLiTag,itemData)
{if(itemData.status!=me.status_redeem_submit)
{var imgSyncIconTag=statusSecDivTag.find('small.syncIcon img');imgSyncIconTag.click(function(e){var bProcess=!1;var fetchItemData=DataManager.getItemFromData(me.cwsRenderObj.storageName_RedeemList,itemData.id)
if(!fetchItemData.networkAttempt)
{if(!ConnManager.networkSyncConditions)
{MsgManager.notificationMessage('Currently offline. Network must be online for this.','notificationDark',undefined,'','right','top',undefined,undefined,undefined,'OfflineSyncWarning')}
else{bProcess=!0}}
else{if(fetchItemData.networkAttempt<me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit)
{bProcess=!0}
else{MsgManager.msgAreaShow('Network upload FAIL LIMIT exceeded: '+me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit)}}
if(bProcess)
{if(DataManager.getItemFromData(me.cwsRenderObj.storageName_RedeemList,itemData.id).syncActionStarted==0)
{var mySyncIcon=$(this);var dtmRedeemAttempt=(new Date()).toISOString();mySyncIcon.rotate({count:999,forceJS:!0,startDeg:0});fetchItemData.lastAttempt=dtmRedeemAttempt;var redeemID=mySyncIcon.attr('id').replace('listItem_icon_sync_','');var myTag=$('#listItem_networkResults_'+redeemID);var loadingTag=$('<div class="loadingImg" style="display: inline-block; margin-left: 8px;">Connecting... </div>');myTag.empty();myTag.append(loadingTag);e.stopPropagation();if(ConnManager.isOffline())
{MsgManager.notificationMessage('Currently in offline.  Need to be in online for this.','notificationDark',undefined,'','right','top',undefined,undefined,undefined,'OfflineSyncWarning');myTag.html(fetchItemData.title);$(this).stop()}
else{FormUtil.submitRedeem(fetchItemData.data.url,fetchItemData.data.payloadJson,fetchItemData.data.actionJson,loadingTag,function(success,returnJson)
{var itmHistory=fetchItemData.history;mySyncIcon.stop();fetchItemData.returnJson=returnJson;if(fetchItemData.networkAttempt)fetchItemData.networkAttempt+=1;else fetchItemData.networkAttempt=1;if(success&&(returnJson.resultData.status!='fail'))
{var dtmRedeemDate=(new Date()).toISOString();fetchItemData.redeemDate=dtmRedeemDate;fetchItemData.status=me.status_redeem_submit;myTag.html('Success')}
else{if(returnJson&&returnJson.displayData&&(returnJson.displayData.length>0))
{var msg=JSON.parse(returnJson.displayData[0].value).msg;fetchItemData.title=msg.toString().replace(/--/g,'<br>')}
if(fetchItemData.networkAttempt>=me.cwsRenderObj.storage_offline_ItemNetworkAttemptLimit)
{fetchItemData.status=me.status_redeem_failed}
myTag.html('Error redeeming')}
if(returnJson)
{itmHistory.push({"syncType":"item-icon-Click","syncAttempt":dtmRedeemAttempt,"success":success,"restultStatus":returnJson.resultData.status,"returnJson":returnJson})}
else{itmHistory.push({"syncType":"item-icon-Click","syncAttempt":dtmRedeemAttempt,"success":success})}
FormUtil.setStatusOnTag(itemLiTag.find('div.icons-status'),fetchItemData,me.cwsRenderObj);fetchItemData.history=itmHistory;DataManager.updateItemFromData(me.storageName_RedeemList,fetchItemData.id,fetchItemData);setTimeout(function(){myTag.html(fetchItemData.title+' >> '+fetchItemData.lastAttempt);FormUtil.appendActivityTypeIcon($('#listItem_icon_activityType_'+fetchItemData.id),FormUtil.getActivityType(fetchItemData),FormUtil.getStatusOpt(fetchItemData),me.cwsRenderObj)},1000)})}}}})}}
me.redeemList_Add=function(submitJson,status)
{var dateTimeStr=(new Date()).toISOString();var tempJsonData={};tempJsonData.title=((submitJson.payloadJson.voucherCode)?"Voucher: "+submitJson.payloadJson.voucherCode+" - ":"")+dateTimeStr;tempJsonData.created=dateTimeStr;tempJsonData.owner=FormUtil.login_UserName;tempJsonData.id=Util.generateRandomId();tempJsonData.status=status;tempJsonData.archived=0;tempJsonData.network=ConnManager.getAppConnMode_Online();tempJsonData.data=submitJson;tempJsonData.activityType=me.lastActivityType(ActivityUtil.getActivityList(),'eVoucher');tempJsonData.activityList=ActivityUtil.getActivityList();tempJsonData.syncActionStarted=0;tempJsonData.history=[];ga('send',{'hitType':'event','eventCategory':'redeemList_Add','eventAction':FormUtil.gAnalyticsEventAction(),'eventLabel':FormUtil.gAnalyticsEventLabel()});DataManager.insertDataItem(me.storageName_RedeemList,tempJsonData)}
me.redeemList_Reload=function(listItemTag)
{var blockTag=listItemTag.closest('div.block');blockTag.find('div.redeemListDiv').remove();me.redeemList_Display(blockTag)}
me.updateDivStatusColor=function(status,divTag)
{var divBgColor="";if(status===me.status_redeem_submit)divBgColor='LightGreen';else if(status===me.status_redeem_queued)divBgColor='LightGray';else if(status===me.status_redeem_failed)divBgColor='Tomato';if(divBgColor!="")divTag.css('background-color',divBgColor)}
me.lastActivityType=function(json,defVal)
{if(json)
{for(var i=json.length;i--;)
{if(json[i].defJson&&json[i].defJson.activityType)
{return json[i].defJson.activityType}}}
else{return defVal}}
me.setFloatingListMenuIconEvents=function(iconTag,SubIconListTag)
{FormUtil.setClickSwitchEvent(iconTag,SubIconListTag,['on','off'],me.cwsRenderObj)}
me.initialize()}