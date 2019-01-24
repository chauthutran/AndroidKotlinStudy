// -------------------------------------------
// -- BlockMsg Class/Methods
function aboutApp( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.langTermObj = me.cwsRenderObj.langTermObj;

    me.aboutFormDivTag = $( '#aboutFormDiv' );
    me.aboutContentDivTag = $( '#aboutContentDiv' );
    me.aboutData;
    me.syncMgr;
    me.themeList;

    // ----- Tags -----------
    me.aboutInfo_langSelectTag = $( '#aboutInfo_langSelect' );
    me.aboutInfo_ThemeSelectTag = $( '#aboutInfo_ThemeSelect' );


	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function() {

        //me.aboutContentDivTag.empty();
        // me.resetValues();
        me.setEvents_OnInit();
    }

	// ------------------
    
    me.render = function() 
    {       
        me.populateAboutPageData( me.cwsRenderObj.configJson ); //DataManager.getUserConfigData()
        
        me.langTermObj.translatePage();

        me.showAboutPage();
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

            if ( ConnManager.isOffline() )
            {
                alert( 'Only re-register service-worker while online, please.' );
            }
            else
            {
                FormUtil.showProgressBar();
                var loadingTag = FormUtil.generateLoadingTag( divButtonAppVersionTag );
                setTimeout( function() {
                    me.cwsRenderObj.reGetAppShell(); 
                }, 500 );
            }
        });


        var divButtonDcdVersionTag = $( 'aboutInfo_dcdVersionInner' );
        var btnDcdConfigTag = $( '#dcdUpdateBtn' );

        $( btnDcdConfigTag ).click( () => {
            if ( ConnManager.isOffline() )
            {
                msgManager.msgAreaShow ( 'Please wait until network access is restored.' );
            }
            else
            {
                FormUtil.showProgressBar();
                var loadingTag = FormUtil.generateLoadingTag( divButtonDcdVersionTag );
                setTimeout( function() {
                    me.cwsRenderObj.reGetDCDconfig(); 
                }, 500 );
            }
        });     

        me.aboutInfo_langSelectTag.change( () => 
        {
            me.langTermObj.setCurrentLang( me.aboutInfo_langSelectTag.val() );

            me.langTermObj.translatePage();
        });

        me.aboutInfo_ThemeSelectTag.change ( () => 
        {    
            console.log( 'THEME changed: ' + me.aboutInfo_ThemeSelectTag.val() );
            var thisConfig = me.cwsRenderObj.configJson;
            console.log( thisConfig );
            thisConfig.settings.theme = me.aboutInfo_ThemeSelectTag.val();
            me.cwsRenderObj.configJson = thisConfig;
            me.cwsRenderObj.renderDefaultTheme(); 
        });


        //$( '#aboutInfo_CloseBtn' ).click( () =>
        $( 'img.btnBack' ).click( () =>
        {
            me.hideAboutPage();        
        });
        

        $( '#aboutInfo_newLangTermsDownload' ).click( function() 
        {
            var btnDownloadTag = $( this );

            var langSelVal = me.aboutInfo_langSelectTag.val();

            console.log( 'aboutInfo_newLangTermsDownload, create loading Tag' );

            //var loadingTag = FormUtil.generateLoadingTag(  btnDownloadTag );

            var loadingTag = $( '#aboutInfo_newLangTermsDownload_loading' );
            loadingTag.show();
            //loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading.gif"></div>' );
            //btnTag.after( loadingTag );

            me.langTermObj.retrieveAllLangTerm( function() 
            {
                loadingTag.hide();

                me.populateLangList_Show( me.langTermObj.getLangList(), langSelVal );

                me.aboutInfo_langSelectTag.val( langSelVal ).change();

            }, true);

        });
    }


	// ------------------

    me.showAboutPage = function()
    {
        if ( $( 'div.mainDiv' ).is( ":visible" ) )
        {
            $( 'div.mainDiv' ).hide();
        }
        if ( $( '#loginFormDiv' ).is( ":visible" ) )
        {
            $( '#loginFormDiv' ).hide();
        }

        me.renderNonEssentialFields( FormUtil.checkLogin() );

        me.aboutFormDivTag.show( 'fast' );    
    }

    me.hideAboutPage = function()
    {
        me.aboutFormDivTag.hide();    

        if ( FormUtil.checkLogin() )
        {
            $( 'div.mainDiv' ).show( 'fast' );
        }
        else
        {
            $( '#loginFormDiv' ).show();
        }

    }


    me.renderNonEssentialFields = function( userLoggedIn )
    {
        if ( userLoggedIn )
        {
            //$( '#li_about_userLanguage' ).show();
            $( '#li_about_theme' ).show();
        }
        else
        {
            //$( '#li_about_userLanguage' ).hide();
            $( '#li_about_theme' ).hide();
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
                //dcdConfigSettingTheme = dcdConfig.settings.theme;
                me.getThemeList( dcdConfig.themes );
                me.populateThemeList_Show( me.themeList, dcdConfig.settings.theme );

            }


            $( '#li_about_configVersion' ).show();
            $( '#li_about_theme' ).show();
        }
        else
        {
            $( '#li_about_configVersion' ).hide();
            $( '#li_about_theme' ).hide();
        }


        // Populate data
        $( '#aboutInfo_AppVersion' ).html( $( '#spanVersion' ).html().replace('v','') );
        $( '#aboutInfo_dcdVersion' ).html( dcdConfigVersion );
        $( '#aboutInfo_Browser' ).html( navigator.sayswho );
        //$( '#aboutInfo_Language' ).html( FormUtil.defaultLanguage() );
        //$( '#aboutInfo_Theme' ).html( dcdConfigSettingTheme );

        // Dropdown Populate
        
	    //me.getCurrentLangCode();

        //valueTag.append( '<select id="aboutInfo_langSelect"></select>' );


        //me.cwsRenderObj.langTermObj.translatePage();

        me.syncMgr = new syncManager();
        me.syncMgr.appShellVersionTest( $( '#appShellUpdateBtn' ) );
        me.syncMgr.dcdConfigVersionTest( $( '#dcdUpdateBtn' ) );        
    }

    me.getThemeList = function( jsonThemes )
    {
		if ( jsonThemes )
		{
            me.themeList = [];
			//console.log( 'setLanguageList' );
			for( i = 0; i < jsonThemes.length; i++ )
			{
				var themeJson = jsonThemes[i];

				console.log( themeJson );

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
            console.log( 'got theme list' );
            console.log( me.themeList );
		}
    }


    me.populateLangList_Show = function( langaugeList, defaultLangCode )
    {   
        Util.populateSelect( me.aboutInfo_langSelectTag, "Language", langaugeList );

        if ( defaultLangCode )
        {
            me.setLanguageDropdownFromCode( langaugeList, defaultLangCode )
        }

        $( '#aboutInfo_DivLangSelect' ).show();
    }

    me.setLanguageDropdownFromCode = function ( langaugeList, langCode )
    {
		$.each( langaugeList, function( i, item ) 
		{
            if ( item.id == langCode )
            {
                Util.setSelectDefaultByName( me.aboutInfo_langSelectTag, item.name );
            }
		});
    }

    me.populateThemeList_Show = function( ThemeList, defaultTheme )
    {   
        Util.populateSelect( me.aboutInfo_ThemeSelectTag, "Theme", ThemeList );

        if ( defaultTheme )
        {
            Util.setSelectDefaultByName( me.aboutInfo_ThemeSelectTag, defaultTheme );
        }

        $( '#aboutInfo_DivThemeSelect' ).show();
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