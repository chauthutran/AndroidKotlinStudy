// =========================================
//     JobAidHelper
//          - Methods to help 
// =========================================

function JobAidHelper() { };

JobAidHelper.jobAid_startPage = 'index1.html';

JobAidHelper.jobAid_startPagePath = 'jobs/' + JobAidHelper.jobAid_startPage;

JobAidHelper.jobAid_CACHE_URLS2 = 'CACHE_URLS2';
JobAidHelper.jobAid_jobTest2 = 'jobTest2';

// =========================

JobAidHelper.runTimeCache_JobAid = function (btnParentTag) // returnFunc )
{
	if (ConnManagerNew.isAppMode_Online()) {
		var localCase = WsCallManager.checkLocalDevCase(window.location.origin);

		var requestUrl = (localCase) ? 'http://localhost:8383/list' : WsCallManager.composeDwsWsFullUrl('/TTS.jobsFiling');

		$('.divJobFileLoading').remove();

		$.ajax({
			type: "GET",
			dataType: "json",
			url: requestUrl,
			success: function (response) {
				if (btnParentTag) btnParentTag.append('<div class="divJobFileLoading" style="display: contents;"><img src="images/loading_big_blue.gif" style="height: 17px;">'
					+ '<span class="spanJobFilingMsg" style="color: gray; font-size: 14px;">Retrieving Files...</span>'
					+ '</div>');

				SwManager.swRegObj.active.postMessage({
					'type': JobAidHelper.jobAid_CACHE_URLS2
					, 'cacheName': JobAidHelper.jobAid_jobTest2
					, 'payload': response.list
				});
			},
			error: function (error) {
				MsgManager.msgAreaShowErr('Failed to perform the jobFiling..');
			}
		});
	}
	else {
		MsgManager.msgAreaShowErr('JobAid Filing is only available in online mode');
	}
};

JobAidHelper.JobFilingProgress = function (msgData) {
	// var returnMsgStr = JSON.stringify( { type: 'jobFiling', process: { total: totalCount, curr: currCount } } );
	if (msgData && msgData.process) {
		var total = msgData.process.total;
		var curr = msgData.process.curr;

		var divJobFileLoadingTag = $('.divJobFileLoading');
		var spanJobFilingMsgTag = $('.spanJobFilingMsg');

		if (total && total > 0 && curr && curr < total) {
			// update the processing msg..
			var prgMsg = 'Processing ' + curr + ' of ' + total;
			spanJobFilingMsgTag.text(prgMsg);
		}
		else {
			divJobFileLoadingTag.find('img').remove();
			spanJobFilingMsgTag.text('Processing all done.');

			MsgManager.msgAreaShow('Job Aid Filing Finished.');
		}
	}
};

// =========================

JobAidHelper.msgHandle = function (data) 
{
	// window.parent.postMessage( { 'from': 'jobAidIFrame', 'actions': [ 
	//	 { name: 'getJobFolderNames', callBackEval: ' mainData.folderData = action.data; alert( mainData ); ' }, 
	//	 { name: 'getCountryCode', callBackEval: ' mainData.countryCode = action.data; alert( mainData ); ' } 
	//  ] }, '*');

	if ( data )
	{
		var returnActions = [];

		if ( data.actions ) 
		{
			data.actions.forEach( act => returnActions.push( JobAidHelper.handleMsgAction( act ) ) );			
		}

		if ( data.action ) 
		{
			if ( Util.isTypeObject( data.action ) ) returnActions.push( JobAidHelper.handleMsgAction( data.action ) );
			else if ( Util.isTypeString( action ) ) JobAidHelper.handleMsgActionOld( data );
		}

		// If there is any action result to return, send as msg to jobAid iFrame
		if ( returnActions.length > 0 )
		{
			$('iframe.jobAidIFrame')[0].contentWindow.postMessage( { actions: returnActions }, '*');
		}
	}
};

JobAidHelper.handleMsgAction = function( action )
{
	var actionJson;

	if ( action.name === 'getJobFolderNames' )
	{
		try {	
			// should set some 'action' as well as data..
			actionJson = { callBackEval: action.callBackEval, data: JSON.parse( AppInfoLSManager.getJobAidFolderNames() ) };

			// initiate the msg to jobAid.. iframe..
			// $('iframe.jobAidIFrame')[0].contentWindow.postMessage( msgData, '*');
		}
		catch (errMsg) {
			console.log('ERROR in JobAidHelper.msgHandle object action, ' + errMsg);
		}
	}
	else if ( action.name === 'getCountryCode_NoT' ) 
	{
		actionJson = { callBackEval: action.callBackEval, data: SessionManager.getLoginCountryOuCode_NoT() };
	}
	else if ( action.name === 'clientSearch' ) 
	{
		// { name: 'clientSearch', searchType: 'offline', callBackEval: 'clientsFound( action.data );', 
		//  data: { firstName: 'james', lastName: 'chang' } } 

		var clientList = ClientDataManager.getClientListByFields( action.data );
		actionJson = { callBackEval: action.callBackEval, data: clientList };
	}

	return actionJson;
};

// -------------------------------------
// -- Old msg action structure support

JobAidHelper.handleMsgActionOld = function( data )
{
	// Old 'action' string type version support
	if ( data.action === 'hideIFrame' ) $('#divJobAid').hide();
	else if ( data.action === 'sendMsg' ) MsgManager.msgAreaShow( data.msg );

	// form field data populate & open the block form
	if ( data.formFieldData ) data.dataJson = formFieldData;
	JobAidHelper.formFieldDataHandle( data.dataJson );
};

JobAidHelper.formFieldDataHandle = function( data )
{
	if ( data ) 
	{
		// open area & block with data populate..
		SessionManager.cwsRenderObj.renderFavItemBlock( Constants.jobAides_AreaBlockId );

		// Click on 1st/Last-Recorded tab.
		setTimeout( function () 
		{
			$('div.mainTab').find('li[rel="' + Constants.jobAides_tabTargetBlockId + '"]').click();

			setTimeout( function () 
			{
				$('input[name="firstName"]').val( data.reg_firstName );
				$('input[name="lastName"]').val( data.reg_lastName );
				$('input[name="house"]').val( data.house );
				$('input[name="animals"]').val( data.animals );
			}, 100);

		}, 200);
	}
};