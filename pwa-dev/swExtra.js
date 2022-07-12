self.addEventListener('message', (event) => 
{
  // NOTE: More explain about 'event.waitUntil': https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
  event.waitUntil( async function() 
  {
    if ( event.data && event.data.cacheName )
    {
      if ( event.data.type === 'CACHE_URLS2' && event.data.payload ) 
      {
        var cacheName = event.data.cacheName;
        var reqList = event.data.payload;
        var options = ( event.data.options ) ? event.data.options: {};
          
        var cache = await caches.open( cacheName );
        
        var totalCount = reqList.length;
        //var old_doneCount = 0;
  
        if ( totalCount <= 0 ) { // Never hit here - sending method already checks for this.
          event.source.postMessage( JSON.stringify( { type: 'jobFiling', process: { total: 0, url: '' }, options: options } ) );
        }
        else
        {
          var modifyUrlFunc = function( url ) 
          {
            if ( url ) {
              var jobStrIdx = url.indexOf( '/jobs/' );
              if ( jobStrIdx >= 0 ) url = url.substr( jobStrIdx );  
            }

            return url;
          };

          reqList.forEach( reqUrl => 
          {
            // Way to add to list and if not in caache, show as error (not downloaded).            
            //cache.add( reqUrl ).then( ( res ) => 
            var itemJson = { type: 'jobFiling', process: { total: totalCount, downloaded: false }, options: options };

            var repResult;

            fetch( reqUrl ).then( function( response ) 
            {
              if ( !response.ok ) throw new TypeError('Bad response status');
            
              repResult = response.clone();

              return cache.put( reqUrl, response );                
            }).then( function() 
            {
              repResult.blob().then( function( myBlob ) 
              {
                //old_doneCount++;
                itemJson.process.url = modifyUrlFunc( reqUrl );
                itemJson.process.downloaded = true;
                itemJson.process.size = myBlob.size;
                itemJson.process.date = new Date().toISOString();

                event.source.postMessage( JSON.stringify( itemJson ) );
              });
            })            
            .catch( function() 
            {
              itemJson.process.url = modifyUrlFunc( reqUrl );
              itemJson.process.downloaded = false;
              itemJson.process.size = 0;
              itemJson.process.date = new Date().toISOString();

              event.source.postMessage( JSON.stringify( itemJson ) );
            });   
    
          });
        }
      }  
    }
  }()); // async IIFE
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