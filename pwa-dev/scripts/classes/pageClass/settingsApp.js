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

    me.syncOptions = [ { 'id': 0, 'name': 'off' }
        ,{ 'id': 300000, 'name': '5 min' }
       ,{ 'id': 600000, 'name': '10 min' }
       ,{ 'id': 1800000, 'name': '30 min' }
       ,{ 'id': 3600000, 'name': '1 hr' }
       ,{ 'id': 86400000, 'name': '24 hr' } ];

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


        $( '#buttonResetData' ).click( function()
        {
            FormUtil.blockPage( undefined, function( scrimTag ) 
			{
                // Populates the center aligned #dialog_confirmation div
                FormUtil.genTagByTemplate( FormUtil.getSheetBottomTag(), Templates.settings_app_data_configuration, function( tag ) 
                {
                    TranslationManager.translatePage();

                    $( '.divResetApp_Accept' ).click( function() {
                        DataManager2.deleteAllStorageData( function() {					
                            FormUtil.emptySheetBottomTag();
                            
                            FormMsgManager.appBlockTemplate('appLoad');
            
                            SwManager.reGetAppShell();
                        });
                    });
        
                    $( '.divResetApp_Cancel' ).click( function() 
                    {				
                        FormUtil.emptySheetBottomTag();
                        FormUtil.unblockPage( scrimTag );
                    });
                });
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
        me.populateNetworkSyncList_Show( me.settingsInfo_NetworkSync, me.syncOptions, AppInfoManager.getNetworkSync() );

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
    };
    

    me.getLanguageUpdate = function( languageList, defaultLangCode )
    {
        // getLangList not used?
        var langList = TranslationManager.getLangList();

        for( i = 0; i < languageList.length; i++ )
        {
            if ( languageList[i].id == defaultLangCode )
            {
                return languageList[i].updated;
            }
        }
    };


    me.populateNetworkSyncList_Show = function( listTag, syncEveryList, syncTimer )
    {
        Util.populateSelect( listTag, "", syncEveryList );
        
        if ( !Util.checkItemOnSelect( listTag, syncTimer ) )
        {
            // If the value passed in is not in the list, add to the list...
            var optionName = Util.getTimeFromMs( syncTimer, 'minute', ' mins' );
            Util.appendOnSelect( listTag, [ { 'id': syncTimer, 'name': optionName } ] );
        }

        listTag.val( syncTimer );
        //Util.setSelectDefaultByName( listTag, syncTimer );

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
        me.settingsFormDivTag.find( '.linkAppVersionCheck' ).off( 'click' ).click( function() 
        {
            console.customLog( 'linkAppVersionCheck clicked!!' );
        });    

        me.settingsFormDivTag.find( '.linkAppUpdateCheck' ).off( 'click' ).click( function() 
        {
            // ?? Check only if during online?
            SwManager.checkNewAppFile( function() 
            {
                MsgManager.msgAreaShow( 'New App Update Found!' );
                SessionManager.cwsRenderObj.newSWrefreshNotification();    
            });
        });      

        me.settingsFormDivTag.find( '.linkAppUpdateRefresh' ).off( 'click' ).click( function() 
        {
            AppUtil.appReloadWtMsg();
        });      

        // New log open dialog
        me.settingsFormDivTag.find( '.showLogs' ).off( 'click' ).click( function() 
        {
            FormUtil.blockPage( undefined, function( scrimTag ) 
            {            
                ConsoleCustomLog.showDialog();
                    
                scrimTag.off( 'click' ).click( function() 
                {
                    FormUtil.unblockPage( scrimTag );
                });
            });
        });
        
        me.settingsFormDivTag.find( '.syncDown' ).off( 'click' ).click( function() 
        {
            if ( !ConfigManager.getSyncDownSetting().enable ) MsgManager.msgAreaShow( 'SyncDown not enabled in config settings.' );
            else
            {
                if ( !ConnManagerNew.isAppMode_Online() ) MsgManager.msgAreaShow( 'SyncDown not available on offline.' );
                else
                {
                    SyncManagerNew.syncDown( 'manualClick', function( success, changeOccurred, mockCase, mergedActivities ) {

                        if ( success ) 
                        {  
                            // NOTE: If there was a new merge, for now, alert the user to reload the list?
                            if ( changeOccurred && !mockCase )
                            {
                                if ( mergedActivities.length > 0 )
                                {
                                    var btnRefresh = $( '<a class="notifBtn" term=""> REFRESH </a>');
            
                                    $( btnRefresh ).click ( () => {
                                        SessionManager.cwsRenderObj.renderArea( SessionManager.cwsRenderObj.areaList[ 0 ].id );
                                    });
                
                                    MsgManager.notificationMessage ( 'SyncDown data found', 'notifBlue', btnRefresh, '', 'right', 'top', 10000, false );    
                                }                                
                            }
                        }
                        else MsgManager.msgAreaShow( 'SyncDown not successful.' );
                    });   
                }
            }
        });

        me.settingsFormDivTag.find( '.dataShare' ).off( 'click' ).click( function() 
        {
            FormUtil.blockPage( undefined, function( scrimTag ) 
            {            
                //ConsoleCustomLog.showDialog();
                me.showDataShareDiv( $( '#divDataShare' ) );

                scrimTag.off( 'click' ).click( function() 
                {
                    FormUtil.unblockPage( scrimTag );
                });
            });
        });     

    };


    me.showDataShareDiv = function( divDataShareTag )
    {
        divDataShareTag.show();
        $('.scrim').show();

        var btnCloseTag = divDataShareTag.find( 'div.close' );
        btnCloseTag.off( 'click' ).click( function () {
            $('.scrim').hide();
            divDataShareTag.hide();
        });       
               
        divDataShareTag.find( '.btnShare' ).off( 'click' ).click( function () 
        {
            var shareCodeTag = divDataShareTag.find( '.inputShareCode' );
            var shareCode = Util.trim( shareCodeTag.val() );

            if ( !shareCode ) MsgManager.msgAreaShow( 'Need shareCode!', 'ERROR' );
            else 
            {
                var loadingTag = FormUtil.generateLoadingTag( $( this ) );

                var idenObj = { 'info.userName': SessionManager.sessionData.login_UserName, 'info.shareCode': shareCode };

                var infoJson = { 'userName': SessionManager.sessionData.login_UserName, 'shareCode': shareCode
                    , 'timestamp': Util.getUTCDateTimeStr() };
                var updateData = { 'info': infoJson, 'clientList': ClientDataManager.getClientList() };

                var dataJson = { 'idenObj': idenObj, 'updateData': updateData, 'option': { 'upsert': true } };
                var payloadJson = { 'dataJson': dataJson };
    
                WsCallManager.requestPostDws( '/PWA.shareData', payloadJson, loadingTag, function( success, returnJson ) 
                {
                    var isSuccess = false;
                    if ( success && returnJson )
                    {					
                        if ( returnJson && returnJson.response && returnJson.response.result 
                            && returnJson.response.result.n === 1 )  // also .result.ok = 1 could be checked?
                        {
                            shareCodeTag.val( '' );
                            isSuccess = true;
                            //console.customLog( returnJson );    

                            me.AddShareLogMsg( divDataShareTag, 'SHARE UPLOADED. shareCode: ' + shareCode );
                        }
                    }

                    if ( isSuccess ) MsgManager.msgAreaShow( 'DataShare Submit Success!' );
                    else MsgManager.msgAreaShow( 'DataShare Submit FAILED!', 'ERROR' );
                });	
            }
        });       


        divDataShareTag.find( '.btnLoad' ).off( 'click' ).click( function () 
        {
            var loadCodeTag = divDataShareTag.find( '.inputLoadCode' );
            var loadCode = Util.trim( loadCodeTag.val() );

            if ( !loadCode ) MsgManager.msgAreaShow( 'Need loadCode!', 'ERROR' );
            else 
            {
                var loadingTag = FormUtil.generateLoadingTag( $( this ) );

                var findJson = { 'info.userName': SessionManager.sessionData.login_UserName, 'info.shareCode': loadCode };
                var payloadJson = { 'find': findJson };
    
                WsCallManager.requestPostDws( '/PWA.loadData', payloadJson, loadingTag, function( success, returnJson ) 
                {
                    var isSuccess = false;
                    if ( success && returnJson )
                    {					
                        if ( returnJson && returnJson.response && returnJson.response.dataList
                            && returnJson.response.dataList.length > 0 )
                        {
                            var clientList = returnJson.response.dataList[0].clientList;
                            loadCodeTag.val( '' );
                            isSuccess = true;
                            
                            ClientDataManager.setActivityDateLocal_clientList( clientList );

                            ClientDataManager.mergeDownloadedClients( { 'clients': clientList }, undefined, function() 
                            {
                                console.customLog( 'LoadData clients merged' );
                                SessionManager.cwsRenderObj.renderArea( SessionManager.cwsRenderObj.areaList[ 0 ].id );
                            });

                            me.AddShareLogMsg( divDataShareTag, 'LOADED. loadCode: ' + loadCode );
                        }
                    }

                    if ( isSuccess ) MsgManager.msgAreaShow( 'DataLoad Success!' );
                    else MsgManager.msgAreaShow( 'DataLoad FAILED!', 'ERROR' );
                });	
            }            
        });       
    }

    me.AddShareLogMsg = function( divDataShareTag, logMsg )
    {
        var dateTimeStr = Util.formatDateTime( new Date(), "MM-dd HH:mm" );
        logMsg = '[' + dateTimeStr + '] ' + logMsg;
        
        //var logMsg = '[Time: ' + infoJson.timestamp + '] ' + 'SHARE UPLOADED. shareCode: ' + infoJson.shareCode;
        var logMsgDivTag = $( '<div style="font-weight: 300;">' + logMsg + '</div>' );

        var divMainContentTag = divDataShareTag.find( '.divMainContent' );

        divMainContentTag.append( logMsgDivTag );
    };


    me.setNewAppFileStatus = function( newAppFilesFound )
	{
        if ( newAppFilesFound ) 
        {
            me.settingsFormDivTag.find( '.linkAppUpdateCheck' ).hide();    
            me.settingsFormDivTag.find( '.linkAppUpdateRefresh' ).show();
        }
        else 
        {
            me.settingsFormDivTag.find( '.linkAppUpdateCheck' ).show();    
            me.settingsFormDivTag.find( '.linkAppUpdateRefresh' ).hide();
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

	}

	// ------------------------------------

	me.initialize();
}