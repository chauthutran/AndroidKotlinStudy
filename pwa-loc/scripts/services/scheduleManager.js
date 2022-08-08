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

ScheduleManager.interval_serverStatusCheck = Util.MS_SEC * 30;				// server is available check
ScheduleManager.interval_networkCurrentRecheck = Util.MS_SEC * 5;			// recheck/confirm network current status

ScheduleManager.interval_scheduleSyncAllRun = Util.MS_SEC * 30;			// automated SyncAll process
ScheduleManager.interval_syncDownRunOnce = Util.MS_MIN;				// syncDown try interval
ScheduleManager.interval_fixOperationRunOnce = Util.MS_MIN;				// syncDown try interval
// NOTE: after 10 times try, we can slow down the interval to 3 min?  or 5 min?

//ScheduleManager.interval_checkNewAppFileCheck = Util.MS_MIN;			// background new app file check

// list of Scheduler timerIDs (for cancelling at logoff)
ScheduleManager.timerID_scheduleSyncAllRun;
ScheduleManager.timerID_serverAvilableCheck;
//ScheduleManager.timerID_checkNewAppFileCheck;
ScheduleManager.timerID_syncDownRunOnce;
ScheduleManager.timerID_fixOperationRunOnce;


// List/Controls schedules..
ScheduleManager.scheduleList = {
	"OnAppStart": [
		"SCH_ServerStatusCheck",
		"SCH_NetworkCurrentRecheck"
	],
	"AfterLogin": [
		"SCH_SyncDown_RunOnce",  // schedule_syncAll? - based on frequency on setting
		"SCH_FixOper_RunOnce",  // schedule_syncAll? - based on frequency on setting
		"SCH_SyncAll_Background"
	],
	"AfterLogOut": [
		"CLR_syncDown_RunOnce",
		"CLR_FixOper_RunOnce",
		"CLR_SyncAll_Background"
	]
};


// List to run when appMode switches from offline to online
ScheduleManager.runSwitchToOnlineList = {};

// ------------------------------------
// --- SyncUpResponseAction Variables   - 'responseActionList' / 'ResponseCaseAction' defined in config, is a triggering schedule of additional syncUps by the response status.
ScheduleManager.syncUpResponseAction_DefaultIntervalTime = Util.MS_HR; // 1 hr ( 1 sec, 1min, 1hr)
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
		if ( itemName === "SCH_SyncDown_RunOnce" ) ScheduleManager.schedule_syncDownRunOnce();
		else if ( itemName === "SCH_FixOper_RunOnce" ) ScheduleManager.schedule_fixOperationRunOnce();
		else if ( itemName === "SCH_SyncAll_Background" ) ScheduleManager.schedule_syncAll_Background( cwsRenderObj );
	});	

	if ( callBack ) callBack();
};


ScheduleManager.stopSchedules_AfterLogOut = function( callBack )
{
	ScheduleManager.scheduleList.AfterLogOut.forEach( itemName =>
	{
		if ( itemName === "CLR_syncDown_RunOnce" ) clearTimeout( ScheduleManager.timerID_syncDownRunOnce );
		else if ( itemName === "CLR_FixOper_RunOnce" ) ScheduleManager.clearTimeout_fixOperationRunOnce();
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
// --- Run List Once switched to Online ----

ScheduleManager.runWhenSwitchedToOnline = function()
{
	// Custom scheduling tasks
	Object.keys( ScheduleManager.runSwitchToOnlineList ).forEach( requestId => 
	{
		try {
			ScheduleManager.runSwitchToOnlineList[ requestId ];
			delete ScheduleManager.runSwitchToOnlineList[ requestId ];
		}
		catch( errMsg ) {
			console.log( 'ERROR on ScheduleManager.runWhenSwitchedToOnline, requesteId: ' + requestId + ', errMsg: ' + errMsg );
		}
	});
};


ScheduleManager.addToRunSwitchToOnlineList = function( requestId, runFunc )
{
	ScheduleManager.runSwitchToOnlineList[ requestId ] = runFunc;
};


ScheduleManager.clearRunSwitchToOnlineList = function()
{
	ScheduleManager.runSwitchToOnlineList = {};
};


// -----------------------------------------------
// --- SyncDown Once when Online Schedule ----

ScheduleManager.schedule_syncDownRunOnce = function()
{
	try
	{
		var syncDownSetting = ConfigManager.getSyncDownSetting();

		if ( syncDownSetting && syncDownSetting.enable )
		{
			// Call this.  If does not success, schedule to call
			clearTimeout( ScheduleManager.timerID_syncDownRunOnce );
			ScheduleManager.timerID_syncDownRunOnce = undefined;
			ScheduleManager.syncDownRun_Online_Login();
		}
	}
	catch( errMsg )
	{
		console.log( 'Error in ScheduleManager.schedule_syncDownRunOnce, errMsg: ' + errMsg );
	}
};

ScheduleManager.schedule_fixOperationRunOnce = function()
{
	try
	{
		// NOTE: - Alternative: use setInterval, with canceling interval if run once, or not in log-in status..  or interval this is called again..
		ScheduleManager.clearTimeout_fixOperationRunOnce();
		ScheduleManager.fixOperationRun_Online_Login();
	}
	catch( errMsg )
	{
		console.log( 'Error in ScheduleManager.schedule_fixOperationRunOnce, errMsg: ' + errMsg );
	}
};


// Start the background frequent 'syncAll' call
ScheduleManager.schedule_syncAll_Background = function( cwsRenderObj )
{
	try
	{
		clearInterval( ScheduleManager.timerID_scheduleSyncAllRun );

		// get syncAll frequency from storage..
		var syncScheduleTimeMs = Number( AppInfoLSManager.getNetworkSync() );  // empty or 0 is no scheduled ones..

		if ( syncScheduleTimeMs > 0 )
		{
			ScheduleManager.timerID_scheduleSyncAllRun = setInterval( function() 
			{
				SyncManagerNew.syncAll_FromSchedule( cwsRenderObj ); 
			}, syncScheduleTimeMs );
		}
	}
	catch( errMsg )
	{
		console.log( 'Error in ScheduleManager.schedule_syncAll_Background, errMsg: ' + errMsg );
	}		
};


// TODO: Move to 'SyncManager' class later..
ScheduleManager.syncDownRun_Online_Login = function()
{
	if ( ConnManagerNew.isAppMode_Online() && SessionManager.getLoginStatus() )
	{
		SyncManagerNew.syncDown( 'AfterLogin', function( success, changeOccurred, mockCase, mergedActivities ) 
		{
			if ( success ) 
			{  
				// NOTE: If there was a new merge, for now, alert the user to reload the list?
				if ( changeOccurred && !mockCase )
				{
					if ( mergedActivities.length > 0 )
					{
						SessionManager.cwsRenderObj.renderArea1st();

						MsgManager.noticeMsg( '<span term="msg_syncDownDataMerged">SyncDown data added/merged</span>: ' + mergedActivities.length
						, { cssClasses: 'notifBlue' } );
					}
				}
			} 

			// If not success, still, do not do retry... <-- just once is enough..
			//else ScheduleManager.syncDownTimeoutCall();
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
	ScheduleManager.timerID_syncDownRunOnce = setTimeout( ScheduleManager.syncDownRun_Online_Login, ScheduleManager.interval_syncDownRunOnce );
}

// ----------------------------

ScheduleManager.clearTimeout_fixOperationRunOnce = function()
{
	clearTimeout( ScheduleManager.timerID_fixOperationRunOnce );
};

ScheduleManager.fixOperationRun_Online_Login = function()
{
	if ( ConnManagerNew.isAppMode_Online() && SessionManager.getLoginStatus() )
	{
		SettingsStatic.fixOperationRun();	
	}
	else
	{
		// Could create AppMode_Online wait run tasks.. and have this in..
		ScheduleManager.fixOperationTimeoutCall();
	}
};

ScheduleManager.fixOperationTimeoutCall = function()
{
	ScheduleManager.timerID_fixOperationRunOnce = setTimeout( ScheduleManager.fixOperationRun_Online_Login, ScheduleManager.interval_fixOperationRunOnce );
}


// -----------------------------------------------
// --- SyncUpResponseAction Related --------------

// - 'responseActionList' / 'ResponseCaseAction' defined in config, is a triggering schedule of additional syncUps by the response status.
ScheduleManager.syncUpResponseActionListInsert = function( syncActionJson, activityId ) 
{ 	
	var activityActionJson = ScheduleManager.syncUpResponseActionList[ activityId ];

	// Only if not already in list, create and run it..
	if ( syncActionJson && !activityActionJson )
	{
		var newActivityActionJson = Util.cloneJson( syncActionJson );
		newActivityActionJson.activityId = activityId;
		newActivityActionJson.tryCount = 0;
		newActivityActionJson.syncIntervalTimeMs = UtilDate.getTimeMs( syncActionJson.syncInterval, ScheduleManager.syncUpResponseAction_DefaultIntervalTime );

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
					//console.log( activityActionJson );

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
		ScheduleManager.syncUpResponseActionList_History.push( Util.cloneJson( activityActionJson ) );	
		
		// 3. remove the item
		delete ScheduleManager.syncUpResponseActionList[ activityId ];	
	}
	catch( errMsg )
	{
		console.log( 'ERROR in ScheduleManager.syncUpResponseAction_ScheduleFinish, errMsg: ' + errMsg );
	}
};
