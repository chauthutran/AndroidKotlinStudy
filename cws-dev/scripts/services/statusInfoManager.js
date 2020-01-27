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
		'networkOnline': ConnManagerNew.networkOnline_CurrState,
		'networkOnlinePREV': ConnManagerNew.networkOnline_PrevState,
		'dataServerOnline': ConnManagerNew.serverOnline_CurrState,
		'dataServerOnlinePREV': ConnManagerNew.serverOnline_PrevState,
		'serverStateChanged': ConnManagerNew.serverOnline_StateChanged,
		'promptSwitchNetworkMode': ConnManagerNew.switchPrompt_CurrState		
	};

	// create  Server Available changes
	return connSummary;
}