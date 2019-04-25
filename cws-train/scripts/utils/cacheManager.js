function cacheManager(){}
cacheManager.cacheKeys=[];cacheManager.initialising=!1;cacheManager.initialise=function()
{cacheManager.cacheKeys=[];cacheManager.initialising=!0;if(caches)
{caches.keys().then(function(names)
{var myArr=[];for(let name of names)
{myArr.push(name);console.log(' ~ found cache obj: '+name)}
cacheManager.cacheKeys=myArr;cacheManager.initialising=!1;return!0})}
else{cacheManager.initialising=!1}}
cacheManager.clearCacheKeys=async function(regExclude,returnFunc)
{if(cacheManager.cacheKeys.length)
{if(!cacheManager.initialising)
{var results=[];for(var i=0;i<cacheManager.cacheKeys.length;i++)
{if(regExclude)
{if(regExclude.test(cacheManager.cacheKeys[i]))
{console.log('skipping {regEx} cache named '+cacheManager.cacheKeys[i])}
else{let promise=caches.delete(cacheManager.cacheKeys[i]);console.log('deleting {non-matching} cacheStorage named: '+cacheManager.cacheKeys[i]);let result=await promise;results.push({"cacheName":cacheManager.cacheKeys[i],"success":result})}}
else{let promise=caches.delete(cacheManager.cacheKeys[i]);console.log('deleting cacheStorage named: '+cacheManager.cacheKeys[i]);let result=await promise;results.push({"cacheName":cacheManager.cacheKeys[i],"success":result})}}
console.log(' RESULTS ');console.log(results);if(returnFunc)returnFunc(results)}
else{if(returnFunc)returnFunc(!1)}}
else{if(returnFunc)returnFunc(!1)}}