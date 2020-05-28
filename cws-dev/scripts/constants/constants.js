
function Constants() {};

Constants.storageName_redeemList = "redeemList";
Constants.storageName_activityList = "activityList";    // Should add with userName..
Constants.storageName_clientList = "clientList";
Constants.storageName_session = "session";

// ONGOING STATUS ONES:
Constants.status_queued = "queued"; // initialize from dcd@XX ?
Constants.status_failed = "failed"; // submit failed case..
Constants.status_hold = "paused"; // initialize from dcd@XX ? //REMOVE? We don't "PAUSE" or HOLD records (yet)
Constants.status_processing = "processing"; // initialize from dcd@XX ? //REMOVE? We don't "PAUSE" or HOLD records (yet)
// FINISHED STATUS ONES:
Constants.status_downloaded = "downloaded"; // DO NOT NEED THIS - SAME AS 'synced'?
Constants.status_submit = "submit"; // 'synced' <-- CHANGE!!! WITH CONFIG CHANGE
Constants.status_submit_wMsg = "submit_wMsg"; 
Constants.status_error = "error"; // 


//Constants.fixedActiveUserId = "qwertyuio3"; // Replaced with SessionManager.sessionData.login_UserName

Constants.storage_offline_ItemNetworkAttemptLimit = 3;
Constants.storage_offline_ItemAgeLimit = ( 92 * 24 ); //92 days
//Constants.activityList_PageSize = 15;

Constants.lsFlag_dataMoved_redeemListIDB = "dataMoved_redeemListIDB";
Constants.focusRelegator_MaxOpacity = 0.35;