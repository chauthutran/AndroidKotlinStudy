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

//ScheduleManager.interval_networkStatusCheck = 5000;			// network is onine/offline check
ScheduleManager.interval_serverStatusCheck = 30000;				// server is available check
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
		"SCH_NewAppFileCheck"
		// Add New App File check.  
		// Also, 'serverStatus' check on app Start, but diable it on logOut?  Strange.
	],
	"AfterLogin": [
		"SCH_SyncDown_RunOnce",  // schedule_syncAll? - based on frequency on setting
		"SCH_SyncAll_Background"
	],
	"AfterLogOut": [
		"CLR_syncDown_RunOnce",
		"CLR_SyncAll_Background"
		//"CLR_ServerStatusChecks",
		//"CLR_SyncAll"
	]
};


// === PART 1. Schedule Call/Start Methods =============

ScheduleManager.runSchedules_AppStart = function( cwsRenderObj )
{
	ScheduleManager.scheduleList.OnAppStart.forEach( itemName =>
    {
		if ( itemName === "SCH_ServerStatusCheck" ) ScheduleManager.schedule_serverStatus_Check( true );
		else if ( itemName === "SCH_NewAppFileCheck" ) ScheduleManager.schedule_newAppFile_Check( false, cwsRenderObj );
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
		//if ( itemName === "CLR_ServerStatusChecks" ) clearInterval( ScheduleManager.timerID_serverAvilableCheck );
		//else if ( itemName === "CLR_SyncAll" ) clearInterval( ScheduleManager.timerID_scheduleSyncAllRun );			
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


ScheduleManager.schedule_newAppFile_Check = function( NotRunRightAway, cwsRenderObj ) 
{
	if ( !NotRunRightAway ) cwsRenderObj.swManagerObj.checkNewAppFile_OnlyOnline();

	// 1 min?
	ScheduleManager.timerID_checkNewAppFileCheck = setInterval( cwsRenderObj.swManagerObj.checkNewAppFile_OnlyOnline, ScheduleManager.interval_checkNewAppFileCheck );
};


// This should be changed to call after syncAllRun is finished <-- use setTimeout to call again after each..
/*
ScheduleManager.schedule_syncAllRun = function( NotRunRightAway ) 
{
	if ( !NotRunRightAway ) SyncManagerNew.syncAll_FromSchedule();

	// 30 seconds
	ScheduleManager.timerID_scheduleSyncAllRun = setInterval( SyncManagerNew.syncAll_FromSchedule, ScheduleManager.interval_scheduleSyncAllRun );
};
*/


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
			console.customLog( 'SyncAll Schedule Started with frequency ' + syncScheduleTimeMs );

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