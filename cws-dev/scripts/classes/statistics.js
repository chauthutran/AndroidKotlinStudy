// -------------------------------------------
// -- localStatistics Class/Methods

function Statistics( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.langTermObj = me.cwsRenderObj.langTermObj;

    me.statisticsFormDiv = $( '#statisticsFormDiv' );
    me.statsFormContainerTag;
    me.statsPeriodSelector;
    me.dateFilterField = 'createdOnDeviceUTC';

    me.allStats = [];
    me.statMetaSummary = {};


	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================

    me.initialize = function() 
    {
        
    }

    me.render = function()
    {
        me.initialize_UI();

        me.initialize_Data();

        me.setEvents_OnRender();

        $( '#pageDiv' ).hide();

        me.statisticsFormDiv.fadeIn();

    };

    me.initialize_UI = function()
    {
        me.statisticsFormDiv.empty();

        $( window ).scrollTop(0);

        me.statsFormContainerTag = $( Templates.statisticsFullScreen );
        me.statisticsFormDiv.append( me.statsFormContainerTag );

        me.statsPeriodSelector = me.statisticsFormDiv.find( '#stats_select_period' );
    }

    me.initialize_Data = function()
    {
        var allDates = [];

        // get local ActivityList
        me.allStats = ActivityDataManager._activityList;

        // get date Ranges for local ActivityList > Already sorted  << *not sorting correctly...
        //me.allStats.sort( ( a, b ) => a.date[ me.dateFilterField ] - b.date[ me.dateFilterField ] );

        // sort activityDates
        for (var i = 0; i < me.allStats.length; i++)
        {
            allDates.push( new Date( me.allStats[ i ].date[ me.dateFilterField ] ).toISOString() );
        }
        allDates.sort();

        me.statMetaSummary[ 'from' ] = allDates[ 0 ]; // me.allStats[ 0 ].date[ me.dateFilterField ];
        me.statMetaSummary[ 'to' ] = allDates[ allDates.length -1 ]; //me.allStats[ me.allStats.length -1 ].date[ me.dateFilterField ];
        me.statMetaSummary[ 'count' ] = me.allStats.length;

        me.initialise_periodOptions( me.statsPeriodSelector );

    }

    me.initialise_periodOptions = function( control )
    {
        var dateGroups = me.getPeriodOpts( new Date( me.statMetaSummary[ 'from' ] ).toISOString().split( 'T' )[ 0 ], new Date( me.statMetaSummary[ 'to' ] ).toISOString().split( 'T' )[ 0 ] );

        for (var d = 0; d < dateGroups.length; d++) 
        {
            dateGroups[ d ].data = me.getRecordsForDateGroup( me.allStats, dateGroups[ d ] );
        }

        me.createStatPeriodOptions( me.statsPeriodSelector, dateGroups );
    }

	me.setEvents_OnRender = function()
	{	
        $( '#stats_select_period' ).change( function() {

            var opt = $( 'option:selected', this );
            var startPeriod = opt.attr( 'from' );
            var endPeriod = opt.attr( 'to' );

            $( '#stats_t_help' ).html( 'Between ' + startPeriod + ' and ' + endPeriod );

            me.runDateFilterAndRenderConfig( startPeriod, endPeriod );

        });

        var cardCloseTag = me.statisticsFormDiv.find( 'img.btnBack' );

        cardCloseTag.off( 'click' ).click( function(){ 
            me.allStats = [];
            me.statisticsFormDiv.fadeOut();
            $( '#pageDiv' ).show();
        });

    }


    me.createStatPeriodOptions = function ( selectTag, dateOptions )
    {
        for ( var i = 0; i < dateOptions.length; i++ )
        {
            var newOpt = $( '<option from="' + dateOptions[ i ].from + '" to="' + dateOptions[ i ].to + '" >' + dateOptions[ i ].name + '</option>' );

            selectTag.append( newOpt );
        }
    }

    me.getRecordsForDateGroup = function( myArr, periodOpt )
    {
        var retArr = [];

        if ( myArr && myArr.length )
        {
            for (var i = 0; i < myArr.length; i++)
            {
                var dtmThis = new Date( myArr[ i ].date[ me.dateFilterField ] ); //myArr[ i ].created

                if ( new Date( dtmThis ) >= new Date( periodOpt.from ) && new Date( dtmThis ) <= new Date( periodOpt.to ) )
                {
                    retArr.push( myArr[ i ] );
                }

            }
        }

        return retArr;

    }

    // Need to pass in(?) startPeriod and endPeriod?
	me.runDateFilterAndRenderConfig = function( startPeriod, endPeriod )
	{
        var containerDiv = $( '#statsContentPage' ).html( '' );
        var INFO = { 'startPeriod': startPeriod, 'endPeriod': endPeriod, data: { } };
        var trxTypes = Configs.transactionTypes; 

        // STEP 1. create data.trxType arrays (for quick filtering/reference)
        trxTypes.forEach( (trxType, i_a) => {
            var itms = me.getActivityList_Query( startPeriod, endPeriod, trxType );
            INFO.data[ trxType.name ] = itms;
        });

        console.log( INFO );

        // STEP 2. run config Eval and Insert the main tag + get list of 'div.statDiv'        
        var statContentTagStr = Util.strCombine( ConfigManager.statisticConfig.statsPageContent );
        var statContentTag = $( statContentTagStr );
        containerDiv.append( statContentTag );


        // STEP 3. for each object container - run associated code config
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
                        var result = me.evalTry( statObj.runDataEval[ i], INFO );
                        //if ( result ) console.log( result );
                        if ( result ) statDivTag.append( result );
                    }
                }
                else
                {

                    // add titles + text if found
                    var titleTag = ( statObj.title ? me.addTitle( statObj.title.label, statObj.title.icon ) : undefined );
                    var textTag = ( statObj.text ? me.addText( statObj.text.label ) : undefined );

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



    /* DATA MANIPULATION FUNCTIONS */


    me.getActivityList_Query = function( startPeriod, endPeriod, trxType )
    {
        // MAIN QUERYING FUNCTION 

        var clientList = me.allStats;
        var queryResults = [];
    
        // Create activity data list - number clientRegistered, vocuher issued/redeemd
        clientList.forEach( (activity, i_c) => {

            activity.transactions.forEach( (trans, i_t) => {

                if ( trans.transactionType === trxType.name && ( new Date( activity.date[ me.dateFilterField ] ) >= new Date( startPeriod ) ) && ( new Date( activity.date[ me.dateFilterField ] ) <= new Date( endPeriod ) ) ) 
                {
                    var newObj = { 'activityType': activity.activityType,'transactionType': trxType.name, 'transactionDate': activity.date[ me.dateFilterField ], 'transactionYear': new Date( activity.date[ me.dateFilterField ] ).getFullYear(), 'transactionYearMonth': ( new Date( activity.date[ me.dateFilterField ] ).toISOString().split( 'T')[0] ).replace(/-/g,'').substring(0,6) };

                    if ( trxType.dataContainer.includes( 'clientDetails' ) && trans.clientDetails )
                    {
                        newObj = $.extend(newObj, trans.clientDetails);
                    }
                    if ( trxType.dataContainer.includes( 'dataValues' ) && trans.dataValues )
                    {
                        newObj = $.extend(newObj, trans.dataValues);
                    }
                    //if ( trans.clientDetails ) newObj = $.extend(newObj, trans.clientDetails);
                    //if ( trans.dataValues ) newObj = $.extend(newObj, trans.dataValues);
                    queryResults.push( newObj );
                }

            });

        });

        return queryResults;
    }

    me.groupBy = function( data, groupFls )
    {
        const valueLabel = 'count';

        var cf = crossfilter( data );
        var newData = [];

        // single field parsed by name instead of inside array
        if ( typeof groupFls === 'string' )
        {
            var byField = cf.dimension( function(p) { return p[ groupFls ]; } );
            var groupByPart = byField.group();
    
            groupByPart.top( Infinity ).forEach( function( p, i ) {
                newData.push( { [ groupFls ]: p.key, [ valueLabel ]: p.value } );
            });
        }
        else if ( typeof groupFls === 'object' && Array.isArray( groupFls ) )
        {
            // 1. create 'string' json object for all fields in array
            var byFields = cf.dimension(function (d) {
                var retGrp = {};
                for (var i = 0; i < groupFls.length; i++)
                {
                    retGrp[ groupFls[i] ] = d[ groupFls[i] ];
                }
                //stringify() and later, parse() to get keyed objects
                return JSON.stringify ( retGrp ) ;
              });

              // 2. run 'group' method
              var groupByPart = byFields.group();

              // 3. reformat groupBy fields into proper JSON
              groupByPart.top( Infinity ).forEach( function( d, i ) {
                d.key = JSON.parse( d.key );
              });

              // 4. move groupBy fields up into parent array-object
              groupByPart.all().forEach( function( d ) {
                    var newD = {};
                    for ( var key in d.key ) 
                    {
                        newD[ key ] = d.key[ key ];
                    }
                    newD[ valueLabel ] = d.value;
                    newData.push( newD );
              });
        }

        return newData;
    }

    me.createGroup = function( myArray, inputField, outputField, groupDef )
    {
        myArray.forEach( function( d ) {
            if ( ! d [ inputField ] )
            {
                d [ outputField ] = ''; //default Null
            }
            else
            {
                groupDef.forEach( function( q ) {
                    if ( d [ inputField ] >= q.from && d [ inputField ] <= q.to )
                    {
                        d [ outputField ] = q.name;
                    }
                });
            }
          });
        return myArray;
    }

    me.pivot = function( dataArray, rowIdx, colIdx, dataIdx) 
    {
        var result = {}, ret = [], newCols = [];

        for (var i = 0; i < dataArray.length; i++) 
        {

            if ( ! result[ dataArray[ i ][ rowIdx ] ] )
            {
                result[ dataArray[ i ][ rowIdx ] ] = {};
            }

            result[ dataArray[ i ][ rowIdx ] ][ dataArray[ i ][ colIdx ] ] = dataArray[ i ][ dataIdx ];
 
            //To get column names
            if ( ! newCols.includes( dataArray[ i ][ colIdx ] ) ) 
            {
                newCols.push( dataArray[ i ][ colIdx ] );
            }

        }
 
        newCols.sort();

        var item = [];
 
        //Add Header Row
        item.push( 'item' );
        item.push.apply( item, newCols );
        ret.push( item );
 
        //Add content 
        for ( var key in result )
        {
            item = [];
            item.push(key);

            for (var i = 0; i < newCols.length; i++) 
            {
                item.push( result[ key ][ newCols[ i ] ] || ' ' );
            }

            ret.push( item );
        }

        return ret;
    }


    me.evalTry = function( inputVal, INFO )
    {
        // main try/catch eval function for stats config
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


    /* DATA PRESENTATION METHODS */


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

    me.addTag = function( dataVal, target, tagType, tagClass )
    {
        var inner = $( '<' + tagType + '>' + dataVal + '</' + tagType + '>' );

        if ( tagClass && tagClass.length ) inner.addClass( tagClass );

        $( 'div[statid="'+ target + '"]' ).append( inner );
    }

    me.addTable = function( data, target )
    {

        function tabulate( data, tagID ) //columns
        {
              var sortAscending = true;
              var table = d3.select( 'div[statid="'+ tagID + '"]' ).append( 'table' );
              var titles = d3.keys(data[0]);
              var headers = table.append('thead').append('tr')
                    .selectAll('th')
                    .data(titles).enter()
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
                        return titles.map(function (k) {
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
        tabulate( data, target ); 
    }


    me.addDimensionTable = function( data, target, layoutParms )
    {
        var defLay1 = { groupBy: [ 'Country' ], pivot: 'period', value: 'value', function: 'SUM', rowTotals: 'true', colTotals: 'true' };
        var defLay2 = { dim: 'Country', piv: 'period', val: 'value', aggr: 'sum', rowTotals: 'false', colTotals: 'false' };
        var layout = layoutParms ? layoutParms : defLay1;

        function dimTabulate( data, tagID ) //columns
        {
            $( 'div[statid="'+ tagID + '"]' ); //.addClass( 'table_container' );

              var table = d3.select( 'div[statid="'+ tagID + '"]' ).append( 'table' );
              var titles = d3.keys(data[0]);
              var sortAscending = true;

              table.attr('class', me.classFromKeys( titles ) );

              var headers = table.append('thead').append('tr')
                    .selectAll('th')
                    .data(titles).enter()
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
                            //this.className = 'aes';
                        } else {
                            rows.sort(function (a, b) {
                                return b[d] > a[d];
                            });
                            sortAscending = true;
                            //this.className = 'des';
                        }

                    });

                var rows = table.append('tbody').selectAll('tr')
                    .data(data).enter()
                    .append('tr');
                rows.selectAll('td')
                    .data(function (d) {
                        return titles.map(function (k) {
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
        dimTabulate( data, target ); 
    }


    me.pivotTable = function( data, target )
    {

        function tabulate( data, tagID ) //columns
        {
              var sortAscending = true;
              var table = d3.select( 'div[statid="'+ tagID + '"]' ).append( 'table' );
              var titles = d3.keys(data[0]);

                var rows = table.append('tbody').selectAll('tr')
                    .data(data).enter()
                    .append('tr');
                rows.selectAll('td')
                    .data(function (d) {
                        return titles.map(function (k) {
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
        tabulate( data, target ); 
    }


    /* OTHER METHODS*/

    me.hideStatsPage = function()
    {
        me.statisticsFormDiv.fadeOut( 500 );

        setTimeout( function() {
            if ( SessionManager.Status_LoggedIn )
            {
                me.cwsRenderObj.renderBlockTag.show( 'fast' );
            }
            else
            {
                if ( ! $( '#loginFormDiv' ).is( ':visible' ) ) $( '#loginFormDiv' ).show( 'fast' );
            }
            me.statisticsFormDiv.hide();
		}, 250 );

    }

    me.getPeriodOpts = function( rangeFrom, rangeTo )
    {
        var opts = ConfigManager.periodSelectorOptions;
        var fetchGroups = [];

        for ( var key in opts )
        {
            var newOpt = opts[ key ];
            var newFrom = eval( newOpt.from );
            var newTo = eval( newOpt.to );

            if ( newOpt.enabled === 'true' )
            {
                if ( rangeFrom && rangeTo )
                {
                    if ( ( new Date( newFrom ) <= new Date( rangeFrom ) && new Date( newTo ) >= new Date( rangeFrom )  ) || ( new Date( newFrom ) <= new Date( rangeTo ) && new Date( newTo ) >= new Date( rangeTo )  ) )
                    {
                        fetchGroups.push( { "name": newOpt.name, "term": ( newOpt.term ) ? newOpt.term : '', "from": newFrom, "to": newTo } );	
                    }
                }
                else
                {
                    fetchGroups.push( { "name": newOpt.name, "term": ( newOpt.term ) ? newOpt.term : '', "from": newFrom, "to": newTo } );
                }
            }

        }

        return fetchGroups;
    };


    me.classFromKeys = function( arr )
    {
        if ( arr.length >= 6 )
        {
            return 'from_six_cols';
        }
        else if ( arr.length === 5 )
        {
            return 'five_cols';
        }
        else if ( arr.length === 4 )
        {
            return 'four_cols';
        }
        else 
        {
            return 'three_cols';
        }
           
    }

	me.initialize();

}