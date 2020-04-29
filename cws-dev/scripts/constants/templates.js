
function Templates() {};

// -------------------------------------

Templates.msgAreaBottomContent = `<div class="msgArea sync_all">
        <div class="msgHeader sync_all__header">
        </div>
        <div class="msgContent bottom__wrapper">
        </div>
    </div>`;

Templates.msgActivityCard = `<div class="msgActivityCard sheet_bottom_card">
    <div class="activityContainer sheet_bottom_card__container">
    </div>
</div>`;

Templates.msgSection = `<div class="msgSection sync_all__section">
    <div class="msgSectionTitle sync_all__section_title"></div>
    <div class="msgSectionLog sync_all__section_log"></div>
</div>`;

// -------------------------------------

Templates.getMsgAreaBottom = function()
{
    var msgAreaBottomTag = $( '#divMsgAreaBottom' );
    msgAreaBottomTag.html( Templates.msgAreaBottomContent );  // resets previous html content..

    return msgAreaBottomTag;
};


Templates.setMsgAreaBottom = function( callBack )
{    
    var syncInfoAreaTag = Templates.getMsgAreaBottom();

    callBack( Templates.getMsgAreaBottom() );

    // Common ones - make a method out of it..
    syncInfoAreaTag.show( 'slide', { direction: 'down' }, 200 );//css('display', 'block');
    $( '#divMsgAreaBottomScrim' ).show();  //   opacity: 0.2;  <-- css changed
};
