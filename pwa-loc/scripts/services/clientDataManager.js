// =========================================
// -------------------------------------------------
//     ClientDataManager
//          - Keeps client list data & Related Methods.
//
//      - FEATURES:
//          1. Get Client - by Id, by activityId, get all clientList, etc..
//          2. Insert Client - by Id, by activityId, get all clientList, etc..
//          3. loadClientsStore_FromStorage - Load client data from IDB
//          4. saveCurrent_ClientsStore - Save client data to IDB
//          5. Client Index Add/Remove Related Methods
//          6. Merge Related Methods - After SyncUp/Down client/activities data merge
//          7. Othe Methods - Activity Add ProcessingInfo, createClient_forActivityPayload 
//
// -------------------------------------------------

function ClientDataManager() { };

ClientDataManager._clientsStore = { 'list': [] };
ClientDataManager._clientsIdx = {};

ClientDataManager.template_Client = {
	'_id': '',
	'clientDetails': {},
	'activities': []
};

ClientDataManager.tempClientNamePre = 'client_';

ClientDataManager.tempClient_NewClient_IdMap = {}; // when temp client gets removed and converted into new client, we add here for reference.

// ===================================================

// - Only call this on logOut
ClientDataManager.clearClientDataInMem = function () {
	ClientDataManager._clientsStore = { 'list': [] };
	ClientDataManager._clientsIdx = {};
};

// ----- Get  Client ----------------

// Get ClientList from memory
ClientDataManager.getClientList = function () {
	return ClientDataManager._clientsStore.list;
};

// Get single client Item (by property value search) from the list
// TODO: SHOULD BE OBSOLETE
ClientDataManager.getClientItem = function (propName, propVal) {
	return Util.getFromList(ClientDataManager.getClientList(), propVal, propName);
};

ClientDataManager.getClientById = function (idStr) {
	return ClientDataManager._clientsIdx[idStr];
};

ClientDataManager.getClientByActivityId = function (activityId) {
	var client;

	if (activityId && ActivityDataManager._activityToClient[activityId]) {
		client = ActivityDataManager._activityToClient[activityId];
	}

	return client;
};

ClientDataManager.getClientIdByActivityId = function (activityId) {
	var clientId = '';

	try {
		var client = ClientDataManager.getClientByActivityId(activityId);
		if (client) clientId = client._id;
	} catch (errMsg) { console.log('ERROR in ClientDataManager.getClientIdByActivityId, ' + errMsg); }

	return clientId;
};

ClientDataManager.getClientByActivity = function (activity) {
	var client;

	if (activity && activity.id && ActivityDataManager._activityToClient[activity.id]) {
		client = ActivityDataManager._activityToClient[activity.id];
	}

	return client;
};

// ----- Insert Client ----------------

// CASE: New temp client with 'c_reg' activity is 'SyncUp', this gets called with 2nd param as true.
// CASE: Other simple client add case.
ClientDataManager.insertClients = function (clientList) //, bRemoveActivityTempClient )
{
	clientList.forEach(client => {
		ClientDataManager.insertClient(client);
	});
	// NOTE: Not automatically saved. Manually call 'save' after insert.
};

// Insert client to app clientList with Index
ClientDataManager.insertClient = function (client) {
	// Client Activity Reorder - #3 - whenever client is added (from download, etc), make sure activities are sorted properly.
	InfoDataManager.setINFOdata('client_sort', client);

	if (!ConfigManager.activitySorting_EvalRun("insertClient")) {
		// NOTE: TODO: this cause issues...  
		try {
			Util.evalSort('date.createdLoc', client.activities, 'asc');
		}
		catch (errMsg) {
			console.log('ERROR during ClientDataManager.insertClient, sorting activities by date.createdLoc, ' + errMsg);
		}
	}


	ClientDataManager.getClientList().unshift(client); // Add to top of list...

	ClientDataManager.addClientIndex(client);

	var removedActivityClient = ActivityDataManager.updateClientActivityListIdx(client);

	// If removed Activity is from tempClient, perform the replacement of the tempClient with newClient.
	if (removedActivityClient && ClientDataManager.isTempClientCase(removedActivityClient)) {
		// TempClient --> New Client MOVE CASE: (delete tempClient, while moving existing activities before delete)
		ClientDataManager.replaceTempClient_withNewClient(removedActivityClient, client);
	}
};

// TempClient --> New Client MOVE CASE:
ClientDataManager.replaceTempClient_withNewClient = function (tempClient, client) {
	try
	{
		// 1. Add Map for UI ClientCard Tag itemId attribute changing <-- on ClientCard Object ReRender Time.
		ClientDataManager.addMap_TempClient_NewClient(tempClient._id, client._id);


		// 2. Save the Moving activities from TempClient
		var moveOtherActivities = [];
		for ( var i = 0; i < tempClient.activities.length; i++ ) { moveOtherActivities.push( Util.cloneJson( tempClient.activities[i] ) );  }


		// 3. Remove the tempClient - also removes client/activities indexes.. - but do not remove the tags..
		ClientDataManager.removeClient(tempClient, { notRemoveTags: true });
		

		// 4. Modify the moving activity searchValues '_id'
		for ( var i = 0; i < moveOtherActivities.length; i++ ) 
		{ 
			var act = moveOtherActivities[i];
			if (act.processing && act.processing.searchValues) {
				var searchVal = act.processing.searchValues;
				if (searchVal._id) searchVal._id = client._id;
			}
		}

		// 5. Insert the moving activities to the new client
		ActivityDataManager.insertActivitiesToClient(moveOtherActivities, client);
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in ClientDataManager.replaceTempClient_withNewClient, ' + errMsg );
		MsgManager.msgAreaShow( 'ERROR while temp client change', 'ERROR' );
	}
};


// ----- Remove Client ----------------

ClientDataManager.removeTempClient_ifEmptyActs = function (client) {
	// If client is tempClient and activityList is empty, remove the client.
	if (client && ClientDataManager.isTempClientCase(client) && client.activities.length === 0) {
		ClientDataManager.removeClient(client);
	}
};


ClientDataManager.removeClient = function (client, option) {
	try {
		if (!option) option = {};

		// Remove activities in it
		ActivityDataManager.removeActivities(client.activities, { removeActivityCardTags: true });

		// remove client ones..
		ClientDataManager.removeClientIndex(client);
		Util.RemoveFromArray(ClientDataManager.getClientList(), "_id", client._id);

		if (!option.notRemoveTags) {
			// DetailPage Close - If there is this client detailPage opened up, close it up.
			var clientDetailCardTag = $('div.card.client._tab[itemid="' + client._id + '"]');
			if (clientDetailCardTag.length > 0) clientDetailCardTag.closest('div.wapper_card').find('.btnBack.clientDetail').click();

			// Remove all clientCards of this id.
			$('div.card.client[itemid="' + client._id + '"]').remove();
		}
	}
	catch (errMsg) {
		console.log('Error in ClientDataManager.removeClient, errMsg: ' + errMsg);
	}
};

ClientDataManager.removeClientsAll = function () {
	try {
		var clients = ClientDataManager.getClientList();
		var clientCount = clients.length;

		clients.forEach(client => {
			ClientDataManager.removeClient(client);
		});

		console.log('Removed ' + clientCount + ' clients.');
	}
	catch (errMsg) {
		console.log('Error in ClientDataManager.removeAllClient, errMsg: ' + errMsg);
	}
};

ClientDataManager.removeClientsByIdArr = function (clientIdsArr) {
	try {
		for (var i = 0; i < clientIdsArr.length; i++) {
			var client = ClientDataManager.getClientById(clientIdsArr[i]);

			ClientDataManager.removeClient(client);
		}
	}
	catch (errMsg) {
		console.log('ERROR in ClientDataManager.removeClientsByIdArr, ' + errMsg);
	}
};

// --------------------------------------------

ClientDataManager.updateClient_wtActivityReload = function (clientId, updateClientJson) {
	var existingClientJson = ClientDataManager.getClientById(clientId);

	if (existingClientJson !== updateClientJson) {
		// 0. Make sure the updateClientJson._id has not been altered.. Since this is updating existing client json only.
		updateClientJson._id = clientId;

		// 1. Delete all activities on existingClientJson
		if (existingClientJson.activities) ActivityDataManager.removeActivities(existingClientJson.activities)

		// 2. Add activities to existingClientJson + copy other parts as well
		Util.overwriteJsonContent(existingClientJson, updateClientJson);

		// 3. Index the 
		if (existingClientJson.activities) {
			existingClientJson.activities.forEach(activity => {
				if (activity.id) ActivityDataManager.updateActivityIdx(activity.id, activity, existingClientJson);
			});
		}

		ClientDataManager.saveCurrent_ClientsStore();
	}
};


// --------------------------------------------

// Called After Login
ClientDataManager.loadClientsStore_FromStorage = function (callBack) {
	var userName = SessionManager.sessionData.login_UserName;
	var passwd = SessionManager.sessionData.login_Password;

	DataManager2.getData_ClientsStore(userName, passwd, function (jsonData_FromStorage) {

		if (jsonData_FromStorage && jsonData_FromStorage.list) {
			ClientDataManager._clientsStore.list = jsonData_FromStorage.list;
			ClientDataManager.regenClientIndex();
		}

		if (callBack) callBack(ClientDataManager._clientsStore);
	});
};


// After making changes to the list/activityStore (directly), call this to save to storage (IndexedDB)
ClientDataManager.saveCurrent_ClientsStore = function (callBack) {
	var userName = SessionManager.sessionData.login_UserName;
	var passwd = SessionManager.sessionData.login_Password;

	DataManager2.saveData_ClientsStore(userName, passwd, ClientDataManager._clientsStore, callBack);
};


// ---------- Client Index..

ClientDataManager.regenClientIndex = function () {
	ClientDataManager._clientsIdx = {};

	var clientList = ClientDataManager._clientsStore.list;

	for (var i = 0; i < clientList.length; i++) {
		ClientDataManager.addClientIndex(clientList[i]);
	}
};


ClientDataManager.addClientIndex = function (client) {
	if (client._id) {
		ClientDataManager._clientsIdx[client._id] = client;
	}
};


ClientDataManager.removeClientIndex = function (client) {
	if (client._id) {
		if (ClientDataManager._clientsIdx[client._id]) {
			delete ClientDataManager._clientsIdx[client._id];
		}
	}
};

// ======================================================
// === MERGE RELATED =====================

ClientDataManager.mergeDownloadedClients = function (downloadedData, processingInfo, callBack) {
	var dataChangeOccurred = false;
	//var activityListChanged = false;
	var case_dhis2RedeemMerge = false;
	var case_noClientDateCheck = false;
	var newClients = [];
	var mergedActivities = [];

	// 1. Compare Client List.  If matching '_id' exists, perform merge,  Otherwise, add straight to clientList.
	if (downloadedData && downloadedData.clients && Util.isTypeArray(downloadedData.clients)) {
		case_dhis2RedeemMerge = (downloadedData.case === 'dhis2RedeemMerge');
		case_noClientDateCheck = (downloadedData.case === 'syncUpActivity');

		for (var i = 0; i < downloadedData.clients.length; i++) {
			var dwClient = downloadedData.clients[i];

			try {
				if (dwClient._id) {
					var appClient = ClientDataManager.getClientById(dwClient._id);

					// If matching client exists in App already.
					if (appClient) {
						var clientDateCheckPass = (case_dhis2RedeemMerge || case_noClientDateCheck) ? true : (ClientDataManager.getDateStr_LastUpdated(dwClient) > ClientDataManager.getDateStr_LastUpdated(appClient));

						if (clientDateCheckPass) {
							// Get activities in dwClient that does not exists...
							var addedActivities = ActivityDataManager.mergeDownloadedActivities(dwClient.activities, appClient.activities, appClient, Util.cloneJson(processingInfo), downloadedData);

							if (case_dhis2RedeemMerge) {
								// merge data..
								Util.mergeJson(appClient.clientDetails, dwClient.clientDetails);
								Util.mergeJson(appClient.clientConsent, dwClient.clientConsent);
								Util.mergeJson(appClient.date, dwClient.date);
							}
							else {
								// Update clientDetail from dwClient - other than activities merge?
								// For activities, shouldn't we simply add them all?  Except the existing on local ones overwriting.
								//appClient.clientDetails = dwClient.clientDetails;
								//appClient.clientConsent = dwClient.clientConsent;
								//appClient.date = dwClient.date;
								//appClient.relationships = dwClient.relationships;

								Util.copyProperties(dwClient, appClient, { 'exceptions': { 'activities': true, '_id': true } });

								// TODO: All Others?
							}

							Util.appendArray(mergedActivities, addedActivities);
							dataChangeOccurred = true;
						}
					}
					else {
						// Logic: For 'dhis2RedeemMerge' case, if the downloaded client does not already exists, do not merge it..
						if (!case_dhis2RedeemMerge) {
							newClients.push(dwClient);
							dataChangeOccurred = true;

							if (dwClient.activities && dwClient.activities.length > 0) {
								Util.appendArray(mergedActivities, dwClient.activities);
							}
						}
					}
				}
			}
			catch (errMsg) {
				console.log('Error during ClientDataManager.mergeDownloadedClients, errMsg: ' + errMsg);
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


// ----- Othe Methods - Activity Add ProcessingInfo, createClient_forActivityPayload ----------------

// Add processing info if does not exists - with 'downloaded detail'
ClientDataManager.clientsActivities_AddProcessingInfo = function (newClients, processingInfo) {
	for (var i = 0; i < newClients.length; i++) {
		var client = newClients[i];

		for (var x = 0; x < client.activities.length; x++) {
			var activity = client.activities[x];

			ActivityDataManager.insertToProcessing(activity, processingInfo);
		}
	}
};


ClientDataManager.createClient_forActivityPayload = function (activity) {
	// Call it from template?
	var newTempClientId = ClientDataManager.tempClientNamePre + activity.id;

	// NEW: If same client with id (local, not synced, id based on activity) exists, use that instead
	var existingClient = ClientDataManager.getClientById(newTempClientId);
	if (existingClient) return existingClient;
	else {
		var acitivityPayloadClient = Util.cloneJson(ClientDataManager.template_Client);

		acitivityPayloadClient._id = newTempClientId;
		acitivityPayloadClient.clientDetails = ActivityDataManager.getData_FromTrans(activity, "clientDetails");
		acitivityPayloadClient.clientConsent = ActivityDataManager.getData_FromTrans(activity, "clientConsent");
		acitivityPayloadClient.date = ClientDataManager.dateConvertFromActivityDate(activity);

		ClientDataManager.insertClient(acitivityPayloadClient);

		return acitivityPayloadClient;
	}
};


ClientDataManager.dateConvertFromActivityDate = function (activity) {
	var clientDate = {};

	try {
		var actDate = activity.date;

		// 2 Date fields Used by backends.
		//updatedOnMdbUTC: "2021-06-02T02:02:57.026", createdOnMdbUTC: "2021-06-02T02:02:56.550"
		clientDate.createdOnMdbUTC = (actDate.capturedUTC) ? actDate.capturedUTC : Util.formatDate((new Date()).toUTCString(), 'yyyyMMdd_HHmmssSSS');
		clientDate.updatedOnMdbUTC = clientDate.createdOnMdbUTC;
	}
	catch (errMsg) {
		console.log('ERROR in ClientDataManager.dateConvertFromActivityDate, errMsg: ' + errMsg);
	}

	return clientDate;
};


ClientDataManager.getDateStr_LastUpdated = function (clientJson) {
	var dateStr = '';

	if (clientJson && clientJson.date) {
		// NOTE: Temporary fix while we resolve 'updatedUTC' vs 'updatedOnMdbUTC' for client date 
		if (clientJson.date.updatedOnMdbUTC) dateStr = clientJson.date.updatedOnMdbUTC;
		else if (clientJson.date.updatedUTC) dateStr = clientJson.date.updatedUTC;
	}

	return dateStr;
};


// ===============================================
// === Others ====

ClientDataManager.getClientsByVoucherCode = function (voucherCode, opt_TransType, opt_bGetOnlyOnce) {
	var clients = [];
	var matchActivities = ActivityDataManager.getActivitiesByVoucherCode(voucherCode, opt_TransType, opt_bGetOnlyOnce);

	matchActivities.forEach(activity => {
		clients.push(ClientDataManager.getClientByActivity(activity));
	});

	return clients;
};

// -------------------------------------------

ClientDataManager.isTempClientCase = function (client) {
	return (client && ClientDataManager.isTempClientCaseById(client._id));
};

ClientDataManager.isTempClientCaseById = function (clientId) {
	return (clientId && clientId.indexOf(ClientDataManager.tempClientNamePre) === 0);
};

// ClientDataManager.tempClient_NewClient_IdMap = {};
ClientDataManager.addMap_TempClient_NewClient = function (tempClientId, newClientId) {
	ClientDataManager.tempClient_NewClient_IdMap[tempClientId] = newClientId;
};

ClientDataManager.getTempClient_NewClientId = function (tempClientId) {
	var returnClientId = tempClientId;

	var newClientId = ClientDataManager.tempClient_NewClient_IdMap[tempClientId];
	if (newClientId) returnClientId = newClientId;

	return returnClientId;
};

ClientDataManager.tempClient_ToNewClientCase = function (clientId) {
	//var case_tempClient_ToNewClient = false;
	var newClientId;

	// Check if the clientId is tempClient Id.
	if (ClientDataManager.isTempClientCaseById(clientId)) {
		// Check if newClient created from tempClient exists - from tempClient deleting logic
		newClientId = ClientDataManager.tempClient_NewClient_IdMap[clientId];

		//if ( newClientId ) case_tempClient_ToNewClient = true;
	}

	return newClientId;
};


// ===============================================
// === Sample Data Generate / Delete Related ====

ClientDataManager.removeSampleData = function (callBack) {
	var removedCount = 0;

	var clientIdList = ClientDataManager.getClientIdCopyList();

	clientIdList.forEach(clientId => {
		var client = ClientDataManager.getClientById(clientId);

		if (client) {
			if (ClientDataManager.isSampleData(client)) {
				ClientDataManager.removeClient(client);
				removedCount++;
			}
		}
	});

	ClientDataManager.saveCurrent_ClientsStore(() => {
		if (callBack) callBack(removedCount);
	});
};

ClientDataManager.isSampleData = function (client) {
	return (client && client.clientDetails && client.clientDetails.autoGenerated === true);
}

// create load data method..  
ClientDataManager.loadSampleData = function (icount, sampleDataTemplate, callBack) {
	var loops = (icount ? icount : 1);
	var rndNames = 'Vickey Simpson,Yuri Youngquist,Sherice Sharma,Ariane Albert,Heather Locklear,Taunya Tubb,Lawanda Lord,Quentin Quesenberry,Terrance Tennyson,Rosaria Romberger,Joann Julius,Doyle Dunker,Carolina Casterline,Sherly Shupe,Dorris Degner,Xuan Xu,Mercedez Matheney,Jacque Jamerson,Lillian Lefler,Derek Deegan,Berenice Barboza,Charlene Marriot,Mariam Malott,Cyndy Carrozza,Shaquana Smith,Kendall Kitterman,Reagan Riehle,Mittie Maez,Carry Carstarphen,Nelida Nakano,Christoper Compo,Sadie Shedd,Coleen Samsonite,Estella Eutsler,Pamula Pannone,Keenan Kerber,Tyisha Tisdale,Ashlyn Aguirre,Ashlie Albritton,Willy Wonka,Diann Yowzer,Asha Carpenter,Devin Dashiell,Arvilla Alers,Sheba Sherron,Richard Racca,Elba Early,Coretta Cossey,Brande Bushnell,Larraine Samsung,Pilar Varillas,Gaspar Hernandez,Greg Rowles,James Chang,Bruno Raimbault,Rodolfo Melia,Chris Purdy,Martin Dale,Sam Sox,Joe Soap,Joan Sope,Marty McFly';
	var rndMethod = 'Pills,Injection,Implant,IUD,None,Condom,Other';

	for (var i = 0; i < loops; i++) {
		var tmp = JSON.stringify(sampleDataTemplate);
		var actType = FormUtil.getActivityTypes()[Util.generateRandomNumberRange(0, FormUtil.getActivityTypes().length - 1).toFixed(0)].name;
		var status = Configs.statusOptions[Util.generateRandomNumberRange(0, Configs.statusOptions.length - 1).toFixed(0)].name;
		var shrtDate = new Date();
		var recDate = new Date(shrtDate.setDate(shrtDate.getDate() - (Util.generateRandomNumberRange(0, 10))));
		var earlierDate = new Date(recDate.setDate(recDate.getDate() - (Util.generateRandomNumberRange(0, 60))));
		var myFirst = Util.getRandomWord(rndNames, i).trim().split(' ')[0];
		var myLast = Util.getRandomWord(rndNames, i).trim().split(' ')[1];
		var method = Util.getRandomWord(rndMethod, i);

		tmp = tmp.replace(/{ACTIVITY_TYPE}/g, actType);
		tmp = tmp.replace(/{PROGRAM}/g, actType.split('-')[0]);
		tmp = tmp.replace(/{STATUS}/g, status);

		tmp = tmp.replace(/{SHORTDATE}/g, shrtDate.toISOString().split('T')[0].replace(/-/g, ''));
		tmp = tmp.replace(/{RECENT_SHORTDATE}/g, recDate.toISOString().split('T')[0]);
		tmp = tmp.replace(/{EARLIER_SHORTDATE}/g, earlierDate.toISOString().split('T')[0]);
		tmp = tmp.replace(/{TIME}/g, new Date().toISOString().split('T')[1].replace(/:/g, '').replace('.', '').replace('Z', ''));
		tmp = tmp.replace(/{USERNAME}/g, SessionManager.sessionData.login_UserName);
		tmp = tmp.replace(/{8DIGITS}/g, Util.generateRandomNumber(8));
		tmp = tmp.replace(/{10DIGITS}/g, Util.generateRandomNumber(10));
		tmp = tmp.replace(/{10RNDCHARS}/g, Util.generateRandomId().substring(0, 10));
		tmp = tmp.replace(/{AGE}/g, Util.generateRandomNumberRange(i, (50 + i)).toFixed(0));
		tmp = tmp.replace(/{FIRSTNAME}/g, myFirst);
		tmp = tmp.replace(/{LASTNAME}/g, myLast);
		tmp = tmp.replace(/{METHOD}/g, method);


		new Date().toISOString().split('T')[0].replace(/-/g, '')
		//console.log( ' ~ type: ' + actType + ' ( ' + status + ' ) ', recDate, earlierDate );

		ClientDataManager.insertClients(JSON.parse(tmp));
	}

	ClientDataManager.saveCurrent_ClientsStore(() => {
		if (callBack) callBack();
	});
};

// ------------------------------------------------
// ---- Get Client Id copied list - Used to delete or loop data without being affected by change data.

ClientDataManager.getClientIdCopyList = function () {
	var clientIdList = [];

	var clientList = ClientDataManager.getClientList();

	clientList.forEach(client => {
		if (client._id) clientIdList.push(client._id);
	});

	return clientIdList;
};


ClientDataManager.getClientIdCopyList = function () {
	var clientIdList = [];

	var clientList = ClientDataManager.getClientList();

	clientList.forEach(client => {
		if (client._id) clientIdList.push(client._id);
	});

	return clientIdList;
};

// ----------------------------------------

// Used by 'SyncDown' downloaded/processed 'client' activity dates..  UTC -> Loc..
ClientDataManager.setActivityDateLocal_clientList = function (clientList) {
	if (clientList) {
		clientList.forEach(client => {
			ClientDataManager.setClientDateLocal(client);

			if (client.activities) {
				client.activities.forEach(activity => {
					ActivityDataManager.setActivityDateLocal(activity);
				});
			}
		});
	}
};

// Used by 'SyncUp' downloaded/processed 'client' activity dates..  UTC -> Loc..
ClientDataManager.setActivityDateLocal_client = function (client) {
	if (client) {
		ClientDataManager.setClientDateLocal(client);

		ClientDataManager.setActivityDateLocal_clientList([client]);
	}
};

ClientDataManager.setActivityDateLocal_clientsAll = function () {
	ClientDataManager.setActivityDateLocal_clientList(ClientDataManager.getClientList());
};

ClientDataManager.setClientDateLocal = function (client) {
	try {
		if (client.date) {
			if (ConfigManager.isSourceTypeDhis2()) {
				// NOTE: Do not convert DHIS2 ones?  for now?  Safe to not do anything?

				// capturedUTC, createdUTC, updatedUTC <-- if exists, convert Loc
				//var srcLocalTimeCase = ( ConfigManager.getConfigJson().sourceAsLocalTime || ConfigManager.getConfigJson().dhis2UseLocalTime );

				// If Dhis2 stored date is saved as Local dateTime, set it as 'Loc' and get/calculate UTC from it.
				//if ( srcLocalTimeCase ) UtilDate.setDate_LocToUTC_bySrc( client.date, 'captured', activityJson.date.capturedUTC );
				//else UtilDate.setDate_UTCToLoc( client.date, 'capturedUTC' );                    
			}
			else // mongo soruce case
			{
				UtilDate.setDate_UTCToLoc_fields(client.date, 'ALL');  // Or automatically all?
			}
		}
	}
	catch (errMsg) {
		console.log('Error in ClientDataManager.setActivityDateLocal, ' + errMsg);
	}
};

// ----------------------------------------

// 'LastVoucher' - Getting last dated (issued date) voucher is not what we want anymore..
//      - Due to backdated new voucher need to be considered 'latestActiveVoucher' - What we want. 

// Get last voucher data by issued activity captured date.
ClientDataManager.getLastVoucherData = function (client) {
	var lastVoucherData;

	var voucherDataList = ClientDataManager.getVoucherDataList(client);

	if (voucherDataList.length > 0) {
		var override_Vc;

		// NEW: If 'overrideVC' is specified, use it to get 'getLastVoucherData'
		if (INFO.lastVoucher_overrideClient === client._id && INFO.lastVoucher_overrideVC) {
			var vcList = voucherDataList.filter(vc => vc.voucherCode === INFO.lastVoucher_overrideVC);
			if (vcList.length > 0) override_Vc = vcList[vcList.length - 1];
		}

		if (override_Vc) lastVoucherData = override_Vc;
		else lastVoucherData = voucherDataList[voucherDataList.length - 1];
	}

	return lastVoucherData;
};

// Get last voucher data by issued activity created date.
ClientDataManager.getLastCreatedVoucherData = function (client) {
	var lastVoucherData;

	var voucherDataList = ClientDataManager.getVoucherDataList(client);

	if (voucherDataList.length > 0) {
		voucherDataList.sort(function (a, b) {
			return (a.v_issCreatedDateStr >= b.v_issCreatedDateStr) ? 1 : -1;
		}
		);

		lastVoucherData = voucherDataList[voucherDataList.length - 1];
	}

	return lastVoucherData;
};


// Get last active voucher data that has been issued, but not redeemed (ever)
ClientDataManager.getLastActiveVoucherData = function (client) {
	var lastActiveVoucherData;

	var voucherDataList = ClientDataManager.getVoucherDataList(client);

	if (voucherDataList.length > 0) {
		voucherDataList.sort(function (a, b) {
			return (a.v_issCreatedDateStr >= b.v_issCreatedDateStr) ? 1 : -1;
		}
		);

		// loop the other way..
		for (var i = voucherDataList.length - 1; i >= 0; i--) {
			var vItem = voucherDataList[i];

			if (vItem.v_issDate && vItem.rdxActList.length === 0) {
				lastActiveVoucherData = vItem;
				break;
			}
		}
	}

	return lastActiveVoucherData;
};


// ----------------------------

ClientDataManager.getVoucherDataList = function (client, overrideDateName) {
	var voucherDataList = [];

	if (client && client.clientDetails) {
		var voucherCodes = [];
		var clientDetails = client.clientDetails;

		if (clientDetails.voucherCodes && Util.isTypeArray(clientDetails.voucherCodes)) voucherCodes = clientDetails.voucherCodes;
		else if (clientDetails.voucherCode && Util.isTypeArray(clientDetails.voucherCode)) voucherCodes = clientDetails.voucherCode;
		else if (clientDetails.voucherCode && Util.isTypeString(clientDetails.voucherCode)) voucherCodes.push(clientDetails.voucherCode);


		if (voucherCodes.length > 0) {
			var filteredActivities = ClientDataManager.getActivities_EP_Filtered(client);   // client.activities

			// 1. Organize data by voucherCode ->  { voucherCode, createdDateStr/v_issDateStr, activities([]) }
			for (var i = 0; i < voucherCodes.length; i++) {
				var voucherCode = voucherCodes[i];

				var voucherData = ActivityDataManager.getVoucherActivitiesData(filteredActivities, voucherCode);
				if (voucherData.activities.length > 0) voucherDataList.push(voucherData);
			}

			// 2. Sort by 'v_issDateStr' in ascending order <-- But should be changed to 'v_issCreatedDateStr'?
			voucherDataList.sort(function (a, b) {
				return (a.v_issDateStr >= b.v_issDateStr) ? 1 : -1;
			}
			);
		}
	}

	return voucherDataList;
};

// NEW - External Partner case filtering activities (they are not the owner of)
ClientDataManager.getActivities_EP_Filtered = function (client) {
	var activities = [];

	// External Role Filter.. - If the current user belong to External Partner (by userRole), only get the owner activities
	// 'INFO.clientLimitedAccess' set by clientCardDetail opening.
	if (INFO.clientLimitedAccess && INFO.clientLimitedAccess._id === client._id) {
		activities = client.activities.filter(act => act.activeUser === SessionManager.sessionData.login_UserName);
	}
	else activities = client.activities;

	return activities;
};


ClientDataManager.isVoucherNotUsed = function (voucherData) {
	var usedTrans = voucherData.transList.filter(trans => trans.type && trans.type.indexOf('v_rdx') === 0);
	return (usedTrans.length === 0);
};

ClientDataManager.getClientListByFields = function (inputJson, option) {
	var matchedList = [];
	if (!option) option = {};

	if (inputJson) {
		// 
		if (option.payloadTemplate && option.field) PayloadTemplateHelper.evalPayloadTemplate_fieldOverride(inputJson, INFO, option.payloadTemplate, option.field);

		var clientList = ClientDataManager.getClientList();

		clientList.forEach(client => {
			//if ( Util.compareJsonPropVal( inputJson, client.clientDetails ) )
			if (ClientDataManager.matchClientDetailsVal(inputJson, client.clientDetails)) matchedList.push(client);
		});
	}

	return matchedList;
};


ClientDataManager.matchClientDetailsVal = function (inputJson, clientDetails) {
	var bAllMatch = true;
	var lvl1Fields = ['firstName', 'lastName'];

	try {
		for (var key in inputJson) {
			var inputVal = inputJson[key];
			var targetVal = clientDetails[key];

			// If 'inputVal' is empty string or undefined, continue with other property/key matching
			if (inputVal === undefined) { }  // || inputVal === ''
			else if (inputVal === false) // If 'inputVal' is false, only if targetVal is false, allow it.
			{
				if (targetVal !== false) { bAllMatch = false; break; }
			}
			else // If 'inputVal' is valid
			{
				// Special comparison Check:
				// VoucherCode: voucherCodes or voucherCode comparison...
				if (key === 'voucherCode') {
					if (clientDetails.voucherCodes && clientDetails.voucherCodes.indexOf(inputVal) >= 0) { }
					else if (clientDetails.voucherCode === inputVal) { }
					else { bAllMatch = false; break; }
				}
				else {
					// If 'targetVal', matching key 'clientDetails' value, does not exist, return false?
					if (targetVal === undefined) { bAllMatch = false; break; }
					else {
						if (lvl1Fields.indexOf(key) >= 0) {
							var lvl1Match = FormUtil.matchValueLVL1(inputVal, targetVal);
							if (!lvl1Match) { bAllMatch = false; break; }
						}
						else if (Util.isTypeString(inputVal)) {
							if (inputVal !== targetVal) { bAllMatch = false; break; }
						}
						else if (Util.isTypeObject(inputVal)) {
							// Check '$gte', '$gt', '$lt', '$lte' - { "$gte": "1999-08-01",  "$lte": "2000-08-01" }
							var rangeCheck = FormUtil.mongoRangeCheck(inputVal, targetVal);
							if (!rangeCheck) { bAllMatch = false; break; }
						}
					}
				}
			}
		}
	}
	catch (errMsg) {
		bAllMatch = false;
		console.log('ERROR in ClientDataManager.matchClientDetailsVal, ' + errMsg);
	}

	return bAllMatch;
};


ClientDataManager.getClientLikeCUIC = function (CUIC) {
	const stringMatch = (a, b) => {
		let longer = a.length >= b.length ? a : b;
		let shorter = longer === a ? b : a;
		return longer.indexOf(shorter) >= 0
	}

	var matchedList = [];

	if (CUIC) {
		var clientList = ClientDataManager.getClientList();

		try {
			matchedList = [...clientList.filter(client => client.clientDetails.CUIC && stringMatch(CUIC.toLowerCase(), client.clientDetails.CUIC.toLowerCase()))];
		} catch (errMsg) { console.log('ERROR in ClientDataManager.getClientLikeCUIC, ' + errMsg); }
	}

	return matchedList;
};


ClientDataManager.checkClientCreator = function (client, username) {
	var bOwner = false;

	try {
		var regActList = ActivityDataManager.getActivitiesByTrans(client.activities, [{ type: 'c_reg' }]);

		if (regActList.filter(act => act.activeUser === username).length > 0) bOwner = true;
	}
	catch (errMsg) {
		console.log('ERROR in ClientDataManager.isClientOwner, ' + errMsg);
	}

	return bOwner;
};

// prop: 'referringClient' / 'creditedClient'
ClientDataManager.getInClientActs = function (client, prop) {
	var foundVal = ''; // could use undefined.

	try {
		var acts = client.activities.filter(act => act[prop]);

		if (acts.length > 0) {
			var lastAct = acts[acts.length - 1];
			foundVal = lastAct[prop];
		}
	}
	catch (errMsg) {
		console.log('ERROR in ClientDataManager.getInClientActs, ' + errMsg);
	}

	return foundVal;
};

ClientDataManager.hasUsedActivities = function ( client ) {
	var hasUsedAct = false;

	try {
		if ( client.activities.length === 0 ) hasUsedAct = false;
		else if ( client.activities.length === 1 ) {
			var act = client.activities[0];
			// NOTE: 'r_add' is also allowed transaction activtiy, however, it always go with 'c_reg' in 1st activity, thus, no need to add additional logic.
			var isCReg = ActivityDataManager.hasActivityTransMatch( act, [ { 'type': 'c_reg' } ] );
			if ( isCReg ) hasUsedAct = false;
			else hasUsedAct = true;
		}
		else hasUsedAct = true;
	}
	catch (errMsg) {
		console.log('ERROR in ClientDataManager.getInClientActs, ' + errMsg);
	}

	return hasUsedAct;
};