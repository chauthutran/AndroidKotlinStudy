// -------------------------------------------
// -- ScheduleManager Class/Methods
//	  - Setup schedules for tasks that runs in the background
//		1. Create Initiate method to start task schedules in the beginning of the app
//		2. Create method to start task after login


function ScheduleManager() {};

ScheduleManager.interval_networkStatusCheck = 5000;				// network is onine/offline check
ScheduleManager.interval_serverStatusCheck = 30000;				// server is available check
ScheduleManager.interval_networkConnectionTypeCheck = 30000;  	// (2g/3g/etc) connection type check


// === PART 1. Schedule Call/Start Methods =============
//ScheduleManager.initialize_ConnectionManagerChecks = function( callBack )
ScheduleManager.runSchedules_AppStart = function( callBack )
{
	ScheduleManager.schedule_networkStatus_Check();
	ScheduleManager.schedule_serverStatus_Check();
	//ScheduleManager.schedule_connectionTypeMonitoringCheck();
	ScheduleManager.schedule_switchNetworkModePrompt_Check();

	console.log( 'created all scheduler tasks for ConnectionManagerNew ' );

	if ( callBack ) callBack();

}

ScheduleManager.schedule_networkStatus_Check = function( NotRunRightAway )
{
	if ( ! NotRunRightAway ) ConnManagerNew.networkStatus_Check();

	// 5 seconds
	setInterval( ConnManagerNew.networkStatus_Check, ScheduleManager.interval_networkStatusCheck );
};

ScheduleManager.schedule_serverStatus_Check = function( NotRunRightAway ) 
{
	if ( ! NotRunRightAway ) ConnManagerNew.serverStatus_Check();

	// 30 seconds
	setInterval( ConnManagerNew.serverStatus_Check, ScheduleManager.interval_serverStatusCheck );
};

ScheduleManager.schedule_connectionTypeMonitoringCheck = function( NotRunRightAway )
{
	if ( ! NotRunRightAway ) ConnManagerNew.incrementConnectionTypeMonitor();

	setInterval( ConnManagerNew.incrementConnectionTypeMonitor, ScheduleManager.interval_networkConnectionTypeCheck );
}

ScheduleManager.schedule_switchNetworkModePrompt_Check = function( NotRunRightAway )
{
	if ( ! NotRunRightAway ) ConnManagerNew.switchNetworkModePrompt_Check();

	// 5 seconds << should be 1 second, because smallest timer interval at present is network Online check = 1sec
	setInterval( ConnManagerNew.switchNetworkModePrompt_Check, 1000 );
};

ScheduleManager.schedulePromptSwitchNetworkCancelCheck = function()
{
	// 1 seconds
	setInterval( ConnManagerNew.promptSwitchNetworkCancelCheck, 1000 );
};


ScheduleManager.scheduleSyncAllRun = function() 
{
	// 30 seconds
	setInterval( SyncManagerNew.syncAll_WithChecks, 30000 );
}

ScheduleManager.scheduleSyncAllButtonUIshowHide = function() 
{
	// 10 seconds
	setInterval( SyncManagerNew.syncAllButtonChange, 10000 );
}

// ===================================================
// === PART 2. Schedule Status or History Reteive Methods ? =============
