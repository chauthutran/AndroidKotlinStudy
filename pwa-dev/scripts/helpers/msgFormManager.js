// =========================================
// === Message with entire screen blocking
function MsgFormManager() {}

MsgFormManager.queue = [];  // could be array or object.  Go with array for now.

// --- App block/unblock ---
MsgFormManager.cssBlock_Body = { 
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

MsgFormManager.blockTag = function( bShow, msg, cssSetting, tag )
{
	var msgAndStyle = { message: msg, css: cssSetting };

    if ( bShow ) return tag.block( msgAndStyle );
    else return tag.unblock();
};

/*
MsgFormManager.block = function( bShow, msg, cssSetting, itemDef )
{
	var msgAndStyle = { message: msg, css: cssSetting };

    if ( bShow ) return $.blockUI( msgAndStyle );
    else return $.unblockUI();
};
*/

// 'itemId' not used for now.
MsgFormManager.showBlock = function( itemId, msgAndStyle, afterRun )
{
    // If blockMsg is already shown currently (for other msg), add to queue instead.
    if ( $( 'div.blockMsg:visible' ).length > 0 )
    {
        var item = { id: itemId, msgAndStyle: msgAndStyle, afterRun: afterRun };
        MsgFormManager.queue.push( item );
    }
    else
    {
        $.blockUI( msgAndStyle );  // var msgAndStyle = { message: msg, css: cssSetting };
    }
};

// 'itemId' not used for now.
MsgFormManager.hideBlock = function( itemId )
{
    $.unblockUI();

    // If there is any queue, show this - with setTimeout?
    if ( MsgFormManager.queue.length > 0 )
    {
        var item = MsgFormManager.queue.shift();

        setTimeout( function() 
        {
            $.blockUI( item.msgAndStyle ); 
            if ( item.afterRun ) item.afterRun();    
        }, 500 );
    }
};


MsgFormManager.appBlockTemplate = function( templateId, customTemplate, afterRun )
{
    var block;
    //var css = cssInput;

    if ( templateId == 'appLoad' )
    {
        block = "<img src='images/Connect.svg' class='cwsLogoRotateSpin' style='width:44px;height:44px;'><div class='startUpProgress'></div>";
        css = { 'border': '2px solid rgb(255, 255, 255) !important', 'background-color': '#fff !important', 'margin-top': '-50px', 'margin-left': '-50px' };
    }
    else if ( templateId == 'loginAfterLoad' )
    {
        block = "<img src='images/Connect.svg' class='cwsLogoRotateSpin' style='width:38px; height:38px;'><span>Loading Data...</span>";
        css = { 'border': '2px solid rgb(255, 255, 255) !important', 'background-color': '#ccc !important', 'margin-top': '-40px', 'margin-left': '-40px' };
    }
    else if ( templateId == 'appLoadProgress' )
    {
        block = "<img src='images/Connect.svg' class='formBlockProgressIcon rotating' style='width:44px;height:44px;'>" +
                "<div term='' style='font-size:7pt;position:relative;top:-4px;'>processing</div></div>";
        //css = 'border: none !important;background-color:rbga(0,0,0,0.5);'
        css = { 'border': 'none !important', 'background-color': 'rbga(0,0,0,0.5) !important', 'margin-top': '-50px', 'margin-left': '-50px' };
    }
    else if ( templateId == 'appDiagnostic' )
    {
        block = "<img src='images/care.svg' class='formBlockProgressIcon rotating' style='width:44px;height:44px;'>";
        css = { 'border': '2px solid rgb(255, 255, 255) !important', 'background-color': '#fff !important', 'margin-top': '-50px', 'margin-left': '-50px' };
    }

    if ( customTemplate ) block = customTemplate;


    MsgFormManager.appBlock( templateId, block, css, afterRun );
}

// Actual calling method (to be used) 'appBlock/appUnblock'
MsgFormManager.appBlock = function( itemId, msg, customCss, afterRun )
{
    if ( !msg ) msg = "Processing..";

    var css = ( customCss ) ? $.extend( MsgFormManager.cssBlock_Body, customCss ) : MsgFormManager.cssBlock_Body;

    MsgFormManager.showBlock( itemId, { message: msg, css: css }, afterRun );
};

MsgFormManager.appUnblock = function( itemId )
{
    MsgFormManager.hideBlock( itemId );
};

// -------------------------------------------

MsgFormManager.showFormMsg = function( itemId, msgSpanTag, optionJson, btnClickFunc )
{
    var divMainTag = $( '<div></div>' );
    var msgDivTag = $( '<div></div>' ).append( msgSpanTag );
    var btnDivTag = $( '<div style="margin-top: 10px;"><button class="cbtn">OK</button></div>' );

    btnDivTag.click( function() 
    {				
        MsgFormManager.appUnblock( itemId );        
		if ( btnClickFunc ) btnClickFunc( optionJson );
    });

    divMainTag.append( msgDivTag );
    divMainTag.append( btnDivTag );


    // Main FormMsg Setup/Show
    MsgFormManager.appBlockTemplate( itemId, divMainTag, function() 
    {
        // Modify FormMsg width
        var blockMsgTag = $( '.blockMsg' );
        if ( blockMsgTag.length > 0 )
        {
            blockMsgTag.css( 'margin', '-50px 0px 0px -50px' );
            blockMsgTag.css( 'width', '100px' );    
        }
    });
};

// NOTE: NOT THAT TABLE --> Rely on assumption that activity list is 1st page & nav2 is activity nav2 & populated..
MsgFormManager.showErrActivityMsg = function( Nav2Tag, errActList )
{
    try
    {
        var msgSpanTag = $( '<span style="font-weight: bold;">' + errActList.length + ' New Errored Activities Found.</span>' );

        MsgFormManager.showFormMsg( 'showErrActivityMsg', msgSpanTag, { 'errActList': errActList }, function( optionJson ) 
        {	
            var viewListTag = Nav2Tag.find( 'select.selViewsListSelector' );

            if ( viewListTag.is(':visible') )
            {
                viewListTag.val( 'showErrored' ).change();
    
                AppInfoManager.clearNewErrorActivities();
            
                setTimeout( function() 
                {
                    optionJson.errActList.forEach( errActId => 
                    {
                        $( 'div.card[itemid="' + errActId + '"]' ).css( 'background-color', '#fff4f4' );
                    });
                }, 500 );
            }
        });    
    }
    catch( errMsg ) 
    {
        console.log( 'ERROR in MsgFormManager.showErrActivityMsg, ' + errMsg );
    }
};


