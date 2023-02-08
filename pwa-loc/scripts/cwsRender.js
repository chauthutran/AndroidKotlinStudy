// -------------------------------------------
// -- CwS Render Class/Methods
function cwsRender()
{
	var me = this;

	// Tags
	me.pageDivTag = $( '#pageDiv' );
	me.pulsatingProgress = $( '#pulsatingDots' );
	me.Nav1Tag = $( '#Nav1' );
	me.Nav2Tag = $( '#Nav2' );

	
	// global variables
	//me.configJson;
	me.manifest;
	me.aboutApp;
	me.settingsApp;
	me.statisticsObj;
	me.registrationObj;
	me.loginObj;
	me.chatAppObj;
	me.banmiPage;
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

		// Translate terms setup
		if ( me._translateEnable ) TranslationManager.loadLangTerms_NSetUpData( false );
		
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
		me.statisticsObj = new Statistics( me );
		me.banmiPage = new BanmiPage( me );
		
		// This probably gets used for menu swipe?
		me._manageInputSwipe = new inputMonitor( me );
	};
	// =============================================

	// =============================================
	// === EVENT HANDLER METHODS ===================

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
	me.replacePageTitle = function( displayText, termId )
	{
		// these items show up full-screen (sheet_full-fs)
		$( 'div.Nav__Title' ).html( '<span term=' + termId + '>' + displayText + '</span>' );
	};
	// =============================================

	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========


	// NOTE: 'redeemList' data load after login <-- Called by login class - After Login
	me.loadActivityListData_AfterLogin = function( callBack )
	{
		// Do 'redeemList' move from localStorage to IndexedDB (localForage version)
		//  - Since we need password to encrypt the data..
		//DataVerMove.lsRedeemListMove( function() {			

		ClientDataManager.loadClientsStore_FromStorage( function() {

			ActivityDataManager.regenActivityList_NIndexes();

			// NEW --> on login, adjust data in DHIS2 version
			if ( ConfigManager.isSourceTypeDhis2() ) ActivityDataManager.getActivityList().forEach( act => {  ActivityDataManager.adjustDownloadedActivity( act );  });

			// Change the activities that did not complete -> 'Pending' to 'Failed', as app time out measure.
			ActivityDataManager.updateActivitiesStatus_ProcessingToFailed( ActivityDataManager.getActivityList(), { saveData: false } );

			ClientDataManager.saveCurrent_ClientsStore( () => {
				callBack();
			});
		});
		//});
	};

	me.renderArea1st = function() 
	{
		var areaList = ConfigManager.getAllAreaList();

		if ( areaList.length > 0 ) me.renderArea( areaList[0].id );
		else console.log( 'ERROR in CwsRender.renderArea1st, areaList is empty.' );
	};

	me.renderArea = function( areaId )
	{
		// Clear All Previous Msgs..
		MsgManager.msgAreaClearAll();

		// Clear blockPayload remember data.
		SessionManager.clearWSBlockFormsJson();

		// Hide Area Related?
		me.hideAreaRelatedParts();

		if ( areaId )
		{
			// gAnalytics Page Hit
			GAnalytics.setSendPageView( '/' + areaId );
			GAnalytics.setEvent( 'AreaOpen', areaId, 'menu clicked', 1 );

			if ( areaId === 'logOut' ) { me.resetPageDivContent();  me.logOutProcess(); }
			else if ( areaId === 'aboutPage') me.aboutApp.render();
			else if ( areaId === 'banmi') {
				me.banmiPage.render();
			}
			else if ( areaId === 'settingsPage') me.settingsApp.render();
			else if ( areaId === 'statisticsPage') me.statisticsObj.render();
			else if ( areaId === Menu.menuJson_JobAids.id ) 
			{ 
				if ( $( '#loginFormDiv' ).is( ":visible" ) ) $( '#loginFormDiv' ).hide();

				if ( ConfigManager.getJobAidSetting().newDesign ) JobAidPage.render();
				else
				{
					var styleStr = ' style="width:100%; height: 100%; overflow:auto; border:none;"';
					$( '#divJobAid' ).html( '' ).show().append( '<iframe class="jobAidIFrame" src="' + JobAidHelper.jobAid_startPagePath + '" ' 
					+ styleStr + '>iframe not compatible..</iframe>' ); 
				}
			}
			else if ( areaId === Menu.menuJson_Chat.id ) 
			{ 
				if ( $( '#loginFormDiv' ).is( ":visible" ) ) $( '#loginFormDiv' ).hide();

				var chatUserName = ( INFO.chatUserName ) ? INFO.chatUserName:  INFO.login_UserName; // '+447897018987';
		
				me.chatAppObj = new ChatApp( chatUserName );				
			}
			// [REPORT]
			else if ( areaId === Menu.menuJson_Report.id ) 
			{ 
				if ( $( '#loginFormDiv' ).is( ":visible" ) ) $( '#loginFormDiv' ).hide();

				ReportPage.render( areaId );
			}
			else if ( areaId === Menu.menuJson_Report2.id ) 
			{ 
				if ( $( '#loginFormDiv' ).is( ":visible" ) ) $( '#loginFormDiv' ).hide();

				ReportDetailsListPage.render( areaId );
			}
			else if ( areaId === Menu.menuJson_HNQIS_RDQA.id ) {  }
			else
			{
				// Dynamic area ones reset/hide main divTag before rendering..  // me.pageDivTag.empty();  me.Nav2Tag.hide();	
				me.resetPageDivContent();


				if ( !me.pageDivTag.is( ':visible' ) ) me.pageDivTag.show();

				var selectedArea = Util.getFromList( ConfigManager.getAllAreaList(), areaId, "id" );

				// TODO: ACTIVITY ADDING
				ActivityUtil.addAsActivity( 'area', selectedArea, areaId );

				// if menu is clicked, reload the block refresh?
				if ( selectedArea && selectedArea.startBlockName )
				{
					var options = ( selectedArea.viewSelect ) ? { viewSelect: selectedArea.viewSelect }: {};
					FormUtil.renderBlockByBlockId( selectedArea.startBlockName, me, me.pageDivTag, undefined, options );
				}
			}
		}
		else console.log( 'ERROR - areaId on CwsRender.renderArea is emtpy' );

	};

	// Used by FavIconClick..  - this also switches area?
	// This is similar to calling 'renderArea()', which we might need to combine..
	me.renderFavItemBlock = function( blockName, options, parentDiv, favItem )
	{
		favItem = ( favItem ) ? favItem: {};
		//favItem.name, favItem.term

		parentDiv = ( parentDiv ) ? parentDiv: me.pageDivTag;
		GAnalytics.setEvent( 'FavOpen', Util.getStr( favItem.name ), 'fav clicked', 1 );

		// Clear blockPayload remember data.
		SessionManager.clearWSBlockFormsJson();


		// If 'fullScreen' cases (compare to some div)
		if ( parentDiv === me.pageDivTag )
		{
			// On each area render, clear out the pageDiv content (which represent area div)..
			me.resetPageDivContent();
			me.replacePageTitle( favItem.name, favItem.term );
		}

		var blockObj = FormUtil.renderBlockByBlockId( blockName, me, parentDiv, undefined, options );

		return blockObj;
	};


	// --------------------------------------
	// -- START POINT (FROM LOGIN) METHODS
	me.startWithConfigLoad = function( runAfterFunc )
	{
		me.startBlockExecute( runAfterFunc );
	};

	me.startBlockExecute = function( runAfterFunc ) //initializationInstructions )
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

					// SHOW Error activity list msg ( New errored list count )
					me.checkErrActivityList( function( errActList ) 
					{						
						MsgFormManager.showErrActivityMsg( me.Nav2Tag, errActList );
					});

					// If there is a function to run after 'startBlockExecute', run it here.
					if ( runAfterFunc ) runAfterFunc();
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
	me.appModeSwitch_UIChanges = function()
	{
		// Menu relist based on online/offline
		Menu.refreshMenuItems();

		// If fav is currently shown on current div.. (How to tell?)
		$( 'div.favReRender' ).click();
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

	// ----------------------------------------------
	// ----------- Render called method -------------

	me.loadSavedUserName = function()
	{
		// TODO: Use Session Manager?
		// TODO: MOVE THIS TO login page..
		var loginUserNameH4Tag = $( '#loginUserNameH4' );

		loginUserNameH4Tag.hide();

		var userName = AppInfoLSManager.getUserName();

		if ( userName )
		{
			// Div (Input) part of Login UserName
			$( '#loginField' ).hide();

			// input parts..  Below will be hidden, though...
			$( 'input.loginUserName' ).val( userName );	
			$( 'input.loginUserName' ).attr( 'readonly',true );

			// Display login name as Big text part - if we already have user..
			loginUserNameH4Tag.text( userName ).show();
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
		SessionManager.unloadSessionData_nConfigJson(); // Include config json unload

		AppInfoManager.unloadData_AfterLogOut();
		
		// NEW: Remove/Clear all the data <-- index, clientList, etc..
		ClientDataManager.clearClientDataInMem();
		ActivityDataManager.clearActivityDataInMem();
		
		ScheduleManager.stopSchedules_AfterLogOut();

		me.logOutUI();

		// JobAid iFrame close if currently on open state
		me.jobAid_iFrameClose_WtMsg();

		SwManager.checkAppUpdate( '[AppUpdateCheck] - logOutProcess', { noMinTimeSkip: true } );
				
		SwManager.refreshForNewAppFile_IfAvailable();  // even on offline
	};

	me.logOutUI = function()
	{
		$( 'div.Nav__Title').html( '' );

		me.clearMenuPlaceholders();
		Menu.navDrawerDivTag.empty();

		$( '.btnBack' ).click();  // Cloase all sheetFull pages..

		//  Do we need to do this?
		me.hideActiveSession_UIcontent(); // should be placed in 'hidePageDiv'?

		me.loginObj.openForm();  // includes 'hidePageDiv' which called .btnBack for hiding fullscreen overlay ones
	};

	me.jobAid_iFrameClose_WtMsg = function()
	{
		try
		{			
			// JobAid iFrame close
			if ( $( '#divJobAid.iframeDiv' ).is( ':visible' ) ) 
			{ 
				var alertMsg = 'WFA logging out due to inactivity';

				try {  alertMsg += ' of ' + ConfigManager.staticData.logoutDelay + ' min';  }
				catch ( errMsg ) {  console.log( 'ERROR in jobAid_iFrameClose_WtMsg with msg string, ' + errMsg );  }
				
				alert( alertMsg ); 
				$( '#divJobAid' ).html( '' ).hide(); 
			}
		}
		catch( errMsg )
		{
			console.log( 'ERROR in cwsRender.jobAid_iFrameClose, ' + errMsg );
		}
	};

	// NOTE: Not the way to do.  Should organize all these in one and hide it...
	me.hideActiveSession_UIcontent = function()
	{
		// QUICK FIX - Hide 'about/setting/statistic' pages..
		$( '.subMenu_PageDiv' ).hide();

		// hide UI Areas
		if ( $( 'div.aboutListDiv' ).is(':visible') ) me.aboutApp.hideAboutPage();

		if ( me.statisticsObj.statisticsFormDiv.is(':visible') ) me.statisticsObj.hideStatsPage();

		if ( $( 'div.settingsListDiv' ).is(':visible') ) me.settingsApp.hideSettingsPage();

		if ( me.pageDivTag.is(':visible') ) me.pageDivTag.hide();

		if ( $( '#divMsgAreaBottom' ).is(':visible') ) 
		{
			$('#divMsgAreaBottom').hide();
			$('#divMsgAreaBottomScrim').hide();
		}

		Menu.hideMenuDiv();

		// hide control Popups
		if ( $( '#dialog_searchOptions' ).is(':visible') ) $( '#dialog_searchOptions' ).remove();
		if ( $( '#mddtp-picker__date' ).is(':visible') ) $( '#mddtp-picker__date' ).hide();
		if ( $( '.inputFieldYear' ).is(':visible') ) $( '.inputFieldYear' ).hide();
		if ( $( '.scrim' ).is(':visible') ) $('.scrim').hide();
		FormUtil.emptySheetBottomTag(); // SheetBottom div hiding()
		FormUtil.unblockPage();	// scrim unblock - just in case - same as .scrim hide


		// hide navBar items
		me.Nav1Tag.hide();
		me.Nav2Tag.hide();
	};


	me.clearMenuPlaceholders = function()
	{
		$( 'div.navigation__user' ).html( '' );
		$( 'div.Nav__Title' ).html( '' );
		//$( '#divNavDrawerSummaryData' ).html( '' );
	};

	// ======================================

	me.hidePageDiv = function()
	{
		// Hide non login related tags..
		me.Nav1Tag.hide();
		me.pageDivTag.hide();	
		
		// TODO: Hide all the overlap full screen by clicking backbutton..?  or simply hiding them?
		// $( 'div.sheet_full-fs' ).remove();  // <-- ALSO REMOVE NON-TEMPORARY ONES..
		$( '.btnBack' ).click();
	};
	
	me.showPageDiv = function()
	{
		me.pageDivTag.show( 'fast' );
		me.Nav1Tag.css( 'display', 'flex' );			
	};

	me.resetPageDivContent = function()
	{
		// On each area render, clear out the pageDiv content (which represent area div)..
		me.pageDivTag.empty();
		me.Nav2Tag.hide();		
	};	

	// ----------------------------------

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