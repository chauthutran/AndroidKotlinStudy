// -------------------------------------------
// -- ConsoleCustomLog Class/Methods

function ConsoleCustomLog() { };

ConsoleCustomLog.customLogData = [];

ConsoleCustomLog.divDialogTagId = '#divCustomLogDisplay';

// -------------------------------------
// Custom console log method:

console.customLog = function (msg, label) {
	console.log(msg);

	if (msg) {
		//console.log( msg );

		// TODO: Ways to display / show the location of error?
		// NOTE: WAYS TO TELL WHICH METHOD CALLED THIS --> console.log(new Error('I was called').stack) OR Use 'this' on caller!!!

		// Add to debug appInfo - only if the msg is string..
		//var log = { 'dateTime': ( new Date() ).toISOString(), 'msg': Util.getStr( msg, 400 ), 'label': label };
		//AppInfoManager.addToCustomLogHistory( log );

		// NOTE, this could make the app size to get much bigger, 
		// Thus, we might want to limit the number of storage --> 200?
		//ConsoleCustomLog.customLogData.push( { 'msg': msg, 'label': label } );    
		//if ( ConsoleCustomLog.customLogData.length > 200 ) ConsoleCustomLog.customLogData.shift();    
	}
};

ConsoleCustomLog.clearLogs = function () {
	ConsoleCustomLog.customLogData = [];
};

// -------------------------------------
// Data UI show/hide 

ConsoleCustomLog.setInitialHtml = function () {
	var divDialogTag = $(ConsoleCustomLog.divDialogTagId);

	// Set HTML & values related
	divDialogTag.append(ConsoleCustomLog.contentHtml);
};

ConsoleCustomLog.showDialog = function () {
	var divDialogTag = $(ConsoleCustomLog.divDialogTagId);

	try {
		// populate the content here..
		var divMainContentTag = divDialogTag.find('div.divMainContent');

		// Display the content..
		ConsoleCustomLog.setMainContent(divMainContentTag, ConsoleCustomLog.customLogData);

		// Add events..
		ConsoleCustomLog.addEvents(divMainContentTag, divDialogTag);
	}
	catch (errMsg) {
		console.log(errMsg);
	}

	divDialogTag.show();
	$('.scrim').show();
};


ConsoleCustomLog.addEvents = function (divMainContentTag, divDialogTag) {

	// Close Button
	var btnCloseTag = divDialogTag.find('div.close');
	btnCloseTag.off('click').click(function () {
		ConsoleCustomLog.hideDialog();
	});


	// Command Example Selection
	var selLogRunCommandCaseTag = divDialogTag.find('.selLogRunCommandCase');
	selLogRunCommandCaseTag.off('change').change(function () {
		var caseStr = selLogRunCommandCaseTag.val();

		var inputCommandTag = divDialogTag.find('.inputLogRunCommand');

		if (caseStr === 'custom') {
			inputCommandTag.val('');
		}
		else if (caseStr === 'loadSampleData') {
			inputCommandTag.val('DevHelper.loadSampleData(20);');
		}
		else if (caseStr === 'removeSampleData') {
			inputCommandTag.val('DevHelper.removeSampleData();');
		}
		else if (caseStr === 'listClientData') {
			inputCommandTag.val('JSON.stringify( ClientDataManager.getClientList() );');
		}

		else if (caseStr === 'overrideSyncLastDwDate') {
			var lastDwDateStr = AppInfoManager.getSyncLastDownloadInfo();

			inputCommandTag.val('AppInfoManager.updateSyncLastDownloadInfo( "' + lastDwDateStr + '" );');
		}
		else if (caseStr === 'showOtherUsefulCommands') {
			console.log('1. ClientDataManager.getClientById( "-----" );');
			console.log('2. ClientDataManager.getClientByActivityId( "------" );');
			inputCommandTag.val('/* Commands shown on above log area. */');
		}
		else if (caseStr === 'devMode') {
			inputCommandTag.val('DevHelper.setDevMode( true );');
		}
		else if (caseStr === 'serverLinkOff') {
			inputCommandTag.val('WsCallManager.setWsTarget_NoServer(); ConnManagerNew.checkNSet_ServerAvailable();');
		}
		else if (caseStr === 'serverLinkOn') {
			inputCommandTag.val('WsCallManager.setWsTarget(); ConnManagerNew.checkNSet_ServerAvailable();');
		}

		else if (caseStr === 'serverAvailableCheck') {
			inputCommandTag.val('ConnManagerNew.checkNSet_ServerAvailable();');
		}
		else if (caseStr === 'disableConnCheck') {
			inputCommandTag.val('clearInterval( ScheduleManager.timerID_serverAvilableCheck );');
		}
		else if (caseStr === 'reEnableConnCheck') {
			inputCommandTag.val('ScheduleManager.schedule_serverStatus_Check( false );');
		}
		else if (caseStr === 'clearLogs') {
			inputCommandTag.val('ConsoleCustomLog.clearLogs();');
		}
	});


	// Run Command Button
	var btnLogRunCommandTag = divDialogTag.find('.btnLogRunCommand');
	btnLogRunCommandTag.off('click').click(function () {

		var runCommandVal = divDialogTag.find('.inputLogRunCommand').val();

		console.log('runCommandVal: ' + runCommandVal);

		Util.tryCatchContinue(function () {

			var valueResult = eval(runCommandVal);
			console.log(valueResult);

			ConsoleCustomLog.setMainContent(divMainContentTag, ConsoleCustomLog.customLogData);

		}, "LogRunCommand Execute");

	});
};


ConsoleCustomLog.setMainContent = function (divMainContentTag, customLogData) {

	//divMainContent.empty();
	//var contentHtml = ConsoleCustomLog.generateContentHtml( ConsoleCustomLog.customLogData );        
	divMainContentTag.html(ConsoleCustomLog.generateContentHtml(customLogData));

};

ConsoleCustomLog.hideDialog = function () {
	$('.scrim').hide();
	$(ConsoleCustomLog.divDialogTagId).hide();
};

// ---------------------------------------------------

ConsoleCustomLog.generateContentHtml = function (customLogData) {
	var contentHtml = "";

	for (var i = 0; i < customLogData.length; i++) {
		var logDataJson = customLogData[i];

		if (logDataJson && logDataJson.msg) {
			contentHtml += '<div class="logText">' + logDataJson.msg + '</div>'
		}
	}

	return contentHtml;
};

// ----------------------------------
// -- MOSTLY FOR Displaying the error message on mobile device - on start & during use.

ConsoleCustomLog.debugConsoleStart = function () {
	var consoleLogTag = $('#console').show();
	ConsoleCustomLog.debugConsoleEvents(consoleLogTag);

	// For previous msg, show..
	var lastDevLogs = AppInfoLSManager.getDevDebugLogHistory();

	if (Util.isTypeArray(lastDevLogs) && lastDevLogs.length > 0) {
		for (var i = lastDevLogs.length - 1; i >= 0; i--) { ConsoleCustomLog.log_NoRec(lastDevLogs[i]); }
		ConsoleCustomLog.log_NoRec(ConsoleCustomLog.addTimeStr('---------- NEW START -------------'));
	}

	// Clear the history after displaying..
	AppInfoLSManager.clearDevDebugLogHistory();
};

ConsoleCustomLog.debugConsoleEvents = function (consoleLogTag) {
	var consoleMainContentTag = $('#consoleMainContent');
	var consoleClearBtnTag = $('#consoleClearBtn');
	var consoleMinimizeBtnTag = $('#consoleMinimizeBtn');
	var consoleRestoreBtnTag = $('#consoleRestoreBtn');
	var consoleExitBtnTag = $('#consoleExitBtn');
	var consoleOutputTag = $('#consoleOutput');
	var consoleInputTag = $('#consoleInput');
	var consoleClearBtnTag = $('#consoleClearBtn');

	consoleClearBtnTag.click(e => consoleOutputTag.html(''));
	consoleExitBtnTag.click(e => { if (confirm('Confirm Exit?')) consoleLogTag.hide(); });
	consoleMinimizeBtnTag.click(e => { consoleLogTag.css('height', '12px'); consoleMainContentTag.hide(); });
	consoleRestoreBtnTag.click(e => { consoleLogTag.css('height', '20%'); consoleMainContentTag.show(); });
	// NOTE: Could further improve by adding & removing min-height on 'min'/'restore - or do by class add/remove.


	console.log = (text) => {
		text = ConsoleCustomLog.addTimeStr(text);
		consoleOutputTag.append($('<p class="console-line"></p>').html("> " + text));
		consoleMainContentTag.scrollTop(10000);
		AppInfoLSManager.addToDevDebugLogHistory(text);
	};

	console.error = (text) => {
		text = ConsoleCustomLog.addTimeStr(text);
		consoleOutputTag.append($('<p class="console-line-error"></p>').html("> " + text));
		consoleMainContentTag.scrollTop(10000);
		AppInfoLSManager.addToDevDebugLogHistory(text);
	};

	console.debug = console.info = console.log;

	consoleInputTag.change(function () {
		var value = consoleInputTag.val();
		consoleInputTag.val('');
		console.log(eval(value));
	});
};

ConsoleCustomLog.log_NoRec = function (text) {
	var consoleMainContentTag = $('#consoleMainContent');
	var consoleOutputTag = $('#consoleOutput');

	consoleOutputTag.append($('<p class="console-line"></p>').html("> " + text));
	consoleMainContentTag.scrollTop(10000);
};

ConsoleCustomLog.addTimeStr = function (msg) {
	var timeMin = UtilDate.formatDate(new Date(), "mm:ss.SSS");
	return '[' + timeMin + '] ' + msg;
};

ConsoleCustomLog.contentHtml = `
<div class="divMainLayout popupAreaCss">
	<div style="margin-bottom: 5px;">Logs:</div>
	<div class="divMainContent" style="overflow: scroll;height: 70%;background-color: #eee;padding: 7px;"></div>
	<div class="divRunCommand" style="width: 100%; margin-top: 3px;">
		<select class="selLogRunCommandCase"
			style="display: unset; width: unset; border: solid 1px #ccc; font-size: 0.75rem;">
			<option value="custom">Custom</option>
			<option value="loadSampleData">Load SampData</option>
			<option value="removeSampleData">Remove SampData</option>
			<option value="listClientData">List ClientData</option>
			<option value="overrideSyncLastDwDate">Override syncLastDwDate</option>
			<option value="showOtherUsefulCommands">Show Other Commands</option>
			<option value="devMode">devMode</option>
			<option value="serverLinkOff">Set ServerLink Off</option>
			<option value="serverLinkOn">Set ServerLink On</option>
			<option value="serverAvailableCheck">Server AvailCheck</option>
			<option value="disableConnCheck">Disable ConnCheck</option>
			<option value="reEnableConnCheck">ReEnable ConnCheck</option>
			<option value="clearLogs">Clear Logs</option>
		</select>
		<input class="inputLogRunCommand" style="width: 50%; border: solid 1px #ccc; font-size: 0.75rem;" />
		<button class="btnLogRunCommand">Run</button>
	</div>

	<div class="button-text warning" style="width: 100%;margin: 10px 0px 0px 0px;height: 25px;cursor: unset;">
		<div class="button__container" style="float:right;">
			<div class="close button-label" style="line-height: unset;cursor: pointer;">CLOSE</div>
		</div>
	</div>
</div>
`;
