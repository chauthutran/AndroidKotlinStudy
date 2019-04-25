function Block(cwsRenderObj,blockJson,blockId,parentTag,passedData,options)
{var me=this;me.cwsRenderObj=cwsRenderObj;me.blockType=(blockJson)?blockJson.blockType:undefined;me.blockJson=blockJson;me.blockId=blockId;me.blockUid=Util.generateTimedUid();me.parentTag=parentTag;me.passedData=passedData;me.options=options;me.blockTag;me.actionObj;me.validationObj;me.blockFormObj;me.blockListObj;me.dataListObj;me.blockButtonObj;me.blockMsgObj;me.blockButtonListObj;me.initialize=function()
{me.setInitialData();me.createSubClasses()}
me.render=function()
{if(me.blockJson)
{if(me.blockJson.form)me.blockFormObj.render(me.blockJson.form,me.blockTag,me.passedData);if(me.blockJson.list==='redeemList')me.blockListObj.render(me.blockJson.list,me.blockTag,me.passedData,me.options);else if(me.blockJson.list==='dataList')me.dataListObj.render(me.blockJson,me.blockTag,me.passedData,me.options);if(me.blockJson.buttons)me.blockButtonObj.render(me.blockJson.buttons,me.blockTag,undefined);if(me.blockJson.message)me.blockMsgObj.render(me.blockJson.message,me.blockTag,me.passedData)}
me.cwsRenderObj.langTermObj.translatePage()}
me.setInitialData=function()
{me.cwsRenderObj.blocks[me.blockUid]=me;me.cwsRenderObj.blocks[me.blockId]=me;if(me.blockJson)me.blockType=me.blockJson.blockType;me.blockTag=me.createBlockTag(me.blockId,me.blockType,me.parentTag)}
me.createSubClasses=function()
{me.actionObj=new Action(me.cwsRenderObj,me);me.validationObj=new Validation(me.cwsRenderObj,me);me.blockFormObj=new BlockForm(me.cwsRenderObj,me);me.blockListObj=new BlockList(me.cwsRenderObj,me);me.dataListObj=new DataList(me.cwsRenderObj,me);me.blockButtonObj=new BlockButton(me.cwsRenderObj,me);me.blockMsgObj=new BlockMsg(me.cwsRenderObj,me)}
me.createBlockTag=function(blockId,blockType,parentTag)
{var blockTag=$('<div class="block" blockId="'+blockId+'"></div>');blockTag.addClass(blockType);if(!(me.options&&me.options.notClear))
{parentTag.find('div.block').remove()}
parentTag.append(blockTag.addClass('blockStyle'));return blockTag}
me.hideBlock=function()
{me.blockTag.hide()}
me.initialize()}