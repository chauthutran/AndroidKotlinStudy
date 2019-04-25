function ConnManager(){}
ConnManager.network_Online=!0;ConnManager.appConnMode_Online=!0;ConnManager.appShellServer_Online=!0;ConnManager.currIntv_Online=!0;ConnManager.prevIntv_Online=!0;ConnManager.IntvCountBuildUp=0;ConnManager.IntvCountCheckPoint=5;ConnManager.IntvTime=500;ConnManager.dataServer_Online=!0;ConnManager.dataServer_timerIntv=30000;ConnManager.dataServer_timerID=0;ConnManager.dataServerDetect=0;ConnManager.connChangeAsked=!1;ConnManager.connChangeAskedMode=!1;ConnManager.switch_waitMaxCount=20;ConnManager.switchActionStarted=!1;ConnManager.switchBuildUp=0;ConnManager._cwsRenderObj;ConnManager.changeConnModeTo;ConnManager.changeConnModeStr;ConnManager.userNetworkMode=!1;ConnManager.userNetworkMode_Online=!0;ConnManager.userNetworkMode_TimerPrompt=1800000;ConnManager.userNetworkMode_dtmSet;ConnManager.userNetworkMode_dtmPrompt;ConnManager.userNetworkMode_TestExempt=!1;ConnManager.userNetworkMode_Override=!1;ConnManager.speedMode='normal';ConnManager.debugMode=!1;ConnManager.isOffline=function(){return!ConnManager.network_Online};ConnManager.isOnline=function(){return ConnManager.network_Online}
ConnManager.connStatusStr=function(bOnline){return(bOnline)?'Online':'Offline'}
ConnManager.getAppConnMode_Online=function(){return ConnManager.appConnMode_Online}
ConnManager.getAppConnMode_Offline=function(){return!ConnManager.appConnMode_Online}
ConnManager.setAppConnMode_Initial=function()
{if(ConnManager.isOnline())
{FormUtil.getDataServerAvailable(function(success,jsonData)
{if(success&&jsonData&&jsonData.available!=undefined)
{ConnManager.dataServer_Online=jsonData.available}
else{ConnManager.dataServer_Online=!1}
ConnManager.setAppConnMode(ConnManager.dataServer_Online);ConnManager.connStatTagUpdate(ConnManager.network_Online,ConnManager.dataServer_Online)})}
else{ConnManager.setAppConnMode(ConnManager.isOnline());ConnManager.connStatTagUpdate(ConnManager.network_Online,ConnManager.dataServer_Online)}}
ConnManager.setAppConnMode=function(bOnline)
{ConnManager.appConnMode_Online=(bOnline!=undefined?bOnline:!1);ConnManager.connChangeAsked=!1;var navBgColor=(bOnline)?'#0D47A1':'#ee6e73';$('#divNav').css('background-color',navBgColor);var stat=(bOnline)?'online':'offline';var displayText=(bOnline)?'[online mode]':'[offline mode]';$('#appModeConnStatus').attr('connStat',stat).text(displayText)}
ConnManager.setUp_AppConnModeDetection=function()
{ConnManager.currIntv_Online=ConnManager.network_Online;ConnManager.prevIntv_Online=ConnManager.network_Online;setInterval(function()
{var bNetworkOnline=ConnManager.isOnline()&&ConnManager.dataServer_Online;ConnManager.currIntv_Online=(bNetworkOnline!=undefined?bNetworkOnline:!1);if(!ConnManager.userNetworkMode)
{if(ConnManager.debugMode)console.log('Interval:setUp_AppConnModeDetection > bNetworkOnline: '+bNetworkOnline+'('+ConnManager.isOnline()+'), ConnManager.dataServer_Online: '+ConnManager.dataServer_Online+', ConnManager.appConnMode_Online: '+ConnManager.appConnMode_Online+', ConnManager.connChangeAsked: '+ConnManager.connChangeAsked)}
var connStateChanged=(ConnManager.currIntv_Online!=ConnManager.prevIntv_Online);if(!ConnManager.userNetworkMode||(ConnManager.userNetworkMode&&ConnManager.userNetworkMode_TestExempt))
{if(connStateChanged)ConnManager.IntvCountBuildUp=0;else ConnManager.IntvCountBuildUp++;if(ConnManager.switchActionStarted)
{ConnManager.switchBuildUp++;if(ConnManager.switchBuildUp>=ConnManager.switch_waitMaxCount)ConnManager.switchActionStarted=!1}
if(!ConnManager.switchActionStarted)
{if(!ConnManager.connChangeAsked)
{if(ConnManager.IntvCountBuildUp>=ConnManager.IntvCountCheckPoint)
{if(ConnManager.appConnMode_Online!=ConnManager.currIntv_Online)
{if(ConnManager.dataServer_timerID)
{clearInterval(ConnManager.dataServer_timerID);ConnManager.dataServer_timerID=0;ConnManager.dataServerDetect=0}
if(ConnManager.debugMode)console.log('skipped exemption test 1: '+ConnManager.currIntv_Online);ConnManager.connChangeAskedMode=ConnManager.currIntv_Online;ConnManager.change_AppConnModePrompt("interval",ConnManager.currIntv_Online)}
else{if(ConnManager.isOnline()&&!ConnManager.dataServer_Online)
{if(!ConnManager.dataServer_timerID)ConnManager.setUp_dataServerModeDetection()}}
ConnManager.IntvCountBuildUp=0}}
else{if(ConnManager.IntvCountBuildUp==60)
{if(ConnManager.isOnline()&&!ConnManager.dataServer_Online&&!ConnManager.connChangeAsked)
{if(ConnManager.debugMode)console.log('skipped exemption test 2');ConnManager.connChangeAskedMode=ConnManager.currIntv_Online;ConnManager.change_AppConnModePrompt("interval",ConnManager.currIntv_Online);ConnManager.IntvCountBuildUp=0}
else if(bNetworkOnline!=ConnManager.appConnMode_Online&&!ConnManager.connChangeAsked)
{if(ConnManager.debugMode)console.log('skipped exemption test 3');ConnManager.connChangeAskedMode=ConnManager.currIntv_Online;ConnManager.change_AppConnModePrompt("interval",ConnManager.currIntv_Online);ConnManager.IntvCountBuildUp=0}
if(ConnManager.debugMode)console.log('Interval:setUp_AppConnModeDetection DIFFERENT network MODE vs actual '+bNetworkOnline+'('+ConnManager.isOnline()+'), ConnManager.dataServer_Online: '+ConnManager.dataServer_Online+', ConnManager.appConnMode_Online: '+ConnManager.appConnMode_Online+', IntvCountBuildUp: '+ConnManager.IntvCountBuildUp+', ConnManager.dataServerDetect: '+ConnManager.dataServerDetect+', ConnManager.dataServer_timerID: '+ConnManager.dataServer_timerID)}
else{if(ConnManager.connChangeAsked&&ConnManager.currIntv_Online!=ConnManager.connChangeAskedMode)
{MsgManager.clearReservedMessage(ConnManager.changeConnModeStr.toUpperCase()+'_'+ConnManager.connStatusStr(ConnManager.connChangeAskedMode).toUpperCase());ConnManager.IntvCountBuildUp=0;ConnManager.userNetworkMode=!1;ConnManager.switchActionStarted=!1;ConnManager.switchBuildUp=0;ConnManager.changeConnModeStr='';ConnManager.connChangeAsked=!1;ConnManager.userNetworkMode_Override=!1;ConnManager.userNetworkMode_TestExempt=!1}}}}}
else{if((new Date())-(new Date(ConnManager.userNetworkMode_dtmPrompt))>=ConnManager.userNetworkMode_TimerPrompt)
{if(ConnManager.userNetworkMode_Online!=bNetworkOnline)
{ConnManager.userNetworkMode_TestExempt=!0}
else{ConnManager.userNetworkMode_TestExempt=!1}}
else{ConnManager.userNetworkMode_TestExempt=!1}
if(ConnManager.debugMode)console.log('userNetworkMode {'+ConnManager.userNetworkMode_Online+'} > ExemptTEST passed: '+ConnManager.userNetworkMode_TestExempt+' ('+bNetworkOnline+') >> '+(((new Date())-(new Date(ConnManager.userNetworkMode_dtmPrompt)))>=ConnManager.userNetworkMode_TimerPrompt)+' > target: '+ConnManager.userNetworkMode_TimerPrompt)}
ConnManager.prevIntv_Online=bNetworkOnline},ConnManager.IntvTime)}
ConnManager.change_AppConnModePrompt=function(modeStr,requestConnMode)
{var changeConnModeTo=!1;var questionStr="Unknown Mode";ConnManager.changeConnModeStr=modeStr;ConnManager.userNetworkMode_dtmPrompt=(new Date()).toISOString();if(FormUtil.checkLogin())
{if(modeStr==="interval")
{if(requestConnMode!==undefined)
{ConnManager.changeConnModeTo=requestConnMode;changeConnModeTo=requestConnMode}
var changeConnStr=ConnManager.connStatusStr(changeConnModeTo);questionStr="Network changed: switch to '"+changeConnStr.toUpperCase()+"' mode?"}
else if(modeStr==="switch")
{var currConnStat=ConnManager.appConnMode_Online;changeConnModeTo=!currConnStat;ConnManager.changeConnModeTo=!currConnStat;var changeConnStr=ConnManager.connStatusStr(changeConnModeTo);questionStr="Network mode: switch to '"+changeConnStr+"'?"}
if(ConnManager.debugMode)console.log('ConnManager.change_AppConnModePrompt: '+ConnManager.changeConnModeStr+', '+ConnManager.changeConnModeTo+', userNetworkMode_TestExempt:'+ConnManager.userNetworkMode_TestExempt);var btnSwitch=$('<a term="" class="notifBtn">SWITCH</a>');$(btnSwitch).click(()=>{if(ConnManager.userNetworkMode_TestExempt)
{ConnManager.userNetworkMode_Override=!0}
ConnManager.switchPreDeterminedConnMode()});MsgManager.notificationMessage(questionStr,'notificationDark',btnSwitch,'','right','top',20000,!0,ConnManager.cancelSwitchPrompt,modeStr.toUpperCase()+'_'+changeConnStr.toUpperCase());if(ConnManager.debugMode)console.log('created notifPrompt "supposedly" : '+questionStr);ConnManager.connChangeAsked=!0;ConnManager.connChangeAskedMode=ConnManager.changeConnModeTo;ConnManager.userNetworkMode_dtmPrompt=(new Date()).toISOString()}};ConnManager.switchPreDeterminedConnMode=function()
{if(FormUtil.checkLogin())
{if(ConnManager.debugMode)console.log('switchPreDeterminedConnMode > switching to ['+ConnManager.changeConnModeTo+']');if(ConnManager.userNetworkMode)
{if(ConnManager.userNetworkMode_Override)
{ConnManager.userNetworkMode=!1}}
ConnManager.setAppConnMode(ConnManager.changeConnModeTo);if(ConnManager._cwsRenderObj)
{if(ConnManager.debugMode)console.log('ConnManager._cwsRenderObj.startBlockExecuteAgain(): to '+ConnManager.changeConnModeTo);ConnManager._cwsRenderObj.startBlockExecuteAgain()}
if(ConnManager.changeConnModeStr==="interval")
{ConnManager.IntvCountBuildUp=0;ConnManager.userNetworkMode=!1}
else if(ConnManager.changeConnModeStr==="switch")
{ConnManager.switchActionStarted=!0;ConnManager.switchBuildUp=0}
ConnManager.changeConnModeStr='';ConnManager.connChangeAsked=!1;ConnManager.userNetworkMode_Override=!1;ConnManager.userNetworkMode_TestExempt=!1;ConnManager.setUp_dataServerModeDetection()}}
ConnManager.cancelSwitchPrompt=function()
{if(ConnManager.debugMode)console.log('cancelSwitchPrompt > connChangeAsked: '+ConnManager.connChangeAsked+', userNetworkMode: '+ConnManager.userNetworkMode+', userNetworkMode_TestExempt: '+ConnManager.userNetworkMode_TestExempt);if(ConnManager.userNetworkMode&&ConnManager.userNetworkMode_TestExempt)
{ConnManager.userNetworkMode_TestExempt=!1;ConnManager.setUserNetworkMode(!0)}
ConnManager.changeConnModeStr='';ConnManager.connChangeAsked=!1;ConnManager.IntvCountBuildUp=0}
ConnManager.setUp_dataServerModeDetection=function()
{if(ConnManager.debugMode)console.log('initiate setUp_dataServerModeDetection > existing timer: '+ConnManager.dataServer_timerID);if(ConnManager.dataServer_timerID)
{if(ConnManager.debugMode)console.log(' 1st clearing TIMER [ConnManager.dataServer_timerID] :'+ConnManager.dataServer_timerID);clearInterval(ConnManager.dataServer_timerID);ConnManager.dataServer_timerID=0;ConnManager.dataServerDetect=0}
ConnManager.detectDataServerOnline();ConnManager.dataServer_timerID=setInterval(function()
{if(ConnManager.debugMode)console.log('   eval dataServerMode > existing timer: '+ConnManager.dataServer_timerID);ConnManager.detectDataServerOnline();ConnManager.dataServerDetect ++},ConnManager.dataServer_timerIntv)}
ConnManager.detectDataServerOnline=function(forceDataServerOnline)
{if(ConnManager.debugMode)console.log('detecting DataServerOnline > '+(new Date()).toISOString());if(forceDataServerOnline!=undefined)ConnManager.dataServer_Online=forceDataServerOnline;var bNetworkOnline=ConnManager.isOnline();if(!bNetworkOnline)
{ConnManager.dataServer_Online=!1;ConnManager.connStatTagUpdate(ConnManager.network_Online,ConnManager.dataServer_Online);if(ConnManager.appConnMode_Online!=bNetworkOnline&&!ConnManager.connChangeAsked)
{if(ConnManager.debugMode)console.log('skipped exemption test 5');ConnManager.changeConnModeTo="offline";ConnManager.change_AppConnModePrompt("interval",!1)}}
else{if(ConnManager.debugMode)console.log(' DataServerOnline > checking server status API call + wait');if(forceDataServerOnline!=undefined)
{if(ConnManager.network_Online!=ConnManager.dataServer_Online)
{if(!ConnManager.dataServer_Online&&ConnManager.dataServer_timerID>0&&!ConnManager.connChangeAsked)
{if(ConnManager.debugMode)console.log('skipped exemption test 6: '+forceDataServerOnline);ConnManager.changeConnModeTo="offline";ConnManager.change_AppConnModePrompt("interval",!1)}
else{if(ConnManager.dataServer_Online&&!ConnManager.appConnMode_Online&&!ConnManager.connChangeAsked)
{if(ConnManager.debugMode)console.log('skipped exemption test 7');ConnManager.changeConnModeTo="online";ConnManager.change_AppConnModePrompt("interval",!0)}}}
else{if(FormUtil.checkLogin()&&ConnManager.dataServer_Online&&!ConnManager.getAppConnMode_Online()&&!ConnManager.connChangeAsked&&!ConnManager.userNetworkMode)
{if(ConnManager.debugMode)console.log('skipped exemption test 8');ConnManager.changeConnModeTo="online";ConnManager.change_AppConnModePrompt("interval",!0)}}
ConnManager.connStatTagUpdate(ConnManager.network_Online,ConnManager.dataServer_Online)}
else{FormUtil.getDataServerAvailable(function(success,jsonData)
{if(ConnManager.debugMode)console.log('DataServerOnline > success:'+success+' > '+ConnManager.dataServer_timerID);if(success&&jsonData&&jsonData.available!=undefined)
{ConnManager.dataServer_Online=jsonData.available;DataManager.setSessionDataValue('dataServerLastRequest',JSON.stringify(jsonData))}
else{ConnManager.dataServer_Online=!1}
if(ConnManager.dataServer_Online)
{DataManager.setSessionDataValue('dataServer_lastOnline',(new Date()).toISOString())}
if(ConnManager.debugMode)
{console.log(jsonData);console.log('DataServerOnline > dataServer_Online:'+ConnManager.dataServer_Online+', ConnManager.network_Online:'+ConnManager.network_Online+' {existing ConnManager.dataServer_timerID}: '+ConnManager.dataServer_timerID)}
if(ConnManager.network_Online!=ConnManager.dataServer_Online&&ConnManager.appConnMode_Online)
{if(!ConnManager.dataServer_Online&&ConnManager.dataServer_timerID>0&&!ConnManager.connChangeAsked)
{if(ConnManager.debugMode)console.log('skipped exemption test 9');ConnManager.changeConnModeTo="offline";ConnManager.change_AppConnModePrompt("interval",!1)}
else{if(ConnManager.dataServer_Online&&!ConnManager.appConnMode_Online&&!ConnManager.connChangeAsked)
{if(ConnManager.debugMode)console.log('skipped exemption test 10');ConnManager.changeConnModeTo="online";ConnManager.change_AppConnModePrompt("interval",!0)}}}
else{if(FormUtil.checkLogin()&&ConnManager.dataServer_Online&&!ConnManager.getAppConnMode_Online()&&!ConnManager.connChangeAsked&&!ConnManager.userNetworkMode)
{if(ConnManager.debugMode)console.log('skipped exemption test 11');ConnManager.changeConnModeTo="online";ConnManager.change_AppConnModePrompt("interval",!0)}}
ConnManager.connStatTagUpdate(ConnManager.network_Online,ConnManager.dataServer_Online);if(ConnManager.dataServer_timerID>0)
{ConnManager.getAppShellVersion(function(appRetVersion)
{var appShellVersion=$('#spanVersion').html().replace('v','');if(ConnManager.debugMode)console.log(' ~ CHECKING APP VERSION');if(ConnManager.debugMode)console.log(appRetVersion);if(ConnManager.debugMode)console.log(appShellVersion.toString()+' vs '+appRetVersion.toString());if(appShellVersion.toString()<appRetVersion.toString())
{var btnAppShellTag=$('<a term="" class="notifBtn">UPDATE</a>');$(btnAppShellTag).click(()=>{if(ConnManager.isOffline())
{MsgManager.notificationMessage('Cannot update when offline, please.','notificationDark',undefined,'','right','top')}
else{FormUtil.showProgressBar();setTimeout(function(){ConnManager._cwsRenderObj.reGetAppShell()},500)}});MsgManager.notificationMessage('New app version available: '+appRetVersion.toString(),'notificationDark',btnAppShellTag,'','right','bottom',20000,!1,undefined,'newAPPversion')}
else{ConnManager.getDcdConfig(function(dcdRetVersion)
{if(dcdRetVersion)
{var userConfig=JSON.parse(localStorage.getItem(JSON.parse(localStorage.getItem('session')).user));if(ConnManager.debugMode)console.log(' ~ CHECKING DCD VERSION');if(ConnManager.debugMode)console.log(dcdRetVersion);if(ConnManager.debugMode)console.log(userConfig.dcdConfig.version+' vs '+dcdRetVersion.dcdConfig.version.toString());if((userConfig.dcdConfig.version).toString()<dcdRetVersion.dcdConfig.version.toString())
{DataManager.setSessionDataValue('dcdUpgrade',JSON.stringify(dcdRetVersion));var btnDcdConfigTag=$('<a term="" class="notifBtn">UPDATE</a>');$(btnDcdConfigTag).click(()=>{if(ConnManager.isOffline())
{msgManager.msgAreaShow('Please wait until network access is restored.')}
else{FormUtil.showProgressBar();setTimeout(function(){var newConfig=DataManager.getSessionData().dcdUpgrade;console.log(userConfig);DataManager.setSessionDataValue('dcdUpgrade','');ConnManager._cwsRenderObj.loginObj._pHash=userConfig.mySession.pin;ConnManager._cwsRenderObj.loginObj._staySignedIn=!1;ConnManager._cwsRenderObj.loginObj.loginSuccessProcess(JSON.parse(newConfig));FormUtil.hideProgressBar()},500)}});MsgManager.notificationMessage('New config version available: '+dcdRetVersion.dcdConfig.version.toString(),'notificationDark',btnDcdConfigTag,'','right','bottom',20000,!1,undefined,'newDCDversion')}}})}})}})}}}
ConnManager.dataServerOnline=function()
{return ConnManager.dataServer_Online}
ConnManager.networkSyncConditions=function()
{return(ConnManager.isOnline()&&ConnManager.dataServer_Online)}
ConnManager.connStatTagUpdate=function(bOnline,bDataServerOnline)
{var imgSrc=(bOnline&&bDataServerOnline)?'images/sharp-cloud_queue-24px.svg':((bOnline)?'images/baseline-cloud_off-24px-unavailable.svg':'images/baseline-cloud_off-24px.svg');$('#imgNetworkStatus').css('transform',(bOnline&&bDataServerOnline)?'':'rotateY(180deg)');setTimeout(function(){$('#imgNetworkStatus').attr('src',imgSrc)},500);$('#divNetworkStatus').css('display','block')}
ConnManager.setUserNetworkMode=function(requestConnMode)
{ConnManager.userNetworkMode_dtmSet=(new Date()).toISOString();ConnManager.userNetworkMode_dtmPrompt=(new Date()).toISOString();ConnManager.userNetworkMode_Online=requestConnMode}
ConnManager.getAppShellVersion=function(returnFunc)
{var loadingTag=undefined;var queryLoc=FormUtil.getWsUrl('/api/getPWAInfo');if(ConnManager.isOnline())
{FormUtil.wsRetrievalGeneral(queryLoc,loadingTag,function(returnJson)
{if(returnFunc)
{if(returnJson==undefined)returnFunc(0);else returnFunc(returnJson.version)}
else return!1})}}
ConnManager.getDcdConfigVersion=function(returnFunc)
{if(localStorage.getItem('session')!==null)
{if(localStorage.getItem('session')&&localStorage.getItem('session').user&&(localStorage.getItem('session').user).length)
{var loadingTag=undefined;var userName=JSON.parse(localStorage.getItem('session')).user;var userPin=Util.decrypt(FormUtil.getUserSessionAttr(userName,'pin'),4);FormUtil.submitLogin(userName,userPin,loadingTag,function(success,loginData)
{if(success)
{if(returnFunc)returnFunc(loginData.dcdConfig.version);else return success}
else{if(returnFunc)returnFunc(undefined);else return undefined}})}
else return undefined}
else return undefined}
ConnManager.getDcdConfig=function(returnFunc)
{if(localStorage.getItem('session')!==null)
{var loadingTag=undefined;var userName=JSON.parse(localStorage.getItem('session')).user;var userPin=Util.decrypt(FormUtil.getUserSessionAttr(userName,'pin'),4);FormUtil.submitLogin(userName,userPin,loadingTag,function(success,loginData)
{if(success)
{if(returnFunc)returnFunc(loginData);else return success}
else{if(returnFunc)returnFunc(undefined);else return undefined}})}
else return undefined}