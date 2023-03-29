// -------------------------------------------
// -- GeoLocUtil Class/Methods

function GeoLocUtil() { }

// GeoLocUtil.geoLocationTrackingEnabled = false;
// GeoLocUtil.geoLocationState;
GeoLocUtil.geoLocLatLonStr = '';
GeoLocUtil.geoLocErr;
GeoLocUtil.geoLocCoordStr = ''; 
GeoLocUtil.lastGetTime;
GeoLocUtil.lastTryTime;
GeoLocUtil.geoLoc_Retry_Limit = 2000; // limit the location reget time - milliseconds between.

GeoLocUtil.error_PERMISSION_DENIED = 1;

// ==== Methods ======================

GeoLocUtil.isTooCloseRetry = function( lastTime, retryLimit_MS ) 
{
	var isTooSoon = false;

	try
	{
		if ( lastTime && UtilDate.getTimeSince( lastTime.toISOString(), Util.MS ) <= retryLimit_MS ) isTooSoon = true;	
	}
	catch ( errMsg ) { console.log( 'ERROR in GeoLocUtil.isTooCloseRetry, ' + errMsg ); }

	return isTooSoon;
};
// Previously, we have used the global variable reather than return data.
// For now, we support both
// DO!!  If 'lastGetTime' 
GeoLocUtil.refreshGeoLocation = function (returnFunc, bShowErrMsg ) 
{
	// GeoLocUtil.lastTryTime = new Date();
	// Block too close time geoLoc request calls.
	if ( GeoLocUtil.isTooCloseRetry( GeoLocUtil.lastGetTime, GeoLocUtil.geoLoc_Retry_Limit ) )
	{
		if (returnFunc) returnFunc( true, { latLon: GeoLocUtil.geoLocLatLonStr, coord: GeoLocUtil.geoLocCoordStr } );
	}
	else
	{
		if ( !navigator || !navigator.geolocation )
		{
			GeoLocUtil.geoLocLatLonStr = '';
			GeoLocUtil.geoLocErr = -1;
			GeoLocUtil.geoLocCoordStr = '';
		
			var errMsg = '';

			if ( !navigator ) errMsg = '[GeoLoc] navigator not available';
			else if ( !navigator.geolocation ) errMsg = '[GeoLoc] navigator.geolocation not available';

			// TODO: if running on background, we need to make the msg silent..
			if ( bShowErrMsg ) MsgManager.msgAreaShowErrOpt( errMsg );

			if ( returnFunc ) returnFunc( false, { errMsg: errMsg } );
		}
		else
		{
			navigator.geolocation.getCurrentPosition(function (position) 
			{
				try
				{
					var myPosition = GeoLocUtil.getPositionObjectJSON(position);
					var lat = myPosition.latitude;
					var lon = myPosition.longitude;
					var userLocation = '';
					
					GeoLocUtil.geoLocErr = '';
		
					if (lat == null) GeoLocUtil.geoLocErr = 'GPS not activated';
					else userLocation = parseFloat(lat).toFixed(6) + ', ' + parseFloat(lon).toFixed(6); //6 decimals is accurate enough
		
					GeoLocUtil.geoLocLatLonStr = userLocation;
					GeoLocUtil.geoLocCoordStr = JSON.stringify(myPosition);	

					GeoLocUtil.lastGetTime = new Date();

					GeoLocUtil.showInAboutPage( $('.aboutInfo_geoLoc') ); // refresh the info on about page..

					if (returnFunc) returnFunc( true, { latLon: GeoLocUtil.geoLocLatLonStr, coord: GeoLocUtil.geoLocCoordStr } );
				}
				catch( errMsg )
				{
					var errMsg = 'Failed in GeoLocUtil.refreshGeoLocation getCurrentPosition, ' + errMsg;
					if ( bShowErrMsg ) MsgManager.msgAreaShowErrOpt( errMsg );

					if (returnFunc) returnFunc( false, { errMsg: errMsg } );
				}

			}, function (error) 
			{
				console.log( error );

				try
				{
					GeoLocUtil.geoLocErr = error.code; //Error locating your device
					GeoLocUtil.geoLocLatLonStr = '';

					var errMsg = 'Failed to get current postion, CODE: ' + error.code;
					if ( bShowErrMsg ) MsgManager.msgAreaShowErrOpt( errMsg );
					// if (error.code == error_PERMISSION_DENIED) {

					if (returnFunc) returnFunc( false, { errMsg: errMsg } );
				}
				catch( errMsg )
				{
					GeoLocUtil.geoLocErr = -1;
					GeoLocUtil.geoLocLatLonStr = '';

					var errMsg = 'Failed in GeoLocUtil.refreshGeoLocation, in errorCase, ' + errMsg;
					if ( bShowErrMsg ) MsgManager.msgAreaShowErrOpt( errMsg );

					if (returnFunc) returnFunc( false, { errMsg: errMsg } );
				}
			},
			{ enableHighAccuracy: false, timeout: 20000 } // enableHighAccuracy set to FALSE by Greg: if 'true' may result in slower response times or increased power consumption
			);
		}
	}
};

GeoLocUtil.getPositionObjectJSON = function (pos) {
	var retJSON = {};

	for (var propt in pos.coords) { retJSON[propt] = pos.coords[propt]; }

	return retJSON;
};

GeoLocUtil.showInAboutPage = function ( aboutInfo_geoLocTag ) 
{
	try
	{
		if ( aboutInfo_geoLocTag )
		{
			var lastGetTimeStr = ( GeoLocUtil.lastGetTime ) ? ', LAST GET: ' + GeoLocUtil.lastGetTime.toString(): '';
			aboutInfo_geoLocTag.html( GeoLocUtil.geoLocCoordStr + lastGetTimeStr );	
		}	
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in GeoLocUtil.showInAboutPage, ' + errMsg );
	}
};