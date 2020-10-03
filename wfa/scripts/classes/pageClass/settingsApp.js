// -------------------------------------------
// -- BlockMsg Class/Methods
function settingsApp( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;

    me.settingsFormDivTag = $( '#settingsFormDiv' );
    me.settingsData;
    me.themeList;

    // ----- Tags -----------
    me.settingsInfo_langSelectTag = $( '#settingsInfo_langSelect' );
    me.settingsInfo_ThemeSelectTag = $( '#settingsInfo_ThemeSelect' );
    me.settingsInfo_NetworkSync = $( '#settingsInfo_networkSync' );
    me.settingsInfo_logoutDelay = $( '#settingsInfo_logoutDelay' );
    me.settingsInfo_SoundSwitchInput = $( '#soundSwitchInput' );
    me.settingsInfo_autoCompleteInput = $( '#autoCompleteInput' );

    me.easterEgg1Timer = 0; // click 5x to change network mode to opposite of current mode
    me.easterEgg2Timer = 0; // activate Translations debugging

    me.scrimTag = me.settingsFormDivTag.find('.sheet_bottom-scrim');

    me.themeList = [ 'theme-red', 'theme-pink', 'theme-purple', 'theme-deep_purple', 'theme-indigo', 'theme-blue'
    , 'theme-light_blue', 'theme-cyan', 'theme-teal', 'theme-green', 'theme-light_green', 'theme-lime', 'theme-yellow'
    , 'theme-amber', 'theme-orange', 'theme-deep_orange', 'theme-brown', 'theme-gray', 'theme-blue_gray', ];


	// === TEMPLATE METHODS ========================

    me.initialize = function() 
    {
        me.setEvents_OnInit();
    }

	// ------------------

    me.render = function() 
    {
        me.populateSettingsPageData( ConfigManager.getConfigJson() );
        
        TranslationManager.translatePage();

        me.showSettingsPage();
    }

	// ------------------

	me.setEvents_OnInit = function()
	{		
        // --------------
        // BUTTON CLICKS

        var show = false;

        $('#languageCollapsibleHeader').click( ()=> {

            $('#languageCollapsibleBody').slideToggle('fast');

            if( show )
            {
                $('#languageCollapsibleBody').css('border-bottom','none')
                $('#languageCollapsibleHeader').css('border-bottom','2px solid #F5F5F5')
            }
            else
            {
                $('#languageCollapsibleHeader').css('border-bottom','none')
                $('#languageCollapsibleBody').css('border-bottom','2px solid #F5F5F5')
            }
            show = !show;
        });



        $( '#settingsAppRestHeader' ).click( function() {

            $( '#bodyCollapsible' ).slideToggle( 'fast' );

            $( '#settingsAppRestHeader' ).toggleClass( 'collapsible-body--on' );

        });


        $( '#buttonResetData' ).click(function(){

            me.blockPage();

            me.settingsFormDivTag.append ( Templates.settings_app_data_configuration );
            TranslationManager.translatePage();

            $( '.divResetApp_Accept' ).click( function() {

                try
                {
                    DataManager2.deleteAllStorageData( function() {
                        SwManager.reGetAppShell();
                    });
                }
                catch ( errMsg ) {
                    console.customLog( 'About Page, buttonResetData, errMsg: ' + errMsg );
                    SwManager.reGetAppShell();
                }
            });

            $( '.divResetApp_Cancel' ).click( function() {
                me.unblockPage();
                $( '#dialog_confirmation' ).remove();
            });

        });


        var divButtonDcdVersionTag = $( 'settingsInfo_dcdVersionInner' );
        var btnDcdConfigTag = $( '#dcdUpdateBtn' );

        $( btnDcdConfigTag ).click( () => {
            if ( !ConnManagerNew.isAppMode_Online() )
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
            TranslationManager.setLangCode( me.settingsInfo_langSelectTag.val() );

            TranslationManager.setCurrLangTerms();

			TranslationManager.translatePage();
        });


        me.settingsInfo_ThemeSelectTag.change ( () => 
        {    
            $("body").removeClass().addClass( me.settingsInfo_ThemeSelectTag.val() );

            var sessData = AppInfoManager.getUserInfo();

            sessData.theme = me.settingsInfo_ThemeSelectTag.val();
            AppInfoManager.updateUserInfo( sessData );
        });

        me.settingsInfo_NetworkSync.change ( () => 
        {
            // Save Data in AppInfoManager for later use...
            AppInfoManager.updateNetworkSync( me.settingsInfo_NetworkSync.val() );

            ScheduleManager.schedule_syncAll_Background( me.cwsRenderObj );            
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
                    if ( $( obj ).is(':visible') ) $( obj ).hide();
                    else $( obj ).show();
                }

            });
        }


        $( '#settingsInfo_newLangTermsDownload' ).click( function() 
        {
            var btnDownloadTag = $( this );
            //var langSelVal = me.settingsInfo_langSelectTag.val();
            //var loadingTag = FormUtil.generateLoadingTag(  btnDownloadTag );
            //$("#imgSettingLangTermRotate").addClass("rot_l_anim");
           // FormUtil.showProgressBar();

           TranslationManager.loadLangTerms_NSetUpData( true, function( allLangTerms ) 
           {
               if ( allLangTerms )
               {
                    me.populateLangList_Show( TranslationManager.getLangList(), TranslationManager.getLangCode() );
    
                    // Translate current page
                    TranslationManager.translatePage();
               }
           });
        });
    }

	// ------------------

    me.showSettingsPage = function()
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

        me.settingsFormDivTag.show();    
    }

    me.hideSettingsPage = function()
    {
        //me.settingsFormDivTag.fadeOut( 500 );
        me.settingsFormDivTag.hide();

        $( '#pageDiv' ).show();
    }

    
    
    me.populateSettingsPageData = function( dcdConfig ) 
    {
        me.populateNetworkSyncList_Show( me.getSyncOptions(), AppInfoManager.getNetworkSync() );

        me.populateThemeList( me.settingsInfo_ThemeSelectTag, me.themeList );

        me.setUpMoreInfoDiv();
    }

    
    me.populateThemeList = function( settingsInfo_ThemeSelectTag, themeList )
    {        
        Util.populateSelect_Simple( settingsInfo_ThemeSelectTag, themeList );
        
        settingsInfo_ThemeSelectTag.val( $("body")[0].classList[ 0 ] );
    };


    me.renderNonEssentialFields = function( userLoggedIn )
    {

        if ( ! $( '#settingsInfo_networkMode' ).attr( 'unselectable' )  )
        {
            $( '#settingsInfo_networkMode' ).attr( 'unselectable', 'on' );
            $( '#settingsInfo_networkMode' ).css( 'user-select', 'none' );
            $( '#settingsInfo_networkMode' ).on( 'selectstart', false );

            $( '#settingsInfo_networkMode' ).click( () => {
                alert("this feature has been disabled !");
            });
        }
    }


    // Called from cwsRender class on 'render'
    me.populateLangList_Show = function( languageList, defaultLangCode )
    {   
        Util.populateSelect( me.settingsInfo_langSelectTag, "Language", languageList );

        if ( defaultLangCode )
        {
            me.setLanguageDropdownFromCode( languageList, defaultLangCode )
        }

        //$( '#settingsInfo_userLanguage_Name' ).html( me.getListNameFromID( languageList, defaultLangCode ) );

        $( '#settingsInfo_userLanguage_Update' ).val( 'Refresh date: ' + AppInfoManager.getLangLastDateTime() );

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
        var langList = TranslationManager.getLangList();

        for( i = 0; i < languageList.length; i++ )
        {
            if ( languageList[i].id == defaultLangCode )
            {
                return languageList[i].updated;
            }
        }

    }


    me.populateNetworkSyncList_Show = function( syncEveryList, syncTimer )
    {
        Util.populateSelect( me.settingsInfo_NetworkSync, "", syncEveryList );
        Util.setSelectDefaultByName( me.settingsInfo_NetworkSync, syncTimer );
        me.settingsInfo_NetworkSync.val( syncTimer ); 

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
 


    me.setUpMoreInfoDiv = function()
    {
        // New log open dialog
        $( '#showLogs' ).off( 'click' ).click( function() 
        {
            ConsoleCustomLog.showDialog();
        });


        $( '#linkAppVersionCheck' ).off( 'click' ).click( function() 
        {
            console.customLog( 'linkAppVersionCheck clicked!!' );
        });    

        $( '#linkAppUpdateCheck' ).off( 'click' ).click( function() 
        {
            // ?? Check only if during online?
            SwManager.checkNewAppFile( function() 
            {
                MsgManager.msgAreaShow( 'New App Update Found!' );
                SessionManager.cwsRenderObj.newSWrefreshNotification();    
            });
        });      

        $( '#linkAppUpdateRefresh' ).off( 'click' ).click( function() 
        {
            AppUtil.appReloadWtMsg();
        });      

        $( '#syncDown' ).off( 'click' ).click( function() 
        {
            if ( !ConfigManager.getSyncDownSetting().enable ) MsgManager.msgAreaShow( 'SyncDown not enabled in config settings.' );
            else
            {
                if ( !ConnManagerNew.isAppMode_Online() ) MsgManager.msgAreaShow( 'SyncDown not available on offline.' );
                else
                {
                    SyncManagerNew.syncDown( 'manualClick', function( success, changeOccurred ) 
                    {        
                        if ( success ) 
                        {  
                            // NOTE: If there was a new merge, for now, alert the user to reload the list?
                            if ( changeOccurred )
                            {
                                var btnRefresh = $( '<a class="notifBtn" term=""> REFRESH </a>');
            
                                $( btnRefresh ).click ( () => {
                                    SessionManager.cwsRenderObj.renderArea( SessionManager.cwsRenderObj.areaList[ 0 ].id );
                                });
            
                                MsgManager.notificationMessage ( 'SyncDown data found', 'notificationBlue', btnRefresh, '', 'right', 'top', 10000, false );
                            }
                        }
                        else MsgManager.msgAreaShow( 'SyncDown not successful.' );
                    });   
                }
            }
        });

    };


    me.setNewAppFileStatus = function( newAppFilesFound )
	{
        if ( newAppFilesFound ) 
        {
            $( '#linkAppUpdateCheck' ).hide();    
            $( '#linkAppUpdateRefresh' ).show();
        }
        else 
        {
            $( '#linkAppUpdateCheck' ).show();    
            $( '#linkAppUpdateRefresh' ).hide();
        }
	};


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

    me.updateAutoComplete = function( newValue )
    {
		var tagsWithAutoCompl = $( '[autocomplete]' );

		tagsWithAutoCompl.each( function() 
		{
            var tag = $( this );
            tag.attr( 'autocomplete', newValue );
        });

    }


	me.blockPage = function()
	{
		me.scrimTag.show();

		me.scrimTag.off( 'click' );

		me.scrimTag.click( function(){
			me.unblockPage();
		} )
	}

	me.unblockPage = function()
	{
        me.scrimTag.hide();

		$( '#dialog_confirmation' ).remove();
	}

	// ------------------------------------

	me.initialize();
}