
// -------------------------------------
// -- Static Classes - Message Manager Class

function MsgManager() { }

// --- Messaging ---
MsgManager.divMsgAreaTag;
MsgManager.spanMsgAreaCloseTag;
MsgManager.btnMsgAreaCloseTag;
MsgManager.spanMsgAreaTextTag;
MsgManager.divProgressAreaTag;
MsgManager.progressBar;
MsgManager.countDownNumerator = 0;
MsgManager.countDownDenominator = 0;
MsgManager.progressBarUpdateTimer = 25;
MsgManager.progressCheckCount = 0;
MsgManager._autoHide = true;
MsgManager._autoHideDelay = Util.MS_SEC * 10; // 10 sec - default setting.
MsgManager.timer = 0;
MsgManager.clicktimer = 0;
MsgManager.reservedIDs = []; //collection of predefined COMMON identifiable notification messages (if match exists in this array, do not create)
MsgManager.reservedMsgBlocks = [];

MsgManager.debugMode = false;

// --------------------------

MsgManager.CLNAME_NotifMsg = 'notifMsg';
MsgManager.CLNAME_NotifRed = 'notifRed';
MsgManager.CLNAME_NotifDark = 'notifDark';
MsgManager.CLNAME_PersistSwitch = 'persistSwitch';

// ============================

MsgManager.initialSetup = function () {
	MsgManager.divMsgAreaTag = $('#divMsgArea');
	MsgManager.spanMsgAreaCloseTag = $('#spanMsgAreaClose');
	MsgManager.btnMsgAreaCloseTag = $('#btnMsgAreaClose');
	MsgManager.spanMsgAreaTextTag = $('#spanMsgAreaText');
	MsgManager.divProgressAreaTag = $('#divMsgProgress');

	MsgManager.btnMsgAreaCloseTag.click(function () {
		MsgManager.msgAreaClear_Alt('fast');
		MsgManager.divProgressAreaTag.empty();
	});

	var dcdConfig = ConfigManager.getConfigJson();
	if (dcdConfig.settings && dcdConfig.settings.message) {
		MsgManager._autoHide = dcdConfig.settings.message.autoHide;
		MsgManager._autoHideDelay = dcdConfig.settings.message.autoHideTime;
	}
};


MsgManager.msgAreaShow = function (msg, type, optClasses, hideTimeMs) {
	var msgTag;

	try {
		var colorClass = (type === 'ERROR') ? 'notifRed' : 'notifDark';

		msgTag = MsgManager.noticeMsg(msg, { cssClasses: colorClass, Xpos: 'right', Ypos: 'top', hideTimeMs: hideTimeMs } );

		if (optClasses) msgTag.addClass(optClasses); // Use 'persistSwitch' - for persisting between block button click/area close.    
	}
	catch (errMsg) { console.log('ERROR in MsgManager.msgAreaShow, errMsg: ' + errMsg); }

	return msgTag;
};


MsgManager.msgAreaShowErr = function (msg, optClasses, hideTimeMs) {
	return MsgManager.msgAreaShow(msg, 'ERROR', optClasses, hideTimeMs);
};


MsgManager.msgAreaClearAll = function () {
	$('.notifMsg').not('.' + MsgManager.CLNAME_PersistSwitch).remove();
};

MsgManager.msgAreaClear_Alt = function (speed) {
	if (speed) MsgManager.divMsgAreaTag.hide(speed);
	else MsgManager.divMsgAreaTag.hide();

	if (MsgManager.countDownNumerator) {
		MsgManager.divProgressAreaTag.empty();
		MsgManager.divProgressAreaTag.hide();
	}
};


// Old compatible method.
MsgManager.notificationMessage(bodyMessage, cssClasses, actionButton, styles, Xpos, Ypos, hideTimeMs, autoClick, addtoCloseClick, ReserveMsgID, disableClose, disableAutoWidth)
{
	options = {
		cssClasses: cssClasses,
		actionButton: actionButton,
		styles: styles,
		Xpos: Xpos,
		Ypos: Ypos,
		hideTimeMs: hideTimeMs,
		autoClick: autoClick,
		addtoCloseClick: addtoCloseClick,
		ReserveMsgID: ReserveMsgID,
		disableClose: disableClose,
		disableAutoWidth: disableAutoWidth
	}

	MsgManager.noticeMsg( bodyMessage, options );
};


MsgManager.noticeMsg = function (bodyMessage, options ) // cssClasses, actionButton, styles, Xpos, Ypos, hideTimeMs, autoClick, addtoCloseClick, ReserveMsgID, disableClose, disableAutoWidth) 
{
	// New Options
	if (options) {
		cssClasses = optionJson.cssClasses;
		actionButton = optionJson.actionButton;
		styles = optionJson.styles;
		Xpos = optionJson.Xpos;
		Ypos = optionJson.Ypos;
		hideTimeMs = optionJson.hideTimeMs;
		autoClick = optionJson.autoClick;
		addtoCloseClick = optionJson.addtoCloseClick;
		ReserveMsgID = optionJson.ReserveMsgID;
		disableClose = optionJson.disableClose;
		disableAutoWidth = optionJson.disableAutoWidth;
	}

	// ----------------

	var unqID = Util.generateRandomId();

	// TODO: Plan to remove this - used for geoLocation msg - to display only once ever?
	if (ReserveMsgID != undefined) {
		if (MsgManager.reservedIDs.length > 0 && MsgManager.reservedIDs.indexOf(ReserveMsgID) >= 0) return false;
		else {
			MsgManager.reservedIDs.push(ReserveMsgID.toString());
			MsgManager.reservedMsgBlocks.push({ "msgid": ReserveMsgID.toString(), "blockid": unqID });
		}
	}

	var screenWidth = document.body.clientWidth;
	var screenHeight = document.body.clientHeight;
	var offsetPosition = (disableAutoWidth != undefined ? (disableAutoWidth ? '4%' : (screenWidth < 480 ? '0' : '4%')) : (screenWidth < 480 ? '0' : '4%'));
	var optStyle = (disableAutoWidth != undefined ? 'style="max-width:93%;"' : (screenWidth < 480 ? 'style="width:100%;height:55px;padding: 6px 0 6px 0;"' : 'style="max-width:93%;"')); //93% = 97% - 4% (offsetPosition)

	// cssClasses <-- We could accept it as a single string class name or array of class names and apply properly..

	var class_RoundType = (disableAutoWidth != undefined && disableAutoWidth) ? 'rounded' : ((screenWidth < 480) ? '' : 'rounded');

	// THE MAIN TAG - 'notiDiv'
	var notifDiv = $('<div id="notif_' + unqID + '" class="notifMsg" ' + optStyle + '>'); // class="' + notifMsgClass + ' ' + cssClasses + ' ' + class_RoundType + '" >' );
	notifDiv.addClass(['notifBase', cssClasses, class_RoundType]);


	$('body').append(notifDiv)

	if (Xpos) notifDiv.css(Xpos, offsetPosition);
	if (Ypos) notifDiv.css(Ypos, offsetPosition);
	if (styles) Util.stylesStrAppy(styles, notifDiv);

	var Tbl = $('<table style="width:100%;padding:6px 4px;">');
	var tBody = $('<tbody>');
	var trBody = $('<tr>');
	var tdMessage = $('<td style="padding: 0px 5px;">');

	notifDiv.append(Tbl);
	Tbl.append(tBody);
	tBody.append(trBody);
	trBody.append(tdMessage);
	tdMessage.append(bodyMessage);


	// TODO: These 'actionButton' need to be redesigned / cleaned...
	if (actionButton) {
		var tdAction = $('<td>');
		trBody.append(tdAction);
		tdAction.append('<span>&nbsp;</span>');
		tdAction.append(actionButton);
		tdAction.append('<span>&nbsp;</span>');

		$(tdAction).click(() => {

			if (autoClick && MsgManager.clicktimer) {
				clearInterval(MsgManager.clicktimer);
				MsgManager.clicktimer = 0;
			}

			if (ReserveMsgID != undefined) MsgManager.clearReservedMessage(ReserveMsgID);

			$('#notif_' + unqID).remove();
		});
	}


	if (!disableClose) {
		var tdClose = $('<td style="width:24px;">');
		var notifClose = $('<img class="round" src="images/close_white.svg" style="border-radius:12px;" >');

		$(notifClose).click(() => {

			if (addtoCloseClick != undefined) addtoCloseClick();

			if (ReserveMsgID != undefined) MsgManager.clearReservedMessage(ReserveMsgID);

			$('#notif_' + unqID).remove();
		});

		trBody.append(tdClose);
		tdClose.append(notifClose);
	}


	// If 'delayHide' is intentionally set ( with some number or '0' for not hide ), set to 'delayTimer..
	if (!hideTimeMs) hideTimeMs = MsgManager._autoHideDelay;  // 10 sec..

	setTimeout(function () {

		if ($('#notif_' + unqID).is(':visible')) {
			$('#notif_' + unqID).fadeOut(750);

			setTimeout(function () {

				if (ReserveMsgID != undefined) MsgManager.clearReservedMessage(ReserveMsgID);
				else $('#notif_' + unqID).remove();
			}, Util.MS_SEC);
		}

	}, hideTimeMs);


	TranslationManager.translatePage(notifDiv);

	return notifDiv;
};


MsgManager.clearReservedMessage = function (reservedID) {
	if (reservedID != undefined) {
		if (MsgManager.reservedIDs.length > 0) {
			for (var i = 0; i < MsgManager.reservedIDs.length; i++) {
				if (MsgManager.reservedIDs[i] === reservedID) {
					$('#notif_' + MsgManager.reservedMsgBlocks[i].blockid).remove();
					MsgManager.reservedMsgBlocks.splice(MsgManager.reservedIDs.indexOf(reservedID), 1);
					MsgManager.reservedIDs.splice(MsgManager.reservedIDs.indexOf(reservedID), 1);
					// TRAN TODO : WHY DO WE NEED TO SET reservedID as null ????
					reservedID = null;
					return true;
				}
			}
		}
	}

	// TRAN TODO : SHOULD WE RETURN SOMETHING HERE ????
}


MsgManager.confirmPayloadPreview = function (parentTag, jsonData, titleTag, callBackSuccess) {
	if (jsonData) {
		//var dataPreview =  Util.jsonToArray ( jsonData, 'name:value' );
		var unqID = Util.generateRandomId();

		var screenWidth = document.body.clientWidth;
		var screenHeight = document.body.clientHeight;
		var notifDiv = $('<div id="notif_' + unqID + '" class="previewPayload" >');

		$(parentTag).append(notifDiv);

		var prevRow = $('<div class="sheet_preview" />');
		var btnRow = $('<div style="height:90px;text-align:center;margin-top:30px;" />');
		var btnConfirm = $(`<div class="button primary button-full_width">
                                <div class="button__container">
                                    <div class="button-label" term="payloadPreview_btnConfirm">Confirm</div>
                                </div>
                            </div>` );

		var btnDecline = $(`<div class="button alert button-full_width">
                                <div class="button__container">
                                    <div class="button-label" term="payloadPreview_btnCancel">Cancel</div>
                                </div>
                            </div>` );

		// var btnConfirm = $( '<button term="" class="acceptButton" style="">CONFIRM</button>' );
		// var btnDecline = $( '<button term="" class="declineButton" style="">CANCEL</button>' );

		notifDiv.append(prevRow)
		notifDiv.append(btnRow);
		prevRow.append(titleTag);
		FormUtil.renderPreviewDataForm(jsonData, prevRow);
		//prevRow.find( 'table' ).css( 'max-width', prevRow.css( 'width' ) );

		btnRow.append(btnConfirm)
		btnRow.append(btnDecline)

		btnConfirm.click(function () {

			$('#notif_' + unqID).remove();

			if (callBackSuccess) callBackSuccess(true);

		});

		btnDecline.click(function () {

			$('#notif_' + unqID).remove();

			if (callBackSuccess) callBackSuccess(false);

		});

		prevRow.css('--width', parentTag.css('width'));

		TranslationManager.translatePage();
	}

}

// -- End of Message Manager Class
// -------------------------------------
