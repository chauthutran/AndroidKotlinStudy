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

JobAidHelper.NAME_jobListingApp = 'jobListingApp';

JobAidHelper.EXTS_VIDEO = [ '.webm', '.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', '.ogg', '.mp4', '.m4p', '.m4v', '.avi', '.wmv', '.mov', '.qt', '.flv', '.swf', '.avchd'  ];  // upper case when comparing
JobAidHelper.EXTS_AUDIO = [ '.abc', '.flp', '.ec3', '.mp3', '.flac' ];  // upper case when comparing
JobAidHelper.EXTS_IMAGE = [ '.tif', '.tiff', '.bmp', '.jpg', '.jpeg', '.gif', '.ico', '.png', '.eps', '.svg' ];
JobAidHelper.EXTS_TEXT = [ '.txt', '.css', '.scss', '.md', '.pdf' ];
JobAidHelper.EXTS_APPLICATION = [ '.js', '.html', '.htm', '.json', '.xml', '.bat', '.map' ];

//JobAidHelper.MANIFEST_FILES = [ ];

JobAidHelper.cacheRequestList = [];
JobAidHelper.cacheProcessedData = {};

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

JobAidHelper.getCacheKeys_async = async function()
{
	var cache = await caches.open( JobAidHelper.jobAid_jobTest2 );

	var keys = await cache.keys();

	return { cache: cache, keys: keys };
};


JobAidHelper.deleteCacheKeys = async function( partialPath )
{
	var deletedArr = [];
	
	if ( Util.isTypeString( partialPath ) && partialPath.length >= 3 )
	{
		var cache = await caches.open( JobAidHelper.jobAid_jobTest2 );
		var keysReq = await cache.keys();

		for ( var i = 0; i < keysReq.length; i++ )
		{
			var req = keysReq[i];

			var reqUrl = req.url;
			if ( reqUrl.indexOf( partialPath ) >= 0 )
			{
				var success = await cache.delete( reqUrl );	
				if ( success ) deletedArr.push( reqUrl );				
			}
		}
	}
	else {
		console.log( 'partialPath param is not string or length not 3 or longer.' );
	}

	return deletedArr;
};


// JobAidHelper.deleteCacheKeys( '/jobs/jobAid/OM_LOW/' ).then( function( deletedArr ) {  console.log( deletedArr );  });


// ---------------------------------------------------
// ---- New Pending Implementations -----

JobAidHelper.renderEachData = function( callBack )
{
	JobAidHelper.getCacheKeys( function( keys, cache )
	{
		var statusFullJson = JobAidHelper.getJobFilingStatusIndexed();

		if ( keys && keys.length > 0 )
		{
			keys.forEach( request => 
			{ 
				var url = JobAidHelper.modifyUrlFunc( request.url );

				var itemJson = { url: url };
				// Check the storage and add additional info
				JobAidHelper.setExtraStatusInfo( itemJson, statusFullJson );

				callBack( itemJson );
				// divTag.append( '<div class="infoLine">' + Util.getUrlLastName( request.url ) + '</div>' );
			});                
		}
	});
};


JobAidHelper.getCachedDataInfo = function( projDir, callBack )
{
	JobAidHelper.getCacheKeys( function( keys )
	{
		var statusFullJson = JobAidHelper.getJobFilingStatusIndexed();

		var projKeyJson = {};

		if ( keys && keys.length > 0 )
		{
			keys.forEach( request => 
			{ 
				var url = JobAidHelper.modifyUrlFunc( request.url );

				if ( url.indexOf( '/jobs/jobAid/' + projDir ) === 0 )
				{
					var itemJson = { url: url };
					// Check the storage and add additional info
					JobAidHelper.setExtraStatusInfo( itemJson, statusFullJson );			
	
					projKeyJson[url] = itemJson;
				}
			});
		}

		callBack( projKeyJson );
	});
};


JobAidHelper.modifyUrlFunc = function( url ) 
{
  if ( url ) {
	 var jobStrIdx = url.indexOf( '/jobs/' );
	 if ( jobStrIdx >= 0 ) url = url.substr( jobStrIdx );  
  }

  return url;
};

JobAidHelper.getJobFilingStatusIndexed = function()
{
	var statusFullJson = {};

	try
	{
		// Also, get the 'jobAidStatus' - go through all...
		var jobFilingStatus = PersisDataLSManager.getJobFilingStatus();

		for ( var prop in jobFilingStatus )
		{
			var proj = jobFilingStatus[ prop ];

			if ( proj && proj.process )
			{
				Object.keys( proj.process ).forEach( key => statusFullJson[ key ] = proj.process[ key ] );
			}
		}
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in JobAidHelper.getJobFilingStatusIndexed, ' + errMsg );
	}

	return statusFullJson;
};

JobAidHelper.setExtraStatusInfo = function( itemJson, statusFullJson )
{
	if ( statusFullJson && itemJson && itemJson.url )
	{
		var urlInfo = statusFullJson[ itemJson.url ];

		if ( urlInfo )
		{
			Util.mergeJson( itemJson, urlInfo );
		}
	}

	return itemJson;
};

// -------------------------------------------

// How we currently delete/clear all JobAid files
//		- We need more refined ones that deletes everything under one directory..
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
		if ( options.isListingApp ) options.projDir = JobAidHelper.NAME_jobListingApp;

		if ( WsCallManager.stageName === 'test' ) options.appName = 'pwa-test';
		else if ( WsCallManager.stageName === 'stage' ) options.appName = 'pwa-stage';
		else if ( WsCallManager.stageName === 'prod' ) options.appName = 'wfa';  // 'wfa' vs 'wfa-lac' <-- can use url determination

		requestUrl = (options.isLocal) ? 'http://localhost:8383/list' : WsCallManager.composeDwsWsFullUrl('/TTS.jobsFiling');
		requestUrl = WsCallManager.localhostProxyCaseHandle( requestUrl ); // Add Cors sending IF LOCAL
		
		// NOTE: For filtering video/audio or audio/video only files, we could do on below nodeJS, but for now, simply filter it with method.
		// var payload = { 'isLocal': localCase, 'appName': appName, 'isListingApp': options.isListingApp, 'btnParentTag': btnParentTag, 'projDir': options.projDir };
		var optionsStr = JSON.stringify( options );

		if ( jobAidBtnParentTag ) jobAidBtnParentTag.append( 
			`<div class="divJobFileLoading" style="display: contents;">
				<img src="images/loading_big_blue.gif" style="height: 17px;">
				<span class="spanJobFilingMsg" style="color: gray; font-size: 14px;">Retrieving Files...</span>
			</div>` );

		$.ajax({
			url: requestUrl + '?optionsStr=' + encodeURIComponent( optionsStr ),
			type: "GET",
			dataType: "json",
			success: function (response) 
			{
				// 1. Filter list, Sort List - New JobAid 'downloadOption' ('appOnly', 'mediaOnly')
				var newFileList = JobAidHelper.sort_filter_files( response.list, options );

				// 2. Save the list info on localStorage (PersisManager) by 'projDir' name - Does not remove existing data.
				JobAidHelper.filingContent_setUp( newFileList, options );

				if ( newFileList.length <= 0 ) $( '.spanJobFilingMsg' ).text( 'Empty process list.' );
				else
				{				
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
				}
			},
			error: function ( error ) {
				$( '.spanJobFilingMsg' ).text( 'Failed - ' + error );
				console.log( error );
				MsgManager.msgAreaShowErr('Failed to perform the jobFiling..');
			},
			complete: function () {
				$( '.divJobFileLoading' ).find( 'img' ).remove();
			}			
		});
	}
	else MsgManager.msgAreaShowErr( 'Offline - JobAid Filing is only available in online mode.' );
};


JobAidHelper.sort_filter_files = function( list, options ) 
{
	var newList = [];
	var listFiltered = list; // Start with 'list', but overwrite with filtered list.
	
	try
	{
		// 1. FILTERING
		// 1A. New JobAid Filtering with 'downloadOption' - 'appOnly', 'mediaOnly'
		if ( options.downloadOption && options.downloadOption !== 'all' && options.projDir )
		{
			// Filter with fodler name..
			var folderName = '/' + options.projDir + '/media/';

			if ( options.downloadOption === 'mediaOnly' ) listFiltered = list.filter( fileName => fileName.indexOf( folderName ) >= 0 );
			else if ( options.downloadOption === 'appOnly' ) listFiltered = list.filter( fileName => fileName.indexOf( folderName ) === -1 );
		}
		// 1B. Existing Filtering Options..
		else if ( options.audioOnly ) listFiltered = list.filter( item => Util.endsWith_Arr( item, JobAidHelper.EXTS_AUDIO, { upper: true } ) );
		else if ( options.videoOnly ) listFiltered = list.filter( item => Util.endsWith_Arr( item, JobAidHelper.EXTS_VIDEO, { upper: true } ) );
		else if ( options.audio_videoOnly ) listFiltered = list.filter( item => Util.endsWith_Arr( item, JobAidHelper.EXTS_AUDIO.concat( JobAidHelper.EXTS_VIDEO ), { upper: true } ) );
		else if ( options.withoutAudioVideo ) listFiltered = Util.cloneJson( list.filter( item => !Util.endsWith_Arr( item, JobAidHelper.EXTS_AUDIO.concat( JobAidHelper.EXTS_VIDEO ), { upper: true } ) ) );

	}
	catch ( errMsg )
	{
		console.log( 'ERROR in JobAidHelper.sort_filter_files filering, ' + errMsg );
	}


	try
	{
		// 2. SORTING -----------------

		// Sorting option - by Config?  <-- but can be overridable by options (request)
		var mediaFirst = ( ConfigManager.getJobAidSetting().downloadOrder === "mediaFirst" );

		// Remove audio/video type file names
		var noMediaList = Util.cloneJson( listFiltered.filter( item => 
			( !Util.endsWith_Arr( item, JobAidHelper.EXTS_VIDEO, { upper: true } ) 
			&& !Util.endsWith_Arr( item, JobAidHelper.EXTS_AUDIO, { upper: true } ) 
			) 
			) );

		// Add audio/video type file names at the end, audio 1st.
		var audioList = listFiltered.filter( item => Util.endsWith_Arr( item, JobAidHelper.EXTS_AUDIO, { upper: true } ) );
		var videoList = listFiltered.filter( item => Util.endsWith_Arr( item, JobAidHelper.EXTS_VIDEO, { upper: true } ) );



		if ( mediaFirst ) // large file types download 1st
		{
			Util.mergeArrays( newList, videoList );
			Util.mergeArrays( newList, audioList );
			Util.mergeArrays( newList, noMediaList );
		}
		else // Media Last
		{				
			Util.mergeArrays( newList, noMediaList );
			Util.mergeArrays( newList, audioList );
			Util.mergeArrays( newList, videoList );
		}	

	}
	catch ( errMsg )
	{
		console.log( 'ERROR in JobAidHelper.sort_filter_files sorting, ' + errMsg );
		newList = listFiltered;
	}

	return newList;
};


JobAidHelper.filingContent_setUp = function( newFileList, options )
{
	try
	{
		var projDir = options.projDir;
		// Setup the 'localStorage' with 'ProjDir' <-- setup with empty content list.
		//		- However, if already existing ones are there, we should not empty it out?..
		//		- No, we should emtpy it out since it goes through re-download?

		if ( projDir !== undefined )
		{
			var projStatus = PersisDataLSManager.getJobFilingProjDirStatus( projDir );
			
			if ( !projStatus.process ) projStatus.process = {};
			projStatus.downloadOption = options.downloadOption;


			newFileList.forEach( fileName => {			
				// if ( !projStatus.content[ fileName ] ) projStatus.content[ fileName ] = { size: '', date: '', downloaded: 'Not Downloaded' };
				projStatus.process[ fileName ] = { size: '', reqDate: new Date().toISOString(), downloaded: false };
			});

			// if 'delete' happens, we need to remove this..
			
			PersisDataLSManager.updateJobFilingProjDirStatus( projDir, projStatus );


			// Set the list.
			JobAidHelper.cacheRequestList = newFileList;
			JobAidHelper.cacheProcessedData = {};
		}
	}
	catch( errMsg )
	{
		console.log( 'ERROR in JobAidHelper.filingContent_setUp, ' + errMsg );
	}
};


JobAidHelper.JobFilingProgress = function( msgData ) 
{
	// 'name' is reqUrl..
	if ( msgData && msgData.process ) 
	{
		if ( msgData.options && msgData.options.target === 'jobAidIFrame' )
		{
			var data = { action: { name: 'simpleMsg', msgData: msgData } };
			// var returnMsgStr = JSON.stringify( { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options } );

			JobAidHelper.msgHandle( data );


			// TODO: If we are using real-time data logging, we need to send data without delay.
			//   In that case, make below 'setDelays_..' configurable.

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
					// Run the storage update..



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
	else if ( action.name === 'submitActivities' ) 
	{
		// { name: 'submitActivities', data: { requestActivities: [ { }, { } ] }, callBackEval... } 
		// Due to callBack, call iframe directly..
		JobAidHelper.submitActivities( action.data, function( resultArr ) 
		{
			$( 'div.clientListRerender' ).click(); // refresh the clientList..
			var thisAction = { callBackEval: action.callBackEval, data: { resultArr: resultArr } };
			$('iframe.jobAidIFrame')[0].contentWindow.postMessage( { action: thisAction }, '*');
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


// NOT USED?
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


JobAidHelper.submitActivities = function( data, callBack )
{
	var resultJson = []; // This is array of resultJson

	if ( data.requestActivities )
	{
		Util.callAfterEach( 0, data.requestActivities, resultJson, function( reqActivity, idx, nextCall ) {
			// each item calling..
			JobAidHelper.submitActivity( reqActivity, function( client, activity ) {
				resultJson.push( { reqActivity: reqActivity, client: client, activity: activity } );
				nextCall();
			});
		}, 
		function( idx, resultJson ) 
		{
			// Finish the call
			callBack( resultJson );
		});
	}
	else 
	{
		callBack( resultJson );
	}
};
