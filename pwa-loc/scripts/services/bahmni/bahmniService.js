function BahmniService() { }

BahmniService.BAHMNI_KEYWORD = "bahmni";
BahmniService.readyToMongoSync = "readyToMongoSync";

BahmniService.timerID_Interval;
BahmniService.startSyncStatus_Interval;
BahmniService.noCheckingConnection = 0;
BahmniService.maxNoCheckingConnection = 3;
BahmniService.interval_syncData = Util.MS_SEC * 2; // 5s
BahmniService.syncDataProcessing = false;

BahmniService.connStatus_OFFLINE = 'OFFLINE';
BahmniService.connStatus_ONLINE = 'ONLINE';

BahmniService.connStatus_Stable = BahmniService.connStatus_OFFLINE; // Online vs Offline


BahmniService.syncDataIconTag = $("#divAppDataSubResourceSyncStatus");
BahmniService.syncImgTag = $("#imgAppDataSubResourceSyncStatus");


BahmniService.formMetadata = {};
BahmniService.syncDownProcessingTotal = 0;
BahmniService.syncDownProcessingIdx = 0;
BahmniService.syncDownDataList = {};
BahmniService.syncDataStatus = { status: "success" };
BahmniService.allowToSyncDataInNextConnection = true;


BahmniService.syncUpProcessingTotal = 0;
BahmniService.syncUpProcessingIdx = 0;

BahmniService._bmPingCase = '1';
BahmniService.pingDebug = false;

// ==============================================================================
// Ping Bahmni service
// ==============================================================================

// Features - Methods Add:
//  - Add ping false in the middle.
//	 - 

// 
BahmniService.pingCaseSwitch = function ( caseStr ) 
{
	BahmniService._bmPingCase = caseStr;
};

BahmniService.getPingUrl = function () 
{
	if ( BahmniService._bmPingCase === "1" ) return INFO.bahmni_baseUrl + '/syncable';
	else if ( BahmniService._bmPingCase === "2" ) return BahmniRequestService.pingLANNetwork;
	else return INFO.bahmni_baseUrl + '/syncable';
};

BahmniService.pingService_Start = function () 
{
	BahmniService.syncDataIconTag.show();
	BahmniService.connection_StatusPending();

	clearInterval(BahmniService.timerID_Interval);
	BahmniRequestService.resetResponseData();

	// Setup the interval
	BahmniService.timerID_Interval = setInterval(() => 
	{		
		BahmniRequestService.ping( BahmniService.getPingUrl(), function (response) 
		{
			if ( BahmniService.pingDebug ) console.log( 'Ping response:', response, BahmniService.noCheckingConnection );

			// TODO: if bahmni config country, always show 2nd sync icon?

			if (response.status == "success") // NOTE: this is only for local test case response!!!!??
			{
				BahmniService.noCheckingConnection++;
				if (BahmniService.noCheckingConnection >= BahmniService.maxNoCheckingConnection) 
				{
					// Keep the count max limit
					BahmniService.noCheckingConnection = BahmniService.maxNoCheckingConnection;

					BahmniService.connection_StatusOnline();

					if( BahmniService.allowToSyncDataInNextConnection )
					{
						BahmniService.syncDataRun();
						BahmniService.allowToSyncDataInNextConnection = false;
					}
				}
			}
			else {
				BahmniService.connection_StatusOffline();
				BahmniService.noCheckingConnection = 0;
				BahmniService.allowToSyncDataInNextConnection = true;
			}
		});

	}, BahmniService.interval_syncData);

};

BahmniService.pingService_Stop = function () {
	clearInterval(BahmniService.timerID_Interval);
};

BahmniService.connection_StatusOnline = function () 
{
	BahmniService.connStatus_Stable = BahmniService.connStatus_ONLINE;
	if ( BahmniService.pingDebug ) console.log( 'BahmniService StatusOnline' );
	// 
	// $("#Nav1").css("background-color", "#ed8f2d"); // Orange
	BahmniService.setHeaderColor();
	BahmniService.syncImgTag.attr("src", "images/bahmni_connection_green.svg");
}

BahmniService.setHeaderColor = function()
{
	if( status == "default" || BahmniService.connStatus_Stable < BahmniService.connStatus_ONLINE )
	{
		// Change the header color to the default color
		$("#Nav1").css("background-color", ""); // Orange
		$(".sheet-title").css("background-color", ""); // Orange
	}
	else 
	{
		// Change the header color to orange
		$("#Nav1").css("background-color", "#ed8f2d"); // Orange
		$(".sheet-title").css("background-color", "#ed8f2d");
	}
	
}
BahmniService.connection_StatusOffline = function () 
{
	BahmniService.connStatus_Stable = BahmniService.connStatus_OFFLINE;
	if ( BahmniService.pingDebug ) console.log( 'BahmniService StatusOffline' );

	BahmniService.setHeaderColor();
	BahmniService.syncImgTag.attr("src", "images/bahmni_connection_gray1.svg");
}

BahmniService.connection_StatusPending = function () 
{
	BahmniService.syncImgTag.attr("src", "images/bahmni_connection_white.svg");
}

BahmniService.update_UI_Status_StartSync = function () 
{
	BahmniMsgManager.initializeProgressBar();
    BahmniService.startSyncStatus_Interval = setInterval(() => {
        if( BahmniService.syncImgTag.attr("setcolor") == "green" )
        {
            BahmniService.syncImgTag.attr("src", "images/bahmni_connection_blue.svg");
            BahmniService.syncImgTag.attr("setcolor", "blue");
        }
        else
        {
            BahmniService.syncImgTag.attr("src", "images/bahmni_connection_green.svg");
            BahmniService.syncImgTag.attr("setcolor", "green");
        }
    }, Util.MS_SEC/3);
	
}

BahmniService.update_UI_Status_FinishSyncAll = function () 
{
    clearInterval( BahmniService.startSyncStatus_Interval );
	BahmniMsgManager.hideProgressBar();
    BahmniService.syncDataIconTag.attr("src", "images/bahmni_connection_green.svg");
    BahmniService.syncDataIconTag.attr("setcolor", "green");

	if( BahmniService.syncDataStatus.status == Constants.status_failed )
	{
		MsgManager.msgAreaShowOpt( "Syncing data has some error. Click on the icon the see the details.", { hideTimeMs: 1000 } );
	}
}


BahmniService.setAppTopSyncAllBtnClick = function () {
	BahmniService.syncDataIconTag.off('click').click(() => {
		// if already running, just show message..
		// if offline, also, no message in this case about offline...   
		BahmniMsgManager.SyncMsg_ShowBottomMsg();

		// 2. SyncUp All
		if (BahmniService.noCheckingConnection >= BahmniService.maxNoCheckingConnection) {
			BahmniService.syncDataRun();
		}
	});
};

// ==============================================================================
// Ping Bahmni service
// ==============================================================================

BahmniService.syncDataRun = function () 
{

	if ( BahmniService.noCheckingConnection >= BahmniService.maxNoCheckingConnection
		&& !ScheduleManager.syncDownProcessing
		&& !BahmniService.syncDataProcessing ) 
	{
		BahmniService.syncDataProcessing = true;
		BahmniService.update_UI_Status_StartSync();
		BahmniMsgManager.SyncMsg_SetAsNew();
		BahmniMsgManager.SyncMsg_InsertMsg('Start Syncing to Bahmni server ...');

		try {
			// Sync Up activity to Bahmni server
			BahmniService.syncUpAll(function () 
			{
				// Sync Down activity to Bahmni server
				BahmniService.syncDown(function (responseBahmniData) 
				{
					var clientList = responseBahmniData.data;
					var clientDwnLength = clientList.length;

					// 'download' processing data                
					var processingInfo = ActivityDataManager.createProcessingInfo_Success(Constants.status_downloaded, 'Downloaded and synced.');

					BahmniMsgManager.SyncMsg_InsertMsg("Downloaded " + clientDwnLength + " clients");

					console.log("Downloaded " + clientDwnLength + " clients");
					ClientDataManager.setActivityDateLocal_clientList(clientList);

					// 10 min offset with sync time - to make sure it does not miss things.
					BahmniService.mergeDownloadedClients(clientList, processingInfo, function (changeOccurred_atMerge, mergedActivities) {

						if (responseBahmniData.status.status == "success") {
							var mergedActivityLength = mergedActivities.length;
							BahmniMsgManager.SyncMsg_InsertMsg("Merged " + mergedActivityLength + " activities..");
							BahmniMsgManager.SyncMsg_InsertSummaryMsg("Downloaded " + clientDwnLength + " clients, merged " + mergedActivityLength + " activities.");

							var syncDownReqStartDTStr = moment().subtract(10, 'minutes').toDate().toISOString();
							AppInfoManager.updateSyncLastDownloadInfo(syncDownReqStartDTStr);


							// NOTE: If there was a new merge, for now, alert the user to reload the list?
							if (changeOccurred_atMerge) {
								// Display the summary of 'syncDown'.  However, this could be a bit confusing

								var btnRefresh = $('<a class="notifBtn" term=""> REFRESH </a>');

								$(btnRefresh).click(() => {
									SessionManager.cwsRenderObj.renderArea1st();
								});

								MsgManager.notificationMessage('SyncDown data found', 'notifBlue', btnRefresh, '', 'right', 'top', 10000, false);
							}
						}
						else {
							BahmniMsgManager.SyncMsg_InsertSummaryMsg("Sync data failed.");
						}

						BahmniService.syncDataProcessing = false;
						BahmniService.update_UI_Status_FinishSyncAll();
					});
				});
			})
		}
		catch (errMsg) {

			BahmniMsgManager.SyncMsg_ShowBottomMsg();
			BahmniMsgManager.SyncMsg_InsertSummaryMsg("Sync data failed.");

			console.log('ERROR in BahmniService.syncDataRun, ' + errMsg);

			BahmniService.syncDataProcessing = false;
			BahmniService.update_UI_Status_FinishSyncAll();
		}
	}
}

BahmniService.isSyncDataProcessing = function () {
	return BahmniService.syncDataProcessing;
};


// ==============================================================================
// SyncDown
// ==============================================================================

BahmniService.syncDown = function (exeFunc) 
{
	BahmniService.syncDataStatus = { status: "success", msg: "" };
	BahmniService.syncDownDataList = {};

	const configSynDownList = ConfigManager.getSettingsBahmni().syncDownList;
	if (configSynDownList) 
	{
		BahmniService.syncDownProcessingTotal = configSynDownList.length;
		BahmniService.syncDownProcessingIdx = 0;

		for (var i = 0; i < configSynDownList.length; i++) 
		{
			var configSynDownData = JSON.parse(JSON.stringify(configSynDownList[i]));
			var url = eval(Util.getEvalStr(configSynDownData.urlEval));

			if (configSynDownData.method.toUpperCase() == "POST") 
			{
				Util.traverseEval(configSynDownData.payload, InfoDataManager.getINFO(), 0, 50);

				BahmniRequestService.sendPostRequest(configSynDownData.id, url, configSynDownData.payload, function (response) {
					BahmniService.afterSyncDown(response, exeFunc);
				})
			}
			else if (configSynDownData.method.toUpperCase() == "GET") 
			{
				BahmniRequestService.sendGetRequest(configSynDownData.id, url, function (response) {
					BahmniService.afterSyncDown(response, exeFunc);
				});
			}
		}
	}

};

BahmniService.setResponseErrorIfAny = function (response) 
{
	if (response.status == "error") 
	{
		BahmniService.syncDataStatus.status = Constants.status_failed;
		BahmniService.syncDataStatus.msg += response.msg + "; ";

		BahmniMsgManager.SyncMsg_InsertMsg("Error while running '" + response.id + "', URL '" + response.url + "'. Details: " + response.msg, BahmniMsgManager.MESSAGE_TYPE_ERROR);
	}
};

BahmniService.afterSyncDown = function (response, exeFunc) 
{
	BahmniService.syncDownProcessingIdx++;
	BahmniService.setResponseErrorIfAny(response);

	if (BahmniService.syncDownProcessingIdx == BahmniService.syncDownProcessingTotal) 
	{
		var conceptIds = [];
		var patientIds = [];
		var appointmentIds = [];
		var appointments = [];
		const configSynDownList = ConfigManager.getSettingsBahmni().syncDownList;
		for (var i = 0; i < configSynDownList.length; i++) 
		{
			const configData = configSynDownList[i];
			const responseData = eval(Util.getEvalStr(configData.responseEval));
			if (responseData) 
			{
				var data = responseData.data;
				if (data.conceptIds) 
				{
					conceptIds = conceptIds.concat(data.conceptIds);
					conceptIds = conceptIds.filter((item, pos) => conceptIds.indexOf(item) === pos); // Remove duplicated Ids
				}

				if (data.patientIds) 
				{
					patientIds = patientIds.concat(data.patientIds);
					patientIds = patientIds.filter((item, pos) => patientIds.indexOf(item) === pos); // Remove duplicated Ids
				}

				if (data.appointmentIds) 
				{
					appointmentIds = appointmentIds.concat(data.appointmentIds);
					appointmentIds = appointmentIds.filter((item, pos) => appointmentIds.indexOf(item) === pos); // Remove duplicated Ids
				}

				if (data.appointments) 
				{
					appointments = appointments.concat(data.appointments);
				}

			}
		}

		BahmniService.syncDownDataList = { conceptIds, patientIds, appointmentIds, appointments, patients: [], concepts: [] };

		BahmniService.syncDownProcessingIdx = 0;
		BahmniService.syncDownProcessingTotal = patientIds.length + appointmentIds.length + conceptIds.length;

		if( BahmniService.syncDownProcessingTotal == 0 )
		{
			exeFunc({ status: BahmniService.syncDataStatus, data: BahmniService.syncDownDataList.patients });
		}
		else
		{
			BahmniService.getConceptList(conceptIds, function () 
			{
				exeFunc({ status: BahmniService.syncDataStatus, data: BahmniService.syncDownDataList.patients });
			});
	
			BahmniService.getAppointmentDataList(appointmentIds, function () 
			{
				exeFunc({ status: BahmniService.syncDataStatus, data: BahmniService.syncDownDataList.patients });
			});
	
			BahmniService.getPatientDataList(patientIds, function () 
			{
				exeFunc({ status: BahmniService.syncDataStatus, data: BahmniService.syncDownDataList.patients });
			});
		}

	}
}

BahmniService.getAppointmentDataList = function (appointmentIds, exeFunc) 
{
	if (appointmentIds.length > 0) 
	{
		for (var i = 0; i < appointmentIds.length; i++) {
			BahmniService.retrieveAppointmentDetails(appointmentIds[i], function (response) {

				if (response.status == "success") 
				{
					const data = response.data;
					const patientId = data.patient.uuid;
					// Add patientId in patientId list so that we can retrieve the details later
					if (BahmniService.syncDownDataList.patientIds.indexOf(patientId) < 0) {
						BahmniService.syncDownDataList.patientIds.push(patientId);
					}

					// Create an activity for this Appointment
					var activity = BahmniUtil.generateActivityAppointment(data, { formData: { sch_favId: 'followUp', fav_newAct: true } })
					BahmniService.syncDownDataList.appointments.push(activity);
				}

				BahmniService.afterSyncDownAll(response, exeFunc);
			})
		}
	}
	else {
		exeFunc();
	}
};

BahmniService.getPatientDataList = function (patientIds, exeFunc) 
{
	if (patientIds.length > 0) 
	{
		for (var i = 0; i < patientIds.length; i++) {
			BahmniService.retrievePatientDetails(patientIds[i], function (response) {
				if (response.status == "success") 
				{
					BahmniService.syncDownDataList.patients.push(BahmniUtil.generateClientData(response.data.patient));
				}

				BahmniService.afterSyncDownAll(response, exeFunc);
			})
		}
	}
	else {
		exeFunc();
	}
};

BahmniService.getConceptList = function (conceptIdList, exeFunc) 
{
	if (conceptIdList.length > 0) 
	{
		for (var i = 0; i < conceptIdList.length; i++) 
		{
			var id = conceptIdList[i];
			BahmniService.retrieveConceptDetails(id, function (response) {
				if (response.status == "success") {
					BahmniService.syncDownDataList.concepts.push(response.data);
				}

				BahmniService.afterSyncDownAll(response, exeFunc);
			});
		}
	}
	else 
	{
		BahmniService.updateOptionsChanges();
		exeFunc();
	}

}

BahmniService.afterSyncDownAll = function (response, exeFunc) 
{
	BahmniService.syncDownProcessingIdx++;
	BahmniService.setResponseErrorIfAny(response);

	if (BahmniService.syncDownProcessingIdx == BahmniService.syncDownProcessingTotal) 
	{
		// -------------------------------------------------------------------------------------------------------------
		// Set conceps in AppInfo localStorage
		var concepts = BahmniService.syncDownDataList.concepts;
		for (var i = 0; i < concepts.length; i++) 
		{
			var concept = concepts[i];
			if (concept && concept.answers && concept.answers.length > 0) 
			{
				AppInfoLSManager.setSelectOptions_Item(concept.uuid, BahmniUtil.generateOptionsByConcept(concept));
			}
		}
		// Override the options of concepts in "definitionOptions" of the configuration file 
		BahmniService.updateOptionsChanges();

		// -------------------------------------------------------------------------------------------------------------
		// Add all activities for patients based on patienId
		const patientList = BahmniService.syncDownDataList.patients;
		for (var i = 0; i < patientList.length; i++) 
		{
			var item = patientList[i];
			var patientId = item.patientId;
			var activities = Util.findAllFromList(BahmniService.syncDownDataList.appointments, patientId, "patientId");
			if (activities != undefined) 
			{
				item.activities = activities;
			}
		}

		exeFunc();
	}
};

BahmniService.updateOptionsChanges = function () 
{
	const newOptionsChanged = AppInfoLSManager.getSelectOptions();
	let configOptions = ConfigManager.getConfigJson().definitionOptions;
	for (var optionName in newOptionsChanged) 
	{
		configOptions[optionName] = newOptionsChanged[optionName];
	}

	AppInfoLSManager.setBahmni_lastSyncedDatetime(UtilDate.getDateTimeStr());
}

// ------------------------------------------------------------------------------
// Retrieve data from Bahmni server

BahmniService.retrievePatientDetails = function (patientId, exeFunc) 
{
	const url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/patientprofile/" + patientId + "?v=full";
	BahmniRequestService.sendGetRequest(patientId, url, exeFunc);
};

BahmniService.retrieveAppointmentDetails = function (appointmentId, exeFunc) 
{
	const url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/appointment?uuid=" + appointmentId;
	BahmniRequestService.sendGetRequest(appointmentId, url, exeFunc);
};

BahmniService.retrieveConceptDetails = function (conceptId, exeFunc)
{
	var url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/concept/" + conceptId;
	BahmniRequestService.sendGetRequest(conceptId, url, exeFunc);
};


// ==============================================================================
// SyncUp 
// ==============================================================================


BahmniService.syncUpAll = function (exeFunc) 
{
	var resultData = { 'success': 0, 'failure': 0 };

	var activityList = ActivityDataManager.getActivityList();
	var actIdList = [];

	activityList.forEach( activityJson => 
	{
		// Bahmni Syncable condition - on activity..
		if ( activityJson.subSourceType === BahmniService.BAHMNI_KEYWORD && activityJson.processing 
			&& SyncManagerNew.isSyncReadyStatus(activityJson.processing.status) ) 
		{
			actIdList.push( activityJson.id );
		}
	});

	var actCount = actIdList.length;

	if ( actCount <= 0 ) exeFunc( resultData );
	else
	{
		for( var i = 0; i < actIdList.length; i++ )
		{
			var activityId = actIdList[i];
	
			var clientId_before = ClientDataManager.getClientByActivityId(activityId)._id;
	
			ActivityCard.highlightActivityDiv(activityId, true);
	
			SyncManagerNew.performSyncUp_Activity(activityId, function (success, responseJson, newStatus, extraData) 
			{
				actCount--;
	
				try
				{
					SyncManagerNew.syncUpActivity_ResultUpdate(success, resultData);
	
					ActivityCard.reRenderAllById(activityId); // ActivityCard.reRenderActivityDiv();
					ActivityCard.highlightActivityDiv(activityId, false);
			
			
					var clientId_after = ClientDataManager.getClientByActivityId(activityId)._id;
					if ( clientId_before.indexOf( ClientDataManager.tempClientNamePre ) === 0 && clientId_before !== clientId_after )
					{
						SyncManagerNew.TempClientDetailTagRefresh( clientId_before, clientId_after );
						SyncManagerNew.tagSwitchToNewClientId( clientId_before, clientId_after );
					}
			
					SyncManagerNew.ActivityDetailTagRefresh( activityId );
					ClientCard.reRenderClientCardsById(clientId_after, { 'activitiesTabClick': true });	
				}
				catch( errMsg ) {  console.log( 'ERROR ' );  }
	
				if ( actCount <= 0 ) exeFunc( resultData );
			});		
		}
	}

};


// Called from SyncManagerNew.performSyncUp_Activity
BahmniService.syncUp = function (activityJson, exeFunc) 
{
	// elseCase: "Follow Up Referrals Template Form" OR "Follow Up Assessment Plan"
	var endpoint = (activityJson.type == "Follow Up Appointment") ? "/openmrs/ws/rest/v1/appointment" : "/openmrs/ws/rest/v1/bahmnicore/bahmniencounter";
	const url = INFO.bahmni_domain + endpoint;

	BahmniRequestService.sendPostRequest(activityJson.id, url, activityJson.syncUp, function(response)
	{		
		BahmniService.setResponseErrorIfAny(response);

		// response need to have this format...
		// if ( !responseJson.result || !responseJson.result.client ) throw "'result' not exists in response json.";


		//var clientJson = ClientDataManager.getClientByActivityId(activityJson.id );

		/*
		if( response.status == "success")
		{
			//activityJson.subSyncStatus = BahmniService.readyToMongoSync;
			var processingInfo = ActivityDataManager.createProcessingInfo_Success(Constants.status_submit, 'SyncedUp processed.', activityJson.processing);
			ActivityDataManager.insertToProcessing(activityJson, processingInfo);
			//activityJson.processing.subSyncStatus = BahmniService.readyToMongoSync;

			ActivityDataManager.updateActivityIdx(activityJson.id, activityJson, clientJson);
		}
		else
		{
			// Need to check if there is any activity of clients  were sync fail  --> change status of the client to "FAIL"
			ActivityDataManager.updateStatus_ProcessingToFailed(activityJson, { saveData: true, errMsg: response.msg });
		}
		*/

		exeFunc( ( response.status === "success" ), response );
	});
}


// ==============================================================================
// BahmniService.mergeDownloadedClients 
// ==============================================================================

BahmniService.mergeDownloadedClients = function (clientList, processingInfo, callBack) {
	var dataChangeOccurred = false;
	var newClients = [];
	var mergedActivities = [];

	// 1. Compare Client List.  If matching '_id' exists, perform merge,  Otherwise, add straight to clientList.
	if (clientList && Util.isTypeArray(clientList)) 
	{
		for (var i = 0; i < clientList.length; i++) 
		{
			var bmClient = clientList[i];
			try 
			{
				var appClient = ( bmClient.patientId ) ? Util.findFromList(ClientDataManager.getClientList(), bmClient.patientId, "patientId") : undefined;

				// If matching client exists in App already.
				if (appClient) 
				{
					var clientDateCheckPass = (ClientDataManager.getDateStr_LastUpdated(bmClient) > ClientDataManager.getDateStr_LastUpdated(appClient));
					if (clientDateCheckPass) 
					{
						// Get activities in bmClient that does not exists...
						var addedActivities = ActivityDataManager.mergeDownloadedActivities(bmClient.activities, appClient.activities, appClient, Util.cloneJson(processingInfo), {});

						// Update clientDetail from bmClient - other than activities merge?
						//appClient.clientDetails = bmClient.clientDetails; .date, .clientConsent, .relationships...
						Util.copyProperties(bmClient, appClient, { 'exceptions': { 'activities': true, '_id': true } });

						Util.appendArray(mergedActivities, addedActivities);
						dataChangeOccurred = true;
					}
				}
				else 
				{
					newClients.push(bmClient);
					dataChangeOccurred = true;

					if (bmClient.activities && bmClient.activities.length > 0) {
						Util.appendArray(mergedActivities, bmClient.activities);
					}
				}
			}
			catch (errMsg) {
				console.log('Error during BahmniService.mergeDownloadedClients, errMsg: ' + errMsg);
			}
		}
	}


	if (dataChangeOccurred) {
		// if new list to push to pwaClients exists, add to the list.
		if (newClients.length > 0) {
			if (processingInfo) ClientDataManager.clientsActivities_AddProcessingInfo(newClients, processingInfo);

			// NOTE: new client insert -> new activity insert -> during this, we check if other client (temp client case) has same activityId.
			//   and remove the client (temp) & activity (before sync) in it.
			ClientDataManager.insertClients(newClients);
		}

		// Need to create ClientDataManager..
		ClientDataManager.saveCurrent_ClientsStore(() => {
			if (callBack) callBack(true, mergedActivities);
		});
	}
	else {
		if (callBack) callBack(false, mergedActivities);
	}
};
