// -------------------------------------------
// -- ActivityUtil Class/Methods

function ActivityUtil() { }

ActivityUtil.activityList = [];

// ==== Methods ======================

// NOTE: How is this used?  Isn't this obsolete?
ActivityUtil.addAsActivity = function (type, defJson, defId, inputsJson) {
	// For some types, clear the activity list <-- to track/collect from 
	if (type === "area") ActivityUtil.clearActivity();

	var activityJson = {};
	activityJson.type = type;
	activityJson.defJson = defJson;
	activityJson.defId = (typeof defId === 'string') ? defId : "";
	activityJson.inputsJson = inputsJson;  // Possibility..

	// Add to the activity list.
	ActivityUtil.activityList.push(activityJson);

	return activityJson;
};

// ===========================================================
// ==== Inputs Json generate / Activity Payload Gen related ==


ActivityUtil.generateActivityPayload_byFormsJson = function (actionDefJson, formDivSecTag) {
	var activityPayload = actionDefJson.activityPayload;
	var payload = {};

	if (activityPayload) {
		if (activityPayload.payloads) {
			// Array ones.. activityPayload: { payloads: [ { payloadTemplate: ---- }, ... ] }
			// <-- run one after another + merge the json..
			for (var i = 0; i < activityPayload.payloads.length; i++) {
				var tempPayloadDef = activityPayload.payloads[i];
				var tempPayload = ActivityUtil.generateFormsJsonData_ByType(tempPayloadDef, actionDefJson, formDivSecTag);

				// merge result json..				
				Util.mergeDeep(payload, tempPayload);
			}
		}
		else if (activityPayload.payload) {
			// Object one - activityPayload: { payload: { payloadTemplate: ---- } }
			payload = ActivityUtil.generateFormsJsonData_ByType(activityPayload.payload, actionDefJson, formDivSecTag);
		}
	}
	else if (actionDefJson.payloadJson) {
		// New Dev mode in client details, adding activity payload json mamually
		payload = actionDefJson.payloadJson;
	}
	else {
		// no structure base ones..
		payload = ActivityUtil.generateFormsJsonData_ByType(actionDefJson, actionDefJson, formDivSecTag);
	}

	// NEW: Set proper payload captureValues dates generated.
	ActivityUtil.checkNSet_ActivityDates(payload);

	return { 'payload': payload };
};


ActivityUtil.checkNSet_ActivityDates = function (payload) {
	try {
		if (payload.captureValues && payload.captureValues.date) {
			var date = payload.captureValues.date;

			if (Util.isTypeObject(date)) {
				// Chceck weekends/holidays and move to next business days.
				if (date.scheduledLoc) {
					var scheduleDateAdjust = ConfigManager.getActivityDef().scheduleDateAdjust;
					if (scheduleDateAdjust && scheduleDateAdjust.enable) ActivityUtil.adjustScheduleDate_businessDay(date, 'scheduledLoc', scheduleDateAdjust);
				}

				// Generate the other side fields.
				UtilDate.setDate_LocToUTC_fields(date, 'ALL');
				UtilDate.setDate_UTCToLoc_fields(date, 'ALL');

				// If none of above date exists, create 'capturedLoc' - just in case..
				if (!date.capturedLoc && !date.scheduledLoc && !date.scheduleCancelledLoc) {
					date.capturedLoc = UtilDate.formatDate(new Date());
					date.capturedUTC = UtilDate.getUTCDateTimeStr(UtilDate.getDateObj(date.capturedLoc), 'noZ');
				}
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in ActivityUtil.checkNSet_ActivityDates, ' + errMsg);
	}
};

// fieldName - 'scheduledLoc'
ActivityUtil.adjustScheduleDate_businessDay = function (date, fieldName, scheduleDateAdjust) {
	try {
		var sDate = moment(date[fieldName]);
		var bChanged = false;

		// Walk through the days and go until it is not weekend & holidays.
		while (ActivityUtil.isWeekends(sDate, scheduleDateAdjust) || ActivityUtil.isHoliday(sDate, scheduleDateAdjust)) {
			sDate.add(1, 'days');
			bChanged = true;
		};

		if (bChanged) date[fieldName] = Util.formatDate(sDate.toDate());

	}
	catch (errMsg) {
		console.log('ERROR on ActivityUtil.adjustScheduleDate_businessDay, ' + errMsg);
	}
};

ActivityUtil.isWeekends = function (sDate, scheduleDateAdjust) {
	var isCase = false;

	try {
		var weekends = scheduleDateAdjust.weekends;
		if (weekends && weekends.length > 0) {
			var dayOfWeek_3Str = sDate.format('ddd');

			if (weekends.indexOf(dayOfWeek_3Str) >= 0) isCase = true;
		}
	}
	catch (errMsg) {
		console.log('ERROR during ActivityUtil.isWeekends, ' + errMsg);
	}

	return isCase;
};


ActivityUtil.isHoliday = function (sDate, scheduleDateAdjust) {
	var isCase = false;

	try {
		var holidays = scheduleDateAdjust.holidays;
		if (holidays) {
			var year = sDate.year();

			var yearHolidays = holidays[year.toString()];

			if (yearHolidays && yearHolidays.length > 0) {
				var dateStr = sDate.format('MM-DD');

				if (yearHolidays.indexOf(dateStr) >= 0) isCase = true;
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR during ActivityUtil.isHoliday, ' + errMsg);
	}

	return isCase;
};


// 'payloadDefJson' and 'actionDefJson' could be same or different.
ActivityUtil.generateFormsJsonData_ByType = function (payloadDefJson, actionDefJson, formDivSecTag) {
	var formsJson = {};
	var formsJsonGroup = {};

	if (payloadDefJson) {
		// If payloadVersion is undefined or "1", it is version 1 (default one)
		if (!payloadDefJson.payloadVersion || payloadDefJson.payloadVersion === "1") {
			formsJson = ActivityUtil.generateInputJson(formDivSecTag, actionDefJson.payloadBody, formsJsonGroup);
		}
		else if (payloadDefJson.payloadVersion === "2") {
			formsJson = ActivityUtil.generateInputTargetPayloadJson(formDivSecTag, actionDefJson.payloadBody);
		}


		// Merge the formsJson data defined (If) on Action Definition Json
		ActivityUtil.mergeFormsJson_ActionDef(formsJson, actionDefJson);


		// If payload is template one, create template json based on version 1 'formsJson'
		// If payloadVersion 2 is created, skip the template usage.  They are not compatible.
		if (payloadDefJson.payloadVersion !== "2" && payloadDefJson.payloadTemplate) {
			var blockInfo = ActivityUtil.getBlockInfo_Attr(formDivSecTag.closest('div.block'));
			var createdDT = new Date();		// Should we match this with activityDataManager.generatePayload...
			formsJson = PayloadTemplateHelper.generatePayload(createdDT, formsJson, formsJsonGroup, blockInfo, payloadDefJson.payloadTemplate, payloadDefJson.INFO_Var);
		}
	}

	return formsJson;
};


// 'payloadDefJson' and 'actionDefJson' could be same or different.
ActivityUtil.generateFormsJsonArr = function (formDivSecTag) {
	var formsJson = [];

	formDivSecTag.find('.dataValue').each(function () {
		var inputFieldTag = $(this);
		var displayValueFieldTag = inputFieldTag.parent().find(".displayValue");
		formsJson.push({
			"name": inputFieldTag.attr("name"),
			"value": FormUtil.getTagVal(inputFieldTag),
			"displayValue": FormUtil.getTagVal(displayValueFieldTag)
		});
	});

	return formsJson;
};


ActivityUtil.generateFormsJson = function (formDivSecTag) {
	var formsJson = {};

	if (formDivSecTag) {
		formDivSecTag.find('.dataValue').each(function () {
			var inputFieldTag = $(this);
			var nameId = inputFieldTag.attr("name");

			formsJson[nameId] = FormUtil.getTagVal(inputFieldTag);
		});
	}

	return formsJson;
};

ActivityUtil.mergeFormsJson_ActionDef = function (formsJson, actionDefJson) {
	if (actionDefJson.formsJsonInsert) Util.mergeJson(formsJson, actionDefJson.formsJsonInsert);

	if (actionDefJson.voucherStatus) formsJson.voucherStatus = actionDefJson.voucherStatus;
};


ActivityUtil.getBlockInfo_Attr = function (blockDivTag) {
	var blockInfo = { 'activityType': '' };

	if (blockDivTag) {
		var activityType = blockDivTag.attr('activityType');

		if (activityType) {
			blockInfo.activityType = activityType;
		}

		// If clientCard exists above the block, get the clientId (we can even add entire clientJson if needed later)
		var clientCardTag = blockDivTag.closest('.client[itemid]');
		if (clientCardTag.length > 0) {
			blockInfo.clientId = clientCardTag.attr('itemid');
		}
	}

	return blockInfo;
};


ActivityUtil.generateInputJsonByType = function (clickActionJson, formDivSecTag, formsJsonGroup) {
	var inputsJson;

	// generate inputsJson - with value assigned...
	if (clickActionJson.payloadVersion === "2") {
		inputsJson = ActivityUtil.generateInputTargetPayloadJson(formDivSecTag, clickActionJson.payloadBody);
	}
	else {
		inputsJson = ActivityUtil.generateInputJson(formDivSecTag, clickActionJson.payloadBody, formsJsonGroup);
	}

	// TODO: TRY TO UNDERSTAND THE reason for this..
	// Voucher Status add to payload - if ( clickActionJson.voucherStatus ) 
	inputsJson.voucherStatus = clickActionJson.voucherStatus;

	return inputsJson;
};


ActivityUtil.generateInputJson = function (formDivSecTag, listFilter, formsJsonGroup) {
	// Input Tag values
	var inputsJson = {};
	var inputTags = formDivSecTag.find('.dataValue');
	//var inputTags = formDivSecTag.find( '.fieldBlock' );

	inputTags.each(function () {
		var inputTag = $(this);
		var divfieldBlockTag = inputTag.closest('.fieldBlock');
		var displayed = divfieldBlockTag.is(':visible');

		var nameVal = inputTag.attr('name');
		var dataGroup = inputTag.attr('dataGroup');


		var displayGroup = inputTag.attr('frmGroup');


		// Process visible fieldBlocks only.  But if the hidden fieldBlock has 'display=hiddenVal', also use that to collect data.
		if (displayed || divfieldBlockTag.attr('display') === 'hiddenVal') {
			// Check if 'filteredList' exists.  If exists, we need to limit by nameVal that is in the filteredList only.
			if (!listFilter || listFilter.indexOf(nameVal) >= 0) {
				var val = FormUtil.getTagVal(inputTag);
				if (val === null || val === undefined) val = '';

				if (formsJsonGroup) {
					// NOTE: If grouping for input data exists (by '.' in name or 'dataGroup' attr)
					// Add to 'formsJsonGroup' object - to be used in payloadTemplate
					// Also, if '.' in name exists, extract 1st one as groupName and use rest of it as nameVal.
					nameVal = ActivityUtil.setFormsJsonGroup_Val(nameVal, val, dataGroup, formsJsonGroup);
				}

				inputsJson[nameVal] = val;
			}
		}
	});

	return inputsJson;
};


ActivityUtil.generateInputJson_ForPreview = function (formDivSecTag) {
	// Input Tag values
	var inputsJson = {};
	var inputTags = formDivSecTag.find('input,checkbox,select');

	inputTags.each(function () {
		var inputTag = $(this);
		var nameVal = inputTag.attr('name');

		if (inputTag.is(':visible')) {
			var val = FormUtil.getTagVal(inputTag);

			inputsJson[nameVal] = val;
		}
	});

	return inputsJson;
};


ActivityUtil.setFormsJsonGroup_Val = function (nameVal, val, dataGroup, formsJsonGroup) {
	// NOTE: If grouping for input data exists (by '.' in name or 'dataGroup' attr)
	// Add to 'formsJsonGroup' object - to be used in payloadTemplate
	// Also, if '.' in name exists, extract 1st one as groupName and use rest of it as nameVal.

	try {
		// if '.' has in 'nameVal', mark it as group..
		if (nameVal.indexOf('.') > 0) {
			var splitNames = nameVal.split('.');
			var groupName = splitNames[0];
			nameVal = nameVal.substr(groupName.length + 1);  // THIS ALSO AFFECTS BELOW inputsJson nameVal as well.

			if (!formsJsonGroup[groupName]) formsJsonGroup[groupName] = {};

			formsJsonGroup[groupName][nameVal] = val;
		}

		// if dataGroup exists, put it ..
		if (dataGroup) {
			// if multiple dataGroups are listed
			if (dataGroup.indexOf(',') > 0) {
				var arrDataGroup = dataGroup.split(',');

				for (var g = 0; g < arrDataGroup.length; g++) {
					var thisDataGroup = arrDataGroup[g];

					if (!formsJsonGroup[thisDataGroup]) formsJsonGroup[thisDataGroup] = {};

					formsJsonGroup[thisDataGroup][nameVal] = val;
				}
			}
			else {
				if (!formsJsonGroup[dataGroup]) formsJsonGroup[dataGroup] = {};

				formsJsonGroup[dataGroup][nameVal] = val;
			}

		}
	}
	catch (errMsg) {
		console.log('Error in ActivityUtil.setFormsJsonGroup_Val, errMsg: ' + errMsg);
	}

	return nameVal;
};


ActivityUtil.generateInputTargetPayloadJson = function (formDivSecTag, getValList) {
	var inputsJson = {};
	var inputTags = formDivSecTag.find('.dataValue'); // < why not .dataValue? ( 'input,checkbox,select' )
	var inputTargets = [];
	var uniqTargs = [];

	if (inputTags.length) {
		inputTags.each(function () {
			var inputTag = $(this);
			var attrDataTargets = inputTag.attr('datatargets');

			if (attrDataTargets) {
				var val = FormUtil.getTagVal(inputTag);

				if (val != null && val != '') {
					var dataTargs = JSON.parse(unescape(attrDataTargets));
					var newPayLoad = { "name": $(inputTag).attr('name'), "value": val, "dataTargets": dataTargs };

					inputTargets.push(newPayLoad);

					Object.keys(dataTargs).forEach(function (key) {

						if (!uniqTargs.includes(key)) {
							uniqTargs.push(key);
						}

					});
				}

			}

		});

		uniqTargs.sort();
		uniqTargs.reverse();

		// BUILD new template payload structure (based on named target values)
		for (var t = 0; t < uniqTargs.length; t++) {
			var dataTargetHierarchy = (uniqTargs[t]).toString().split('.');

			// initialize with item at position zero [0]
			ActivityUtil.recursiveJSONbuild(inputsJson, dataTargetHierarchy, 0);
		}

		// FILL/populate new template payload structure (according to named inputTarget destinations)
		for (var t = 0; t < inputTargets.length; t++) {
			Object.keys(inputTargets[t].dataTargets).forEach(function (key) {

				var dataTargetHierarchy = (key).toString().split('.');

				// initialize with item at position zero [0]
				ActivityUtil.recursiveJSONfill(inputsJson, dataTargetHierarchy, 0, inputTargets[t].dataTargets[key], inputTargets[t].value);

			});

		}

		inputsJson['userName'] = SessionManager.sessionData.login_UserName;
		inputsJson['password'] = SessionManager.sessionData.login_Password;
	}

	return inputsJson;
};


ActivityUtil.recursiveJSONbuild = function (targetDef, dataTargetHierarchy, itm) {
	// construct empty 'shell' of payload design structure
	if (dataTargetHierarchy[itm]) {
		if ((dataTargetHierarchy[itm]).length && !targetDef.hasOwnProperty(dataTargetHierarchy[itm])) {
			// check if next item exists > if true then current item is object ELSE it is array (destination array for values)
			if (dataTargetHierarchy[itm + 1] || (dataTargetHierarchy[itm]).toString().indexOf('[') < 0) {
				targetDef[dataTargetHierarchy[itm]] = {};
			}
			else {
				var arrSpecRaw = ((dataTargetHierarchy[itm]).toString().split('[')[1]).replace(']', '');
				targetDef[(dataTargetHierarchy[itm]).toString().replace('[' + arrSpecRaw + ']', '')] = [];
			}
		}
		ActivityUtil.recursiveJSONbuild(targetDef[dataTargetHierarchy[itm]], dataTargetHierarchy, parseInt(itm) + 1)
	}
	else {
		return targetDef;
	}
};


ActivityUtil.recursiveJSONfill = function (targetDef, dataTargetHierarchy, itm, fillKey, fillValue) {
	// fill/populate the payload
	if (itm < (dataTargetHierarchy.length - 1)) {
		ActivityUtil.recursiveJSONfill(targetDef[dataTargetHierarchy[itm]], dataTargetHierarchy, parseInt(itm) + 1, fillKey, fillValue)
	}
	else {
		var arrSpecRaw = '';
		var arrSpecArr = [];

		if ((dataTargetHierarchy[itm]).toString().indexOf('[') >= 0) {
			arrSpecRaw = ((dataTargetHierarchy[itm]).toString().split('[')[1]).replace(']', '');
			arrSpecArr = arrSpecRaw.split(':');

			if ((arrSpecRaw.indexOf(':') < 0) || (arrSpecRaw.length > 0 && arrSpecArr.length > 2)) arrSpecArr = [];
		}

		var dataTargetKeyItem = (dataTargetHierarchy[itm]).toString().replace('[' + arrSpecRaw + ']', '');
		var dataValue = ((fillValue.toString().indexOf('{') >= 0) && (fillValue.toString().indexOf('}') >= 0) ? JSON.parse(fillValue) : fillValue);

		if ((dataTargetKeyItem).length && targetDef.hasOwnProperty(dataTargetKeyItem)) {
			if (Array.isArray(targetDef[dataTargetKeyItem])) {
				if (arrSpecArr.length) {
					targetDef[dataTargetKeyItem].push({ [arrSpecArr[0].trim()]: fillKey, [arrSpecArr[1].trim()]: dataValue });
				}
				else {
					targetDef[dataTargetKeyItem].push({ [fillKey.trim()]: dataValue });
				}
			}
			else {
				targetDef[dataTargetKeyItem][fillKey] = dataValue;
			}
		}
		else if ((dataTargetKeyItem).length == 0) {
			if (Array.isArray(targetDef[dataTargetKeyItem])) {
				if (arrSpecArr.length) {
					targetDef[dataTargetKeyItem].push({ [arrSpecArr[0].trim()]: fillKey, [arrSpecArr[1].trim()]: dataValue });
				}
				else {
					targetDef[dataTargetKeyItem].push({ [fillKey.trim()]: dataValue });
				}
			}
			else {
				targetDef[fillKey] = dataValue;
			}

		}
	}
};


// ===========================================================
// ====== Activity Preview Realted ============


ActivityUtil.handlePayloadPreview = function (previewPrompt, formDivSecTag, btnTag, callBack) {
	// formDefinition, 
	if (previewPrompt === "true") {
		try {
			var dataPass = ActivityUtil.generateInputPreviewJson(formDivSecTag);

			// TODO: Do we have to hide the formDiv Tag?
			formDivSecTag.hide();
			btnTag.hide();

			var titleTag = $('<label term="payloadPreview_title">Please check before confirm</label>')
			MsgManager.confirmPayloadPreview(formDivSecTag.parent(), dataPass, titleTag, function (confirmed) {
				formDivSecTag.show();
				btnTag.show();

				if (confirmed) {
					if (callBack) callBack(true);
				}
				else {
					if (callBack) callBack(false);
				}

			});
		}
		catch (errMsg) {
			throw "Failed during preview create: " + errMsg;
		}
	}
	else {
		if (callBack) callBack(true);
	}
};


// NEW: NOT USED, NOT YET IMPLEMENTED FULLY
ActivityUtil.handlePayloadPreview_New = function (previewPrompt, formDivSecTag, btnTag, callBack) {
	if (previewPrompt === "true") {
		// Use InputsJson data to populate 'Preview'
		var inputsJson_visible = ActivityUtil.generateInputJson_ForPreview(formDivSecTag);
		// vs ActivityUtil.generateInputPreviewJson = function( formDivSecTag, getValList )

		// Desired: Array of { name: '', type: '', values: [] } per inputField
		var previewData_JsonArr = ActivityUtil.generatePreviewDataArray(inputsJson_visible, formConfig);

		// Change this as well..
		MsgManager.confirmPayloadPreview(dataPass, $('<label term="payloadPreview_title">Please check before Confirm</label>'), function (confirmed) {

			if (callBack) callBack(confirmed);
		});
	}
	else {
		if (callBack) callBack(true);
	}
};


// NEW: NOT USED, NOT YET IMPLEMENTED FULLY
ActivityUtil.previewActivityJson = function (inputsJson, callBack) {
	var formConfig = {};  // <-- Get this from 'processing' formConfigId & ConfigService.getConfigJson();

	var previewData_JsonArr = ActivityUtil.generatePreviewDataArray(inputsJson, formConfig);

	MsgManager.confirmPayloadPreview(dataPass, $('<label term="payloadPreview_title">Please check before Confirm</label>'), function (confirmed) {

		if (callBack) callBack(confirmed);
	});
};


ActivityUtil.generateInputPreviewJson = function (formDivSecTag) {
	// Input Tag values
	var retDataArray = {};

	var tags = formDivSecTag.find('.dataValue, .section'); // Get fields and GROUP names

	tags.each(function () {
		var tag = $(this);
		var displayed = (tag.hasClass("section")) ? tag.is(':visible') : tag.closest('.fieldBlock').is(':visible');

		if (displayed) {

			if (tag.hasClass("section")) {
				var name = "--SECTION" + tag.index();
				var value = tag.find("label").html();

				retDataArray[name] = value;
			}
			else {
				var labelTag = $(tag[0]).closest("div.fieldBlock").find("label");
				var name = (labelTag) ? labelTag.html() : tag[0].name;
				var value = ActivityUtil.getTagText(tag);

				retDataArray[name] = value;
			}

		}
	});

	return retDataArray;
};

ActivityUtil.getTagText = function (entryTag) {
	var displayValue = FormUtil.getTagVal(entryTag);

	if (entryTag.prop("nodeName") == "SELECT") {
		displayValue = entryTag.find("option:selected").text();
	}
	else {
		var fieldBlockTag = entryTag.closest("div.fieldBlock");
		var displayValueTag = fieldBlockTag.find(".displayValue");

		if (displayValueTag.length == 1) {
			displayValue = FormUtil.getTagVal(displayValueTag)
		}
		else // if( entryTag.attr("type") == "checkbox" || entryTag.attr("type") == "radio" ) 
		{
			var dataValueTag = fieldBlockTag.find(".dataValue");
			var selectedValues = FormUtil.getTagVal(dataValueTag).split(",");

			// only run this concatenation IF multiple display values are found + no 'dataValue' is already loaded with data
			// GREG: not sure if this is still relevant, as `id='opt_" + selectedValues[i] + "` has changed to include random ID < review with James (2020-10-12)
			if (selectedValues.length > 1 && displayValue.length == 0) {
				var displayValues = [];
				for (var i = 0; i < selectedValues.length; i++) {
					displayValues.push(fieldBlockTag.find("input[id='opt_" + selectedValues[i] + "']").closest("div").find("label").text());
				}

				if (displayValues.length != 0) {
					displayValue = displayValues.join(",");
				}
			}
		}
	}

	return displayValue;
}
// ===========================================================


// Not yet used..
ActivityUtil.setInputsJson = function (activityJson, inputsJson) {
	activityJson.inputsJson = inputsJson;
};


ActivityUtil.getActivityList = function () {
	return ActivityUtil.activityList;
};

ActivityUtil.clearActivity = function () {
	ActivityUtil.activityList = [];
};
