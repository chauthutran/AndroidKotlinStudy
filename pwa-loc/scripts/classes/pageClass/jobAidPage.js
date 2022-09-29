function JobAidPage() { };
function JobAidItem() { };
function JobAidManifest() { };
function JobAidCaching() { };

// ----------------------------------

JobAidPage.options = {
	'title': 'Job Aids',
	'term': 'form_title_jobAid',
	'cssClasses': ['divJobAidPage'],
	'zIndex': 1600,
	'onBackClick': function() {
		ConnManagerNew.tempDisableAvailableCheck = false;
		console.log( 'tempDisableAvailableCheck set to false - in case the download never finished' );
	}
};

JobAidPage.availableManifestList = [];

JobAidPage.syncType = 'async';	// will be overwritten by config setting
JobAidPage.removeCache; // will set as 'Y' / 'N'
JobAidPage.autoRetry;
JobAidPage.autoRetryTimeOutIDs = {};
JobAidPage.autoRetry_MinTimeOut = 5;
// -------------

JobAidPage.sheetFullTag;
JobAidPage.contentBodyTag;
JobAidPage.divAvailablePacksTag;
JobAidPage.divDownloadedPacksTag;
JobAidPage.contentPageTag;

JobAidPage.loadingImageStr = '<img class="pin_pw_loading" src="images/loading_big_blue.gif" style="margin: 10px;"/>';

// ------------------

JobAidPage.render = function () 
{
	JobAidPage.sheetFullTag = FormUtil.sheetFullSetup(Templates.sheetFullFrame, JobAidPage.options);  // .options.preCall

	// Adjust for JobAid sheet
	JobAidPage.render_AdjustSheetFull( JobAidPage.sheetFullTag );


	JobAidPage.contentBodyTag = JobAidPage.sheetFullTag.find('.contentBody');
	JobAidPage.setUpPageContentLayout( JobAidPage.contentBodyTag, JobAidPage.divFileContentTag );
	
	JobAidPage.divAvailablePacksTag = JobAidPage.contentBodyTag.find('div.divAvailablePacks'); //.html( '' );
	JobAidPage.divDownloadedPacksTag = JobAidPage.contentBodyTag.find('div.divDownloadedPacks'); //.html( '' );

	
	// Populate 'Available' & 'Downloaded' sections List
	JobAidPage.populateSectionLists( false, function () 
	{  
		const downloadedItemNo = JobAidPage.divDownloadedPacksTag.find(".jobAidItem").length;
		if( downloadedItemNo == 0 ) JobAidPage.divDownloadedPacksTag.append( JobAidPage.divEmptyMsgTag );
		TranslationManager.translatePage();
	});


	// Package Item 3 dot Context Menu List & Click Setup
	JobAidPage.render_ContextMenuSetup();

	// Set up events
	JobAidPage.setUpPackEvents();
};


JobAidPage.render_AdjustSheetFull = function( sheetFullTag )
{
	// Adjustment for JobAid 'sheetFull'
	sheetFullTag.find( 'div.sheet-title' ).css( 'width', 'calc(100vw - 50px)' );
	sheetFullTag.find( 'div.sheetRightDiv' ).css( 'width', '50px' );
	sheetFullTag.find( 'div.syncIcon' ).hide();

	// JobAidDevInfo mode..
	if ( ConfigManager.getJobAidSetting().devInfo === '1' ) JobAidPage.devOptionSelects_Setup( sheetFullTag.find( 'div.sheet-title' ), ['syncType', 'removeCache', 'autoRetry' ] );
};


JobAidPage.devOptionSelects_Setup = function( sheetTitleDivTag, propArr )
{
	var spanJobAidDevInfoTag = $( '<span class="spanJobAidDevInfo" style="margin-left: 8px; line-height: 12px; font-size: 12px; color: silver;"></span>' );
	sheetTitleDivTag.append( spanJobAidDevInfoTag );


	propArr.forEach( propName => 
	{
		var selectOpts = [];

		if ( propName === 'syncType' )
		{
			JobAidPage.syncType = ( ConfigManager.getJobAidSetting().syncType === "sync" ) ? 'sync' : 'async';
			spanJobAidDevInfoTag.append( '<span style="margin-left: 5px;" title="On download, use async or sync type request">syncType: </span>');
			selectOpts = [ { value: 'async', name: 'async' }, { value: 'sync', name: 'sync' } ];
		}
		else if ( propName === 'removeCache' )
		{
			JobAidPage.removeCache = ( ConfigManager.getJobAidSetting().removeCacheOnDelete === true ) ? 'Y': 'N';
			spanJobAidDevInfoTag.append( '<span style="margin-left: 5px;" title="On pack delete, remove cache">removeCache: </span>');
			selectOpts = [ { value: 'N', name: 'No' }, { value: 'Y', name: 'Yes' } ];
		}
		else if ( propName === 'autoRetry' )
		{
			JobAidPage.autoRetry = ( !ConfigManager.getJobAidSetting().autoRetry ) ? '' : ConfigManager.getJobAidSetting().autoRetry;
			spanJobAidDevInfoTag.append( '<span style="margin-left: 5px;" title="On download haulting 30 sec or more, automatically">autoRetry: </span>');
			selectOpts = ( ConfigManager.getJobAidSetting().autoRetryOptions ) ? ConfigManager.getJobAidSetting().autoRetryOptions: [];
		}

		JobAidPage.devOptionSelect( spanJobAidDevInfoTag, propName, selectOpts );
	});
};


// prop: 'syncType', options: [ { value: 'sync', name: 'sync' }, { value: 'async', name: 'async' } ], 
JobAidPage.devOptionSelect = function( spanJobAidDevInfoTag, prop, options )
{
	var propTag = $( '<select class="' + prop + ' jobAidDevSelect"></select>');
	options.forEach( item => {
		propTag.append( '<option value="' + item.value + '">' + item.name + '</option>' );
	});
	propTag.val( JobAidPage[prop] );


	propTag.change( function() {		
		JobAidPage[prop] = $( this ).val();
		MsgManager.msgAreaShowOpt( prop + ' set to ' + JobAidPage[prop], { hideTimeMs: 1000 } );

		// When 'autoRetry' is changed, remove existing timeouts.
		if ( prop === 'autoRetry' ) {
			for ( var toId in JobAidPage.autoRetryTimeOutIDs ) {  clearTimeout( JobAidPage.autoRetryTimeOutIDs[toId] );  }
		}
	});

	spanJobAidDevInfoTag.append( propTag );
};


JobAidPage.render_ContextMenuSetup = function()
{
	// Item Right UI 3 dot Context Menu - select event.
	$.contextMenu({
		selector: 'div.jobContextMenu',
		trigger: 'left',
		build: function ($triggerElement, e) 
		{
			var jobAidItemTag = $triggerElement.closest('div.jobAidItem');

			var projDir = jobAidItemTag.attr('projDir');

			var menusStr = jobAidItemTag.attr('menus');
			var menusArr = menusStr.split( ';' );

			var items = {};
			menusArr.forEach( menuStr => {  items[ menuStr ] = { name: menuStr };  });

			return {
				items: items,
				callback: function (key, options) 
				{
					if ( ['Download', 'Download w/o media', 'Download with media', 'Download media', 'Download app update'
					, 'Download media update', 'ReAttempt App Download', 'ReAttempt Media Download' ].indexOf( key ) >= 0 ) JobAidItem.itemDownload(projDir, JobAidItem.keyToDownloadOption( key ) );
					else if (key === 'See content') JobAidContentPage.fileContentDialogOpen(projDir);
					else if (key === 'Delete') JobAidItem.itemDelete(projDir);
					else if (key === 'Open') JobAidItem.itemOpen(projDir);
				}
			};
		}
	});
};


JobAidPage.setUpPackEvents = function()
{
	JobAidPage.contentBodyTag.find("img.collapseDownloadedPacks").off("click").on("click", function (e) {
		JobAidPage.contentBodyTag.find(".divDownloadedPacks").toggle("fast");
	});

	JobAidPage.contentBodyTag.find("img.refreshPacks").off("click").on("click", function (e) {
		JobAidPage.populateSectionLists(true, function () {
			TranslationManager.translatePage();
		});
	});

	JobAidPage.contentBodyTag.find("img.collapseAvailablePacks").off("click").on("click", function (e) {
		JobAidPage.contentBodyTag.find(".divAvailablePacks").toggle("fast");
	});
}

// ===================================================

JobAidPage.setUpPageContentLayout = function (contentBodyTag, divFileContentTag) {
	contentBodyTag.append(JobAidPage.templateSections);
	contentBodyTag.append( divFileContentTag );
};


// 'Available' - from Server Manifest Data, 'Downloaded' - from cached manifest.json files
JobAidPage.populateSectionLists = function ( refreshAvailableOnly, callBack ) 
{
	// Reload without setting html back..  How?


	// STEP 0. Clear the list html:
	JobAidPage.divAvailablePacksTag.hide( 'fast' ).html( '' );
	JobAidPage.divDownloadedPacksTag.hide( 'fast' ).html( '' );

	// STEP 1. Get Server Manifests
	JobAidManifest.retrieve_AvailableManifestList( function() 
	{
		// PreCallBack..
		JobAidPage.divAvailablePacksTag.append(JobAidPage.loadingImageStr).show( 'fast' );  // Loading Image with clearing
		JobAidPage.divDownloadedPacksTag.append(JobAidPage.loadingImageStr).show( 'fast' );

	}, function ( availableManifestList ) 
	{
		JobAidPage.availableManifestList = availableManifestList;
		//JobAidPage.populateAvailableItems( JobAidPage.divAvailablePacksTag, availableManifestList );

		// Get Cached Manifests
		JobAidPage.downloadedManifestList = JobAidManifest.retrieve_DownloadedManifestList();


		// Populate "uninstall" list
		const downloadedProjDirList = JobAidPage.downloadedManifestList.map(function(a) {return a.projDir;});
		var uninstallList = [];
		for( var i=0; i<availableManifestList.length; i++ )
		{
			const item = availableManifestList[i];
			if( downloadedProjDirList.indexOf( item.projDir ) < 0 )
			{
				uninstallList.push( item );
			}
		}

		JobAidPage.populateAvailableItems( JobAidPage.divAvailablePacksTag, uninstallList );

		// Populate "downloaded" list
		// STEP 2. Get Cached Manifests & display/list them
		JobAidPage.populateDownloadedItems( JobAidPage.divDownloadedPacksTag, JobAidPage.downloadedManifestList );


		// STEP 2. Get Cached Manifests & display/list them
		//JobAidPage.downloadedManifestList = JobAidManifest.retrieve_DownloadedManifestList();
		//JobAidPage.populateDownloadedItems( JobAidPage.divDownloadedPacksTag, JobAidPage.downloadedManifestList );
		
		if (callBack) callBack();
	});
};


JobAidPage.populateAvailableItems = function( divAvailablePacksTag, manifestList )
{
	divAvailablePacksTag.html(''); // Clear loading Img

	// List All server manifest list - Available Packs
	manifestList.forEach(function (item) 
	{
		var itemTag = $(JobAidPage.templateItem);
		JobAidItem.itemPopulate(item, itemTag, 'available');
		divAvailablePacksTag.append(itemTag);
	});
};


JobAidPage.populateDownloadedItems = function( divDownloadedPacksTag, manifestList )
{
	divDownloadedPacksTag.html(''); // Clear loading Img

	// Stored/Downloaded items (in manifest) populate
	manifestList.forEach(function (item) 
	{
		var itemTag = $(JobAidPage.templateItem);
		JobAidItem.itemPopulate(item, itemTag, 'downloaded');
		divDownloadedPacksTag.append(itemTag);
	});
};

// ------------------------------------

JobAidPage.getProjCardTag = function (projDir) {
	return $('div.jobAidItem[projDir=' + projDir + ']');
};


JobAidPage.getSpanStatusTags_ByDownloadOption = function( projDir, downloadOption )
{
	var projCardTag = JobAidPage.getProjCardTag(projDir); // $( 'div.card[projDir=' + msgData.options.projDir + ']

	var spanDownloadStatusTag;  // var spanDownloadStatusTag = projCardTag.find('span.downloadStatus');

	if ( !downloadOption || downloadOption === 'all' ) spanDownloadStatusTag = projCardTag.find('span.appDownloadStatus,span.mediaDownloadStatus').show();
	else if ( downloadOption.indexOf( 'appOnly' ) === 0 ) spanDownloadStatusTag = projCardTag.find('span.appDownloadStatus').show();
	else if ( downloadOption.indexOf( 'mediaOnly' ) === 0 ) spanDownloadStatusTag = projCardTag.find('span.mediaDownloadStatus').show();

	return spanDownloadStatusTag;
};

// ------------------------------------

JobAidPage.templateSections = `
	<div class="sectionTitle_jobAid">
		<div style="display: flex;">
			<img style="width: 20px; height: 20px;" src="../images/download.svg">
			<div style="white-space: nowrap;">Downloaded packs</div>
		</div>

		<div class="actions">
			<img src="../images/sync_pending.png" class="refreshPacks">
			<img src="../images/arrow_up_circle.svg" class="collapseDownloadedPacks">
		</div>
	</div>

    <div class="divDownloadedPacks">
    </div>

    <div class="sectionTitle_jobAid">
		<div style="display: flex;">
			<img src="../images/available_packs.svg">
			<div style="white-space: nowrap;">Packs available for download</div>
		</div>

		<div class="actions">
			<img src="../images/sync_pending.png" class="refreshPacks">
			<img src="../images/arrow_up_circle.svg" class="collapseAvailablePacks">
		</div>
	</div>

   <div class="divAvailablePacks"></div>
`;

JobAidPage.templateItem_body = `
   <div class="card__container">
      <card__support_visuals class="card__support_visuals" style="padding-left: 4px;"><img src="images/JobAidicons.png"></card__support_visuals>
      <card__content class="card__content jaCardContent">
         <div class="card__row divTitle"></div>
         <div class="card__row divBuildDate" style="display: none;"></div>
         <div class="card__row divDownloadInfo" style="display: none;">
				<span class="downloadInfo"></span>
				<span class="appDownloadStatus downloadStatus"></span>
			</div>
			
			<div class="card__row divAppInfo" style="display: none;">
				<span style="font-weight: bold;">App: </span> <span class="spanDate"></span> | <span class="spanFiles"></span> <span class="appDownloadStatus downloadStatus" style="display: none;"></span>
			</div>
			<div class="card__row divMediaInfo" style="display: none;">
				<span style="font-weight: bold;">Media: </span> <span class="spanDate"></span> | <span class="spanFiles"></span> <span class="mediaDownloadStatus downloadStatus" style="display: none;"></span>
			</div>
			
      </card__content>
      <card__cta class="card__cta">
         <div class="jobContextMenu threeDotMenu mouseDown">&#10247;</div>
      </card__cta>
   </div>
`;

JobAidPage.templateItem = `
   <div class="card jobAidItem smartStart" data-language="" projdir="" style="opacity: 1;display: inline-block; height: unset;" downloaded="Y">
   ${JobAidPage.templateItem_body}
   </div>
`;


JobAidPage.divFileContentTag = `
<div class="divFileContentDisplay" style="display: none;">
	<div class="divMainLayout popupAreaCss">
		<div style="margin-bottom: 5px;">File Content:</div>
		<div class="divMainContent" style="overflow: scroll; height: calc( 100% - 65px ); background-color: #fafafa;"></div>

		<div class="button-text warning" style="width: 100%;margin: 10px 0px 0px 0px;height: 25px;cursor: unset;">
			<div class="button__container" style="float:right;">
				<div class="close button-label" style="line-height: unset;cursor: pointer;">CLOSE</div>
			</div>
		</div>
	</div>
</div>
`;


JobAidPage.divEmptyMsgTag = `
	<div class="emptyList">
		<div class="msg" style="background-color: ghostwhite;">
			No App has been downloaded yet. Please choose the language(s) of the Apps available for download.
		</div>
		<div class="img">
			<img src="../images/arrow_down1.svg">
		</div>
	</div>
`;

// ====================================================
// ==== JobAidManifest Related =============

// Retrieve manifest list in server
// JobAidPage.getServerManifestsRun <-- OLD
JobAidManifest.retrieve_AvailableManifestList = function( preCallBack, callBack ) 
{
	if ( preCallBack ) preCallBack();

	if ( ConnManagerNew.isAppMode_Online() )
	{
		var options = { projDir: '', isListingApp: false, isLocal: true, appName: 'pwa-dev' };
		options.isLocal = WsCallManager.checkLocalDevCase( window.location.origin );
	
		var requestUrl = (options.isLocal) ? 'http://localhost:8383/manifests' : WsCallManager.composeDwsWsFullUrl('/TTS.jobsManifests')
		requestUrl = WsCallManager.localhostProxyCaseHandle( requestUrl ); // Add Cors sending IF LOCAL
	
		// NEW: jobAid settingsOverride
		//if ( ConfigManager.getJobAidSetting().settingsOverride ) options.settingsOverride = ConfigManager.getJobAidSetting().settingsOverride;

		var optionsStr = JSON.stringify( options );
	
		$.ajax({
			url: requestUrl + '?optionsStr=' + encodeURIComponent( optionsStr ),
			type: "GET",
			dataType: "json",
			success: function (response) 
			{
				if ( callBack ) callBack( JobAidManifest.getAvailable_ManifestJobAidData( response.list ) );
			},
			error: function ( error ) {
				console.log( 'error: ' );
				console.log( error );
				MsgManager.msgAreaShowErr( 'FAILED on retrieve_AvailableManifestList' );
				if ( callBack ) callBack( [] );
			},
			complete: function () { }			
		});
	}
	else
	{
		if ( callBack ) callBack( [] );
	}
};

// Retrieve manifest list (downloaded) in local storage
// JobAidPage.getDeviceCache_Manifests <-- OLD
JobAidManifest.retrieve_DownloadedManifestList = function() 
{
	var manifestList = [];

	//if ( preCallBack ) preCallBack();

	try 
	{
		// Not from Cache, but from Storage..
		var jobFilingStatusJson = PersisDataLSManager.getJobFilingStatus();
			
		if ( jobFilingStatusJson )
		{
			for ( var prop in jobFilingStatusJson )
			{
				if ( prop !== 'jobListingApp' )
				{
					var projStatus = jobFilingStatusJson[ prop ];

					// NOTE: We could save the Storage data from here?  Or retrieve everytime?
					var manifestJson = projStatus.manifestJson;
					if ( manifestJson ) 
					{
						if ( !manifestList.appBuildDate && manifestList.buildDate ) manifestList.appBuildDate = manifestList.buildDate;

						manifestList.push( manifestJson );
					}
				}
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in JobAidPage.retrieve_DownloadedManifestList, ' + errMsg);
	}

	return manifestList;
};

// ------------

// JobAidPage.getManifestJobAidInfo  <-- OLD
JobAidManifest.getAvailable_ManifestJobAidData = function( list )
{
	var manifestList = [];

	try 
	{
		if ( Util.isTypeArray( list ) ) 
		{
			list.forEach(item => 
			{
				if (Util.isTypeObject(item.jobAidInfo)) 
				{
					var jobAidManifest = item.jobAidInfo;

					// If 'appBuildDate' is not available, and 'buildDate' exists, use that instead.
					if ( !jobAidManifest.appBuildDate && jobAidManifest.buildDate ) jobAidManifest.appBuildDate = jobAidManifest.buildDate;
					// What about media?  also use 'buildDate'?  No, not for now.					

					manifestList.push(jobAidManifest);
				}
			});
		}
	}
	catch (errMsg) {
		console.log('ERROR in JobAidPage.getAvailable_ManifestJobAidData, ' + errMsg);
	}
	
	return manifestList;
};

// ---------------------------

// Called when download is finished.
//  - New Download Case --> Simply save the manifest info?  + additional calculate info
//  - On media download or Updates cases --> 
JobAidManifest.setManifest_InStrg = async function(projDir, downloadOption)
{
	var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);
	if ( !projStatus.manifestJson ) projStatus.manifestJson = {};

	// Manifest set or update - in Storage..
	if ( !projStatus.manifestJsonTemp ) alert( 'ERROR, manifestJsonTemp is not available for this proj, ' + projDir );
	else
	{
		try
		{
			// Fresh download case vs update case 
			var freshDownload = ( !downloadOption || downloadOption === 'all' || downloadOption === 'appOnly' ) ? true: false;
			if ( freshDownload )
			{
				// Get it from available one?  put it on temp and get it from temp..
				projStatus.manifestJson = Util.cloneJson( projStatus.manifestJsonTemp );
				delete projStatus.manifestJsonTemp;
			}
			else
			{
				// For updates, simply copy
				if ( projStatus.manifestJsonTemp )
				{
					if ( downloadOption.indexOf( 'appOnly_' ) === 0 ) projStatus.manifestJson.appBuildDate = projStatus.manifestJsonTemp.appBuildDate;
					else if ( downloadOption.indexOf( 'mediaOnly_' ) === 0 ) projStatus.manifestJson.mediaBuildDate = projStatus.manifestJsonTemp.mediaBuildDate;
					// For 'app/mediaOnly_ReAttempt', we do no tneed to do anything here.?
					// TODO: We might need to copy the 'manifestJsonTemp' if the previous download did not finish?	
				}
			}


			// downloadedDate, mediaDownloadedCase
			projStatus.manifestJson.downloadedDate = new Date().toISOString();
			var mediaDownloadCase = ( !downloadOption || downloadOption === 'all' || downloadOption.indexOf( 'mediaOnly' ) === 0 ) ? true: false;	
			if ( mediaDownloadCase ) projStatus.manifestJson.mediaDownloaded = true;  // Flag proj if they have media on proj downloaded or not.


			// More update - size, etc..
			if ( projStatus.process )
			{
				// TODO: Total Size should be between 'app' vs 'media' vs 'all'
				//projStatus.manifestJson.totalSize = await JobAidManifest.projProcessData_calcFileSize( projStatus.process);
			
				// 2. File count - total vs downloaded.
				//var valObjArr = Object.values( projStatus.process );

				//projStatus.manifestJson.fileCountAll = valObjArr.length;
				//projStatus.manifestJson.fileCountDownloaded = valObjArr.filter( valObj => valObj.downloaded === true ).length;
			}

		}
		catch( errMsg ) {  console.log( 'ERROR in JobAidManifest.setManifest_InStrg, ' + errMsg );  }

		PersisDataLSManager.updateJobFilingProjDirStatus(projDir, projStatus);
	}
};


JobAidManifest.setManifestTemp_InStrg = function( availableManifestList, projDir )
{
	var manifestJson;

	if ( projDir )
	{
		var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);

		manifestJson = Util.getFromList( availableManifestList, projDir, 'projDir' );
		projStatus.manifestJsonTemp = Util.cloneJson( manifestJson );
		
		PersisDataLSManager.updateJobFilingProjDirStatus(projDir, projStatus);
	}

	if ( !manifestJson ) MsgManager.msgAreaShowErr( 'No projDir, ' + projDir + ', in AvailableManifest.' );
};


JobAidManifest.projProcessData_calcFileSize = async function ( projProcess )
{
	// 1. File size calculate - individual ones calculate & save.  Total size calc.
	//		- Should only calculate if needed --> Process it if has downloaded & does not have 'size' & exists in cache..				
	var totalSize = 0;

	try 
	{
		var cacheKeyJson = await JobAidHelper.getCacheKeys_async();
		var keys = cacheKeyJson.keys;
		var cache = cacheKeyJson.cache;  //var statusFullJson = JobAidHelper.getJobFilingStatusIndexed();

		// Calculate size
		for( var urlProp in projProcess )
		{
			var item = projProcess[urlProp];

			// Condition: has projDir url, downloaded, and no size set, calculate size..
			if ( item.downloaded && !item.size )
			{
				var request = JobAidManifest.getCacheKeyRequest( urlProp, keys );

				if ( request )
				{
					var response = await cache.match( request );
					var myBlob = await response.clone().blob();
					var size = myBlob.size;
		
					Util.mergeJson( item, { size: size } );	
				}
			}

			totalSize += item.size;
		}
	}
	catch( errMsg ) { console.log( 'ERROR in JobAidManifest.projProcessData_calcFileSize, ' + errMsg ); };

	// Updating in Storage (Persis) is done from outside of this method
	return totalSize;
};


JobAidManifest.getCacheKeyRequest = function ( url, keys )
{
	var requestFound;

	for ( var i = 0; i < keys.length; i++ )
	{
		var request = keys[i];

		if ( request.url.indexOf( url ) >= 0 )
		{
			requestFound = request;
			break;
		}
	}

	return requestFound;
};


// ======================================================
// ==== JobAidItem Related =============

// ------------------
// --- EVENTS

JobAidItem.itemOpen = function (projDir) 
{
	// Open JobAid iFrame Click - Up in iFrame Click Setup..
	var srcStr = JobAidHelper.rootDir_jobAid + projDir + '/index.html';
	var styleStr = 'width:100%; height: 100%; overflow:auto; border:none;';

	$('#divJobAid').html('').show().append(`<iframe class="jobAidIFrame" src="${srcStr}" style="${styleStr}">iframe not compatible..</iframe>`);
};


JobAidItem.keyToDownloadOption = function ( key ) 
{
	var downloadOption = '';

	if ( key === 'Download w/o media' ) downloadOption = 'appOnly';
	else if ( key === 'Download app update' ) downloadOption = 'appOnly_Update';
	else if ( key === 'Download media' ) downloadOption = 'mediaOnly';
	else if ( key === 'Download media update' ) downloadOption = 'mediaOnly_Update';
	else if ( key === 'ReAttempt App Download' ) downloadOption = 'appOnly_ReAttempt';
	else if ( key === 'ReAttempt Media Download' ) downloadOption = 'mediaOnly_ReAttempt';
	else downloadOption = 'all';

	return downloadOption;
};

JobAidItem.itemDownload = function (projDir, downloadOption) 
{
	if (projDir) 
	{
		// ?? <-- How does this work when partial reAttempt goes..
		JobAidManifest.setManifestTemp_InStrg( JobAidPage.availableManifestList, projDir );

		var reAttemptCaseType = ''

		if ( downloadOption === 'ReAttempt App Download' ) reAttemptCaseType = 'app';
		else if ( downloadOption === 'ReAttempt Media Download' ) reAttemptCaseType = 'media';


		var optionJson = { projDir: projDir, target: 'jobAidPage', downloadOption: downloadOption, syncType: JobAidPage.syncType };

		// #1. AVAILABILITY TEMP SET
		ConnManagerNew.tempDisableAvailableCheck = true; 

		// Download Start Message Dispaly..
		var spanDownloadStatusTag = JobAidPage.getSpanStatusTags_ByDownloadOption( projDir, downloadOption );
		spanDownloadStatusTag.html( '<strong>Downloading 1st file...</strong>' );


		var newFileList_Override = ( reAttemptCaseType ) ? JobAidItem.getReAttemptList( projDir, reAttemptCaseType ): undefined;

		// Submit for file listing/caching
		JobAidHelper.runTimeCache_JobAid( optionJson, undefined, newFileList_Override );

	}
	else MsgManager.msgAreaShowErr( 'Download Failed - Not proper pack name.' );
	
};


JobAidItem.getReAttemptList = function( projDir, fileType )
{
	var fileUrlList = [];

	// Loop through ProjSettings.process list for download - false case, but by type?  Yes..
	var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);
	
	if ( projStatus.process )
	{
		for ( var prop in projStatus.process )
		{
			var item = projStatus.process[prop];

			if ( !item.downloaded && item.fileType === fileType )
			{
				fileUrlList.push( prop );
			}
		}
	}

	return fileUrlList;
};


JobAidItem.itemDelete = async function (projDir) 
{
	var result = confirm('Are you sure you want to delete this, "' + projDir + '"?');

	if (result) 
	{		
		// Delete on localStorage 'persisData'
		PersisDataLSManager.deleteJobFilingProjDir( projDir );

		// Optional 'removeCacheOnDelete' - delete from cache
		if ( JobAidPage.removeCache === 'Y' )
		{
			await JobAidHelper.deleteCacheKeys( JobAidHelper.rootDir_jobAid + projDir + '/' );
		}


		JobAidPage.populateSectionLists(false, () => TranslationManager.translatePage() );  // JobAidPage.updateSectionLists(itemData.projDir, 'downloaded_delete');

		MsgManager.msgAreaShowOpt( 'The pack has been deleted', { hideTimeMs: 1000 } );
	}
};

// -------------------

JobAidItem.itemPopulate = function (itemData, itemTag, statusType) 
{
	var menus = [];

	if ( !itemData.projDir ) MsgManager.msgAreaShowErr( 'FAILED to populate item - NO "projDir"' );
	else
	{
		var projDir = itemData.projDir;

		// reset 'itemData' for this projDir		

		// type = 'available' vs 'downloaded'  // itemData = {code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false };
		itemTag.off('click'); // reset previous click if exists.
		itemTag.attr('data-language', itemData.code);
		itemTag.attr('projDir', projDir);
		itemTag.attr('statusType', statusType);
	
		var titleStrongTag = $('<strong></strong>').append(itemData.title + ' [' + Util.getStr(itemData.language) + ']');
		itemTag.find('.divTitle').append(titleStrongTag);
	
	
		if (statusType === 'available') 
		{
			// CHANGED: ALWAYS ASSUME THERE IS MEDIA IN ALL PACKAGE.  //if ( itemData.noMedia === false ) // display both types
			menus.push('Download w/o media');
			menus.push('Download with media');

			var divReleaseInfoTag = itemTag.find('.divBuildDate').html('<strong>Release date: </strong>' + UtilDate.formatDate( Util.getStr(itemData.appBuildDate), "MMM dd, yy" ) ).show();
	
			var divDownloadInfoTag = itemTag.find('.divDownloadInfo').show();
			var spanDownloadInfoTag = divDownloadInfoTag.find( 'span.downloadInfo' ).html( '<strong>Download size: </strong>' + Util.getStr(itemData.size) );	
		}
		// Downloaded Case - 'open' in iFrame case, 'delete' case.
		else if (statusType === 'downloaded') 
		{
			var downloadedData = JobAidItem.itemPopulate_getDownloadedData(projDir);
			var mediaDownloaded = downloadedData.mediaDownloaded;

			menus.push( 'Open' );
			menus.push( 'See content' ); 
			menus.push( 'Delete' );	
			if ( !mediaDownloaded ) menus.push( 'Download media' );
	

			var filesStatusJson = JobAidItem.getFilesStatusJson( projDir ); // { appCountTotal: 0, appCountDownloaded: 0, appSizeDownloaded: 0, mediaCountTotal: 0, mediaCountDownloaded: 0, mediaSizeDownloaded };

			JobAidItem.infoRowTagPopulate( itemTag.find( '.divAppInfo' ).show(), menus, 'app', itemData.appBuildDate, filesStatusJson.appCountDownloaded, filesStatusJson.appCountTotal, filesStatusJson.appSizeDownloaded );
			JobAidItem.infoRowTagPopulate( itemTag.find( '.divMediaInfo' ).show(), menus, 'media', itemData.mediaBuildDate, filesStatusJson.mediaCountDownloaded, filesStatusJson.mediaCountTotal, filesStatusJson.mediaSizeDownloaded );
			
			// 2. Setup for 'updates' by date comparison
			JobAidItem.itemPopulate_setUpdateStatus( itemData, menus, mediaDownloaded, itemTag.find('span.appDownloadStatus').show(), itemTag.find('span.mediaDownloadStatus').show() );
		}
	

		var menusStr = menus.join(';');
		itemTag.attr('menus', menusStr);
	}
};


JobAidItem.getFilesStatusJson = function ( projDir ) 
{
	var filesStatusJson = { appCountTotal: 0, appCountDownloaded: 0, appSizeDownloaded: 0, mediaCountTotal: 0, mediaCountDownloaded: 0, mediaSizeDownloaded: 0 };

	try {
		if ( projDir )
		{
			var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);

			if (projStatus.process) 
			{
				for( var prop in projStatus.process )
				{
					var item = projStatus.process[ prop ];

					if ( item.fileType === 'media' )
					{
						filesStatusJson.mediaCountTotal++;
						if ( item.downloaded === true ) 
						{
							filesStatusJson.mediaCountDownloaded++;
							if ( item.size ) filesStatusJson.mediaSizeDownloaded += item.size;	
						}						
					}
					else if ( item.fileType === 'app' )
					{
						filesStatusJson.appCountTotal++;
						if ( item.downloaded === true ) 
						{
							filesStatusJson.appCountDownloaded++;
							if ( item.size ) filesStatusJson.appSizeDownloaded += item.size;
						}
					}
				}
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in JobAidItem.getFilesStatusJson, ' + errMsg);
	}

	return filesStatusJson;
};


JobAidItem.infoRowTagPopulate = function( divInfoTag, menus, typeName, buildDate, dCount, tCount, size )
{
	var releaseDate = UtilDate.formatDate( Util.getStr(buildDate), "MMM dd, yy" );	

	divInfoTag.find( '.spanDate' ).html( releaseDate );
	divInfoTag.find( '.spanFiles').html( '<span class="dCount">' + dCount + '</span>' + '/' + tCount + ' | ' + Util.formatFileSizeMB( size, { decimal: 0, minWidth: true, disableMin: true } ) );

	// TODO: if it is not up to the count, mark it read + add to menu..
	if ( dCount < tCount )
	{
		divInfoTag.find( '.dCount' ).css( 'color', 'red' ).css( 'font-weight', 'bold' );
		if ( typeName === 'app' ) menus.push('ReAttempt App Download');
		else if ( typeName === 'media' ) menus.push('ReAttempt Media Download');
	}
};


JobAidItem.itemPopulate_getDownloadedData = function(projDir)
{
	var downloadedData = { downloadedDate: '', totalSize: 0, fileCountAll: 0, fileCountDownloaded: 0, mediaStr: '', mediaDownloaded: false };

	// From Extra info for thie 'projDir', update info..
	var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);
	var manifestJson = projStatus.manifestJson;

	if ( manifestJson )
	{
		downloadedData.manifestJson = manifestJson;

		downloadedData.totalSize = manifestJson.totalSize;  // TODO: These should be splited 'app' vs 'media'
		downloadedData.fileCountAll = manifestJson.fileCountAll;
		downloadedData.fileCountDownloaded = manifestJson.fileCountDownloaded;
		downloadedData.downloadedDate = Util.getStr( manifestJson.downloadedDate );
		downloadedData.mediaDownloaded = manifestJson.mediaDownloaded;

		if ( manifestJson.mediaDownloaded ) downloadedData.mediaStr = '<span>exists</span>';	
		else downloadedData.mediaStr = '<span>pending</span>';	
	}

	return downloadedData;
};

JobAidItem.itemPopulate_setUpdateStatus = function( itemData, menus, mediaDownloaded, spanAppDownloadStatusTag, spanMediaDownloadStatusTag )
{
	var matchData = JobAidItem.matchInServerList(itemData, JobAidPage.availableManifestList);
	
	if (matchData.matchProj) 
	{
		// Remove from available side - when we add this on 'downloaded' side
		JobAidPage.divAvailablePacksTag.find('div.jobAidItem[projDir="' + itemData.projDir + '"]').remove();

		if (matchData.appNewerDate) 
		{
			menus.push('Download app update');
			spanAppDownloadStatusTag.show().text( '[Update Available]' );
		}

		if (matchData.mediaNewerDate && mediaDownloaded ) 
		{
			menus.push('Download media update');
			spanMediaDownloadStatusTag.show().text( '[Update Available]' );
		}
	}
};


JobAidItem.matchInServerList = function (item, serverManifestsData) 
{
	var matchData = { matchProj: false, appNewerDate: '', mediaNewerDate: '' };

	serverManifestsData.forEach(srvItem => {
		if (srvItem.projDir === item.projDir) 
		{
			matchData.matchProj = true;

			if ( srvItem.appBuildDate && item.appBuildDate && srvItem.appBuildDate > item.appBuildDate ) matchData.appNewerDate = srvItem.appBuildDate;
			else if ( !item.appBuildDate && srvItem.appBuildDate ) matchData.appNewerDate = srvItem.appBuildDate;

			if ( srvItem.mediaBuildDate && item.mediaBuildDate && srvItem.mediaBuildDate > item.mediaBuildDate ) matchData.mediaNewerDate = srvItem.mediaBuildDate;
			else if ( !item.mediaBuildDate && srvItem.mediaBuildDate ) matchData.mediaNewerDate = srvItem.mediaBuildDate;
		}
	});

	return matchData;
};


// ======================================================
// ==== JobAidCaching Related =============

JobAidCaching.jobFilingUpdate = async function (msgData) 
{
	// msgData: { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options }    
	var prc = msgData.process;
	var error = msgData.error;
	var isDownloaded = ( error ) ? false: true;

	if ( error )
	{
		var fileUrl = ( prc && prc.name ) ? prc.name: '';
		MsgManager.msgAreaShowErr( 'Failed in file download: ' + fileUrl );
	}

	var projDir = msgData.options.projDir;
	var downloadOption = msgData.options.downloadOption;	
	var projCardTag = JobAidPage.getProjCardTag(projDir); // $( 'div.card[projDir=' + msgData.options.projDir + ']' );


	// Set auto Retry for this processing
	if ( JobAidPage.autoRetry && JobAidPage.autoRetry > JobAidPage.autoRetry_MinTimeOut )
	{
		var processKey = projDir + '_' + downloadOption;

		// Remove previous timeout set..
		if ( JobAidPage.autoRetryTimeOutIDs[processKey] ) clearTimeout( JobAidPage.autoRetryTimeOutIDs[processKey] );

		if ( prc.total && prc.curr && prc.curr < prc.total ) 
		{
			JobAidPage.autoRetryTimeOutIDs[processKey] = setTimeout( function() { JobAidCaching.triggerReTry(projDir, downloadOption); }, JobAidPage.autoRetry * 1000 );
		}

		// TODO: Later, make the limit of how many autoRetries are permitted..
	}



	if (projCardTag.length > 0) 
	{
		var spanDownloadStatusTag = JobAidPage.getSpanStatusTags_ByDownloadOption( projDir, downloadOption );

		if (prc.name && prc.total && prc.total > 0 && prc.curr) 
		{
			var url = prc.name;

			projCardTag.css('opacity', 1);

			// ** Update the downloaded status on storage..  <-- Mark this 
			if ( isDownloaded ) JobAidCaching.projProcessDataUpdate(projDir, url, { date: new Date().toISOString(), downloaded: true } );


			// Still in process VS 'Finished'
			if (prc.curr < prc.total) 
			{
				spanDownloadStatusTag.html(`<strong>Processed:<strong> ${prc.curr}/${prc.total} [${url.split('.').at(-1)}]`);
				if (prc.curr > 5) projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
			}
			else 
			{
				// === DOWNLOAD 'FINISH' OPERATION STEPS ===
				// #2. AVAILABILITY TEMP SET
				ConnManagerNew.tempDisableAvailableCheck = false; 


				spanDownloadStatusTag.html('<strong>Download completed!</strong>');
				projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj

				await JobAidManifest.setManifest_InStrg(projDir, downloadOption);

				
				// Refresh the sections & list...
				JobAidPage.populateSectionLists(false, function () {
					TranslationManager.translatePage();
				});				
			}
		}
	}
};


JobAidCaching.triggerReTry = function( projDir, downloadOption )
{
	MsgManager.msgAreaShowErr( 'Download ' + projDir + ' RETRIED due to ' + JobAidPage.autoRetry + ' sec haulting.' );	
	console.log( 'JobAidCaching.triggerReTry CALLED, ' + new Date().toString() );

	JobAidItem.itemDownload(projDir, downloadOption);
};


JobAidCaching.projProcessDataUpdate = function (projDir, url, updateJson) 
{
	try {
		if (projDir && url && updateJson)
		{
			var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);

			if (projStatus.process && projStatus.process[url]) {
				var item = projStatus.process[url];

				Util.mergeJson(item, updateJson);

				PersisDataLSManager.updateJobFilingProjDirStatus(projDir, projStatus);
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in JobAidCaching.projProcessDataUpdate, ' + errMsg);
	}
};
