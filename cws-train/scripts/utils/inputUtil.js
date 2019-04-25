function inputMonitor(cwsRenderObj)
{var me=this;var cwsRenderInputMon=cwsRenderObj;document.addEventListener("touchstart",startTouch,!1);document.addEventListener("touchmove",moveTouch,!1);document.addEventListener("touchend",touchEnd,!1);var screenWidth=document.body.clientWidth;var screenHeight=document.body.clientHeight;var initialX=null;var initialY=null;var navDrawerVisibleOnStart=!1;var navDrawerVisibleOnMove=!1;var expectedNavDrawerWidth=0;var thresholdNavDrawerWidth=0;var loggedIn=!1;var trackX=0;var trackY=0;var currentX=null;var currentY=null;var diffX=null;var diffY=null;var dragXoffsetLimit=0;var startTouchTargetTag;var startTouchParentTag;var startTouchTargetWidth;var listItemFillerBlock;var listItemDragEnabled=!1;var startTagRedeemListItem=!1;var listItemWasExpanded=!1;function startTouch(e)
{me.initialiseTouchDefaults(e);if(startTagRedeemListItem)
{me.initialiseListItemVars()}
me.detectFocusRelegatorInitialState();cwsRenderInputMon.updateNavDrawerHeaderContent()};function moveTouch(e)
{if(!loggedIn||(initialX===null)||(initialY===null)||(e.touches[0].clientX==null))
{return}
me.updateMoveTouchVars(e);if(startTouchTargetTag&&startTagRedeemListItem)
{me.moveListItem()}
else{me.moveNavDrawer()}};function touchEnd(e)
{if(startTagRedeemListItem)
{me.touchEndListItem(e)}
else{me.toucheEndNavDrawer(e)}
initialX=null;initialY=null;trackX=0;trackY=0};me.initialiseTouchDefaults=function(e)
{initialX=e.touches[0].clientX;initialY=e.touches[0].clientY;startTouchTargetTag=undefined;startTouchParentTag=undefined;listItemFillerBlock=undefined;startTouchTargetWidth=0;listItemDragEnabled=!1;startTagRedeemListItem=!1;listItemWasExpanded=!1;navDrawerVisibleOnMove=!1;loggedIn=FormUtil.checkLogin();expectedNavDrawerWidth=FormUtil.navDrawerWidthLimit(screenWidth);navDrawerVisibleOnStart=$('#navDrawerDiv').is(':visible');thresholdNavDrawerWidth=(expectedNavDrawerWidth/2).toFixed(0);if($('div.floatListMenuIcon').is(':visible'))
{dragXoffsetLimit=$('ul.tab__content_act').offset().left;if(initialX<dragXoffsetLimit&&!navDrawerVisibleOnStart)
{listItemDragEnabled=!1}
else{listItemDragEnabled=!0}}
else{dragXoffsetLimit=50;listItemDragEnabled=!1}
if(!listItemDragEnabled&&$('div.floatListMenuSubIcons').is(':visible'))
{$('div.floatListMenuIcon').css('zIndex',1);$('div.floatListMenuIcon').click()}
if(listItemDragEnabled&&initialX>=dragXoffsetLimit)
{startTagRedeemListItem=$(e.touches[0].target).hasClass('dragSelector');if(startTagRedeemListItem)
{startTouchTargetTag=$(e.touches[0].target).closest('a');startTouchTargetWidth=$(startTouchTargetTag).width()}}
if($('#navDrawerDiv').hasClass('transitionSmooth'))
{$('#navDrawerDiv').removeClass('transitionSmooth');$('#navDrawerDiv').addClass('transitionRapid')}}
me.detectFocusRelegatorInitialState=function()
{if($('#focusRelegator').is(':visible')&&$('#navDrawerDiv').css('zIndex')<$('#focusRelegator').css('zIndex'))
{$('#navDrawerDiv').css('zIndex',$('#focusRelegator').css('zIndex'));$('#focusRelegator').css('zIndex',($('#navDrawerDiv').css('zIndex')-1))}}
me.initialiseListItemVars=function()
{startTouchParentTag=$(startTouchTargetTag).parent();listItemFillerBlock=$('<a id="filler_'+startTouchTargetTag.attr('itemid')+'" class="expandable" style="z-Index: 0;" />');$(listItemFillerBlock).css('height',$(startTouchTargetTag).innerHeight());$(listItemFillerBlock).css('background-color','rgba(0, 0, 0, 0)');$(listItemFillerBlock).css('zIndex',($(startTouchTargetTag).css('zIndex')-1));$(startTouchTargetTag).attr('initBorderBottomColor',$(startTouchTargetTag).css('border-bottom-color'));$(startTouchTargetTag).attr('initTop',$(startTouchTargetTag).offset().top);$(startTouchTargetTag).attr('initLeft',$(startTouchTargetTag).offset().left);$(startTouchTargetTag).attr('initZindex',$(startTouchTargetTag).css('zIndex'));$(startTouchTargetTag).css('width','fit-content');$(startTouchTargetTag).css('background-color','#fff');$(startTouchTargetTag).parent().append(listItemFillerBlock);$(listItemFillerBlock).append($('<table class="" style="width:100%;height:100%;padding:10px 0 10px 0;font-size:12px;color:#fff;vertical-align:middle;"><tr><td style="width:60px;text-align:center;" id="filler_message_'+startTouchTargetTag.attr('itemid')+'"><!-- send to<br>nearby<br>device? --></td><td style="border-left:0px solid #F5F5F5;padding-left:5px;width:40px;" id="dragItem_action_response_'+startTouchTargetTag.attr('itemid')+'"></td><td style="text-align:left;"><img src="img/entry.svg" id="filler_icon_'+startTouchTargetTag.attr('itemid')+'" style="width:30px;height:30px;filter: invert(100%);display:none;"></td></tr></table>'));$('body').append($(startTouchTargetTag).detach());$(startTouchTargetTag).css('position','absolute');$(startTouchTargetTag).css('left',(initialX)+'px');$(startTouchTargetTag).css('top',$(startTouchTargetTag).attr('initTop')+'px');$('#listItem_table_'+startTouchTargetTag.attr('itemid')).css('width','');$('#listItem_voucher_code_'+startTouchTargetTag.attr('itemid')).hide();$('#listItem_action_sync_'+startTouchTargetTag.attr('itemid')).hide();$('#listItem_trExpander_'+startTouchTargetTag.attr('itemid')).hide();listItemWasExpanded=($('#listItem_networkResults_'+startTouchTargetTag.attr('itemid')).is(':visible'));if(listItemWasExpanded)
{$('#listItem_networkResults_'+startTouchTargetTag.attr('itemid')).hide()}
startTouchTargetTag.find('div.whitecarbon').css('width','15px');$(startTouchTargetTag).css('width','fit-content');if(!$(startTouchTargetTag).hasClass('transitionRapid'))
{$(startTouchTargetTag).addClass('transitionRapid');$(startTouchTargetTag).addClass('cardShadow');$(startTouchTargetTag).addClass('rounded')}}
me.updateMoveTouchVars=function(e)
{currentX=e.touches[0].clientX;currentY=e.touches[0].clientY;if(currentX>initialX)
{diffX=currentX-initialX}
else{diffX=(initialX-currentX)*-1}
diffY=initialY-currentY;trackX+=diffX;trackY+=diffY}
function getSessionSummary()
{var msg='initialX = '+parseFloat(initialX).toFixed(0)+' initialY = '+parseFloat(initialY).toFixed(0)+' currentX = '+parseFloat(currentX).toFixed(0)+' currentY = '+parseFloat(currentY).toFixed(0)+' diffX = '+parseFloat(diffX).toFixed(0)+' diffY = '+parseFloat(diffY).toFixed(0)+' trackX = '+parseFloat(trackX).toFixed(0)+' trackY = '+parseFloat(trackY).toFixed(0)+' navDrawerVisibleOnStart: '+navDrawerVisibleOnStart+' navDrawerVisibleOnMove: '+navDrawerVisibleOnMove+' navDrawerLeft: '+$('#navDrawerDiv').css('left')+' navDrawerWidth: '+$('#navDrawerDiv').css('width')+' dragXoffsetLimit: '+dragXoffsetLimit+' listItemDragEnabled: '+listItemDragEnabled+' startTagRedeemListItem: '+startTagRedeemListItem
' listItemWasExpanded: '+listItemWasExpanded;return msg}
me.moveListItem=function()
{if(currentX<=(dragXoffsetLimit+startTouchTargetWidth-$(startTouchTargetTag).width()))
{$(startTouchTargetTag).css('left',(currentX)+'px')}
if($(startTouchTargetTag).css('top')!=$(startTouchTargetTag).attr('initTop')+'px')
{$(startTouchTargetTag).css('top',$(startTouchTargetTag).attr('initTop')+'px')}
$(listItemFillerBlock).css('background-color','rgba(0, 0, 0, '+((((currentX-dragXoffsetLimit)/startTouchTargetWidth)<=0.5)?((currentX-dragXoffsetLimit)/startTouchTargetWidth):0.5)+')');$(listItemFillerBlock).css('border-bottom-color','none');if(currentX>(dragXoffsetLimit+(startTouchTargetWidth/3)))
{$('#dragItem_action_response_'+startTouchTargetTag.attr('itemid')).html('<!--Y-->')}
else{$('#dragItem_action_response_'+startTouchTargetTag.attr('itemid')).html('<!--N-->')}}
me.moveNavDrawer=function()
{navDrawerVisibleOnMove=$('#navDrawerDiv').is(':visible');if(diffX<0)
{if(navDrawerVisibleOnStart)
{$('#focusRelegator').css('opacity',0.5*(((currentX>expectedNavDrawerWidth)?expectedNavDrawerWidth:currentX)/expectedNavDrawerWidth));if(currentX<=expectedNavDrawerWidth)
{$('#navDrawerDiv').css('width',expectedNavDrawerWidth+'px');$('#navDrawerDiv').css('left',(currentX-expectedNavDrawerWidth)+'px')}
else{$('#navDrawerDiv').css('width',expectedNavDrawerWidth+'px');$('#navDrawerDiv').css('left','0px')}
if(!navDrawerVisibleOnMove)$('#navDrawerDiv').show()}}
else{if(initialX<dragXoffsetLimit)
{{if(!$('#focusRelegator').is(':visible'))
{$('#focusRelegator').show();$('#focusRelegator').css('zIndex',100);$('#navDrawerDiv').css('zIndex',200)}
else{if($('#focusRelegator').css('zIndex')!=100)$('#focusRelegator').css('zIndex',100);if($('#navDrawerDiv').css('zIndex')!=200)$('#focusRelegator').css('zIndex',200)}
if(navDrawerVisibleOnMove)
{$('#focusRelegator').css('opacity',0.5*(((currentX>expectedNavDrawerWidth)?expectedNavDrawerWidth:currentX)/expectedNavDrawerWidth))}
if(currentX>expectedNavDrawerWidth)
{if(!$('#navDrawerDiv').css('left')!='0px')$('#navDrawerDiv').css('left','0px');$('#navDrawerDiv').css('width',expectedNavDrawerWidth+'px')}
else{$('#navDrawerDiv').css('left',(currentX-expectedNavDrawerWidth)+'px');if(!$('#navDrawerDiv').css('width')!=expectedNavDrawerWidth+'px')$('#navDrawerDiv').css('width',expectedNavDrawerWidth+'px')}
if(!$('#navDrawerDiv').is(':visible'))$('#navDrawerDiv').show()}}
else{if(navDrawerVisibleOnStart)
{$('#focusRelegator').css('opacity',0.5*(((currentX>expectedNavDrawerWidth)?expectedNavDrawerWidth:currentX)/expectedNavDrawerWidth));if(currentX>expectedNavDrawerWidth)
{if(!$('#navDrawerDiv').css('left')!='0px')$('#navDrawerDiv').css('left','0px');$('#navDrawerDiv').css('width',expectedNavDrawerWidth+'px')}
else{$('#navDrawerDiv').css('left',(currentX-expectedNavDrawerWidth)+'px');if(!$('#navDrawerDiv').css('width')!=expectedNavDrawerWidth+'px')$('#navDrawerDiv').css('width',expectedNavDrawerWidth+'px')}}}}}
me.touchEndListItem=function(e)
{var bArchive=(currentX>(dragXoffsetLimit+(startTouchTargetWidth/3)));$(listItemFillerBlock).remove();$(startTouchTargetTag).removeClass('transitionRapid');$(startTouchTargetTag).removeClass('cardShadow');$(startTouchTargetTag).removeClass('rounded');$(startTouchTargetTag).addClass('transitionSmooth');$(startTouchTargetTag).detach();$(startTouchParentTag).append(startTouchTargetTag);$(startTouchTargetTag).css('left','auto');$(startTouchTargetTag).css('top','initial');$(startTouchTargetTag).css('width','100%');$(startTouchTargetTag).css('position','relative');$(startTouchTargetTag).css('border-bottom-color',$(startTouchTargetTag).attr('initBorderBottomColor'));$(startTouchTargetTag).css('background-Color','initial');startTouchTargetTag.find('div.listItem').css('width','100%');$('#listItem_table_'+startTouchTargetTag.attr('itemid')).css('width','100%');$('#listItem_voucher_code_'+startTouchTargetTag.attr('itemid')).show();$('#listItem_action_sync_'+startTouchTargetTag.attr('itemid')).show();$('#listItem_trExpander_'+startTouchTargetTag.attr('itemid')).show();if(listItemWasExpanded)
{$('#listItem_networkResults_'+startTouchTargetTag.attr('itemid')).show();$('#listItem_networkResults_'+startTouchTargetTag.attr('itemid')).css('display','')}
FormUtil.listItemActionUpdate(startTouchTargetTag.attr('itemid'),'archive',bArchive);setTimeout(function(){$(startTouchTargetTag).removeClass('transitionSmooth')},500)}
me.toucheEndNavDrawer=function(e)
{if($('#navDrawerDiv').hasClass('transitionRapid'))
{$('#navDrawerDiv').removeClass('transitionRapid')}
if(!$('#navDrawerDiv').hasClass('transitionSmooth'))
{$('#navDrawerDiv').addClass('transitionSmooth')}
if(!loggedIn||(Math.abs(trackX)<=2)||(!navDrawerVisibleOnStart&&!navDrawerVisibleOnMove))
{trackX=0;return}
$('#navDrawerDiv').css('left','0px');$('#focusRelegator').css('opacity',0.5);if(!navDrawerVisibleOnStart&&(initialX<dragXoffsetLimit))
{if(currentX>thresholdNavDrawerWidth)
{$('#navDrawerDiv').css('width',expectedNavDrawerWidth+'px');$('#nav-toggle').click()}
else{$('#navDrawerDiv').css('left','-'+expectedNavDrawerWidth+'px');$('#navDrawerDiv').css('width',expectedNavDrawerWidth+'px');setTimeout(function(){$('#navDrawerDiv').hide()},500);$('#focusRelegator').hide()}}
else{if(currentX<thresholdNavDrawerWidth)
{if($('#focusRelegator').is(':visible'))$('#focusRelegator').hide();$('#nav-toggle').click()}
else{$('#navDrawerDiv').css('width',expectedNavDrawerWidth+'px');$('#focusRelegator').show()}}}}