// -------------------------------------------
// -- localStatistics Class/Methods

function Statistics(cwsRenderObj) {
	var me = this;

	me.cwsRenderObj = cwsRenderObj;

	me.statisticsFormDiv = $('#statisticsFormDiv');

	me.inputCustomPeriod_StartTag; // Mark it after generating content from template..
	me.inputCustomPeriod_EndTag;
	me.customStartPeriodBtnTag;
	me.customEndPeriodBtnTag;

	me.statsFormContainerTag;
	me.statsPeriodSelector;
	me.statsContentPageTag;

	me.dateFilterField = 'createdOnDeviceUTC';

	me.allStats = [];
	me.statMetaSummary = {};

	me.templateURL = '';
	me.templateLayout;
	me.templateCode;

	me._clientList_Clone = [];  // local modified copy of clientList - used for statistics.

	var _statsPeriodOptions;


	// === TEMPLATE METHODS ========================

	me.initialize = function () {
		// Set HTML & values related
		me.statisticsFormDiv.append(Statistics.contentHtml);
	};

	me.render = function () {
		try {
			$('#statsNav2').show(); // Stats Nav2       

			me.initialize_UI();

			me.loadPeriodOptions(me.statsPeriodSelector, StatisticsUtil.periodSelectorOptions, 'reset');

			TranslationManager.translatePage();


			me.setEvents_OnRender();


			me.loadStatConfigPage(me.statsContentPageTag, function () {

				// Load script defined period options - This '_statsPeriodOptions' (optional) are from the script
				if (_statsPeriodOptions) me.loadPeriodOptions(me.statsPeriodSelector, _statsPeriodOptions);

				me.applyPeriodSelection(me.statsPeriodSelector, function (startPeriod, endPeriod) {

					me._clientList_Clone = me.prepareClientListData(ClientDataManager.getClientList());

					// This method should have been loaded by above 'script' content eval
					renderAllStats(me._clientList_Clone, startPeriod, endPeriod);

					TranslationManager.translatePage();
				});
			});

			me.statisticsFormDiv.fadeIn();
		}
		catch (errMsg) {
			MsgManager.msgAreaShow('ERROR during statistic rendering', 'ERROR');
			console.log(errMsg);
		}
	};

	// -------------------------------------------------

	me.initialize_UI = function () {
		$(window).scrollTop(0);

		// BELOW SHOULD BE PLACED ON 'init'?
		me.statsContentPageTag = me.statisticsFormDiv.find(".statsContentPage");
		me.statsPeriodSelector = me.statisticsFormDiv.find('.stats_select_period').addClass('disabled');
		me.inputCustomPeriod_StartTag = me.statisticsFormDiv.find('.inputCustomPeriod_Start');
		me.inputCustomPeriod_EndTag = me.statisticsFormDiv.find('.inputCustomPeriod_End');
		me.customStartPeriodBtnTag = me.statisticsFormDiv.find('.customStartPeriodBtn');
		me.customEndPeriodBtnTag = me.statisticsFormDiv.find('.customEndPeriodBtn');
	};


	me.setEvents_OnRender = function () {
		me.statsPeriodSelector.off('change').change(function () {
			me.applyPeriodSelection(me.statsPeriodSelector, function (startPeriod, endPeriod) {
				me.renderWtLoading_byPeriod(startPeriod, endPeriod);
			});
		});

		me.statisticsFormDiv.find('.btnCustomPeriodRun').off('click').click(function () {
			me.renderWtLoading_byPeriod(me.inputCustomPeriod_StartTag.val(), me.inputCustomPeriod_EndTag.val());
		});


		me.statisticsFormDiv.find('img.btnBack').off('click').click(function () {
			//console.log( 'CardClose button clicked' );
			me.allStats = [];
			me.statisticsFormDiv.fadeOut();
		});

		me.customStartPeriodBtnTag.off('click').click(function (e) {
			FormUtil.mdDatePicker2(e, me.inputCustomPeriod_StartTag, 'YYYY-MM-DD');
		});

		me.customEndPeriodBtnTag.off('click').click(function (e) {
			FormUtil.mdDatePicker2(e, me.inputCustomPeriod_EndTag, 'YYYY-MM-DD');
		});

	};


	// =================================================

	me.applyPeriodSelection = function (statsPeriodSelector, callBack) {
		var opt = $('option:selected', statsPeriodSelector);
		var opt_startPeriod = opt.attr('from');
		var opt_endPeriod = opt.attr('to');

		var divDateInfoTag = me.statisticsFormDiv.find('.stats_t_info');
		var divCustomDateTag = me.statisticsFormDiv.find('.stats_t_custom');


		// if 'custom', display...
		if (opt_startPeriod === 'custom' || opt_endPeriod === 'custom') {
			divDateInfoTag.hide();

			// Set custom value if already decided
			if (opt_startPeriod !== 'custom') me.inputCustomPeriod_StartTag.val(opt_startPeriod);
			if (opt_endPeriod !== 'custom') me.inputCustomPeriod_EndTag.val(opt_endPeriod);

			divCustomDateTag.show('fast');
		}
		else {
			divCustomDateTag.hide();

			var spanPeriod_StartTag = divDateInfoTag.find('.spanPeriod_Start');
			var spanPeriod_EndTag = divDateInfoTag.find('.spanPeriod_End');

			if (opt_startPeriod) {
				spanPeriod_StartTag.attr('term', '');
				spanPeriod_StartTag.text(opt_startPeriod);
			}
			else {
				spanPeriod_StartTag.attr('term', 'stats_period_ALL');
				spanPeriod_StartTag.text('ALL');
			}

			if (opt_endPeriod) {
				spanPeriod_EndTag.attr('term', '');
				spanPeriod_EndTag.text(opt_endPeriod);
			}
			else {
				spanPeriod_EndTag.attr('term', 'stats_period_ALL');
				spanPeriod_EndTag.text('ALL');
			}

			divDateInfoTag.show('fast');

			// 'Select a period' has '0' value
			if (opt_startPeriod !== '0' && opt_endPeriod !== '0') {
				callBack(opt_startPeriod, opt_endPeriod);
			}
		}
	};


	me.renderWtLoading_byPeriod = function (startPeriod, endPeriod) {
		var loadingImg_statisticTag = me.statisticsFormDiv.find('.loadingImg_statistic').show();

		setTimeout(function () {
			loadingImg_statisticTag.hide();

			renderAllStats(me._clientList_Clone, startPeriod, endPeriod);

			TranslationManager.translatePage();

		}, 700);
	};


	me.loadStatConfigPage = function (statsContentPageTag, callBack) {
		statsContentPageTag.empty();

		var statJson = ConfigManager.getStatisticJson();

		if (statJson.fileName) {
			var loadList = [];
			var statisticPage = AppInfoManager.getStatisticPages(statJson.fileName);

			var dom_parser = new DOMParser(); // parse HTML into DOM document object 
			var doc = dom_parser.parseFromString(statisticPage, "text/html"); // doc.body.innerHTML = body part 


			// 1. Append HTML Tags
			statsContentPageTag.empty().append(doc.body.innerHTML);
			statsContentPageTag.find('#statsContent').css('margin', '100px 5px 40px 10px');  // Use this if margin is not already set like this..

			// 2. Script bring and run - 'mainRunScript'
			[].map.call(doc.getElementsByTagName('script'), function (el) {
				try {
					//console.log( el );
					if (el.id === 'mainScript') {
						statsContentPageTag.append('<script>' + el.textContent + '</' + 'script>');
					}
					else if (el.getAttribute("wfaload") === "true") {
						var script = document.createElement("script");
						script.type = "text/javascript";
						script.src = el.getAttribute("src");

						loadList.push({ 'name': script.src, 'loaded': false });

						script.onload = function () {
							me.setLoaded_ByScriptName(loadList, script.src);
							me.waitForAllLoaded(loadList, callBack);
						};

						document.getElementsByTagName("head")[0].appendChild(script);
						//var scriptElm  = document.createElement('script');
						//statsContentPageTag.append( '<script src="' + el.getAttribute( "src" ) + '"></' + 'script>' );
					}
				}
				catch (errMsg) {
					console.log(errMsg);
				}
			});


			// 3. Style bring and apply 
			[].map.call(doc.getElementsByTagName('style'), function (el) {
				try {
					if (el.id === 'mainScript') {
						var styleStr = '<style>' + el.textContent + '</' + 'style>';
						statsContentPageTag.append(styleStr);
					}
				}
				catch (errMsg) {
					console.log(errMsg);
				}
			});


			// 4. Style link file
			[].map.call(doc.getElementsByTagName('link'), function (el) {
				try {
					if (el.getAttribute("wfaload") === "true") {
						statsContentPageTag.append('<link ref="stylesheet" href="' + el.getAttribute("href") + '">');

						// 'load' event does not exists for 'link'.  
						//  Instead, we could do this when the app starts!!

						//var link = document.createElement( 'link' );
						//link.ref = "stylesheet";
						//link.href = el.getAttribute( "href" );
						//loadList.push( { 'name': link.href, 'loaded': false } );
						//document.getElementsByTagName("head")[0].appendChild( link );
					}
				}
				catch (errMsg) {
					console.log(errMsg);
				}
			});

			me.waitForAllLoaded(loadList, callBack);
		}
	};


	// For loading the '<script' 1st before calling 'callBack'
	me.waitForAllLoaded = function (loadList, callBack) {
		var allLoaded = true;

		for (var i = 0; i < loadList.length; i++) {
			var loadingItem = loadList[i];

			if (!loadingItem.loaded) {
				allLoaded = false;
				break;
			}
		}

		if (allLoaded) callBack();
	};


	me.setLoaded_ByScriptName = function (loadList, name) {
		var scriptItem = Util.getFromList(loadList, name, 'name');

		if (scriptItem) scriptItem.loaded = true;
	};

	// ------------------------------------

	me.prepareClientListData = function () {
		var clientList_Clone = Util.cloneJson(ClientDataManager.getClientList());

		StatsUtil.markBackLinkId(clientList_Clone);
		StatsUtil.setUpIndexList_ClientActivity(clientList_Clone);
		StatsUtil.tranDataCombine(clientList_Clone);

		return clientList_Clone;
	};

	// -----------------------------------------------


	me.loadPeriodOptions = function (tag, optionsObj, clearOptions) {
		if (tag) {
			if (clearOptions === 'reset') tag.find('option').remove();

			if (optionsObj) {
				var periodOptions = me.convertPeriodOpts(optionsObj);
				me.insertOptions_PeriodTag(tag, periodOptions);
			}
		}
	};


	me.convertPeriodOpts = function (opts) {
		var periodOptions = [];

		for (var key in opts) {
			var item = opts[key];

			try {
				var fromVal = (item.from) ? eval(item.from) : '';
				var toVal = (item.to) ? eval(item.to) : '';

				//if ( item.enabled === 'true' )
				periodOptions.push({
					"name": item.name
					, "term": item.term
					, "from": fromVal
					, "to": toVal
					, "selected": (item.defaultOption === 'true')
				});
			}
			catch (errMsg) {
				console.log('ERROR in statistics.convertPeriodOpts');
			}
		}

		return periodOptions;
	};


	me.insertOptions_PeriodTag = function (selectTag, periodOptions) {
		for (var i = 0; i < periodOptions.length; i++) {
			var option = periodOptions[i];

			// Optionally, we can remove already existing duplicate 'name' one..

			var optTerm = (option.term) ? ' term="' + option.term + '"' : '';

			var newOpt = $('<option from="' + option.from + '" to="' + option.to + '" type="loaded" ' + optTerm + '>' + option.name + '</option>');

			if (option.selected) newOpt.attr('selected', 'selected');

			selectTag.append(newOpt);
		}
	};


	me.getRecordsForDateGroup = function (myArr, periodOpt) {
		var retArr = [];

		if (myArr && myArr.length) {
			for (var i = 0; i < myArr.length; i++) {
				var dtmThis = UtilDate.getDateObj(myArr[i].date[me.dateFilterField]); //myArr[ i ].created

				if (UtilDate.getDateObj(dtmThis) >= UtilDate.getDateObj(periodOpt.from)
					&& UtilDate.getDateObj(dtmThis) <= UtilDate.getDateObj(periodOpt.to)) {
					retArr.push(myArr[i]);
				}

			}
		}

		return retArr;
	};

	// -----------------------------------------------

	me.initialize();
};


Statistics.contentHtml = `
<div class="wapper_card">
	<div class="sheet-title c_900" style="width: 100%;">
		<img src="images/arrow_back.svg" class="btnBack mouseDown">
			<span term="menu_statistics">Statistics</span>
	</div>

	<div id="statsNav2" class="Nav2" style="position:absolute !important; z-index: 1500;">
		<div class="controls">
			<div class="field">
				<div class="field__label"><label term="stats_period_select">Select a period</label><span>*</span></div>
				<div class="field__controls">
					<div class="field__selector">
						<select class="stats_select_period" mandatory="true">
							<option from="0" to="0" value="0" term="stats_period_select">Select a period</option>
						</select>
					</div>
				</div>
			</div>
			<div class="stats_t_info text_help" style="display:none;">
				<span term="stats_periodDateBetween">Between</span> <span class="spanPeriod_Start"></span> <span term="stats_periodDateAnd">and</span> <span class="spanPeriod_End"></span>
			</div>
			<div class="stats_t_custom text_help" style="display:none;">
				<span style="font-size: 0.71rem;" term="stats_periodDateBetween">Between</span>
				<input class="inputCustomPeriod_Start statsCusDate" placeholder="YYYY-MM-DD" readonly />
				<button class="customStartPeriodBtn dateButton2 mouseDown"><img src="images/i_date.svg" class="imgCalendarInput"></button>
				<span style="font-size: 0.71rem;" term="stats_periodDateAnd">And</span>
				<input class="inputCustomPeriod_End statsCusDate" placeholder="YYYY-MM-DD" readonly />
				<button class="customEndPeriodBtn dateButton2 mouseDown"><img src="images/i_date.svg" class="imgCalendarInput"></button>
				<button class="btnCustomPeriodRun cbtn c_cfb" term="stats_period_customRange_run">Run</button>
			</div>
		</div>
	</div>

	<div class="loadingImg_statistic" style="margin: 80px 0px 0px 50px; display: none;"><img src="images/loading_big_blue.gif"></div>

	<div class="statsContentPage card" style="overflow: auto !important; height: calc(100vh - 60px);"></div>
</div>
`;


function StatisticsUtil() { };
// THIS SHOULD BE OVERWRITTEN BY page ones...

StatisticsUtil.periodSelectorOptions = {
	"all": {
		"name": "All periods",
		"term": "stats_period_allPeriods",
		"from": "",
		"to": "",
		"enabled": "true",
		"defaultOption": "true"
	},
	"thisWeek": {
		"name": "this Week",
		"term": "stats_period_thisWeek",
		"from": "moment().startOf('week').format('YYYY-MM-DD');",
		"to": "moment().endOf('week').format('YYYY-MM-DD');",
		"enabled": "true",
		"note": "week starts on Saturday?"
	},
	"lastWeek": {
		"name": "last Week",
		"term": "stats_period_lastWeek",
		"from": "moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');",
		"to": "moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');",
		"enabled": "true"
	},
	"thisMonth": {
		"name": "this Month",
		"term": "stats_period_thisMonth",
		"from": "moment().startOf('month').format('YYYY-MM-DD');",
		"to": "moment().endOf('month').format('YYYY-MM-DD');",
		"enabled": "true",
		"note": "month range is from 2nd of month to 1st of next month?"
	},
	"lastMonth": {
		"name": "last Month",
		"term": "stats_period_lastMonth",
		"from": "moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');",
		"to": "moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');",
		"enabled": "true"
	},
	"thisYear": {
		"name": "this Year",
		"term": "stats_period_thisYear",
		"from": "moment().startOf('year').format('YYYY-MM-DD');",
		"to": "moment().endOf('year').format('YYYY-MM-DD');",
		"enabled": "true"
	},
	"customRange": {
		"name": "custom range",
		"term": "stats_period_customRange",
		"from": "'custom'",
		"to": "'custom'",
		"enabled": "true"
	}
};


StatisticsUtil.periodSelectorOptions_Back = {
	"today": {
		"name": "today",
		"term": "",
		"from": "Util.dateStr( 'DATE' );",
		"to": "Util.dateStr( 'DATE' );",
		"enabled": "false"
	},
	"24hours": {
		"name": "last 24 hours",
		"term": "",
		"from": "Util.dateAddStr( 'DATETIME', -1 );",
		"to": "Util.dateStr( 'DATETIME' );",
		"enabled": "false"
	},
	"last3Days": {
		"name": "last 3 Days",
		"term": "",
		"from": "Util.dateAddStr( 'DATE', -2 );",
		"to": "Util.dateStr( 'DATE' );",
		"enabled": "false"
	},
	"last7Days": {
		"name": "last 7 Days",
		"term": "",
		"from": "Util.dateAddStr( 'DATE', -6 );",
		"to": "Util.dateStr( 'DATE' );",
		"enabled": "false"
	},

	"thisPaymentPeriod": {
		"name": "this Payment Period",
		"term": "",
		"from": "new Date(new Date().getFullYear(), new Date().getMonth() - 1, 22).toISOString().split( 'T' )[ 0 ]",
		"to": "new Date(new Date().getFullYear(), new Date().getMonth(), 21).toISOString().split( 'T' )[ 0 ]",
		"enabled": "false"
	},
	"lastPaymentPeriod": {
		"name": "last Payment Period",
		"term": "",
		"from": "new Date(new Date().getFullYear(), new Date().getMonth() - 2, 22).toISOString().split( 'T' )[ 0 ]",
		"to": "new Date(new Date().getFullYear(), new Date().getMonth() - 1, 21).toISOString().split( 'T' )[ 0 ]",
		"enabled": "false"
	},
	"thisQuarter": {
		"name": "this Quarter",
		"term": "",
		"from": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3, 2).toISOString().split( 'T' )[ 0 ]",
		"to": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3 + 3, 1).toISOString().split( 'T' )[ 0 ]",
		"enabled": "false"
	},
	"lastQuarter": {
		"name": "last Quarter",
		"term": "",
		"from": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3 - 3, 2).toISOString().split( 'T' )[ 0 ]",
		"to": "new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3, 1).toISOString().split( 'T' )[ 0 ]",
		"enabled": "false"
	},
	"last3Months": {
		"name": "last 3 Months",
		"term": "",
		"from": "new Date(new Date().getFullYear(), new Date().getMonth() - 2, 2).toISOString().split( 'T' )[ 0 ]",
		"to": "new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split( 'T' )[ 0 ]",
		"enabled": "false"
	},
	"last6Months": {
		"name": "last 6 Months",
		"term": "",
		"from": "new Date(new Date().getFullYear(), new Date().getMonth() - 5, 2).toISOString().split( 'T' )[ 0 ]",
		"to": "new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split( 'T' )[ 0 ]",
		"enabled": "false"
	},
	"lastYear": {
		"name": "last Year",
		"term": "",
		"from": "Util.dateStr( 'DATE', new Date( new Date().getFullYear() - 1, 0, 2 ) );",
		"to": "Util.dateStr( 'DATE', new Date( new Date().getFullYear(), 0, 1 ) );",
		"enabled": "false"
	}
};