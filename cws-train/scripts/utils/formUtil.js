function FormUtil(){}
FormUtil.staticWSName='eRefWSDev3';FormUtil.appUrlName='cws';FormUtil.dynamicWS='';FormUtil.staticWSpath='';FormUtil.login_UserName='';FormUtil.login_Password='';FormUtil.login_server='';FormUtil.orgUnitData;FormUtil.dcdConfig;FormUtil.blockType_MainTab='mainTab';FormUtil.blockType_MainTabContent='mainTabContent';FormUtil._serverUrl='https://apps.psi-mis.org';FormUtil._serverUrlOverride="";FormUtil._gAnalyticsTrackId="UA-134670396-1";FormUtil._getPWAInfo;FormUtil.getObjFromDefinition=function(def,definitions)
{var objJson=def;if(def!==undefined&&definitions!==undefined)
{if(typeof def==='string')
{objJson=definitions[def]}}
return objJson}
FormUtil.getServerUrl=function()
{var serverUrl="";if(FormUtil._serverUrlOverride)
{serverUrl=FormUtil._serverUrlOverride}
else{serverUrl=FormUtil._serverUrl}
return serverUrl};FormUtil.isAppsPsiServer=function()
{return(location.host.indexOf('apps.psi-mis.org')>=0)}
FormUtil.isPsiServer=function()
{return(location.host.indexOf('psi-mis.org')>=0)}
FormUtil.generateUrl=function(inputsJson,actionJson)
{var url;if(actionJson.url!==undefined)
{url=FormUtil.getWsUrl(actionJson.url);if(actionJson.urlParamNames!==undefined&&actionJson.urlParamInputs!==undefined&&actionJson.urlParamNames.length==actionJson.urlParamInputs.length)
{var paramAddedCount=0;for(var i=0;i<actionJson.urlParamNames.length;i++)
{var paramName=actionJson.urlParamNames[i];var inputName=actionJson.urlParamInputs[i];if(inputsJson[inputName]!==undefined)
{var value=inputsJson[inputName];url+=(paramAddedCount==0)?'?':'&';url+=paramName+'='+value}
paramAddedCount++}}}
return url}
FormUtil.generateInputJson=function(formDivSecTag,getValList)
{var inputsJson={};var inputTags=formDivSecTag.find('input,select');inputTags.each(function()
{var inputTag=$(this);var attrDisplay=inputTag.attr('display');var nameVal=inputTag.attr('name');var getVal_visible=!1;var getVal=!1;if(attrDisplay==='hiddenVal')getVal_visible=!0;else if(inputTag.is(':visible'))getVal_visible=!0;if(getVal_visible)
{if(getValList===undefined)
{getVal=!0}
else{if(getValList.indexOf(nameVal)>=0)getVal=!0}}
if(getVal)
{var val=FormUtil.getTagVal(inputTag);if(val===null||val===undefined)val='';inputsJson[nameVal]=val}});return inputsJson}
FormUtil.generateInputTargetPayloadJson=function(formDivSecTag,getValList)
{var inputsJson={};var inputTags=formDivSecTag.find('input,select');var inputTargets=[];var uniqTargs=[];inputTags.each(function()
{var inputTag=$(this);var attrDataTargets=inputTag.attr('datatargets');if(attrDataTargets)
{var val=FormUtil.getTagVal(inputTag);var dataTargs=JSON.parse(unescape(attrDataTargets));var newPayLoad={"name":$(inputTag).attr('name'),"value":val,"dataTargets":dataTargs};inputTargets.push(newPayLoad);Object.keys(dataTargs).forEach(function(key){if(!uniqTargs.includes(key))
{uniqTargs.push(key)}})}});uniqTargs.sort();uniqTargs.reverse();for(var t=0;t<uniqTargs.length;t++)
{var dataTargetHierarchy=(uniqTargs[t]).toString().split('.');FormUtil.recursiveJSONbuild(inputsJson,dataTargetHierarchy,0)}
for(var t=0;t<inputTargets.length;t++)
{Object.keys(inputTargets[t].dataTargets).forEach(function(key){var dataTargetHierarchy=(key).toString().split('.');FormUtil.recursiveJSONfill(inputsJson,dataTargetHierarchy,0,inputTargets[t].dataTargets[key],inputTargets[t].value)})}
console.log(inputsJson);console.log(JSON.stringify(inputsJson,null,4));return inputsJson}
FormUtil.recursiveJSONbuild=function(targetDef,dataTargetHierarchy,itm)
{if(dataTargetHierarchy[itm])
{if((dataTargetHierarchy[itm]).length&&!targetDef.hasOwnProperty(dataTargetHierarchy[itm]))
{if(dataTargetHierarchy[itm+1])
{targetDef[dataTargetHierarchy[itm]]={}}
else{targetDef[dataTargetHierarchy[itm]]=[]}}
FormUtil.recursiveJSONbuild(targetDef[dataTargetHierarchy[itm]],dataTargetHierarchy,parseInt(itm)+1)}
else{return targetDef}}
FormUtil.recursiveJSONfill=function(targetDef,dataTargetHierarchy,itm,fillKey,fillValue)
{if(itm<(dataTargetHierarchy.length-1))
{FormUtil.recursiveJSONfill(targetDef[dataTargetHierarchy[itm]],dataTargetHierarchy,parseInt(itm)+1,fillKey,fillValue)}
else{if((dataTargetHierarchy[itm]).length&&targetDef.hasOwnProperty(dataTargetHierarchy[itm]))
{if(Array.isArray(targetDef[dataTargetHierarchy[itm]]))
{targetDef[dataTargetHierarchy[itm]].push({[fillKey]:fillValue})}
else{targetDef[dataTargetHierarchy[itm]][fillKey]=fillValue}}
else if((dataTargetHierarchy[itm]).length==0)
{targetDef[fillKey]=fillValue}}}
FormUtil.renderInputTag=function(dataJson,containerDivTag)
{var entryTag=$('<input name="'+dataJson.id+'" uid="'+dataJson.uid+'" class="form-type-text" type="text" />');entryTag.attr('display',dataJson.display);FormUtil.setTagVal(entryTag,dataJson.defaultValue);if(containerDivTag)
{containerDivTag.append(entryTag);if(dataJson.display==="hiddenVal"||dataJson.display==="none")
{containerDivTag.hide()}}
return entryTag}
FormUtil.generateLoadingTag=function(btnTag)
{var loadingTag;if(btnTag.is('div'))
{loadingTag=$('<div class="loadingImg" style="float: right; margin-left: 8px;"><img src="images/loading.gif"></div>');btnTag.append(loadingTag)}
else if(btnTag.is('button'))
{loadingTag=$('<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading.gif"></div>');btnTag.after(loadingTag)}
return loadingTag}
FormUtil.convertNamedJsonArr=function(jsonArr,definitionArr)
{var newJsonArr=[];if(jsonArr)
{for(var i=0;i<jsonArr.length;i++)
{newJsonArr.push(FormUtil.getObjFromDefinition(jsonArr[i],definitionArr))}}
return newJsonArr}
FormUtil.getWsUrl=function(subUrl)
{if(subUrl.indexOf('http')===0)
{return subUrl}
else{return FormUtil.getServerUrl()+"/"+FormUtil.staticWSName+subUrl}}
FormUtil.getFetchWSJson=function(payloadJson)
{var fetchJson={method:'POST',body:'{}'};if(FormUtil.checkLoginSubmitCase(payloadJson))
{payloadJson.userName=payloadJson.submitLogin_usr;payloadJson.password=payloadJson.submitLogin_pwd}
else{payloadJson.userName=FormUtil.login_UserName;payloadJson.password=FormUtil.login_Password}
if(payloadJson)fetchJson.body=JSON.stringify(payloadJson);return fetchJson}
FormUtil.wsRetrievalGeneral=function(apiPath,loadingTag,returnFunc)
{var url=FormUtil.getWsUrl(apiPath);RESTUtil.retrieveJson(url,function(success,returnJson)
{if(loadingTag)loadingTag.remove();if(returnFunc)returnFunc(returnJson)})}
FormUtil.wsSubmitGeneral=function(apiPath,payloadJson,loadingTag,returnFunc)
{var url=FormUtil.getWsUrl(apiPath);RESTUtil.performREST(url,FormUtil.getFetchWSJson(payloadJson),function(success,returnJson)
{if(loadingTag)loadingTag.remove();if(returnFunc)returnFunc(success,returnJson)})}
FormUtil.submitRedeem=function(apiPath,payloadJson,actionJson,loadingTag,returnFunc,asyncCall,syncCall)
{FormUtil.wsSubmitGeneral(apiPath,payloadJson,loadingTag,function(success,returnJson)
{if(returnFunc)returnFunc(success,returnJson);if(asyncCall)asyncCall(returnJson);if(syncCall)syncCall()})}
FormUtil.submitLogin=function(userName,password,loadingTag,returnFunc)
{var apiPath='/api/loginCheck';if((location.href).substring((location.href).length-4,(location.href).length)=='/cws'||(location.href).indexOf('localhost')>=0)
{var payloadJson={'submitLogin':!0,'submitLogin_usr':userName,'submitLogin_pwd':password,'dcConfigGet':'Y'}}
else{var payloadJson={'submitLogin':!0,'submitLogin_usr':userName,'submitLogin_pwd':password,'dcConfigGet':'Y',pwaStage:(location.host).replace('.psi-mis.org','')}}
FormUtil.wsSubmitGeneral(apiPath,payloadJson,loadingTag,function(success,returnJson)
{if(success)
{var loginStatus=(returnJson&&returnJson.loginStatus);if(loginStatus)
{FormUtil.login_UserName=userName;FormUtil.login_Password=password;FormUtil.orgUnitData=returnJson.orgUnitData;FormUtil.dcdConfig=returnJson.dcdConfig}
if(returnFunc)returnFunc(loginStatus,returnJson)}})}
FormUtil.setLogin=function(userName,password)
{FormUtil.login_UserName=userName;FormUtil.login_Password=password}
FormUtil.checkLoginSubmitCase=function(payloadJson)
{return(payloadJson&&payloadJson.submitLogin)}
FormUtil.checkLogin=function()
{return(FormUtil.login_UserName.toString().length&&FormUtil.login_Password.toString().length)}
FormUtil.undoLogin=function()
{FormUtil.login_UserName='';FormUtil.login_Password='';FormUtil.login_server='';FormUtil.dcdConfig=undefined;FormUtil.orgUnitData=undefined;$('input.loginUserPin').val('');$('input.loginUserPinNumeric').val('')}
FormUtil.setClickSwitchEvent=function(mainIconTag,subListIconsTag,openCloseClass,cwsRenderObj)
{mainIconTag.on('click',function(event)
{event.preventDefault();var thisTag=$(this);var className_Open=openCloseClass[0];var className_Close=openCloseClass[1];if(thisTag.hasClass(className_Open))
{thisTag.removeClass(className_Open);thisTag.addClass(className_Close);if(thisTag.attr('id')=='nav-toggle')
{thisTag.removeClass('active');subListIconsTag.css('left','-'+FormUtil.navDrawerWidthLimit(document.body.clientWidth)+'px');subListIconsTag.css('width',FormUtil.navDrawerWidthLimit(document.body.clientWidth)+'px');setTimeout(function(){subListIconsTag.hide()},500);$('#focusRelegator').hide()}
else{subListIconsTag.fadeOut('fast','linear');if(!$('#navDrawerDiv').is(':visible'))
{$('#focusRelegator').hide()}
else{subListIconsTag.css('opacity','0')}}
subListIconsTag.css('zIndex',1)}
else{thisTag.removeClass(className_Close);thisTag.addClass(className_Open);$('#focusRelegator').css('zIndex',100);thisTag.css('zIndex',199);subListIconsTag.css('zIndex',200);if(thisTag.attr('id')=='nav-toggle')
{subListIconsTag.show();subListIconsTag.css('width',FormUtil.navDrawerWidthLimit(document.body.clientWidth+'px'));subListIconsTag.css('left','0px');if($('div.floatListMenuSubIcons').hasClass(className_Open))
{$('div.floatListMenuIcon').css('zIndex',1);$('div.floatListMenuIcon').click()}}
else{subListIconsTag.fadeIn('fast','linear')}
if(className_Open.indexOf('imggroupBy')<0)
{$('#focusRelegator').off('click');$('#focusRelegator').on('click',function(event)
{thisTag.css('zIndex',1);event.preventDefault();thisTag.click()});$('#focusRelegator').show()}}})}
FormUtil.setUpTabAnchorUI=function(tag,targetOff,eventName)
{var clickedTab=tag.find(".tabs > .active");var tabWrapper=tag.find(".tab_content");var activeTab=tabWrapper.find(".active");var activeTabHeight=activeTab.outerHeight();var tabContentLiTags=tabWrapper.children('li');activeTab.show();tabWrapper.height(activeTabHeight);tag.find(".tabs > li").on("click",function()
{var tab_select=$(this).attr('tabId');tag.find('.active').removeClass('active');$(this).addClass('active');var activeTab=tag.find(".tab_content > li[tabId='"+tab_select+"']");activeTab.addClass("active");activeTab.children('.expandable').click();activeTabHeight=activeTab.outerHeight();activeTab.show()});if(targetOff&&eventName)
{tag.find(targetOff).off(eventName)}
tag.find('.expandable').on('click',function(event)
{event.preventDefault();var liTag_Selected=$(this).parent();var tabId=liTag_Selected.attr('tabId');var matchingTabsTag=tag.find(".tabs > li[tabId='"+tabId+"']");FormUtil.setUserLastSelectedTab(tabId)
var bThisExpanded=$(this).hasClass('expanded');tag.find('.active').removeClass('active');matchingTabsTag.addClass("active");tag.find('.expanded').removeClass('expanded');tag.find('.expandable-arrow').attr('src','./img/arrow_down.svg');if(bThisExpanded)
{$(this).find(".expandable-arrow").attr('src','./img/arrow_down.svg')}
else{$(this).addClass('expanded');$(this).find(".expandable-arrow").attr('src','./img/arrow_up.svg')}})}
FormUtil.setUserLastSelectedTab=function(tabId){var lastSession=JSON.parse(localStorage.getItem('session'));if(lastSession)
{var loginData=JSON.parse(localStorage.getItem(lastSession.user));if(loginData)
{if(ConnManager.getAppConnMode_Online())
{for(var i=0;i<loginData.dcdConfig.areas.online.length;i++)
{if(loginData.dcdConfig.areas.online[i].startArea)
{loginData.dcdConfig.areas.online[i].defaultTab=tabId}}}
else{for(var i=0;i<loginData.dcdConfig.areas.offline.length;i++)
{if(loginData.dcdConfig.areas.offline[i].startArea)
{loginData.dcdConfig.areas.offline[i].defaultTab=tabId}}}
localStorage[lastSession.user]=JSON.stringify(loginData)}}}
FormUtil.getUserLastSelectedTab=function(){var lastSession=JSON.parse(localStorage.getItem('session'));var tabId;if(lastSession)
{var loginData=JSON.parse(localStorage.getItem(lastSession.user));if(loginData)
{if(ConnManager.getAppConnMode_Online())
{for(var i=0;i<loginData.dcdConfig.areas.online.length;i++)
{if(loginData.dcdConfig.areas.online[i].startArea)
{tabId=loginData.dcdConfig.areas.online[i].defaultTab}}}
else{for(var i=0;i<loginData.dcdConfig.areas.offline.length;i++)
{if(loginData.dcdConfig.areas.offline[i].startArea)
{tabId=loginData.dcdConfig.areas.offline[i].defaultTab}}}
return tabId}}}
FormUtil.getUserSessionAttr=function(usr,attr){var lastSessionAll=JSON.parse(localStorage.getItem(usr))
if(lastSessionAll&&lastSessionAll.mySession)
{return lastSessionAll.mySession[attr]}}
FormUtil.getRedeemPayload=function(id){var redPay=JSON.parse(sessionStorage.getItem(id))
if(redPay)
{return redPay}}
FormUtil.getConfigInfo=function(returnFunc)
{var jsonData={"cws":{"note":"CwS PWA production version","targetWS":"https://apps.psi-mis.org/eRefWSDev3","configs":{"MZ":"dcd@MZ","T_MZ":"dcd@MZ","NP":"dcd@NP","T_NP":"dcd@NP"}},"cws-train":{"note":"CwS PWA train version","targetWS":"https://apps.psi-mis.org/eRefWSTrain","inherit":"cws","configs":{}},"cws-dev":{"note":"CwS PWA dev version","targetWS":"https://apps.psi-mis.org/eRefWSDev3","inherit":"cws","configs":{"T_MZ":"dcd@MZ@v1"}}};returnFunc(!0,jsonData)}
FormUtil.getAppInfo=function(returnFunc)
{var url=FormUtil.getWsUrl('/api/getPWAInfo');RESTUtil.retrieveJson(url,returnFunc)}
FormUtil.getDataServerAvailable=function(returnFunc)
{var url=FormUtil.getWsUrl('/api/available');RESTUtil.retrieveJson(url,returnFunc)}
FormUtil.checkTag_CheckBox=function(tag)
{var isType=!1;if(tag)
{if(tag.attr('type')==='checkbox')isType=!0}
return isType}
FormUtil.setTagVal=function(tag,val,returnFunc)
{if(val!==undefined)
{if(FormUtil.checkTag_CheckBox(tag))
{tag.prop('checked',(val==='true'||val===!0))}
else{if(val.toString().length)
{if(val.indexOf('{')&&val.indexOf('}'))
{tag.val(FormUtil.evalReservedField(val))}
else{tag.val(val)}}
else{tag.val(val)}}
if(returnFunc)returnFunc()}}
FormUtil.evalReservedField=function(val)
{var newValue='';if(val.indexOf('$${'))
{}
else if(val.indexOf('##{'))
{if(val.indexOf('getCoordinates()'))
{newValue=val.toString().replace('')}}
else{}
return newValue}
FormUtil.getTagVal=function(tag)
{var val;if(tag)
{if(FormUtil.checkTag_CheckBox(tag))
{val=tag.is(":checked")?"true":""}
else{val=tag.val()}}
return val}
FormUtil.getManifest=function()
{$.get('manifest.json',function(jsonData,status)
{if(status=='success')
{return jsonData}})}
FormUtil.setLastPayload=function(jsonData)
{var sessionData=localStorage.getItem('session');if(sessionData)
{var SessionObj=JSON.parse(sessionData);if(SessionObj.last&&SessionObj.last.payload)
{SessionObj.last.payload=jsonData}
else{SessionObj.last={'payload':jsonData}}
localStorage.setItem('session',JSON.stringify(SessionObj))}}
FormUtil.getLastPayload=function()
{var sessionData=localStorage.getItem('session');if(sessionData)
{var SessionObj=JSON.parse(sessionData);if(SessionObj.last&&SessionObj.last.payload)
{return SessionObj.last.payload}}}
FormUtil.performReget=function(regObj,option)
{if(ConnManager.isOffline())
{MsgManager.notificationMessage('Cannot re-register service worker when Network Offline','notificationDark',undefined,'','right','top')}
else{if(regObj!==undefined)
{if(option==="update")
{FormMsgManager.appBlock("Service Worker Updating..");regObj.update().then(function(){if(FormUtil.PWAlaunchFrom=='homeScreen')
{location.reload()}
else{location.reload(!0)}});FormMsgManager.appUnblock()}
else{FormMsgManager.appBlock("Updating App...");regObj.unregister().then(function(boolean){if(FormUtil.PWAlaunchFrom=='homeScreen')
{location.reload()}
else{location.reload(!0)}});FormMsgManager.appUnblock()}}
else{MsgManager.notificationMessage('Service worker not found, reloading app','notificationDark',undefined,'','right','top');if(FormUtil.PWAlaunchFrom=='homeScreen')
{location.reload()}
else{location.reload(!0)}}}}
FormUtil.deleteCacheKeys=function(thenFunc)
{if(caches)
{caches.keys().then(function(names)
{for(let name of names)
{if(name.toString().indexOf('google')>=0||name.toString().indexOf('workbox')>=0)
{}
else{console.log('deleting cacheStorage obj: '+name);caches.delete(name)}}
if(thenFunc)
{thenFunc()}})}}
FormUtil.swCacheReset=function(returnFunc)
{if(caches)
{var cachesCount=0;var deteteLeft=0;caches.keys().then(function(names){cachesCount=names.length;deteteLeft=cachesCount;for(let name of names)
{console.log('deleting cache: '+name);caches.delete(name).then(function(status){console.log('Delete Status: '+status);cachesCount--;if(status)deteteLeft--;if(cachesCount<=0)
{var allDeleted=(deteteLeft<=0);returnFunc(allDeleted)}})}})}
else{returnFunc(!1)}}
FormUtil.getMyListData=function(listName)
{var redList={},returnList={};if(localStorage.getItem(listName))
{redList=JSON.parse(localStorage.getItem(listName));if(redList)
{returnList=redList.list.filter(a=>a.owner==FormUtil.login_UserName);return returnList}}}
FormUtil.updateProgressWidth=function(W)
{$('div.indeterminate').css('width',W);$('div.determinate').css('width',W)}
FormUtil.showProgressBar=function(width)
{if(width)
{$('div.indeterminate').css('width',width);$('div.determinate').css('width',width)}
$('#divProgressBar').css('display','block');$('#divProgressBar').show();$('#divProgressBar').css('zIndex','100')}
FormUtil.hideProgressBar=function()
{$('#divProgressBar').hide()}
FormUtil.navDrawerWidthLimit=function(screenWidth)
{var expectedWidth;if(screenWidth>=866)
{expectedWidth=400}
if(screenWidth<=865)
{expectedWidth=400}
if(screenWidth<=559)
{expectedWidth=280}
return expectedWidth};FormUtil.defaultLanguage=function()
{var sessData=DataManager.getSessionData();if(sessData&&sessData.language)
{return sessData.language}
else{return(navigator.language).toString().substring(0,2)}};FormUtil.getTermAttr=function(jsonItem)
{return(jsonItem.term)?'term="'+jsonItem.term+'"':''};FormUtil.getTermAttrStr=function(term)
{return(term)?'term="'+term+'"':''};FormUtil.addTag_TermAttr=function(tags,jsonItem)
{if(jsonItem.term)tags.attr('term',jsonItem.term)};FormUtil.appendActivityTypeIcon=function(iconObj,activityType,statusOpt,cwsRenderObj)
{if(iconObj)
{$.get(activityType.icon.path,function(data){var svgObject=($(data)[0].documentElement);if(activityType.icon.colors)
{if(activityType.icon.colors.background)
{$(svgObject).html($(svgObject).html().replace(/{BGFILL}/g,activityType.icon.colors.background));$(svgObject).attr('colors.background',activityType.icon.colors.background)}
if(activityType.icon.colors.foreground)
{$(svgObject).html($(svgObject).html().replace(/{COLOR}/g,activityType.icon.colors.foreground));$(svgObject).attr('colors.foreground',activityType.icon.colors.foreground)}}
if(statusOpt&&statusOpt.name==cwsRenderObj.status_redeem_submit)
{$(svgObject).css('opacity','1')}
else{$(svgObject).css('opacity','0.4')}
$(iconObj).empty();$(iconObj).append(svgObject);if(FormUtil.dcdConfig.settings&&FormUtil.dcdConfig.settings&&FormUtil.dcdConfig.settings.redeemDefs&&FormUtil.dcdConfig.settings.redeemDefs.activityIconSize&&$(iconObj).html())
{$(iconObj).html($(iconObj).html().replace(/{WIDTH}/g,FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width));$(iconObj).html($(iconObj).html().replace(/{HEIGHT}/g,FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.height))}
if($(iconObj).html())
{var statusIconObj=$('<div id="'+iconObj.attr('id').replace('listItem_icon_activityType_','icon_status_')+'" style="position:relative;left:'+(FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width-(FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.width/1))+'px;top:-'+(FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.height+6)+'px;">&nbsp;</div>');$('#'+iconObj.attr('id')).css('width',(FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width+4)+'px')
$(iconObj).append(statusIconObj)
FormUtil.appendStatusIcon(statusIconObj,statusOpt)}})}}
FormUtil.appendStatusIcon=function(targetObj,statusOpt,skipGet)
{if(FormUtil.dcdConfig)
{if(skipGet!=undefined&&skipGet==!0)
{var iW,iH,sStyle='';if(FormUtil.dcdConfig.settings&&FormUtil.dcdConfig.settings&&FormUtil.dcdConfig.settings.redeemDefs&&FormUtil.dcdConfig.settings.redeemDefs.statusIconSize)
{iW=FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.width;iH=FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.height;sStyle='width:'+iW+'px;height:'+iH+'px;'}
$(targetObj).append($('<img src="'+statusOpt.icon.path+'" style="'+sStyle+'" />'))}
else{$.get(statusOpt.icon.path,function(data){var svgObject=($(data)[0].documentElement);if(statusOpt.icon.colors)
{if(statusOpt.icon.colors.background)
{$(svgObject).html($(svgObject).html().replace(/{BGFILL}/g,statusOpt.icon.colors.background));$(svgObject).attr('colors.background',statusOpt.icon.colors.background)}
if(statusOpt.icon.colors.foreground)
{$(svgObject).html($(svgObject).html().replace(/{COLOR}/g,statusOpt.icon.colors.foreground));$(svgObject).attr('colors.foreground',statusOpt.icon.colors.foreground)}}
$(targetObj).empty();$(targetObj).append(svgObject);if(FormUtil.dcdConfig.settings&&FormUtil.dcdConfig.settings&&FormUtil.dcdConfig.settings.redeemDefs&&FormUtil.dcdConfig.settings.redeemDefs.statusIconSize)
{$(targetObj).html($(targetObj).html().replace(/{WIDTH}/g,FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.width));$(targetObj).html($(targetObj).html().replace(/{HEIGHT}/g,FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.height))}})}}}
FormUtil.setStatusOnTag=function(statusSecDivTag,itemData,cwsRenderObj)
{var imgSyncIconTag=statusSecDivTag.find('small.syncIcon img');if(itemData.status===cwsRenderObj.status_redeem_submit)
{imgSyncIconTag.attr('src','img/sync-n.svg')}
else if(itemData.status===cwsRenderObj.status_redeem_failed)
{if(!itemData.networkAttempt||(itemData.networkAttempt&&itemData.networkAttempt<cwsRenderObj.storage_offline_ItemNetworkAttemptLimit))
{imgSyncIconTag.attr('src','img/sync-banner.svg')}
else{if(itemData.networkAttempt>=cwsRenderObj.storage_offline_ItemNetworkAttemptLimit)
{imgSyncIconTag.attr('src','img/sync_error.svg')}
else{imgSyncIconTag.attr('src','img/sync-n.svg')}}}
else{imgSyncIconTag.attr('src','img/sync-banner.svg')}
imgSyncIconTag.css('transform','')}
FormUtil.getActivityType=function(itemData)
{var opts=FormUtil.dcdConfig.settings.redeemDefs.activityTypes;for(var i=0;i<opts.length;i++)
{if(opts[i].name==itemData.activityType)
{return opts[i]}}}
FormUtil.getStatusOpt=function(itemData)
{var opts=FormUtil.dcdConfig.settings.redeemDefs.statusOptions;for(var i=0;i<opts.length;i++)
{if(opts[i].name==itemData.status)
{return opts[i]}}}
FormUtil.listItemActionUpdate=function(itemID,prop,value)
{}
FormUtil.gAnalyticsEventAction=function()
{var dcd=DataManager.getUserConfigData();if(dcd&&dcd.orgUnitData)
{return'country:'+dcd.orgUnitData.countryOuCode+';userName:'+FormUtil.login_UserName+';network:'+ConnManager.connStatusStr(ConnManager.isOnline())+';appLaunch:'+FormUtil.PWAlaunchFrom()}
else{return'country:none;userName:'+FormUtil.login_UserName+';network:'+ConnManager.connStatusStr(ConnManager.isOnline())+';appLaunch:'+FormUtil.PWAlaunchFrom()}}
FormUtil.gAnalyticsEventLabel=function()
{return'networkOnline: '+ConnManager.isOnline()+', dataServerOnline: '+ConnManager.dataServerOnline()}
FormUtil.PWAlaunchFrom=function()
{if((matchMedia('(display-mode: standalone)').matches)||('standalone' in navigator))
{return'homeScreen'}
else{return'browser'}}
FormUtil.jsonReadFormat=function(jsonData)
{if(jsonData)return JSON.stringify(jsonData).toString().replace(/{/g,'').replace(/}/g,'').replace(/":"/g,' = ');else return''}
FormUtil.lookupJsonArr=function(jsonData,fldSearch,fldValue,searchValue)
{for(var i=0;i<jsonData.length;i++)
{if(jsonData[i][fldSearch]==searchValue)
{return jsonData[i][fldValue]}}}
FormUtil.shareApp=function(){var text="See what I've found: an installable Progressive Web App for Connecting with Sara";if('share' in navigator){navigator.share({title:'CwS: Connect App',text:text,url:location.href,})}else{location.href='https://api.whatsapp.com/send?text='+encodeURIComponent(text+' - ')+location.href}}
FormUtil.testNewSWavailable=function()
{console.log('testing new SW available ');window.isUpdateAvailable.then(isAvailable=>{console.log(' ~ SW isUpdateAvailable: '+isAvailable);if(isAvailable){var btnUpgrade=$('<a class="notifBtn" term=""> REFRESH </a>');$(btnUpgrade).click(()=>{location.reload(!0)});MsgManager.notificationMessage('New updates found and applied!','notificationDark',btnUpgrade,'','left','bottom',5000)}})}