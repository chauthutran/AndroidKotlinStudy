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
		'networkOnline_NewState': ConnManagerNew.networkOnline_NewState,
		'networkOnline_PrevState': ConnManagerNew.networkOnline_PrevState,
		'networkOnline_Changed':   ConnManagerNew.networkOnline_Changed,
		'serverOnline_NewState':  ConnManagerNew.serverOnline_NewState,
		'serverOnline_PrevState':  ConnManagerNew.serverOnline_PrevState,
		'serverOnline_Changed':    ConnManagerNew.serverOnline_Changed,
		'switchPrompt_ChangeTo':  ConnManagerNew.switchPrompt_ChangeTo,
		'switchPrompt_PrevState':  ConnManagerNew.switchPrompt_PrevState,
		'ConnManagerNew.pwaApplicationMode': ConnManagerNew.pwaApplicationMode,
		'ConnManagerNew.switchPrompt_Underway': ConnManagerNew.switchPrompt_Underway
	};

	// create  Server Available changes
	return connSummary;
}