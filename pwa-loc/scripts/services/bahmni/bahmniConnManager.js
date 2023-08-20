function BahmniConnManager() {};


// BahmniConnManager.timerID_Interval;
BahmniConnManager.connStatus_OFFLINE = 'OFFLINE';
BahmniConnManager.connStatus_ONLINE = 'ONLINE';

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


BahmniConnManager.getPingUrl = function (baseUrl) 
{
	if ( BahmniConnManager._bmPingCase === "1" ) return baseUrl + "/openmrs/ws/rest/v1/wfa/integration/get/syncable";
	else if ( BahmniConnManager._bmPingCase === "2" ) return BahmniRequestService.pingLANNetwork;
	else return baseUrl + "/openmrs/ws/rest/v1/wfa/integration/get/syncable";
};

// ---------------------------------------------------------------------------------
// Set status for Icon

BahmniConnManager.update_UI_Status_FinishSyncAll = function () 
{
	BahmniMsgManager.hideProgressBar();

	if( BahmniService.syncDataStatus.status == Constants.status_failed )
	{
		MsgManager.msgAreaShowOpt( "Syncing data has some error. Click on the icon the see the details.", { hideTimeMs: 1000 } );
	}
}
