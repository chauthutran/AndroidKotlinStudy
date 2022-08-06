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

		me.aboutInfo_langSelectTag = $('#aboutInfo_langSelect');
		me.aboutInfo_ThemeSelectTag = $('#aboutInfo_ThemeSelect');
		me.aboutInfo_NetworkSync = $('#aboutInfo_networkSync');


		me.setEvents_OnInit();
	};

	// ------------------

	me.render = function () {
		me.populateAboutPageData(ConfigManager.getConfigJson());

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
		if (!$('#aboutInfo_networkMode').attr('unselectable')) {
			$('#aboutInfo_networkMode').attr('unselectable', 'on');
			$('#aboutInfo_networkMode').css('user-select', 'none');
			$('#aboutInfo_networkMode').on('selectstart', false);
		}
	};

	me.populateAboutPageData = function (dcdConfig) {
		// Dcd Config related data set
		var dcdConfigVersion = (dcdConfig && dcdConfig.version) ? dcdConfig.version : "";

		// Populate data
		$('#aboutInfo_AppVersion').html($('#spanVersion').html());
		$('#aboutInfo_dcdVersion').html(dcdConfigVersion);
		$('#aboutInfo_networkMode').html('<div>' + ConnManagerNew.statusInfo.appMode + '</div>');

		me.displayDeviceInfo($('#aboutInfo_info'));
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
		var info = InfoDataManager.INFO.deviceInfo;

		var infoDivTag1 = `<div class="deviceInfoRow1">Browser: ${Util.getStr(info.browser.name)} ${Util.getStr(info.browser.version).substr(0, 2)} 
            Engine: ${Util.getStr(info.engine.name)} ${Util.getStr(info.engine.version)}
            , OS: ${Util.getStr(info.os.name)} ${Util.getStr(info.os.version)}
            , CPU: ${Util.getStr(info.cpu.architecture)} (CoreCount ${Util.getStr(info.cpu.corCount)}
            , Memory: at least ${Util.getStr(info.memory)} GB [Measurement Max 8]
        </div>`;

		var infoDivTag2 = `<div class="deviceInfoRow2">Device: ${Util.getStr(info.device.type)} ${Util.getStr(info.device.vendor)} ${Util.getStr(info.device.model)}
            , Storage: [Using] ${AppUtil.getDiffSize(info.storage.usage, 1000000, 'MB')} / ${AppUtil.getDiffSize(info.storage.quota, 1000000000, 'GB')} [Browser Usable/DeviceSize]
        </div>`;

		aboutInfoTag.append(infoDivTag1);
		aboutInfoTag.append(infoDivTag2);
	};

	// ------------------------------------

	me.initialize();
};

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
			<div class="field-read_only">
				<div class="field-read_only__label"><label term="about_applicationVersion">Application version</label></div>
				<div class="field-read_only__text" id="aboutInfo_AppVersion">release candidate version number</div>
			</div>
			<div class="field-read_only">
				<div class="field-read_only__label"><label term="about_configVersion">Config version</label></div>
				<div class="field-read_only__text" id="aboutInfo_dcdVersion">13-lucky-number</div>
			</div>
			<div class="field-read_only">
				<div class="field-read_only__label"><label term="about_networkMode">Network mode</label></div>
				<div class="field-read_only__text" id="aboutInfo_networkMode">Online-are-you-sure</div>
			</div>
			<div class="field-read_only">
				<div class="field-read_only__label"><label term="about_info">Info</label></div>
				<div class="field-read_only__text" id="aboutInfo_info"></div>
			</div>
		</div>

	</div>

</div>
`;
