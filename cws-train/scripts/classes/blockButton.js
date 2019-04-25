function BlockButton(cwsRenderObj,blockObj)
{var me=this;me.cwsRenderObj=cwsRenderObj;me.blockObj=blockObj;me.initialize=function(){}
me.render=function(buttonsJson,blockTag,passedData)
{if(buttonsJson!==undefined)
{var btnHolderTag;btnDivSecTag=$('<div class="btnDivSec"></div>');blockTag.append(btnDivSecTag);btnHolderTag=btnDivSecTag;if(me.blockObj.blockType===FormUtil.blockType_MainTab)
{var ulTagTag=$('<ul class="tabs"></ul>');btnDivSecTag.append(ulTagTag);var ulContentTag=$('<ul class="tab_content"></ul>');btnDivSecTag.append(ulContentTag);for(var i=0;i<buttonsJson.length;i++)
{var tabNo=i+1;var liTabTag=$('<li tabId="'+tabNo+'"></li>');var liContentTag=$('<li tabId="'+tabNo+'" class="list-item" style="display: list-item"><a class="expandable"></a></li>');ulTagTag.append(liTabTag);ulContentTag.append(liContentTag)}}
else if(me.blockObj.blockType===FormUtil.blockType_MainTabContent)
{btnHolderTag=blockTag.find('.formDivSec')}
else{}
for(var i=0;i<buttonsJson.length;i++)
{me.renderBlockButton(i+1,buttonsJson[i],btnHolderTag,passedData)}
if(me.blockObj.blockType===FormUtil.blockType_MainTab)
{FormUtil.setUpTabAnchorUI(btnHolderTag);setTimeout(function()
{var lastTab=FormUtil.getUserLastSelectedTab();if(lastTab)
{btnHolderTag.find('li')[lastTab-1].click()}
else{btnHolderTag.find('li:first-child').click()}},100)}}}
me.renderBlockButton=function(btnNo,btnData,divTag,passedData)
{var btnJson=FormUtil.getObjFromDefinition(btnData,me.cwsRenderObj.configJson.definitionButtons);var btnTag=me.generateBtnTag(btnNo,btnJson,btnData,divTag);if(me.blockObj.blockType!==FormUtil.blockType_MainTab)
{me.setUpBtnClick(btnTag,btnJson,passedData);divTag.append(btnTag)}
else{btnTag.click(function(){var liContentTag=divTag.find('ul.tab_content li[tabId="'+btnNo+'"]');liContentTag.find('div.block').remove();me.renderBlockTabContent(liContentTag,btnJson.onClick)})}}
me.generateBtnTag=function(btnNo,btnJson,btnData,divTag)
{var btnTag;if(btnJson!==undefined)
{if(btnJson.buttonType==='radioButton')
{{btnTag=$('<div style="padding:14px;" class=""><input type="radio" class="stayLoggedIn" style="width: 1.4em; height: 1.4em;">'+'<span '+FormUtil.getTermAttr(btnJson)+' style="vertical-align: top; margin-left: 5px; ">'+btnJson.defaultLabel+'</span></div>')}}
else if(btnJson.buttonType==='imageButton')
{if(me.blockObj.blockType===FormUtil.blockType_MainTab)
{var liTabTag=divTag.find('ul.tabs li[tabId="'+btnNo+'"]');var aContentTag=divTag.find('ul.tab_content li[tabId="'+btnNo+'"] a.expandable');liTabTag.append($('<img src="'+btnJson.imageSrc+'" class="tab-image"><label '+FormUtil.getTermAttr(btnJson)+'>'+btnJson.defaultLabel+'</label>'));aContentTag.append($('<div class="icon-row"><img src="'+btnJson.imageSrc+'"><span '+FormUtil.getTermAttr(btnJson)+'>'+btnJson.defaultLabel+'</span></div>'));aContentTag.append($('<div class="icon-arrow"><img class="expandable-arrow" src="img/arrow_down.svg"></div>'));btnTag=aContentTag}
else{btnTag=$('<div class="btnType '+btnJson.buttonType+'"><img src="'+btnJson.imageSrc+'"></div>')}}
else if(btnJson.buttonType==='textButton')
{if(me.blockObj.blockType===FormUtil.blockType_MainTabContent)
{btnTag=$('<div '+FormUtil.getTermAttr(btnJson)+' class="tb-content-buttom btn divBtn">'+btnJson.defaultLabel+'</div>')}
else{btnTag=$('<button '+FormUtil.getTermAttr(btnJson)+' ranid="'+Util.generateRandomId()+'" class="tb-content-buttom '+btnJson.buttonType+'" btnNo="'+btnNo+'">'+btnJson.defaultLabel+'</button>')}}
else if(btnJson.buttonType==='listRightImg')
{btnTag=$('<img src="'+btnJson.img+'" style="cursor: pointer;" ranid="'+Util.generateRandomId()+'" class="btnType '+btnJson.buttonType+'" btnNo="'+btnNo+'">')}}
if(btnTag===undefined)
{var caseNA=(btnData!==undefined&&typeof btnData==='string')?btnData:"NA";btnTag=$('<div class="btnType unknown">'+caseNA+'</div>')}
return btnTag}
me.setUpBtnClick=function(btnTag,btnJson,passedData)
{if(btnJson&&btnTag)
{if(btnJson.onClick!==undefined)
{btnTag.click(function()
{ActivityUtil.addAsActivity('block',me.blockObj.blockJson,me.blockObj.blockId);if(btnJson.buttonType==='listRightImg')
{var loadingTag=$('<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading.gif"></div>');btnTag.hide();btnTag.parent().append(loadingTag)}
me.blockObj.actionObj.handleClickActions($(this),btnJson.onClick)})}
else if(btnJson.onClickItem!==undefined)
{btnTag.click(function()
{ActivityUtil.addAsActivity('block',me.blockObj.blockJson,me.blockObj.blockId);if(btnJson.buttonType==='listRightImg')
{var parentDiv=btnTag.parent().parent().parent().parent().parent()[0];for(var i=0;i<parentDiv.children.length;i++)
{let tbl=parentDiv.children[i];if(tbl!=btnTag.parent().parent().parent().parent()[0])
{$(tbl).css('opacity','0.4')}}
var loadingTag=$('<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading.gif"></div>');btnTag.hide();btnTag.parent().append(loadingTag)}
var idx=$(this).closest(".itemBlock").attr("idx");me.blockObj.actionObj.handleItemClickActions($(this),btnJson.onClickItem,idx)})}}}
me.renderBlockTabContent=function(liContentTag,onClick)
{if(onClick&&onClick.length>0)
{var actionJsonArr=FormUtil.convertNamedJsonArr(onClick,me.cwsRenderObj.configJson.definitionActions);var actionJson=Util.getFromList(actionJsonArr,'openBlock','actionType');if(actionJson&&actionJson.blockId!==undefined)
{var blockJson=FormUtil.getObjFromDefinition(actionJson.blockId,me.cwsRenderObj.configJson.definitionBlocks);var newBlockObj=new Block(me.cwsRenderObj,blockJson,actionJson.blockId,liContentTag);newBlockObj.render()}}}
me.initialize()}