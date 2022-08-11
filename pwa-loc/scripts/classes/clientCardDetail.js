// -------------------------------------------
// -- ClientCardDetail Class/Methods

function ClientCardDetail(clientId) {
	var me = this;

	me.clientId = clientId;
	me.actionObj;
	me.cardSheetFullTag;
	me.timedOut1stTabOpen;

	// ===============================================
	// === Initialize Related ========================

	me.initialize = function () {
		me.actionObj = new Action(SessionManager.cwsRenderObj, {});
		var preCall = undefined;
		var clientJson = ClientDataManager.getClientById(me.clientId);

		var bExternalPartner = ConfigManager.externalPartner();

		// If current user belongs to externerPartner role, and , Optional ActivityTab removal + client Edit + relationship  <-- View only?
		if (bExternalPartner ) {
			INFO.clientLimitedAccess = clientJson;  // This gets used on 'ClientDataManager' activity/voucher list filtering, Client Profile Edit Button show/hide, ClientDataManager.getVoucherDataList uses this
			INFO.clientCreator = ClientDataManager.checkClientCreator(clientJson, SessionManager.sessionData.login_UserName);

			preCall = function (sheetFullTag) {
				sheetFullTag.find('li[rel=tab_relationships]').remove();
				sheetFullTag.find('div[tabButtonId=tab_relationships]').remove();
			};
		}
		// Optional 'clientRelationshipTab' removal - set in config.
		else if (ConfigManager.getHideClientRelationshipTab()) {
			preCall = function (sheetFullTag) {
				sheetFullTag.find('li[rel=tab_relationships]').remove();
				sheetFullTag.find('div[tabButtonId=tab_relationships]').remove();
			};
		}


		// sheetFull Initialize / populate template
		me.cardSheetFullTag = FormUtil.sheetFullSetup(ClientCardDetail.cardFullScreen, { title: 'Client Detail', term: '', cssClasses: ['clientDetail'], preCall: preCall });

		// create tab click events
		FormUtil.setUpEntryTabClick(me.cardSheetFullTag.find('.tab_fs'));

		// ADD TEST/DUMMY VALUE
		me.cardSheetFullTag.find('.client').attr('itemid', me.clientId)

		// ReRender
		me.cardSheetFullTag.find('.clientDetailRerender').off('click').click(function () {
			// me.render();
			me.cardSheetFullTag.find('div.clientRerender').click();
			me.cardSheetFullTag.find('.tab_fs__head li.primary.active').click();
		});


		// Reset the overrideVC (lastVoucher)
		INFO.lastVoucher_overrideVC = '';
		INFO.lastVoucher_overrideClient = me.clientId;
	};

	// ----------------------------------

	me.render = function (option) {
		INFO.client = ClientDataManager.getClientById(me.clientId); // to be used as 'eval' reference in other places.. // Or INFO.getINFOJson();

		// Header content set  <--- This looks for all with $( 'div.card[itemid="' + me.clientId + '"]' );
		//      - this catches not only generated full sheet html card part.
		var clientCard = new ClientCard(me.clientId, { 'detailViewCase': true });
		var clientCardTag = me.cardSheetFullTag.find('.client[itemid]');
		clientCard.setClientCardTag(clientCardTag);
		clientCard.render();

		// set tabs contents
		me.setFullPreviewTabContent(me.clientId, me.cardSheetFullTag, option);

		TranslationManager.translatePage();
	};

	// ----------------------------------------------------

	me.setFullPreviewTabContent = function (clientId, sheetFullTag, option) {

		// #1. Client Details 
		var clientDetailsTabTag = sheetFullTag.find('[tabButtonId=tab_clientDetails]');
		var clientProfileBlockId = ConfigManager.getClientDef().clientProfileBlock;  // Get client Profile Block defition from config.
		sheetFullTag.find('.tab_fs li[rel=tab_clientDetails]').click(function () {
			me.clearTimeout_1stTabClick();
			clientDetailsTabTag.html('');

			var passedData = me.getPassedData_FromClientDetail(clientId);
			FormUtil.renderBlockByBlockId(clientProfileBlockId, SessionManager.cwsRenderObj, clientDetailsTabTag, passedData);

			clientDetailsTabTag.find('div.block').css('width', '98% !important');
		});


		// #2. Client Activities
		var activityTabBodyDivTag = sheetFullTag.find('[tabButtonId=tab_clientActivities]');
		sheetFullTag.find('.tab_fs li[rel=tab_clientActivities]').click(function () {
			var activityTabTag = $(this);

			me.clearTimeout_1stTabClick();

			activityTabBodyDivTag.html('<div class="activityList tabContentList"></div>');
			var activityListDivTag = activityTabBodyDivTag.find('.activityList');

			var clientJson = ClientDataManager.getClientById(clientId); // for changed client data?
			if (clientJson) {
				// NEW - switchLatestVoucherRoles
				var divLatestVoucherTag = me.displayLatestVoucherInfo(clientJson, activityListDivTag); // only if there is vouchers..
				if (ConfigManager.switchLatestVoucher() && divLatestVoucherTag) me.setSwitchLatestVoucher(clientJson, divLatestVoucherTag, activityTabTag);

				var filteredActivities = ClientDataManager.getActivities_EP_Filtered(clientJson);  // clientJson.activities
				me.populateActivityCardList(filteredActivities, activityListDivTag);
			}

			// ClientActivity FavList render
			var favIconsObj = new FavIcons('clientActivityFav', activityTabBodyDivTag, activityTabBodyDivTag
				, {
					'mainFavClickPre': function (blockTag, blockContianerTag) {
						// On fav icon click, perform these below 1st as pre-step.                
						blockTag.html('');

						// Get proper client into INFO.client - since other client could been loaded by clicks.
						INFO.client = ClientDataManager.getClientById(me.clientId);
					}, 'mainFavClickPost': function (blockTag) { blockTag.find('div.block:first').css('width', '100%'); }
				});
			var favListArr = favIconsObj.render();


			// Disable fav icon if not in favListArr <-- but, better to place this logic within the activityCard render?
			me.disableFavItems(activityListDivTag, favListArr);


			// NEW: Activity favIcon auto click on start..
			if (option && option.openFav_ActId) {
				var activityCardTag = activityListDivTag.find('div.activity[itemid="' + option.openFav_ActId + '"]');
				var actFavIconTag = activityCardTag.find('div.favIcon[favId]');

				if (actFavIconTag.length > 0) {
					actFavIconTag.click();
					// After 1st use, remove the option..  Had issue, thus, disabled
					setTimeout(() => { option.openFav_ActId = false; }, 1000);
				}
			}

			TranslationManager.translatePage();
		});


		// #3. Relationship
		var relationshipTabTag = sheetFullTag.find('[tabButtonId=tab_relationships]');
		var relationshipListObj = new ClientRelationshipList(clientId, relationshipTabTag, 'clientRelationTab');
		sheetFullTag.find('.tab_fs li[rel=tab_relationships]').click(function () {
			me.clearTimeout_1stTabClick();

			relationshipListObj.render();  // Rendering logic could be replaced with 'itemCardList' definition on 'clientDef'
		});


		if (DevHelper.devMode && SessionManager.isTestLoginCountry()) {
			// #4. Payload TreeView
			sheetFullTag.find('li.primary[rel="tab_previewPayload"]').attr('style', '');
			sheetFullTag.find('li.secondary[rel="tab_previewPayload"]').removeClass('tabHide');

			sheetFullTag.find('.tab_fs li[rel=tab_previewPayload]').click(function () {
				me.clearTimeout_1stTabClick();

				var jv_payload = new JSONViewer();
				sheetFullTag.find('[tabButtonId=tab_previewPayload]').find(".payloadData").append(jv_payload.getContainer());
				jv_payload.showJSON(ClientDataManager.getClientById(clientId), -1, 1);
			});


			// #5. Dev (Optional)
			sheetFullTag.find('li.primary[rel="tab_optionalDev"]').attr('style', '');
			sheetFullTag.find('li.secondary[rel="tab_optionalDev"]').removeClass('tabHide');

			var devTabTag = sheetFullTag.find('[tabButtonId=tab_optionalDev]');
			sheetFullTag.find('.tab_fs li[rel=tab_optionalDev]').click(function () {
				me.clearTimeout_1stTabClick();

				// A. Client Activity Request Add
				me.setUpClientActivityRequestAdd(clientId, devTabTag, sheetFullTag);

				// B. TextArea for get clientJson
				me.setUpClientJsonEdit(clientId, devTabTag, sheetFullTag);
			});
		}


		// -----------------------------------------
		// Click on one of the tab on start        
		var openUp_tabRel = (option && option.openTabRel) ? option.openTabRel : 'tab_clientDetails';

		if (openUp_tabRel) {
			// Default click 'Client'
			var defaultTab = sheetFullTag.find('.tab_fs li[rel=' + openUp_tabRel + ']');
			// var defaultTab = sheetFullTag.find( '.tab_fs li[rel=tab_clientDetails]' ).first();
			// But wants to not display the selection dropdown when size is mobile..        
			defaultTab.attr('openingClick', 'Y').click();

			me.timedOut1stTabOpen = setTimeout(function () { defaultTab.attr('openingClick', ''); }, 400);   // Cancel this if other click is applied..
		}
	};


	// TODO: However, we need to close this whenever other blocks are rendered (when activityList is removed..)
	me.displayLatestVoucherInfo = function (clientJson, activityListDivTag) {
		var divLatestVoucherTag = '';

		var lastVoucherData = ClientDataManager.getLastVoucherData(clientJson);

		// only if there is a voucher, choose the latest voucher..
		if (lastVoucherData) {
			divLatestVoucherTag = $('<div class="lastVoucherInfoDiv"></div>');
			activityListDivTag.prepend(divLatestVoucherTag);

			var voucherCodeDivTag = $('<div style="display: inline-block;"><span>Current Voucher:</span> <span class="spanLastVc"></span> <span class="spanLastVcDate" style="color: gray; font-size: 13px;"></span></div>');

			voucherCodeDivTag.find('span.spanLastVc').text(lastVoucherData.voucherCode).attr('title', 'Issued: ' + lastVoucherData.v_issDateStr);
			voucherCodeDivTag.find('span.spanLastVcDate').text(' [' + UtilDate.formatDateTimeStr(lastVoucherData.v_issDateStr, 'MMM d') + ']');

			divLatestVoucherTag.attr('voucherCode', lastVoucherData.voucherCode);

			divLatestVoucherTag.append(voucherCodeDivTag);
		}

		return divLatestVoucherTag;
	};

	me.setSwitchLatestVoucher = function (clientJson, divLatestVoucherTag, activityTabTag) {
		var voucherDataList = ClientDataManager.getVoucherDataList(clientJson);

		if (voucherDataList.length > 1) {
			// Insert into divLatestVoucher - to add dropdown..
			var selectDivTag = $('<div class="overrideLastVoucherDiv"><span>Override:</span> <select class="switchVc"></select></div>');
			var selectTag = selectDivTag.find('select');
			divLatestVoucherTag.append(selectDivTag);

			var currLastVoucherCode = divLatestVoucherTag.attr('voucherCode');

			voucherDataList.forEach(vcData => {
				var itemTag = $('<option value="' + vcData.voucherCode + '" >' + vcData.voucherCode + ' [' + UtilDate.formatDateTimeStr(vcData.v_issDateStr, 'MMM d') + ']</option>');

				selectTag.append(itemTag);
				if (vcData.voucherCode === currLastVoucherCode) itemTag.attr('selected', 'selected');
			});

			selectTag.change(function () {
				INFO.lastVoucher_overrideVC = selectTag.val();
				INFO.lastVoucher_overrideClient = clientJson._id;

				// Reload Fav <-- 
				// FormUtil.setForReloading( activityTabTag );
				activityTabTag.attr('reloading', 'Y').click();
			});
		}
	};


	me.clearTimeout_1stTabClick = function () {
		if (me.timedOut1stTabOpen) {
			clearTimeout(me.timedOut1stTabOpen);
			me.timedOut1stTabOpen = undefined;
		}
	};


	me.disableFavItems = function (activityListDivTag, favListArr) {
		activityListDivTag.find('div.favIcon[favId]').each(function () {
			var favItemTag = $(this);
			var favId = favItemTag.attr('favId');

			var matchFav = Util.getFromList(favListArr, favId, 'id');

			if (!matchFav) {
				var newTitle = favItemTag.attr('favName') + ' - This fav item is not available at this flow stage.';
				favItemTag.off('click').css('opacity', '0.6').attr('title', newTitle);
			}
		});
	};

	me.getPassedData_FromClientDetail = function (clientId) {
		var passedData = { displayData: [], resultData: [] };

		try {
			var displayDataArr = [];
			displayDataArr.push({ id: "id", value: clientId });

			var clientJson = ClientDataManager.getClientById(clientId);

			for (var id in clientJson.clientDetails) {
				displayDataArr.push({ id: id, value: clientJson.clientDetails[id] });
			}

			passedData.displayData = displayDataArr;
		}
		catch (errMsg) { console.log('ERROR in ClientCardDetails.getPassedData_FromClientDetail, ' + errMsg); }

		return passedData;
	};
	// ------------------------------

	me.setUpClientActivityRequestAdd = function (clientId, devTabTag, sheetFullTag) {
		var newActivityTemplateJson = me.getTempActivityRequestJson(clientId);

		var taClientActivityNewTag = devTabTag.find('.taClientActivityNew').val(JSON.stringify(newActivityTemplateJson, undefined, 4));
		var spClientActivityNewResultTag = devTabTag.find('.spClientActivityNewResult').text('');

		devTabTag.find('.btnClientActivityCreate').off('click').click(function () {
			try {
				var mainActionJson = ConfigManager.getActionQueueActivity();
				mainActionJson.clientId = clientId;
				mainActionJson.payloadJson = JSON.parse(taClientActivityNewTag.val());  // 'payloadJson' is a special json

				var actionsList = [mainActionJson,
					{ "actionType": "reloadClientTag" },
					{ "actionType": "topNotifyMsg", "message": "New activity queue added." },
					{ "actionType": "evalAction", "eval": " $( 'li.primary[rel=tab_optionalDev]').click();" }];

				me.actionObj.handleClickActionsAlt(actionsList, taClientActivityNewTag.closest('div'), devTabTag, function (resultStr) {
					//spClientActivityNewResultTag.text( 'Create Performed.  Result: ' + resultStr );
				});
			}
			catch (errMsg) {
				alert('FAILED to create client activity.');
			}
		});
	};


	me.setUpClientJsonEdit = function (clientId, devTabTag, sheetFullTag) {
		var clientJson = ClientDataManager.getClientById(clientId);

		var taClientJsonTag = devTabTag.find('.taClientJson').val(JSON.stringify(clientJson, undefined, 4));
		var spClientJsonResultTag = devTabTag.find('.spClientJsonResult').text('');

		devTabTag.find('.btnSave').off('click').click(function () {
			try {
				var clientJsonNew = JSON.parse(taClientJsonTag.val());

				// save with client Id
				ClientDataManager.updateClient_wtActivityReload(clientId, clientJsonNew);

				// Refresh this tab content by clicking the tab.
				sheetFullTag.find('.tab_fs li[rel=tab_optionalDev]').click();

				// Update the message?
				// devTabTag.find( '.spClientJsonResult' ).text( 'Updated Client Json' );
				MsgManager.msgAreaShow('Client Edit Done!!');
			}
			catch (errMsg) {
				alert('FAILED to update client data.');
			}
		});
	};

	// ------------------------------

	me.addTempActivity = function (clientId) {
		var newTempActivity = Util.cloneJson(ClientCardDetail.activityTemplateJson);

		// SessionManager.sessionData.login_UserName;  // INFO.login_UserName

		var newPayloadDate = new Date();
		newTempActivity.date.capturedLoc = Util.formatDate(newPayloadDate.toUTCString());
		newTempActivity.date.capturedUTC = Util.formatDate(newPayloadDate.toString());
		newTempActivity.date.createdOnDeviceUTC = newTempActivity.date.capturedLoc;

		newTempActivity.activeUser = SessionManager.sessionData.login_UserName;
		newTempActivity.id = SessionManager.sessionData.login_UserName + '_' + Util.formatDate(newPayloadDate.toUTCString(), 'yyyyMMdd_HHmmss') + newPayloadDate.getMilliseconds();;


		var clientJson = ClientDataManager.getClientById(clientId);
		clientJson.activities.push(newTempActivity);

		// save with client Id
		ClientDataManager.updateClient(clientId, clientJson);
	};


	me.getTempActivityRequestJson = function (clientId) {
		var newTempActivity = Util.cloneJson(ClientCardDetail.activityTemplateJson);
		var capJson = newTempActivity.captureValues;
		var schJson = newTempActivity.searchValues;

		schJson._id = clientId;

		var newPayloadDate = new Date();
		var dateJson = capJson.date;
		dateJson.capturedLoc = Util.formatDate(newPayloadDate.toString());
		dateJson.capturedUTC = Util.formatDate(newPayloadDate.toUTCString());
		dateJson.createdOnDeviceUTC = dateJson.capturedUTC;

		capJson.activeUser = SessionManager.sessionData.login_UserName;
		capJson.id = SessionManager.sessionData.login_UserName + '_' + Util.formatDate(newPayloadDate.toUTCString(), 'yyyyMMdd_HHmmss') + newPayloadDate.getMilliseconds();;

		return newTempActivity;
	};


	// =============================================

	me.populateActivityCardList = function (activityList, listTableTbodyTag) {
		if (activityList.length === 0) { }
		else {
			var actList_sort = Util.cloneJson(activityList);

			// Client Activity Reorder - #2
			InfoDataManager.setINFOdata('actList_sort', actList_sort);
			if (!ConfigManager.activitySorting_EvalRun("populateActivityCardList")) {
				Util.evalSort('date.capturedLoc', actList_sort, 'desc');
				Util.evalSort('date.capturedLoc', actList_sort, 'asc');
			}

			for (var i = actList_sort.length - 1; i >= 0; i--) {
				var activityJson = actList_sort[i];

				try {
					var activityCardObj = me.createActivityCard(activityJson, listTableTbodyTag);
					activityCardObj.render();
				}
				catch (errMsg) { console.log('ERROR in ClientCardDetail.populateActivityCardList, ' + errMsg); }
			}
		}

		// TranslationManager.translatePage();
	};

	me.createActivityCard = function (activityJson, listTableTbodyTag) {
		var divActivityCardTag = $(ActivityCard.cardDivTag);

		divActivityCardTag.attr('itemId', activityJson.id);
		//divActivityCardTag.attr( 'group', groupAttrVal );

		listTableTbodyTag.append(divActivityCardTag);

		return new ActivityCard(activityJson.id, divActivityCardTag, { 'displaySetting': 'clientActivity' });
	};

	// === Run initialize - when instantiating this class
	me.initialize();
};


ClientCardDetail.activityTemplateJson =
{
	"searchValues": { "_id": "" },
	"captureValues": {
		"date": { "capturedUTC": "", "capturedLoc": "", },
		"id": "",
		"activeUser": "",
		"location": {},
		"type": "",
		"transactions": [
			{ "type": "s_info", "dataValues": {}, "clientDetails": {} }
		]
	}
};

ClientCardDetail.cardFullScreen = `<div class="sheet_full-fs detailFullScreen">
	<div class="wapper_card">
		<div style="display: flex;">
			<div class="sheet-title c_900">
				<img src="images/arrow_back.svg" class="btnBack mouseDown" />
				<span class="sheetTopTitle" mark="clientFull" style="vertical-align: super;">Details</span>
			</div>
			<div style="width: 100px; display: flex">
				<div class="syncIcon mouseDown" title="SyncAll" style="width: 45px; opacity: 0.0; cursor: pointer;">-</div>
				<div class="onOfflineIcon mouseDown" title="Network" style="width: 49px; opacity: 0.0; cursor: pointer;">-</div>
			</div>
		</div>

		<div class="card _tab client">
			<div class="clientDetailRerender" style="float: left; width: 1px; height: 1px;"></div>
			<div class="clientContainer card__container">
				<card__support_visuals class="clientIcon card__support_visuals" />
				<card__content class="clientContent card__content" />
				<card__cta class="activityStatus card__cta">
					<div class="activityStatusText card__cta_status" />
					<div class="clientPhone card__cta_one mouseDown" style="cursor: pointer;"></div>
					<div class="activityStatusIcon card__cta_two mouseDown" style="cursor: pointer;"></div>
				</card__cta>
				<div class="clientRerender" style="float: left; width: 1px; height: 1px;"></div>
			</div>

			<div class="tab_fs">
				<ul class="tab_fs__head" style="background-color: #fff;">
					<li class="primary active" rel="tab_clientDetails">
						<div class="tab_fs__head-icon i-client" rel="tab_clientDetails"></div>
						<span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>

						<ul class="secondary" style="display: none; z-index: 1;">

							<li class="secondary" style="display:none" rel="tab_clientActivities">
								<div class="tab_fs__head-icon i-activity" rel="tab_clientActivities"></div>
								<span term="clientDetail_tab_activities" rel="tab_clientActivities">Activity</span>
							</li>

							<li class="secondary" style="display:none" rel="tab_relationships">
								<div class="tab_fs__head-icon i-relationship " rel="tab_relationships"></div>
								<span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
							</li>

							<li class="secondary tabHide" style="display:none" rel="tab_previewPayload">
								<div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
								<span term="clientDetail_tab_payload" rel="tab_previewPayload">Payload</span>
							</li>

							<li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
								<div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
								<span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
							</li>

						</ul>
					</li>

					<li class="primary" rel="tab_clientActivities">
						<div class="tab_fs__head-icon i-activity" rel="tab_clientActivities"></div>
						<span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>

						<ul class="secondary" style="display: none; z-index: 1;">

							<li class="secondary" style="display:none" rel="tab_clientDetails">
								<div class="tab_fs__head-icon i-client" rel="tab_clientDetails"></div>
								<span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>
							</li>

							<li class="secondary" style="display:none" rel="tab_relationships">
								<div class="tab_fs__head-icon i-relationship " rel="tab_relationships"></div>
								<span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
							</li>

							<li class="secondary tabHide" style="display:none" rel="tab_previewPayload">
								<div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
								<span term="clientDetail_tab_payload" rel="tab_previewPayload">Payload</span>
							</li>

							<li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
								<div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
								<span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
							</li>

						</ul>
					</li>

					<li class="primary" rel="tab_relationships">
						<div class="tab_fs__head-icon i-relationship " rel="tab_relationships"></div>
						<span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
						<ul class="secondary" style="display: none; z-index: 1;">

							<li class="secondary" style="display:none" rel="tab_clientDetails">
								<div class="tab_fs__head-icon i-client" rel="tab_clientDetails"></div>
								<span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>
							</li>

							<li class="secondary" style="display:none" rel="tab_clientActivities">
								<div class="tab_fs__head-icon i-activity" rel="tab_clientActivities"></div>
								<span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>
							</li>

							<li class="secondary tabHide" style="display:none" rel="tab_previewPayload">
								<div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
								<span term="clientDetail_tab_payload" rel="tab_previewPayload">Payload</span>
							</li>

							<li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
								<div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
								<span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
							</li>

						</ul>
					</li>

					<li class="primary" rel="tab_previewPayload" style="display: none;">
						<div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
						<span term="clientDetail_tab_payload" rel="tab_previewPayload">Payload</span>
						<ul class="secondary" style="display: none; z-index: 1;">

							<li class="secondary" style="display:none" rel="tab_clientDetails">
								<div class="tab_fs__head-icon i-client" rel="tab_clientDetails"></div>
								<span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>
							</li>

							<li class="secondary" style="display:none" rel="tab_clientActivities">
								<div class="tab_fs__head-icon i-activity" rel="tab_clientActivities"></div>
								<span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>
							</li>

							<li class="secondary" style="display:none" rel="tab_relationships">
								<div class="tab_fs__head-icon i-relationship " rel="tab_relationships"></div>
								<span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
							</li>

							<li class="secondary tabHide" style="display:none" rel="tab_optionalDev">
								<div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
								<span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
							</li>

						</ul>
					</li>

					<li class="primary" rel="tab_optionalDev" style="display: none;">
						<div class="tab_fs__head-icon i-details_24" rel="tab_optionalDev"></div>
						<span term="clientDetail_tab_optionalDev" rel="tab_optionalDev">Dev</span>
						<ul class="secondary" style="display: none; z-index: 1;">

							<li class="secondary" style="display:none" rel="tab_clientDetails">
								<div class="tab_fs__head-icon i-client" rel="tab_clientDetails"></div>
								<span term="clientDetail_tab_client" rel="tab_clientDetails">Client</span>
							</li>

							<li class="secondary" style="display:none" rel="tab_clientActivities">
								<div class="tab_fs__head-icon i-activity" rel="tab_clientActivities"></div>
								<span term="clientDetail_tab_activities" rel="tab_clientActivities">Activities</span>
							</li>

							<li class="secondary" style="display:none" rel="tab_relationships">
								<div class="tab_fs__head-icon i-relationship " rel="tab_relationships"></div>
								<span term="clientDetail_tab_relationships" rel="tab_relationships">Relationships</span>
							</li>

							<li class="secondary tabHide" style="display:none" rel="tab_previewPayload">
								<div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
								<span term="clientDetail_tab_payload" rel="tab_previewPayload">Payload</span>
							</li>

						</ul>
					</li>

				</ul>
				<div class="tab_fs__head-icon_exp"></div>
			</div>

			<div class="tab_fs__container" style="padding: 0px !important;">

				<div class="tab_fs__container-content sheet_preview active" tabButtonId="tab_clientDetails" blockid="tab_clientDetails" style="overflow-x: hidden !important;" />

				<div class="tab_fs__container-content sheet_preview" tabButtonId="tab_clientActivities" blockid="tab_clientActivities" style="display:none;" />

				<div class="tab_fs__container-content sheet_preview" tabButtonId="tab_relationships" blockid="tab_relationships" style="display:none;" />

				<div class="tab_fs__container-content sheet_preview" tabButtonId="tab_previewPayload" blockid="tab_previewPayload" style="display:none;">
					<div class="payloadData"></div>
				</div>

				<div class="tab_fs__container-content sheet_preview" tabButtonId="tab_optionalDev" blockid="tab_optionalDev" style="display:none;">

					<div style="margin-top: 5px;">
						<div> <span style="font-size: small; font-weight: bold; color: #555;">New Activity Json Request: </span> <button class="btnClientActivityCreate">Create</button> <span class="spClientActivityNewResult"></span> </div>
						<div>
							<textarea class="taClientActivityNew" rows="15" style="width: 98%; font-size: small;"></textarea>
						</div>
					</div>

					<div style="margin-top: 8px;">
						<div> <span style="font-size: small; font-weight: bold; color: #555;">Client Edit [Local Only]: </span> <button class="btnSave">Save</button> <span class="spClientJsonResult"></span> </div>
						<div>
							<textarea class="taClientJson" rows="20" style="width: 98%; font-size: small;"></textarea>
						</div>
					</div>

				</div>

			</div>

		</div>
	</div>
</div>`;

