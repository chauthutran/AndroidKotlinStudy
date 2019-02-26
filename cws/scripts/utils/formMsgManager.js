// =========================================
// === Message with entire screen blocking
function FormMsgManager() {}

// --- App block/unblock ---
FormMsgManager.cssBlock_Body = { 
    border: 'none'
    ,padding: '15px'
    ,backgroundColor: '#000'
    ,'-webkit-border-radius': '10px'
    ,'-moz-border-radius': '10px'
    ,opacity: .4
    ,color: '#fff'
    ,width: ''
    ,'white-space': 'nowrap'
    ,'min-width': '35%'
    ,'max-width': '300px'
    ,overflow: 'display'
};

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

