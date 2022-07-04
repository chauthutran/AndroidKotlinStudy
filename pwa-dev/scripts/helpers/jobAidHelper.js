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

JobAidHelper.EXTS_VIDEO = [ '.webm', '.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', '.ogg', '.mp4', '.m4p', '.m4v', '.avi', '.wmv', '.mov', '.qt', '.flv', '.swf', '.avchd'  ];  // upper case when comparing
JobAidHelper.EXTS_AUDIO = [ '.abc', '.flp', '.ec3', '.mp3', '.flac' ];  // upper case when comparing

JobAidHelper.cacheRequestList = [];
JobAidHelper.cacheSuccessList = [];

// =========================

JobAidHelper.getCacheKeys = function( callBack )
{
	caches.open( JobAidHelper.jobAid_jobTest2 ).then( cache => 
	{ 
		cache.keys().then( keys => 
		{
			callBack( keys, cache );
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
		else if ( WsCallManager.stageName === 'prod' ) {
			// if ( WsCallManager.urlStartWith === 'wfa' ) ... else if ( WsCallManager.urlStartWith === 'wfa-lac' )  // Users can not interchange 'wfa' url..			
			//options.appName = 'wfa'; // only 'wfa' should hold jobAid file.  Not all 'wfa-lac', etc..
			//		However, that would not work either <-- since the apps needs to access jobAid files.. //		<-- but each diff country has diff job files, so we should handle for all cases?	
		} 

		// TODO: FOR NOW, LET 'test' have old JobAid download all at once version..
		//if ( WsCallManager.stageName === 'test' ) requestUrl = (options.isLocal) ? 'http://localhost:8384/list' : WsCallManager.composeDwsWsFullUrl('/TTS.jobsFilingTest');
		requestUrl = (options.isLocal) ? 'http://localhost:8383/list' : WsCallManager.composeDwsWsFullUrl('/TTS.jobsFiling');
		requestUrl = WsCallManager.localhostProxyCaseHandle( requestUrl ); // Add Cors sending IF LOCAL


		// NOTE: For filtering video/audio or audio/video only files, we could do on below nodeJS, but for now, simply filter it with method.
		// var payload = { 'isLocal': localCase, 'appName': appName, 'isListingApp': options.isListingApp, 'btnParentTag': btnParentTag, 'projDir': options.projDir };
		var optionsStr = JSON.stringify( options );

		$.ajax({
			url: requestUrl + '?optionsStr=' + encodeURIComponent( optionsStr ),
			type: "GET",
			dataType: "json",
			success: function (response) 
			{
				if ( jobAidBtnParentTag ) jobAidBtnParentTag.append('<div class="divJobFileLoading" style="display: contents;"><img src="images/loading_big_blue.gif" style="height: 17px;">'
				+ '<span class="spanJobFilingMsg" style="color: gray; font-size: 14px;">Retrieving Files...</span>'
				+ '</div>');

				var newFileList = JobAidHelper.sort_filter_files( response.list, options );

				// ==> Add this list to local storage?  with NA as content?  and not yet downloaded?
				// ==> But this is only update if existing one exists?

				// JOB AID 'CONTENT' #1 - SET UP/START LIST
				JobAidHelper.filingContent_setUp( newFileList, options.projDir );


				// NOTE: We can do 'caches.open' & read data directly rather than do 'postMessage' to service worker.
				//    However, since we do not want anyone to access jobs folder directly, but only through cache
				//		We need to have service worker Read & Cache it.
				//		And once it is on cache (only allowed ones), we can read however we want afterwards (without going through service worker)
				SwManager.swRegObj.active.postMessage({
					'type': JobAidHelper.jobAid_CACHE_URLS2
					, 'cacheName': JobAidHelper.jobAid_jobTest2
					, 'options': options
					, 'payload': newFileList
				});
			},
			error: function (error) {
				MsgManager.msgAreaShowErr('Failed to perform the jobFiling..');
			}
		});
	}
	else MsgManager.msgAreaShowErr('JobAid Filing is only available in online mode');
};


JobAidHelper.sort_filter_files = function( list, options ) 
{
	var newList = [];
	
	try
	{
		// autio: true/false, video: true/false, 
		if ( options.audioOnly ) newList = list.filter( item => Util.endsWith_Arr( item, JobAidHelper.EXTS_AUDIO, { upper: true } ) );
		else if ( options.videoOnly ) newList = list.filter( item => Util.endsWith_Arr( item, JobAidHelper.EXTS_VIDEO, { upper: true } ) );
		else if ( options.audio_videoOnly ) newList = list.filter( item => Util.endsWith_Arr( item, JobAidHelper.EXTS_AUDIO.concat( JobAidHelper.EXTS_VIDEO ), { upper: true } ) );
		else if ( options.withoutAudioVideo ) newList = Util.cloneJson( list.filter( item => !Util.endsWith_Arr( item, JobAidHelper.EXTS_AUDIO.concat( JobAidHelper.EXTS_VIDEO ), { upper: true } ) ) );
		else // options.all
		{
			// Remove audio/video type file names
			newList = Util.cloneJson( list.filter( item => 
				( !Util.endsWith_Arr( item, JobAidHelper.EXTS_VIDEO, { upper: true } ) 
				&& !Util.endsWith_Arr( item, JobAidHelper.EXTS_AUDIO, { upper: true } ) ) 
				) );
	
			// Add audio/video type file names at the end, audio 1st.
			var audioList = list.filter( item => Util.endsWith_Arr( item, JobAidHelper.EXTS_AUDIO, { upper: true } ) );
			var videoList = list.filter( item => Util.endsWith_Arr( item, JobAidHelper.EXTS_VIDEO, { upper: true } ) );
	
			Util.mergeArrays( newList, audioList );
			Util.mergeArrays( newList, videoList );	
		}
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in JobAidHelper.sortVideoAtTheEnd, ' + errMsg );
		newList = list;
	}

	return newList;
};


JobAidHelper.filingContent_setUp = function( newFileList, projDir )
{
	try
	{
		// Setup the 'localStorage' with 'ProjDir' <-- setup with empty content list.
		//		- However, if already existing ones are there, we should not empty it out..
		if ( projDir !== undefined )
		{
			var projStatus = PersisDataLSManager.getJobFilingProjDirStatus( projDir );
			
			if ( !projStatus.content ) projStatus.content = {};

			newFileList.forEach( fileName => {			
				if ( !projStatus.content[ fileName ] ) projStatus.content[ fileName ] = { size: '', date: '', status: 'Not Downloaded' };
			});

			// if 'delete' happens, we need to remove this..
			
			PersisDataLSManager.updateJobFilingProjDirStatus( projDir, projStatus );


			// Set the list.
			JobAidHelper.cacheRequestList = newFileList;
			JobAidHelper.cacheSuccessList = [];
		}
	}
	catch( errMsg )
	{
		console.log( 'ERROR in JobAidHelper.filingContent_setUp, ' + errMsg );
	}
};

JobAidHelper.filingContent_calcData = function( cacheSuccessList, projDir )
{
	/*
	// projDir
	caches.open( JobAidHelper.jobAid_jobTest2 ).then( jaCache => 
	{ 
		jaCache.keys().then( keys => 
		{ 
			keys.forEach( kReq => 
			{
				if ( cacheSuccessList.indexOf( kReq.url ) >= 0 )
				{
					jaCache.match( kReq ).then( resp => 
					{	
						resp.clone().blob().then( b => 
						{
							var info = { url: kReq.url, size: b.size, date: new Date().toISOString() };

							console.log( info );
						});
					});		
				}
			});				
		}); 
	});  
	*/
};


JobAidHelper.JobFilingProgress = function( msgData ) 
{
	//res.clone().blob().then( b => { 

	if ( msgData ) 
	{
		if ( msgData.options && msgData.options.target === 'jobAidIFrame' )
		{
			var data = { action: { name: 'simpleMsg', msgData: msgData } };
			// var returnMsgStr = JSON.stringify( { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options } );

			JobAidHelper.msgHandle( data );

			// Create delayed action (for 1 sec overwrite)
			Util.setDelays_timeout( 'jobFiling', 1, function() {
				JobAidHelper.storeFilingStatus( msgData.options.projDir, msgData ); //msgData.process ); 
			});
			
		}
		else if ( msgData.process )
		{
			// NOTE: We also like to store 'content' - file size (EST) + date..

			var total = msgData.process.total;
			var curr = msgData.process.curr;
			var name = msgData.process.name;
		
			if ( name && name.length > 10 ) name = '--' + name.substr( name.length - 10 );  // Get only last 10 char..
		
			var divJobFileLoadingTag = $('.divJobFileLoading');
			var spanJobFilingMsgTag = $('.spanJobFilingMsg');

			if ( !total ) 
			{
				divJobFileLoadingTag.find('img').remove();
				spanJobFilingMsgTag.text('No files to Process.');
			}
			else if ( total && total > 0 && curr )
			{

				// JOB AID 'CONTENT' #2 - SET UP/START LIST
				JobAidHelper.cacheSuccessList.push( name );


			  	if ( curr < total ) 
				{
					// update the processing msg..
					var prgMsg = 'Processing ' + curr + ' of ' + total + ' [' + name + ']';
					spanJobFilingMsgTag.text(prgMsg);
				}
				else 
				{
					divJobFileLoadingTag.find('img').remove();
					spanJobFilingMsgTag.text( 'Processing all done.' );
		
					MsgManager.msgAreaShow( 'Job Aid Filing Finished.' );	

					// If option has 'runEval_AfterFinish' prop, execute it here.            
					settingsApp.jobAidFilesPopulate( $( '.divMainContent' ) );


					// TODO: Create 'Util.timeMeasure()' <-- Start / End / Reset / GetResult

					// JOB AID 'CONTENT' #3 - GetContents of cached files.
					JobAidHelper.filingContent_calcData( JobAidHelper.cacheSuccessList, msgData.options.projDir );
				}
				
				// Save Status on WFA LocalStorage, but do it with delayed action (for 1 sec overwrite) - so fast calls do not perform store, but slow or last one does.
				Util.setDelays_timeout( 'jobFiling', 1, function() {
					JobAidHelper.storeFilingStatus( 'jobListingApp', msgData ); //msgData.process );
				});
			}
		}
	}
};

JobAidHelper.storeFilingStatus = function ( projDir, msgData ) 
{
	// Structure: { projDir: { -- process -- } }
	//   			{ listingApp: { -- process -- } } // listingApp case..
	// 			process: { total: totalCount, curr: doneCount, name: reqUrl }

	var process = msgData.process;  // could be empty..
	var content = msgData.content;

	var projStatus = PersisDataLSManager.getJobFilingProjDirStatus( projDir );

	if ( process ) {
		projStatus.total = process.total;
		projStatus.curr = process.curr;
	}

	if ( content ) {
		if ( !projStatus.content ) projStatus.content = {};

		// Update the content status..
	}

	PersisDataLSManager.updateJobFilingProjDirStatus( projDir, projStatus );
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
	else if ( action.name === 'getInitialParams' )
	{
		actionJson = { 
			callBackEval: action.callBackEval, 
			data: {
				countryCodeNoT:SessionManager.getLoginCountryOuCode_NoT(),
				countryCode:SessionManager.getLoginCountryOuCode(),
				loggedUser:SessionManager.sessionData.login_UserName,
				groupUser: ClientDataManager.getClientLikeCUIC( "SS_"+SessionManager.sessionData.login_UserName ).at(0)?._id
			}
		};
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
	else if ( action.name === 'submitActivity' ) 
	{
		// { name: 'submitActivity', data: { } } 
		// Due to callBack, call iframe directly..
		JobAidHelper.submitActivity( action.data, function( client, activity ) {
			$( 'div.clientListRerender' ).click(); // refresh the clientList..
			var thisAction = { callBackEval: action.callBackEval, data: { client: client, activity: activity } };
			$('iframe.jobAidIFrame')[0].contentWindow.postMessage( { action: thisAction }, '*');  // pass single action rather than 'actions'
		});
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

// -------------------------------------
// -- Client/Activity Create payload

JobAidHelper.submitActivity = function( data, callBack )
{
	// NOTE: If 'clientId' is provided, it is existing client case.  If not, new client case.
	var actionUrl = '/PWA.mongo_capture';
	var blockId = undefined;
	var activityPayload = undefined;
	var actionJson = ( data.clientId ) ? { underClient: true, clientId: data.clientId } : {};  // Existing vs New Client
	var blockPassingData = undefined;


	// Custom Existing Activity Edit case from 'confirmClient' related.
	if ( data.editActivityId ) actionJson.editActivityId = data.editActivityId;
	if ( data.currTempClientId ) actionJson.currTempClientId = data.currTempClientId;


	if ( data.activityPayload )
	{
		activityPayload = { payload: data.activityPayload };
		console.log( 'JobAidHelper.submitActivity, activityPayload: ' );
	}
	else if ( data.activityJson )
	{
		// NEW: override of already set activityJson - This does not go through 'generateActivityPayloadJson', but simply use 'activityJson'.
		actionJson.activityJson = data.activityJson;
		console.log( 'JobAidHelper.submitActivity, activityJson: ' );
	}

	
	ActivityDataManager.createNewPayloadActivity( actionUrl, blockId, activityPayload, actionJson, blockPassingData, function( activity, client ) {
		console.log( activity );
		if ( callBack ) callBack( client, activity );
	});	
};


/*
JobAidHelper.submitActivityTest_New = function()
{
	var payload = {
		searchValues: {
			newClientCase: true
		},
		captureValues: {
			date: { capturedLoc: "2022-04-06T23:01:45.832" },
			type: "JobAidActType",
			activeUser: "GT2_TEST_IPC",
			creditedUsers: [ "GT2_TEST_IPC" ],
			location: {},
			dc: { app: "WF-App", "network": "Online", "control": "wfa v~1.3.0, c:Online" },
			transactions: [
				{ 
				type: "c_reg", 
				clientDetails: {
					firstName: "Mark1a",
					lastName: "Tester1",
					age: "21"
				}
				},
				{
					type: "s_info",
					dataValues: {
						info1: 'test1'
					}
				}
			]
		}
	};

	JobAidHelper.submitActivity( { activityPayload: payload }, function( client, activity ) {
		console.log( client );
		console.log( activity );
	});
};

JobAidHelper.submitActivityTest_Exist = function()
{
	var payload = {
		searchValues: {
			_id: "624ee3bd997e596bde59e1dd"
		},
		captureValues: {
			date: { capturedLoc: "2022-04-07T23:01:45.832" },
			type: "JobAidActType",
			activeUser: "GT2_TEST_IPC",
			creditedUsers: [ "GT2_TEST_IPC" ],
			location: {},
			dc: { app: "WF-App", "network": "Online", "control": "wfa v~1.3.0, c:Online" },
			transactions: [
				{
					type: "s_info",
					dataValues: {
						info1: 'test2'
					}
				}
			]
		}
	};


	JobAidHelper.submitActivity( { clientId: '624ee3bd997e596bde59e1dd', activityPayload: payload }, function( client, activity ) {
		console.log( client );
		console.log( activity );
	});
};
*/
