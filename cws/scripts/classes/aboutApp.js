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

                $.each(me.aboutData, function(k, o) {

                    $.each(o, function(l, v) {

                        var divAttrTag = $( '<div class="tb-content-about inputDiv" />' );
                        var labelTag = $( '<label class="about-string-header titleDiv" />' );
                        var valueTag = $( '<div id="aboutInfo_'+l+'" class="form-about-text" />');
    
                        me.aboutContentDivTag.append( divAttrTag );
                        divAttrTag.append( labelTag );
                        divAttrTag.append( valueTag );
    
                        labelTag.html( v.name );
                        valueTag.html( v.value );

                    })

                })

                var divButtonTag = $( '<div style="float: left;margin:10px;padding:10px;text-align:center;width:100%;" />' );
                me.aboutContentDivTag.append( divButtonTag );

                var btnAppShell = $( '<button value="" class="divBtn" style="margin:4px;padding:8px;width:140px;border:1px solid #C0C0C0;color:#236EDE;border-radius:8px;" />');
                btnAppShell.html( 'reGet appShell' );
                divButtonTag.append( btnAppShell );

                $( btnAppShell ).click( () => {

                    if ( ConnManager.isOffline() )
                    {
                      alert( 'Only re-register service-worker while online, please.' );
                    }
                    else
                    {
                      me.cwsRenderObj.reGetAppShell(); 
                    }

                });

                var btnDCDconfig = $( '<button value="" class="divBtn" style="margin:4px;padding:8px;width:140px;border:1px solid #C0C0C0;color:#236EDE;border-radius:8px;" />');
                btnDCDconfig.html( 'reGet dcdConfig' );
                divButtonTag.append( btnDCDconfig );

                btnDCDconfig.click( () => {

                    if ( ConnManager.isOffline() )
                    {
                      alert( 'Only re-register service-worker while online, please.' );
                    }
                    else
                    {
                      me.cwsRenderObj.reGetDCDconfig(); 
                    }

                });


		        // James added: 2018/12/17 - BUT WE SHOULD SIMPLY HAVE STATIC TAGS IN index.html, not dynamic ones..
                var spanConsoleOutConfig = $( '<span title="console out config" style="opacity: 0; cursor:pointer; margin-left: 15px;">v</span>');
                divButtonTag.append( spanConsoleOutConfig );

                spanConsoleOutConfig.click( function() {
                    console.log( me.cwsRenderObj.configJson );
                });
                

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

        aboutApp.push ( { name: 'Application version', value: $( '#spanVersion' ).html() } );
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
    /* END > Added by Greg: 2018/12/04 */

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