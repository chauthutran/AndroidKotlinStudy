// -------------------------------------------
// -- BlockMsg Class/Methods
function aboutApp( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.aboutFormDivTag = $( '#aboutFormDiv' );
    me.aboutContentDivTag = $( '#aboutContentDiv' );
    me.aboutData;

	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================



	// -----------------------------
	// ---- Methods ----------------

	me.initialize = function() {

        me.aboutContentDivTag.empty();

    }

    me.hide = function() {
        me.aboutContentDivTag.empty();
        me.aboutFormDivTag.hide()
    }

    me.render = function() {

        me.aboutData = me.getAboutInfo();

        if ( $( 'div.mainDiv' ).is( ":visible" ) )
        {
            $( 'div.mainDiv' ).hide();
        }

        me.aboutFormDivTag.show( 'fast' );

            if (me.aboutData)
            {

                me.aboutContentDivTag.empty();

                var myTable = $( '<table style="padding:0;border:0;border-spacing: 0;border-collapse: collapse;">'); 
                me.aboutContentDivTag.append( myTable );

                $.each(me.aboutData, function(k, o) {

                    //o.sort (function(a, b) { return (a['name'] > b['name']) ? 1 : ((a['name'] < b['name']) ? -1 : 0); } );

                    var bgAlt = '#FFF';
                    myTable.append( '<tr><td colspan=2 style="padding:8px 8px 8px 0;text-align:left;background-Color:' + bgAlt + ';font-weight:600">&nbsp;'+k.toString().toUpperCase()+'&nbsp;</td></tr>' );
                    bgAlt = ( ( bgAlt == '#FFF' ) ? '#F5F5F5' : '#FFF' );

                    $.each(o, function(l, v) {

                        myTable.append( '<tr><td style="padding:8px;text-align:left;background-Color:' + bgAlt + '">' + v.name + '</td><td style="padding:8px;text-align:left;background-Color:' + bgAlt + '">' + v.value + '</td></tr>' );
                        bgAlt = ( ( bgAlt == '#FFF' ) ? '#F5F5F5' : '#FFF' );

                    })

                })


               /* var myButton = $( '<button value="" class="">Hard Reload</button>');
                me.aboutContentDivTag.append( myButton );

                $( myButton ).click( () => {

                    if ( ConnManager.isOffline() )
                    {
                      alert( 'Only re-register service-worker while online, please.' );
                    }
                    else
                    {
                      me.cwsRenderObj.reGet(); 
                    }
                
                });*/

                me.aboutFormDivTag.show();
            }

    }


    me.getAboutInfo = function()
    {

        var userConfig = JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem('session') ).user ) );
        var retObj = {};
        var aboutApp = [];
        var aboutSession = [];
        var aboutBrowser = [];

        aboutApp.push ( { name: 'appVersion', value: $( '#spanVersion' ).html() } );
        aboutApp.push ( { name: 'dcdVersion', value: userConfig.dcdConfig.version } );
        aboutApp.push ( { name: 'country', value: userConfig.dcdConfig.countryCode } );
        //aboutApp.push ( { name: 'urlName', value: ( location.pathname ).replace('/','').replace('/','') } ); //FormUtil.appUrlName
        aboutApp.push ( { name: 'urlNameRAW', value: ( location.pathname ) } );
        aboutApp.push ( { name: 'dataServer', value: userConfig.orgUnitData.dhisServer } );
        aboutApp.push ( { name: 'staticWSName', value: FormUtil.staticWSName } );
        //aboutApp.push ( { name: 'currentUser', value: FormUtil.login_UserName } );

        retObj.about = ( aboutApp );

        //aboutBrowser.push ( { name: 'platform', value: navigator.platform } );
        aboutBrowser.push ( { name: 'language', value: navigator.language } );
        aboutBrowser.push ( { name: 'userAgent', value: navigator.userAgent } );

        retObj.Browser = ( aboutBrowser );

        //JSON.stringify(jsObj, null, "\t"); // stringify with tabs inserted at each level
        //JSON.stringify(jsObj, null, 4);  
        //aboutSession.push ( { name: 'authenticateServer', value: FormUtil.login_server } );
        //aboutSession.push ( { name: 'dateCreation', value: userConfig.mySession.createdDate } );
        //aboutSession.push ( { name: 'dateUpdated', value: userConfig.mySession.lastUpdated } );
        //aboutSession.push ( { name: 'favActionList', value: JSON.stringify(userConfig.dcdConfig.favActionList, null, "\t") } );
        //retObj.sessionData = ( aboutSession );


        return retObj;
    }
    /* END > Added by Greg: 2018/12/04 */

	// ------------------------------------

	me.initialize();
}