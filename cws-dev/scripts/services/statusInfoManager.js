// -------------------------------------------
// -- StatusInfoManager Class/Methods
//
//	- All other status info other than 'connection' status..
//

function StatusInfoManager() {};

StatusInfoManager.dataServerStatus;
StatusInfoManager.otherOnes;

// TODO: MOVE: Create statusInfoSummary class to get all status data at once?
StatusInfoManager.getCurrentStatusSummary = function()
{
	// TODO: Need to change 'ConnManager'.
	var connSummary = {
		'networkOnline': ConnManager.network_Online,
		'dataServerOnline': ConnManager.dataServer_Online,
		'serverStateChanged': ConnManager.serverStateChanged,
		'promptSwitchNetworkMode': ConnManager.network_Online,
		'promptSwitchUserNetworkMode': ConnManager.promptSwitchUserNetworkMode		
	};

	// create  Server Available changes
	return connSummary;
}