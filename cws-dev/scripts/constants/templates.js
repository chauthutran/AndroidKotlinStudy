
function Templates() {};

Templates.msgAreaBottomContent = `<div class="sync_all">
        <div class="sync_all__header">
            <div class="sync_all__header_title">Synchronization Services Deliveries</div>
            <div class="sync_all__anim i-sync-pending_36 rot_l_anim"></div>
        </div>
        <div class="bottom__wrapper">

        </div>
    </div>`;


Templates.getMsgAreaBottom = function()
{
    var msgAreaBottomTag = $( 'div.sheet_bottom-fs' );
    msgAreaBottomTag.html( Templates.msgAreaBottomContent );  // resets previous html content..

    return msgAreaBottomTag;
};


Templates.setMsgAreaBottom = function( callBack )
{    
    var syncInfoAreaTag = Templates.getMsgAreaBottom();

    callBack( Templates.getMsgAreaBottom() );

    // Common ones - make a method out of it..
    syncInfoAreaTag.show( 'slide', { direction: 'down' }, 200 );//css('display', 'block');
    $('.sheet_bottom-scrim').show();  //   opacity: 0.2;  <-- css changed
};



Templates.msgAreaBottom2 = `<div class="sheet_bottom-fs" style="display: none;">
    <div class="sync_all">
    <div class="sync_all__header">
        <div class="sync_all__header_title">Synchronization Services Deliveries</div>
        <div class="sync_all__anim i-sync-pending_36 rot_l_anim"></div>
    </div>
    <div class="bottom__wrapper">
        <div class="sync_all__section">
        <div class="sync_all__section_title">Services Deliveries 4/6</div>
        <div class="sync_all__section_log">20-02-01 17:07 Starting sync_all.<br>20-02-01 17:07
            Synchronizing...<br>20-02-01 17:07 sync_all completed.</div>
        </div>
        <div class="sync_all__section">
        <div class="sync_all__section_title">Client details</div>
        <div class="sync_all__section_log"><span class="color_status_sync">Sync - read message 2</span><br><span class="color_status_pending_msg">Sync postponed 2</span><br><span class="color_status_error">Sync
            error
            1</span></div>
        <div class="sync_all__section_msg">Show next sync: in 32m</div>
        </div>
    </div>
    </div>
</div>`;