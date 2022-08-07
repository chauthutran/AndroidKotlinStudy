// =========================================
//   ActivityListView Class/Methods
//          - View List - filter by view dropdown and sorting controls
// =========================================
function ActivityListView(cwsRenderObj, activityList, viewListNames) {
	var me = this;

	me.cwsRenderObj = cwsRenderObj;
	me.activityListObj = activityList;
	//me.blockList_UL_Tag = blockList_UL_Tag;
	me.viewListNames = viewListNames;

	me.nav2Tag = me.cwsRenderObj.Nav2Tag;

	me.mainList;
	me.viewsDefinitionList; // = ConfigManager.getConfigJson().definitionActivityListViews; // full complete view def list
	me.viewListDefs = [];
	me.groupByDefinitionList = {}; // TODO: check undefined or not existing on config case.
	me.groupByGroups = [];

	me.viewDef_Selected;  // Need to set 'undefined' when view is cleared?

	me.viewFilteredList = [];
	//me.viewsList_CurrentItem;
	me.groupByData = {}; // { 'groupByList': {}, 'activitiesRefGroupBy': {}, 'groupByDef': {}, 'groupByUsed': false };
	//List = [];  // NEW GROUP BY?

	//me.viewListNames = [];  // List of view names - used on this blockList

	// --- Tags -----------------------
	// View Filter Related Tag
	me.viewSelectTag;
	//me.recordPager;

	// Sort Related Tag
	me.sortListButtonTag; // sortList_Tagbutton
	me.sortListDivTag; //     me.sortListUlTag; // sortList_TagUL

	//<div class="Nav2" style="display:none;"></div>

	me.containerTagTemplate = `
    <div class="field" style="border: 1px solid rgba(51, 51, 51, 0.54);">
      <div class="field__label"><label term='viewList_selectView_label'>select view</label><span>*</span></div>
      <div class="field__controls">
        <div class="field__selector">
          <select class="selViewsListSelector" mandatory="true">
          </select>
        </div>
        <div class="field__right" style="display: block;"></div>
      </div>
    </div>
    <div class="Nav2__icon mouseDown" style="transform: rotate(0deg);">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.62497 2V21.0951L5.87888 19.349C5.73243 19.2026 5.49407 19.2026 5.34763 19.349C5.20118 19.4954 5.20118 19.7324 5.34763 19.8789L7.73435 22.2656C7.88081 22.4121 8.11783 22.4121 8.26429 22.2656L10.651 19.8789C10.7975 19.7324 10.7975 19.4954 10.651 19.349C10.5046 19.2026 10.2675 19.2026 10.1211 19.349L8.37497 21.0951V2H7.62497ZM16 2C15.904 2 15.8089 2.03615 15.7356 2.10937L13.3489 4.49609C13.2025 4.64254 13.2025 4.87959 13.3489 5.02604C13.4953 5.17249 13.7324 5.17249 13.8789 5.02604L15.625 3.27995V22.375H16.375V3.27995L18.1211 5.02604C18.2675 5.17249 18.5059 5.17249 18.6523 5.02604C18.7988 4.87959 18.7988 4.64254 18.6523 4.49609L16.2656 2.10937C16.1924 2.03615 16.0959 2 16 2Z" class="c_50"></path>
      </svg>
    </div>
    <div class="Menus_display" style="display: none;">
      <div class="menu_item_comtainer">
        <div class="menu_item_text">Option line</div>
      </div>
    </div>`;


	me.viewOptionTagTemplate = `<option value=""></option>`;
	//me.sortLiTagTemplate = `<li class="liSort" sortid="" ></li>`;

	me.sortDivTagTemplate = `<div class="menu_item_comtainer" sortid="">
        <div class="menu_item_text">Option line</div>
    </div>`;

	//`<li class="liSort" sortid="" ></li>`;

	// ----------------------------

	me.initialize = function () {
		me.setUpInitialData();
	};

	// ----------------------------

	me.render = function () {
		me.nav2Tag.show();

		// Clear previous UI & Set containerTag with templates
		me.clearClassTag(me.nav2Tag);
		me.setClassContainerTag(me.nav2Tag, me.containerTagTemplate);

		// Set viewList/sort related class variables
		me.setClassVariableTags(me.nav2Tag);

		// Populate controls - view related.  Sort related are done in view select event handling.
		me.populateControls(me.viewListDefs, me.viewSelectTag);

		// Events handling
		me.setRenderEvents(me.viewSelectTag, me.sortListButtonTag);

		TranslationManager.translatePage();
	};

	// ----------------------------

	me.viewSelect_1st = function () {
		var firstOptionVal = me.viewSelectTag.find('option:first').attr('value');

		me.viewSelectTag.val(firstOptionVal).change();
	};


	me.viewSelect = function (viewName) {
		me.viewSelectTag.val(viewName).change();
	};

	// ====================================================
	// ----------------------------

	me.setUpInitialData = function () {
		me.mainList = ActivityDataManager.getActivityList();
		me.viewsDefinitionList = ConfigManager.getConfigJson().definitionActivityListViews; // full complete view def list    
		me.groupByDefinitionList = (ConfigManager.getConfigJson().definitionGroupBy) ? Util.cloneJson(ConfigManager.getConfigJson().definitionGroupBy) : {}; // full complete view def list

		// Set Filter View name list and those view's definition info.
		//me.viewListNames = me.blockListObj.blockObj.blockJson.viewListNames;  // These are just named list..  We need proper def again..
		me.viewListDefs = me.getActivityListViewDefinitions(me.viewListNames, me.viewsDefinitionList);
	};

	// -----------------

	me.clearClassTag = function (nav2Tag) {
		nav2Tag.html('');
	};

	me.setClassContainerTag = function (nav2Tag, containerTagTemplate) {
		// Set HTML from template 
		nav2Tag.append(containerTagTemplate);
	};

	me.setClassVariableTags = function (nav2Tag) {
		// View Filter Tags
		me.viewSelectTag = nav2Tag.find('select.selViewsListSelector');

		// Sort Related Tags
		me.sortListButtonTag = nav2Tag.find('div.Nav2__icon'); // sortList_Tagbutton
		me.sortListDivTag = nav2Tag.find('div.Menus_display'); // sortList_TagUL
	};


	me.populateControls = function (viewListDefs, viewSelectTag) {
		// Populate ViewList (select tag options, which is each view)       
		me.populateViewList(viewListDefs, viewSelectTag);

		// Populate Sort is done in 'View' select event
		//    Since selected view contains the sorting definition.
	};


	me.setRenderEvents = function (viewSelectTag, sortListButtonTag) {
		// Set Event, View - View select event
		me.setViewListEvent(viewSelectTag);

		// Set Event, Sort - Sort button click related event, not main sort selection event
		me.setSortOtherEvents(sortListButtonTag);

		// Set Sort selection/click Event (Main one) is done in 'View' select event
		//    Since selected view contains the sorting definition.
	};

	// ============================================

	// 
	me.getActivityListViewDefinitions = function (activityViewNameList, viewsDefinitionList) {
		var retObj = [];

		for (var i = 0; i < activityViewNameList.length; i++) {
			var viewName = activityViewNameList[i];
			var viewDef = viewsDefinitionList[viewName];

			if (viewDef) retObj.push(viewDef);
		}

		return retObj;
	};


	// -----------------------
	// -- Populate Control & Perform Filtering related..

	me.populateViewList = function (viewListDefs, viewSelectTag) {
		// Add options
		viewListDefs.forEach(viewDef => {
			var optionTag = $(me.viewOptionTagTemplate).attr('value', viewDef.id).html(viewDef.name);
			if (viewDef.term) optionTag.attr('term', viewDef.term);
			//`<option value="${viewDef.id}">${viewDef.name}</option>` );
			viewSelectTag.append(optionTag);
		});
	};


	// -------------------------------------
	// -- View Filter Operation Related

	me.switchViewNSort = function (viewName, viewListDefs, mainList) {
		//me.viewsList_CurrentItem = viewItem;
		//var viewDef = me.getViewsItemConfig( viewName );
		me.viewDef_Selected = Util.getFromList(viewListDefs, viewName, "id");

		if (me.viewDef_Selected) {
			me.viewFilteredList = me.viewFilterData(me.viewDef_Selected, mainList);

			// NOTE: TODO: if groupBy exists, we need different sorting?!! <-- 
			me.groupByData = me.setGroupByList(me.viewDef_Selected, me.viewFilteredList, me.groupByDefinitionList);


			// TODO: Sort would be effected by GROUP BY <-- If exists and used, 
			// Populate Sort List - based on viewDef..
			me.populateSorts(me.sortListDivTag, me.viewDef_Selected.sort, me.groupByData);


			// Sort with 1st one..
			me.sortViewList_wt1stOne(me.viewDef_Selected.sort);
		}
		else {
			console.log('Selected View definition not found!');
		}


		// Once the viewFiltered List is decided and sorted, reRender it 
		me.activityListObj.reRenderWithList(me.viewFilteredList, me.groupByData, me.viewDef_Selected);  // there is 'callBack' param..  


		TranslationManager.translatePage();
	};


	me.viewFilterData = function (viewDef, mainList) {
		var filteredData = [];

		if (viewDef.query && !viewDef.dataFilterEval) viewDef.dataFilterEval = viewDef.query;

		// If dataFilter does not exists, the entire data into the 
		if (!viewDef.dataFilterEval) Util.appendArray(filteredData, mainList);
		else {
			var dataFilterEval = Util.getEvalStr(viewDef.dataFilterEval);  // Handle array into string joining

			mainList.forEach(activity => {
				InfoDataManager.setINFOdata('activity', activity);
				InfoDataManager.setINFOclientByActivity(activity);

				try {
					var returnVal = false;
					// inputVal = Util.getEvalStr( dataFilterEval );  // Handle array into string joining
					if (dataFilterEval) returnVal = eval(dataFilterEval);
					if (returnVal === true) filteredData.push(activity);
				} catch (errMsg) { console.log('ActivityListView.viewFilterData, ' + errMsg); }
			});
		}

		return filteredData;
	};


	// --------------------------------------------
	// --- GroupBy Related -----

	me.setGroupByList = function (viewDef, activityList, groupByDefinitionList) {
		var groupByData = { 'groupByList': {}, 'groupListArr': [], 'activitiesRefGroupBy': {}, 'groupByDef': {}, 'groupByUsed': false, 'groupSort': '' };  // reset list.

		// If groupBy exists for this 'view', create groupBy category list and 
		if (viewDef.groupBy) {
			var groupByDef = groupByDefinitionList[viewDef.groupBy];

			if (groupByDef) {
				groupByData.groupByDef = groupByDef;

				for (var i = 0; i < activityList.length; i++) {
					var activity = activityList[i];

					// GroupJson could be 'unique' one created from activity, or from group list.
					var groupJson = me.getGroup_FromViewDef(activity, groupByDef);

					// Set groupByData.groupByList & activitiesRefGroupBy with 'groupJson' & activityId
					me.setGroupByData_withActivity(groupJson, activity, groupByData);
				}

				// Set 'groupByUsed' true/false.
				groupByData.groupByUsed = (Util.objKeyCount(groupByData.groupByList) > 0);
			}
		}

		return groupByData;
	};


	me.getGroup_FromViewDef = function (activity, groupByDef) {
		var groupMatched;

		try {
			InfoDataManager.setINFOdata('activity', activity);
			InfoDataManager.setINFOclientByActivity(activity);

			var evalField = Util.evalTryCatch(groupByDef.evalField, InfoDataManager.getINFO(), 'activityListView.getGroupId_FromViewDef()');

			if (groupByDef.groupType === 'unique') {
				// Each value is a group (automatic grouping).  set 'evaledVal' as groupId, but as string.
				var evalVal = '' + evalField;

				groupMatched = { 'id': evalVal, 'name': evalVal }; //, 'term': evalVal };
			}
			else {
				// See which group this falls in?
				if (groupByDef.groups) {
					for (var i = 0; i < groupByDef.groups.length; i++) {
						var groupDef = groupByDef.groups[i];

						InfoDataManager.setINFOdata('evalField', evalField);

						if (Util.evalTryCatch(groupDef.eval, InfoDataManager.getINFO(), 'activityListView.getGroupId_FromViewDef() Groups') === true) {
							groupMatched = Util.cloneJson(groupDef);
							break;
						}
					}
				}
			}
		}
		catch (errMsg) {
			console.log('Error in activityListView.getGroup_FromViewDef(), errMsg: ' + errMsg);
		}

		return groupMatched;
	};


	me.setGroupByData_withActivity = function (groupJson, activity, groupByData) {
		// ?? TODO: HOW SHOULD WE FORMAT THE GROUPS?  WITH 'ACTIVITIES' IN IT?
		if (groupJson && groupJson.id && activity.id) {
			//var matchingGroup = Util.getFromList( groupByData.groupByList, groupJson.id, 'id' );

			var existingGroup_InList = groupByData.groupByList[groupJson.id];

			if (existingGroup_InList) {
				existingGroup_InList.activities.push(activity);
				// If already in list, use that group..
				groupByData.activitiesRefGroupBy[activity.id] = existingGroup_InList;
			}
			else {
				groupJson.activities = []; // reset the 'activities' list

				groupJson.activities.push(activity);

				// add the groupJson to groupByList..
				groupByData.groupByList[groupJson.id] = groupJson;
				groupByData.groupListArr.push(groupJson);
				groupByData.activitiesRefGroupBy[activity.id] = groupJson;
			}
		}
	};

	// --- GroupBy Related -----
	// --------------------------------------------


	// -------------------------------------
	// -- Sorting Operation Related

	me.populateSorts = function (sortListDivTag, sortList, groupByData) {
		//sortListDivTag.html( '' );
		sortListDivTag.find('div.menu_item_comtainer').remove();

		if (me.usedGroupBy(groupByData)) {
			// Use the sorting in the groupBy..
			//console.log( '**** Use GroupBy sorting!! ******' );

			// TODO: NEED TO SETUP GROUP SORTING..
		}
		else if (sortList) {
			for (var i = 0; i < sortList.length; i++) {

				var sortDef = sortList[i];
				var divTag = $(me.sortDivTagTemplate);

				divTag.attr('sortid', sortDef.id);

				var itemTag = divTag.find('div.menu_item_text');
				itemTag.html(sortDef.name)
				if (sortDef.term) itemTag.attr('term', sortDef.term);

				sortListDivTag.append(divTag);

				me.setSortDivTagClickEvent(divTag, me.viewDef_Selected.sort);

				// TODO: DO THIS LATER
				//if ( sortDef.groupAfter != undefined && sortDef.groupAfter === 'true' )
				//{
				//    var liGroup = $(`<li><hr class="filterGroupHR"></li>`);
				//    sortListDivTag.append( liGroup );
				//}
			}
		}

		// For below, we can use .css to mark the bold for selected.
		// me.updateMenuItem_Tag( me.sortListDivTag.children()[0] );
	};


	me.sortViewList_wt1stOne = function (sortDefs) {
		// TODO: DUPLICATE CALL AS BELOW?
		if (me.usedGroupBy(me.groupByData)) {
			me.sortViewList_ByGroup(me.groupByData);
		}
		else if (sortDefs && sortDefs.length > 0) {
			me.sortViewList(sortDefs[0]);
		}
	};


	me.sortViewList = function (sortDef) {
		Util.tryCatchContinue(function () {

			// Which name to use - 'INFO' vs 'LIST'
			var INFOList_activity = InfoDataManager.setINFOList_Activity(me.viewFilteredList);

			Util.evalSort(sortDef.field, INFOList_activity, sortDef.order.toLowerCase());

			// Put the activity (in INFO) back to activityList..
			me.viewFilteredList = InfoDataManager.getActivityList_fromINFOList(INFOList_activity);

		}, "activityListView.sortViewList()");
	};

	// ------------------------------------------
	// -- Sort activityList by Group Related ---

	me.sortViewList_ByGroup = function (groupByData) {
		if (!groupByData.groupSortOrder) groupByData.groupSortOrder = 'asc';
		else if (groupByData.groupSortOrder === 'asc') groupByData.groupSortOrder = 'desc';
		else if (groupByData.groupSortOrder === 'desc') groupByData.groupSortOrder = 'asc';

		me.viewFilteredList = me.groupBySorting(groupByData, groupByData.groupSortOrder);
	};


	me.groupBySorting = function (groupByData, sortOrder) {
		// 1. sort the group list?
		var usedGroupList_Sorted = Util.sortByKey(groupByData.groupListArr, "id", undefined, sortOrder);

		// 2. recreate view list based on the sorting? - loop through the group and get full activity list..
		return me.getNewActivityList_FromGroupList(usedGroupList_Sorted, groupByData.groupByDef);
	};


	me.getNewActivityList_FromGroupList = function (groupList, groupByDef) {
		var newActivityList = [];
		var contentSort = (groupByDef && groupByDef.contentSort) ? groupByDef.contentSort : '';
		var contentSortOrder = (groupByDef && groupByDef.contentSortOrder) ? groupByDef.contentSortOrder : '';
		//"contentSort": "INFO.client.clientDetails.firstName",

		for (var i = 0; i < groupList.length; i++) {
			var group = groupList[i];

			if (contentSort) {
				me.groupContentSort(newActivityList, group, contentSort, contentSortOrder);
			}
			else {
				Util.appendArray(newActivityList, group.activities);
			}
		}

		return newActivityList;
	};


	// -----------------------------------
	// -- Group Content Sort Methods ---

	me.groupContentSort = function (newActivityList, group, contentSort, contentSortOrder) {
		Util.tryCatchContinue(function () {

			// Which name to use - 'INFO' vs 'LIST'
			var INFOList_activity = InfoDataManager.setINFOList_Activity(group.activities);

			Util.evalSort(contentSort, INFOList_activity, contentSortOrder);

			var newGroupActivities = InfoDataManager.getActivityList_fromINFOList(INFOList_activity);

			Util.appendArray(newActivityList, newGroupActivities);

		}, "activityListView.groupContentSort()");
	};

	// ---------------------------------------------------------
	// -- Events Related

	me.setViewListEvent = function (viewSelectTag) {
		viewSelectTag.off('change').change(function () {
			me.switchViewNSort($(this).val(), me.viewListDefs, me.mainList);
		});
	};


	me.setSortOtherEvents = function (sortListButtonTag) {
		me.sortListButtonTag.click(function (e) {

			if (me.usedGroupBy(me.groupByData)) {
				me.sortViewList_ByGroup(me.groupByData);

				me.activityListObj.reRenderWithList(me.viewFilteredList, me.groupByData, me.viewDef_Selected);
			}
			else {
				me.showSortList();

				e.stopPropagation();

				$('body').off('click').on('click', function () {
					me.hideSortList();
				});
			}
		});
	};

	me.showSortList = function () {
		me.sortListDivTag.css('display', 'table-row');
		me.sortListButtonTag.css('transform', 'rotate(180deg)');
	};

	me.hideSortList = function () {
		$('body').off('click');
		me.sortListDivTag.css('display', 'none');
		me.sortListButtonTag.css('transform', 'rotate(0deg)');
	};

	me.setSortDivTagClickEvent = function (divTag, sortDefs) {
		divTag.click(function () {
			// Hide the sort list popup menu
			me.hideSortList();

			var sortId = $(this).attr('sortid');

			// get sortId and get sortDef from it..
			var sortDef = Util.getFromList(sortDefs, sortId, "id");

			if (sortDef) {
				me.sortViewList(sortDef, me.viewFilteredList);

				// NOTE: displaySetting need to be used with view one..
				me.activityListObj.reRenderWithList(me.viewFilteredList, me.groupByData, me.viewDef_Selected);  // there is 'callBack' param..            
			}
		});
	};


	me.usedGroupBy = function (groupByData) {
		return groupByData.groupByUsed;
	};

	// =-===============================

	me.initialize();
}
