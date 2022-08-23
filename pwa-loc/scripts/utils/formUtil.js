// -------------------------------------------
// -- FormUtil Class/Methods

function FormUtil() { }

FormUtil.blockType_MainTab = 'mainTab';
FormUtil.blockType_MainTabContent = 'mainTabContent';
FormUtil.block_payloadConfig = '';

FormUtil._gAnalyticsTrackId = "UA-134670396-1";
FormUtil._getPWAInfo;

FormUtil.geoLocationTrackingEnabled = false;  // --> move to geolocation.js class
FormUtil.geoLocationLatLon;  // --> move to geolocation.js class
FormUtil.geoLocationState;  // --> move to geolocation.js class
FormUtil.geoLocationError;  // --> move to geolocation.js class
FormUtil.geoLocationCoordinates;  // --> move to geolocation.js class

FormUtil.records_redeem_submit = 0;
FormUtil.records_redeem_queued = 0;
FormUtil.records_redeem_failed = 0;
FormUtil.syncRunning = 0;

FormUtil.keyCode_Backspace = 8;
FormUtil.keyCode_Delete = 46;
FormUtil.keyCode_Enter = 13;

const PWD_INPUT_PADDING_TOP = 0;
const PWD_INPUT_PADDING_LEFT = 0;
const CHAR_SPACING_WIDTH = 12;

// ==== Methods ======================


// ==========================================
// ====  BLOCK / UNBLOCK PAGE  <-- TODO: LATER, MOVE TO IT'S OWN CLASS?

FormUtil.blockPage = function (scrimTag, runFunc) {
	if (!scrimTag) scrimTag = FormUtil.getScrimTag();

	scrimTag.off('click');
	scrimTag.show();

	if (runFunc) runFunc(scrimTag);

	return scrimTag;
};

FormUtil.unblockPage = function (scrimTag) {
	if (!scrimTag) scrimTag = FormUtil.getScrimTag();

	scrimTag.off('click');
	scrimTag.hide();
};

// -- GET ----
FormUtil.getScrimTag = function () {
	return $('.scrim');
};

FormUtil.getSheetBottomTag = function () {
	return $('.sheet_bottom');
};

FormUtil.getSheetBottom3BtnTag = function () {
	return $('.sheet_bottom-btn3');
};

// -------------

FormUtil.emptySheetBottomTag = function () {
	FormUtil.getSheetBottomTag().html('');
};

// Never need this since we can do 'emptySheetBottomTag()' instead..
FormUtil.remove_3ButtonDiv = function () {
	FormUtil.getSheetBottom3BtnTag().remove();  // 3 button 		
};

// --------------

FormUtil.genTagByTemplate = function (tag, template, runFunc) {
	tag.html('').append( template );
	TranslationManager.translatePage();
	tag.show();

	runFunc(tag); // Add event methods or anything related to the created template tag things.
	//return tag;
};

// ==========================================
// ====  GET/SET Form Control Tag value ====
FormUtil.getFormCtrlTag = function (formTag, ctrlTagName) {
	return formTag.find("[name='" + ctrlTagName + "']");
};

FormUtil.getFormCtrlDataValue = function (inputDataValueTag) {
	return inputDataValueTag.val();
};

FormUtil.getFormCtrlDisplayValue = function (inputDataValueTag) {
	var inputDisplayValueTag = inputDataValueTag.closest('.fieldBlock').find('.displayValue');

	if (inputDisplayValueTag !== undefined && inputDisplayValueTag[0] !== inputDataValueTag[0]) {
		return inputDisplayValueTag.val();
	}
	else {
		return inputDataValueTag.val();
	}
};

FormUtil.setFormCtrlDataValue = function (inputDataValueTag, value) {
	inputDataValueTag.val(value);
	// If it has any value, mark it and perform change();
	if (value === false || value) inputDataValueTag.change();
};

FormUtil.setFormCtrlDisplayValue = function (inputDataValueTag, value) {
	var inputDisplayValueTag = inputDataValueTag.closest('.fieldBlock').find('.displayValue');
	if (inputDisplayValueTag !== undefined && inputDisplayValueTag[0] !== inputDataValueTag[0]) inputDisplayValueTag.val(value);
};

// ==============================================

FormUtil.setCardContentDisplay = function (divContentTag, displayBase, displaySettings, cardContentTemplate, preRunEvalStr) {
	try {
		//var appendContent = '';
		divContentTag.find('div.cardContentDisplay').remove();

		// run optional eval for things..
		try {
			if (preRunEvalStr) eval(preRunEvalStr);
		}
		catch (errMsg) { console.log('FormUtil.setCardContentDisplay, failed on preRunEval, ' + errMsg); }


		// Display 1st line
		try {
			var displayBaseContent = eval(Util.getEvalStr(displayBase)); // Handle array into string joining		
			if (displayBaseContent) divContentTag.append($(cardContentTemplate).html(displayBaseContent));
		}
		catch (errMsg) { console.log('FormUtil.setCardContentDisplay, failed on displayBaseContent, ' + errMsg); }


		// Display 2nd lines and more
		if (displaySettings) {
			displaySettings.forEach(item => {
				try {
					var displayEvalResult = eval(Util.getEvalStr(item));
					if (displayEvalResult) divContentTag.append($(cardContentTemplate).html(displayEvalResult));
				}
				catch (errMsg) { console.log('FormUtil.setCardContentDisplay, failed on displayContent, ' + errMsg); }
			});
		}
	}
	catch (errMsg) {
		console.log('ERROR in FormUtil.setCardContentDisplay, errMsg: ' + errMsg);
	}
};

// ==============================================

FormUtil.getNextZIndex_cardFullScreen = function () {
	var zIndex_Next = 1600;

	$('div.detailFullScreen').each(function (index) {
		try {
			var currZIndx = Number($(this).css('z-index'));
			if (currZIndx && currZIndx > zIndex_Next) zIndex_Next = currZIndx;
		}
		catch (errMsg) { console.log('ERROR in FormUtil.getNextZIndex_cardFullScreen, ' + errMsg); }
	});

	return zIndex_Next + 1;
};


FormUtil.sheetFullSetup = function (template, options) {
	if (!options) options = {};

	var title = Util.getStr(options.title);
	var term = Util.getStr(options.term);
	var cssClasses = (options.cssClasses) ? options.cssClasses : [];

	var zIndex = (options.zIndex) ? options.zIndex : FormUtil.getNextZIndex_cardFullScreen();


	// 1. create with template & append to body
	var sheetFullTag = $(template).css('z-index', zIndex);

	if (options.preCall) options.preCall(sheetFullTag);

	$('body').append(sheetFullTag);


	// 2. Set backButton - with title and class identifications
	var btnBackTag = sheetFullTag.find('img.btnBack').addClass(cssClasses);
	btnBackTag.off('click').click(function () { sheetFullTag.remove(); });


	// 3. NEW: PREVIEW STYLE CHANGES <-- NOTE: WHAT IS THIS?
	sheetFullTag.find('.tab_fs__container').css('--width', sheetFullTag.find('.tab_fs__container').css('width'));
	sheetFullTag.find('span.sheetTopTitle').attr('term', term).text(title);


	// 4. Optional 'syncIcon' or 'onOfflineIcon' click point to actual ones..
	sheetFullTag.find('.syncIcon').off('click').click(function (e) {
		e.stopPropagation();  // Stops calling parent tags event calls..
		$(SyncManagerNew.imgAppSyncActionButtonId).click();
	});

	sheetFullTag.find('.onOfflineIcon').off('click').click(function (e) {
		e.stopPropagation();  // Stops calling parent tags event calls..
		$('#divNetworkStatus').click();
	});


	sheetFullTag.show();

	return sheetFullTag;
};


// -----------------------------------------------

FormUtil.getObjFromDefinition = function (def, definitions, option) // limitCount )
{
	var defJson; // = def;  // default is the passed in object/name

	try {
		if (!option) option = {};
		if (!option.limitCount) option.limitCount = 0;

		// 1. Get definition object/array
		if (Util.isTypeString(def)) {
			// OPTION NEW 'local to block' - Check for Block preName with '.' (Local Def in block)
			var localDefJson = FormUtil.getBlockLocalDefObj(def);
			if (localDefJson) defJson = localDefJson;
			else if (definitions && definitions[def]) defJson = definitions[def]; // Get object from definitions
			else defJson = def;  // definitionJson not found.  So, return just string name.
		}
		else if (Util.isTypeObject(def) || Util.isTypeArray(def)) {
			defJson = def;
		}


		// 2. Make a copy of it rather than itself.. <-- since we now may make changes
		if (Util.isTypeArray(defJson) || Util.isTypeObject(defJson)) defJson = Util.cloneJson(defJson);


		// 3. If Object and has inherit (for merging), merge with inherit info.. - has 'mergeList' / 'removeList'
		if (Util.isTypeObject(defJson) && defJson.inherit) defJson = FormUtil.inheritMergeDef(defJson);


		// 4. More action: Array combining or userRole filter.
		// If Definition is array, check if any string def exists and replace them with array. - also, recursively call def
		if (Util.isTypeArray(defJson)) {
			// A. If def is array ( [ ] ), each item could be string def rather than obj.  In that case, replace it with def object.
			// 	- Used for common list (of fields array?)
			FormUtil.arrayDefReplace(defJson, definitions, option);

			// B. For 'conditionEval' case checking, use new array.  Easier than deleting existing array.
			var newDefJsonArr = [];
			defJson.forEach(subDefJson => {
				if (FormUtil.checkConditionEval(subDefJson.conditionEval)) newDefJsonArr.push(subDefJson);
			});

			if (newDefJsonArr.length > 0) defJson = newDefJsonArr;
		}
		else if (Util.isTypeObject(defJson)) {
			// If object were properly loaded, check the userRole exists.  If so, apply it.
			//	- If roles does not exists, return undefined.
			if (defJson.userRoles && !ConfigManager.matchUserRoles(defJson.userRoles, ConfigManager.login_UserRoles)) defJson = undefined;

			if (defJson && !FormUtil.checkConditionEval(defJson.conditionEval)) defJson = undefined;
		}
	}
	catch (errMsg) {
		console.log('ERROR in FormUtil.getObjFromDefinition, id: ' + def + ', errMsg: ' + errMsg);
	}

	return defJson;
};


FormUtil.inheritMergeDef = function (defJson) {
	var outDef;

	try {
		if (defJson.inherit) {
			var targetDef = FormUtil.getObjFromInherit(defJson.inherit);

			if (targetDef) {
				outDef = targetDef;

				// Need to merge with existing ones..
				if (Util.isTypeArray(outDef)) {
					// Merge List		
					if (defJson.mergeList) {
						defJson.mergeList.forEach(item => {
							// If 'id' already exists, remove that - for overriding
							if (item.id) Util.RemoveFromArrayAll(outDef, 'id', item.id);

							outDef.push(item);
						});
					}

					// Remove List
					if (defJson.removeList) {
						defJson.removeList.forEach(removeId => {
							// If 'id' already exists, remove that - for overriding
							Util.RemoveFromArrayAll(outDef, 'id', removeId);
						});
					}
				}
				else if (Util.isTypeObject(outDef)) {
					Util.mergeJson(outDef, defJson);  // not deep json, 

					// Remove Props if 'removePropList' exists
					if (defJson.removePropList && Util.isTypeArray(defJson.removePropList)) {
						defJson.removePropList.forEach(removeProp => {
							if (outDef[removeProp] !== undefined) delete outDef[removeProp];
						});
					}
				}
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in FormUtil.inheritMergeDef, ' + errMsg);
	}

	return (outDef) ? outDef : defJson;
};


FormUtil.getObjFromInherit = function (defName) {
	var targetDef; // could be object or array?

	try {
		var inheritDef = FormUtil.getObjFromDefinition(defName, ConfigManager.getConfigJson().definitionInheritLinks);

		// If 'target' exists, load it.
		if (inheritDef) {
			if (inheritDef.section && inheritDef.target) {
				var configSectionDef = ConfigManager.getConfigJson()[inheritDef.section];

				if (configSectionDef) {
					targetDef = FormUtil.getObjFromDefinition(inheritDef.target, configSectionDef);
					// This targetDef could be array or object <-- depends on the 'def' type
				}
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in FormUtil.getObjFromInherit, ' + errMsg);
	}

	return targetDef;
};


// form fields array = []
FormUtil.arrayDefReplace = function (defJson, definitions, option) {
	if (defJson && definitions) {
		// if the limitCount is over 5, do not do this, which is recursive call.
		if (option.limitCount < 5) {
			for (var i = defJson.length - 1; i >= 0; i--) {
				var item = defJson[i];

				if (Util.isTypeString(item)) {
					var itemsArr = FormUtil.getObjFromDefinition(item, definitions, option);
					if (itemsArr) {
						defJson.splice(i, 1); // remove the string 'item' and insert the item array.
						Util.insertItmesOnArray(defJson, i, itemsArr);
					}
				}
			}
		}
	}
};


FormUtil.checkConditionEval = function (conditionEval) {
	var isPass = false;

	try {
		if (conditionEval === undefined) isPass = true;
		else {
			var conditionEval = FormUtil.getObjFromDefinition(conditionEval, ConfigManager.getConfigJson().definitionConditionEvals);

			conditionEval = Util.getEvalStr(conditionEval);

			var evalResult = eval(conditionEval);
			if (evalResult === true) isPass = true;
		}
	}
	catch (errMsg) {
		console.log('ERROR in FormUtil.checkConditionEval, ' + errMsg);
	}

	return isPass;
};

FormUtil.getBlockLocalDefObj = function (def) {
	var blockPreNameIdx = def.indexOf('.');
	var localDefJson;

	if (blockPreNameIdx > 0 && def.length > blockPreNameIdx + 1) {
		var blockPreName = def.substring(0, blockPreNameIdx);
		var localDefName = def.substr(blockPreNameIdx + 1);

		var blockJson = FormUtil.getObjFromDefinition(blockPreName, ConfigManager.getConfigJson().definitionBlocks);

		if (blockJson && blockJson.DEFINITIONS && blockJson.DEFINITIONS[localDefName]) {
			localDefJson = blockJson.DEFINITIONS[localDefName];
		}
	}

	return localDefJson;
};

FormUtil.rotateTag = function (tag, runRotation) {
	if (tag) {
		if (runRotation) {
			tag.attr('rotating', 'true');
			tag.rotate({ count: 999, forceJS: true, startDeg: 0 });
		}
		else {
			tag.attr('rotating', 'false');
			tag.stop().rotate({ endDeg: 360, duration: 0 });
		}
	}
};


FormUtil.rotateImgTag = function (tag, runRotation) {
	if (tag) {
		if (runRotation) {
			tag.attr('rotating', 'true');
			tag.rotate({ count: 999, forceJS: true, startDeg: 0 });
		}
		else {
			tag.attr('rotating', 'false');
			tag.stop().rotate({ endDeg: 360, duration: 0 });
		}
	}
};


// Temp use by 'dataList' for now - might populate it fully for more common use
FormUtil.renderInputTag = function (dataJson, containerDivTag) {
	var entryTag = $('<input name="' + dataJson.id + '" class="form-type-text" type="text" />');
	if (dataJson.uid) entryTag.attr('uid', dataJson.uid);

	if (dataJson.display) entryTag.attr('display', dataJson.display);

	// If 'defaultValue' exists, set val
	FormUtil.setTagVal(entryTag, dataJson.defaultValue);

	// If containerDivTag was passed in, append to it.
	if (containerDivTag) {
		containerDivTag.append(entryTag);

		// Set Tag Visibility
		if (dataJson.display === "hiddenVal" || dataJson.display === "none") {
			containerDivTag.hide();
		}
	}

	return entryTag;
};


FormUtil.generateLoadingTag = function (btnTag) {
	var loadingTag;

	if (btnTag) {
		if (btnTag.is('div')) {
			if (!btnTag.hasClass('button-label') && btnTag.find('.button-label')) {
				loadingTag = $('<div class="loadingImg" style="float: right; margin-left: 8px;"><img src="images/loading_small.svg"></div>');
				btnTag.find('.button-label').append(loadingTag);
			}
			else {
				loadingTag = $('<div class="loadingImg" style="float: right; margin-left: 8px;"><img src="images/loading_small.svg"></div>');
				btnTag.append(loadingTag);
			}
		}
		else if (btnTag.is('button')) {
			loadingTag = $('<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading_small.svg"></div>');
			btnTag.after(loadingTag);
		}
	}

	return loadingTag;
}

FormUtil.convertNamedJsonArr = function (jsonArr, definitionArr) {
	var newJsonArr = [];

	if (jsonArr) {
		for (var i = 0; i < jsonArr.length; i++) {
			newJsonArr.push(FormUtil.getObjFromDefinition(jsonArr[i], definitionArr));
		}
	}

	return newJsonArr;
}


FormUtil.getObjDefId = function (objId) {
	if (Util.isTypeObject(objId)) objId = objId.id;
	return objId;
};


FormUtil.renderBlockByBlockId = function (blockId, cwsRenderObj, parentTag, passedData, options, actionJson, renderType) {
	var blockObj;

	INFO.lastRenderedBlockId = undefined;  // Might have issue if some other minor block were rendered and failed..

	if (blockId) {
		var blockDefJson = FormUtil.getObjFromDefinition(blockId, ConfigManager.getConfigJson().definitionBlocks);

		if (blockDefJson) {
			INFO.lastRenderedBlockId = blockId;
			blockId = FormUtil.getObjDefId(blockId);
			blockObj = new Block(cwsRenderObj, blockDefJson, blockId, parentTag, passedData, options, actionJson);
			blockObj.render(renderType);
		}
	}

	return blockObj;
};


FormUtil.getFieldTagsByName = function (fieldName, blockTag) {
	var tags;

	if (blockTag) tags = blockTag.find("[name='" + fieldName + "']").closest('div.fieldBlock');
	else tags = $("[name='" + fieldName + "']").closest('div.fieldBlock');

	return tags;
};


//var fieldTags = blockTag.find( 'div.fieldBlock' );



// ViewOnly, Diable Tags..
FormUtil.disableFieldTags = function (fieldTags, option) {
	//var fieldTags = blockTag.find( 'div.fieldBlock' );

	if (option && option.clientViewMode === true) {
		fieldTags.css('border', 'none');
		fieldTags.find('input').attr('readonly', 'readonly');
	}
	else {
		// each field disable on a form/block
		fieldTags.find('input').attr('disabled', 'disabled').css('opacity', '0.6');
		fieldTags.find('input[type=radio],input[type=checkbox]').siblings('label[for]').css('opacity', '0.6');
		fieldTags.addClass('divInputReadOnly');

		// emulate like --> if ( ruleNameUpper === 'DISABLED' ) // disabled
	}

	fieldTags.find('select').attr('disabled', 'true').css('background-image', 'none');
	fieldTags.find('button.dateButton').remove();
	fieldTags.find('span.spanMandatory').remove();
};


// -----------------------------
// ---- REST (Retrieval/Submit(POST)) Related ----------


FormUtil.mdDatePicker = function (e, entryTag, formatDate, yearRange) {
	e.preventDefault();
	if (Util.isMobi()) entryTag.blur();  // NOTE: TODO: WHY THIS?

	var entryTagVal = entryTag.val();
	var jsEntryTag = entryTag[0];

	if (!yearRange) yearRange = { 'from': -100, 'to': 1 };
	if (!formatDate) formatDate = 'YYYY';


	var mdDTObj = new mdDateTimePicker.default({
		type: 'date'
		, init: (entryTagVal == '') ? moment() : moment(entryTagVal)
		, past: (yearRange) ? moment().add(yearRange.from, 'years') : undefined // Date min 
		, future: (yearRange) ? moment().add(yearRange.to, 'years') : undefined  // Date max
		, orientation: 'PORTRAIT'
		, autoClose2: true
	});

	mdDTObj.toggle();

	mdDTObj.trigger = jsEntryTag;
	jsEntryTag.addEventListener('onOk', function () {
		//var inpDate = $( '[name=' + formItemJson.id + ']' );
		entryTag.val(mdDTObj.time.format(formatDate));
		FormUtil.dispatchOnChangeEvent(entryTag);
	});

};


// NOTE: Only used on statistics..
FormUtil.mdDatePicker2 = function (e, entryTag, formatDate, yearRange) {
	var entryTagVal = entryTag.val();
	var jsEntryTag = entryTag[0];

	if (!yearRange) yearRange = { 'from': -100, 'to': 1 };
	if (!formatDate) formatDate = 'YYYY';


	var mdDTObj = new mdDateTimePicker.default({
		type: 'date'
		, init: (entryTagVal == '') ? moment() : moment(entryTagVal)
		, past: (yearRange) ? moment().add(yearRange.from, 'years') : undefined // Date min 
		, future: (yearRange) ? moment().add(yearRange.to, 'years') : undefined  // Date max
		, orientation: 'PORTRAIT'
		, autoClose2: true
	});

	mdDTObj.toggle();

	mdDTObj.trigger = jsEntryTag;

	jsEntryTag.addEventListener('onOk', function () {
		//var inpDate = $( '[name=' + formItemJson.id + ']' );
		entryTag.val(mdDTObj.time.format(formatDate));
		//FormUtil.dispatchOnChangeEvent( entryTag );
	});

};


FormUtil.mdDatePicker_New = function (e, entryTag, formatDate, formDefJson) // yearRange
{
	e.preventDefault();
	if (Util.isMobi()) entryTag.blur();  // NOTE: TODO: WHY THIS?

	var entryTagVal = entryTag.val();
	var jsEntryTag = entryTag[0];


	var datePastFuture = FormUtil.getDatePastFuture(formDefJson);
	//if ( !yearRange ) yearRange = { 'from': -100, 'to': 1 };
	if (!formatDate) formatDate = 'YYYY';


	var mdDTObj = new mdDateTimePicker.default({
		type: 'date'
		, init: (entryTagVal == '') ? moment() : moment(entryTagVal)
		, past: datePastFuture.past //( yearRange ) ? moment().add( yearRange.from, 'years') : undefined // Date min 
		, future: datePastFuture.future // ( yearRange ) ? moment().add( yearRange.to, 'years') : undefined  // Date max
		, orientation: 'PORTRAIT'
		, autoClose2: true
	});

	mdDTObj.toggle();

	mdDTObj.trigger = jsEntryTag;
	jsEntryTag.addEventListener('onOk', function () {
		//var inpDate = $( '[name=' + formItemJson.id + ']' );
		entryTag.val(mdDTObj.time.format(formatDate));
		FormUtil.dispatchOnChangeEvent(entryTag);
	});
};


FormUtil.mdTimePicker = function (e, entryTag, formatTime, formDefJson) {
	e.preventDefault();
	if (Util.isMobi()) entryTag.blur();  // NOTE: TODO: WHY THIS?

	var entryTagVal = entryTag.val();
	var jsEntryTag = entryTag[0];


	//var datePastFuture = FormUtil.getDatePastFuture( formDefJson );
	//if ( !yearRange ) yearRange = { 'from': -100, 'to': 1 };
	if (!formatTime) formatTime = 'hh:mm';


	var mdDTObj = new mdDateTimePicker.default({
		type: 'time'
		//,init: ( entryTagVal == '') ? moment() : moment( entryTagVal )
		//,orientation: 'PORTRAIT'
		//,autoClose2: true
	});

	mdDTObj.toggle();

	mdDTObj.trigger = jsEntryTag;
	jsEntryTag.addEventListener('onOk', function () {
		//var inpDate = $( '[name=' + formItemJson.id + ']' );
		entryTag.val(mdDTObj.time.format(formatTime));
		FormUtil.dispatchOnChangeEvent(entryTag);
	});

};


FormUtil.getDatePastFuture = function (formDefJson) {
	//var datePastFuture = { 'past': undefined, 'future': undefined };
	var datePastFuture = { 'past': moment().add(-100, 'years'), 'future': moment().add(1, 'years') }; // Default Year setting..

	try {
		if (formDefJson) {
			if (formDefJson.dateRange) {
				// Maybe we should have individual 'type'..
				//  'from': { 'type': 'year', 'value': '-1' }, 'to':  { 'type': 'day', 'value': '10' }
				//  { type: 'fix', from: '[-1]-[0]-01', to: '' }
				//  'from': { 'type': 'eval', 'value': 'moment([2010, 0, 31])' }, 'to':  { 'type': 'eval', 'value': 'moment([2025, 0, 31])' }

				datePastFuture.past = FormUtil.getCustomDate(formDefJson.dateRange.from);
				datePastFuture.future = FormUtil.getCustomDate(formDefJson.dateRange.to);
			}
			else if (formDefJson.yearRange) {
				var yRange = formDefJson.yearRange;

				datePastFuture.past = (yRange.from !== undefined) ? moment().add(yRange.from, 'years') : undefined;
				datePastFuture.future = (yRange.to !== undefined) ? moment().add(yRange.to, 'years') : undefined;
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR on FormUtil.getDatePastFuture, errMsg: ' + errMsg);
	}

	return datePastFuture;
};

FormUtil.getCustomDate = function (customDateJson) {
	var customDate = undefined;

	try {
		if (customDateJson) {
			if (customDateJson.type === 'eval') {
				customDate = eval(customDateJson.value);
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR on FormUtil.getCustomDate, errMsg: ' + errMsg);
	}

	return customDate;
};

// -----------------------------------
// ---- Login And Fetch WS Related ------
// ---------------------------------------------------------

// NOTE: NOT being used for 'MENU' anymore.  ONLY USED BY DataList groupby.. (But do not know what that is..).
FormUtil.setClickSwitchEvent = function (clickBtnTag, showDivTag, openCloseClass) {
	// In menu show case, 'clickBtnTag' is the menu icon for showing menu div.
	//		- 'showDivTag' is the menu div that gets shown.
	clickBtnTag.off('click').on('click', function (event) {
		event.preventDefault();

		var thisTag = $(this);
		var className_Open = openCloseClass[0];
		var className_Close = openCloseClass[1];

		// ALREADY OPEN 
		if (thisTag.hasClass(className_Open)) {
			thisTag.removeClass(className_Open);
			thisTag.addClass(className_Close);

			// OBSOLETE - CLOSE NAVMENU (clicked from navHeader bar)
			if (thisTag.hasClass('Nav__icon')) {
				thisTag.removeClass('active');

				showDivTag.css('left', '-' + FormUtil.navDrawerWidthLimit(document.body.clientWidth) + 'px');
				showDivTag.css('width', FormUtil.navDrawerWidthLimit(document.body.clientWidth) + 'px');

				setTimeout(function () { showDivTag.hide(); }, 500);

				$('div.scrim').hide();
			}
			else {
				showDivTag.fadeOut('fast', 'linear');

				if (!$('#navDrawerDiv').is(':visible')) {
					$('div.scrim').hide();
				}
				else {
					showDivTag.css('opacity', '0');
				}

				showDivTag.css('zIndex', 1);
			}
		}
		else {
			thisTag.removeClass(className_Close);
			thisTag.addClass(className_Open);

			$('div.scrim').css('zIndex', 100);

			thisTag.css('zIndex', 199);

			// OBSOLETE - OPEN/SHOW NAVMENU (clicked from navHeader bar)
			if (thisTag.hasClass('Nav__icon')) {
				//showDivTag.css('zIndex', FormUtil.screenMaxZindex() + 1 );
				showDivTag.css('zIndex', parseInt($('#Nav1').css('zIndex')) + 1);
				showDivTag.show();
				showDivTag.css('width', FormUtil.navDrawerWidthLimit(document.body.clientWidth) + 'px');
				showDivTag.css('left', '0px');

				//if ( $( 'div.floatListMenuSubIcons' ).hasClass( className_Open ) )
				//{
				//	$( 'div.floatListMenuIcon' ).css('zIndex',1);
				//	$( 'div.floatListMenuIcon' ).click();
				//}
			}
			else {
				showDivTag.css('zIndex', 200);
				showDivTag.fadeIn('fast', 'linear');
			}


			// OBSOLETE - USED FOR MENU SHOW..
			if (className_Open.indexOf('imggroupBy') < 0) {
				$('div.scrim').off('click').on('click', function (event) {
					thisTag.css('zIndex', 1);
					event.preventDefault();
					thisTag.click();
				});

				if ($('div.scrim').css('opacity') !== Constants.focusRelegator_MaxOpacity) $('div.scrim').css('opacity', Constants.focusRelegator_MaxOpacity);
				$('div.scrim').show();

				if (showDivTag) FormUtil.setStackOrder(showDivTag, 'div.scrim');
			}

		}
	});
}


// NOTE: NEW IMPLEMENTATION
FormUtil.setClickSwitchEvent2 = function (clickBtnTag, targetDivTag, openCloseClass) {
	// In menu show case, 'clickBtnTag' is the menu icon for showing menu div.
	//		- 'showDivTag' is the menu div that gets shown.
	clickBtnTag.off('click').on('click', function (event) {
		event.preventDefault();

		var thisTag = $(this);

		var className_Open = openCloseClass[0];
		var className_Close = openCloseClass[1];

		// ALREADY OPEN 
		if (thisTag.hasClass(className_Open)) {
			// Switch icon class
			thisTag.removeClass(className_Open);
			thisTag.addClass(className_Close);

			if (targetDivTag) targetDivTag.hide();
		}
		else {
			// Switch icon class
			thisTag.removeClass(className_Close);
			thisTag.addClass(className_Open);

			if (targetDivTag) targetDivTag.show();
		}
	});
}


FormUtil.setStackOrderHigherThan = function (targetTag, higherThanTag) {	//test code added by Greg
	var newZidx = parseInt($(higherThanTag).css('zIndex')) + 1;
	//console.log( $( targetTag ).css( 'zIndex' ), targetTag );
	$(targetTag).css('zIndex', newZidx);
}

FormUtil.setStackOrder = function (arrObjTags) {	//test code added by Greg
	var stackFrom = FormUtil.screenMaxZindex();
	//console.log( arrObjTags );
	for (var i = 0; i < arrObjTags.length; i++) {
		var stackObj = arrObjTags[i];

		if (stackObj) {
			stackFrom += 1;
			$(stackObj).css('zIndex', stackFrom);
		}

	}
}

FormUtil.showScreenStackOrder = function (parent) {	//test code added by Greg

	var parentObj = parent || document.body;
	var children = parentObj.childNodes, length = children.length;
	var arrStacks = [], i = 0;


	function deepCss(who, css) {
		var sty, val, dv = document.defaultView || window;
		if (who.nodeType == 1) {
			sty = css.replace(/\-([a-z])/g, function (a, b) {
				return b.toUpperCase();
			});
			if (sty && who && who.style[sty]) {
				val = who.style[sty];
				if (!val) {
					if (who.currentStyle) val = who.currentStyle[sty];
					else if (dv.getComputedStyle) {
						val = dv.getComputedStyle(who, "").getPropertyValue(css);
					}
				}
			}
		}
		return val || "";
	}
	console.log(length);

	while (i < length) {
		who = children[i++];
		//console.log( who );
		if (who.nodeType != 1) continue; // element nodes only
		//opacity = deepCss(who,"opacity");
		if ($(who).is(':visible')) {
			if (deepCss(who, "position") !== "static") {
				temp = deepCss(who, "z-index");
				if (temp == "auto") { // positioned and z-index is auto, a new stacking context for opacity < 0. Further When zindex is auto ,it shall be treated as zindex = 0 within stacking context.
					(opacity > 0) ? temp = FormUtil.screenMaxZindex(who) : temp = 0;
				} else {
					temp = parseInt(temp, 10) || 0;
				}
			} else { // non-positioned element, a new stacking context for opacity < 1 and zindex shall be treated as if 0
				(opacity > 0) ? temp = FormUtil.screenMaxZindex(who) : temp = 0;
			}
			console.log(who, temp);
		}

	}

}


// THIS IS USED ON LOGIN - ALSO NEED TO BE CHANGED LIKE 'setUpNewUITab'
FormUtil.setUpTabAnchorUI = function (tag, targetOff, eventName) {

	tag.find('li').on('click', function () {
		console.log($(this));
		var tab_select = $(this).attr('rel');

		console.log($(this));

		if (FormUtil.orientation() == 'portrait' && $(window).width() <= 568) {
			console.log('got here');
			console.log($(this).find('ul'));
			if ($(this).find('ul').is(':visible')) {
				$(this).find('ul').css('display', 'none');
				$(this).find('li').css('display', 'none');
				$(this).next('ul').toggle();
			} else {
				$(this).find('ul').css('display', 'block');
				$(this).find('li').css('display', 'block');
				$(this).next('ul').toggle();
			}

		}
		else {
			tag.find('.active').removeClass('active');  // both 'tabs' and 'tab_Content'

			//tag.siblings().find( '.active' ).empty();
			tag.siblings().find('.active').removeClass('active');  // both 'tabs' and 'tab_Content'

			tag.siblings('.tab_fs__container').find('div.tab_fs__container-content').each(function (index, element) {
				$(element).hide();
			});

			$(this).addClass('active');

			var activeTab = tag.siblings('.tab_fs__container').find("#" + tab_select);

			activeTab.addClass('active');
			activeTab.fadeIn(); //show();
		}

	});



	// prevent multiple click events being created when listPage scrolling triggers append of new 'expandable' items
	if (targetOff && eventName) {
		tag.find(targetOff).off(eventName);
	}

	// Mobile view 'Anchor' class ('.expandable') click event handler setup
	tag.find('.expandable').on('click', function (event) //GREG here
	{
		event.preventDefault();

		var liTag_Selected = $(this).parent();
		var tabId = liTag_Selected.attr('tabId');
		var matchingTabsTag = tag.find(".tabs > li[tabId='" + tabId + "']");
		var bThisExpanded = $(this).hasClass('expanded');

		tag.find('.active').removeClass('active');
		matchingTabsTag.addClass("active");

		tag.find('.expanded').removeClass('expanded');
		tag.find('.expandable-arrow').attr('src', './images/arrow_down.svg');

		if (bThisExpanded) {
			$(this).find(".expandable-arrow").attr('src', './images/arrow_down.svg');
		}
		else {
			$(this).addClass('expanded');
			$(this).find(".expandable-arrow").attr('src', './images/arrow_up.svg');
		}

	});
}

FormUtil.setForReloading = function (liTag) {
	liTag.attr('reloading', 'Y');
};


FormUtil.setUpEntryTabClick = function (tag, targetOff, eventName) {
	// tag at here is 'blockTag' in mainTab.  li is tab buttons.
	tag.find('li').on('click', function (e) {
		e.stopPropagation();

		var selLiTag = $(this);

		var Primary = selLiTag.hasClass('primary');
		var Secondary = selLiTag.hasClass('secondary');
		var ulOptionsPopup = selLiTag.find('ul');


		// If portrait mode small screen, (which has fullTab on click dropdown show)
		//   - On Small Screen Case, Show the dropdown (collapsed tab list)
		if (FormUtil.orientation() === 'portrait'
			&& $(window).width() <= 558
			&& selLiTag.hasClass('active')) // class 'active' will always be li.primary
		{
			// If dropdown is shown, hide it.
			if (ulOptionsPopup.is(':visible')) {
				ulOptionsPopup.css('display', 'none');
				selLiTag.find('li').css('display', 'none');
			}
			else {
				// TODO: or reloading..  do not show the dropdown..

				if (selLiTag.attr('openingClick') === 'Y') selLiTag.attr('openingClick', '');
				else if (selLiTag.attr('reloading') === 'Y') selLiTag.attr('reloading', '');
				else {
					// Show the hidden dropdown (ul)
					ulOptionsPopup.css('display', 'block');

					selLiTag.find('li').not('.tabHide').css('display', 'block');
					selLiTag.next('ul').toggle();  // Why this?

					FormUtil.setUpHideOnBodyClick(function () {
						ulOptionsPopup.css('display', 'none');
						selLiTag.find('li').css('display', 'none');
					});
				}
			}
		}
		else {
			// On tab (li) selection, normal cases..

			// Why these?  active has css style for small screen case?
			tag.find('.active').removeClass('active');  // both 'tabs' and 'tab_Content'
			tag.siblings().find('.active').removeClass('active');  // both 'tabs' and 'tab_Content'

			tag.siblings('.tab_fs__container').find('div.tab_fs__container-content').hide();

			var tab_select = selLiTag.attr('rel');
			var activeTab = tag.siblings('.tab_fs__container').find('.tab_fs__container-content[tabButtonId="' + tab_select + '"]');

			if (Primary) {
				if (!selLiTag.hasClass('active')) selLiTag.addClass('active');
			}
			else {
				ulOptionsPopup.hide();
				$("ul.secondary").hide();
				$("li.secondary").hide();

				selLiTag.closest('li.primary').siblings('li[rel=' + tab_select + ']').addClass('active');
			}

			if (!activeTab.hasClass('active')) activeTab.addClass('active');
			activeTab.fadeIn(); //show();

		}

		// After all operation, clear the one off temporary attribute values.
		selLiTag.attr('reloading', '').attr('openingClick', '');
	});
};


FormUtil.orientation = function () {

	switch (window.orientation) {
		case -90:
			return '';
		case 90:
			return 'landscape';
			break;
		default:
			return 'portrait';
			break;
	}
}

FormUtil.getRedeemPayload = function (id) {

	var redPay = JSON.parse(sessionStorage.getItem(id))

	if (redPay) {
		return redPay;
	}

}


// ======================================

FormUtil.checkTag_CheckBox = function (tag) {
	var isType = false;

	if (tag) {
		if (tag.attr('type') === 'checkbox') isType = true;
	}

	return isType;
}


FormUtil.setTagVal = function (tag, val, returnFunc) {
	// 'val' could be optionally object.
	//		- If object, then we usually pass val with defaultValue Object..
	//				For further eval the different types of defaults
	//			- 'payloadConfigEval'  <-- object
	//			- 'eval' <-- simple value eval

	// Wrapp it with Try / Catch?  <--- parent methods might handle this on their own way?

	if (val) {
		if (Util.isTypeObject(val)) {
			// Object type json val set to inputTag
			var valJson = val;
			var finalVal = '';

			// Normally for 'defaultValue' json def object

			// 'paylaodConfigSelection' is added to 'defaultValue' config in blockForm.setFormItemJson_DefaultValue_PayloadConfigSelection();
			if (valJson.payloadConfigEval && valJson.paylaodConfigSelection) {
				finalVal = FormUtil.eval(valJson.payloadConfigEval[valJson.paylaodConfigSelection]);
			}
			else if (valJson.eval) {
				finalVal = FormUtil.eval(valJson.eval);
			}

			tag.val(finalVal);
		}
		else {
			// Non-Object types value set to inputTag

			// TODO: NEED TO FIND OUT WHY THIS WAS DISABLED --> PROBABLY WAS IN CONFLICT WITH SOME PARTS 
			// [REMOVED] CheckBox SET  // RESTORED FOR EDIT FEATURE 
			if (FormUtil.checkTag_CheckBox(tag)) {
				tag.prop('checked', (val === 'true' || val === true));
				tag.val(val);
			}
			// Special eval key type field - '{ ~~~ }' - HAS SOME DATA MANIPULATION FUNCTIONS PATTERN..
			else if (Util.isTypeString(val) && (val.indexOf('{') && val.indexOf('}'))) {
				FormUtil.evalReservedField(tag.closest('form'), tag, val);
			}
			else {
				tag.val(val);
			}
		}

		if (returnFunc) returnFunc();
	}
};


FormUtil.eval = function (val) {
	var evalVal = '';

	try {
		if (val) evalVal = eval(val);
	}
	catch (errMsg) {
		console.log('Error on FormUtil.eval, value: ' + val + ', errMsg: ' + errMsg);
	}

	return evalVal;
};


FormUtil.dispatchOnChangeEvent = function (targetControl) {
	if ("createEvent" in document) {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent('change', true, true);
		targetControl[0].dispatchEvent(evt);
	}
	else {
		targetControl[0].fireEvent("onchange");
	}
}

FormUtil.evalReservedField = function (form, tagTarget, val, dispatchChangeEvent) {
	var dispatchChange = (dispatchChangeEvent === undefined ? false : dispatchChangeEvent);

	if (val.indexOf('$${') >= 0) {
		// do something ? $${ reserved for other use? Bruno may have examples from existing DCD configs
		dispatchChange = false;
	}
	else if (val.indexOf('##{') >= 0) {
		if (val.indexOf('getCoordinates()') >= 0) {
			if (tagTarget.val() != FormUtil.geoLocationCoordinates) {
				FormUtil.refreshGeoLocation(function () {
					if (FormUtil.geoLocationLatLon.length) {
						MsgManager.notificationMessage('<img src="images/sharp-my_location-24px.svg">', 'notifGray', undefined, '', 'right', 'top', 1000, false, undefined, 'geolocation', true, true);
					}
					tagTarget.val(FormUtil.geoLocationCoordinates);
				});
			}
		}
		else if (val.indexOf('newDateAndTime()') >= 0) {
			tagTarget.val((new Date()).toISOString());
		}
		else if (val.indexOf('generatePattern(') >= 0) {
			var pattern = Util.getParameterInside(val, '()');
			tagTarget.val(Util2.getValueFromPattern(tagTarget, pattern, false));
		}
		else if (val.indexOf('getAge(') >= 0) {
			var pattern = Util.getParameterInside(val, '()');
			tagTarget.val(Util2.getAgeValueFromPattern(tagTarget, pattern));
		}
		else if (val.indexOf('epoch') >= 0) {
			if (tagTarget.val().length == 0) {
				tagTarget.val(pwaEpoch.epochByStr(Util.getParameterInside(val, '()')));
			}
		}
		else if (val.indexOf('dataURI') >= 0) {
			var sourceInput = Util.getParameterInside(val, '()');
			FormUtil.setQRdataURI(sourceInput, tagTarget);
		}
	}
	else if (val.indexOf('eval{') >= 0) {
		// do something ? $${ reserved for other use? Bruno may have examples from existing DCD configs
		var pattern = Util.getParameterInside(val, '{}');
		var valEval = FormUtil.tryEval(form, pattern);
		if (valEval !== undefined) tagTarget.val(valEval);
	}
	else {
		tagTarget.val(val);
	}

	if (dispatchChange) tagTarget.change();
}


FormUtil.setQRdataURI = function (sourceInput, imgInputTag) {
	var qrContainer = $('#qrTemplate');
	qrContainer.empty();

	var myQR = new QRCode(qrContainer[0]);
	var inputVal = $('[name=' + sourceInput + ']').val();

	myQR.fetchCode(inputVal, function (dataURI) {

		var previewTag = $('[name=' + imgInputTag.attr('name') + ']')
		previewTag.attr('src', dataURI);
		imgInputTag.val(dataURI);

	})

}

FormUtil.getTagVal = function (tag, option) {
	var val = '';

	if (tag) {
		try {
			if (FormUtil.checkTag_CheckBox(tag)) {
				val = tag.prop('checked');
			}
			else {
				val = Util.trim(tag.val()); // Trim the white space front/back of input value
			}

			// Allow 'false' & '0', but undefined/null should be changed to emtpy string.
			if (val === undefined || val === null) val = '';
		}
		catch (errMsg) {
			console.log('ERROR in FormUtil.getTagVal, ' + errMsg);
		}
	}

	return val;
};


FormUtil.getManifest = function () {
	// Need to be called after jquery library is loaded and need to use sync call?
	$.get('manifest.json', function (jsonData, status) {
		if (status == 'success') {
			return jsonData
		}
	});
}

FormUtil.tryEval = function (form, evalTry) {
	var returnVal;

	// do not remove parameter [form] < required for scope search, e.g. "eval{ form.find( 'name=commonRepeatingFieldNameFoundOnOtherTab]' ).val() }"
	try {
		returnVal = eval(evalTry);
	}
	catch (errMsg) {
		console.log('Error on FormUtil.tryEval, errMsg: ' + errMsg + ' ==> ON: ' + evalTry);
	}

	return returnVal;
}

FormUtil.trackPayload = function (payloadName, jsonData, optClear, actDefName) {
	var traceData = sessionStorage.getItem('WSexchange');
	var traceObj;

	if (!traceData) traceObj = {};
	else traceObj = JSON.parse(traceData);

	if (traceData) {
		traceObj[payloadName] = jsonData;

		if (optClear) {
			traceObj[optClear] = '';
		}
	}
	else {
		if (optClear) {
			traceObj = { [payloadName]: jsonData, [optClear]: '', history: [] };
		}
		else {
			traceObj = { [payloadName]: jsonData, history: [] };
		}
	}

	traceObj.history.push({ "actionType": payloadName, "actionDef": actDefName, "created": (new Date()).toISOString(), "data": jsonData });

	sessionStorage.setItem('WSexchange', JSON.stringify(traceObj));

}

/* - Not used anymore?
FormUtil.setLastPayload = function( payloadName, jsonData, optClear )
{
	var sessionData = localStorage.getItem(Constants.storageName_session);

	if ( sessionData )
	{
		var SessionObj = JSON.parse( sessionData );

		if ( SessionObj.last )
		{
			SessionObj.last[ payloadName ] = jsonData;

			if ( optClear)
			{
				SessionObj.last[ optClear ] = '';
			}
		}
		else
		{
			if ( optClear)
			{
				SessionObj.last = { [payloadName]: jsonData, [optClear]: '' };
			}
			else
			{
				SessionObj.last = { [payloadName]: jsonData };
			}
		}

		localStorage.setItem( Constants.storageName_session, JSON.stringify( SessionObj ) );
	}
}
*/


FormUtil.getLastPayload = function (namedPayload) {
	var sessionData = sessionStorage.getItem('WSexchange');

	if (sessionData) {
		var SessionObj = JSON.parse(sessionData);

		if (SessionObj && SessionObj[namedPayload]) {
			return SessionObj[namedPayload];
		}

	}
}


// Obsolete?
FormUtil.deleteCacheKeys = function (thenFunc) {
	if (caches) {
		caches.keys().then(function (names) {
			for (let name of names) {
				if (name.toString().indexOf('google') >= 0 || name.toString().indexOf('workbox') >= 0) {
					//console.log( 'skipping cache obj ' + name );
				}
				else {
					console.log('deleting cacheStorage obj: ' + name);
					caches.delete(name);
				}
			}

			if (thenFunc) thenFunc();

		});
	}
}

// Obsolete?
FormUtil.swCacheReset = function (returnFunc) {
	if (caches) {
		var cachesCount = 0;
		var deteteLeft = 0;

		caches.keys().then(function (names) {

			cachesCount = names.length;
			deteteLeft = cachesCount;

			for (let name of names) {
				console.log('deleting cache: ' + name);

				caches.delete(name).then(function (status) {

					console.log('Delete Status: ' + status);

					cachesCount--;
					if (status) deteteLeft--;

					if (cachesCount <= 0) {
						var allDeleted = (deteteLeft <= 0);
						returnFunc(allDeleted);
					}
				});
			}
		});
	}
	else {
		// Browser not supporting Service Worker Caches
		returnFunc(false);
	}
}

//FormUtil.updateSyncListItems = function( redList, retFunc )
FormUtil.updateStat_SyncItems = function (redList, retFunc) {
	FormUtil.records_redeem_submit = 0;
	FormUtil.records_redeem_queued = 0;
	FormUtil.records_redeem_failed = 0;


	var returnList = redList.list.filter(a => a.owner == SessionManager.sessionData.login_UserName);

	var myQueue = returnList.filter(a => a.status == Constants.status_queued);
	var myFailed = returnList.filter(a => a.status == Constants.status_failed); //&& (!a.networkAttempt || a.networkAttempt < Constants.storage_offline_ItemNetworkAttemptLimit) );
	var mySubmit = returnList.filter(a => a.status == Constants.status_submit);

	FormUtil.records_redeem_submit = mySubmit.length;
	FormUtil.records_redeem_queued = myQueue.length;
	FormUtil.records_redeem_failed = myFailed.length;

	//syncManager.dataQueued = myQueue;
	//syncManager.dataFailed = returnList.filter( a=>a.status == Constants.status_redeem_failed && ( a.networkAttempt && a.networkAttempt < Constants.storage_offline_ItemNetworkAttemptLimit) );;

	retFunc(returnList);
}

FormUtil.updateProgressWidth = function (W) {
	//$( '#divProgressBar' ).css( 'display', 'block' );
	//$( '#divProgressBar' ).css( 'zIndex', '100' );
	//$( '#divProgressBar' ).css('width', W );
	$('div.indeterminate').css('width', W);
	$('div.determinate').css('width', W);
}

FormUtil.showProgressBar = function (width) {
	if (width) {
		$('div.indeterminate').css('width', width);
		$('div.determinate').css('width', width);
	}
	$('#divProgressBar').css('display', 'block');
	//$( '#divProgressBar' ).css( 'zIndex', '200' );
	$('#divProgressBar').show();
}

FormUtil.hideProgressBar = function () {
	$('#divProgressBar').hide();
	//$( '#divProgressBar' ).css( 'zIndex', '0' );
}


FormUtil.navDrawerWidthLimit = function (screenWidth) {
	/* BASED ON Responsive.css VALUES FOR SCREEN WIDTH  */
	/* NB: IF tests to be ordered in descending order of size  */

	var expectedWidth;

	/* 2B. 2 column input wider than 866px */
	if (screenWidth >= 866) {
		expectedWidth = 400;
	}

	/* 2A. 1 column input less than 866px */
	if (screenWidth <= 865) {
		expectedWidth = 400;
	}

	/* 1B. Tab content mode - hide Anchor */
	/*if ( screenWidth >= 560)
	{
		expectedWidth = 360;
	}*/

	/* 1A. Smallest Anchor Mode 560 */
	if (screenWidth <= 559) {
		expectedWidth = 280;
	}

	return expectedWidth;

};

FormUtil.getTermAttr = function (jsonItem) {
	return (jsonItem.term) ? 'term="' + jsonItem.term + '"' : '';
};

FormUtil.addTag_TermAttr = function (tags, jsonItem) {
	if (jsonItem.term) tags.attr('term', jsonItem.term);
};

// Used in activityCard icon rendering..
FormUtil.appendActivityTypeIcon = function (iconObj, activityType, statusOpt, cwsRenderObj, iconStyleOverride, activityJson)  // TODO: remove unused params
{
	try {
		if (iconObj && activityType) {
			if (activityType.icon.path) {
				iconObj.each(function () {
					var iconDivTag = $(this);

					if (iconDivTag.find('img').length === 0) {
						iconDivTag.html('<img src="' + activityType.icon.path + '" style="width:56px; height:56px;">');
					}
				});
			}
		}
	}
	catch (errMsg) {
		console.log('Error on FormUtil.appendActivityTypeIcon, errMsg: ' + errMsg);
	}
}

FormUtil.getPositionObjectJSON = function (pos) {
	var retJSON = {};

	for (var propt in pos.coords) {
		retJSON[propt] = pos.coords[propt];
	}

	return retJSON;
}

FormUtil.refreshGeoLocation = function (returnFunc) { // --> move to new geolocation.js class
	var error_PERMISSION_DENIED = 1;

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			var myPosition = FormUtil.getPositionObjectJSON(position);
			var lat = myPosition.latitude;
			var lon = myPosition.longitude;
			var userLocation;

			if (lat == null) {
				userLocation = ''; //GPS not activated
				FormUtil.geoLocationError = 'GPS not activated';
			}
			else {
				userLocation = parseFloat(lat).toFixed(6) + ', ' + parseFloat(lon).toFixed(6); //6 decimals is crazy accurate, don't waste time with more (greg)
				FormUtil.geoLocationError = '';
			}

			FormUtil.geoLocationLatLon = userLocation;
			FormUtil.geoLocationCoordinates = JSON.stringify(myPosition);

			if (returnFunc) returnFunc();

		}, function (error) {
			FormUtil.geoLocationError = error.code; //Error locating your device

			if (error.code == error_PERMISSION_DENIED) {
				FormUtil.geoLocationLatLon = '';
			}
			else {
				FormUtil.geoLocationLatLon = '';
			}

			if (returnFunc) returnFunc();

		},
			{ enableHighAccuracy: false, timeout: 20000 } // enableHighAccuracy set to FALSE by Greg: if 'true' may result in slower response times or increased power consumption
		);
	}
	else {
		FormUtil.geoLocationLatLon = '';
		FormUtil.geoLocationError = -1;
		FormUtil.geoLocationCoordinates = '';
	}

}


FormUtil.screenMaxZindex = function (parent, limit) {

	limit = limit || Infinity;
	parent = parent || document.body;
	var who, temp, max = 1, opacity, i = 0;
	var children = parent.childNodes, length = children.length;

	function deepCss(who, css) {
		var sty, val, dv = document.defaultView || window;
		if (who.nodeType == 1) {
			sty = css.replace(/\-([a-z])/g, function (a, b) {
				return b.toUpperCase();
			});
			if (sty && who && who.style[sty]) {
				val = who.style[sty];
				if (!val) {
					if (who.currentStyle) val = who.currentStyle[sty];
					else if (dv.getComputedStyle) {
						val = dv.getComputedStyle(who, "").getPropertyValue(css);
					}
				}
			}
		}
		return val || "";
	}

	while (i < length) {
		who = children[i++];
		if (who.nodeType != 1) continue; // element nodes only
		opacity = deepCss(who, "opacity");
		if (deepCss(who, "position") !== "static") {
			temp = deepCss(who, "z-index");
			if (temp == "auto") { // positioned and z-index is auto, a new stacking context for opacity < 0. Further When zindex is auto ,it shall be treated as zindex = 0 within stacking context.
				(opacity > 0) ? temp = FormUtil.screenMaxZindex(who) : temp = 0;
			} else {
				temp = parseInt(temp, 10) || 0;
			}
		} else { // non-positioned element, a new stacking context for opacity < 1 and zindex shall be treated as if 0
			(opacity > 0) ? temp = FormUtil.screenMaxZindex(who) : temp = 0;
		}
		if (temp > max && temp <= limit) max = temp;
	}
	return max;

}

FormUtil.wsExchangeDataGet = function (formDivSecTag, recordIDlist, localResource) {
	var inputsJson = {};
	var inputTags = formDivSecTag.find('input,checkbox,select');
	var arrPayStructure = localResource.split('.');
	var WSexchangeData = JSON.parse(sessionStorage.getItem('WSexchange'));
	var lastPayload = WSexchangeData[arrPayStructure[0]];

	inputTags.each(function () {
		var inputTag = $(this);
		var attrDisplay = inputTag.attr('display');
		var nameVal = inputTag.attr('name');
		var getVal_visible = false;
		var getVal = false;

		if (attrDisplay === 'hiddenVal') getVal_visible = true;
		else if (inputTag.is(':visible')) getVal_visible = true;

		if (getVal_visible) {
			// Check if the submit var list exists (from config).  If so, only items on that list are added.
			if (recordIDlist === undefined) {
				getVal = true;
			}
			else {
				if (recordIDlist.indexOf(nameVal) >= 0) getVal = true;
			}
		}

		if (getVal) {
			var val = FormUtil.getTagVal(inputTag);

			inputsJson[nameVal] = val;
		}

	});

	var retData = FormUtil.recursiveWSexchangeGet(WSexchangeData, arrPayStructure, 0, recordIDlist[0], inputsJson[recordIDlist[0]]);

	lastPayload['displayData'] = retData;

	if (retData && lastPayload['resultData']) {
		lastPayload['resultData']['status'] = "foundOne";
	}

	return lastPayload;

}


FormUtil.recursiveWSexchangeGet = function (targetDef, dataTargetHierarchy, itm, keyFind, keyValue) {
	var targetArr;

	if (dataTargetHierarchy[itm]) {
		// check if next item exists > if true then current item is object ELSE it is array (destination array for values)
		if (dataTargetHierarchy[itm + 1]) {
			return FormUtil.recursiveWSexchangeGet(targetDef[dataTargetHierarchy[itm]], dataTargetHierarchy, parseInt(itm) + 1, keyFind, keyValue)
		}
		else {
			var arrSpecRaw = (dataTargetHierarchy[itm]).toString().replace('[', '').replace(']', '');
			var targetArr = targetDef[arrSpecRaw]; //always returns 2-level array (array of arrays)

			for (var i = 0; i < targetDef[arrSpecRaw].length; i++) {

				for (var t = 0; t < targetArr[i].length; t++) {

					if (targetArr[i][t].id == keyFind && targetArr[i][t].value == keyValue) {
						return targetArr[i];
					}
				}
			}
		}
	}
}



FormUtil.getActivityTypes = function () {
	// get different 'Areas' or Activity-Types
	// var sessData = localStorage.getItem(Constants.storageName_session);
	var userName = AppInfoLSManager.getUserName();
	var retArr = [];

	if (userName) {
		var itms = ConfigManager.getActivityDef().activityTypes;

		if (itms && itms.length) {
			for (var i = 0; i < itms.length; i++) {
				retArr.push({ name: itms[i].name, jsonObj: itms[i] });
			}
		}

	}

	return retArr;
};


FormUtil.getActivityTypeByRef = function (field, val) {
	// get different 'Areas' or Activity-Types
	// var sessData = localStorage.getItem(Constants.storageName_session);

	var itms = ConfigManager.getActivityDef().activityTypes;

	if (itms && itms.length) {
		for (var i = 0; i < itms.length; i++) {
			if (itms[i][field] === val) return itms[i];
		}
	}

};


// --------------------------------------------------------------------------------------
/// For preview details data

FormUtil.DISPLAY_DATA_DETAILS_AS_TABLE = `<div style="display: table-row;" >
		<div style="display: table-cell;" class='fieldName name'></div>
		<div style="display: table-cell;" class='fieldValue value'></div>
	</div>`;


// 1. Used by activity form data preview before payload generation.
FormUtil.renderPreviewDataForm = function (jsonData, tabTag) {
	var detailsTag = FormUtil.previewData_Standard(jsonData);
	tabTag.append(detailsTag);
};

// 2. Used by activity detail tab data display.
FormUtil.displayActivityDetail = function (clientDetails, activityJson, tabTag) {
	var detailTabContent = ConfigManager.getActivityDetailTabContent();

	if (detailTabContent.displayMode == 1) // New style without block
	{
		var detailsTag = FormUtil.previewData_Standard(clientDetails, $(ActivityCardDetail.clientInfoTag), $("<div style='width:100%; display:flex; flex-wrap:wrap;'/>"));
		detailsTag.prepend('<div class="section"><label term="activityDetail_details_title">clientDetails:</label></div>');
		tabTag.append(detailsTag);
	}
	else if (detailTabContent.displayMode == 2) // With block defined
	{
		var detailsTag = FormUtil.renderPreviewDataForm_WithBlockDefination(clientDetails);
		tabTag.append(detailsTag);
	}
	else //if( detailTabContent.displayMode == 0 ) // Old style
	{
		// New Activity Details + Client Details in Table rows

		var content = detailTabContent.content;
		var bShowClient = false;
		var bShowActivity = false;
		var bJson = detailTabContent.bJson;

		if (!content) bShowClient = true;
		else if (content === 'both') { bShowClient = true; bShowActivity = true; }
		else if (content === 'client') { bShowClient = true; }
		else if (content === 'activity') { bShowActivity = true; }


		// Create table..
		if (bShowActivity) {
			var actJson = {};
			actJson.date = activityJson.date;
			actJson.transactions = activityJson.transactions;

			tabTag.append('<div class="section" style="margin-left: 0px !important;"><label term="">ACTIVITY DETAIL:</label></div>');
			tabTag.append('<div class="section" style="padding: 2px;"><label term="">Date:</label> <a class="dateTypeSwitch" style="display: none;">Loc</a></div>');

			var datesLoc = FormUtil.dateFieldTypeFilter(actJson.date, 'Loc');

			tabTag.find('div.actDate').remove();
			tabTag.append(FormUtil.jsonDataInTable_Wrap(datesLoc, { tableClass: 'actDate', divTablePaddingLeft: '10px', SndTab: '20px' }));

			//FormUtil.switchDateJson( tabTag.find( 'a.dateTypeSwitch' ), actJson.date, function( datesJson ) {
			//	tabTag.find( 'div.actDate' ).remove();
			//	tabTag.append( FormUtil.jsonDataInTable_Wrap( datesLoc, { tableClass: 'actDate', divTablePaddingLeft: '10px', SndTab: '20px' } ) );
			//});

			actJson.transactions.forEach(trans => {
				if (trans.type) {
					if (trans.type.indexOf('s_dhis2Program') === 0) { }
					else {
						tabTag.append('<div style="width:100%;"><hr style="border: 1px solid darkgrey;opacity: 0.3;"></div>');

						var secTag = $('<div class="section" style="padding: 2px;"><label class="secLabel" term="">TransType</label> [<label class="secLabel2">' + trans.type + '</label>]:</label></div>');
						FormUtil.populateFieldTerms('TransType', secTag.find('.secLabel'));
						FormUtil.populateFieldTerms(trans.type, secTag.find('.secLabel2'));
						tabTag.append(secTag);

						// for each object, display subsection..
						for (var prop in trans) {
							if (prop !== 'type') {
								var dataJson = trans[prop];

								tabTag.append('<div class="section" style="padding-left: 10px; color: #333;"><label term="">' + prop + ':</label></div>');
								tabTag.append(FormUtil.jsonDataInTable_Wrap(dataJson, { divTablePaddingLeft: '20px', SndTab: '30px' }));
							}
						}
					}
				}
			});
		}

		if (bShowClient) {
			if (bShowActivity) tabTag.append('<div style="width:100%;"><hr style="border: 1px solid darkgrey;opacity: 0.3;"></div>');

			tabTag.append('<div class="section" style="margin-left: 0px !important;"><label term="activityDetail_details_title">Client Details:</label></div>');
			tabTag.append(FormUtil.jsonDataInTable_Wrap(clientDetails, { divTablePaddingLeft: '10px', SndTab: '20px' }));
		}


		// Set same width..
		var widthMax;
		var nameFields = tabTag.find('.fieldName.name_sub');
		nameFields.each(function () {
			var itemWidth = $(this).width();
			if (!widthMax) widthMax = itemWidth;
			else if (itemWidth > widthMax) widthMax = itemWidth;
		});

		nameFields.width(widthMax);

	}
};


FormUtil.switchDateJson = function (switchTag, actDateJson, callBack) {
	if (callBack) {
		switchTag.click(function (e) {
			e.preventDefault();

			// Set the switch tagging..
			switchTag.text();

			// display with the date type filter			
			var datesLoc = FormUtil.dateFieldTypeFilter(actJson.date, 'Loc');

			if (callBack) callBack(datesLoc);
		});
	}
};

FormUtil.getDateTypesLinks = function () { }


//	tabTag.find( 'a.dateTypeSwitch' ), actJson.date, function( datesJson ) {
//	tabTag.append( FormUtil.jsonDataInTable_Wrap( datesLoc, { divTablePaddingLeft: '10px', SndTab: '20px' } ) );
//});

//var datesLoc = FormUtil.dateFieldTypeFilter( actJson.date, 'Loc' );


FormUtil.dateFieldTypeFilter = function (dateJson, type) {
	var newDataJson = {}; //Util.cloneJson( dateJson );

	// If 'type' is 'Loc / UTC'  <-- by checking last name
	for (var fieldName in dateJson) {
		if (Util.strEndsWith(fieldName, type)) {
			newDataJson[fieldName] = dateJson[fieldName];
		}
	}

	return newDataJson;
};


FormUtil.previewData_Standard = function (jsonData, templateFieldTag, formTag) {
	if (formTag === undefined) formTag = $('<div style="display: table;" />');
	if (templateFieldTag === undefined) templateFieldTag = FormUtil.DISPLAY_DATA_DETAILS_AS_TABLE;

	var hideEmptyVal = ConfigManager.getActivityDetailTabContent().hideEmptyVal;

	if (jsonData) {
		// 1. Make this call/method a recursive
		// 2. Create a new table for each jsonData...

		for (var fieldName in jsonData) {
			var value = jsonData[fieldName];

			if (fieldName.indexOf("--SECTION") == 0) {
				formTag.append('<div class="section"><label>' + value + '</label></div>');
			}
			else {
				value = FormUtil.getFieldOption_LookupValue(fieldName, value);

				if (!hideEmptyVal || (hideEmptyVal && value !== "")) {
					var valueTag = FormUtil.createValueTag(fieldName, value, $(templateFieldTag));
					if (valueTag != undefined) formTag.append(valueTag);
				}
			}
		}
	}

	formTag.find(".fieldBlock").css("border", "none");

	return $("<div style='width:100%'></div>").append(formTag);
};


FormUtil.jsonDataInTable_Wrap = function (jsonData, option) {
	var hideEmptyVal = ConfigManager.getActivityDetailTabContent().hideEmptyVal;

	return FormUtil.jsonDataInTable(jsonData, hideEmptyVal, option);
};


FormUtil.jsonDataInTable = function (jsonData, hideEmptyVal, option) {
	if (!option) option = {};
	var tableTag = $('<div style="display: table;" />');

	if (option.tableClass) tableTag.addClass(option.tableClass);
	if (option.divTablePaddingLeft) tableTag.css('padding-left', option.divTablePaddingLeft);

	if (jsonData) {
		// 1. Make this call/method a recursive
		// 2. Create a new table for each jsonData...

		for (var fieldName in jsonData) {
			var value = jsonData[fieldName];

			if (fieldName.indexOf("--SECTION") === 0) tableTag.append('<div class="section"><label>' + value + '</label></div>');
			else {
				if (!hideEmptyVal || (hideEmptyVal && value !== "")) {
					var fieldJson = ConfigManager.getDefinitionFieldById(fieldName);

					if (!fieldJson || !fieldJson.hidden) {
						var rowTag = $('<div style="display: table-row;" ></div>');
						tableTag.append(rowTag);


						// Name Part
						var nameFieldTag = $('<div style="display: table-cell;" class="fieldName name_sub"></div>');
						rowTag.append(nameFieldTag);
						nameFieldTag.html(Util.getStr(fieldName, 20, '..'));
						if (fieldJson) nameFieldTag.attr('term', fieldJson.term);   // if ( fieldJson.term ) nameFieldTag.attr( 'term', fieldJson.term );

						// Value Part
						var valueFieldTag = $('<div style="display: table-cell;" class="fieldValue value_sub"></div>');
						rowTag.append(valueFieldTag);


						if (Util.isTypeObject(value)) {
							var subTableTag = FormUtil.jsonDataInTable(value, hideEmptyVal, { divTablePaddingLeft: option.SndTab });
							valueFieldTag.append(subTableTag);
						}
						else if (Util.isTypeArray(value)) {
							value.forEach((pArrItem, i) => {
								if (Util.isTypeObject(pArrItem)) {
									valueFieldTag.append(FormUtil.jsonDataInTable(pArrItem, hideEmptyVal, { divTablePaddingLeft: option.SndTab }));
								}
								else {
									valueFieldTag.append(' ' + FormUtil.getFieldOption_LookupValue(fieldName, pArrItem.toString()) + ' ');
								}
							});
						}
						else if (Util.isTypeString(value)) {
							valueFieldTag.html(FormUtil.getFieldOption_LookupValue(fieldName, value));
						}
						else if (value !== undefined && value !== null) {
							try {
								valueFieldTag.html(FormUtil.getFieldOption_LookupValue(fieldName, value.toString()));
							} catch (errMsg) { console.log('ERROR in FormUtil.jsonDataInTable, other type value, ' + errMsg); }
						}
					}
				}
			}
		}
	}

	tableTag.find(".fieldBlock").css("border", "none");  // only applicable on block stytle..

	// ?? - Shouldn't we make the row width 100%??
	return $("<div style='width:100%'></div>").append(tableTag);
};



FormUtil.createValueTag = function (fieldName, value, templateFieldTag) {
	var fieldJson = ConfigManager.getDefinitionFieldById(fieldName);
	var showField = (fieldJson && fieldJson.hidden === true) ? false : true;

	if (showField) {
		templateFieldTag.find(".fieldName").html(fieldName);
		templateFieldTag.find(".fieldValue").html(Util.getJsonStr(value));

		return templateFieldTag;
	}

	return;
};


FormUtil.renderPreviewDataForm_WithBlockDefination = function (jsonData) {
	var formTag = $("<div style='width:100%'></div>");

	// Generate "passedData"
	var passedData = { "displayData": [], "resultData": [] };
	for (var id in jsonData) {
		passedData.displayData.push({ "id": id, "value": jsonData[id] });
	}

	// Render data by using Block defination
	var clientProfileBlockId = ConfigManager.getClientDef().clientProfileBlockId;
	FormUtil.renderBlockByBlockId(clientProfileBlockId, SessionManager.cwsRenderObj, formTag, passedData);

	// Remove Edit button or any buttons if any
	formTag.find("[btnid]").remove();

	// Remove empty fields if needed
	if (ConfigManager.getActivityDetailTabContent().dataOnly) {
		for (var key in jsonData) {
			var value = jsonData[key];
			if (value == "") {
				formTag.find("[name='" + key + "']").closest(".fieldBlock").remove();
			}
		}
	}

	return formTag;
}

FormUtil.createValueTag = function (fieldName, value, templateFieldTag) {
	var fieldJson = ConfigManager.getDefinitionFieldById(fieldName);
	var showField = (fieldJson && fieldJson.hidden === true) ? false : true;

	if (showField) {
		templateFieldTag.find(".fieldName").html(fieldName);
		templateFieldTag.find(".fieldValue").html(Util.getJsonStr(value));

		return templateFieldTag;
	}

	return;
};


FormUtil.getFieldOptions = function (fieldId) {
	var defFields = ConfigManager.getConfigJson().definitionFields;
	var defOptions = ConfigManager.getConfigJson().definitionOptions;

	var matchingOptions;
	var optionsName;

	// 1. Check if the field is defined in definitionFields & has 'options' field for optionsName used.
	if (defFields) {
		var matchField = Util.getFromList(defFields, fieldId, "id");

		if (matchField) {
			if (matchField.valueOption) optionsName = matchField.valueOption;
			else if (matchField.options) optionsName = matchField.options;
		}
	}

	// 2. Get options by name.
	if (optionsName && defOptions) {
		matchingOptions = defOptions[optionsName];
	}

	return matchingOptions;
};


FormUtil.getFieldOption_LookupValue = function (key, val) {
	var fieldOptions = FormUtil.getFieldOptions(key);
	var retValue = val;

	// If the field is in 'definitionFields' & the field def has 'options' name, get the option val.
	try {
		if (fieldOptions) {
			var matchingOption = Util.getFromList(fieldOptions, val, "value");

			if (matchingOption) {
				retValue = (matchingOption.term) ? TranslationManager.translateText(matchingOption.defaultName, matchingOption.term) : matchingOption.defaultName;
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in AcitivityCard.getFieldOptionLookupValue, errMsg: ' + errMsg);
	}

	return retValue;
};


FormUtil.populateFieldTerms = function (idName, tag) {
	if (idName && tag) {
		var fieldJson = ConfigManager.getDefinitionFieldById(idName);

		if (fieldJson) {
			tag.attr('term', fieldJson.term);
			tag.html(fieldJson.defaultName);
		}
	}
};

// ==============================================
//FormUtil.prevHideOnBodyFunc = undefined;

// SetUp - to close the list/etc on the item click or any other place on body
FormUtil.setUpHideOnBodyClick = function (hideFunc) {
	// PREV 1. WHEN SETTING IT UP, close other(previously added) methods just in case..
	//if ( FormUtil.prevHideOnBodyFunc ) FormUtil.prevHideOnBodyFunc();
	//FormUtil.prevHideOnBodyFunc = hideFunc; // PREV 2. Set for prevHide

	// Set if any place is clicked, calling the hiding function (hide list)
	$('body').off('click').on('click', function (e) {
		e.stopPropagation(); // other events are canceled..

		// When clicked, remove this..
		$('body').off('click');

		if (hideFunc) hideFunc();  // hide the list..

		//if ( FormUtil.prevHideOnBodyFunc ) FormUtil.prevHideOnBodyFunc = undefined; // PREV 3. If event is called, remove prevHide func.
	});
};

// ==============================================

// Use this to display a popup with some messages or interactions..
//FormUtil.openDivPopupArea( $( '#divPopupArea' ), populateProcess, closeProcess )
FormUtil.openDivPopupArea = function (divPopupAreaTag, populateProcess, closeProcess) {
	FormUtil.blockPage(undefined, function (scrimTag) {
		divPopupAreaTag.show();  // Always clear out 'mainContent' and reCreate it.
		$('.scrim').show();

		divPopupAreaTag.find('div.divExtraSec').remove();


		var divMainContentTag = divPopupAreaTag.find('.divMainContent');
		divMainContentTag.html('').attr('style', ''); // Reset the content & style.  // style="overflow: scroll;height: 85%; margin-top: 10px; background-color: #eee;padding: 7px;"

		var closeBtn = divPopupAreaTag.find('div.close');

		closeBtn.off('click').click(function () {
			$('.scrim').hide();
			divPopupAreaTag.hide();
			FormUtil.unblockPage(scrimTag);

			if (closeProcess) {
				try {
					closeProcess(divPopupAreaTag);
				} catch (errMsg) { console.log('ERROR during FormUtil.openDivPopupArea closeProcess, ' + errMsg); }
			}
		});


		scrimTag.off('click').click(function () {
			closeBtn.click();
		});


		if (populateProcess) {
			try {
				populateProcess(divMainContentTag, divPopupAreaTag);
			} catch (errMsg) { console.log('ERROR during FormUtil.openDivPopupArea populateProcess, ' + errMsg); }
		}

	});

};


// ==============================================
// ---- Client Offline search helper methods.

// For each property '$gte', '$lte', perform check.  if any of them fails, it fails..
FormUtil.mongoRangeCheck = function (condJson, sourceVal) {
	//{ "$gte": "1999-08-01",  "$lte": "2000-08-01" }
	var isMatch = true;

	try {
		for (var condKey in condJson) {
			var condVal = condJson[condKey];

			if (condKey === '$gte') {
				if (sourceVal >= condVal) { }
				else { isMatch = false; break; }
			}
			else if (condKey === '$gt') {
				if (sourceVal > condVal) { }
				else { isMatch = false; break; }
			}
			else if (condKey === '$lte') {
				if (sourceVal <= condVal) { }
				else { isMatch = false; break; }
			}
			else if (condKey === '$lt') {
				if (sourceVal < condVal) { }
				else { isMatch = false; break; }
			}
			else { isMatch = false; break; }
		}
	}
	catch (errMsg) {
		isMatch = false;
		console.log('ERROR in FormUtil.mongoRangeCheck, ' + errMsg);
	}

	return isMatch;
};


FormUtil.matchValueLVL1 = function (inputVal, dataVal) {
	var bMatch = false;

	try {
		if (dataVal) {
			// 1. Remove Dialact
			inputVal = inputVal.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
			dataVal = dataVal.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

			// 2. Remove Case
			inputVal = inputVal.toUpperCase();
			dataVal = dataVal.toUpperCase();

			// 3. Start with match.
			if (dataVal.indexOf(inputVal) === 0) bMatch = true;
		}
	}
	catch (errMsg) {
		console.log('ERROR in FormUtil.matchValueLVL1, ' + errMsg);
	}

	return bMatch;
};
