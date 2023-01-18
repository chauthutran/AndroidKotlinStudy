
function ReportDetailsListPage() { };

// -----------------------------------------------------------

ReportDetailsListPage.options = {
	'title': 'Report 2',
	'term': 'form_title_report2',
	'cssClasses': ['divReportPage2'],
	'zIndex': 1600
};

ReportDetailsListPage.sheetFullTag; // = FormUtil.sheetFullSetup(Templates.sheetFullFrame, ReportDetailsListPage.options);  // .options.preCall
ReportDetailsListPage.contentBodyTag;
ReportDetailsListPage.dataList = [];

// -----------------------------------------------------------

ReportDetailsListPage.render = function()
{
    ReportDetailsListPage.sheetFullTag = FormUtil.sheetFullSetup(Templates.sheetFullFrame, ReportDetailsListPage.options);
	ReportDetailsListPage.contentBodyTag = ReportDetailsListPage.sheetFullTag.find(".contentBody");

    ReportDetailsListPage.contentBodyTag.append("<div class='list'></div>");

    // Populate client list in report
    ReportDetailsListPage.populateClientList();
}


ReportDetailsListPage.populateClientList = function()
{
    let reportConfig = ConfigManager.getConfigJson().definitionReportColumns;
    if( reportConfig !== undefined && reportConfig.report2 != undefined )
    {
        const list = ClientDataManager.getClientList();
        for( let i=0; i<list.length; i++ )
        {
            ReportDetailsListPage.populateClientData( reportConfig.report2, list[i] );
        }
    }
}

ReportDetailsListPage.populateClientData = function( reportConfig, clientJson )
{
    let cardDivTag = $(ReportDetailsListPage.cardDivTag);
    ReportDetailsListPage.contentBodyTag.find(".list").append( cardDivTag );
    
    // Icon
    let iconTag = $(ReportDetailsListPage.cardIconTag.replace('{NAME}', ReportDetailsListPage.getNameSimbol( clientJson )));
    cardDivTag.find(".clientIcon").append( iconTag );

    // Render "displayBase"
    var displayBaseContent = eval( Util.getEvalStr( " var item = clientJson; " + reportConfig.listItemDisplay.displayBase ) );
    cardDivTag.find(".card__content").append( $(Templates.cardContentDivTag).html(displayBaseContent) );

    // Render "displaySettings"
    var displaySettings = eval( Util.getEvalStr( " var item = clientJson; " + reportConfig.listItemDisplay.displaySettings ) );
    cardDivTag.find(".card__content").append( $(Templates.cardContentDivTag).html(displaySettings) );

    // Setup event
    ReportDetailsListPage.setUp_Events( cardDivTag, clientJson._id );
}

ReportDetailsListPage.setUp_Events = function( cardDivTag, clientId )
{
    cardDivTag.click( function(){
        ReportDetailsListPage.contentBodyTag.find(".list").hide();
        ReportDetailsPage.render( clientId );
    });
}

ReportDetailsListPage.getNameSimbol = function (clientJson) {
    var nameSimbol = '--';

    try {
        if (clientJson && clientJson.clientDetails) {
            var cDetail = clientJson.clientDetails;

            if (cDetail.firstName || cDetail.lastName) {
                var firstNameSimbol = (cDetail.firstName) ? cDetail.firstName.charAt(0) : '-';
                var lastNameSimbol = (cDetail.lastName) ? cDetail.lastName.charAt(0) : '-';

                nameSimbol = firstNameSimbol + lastNameSimbol;
            }
        }
    }
    catch (errMsg) {
        console.log('ERROR in ClientCard.getNameSimbol(), errMsg: ' + errMsg);
    }

    return nameSimbol;
};


// ------------------------------------------------------------------------

ReportDetailsListPage.cardDivTag = `<div class="client card">
	<div class="clientContainer card__container">

		<card__support_visuals class="clientIcon card__support_visuals" />

		<card__content class="clientContent card__content mouseDown" style="color: #444; cursor: pointer;" title="Click for detail" />

		<card__cta class="activityStatus card__cta">
			<div class="activityStatusText card__cta_status"></div>
			<div class="favIcon card__cta_one mouseDown" style="cursor: pointer; display:none;"></div>
			<div class="clientPhone card__cta_one mouseDown" style="cursor: pointer; display:none;"></div>
			<div class="activityStatusIcon card__cta_two mouseDown" style="cursor:pointer;"></div>
		</card__cta>

		<div class="clientRerender" style="float: left; width: 1px; height: 1px;"></div>
	</div>
</div>`;


ReportDetailsListPage.cardIconTag = `<svg xlink="http://www.w3.org/1999/xlink" width="50" height="50">
	<g id="UrTavla">
		<circle style="fill:url(#toning);stroke:#ccc;stroke-width:1;stroke-miterlimit:10;" cx="25" cy="25" r="23"></circle>
		<text x="50%" y="50%" text-anchor="middle" stroke="#ccc" stroke-width="1.5px" dy=".3em">{NAME}</text>
	</g>
</svg>`;