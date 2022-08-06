
function MsgAreaBottom() {};

// ===================================================
// ----- Show/Hide Bottom Messages --------

MsgAreaBottom.targetTag = $( 'div.sheet_bottom' );


// NOTE: NOT USED? ANYMORE?
MsgAreaBottom.setContent = function( htmlStructure, ignoreScrim )
{
  MsgAreaBottom.targetTag.empty();

  MsgAreaBottom.targetTag.html(htmlStructure);

    // run some height calculations + adjust position (if required) < might not be necessary

    if ( ! ignoreScrim )
    {
        $( '.scrim' ).show();
        $( '.scrim').css('zIndex',100);
        $( '.scrim').css('opacity', 0.4);
        $('div.sheet_bottom').css('zIndex',3000);
    }
   
   // showMsgManager.targetTag.slideDown("slow");
   MsgAreaBottom.targetTag.fadeIn();

    return MsgAreaBottom.targetTag;
};

MsgAreaBottom.close = function()
{
    $( '.scrim' ).hide();
    MsgAreaBottom.targetTag.empty();
    MsgAreaBottom.targetTag.hide();
};

// -----------------

MsgAreaBottom.getMsgAreaBottom = function()
{
    var msgAreaBottomTag = $( '#divMsgAreaBottom' );
    msgAreaBottomTag.html( Templates.msgAreaBottomContent );  // resets previous html content..

    return msgAreaBottomTag;
};

// NOTE: ONLY Method used in this class...  - on 'activityCard', 'syncManagerNew'
//  - Both related to sync..  single syncUp or syncDown all..
MsgAreaBottom.setMsgAreaBottom = function( callBack )
{    
    var syncInfoAreaTag = MsgAreaBottom.getMsgAreaBottom();

    callBack( syncInfoAreaTag );

    // Common ones - make a method out of it..
    syncInfoAreaTag.show( 200 );//css('display', 'block');
    $( '#divMsgAreaBottomScrim' ).show();  //   opacity: 0.2;  <-- css changed

    syncInfoAreaTag.find( '.divSyncAllClose' ).click( MsgAreaBottom.closeMsgAreaBottomScrim );
};


MsgAreaBottom.closeMsgAreaBottomScrim = function()
{    
	// msg hide click event
	//$( '.sheet_bottom-scrim' ).click( function () 
    $( '.sheet_bottom-fs' ).css( 'display', 'none' );
    $( '.sheet_bottom-scrim' ).css( 'display', 'none' );
};


MsgAreaBottom.setEvent_closeMsgAreaBottomScrim = function()
{    
	// msg hide click event '#divMsgAreaBottomScrim' is used for '.sheet_bottom-scrim'
	$( '.sheet_bottom-scrim' ).click( MsgAreaBottom.closeMsgAreaBottomScrim );
};

				