
// -------------------------------------
// -- Static Classes - Message Manager Class

function MsgManager() {}

// --- Messaging ---
MsgManager.divMsgAreaTag;
MsgManager.spanMsgAreaCloseTag;
MsgManager.btnMsgAreaCloseTag;
MsgManager.spanMsgAreaTextTag;

MsgManager.initialSetup = function()
{
    MsgManager.divMsgAreaTag = $( '#divMsgArea' );
    MsgManager.spanMsgAreaCloseTag = $( '#spanMsgAreaClose' );
    MsgManager.btnMsgAreaCloseTag = $( '#btnMsgAreaClose' );
    MsgManager.spanMsgAreaTextTag = $( '#spanMsgAreaText' );
        
    MsgManager.btnMsgAreaCloseTag.click( function()
    {
        MsgManager.msgAreaClear( 'fast' );
    });
}

MsgManager.msgAreaShow = function( msg, timeoutTime )
{
    if ( msg )
    {
        MsgManager.divMsgAreaTag.hide( 'fast' );
        MsgManager.spanMsgAreaTextTag.text( '' );
    
        MsgManager.spanMsgAreaTextTag.text( msg );
        MsgManager.divMsgAreaTag.show( 'medium' );
    
        console.log( ' -- Msg: ' + msg );    

        if ( timeoutTime )
        {
            setTimeout( function() {                
                MsgManager.msgAreaClear( 'slow' );
            }, timeoutTime );
        }
    }
}

MsgManager.msgAreaClear = function( speed )
{
    if ( speed ) MsgManager.divMsgAreaTag.hide( speed );
    else MsgManager.divMsgAreaTag.hide();
}


MsgManager.initialSetup();

// -- End of Message Manager Class
// -------------------------------------
