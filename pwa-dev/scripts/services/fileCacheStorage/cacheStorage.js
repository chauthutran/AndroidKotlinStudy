
function CacheStorage()
{
	var me = this;

	me.init = function()
	{
		me.putAllFilesInCache();
	}

	me.putAllFilesInCache = function()
	{
		$.ajax({
			type: "GET",
			dataType: "json",
			url: "http://localhost:8383/list",
			success: function( response )
			{
				var fileNameList = response.list;
				for( var i in fileNameList )
				{
					SwManager.swRegObj.active.postMessage( { 'type': 'CACHE_URLS2', 'payload': [ fileNameList[i] ] } );
				}
				
			},
			error: function( error )
			{
				console.log( error );
			}
		});
	}
	

	// --------------------------------------------------------------------------------------------------------
	// RUN init method

	me.init();
}