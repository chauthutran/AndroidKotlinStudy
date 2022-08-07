// -------------------------------------------
// -- ClientCard Class/Methods
//      - Mainly used for syncManager run one client item sync
//
//      - Tags will be used if this item is displayed on the app.
//          - There will be cases where client items are processed (in sync)
//              without being displayed on the app list.  
//
function ClientCard(clientId, options) {
	var me = this;

	me.clientId = clientId;
	me.options = (options) ? options : {};
	me.divClientCardTag;  // This must be setup after creation by --> me.createClientCardTag(),  me.setClientCardTag()

	me.cardHighlightColor = '#fcffff'; // #fffff9

	// =============================================
	// === Initialize Related ========================

	me.initialize = function () { };

	// ----------------------------------------------------

	me.render = function () {
		me.tempClientIdChangeApply(me.clientId, me.divClientCardTag);

		// clientCardDiv Tags(Multiple selections). 
		var clientCardDivTag = me.divClientCardTag; //me.getClientCardDivTag();

		// If tag has been created), perform render
		if (clientCardDivTag.length > 0) {
			var clientJson = ClientDataManager.getClientById(me.clientId);
			var detailViewCase = (me.options.detailViewCase) ? true : false;  // Used for detailed view popup - which reuses 'render' method.

			try {
				//var clientContainerTag = clientCardDivTag.find( '.clientContainer' );
				var clientIconTag = clientCardDivTag.find('.clientIcon');
				var clientContentTag = clientCardDivTag.find('.clientContent');
				var clientRerenderTag = clientCardDivTag.find('.clientRerender');
				var clientPhoneCallTag = clientCardDivTag.find('.clientPhone');
				//var favIconTag = clientCardDivTag.find( '.favIcon' );

				// 1. clientType (Icon) display (LEFT SIDE)
				me.clientIconDisplay(clientIconTag, clientJson);
				//if ( clickEnable ) me.clientIconClick_displayInfo( clientIconTag, clientJson );


				// 2. previewText/main body display (MIDDLE)
				me.setClientContentDisplay(clientContentTag, clientJson);
				if (!detailViewCase) me.clientContentClick_FullView(clientContentTag, me.clientId);


				// 3. 'phoneNumber' action  button setup
				me.setupPhoneCallBtn(clientPhoneCallTag, clientJson);


				// 4. 'SyncUp' Button Related - click event - for clientSubmit.., icon/text populate..
				me.setupSyncBtn(clientCardDivTag, clientJson, detailViewCase);  // clickEnable - not checked for SyncBtn/Icon


				// 4. favIcon of the last activity - if scheduled activity case.
				// ActivityCard.setupFavIconBtn( favIconTag, lastActivityJson.id, { clientCardId: me.clientId, activityId: lastActivityJson.id } );


				// 5. clickable rerender setup
				me.setUpReRenderByClick(clientRerenderTag);

			}
			catch (errMsg) {
				console.log('Error on ClientCard.render, errMsg: ' + errMsg);
			}
		}
	};


	// On ReRender, this could be used to change the tempClientId to new client
	me.tempClientIdChangeApply = function (clientId, divClientCardTag) {
		var newClientId_FromTempClient = ClientDataManager.tempClient_ToNewClientCase(clientId);

		if (newClientId_FromTempClient) {
			me.clientId = newClientId_FromTempClient;

			divClientCardTag.attr('itemid', newClientId_FromTempClient);
		}
	};


	me.setupSyncBtn = function (clientCardDivTag, clientJson, detailViewCase) {
		try {
			var clientId = clientJson._id;
			var divSyncIconTag;
			var divSyncStatusTextTag;

			// NEW Client Level Sync Status (has 2 status only - 'synced' / 'pending')
			if (ConfigManager.isClientSync_ClientLevel()) {
				// add sync button icon..
				divSyncIconTag = clientCardDivTag.find('.activityStatusIcon').attr('clientId', clientId);
				divSyncStatusTextTag = clientCardDivTag.find('.activityStatusText').attr('clientId', clientId);

				// Within it, check if there is any unsynced activities.  If so, the status would be 'unsynced'
				ActivitySyncUtil.displayStatusLabelIcon_ClientCard(clientJson);

				ActivitySyncUtil.setSyncIconClickEvent_ClientCard(divSyncIconTag, clientCardDivTag, { clientClick: true }); //, activityIdArr );
			}
			else {
				var lastActivity = ClientCard.getLastActivity(clientJson);
				var lastActivityId = (lastActivity) ? lastActivity.id : '';

				divSyncIconTag = clientCardDivTag.find('.activityStatusIcon').attr('activityId', lastActivityId);
				divSyncStatusTextTag = clientCardDivTag.find('.activityStatusText').attr('activityId', lastActivityId);

				ActivitySyncUtil.displayActivitySyncStatus(lastActivityId);

				ActivitySyncUtil.setSyncIconClickEvent(divSyncIconTag, clientCardDivTag, lastActivityId);
			}

			// If 'detailView' mode, the bottom message should not show..
			if (detailViewCase) divSyncIconTag.addClass('detailViewCase');


			// TODO: When ClientCard is clicked in 'clientCardDetail' page, and the syncUp returns with some extra info..
			//      --> We need to catch the activityList call and return?


		}
		catch (errMsg) {
			console.log('ERROR in ClientCard.setupSyncBtn, ' + errMsg);
		}
	};


	// ---------------------------------------

	me.createClientCardTag = function (groupAttrVal) {
		var divClientCardTag = $(ClientCard.cardDivTag);

		me.setClientCardTag(divClientCardTag);

		divClientCardTag.attr('group', groupAttrVal);

		return divClientCardTag;
	};


	me.setClientCardTag = function (clientCardTag) {
		me.divClientCardTag = clientCardTag;

		me.divClientCardTag.attr('itemId', me.clientId);
		//return divClientCardTag;
	};

	// -----------------------------------------------------

	me.clientIconClick_displayInfo = function (clientIconTag, clientJson) {
		clientIconTag.off('click').click(function (e) {
			e.stopPropagation();  // Stops calling parent tags event calls..
			console.log(clientJson);
		});
	};

	me.clientContentClick_FullView = function (clientContentTag, clientId) {
		clientContentTag.off('click').click(function (e) {
			e.stopPropagation();

			var clientCardDetail = new ClientCardDetail(clientId);
			clientCardDetail.render();
		});
	};

	me.setClientContentDisplay = function (divClientContentTag, client) {
		try {
			var displayBase = ConfigManager.getClientDisplayBase();
			var displaySettings = ConfigManager.getClientDisplaySettings();

			InfoDataManager.setINFOdata('client', client);


			var view = me.options.viewDef_Selected;
			var preRunEvalStr;
			if (view) {
				var hasViewDisplayData = false;

				if (view.displayBase) {
					hasViewDisplayData = true;
					displayBase = view.displayBase;
				}

				if (view.displaySettings) {
					hasViewDisplayData = true;
					displaySettings = view.displaySettings;
				}

				// preRunEval string set only if there is 'displayBase/Settings'
				if (hasViewDisplayData && view.preRunEval) preRunEvalStr = Util.getEvalStr(view.preRunEval);
			}

			FormUtil.setCardContentDisplay(divClientContentTag, displayBase, displaySettings, Templates.cardContentDivTag, preRunEvalStr);
		}
		catch (errMsg) {
			console.log('ERROR in clientCard.setClientContentDisplay, errMsg: ' + errMsg);
		}
	};


	// -------------------------------
	// --- Display Icon/Content related..

	me.clientIconDisplay = function (clientIconTag, clientJson) {
		try {
			var iconName = ClientCard.cardIconTag.replace('{NAME}', me.getNameSimbol(clientJson));

			var svgIconTag = $(iconName);

			clientIconTag.empty().append(svgIconTag);
		}
		catch (errMsg) {
			console.log('Error on ClientCard.clientTypeDisplay, errMsg: ' + errMsg);
		}
	};


	me.setupPhoneCallBtn = function (divPhoneCallTag, clientJson) {
		divPhoneCallTag.empty().hide();

		if (clientJson.clientDetails && clientJson.clientDetails.phoneNumber) {
			var phoneNumber = Util.trim(clientJson.clientDetails.phoneNumber);

			if (phoneNumber) // && phoneNumber !== '+' )  <-- why '+' check?
			{
				var cellphoneTag = $('<img src="images/cellphone.svg" class="phoneCallAction" />');

				cellphoneTag.click(function (e) {

					e.stopPropagation();

					if (Util.isMobi()) {
						window.location.href = `tel:${phoneNumber}`;
					}
					else {
						alert(phoneNumber);
					}
				});

				divPhoneCallTag.append(cellphoneTag);
				divPhoneCallTag.show();
			}
		}
	};

	// ------------------------------------------

	me.setUpReRenderByClick = function (clientRerenderTag) {
		clientRerenderTag.off('click').click(function (e) {
			e.stopPropagation();  // Stops calling parent tags event calls..
			me.render();
		});
	};

	// ----------------------------

	me.getNameSimbol = function (clientJson) {
		var nameSimbol = '--';

		try {
			if (clientJson && clientJson.clientDetails) {
				var cDetail = clientJson.clientDetails;

				if (cDetail.firstName || cDetail.lastName) {
					var firstNameSimbol = (cDetail.firstName) ? cDetail.firstName.charAt(0) : '-';
					var lastNameSimbol = (cDetail.lastName) ? cDetail.lastName.charAt(0) : '-';

					nameSimbol = firstNameSimbol + lastNameSimbol;
				}
			}
		}
		catch (errMsg) {
			console.log('ERROR in ClientCard.getNameSimbol(), errMsg: ' + errMsg);
		}

		return nameSimbol;
	};


	me.highlightClientDiv = function (bHighlight) {
		// If the clientTag is found on the list, highlight it during SyncAll processing.
		if (me.divClientCardTag.length > 0) {
			if (bHighlight) me.divClientCardTag.css('background-color', me.cardHighlightColor);
			else me.divClientCardTag.css('background-color', '');
		}
	}

	// -------------------------------

	// =============================================
	// === Run initialize - when instantiating this class  ========================

	me.initialize();

};

// -------  GLOBAL METHODS/TEMPLATES --------------


ClientCard.getAllClientCardDivTags = function (clientId) {
	return $('div.card[itemid="' + clientId + '"]');
};


ClientCard.reRenderClientCardsById = function (clientId, option) {
	if (clientId) {
		// TODO: this somehow cause the activity list 'sync' to render strangly... But this is about refreshing client, not activities...
		var clientCardTags = ClientCard.getAllClientCardDivTags(clientId);

		clientCardTags.find('div.clientRerender').click();

		// click on the activityTab? with option..
		if (option && option.activitiesTabClick) {
			clientCardTags.find('.tab_fs li[rel=tab_clientActivities]:visible').click();
		}
	}
};


ClientCard.getLastActivity = function (clientJson) {
	return ActivityDataManager.getLastActivity(clientJson.activities);
};


ClientCard.getUnsyncedActivities = function (clientJson) {
	var activities = [];

	try {
		clientJson.activities.forEach(act => {
			if (ActivityDataManager.isActivityStatusSyncable(act)) activities.push(act);
		});
	}
	catch (errMsg) {
		console.log('ERROR in ClientCard.getUnsyncedActivities(), errMsg: ' + errMsg);
	}

	return activities;
};


ClientCard.cardDivTag = `<div class="client card">
	<div class="clientContainer card__container">

		<card__support_visuals class="clientIcon card__support_visuals" />

		<card__content class="clientContent card__content mouseDown" style="color: #444; cursor: pointer;" title="Click for detail" />

		<card__cta class="activityStatus card__cta">
			<div class="activityStatusText card__cta_status"></div>
			<div class="favIcon card__cta_one mouseDown" style="cursor: pointer; display:none;"></div>
			<div class="clientPhone card__cta_one mouseDown" style="cursor: pointer; display:none;"></div>
			<div class="activityStatusIcon card__cta_two mouseDown" style="cursor:pointer;"></div>
		</card__cta>

		<div class="clientRerender" style="float: left; width: 1px; height: 1px;"></div>
	</div>
</div>`;

ClientCard.relationshipCardDivTag = `<div class="clientContainer card__container">
	<card__support_visuals class="clientIcon card__support_visuals" />
	<card__content class="clientContent card__content" style="color: #444; cursor: pointer;" title="Click for detail" />
	<card__cta class="activityStatus card__cta">
		<div class="editRelationship card__cta_one" style="cursor: pointer;"><img src="images/payload_24.png"></div>
		<div class="deleteRelationship card__cta_two" style="cursor:pointer;"><img src="images/hide.png"></div>
	</card__cta>
	<div class="clientRerender" style="float: left; width: 1px; height: 1px;"></div>
</div>`;

ClientCard.cardIconTag = `<svg xlink="http://www.w3.org/1999/xlink" width="50" height="50">
	<g id="UrTavla">
		<circle style="fill:url(#toning);stroke:#ccc;stroke-width:1;stroke-miterlimit:10;" cx="25" cy="25" r="23"></circle>
		<text x="50%" y="50%" text-anchor="middle" stroke="#ccc" stroke-width="1.5px" dy=".3em">{NAME}</text>
	</g>
</svg>`;