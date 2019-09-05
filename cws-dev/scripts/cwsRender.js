// -------------------------------------------
// -- CwS Render Class/Methods
function cwsRender()
{
	var me = this;

	// Fixed variables
	me.dsConfigLoc = 'data/dsConfig.json';	// 

	// Tags
	me.renderBlockTag = $( '#renderBlock' );
	me.navDrawerDivTag = $( '#navDrawerDiv' );
	me.menuAppMenuIconTag = $( '#nav-toggle' );

	// This get cloned..  Thus, we should use it as icon class name?
	//me.floatListMenuIconTag =  $( '.floatListMenuIcon' );
	//me.floatListMenuSubIconsTag = $( '.floatListMenuSubIcons' );

	me.loggedInDivTag = $( '#loggedInDiv' );
	me.headerLogoTag = $( '.headerLogo' );
	me.pulsatingProgress = $( '#pulsatingCircle' );

	// global variables
	me.configJson;
	me.areaList = [];
	me.manifest;
	me.favIconsObj;
	me.aboutApp;
	me.settingsApp;
	me.statisticsObj;
	me.registrationObj;
	me.loginObj;
	me.langTermObj;
	//me.enableThemedColorSchemes = false;


	me.storageName_RedeemList = "redeemList";
    me.status_redeem_submit = "submit"; // initialize from dcd@XX ?
	me.status_redeem_queued = "queued"; // initialize from dcd@XX ?
	me.status_redeem_paused = "paused"; // initialize from dcd@XX ?
	me.status_redeem_failed = "failed"; // initialize from dcd@XX ?

	me.storage_offline_ItemNetworkAttemptLimit = 3; //number of times sync-attempt allowed per redeemItem (with failure/error) before blocking new 'sync' attempts
    me.storage_offline_SyncExecutionTimerInterval = 60000; // make 60 seconds?
    me.storage_offline_SyncConditionsTimerInterval = 10000; // make 10 seconds?

	me._globalMsg = "";
	me._globalJsonData = undefined;

	// Create separate class for this?
	me.blocks = {};	// "blockId": blockObj..

	me.activityList = [];	// Move to FormUtil.activityList?

	me._localConfigUse = false;
	//me.syncManager;
 
	me._translateEnable = true;

	me._manageInputSwipe;
	me.autoLogoutDelayMins = 60; //auto logout after X mins (5, 30, 60)
	me.autoLogoutDateTime;

	me.debugMode = false;

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setInitialData();

		me.setEvents_OnInit();

		me.createSubClasses();
	}

	me.render = function()
	{
		if ( me.debugMode ) console.log( 'cwsRender.render()' );

		me.handleLastSession( function() {
			me.showLoginForm();
		});

		me._manageInputSwipe = inputMonitor( me );

		// Translate terms setup
		if ( me._translateEnable ) me.retrieveAndSetUpTranslate();

	}

	
	// ------------------

	me.setInitialData = function()
	{
		me.manifest = FormUtil.getManifest();

		me.updateFromSession();
	}

	me.setEvents_OnInit = function()
	{		
		// Set Body vs Set Header..
		me.setPageHeaderEvents();

		me.setOtherEvents();
	}

	me.createSubClasses = function()
	{
		me.langTermObj = new LangTerm( me );
		me.loginObj = new Login( me );
		me.aboutApp = new aboutApp( me );
		me.settingsApp = new settingsApp( me );
		me.statisticsObj = new statistics( me );
	}

	// =============================================


	// =============================================
	// === EVENT HANDLER METHODS ===================

	me.updateFromSession = function()
	{
		DataManager.getSessionDataValue( 'networkSync', null,  function(data){
			if ( data ) me.storage_offline_SyncExecutionTimerInterval = data;
			// DataManager.saveData(  'networkSync',  data );
		});

	}

	me.setPageHeaderEvents = function()
	{

		me.configureMobileMenuIcon();
		
	}

	me.setOtherEvents = function()
	{

	}

	// -------------------------

	me.setupMenuTagClick = function( menuTag )
	{
		menuTag.click( function() 
		{
			var clicked_areaId = $( this ).attr( 'areaId' );

			me.renderArea( clicked_areaId );
		});
	}

	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.renderArea = function( areaId )
	{
		FormUtil.gAnalyticsEventAction( function( analyticsEvent ) {

			me.hideAreaRelatedParts();

			// added by Greg (2019-02-18) > test track googleAnalytics
			ga('send', { 'hitType': 'event', 'eventCategory': 'menuClick:' + areaId, 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });

			// should close current tag/content?
			if (areaId === 'logOut') me.logOutProcess();
			else if ( areaId === 'statisticsPage') me.statisticsObj.render();
			else if ( areaId === 'settingsPage') me.settingsApp.render();
			else if ( areaId === 'aboutPage') me.aboutApp.render();
			else
			{  
				me.clearMenuClickStyles();
				
				me.areaList = ConfigUtil.getAllAreaList( me.configJson );
				//console.log( me.areaList );
				var selectedArea = Util.getFromList( me.areaList, areaId, "id" );
				//console.log( selectedArea );
				// TODO: ACTIVITY ADDING
				ActivityUtil.addAsActivity( 'area', selectedArea, areaId );

				// if menu is clicked,
				// reload the block refresh?
				if ( selectedArea && selectedArea.startBlockName )
				{
					// added by Greg (2018/12/10)
					if ( !$( 'div.mainDiv' ).is( ":visible" ) )  $( 'div.mainDiv' ).show();

					var startBlockObj = new Block( me, me.configJson.definitionBlocks[ selectedArea.startBlockName ], selectedArea.startBlockName, me.renderBlockTag );
					startBlockObj.render();  // should been done/rendered automatically?

					// Change start area mark based on last user info..
					me.trackUserLocation( selectedArea );				
				}

				me.updateMenuClickStyles( areaId );

			}
		});

	}


	me.renderBlock = function( blockName, options )
	{
		if ( options )
		{
			var blockObj = new Block( me, me.configJson.definitionBlocks[ blockName ], blockName, me.renderBlockTag, undefined, options );
		}
		else
		{
			var blockObj = new Block( me, me.configJson.definitionBlocks[ blockName ], blockName, me.renderBlockTag );
		}

		blockObj.render();			

		return blockObj;
	}

	// --------------------------------------
	// -- START POINT (FROM LOGIN) METHODS
	me.startWithConfigLoad = function( configJson )
	{

		me.configJson = configJson;
		ConfigUtil.setConfigJson( me.configJson );

		//setTimeout( function(){
			me.startBlockExecute( me.configJson );
		//}, 500 )

	}

	me.startBlockExecute = function( configJson )
	{
		me.areaList = ConfigUtil.getAreaListByStatus( ( ConnManager.userNetworkMode ? ConnManager.userNetworkMode_Online : ConnManager.networkSyncConditions() ), configJson );

		if ( me.areaList )
		{

			var finalAreaList = FormUtil.checkLogin() ? Menu.populateStandardMenuList( me.areaList ) : Menu.setInitialLogInMenu( me );

			me.populateMenuList( finalAreaList, function( startMenuTag ){

				if ( startMenuTag && FormUtil.checkLogin() ) startMenuTag.click();

				// initialise favIcons
				me.favIconsObj = new favIcons( me );

			} );

			

		}
	} 

	// Call 'startBlockExecute' again with in memory 'configJson' - Called from 'ConnectionManager'
	me.startBlockExecuteAgain = function()
	{
		DataManager.getUserConfigData( function( userData ){
			me.startBlockExecute( userData.dcdConfig );
		});
	}

	// ----------------------------------

	
	me.configureMobileMenuIcon = function()
	{
		var destArea = $( 'div.headerLogo');

		if ( destArea )
		{
			document.querySelector( "#nav-toggle" )
			 .addEventListener( "click", function() {
				this.classList.toggle( "active" );
				if ( $( this ).hasClass( 'active' ) )
				{
					me.updateNavDrawerHeaderContent();
				}
			});

			FormUtil.setClickSwitchEvent( me.menuAppMenuIconTag, me.navDrawerDivTag, [ 'open', 'close' ], me );
		}

	}

	me.updateNavDrawerHeaderContent = function()
	{
		if( !FormUtil.checkLogin() )
		{
			return;
		}

		DataManager.getSessionData( function( mySessionData ) {

			if( mySessionData == undefined )
			{
				return;
			}

			FormUtil.getMyListData( me.storageName_RedeemList, true, function( myData ){

				DataManager.getUserConfigData( function( userData ){

					if( userData != undefined && userData.orgUnitData != undefined )
					{
						$( '#divNavDrawerOUlongName' ).html( userData.orgUnitData.orgUnit.name );
					}
					else
					{
						$( '#divNavDrawerOUlongName' ).html( '' );
					}

				});
	
				
				if ( myData && FormUtil.checkLogin() )
				{
					var mySubmit = myData.filter( a=>a.status == me.status_redeem_submit );
					var myQueue = myData.filter( a=>a.status == me.status_redeem_queued );
					//var myPaused = myData.filter( a=>a.status == me.status_redeem_paused );
					var myFailed = myData.filter( a=>a.status == me.status_redeem_failed && (!a.networkAttempt || a.networkAttempt < me.storage_offline_ItemNetworkAttemptLimit) );
	
					if ( me.debugMode ) console.log( ' cwsR > navMenuStat data ' );
	
					$( '#divNavDrawerSummaryData' ).html ( me.menuStatSummary( mySubmit, myQueue, myFailed ) );
	
				}

			} );
			
		});


		

	}

	me.menuStatSummary = function( submitList, queueList, failedList )
	{
		var statTbl = $( '<table class="tblMenuStatSummary" />');
		var tr = $( '<tr>' );
		var tdFiller = $( '<td class="statFiller" />' );
		var tdSubmit = $( '<td class="menuStat" />' );
		var tdQueue  = $( '<td class="menuStat" />' );
		var tdFailed = $( '<td class="menuStat" />' );

		statTbl.append( tr );
		tr.append( tdFiller );

		var lblSubmit = $( '<span class="lblStatSubmit" />' );
		var lblQueue  = $( '<span class="lblStatQueue" />' );
		var lblFailed = $( '<span class="lblStatFailed" />' );

		var dataSubmit = $( '<span class="menuDataStat" />' );
		var dataQueue  = $( '<span class="menuDataStat" />' );
		var dataFailed = $( '<span class="menuDataStat" />' );

		if ( submitList && submitList.length )
		{
			FormUtil.appendStatusIcon ( $( lblSubmit ), FormUtil.getStatusOpt ( { "status": me.status_redeem_submit } ), true );
			dataSubmit.append( submitList.length );
			tr.append( tdSubmit );	
		}

		if ( queueList && queueList.length )
		{
			FormUtil.appendStatusIcon ( $( lblQueue ), FormUtil.getStatusOpt ( { "status": me.status_redeem_queued } ), true );
			dataQueue.append( queueList.length );
			tr.append( tdQueue );
		}

		if ( failedList && failedList.length )
		{
			FormUtil.appendStatusIcon ( $( lblFailed ), FormUtil.getStatusOpt ( { "status": me.status_redeem_failed } ), true );
			dataFailed.append( failedList.length );
			tr.append( tdFailed );

		}

		tdSubmit.append( lblSubmit, dataSubmit );
		tdQueue.append( lblQueue, dataQueue );
		tdFailed.append( lblFailed, dataFailed );

		return statTbl;
	}

	me.populateMenuList = function( areaList, exeFunc )
	{

		DataManager.getSessionData( function(userSessionJson) {
			//var userSessionJson = DataManager.getSessionData();
			var userName = ( FormUtil.login_UserName && FormUtil.checkLogin() ) ? FormUtil.login_UserName : "";
			var startMenuTag;

			$( '#navDrawerDiv' ).empty();

			// clear the list first
			me.navDrawerDivTag.find( 'div.menu-mobile-row' ).remove();

			// TODO: GREG: THIS COULD BE shortened or placed in html page? James: dynamic menu items > not sure that's possible?
			var navMenuHead = $( '<div id="navMenuHead" />' );
			var navMenuTbl = $( '<table id="navDrawerHeader" />' );
			var tr = $( '<tr />' );
			var tdLeft = $( '<td class="menuHeadLeft" />' );
			var tdRight = $( '<td class="menuHeadRight" />' );

			me.navDrawerDivTag.append ( navMenuHead );
			navMenuHead.append ( navMenuTbl );
			navMenuTbl.append ( tr );
			tr.append ( tdLeft );
			tr.append ( tdRight );

			var navMenuLogo = $( '<img src="images/logo.svg" />' );

			tdLeft.append ( navMenuLogo );
			tdRight.append ( $( '<div id="divNavDrawerOUName" >' + userName + '</div>') );
			tdRight.append ( $( '<div id="divNavDrawerOUlongName" />' ) );

			var tr = $( '<tr />' );
			var td = $( '<td colspan=2 style="height:20px;" />' );

			navMenuTbl.append ( tr );
			tr.append ( td );
			td.append ( $( '<div id="divNavDrawerSummaryData" />') );

			// Add the menu rows
			if ( areaList )
			{
				for ( var i = 0; i < areaList.length; i++ )
				{
					var area = areaList[i];
					var menuStyle = (( area.group != undefined ) ? ( area.group == false ? 'border-bottom: 0;' : '' ) : 'border-bottom: 0;' );
					var menuTag = $( '<table class="menu-mobile-row" areaId="' + area.id + '" style="' + menuStyle + '"><tr><td class="menu-mobile-icon"> <img src="images/' + area.icon + '.svg"> </td> <td class="menu-mobile-label" ' + FormUtil.getTermAttr( area ) + '>' + area.name + '</td></tr></table>' );				

					me.setupMenuTagClick( menuTag );

					me.navDrawerDivTag.append( menuTag );

					if ( area.startArea ) startMenuTag = menuTag;
				}	
			}

			if ( FormUtil.checkLogin() && ConnManager.userNetworkMode )
			{
				me.navDrawerDivTag.append( '<div id="menu_userNetworkMode" style="padding:10px;font-size:11px;color:#A0A0A1;"><span term="">mode</span>: ' + ConnManager.connStatusStr( ConnManager.getAppConnMode_Online() ) + '</div>' );
			}
			else
			{
				$( '#menu_userNetworkMode' ).remove();
			}

			me.renderDefaultTheme(); // after switching between offline/online theme defaults not taking effect

			if ( exeFunc ) exeFunc( startMenuTag );
		});
	
	}

	me.setRegistrationObject = function( registrationObj )
	{
		me.registrationObj = registrationObj;
	}

	me.reGetAppShell = function()
	{
		if ( me.registrationObj !== undefined )
		{
			me.registrationObj.unregister().then(function(boolean) {
				location.reload( true );
			})
			.catch(err => {
				// MISSING TRANSLATION
				MsgManager.notificationMessage ( 'SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000 );
				setTimeout( function() {
					location.reload( true );
				}, 100 )		
			
			});
		}
		else
		{
			// MISSING TRANSLATION
			MsgManager.notificationMessage ( 'SW unavailable - restarting app', 'notificationDark', undefined, '', 'left', 'bottom', 5000 );
			setTimeout( function() {
				location.reload( true );
			}, 100 )		
		}
	}

	me.reGetDCDconfig = function()
	{
		if ( me.loginObj !== undefined )
		{
			me.loginObj.regetDCDconfig();
		}  
	}


	/* @Greg: do we create a new class for managing color-scheme themes? */
	// Yes, it will be nice. : )
	me.renderDefaultTheme = function ()
	{
		if ( me.configJson && me.configJson.settings && me.configJson.settings.theme && me.configJson.themes )
		{
			console.log( 'Updating to theme: ' + me.configJson.settings.theme);

			var defTheme = me.getThemeConfig( me.configJson.themes, me.configJson.settings.theme );

			$( 'nav.bg-color-program' ).css( 'background-color', defTheme.navTop.colors.background );
			$( '#spanOuName' ).css( 'color', defTheme.navTop.colors.foreground );
			//$( '#divNavDrawerOUName' ).css( 'background-color', defTheme.navTop.colors.background );
			//$( '#divNavDrawerOUlongName' ).css( 'background-color', defTheme.navTop.colors.background );
			//$( '#divNavDrawerOUName' ).css( 'color', defTheme.navTop.colors.foreground );
			//$( '#divNavDrawerOUlongName' ).css( 'color', defTheme.navTop.colors.foreground );
			//$( '#divNavDrawerSummaryData' ).css( 'color', defTheme.navTop.colors.foreground );
			$( 'div.bg-color-program-son' ).css( 'background-color', defTheme.navMiddle.colors.background );
			//$( '#navDrawerHeader' ).css( 'background-color', defTheme.navTop.colors.background );
			//$( '#navDrawerHeader' ).css( 'color', defTheme.navTop.colors.foreground );
			//$( 'div.menu-mobile' ).css( 'background-color', defTheme.navDrawer.colors.background );
			//$( 'div.menu-mobile-row' ).css( 'background-color', defTheme.navDrawer.colors.background );
			//$( 'div.menu-mobile-row' ).css( 'color', defTheme.navDrawer.colors.foreground );


			$('#styleCssMobileRow').remove();
			$('#styleCssPulse').remove();
			$('#styleCssProgress').remove();

			$( 'head' ).append('<style id="styleCssProgress"> .determinate, .indeterminate { background-color: ' + defTheme.navTop.colors.foreground + ' } </style>');

			if ( defTheme.button.colors )
			{
				var btnStyle = '';
				if ( defTheme.button.colors.foreground )
				{
					btnStyle += ' color: ' + defTheme.button.colors.foreground + ';'
				}
				if ( defTheme.button.colors.background )
				{
					btnStyle += ' background-color: ' + defTheme.button.colors.background + ';'

					$( 'head' ).append('<style id="styleCssPulse"> #pulsatingCircle:before, #pulsatingCircle:after { ' + btnStyle + ' } </style>');
				}
				else
				{
					$( 'head' ).append('<style id="styleCssPulse"> #pulsatingCircle:before, #pulsatingCircle:after { background-Color: #FFC61D; } </style>');
				}

				$( 'head' ).append('<style id="styleCssMobileRow"> .navMenuHeader, .tb-content-buttom { ' + btnStyle + ' } </style>');

			}

		}
		
	}

	me.getThemeConfig = function ( themeArr, theme )
	{
		for ( var i = 0; i < themeArr.length; i++ )
		{
			if ( themeArr[i].name == theme )
			{
				return themeArr[i].spec;
			}

		}

	}


	// --------------------------------------------------------
	// ----------- Translate langTerm retrieval and do lang change -------------
	
	me.retrieveAndSetUpTranslate = function()
	{
		
		FormUtil.defaultLanguage(function( defaultLangCode ){
			//"pt";

			me.langTermObj.setCurrentLang( defaultLangCode )

			me.langTermObj.retrieveAllLangTerm( function( allLangTerms ) 
			{
				if ( allLangTerms )
				{
					// Enable the language switch dropdown
					me.settingsApp.populateLangList_Show( me.langTermObj.getLangList(), defaultLangCode );

					// Translate current page
					me.langTermObj.translatePage();
				}
			});
		}); 

	}


	// ----------------------------------------------
	// ----------- Render called method -------------

	me.handleLastSession = function( nextFunc )
	{
		// Check 'Local Data'.  If 'stayLoggedIn' were previously set to true, load saved info.
		DataManager.getSessionData( function(lastSession) {
			if ( lastSession )
			{
				$( 'input.loginUserName' ).val( lastSession.user );	
			}
		});

		if ( nextFunc )
		{
			nextFunc();
		}
	}

	me.showLoginForm = function()
	{
		// If 'initializeStartBlock' case, open the Login form.
		me.loginObj.loginFormDivTag.show();
		me.loginObj.render(); // Open Log Form
	}

	// ----------------------------------------------

	// ----------------------------------------------
	// ----------- Area Render called method -------------
	
	me.hideAreaRelatedParts = function()
	{
		me.pulsatingProgress.hide();
		$( '#divProgressBar' ).hide();
		$( '#focusRelegator' ).hide();
		$( '#statisticsFormDiv' ).hide();
		$( '#aboutFormDiv' ).hide();
		$( '#settingsFormDiv' ).hide();

		// hide the menu div if open
		me.hidenavDrawerDiv();			
	}

	me.clearMenuClickStyles = function()
	{
		$( 'table.menu-mobile-row' ).css( 'background-color', '#FFF' );
		$( 'table.menu-mobile-row' ).css( 'opacity', '0.8' );
	}

	me.updateMenuClickStyles = function( areaId )
	{
		//var tag = 
		$( '[areaid="' + areaId + '"]' ).css( 'background-color', 'rgb(235,235,235,1)' ); //as per FIGMA
		$( '[areaid="' + areaId + '"]' ).css( 'opacity', '1' );
	}

	me.logOutProcess = function()
	{
		// TODO: CREATE 'SESSION' CLASS TO PUT THESE...

		FormUtil.undoLogin();
		sessionStorage.clear();

		// change to session Management process > forced reload of app (detect new version + forced login)
		var SWinfoObj = localStorage.getItem( 'swInfo' );

		if ( SWinfoObj )
		{
			SWinfoObj = JSON.parse( SWinfoObj );
			
			if ( SWinfoObj.reloadRequired )
			{ 
				location.reload( true );
			}
			else
			{
				me.closeLoginSession();
			}
		}
		else
		{
			me.closeLoginSession();
		}

	}

	me.closeLoginSession = function()
	{
		me.loginObj.spanOuNameTag.text( '' );
		me.loginObj.spanOuNameTag.hide();
		me.clearMenuPlaceholders();
		me.navDrawerDivTag.empty();
		me.renderDefaultTheme();
		me.loginObj.openForm();
		syncManager.evalSyncConditions();

		if ( $( 'div.aboutListDiv' ).is(':visible') )
		{
			me.aboutApp.hideAboutPage();
		}
		
		if ( $( 'div.statisticsDiv' ).is(':visible') ) 
		{
			me.statisticsObj.hideStatsPage();
		}
		if ( $( 'div.settingsListDiv' ).is(':visible') ) 
		{
			me.settingsApp.hideSettingsPage();
		}

		$( 'nav' ).hide();
	}

	me.clearMenuPlaceholders = function()
	{
		$( '#divNavDrawerOUName' ).html( '' );
		$( '#divNavDrawerOUlongName' ).html( '' );
		$( '#divNavDrawerSummaryData' ).html( '' );
	}

	// TODO: GREG: CREATE 'SESSION' CLASS TO PUT THESE...
	me.trackUserLocation = function( clicked_area )
	{
		DataManager.getSessionData( function(lastSession){

			var thisNetworkMode = ( ConnManager.getAppConnMode_Online() ? 'online' : 'offline' );
			var altNetworkMode = ( ConnManager.getAppConnMode_Online() ? 'offline' : 'online' );
			var matchOn = [ "id", "startBlockName", "name" ];
			var matchedOn, areaMatched;

			if (lastSession)
			{

				DataManager.getUserConfigData( function( loginData ){

					if (loginData)
					{
						for ( var i = 0; i < loginData.dcdConfig.areas[thisNetworkMode].length; i++ )
						{
							loginData.dcdConfig.areas[thisNetworkMode][i].startArea = false;

							if ( clicked_area.id == loginData.dcdConfig.areas[thisNetworkMode][i].id )
							{
								loginData.dcdConfig.areas[thisNetworkMode][i].startArea = true;
							}

						}
			
						//UPDATE lastStorage session for current user (based on last menu selection)
						DataManager.saveData( lastSession.user, loginData );

					}
				});
				
			}
		});
	}

	me.hidenavDrawerDiv = function()
	{
		// hide the menu
		if ( me.navDrawerDivTag.is( ":visible" ) )
		{
			me.menuAppMenuIconTag.click();
			me.menuAppMenuIconTag.css( 'width', 0 );

			$('#nav-toggle').removeClass('active');
		}		
	}

	me.createRefreshIntervalTimer = function( ver )
	{
		var bDev = ( (location.href).indexOf('localhost') >= 0 || (location.href).indexOf('ngrok') >= 0 || (location.href).indexOf('127.0.0.1:8080') >= 0 );

		me.newSWrefreshNotification( ver );

		var refreshIntV = setInterval( function() {

			me.newSWrefreshNotification( ver );

			// if running on DEV/Local server, run repeat notification every 2.5min until user refreshes
		}, ( ( ( ( bDev ) ? 1 : me.autoLogoutDelayMins)  / 2 ) * 60 * 1000 ) ); //60 * 60 * 1000 = 3600,000 = 60mins

		console.log( ' ~ auto REFRESH interval timer: ' + refreshIntV + ' {' + ( ( ( ( bDev ) ? 5 : me.autoLogoutDelayMins)  / 2 ) * 60 * 1000 ) + '}');

	}

	me.newSWrefreshNotification = function( ver )
	{

		// new update available
		var btnUpgrade = $( '<a class="notifBtn" term=""> REFRESH </a>');

		// move to cwsRender ?
		$( btnUpgrade ).click ( () => {

			var SWinfoObj = localStorage.getItem( 'swInfo' );

			if ( SWinfoObj )
			{
				//do nothing
			}
			else
			{
				localStorage.setItem( 'swInfo', JSON.stringify( { 'reloadRequired': false, 'datetimeInstalled': (new Date() ).toISOString() , 'currVersion': ver, 'lastVersion': ver, 'datetimeApplied': (new Date() ).toISOString() } ) );
			}

			location.reload( true );

		});

		// MISSING TRANSLATION
		MsgManager.notificationMessage ( 'Updates installed. Refresh to apply', 'notificationBlue', btnUpgrade, '', 'right', 'bottom', 25000 );

		console.log( ' ~ REFRESH notification' );

		localStorage.setItem( 'swInfo', JSON.stringify( { 'reloadRequired': true, 'datetimeInstalled': (new Date() ).toISOString() , 'currVersion': ver, 'lastVersion': ver, 'datetimeApplied': '' } ) );

	}

	// ======================================

	me.initialize();
}