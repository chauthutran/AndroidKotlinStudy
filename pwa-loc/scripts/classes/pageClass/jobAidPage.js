function JobAidPage() { };

JobAidPage.options = {
	'title': 'Job Aid',
	'term': 'form_title_jobAid',
	'cssClasses': ['divJobAidPage'],
	'zIndex': 1600
};

JobAidPage.rootPath = '/jobs/jobAid/';

JobAidPage.sheetFullTag;
JobAidPage.contentBodyTag;
JobAidPage.divAvailablePacksTag;
JobAidPage.divDownloadedPacksTag;

JobAidPage.serverManifestsData = [];
/*
JobAidPage.availableVersions = [
	{code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false },
	{code:"EN_LOW" , language:"English", projDir:"EN_LOW", size:"74MB", noMedia:true },
	{code:"AM" , language:"Amharic", projDir:"AM", size:"455MB", noMedia:false },
	{code:"AM_LOW" , language:"Amharic", projDir:"AM_LOW", size:"74MB", noMedia:true },
	{code:"OM" , language:"Oromo", projDir:"OM", size:"396MB", noMedia:false },
	{code:"OM_LOW" , language:"Oromo", projDir:"OM_LOW", size:"74MB", noMedia:true },
	{code:"SID" , language:"Sidama", projDir:"SID", size:"581MB", noMedia:false },
	{code:"SID_LOW" , language:"Sidama", projDir:"SID_LOW", size:"74MB", noMedia:true }
];  
   
JobAidPage.downloadedVersions = [
	{code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false }
];  
*/

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
		build: function ($triggerElement, e) {
			var jobAidItemTag = $triggerElement.closest('div.jobAidItem');

			var projDir = jobAidItemTag.attr('projDir');

			var menusStr = jobAidItemTag.attr('menus');
			var menusArr = menusStr.split( ';' );

			var items = {};
			menusArr.forEach( menuStr => {
				items[ menuStr ] = { name: menuStr };
			});

			console.log( items );

			return {
				callback: function (key, options) {
					if (key === 'download') JobAidPage.itemDownload(jobAidItemTag);
					else if (key === 'content') JobAidPage.fileContentDialogOpen(projDir);
				},
				items: items
			};
		}
	});

};

// ------------------

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

			JobAidPage.getManifestJsons(urlList, 0, result, function (result) {
				divDownloadedPacksTag.html('');

				var manifests = JobAidPage.getManifestJobAidInfo(result.arr);

				// Cached Item display
				manifests.forEach(function (item) {
					var itemTag = $(JobAidPage.templateItem);
					JobAidPage.populateItem(item, itemTag, 'downloaded');
					divDownloadedPacksTag.append(itemTag);

					// var matchData = { matchProj: false, newerDate: false };
					var matchData = JobAidPage.matchInServerList(item, JobAidPage.serverManifestsData);

					if (matchData.matchProj) {
						divAvailablePacksTag.find('div.jobAidItem[projDir="' + item.projDir + '"]').remove();

						if (matchData.newerDate) {
							var updateSpanTag = $('<span class="" style="margin-left: 14px; color: blue;">[update available]</span>');
							itemTag.find('span.downloadStatus').append(updateSpanTag);
						}
					}
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
		if (statusType === 'available') {
			JobAidPage.divAvailablePacksTag.find('div.jobAidItem[projDir=' + projDir + ']').remove();

			// Add to the cached..
			var itemTag = $(JobAidPage.templateItem);
			JobAidPage.populateItem(item, itemTag, 'downloaded');
			JobAidPage.divDownloadedPacksTag.append(itemTag);
		}
		else if (statusType === 'downloaded') {
			var itemTag = JobAidPage.divDownloadedPacksTag.find('div.jobAidItem[projDir=' + projDir + ']').html('').append(JobAidPage.templateItem_body);

			// Add to the cached..
			JobAidPage.populateItem(item, itemTag, 'downloaded');
			JobAidPage.divDownloadedPacksTag.append(itemTag);
		}
		else if (statusType === 'downloaded_delete') {
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
	// pack = {code:"EN" , language:"English", projDir:"EN", size:"455MB", noMedia:false };
	// status, buildDate,       
	itemTag.off('click'); // reset previous click if exists.


	itemTag.attr('data-language', itemData.code);
	itemTag.attr('projDir', itemData.projDir);
	itemTag.attr('statusType', statusType);

	var titleStrongTag = $('<strong></strong>').append(itemData.title + ' [' + Util.getStr(itemData.language) + ']');
	if (itemData.noMedia) titleStrongTag.append(' [WITHOUT MEDIA]');

	itemTag.find('.divTitle').append(titleStrongTag);
	itemTag.find('.divBuildDate').append('<strong>Release date: </strong>' + Util.getStr(itemData.buildDate));
	itemTag.find('.divDownloadSize').append('<strong>Download size: </strong>' + Util.getStr(itemData.size));
	itemTag.find('.divDownloadStatus').append('<span class="downloadStatus">downloaded. 197/197</span>');

	/*
	itemTag.find( 'div.jobContextMenu' ).off( 'click' ).click( function( e ) 
	{
		var thisTag = $( this );
		e.stopPropagation();

		thisTag.contextMenu( { x: e.offsetX, y: e.offsetY } );
	});
	*/

	if (statusType === 'available') {
		menus.push('download');
		menus.push('content');
	}
	// Downloaded Case - 'open' in iFrame case, 'delete' case.
	else if (statusType === 'downloaded') {
		menus.push('update');
		menus.push('delete');
		menus.push('content');


		// Open Up in iFrame Click Setup..
		itemTag.find('.card__content').off('click').click(function (e) {
			var srcStr = JobAidPage.rootPath + itemData.projDir + '/index.html';
			var styleStr = 'width:100%; height: 100%; overflow:auto; border:none;';

			$('#divJobAid').html('').show().append(`<iframe class="jobAidIFrame" src="${srcStr}" style="${styleStr}">iframe not compatible..</iframe>`);
		});


		// Delete Tag Create & Click Handler
		var spanDeleteTag = $('<span title="delete" style="margin-left: 11px; color: tomato; cursor: pointer;">[delete]</span>');
		titleStrongTag.append(spanDeleteTag);

		spanDeleteTag.click(function (e) {
			e.stopPropagation();

			var result = confirm('Are you sure you want to delete this, "' + itemData.projDir + '"?');
			if (result) {
				JobAidHelper.deleteCacheKeys(JobAidPage.rootPath + itemData.projDir + '/').then(function (deletedArr) {
					// Delete on localStorage 'persisData'
					PersisDataLSManager.deleteJobFilingProjDir(itemData.projDir);

					JobAidPage.updateSectionLists(itemData.projDir, 'downloaded_delete');
				});
			}
		});
	}

	var menusStr = menus.join(';');
	itemTag.attr('menus', menusStr);
};


JobAidPage.itemDownload = function (jobAidItemTag) {
	var projDir = jobAidItemTag.attr('projDir');

	if (projDir) {
		JobAidHelper.runTimeCache_JobAid({ projDir: projDir, target: 'jobAidPage' });


		// When finished downloading, could we get a call back?

	}
};


// ------------------------------------

JobAidPage.jobFilingUpdate = function (msgData) {
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
				spanTag.text(`Processing: ${prc.curr} of ${prc.total} [${url.split('.').at(-1)}]`);
				if (prc.curr > 5) projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
				projCardTag.css('opacity', 1);
			}
			else {
				spanTag.text('Download completed!');
				projCardTag.attr('downloaded', 'Y'); // Allows for 'click' to enter the proj
				projCardTag.css('opacity', 1);

				// We need to refresh the list...
				JobAidPage.updateSectionLists(projDir, projCardTag.attr('statusType'));
			}
		}
	}
};


// Call this whenever opening the file content?  Or just once?  Need marker..
JobAidPage.projProcessData_calcFileSize = function (projDir) {
	JobAidHelper.getCacheKeys(function (keys, cache) {
		var statusFullJson = JobAidHelper.getJobFilingStatusIndexed();

		if (keys && keys.length > 0) {
			keys.forEach(request => {
				var url = JobAidHelper.modifyUrlFunc(request.url);

				// If the file is within 'projDir', get size
				if (url.indexOf('jobs/jobAid/' + projDir) >= 0) {
					var itemJson = { url: url };
					// Check the storage and add additional info
					JobAidHelper.setExtraStatusInfo(itemJson, statusFullJson);

					cache.match(request).then(function (response) {
						response.clone().blob().then(function (myBlob) {
							// update to job
							JobAidPage.projProcessDataUpdate(projDir, url, { size: myBlob.size });
						});
					});
				}
			});
		}
	});
};


JobAidPage.projProcessDataUpdate = function (projDir, url, updateJson) {
	try {
		if (projDir && url && updateJson) {
			var projStatus = PersisDataLSManager.getJobFilingProjDirStatus(projDir);

			if (projStatus.process && projStatus.process[url]) {
				var item = projStatus.process[url];

				Util.mergeJson(item, updateJson);
				//item.size = size;
				//item.date = new Date().toISOString();
				//item.downloaded = true;

				PersisDataLSManager.updateJobFilingProjDirStatus(projDir, projStatus);
			}
		}
	}
	catch (errMsg) {
		console.log('ERROR in JobAidHelper.projProcessDataUpdate, ' + errMsg);
	}
};


JobAidPage.getProjCardTag = function (projDir) {
	return $('div.jobAidItem[projDir=' + projDir + ']');
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

JobAidPage.fileContentDialogOpen = function(projDir) {
	var divDialogTag = JobAidPage.contentBodyTag.find('div.divFileContentDisplay');  // Content Tag..
	var divMainContentTag = divDialogTag.find('div.divMainContent');

	var projDirStatus = PersisDataLSManager.getJobFilingProjDirStatus( projDir );

	console.log( projDirStatus );

	if ( projDirStatus && projDirStatus.process )
	{
		var processData = projDirStatus.process;

		// Display the content..
		JobAidPage.populateFileContent(divMainContentTag, processData);
	
		// Add close event
		divDialogTag.find('div.close').off('click').click(function () {
			//$('.scrim').hide();
			divDialogTag.hide();
		});
	
		divDialogTag.show();
		//$('.scrim').show();
	}
	else
	{
		MsgManager.msgAreaShowErr( 'No project data available.' );
	}
};

JobAidPage.populateFileContent = function(divMainContentTag, processData) {
	divMainContentTag.html('');

	var valArr = Object.values(processData);

	if (valArr && valArr.length) {
		var colNames = Object.keys(valArr[0]);  // Take 1st row to get colNames
		//var removalCols = ['curr', 'total', 'name', 'reqDate'];
		var removalCols = ['curr', 'total', 'url', 'reqDate'];
		// remove columns: 'curr', total, name, reqData

		colNames = colNames.filter(col => removalCols.indexOf(col) === -1);

		var divTableTag = JobAidPage.divTablePopulate(colNames, valArr);

		divMainContentTag.append(divTableTag);

		divTableTag.find('td').scrollLeft();
	}
};


JobAidPage.divTablePopulate = function(colNames, arrData) {
	var tableTag = $('<table class="contentTable"><tbody></tbody></table>');
	var tbodyTag = tableTag.find('tbody');

	// 1. Header Rows      
	var rowHeaderTag = $('<tr style="background-color: darkgray; color: #555; font-weight: 500;"></tr>');
	tbodyTag.append(rowHeaderTag);

	for (var p = 0; p < colNames.length; p++) {
		var colName = colNames[p];

		var tdTag = $('<td></td>').append(colName);

		if (colName === 'size') tdTag.css('width', '90px');
		else if (colName === 'downloaded') tdTag.css('width', '90px');

		rowHeaderTag.append(tdTag);
	}


	// 2. Body Rows.
	for (var i = arrData.length - 1; i >= 0; i--) {
		var rowData = arrData[i]; // arrary of column

		var rowTag = $('<tr></tr>');
		tbodyTag.append(rowTag);

		var downloadedVal = false;

		for (var p = 0; p < colNames.length; p++) {
			var colName = colNames[p];

			var colVal_full = rowData[colName];
			var colVal_short = colVal_full;

			var tdTag = $('<td></td>');


			if (colName === 'url') {
				var strArr = colVal_full.split('/');
				var lastIdx = strArr.length - 1;
				colVal_short = strArr[lastIdx];

				var isAudio = Util.endsWith_Arr(colVal_short, EXTS_AUDIO, { upper: true });
				var isVideo = Util.endsWith_Arr(colVal_short, EXTS_VIDEO, { upper: true });

				if (isAudio || isVideo) {
					colVal_full = colVal_full.replace('/jobs/', '');

					tdTag.css('cursor', 'pointer').css('color', (isAudio) ? 'cadetblue' : 'blue');
					tdTag.attr('play_type', (isAudio) ? 'audio' : 'video').attr('play_full', colVal_full);


					tdTag.click(function () {
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
			else if (colName === 'size') tdTag.css('width', '90px');
			else if (colName === 'downloaded') {
				tdTag.css('width', '90px');
				if (colVal_full == true) downloadedVal = true;
			}

			if (colVal_full !== undefined) tdTag.append(colVal_short).attr('title', colName + ': ' + colVal_full);

			rowTag.append(tdTag);
		}

		if (!downloadedVal) rowTag.css('background-color', 'tomato');
	}

	return tableTag;
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
         <div class="card__row divDownloadSize"></div>
         <div class="card__row divDownloadStatus"></div>
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