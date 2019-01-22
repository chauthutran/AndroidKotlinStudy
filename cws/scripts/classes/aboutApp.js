// -------------------------------------------
// -- BlockMsg Class/Methods
function aboutApp( cwsRender, langTermObj )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.aboutFormDivTag = $( '#aboutFormDiv' );
    me.aboutContentDivTag = $( '#aboutContentDiv' );
    me.aboutData;
    me.syncMgr;
    me.langTermObj = langTermObj;

    // ----- Tags -----------
    var aboutInfo_langSelectTag = $( '#aboutInfo_langSelect' );



	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================



	// -----------------------------
	// ---- Methods ----------------

	me.initialize = function() {

        //me.aboutContentDivTag.empty();
        // me.resetValues();
        me.setEvents_OnInit();
    }

	// ------------------
    
    me.render = function() 
    {       
        me.populateAboutPageData( DataManager.getUserConfigData() );
        
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
        
        
        aboutInfo_langSelectTag.change( () => 
        {    
            me.langTermObj.setCurrentLang( aboutInfo_langSelectTag.val() );    

            me.langTermObj.translatePage();
        }); 


        $( '#aboutInfo_CloseBtn' ).click( () =>
        {
            me.hideAboutPage();        
        });
        

        $( '#aboutInfo_newLangTermsDownload' ).click( () =>
        {
            var loadingTag = FormUtil.generateLoadingTag(  $( this ) );

            //loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading.gif"></div>' );
            //btnTag.after( loadingTag );

            me.langTermObj.retrieveAllLangTerm( function() {
                loadingTag.remove();
                //aboutInfo_langSelectTag.val( '' );
                aboutInfo_langSelectTag.change();
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



    me.populateAboutPageData = function( userConfig ) 
    {
        // Dcd Config related data set
        var dcdConfigVersion = "";
        var dcdConfigSettingThemem = "";

        if ( userConfig && userConfig.dcdConfig )
        {
            if ( userConfig.dcdConfig.version ) dcdConfigVersion = userConfig.dcdConfig.version;
            if ( userConfig.dcdConfig.settings && userConfig.dcdConfig.settings.theme ) dcdConfigSettingThemem = userConfig.dcdConfig.settings.theme;
        }


        // Populate data
        $( '#aboutInfo_AppVersion' ).html( $( '#spanVersion' ).html().replace('v','') );
        $( '#aboutInfo_dcdVersion' ).html( dcdConfigVersion );
        $( '#aboutInfo_Browser' ).html( navigator.sayswho );
        $( '#aboutInfo_Language' ).html( FormUtil.defaultLanguage() );
        $( '#aboutInfo_Theme' ).html( dcdConfigSettingThemem );


        // Dropdown Populate
        
	    //me.getCurrentLangCode();

        //valueTag.append( '<select id="aboutInfo_langSelect"></select>' );


        //me.cwsRenderObj.langTermObj.translatePage();

        me.syncMgr = new syncManager();
        me.syncMgr.appShellVersionTest( $( '#appShellUpdateBtn' ) );
        me.syncMgr.dcdConfigVersionTest( $( '#dcdUpdateBtn' ) );        
    }


    me.populateLangList_Show = function( langaugeList, defaultLangCode )
    {        
        Util.populateSelect( aboutInfo_langSelectTag, "Language", langaugeList );

        if ( defaultLangCode )
        {
            Util.setSelectDefaultByName( aboutInfo_langSelectTag, defaultLangCode );
        }

        $( '#aboutInfo_DivLangSelect' ).show();
    }


    /*
    me.hide = function() {
        me.aboutContentDivTag.empty();
        me.aboutFormDivTag.hide()
    }

    me.render = function() {

        //me.aboutData = me.getAboutInfo();
        var userConfig = JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem('session') ).user ) );

        if ( $( 'div.mainDiv' ).is( ":visible" ) )
        {
            $( 'div.mainDiv' ).hide();
        }

        me.aboutFormDivTag.show( 'fast' );

            if (userConfig)
            {

                me.aboutContentDivTag.empty();

                var divContainerTag = $( '<ul class="aboutDivContainer" style="border-bottom:0;position:fixed;text-align:left;max-width:900px;min-width:250px;" />' );
                me.aboutContentDivTag.append( divContainerTag );

                var divAttrTag = $( '<li class="inputDiv" style="width:250px;margin: 15px 0 0 0;" />' );
                divContainerTag.append( divAttrTag );

                var divHeaderLabelTag = $( '<label class="from-string titleDiv" style="max-width:250px;text-align: left;font-size: 1.1em;background-color: #fff;color:#000;padding:10px;" /><br>' );
                divHeaderLabelTag.html( 'About' );
                divAttrTag.append( divHeaderLabelTag );

                var divAttrTag = $( '<li class="inputDiv" style="width: 97%;margin:0;" />' );
                divContainerTag.append( divAttrTag );

                var labelTag = $( '<label class="from-string titleDiv" />' );
                labelTag.html( 'Application version' );
                divAttrTag.append( labelTag );
                var valueTag = $( '<div id="aboutInfo_AppVersion" class="form-type-text" style="border-bottom: 1px solid #E8E8E8;padding:10px 0 15px 10px" />');
                valueTag.html( $( '#spanVersion' ).html().replace('v','') );
                divAttrTag.append( valueTag );

                // check for App Version updates BUTTON
                var divButtonAppVersionTag = $( '<div style="position:relative;text-align:left;width:30%;" />' );
                valueTag.append( divButtonAppVersionTag );
                var btnAppShellTag = $( '<button value="" id="appShellUpdateBtn" class="divBtn" style="display:none;position:relative;top:5px;left:-3px;padding:1px 4px 1px 4px;border:1px solid #C0C0C0;color:#236EDE;border-radius:8px;font-size:calc(8px + 0.5vw);" />');
                btnAppShellTag.html( 'new version available' );
                divButtonAppVersionTag.append( btnAppShellTag );

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


                var divAttrTag = $( '<li class="inputDiv" style="width: 97%;margin:0;" />' );
                divContainerTag.append( divAttrTag );

                var labelTag = $( '<label class="from-string titleDiv" />' );
                labelTag.html( 'Config version' );
                divAttrTag.append( labelTag );
                var valueTag = $( '<div id="aboutInfo_dcdVersion" class="form-type-text" style="border-bottom: 6px solid #F5F5F5;padding:10px 0 15px 10px"/>');
                valueTag.html( userConfig.dcdConfig.version );
                divAttrTag.append( valueTag );

                // check for DCD Version updates BUTTON
                var divButtonDcdVersionTag = $( '<div style="position:relative;text-align:left;width:30%;" />' );
                valueTag.append( divButtonDcdVersionTag );
                var btnDcdConfigTag = $( '<button value="" id="dcdUpdateBtn" class="divBtn" style="display:none;position:relative;top:5px;left:-3px;padding:1px 4px 1px 4px;border:1px solid #C0C0C0;color:#236EDE;border-radius:8px;font-size:calc(8px + 0.5vw);" />');
                btnDcdConfigTag.html( 'new version available' );
                divButtonDcdVersionTag.append( btnDcdConfigTag );

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



                var divAttrTag = $( '<li class="inputDiv" style="width: 97%;margin:0;" />' );
                divContainerTag.append( divAttrTag );

                var labelTag = $( '<label class="from-string titleDiv" />' );
                labelTag.html( 'Browser' );
                divAttrTag.append( labelTag );
                var valueTag = $( '<div id="aboutInfo_Browser" class="form-type-text" style="border-bottom: 1px solid #E8E8E8;padding:10px 0 15px 10px"/>');
                valueTag.html( navigator.sayswho );
                divAttrTag.append( valueTag );


                var divAttrTag = $( '<li class="inputDiv" style="width: 97%;margin:0;" />' );
                divContainerTag.append( divAttrTag );

                var labelTag = $( '<label term="User_Language" class="from-string titleDiv" />' );
                labelTag.html( 'User language' );
                divAttrTag.append( labelTag );
                var valueTag = $( '<div id="aboutInfo_Language" class="form-type-text" style="border-bottom: 6px solid #F5F5F5;padding:10px 0 15px 10px"/>');
                valueTag.html( navigator.language );
                divAttrTag.append( valueTag );

                var divAttrTag = $( '<li class="inputDiv" style="width: 97%;margin:0;" />' );
                divContainerTag.append( divAttrTag );

                var labelTag = $( '<label class="from-string titleDiv" />' );
                labelTag.html( 'Theme' );
                divAttrTag.append( labelTag );
                var valueTag = $( '<div id="aboutInfo_Language" class="form-type-text" style="border-bottom: 1px solid #fff;padding:10px 0 15px 10px"/>');                
                valueTag.html( userConfig.dcdConfig.settings.theme );
                valueTag.append( '<select id="aboutInfo_langSelect"></select>' );
                divAttrTag.append( valueTag );

                var divAttrTag = $( '<li class="inputDiv" style="width: 97%;margin:0;" />' );
                divContainerTag.append( divAttrTag );



                me.aboutFormDivTag.show();
                me.cwsRenderObj.langTermObj.translatePage();

                me.syncMgr = new syncManager();
                me.syncMgr.appShellVersionTest( $( '#appShellUpdateBtn' ) );
                me.syncMgr.dcdConfigVersionTest( $( '#dcdUpdateBtn' ) );
            }

    }
    */
    
    /*var divAttrTag = $( '<li class="inputDiv" style="width: 97%;margin:0;" />' );
    divContainerTag.append( divAttrTag );

    var labelTag = $( '<label class="from-string titleDiv" />' );
    labelTag.html( 'Country' );
    divAttrTag.append( labelTag );
    var valueTag = $( '<div id="aboutInfo_Country" class="form-type-text" style="border-bottom: 1px solid #E8E8E8;padding:10px 0 15px 10px"/>');
    valueTag.html( userConfig.dcdConfig.countryCode );
    divAttrTag.append( valueTag );

    
    var divAttrTag = $( '<li class="inputDiv" style="width: 97%;margin:0;" />' );
    divContainerTag.append( divAttrTag );

    var labelTag = $( '<label class="from-string titleDiv" />' );
    labelTag.html( 'Data server' );
    divAttrTag.append( labelTag );
    var valueTag = $( '<div id="aboutInfo_dataServer" class="form-type-text" style="border-bottom: 1px solid #E8E8E8;padding:10px 0 15px 10px"/>');
    valueTag.html( userConfig.orgUnitData.dhisServer );
    divAttrTag.append( valueTag );*/


    /*var divAttrTag = $( '<li class="inputDiv" style="width: 97%;margin:0;" />' );
    divContainerTag.append( divAttrTag );

    var labelTag = $( '<label class="from-string titleDiv" />' );
    labelTag.html( 'WS server' );
    divAttrTag.append( labelTag );
    var valueTag = $( '<div id="aboutInfo_WebServer" class="form-type-text" style="border-bottom: 1px solid #E8E8E8;padding:10px 0 15px 10px"/>');
    valueTag.html( FormUtil.staticWSName );
    divAttrTag.append( valueTag );*/


                    // James added: 2018/12/17 - BUT WE SHOULD SIMPLY HAVE STATIC TAGS IN index.html, not dynamic ones..
    /*var spanConsoleOutConfig = $( '<span title="console out config" style="opacity: 0; cursor:pointer; margin-left: 15px;">v</span>');
    divButtonTag.append( spanConsoleOutConfig );

    spanConsoleOutConfig.click( function() {
        console.log( me.cwsRenderObj.configJson );
    });*/


    /*
    me.getAboutInfo = function()
    {

        var userConfig = JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem('session') ).user ) );
        var retObj = {};
        var aboutApp = [];
        var aboutSession = [];
        var aboutBrowser = [];

        aboutApp.push ( { name: 'Application version', value: $( '#spanVersion' ).html().replace('v','') } );
        aboutApp.push ( { name: 'Config version', value: userConfig.dcdConfig.version } );
        aboutApp.push ( { name: 'Country', value: userConfig.dcdConfig.countryCode } );
        //aboutApp.push ( { name: 'urlName', value: ( location.pathname ).replace('/','').replace('/','') } ); //FormUtil.appUrlName
        //aboutApp.push ( { name: 'urlNameRAW', value: ( location.pathname ) } );
        aboutApp.push ( { name: 'Data server', value: userConfig.orgUnitData.dhisServer } );
        aboutApp.push ( { name: 'WS server', value: FormUtil.staticWSName } );
        //aboutApp.push ( { name: 'currentUser', value: FormUtil.login_UserName } );

        retObj.about = ( aboutApp );

        //aboutBrowser.push ( { name: 'platform', value: navigator.platform } );
        aboutBrowser.push ( { name: 'Browser', value: navigator.sayswho } );
        aboutBrowser.push ( { name: 'User language', value: navigator.language } );

        retObj.Browser = ( aboutBrowser );


        return retObj;
    }
    */
    // END > Added by Greg: 2018/12/04

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