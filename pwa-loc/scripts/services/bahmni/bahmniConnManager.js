function BahmniConnManager() {};


// BahmniConnManager.timerID_Interval;
BahmniConnManager.connStatus_OFFLINE = 'OFFLINE';
BahmniConnManager.connStatus_ONLINE = 'ONLINE';

BahmniConnManager.connStatus_Stable = BahmniConnManager.connStatus_OFFLINE; // Online vs Offline

BahmniConnManager.startSyncStatus_Interval;

BahmniConnManager.pingDebug = false;
BahmniConnManager.noCheckingConnection = 0;
BahmniConnManager.maxNoCheckingConnection = 3;
BahmniConnManager.allowToPingConnection = true;
BahmniConnManager.preConnStatus = BahmniConnManager.connStatus_OFFLINE;
BahmniConnManager.interval_syncData = Util.MS_SEC * 2;
BahmniConnManager.MINUTES_TO_LOOK_FOR_BASE_URL = Util.MS_MIN * 2;

BahmniConnManager._bmPingCase = '1';
BahmniConnManager.connectionURL = "";  // NOT USED ANYMORE?


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

// ---------------------------------------------------------------------------------
// Set status for Icon

BahmniConnManager.connection_StatusOffline = function () 
{
	BahmniConnManager.connStatus_Stable = BahmniConnManager.connStatus_OFFLINE;
	if ( BahmniConnManager.pingDebug ) console.log( 'BahmniConnManager StatusOffline' );

	BahmniConnManager.setHeaderColor();
	//BahmniConnManager.syncImgTag.attr("src", "images/bahmni_connection_gray1.svg");
}

BahmniConnManager.connection_StatusPending = function () 
{
	//BahmniConnManager.syncImgTag.attr("src", "images/bahmni_connection_white.svg");
}


BahmniConnManager.connection_StatusOnline = function () 
{
	BahmniConnManager.connStatus_Stable = BahmniConnManager.connStatus_ONLINE;
	if ( BahmniConnManager.pingDebug ) console.log( 'BahmniService StatusOnline' );
	// 
	// $("#Nav1").css("background-color", "#ed8f2d"); // Orange
	BahmniConnManager.setHeaderColor();
	//BahmniConnManager.syncImgTag.attr("src", "images/bahmni_connection_green.svg");
}

BahmniConnManager.update_UI_Status_StartSync = function () 
{
	BahmniMsgManager.initializeProgressBar();
    // BahmniConnManager.startSyncStatus_Interval = setInterval(() => {
		/*
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
	 */
    // }, Util.MS_SEC/3);
	
}

BahmniConnManager.update_UI_Status_FinishSyncAll = function () 
{
	BahmniMsgManager.hideProgressBar();

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
