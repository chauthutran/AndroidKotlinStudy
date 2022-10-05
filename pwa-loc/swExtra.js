// Matomo offline
self.importScripts("./swMotamoOffline.js");
matomoAnalytics.initialize({ queueLimit: 10000, timeLimit: 86400 * 14 });


// takes an array of items and a function that returns a promise
// runs no more than maxConcurrent requests at once
function SwHelper() { };
// SwHelper.mapConcurrent = function (items, maxConcurrent, fn) {  return new Promise(function (resolve, reject) { function runNext() {  function run() {
SwHelper.fetchControllers = {}; // 'EN': { flag: true/false, controller: new AbortController(); }


// Message Listening --> Currently, for JobAid File Caching Operation.
self.addEventListener('message', (event) => 
{
	// NOTE: More explain about 'event.waitUntil': https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
	event.waitUntil(async function () 
	{
		// NOTE: For 'JobAid' file caching (cache.add/cache.put), we need to do these on 'service worker' level
		//		Since we have made these url (pattern) as 'CacheOnly'.
		//		Due to 'CacheOnly' strategy, the url can only be reached by 'service worker' or on WFA App service worker 'install' time.
		if (event.data && event.data.cacheName) 
		{
			var options = (event.data.options) ? event.data.options : {};
			var projDir = ( options.projDir ) ? options.projDir: '';

			if (event.data.type === 'CACHE_URLS2_CANCEL' ) 
			{
				console.log( 'service worker CACHE_URLS2_CANCEL ' );

				// Cancel the request operations
				if ( projDir && SwHelper.fetchControllers[projDir] ) 
				{
					console.log( 'service worker cancel called: ' + projDir );

					SwHelper.fetchControllers[projDir].abort();
					//event.source.postMessage( JSON.stringify({ type: 'jobFiling', aborted: true, options: options }) );
					delete SwHelper.fetchControllers[projDir];
					//					setTimeout( function() {  }, 400 );
				}				
			}
			else if (event.data.type === 'CACHE_URLS2' && event.data.payload) 
			{
				var cacheName = event.data.cacheName;
				var reqList = event.data.payload;

				var cache = await caches.open(cacheName);

				var totalCount = reqList.length;
				var doneCount = 0;

				var fetchOption = {};

				// Cacneling the fetch, add this 'controller' on fetch
				if ( projDir ) 
				{
					SwHelper.fetchControllers[projDir] = new AbortController();
					fetchOption.signal = SwHelper.fetchControllers[projDir].signal;
				}


				if (options.syncType === 'sync') 
				{
					for (var i = 0; i < reqList.length; i++) 
					{
						var reqUrl = reqList[i];
						try {
							var response = await fetch( reqUrl, fetchOption );

							if (response.ok)  // Status in the range 200-299)
							{
								await cache.put(reqUrl, response);

								doneCount++;
								//console.log( '[' + doneCount + '] Cache Put: ' + reqUrl );
								var returnMsgStr = JSON.stringify({ type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
								event.source.postMessage(returnMsgStr);
							}
							else {
								//console.log( 'Bad Response, reqUrl: ' + reqUrl );
								throw new Error("bad response status");
							}
						}
						catch (error) 
						{
							if ( error.name === 'AbortError' )
							{
								//console.log('AbortError in sync catch');
								//var returnMsgStr = JSON.stringify({ type: 'jobFiling', aborted: true, options: options });
								//event.source.postMessage(returnMsgStr);	
								break;
							}
							else
							{
								doneCount++;
								console.log('[' + doneCount + '] Try/Catch Error, reqUrl: ' + reqUrl);
								console.log(error);
	
								var returnMsgStr = JSON.stringify({ type: 'jobFiling', error: true, process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
								event.source.postMessage(returnMsgStr);	
							}
						}
					}
				}
				else 
				{
					reqList.forEach(reqUrl => 
					{
						// Use 'cache.put' instead of 'cache.add'.  (300 sec timeout)  // cache.add(reqUrl).then(() => {});
						fetch(reqUrl, fetchOption ).then((response) => {
							if (response.ok && response.status === 200)  // Status in the range 200-299)
							{
								//if ( reqUrl.indexOf( 'logo192.png' ) >= 0 ) throw new Error('Something went wrong');

								cache.put(reqUrl, response.clone());  // return 
								//console.log('[' + doneCount + '] Cache Put: ' + reqUrl);

								doneCount++;
								var returnMsgStr = JSON.stringify({ type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
								event.source.postMessage(returnMsgStr);

								return response;
							}
							else {
								throw new Error("bad response status");
							}
						}).catch((error) => 
						{
							if ( error.name === 'AbortError' )
							{
								//var returnMsgStr = JSON.stringify({ type: 'jobFiling', aborted: true, options: options });
								//event.source.postMessage(returnMsgStr);	
							}
							else
							{						
								doneCount++;
								console.log('[' + doneCount + '] Caching Error, reqUrl: ' + reqUrl);
								console.log(error);
	
								var returnMsgStr = JSON.stringify({ type: 'jobFiling', error: true, process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
								event.source.postMessage(returnMsgStr);
							}
						});
					});
				}
			}
		}

	}()); // async IIFE

});
