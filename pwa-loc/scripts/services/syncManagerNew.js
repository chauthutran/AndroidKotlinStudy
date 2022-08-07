// =========================================
// -------------------------------------------------
//     SyncManagerNew
//          - Methods related to submitting data to server
//              - Later will have downloading data from server feature.
//
// -- Pseudo WriteUp:   Create Pseudo Codes with Flow of App (High Level --> to Lower Level)
//
//      - LVL 1. The Expected Features of this class..
//          1. Running 'Sync' on Item --> Submit Offline(?) Item to Server to process operation.  MORE: SyncUp, SyncDown
//          2. 'SyncAll' - all the list of items, perform Sync.
//          3. 'SyncDown' - Start download and merge
//
//      - LVL 2. Go through each of 'Lvl 1' Methods to put general operation logics
//          OP1. ""'Sync' on a item"
//              A. Check on Network Status.
//              B. Submit/Perform the operation of item on server..
//              B1(?). Update Data based on B
//              C. Update The App/UI of changes
//
// -------------------------------------------------

function SyncManagerNew() { };


SyncManagerNew.syncAll_Running_Manual = false;
SyncManagerNew.syncAll_Running_Scheduled = false; // SyncManagerNew.isSyncAll_Running();

// Should be obsolete soon, but use the marker as actiivty processing status as 'processing'
SyncManagerNew.coolDownEnabled = true;

// If scheduled syncAll gets delayed, 
SyncManagerNew.syncAll_conflictShortDelayTime = Util.MS_SEC * 10; // 10 secounds..
SyncManagerNew.syncAll_conflictShortDelayCall; // 

SyncManagerNew.imgAppSyncActionButtonId = '#imgAppDataSyncStatus';
SyncManagerNew.subProgressBarId = '#divProgressInfo';

SyncManagerNew.template_SyncMsgJson = {
	"msgList": [], // { "msg": "", "datetime": "" }
	"summaryList": []  // { "msg": "" }
};

SyncManagerNew.syncMsgJson;  // will get loaded on 1st use or on app startup

SyncManagerNew.syncAllStartTime;  // Use this for tracking how long the 'syncAll' took, and run UI a bit more if less than 1 sec.

SyncManagerNew.MSG_ServerFailed_TooLong = 'The operation took too long (over 1 min) to process.  Server Stopped this operation.';

// ===================================================
// === MAIN 2 FEATURES =============

// 2. Run 'sync' on All activityItems - NOTE: 'SyncAll_Running' checking/blocking happenes before this method.
//      - In this method, we simply mark them... by 'runType'
SyncManagerNew.syncAll = function (cwsRenderObj, runType, callBack) {
	try {
		SyncManagerNew.SyncMsg_InsertMsg('syncAll ' + runType + ' Started..');
		SyncManagerNew.setSyncAll_Running(runType, true);
		SyncManagerNew.syncAllStartTime = new Date().toISOString();

		// initialise UI + animation
		SyncManagerNew.update_UI_StartSyncAll();

		var resultData = { 'success': 0, 'failure': 0 };


		// NEW: Other operations to run on SyncAll Online Time: voucherCodeQueue & appUpdate
		SyncManagerNew.syncAll_OtherOperations();


		// During the 'sync', it updates the activity list..  
		// Thus, we get below list for just list of activityId..  Copy of the original list. 
		var activityIdCopyList = ActivityDataManager.getActivityIdCopyList();

		// NOTE: CHECK ONLINE is done within syncUpItem_RecursiveProcess
		SyncManagerNew.syncUpItem_RecursiveProcess(activityIdCopyList, 0, cwsRenderObj, resultData, function () {
			// Mark the last syncAll success time on storage <-- where?
			var finishedDtStr = (new Date()).toISOString();
			AppInfoLSManager.updateLastSyncAllDt(finishedDtStr);

			SyncManagerNew.setSyncAll_Running(runType, false);

			// If sync is less than 1 sec, run the sync rotation 1 second more.
			var timeTook_SEC = UtilDate.getTimeSince(SyncManagerNew.syncAllStartTime, Util.MS_SEC);
			if (timeTook_SEC < 1) setTimeout(function () { SyncManagerNew.update_UI_FinishSyncAll(); }, 1000);
			else SyncManagerNew.update_UI_FinishSyncAll();

			SyncManagerNew.SyncMsg_InsertMsg('syncAll ' + runType + ' completed..');
			SyncManagerNew.SyncMsg_InsertSummaryMsg('Processed with success ' + resultData.success + ', failure ' + resultData.failure + '..');

			if (callBack) callBack(true);
		});
	}
	catch (errMsg) {
		SyncManagerNew.setSyncAll_Running(runType, false);
		SyncManagerNew.update_UI_FinishSyncAll();

		var errMsgDetail = 'syncAll ' + runType + ' FAILED - msg: ' + errMsg;
		SyncManagerNew.SyncMsg_InsertSummaryMsg(errMsgDetail);
		MsgManager.msgAreaShow('ERR: ' + errMsgDetail, 'ERROR');

		console.log(errMsgDetail);

		if (callBack) callBack(false);
	}
};


SyncManagerNew.syncAll_OtherOperations = function () {
	try {
		if (ConnManagerNew.isAppMode_Online()) {
			// 1. Check & download AppFile updates.  Without reload afterward ('delayReload')
			SwManager.checkAppUpdate('[AppUpdateCheck] - SyncAll time run', { 'delayReload': true });

			// 2. VoucherCode Queue Fill
			VoucherCodeManager.setSettingData(ConfigManager.getVoucherCodeService(), function () {
				VoucherCodeManager.refillQueue(SessionManager.sessionData.login_UserName);
			});
		}
	}
	catch (errMsg) {
		console.log('ERROR in SyncManagerNew.syncAll_OtherOperations, ', errMsg);
	}
};


SyncManagerNew.syncDown = function (runType, callBack) {
	SyncManagerNew.update_UI_StartSyncAll();
	SyncManagerNew.SyncMsg_InsertMsg("SyncDown Download started..");

	// Retrieve data..
	SyncManagerNew.downloadClients(function (downloadSuccess, returnJson, mockCase) {
		SyncManagerNew.update_UI_FinishSyncAll();

		var changeOccurred = false;
		var isFailed = false;

		if (!downloadSuccess || !returnJson || Util.isTypeString(returnJson)) isFailed = true;
		else if (Util.isTypeObject(returnJson)) {
			if (ConfigManager.isSourceTypeMongo()) {
				// ?? - NOT SURE: if ( returnJson.status === Constants.ws_status_success || returnJson.status === Constants.ws_status_warning ) isFailed = false;
				if (returnJson.response && returnJson.response.dataList) isFailed = false;
				else isFailed = true;
			}
			else {
				// Dhis2 source version..
				if (returnJson.status === Constants.ws_status_success
					|| returnJson.status === Constants.ws_status_warning) isFailed = false;
				else isFailed = true;
			}
		}

		if (isFailed) {
			// console.log( returnJson );
			var errMsg = "SyncDown Failed: ";
			var errMsgDetail = 'Unknown Error';

			try {
				if (returnJson && Util.isTypeObject(returnJson)) {
					if (returnJson.errResponse) {
						if (returnJson.errResponse.Error) errMsgDetail = returnJson.errResponse.Error;
						else errMsgDetail = Util.getStr(returnJson.errResponse, 50);
					}
					else if (returnJson.errMsg) errMsgDetail = Util.getStr(returnJson.errMsg, 50);
					else errMsgDetail = Util.getStr(returnJson, 80);
				}

				if (errMsgDetail.indexOf('Request too long. The execution exceeded') === 0
					|| errMsgDetail.indexOf('<html>\r\n<head><title>504 Gateway Time-out') === 0
				) errMsgDetail = SyncManagerNew.MSG_ServerFailed_TooLong;
			}
			catch (errMsg) { console.log('ERROR in syncDown errMsg formatting, ' + errMsg); }


			errMsg += errMsgDetail;

			MsgManager.msgAreaShow(errMsg, 'ERROR', undefined, 180000);

			SyncManagerNew.SyncMsg_InsertMsg(errMsg);

			if (callBack) callBack(downloadSuccess, changeOccurred, errMsg);
		}
		else {
			var downloadedData = SyncManagerNew.formatDownloadedData(returnJson);
			var clientDwnLength = downloadedData.clients.length;
			downloadedData = ConfigManager.downloadedData_UidMapping(downloadedData);

			// 'download' processing data                
			var processingInfo = ActivityDataManager.createProcessingInfo_Success(Constants.status_downloaded, 'Downloaded and synced.');

			SyncManagerNew.SyncMsg_InsertMsg("downloaded " + clientDwnLength + " clients");

			ClientDataManager.setActivityDateLocal_clientList(downloadedData.clients);

			ClientDataManager.mergeDownloadedClients(downloadedData, processingInfo, function (changeOccurred_atMerge, mergedActivities) {
				var mergedActivityLength = mergedActivities.length;

				SyncManagerNew.SyncMsg_InsertMsg("Merged " + mergedActivityLength + " activities..");
				SyncManagerNew.SyncMsg_InsertSummaryMsg("downloaded " + clientDwnLength + " clients, merged " + mergedActivityLength + " activities.");

				// S3. NOTE: Mark the last download at here, instead of right after 'downloadActivities'?

				// TODO: NEED TO MAKE SURE THE RESPONSE HAD ALL PROPER FORMAT OF NO EROR/FAILURE..
				// Mongo VS DHIS....                

				AppInfoManager.updateSyncLastDownloadInfo((new Date()).toISOString());

				if (callBack) callBack(downloadSuccess, changeOccurred_atMerge, mockCase, mergedActivities);
			});
		}
	});
};

SyncManagerNew.formatDownloadedData = function (returnJson) {
	var outputData = { 'clients': [] };

	if (returnJson) {
		if (returnJson.response && returnJson.response.dataList) {
			// mongo web service return data format.
			outputData.clients = returnJson.response.dataList;
		}
		else if (returnJson.clientList) {
			// dws syncUp return format.
			outputData.clients = returnJson.clientList;
		}
		else if (returnJson.clients) {
			outputData.case = 'dhis2RedeemMerge';
			outputData.clients = returnJson.clients;
		}
	}

	return outputData;
};

// ===================================================
// === 1. 'syncUpItem' Related Methods =============


SyncManagerNew.syncUpActivity = function (activityId, resultData, returnFunc) {
	var activityJson = ActivityDataManager.getActivityById(activityId);
	var syncReadyJson = SyncManagerNew.syncUpReadyCheck(activityJson);

	// NOTE: Need try/catch here?
	if (syncReadyJson.ready) {
		// Q: We should get existing actiivty?
		//var activityCardObj = new ActivityCard( activityId );
		var clientId = ClientDataManager.getClientByActivityId(activityId)._id;


		// Q: THIS SHOULD NOT BE OBJECT METHOD...  
		ActivityCard.highlightActivityDiv(activityId, true);

		SyncManagerNew.performSyncUp_Activity(activityId, function (success, responseJson, newStatus, extraData) {
			if (!extraData) extraData = {};

			if (extraData.removedClientId) { } // In 'removedClientId' case, do not perform below.
			else {
				// gAnalytics Event
				GAnalytics.setEvent('SyncEnded', activityId, success, 1);


				SyncManagerNew.syncUpActivity_ResultUpdate(success, resultData);

				// Cool Down Related Last synced time Set ...
				if (SyncManagerNew.coolDownEnabled) ActivityDataManager.setActivityLastSyncedUp(activityId);


				// NEW - Added.
				ConfigManager.activityStatusSwitchOps('afterSync', [activityJson]);


				// Activity Card
				ActivityCard.reRenderAllById(activityId); //             ActivityCard.reRenderActivityDiv();
				ActivityCard.highlightActivityDiv(activityId, false);

				// Rerender the client card that holds this activity as well. - if new client case, the id is tempClient, yet.
				ClientCard.reRenderClientCardsById(clientId, { 'activitiesTabClick': true });
			}

			if (returnFunc) returnFunc(syncReadyJson, success, responseJson, newStatus, extraData);
		});
	}
	else {
		if (returnFunc) returnFunc(syncReadyJson);
	}
};

SyncManagerNew.syncUpActivity_ResultUpdate = function (success, resultData) {
	if (resultData) {
		if (success === true) {
			if (resultData.success === undefined) resultData.success = 0;
			resultData.success++;
		}
		else if (success === false) {
			if (resultData.failure === undefined) resultData.failure = 0;
			resultData.failure++;
		}
	}
};

// ===================================================
// === 2. 'syncAll' Related Methods =============

// NOT APPLICABLE ANYMORE..
SyncManagerNew.getActivityItems_ForSync = function (callBack) {
	var uploadItems = [];

	var uploadItems = ActivityDataManager.getActivityList().filter(function (activityItem) {
		var filterPass = false;

		if (activityItem.processing && activityItem.processing.status) {
			filterPass = SyncManagerNew.statusSyncable(activityItem.processing.status);
		}

		return filterPass;
	});

	// Hard to sort --> processing.created
	//uploadItems = Util.sortByKey( uploadItems, 'created', undefined, 'Decending' ); // combined list

	callBack(uploadItems);
};


SyncManagerNew.syncUpItem_RecursiveProcess = function (activityIdCopyList, i, cwsRenderObj, resultData, callBack) {
	// length is 1  index 'i' = 0; next time 'i' = 1
	if (activityIdCopyList.length <= i) {
		// If index is equal or bigger to list, return back. - End reached.
		return callBack();
	}
	else {
		// CASE: NOTE: DURING syncAll, if Offline mode detected, cancel the syncAll process in the middle.
		if (!ConnManagerNew.isAppMode_Online()) {
			// TODO: CHECK IF THIS IS PROPER MESSAGE...  <-- We need to open up this..
			SyncManagerNew.SyncMsg_InsertMsg("App offline mode detected.  Stopping syncAll process..");
			//throw 'Stopping syncAll process due to app mode offline detected.';
			return callBack();  // with summary..
		}
		else {
			var activityId = activityIdCopyList[i];

			SyncManagerNew.syncUpActivity(activityId, resultData, function (syncReadyJson, syncUpSuccess) {
				// Update on progress bar
				FormUtil.updateProgressWidth(((i + 1) / activityIdCopyList.length * 100).toFixed(1) + '%');

				// Process next item without performing..
				SyncManagerNew.syncUpItem_RecursiveProcess(activityIdCopyList, i + 1, cwsRenderObj, resultData, callBack);
			});
		}
	}
};


// ===================================================
// === 2. 'syncDown' Related Methods =============

// Perform Server Operation..
SyncManagerNew.downloadClients = function (callBack) {
	try {
		var syncDownJson = ConfigManager.getSyncDownSetting();

		var mockResponseJson = ConfigManager.getMockResponseJson(syncDownJson.useMockResponse);

		// Fake Test Response Json - SHOULD WE DO THIS HERE, OR BEFORE 'performSyncUp' method?
		if (mockResponseJson) {
			WsCallManager.mockRequestCall(mockResponseJson, undefined, function (success, returnJson) {
				callBack(success, returnJson, true);
			});
		}
		else {
			var payloadJson = ConfigManager.getSyncDownSearchBodyEvaluated();
			Util.jsonCleanEmptyRunTimes(payloadJson, 2);

			if (payloadJson) {
				var loadingTag = undefined;
				WsCallManager.requestPostDws(syncDownJson.url, payloadJson, loadingTag, function (success, returnJson) {
					callBack(success, returnJson);
				});
			}
			else {
				callBack(false, ' searchBodyEval not provided');
			}
		}
	}
	catch (errMsg) {
		console.log('Error in SyncManagerNew.downloadClients - ' + errMsg);
		callBack(false, ' ErrorMsg - ' + errMsg);
	}
};

// ===================================================
// === UI Related Methods =============


SyncManagerNew.update_UI_StartSyncAll = function () {
	// initialise ProgressBar Defaults
	SyncManagerNew.initializeProgressBar();

	// animate syncButton 'running' 
	FormUtil.rotateTag($(SyncManagerNew.imgAppSyncActionButtonId), true);
};

SyncManagerNew.update_UI_FinishSyncAll = function () {
	SyncManagerNew.hideProgressBar();
	FormUtil.rotateTag($(SyncManagerNew.imgAppSyncActionButtonId), false);
};


SyncManagerNew.initializeProgressBar = function () {

	$(SyncManagerNew.subProgressBarId).removeClass('indeterminate');
	$(SyncManagerNew.subProgressBarId).addClass('determinate');

	FormUtil.updateProgressWidth(0);
	FormUtil.showProgressBar(0);
};

SyncManagerNew.hideProgressBar = function () {

	FormUtil.hideProgressBar();

	//$( syncManager.subProgressBar ).removeClass( 'determinate' );
	//$( syncManager.subProgressBar ).addClass( 'indeterminate' );
};

// ===================================================
// === 'syncStart/Finish' Related Methods =============

// use as callBack?  
SyncManagerNew.syncUpReadyCheck = function (activityJson) {
	var readyJson = { 'ready': false, 'loggedIn': false, 'online': false, 'syncableStatus': false, 'coolDownPass': false };

	if (activityJson) {
		readyJson.loggedIn = SessionManager.Status_LoggedIn;
		readyJson.online = ConnManagerNew.isAppMode_Online();
		readyJson.syncableStatus = SyncManagerNew.checkActivityStatus_SyncUpReady(activityJson);
		readyJson.coolDownPass = ActivityDataManager.checkActivityCoolDown(activityJson.id);

		readyJson.ready = (readyJson.loggedIn && readyJson.online && readyJson.syncableStatus && readyJson.coolDownPass);
		// For 'ResponseAction' scheduling case, we should stop the calling in background if 'syncableStatus' is false..
		//      For 'loggedIn' is false, (logged out case), should we stop it?  For now, have it running.
		//          The best would be     
	}

	return readyJson;
};


// Check Activity Status for 'SyncUp'
SyncManagerNew.checkActivityStatus_SyncUpReady = function (activityJson) {
	var bReady = false;

	if (activityJson && activityJson.processing && activityJson.processing.status) {
		bReady = SyncManagerNew.isSyncReadyStatus(activityJson.processing.status);
	}

	return bReady;
};

SyncManagerNew.isSyncReadyStatus = function (status) {
	return (status === Constants.status_queued
		|| status === Constants.status_failed
		|| status === Constants.status_hold);
};

// Another name for 'isSyncReadyStatus'
SyncManagerNew.statusSyncable = function (status) {
	return SyncManagerNew.isSyncReadyStatus(status);
};

// Synced Statuses, opposite to syncable
SyncManagerNew.statusSynced = function (status) {
	return (status === Constants.status_downloaded
		|| status === Constants.status_submit
		|| status === Constants.status_submit_wMsg
		|| status === Constants.status_submit_wMsgRead);
};

SyncManagerNew.isSyncAll_Running = function () {
	return (SyncManagerNew.syncAll_Running_Manual || SyncManagerNew.syncAll_Running_Scheduled);
};

SyncManagerNew.setSyncAll_Running = function (runType, bRunning) {
	if (runType === 'Manual') SyncManagerNew.syncAll_Running_Manual = bRunning;
	else if (runType === 'Scheduled') SyncManagerNew.syncAll_Running_Scheduled = bRunning;
};

SyncManagerNew.syncAll_FromSchedule = function (cwsRenderObj) {
	// Only perform this on online mode - Skip this time if offline..
	if (ConnManagerNew.isAppMode_Online()) {
		SyncManagerNew.syncAll(cwsRenderObj, 'Scheduled'); //, function( success ) {}
	}
};


// ===================================================
// === Sync All Msg to LS Methods =============

// After Login, we want to reset this 'SyncMsg'
SyncManagerNew.SyncMsg_Reset = function () {
	SyncManagerNew.SyncMsg_SetAsNew();
};

// Gets called by 'SyncMsg_Reset' & if this is empty.. (by 'SyncMsg_Get')
SyncManagerNew.SyncMsg_SetAsNew = function () {
	SyncManagerNew.syncMsgJson = Util.cloneJson(SyncManagerNew.template_SyncMsgJson);
};

SyncManagerNew.SyncMsg_Get = function () {
	if (!SyncManagerNew.syncMsgJson) SyncManagerNew.SyncMsg_SetAsNew();

	return SyncManagerNew.syncMsgJson;
};

SyncManagerNew.SyncMsg_InsertMsg = function (msgStr) {
	try {
		var newMsgJson = { "msg": msgStr, "datetime": Util.formatDateTime(new Date(), Util.dateType_DATETIME_s1) };
		SyncManagerNew.SyncMsg_Get().msgList.push(newMsgJson);

		//console.log( 'SyncManagerNew.SyncMsg: ' + JSON.stringify( newMsgJson ) );
	}
	catch (errMsg) {
		console.log('Error SyncManagerNew.SyncMsg_InsertMsg, errMsg: ' + errMsg);
	}
};


SyncManagerNew.SyncMsg_InsertSummaryMsg = function (summaryMsgStr) {
	var syncMsgJson = SyncManagerNew.SyncMsg_Get();  // SyncManagerNew.syncMsgJson??

	if (syncMsgJson) {
		var newSummaryMsgJson = { "msg": summaryMsgStr };

		syncMsgJson.summaryList.push(newSummaryMsgJson);

		//console.log( 'SyncManagerNew.SummarySyncMsg: ' + JSON.stringify( newSummaryMsgJson ) );
	}
	else {
		//console.log( 'Error SyncManagerNew.SyncMsg_InsertMsg, syncMsgJson undefined.' );
	}
};

SyncManagerNew.SyncMsg_ShowBottomMsg = function () {
	// TODO: Should do toggle of visible - if clicked again, hide it as well..
	//   ?? Where is the hiding logic?

	MsgAreaBottom.setMsgAreaBottom(function (syncInfoAreaTag) {
		var msgHeaderTag = syncInfoAreaTag.find('div.msgHeader');
		var msgContentTag = syncInfoAreaTag.find('div.msgContent');

		// 1. Set Header
		msgHeaderTag.append(Templates.syncMsg_Header);
		// TODO: Need to update the sync progress status.. and register 

		// 2. Set Body
		var syncMsgJson = SyncManagerNew.SyncMsg_Get();

		// Add Service Deliveries Msg
		SyncManagerNew.SyncMsg_createSectionTag('Services Deliveries', function (sectionTag, sectionLogTag) {
			for (var i = 0; i < syncMsgJson.msgList.length; i++) {
				//{ "msg": msgStr, "datetime": Util.formatDateTime( new Date() ) };
				var msgJson = syncMsgJson.msgList[i];

				var msgStr = msgJson.datetime + '&nbsp; &nbsp;' + msgJson.msg;

				sectionLogTag.append('<div>' + msgStr + '</div>');
			}

			msgContentTag.append(sectionTag);
		});


		// Add Summaries Msg
		SyncManagerNew.SyncMsg_createSectionTag('Summaries', function (sectionTag, sectionLogTag) {
			//var syncMsgJson = SyncManagerNew.SyncMsg_Get();

			for (var i = 0; i < syncMsgJson.summaryList.length; i++) {
				//{ "msg": msgStr, "datetime": Util.formatDateTime( new Date() ) };
				var msgJson = syncMsgJson.summaryList[i];

				sectionLogTag.append('<div>' + msgJson.msg + '</div>');
			}

			msgContentTag.append(sectionTag);
		});
	});
};


SyncManagerNew.SyncMsg_createSectionTag = function (sectionTitle, callBack) {
	var sectionTag = $(Templates.syncMsg_Section);

	var sectionTitleTag = sectionTag.find('div.sync_all__section_title').html(sectionTitle);
	var sectionLogTag = sectionTag.find('div.sync_all__section_log');

	callBack(sectionTag, sectionLogTag);
};

// ===================================================
// === Sync All Button (App Top) Click =============

SyncManagerNew.setAppTopSyncAllBtnClick = function () {
	$(SyncManagerNew.imgAppSyncActionButtonId).off('click').click(() => {
		// if already running, just show message..
		// if offline, also, no message in this case about offline...              
		if (SyncManagerNew.isSyncAll_Running()) {
			SyncManagerNew.SyncMsg_ShowBottomMsg();
		}
		else {
			// 1. SyncDown
			if (ConfigManager.getSyncDownSetting().enable && ConnManagerNew.isAppMode_Online()) {
				SyncManagerNew.syncDown('manualClick_syncAll', function (success, changeOccurred, errMsg) {
					if (success) {
						// NOTE: If there was a new merge, for now, alert the user to reload the list?
						if (changeOccurred) {
							// Display the summary of 'syncDown'.  However, this could be a bit confusing
							//SyncManagerNew.SyncMsg_ShowBottomMsg();

							var btnRefresh = $('<a class="notifBtn" term=""> REFRESH </a>');

							$(btnRefresh).click(() => {
								SessionManager.cwsRenderObj.renderArea1st();
							});

							MsgManager.notificationMessage('SyncDown data found', 'notifBlue', btnRefresh, '', 'right', 'top', 10000, false);
						}
					}
					else { } // Already displayed the error message in MsgManager.showMsg..

					SyncManagerNew.SyncMsg_ShowBottomMsg();
				});
			}


			// 2. SyncUp All
			SyncManagerNew.syncAll(SessionManager.cwsRenderObj, 'Manual', function (success) {
				SyncManagerNew.SyncMsg_ShowBottomMsg();
			});
		}
	});
};


// ----------------------------------------------
// Msg Related...


SyncManagerNew.bottomMsgShow = function (statusVal, activityJson, activityCardDivTag, contentFillFunc) {
	// If 'activityCardDivTag ref is not workign with fresh data, we might want to get it by activityId..
	MsgAreaBottom.setMsgAreaBottom(function (syncInfoAreaTag) {
		SyncManagerNew.syncResultMsg_header(syncInfoAreaTag, activityCardDivTag);
		SyncManagerNew.syncResultMsg_content(syncInfoAreaTag, activityCardDivTag, activityJson, statusVal, contentFillFunc);
	});
};

SyncManagerNew.syncResultMsg_header = function (syncInfoAreaTag, activityCardDivTag) {
	var divHeaderTag = syncInfoAreaTag.find('div.msgHeader');
	var statusLabel = activityCardDivTag.find('div.activityStatusText').text();

	var syncMsg_HeaderPartTag = $(Templates.syncMsg_Header);
	syncMsg_HeaderPartTag.find('.msgHeaderLabel').text = statusLabel;

	divHeaderTag.html(syncMsg_HeaderPartTag);
};


SyncManagerNew.syncResultMsg_content = function (syncInfoAreaTag, activityCardDivTag, activityJson, statusVal, contentFillFunc) {
	var divBottomTag = syncInfoAreaTag.find('div.msgContent');
	divBottomTag.empty();

	// 1. ActivityCard Info Add - From Activity Card Tag  
	var cardDivCopyTag = $(activityCardDivTag[0].outerHTML);
	cardDivCopyTag.find('div.tab_fs').remove();  // in case, it is clientCard Detail case, remove tab part under the client card.
	cardDivCopyTag.find('div.tab_fs__container').remove();

	divBottomTag.append(cardDivCopyTag); // << was activityJson.activityId


	// NEW: TODO: This content fill could be a call back
	if (contentFillFunc) {
		Util.tryCatchContinue(function () {
			contentFillFunc(divBottomTag);
		}, "syncResultMsg_content, Error in contentFillFunc call.");
	}
	else {
		// 2. Add 'processing' sync message.. - last one?
		Util.tryCatchContinue(function () {
			var historyList = activityJson.processing.history;

			if (historyList.length > 0) {
				var latestItem = historyList[historyList.length - 1];

				var title = 'Response code: ' + Util.getStr(latestItem.responseCode);
				var formattedMsg = SyncManagerNew.getMsgFormatted(latestItem.msg, statusVal);

				SyncManagerNew.bottomMsg_sectionRowAdd(divBottomTag, title, formattedMsg);
			}
		}, "syncResultMsg_content, activity processing history lookup");
	}
};

SyncManagerNew.bottomMsg_sectionRowAdd = function (divBottomTag, title, msg, option) {
	var msgSectionTag = $(Templates.msgSection);
	msgSectionTag.find('div.msgSectionTitle').text(title);
	msgSectionTag.find('div.msgSectionLog').text(msg);

	if (option) {
		if (option.sectionMarginTop) msgSectionTag.css('margin-top', option.sectionMarginTop);
	}

	divBottomTag.append(msgSectionTag);
};

SyncManagerNew.getMsgFormatted = function (msg, statusVal) {
	var formattedMsg = '';

	if (msg) {
		if (statusVal === Constants.status_error || statusVal === Constants.status_failed) {
			if (msg.indexOf('Value is not valid') >= 0) formattedMsg = 'One of the field has not acceptable value.';
			else if (msg.indexOf('not a valid') >= 0) formattedMsg = 'One of the field has wrong Dhis2 Uid in the country setting.';
			else if (msg.indexOf('Voucher not in Issue status') >= 0) formattedMsg = 'The voucher is not in issue status.';
			else if (msg.indexOf('Repeat Fail Marked as ERROR') >= 0) formattedMsg = 'Marked as error status due to more than 10 failure in sync attempts.';
			else if (msg.indexOf('Multiple vouchers with the code exists') >= 0) formattedMsg = 'Found multiple vouchers with the voucherCode.';
			else {
				if (msg.length > 140) formattedMsg = msg.substr(0, 70) + '....' + msg.substr(msg.length - 71, 70);
				else formattedMsg = msg;
			}
		}
		else formattedMsg = Util.getStr(msg, 200);
	}

	return formattedMsg;
};

// ===================================================
// === ACTIVITY SYNC UP RELATED =============

// Perform Submit Operation..
SyncManagerNew.performSyncUp_Activity = function (activityId, afterDoneCall) {
	var activityJson_Orig;
	var syncIconTag = ActivitySyncUtil.getSyncButtonDivTag(activityId);

	try {
		// gAnalytics Event
		GAnalytics.setEvent('SyncRun', activityId, 'activity', 1);
		//GAnalytics.setEvent = function(category, action, label, value = null) 

		activityJson_Orig = ActivityDataManager.getActivityById(activityId);

		if (!activityJson_Orig.processing) throw 'Activity.performSyncUp, activity.processing not available';
		if (!activityJson_Orig.processing.url) throw 'Activity.performSyncUp, activity.processing.url not available';

		var mockResponseJson = ConfigManager.getMockResponseJson(activityJson_Orig.processing.useMockResponse);


		// NOTE: On 'afterDoneCall', 'reRenderActivityDiv()' gets used to reRender of activity.  
		//  'displayActivitySyncStatus()' also has 'FormUtil.rotateTag()' in it.
		//  Probably do not need to save data here.  All the error / success case probably are covered and saves data afterwards.
		activityJson_Orig.processing.status = Constants.status_processing;
		activityJson_Orig.processing.syncUpCount = Util.getNumber(activityJson_Orig.processing.syncUpCount) + 1;

		ActivitySyncUtil.displayActivitySyncStatus(activityId);

		try {
			// Fake Test Response Json
			if (mockResponseJson) {
				WsCallManager.mockRequestCall(mockResponseJson, undefined, function (success, responseJson) {
					SyncManagerNew.syncUpWsCall_ResultHandle(syncIconTag, activityJson_Orig, activityId, success, responseJson, afterDoneCall);
				});
			}
			else {
				var payload = ActivityDataManager.activityPayload_ConvertForWsSubmit(activityJson_Orig);

				// NOTE: We need to add app timeout, from 'request'... and throw error...
				WsCallManager.wsActionCall(activityJson_Orig.processing.url, payload, undefined, function (success, responseJson) {
					SyncManagerNew.syncUpWsCall_ResultHandle(syncIconTag, activityJson_Orig, activityId, success, responseJson, afterDoneCall);
				});
			}
		}
		catch (errMsg) {
			throw ' Error on wsActionCall - ' + errMsg;  // Go to next 'catch'
		}
	}
	catch (errMsg) {
		// Stop the Sync Icon rotation
		// FormUtil.rotateTag( syncIconTag, false );

		// Set the status as 'Error' with detail.  Save to storage.  And then, display the changes on visible.
		var processingInfo = ActivityDataManager.createProcessingInfo_Other(Constants.status_error, 404, 'Error.  Can not be synced.  msg - ' + errMsg);
		ActivityDataManager.insertToProcessing(activityJson_Orig, processingInfo);

		ClientDataManager.saveCurrent_ClientsStore(() => {
			ActivitySyncUtil.displayActivitySyncStatus(activityId);
			afterDoneCall(false, errMsg);
		});
	}
};

// ----------------------------------------------

SyncManagerNew.syncUpWsCall_ResultHandle = function (syncIconTag, activityJson_Orig, activityId, success, responseJson, afterDoneCall) {
	// Stop the Sync Icon rotation
	FormUtil.rotateTag(syncIconTag, false);

	// NOTE: 'activityJson_Orig' is used for failed case only.  If success, we create new activity
	// Based on response(success/fail), perform app/activity/client data change
	SyncManagerNew.syncUpResponseHandle(activityJson_Orig, activityId, success, responseJson, function (success, errMsg, newStatus, extraData) {
		if (!extraData) extraData = {}; // Always have 'extraData'

		if (extraData.removedClientId) { } // In 'removedClientId' case, do not perform below.
		else {
			// Updates UI & perform any followUp actions - 'responseCaseAction'

			// On failure, if the syncUpCount has rearched the limit, set the appropriate status.
			var newActivityJson = ActivityDataManager.getActivityById(activityId);
			// If 'syncUpResponse' changed status, make the UI applicable..
			//var newActivityJson = ActivityDataManager.getActivityById( activityId );

			if (newActivityJson) {
				ActivitySyncUtil.displayActivitySyncStatus(activityId);

				// Process 'ResponseCaseAction' - responseJson.report - This schedules more syncUp attempts by response status/code
				//  - EX. if 'X400', try 10 more tries.. etc..
				if (responseJson && responseJson.report) {
					ActivityDataManager.processResponseCaseAction(responseJson.report, activityId);
				}
			}
			else {
				throw 'FAILED to handle syncUp response, activityId lost: ' + activityId;
			}
		}

		afterDoneCall(success, responseJson, newStatus, extraData);
	});
};

// =============================================

SyncManagerNew.syncUpResponseHandle = function (activityJson_Orig, activityId, success, responseJson, callBack) {
	var operationSuccess = false;

	// 1. Check success
	if (success && responseJson && responseJson.result && responseJson.result.client) {
		var clientJson = ConfigManager.downloadedData_UidMapping(responseJson.result.client);

		// #1. Check if current activity Id exists in 'result.client' activities..
		if (clientJson.activities && Util.getFromList(clientJson.activities, activityId, "id")) {
			operationSuccess = true;

			// 'syncedUp' processing data - OPTIONALLY, We could preserve 'failed' history...
			var processingInfo = ActivityDataManager.createProcessingInfo_Success(Constants.status_submit, 'SyncedUp processed.', activityJson_Orig.processing);

			// [NOTE: STILL USED?]
			// If this is 'fixActivityCase' request success result, remove the flag on 'processing' & delete the record in database.
			if (processingInfo.fixActivityCase) {
				delete processingInfo.fixActivityCase;
				SyncManagerNew.deleteFixActivityRecord(activityId);
			}


			// TODO: If this was c_switchUser transaction activity case, and the 'oldUser' matches this user,
			//  remove the user from database..
			var removedClient_bySwitchUser = false;
			var transSwitchUserList = activityJson_Orig.transactions.filter(trans => trans.type === 'c_switchUser');

			if (transSwitchUserList.length > 0) {
				var lastTrans_SwitchUser = transSwitchUserList[transSwitchUserList.length - 1];

				if (lastTrans_SwitchUser.dataValues && lastTrans_SwitchUser.dataValues.oldUser === INFO.login_UserName) removedClient_bySwitchUser = true;
				// NOT USED - confirm the case for deletion..
				// if ( clientJson.clientDetails.activeUsers && clientJson.clientDetails.activeUsers.indexOf( INFO.login_UserName ) === -1 ) { } // Also, check for 'creditedUsers' array..
			}

			if (removedClient_bySwitchUser) {
				// ## TODO: THIS WORKS?  The clientCard is removed automatically..  
				ClientDataManager.removeClient(clientJson);

				var extraData = { removedClientId: clientJson._id };

				ClientDataManager.saveCurrent_ClientsStore(() => {
					if (callBack) callBack(operationSuccess, undefined, Constants.status_submit, extraData);
				});
			}
			else {
				ClientDataManager.setActivityDateLocal_client(clientJson);

				// Removal of existing activity/client happends within 'mergeDownloadClients()'
				ClientDataManager.mergeDownloadedClients({ 'clients': [clientJson], 'case': 'syncUpActivity', 'syncUpActivityId': activityId }, processingInfo, function () {
					// 'mergeDownload' does saving if there were changes..  do another save?  for fix casese?  No Need?
					ClientDataManager.saveCurrent_ClientsStore(() => {
						if (callBack) callBack(operationSuccess, undefined, Constants.status_submit);
					});
				});
			}
		}
		else {
			var errMsg = 'No matching activity with id, ' + activityId + ', found on result.client.';
			var errStatusCode = 400;

			// 'syncedUp' processing data                
			var processingInfo = ActivityDataManager.createProcessingInfo_Other(Constants.status_failed, errStatusCode, 'ErrMsg: ' + errMsg);
			ActivityDataManager.insertToProcessing(activityJson_Orig, processingInfo);

			ClientDataManager.saveCurrent_ClientsStore(() => {
				if (callBack) callBack(operationSuccess, errMsg, Constants.status_failed);
			});
		}
	}
	else {
		var errMsg = 'Error: ';
		var errStatusCode = 400;
		var newStatus = Constants.status_failed;

		if (responseJson) {
			try {
				if (responseJson.errStatus) errStatusCode = responseJson.errStatus;

				if (responseJson.result) {
					if (responseJson.result.operation) errMsg += ' [result.operation]: ' + responseJson.result.operation;
					if (responseJson.result.errData) errMsg += ' [result.errData]: ' + Util.getJsonStr(responseJson.result.errData);
				}
				else if (responseJson.errMsg) errMsg += ' [errMsg]: ' + responseJson.errMsg;
				else if (responseJson.errorMsg) errMsg += ' [errorMsg]: ' + responseJson.errorMsg;
				else if (responseJson.report) errMsg += ' [report.msg]: ' + responseJson.report.msg;
				else {
					// TODO: Need to simplify this...
					SyncManagerNew.cleanUpErrJson(responseJson);
					errMsg += ' [else]: ' + Util.getJsonStr(responseJson);
				}

				// TODO: NOTE: Not enabled, yet.  Discuss with Susan 1st.
				if (responseJson.subStatus === 'errorStop' || responseJson.subStatus === 'errorRepeatFail') newStatus = Constants.status_error;

				// NEW!!
				if (responseJson.subStatus === 'notificationStop') {
					newStatus = Constants.status_error;
					console.log('[subStatus notificationStop]');
					console.log(responseJson);

					// Need to save the clients 'confirmClients' somewhere...  save in activity..?
					// Then, in open msg, we can present it with options...
					activityJson_Orig.confirmClients = responseJson.confirmClients;
				}
			}
			catch (errMsgCatched) {
				errMsg += ' [errMsgCatched]: ' + Util.getJsonStr(responseJson) + 'errMsgCatched: ' + errMsgCatched;
			}
		}

		// 'syncedUp' processing data                
		var processingInfo = ActivityDataManager.createProcessingInfo_Other(newStatus, errStatusCode, errMsg);
		ActivityDataManager.insertToProcessing(activityJson_Orig, processingInfo);

		ClientDataManager.saveCurrent_ClientsStore(() => {
			// Add activityJson processing
			if (callBack) callBack(operationSuccess, errMsg, newStatus);
		});
	}
};

SyncManagerNew.deleteFixActivityRecord = function (activityId) {
	try {
		//if ( fixedActivityList && fixedActivityList.length > 0 )
		var payloadJson = { 'find': { 'activityId': activityId } }; //{ '$in': fixedActivityList } } };

		WsCallManager.requestDWS_DELETE(WsCallManager.EndPoint_PWAFixActivitiesDEL, payloadJson, undefined, function () {
			console.log('Deleted fixActivityRecord, activityId ' + activityId);
		});
	}
	catch (errMsg) {
		console.log('ERROR during SyncManagerNew.deleteFixActivityRecord(), activityId: ' + activityId + ', errMsg: ' + errMsg);
	}
};

SyncManagerNew.cleanUpErrJson = function (responseJson) {
	try {
		if (responseJson.report) {
			var report = responseJson.report;
			if (report.process) delete report.process;
			if (report.log) delete report.log;
			if (report.req) delete report.req;
		}
	}
	catch (errMsg) {
		console.log('ERROR during SyncManagerNew.cleanUpErrJson, errMsg: ' + errMsg);
	}
};