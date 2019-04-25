function Login(cwsRenderObj)
{var me=this;me.cwsRenderObj=cwsRenderObj;me.loginFormDivTag=$("#loginFormDiv");me.pageDivTag=$("#pageDiv");me.menuTopDivTag;me.loggedInDivTag=$('#loggedInDiv');me.spanOuNameTag=$('#spanOuName');me.pageTitleDivTab=$('div.logo-desc-all');me._userName='';me._pHash='';me._staySignedIn=!0;me.initialize=function()
{me.setEvents_OnInit()}
me.render=function()
{me.openForm()}
me.setEvents_OnInit=function()
{FormUtil.setUpTabAnchorUI(me.loginFormDivTag);me.setLoginFormEvents()}
me.setLoginFormEvents=function()
{me.setLoginBtnClick();me.setloginBtnClearClick()}
me.setLoginBtnClick=function()
{$('.loginBtn').click(function(){var parentTag=$(this).parent();var loginUserNameVal=parentTag.find('input.loginUserName').val();var loginUserPinVal=parentTag.find('input.loginUserPin').val();me.processLogin(loginUserNameVal,loginUserPinVal,location.origin,$(this))});$('.loginBtnAdv').click(function(){var parentTag=$(this).parent();var loginServer=parentTag.find('input.loginServerAdv').val();var loginUserNameVal=parentTag.find('input.loginUserNameAdv').val();var loginUserPinVal=parentTag.find('input.loginUserPinAdv').val();me.processLogin(loginUserNameVal,loginUserPinVal,loginServer,$(this))})}
me.setloginBtnClearClick=function()
{$('.loginBtnClear').click(function(){$('input.loginUserName').val('');$('input.loginUserPin').val('');$('input.loginUserNameAdv').val('');$('input.loginUserPinAdv').val('');me.openForm()})}
me.setUpEnterKeyLogin=function()
{}
me.openForm=function()
{me.pageDivTag.hide();me.loginFormDivTag.show('fast');var divIcon=$('div.logo_top');if(!me.loginFormDivTag.is(":visible"))
{me.loginFormDivTag.show()}
$('#loggedInDiv').hide();me.pageTitleDivTab.show();me.pageTitleDivTab.html('CONNECT');Menu.setInitialLogInMenu(me.cwsRenderObj)}
me.closeForm=function()
{me.loginFormDivTag.hide();me.pageDivTag.show('fast');$('#loggedInDiv').show()}
me.processLogin=function(userName,password,server,btnTag)
{var parentTag=btnTag.parent();var dtmNow=(new Date()).toISOString();me._staySignedIn=!1;me._userName=userName;parentTag.find('div.loadingImg').remove();if(!ConnManager.networkSyncConditions())
{if(FormUtil.getUserSessionAttr(userName,'pin'))
{if(password===Util.decrypt(FormUtil.getUserSessionAttr(userName,'pin'),4))
{var loginData=DataManager.getData(userName);if(loginData)
{if(loginData.mySession.pin)me._pHash=loginData.mySession.pin;FormUtil.setLogin(userName,password);me.loginSuccessProcess(loginData)}}
else{MsgManager.notificationMessage('Login Failed > invalid userName/pin','notificationDark',undefined,'','right','top')}}
else{if(!ConnManager.isOnline())
{MsgManager.notificationMessage('No network connection > cannot login','notificationDark',undefined,'','right','top')}
else{MsgManager.notificationMessage('Data server offline > cannot verify login details','notificationDark',undefined,'','right','top')}}}
else{var loadingTag=FormUtil.generateLoadingTag(btnTag);FormUtil.submitLogin(userName,password,loadingTag,function(success,loginData)
{if(success)
{me._pHash=Util.encrypt(password,4);me.loginSuccessProcess(loginData)}
else{var errDetail=(loginData&&loginData.returnCode===502)?" - Server not available":"";MsgManager.notificationMessage('Login Failed'+errDetail,'notificationDark',undefined,'','right','top')}})}
var lastSession={user:userName,lastUpdated:dtmNow,language:FormUtil.defaultLanguage()};DataManager.saveData('session',lastSession)}
me.regetDCDconfig=function()
{var userName=JSON.parse(localStorage.getItem('session')).user;var userPin=Util.decrypt(FormUtil.getUserSessionAttr(userName,'pin'),4);console.log(userName,userPin);alert('login.js: ');me.processLogin(userName,userPin,location.origin,$(this))}
me.loginSuccessProcess=function(loginData)
{me.closeForm();me.pageTitleDivTab.hide();if(loginData.orgUnitData)
{me.loggedInDivTag.show();me.spanOuNameTag.show();me.spanOuNameTag.text(' '+loginData.orgUnitData.userName+' ').attr('title',loginData.orgUnitData.ouName)}
if(loginData.dcdConfig)
{FormUtil.dcdConfig=loginData.dcdConfig;me.cwsRenderObj.startWithConfigLoad(loginData.dcdConfig)}
var dtmNow=(new Date()).toISOString();if(loginData.mySession)
{loginData.mySession.lastUpdated=dtmNow;loginData.mySession.stayLoggedIn=!1;DataManager.saveData(me._userName,loginData)}
else{var newSaveObj=Object.assign({},loginData);newSaveObj.mySession={createdDate:dtmNow,lastUpdated:dtmNow,server:FormUtil.login_server,pin:me._pHash,stayLoggedIn:!1,theme:loginData.dcdConfig.settings.theme,language:FormUtil.defaultLanguage()};DataManager.saveData(me._userName,newSaveObj);FormUtil.dcdConfig=newSaveObj.dcdConfig}
me.cwsRenderObj.renderDefaultTheme();ConnManager.setUp_dataServerModeDetection();FormUtil.hideProgressBar()}
me.getInputBtnPairTags=function(formDivStr,pwdInputStr,btnStr,returnFunc)
{$(formDivStr).each(function(i){var formDivTag=$(this);var loginUserPinTag=formDivTag.find(pwdInputStr);var loginBtnTag=formDivTag.find(btnStr);returnFunc(loginUserPinTag,loginBtnTag)})}
me.setUpInputTypeCopy=function(inputTags){inputTags.keyup(function(){var changedVal=$(this).val();console.log('changedVal: '+changedVal);inputTags.val(changedVal)})};me.setUpEnterKeyExecute=function(inputTag,btnTag){inputTag.keypress(function(e){if((e.which&&e.which==13)||(e.keyCode&&e.keyCode==13)){btnTag.click();return!1}else{return!0}})};me.initialize()}