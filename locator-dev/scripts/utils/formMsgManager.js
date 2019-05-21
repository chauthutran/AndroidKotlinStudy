// =========================================
// === Message with entire screen blocking
function FormMsgManager() {}

// --- App block/unblock ---
FormMsgManager.cssBlock_Body = { 
    border: 'none'
    ,padding: '15px 10px'
    ,'-webkit-border-radius': '4px'
    ,'-moz-border-radius': '4px'
    ,opacity: .9
    ,position: 'absolute'
    ,color: '#50555a'
    ,'left': '50%'
    ,'top': '50%'
    ,'width': '70px'
    ,'height': '74px'
    ,'margin-left' : ( ( $('nav.bg-color-program').width() <= 450 && ( $(document).height() <= 1000 ) ) ? '-10%' : ( ( $('nav.bg-color-program').width() <= 1000 ) ? '-5%' : '-3%' ) ) 
    ,'margin-top' : ( ( $(document).height() <= 650 && $('nav.bg-color-program').width() <= 800 ) ? '-11%' : ( ( $(document).height() <= 1000 ) ? '-6%' : '-3%' ) )
    ,'white-space': 'normal'
    ,'box-shadow': '10px 10px 4px rgba(0, 0, 0, 0.25)'
    ,overflow: 'display'
    ,border: '2px solid rgb(255, 255, 255)'
    ,verticalAlign: 'middle'
    ,fontSize: '0.8em'
};

// basic 'block' with library '.blockUI'
FormMsgManager.block = function( block, msg, cssSetting, tag )
{
    //console.log( ( $('nav.bg-color-program').width() ) );
    //console.log( ( $(document).height() ) );
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

// Actual calling method (to be used) 'appBlock/appUnblock'
FormMsgManager.appBlock = function( msg )
{
    if ( !msg ) msg = "Processing..";

    FormMsgManager.block( true, msg, FormMsgManager.cssBlock_Body );
};

FormMsgManager.appUnblock = function()
{
    FormMsgManager.block( false );
};

