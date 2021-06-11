// -------------------------------------------
// -- CwS Render Class/Methods
function cwsRender()
{
	var me = this;

	// Tags
	me.pageDivTag = $( '#pageDiv' );
	me.pulsatingProgress = $( '#pulsatingDots' );

	// service worker obj reference
	//me.SwManager;  // set on 'app.js' initialize process

	// global variables
	//me.configJson;
	me.areaList = [];
	me.manifest;
	me.favIconsObj;
	me.aboutApp;
	me.settingsApp;
	me.statisticsObj;
	me.registrationObj;
	me.loginObj;
	//me.sessionObj; // NEW PROPOSAL


	// Settings var
	me.storage_offline_ItemNetworkAttemptLimit = Constants.storage_offline_ItemNetworkAttemptLimit; //number of times sync-attempt allowed per redeemItem (with failure/error) before blocking new 'sync' attempts
    //me.storage_offline_SyncExecutionTimerInterval = Util.MS_MIN; // make 60 seconds?  // move to SchedManager?
    me.storage_offline_SyncConditionsTimerInterval = Util.MS_SEC * 10; // make 10 seconds? // move to SchedManager?


	// Create separate class for this?
	// NOT BEING USED.
	me.blocks = {};	// "blockId": blockObj..

	me._localConfigUse = false;
	me._translateEnable = true;
	me._manageInputSwipe;

	me.autoLogoutDateTime;

	me.debugMode = false;

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.setInitialData();

		me.setEvents_OnInit();

		Menu.setUpMenu();

		me.createSubClasses();
	}

	me.render = function()
	{
		me.loadSavedUserName();		

		me.loginObj.render(); // Open Log Form
	
		// This probably gets used for menu swipe?
		me._manageInputSwipe = inputMonitor( me );

		// Translate terms setup
		if ( me._translateEnable ) me.loadLangTermsAndTranslatePage();

		//me.afterRender();
	}

	// ------------------

	me.setInitialData = function()
	{
		//me.manifest = FormUtil.getManifest();

		//me.updateFromSession();
	}

	me.setEvents_OnInit = function()
	{		
		me.setOtherEvents();
	}

	me.createSubClasses = function()
	{
		me.loginObj = new Login( me );
		me.aboutApp = new aboutApp( me );
		me.settingsApp = new settingsApp( me );
		//me.myDetails = new myDetails( me );
		me.statisticsObj = new Statistics( me );
		//me.favIconsObj = new favIcons( me );
	}

	// =============================================


	// =============================================
	// === EVENT HANDLER METHODS ===================

	/*
	me.updateFromSession = function()
	{
		var data = AppInfoManager.getNetworkSync();
		if ( data ) me.storage_offline_SyncExecutionTimerInterval = data;
	};
	*/

	me.setOtherEvents = function() 
	{ 
		// msg hide click event
		$( '.sheet_bottom-scrim' ).click( function() 
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
	me.setAppTitle = function( clicked_areaId, displayText, termId )
	{
		// these items show up full-screen (sheet_full-fs)
		if ( clicked_areaId !== 'statisticsPage' 
			&& clicked_areaId !== 'settingsPage' 
			&& clicked_areaId !== 'aboutPage' 
			&& clicked_areaId !== 'jobAids' )  // [JOB_AID]
		{
			$( 'div.Nav__Title' ).html( '<span term=' + termId + '>' + displayText + '</span>' );
		}
	};
	

	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.resetVisibility_ViewListDiv = function()
	{
		$( '#activityListViewNav' ).hide();
	};


	// NOTE: 'redeemList' data load after login <-- Called by login class - After Login
	me.loadActivityListData_AfterLogin = function( callBack )
	{
		// Do 'redeemList' move from localStorage to IndexedDB (localForage version)
		//  - Since we need password to encrypt the data..
		DataVerMove.lsRedeemListMove( function() {			

			ClientDataManager.loadClientsStore_FromStorage( function() {

				ActivityDataManager.regenActivityList_NIndexes();

				// Change the activities that did not complete -> 'Pending' to 'Failed', as app time out measure.
				ActivityDataManager.updateActivitiesStatus_ProcessingToFailed( ActivityDataManager.getActivityList() );

				ClientDataManager.saveCurrent_ClientsStore();    

				callBack();
			});
		});
	};


	me.renderArea = function( areaId )
	{
		// Clear All Previous Msgs..
		MsgManager.msgAreaClearAll();

		// NOTE: TODO: BELOW LOGIC NEEDS TO BE RE-ORGANIZED..  -- SWITCHING SHOULD HAPPEN WITH CLEARING OUT OTHER PARTS..

		// On each area render, clear out the pageDiv content (which represent area div)..
		//me.pageDivTag.empty();

        // [JOB_AID]
		if ( areaId !== 'jobAids' 
             && areaId !== 'statisticsPage' 
             && areaId !== 'settingsPage' 
             && areaId !== 'aboutPage' )
		{
			me.pageDivTag.empty();
			me.resetVisibility_ViewListDiv();
		}

		// TODO: REVIEW IF WE NEED THIS PART..
		//FormUtil.gAnalyticsEventAction( function( analyticsEvent ) {

		me.hideAreaRelatedParts();

		// added by Greg (2019-02-18) > test track googleAnalytics
		//ga('send', { 'hitType': 'event', 'eventCategory': 'menuClick:' + areaId, 'eventAction': analyticsEvent, 'eventLabel': FormUtil.gAnalyticsEventLabel() });

		if ( areaId === 'logOut' ) me.logOutProcess();
		else if ( areaId === 'statisticsPage') me.statisticsObj.render();
		else if ( areaId === 'settingsPage') me.settingsApp.render();
        // [JOB_AID]
		else if ( areaId === 'jobAids') 
		{ 
            $( '#jobAidIFrame' ).attr( 'data', JobAidHelper.jobAid_startPage );
            $( '#divJobAid' ).show();
		}
		else if ( areaId === 'aboutPage') me.aboutApp.render();
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

				// Change start area mark based on last user info.. //me.trackUserLocation( selectedArea );
			}
		}
		//});
	};


	// Area is always an entry location, right?
	me.renderNewAreaBlock = function( blockName, options )
	{
		// On each area render, clear out the pageDiv content (which represent area div)..
		// if ( ! me.pageDivTag.is( ':visible' ) ) me.pageDivTag.show();  // <-- Need this?
		me.pageDivTag.empty();

		var blockObj = new Block( me, ConfigManager.getConfigJson().definitionBlocks[ blockName ], blockName, me.pageDivTag, undefined, options );
		blockObj.render();

		return blockObj;
	};

	// --------------------------------------
	// -- START POINT (FROM LOGIN) METHODS
	me.startWithConfigLoad = function()
	{
		me.startBlockExecute();
	};

	me.startBlockExecute = function( initializationInstructions )
	{
		//initializationInstructions: taken from URL querystring:parameters, e.g. &activityid:123456&voucherid:12345678FC&Name:Rodoflo&ServiceRequired:FP&UID:romefa70
		ConfigManager.getAreaListByStatus( ConnManagerNew.isAppMode_Online(), function( areaList )
		{
			if ( areaList )
			{
				var finalAreaList = ( SessionManager.getLoginStatus() ) ? Menu.populateStandardMenuList( areaList ) : Menu.setInitialLogInMenu();
	
				Menu.populateMenuList( finalAreaList, function( startMenuTag )
				{	
					if ( startMenuTag && SessionManager.getLoginStatus() ) startMenuTag.click();

					// TODO: CHECK New errored list..
					me.checkErrActivityList( function( errActList ) 
					{						
						FormUtil.showErrActivityMsg( errActList );
					});
				});
			}
		});
	};

	me.checkErrActivityList = function( callBack ) 
	{
		var errActList = AppInfoManager.getNewErrorActivities();
		if ( errActList.length > 0 ) callBack( errActList );
	};
	
	//var errActList = AppInfoManager.getNewErrorActivities();

	// Call 'startBlockExecute' again with in memory 'configJson' - Called from 'ConnectionManagerNew'
	me.handleAppMode_Switch = function()
	{
		Menu.refreshMenuItems();

		if ( $( 'div.fab' ) ) 
		{
			me.favIcons_Update();
		}
	};

	// ----------------------------------

	// ------------------------------------
	// PUT THIS ON swManager?


	me.reGetDCDconfig = function()
	{
		if ( me.loginObj !== undefined )
		{
			me.loginObj.regetDCDconfig();
		}  
	}

	// --------------------------------------------------------
	// ----------- Translate langTerm retrieval and do lang change -------------
	
	me.loadLangTermsAndTranslatePage = function()
	{
		TranslationManager.loadLangTerms_NSetUpData( false, function( allLangTerms ) 
		{
			if ( allLangTerms )
			{
				// Enable the language switch dropdown
				me.settingsApp.populateLangList_Show( TranslationManager.getLangList(), TranslationManager.getLangCode() );

				// Translate current page
				TranslationManager.translatePage();
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
			//me.advanceOptionLoginBtnTag.removeClass( 'l-emphasis' ).addClass( 'dis' );
		}
	};

	// ----------------------------------------------

	// ----------------------------------------------
	// ----------- Area Render called method -------------
	
	me.hideAreaRelatedParts = function()
	{
		me.pulsatingProgress.hide();
		$( '#divProgressBar' ).hide();
		$( '#statisticsFormDiv' ).hide();
		$( '#aboutFormDiv' ).hide();
		//$( '#detailsFormDiv' ).hide();
		$( '#settingsFormDiv' ).hide();

		FormUtil.unblockPage();

		// hide the menu div if open
		Menu.hideMenuDiv();
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

		me.closeLoginUI();

		SwManager.checkNewAppFile_OnlyOnline();

		// On LogOut, update the delayed appUpdate..
		SwManager.refreshForNewAppFile_IfAvailable();  // even on offline, this seems to be working?
	}

	me.closeLoginUI = function()
	{
		//me.loginObj.spanOuNameTag.text( '' );
		//me.loginObj.spanOuNameTag.hide();
		$( 'div.Nav__Title').html( '' );

		me.clearMenuPlaceholders();
		Menu.navDrawerDivTag.empty();

		me.hideActiveSession_UIcontent();

		Menu.renderDefaultTheme();
		me.loginObj.openForm();
		
		// me.loginBottomButtonsVisible( true );
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
		//if ( $( 'div.detailsListDiv' ).is(':visible') ) 
		//{
		//	me.myDetails.hidemyDetailsPage();
		//}
		if ( $( '#pageDiv' ).is(':visible') ) 
		{
			$('#pageDiv').hide();
		}
		if ( $( '#activityDetail_FullScreen' ).is(':visible') ) 
		{
			$('#activityDetail_FullScreen').empty();
			$('#activityDetail_FullScreen').hide();
			$('#pageDiv').hide();
		}
		if ( $( '#divMsgAreaBottom' ).is(':visible') ) 
		{
			$('#divMsgAreaBottom').hide();
			$('#divMsgAreaBottomScrim').hide();
		}

		Menu.hideMenuDiv();

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
		$( '#activityListViewNav' ).hide();  // $( '.Nav2' ).hide();

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
        FormUtil.setClickSwitchEvent( iconTag, SubIconListTag, [ 'on', 'off' ] );
	};

	// ======================================

	me.newSWrefreshNotification = function()
	{
		SwManager.newSWrefreshNotification();
	};

	me.showNewAppAvailable = function( newAppFilesFound )
	{
		me.loginObj.showNewAppAvailable( newAppFilesFound );
		me.settingsApp.showNewAppAvailable( newAppFilesFound );	
	};

	// ======================================

	me.initialize();
}