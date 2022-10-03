
function ReportPage() { };



// -----------------------------------------------------------

ReportPage.options = {
	'title': 'Report',
	'term': 'form_title_report',
	'cssClasses': ['divReportPage'],
	'zIndex': 1600,
	'onBackClick': function() {
		ConnManagerNew.tempDisableAvailableCheck = false;
		console.log( 'tempDisableAvailableCheck set to false - in case the download never finished' );
	}
};

ReportPage.sheetFullTag = FormUtil.sheetFullSetup(Templates.sheetFullFrame, ReportPage.options);  // .options.preCall
ReportPage.contentBodyTag;
// ReportPage.table1;


// -----------------------------------------------------------

ReportPage.render = function()
{
    ReportPage.sheetFullTag = FormUtil.sheetFullSetup(Templates.sheetFullFrame, ReportPage.options);
	ReportPage.contentBodyTag = ReportPage.sheetFullTag.find('.contentBody');

    
    ReportPage.contentBodyTag.append(ReportPage.templateReport);
    ReportPage.populateData();
}

ReportPage.populateData = function()
{
    let reportConfig = ConfigManager.getConfigJson().definitionReportColumns;
    if( reportConfig != undefined )
    {
        reportConfig = reportConfig.report;
        var evalStr = Util.getEvalStr( reportConfig.eval );

        // Populate 'tableData'
        var tableData = reportConfig.tableData;
        if( tableData )
        {
            const tableIds = Object.keys(tableData).sort();
            
            // Resolve table data
            let tableRowData = {};
            for( var k=0; k<tableIds.length; k++ )
            {
                const tableId = tableIds[k];
                var tableConfig = tableData[tableId];
                
                var listData = eval( Util.getEvalStr( tableConfig.list ) );
                var colDataConfig = tableConfig.colData;
                colDataConfig = ( colDataConfig == undefined ) ? [] : colDataConfig;
                var colNo = Object.keys( colDataConfig ).length;

                // Get column values
                var data = [];
                for( var i=0; i< listData.length; i++ )
                {
                    data[i] = [];
                    for( var j=0; j<colNo; j++ )
                    {
                        try { 
                            const colIdx = j + 1;
                            var colConfig = colDataConfig["col" + colIdx];
                            if( colConfig )
                            {
                                var value = eval( evalStr + " var item = listData[i]; " + Util.getEvalStr( colConfig ) ); 
                                data[i][j] = value;
                            }
                            else
                            {
                                data[i][j] = "";
                            }  
                        }
                        catch( errMsg ) { 
                            data[i][j] = "*** ERROR";
                            console.log( 'ReportPage col' + j + ' ERROR, ' + errMsg ); 
                        }	
                    }
                }

                tableRowData[tableId] = {
                    data: data,
                    maxRow: tableConfig.maxRow,
                    rowIdx: 0,
                    colNo: colNo
                }
            }

            // Populate data
            while( ReportPage.checkToStopPopulateData( tableRowData ) )
            {
                for( var k=0; k<tableIds.length; k++ )
                {
                    const tableId = tableIds[k];
                    const listData = tableRowData[tableId];
                    const maxRow = listData.maxRow;
                    const data = listData.data;
                    const rowIdx = listData.rowIdx;

                    // Create the content of a page for the table
                    var contentTag = $("<div style='page-break-after:always;padding-botton: 20px;'>" + ReportPage[tableId + "_template"] + "</div>" );
                    // ReportPage.contentBodyTag.find(`#${tableId}_content`).append( contentTag );
                    ReportPage.contentBodyTag.find(".wrapper").append( contentTag );

                    // Populate Cards
                    ReportPage.populateCards( reportConfig, contentTag );
                
                    // Get table tbody for appending data list
                    let tableTag = contentTag.find("#" + tableId).find("tbody");
                    
                    let endRow = rowIdx + maxRow;
                    endRow = ( endRow > data.length ) ? data.length : endRow;
                    for( var i=rowIdx; i<endRow; i++ )
                    {
                        var rowTag = $("<tr></tr>");
                        var colData = data[rowIdx];
                        for( var j=0; j<colData.length; j++ )
                        {
                            rowTag.append( `<td>${colData[j]}</td>` );
                        }

                        tableTag.append( rowTag );
                    }

                    if( endRow == data.length && maxRow > ( endRow - rowIdx ) )
                    {
                        for( var i=(endRow - rowIdx); i<maxRow; i++ )
                        {
                            var rowTag = $("<tr></tr>");
                            for( var j=0; j<listData.colNo; j++ )
                            {
                                rowTag.append("<td></td>");
                            }
                            tableTag.append( rowTag );
                        }
                    }

                    // Update the current rowIdx
                    tableRowData[tableId].rowIdx = endRow;
                }
            }


            // for( var k=0; k<tableIds.length; k++ )
            // {
            //     const tableId = tableIds[k];
            //     var tableConfig = tableData[tableId];
                
            //     var listData = eval( Util.getEvalStr( tableConfig.list ) );

            //     var colDataConfig = tableConfig.colData;
            //     var maxRow = tableConfig.maxRow;
            //     var colNo = Object.keys( colDataConfig ).length;
            //     let rowIdx = 0;
                
            //     var tableTag;
            //     for( var i=0; i< listData.length; i++ )
            //     {
            //         if( rowIdx == 0 || rowIdx == maxRow )
            //         {
            //             rowIdx = 0;
            //             // Create the content of a page for the table
            //             var contentTag = $("<div style='page-break-after:always;padding-botton: 20px;'>" + ReportPage[tableId + "_template"] + "</div>" );
            //             ReportPage.contentBodyTag.find(`#${tableId}_content`).append( contentTag );

            //             // Populate Cards
            //             ReportPage.populateCards( reportConfig, contentTag );
            //             // Get table tbody for appending data list
            //             tableTag = contentTag.find("#" + tableId).find("tbody");
            //         }
            //         rowIdx ++;

            //         var rowTag = $("<tr></tr>");
            //         for( var j=0; j< colNo; j++ )
            //         {
            //             const colIdx = j + 1;
            //             var colIdxConfig = colDataConfig["col" + colIdx];
            //             var colEvalStr = Util.getEvalStr( colIdxConfig );
            //             var colTag = $("<td></td>");
            //             rowTag.append( colTag );
                        
            //             try { 
            //                 var value = eval( evalStr + " var item = listData[i]; " +  Util.getEvalStr( colEvalStr ) ); 
            //                 colTag.html( value );
            //             }
            //             catch( errMsg ) { console.log( 'ReportPage col' + j + ' ERROR, ' + errMsg ); }		
            //         }
        
            //         tableTag.append( rowTag );
            //     }

            //     // Populate 'empty' rows if needed
            //     if( rowIdx < maxRow)
            //     {
            //         for( var i=rowIdx + 1; i<=maxRow; i++ )
            //         {
            //             var rowTag = $("<tr></tr>");
            //             for( var j=0; j<colNo; j++ )
            //             {
            //                 rowTag.append("<td></td>");
            //             }
            //             tableTag.append( rowTag );
            //         }
            //     }
            // }
           
        }
    }
}

ReportPage.checkToStopPopulateData = function( tableRowData )
{
    var flag = false;
    const tableIds = Object.keys( tableRowData );
    for( var i=0; i<tableIds.length; i++ )
    {
        const tableId = tableIds[i];
        const rowIdx = tableRowData[tableId].rowIdx;
        const rowLeng = tableRowData[tableId].data.length;
        if( rowIdx < rowLeng )
        {
            flag = true;
            break;
        }
    }

    return flag;

}

ReportPage.populateCards = function( reportConfig, contentTag )
{
    // Populate 'cardData'
    var evalStr = Util.getEvalStr( reportConfig.eval );
    var cardData = reportConfig.cardData;
    if( cardData )
    {
        const cardIds = Object.keys( cardData );
        for( var k=0; k<cardIds.length; k++ )
        {
            const cardId = cardIds[k];
            var cardConfig = cardData[cardId];
            
            var cardTag = contentTag.find("#" + cardId);
            if( cardTag.length > 0 )
            {
                cardTag.find(".title").html(cardConfig.title);

                if( cardId == 'card1' )
                {
                    var cardContentTag = cardTag.find("tbody");
                    for( var i=0; i<cardConfig.rows.length; i++ )
                    {
                        var row = cardConfig.rows[i];

                        var rowTag = $("<tr></tr>");
                        if( row.name )
                        {
                            var name = row.name;
                            rowTag.append(`<td>${name}</td>`);
                        }

                        if( row.value )
                        { 
                            var value = eval( evalStr + " " + row.value );
                            rowTag.append(`<td>${value}</td>`);
                        }

                        cardContentTag.append(rowTag);
                    }
                }
                else
                {
                    var cardContentTag = cardTag;
                    for( var i=0; i<cardConfig.rows.length; i++ )
                    {
                        var row = cardConfig.rows[i];
                        
                        var tag = $("<p></p>");
                        if( row.name )
                        {
                            var name = row.name;
                            tag.append(`${name}: `);
                        }

                        if( row.value )
                        { 
                            var value = eval( evalStr + " " + row.value );
                            tag.append(`${value}`);
                        }

                        cardContentTag.append(tag);
                    }
                }
            
            }
        }
    }
}


// -----------------------------------------------------------

ReportPage.templateReport = `
<div id="pageHeader" style="border-bottom: 1px solid #ddd;  padding: 0px 0px 4px; margin: 0px;">
    <p>Voluntary Medical Male Circumcision (VMMC) Register</p>
</div>

<div id="pageFooter" style="border-top: 1px solid #ddd; padding: 8px 0px 4px; margin: 0px;">
    <p
        style="color: #666; width: 70%; margin: 0; padding-bottom: 0px; text-align: let; font-family: 'Rubik', sans-serif; font-style: normal; font-size: .65em; float: left;">
        VMMC</p>
    <p style="color: #666; margin: 0; padding-bottom: 0px; text-align: right; font-family: 'Rubik', sans-serif; font-style: normal; font-size: .65em">
    Página {{page}} de {{pages}}</p>
</div>

<div class="wrapper">
    <div id="table1_content"> </div>
    <div id="table2_content"> </div>
</div>
`;

ReportPage.table1_template = ` 
<p>1. Month: <span></span> 2. Year: <span></span></p>
<table id="table1" style="width: 100%;" border="none" cellpadding="1">
     <thead>
         <tr>
             <th class="title">
                 <p>3. Date of visit</p>
             </th>
             <th class="title">
                 <p>4. S/No.</p>
             </th>
             <th colspan="16" class="title">
                 <p>5. VMMC Number</p>
             </th>
             <th class="title">
                 <p>6. Surname, First Name</p>
                 <p>Address & Telephone Number</p>
             </th>
             <th class="title">
                 <p>7. Client Profile</p>
             </th>
             <th class="title">
                 <p>8. Date of Birth</p>
             </th>
             <th colspan="8" class="title">
                 <p>9. Age - Write actual age in box</p>
             </th>
             <th class="title">
                 <p>10. Informed concent</p>
             </th>
             <th class="title">
                 <p>11. HIV Test Screening</p>
             </th>
             <th class="title">
                 <p>12. HIV Test</p>
             </th>
             <th colspan="4" class="title">
                 <p>13. Final Result</p>
             </th>
         </tr>
         <tr>
             <th class="subtitle ctyp1">(DD/MM/YYYY)</th>
             <th></th>
             <th class="nvcr" colspan="16"></th>
             <th></th>
             <th class="subtitle">(Use code below)</th>
             <th class="subtitle">(DD/MM/YYYY)</th>
             <th class="subtitle">
                 <div class="vertical">15-19 years</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">20-24 years</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">25-29 years</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">30-34 years</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">35-39 years</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">40-44 years</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">45-49 years</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">50+ years</div>
             </th>
             <th class="subtitle">
                 <div class="">Yes=Y No=N</div>
             </th>
             <th class="subtitle">
                 <div class="">Yes=Y No=N</div>
             </th>
             <th class="subtitle">
                 <div class="">Yes=Y No=N</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">P-Positive</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">N-Negative</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">I-Inconclusive</div>
             </th>
             <th class="subtitle">
                 <div class="vertical">U-Unknown</div>
             </th>

         </tr>
     </thead>

     <tbody></tbody>

 </table>

 <div class="card1" id="card1" style="page-break-inside: avoid; width: 25%;">
     <div class="title"></div>
     <table cellpadding="2">
         <tbody> </tbody>
     </table>
 </div>
 <div style="page-break-before: always;"></div>
`;

ReportPage.table2_template = ` 
<p class="report-header-2" style="width: 100%;">1. Month: <span></span> 2. Year: <span></span></p>
<table id="table2" style="width: 100%;" border="none" cellpadding="1">
    <thead>
        <tr>
            <th class="title">
                <p>14. Date of</p>
                <p>circumcision</p>
            </th>
            <th class="title" colspan="2">
                <p>15. Circumcision</p>
            </th>
            <th colspan="2" class="title">
                <p>16. Adverse Event</p>
                <p>During Circumcision</p>
            </th>
            <th colspan="3" class="title">
                <p>17. Type of Health Facility</p>
            </th>
            <th class="title">
                <p>18. Name of circumciser</p>
            </th>
            <th colspan="5" class="title">
                <p>19. First Review (Day 2)</p>
            </th>
            <th colspan="5" class="title">
                <p>20. Second Review (Day 7)</p>
            </th>
            <th colspan="5" class="title">
                <p>21. Third Review (Day 14)</p>
            </th>
            <th class="title">
                <p>22. Comments</p>
            </th>
        </tr>
        <tr>
            <th></th>
            <th class="subtitle">
                <p>Surgical</p>
                <p>Dorsal Slit</p>
                <p>Yes - Y No - N</p>
            </th>
            <th class="subtitle">
                <p>Device</p>
                <p>Yes - Y No - N</p>
            </th>
            <th class="subtitle">
                <p>Adverse Event</p>
                <p>(Use codes below)</p>
            </th>
            <th class="subtitle">
                <p>Server ity of</p>
                <p>Adverse Event</p>
                <p>(Use codes below)</p>
            </th>
            <th class="subtitle">
                <p>Stat</p>
            </th>
            <th class="subtitle">
                <p>Out</p>
            </th>
            <th class="subtitle">
                <p>Mob</p>
            </th>
            <th></th>
            <th class="subtitle date">
                <p>Date</p>
            </th>
            <th class="subtitle">
                <p>Physical phy</p>
                <p>write phy</p>
            </th>
            <th class="subtitle">
                <p>Phone - 2WT</p>
                <p>write 2WT</p>
            </th>
            <th class="subtitle">
                <p>Adverce Event</p>
                <p>(Use code below)</p>
            </th>
            <th class="subtitle">
                <p>Server ity of</p>
                <p>Adverse Event</p>
                <p>(Use codes below)</p>
            </th>
            <th class="subtitle date">
                <p>Date</p>
            </th>
            <th class="subtitle">
                <p>Physical phy</p>
                <p>write phy</p>
            </th>
            <th class="subtitle">
                <p>Phone - 2WT</p>
                <p>write 2WT</p>
            </th>
            <th class="subtitle">
                <p>Adverce Event</p>
                <p>(Use code below)</p>
            </th>
            <th class="subtitle">
                <p>Server ity of</p>
                <p>Adverse Event</p>
                <p>(Use codes below)</p>
            </th>
            <th class="subtitle date">
                <p>Date</p>
            </th>
            <th class="subtitle">
                <p>Physical phy</p>
                <p>write phy</p>
            </th>
            <th class="subtitle">
                <p>Phone - 2WT</p>
                <p>write 2WT</p>
            </th>
            <th class="subtitle">
                <p>Adverce Event</p>
                <p>(Use code below)</p>
            </th>
            <th class="subtitle">
                <p>Server ity of</p>
                <p>Adverse Event</p>
            </th>
            <th class="comments"></th>
        </tr>
    </thead>
    <tbody></tbody>
</table>


<div class="card2" id="card2" style="page-break-inside: avoid;">
    <p class="title"></p>
</div>
<div class="card3" id="card3" style="page-break-inside: avoid;">
    <p class="title"></p>
</div>
<div class="card4" id="card4" style="page-break-inside: avoid;">
    <p class="title"></p>
</div>
<div class="card5" id="card5" style="page-break-inside: avoid;">
    <p class="title"></p>
</div>
<div class="card6" id="card6" style="page-break-inside: avoid;">
    <p class="title"></p>
</div>`;