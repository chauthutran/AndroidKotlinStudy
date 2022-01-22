// -------------------------------------------
// -- BlockMsg Class/Methods
function aboutApp( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;

    me.aboutFormDivTag = $( '#aboutFormDiv' );
    me.aboutData;

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
        
        TranslationManager.translatePage();

        me.showAboutPage();
    }

	// ------------------

	me.setEvents_OnInit = function()
	{		
        // --------------
        // BUTTON CLICKS

        me.aboutFormDivTag.find( 'img.btnBack' ).click( () =>
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
    }


	// ------------------

    me.showAboutPage = function()
    {
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
    }


    me.renderNonEssentialFields = function( userLoggedIn )
    {
        if ( ! $( '#aboutInfo_networkMode' ).attr( 'unselectable' )  )
        {
            $( '#aboutInfo_networkMode' ).attr( 'unselectable', 'on' );
            $( '#aboutInfo_networkMode' ).css( 'user-select', 'none' );
            $( '#aboutInfo_networkMode' ).on( 'selectstart', false );
        }
    }

    me.populateAboutPageData = function( dcdConfig ) 
    {
        // Dcd Config related data set
        var dcdConfigVersion = ( dcdConfig && dcdConfig.version ) ? dcdConfig.version : "";

        // Populate data
        $( '#aboutInfo_AppVersion' ).html( $( '#spanVersion' ).html() );

        $( '#aboutInfo_dcdVersion' ).html( dcdConfigVersion );

        $( '#aboutInfo_networkMode' ).html( '<div>' + ConnManagerNew.statusInfo.appMode + '</div>' );

        me.displayDeviceInfo( $( '#aboutInfo_info' ) );
        //$( '#aboutInfo_info' ).html( me.getNavigatorInfo() );

        //$( '#aboutInfo_geoLocation' ).html( '<div>' + FormUtil.geoLocationState + ( ( me.getCoordinatesForPresentation() ).toString().length ? ': ' + me.getCoordinatesForPresentation() : '' ) + '</div>' );
        //<!--div class="field-read_only">
        //  <div class="field-read_only__label"><label term="about_geoLocation">Location permission</label></div>
        //  <div class="field-read_only__text" id="aboutInfo_geoLocation">Granted-so-i-say?</div>
        //</div-->

    }



    // -----------------------------------

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


    me.getBrowserInfo = function() 
    {
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
    };

    me.displayDeviceInfo = function( aboutInfoTag )
    {
        var data = me.getDeviceJson();  // Put this on INFO..

    };

    me.getNavigatorInfo = function()
    {
        var returnData = '';




        returnData += '<div>Browser: ' + Util.getStr( App.UaData.browser.name ) + ' ' + Util.getStr( App.UaData.browser.version ).substr( 0, 2 );
        //returnData += ' Engine: ' + Util.getStr( App.UaData.engine.name ) + Util.getStr( App.UaData.engine.version );
        returnData += ', OS: ' + Util.getStr( App.UaData.os.name ) + ' ' + Util.getStr( App.UaData.os.version );
        returnData += ', CPU: ' + Util.getStr( App.UaData.cpu.architecture ) + '(CoreCount ' + Util.getStr( navigator.hardwareConcurrency ) + ')';
        returnData += ', Memory: at least ' + Util.getStr( navigator.deviceMemory ) + ' GB [Measurement Max 8]';
        returnData += '</div>'; 

        returnData += '<div class="divAboutInfo2ndRow">Device: ' + Util.getStr( App.UaData.device.type ) + ' ' 
            + Util.getStr( App.UaData.device.vendor ) + ' ' 
            + Util.getStr( App.UaData.device.model );
        returnData += '</div>'; 

        navigator.getBattery().then( function( battery ) 
        {
            var batteryChargingYN = ( battery.charging ) ? 'Y': 'N';
            var chargeLvl = ( battery.level * 100 ).toFixed( 0 ) + '%';
            var batteryInfo = ', Battery Left: ' + chargeLvl + ', Charging(' + batteryChargingYN + ')';

            $( 'div.divAboutInfo2ndRow' ).append( batteryInfo );
        });

        if ( 'storage' in navigator && 'estimate' in navigator.storage ) 
        {
            navigator.storage.estimate().then(({usage, quota}) => {
                var spaceStr = ', Storage: [Using] ' + me.getDiffSize( usage, 1000000, 'MB' ) + '/ ' + me.getDiffSize( quota, 1000000000, 'GB' ) + ' [Browser Usable/DeviceFree]';

                $( 'div.divAboutInfo2ndRow' ).append( spaceStr );
            });
        }
          

        return returnData;
    };


    me.getDiffSize = function( inputVal, dividNum, endingStr )
    {
        var returnVal = '';

        if ( inputVal )
        {
            returnVal = Number( inputVal / dividNum ).toFixed(1) + endingStr;
        }

        return returnVal;
    };

	// ------------------------------------

	me.initialize();
}