// -------------------------------------------
// -- ScheduleManager Class/Methods
//	  - Setup schedules for tasks that runs in the background
//		LVL 1:
//		1. Create Initiate method to start task schedules in the beginning of the app
//		2. Create method to start task schedules after login
//		3. Create method to cancel task schedules after logout
//	
//		LVL 2:
//			- Create each task schedule calls - with intervals.
//				- Have flag to start in the beginning of interval or not.

//		TODO: If task is taking long, it might overlap with next scheduled one.  
//			We might need some check for this.  <-- Or use setTimeout to call itself after a try (after success/failing?)
// -----------------------------------------

function ScheduleManager() {};

//ScheduleManager.interval_networkStatusCheck = 5000;				// network is onine/offline check
ScheduleManager.interval_serverStatusCheck = 30000;				// server is available check
//ScheduleManager.interval_networkSwitchPromptCheck = 1000;  		// prompt user switch-network check
//ScheduleManager.interval_networkSwitchPromptCancelCheck = 1000; // cancel prompt switch-network popup check
ScheduleManager.interval_scheduleSyncAllRun = 30000;			// automated SyncAll process
ScheduleManager.interval_scheduleShowHideSyncAllButtonUI = 10000; // check show/hide syncAll Button/Icon
ScheduleManager.interval_networkConnectionTypeCheck = 30000;  	// (2g/3g/etc) connection type check
ScheduleManager.interval_syncDownRunOnce = 60000;				// syncDown try interval


// list of Scheduler timerIDs (for cancelling at logoff)
//ScheduleManager.timerID_networkSwitchPromptCheck;				
ScheduleManager.timerID_scheduleSyncAllRun;
ScheduleManager.timerID_showHideSyncAllButtonUI;
ScheduleManager.timerID_trackConnectionType;
ScheduleManager.timerID_syncDownRunOnce;


// === PART 1. Schedule Call/Start Methods =============

ScheduleManager.runSchedules_AppStart = function( callBack )
{
	ScheduleManager.schedule_serverStatus_Check( true );

	if ( callBack ) callBack();
}

ScheduleManager.runSchedules_AfterLogin = function( cwsRenderObj, callBack )
{
	ScheduleManager.schedule_showHideSyncAllButtonUI(); 	//manual sync (enable)
	ScheduleManager.schedule_syncAllRun();				//auto sync (enable)
	
	ScheduleManager.schedule_syncDownRunOnce( cwsRenderObj );

	//ScheduleManager.schedule_trackConnectionType();

	console.log( 'runSchedules_AfterLogin' );

	if ( callBack ) callBack();
}

ScheduleManager.stopSchedules_AfterLogOut = function( callBack )
{
	clearInterval ( ScheduleManager.timerID_showHideSyncAllButtonUI );
	clearInterval ( ScheduleManager.timerID_scheduleSyncAllRun );
	//clearInterval ( ScheduleManager.timerID_trackConnectionType );

	console.log( 'stopSchedules_AfterLogOut' );

	if ( callBack ) callBack();
}

ScheduleManager.runSchedules_cancelPrompt_AppModeSwitch = function( callBack )
{
	// when cancelling switchMode notification prompt > create this schedule
	//   to 'push' user to move to appropriate online/offline mode
	// problem? when to switch off this schedule...

}


// -------------------------------------------------------------------
// ------ Sub Methods ------------------------------


ScheduleManager.schedule_serverStatus_Check = function( NotRunRightAway ) 
{
	if ( ! NotRunRightAway ) ConnManagerNew.scheduled_checkNSet_ServerAvailable();

	// 30 seconds
	setInterval( ConnManagerNew.scheduled_checkNSet_ServerAvailable, ScheduleManager.interval_serverStatusCheck );

};



ScheduleManager.schedule_switchNetworkModePrompt_Check = function( NotRunRightAway )
{
	if ( ! NotRunRightAway ) ConnManagerNew.runSwitchNetworkMode_Prompt_Check( NotRunRightAway );

	// 1 second 
	ScheduleManager.timerID_networkSwitchPromptCheck = setInterval( ConnManagerNew.runSwitchNetworkMode_Prompt_Check, ScheduleManager.interval_networkSwitchPromptCheck );
};

ScheduleManager.schedule_showHideSyncAllButtonUI = function( NotRunRightAway ) 
{
	if ( ! NotRunRightAway ) SyncManagerNew.syncAllButtonChange();

	// 10 seconds
	ScheduleManager.timerID_showHideSyncAllButtonUI = setInterval( SyncManagerNew.syncAllButtonChange, ScheduleManager.interval_scheduleShowHideSyncAllButtonUI );
}


// This should be changed to call after syncAllRun is finished <-- use setTimeout to call again after each..
ScheduleManager.schedule_syncAllRun = function( NotRunRightAway ) 
{
	if ( ! NotRunRightAway ) SyncManagerNew.syncAll_WithChecks();

	// 30 seconds
	ScheduleManager.timerID_scheduleSyncAllRun = setInterval( SyncManagerNew.syncAll_WithChecks, ScheduleManager.interval_scheduleSyncAllRun );
}

ScheduleManager.schedule_trackConnectionType = function( NotRunRightAway )
{
	if ( ! NotRunRightAway ) ConnManagerNew.trackConnectionType();

	ScheduleManager.timerID_trackConnectionType = setInterval( ConnManagerNew.trackConnectionType, ScheduleManager.interval_networkConnectionTypeCheck );
}

// -----------------------------------------------
// --- One Time Schedule ----

ScheduleManager.schedule_syncDownRunOnce = function( cwsRenderObj )
{
	// Call this.  If does not success, schedule to call
	ScheduleManager.syncDownRunIfOnlineSchedule( cwsRenderObj );
	//ScheduleManager.timerID_syncDownRunOnce = setInterval( ScheduleManager.syncDownRunIfOnline, ScheduleManager.interval_syncDownRunOnce, cwsRenderObj );
};


ScheduleManager.syncDownRunIfOnlineSchedule = function( cwsRenderObj )
{
	if ( ConnManagerNew.isAppMode_Online() )
	{
		SyncManagerNew.syncDown( cwsRenderObj, 'AfterLogin', function( success, changeOccurred ) {

			if ( success ) 
			{  
				console.log( 'syncDown once schedule finished success.' ); 
				//clearTimeout( ScheduleManager.timerID_syncDownRunOnce );

				// NOTE: If there was a new merge, for now, alert the user to reload the list?
				if ( changeOccurred ) alert( 'SyncDown changed list.  Please refresh the list.' );
			} 
			else ScheduleManager.syncDownTimeoutCall( cwsRenderObj );
		});
	}
	else
	{
		// Could create AppMode_Online wait run tasks.. and have this in..
		ScheduleManager.syncDownTimeoutCall( cwsRenderObj );
	}
};

ScheduleManager.syncDownTimeoutCall = function( cwsRenderObj )
{
	ScheduleManager.timerID_syncDownRunOnce = setTimeout( ScheduleManager.syncDownRunIfOnlineSchedule, ScheduleManager.interval_syncDownRunOnce, cwsRenderObj );
}
