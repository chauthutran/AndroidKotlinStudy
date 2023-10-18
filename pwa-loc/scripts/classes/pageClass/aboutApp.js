// -------------------------------------------
// -- BlockMsg Class/Methods
function aboutApp(cwsRender) {
	var me = this;

	me.cwsRenderObj = cwsRender;

	me.aboutFormDivTag = $('#aboutFormDiv');

	// ----- Tags -----------
	me.aboutInfo_langSelectTag;
	me.aboutInfo_ThemeSelectTag;
	me.aboutInfo_NetworkSync;

	// === TEMPLATE METHODS ========================

	me.initialize = function () {

		// Set HTML & values related
		me.aboutFormDivTag.append(aboutApp.contentHtml);

		me.aboutInfo_langSelectTag = $('div.aboutInfo_langSelect');
		me.aboutInfo_ThemeSelectTag = $('div.aboutInfo_ThemeSelect');
		me.aboutInfo_NetworkSync = $('div.aboutInfo_networkSync');


		me.setEvents_OnInit();
	};

	// ------------------

	me.render = function () {
		me.populateAboutPageData();

		TranslationManager.translatePage();

		me.showAboutPage();
	};

	// ------------------

	me.setEvents_OnInit = function () {
		// --------------
		// BUTTON CLICKS

		me.aboutFormDivTag.find('img.btnBack').click(() => {
			if ($('img.rotateImg').length) {
				$('img.rotateImg').click();
			}
			else {
				me.hideAboutPage();
			}
		});

		me.evalHideSections = function (excludeID) {
			$('li.aboutGroupDiv').each(function (i, obj) {

				if ($(obj).attr('id') != excludeID && !$(obj).hasClass('byPassAboutMore')) {
					if ($(obj).is(':visible')) $(obj).hide();
					else $(obj).show();
				}

			});
		}
	};

	// ------------------

	me.showAboutPage = function () {
		if ($('#loginFormDiv').is(":visible")) {
			$('#loginFormDiv').hide();
		}

		me.renderNonEssentialFields(SessionManager.getLoginStatus());

		me.aboutFormDivTag.show();
	};

	me.hideAboutPage = function () {
		//me.aboutFormDivTag.fadeOut( 500 );
		me.aboutFormDivTag.hide();
	};


	me.renderNonEssentialFields = function (userLoggedIn) {
		if (!$('.aboutInfo_networkMode').attr('unselectable')) {
			$('.aboutInfo_networkMode').attr('unselectable', 'on');
			$('.aboutInfo_networkMode').css('user-select', 'none');
			$('.aboutInfo_networkMode').on('selectstart', false);
		}
	};

	me.populateAboutPageData = function () {
		// Dcd Config related data set

		// Populate data
		$('.aboutInfo_AppVersion').html( $('#spanVersion').html() + ' / ' + ConfigManager.getConfigInfo() );

		$('.aboutInfo_networkMode').html('<div>' + ConnManagerNew.statusInfo.appMode + '</div>');

		me.display_autoLogout( $('.aboutInfo_autoLogout') );

		if ( KeycloakManager.isKeyCloakInUse() && KeycloakLSManager.getAuthChoice() )
		{
			$( 'div.divAboutKeyCloak' ).show();
			me.setIntervalData_keycloak( $('.aboutInfo_keyCloak') );
		}
		else $( 'div.divAboutKeyCloak' ).hide();


		GeoLocUtil.showInAboutPage( $('.aboutInfo_geoLoc') ); // $('.aboutInfo_geoLoc').html

		if ( !GeoLocUtil.geoLocCoordStr ) GeoLocUtil.refreshGeoLocation( function() {}, true );

		me.displayDeviceInfo($('.aboutInfo_info'));
	};

	// ---------------------------------------------------

	me.display_autoLogout = function( autoLogoutTag )
	{
		clearInterval( aboutApp.intervalID_autoLogout );

		// Call once 1st..
		autoLogoutTag.html( me.getAutoLogoutStr() );

		aboutApp.intervalID_autoLogout = setInterval( function() 
		{
			if ( autoLogoutTag.is( ":visible" ) ) autoLogoutTag.html( me.getAutoLogoutStr() );
			else clearInterval( aboutApp.intervalID_autoLogout );

		}, 3000 );

	};

	me.getAutoLogoutStr = function()
	{
		var summaryStr = '';

		try
		{
			var logOutDelaySEC = ConfigManager.staticData.logoutDelayMs / 1000;
			var remainSec = 0;

			if ( InputUtil.CurrentTime_inputMonLogoutTimer )
			{
				var passedMs = new Date().getTime() - InputUtil.CurrentTime_inputMonLogoutTimer;
				var passedSec = passedMs / 1000;
				remainSec = logOutDelaySEC - passedSec;
			}

			summaryStr = '' + UtilDate.getTimeStrFormatted( remainSec ) + ' / ' + UtilDate.getTimeStrFormatted( logOutDelaySEC );
		}
		catch( errMsg ) {  console.log( 'ERROR in aboutApp.getAutoLogoutStr, ' + errMsg );  }

		return summaryStr;
	};

	// ------

	me.setIntervalData_keycloak = function( keyCloakInfoTag )
	{
		clearInterval( aboutApp.intervalID_keyCloakInfo );

		// Call once 1st..
		keyCloakInfoTag.html( me.getKeyCloakSummaryStr() );

		aboutApp.intervalID_keyCloakInfo = setInterval( function() 
		{
			if ( keyCloakInfoTag.is( ":visible" ) ) keyCloakInfoTag.html( me.getKeyCloakSummaryStr() );
			else clearInterval( aboutApp.intervalID_keyCloakInfo );

		}, 3000 );
	};

	me.getKeyCloakSummaryStr = function()
	{
		var summaryStr = '';

		try
		{
			var stats = KeycloakManager.getStatusSummary();

			summaryStr = '[Session]: ' + UtilDate.getTimeStrFormatted( stats.remainTimeSEC_RefreshToken ) + ' / ' + UtilDate.getTimeStrFormatted( stats.fullTimeSEC_SessionToken ) + ', '
			+ '[Offline]: ' + UtilDate.getTimeStrFormatted( stats.remainTimeSEC_OfflineAccess ) + ' / ' + UtilDate.getTimeStrFormatted( stats.fullTimeSEC_OfflineAccess ) + ', '
			+ '[Access]: ' + UtilDate.getTimeStrFormatted( stats.fullTimeSEC_AccessToken );
		}
		catch( errMsg ) {  console.log( 'ERROR in aboutApp.getKeyCloakSummaryStr, ' + errMsg );  }

		return summaryStr;
	};

	// -----------------------------------

	me.setLanguageDropdownFromCode = function (languageList, langCode) {
		$.each(languageList, function (i, item) {
			if (item.id == langCode) {
				Util.setSelectDefaultByName(me.aboutInfo_langSelectTag, item.name);
			}
		});
	};

	me.getListNameFromID = function (arrList, idVal) {
		for (i = 0; i < arrList.length; i++) {
			if (arrList[i].id == idVal) {
				return arrList[i].name;
			}
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
	};


	me.displayDeviceInfo = function (aboutInfoTag) {
		aboutInfoTag.html('');
		var info = InfoDataManager.INFO.deviceInfo;

		var infoDivTag1 = `<div class="deviceInfoRow1 about_deviceInfo">Browser: ${Util.getStr(info.browser.name)} ${Util.getStr(info.browser.version).substr(0, 2)} 
            Engine: ${Util.getStr(info.engine.name)} ${Util.getStr(info.engine.version)}
            , OS: ${Util.getStr(info.os.name)} ${Util.getStr(info.os.version)}
            , CPU: ${Util.getStr(info.cpu.architecture)} (CoreCount ${Util.getStr(info.cpu.corCount)}
            , Memory: at least ${Util.getStr(info.memory)} GB [Measurement Max 8]
        </div>`;

		var infoDivTag2 = `<div class="deviceInfoRow2 about_deviceInfo">Device: ${Util.getStr(info.device.type)} ${Util.getStr(info.device.vendor)} ${Util.getStr(info.device.model)}
            , Storage: [Using] ${AppUtil.getDiffSize(info.storage.usage, 1000000, 'MB')} / ${AppUtil.getDiffSize(info.storage.quota, 1000000000, 'GB')} [Browser Usable/DeviceSize]
        </div>`;

		aboutInfoTag.append(infoDivTag1);
		aboutInfoTag.append(infoDivTag2);
	};

	// ------------------------------------

	me.initialize();
};

aboutApp.intervalID_autoLogout;
aboutApp.intervalID_keyCloakInfo;

aboutApp.contentHtml = `
<div class="wapper_card">
	<div class="sheet-title c_900" style="width:100%">
		<img src="images/arrow_back.svg" class="btnAboutBack btnBack mouseDown">
			<span term="menu_about">About</span>
	</div>

	<div class="card" style="padding: 8px; background-color: #FFF; overflow-y: auto !important; height: calc(100vh - 60px); width: calc(100vw - 16px);">
		<div class="subContent" style="margin-bottom: 30px;">
			<div class="principal_section"
				style="height:75px; margin:0; width:100vw; position:relative; background-color:#fff;padding: 8px 0 12px 8px;">
				<div class="principal_section__icon">
					<img src="images/Connect.svg" style="width: inherit;height: inherit;">
				</div>
				<div class="principal_section__title">Workforce App</div>
			</div>
			<div class="field-read_only noMargin">
				<div class="field-read_only__label"><label term="about_applicationVersion">Versions - App / Config</label></div>
				<div class="field-read_only__text aboutInfo_AppVersion">release candidate version number</div>
			</div>
			<div class="field-read_only noMargin">
				<div class="field-read_only__label"><label term="about_networkMode">Network mode</label></div>
				<div class="field-read_only__text aboutInfo_networkMode">Online-are-you-sure</div>
			</div>
			<div class="field-read_only noMargin">
				<div class="field-read_only__label"><label term="about_autoLogout">Auto Logout</label></div>
				<div class="field-read_only__text aboutInfo_autoLogout">13-lucky-number</div>
			</div>
			<div class="field-read_only noMargin divAboutKeyCloak" style="display: none;">
				<div class="field-read_only__label"><label term="about_keyCloak">KeyCloak</label></div>
				<div class="field-read_only__text aboutInfo_keyCloak">13-lucky-number</div>
			</div>
			<div class="field-read_only noMargin">
				<div class="field-read_only__label"><label term="about_geoLoc">GeoLocation</label></div>
				<div class="field-read_only__text aboutInfo_geoLoc about_deviceInfo"></div>
			</div>

			<div class="field-read_only noMargin">
				<div class="field-read_only__label"><label term="about_info">Info</label></div>
				<div class="field-read_only__text aboutInfo_info"></div>
			</div>
		</div>

	</div>

</div>
`;
