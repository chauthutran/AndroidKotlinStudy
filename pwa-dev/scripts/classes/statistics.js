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
    me.statsContentPageTag;

    me.dateFilterField = 'createdOnDeviceUTC';

    me.allStats = [];
    me.statMetaSummary = {};

    me.templateURL = '';
    me.templateLayout;
    me.templateCode;

    me._clientList_Clone = [];  // local modified copy of clientList - used for statistics.


	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================

    me.initialize = function() 
    {
        
    }

    me.render = function()
    {
        $( '#pageDiv' ).hide();  // TODO: WILL REMOVE THIS SOON..

        me.initialize_UI();

        //me.initialize_Data();
        me.initialise_periodOptions( me.statsPeriodSelector );

        me.setEvents_OnRender();

        me.applyPeriodSelection( me.statsPeriodSelector, function( startPeriod, endPeriod ) {

            me.loadStatConfigPage( me.statsContentPageTag, function() {

                me._clientList_Clone = me.prepareClientListData( ClientDataManager.getClientList() );            

                // This method should have been loaded by above 'script' content eval
                renderAllStats( me._clientList_Clone, startPeriod, endPeriod );
            });    
        });

        me.statisticsFormDiv.fadeIn();
    };

    // -------------------------------------------------

    me.initialize_UI = function()
    {
        $( window ).scrollTop(0);

        //me.statsFormContainerTag = $( Templates.statisticsFullScreen );
        me.statisticsFormDiv.empty().append( Templates.statisticsFullScreen );

        me.statsContentPageTag = me.statisticsFormDiv.find( ".statsContentPage" );

        me.statsPeriodSelector = me.statisticsFormDiv.find( '.stats_select_period' ).addClass( 'disabled' );
        
    };

    
	me.setEvents_OnRender = function()
	{	
        me.statsPeriodSelector.change( function() {

            // Wipe the conent blank - if there is period selection change event..
            //me.statsContentPageTag.empty();  <-- we can not emtpy it... Need HTML tags..
            var loadingImg_statisticTag = me.statisticsFormDiv.find( '.loadingImg_statistic' ).show();

            setTimeout( function() {

                loadingImg_statisticTag.hide();
                //console.customLog( 'Period Selector Changed' );
            
                me.applyPeriodSelection( me.statsPeriodSelector, function( startPeriod, endPeriod ) {        
    
                    renderAllStats( me._clientList_Clone, startPeriod, endPeriod );
                });
    
            }, 700 );

        });


        me.statisticsFormDiv.find( '.btnCustomPeriodRun' ).click( function() {

            //console.customLog( 'Custom Period button clicked' );

            var inputCustomPeriod_StartTag = me.statisticsFormDiv.find( '.inputCustomPeriod_Start' );
            var inputCustomPeriod_EndTag = me.statisticsFormDiv.find( '.inputCustomPeriod_End' );

            renderAllStats( me._clientList_Clone, inputCustomPeriod_StartTag.val(), inputCustomPeriod_EndTag.val() );
        });


        me.statisticsFormDiv.find( 'img.btnBack' ).off( 'click' ).click( function()
        { 
            //console.customLog( 'CardClose button clicked' );
            me.allStats = [];
            me.statisticsFormDiv.fadeOut();
            $( '#pageDiv' ).show();
        });
    };


    me.applyPeriodSelection = function( statsPeriodSelector, callBack )
    {
        var opt = $( 'option:selected', statsPeriodSelector );
        var opt_startPeriod = opt.attr( 'from' );
        var opt_endPeriod = opt.attr( 'to' );

        var divDateInfoTag = me.statisticsFormDiv.find( '.stats_t_info' );
        var divCustomDateTag = me.statisticsFormDiv.find( '.stats_t_custom' );


        // if 'custom', display...
        if ( opt_startPeriod === 'custom' || opt_endPeriod === 'custom' )
        {
            divDateInfoTag.hide();

            // Set custom value if already decided
            if ( opt_startPeriod !== 'custom' ) divCustomDateTag.find( '.inputCustomPeriod_Start' ).val( opt_startPeriod );
            if ( opt_endPeriod !== 'custom' ) divCustomDateTag.find( '.inputCustomPeriod_End' ).val( opt_endPeriod );

            divCustomDateTag.show( 'fast' );
        }
        else
        {
            divCustomDateTag.hide();

            divDateInfoTag.find( '.spanPeriod_Start' ).text( ( opt_startPeriod ) ? opt_startPeriod : 'ALL' );
            divDateInfoTag.find( '.spanPeriod_End' ).text( ( opt_endPeriod ) ? opt_endPeriod : 'ALL' );

            divDateInfoTag.show( 'fast' );

            // 'Select a period' has '0' value
            if ( opt_startPeriod !== '0' && opt_endPeriod !== '0' ) 
            {
                callBack( opt_startPeriod, opt_endPeriod );
            }
        }
    };


    me.loadStatConfigPage = function( statsContentPageTag, callBack )
    {
        statsContentPageTag.empty();

        var statJson = ConfigManager.getStatisticJson();

        console.customLog( 'loadStatConfigPage - statisticJson Used: ' + JSON.stringify( statJson ) );
        
        if ( statJson.fileName )
        {
            var statisticPage = AppInfoManager.getStatisticPages( statJson.fileName );

            var dom_parser = new DOMParser(); // parse HTML into DOM document object 
            var doc = dom_parser.parseFromString( statisticPage, "text/html"); // doc.body.innerHTML = body part 


            // 1. Append HTML Tags
            statsContentPageTag.empty().append( doc.body.innerHTML );
            statsContentPageTag.find( '#statsContent' ).css( 'margin', '100px 5px 40px 10px' );  // Use this if margin is not already set like this..

            // 2. Script bring and run - 'mainRunScript'
            [].map.call( doc.getElementsByTagName('script'), function( el ) 
            {
                try
                {
                    //console.customLog( el );
                    if ( el.id === 'mainScript' )
                    {
                        statsContentPageTag.append( '<script>' + el.textContent + '</' + 'script>' );
                    }
                    else if ( el.getAttribute( "wfaload" ) === "true" )
                    {
                        statsContentPageTag.append( '<script src="' + el.getAttribute( "src" ) + '"></' + 'script>' );
                    }    
                }
                catch ( errMsg ) {
                    console.customLog( errMsg );
                }
            });


            // 3. Style bring and apply 
            [].map.call( doc.getElementsByTagName('style'), function( el ) 
            {
                try
                {
                    if ( el.id === 'mainScript' )
                    {
                        var styleStr = '<style>' + el.textContent + '</' + 'style>';
                        statsContentPageTag.append( styleStr );
                    }
                }
                catch ( errMsg ) {
                    console.customLog( errMsg );
                }
            });


            // 4. Style link file
            [].map.call( doc.getElementsByTagName('link'), function( el ) 
            {
                try
                {
                    if ( el.getAttribute( "wfaload" ) === "true" )
                    {
                        statsContentPageTag.append( '<link ref="stylesheet" href="' + el.getAttribute( "href" ) + '">' );
                    }
                }
                catch ( errMsg ) {
                    console.customLog( errMsg );
                }
            });

            if ( callBack ) callBack();
        }
    };


    me.prepareClientListData = function()
    {
        var clientList_Clone = Util.cloneJson( ClientDataManager.getClientList() );

        StatsUtil.markBackLinkId( clientList_Clone );
        StatsUtil.setUpIndexList_ClientActivity( clientList_Clone );
        StatsUtil.tranDataCombine( clientList_Clone );

        return clientList_Clone;
    };


    // -----------------------------------------------


    me.initialise_periodOptions = function( control )
    {
        var periodOptions = me.getPeriodOpts();

        // NOTE: Disabled for now:
        //      - Removing periodOptions that falls outside of date range
        //      - Counting/Organizing data that falls into the date range

        // new Date( me.statMetaSummary[ 'from' ] ).toISOString().split( 'T' )[ 0 ]
        //, new Date( me.statMetaSummary[ 'to' ] ).toISOString().split( 'T' )[ 0 ] );
        
        // Based on the dates from/to, set the data array from full activity list.
        //for (var d = 0; d < dateGroups.length; d++ ) { dateGroups[ d ].data = me.getRecordsForDateGroup( me.allStats, dateGroups[ d ] ); }

        //console.customLog( periodOptions );

        me.createStatPeriodOptions( me.statsPeriodSelector, periodOptions );
    };


    me.getPeriodOpts = function()
    {
        // Get period options from config json.  Filter by enabled true.

        // TODO: date eval expression is using ISO, not local date.  Need to change it later..
        // Add custom fitlering..
        var opts = ConfigManager.periodSelectorOptions;
        var fetchGroups = [];
        
        for ( var key in opts )
        {
            var newOpt = opts[ key ];
            var newFrom = ( newOpt.from ) ? eval( newOpt.from ) : '';
            var newTo = ( newOpt.to ) ? eval( newOpt.to ) : '';

            if ( newOpt.enabled === 'true' )
            {
                fetchGroups.push( { "name": newOpt.name
                    , "term": ( newOpt.term ) ? newOpt.term : ''
                    , "from": newFrom
                    , "to": newTo
                    , "selected": ( newOpt.defaultOption === 'true' )
                });
            }

            // REMOVED: Optional param to filter the period options that falls outside of date range
            // if ( rangeFrom && rangeTo ) if ( ( new Date( newFrom ) <= new Date( rangeFrom ) && new Date( newTo ) >= new Date( rangeFrom )  ) || ( new Date( newFrom ) <= new Date( rangeTo ) && new Date( newTo ) >= new Date( rangeTo )  ) )
        }

        return fetchGroups;
    };


    me.createStatPeriodOptions = function ( selectTag, periodOptions )
    {
        for ( var i = 0; i < periodOptions.length; i++ )
        {
            var option = periodOptions[ i ];

            var newOpt = $( '<option from="' + option.from + '" to="' + option.to + '" >' + option.name + '</option>' );

            if ( option.selected ) newOpt.attr( 'selected', 'selected' );

            selectTag.append( newOpt );
        }
    };


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
    };

    // -----------------------------------------------

	me.initialize();

}