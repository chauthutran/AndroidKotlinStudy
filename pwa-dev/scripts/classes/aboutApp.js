// -------------------------------------------
// -- BlockMsg Class/Methods
function aboutApp( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.langTermObj = me.cwsRenderObj.langTermObj;

    me.aboutFormDivTag = $( '#aboutFormDiv' );
    me.aboutData;
    me.themeList;
    me.defaultsInitialised = 0;

    // ----- Tags -----------
    me.aboutInfo_langSelectTag = $( '#aboutInfo_langSelect' );
    me.aboutInfo_ThemeSelectTag = $( '#aboutInfo_ThemeSelect' );
    me.aboutInfo_NetworkSync = $( '#aboutInfo_networkSync' );
    

    me.easterEgg1Timer = 0; // click 5x to change network mode to opposite of current mode
    me.easterEgg2Timer = 0; // activate Translations debugging

	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================

    me.initialize = function() 
    {
        me.setEvents_OnInit();
    }

	// ------------------

    me.render = function() 
    {

        me.populateAboutPageData( ConfigManager.getConfigJson() );
        
        me.langTermObj.translatePage();

        me.showAboutPage();

        if ( SessionManager.getLoginStatus() )
        {
            me.defaultsInitialised = 1;
        }
        else
        {
            me.defaultsInitialised = 0;
        }

    }

	// ------------------

	me.setEvents_OnInit = function()
	{		
        // --------------
        // BUTTON CLICKS

        // check for App Version updates BUTTON
        var divButtonAppVersionTag = $( '#aboutInfo_AppVersionInner' );
        var btnAppShellTag = $( '#appShellUpdateBtn' );

        $( btnAppShellTag ).click( () => {

            if ( !ConnManagerNew.isAppMode_Online() )
            {
                // MISSING TRANSLATION
                MsgManager.notificationMessage ( 'Only re-register service-worker while online, please.', 'notificationDark', undefined, '', 'right', 'top' );
            }
            else
            {
                FormUtil.showProgressBar();
                var loadingTag = FormUtil.generateLoadingTag( divButtonAppVersionTag );
                setTimeout( function() {
                    $( '#imgaboutInfo_dcdVersion_Less' ).click();
                    me.cwsRenderObj.reGetAppShell(); 
                }, 500 );
            }
        });


        var divButtonDcdVersionTag = $( 'aboutInfo_dcdVersionInner' );
        var btnDcdConfigTag = $( '#dcdUpdateBtn' );

        $( btnDcdConfigTag ).click( () => {
            if ( !ConnManagerNew.isAppMode_Online() )
            {
                MsgManager.msgAreaShow ( 'Please wait until network access is restored.' );
            }
            else
            {
                FormUtil.showProgressBar();
                var loadingTag = FormUtil.generateLoadingTag( divButtonDcdVersionTag );
                setTimeout( function() {
                    $( '#imgaboutInfo_dcdVersion_Less' ).click();
                    me.cwsRenderObj.reGetDCDconfig(); 
                    FormUtil.hideProgressBar();
                }, 500 );
            }
        });     

        me.aboutInfo_langSelectTag.change( () => 
        {
            FormUtil.showProgressBar();

            me.langTermObj.setCurrentLang( me.aboutInfo_langSelectTag.val() );
            me.langTermObj.translatePage();

            $( '#aboutInfo_userLanguage_Name' ).html( me.getListNameFromID( me.langTermObj.getLangList(), me.aboutInfo_langSelectTag.val() ) );
            $( '#aboutInfo_userLanguage_Update' ).html( me.getLanguageUpdate( me.langTermObj.getLangList(), me.aboutInfo_langSelectTag.val() ) );            

            FormUtil.hideProgressBar();

        });



  
        me.aboutInfo_ThemeSelectTag.change ( () => 
        {    
            FormUtil.showProgressBar();

            var thisConfig = ConfigManager.getConfigJson();

            thisConfig.settings.theme = me.aboutInfo_ThemeSelectTag.val();
            // TRAN TODO : Why don't save this change to local db
            ConfigManager.setConfigJson( thisConfig );
            me.cwsRenderObj.renderDefaultTheme(); 

            $( '#aboutInfo_theme_Text' ).html( me.aboutInfo_ThemeSelectTag.val() );

            FormUtil.hideProgressBar();
        });

        me.aboutInfo_NetworkSync.change ( () => 
        {
            me.cwsRenderObj.storage_offline_SyncExecutionTimerInterval = me.aboutInfo_NetworkSync.val();

            AppInfoManager.updateNetworkSync( me.aboutInfo_NetworkSync.val() );

            $( '#aboutInfo_network_Text' ).html( ( me.aboutInfo_NetworkSync.val() > 0 ? 'every' : '') + ' ' + me.getListNameFromID( me.getSyncOptions(), me.aboutInfo_NetworkSync.val() ) );

            //syncManager.reinitialize ( me.cwsRenderObj );

        });


        $( 'img.btnAboutBack' ).click( () =>
        {
            if ( $( 'img.rotateImg' ).length  )
            {
                $( 'img.rotateImg' ).click();
            }
            else
            {
                me.hideAboutPage();
            }
        });

        me.evalHideSections = function( excludeID )
        {
            $( 'li.aboutGroupDiv' ).each(function(i, obj) {

                if ( $( obj ).attr( 'id' ) != excludeID && ! $( obj ).hasClass( 'byPassAboutMore' ) )
                {
                    if ( $( obj ).is(':visible') ) $( obj ).hide();
                    else $( obj ).show();
                }

            });
        }


        $( '#aboutInfo_newLangTermsDownload' ).click( function() 
        {
            var btnDownloadTag = $( this );
            var langSelVal = me.aboutInfo_langSelectTag.val();
            var loadingTag = FormUtil.generateLoadingTag(  btnDownloadTag );

            FormUtil.showProgressBar();

            me.langTermObj.retrieveAllLangTerm( function() 
            {
                loadingTag.hide();

                me.populateLangList_Show( me.langTermObj.getLangList(), langSelVal );

                me.aboutInfo_langSelectTag.val( langSelVal ).change();

                FormUtil.hideProgressBar();

            }, true);

        });

        $( '#imgaboutInfo_AppVersion_Less' ).closest( 'div' ).click( function() 
        {
            if ( $( '#imgaboutInfo_AppVersion_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgaboutInfo_AppVersion_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#aboutInfo_AppVersion_More' ).is(':visible') )
            {
                $( '#aboutInfo_AppVersion_Less' ).hide( 'fast' );
                $( '#aboutInfo_AppVersion_More' ).show( 'fast' );
                $( 'label.aboutHeader' ).attr( 'backText', $( 'label.aboutHeader' ).html() );
                $( 'label.aboutHeader' ).attr( 'backTerm', $( 'label.aboutHeader' ).attr( 'term' ) );
                $( 'label.aboutHeader' ).html( $( '#lblabout_applicationVersion' ).html() );
                $( 'label.aboutHeader' ).attr( 'term', $( '#lblabout_applicationVersion' ).attr( 'term' ) );

                me.evalHideSections( 'aboutInfo_AppVersion_Less' );
            }
            else
            {
                $( 'label.aboutHeader' ).html( me.langTermObj.translateText(  $( 'label.aboutHeader' ).attr( 'backText' ),  $( 'label.aboutHeader' ).attr( 'backTerm' ) ) );
                $( 'label.aboutHeader' ).attr( 'term', $( 'label.aboutHeader' ).attr( 'backTerm' ) );
                $( '#aboutInfo_AppVersion_More' ).hide( 'fast' );
                $( '#aboutInfo_AppVersion_Less' ).show( 'fast' );

                me.evalHideSections( 'aboutInfo_AppVersion_Less' );
            }

        });

        $( '#imgaboutInfo_dcdVersion_Less' ).closest( 'div' ).click( function()
        {
            if ( $( '#imgaboutInfo_dcdVersion_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgaboutInfo_dcdVersion_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#aboutInfo_dcdVersion_More' ).is(':visible') )
            {
                $( '#aboutInfo_dcdVersion_Less' ).hide( 'fast' );
                $( '#aboutInfo_dcdVersion_More' ).show( 'fast' );
                $( 'label.aboutHeader' ).attr( 'backText', $( 'label.aboutHeader' ).html() );
                $( 'label.aboutHeader' ).attr( 'backTerm', $( 'label.aboutHeader' ).attr( 'term' ) );
                $( 'label.aboutHeader' ).html( $( '#lblabout_configVersion' ).html() );
                $( 'label.aboutHeader' ).attr( 'term', $( '#lblabout_configVersion' ).attr( 'term' ) );

                me.evalHideSections( 'aboutInfo_dcdVersion_Less' );
            }
            else
            {
                $( 'label.aboutHeader' ).html( me.langTermObj.translateText(  $( 'label.aboutHeader' ).attr( 'backText' ),  $( 'label.aboutHeader' ).attr( 'backTerm' ) ) );
                $( 'label.aboutHeader' ).attr( 'term', $( 'label.aboutHeader' ).attr( 'backTerm' ) );
                $( '#aboutInfo_dcdVersion_More' ).hide( 'fast' );
                $( '#aboutInfo_dcdVersion_Less' ).show( 'fast' );

                me.evalHideSections( 'aboutInfo_dcdVersion_Less' );
            }

        });

        $( '#imgaboutInfo_userLanguage_Less' ).closest( 'div' ).click( function() 
        {
            if ( $( '#imgaboutInfo_userLanguage_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgaboutInfo_userLanguage_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#aboutInfo_userLanguage_More' ).is(':visible') )
            {
                $( '#aboutInfo_userLanguage_Less' ).hide( 'fast' );
                $( '#aboutInfo_userLanguage_More' ).show( 'fast' );
                $( 'label.aboutHeader' ).attr( 'backText', $( 'label.aboutHeader' ).html() );
                $( 'label.aboutHeader' ).attr( 'backTerm', $( 'label.aboutHeader' ).attr( 'term' ) );
                $( 'label.aboutHeader' ).html( $( '#lblabout_userLanguage' ).html() );
                $( 'label.aboutHeader' ).attr( 'term', $( '#lblabout_userLanguage' ).attr( 'term' ) );

                me.evalHideSections( 'aboutInfo_userLanguage_Less' );
            }
            else
            {
                $( 'label.aboutHeader' ).html( me.langTermObj.translateText(  $( 'label.aboutHeader' ).attr( 'backText' ),  $( 'label.aboutHeader' ).attr( 'backTerm' ) ) );
                $( 'label.aboutHeader' ).attr( 'term', $( 'label.aboutHeader' ).attr( 'backTerm' ) );
                $( '#aboutInfo_userLanguage_More' ).hide( 'fast' );
                $( '#aboutInfo_userLanguage_Less' ).show( 'fast' );

                me.evalHideSections( 'aboutInfo_userLanguage_Less' );
            }

        });

        $( '#imgaboutInfo_theme_Less' ).closest( 'div' ).click( function()
        {
            if ( $( '#imgaboutInfo_theme_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgaboutInfo_theme_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#aboutInfo_theme_More' ).is(':visible') )
            {
                $( '#aboutInfo_theme_Less' ).hide( 'fast' );
                $( '#aboutInfo_theme_More' ).show( 'fast' );
                $( 'label.aboutHeader' ).attr( 'backText', $( 'label.aboutHeader' ).html() );
                $( 'label.aboutHeader' ).attr( 'backTerm', $( 'label.aboutHeader' ).attr( 'term' ) );
                $( 'label.aboutHeader' ).html( $( '#lblabout_theme' ).html() );
                $( 'label.aboutHeader' ).attr( 'term', $( '#lblabout_theme' ).attr( 'term' ) );

                me.evalHideSections( 'aboutInfo_theme_Less' );
            }
            else
            {
                $( 'label.aboutHeader' ).html( me.langTermObj.translateText(  $( 'label.aboutHeader' ).attr( 'backText' ),  $( 'label.aboutHeader' ).attr( 'backTerm' ) ) );
                $( 'label.aboutHeader' ).attr( 'term', $( 'label.aboutHeader' ).attr( 'backTerm' ) );
                $( '#aboutInfo_theme_More' ).hide( 'fast' );
                $( '#aboutInfo_theme_Less' ).show( 'fast' );

                me.evalHideSections( 'aboutInfo_theme_Less' );
            }

        });

        $( '#imgaboutInfo_network_Less' ).closest( 'div' ).click( function()
        {
            if ( $( '#imgaboutInfo_network_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgaboutInfo_network_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#aboutInfo_network_More' ).is(':visible') )
            {
                $( '#aboutInfo_network_Less' ).hide( 'fast' );
                $( '#aboutInfo_network_More' ).show( 'fast' );
                $( 'label.aboutHeader' ).attr( 'backText', $( 'label.aboutHeader' ).html() );
                $( 'label.aboutHeader' ).attr( 'backTerm', $( 'label.aboutHeader' ).attr( 'term' ) );
                $( 'label.aboutHeader' ).html( $( '#lblabout_network' ).html() );
                $( 'label.aboutHeader' ).attr( 'term', $( '#lblabout_network' ).attr( 'term' ) );

                me.evalHideSections( 'aboutInfo_network_Less' );
            }
            else
            {
                $( 'label.aboutHeader' ).html( me.langTermObj.translateText(  $( 'label.aboutHeader' ).attr( 'backText' ),  $( 'label.aboutHeader' ).attr( 'backTerm' ) ) );
                $( 'label.aboutHeader' ).attr( 'term', $( 'label.aboutHeader' ).attr( 'backTerm' ) );
                $( '#aboutInfo_network_More' ).hide( 'fast' );
                $( '#aboutInfo_network_Less' ).show( 'fast' );

                me.evalHideSections( 'aboutInfo_network_Less' );
            }

        });

        $( '#lblabout_userLanguage' ).css( 'user-select', 'none' );
        $( '#lblabout_userLanguage' ).on( 'selectstart dragstart', false );

        $( '#lblabout_userLanguage' ).click( () => {

            if ( $( '#lblabout_userLanguage' ).attr( 'counter' ) )
            {

                if ( $( '#lblabout_userLanguage' ).attr( 'counter' ) < 4 )
                {
                    var incr = parseInt( $( '#lblabout_userLanguage' ).attr( 'counter' ) );
                    incr ++;
                    $( '#lblabout_userLanguage' ).attr( 'counter', incr );

                    if ( me.easterEgg2Timer )
                    {
                        clearTimeout( me.easterEgg2Timer );
                    }
                    me.easterEgg2Timer = setTimeout( function() {
                        $( '#lblabout_userLanguage' ).attr( 'counter', 0 );
                    }, 3000 );
                }
                else
                {
                    if ( me.easterEgg2Timer )
                    {
                        clearTimeout( me.easterEgg2Timer );
                    }

                    $( '#lblabout_userLanguage' ).attr( 'counter', 0 );

                    me.langTermObj.debugMode = ( me.langTermObj.debugMode ? false : true );
                    me.langTermObj.translatePage();

                }

            }
            else
            {
                $( '#lblabout_userLanguage' ).attr( 'counter', 1 )

                me.easterEgg2Timer = setTimeout( function() {
                    $( '#lblabout_userLanguage' ).attr( 'counter', 0 );
                }, 3000 );
            }

            if ( me.langTermObj.debugMode )
            {
                $( '#lblabout_userLanguage' ).css( 'text-decoration', 'underline' );
            }
            else
            {
                $( '#lblabout_userLanguage' ).css( 'text-decoration', 'none' );
            }

        });
 

        //cacheManager.initialise();

    }


	// ------------------

    me.showAboutPage = function()
    {
        if ( $( '#pageDiv' ).is( ":visible" ) )
        {
            $( '#pageDiv' ).hide();
        }
        if ( $( '#loginFormDiv' ).is( ":visible" ) )
        {
            $( '#loginFormDiv' ).hide();
        }

        me.renderNonEssentialFields( SessionManager.getLoginStatus() );

        me.aboutFormDivTag.show();
    }

    me.hideAboutPage = function()
    {
        //me.aboutFormDivTag.fadeOut( 500 );
        me.aboutFormDivTag.hide();

        $( '#pageDiv' ).show( 'fast' );
    }


    me.renderNonEssentialFields = function( userLoggedIn )
    {

        if ( userLoggedIn )
        {

            if ( me.defaultsInitialised == 0 )
            {

                $( '#aboutInfo_dcdVersion_Less' ).show();
                $( '#aboutInfo_dcdVersion_Less' ).removeClass( 'byPassAboutMore' );
    
                $( '#aboutInfo_network_Less' ).show();
                $( '#aboutInfo_network_Less' ).removeClass( 'byPassAboutMore' )

                if ( me.langTermObj.getLangList() )
                {
                    $( '#aboutInfo_userLanguage_Less' ).show();
                    $( '#aboutInfo_userLanguage_Less' ).removeClass( 'byPassAboutMore' );
                }
                else
                {
                    $( '#aboutInfo_userLanguage_Less' ).hide();
                    $( '#aboutInfo_userLanguage_Less' ).addClass( 'byPassAboutMore' );
                }

                $( '#aboutInfo_theme_Less' ).show();
                $( '#aboutInfo_theme_Less' ).removeClass( 'byPassAboutMore' )

                $( '#aboutInfo_networkMode_Less' ).show();
                $( '#aboutInfo_networkMode_Less' ).removeClass( 'byPassAboutMore' );

                $( '#aboutInfo_geoLocation_Less' ).show();
                $( '#aboutInfo_geoLocation_Less' ).removeClass( 'byPassAboutMore' );

                if ( Util.isMobi() )
                {
                    $( '#aboutInfo_soundEffects_Less' ).show();
                    $( '#aboutInfo_soundEffects_Less' ).removeClass( 'byPassAboutMore' );
                }
                else
                {
                    $( '#aboutInfo_soundEffects_Less' ).hide();
                    $( '#aboutInfo_soundEffects_Less' ).addClass( 'byPassAboutMore' );
                }

            }
        }
        else
        {

            $( '#aboutInfo_dcdVersion_Less' ).hide();
            $( '#aboutInfo_dcdVersion_Less' ).addClass( 'byPassAboutMore' );

            $( '#aboutInfo_networkMode_Less' ).hide();
            $( '#aboutInfo_networkMode_Less' ).addClass( 'byPassAboutMore' );

            $( '#aboutInfo_geoLocation_Less' ).hide();
            $( '#aboutInfo_geoLocation_Less' ).addClass( 'byPassAboutMore' );

            $( '#aboutInfo_soundEffects_Less' ).hide();
            $( '#aboutInfo_soundEffects_Less' ).addClass( 'byPassAboutMore' );

            if ( me.langTermObj.getLangList() )
            {
                $( '#aboutInfo_userLanguage_Less' ).show();
                $( '#aboutInfo_userLanguage_Less' ).removeClass( 'byPassAboutMore' );
            }
            else
            {
                $( '#aboutInfo_userLanguage_Less' ).hide();
                $( '#aboutInfo_userLanguage_Less' ).addClass( 'byPassAboutMore' );
            }

            $( '#aboutInfo_theme_Less' ).hide();
            $( '#aboutInfo_theme_Less' ).addClass( 'byPassAboutMore' );

            $( '#aboutInfo_network_Less' ).hide();
            $( '#aboutInfo_network_Less' ).addClass( 'byPassAboutMore' )

        }

        if ( ! $( '#aboutInfo_networkMode' ).attr( 'unselectable' )  )
        {
            $( '#aboutInfo_networkMode' ).attr( 'unselectable', 'on' );
            $( '#aboutInfo_networkMode' ).css( 'user-select', 'none' );
            $( '#aboutInfo_networkMode' ).on( 'selectstart', false );
        }

        if ( me.langTermObj.debugMode )
        {
            $( '#lblabout_userLanguage' ).css( 'text-decoration', 'underline' );
        }
        else
        {
            $( '#lblabout_userLanguage' ).css( 'text-decoration', 'none' );
        }

    }

    me.populateAboutPageData = function( dcdConfig ) 
    {
        // Dcd Config related data set
        var dcdConfigVersion = "";

        if ( dcdConfig )
        {
            if ( dcdConfig.version ) dcdConfigVersion = dcdConfig.version;
            if ( dcdConfig.settings && dcdConfig.settings.theme ) 
            {
                me.getThemeList( dcdConfig.themes );
                me.populateThemeList_Show( me.themeList, dcdConfig.settings.theme );
                me.populateNetworkSyncList_Show( me.getSyncOptions(), me.cwsRenderObj.storage_offline_SyncExecutionTimerInterval )
            }
        }

        // Populate data
        $( '#aboutInfo_AppVersion' ).html( $( '#spanVersion' ).html().replace('v','') );
        $( '#aboutInfo_Browser' ).html( navigator.sayswho );

        if ( ! me.langTermObj.getLangList() )
        {
            $( '#aboutInfo_userLanguage_DBupdate' ).hide();
            $( '#imgaboutInfo_userLanguage_Less' ).removeClass( 'enabled' );
            $( '#imgaboutInfo_userLanguage_Less' ).addClass( 'disabled' );
        }
        else
        {
            $( '#aboutInfo_userLanguage_DBupdate' ).show();
            $( '#imgaboutInfo_userLanguage_Less' ).removeClass( 'disabled' );
            $( '#imgaboutInfo_userLanguage_Less' ).addClass( 'enabled' );
        }

        if ( SessionManager.getLoginStatus() )
        {
            $( '#aboutInfo_dcdVersion' ).html( dcdConfigVersion );
            $( '#aboutInfo_networkMode' ).html( '<div>' + ConnManagerNew.statusInfo.appMode + '</div>' );
            $( '#aboutInfo_geoLocation' ).html( '<div>' + FormUtil.geoLocationState + ( ( me.getCoordinatesForPresentation() ).toString().length ? ': ' + me.getCoordinatesForPresentation() : '' ) + '</div>' );
        }

    }

    me.getThemeList = function( jsonThemes )
    {
		if ( jsonThemes )
		{
            me.themeList = [];

			for( i = 0; i < jsonThemes.length; i++ )
			{
				var themeJson = jsonThemes[i];

				if ( themeJson.id || themeJson.name )
				{
                    var addthemeJson = {};
                    
                    if ( themeJson.id )
                    {
                        addthemeJson.id = themeJson.id;
                    }
                    else
                    {
                        addthemeJson.id = themeJson.name;
                    }

					addthemeJson.name = themeJson.name;

					me.themeList.push( addthemeJson );
				}
            }

		}
    }


    me.populateLangList_Show = function( languageList, defaultLangCode )
    {   
        Util.populateSelect( me.aboutInfo_langSelectTag, "Language", languageList );

        if ( defaultLangCode )
        {
            me.setLanguageDropdownFromCode( languageList, defaultLangCode )
        }

        $( '#aboutInfo_userLanguage_Name' ).html( me.getListNameFromID( languageList, defaultLangCode ) );
        $( '#aboutInfo_userLanguage_Update' ).html( me.getLanguageUpdate( languageList, defaultLangCode ) );
        $( '#aboutInfo_DivLangSelect' ).show();

    }

    me.setLanguageDropdownFromCode = function ( languageList, langCode )
    {
		$.each( languageList, function( i, item ) 
		{
            if ( item.id == langCode )
            {
                Util.setSelectDefaultByName( me.aboutInfo_langSelectTag, item.name );
            }
		});
    }

    me.getListNameFromID = function( arrList, idVal )
    {
        for( i = 0; i < arrList.length; i++ )
        {
            if ( arrList[i].id == idVal )
            {
                return arrList[i].name;
            }
        }

    }

    me.getLanguageUpdate = function( languageList, defaultLangCode )
    {
        var langList = me.langTermObj.getLangList();

        for( i = 0; i < languageList.length; i++ )
        {
            if ( languageList[i].id == defaultLangCode )
            {
                return languageList[i].updated;
            }
        }

    }

    me.populateThemeList_Show = function( ThemeList, defaultTheme )
    {   
        Util.populateSelect( me.aboutInfo_ThemeSelectTag, "Theme", ThemeList );

        if ( defaultTheme )
        {
            Util.setSelectDefaultByName( me.aboutInfo_ThemeSelectTag, defaultTheme );
        }

        $( '#aboutInfo_theme_Text' ).html( defaultTheme );
        $( '#aboutInfo_DivThemeSelect' ).show();
    }

    me.populateNetworkSyncList_Show = function( syncEveryList, syncTimer )
    {


        Util.populateSelect( me.aboutInfo_NetworkSync, "", syncEveryList );
        Util.setSelectDefaultByName( me.aboutInfo_NetworkSync, syncTimer );
        me.aboutInfo_NetworkSync.val( syncTimer ); 

        $( '#aboutInfo_network_Text' ).html( ( syncTimer > 0 ? 'every' : '') + ' ' + me.getListNameFromID( syncEveryList, syncTimer ) );
        $( '#aboutInfo_DivnetworkSelect' ).show();
    }

    me.getCoordinatesForPresentation = function()
    {
        var ret = ''; //'<div term="">not required by PWA</div>';
        if ( FormUtil.geoLocationLatLon )
        {
            if ( FormUtil.geoLocationLatLon.toString().length )
            {
                ret = '[' + FormUtil.geoLocationLatLon.toString() + ']'
            }
        }
        return ret;
    }

    me.getSyncOptions = function()
    {
        var retOpts = []
        var syncOpts = {};

        syncOpts.id = 0;
        syncOpts.name = 'off';
        retOpts.push( syncOpts );

        syncOpts = {};
        syncOpts.id = 60000;
        syncOpts.name = '1 min';
        retOpts.push( syncOpts );

        syncOpts = {};
        syncOpts.id = 1800000;
        syncOpts.name = '30 mins';
        retOpts.push( syncOpts );

        syncOpts = {};
        syncOpts.id = 3600000;
        syncOpts.name = '60 mins';
        retOpts.push( syncOpts );

        syncOpts = {};
        syncOpts.id = 86400000;
        syncOpts.name = '24 hrs';
        retOpts.push( syncOpts );

        return retOpts;

    }


    navigator.sayswho= (function(){
        var ua= navigator.userAgent, tem, 
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE '+(tem[1] || '');
        }
        if(M[1]=== 'Chrome'){
            tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
            if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    })();

	// ------------------------------------

	me.initialize();
}