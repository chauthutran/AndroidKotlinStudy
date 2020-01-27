// -------------------------------------------
// -- ScheduleManager Class/Methods
//		1. Have a method/api to start/run the schedule
//		2(?). Manage the run state, etc.. <-- Not sure if we need them...
function ScheduleManager() {};

// ScheduleManager.runSummary = { 'list': [] };
ScheduleManager.interval_networkStatusChecks = 5000;
ScheduleManager.interval_dataServerStatusChecks = 30000;
// TODO: More...

// ===================================================
// === PART 1. Schedule Call/Start Methods =============

ScheduleManager.scheduleNetworkStatusChecks = function()
{
	// 5 seconds
	setInterval( ConnManager.networkOnlineChecks(), ScheduleManager.interval_networkStatusChecks );
	//ConnManager.monitorNetworkStatusChanges();
	// ConnManager.monitorDataServerAvailable();
};

ScheduleManager.scheduleDataServerStatusChecks = function() 
{
	// 30 seconds
	setInterval( ConnManager.dataServerStatusChecks(), ScheduleManager.interval_dataServerStatusChecks );
}


ScheduleManager.schedulePromptQuestionCancelChecks = function()
{
	// 1 seconds
	//setInterval( ConnManager.networkOnlineChecks(), ScheduleManager.interval_networkStatusChecks );
	//ConnManager.monitorNetworkStatusChanges();
	// ConnManager.monitorDataServerAvailable();
};


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

// ===================================================
// === PART 2. Schedule Status or History Reteive Methods ? =============

