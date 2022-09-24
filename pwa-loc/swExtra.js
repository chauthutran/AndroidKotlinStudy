self.importScripts("./swMotamoOffline.js");
//self.importScripts('https://matomo.psi-mis.org/offline-service-worker.js');
matomoAnalytics.initialize({ queueLimit: 10000, timeLimit: 86400 * 14 });

self.addEventListener('message', (event) => {
	// NOTE: More explain about 'event.waitUntil': https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
	event.waitUntil(async function () {
		if (event.data && event.data.cacheName) {
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
							await cache.add(reqUrl);
							doneCount++;
							var returnMsgStr = JSON.stringify({ type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
							event.source.postMessage(returnMsgStr);	
						}
						catch ( error )
						{
							doneCount++;
							console.log( 'caching error try/catch, url: ' + reqUrl );
							console.log( error );
							var returnMsgStr = JSON.stringify({ type: 'jobFiling', error: true, process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
							event.source.postMessage(returnMsgStr);
						}
					}
				}
				else 
				{
					reqList.forEach( reqUrl => {
						// Instead of 'cache.add', we could use 'fetch' with is the equalivent one.  Also, the default timeout should be 300 seconds for this..
						cache.add(reqUrl).then(() => {
							doneCount++;
							var returnMsgStr = JSON.stringify({ type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
							event.source.postMessage(returnMsgStr);
						}).catch((error) => {
							doneCount++;
							console.log( 'caching error catch, url: ' + reqUrl );
							console.log( error );
							var returnMsgStr = JSON.stringify({ type: 'jobFiling', error: true, process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options });
							event.source.postMessage(returnMsgStr);
						});
					});
				}
			}
		}

	}()); // async IIFE
});
