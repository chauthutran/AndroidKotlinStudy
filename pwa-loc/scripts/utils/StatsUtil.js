// -------------------------------------------
// -- StatsUtil Class/Methods
//  - Statistic Util library - must match the standAlone version in Git!!
//
// ------------------------------------------

function StatsUtil() { };

StatsUtil._clientsIdx = {};
StatsUtil._activitiesIdx = {};


/* ============================================== */
/* === START UP/SETUP METHODS ================= */

/* For easy backLink, add clientId on activity, activityId on transaction */
StatsUtil.markBackLinkId = function (clientList) {
	clientList.forEach((client) => {

		client.activities.forEach((activity) => {

			activity.clientId = client._id;

			activity.transactions.forEach((tranObj) => {
				tranObj.activityId = activity.id;
			});

		});
	});
};

/* Create Indexes for fast find - client, activity by id */
StatsUtil.setUpIndexList_ClientActivity = function (clientList) {
	clientList.forEach((client) => {

		StatsUtil._clientsIdx[client._id] = client;

		client.activities.forEach((activity) => {

			StatsUtil._activitiesIdx[activity.id] = activity;
		});
	});
};


/* Combine tarnsaction object data to 'combinedJson' */
StatsUtil.tranDataCombine = function (clientList) {
	var tranList = StatsUtil.getTranList(StatsUtil.getActivityList(clientList));

	tranList.forEach((tran) => {

		var combinedJson = {};

		for (var key in tran) {
			var keyObj = tran[key];

			if (typeof keyObj === 'object' && !Array.isArray(keyObj)) {
				$.extend(combinedJson, keyObj);
			}
		}

		tran.combinedJson = combinedJson;
	});
};


/* ============================================== */

StatsUtil.getActivityList = function (clientList) {
	var outActivities = [];

	clientList.forEach((client) => {
		client.activities.forEach((activity) => {
			outActivities.push(activity);
		});
	});

	return outActivities;
};


StatsUtil.getTranList = function (activityList) {
	var outTranList = [];

	activityList.forEach((activity) => {
		activity.transactions.forEach((tranObj) => {
			outTranList.push(tranObj);
		});
	});

	return outTranList;
};

StatsUtil.getClientById = function (clientId) {
	return StatsUtil._clientsIdx[clientId];
};


StatsUtil.getActivityById = function (activityId) {
	return StatsUtil._activitiesIdx[activityId];
};

/* ============================================== */

/* DATA MANIPULATION FUNCTIONS */
/*
	 Data Interest:
		  1. clientDetails - users, name, city, age, etc.. + Eval presentation
		  2. transaction type
		  3. activity date, ActivtyType, location, etc.. activeUser, creditedUsers
		  4. transaction dataValue?  <-- this should have everything...  while 'clientDetails' should be subset of 'dataValue'
*/
StatsUtil.createDateFilteredList = function (startPeriod, endPeriod, clientList, datePropName) {
	if (!datePropName) datePropName = 'capturedLoc';

	var dateFilteredData = {
		'startPeriod': startPeriod, 'endPeriod': endPeriod
		, activityList: [], tranList: [], tranGroupByType: {}
	};

	var activityList = StatsUtil.getActivityList(clientList);

	/* 1. filter by date */
	var activityList_DateFiltered = StatsUtil.filterListByDate(startPeriod, endPeriod, activityList, datePropName);
	dateFilteredData.activityList = activityList_DateFiltered;

	/* 2. trans list */
	dateFilteredData.tranList = StatsUtil.getTranList(dateFilteredData.activityList);

	/* 2. create list by type - var trxTypes = [ 'c_reg', 'v_iss', 'v_rdx' ]; */
	dateFilteredData.tranGroupByType = StatsUtil.getTranGroupByType(dateFilteredData.tranList);

	return dateFilteredData;
};


/* Loop through data array to find a item that maches all properties of 'checkItem' */
StatsUtil.checkMatchingJsonObj = function (dataArr, checkItem) {
	var existingDataItem;

	for (var i = 0; i < dataArr.length; i++) {
		var item = dataArr[i];
		var bMatch = true;

		for (var key in checkItem) {
			if (checkItem[key] !== item[key]) {
				bMatch = false;
				break;
			}
		}

		if (bMatch) {
			existingDataItem = item;
			break;
		}
	}

	return existingDataItem;
};

/* ============================================== */

/*  DO NOT PIVOT DATA.  INSTEAD, CREATE DATA WHILE LOOPING... */
/* StatsUtil.pivotData = function( sourceDataArr, rowFieldName, colFieldName, countFieldName ) */


/* GroupBy --> get count, 'data' could be 'clientDetails', 'trans.combinedJson'  
	 The output is Object rather than Array
	 HOWEVER, For 'GROUP BY', We should let the users decide the list to loop through --> client, activity, transaction
	 If lowest level, transaction, is added, we should have reference to 'client', 'activity' for that transaction
	 For 'client.clientDetail.age' <-- use 'eval' to get this val?

	 Param: 'auto' or 'activity/client/tran' level data
*/

StatsUtil.dataGroupBy = function (dataArr, levelStr, arrFields) {
	var newData = {};

	if (dataArr) {
		dataArr.forEach((item) => {

			try {
				/* Get fields value combination */
				var fieldValData = StatsUtil.getItemFieldCombinationInfo(arrFields, item.combinedJson);

				if (fieldValData.fieldNamesCombo) {
					var name = fieldValData.fieldNamesCombo;
					var groupByOne = newData[name];

					if (groupByOne) {
						groupByOne.count++;
					}
					else {
						newData[name] = fieldValData.fieldJsons;
						newData[name].count = 1;
					}
				}
			}
			catch (errMsg) { console.log('ERROR in StatsUtil.groupBy_Obj, item: ' + JSON.stringify(item)); }
		});
	}

	return newData;
};


// ============================================== */

// DATA MANIPULATION FUNCTIONS
StatsUtil.filterListByDate = function (startPeriod, endPeriod, itemList, datePropertyName) {
	var outList = [];

	var startDate = (startPeriod) ? UtilDate.getDateObj(startPeriod) : undefined;
	var endDate = (endPeriod) ? UtilDate.getDateObj(endPeriod) : undefined;

	itemList.forEach((item) => {
		if (StatsUtil.isInDate(startDate, endDate, item, datePropertyName)) outList.push(item);
	});

	return outList;
};


StatsUtil.isInDate = function (startDate, endDate, item, datePropertyName) {
	var inDate = false;

	try {
		if (item.date && item.date[datePropertyName]) {
			var itemDate = UtilDate.getDateObj(item.date[datePropertyName]);

			//  If 'startDate' or 'endDate' is not available, no need to compare for that date for range.
			if ((!startDate || itemDate >= startDate)
				&& (!endDate || itemDate < endDate)) inDate = true;
		}
	}
	catch (errMsg) { console.log('ERROR in isInDate item date comparison.'); }

	return inDate;
};


StatsUtil.getTranGroupByType = function (tranList) {
	var tranGroup = {};

	tranList.forEach((tran) => {
		var typeName = tran.type;
		if (typeName) {
			if (!tranGroup[typeName]) tranGroup[typeName] = [];
			tranGroup[typeName].push(tran);
		}
	});

	return tranGroup;
};


/* ---------------------------- */
/* Translation stats terms */
StatsUtil.runStatsTranslation = function (termsObj) {
	if (termsObj) {
		var langCode = '';

		if (typeof TranslationManager !== 'undefined' && TranslationManager.currentLangcode) langCode = TranslationManager.currentLangcode;
		else if (termsObj.localLangCode) langCode = termsObj.localLangCode;

		if (langCode && termsObj[langCode]) {
			var terms = termsObj[langCode];

			$('[termstats]').each(function () {
				var tag = $(this);
				var termStatsName = tag.attr('termstats');

				if (termStatsName) {
					var termVal = terms[termStatsName];
					if (termVal) tag.html(termVal);
				}

			});
		}
	}
};

/* ====================================== */
/* === HTML UI Related ================== */

StatsUtil.createTableHtml = function (tableDivTag, titleArr, dataArr, tableClassName) {
	tableDivTag.empty();

	var tagDomElement = tableDivTag[0];

	var table = d3.select(tagDomElement).append('table');

	var sortAscending = true;

	table.attr('class', tableClassName);


	/* If 'titleArr' array item is string, make it object version - according to new 'span' tag appending capability */
	titleArr = titleArr.map(function (item) {
		if (Util.isTypeObject(item)) return item;
		else return { name: item, term: '' }; // if ( Util.isTypeString( item ) )
	});


	dataArr.forEach(data => {
		titleArr.forEach(item => {
			var colData = data[item.name];
			if (!Util.isTypeObject(colData)) data[item.name] = { value: colData, term: '' };
		});
	});


	var headers = table
		.append('thead')
		.append('tr')
		.selectAll('th')
		.data(titleArr).enter()  // 
		.append('th')
		.attr('term', d => d.term)
		.attr('termStats', d => d.termStats)
		.text(d => d.name)
		.on('click', function (d) {
			headers.attr('class', 'header');

			if (sortAscending) {
				rows.sort(function (a, b) { return b[d] < a[d]; });
				sortAscending = false;
				this.className = 'aes';
			} else {
				rows.sort(function (a, b) { return b[d] > a[d]; });
				sortAscending = true;
				this.className = 'des';
			}
		});

	var rows = table
		.append('tbody')
		.selectAll('tr')
		.data(dataArr).enter()
		.append('tr');

	rows.selectAll('td')
		.data(function (d) {
			return titleArr.map(function (item) {
				var colData = (d[item.name]) ? d[item.name] : {};
				return { 'name': item.name, 'value': colData.value, 'term': colData.term, 'termStats': colData.termStats };
			});
		}).enter()
		.append('td')
		.attr('data-th', d => d.name)
		.attr('term', d => d.term)
		.attr('termStats', d => d.termStats)
		.text(d => d.value);
};

