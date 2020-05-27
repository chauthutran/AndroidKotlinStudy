
function Templates() {};

// -------------------------------------

Templates.inputFieldHidden = `<input type='hidden' id='' value='' name='' class='hiddenData' >`;

Templates.inputFieldStandard = `<div class="inputField field" >
<div class="field__label fieldLabel"><label class="displayName"></label></div>
<div class="fiel__controls">
  <div class="field__left"></div>
  <div class="field__right" style="display: none;"></div>
</div>
</div>`;

Templates.inputFieldCheckbox = `<div class="checkbox">
<div class="checkbox__label fieldLabel"><label class="displayName"></label></div>
<div class="checkbox__wrapper">
  <div class="optsContainer checkbox-col">
  </div>
</div>
</div>`;
Templates.inputFieldCheckbox_Item = `<div class="checkbox-group horizontal">
<input id="" type="checkbox">
<label for=""></label>
</div>`;
Templates.inputFieldCheckbox_SingleItem = `<div class="checkbox-group">
<input id="" type="checkbox">
<label for=""></label>
</div>`;

Templates.inputFieldToggle = `<div class="toogle-s">
<div class="toogle-s__label fieldLabel"><label class="displayName"></label></div>
<div class="toogle-s-content">
  <label class="toggle">
    <input type="checkbox" class="inputFieldTag toggle_input">
    <div class="toggle-control"></div>
  </label>
</div>
</div>`;
Templates.inputFieldToggle_Item = `<div class="toogle-s-content">
<label class="toggle">
  <input type="checkbox" class="toggle_input">
  <div class="toggle-control"></div>
</label>
</div>`;

Templates.inputFieldRadio = `<div class="radiobutton">
<div class="radiobutton__label fieldLabel"><label class="displayName"></label>
</div>
<div class="radiobutton__wrapper">
  <div class="optsContainer radiobutton-col"></div>
</div>
</div>`;

Templates.inputFieldRadio_Item = `<div class="radio-group">
  <input name="" type="radio" id="">
    <label for="" term="">Option 1</label>
</div>`;


Templates.inputFieldYear = `
<div class="containerSymbol">
  <input id="" type="text" class="inputTrue dataValue" name="" uid="" />
  <input id="" type="text" class="inputShow displayValue form-type-text" isNumber="true" >
  <dialog class="inputFieldYear">
    <div class="modalSymbol">
      <div class="dialog__title">
        <input type="text" class="searchSymbol">
        <span class="closeSearchSymbol">ï¿?/span>
      </div>
      <div class="container--optionsSymbol">
        <ul class="optionsSymbol">
        </ul>
      </div>
      <div class="dialog__action">
        <div id="dialog_act2" class="button-text warning">
          <div class="button__container">
            <div class="declineButton button-label" term="cancel">CANCEL</div>
          </div>
        </div>
        <div id="dialog_act1" class="button-text primary">
          <div class="button__container">
            <div class="acceptButton button-label" term="">SELECT</div>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</div>`;
/*

      <div class="controlsSymbol">
        <button class="acceptButton">SELECT</button>
        <button class="declineButton">CANCEL</button>
      </div>

*/

Templates.searchOptions_Dialog = `<dialog id="dialog_searchOptions" style="display: none;">
<div class="dialog__title"><label class="title">title</label></div>
<div class="dialog__search">
  <div class="field_leading_icon">
    <div class="field_leading_icon__controls">
      <div class="field_leading_icon__l-icon"></div>
      <div class="field_leading_icon__input">
        <input type="text" class="searchText" autocomplete="true" mandatory="true" placeholder="Search">
      </div>
      <div class="field_leading_icon__right"></div>
    </div>
  </div>
</div>
<div class="dialog__text">
  <div class="optsContainer">
  </div>
</div>
<div class="dialog__action">
  <div id="dialog_act2" class="button-text warning">
    <div class="button__container">
      <div class="cancel button-label">CANCEL</div>
    </div>
  </div>
  <div id="dialog_act1" class="button-text primary">
    <div class="button__container">
      <div class="runAction button-label">SELECT</div>
    </div>
  </div>
</div>
</dialog>`;


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

Templates.activityCardFullScreen = `
<div class="wapper_card">
 <div class="sheet-title c_900" >
    <img src='images/arrow_back.svg' class='btnBack'>
    <span>Details</span>
 </div>
 <div class="card _tab activity">
  <div class="card__sync" >
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




/* ONLINE/OFFLINE SWITCHING PROMPT >> START */


Templates.ConnManagerNew_Dialog_notSupportedMode = `
<dialog id="dialog_confirmation_mac" style="display: block;">

<div class="dialog__title"><label class="title">you need to start :-(</label></div>

<div class="dialog__status">
  <div class="icon dialog__status-img" style="background-image: url('images/start_again.svg')"></div>
</div>

<div class="prompt dialog__text">
This functionality is not supported under current networkMode - you need to restart the process
</div>

<div class="dialog__action">
  <div id="dialog_act1" class="button-text primary c_500">
    <div class="button__container">
      <div class="runAction button-label">Go to activity list</div>
    </div>
  </div>
</div>

</dialog>`;

Templates.ConnManagerNew_Dialog_Manual_goOffline_Opts = `
<dialog id="dialog_confirmation_mac" style="display: block;">

<div class="dialog__title"><label class="title">blah blah blah :-)</label></div>

<div class="dialog__status">
  <div class="icon dialog__status-img" ></div>
</div>

<div class="prompt dialog__text"></div>

<div class="networkSwitchOpts">
  <div class="networkSwitchOpt radio-group">
    <input type="radio" name="switch_waitingTimeOpt" value="1" id="waitingTimeOpt_1">
    <label for="waitingTimeOpt_1" term="">Try to connect in 60sec</label>
  </div>
  <div class="networkSwitchOpt radio-group">
    <input type="radio" name="switch_waitingTimeOpt" CHECKED value="30" id="waitingTimeOpt_30">
    <label for="waitingTimeOpt_30" term="">Try to connect in 30min</label>
  </div>
  <div class="networkSwitchOpt radio-group">
    <input type="radio" name="switch_waitingTimeOpt" value="60" id="waitingTimeOpt_60">
    <label for="waitingTimeOpt_60" term="">Try to connect in 1hr</label>
  </div>
  <div class="networkSwitchOpt radio-group">
    <input type="radio" name="switch_waitingTimeOpt" value="240" id="waitingTimeOpt_240">
    <label for="waitingTimeOpt_240" term="">Try to connect in 4hr</label>
  </div>
  <div class="networkSwitchOpt radio-group">
    <input type="radio" name="switch_waitingTimeOpt" value="0" id="waitingTimeOpt_0">
    <label for="waitingTimeOpt_0" term="">Stay offline</label>
  </div>
</div>

<div class="dialog__action">
  <div id="dialog_act2" class="button-text warning">
    <div class="button__container">
      <div class="cancel button-label">CANCEL</div>
    </div>
  </div>
  <div id="dialog_act1" class="button-text primary c_500">
    <div class="button__container">
      <div class="runAction button-label">ACCEPT</div>
    </div>
  </div>
</div>

</dialog>

`;

Templates.ConnManagerNew_Dialog_Manual_goOnline = `
<dialog id="dialog_confirmation_mac" style="display: block;">

<div class="dialog__title"><label class="title">blah blah blah :-)</label></div>

<div class="dialog__status">
  <div class="icon dialog__status-img" ></div>
</div>

<div class="prompt dialog__text"></div>

<div class="dialog__action">
  <div id="dialog_act2" class="button-text warning">
    <div class="button__container">
      <div class="cancel button-label">CANCEL</div>
    </div>
  </div>
  <div id="dialog_act1" class="button-text primary c_500">
    <div class="button__container">
      <div class="runAction button-label">ACCEPT</div>
    </div>
  </div>
</div>

</dialog>
`;

Templates.ConnManagerNew_Dialog_NoInternet = `
<dialog id="dialog_confirmation_mac" style="display: block;">

<div class="dialog__title"><label class="title" term="">No internet :~(</label></div>

<div class="dialog__status">
  <div class="icon dialog__status-img" ></div>
</div>

<div class="prompt dialog__text" term="">
Oops - it looks like you no longer have access to the internet. Ensure that you are in an area with network cover, and that you have data active on your mobile plan. Alternatively you can go offline and continue working. The app will try to reconnect in 10m.
</div>

<div class="dialog__action">
  <div id="dialog_act2" class="button-text warning">
    <div class="button__container">
      <div class="cancel button-label">WAIT</div>
    </div>
  </div>
</div>

</dialog>
`;

Templates.ConnManagerNew_Dialog_ServerUnavailable = `
<dialog id="dialog_confirmation_mac" style="display: block;">

<div class="dialog__title"><label class="title">blah blah blah :-<</label></div>

<div class="dialog__status">
  <div class="icon dialog__status-img" ></div>
</div>

<div class="prompt dialog__text"></div>

<div class="dialog__action">
  <div id="dialog_act2" class="button-text warning">
    <div class="button__container">
      <div class="cancel button-label">WAIT</div>
    </div>
  </div>
</div>

</dialog>
`;

Templates.ConnManagerNew_Dialog_SwitchMode_NoOpts = `
<dialog id="dialog_confirmation_mac" style="display: block;">

<div class="dialog__title"><label class="title">No internet :-(</label></div>

<div class="dialog__status">
  <div class="icon dialog__status-img"></div>
</div>

<div class="prompt dialog__text"></div>

<div class="dialog__action">
  <div id="dialog_act2" class="button-text warning">
    <div class="button__container">
      <div class="cancel button-label">Wait</div>
    </div>
  </div>
  <div id="dialog_act1" class="button-text primary c_500">
    <div class="button__container">
      <div class="runAction button-label">Go offline</div>
    </div>
  </div>
</div>

</dialog>`;



Templates.ConnManagerNew_Dialog_prompt_online = `Oops - it looks like you no longer have access to the internet. Ensure that you are in
an area with network cover, and that you have data active on your mobile plan. Alternatively you can go offline
and continue working. The app will try to reconnect in 10m.`;

Templates.ConnManagerNew_Dialog_prompt_onlineButOffline = `Oops - PSI WFA DWS is not availalbe. You can continue working offline - only the online search will be disabled. The app will try to reconnect in 10m.`;

Templates.ConnManagerNew_Dialog_prompt_notSupportedMode = `This functionality is not supported under current networkMode - you need to restart the process`;

Templates.ConnManagerNew_Dialog_prompt_manualOffline = `Are you sure you want to go offline? The app will continue working, but some operations like online search will not be available.`;

Templates.ConnManagerNew_Dialog_prompt_manualOnline = `Hurray ! There is internet available. We will connect you back, so all operations, including online search, are available. We will also sync all pending records`;

Templates.ConnManagerNew_Dialog_prompt_network_Unavailable = `Oops - it looks like you no longer have access to the internet. Ensure that you are in an area with network cover, and that you have data active on your mobile plan. Alternatively you can go offline and continue working.`;

Templates.ConnManagerNew_Dialog_prompt_switchOnline_Unavailable = `Oops - PSI CwS DWS is not availalbe. You can continue  working offline - only the online search will be disabled. The app will try to reconnect in 10m.`;

/* ONLINE/OFFLINE SWITCHING PROMPT << END */





/* lOGIN/CHANGE USER >> START */


Templates.buttonsTemplate  = `<div class="button">
                                  <div class="button__container">
                                  <div class="button-label">Action 1</div>
                                </div>
                              </div>
                              `;


Templates.template_bottomSheet = `
      <div class="" style="display: block;">
        <div class="sbtt-btn__header">
          <div class="sbtt-btn__header_title">Containing four buttons</div>
        </div>
        <div class="cta_buttons">
          <div class="button primary c_500">
            <div class="button__container">
              <div class="button-label">Action 1</div>
            </div>
          </div>
          <div class="button primary c_500">
            <div class="button__container">
              <div class="button-label">Action 2</div>
            </div>
          </div>
          <div class="button primary c_500">
            <div class="button__container">
              <div class="button-label">Action 3</div>
            </div>
          </div>
          <div class="button primary c_500">
            <div class="button__container">
              <div class="button-label">Action 4</div>
            </div>
          </div>
        </div>
      </div> `;  




Templates.targetTag = $( 'div.sheet_bottom' );

Templates.setContent = function( htmlStructure, ignoreScrim )
{
    Templates.targetTag.empty();

    Templates.targetTag.html(htmlStructure);

    // run some height calculations + adjust position (if required) < might not be necessary

    if ( ! ignoreScrim )
    {
        $( '.scrim' ).show();
        $( '.scrim').css('zIndex',100);
        $( '.scrim').css('opacity', 0.4);
        $('div.sheet_bottom').css('zIndex',3000);
    }
   
   // showMsgManager.targetTag.slideDown("slow");
   Templates.targetTag.fadeIn();

    return Templates.targetTag;

}

Templates.close = function()
{
    $( '.scrim' ).hide();
    Templates.targetTag.empty();
    Templates.targetTag.hide();
  
}
/* lOGIN/CHANGE USER << END */
Templates.buttonsTemplate2  = `<div class="button-text ">
                                <div class="button__container">
                                  <div class="button-label">Wait</div>
                                </div>
                              </div>`


Templates.template_dialog = `
                <dialog id="dialog_confirmation" style="display: block;">
                  <div class="dialog__title"><label>Confirmation dialog</label></div>
                  <div class="dialog__text">Competently benchmark principle-centered synergy with tactical services. Energistically
                    target multidisciplinary relationships through premium leadership. Monotonectally network standards compliant
                    products whereas turnkey intellectual capital. Authoritatively target multimedia based opportunities with.</div>
                  <div class="dialog__action">
                    <div id="dialog_act2" class="button-text warning">
                      <div class="button__container">
                        <div class="button-label">Action 2</div>
                      </div>
                    </div>
                    <div id="dialog_act1" class="button-text primary c_500">
                      <div class="button__container">
                        <div class="button-label">Action 1</div>
                      </div>
                    </div>
                  </div>
                </dialog>
                    `;  



// -------------- Advanced LOGIN ------- //

Templates.Advance_Login_Buttons = `
  <div class="sheet_bottom-btn3" style="display: block;">
    <div class="sbtt-btn__header">
      <div class="sbtt-btn__header_title">Advance options</div>
    </div>
    <div class="cta_buttons">
      <div class="button primary c_500 dis" id="switchToStagBtn">
        <div class="button__container">
          <div class="button-label">switch to Staging</div>
        </div>
        </div>
        <div class="button primary c_500 dis" id="demoBtn">
        <div class="button__container">
          <div class="button-label">Demo mode</div>
        </div>
      </div>
      <div class="button primary c_500" id="changeUserBtn">
        <div class="button__container">
          <div class="button-label" term="change_user">Change user</div>
        </div>
      </div>
    </div>
  </div> `


  Templates.Change_User_Form = `
   <dialog id="dialog_confirmation" style="display: block;">
      <div class="dialog__title"><label>Confirmation dialog</label></div>
        <div class="dialog__text" term="change_user_msg">
            Changing user will delete all data for the user, including any data not syncronized. 
            Are you sure that you want to delete the data for user and allow new user login ?
        </div>
        <div class="dialog__action"><div class="button-text warning" id="accept">
            <div class="button__container">
              <div class="button-label" term="accept">Accept</div>
            </div>
          </div>
          <div class="button-text primary c_500" id="cancel">
            <div class="button__container">
              <div class="button-label" term="Cancel">Cancel</div>
            </div>
          </div>
        </div>
    </dialog>`
