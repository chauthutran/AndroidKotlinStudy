function LangTerm(cwsRenderObj)
{var me=this;me.cwsRenderObj=cwsRenderObj;me.allLangTerms={};me.langList=[];me.currentLangTerms={};me.currentLangcode="";me.initialize=function()
{me.setInitialData();me.createSubClasses()}
me.render=function(){}
me.setInitialData=function(){}
me.createSubClasses=function(){}
me.retrieveAllLangTerm=function(returnFunc,forceDownload)
{var langTerms=(forceDownload)?undefined:DataManager.getData(DataManager.StorageName_langTerms);if(langTerms)
{console.log('=== LANG TERMS ==> Local Storage Data Loaded');me.allLangTerms=langTerms;me.setLanguageList(me.allLangTerms);returnFunc(langTerms)}
else{console.log('=== LANG TERMS ==> Retrieving from Web Service');me.retrieveAllLangTermInner(function(returnJson)
{me.allLangTerms=returnJson;me.setLanguageList(me.allLangTerms);if(returnJson)DataManager.saveData(DataManager.StorageName_langTerms,returnJson);returnFunc(returnJson)})}}
me.retrieveAllLangTermInner=function(returnFunc)
{var queryLoc='/api/langTerms'
var loadingTag=undefined;FormUtil.wsRetrievalGeneral(queryLoc,loadingTag,function(returnJson)
{if(returnJson)
{console.log('langTerm: ');if(returnFunc)returnFunc(returnJson)}
else{console.log('=== LANG TERMS ==> Requesting Web Service To DOWNLOAD TRANSLATIONS');FormUtil.wsSubmitGeneral('/api/dailyCache',{"project":"234823"},loadingTag,function(success,allLangTermsJson){if(success&&allLangTermsJson)
{console.log('all langTerm: ');if(returnFunc)returnFunc(allLangTermsJson)}
else{console.log('all langTerm FAILED: ');if(returnFunc)returnFunc(new Object())}})}})}
me.translatePage=function()
{console.log('translating page: '+me.currentLangcode);var termCollection={};var tagsWithTerm=$('[term]');tagsWithTerm.each(function()
{var tag=$(this);var termName=tag.attr('term');if(termName)
{termCollection[termName]=""}});for(var termName in termCollection)
{var termVal=me.currentLangTerms[termName];if(termVal)
{var tag=$('[term="'+termName+'"]');tag.html(termVal)}}}
me.translateText=function(defaultText,termName)
{if(termName&&me.currentLangTerms&&me.currentLangTerms[termName])return me.currentLangTerms[termName];else return defaultText}
me.setCurrentLang=function(langCode)
{me.currentLangcode=langCode;me.currentLangTerms=me.getLangTerms(langCode);DataManager.setSessionDataValue('language',langCode)}
me.getCurrentLangCode=function()
{return me.currentLangcode}
me.getLangTerms=function(langCode)
{var returnLangTerms={};if(me.allLangTerms&&me.allLangTerms.languages)
{var langTerms=Util.getFromList(me.allLangTerms.languages,langCode,"code");if(langTerms)returnLangTerms=langTerms.terms}
return returnLangTerms}
me.getLangList=function()
{return me.langList}
me.setLanguageList=function(allLangTerms)
{me.langList=[];if(allLangTerms&&allLangTerms.languages)
{for(i=0;i<allLangTerms.languages.length;i++)
{var langJson=allLangTerms.languages[i];if(langJson.code&&langJson.name)
{var addLangJson={};addLangJson.id=langJson.code;addLangJson.name=langJson.name;addLangJson.updated=langJson.updated;me.langList.push(addLangJson)}}}}
me.initialize()}