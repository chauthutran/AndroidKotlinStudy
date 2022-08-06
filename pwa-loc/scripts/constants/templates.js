
function Templates() {};

// -------------------------------------
// ----- HTML Templates --------

Templates.cardContentDivTag = `<div class="cardContentDisplay card__row"></div>`;

// Templates.inputFieldHidden = `<input type='hidden' class='hiddenData' >`;
Templates.inputFieldHidden = `<input type='hidden' >`;

Templates.inputFieldStandard = `<div class="fieldBlock field">
  <div class="field__label">
    <label class="displayName"></label>
  </div>
  <div class="fiel__controls">
    <div class="field__left"></div>
    <div class="field__right" style="display: none;"></div>
  </div>
</div>`;

Templates.labelField = `<label class="fieldBlock displayName"></label>`;

Templates.inputFieldCheckbox = `<div class="checkbox fieldBlock">
<div class="checkbox__label"><label class="displayName"></label></div>
<div class="checkbox__wrapper listWrapper">
  <div class="checkbox-col">
  </div>
</div>
</div>`;
Templates.inputFieldCheckbox_Item = `<div class="checkbox-group horizontal">
<input id="checkboxName1" type="checkbox">
<label for="checkboxName1"></label>
</div>`;
Templates.inputFieldCheckbox_SingleItem = `<div class="checkbox-group horizontal">
<input type="checkbox" class="dataValue displayValue"><label ></label>
</div>`;

Templates.inputFieldToggle = `<div class="toogle-s">
<div class="toogle-s__label"><label class="displayName"></label></div>
<div class="toogle-s-content">
  <label class="toggle">
    <input type="checkbox" class="inputFieldTag toggle_input">
    <div class="toggle-control"></div>
  </label>
</div>
</div>`;


Templates.inputFieldRadio = `<div class="radiobutton fieldBlock">
<div class="radiobutton__label"><label class="displayName"></label>
</div>
<div class="radiobutton__wrapper listWrapper">
  <div class="radiobutton-col"></div>
</div>
</div>`;

Templates.inputFieldRadio_Item = `<div class="radiogrp radio-group2 horizontal">
    <input type="radio" >
    <label></label>
</div>`;


Templates.inputFieldYear = `
<div class="containerSymbol">
  <input type="text" class="inputTrue dataValue"/>
  <input type="text" class="inputShow displayValue form-type-text inputValidation" isNumber="true" >
  <dialog class="inputFieldYear">
    <div class="modalSymbol">
      <div class="dialog__title">
        <input type="text" class="searchSymbol">
        <span class="closeSearchSymbol">�?/span>
      </div>
      <div class="container--optionsSymbol checkbox">
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

Templates.searchOptions_Dialog = `<dialog id="dialog_searchOptions" class="dialogSearch" style="display: none;">
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
  <div id="clearBtn" class="button-text primary">
    <div class="button__container">
      <div class="button-label" term='clear'>Clear</div>
    </div>
  </div>
  <div id="closeBtn" class="button-text warning">
    <div class="button__container">
      <div class="button-label">Close</div>
    </div>
  </div>
</div>
</dialog>`;


Templates.msgAreaBottomContent = `<div class="msgArea sync_all">
        <div class="msgHeader sync_all__header" style="height: 20px;" />
        <div class="msgContent bottom__wrapper list" style="margin-top: 8px; border-bottom: 1px solid #eee;" />
    </div>`;

Templates.syncMsg_Header = `<div class="msgHeaderLabel sync_all__header_title" style="height: 20px;">Synchronization Services Deliveries</div>
    <div class="divSyncAllClose mouseDown" style="float: right; cursor: pointer; margin-top: -5px !important;">
        <img src="images/close.svg" style="width: 26px; height: 26px;" />
    </div>`;

Templates.syncMsg_Section = `<div class="sync_all__section">
      <div class="sync_all__section_title"></div>
      <div class="sync_all__section_log"></div>
  </div>`;

Templates.msgSection = `<div class="msgSection sync_all__section">
    <div class="msgSectionTitle sync_all__section_title"></div>
    <div class="msgSectionLog sync_all__section_log"></div>
</div>`;

// -------------------------------------


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

/* STATISTICS >> START */
Templates.title_section = `<div class="title_section">
  <div class="title_section__icon" />
  <div class="title_section__title">Title of Table</div>
</div>`;

Templates.text_section = `<div class="section_description"/>`;
/* STATISTICS << END */


/* SVG ITEMS >> START */
Templates.svg_Table = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 10.02H15V21H10V10.02ZM17 21H20C21.1 21 22 20.1 22 19V10H17V21ZM20 3H5C3.9 3 3 3.9 3 5V8H22V5C22 3.9 21.1 3 20 3ZM3 19C3 20.1 3.9 21 5 21H8V10H3V19Z" fill="#333" fill-opacity="0.87"></path>
</svg>`;

Templates.svg_Activities = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#333333" fill-opacity="0.87"></path>
</svg>`;

Templates.svg_Detail = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 19C10.9 19 10 19.9 10 21C10 22.1 10.9 23 12 23C13.1 23 14 22.1 14 21C14 19.9 13.1 19 12 19ZM6 1C4.9 1 4 1.9 4 3C4 4.1 4.9 5 6 5C7.1 5 8 4.1 8 3C8 1.9 7.1 1 6 1ZM6 7C4.9 7 4 7.9 4 9C4 10.1 4.9 11 6 11C7.1 11 8 10.1 8 9C8 7.9 7.1 7 6 7ZM6 13C4.9 13 4 13.9 4 15C4 16.1 4.9 17 6 17C7.1 17 8 16.1 8 15C8 13.9 7.1 13 6 13ZM18 5C19.1 5 20 4.1 20 3C20 1.9 19.1 1 18 1C16.9 1 16 1.9 16 3C16 4.1 16.9 5 18 5ZM12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13ZM18 13C16.9 13 16 13.9 16 15C16 16.1 16.9 17 18 17C19.1 17 20 16.1 20 15C20 13.9 19.1 13 18 13ZM18 7C16.9 7 16 7.9 16 9C16 10.1 16.9 11 18 11C19.1 11 20 10.1 20 9C20 7.9 19.1 7 18 7ZM12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7ZM12 1C10.9 1 10 1.9 10 3C10 4.1 10.9 5 12 5C13.1 5 14 4.1 14 3C14 1.9 13.1 1 12 1Z" fill="#333333" fill-opacity="0.87"></path>
</svg>`;

Templates.svg_Consult = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 3H14.82C14.4 1.84 13.3 1 12 1C10.7 1 9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4C13 4.55 12.55 5 12 5C11.45 5 11 4.55 11 4C11 3.45 11.45 3 12 3ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="#333333" fill-opacity="0.87"></path>
</svg>`;

Templates.svg_Chart_Bar = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 9.2H8V19H5V9.2ZM10.6 5H13.4V19H10.6V5ZM16.2 13H19V19H16.2V13Z" fill="#333333" fill-opacity="0.87"></path>
</svg>`;

Templates.svg_Chart_Pie = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 2V22C5.93 21.5 2 17.21 2 12C2 6.79 5.93 2.5 11 2ZM13.03 2V10.99H22C21.53 6.25 17.76 2.47 13.03 2ZM13.03 13.01V22C17.77 21.53 21.53 17.75 22 13.01H13.03Z" fill="#333333" fill-opacity="0.87"></path>
</svg>`;

Templates.svg_Chart_Line = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.5 18.49L9.5 12.48L13.5 16.48L22 6.92001L20.59 5.51001L13.5 13.48L9.5 9.48001L2 16.99L3.5 18.49Z" fill="#333333"></path>
</svg>`;

/* SVG ITEMS << END */


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
    <div class="networkSwitchOpt radiogrp radio-group">
      <input type="radio" name="switch_waitingTimeOpt" value="10" id="waitingTimeOpt_10s">
      <label for="waitingTimeOpt_10s" term="networkSwitch_tryConnect_10sec">Try to connect in 10sec</label>
    </div>
    <div class="networkSwitchOpt radiogrp radio-group">
      <input type="radio" name="switch_waitingTimeOpt" value="60" id="waitingTimeOpt_60s">
      <label for="waitingTimeOpt_60s" term="networkSwitch_tryConnect_60sec">Try to connect in 60sec</label>
    </div>
    <div class="networkSwitchOpt radiogrp radio-group">
      <input type="radio" name="switch_waitingTimeOpt" CHECKED value="180" id="waitingTimeOpt_30m">
      <label for="waitingTimeOpt_30m" term="networkSwitch_tryConnect_30min">Try to connect in 30min</label>
    </div>
    <div class="networkSwitchOpt radiogrp radio-group">
      <input type="radio" name="switch_waitingTimeOpt" value="360" id="waitingTimeOpt_1h">
      <label for="waitingTimeOpt_1h" term="networkSwitch_tryConnect_1hr">Try to connect in 1hr</label>
    </div>
    <div class="networkSwitchOpt radiogrp radio-group">
      <input type="radio" name="switch_waitingTimeOpt" value="1440" id="waitingTimeOpt_4h">
      <label for="waitingTimeOpt_4h" term="networkSwitch_tryConnect_4hr">Try to connect in 4hr</label>
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

</dialog>`;


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

</dialog>`;


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

</dialog>`;


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

</dialog>`;


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

Templates.ConnManagerNew_Dialog_prompt_notSupportedMode = `<span term="networkSwitch_prompt_notSupportedMode">This functionality is not supported under current networkMode - you need to restart the process</span>`;

Templates.ConnManagerNew_Dialog_prompt_manualOffline = `<span term="networkSwitch_prompt_manualOffline">Are you sure you want to go offline? The app will continue working, but some operations like online search will not be available.</span>`;

Templates.ConnManagerNew_Dialog_prompt_manualOnline = `<span term="networkSwitch_prompt_manualOnline">Hurray ! There is internet available. We will connect you back, so all operations, including online search, are available.</span>`;
//  We will also sync all pending records

Templates.ConnManagerNew_Dialog_prompt_network_Unavailable = `<span term="networkSwitch_prompt_networkUnavailable">Oops - it looks like you no longer have access to the internet. Ensure that you are in an area with network cover, and that you have data active on your mobile plan. Alternatively you can go offline and continue working.</span>`;

Templates.ConnManagerNew_Dialog_prompt_switchOnline_Unavailable = `<span term="networkSwitch_prompt_switchOnlineUnavailable">Oops - PSI CwS DWS is not availalbe. You can continue  working offline - only the online search will be disabled. The app will try to reconnect in 10m.</span>`;

/* ONLINE/OFFLINE SWITCHING PROMPT << END */


/* lOGIN/CHANGE USER >> START */


Templates.buttonsTemplate  = `<div class="button">
    <div class="button__container">
    <div class="button-label">Action 1</div>
  </div>
</div>`;


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


/* lOGIN/CHANGE USER << END */
Templates.buttonsTemplate2  = `<div class="button-text ">
  <div class="button__container">
    <div class="button-label">Wait</div>
  </div>
</div>`;

Templates.template_dialog = `
<dialog id="dialog_confirmation" style="display: block;">
  <div class="dialog__title"><label>dialog title</label></div>
  <div class="dialog__text">dialog message</div>
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
</dialog>`;  


Templates.sheetBottomBtn = `
<div class="sheet_bottom-btn3 sheetBottomBtnDiv" style="display: block; max-height: 100px;">
  <div class="sbtt-btn__header" style="height: unset;">
    <div class="sbtt-btn__header_title sheetBottomBtnTitle" term="" style="font-size: 0.94rem; height: 40px; margin-top: 4px;"></div>
  </div>
  <div class="cta_buttons">
    <div class="button c_500 sheetBottomBtn">
      <div class="button__container">
        <div class="button-label" term="">Next Client</div>
      </div>
    </div>
  </div>
</div> `;


// -------------- Advanced LOGIN ------- //

Templates.Advance_Login_Buttons = `
<div class="sheet_bottom-btn3" style="display: block;">
  <div class="sbtt-btn__header">
    <div class="sbtt-btn__header_title" term="login_advancedOptions">Advanced options</div>
  </div>
  <div class="cta_buttons">
    <div class="button c_500 changeUserBtn">
      <div class="button__container">
        <div class="button-label" term="login_changeUser">Change user</div>
      </div>
    </div>
  </div>
</div> `;


Templates.Change_User_Form = `
<dialog id="dialog_confirmation" style="display: block;">
<div class="dialog__title">
  <label term="login_confirmDialogTitle">Confirmation dialog</label>
</div>
<div class="dialog__text" term="login_changeUserMsg">
    Changing user will delete all data for the user, including any data not syncronized. 
    Are you sure that you want to delete the data for user and allow new user login ?
</div>
<div class="dialog__action"><div class="button-text warning" id="accept">
  <div class="button__container">
    <div class="button-label" term="common_accept">Accept</div>
  </div>
</div>
<div class="button-text primary c_500" id="cancel">
  <div class="button__container">
    <div class="button-label" term="common_cancel">Cancel</div>
  </div>
</div>
</dialog>`;

Templates.settings_app_data_configuration = `
<dialog id="dialog_confirmation" style="display: block;">
  <div class="dialog__title">
  <label term="settingPage_resetDialogTitle">Reset app data & configuration</label>
  </div>
  <div class="dialog__text" term="settingPage_appDataDeleteConfirmMsg">
    Your configuration and App data stored in the device will be deleted. Are you sure?
  </div>
  <div class="dialog__action"><div class="button-text warning">
    <div class="button__container">
      <div class="button-label divResetApp_Accept" term="common_accept">ACCEPT</div>
    </div>
  </div>
  <div class="button-text primary c_500">
    <div class="button__container">
      <div class="button-label divResetApp_Cancel" term="common_cancel">DECLINE</div>
    </div>
  </div>
</dialog>`;

Templates.sheetFullFrame = `
<div class="sheet_full-fs detailFullScreen sheetFull">
  <div class="wapper_card">
    <div style="display: flex;">
      <div class="sheet-title c_900">
        <img src="images/arrow_back.svg" class="btnBack mouseDown">
        <span class="sheetTopTitle" mark="templateSheetFull" term="term_newClient" style="vertical-align: super;">New Client</span>
      </div>
      <div style="width: 100px; display: flex">
        <div class="syncIcon mouseDown" title="SyncAll" style="width: 45px; opacity: 0.0; cursor: pointer;">-</div>
        <div class="onOfflineIcon mouseDown" title="Network" style="width: 49px; opacity: 0.0; cursor: pointer;">-</div>
      </div>
    </div>
    <div class="info contentBody" style="background-color: #FFF; overflow-y: auto !important; height: calc(100vh - 60px);">
    </div>
  </div>
</div>
`;