// -------------------------------------------
// -- CwS Render Class/Methods
function cwsRender()
{
	var me = this;

	// Tags
	me.pageDivTag = $( '#pageDiv' );
	me.navDrawerDivTag = $( '#navDrawerDiv' );
	/* me.menuAppMenuIconTag = $( '#nav-toggle' );*/
	/* me.loggedInDivTag = $( '#loggedInDiv' ); */
	me.navDrawerShowIconTag = $( 'div.Nav__icon' );
	me.pulsatingProgress = $( '#pulsatingDots' );

	// service worker obj reference
	me.swManagerObj;  // set on 'app.js' initialize process

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
		if ( me.debugMode ) console.customLog( 'cwsRender.render()' );

		me.loadSavedUserName();		
		me.showLoginForm();

		me._manageInputSwipe = inputMonitor( me );

		// Translate terms setup
		if ( me._translateEnable ) me.retrieveAndSetUpTranslate();

		//me.afterRender();
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
		me.statisticsObj = new Statistics( me );
		//me.favIconsObj = new favIcons( me );
	}

	// =============================================


	// =============================================
	// === EVENT HANDLER METHODS ===================

	me.updateFromSession = function()
	{
		var data = AppInfoManager.getNetworkSync();
		if ( data ) me.storage_offline_SyncExecutionTimerInterval = data;
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
		if ( clicked_areaId !== 'statisticsPage' && clicked_areaId !== 'settingsPage' && clicked_areaId !== 'aboutPage' )
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

			me.setAppTitle( clicked_areaId, $( this ).text() ); //$( this ).attr( 'displayName' ) 
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

		// NOTE: TODO: BELOW LOGIC NEEDS TO BE RE-ORGANIZED..
		//		-- SWITCHING SHOULD HAPPEN WITH CLEARING OUT OTHER PARTS..
		//

		// On each area render, clear out the pageDiv content (which represent area div)..
		//me.pageDivTag.empty();

		// 
		if ( areaId !== 'statisticsPage' && areaId !== 'settingsPage' && areaId !== 'aboutPage' )
		{
			me.pageDivTag.empty();

			me.resetVisibility_ViewListDiv();
		}


		// TODO: REVIEW IF WE NEED THIS PART..
		//FormUtil.gAnalyticsEventAction( function( analyticsEvent ) {

			me.hideAreaRelatedParts();

			// added by Greg (2019-02-18) > test track googleAnalytics
			//ga('send', { 'hitType': 'event', 'eventCategory': 'menuClick:' + areaId, 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });

			if (areaId === 'logOut') 
			{
				me.logOutProcess();
			}
			else if ( areaId === 'statisticsPage') 
			{
				me.statisticsObj.render();
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

					if ( ! me.pageDivTag.is( ':visible' ) ) me.pageDivTag.show();

					var startBlockObj = new Block( me, ConfigManager.getConfigJson().definitionBlocks[ selectedArea.startBlockName ], selectedArea.startBlockName, me.pageDivTag );
					startBlockObj.render();  // should been done/rendered automatically?

					// Change start area mark based on last user info..
					//me.trackUserLocation( selectedArea );				
				}

			}

		//});

	}


	// Area is always an entry location, right?
	me.renderNewAreaBlock = function( blockName, options )
	{
		// On each area render, clear out the pageDiv content (which represent area div)..
		me.pageDivTag.empty();

		var blockObj = new Block( me, ConfigManager.getConfigJson().definitionBlocks[ blockName ], blockName, me.pageDivTag, undefined, options );
		blockObj.render();

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
				var finalAreaList = ( SessionManager.getLoginStatus() ) ? Menu.populateStandardMenuList( areaList ) : Menu.setInitialLogInMenu( me );
	
				me.populateMenuList( finalAreaList, function( startMenuTag ){
	
					if ( startMenuTag && SessionManager.getLoginStatus() ) startMenuTag.click();
	
					// initialise favIcons
					//me.favIconsObj = new favIcons( me );
					//me.favIconsObj.render(); // << rendered from blockList (this method 'belongs' to blockList)
	
				} );
	
			}

		} );

	}

	me.refreshMenuItems = function()
	{
		ConfigManager.getAreaListByStatus( ( ConnManagerNew.statusInfo.appMode === 'Online' ), function( areaList ){

			if ( areaList )
			{
				var finalAreaList = ( SessionManager.getLoginStatus() ) ? Menu.populateStandardMenuList( areaList ) : Menu.setInitialLogInMenu( me );
	
				me.populateMenuList( finalAreaList, function( startMenuTag ){

					me.updateNavDrawerHeaderContent();
	
					//if ( startMenuTag && SessionManager.getLoginStatus() ) startMenuTag.click();

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
		if( !SessionManager.getLoginStatus() )
		{
			return;
		}

		$( 'div.navigation__user' ).html( SessionManager.sessionData.login_UserName );

		if ( SessionManager.getLoginStatus() ) //myData && SessionManager.getLoginStatus()
		{
			// var mySubmit = FormUtil.records_redeem_submit; 
			// var myQueue = FormUtil.records_redeem_queued; 
			// var myFailed = FormUtil.records_redeem_failed; 

			if ( me.debugMode ) console.customLog( ' cwsR > navMenuStat data ' );

		}

	}

	me.populateMenuList = function( areaList, exeFunc )
	{
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

				if ( area && area.groupBefore === true )
				{
					var groupRow = $( '<hr>' );

					navItemsUL.append( groupRow );
				}

				var menuLI = $( '<li areaId="' + area.id + '" displayName="' + area.name + '" />' );

				menuLI.append( $( '<div class="navigation__items-icon" style="background-image: url(images/' + area.icon + '.svg)" ></div>' ) );
				menuLI.append( $( '<a href="#" ' + FormUtil.getTermAttr( area ) + ' >' + area.name + '</a>' ) );

				navItemsUL.append( menuLI );

				me.setupMenuTagClick( menuLI );

				if ( area.startArea ) startMenuTag = menuLI;

				if ( area && area.groupAfter === true )
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

		navMenuUser.html( SessionManager.sessionData.login_UserName );

		me.renderDefaultTheme(); // after switching between offline/online theme defaults not taking effect

		if ( exeFunc ) exeFunc( startMenuTag );
	
	}


	// ------------------------------------
	// PUT THIS ON swManager?


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
			//console.customLog( 'Updating to theme: ' + ConfigManager.getConfigJson().settings.theme );

			//var defTheme = me.getThemeConfig( ConfigManager.getConfigJson().themes, ConfigManager.getConfigJson().settings.theme );
			// var defTheme = SessionManager.getStorageLastSessionData().theme;
			var defTheme = "";
			if( AppInfoManager.getUserInfo() != undefined )
			{
				defTheme = AppInfoManager.getUserInfo().theme;
			}

			$('#styleCssMobileRow').remove();
			$('#styleCssPulse').remove();
			$('#styleCssProgress').remove();

			//$( 'head' ).append('<style id="styleCssProgress"> .determinate, .indeterminate { background-color: ' + defTheme.navTop.colors.foreground + ' } </style>');

			/*if ( defTheme.button.colors )
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

			}*/

			if ( defTheme ) $("body").removeClass().addClass( defTheme );

		}
		else
		{
			$("body").removeClass().addClass( 'theme-blue' );
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
		var langCode = AppInfoManager.getLangCode();

		me.langTermObj.setCurrentLang( langCode )

		me.langTermObj.retrieveAllLangTerm( function( allLangTerms ) 
		{
			if ( allLangTerms )
			{
				// Enable the language switch dropdown
				me.settingsApp.populateLangList_Show( me.langTermObj.getLangList(), langCode );

				// Translate current page
				me.langTermObj.translatePage();
			}
		});
	};


	// ----------------------------------------------
	// ----------- Render called method -------------

	me.loadSavedUserName = function()
	{
		// TODO: Use Session Manager?
		// TODO: MOVE THIS TO login page..
		var loginUserNameH4Tag = $( '#loginUserNameH4' );

		loginUserNameH4Tag.hide();

		var lastSession = AppInfoManager.getUserInfo();

		if ( lastSession && lastSession.user )
		{
			// Div (Input) part of Login UserName
			$( '#loginField' ).hide();

			// input parts..  Below will be hidden, though...
			$( 'input.loginUserName' ).val( lastSession.user );	
			$( 'input.loginUserName' ).attr( 'readonly',true );

			// Display login name as Big text part - if we already have user..
			loginUserNameH4Tag.text( lastSession.user ).show();
		}
		else
		{
			$( '#advanceOptionLoginBtn' ).removeClass( 'l-emphasis' ).addClass( 'dis' );
		}
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
		SessionManager.setLoginStatus( false );
		SessionManager.unloadDataInSession(); // Include config json unload
		
		ScheduleManager.stopSchedules_AfterLogOut();

		// change to session Management process > forced reload of app (detect new version + forced login)
		var SWinfoObj = AppInfoManager.getSWInfo()

		if ( SWinfoObj )
		{
			if ( SWinfoObj.reloadRequired )
			{ 
				location.reload( true );
			}
			else
			{
				me.closeLoginUI();
			}
		}
		else
		{
			me.closeLoginUI();
		}

	}

	me.closeLoginUI = function()
	{
		//me.loginObj.spanOuNameTag.text( '' );
		//me.loginObj.spanOuNameTag.hide();
		$( 'div.Nav__Title').html( '' );

		me.clearMenuPlaceholders();
		me.navDrawerDivTag.empty();
		me.renderDefaultTheme();
		me.loginObj.openForm();
		me.loginObj.clearLoginPin();
		
		//syncManager.evalSyncConditions();

		me.hideActiveSession_UIcontent();
	};


	// NOTE: Not the way to do.  Should organize all these in one and hide it...
	me.hideActiveSession_UIcontent = function()
	{
		// QUICK FIX - Hide 'about/setting/statistic' pages..
		$( '.subMenu_PageDiv' ).hide();

		// hide UI Areas
		if ( $( 'div.aboutListDiv' ).is(':visible') )
		{
			me.aboutApp.hideAboutPage();
		}
		if ( me.statisticsObj.statisticsFormDiv.is(':visible') ) 
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
		if ( $( '#fullScreenPreview' ).is(':visible') ) 
		{
			$('#fullScreenPreview').empty();
			$('#fullScreenPreview').hide();
			$('#pageDiv').hide();
		}
		if ( $( '#divMsgAreaBottom' ).is(':visible') ) 
		{
			$('#divMsgAreaBottom').hide();
			$('#divMsgAreaBottomScrim').hide();
		}

		me.hidenavDrawerDiv();

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

	// TRAN TODO : Discuss with James and will try to remove this method and disabled the code method
	// TODO: GREG: CREATE 'SESSION' CLASS TO PUT THESE...
	// USED?  Put in back file?
	me.trackUserLocation = function( clicked_area )
	{
		// var userInfo = AppInfoManager.getUserInfo();

		// 	var thisNetworkMode = ( ConnManagerNew.statusInfo.appMode.toLowerCase() ? 'online' : 'offline' );
		// 	// var altNetworkMode = ( ConnManagerNew.statusInfo.appMode.toLowerCase() ? 'offline' : 'online' );
		// 	// var matchOn = [ "id", "startBlockName", "name" ];
		// 	// var matchedOn, areaMatched;

		// 	if ( userInfo )
		// 	{

		// 		// DataManager.getUserConfigData( function( loginData ){

		// 			// if (loginData)
		// 			// {
		// 				var dcdConfig = ConfigManager.getConfigJson();
		// 				for ( var i = 0; i < dcdConfig.areas[thisNetworkMode].length; i++ )
		// 				{
		// 					dcdConfig.areas[thisNetworkMode][i].startArea = false;

		// 					if ( clicked_area.id == dcdConfig.areas[thisNetworkMode][i].id )
		// 					{
		// 						dcdConfig.areas[thisNetworkMode][i].startArea = true;
		// 					}

		// 				}
			
		// 				//UPDATE lastStorage session for current user (based on last menu selection)
		// 				// DataManager.saveData( lastSession.user, loginData );

		// 			// }
		// 		// });
				
		// 	}
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
	
    me.favIcons_Update = function()
    {
		if ( $( 'div.fab' ).hasClass( 'w_button' ) ) 
		{
			$( 'div.fab' ).click(); // hide because already opened
			$( 'div.fab' ).off( 'click' );
		}

		me.favIconsObj = new favIcons( me );
		me.favIconsObj.render();

	};

    me.setFloatingListMenuIconEvents = function( iconTag, SubIconListTag )
	{
        FormUtil.setClickSwitchEvent( iconTag, SubIconListTag, [ 'on', 'off' ], me );
	};

	// ======================================

	me.newSWrefreshNotification = function()
	{
		me.swManagerObj.newSWrefreshNotification();
	};

	me.setNewAppFileStatus = function( newAppFilesFound )
	{
		me.loginObj.setNewAppFileStatus( newAppFilesFound );
		me.aboutApp.setNewAppFileStatus( newAppFilesFound );	
	};

	// ======================================

	me.initialize();
}