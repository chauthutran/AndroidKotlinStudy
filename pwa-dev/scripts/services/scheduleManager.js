// -------------------------------------------
// -- ScheduleManager Class/Methods
//	  - Setup schedules for tasks that runs in the background
//		LVL 1:
//		1. Create Initiate method to start task schedules in the beginning of the app
//		2. Create method to start task schedules after login  <-- what is ths?
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
ScheduleManager.interval_scheduleSyncAllRun = 30000;			// automated SyncAll process
ScheduleManager.interval_syncDownRunOnce = 60000;				// syncDown try interval

// list of Scheduler timerIDs (for cancelling at logoff)
ScheduleManager.timerID_scheduleSyncAllRun;
//ScheduleManager.timerID_syncDownRunOnce;
ScheduleManager.timerID_serverAvilableCheck;

// === PART 1. Schedule Call/Start Methods =============

ScheduleManager.runSchedules_AppStart = function()
{
	ScheduleManager.schedule_serverStatus_Check( true );
};


ScheduleManager.runSchedules_AfterLogin = function( cwsRenderObj, callBack )
{	
	// TODO: ENABLE THIS LATER: For 'Sync' Down?
	//ScheduleManager.schedule_syncAllRun();				//auto sync (enable)

	ScheduleManager.schedule_syncDownRunOnce( cwsRenderObj );

	//console.customLog( 'runSchedules_AfterLogin' );

	if ( callBack ) callBack();
};


ScheduleManager.stopSchedules_AfterLogOut = function( callBack )
{
	clearInterval ( ScheduleManager.timerID_serverAvilableCheck );
	clearInterval ( ScheduleManager.timerID_scheduleSyncAllRun );

	console.customLog( 'stopSchedules_AfterLogOut' );

	if ( callBack ) callBack();
};

// -------------------------------------------------------------------
// ------ Sub Methods ------------------------------

ScheduleManager.schedule_serverStatus_Check = function( NotRunRightAway ) 
{
	if ( ! NotRunRightAway ) ConnManagerNew.checkNSet_ServerAvailable();

	// 30 seconds
	ScheduleManager.timerID_serverAvilableCheck = setInterval( ConnManagerNew.checkNSet_ServerAvailable, ScheduleManager.interval_serverStatusCheck );
};


// This should be changed to call after syncAllRun is finished <-- use setTimeout to call again after each..
ScheduleManager.schedule_syncAllRun = function( NotRunRightAway ) 
{
	if ( ! NotRunRightAway ) SyncManagerNew.syncAll_WithChecks();

	// 30 seconds
	ScheduleManager.timerID_scheduleSyncAllRun = setInterval( SyncManagerNew.syncAll_WithChecks, ScheduleManager.interval_scheduleSyncAllRun );
};


// -----------------------------------------------
// --- SyncDown Once when Online Schedule ----

ScheduleManager.schedule_syncDownRunOnce = function( cwsRenderObj )
{
	try
	{
		if ( ConfigManager.getSyncDownSetting().enable )
		{
			// Call this.  If does not success, schedule to call
			ScheduleManager.syncDownRunIfOnlineSchedule( cwsRenderObj );
		}
	}
	catch( errMsg )
	{
		console.customLog( 'Error in ScheduleManager.schedule_syncDownRunOnce, errMsg: ' + errMsg );
	}
};


ScheduleManager.syncDownRunIfOnlineSchedule = function( cwsRenderObj )
{
	if ( ConnManagerNew.isAppMode_Online() )
	{
		SyncManagerNew.syncDown( cwsRenderObj, 'AfterLogin', function( success, changeOccurred ) {

			if ( success ) 
			{  
				console.customLog( 'syncDown once schedule finished success.' ); 

				// NOTE: If there was a new merge, for now, alert the user to reload the list?
				if ( changeOccurred )
				{
					var btnRefresh = $( '<a class="notifBtn" term=""> REFRESH </a>');

					$( btnRefresh ).click ( () => {
						cwsRenderObj.renderArea( cwsRenderObj.areaList[ 0 ].id );
					});

					MsgManager.notificationMessage ( 'SyncDown data found', 'notificationBlue', btnRefresh, '', 'right', 'top', 10000, false );
					//alert( 'SyncDown changed list.  Please refresh the list.' );
				}
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
	setTimeout( ScheduleManager.syncDownRunIfOnlineSchedule, ScheduleManager.interval_syncDownRunOnce, cwsRenderObj );
}


// -----------------------------------------------