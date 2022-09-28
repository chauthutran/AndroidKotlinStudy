// Matomo offline
self.importScripts("./swMotamoOffline.js");
matomoAnalytics.initialize({ queueLimit: 10000, timeLimit: 86400 * 14 });


// Message Listening --> Currently, for JobAid File Caching Operation.
self.addEventListener('message', (event) => {
	// NOTE: More explain about 'event.waitUntil': https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
	event.waitUntil(async function () 
	{
		// NOTE: For 'JobAid' file caching (cache.add/cache.put), we need to do these on 'service worker' level
		//		Since we have made these url (pattern) as 'CacheOnly'.
		//		Due to 'CacheOnly' strategy, the url can only be reached by 'service worker' or on WFA App service worker 'install' time.
		if (event.data && event.data.cacheName) 
		{
			if (event.data.type === 'CACHE_URLS2' && event.data.payload) {
				var cacheName = event.data.cacheName;
				var reqList = event.data.payload;
				var options = (event.data.options) ? event.data.options : {};

				var cache = await caches.open(cacheName);

				var totalCount = reqList.length;
				var doneCount = 0;

				if (options.syncType === 'sync') 
				{
					for (var i = 0; i < reqList.length; i++) 
					{
						var reqUrl = reqList[i];
						try
						{
							var response = await fetch(reqUrl);
							
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
						catch ( error )
						{
							doneCount++;
							console.log( '[' + doneCount + '] Try/Catch Error, reqUrl: ' + reqUrl );
							console.log( error );
							var returnMsgStr = JSON.stringify({ type: 'jobFiling', error: true, process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
							event.source.postMessage(returnMsgStr);
						}
					}
				}
				else 
				{
					reqList.forEach( reqUrl => {

						// TODO: Use 'cache.put' instead - https://developer.mozilla.org/en-US/docs/Web/API/Cache/add
						// Instead of 'cache.add', we could use 'fetch' with is the equalivent one.  Also, the default timeout should be 300 seconds for this..

						fetch(reqUrl).then((response) => 
						{
							if (response.ok)  // Status in the range 200-299)
							{
								//if ( reqUrl.indexOf( 'logo192.png' ) >= 0 ) throw new Error('Something went wrong');

								cache.put(reqUrl, response);  // return 
								//console.log( '[' + doneCount + '] Cache Put: ' + reqUrl );

								doneCount++;
								var returnMsgStr = JSON.stringify({ type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
								event.source.postMessage(returnMsgStr);	
							}
							else {
								throw new Error("bad response status");
							}
						}).catch((error) => {
							doneCount++;
							console.log( '[' + doneCount + '] Caching Error, reqUrl: ' + reqUrl );
							console.log( error );
							var returnMsgStr = JSON.stringify({ type: 'jobFiling', error: true, process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
							event.source.postMessage(returnMsgStr);
						});

						// cache.add(reqUrl).then(() => {

					});
				}
			}
		}

	}()); // async IIFE
});
