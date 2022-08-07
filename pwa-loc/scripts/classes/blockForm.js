// -------------------------------------------
// -- BlockForm Class/Methods
//
//  1. render groups + controls
//    1.1 layouts + defaultValues + eventHandlers
//    1.2 load passed dataValues
//  2. handle calculatedFields (inside eventHandlers)
//  3. handle validations

function BlockForm(cwsRenderObj, blockObj, actionJson) {
	var me = this;

	me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	me.actionJson = actionJson;
	me.payloadConfigSelection = (actionJson) ? actionJson.payloadConfig : undefined;

	me.formDef_fieldsArr;   // formDef (from config) which is array of fields
	me.fieldDefsJson = {};  // fieldDef (from config) by Id..

	me.evalFunctionsToProcess;

	me._childTargetActionDelay = 300; // TODO: TEST FOR LESS?  200?
	me._groupNoneId = 'zzzGroupNone';

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function () { };

	// -------------------

	// NOTE: render() should do - clear previous tags, and create tags newly.
	//	- All the tag html should be placed on top as tagTemplate (See 'blockList.js' as example )
	me.render = function (formDef, blockTag, passedData) {

		// TODO:
		// 		ADD FORM FIELDS ARRAY COMBINING HERE!!

		// 1. Set formDefinition variables (from Config)
		var formDef_fieldsArr = FormUtil.getObjFromDefinition(formDef, ConfigManager.getConfigJson().definitionForms);
		formDef_fieldsArr = ConfigManager.filterList_ByCountryFilter(formDef_fieldsArr);
		me.formDef_fieldsArr = formDef_fieldsArr;


		me.evalFunctionsToProcess = me.getEvalFormulas();


		if (formDef_fieldsArr !== undefined) {
			var formDivSecTag = $('<div class="formDivSec"></div>');
			var autoComplete = ConfigManager.staticData.autoComplete;
			var formTag = $('<form autocomplete="' + autoComplete + '"></form>');

			formDivSecTag.append(formTag);
			blockTag.append(formDivSecTag);


			// STEP #1. Generate input tags by defitnion.
			// NOTE: JAMES: STOPPED WORKING AT HERE <--- ADDED 'groupId' on return 'formFieldGroups'
			//   Organizing new data with group info seems to be creatinng a lot of issues..  Bad idea.. 
			var fieldDataNew_wtGrp = me.setNewFormData_wtGroupInfo(formDef_fieldsArr, ConfigManager.getConfigJson().definitionFormGroups);
			var groupsCreated = [];

			fieldDataNew_wtGrp.forEach(fieldData => {
				try {
					var groupDivTag = me.getGroupTag(fieldData, groupsCreated, formTag);  // create group tag if not exists..
					var fieldDef = fieldData.item;

					// NOT GOOD: - Save the field definition by fieldId for using it in 'me.populateFieldsData()'
					me.fieldDefsJson[fieldDef.id] = fieldDef;

					var inputFieldTag = me.createInputFieldTag(fieldDef, me.payloadConfigSelection, formTag, passedData, formDef_fieldsArr, autoComplete);
					if (inputFieldTag) groupDivTag.append(inputFieldTag);

					// TODO: Why do we append it again?  Does not make sense...  Change the code..
					formTag.append(groupDivTag);
				}
				catch (errMsg) {
					var tempErrMsg = 'FAILED to render field, ' + JSON.stringify(fieldData) + ', errMsg: ' + errMsg;
					console.log(errMsg);
					MsgManager.msgAreaShow(tempErrMsg, 'ERROR');
				}
			});


			// STEP #2. Value populate to field, set validation event, trigger change for fields with value, viewOnlyMode
			Validation.disableValidation(function () {
				me.populateFormData(passedData, formTag);
				me.formGroupTitleDisplaySet(formTag);

				// NOTE: TRAN VALIDATION
				Validation.setUp_Events(formTag);

				//NOTE (Greg): 500ms DELAY SOLVES PROBLEM OF CALCULATED DISPLAY VALUES BASED ON FORM:XXX VALUES
				//NOTE (2020/07/22): added sort logic to underlying calculationEval so that 'complex' formulas run last
				setTimeout(function () {
					me.defaultValEval(formTag, me.evalFunctionsToProcess);
				}, 500);


				// Run change event of dataValue tag in case there are some default Values which can required to show/hide some fields in form				
				me.fieldsWtValue_ChangeEvent(formDivSecTag); // formDivSecTag.find('.dataValue:not(:empty)').change(); // * BUG > only highlights SELECT controls

				// View Only Mode
				me.setForm_ViewOnlyMode(me.blockObj, blockTag);
			});


			// STEP #3. Run for translation 
			TranslationManager.translatePage();
		}
	};


	me.fieldsWtValue_ChangeEvent = function (formDivSecTag) {
		var fieldTags = formDivSecTag.find('.dataValue');

		fieldTags.each(function () {
			var tag = $(this);
			var tagVal = FormUtil.getTagVal(tag);
			var fieldDef = me.getFieldDef_ByFieldTag(tag);

			// For fields input/select tags that has value (.dataValue), run changes
			if (tagVal !== '' || fieldDef.evalActions_wtEmptyVal) tag.change();
		});
	};


	me.setForm_ViewOnlyMode = function (blockObj, blockTag) {
		// NEW: block viewMode - Temporary?
		var blockDefOption = blockObj.blockDefJson.option;
		if (blockDefOption) {
			if (blockDefOption.formDisplay === 'viewMode') {
				var fieldTags = blockTag.find('div.fieldBlock');

				FormUtil.disableFieldTags(fieldTags, { clientViewMode: true });

				fieldTags.filter('[display=none]').show();
			}
		}
	};


	me.getGroupTag = function (formFieldGroup, groupsCreated, formTag) {
		var groupDivTag = formTag;

		if (formFieldGroup.group) {
			if (!groupsCreated.includes(formFieldGroup.group)) {
				groupDivTag = $('<div class="formGroupSection" name="' + formFieldGroup.group + '"><div class="section"><label term="' + formFieldGroup.groupTerm + '">' + formFieldGroup.group + '</label></div></div>');
				formTag.append(groupDivTag);
				groupsCreated.push(formFieldGroup.group);
			}
			else {
				//do nothing: group already exists
				groupDivTag = $(formTag).find('div[name="' + formFieldGroup.group + '"]');
			}
		}
		else {
			// JAMES NOTE: THIS NEVER GETS CALLED? (Due to 'noGroup' used..)  <-- ASK GREG TO TEST THIS PART!!!

			// TRAN TODO : NEED TO do something about it
			if (formFieldGroup.group.length === 0) {
				if (!groupsCreated.includes(me._groupNoneId)) {
					groupDivTag = $('<div style="" class="formGroupSection" name="' + me._groupNoneId + '"></div>');

					formTag.append(groupDivTag);
					groupsCreated.push(me._groupNoneId);
				}
				else {
					groupDivTag = $(formTag).find('div[name="' + me._groupNoneId + '"]');
				}
			}
			else {
				groupDivTag = formTag;
			}
		}

		return groupDivTag;
	};

	me.formGroupTitleDisplaySet = function (formDivSecTag) {
		formDivSecTag.find('div.formGroupSection').each(function () {
			var formGroupSectionTag = $(this);

			if (formGroupSectionTag.find('div.fieldBlock :visible').length === 0) {
				formGroupSectionTag.find('> div.section').hide();
			}
		});
	};


	// =============================================
	// Render INPUT fields

	me.createInputFieldTag = function (fieldDef, payloadConfigSelection, formDivSecTag, passedData, formDef_fieldsArr, autoComplete) {
		var controlType = fieldDef.controlType;
		var divInputFieldTag;

		try {
			if (controlType == "INT" || controlType == "SHORT_TEXT") {
				divInputFieldTag = me.createStandardInputFieldTag(fieldDef, autoComplete);
			}
			else if (controlType == "DROPDOWN_LIST") {
				divInputFieldTag = me.createDropDownEntryTag(fieldDef);
			}
			else if (controlType == "LABEL") {
				divInputFieldTag = me.createLabelFieldTag(fieldDef);
			}
			else if (controlType == "IMAGE") {
				divInputFieldTag = me.createImageTag(fieldDef);
			}
			else if (controlType == "YEAR") {
				divInputFieldTag = me.createYearFieldTag(fieldDef, autoComplete);
			}
			else if (controlType == "DATE") {
				divInputFieldTag = me.createDateFieldTag(fieldDef, formDivSecTag);
			}
			else if (controlType == "TIME") {
				divInputFieldTag = me.createTimeFieldTag(fieldDef, formDivSecTag);
			}
			else if (controlType == "TIME2") {
				divInputFieldTag = me.createTime2FieldTag(fieldDef, formDivSecTag);
			}
			else if (controlType == "DROPDOWN_AUTOCOMPLETE") // "RADIO_DIALOG"
			{
				divInputFieldTag = me.createRadioDialogFieldTag(fieldDef);
			}
			else if (controlType == "RADIO") {
				divInputFieldTag = me.createRadioFieldTag(fieldDef);
			}
			else if (controlType == "CHECKBOX") {
				divInputFieldTag = me.createCheckboxFieldTag(fieldDef);
			}
			else if (controlType == "MULTI_CHECKBOX") // "CHECKBOX_DIALOG"
			{
				divInputFieldTag = me.createCheckBoxDialogFieldTag(fieldDef);
			}
			else {
				divInputFieldTag = me.createStandardInputFieldTag(fieldDef, autoComplete);
				MsgManager.msgAreaShow('field "' + fieldDef.id + '" config controlType not proper.', 'ERROR');
			}

			if (divInputFieldTag) {
				var entryTag = divInputFieldTag.find('.dataValue');

				if (divInputFieldTag !== undefined && entryTag.length > 0) // LABEL don't have "dataValue" clazz
				{
					if (fieldDef.scanQR != undefined && fieldDef.scanQR) {
						me.createScanQR(divInputFieldTag, entryTag);
					}

					// Set defaultValue if any
					FormUtil.setTagVal(entryTag, fieldDef.defaultValue);

					// For payloadConfigSelection, save the selection inside of the config for easier choosing..
					me.setfieldDef_DefaultValue_PayloadConfigSelection(fieldDef, payloadConfigSelection);

					// Setup events and visibility and rules
					var formFull_IdList = me.getIdList_FormJson(formDef_fieldsArr);

					// Set change event and rules on input tags
					me.setEventsAndRules(fieldDef, entryTag, divInputFieldTag, formDivSecTag, formFull_IdList);


					// Set InputFieldTag visibility based on: config setting - display 'hiddenVal/none', or hide/show case
					me.setFieldTagVisibility(fieldDef, divInputFieldTag, passedData);  // This method might have to move outside of if case - if not related to 'entry.length'
				}
			}
		}
		catch (errMsg) {
			MsgManager.msgAreaShow('field "' + fieldDef.id + '" failed to create tag.', 'ERROR');
		}

		return divInputFieldTag;
	};


	me.createScanQR = function (divInputFieldTag, entryTag) {
		var QRiconTag = $('<img src="images/qr.svg" class="qrButton" >');

		QRiconTag.click(function () {
			var qrData = new readQR(entryTag);
		});

		divInputFieldTag.find('.field__left').append(QRiconTag);
		entryTag.addClass('qrInput');

	}

	me.createStandardInputFieldTag = function (fieldDef, autoComplete) {
		var divInputFieldTag = me.createInputFieldTag_Standard(fieldDef);

		var entryTag = $('<input name="' + fieldDef.id + '" type="text" autocomplete="' + autoComplete + '" class="dataValue displayValue" />');
		me.addAttrUidDataGroup(entryTag, fieldDef);

		divInputFieldTag.find('div.field__left').append(entryTag);

		return divInputFieldTag;
	}

	me.addAttrUidDataGroup = function (entryTag, fieldDef) {
		if (fieldDef.uid) entryTag.attr('uid', fieldDef.uid);
		if (fieldDef.dataGroup) entryTag.attr('dataGroup', fieldDef.dataGroup);
	};

	me.createInputFieldTag_Standard = function (fieldDef) {
		// Create tag
		var divInputFieldTag = $(Templates.inputFieldStandard);

		// Label
		divInputFieldTag.find('label.displayName').attr('term', fieldDef.term).text(fieldDef.defaultName);

		return divInputFieldTag;
	};

	me.createDropDownEntryTag = function (fieldDef) {
		// Create tag
		var divInputFieldTag = me.createInputFieldTag_Standard(fieldDef);

		// Remove standard css class "field__left", add "field__selector" class
		divInputFieldTag.find(".field__left").removeClass('field__left').addClass('field__selector');

		// Get and resolve options
		var optionList = FormUtil.getObjFromDefinition(fieldDef.options, ConfigManager.getConfigJson().definitionOptions);
		Util.decodeURI_ItemList(optionList, "defaultName");

		// Populate options
		var entryTag = $('<select name="' + fieldDef.id + '" options="' + fieldDef.options + '" class="dataValue displayValue" />');
		me.addAttrUidDataGroup(entryTag, fieldDef);

		Util.populateSelect_newOption(entryTag, optionList, { "name": "defaultName", "val": "value" });

		// When changed/selected, the focus is removed(blured), so that arrow image is switched (defined in css, focus)
		entryTag.on('change', function () {
			$(this).blur();
		});

		divInputFieldTag.find('div.field__selector').append(entryTag);

		return divInputFieldTag;
	}

	me.createRadioDialogFieldTag = function (fieldDef) {
		var divInputFieldTag = $(Templates.inputFieldStandard);
		divInputFieldTag.find('label.displayName').attr('term', fieldDef.term).text(fieldDef.defaultName);

		// Greg1-radio [review]
		var uniqueId = Util.generateRandomId(8);
		divInputFieldTag.attr('uniqueID', uniqueId);


		var showEntryForm = $('<input name="displayValue_' + fieldDef.id + '" type="text"  READONLY class="displayValue" />'); //	Input for to be shown in the app
		var entryTag = $('<input name="' + fieldDef.id + '" type="hidden" class="dataValue" />');
		me.addAttrUidDataGroup(entryTag, fieldDef);

		divInputFieldTag.find('div.field__left').append(showEntryForm);
		divInputFieldTag.find('div.field__left').append(entryTag);

		showEntryForm.on('click', function () {
			me.createSearchOptions_Dialog(divInputFieldTag, fieldDef, 'radio');
		});

		// Set DEFAULT display value if any
		me.setDefaultValue_DialogFieldTag(divInputFieldTag, fieldDef);

		return divInputFieldTag;
	}


	me.createCheckBoxDialogFieldTag = function (fieldDef) {
		var divInputFieldTag = $(Templates.inputFieldStandard); //Templates.inputFieldCheckbox

		divInputFieldTag.find('label.displayName').attr('term', fieldDef.term).text(fieldDef.defaultName);

		var showEntryForm = $('<input name="displayValue_' + fieldDef.id + '" type="text"  READONLY class="displayValue" />'); //	Input for to be shown in the app
		var entryTag = $('<input name="' + fieldDef.id + '" id="' + fieldDef.id + '" type="hidden" class="dataValue" />');
		me.addAttrUidDataGroup(entryTag, fieldDef);

		divInputFieldTag.find('div.field__left').append(showEntryForm);
		divInputFieldTag.find('div.field__left').append(entryTag);

		showEntryForm.on('click', function () {
			me.createSearchOptions_Dialog(divInputFieldTag, fieldDef, 'checkbox');
		});

		// Set DEFAULT display value if any
		me.setDefaultValue_DialogFieldTag(divInputFieldTag, fieldDef);

		return divInputFieldTag;
	}

	me.setDefaultValue_DialogFieldTag = function (divInputFieldTag, fieldDef) {
		if (fieldDef.defaultValue != undefined) {
			var defaultValueList = fieldDef.defaultValue.split(",");
			var optionList = FormUtil.getObjFromDefinition(fieldDef.options, ConfigManager.getConfigJson().definitionOptions);
			var displayTag = divInputFieldTag.find(".displayValue");
			var displayValues = [];


			for (var i = 0; i < optionList.length; i++) {
				var optionConfig = optionList[i];
				if (defaultValueList.includes(optionConfig.value)) {
					var displayValue = TranslationManager.translateText(optionConfig.defaultName, optionConfig.poTerm);
					displayValues.push(displayValue);
				}
			}

			displayTag.val(displayValues.join(","));
		}
	};


	me.createLabelFieldTag = function (fieldDef) {
		var divInputFieldTag = $(Templates.labelField);

		divInputFieldTag.html(fieldDef.defaultName).attr('term', fieldDef.term);

		return divInputFieldTag;
	}

	// TRAN : NEED TO UNDERSTAND HOW THIS FIELD EXPECT TO WORK
	me.createImageTag = function (fieldDef) {
		// Create tag
		var divInputFieldTag = me.createInputFieldTag_Standard(fieldDef);

		// Add input to display image if the image has payload
		var entryTag = $('<input name="' + fieldDef.id + '" type="hidden" class="dataValue" />');
		me.addAttrUidDataGroup(entryTag, fieldDef);

		divInputFieldTag.find('div.field__left').append(entryTag);

		// IMAGE
		var imgDivTag = $('<div class="imgQRInput"></div>');
		var imgDisplay = $('<img name="' + fieldDef.id + '" style="' + fieldDef.imageSettings + '" src="" class="displayValue">');
		imgDivTag.append(imgDisplay);

		divInputFieldTag.find('div.field__left').append(imgDivTag);

		return divInputFieldTag;
	}

	// NEED TO SEE HOW IT WORKS
	me.createYearFieldTag = function (fieldDef, autoComplete) {
		var divInputFieldTag = me.createInputFieldTag_Standard(fieldDef);

		var yearFieldTag = $(Templates.inputFieldYear);
		divInputFieldTag.find(".field__left").append(yearFieldTag);

		var yearRange = fieldDef.yearRange;
		if (yearRange == undefined) {
			yearRange = { 'from': -100, 'to': 0 };
		}

		var data = []
		var curYear = (new Date()).getFullYear();

		for (var i = yearRange.from; i <= yearRange.to; i++) {
			var year = curYear + i;
			data.push({ value: year, text: year });
		}


		divInputFieldTag.find('input.dataValue').attr('name', fieldDef.id);
		divInputFieldTag.find('input.dataValue').attr('uid', fieldDef.uid);

		// Set DEFAULT for display field if any
		FormUtil.setTagVal(divInputFieldTag.find('input.displayValue'), fieldDef.defaultValue);
		divInputFieldTag.find('input.displayValue').attr('autocomplete', autoComplete);

		Util2.populate_year(yearFieldTag[0], data, TranslationManager.translateText(fieldDef.defaultName, fieldDef.term));

		return divInputFieldTag;
	}

	me.createDateFieldTag = function (fieldDef, formDivSecTag) {
		var wrapperDad = $('<div class="dateContainer"></div>');
		var wrapperInput = $('<div class="dateWrapper"></div>');
		var button = $('<button class="dateButton mouseDown"></button>');
		var icoCalendar = $('<img src="images/i_date.svg" class="imgCalendarInput" />');

		button.append(icoCalendar);

		var formatDate = me.getFormControlRule(fieldDef, "placeholder");
		var dtmSeparator = Util.getDateSeparator(formatDate);
		var formatMask = formatDate.split(dtmSeparator).reduce((acum, item) => {
			let arr = "";
			for (let i = 0; i < item.length; i++) {
				arr += "#";
			}
			acum.push(arr);
			return acum;
		}, []).join(dtmSeparator);

		// TODO: JAMES: ASK GREG TO CHECK THE USAGE..
		var entryTag = $('<input class="dataValue displayValue" data-mask="' + formatMask
			+ '" name="' + fieldDef.id + '" type="text" placeholder="' + formatDate + '" isDate="true" />');
		me.addAttrUidDataGroup(entryTag, fieldDef);

		wrapperInput.append(entryTag);
		wrapperDad.append(wrapperInput, button);

		FormUtil.setTagVal(entryTag, fieldDef.defaultValue);


		//function that call datepicker
		Maska.create(entryTag[0]);

		entryTag.click(e => e.preventDefault());


		me.getTagOfClick_DateTime(fieldDef, button).click(function (e) {
			//FormUtil.mdDatePicker( e, entryTag, formatDate, fieldDef.yearRange );
			FormUtil.mdDatePicker_New(e, formDivSecTag.find('[name=' + fieldDef.id + ']'), formatDate, fieldDef);
		});

		var divInputFieldTag = me.createInputFieldTag_Standard(fieldDef);
		divInputFieldTag.find(".field__left").append(wrapperDad);

		return divInputFieldTag;
	};


	// Depends on mobile or not, and config settings, we like to change the click target
	//		--> if 'input', then on focus, it will show the popup?
	me.getTagOfClick_DateTime = function (fieldDef, button) {
		var tagOfClick = button;

		var config_autoPopupOnMobile = ConfigManager.getSettings().datePickerAutoPopup_OnMobile;

		if (config_autoPopupOnMobile || fieldDef.datePickerAutoPopup_OnMobile) // auto popup on mobile view
		{
			if (Util.isMobi()) tagOfClick = button.parent();
		}

		return tagOfClick;
	};


	me.createTimeFieldTag = function (fieldDef, formDivSecTag) {
		var wrapperDad = $('<div class="dateContainer"></div>');
		var wrapperInput = $('<div class="dateWrapper"></div>');
		var button = $('<button class="dateButton mouseDown"></button>');
		var icoCalendar = $('<img src="images/i_date.svg" class="imgCalendarInput" />');

		button.append(icoCalendar);

		var formatDate = me.getFormControlRule(fieldDef, "placeholder");

		var entryTag = $('<input class="dataValue displayValue" name="' + fieldDef.id + '" type="text" placeholder="' + formatDate + '" isTime="true" />');
		me.addAttrUidDataGroup(entryTag, fieldDef);

		wrapperInput.append(entryTag);
		wrapperDad.append(wrapperInput, button);

		FormUtil.setTagVal(entryTag, fieldDef.defaultValue);


		entryTag.click(e => e.preventDefault());
		entryTag.change(function () {
			var entryVal = entryTag.val();
			//var timeStr = me.handleTimePM( entryVal );
			if (entryVal) entryTag.val(moment(entryVal, 'h:mm A').format('HH:mm'));
		});

		var tagOfClick = me.getTagOfClick_DateTime(fieldDef, button);

		tagOfClick.click(function (e) { e.preventDefault(); });


		var options = (fieldDef.timeOptions) ? fieldDef.timeOptions : {}
		options.events = {
			timeChanged: function (data) {
				if (data.value) entryTag.val(data.value).change();
			},
			shown: function () {
				me.applyInputTime(entryTag.val(), this);
			}
		};

		//  is24hour: false/true
		//  timeFormat: 'hh:mm:ss.000', // format of the time value (data-time attribute)
		//  format: 'h:mm tt', // format of the input value
		//  hourPadding: false,
		// var domTag = tagOfClick[0];

		mdtimepicker(tagOfClick[0], options);


		var divInputFieldTag = me.createInputFieldTag_Standard(fieldDef);
		divInputFieldTag.find(".field__left").append(wrapperDad);

		return divInputFieldTag;
	};

	me.applyInputTime = function (inputVal, timeObj) {
		try {
			if (inputVal) {
				var mt = moment(inputVal, 'hh:mm');
				timeObj.setHour(Number(mt.format('h')));
				timeObj.setMinute(Number(mt.format('mm')));
				timeObj.setPeriod(mt.format('A'));
			}
		}
		catch (errMsg) { console.log('ERROR in blockForm.getTimeFormattedJson, ' + errMsg); }
	};


	me.handleTimePM = function (inputVal) {
		try {
			if (inputVal) {
				if (inputVal.indexOf('PM'))
					var mt = moment(inputVal, 'hh:mm');
				timeObj.setHour(Number(mt.format('h')));
				timeObj.setMinute(Number(mt.format('mm')));
				timeObj.setPeriod(mt.format('A'));
			}
		}
		catch (errMsg) { console.log('ERROR in blockForm.handleTimePM, ' + errMsg); }
	};

	//var timeStr = me.handleTimePM( entryVal );
	//if ( entryVal ) entryTag.val( moment( entryVal, 'hh:mm' ).format( 'HH:mm' ) );	

	me.createTime2FieldTag = function (fieldDef, formDivSecTag) {
		wrapperDad = $('<div class="dateContainer"></div>');
		wrapperInput = $('<div class="dateWrapper"></div>');
		button = $('<button class="dateButton mouseDown"></button>');
		icoCalendar = $('<img src="images/i_date.svg" class="imgCalendarInput" />');

		button.append(icoCalendar);

		var formatDate = me.getFormControlRule(fieldDef, "placeholder");

		// TODO: JAMES: ASK GREG TO CHECK THE USAGE..  - data-mask="' + formatMask 
		var entryTag = $('<input class="dataValue displayValue" name="' + fieldDef.id + '" type="text" placeholder="' + formatDate + '" />');
		me.addAttrUidDataGroup(entryTag, fieldDef);

		wrapperInput.append(entryTag);
		wrapperDad.append(wrapperInput, button);

		FormUtil.setTagVal(entryTag, fieldDef.defaultValue);

		entryTag.click(e => e.preventDefault());


		me.getTagOfClick_DateTime(fieldDef, button).click(function (e) {
			FormUtil.mdTimePicker(e, formDivSecTag.find('[name=' + fieldDef.id + ']'), formatDate, fieldDef);
		});

		var divInputFieldTag = me.createInputFieldTag_Standard(fieldDef);
		divInputFieldTag.find(".field__left").append(wrapperDad);

		return divInputFieldTag;
	};


	me.createRadioFieldTag = function (fieldDef) {
		var divInputFieldTag = $(Templates.inputFieldRadio);

		var checkLabel = divInputFieldTag.find('.displayName');
		checkLabel.html(fieldDef.defaultName).attr('term', fieldDef.term);

		// Create a hidden input tag to save selected option value
		var hiddenTarget = $(Templates.inputFieldHidden);
		hiddenTarget.addClass("dataValue");
		hiddenTarget.attr("name", fieldDef.id);
		hiddenTarget.attr("dataGroup", fieldDef.dataGroup);
		divInputFieldTag.append(hiddenTarget);

		// Create Option list
		me.createRadioItemTags(divInputFieldTag, fieldDef, false);

		return divInputFieldTag;
	};

	me.createCheckboxFieldTag = function (fieldDef) {
		var divInputFieldTag = $(Templates.inputFieldCheckbox);
		var displayNameTag = divInputFieldTag.find('.displayName');
		displayNameTag.html(fieldDef.defaultName).attr('term', fieldDef.term);

		// Create Option list
		me.createCheckboxItemTags(divInputFieldTag, fieldDef, false)

		return divInputFieldTag;
	};

	// =============================================
	// === Supportive for INPUT fields =============

	// For RADIO items
	me.createRadioItemTags = function (divInputFieldTag, fieldDef, onDialog) {
		var optionDivListTag = divInputFieldTag.find(".radiobutton-col");
		var optionList = FormUtil.getObjFromDefinition(fieldDef.options, ConfigManager.getConfigJson().definitionOptions);
		var defaultValueList = (fieldDef.defaultValue == undefined) ? [] : fieldDef.defaultValue.split(",");
		var displayTag = divInputFieldTag.find(".displayValue");
		var uniqueId; // Greg1-radio [review]

		if (onDialog) {
			uniqueId = divInputFieldTag.attr('uniqueID');
		}
		else {
			uniqueId = Util.generateRandomId(8);
			divInputFieldTag.attr('uniqueID', uniqueId);
		}

		for (var i = 0; i < optionList.length; i++) {
			var optionDivTag = $(Templates.inputFieldRadio_Item);

			//me.setAttributesForInputItem( displayTag, optionDivTag, fieldDef.id, optionList[ i ], defaultValueList.includes( optionList[ i ].value ) );
			me.setAttributesForInputItem(displayTag, optionDivTag, uniqueId, optionList[i], defaultValueList.includes(optionList[i].value));

			optionDivListTag.append(optionDivTag);

			me.setupEvents_RadioItemTags(divInputFieldTag, optionDivTag.find('input'));

			//if ( ! onDialog ) optionDivTag.find( 'input' ).addClass( 'dataValue' );
			if (!onDialog) optionDivTag.find('input').addClass('displayValue');
		}
	}

	me.setAttributesForInputItem = function (displayTag, optionDivTag, targetId, optionConfig, isChecked) {
		var optionInputTag = optionDivTag.find('input');
		optionInputTag.attr('name', 'opt_' + targetId);
		optionInputTag.attr('id', 'opt_' + targetId + '_' + optionConfig.value); // Need for css to make check-mark
		optionInputTag.attr('value', optionConfig.value); // Use to fill the selected option value to input.dataValue
		optionInputTag.prop("checked", isChecked);

		var labelTermId;
		if (optionConfig.poTerm) labelTermId = optionConfig.poTerm;
		else if (optionConfig.term) labelTermId = optionConfig.term;

		var labelTag = optionDivTag.find('label');
		var labelTerm = TranslationManager.translateText(optionConfig.defaultName, labelTermId);
		labelTag.attr('for', 'opt_' + targetId + '_' + optionConfig.value);
		labelTag.attr('term', labelTermId);
		labelTag.text(labelTerm);

		// Set DEFAULT display value if any
		if (isChecked) {
			var value = displayTag.val();
			value = (value == "") ? labelTerm : ", " + labelTerm;
			FormUtil.setTagVal(displayTag, value);
		}
	}

	me.setupEvents_RadioItemTags = function (divInputFieldTag, optionInputTag) {
		optionInputTag.click(function () {
			var targetInputTag = divInputFieldTag.find("input.dataValue");
			// Greg1-radio [review]
			if (targetInputTag.length) {
				targetInputTag.val($(this).val());
				FormUtil.dispatchOnChangeEvent(targetInputTag); // added by Greg (2020-10-12) > change event not dispatching with 'new' value
			}
		});
	}

	// For checkbox items
	me.createCheckboxItemTags = function (divInputFieldTag, fieldDef, onDialog) {
		var optionDivListTag = divInputFieldTag.find(".checkbox-col");
		var optionList = FormUtil.getObjFromDefinition(fieldDef.options, ConfigManager.getConfigJson().definitionOptions);

		// For TRUE/FALSE case without options defination
		if (optionList === undefined) {
			var optionDivTag = $(Templates.inputFieldCheckbox_SingleItem);
			var uniqueId = Util.generateRandomId(8); // Greg1-radio [review]

			divInputFieldTag.attr('uniqueID', uniqueId);

			var optionInputTag = optionDivTag.find('input');
			optionInputTag.attr('id', "opt_" + uniqueId + '_' + fieldDef.id);
			optionInputTag.attr('name', fieldDef.id);
			optionInputTag.attr('dataGroup', fieldDef.dataGroup);


			optionDivTag.find("label").attr("for", "opt_" + uniqueId + '_' + fieldDef.id);

			optionDivListTag.append(optionDivTag);

			me.setupEvents_SingleCheckBoxItemTags(divInputFieldTag, optionDivTag);
		}
		else // Create multiple items
		{
			// Create a hidden input tag to save selected option value
			var hiddenTarget = $(Templates.inputFieldHidden);
			hiddenTarget.addClass('dataValue');
			hiddenTarget.attr('name', fieldDef.id);
			hiddenTarget.attr('dataGroup', fieldDef.dataGroup);
			divInputFieldTag.append(hiddenTarget);


			var defaultValueList = (fieldDef.defaultValue == undefined) ? [] : fieldDef.defaultValue.split(",");
			var displayTag = divInputFieldTag.find(".displayValue");

			for (var i = 0; i < optionList.length; i++) {
				var optionDivTag = $(Templates.inputFieldCheckbox_Item);
				me.setAttributesForInputItem(displayTag, optionDivTag, fieldDef.id, optionList[i], defaultValueList.includes(optionList[i].value));

				optionDivListTag.append(optionDivTag);

				me.setupEvents_CheckBoxItemsTags(divInputFieldTag, optionDivTag.find("input"), onDialog);
			}
		}

	}

	me.setupEvents_SingleCheckBoxItemTags = function (divInputFieldTag, optionDivTag) {
		optionDivTag.change(function () {
			var checkBoxTag = optionDivTag.find("input");
			var value = checkBoxTag.is(':checked');

			divInputFieldTag.find("input.dataValue").val(value);
		});
	}

	me.setupEvents_CheckBoxItemsTags = function (divInputFieldTag, optionInputTag, onDialog) {
		optionInputTag.change(function () {
			var targetInputTag = divInputFieldTag.find("input.dataValue");
			var checkedItems = divInputFieldTag.find("input[name='opt_" + targetInputTag.attr("name") + "']:checked");
			var selectedValues = [];
			for (var i = 0; i < checkedItems.length; i++) {
				selectedValues.push(checkedItems[i].value);
			}
			targetInputTag.val(selectedValues.join(","));
			if (!onDialog) FormUtil.dispatchOnChangeEvent(targetInputTag);
		});
	}

	// For RADIO/CHECKBOX dialog
	me.createSearchOptions_Dialog = function (divInputFieldTag, fieldDef, type) {
		var dialogForm = $(Templates.searchOptions_Dialog);
		dialogForm.find(".dialog__text").addClass("checkbox");

		// Greg1-radio [review]
		dialogForm.attr('uniqueID', divInputFieldTag.attr('uniqueID'));

		var optsContainer = dialogForm.find('.optsContainer');
		dialogForm.find('.title').html(TranslationManager.translateText(fieldDef.defaultName, fieldDef.term));

		if (type == 'radio') {
			optsContainer.addClass("radiobutton-col");

			// Create Item list
			me.createRadioItemTags(dialogForm, fieldDef, true);
		}
		else {
			optsContainer.addClass("checkbox-col");
			optsContainer.addClass("checkbox__wrapper");

			// Create Item list
			me.createCheckboxItemTags(dialogForm, fieldDef, true);

			// Set list of items as vertical
			optsContainer.find(".horizontal").removeClass("horizontal");
		}


		// Set checked items if any
		var selectedValues = divInputFieldTag.find("input.dataValue").val();
		selectedValues = (selectedValues != "") ? selectedValues : fieldDef.defaultValue;
		if (selectedValues != undefined) {
			var selected = selectedValues.split(",");
			for (var i = 0; i < selected.length; i++) {
				var value = selected[i];
				optsContainer.find("input[value='" + value + "']").prop("checked", true);
			}

		}

		// Display dialog
		me.openDialogForm(dialogForm);

		// Need to so something about this ? Maybe move the main class ???
		$('.scrim').off('click').on('click', function () {
			me.closeDialogForm(dialogForm);
		});


		// --------------------------------------------------------
		// Setup events

		// Search event 
		dialogForm.find('input.searchText').on('keyup', function (e) {

			var searchFor = $(this).val().toUpperCase();
			var searchItems = optsContainer.find('div');

			searchItems.each(function (i) {
				selectedVal = ($(this).find("label").html()).toUpperCase();
				$(this).css('display', (selectedVal.includes(searchFor) ? 'block' : 'none'));
				dialogForm.height(dialogForm.attr('constantHeight'));
			});

			// GREG: trying to maintain dialog height when searching
			dialogForm.height(dialogForm.attr('constantHeight'));

		});

		// Item CLICK event
		optsContainer.find("input").click(function () {
			me.setupEvents_DialogSelectedItemTags(divInputFieldTag, dialogForm, $(this), type);
		});

		// Close button event
		dialogForm.find('#closeBtn').on('click', function () {

			var targetInputTag = divInputFieldTag.find("input.dataValue");
			FormUtil.dispatchOnChangeEvent(targetInputTag);

			$('.scrim').hide();
			$('#dialog_searchOptions').remove();
		});

		// Clear button event
		dialogForm.find('#clearBtn').on('click', function () {

			optsContainer.find("input").prop("checked", false);

			var targetInputTag = divInputFieldTag.find("input.dataValue");
			var targetDisplayTag = divInputFieldTag.find("input.displayValue");

			targetInputTag.val("");
			targetDisplayTag.val("");

			FormUtil.dispatchOnChangeEvent(targetInputTag);
		});

	}

	me.closeDialogForm = function (dialogForm) {
		dialogForm.remove();
		$('.scrim').hide();
	};

	me.openDialogForm = function (dialogForm) {
		$('body').append(dialogForm);
		$('.scrim').show();

		dialogForm.show();

		/*	setTimeout( function(){
				// GREG: trying to maintain dialog height when searching
				dialogForm.attr( 'constantHeight', dialogForm.height() );
				dialogForm.attr( 'constantWidth', dialogForm.width() );
			 }, 250 ) */
	};


	me.setupEvents_DialogSelectedItemTags = function (targetDivInputFieldTag, dialogTag, optionInputTag, type) {
		optionInputTag.change(function () {
			var targetInputTag = targetDivInputFieldTag.find("input.dataValue");
			var targetDisplayTag = targetDivInputFieldTag.find("input.displayValue");

			//var checkedItems = dialogTag.find("input[name='opt_" + targetInputTag.attr("name") + "']:checked");
			var checkedItems = dialogTag.find("input[name='opt_" + targetDivInputFieldTag.attr("uniqueID") + "']:checked");
			var selectedValues = [];
			var selectedTexts = [];
			for (var i = 0; i < checkedItems.length; i++) {
				var text = $(checkedItems[i]).closest("div").find("label").html();
				selectedValues.push(checkedItems[i].value);
				selectedTexts.push(text);
			}

			targetInputTag.val(selectedValues.join(","));
			targetDisplayTag.val(selectedTexts.join(","));

			if (type === 'radio') setTimeout(function () { $('#closeBtn').click(); }, 200); //consider adding delay so UI has time to reflect user's selection
		});
	}


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.getIdList_FormJson = function (formDef_fieldsArr) {
		var idList = [];

		for (var i = 0; i < formDef_fieldsArr.length; i++) {
			var fieldDef = formDef_fieldsArr[i];

			if (fieldDef.id) idList.push(fieldDef.id);
		}

		return idList;
	}

	me.setNewFormData_wtGroupInfo = function (formDef_fieldsArr, definitionFormGroups) {
		// There are some hidden data which are put in hidden INPUT tag without any group. 
		// This one need to genrerate first so that data in these fields can be used after that
		var groupNone = me._groupNoneId;
		var arrWtGroup = [];
		var arrNoGroup = [];

		// 1. copy the array..
		//var fieldArr = Util.cloneJson( formDef_fieldsArr );

		// 2. loop each form control and create formGroup...  even none ones...
		formDef_fieldsArr.forEach(field => {
			// NOTE: ISSUES - Currently, definition name is used as id..  but we should have id in it...
			var groupId = field.formGroup;
			var fieldGroup = definitionFormGroups[groupId]; // Can not use 'FormUtil.getObj--' since we do not want string name returned if not exists.
			// FormUtil.getObjFromDefinition( groupId, definitionFormGroups );

			if (fieldGroup) {
				// Data with group info
				var dataJson = {
					'id': field.id
					, 'group': fieldGroup.defaultName
					, 'groupTerm': Util.getStr(fieldGroup.term)
					, 'groupId': groupId
					, 'item': field
					, created: 0
					, display: (field.display == 'hiddenVal' || field.display == 'none') ? 0 : 1
					, order: fieldGroup.order
				};

				arrWtGroup.push(dataJson);
			}
			else {
				// Data with no group info
				var dataJson = {
					'id': field.id
					, 'group': groupNone
					, 'groupTerm': ''
					, 'groupId': groupNone
					, 'item': field
					, created: 0
					, display: (field.display == 'hiddenVal' || field.display == 'none') ? 0 : 1
					, order: 999
				};

				arrNoGroup.push(dataJson);
			}
		});


		// SORTING should be inherited from preconfigured 'Group' object sort value
		Util.sortByKey(arrWtGroup, 'order');


		// Combine the 'noGroup' with 'withGroup' array
		var combinedArr = Util.getCombinedArrays(arrNoGroup, arrWtGroup);

		combinedArr.forEach(item => {
			if (item.group == groupNone) item.group = '';
		});

		return combinedArr;
	};


	me.getFormUniqueGroups = function (JsonArr) {
		var ArrFound = [];

		for (var i = 0; i < JsonArr.length; i++) {
			if (!ArrFound.includes(JsonArr[i].group)) {
				ArrFound.push(JsonArr[i].group);
			}
		}

		return ArrFound;
	}

	me.getfieldDef_FromId = function (formDef_fieldsArr, id) {
		return Util.getFromList(formDef_fieldsArr, id, "id");
	}

	// Filter the rules by 'countryFilter' if exists.
	me.getFormControlRules = function (fieldDef) {
		var rules = [];

		try {
			if (fieldDef.rules) {
				fieldDef.rules.forEach(rule => {
					if (ConfigManager.checkByCountryFilter(rule.countryFilter)) {
						rules.push(rule);
					}
				});
			}
		}
		catch (errMsg) { console.log('ERROR in BlockForm.getFormControlRoles, ' + errMsg); }

		return rules;
	};


	me.getFormControlRule = function (fieldDef, attr) {
		var matchRuleValue = ''; // Should be undefined, but existing implementation was set to emtpy string.

		var rules = me.getFormControlRules(fieldDef);

		if (attr) {
			var rule = Util.getFromList(rules, attr, 'name');
			if (rule && rule.value) matchRuleValue = rule.value;
		}

		return matchRuleValue;
	};


	me.setfieldDef_DefaultValue_PayloadConfigSelection = function (fieldDef, payloadConfigSelection) {
		if (fieldDef
			&& fieldDef.defaultValue
			&& fieldDef.defaultValue.payloadConfigEval) {
			fieldDef.defaultValue.payloadConfigSelection = payloadConfigSelection;
		}
	};


	me.getEvalFormulas = function () {
		var jData = me.formDef_fieldsArr;
		var pConf = me.payloadConfigSelection; //FormUtil.block_payloadConfig;
		var retArr = [];

		// 'calculatedValue' not used likely..
		// 'payloadConfigSelection' - Something we can remove?   <-- TODO: Questions

		for (var i = 0; i < jData.length; i++) {
			var formFieldDef = jData[i];

			// 1. prioritize existing payloadConfig (if match found)
			if (pConf && formFieldDef.payload && formFieldDef.payload[pConf] && (formFieldDef.payload[pConf].calculatedValue || formFieldDef.payload[pConf].defaultValue)) //pConf.length && 
			{
				if (formFieldDef.payload && formFieldDef.payload[pConf] && formFieldDef.payload[pConf].calculatedValue) {
					retArr.push({ name: formFieldDef.id, type: 'calculatedValue', formula: formFieldDef.payload[pConf].calculatedValue, byConfig: pConf, dependencies: me.getFieldsFromFormula(formFieldDef.payload[pConf].calculatedValue, formFieldDef.id) });
				}
				if (formFieldDef.payload && formFieldDef.payload[pConf] && formFieldDef.payload[pConf].defaultValue) {
					retArr.push({ name: formFieldDef.id, type: 'defaultValue', formula: formFieldDef.payload[pConf].defaultValue, byConfig: pConf, dependencies: me.getFieldsFromFormula(formFieldDef.payload[pConf].defaultValue, formFieldDef.id) });
				}
			}
			else {
				// 2. then prioritize 'default' payloadConfig (if present)
				if (formFieldDef.payload && formFieldDef.payload.default && (formFieldDef.payload.default.calculatedValue || formFieldDef.payload.default.defaultValue)) //pConf.length && 
				{
					if (formFieldDef.payload && formFieldDef.payload.default && formFieldDef.payload.default.calculatedValue) {
						retArr.push({ name: formFieldDef.id, type: 'calculatedValue', formula: formFieldDef.payload.default.calculatedValue, byConfig: 'default', dependencies: me.getFieldsFromFormula(formFieldDef.payload.default.calculatedValue, formFieldDef.id) });
					}
					if (formFieldDef.payload && formFieldDef.payload.default && formFieldDef.payload.default.defaultValue) {
						retArr.push({ name: formFieldDef.id, type: 'defaultValue', formula: formFieldDef.payload.default.defaultValue, byConfig: 'default', dependencies: me.getFieldsFromFormula(formFieldDef.payload.default.defaultValue, formFieldDef.id) });
					}
				}
				else {
					// 3. finally prioritize root calculatedValue/defaultValue (if present)
					if (formFieldDef.calculatedValue) {
						retArr.push({ name: formFieldDef.id, type: 'calculatedValue', formula: formFieldDef.calculatedValue, byConfig: '', dependencies: me.getFieldsFromFormula(formFieldDef.calculatedValue, formFieldDef.id) });
					}
					if (formFieldDef.defaultValue) {
						var defVal = formFieldDef.defaultValue;

						if (defVal.indexOf('$${') >= 0 || defVal.indexOf('##{') >= 0 || defVal.indexOf('eval{') >= 0) // Matches pattern in FormUtil.evalReservedField()
						{
							retArr.push({ name: formFieldDef.id, type: 'defaultValue', formula: defVal, byConfig: '', dependencies: me.getFieldsFromFormula(defVal, formFieldDef.id) });
						}
					}
				}

			}

		}

		//Util.sortByKey( retArr, 'dependencies' ); // how do we sort by retArr.dependencies.length ?
		retArr.sort(function (a, b) {
			return (a.dependencies.length < b.dependencies.length) ? -1 : (a.dependencies.length > b.dependencies.length) ? 1 : 0;
		});
		//console.log( retArr );
		return retArr;
	};


	me.getFieldsFromFormula = function (evalFormula, parentName) {

		// accepts formula, e.g. 1: "##{generatePattern(form:walkIn_firstName[LEFT:3]-form:walkIn_motherName[LEFT:3]-form:walkIn_birthDistrict[LEFT:3]-form:walkIn_birthOrder[PADDNUMERIC:2],-,true)}"
		// 						 2: "eval{$('[name=generateVoucher]').val() === 'NO' ? '' : $('[name=voucherCode_ipc_capture]').val()}"
		// returns array,   e.g. 1: [ "walkIn_firstName", "walkIn_motherName", "walkIn_birthDistrict", "walkIn_birthOrder" ]
		// 					     2: [ "generateVoucher", "voucherCode_ipc_capture" ]

		var returnFields = [];
		var formSearch = false, nameSearch = false;

		formSearch = (evalFormula.indexOf('form:') >= 0);
		nameSearch = (evalFormula.indexOf('name=') >= 0);

		if (!formSearch && !nameSearch) return returnFields;

		var sourceFieldsArr = [], formArr = [], nameArr = [];
		var separatorChars = '';

		if (formSearch) formArr = evalFormula.split('form:');
		if (nameSearch) nameArr = evalFormula.split('name=');

		if (formArr.length && nameArr.length) {
			sourceFieldsArr = formArr.concat(nameArr);
			separatorChars = '[|,|)|+|-|/| |]';
		}
		else {
			if (formArr.length) {
				sourceFieldsArr = formArr;
				separatorChars = '[|,|)|+|-|/| ';
			}

			if (nameArr.length) {
				sourceFieldsArr = nameArr;
				separatorChars = ']';
			}
		}

		var separatorArr = separatorChars.split('|');

		for (var i = 1; i < sourceFieldsArr.length; i++) // from 1 not 0, left side (0) is to be ignored (usually contains reserved '$$function{' part )
		{
			var bFoundCharMatch = false;
			var formulaPart = sourceFieldsArr[i];

			for (var s = 0; s < separatorArr.length; s++) {
				if (!bFoundCharMatch) {
					var sepPart = separatorArr[s];

					if ((formulaPart).indexOf(sepPart) > 0) {
						var fieldName = (formulaPart).split(sepPart)[0];

						if (!returnFields.includes(sepPart)) {
							if (!returnFields.includes(fieldName) && parentName !== fieldName) returnFields.push(fieldName);
							bFoundCharMatch = true;
						}
					}
				}
			}

			bFoundCharMatch = false;
		}

		return returnFields;
	};



	// TODO: Need to review and re-orgnize the code..
	me.defaultValEval = function (formDivSecTag, evalFunctionsToProcess, thisTag, dispatchChangeEvent) {
		// 1. get all evalFunctions (using calculatedValue / defaultValue)
		// 2. determine which evalFunctions + controls have reference to thisTag control
		// 3. only update those controls affected by currentControl value change

		// Example: 
		//	"id": "phoneNumber_existingClient_voucher",
		//  "defaultValue":    "eval{$('[name=generateVoucher]').val() === 'NO' ? '' : $('input[name=\"phoneNumber_existingClient\"]').val()}",

		// STEP #1: 'thisTag' = generateVoucher

		// STEP #2: Get all 'defaultValue' with 'evaluations'
		var affectedControls;

		// only focus on changing control's value (cascade calculatedValue)
		if (thisTag) {
			// STEP #3: Get the 'defaultValue' evaluations that uses 'thisTag' id in the formula
			// 'affectedControls' are the fields that has this 'defaultValue' 
			//		ex) 'phoneNumber_existingClient_voucher'
			affectedControls = evalFunctionsToProcess.filter(function (field) {
				return field.dependencies.includes(thisTag.attr('name'));
			});
		}
		else {
			affectedControls = evalFunctionsToProcess.filter(function (field) {
				return field.type === 'defaultValue';
			});
		}

		// STEP #4: Go through each fields that needs to recalculate the value..
		for (var i = 0; i < affectedControls.length; i++) {
			var tagTarget = formDivSecTag.find('[name="' + affectedControls[i].name + '"]');

			FormUtil.evalReservedField(tagTarget.closest('form'), tagTarget, affectedControls[i].formula, dispatchChangeEvent);
		}
	};


	me.setEventsAndRules = function (fieldDef, entryTag, divInputFieldTag, formDivSecTag, formFull_IdList) {
		if (entryTag) {
			// If 'Enter' key is pressed in any entry field, set to ignore that action.
			entryTag.keydown(function (e) {
				if (e.which === FormUtil.keyCode_Enter || e.keyCode === FormUtil.keyCode_Enter) {
					try {
						var blockTag = formDivSecTag.closest('div.block')
						var btnClick = fieldDef.onEnterKeyBtnClick;

						if (btnClick && blockTag) {
							if (btnClick === true) blockTag.find('div.button').first().click();
							else blockTag.find('[btnId="' + fieldDef.onEnterKeyBtnClick + '"]').click();
						}
					}
					catch (errMsg) {
						console.log('ERROR in blockForm.setEventsAndRules entryTag.keydown, errMsg: ' + errMsg);
					}

					return false;
				}
			});

			// Set Event
			entryTag.change(function () {
				var thisTag = $(this);

				// NOTE: TODO: WHAT ABOUT THE RADIO BUTTON?
				if (thisTag.attr('type') === 'checkbox') {
					setTimeout(function () {
						me.defaultValEval(formDivSecTag, me.evalFunctionsToProcess, thisTag, true);
						me.performEvalActions(thisTag, fieldDef, formDivSecTag, formFull_IdList);
					}, 100);
				}
				else {
					me.defaultValEval(formDivSecTag, me.evalFunctionsToProcess, thisTag, true);
					me.performEvalActions(thisTag, fieldDef, formDivSecTag, formFull_IdList);
				}
			});


			// Other custom events..
			if (fieldDef.events) {
				for (var prop in fieldDef.events) {
					//var evalStr = fieldDef.events[ prop ];
					entryTag.on(prop, function (e) {
						try {
							var evalStr = Util.getEvalStr(fieldDef.events[prop]);
							if (evalStr) eval(evalStr);
						}
						catch (errMsg) { console.log('ERROR in fieldTag customEvent, ' + prop + ', ' + errMsg); }
					});
				}
			}
		}

		me.addRuleListForField(divInputFieldTag, fieldDef);
		me.addDataTargets(divInputFieldTag, fieldDef); // added by Greg (9 Apr 19) > dataTargets > for auto-generation of JSON payloads
		me.addStylesForField(divInputFieldTag, fieldDef);
	};

	// ===================================================================

	me.setFieldTagVisibility = function (fieldDef, divInputFieldTag, passedData) {
		// Set Tag Visibility
		if (fieldDef.display === "hiddenVal" || fieldDef.display === "none") {
			divInputFieldTag.hide();
			divInputFieldTag.attr('display', fieldDef.display);
			//entryTag.attr( 'display', 'hiddenVal' );
		}

		if (passedData) {
			if (me.checkShowHideCases(passedData.hideCase, fieldDef.hideCase)) divInputFieldTag.hide();
			if (me.checkShowHideCases(passedData.showCase, fieldDef.showCase)) divInputFieldTag.show();
		}
	};


	me.checkShowHideCases = function (sourceCase, targetCases) {
		var caseMatched = false;

		try {
			if (sourceCase && targetCases) {
				var expandedCases = me.showHideCases_DefExpand(targetCases);

				if (Util.isTypeArray(expandedCases)) {
					caseMatched = (expandedCases.indexOf(sourceCase) >= 0);
				}
				else if (Util.isTypeString(expandedCases)) {
					caseMatched = (sourceCase === expandedCases);
				}
			}
		}
		catch (errMsg) {
			console.log('blockForm.checkShowHideCases(), errMsg: ' + errMsg);
		}

		return caseMatched;
	};


	me.showHideCases_DefExpand = function (caseObj) {
		var caseList = [];

		try {
			var lv1_caseList = FormUtil.getObjFromDefinition(caseObj, ConfigManager.getConfigJson().definitionShowHideCases);

			lv1_caseList.forEach(innerCase => {
				var caseName = FormUtil.getObjFromDefinition(innerCase, ConfigManager.getConfigJson().definitionShowHideCases);

				if (caseName) {
					if (Util.isTypeString(caseName)) caseList.push(caseName);
					else if (Util.isTypeArray(caseName)) caseList = caseList.concat(caseName);
				}
			});
		}
		catch (errMsg) {
			console.log('blockForm.showHideCases_DefExpand(), errMsg: ' + errMsg);
		}

		return caseList;
	};


	me.addStylesForField = function (divInputTag, fieldDef) {
		var entryTag = divInputTag.find('.displayValue'); //select,input

		if (fieldDef.styles !== undefined) {
			for (var i = 0; i < fieldDef.styles.length; i++) {
				var styleDef = fieldDef.styles[i];
				entryTag.css(styleDef.name, styleDef.value);
			}
		}

	}

	me.addRuleListForField = function (divInputTag, fieldDef) {
		var entryTag = divInputTag.find('select,input'); // < shouldn't his be .dataValue?
		var regxRules = [];
		var otherRules = {};
		var pickerDateRangeJson;

		var rulesList = me.getFormControlRules(fieldDef);

		rulesList.forEach(ruleDef => {
			var ruleJson = FormUtil.getObjFromDefinition(ruleDef, ConfigManager.getConfigJson().definitionRules);

			if (Util.isTypeArray(ruleJson)) {
				ruleJson.forEach(subRuleDef => {
					var subRuleJson = FormUtil.getObjFromDefinition(subRuleDef, ConfigManager.getConfigJson().definitionRules);
					me.addRuleForField(subRuleJson, regxRules, otherRules, entryTag, divInputTag, fieldDef);
				});
			}
			else if (Util.isTypeObject(ruleJson)) {
				me.addRuleForField(ruleJson, regxRules, otherRules, entryTag, divInputTag, fieldDef);
			}
		});

		if (regxRules.length > 0) entryTag.attr('patterns', encodeURI(JSON.stringify(regxRules)));
		if (otherRules.pickerDateRangeJson) entryTag.attr('pickerDateRange', encodeURI(JSON.stringify(otherRules.pickerDateRangeJson)));
		if (otherRules.customEvalRuleIds) entryTag.attr('customEvalRuleIds', encodeURI(JSON.stringify(otherRules.customEvalRuleIds)));

	};


	me.addRuleForField = function (ruleJson, regxRules, otherRules, entryTag, divInputTag, fieldDef) {
		//if ( me.checkConditionEval( ruleJson ) )
		if (FormUtil.checkConditionEval(ruleJson.conditionEval)) {
			if (ruleJson.name) {
				// Rule Name is added to attribute of the tag. - By default.
				entryTag.attr(ruleJson.name, ruleJson.value);

				var ruleNameUpper = ruleJson.name.toUpperCase();

				// If Mandatory is true, add '*' span tag.
				if (ruleNameUpper === 'MANDATORY' && ruleJson.value === 'true')  // mandatory
				{
					divInputTag.find('label').first().closest('div').append($('<span class="spanMandatory">*</span>'));
				}


				var bFontNotGray = (ruleJson.value === 'fontNotGray' || ruleJson.value === 'fontNotGrey');
				var fieldBlockTag = divInputTag.closest('div.fieldBlock');
				var inputTags;

				// readonly & disabled css
				if (ruleNameUpper === 'DISABLED') // disabled
				{
					fieldBlockTag.addClass('divInputReadOnly'); // background-color #eee
					inputTags = fieldBlockTag.find('input,select,button'); //.attr( 'disabled', 'disabled' );
				}
				else if (ruleNameUpper === 'READONLY') inputTags = fieldBlockTag.find('input,select,button');
				else if (ruleNameUpper === 'PICKERONLY') inputTags = fieldBlockTag.find('input,select'); // allow the button click!!

				if (inputTags) {
					// TODO: Could use FormUtil.disableInputTag() for universal usage..
					inputTags.attr('disabled', 'disabled');
					if (!bFontNotGray) inputTags.css('opacity', '0.6'); //.css( 'color', '#999' ); // a bit lighter font for all 3 above case?  Disabled ones
				}
			}
			else if (ruleJson.pattern) {
				var regxRuleJson = {};
				regxRuleJson.pattern = ruleJson.pattern;
				regxRuleJson.msg = ruleJson.msg;
				regxRuleJson.term = ruleJson.term;

				regxRules.push(regxRuleJson);
			}
			else if (ruleJson.dateRangeRule === 'usePickerDateRange' && fieldDef.dateRange) {
				pickerDateRangeJson = {};

				pickerDateRangeJson.dateFrom = fieldDef.dateRange.from;
				pickerDateRangeJson.dateTo = fieldDef.dateRange.to;

				pickerDateRangeJson.msg = ruleJson.msg;
				pickerDateRangeJson.term = ruleJson.term;

				otherRules.pickerDateRangeJson = pickerDateRangeJson;
			}
			else if (ruleJson.customEvalRuleId) {
				if (!otherRules.customEvalRuleIds) otherRules.customEvalRuleIds = [];
				otherRules.customEvalRuleIds.push(ruleJson.customEvalRuleId);
			}
			// else if ( )

			// all other custom attributes
			if (ruleJson.type) {
				entryTag.attr('type', ruleJson.type);
			}
		}
	};

	me.addDataTargets = function (divInputTag, fieldDef) {
		var entryTag = divInputTag.find('.dataValue'); //  ( 'select,input' )
		var pConf = me.payloadConfigSelection;
		var dataTargets;

		// 1. prioritize existing payloadConfig (if match found)
		if (pConf) {
			if (fieldDef.payload && fieldDef.payload[pConf] && fieldDef.payload[pConf].dataTargets) {
				dataTargets = fieldDef.payload[pConf].dataTargets;
			}
		}

		if (!dataTargets) {
			// 2. then prioritize 'default' payloadConfig (if present)
			if (fieldDef.payload && fieldDef.payload.default && fieldDef.payload.default.dataTargets) {
				dataTargets = fieldDef.payload.default.dataTargets;
			}
			else {
				// 3. finally prioritize root calculatedValue/defaultValue (if present)
				if (fieldDef.dataTargets) {
					dataTargets = fieldDef.dataTargets;
				}
			}
		}

		if (dataTargets) {
			entryTag.attr('dataTargets', escape(JSON.stringify(dataTargets)));
		}

	}

	// ----------------------------------------------------

	// SHOULD BE MOVED?  
	// NOTE: For 'checkbox' type, tag is always hidden.  Need to look at 

	me.isEntryTagVisible = function (tag) {
		var isVisible = false;

		if (tag.attr('type') === 'checkbox' || tag.attr('type') === 'radio') {
			var tagId = tag.attr('id');
			var labelTag = tag.siblings('label[for="' + tagId + '"]');
			isVisible = labelTag.is(':visible');
		}
		else {
			isVisible = tag.is(':visible');
		}

		return isVisible;
	};

	// ----------------------------------------------------
	// ---- EVAL Actions Related --------------------------

	me.performEvalActions = function (tag, fieldDef, formDivSecTag, formFull_IdList) {
		try {
			var tagVal = FormUtil.getTagVal(tag); // undefined/null are converted to ''

			// Allow tagVal for false/0, etc..  
			if (fieldDef && fieldDef.evalActions) {
				// If 'tagVal' is not empty, or empty, but has flag to allow this..
				if (tagVal !== ''
					|| (tagVal === '' && fieldDef.evalActions_wtEmptyVal)) {
					// Proper INFO variable references
					InfoDataManager.setINFOdata('form', tag.closest('form'));
					InfoDataManager.setINFOdata('tag', tag);
					InfoDataManager.setINFOdata('tagVisible', tag.parent().is(':visible'));  // should use .closest( 'div.fieldBlock' ) ?
					InfoDataManager.setINFOdata('tagVal', tagVal);

					// Old ones - to be obsolete later?
					InfoDataManager.setINFOdata('thisTag', tag); // Obsolete?  use 'tag' instead?
					InfoDataManager.setINFOdata('formTag', tag.closest('form'));
					InfoDataManager.setINFOdata('formDivSecTag', tag.closest('.formDivSec'));
					InfoDataManager.setINFOdata('blockTag', tag.closest('div.block'));


					fieldDef.evalActions.forEach(evalAction => {
						var evalActionJson = FormUtil.getObjFromDefinition(evalAction, ConfigManager.getConfigJson().definitionEvalActions);

						me.performEvalAction(evalActionJson, tag, tagVal, formDivSecTag, formFull_IdList);
					});
				}
			}
			//}
		}
		catch (errMsg) {
			console.log('ERROR in BlockForm.performEvalActions(), errMsg: ' + errMsg);
		}
	};

	me.performEvalAction = function (evalAction, tag, tagVal, formDivSecTag, formFull_IdList) {
		if (evalAction && ConfigManager.checkByCountryFilter(evalAction.countryFilter)) {
			// If condition does not exist, it is considered as pass/true.
			// If it exists, check eval to see if condition evaluates as true.
			// TODO: We need to check the === true rather than below check..
			if (evalAction.condition === undefined || me.checkCondition(evalAction.condition, tag, tagVal, formDivSecTag, formFull_IdList)) {
				me.performCondiShowHide(evalAction.shows, formDivSecTag, formFull_IdList, true);
				me.performCondiShowHide(evalAction.hides, formDivSecTag, formFull_IdList, false);
				me.performCondiAction(evalAction.actions, formDivSecTag, false);

				if (evalAction.optionsChange) me.evalActions_optionsChange(evalAction.optionsChange, formDivSecTag);

				if (evalAction.runEval) {
					try {
						var form = formDivSecTag; // Added by Greg (1 Feb 2021): to use 'form' variable in the eval expression - used in ZW/ZW2 configuration
						var tagVisible = tag.parent().is(':visible');  // TODO: Should be more specific with class name  <-- should be .closest( 'div.fieldBlock') rather than 'parent()'

						var runEvalStr = Util.getEvalStr(evalAction.runEval);  // Handle array into string joining
						if (runEvalStr) returnVal = eval(runEvalStr);
					} catch (errMsg) { console.log('BlockForm.performEvalAction, runEval err: ' + errMsg); }
				}
			}
			else {
				// If not true condition, run 'conditionInverse' (if it exists)
				if (evalAction.conditionInverse !== undefined) {
					if (evalAction.conditionInverse.indexOf('shows') >= 0) me.performCondiShowHide(evalAction.shows, formDivSecTag, formFull_IdList, false);
					if (evalAction.conditionInverse.indexOf('hides') >= 0) me.performCondiShowHide(evalAction.hides, formDivSecTag, formFull_IdList, true);
					if (evalAction.conditionInverse.indexOf('actions') >= 0) me.performCondiAction(evalAction.actions, formDivSecTag, true);
				}
			}
		}
	};


	// ------------------------------------------
	// --- EvalActions OptionsChange Related ----

	me.evalActions_optionsChange = function (optionsChange, formDivSecTag) {
		// From the list of id, get the tag's option reference?
		// and repopulate it..
		optionsChange.forEach(tagId => {
			me.selectTagOptionsRelist(tagId, formDivSecTag);
		});
	};

	me.selectTagOptionsRelist = function (tagId, formTag) {
		// 'formDivSecTag' is almost same as 'form' tag, thus, renamed here.  
		//   'form' tag is right below 'formDivSecTag' always.
		var entryTags = formTag.find('select[name="' + tagId + '"]');

		if (entryTags.length > 0) {
			entryTags.each(function () {
				var entryTag = $(this);
				var options = entryTag.attr('options');

				if (options) {
					// Get and resolve options
					var optionList = FormUtil.getObjFromDefinition(options, ConfigManager.getConfigJson().definitionOptions);

					if (optionList && Util.isTypeArray(optionList)) {
						var preValue = entryTag.val();

						// limitCases arry filter...
						var optionListNew = me.filterOptionsByLimitCases(optionList, formTag);

						Util.decodeURI_ItemList(optionListNew, 'defaultName');  // <-- why this?  	

						Util.populateSelect_newOption(entryTag, optionListNew, { 'name': 'defaultName', 'val': 'value' });

						// Restore value after rePopulating - if value existed.
						if (preValue) entryTag.val(preValue);
					}

					// Translate Page after the rendering..
					TranslationManager.translatePage();
				}
			});
		}
	};


	me.filterOptionsByLimitCases = function (optionList, formTag) {
		var newOptionList = [];

		optionList.forEach(optionObj => {
			try {
				// If 'limitCases' exists on the option def, 
				//  Check to see if any of the cases passes to allow showing of this option.
				// Example: { "defaultName": "Your Future", "value": "YF", "term": "option_tools_YF", "limitCases": [ "def_sesGS_refDD", "def_sesID_refDD_genM", ... ] },
				// 			<-- In "options_tools"
				if (optionObj.limitCases) {
					var showOptionCase = false;

					for (var i = 0; i < optionObj.limitCases.length; i++) {
						var limitCase = optionObj.limitCases[i];
						var defLimitCase = FormUtil.getObjFromDefinition(limitCase, ConfigManager.getConfigJson().definitionOptionLimitCases);

						var passLimitCase = me.checkOptionLimitCaseValues(defLimitCase, formTag);

						if (passLimitCase) {
							showOptionCase = true;
							break;
						}
					}

					if (showOptionCase) newOptionList.push(optionObj);
				}
				else {
					newOptionList.push(optionObj);
				}
			}
			catch (errMsg) {
				console.log('ERROR in BlockForm.filterOptionsByLimitCases(), errMsg: ' + errMsg);
			}
		});

		return newOptionList;
	};

	me.checkOptionLimitCaseValues = function (defLimitCase, formTag) {
		// for each property name, match the value..  If all values match, it passes..
		// Ex. "def_sesGS_refDD": { "sessionType": [ "GS" ], "referralChannel": [ "DD" ] }  <-- In "definitionOptionLimitCases"
		var passCase = true;

		for (var propName in defLimitCase) {
			var valueArr = defLimitCase[propName];

			// Get actual value in the tag..
			//var targetTag = formTag.find( '[name="' + propName + '"]' );
			var targetTag = me.getMatchingInputTag(formTag, propName);

			if (targetTag.length > 0) {
				var tagVal = FormUtil.getTagVal(targetTag);

				if (valueArr.indexOf(tagVal) === -1) {
					passCase = false;
					break;
				}
			}
		}

		return passCase;
	};


	// -------------------------------------

	me.checkCondition = function (evalCondition, tag, tagVal, formDivSecTag, formFull_IdList) {
		var result = false;

		// NOTE: TEMP IMPLEMENTATION - REPLACE WITH BETTER SOLUTION LATER..
		// <-- Do this globally <-- Right 
		//INFO.userRole = ConfigManager.login_UserRoles;

		try {
			// Handle array into string joining
			evalCondition = Util.getEvalStr(evalCondition);

			if (evalCondition) {
				// NOTE: Old way..  Is here for supporting old config.
				var afterCondStr = me.conditionVarIdToVal(evalCondition, tagVal, formDivSecTag, formFull_IdList)

				var form = formDivSecTag; // Added by Greg (1 Feb 2021): to use 'form' variable in the eval expression - used in ZW/ZW2 configuration
				var tagVisible = tag.parent().is(':visible');
				// tag, tagVal is also available within eval - vis parameter

				// NOTE: We could move this to Util.evalTryCatch
				// if we run the optional exposore..  <-- form, tag, tagVal  <-- within the method..  or callback?
				result = eval(afterCondStr);
			}
		}
		catch (errMsg) {
			console.log('ERROR in BlockForm.checkCondition, ' + errMsg);
		}

		return result;
	}


	me.conditionVarIdToVal = function (evalCondition, tagVal, formDivSecTag, formFull_IdList) {
		try {
			// Replace 'this' first.
			evalCondition = Util.replaceAll(evalCondition, '$$(this)', tagVal);

			// Replace other tag val cases.
			for (var i = 0; i < formFull_IdList.length; i++) {
				var idStr = formFull_IdList[i];
				var matchKeyStr = '$$(' + idStr + ')';

				var tag = me.getMatchingInputTag(formDivSecTag, idStr);

				evalCondition = Util.replaceAll(evalCondition, matchKeyStr, tag.val());
			}
		}
		catch (errMsg) {
			console.log('ERROR in BlockForm.conditionVarIdToVal(), errMsg: ' + errMsg);
		}

		return evalCondition;
	}

	me.performCondiAction = function (actions, formDivSecTag, reset) {
		if (actions) {
			for (var i = 0; i < actions.length; i++) {
				var action = actions[i];

				if (action.id) {
					var matchingTag = me.getMatchingInputTag(formDivSecTag, action.id);

					if (matchingTag.length > 0) {
						if (reset) matchingTag.val('');
						else {
							if (action.value) {
								matchingTag.val(action.value);
								matchingTag.change();
							}
						}
					}
				}
			}
		}
	};

	me.performCondiShowHide = function (idList, formDivSecTag, formFull_IdList, visible) {
		if (idList) {
			for (var i = 0; i < idList.length; i++) {
				var idStr = idList[i];
				var targetInputTag = me.getMatchingInputTag(formDivSecTag, idStr);
				var targetInputDivTag = targetInputTag.closest('div.fieldBlock');

				// NOTE: after show/hide of a field, also run 'evalActions' of that field to trigger dependency show/hide.
				if (visible) {
					targetInputDivTag.show('fast');
					targetInputDivTag.closest('div.formGroupSection').find('> div.section').show();
					me.performChildTagEvalActions(idStr, targetInputTag, formDivSecTag, formFull_IdList);
				}
				else {
					targetInputDivTag.hide();
					me.performChildTagEvalActions(idStr, targetInputTag, formDivSecTag, formFull_IdList);
				}
			}
		}
	};

	me.performChildTagEvalActions = function (idStr, targetInputTag, formDivSecTag, formFull_IdList) {
		setTimeout(function () {
			var fieldDef = me.getfieldDef_FromId(me.formDef_fieldsArr, idStr);
			me.performEvalActions(targetInputTag, fieldDef, formDivSecTag, formFull_IdList);
		}, me._childTargetActionDelay);
	};

	me.getMatchingInputTag = function (formDivSecTag, idStr) {
		//return formDivSecTag.find( 'input[name="' + idStr + '"],select[name="' + idStr + '"]' );
		return formDivSecTag.find('[name="' + idStr + '"]');
	};


	// ---- EVAL Actions Related --------------------------
	// ----------------------------------------------------


	// PopulateFormData by passed in json (Not by config, but by external data)
	me.populateFormData = function (passedData, formDivSecTag) {
		if (passedData) {
			// NOTE: 'resultData', 'dispalyData' normally happenes from DHIS2 search result
			if (passedData.resultData) // if data is in 'resultData' & 'simpleData/displayData' format.
			{
				me.populateFormData_Common(formDivSecTag, passedData.resultData); // 'clientId', 'voucherId', 'walkIn--' data

				// Simpler data population - from clientJson (that has 'clientDetails' in it)
				if (passedData.simpleData) me.populateFieldsData(formDivSecTag, passedData.simpleData.clientDetails);
				//me.populateFormData_ObjByName( -- - - -);

				// Dhis2 Search result styel data - 'displayData' - we are assuming this is single list... (could be 2 dimensional array)
				if (passedData.displayData) me.populateFormData_ArrayDataByUid(formDivSecTag, passedData.displayData);
			}
			else if (passedData.formsJson) me.populateFieldsData(formDivSecTag, passedData.formsJson);
			else if (passedData.formDataArr) me.populateFormData_ArrayDataByUid(formDivSecTag, passedData.formDataArr);
			else if (Util.isTypeArray(passedData)) me.populateFormData_ArrayDataByUid(formDivSecTag, passedData);
		}
	};


	me.populateFormData_Common = function (formDivSecTag, resultData) {
		try {
			// getProperValue  <-- but 'clientId' and voucherId' could be populated by hidden inputs..
			var clientId = Util.getNotEmpty(resultData.clientId);
			var voucherId = Util.getNotEmpty(resultData.voucherId);

			if (clientId) formDivSecTag.find('[name="clientId"]').val(clientId);
			if (voucherId) formDivSecTag.find('[name="voucherId"]').val(voucherId);

			clientId = formDivSecTag.find('[name="clientId"]').val();
			voucherId = formDivSecTag.find('[name="voucherId"]').val();
			formDivSecTag.find('[name="walkInClientCase"]').val(me.getWalkInClientCase(clientId, voucherId));
		}
		catch (errMsg) {
			console.log('Error in blockForm.populateFormData_Common: errMsg: ' + errMsg);
		}
	};


	me.populateFormData_ObjByName = function (formDivSecTag, jsonData) {
		try {
			if (jsonData) {
				// 1. Go through each inputs under formDivSec and populate the matching data from 'attributes'
				me.populateFieldsData(formDivSecTag, jsonData);
			}
		}
		catch (errMsg) {
			console.log('Error in blockForm.populateFormData_ObjByName: errMsg: ' + errMsg);
		}
	};


	// Populates data (downloaded from web) to form
	me.populateFormData_ArrayDataByUid = function (formDivSecTag, attributes) {
		try {
			// 1. If double array, get content array (subArray)
			attributes = me.getContentArr(attributes);

			// 2. If array, like 'voucherCodes'/'users', get the 1st val..	
			attributes.forEach(attrJson => {
				if (Util.isTypeArray(attrJson.value)) attrJson.value = attrJson.value[0];
			});

			// 3. go through each inputs under formDivSec and populate the matching data from 'attributes'
			me.populateFieldsData(formDivSecTag, attributes);
		}
		catch (errMsg) {
			console.log('Error in blockForm.populateFormData_ArrayDataByUid: errMsg: ' + errMsg);
		}
	};


	// ============ NEWLY CHANGED METHODS  ===========================

	// Not used - OBSOLETE
	me.getFieldTagByNameUid = function (formDivSecTag, idStr) {
		// NOTE: I don't think 'uid' is being used anymore...
		return formDivSecTag.find('input.dataValue, select.dataValue').filter('[uid="' + idStr + '"], [name="' + idStr + '"]');
	};

	me.getFieldDef_ByFieldTag = function (inputTag) {
		var fieldId = inputTag.attr('name');
		return me.getFieldDef_ByFieldId(fieldId);
	}

	me.getFieldDef_ByFieldId = function (fieldId) // Could make it Static Method
	{
		return me.fieldDefsJson[fieldId];  // fieldDef does not have value..	
	}


	// Set both 'dataValue' & 'displayValue' on field? - basic type, checkbox/radio, modal popup
	//	Triggers .change() to make sure the fields display value are changed?
	me.populateFieldData = function (inputTags, val) {
		try {
			if (val !== undefined) {
				// In case there are multiple inputTag 
				inputTags.each(function (i) {
					var inputTag = $(this);

					// 1. Set the dataValue
					FormUtil.setTagVal(inputTag, val, function () {
						// 2. Do follow up operation after successful set.
						//var fieldDef = me.fieldDefsJson[ inputTag.attr("name") ];
						var fieldDef = me.getFieldDef_ByFieldTag(inputTag);

						// The value to be set(passed) is in 'dataValue' tag under 'fieldBlock'
						me.populateFieldDisplayValue(inputTag.closest('div.fieldBlock'), fieldDef);

						// NOTE: we perform the .change so that the values get triggered to set proper display value?
						inputTag.change();
					});
				});
			}
		}
		catch (errMsg) {
			console.log('Error blockForm.populateFieldData, ' + errMsg);
		}
	};


	me.populateFieldsData = function (formDivSecTag, dataJson) {
		if (dataJson) {
			// Need to confirm with Tran/Greg with getting right input control
			var inputTags = formDivSecTag.find('input.dataValue, select.dataValue');

			// Go through each input tags and use 'uid' to match the attribute for data population
			inputTags.each(function (i) {
				var inputTag = $(this);

				try {
					var uidStr = inputTag.attr('uid');
					var nameStr = me.removeGroupDotName(inputTag.attr('name'));

					var uidMatchVal = (uidStr && uidStr !== 'undefined') ? me.getValFromList_Obj(dataJson, uidStr) : undefined;
					var nameMatchVal = (nameStr) ? me.getValFromList_Obj(dataJson, nameStr) : undefined;

					if (uidMatchVal) me.populateFieldData(inputTag, uidMatchVal);
					if (nameMatchVal) me.populateFieldData(inputTag, nameMatchVal);
				}
				catch (errMsg) {
					console.log('Error blockForm.populateFieldsData, ' + errMsg);
				}
			});
		}
	};

	me.getValFromList_Obj = function (dataJson, idStr) {
		var matchVal;

		if (Util.isTypeArray(dataJson)) {
			// [ { id: 'firstName', value: 'james' }, ...]
			var matchItem = Util.getFromList(dataJson, idStr, 'id');
			if (matchItem) matchVal = matchItem.value;
		}
		else if (Util.isTypeObject(dataJson)) {
			// { firstName: 'james', ...}
			matchVal = dataJson[idStr];
		}

		return matchVal;
	}

	// ====================================================

	me.populateFieldDisplayValue = function (divFieldBlockTag, fieldDef) {
		var dataValue = divFieldBlockTag.find('.dataValue').val();

		if (dataValue !== '' && dataValue !== null && dataValue !== undefined && fieldDef) {
			var controlType = fieldDef.controlType;

			if (controlType == 'YEAR') {
				divFieldBlockTag.find('.displayValue').val(dataValue);
			}
			else if (fieldDef.options == undefined && controlType == 'CHECKBOX' && dataValue == 'true') {
				// For TRUE/FALSE case without options defination
				divFieldBlockTag.find('input.displayValue').prop('checked', true);
			}
			else if (fieldDef.options != undefined) {
				var dataValueList = dataValue.split(',');
				var optionList = FormUtil.getObjFromDefinition(fieldDef.options, ConfigManager.getConfigJson().definitionOptions);
				var displayValues = [];

				dataValueList.forEach(dataVal => {
					var searched = Util.getFromList(optionList, dataVal, 'value');
					if (searched != undefined && (controlType == 'RADIO' || controlType == 'CHECKBOX')) {
						if (controlType == 'RADIO') divFieldBlockTag.find('input[type=radio][value=' + dataVal + ']').prop('checked', true);
						else if (controlType == 'CHECKBOX') divFieldBlockTag.find('input[type=checkbox][value=' + dataVal + ']').prop('checked', true);
					}
					else if (controlType == 'DROPDOWN_AUTOCOMPLETE' || controlType == 'MULTI_CHECKBOX') {
						var displayValue = (searched == undefined) ? dataVal : TranslationManager.translateText(searched.defaultName, searched.poTerm);
						displayValues.push(displayValue);
					}
				});

				if (displayValues.length > 0) {
					divFieldBlockTag.find('.displayValue').val(displayValues.join(','));
				}
			}
		}
	};


	me.getContentArr = function (input) {
		var contentArr = input;

		if (Util.isTypeArray(input)) {
			if (input.length > 0 && Util.isTypeArray(input[0])) {
				contentArr = input[0];
			}
		}

		return contentArr;
	};

	me.removeGroupDotName = function (inputNameStr) {
		var outputName = '';

		try {
			// In case input name has group name with dot (ex. 'clientDetail.phoneNumber' )
			// remove the groupName: 'clientDetail.phoneNumber' --> 'phoneNumber'
			if (inputNameStr) {
				if (inputNameStr.indexOf('.') > 0) {
					var splitNames = inputNameStr.split('.');
					outputName = splitNames[1];
				}
				else {
					outputName = inputNameStr;
				}
			}
		}
		catch (errMsg) {
			console.log('Error in blockForm.removeGroupDotName: errMsg: ' + errMsg);
		}

		return outputName;
	};


	me.getWalkInClientCase = function (clientId, voucherId) {
		var walkInClientCase = "";
		var hasClient = (clientId !== undefined && clientId !== "");
		var hasVoucherId = (voucherId !== undefined && voucherId !== "");

		if (hasClient && hasVoucherId) {
			walkInClientCase = "1";
		}
		else if (hasClient && !hasVoucherId) {
			walkInClientCase = "2";
		}
		else {
			walkInClientCase = "3";
		}

		return walkInClientCase;
	}

	// TRAN TODO 
	me.createListOptions_Items = function (targetTag, fieldDef, type, addClass, targetInputTag, targetDisplayText) {
		var optionList = FormUtil.getObjFromDefinition(fieldDef.options, ConfigManager.getConfigJson().definitionOptions);
		var hiddenTarget = $(Templates.inputFieldHidden);

		targetTag.append(hiddenTarget);

		hiddenTarget.attr('id', fieldDef.id);
		hiddenTarget.addClass('dataValue');

		if (optionList === undefined) {
			// create single item ( on / off ) for checkbox ONLY
			if (type === 'checkbox') {
				var checkboxTag = $(Templates.inputFieldCheckbox_SingleItem);

				var inputTag = checkboxTag.find('input');
				inputTag.addClass('displayValue');
				inputTag.attr('id', 'option_' + fieldDef.id);
				inputTag.attr('single', 'true');
				inputTag.attr('updates', fieldDef.id);


				checkboxTag.find('label').attr('for', 'option_' + fieldDef.id);
				// checkboxTag.find( 'label' ).html( '' );

				me.createListOption_UpdateEvent(checkboxTag.find('input'), targetInputTag, targetDisplayText);

				targetTag.append(checkboxTag);
			}
		}
		else {
			// create multiple items

			for (var i = 0; i < optionList.length; i++) {
				var optItem = optionList[i];

				if (type === 'radio') {
					newOpt = $(Templates.inputFieldRadio_Item);
				}
				else if (type === 'checkbox') {
					newOpt = $(Templates.inputFieldCheckbox_Item);
				}

				var labelTerm = TranslationManager.translateText(optItem.defaultName, optItem.poTerm)

				if (addClass) newOpt.addClass(addClass);

				newOpt.first('div').attr('searchText', labelTerm);

				newOpt.find('input').attr('name', 'search_opt_' + fieldDef.id);
				newOpt.find('input').attr('id', 'option_' + optItem.value);
				newOpt.find('input').attr('value', optItem.value);
				newOpt.find('input').attr('targetName', fieldDef.id);
				newOpt.find('input').attr('single', 'false');

				newOpt.find('input').addClass('displayValue');


				newOpt.find('label').attr('for', 'option_' + optItem.value);
				newOpt.find('label').text(labelTerm);

				me.createListOption_UpdateEvent(newOpt.find('input'), targetInputTag, targetDisplayText);

				targetTag.append(newOpt);
			}


			if (targetInputTag != undefined) {
				// Select options if any
				var selectedIs = targetInputTag.val().split(",");
				for (var i = 0; i < selectedIs.length; i++) {
					targetTag.find('[id="option_' + selectedIs[i] + '"]').prop("checked", true);
				}
			}

		}

	}

	me.createListOption_UpdateEvent = function (listOptionTag, targetInputTag, targetDisplayText) {
		if (listOptionTag.attr('single') === 'true') {
			listOptionTag.on('click', function () {

				var inputUpdates = $('#' + $(this).attr('updates'));

				inputUpdates.val(($(this).is(':checked') ? 'true' : 'false'));

			});
		}
		else {

			listOptionTag.on('click', function () {

				var targUpdates = $(this).attr('updates');
				// var inputUpdates = $( '#' + targUpdates );
				var listOpts = $('input[targetName="' + targUpdates + '"]');
				var selectedValueList = [];
				var selectedTextList = [];

				listOpts.each(function () {

					if ($(this).is(':checked')) {
						var name = $(this).val();
						var text = $(this).closest(".radiogrp").find("label").html();

						selectedValueList.push(name);
						selectedTextList.push(text);
					}
				});


				var inputUpdates = $('#' + targUpdates);
				inputUpdates.val(selectedValueList.join(","));

				if (targetInputTag != undefined) {
					targetDisplayText.val(selectedTextList.join(","));
					targetInputTag.val(selectedValueList.join(","));
				}


			});

		}
	}

	// -------------------------------
	me.initialize();
}