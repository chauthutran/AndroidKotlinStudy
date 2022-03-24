// =========================================
//     JobAidHelper
//          - Methods to help 
// =========================================

function JobAidHelper() { };

JobAidHelper.jobAid_startPage = 'index1.html';

JobAidHelper.jobAid_startPagePath = 'jobs/' + JobAidHelper.jobAid_startPage;

JobAidHelper.jobAid_CACHE_URLS2 = 'CACHE_URLS2';
JobAidHelper.jobAid_CACHE_DELETE = 'CACHE_DELETE';
JobAidHelper.jobAid_jobTest2 = 'jobTest2';

// =========================

JobAidHelper.getCacheKeys = function( callBack )
{
	caches.open( JobAidHelper.jobAid_jobTest2 ).then( cache => 
	{ 
		cache.keys().then( keys => 
		{ 
			callBack( keys );				
		}); 
	});   
};


JobAidHelper.deleteCacheStorage = async function()
{
	return caches.delete( JobAidHelper.jobAid_jobTest2 );
};


JobAidHelper.runTimeCache_JobAid = function( options, jobAidBtnParentTag ) // returnFunc )
{
	if ( ConnManagerNew.isAppMode_Online() ) 
	{
		if ( !options ) options = {};
		$('.divJobFileLoading').remove();

		var requestUrl;

		options.isLocal = WsCallManager.checkLocalDevCase(window.location.origin);
		options.appName = 'pwa-dev';
	
		if ( WsCallManager.stageName === 'test' ) options.appName = 'pwa-test';
		else if ( WsCallManager.stageName === 'stage' ) options.appName = 'pwa-stage';
		

		//var payload = { 'isLocal': localCase, 'appName': appName, 'isListingApp': options.isListingApp, 'btnParentTag': btnParentTag, 'projDir': options.projDir };
		var optionsStr = JSON.stringify( options );

		//if ( WsCallManager.stageName === 'test' ) requestUrl = (localCase) ? 'http://localhost:8384/list' : WsCallManager.composeDwsWsFullUrl('/TTS.jobsFilingTest');
		requestUrl = (options.isLocal) ? 'http://localhost:8383/list' : WsCallManager.composeDwsWsFullUrl('/TTS.jobsFiling');

		requestUrl = WsCallManager.localhostProxyCaseHandle( requestUrl ); // Add Cors sending


		$.ajax({
			url: requestUrl + '?optionsStr=' + encodeURIComponent( optionsStr ),
			type: "GET",
			dataType: "json",
			success: function (response) 
			{
				if ( jobAidBtnParentTag ) jobAidBtnParentTag.append('<div class="divJobFileLoading" style="display: contents;"><img src="images/loading_big_blue.gif" style="height: 17px;">'
				+ '<span class="spanJobFilingMsg" style="color: gray; font-size: 14px;">Retrieving Files...</span>'
				+ '</div>');

				// NOTE: We can do 'caches.open' & read data directly rather than do 'postMessage' to service worker.
				//    However, since we do not want anyone to access jobs folder directly, but only through cache
				//		We need to have service worker Read & Cache it.
				//		And once it is on cache (only allowed ones), we can read however we want afterwards (without going through service worker)
				SwManager.swRegObj.active.postMessage({
					'type': JobAidHelper.jobAid_CACHE_URLS2
					, 'cacheName': JobAidHelper.jobAid_jobTest2
					, 'options': options
					, 'payload': JobAidHelper.sortVideoAtTheEnd( response.list )
				});				
				// caches.open( JobAidHelper.jobAid_jobTest2 ).then( cache => { cache.add( reqUrl ).then(
				
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


JobAidHelper.sortVideoAtTheEnd = function( list ) 
{
	var newList = [];
	
	try
	{
		var videoList = list.filter( item => item.endsWith( '.mp4' ) );
		var audioList = list.filter( item => item.endsWith( '.mp3' ) );
		var newList = Util.cloneJson( list.filter( item => ( !item.endsWith( '.mp4' ) && !item.endsWith( '.mp3' ) )  ) );
		Util.mergeArrays( newList, audioList );
		Util.mergeArrays( newList, videoList );
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in JobAidHelper.sortVideoAtTheEnd, ' + errMsg );
		newList = list;
	}

	return newList;
};


JobAidHelper.JobFilingProgress = function( msgData ) 
{
	if ( msgData && msgData.process ) 
	{
		if ( msgData.options && msgData.options.target === 'jobAidIFrame' )
		{
			var data = { action: { name: 'simpleMsg', msgData: msgData } };
			// var returnMsgStr = JSON.stringify( { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options } );

			JobAidHelper.msgHandle( data );

			// Create delayed action (for 1 sec overwrite)
			Util.setDelays_timeout( 'jobFiling', 1, function() {
				JobAidHelper.storeFilingStatus( msgData.options.projDir, msgData.process ); 
			});
			
		}
		else
		{
			var total = msgData.process.total;
			var curr = msgData.process.curr;
			var name = msgData.process.name;
		
			if ( name && name.length > 10 ) name = '--' + name.substr( name.length - 10 );  // Get only last 10 char..
		
	
			var divJobFileLoadingTag = $('.divJobFileLoading');
			var spanJobFilingMsgTag = $('.spanJobFilingMsg');
	

			if ( total && total > 0 && curr )
			{
			  	if ( curr < total ) 
				{
					// update the processing msg..
					var prgMsg = 'Processing ' + curr + ' of ' + total + ' [' + name + ']';
					spanJobFilingMsgTag.text(prgMsg);
				}
				else 
				{
					divJobFileLoadingTag.find('img').remove();
					spanJobFilingMsgTag.text('Processing all done.');
		
					MsgManager.msgAreaShow('Job Aid Filing Finished.');	

					// If option has 'runEval_AfterFinish' prop, execute it here.            
					settingsApp.jobAidFilesPopulate( $( '.divMainContent' ) );
				}

				
				// Save Status on WFA LocalStorage, but do it with delayed action (for 1 sec overwrite) - so fast calls do not perform store, but slow or last one does.
				Util.setDelays_timeout( 'jobFiling', 1, function() {
					JobAidHelper.storeFilingStatus( 'jobListingApp', msgData.process );
				});
			}
		}
	}
};

JobAidHelper.storeFilingStatus = function ( projDir, process ) 
{
	// Structure: { projDir: { -- process -- } }
	//   			{ listingApp: { -- process -- } } // listingApp case..
	// 			process: { total: totalCount, curr: doneCount, name: reqUrl }

	var process = { total: process.total, curr: process.curr };

	PersisDataLSManager.updateJobFilingProjDirStatus( projDir, process );
}

// =========================

JobAidHelper.msgHandle = function ( data ) 
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
			else if ( Util.isTypeString( data.action ) ) JobAidHelper.handleMsgActionOld( data );
		}

		returnActions = returnActions.filter(action => action);

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
	else if ( action.name === 'clientSearchCUIC' ) 
	{
		// { name: 'clientSearchCUIC', searchType: 'offline', CUIC:'XX' } 
		var clientList = ClientDataManager.getClientLikeCUIC( action.CUIC );
		$('iframe.jobAidIFrame')[0].contentWindow.postMessage( { clientList }, '*');
	}
	else if ( action.name === 'WFARunEval' )
	{
		// { name: 'WFARunEval', WFARunEval: [ 
		//		' var clientList = ClientDataManager.getClientListByFields( action.data ); ', 
		//		' { callBackEval: action.callBackEval, data: clientList }; ' 
		//	 ], callBackEval: 'clientsFound( action.data );', 
		//  data: { firstName: 'james', lastName: 'chang' } } 
		try {
			if ( action.WFARunEval ) 
			{
				actionJson = eval( Util.getEvalStr( action.WFARunEval ) );
			}
		}
		catch ( errMsg ) { console.log( 'ERROR in JobAidHelper.handleMsgAction WFARunEval action, ' + errMsg ); }
	}
	else if ( action.name === 'simpleMsg' ) actionJson = action;


	return actionJson;
};


JobAidHelper.clearFiles = function( runAfterEval )
{
	SwManager.swRegObj.active.postMessage({
		'type': JobAidHelper.jobAid_CACHE_DELETE
		, 'cacheName': JobAidHelper.jobAid_jobTest2
		, 'options': { runAfterEval: runAfterEval }
	});		
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
