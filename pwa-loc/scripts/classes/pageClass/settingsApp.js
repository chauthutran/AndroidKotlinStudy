// -------------------------------------------
// -- BlockMsg Class/Methods
function settingsApp(cwsRender) {
	var me = this;

	me.cwsRenderObj = cwsRender;

	me.settingsFormDivTag = $('#settingsFormDiv');

	// ----- Tags -----------
	me.settingsInfo_langSelectTag;
	me.settingsInfo_NetworkSync;
	me.settingsInfo_logoutDelay;
	me.settingsInfo_autoCompleteInput;
	me.scrimTag;

	// ----- Data Val ----------
	me.syncOptions = [{ 'id': 0, 'name': 'off' }
		, { 'id': Util.MS_MIN * 5, 'name': '5 min' }
		, { 'id': Util.MS_MIN * 10, 'name': '10 min' }
		, { 'id': Util.MS_MIN * 30, 'name': '30 min' }
		, { 'id': Util.MS_HR, 'name': '1 hr' }
		, { 'id': Util.MS_HR * 24, 'name': '24 hr' }];

	// === TEMPLATE METHODS ========================

	me.initialize = function () {

		// Set HTML & values related
		me.settingsFormDivTag.append(settingsApp.contentHtml);

		me.settingsInfo_langSelectTag = $('#settingsInfo_langSelect');
		me.settingsInfo_NetworkSync = $('#settingsInfo_networkSync');
		me.settingsInfo_logoutDelay = $('#settingsInfo_logoutDelay');
		me.settingsInfo_autoCompleteInput = $('#autoCompleteInput');
		me.scrimTag = me.settingsFormDivTag.find('.sheet_bottom-scrim');

		ConsoleCustomLog.setInitialHtml();

		$( '#divDataShare' ).append( settingsApp.divDataShareHtml );

		// ------------------
		me.setEvents_OnInit();
	}

	// ------------------

	me.render = function () {
		me.populateSettingsPageData(ConfigManager.getConfigJson());

		TranslationManager.translatePage();

		me.showSettingsPage();
	}

	// ------------------

	me.setEvents_OnInit = function () {
		// --------------
		// BUTTON CLICKS

		var show = false;

		$('#languageCollapsibleHeader').click(() => {

			$('#languageCollapsibleBody').slideToggle('fast');

			if (show) {
				$('#languageCollapsibleBody').css('border-bottom', 'none')
				$('#languageCollapsibleHeader').css('border-bottom', '2px solid #F5F5F5')
			}
			else {
				$('#languageCollapsibleHeader').css('border-bottom', 'none')
				$('#languageCollapsibleBody').css('border-bottom', '2px solid #F5F5F5')
			}
			show = !show;
		});



		$('#settingsAppRestHeader').click(function () {

			$('#bodyCollapsible').slideToggle('fast');

			$('#settingsAppRestHeader').toggleClass('collapsible-body--on');

		});


		$('#buttonResetData').click(function () {
			FormUtil.blockPage(undefined, function (scrimTag) {
				// Populates the center aligned #dialog_confirmation div
				FormUtil.genTagByTemplate(FormUtil.getSheetBottomTag(), Templates.settings_app_data_configuration, function (tag) {
					TranslationManager.translatePage();

					$('.divResetApp_Accept').click(function () {
						DataManager2.deleteAllStorageData(function () {
							FormUtil.emptySheetBottomTag();

							MsgFormManager.appBlockTemplate('appLoad');

							SwManager.reGetAppShell();
						});
					});

					$('.divResetApp_Cancel').click(function () {
						FormUtil.emptySheetBottomTag();
						FormUtil.unblockPage(scrimTag);
					});
				});
			});
		});


		var divButtonDcdVersionTag = $('settingsInfo_dcdVersionInner');
		var btnDcdConfigTag = $('#dcdUpdateBtn');

		$(btnDcdConfigTag).click(() => {
			if (!ConnManagerNew.isAppMode_Online()) {
				msgManager.msgAreaShow('Please wait until network access is restored.');
			}
			else {
				FormUtil.showProgressBar();
				var loadingTag = FormUtil.generateLoadingTag(divButtonDcdVersionTag);
				setTimeout(function () {
					$('#imgsettingsInfo_dcdVersion_Less').click();
					me.cwsRenderObj.reGetDCDconfig();
					FormUtil.hideProgressBar();
				}, 500);
			}
		});

		me.settingsInfo_langSelectTag.change(() => {
			TranslationManager.setLangCode(me.settingsInfo_langSelectTag.val());

			TranslationManager.setCurrLangTerms();

			TranslationManager.translatePage();
		});

		me.settingsInfo_NetworkSync.change(() => {
			// Save Data in AppInfoManager for later use...
			AppInfoLSManager.updateNetworkSync(me.settingsInfo_NetworkSync.val());

			ScheduleManager.schedule_syncAll_Background(me.cwsRenderObj);
		});


		me.settingsFormDivTag.find('img.btnBack').click(() => {
			if ($('img.rotateImg').length) {
				$('img.rotateImg').click();
			}
			else {
				me.hideSettingsPage();
			}
		});

		me.evalHideSections = function (excludeID) {
			$('li.settingsGroupDiv').each(function (i, obj) {

				if ($(obj).attr('id') != excludeID && !$(obj).hasClass('byPassSettingsMore')) {
					if ($(obj).is(':visible')) $(obj).hide();
					else $(obj).show();
				}
			});
		};


		$('#settingsInfo_newLangTermsDownload').click(function () {
			var btnDownloadTag = $(this);
			//var langSelVal = me.settingsInfo_langSelectTag.val();
			//var loadingTag = FormUtil.generateLoadingTag(  btnDownloadTag );
			//$("#imgSettingLangTermRotate").addClass("rot_l_anim");
			// FormUtil.showProgressBar();

			TranslationManager.loadLangTerms_NSetUpData(true, function (allLangTerms) {
				if (allLangTerms) {
					me.populateLangList_Show(TranslationManager.getLangList(), TranslationManager.getLangCode());

					// Translate current page
					TranslationManager.translatePage();
				}
			});
		});
	}

	// ------------------

	me.showSettingsPage = function () {
		if ($('#loginFormDiv').is(":visible")) {
			$('#loginFormDiv').hide();
		}

		me.renderNonEssentialFields(SessionManager.getLoginStatus());

		me.settingsFormDivTag.show();
	}

	me.hideSettingsPage = function () {
		//me.settingsFormDivTag.fadeOut( 500 );
		me.settingsFormDivTag.hide();
	}

	// ------------------

	me.populateSettingsPageData = function (dcdConfig) {
		me.populateNetworkSyncList_Show(me.settingsInfo_NetworkSync, me.syncOptions, AppInfoLSManager.getNetworkSync());

		me.setUpMoreInfoDiv();
	}

	me.renderNonEssentialFields = function (userLoggedIn) {

		if (!$('#settingsInfo_networkMode').attr('unselectable')) {
			$('#settingsInfo_networkMode').attr('unselectable', 'on');
			$('#settingsInfo_networkMode').css('user-select', 'none');
			$('#settingsInfo_networkMode').on('selectstart', false);

			$('#settingsInfo_networkMode').click(() => {
				alert("this feature has been disabled !");
			});
		}
	}


	// Called from cwsRender class on 'render'
	me.populateLangList_Show = function (languageList, defaultLangCode) {
		Util.populateSelect(me.settingsInfo_langSelectTag, "Language", languageList);

		if (defaultLangCode) {
			me.setLanguageDropdownFromCode(languageList, defaultLangCode)
		}

		//$( '#settingsInfo_userLanguage_Name' ).html( me.getListNameFromID( languageList, defaultLangCode ) );

		$('#settingsInfo_userLanguage_Update').val(TranslationManager.translateText('Refresh date', 'settingsInfo_userLanguage_Update') + ': ' + PersisDataLSManager.getLangLastDateTime());

		$('#settingsInfo_DivLangSelect').show();
	}

	me.setLanguageDropdownFromCode = function (languageList, langCode) {
		$.each(languageList, function (i, item) {
			if (item.id == langCode) {
				Util.setSelectDefaultByName(me.settingsInfo_langSelectTag, item.name);
			}
		});
	}

	me.getListNameFromID = function (arrList, idVal) {
		for (i = 0; i < arrList.length; i++) {
			if (arrList[i].id == idVal) {
				return arrList[i].name;
			}
		}
	};


	me.getLanguageUpdate = function (languageList, defaultLangCode) {
		// getLangList not used?
		var langList = TranslationManager.getLangList();

		for (i = 0; i < languageList.length; i++) {
			if (languageList[i].id == defaultLangCode) {
				return languageList[i].updated;
			}
		}
	};


	me.populateNetworkSyncList_Show = function (listTag, syncEveryList, syncTimer) {
		Util.populateSelect(listTag, "", syncEveryList);

		if (!Util.checkItemOnSelect(listTag, syncTimer)) {
			// If the value passed in is not in the list, add to the list...
			var optionName = UtilDate.getTimeFromMs(syncTimer, 'minute', ' mins');
			Util.appendOnSelect(listTag, [{ 'id': syncTimer, 'name': optionName }]);
		}

		listTag.val(syncTimer);
		//Util.setSelectDefaultByName( listTag, syncTimer );

		$('#settingsInfo_DivnetworkSelect').show();
	}


	me.populatelogoutDelayList_Show = function (syncEveryList, syncTimer) {

		Util.populateSelect(me.settingsInfo_logoutDelay, "", syncEveryList);
		Util.setSelectDefaultByName(me.settingsInfo_logoutDelay, syncTimer);
		me.settingsInfo_logoutDelay.val(syncTimer);

		$('#settingsInfo_logout_Text').html((syncTimer > 0 ? 'every' : '') + ' ' + me.getListNameFromID(syncEveryList, syncTimer));
		$('#settingsInfo_DivlogoutSelect').show();
	}


	// ========== ************* ==============
	me.setUpMoreInfoDiv = function () {
		me.settingsFormDivTag.find('.linkAppVersionCheck').off('click').click(function () {
			console.log('linkAppVersionCheck clicked!!');
		});

		me.settingsFormDivTag.find('.linkAppUpdateCheck').off('click').click(function () {
			if (!ConnManagerNew.isAppMode_Online()) MsgManager.msgAreaShow('This feature is only available in App Online Mode!');
			else {
				SwManager.checkAppUpdate('[AppUpdateCheck] - SettingsApp linkAppUpdateCheck', {}, function () {
					MsgManager.msgAreaShow('New App Update Found!');
					SessionManager.cwsRenderObj.newSWrefreshNotification();
				});
			}
		});

		me.settingsFormDivTag.find('.linkAppUpdateRefresh').off('click').click(function () {
			// AppInfoManager.setAutoLogin( new Date() );
			AppUtil.appReloadWtMsg();
		});

		// New log open dialog
		me.settingsFormDivTag.find('.showLogs').off('click').click(function () {
			FormUtil.blockPage(undefined, function (scrimTag) {
				ConsoleCustomLog.showDialog();
			});
		});


		var scheduleDateAdjust = ConfigManager.getActivityDef().scheduleDateAdjust;
		if (scheduleDateAdjust && scheduleDateAdjust.enable) {

			me.settingsFormDivTag.find('.holidaysWeekends').show().off('click').click(function () {
				// On popup, display these data..
				// optional entry of date to check?
				FormUtil.openDivPopupArea($('#divPopupArea'), function (divMainContentTag) {
					// Commonly used - Set 'divMainContent' tag to be scrollable..
					divMainContentTag.attr('style', 'overflow: scroll;height: 70%; margin-top: 10px; background-color: #eee;padding: 7px;');

					// Populate content..
					// settingsApp.jobAidFilesPopulate( divMainContentTag );
					me.popoulateHolidaysWeekends(divMainContentTag, scheduleDateAdjust);

					// ------------------------------

					var datePickerColl = $(`<span style="font-size: 0.71rem;">Check Date: </span>
                        <input class="inputCustDate statsCusDate" placeholder="YYYY-MM-DD" readonly style="width: 90px;" />
                        <button class="btnSchDate dateButton2 mouseDown">
                            <img src="images/i_date.svg" class="imgCalendarInput">
                        </button>` );

					var btnHw_DateCheckTag = $('<button class="hwCheck cbtn c_cb">Check</button>');
					var spanDateCheckResultTag = $('<span class="hwCheckResult" style="font-size: small;"></span>');

					// Add the buttons div - also, will be removed each call of 'FormUtil.openDivPopupArea'
					var divExtraSecTag = $('<div class="divExtraSec" style="margin-bottom: 5px;"></div>');

					divExtraSecTag.append(datePickerColl);
					divExtraSecTag.append(btnHw_DateCheckTag);
					divExtraSecTag.append(spanDateCheckResultTag);

					divExtraSecTag.insertBefore(divMainContentTag);


					// -------------------------------------

					var inputCustDateTag = divExtraSecTag.find('.inputCustDate');

					divExtraSecTag.find('.btnSchDate,.inputCustDate').off('click').click(function (e) {
						FormUtil.mdDatePicker2(e, inputCustDateTag, 'YYYY-MM-DD');
					});

					// --------------

					btnHw_DateCheckTag.click(function () {
						var resultStr = '';
						var inputCustDate = inputCustDateTag.val();

						try {
							if (inputCustDate) {
								resultStr = ' - ';
								var sDate = moment(inputCustDate);
								var isWeekend = ActivityUtil.isWeekends(sDate, scheduleDateAdjust);
								var isHoliday = ActivityUtil.isHoliday(sDate, scheduleDateAdjust);

								resultStr += (isHoliday) ? '[IS Holiday]' : '[NOT Holiday]';
								resultStr += ' / ';
								resultStr += (isWeekend) ? '[IS Weekend]' : '[NOT Weekend]';
							}
							else {
								resultStr = ' - The input date is not valid';
							}
						}
						catch (errMsg) {
							resultStr = ' - ERROR during the date checking.';
							console.log('ERROR in holidaysWeekends datePicker, ' + errMsg);
						}

						spanDateCheckResultTag.text(resultStr);
					});

				});
			});
		}


		me.settingsFormDivTag.find('.dataShare').off('click').click(function () {
			FormUtil.blockPage(undefined, function (scrimTag) {
				//ConsoleCustomLog.showDialog();
				me.showDataShareDiv($('#divDataShare'));

				scrimTag.off('click').click(function () {
					FormUtil.unblockPage(scrimTag);
				});
			});
		});


		me.settingsFormDivTag.find('.fixActivities').off('click').click(function () {
			// check connectivity..
			if (!ConnManagerNew.isAppMode_Online()) {
				MsgManager.msgAreaShow('Only available on Online Mode!', 'ERROR');
			}
			else {
				ScheduleManager.clearTimeout_fixOperationRunOnce();

				SettingsStatic.fixOperationRun(function () {
					//MsgManager.msgAreaShow( 'Fix Operation Performed.' );
				});
			}
		});


		me.settingsFormDivTag.find('.jobAidFileListing').off('click').click(function () {
			FormUtil.openDivPopupArea($('#divPopupArea'), function (divMainContentTag) {
				// Commonly used - Set 'divMainContent' tag to be scrollable..
				divMainContentTag.attr('style', 'overflow: scroll;height: 70%; margin-top: 10px; background-color: #eee;padding: 7px;');

				// Populate content..
				settingsApp.jobAidFilesPopulate(divMainContentTag);

				// Create 'clear files' button
				var btnJA_ClearFilesTag = $('<button class="jaClearFiles cbtn">Clear All JobAid Files</button>');
				// Create 'Listing App Download' button
				var btnJA_ListingAppDownloadTag = $('<button class="jaListingAppDownload cbtn c_cb">Download ListingApp Files</button>');


				// Add the buttons div - also, will be removed each call of 'FormUtil.openDivPopupArea'
				var divExtraSecTag = $('<div class="divExtraSec" style="margin-bottom: 5px;"></div>');
				divExtraSecTag.append(btnJA_ClearFilesTag);
				divExtraSecTag.append(btnJA_ListingAppDownloadTag);

				divExtraSecTag.insertBefore(divMainContentTag);

				// --------------

				btnJA_ClearFilesTag.click(function () {
					var reply = confirm('This will clear all files including listing app files.  Do you want to continue?');

					if (reply === true) {
						JobAidHelper.deleteCacheStorage().then(() => {
							// NOTE: TODO: If this is changed to be individual data removal, change below to follow that.
							PersisDataLSManager.removeData(PersisDataLSManager.KEY_JOB_FILING_STATUS);

							MsgManager.msgAreaShow("clearing files success");
							settingsApp.jobAidFilesPopulate(divMainContentTag);
						});
					}
				});


				btnJA_ListingAppDownloadTag.click(function () {
					// Clean up old progress info..
					btnJA_ListingAppDownloadTag.parent().find('.divJobFileLoading').remove();

					// Call job aid caching
					JobAidHelper.runTimeCache_JobAid({ isListingApp: true }, btnJA_ListingAppDownloadTag.parent());
				});
			});
		});


		// if settings has this enabled..
		if (VoucherCodeManager.settingData.enable) {
			var vcQueueTag = me.settingsFormDivTag.find('.vcQueue').show();

			vcQueueTag.off('click').click(function () {
				FormUtil.openDivPopupArea($('#divPopupArea'), function (divMainContentTag) {
					divMainContentTag.attr('style', 'overflow: scroll;height: 85%; margin-top: 10px; background-color: #eee;padding: 7px;');

					/*
					// Delete 'Queue' button
					var btn_vcQueueClearTag = $( '<button class="vcQueueClear cbtn">Clear All JobAid Files</button>' );

					// Add the buttons div - also, will be removed each call of 'FormUtil.openDivPopupArea'
					var divExtraSecTag = $( '<div class="divExtraSec" style="margin-bottom: 5px;"></div>' );
					divExtraSecTag.append( btn_vcQueueClearTag );
					divExtraSecTag.insertBefore( divMainContentTag );

				   
					btn_vcQueueClearTag.click( function() 
					{
						 var reply = confirm( 'This will clear all voucherCode in queue.  Do you want to continue?' );
		 
						 if ( reply === true )
						 {                            
						 }
					});
					*/

					// ---------------
					divMainContentTag.append('<div class="infoLine" style="opacity: 0;">- </div>');
					divMainContentTag.append('<div class="infoLine">------------------------</div>');
					divMainContentTag.append('<div class="infoLine">SettingData: ' + JSON.stringify(VoucherCodeManager.settingData) + '</div>');

					// Total Queue Size
					var queue = PersisDataLSManager.getVoucherCodes_queue();
					var availableInQueue = queue.filter(item => !item.status);
					var usedInQueue = queue.filter(item => item.status);
					var sampleSize = 3;

					divMainContentTag.append('<div class="infoLine" style="opacity: 0;">- </div>');
					divMainContentTag.append('<div class="infoLine">------------------------</div>');
					divMainContentTag.append('<div class="infoLine">Available Codes in Queue: ' + availableInQueue.length + '</div>');
					me.displayVCSamples(availableInQueue, sampleSize, divMainContentTag, DevHelper.devMode);


					divMainContentTag.append('<div class="infoLine" style="opacity: 0;">- </div>');
					divMainContentTag.append('<div class="infoLine">------------------------</div>');
					divMainContentTag.append('<div class="infoLine">' + 'Used Codes in Queue: ' + usedInQueue.length + '</div>');
					me.displayVCSamples(usedInQueue, sampleSize, divMainContentTag, DevHelper.devMode);
				});

			});
		}
	};


	me.popoulateHolidaysWeekends = function (divMainContentTag, scheduleDateAdjust) {
		try {
			if (scheduleDateAdjust.weekends) {
				divMainContentTag.append('<div class="infoLine" style="opacity: 0;">- </div>');
				divMainContentTag.append('<div class="infoLine">-- Weekends Settings ------------</div>');
				divMainContentTag.append('<div class="infoLine">' + JSON.stringify(scheduleDateAdjust.weekends) + '</div>');
			}

			var holidays = scheduleDateAdjust.holidays;
			if (holidays) {
				divMainContentTag.append('<div class="infoLine" style="opacity: 0;">- </div>');
				divMainContentTag.append('<div class="infoLine">-- Holidays Settings ------------</div>');
				divMainContentTag.append('<div class="infoLine">' + JSON.stringify(holidays) + '</div>');

				divMainContentTag.append('<div class="infoLine" style="opacity: 0;">- </div>');
				divMainContentTag.append('<div class="infoLine">-- Holidays List ------------</div>');

				for (var prop in holidays) {
					var holidayYearData = holidays[prop];

					if (Util.isTypeArray(holidayYearData)) {
						holidayYearData.forEach(dateStr => {
							var fullDateStr = prop + '-' + dateStr;
							var formattedStr = moment(fullDateStr).format('YYYY, MMM DD');
							divMainContentTag.append('<div class="infoLine">' + formattedStr + '</div>');
						});
					}
				}
			}

		}
		catch (errMsg) {
			console.log('ERROR in SettingsApp.popoulateHolidaysWeekends, ' + errMsg);
		}
	};


	me.displayVCSamples = function (list, sampleSize, divMainContentTag, isDevMode) {
		if (list.length > 0) {
			if (isDevMode) {
				list.forEach(item => {
					divMainContentTag.append('<div class="infoLine">' + JSON.stringify(item) + '</div>');
				});
			}
			else {
				divMainContentTag.append('<div class="infoLine">Samples: </div>');
				for (var i = 0; i < list.length; i++) {
					if (i >= sampleSize) break;
					var queue = Util.cloneJson(list[i]);
					if (queue.voucherCode) queue.voucherCode = queue.voucherCode.substr(0, 2) + '----';
					divMainContentTag.append('<div class="infoLine">' + JSON.stringify(queue) + '</div>');
				}
			}
		}
	};

	me.showDataShareDiv = function (divDataShareTag) {
		divDataShareTag.show();
		$('.scrim').show();

		var btnCloseTag = divDataShareTag.find('div.close');
		btnCloseTag.off('click').click(function () {
			$('.scrim').hide();
			divDataShareTag.hide();
		});

		divDataShareTag.find('.btnShare').off('click').click(function () {
			var shareCodeTag = divDataShareTag.find('.inputShareCode');
			var shareCode = Util.trim(shareCodeTag.val());

			if (!shareCode) MsgManager.msgAreaShow('Need shareCode!', 'ERROR');
			else {
				var loadingTag = FormUtil.generateLoadingTag($(this));

				var idenObj = { 'info.userName': SessionManager.sessionData.login_UserName, 'info.shareCode': shareCode };

				var updateData = {
					'info': {
						'userName': SessionManager.sessionData.login_UserName
						, 'shareCode': shareCode
						, 'timestamp': Util.getUTCDateTimeStr()
					}
					, 'clientList': ClientDataManager.getClientList()
					//, 'activityHistory': AppInfoManager.getActivityHistory()
					//, 'customLogHistory': AppInfoManager.getCustomLogHistory() 
					, 'debug': AppInfoManager.getData(AppInfoManager.KEY_DEBUG)
				};

				var dataJson = { 'idenObj': idenObj, 'updateData': updateData, 'option': { 'upsert': true } };
				var payloadJson = { 'dataJson': dataJson };

				WsCallManager.requestDWS_SAVE(WsCallManager.EndPoint_ShareDataSave, payloadJson, loadingTag, function (savedResultCount) {
					var isSuccess = false;

					if (savedResultCount === 1) {
						shareCodeTag.val('');
						isSuccess = true;
						//console.log( returnJson );    

						me.AddShareLogMsg(divDataShareTag, 'SHARE UPLOADED. shareCode: ' + shareCode);
					}

					if (isSuccess) MsgManager.msgAreaShow('DataShare Submit Success!');
					else MsgManager.msgAreaShow('DataShare Submit FAILED!', 'ERROR');
				});
			}
		});


		divDataShareTag.find('.btnLoad').off('click').click(function () {
			var loadCodeTag = divDataShareTag.find('.inputLoadCode');
			var loadCode = Util.trim(loadCodeTag.val());

			if (!loadCode) MsgManager.msgAreaShow('Need loadCode!', 'ERROR');
			else {
				var loadingTag = FormUtil.generateLoadingTag($(this));

				var findJson = { 'info.userName': SessionManager.sessionData.login_UserName, 'info.shareCode': loadCode };
				var payloadJson = { 'find': findJson };

				WsCallManager.requestDWS_RETRIEVE(WsCallManager.EndPoint_ShareDataLoad, payloadJson, loadingTag, function (resultList) {
					var isSuccess = false;

					if (resultList.length > 0) {
						loadCodeTag.val('');
						isSuccess = true;

						var shareData = resultList[0];

						// 1. Load ClientList
						var clientList = shareData.clientList;
						if (clientList) {
							ClientDataManager.setActivityDateLocal_clientList(clientList);

							ClientDataManager.mergeDownloadedClients({ 'clients': clientList }, undefined, function () {
								console.log('LoadData clients merged');
								SessionManager.cwsRenderObj.renderArea1st();
							});
						}

						// 2. debug info.. - merge it.  The new download 'debug' become base json..
						var debugData = (shareData.debug) ? shareData.debug : {};
						Util.mergeDeep(debugData, AppInfoManager.getData(AppInfoManager.KEY_DEBUG));
						AppInfoManager.updateData(AppInfoManager.KEY_DEBUG, debugData);


						// [BACKWARD COMPATIBLE - OBSOLETE] 2. load ActivityHistory <-- merge it?  by loading individual adding by loop..
						var activityHistory = shareData.activityHistory;
						if (activityHistory) {
							activityHistory.forEach(activity => {
								AppInfoManager.addToActivityHistory(activity);
							});
						}

						// [BACKWARD COMPATIBLE - OBSOLETE] 3. load CustomLogHistory <-- merge it?  by loading individual adding by loop..
						var customLogHistory = shareData.customLogHistory;
						if (customLogHistory) {
							customLogHistory.forEach(log => {
								AppInfoManager.addToCustomLogHistory(log);
							});
						}

						me.AddShareLogMsg(divDataShareTag, 'LOADED. loadCode: ' + loadCode);
					}

					if (isSuccess) MsgManager.msgAreaShow('DataLoad Success!');
					else MsgManager.msgAreaShow('DataLoad FAILED!', 'ERROR');
				});
			}
		});
	}

	me.AddShareLogMsg = function (divDataShareTag, logMsg) {
		var dateTimeStr = Util.formatDateTime(new Date(), "MM-dd HH:mm");
		logMsg = '[' + dateTimeStr + '] ' + logMsg;

		//var logMsg = '[Time: ' + infoJson.timestamp + '] ' + 'SHARE UPLOADED. shareCode: ' + infoJson.shareCode;
		var logMsgDivTag = $('<div style="font-weight: 300;">' + logMsg + '</div>');

		var divMainContentTag = divDataShareTag.find('.divMainContent');

		divMainContentTag.append(logMsgDivTag);
	};


	me.showNewAppAvailable = function (newAppFilesFound) {
		if (newAppFilesFound) {
			me.settingsFormDivTag.find('.linkAppUpdateCheck').hide();
			me.settingsFormDivTag.find('.linkAppUpdateRefresh').show();
		}
		else {
			me.settingsFormDivTag.find('.linkAppUpdateCheck').show();
			me.settingsFormDivTag.find('.linkAppUpdateRefresh').hide();
		}
	};


	me.getCoordinatesForPresentation = function () {
		var ret = ''; //'<div term="">not required by PWA</div>';
		if (FormUtil.geoLocationLatLon) {
			if (FormUtil.geoLocationLatLon.toString().length) {
				ret = '[' + FormUtil.geoLocationLatLon.toString() + ']'
			}
		}
		return ret;
	}

	me.updateAutoComplete = function (newValue) {
		var tagsWithAutoCompl = $('[autocomplete]');

		tagsWithAutoCompl.each(function () {
			var tag = $(this);
			tag.attr('autocomplete', newValue);
		});

	}


	// =============================================

	me.blockPage = function () {
		me.scrimTag.show();

		me.scrimTag.off('click');

		me.scrimTag.click(function () {
			me.unblockPage();
		})
	}

	me.unblockPage = function () {
		me.scrimTag.hide();

	}

	// ------------------------------------

	me.initialize();
};

settingsApp.jobAidFilesPopulate = function (divTag) {
	divTag.html('');

	//JobAidHelper.getCacheKeys( ( keys, cache ) => 
	JobAidHelper.renderEachData(itemJson => {
		try {
			if (itemJson) divTag.append('<div class="infoLine">' + JSON.stringify(itemJson) + '</div>');
		} catch (errMsg) { console.log('ERROR in settingsApp.jobAidFilesPopulate, ' + errMsg); }
	});
};


settingsApp.contentHtml = `
<div class="wapper_card">
	<div class="sheet-title c_900" style="width: 100%;">
		<img src="images/arrow_back.svg" class="btnSettingsBack btnBack mouseDown">
			<span term="menu_settings">Settings</span>
	</div>
	<div class="card"
		style="padding: 8px; background-color: #FFF; overflow-y: auto !important; height: calc(100vh - 60px); width: calc(100vw - 16px);">
		<div class="field">
			<div class="field__label"><label term="settings_network_sync">Network sync</label></div>
			<div class="field__controls">
				<div class="field__selector">
					<select id="settingsInfo_networkSync"></select>
				</div>
				<div class="field__right"></div>
			</div>
		</div>

		<div class="field">
			<div class="field__label"><label term="settings_userLanguage">User language</label></div>
			<div class="field__controls">
				<div class="field__selector">
					<select id="settingsInfo_langSelect"></select>
				</div>
				<div class="field__right"></div>
			</div>
		</div>

		<div class="field">
			<div class="field__label"><label term="settings_Language_pack_date" id="languageCollapsibleHeader">Language pack date</label></div>
			<div class="field__controls">
				<div class="field__left">
					<input id="settingsInfo_userLanguage_Update" type="text" mandatory="true" readonly>
				</div>
				<div class="field__right"></div>

				<div id="settingsInfo_newLangTermsDownload">
					<img id="imgSettingLangTermRotate" src="images/sync-banner.svg" alt=""
						style="margin-right: 9px; opacity: 0,65;" class="">
				</div>

			</div>
		</div>

		<div class="field">
			<div class="field__label"><label term="settings_other">Others</label></div>
			<div class="field__controls">
				<div class="field__selector">
					<button class="appInstall cbtn" style="background-color: silver;">App Setup</button>
					<button class="linkAppUpdateCheck cbtn c_cb">AppFileNew Check</button>
					<button class="linkAppUpdateRefresh cbtn" style="display: none; color: orange;">AppFileNew Apply</button>
					<button class="holidaysWeekends cbtn" style="display: none;">Holidays/Weekends</button>
					<button class="showLogs cbtn c_cb">Logs</button>
					<button class="dataShare cbtn">Data Share</button>
					<button class="fixActivities cbtn">Fix Data</button>
					<button class="jobAidFileListing cbtn c_cb" style="display: none;">JobAid</button>
					<button class="vcQueue cbtn" style="display: none;">VoucherCode Queue</button>
				</div>
				<div class="field__right"></div>
			</div>
		</div>

		<!-- /scripts/classes/settingsApp line 89 -->
		<div class="field settingsGroupDiv" id="resetCollapsible" style="font-size: 0.875rem;padding:4px; margin-bottom: 30px;">
			<div class="field__label">
				<div class="" id="settingsAppRestHeader" style="cursor: pointer;">
					<div class="field__controls">
						<div class="field__left" style="padding: 4px 0;">
							<svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9ZM12 0C7.03 0 3 4.03 3 9H0L4 13L8 9H5C5 5.13 8.13 2 12 2C15.87 2 19 5.13 19 9C19 12.87 15.87 16 12 16C10.49 16 9.09 15.51 7.94 14.7L6.52 16.14C8.04 17.3 9.94 18 12 18C16.97 18 21 13.97 21 9C21 4.03 16.97 0 12 0Z"
									fill="#333333" fill-opacity="0.87"></path>
							</svg>
							<label term="settings_reset_app_configuration" style="font-size: 1rem;padding: 4px;line-height: 29px;" term="settings_reset_app_configuration">Reset app data &
								configuration</label>
						</div>
						<div class="field__right"></div>
					</div>

					<div class="collapsible-body" id="bodyCollapsible" style="display: none;">
						<div id="bodyCollapsible__text" term="settings_reset_app_configuration_detailed">
							Your configuration and App data stored in the device will be deleted. You will be asked to log in
							again and data which is not synced to the server will be lost.
						</div>
						<div id="buttonResetData" class="button-text alert" style="float:right;">
							<div class="button__container">
								<div class="button-label" term="settings_reset_label">RESET</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
`;

settingsApp.divDataShareHtml = `
<div class="divMainLayout" style="height:100%;">
	<div style="margin-bottom: 5px;">Data Share:</div>
	<div>
		<div>
			<input class="inputShareCode" placeholder="Share Code" style="width: 140px; border: solid 1px #ccc; font-size: 0.75rem;" />
			<button class="btnShare cbtn" style="background-color: cadetblue;" >Share</button>
		</div>
		<div>
			<input class="inputLoadCode" placeholder="Load Code" style="width: 140px; border: solid 1px #ccc; font-size: 0.75rem;" />
			<button class="btnLoad cbtn">Load</button>
		</div>
	</div>

	<div class="divMainContent" style="overflow: scroll;height: 65%; margin-top: 10px; background-color: #eee;padding: 7px;"></div>

	<div class="button-text warning" style="width: 100%; margin: 20px 0px 0px 0px; height: 25px; cursor: unset;">
		<div class="button__container">
			<div class="close button-label" style="line-height: unset;cursor: pointer;">CLOSE</div>
		</div>
	</div>
</div>
`;