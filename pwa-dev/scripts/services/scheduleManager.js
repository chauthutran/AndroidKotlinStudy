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

// -- Available Check Disable/ReEnable
// disable --> clearInterval( ScheduleManager.timerID_serverAvilableCheck );
// reEnable --> ScheduleManager.schedule_serverStatus_Check( false );
// -----------------------------------------

function ScheduleManager() {};

ScheduleManager.interval_serverStatusCheck = 30000;				// server is available check
ScheduleManager.interval_networkCurrentRecheck = 5000;			// recheck/confirm network current status

ScheduleManager.interval_scheduleSyncAllRun = 30000;			// automated SyncAll process
ScheduleManager.interval_syncDownRunOnce = 60000;				// syncDown try interval
ScheduleManager.interval_checkNewAppFileCheck = 60000;			// background new app file check

// list of Scheduler timerIDs (for cancelling at logoff)
ScheduleManager.timerID_scheduleSyncAllRun;
//ScheduleManager.timerID_syncDownRunOnce;
ScheduleManager.timerID_serverAvilableCheck;
ScheduleManager.timerID_checkNewAppFileCheck;


// List/Controls schedules..
ScheduleManager.scheduleList = {
	"OnAppStart": [
		"SCH_ServerStatusCheck",
		"SCH_NetworkCurrentRecheck"
	],
	"AfterLogin": [
		"SCH_SyncDown_RunOnce",  // schedule_syncAll? - based on frequency on setting
		"SCH_SyncAll_Background"
	],
	"AfterLogOut": [
		"CLR_syncDown_RunOnce",
		"CLR_SyncAll_Background"
	]
};

// ------------------------------------
// --- SyncUpResponseAction Variables
ScheduleManager.syncUpResponseAction_DefaultIntervalTime = 1000 * 60 * 60; // 1 hr ( 1 sec, 1min, 1hr)
ScheduleManager.syncUpResponseActionList = {};  // "activityId": {}, ...
ScheduleManager.syncUpResponseActionList_History = [];  // { activityId, ... }, ...

// =======================================================

// === PART 1. Schedule Call/Start Methods =============

ScheduleManager.runSchedules_AppStart = function()
{
	ScheduleManager.scheduleList.OnAppStart.forEach( itemName =>
    {
		if ( itemName === "SCH_ServerStatusCheck" ) ScheduleManager.schedule_serverStatus_Check( true );
		else if ( itemName === "SCH_NetworkCurrentRecheck" ) ScheduleManager.schedule_networkCurrentRecheck( true );
	});	
};


ScheduleManager.runSchedules_AfterLogin = function( cwsRenderObj, callBack )
{	
	ScheduleManager.scheduleList.AfterLogin.forEach( itemName =>
	{
		if ( itemName === "SCH_SyncDown_RunOnce" ) ScheduleManager.schedule_syncDownRunOnce( cwsRenderObj );
		else if ( itemName === "SCH_SyncAll_Background" ) ScheduleManager.schedule_syncAll_Background( cwsRenderObj );
	});	

	if ( callBack ) callBack();
};


ScheduleManager.stopSchedules_AfterLogOut = function( callBack )
{
	ScheduleManager.scheduleList.AfterLogOut.forEach( itemName =>
	{
		if ( itemName === "CLR_syncDown_RunOnce" ) clearInterval( ScheduleManager.timerID_checkNewAppFileCheck );
		else if ( itemName === "CLR_SyncAll_Background" ) clearInterval( ScheduleManager.timerID_scheduleSyncAllRun );
	});	
	
	if ( callBack ) callBack();
};


// -------------------------------------------------------------------
// ------ Sub Methods ------------------------------

ScheduleManager.schedule_serverStatus_Check = function( NotRunRightAway ) 
{
	if ( !NotRunRightAway ) ConnManagerNew.checkNSet_ServerAvailable();

	// 30 seconds
	ScheduleManager.timerID_serverAvilableCheck = setInterval( ConnManagerNew.checkNSet_ServerAvailable, ScheduleManager.interval_serverStatusCheck );
};


ScheduleManager.schedule_networkCurrentRecheck = function( NotRunRightAway ) 
{
	if ( !NotRunRightAway ) ConnManagerNew.networkCurrentRecheck();

	ScheduleManager.timerID_networkCurrentRecheck = setInterval( ConnManagerNew.networkCurrentRecheck, ScheduleManager.interval_networkCurrentRecheck );
};


// -----------------------------------------------
// --- SyncDown Once when Online Schedule ----

ScheduleManager.schedule_syncDownRunOnce = function()
{
	try
	{
		if ( ConfigManager.getSyncDownSetting().enable )
		{
			// Call this.  If does not success, schedule to call
			ScheduleManager.syncDownRunIfOnlineSchedule();
		}
	}
	catch( errMsg )
	{
		console.customLog( 'Error in ScheduleManager.schedule_syncDownRunOnce, errMsg: ' + errMsg );
	}
};


// When to call this?  It gets called on login..  Which is enough..
// It also gets called again from 'Settings' when sync frequency gets changed..
ScheduleManager.schedule_syncAll_Background = function( cwsRenderObj )
{
	try
	{
		clearInterval( ScheduleManager.timerID_scheduleSyncAllRun );

		// get syncAll frequency from storage..
		var syncScheduleTimeMs = Number( AppInfoManager.getNetworkSync() );  // empty or 0 is no scheduled ones..

		if ( syncScheduleTimeMs > 0 )
		{
			//console.customLog( 'SyncAll Schedule Started with frequency ' + syncScheduleTimeMs );
			ScheduleManager.timerID_scheduleSyncAllRun = setInterval( function() 
			{
				SyncManagerNew.syncAll_FromSchedule( cwsRenderObj ); 
			}, syncScheduleTimeMs );
		}
	}
	catch( errMsg )
	{
		console.customLog( 'Error in ScheduleManager.schedule_syncAll_Background, errMsg: ' + errMsg );
	}		
};


// TODO: Move to 'SyncManager' class later..
ScheduleManager.syncDownRunIfOnlineSchedule = function()
{
	if ( ConnManagerNew.isAppMode_Online() )
	{
		SyncManagerNew.syncDown( 'AfterLogin', function( success, changeOccurred, mockCase, mergedActivities ) {

			if ( success ) 
			{  
				// NOTE: If there was a new merge, for now, alert the user to reload the list?
				if ( changeOccurred && !mockCase )
				{
					if ( mergedActivities.length > 0 )
					{
						var btnRefreshTag = $( '<a class="notifBtn" term=""> REFRESH </a>');

						btnRefreshTag.off( 'click' ).click ( () => {
							SessionManager.cwsRenderObj.renderArea( SessionManager.cwsRenderObj.areaList[ 0 ].id );
						});
	
						MsgManager.notificationMessage( 'SyncDown data found', 'notifBlue', btnRefreshTag, '', 'right', 'top', 10000, false );
					}
				}
			} 
			else ScheduleManager.syncDownTimeoutCall();
		});
	}
	else
	{
		// Could create AppMode_Online wait run tasks.. and have this in..
		ScheduleManager.syncDownTimeoutCall();
	}
};

ScheduleManager.syncDownTimeoutCall = function()
{
	setTimeout( ScheduleManager.syncDownRunIfOnlineSchedule, ScheduleManager.interval_syncDownRunOnce );
}

// -----------------------------------------------
// --- SyncUpResponseAction Related --------------

ScheduleManager.syncUpResponseActionListInsert = function( syncActionJson, activityId ) 
{ 	
	var activityActionJson = ScheduleManager.syncUpResponseActionList[ activityId ];

	// Only if not already in list, create and run it..
	if ( syncActionJson && !activityActionJson )
	{
		var newActivityActionJson = Util.getJsonDeepCopy( syncActionJson );
		newActivityActionJson.activityId = activityId;
		newActivityActionJson.tryCount = 0;
		newActivityActionJson.syncIntervalTimeMs = Util.getTimeMs( syncActionJson.syncInterval, ScheduleManager.syncUpResponseAction_DefaultIntervalTime );

		ScheduleManager.syncUpResponseActionList[ activityId ] = newActivityActionJson;


		newActivityActionJson.intervalRef = setInterval( function( activityActionJson ) 
		{
			// Perform syncUp...
			SyncManagerNew.syncUpActivity( activityId, undefined, function( syncReadyJson, syncUpSuccess ) 
			{
				if ( syncUpSuccess === undefined )
				{
					// SyncUp condition failed.  --> offline, cooldown, or not in proper status.

					// If not in proper status, cancel whole thing with message..
					if ( syncReadyJson && syncReadyJson.syncableStatus === false ) 
					{
						// Put message to history
						// TODO: update activity processing history with ...

						ScheduleManager.syncUpResponseAction_ScheduleFinish( activityActionJson );
					}
				}
				// If syncUp was performed and has result ('success' true/false).  Undefined is case where it was not performed..
				else // if ( syncUpSuccess !== undefined )
				{
					// Check the ScheduleManager.syncUpActionList by activityId and increment the count...
					activityActionJson.tryCount++;
					//console.customLog( activityActionJson );

					if ( syncUpSuccess )
					{
						// If success response, finish the scheduled calls.  (Activity status has already been updated in above call..)
						ScheduleManager.syncUpResponseAction_ScheduleFinish( activityActionJson );
					}
					else 
					{
						// If not success, if max reached, update status/msg on activity and finish the scheduled calls.
						if ( activityActionJson.tryCount >= activityActionJson.maxAttempts )
						{
							// If 'maxAttemps' reached, update the activity status + stop the intervals.
							ActivityDataManager.activityUpdate_ByResponseCaseAction( activityActionJson.activityId, activityActionJson.maxAction );
							ScheduleManager.syncUpResponseAction_ScheduleFinish( activityActionJson );
						}
						// If not success, and not max reached, continue with 'scheduled calls'
					}
				}
			});

		}, newActivityActionJson.syncIntervalTimeMs, newActivityActionJson );
	}
};

ScheduleManager.syncUpResponseAction_ScheduleFinish = function( activityActionJson ) 
{
	try
	{
		var activityId = activityActionJson.activityId;
		activityActionJson.stoppedTime = Util.dateStr( 'DATETIME' );
	
		// 1. clear from interval - schedule / repeat
		clearInterval( activityActionJson.intervalRef );
		
		// 2. add to history one (make a copy)
		ScheduleManager.syncUpResponseActionList_History.push( Util.getJsonDeepCopy( activityActionJson ) );	
		
		// 3. remove the item
		delete ScheduleManager.syncUpResponseActionList[ activityId ];	
	}
	catch( errMsg )
	{
		console.customLog( 'ERROR in ScheduleManager.syncUpResponseAction_ScheduleFinish, errMsg: ' + errMsg );
	}
};
