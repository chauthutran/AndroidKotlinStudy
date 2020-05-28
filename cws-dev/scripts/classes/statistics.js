// -------------------------------------------
// -- localStatistics Class/Methods

function Statistics( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.langTermObj = me.cwsRenderObj.langTermObj;
    me.dtmNow = new Date().getTime();

    me.statisticsFormDiv = $( '#statisticsFormDiv' );
    //me.localStatsTag = $( '#localStatistics' );

    me.statsFormContainerTag;
    me.statsPeriodSelector;

    me.allStats = [];
    me.dateGroupStats = [];
    me.dateGroups = [];

    me.submitDateStats = {};
    me.queueDateStats = {};
    me.dataFailed;
    me.failedDateStats = {};

    me.popularDays = [];
    me.popularHours = [];
    me.activityTypes = [];
    //me.statusTypes = [];
    me.connectionTypes = [];

    me.earliestDate;
    me.hoursFrom;
    me.hoursTo;
    me.total;
    me.slideIndex; 


	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================

    me.initialize = function() 
    {
        me.slideIndex = new Date().getDay();
    }


    me.initialize_UI = function()
    {

        me.statisticsFormDiv.empty();
        //me.localStatsTag.empty();

        $( window ).scrollTop(0);

        me.statsFormContainerTag = $( Templates.statisticsFullScreen );
        me.statisticsFormDiv.append( me.statsFormContainerTag );

        me.statsPeriodSelector = me.statisticsFormDiv.find( '#stats_select_period' );
    }

    me.initialize_StatsData = function()
    {
        me.allStats = ActivityDataManager._activityList;
    }

    me.initialise_periodOptions = function( control )
    {
        var dateGroups = FormUtil.getCommonDateGroups();
        var dtmNow = new Date();

        for (var d = 0; d < dateGroups.length; d++) 
        {
            dateGroups[ d ].from = moment( dtmNow ).add( dateGroups[ d ].hours * -1, 'h').toDate().toISOString();
            dateGroups[ d ].to = dtmNow.toISOString();

            dateGroups[ d ].data = me.enrichDateCalculations( me.allStats, dateGroups[ d ].hours );
        }

        me.dateGroups = dateGroups;

        me.createStatPeriodOptions( me.statsPeriodSelector, me.dateGroups );
    }

	me.setEvents_OnRender = function()
	{	
        $( '#stats_select_period' ).change( function() {

            var opt = $('option:selected', this);
            var startPeriod = ( opt.attr( 'from' ) ); //Number( ... )
            var endPeriod = ( opt.attr( 'to' ) );     //Number( ... )
            var idx = ( opt.attr( 'idx' ) );

            console.log( idx, me.dateGroups, me.dateGroups[ idx ].data ); 

            me.dateGroupStats = me.dateGroups[ idx ].data;

            $( '#stats_t_help' ).html( 'Between ' + $.format.date( startPeriod, 'dd MMM yyyy' ) + ' and ' + $.format.date( endPeriod, 'dd MMM yyyy' ) );

            me.statEvalCode( startPeriod, endPeriod );

        });

        var cardCloseTag = me.statisticsFormDiv.find( 'img.btnBack' );

        cardCloseTag.off( 'click' ).click( function(){ 
            me.allStats = [];
            me.statisticsFormDiv.fadeOut();
            $( '#pageDiv' ).show();
        });

    }

    me.render = function()
    {
        me.initialize_UI();

        me.initialize_StatsData();

        me.setEvents_OnRender();

        me.initialise_periodOptions( me.statsPeriodSelector );

        $( '#pageDiv' ).hide();

        me.statisticsFormDiv.fadeIn();

        //me.statEvalCode( 0, 3000 );
    };

    me.createStatPeriodOptions = function ( selectTag, dateOptions )
    {
        for ( var i = 0; i < dateOptions.length; i++ )
        {
            var newOpt = $( '<option idx="' + i + '" value="' + dateOptions[ i ].hours + '" from="' + dateOptions[ i ].from + '" to="' + dateOptions[ i ].to + '" >' + dateOptions[ i ].name + '</option>' );

            selectTag.append( newOpt );
        }
    }

    me.enrichDateCalculations = function( myArr, hrTo )
    {
        var retArr = [];
        var dtmNow = new Date();

        if ( myArr && myArr.length )
        {
            for (var i = 0; i < myArr.length; i++)
            {
                var dtmThis = new Date( myArr[ i ].activityDate.capturedUTC ); //myArr[ i ].created

                myArr[ i ].ageHours = parseFloat( dtmNow - dtmThis.getTime() ) / 1000 / 60 / 60;
                myArr[ i ].hourInDay = ( dtmThis.getHours() );
                myArr[ i ].dayInWeek = ( dtmThis.getDay() );



                var e = myArr[ i ];

                //if ( parseFloat(e.ageHours) > hrFrom && parseFloat(e.ageHours) <= hrTo )
                if ( parseFloat(e.ageHours) <= hrTo )
                {
                    retArr.push( e );
                }

            }
        }

        return retArr;

    }

    // Need to pass in(?) startPeriod and endPeriod?
	me.statEvalCode = function( startPeriod, endPeriod )
	{
        var containerDiv = $( '#statsContentPage' ).html( '' );
        var INFO = { 'startPeriod': startPeriod, 'endPeriod': endPeriod };

        INFO.data = me.getActivityList_Query( INFO ); //me.dateGroupStats; 

        // STEP 1. Eval and Insert the main tag + get list of 'div.statDiv'        
        var statContentTagStr = Util.strCombine( ConfigManager.statisticConfig.statsPageContent );
        var statContentTag = $( statContentTagStr );
        containerDiv.append( statContentTag );

        // Run/Create the javascript methods
        var chartMethodsStr = Util.strCombine( ConfigManager.statisticConfig.chartMethods );
        Util.evalTryCatch( chartMethodsStr, INFO, 'chartMethodsStr' );


        statContentTag.find( 'div.statDiv' ).each( function( i, tag ) {

            var statDivTag = $( this );

            var statId = statDivTag.attr( 'statId' );

            var statObj = ConfigManager.statisticConfig.statsList[ statId ];

            if ( statObj )
            {
                // create 'sequentially processed' outputs
                if ( statObj.sequentialEval && statObj.sequentialEval === "true" )
                {
                    for (var i = 0; i < statObj.runDataEval.length; i++)
                    {
                        console.log( statObj.runDataEval[ i] );
                        var result = me.evalTry( statObj.runDataEval[ i], INFO );
                        console.log( result );
                        if ( result ) statDivTag.append( result );
                    }
                }
                else
                {

                    // add titles + text if found
                    var titleTag = ( statObj.title ? me.addTitle( statObj.title.label, statObj.title.icon ) : undefined );
                    var textTag = ( statObj.title ? me.addText( statObj.text.label ) : undefined );

                    if ( titleTag ) statDivTag.append( titleTag );
                    if ( textTag ) statDivTag.append( textTag );

                    // create 'bulk processed' output
                    var divContentStr = Util.strCombine( statObj.divContent );
                    var divContentTag = $( divContentStr );
                    statDivTag.append( divContentTag );
    
                    INFO.statChartTag = divContentTag.find( '.statChart' );
    
                    var runDataEvalStr = Util.strCombine( statObj.runDataEval );
                    
                    Util.evalTryCatch( runDataEvalStr, INFO, "statistic page runDataEval" );
                }

            }
            else
            {
                console.log( 'statId: "' + statId + '" not found in statsList' );
            }

        } );
    };

    me.evalTry = function( inputVal, INFO )
    {
        var returnVal;
    
        try
        {
            returnVal = eval( inputVal );
    
            if ( returnVal && typeof( returnVal ) === "string" ) 
            {
                returnVal = returnVal.replace( /undefined/g, '' );
            }
        }
        catch( errMsg )
        {
            console.log( 'ERROR, statistics.evalTry , errMsg - ' + errMsg + ', inputVal: ' + inputVal );
        }
    
        return returnVal;
    };

    // add/create Title?
    me.addTitle = function( text, icon)
    {
        var sectionTag = $( Templates.title_section );

        sectionTag.find('.title_section__title').html( text );

        if ( icon === 'table' )
        {
            sectionTag.find('.title_section__icon').html( Templates.svg_Table );
        }
        else if ( icon === 'activities' )
        {
            sectionTag.find('.title_section__icon').html( Templates.svg_Activities );
        }
        else if ( icon === 'details' )
        {
            sectionTag.find('.title_section__icon').html( Templates.svg_Detail );
        }
        else if ( icon === 'consult' )
        {
            sectionTag.find('.title_section__icon').html( Templates.svg_Consult );
        }
        else if ( icon === 'barChart' )
        {
            sectionTag.find('.title_section__icon').html( Templates.svg_Chart_Bar );
        }
        else if ( icon === 'pieChart' )
        {
            sectionTag.find('.title_section__icon').html( Templates.svg_Chart_Pie );
        }
        else if ( icon === 'lineChart' )
        {
            sectionTag.find('.title_section__icon').html( Templates.svg_Chart_Line );
        }

        return sectionTag;
    }

    me.addText = function( text )
    {
        var textTag = $( Templates.text_section );

        textTag.text( text );

        return textTag;
    }

    me.addTable = function( data, target )
    {
        /*function keys( jsonObj )
        {
            var keyArr = [];
            for ( var key in jsonObj[ 0 ] ) 
            {
                keyArr.push( key );
            }
            return keyArr;
        }*/
        function tabulate( data, tagID ) //columns
        {
            /*var table = d3.select( 'div[statid="'+ tagID + '"]' ).append( 'table' );
            var thead = table.append( 'thead' );
            var	tbody = table.append( 'tbody' );
    
            // append the header row
            thead.append('tr')
              .selectAll('th')
              .data(columns).enter()
              .append('th')
              .text(function (column) { return column; });
    
            // create a row for each object in the data
            var rows = tbody.selectAll('tr')
              .data(data)
              .enter()
              .append('tr');
    
            // create a cell in each row for each column
            var cells = rows.selectAll('td')
              .data(function (row) {
                return columns.map(function (column) {
                  return {column: column, value: row[column]};
                });
              })
              .enter()
              .append('td')
              .text(function (d) { return d.value; });*/

              var sortAscending = true;
              var table = d3.select( 'div[statid="'+ tagID + '"]' ).append( 'table' );
              table.attr( 'class', 'statsTable' );

              var keys = d3.keys( data[0] );
              var headers = table.append('thead').append('tr')
                  .selectAll('th')
                  .data( keys ).enter()
                  .append('th')
                  .text(function (d) {
                      return d;
                  })
                  .on('click', function (d) {
                      headers.attr('class', 'header');
                      if (sortAscending) {
                          rows.sort(function (a, b) {
                              return b[d] < a[d];
                          });
                          sortAscending = false;
                          this.className = 'aes';
                      } else {
                          rows.sort(function (a, b) {
                              return b[d] > a[d];
                          });
                          sortAscending = true;
                          this.className = 'des';
                      }
                  });

              var rows = table.append('tbody').selectAll('tr')
                  .data(data).enter()
                  .append('tr');
              rows.selectAll('td')
                  .data(function (d) {
                      return keys.map(function (k) {
                          return {
                              'value': d[k],
                              'name': k
                          };
                      });
                  }).enter()
                  .append('td')
                  .attr('data-th', function (d) {
                      return d.name;
                  })
                  .text(function (d) {
                      return d.value;
                  });
    
          return table;
        }
    
        // render the table(s)
        tabulate( data, target ); // keys( data ), 
    }

    // add/create Table?
    me.addTable1 = function( dataObj )
    {
        var jsonObj;
        var tableWrapped = $( '<div class="table-wrap" />' )
        var tbl = $( '<table class="statsTable">' );
        var th = $( '<thead>' );
        var thr = $( '<tr>' );

        tableWrapped.append( tbl );
        tbl.append( th );
        th.append( thr );

        if ( dataObj.length )
        {
            jsonObj = dataObj[ 0 ];

            for ( var key in jsonObj ) 
            {
                var th = $( '<th class="header" >' );
                thr.append( th );
    
                th.text( key );
            }
    
            var tb = $( '<tbody>' );
            tbl.append( tb );
    
            for (var i = 0; i < dataObj.length; i++)
            {
                var tbr = $( '<tr>' );
                tb.append( tbr );
    
                for ( var key in jsonObj ) 
                {
                    var td = $( '<td data-th="' + key + '">' );
                    tbr.append( td );
    
                    td.text( dataObj[ i ][ key ] );
    
                }
        
            }

        }

        return tableWrapped;
    }

    me.getActivityList_Query = function( INFO )
    {
        // type: c_reg/v_iss/v_rdm
        var type = 'c_reg';
        var clientList = ActivityDataManager.getActivityList();
        var queryResults = [];
    
        // Create activity data list - number clientRegistered, vocuher issued/redeemd
        clientList.forEach( (activity, i_c) => {
    
            console.log( activity );

            var activityData = {};

            activityData.date = activity.activityDate.capturedLoc;

            activity.transactions.forEach( (trans, i_t) => {

                if ( trans.transactionType === type ) 
                {
                    // INFO.startPeriod - INFO.endPeriod
                    queryResults.push( ( trans.clientDetails ) ? trans.clientDetails : trans.dataValues );
                }
            
            });

        });

        return queryResults;
    }

	me.testStatisticContent = function()
	{
		var containerDiv = $( '#statsContentPage' );

		// display total.
        var activityDataList = [];

        var clientList = DevHelper.sampleDataList;
        
        // Create activity data list - number clientRegistered, vocuher issued/redeemd
        clientList.forEach( (client, i_c) => {

            client.activities.forEach( (activity, i_a) => {

                var activityData = {};

                activityData.date = activity.activityDate.capturedLoc;
                activityData.n_reg = 0;
                activityData.n_iss = 0;
                activityData.n_rdm = 0;
                //activityData.activityId = activity.activityId;
                //activityData.clientId = client._id;

                activity.transactions.forEach( (trans, i_t) => {

                    if ( trans.transactionType === 'c_reg' ) activityData.n_reg++;
                    else if ( trans.transactionType === 'v_iss' ) activityData.n_iss++;
                    else if ( trans.transactionType === 'v_rdm' ) activityData.n_rdm++;                    
                });

                activityDataList.push( activityData );
            });
        });

        console.log( 'activityDataList:' );
        console.log( activityDataList );


        var activityCF = crossfilter( activityDataList );

        var totalVoucherIssued = activityCF.groupAll().reduceSum( function( activity ) { return activity.n_iss; }).value();


        console.log( 'totalVoucherIssued' );
        console.log( totalVoucherIssued );


        var dateDim = activityCF.dimension( function( activity ) { 
            return activity.date;
        });

        var dateGroup = dateDim.group( function( dateStr ) {
            return dateStr.substring(0, 7);
        });

        var info = dateGroup.top(Infinity);

        console.log( 'info' );
        console.log( info );



        var byYearMonth = {};

        activityDataList.forEach( (activity, i_a) => {

            var yearMonthStr = activity.date.substring( 0, 7 );
            if ( !byYearMonth[ yearMonthStr ] ) byYearMonth[ yearMonthStr ] = { 'n_reg': 0, 'n_iss': 0, 'n_rdm': 0 };

            var yearMonthObj = byYearMonth[ yearMonthStr ];

            yearMonthObj.n_reg += activity.n_reg;
            yearMonthObj.n_iss += activity.n_iss;
            yearMonthObj.n_rdm += activity.n_rdm;
        });


        var byYearMonthArr = [];

        Object.keys( byYearMonth ).forEach( function( yearMonthStr ) {

            var oVal = byYearMonth[yearMonthStr];

            byYearMonthArr.push( [ yearMonthStr, oVal.n_reg, oVal.n_iss, oVal.n_rdm ] );
        });
    

        console.log( byYearMonthArr );


        var table = d3.select("#table").append("table");
        var header = table.append("thead").append("tr");

        header.selectAll("th")
                .data(["yearMonth", "n_reg", "n_iss", "n_rdm"])
                .enter()
                .append("th")
                .text(function(d) { return d; });

        var tablebody = table.append("tbody");
        rows = tablebody
                .selectAll("tr")
                .data(byYearMonthArr)
                .enter()
                .append("tr");

        // We built the rows using the nested array - now each row has its own array.
        cells = rows.selectAll("td")
            // each row has data associated; we get it and enter it for the cells.
                .data(function(d) {
                    console.log(d);
                    return d;
                })
                .enter()
                .append("td")
                .text(function(d) {
                    return d;
                });        

	};

    me.toTable = function( arrObj, title )
    {
        
        var tbl = $( '<table class="tableStatistics column">' );

        var trTitle = $( '<tr>' );
        var tdTitle = $( '<td class="tableTitle" colspan="' + arrObj.length + '">' );

        tdTitle.html( title );

        tbl.append( trTitle );
        trTitle.append( tdTitle );

        var trName = $( '<tr>' );
        var trData = $( '<tr>' );

        for (var i = 0; i < arrObj.length; i++)
        {

            var tdName = $( '<td class="columnLabel">' );
            var tdData = $( '<td class="columnData">' );

            tbl.append( trData );
            trData.append( tdData );
            tbl.append( trName );
            trName.append( tdName );

            tdName.html( arrObj[ i ].name );

            if ( arrObj[ i ].data && arrObj[ i ].data.length )
            {
                tdData.html( arrObj[ i ].data.length );
            }


        }

        var trFiller = $( '<tr>' );
        var tdFiller = $( '<td class="columnFiller" colspan="' + arrObj.length + '">' );

        tbl.append( trFiller );
        trFiller.append( tdFiller );
        tdFiller.html( '&nbsp;' );

        return tbl;
    }


    me.hideStatsPage = function()
    {
        me.statisticsFormDiv.fadeOut( 500 );

        setTimeout( function() {
            if ( FormUtil.checkLogin() )
            {
                //$( 'div.mainDiv' ).show( 'fast' );
                me.cwsRenderObj.renderBlockTag.show( 'fast' );
            }
            else
            {
                $( '#loginFormDiv' ).show( 'fast' );
            }
            me.statisticsFormDiv.hide();
		}, 250 );

    }

    me.getSpecialNote = function( earliest )
    {
        return $( '<div class="icon-row" style="padding: 8px 4px;line-height:18px"><strong term="">Note: </strong><span term="">the statistic displayed above are calculated based on the activities registered using this device since earliest date </span><strong>' + Util.dateToString( earliest ) + '</strong></div>')
    }

    me.getNoDataMessage = function()
    {
        return $( '<div class="" style="font-size: 12px;padding: 8px 4px;line-height:18px"><span term="">no local Statistics available </span></div>')
    }

	me.initialize();

}