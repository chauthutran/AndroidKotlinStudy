function Action(cwsRenderObj,blockObj)
{var me=this;me.cwsRenderObj=cwsRenderObj;me.blockObj=blockObj;me.renderBlockTag=cwsRenderObj.renderBlockTag;me.initialize=function(){}
me.handleClickActions=function(btnTag,btnOnClickActions)
{var blockDivTag=btnTag.closest('.block');var formDivSecTag=blockDivTag.find('.formDivSec');if(me.blockObj.validationObj.checkFormEntryTagsData(formDivSecTag))
{var dataPass={};if(!me.btnClickedAlready(btnTag))
{me.btnClickMarked(btnTag);me.handleActionsInSync(blockDivTag,formDivSecTag,btnTag,btnOnClickActions,0,dataPass,undefined,function(finalPassData){me.clearBtn_ClickedMark(btnTag)})}
else{}}}
me.handleItemClickActions=function(btnTag,btnOnClickActions,itemIdx)
{var blockDivTag=btnTag.closest('div.block');var itemBlockTag=btnTag.closest('.itemBlock');if(me.blockObj.validationObj.checkFormEntryTagsData(itemBlockTag))
{var dataPass={};if(!me.btnClickedAlready(btnTag))
{me.handleActionsInSync(blockDivTag,itemBlockTag,btnTag,btnOnClickActions,0,dataPass,undefined,function(finalPassData){me.clearBtn_ClickedMark(btnTag)})}
else{console.log('Btn already clicked/in process')}}}
me.handleActionsInSync=function(blockDivTag,formDivSecTag,btnTag,actions,actionIndex,dataPass,blockPassingData,endOfActionsFunc)
{if(actionIndex>=actions.length)endOfActionsFunc(dataPass);else{me.actionPerform(actions[actionIndex],blockDivTag,formDivSecTag,btnTag,dataPass,blockPassingData,function(resultStr)
{if(resultStr!=="actionFailed")
{actionIndex++;me.handleActionsInSync(blockDivTag,formDivSecTag,btnTag,actions,actionIndex,dataPass,blockPassingData,endOfActionsFunc)}
else{console.log('Action Failed.  Actions processing stopped at Index '+actionIndex);endOfActionsFunc(dataPass)}})}}
me.actionPerform=function(actionDef,blockDivTag,formDivSecTag,btnTag,dataPass,blockPassingData,afterActionFunc)
{var clickActionJson=FormUtil.getObjFromDefinition(actionDef,me.cwsRenderObj.configJson.definitionActions);ActivityUtil.addAsActivity('action',clickActionJson,actionDef);if(clickActionJson)
{if(clickActionJson.actionType==="evaluation")
{blockPassingData.displayData=me.blockObj.dataListObj.actionEvaluateExpression(blockPassingData.displayData,clickActionJson);if(afterActionFunc)afterActionFunc()}
else if(clickActionJson.actionType==="clearOtherBlocks")
{var currBlockId=blockDivTag.attr('blockId');me.renderBlockTag.find('div.block').not('[blockId="'+currBlockId+'"]').remove();if(afterActionFunc)afterActionFunc()}
else if(clickActionJson.actionType==="closeBlock")
{if(clickActionJson.closeLevel!==undefined)
{var closeLevel=Util.getNum(clickActionJson.closeLevel);var divBlockTotal=me.renderBlockTag.find('div.block:visible').length;var currBlock=blockDivTag;for(var i=0;i<divBlockTotal;i++)
{var tempPrevBlock=currBlock.prev('div.block');if(closeLevel>=i)
{currBlock.remove()}
else break;currBlock=tempPrevBlock}}
else if(clickActionJson.blockId!=undefined)
{me.renderBlockTag.find("[blockid='"+clickActionJson.blockId+"']").remove()}
if(afterActionFunc)afterActionFunc()}
else if(clickActionJson.actionType==="hideBlock")
{me.blockObj.hideBlock();if(afterActionFunc)afterActionFunc()}
else if(clickActionJson.actionType==="openBlock")
{if(clickActionJson.blockId!==undefined)
{var blockJson=FormUtil.getObjFromDefinition(clickActionJson.blockId,me.cwsRenderObj.configJson.definitionBlocks);if(blockPassingData===undefined)blockPassingData={};blockPassingData.showCase=clickActionJson.showCase;blockPassingData.hideCase=clickActionJson.hideCase;me.blockObj.hideBlock();var newBlockObj=new Block(me.cwsRenderObj,blockJson,clickActionJson.blockId,me.blockObj.parentTag,blockPassingData,{'notClear':!0});newBlockObj.render()}
if(afterActionFunc)afterActionFunc()}
else if(clickActionJson.actionType==="openArea")
{if(clickActionJson.areaId)
{me.cwsRenderObj.renderArea(clickActionJson.areaId)}
if(afterActionFunc)afterActionFunc()}
else if(clickActionJson.actionType==="filledData")
{var dataFromDivTag=me.renderBlockTag.find("[blockid='"+clickActionJson.fromBlockId+"']");var dataToDivTag=me.renderBlockTag.find("[blockid='"+clickActionJson.toBlockId+"']");var dataItems=clickActionJson.dataItems;for(var i=0;i<dataItems.length;i++)
{var value=dataFromDivTag.find("[name='"+dataItems[i]+"']").val()
dataToDivTag.find("[name='"+dataItems[i]+"']").val(value)}
if(afterActionFunc)afterActionFunc()}
else if(clickActionJson.actionType==="alertMsg")
{if(clickActionJson.messageClass)
{MsgManager.notificationMessage(clickActionJson.message,clickActionJson.messageClass,undefined,'','right','top')}
else{MsgManager.notificationMessage(clickActionJson.message,'notificationDark',undefined,'','right','top')}
if(afterActionFunc)afterActionFunc()}
else if(clickActionJson.actionType==="topNotifyMsg")
{if(clickActionJson.messageClass)
{MsgManager.notificationMessage(me.cwsRenderObj.langTermObj.translateText(clickActionJson.message,clickActionJson.term),clickActionJson.messageClass,undefined,'','right','top')}
else{MsgManager.notificationMessage(me.cwsRenderObj.langTermObj.translateText(clickActionJson.message,clickActionJson.term),'notificationDark',undefined,'','right','top')}
if(afterActionFunc)afterActionFunc()}
else if(clickActionJson.actionType==="processWSResult")
{var statusActionsCalled=!1;var wsReplyData=dataPass.prevWsReplyData;if(wsReplyData&&wsReplyData.resultData&&clickActionJson.resultCase)
{var statusActions=clickActionJson.resultCase[wsReplyData.resultData.status];if(statusActions&&statusActions.length>0)
{statusActionsCalled=!0;var dataPass_Status={};me.handleActionsInSync(blockDivTag,formDivSecTag,btnTag,statusActions,0,dataPass_Status,wsReplyData,function(finalPassData){if(afterActionFunc)afterActionFunc()})}}
if(!statusActionsCalled&&afterActionFunc)afterActionFunc()}
else if(clickActionJson.actionType==="sendToWS")
{var currBlockId=blockDivTag.attr('blockId');var inputsJson=FormUtil.generateInputJson(formDivSecTag,clickActionJson.payloadBody);var inputTargJson=FormUtil.generateInputTargetPayloadJson(formDivSecTag,clickActionJson.payloadBody);FormUtil.setLastPayload(inputTargJson)
if(clickActionJson.voucherStatus)
{inputsJson.voucherStatus=clickActionJson.voucherStatus}
var url=FormUtil.generateUrl(inputsJson,clickActionJson);if(url!==undefined)
{var submitJson={};submitJson.payloadJson=inputsJson;submitJson.url=url;submitJson.actionJson=clickActionJson;if(clickActionJson.redeemListInsert==="true")
{{me.blockObj.blockListObj.redeemList_Add(submitJson,me.blockObj.blockListObj.status_redeem_queued)}
dataPass.prevWsReplyData={'resultData':{'status':'queued '+ConnManager.getAppConnMode_Online()}};if(afterActionFunc)afterActionFunc()}
else if(clickActionJson.url!==undefined)
{var url=FormUtil.generateUrl(inputsJson,clickActionJson);var loadingTag=FormUtil.generateLoadingTag(btnTag);if(clickActionJson.redeemListInsert==="true")
{me.blockObj.blockListObj.redeemList_Add(submitJson,me.blockObj.blockListObj.status_redeem_submit)}
FormUtil.submitRedeem(url,inputsJson,clickActionJson,loadingTag,function(success,redeemReturnJson){if(!redeemReturnJson)redeemReturnJson={};var resultStr="success";if(success)
{dataPass.prevWsReplyData=redeemReturnJson}
else{console.log(redeemReturnJson);MsgManager.notificationMessage('Process Failed!!','notificationDark',undefined,'','right','top');var resultStr="actionFailed"}
if(afterActionFunc)afterActionFunc(resultStr)})}}}}}
me.btnClickedAlready=function(btnTag)
{return btnTag.hasClass('clicked')}
me.btnClickMarked=function(btnTag)
{btnTag.addClass('clicked')}
me.clearBtn_ClickedMark=function(btnTag)
{btnTag.removeClass('clicked')}}