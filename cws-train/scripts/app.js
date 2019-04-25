(function(){'use strict';let _registrationObj;const _cwsRenderObj=new cwsRender();var debugMode=!1;window.onload=function(){}
function startApp()
{FormMsgManager.appBlock("<img src='img/Connect.svg' class='cwsLogoRotateSpin' style='width:44px;height:44px;'>");updateOnlineStatus();window.addEventListener('online',updateOnlineStatus);window.addEventListener('offline',updateOnlineStatus);ConnManager.setAppConnMode_Initial();ConnManager.setUp_AppConnModeDetection();appInfoOperation(function(){ConnManager._cwsRenderObj=_cwsRenderObj;_cwsRenderObj.render();syncManager.initialize(_cwsRenderObj)});window.addEventListener('appinstalled',function(event)
{ga('send',{'hitType':'event','eventCategory':'appinstalled','eventAction':FormUtil.gAnalyticsEventAction(),'eventLabel':FormUtil.gAnalyticsEventLabel()})});{$("#passReal").keydown(function(event){if(event.keyCode==8||event.keyCode==46)
{$("#passReal").val('');$("#pass").val('')}});$("#passReal").keyup(function(event){$('#pass').val($('#passReal').val());$('#passReal').css('left',$('#pass').position().left+10+(5.5*($('#pass').val().length))+'px')});$("#pass").focus(function(){$('#passReal').focus();$('#passReal').css('left',$('#pass').position().left+10+(5.5*($('#pass').val().length))+'px');$('#passReal').css('top',$('#pass').position().top+8)});setTimeout(function(){$('#passReal').css('top',$('#pass').position().top+12);$('#passReal').css('left',$('#pass').position().left+20+'px')},500)}}
$('#spanVersion').text('v'+_ver);$('#imgAppDataSyncStatus').click(()=>{syncManager.syncOfflineData(this)});$('#hidenotificationUpgrade').click(()=>{$('#notificationUpgrade').hide('slow')});function appInfoOperation(returnFunc)
{if(ConnManager.getAppConnMode_Online())
{FormUtil.getConfigInfo(function(result,data)
{console.log(data);try{if((location.href).indexOf('.psi-mis.org')>=0)
FormUtil.dynamicWS=data[(location.host).replace('.psi-mis.org','')];else FormUtil.dynamicWS=data["cws-dev"]}
catch(err){try{FormUtil.dynamicWS=data["cws-dev"]}
catch(err){console.log(err.message)}}
console.log(FormUtil.dynamicWS);FormUtil.staticWSName=(FormUtil.dynamicWS.targetWS).toString().split('/')[(FormUtil.dynamicWS.targetWS).toString().split('/').length-1];FormUtil._serverUrlOverride='';for(var i=0;i<(FormUtil.dynamicWS.targetWS).toString().split('/').length-1;i++)
{FormUtil._serverUrlOverride=FormUtil._serverUrlOverride+(FormUtil.dynamicWS.targetWS).toString().split('/')[i];if(i<(FormUtil.dynamicWS.targetWS).toString().split('/').length-2)FormUtil._serverUrlOverride+='/'}
console.log(FormUtil._serverUrlOverride);FormUtil.getAppInfo(function(success,jsonData)
{if(debugMode)console.log('AppInfoOperation: '+success)
if(jsonData)
{FormUtil._getPWAInfo=jsonData;if(debugMode)console.log('AppInfo Retrieved: '+FormUtil._getPWAInfo);appVersionUpgradeReview(jsonData);if(!FormUtil.isAppsPsiServer())
{webServiceSet(jsonData.appWS.cwsDev)}
else{webServiceSet(jsonData.appWS.cws)}}
FormMsgManager.appUnblock();returnFunc()})})}
else{if(debugMode)console.log('not PSI server')
if(!FormUtil._getPWAInfo)
{FormUtil._getPWAInfo={"reloadInstructions":{"session":"false","allCaches":"false","serviceWorker":"false"},"appWS":{"cws-dev":"eRefWSDev3","cws-train":"eRefWSTrain","cws":"eRefWSDev3"},"version":_ver}}
appVersionUpgradeReview(FormUtil._getPWAInfo);FormMsgManager.appUnblock();returnFunc()}};function appVersionUpgradeReview(jsonData)
{var latestVersionStr=(jsonData.version)?jsonData.version:'';if(debugMode)console.log(_ver,' vs ',latestVersionStr);if(_ver<latestVersionStr)
{var btnUpgrade=$('<a class="notifBtn" term=""> REFRESH </a>');$(btnUpgrade).click(()=>{if(FormUtil._getPWAInfo)
{if(FormUtil._getPWAInfo.reloadInstructions&&FormUtil._getPWAInfo.reloadInstructions.session&&FormUtil._getPWAInfo.reloadInstructions.session=="true")
{if(debugMode)console.log('btnRefresh > DataManager.clearSessionStorage() ');DataManager.clearSessionStorage()}
if(FormUtil._getPWAInfo.reloadInstructions&&FormUtil._getPWAInfo.reloadInstructions.allCaches&&FormUtil._getPWAInfo.reloadInstructions.allCaches=="true")
{if(debugMode)console.log('btnRefresh > FormUtil.deleteCacheKeys() ');FormUtil.deleteCacheKeys()}}});MsgManager.notificationMessage('New version of this app is available','notificationDark',btnUpgrade,'','right','bottom',15000)}}
function webServiceSet(wsName)
{if(wsName)
{FormUtil.staticWSName=wsName}}
function updateOnlineStatus(event)
{ConnManager.network_Online=navigator.onLine;ConnManager.connStatTagUpdate(ConnManager.network_Online,ConnManager.dataServer_Online);if(ConnManager.dataServer_timerID==0)ConnManager.setUp_dataServerModeDetection();if(_cwsRenderObj.initializeStartBlock)
{syncManager.initialize(_cwsRenderObj)}};function updateSyncManager(event)
{syncManager.initialize(_cwsRenderObj)}
if('serviceWorker' in navigator){navigator.serviceWorker.register('./service-worker.js').then(registration=>{registration.onupdatefound=()=>{const installingWorker=registration.installing;installingWorker.onstatechange=()=>{switch(installingWorker.state){case 'installed':if(navigator.serviceWorker.controller){}else{}
break}}};_cwsRenderObj.setRegistrationObject(registration);_registrationObj=registration;if(debugMode)console.log('Service Worker Registered')}).then(function(){startApp()}).catch(err=>MsgManager.notificationMessage('SW ERROR: '+err,'notificationDark',undefined,'','left','bottom',5000))}})()