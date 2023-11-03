// ---------------------------------
function BahmniUtil() {}; // Temp Relay Method <-- Remove soon
BahmniUtil.getFormMetadata = function (formName, formVersion, keyword, propertyName) {
	return BahmniService.getFormMetadata(formName, formVersion, keyword, propertyName);
};
BahmniUtil.generateActivityFormData = function (formData, type, formNameId) {
	return BahmniService.generateActivityFormData(formData, type, formNameId);
};


function BahmniService() { };

// ---------------------------------

BahmniService.BAHMNI_KEYWORD = "bahmni";
BahmniService.readyToMongoSync = "readyToMongoSync";
BahmniService.OPENMRS_URL = "/openmrs/";
BahmniService.FORM_NAME_DEFAULT = "default";
BahmniService.FORM_NAME_NO_SUPPORTED = "noSupported";

BahmniService.ACTIVITY_TYPE_APPOINTMENT = "Appointment";
BahmniService.ACTIVITY_TYPE_FU_APPOINTMENT =  "Follow Up Appointment";
BahmniService.ACTIVITY_TYPE_REFERRALS_TEMPLATE = "Referrals Template";
BahmniService.ACTIVITY_TYPE_FU_REFERRALS_TEMPLATE = "Follow Up Referrals Template Form";
BahmniService.ACTIVITY_TYPE_ASSESSMENT_AND_PLAN = "Assessment and Plan";
BahmniService.ACTIVITY_TYPE_FU_ASSESSMENT_AND_PLAN = "Follow Up Assessment and Plan";

BahmniService.interval_syncData = Util.MS_SEC * 2;
BahmniService.syncDataProcessing = false;

BahmniService.syncDownProcessingIdx = 0;
BahmniService.syncDownProcessingTotal = 0;
BahmniService.syncDownConceptProcessingIdx = 0;
BahmniService.syncDownConceptTotal = 0;
BahmniService.syncDownPatientDataProcessingIdx = 0;
BahmniService.syncDownPatientDataTotal = 0;
BahmniService.syncDownAppointmentProcessing = 0;
BahmniService.syncDownAppointmentTotal = 0;
BahmniService.syncDownFormMetaDataProcessingIdx = 0;
BahmniService.syncDownFormMetaDataTotal = 0;
BahmniService.syncDownDataList = {};

BahmniService.syncDataStatus = { status: "success" };

BahmniService.syncUpProcessingTotal = 0;
BahmniService.syncUpProcessingIdx = 0;

// -----------------------

BahmniService.KEY_FD_META_DATA = "metadata";

BahmniService.KEY_RT_FIELD_REPORT = "fieldReport";
BahmniService.KEY_RT_CLIENT_REPORT_OUTCOME = "clientReportOutcome";
BahmniService.KEY_RT_DATE_REPORT_BY_CLIENT = "dateReportedByClient";
BahmniService.KEY_RT_NEW_DATE = "newDate";

BahmniService.KEY_AP_FIELD_REPORT = "fieldReport";
BahmniService.KEY_AP_PILL_COUNT_CONT = "pillCountCont";
BahmniService.KEY_AP_SUPPLY_DELEVERIED_TO_CLIENT = "supplyDeleveriedToClient";
BahmniService.KEY_AP_FORM_RESCHEDULE_IN_CONC = "formRescheduleInConc";
BahmniService.KEY_AP_REASON_FORM_MISSED_DELEVERY = "reasonForMissedDelivery";

// ==============================================================================

BahmniService.syncDataIconTag = $("#divAppDataSyncStatus2");

BahmniService.ping_intervalId;

BahmniService.VAL_DISCONNECTED = 'disconnected';
BahmniService.VAL_CONNECTED = 'connected';
BahmniService.VAL_CONNECT = 'connect';
BahmniService.VAL_DISCONNECT = 'disconnect';

BahmniService.VAL_CONNECT_COLOR = 'green';
BahmniService.VAL_DISCONNECT_COLOR = 'gray';
BahmniService.VAL_FAILED_COLOR = 'red';

// 'stableConn' - If consequetive 'connected/disconnected' ping results (in activePing result), we like to set the mode as 'stable' connected/disconnected.
// 'activeConnCount' - During 'activePing' mode, if the connection matched the goal active Ping - If # of consequtive match found, we like to set 'stable'
// 'activeCount' - How many loop/pings it stayed in the 'active'. - if too many times, we like to get out of active, and move to slow ping mode.
BahmniService.connStatusData = { stableConn: BahmniService.VAL_DISCONNECTED, activeConnCount: 0, pingFor: BahmniService.VAL_CONNECT, activeCount: 0 };

BahmniService.debug_forceDisconnect = false;

// ==============================================================================

BahmniService.serviceStartUp = function () 
{
	BahmniRequestService.resetResponseData();

	// Color override from config setting
	if (INFO.bahmni_iconColor) BahmniService.VAL_CONNECT_COLOR = INFO.bahmni_iconColor;
	if (INFO.bahmni_iconColor_disconnect) BahmniService.VAL_DISCONNECT_COLOR = INFO.bahmni_iconColor_disconnect;
	if (INFO.bahmni_iconColor_blink_fail) BahmniService.VAL_FAILED_COLOR = INFO.bahmni_iconColor_blink_fail;


	BahmniService.resetConnStatus(); // Get from InfoVal
	BahmniService.setIconUI_byStatus();
	BahmniService.syncDataIconTag.show();

	// Setup Click Event - Offline Ping Start & Sync Operation..
	if (INFO.bahmni_ping_autoRun) BahmniService.pingSlowly({ firstPingNow: true });

	BahmniService.syncBtnClickSetup();
};


BahmniService.serviceStop = function () 
{
	BahmniService.syncDataIconTag.hide();

	BahmniService.resetConnStatus();

	if ( BahmniService.ping_intervalId ) clearInterval( BahmniService.ping_intervalId );
};


BahmniService.resetConnStatus = function () {
	BahmniService.connStatusData = { stableConn: BahmniService.VAL_DISCONNECTED, activeConnCount: 0, pingFor: BahmniService.VAL_CONNECT };
};

BahmniService.setIconUI_byStatus = function () {
	if (BahmniService.connStatusData.stableConn === BahmniService.VAL_DISCONNECTED) {
		$('#divAppDataSyncStatus2').css('opacity', '0.6');
		$('.syncBtn2_svg .Nav__sync-d').attr('fill', BahmniService.VAL_DISCONNECT_COLOR);

		BahmniService.syncIconTitleUpdate('Bahmni DISCONNECTED - Click to trigger Connect');
	}
	else {
		$('#divAppDataSyncStatus2').css('opacity', '1.0');
		$('.syncBtn2_svg .Nav__sync-d').attr('fill', BahmniService.VAL_CONNECT_COLOR);
		BahmniService.syncIconTitleUpdate('Bahmni CONNECTED - Click to Sync');
	}
};


BahmniService.syncBtnClickSetup = function () {
	BahmniService.syncDataIconTag.off('click').click(() => {
		if (BahmniService.connStatusData.stableConn === BahmniService.VAL_DISCONNECTED) BahmniService.pingActively({ firstPingNow: true });
		else BahmniService.syncDataRun();  //BahmniService.startSyncAll();  // 'STATUS CONNECTED
	});
};


BahmniService.check_Mark_PingForMatch = function (success, option) {
	var match = false;
	var pingFor = BahmniService.connStatusData.pingFor;

	match = ((success && pingFor === BahmniService.VAL_CONNECT)
		|| (!success && pingFor === BahmniService.VAL_DISCONNECT)) ? true : false;

	if (match) BahmniService.connStatusData.activeConnCount++;
	else BahmniService.connStatusData.activeConnCount = 0;

	BahmniService.pingBlinkUI(success, option);

	return match;
};


BahmniService.swichStableConn = function (success) {
	BahmniService.connStatusData.stableConn = (success) ? BahmniService.VAL_CONNECTED : BahmniService.VAL_DISCONNECTED;
	BahmniService.connStatusData.pingFor = (success) ? BahmniService.VAL_DISCONNECT : BahmniService.VAL_CONNECT;
	BahmniService.connStatusData.activeConnCount = 0;
	BahmniService.connStatusData.activeCount = 0;

	if (success) MsgManager.msgAreaShowOpt('Bahmni CONNECTED', { hideTimeMs: 1000, styles: 'background-color: orange;' });
	else MsgManager.msgAreaShowOpt('Bahmni DISCONNECTED', { hideTimeMs: 1000, styles: 'background-color: silver;' });

	// If switched to stable connected, run syncDataRun
	if (success) BahmniService.syncDataRun();
};


BahmniService.pingRequest = function (callBack) {
	BahmniRequestService.ping(BahmniConnManager.getPingUrl(INFO.bahmni_domain), function (response) {
		if (BahmniService.debug_forceDisconnect) callBack(false); // NEW - debug/testing val
		else if (response.status === "success") callBack(true); // connected
		else callBack(false);
	});
};

BahmniService.pingBlinkUI = function (success, option) {
	if (!option) option = {};

	// UI Ping Mark
	// Mark according to 'success' and return back to stable color..	
	if (success) {
		$('.syncBtn2_svg .Nav__sync-d').attr('fill', BahmniService.VAL_CONNECT_COLOR);
		$('#divAppDataSyncStatus2').css('opacity', '1.0');

		setTimeout(BahmniService.setIconUI_byStatus, INFO.bahmni_ping_blinkMS);
	}
	else {
		var failPingColor = (option.activePing) ? BahmniService.VAL_FAILED_COLOR : BahmniService.VAL_DISCONNECT_COLOR;

		$('.syncBtn2_svg .Nav__sync-d').attr('fill', failPingColor);
		$('#divAppDataSyncStatus2').css('opacity', '0.6');

		setTimeout(BahmniService.setIconUI_byStatus, INFO.bahmni_ping_blinkMS);
	}
};


BahmniService.pingSlowly = function (option) {
	if (!option) option = {};

	// Current Ping interval remove
	if (BahmniService.ping_intervalId) clearInterval(BahmniService.ping_intervalId);
	BahmniService.connStatusData.activeConnCount = 0;
	BahmniService.connStatusData.activeCount = 0;

	if (option.firstPingNow) {
		// RUN Once Before Interval:
		BahmniService.pingRequest(function (success) {
			if (BahmniService.check_Mark_PingForMatch(success)) BahmniService.pingActively();
		});
	}


	// Setup Slow Mode Ping -->
	BahmniService.ping_intervalId = setInterval(() => {
		// If we find what we are slowly ping for, switch to be Active Ping State..
		BahmniService.pingRequest(function (success) {
			if (BahmniService.check_Mark_PingForMatch(success)) BahmniService.pingActively();
		});
	}, INFO.bahmni_ping_slow_intervalSec * 1000);
};


BahmniService.pingActively = function (option) {
	if (!option) option = {};
	option.activePing = true;

	if (BahmniService.ping_intervalId) clearInterval(BahmniService.ping_intervalId);

	if (option.firstPingNow) {
		BahmniService.connStatusData.activeCount = 0;
		BahmniService.activePingHandle(option);
	}
	else {
		BahmniService.connStatusData.activeCount = 1;
	}

	// After number of tries, it turns back to slow mode..
	BahmniService.ping_intervalId = setInterval(() => {
		BahmniService.connStatusData.activeCount++;

		BahmniService.activePingHandle(option);

	}, INFO.bahmni_ping_active_intervalSec * 1000);
};

BahmniService.activePingHandle = function (option) {
	// Try ping actively for online/offline
	BahmniService.pingRequest(function (success) {
		if (BahmniService.check_Mark_PingForMatch(success, option)) {
			if (BahmniService.connStatusData.activeConnCount >= INFO.bahmni_ping_active_stableNum) {
				// Switch the 'stableConn' + pingFor, and change to pingSlowly..
				BahmniService.swichStableConn(success);
				BahmniService.setIconUI_byStatus();

				BahmniService.pingSlowly();
			}
		}
		else {
			// If Active Ping Try reaches limit (too many), switch back to slow ping..
			if (BahmniService.connStatusData.activeCount >= INFO.bahmni_ping_active_stop) {
				BahmniService.connStatusData.activeConnCount = 0;
				BahmniService.connStatusData.activeCount = 0;
				BahmniService.pingSlowly();
			}
		}
	});
};


// -----------------

BahmniService.checkBahmniUrl = function (url) {
	return (url === BahmniService.BAHMNI_KEYWORD || url.indexOf(BahmniService.OPENMRS_URL) >= 0);
};

BahmniService.syncIconTitleUpdate = function (titleStr) {
	if (!titleStr) titleStr = 'Bahmni SyncAll';
	$('#divAppDataSyncStatus2').attr('title', titleStr);
};


BahmniService.isBahmniActivity = function (activityJson) {
	return (activityJson && activityJson.subSourceType === BahmniService.BAHMNI_KEYWORD) ? true : false;
};

BahmniService.isBahmniConfig = function () {
	return ( ConfigManager.getConfigJson().subSourceType === BahmniService.BAHMNI_KEYWORD ) ? true : false;
};

// ==============================================================================
// SyncUp / SyncDown - SyncAll
// ==============================================================================

BahmniService.syncDataRun = function ( option ) 
{
	if ( !option ) option = {};

	if ( BahmniService.syncDataProcessing ) {
		if ( !option.doNotOpenSummary ) MsgManager.msgAreaShowErrOpt( 'Bahmni Sync Already In Progress!!' );
	}
	else
	{
		BahmniService.syncDataProcessing = true;
		FormUtil.rotateTag($('.syncBtn2_svg'), true);

		if ( !option.doNotOpenSummary ) BahmniMsgManager.SyncMsg_ShowBottomMsg();

		BahmniMsgManager.SyncMsg_SetAsNew();
		BahmniMsgManager.SyncMsg_InsertMsg('Bahmni Server: ' + INFO.bahmni_domain);
	
		try 
		{
			// Sync Up activity to Bahmni server
			BahmniMsgManager.SyncMsg_InsertMsg("Bahmni SyncUp Started...");

			BahmniService.syncUpAll( function () 
			{
				BahmniMsgManager.SyncMsg_InsertMsg("Bahmni SyncUp Finished.");

				// Sync Down activity to Bahmni server
				BahmniMsgManager.SyncMsg_InsertMsg("Bahmni SyncDown Started, Searching for 3 types new data...");
				BahmniService.syncDown( function (responseBahmniData) 
				{
					var clientList = responseBahmniData.data;
					var clientDwnLength = clientList.length;

					// TODO: NEW: Eval on downloaded Clients
					BahmniService.syncDownStepsEval( "syncDownStepsEval_OnDownClients", { downClientList: clientList } );


					BahmniMsgManager.SyncMsg_InsertMsg("Bahmni SyncDown Finished.  Merging " + clientDwnLength + " Patients..." );
	
					// Download Down, Stop the SyncIconRotation
					BahmniService.syncDataProcessing = false;
					BahmniConnManager.update_UI_Status_FinishSyncAll();
					FormUtil.rotateTag( $( '.syncBtn2_svg' ), false );
	
					// DEBUG - CONSOLE LOG Patients + Activities HERE!!
					if ( INFO.bahmniDebug || WsCallManager.stageName === "dev" ) console.log( 'Downloaded Clients: ', clientList );


					var processingInfo = ActivityDataManager.createProcessingInfo_Success(Constants.status_downloaded, 'Downloaded and synced.');
	
					BahmniService.mergeDownloadedClients( clientList, processingInfo, { type: 'syncDown_Bahmni' }, function (changeOccurred_atMerge, mergedActivities) 
					{
						if (responseBahmniData.status.status == "success") 
						{
							var mergedActivityLength = mergedActivities.length;
							BahmniMsgManager.SyncMsg_InsertMsg( "Merge FINSIHED: " + mergedActivityLength + " activities, " + clientDwnLength + " patients." );
							BahmniMsgManager.SyncMsg_InsertSummaryMsg("Downloaded " + clientDwnLength + " patients, merged " + mergedActivityLength + " activities.");
	
	
							// TODO: NEW: Call 'downloadStepsEval_OnFinal_ClientMerge' here?
							BahmniService.syncDownStepsEval( "syncDownStepsEval_OnFinal_ClientMerge" );


							// NOTE: If there was a new merge, for now, alert the user to reload the list?
							if (changeOccurred_atMerge && !option.doNotOpenSummary ) 
							{
								var btnRefresh = $('<a style="color: blue !important; cursor: pointer;" term="">REFRESH </a>').click(() => { SessionManager.cwsRenderObj.renderArea1st(); });
								MsgManager.msgAreaShowOpt( 'Bahmni SyncDown data found', { hideTimeMs: 10000, styles: 'background-color: orange;', actionButton: btnRefresh } );
							}
						}
						else BahmniMsgManager.SyncMsg_InsertSummaryMsg("Sync Data Failed.");
	
					});
				});
			})
		}
		catch (errMsg) 
		{	
			BahmniService.syncDataProcessing = false;
			BahmniConnManager.update_UI_Status_FinishSyncAll();
			FormUtil.rotateTag( $( '.syncBtn2_svg' ), false );

			if ( !option.doNotOpenSummary ) BahmniMsgManager.SyncMsg_ShowBottomMsg();
			BahmniMsgManager.SyncMsg_InsertSummaryMsg( "ERROR during SyncDataRun, Try Catch Occurred!" );
	
			console.log('ERROR in BahmniService.syncDataRun, ' + errMsg);	
		}		
	}
};


BahmniService.isSyncDataProcessing = function () { return BahmniService.syncDataProcessing; };

// ==============================================================================
// SyncDown
// ==============================================================================

BahmniService.syncDown = function (exeFunc) 
{
	BahmniService.syncDataStatus = { status: "success", msg: "" };
	BahmniService.syncDownDataList = {};

	const configSynDownList = ConfigManager.getSettingsBahmni().syncDownList;

	// NEW:
	BahmniService.syncDownStepsEval( "syncDownStepsEval_OnBegin" );

	
	if (configSynDownList) 
	{
		BahmniService.syncDownProcessingTotal = configSynDownList.length;
		BahmniService.syncDownProcessingIdx = 0;

		// NOTE #1. Runs Multiple Async Calls and 'afterSyncDown' detects the last response to run follow up process
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


BahmniService.afterSyncDown = function (response, exeFunc) 
{
	BahmniService.syncDownProcessingIdx++;
	BahmniService.setResponseErrorIfAny(response);

	// NOTE: Run only if this is last 'syncDown' perform task index.
	if ( BahmniService.syncDownProcessingIdx >= BahmniService.syncDownProcessingTotal ) 
	{
		var conceptIds = [];
		var patientIds = [];
		var appointmentIds = [];
		var formData = [];
		var formVersionData = {};
		const configSynDownList = ConfigManager.getSettingsBahmni().syncDownList;

		for (var i = 0; i < configSynDownList.length; i++) 
		{
			const configData = configSynDownList[i];
			const responseData = eval(Util.getEvalStr(configData.responseEval));

			if (responseData && responseData.data ) 
			{
				var data = responseData.data;
			
				if ( data.conceptIds ) conceptIds = Util.makeUniqueList( conceptIds.concat(data.conceptIds) );
				if ( data.patientIds ) patientIds = Util.makeUniqueList( patientIds.concat(data.patientIds) );
				if ( data.appointmentIds ) appointmentIds = Util.makeUniqueList( appointmentIds.concat(data.appointmentIds) );
				
				if ( data.formName ) formVersionData[data.formName] = data.formVersions;

				if ( data.formData ) formData = formData.concat( data.formData );
				
			}
		}

		BahmniService.syncDownDataList = { conceptIds, patientIds, appointmentIds, formData, appointments: [], patients: [], concepts: [], formVersionData };

		if( BahmniService.syncDownProcessingTotal == 0 )
		{
			exeFunc({ status: BahmniService.syncDataStatus, data: BahmniService.syncDownDataList.patients });
		}
		else
		{
			
			BahmniMsgManager.SyncMsg_InsertMsg( "Retrieving Form meta data .." );
			BahmniService.getFormMetadataList(BahmniService.syncDownDataList.formVersionData, function(){

				BahmniMsgManager.SyncMsg_InsertMsg( "Retrieving Concepts: " + conceptIds.length + " items.." );
				BahmniService.getConceptList( conceptIds, function () 
				{
					BahmniMsgManager.SyncMsg_InsertMsg( "Retrieving Appointments: " + appointmentIds.length + " items.." );
					BahmniService.getAppointmentDataList( appointmentIds, function () 
					{
						BahmniMsgManager.SyncMsg_InsertMsg( "Retrieving Patients: " + BahmniService.syncDownDataList.patientIds.length + " items.." );
						BahmniService.getPatientDataList( BahmniService.syncDownDataList.patientIds, function () 
						{
							// TODO : BahmniService.getFormMetadataList
							BahmniMsgManager.SyncMsg_InsertMsg( "After SyncDownAll Processing.." );
							BahmniService.afterSyncDownAll( function()
							{
								exeFunc({ status: BahmniService.syncDataStatus, data: BahmniService.syncDownDataList.patients });
							});
						});
					});
				})
			});
		}

	}
};


BahmniService.getAppointmentDataList = function (appointmentIds, exeFunc) 
{
	if (appointmentIds.length > 0) 
	{
		BahmniService.syncDownAppointmentProcessing = 0;
		BahmniService.syncDownAppointmentTotal = appointmentIds.length;

		for (var i = 0; i < appointmentIds.length; i++) {
			BahmniService.retrieveAppointmentDetails(appointmentIds[i], function (response) {

				BahmniService.syncDownAppointmentProcessing++;
				BahmniService.setResponseErrorIfAny(response);

				if (response.status == "success") 
				{
					const data = response.data;
					const patientId = data.patient.uuid;
				
					// Add patientId in patientId list so that we can retrieve the details later
					if (BahmniService.syncDownDataList.patientIds.indexOf(patientId) < 0) {
						BahmniService.syncDownDataList.patientIds.push(patientId);
					}

					// Create an activity for this Appointment
					var activity = BahmniService.generateActivityAppointment(data, { formData: { sch_favId: 'followUp', fav_newAct: true } })
					BahmniService.syncDownDataList.appointments.push(activity);

					BahmniService.syncDownStepsEval( "syncDownStepsEval_OnSyncDownAppointment", { patientId: patientId, appointmentActivity: activity } );
				}

				if( BahmniService.syncDownAppointmentProcessing >= BahmniService.syncDownAppointmentTotal )
				{
					exeFunc();
				}
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
		BahmniService.syncDownPatientDataProcessingIdx = 0;
		BahmniService.syncDownPatientDataTotal = patientIds.length;

		for (var i = 0; i < patientIds.length; i++) 
		{
			BahmniService.retrievePatientDetails(patientIds[i], function (response) 
			{
				BahmniService.syncDownPatientDataProcessingIdx++;
				BahmniService.setResponseErrorIfAny(response);

				if (response.status == "success") BahmniService.syncDownDataList.patients.push(BahmniService.generateClientData(response.data.patient));

				if( BahmniService.syncDownPatientDataProcessingIdx >= BahmniService.syncDownPatientDataTotal ) exeFunc();
			})
		}
	}
	else {
		exeFunc();
	}
};

/***
 * @params formVersionData { "Referrals Template", [<version>, <version>, ... ], "Assessment and Plan": [<version>, <version>, ... ] }
 */
BahmniService.getFormMetadataList = function (formVersionData, execFunc) 
{
	// Get total of the versions we have ( from "Referrals Template" and "Assessment and Plan")
	BahmniService.syncDownFormMetaDataProcessingIdx = 0;
	BahmniService.syncDownFormMetaDataTotal = 0;
	for (var formName in formVersionData) 
	{
		BahmniService.syncDownFormMetaDataTotal += formVersionData[formName].length;
	}


	if( BahmniService.syncDownFormMetaDataTotal > 0 )
	{
		for (var formName in formVersionData) 
		{
			var formVersions = formVersionData[formName];
			for (var i = 0; i < formVersions.length; i++) 
			{
				var formVersion = formVersions[i];
				// Get the configuration of a form by formName and formVersion in Config file and in the LocalStorage
				var found = BahmniService.getFormMetadataByVersion(formName, formVersion);
				if( Object.keys(found).length == 0 ) // If the config doesn't exist
				{
					// Because the config doesn't exist, download this form metadata from Bahmni server
					BahmniService.retrieveFormMetadata( formName, formVersion, function(response) {
						if( response.status == "success" )
						{	
							var responseData = response.data;
							var resFormName = responseData.name;
							var resFormVersion = response.urlInfo.searchParams.get("formVersion");

							// Get DEFAULT meta data of the form "formName"
							var defaultFormDataConfig = BahmniService.getFormMetadataByVersion(resFormName, BahmniService.FORM_NAME_DEFAULT );

							// Check if meta data of "default" form is match with the meta data from Banhmi server.
							// Also create form meta data by using responData with structure {"fileReport": "uuid", "xxxxx", "name": "yyyyy", "id": "zzzzz"}, ... }
							var foundConfigFormData = BahmniService.checkAndCreateFormMedataByServerData(responseData, defaultFormDataConfig );
							if( foundConfigFormData.matched )
							{
								var formData = foundConfigFormData.metadata;
								// If the responData is match with default meta data, create "metadata" info and add into the result ( formData )
								formData.metadata = {"uuid": responseData.uuid, isLocalStorage: true};
								// Save new form meta data in localStorage ( AppInfoLSManager )
								AppInfoLSManager.setBahmniFormMetaData_ByVersion( resFormName, resFormVersion, formData );
							}
							else
							{
								AppInfoLSManager.setBahmniUnsupportedFormMetaData_ByVersion( resFormName, resFormVersion, foundConfigFormData.metadata );
							}
						}
						
						BahmniService.syncDownFormMetaDataProcessingIdx ++;
						if( BahmniService.syncDownFormMetaDataProcessingIdx >= BahmniService.syncDownFormMetaDataTotal ) execFunc();
					});
				}
				else
				{
					BahmniService.syncDownFormMetaDataProcessingIdx ++;
					if( BahmniService.syncDownFormMetaDataProcessingIdx >= BahmniService.syncDownFormMetaDataTotal ) execFunc();
				}
				
			}
		}
	}
	else
	{
		execFunc();
	}
	
};


BahmniService.getConceptList = function (conceptIdList, exeFunc) 
{
	if (conceptIdList.length > 0) 
	{
		BahmniService.syncDownConceptProcessingIdx = 0;
		BahmniService.syncDownConceptTotal = conceptIdList.length;

		for (var i = 0; i < conceptIdList.length; i++) 
		{
			var id = conceptIdList[i];
			BahmniService.retrieveConceptDetails(id, function (response) {

				BahmniService.syncDownConceptProcessingIdx++;
				BahmniService.setResponseErrorIfAny(response);
				
				if (response.status == "success") {
					BahmniService.syncDownDataList.concepts.push(response.data);
				}

				if( BahmniService.syncDownConceptProcessingIdx >= BahmniService.syncDownConceptTotal )
				{
					exeFunc();
				}
			});
		}
	}
	else 
	{
		BahmniService.updateOptionsChanges();
		exeFunc();
	}

};


// -------------------------

BahmniService.syncDownStepsEval = function( syncDownName, option )
{
	if ( !option ) option = {};
	// , { patientId: patientId, appointmentActivity: activity }

	if ( syncDownName )
	{
		if ( syncDownName === "syncDownStepsEval_OnBegin" ) { }
		else if ( syncDownName === "syncDownStepsEval_OnSyncDownAppointment" )
		{
			INFO.patientId = option.patientId;
			INFO.appointmentActivity = option.appointmentActivity;
		}	
		else if ( syncDownName === "syncDownStepsEval_OnDownClients" )
		{
			INFO.downClientList = option.downClientList;
		}	
		else if ( syncDownName === "syncDownStepsEval_OnFinal_ClientMerge" ) { }	
	

		try 
		{
			var evalStr = ConfigManager.getSettingsBahmni()[ syncDownName ];
	
			if ( evalStr ) eval( Util.getEvalStr( evalStr ) );
		}
		catch (errMsg) 
		{
			var msgTemp = 'ERROR in BahmniService.syncDownStepsEval, ' + syncDownName + ': ' + errMsg;

			MsgManager.msgAreaShow( msgTemp, 'ERROR');
			console.log(msgTemp);
		}
	}
};

// -------------------------

BahmniService.afterSyncDownAll = function (exeFunc) 
{
	// -------------------------------------------------------------------------------------------------------------
	// Set conceps in AppInfo localStorage
	var concepts = BahmniService.syncDownDataList.concepts;
	for (var i = 0; i < concepts.length; i++) 
	{
		var concept = concepts[i];
		if (concept && concept.answers && concept.answers.length > 0) 
		{
			AppInfoLSManager.setSelectOptions_Item(concept.uuid, BahmniService.generateOptionsByConcept(concept));
		}
	}
	// Override the options of concepts in "definitionOptions" of the configuration file 
	BahmniService.updateOptionsChanges();

	// -------------------------------------------------------------------------------------------------------------
	// Resolve "Follow-Up" activities.
	// There are some activities which has "sch_favId" are not existing in config File.
	// So we need to look for it in localStorage AppInfoLSManager.BAHMNI_FORM_META_DATA
	// and change the "sch_favId" to "default" so that when users click on "Follow-Up" button, the "default" form is showed.
	var formData = BahmniService.syncDownDataList.formData;
	for (var i = 0; i < formData.length; i++) 
	{
		var activity = BahmniService.generateActivityFormData( formData[i], formData[i].formName);
		BahmniService.syncDownDataList.appointments.push( activity );
	}

	// -------------------------------------------------------------------------------------------------------------
	// Add all activities for patients based on patienId
	const patientList = BahmniService.syncDownDataList.patients;
	//var usedAppointIds = [];

	for (var i = 0; i < patientList.length; i++) 
	{
		var item = patientList[i];
		var patientId = item.patientId;

		var activities = Util.findAllFromList(BahmniService.syncDownDataList.appointments, patientId, "patientId");
		item.activities = activities;
		//activities.forEach( app => usedAppointIds.push( app.id ) );
	}
	
	// BahmniService.otherPatientAppointments_Processing( usedAppointIds );

	exeFunc();
};

BahmniService.canCreateFUActivity = function( activityId, activityType )
{
	var clientJson = ClientDataManager.getClientByActivityId( activityId );
	var latestActivity = BahmniService.getLatestActivityByType( clientJson, activityType )
	if( latestActivity != undefined && latestActivity.id == activityId ) {
		return true;
	}
	
	var hasFollowUpActivity = false;
	var activityList = clientJson.activities;
	for( var i=0; i<activityList.length; i++ )
	{
		var activity = activityList[i];
		var syncUpData = activity.syncUp;
		if( syncUpData )
		{
			if( activityType == BahmniService.ACTIVITY_TYPE_APPOINTMENT 
				&& activity.type == BahmniService.ACTIVITY_TYPE_FU_APPOINTMENT && activityId == syncUpData.uuid )
			{
				hasFollowUpActivity = true;
				break;
			}
			else if( ( activityType == BahmniService.ACTIVITY_TYPE_REFERRALS_TEMPLATE && activity.type == BahmniService.ACTIVITY_TYPE_FU_REFERRALS_TEMPLATE )
				|| ( activityType == BahmniService.ACTIVITY_TYPE_ASSESSMENT_AND_PLAN && activity.type == BahmniService.ACTIVITY_TYPE_FU_ASSESSMENT_AND_PLAN ) )
			{
				var checkedActivityId = BahmniService.generateActivityFormData_ActivityId( syncUpData.encounterUuid, syncUpData.formUuid);
				if( activityId == checkedActivityId )
				{
					hasFollowUpActivity = true;
					break;
				}
			}
		}
	}
	
	return !hasFollowUpActivity;

}

BahmniService.getLatestActivityByType = function( clientJson, activityType )
{
	var activities = clientJson.activities;
	var latestDate;
	var latestActivity;
	for( var i=0; i<activities.length; i++ )
	{
		var activity = activities[i];
		var visitDate;
		if ( activity.type === 'Appointment' ) visitDate = new Date( activity.originalData.startDateTime );
        else if ( [ 'Referrals Template', 'Assessment and Plan' ].indexOf( activity.type ) >= 0 ) visitDate = activity.originalData.visitStartDateTime;

		if( activity.type == activityType && ( latestDate == undefined || latestDate < visitDate ) )
		{
			latestDate = visitDate;
			latestActivity = activity;
		}
	}

	return latestActivity;
}

// ------------------------------


BahmniService.otherPatientAppointments_Processing = function ( usedAppointIds ) 
{
	// Get not used (by above) activities/Appointments
	var remainAppoints = BahmniService.syncDownDataList.appointments.filter( app => usedAppointIds.indexOf( app.id ) == -1 );

	// Also, for appointments that is not in patient list, check if that patient is in local
	var localClientList = ClientDataManager.getClientList();

	var inLocalPatientList = { };
	var notFoundPatientList = [];

	// Get Patient/Client List for these 'remain appointment'
	remainAppoints.forEach( app => 
	{
		var patientId = app.patientId;

		if ( patientId )
		{
			var localClient = Util.findFromList( localClientList, patientId, "patientId" );

			if ( localClient ) 
			{
				if ( !inLocalPatientList[ patientId ] ) inLocalPatientList[ patientId ] = Util.cloneJson( client );
			}
			else 
			{
				if ( notFoundPatientList.indexOf( patientId ) < 0 ) notFoundPatientList.push( patientId );
			}
		}
	});


	// For each localClient, add activities..
	for( var patientId in inLocalPatientList )
	{
		var clientCopy = inLocalPatientList[patientId];

		var activities = Util.findAllFromList( remainAppoints, patientId, "patientId");

		activities.forEach( act => 
		{
			// Remove existing one in local and replace it with new downloaded one.
			Util.RemoveFromArrayAll( clientCopy.activities, 'id', act.id );
			clientCopy.activities.push( act );				
		});

		BahmniService.syncDownDataList.patients.push( clientCopy );
	}


	if ( notFoundPatientList.length > 0 ) MsgManager.msgAreaShowErrOpt( 'Bahmni Appointment Merge Error - Not Found Patients: ' + notFoundPatientList.toString() );
};


BahmniService.updateOptionsChanges = function () 
{
	const newOptionsChanged = AppInfoLSManager.getSelectOptions();
	let configOptions = ConfigManager.getConfigJson().definitionOptions;

	for (var optionName in newOptionsChanged) {
		configOptions[optionName] = newOptionsChanged[optionName];
	}

	var syncDownReqStartDTStr = moment().subtract(10, 'minutes').toDate().toISOString();
	AppInfoLSManager.setBahmni_lastSyncedDatetime(syncDownReqStartDTStr);
};


BahmniService.setResponseErrorIfAny = function (response) 
{
	try
	{
		if (response.status == "error") 
		{
			BahmniService.syncDataStatus.status = Constants.status_failed;
			BahmniService.syncDataStatus.msg += response.msg + "; ";
	
			BahmniMsgManager.SyncMsg_InsertMsg( "ERROR: '" + response.id + "', URL '" + response.url + "'. Details: " + response.msg, BahmniMsgManager.MESSAGE_TYPE_ERROR);
		}	
	}
	catch ( errMsg ) { console.log( 'ERROR in BahmniService.setResponseErrorIfAny, ' + errMsg ); }
};

// ------------------------------------------------------------------------------
// Retrieve data from Bahmni server for SyncDown processing

BahmniService.retrievePatientDetails = function (patientId, exeFunc) {
	const url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/patientprofile/" + patientId + "?v=full";
	BahmniRequestService.sendGetRequest(patientId, url, exeFunc);
};

BahmniService.retrieveAppointmentDetails = function (appointmentId, exeFunc) {
	const url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/appointment?uuid=" + appointmentId;
	BahmniRequestService.sendGetRequest(appointmentId, url, exeFunc);
};

BahmniService.retrieveConceptDetails = function (conceptId, exeFunc) {
	var url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/concept/" + conceptId;
	BahmniRequestService.sendGetRequest(conceptId, url, exeFunc);
};

BahmniService.retrieveFormMetadata = function (formName, formVersion, exeFunc) {
	var url = `${INFO.bahmni_domain}/openmrs/ws/rest/v1/wfa/integration/get/formMetadata?formName=${formName}&formVersion=${formVersion}`;
	BahmniRequestService.sendGetRequest(formName + "_" + formVersion, url, exeFunc);
};

// ==============================================================================
// SyncUp 
// ==============================================================================

BahmniService.syncUpAll = function ( exeFunc) 
{
	var resultData = { 'success': 0, 'failure': 0 };

	var activityList = ActivityDataManager.getActivityList();
	var actIdList = [];

	activityList.forEach(activityJson => 
	{
		// Bahmni Syncable condition - on activity..  (But not readyToMongoSync, which is Mongo Sync time run..)
		//  Do not use 'SyncManagerNew.syncUpReadyCheck()' since connection, etc are all different..
		if (activityJson.subSourceType === BahmniService.BAHMNI_KEYWORD 
			&& activityJson.subSyncStatus !== BahmniService.readyToMongoSync 
			&& activityJson.processing
			&& SyncManagerNew.isSyncReadyStatus( activityJson.processing.status )
			) actIdList.push(activityJson.id);
	});

	var actCount = actIdList.length;

	if (actCount <= 0) exeFunc(resultData);
	else 
	{
		for (var i = 0; i < actIdList.length; i++) 
		{
			var activityId = actIdList[i];

			var clientId_before = ClientDataManager.getClientByActivityId(activityId)._id;

			ActivityCard.highlightActivityDiv(activityId, true);

			SyncManagerNew.performSyncUp_Activity(activityId, function (success, responseJson, newStatus, extraData) {
				actCount--;

				try {
					SyncManagerNew.syncUpActivity_ResultUpdate(success, resultData);

					ActivityCard.reRenderAllById(activityId); // ActivityCard.reRenderActivityDiv();
					ActivityCard.highlightActivityDiv(activityId, false);


					// Does not get applied in Bahmni Case!!!
					var clientId_after = ClientDataManager.getClientByActivityId(activityId)._id;
					if (clientId_before.indexOf(ClientDataManager.tempClientNamePre) === 0 && clientId_before !== clientId_after) {
						SyncManagerNew.TempClientDetailTagRefresh(clientId_before, clientId_after);
						SyncManagerNew.tagSwitchToNewClientId(clientId_before, clientId_after);
					}

					SyncManagerNew.ActivityDetailTagRefresh(activityId);
					ClientCard.reRenderClientCardsById(clientId_after, { 'activitiesTabClick': true });
				}
				catch (errMsg) { console.log('ERROR '); }

				if (actCount <= 0) exeFunc(resultData);
			});
		}
	}

};


BahmniService.syncUp = function (activityJson, exeFunc) 
{
	// Called from SyncManagerNew.performSyncUp_Activity
	var url = '';

	// TODO: move this as Action 'dws' or 'url'.. <-- as pre-determined url..
	var procJson = ActivityDataManager.getProcessingJson(activityJson);

	// Old 'dws: { type: 'bahmni' } case
	if (procJson.url === BahmniService.BAHMNI_KEYWORD) {
		// elseCase: "Follow Up Referrals Template Form" OR "Follow Up Assessment Plan"
		var endpoint = (activityJson.type == "Follow Up Appointment") ? "/openmrs/ws/rest/v1/appointment" : "/openmrs/ws/rest/v1/bahmnicore/bahmniencounter";
		url = INFO.bahmni_domain + endpoint;
	}
	else url = INFO.bahmni_domain + procJson.url;


	BahmniRequestService.sendPostRequest(activityJson.id, url, activityJson.syncUp, function (response) 
	{
		BahmniService.setResponseErrorIfAny(response);

		exeFunc((response.status === "success"), response);
	});
};


// ==============================================================================
// BahmniService.mergeDownloadedClients 
// ==============================================================================

BahmniService.mergeDownloadedClients = function (clientList, processingInfo, downloadedData, callBack) 
{
	var dataChangeOccurred = false;
	var newClients = [];
	var mergedActivities = [];

	if (!downloadedData) downloadedData = {};

	// 1. Compare Client List.  If matching '_id' exists, perform merge,  Otherwise, add straight to clientList.
	if (clientList && Util.isTypeArray(clientList)) 
	{
		for (var i = 0; i < clientList.length; i++) 
		{
			var downloadClient = clientList[i];

			try 
			{
				// In Bahmni case, find client by 'patientId'
				var existingClient = (downloadClient.patientId) ? Util.findFromList(ClientDataManager.getClientList(), downloadClient.patientId, "patientId") : undefined;

				// If matching client exists in App already.
				if (existingClient) 
				{
					// NOTE: On Bahmni case, downloaded 'client' data always overwrite to local one.
					// 	Same for 'activity' --> if matching activity exists, always overwrite it.
					// var clientDateCheckPass = (ClientDataManager.getDateStr_LastUpdated(downloadClient) > ClientDataManager.getDateStr_LastUpdated(existingClient));  // if (clientDateCheckPass) 

					var addedActivities = ActivityDataManager.mergeDownloadedActivities(downloadClient.activities, existingClient.activities, existingClient, Util.cloneJson(processingInfo), downloadedData);

					// NOTE: On Client Merge, the download client should follow the local client Id if matching patien exists.
					//		- On 'date' of client, it should not overwrite the 'created--' ones..
					// Copying from 'existingClient.--' to 'downloadClient.--'
					Util.copyProperties( downloadClient.date, existingClient.date, { exceptionCustom: { nameBeginWith: 'created' } } );
					Util.copyProperties( downloadClient.clientDetails, existingClient.clientDetails, { exceptions: { activeUsers: true, creditedUsers: true, voucherCodes: true } } );

					// NOTE: 'Util.copyProperties' copies from right to left!!  'downloadClient' -> 'existingClient'
					if ( !downloadClient.clientConsent ) downloadClient.clientConsent = {};
					if ( !existingClient.clientConsent ) existingClient.clientConsent = {};
					Util.copyProperties( downloadClient.clientConsent, existingClient.clientConsent );

					Util.appendArray(mergedActivities, addedActivities);
					dataChangeOccurred = true;
				}
				else {
					newClients.push(downloadClient);
					dataChangeOccurred = true;

					if (downloadClient.activities && downloadClient.activities.length > 0) {
						Util.appendArray(mergedActivities, downloadClient.activities);
					}
				}
			}
			catch (errMsg) {
				console.log('Error during BahmniService.mergeDownloadedClients, errMsg: ' + errMsg);
				MsgManager.msgAreaShowErrOpt('ERROR in Bahmni Download Merge, ' + errMsg);
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


// ===========================================================
// ==== BahmniUtil Code Moved HERE

// ------------------------------------------------------------------------------
// Convert data ( patient, appointment ) to WFA Object

BahmniService.generateClientData = function (patientData, option) {
	var resolveData = {};

	const date = new Date();
	const patientId = patientData.uuid;

	if (!option) option = {};


	var tempActId = INFO.login_UserName + '_' + Util.formatDate(date.toUTCString(), 'yyyyMMdd_HHmmss') + date.getMilliseconds();
	const clientTempId = ClientDataManager.createNewTempClientId(tempActId);

	resolveData = { clientDetails: Util.cloneJson( patientData.person ), activities: [], date: BahmniService.generateJsonDate(), patientId: patientId };

	resolveData.clientDetails.firstName = patientData.person.preferredName.givenName;
	resolveData.clientDetails.lastName = patientData.person.preferredName.familyName;

	if (!option.mergeCase) {
		resolveData._id = clientTempId;
		resolveData.clientDetails.activeUsers = [INFO.login_UserName];
		resolveData.clientDetails.creditedUsers = [INFO.login_UserName];
		resolveData.clientDetails.voucherCodes = [];
	}

	if ( patientData.identifiers )
	{
		resolveData.clientDetails.identifiers = patientData.identifiers;

		patientData.identifiers.forEach( iden => 
		{
			if ( iden.identifierType )
			{
				const value = iden.identifier;
				const key = iden.identifierType.display; // iden.identifierType.uuid
				if ( key ) resolveData.clientDetails[key] = value;	
			}	
		});
	}

	try {
		var generateClientFormatEval = ConfigManager.getSettingsBahmni().generateClientFormatEval;
		if (generateClientFormatEval) {
			INFO.patientClient = resolveData;
			INFO.patientData = patientData;

			eval(Util.getEvalStr(generateClientFormatEval));
		}
	}
	catch (errMsg) {
		MsgManager.msgAreaShow('ERROR during Eval of bahmni client json create: ' + errMsg, 'ERROR');
		console.log(errMsg);
	}

	return resolveData;
};

BahmniService.generateActivityAppointment = function (data, options) {
	if (!options) options = {};

	const type = "Appointment";
	let dataValues = { ...data };
	dataValues.startDateTime = UtilDate.dateStr("DT", new Date(dataValues.startDateTime)); // Format the 'startDateTime'
	dataValues.endDateTime = UtilDate.dateStr("DT", new Date(dataValues.endDateTime)); //  Format the 'endDateTime'
	const serviceKeys = Object.keys(data.service);
	for (var i = 0; i < serviceKeys.length; i++) {
		const key = serviceKeys[i];
		dataValues["service_" + key] = data.service[key];
	}

	var activity = { id: data.uuid, subSourceType: BahmniService.BAHMNI_KEYWORD, transactions: [{ dataValues, type }], type: type, originalData: data, date: BahmniService.generateJsonDate(), patientId: data.patient.uuid };
	if (options.formData) activity.formData = options.formData;

	return activity;
};

BahmniService.generateActivityFormData = function (formData, type) {
	const patientId = formData.patientUuid;

	var dataValues = {
		encounterUuid: formData.encounterUuid,
		patientUuid: patientId,
		visitUuid: formData.visitUuid,
		formVersion: formData.formVersion
	};
	
	var formNameId = BahmniService.getConfigFormNameId( formData ) ;
	var activityId = BahmniService.generateActivityFormData_ActivityId(formData.encounterUuid, BahmniService.getFormMetadata(formData.formName, formData.formVersion, BahmniService.KEY_FD_META_DATA, "uuid"));
	return { id: activityId, subSourceType: BahmniService.BAHMNI_KEYWORD, transactions: [{ dataValues, type }], type: type, formData: { sch_favId: formNameId, fav_newAct: true }, originalData: formData, date: BahmniService.generateJsonDate(), patientId: patientId };
};

BahmniService.generateActivityFormData_ActivityId = function (encounterUuid, formUuid)
{
	return encounterUuid + "--" + formUuid;
}

/***
 * 
 */
BahmniService.getConfigFormNameId = function( formData )
{
	var formName = formData.formName;
	var formVersion = formData.formVersion;
	var formIdKeyword = formData.formIdKeyword;
	
	// STEP 1. Get config form meta data from Config file and localStorage ( AppLSManager )
	var configData = BahmniService.getFormMetadataByVersion( formName, formVersion );

	// STEP 2. If a config data is found, we need to check this config is gotten from the config file or from LocalStorage
	// If it comes from the LocalStorage, return "formNameId"( sch_favId) as "<formIdKeyword>_default" form
	if (Object.keys(configData).length > 0 && configData.metadata.isLocalStorage )  return formIdKeyword + "_" + BahmniService.FORM_NAME_DEFAULT;
	
	// If it comes from the Config file, return "formNameId"( sch_favId) as "<formIdKeyword>_v<formVersion>" form
	if (Object.keys(configData).length > 0 )  return formIdKeyword + "_v" + formVersion;
	
	// If no config data is found, then returns "<formIdKeyword>_noSupported>"
	return formIdKeyword + "_" + BahmniService.FORM_NAME_NO_SUPPORTED;
}

BahmniService.generateJsonDate = function ( originalDateStr ) 
{
	var dateStr;
	
	try {
		if ( originalDateStr ) dateStr = UtilDate.dateStr( 'DT', UtilDate.getDateObj( originalDateStr ) );
	} catch ( errMsg ) { console.log( 'ERROR in BahmniService.generateJsonDate, ' + errMsg ); }

	if ( !dateStr ) dateStr = UtilDate.dateStr('DT', new Date());

	var dateObj = {
		capturedLoc: dateStr,
		capturedUTC: dateStr,
		createdLoc: dateStr,
		createdUTC: dateStr,
		createdOnDeviceLoc: dateStr,
		createdOnDeviceUTC: dateStr,
		updatedLoc: dateStr,
		updatedUTC: dateStr,
		updatedOnMdbLoc: dateStr,
		updatedOnMdbUTC: dateStr
	};

	UtilDate.setDate_LocToUTC_fields(dateObj, 'ALL');

	return dateObj;
};

BahmniService.resolveNumber = function (number) {
	return (number >= 10) ? ('' + number) : ('0' + number);
};


BahmniService.generateOptionsByConcept = function (concept) {
	var options = [];

	const answers = concept.answers;
	for (var i = 0; i < answers.length; i++) {
		options.push({ "defaultName": answers[i].display, "value": answers[i].uuid });
	}

	return options;
};

BahmniService.getFormMetadata = function (formName, formVersion, keyword, propertyName) {
	var returnVal = 'null';

	// NOTE: CHANGED!!
	try {
		// Get the Form Metadata configuration
		var formMetaDataConfig = BahmniService.getFormMetadataByVersion(formName, formVersion);
		if(formMetaDataConfig == undefined ) return "null";
		
		// Get property value
		var metadata = formMetaDataConfig[keyword];
		var value = (metadata) ? metadata[propertyName] : undefined;
		returnVal = (value) ? metadata[propertyName] : "null";
	}
	catch (errMsg) { console.log('ERROR in BahmniService.getFormMetadata, ' + errMsg); }

	return returnVal;
}

BahmniService.getFormMetadataByVersion = function (formName, formVersion) {
	/*** 
	 * Check the formMetadata if it exists in the config file or not.
	 * If it exist in config file, return it.
	 * ***/
	var formDataConfig = INFO.formMetadata[formName][formVersion];
	if( formDataConfig != undefined ) return formDataConfig;
	
	// if it doesn't exist in the config file, get it from the localStorage
	formDataConfig = AppInfoLSManager.getBahmniFormMetaData_ByVersion(formName, formVersion);
	if( formDataConfig != undefined ) return formDataConfig;

	// If no configuration is found, then return empty
	return;
}

BahmniService.getActivityInfo = function (activity) {
	let activityType = activity.type;
	let activityFormVersion = ActivityDataManager.getTransDataValue(activity.transactions, 'formVersion');
	if (activityFormVersion) {
		let matadataFormVersion = (INFO.formMetadata[activityType]) ? INFO.formMetadata[activityType][activityFormVersion] : '';
		let isSupported = (matadataFormVersion !== "undefined") ? '' : 'No supported';
		return activity.type + ": " + activityFormVersion + " <span style=\"font-size:10px;font-style:italic;\">" + isSupported + "</span>";
	}

	return activity.type;
}


BahmniService.showProgressBar = function (width) {
	if (width) {
		$('#divSubResourceProgressInfo').css('width', width);
	}
	$('#divSubResourceProgressBar').css('display', 'block');
	$('#divSubResourceProgressBar').show();
}

BahmniService.hideProgressBar = function () {
	$('#divSubResourceProgressBar').hide();
}

BahmniService.getDiffBetweenCurrentMinutes = function (startDateObj) {
	var diff = UtilDate.timeCalculation((new Date()).getTime(), startDateObj.getTime());
	return eval(diff.mm);
};



// -----------------------------------------------
// Methods for getting / finding concepts of Form Metadata ( "Referrals Template" Form and "Assessment And Plan" Form )

BahmniService.getConcepts_FromFormMetaData = function (serverFormMetadata) {
	var conceptDataList = [];
	return BahmniService.getConcepts_FromFormMetaData_Operation(serverFormMetadata, conceptDataList);
}

BahmniService.checkAndCreateFormMedataByServerData = function(serverFormMetadata, configFileFormMetadata )
{
	var conceptList = BahmniService.getConcepts_FromFormMetaData(serverFormMetadata);
	var foundConfigFields = {};
	var missedConfigFields = {};
	var matched = true;

	for( var key in configFileFormMetadata )
	{
		var searchUUID = configFileFormMetadata[key].uuid;
		var found = BahmniService.findConceptData(conceptList, searchUUID);
		if( found )
		{
			foundConfigFields[key] =  { "uuid": found.concept.uuid, "id": found.id, "name": found.concept.name };
		}
		else
		{
			matched = false;
			missedConfigFields[key] = configFileFormMetadata[key];
		}
		
	}
	return {
		matched: matched,
		metadata: (matched) ? foundConfigFields : missedConfigFields
	}
}


BahmniService.findConceptData = function (list, value) {
	var item;
	if (list) {
		for (i = 0; i < list.length; i++) {
			var listItem = list[i];

			if (listItem.concept && listItem.concept.uuid === value) {
				item = listItem;
				break;
			}
		}
	}
	return item;
};


BahmniService.getConcepts_FromFormMetaData_Operation = function (jsonData, conceptDataList = []) {
	if (jsonData != null && typeof (jsonData) === 'object' && !Array.isArray(jsonData)) {
		if (jsonData.concept != undefined) conceptDataList.push(jsonData);

		if (jsonData.controls != undefined) BahmniService.getConcepts_FromFormMetaData_Operation(jsonData.controls, conceptDataList);

	} else if (Array.isArray(jsonData)) {
		for (var i = 0; i < jsonData.length; i++) {
			BahmniService.getConcepts_FromFormMetaData_Operation(jsonData[i], conceptDataList);
		}
	}

	return conceptDataList;
}

BahmniService.getUnsupportedFormMetaData_byVersion = function( formName, formVersion) {
	return AppInfoLSManager.getBahmniUnsupportedFormMetaData_byVersion(formName, formVersion);
}