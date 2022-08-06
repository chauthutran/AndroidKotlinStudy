
function Constants() {};

Constants.storageName_redeemList = "redeemList";
Constants.storageName_activityList = "activityList";    // Should add with userName..
Constants.storageName_clientList = "clientList";
Constants.storageName_session = "session";

// ACTIVITY STATUS:
Constants.status_queued = "queued"; // pending
Constants.status_failed = "failed"; // submit failed case..
Constants.status_hold = "paused"; // REMOVE? We don't "PAUSE" or HOLD records (yet)
Constants.status_error = "error";
Constants.status_processing = "processing";
Constants.status_downloaded = "downloaded";
Constants.status_submit = "submit"; // 'synced' <-- CHANGE!!! WITH CONFIG CHANGE
Constants.status_submit_wMsg = "submit_wMsg"; 
Constants.status_submit_wMsgRead = "submit_wMsgRead";
Constants.status_custom = "custom";

// BACKEND RESPONSE STATUS:
Constants.ws_status_success = "success";
Constants.ws_status_warning = "warning";
Constants.ws_status_error = "error";

// ACTIVITY TYPE:
Constants.actType_schedule = "schedule";
Constants.actType_scheduleCancel = "scheduleCancel";


Constants.storage_offline_ItemNetworkAttemptLimit = 3;
Constants.storage_offline_ItemAgeLimit = ( 92 * 24 ); //92 days
//Constants.activityList_PageSize = 15;

Constants.lsFlag_dataMoved_redeemListIDB = "dataMoved_redeemListIDB";
Constants.focusRelegator_MaxOpacity = 0.35;

// ------------------------------------
// -- Translation Terms
Constants.term_LoginFailMsg = 'msg_loginFailed';
Constants.term_LoginBlackListingMsg = 'msg_blackListingBlock';

// ------------------------------------
// -- Job Aids Demo Related
Constants.jobAides_AreaBlockId = 'blk_c-on_pth-FPL-S_PRO_tabsContainer';  // ET has this.
Constants.jobAides_tabTargetBlockId = 'btn_c-on_pth-FPL-S_PRO_tabSearchByUser';

// ------------------------------------
// -- debugConsolePwd
Constants.debugConsolePwd = '1122';