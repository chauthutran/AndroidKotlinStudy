function JobAidContentPage() { };

// ------------------


JobAidContentPage.fileContentDialogOpen = async function(projDir) 
{
	var divDialogTag = FormUtil.sheetFullSetup(Templates.sheetFullFrame, {'title': 'JobAid Content - ' + projDir, 'term': '', 'cssClasses': ['divJobAidContentPage'] });

	var divMainContentTag = divDialogTag.find('.contentBody');

	var projDirStatus = PersisDataLSManager.getJobFilingProjDirStatus( projDir );

	if ( projDirStatus && projDirStatus.process )
	{
		var processData = projDirStatus.process;

		// Display the content..
		JobAidContentPage.populateFileContent(divMainContentTag, processData, projDir);
	}
	else MsgManager.msgAreaShowErr( 'No project data available.' );


	TranslationManager.translatePage();
};


JobAidContentPage.populateFileContent = function(divMainContentTag, processData, projDir) 
{
	divMainContentTag.html('');

	var tableTag = $( JobAidContentPage.contentPage_tableTag );
	var tbodyTag = tableTag.find('tbody');
	divMainContentTag.append( tableTag );


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
		fileItem.fileType = JobAidContentPage.getFileType( fileItem.name );
		fileItem.contentType = JobAidContentPage.getContentType( fileItem.name, fileItem.fileType );

		itemArr.push( fileItem );
	}

	// Order by type & size.
	var items_video = Util.sortByKey_Reverse( itemArr.filter( item => item.fileType === 'video' ), 'size' );
	var items_audio = Util.sortByKey_Reverse( itemArr.filter( item => item.fileType === 'audio' ), 'size' );
	var items_image = Util.sortByKey_Reverse( itemArr.filter( item => item.fileType === 'image' ), 'size' );
	var items_text = Util.sortByKey_Reverse( itemArr.filter( item => item.fileType === 'text' ), 'size' );
	var items_application = Util.sortByKey_Reverse( itemArr.filter( item => item.fileType === 'application' ), 'size' );
	var items_other = Util.sortByKey_Reverse( itemArr.filter( item => item.fileType === 'other' ), 'size' );

	// Combine
	var totalItems = [];
	Util.mergeArrays( totalItems, items_video );
	Util.mergeArrays( totalItems, items_audio );
	Util.mergeArrays( totalItems, items_image );
	Util.mergeArrays( totalItems, items_text );
	Util.mergeArrays( totalItems, items_application );
	Util.mergeArrays( totalItems, items_other );


	// Populate
	for ( var i = 0; i < totalItems.length; i++ )
	{
		var fileItem = totalItems[i];

		JobAidContentPage.populateFileItemInfo(fileItem, tbodyTag);
	}
};


JobAidContentPage.getFileName_FolderPath = function(url, projDir)
{
	var dataJson = { name: '', folderPath: '' };

	try
	{
		var projDirRoot = '/jobs/jobAid/' + projDir;

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

JobAidContentPage.getFileType = function( fileName )
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


JobAidContentPage.getContentType = function( fileName, fileType )
{
	var contentType = '';

	var extName = Util.getFileExtension(fileName, { lower: true });

	contentType = fileType + '/' + extName;

	return contentType;
};


JobAidContentPage.populateFileItemInfo = function(fileItem, tbodyTag)
{
	var row1Tag = $( JobAidContentPage.contentPage_row1Tag );
	var row2Tag = $( JobAidContentPage.contentPage_row2Tag );
	var fileNameTag = row1Tag.find( 'div.divFileNameVal' );

	// Row 1 - populate data in tags..
	JobAidContentPage.populateFileName_Preview( fileItem, fileNameTag );


	// Downloaded status effect
	if ( fileItem.downloaded !== true )
	{
		row1Tag.css( 'background-color', 'lightpink' );
		row2Tag.css( 'background-color', 'lightpink' );
		fileNameTag.append( '<span style="margin-left: 10px;"><strong>[NOT DOWNLOADED]</strong></span>' );
	}

	// Row 2 - folder, date, size
	// folder
	row2Tag.find( 'div.divFileFolderVal' ).append(fileItem.folderPath);

	// content-type
	row2Tag.find( 'div.divFileContentTypeVal' ).append(fileItem.contentType);

	// date	
	var dateFormatted = '';
	if ( fileItem.date ) dateFormatted = UtilDate.formatDate( Util.getStr(fileItem.date), "yyyy/MM/dd HH:mm:ss" );
	else dateFormatted = '[N/A]'
	row2Tag.find( 'div.divFileCachingTimeVal' ).append(dateFormatted).attr('title', 'date: ' + fileItem.date);

	// size
	var sizeFormatted = '';
	if ( fileItem.size ) sizeFormatted = Util.formatFileSizeMB( fileItem.size );
	else sizeFormatted = '[N/A]';
	row2Tag.find( 'div.divFileContentLengthVal' ).append(sizeFormatted).attr('title', 'size: ' + fileItem.size);
	

	tbodyTag.append( row1Tag );
	tbodyTag.append( row2Tag );
};

JobAidContentPage.populateFileName_Preview = function(fileItem, fileNameTag) 
{
	if (fileItem !== undefined)
	{
		var displayName = Util.shortenFileName( fileItem.name, 40 );

		fileNameTag.append(displayName).attr('title',  'name: ' + fileItem.name ); //.url);
	

		fileNameTag.css('cursor', 'pointer');
		fileNameTag.attr('play_type', fileItem.fileType).attr('play_full', fileItem.url);

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

JobAidContentPage.contentPage_row1Tag = `
<tr class="trJobFileR1">
	<td colspan="4">
		<div class="jfTitle">File Name</div>
		<div class="divFileNameVal jfVal"></div>
	</td>
</tr>`;

JobAidContentPage.contentPage_row2Tag = `
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
