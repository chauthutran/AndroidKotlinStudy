// =========================================
// === Message with entire screen blocking
function MsgFormManager() {}

MsgFormManager.queue = [];  // could be array or object.  Go with array for now.

MsgFormManager.blockShown = false;

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
//    ,'margin-left' : ( ( $('nav.bg-color-program').width() <= 450 && ( $(document).height() <= 1000 ) ) ? '-10%' : ( ( $('nav.bg-color-program').width() <= 1000 ) ? '-5%' : '-3%' ) ) 
//    ,'margin-top' : ( ( $(document).height() <= 650 && $('nav.bg-color-program').width() <= 800 ) ? '-11%' : ( ( $(document).height() <= 1000 ) ? '-6%' : '-3%' ) )
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


// 'itemId' not used for now.
MsgFormManager.showNQueue_Block = function( itemId, msgAndStyle, afterRun )
{
    var item = { id: itemId, msgAndStyle: msgAndStyle, afterRun: afterRun };

    // If blockMsg is already shown currently (for other msg), add to queue instead.
    // if ( $( 'div.blockMsg:visible' ).length > 0 )
    if ( MsgFormManager.queue.length <= 0 ) MsgFormManager.displayBlock_byItem( item );

    // Always add 'showNQueue_Block' 'item' in queue.  1st in the list is considered the one shown..
    MsgFormManager.queue.push( item );
};

// Actual showing..
MsgFormManager.displayBlock_byItem = function( item )
{
    //console.log( 'blockUI shown' );
    $.blockUI( item.msgAndStyle );  // var msgAndStyle = { message: msg, css: cssSetting };

    MsgFormManager.getShownFormTag().attr( 'itemId', item.id ); // Tag 'itemId' attr

    if ( item.afterRun ) {
        try {  item.afterRun();  }
        catch ( errMsg ) { console.log( 'ERROR in MsgFormManager.displayBlock_byItem afterRun, ' + errMsg ); }
    }
};


// 'itemId' not used for now.
MsgFormManager.hideBlock = function( itemId )
{
    // Since 1st one in the queue is considered the one shown, remove 1st one..
    // - if the id does not match with 1st one, look through until find the one.  and remove until that id?
    // - hide the UI only if it matches the current one...  <-- 1st in the queue..

    // Consider UI one...  only hide if shown one matches?
    var shownItemId = MsgFormManager.getShownFormTag().attr( 'itemId' ); // Tag 'itemId' attr

    $.unblockUI();
    // MsgFormManager.blockShown = false;


    // Remove current one
    if ( MsgFormManager.queue.length > 0 ) 
    {
        // 1. If 'itemId' & 'shownItemId' does not exist, take the next item in queue as current item, and remove it
        if ( !itemId && !shownItemId )
        {
            MsgFormManager.queue.shift();
        }
        else 
        {
            // If same, remove up to that item
            if ( itemId === shownItemId ) MsgFormManager.removeItemsUntil( itemId );
            else
            {
                // If different, remove up to either of them.
                if ( itemId ) MsgFormManager.removeItemsUntil( itemId );
                if ( shownItemId ) MsgFormManager.removeItemsUntil( shownItemId );                        
            }
        }
    }


    // Show next item - If there is any queue, show this - with setTimeout?
    if ( MsgFormManager.queue.length > 0 )
    {
        var item = MsgFormManager.queue.shift();

        console.log( 'queued msgForm popped' );
        console.log( item );
        console.log( MsgFormManager.queue );

        setTimeout( function() 
        {
            console.log( 'popped msgForm .4 sec later called' );
            MsgFormManager.displayBlock_byItem( item );
        }, 400);
    }
};

// -----------------------------------

MsgFormManager.getShownFormTag = function( itemId )
{
    return $( 'div.blockUI.blockMsg:visible' );
};

MsgFormManager.getCurrItem_inQueue = function( itemId )
{
    var item; // = 

    if ( itemId )
    {
        var list = MsgFormManager.queue.filter( item => item.id === itemId );
        if ( list.length > 0 ) item = list[0];
    }

    return item;
};


MsgFormManager.removeItemsUntil = function( itemId )
{
    // get index number of item
    var itemIdx;

    if ( itemId )
    {
        for ( var i = 0; i < MsgFormManager.queue.length; i++ )
        {
            var tmpItem = MsgFormManager.queue[i];
            if ( tmpItem.id === itemId ) {  itemIdx = i; break;  }
        }    
    }

    if ( itemIdx !== undefined )
    {
        do {
            MsgFormManager.queue.shift();
            itemIdx--;
        } while ( itemIdx >= 0 || MsgFormManager.queue.length > 0 )
    }
};


// -----------------------------------


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

    MsgFormManager.cssBlock_Body[ 'margin-left' ] = ( $('nav.bg-color-program').width() <= 450 && ( $(document).height() <= 1000 ) ) ? '-10%' : ( ( $('nav.bg-color-program').width() <= 1000 ) ? '-5%' : '-3%' );

    MsgFormManager.cssBlock_Body[ 'margin-top' ] = ( ( $(document).height() <= 650 && $('nav.bg-color-program').width() <= 800 ) ? '-11%' : ( ( $(document).height() <= 1000 ) ? '-6%' : '-3%' ) );

    
    var css = ( customCss ) ? $.extend( MsgFormManager.cssBlock_Body, customCss ) : MsgFormManager.cssBlock_Body;

    MsgFormManager.showNQueue_Block( itemId, { message: msg, css: css }, afterRun );
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


