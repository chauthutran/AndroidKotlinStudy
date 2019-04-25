function Util(){}
Util.termName_pleaseSelectOne="common_pleaseSelectOne";Util.termName_listEmpty="common_listEmpty";Util.disableTag=function(tag,isDisable)
{tag.prop('disabled',isDisable)}
Util.sortByKey=function(array,key,noCase,order,emptyStringLast)
{if(array.length==0||array[0][key]===undefined)return array;else{return array.sort(function(a,b){var x=a[key];var y=b[key];if(x===undefined)x="";if(y===undefined)y="";if(noCase!==undefined&&noCase)
{x=x.toLowerCase();y=y.toLowerCase()}
if(emptyStringLast!==undefined&&emptyStringLast&&(x==""||y==""))
{if(x==""&&y=="")return 0;else if(x=="")return 1;else if(y=="")return-1}
else{if(order===undefined)
{return((x<y)?-1:((x>y)?1:0))}
else{if(order=="Acending")return((x<y)?-1:((x>y)?1:0));else if(order=="Decending")return((x>y)?-1:((x<y)?1:0))}}})}};Util.sortByKey_Reverse=function(array,key){return array.sort(function(b,a){var x=a[key];var y=b[key];return((x<y)?-1:((x>y)?1:0))})};Util.searchByName=function(array,propertyName,value)
{for(var i in array){if(array[i][propertyName]==value){return array[i]}}
return""};Util.trim=function(input)
{return input.replace(/^\s+|\s+$/gm,'')};Util.trimTags=function(tags)
{tags.each(function(){$(this).val(Util.trim($(this).val()))})};Util.replaceAllRegx=function(fullText,strReplacing,strReplacedWith)
{var rePattern=new RegExp(strReplacing,"g");return fullText.replace(rePattern,strReplacedWith)};Util.replaceAll=function(fullText,keyStr,replaceStr)
{var index=-1;do{fullText=fullText.replace(keyStr,replaceStr);index=fullText.indexOf(keyStr,index+1)}while(index!=-1);return fullText};Util.stringSearch=function(inputString,searchWord)
{if(inputString.search(new RegExp(searchWord,'i'))>=0)
{return!0}
else{return!1}};Util.upcaseFirstCharacterWord=function(text){var result=text.replace(/([A-Z])/g," $1");return result.charAt(0).toUpperCase()+result.slice(1)};Util.startsWith=function(input,suffix)
{return(Util.checkValue(input)&&input.substring(0,suffix.length)==suffix)};Util.endsWith=function(input,suffix)
{return(Util.checkValue(input)&&input.indexOf(suffix,input.length-suffix.length)!==-1)};Util.clearList=function(selector){selector.children().remove()};Util.moveSelectedById=function(fromListId,targetListId){return!$('#'+fromListId+' option:selected').remove().appendTo('#'+targetListId)};Util.selectAllOption=function(listTag){listTag.find('option').attr('selected',!0)};Util.unselectAllOption=function(listTag){listTag.find('option').attr('selected',!0)};Util.getDeepCopy=function(obj)
{return $.extend(!0,{},obj)};Util.getObjectFromStr=function(str)
{return $.parseJSON(str)};Util.valueEscape=function(input)
{input=input.replace('"','\"');return input};Util.valueUnescape=function(input)
{input=input.replace('\"','"');return input};Util.reverseArray=function(arr)
{return arr.reverse()};Util.getProperValue=function(val)
{Util.getNotEmpty(val)}
Util.getNotEmpty=function(input){if(Util.checkDefined(input))
{return input}
else return""};Util.checkDefined=function(input){if(input!==undefined&&input!=null)return!0;else return!1};Util.checkValue=function(input){if(Util.checkDefined(input)&&input.length>0)return!0;else return!1};Util.checkDataExists=function(input){return Util.checkValue(input)};Util.checkData_WithPropertyVal=function(arr,propertyName,value)
{var found=!1;if(Util.checkDataExists(arr))
{for(i=0;i<arr.length;i++)
{var arrItem=arr[i];if(Util.checkDefined(arrItem[propertyName])&&arrItem[propertyName]==value)
{found=!0;break}}}
return found};Util.isInt=function(n){return Number(n)===n&&n%1===0};Util.isNumeric=function(n){return!isNaN(parseFloat(n))&&isFinite(n)};Util.getNum=function(n){var val=0;try{if(n)val=Number(n)}
catch(err){}
return val};Util.RemoveFromArray=function(list,propertyName,value)
{var index;$.each(list,function(i,item)
{if(item[propertyName]==value)
{index=i;return!1}});if(index!==undefined)
{list.splice(index,1)}
return index};Util.getFromListByName=function(list,name)
{var item;for(i=0;i<list.length;i++)
{if(list[i].name==name)
{item=list[i];break}}
return item};Util.getFromList=function(list,value,propertyName)
{var item;if(list)
{if(propertyName===undefined)
{propertyName="id"}
for(i=0;i<list.length;i++)
{var listItem=list[i];if(listItem[propertyName]&&listItem[propertyName]===value)
{item=listItem;break}}}
return item};Util.getMatchData=function(settingData,matchSet)
{var returnData=new Array();$.each(settingData,function(i,item)
{var match=!0;for(var propName in matchSet)
{if(matchSet[propName]!=item[propName])
{match=!1;break}}
if(match)
{returnData.push(item)}});return returnData};Util.getFirst=function(inputList)
{var returnVal;if(inputList!==undefined&&inputList!=null&&inputList.length>0)
{returnVal=inputList[0]}
return returnVal};Util.checkExistInList=function(list,value,propertyName)
{var item=Util.getFromList(list,value,propertyName);if(item===undefined)return!1;else return!0};Util.checkEmptyId_FromList=function(list)
{return(Util.getFromList(list,'')!==undefined)};Util.convertPropListToArray=function(jsonData)
{var arr=[];for(var keyName in jsonData)
{if(jsonData.hasOwnProperty(keyName)){var obj=jsonData[keyName];obj.keyName=keyName;arr.push(obj)}}
return arr};Util.getURLParameterByName=function(url,name)
{name=name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var regex=new RegExp("[\\?&]"+name+"=([^&#]*)"),results=regex.exec(url);return results==null?"":decodeURIComponent(results[1].replace(/\+/g," "))};Util.getURLParameterByVariables=function(url,name)
{var result=[];var idx=0;var pairs=url.split("&");for(var i=0;i<pairs.length;i++){var pair=pairs[i].split("=");if(pair[0]==name){result[idx]=pair[1];idx++}}
return result};Util.getURL_pathname=function(loc)
{var pathName="";var strSplits=window.location.pathname.split('/');if(strSplits.length>=loc)
{pathName=strSplits[loc-1]}
return pathName};Util.copyProperties=function(source,dest)
{for(var key in source)
{dest[key]=source[key]}};Util.RemoveFromArray=function(list,propertyName,value)
{var index;$.each(list,function(i,item)
{if(item[propertyName]==value)
{index=i;return!1}});if(index!==undefined)
{list.splice(index,1)}
return index};Util.getObjPropertyCount=function(list)
{var count=0;for(var prop in list)
{count++}
return count};Util.populateSelect_ByList=function(selectTag,listData,dataType)
{selectTag.empty();$.each(listData,function(i,item)
{var option=$('<option '+FormUtil.getTermAttr(item)+'></option>');if(dataType!==undefined&&dataType=="Array")
{option.attr("value",item).text(item)}
else{option.attr("value",item.id).text(item.name)}
selectTag.append(option)})};Util.populateSelect_Simple=function(selectObj,json_Data)
{selectObj.empty();$.each(json_Data,function(i,item)
{selectObj.append('<option '+FormUtil.getTermAttr(item)+' value="'+item.id+'">'+item.name+'</option>')})};Util.populateSelectDefault=function(selectObj,selectNoneName,json_Data,inputOption)
{selectObj.empty();selectObj.append('<option term="'+Util.termName_pleaseSelectOne+'" value="">'+selectNoneName+'</option>');var valuePropStr="id";var namePropStr="name";if(inputOption!==undefined)
{valuePropStr=inputOption.val;namePropStr=inputOption.name}
if(json_Data!==undefined)
{$.each(json_Data,function(i,item)
{var optionTag=$('<option '+FormUtil.getTermAttr(item)+'></option>');optionTag.attr("value",item[valuePropStr]).text(item[namePropStr]);selectObj.append(optionTag)})}};Util.populateSelect_newOption=function(selectObj,json_Data,inputOption)
{selectObj.empty();selectObj.append('<option term="'+Util.termName_pleaseSelectOne+'" selected disabled="disabled">Choose an option</option>');var valuePropStr="id";var namePropStr="name";if(inputOption!==undefined)
{valuePropStr=inputOption.val;namePropStr=inputOption.name}
if(json_Data!==undefined)
{$.each(json_Data,function(i,item)
{var optionTag=$('<option '+FormUtil.getTermAttr(item)+'></option>');optionTag.attr("value",item[valuePropStr]).text(item[namePropStr]);selectObj.append(optionTag)})}};Util.populateSelect=function(selectObj,selectName,json_Data,dataType)
{selectObj.empty();selectObj.append('<option term="'+Util.termName_pleaseSelectOne+'" value="">Select '+selectName+'</option>');if(json_Data!==undefined)
{$.each(json_Data,function(i,item)
{var option=$('<option '+FormUtil.getTermAttr(item)+'></option>');if(dataType!==undefined&&dataType=="Array")
{option.attr("value",item).text(item)}
else{option.attr("value",item.id).text(item.name)}
selectObj.append(option)})}};Util.populateSelect_WithDefaultName=function(selectObj,selectName,json_Data,defaultName)
{selectObj.empty();selectObj.append($('<option term="'+Util.termName_pleaseSelectOne+'" value="">Select '+selectName+'</option>'));$.each(json_Data,function(i,item){if(item.name==defaultName)
{selectObj.append($('<option '+FormUtil.getTermAttr(item)+' selected></option>').attr("value",item.id).text(item.name))}
else{selectObj.append($('<option '+FormUtil.getTermAttr(item)+'></option>').attr("value",item.id).text(item.name))}})};Util.selectOption_WithOptionalInsert=function(selectObj,id,list)
{if(selectObj.find("option").length>0)
{selectObj.val(id)}
if(selectObj.val()!=id)
{if(list!==undefined&&list!=null)
{var item=Util.getFromList(list,id);if(item!==undefined)
{selectObj.append($('<option '+FormUtil.getTermAttr(item)+'></option>').attr("value",item.id).text(item.name))}}
else{selectObj.append($('<option '+FormUtil.getTermAttr(item)+'></option>').attr("value",id).text(id))}
selectObj.val(id)}};Util.decodeURI_ItemList=function(jsonItemList,propName)
{if(jsonItemList)
{$.each(jsonItemList,function(i,item)
{if(item[propName])
{item[propName]=decodeURI(item[propName])}})}};Util.setSelectDefaultByName=function(ctrlTag,name)
{ctrlTag.find("option:contains("+name+")").attr('selected','selected')};Util.getSelectedOptionName=function(ctrlTag)
{return ctrlTag.find("option:selected").text()};Util.reset_tagsListData=function(tags,listJson)
{tags.each(function(){var tag=$(this);var tagVal=tag.val();tag.find('option').remove();Util.populateSelectDefault(tag,"",listJson);tag.val(tagVal)})};Util.write=function(data)
{$("#testData").append(" ["+data+"] <br><br>")};Util.paintControl=function(ctrlTarget,color)
{if(ctrlTarget.is("select"))
{ctrlTarget.css("background-color",color);ctrlTarget.find('option').css("background-color",color)}
else{ctrlTarget.css("background-color",color)}};Util.paintWarningIfEmpty=function(tag)
{if(tag.val()=="")
{Util.paintWarning(tag)}
else{Util.paintClear(tag)}};Util.paintWarning=function(ctrlTarget)
{Util.paintControl(ctrlTarget,"LightCoral")};Util.paintAttention=function(ctrlTarget)
{Util.paintControl(ctrlTarget,"#CDEBFF")};Util.paintLightGreen=function(ctrlTarget)
{Util.paintControl(ctrlTarget,"#EEFEEE")};Util.paintWhite=function(ctrlTarget)
{Util.paintControl(ctrlTarget,"White")};Util.paintClear=function(ctrlTarget)
{ctrlTarget.css("background-color","")};Util.paintResult=function(ctrlTarget,result)
{if(result)
{Util.paintControl(ctrlTarget,"#BBEEBB")}
else{Util.paintControl(ctrlTarget,"#FFFFFF")}};Util.paintSuccess=function(ctrlTarget,result)
{if(result)
{Util.paintControl(ctrlTarget,"#BBEEBB")}
else{Util.paintControl(ctrlTarget,"#FFFFFF")}};Util.paintError=function(ctrlTarget,result)
{if(result)
{Util.paintControl(ctrlTarget,"Orange")}
else{Util.paintControl(ctrlTarget,"#FFFFFF")}};Util.paintBorderClear=function(ctrlTarget)
{ctrlTarget.css("border-color","")};Util.paintBorderWarning=function(ctrlTarget)
{ctrlTarget.css("border-color","#ff0000")};Util.toggleTarget=function(toggleAnchor,target,expand)
{if(expand!==undefined)
{if(expand)
{target.show("fast");toggleAnchor.text('[-]')}
else{target.hide("fast");toggleAnchor.text('[+]')}}
else{if(toggleAnchor.text()=='[+]')
{target.show("fast");toggleAnchor.text('[-]')}
else if(toggleAnchor.text()=='[-]')
{target.hide("fast");toggleAnchor.text('[+]')}}};Util.toggleTargetButton=function(toggleButtonTag,targetTag,expand,expendFunc,collapseFunc)
{var expendText=toggleButtonTag.attr('expand');var collapseText=toggleButtonTag.attr('collapse');var show=!1;if(expand!==undefined)
{if(expand)show=!0;else show=!1}
else{if(toggleButtonTag.text()==expendText)show=!0;else if(toggleButtonTag.text()==collapseText)show=!1}
if(show)
{targetTag.show("fast");toggleButtonTag.text(collapseText);if(expendFunc!==undefined)expendFunc()}
else{targetTag.hide("fast");toggleButtonTag.text(expendText);if(collapseFunc!==undefined)collapseFunc()}};Util.setRowRemoval=function(trCurrent,runFunc)
{trCurrent.slideUp(200,function(){trCurrent.remove();if(runFunc!==undefined)
{runFunc()}})};Util.checkInteger=function(input)
{var intRegex=/^\d+$/;return intRegex.test(input)};Util.checkCalendarDateStrFormat=function(inputStr)
{if(inputStr.length==10&&inputStr.substring(4,5)=='/'&&inputStr.substring(7,8)=='/'&&Util.checkInteger(inputStr.substring(0,4))&&Util.checkInteger(inputStr.substring(5,7))&&Util.checkInteger(inputStr.substring(8,10)))
{return!0}
else{return!1}};Util.isDate=function(date){return((new Date(date)!=="Invalid Date"&&!isNaN(new Date(date))))};Util.addZero=function(i)
{if(i<10){i="0"+i}
return i};Util.formatDate=function(strDate)
{var returnVal="";if(strDate.length==10)
{var year=strDate.substring(0,4);var month=strDate.substring(5,7);var date=strDate.substring(8);returnVal=year+"-"+month+"-"+date}
return returnVal};Util.formatDateBack=function(strDate)
{if(Util.checkValue(strDate))
{var year=strDate.substring(0,4);var month=strDate.substring(5,7);var date=strDate.substring(8,10);return year+"/"+month+"/"+date}
else{return""}};Util.getDate_FromYYYYMMDD=function(strDate)
{var date;if(Util.checkValue(strDate))
{var year=strDate.substring(0,4);var month=strDate.substring(5,7);var date=strDate.substring(8,10);date=new Date(year,month-1,date)}
return date};Util.getDateStrYYYYMMDD_FromDate=function(date)
{return $.format.date(date,_dateFormat_YYYYMMDD)};Util.formatDate_LongDesc=function(date)
{return $.format.date(date,_dateFormat_DDMMMYYYY)};Util.dateToString=function(date)
{var month=eval(date.getMonth())+1;month=(month<10)?"0"+month:month;var day=eval(date.getDate());day=(day<10)?"0"+day:day;return date.getFullYear()+"-"+month+"-"+day};Util.setupDatePicker=function(ctrl,onSelectFunc,dateFormat,type)
{if(!Util.checkValue(dateFormat))
{dateFormat=_dateFormat_Picker_YYMMDD}
if(!Util.checkDefined(onSelectFunc))
{onSelectFunc=function(){}}
var maxDate=null;var yearRangeStr="";var yearRangeStr="";var currentYear=(new Date()).getFullYear();if(type!==undefined&&type=="birthdate")
{yearRangeStr='1930:'+currentYear;maxDate=0}
else if(type!==undefined&&type=="upToToday")
{yearRangeStr=''+(currentYear-15)+':'+currentYear;maxDate=0}
else{yearRangeStr=''+(currentYear-15)+':'+(currentYear+2)}
ctrl.datepicker({onSelect:onSelectFunc,dateFormat:dateFormat,changeMonth:!0,changeYear:!0,yearRange:yearRangeStr,maxDate:maxDate})};Util.pageHScroll=function(option)
{if(option==="Right")
{var left=$(document).outerWidth()-$(window).width();$('body, html').scrollLeft(left)}
else{$('body, html').scrollLeft(0)}};Util.showDiv=function(tag,show)
{if(tag!==undefined&&tag.length>0)
{(show)?tag.show():tag.hide()}};Util.generateRandomId=function()
{var id='';var charSet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';var id_size=12;for(var i=1;i<=id_size;i++)
{var randPos=Math.floor(Math.random()*charSet.length);id+=charSet[randPos]}
return id};Util.generateTimedUid=function()
{return(new Date().getTime()).toString(36)}
Util.getParameterByName=function(name)
{name=name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var regex=new RegExp("[\\?&]"+name+"=([^&#]*)"),results=regex.exec(location.search);return results==null?"":decodeURIComponent(results[1].replace(/\+/g," "))};Util.parseInt=function(input)
{if(input===undefined||input==null||input.length==0)
{return 0}
else{return parseInt(input)}};Util.getServerUrl=function()
{return location.protocol+'//'+location.host};Util.getIndexes=function(inputStr,keyStr)
{var indexes=[];var idx=inputStr.indexOf(keyStr);while(idx!=-1){indexes.push(idx);idx=inputStr.indexOf(keyStr,idx+1)}
return indexes};Util.upNumber_IntArr=function(arr,upNumber)
{for(var i=0;i<arr.length;i++)
{arr[i]=arr[i]+upNumber}};Util.oneTimeActions={};Util.delayOnceTimeAction=function(delay,id,action){if(Util.oneTimeActions[id])clearTimeout(Util.oneTimeActions[id]);Util.oneTimeActions[id]=setTimeout(action,delay)};$.fn.outerHTML=function(){return(!this.length)?this:(this[0].outerHTML||(function(el){var div=document.createElement('div');div.appendChild(el.cloneNode(!0));var contents=div.innerHTML;div=null;return contents})(this[0]))};Util.encrypt=function(seed,loops)
{let ret=seed;for(i=0;i<loops;i++)
{ret=btoa(ret)}
return ret}
Util.decrypt=function(garbage,loops)
{let seed=garbage;for(i=0;i<loops;i++)
{seed=atob(seed)}
return seed}
function SHA256(s){var chrsz=8;var hexcase=0;function safe_add(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF)}
function S(X,n){return(X>>>n)|(X<<(32-n))}
function R(X,n){return(X>>>n)}
function Ch(x,y,z){return((x&y)^((~x)&z))}
function Maj(x,y,z){return((x&y)^(x&z)^(y&z))}
function Sigma0256(x){return(S(x,2)^S(x,13)^S(x,22))}
function Sigma1256(x){return(S(x,6)^S(x,11)^S(x,25))}
function Gamma0256(x){return(S(x,7)^S(x,18)^R(x,3))}
function Gamma1256(x){return(S(x,17)^S(x,19)^R(x,10))}
function core_sha256(m,l){var K=new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);var HASH=new Array(0x6A09E667,0xBB67AE85,0x3C6EF372,0xA54FF53A,0x510E527F,0x9B05688C,0x1F83D9AB,0x5BE0CD19);var W=new Array(64);var a,b,c,d,e,f,g,h,i,j;var T1,T2;m[l>>5]|=0x80<<(24-l%32);m[((l+64>>9)<<4)+15]=l;for(var i=0;i<m.length;i+=16){a=HASH[0];b=HASH[1];c=HASH[2];d=HASH[3];e=HASH[4];f=HASH[5];g=HASH[6];h=HASH[7];for(var j=0;j<64;j++){if(j<16)W[j]=m[j+i];else W[j]=safe_add(safe_add(safe_add(Gamma1256(W[j-2]),W[j-7]),Gamma0256(W[j-15])),W[j-16]);T1=safe_add(safe_add(safe_add(safe_add(h,Sigma1256(e)),Ch(e,f,g)),K[j]),W[j]);T2=safe_add(Sigma0256(a),Maj(a,b,c));h=g;g=f;f=e;e=safe_add(d,T1);d=c;c=b;b=a;a=safe_add(T1,T2)}
HASH[0]=safe_add(a,HASH[0]);HASH[1]=safe_add(b,HASH[1]);HASH[2]=safe_add(c,HASH[2]);HASH[3]=safe_add(d,HASH[3]);HASH[4]=safe_add(e,HASH[4]);HASH[5]=safe_add(f,HASH[5]);HASH[6]=safe_add(g,HASH[6]);HASH[7]=safe_add(h,HASH[7])}
return HASH}
function str2binb(str){var bin=Array();var mask=(1<<chrsz)-1;for(var i=0;i<str.length*chrsz;i+=chrsz){bin[i>>5]|=(str.charCodeAt(i/chrsz)&mask)<<(24-i%32)}
return bin}
function Utf8Encode(string){string=string.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128)
{utftext+=String.fromCharCode(c)}
else if((c>127)&&(c<2048))
{utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128)}
else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128)}}
return utftext}
function binb2hex(binarray){var hex_tab=hexcase?"0123456789ABCDEF":"0123456789abcdef";var str="";for(var i=0;i<binarray.length*4;i++){str+=hex_tab.charAt((binarray[i>>2]>>((3-i%4)*8+4))&0xF)+hex_tab.charAt((binarray[i>>2]>>((3-i%4)*8))&0xF)}
return str}
s=Utf8Encode(s);return binb2hex(core_sha256(str2binb(s),s.length*chrsz))}
$.fn.rotate=function(options){var $this=$(this),prefixes,opts,wait4css=0;prefixes=['-Webkit-','-Moz-','-O-','-ms-',''];opts=$.extend({startDeg:!1,endDeg:360,duration:1,count:1,easing:'linear',animate:{},forceJS:!1},options);function supports(prop){var can=!1,style=document.createElement('div').style;$.each(prefixes,function(i,prefix){if(style[prefix.replace(/\-/g,'')+prop]===''){can=!0}});return can}
function prefixed(prop,value){var css={};if(!supports.transform){return css}
$.each(prefixes,function(i,prefix){css[prefix.toLowerCase()+prop]=value||''});return css}
function generateFilter(deg){var rot,cos,sin,matrix;if(supports.transform){return''}
rot=deg>=0?Math.PI*deg/180:Math.PI*(360+deg)/180;cos=Math.cos(rot);sin=Math.sin(rot);matrix='M11='+cos+',M12='+(-sin)+',M21='+sin+',M22='+cos+',SizingMethod="auto expand"';return'progid:DXImageTransform.Microsoft.Matrix('+matrix+')'}
supports.transform=supports('Transform');supports.transition=supports('Transition');opts.endDeg*=opts.count;opts.duration*=opts.count;if(supports.transition&&!opts.forceJS){if((/Firefox/).test(navigator.userAgent)){wait4css=(!options||!options.animate)&&(opts.startDeg===!1||opts.startDeg>=0)?0:25}
$this.queue(function(next){if(opts.startDeg!==!1){$this.css(prefixed('transform','rotate(-'+opts.startDeg+'deg)'))}
setTimeout(function(){$this.css(prefixed('transition','all '+opts.duration+'s '+opts.easing)).css(prefixed('transform','rotate(-'+opts.endDeg+'deg)')).css(opts.animate)},wait4css);setTimeout(function(){$this.css(prefixed('transition'));if(!opts.persist){$this.css(prefixed('transform'))}
next()},(opts.duration*1000)-wait4css)})}else{if(opts.startDeg===!1){opts.startDeg=$this.data('rotated')||0}
opts.animate.perc=100;$this.animate(opts.animate,{duration:opts.duration*1000,easing:$.easing[opts.easing]?opts.easing:'',step:function(perc,fx){var deg;if(fx.prop==='perc'){deg=opts.startDeg+(opts.endDeg-opts.startDeg)*perc/100;$this.css(prefixed('transform','rotate(-'+deg+'deg)')).css('filter',generateFilter(deg))}},complete:function(){if(opts.persist){while(opts.endDeg>=360){opts.endDeg-=360}}else{opts.endDeg=0;$this.css(prefixed('transform'))}
$this.css('perc',0).data('rotated',opts.endDeg)}})}
return $this};Util.isMobi=function()
{return(/Mobi/.test(navigator.userAgent))}
Util.getPeriodName=function(pe)
{var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];var peM=parseInt(pe.substring(4,6));var peF=parseInt(pe.substring(0,4));return(months[(peM-1)]+' '+peF)}