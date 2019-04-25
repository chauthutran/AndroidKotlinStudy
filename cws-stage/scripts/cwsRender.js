function cwsRender()
{var me=this;me.dsConfigLoc='data/dsConfig.json';me.renderBlockTag=$('#renderBlock');me.navDrawerDivTag=$('#navDrawerDiv');me.menuAppMenuIconTag=$('#nav-toggle');me.floatListMenuIconTag=$('.floatListMenuIcon');me.floatListMenuSubIconsTag=$('.floatListMenuSubIcons');me.loggedInDivTag=$('#loggedInDiv');me.headerLogoTag=$('.headerLogo');me.pulsatingProgress=$('#pulsatingCircle');me.configJson;me.areaList=[];me.manifest;me.favIconsObj;me.aboutApp;me.statisticsObj;me.registrationObj;me.loginObj;me.langTermObj;me.storageName_RedeemList="redeemList";me.status_redeem_submit="submit";me.status_redeem_queued="queued";me.status_redeem_paused="paused";me.status_redeem_failed="failed";me.storage_offline_ItemNetworkAttemptLimit=3;me.storage_offline_SyncExecutionTimerInterval=60000;me.storage_offline_SyncConditionsTimerInterval=10000;me._globalMsg="";me._globalJsonData=undefined;me.blocks={};me.activityList=[];me._localConfigUse=!1;me._translateEnable=!0;me.debugMode=!1;me.initialize=function()
{me.setInitialData();me.setEvents_OnInit();me.createSubClasses()}
me.render=function()
{if(me.debugMode)console.log('cwsRender.render()');me.checkStayLoggedIn(function(lastSession,loginData){me.processExistingloggedIn(lastSession,loginData);if(me.debugMode)console.log('cwsRender.render() > processExistingLoggedIn')},function(){if(me.debugMode)console.log('cwsRender.render() > showLoginForm');me.showLoginForm()});var manageInputSwipe=inputMonitor(me);if(me._translateEnable)me.retrieveAndSetUpTranslate()}
me.setInitialData=function()
{me.manifest=FormUtil.getManifest();me.updateFromSession()}
me.setEvents_OnInit=function()
{me.setPageHeaderEvents();me.setOtherEvents()}
me.createSubClasses=function()
{me.langTermObj=new LangTerm(me);me.loginObj=new Login(me);me.aboutApp=new aboutApp(me);me.statisticsObj=new statistics(me)}
me.updateFromSession=function()
{if(DataManager.getSessionDataValue('networkSync'))
{me.storage_offline_SyncExecutionTimerInterval=DataManager.getSessionDataValue('networkSync')}}
me.setPageHeaderEvents=function()
{me.configureMobileMenuIcon()}
me.setOtherEvents=function()
{}
me.setupMenuTagClick=function(menuTag)
{menuTag.click(function()
{var clicked_areaId=$(this).attr('areaId');me.renderArea(clicked_areaId)})}
me.renderArea=function(areaId)
{me.hideAreaRelatedParts();ga('send',{'hitType':'event','eventCategory':'menuClick:'+areaId,'eventAction':FormUtil.gAnalyticsEventAction(),'eventLabel':FormUtil.gAnalyticsEventLabel()});if(areaId==='logOut')me.logOutProcess();else if(areaId==='statisticsPage')me.statisticsObj.render();else if(areaId==='aboutPage')me.aboutApp.render();else{me.clearMenuClickStyles();me.areaList=ConfigUtil.getAllAreaList(me.configJson);var selectedArea=Util.getFromList(me.areaList,areaId,"id");ActivityUtil.addAsActivity('area',selectedArea,areaId);if(selectedArea&&selectedArea.startBlockName)
{if(!$('div.mainDiv').is(":visible"))$('div.mainDiv').show();console.log(' new old block ');var startBlockObj=new Block(me,me.configJson.definitionBlocks[selectedArea.startBlockName],selectedArea.startBlockName,me.renderBlockTag);startBlockObj.render();me.trackUserLocation(selectedArea)}
me.updateMenuClickStyles(areaId)}}
me.renderBlock=function(blockName,options)
{console.log(' new block ');if(options)
{console.log('options: '+JSON.stringify(options));var blockObj=new Block(me,me.configJson.definitionBlocks[blockName],blockName,me.renderBlockTag,undefined,options)}
else{var blockObj=new Block(me,me.configJson.definitionBlocks[blockName],blockName,me.renderBlockTag)}
blockObj.render();return blockObj}
me.startWithConfigLoad=function(configJson)
{if(me._localConfigUse)
{ConfigUtil.getDsConfigJson(me.dsConfigLoc,function(success,configDataFile){me.configJson=configDataFile;ConfigUtil.setConfigJson(me.configJson);me.startBlockExecute(me.configJson)})}
else{me.configJson=configJson;ConfigUtil.setConfigJson(me.configJson);me.startBlockExecute(me.configJson)}}
me.startBlockExecute=function(configJson)
{me.areaList=ConfigUtil.getAreaListByStatus((ConnManager.userNetworkMode?ConnManager.userNetworkMode_Online:ConnManager.networkSyncConditions()),configJson);if(me.areaList)
{var finalAreaList=FormUtil.checkLogin()?Menu.populateStandardMenuList(me.areaList):Menu.setInitialLogInMenu(me);var startMenuTag=me.populateMenuList(finalAreaList);if(startMenuTag&&FormUtil.checkLogin())startMenuTag.click();me.favIconsObj=new favIcons(me)}}
me.startBlockExecuteAgain=function()
{me.startBlockExecute(JSON.parse(localStorage.getItem(JSON.parse(localStorage.getItem('session')).user)).dcdConfig)}
me.configureMobileMenuIcon=function()
{var destArea=$('div.headerLogo');if(destArea)
{document.querySelector("#nav-toggle").addEventListener("click",function(){this.classList.toggle("active");if($(this).hasClass('active'))
{me.updateNavDrawerHeaderContent()}});FormUtil.setClickSwitchEvent(me.menuAppMenuIconTag,me.navDrawerDivTag,['open','close'],me)}}
me.updateNavDrawerHeaderContent=function()
{if(!localStorage.getItem('session'))
{return}
var mySessionData=DataManager.getSessionData();var myData=FormUtil.getMyListData(me.storageName_RedeemList);if(mySessionData&&JSON.parse(localStorage.getItem(mySessionData.user))&&JSON.parse(localStorage.getItem(mySessionData.user)).orgUnitData&&FormUtil.checkLogin())
{$('#divNavDrawerOUlongName').html(JSON.parse(localStorage.getItem(mySessionData.user)).orgUnitData.orgUnit.name)}
else{$('#divNavDrawerOUlongName').html('')}
if(myData&&FormUtil.checkLogin())
{var mySubmit=myData.filter(a=>a.status==me.status_redeem_submit);var myQueue=myData.filter(a=>a.status==me.status_redeem_queued);var myFailed=myData.filter(a=>a.status==me.status_redeem_failed&&(!a.networkAttempt||a.networkAttempt<me.storage_offline_ItemNetworkAttemptLimit));if(me.debugMode)console.log(' cwsR > navMenuStat data ');$('#divNavDrawerSummaryData').html(me.menuStatSummary(mySubmit,myQueue,myFailed))}}
me.menuStatSummary=function(submitList,queueList,failedList)
{var statTbl=$('<table class="tblMenuStatSummary" />');var tr=$('<tr>');var tdFiller=$('<td class="statFiller" />');var tdSubmit=$('<td class="menuStat" />');var tdQueue=$('<td class="menuStat" />');var tdFailed=$('<td class="menuStat" />');statTbl.append(tr);tr.append(tdFiller);var lblSubmit=$('<span class="lblStatSubmit" />');var lblQueue=$('<span class="lblStatQueue" />');var lblFailed=$('<span class="lblStatFailed" />');var dataSubmit=$('<span class="menuDataStat" />');var dataQueue=$('<span class="menuDataStat" />');var dataFailed=$('<span class="menuDataStat" />');if(submitList&&submitList.length)
{FormUtil.appendStatusIcon($(lblSubmit),FormUtil.getStatusOpt({"status":me.status_redeem_submit}),!0);dataSubmit.append(submitList.length);tr.append(tdSubmit)}
if(queueList&&queueList.length)
{FormUtil.appendStatusIcon($(lblQueue),FormUtil.getStatusOpt({"status":me.status_redeem_queued}),!0);dataQueue.append(queueList.length);tr.append(tdQueue)}
if(failedList&&failedList.length)
{FormUtil.appendStatusIcon($(lblFailed),FormUtil.getStatusOpt({"status":me.status_redeem_failed}),!0);dataFailed.append(failedList.length);tr.append(tdFailed)}
tdSubmit.append(lblSubmit,dataSubmit);tdQueue.append(lblQueue,dataQueue);tdFailed.append(lblFailed,dataFailed);return statTbl}
me.populateMenuList=function(areaList)
{var startMenuTag;if(me.debugMode)console.log(' cwsR > populateMenuList ');$('#navDrawerDiv').empty();me.navDrawerDivTag.find('div.menu-mobile-row').remove();var navMenuHead=$('<div style="width:100%;height:100px;margin:0;padding:0;border-radius:0;border-bottom:1px solid rgb(0, 0, 0, 0.1)" class="" />');var navMenuTbl=$('<table id="navDrawerHeader" />');var tr=$('<tr />');var tdLeft=$('<td style="padding: 14px;width:76px;" />');var tdRight=$('<td  style="padding:2px 0 0 0;height:52px;" />');me.navDrawerDivTag.append(navMenuHead);navMenuHead.append(navMenuTbl);navMenuTbl.append(tr);tr.append(tdLeft);tr.append(tdRight);var navMenuLogo=$('<img src="img/logo.svg" />');var userSessionJson=DataManager.getSessionData();var userName=(userSessionJson&&userSessionJson.user&&FormUtil.checkLogin())?userSessionJson.user:"";tdLeft.append(navMenuLogo);tdRight.append($('<div id="divNavDrawerOUName" class="" style="font-size:17pt;font-weight:500;letter-spacing: -0.02em;line-height: 28px;">'+userName+'</div>'));tdRight.append($('<div id="divNavDrawerOUlongName" class="" style="letter-spacing: 0.5px;font-size:12px;font-weight:normal;font-style: normal;padding: 4px 0 0 0"" />'));var tr=$('<tr />');var td=$('<td colspan=2 style="height:20px;" />');navMenuTbl.append(tr);tr.append(td);td.append($('<div id="divNavDrawerSummaryData" class="" style="position:relative;top:-7px;padding: 0 0 0 14px;font-style: normal;font-weight: normal;line-height: 16px;font-size: 14px;Color:#fff;" />'));if(areaList)
{for(var i=0;i<areaList.length;i++)
{var area=areaList[i];var menuTag=$('<table class="menu-mobile-row" areaId="'+area.id+'"><tr><td class="menu-mobile-icon"> <img src="img/'+area.icon+'.svg"> </td> <td class="menu-mobile-label" '+FormUtil.getTermAttr(area)+'>'+area.name+'</td></tr></table>');me.setupMenuTagClick(menuTag);me.navDrawerDivTag.append(menuTag);if(area.startArea)startMenuTag=menuTag}}
if(FormUtil.checkLogin()&&ConnManager.userNetworkMode)
{me.navDrawerDivTag.append('<div id="menu_userNetworkMode" style="padding:10px;font-size:11px;color:#A0A0A1;"><span term="">mode</span>: '+ConnManager.connStatusStr(ConnManager.getAppConnMode_Online())+'</div>')}
else{$('#menu_userNetworkMode').remove()}
me.renderDefaultTheme();return startMenuTag}
me.setRegistrationObject=function(registrationObj)
{me.registrationObj=registrationObj}
me.reGetAppShell=function()
{if(me.registrationObj!==undefined)
{console.log('reloading + unregistering SW');me.registrationObj.unregister().then(function(boolean){{location.reload(!0)}}).catch(err=>{MsgManager.notificationMessage('SW ERROR: '+err,'notificationDark',undefined,'','left','bottom',5000);setTimeout(function(){location.reload(!0)},100)})}
else{MsgManager.notificationMessage('SW unavailable - restarting app','notificationDark',undefined,'','left','bottom',5000);setTimeout(function(){location.reload(!0)},100)}}
me.reGetDCDconfig=function()
{if(me.loginObj!==undefined)
{me.loginObj.regetDCDconfig()}}
me.renderDefaultTheme=function()
{if(me.configJson&&me.configJson.settings&&me.configJson.settings.theme&&me.configJson.themes)
{console.log('Updating to theme: '+me.configJson.settings.theme);var defTheme=me.getThemeConfig(me.configJson.themes,me.configJson.settings.theme);$('nav.bg-color-program').css('background-color',defTheme.navTop.colors.background);$('#spanOuName').css('color',defTheme.navTop.colors.foreground);$('div.bg-color-program-son').css('background-color',defTheme.navMiddle.colors.background);$('#styleCssMobileRow').remove();$('#styleCssPulse').remove();$('#styleCssProgress').remove();$('head').append('<style id="styleCssProgress"> .determinate, .indeterminate { background-color: '+defTheme.navTop.colors.foreground+' } </style>');if(defTheme.button.colors)
{var btnStyle='';if(defTheme.button.colors.foreground)
{btnStyle+=' color: '+defTheme.button.colors.foreground+';'}
if(defTheme.button.colors.background)
{btnStyle+=' background-color: '+defTheme.button.colors.background+';'
$('head').append('<style id="styleCssPulse"> #pulsatingCircle:before, #pulsatingCircle:after { '+btnStyle+' } </style>')}
else{$('head').append('<style id="styleCssPulse"> #pulsatingCircle:before, #pulsatingCircle:after { background-Color: #FFC61D; } </style>')}
$('head').append('<style id="styleCssMobileRow"> .navMenuHeader, .tb-content-buttom { '+btnStyle+' } </style>')}}}
me.getThemeConfig=function(themeArr,theme)
{for(var i=0;i<themeArr.length;i++)
{if(themeArr[i].name==theme)
{return themeArr[i].spec}}}
me.retrieveAndSetUpTranslate=function()
{var defaultLangCode=FormUtil.defaultLanguage();me.langTermObj.setCurrentLang(defaultLangCode)
me.langTermObj.retrieveAllLangTerm(function(allLangTerms)
{if(allLangTerms)
{me.aboutApp.populateLangList_Show(me.langTermObj.getLangList(),defaultLangCode);me.langTermObj.translatePage()}})}
me.checkStayLoggedIn=function(stayedInFunc,notStayedInFunc)
{var initializeStartBlock=!1;if(initializeStartBlock)
{stayedInFunc(lastSession,loginData)}
else{notStayedInFunc()}}
me.processExistingloggedIn=function(lastSession,loginData)
{me.renderDefaultTheme();me.loginObj.loginFormDivTag.hide();me.loginObj._userName=lastSession.user;FormUtil.login_UserName=lastSession.user;FormUtil.login_Password=Util.decrypt(loginData.mySession.pin,4);me.loginObj.loginSuccessProcess(loginData);me.retrieveAndSetUpTranslate()}
me.showLoginForm=function()
{me.loginObj.loginFormDivTag.show();me.loginObj.render()}
me.hideAreaRelatedParts=function()
{me.pulsatingProgress.hide();$('#divProgressBar').hide();$('#focusRelegator').hide();$('#statisticsFormDiv').hide();$('#aboutFormDiv').hide();me.hidenavDrawerDiv()}
me.clearMenuClickStyles=function()
{$('table.menu-mobile-row').css('background-color','#FFF')}
me.updateMenuClickStyles=function(areaId)
{var tag=$('[areaid="'+areaId+'"]').css('background-color','#F2F2F2')}
me.logOutProcess=function()
{FormUtil.undoLogin();me.loginObj.spanOuNameTag.text('');me.loginObj.spanOuNameTag.hide();me.clearMenuPlaceholders();me.navDrawerDivTag.empty();me.renderDefaultTheme();me.loginObj.openForm();syncManager.evalSyncConditions()}
me.clearMenuPlaceholders=function()
{$('#divNavDrawerOUName').html('');$('#divNavDrawerOUlongName').html('');$('#divNavDrawerSummaryData').html('')}
me.trackUserLocation=function(clicked_area)
{var lastSession=JSON.parse(localStorage.getItem('session'));var thisNetworkMode=(ConnManager.getAppConnMode_Online()?'online':'offline');var altNetworkMode=(ConnManager.getAppConnMode_Online()?'offline':'online');var matchOn=["id","startBlockName","name"];var matchedOn,areaMatched;if(lastSession)
{var loginData=JSON.parse(localStorage.getItem(lastSession.user));if(loginData)
{for(var i=0;i<loginData.dcdConfig.areas[thisNetworkMode].length;i++)
{loginData.dcdConfig.areas[thisNetworkMode][i].startArea=!1;if(clicked_area.id==loginData.dcdConfig.areas[thisNetworkMode][i].id)
{loginData.dcdConfig.areas[thisNetworkMode][i].startArea=!0}}
localStorage[lastSession.user]=JSON.stringify(loginData)}}}
me.hidenavDrawerDiv=function()
{if(me.navDrawerDivTag.is(":visible"))
{me.menuAppMenuIconTag.click();me.menuAppMenuIconTag.css('width',0);$('#nav-toggle').removeClass('active')}}
me.initialize()}