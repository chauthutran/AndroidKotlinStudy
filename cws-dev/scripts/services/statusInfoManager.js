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
	// create  Server Available changes
	return ConnManagerNew.statusInfo;
}