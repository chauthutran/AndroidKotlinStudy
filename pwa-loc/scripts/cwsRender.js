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
	me.actionObj;

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
	};

	me.render = function()
	{
		me.loadSavedUserName();		

		me.loginObj.render(); // Open Log Form

		// Translate terms setup
		if ( me._translateEnable ) TranslationManager.loadLangTerms_NSetUpData( false );
		
		//me.afterRender();
	};

	// ------------------

	me.setInitialData = function() { };

	me.setEvents_OnInit = function()
	{		
		me.setOtherEvents();
	};

	me.createSubClasses = function()
	{
		me.loginObj = new Login( me );
		me.aboutApp = new aboutApp( me );
		me.settingsApp = new settingsApp( me );
		me.statisticsObj = new Statistics( me );
		me.banmiPage = new BanmiPage( me );
		me.actionObj = new Action( me, {} );

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

	me.getActionObj = function( blockObj )
	{
		return me.actionObj.setBlock( blockObj );
	};


	// NOTE: 'redeemList' data load after login <-- Called by login class - After Login
	me.loadActivityListData_AfterLogin = function( callBack )
	{
		// Do 'redeemList' move from localStorage to IndexedDB (localForage version)
		//  - Since we need password to encrypt the data..
		//DataVerMove.lsRedeemListMove( function() {			

		ClientDataManager.loadClientsStore_FromStorage( function() 
		{
			ActivityDataManager.regenActivityList_NIndexes();

			var fullActs = ActivityDataManager.getActivityList();

			// NEW --> on login, adjust data in DHIS2 version
			if ( ConfigManager.isSourceTypeDhis2() ) ActivityDataManager.adjustDownDHIS2Acts( fullActs );
							
			// Change the activities that did not complete -> 'Pending' to 'Failed', as app time out measure.
			ActivityDataManager.updateActivitiesStatus_ProcessingToFailed( fullActs, { saveData: false, errMsg: 'Processing activity timed out case changed to failed status.' } );

			ClientDataManager.saveCurrent_ClientsStore( () => { callBack(); });
		});
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

		me.checkNPerform_ClientDirectParam();
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

	// --------------------

	me.checkNPerform_ClientDirectParam = function()
	{			
		// If 'client' exists with 'action' 'clientDirect', try to load the client 
		var clientDirectId = App.getClientDirectId( 'action', 'client' );
	
		if ( clientDirectId ) 
		{
			if ( ConnManagerNew.isAppMode_Offline() ) MsgManager.msgAreaShowErrOpt( 'clientDirect is not available in OFFLINE.', { hideTimeMs: 5000 } );
			else
			{
				MsgManager.msgAreaShowOpt( 'ClientDirect Request Found.  Processing..',{ hideTimeMs: 2000, styles: 'background-color: blue;', group: 'clientDirect' } );

				// Delete the params val in LocalStorage
				App.delete_ParamsInLS( 'action' );
				App.delete_ParamsInLS( 'client' );

				// Create one 'action' in config?
				var actionObj = SessionManager.cwsRenderObj.getActionObj( {} );
				var actionJson = { actionType: "sendToWS", url: "/PWA.mongo_search?type=clientSearch", payloadJson: { clientId: clientDirectId }	};

				// Show Loading/Progress Msg Open...
				var tempId = 'appLoadWtClose_' + new Date().getTime(); 
				MsgFormManager.appBlockTemplateOpt( { templateId: tempId, titleName: 'Downloading Client...', closeTime: 15000 } );
		
				// Perform client search/download
				actionObj.actionPerform( actionJson, undefined, undefined, undefined, undefined, {}, {}, function( bResult, resultJson )
				{			
					MsgFormManager.appUnblock( tempId );

					var clientDownloaded = false;

					if ( bResult && resultJson && resultJson.searchResult2 && resultJson.searchResult2.length >= 1 )  //MsgManager.msgAreaShowErrOpt( 'Client for clientDirect not found.', { hideTimeMs: 5000 } );
					{
						var itemJson = resultJson.searchResult2.find( item => item._id === clientDirectId );

						if ( itemJson ) //MsgManager.msgAreaShowErrOpt( 'Client for clientDirect not found.', { hideTimeMs: 5000 } );
						{
							clientDownloaded = true;
							MsgManager.msgAreaShowOpt( 'Client Downloaded.  Merging and Opening..', { hideTimeMs: 2000, styles: 'background-color: blue;', group: 'clientDirect' } );

							var processingInfo = ActivityDataManager.createProcessingInfo_Success( Constants.status_downloaded, 'Downloaded and stored for clientDirect.' );
		
							ClientDataManager.mergeDownloadedClients( { 'clients': [ itemJson ] }, processingInfo, function() 
							{		
								me.openClientCardById( clientDirectId );
							});
						}
					}

					if ( !clientDownloaded ) MsgManager.msgAreaShowOpt( 'Client for clientDirect not found.', { hideTimeMs: 500 } );

				});
			}
		}
	};
		

	me.openClientCardById = function( clientDirectId )
	{
		try
		{
			var clientJson = ClientDataManager.getClientById( clientDirectId );

			if ( !clientJson ) throw " No ClientJson..";
			else 
			{
				var clientCardDetail = new ClientCardDetail(clientDirectId);
				clientCardDetail.render();
		
				MsgManager.msgAreaShowOpt( 'Client, ' + clientDirectId + ', Opened by ClientDirect.',{ hideTimeMs: 4000, styles: 'background-color: green;', groupCloseOthers: 'clientDirect' } );
			}
		}
		catch( errMsg )
		{
			MsgManager.msgAreaShowErrOpt( 'FAILED on opening client, ' + clientDirectId + ', for ClientDirect, ' + errMsg );			
			console.log( 'FAILED on CwsRender.openClientCardById, ' + errMsg );
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
		BahmniService.syncDataProcessing = false;		

		SessionManager.setLoginStatus( false );
		SessionManager.unloadSessionData_nConfigJson(); // Include config json unload

		AppInfoManager.unloadData_AfterLogOut();
		
		// NEW: Remove/Clear all the data <-- index, clientList, etc..
		ClientDataManager.clearClientDataInMem();
		ActivityDataManager.clearActivityDataInMem();
		
		ScheduleManager.stopSchedules_AfterLogOut();


		me.logOutUI();
		
		if( KeycloakManager.isKeyCloakInUse() )
		{
			KeycloakManager.keycloakPart();
		}
		else
		{
			// JobAid iFrame close if currently on open state
			me.jobAid_iFrameClose_WtMsg();

			SwManager.checkAppUpdate( '[AppUpdateCheck] - logOutProcess', { noMinTimeSkip: true } );
			
			SwManager.refreshForNewAppFile_IfAvailable();  // even on offline
		}

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