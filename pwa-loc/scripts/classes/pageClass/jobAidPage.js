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
					if ( ['Download', 'Download update', 'Download w/o media', 'Download with media', 'Download media'].indexOf( key ) >= 0 ) JobAidPage.itemDownload(projDir, key);
					else if (key === 'See content') JobAidPage.fileContentDialogOpen(projDir);
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

JobAidPage.itemDownload = function (projDir, key) 
{
	// if (key === 'Download' || 'Download update' || 'Download w/o media' || 'Download with media' )
	var downloadOption = 'all';
	if ( key === 'Download w/o media' ) downloadOption = 'woMedia';	// Need to flag the proj about this...  <-- INFO?  outside of process?
	else if ( key === 'Download media' ) downloadOption = 'addMedia';  // Should not clear out existing download info..
	
	// TODO: be able to pass the media options..  <-- only media, with media, without media
	if (projDir) JobAidHelper.runTimeCache_JobAid({ projDir: projDir, target: 'jobAidPage', downloadOption: downloadOption });
	else MsgManager.msgAreaShowErr( 'Download Failed - Not proper pack name.' );
};

JobAidPage.fileContentDialogOpen = async function(projDir) 
{
	// JobAidPage.contentPageTag
	var divDialogTag = FormUtil.sheetFullSetup(Templates.sheetFullFrame, {'title': 'JobAid Content - ' + projDir, 'term': '', 'cssClasses': ['divJobAidContentPage'] });

	var divMainContentTag = divDialogTag.find('.contentBody');

	var projDirStatus = PersisDataLSManager.getJobFilingProjDirStatus( projDir );
	//console.log( projDirStatus );

	if ( projDirStatus && projDirStatus.process )
	{
		var processData = projDirStatus.process;

		// Display the content..
		JobAidPage.populateFileContent(divMainContentTag, processData);
	}
	else MsgManager.msgAreaShowErr( 'No project data available.' );


	TranslationManager.translatePage();
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

			JobAidPage.updateSectionLists(itemData.projDir, 'downloaded_delete');

			MsgManager.msgAreaShow( 'The pack has been deleted' );
		});
	}
};


// =========================================

JobAidPage.getManifestJobAidInfo = function (list) {
	var manifestsData = [];

	try {
		if (Util.isTypeArray(list)) {
			list.forEach(item => {
				if (Util.isTypeObject(item.jobAidInfo)) manifestsData.push(item.jobAidInfo);
			});
		}
	}
	catch (errMsg) {
		console.log('ERROR in JobAidPage.getManifestJobAidInfo, ' + errMsg);
	}

	return manifestsData;
};


JobAidPage.setUpPageContentLayout = function (contentBodyTag, divFileContentTag) {
	contentBodyTag.append(JobAidPage.templateSections);
	contentBodyTag.append( divFileContentTag );
};


// TODO: this only gets called once on page 'render' time..  NOT in each item move..
//		- We need to add same tag

JobAidPage.populateSectionLists = function (contentBodyTag, callBack) {
	var divAvailablePacksTag = contentBodyTag.find('div.divAvailablePacks'); //.html( '' );
	var divDownloadedPacksTag = contentBodyTag.find('div.divDownloadedPacks'); //.html( '' );

	JobAidPage.divAvailablePacksTag = divAvailablePacksTag;
	JobAidPage.divDownloadedPacksTag = divDownloadedPacksTag;


	// populate with data
	var loadingImageStr = '<img class="pin_pw_loading" src="images/loading_big_blue.gif" style="margin: 10px;"/>';

	// STEP 1. Get Server Manifests
	divAvailablePacksTag.append(loadingImageStr);

	JobAidHelper.getServerManifestsRun(function (results) {
		divAvailablePacksTag.html(''); // Clear loading Img

		var list = results.list;
		JobAidPage.serverManifestsData = JobAidPage.getManifestJobAidInfo(list);

		// List All server manifest list - Available Packs
		JobAidPage.serverManifestsData.forEach(function (item) {
			var itemTag = $(JobAidPage.templateItem);
			JobAidPage.populateItem(item, itemTag, 'available');
			divAvailablePacksTag.append(itemTag);
		});


		// STEP 2. Get Cached Manifests & display/list them
		divDownloadedPacksTag.append(loadingImageStr);

		JobAidPage.getCachedFileUrlList(function (urlList) {
			var result = { arr: [], obj: {} };

			JobAidPage.getManifestJsons(urlList, 0, result, function (result) 
			{
				divDownloadedPacksTag.html('');

				var manifests = JobAidPage.getManifestJobAidInfo(result.arr);

				// Cached Item display
				manifests.forEach(function (item) 
				{
					var itemTag = $(JobAidPage.templateItem);
					JobAidPage.populateItem(item, itemTag, 'downloaded');
					divDownloadedPacksTag.append(itemTag);
				});

				if (callBack) callBack();
			});
		});
	});
};


// On 'available' download finish --> remove it from 'available' &
// we will need to refresh the cache list?  Or just add to the cached list??...
JobAidPage.updateSectionLists = function (projDir, statusType) {
	var item = Util.getFromList(JobAidPage.serverManifestsData, projDir, 'projDir');

	if (!item) alert('Not found the item, ' + projDir);
	else {
		if (statusType === 'available') 
		{
			// Fresh Download case: 'available' -> 'downloaded'
			JobAidPage.divAvailablePacksTag.find('div.jobAidItem[projDir=' + projDir + ']').remove();

			var itemTag = $(JobAidPage.templateItem);
			JobAidPage.populateItem(item, itemTag, 'downloaded');
			JobAidPage.divDownloadedPacksTag.append(itemTag);
		}
		else if (statusType === 'downloaded') 
		{
			// Download Update Caes: Reload with fresh status.

			var itemTag = JobAidPage.divDownloadedPacksTag.find('div.jobAidItem[projDir=' + projDir + ']').html('').append(JobAidPage.templateItem_body);

			JobAidPage.populateItem(item, itemTag, 'downloaded');
			JobAidPage.divDownloadedPacksTag.append(itemTag);
		}
		else if (statusType === 'downloaded_delete') 
		{
			JobAidPage.divDownloadedPacksTag.find('div.jobAidItem[projDir=' + projDir + ']').remove();

			// Also, Just In CASE, if there is available one, remove it as well
			JobAidPage.divAvailablePacksTag.find('div.jobAidItem[projDir=' + projDir + ']').remove();

			// Add to the cached..
			var itemTag = $(JobAidPage.templateItem);
			JobAidPage.populateItem(item, itemTag, 'available');
			JobAidPage.divAvailablePacksTag.append(itemTag);
		}
		else {
			alert('itemCard statusType not known, ' + statusType);
		}
	}

	TranslationManager.translatePage();
};


// -------------------------------------

JobAidPage.populateItem = function (itemData, itemTag, statusType) {
	var menus = [];

	// type = 'available' vs 'downloaded'
	// itemData = {code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false };
	// status, buildDate,       
	itemTag.off('click'); // reset previous click if exists.


	itemTag.attr('data-language', itemData.code);
	itemTag.attr('projDir', itemData.projDir);
	itemTag.attr('statusType', statusType);


	var titleStrongTag = $('<strong></strong>').append(itemData.title + ' [' + Util.getStr(itemData.language) + ']');
	if (itemData.noMedia) titleStrongTag.append(' [WITHOUT MEDIA]');


	itemTag.find('.divTitle').append(titleStrongTag);

	itemTag.find('.divBuildDate').append('<strong>Release date: </strong>' + UtilDate.formatDate( Util.getStr(itemData.buildDate), "MMM dd, yyyy" ) );

	var divDownloadInfoTag = itemTag.find('.divDownloadInfo').html('');
	var divDownloadFilesTag = itemTag.find('.divDownloadFiles').html('<span><strong>Files</strong>: </span>').hide();
	var divMediaStatusTag = itemTag.find( '.divMediaStatus').html('<span><strong>Media</strong>(mp3/mp4): </span>').hide();

	if (statusType === 'available') 
	{
		if ( itemData.noMedia === false ) // display both types
		{
			menus.push('Download w/o media');
			menus.push('Download with media');
		}
		else menus.push('Download');

		divDownloadInfoTag.append('<span class="downloadInfo"><strong>Download size: </strong>' + Util.getStr(itemData.size) + '</span> <span class="downloadStatus"></span>' );	
	}
	// Downloaded Case - 'open' in iFrame case, 'delete' case.
	else if (statusType === 'downloaded') 
	{
		menus.push('See content'); 

		var downloadDate = '';
		var totalSize = 0;
		var fileCountAll = 0;
		var fileCountDownloaded = 0;
		var mediaStr = '<span>exists</span>';

		var projStatus = PersisDataLSManager.getJobFilingProjDirStatus( itemData.projDir );
		if ( projStatus )
		{
			if ( projStatus.downloadOption === 'woMedia' )
			{
				menus.push( 'Download media' );
				mediaStr = '<span>pending</span>';
			}

			if ( projStatus.infoCollect )
			{
				totalSize = projStatus.infoCollect.totalSize;
				fileCountAll = projStatus.infoCollect.fileCountAll;
				fileCountDownloaded = projStatus.infoCollect.fileCountDownloaded;
				downloadDate = Util.getStr( projStatus.infoCollect.downloadDate );
			}
		}

		divDownloadInfoTag.append('<span class="downloadInfo"><strong>Downloaded: </strong>' +  UtilDate.formatDate( downloadDate, "MMM dd, yyyy" ) + '</span> <span class="downloadStatus"></span>' );	

		divDownloadFilesTag.show().append( fileCountDownloaded + '/' + fileCountAll + ' | ' + Util.formatFileSizeMB( totalSize ) );
		divMediaStatusTag.show().append( mediaStr );	


		// 2. Setup for match found things...
		var matchData = JobAidPage.matchInServerList(itemData, JobAidPage.serverManifestsData);

		if (matchData.matchProj) 
		{
			// Remove from available side - when we add this on 'downloaded' side
			JobAidPage.divAvailablePacksTag.find('div.jobAidItem[projDir="' + itemData.projDir + '"]').remove();

			if (matchData.newerDate) 
			{
				menus.push('Download updates');

				var updateSpanTag = $('<span class="" style="margin-left: 14px; color: blue;">[update available]</span>');
				itemTag.find('span.downloadInfo').append(updateSpanTag);
			}
		}

		menus.push('Delete');
	}

	var menusStr = menus.join(';');
	itemTag.attr('menus', menusStr);
};

// ------------------------------------

JobAidPage.matchInServerList = function (item, serverManifestsData) {
	var matchData = { matchProj: false, newerDate: false };

	serverManifestsData.forEach(srvItem => {
		if (srvItem.projDir === item.projDir) {
			matchData.matchProj = true;
			matchData.newerDate = (srvItem.buildDate > item.buildDate);
		}
	});

	return matchData;
};


JobAidPage.getCachedFileUrlList = function (callBack) {
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


JobAidPage.getManifestJsons = function (urlList, i, result, finishCallBack) {
	try {
		if (i >= urlList.length) finishCallBack(result);
		else {
			var url = urlList[i];

			RESTCallManager.performGet(url, {}, function (success, returnJson) {
				if (success && returnJson) {
					result.arr.push(returnJson);
					result.obj[url] = returnJson;
				}

				JobAidPage.getManifestJsons(urlList, i + 1, result, finishCallBack); // regardless of success/fail, add to the count.
			});
		}
	}
	catch (errMsg) {
		console.log('ERROR in JobAidPage.getManifestJsons, ' + errMsg);
		finishCallBack(result);
	}
};


// ------------------------------------

JobAidPage.getProjCardTag = function (projDir) {
	return $('div.jobAidItem[projDir=' + projDir + ']');
};

// ---------------------------------------------------
// --- CREATE IT'S OWN CLASS??

JobAidPage.populateFileContent = function(divMainContentTag, processData) 
{
	divMainContentTag.html('');

	var tableTag = $( JobAidPage.contentPage_tableTag );
	var tbodyTag = tableTag.find('tbody');
	divMainContentTag.append( tableTag );

	for ( var url in processData )
	{
		var fileItem = processData[url];
		fileItem.url = url;
		
		JobAidPage.populateFileItemInfo(fileItem, tbodyTag);
	}
};


JobAidPage.populateFileItemInfo = function(fileItem, tbodyTag)
{
	var row1Tag = $( JobAidPage.contentPage_row1Tag );
	var row2Tag = $( JobAidPage.contentPage_row2Tag );

	// Row 1 - populate data in tags..
	JobAidPage.setUrlCol( fileItem.url, row1Tag.find( 'div.divFileNameVal' ) );

	// Row 2 - date, size
	var dateFormatted = UtilDate.formatDate( Util.getStr(fileItem.date), "yyyy/MM/dd HH:mm:ss" );
	row2Tag.find( 'div.divFileCachingTimeVal' ).append(dateFormatted).attr('title', 'date: ' + fileItem.date);

	var sizeFormatted = Util.formatFileSizeMB( fileItem.size );
	row2Tag.find( 'div.divFileContentLengthVal' ).append(sizeFormatted).attr('title', 'size: ' + fileItem.size);


	tbodyTag.append( row1Tag );
	tbodyTag.append( row2Tag );
};


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



JobAidPage.setUrlCol = function(colVal_full, tdTag) 
{
	if (colVal_full !== undefined)
	{
		var strArr = colVal_full.split('/');
		var lastIdx = strArr.length - 1;
		var colVal_short = strArr[lastIdx];
	
		var displayName = Util.shortenFileName( colVal_short, 40 );

		tdTag.append(displayName).attr('title',  'name: ' + colVal_short ); //colVal_full);
	
	
		var isAudio = Util.endsWith_Arr(colVal_short, JobAidHelper.EXTS_AUDIO, { upper: true });
		var isVideo = Util.endsWith_Arr(colVal_short, JobAidHelper.EXTS_VIDEO, { upper: true });
	
		if (isAudio || isVideo) 
		{
			colVal_full = colVal_full.replace('/jobs/', '');
	
			tdTag.css('cursor', 'pointer').css('color', (isAudio) ? 'cadetblue' : 'blue');
			tdTag.attr('play_type', (isAudio) ? 'audio' : 'video').attr('play_full', colVal_full);
	
			tdTag.click(function () 
			{
				var divPopupVideoTag = $('#divPopupVideo');
				var divMainContentTag = divPopupVideoTag.find('div.divMainContent');
				divMainContentTag.html('');
	
				var thisTag = $(this);
				var play_full = thisTag.attr('play_full');
				var play_type = thisTag.attr('play_type');
	
				if (play_type === 'audio') divMainContentTag.append('<audio controls><source src="' + play_full + '" >Your browser does not support the audio element.</audio>');
				else if (play_type === 'video') divMainContentTag.append('<video src="' + play_full + '" preload="auto" controls="" style="width: 100%; height: 100%;"></video>');
	
				// Add close event
				divPopupVideoTag.find('div.close').off('click').click(function () {
					divPopupVideoTag.hide();
				});
	
				divPopupVideoTag.show();
			});
		}
	}
};


// -------------------------------------------------
// --- Download Msg Progress Updates ---

JobAidPage.jobFilingUpdate = async function (msgData) {
	// msgData: { type: 'jobFiling', process: { total: totalCount, curr: doneCount, name: reqUrl }, options: options }    

	var projDir = msgData.options.projDir;
	var projCardTag = JobAidPage.getProjCardTag(projDir); // $( 'div.card[projDir=' + msgData.options.projDir + ']' );

	if (projCardTag.length > 0) {
		var spanTag = projCardTag.find('span.downloadStatus');

		var prc = msgData.process;

		if (prc.name && prc.total && prc.total > 0 && prc.curr) {
			var url = prc.name;

			// console.log( prc );
			// update the downloaded status on storage..
			JobAidPage.projProcessDataUpdate(projDir, url, { date: new Date().toISOString(), downloaded: true });


			if (prc.curr < prc.total) {
				spanTag.html(`<strong>Processing:<strong> ${prc.curr} of ${prc.total} [${url.split('.').at(-1)}]`);
				if (prc.curr > 5) projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
				projCardTag.css('opacity', 1);
			}
			else {

				// Calculate the files size here and place it on 'persisData'
				await JobAidPage.updateFilesInfo(projDir);

				spanTag.html('<strong>Download completed!</strong>');
				projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
				projCardTag.css('opacity', 1);


				// We need to refresh the list...
				JobAidPage.updateSectionLists(projDir, projCardTag.attr('statusType'));
			}
		}
	}
};

JobAidPage.updateFilesInfo = async function(projDir)
{
	var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);

	if ( projStatus.process )
	{
		projStatus.infoCollect = { totalSize: 0, fileCountAll: 0, fileCountDownloaded: 0, downloadDate: new Date().toISOString() };  // Diff from data from manifest..

		// 1. File size - individual ones calculate & save.  Total size calc.
		try {
			projStatus.infoCollect.totalSize = await JobAidPage.projProcessData_calcFileSize(projDir, projStatus.process);
		}
		catch( errMsg ) { console.log( 'ERROR in JobAidPage.projProcessData_calcFileSize, ' + errMsg ); };
	
	
		// 2. File count - total vs downloaded.
		var valObjArr = Object.values( projStatus.process );

		projStatus.infoCollect.fileCountAll = valObjArr.length;
		projStatus.infoCollect.fileCountDownloaded = valObjArr.filter( valObj => valObj.downloaded === true ).length;

		PersisDataLSManager.updateJobFilingProjDirStatus(projDir, projStatus);		
	}
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
      <card__content class="card__content" style="padding-left: 4px;">
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



// ----------------------------------------

JobAidPage.divTablePopulate_BACK = function(colNames, arrData, urlArr) {
	var tableTag = $('<table class="contentTable"><tbody></tbody></table>');
	var tbodyTag = tableTag.find('tbody');

	// 1. Header Rows      
	var rowHeaderTag = $('<tr style="background-color: darkgray; color: #555; font-weight: 500;"></tr>');
	tbodyTag.append(rowHeaderTag);

	rowHeaderTag.append('<td>name</td>');

	for (var p = 0; p < colNames.length; p++) {
		var colName = colNames[p];

		if ( colName === 'downloaded' ) colName = 'down';

		var tdTag = $('<td></td>').append(colName);

		if (colName === 'size') tdTag.css('width', '70px');
		else if (colName === 'down') tdTag.css('width', '50px').attr( 'title', 'downloaded' );

		rowHeaderTag.append(tdTag);
	}


	// 2. Body Rows.
	for (var i = arrData.length - 1; i >= 0; i--) {
		var rowData = arrData[i]; // arrary of column
		var url = urlArr[i];

		var rowTag = $('<tr></tr>');
		tbodyTag.append(rowTag);

		var downloadedVal = false;


		// URL column Populate
		var tdUrlTag = $('<td></td>');
		rowTag.append( tdUrlTag );

		JobAidPage.setUrlCol( url, tdUrlTag );


		// Rest of the columns populate
		for (var p = 0; p < colNames.length; p++) 
		{
			var colName = colNames[p];

			var colVal_full = rowData[colName];
			var colVal_short = colVal_full;

			var tdTag = $('<td></td>');

			if (colName === 'size') {
				tdTag.css('width', '70px');
				colVal_short = Util.formatFileSizeMB( colVal_short );
			}
			else if (colName === 'downloaded') {
				tdTag.css('width', '50px');
				if (colVal_full == true) downloadedVal = true;
			}
			else if ( colName === 'date' )
			{
				colVal_short = UtilDate.formatDate( Util.getStr(colVal_short), "MMM dd, yy, HH:mm" );
			}

			if (colVal_full !== undefined) tdTag.append(colVal_short).attr('title', colName + ': ' + colVal_full);

			rowTag.append(tdTag);
		}

		if (!downloadedVal) rowTag.css('background-color', 'tomato');
	}

	return tableTag;
};
