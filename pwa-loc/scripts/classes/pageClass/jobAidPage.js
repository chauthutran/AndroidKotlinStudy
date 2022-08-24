function JobAidPage() { };

JobAidPage.options = {
	'title': 'Job Aids',
	'term': 'form_title_jobAid',
	'cssClasses': ['divJobAidPage'],
	'zIndex': 1600
};

JobAidPage.rootPath = '/jobs/jobAid/';

JobAidPage.sheetFullTag;
JobAidPage.contentBodyTag;
JobAidPage.divAvailablePacksTag;
JobAidPage.divDownloadedPacksTag;
JobAidPage.contentPageTag;

JobAidPage.serverManifestsData = [];

JobAidPage.itemJsonInMem = {};  // Temporary stored data. each proj uses this by being added under as sub prop.
									// Gets assigned/reset each time on itemPopulate.

// ------------------

JobAidPage.render = function () {
	JobAidPage.sheetFullTag = FormUtil.sheetFullSetup(Templates.sheetFullFrame, JobAidPage.options);  // .options.preCall

	JobAidPage.contentBodyTag = JobAidPage.sheetFullTag.find('.contentBody');

	JobAidPage.setUpPageContentLayout( JobAidPage.contentBodyTag, JobAidPage.divFileContentTag );

	JobAidPage.populateSectionLists(JobAidPage.contentBodyTag, function () {
		TranslationManager.translatePage();
	});


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
					if ( ['Download', 'Download w/o media', 'Download with media', 'Download media', 'Download app update', 'Download media update' ].indexOf( key ) >= 0 ) JobAidPage.itemDownload(projDir, key, JobAidPage.itemJsonInMem[ projDir ] );
					else if (key === 'See content') JobAidContentPage.fileContentDialogOpen(projDir);
					else if (key === 'Delete') JobAidPage.itemDelete(projDir);
					else if (key === 'Open') JobAidPage.itemOpen(projDir);
				}
			};
		}
	});

};

// ------------------
// --- EVENTS

JobAidPage.itemOpen = function (projDir) 
{
	// Open JobAid iFrame Click - Up in iFrame Click Setup..
	var srcStr = JobAidPage.rootPath + projDir + '/index.html';
	var styleStr = 'width:100%; height: 100%; overflow:auto; border:none;';

	$('#divJobAid').html('').show().append(`<iframe class="jobAidIFrame" src="${srcStr}" style="${styleStr}">iframe not compatible..</iframe>`);
};

/*
			var srcStr = JobAidPage.rootPath + itemData.projDir + '/index.html';
			var styleStr = 'width:100%; height: 100%; overflow:auto; border:none;';

			$('#divJobAid').html('').show().append(`<iframe class="jobAidIFrame" src="${srcStr}" style="${styleStr}">iframe not compatible..</iframe>`);
*/

JobAidPage.itemDownload = function (projDir, key, buildDate) 
{
	if (projDir) 
	{
		var downloadOption = ''; // 'all';
		var buildDateOption = {};


		if ( key === 'Download w/o media' )
		{
			downloadOption = 'appOnly';
			if ( buildDate.appBuildDate ) buildDateOption.appBuildDate = buildDate.appBuildDate;
		} 
		else if ( key === 'Download app update' )
		{
			downloadOption = 'appOnly';
			if ( buildDate.updateAppBuildDate ) buildDateOption.updateAppBuildDate = buildDate.updateAppBuildDate;
		}
		else if ( key === 'Download media' )
		{
			downloadOption = 'mediaOnly';
			if ( buildDate.mediaBuildDate ) buildDateOption.mediaBuildDate = buildDate.mediaBuildDate;
		} 
		else if ( key === 'Download media update' )
		{
			downloadOption = 'mediaOnly';
			if ( buildDate.updateMediaBuildDate ) buildDateOption.updateMediaBuildDate = buildDate.updateMediaBuildDate;
		}
		else
		{
			downloadOption = 'all';
			if ( buildDate.appBuildDate ) buildDateOption.appBuildDate = buildDate.appBuildDate;
			if ( buildDate.mediaBuildDate ) buildDateOption.mediaBuildDate = buildDate.mediaBuildDate;	
		}


		// TODO: be able to pass the media options..  <-- only media, with media, without media
		JobAidHelper.runTimeCache_JobAid({ projDir: projDir, target: 'jobAidPage', downloadOption: downloadOption, buildDateOption: buildDateOption });

	}
	else MsgManager.msgAreaShowErr( 'Download Failed - Not proper pack name.' );
};


JobAidPage.itemDelete = function (projDir) 
{
	var itemData = Util.getFromList(JobAidPage.serverManifestsData, projDir, 'projDir');

	var result = confirm('Are you sure you want to delete this, "' + itemData.projDir + '"?');

	if (result) 
	{
		JobAidHelper.deleteCacheKeys(JobAidPage.rootPath + itemData.projDir + '/').then(function (deletedArr) 
		{
			// Delete on localStorage 'persisData'
			PersisDataLSManager.deleteJobFilingProjDir(itemData.projDir);

			JobAidPage.populateSectionLists(JobAidPage.contentBodyTag, function () {
				TranslationManager.translatePage();
			});

			// JobAidPage.updateSectionLists(itemData.projDir, 'downloaded_delete');

			MsgManager.msgAreaShow( 'The pack has been deleted' );
		});
	}
};


// =========================================

JobAidPage.getManifestJobAidInfo = function (list, option) 
{
	if ( !option ) option = {};

	var manifestsData = [];

	try 
	{
		if (Util.isTypeArray(list)) 
		{
			list.forEach(item => 
			{
				if (Util.isTypeObject(item.jobAidInfo)) 
				{
					var jobAidManifest = item.jobAidInfo;

					// If 'appBuildDate' is not available, and 'buildDate' exists, use that instead.
					if ( !jobAidManifest.appBuildDate && jobAidManifest.buildDate ) jobAidManifest.appBuildDate = jobAidManifest.buildDate;
					// What about media?  also use 'buildDate'?  No, not for now.					


					// #1. If persisStorage has this data, use that data instead!!!
					if ( jobAidManifest.projDir && option.mergeWithPersisStorageData )
					{
						var projStatus = JobAidPage.getProjStatus_PersisStorage( jobAidManifest.projDir );
						var infoColl = projStatus.infoCollect;
						if ( infoColl )
						{
							if ( infoColl.appBuildDate ) jobAidManifest.appBuildDate = infoColl.appBuildDate;
							if ( infoColl.mediaBuildDate ) jobAidManifest.mediaBuildDate = infoColl.mediaBuildDate;
							if ( infoColl.buildDate ) jobAidManifest.buildDate = infoColl.buildDate;
							// TODO: We can also add 'fileCount', 'fileSize' here..
						}
					}

					manifestsData.push(jobAidManifest);
				}
			});
		}
	}
	catch (errMsg) {
		console.log('ERROR in JobAidPage.getManifestJobAidInfo, ' + errMsg);
	}

	return manifestsData;
};


// ===================================================
// ======= infoCollect Management Related!!  (projStatus.infoCollect)

JobAidPage.infoCollect_update = function() { };
JobAidPage.infoCollect_downloadSet = function() { };  // some clearing of matching 'buildDate'

// ===================================================

JobAidPage.setUpPageContentLayout = function (contentBodyTag, divFileContentTag) {
	contentBodyTag.append(JobAidPage.templateSections);
	contentBodyTag.append( divFileContentTag );
};


// TODO: this only gets called once on page 'render' time..  NOT in each item move..
//		- We need to add same tag

// 'Available' - from Server Manifest Data, 'Downloaded' - from cached manifest.json files
JobAidPage.populateSectionLists = function (contentBodyTag, callBack) {
	var divAvailablePacksTag = contentBodyTag.find('div.divAvailablePacks'); //.html( '' );
	var divDownloadedPacksTag = contentBodyTag.find('div.divDownloadedPacks'); //.html( '' );

	JobAidPage.divAvailablePacksTag = divAvailablePacksTag;
	JobAidPage.divDownloadedPacksTag = divDownloadedPacksTag;


	// populate with data
	var loadingImageStr = '<img class="pin_pw_loading" src="images/loading_big_blue.gif" style="margin: 10px;"/>';

	// STEP 1. Get Server Manifests
	divAvailablePacksTag.append(loadingImageStr);

	JobAidPage.getServerManifestsRun(function (results) {
		divAvailablePacksTag.html(''); // Clear loading Img

		var list = results.list;
		JobAidPage.serverManifestsData = JobAidPage.getManifestJobAidInfo(list);

		// List All server manifest list - Available Packs
		JobAidPage.serverManifestsData.forEach(function (item) {
			var itemTag = $(JobAidPage.templateItem);
			JobAidPage.itemPopulate(item, itemTag, 'available');
			divAvailablePacksTag.append(itemTag);
		});


		// STEP 2. Get Cached Manifests & display/list them
		divDownloadedPacksTag.append(loadingImageStr);

		JobAidPage.getDeviceCache_Manifests(function (urlList) {
			var result = { arr: [], obj: {} };

			JobAidPage.performRetrieve_ManifestJsons(urlList, 0, result, function (result) 
			{
				divDownloadedPacksTag.html('');

				var manifests = JobAidPage.getManifestJobAidInfo(result.arr, { mergeWithPersisStorageData: true } );

				// Cached Item display
				manifests.forEach(function (item) 
				{
					var itemTag = $(JobAidPage.templateItem);
					JobAidPage.itemPopulate(item, itemTag, 'downloaded');
					divDownloadedPacksTag.append(itemTag);
				});

				if (callBack) callBack();
			});
		});
	});
};


// On 'available' download finish --> remove it from 'available' &
// we will need to refresh the cache list?  Or just add to the cached list??...
// OBSOLTE..
JobAidPage.updateSectionLists = function (projDir, statusType) {

	// TODO: 'item' is old data, thus, need to be updated...  + need to append with persis data..
	var item = Util.getFromList(JobAidPage.serverManifestsData, projDir, 'projDir');

	if (!item) alert('Not found the item, ' + projDir);
	else {
		if (statusType === 'available') 
		{
			// Fresh Download case: 'available' -> 'downloaded'
			JobAidPage.divAvailablePacksTag.find('div.jobAidItem[projDir=' + projDir + ']').remove();

			var itemTag = $(JobAidPage.templateItem);
			JobAidPage.itemPopulate(item, itemTag, 'downloaded');
			JobAidPage.divDownloadedPacksTag.append(itemTag);
		}
		else if (statusType === 'downloaded') 
		{
			// Download Update Caes: Reload with fresh status.

			var itemTag = JobAidPage.divDownloadedPacksTag.find('div.jobAidItem[projDir=' + projDir + ']').html('').append(JobAidPage.templateItem_body);

			JobAidPage.itemPopulate(item, itemTag, 'downloaded');
			JobAidPage.divDownloadedPacksTag.append(itemTag);
		}
		else if (statusType === 'downloaded_delete') 
		{
			JobAidPage.divDownloadedPacksTag.find('div.jobAidItem[projDir=' + projDir + ']').remove();

			// Also, Just In CASE, if there is available one, remove it as well
			JobAidPage.divAvailablePacksTag.find('div.jobAidItem[projDir=' + projDir + ']').remove();

			// Add to the cached..
			var itemTag = $(JobAidPage.templateItem);
			JobAidPage.itemPopulate(item, itemTag, 'available');
			JobAidPage.divAvailablePacksTag.append(itemTag);
		}
		else {
			alert('itemCard statusType not known, ' + statusType);
		}
	}

	TranslationManager.translatePage();
};


// -------------------------------------

JobAidPage.itemPopulate = function (itemData, itemTag, statusType) {
	var menus = [];

	if ( !itemData.projDir ) MsgManager.msgAreaShowErr( 'FAILED to populate item - NO "projDir"' );
	else
	{
		// reset 'itemData' for this projDir
		JobAidPage.itemJsonInMem[ itemData.projDir ] = {};
		var itemJsonInMem = JobAidPage.itemJsonInMem[ itemData.projDir ];
		itemJsonInMem.statusType = statusType;

		if ( itemData.appBuildDate ) itemJsonInMem.appBuildDate = itemData.appBuildDate;
		if ( itemData.mediaBuildDate ) itemJsonInMem.mediaBuildDate = itemData.mediaBuildDate;
		

		// type = 'available' vs 'downloaded'  // itemData = {code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false };
		itemTag.off('click'); // reset previous click if exists.
		itemTag.attr('data-language', itemData.code);
		itemTag.attr('projDir', itemData.projDir);
		itemTag.attr('statusType', statusType);
	
	
		var titleStrongTag = $('<strong></strong>').append(itemData.title + ' [' + Util.getStr(itemData.language) + ']');
		// if (itemData.noMedia) titleStrongTag.append(' [WITHOUT MEDIA]');
	
	
		itemTag.find('.divTitle').append(titleStrongTag);
	
		itemTag.find('.divBuildDate').append('<strong>Release date: </strong>' + UtilDate.formatDate( Util.getStr(itemData.appBuildDate), "MMM dd, yyyy" ) );
	
		var divDownloadInfoTag = itemTag.find('.divDownloadInfo').html('<span class="downloadInfo"></span>');
		var spanDownloadInfoTag = divDownloadInfoTag.find( 'span.downloadInfo' );
		var spanAppDownloadStatusTag = $( '<span class="appDownloadStatus downloadStatus"></span>' ).hide();
		divDownloadInfoTag.append( spanAppDownloadStatusTag );
	
		var divDownloadFilesTag = itemTag.find('.divDownloadFiles').html('<span><strong>Files</strong>: </span>').hide();
		var divMediaStatusTag = itemTag.find( '.divMediaStatus').html('<span><strong>Media</strong>(mp3/mp4): </span>').hide();
	
		if (statusType === 'available') 
		{
			// CHANGED: ALWAYS ASSUME THERE IS MEDIA IN ALL PACKAGE.
			//if ( itemData.noMedia === false ) // display both types
			menus.push('Download w/o media');
			menus.push('Download with media');
			//}
			//else menus.push('Download');
	
			spanDownloadInfoTag.html( '<strong>Download size: </strong>' + Util.getStr(itemData.size) );	
		}
		// Downloaded Case - 'open' in iFrame case, 'delete' case.
		else if (statusType === 'downloaded') 
		{
			menus.push( 'Open')
			menus.push('See content'); 
	
			var downloadDate = '';
			var totalSize = 0;
			var fileCountAll = 0;
			var fileCountDownloaded = 0;
			var mediaStr = ''; //<span>exists</span>';
	 
	
			// From Extra info for thie 'projDir', update info..
			var projStatus = JobAidPage.getProjStatus_PersisStorage(itemData.projDir);
			if ( projStatus.infoCollect )
			{
				totalSize = projStatus.infoCollect.totalSize;
				fileCountAll = projStatus.infoCollect.fileCountAll;
				fileCountDownloaded = projStatus.infoCollect.fileCountDownloaded;

				downloadDate = Util.getStr( projStatus.infoCollect.downloadDate );
	
				if ( projStatus.infoCollect.mediaDownloaded ) 
				{
					mediaStr = '<span>exists</span>';	
				}
				else 
				{
					menus.push( 'Download media' );
					mediaStr = '<span>pending</span>';	
				}
			}
	
	
			spanDownloadInfoTag.html( '<strong>Downloaded: </strong>' +  UtilDate.formatDate( downloadDate, "MMM dd, yyyy" ) );	
	
			divDownloadFilesTag.show().append( fileCountDownloaded + '/' + fileCountAll + ' | ' + Util.formatFileSizeMB( totalSize ) );
			divMediaStatusTag.show().append( mediaStr );
			var spanMediaDownloadStatusTag = $('<span class="mediaDownloadStatus downloadStatus"></span>').hide();
			divMediaStatusTag.append( spanMediaDownloadStatusTag );
	
			// 2. Setup for match found things...
			var matchData = JobAidPage.matchInServerList(itemData, JobAidPage.serverManifestsData);
	
			if (matchData.matchProj) 
			{
				// Remove from available side - when we add this on 'downloaded' side
				JobAidPage.divAvailablePacksTag.find('div.jobAidItem[projDir="' + itemData.projDir + '"]').remove();
	
				if (matchData.appNewerDate) 
				{
					menus.push('Download app update');
					spanAppDownloadStatusTag.show().text( '[App update available]' );
					itemJsonInMem.updateAppBuildDate = matchData.appNewerDate;
				}
	
				if (matchData.mediaNewerDate) 
				{
					menus.push('Download media update');
					spanMediaDownloadStatusTag.show().text( '[Media update available]' );
					itemJsonInMem.updateMediaBuildDate = matchData.mediaNewerDate;
				}
			}
	
			menus.push('Delete');
		}
	
		var menusStr = menus.join(';');
		itemTag.attr('menus', menusStr);
	}
};

// ------------------------------------

JobAidPage.matchInServerList = function (item, serverManifestsData) {
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


JobAidPage.getDeviceCache_Manifests = function (callBack) {
	JobAidHelper.getCacheKeys(function (keys) {
		var urlList = [];

		if (Util.isTypeArray(keys)) {
			keys.forEach(request => {
				var url = JobAidHelper.modifyUrlFunc(request.url);
				if (url.indexOf('/manifest.json') > 0) urlList.push(url);
			});
		}

		callBack(urlList);
	});
};


JobAidPage.performRetrieve_ManifestJsons = function (urlList, i, result, finishCallBack) {
	try {
		if (i >= urlList.length) finishCallBack(result);
		else {
			var url = urlList[i];

			RESTCallManager.performGet(url, {}, function (success, returnJson) {
				if (success && returnJson) {
					result.arr.push(returnJson);
					result.obj[url] = returnJson;
				}

				JobAidPage.performRetrieve_ManifestJsons(urlList, i + 1, result, finishCallBack); // regardless of success/fail, add to the count.
			});
		}
	}
	catch (errMsg) {
		console.log('ERROR in JobAidPage.performRetrieve_ManifestJsons, ' + errMsg);
		finishCallBack(result);
	}
};


// ------------------------------------

JobAidPage.getProjCardTag = function (projDir) {
	return $('div.jobAidItem[projDir=' + projDir + ']');
};

// -------------------------------------------------
// --- Download Msg Progress Updates ---

JobAidPage.jobFilingUpdate = async function (msgData) {
	// msgData: { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options }    

	var projDir = msgData.options.projDir;
	var projCardTag = JobAidPage.getProjCardTag(projDir); // $( 'div.card[projDir=' + msgData.options.projDir + ']' );

	if (projCardTag.length > 0) 
	{
		var downloadOption = msgData.options.downloadOption;
		var buildDateOption = msgData.options.buildDateOption;
		
		var mediaDownloadCase = false;

		// Get the right tag
		var spanDownloadStatusTag;  // var spanDownloadStatusTag = projCardTag.find('span.downloadStatus');
		if ( !downloadOption || downloadOption === 'all' ) spanDownloadStatusTag = projCardTag.find('span.appDownloadStatus,span.mediaDownloadStatus').show();
		else if ( downloadOption === 'appOnly' ) spanDownloadStatusTag = projCardTag.find('span.appDownloadStatus').show();
		else if ( downloadOption === 'mediaOnly' ) spanDownloadStatusTag = projCardTag.find('span.mediaDownloadStatus').show();

		if ( !downloadOption || downloadOption === 'all' || downloadOption === 'mediaOnly' ) mediaDownloadCase = true; 


		var prc = msgData.process;

		if (prc.name && prc.total && prc.total > 0 && prc.curr) 
		{
			var url = prc.name;

			// update the downloaded status on storage..
			JobAidPage.projProcessDataUpdate(projDir, url, { date: new Date().toISOString(), downloaded: true });


			if (prc.curr < prc.total) 
			{
				spanDownloadStatusTag.html(`<strong>Processing:<strong> ${prc.curr} of ${prc.total} [${url.split('.').at(-1)}]`);
				if (prc.curr > 5) projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
				projCardTag.css('opacity', 1);
			}
			else 
			{
				// === DOWNLOAD 'FINISH' OPERATION STEPS ===

				spanDownloadStatusTag.html('<strong>Download completed!</strong>');
				projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
				projCardTag.css('opacity', 1);

				// Calculate the files size here and place it on 'persisData'
				var spanCalTag = $( '<span class="spanCalTag">Calculating size of files</span>' );
				spanDownloadStatusTag.append( spanCalTag );
				await JobAidPage.onDownloaded_updateInPersisStorage(projDir, mediaDownloadCase, buildDateOption);
				spanCalTag.text( 'Calculation finished.' );
				
				// We need to refresh the list...
				// JobAidPage.updateSectionLists(projDir, projCardTag.attr('statusType'));
				JobAidPage.populateSectionLists(JobAidPage.contentBodyTag, function () {
					TranslationManager.translatePage();
				});				
			}
		}
	}
};

// Called when download is finished.
JobAidPage.onDownloaded_updateInPersisStorage = async function(projDir, mediaDownloadCase, buildDateOption)
{
	var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);

	if ( projStatus.process )
	{
		if ( !projStatus.infoCollect ) projStatus.infoCollect = {}; // totalSize: 0, fileCountAll: 0, fileCountDownloaded: 0, downloadDate: new Date().toISOString() };
		projStatus.infoCollect.downloadDate = new Date().toISOString();

		// 1. File size - individual ones calculate & save.  Total size calc.
		try {
			projStatus.infoCollect.totalSize = await JobAidPage.projProcessData_calcFileSize(projDir, projStatus.process);
		}
		catch( errMsg ) { console.log( 'ERROR in JobAidPage.projProcessData_calcFileSize, ' + errMsg ); };
	
	
		// 2. File count - total vs downloaded.
		var valObjArr = Object.values( projStatus.process );

		projStatus.infoCollect.fileCountAll = valObjArr.length;
		projStatus.infoCollect.fileCountDownloaded = valObjArr.filter( valObj => valObj.downloaded === true ).length;
		if ( mediaDownloadCase === true ) projStatus.infoCollect.mediaDownloaded = true;


		// 3. buildDate update
		if ( buildDateOption )
		{
			if ( buildDateOption.appBuildDate ) projStatus.infoCollect.appBuildDate = buildDateOption.appBuildDate;
			if ( buildDateOption.updateAppBuildDate ) projStatus.infoCollect.appBuildDate = buildDateOption.updateAppBuildDate;
			if ( buildDateOption.mediaBuildDate ) projStatus.infoCollect.mediaBuildDate = buildDateOption.mediaBuildDate;
			if ( buildDateOption.updateMediaBuildDate ) projStatus.infoCollect.mediaBuildDate = buildDateOption.updateMediaBuildDate;
		}


		PersisDataLSManager.updateJobFilingProjDirStatus(projDir, projStatus);		
	}
};

JobAidPage.getProjStatus_PersisStorage = function(projDir)
{
	var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);

	if ( !projStatus ) projStatus = {};
	if ( !projStatus.process ) projStatus.process = {};
	if ( !projStatus.infoCollect ) projStatus.infoCollect = {};

	return projStatus;
};


JobAidPage.projProcessData_calcFileSize = async function (projDir, process) //projStatus) 
{
	//var tempJson = {};
	var totalSize = 0;
	var cacheKeyJson = await JobAidHelper.getCacheKeys_async();
	var keys = cacheKeyJson.keys;
	var cache = cacheKeyJson.cache;

	// JobAidHelper.getCacheKeys(function (keys, cache) {
	var statusFullJson = JobAidHelper.getJobFilingStatusIndexed();

	if (keys && keys.length > 0) 
	{
		for ( var i = 0; i < keys.length; i++ )
		{
			var request = keys[i];

			var url = JobAidHelper.modifyUrlFunc(request.url);

			// If the file is within 'projDir', get size
			if (url.indexOf('jobs/jobAid/' + projDir) >= 0) 
			{
				var itemJson = { url: url };
				// Check the storage and add additional info
				JobAidHelper.setExtraStatusInfo(itemJson, statusFullJson);

				var response = await cache.match(request);
				var myBlob = await response.clone().blob();
				var size = myBlob.size;   // tempJson[url] = size;

				totalSize += size;

				// update to jobData -- // JobAidPage.projProcessDataUpdate(projDir, url, { size: size });	
				if ( process[url] )  Util.mergeJson( process[url], { size: size } );
			}
		}
	}

	return totalSize;
	//return tempJson;
};


JobAidPage.projProcessDataUpdate = function (projDir, url, updateJson) 
{
	try {
		if (projDir && url && updateJson) {
			var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);

			if (projStatus.process && projStatus.process[url]) {
				var item = projStatus.process[url];

				Util.mergeJson(item, updateJson);

				PersisDataLSManager.updateJobFilingProjDirStatus(projDir, projStatus);
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in JobAidHelper.projProcessDataUpdate, ' + errMsg);
	}
};

// ------------------------------------

JobAidPage.getServerManifestsRun = function( callBack )
{
	if ( ConnManagerNew.isAppMode_Online() )
	{
		var options = { projDir: '', isListingApp: false, isLocal: true, appName: 'pwa-dev' };
		options.isLocal = WsCallManager.checkLocalDevCase( window.location.origin );
	
		var requestUrl = (options.isLocal) ? 'http://localhost:8383/manifests' : WsCallManager.composeDwsWsFullUrl('/TTS.jobsManifests')
		requestUrl = WsCallManager.localhostProxyCaseHandle( requestUrl ); // Add Cors sending IF LOCAL
	
		var optionsStr = JSON.stringify( options );
	
		$.ajax({
			url: requestUrl + '?optionsStr=' + encodeURIComponent( optionsStr ),
			type: "GET",
			dataType: "json",
			success: function (response) 
			{
	
				// TODO: 
	
				// console.log( 'success: ' );  console.log( response );
				if ( callBack ) callBack( response );
			},
			error: function ( error ) {
				console.log( 'error: ' );
				console.log( error );
				MsgManager.msgAreaShowErr( 'FAILED on getServerManifestsRun' );			
			},
			complete: function () { }			
		});
	}
	else
	{
		if ( callBack ) callBack( { list: [] } );
	}
};

// ------------------------------------

JobAidPage.templateSections = `
   <div class="sectionTitle_jobAid">Downloaded packs</div>
   <div class="divDownloadedPacks">
   </div>

   <div class="sectionTitle_jobAid">Packs available for download</div>
   <div class="divAvailablePacks">
   </div>
`;

JobAidPage.templateItem_body = `
   <div class="card__container">
      <card__support_visuals class="card__support_visuals" style="padding-left: 4px;"><img src="images/JobAidicons.png"></card__support_visuals>
      <card__content class="card__content jaCardContent">
         <div class="card__row divTitle"></div>
         <div class="card__row divBuildDate"></div>
         <div class="card__row divDownloadInfo"></div>
         <div class="card__row divDownloadFiles"></div>
         <div class="card__row divMediaStatus"></div>
      </card__content>
      <card__cta class="card__cta">
         <!--div class="download" style="padding: 18px; cursor: pointer;"><img src="images/appIcons/downloadIcon.png"></div-->
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

// ---------------------------------
// --- Content Page Related

JobAidPage.contentPage_tableTag = `<table class="jobFileContentTable"><tbody></tbody></table>`;

JobAidPage.contentPage_row1Tag = `
<tr class="trJobFileR1">
	<td colspan="4">
		<div class="jfTitle">File Name</div>
		<div class="divFileNameVal jfVal"></div>
	</td>
</tr>`;

JobAidPage.contentPage_row2Tag = `
<tr class="trJobFileR2">
	<td>
		<div class="jfTitle">Folder</div>
		<div class="divFileFolderVal jfVal"></div>
	</td>
	<td>
		<div class="jfTitle">Content-Type</div>
		<div class="divFileContentTypeVal jfVal"></div>
	</td>
	<td>
		<div class="jfTitle">Caching time</div>
		<div class="divFileCachingTimeVal jfVal"></div>
	</td>
	<td>
		<div class="jfTitle">Content-Length</div>
		<div class="divFileContentLengthVal jfVal"></div>
	</td>
</tr>`;
