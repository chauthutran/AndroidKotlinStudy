function BahmniConnManager() {};


// BahmniConnManager.timerID_Interval;
BahmniConnManager.connStatus_OFFLINE = 'OFFLINE';
BahmniConnManager.connStatus_ONLINE = 'ONLINE';

BahmniConnManager.connStatus_Stable = BahmniConnManager.connStatus_OFFLINE; // Online vs Offline

BahmniConnManager.syncDataIconTag = $("#divAppDataSubResourceSyncStatus");
BahmniConnManager.syncImgTag = $("#imgAppDataSubResourceSyncStatus");

BahmniConnManager.startSyncStatus_Interval;

BahmniConnManager.pingDebug = false;
BahmniConnManager.noCheckingConnection = 0;
BahmniConnManager.maxNoCheckingConnection = 3;
BahmniConnManager.allowToPingConnection = true;
BahmniConnManager.preConnStatus = BahmniConnManager.connStatus_OFFLINE;
BahmniConnManager.interval_syncData = Util.MS_SEC * 2;
BahmniConnManager.MINUTES_TO_LOOK_FOR_BASE_URL = Util.MS_MIN * 2;

BahmniConnManager._bmPingCase = '1';
BahmniConnManager.connectionURL = "";


/** 
 * # CASE 1: No BASE URL
	* 1. Look for a proper BASE URL
	* 2. Ping to properURL 
	* 3. Sync Data
 * # CASE 2: Has BASE URL, BUT connection is OFFLINE
	* 2. Ping to "BASE URL" 
	* 3. Sync Data
 * # CASE 2: Has BASE URL, AND connection is ONLINE, BUT mongo sync is running
	* 1. Wait 2 seconds and check the mongo sync is done
	* 2. If the mongo sync is done, Sync Bahmni Data
	* 3. If the mongo sync is not done after 2 seconds, repeat STEP [1]
**/

BahmniConnManager.pingCaseSwitch = function ( caseStr )
{
	BahmniConnManager._bmPingCase = caseStr;
};

BahmniConnManager.getPingUrl = function (baseUrl) 
{
	if ( BahmniConnManager._bmPingCase === "1" ) return baseUrl + "/openmrs/ws/rest/v1/wfa/integration/get/syncable";
	else if ( BahmniConnManager._bmPingCase === "2" ) return BahmniRequestService.pingLANNetwork;
	else return baseUrl + "/openmrs/ws/rest/v1/wfa/integration/get/syncable";
};

BahmniConnManager.connectionURL = "";

BahmniConnManager.lookForConnectionUrl = function( execAfterSuccess )
{
	BahmniRequestService.resetResponseData();
	var startTime = new Date();
	var intervalObj;

    // while( BahmniConnManager.connectionURL == "" 
    //     && BahmniUtil.getDiffBetweenCurrentMinutes(startTime) < BahmniConnManager.MINUTES_TO_LOOK_FOR_BASE_URL )
    // {
        var pingBasedUrlList = INFO.bahmni_domain_list;
		var idx = 0;
		intervalObj = setInterval(function(){
			
			if( BahmniConnManager.connectionURL != "" 
				|| BahmniUtil.getDiffBetweenCurrentMinutes(startTime) >= BahmniConnManager.MINUTES_TO_LOOK_FOR_BASE_URL ){
			   clearInterval(intervalObj);
			}
			else
			{
				if( idx == pingBasedUrlList.length ) 
				{
					idx = 0;
				}

				var url = BahmniConnManager.getPingUrl(pingBasedUrlList[idx]);
				BahmniRequestService.ping( url, function (response) 
                {
                    if (response.status == "success")
                    {
                        BahmniConnManager.connectionURL = response.urlInfo.origin;
                        execAfterSuccess();
                    }
                    else
                    {
                        BahmniConnManager.connectionURL = "";
                    }
                })
			}
			idx++;
		}, BahmniConnManager.interval_syncData);



        // for( var i=0; i<pingBasedUrlList.length; i++ )
        // {
        //     var url = BahmniConnManager.getPingUrl(pingBasedUrlList[i]);
        //     timeout = setTimeout(() => {
        //         BahmniRequestService.ping( url, function (response) 
        //         {
        //             if (response.status == "success")
        //             {
        //                 BahmniConnManager.connectionURL = response.urlInfo.origin;
        //                 execAfterSuccess();
        //             }
        //             else
        //             {
        //                 BahmniConnManager.connectionURL = "";
        //             }
        //         })
        //     }, BahmniConnManager.interval_syncData * ( i + 1 ) );
        // }
    // }
    // clearTimeout( timeout );
	
}

BahmniConnManager.pingService_Start = function ( execAfterSuccess ) 
{
	// BahmniConnManager.syncDataIconTag.show();
	// BahmniConnManager.connection_StatusPending();

	// clearInterval(BahmniConnManager.timerID_Interval);
	// BahmniRequestService.resetResponseData();
	// BahmniConnManager.noCheckingConnection = 0;
	
	var	intervalObj = setInterval(function(){
		if(BahmniConnManager.allowToPingConnection){
			BahmniRequestService.ping( BahmniConnManager.getPingUrl( BahmniConnManager.connectionURL), function (response) 
			{
				BahmniConnManager.afterPing(response, execAfterSuccess);
			});
		}
		else
		{
			clearInterval(intervalObj);
		}
	}, BahmniConnManager.interval_syncData);

		// BahmniRequestService.ping( BahmniConnManager.getPingUrl(), function (response) 
		// {
		// 	BahmniConnManager.afterPing(response, execAfterSuccess);
		// });

	// }
};



BahmniConnManager.afterPing = function( response, execAfterSuccess )
{
	if ( BahmniConnManager.pingDebug ) console.log( 'Ping response:', response, BahmniConnManager.noCheckingConnection );

	// TODO: if bahmni config country, always show 2nd sync icon?
	if (response.status == "success") // NOTE: this is only for local test case response!!!!??
	{
		BahmniConnManager.noCheckingConnection++;

		// Connection is online and stable
		if (BahmniConnManager.noCheckingConnection >= BahmniConnManager.maxNoCheckingConnection) 
		{
			// Keep the count max limit
			BahmniConnManager.noCheckingConnection = BahmniConnManager.maxNoCheckingConnection;

			if( BahmniConnManager.preConnStatus != BahmniConnManager.connStatus_ONLINE )
			{
				BahmniConnManager.connection_StatusOnline();
				BahmniConnManager.preConnStatus = BahmniConnManager.connStatus_ONLINE;
			}

			if( execAfterSuccess ) execAfterSuccess();
		}
	}
	else 
	{
		BahmniConnManager.noCheckingConnection -- ;
		if (BahmniConnManager.noCheckingConnection < 0) 
		{
			BahmniConnManager.noCheckingConnection = 0;
		}

		if( BahmniConnManager.preConnStatus != BahmniConnManager.connStatus_OFFLINE )
		{
			BahmniConnManager.connection_StatusOffline();
			BahmniConnManager.preConnStatus = BahmniConnManager.connStatus_OFFLINE;
		}
		// BahmniConnManager.needToSyncData = true;
	}
}


// ---------------------------------------------------------------------------------
// Set status for Icon

BahmniConnManager.connection_StatusOffline = function () 
{
	BahmniConnManager.connStatus_Stable = BahmniConnManager.connStatus_OFFLINE;
	if ( BahmniConnManager.pingDebug ) console.log( 'BahmniConnManager StatusOffline' );

	BahmniConnManager.setHeaderColor();
	BahmniConnManager.syncImgTag.attr("src", "images/bahmni_connection_gray1.svg");
}

BahmniConnManager.connection_StatusPending = function () 
{
	BahmniConnManager.syncImgTag.attr("src", "images/bahmni_connection_white.svg");
}


BahmniConnManager.connection_StatusOnline = function () 
{
	BahmniConnManager.connStatus_Stable = BahmniConnManager.connStatus_ONLINE;
	if ( BahmniConnManager.pingDebug ) console.log( 'BahmniService StatusOnline' );
	// 
	// $("#Nav1").css("background-color", "#ed8f2d"); // Orange
	BahmniConnManager.setHeaderColor();
	BahmniConnManager.syncImgTag.attr("src", "images/bahmni_connection_green.svg");
}

BahmniConnManager.update_UI_Status_StartSync = function () 
{
	BahmniMsgManager.initializeProgressBar();
    // BahmniConnManager.startSyncStatus_Interval = setInterval(() => {
    if( BahmniConnManager.syncImgTag.attr("setcolor") == "green" )
    {
        BahmniConnManager.syncImgTag.attr("src", "images/bahmni_connection_blue.svg");
        BahmniConnManager.syncImgTag.attr("setcolor", "blue");
    }
    else
    {
        BahmniConnManager.syncImgTag.attr("src", "images/bahmni_connection_green.svg");
        BahmniConnManager.syncImgTag.attr("setcolor", "green");
    }
    // }, Util.MS_SEC/3);
	
}

BahmniConnManager.update_UI_Status_FinishSyncAll = function () 
{
    // clearInterval( BahmniConnManager.startSyncStatus_Interval );
	BahmniMsgManager.hideProgressBar();
    BahmniConnManager.syncDataIconTag.attr("src", "images/bahmni_connection_green.svg");
    BahmniConnManager.syncDataIconTag.attr("setcolor", "green");

	if( BahmniService.syncDataStatus.status == Constants.status_failed )
	{
		MsgManager.msgAreaShowOpt( "Syncing data has some error. Click on the icon the see the details.", { hideTimeMs: 1000 } );
	}
}

BahmniConnManager.setHeaderColor = function()
{
	if( status == "default" || BahmniConnManager.connStatus_Stable < BahmniConnManager.connStatus_ONLINE )
	{
		// Change the header color to the default color
		$("#Nav1").css("background-color", ""); // Orange
		$(".sheet-title").css("background-color", ""); // Orange
	}
	else 
	{
		// Change the header color to orange
		$("#Nav1").css("background-color", "#ed8f2d"); // Orange
		$(".sheet-title").css("background-color", "#ed8f2d");
	}
	
}

// BahmniConnManager.lookForConnectionUrl = function()
// {
// 	var startTime = new Date();
// 	var interval;

// 	if( BahmniConnManager.connectionURL == "" )
// 	{
// 		while( BahmniConnManager.connectionURL == "" 
// 			&& BahmniUtil.getDiffBetweenCurrentMinutes(startTime) < BahmniConnManager.MINUTES_TO_LOOK_FOR_BASE_URL )
// 		{
// 			var pingBasedUrlList = INFO.bahmni_domain_list;
// 			for( var i=0; i<pingBasedUrlList.length; i++ )
// 			{
// 				var url = BahmniConnManager.getPingUrl(pingBasedUrlList[i]);
// 				interval = setInterval(() => {
// 					BahmniRequestService.ping( url, function (response) 
// 					{
// 						if (response.status == "success")
// 						{
// 							BahmniConnManager.connectionURL = response.urlInfo.origin;
// 							BahmniConnManager.pingService_Start( BahmniConnManager.syncDataRun );
// 						}
// 						else
// 						{
// 							BahmniConnManager.connectionURL = "";
// 						}
// 					})
// 				}, BahmniConnManager.interval_syncData );
// 			}
// 		}

// 		clearInterval( interval );
// 	}
// 	else if( BahmniConnManager.noCheckingConnection < BahmniConnManager.maxNoCheckingConnection )
// 	{
// 		BahmniConnManager.pingService_Start( BahmniConnManager.syncDataRun );
// 	}
// 	else if( ScheduleManager.syncDownProcessing )
// 	{
// 		setTimeout(function() { BahmniConnManager.lookForConnectionUrl(); }, Util.MS_SEC * 2);
// 	}
// }