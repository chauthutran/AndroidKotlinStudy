// -------------------------------------------
// -- Login Class/Methods
//
//  - Collect userName input and pin in real time..
//		- use it on 'render' as needed (load it.)
//		- clear on render..
// 
// -------------------------------------------- 
function Login() {
	var me = this;

	me.loginFormDivTag = $('#loginFormDiv');

	me.loginBtnTag;
	me.passRealTag;
	me.loginUserNameTag;
	me.loginUserPinTag;
	me.loginFormTag;
	me.advanceOptionLoginBtnTag;
	me.loginPinClearTag;
	me.splitPasswordTag;

	// ------------

	// Flags
	me.lastPinTrigger = false;
	me.loginPage1stTouchFlag = false;
	me.loginBtn_NotHideFlag = false;

	me.current_userName = "";	// Used to load the userName/password when it got refreshed by mistake - or by appUpdate
	me.current_password = {};

	me.loginAppUpdateCheck = false;

	// -------------
	me.ERR_MSG_blackListing = '> <span term="' + Constants.term_LoginBlackListingMsg + '">Country is blackListed on current stage.</span>';

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function () {
		// Set HTML & values related
		me.loginFormDivTag.append(Login.contentHtml);

		me.loginBtnTag = $('.loginBtn');
		me.passRealTag = $('#passReal');
		me.loginUserNameTag = $('.loginUserName');
		me.loginUserPinTag = $('.loginUserPin');
		me.loginFormTag = $('div.login_data');
		me.advanceOptionLoginBtnTag = $('#advanceOptionLoginBtn');	
		me.loginPinClearTag = $('#loginPinClear');
		me.splitPasswordTag = $('.split_password');

		// ------------------
		me.setEvents_OnInit();
	}

	me.render = function () {
		GAnalytics.setSendPageView('/' + GAnalytics.PAGE_LOGIN);
		GAnalytics.setEvent('LoginOpen', GAnalytics.PAGE_LOGIN, 'login displayed', 1);

		// In test version with special url param, do not hide login buttons
		me.testVersion_LoginBtn_NotHide('test', 'Y');

		me.appVersionInfoDisplay();

		me.openForm();  // with reset Val

		// Translate the page..
		TranslationManager.translatePage();

		//MsgManager.msgAreaShowOpt( 'Testing Notification Msg', { cssClasses: 'notifCBlue', hideTimeMs: 900000, styleArr: [ { name: 'background-color', value: '#50A3C6' } ] } );
	};

	// =============================================

	me.setEvents_OnInit = function () {
		// Tab & Anchor UI related click events
		FormUtil.setUpTabAnchorUI(me.loginFormDivTag);

		me.setLoginEvents();
		me.setAdvOptBtnClick();

		me.setUpInteractionDetect();
	}

	// =============================================
	// === EVENT HANDLER METHODS ===================

	me.setUpInteractionDetect = function () {
		me.loginFormDivTag.focusin(function () {
			me.checkAppUpdate_InLoginOnce('[AppUpdateCheck] - loginFormDiv Focus In');
		});

		me.loginFormDivTag.click(function () {
			me.checkAppUpdate_InLoginOnce('[AppUpdateCheck] - loginFormDiv Click');
		});
	};


	me.checkAppUpdate_InLoginOnce = function (checkTypeTitle) {
		if (!me.loginAppUpdateCheck) {
			SwManager.checkAppUpdate(checkTypeTitle);

			me.loginAppUpdateCheck = true;
		}
	};


	me.setLoginEvents = function () {
		// Save userName that user has entered - to restore when App refreshed by appUpdate
		me.loginUserNameTag.keyup(function () {
			me.current_userName = me.loginUserNameTag.val();
		});


		// Disable this...
		me.loginBtnTag.focus(function () {
			me.passRealTag.hide();
		});


		me.splitPasswordTag.find('.pin1').focus(function () {
			SwManager.checkAppUpdate('[AppUpdateCheck] - PassCode Pin 1');
		});


		me.loginBtnTag.click(function () {
			$('.pin_pw_loading').hide();

			var loginUserNameVal = me.loginUserNameTag.val();
			var loginUserPinVal = ''; //me.loginUserPinTag.val();

			var pin1Val = Util.trim(me.splitPasswordTag.find('.pin1').val());
			var pin2Val = Util.trim(me.splitPasswordTag.find('.pin2').val());
			var pin3Val = Util.trim(me.splitPasswordTag.find('.pin3').val());
			var pin4Val = Util.trim(me.splitPasswordTag.find('.pin4').val());

			if (pin1Val && pin2Val && pin3Val && pin4Val) {
				loginUserPinVal = pin1Val + pin2Val + pin3Val + pin4Val;
			}

			if (loginUserNameVal == "" || loginUserPinVal == "") {
				me.clearResetPasswords();
				MsgManager.msgAreaShow('Please enter username / fill all pin', 'ERROR');
			}
			else {
				if (me.lastPinTrigger) $('.pin_pw_loading').show();

				// NOTE: On login button click, also check app update..
				SwManager.checkAppUpdate('[AppUpdateCheck] - Login Processing', { noMinTimeSkip: true });

				// Main Login Processing
				me.processLogin(loginUserNameVal, loginUserPinVal, location.origin, $(this), function (success) {
					me.clearResetPasswords();
					if (!success) $('.pin1').focus();
				});
			}
		});

		$(".onKeyboardOnOff").focus(function () { // Focus		
			me.loginBottomButtonsVisible(false);
		});

		$(".onKeyboardOnOff").blur(function () { // Lost focus
			me.loginBottomButtonsVisible(true);
		});

		$(".pin_pw").keyup(function (event) {
			// 'keyup' - comes here after the value has been affected/entered to the field.
			var tag = $(this);
			var tagVal = tag.val();

			var isDeleteKey = (event.keyCode == FormUtil.keyCode_Delete || event.keyCode == FormUtil.keyCode_Backspace);
			var hasVal = (tagVal.length > 0);

			if (isDeleteKey) {
				if (!hasVal) {
					// go to previous pin tag.
					var prevTag = tag.prev('.pin_pw');
					if (prevTag) prevTag.focus();
				}
			}
			else {
				if (hasVal) //== this.maxLength ) 
				{
					if ($(this).hasClass('pin4')) {
						// if userName is already selected /filled
						if (Util.trim(me.loginUserNameTag.val()).length > 0) {
							me.lastPinTrigger = true;
							me.loginBtnTag.click();
						}
					}
					else {
						// If multiple char entered, just leave last one. <-- Obsolete by 'keydown' implementation
						//if ( tagVal.length > 1 ) tag.val( Util.getStrLastChar( tagVal ) );

						var nextTag = $(this).next('.pin_pw');
						if (nextTag) nextTag.focus();
					}
				}
			}

			//me.current_password = me.getCurrentPassword();
		});

		// 
		$(".pin_pw").keydown(function (event) {
			var isDeleteKey = (event.keyCode == FormUtil.keyCode_Delete || event.keyCode == FormUtil.keyCode_Backspace);

			// If there is already a char in the pin, do not add it.
			// However, if that is delete key, allow it.
			if (!isDeleteKey && $(this).val().length >= 1) return false;
		});

		me.loginPinClearTag.off('click').click(function () {
			me.clearResetPasswords();
			$('.pin1').focus();

			// NOTE: We also need to cancel the current login process..
		});
	};

	me.setAdvOptBtnClick = function () {
		me.advanceOptionLoginBtnTag.click(function () {

			FormUtil.blockPage(undefined, function (scrimTag) {
				scrimTag.off('click').click(function () {
					FormUtil.emptySheetBottomTag();
					FormUtil.unblockPage(scrimTag);
				});
			});


			FormUtil.genTagByTemplate(FormUtil.getSheetBottomTag(), Templates.Advance_Login_Buttons, function (tag) {
				// Template events..
				tag.find('.switchToStagBtn').click(function () {
					alert('switchToStagBtn');
					FormUtil.emptySheetBottomTag();
					FormUtil.unblockPage();
				});

				tag.find('.demoBtn').click(function () {
					alert('demo');
					FormUtil.emptySheetBottomTag();
					FormUtil.unblockPage();
				});

				tag.find('.changeUserBtn').click(function () {
					me.changeUserBtnClick();
				});
			});
		});
	};


	me.changeUserBtnClick = function () {
		FormUtil.getScrimTag().off('click');  // Make it not cancelable by clicking on scrim anymore...

		// Populates the center aligned #dialog_confirmation div
		FormUtil.genTagByTemplate(FormUtil.getSheetBottomTag(), Templates.Change_User_Form, function (tag) {
			$('#accept').click(function () {
				DataManager2.deleteAllStorageData(function () {
					FormUtil.emptySheetBottomTag();

					MsgFormManager.appBlockTemplate('appLoad');

					AppUtil.appReloadWtMsg("User Change - Deleteting Existing Data..");
				});
			});

			$('#cancel').click(function () {
				FormUtil.emptySheetBottomTag();
				FormUtil.unblockPage();
			});
		});
	};


	// ============================================

	me.testVersion_LoginBtn_NotHide = function (paramName, paramVal) {
		Util.tryCatchContinue(function () {
			me.loginBtn_NotHideFlag = (Util.getParameterByName(paramName) === paramVal);
		}, 'Login.testVersion_LoginBtn_NotHide');
	};

	me.loginBottomButtonsVisible = function (bShow) {
		var buttonsDivTag = $(".login_cta");

		if (me.loginBtn_NotHideFlag) {
			// Always show
			buttonsDivTag.show();
		}
		else {
			if (bShow) buttonsDivTag.show();
			else buttonsDivTag.hide();
		}
	};

	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.appVersionInfoDisplay = function () {
		$('#spanVersion').text(TranslationManager.translateText('Version', 'landingPage_version_label') + ' ' + _ver);
		$('#spanVerDate').text(' [' + _verDate + ']');
		$('#loginVersionNote').append('<label style="color: #999999; font-weight: 350;"> ' + _versionNote + '</label>');

		$('#spanLoginAppUpdate').off('click').click(() => {
			AppUtil.appReloadWtMsg();
		});

		if (WsCallManager.isLocalDevCase) {
			var localSiteInfoTag = $('#localSiteInfo');
			localSiteInfoTag.show();

			var localStageTag = $('#localStage');

			//var savedLocalStageName = AppInfoManager.getLocalStageName();
			localStageTag.val(WsCallManager.stageName);

			localStageTag.off('change').change(() => {
				var stage = localStageTag.val();
				AppInfoLSManager.setLocalStageName(stage);
				WsCallManager.setWsTarget_Stage(stage);
				alert('Changed to [' + stage + ']');
			});
		}
	};

	// -----------------------------------

	me.openForm = function () {
		// Reset various login related flags - the 1st touch/focus flag..
		me.loginPage1stTouchFlag = false;
		me.loginAppUpdateCheck = false;


		SessionManager.cwsRenderObj.hidePageDiv();


		me.loginFormDivTag.show();
		Menu.setInitialLogInMenu();

		// Reset vals and set focus
		me.clearResetPasswords();

		if (!me.loginUserNameTag.val()) me.loginUserNameTag.focus();

		me.loginBottomButtonsVisible(true);
	};


	me.closeForm = function () {
		var loginUserNameH4Tag = $('#loginUserNameH4');

		// Div (Input) part of Login UserName
		$('#loginField').hide();


		me.loginFormDivTag.hide();

		// input parts..  Below will be hidden, though...
		//$( 'input.loginUserName' ).val( lastSession.user );	
		$('input.loginUserName').attr('readonly', true);

		// Display login name as Big text part - if we already have user..
		loginUserNameH4Tag.text(me.loginUserNameTag.val()).show();


		//$( '#advanceOptionLoginBtn' ).removeClass( 'dis' ).addClass( 'l-emphasis' );

		FormUtil.hideProgressBar();
	};


	me.clearResetPasswords = function () {
		// If last pin cause error, move the focus to 1st one.
		// if ( me.lastPinTrigger ) $( '.pin1' ).focus();

		me.lastPinTrigger = false;
		$('#pass').val('');
		$('.pin_pw').val('');
		$('.pin_pw_loading').hide();
	};

	// ------------------------------------------
	// --- Perform Login Related...

	me.processLogin = function (userName, password, server, btnTag, callAfterDone) {
		var parentTag = btnTag.parent();
		var dtmNow = (new Date()).toISOString();

		parentTag.find('div.loadingImg').remove();

		SessionManager.Status_LogIn_InProcess = true;


		// ONLINE vs OFFLINE HANDLING
		// Also, if replica login server is not available, use offline process to login.
		if (!ConnManagerNew.REPLICA_Available || ConnManagerNew.isAppMode_Offline()) {
			me.loginOffline(userName, password, function (isSuccess, offlineUserData) {
				SessionManager.Status_LogIn_InProcess = false;

				if (isSuccess) {
					me.loginSuccessProcess(userName, password, offlineUserData, function () {
						VoucherCodeManager.setSettingData(ConfigManager.getVoucherCodeService(), function () {
							VoucherCodeManager.checkLowQueue_Msg();
						});

						// After StartUp Fun - This should be displayed after loading..
						SessionManager.check_warnLastConfigCheck(ConfigManager.getConfigUpdateSetting());
					});
				}

				if (callAfterDone) callAfterDone(isSuccess);
			});
		}
		else {
			var loadingTag = FormUtil.generateLoadingTag(btnTag.find('.button-label'));

			me.loginOnline(userName, password, loadingTag, function (isSuccess, loginData) {
				SessionManager.Status_LogIn_InProcess = false;

				if (isSuccess) {
					me.loginSuccessProcess(userName, password, loginData, function () {
						VoucherCodeManager.setSettingData(ConfigManager.getVoucherCodeService(), function () {
							VoucherCodeManager.refillQueue(userName, function () {
								VoucherCodeManager.checkLowQueue_Msg();
							});
						});
					});
				}

				if (callAfterDone) callAfterDone(isSuccess);
			});
		}
	};


	me.loginSuccessProcess = function (userName, password, loginData, runAfterFunc) {
		// gAnalytics Event
		GAnalytics.setEvent("Login Process", "Login Button Clicked", "Successful", 1);
		//GAnalytics.setEvent = function(category, action, label, value = null) 

		// Load config and continue the CWS App process
		if (!loginData.dcdConfig || loginData.dcdConfig.ERROR) MsgManager.msgAreaShow('<span term="msgNotif_loginSuccess_noConfig">Login Success, but country config not available.</span> <span>Msg: ' + loginData.dcdConfig.ERROR + '</span>', 'ERROR');
		else {
			// Block with loading msg
			MsgFormManager.appBlockTemplate('loginAfterLoad');

			// Load Activities
			SessionManager.cwsRenderObj.loadActivityListData_AfterLogin(function () {
				me.showHideUi_SetVals_AfterLogin(userName);

				// Unblock with loading msg
				MsgFormManager.appUnblock('loginAfterLoad');

				// Some eval opereations or other operations to run after login
				me.operationsAfterLogin(userName);


				// call CWS start with this config data.. - Block Start
				SessionManager.cwsRenderObj.startWithConfigLoad(runAfterFunc);

				// "SCH_SyncDown_RunOnce", "SCH_FixOper_RunOnce", "SCH_SyncAll_Background"
				ScheduleManager.runSchedules_AfterLogin(SessionManager.cwsRenderObj);

				// Call server available check again <-- since the dhis2 sourceType of user could have been loaded at this point.  For availableType 'v2' only.
				ConnManagerNew.checkNSet_ServerAvailable();
			});
		}
	};


	me.showHideUi_SetVals_AfterLogin = function (userName) {
		// 1. Data Related Process
		SyncManagerNew.SyncMsg_Reset();

		// Save userName to 'appInfo.userInfo'
		AppInfoLSManager.setUserName(userName);

		SessionManager.setLoginStatus(true);
		InfoDataManager.setDataAfterLogin(); // sessionData.login_UserName update to 'INFO' object

		//AppInfoManager.setLastLoginMark( new Date() );

		// menu area user name show
		$('div.navigation__user').html(userName);

		MsgManager.initialSetup();

		// 2. UI Related Process
		me.closeForm();

		SessionManager.cwsRenderObj.showPageDiv();
	};


	me.operationsAfterLogin = function () {
		// NOTE: After Login Operations BELOW: (Client data are loaded in memory already)
		try {
			// #1 - Eval methods or run methods after 'login' time.
			// - Eval statements placed in config file to run after login time
			ConfigManager.runAppRunEvals('login');

			ConfigManager.activityStatusSwitchOps('onLogin', ActivityDataManager.getActivityList());

			// Config > 'settings' > 'loginTimeRuns'
			ConfigManager.runLoginTimeRuns();
		}
		catch (errMsg) {
			console.log('ERROR in operationsAfterLogin, ' + errMsg);
		}
	};

	// ----------------------------------------------

	me.loginOnline = function (userName, password, loadingTag, returnFunc) {
		WsCallManager.submitLogin(userName, password, loadingTag, function (success, loginData) {
			// Below method also handles 'configNoNewVersion' case - getting offline dcdConfig and use it.
			me.checkLoginData_wthErrMsg(success, userName, password, loginData, function (resultSuccess) {
				if (resultSuccess) {
					me.setModifiedOUAttrList(loginData);
					AppInfoLSManager.setLastOnlineLoginDt((new Date()).toISOString());
					//AppInfoLSManager.saveConfigSourceType( loginData );  // MOVED AFTER CONFIGLOADING - For Availability Check Usage

					// Save 'loginData' in indexedDB for offline usage and load to session.
					SessionManager.setLoginRespData_IDB(userName, password, loginData);

					// IMPORTANT PART - Load loginData in session, use 'dcdConfig' to load ConfigManager data.
					SessionManager.loadSessionData_nConfigJson(userName, password, loginData);
					var configJson = ConfigManager.getConfigJson();

					// Save values in 'AppInfoLS' after online login
					AppInfoLSManager.saveConfigSourceType(configJson.sourceType);  // For Availability Check Usage, store 'sourceType'
					AppInfoLSManager.setConfigVersioningEnable(ConfigManager.getSettings().configVersioningEnable); // Used on login request
					AppInfoLSManager.setConfigVersion(configJson.version);

					var loginPrevData = { 
						retrievedDateTime: configJson.retrievedDateTime,
						settings: {
							login_GetOuChildren: configJson.settings.login_GetOuChildren,
							login_GetOuTagOrgUnits: configJson.settings.login_GetOuTagOrgUnits,
							login_GetVMMC_OugId: configJson.settings.login_GetVMMC_OugId	
						}
					};

					AppInfoLSManager.setLoginPrevData(loginPrevData);


					me.retrieveStatisticPage((fileName, statPageData) => { me.saveStatisticPage(fileName, statPageData); });

					// AppInfo IndexDB one..  What does this do?  forgot..
					AppInfoManager.loadData_AfterLogin(userName, password, function () {
						if (returnFunc) returnFunc(resultSuccess, loginData);
					});
				}
				else {
					if (returnFunc) returnFunc(resultSuccess, loginData);
				}
			});
		});
	};


	me.loginOffline = function (userName, password, returnFunc) {
		SessionManager.checkOfflineDataExists(userName, function (dataExists) {
			if (dataExists) {
				if (AppInfoLSManager.getBlackListed()) {
					// Translation term need to be added - from config?	
					MsgManager.msgAreaShow(me.getLoginFailedMsgSpan() + ' ' + me.ERR_MSG_blackListing, 'ERROR');
					if (returnFunc) returnFunc(false);
				}
				else {
					SessionManager.checkPasswordOffline_IDB(userName, password, function (isPass) {
						if (isPass) {
							SessionManager.getLoginRespData_IDB(userName, password, function (loginResp) {
								if (SessionManager.checkLoginOfflineData(loginResp)) {
									// load to session
									SessionManager.loadSessionData_nConfigJson(userName, password, loginResp);

									// TEST, DEBUG - TO BE REMOVED AFTERWARDS
									GAnalytics.setEvent('LoginOffline', GAnalytics.PAGE_LOGIN, 'login Offline Try', 1);


									AppInfoManager.loadData_AfterLogin(userName, password, function () {
										if (returnFunc) returnFunc(true, loginResp);
									});
								}
								else {
									if (returnFunc) returnFunc(false);
								}
							});
						}
						else {
							// MISSING TRANSLATION
							MsgManager.msgAreaShow(me.getLoginFailedMsgSpan() + ' > invalid pin', 'ERROR');
							if (returnFunc) returnFunc(false);
						}
					});
				}
			}
			else {
				// MISSING TRANSLATION
				MsgManager.msgAreaShow('No Offline UserData Available', 'ERROR');
				if (returnFunc) returnFunc(false);
			}
		});
	};

	// ----------------------------

	me.checkLoginData_wthErrMsg = function (success, userName, password, loginData, callBack) {
		// var resultSuccess = false;
		try {
			if (success) {
				if (!loginData) {
					MsgManager.msgAreaShow('ERROR - login success, but loginData Empty!', 'ERROR');
					callBack(false);
				}
				else if (!loginData.orgUnitData) {
					MsgManager.msgAreaShow('ERROR - login success, but loginData orgUnitData Empty!', 'ERROR');
					callBack(false);
				}
				else if (!loginData.dcdConfig) {
					MsgManager.msgAreaShow('ERROR - login success, but dcdConfig Empty!', 'ERROR');
					callBack(false);
				}
				else if (!loginData.dcdConfig.sourceType) {
					// CASE: Warning Case: login was success, but dcdConfig were not retrieved:
					//		- Due to error or noNewVersion, etc case..  - Use offline country config (dcdConfig) instead.

					// Get from offline and set it as 'loginData.dcdConfig'.  What if this is 1st time?  Then, we need to fail it!!
					SessionManager.getLoginRespData_IDB(userName, password, function (loginResp) {
						if (!loginResp) // offline/previous login data not available - 1st time login, but server response not have dcdConfig
						{
							MsgManager.msgAreaShow('ERROR - login success, but country config not retrieved, and offline replacement also not available!', 'ERROR');
							callBack(false);
						}
						else {
							// NOTE: 'dcdConfig' with error is {}, thus, above does not actually catch this.
							//		However, we will replace/use offline dcdConfig (if available) after this method instead.
							loginData.dcdConfig = loginResp.dcdConfig;
							callBack(true);
						}
					});
				}
				else {
					callBack(true);  // resultSuccess = true;
				}
			}
			else {
				var errDetail = '';

				// NEW: Save 'blackListing' case to localStorage offline user data..  CREATE CLASS?  OTHER THAN appInfo?
				if (loginData && loginData.blackListing) {
					AppInfoLSManager.setBlackListed(true);
					errDetail = me.ERR_MSG_blackListing;
				}
				else if (loginData && loginData.returnCode === 502) errDetail = ' - Server not available';

				// MISSING TRANSLATION
				MsgManager.msgAreaShow(me.getLoginFailedMsgSpan() + ' ' + errDetail, 'ERROR');
				callBack(false);
			}
		}
		catch (errMsg) {
			MsgManager.msgAreaShow('ERROR during login data check: ' + errMsg, 'ERROR');
			callBack(false);
		}
	};


	// 'ouAttrVals' set by this method is used by country config evaluation
	me.setModifiedOUAttrList = function (loginData) {
		try {
			var ouAttrVals = {};

			if (loginData.orgUnitData.orgUnit && loginData.orgUnitData.orgUnit.attributeValuesJson) {
				var attrJson = loginData.orgUnitData.orgUnit.attributeValuesJson;

				Object.keys(attrJson).forEach(key => {
					ouAttrVals[key] = attrJson[key].value;
				});
			}

			loginData.orgUnitData.ouAttrVals = ouAttrVals;
		}
		catch (errMsg) {
			console.log('ERROR in login.setModifiedOUAttrList, errMsg: ' + errMsg);
		}
	};


	// ----------------------------------------------

	// Only online version - download and set to localStorage or IndexedDB
	me.retrieveStatisticPage = function (execFunc) {
		var statJson = ConfigManager.getStatisticJson();

		if (statJson.fileName) {
			// per apiPath (vs per fileName)
			var apiPath = ConfigManager.getStatisticApiPath();   // TODO: backend need to be modified...  need to pass 'retrievedDateTime'

			WsCallManager.requestGetDws(apiPath, {}, undefined, function (success, returnJson) {

				if (success && returnJson && returnJson.response) {
					execFunc(statJson.fileName, returnJson.response);
				}
			});
		}
	};

	me.saveStatisticPage = function (fileName, dataStr) {
		// Either store it on localHost, IDB
		AppInfoManager.updateStatisticPages(fileName, dataStr);

		// TODO: Need to save the 'retrievedDateTime' of AppInfoLSManager on local storage...

	};

	// ----------------------------------------------

	me.regetDCDconfig = function () {
		var userName = SessionManager.sessionData.login_UserName;
		var userPin = SessionManager.sessionData.login_Password;

		me.processLogin(userName, userPin, location.origin, $(this));
	};

	me.showNewAppAvailable = function (newAppFilesFound) {
		me.loginAppUpdateCheck = true;

		var loginAppUpdateTag = $('#spanLoginAppUpdate');

		if (newAppFilesFound) loginAppUpdateTag.show();
		else loginAppUpdateTag.hide();
	};

	// --------------------------------------

	me.getLoginFailedMsgSpan = function () {
		return '<span term="' + Constants.term_LoginFailMsg + '">Login Failed</span>';
	};

	// --------------------------------------

	me.getInputBtnPairTags = function (formDivStr, pwdInputStr, btnStr, returnFunc) {
		$(formDivStr).each(function (i) {

			var formDivTag = $(this);
			var loginUserPinTag = formDivTag.find(pwdInputStr);
			var loginBtnTag = formDivTag.find(btnStr);

			returnFunc(loginUserPinTag, loginBtnTag);

		});
	};

	me.setUpInputTypeCopy = function (inputTags) {
		inputTags.keyup(function () {  // keydown vs keypress
			// What about copy and paste?
			var changedVal = $(this).val();
			inputTags.val(changedVal);
		});
	};

	// ================================

	me.initialize();
};

Login.contentHtml = `
<div class="wrapper_login">
	<div class="login_header">
		<div class="login_logo__image"></div>
		<div class="login_title" term="login_title">PSI - workforce app</div>
	</div>

	<div class="login_data">
		<div class="login_data__fields">
			<h4 id="loginUserNameH4" style="display:none; text-align: left; margin-left: 10px;"></h4>
			<div id="loginField" class="field" style="background-color: white;">
				<div class="field__label">
					<label term="login_userName">User code</label><span>*</span>
				</div>
				<div class="field__controls">
					<div class="field__left">
						<input class="auto_compl loginUserName" type="text" autocomplete="off" mandatory="true" placeholder="Enter your user code" term="login_enterUserCode" tabindex="1" />
					</div>
					<div class="field__right"></div>
				</div>
			</div>
			<div class="field pin">
				<div class="field__label">
					<label term="login_password">PIN</label><span>*</span>
				</div>
				<div class="field__controls">
					<div class="field__left split_password" style="width: 100%;">
						<div class="loginPinDiv" style="float: left;">
							<input type="password" class="loginUserPin" id="pass" name="pass" data-ng-minlength="4" maxlength="4" autocomplete="new-password" mandatory="true" />
							<input tabindex="2" class="onKeyboardOnOff pin_pw pin1" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
							<input tabindex="3" class="onKeyboardOnOff pin_pw pin2" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
							<input tabindex="4" class="onKeyboardOnOff pin_pw pin3" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
							<input tabindex="5" class="onKeyboardOnOff pin_pw pin4" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
						</div>
						<div class="mouseDown" style="float: left;">
							<button id="loginPinClear" class="cbtn" term="login_passwordClear">clear</button>
						</div>
						<div style="float: left;">
							<img class="pin_pw_loading" src="images/loading_small2.svg" style="display:none; width:30px; height:30px; margin-left:10px; margin-top:10px;" />
						</div>
					</div>
					<div class="field__right"></div>
				</div>
			</div>
		</div>
		<div id="divAppVersion" class="login_data__more" style="text-align: left;">
			<div>
				<label id="spanVersion" style="color: #999999; font-weight: 350;">Version #.#</label>&nbsp;
				<label id="spanVerDate" style="margin-left: 7px; color: #999999; font-weight: 350;">[2020---]</label>
				<span id="spanLoginAppUpdate" term="login_updateApp"
					style="display:none; color: blue; opacity: 0.7; cursor: pointer; font-size: 0.85rem; vertical-align: top;">[UPDATE
					APP]</span>
			</div>
			<div id="loginVersionNote" style="margin-left: 7px; color: #999999;"></div>
		</div>
		<div id="localSiteInfo" style="display: none; color: orange;text-align: left;">
			[Connected To:
			<select id="localStage" style="all: unset; color: #888; border: solid 1px gray; background-color: #eee; padding: 4px;">
				<option value="dev">dev</option>
				<option value="test">test</option>
				<option value="prod">prod</option>
			</select>]
		</div>
	</div>

	<div class="login_buttons login_cta">
		<div class="login_buttons__container">
			<div class="button l-emphasis button-full_width mouseDown" id="advanceOptionLoginBtn">
				<div class="button__container">
					<div class="button-label" term="login_options">Options</div>
				</div>
			</div>
			<div class="button h-emphasis button-full_width loginBtn mouseDown" tabindex="6">
				<div class="button__container ">
					<div class="button-label" term="login_btn_login">Login</div>
				</div>
			</div>
		</div>
	</div>
</div>
`;