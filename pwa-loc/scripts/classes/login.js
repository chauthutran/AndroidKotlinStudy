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
	me.loginSetPinBtnTag;
	me.loginPinConfirmDivTag;
	//me.passRealTag;
	me.loginUserNameTag;
	me.loginFormTag;
	me.btnChangeUserTag;
	me.loginPinClearTag;
	me.splitPasswordTag;
	me.selAuthChoiceTag;
	me.spanAuthPageUseTag;
	me.spanAuthPageUseNoTag;
	
	// ------------

	// Flags
	me.needToSetPin = false;
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

		me.loginSetPinBtnTag = $('.loginSetPinBtn');
		me.loginPinConfirmDivTag = $('.loginPinConfirmDiv');
		me.splitPasswordConfirmTag = $(".pin_confirm");

		me.loginPinConfirmClearTag = $("#loginPinConfirmClear");
		me.showConfirmPasswordBtnTag = $('#showConfirmPwd');
		me.hideConfirmPasswordBtnTag = $('#hideConfirmPwd');
		
		me.loginBtnTag = $('.loginBtn');
		me.loginPinDivTag = $('.loginPinDiv');
		me.loginUserNameTag = $('.loginUserName');
		me.loginFormTag = $('div.login_data');
		me.btnChangeUserTag = $('.btnChangeUser');	

		me.loginPinClearTag = $('#loginPinClear');
		me.showPasswordBtnTag = $('#showPwd');
		me.hidePasswordBtnTag = $('#hidePwd');

		

		me.splitPasswordTag = $('.pin');
		me.selAuthChoiceTag = $( '.selAuthChoice' );
		me.spanAuthPageUseTag = $( '.spanAuthPageUse' );
		me.spanAuthPageUseNoTag = $( '.spanAuthPageUseNo' );

		// ------------------
		me.setEvents_OnInit();
	}

	me.render = function () 
	{
		GAnalytics.setSendPageView('/' + GAnalytics.PAGE_LOGIN);
		GAnalytics.setEvent('LoginOpen', GAnalytics.PAGE_LOGIN, 'login displayed', 1);

		// In test version with special url param, do not hide login buttons
		me.testVersion_LoginBtn_NotHide('test', 'Y');

		me.appVersionInfoDisplay();

		me.openForm();  // with reset Val

		// Translate the page..
		TranslationManager.translatePage();

		//me.appVersionCheck();
		//MsgManager.msgAreaShowOpt( 'Testing Notification Msg', { cssClasses: 'notifCBlue', hideTimeMs: 900000, styleArr: [ { name: 'background-color', value: '#50A3C6' } ] } );
	};

	// =============================================

	me.setEvents_OnInit = function () {
		// Tab & Anchor UI related click events
		FormUtil.setUpTabAnchorUI(me.loginFormDivTag);

		me.setLoginEvents();
		//me.setAdvOptBtnClick();
		me.setAuthChoiceChange();

		me.setUpInteractionDetect();

		// Move as function
		me.spanAuthPageUseTag.off('click').click(() => 
		{
			var reply = confirm('This will clear existing user data before switching to [Authentication Selection Mode].  Do you want to continue?');

			if (reply === true) 
			{
				DataManager2.deleteAllStorageData(function () 
				{
					PersisDataLSManager.setAuthPageUse( 'Y' );
					AppUtil.appReloadWtMsg("Reloading Page.  AuthPageUse Setting Changed..");		
				});
			}
		});

		// Move as function
		me.spanAuthPageUseNoTag.off('click').click(() => 
		{
			DataManager2.deleteAllStorageData(function () 
			{
				PersisDataLSManager.setAuthPageUse( 'N' );
				//KeycloakManager.tokenLogout();
				AppUtil.appReloadWtMsg("Reloading Page.  AuthPageUse Setting Changed..");			
			});
		});

	}

	// =============================================
	// === EVENT HANDLER METHODS ===================

	me.setAuthChoiceChange = function() {
		me.selAuthChoiceTag.off('change').change(() => 
		{
			var authChoice = me.selAuthChoiceTag.val();
			
			if ( authChoice )
			{
				KeycloakLSManager.setAuthChoice( authChoice );

				// show the openLoginForm..
				$( '.divAuthForm' ).hide();
				me.openLoginForm();	

        		// NOTE: CHANGED BY TRAN..
				if ( authChoice === 'kc_swz_psi' || authChoice === 'kc_swz_psi_dev' ) {
					KeycloakManager.setUpkeycloakPart();
				} 
				else if ( authChoice === 'dhis2' )
				{
					// The Keycloak would have been already cleared at this point..
				}
			}
		});
	};

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


	me.getPinVal = function( divTag )
	{
		var pin1Val = Util.trim(divTag.find('.pin1').val());
		var pin2Val = Util.trim(divTag.find('.pin2').val());
		var pin3Val = Util.trim(divTag.find('.pin3').val());
		var pin4Val = Util.trim(divTag.find('.pin4').val());
		

		if (pin1Val && pin2Val && pin3Val && pin4Val) {
			return pin1Val + pin2Val + pin3Val + pin4Val;
		}

		return "";
	}

	me.setLoginEvents = function () {
		// Save userName that user has entered - to restore when App refreshed by appUpdate
		me.loginUserNameTag.keyup(function () {
			me.current_userName = me.loginUserNameTag.val();
		});

		me.splitPasswordTag.find('.pin1').focus(function () {
			SwManager.checkAppUpdate('[AppUpdateCheck] - PassCode Pin 1');
		});


		me.loginSetPinBtnTag.off( 'click' ).click(function () 
		{
			var pin = me.getPinVal( me.splitPasswordTag );
			var pinConfirm = me.getPinVal( me.splitPasswordConfirmTag );

			if( pin == pinConfirm )
			{
				var ok = confirm("Pin confirm checked. Are you sure you want to set this as pin?");
				if( ok ) me.loginBtnTag.click();
				else
				{
					me.loginPinConfirmClearTag.click();
					me.loginPinClearTag.click();
			
					MsgManager.msgAreaShowOpt( 'Pin cancelled.' );
				}
			}
			else
			{
				me.loginPinConfirmClearTag.click();
				me.loginPinClearTag.click();

				MsgManager.msgAreaShow('Pin confirmation is not match. Please enter again.', 'ERROR');
			}
		});

		me.loginBtnTag.off( 'click' ).click(function () 
		{
			$('.pin_pw_loading').hide();

			var loginUserNameVal = me.loginUserNameTag.val();
			var loginUserPinVal = me.getPinVal( me.splitPasswordTag );

			if ( loginUserNameVal == "" || loginUserPinVal == "" ) 
			{
				me.clearResetPasswords(me.loginPinDivTag);
				me.clearResetPasswords(me.loginPinConfirmDivTag);
				MsgManager.msgAreaShow('Please enter username / fill all pin', 'ERROR');
			}
			else 
			{
				if (me.lastPinTrigger) $('.pin_pw_loading').show();

				// NOTE: On login button click, also check app update..
				SwManager.checkAppUpdate('[AppUpdateCheck] - Login Processing', { noMinTimeSkip: true });

				// Main Login Processing
				me.processLogin(loginUserNameVal, loginUserPinVal, location.origin, $(this), function (success) {
					
					me.clearResetPasswords(me.loginPinDivTag);
					me.clearResetPasswords(me.loginPinConfirmDivTag);
					
					if (!success) $('.pin1').focus();

					$('.pin_pw_loading').hide();
				});
			}
		});


		me.btnChangeUserTag.click(function () {
			me.changeUserBtnClick();
		});


		$(".onKeyboardOnOff").focus(function () { // Focus		
			if( !me.needToSetPin )
			{
				me.loginBottomButtonsVisible(false);
			}
		});

		$(".onKeyboardOnOff").blur(function () { // Lost focus
			if( !me.needToSetPin )
			{
				me.loginBottomButtonsVisible(true);
			}
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
			else 
			{
				if (hasVal) //== this.maxLength ) 
				{
					me.lastPinTrigger = false; 
					var confirmCase = me.loginPinConfirmDivTag.is( ':visible' );
					var loginUserNameSet = ( Util.trim( me.loginUserNameTag.val() ).length > 0 );

					if ( tag.hasClass( 'pin4' ) ) 
					{
						// If Confirm Pin case, either move to next row or click login button
						if ( confirmCase )
						{
							if ( tag.hasClass( 'confirmPin' ) )
							{
								if ( loginUserNameSet ) {
									me.lastPinTrigger = true;
									me.loginSetPinBtnTag.click();									
								}
							}
							else 
							{
								// go to next line 1st one..
								me.loginPinConfirmDivTag.find('.pin1').focus();
							}
						}
						else 
						{
							// if userName is already selected /filled
							if ( loginUserNameSet ) {
								me.lastPinTrigger = true;
								me.loginBtnTag.click();
							}
						}
					}
					else 
					{
						var nextTag = $(this).next('.pin_pw');
						if ( nextTag.length > 0 ) nextTag.focus();
					}
				}
			}
		});

		// 
		$(".pin_pw").keydown(function (event) {
			var isDeleteKey = (event.keyCode == FormUtil.keyCode_Delete || event.keyCode == FormUtil.keyCode_Backspace);

			// If there is already a char in the pin, do not add it.
			// However, if that is delete key, allow it.
			if (!isDeleteKey && $(this).val().length >= 1) return false;
		});

		me.loginPinClearTag.off('click').click(function () {
			me.clearResetPasswords(me.loginPinDivTag);
			me.loginPinDivTag.find('.pin1').focus();

			// NOTE: We also need to cancel the current login process..
		});

		
		me.loginPinConfirmClearTag.off('click').click(function () {
			me.clearResetPasswords(me.loginPinConfirmDivTag);
			me.loginPinConfirmDivTag.find('.pin1').focus();
		});


		me.showPasswordBtnTag.off('click').click(function () {
			me.loginPinDivTag.css("-webkit-text-security", "none");
			me.loginPinDivTag.find(".pin_pw").css("-webkit-text-security", "none");
			me.loginPinDivTag.find(".pin_pw").css("font-family", "Rubik");

			me.showPasswordBtnTag.hide();
			me.hidePasswordBtnTag.show();
		});
		me.hidePasswordBtnTag.off('click').click(function () {
			me.loginPinDivTag.css("-webkit-text-security", "disc");
			me.loginPinDivTag.find(".pin_pw").css("-webkit-text-security", "disc");
			me.loginPinDivTag.find(".pin_pw").css("font-family", "text-security-disc");

			me.showPasswordBtnTag.show();
			me.hidePasswordBtnTag.hide();
		});

		
		me.showConfirmPasswordBtnTag.off('click').click(function () {
			me.loginPinConfirmDivTag.find(".pin_pw").css("-webkit-text-security", "none");
			me.loginPinConfirmDivTag.find(".pin_pw").css("font-family", "Rubik");

			me.showConfirmPasswordBtnTag.hide();
			me.hideConfirmPasswordBtnTag.show();
		});
		me.hideConfirmPasswordBtnTag.off('click').click(function () {
			me.loginPinConfirmDivTag.find(".pin_pw").css("-webkit-text-security", "disc");
			me.loginPinConfirmDivTag.find(".pin_pw").css("font-family", "text-security-disc");
			me.showConfirmPasswordBtnTag.show();
			me.hideConfirmPasswordBtnTag.hide();
		});
		
	};

	// User Switch, User Remove / Clear
	me.changeUserBtnClick = function () 
	{
		FormUtil.blockPage(undefined, function (scrimTag) { });

		FormUtil.getScrimTag().off('click');  // Make it not cancelable by clicking on scrim anymore...

		// Populates the center aligned #dialog_confirmation div
		FormUtil.genTagByTemplate(FormUtil.getSheetBottomTag(), Templates.Change_User_Form, function (tag) 
		{
			$('#accept').click(function () 
			{
				DataManager2.deleteAllStorageData(function () 
				{
					if ( KeycloakLSManager.getAuthChoice() ) 
					{
						KeycloakLSManager.removeProperty( KeycloakLSManager.KEY_AUTH_CHOICE );
						KeycloakManager.checkAuthAndLogoutIfAble();
					}
					// NOTE: If keycloak Access case, we will not run below!!!

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
			me.loginBtn_NotHideFlag = ( App.getParamVal_ByName( paramName, { deleteInLS: true } ) === paramVal );
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

	me.appVersionInfoDisplay = function () 
	{
		$('#spanVersion').text(TranslationManager.translateText('Version', 'landingPage_version_label') + ' ' + _ver);
		$('#spanVerDate').text(' [' + _verDate + ']');
		$('#loginVersionNote').append('<label style="font-weight: 350;"> ' + _versionNote + '</label>');

		$('#spanLoginAppUpdate').off('click').click(() => {
			AppUtil.appReloadWtMsg();
		});

		$('.imgAppReload').off('click').click(() => {
			AppUtil.appReloadWtMsg();
		});

		
		if (WsCallManager.isLocalDevCase) {
			var localSiteInfoTag = $('#localSiteInfo');
			localSiteInfoTag.show();

			var localStageTag = $('#localStage');
			localStageTag.val(WsCallManager.stageName);

			localStageTag.off('change').change(() => 
			{
				var stage = localStageTag.val();
				AppInfoLSManager.setLocalStageName(stage);
				WsCallManager.setWsTarget_Stage(stage);
				alert('Changed to [' + stage + ']');
			});
		}

		// KeyCloak setting..
		me.renderKeyCloakDiv();
	};


	me.renderKeyCloakDiv = function( changeFunc ) 
	{
		var divUseTag = $( '#divKeyCloakUse' );
		var divKeyCloakInfoTag = $( '#divKeyCloakInfo' );

		// keycloak setting..
		if ( [ 'dev', 'test' ].indexOf( WsCallManager.stageName ) >= 0 )
		{
			if ( KeycloakManager.isKeyCloakInUse() )
			{
				// In keycloak use case, display the keyCloak related parts..
				divUseTag.show();
				divKeyCloakInfoTag.show();
				// Login.loginInputDisable( true ); // enable it when authenticated..
	
				$( '#btnKeyCloakRun' ).off( 'click' ).click( () => { 
					KeycloakManager.setUpkeycloakPart(); 
				});
			}
			else
			{
				// If emtpy case, show the 'k' button..
				if ( !AppInfoLSManager.getUserName() ) {
					//$( 'img.imgKeyCloakUse' ).off( 'click' ).click( () => { 
					//	AppUtil.appReloadWtMsg();	
					//});
				}
				else $( 'img.imgKeyCloakUse' ).hide();
			}
		}
	};

	// -----------------------------------

	me.openForm = function () 
	{
		// Reset various login related flags - the 1st touch/focus flag..
		me.loginPage1stTouchFlag = false;
		me.loginAppUpdateCheck = false;

		SessionManager.cwsRenderObj.hidePageDiv();
		Menu.setInitialLogInMenu();
		me.loginFormDivTag.show();
		$( '.divAuthForm' ).hide();
		$( '.divLoginForm' ).hide();
		$( '.login_buttons' ).hide();
		if ( [ 'dev', 'test' ].indexOf( WsCallManager.stageName ) >= 0 ) me.spanAuthPageUseTag.show(); // For now, limit to dev/test


		// Check the 'Auth Page' Use and open form -> in AuthForm or in LoginForm
		if ( me.isAuthPageUse() )
		{
			me.spanAuthPageUseTag.hide();
			
			var authChoice = KeycloakLSManager.getAuthChoice();

			if ( authChoice ) me.openLoginForm();
			else me.openAuthForm();	
		}
		else me.openLoginForm();
	};

	me.isAuthPageUse = function() { return ( PersisDataLSManager.getAuthPageUse() === 'Y' ) ? true: false; };
	me.openAuthForm = function() {  $( '.divAuthForm' ).show();  };

	me.openLoginForm = function() 
	{
		$( '.divLoginForm' ).show();
		$( '.login_buttons' ).show();
		me.loginBtnTag.show();
		me.loginSetPinBtnTag.hide();
		me.loginPinConfirmDivTag.hide();
		me.needToSetPin = false;


		// loginUserName Related 
		var loginUserName = me.loginUserNameTag.val();
		if ( !loginUserName ) me.loginUserNameTag.focus();


		// Auth choice display
		if ( me.isAuthPageUse() )
		{
			var authChoiceName = '';
			var authChoice = KeycloakLSManager.getAuthChoice();
			if ( authChoice ) authChoiceName = me.selAuthChoiceTag.find( 'option[value="' + authChoice + '"]').text();			

			$( '.divLoginWith' ).show();
			$( '.divLoginWith_choice' ).text( authChoiceName );
		}
		else $( '.divLoginWith' ).hide();


		// For 'KeyCloack' case, If user data does not exist, set the form for entry.. with pin & confirm
		// Should be Moved to 'KeyCloakManager'?  As a single method?
		if ( KeycloakManager.isKeyCloakInUse() ) 
		{
			SessionManager.checkOfflineDataExists( loginUserName, function (dataExists) 
			{
				if ( !dataExists )
				{
					me.needToSetPin = true;
					me.loginBtnTag.hide();
					me.loginSetPinBtnTag.show();
					me.loginPinConfirmDivTag.show();
				}
			});
		}


		// Reset vals and set focus
		me.clearResetPasswords(me.loginPinDivTag);
		me.clearResetPasswords(me.loginPinConfirmDivTag);

		me.loginBottomButtonsVisible(true);
	};


	me.closeForm = function () 
	{
		var loginUserNameH4Tag = $('#loginUserNameH4');

		// Div (Input) part of Login UserName
		$('#loginField').hide();


		me.loginFormDivTag.hide();

		// input parts..  Below will be hidden, though...
		//$( 'input.loginUserName' ).val( lastSession.user );	
		$('input.loginUserName').attr('readonly', true);

		// Display login name as Big text part - if we already have user..
		loginUserNameH4Tag.text(me.loginUserNameTag.val()).show();

		FormUtil.hideProgressBar();
	};


	me.clearResetPasswords = function (divTag) {
		// If last pin cause error, move the focus to 1st one.
		// if ( me.lastPinTrigger ) $( '.pin1' ).focus();

		me.lastPinTrigger = false;
		divTag.find('.pin_pw').val('');
		divTag.find('.pin_pw_loading').hide();
	};

	// ------------------------------------------

	me.appVersionCheck = function()
	{
		try
		{
			if ( ConnManagerNew.isAppMode_Online() && navigator.onLine && _ver )
			{
				var requestUrl;
				var options = {};
	
				options.isLocal = WsCallManager.checkLocalDevCase(window.location.origin);
				options.appName = WsCallManager.getAppName();
		
				requestUrl = (options.isLocal) ? 'http://localhost:8383/wfaAppVer' : WsCallManager.composeDwsWsFullUrl('/TTS.wfaAppVer');
				requestUrl = WsCallManager.localhostProxyCaseHandle( requestUrl ); // Add Cors sending IF LOCAL
		
				var optionsStr = JSON.stringify( options );
		
				$.ajax({
					url: requestUrl + '?optionsStr=' + encodeURIComponent( optionsStr ),
					type: "GET",
					dataType: "json",
					success: function (response) 
					{
						if ( response && response.version )
						{
							// Check against current version - index.html '_ver' // var _ver = '1.3.11.56';
							// 'response.version' - by reading manifest file.						
							console.log( 'Login.appVersionCheck _ver: ' + _ver + ', response.ver: ' + response.version );
	
							if ( response.version > _ver )
							{
								// Display the sepcial tag (*) with 'title' = new version, 1.3.11.56, available.
								var spenNewVersionTag = $( '.spanNewVersion_notification' ).show();
								spenNewVersionTag.attr( 'title', 'New version, ' + response.version + ', available' );
							}
						}
					},
					error: function ( errMsg ) {
						// console.log( 'ERROR in Login.appVersionCheck, ' + errMsg );
						console.log( '-- appVersionCheck not available --' );
					}
				});
		
			}
		}
		catch( errMsg )
		{
			console.log( 'Failed in Login.appVersionCheck, ' + errMsg );
		}
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
		if ( !ConnManagerNew.REPLICA_Available || ConnManagerNew.isAppMode_Offline() ) 
		{
			me.loginOffline(userName, password, function (isSuccess, offlineUserData) 
			{
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
		else 
		{
			if ( !navigator.onLine ) // Stable Online still, but currently connection lost case - not stable
			{
				MsgManager.msgAreaShowErrOpt( '<span term="login_msg_connectionTempOff">Network connection temporarily off detected.  Please Try again after a couple seconds.</span>', { closeNextMarked: true } );
				if (callAfterDone) callAfterDone( false );
			}
			else
			{
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
		}
	};


	me.loginSuccessProcess = function (userName, password, loginData, runAfterFunc) 
	{
		AppInfoLSManager.setUserName(userName);
		SessionManager.setLoginStatus(true);
		BahmniService.syncDataProcessing = false;	
		
		// gAnalytics Event
		GAnalytics.setEvent("Login Process", "Login Button Clicked", "Successful", 1);

		// Matomo Submit - Check current network status rather than stable one - ConnManagerNew.isAppMode_Online
		if ( navigator.onLine ) MatomoHelper.processQueueList( 'From Login.loginSuccessProcess' );

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

	me.loginOnline = function (userName, password, loadingTag, returnFunc) 
	{
		if ( !returnFunc ) returnFunc = function() { };

		me.checkKeyCloakPinValid_Online( userName, password, (isPass, msg, caseStr ) => 
		{
			if ( !isPass )
			{
				MsgManager.msgAreaShow( msg, 'ERROR');
				returnFunc( false );
			}
			else
			{
				WsCallManager.submitLogin(userName, password, loadingTag, function (success, loginData) 
				{
					// Below method also handles 'configNoNewVersion' case - getting offline dcdConfig and use it.
					me.checkLoginData_wthErrMsg(success, userName, password, loginData, function (resultSuccess) 
					{
						if (resultSuccess) {
		
							// Set values to 'AppInfoLSManager' - after online login success
							AppInfoLSManager.setLastOnlineLoginDt((new Date()).toISOString());
							if ( loginData.fhirPractitioner ) AppInfoLSManager.setFhirPractitionerId( loginData.fhirPractitioner.id );		
		
							// Save 'loginData' in indexedDB for offline usage and load to session.
							me.setModifiedOUAttrList(loginData); // 'ouAttrVals' set by this method is used by country config evaluation
							SessionManager.setLoginRespData_IDB(userName, password, loginData);
							// IMPORTANT PART - Load loginData in session, use 'dcdConfig' to load ConfigManager data.
							var configJson = SessionManager.loadSessionData_nConfigJson(userName, password, loginData); // InfoDataManager.sessionDataLoad is also called here.
		
							me.setConfigAfterLogin(configJson, resultSuccess, loginData, returnFunc);
						}
						else returnFunc(resultSuccess, loginData);
					});
				});
			}
		});
	};

	me.setConfigAfterLogin = function(configJson, resultSuccess, loginData, returnFunc)
	{
		// Save values in 'AppInfoLS' after online login
		AppInfoLSManager.saveConfigSourceType(configJson.sourceType);  // For Availability Check Usage, store 'sourceType'
		AppInfoLSManager.setConfigVersioningEnable(ConfigManager.getSettings().configVersioningEnable); // Used on login request
		AppInfoLSManager.setLoginPrevData( { 
			retrievedDateTime: configJson.retrievedDateTime,
			settings: {
				login_GetOuChildren: configJson.settings.login_GetOuChildren,
				login_GetOuTagOrgUnits: configJson.settings.login_GetOuTagOrgUnits,
				login_GetVMMC_OugId: configJson.settings.login_GetVMMC_OugId	
			},
			sourceType: configJson.sourceType
		} );


		// Check the translation - if there is any new updated translations.  If so, retrieve & save & use it.
		TranslationManager.loadLangTerms_NSetUpData( true );
		
		// Online Login statistic download
		me.retrieveStatisticPage((fileName, statPageData) => { me.saveStatisticPage(fileName, statPageData); });

		// AppInfo IndexDB one..  Populate AppInfo data - which is (Not localStorage) IndexDB saved appInfo
		AppInfoManager.loadData_AfterLogin( () => returnFunc(resultSuccess, loginData) );
	}

	me.loginOffline = function (userName, password, returnFunc) 
	{
		if ( !returnFunc ) returnFunc = function() { };

		// On Offline Login case, check if the password(PIN) can decript the storage in IDB properly
		me.checkUserName_Pin_ByStorage(userName, password, ( bPassed, caseStr, errMsg ) =>
		{
			if ( bPassed )
			{
				SessionManager.getLoginRespData_IDB(userName, password, (loginResp) =>
				{
					if (SessionManager.checkLoginOfflineData(loginResp)) 
					{
						// load to session
						SessionManager.loadSessionData_nConfigJson(userName, password, loginResp);
						GAnalytics.setEvent('LoginOffline', GAnalytics.PAGE_LOGIN, 'login Offline Try', 1);

						AppInfoManager.loadData_AfterLogin( () => returnFunc(true, loginResp) );
					}
					else returnFunc(false);
				});
			}
			else
			{
				MsgManager.msgAreaShow( errMsg, 'ERROR');
				returnFunc(false);
			}
		});
	};

	// ---------------------------------------
	// --- Login Online/Offline Related
	
	// New 
	me.checkKeyCloakPinValid_Online = function(userName, password, returnFunc)
	{
		if ( !KeycloakManager.isKeyCloakInUse() ) returnFunc( true, 'Not keycloak case' );  // Proceed with OnLing Login
		else
		{
			// NEW KeyCloak Case:
			//		- If KeyCloak case, On Online Login, check the password if data exists..
			me.checkUserName_Pin_ByStorage(userName, password, ( bPassed, caseStr, errMsg ) =>
			{
				if ( bPassed ) returnFunc( true, 'password valid' ); 
				else
				{
					if ( caseStr === 'NoPrevData' ) returnFunc( true, '1st login case' );
					else returnFunc( false, errMsg, caseStr );	
				}
			});
		}
	};

	// NEW
	me.checkUserName_Pin_ByStorage = function (userName, password, returnFunc) 
	{		
		SessionManager.checkOfflineDataExists(userName, function (dataExists) 
		{
			if (!dataExists) returnFunc( false, 'NoPrevData', 'No Offline UserData Available' );
			else
			{
				if (AppInfoLSManager.getBlackListed()) returnFunc( false, 'BlackListed', me.getLoginFailedMsgSpan() + ' ' + me.ERR_MSG_blackListing );
				else 
				{
					SessionManager.checkPasswordOffline_IDB(userName, password, function (isPass) 
					{
						if ( !isPass ) returnFunc( false, 'PinInvalid', me.getLoginFailedMsgSpan() + ' > invalid pin' );
						else returnFunc( true, 'PinValid' );
					});
				}
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


Login.loginInputDisable = function( disable )
{
	var divSplitPassword = $( 'div.split_password *' );
	var inputUserNameTag = $( 'input.loginUserName' );

	if ( disable ) {
		divSplitPassword.prop( 'disabled', true ).css( 'background-color', '#eee' );
		inputUserNameTag.prop( 'disabled', true ).css( 'background-color', '#eee' );
	}
	else {
		divSplitPassword.prop( 'disabled', false ).css( 'background-color', '' );
		inputUserNameTag.prop( 'disabled', false ).css( 'background-color', '' );
	}
};

Login.contentHtml = `
<div class="wrapper_login">
	<div class="login_header">
		<div class="login_logo__image"></div>
		<div class="login_title" term="login_title">PSI - workforce app</div>
	</div>

	<div class="login_data divLoginForm" style="display:none;">
		<div class="login_data__fields">

			<div class="divLoginWith" style="display: none; text-align: left; padding: 8px; margin-bottom: -17px; margin-top: 10px;">
				<span class="divLoginWith_lbl" style="font-size: 0.90rem; color: #777;">Log in with: </span>
				<span class="divLoginWith_choice" style="font-size: 0.95rem; color: #333; margin-left: 4px;">Classic WFA auth (legacy)</span>
			</div>

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
			
			<!-- PIN -->
			<div class="field pin">
				<div class="field__label">
					<label term="login_password">PIN</label><span>*</span>
				</div>
				<div class="field__controls">
					<div class="field__left split_password pin" style="width: 100%;">
						<div class="loginPinDiv" style="float: left;">
							<input type="password" class="loginUserPin" name="pass" data-ng-minlength="4" maxlength="4" autocomplete="new-password" mandatory="true" />
							<input tabindex="2" class="onKeyboardOnOff pin_pw pin1" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
							<input tabindex="3" class="onKeyboardOnOff pin_pw pin2" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
							<input tabindex="4" class="onKeyboardOnOff pin_pw pin3" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
							<input tabindex="5" class="onKeyboardOnOff pin_pw pin4" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
						</div>
						<div style="float: left;">
							<img id="loginPinClear" src="images/clear.png" style="cursor:pointer; width: 25px;height: 25px;" />
							<img id="hidePwd" src="images/pwd_hide.png" style="display:none; cursor:pointer; width: 25px;height: 25px;" />
							<img id="showPwd" src="images/pwd_visible.png" style="cursor:pointer;width: 25px;height: 25px;"/>
						</div>
						<div style="float: left;">
							<img class="pin_pw_loading" src="images/loading_small2.svg" style="display:none; width:30px; height:30px; margin-left:10px; margin-top:10px;" />
						</div>
					</div>
					<div class="field__right"></div>
				</div>
			</div>


			<!-- CONFIM PIN -->
			<div class="field pin loginPinConfirmDiv" style="display: none; margin-top: -7px;">
				<div class="field__label">
					<label term="login_password_confirm">PIN CONFIRM</label><span>*</span>
				</div>
				<div class="field__controls">
					<div class="field__left split_password pin_confirm" style="width: 100%;">
						<div class="loginPinConfirmFields" style="float: left;">
							<input type="password" class="loginUserPin" name="pass" data-ng-minlength="4" maxlength="4" autocomplete="new-password" mandatory="true" />
							<input tabindex="2" class="onKeyboardOnOff confirmPin pin_pw pin1" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
							<input tabindex="3" class="onKeyboardOnOff confirmPin pin_pw pin2" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
							<input tabindex="4" class="onKeyboardOnOff confirmPin pin_pw pin3" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
							<input tabindex="5" class="onKeyboardOnOff confirmPin pin_pw pin4" type="number" maxlength="1" autocomplete="new-password" pattern="[0-9]*" inputmode="numeric" />
						</div>
						<div style="float: left;">
							<img id="loginPinConfirmClear" src="images/clear.png" style="cursor:pointer; width: 25px;height: 25px;" />
							<img id="hideConfirmPwd" src="images/pwd_hide.png" style="display:none; cursor:pointer; width: 25px;height: 25px;" />
							<img id="showConfirmPwd" src="images/pwd_visible.png" style="cursor:pointer;width: 25px;height: 25px;"/>
						</div>
					</div>
					<div class="field__right"></div>
				</div>
			</div>

		</div>

		<div class="login_buttons login_cta" style="display:none;">
			<div class="login_buttons__container">
				<div class="button l-emphasis button-full_width btnChangeUser mouseDown" style="border: solid 1px #ccc; background-color: white; border-radius: 20px;">
					<div class="button__container">
						<div class="button-label" term="login_changeUserAdv" style="color: #999;">Forget User</div>
					</div>
				</div>

				<div class="button h-emphasis button-full_width loginBtn mouseDown" tabindex="6" style="border-radius: 20px; background-color: #F06D24;;">
					<div class="button__container ">
						<div class="button-label" term="login_btn_login">Log in</div>
					</div>
				</div>

				<div class="button h-emphasis button-full_width loginSetPinBtn mouseDown" tabindex="7" style="display: none; border-radius: 20px; background-color: #F06D24;">
					<div class="button__container ">
						<div class="button-label" term="login_btn_setPin">Set PIN & Login</div>
					</div>
				</div>

				<div id="keycloakMsg" style="font-style: italic; color: #f50b0b;"></div>

			</div>
		</div>
				
	</div>

	<div class="divAuthForm" style="display:none; text-align: center; ">
		<div term="authForm_welcome" style="font-size: x-large; margin-bottom: 10px;">Welcome</div>
		<div term="authForm_loginChoice" style="margin-bottom: 10px; color: #777;">How do you want to log in?</div>
		<div>
			<select class="selAuthChoice" style="color: #555; border: solid 1px gray; padding: 5px; width: fit-content; background-color: powderblue;">
				<option value="">SELECT ONE</option>
				<option value="dhis2">Classic WFA auth (legacy)</option>
				<option value="kc_swz_psi_dev">Eswatini - PSI (DEV)</option>
				<option value="kc_swz_psi">Eswatini - PSI</option>
				<option value="kc_sw_moh">Eswatini - MoH</option>
				<option value="kc_ke_moh">Kenya - MoH</option>
			</select>
		</div>
		<div style="margin-top: 10px; ">
			<span class="spanAuthPageUseNo" title="Disable AuthPageUse" style="color: #AAA; font-weight: bold; opacity: 0.7; cursor: pointer; font-size: 0.85rem; vertical-align: top; margin-left: 3px;">[AuthPage Disable]</span>
		</div>

	</div>
	
	<div class="loginPage_bottomDiv">
		<div id="divAppVersion" class="login_data__more" style="float: left; margin-left: 4px;">
			<div>
				<label id="spanVersion" style=" font-weight: 350;">Version #.#</label>
				<label id="spanVerDate" style="margin-left: 7px; font-weight: 350;">[2020---]</label>
				<span class="spanNewVersion_notification" style="color:red; margin: 0px -4px 0px 1px; display: none;" title="New version available">*</span>
				<img class="imgAppReload mouseDown" title="App reload" src="images/sync-n.svg" style="cursor: pointer; width: 20px; vertical-align: top; margin-bottom: -4px; margin-top: -3px;">
				<img class="imgKeyCloakUse mouseDown" title="KeyCloak Use" src="images/key.svg" style="display:none; width: 16px; cursor: pointer; vertical-align: top; margin-bottom: -4px; opacity: 0.4; background-color: red;">
				<span id="spanLoginAppUpdate" term="login_updateApp"
					style="display:none; color: blue; opacity: 0.7; cursor: pointer; font-size: 0.85rem; vertical-align: top; margin: 0px 2px;">[UPDATE
					APP]</span>				
				<span class="spanAuthPageUse" title="AuthPageUse" style="display: none; opacity: 0.7; cursor: pointer; font-size: 0.80rem; vertical-align: top; ">[A]</span>
			</div>
			<div id="loginVersionNote" style="margin-left: 7px;"></div>
		</div>
		<div style="float: right; margin-right: 10px;">
			<div id="localSiteInfo" style="display: none; color: orange;">			
				[Connected To:
				<select id="localStage" style="all: unset; color: #888; border: solid 1px gray; background-color: #eee; padding: 2px;">
					<option value="dev">dev</option>
					<option value="test">test</option>
					<option value="prod">prod</option>
				</select>]
			</div>
			<div id="divKeyCloakUse" style="display: none; text-align: left;">
				<div id="divKeyCloakInfo" style="display:none;">
					Keycloak: <button id="btnKeyCloakLogOut" style="font-size: 10px;">AuthOut</button>
					<span id="divTokenInfo" style="font-size: 12px; display: none;"></span>
				</div>
			</div>

		</div>
	</div>

	<dialog id="keycloackConfirmDialog">
		<div class="dialog__title"><label class="title">Keycloak Warning</label></div>
			<div class="dialog__text">
				<div id="keyclockMsg"></div>
			</div>
			<div class="dialog__action">
				<div id="okBtn" class="button-text primary">
					<div class="button__container">
						<div class="button-label">Ok</div>
					</div>
				</div>
			</div>
		</div>
	</div>
  </dialog>

	// <div id="keycloackConfirmDialog" title="Keycloak Confirm">
	// 	<p>
	// 		<span class="ui-icon ui-icon-circle-check" style="float:left; margin:0 7px 50px 0;"></span>
	// 		<span id="keyclockConfirmMsg"></span>
	// 	</p>
	// </div>

</div>
`;