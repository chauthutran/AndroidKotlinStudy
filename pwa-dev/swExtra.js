self.addEventListener('message', (event) => 
{
  // NOTE: More explain about 'event.waitUntil': https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
  event.waitUntil( async function() 
  {
    if ( event.data && event.data.type === 'CACHE_URLS2' && event.data.cacheName && event.data.payload ) 
    {
      var cacheName = event.data.cacheName;
      var reqList = event.data.payload;

      await caches.delete( cacheName );  // TOOD: Should delete only if 'delete' command it passed in.
      
      var cache = await caches.open( cacheName );
      
      // await cache.allAll( reqList );  // <-- No progress msg

      var totalCount = reqList.length;
      var doneCount = 0;

      reqList.forEach( reqUrl => 
      {
        cache.add( reqUrl ).then( () => {
          doneCount++;
          var returnMsgStr = JSON.stringify( { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl } } );
          event.source.postMessage( returnMsgStr );  
        });
      });


      /*
      for ( var i = 0; i < reqList.length; i++ )
      {
        var reqUrl = reqList[i];// + '?tmark=' + (new Date()).getTime();

        cache.add( reqUrl ).then( function() {
          doneCount++;
          var returnMsgStr = JSON.stringify( { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl } } );
          event.source.postMessage( returnMsgStr );  
        });

        await cache.add( reqUrl );
        
        doneCount++;
        var returnMsgStr = JSON.stringify( { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl } } );
        event.source.postMessage( returnMsgStr );
      }
      */

    }
  }()); // async IIFE --> added () will immediately invoke the async function, hence the name async IIFE
});


/*
// ---------------------------

this.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      return caches.open("1").then(function(cache) {
        return cache.put(event.request, response.clone()).then(function() {
          return response
        })
      })
    }).catch(function() {
      return caches.match(event.request)
    })
  )
})
cache.addAll(requests[]).then(function() {
  // requests have been added to the cache
});

(async () => 
{
    const cache = await caches.open('jobTest2');
    return cache.addAll(event.data.payload);
})



// ===== V3
self.addEventListener('message', (event) => 
{
  event.waitUntil(async function() 
  {
    if ( event.data && event.data.type === 'CACHE_URLS2') 
    {
      caches.delete( 'jobTest2' ).then( () => 
      {
        caches.open('jobTest2').then( (cache) => 
        {
            cache.addAll( event.data.payload ).then( () => 
            {
              var returnMsgStr = JSON.stringify( { msg: 'Job Aid Filing Success.', type: 'jobFiling' } );
              event.source.postMessage( returnMsgStr );
            });
        });
      })
    }
  }());
});


// ===== V2
self.addEventListener('message', (event) => 
{
    if (event.data.type === 'CACHE_URLS2') 
    {
        event.waitUntil(
            caches.delete( 'jobTest2' ).then( () => 
            {
                caches.open('jobTest2')
                .then( (cache) => {
                    console.log( 'before cache.addAll' );
                    return cache.addAll(event.data.payload);
                });
            })
        );
    }
});


// ===== V1
self.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_URLS2') {    
        event.waitUntil(
            (async () => {
                await caches.delete( 'jobTest2' );
                // return Promise.all()   +  .self.clients.claim()
                return await caches.open('jobTest2').then(async (cache) => {
                        return await cache.addAll(event.data.payload);
                });
            })
        );
    }
});
*/