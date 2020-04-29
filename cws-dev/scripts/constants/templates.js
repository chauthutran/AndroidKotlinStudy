
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


/* FAV BUTTONS >> START */

Templates.favButtonContainer = `<div class="fab-wrapper">
    <div class="fab__section">
        <div class="fab c_600" style="transform: rotate(0deg);">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M35 27H29V21H27V27H21V29H27V35H29V29H35V27V27Z" class="c_600"></path>
            </svg>
        </div>
    </div>
</div> `;

Templates.favButtonRowItem = `<div class="fab__child-section" style="display: none;">
    <div class="fab__child c_200 svgIcon" />
    <div class="fab__child-text" />
</div>`;

/* FAV BUTTONS << END */


/* ACTIVITY CARD (BLOCKLIST) >> START */

Templates.template_trActivityTag = `<tr class="activity">
<td>
    <div class="list_three_line">

        <div class="list_three_line__container">

            <div class="list_three_line-suppor_visuals listItem_icon_activityType"></div>

            <div class="list_three_item_content">
                <div class="list_three_line-date">DD MMM YYYY - hh:mm</div>
                <div class="list_three_line-text"><b>Greg R.</b> | Male 21<br>
                Service: 3x Pills</div>
            </div>

            <div class="list_three_item_cta">
                <div class="list_three_item_status"></div>
                <div class="list_three_item_cta1"></div>
                <div class="list_three_item_cta2"></div>
            </div>

        </div>

    </div>
</td>
</tr>`;

/* ACTIVITY CARD (BLOCKLIST) << END */



/* ACTIVITY CARD FULL SCREEN PREVIEW >> START */

Templates.activityCardFullScreen = `<div class="wapper_card">
 <div class="c_900" style="vertical-align:middle;height:56px;font-size:18px;line-height:24px;display:flex;align-items:center;">
    <img src='images/arrow_back.svg' class='btnBack' style='width:28px;height:28px;padding: 0 10px;filter: invert(100%);'>
    <span>Details</span>
 </div>
 <div class="card _tab activity">
  <div class="card__sync" style="height: 88px;min-height: 88px;padding: 8px 8px;border-bottom: 1px solid #F5F5F5;">
    <div class="card__sync_container">
      <div class="activityIcon card__sync-suppor_visuals"></div>
      <div class="activityContent card__sync_content list_three_item_content"></div>
      <div class="activityStatus card__sync_cta">
        <div class="activityStatusText card__sync_status color_status_error">Error</div>
        <div class="activityPhone card__sync_cta1"></div>
        <div class="activityStatusIcon card__sync_cta2"></div>
      </div>
    </div>
  </div>
  <div class="tab_fs">
  <ul class="tab_fs__head" style="background-color: #fff;">
   <li class="primary active" rel="tab_previewDetails">
    <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
    <span rel="tab_previewDetails">Details</span>
     <ul class="2ndary" style="display:none">
      <li class="2ndary" style="display:none" rel="tab_previewPayload">
       <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
       <span rel="tab_previewPayload">Payload</span>
      </li>
      <li class="2ndary" style="display:none" rel="tab_previewSync">
       <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
       <span rel="tab_previewSync">Sync</span>
      </li>
     </ul>
   </li>
   <li class="primary" rel="tab_previewPayload">
    <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
    <span rel="tab_previewPayload">Payload</span>
     <ul class="2ndary" style="display:none">
      <li class="2ndary" style="display:none" rel="tab_previewDetails">
       <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
       <span rel="tab_previewDetails">Details</span>
      </li>
      <li class="2ndary" style="display:none" rel="tab_previewSync">
       <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
       <span rel="tab_previewSync">Sync</span>
      </li>
     </ul>
   </li>
   <li class="primary" rel="tab_previewSync">
    <div class="tab_fs__head-icon i-synchronized_24 " rel="tab_previewSync"></div>
    <span rel="tab_previewSync">Sync</span>
     <ul class="2ndary" style="display:none">
      <li class="2ndary" style="display:none" rel="tab_previewDetails">
       <div class="tab_fs__head-icon i-details_24" rel="tab_previewDetails"></div>
       <span rel="tab_previewDetails">Details</span>
      </li>
      <li class="2ndary" style="display:none" rel="tab_previewPayload">
       <div class="tab_fs__head-icon i-payloads_24" rel="tab_previewPayload"></div>
       <span rel="tab_previewPayload">Payload</span>
      </li>
     </ul>
   </li>
  </ul>
  <div class="tab_fs__head-icon_exp"></div>
 </div>

 <div class="tab_fs__container">
  <div class="tab_fs__container-content active" id="tab_previewDetails" blockid="tab_previewDetails" />
  <div class="tab_fs__container-content" id="tab_previewPayload" blockid="tab_previewPayload" style="display:none;" />
  <div class="tab_fs__container-content" id="tab_previewSync" blockid="tab_previewSync" style="display:none;" />
</div>

`;

/* ACTIVITY CARD FULL SCREEN PREVIEW << END */