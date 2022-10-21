function JobAidContentPage() { };

// ------------------

JobAidContentPage.divMainContentTag;
JobAidContentPage.ITEM_LIST = [];


JobAidContentPage.fileContentDialogOpen = async function(projDir) 
{
	var divDialogTag = FormUtil.sheetFullSetup(Templates.sheetFullFrame, {'title': 'JobAid Content - ' + projDir, 'term': '', 'cssClasses': ['divJobAidContentPage'] });

	JobAidContentPage.divMainContentTag = divDialogTag.find('.contentBody');

	var projDirStatus = PersisDataLSManager.getJobFilingProjDirStatus( projDir );

	if ( projDirStatus && projDirStatus.process )
	{
		var processData = projDirStatus.process;

		// Display the content..
		JobAidContentPage.populateFileContent(processData, projDir);


		/*  -- Do not need anymore due to service providing the size.
		// Missing file size <-- We could calculate this when we open up the file..
		JobAidContentPage.calcMissingFileSize( processData, function( urlProp, size, item ) 
		{
			Util.mergeJson( item, { size: size } );

			PersisDataLSManager.updateJobFilingProjDirStatus(projDir, projDirStatus);

			// display on each item...  item in 'urlProp'..
			if ( size ) sizeFormatted = Util.formatFileSizeMB( size );
			else sizeFormatted = '[N/A]';

			var dataItemTag = JobAidContentPage.divMainContentTag.find( '.list-r[url="' + urlProp + '"]' );
			dataItemTag.find( 'div.contentLength' ).html('').append(sizeFormatted).attr('title', 'size: ' + size);		
		});
		*/
	}
	else MsgManager.msgAreaShowErr( 'No project data available.' );


	TranslationManager.translatePage();
};

/*
JobAidContentPage.calcMissingFileSize = async function ( projProcess, callBack )
{
	// 1. File size calculate - individual ones calculate & save.  Total size calc.
	//		- Should only calculate if needed --> Process it if has downloaded & does not have 'size' & exists in cache..				
	//var totalSize = 0;

	try 
	{
		JobAidHelper.getCacheKeys_async().then( async function( cacheKeyJson )		
		{
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
						// NOTE: We may display 'calculating...' animation on the 'size' location..  at here.

						var response = await cache.match( request );
						var myBlob = await response.clone().blob();
						var size = myBlob.size;
						if ( callBack ) callBack( urlProp, size, item );

						//cache.match( request ).then( response => response.clone().blob().then( myBlob => 
					}
				}
	
				//totalSize += item.size;
			}
		});
	}
	catch( errMsg ) { console.log( 'ERROR in JobAidManifest.projProcessData_calcFileSize, ' + errMsg ); };

	// Updating in Storage (Persis) is done from outside of this method
	//return totalSize;
};
*/


JobAidContentPage.populateFileContent = function( processData, projDir) 
{
	JobAidContentPage.divMainContentTag.html('');
	
	JobAidContentPage.divMainContentTag.append( $( JobAidContentPage.contentPage_headers ) );

	let dataListTag = $( JobAidContentPage.contentPage_dataList );
	JobAidContentPage.divMainContentTag.append( dataListTag );


	// TODO: wants to sort by video 1st, audio 2nd, img 3rd, others..
	// within it, we can sort by size..
	var itemArr = [];

	for ( var url in processData )
	{
		var fileItem = processData[url];
		fileItem.url = url;

		var dataJson = JobAidContentPage.getFileName_FolderPath(url, projDir);
		fileItem.name = dataJson.name;
		fileItem.folderPath = dataJson.folderPath;
		fileItem.fileType2 = JobAidContentPage.getFileType2( fileItem.name ); // fileType is already in use for 'app' vs 'media'
		fileItem.contentType = JobAidContentPage.getContentType( fileItem.name, fileItem.fileType2 );
		fileItem.size2 = ( fileItem.downloaded && fileItem.size ) ? fileItem.size: 0;  // set size as 0 if not downloaded..

		itemArr.push( fileItem );
	}


	// Order by type & size.
	var items_notDwn = Util.sortByKey_Reverse( itemArr.filter( item => item.downloaded !== true ), 'size' );

	var itemArrDwn = itemArr.filter( item => item.downloaded === true );
	var items_video = Util.sortByKey_Reverse( itemArrDwn.filter( item => item.fileType2 === 'video' ), 'size' );
	var items_audio = Util.sortByKey_Reverse( itemArrDwn.filter( item => item.fileType2 === 'audio' ), 'size' );
	var items_image = Util.sortByKey_Reverse( itemArrDwn.filter( item => item.fileType2 === 'image' ), 'size' );
	var items_text = Util.sortByKey_Reverse( itemArrDwn.filter( item => item.fileType2 === 'text' ), 'size' );
	var items_application = Util.sortByKey_Reverse( itemArrDwn.filter( item => item.fileType2 === 'application' ), 'size' );
	var items_other = Util.sortByKey_Reverse( itemArrDwn.filter( item => item.fileType2 === 'other' ), 'size' );

	// Combine
	var totalItems = [];
	Util.mergeArrays( totalItems, items_notDwn );
	Util.mergeArrays( totalItems, items_video );
	Util.mergeArrays( totalItems, items_audio );
	Util.mergeArrays( totalItems, items_image );
	Util.mergeArrays( totalItems, items_text );
	Util.mergeArrays( totalItems, items_application );
	Util.mergeArrays( totalItems, items_other );
	JobAidContentPage.ITEM_LIST = totalItems;

	// Populate
	JobAidContentPage.populateFileItemList( JobAidContentPage.ITEM_LIST );

	JobAidContentPage.setUp_Events_SortColumns();
};

JobAidContentPage.setUp_Events_SortColumns = function()
{
	let tableHeaderTag = JobAidContentPage.divMainContentTag.find(".headers");
	tableHeaderTag.find(".sortable").off('click').click(function (e) {
		const sortField = $(this).attr("sortField");
		const order = $(this).attr("order");
		JobAidContentPage.sortDataList( sortField, order, true );
	});

	JobAidContentPage.divMainContentTag.find(".sortOpt").change(function(){
		const sortField = $(this).val();
		const order = JobAidContentPage.divMainContentTag.find(".sortBtn").attr("order");
		JobAidContentPage.sortDataList( sortField, order, false );
	});

	
	JobAidContentPage.divMainContentTag.find(".sortBtn").click(function(){
		const sortField = JobAidContentPage.divMainContentTag.find(".sortOpt").val();
		const order =  $(this).attr("order");
		JobAidContentPage.sortDataList( sortField, order, true );
	});
}

JobAidContentPage.populateFileItemList = function( itemList )
{
	let dataListTag = JobAidContentPage.divMainContentTag.find(".dataList");
	dataListTag.html("");
	
	itemList.forEach(item => {
		JobAidContentPage.populateFileItemInfo(item, dataListTag);		
	});
}

JobAidContentPage.sortDataList = function( sortField, order, isOrderChanged )
{
	MsgFormManager.displayBlock_byItem( $(".list-downloaded"));
	

	const sortedItems = Util.sortByKey(JobAidContentPage.ITEM_LIST, sortField, undefined, order );
	JobAidContentPage.populateFileItemList( sortedItems );

	// Update "Sort" icon for headers
	JobAidContentPage.divMainContentTag.find( ".headers .sortable" ).attr("src", "../images/sort_icon.svg").addClass( 'sortable_default' );

	
	var sortFieldTableColTag = JobAidContentPage.divMainContentTag.find(".sortable[order='" + order + "'][sortField='" + sortField + "']");
	let sortOptTag = JobAidContentPage.divMainContentTag.find(".sortOpt");
	let sortBtnTag = JobAidContentPage.divMainContentTag.find(".sortBtn");
	sortOptTag.val(sortField);

	if( order == "asc" ) {

		sortFieldTableColTag.attr("order", "desc");
		sortFieldTableColTag.attr("src", "../images/arrow_drop_up.svg");
		sortFieldTableColTag.removeClass( 'sortable_default' );

		if( isOrderChanged )
		{
			sortBtnTag.attr("order", "desc");
			// sortBtnTag.attr("src", "../images/arrow_drop_up.svg");
		}
	}
	else
	{
		sortFieldTableColTag.attr("order", "asc");
		sortFieldTableColTag.attr("src", "../images/arrow_drop_down.svg");
		sortFieldTableColTag.removeClass( 'sortable_default' );

		if( isOrderChanged )
		{
			sortBtnTag.attr("order", "asc");
			// sortBtnTag.attr("src", "../images/arrow_drop_down.svg");
		}
	}

	MsgFormManager.hideBlock( $(".list-downloaded"));
}


JobAidContentPage.getFileName_FolderPath = function(url, projDir)
{
	var dataJson = { name: '', folderPath: '' };

	try
	{
		var projDirRoot = JobAidHelper.rootDir_jobAid + projDir;

		var folderPath = url.replace( projDirRoot, '' );  // remove the name as well.
	
		var strArr = url.split('/');
		var lastIdx = strArr.length - 1;
		dataJson.name = strArr[lastIdx];
	
		dataJson.folderPath = folderPath.replace( dataJson.name, '' );
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in JobAidContentPage.getFileName_FolderPath, ' + errMsg );
	}

	return dataJson;
};

JobAidContentPage.getFileType2 = function( fileName )
{
	var type = '';

	if ( Util.endsWith_Arr(fileName, JobAidHelper.EXTS_VIDEO, { upper: true }) ) type = 'video';
	else if ( Util.endsWith_Arr(fileName, JobAidHelper.EXTS_AUDIO, { upper: true }) ) type = 'audio';
	else if ( Util.endsWith_Arr(fileName, JobAidHelper.EXTS_IMAGE, { upper: true }) ) type = 'image';
	else if ( Util.endsWith_Arr(fileName, JobAidHelper.EXTS_APPLICATION, { upper: true }) ) type = 'application';
	else if ( Util.endsWith_Arr(fileName, JobAidHelper.EXTS_TEXT, { upper: true }) ) type = 'text';
	else type = 'other';

	return type;
};


JobAidContentPage.getContentType = function( fileName, fileType2 )
{
	var contentType = '';

	var extName = Util.getFileExtension(fileName, { lower: true });

	contentType = fileType2 + '/' + extName;

	return contentType;
};


JobAidContentPage.populateFileItemInfo = function( fileItem, dataListTag )
{
	let dataItemTag = $( JobAidContentPage.contentPage_dataItem ).attr( 'url', fileItem.url );
	dataListTag.append( dataItemTag );
	if ( fileItem.downloaded !== true ) dataItemTag.addClass( 'jobAidNotDownloaded' );


	JobAidContentPage.populateFileName_Preview( fileItem, dataItemTag.find(".fileName") );


	dataItemTag.find(".folder").html( fileItem.folderPath );
	dataItemTag.find(".contentType").append( fileItem.contentType );

	// Caching Time	
	var dateFormatted = '';
	if ( fileItem.date ) dateFormatted = UtilDate.formatDate( Util.getStr(fileItem.date), "yyyy/MM/dd HH:mm:ss" );
	else dateFormatted = '[N/A]'
	dataItemTag.find(".cachingTime").append( dateFormatted).attr('title', 'date: ' + fileItem.date);

	// size
	var sizeFormatted = '';
	if ( fileItem.downloaded !== true ) sizeFormatted = '[Not downloaded]';
	else if ( fileItem.size ) sizeFormatted = Util.formatFileSizeMB( fileItem.size );
	else sizeFormatted = '[N/A]';
	dataItemTag.find(".contentLength").append( sizeFormatted ).attr("title", "size:" + fileItem.size);
};

JobAidContentPage.populateFileName_Preview = function(fileItem, fileNameTag) 
{
	if (fileItem !== undefined)
	{
		// let shortName = fileItem.name;
		// const fileNameLeng = shortName.length;
		// if( fileNameLeng > 35 )
		// {
		// 	shortName = shortName.substring( 0, 15 ) + " ... " + shortName.substring( fileNameLeng - 15, fileNameLeng );
		// }

		fileNameTag.attr("title", "name:" + fileItem.name);
		fileNameTag.attr("play_full", fileItem.url);
		fileNameTag.attr("play_type", fileItem.fileType2);
		fileNameTag.html( fileItem.name );

		if ( fileItem.downloaded === true )
		{
			fileNameTag.click(function () 
			{	
				var thisTag = $(this);
				var play_full = thisTag.attr('play_full');
				var play_type = thisTag.attr('play_type');
	
				var divFilePreviewTag = JobAidContentPage.populateFilePreviewBottomTag();
				var mainContentTag = divFilePreviewTag.find( 'div.mainContent' );
	
				if (play_type === 'audio') mainContentTag.append('<audio controls><source src="' + play_full + '" >Your browser does not support the audio element.</audio>');
				else if (play_type === 'video') mainContentTag.append('<video src="' + play_full + '" preload="auto" controls="" style="width: 100%; height: 100%;"></video>');
				else if (play_type === 'image') mainContentTag.append('<img src="' + play_full + '" style="width: 100%; height: 100%;"/>');
				else mainContentTag.append('<div style="color: gray; font-size: 17px;">PREVIEW NOT AVAILABLE</div>');
			});	
		}
	}
};


JobAidContentPage.populateFilePreviewBottomTag = function()
{
	FormUtil.blockPage(undefined, function (scrimTag) {
		scrimTag.off('click').click(function (e) {
			e.stopPropagation();
			FormUtil.emptySheetBottomTag();
			FormUtil.unblockPage(scrimTag);
		});
	});

	var filePreviewTag = $( JobAidContentPage.filePreviewTag );

	FormUtil.genTagByTemplate(FormUtil.getSheetBottomTag(), filePreviewTag, function (sheetBottomTag) {
		// Template events..
		sheetBottomTag.find('.divClose').click(function (e) {
			e.stopPropagation();			
			FormUtil.emptySheetBottomTag();
			FormUtil.unblockPage();
		});

		var titleTag = sheetBottomTag.find( '.tdHeaderTitle' );
		titleTag.text( 'File Preview' ); //.attr( 'term', Util.getStr( btnJson.titleMsg.term ) );
	});

	return filePreviewTag;
};


// ---------------------------------
// --- Content Page Related

JobAidContentPage.contentPage_tableTag = `<table class="jobFileContentTable"><tbody></tbody></table>`;

JobAidContentPage.contentPage_headers = `
<div class="sort-dropdown">
	
	<select class="sortOpt" style="padding-left: 10px;font-weight: bold;">
		<option value="name">Name</option>
		<option value="folder">Folder</option>
		<option value="contentType">Content-Type</option>
		<option value="date">Caching time</option>
		<option value="size">Content-Length</option>
	</select>

	<svg class="sortBtn" order="asc" width="20" height="20" style="padding: 0px 20px; cursor: pointer;" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
		<path d="M7.62497 2V21.0951L5.87888 19.349C5.73243 19.2026 5.49407 19.2026 5.34763 19.349C5.20118 19.4954 5.20118 19.7324 5.34763 19.8789L7.73435 22.2656C7.88081 22.4121 8.11783 22.4121 8.26429 22.2656L10.651 19.8789C10.7975 19.7324 10.7975 19.4954 10.651 19.349C10.5046 19.2026 10.2675 19.2026 10.1211 19.349L8.37497 21.0951V2H7.62497ZM16 2C15.904 2 15.8089 2.03615 15.7356 2.10937L13.3489 4.49609C13.2025 4.64254 13.2025 4.87959 13.3489 5.02604C13.4953 5.17249 13.7324 5.17249 13.8789 5.02604L15.625 3.27995V22.375H16.375V3.27995L18.1211 5.02604C18.2675 5.17249 18.5059 5.17249 18.6523 5.02604C18.7988 4.87959 18.7988 4.64254 18.6523 4.49609L16.2656 2.10937C16.1924 2.03615 16.0959 2 16 2Z" class="c_50"></path>
	</svg>
</div>

<div class="list-downloaded-headers headers">
	<div class="list-r">
		<div class="list-r_secc">
			<div class="list-r_secc_title">File Name
				<img class="sortable sortable_default" src="../images/sort_icon.svg" order="asc" sortField="name">
			</div>
		</div>
		<div class="list-r_secc">
			<div class="list-r_secc_title">Folder
			<img class="sortable sortable_default" src="../images/sort_icon.svg" order="asc" sortField="folder"></div>
		</div>
		<div class="list-r_secc">
			<div class="list-r_secc_title">Content-Type
			<img class="sortable sortable_default" src="../images/sort_icon.svg" order="asc" sortField="contentType"></div>
		</div>
		<div class="list-r_secc">
			<div class="list-r_secc_title">Caching time
			<img class="sortable sortable_default" src="../images/sort_icon.svg" order="asc" sortField="date"></div>
		</div>
		<div class="list-r_secc">
			<div class="list-r_secc_title">Content-Length
			<img class="sortable sortable_default" src="../images/sort_icon.svg" order="asc" sortField="size2"></div>
		</div>
	</div>
</div>`;

JobAidContentPage.contentPage_dataList = `
	<div class="list-downloaded dataList"></div>
`;

JobAidContentPage.contentPage_dataItem = `
<div class="list-r">
	<div class="list-r_secc">
		<div class="list-r_secc_title">File Name</div>
		<div class="list-r_secc_cnt fileName" title="" play_type="" play_full="" style="cursor: pointer;"></div>
	</div>
	<div class="list-r_secc">
		<div class="list-r_secc_title">Folder</div>
		<div class="list-r_secc_cnt folder">/</div>
	</div>
	<div class="list-r_secc">
		<div class="list-r_secc_title">Content-Type</div>
		<div class="list-r_secc_cnt contentType"></div>
	</div>
	<div class="list-r_secc">
		<div class="list-r_secc_title">Caching time</div>
		<div class="list-r_secc_cnt cachingTime"></div>
	</div>
	<div class="list-r_secc">
		<div class="list-r_secc_title">Content-Length</div>
		<div class="list-r_secc_cnt contentLength" title=""></div>
	</div>
</div>
`;

JobAidContentPage.filePreviewTag = `
<div class="sheet_bottom-btn3 divFilePreview" style="display: block; max-height: 50%;">
	<div class="divHeader">
		<table style="width: 100%;">
			<tr>
				<td class="tdHeaderTitle">
				</td>
				<td class="tdClose" style="text-align: right;">
					<div class="divClose" style="cursor: pointer; display: inline-block;">
						<img src="images/close.svg" style="width: 26px; height: 26px;"/>
					</div>
				</td>		
			</tr>
		</table>
	</div>
  <div class="mainContent" style="height: 92%;">
  </div>
</div >`;
