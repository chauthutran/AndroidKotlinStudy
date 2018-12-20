// -------------------------------------------
// -- CwS Render Class/Methods
function cwsRender()
{
	var me = this;

	// Fixed variables
	me.dsConfigLoc = 'data/dsConfig.json';	// 

	// Tags
	me.renderBlockTag = $( '#renderBlock' );
	me.divAppModeConnStatusTag = $( '#divAppModeConnStatus' );
	me.menuDivTag = $( '#menuDiv' );
	//me.menuTopRightIconTag = $( '#menu_e' );
	me.menuAppMenuIconTag = $( '#nav-toggle' );

	// This get cloned..  Thus, we should use it as icon class name?
	me.floatListMenuIconTag =  $( '.floatListMenuIcon' );
	me.floatListMenuSubIconsTag = $( '.floatListMenuSubIcons' );

	me.loggedInDivTag = $( '#loggedInDiv' );
	me.headerLogoTag = $( '.headerLogo' );

	// global variables
	me.configJson;
	me.areaList = [];
	me.manifest;
	me.favIconsObj;
	me.aboutApp;
	me.registrationObj;
	me.enableCustomColors = true;


	me.storageName_RedeemList = "redeemList";
	me._globalMsg = "";
	me._globalJsonData = undefined;

	// Create separate class for this?
	me.blockData = {};	// "blockId": { "formData": [], "returnData?": {}, "otherAddedData": {} }

	//me.blockObj;
	me.LoginObj;

	me._localConfigUse = false;

	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function()
	{
		me.createSubClasses();

		me.setEvents_OnInit();

		me.setDefaults();
	}

	me.render = function()
	{
		/* START > Greg added: 2018/11/23 */
		var initializeStartBlock = true;

		if ( localStorage.length )
		{
			var lastSession = JSON.parse( localStorage.getItem('session') );
			
			if ( lastSession )
			{
				var loginData = JSON.parse( localStorage.getItem(lastSession.user) );

				if ( loginData && loginData.mySession && loginData.mySession.stayLoggedIn ) 
				{
					initializeStartBlock = false;
					me.renderDefaultTheme();
				}
			}

		}

		if ( !initializeStartBlock )
		{
			me.LoginObj.loginFormDivTag.hide();
			me.LoginObj._userName = lastSession.user;
			FormUtil.login_UserName = lastSession.user;
			FormUtil.login_Password = Util.decrypt ( loginData.mySession.pin, 4);
			me.LoginObj.loginSuccessProcess( loginData );
		}
		else
		{
			me.LoginObj.loginFormDivTag.show();
			me.LoginObj.render(); // Open Log Form
		}

		/* END > Greg added: 2018/11/23 */

	}

	// ------------------

	me.createSubClasses = function()
	{
		me.LoginObj = new Login( me );
		me.aboutApp = new aboutApp( me );
	}

	me.setEvents_OnInit = function()
	{		
		// Set Body vs Set Header..
		me.setPageHeaderEvents();
	}

	me.setDefaults = function()
	{
		me.manifest = FormUtil.getManifest();
	}
	// =============================================


	// =============================================
	// === EVENT HANDLER METHODS ===================
	
	me.setPageHeaderEvents = function()
	{
		// Connection manual change click event: ask first and manually change it.
		me.divAppModeConnStatusTag.click( function() {
			ConnManager.change_AppConnMode( "switch" );
			return false;
		});

		// menu click handler
		//me.setTopRightMenuClick();

		// loggedIn Name Link Click Event - opens Login Form > DISABLED by Greg 2018/12/26 (as per Bruno's request)
		/*me.loggedInDivTag.click( function() {
			// hide menuDiv if visible (when logging out)
			if ( me.menuDivTag.is( ":visible" ) && me.menuTopRightIconTag.is( ":visible" ) )
			{
				me.menuTopRightIconTag.click();
			}
			me.LoginObj.openForm();
		});*/

		
		me.configureMobileMenuIcon();
		
	}

	// -------------------------

	me.setupMenuTagClick = function( menuTag )
	{
		menuTag.click( function() {

			var clicked_areaId = $( this ).attr( 'areaId' );

			var clicked_area = Util.getFromList( me.areaList, clicked_areaId, "id" );
	
			// if menu is clicked,
			// reload the block refresh?
			if ( clicked_area.startBlockName )
			{
				// added by Greg (2018/12/10)
				if ( !$( 'div.mainDiv' ).is( ":visible" ) )
				{
					$( 'div.mainDiv' ).show();
				}

				if ( $( '#aboutFormDiv' ).is( ":visible" ) )
				{
					$( '#aboutFormDiv' ).hide();
				}


				var startBlockObj = new Block( me, me.configJson.definitionBlocks[ clicked_area.startBlockName ], clicked_area.startBlockName, me.renderBlockTag );
				startBlockObj.renderBlock();  // should been done/rendered automatically?

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

					me.LoginObj.spanOuNameTag.text( '' );
					me.LoginObj.spanOuNameTag.hide();
					me.renderDefaultTheme();
					me.LoginObj.openForm();

				}
				else if ( clicked_areaId === 'aboutPage')
				{
					me.aboutApp.render();
				}
			}

			// hide the menu div if open
			me.hideMenuDiv();
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

	me.hideMenuDiv = function()
	{
		// hide the menu
		if ( me.menuDivTag.is( ":visible" ) )
		{
			me.menuAppMenuIconTag.click();
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
			me.LoginObj.openForm();

			// hide the menu div if open
			me.hideMenuDiv();			
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
				startBlockObj.renderBlock();  // should been done/rendered automatically?  			
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

		blockObj.renderBlock();  // should been done/rendered automatically?  			

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
		me.areaList = ConfigUtil.getAreaListByStatus( ConnManager.getAppConnMode_Online(), configJson );

		if ( me.areaList )
		{
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

		}
	} 

	// Call 'startBlockExecute' again with in memory 'configJson' - Called from 'ConnectionManager'
	me.startBlockExecuteAgain = function()
	{
		//me.startBlockExecute( me.configJson );
		me.startBlockExecute ( JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem('session') ).user ) ) );
	}

	// ----------------------------------

	
	me.configureMobileMenuIcon = function()
	{
		var destArea = $( 'div.headerLogo');

		if ( destArea )
		{
			//destArea.empty();

			//me.menuAppMenuIconTag.show();

			//me.navBurgerTag = dvMenuObj;

			document.querySelector( "#nav-toggle" )
			 .addEventListener( "click", function() {
			  this.classList.toggle( "active" );
			});

			FormUtil.setClickSwitchEvent( me.menuAppMenuIconTag, me.menuDivTag, [ 'open', 'close' ], me );
		}

	}

	me.populateMenuList = function( areaList )
	{
		var startMenuTag;

		// clear the list first
		me.menuDivTag.find( 'div.menu-mobile-row' ).remove();

		// Add the menu rows
		if ( areaList )
		{
			for ( var i = 0; i < areaList.length; i++ )
			{
				var area = areaList[i];

				var menuTag = $( '<div class="menu-mobile-row" areaId="' + area.id + '"><div>' + area.name + '</div></div>' );

				me.setupMenuTagClick( menuTag );

				me.menuDivTag.append( menuTag );

				if ( area.startArea ) startMenuTag = menuTag;
			}	
		}

		return startMenuTag;
	}

	
	me.setRegistrationObject = function( registrationObj )
	{
		me.registrationObj = registrationObj;
	}

	me.reGetAppShell = function()
	{
		$( '#swRefresh2' ).click();
		/*
		if ( me.registrationObj !== undefined )
		{
			console.log ( 'reloading + unregistering SW');
			me.registrationObj.unregister().then(function(boolean) {
			location.reload(true);
		});
		} */ 
	}

	me.reGetDCDconfig = function()
	{
		if ( me.LoginObj !== undefined )
		{
			me.LoginObj.regetDCDconfig();
		}  
	}


	/* @Greg: do we create a new class for managing color-scheme themes? */
	me.renderDefaultTheme = function ()
	{
		if ( me.configJson && me.configJson.settings && me.configJson.settings.theme && me.configJson.themes )
		{
			console.log( 'Updating to theme: ' + me.configJson.settings.theme);
			var defTheme = me.getThemeConfig( me.configJson.themes, me.configJson.settings.theme );

			$( 'nav.bg-color-program' ).css( 'background-color', defTheme.navTop.colors.background );

			$( '#spanOuName' ).css( 'color', defTheme.navTop.colors.foreground );

			$( 'div.bg-color-program-son' ).css( 'background-color', defTheme.navMiddle.colors.background );

			$( 'div.menu-mobile' ).css( 'background-color', defTheme.menuMobile.colors.background );

			$( 'div.menu-mobile' ).css( 'color', defTheme.menuMobile.colors.foreground );

			$('#styleCssMobileRow').remove();

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
				}

				$( 'head' ).append('<style id="styleCssMobileRow"> .tb-content-buttom { ' + btnStyle + ' } </style>');

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

	me.updateColorScheme = function ( favObj )
	{
		console.log('custom colors enabled: ' + me.enableCustomColors);
		console.log( favObj );
		if ( me.enableCustomColors )
		{

			console.log ( favObj.find('svg').attr('colors.background') );
			console.log ( favObj.find('svg').attr('colors.foreground') );

			$( 'nav.bg-color-program' ).css( 'background-color', favObj.find('svg').attr('colors.background') );

			$( 'div.bg-color-program-son' ).css( 'background-color', favObj.find('svg').attr('colors.background') );
			$( 'div.bg-color-program-son' ).css( 'opacity', 0.4 );

			$( '#spanOuName' ).css( 'color', favObj.find('svg').attr('colors.foreground') );

			//spanOuName.html(favObj.innerHTML)

			$( 'div.menu-mobile' ).css( 'background-color', favObj.find('svg').attr('colors.background') );

			$('#styleCssMobileRow').remove();

			$( 'head' ).append('<style id="styleCssMobileRow"> .menu-mobile-row{ color: ' + favObj.find('svg').attr('colors.foreground') + '; } </style>');

			//$( 'div.menu-mobile' ).css( 'opacity', 0.75 );
			
		}
		/*console.log ( favObj );
		console.log ( favObj.children() );
		console.log ( favObj.children()[0] );
		console.log ( favObj.children()[0].attributes );*/
	}

	// ======================================

	me.initialize();
}