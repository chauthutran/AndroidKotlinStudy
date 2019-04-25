function Validation(cwsRenderObj,blockObj,pageTag)
{var me=this;me.cwsRenderObj=cwsRenderObj;me.blockObj=blockObj;me.pageTag=pageTag;me.COLOR_WARNING="#f19c9c";me.setUp_Events=function(formTag)
{formTag.find("input,select,textarea").each(function(){var inputTag=$(this);inputTag.change(function(){me.checkValidations(inputTag)})})}
me.checkFormEntryTagsData=function(formTag)
{var allValid=!0;formTag.find("input,select,textarea").each(function(){if(!me.checkValidations($(this)))
{allValid=!1}});return allValid};me.checkValidations=function(tag)
{tag.attr('valid','true');var divTag=tag.closest("div");divTag.find("span.errorMsg").remove();if(tag.is(':visible'))
{me.performValidationCheck(tag,'mandatory',divTag);me.performValidationCheck(tag,'minlength',divTag);me.performValidationCheck(tag,'maxlength',divTag);me.performValidationCheck(tag,'maxvalue',divTag);me.performValidationCheck(tag,'isNumber',divTag);me.performValidationCheck(tag,'phoneNumber',divTag);me.performValidationCheck(tag,'patterns',divTag)}
var valid=(tag.attr('valid')=='true');tag.css('background-color',((valid)?'':me.COLOR_WARNING));return valid};me.performValidationCheck=function(tag,type,divTag)
{var valid=!0;var validationAttr=tag.attr(type);if(validationAttr&&validationAttr!=='false')
{if(type=='mandatory')valid=me.checkRequiredValue(tag,divTag,type);else if(type=='minlength')valid=me.checkValueLen(tag,divTag,'min',Number(validationAttr));else if(type=='maxlength')valid=me.checkValueLen(tag,divTag,'max',Number(validationAttr));else if(type=='maxvalue')valid=me.checkValueRange(tag,divTag,0,Number(validationAttr));else if(type=='exactlength')valid=me.checkValueLen(tag,divTag,type,Number(validationAttr));else if(type=='isNumber')valid=me.checkNumberOnly(tag,divTag,type);else if(type=='phoneNumber')valid=me.checkPhoneNumberValue(tag,divTag,type);else if(type=='patterns')valid=me.checkValue_RegxRules(tag,divTag,type);if(!valid)tag.attr('valid',!1)}};me.getMessage=function(type,defaultMessage)
{var message=me.cwsRenderObj.configJson.definitionMessages[type];if(message===undefined)
{message=defaultMessage}
if(message===undefined)
{message="The value is violated the rule "+type}
return message};me.checkRequiredValue=function(inputTag,divTag,type)
{var valid=!0;var value=inputTag.val();if(!value&&!me.checkFalseEvalSpecialCase())
{var message=me.getMessage(type,"This field is required");divTag.append(me.getErrorSpanTag(message));valid=!1}
return valid};me.checkValueLen=function(inputTag,divTag,type,length)
{var valid=!0;var value=inputTag.val();if(value&&type=='min'&&value.length<length)
{var message=me.getMessage(type,'Please enter at least '+length+' characters');message=message.replace("$$length",length);divTag.append(me.getErrorSpanTag(message));valid=!1}
else if(value&&type=='max'&&value.length>length)
{var message=me.getMessage(type,'Please enter at most '+length+' characters');message=message.replace("$$length",length);divTag.append(me.getErrorSpanTag(message));valid=!1}
else if(value&&type=='exactlength'&&value.length!=length)
{var message=me.getMessage(type,'Please enter exactly '+length+' characters');message=message.replace("$$length",length);divTag.append(me.getErrorSpanTag(message));valid=!1}
return valid};me.checkValueRange=function(inputTag,divTag,type,valFrom,valTo)
{var valid=!0;var value=inputTag.val();if(value&&(valFrom>value||valTo<value))
{var message=me.getMessage(type,'The value should be less than or equal to '+valTo);message=message.replace("$$length",length);divTag.append(me.getErrorSpanTag(message));valid=!1}
return valid};me.checkNumberOnly=function(inputTag,divTag,type)
{var valid=!0;var value=inputTag.val();var reg=new RegExp(/^\d+$/);if(value&&!reg.test(value))
{var message=me.getMessage(type,'Please enter number only');divTag.append(me.getErrorSpanTag(message));valid=!1}
return valid};me.checkPhoneNumberValue=function(inputTag,divTag,type)
{var valid=!0;inputTag.attr('altval','');var validationInfo=me.phoneNumberValidation(inputTag.val());if(!validationInfo.success)
{divTag.append(me.getErrorSpanTag(validationInfo.msg));valid=!1}
else{inputTag.attr('altval',validationInfo.phoneNumber)}
return valid};me.checkValue_RegxRules=function(inputTag,divTag,type)
{var valid=!0;var regxRulesStr=decodeURI(inputTag.attr("patterns"));if(regxRulesStr)
{var regxRules=[];regxRules=JSON.parse(regxRulesStr);var notFirstErr=!1;for(var i=0;i<regxRules.length;i++)
{try
{var regxRuleJson=regxRules[i];var regexTest=new RegExp(regxRuleJson.pattern);if(!regexTest.test(inputTag.val()))
{valid=!1;var startCommaStr=(notFirstErr)?", ":"";divTag.append(me.getErrorSpanTag(startCommaStr+regxRuleJson.msg,regxRuleJson.term));notFirstErr=!0}}
catch(ex)
{console.log('rule regex check failed.. '+ex)}}}
return valid}
me.phoneNumberValidation=function(phoneVal)
{var success=!1;var finalPhoneNumber='';var msg='';var value=Util.trim(phoneVal);if(Util.startsWith(value,"00"))
{if(!(value.length>=12&&value.length<=15))
{msg+=me.getMessage("phone9Len",'Number should be 9 digits long (w/o country code')}
else{finalPhoneNumber='+'+value.substring(2);success=!0}}
else if(Util.startsWith(value,"06")||Util.startsWith(value,"07"))
{if(value.length!=10)
{msg+=me.getMessage("phoneStartWith","Number should start with '+2588' or '002588'")}
else{var preVal='';if(Util.startsWith(value,"06"))
{preVal='+2556'}
else if(Util.startsWith(value,"07"))
{preVal='+2557'}
finalPhoneNumber=preVal+value.substring(2);success=!0}}
else{msg+=me.getMessage("phoneStartWith","Number should start with '+2588' or '002588'")}
return{'success':success,'phoneNumber':finalPhoneNumber,'msg':msg}}
me.getErrorSpanTag=function(keyword,term)
{var text=me.cwsRenderObj.langTermObj.translateText(keyword,term);return $('<span '+FormUtil.getTermAttrStr(term)+' class="errorMsg" keyword="'+keyword+'"> '+text+'</span>')};me.clearTagValidations=function(tags)
{tags.css("background-color","").val("").attr("altval","");tags.each(function(){$(this).closest("div").find("span.errorMsg").remove()})};me.checkFalseEvalSpecialCase=function(value){return(value!==undefined&&value!=null&&value.length>0)}}