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
            console.log( '--- before cache.addAll' );
            cache.addAll( event.data.payload ).then( () => 
            {
              var returnMsgStr = JSON.stringify( { msg: 'Job Aid Filing Success.', run: 'appReload' } );
              event.source.postMessage( returnMsgStr );
            });
        });
      })
    }
  }());
});

/*

addEventListener('fetch', event => {
  event.waitUntil(async function() {
    // Exit early if we don't have access to the client.
    // Eg, if it's cross-origin.
    if (!event.clientId) return;

    // Get the client.
    const client = await clients.get(event.clientId);
    // Exit early if we don't get the client.
    // Eg, if it closed.
    if (!client) return;

    // Send a message to the client.
    client.postMessage({
      msg: "Hey I just got a fetch from you!",
      url: event.request.url
    });

  }());
});

navigator.serviceWorker.addEventListener('message', event => {
  console.log(event.data.msg, event.data.url);
});

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


self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_URLS2') {
      event.waitUntil(
          caches.open('jobTest2')
              .then( (cache) => {
                  return cache.addAll(event.data.payload);
              })
      );
  }
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