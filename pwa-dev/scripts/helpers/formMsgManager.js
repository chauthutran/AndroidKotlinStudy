// =========================================
// === Message with entire screen blocking
function FormMsgManager() {}

// --- App block/unblock ---
FormMsgManager.cssBlock_Body = { 
    border: '1px solid rgba(0,0,0,0.25)'
    ,padding: '15px 12px'
    ,'-webkit-border-radius': '4px'
    ,'-moz-border-radius': '4px'
    ,opacity: .9
    ,position: 'absolute'
    ,color: '#707070'
    ,'left': '50%'
    ,'top': '50%'
    ,'width': '70px'
    ,'height': 'auto' //74px
    ,'margin-left' : ( ( $('nav.bg-color-program').width() <= 450 && ( $(document).height() <= 1000 ) ) ? '-10%' : ( ( $('nav.bg-color-program').width() <= 1000 ) ? '-5%' : '-3%' ) ) 
    ,'margin-top' : ( ( $(document).height() <= 650 && $('nav.bg-color-program').width() <= 800 ) ? '-11%' : ( ( $(document).height() <= 1000 ) ? '-6%' : '-3%' ) )
    ,'white-space': 'normal'
    ,overflow: 'display'
    ,verticalAlign: 'middle'
    ,fontSize: '0.8em'
};
//,border: '2px solid rgb(255, 255, 255)'
// basic 'block' with library '.blockUI'
FormMsgManager.block = function( block, msg, cssSetting, tag )
{
	var msgAndStyle = { message: msg, css: cssSetting };

	if ( tag === undefined )
	{
		if ( block ) $.blockUI( msgAndStyle );
		else $.unblockUI();
	}
	else
	{
		if ( block ) tag.block( msgAndStyle );
		else tag.unblock();
	}
}

FormMsgManager.appBlockTemplate = function( template )
{
    var block;
    var css;

    if ( template == 'appLoad' )
    {
        block = "<img src='images/Connect.svg' class='cwsLogoRotateSpin' style='width:44px;height:44px;'><div class='startUpProgress'></div>";
        css = { 'border': '2px solid rgb(255, 255, 255) !important', 'background-color': '#fff !important' };
    }
    else if ( template == 'loginAfterLoad' )
    {
        block = "<img src='images/Connect.svg' class='cwsLogoRotateSpin' style='width:44px;height:44px;'><div class='startUpProgress'></div>";
        css = { 'border': '2px solid rgb(255, 255, 255) !important', 'background-color': '#ccc !important' };
    }
    else if ( template == 'appLoadProgress' )
    {
        block = "<img src='images/Connect.svg' class='formBlockProgressIcon rotating' style='width:44px;height:44px;'>" +
                "<div term='' style='font-size:7pt;position:relative;top:-4px;'>processing</div></div>";
        //css = 'border: none !important;background-color:rbga(0,0,0,0.5);'
        css = { 'border': 'none !important', 'background-color': 'rbga(0,0,0,0.5) !important' };
    }
    else if ( template == 'appDiagnostic' )
    {
        block = "<img src='images/care.svg' class='formBlockProgressIcon rotating' style='width:44px;height:44px;'>";
        css = { 'border': '2px solid rgb(255, 255, 255) !important', 'background-color': '#fff !important' };

    }
    else
    {
        block = template;
    }

    FormMsgManager.appBlock( block, css );
}

// Actual calling method (to be used) 'appBlock/appUnblock'
FormMsgManager.appBlock = function( msg, customCss )
{
    if ( !msg ) msg = "Processing..";

    var css = ( customCss ?  $.extend(FormMsgManager.cssBlock_Body, customCss) : FormMsgManager.cssBlock_Body );

    FormMsgManager.block( true, msg, css  );
};

FormMsgManager.appUnblock = function()
{
    FormMsgManager.block( false );
};

