
// -------------------------------------------
// -- Utility Class/Methods
//
// GET & CHECK Variable Types Check
//
// Array Operation Related
//
// Recurrsive/iterative - synced call
//
// JSON Copy Related
//
// Try Cache / Eval related methods
//
// ---------------------------

function Util() { }

Util.MS_DAY = 86400000;
Util.MS_HR = 3600000;
Util.MS_MIN = 60000;
Util.MS_SEC = 1000;

Util.termName_pleaseSelectOne = "common_pleaseSelectOne";
Util.termName_listEmpty = "common_listEmpty";
//Util.termName_confirmed = ""; // 

Util.dateType1 = "yyyy-MM-ddTHH:mm:ss.SSS";
Util.dateType_DATE = "yyyy-MM-dd";
Util.dateType_DATETIME = "yyyy-MM-ddTHH:mm:ss.SSS";
Util.dateType_DATETIME_s1 = "MMM dd - HH:mm:ss";

Util.KEY_TEMPLATE_ADD = '[TMPL_ADD]';
Util.KEY_TEMPLATE_ADD_ARR = '[TMPL_ADD_ARR]';
Util.KEY_CONDITION_CHECK = '[COND_CHECK]';
Util.KEY_PROPERTY_REMOVE = '[PROP_REMOVE]';
Util.KEY_OBJECT_REMOVE = '[OBJ_REMOVE]';

Util.evalTryCatch_ERR = 'ERROR, evalTryCatch, ';
Util.ERR_FIX_OP = 'ERR_FixOp';

// ---------------------------
// GET & CHECK Variable Types Check

Util.isTypeObject = function (obj) {
	// Array is also 'object' type, thus, check to make sure this is not array.
	if (Util.isTypeArray(obj)) return false;
	else return (obj !== undefined && typeof (obj) === 'object');
};

Util.isTypeArray = function (obj) {
	return (obj !== undefined && Array.isArray(obj));
};

Util.isTypeString = function (obj) {
	return (obj !== undefined && typeof (obj) === 'string');
};

// ------------------------------------

Util.getStr = function (input, limit, tailStr) {
	var value = '';

	try {
		if (input !== undefined && input !== '') {
			// Convert the input into string value.
			if (Util.isTypeObject(input) || Util.isTypeArray(input)) value = JSON.stringify(input);
			else if (Util.isTypeString(input)) value = input;
			else value = input.toString();

			// If limit is passed, cut the length of string value to that limit length.
			if (limit && value.length > limit) {
				value = value.substr(0, limit);

				if (!tailStr) tailStr = '...';

				if (Util.isTypeString(tailStr)) value += tailStr;
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in Util.getStr, errMsg: ' + errMsg);
	}

	return value;
};

Util.getJson = function (input) {
	var value = {};

	try {
		if (input) {
			if (!Util.isObjEmpty(input)) {
				if (Util.isTypeString(input)) value = JSON.parse(input);
				else if (Util.isTypeObject(input) || Util.isTypeArray(input)) value = JSON.parse(JSON.stringify(input));
				else value = JSON.parse(input.toString());
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in Util.getJson, errMsg: ' + errMsg);
		console.log(input);
	}

	return value;
};

// Checks if the json is emtpy
Util.isObjEmpty = function (obj) {
	//for ( var key in obj ) { if ( obj.hasOwnProperty( key ) ) return false; }	
	//return true;
	return (Object.keys(obj).length === 0);
};

Util.isJsonEmpty = function (obj) {
	Util.isObjEmpty(obj);
};

Util.getProperValue = function (val) {
	Util.getNotEmpty(val);
};

Util.getNotEmpty = function (input) {

	if (Util.checkDefined(input)) {
		return input
	}
	else return "";
};

Util.checkDefined = function (input) {

	if (input !== undefined && input != null) return true;
	else return false;
};

Util.checkValue = function (input) {

	if (Util.checkDefined(input) && input.length > 0) return true;
	else return false;
};

Util.checkDataExists = function (input) {

	return Util.checkValue(input);
};

Util.checkData_WithPropertyVal = function (arr, propertyName, value) {
	var found = false;

	if (Util.checkDataExists(arr)) {
		for (var i = 0; i < arr.length; i++) {
			var arrItem = arr[i];
			if (Util.checkDefined(arrItem[propertyName]) && arrItem[propertyName] == value) {
				found = true;
				break;
			}
		}
	}

	return found;
};

Util.isInt = function (n) {
	return Number(n) === n && n % 1 === 0;
};

Util.isNumeric = function (n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
};

Util.getNum = function (n) {
	var val = 0;

	try {
		if (n) val = Number(n);
	}
	catch (err) { }

	return val;
};

Util.getNumber = function (n) {
	return Util.getNum(n);
};


// Get array from obj map json
Util.convertObjMapToArray = function (objMapJson) {
	var array = [];

	for (var key in objMapJson) {
		array.push({ key: key, value: objMapJson[key] });
	}

	return array;
};

Util.getArrayFromObjMap = function (objMapJson) {
	Util.convertObjMapToArray(objMapJson);
};

// ----------------------------------
// Array Operation Related

// MOST USED #1
Util.getFromList = function (list, value, propertyName) {
	var item;

	if (list) {
		// If propertyName being compare to has not been passed, set it as 'id'.
		if (propertyName === undefined) {
			propertyName = "id";
		}

		for (i = 0; i < list.length; i++) {
			var listItem = list[i];

			if (listItem[propertyName] && listItem[propertyName] === value) {
				item = listItem;
				break;
			}
		}
	}

	return item;
};


// MOST USED #2 - remove from list, all.
Util.RemoveFromArrayAll = function (list, propertyName, value) {
	try {
		if (list) {
			for (var i = list.length - 1; i >= 0; i--) {
				var arrItem = list[i];

				if (arrItem[propertyName] === value) {
					list.splice(i, 1);
				}
			}
		}
	}
	catch (errMsg) { console.log('ERROR in Util.RemoveFromArrayAll, ' + errMsg); }
};


// New - insert array items to 'index' position of list.
Util.insertItmesOnArray = function (list, index, items) {
	if (list) {
		if (Util.isTypeArray(items)) {
			for (var i = items.length - 1; i >= 0; i--) {
				var item = items[i];
				list.splice(index, 0, item);
			}
		}
		else {
			list.splice(index, 0, items);
		}
	}
};


Util.arrayReplaceData = function (orig, newData) {
	orig.splice(0); // Remove all data in array

	newData.forEach(item => {
		orig.push(item);
	});
};


Util.RemoveFromArray = function (list, propertyName, value) {
	var index;

	if (list && propertyName && value !== undefined) {
		for (var i = 0; i < list.length; i++) {
			var item = list[i];

			if (item[propertyName] === value) {
				index = i;
				break;
			}
		}

		if (index !== undefined) list.splice(index, 1);
	}

	return index;
};


Util.getFromListByName = function (list, name) {
	var item;

	for (i = 0; i < list.length; i++) {
		if (list[i].name === name) {
			item = list[i];
			break;
		}
	}

	return item;
};


Util.getItemFromList = function (list, value, propertyName) {
	return Util.getFromList(list, value, propertyName);
};

Util.getItemsFromList = function (list, value, propertyName) {
	var items = [];

	if (list) {
		// If propertyName being compare to has not been passed, set it as 'id'.
		if (propertyName === undefined) {
			propertyName = "id";
		}

		for (i = 0; i < list.length; i++) {
			var listItem = list[i];

			if (listItem[propertyName] && listItem[propertyName] === value) {
				items.push(listItem);
			}
		}
	}

	return items;
};


// ----------------------------------
// Recurrsive/iterative - synced call

// CALL BACK WITH ARRAY..  <-- we pass with array and each item calls this?
Util.callAfterEach = function (idx, list, resultJson, eachItemCallBack, finishCallBack) {
	if (idx > (list.length - 1)) {
		if (finishCallBack) finishCallBack(idx, resultJson);
	}
	else {
		var item = list[idx];

		try {
			eachItemCallBack(item, idx, function () {
				Util.callAfterEach(idx + 1, list, resultJson, eachItemCallBack, finishCallBack);
			});
		}
		catch (errMsg) {
			console.log('ERROR in Util.callAfterEach, ' + errMsg);
			Util.callAfterEach(idx + 1, list, resultJson, eachItemCallBack, finishCallBack);  // If failed, continue to next one.
			//if ( finishCallBack ) finishCallBack( idx );
		}
	}
};


// ----------------------------------
// JSON Copy Related

Util.cloneJson = function (jsonObj) {
	return Util.getJsonDeepCopy(jsonObj);  // Use this instead? {...jsonObj}
};

// Handles both object and array
Util.getJsonDeepCopy = function (jsonObj) {
	var newJsonObj;

	if (jsonObj) {
		try {
			newJsonObj = JSON.parse(JSON.stringify(jsonObj));
		}
		catch (errMsg) {
			console.log('ERROR in Util.getJsonDeepCopy, errMsg: ' + errMsg);
		}
	}

	return newJsonObj;
};

Util.copyProperties = function (source, dest, option) {
	try {
		var exceptions = (option && option.exceptions && Util.isTypeObject(option.exceptions)) ? option.exceptions : {};
		var consoleLog = (option && option.consoleLog) ? option.consoleLog : false;

		for (var key in source) {
			if (consoleLog) console.log('key: ' + key);
			if (!exceptions[key]) dest[key] = source[key];
		}
	}
	catch (errMsg) {
		console.log('ERROR in Util.copyProperties, errMsg: ' + errMsg);
	}
};

// Copy Content Json without overwriting the reference of original Json
Util.overwriteJsonContent = function (origJson, newJson) {
	if (origJson !== newJson) {
		// Clear content
		for (var key in origJson) {
			delete origJson[key];
		}

		// Add the newJson prop
		for (var key in newJson) {
			origJson[key] = newJson[key];
		}
	}
};


Util.clearEmptyProp = function (inputJson) {
	if (inputJson) {
		// Clear content
		for (var key in inputJson) {
			if (!inputJson[key]) delete inputJson[key];
		}
	}

	return inputJson;
};

Util.emptyJson = function (inputJson) {
	return Util.clearEmptyProp(inputJson);
};

Util.clearJson = function (inputJson) {
	return Util.clearEmptyProp(inputJson);
};

Util.compareJsonPropVal = function (sourceJson, targetJson) {
	var isMatch = true;

	for (var key in sourceJson) {
		if (sourceJson[key] !== targetJson[key]) {
			isMatch = false;
			break;
		}
	}

	return isMatch;
};

// ----------------------------------------------------
// ---- Try Cache / Eval related methods

Util.tryCatchContinue = function (runFunc, optionalMsg) {
	try {
		runFunc();
	}
	catch (errMsg) {
		console.log('ERROR, tryCatchContinue ' + optionalMsg + ', errMsg - ' + errMsg);
	}
};


Util.tryCatchCallBack = function (callBack, runFunc) {
	try {
		runFunc(callBack);
	}
	catch (errMsg) {
		console.log('ERROR, tryCatchCallback, errMsg - ' + errMsg);
		callBack();
	}
};


Util.evalTryCatch = function (inputVal, INFO, optionalTitle, optionalFunc) {
	var returnVal;

	try {
		// Handle array into string joining
		inputVal = Util.getEvalStr(inputVal);

		if (inputVal) {
			returnVal = eval(inputVal);

			if (returnVal && typeof (returnVal) === "string") {
				returnVal = returnVal.replace(/undefined/g, '');
			}
		}
	}
	catch (errMsg) {
		if (!optionalTitle) optionalTitle = '';

		var errMsgMain = Util.evalTryCatch_ERR + optionalTitle + ', ErrMsg - ' + errMsg;
		var errMsgSub = (inputVal) ? ', EvalVal: ' + inputVal.substr(0, 40) : '';
		var errMsgFull = errMsgMain + errMsgSub;

		if (optionalFunc) optionalFunc(errMsgFull);
		else console.log(errMsgFull);

		returnVal = errMsgFull; // + ': ' + returnVal;
	}

	return returnVal;
};


Util.getEvalStr = function (evalObj) {
	var evalStr = '';

	try {
		if (Util.isTypeString(evalObj)) evalStr = evalObj;
		else if (Util.isTypeArray(evalObj)) evalStr = evalObj.join('\r\n');
	}
	catch (errMsg) {
		console.log('ERROR in blockForm.getEvalStr, errMsg: ' + errMsg);
	}

	return evalStr;
};


Util.checkConditionEval = function (evalCondition) {
	var result = false;

	try {
		if (evalCondition) {
			// Handle array into string joining
			evalCondition = Util.getEvalStr(evalCondition);

			if (evalCondition) {
				result = eval(evalCondition);
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in Util.checkEvalCondition, ' + errMsg);
	}

	return result;
}


Util.traverseEval = function (obj, INFO, iDepth, limit) {
	if (iDepth === limit) {
		throw 'Error in Util.traverseEval, Traverse depth limit has reached: ' + iDepth;
	}
	else {
		Object.keys(obj).forEach(key => {
			var prop = obj[key];

			if (Util.isTypeArray(prop)) {
				var iDepthArr = iDepth + 1;

				prop.forEach((pArrItem, i) => {
					if (Util.isTypeObject(pArrItem) || Util.isTypeArray(pArrItem)) {
						Util.traverseEval(pArrItem, INFO, iDepthArr, limit);
					}
					else if (Util.isTypeString(pArrItem)) {
						try { prop[i] = eval(pArrItem); }
						catch (errMsg) { throw 'Error in Util.traverseEval, arrayItem str eval: ' + errMsg; }
					}
				});
			}
			else if (Util.isTypeObject(prop)) {
				Util.traverseEval(prop, INFO, iDepth + 1, limit);
			}
			else if (Util.isTypeString(prop)) {
				try { obj[key] = eval(prop); }
				catch (errMsg) { throw 'Error in Util.traverseEval, str eval: ' + errMsg; }
			}
		});
	}
};


Util.trvEval_payload = {};

// Traverse and Add all the templates
Util.trvEval_INSERT_SUBTEMPLATES = function (obj, INFO, defPTemplates, iDepth, limit) {
	if (iDepth === limit) {
		throw 'Error in Util.trvEval_INSERT_SUBTEMPLATES, Traverse depth limit has reached: ' + iDepth;
	}
	else {
		var keyArr = Object.keys(obj);

		for (var i = 0; i < keyArr.length; i++) {
			var key = keyArr[i];
			var propVal = obj[key];

			//if ( key === Util.KEY_TEMPLATE_ADD ) 
			if (key.indexOf(Util.KEY_TEMPLATE_ADD) === 0) {
				var templateObj = defPTemplates[propVal];

				if (templateObj) {
					var subTemplate = Util.cloneJson(templateObj);
					// OPTIONALLY, WE CAN LOOK FOR SAME SUBTEMP INSERT ON HERE AS WELL..
					// Util.trvEval_INSERT_SUBTEMPLATES( subTemplate, INFO, defPTemplates, iDepth, limit );
					Util.mergeDeep(obj, subTemplate);
				}

				delete obj[key];
			}
			else if (key.indexOf(Util.KEY_TEMPLATE_ADD_ARR) === 0) {
				propVal.forEach(pArrItem => {
					var templateObj = defPTemplates[pArrItem];

					if (templateObj) {
						var subTemplate = Util.cloneJson(templateObj);
						// Util.trvEval_INSERT_SUBTEMPLATES( subTemplate, INFO, defPTemplates, iDepth, limit );
						Util.mergeDeep(obj, subTemplate);
					}
				});

				delete obj[key];
			}
			else {
				if (Util.isTypeArray(propVal)) {
					var iDepthArr = iDepth + 1;

					propVal.forEach(pArrItem => {
						if (Util.isTypeObject(pArrItem) || Util.isTypeArray(pArrItem)) {
							Util.trvEval_INSERT_SUBTEMPLATES(pArrItem, INFO, defPTemplates, iDepthArr, limit);
						}
					});
				}
				else if (Util.isTypeObject(propVal)) {
					Util.trvEval_INSERT_SUBTEMPLATES(propVal, INFO, defPTemplates, iDepth + 1, limit);
				}
			}
		}
	}
};

// NOTE: 'defPTemplates' is passed & used for referencing other templates while evaluating / traversing json..
Util.trvEval_TEMPLATE = function (obj, INFO, defPTemplates, iDepth, limit) {
	if (iDepth === limit) {
		throw 'Error in Util.trvEval_TEMPLATE, Traverse depth limit has reached: ' + iDepth;
	}
	else {
		var keyArr = Object.keys(obj);

		for (var i = 0; i < keyArr.length; i++) {
			var key = keyArr[i];
			var propVal = obj[key];

			if (key === Util.KEY_CONDITION_CHECK) {
				try {
					// If condition pass (as 'true'), remove this condition check property and simply move on.
					// Otherwise, return with this object remove marking..
					if (eval(propVal) === true) delete obj[key];
					else {
						obj[key] = Util.KEY_OBJECT_REMOVE;
						return Util.KEY_OBJECT_REMOVE;
					}
				}
				catch (errMsg) { throw 'Error in Util.trvEval_TEMPLATE, Key ConditionCheck: ' + errMsg; }
			}
			else {
				if (Util.isTypeArray(propVal)) {
					var iDepthArr = iDepth + 1;

					propVal.forEach((pArrItem, p, object) => {
						if (Util.isTypeObject(pArrItem) || Util.isTypeArray(pArrItem)) {
							Util.trvEval_TEMPLATE(pArrItem, INFO, defPTemplates, iDepthArr, limit);
						}
						else if (Util.isTypeString(pArrItem)) {
							try { propVal[p] = eval(pArrItem); }
							catch (errMsg) { throw 'Error in Util.trvEval_TEMPLATE, ArrayItem String Eval: ' + errMsg; }
						}
					});


					// Due to some unknown issue of removing the item on above loop, use here to remov eit..
					Util.RemoveFromArrayAll(propVal, Util.KEY_CONDITION_CHECK, Util.KEY_OBJECT_REMOVE);
				}
				else if (Util.isTypeObject(propVal)) {
					var returnVal = Util.trvEval_TEMPLATE(propVal, INFO, defPTemplates, iDepth + 1, limit);
					if (returnVal === Util.KEY_OBJECT_REMOVE) delete obj[key];
				}
				else if (Util.isTypeString(propVal)) {
					try {
						var evalResult = eval(propVal);
						if (evalResult === Util.KEY_PROPERTY_REMOVE) delete obj[key];
						else if (evalResult === Util.KEY_OBJECT_REMOVE) return Util.KEY_OBJECT_REMOVE;
						else obj[key] = evalResult;
					}
					catch (errMsg) { throw 'Error in Util.trvEval_TEMPLATE, String Eval: ' + errMsg; }
				}
			}
		}
	}
};



// Replace json 'key' names using 'keyListset' ( { 'keys': [], 'keysNew': [] } (same list) )
// Only replace 'key' where the value is string or number/boolean?..
Util.jsonKeysReplace_Ref = function (obj, keyListSet, iDepth, limit) {
	if (iDepth === limit) {
		var errMsg = 'Error in Util.jsonKeysReplace, Traverse depth limit has reached: ' + iDepth;
		console.log(errMsg);
		throw errMsg;
	}
	else {
		Object.keys(obj).forEach(key => {
			var prop = obj[key];

			if (Util.isTypeArray(prop)) {
				var iDepthArr = iDepth + 1;

				prop.forEach((pArrItem, i) => {
					if (Util.isTypeObject(pArrItem) || Util.isTypeArray(pArrItem)) {
						Util.jsonKeysReplace_Ref(pArrItem, keyListSet, iDepthArr, limit);
					}
					//else if ( Util.isTypeString( pArrItem ) ) Util.jsonKeyReplace( obj, obj[ i ], keyListSet, 'array' );		
				});
			}
			else if (Util.isTypeObject(prop)) {
				Util.jsonKeysReplace_Ref(prop, keyListSet, iDepth + 1, limit);
			}
			else //if ( Util.isTypeString( prop ) )
			{
				// For now, only do this for string value type keys..
				Util.jsonKeyReplace(obj, key, keyListSet);
			}
		});
	}
};

// Only do obj that is key/value one...
Util.jsonKeyReplace = function (obj, key, keyListSet) {
	var foundIndex = keyListSet.keys.indexOf(key);

	if (foundIndex >= 0) {
		var origVal = obj[key];
		var keyNew = keyListSet.keysNew[foundIndex];

		// get the value/object set from 'key' before deleting the key.
		obj[keyNew] = origVal;
		//( Util.isTypeArray( origVal ) || Util.isTypeObject( origVal ) ) ? Util.cloneJson( origVal ) : origVal;

		delete obj[key];
	}
};


// Return new obj with key replaced. New obj created, thus will loose reference..
//   keyListSet - { "asofiajs": "firstName", "asjfoasdjif": "lastName }
Util.jsonKeysReplace_Str = function (obj, keyListSet) {
	var newObj = obj;  // set to original data by default if there is issue..

	try {
		if (obj && Util.isTypeObject(obj) && keyListSet) {
			var objInStr = JSON.stringify(obj);

			Object.keys(keyListSet).forEach(key => {
				var keyProp = '"' + key + '":';

				if (objInStr.indexOf(keyProp) >= 0) {
					var newKey = keyListSet[key];
					var newkeyProp = '"' + newKey + '":';

					objInStr = objInStr.replaceAll(keyProp, newkeyProp);
				}
			});

			newObj = JSON.parse(objInStr);
		}
	}
	catch (errMsg) {
		console.log('ERROR in Util.jsonKeysReplace_Str, errMsg: ' + errMsg);
	}

	return newObj;
};


Util.jsonCleanEmptyRunTimes = function (obj, runTime) {
	for (var i = 0; i < runTime; i++) {
		Util.jsonCleanEmpty(obj);
	}
};

Util.getJsonCleanEmpty = function (obj) {
	var jsonNew = Util.cloneJson(obj);

	Util.jsonCleanEmpty(jsonNew);

	return jsonNew;
}

Util.jsonCleanEmpty = function (obj) {
	Object.keys(obj).forEach(key => {
		var item = obj[key];

		if (item) {
			if (Util.isTypeArray(item)) {
				if (item.length == 0) delete obj[key];
				else Util.jsonCleanEmpty(item);
			}
			else if (Util.isTypeObject(item)) {
				if (Util.isObjEmpty(item)) delete obj[key];
				else Util.jsonCleanEmpty(item);
			}
		}
		else if (item === "" || item === undefined || item === null) delete obj[key];
	});
};


Util.getObjRef_fromList = function (list, prop) {
	var objRef = {};

	if (list && prop) {
		for (var i = 0; i < list.length; i++) {
			var obj = list[i];

			var objId = obj[prop];

			if (objId) objRef[objId] = obj;
		}
	}

	return objRef;
};

// ----------------------------------------------------

Util.strCombine = function (input) {
	var output = '';

	if (input) {
		if (Util.isTypeArray(input)) {
			output = input.join(' ');
		}
		else {
			output = input;
		}
	}

	return output;
};


Util.objKeyCount = function (obj) {
	return (obj) ? Object.keys(obj).length : 0;
};

Util.disableTag = function (tag, isDisable) {
	tag.prop('disabled', isDisable);
}

// ---------------------------------------

Util.array_TakeOutOne = function (arr) {
	var returnArr = [];

	if (arr) arr.splice(0, 1);

	return (returnArr.length > 0) ? returnArr[0] : undefined;
};

// NOTE: Should be named 'append'?
Util.mergeArrays = function (mainArr, newArr) {
	for (var i = 0; i < newArr.length; i++) {
		mainArr.push(newArr[i]);
	}
};

Util.appendArray = function (mainArr, newArr) {
	Util.mergeArrays(mainArr, newArr);
};

Util.getCombinedArrays = function (arr1, arr2) {
	var combinedArr = [];

	for (var i = 0; i < arr1.length; i++) combinedArr.push(arr1[i]);
	for (var i = 0; i < arr2.length; i++) combinedArr.push(arr2[i]);

	return combinedArr;
};

Util.mergeJson = function (destObj, srcObj) {
	if (srcObj) {
		for (var key in srcObj) {
			destObj[key] = srcObj[key];
		}
	}
};

Util.mergeDeep = function (dest, obj, option) {
	Object.keys(obj).forEach(key => {

		var dVal = dest[key];
		var oVal = obj[key];

		if (Util.isTypeArray(dVal) && Util.isTypeArray(oVal)) {
			if (option && option.arrOverwrite && oVal.length > 0) dest[key] = oVal;
			else Util.mergeArrays(dVal, oVal);
		}
		else if (Util.isTypeObject(dVal) && Util.isTypeObject(oVal)) {
			Util.mergeDeep(dVal, oVal);
		}
		else {
			dest[key] = oVal;
		}
	});

	//return prev;
};


Util.dotNotation = function (dest, obj, parentObjName) {
	Object.keys(obj).forEach(function (key) {

		var oVal = obj[key];

		if (Util.isTypeArray(oVal)) dest[parentObjName + '.' + key] = oVal;
		else if (typeof oVal === 'object') {
			Util.dotNotation(dest, oVal, parentObjName + '.' + key);
		}
		else {
			dest[parentObjName + '.' + key] = oVal;
		}
	});
};

Util.getPathObj = function (obj, pathArr) {
	var tempObj = Util.cloneJson(obj);

	for (var i = 0; i < pathArr.length; i++) {
		var path = pathArr[i];
		tempObj = tempObj[path];
	}

	return tempObj;
};


// Performs a deep merge of objects and returns new object. Does not modify objects
Util.mergeDeep_v2 = function (...objects) {
	const isObject = obj => obj && typeof obj === 'object';

	return objects.reduce((prev, obj) => {
		Object.keys(obj).forEach(key => {
			const pVal = prev[key];
			const oVal = obj[key];

			if (Util.isTypeArray(pVal) && Util.isTypeArray(oVal)) {
				prev[key] = pVal.concat(...oVal);
			}
			else if (isObject(pVal) && isObject(oVal)) {
				prev[key] = Util.mergeDeep_v2(pVal, oVal);
			}
			else {
				prev[key] = oVal;
			}
		});

		return prev;
	}, {});
};

Util.getCombinedJson = function (obj1, obj2) {
	var combinedObj = {};

	for (var key in obj1) combinedObj[key] = obj1[key];
	for (var key in obj2) combinedObj[key] = obj2[key];

	return combinedObj;
};

Util.getCombinedJsonInArr = function (objArr) {
	var combinedObj = {};

	for (var i = 0; i < objArr.length; i++) {
		Util.mergeJson(combinedObj, objArr[i]);
	}

	return combinedObj;
};

// -------------------------------------------


// TODO: We can create Util.sortByKey with 'eval' of 'key' part..

// Sort - by 'Acending' order by default.  1st 2 params (array, key) are required.
//	NO NEED TO return!!!  <-- makes changes on itself!!!
Util.sortByKey = function (array, key, noCase, order, emptyStringLast) {
	try {
		if (array && key) {
			if (array.length == 0 || array[0][key] === undefined) return array;
			else {
				// NOTE: no need to 'return' <-- this makes changes on the array itself!!!
				return array.sort(function (a, b) {

					var x = a[key];
					var y = b[key];

					if (x === undefined) x = "";
					if (y === undefined) y = "";

					if (noCase !== undefined && noCase) {
						x = x.toLowerCase();
						y = y.toLowerCase();
					}

					if (emptyStringLast !== undefined && emptyStringLast && (x == "" || y == "")) {
						if (x == "" && y == "") return 0;
						else if (x == "") return 1;
						else if (y == "") return -1;
					}
					else {
						if (order === undefined) return Util.sortCompare(x, y);
						else {
							// return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
							if (order === "Acending" || order === "asc") return Util.sortCompare(x, y);
							else if (order === "Decending" || order === "desc") return Util.sortCompare(y, x);
						}
					}
				});
			}
		}
		else return array;
	}
	catch (errMsg) {
		console.log('ERROR in Util.sortByKey, ' + errMsg);
		return array;
	}
};

// For reverse or decending order, call param reversed: Util.sortCompare( y, x )
Util.sortCompare = function (x, y) {
	var returnVal = 0;

	try {
		if (x < y) returnVal = -1;
		else if (x > y) returnVal = 1;
		else returnVal = 0;
	}
	catch (errMsg) {
		console.log('ERROR in Util.sortCompare, ' + errMsg);
	}

	return returnVal;
};

Util.sortByKey2 = function (array, key, order, options) {
	var noCase;
	var emptyStringLast;

	if (options) {
		noCase = (options.noCase) ? options.noCase : undefined;
		emptyStringLast = (options.emptyStringLast) ? options.emptyStringLast : undefined;
	}

	return Util.sortByKey(array, key, noCase, order, emptyStringLast);
};

Util.sortByKey_Reverse = function (array, key) {
	return array.sort(function (b, a) {
		var x = a[key]; var y = b[key];  // reversed by use of b, a param rather than a, b param.
		return Util.sortCompare(x, y); // ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
	});
};

Util.evalSort = function (fieldName, list, orderStr) {
	try {
		var isDescending = (orderStr === 'desc');
		var sortEvalStr = 'Util.sortCompare( a.' + fieldName + ', b.' + fieldName + ')';

		if (!isDescending) list.sort(function (a, b) { return eval(sortEvalStr); });
		else list.sort(function (b, a) { return eval(sortEvalStr); });
	}
	catch (errMsg) {
		console.log('ERROR in Util.evalSort, ' + errMsg);
	}
};

// -------------------------------------------

Util.performChekcSum34 = function (tagVal, valLength) {
	var valid = false;

	try {
		if (tagVal.length === valLength) {
			var realValStr = tagVal.substr(0, valLength - 1);
			var checkSumStr = tagVal.substr(valLength - 1, 1);

			valid = Util.checkSumCheck(realValStr, checkSumStr, 34);
		}
	}
	catch (errMsg) {
		console.log('ERROR in Util.performChekcSum34, ' + errMsg);
	}

	return valid;
};


Util.checkSumCheck = function (realValStr, checkSumStr, baseDigit) {
	var sum = 0;
	var checkSumNum = parseInt(checkSumStr, baseDigit);

	// Change back blocked char: Y -> I, Z -> O  (It was converted when realVal were being created.) 
	realValStr = realValStr.replace(/Y/g, 'I').replace(/Z/g, 'O');

	// Convert each digit (base34) to base10
	for (var i = 0; i < realValStr.length; i++) {
		var char = realValStr.charAt(i);
		var num = parseInt(char, baseDigit);
		sum += num;
	}

	// Get last remaiming to get checkSum number
	var remainder = sum % baseDigit;

	// Check if the checkSum value is same as the calculated remainer 
	return (checkSumNum === remainder);
};


Util.searchByName = function (array, propertyName, value) {
	for (var i in array) {
		if (array[i][propertyName] == value) {
			return array[i];
		}
	}
	return "";
};

Util.trim = function (input) {
	if (Util.isTypeString(input)) return input.replace(/^\s+|\s+$/gm, '');
	else return input;
};

Util.trimTags = function (tags) {
	tags.each(function () {
		$(this).val(Util.trim($(this).val()));
	});
};

Util.replaceAllRegx = function (fullText, strReplacing, strReplacedWith) {
	var rePattern = new RegExp(strReplacing, "g");
	return fullText.replace(rePattern, strReplacedWith);
};

Util.replaceAll = function (fullText, keyStr, replaceStr) {
	var index = -1;
	do {
		fullText = fullText.replace(keyStr, replaceStr);
		index = fullText.indexOf(keyStr, index + 1);
	} while (index != -1);

	return fullText;
};

Util.stringSearch = function (inputString, searchWord) {
	if (inputString.search(new RegExp(searchWord, 'i')) >= 0) {
		return true;
	}
	else {
		return false;
	}
};

Util.upcaseFirstCharacterWord = function (text) {
	var result = text.replace(/([A-Z])/g, " $1");
	return result.charAt(0).toUpperCase() + result.slice(1);
};


Util.startsWith = function (input, suffix, option) {
	if (!option) option = {};

	if (option.upper) {
		input = input.toUpperCase();
		suffix = suffix.toUpperCase();
	}
	return (Util.checkValue(input) && input.substring(0, suffix.length) == suffix);
};

Util.endsWith = function (input, suffix, option) {
	if (!option) option = {};

	if (option.upper) {
		input = input.toUpperCase();
		suffix = suffix.toUpperCase();
	}

	return (Util.checkValue(input) && input.indexOf(suffix, input.length - suffix.length) !== -1);
};

Util.endsWith_Arr = function (input, suffixArr, option) {
	var bReturn = false;

	if (Util.checkValue(input) && Util.isTypeArray(suffixArr)) {
		for (var i = 0; suffixArr.length > i; i++) {
			var suffix = suffixArr[i];
			if (Util.endsWith(input, suffix, option)) {
				bReturn = true;
				break;
			}
		}
	}

	return bReturn;
};


Util.strCutEnd = function (input, endCutLength) {
	return input.substr(0, input.length - endCutLength);
};

Util.getFileExtension = function (input, option) {
	if (!option) option = {};
	var extName = '';

	if (option.upper) input = input.toUpperCase();
	else if (option.lower) input = input.toLowerCase();

	var strArr = input.split('.');
	if ( strArr.length > 1 )
	{
		var lastIdx = strArr.length - 1;
		extName = strArr[lastIdx];	
	}

	return extName;
};

Util.clearList = function (selector) {
	selector.children().remove();
};

Util.moveSelectedById = function (fromListId, targetListId) {
	return !$('#' + fromListId + ' option:selected').remove().appendTo('#' + targetListId);
};

Util.selectAllOption = function (listTag) {
	listTag.find('option').attr('selected', true);
};

Util.unselectAllOption = function (listTag) {
	listTag.find('option').attr('selected', true);
};

Util.valueEscape = function (input) {
	//input.replaceAll( '\', '\\' );
	//input = input.replace( "'", "\'" );
	input = input.replace('"', '\"');

	return input;
};

Util.valueUnescape = function (input) {
	//input.replaceAll( '\', '\\' );
	//input = input.replace( "\'", "'" );
	input = input.replace('\"', '"');

	return input;
};

Util.reverseArray = function (arr) {
	return arr.reverse();
};

// ----------------------------------
// List / Array Related

Util.getMatchData = function (settingData, matchSet) {
	var returnData = new Array();

	$.each(settingData, function (i, item) {
		var match = true;

		for (var propName in matchSet) {
			if (matchSet[propName] != item[propName]) {
				match = false;
				break;
			}
		}

		if (match) {
			returnData.push(item);
		}
	});

	return returnData;
};


Util.getFirst = function (inputList) {
	var returnVal;

	if (inputList !== undefined && inputList != null && inputList.length > 0) {
		returnVal = inputList[0];
	}

	return returnVal;
};


// $.inArray( item_event.trackedEntityInstance, personList ) == -1

Util.checkExistInList = function (list, value, propertyName) {
	var item = Util.getFromList(list, value, propertyName);

	if (item === undefined) return false;
	else return true;
};


Util.checkEmptyId_FromList = function (list) {
	return (Util.getFromList(list, '') !== undefined);
};

Util.jsonToArray = function (jsonData, structureConfig) {
	//parameter structureConfig (optional), e.g. 'name:value', or 'id:val', etc;
	//to do: make recursive in the presence of nested json objects (typeOf obj === "object" )
	var strucConfArr = (structureConfig ? structureConfig.split(':') : undefined);
	var arrRet = [];
	var fldExcl = 'userName,password,';

	for (var keyName in jsonData) {
		if (fldExcl.indexOf(keyName) < 0) {
			var obj = jsonData[keyName];

			if (strucConfArr) {
				var jDat = { [strucConfArr[0]]: keyName, [strucConfArr[1]]: obj };
			}
			else {
				var jDat = { [keyName]: obj };
			}

			arrRet.push(jDat);
		}
	}

	return arrRet;
};


Util.recursiveCalls = function (dataObj, i, runMethod, finishCallBack) {
	if (dataObj.list.length <= i) {
		return finishCallBack();
	}
	else {
		runMethod(dataObj.list[i], function () {
			Util.recursiveCalls(dataObj, i + 1, runMethod, finishCallBack);
		}, finishCallBack);
	}
};

// List / Array Related
// ----------------------------------

// ------------------------------------------------------------------------------------------------------
// For URL

Util.getServerUrl = function () {
	return location.protocol + '//' + location.host;
};


Util.getParameterByName = function (name, url) {
	if (!url) url = window.location.href;

	name = name.replace(/[\[\]]/g, "\\$&");

	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
	var results = regex.exec(url);

	if (!results) return '';

	if (!results[2]) return '';

	return decodeURIComponent(results[2].replace(/\+/g, " "));
};


Util.getParameterInside = function (value, openClose) {
	// intended to be used as follows: Util.getValueInside( '##calculatePattern{AA-BB}', '{}' ) --> returns 'AA-BB'
	if (value.indexOf(openClose.substring(0, 1)) > -1) {
		var split1 = openClose.substring(0, 1), split2 = openClose.substring(1, 2);
		return (value.split(split1)[1]).split(split2)[0];
	}
	else {
		return '';
	}
};


Util.getURL_pathname = function (loc) {
	// '/api/apps/NetworkListing/index.html', loc = 4 by - '', 'api', 'apps', 'NetworkListing'
	var pathName = "";
	var strSplits = window.location.pathname.split('/');

	if (strSplits.length >= loc) {
		pathName = strSplits[loc - 1];
	}

	return pathName;
};

Util.setUrlParam = function (url, paramKey, paramVal) {
	var startChar = (url.indexOf('?') < 0) ? '?' : '&';

	url += startChar + paramKey + '=' + paramVal;

	return url;
};


Util.getUrlLastName = function (url) {
	return url.substring(url.lastIndexOf('/') + 1);
};

// --------------------------------------------

Util.getObjPropertyCount = function (list) {
	var count = 0;

	for (var prop in list) { count++; }
	//var len = Object.keys(obj).length;

	return count;
};

// Check Variable or List Related
// -------


// BELOW SHOULD MOVE TO FORM UNIT..
// ----------------------------------
// Seletet Tag Populate, Etc Related
// -- Move to either 'Util2' class, or 'FormUtil' class

Util.populateSelect_ByList = function (selectTag, listData, dataType) {
	selectTag.empty();

	$.each(listData, function (i, item) {
		var option = $('<option ' + FormUtil.getTermAttr(item) + '></option>');

		if (dataType !== undefined && dataType == "Array") {
			option.attr("value", item).text(item);
		}
		else {
			option.attr("value", item.id).text(item.name);
		}

		selectTag.append(option);
	});
};

Util.populateSelect_Simple = function (selectObj, json_Data) {
	selectObj.empty();

	$.each(json_Data, function (i, item) {
		if (Util.isTypeObject(item)) {
			selectObj.append('<option ' + FormUtil.getTermAttr(item) + ' value="' + item.id + '">' + item.name + '</option>');
		}
		else if (Util.isTypeString(item)) {
			selectObj.append('<option value="' + item + '">' + item + '</option>');
		}
	});
};

Util.populateSelectDefault = function (selectObj, selectNoneName, json_Data, inputOption) {
	selectObj.empty();
	selectObj.append('<option term="' + Util.termName_pleaseSelectOne + '" value="">' + selectNoneName + '</option>');

	var valuePropStr = "id";
	var namePropStr = "name";

	if (inputOption !== undefined) {
		valuePropStr = inputOption.val;
		namePropStr = inputOption.name;
	}

	if (json_Data !== undefined) {
		$.each(json_Data, function (i, item) {

			var optionTag = $('<option ' + FormUtil.getTermAttr(item) + '></option>');

			optionTag.attr("value", item[valuePropStr]).text(item[namePropStr]);

			selectObj.append(optionTag);
		});
	}
};


Util.populateSelect_newOption = function (selectObj, json_Data, inputOption) {
	selectObj.empty();
	selectObj.append('<option term="' + Util.termName_pleaseSelectOne + '" selected disabled="disabled">Choose an option</option>');

	var valuePropStr = "id";
	var namePropStr = "name";

	if (inputOption !== undefined) {
		valuePropStr = inputOption.val;
		namePropStr = inputOption.name;
	}

	if (json_Data !== undefined) {
		$.each(json_Data, function (i, item) {

			var optionTag = $('<option ' + FormUtil.getTermAttr(item) + '></option>');

			optionTag.attr("value", item[valuePropStr]).text(item[namePropStr]);

			selectObj.append(optionTag);
		});
	}
};

Util.populateUl_newOption = function (selectObj, json_Data, eventsOptions) {
	json_Data.forEach(optionData => {

		let option = document.createElement('option')

		$(option).css({
			'display': 'none',
			'width': '100%',
			'list-style': 'none',
			'background': 'white',
			'padding': '4px 8px',
			'font-size': '14px'
		})

		option.textContent = optionData.defaultName
		option.value = optionData.value

		$(option).click(eventsOptions)

		selectObj.appendChild(option)

	})
};


Util.populateSelect = function (selectObj, selectName, json_Data, dataType) {
	selectObj.empty();
	selectObj.append('<option term="' + Util.termName_pleaseSelectOne + '" value="">Select ' + selectName + '</option>');

	if (json_Data !== undefined) {
		$.each(json_Data, function (i, item) {
			var option = $('<option ' + FormUtil.getTermAttr(item) + '></option>');

			if (dataType !== undefined && dataType == "Array") {
				option.attr("value", item).text(item);
			}
			else {
				option.attr("value", item.id).text(item.name);
			}

			selectObj.append(option);
		});
	}
};


Util.appendOnSelect = function (selectObj, dataArr, dataType) {
	if (dataArr) {
		dataArr.forEach(item => {
			var option = $('<option ' + FormUtil.getTermAttr(item) + '></option>');

			if (dataType === "Array") option.attr("value", item).text(item);
			else option.attr("value", item.id).text(item.name);

			selectObj.append(option);
		});
	}
};


Util.checkItemOnSelect = function (selectObj, itemValue) {
	return (selectObj.find('option[value="' + itemValue + '"]').length > 0);
};

// -------------------------

Util.decodeURI_ItemList = function (jsonItemList, propName) {
	if (jsonItemList) {
		$.each(jsonItemList, function (i, item) {
			if (item[propName]) {
				item[propName] = decodeURI(item[propName]);
			}
		});
	}
};

Util.setSelectDefaultByName = function (ctrlTag, name) {
	ctrlTag.find("option:contains(" + name + ")").attr('selected', 'selected'); //true
};


Util.getSelectedOptionName = function (ctrlTag) {
	return ctrlTag.find("option:selected").text();
	// return ctrlTag.options[ ctrlTag.selectedIndex ].text; // Javascript version
};

Util.reset_tagsListData = function (tags, listJson) {
	tags.each(function () {

		var tag = $(this);
		var tagVal = tag.val();

		tag.find('option').remove();

		Util.populateSelectDefault(tag, "", listJson);

		tag.val(tagVal);
	});
};
// Seletet Tag Populate, Etc Related
// ----------------------------------

Util.checkInteger = function (input) {
	var intRegex = /^\d+$/;
	return intRegex.test(input);
};

Util.checkCalendarDateStrFormat = function (inputStr) {
	if (inputStr.length == 10
		&& inputStr.substring(4, 5) == '/'
		&& inputStr.substring(7, 8) == '/'
		&& Util.checkInteger(inputStr.substring(0, 4))
		&& Util.checkInteger(inputStr.substring(5, 7))
		&& Util.checkInteger(inputStr.substring(8, 10))
	) {
		return true;
	}
	else {
		return false;
	}
};

Util.isDate = function (date) {
	return ((new Date(date) !== "Invalid Date" && !isNaN(new Date(date))));
};

// ----------------------------------
// Date Formatting Related


Util.addZero = function (i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
};

Util.dateToString = function (date) {
	var month = eval(date.getMonth()) + 1;
	month = (month < 10) ? "0" + month : month;

	var day = eval(date.getDate());
	day = (day < 10) ? "0" + day : day;

	return date.getFullYear() + "-" + month + "-" + day;
};


Util.dateToStr = function (date, separator) {
	if (!separator) separator = "";

	var month = eval(date.getMonth()) + 1;
	month = (month < 10) ? "0" + month : month;

	var day = eval(date.getDate());
	day = (day < 10) ? "0" + day : day;

	return date.getFullYear() + separator + month + separator + day;
};


// ===============================================


// NEW DATE FORMATTER --> DATE STRING..
Util.dateStr = function (formatType, inputDate) {
	var date = (inputDate) ? inputDate : new Date();
	var formatPattern = Util.dateType1;

	if (formatType) {
		if (formatType === 'D' || formatType === 'DATE') formatPattern = Util.dateType_DATE;
		else if (formatType === 'DT' || formatType === 'DATETIME') formatPattern = Util.dateType_DATETIME;
		else formatPattern = formatType;
	}

	return Util.formatDate(date, formatPattern);
};


Util.dateAddStr = function (formatType, addDateNumber) {
	var date = new Date();

	date.setDate(date.getDate() + addDateNumber);

	return Util.dateStr(formatType, date);
};


Util.getDateTimeStr = function () {
	return Util.formatDateTime(new Date());
};

// ===============================================


// Main Eventual date format method others calls at the end.
Util.formatDate = function (date, formatPattern) {
	var outDateStr = '';

	try {
		if (date) {
			if (!formatPattern) formatPattern = Util.dateType1;

			if (Util.isTypeString(date) && date.length === 10) date = date + 'T00:00:00.000';

			// '$.format.date' allows Javascript date object or string in various format.
			outDateStr = $.format.date(date, formatPattern);
		}
	}
	catch (errMsg) {
		console.log('ERROR in Util.formatDate, errMsg: ' + errMsg);
	}

	return outDateStr;
};

Util.formatDateTime = function (dateObj, dateType) {
	return Util.formatDateTimeStr(dateObj.toString(), dateType);
};

Util.formatDateTimeStr = function (dateStr, dateType) {
	return Util.formatDate(dateStr, dateType);
};

Util.timeCalculation = function (dtmNewer, dtmOlder) {
	var reSult = { 'hh': 0, 'mm': 0, 'ss': 0 };

	var sec_num = (new Date(dtmNewer).getTime() - new Date(dtmOlder).getTime()) / Util.MS_SEC;

	var hours = Math.floor(sec_num / 3600); // round (down)
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60); // round (down)
	var seconds = Math.round(sec_num - (hours * 3600) - (minutes * 60)); // round (up)

	if (hours < 10) { hours = "0" + hours; }
	if (minutes < 10) { minutes = "0" + minutes; }
	if (seconds < 10) { seconds = "0" + seconds; }

	reSult.hh = hours;
	reSult.mm = minutes;
	reSult.ss = seconds;

	return reSult;

};

Util.getTimePassedMs = function (fromDtStr) {
	var timePassedMs = -1;

	try {
		var currDt = new Date().getTime();
		var fromDt = new Date(fromDtStr).getTime();

		var timePassedMs = currDt - fromDt;
	}
	catch (errMsg) {
		console.log('ERROR in Util.getTimePassedMs, errMsg: ' + errMsg);
	}

	return timePassedMs;
};

Util.dateUTCToLocal = function (dateStr) {
	var localDateObj;

	try {
		if (dateStr) {
			// If the input utc date string does not have 'Z' at the end, add it.  <--- but need to be full length?
			if (dateStr.indexOf('Z') === -1) {
				dateStr += 'Z';
			}

			localDateObj = new Date(dateStr);
		}
		else {
			localDateObj = new Date();
		}
	}
	catch (errMsg) {
		console.log('ERROR in Util.dateUTCToLocal, errMsg: ' + errMsg);
	}

	return localDateObj;
};

Util.getUTCDateTimeStr = function (dateObj, optionStr) {
	if (!dateObj) dateObj = new Date();

	var dtStr = dateObj.toISOString();
	if (optionStr === 'noZ') dtStr = dtStr.replace('Z', '');

	return dtStr;
};

Util.addDay = function (dateObj, addDay) {
	return dateObj.setDate(dateObj.getDate() + addDay);
};

// Date Formatting Related
// ----------------------------------

// ----------------------------------
// Others

Util.getStrLastChar = function (inputVal) {
	return inputVal.slice(inputVal.length - 1);
};

Util.generateRandomId = function (len) {
	var id = '';
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var id_size = 12;

	if (len) id_size = len;

	for (var i = 1; i <= id_size; i++) {
		var randPos = Math.floor(Math.random() * charSet.length);
		id += charSet[randPos];
	}

	return id;
};

Util.generateTimedUid = function () {
	return (new Date().getTime()).toString(36);
}


Util.generateRandomNumberRange = function (min_value, max_value) {
	return Math.random() * (max_value - min_value) + min_value;
}

Util.getRandomWord = function (slist, anythingRandom) {
	var arrL = slist.split(',');
	var i = Util.generateRandomNumberRange(0, arrL.length - 1).toFixed(0);
	return arrL[i];
}


Util.generateRandomNumber = function (len) {
	var text = "";
	var possible = "0123456789";

	for (var i = 0; i < len; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

Util.getIndexes = function (inputStr, keyStr) {
	var indexes = [];

	var idx = inputStr.indexOf(keyStr);
	while (idx != -1) {
		indexes.push(idx);
		idx = inputStr.indexOf(keyStr, idx + 1);
	}

	return indexes;
};

Util.upNumber_IntArr = function (arr, upNumber) {
	for (var i = 0; i < arr.length; i++) {
		arr[i] = arr[i] + upNumber;
	}
};


Util.getBaseFromBase = function (input, from, to) {
	return ConvertBase.custom(input, from, to);
};


Util.getJsonStr = function (json) {
	var output = '';

	try {
		if (json) {
			if (typeof (json) === 'object') output = JSON.stringify(json);
			else output = json.toString();
		}
	}
	catch (errMsg) {
		output = ' convert to string failed: ' + errMsg;
	}

	return output;
};


Util.strEndsWith = function (str, suffix) {
	return (str.indexOf(suffix, str.length - suffix.length) !== -1);
};


// Others
// ----------------------------------

Util.encrypt = function (seed, loops) {
	let ret = seed;

	if (seed) {
		for (var i = 0; i < loops; i++) {
			ret = btoa(ret); //SHA256(ret)
		}
	}

	return ret;
};

Util.decrypt = function (garbage, loops) {
	let seed = garbage;
	for (var i = 0; i < loops; i++) {
		seed = atob(seed);
	}
	return seed;
};

// --------------------------------------
// Mobile Check Related --------
Util.isMobi = function () {
	return (/Mobi/.test(navigator.userAgent));
};

Util.isAndroid = function () {
	return (/Android/.test(navigator.userAgent));
};

Util.isIOS = function () {
	return (navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)/i) !== null);
};

Util.lengthInUtf8Bytes = function (str) {
	// Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
	var m = encodeURIComponent(str).match(/%[89ABab]/g);
	return str.length + (m ? m.length : 0);
}

Util.getDateSeparator = function (formatDate) {
	var toTry = ['-', '/', ' '];

	for (var i = 0; i <= toTry.length - 1; i++) {
		if (formatDate.indexOf(toTry[i]) > 0) {
			return toTry[i];
		}
	}
};

Util.numberWithCommas = function (x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// -----------------------------------------------------------------

// -----------------------------------------------------------------

Util.stylesStrAppy = function (stylesStr, tag) {
	try {
		stylesStr.split(';').forEach(style => {
			var styleData = style.split(':');
			if (styleData.length >= 2) tag.css(styleData[0], styleData[1]);
		});
	}
	catch (errMsg) {
		console.log('ERROR in Util.stylesStrAppy, errMsg: ' + errMsg);
	}
};

// -----------------------------------------------------------------

Util.getAsArray = function (inputData) {
	var dataArray = [];

	if (Util.isTypeArray(inputData)) dataArray = inputData;
	else if (Util.isTypeObject(inputData)) dataArray = [inputData];  // if single obj, get as Array

	return dataArray;
};

// -----------------------------------------------------------------

Util.g_TimeOutIds = {};

Util.setDelays_timeout = function (globalTO_ID, timeoutSec, actionFunc) {
	var theTimeOutId = Util.g_TimeOutIds[globalTO_ID];

	if (theTimeOutId) clearTimeout(theTimeOutId);

	Util.g_TimeOutIds[globalTO_ID] = setTimeout(actionFunc, timeoutSec * 1000);
};


// -----------------------------------------------------------------

Util.getAge_ByBirthDate = function (birthDateStr) {
	var age = '';

	try {
		if (birthDateStr && birthDateStr.trim()) {
			var today = new Date();
			var birthDateObj = new Date(birthDateStr);

			age = today.getFullYear() - birthDateObj.getFullYear();
			var notFullYearYet = false;

			// If months has not been passed, yet, remove 1 year from above simple year diff.
			if (today.getMonth() < birthDateObj.getMonth()) notFullYearYet = true; // 2022-06 vs 2021-07
			else if (today.getMonth() === birthDateObj.getMonth()) {
				if (today.getDate() < birthDateObj.getDate()) notFullYearYet = true;
			}

			if (notFullYearYet) age = age - 1;
		}
	}
	catch (errMsg) { console.log('ERROR in Util.getAge_ByBirthDate, ' + errMsg); }

	return age;
};


Util.shortenFileName = function (fileName, shortenLength ) 
{
	var displayName = fileName;
			
	if ( fileName.length > shortenLength )
	{
		var size_minus3Dot = shortenLength - 3;

		// locate extention dot place..
		var lastIdxPos = fileName.lastIndexOf( '.' );

		if ( lastIdxPos === -1 ) {
			displayName = fileName.substr( 0, size_minus3Dot ) + '...';
		}
		else
		{
			var extLength = fileName.length - lastIdxPos;
			var extName = fileName.substr( lastIdxPos );

			displayName = fileName.substr( 0, size_minus3Dot - extLength ) + '...' + extName;
		}
	}

	return  displayName;
};

// option: { unit:'MB', decimal:2, upUnit: true }
Util.formatFileSizeMB = function( val ) //, option )
{
	var resultStr = '';
	var divide = 1000000.0;  //if ( !option ) option = {};

	try
	{
		var calVal = val / divide;

		// UpUnit..
		if ( calVal >= 1000 )
		{
			calVal = calVal / 1000.0;
			resultStr = calVal.toFixed( 2 ) + ' GB';
		}
		else 
		{
			if ( calVal < 0.01 ) calVal = 0.01;  // set min express val.			
			resultStr = calVal.toFixed( 2 ) + ' MB';
		}
	}
	catch ( errMsg ) 
	{
		console.log( 'ERROR in Util.formatFileSizeMB, ' + errMsg );
	}

	return resultStr;
};