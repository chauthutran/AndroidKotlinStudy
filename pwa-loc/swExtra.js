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
        var doneCount = 0;
  
        reqList.forEach( reqUrl => 
        {
          cache.add( reqUrl ).then( () => 
          {
            doneCount++;
            var returnMsgStr = JSON.stringify( { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options } );
            //console.log( 'returnMsgStr: ' + returnMsgStr );
            event.source.postMessage( returnMsgStr );  
          });
        });
      }  
    }

  }()); // async IIFE
});
