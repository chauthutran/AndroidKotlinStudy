// -------------------------------------------
// -- StatusInfoManager Class/Methods
//
//	- All other status info other than 'connection' status..
//

function StatusInfoManager() {};

StatusInfoManager.dataServerStatus;
StatusInfoManager.otherOnes;
StatusInfoManager.debugMode = false;

// TODO: MOVE: Create statusInfoSummary class to get all status data at once?
StatusInfoManager.getInfo = function()
{
	// create  Server Available changes
	return ConnManagerNew.statusInfo;
}