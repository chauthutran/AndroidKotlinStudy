// -------------------------------------------
// -- CwS Render Class/Methods
function cwsRender()
{
	var me = this;

	// Fixed variables
	me.dsConfigLoc = 'data/dsConfig.json';	// 

	// Tags
	me.renderBlockTag = $( '#renderBlock' );
	//me.divAppModeConnStatusTag = $( '#divAppModeConnStatus' );
	//me.imgAppDataSyncStatusTag = $( '#imgAppDataSyncStatus' );
	me.navDrawerDivTag = $( '#navDrawerDiv' );
	//me.menuTopRightIconTag = $( '#menu_e' );
	me.menuAppMenuIconTag = $( '#nav-toggle' );

	// This get cloned..  Thus, we should use it as icon class name?
	me.floatListMenuIconTag =  $( '.floatListMenuIcon' );
	me.floatListMenuSubIconsTag = $( '.floatListMenuSubIcons' );

	me.loggedInDivTag = $( '#loggedInDiv' );
	me.headerLogoTag = $( '.headerLogo' );
	me.pulsatingProgress = $( '#pulsatingCircle' );

	// global variables
	me.configJson;
	me.areaList = [];
	me.manifest;
	me.favIconsObj;
	me.aboutApp;
	me.registrationObj;
	me.loginObj;
	me.langTermObj;
	//me.enableThemedColorSchemes = false;


	me.storageName_RedeemList = "redeemList";
    me.status_redeem_submit = "submit"; // initialize from dcd@XX ?
    me.status_redeem_queued = "queued"; // initialize from dcd@XX ?
	me.status_redeem_failed = "failed"; // initialize from dcd@XX ?

	me.storage_offline_ItemNetworkAttemptLimit = 3; //number of times sync-attempt allowed per redeemItem (with failure/error) before blocking new 'sync' attempts
    me.storage_offline_SyncTimerAutomationRun = 60000; // make 60 seconds?
    me.storage_offline_SyncTimerConditionsCheck = 10000; // make 10 seconds?

	me._globalMsg = "";
	me._globalJsonData = undefined;

	// Create separate class for this?
	me.blocks = {};	// "blockId": blockObj..
	
	me._localConfigUse = false;
	//me.syncManager;
 
	me._translateEnable = true;

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
		var initializeStartBlock = false;
		// Check 'Local Data'.  If 'stayLoggedIn' were previously set to true, load saved info.
		if ( localStorage.length )
		{
			var lastSession = JSON.parse( localStorage.getItem('session') );

			if ( lastSession )
			{
				var loginData = JSON.parse( localStorage.getItem(lastSession.user) );

				if ( loginData && loginData.mySession && loginData.mySession.stayLoggedIn ) 
				{
					initializeStartBlock = true;
				}
			
			}

		}

		// If set to use saved data loading, set up the neccessary data
		if ( initializeStartBlock )
		{
			me.renderDefaultTheme();
			me.loginObj.loginFormDivTag.hide();
			me.loginObj._userName = lastSession.user;
			FormUtil.login_UserName = lastSession.user;
			FormUtil.login_Password = Util.decrypt ( loginData.mySession.pin, 4);
			me.loginObj.loginSuccessProcess( loginData );
		}
		else
		{
			// If 'initializeStartBlock' case, open the Login form.
			me.loginObj.loginFormDivTag.show();
			me.loginObj.render(); // Open Log Form
		}

		$( '#loginImg' ).click( function() {
			if ( localStorage.getItem('session') )
			{
				var lastSession = JSON.parse( localStorage.getItem('session') );
				if ( JSON.parse( localStorage.getItem(lastSession.user) ) )
				{
					localStorage.removeItem( 'session' );
					localStorage.removeItem( lastSession.user );
				}

			}
			
			me.reGetAppShell();
		});

		//var inputUtilFocRel = inputMonitor( '#focusRelegator' ); //detect swipe for android
		//var inputUtilMenu = inputMonitor( '#navDrawerDiv' ); //detect swipe for android
		//var inputUtilMenu = inputMonitor( '#pageDiv' ); //detect swipe for android

		var manageInputSwipe = inputMonitor( me );

		if ( me._translateEnable ) me.retrieveAndSetUpTranslate();

	}

	me.retrieveAndSetUpTranslate = function()
	{
		var defaultLangCode = FormUtil.defaultLanguage(); //"pt";

		// NOTE: Try language download here.
		
		me.langTermObj.retrieveAllLangTerm( function( allLangTerms ) 
		{
			if ( allLangTerms )
			{
				// Enable the language switch dropdown
				me.aboutApp.populateLangList_Show( me.langTermObj.getLangList(), defaultLangCode );

				// Translate current page
				me.langTermObj.translatePage();
			}
		});
	}

	// ------------------

	me.setInitialData = function()
	{
		me.manifest = FormUtil.getManifest();
	}

	me.setEvents_OnInit = function()
	{		
		// Set Body vs Set Header..
		me.setPageHeaderEvents();
	}

	me.createSubClasses = function()
	{
		me.langTermObj = new LangTerm( me );
		me.loginObj = new Login( me );
		me.aboutApp = new aboutApp( me, me.langTermObj );
	}

	// =============================================


	// =============================================
	// === EVENT HANDLER METHODS ===================

	me.setPageHeaderEvents = function()
	{
		// Connection manual change click event: ask first and manually change it.
		/*me.divAppModeConnStatusTag.click( function() {
			ConnManager.change_AppConnMode( "switch" );
			return false;
		});*/

		me.configureMobileMenuIcon();
		
	}

	// -------------------------

	me.setupMenuTagClick = function( menuTag )
	{
		menuTag.click( function() {

			var clicked_areaId = $( this ).attr( 'areaId' );
			var clicked_area = Util.getFromList( me.areaList, clicked_areaId, "id" );

			me.pulsatingProgress.hide();
			$( '#divProgressBar' ).hide();
			$( '#focusRelegator' ).hide();
			$( '#aboutFormDiv' ).hide();

			// if menu is clicked,
			// reload the block refresh?
			if ( clicked_area.startBlockName )
			{
				// added by Greg (2018/12/10)
				if ( !$( 'div.mainDiv' ).is( ":visible" ) )  $( 'div.mainDiv' ).show();

				var startBlockObj = new Block( me, me.configJson.definitionBlocks[ clicked_area.startBlockName ], clicked_area.startBlockName, me.renderBlockTag );
				startBlockObj.render();  // should been done/rendered automatically?

				// Change start area mark based on last user info..
				me.trackUserLocation( clicked_area );

			}
			else
			{
				if (clicked_areaId === 'logOut')
				{

					// TODO: CREATE 'SESSION' CLASS TO PUT THESE...
					// set Log off
					var lastSession = JSON.parse( localStorage.getItem('session') );

					if (lastSession)
					{
						var loginData = JSON.parse( localStorage.getItem(lastSession.user) );

						if ( loginData.mySession && loginData.mySession.stayLoggedIn ) 
						{
							loginData.mySession.stayLoggedIn = false;
							localStorage[ lastSession.user ] = JSON.stringify( loginData )
						}
					}

					me.loginObj.spanOuNameTag.text( '' );
					me.loginObj.spanOuNameTag.hide();
					FormUtil.undoLogin();
					me.renderDefaultTheme();
					me.loginObj.openForm();

				}
				else if ( clicked_areaId === 'aboutPage')
				{

					// ?? Why render if only clicked??
					// ?? Render everytime it is clicked??

					me.aboutApp.render();
				}
			}

			// hide the menu div if open
			me.hidenavDrawerDiv();
			$( '#focusRelegator' ).hide();

		});
	}


	// TODO: CREATE 'SESSION' CLASS TO PUT THESE...
	me.trackUserLocation = function( clicked_area )
	{
		var lastSession = JSON.parse( localStorage.getItem('session') );
		var thisNetworkMode = ( ConnManager.getAppConnMode_Online() ? 'online' : 'offline' );
		var altNetworkMode = ( ConnManager.getAppConnMode_Online() ? 'offline' : 'online' );
		var matchOn = [ "id", "startBlockName", "name" ];
		var matchedOn, areaMatched;

		if (lastSession)
		{
			var loginData = JSON.parse( localStorage.getItem( lastSession.user ) );

			if (loginData)
			{
				for ( var i = 0; i < loginData.dcdConfig.areas[thisNetworkMode].length; i++ )
				{
					loginData.dcdConfig.areas[thisNetworkMode][i].startArea = false;

					if ( clicked_area.id == loginData.dcdConfig.areas[thisNetworkMode][i].id )
					{
						loginData.dcdConfig.areas[thisNetworkMode][i].startArea = true;

						// test if altNetworkMode value exists for current selected area and update to equivalent of 'lastActive' > startArea
						// test on available matchOn values
						/* GREG: MORE TESTING TO BE DONE 
						for ( var m = 0; m < matchOn.length; m++ )
						{
							for ( var n = 0; n < loginData.dcdConfig.areas[altNetworkMode].length; n++ )
							{
								// check if properties exist on both off+online areas
								if ( loginData.dcdConfig.areas[altNetworkMode][n][matchOn[m]] && loginData.dcdConfig.areas[thisNetworkMode][i][matchOn[m]] )
								{
									if ( loginData.dcdConfig.areas[altNetworkMode][n][matchOn[m]] == loginData.dcdConfig.areas[thisNetworkMode][i][matchOn[m]] )
									{
										matchedOn = matchOn[m];
										areaMatched = n;
										loginData.dcdConfig.areas[altNetworkMode][n].startArea = true;

									}
								}
							}
						}
						// 'reset' (deactivate) all other selectable areas 
						for ( var n = 0; n < loginData.dcdConfig.areas[altNetworkMode].length; n++ )
						{
							if ( loginData.dcdConfig.areas[altNetworkMode][areaMatched][matchedOn] != loginData.dcdConfig.areas[altNetworkMode][n][matchedOn] )
							{
								loginData.dcdConfig.areas[altNetworkMode][n].startArea = false;
							}
						} */

					}

				}
	
				//UPDATE lastStorage session for current user (based on last menu selection)
				localStorage[ lastSession.user ] = JSON.stringify( loginData )
	
			}
		}
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
	// =============================================


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========
	
	me.renderArea = function( areaId )
	{
		// should close current tag/content?
		if (areaId === 'logOut')
		{
			me.loginObj.openForm();

			// hide the menu div if open
			me.hidenavDrawerDiv();			
		}
		else
		{  
			me.areaList = ConfigUtil.getAllAreaList( me.configJson );
		
			var selectedArea = Util.getFromList( me.areaList, areaId, "id" );
	
			// if menu is clicked,
			// reload the block refresh?
			if ( selectedArea.startBlockName )
			{
				var startBlockObj = new Block( me, me.configJson.definitionBlocks[ selectedArea.startBlockName ], selectedArea.startBlockName, me.renderBlockTag );
				startBlockObj.render();  // should been done/rendered automatically?  			
			}
		}
	}

	me.renderBlock = function( blockName, options )
	{
		if ( options )
		{
			console.log('options: ' + JSON.stringify( options ));
			var blockObj = new Block( me, me.configJson.definitionBlocks[ blockName ], blockName, me.renderBlockTag, undefined, options );
		}
		else
		{
			var blockObj = new Block( me, me.configJson.definitionBlocks[ blockName ], blockName, me.renderBlockTag );
		}

		blockObj.render();  // should been done/rendered automatically?  			

		return blockObj;
	}

	// --------------------------------------
	// -- START POINT (FROM LOGIN) METHODS
	me.startWithConfigLoad = function( configJson )
	{
		if ( me._localConfigUse )
		{
			ConfigUtil.getDsConfigJson( me.dsConfigLoc, function( success, configDataFile ) {

				//console.log( 'local config' );

				me.configJson = configDataFile;
				ConfigUtil.setConfigJson( me.configJson );

				me.startBlockExecute( me.configJson );
			});		
		}
		else
		{
			//console.log( 'network config' );

			me.configJson = configJson;
			ConfigUtil.setConfigJson( me.configJson );

			me.startBlockExecute( me.configJson );
		}

	}

	me.startBlockExecute = function( configJson )
	{
		//console.log( configJson );
		me.areaList = ConfigUtil.getAreaListByStatus( ConnManager.getAppConnMode_Online(), configJson );

		if ( me.areaList )
		{
			// TODO: MOVE THIS TO 'MENU' STATIC CLASS..

		  	// Greg added: 2018/11/23 -- 'logOut' check
			if (JSON.stringify(me.areaList).indexOf('logOut') < 0 )
			{
				// 
				/*var newMenuData = { id: "about", name: "About" };
				me.areaList.push ( newMenuData );*/
				var newMenuData = { id: "logOut", name: "Log out" };
				me.areaList.push ( newMenuData );
			}

			var startMenuTag = me.populateMenuList( me.areaList );

			if ( startMenuTag ) startMenuTag.click();

			
			// initialise favIcons
			me.favIconsObj = new favIcons( me );

			//me.renderDefaultTheme();

		}
	} 

	// Call 'startBlockExecute' again with in memory 'configJson' - Called from 'ConnectionManager'
	me.startBlockExecuteAgain = function()
	{
		//me.startBlockExecute( me.configJson );
		me.startBlockExecute ( JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem('session') ).user ) ).dcdConfig );
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

		if ( !localStorage.getItem('session') )
		{
			return;
		}

		$( '#divNavDrawerOUlongName' ).html( JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem('session') ).user ) ).orgUnitData.orgUnit.name );

		var myData = FormUtil.getMyListData( me.storageName_RedeemList );

		if ( myData )
		{
			var mySubmit = myData.filter( a=>a.status == me.status_redeem_submit );
			var myQueue = myData.filter( a=>a.status == me.status_redeem_queued );
			var myFailed = myData.filter( a=>a.status == me.status_redeem_failed && (!a.networkAttempt || a.networkAttempt < me.storage_offline_ItemNetworkAttemptLimit) );
			
			$( '#divNavDrawerSummaryData' ).html ( 'redeemed Confirmed: ' + mySubmit.length + ( ( parseFloat( myQueue.length) + parseFloat( myFailed.length ) ) ? ' (offline: ' + ( parseFloat( myQueue.length) + parseFloat( myFailed.length ) ) + ')' : '') );
		} 
		else 
		{
			//$( '#divNavDrawerSummaryData' ).html ( 'offline Data : ' + 0 );
			$( '#divNavDrawerSummaryData' ).html ( 'redeemed Confirmed: 0 ' );
		}
	}

	me.populateMenuList = function( areaList )
	{
		var startMenuTag;

		$( '#navDrawerDiv' ).empty();

		// clear the list first
		me.navDrawerDivTag.find( 'div.menu-mobile-row' ).remove();

		var navMenuHead = $( '<div style="width:100%;height:100px;margin:0;padding:0;border-radius:0;border-bottom:1px solid rgb(0, 0, 0, 0.1)" class="tb-content-buttom" />' );
		var navMenuTbl = $( '<table id="navDrawerHeader" />' );
		var tr = $( '<tr />' );
		var tdLeft = $( '<td style="padding:10px;width:56px;" />' );
		var tdRight = $( '<td  style="padding:2px 0 0 0;height:75px;" />' );

		me.navDrawerDivTag.append ( navMenuHead );
		navMenuHead.append ( navMenuTbl );
		navMenuTbl.append ( tr );
		tr.append ( tdLeft );
		tr.append ( tdRight );

		var navMenuLogo = $( '<img src="img/logo_top.svg" />' );

		tdLeft.append ( navMenuLogo );
		tdRight.append ( $( '<div id="divNavDrawerOUName" class="navMenuHeader" style="font-size:.8rem;font-weight:400;text-align:left;">' + JSON.parse( localStorage.getItem('session') ).user + '</div>') );
		tdRight.append ( $( '<div id="divNavDrawerOUlongName" class="navMenuHeader" style="font-size:.8rem;font-weight:400;text-align:left;" />' ) );

		var tr = $( '<tr />' );
		var td = $( '<td colspan=2 style="height:20px;" />' );

		navMenuTbl.append ( tr );
		tr.append ( td );
		td.append ( $( '<div id="divNavDrawerSummaryData" class="navMenuHeader" style="position:relative;top:-5px;padding: 0 0 0 20px; font-size:.8rem;font-weight:400;text-align:left;justify-content:normal;background-Color:transparent" />') );

		// Add the menu rows
		if ( areaList )
		{
			for ( var i = 0; i < areaList.length; i++ )
			{
				var area = areaList[i];

				var menuTag = $( '<div class="menu-mobile-row" areaId="' + area.id + '"><div>' + area.name + '</div></div>' );

				me.setupMenuTagClick( menuTag );

				me.navDrawerDivTag.append( menuTag );

				if ( area.startArea ) startMenuTag = menuTag;
			}	
		}

		me.renderDefaultTheme(); // after switching between offline/online theme defaults not taking effect

		return startMenuTag;
	}

	me.setRegistrationObject = function( registrationObj )
	{
		me.registrationObj = registrationObj;
	}

	me.reGetAppShell = function()
	{
		//$( '#swRefresh2' ).click();
		if ( me.registrationObj !== undefined )
		{
			console.log ( 'reloading + unregistering SW');
			me.registrationObj.unregister().then(function(boolean) {
				location.reload(true);
				FormUtil.hideProgressBar();
			});
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
			$( '#divNavDrawerOUName' ).css( 'background-color', defTheme.navTop.colors.background );
			$( '#divNavDrawerOUlongName' ).css( 'background-color', defTheme.navTop.colors.background );
			$( '#divNavDrawerOUName' ).css( 'color', defTheme.navTop.colors.foreground );
			$( '#divNavDrawerOUlongName' ).css( 'color', defTheme.navTop.colors.foreground );
			$( '#divNavDrawerSummaryData' ).css( 'color', defTheme.navTop.colors.foreground );
			$( 'div.bg-color-program-son' ).css( 'background-color', defTheme.navMiddle.colors.background );
			$( '#navDrawerHeader' ).css( 'background-color', defTheme.navTop.colors.background );
			$( '#navDrawerHeader' ).css( 'color', defTheme.navTop.colors.foreground );
			$( 'div.menu-mobile' ).css( 'background-color', defTheme.navDrawer.colors.background );
			$( 'div.menu-mobile-row' ).css( 'background-color', defTheme.navDrawer.colors.background );
			$( 'div.menu-mobile-row' ).css( 'color', defTheme.navDrawer.colors.foreground );


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

	// ======================================

	me.initialize();
}