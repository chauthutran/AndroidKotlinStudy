// -------------------------------------------
// -- CwS Render Class/Methods
function cwsRender()
{
	var me = this;

	// Tags
	//me.renderBlockTag = $( '#renderBlock' );
	me.renderBlockTag = $( '#pageDiv' );
	me.navDrawerDivTag = $( '#navDrawerDiv' );
	/* me.menuAppMenuIconTag = $( '#nav-toggle' );*/
	/* me.loggedInDivTag = $( '#loggedInDiv' ); */
	me.navDrawerShowIconTag = $( 'div.Nav__icon' );
	me.pulsatingProgress = $( '#pulsatingCircle' );

	// global variables
	//me.configJson;
	me.areaList = [];
	me.manifest;
	me.favIconsObj;
	me.aboutApp;
	me.settingsApp;
	me.myDetails;
	me.statisticsObj;
	me.registrationObj;
	me.loginObj;
	me.langTermObj;
	//me.sessionObj; // NEW PROPOSAL


	// Settings var
	me.storage_offline_ItemNetworkAttemptLimit = Constants.storage_offline_ItemNetworkAttemptLimit; //number of times sync-attempt allowed per redeemItem (with failure/error) before blocking new 'sync' attempts
    me.storage_offline_SyncExecutionTimerInterval = 60000; // make 60 seconds?  // move to SchedManager?
    me.storage_offline_SyncConditionsTimerInterval = 10000; // make 10 seconds? // move to SchedManager?


	// Create separate class for this?
	// NOT BEING USED.
	me.blocks = {};	// "blockId": blockObj..
	//me.activityList = [];	// Move to FormUtil.activityList?


	me._localConfigUse = false;
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
		//me.manifest = FormUtil.getManifest();

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
		me.myDetails = new myDetails( me );
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
	};

	me.setPageHeaderEvents = function()
	{
		me.setNavMenuIconEvents();		
	};


	me.setOtherEvents = function() 
	{ 

		// msg hide click event
		$( '.sheet_bottom-scrim' ).click( function () 
		{
            $( '.sheet_bottom-fs' ).css( 'display', 'none' );
            $( '.sheet_bottom-scrim' ).css( 'display', 'none' );
		});
				
	};


	// This or other classes use this to control the scrolling..
	me.setScrollEvent = function( scrollCallBack )
	{
        $( 'body' ).off( "scroll" ).on( "scroll", scrollCallBack );
	};

	// This or other classes use this to control the scrolling..
	me.setAppTitle = function( clicked_areaId, displayText )
	{
		// these items show up full-screen (sheet_full-fs)
		if ( clicked_areaId !== 'settingsPage' && clicked_areaId !== 'aboutPage' )
		{
			$( 'div.Nav__Title' ).html( displayText );
		}
	};
	

	// -------------------------

	me.setupMenuTagClick = function( menuTag )
	{
		menuTag.click( function() 
		{
			var clicked_areaId = $( this ).attr( 'areaId' );

			me.setAppTitle( clicked_areaId, $( this ).attr( 'displayName' ) );
			me.renderArea( clicked_areaId );
		});
	}

	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.resetVisibility_ViewListDiv = function()
	{
		$( 'div.Nav2' ).hide();
	};


	// NOTE: 'redeemList' data load after login <-- Called by login class - After Login
	me.loadActivityListData_AfterLogin = function( callBack )
	{
		// Do 'redeemList' move from localStorage to IndexedDB (localForage version)
		//  - Since we need password to encrypt the data..
		DataVerMove.lsRedeemListMove( function() {			

			ClientDataManager.loadClientsStore_FromStorage( function() {

				ActivityDataManager.regenActivityList_NIndexes();

				callBack();
			});
		});
	};


	me.renderArea = function( areaId )
	{

		if ( areaId !== 'settingsPage' && areaId !== 'aboutPage' )
		{
			me.resetVisibility_ViewListDiv();
		}

		FormUtil.gAnalyticsEventAction( function( analyticsEvent ) {

			me.hideAreaRelatedParts();

			// added by Greg (2019-02-18) > test track googleAnalytics
			ga('send', { 'hitType': 'event', 'eventCategory': 'menuClick:' + areaId, 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });

			// should close current tag/content?
			if (areaId === 'logOut') me.logOutProcess();
			else if ( areaId === 'statisticsPage') 
			{
				//me.clearMenuClickStyles();
				me.statisticsObj.render();
				//me.updateMenuClickStyles( areaId );
			}
			else if ( areaId === 'settingsPage')
			{
				me.settingsApp.render();
			}
			else if ( areaId === 'myDetails') 
			{
				me.myDetails.loadFormData();
			}
			else if ( areaId === 'aboutPage') 
			{
				me.aboutApp.render();
			}
			else
			{
				//me.clearMenuClickStyles();

				me.areaList = ConfigManager.getAllAreaList();

				var selectedArea = Util.getFromList( me.areaList, areaId, "id" );

				// TODO: ACTIVITY ADDING
				ActivityUtil.addAsActivity( 'area', selectedArea, areaId );

				// if menu is clicked, reload the block refresh?
				if ( selectedArea && selectedArea.startBlockName )
				{

					if ( ! me.renderBlockTag.is( ':visible' ) ) me.renderBlockTag.show();

					var startBlockObj = new Block( me, ConfigManager.getConfigJson().definitionBlocks[ selectedArea.startBlockName ], selectedArea.startBlockName, me.renderBlockTag );
					startBlockObj.render();  // should been done/rendered automatically?

					// Change start area mark based on last user info..
					me.trackUserLocation( selectedArea );				
				}

			}

		});

	}


	me.renderBlock = function( blockName, options )
	{
		if ( options )
		{
			var blockObj = new Block( me, ConfigManager.getConfigJson().definitionBlocks[ blockName ], blockName, me.renderBlockTag, undefined, options );
		}
		else
		{
			var blockObj = new Block( me, ConfigManager.getConfigJson().definitionBlocks[ blockName ], blockName, me.renderBlockTag );
		}

		if ( $( 'div.scrim').is( ':visible' ) ) $( 'div.scrim').hide();

		blockObj.render();

		// Greg: find a way to link back favIcon 'menu-item-ID' for current [area:online/offline]
		//console.log( blockObj )
		//var areaId = blockObj.id
		//me.updateMenuClickStyles( areaId );

		return blockObj;
	}

	// --------------------------------------
	// -- START POINT (FROM LOGIN) METHODS
	me.startWithConfigLoad = function()
	{
		me.startBlockExecute();
	}

	me.startBlockExecute = function( initializationInstructions )
	{
		//initializationInstructions: taken from URL querystring:parameters, e.g. &activityid:123456&voucherid:12345678FC&Name:Rodoflo&ServiceRequired:FP&UID:romefa70
		ConfigManager.getAreaListByStatus( ( ConnManagerNew.statusInfo.appMode === 'Online' ), function( areaList ){

			if ( areaList )
			{
				var finalAreaList = FormUtil.checkLogin() ? Menu.populateStandardMenuList( areaList ) : Menu.setInitialLogInMenu( me );
	
				me.populateMenuList( finalAreaList, function( startMenuTag ){
	
					if ( startMenuTag && FormUtil.checkLogin() ) startMenuTag.click();
	
					// initialise favIcons
					//me.favIconsObj = new favIcons( me );
	
				} );
	
			}

		} );

		//DataManager.initialiseDataStorageSize();

	}

	me.refreshMenuItems = function()
	{
		ConfigManager.getAreaListByStatus( ( ConnManagerNew.statusInfo.appMode === 'Online' ), function( areaList ){

			if ( areaList )
			{
				var finalAreaList = FormUtil.checkLogin() ? Menu.populateStandardMenuList( areaList ) : Menu.setInitialLogInMenu( me );
	
				me.populateMenuList( finalAreaList, function( startMenuTag ){

					me.updateNavDrawerHeaderContent();
	
					//if ( startMenuTag && FormUtil.checkLogin() ) startMenuTag.click();

				} );
	
			}

		} );

	}

	// Call 'startBlockExecute' again with in memory 'configJson' - Called from 'ConnectionManagerNew'
	me.handleAppMode_Switch = function()
	{
		//me.startBlockExecuteAgain();
		me.refreshMenuItems();

		if ( $( 'div.fab' ) ) 
		{
			me.favIcons_Update();
		}

	}

	me.startBlockExecuteAgain = function()
	{
		me.startBlockExecute();

		/*
		DataManager.getUserConfigData( function( userData ){

			if ( userData != undefined )
			{
				me.startBlockExecute( userData.dcdConfig );
			}
			else
			{
				var sessData = localStorage.getItem( Constants.storageName_session );

				if ( sessData )
				{
					var dcdData = localStorage.getItem( JSON.parse( sessData ).user );

					me.startBlockExecute( JSON.parse( dcdData ).dcdConfig );
				}
				
			}

		});
		*/
	}

	// ----------------------------------

	
	me.setNavMenuIconEvents = function()
	{

		me.navDrawerShowIconTag.on( "click", function() {

			this.classList.toggle( "active" );

			if ( $( this ).hasClass( 'active' ) )
			{
				me.updateNavDrawerHeaderContent();
			}

		});

		FormUtil.setClickSwitchEvent( me.navDrawerShowIconTag, me.navDrawerDivTag, [ 'open', 'close' ], me );

	}

	me.updateNavDrawerHeaderContent = function()
	{
		if( !FormUtil.checkLogin() )
		{
			return;
		}

		DataManager.getSessionData( function( mySessionData ) {

			//FormUtil.updateStat_SyncItems( Constants.storageName_redeemList, function( myData )
			{
				DataManager.getUserConfigData( function( userData ){

					$( 'div.navigation__user' ).html( userData.orgUnitData.userName );

				});

				if ( FormUtil.checkLogin() ) //myData && FormUtil.checkLogin()
				{
					var mySubmit = FormUtil.records_redeem_submit; 
					var myQueue = FormUtil.records_redeem_queued; 
					var myFailed = FormUtil.records_redeem_failed; 

					if ( me.debugMode ) console.log( ' cwsR > navMenuStat data ' );

					//$( '#divNavDrawerSummaryData' ).html ( me.menuStatSummary( mySubmit, myQueue, myFailed ) );
				}

			} //re);

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

		if ( submitList && submitList > 0 )
		{
			FormUtil.appendStatusIcon ( $( lblSubmit ), FormUtil.getStatusOpt ( { "status": Constants.status_submit } ), true );
			dataSubmit.append( submitList );
			tr.append( tdSubmit );	
		}

		if ( queueList && queueList > 0 )
		{
			FormUtil.appendStatusIcon ( $( lblQueue ), FormUtil.getStatusOpt ( { "status": Constants.status_queued } ), true );
			dataQueue.append( queueList );
			tr.append( tdQueue );
		}

		if ( failedList && failedList > 0 )
		{
			FormUtil.appendStatusIcon ( $( lblFailed ), FormUtil.getStatusOpt ( { "status": Constants.status_failed } ), true );
			dataFailed.append( failedList );
			tr.append( tdFailed );

		}

		tdSubmit.append( lblSubmit, dataSubmit );
		tdQueue.append( lblQueue, dataQueue );
		tdFailed.append( lblFailed, dataFailed );

		return statTbl;
	}

	me.populateMenuList = function( areaList, exeFunc )
	{

		DataManager.getSessionData( function( userSessionJson ) {

			var userName = ( SessionManager.sessionData.login_UserName && FormUtil.checkLogin() ) ? SessionManager.sessionData.login_UserName : "";
			var startMenuTag;

			$( '#navDrawerDiv' ).empty();

			// clear the list first
			//me.navDrawerDivTag.find( 'div.menu-mobile-row' ).remove();

			// TODO: GREG: THIS COULD BE shortened or placed in html page? James: dynamic menu items > not sure that's possible?
			var navMenuHead = $( '<div class="navigation__header" />' );
			var navMenuLogo = $( '<div class="navigation__logo" />' );
			var navMenuUser = $( '<div class="navigation__user" />' );
			var navMenuClose = $( '<div class="navigation__close" />' );


			me.navDrawerDivTag.append ( navMenuHead );
			navMenuHead.append ( navMenuLogo );
			navMenuHead.append ( navMenuUser );
			navMenuHead.append ( navMenuClose );
			//navMenuHead.append ( $( '<div id="divNavDrawerSummaryData" class="" />' ) );

			var navMenuItems = $( '<div class="navigation__items" />');
			var navItemsUL = $( '<ul />');

			navMenuItems.append( navItemsUL );

			// Add the menu rows
			if ( areaList )
			{
				for ( var i = 0; i < areaList.length; i++ )
				{
					var area = areaList[i];
					var menuLI = $( '<li areaId="' + area.id + '" displayName="' + area.name + '" />' );

					menuLI.append( $( '<div class="navigation__items-icon" style="background-image: url(images/' + area.icon + '.svg)" ></div>' ) );
					menuLI.append( $( '<a href="#" ' + FormUtil.getTermAttr( area ) + ' >' + area.name + '</a>' ) );

					navItemsUL.append( menuLI );

					me.setupMenuTagClick( menuLI );

					if ( area.startArea ) startMenuTag = menuLI;

					if ( area && area.group === true )
					{
						var groupRow = $( '<hr>' );

						navItemsUL.append( groupRow );
					}
				}	
			}

			me.navDrawerDivTag.append( navMenuItems );

			navMenuClose.on( 'click', function(){
				$( 'div.Nav__icon' ).click();
			});

/*
			if ( FormUtil.checkLogin() && ConnManager.userNetworkMode )
			{
				me.navDrawerDivTag.append( '<div id="menu_userNetworkMode" style="padding:10px;font-size:11px;color:#A0A0A1;"><span term="">mode</span>: ' + ConnManager.connStatusStr( ConnManagerNew.statusInfo.appMode.toLowerCase() ) + '</div>' );
			}
			else
			{
				$( '#menu_userNetworkMode' ).remove();
			}stat
*/
			me.renderDefaultTheme(); // after switching between offline/online theme defaults not taking effect

			if ( exeFunc ) exeFunc( startMenuTag );
		});
	
	}

	me.setRegistrationObject = function( registrationObj )
	{
		me.registrationObj = registrationObj;
	}

	me.reGetAppShell = function( callBack )
	{
		if ( me.registrationObj !== undefined )
		{
			me.registrationObj.unregister().then(function(boolean) {

				if ( callBack )
				{
					callBack();
				}
				else
				{
					location.reload( true );
				}

			})
			.catch(err => {
				// MISSING TRANSLATION
				MsgManager.notificationMessage ( 'SW ERROR: ' + err, 'notificationDark', undefined, '', 'left', 'bottom', 5000 );
				setTimeout( function() {
					
					if ( callBack )
					{
						callBack();
					}
					else
					{
						location.reload( true );
					}

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
		if ( ConfigManager.getConfigJson() 
			&& ConfigManager.getConfigJson().settings 
			&& ConfigManager.getConfigJson().settings.theme 
			&& ConfigManager.getConfigJson().themes )
		{
			console.log( 'Updating to theme: ' + ConfigManager.getConfigJson().settings.theme);

			var defTheme = me.getThemeConfig( ConfigManager.getConfigJson().themes, ConfigManager.getConfigJson().settings.theme );

			//$( '.Nav1' ).css( 'background-color', defTheme.navTop.colors.background );
			//$( '.Nav__Title' ).css( 'color', defTheme.navTop.colors.foreground );

			/* OLD STYLING: remove? */
			//$( '.navigation__user' ).css( 'background-color', defTheme.navTop.colors.background );
			//$( '#divNavDrawerOUlongName' ).css( 'background-color', defTheme.navTop.colors.background );
			//$( '.navigation__user' ).css( 'color', defTheme.navTop.colors.foreground );
			//$( '#divNavDrawerOUlongName' ).css( 'color', defTheme.navTop.colors.foreground );
			//$( '#divNavDrawerSummaryData' ).css( 'color', defTheme.navTop.colors.foreground );
			//$( 'div.bg-color-program-son' ).css( 'background-color', defTheme.navMiddle.colors.background );
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
		// TODO: Use Session Manager?
		// TODO: MOVE THIS TO login page..
		
		var lastSession = SessionManager.getStorageLastSessionData();

		if ( lastSession )
		{
			$( 'input.loginUserName' ).val( lastSession.user );	
			$( 'input.loginUserName' ).attr( 'readonly',true );
			$( '#loginField' ).hide();
			$('<h4>' + lastSession.user + '<h4>').insertBefore( $( '#loginField' ) );
		}

		if ( nextFunc ) nextFunc();
	};


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
		$( 'div.scrim' ).hide();
		$( '#statisticsFormDiv' ).hide();
		$( '#aboutFormDiv' ).hide();
		$( '#detailsFormDiv' ).hide();
		$( '#settingsFormDiv' ).hide();

		// hide the menu div if open
		me.hidenavDrawerDiv();			
	}

	me.clearMenuClickStyles = function()
	{
		//$( 'table.menu-mobile-row' ).css( 'background-color', '#FFF' );
		//$( 'table.menu-mobile-row' ).css( 'opacity', '0.8' );
		$( '.menu-area' ).css( 'background-color', '#FFF' );
		$( '.menu-area' ).css( 'opacity', '0.8' );
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
		SessionManager.unloadDataInSession();
		//FormUtil.undoLogin();
		sessionStorage.clear();
		ScheduleManager.stopSchedules_AfterLogOut();

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
		//me.loginObj.spanOuNameTag.text( '' );
		//me.loginObj.spanOuNameTag.hide();
		$( 'div.Nav__Title').html( '' );

		me.clearMenuPlaceholders();
		me.navDrawerDivTag.empty();
		me.renderDefaultTheme();
		me.loginObj.openForm();
		//syncManager.evalSyncConditions();

		me.hideActiveSession_UIcontent();

		me.clearLoginPin();
	}

	me.clearLoginPin = function()
	{
		// clear password pin
		$( 'input.loginUserPin' ).val( '' );
		$( '#passReal' ).val( '' );

		//$( '#passReal' ).trigger( { type: 'keypress', which: 46, keyCode: 46 } );

		// reset password pin events
		FormUtil.createNumberLoginPinPad();
	}

	me.hideActiveSession_UIcontent = function()
	{

		// hide UI Areas
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
		if ( $( 'div.detailsListDiv' ).is(':visible') ) 
		{
			me.myDetails.hidemyDetailsPage();
		}
		if ( $( '#pageDiv' ).is(':visible') ) 
		{
			$('#pageDiv').hide();
		}
		if ( $( 'div.sheet_full-preview' ).is(':visible') ) 
		{
			$('div.sheet_full-preview').empty();
			$('#pageDiv').hide();
		}

		// hide navMenu
		if ( $( '#navDrawerDiv' ).is(':visible') ) 
		{
			$( 'div.Nav__icon' ).click();
		}

		// hide control Popups

		if ( $( '#dialog_searchOptions' ).is(':visible') ) 
		{
			$( '#dialog_searchOptions' ).remove();
		}

		if ( $( '#mddtp-picker__date' ).is(':visible') ) 
		{
			$( '#mddtp-picker__date' ).hide();
		}

		if ( $( '.inputFieldYear' ).is(':visible') ) 
		{
			$( '.inputFieldYear' ).hide();
		}

		if ( $( '.scrim' ).is(':visible') )
		{
			$('.scrim').hide();
		}

		// hide navBar items
		$( '.Nav1' ).hide();
		$( '.Nav2' ).hide();
	}

	me.clearMenuPlaceholders = function()
	{
		$( 'div.navigation__user' ).html( '' );
		$( 'div.Nav__Title' ).html( '' );
		//$( '#divNavDrawerSummaryData' ).html( '' );
	}

	// TODO: GREG: CREATE 'SESSION' CLASS TO PUT THESE...
	// USED?  Put in back file?
	me.trackUserLocation = function( clicked_area )
	{
		DataManager.getSessionData( function( lastSession ){

			var thisNetworkMode = ( ConnManagerNew.statusInfo.appMode.toLowerCase() ? 'online' : 'offline' );
			var altNetworkMode = ( ConnManagerNew.statusInfo.appMode.toLowerCase() ? 'offline' : 'online' );
			var matchOn = [ "id", "startBlockName", "name" ];
			var matchedOn, areaMatched;

			if ( lastSession )
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
	};

	me.hidenavDrawerDiv = function()
	{
		// hide the menu
		if ( me.navDrawerDivTag.is( ":visible" ) )
		{
			me.navDrawerShowIconTag.click();
			me.navDrawerDivTag.css( 'width', 0 );

			$('#nav-toggle').removeClass('active');
		}		
	};

	me.createRefreshIntervalTimer = function( ver )
	{
		var bDev = WsCallManager.isLocalDevCase;
		
		me.newSWrefreshNotification( ver );

		var refreshIntV = setInterval( function() {

			me.newSWrefreshNotification( ver );

			// if running on DEV/Local server, run repeat notification every 2.5min until user refreshes
		}, ( ( ( ( bDev ) ? 1 : me.autoLogoutDelayMins)  / 2 ) * 60 * 1000 ) ); //60 * 60 * 1000 = 3600,000 = 60mins

		console.log( ' ~ auto REFRESH interval timer: ' + refreshIntV + ' {' + ( ( ( ( bDev ) ? 5 : me.autoLogoutDelayMins)  / 2 ) * 60 * 1000 ) + '}');

	};

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
		MsgManager.notificationMessage ( 'Updates installed. Refresh to apply', 'notificationGray', btnUpgrade, '', 'right', 'top', 25000 );

		console.log( ' ~ REFRESH notification' );

		localStorage.setItem( 'swInfo', JSON.stringify( { 'reloadRequired': true, 'datetimeInstalled': (new Date() ).toISOString() , 'currVersion': ver, 'lastVersion': ver, 'datetimeApplied': '' } ) );

	};
	
    me.favIcons_Update = function()
    {
		if ( $( 'div.fab' ).hasClass( 'w_button' ) ) 
		{
			$( 'div.fab' ).click(); // hide because already opened
			$( 'div.fab' ).off( 'click' );
		}

		me.favIconsObj = new favIcons( me );

	};

    me.setFloatingListMenuIconEvents = function( iconTag, SubIconListTag )
	{
        FormUtil.setClickSwitchEvent( iconTag, SubIconListTag, [ 'on', 'off' ], me );
	};

	// ======================================

	me.initialize();
}