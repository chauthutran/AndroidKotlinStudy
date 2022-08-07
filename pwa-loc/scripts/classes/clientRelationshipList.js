
function ClientRelationshipList(clientId, _relationshipTabTag, blockDefId) {
	var me = this;

	me.clientId = clientId;
	me.clientJson;
	me.relationshipTabTag = _relationshipTabTag;
	me.blockDefId = blockDefId;
	me.blockDefJson = {};

	// Variables
	me.listTag;
	me.addRelationshipBtnTag;

	// --------------------------------
	// Init method
	me.initialize = function () {
		me.blockDefJson = ConfigManager.getClientDef()[me.blockDefId];
	}

	// ----------------------------------------------------------------------------------------
	me.getListTag = function () { return me.listTag; }

	// ----------------------------------------------------------------------------------------

	me.render = function () {
		me.clientJson = ClientDataManager.getClientById(me.clientId);
		INFO.client = me.clientJson; // TODO: thiis should be also done on click... right icon of item.

		// Reset things..  maybe simply clear it out?  
		me.relationshipTabTag.html('');

		me.listTag = $('<div class="tabContentList"></div>');
		me.relationshipTabTag.append(me.listTag);

		me.renderRelationshipList(me.listTag, me.clientJson.relationships, me.blockDefJson);


		var favIconsObj = new FavIcons('clientRelFav', me.listTag, me.relationshipTabTag, {
			'mainFavClickPre': function (blockTag, blockContianerTag) {
				INFO.client = me.clientJson;  /// ?? Get/refresh client json by id?
			}
		});
		favIconsObj.render();
	};

	// ----------------------------------------------------------------------------------------
	// Render methods

	me.renderRelationshipList = function (listTag, relationships, blockDefJson) {
		// Render list of client relationship
		if (relationships) {
			relationships.forEach(rel => {
				INFO.relationship = rel;
				var targetClientJson = ClientDataManager.getClientById(rel.clientId);
				INFO.relTargetClient = targetClientJson;

				var itemCardObj = new ItemCard(targetClientJson, listTag, blockDefJson, {}, () => {
					INFO.client = ClientDataManager.getClientById(me.clientId);
					INFO.relationship = rel;
					//INFO.relationship.client = itemJson;

					console.log('--- itemCard callback ----');
					console.log(INFO.client);
					console.log(INFO.relationship);
				});
				itemCardObj.render();
			});
		}
	};

	// ----------------------------------------------------------------------------------------
	// Setup Edit / Delete a relationship events

	me.setUp_Events = function (cardTag) {
		// Add relationship
		cardTag.find(".fab-wrapper").click(function () {

		});

		cardTag.find(".editRelationship").click(function () {

		});

		cardTag.find(".deleteRelationship").click(function () {

			var clientFullName = me.getClientFullName(me.clientJson);
			var relClientId = cardTag.attr("itemId");

			var relationshipClientJson = ClientDataManager.getClientById(relClientId);
			var rlsFullName = me.getClientFullName(relationshipClientJson);

			var ok = window.confirm("Are you sure you want to delete the relationship of " + clientFullName + " and " + rlsFullName);
			if (ok) {
				me.removeRelationship(me.clientJson, relationshipClientJson);
			}
		});

	}

	// ----------------------------------------------------------------------------------------
	// Add / Edit / Delete a relationship function

	me.showEditRelationshipForm = function () {

	}

	me.editRelationship = function (clientJson, relationshipClientId) {

	}

	me.addRelationship = function (clientJson, relationshipClientId, relationshipType1, relationshipType2) {
		clientJson.relationships.push({ "clientId": relationshipClientId, "type": relationshipType1 });

		var relationshipClientJson = ClientDataManager.getClientById(relObj.clientId);
		relationshipClientJson.relationships.push({ "clientId": clientJson._id, "type": relationshipType2 });
	}

	me.removeRelationship = function (clientJson, relClientJson) {
		Util.RemoveFromArray(clientJson.relationships, "clientId", relClientJson._id);
		Util.RemoveFromArray(relClientJson.relationships, "clientId", clientJson._id);
	}


	// ----------------------------------------------------------------------------------------
	// Supportive methods


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

	me.getClientFullName = function (clientJson) {
		var fullName = '- -';

		try {
			if (clientJson && clientJson.clientDetails) {
				var cDetail = clientJson.clientDetails;

				if (cDetail.firstName || cDetail.lastName) {
					var firstName = (cDetail.firstName) ? cDetail.firstName : '-';
					var lastName = (cDetail.lastName) ? cDetail.lastName : '-';

					fullName = firstName + " " + lastName;
				}
			}
		}
		catch (errMsg) {
			console.log('ERROR in ClientCard.getNameSimbol(), errMsg: ' + errMsg);
		}

		return fullName;
	};

	// -----------------------
	me.initialize();
}