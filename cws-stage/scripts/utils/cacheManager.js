// -------------------------------------------
// -- cacheManager Class/Methods

function cacheManager() {}

cacheManager.cacheKeys = [];
cacheManager.cacheStorage = [];
cacheManager.initialising = false;
cacheManager.cacheAvailable = false;

cacheManager.initialise = function()
{
	cacheManager.cacheKeys = [];
	cacheManager.initialising = true;
	cacheManager.cacheAvailable = ( 'caches' in self );

	if ( cacheManager.cacheAvailable )
	{
		caches.keys().then(function(names) 
		{
			var myArr = [];
			var myDetails = [];
			var dataSize = 0;
			for (let name of names)
			{
				myArr.push( name );
				myDetails.push( { container: 'caches', name: name, bytes: dataSize, kb: dataSize / 1024, mb: dataSize / 1024 / 1024 } )
			}

			cacheManager.cacheKeys = myArr;
			cacheManager.initialising = false;

			return true;

		});
	}
	else
	{
		cacheManager.initialising = false;
	}

	cacheManager.initialiseCacheSizes();

}

cacheManager.clearCacheKeys = async function( regExclude, returnFunc )
{
	if ( cacheManager.cacheAvailable )
	{
		if ( cacheManager.cacheKeys.length )
		{
			if ( !cacheManager.initialising )
			{
				var results = [];
				for ( var i = 0; i < cacheManager.cacheKeys.length; i++ )
				{
					if ( regExclude )
					{
						if ( regExclude.test( cacheManager.cacheKeys[ i ] ) ) 
						{
							console.log( 'skipping {regEx} cache named ' + cacheManager.cacheKeys[ i ] );
						}
						else
						{
							let promise = caches.delete( cacheManager.cacheKeys[ i ] );
							console.log( 'deleting {non-matching} cacheStorage named: ' + cacheManager.cacheKeys[ i ] );
							let result = await promise;
							results.push ( { "cacheName": cacheManager.cacheKeys[ i ], "success": result } );
						}
					}
					else
					{
						let promise = caches.delete( cacheManager.cacheKeys[ i ] );
						console.log( 'deleting cacheStorage named: ' + cacheManager.cacheKeys[ i ] );
						let result = await promise;
						results.push ( { "cacheName": cacheManager.cacheKeys[ i ], "success": result } );
					}
				}
	
				if ( returnFunc ) returnFunc( results );
			}
			else
			{
				if ( returnFunc ) returnFunc( false );
			}
		}
		else
		{
			// Browser not supporting Service Worker Caches
			if ( returnFunc ) returnFunc( false );
		}
	}

}
cacheManager.initialiseCacheSizes = function()
{
	cacheManager.getCacheStoragesAssetTotalSize();
}

cacheManager.getCacheStoragesAssetTotalSize = async function() 
{
  // Note: opaque (i.e. cross-domain, without CORS) responses in the cache will return a size of 0.
  const cacheNames = await caches.keys();

  let total = 0;
  let arrSummary = [];

  const sizePromises = cacheNames.map( async cacheName => {

	const cache = await caches.open(cacheName);
	const keys = await cache.keys();

	let cacheSize = 0;

	await Promise.all( keys.map( async key => {
	  const response = await cache.match(key);
	  const blob = await response.blob();
	  total += blob.size;
	  cacheSize += blob.size;
	  //arrSummary.push( { container: 'caches', name: cacheName, bytes: blob.size, kb: blob.size / 1024, mb: blob.size / 1024 / 1024 } )

	}));

	//console.log(`Cache ${cacheName}: ${cacheSize} bytes`);
	arrSummary.push( { container: 'caches', name: cacheName, bytes: cacheSize, kb: cacheSize / 1024, mb: cacheSize / 1024 / 1024 } )

  });

  await Promise.all( sizePromises );

  cacheManager.cacheStorage = arrSummary;

  //return arrSummary; //`Total Cache Storage: ${total} bytes`;
}