// -------------------------------------------
// -- BlockMsg Class/Methods
function settingsApp( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.langTermObj = me.cwsRenderObj.langTermObj;

    me.settingsFormDivTag = $( '#settingsFormDiv' );
    me.settingsContentDivTag = $( '#settingsContentDiv' );
    me.settingsData;
    me.themeList;
    me.defaultsInitialised = 0;

    // ----- Tags -----------
    me.settingsInfo_langSelectTag = $( '#settingsInfo_langSelect' );
    me.settingsInfo_ThemeSelectTag = $( '#settingsInfo_ThemeSelect' );
    me.settingsInfo_NetworkSync = $( '#settingsInfo_networkSync' );
    me.settingsInfo_logoutDelay = $( '#settingsInfo_logoutDelay' );
    me.settingsInfo_SoundSwitchInput = $( '#soundSwitchInput' );
    me.settingsInfo_autoCompleteInput = $( '#autoCompleteInput' );

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

        me.populateSettingsPageData( ConfigManager.getConfigJson() ); //DataManager.getUserConfigData()
        
        me.langTermObj.translatePage();

        me.showSettingsPage();

        if ( FormUtil.checkLogin() )
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
        var divButtonAppVersionTag = $( '#settingsInfo_AppVersionInner' );
        var btnAppShellTag = $( '#appShellUpdateBtn' );

        $( btnAppShellTag ).click( () => {

            if ( ConnManager.isOffline() )
            {
                // MISSING TRANSLATION
                MsgManager.notificationMessage ( 'Only re-register service-worker while online, please.', 'notificationDark', undefined, '', 'right', 'top' );
            }
            else
            {
                FormUtil.showProgressBar();
                var loadingTag = FormUtil.generateLoadingTag( divButtonAppVersionTag );
                setTimeout( function() {
                    $( '#imgsettingsInfo_dcdVersion_Less' ).click();
                    me.cwsRenderObj.reGetAppShell(); 
                }, 500 );
            }
        });
        var show = false
        $('#languageCollapsibleHeader').click( ()=> {
            $('#languageCollapsibleBody').slideToggle('fast')
            console.log(show)
            if(show){
                $('#languageCollapsibleBody').css('border-bottom','none')
                $('#languageCollapsibleHeader').css('border-bottom','2px solid #F5F5F5')
            }
            else{
                $('#languageCollapsibleHeader').css('border-bottom','none')
                $('#languageCollapsibleBody').css('border-bottom','2px solid #F5F5F5')
            }
            show = !show
        });

        //  Funcionalidad: Reset Data
        //  La siguiente funci�n autoejecutable es toda la funcionalidad
        //  del elemento con id "resetCollapsible". Depende de las clases
        //  Modal e InterfaceModal, y de una instancia 
        //  It is found in [rootPath]/scripts/utils/pptManager.js 
        //  Los estilos de los elementos se encuentran
        //  en [project]/css/style.css
        //  de la l�nea 1035 a 1068
        ( function() {
            var sectionReset = document.getElementById('resetCollapsible')
            $("#settingsAppRestHeader").click( function() {
                $("#bodyCollapsible").slideToggle("fast")
                $("#settingsAppRestHeader").toggleClass("collapsible-body--on")
            })
            // @GREG: ADD TRANSLATION SUPPORT HERE
            let titleMessage="Reset app data & configuration",
                bodyMessage="Your configuration and App data stored in the device will be deleted. "
                questionMessage="Are you sure?",
                btnAcceptResetData = $( '<button class="acceptButton" term="">ACCEPT</button>' ),
                btnDeclineResetData = $( '<button class="declineButton" term="">DECLINE</button>' );

            let buttons = [btnDeclineResetData[0],btnAcceptResetData[0]]

            $("#buttonResetData").click(function(){
                pptManager.on({parent: sectionReset, titleMessage,bodyMessage,questionMessage,buttons})
            })
            btnDeclineResetData.click(function(){
                pptManager.on({parent: sectionReset, titleMessage,bodyMessage,questionMessage,buttons})
            })
            btnAcceptResetData.click(()=>{
                DataManager.clearSessionStorage()
                if ( cacheManager.clearCacheKeys() )
                {
                    me.cwsRenderObj.reGetAppShell();
                }
                pptManager.on({})
            })
        })()


        var divButtonDcdVersionTag = $( 'settingsInfo_dcdVersionInner' );
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
                    $( '#imgsettingsInfo_dcdVersion_Less' ).click();
                    me.cwsRenderObj.reGetDCDconfig(); 
                    FormUtil.hideProgressBar();
                }, 500 );
            }
        });     

        me.settingsInfo_langSelectTag.change( () => 
        {
            FormUtil.showProgressBar();

            me.langTermObj.setCurrentLang( me.settingsInfo_langSelectTag.val() );
            me.langTermObj.translatePage();

            $( '#settingsInfo_userLanguage_Name' ).html( me.getListNameFromID( me.langTermObj.getLangList(), me.settingsInfo_langSelectTag.val() ) );
            $( '#settingsInfo_userLanguage_Update' ).html( 'Refresh date' + ': ' + me.getLanguageUpdate( me.langTermObj.getLangList(), me.settingsInfo_langSelectTag.val() ) );            

            FormUtil.hideProgressBar();

        });



        me.settingsInfo_SoundSwitchInput.change(() => {
          var soundSetting = me.settingsInfo_SoundSwitchInput.is( ":checked" ); // load from input checkbox
          var sessData = JSON.parse(localStorage.getItem( "session" ));

          sessData.soundEffects = soundSetting; //add
          DataManager.saveData( "session", sessData );

          if(soundSetting) playSound( "notify") ;

        });

        me.settingsInfo_autoCompleteInput.change(() => {
            var autoComplete = me.settingsInfo_autoCompleteInput.is( ":checked" ); // load from input checkbox
            var sessData = JSON.parse(localStorage.getItem( "session" ));
  
            sessData.autoComplete = autoComplete; //add
            DataManager.saveData( "session", sessData );

            me.updateAutoComplete( ( autoComplete ? 'on' : 'off' ) );

        });



        me.settingsInfo_ThemeSelectTag.change ( () => 
        {    
            FormUtil.showProgressBar();

            var thisConfig = ConfigManager.getConfigJson();

            thisConfig.settings.theme = me.settingsInfo_ThemeSelectTag.val();

            ConfigManager.getConfigJson() = thisConfig;
            me.cwsRenderObj.renderDefaultTheme(); 

            $( '#settingsInfo_theme_Text' ).html( me.settingsInfo_ThemeSelectTag.val() );

            FormUtil.hideProgressBar();
        });

        me.settingsInfo_NetworkSync.change ( () => 
        {
            me.cwsRenderObj.storage_offline_SyncExecutionTimerInterval = me.settingsInfo_NetworkSync.val();

            DataManager.setSessionDataValue( 'networkSync', me.settingsInfo_NetworkSync.val() );

            $( '#settingsInfo_network_Text' ).html( ( me.settingsInfo_NetworkSync.val() > 0 ? 'every' : '') + ' ' + me.getListNameFromID( me.getSyncOptions(), me.settingsInfo_NetworkSync.val() ) );

            //syncManager.reinitialize ( me.cwsRenderObj );

        });


        me.settingsInfo_logoutDelay.change ( () => 
        {
            
            me.cwsRenderObj.storage_offline_SyncExecutionTimerInterval = me.settingsInfo_logoutDelay.val();

            DataManager.setSessionDataValue( 'logoutDelay', me.settingsInfo_logoutDelay.val() );

            $( '#settingsInfo_logout_Text' ).html( ( me.settingsInfo_logoutDelay.val() > 0 ? 'every' : '') + ' ' + me.getListNameFromID( me.getLogoutOptions(), me.settingsInfo_logoutDelay.val() ) );

            //syncManager.reinitialize ( me.cwsRenderObj );

            var sessData = JSON.parse(localStorage.getItem( "session" ));

            sessData.logoutDelay = me.settingsInfo_logoutDelay.val(); //add
            DataManager.saveData("session", sessData);

        });
        


        $( 'img.btnSettingsBack' ).click( () =>
        {
            if ( $( 'img.rotateImg' ).length  )
            {
                $( 'img.rotateImg' ).click();
            }
            else
            {
                me.hideSettingsPage();
            }
        });

        me.evalHideSections = function( excludeID )
        {
            $( 'li.settingsGroupDiv' ).each(function(i, obj) {

                if ( $( obj ).attr( 'id' ) != excludeID && ! $( obj ).hasClass( 'byPassSettingsMore' ) )
                {
                    if ( $( obj ).is(':visible') ) $( obj ).hide( 'fast' );
                    else $( obj ).show( 'fast' );
                }

            });
        }


        $( '#settingsInfo_newLangTermsDownload' ).click( function() 
        {
            var btnDownloadTag = $( this );
            var langSelVal = me.settingsInfo_langSelectTag.val();
            var loadingTag = FormUtil.generateLoadingTag(  btnDownloadTag );

            FormUtil.showProgressBar();

            me.langTermObj.retrieveAllLangTerm( function() 
            {
                loadingTag.hide();

                me.populateLangList_Show( me.langTermObj.getLangList(), langSelVal );

                me.settingsInfo_langSelectTag.val( langSelVal ).change();

                FormUtil.hideProgressBar();

            }, true);

        });

        $( '#imgsettingsInfo_AppVersion_Less' ).closest( 'div' ).click( function() 
        {
            if ( $( '#imgsettingsInfo_AppVersion_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgsettingsInfo_AppVersion_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#settingsInfo_AppVersion_More' ).is(':visible') )
            {
                $( '#settingsInfo_AppVersion_Less' ).hide( 'fast' );
                $( '#settingsInfo_AppVersion_More' ).show( 'fast' );
                $( 'label.settingsHeader' ).attr( 'backText', $( 'label.settingsHeader' ).html() );
                $( 'label.settingsHeader' ).attr( 'backTerm', $( 'label.settingsHeader' ).attr( 'term' ) );
                $( 'label.settingsHeader' ).html( $( '#lblsettings_applicationVersion' ).html() );
                $( 'label.settingsHeader' ).attr( 'term', $( '#lblsettings_applicationVersion' ).attr( 'term' ) );

                me.evalHideSections( 'settingsInfo_AppVersion_Less' );
            }
            else
            {
                $( 'label.settingsHeader' ).html( me.langTermObj.translateText(  $( 'label.settingsHeader' ).attr( 'backText' ),  $( 'label.settingsHeader' ).attr( 'backTerm' ) ) );
                $( 'label.settingsHeader' ).attr( 'term', $( 'label.settingsHeader' ).attr( 'backTerm' ) );
                $( '#settingsInfo_AppVersion_More' ).hide( 'fast' );
                $( '#settingsInfo_AppVersion_Less' ).show( 'fast' );

                me.evalHideSections( 'settingsInfo_AppVersion_Less' );
            }

        });

        $( '#imgsettingsInfo_dcdVersion_Less' ).closest( 'div' ).click( function()
        {
            if ( $( '#imgsettingsInfo_dcdVersion_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgsettingsInfo_dcdVersion_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#settingsInfo_dcdVersion_More' ).is(':visible') )
            {
                $( '#settingsInfo_dcdVersion_Less' ).hide( 'fast' );
                $( '#settingsInfo_dcdVersion_More' ).show( 'fast' );
                $( 'label.settingsHeader' ).attr( 'backText', $( 'label.settingsHeader' ).html() );
                $( 'label.settingsHeader' ).attr( 'backTerm', $( 'label.settingsHeader' ).attr( 'term' ) );
                $( 'label.settingsHeader' ).html( $( '#lblsettings_configVersion' ).html() );
                $( 'label.settingsHeader' ).attr( 'term', $( '#lblsettings_configVersion' ).attr( 'term' ) );

                me.evalHideSections( 'settingsInfo_dcdVersion_Less' );
            }
            else
            {
                $( 'label.settingsHeader' ).html( me.langTermObj.translateText(  $( 'label.settingsHeader' ).attr( 'backText' ),  $( 'label.settingsHeader' ).attr( 'backTerm' ) ) );
                $( 'label.settingsHeader' ).attr( 'term', $( 'label.settingsHeader' ).attr( 'backTerm' ) );
                $( '#settingsInfo_dcdVersion_More' ).hide( 'fast' );
                $( '#settingsInfo_dcdVersion_Less' ).show( 'fast' );

                me.evalHideSections( 'settingsInfo_dcdVersion_Less' );
            }

        });

        $( '#imgsettingsInfo_userLanguage_Less' ).closest( 'div' ).click( function() 
        {
            if ( $( '#imgsettingsInfo_userLanguage_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgsettingsInfo_userLanguage_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#settingsInfo_userLanguage_More' ).is(':visible') )
            {
                $( '#settingsInfo_userLanguage_Less' ).hide( 'fast' );
                $( '#settingsInfo_userLanguage_More' ).show( 'fast' );
                $( 'label.settingsHeader' ).attr( 'backText', $( 'label.settingsHeader' ).html() );
                $( 'label.settingsHeader' ).attr( 'backTerm', $( 'label.settingsHeader' ).attr( 'term' ) );
                $( 'label.settingsHeader' ).html( $( '#lblsettings_userLanguage' ).html() );
                $( 'label.settingsHeader' ).attr( 'term', $( '#lblsettings_userLanguage' ).attr( 'term' ) );

                me.evalHideSections( 'settingsInfo_userLanguage_Less' );
            }
            else
            {
                $( 'label.settingsHeader' ).html( me.langTermObj.translateText(  $( 'label.settingsHeader' ).attr( 'backText' ),  $( 'label.settingsHeader' ).attr( 'backTerm' ) ) );
                $( 'label.settingsHeader' ).attr( 'term', $( 'label.settingsHeader' ).attr( 'backTerm' ) );
                $( '#settingsInfo_userLanguage_More' ).hide( 'fast' );
                $( '#settingsInfo_userLanguage_Less' ).show( 'fast' );

                me.evalHideSections( 'settingsInfo_userLanguage_Less' );
            }

        });

        $( '#imgsettingsInfo_theme_Less' ).closest( 'div' ).click( function()
        {
            if ( $( '#imgsettingsInfo_theme_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgsettingsInfo_theme_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#settingsInfo_theme_More' ).is(':visible') )
            {
                $( '#settingsInfo_theme_Less' ).hide( 'fast' );
                $( '#settingsInfo_theme_More' ).show( 'fast' );
                $( 'label.settingsHeader' ).attr( 'backText', $( 'label.settingsHeader' ).html() );
                $( 'label.settingsHeader' ).attr( 'backTerm', $( 'label.settingsHeader' ).attr( 'term' ) );
                $( 'label.settingsHeader' ).html( $( '#lblsettings_theme' ).html() );
                $( 'label.settingsHeader' ).attr( 'term', $( '#lblsettings_theme' ).attr( 'term' ) );

                me.evalHideSections( 'settingsInfo_theme_Less' );
            }
            else
            {
                $( 'label.settingsHeader' ).html( me.langTermObj.translateText(  $( 'label.settingsHeader' ).attr( 'backText' ),  $( 'label.settingsHeader' ).attr( 'backTerm' ) ) );
                $( 'label.settingsHeader' ).attr( 'term', $( 'label.settingsHeader' ).attr( 'backTerm' ) );
                $( '#settingsInfo_theme_More' ).hide( 'fast' );
                $( '#settingsInfo_theme_Less' ).show( 'fast' );

                me.evalHideSections( 'settingsInfo_theme_Less' );
            }

        });

        $( '#imgsettingsInfo_network_Less' ).closest( 'div' ).click( function()
        {
            if ( $( '#imgsettingsInfo_network_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgsettingsInfo_network_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#settingsInfo_network_More' ).is(':visible') )
            {
                $( '#settingsInfo_network_Less' ).hide( 'fast' );
                $( '#settingsInfo_network_More' ).show( 'fast' );
                $( 'label.settingsHeader' ).attr( 'backText', $( 'label.settingsHeader' ).html() );
                $( 'label.settingsHeader' ).attr( 'backTerm', $( 'label.settingsHeader' ).attr( 'term' ) );
                $( 'label.settingsHeader' ).html( $( '#lblsettings_network' ).html() );
                $( 'label.settingsHeader' ).attr( 'term', $( '#lblsettings_network' ).attr( 'term' ) );

                me.evalHideSections( 'settingsInfo_network_Less' );
            }
            else
            {
                $( 'label.settingsHeader' ).html( me.langTermObj.translateText(  $( 'label.settingsHeader' ).attr( 'backText' ),  $( 'label.settingsHeader' ).attr( 'backTerm' ) ) );
                $( 'label.settingsHeader' ).attr( 'term', $( 'label.settingsHeader' ).attr( 'backTerm' ) );
                $( '#settingsInfo_network_More' ).hide( 'fast' );
                $( '#settingsInfo_network_Less' ).show( 'fast' );

                me.evalHideSections( 'settingsInfo_network_Less' );
            }

        });

        $( '#imgsettingsInfo_logoutDelay_Less' ).closest( 'div' ).click( function()
        {
            if ( $( '#imgsettingsInfo_logoutDelay_Less' ).hasClass( 'disabled' ) ) return;

            $( '#imgsettingsInfo_logoutDelay_Less' )[0].classList.toggle( "rotateImg" ); //find this class to call img click event

            if ( ! $( '#settingsInfo_logoutDelay_More' ).is(':visible') )
            {
                $( '#settingsInfo_logoutDelay_Less' ).hide( 'fast' );
                $( '#settingsInfo_logoutDelay_More' ).show( 'fast' );
                $( 'label.settingsHeader' ).attr( 'backText', $( 'label.settingsHeader' ).html() );
                $( 'label.settingsHeader' ).attr( 'backTerm', $( 'label.settingsHeader' ).attr( 'term' ) );
                $( 'label.settingsHeader' ).html( $( '#lblsettings_logout' ).html() );
                $( 'label.settingsHeader' ).attr( 'term', $( '#lblsettings_logoout' ).attr( 'term' ) );

                me.evalHideSections( 'settingsInfo_logoutDelay_Less' );
            }
            else
            {
                $( 'label.settingsHeader' ).html( me.langTermObj.translateText(  $( 'label.settingsHeader' ).attr( 'backText' ),  $( 'label.settingsHeader' ).attr( 'backTerm' ) ) );
                $( 'label.settingsHeader' ).attr( 'term', $( 'label.settingsHeader' ).attr( 'backTerm' ) );
                $( '#settingsInfo_logoutDelay_More' ).hide( 'fast' );
                $( '#settingsInfo_logoutDelay_Less' ).show( 'fast' );

                me.evalHideSections( 'settingsInfo_logoutDelay_Less' );
            }

        });

        $( '#lblsettings_userLanguage' ).css( 'user-select', 'none' );
        $( '#lblsettings_userLanguage' ).on( 'selectstart dragstart', false );

        $( '#lblsettings_userLanguage' ).click( () => {

            if ( $( '#lblsettings_userLanguage' ).attr( 'counter' ) )
            {

                if ( $( '#lblsettings_userLanguage' ).attr( 'counter' ) < 4 )
                {
                    var incr = parseInt( $( '#lblsettings_userLanguage' ).attr( 'counter' ) );
                    incr ++;
                    $( '#lblsettings_userLanguage' ).attr( 'counter', incr );

                    if ( me.easterEgg2Timer )
                    {
                        clearTimeout( me.easterEgg2Timer );
                    }
                    me.easterEgg2Timer = setTimeout( function() {
                        $( '#lblsettings_userLanguage' ).attr( 'counter', 0 );
                    }, 3000 );
                }
                else
                {
                    if ( me.easterEgg2Timer )
                    {
                        clearTimeout( me.easterEgg2Timer );
                    }

                    $( '#lblsettings_userLanguage' ).attr( 'counter', 0 );

                    me.langTermObj.debugMode = ( me.langTermObj.debugMode ? false : true );
                    me.langTermObj.translatePage();

                }

            }
            else
            {
                $( '#lblsettings_userLanguage' ).attr( 'counter', 1 )

                me.easterEgg2Timer = setTimeout( function() {
                    $( '#lblsettings_userLanguage' ).attr( 'counter', 0 );
                }, 3000 );
            }

            if ( me.langTermObj.debugMode )
            {
                $( '#lblsettings_userLanguage' ).css( 'text-decoration', 'underline' );
            }
            else
            {
                $( '#lblsettings_userLanguage' ).css( 'text-decoration', 'none' );
            }

        });
        
    

        cacheManager.initialise();

    }


	// ------------------

    me.showSettingsPage = function()
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

        me.settingsFormDivTag.show( 'fast' );    
    }

    me.hideSettingsPage = function()
    {
        me.settingsFormDivTag.fadeOut( 500 );

        setTimeout( function() {
            if ( FormUtil.checkLogin() > 0 )
            {
                $( 'div.mainDiv' ).show( 'fast' );
            }
            else
            {
                $( '#loginFormDiv' ).show( 'fast' );
            }
            me.settingsFormDivTag.hide();
        }, 250 );

    }


    me.renderNonEssentialFields = function( userLoggedIn )
    {

        if ( userLoggedIn )
        {

            if ( me.defaultsInitialised == 0 )
            {

                //$( '#settingsInfo_dcdVersion_Less' ).show();
                //$( '#settingsInfo_dcdVersion_Less' ).removeClass( 'byPassSettingsMore' );
    
                //$( '#settingsInfo_network_Less' ).show();
                //$( '#settingsInfo_network_Less' ).removeClass( 'byPassSettingsMore' )

                if ( me.langTermObj.getLangList() )
                {
                    $( '#settingsInfo_userLanguage_Less' ).show();
                    $( '#settingsInfo_userLanguage_Less' ).removeClass( 'byPassSettingsMore' );
                }
                else
                {
                    $( '#settingsInfo_userLanguage_Less' ).hide();
                    $( '#settingsInfo_userLanguage_Less' ).addClass( 'byPassSettingsMore' );
                }

                $( '#settingsInfo_theme_Less' ).show();
                $( '#settingsInfo_theme_Less' ).removeClass( 'byPassSettingsMore' )

                $( '#settingsInfo_networkMode_Less' ).show();
                $( '#settingsInfo_networkMode_Less' ).removeClass( 'byPassSettingsMore' );

                $( '#settingsInfo_geoLocation_Less' ).show();
                $( '#settingsInfo_geoLocation_Less' ).removeClass( 'byPassSettingsMore' );

                $( '#settingsInfo_autocomplete_Less' ).show();
                $( '#settingsInfo_autocomplete_Less' ).removeClass( 'byPassSettingsMore' );

                if ( Util.isMobi() )
                {
                    $( '#settingsInfo_soundEffects_Less' ).show();
                    $( '#settingsInfo_soundEffects_Less' ).removeClass( 'byPassSettingsMore' );
                }
                else
                {
                    $( '#settingsInfo_soundEffects_Less' ).hide();
                    $( '#settingsInfo_soundEffects_Less' ).addClass( 'byPassSettingsMore' );
                }

            }
        }
        else
        {

            $( '#settingsInfo_dcdVersion_Less' ).hide();
            $( '#settingsInfo_dcdVersion_Less' ).addClass( 'byPassSettingsMore' );

            $( '#settingsInfo_networkMode_Less' ).hide();
            $( '#settingsInfo_networkMode_Less' ).addClass( 'byPassSettingsMore' );

            $( '#settingsInfo_geoLocation_Less' ).hide();
            $( '#settingsInfo_geoLocation_Less' ).addClass( 'byPassSettingsMore' );

            $( '#settingsInfo_soundEffects_Less' ).hide();
            $( '#settingsInfo_soundEffects_Less' ).addClass( 'byPassSettingsMore' );

            $( '#settingsInfo_autoComplete_Less' ).hide();
            $( '#settingsInfo_autoComplete_Less' ).addClass( 'byPassSettingsMore' );

            if ( me.langTermObj.getLangList() )
            {
                $( '#settingsInfo_userLanguage_Less' ).show();
                $( '#settingsInfo_userLanguage_Less' ).removeClass( 'byPassSettingsMore' );
            }
            else
            {
                $( '#settingsInfo_userLanguage_Less' ).hide();
                $( '#settingsInfo_userLanguage_Less' ).addClass( 'byPassSettingsMore' );
            }

            $( '#settingsInfo_theme_Less' ).hide();
            $( '#settingsInfo_theme_Less' ).addClass( 'byPassSettingsMore' );

            $( '#settingsInfo_network_Less' ).hide();
            $( '#settingsInfo_network_Less' ).addClass( 'byPassSettingsMore' )

            $( '#settingsInfo_logoutDelay_Less' ).hide();
            $( '#settingsInfo_logoutDelay_Less' ).addClass( 'byPassSettingsMore' )

        }

        if ( ! $( '#settingsInfo_networkMode' ).attr( 'unselectable' )  )
        {
            $( '#settingsInfo_networkMode' ).attr( 'unselectable', 'on' );
            $( '#settingsInfo_networkMode' ).css( 'user-select', 'none' );
            $( '#settingsInfo_networkMode' ).on( 'selectstart', false );

            $( '#settingsInfo_networkMode' ).click( () => {

                if ( $( '#settingsInfo_networkMode' ).attr( 'counter' ) )
                {

                    if ( $( '#settingsInfo_networkMode' ).attr( 'counter' ) < 4 )
                    {
                        var incr = parseInt( $( '#settingsInfo_networkMode' ).attr( 'counter' ) );
                        incr ++;
                        $( '#settingsInfo_networkMode' ).attr( 'counter', incr );

                        if ( me.easterEgg1Timer )
                        {
                            clearTimeout( me.easterEgg1Timer );
                        }
                        me.easterEgg1Timer = setTimeout( function() {
                            $( '#settingsInfo_networkMode' ).attr( 'counter', 0 );
                        }, 3000 );
                    }
                    else
                    {
                        if ( me.easterEgg1Timer )
                        {
                            clearTimeout( me.easterEgg1Timer );
                        }

                        $( '#settingsInfo_networkMode' ).attr( 'counter', 0 );

                        var requestConnMode;

                        if ( $( '#settingsInfo_networkMode' ).find('div').html() == ConnManager.connStatusStr( ConnManagerNew.statusInfo.appMode.toLowerCase() ).toLowerCase() )
                        {
                            // current setting is actual network condition setting > prompt to CHANGE TO OFFLINE (if online), or visa versa
                            requestConnMode = ! ConnManagerNew.statusInfo.appMode.toLowerCase();
                        }
                        else
                        {
                            // current setting is NOT actual network condition setting > prompt to change back
                            requestConnMode = ConnManagerNew.statusInfo.appMode.toLowerCase();
                        }

                        ConnManager.changeConnModeTo = requestConnMode;
                        ConnManager.changeConnModeStr = "switch";
                        ConnManager.setUserNetworkMode( requestConnMode );

                        var btnSwitch = $( '<a class="notifBtn" term=""> ' + ConnManager.connStatusStr( requestConnMode ).toUpperCase() + ' </a>');

                        $( btnSwitch ).click ( () => {
                            ConnManager.userNetworkMode = true;
                            ConnManager.switchPreDeterminedConnMode();
                            $( '#settingsInfo_networkMode' ).html( '<div>' + ConnManager.connStatusStr( ConnManagerNew.statusInfo.appMode.toLowerCase() ).toLowerCase() + '</div>' );
                        });

                        // MISSING TRANSLATION
                        questionStr = "Force network mode switch?";
                        MsgManager.notificationMessage ( questionStr, 'notificationDark', btnSwitch, '', 'right', 'top', 15000, true );

                    }

                }
                else
                {
                    $( '#settingsInfo_networkMode' ).attr( 'counter', 1 )

                    me.easterEgg1Timer = setTimeout( function() {
                        $( '#settingsInfo_networkMode' ).attr( 'counter', 0 );
                    }, 3000 );
                }

            });

        }

        if ( me.langTermObj.debugMode )
        {
            $( '#lblsettings_userLanguage' ).css( 'text-decoration', 'underline' );
        }
        else
        {
            $( '#lblsettings_userLanguage' ).css( 'text-decoration', 'none' );
        }

    }

    me.populateSettingsPageData = function( dcdConfig ) 
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
                me.populatelogoutDelayList_Show( me.getLogoutOptions(), me.cwsRenderObj.autoLogoutDelayMins )

            }
        }

        // Populate data
        $( '#settingsInfo_AppVersion' ).html( $( '#spanVersion' ).html().replace('v','') );
        $( '#settingsInfo_Browser' ).html( navigator.sayswho );

        if ( ! me.langTermObj.getLangList() )
        {
            $( '#settingsInfo_userLanguage_DBupdate' ).hide();
            $( '#imgsettingsInfo_userLanguage_Less' ).removeClass( 'enabled' );
            $( '#imgsettingsInfo_userLanguage_Less' ).addClass( 'disabled' );
        }
        else
        {
            $( '#settingsInfo_userLanguage_DBupdate' ).show();
            $( '#imgsettingsInfo_userLanguage_Less' ).removeClass( 'disabled' );
            $( '#imgsettingsInfo_userLanguage_Less' ).addClass( 'enabled' );
        }

        if ( FormUtil.checkLogin() )
        {

            $( '#settingsInfo_dcdVersion' ).html( dcdConfigVersion );
            $( '#settingsInfo_networkMode' ).html( '<div>' + ConnManager.connStatusStr( ConnManagerNew.statusInfo.appMode.toLowerCase() ).toLowerCase() + '</div>' );
            $( '#settingsInfo_geoLocation' ).html( '<div>' + FormUtil.geoLocationState + ( ( me.getCoordinatesForPresentation() ).toString().length ? ': ' + me.getCoordinatesForPresentation() : '' ) + '</div>' );

            var sessData = JSON.parse( localStorage.getItem( "session" ) );

            me.settingsInfo_SoundSwitchInput.prop( 'checked', sessData.soundEffects );
            me.settingsInfo_autoCompleteInput.prop( 'checked', sessData.autoComplete );

            ConnManager.getDcdConfigVersion( function( retVersion ) 
            {
                var userConfig = JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem(Constants.storageName_session) ).user ) );
    
                if ( ( userConfig.dcdConfig.version ).toString() < retVersion.toString() )
                {
                    $( '#settingsInfo_dcdNewVersion' ).html( retVersion );
                    if ( $( '#imgsettingsInfo_dcdVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgsettingsInfo_dcdVersion_Less' ).removeClass( 'disabled' );
                    if ( ! $( '#imgsettingsInfo_dcdVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgsettingsInfo_dcdVersion_Less' ).addClass( 'enabled' );	
                    $( '#settingsInfo_dcdNewVersion' ).show();
                }
                else
                {
                    $( '#settingsInfo_dcdNewVersion' ).hide();
                    if ( ! $( '#imgsettingsInfo_dcdVersion_Less' ).hasClass( 'disabled' ) ) $( '#imgsettingsInfo_dcdVersion_Less' ).addClass( 'disabled' );
                    if ( $( '#imgsettingsInfo_dcdVersion_Less' ).hasClass( 'enabled' ) ) $( '#imgsettingsInfo_dcdVersion_Less' ).removeClass( 'enabled' );
                }
            });

            me.getStorageSummary( $( '#settingsInfo_StorageSize' ) ); //, DataManager.storageEstimate

        }

    }

    me.getStorageSummary = function( targetTag ) // , storageJSON
    {

        targetTag.empty();

        DataManager.estimateStorageUse( function( storageJSON ){

            var quotaDenom = parseFloat( storageJSON.quota ) / 1024 / 1024;
            var suffix = 'MB';
    
            if ( quotaDenom > 1000 )
            {
                quotaDenom = ( quotaDenom / 1000 );
                suffix = 'GB';
            }
    
            targetTag.append( Util.numberWithCommas( parseFloat( parseFloat( storageJSON.usage ) / 1024 / 1024 ).toFixed( 1 ) ) + ' ' + 'MB' + ' used of available ' + Util.numberWithCommas( parseFloat( quotaDenom ).toFixed( 1 ) + ' ' + suffix ) );
    
            var sizeProgress = parseFloat( parseFloat( storageJSON.usage ) / parseFloat( storageJSON.quota ) * 100 ).toFixed(1);
            var colors = ( sizeProgress < 40 ? 'green' : ( sizeProgress > 70 ) ? 'red' : 'orange' );
    
            var progContainer = $( '<div style="height:8px;border:1px solid #F5F5F5;margin:8px 0 0 0;background-Color:#fff;width:100%;text-align:left;" />' );
    
            var progTbl =  $( '<table style="height:6px;border:0;margin:0;width:100%;border-collapse: collapse;" />' );
            var tr =       $( '<tr>' );
            var tdGreen  = $( '<td class="storageUsageGreenBar" style="opacity:0.75">' );
            var tdOrange = $( '<td class="storageUsageYellowBar" style="opacity:0.75">' );
            var tdRed    = $( '<td class="storageUsageRedBar" style="opacity:0.75">' );
    
            var progProgress  = $( '<div style="height:12px;width:3px;border:0;margin:0;background-Color:#000;position:relative;left:'+ sizeProgress +'%;top:-10px;border-radius:2px" />' );
    
            targetTag.append( progContainer );
            progContainer.append( progTbl );
    
            progTbl.append( tr );
            tr.append( tdGreen );
            tr.append( tdOrange );
            tr.append( tdRed );
    
            targetTag.append( progProgress );

        })

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
        Util.populateSelect( me.settingsInfo_langSelectTag, "Language", languageList );

        if ( defaultLangCode )
        {
            me.setLanguageDropdownFromCode( languageList, defaultLangCode )
        }

        $( '#settingsInfo_userLanguage_Name' ).html( me.getListNameFromID( languageList, defaultLangCode ) );
        $( '#settingsInfo_userLanguage_Update' ).html( 'Refresh date' + ': ' + me.getLanguageUpdate( languageList, defaultLangCode ) );
        $( '#settingsInfo_DivLangSelect' ).show();

    }

    me.setLanguageDropdownFromCode = function ( languageList, langCode )
    {
		$.each( languageList, function( i, item ) 
		{
            if ( item.id == langCode )
            {
                Util.setSelectDefaultByName( me.settingsInfo_langSelectTag, item.name );
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
        Util.populateSelect( me.settingsInfo_ThemeSelectTag, "Theme", ThemeList );

        if ( defaultTheme )
        {
            Util.setSelectDefaultByName( me.settingsInfo_ThemeSelectTag, defaultTheme );
        }

        $( '#settingsInfo_theme_Text' ).html( defaultTheme );
        $( '#settingsInfo_DivThemeSelect' ).show();
    }

    me.populateNetworkSyncList_Show = function( syncEveryList, syncTimer )
    {


        Util.populateSelect( me.settingsInfo_NetworkSync, "", syncEveryList );
        Util.setSelectDefaultByName( me.settingsInfo_NetworkSync, syncTimer );
        me.settingsInfo_NetworkSync.val( syncTimer ); 

        $( '#settingsInfo_network_Text' ).html( ( syncTimer > 0 ? 'every' : '') + ' ' + me.getListNameFromID( syncEveryList, syncTimer ) );
        $( '#settingsInfo_DivnetworkSelect' ).show();
    }

    
    me.populatelogoutDelayList_Show = function( syncEveryList, syncTimer )
    {

        Util.populateSelect( me.settingsInfo_logoutDelay, "", syncEveryList );
        Util.setSelectDefaultByName( me.settingsInfo_logoutDelay, syncTimer );
        me.settingsInfo_logoutDelay.val( syncTimer ); 

        $( '#settingsInfo_logout_Text' ).html( ( syncTimer > 0 ? 'every' : '') + ' ' + me.getListNameFromID( syncEveryList, syncTimer ) );
        $( '#settingsInfo_DivlogoutSelect' ).show();
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


    me.getLogoutOptions = function()
    {
        var retOpts = []
        var syncOpts = {};

        syncOpts.id = 10;
        syncOpts.name = '10 min';
        retOpts.push( syncOpts );

        syncOpts = {};
        syncOpts.id = 30;
        syncOpts.name = '30 mins';
        retOpts.push( syncOpts );

        syncOpts = {};
        syncOpts.id = 60;
        syncOpts.name = '60 mins';
        retOpts.push( syncOpts );

        return retOpts;

    }

    me.updateAutoComplete = function( newValue )
    {
		var tagsWithAutoCompl = $( '[autocomplete]' );

		tagsWithAutoCompl.each( function() 
		{
            var tag = $( this );
            tag.attr( 'autocomplete', newValue );
        });

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