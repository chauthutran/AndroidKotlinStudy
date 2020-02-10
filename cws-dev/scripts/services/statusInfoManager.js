// -------------------------------------------
// -- StatusInfoManager Class/Methods
//
//	- All other status info other than 'connection' status..
//

function StatusInfoManager() {};

StatusInfoManager.dataServerStatus;
StatusInfoManager.otherOnes;

// Can be also used to call this from console.log();
StatusInfoManager.getInfo = function()
{
	// create  Server Available changes
	return ConnManagerNew.statusInfo;
}