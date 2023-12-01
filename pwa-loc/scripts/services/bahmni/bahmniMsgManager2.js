function BahmniMsgManager() {};

BahmniMsgManager.timeMessageId_Interval;
BahmniMsgManager.syncMsgJson; 

BahmniMsgManager.MESSAGE_TYPE_SUMMARY = "summary";
BahmniMsgManager.MESSAGE_TYPE_DEFAULT = "text";
BahmniMsgManager.MESSAGE_TYPE_ERROR = "error";

BahmniMsgManager.bottomMsgShow = function (statusVal, activityJson, activityCardDivTag, contentFillFunc) {
	// If 'activityCardDivTag ref is not workign with fresh data, we might want to get it by activityId..
	BahmniMsgManager.setMsgAreaBottom(function (syncInfoAreaTag) {
		BahmniMsgManager.syncResultMsg_header(syncInfoAreaTag, activityCardDivTag);
		BahmniMsgManager.syncResultMsg_content(syncInfoAreaTag, activityCardDivTag, activityJson, statusVal, contentFillFunc);
	});
}

BahmniMsgManager.syncResultMsg_header = function (syncInfoAreaTag, activityCardDivTag) {
	var divHeaderTag = syncInfoAreaTag.find('div.msgHeader');
	var statusLabel = activityCardDivTag.find('div.activityStatusText').text();

	var syncMsg_HeaderPartTag = $(Templates.syncMsg_Header);
	syncMsg_HeaderPartTag.find('.msgHeaderLabel').text = statusLabel;

	divHeaderTag.html(syncMsg_HeaderPartTag);
};


BahmniMsgManager.syncResultMsg_content = function (syncInfoAreaTag, activityCardDivTag, activityJson, statusVal, contentFillFunc) {
	var divBottomTag = syncInfoAreaTag.find('div.msgContent');
	divBottomTag.empty();

	// 1. ActivityCard Info Add - From Activity Card Tag  
	var cardDivCopyTag = $(activityCardDivTag[0].outerHTML);
	cardDivCopyTag.find('div.tab_fs').remove();  // in case, it is clientCard Detail case, remove tab part under the client card.
	cardDivCopyTag.find('div.tab_fs__container').remove();

	divBottomTag.append(cardDivCopyTag); // << was activityJson.activityId


	// NEW: TODO: This content fill could be a call back
	if (contentFillFunc) {
		Util.tryCatchContinue(function () {
			contentFillFunc(divBottomTag);
		}, "syncResultMsg_content, Error in contentFillFunc call.");
	}
	else {
		// 2. Add 'processing' sync message.. - last one?
		Util.tryCatchContinue(function () {
			var historyList = activityJson.processing.history;

			if (historyList.length > 0) {
				var latestItem = historyList[historyList.length - 1];

				var title = 'Response code: ' + Util.getStr(latestItem.responseCode);
				var formattedMsg = BahmniMsgManager.getMsgFormatted(latestItem.msg, statusVal);

				BahmniMsgManager.bottomMsg_sectionRowAdd(divBottomTag, title, formattedMsg);
			}
		}, "syncResultMsg_content, activity processing history lookup");
	}
};

BahmniMsgManager.bottomMsg_sectionRowAdd = function (divBottomTag, title, msg, option) {
	var msgSectionTag = $(Templates.msgSection);
	msgSectionTag.find('div.msgSectionTitle').text(title);
	msgSectionTag.find('div.msgSectionLog').text(msg);

	if (option) {
		if (option.sectionMarginTop) msgSectionTag.css('margin-top', option.sectionMarginTop);
	}

	divBottomTag.append(msgSectionTag);
};

BahmniMsgManager.setMsgAreaBottom = function( callBack )
{    
    var syncInfoAreaTag = BahmniMsgManager.getMsgAreaBottom();

    callBack( syncInfoAreaTag );

    // Common ones - make a method out of it..
    syncInfoAreaTag.show( 200 );//css('display', 'block');
    $( '#divSubResourceMsgAreaBottomScrim' ).show();  //   opacity: 0.2;  <-- css changed

    syncInfoAreaTag.find( '.divSyncAllClose' ).click( MsgAreaBottom.closeMsgAreaBottomScrim );
};


BahmniMsgManager.getMsgAreaBottom = function()
{
    var msgAreaBottomTag = $( '#divSubResourceMsgAreaBottom' );
    msgAreaBottomTag.html( Templates.msgAreaBottomContent );  // resets previous html content..

    return msgAreaBottomTag;
};

BahmniMsgManager.hideProgressBar = function () {
    $('#divSubResourceProgressBar').hide();
}

BahmniMsgManager.getMsgFormatted = function (msg, statusVal) {
	var formattedMsg = '';

	if (msg) {
		if (statusVal === Constants.status_error || statusVal === Constants.status_failed) {
            if (msg.length > 140) formattedMsg = msg.substr(0, 70) + '....' + msg.substr(msg.length - 71, 70);
            else formattedMsg = msg;
		}
		else formattedMsg = Util.getStr(msg, 200);
	}

	return formattedMsg;
};

BahmniMsgManager.initializeProgressBar = function () {

	$("#divSubResourceProgressInfo").removeClass('indeterminate');
	$("#divSubResourceProgressInfo").addClass('determinate');

	FormUtil.updateProgressWidth(0);
	FormUtil.showProgressBar(0);
};

BahmniMsgManager.SyncMsg_InsertMsg = function (msgStr, type) {
	try {
		var realType = ( type == undefined ) ? BahmniMsgManager.MESSAGE_TYPE_DEFAULT : type;
		var newMsgJson = { "msg": msgStr, "datetime": UtilDate.formatDateTime(new Date(), Util.dateType_DATETIME_s1), type: realType };
		BahmniMsgManager.SyncMsg_Get().msgList.unshift(newMsgJson);
	}
	catch (errMsg) {
		console.log('Error BahmniMsgManager.SyncMsg_InsertMsg, errMsg: ' + errMsg);
	}
};

BahmniMsgManager.SyncMsg_InsertSummaryMsg = function (summaryMsgStr) {
	var syncMsgJson = BahmniMsgManager.SyncMsg_Get();  // BahmniMsgManager.syncMsgJson??

	if (syncMsgJson) {
		var newSummaryMsgJson = { "msg": summaryMsgStr };

		syncMsgJson.summaryList.unshift(newSummaryMsgJson);
	}
	else {
		//console.log( 'Error BahmniMsgManager.SyncMsg_InsertMsg, syncMsgJson undefined.' );
	}
};

BahmniMsgManager.SyncMsg_Get = function () {
	if (!BahmniMsgManager.syncMsgJson) BahmniMsgManager.SyncMsg_SetAsNew();

	return BahmniMsgManager.syncMsgJson;
};

BahmniMsgManager.SyncMsg_SetAsNew = function () {
	BahmniMsgManager.syncMsgJson = Util.cloneJson(SyncManagerNew.template_SyncMsgJson);
};


BahmniMsgManager.SyncMsg_ShowBottomMsg = function () {

    var syncInfoAreaTag = MsgAreaBottom.getMsgAreaBottom();

    var msgHeaderTag = syncInfoAreaTag.find('div.msgHeader');
    var msgContentTag = syncInfoAreaTag.find('div.msgContent');
    
    // 1. Set Header
    msgHeaderTag.append(Templates.syncMsg_Header);


	var serviceTag = BahmniMsgManager.SyncMsg_createSectionTag("Services Deliveries", BahmniMsgManager.bahmniServiceSectionTagId);
	var summaryTag = BahmniMsgManager.SyncMsg_createSectionTag("Summaries", BahmniMsgManager.bahmniSummarySectionTagId);

    // TODO: Need to update the sync progress status.. and register 

	BahmniMsgManager.timeMessageId_Interval = setInterval(() => {
		   	// 2. Set Body
		  	var syncMsgJson = BahmniMsgManager.SyncMsg_Get();

		   	// Add Service Deliveries Msg
		   	var serviceSectionLogTag = serviceTag.find("#log_" + BahmniMsgManager.bahmniServiceSectionTagId);
			serviceSectionLogTag.html("");
			for (var i = 0; i < syncMsgJson.msgList.length; i++) {
				var msgJson = syncMsgJson.msgList[i];
				if( msgJson.type == BahmniMsgManager.MESSAGE_TYPE_ERROR )
				{
					var msgStr = msgJson.datetime + '&nbsp; &nbsp;<span style="color:red">' + msgJson.msg + "</span>";
					serviceSectionLogTag.append('<div>' + msgStr + '</div>');
				}
				if( msgJson.type == BahmniMsgManager.MESSAGE_TYPE_SUMMARY )
				{
					var msgStr = msgJson.datetime + '&nbsp; &nbsp;' + msgJson.msg;
					serviceSectionLogTag.append('<div style="font-weight: bold">Summary: ' + msgStr + '</div>');
				}
				else
				{
					var msgStr = msgJson.datetime + '&nbsp; &nbsp;' + msgJson.msg;
					serviceSectionLogTag.append('<div>' + msgStr + '</div>');
				}
			}
			msgContentTag.append(serviceTag);

		    // Add Summaries Msg
			var summarySectionLogTag = summaryTag.find("#log_" + BahmniMsgManager.bahmniSummarySectionTagId);
			summarySectionLogTag.html("");
			for (var i = 0; i < syncMsgJson.summaryList.length; i++) {
				var msgJson = syncMsgJson.summaryList[i];
				summarySectionLogTag.append('<div>' + msgJson.msg + '</div>');
			}
			summarySectionLogTag.append('<div>&nbsp;</div>');

			msgContentTag.append(summaryTag);
	   	   
	}, Util.MS_SEC);
 

    // Common ones - make a method out of it..
    syncInfoAreaTag.show( 200 );//css('display', 'block');
    $( '#divSubResourceMsgAreaBottomScrim' ).show();  //   opacity: 0.2;  <-- css changed

    syncInfoAreaTag.find( '.divSyncAllClose' ).click( function(){
		clearInterval( BahmniMsgManager.timeMessageId_Interval );
		MsgAreaBottom.closeMsgAreaBottomScrim();
	});

};

BahmniMsgManager.SyncMsg_createSectionTag = function (sectionTitle, id) {
	var sectionTag = $(Templates.syncMsg_Section);

	sectionTag.find('div.sync_all__section_title').attr("id", "section_" + id).html(sectionTitle);
	sectionTag.find('div.sync_all__section_log').attr("id", "log_" + id);

	return sectionTag;
};