function cacheManager() {}

cacheManager.cacheKeys = [];
cacheManager.initialising = false;

cacheManager.initialise = function()
{
	cacheManager.cacheKeys = [];
	cacheManager.initialising = true;

	if ( caches )
	{
		caches.keys().then(function(names) 
		{
			var myArr = [];
			for (let name of names)
			{
				myArr.push( name );
				//console.log( ' ~ found cache obj: ' + name);
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
}

cacheManager.clearCacheKeys = async function( regExclude, returnFunc )
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
						//caches.delete(name);
					}
				}
				else
				{
					let promise = caches.delete( cacheManager.cacheKeys[ i ] );
					console.log( 'deleting cacheStorage named: ' + cacheManager.cacheKeys[ i ] );
					let result = await promise;
					results.push ( { "cacheName": cacheManager.cacheKeys[ i ], "success": result } );
					//caches.delete(name);
				}
			}

			console.log( results );

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


