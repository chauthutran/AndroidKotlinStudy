function JobAidPage() { };
function JobAidItem() { };
function JobAidManifest() { };

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

JobAidPage.devInfo = '';

JobAidPage.availableManifestList = [];

JobAidPage.syncType = 'async';

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
	if ( ConfigManager.getJobAidSetting().devInfo === '1' )
	{
		JobAidPage.devInfo = ConfigManager.getJobAidSetting().devInfo;

		var spanJobAidDevInfoTag = $( '<span class="spanJobAidDevInfo" style="margin-left: 8px; line-height: 12px; font-size: 12px; color: silver;"></span>' );

		spanJobAidDevInfoTag.append( '<span style="margin-left: 5px;">syncType: </span>');
		var syncTypeTag = $( '<select class="syncType" style="width: 65px; color: white; font-size: 12px;"><option value="async">async</option><option value="sync">sync</option></select>');
		syncTypeTag.val( JobAidPage.syncType );

		syncTypeTag.change( function() {
			JobAidPage.syncType = $( this ).val();
			MsgManager.msgAreaShowOpt( 'SyncType changed to ' + JobAidPage.syncType, { hideTimeMs: 1000 } );
		});

		spanJobAidDevInfoTag.append( syncTypeTag );

		sheetFullTag.find( 'div.sheet-title' ).append( spanJobAidDevInfoTag );
	}
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
					, 'Download media update' ].indexOf( key ) >= 0 ) JobAidItem.itemDownload(projDir, key );
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

// -------------------------------------------------
// --- Download Msg Progress Updates ---

JobAidPage.jobFilingUpdate = async function (msgData) 
{
	// msgData: { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options }    
	var prc = msgData.process;
	var error = msgData.error;

	if ( error )
	{
		var fileUrl = ( prc && prc.name ) ? prc.name: '';
		MsgManager.msgAreaShowErr( 'Failed in file download: ' + fileUrl );
	}
	else
	{
		var projDir = msgData.options.projDir;
		var projCardTag = JobAidPage.getProjCardTag(projDir); // $( 'div.card[projDir=' + msgData.options.projDir + ']' );
	
		if (projCardTag.length > 0) 
		{
			var downloadOption = msgData.options.downloadOption;
	
			var spanDownloadStatusTag = JobAidPage.getSpanStatusTags_ByDownloadOption( projDir, downloadOption );
	
			if (prc.name && prc.total && prc.total > 0 && prc.curr) 
			{
				var url = prc.name;
	
				// ** Update the downloaded status on storage..  <-- Mark this 
				JobAidPage.projProcessDataUpdate(projDir, url, { date: new Date().toISOString(), downloaded: true } );
	
				if (prc.curr < prc.total) 
				{
					spanDownloadStatusTag.html(`<strong>Processed:<strong> ${prc.curr}/${prc.total} [${url.split('.').at(-1)}]`);
					if (prc.curr > 5) projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
					projCardTag.css('opacity', 1);
	
					// NOTE: Only calculate the file count/size, etc on package listing time or finished time..
				}
				else 
				{
					// === DOWNLOAD 'FINISH' OPERATION STEPS ===
					// #2. AVAILABILITY TEMP SET
					ConnManagerNew.tempDisableAvailableCheck = false; 
	
	
					spanDownloadStatusTag.html('<strong>Download completed!</strong>');
					projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
					projCardTag.css('opacity', 1);
	
					// Calculate the files size here and place it on 'persisData'
					var spanCalTag = $( '<span class="spanCalTag">Size calc..</span>' );
					spanDownloadStatusTag.append( spanCalTag );
					await JobAidManifest.setManifest_InStrg(projDir, downloadOption);
					spanCalTag.text( 'Finished calc..' );
					
					// We need to refresh the list...
					// JobAidPage.updateSectionLists(projDir, projCardTag.attr('statusType'));
					JobAidPage.populateSectionLists(false, function () {
						TranslationManager.translatePage();
					});				
				}
			}
		}
	}
};


JobAidPage.projProcessDataUpdate = function (projDir, url, updateJson) 
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
		console.log('ERROR in JobAidPage.projProcessDataUpdate, ' + errMsg);
	}
};


JobAidPage.getFilesStatusJson = function ( projDir ) 
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
		console.log('ERROR in JobAidPage.getFilesStatusJson, ' + errMsg);
	}

	return filesStatusJson;
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
				if ( downloadOption === 'appOnly_Update' ) projStatus.manifestJson.appBuildDate = projStatus.manifestJsonTemp.appBuildDate;
				else if ( downloadOption === 'mediaOnly_Update' ) projStatus.manifestJson.mediaBuildDate = projStatus.manifestJsonTemp.mediaBuildDate;
			}


			// downloadedDate, mediaDownloadedCase
			projStatus.manifestJson.downloadedDate = new Date().toISOString();
			var mediaDownloadCase = ( !downloadOption || downloadOption === 'all' || downloadOption.indexOf( 'mediaOnly' ) === 0 ) ? true: false;	
			if ( mediaDownloadCase ) projStatus.manifestJson.mediaDownloaded = true;  // Flag proj if they have media on proj downloaded or not.


			// More update - size, etc..
			if ( projStatus.process )
			{
				// TODO: Total Size should be between 'app' vs 'media' vs 'all'
				projStatus.manifestJson.totalSize = await JobAidManifest.projProcessData_calcFileSize( projStatus.process);

			
				// 2. File count - total vs downloaded.
				var valObjArr = Object.values( projStatus.process );

				projStatus.manifestJson.fileCountAll = valObjArr.length;
				projStatus.manifestJson.fileCountDownloaded = valObjArr.filter( valObj => valObj.downloaded === true ).length;
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

JobAidItem.itemDownload = function (projDir, key) 
{
	if (projDir) 
	{
		JobAidManifest.setManifestTemp_InStrg( JobAidPage.availableManifestList, projDir );

		var downloadOption = ''; // 'all';

		if ( key === 'Download w/o media' ) downloadOption = 'appOnly';
		else if ( key === 'Download app update' ) downloadOption = 'appOnly_Update';
		else if ( key === 'Download media' ) downloadOption = 'mediaOnly';
		else if ( key === 'Download media update' ) downloadOption = 'mediaOnly_Update';
		else downloadOption = 'all';


		var optionJson = { projDir: projDir, target: 'jobAidPage', downloadOption: downloadOption, syncType: JobAidPage.syncType };

		// #1. AVAILABILITY TEMP SET
		ConnManagerNew.tempDisableAvailableCheck = true; 

		// Download Start Message Dispaly..
		var spanDownloadStatusTag = JobAidPage.getSpanStatusTags_ByDownloadOption( projDir, downloadOption );
		spanDownloadStatusTag.html( '<strong>Downloading 1st file...</strong>' );

		// Submit for file listing/caching
		JobAidHelper.runTimeCache_JobAid( optionJson );
	}
	else MsgManager.msgAreaShowErr( 'Download Failed - Not proper pack name.' );
};


JobAidItem.itemDelete = function (projDir) 
{
	var result = confirm('Are you sure you want to delete this, "' + projDir + '"?');

	if (result) 
	{
		JobAidHelper.deleteCacheKeys(JobAidHelper.rootDir_jobAid + projDir + '/').then(function (deletedArr) 
		{
			// Delete on localStorage 'persisData'
			PersisDataLSManager.deleteJobFilingProjDir( projDir );

			JobAidPage.populateSectionLists(false, () => TranslationManager.translatePage() );  // JobAidPage.updateSectionLists(itemData.projDir, 'downloaded_delete');

			MsgManager.msgAreaShowOpt( 'The pack has been deleted', { hideTimeMs: 1000 } );
		});
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
	

			var filesStatusJson = JobAidPage.getFilesStatusJson( projDir ); // { appCountTotal: 0, appCountDownloaded: 0, appSizeDownloaded: 0, mediaCountTotal: 0, mediaCountDownloaded: 0, mediaSizeDownloaded };

			// ===========================================
			// NOTE / TODO:
			//		- We can further improve the 'size' calculation (of not calculated ones due to failure..)
			//			- We can do delayed check (download vs size cal), and update 'size' value only...
			// ===========================================


			var divAppInfoTag = itemTag.find( '.divAppInfo' ).show();
			var divMediaInfoTag = itemTag.find( '.divMediaInfo' ).show();

			var appReleaseDate = UtilDate.formatDate( Util.getStr(itemData.appBuildDate), "MMM dd, yy" );	
			//var appDownloadedDate = UtilDate.formatDate( downloadedData.downloadedDate, "MMM dd, yy" );

			divAppInfoTag.find( '.spanDate' ).html( appReleaseDate ); // + '[reg] / ' + appDownloadedDate + '[down]' );
			divAppInfoTag.find( '.spanFiles').html( filesStatusJson.appCountDownloaded + '/' + filesStatusJson.appCountTotal + ' | ' + Util.formatFileSizeMB( filesStatusJson.appSizeDownloaded, { decimal: 0, minWidth: true, disableMin: true } ) );

			var mediaReleaseDate = UtilDate.formatDate( Util.getStr(itemData.mediaBuildDate), "MMM dd, yy" );	
			//var mediaDownloadedDate = UtilDate.formatDate( downloadedData.downloadedDate, "MMM dd, yy" );

			divMediaInfoTag.find( '.spanDate' ).html( mediaReleaseDate ); // + ' / ' + mediaReleaseDate );
			divMediaInfoTag.find( '.spanFiles').html( filesStatusJson.mediaCountDownloaded + '/' + filesStatusJson.mediaCountTotal + ' | ' + Util.formatFileSizeMB( filesStatusJson.mediaSizeDownloaded, { decimal: 0, minWidth: true, disableMin: true } ) );


			var spanAppDownloadStatusTag = itemTag.find('span.appDownloadStatus').show();
			var spanMediaDownloadStatusTag = itemTag.find('span.mediaDownloadStatus').show();
			
			// 2. Setup for 'updates' by date comparison
			JobAidItem.itemPopulate_setUpdateStatus( itemData, menus, mediaDownloaded, spanAppDownloadStatusTag, spanMediaDownloadStatusTag );
		}
	

		var menusStr = menus.join(';');
		itemTag.attr('menus', menusStr);
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

// ===================================================
// OBSOLTE..

/*
// On 'available' download finish --> remove it from 'available' &
// we will need to refresh the cache list?  Or just add to the cached list??...
JobAidPage.updateSectionLists = function (projDir, statusType) {

	// TODO: 'item' is old data, thus, need to be updated...  + need to append with persis data..
	var item = Util.getFromList(JobAidPage.availableManifestList, projDir, 'projDir');

	if (!item) alert('Not found the item, ' + projDir);
	else {
		if (statusType === 'available') 
		{
			// Fresh Download case: 'available' -> 'downloaded'
			JobAidPage.divAvailablePacksTag.find('div.jobAidItem[projDir=' + projDir + ']').remove();

			var itemTag = $(JobAidPage.templateItem);
			JobAidItem.itemPopulate(item, itemTag, 'downloaded');
			JobAidPage.divDownloadedPacksTag.append(itemTag);
		}
		else if (statusType === 'downloaded')
		{
			// Download Update Caes: Reload with fresh status.

			var itemTag = JobAidPage.divDownloadedPacksTag.find('div.jobAidItem[projDir=' + projDir + ']').html('').append(JobAidPage.templateItem_body);

			JobAidItem.itemPopulate(item, itemTag, 'downloaded');
			JobAidPage.divDownloadedPacksTag.append(itemTag);
		}
		else if (statusType === 'downloaded_delete') 
		{
			JobAidPage.divDownloadedPacksTag.find('div.jobAidItem[projDir=' + projDir + ']').remove();

			// Also, Just In CASE, if there is available one, remove it as well
			JobAidPage.divAvailablePacksTag.find('div.jobAidItem[projDir=' + projDir + ']').remove();

			// Add to the cached..
			var itemTag = $(JobAidPage.templateItem);
			JobAidItem.itemPopulate(item, itemTag, 'available');
			JobAidPage.divAvailablePacksTag.append(itemTag);
		}
		else {
			alert('itemCard statusType not known, ' + statusType);
		}
	}

	TranslationManager.translatePage();
};
*/