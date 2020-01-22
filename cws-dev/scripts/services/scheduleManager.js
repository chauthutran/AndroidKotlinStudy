// -------------------------------------------
// -- ScheduleManager Class/Methods

function ScheduleManager() {};


ScheduleManager.scheduleNetworkStatusChecks = function()
{
	// 5 seconds
	setInterval( ConnManager.networkOnlineChecks(), 5000 );
	//ConnManager.monitorNetworkStatusChanges();
	// ConnManager.monitorDataServerAvailable();
};

ScheduleManager.scheduleDataServerStatusChecks = function() 
{
	// 30 seconds
	setInterval( ConnManager.dataServerStatusChecks(), 30000 );
}

ScheduleManager.scheduleSyncAllRuns = function() 
{
	// 30 seconds
	setInterval( SyncManagerNew.syncAll_WithChecks(), 30000 );
}

ScheduleManager.scheduleSyncAllButtonUIChange = function() 
{
	// 10 seconds
	setInterval( SyncManagerNew.syncAllButtonChange(), 10000 );
}

