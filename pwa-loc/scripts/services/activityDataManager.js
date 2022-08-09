// =========================================
// -------------------------------------------------
//     ActivityDataManager
//          - keeps activity list data & related methods.
//
//      - FEATURES:
//          1. Get Activity/ActivityList - by Id, etc..
//          2. Remove Activity/ActivityList/ActivityByClientId, etc..
//          3. Insert/Update Activity
//          4. ActivityList Regen, update, add (with index data)
//          5. Merge downloaded activities related
//          6. Activity Payload Related Methods
//          7. Create Activity Processing Info Related Methods
//          8. getCombinedTrans - get single json that combines all data in transactions
//
//      NEW:
//          - Create any static method to update the 'activityCard' (in case it exists) ?
// -------------------------------------------------

function ActivityDataManager() { };

ActivityDataManager._activityList = []; // Activity reference list - original data are  in each client activities.
ActivityDataManager._activityToClient = {};  // Fast reference - activity to client
//ActivityDataManager._activitiesIdx = {};  // index..  <-- need to put add / delete

// NOTE: BELOW IS USED?
ActivityDataManager.jsonSignature_Dhis2 = { "client": {} };
ActivityDataManager.jsonSignature_Mongo = { "transactions": [] };

// - ActivityCoolTime Variables
ActivityDataManager.activitiesLastSyncedInfo = {};  // "activityId": 'lastSyncDateTime' }, ...
ActivityDataManager.syncUpCoolDownTimeOuts = {};
ActivityDataManager.syncUpCoolDownList = {};

// ===================================================
// === MAIN FEATURES =============

// - Only call this on logOut
ActivityDataManager.clearActivityDataInMem = function () {
	ActivityDataManager._activityList = [];
	ActivityDataManager._activityToClient = {};
};

// ---------------------------------------
// --- Get Activity / ActivityList

ActivityDataManager.getActivityList = function () {
	return ActivityDataManager._activityList;
};

// Get single activity Item (by property value search) from the list - Called from 'activityItem.js'
ActivityDataManager.getActivityItem = function (propName, propVal) {
	return Util.getFromList(ActivityDataManager.getActivityList(), propVal, propName);
};

// Use index...  for faster..
ActivityDataManager.getActivityById = function (activityId) {
	return Util.getFromList(ActivityDataManager._activityList, activityId, 'id');
};

// ------------------------------------------------
// ---- Get Activity Id copied list - Used to delete or loop data without being affected by change data.
ActivityDataManager.getActivityIdCopyList = function () {
	var activityIdList = [];

	var activityList = ActivityDataManager.getActivityList();

	activityList.forEach(activity => {
		if (activity.id) activityIdList.push(activity.id);
	});

	return activityIdList;
};


// ---------------------------------------
// --- Remove Activity

ActivityDataManager.removeActivities = function (activities, option) {
	if (!option) option = {};

	if (activities && activities.length > 0) {
		for (var i = activities.length - 1; i >= 0; i--) {
			var activity = activities[i];

			if (activity) {
				var activityId = activity.id;
				ActivityDataManager.deleteExistingActivity_Indexed(activityId);

				if (option.removeActivityCardTags) {
					// If there is this client detailPage opened up, close it up.
					var activityDetailCardTag = $('div.card.activity._tab[itemid="' + activityId + '"]');
					if (activityDetailCardTag.length > 0) activityDetailCardTag.closest('div.wapper_card').find('.btnBack.clientDetail').click();

					// Remove all activityCards of this id.
					$('div.card.activity[itemid="' + activityId + '"]').remove();
				}
			}
		}
	}
};

// After 'syncUp', remove the payload <-- after syncDown?
ActivityDataManager.deleteExistingActivity_Indexed = function (activityId) {
	var client;  // return client - for case of temp client removal

	try {
		var existingActivity = Util.getFromList(ActivityDataManager._activityList, activityId, "id");

		if (activityId && existingActivity) {
			client = ClientDataManager.getClientByActivityId(activityId);

			// 1. Remove from activityList
			Util.RemoveFromArray(ActivityDataManager._activityList, "id", activityId);

			// 2. Remove from activityClientMap, 3. remove from client activities
			if (ActivityDataManager._activityToClient[activityId]) {
				var activityClient = ActivityDataManager._activityToClient[activityId];

				delete ActivityDataManager._activityToClient[activityId];

				Util.RemoveFromArray(activityClient.activities, "id", activityId);
			}

			// [NOT] 3. Remove TempClient if the client became empty.  <-- Moved outside of this method..  ClientDataManager.removeTempClient_ifEmptyActs( client );            
		}
	}
	catch (errMsg) {
		console.log('Error on ActivityDataManager.deleteExistingActivity_Indexed, errMsg: ' + errMsg);
	}

	return client;
};

// ---------------------------------------
// --- Insert Activity to client

ActivityDataManager.insertActivitiesToClient = function (activities, client, option) {
	for (var i = 0; i < activities.length; i++) {
		var activity = activities[i];

		// If this client or other client have same activity Id, remove those activites.. 1st..
		// If this activity ID exists in other client (diff obj), remove it.  <-- but if this is 
		var actClient = ActivityDataManager.deleteExistingActivity_Indexed(activity.id);
		ClientDataManager.removeTempClient_ifEmptyActs(actClient);

		// Even on activities merge, (existing client with pendnig acitivty synced, it will remove the activity on this client, and add as a new activity.. )

		// Insert the 'activity' to the client
		client.activities.push(activity);

		ActivityDataManager.updateActivityIdx(activity.id, activity, client, option);
	}

	// Client Activity Reorder - #1
	InfoDataManager.setINFOdata('client_sort', client);
	if (!ConfigManager.activitySorting_EvalRun("insertActivity")) {
		// NOTE: TODO: this cause issues...  
		try {
			Util.evalSort('date.createdLoc', client.activities, 'asc');
		}
		catch (errMsg) {
			console.log('ERROR during ActivityDataManager.insertActivitiesToClient, sorting activities by date.createdLoc, ' + errMsg);
		}
	}
	// undefined ones will always placed last, but will be handled on display time.
	// Util.evalSort( 'date.capturedLoc', client.activities, 'asc' );  // undefined ones will always placed last, but will be handled on display time.
};


// ---------------------------------------
// --- ActivityList Regen, update, add (with index data)

// Create 'activityList' and 'activityToClient' map.
ActivityDataManager.regenActivityList_NIndexes = function () {
	var clientList = ClientDataManager.getClientList();

	// Reset the activityList and mapping to client
	ActivityDataManager._activityList = [];
	ActivityDataManager._activityToClient = {};

	for (var i = 0; i < clientList.length; i++) {
		var client = clientList[i];

		ActivityDataManager.updateClientActivityListIdx(client);
	}
};


ActivityDataManager.updateClientActivityListIdx = function (client) {
	var removedActivityClient;

	if (client.activities) {
		client.activities.forEach(activity => {
			//ActivityDataManager.removeExistingActivity_NTempClient( activity.id, client, bRemoveActivityTempClient );
			// Only remove already indexed activity.  In full reindexing or start of app indexing, no activity index exists, thus, nothing to index.
			var deletedActivityClient = ActivityDataManager.deleteExistingActivity_Indexed(activity.id);
			if (deletedActivityClient && client !== deletedActivityClient) removedActivityClient = deletedActivityClient;

			// ReAdd the activity Idx
			ActivityDataManager.updateActivityIdx(activity.id, activity, client);
		});
	}

	return removedActivityClient;
};


ActivityDataManager.updateActivityIdx = function (activityId, activity, client, option) {
	// NOTE: Not deleting same 'activityId' activityJson from '_activityList'
	if (option && option.addToTop) {
		var position = -1;
		// NOTE: When adding the activity to top of the list (beginning of activityList),
		//   If the client is tempClient, add the activity after the client activities - add to position in acitivytList after that activity.
		if (option.newPayloadCase) position = ActivityDataManager.getTempClientActivityLastIndexCase(client);

		ActivityDataManager._activityList.splice(position + 1, 0, activity); // if position is -1, add to top (index 0).  If
		//ActivityDataManager._activityList.unshift( activity );
	}
	else {
		ActivityDataManager._activityList.push(activity);
	}

	ActivityDataManager._activityToClient[activityId] = client;
};


ActivityDataManager.getTempClientActivityLastIndexCase = function (client) {
	var position = -1;

	if (ClientDataManager.isTempClientCase(client)) {
		// if there is any activity not synced..
		client.activities.forEach(act => {
			if (SyncManagerNew.checkActivityStatus_SyncUpReady(act)) {
				var newPosition = ActivityDataManager._activityList.indexOf(act);
				if (newPosition > position) position = newPosition;
			}
		});
	}

	return position;
};


// ====================================================
// === Processing Activity timeOut to 'Failed' related

ActivityDataManager.updateActivitiesStatus_ProcessingToFailed = function (activityList, option) {
	if (activityList) {
		activityList.forEach(activity => {
			ActivityDataManager.updateStatus_ProcessingToFailed(activity, option);
		});
	}
};


ActivityDataManager.updateStatus_ProcessingToFailed = function (activity, option) {
	if (activity && activity.processing && activity.processing.status === Constants.status_processing) {
		var processingInfo = ActivityDataManager.createProcessingInfo_Other(Constants.status_failed, 408, 'Processing activity timed out case changed to failed status.');
		ActivityDataManager.insertToProcessing(activity, processingInfo);

		// On this case, we call this during loop, thus, do not save data here, but after all the operation is done..
		if (option && option.saveData === true) {
			ClientDataManager.saveCurrent_ClientsStore();
			// NOTE: If we also want to change status on UI, need to call - ActivitySyncUtil.displayActivitySyncStatus( activityId );
		}
	}
};


// Used to update activity status..
ActivityDataManager.updateStatus = function (activityJson, in_status, in_responseCode, in_msg, option) {
	if (activityJson && in_status) {
		if (!in_responseCode) in_responseCode = 0;
		if (!in_msg) in_msg = '';

		// Set the status as 'Error' with detail.  Save to storage.  And then, display the changes on visible.
		var processingInfo = ActivityDataManager.createProcessingInfo_Other(in_status, in_responseCode, in_msg);
		ActivityDataManager.insertToProcessing(activityJson, processingInfo);

		ActivitySyncUtil.displayActivitySyncStatus(activityJson.id);

		if (option && option.saveData === true) {
			ClientDataManager.saveCurrent_ClientsStore();
		}
	}
};


// ====================================================
// === Merge downloaded activities related

// Used by both 'SyncUp' or 'Download Merge'.
// 'SyncUp' - Use Temporary Client which gets deleted.
// 'Download Merge' - Normally, both app client and downloaded client exists.  Only get the activities not already exists..
ActivityDataManager.mergeDownloadedActivities = function (downActivities, appClientActivities, appClient, processingInfo, downloadedData) {
	var newActivities = [];

	// NOTE: New Client case will never reach here, thus, tempClient (delete on merge) case will not apply
	for (var i = 0; i < downActivities.length; i++) {
		var dwActivity = downActivities[i];

		try {
			// 'syncDown' - NEW ACTIVITY - only add new ones with passed 'processingInfo' ('download')
			// 'syncUp' - NEW ACTIVITY - same as above ('synced')
			// 'syncUp' - EXISTING ACTIVITY - override the status + history..

			// 'appClientActivities' is the matching client (by downloaded client id)'s activities
			// If the matching app client does not already hold the same activity (by id), proceed with ADD!!
			var appClientActivity = Util.getFromList(appClientActivities, dwActivity.id, "id");

			// New Activity Case
			if (!appClientActivity) {
				ActivityDataManager.insertToProcessing(dwActivity, processingInfo);

				newActivities.push(dwActivity);
			}
			else {
				// Existing Activity Cases:

				// If the syncUp performed was on this activity, existing client had this activity payload
				//  , thus simply write over to app activity --> by adding to 'newActivity' array -> to process it much below.
				//  --> 'ActivityDataManager.insertActivitiesToClient' has deleting same id activity and placing the downloaded one.
				if (downloadedData.syncUpActivityId && dwActivity.id === downloadedData.syncUpActivityId) {
					// This 'processingInfo' is already has 'history' of previous activity..
					ActivityDataManager.insertToProcessing(dwActivity, processingInfo);
					newActivities.push(dwActivity);
				}
				// NOTE: For other activities downloaded and existing, we should not merge it? - Do not add to activity?
				//  <-- On Mongo case, we should update it..  I think..
				else if (dwActivity.date && dwActivity.date.updateFromMongo
					&& (!appClientActivity.date.updateFromMongo
						|| (appClientActivity.date.updateFromMongo
							&& dwActivity.date.updateFromMongo > appClientActivity.date.updateFromMongo)
					)
				) {
					// NOTE:
					// If 'dwActivity.date.updateFromMongo' exists and later then appClientActivity one (if exists)
					// Adding to 'newActivities' would update/replace the activity in 'appClient'
					// THIS DOES NOT SEEM TO BE USED CURRENTLY

					// NEED TO TEST THIS
					ActivityDataManager.insertToProcessing(dwActivity, processingInfo);
					newActivities.push(dwActivity);
				}
			}
		}
		catch (errMsg) {
			console.log('Error during ActivityDataManager.mergeDownloadedActivities, errMsg: ' + errMsg);
		}
	}


	// if new list to push to appClientActivities exists, add to the list.
	if (newActivities.length > 0) {
		//ActivityDataManager.insertActivitiesToClient( newActivities, appClient, { 'bRemoveActivityTempClient': true } );
		ActivityDataManager.insertActivitiesToClient(newActivities, appClient);

		// NOTE: Could sort all activities in this client AT THIS TIME.
		//  - Whenever there is an activity to add, we can do sort here? oldest(lowest date string value) on top - ascending
		// appClient.activities.sort( function(a, b) { return Util.sortCompare( a.date.createdOnDeviceUTC, b.date.createdOnDeviceUTC ) } );
	}

	// Return the number of added ones.
	return newActivities;
};

// --------------------------------------
// -- Activity Payload Related Methods

ActivityDataManager.generateActivityPayloadJson = function (actionUrl, blockId, formsJsonActivityPayload, actionDefJson, blockPassingData) {
	var activityJson = {};
	var history = [];

	if (!formsJsonActivityPayload.payload) throw 'activityPayloadsJson.payload not exists';
	else {
		var createdDT = new Date();
		var payload = formsJsonActivityPayload.payload;
		var searchValues = payload.searchValues;
		var existingClientId;

		// CONVERT 'searchValues'/'captureValues' structure ==> 'captureValues.processing': { 'searchValues' }
		activityJson = payload.captureValues; // Util.cloneJson( payload.captureValues );
		// FAILED TO GENERATE - ERROR MESSAGE..
		if (!activityJson) throw 'payload captureValues not exists!';


		// extraActionCase are used for 'scheduled activity create action'.  Do not look at current block or hidden tags
		var extraActionCase = (actionDefJson && actionDefJson.formDataOverride);

		// ===============================================================
		// Existing activity case - Editing
		var editModeActivityId = ActivityDataManager.getEditModeActivityId(blockId);
		if (!editModeActivityId && actionDefJson.editActivityId) editModeActivityId = actionDefJson.editActivityId;

		var existingActivityJson;
		var existingActivityJson_Clone;

		if (!extraActionCase && editModeActivityId) {
			// ACTIVITY EDITING:
			//  [Pending - Not Created, yet (In backend) ] - Delete entire things?  But, keep the 'history' of attempts..
			//  [Created Activity Editing ] - Let backend handle editing/backing up - with 'editMode_existsOnServer'
			existingActivityJson = ActivityDataManager.getActivityById(editModeActivityId);

			if (existingActivityJson) {
				existingActivityJson_Clone = Util.cloneJson(existingActivityJson);

				var statusSynced = ActivityDataManager.isActivityStatusSynced(existingActivityJson);

				if (existingActivityJson.editMode_existsOnServer || statusSynced) activityJson.editMode_existsOnServer = true;  // Only applicable on mongo version...

				var client = ClientDataManager.getClientByActivityId(existingActivityJson.id);
				if (client) existingClientId = client._id;

				// editMode_existsOnServer case, it means it is not only local version, but also stored in DB.
				// Use clientId & activityId for search, so that we can delete it on server( db ).
				if (activityJson.editMode_existsOnServer)  // It is used only for 'scheduleCancel' case, but wanted to make it more generic?
				{
					if (client) {
						searchValues = { '_id': client._id };
						//existingClientId = client._id;

						// 'capturedUTC/Loc' & 'updatedUTC/Loc' would be copied to existing activity on backend.
						ActivityDataManager.setActivityDate_Update(activityJson, createdDT);
					}

					var scheduleConvertValStr = ActivityDataManager.getEditModeHiddenVal(blockId, 'scheduleConvert');
					if (scheduleConvertValStr === 'true') {
						activityJson.ws_action = 'scheduleConvert';
					}
				}

				// Update History..
				history = ActivityDataManager.getProcessingHistory(existingActivityJson);
				history.push(ActivityDataManager.createProcessingHistory('', 200, UtilDate.formatDate(), 'Activity Editing'));

				// Delete this Activity from this device (global & client local data..)
				ActivityDataManager.deleteExistingActivity_Indexed(editModeActivityId);
				activityJson.id = editModeActivityId;
			}
		}


		// If activityId were not generated by the payload generation methods, create one.
		if (!activityJson.id) activityJson.id = SessionManager.sessionData.login_UserName + '_' + $.format.date(createdDT.toUTCString(), 'yyyyMMdd_HHmmss') + createdDT.getMilliseconds();


		// Reset previously set CoolDown Period on sycUp
		ActivityDataManager.clearActivityLastSyncedUp(activityJson.id);

		// Make sure activity date are filled
		ActivityDataManager.setNewActivityDate(activityJson, createdDT);


		// TODO: 'history' should be merged if exitsing history exists..
		activityJson.processing = {
			'created': Util.formatDateTimeStr(createdDT.toString())
			, 'status': Constants.status_queued
			, 'history': history  // if prev history exists, use that. 
			, 'url': actionUrl
			, 'searchValues': searchValues  // if exiting activity case, we should force it to be clientId & activityId..
		};

		if (actionDefJson && actionDefJson.useMockResponse) activityJson.processing.useMockResponse = actionDefJson.useMockResponse;
		if (existingClientId) activityJson.processing.existingClientId = existingClientId;
		// NEW: Create a way to rollBack - as long as it is still not synced!!  <-- while the change is local.
		//   - Use Case:  When we created an activity from a schedule using 'fav_sch', we like to roll back to schedule rather than delete.
		if (existingActivityJson_Clone) activityJson.processing.editRollBackData = existingActivityJson_Clone;


		// Form Information
		if (blockId) {
			if (actionDefJson && actionDefJson.formDataOverride) {
				activityJson.formData = actionDefJson.formDataOverride;
			}
			else {
				// Change to formData
				activityJson.formData = {
					'blockId': blockId
					, 'activityId': activityJson.id
					, 'showCase': (blockPassingData) ? blockPassingData.showCase : ''
					, 'hideCase': (blockPassingData) ? blockPassingData.hideCase : ''
					, 'data': ActivityUtil.generateFormsJsonArr($("[blockId='" + blockId + "']"))
				};
			}
		}
	}

	return activityJson;
};


ActivityDataManager.setNewActivityDate = function (activityJson, createdDT) {
	// Activity 'date' fill up - if not properly populated already
	if (!activityJson.date) activityJson.date = {};

	// Not 'capturedLoc'/'capturedUTC' could be set by backend with 'captureDate' overrider.. <-- in Dhis2..
	if (!activityJson.date.createdLoc) activityJson.date.createdLoc = Util.formatDate(createdDT);
	if (!activityJson.date.createdUTC) activityJson.date.createdUTC = Util.formatDate(createdDT.toUTCString());

	// .toUTCStirng() format lose milliseconds, but that should be OK.
	if (!activityJson.date.updatedLoc) activityJson.date.updatedLoc = activityJson.date.createdLoc;
	if (!activityJson.date.updatedUTC) activityJson.date.updatedUTC = activityJson.date.createdUTC;
};


ActivityDataManager.setActivityDate_Update = function (activityJson, dateNow) {
	// Activity 'date' fill up - if not properly populated already
	if (!activityJson.date) activityJson.date = {};

	if (!activityJson.date.updatedLoc) activityJson.date.updatedLoc = Util.formatDate(dateNow);
	if (!activityJson.date.updatedUTC) activityJson.date.updatedUTC = Util.formatDate(dateNow.toUTCString());
};

// ----------------------------

ActivityDataManager.getEditModeHiddenVal = function (blockId, hiddenValId) {
	return (blockId) ? $("[blockId='" + blockId + "']").find("." + hiddenValId).val() : undefined;
};

ActivityDataManager.getEditModeActivityId = function (blockId) {
	return (blockId) ? $("[blockId='" + blockId + "']").find(".editModeActivityId").val() : undefined;
};

ActivityDataManager.setEditModeHiddenVal = function (blockId, activityId, moreHiddenVal) {
	return ActivityDataManager.setEditModeActivityId(blockId, activityId, moreHiddenVal);
};

ActivityDataManager.setEditModeActivityId = function (blockId, activityId, moreHiddenVal) {
	var blockTag = $("[blockId='" + blockId + "']");

	ActivityDataManager.setEditModeActivityId_blockTag(blockTag, activityId, moreHiddenVal);

	return blockTag;
};

ActivityDataManager.setEditModeActivityId_blockTag = function (blockTag, activityId, moreHiddenVal) {
	blockTag.append("<input type='hidden' class='editModeActivityId' value='" + activityId + "'>");

	if (moreHiddenVal && Util.isTypeObject(moreHiddenVal)) {
		Util.convertObjMapToArray(moreHiddenVal).forEach(json => {
			blockTag.append("<input type='hidden' class='" + json.key + "' value='" + json.value + "'>");
		});
	}
};


// MAIN - Activity Payload Generation - Add new activity with client assign/generation
ActivityDataManager.createNewPayloadActivity = function (actionUrl, blockId, formsJsonActivityPayload, actionDefJson, blockPassingData, callBack) {
	try {
		var activityJson;

		if (actionDefJson.activityJson) activityJson = actionDefJson.activityJson; // NEW: override of already set activityJson - on JobAid.
		else activityJson = ActivityDataManager.generateActivityPayloadJson(actionUrl, blockId, formsJsonActivityPayload, actionDefJson, blockPassingData);

		var client;

		if (actionDefJson.currTempClientId) {
			client = ClientDataManager.getClientById(actionDefJson.currTempClientId);
		}
		else if (actionDefJson.underClient && actionDefJson.clientId) {
			client = ClientDataManager.getClientById(actionDefJson.clientId);
		}
		else if (activityJson.processing.existingClientId) {
			client = ClientDataManager.getClientById(activityJson.processing.existingClientId);
		}

		if (!client) client = ClientDataManager.createClient_forActivityPayload(activityJson);


		// TODO: When adding, check for 'c_reg' activity not yet synced case.  If so, add new activity on bottom..
		// Better, yet, always add new activity to after unsynced activity postion on main activity List.
		ActivityDataManager.insertActivitiesToClient([activityJson], client, { 'addToTop': true, 'newPayloadCase': true });

		ClientDataManager.saveCurrent_ClientsStore(() => {
			if (callBack) callBack(activityJson, client);
		});
	}
	catch (errMsg) {
		MsgManager.msgAreaShow('Failed to generate activity! ' + errMsg, 'ERROR');
		if (callBack) callBack();
	}
};

ActivityDataManager.activityPayload_ConvertForWsSubmit = function (activityJson, _version) {

	if (!_version) _version = _ver;
	// TRAN TODO : "_ver" is defined in index.html. It is hard to use the variables in index.html for unit test. 
	// We should put this one some place else is better to manager
	var payloadJson = {
		"appVersion": _version,  //ActivityDataManager.wsSubmit_AppVersionStr,
		"payload": undefined,
		"historyData": activityJson.processing.historyData //ActivityDataManager.getHistoryData( activityJson.processing.history )
	};


	if (activityJson.processing.fixActivityCase) {
		//payloadJson.skipLogDataCheck = true;
		payloadJson.fixActivityCase = true;
		// This uses existing log payload...
		payloadJson.payload = {
			'searchValues': {},
			'captureValues': { "id": activityJson.id }
		};
	}
	else {
		// 'activity' are not in 'search/capture' structure.  Change it to that structure.
		var activityJson_Copy = Util.cloneJson(activityJson);
		delete activityJson_Copy.processing;

		payloadJson.payload = {
			'searchValues': activityJson.processing.searchValues,
			'captureValues': activityJson_Copy
			//,'userFormData': activityJson.formData  // OBSOLETE - Replaced by 'formData', which is stored witin activity in mongo.
		};
	}

	// Future Special Cases Flags..

	return payloadJson;
};

// NOTE: CHANGE this 'getHistoryData' to be more of placed/stored data under 'processing'.
//      NEW CONdition:
//          - After each sync performed, we can evaludate this..
//          - If status is 'failed', walk back to count the value..
//          - If status is non failed, reset the value?  or make the historyData unavailable..
ActivityDataManager.getHistoryData = function (history) {
	var historyData = { 'failedCount': 0, 'failed1stDate': '' };

	if (history) {
		try {
			var foundList = [];

			for (var i = history.length - 1; i >= 0; i--) {
				var item = history[i];

				if (item.status === Constants.status_failed) foundList.push(item);
				else break;
			}
			//var foundList = Util.getItemsFromList( history, Constants.status_failed, "status" );

			historyData.failedCount = foundList.length;

			if (foundList.length > 0) {
				var item1st = foundList[foundList.length - 1];
				if (item1st.datetime) historyData.failed1stDate = UtilDate.getUTCDateTimeStr(UtilDate.getDateObj(item1st.datetime), 'noZ');
			}
		}
		catch (errMsg) {
			console.log('ERROR on ActivityDataManager.getHistoryData, errMsg: ' + errMsg);
		}
	}

	return historyData;
};


ActivityDataManager.getActivityForm = function (activityJson) {
	var formData;

	if (activityJson.processing && activityJson.processing.form) formData = activityJson.processing.form
	else if (activityJson.formData) formData = activityJson.formData;

	return formData;
};


ActivityDataManager.getProcessingHistory = function (activity) {
	var history = [];

	if (activity && activity.processing && activity.processing.history) {
		history = activity.processing.history;
	}

	return history;
};

// ----------------------------------------------
// --- Create Activity Processing Info Related

// NEW
ActivityDataManager.createProcessingHistory = function (statusStr, responseCode, dateStr, msgStr) {
	return { 'status': statusStr, 'responseCode': responseCode, 'datetime': dateStr, 'msg': msgStr };
};


ActivityDataManager.createProcessingInfo_Success = function (statusStr, msgStr, prev_ProcessingInfo) {
	var dateStr = Util.formatDateTimeStr((new Date()).toString());
	var currInfo = ActivityDataManager.createProcessingHistory(statusStr, 200, dateStr, msgStr);
	var processingInfo;

	if (prev_ProcessingInfo) {
		processingInfo = Util.cloneJson(prev_ProcessingInfo);
		// delete processingInfo.form;  // Changed to keep the 'form'
	}
	else {
		processingInfo = { 'created': dateStr, 'history': [] };
	}

	processingInfo.status = statusStr;
	processingInfo.history.push(currInfo);
	processingInfo.syncUpCount = 0;  // or remove it.

	return processingInfo;
};


ActivityDataManager.createProcessingInfo_Other = function (statusStr, responseCode, msgStr) {
	var dateStr = Util.formatDateTimeStr((new Date()).toString());
	var processingInfo = {
		'status': statusStr,
		'history': [ActivityDataManager.createProcessingHistory(statusStr, responseCode, dateStr, msgStr)]
	};

	return processingInfo;
};


ActivityDataManager.insertToProcessing = function (activity, newProcessingInfo) {
	if (activity && newProcessingInfo) {
		if (activity.processing) {
			// Update the 'processing' data with 'status' & 'history'
			activity.processing.status = newProcessingInfo.status;
			Util.appendArray(activity.processing.history, Util.cloneJson(newProcessingInfo.history));
		}
		else {
			// Create New 'processing' data.
			activity.processing = Util.cloneJson(newProcessingInfo);

			// update the 'created' as mongoDB one if exists..            
			if (activity.date) ActivityDataManager.updateProcessing_CreatedDate(activity);
		}

		if (activity.processing.status === Constants.status_error) AppInfoManager.addNewErrorActivityId(activity.id);

		// NEW - add logic of 'historyData' here <-- Which stores the updated failed count..
		if (activity.processing.status === Constants.status_failed) activity.processing.historyData = ActivityDataManager.getHistoryData(activity.processing.history);
		else activity.processing.historyData = {};
	}
};


ActivityDataManager.updateProcessing_CreatedDate = function (activity) {
	// Based on 'activity.date' UTC date, create 'processing.created'
	try {
		var activityUtcDate = '';

		if (activity.date.createdOnDeviceUTC) activityUtcDate = activity.date.createdOnDeviceUTC;
		else if (activity.date.createdOnMdbUTC) activityUtcDate = activity.date.createdOnMdbUTC;

		if (activityUtcDate) {
			var localDateTime = Util.dateUTCToLocal(activityUtcDate);
			if (!localDateTime) localDateTime = new Date();

			var updateCreated = Util.formatDateTime(localDateTime);
			if (updateCreated) activity.processing.created = updateCreated;
		}
	}
	catch (errMsg) {
		console.log('ERROR in ActivityDataManager.updateProcessing_Created, errMsg: ' + errMsg);
	}
};

// --------------------------------------------
// --- Other Methods

ActivityDataManager.getCombinedTrans = function (activityJson) {
	var jsonCombined = {};

	try {
		var transList = activityJson.transactions;

		if (transList) {
			for (var i = 0; i < transList.length; i++) {
				var tranData_dv = transList[i].dataValues;
				var tranData_cd = transList[i].clientDetails;

				if (tranData_dv) {
					for (var prop in tranData_dv) {
						jsonCombined[prop] = tranData_dv[prop];
					}
				}

				if (tranData_cd) {
					for (var prop in tranData_cd) {
						jsonCombined[prop] = tranData_cd[prop];
					}
				}
			}
		}
	}
	catch (errMsg) {
		console.log('Error during ActivityDataManager.getCombinedTrans, errMsg: ' + errMsg);
	}

	return jsonCombined;
};


ActivityDataManager.getData_FromTrans = function (activityJson, propName) {
	var dataJson = {};

	try {
		var transList = ActivityDataManager.getTransAsList(activityJson.transactions);

		// transList could be object type or array list..
		if (Util.isTypeArray(transList)) {
			transList.forEach(tran => {
				var tranData_cd = tran[propName];
				if (tranData_cd) {
					for (var prop in tranData_cd) {
						dataJson[prop] = tranData_cd[prop];
					}
				}
			});
		}
	}
	catch (errMsg) {
		console.log('Error during ActivityDataManager.getData_FromTrans, errMsg: ' + errMsg);
	}

	return dataJson;
};


// Used to convert 'UTC' time to 'Loc' time - used when activity/client is downloaded from server
//  - The used device might have different timezone, thus, we will populate correct Loc time..
ActivityDataManager.setActivityDateLocal = function (activityJson) {
	try {
		if (activityJson.date) {
			if (ConfigManager.isSourceTypeDhis2()) {
				// capturedUTC, createdUTC, updatedUTC <-- if exists, convert Loc
				var srcLocalTimeCase = (ConfigManager.getConfigJson().sourceAsLocalTime || ConfigManager.getConfigJson().dhis2UseLocalTime);

				// If Dhis2 stored date is saved as Local dateTime, set it as 'Loc' and get/calculate UTC from it.
				if (srcLocalTimeCase) UtilDate.setDate_LocToUTC_bySrc(activityJson.date, 'capturedLoc', activityJson.date.capturedUTC);
				else UtilDate.setDate_UTCToLoc(activityJson.date, 'capturedUTC');
			}
			else // mongo soruce case
			{
				UtilDate.setDate_UTCToLoc_fields(activityJson.date, 'ALL');  // Or automatically all?
			}
		}
	}
	catch (errMsg) {
		console.log('Error in ActivityDataManager.setActivityDateLocal, ' + errMsg);
	}
};


// NOTE: This does not work on edit case or curr payload is already added to activity..  Due to self activity is found with this match.
//      - Used on voucherCode 'Get' from Queue.
ActivityDataManager.isVoucherCodeUsed = function (voucherCode) {
	var isUsed = false;

	try {
		var matchActivities = ActivityDataManager.getActivitiesByVoucherCode(voucherCode, undefined, true);
		if (matchActivities.length > 0) isUsed = true;
	}
	catch (errMsg) { console.log('ERROR in ActivityDataManager.isVoucherCodeUsed, ' + errMsg); }

	return isUsed;
};


ActivityDataManager.getActivitiesByVoucherCode = function (voucherCode, opt_TransType, opt_bGetOnlyOnce) {
	var matchActivities = [];

	if (voucherCode) {
		var activityList = ActivityDataManager.getActivityList();

		for (var i = 0; i < activityList.length; i++) {
			var matchingTrans;
			var activityJson = activityList[i];
			var transList = ActivityDataManager.getTransAsList(activityJson.transactions);

			for (var p = 0; p < transList.length; p++) {
				var trans = transList[p];
				var matchingTrans = ActivityDataManager.checkTransByVoucherCode(trans, voucherCode, opt_TransType);
				if (matchingTrans) break;
			}

			if (matchingTrans) {
				matchActivities.push(activityJson)
				if (opt_bGetOnlyOnce) break;
			}
		}
	}

	return matchActivities;
};

ActivityDataManager.checkTransByVoucherCode = function (trans, voucherCode, opt_TransType) {
	var matchingTrans;

	if (trans.clientDetails && trans.clientDetails.voucherCode === voucherCode) {
		if (opt_TransType) {
			// Match found - with transType
			if (trans.type === opt_TransType) matchingTrans = trans;
		}
		// Match found - without transType
		else matchingTrans = trans;
	}

	return matchingTrans;
};


ActivityDataManager.getTransByTypes = function (activityJson, typesArr) {
	var transListFound = [];

	if (activityJson && activityJson.transactions && typesArr) {
		var transList = ActivityDataManager.getTransAsList(activityJson.transactions);

		transList.forEach(trans => {
			if (typesArr.indexOf(trans.type) >= 0) transListFound.push(trans);
		});
	}

	return transListFound;
};

// Get Transactions (array or object) as array list
ActivityDataManager.getTransAsList = function (transactions) {
	var transList = [];

	if (transactions) {
		if (Util.isTypeArray(transactions)) transList = transactions;
		else if (Util.isTypeObject(transactions)) {
			for (var tranTypeKey in transactions) {
				var trans = transactions[tranTypeKey];
				trans.type = tranTypeKey;
				transList.push(trans);
			}
		}
	}

	return transList;
};


// --------------------------------------------
// --- Sync & ActivityCard Related Metods


ActivityDataManager.activityUpdate_ByResponseCaseAction = function (activityId, actionJson) {
	if (actionJson) {
		// Both below methods does saving to clientStore..
		ActivityDataManager.activityUpdate_Status(activityId, actionJson.status);

		ActivityDataManager.activityUpdate_History(activityId, actionJson.status, actionJson.msg, 0);
	}
};


// NOTE: Update Status + 
ActivityDataManager.activityUpdate_Status = function (activityId, status, returnFunc) {
	if (status) {
		var activityJson = ActivityDataManager.getActivityById(activityId);

		if (activityJson && activityJson.processing) {
			activityJson.processing.status = status;

			// Need to save storage afterwards..
			ClientDataManager.saveCurrent_ClientsStore(() => {
				// update ActivityCard is visible..
				ActivitySyncUtil.displayActivitySyncStatus(activityId);

				if (returnFunc) returnFunc();
			});
		}
	}
};


// NOTE: This also saves status as well, but does not refresh the UI status part!!
ActivityDataManager.activityUpdate_History = function (activityId, status, msg, httpResponseCode) {
	var activityJson = ActivityDataManager.getActivityById(activityId);

	if (activityJson) {
		var processingInfo = ActivityDataManager.createProcessingInfo_Other(status, httpResponseCode, msg);
		ActivityDataManager.insertToProcessing(activityJson, processingInfo);

		ClientDataManager.saveCurrent_ClientsStore();
	}
};

// =======================================================
// ===== ActivityCoolDownTime Related Methods

ActivityDataManager.setActivityLastSyncedUp = function (activityId) {
	ActivityDataManager.activitiesLastSyncedInfo[activityId] = UtilDate.getDateTimeStr();
};

ActivityDataManager.getActivityLastSyncedUp = function (activityId) {
	return ActivityDataManager.activitiesLastSyncedInfo[activityId];
};

ActivityDataManager.clearActivityLastSyncedUp = function (activityId) {
	if (ActivityDataManager.activitiesLastSyncedInfo[activityId]) delete ActivityDataManager.activitiesLastSyncedInfo[activityId];
};

// ----------------------------------------------

// OBSOLETE - REMOVE THIS..

ActivityDataManager.setSyncUpCoolDown_TimeOutId = function (activityId, timeOutId) {
	ActivityDataManager.syncUpCoolDownTimeOuts[activityId] = timeOutId;
};

ActivityDataManager.clearSyncUpCoolDown_TimeOutId = function (activityId) {
	var timeOutId = ActivityDataManager.syncUpCoolDownTimeOuts[activityId];
	if (timeOutId) clearTimeout(timeOutId);
};

// ----------------------------------------------

ActivityDataManager.checkActivityCoolDown = function (activityId, optCallBack_coolDown, optCallBack_noCoolDown) {
	var coolDownPassed = true;  // 'false' means it is still during/within coolDown time.
	var timeRemain;

	try {
		var lastSynced = ActivityDataManager.getActivityLastSyncedUp(activityId);

		if (lastSynced) {
			var coolDownMs = ConfigManager.coolDownTime;
			var timePassedMs = UtilDate.getTimePassedMs(lastSynced);

			if (timePassedMs > 0 && coolDownMs && timePassedMs <= coolDownMs) {
				timeRemain = coolDownMs - timePassedMs;
				coolDownPassed = false;
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in ActivityDataManager.checkActivityCoolDown, errMsg: ' + errMsg);
	}


	// Check coolDown still going on status, and perform some callBacks..
	if (!coolDownPassed) {
		// If cool down time has not passed, perform coolDown callBack.
		if (timeRemain && optCallBack_coolDown) optCallBack_coolDown(timeRemain);
	}
	else {
		// If coolDown has passed, perform below noCoolDown callback if passed...
		if (optCallBack_noCoolDown) {
			ActivityDataManager.clearSyncUpCoolDown_TimeOutId(activityId);
			optCallBack_noCoolDown();
		}
	}

	return coolDownPassed;
};


// ----------------------------------------

ActivityDataManager.getActivityStatus = function (activity) {
	return (activity && activity.processing && activity.processing.status) ? activity.processing.status : '';
};

ActivityDataManager.hasActivityStatus = function (activity) {
	return (ActivityDataManager.getActivityStatus(activity)) ? true : false;
};

ActivityDataManager.isActivityStatusSyncable = function (activity) {
	return (ActivityDataManager.hasActivityStatus(activity) && SyncManagerNew.statusSyncable(activity.processing.status));
};

// Synced Statuses, opposite to syncable
ActivityDataManager.isActivityStatusSynced = function (activity) {
	return (ActivityDataManager.hasActivityStatus(activity) && SyncManagerNew.statusSynced(activity.processing.status));
};

// ------------------------------------
//   ResponseCaseAction Related 

// - 'ResponseCaseAction' defined in config, is a triggering schedule of additional syncUps by the response status.
// "definitionResponseCaseActions": {  "X400": {  "voucher_not_found": { "syncAction": {"syncInterval": "00:00:10", "maxAttempts": 10,
// If current activity syncUp response status code is 'X400', try 10 more times in 10 min interval.
ActivityDataManager.processResponseCaseAction = function (reportJson, activityId) {
	// Check for matching oens..
	var caseActionJson = ConfigManager.getResponseCaseActionJson(reportJson);

	if (caseActionJson) {
		// 1. Activity status + msg update if available..
		ActivityDataManager.activityUpdate_ByResponseCaseAction(activityId, caseActionJson);

		// 2. Schedule the sync - new type of schedule..
		ScheduleManager.syncUpResponseActionListInsert(caseActionJson.syncAction, activityId);
	}
};

// ------------------------------------
//   ResponseCaseAction Related 

ActivityDataManager.getVoucherActivitiesData = function (activities, voucherCode) {
	var voucherData = { voucherCode: voucherCode, issuedUser: '', v_issDate: undefined, createdDateStr: '', v_issCreatedDateStr: '', v_issDateStr: '', activities: [], transList: [], rdxActList: [] };  // voucher Activties

	if (voucherCode && activities && Util.isTypeArray(activities)) {
		// use 'capturedLoc'? (or 'capturedUTC'?) as main date to compare 
		activities.forEach(activity => {
			if (activity.transactions && Util.isTypeArray(activity.transactions)) {
				activity.transactions.forEach(trans => {
					try {
						if ((trans.clientDetails && trans.clientDetails.voucherCode === voucherCode)
							|| (trans.dataValues && trans.dataValues.voucherCode === voucherCode)) {
							if (trans.type === 'v_iss') {
								voucherData.issuedUser = activity.activeUser;

								if (activity.date) {
									voucherData.v_issDate = activity.date;

									voucherData.createdDateStr = activity.date.createdLoc;  // Changed..
									voucherData.v_issCreatedDateStr = activity.date.createdLoc;
									voucherData.v_issDateStr = activity.date.capturedLoc;
								}
							}

							if (trans.type.indexOf('v_rdx') === 0) voucherData.rdxActList.push(activity);

							voucherData.activities.push(activity);
						}
					}
					catch (errMsg) { console.log('ERROR in ActivityDataManager.getVoucherActivitiesData.trans, voucherCode: ' + voucherCode + ', ' + errMsg); }
				});
			}
		});

		// Sort by 'captureLoc' date
		if (voucherData.activities.length > 1) {
			try {
				voucherData.activities.sort(function (a, b) {
					return (a.date.capturedLoc >= b.date.capturedLoc) ? 1 : -1;
				}
				);
			}
			catch (errMsg) { console.log('ERROR in ActivityDataManager.getVoucherActivitiesData.sort, voucherCode: ' + voucherCode + ', ' + errMsg); }
		}

		// Get transactions of the activity and put it ..
		voucherData.activities.forEach(activity => {
			activity.transactions.forEach(trans => voucherData.transList.push(trans));
		});
	}

	return voucherData;
};

// --------------------------------------------
// --- Country Config Usage Methods -----------

ActivityDataManager.getTransDataValue = function (transList, transDVProp) {
	var value;

	transList.forEach(trans => {
		var dvJson = trans.dataValues;

		if (dvJson && dvJson[transDVProp]) value = dvJson[transDVProp];
	});

	return value;
};

ActivityDataManager.getTransClientDetails = function (transList, transCDProp) {
	var value;

	transList.forEach(trans => {
		var cdJson = trans.clientDetails;

		if (cdJson && cdJson[transCDProp]) value = cdJson[transCDProp];
	});

	return value;
};

// Name changed.  Keep below for backward compatibility
ActivityDataManager.getLastTransDataValue = function (transList, transDVProp) {
	ActivityDataManager.getTransDataValue(transList, transDVProp);
};

ActivityDataManager.getAllTrans = function (activityList) {
	// activityList.flatMap( a => a.transactions ); // flat(), flatMap() has later browser compatibility..

	var allTrans = [];

	activityList.forEach(act => {
		act.transactions.forEach(tran => {
			allTrans.push(tran);
		});
	});

	return allTrans;
};

// typeList = [ 'v_rdx_hivTEST', 'v_rdx_selfTESTResult' ]  <-- later, create same search by dataValues?
ActivityDataManager.getActivityByTransType = function (activityList, typeList) {
	var activity;

	if (Util.isTypeString(typeList)) typeList = [typeList];
	else if (!Util.isTypeArray(typeList)) throw "ERROR, ActivityDataManager.getActivityByTransType typeList param should be array or string.";

	if (activityList) {
		activityList.forEach(act => {
			act.transactions.forEach(tran => {
				if (typeList.indexOf(tran.type) >= 0) activity = act;
			});
		});
	}

	return activity;
};

// matchCondiArr = [ { 'type': '', 'dataValues': {}, 'clientDetails': {}, etc.. } <-- all optional..
ActivityDataManager.getActivityByTrans = function (activityList, matchCondiArr) {
	var activity;

	if (activityList) {
		activityList.forEach(act => {
			// Look though each 'matchCondi'   If it matches any, set as 'activity'..
			act.transactions.forEach(tran => {
				if (ActivityDataManager.isTransMatch(tran, matchCondiArr)) activity = act;
			});
		});
	}

	return activity;
};


ActivityDataManager.hasActivityTransMatch = function (activity, matchCondiArr) {
	var isMatch = false;

	if ( activity.transactions )
	{
		for ( var i = 0; i < activity.transactions.length; i++ )
		{
			var trans = activity.transactions[i];
			if ( ActivityDataManager.isTransMatch(trans, matchCondiArr) ) {
				isMatch = true;
				break;
			}
		}	
	}

	return isMatch;
};

ActivityDataManager.getActivitiesByTrans = function (activityList, matchCondiArr) {
	var activities = [];

	if (activityList) {
		activityList.forEach(act => {
			var matchAct = ActivityDataManager.getActivityByTrans([act], matchCondiArr);
			if (matchAct) activities.push(act);
		});
	}

	return activities;
};


// [ { type: 'v_iss', clientDetails: { 'firstName': 'Polly' } } ]
// [ { dataValues: { 'interventionResult': '[*]' } }  ]  // any 'interventionResult' non-empty value would be accepted..
ActivityDataManager.isTransMatch = function (tran, matchCondiArr) {
	var isMatch = false;

	// 0. Look through all array of conditions.  If one of them pass, this 'tran' is a match.
	for (var i = 0; i < matchCondiArr.length; i++) {
		var matchCondi = matchCondiArr[i];
		var passAllCondition = true;

		// 1. Go through each property of the matching condition: { 'type': --, 'dataValues': --- }
		for (var propName in matchCondi) {
			// type, dataValues, clientDetails
			var matchProp = matchCondi[propName];
			var tranProp = tran[propName];

			// If tran does not have the prop, return false;
			if (!tranProp) {
				passAllCondition = false;
				break;
			}
			else {
				// If prop is string, like 'type', simply match for value.
				if (Util.isTypeString(matchProp)) {
					if (tranProp !== matchProp) {
						passAllCondition = false;
						break;
					}
				}
				// If prop is object, check for all subProperty of the object
				else if (Util.isTypeObject(matchProp)) {
					// All prop within the object need be met. EX. 'dataValues.---'
					for (var spName in matchProp) {
						var sMatchVal = matchProp[spName];
						var sTranProp = tranProp[spName];

						// '[*]' allows any non-empty value case
						if (sMatchVal === '[*]' && sTranProp) { }
						else if (sTranProp !== sMatchVal) {
							passAllCondition = false;
							break;
						}
					}
				}
			}
		}

		if (passAllCondition) {
			isMatch = true;
			break;
		}
	}

	return isMatch;
};


// matchCondiArr = [ { 'type': '', 'dataValues': {}, 'clientDetails': {}, etc.. } <-- all optional..
ActivityDataManager.getActivitiesSince = function (activityList, dateStr, datePropName, optionSameDateAllow) {
	var outActList = [];

	if (activityList && dateStr) {
		activityList.forEach(act => {
			try {
				var actDateStr = act.date[datePropName];

				if (optionSameDateAllow === true) {
					var sameDateStr = (actDateStr.substr(0, 10) === dateStr.substr(0, 10));

					if (sameDateStr) outActList.push(act);
					else if (actDateStr >= dateStr) outActList.push(act);
				}
				else {
					if (actDateStr > dateStr) outActList.push(act);
				}
			}
			catch (errMsg) { console.log('ERROR in ActivityDataManager.getActivitiesSince, ' + errMsg); }
		});
	}

	return outActList;
};

// -----------------------------
// 3 diff ways to get the latest/last activity.   
//      1. last array item
//      2. by createdDate
//      3. by updatedDate

ActivityDataManager.getLastActivity = function (activityList) {
	if (!activityList || activityList.length === 0) return undefined;
	else return activityList[activityList.length - 1];
};

ActivityDataManager.getLatestCreatedActivity = function (activityList) {
	return ActivityDataManager.getLatestDateActivity(activityList, 'createdLoc');
};

ActivityDataManager.getLatestUpdatedActivity = function (activityList) {
	return ActivityDataManager.getLatestDateActivity(activityList, 'updatedLoc');
};

ActivityDataManager.getLatestDateActivity = function (activityList, dateProp) {
	var latestActivity;
	if (!dateProp) dateProp = 'createdLoc';

	if (activityList && activityList.length) {
		var actList = Util.cloneJson(activityList);
		actList.sort(function (a, b) {
			return (a.date && b.date && a.date[dateProp] <= b.date[dateProp]) ? 1 : -1;
		});
		// Puts newest/latest/highest value (createdDate) on beginning of list
		// For date with no 'createdDate', it will be listed at the bottom/end of the list.

		latestActivity = actList[0];
	}

	return latestActivity;
};

// ===========================================
// === NEW: Change transaction type in activity

ActivityDataManager.replaceTransType = function (activity, from_transType, to_transType) {
	try {
		if (activity && activity.transactions) {
			activity.transactions.forEach(trans => {
				if (trans.type === from_transType) trans.type = to_transType;
			});
		}
	}
	catch (errMsg) {
		console.log('Error on ActivityDataManager.replaceTransType, ' + errMsg);
	}
};
