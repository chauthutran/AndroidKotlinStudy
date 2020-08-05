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

        me.loadStatConfigPage( function() {
            me._clientList_Clone = me.prepareClientListData( ClientDataManager.getClientList() );            
            // This method should have been loaded by above 'script' content eval
            renderAllStats( me._clientList_Clone );
        });

        me.statisticsFormDiv.fadeIn();
    };

    // -------------------------------------------------

    me.initialize_UI = function()
    {
        me.statisticsFormDiv.empty();

        $( window ).scrollTop(0);

        me.statsFormContainerTag = $( Templates.statisticsFullScreen );
        me.statisticsFormDiv.append( me.statsFormContainerTag );

        me.statsPeriodSelector = me.statisticsFormDiv.find( '#stats_select_period' );
        me.statsPeriodSelector.addClass( 'disabled' );
    };

    
	me.setEvents_OnRender = function()
	{	
        me.statsPeriodSelector.change( function() {

            console.log( 'Period Selector Changed' );

            var opt = $( 'option:selected', this );
            var startPeriod = opt.attr( 'from' );
            var endPeriod = opt.attr( 'to' );
            
            // TODO:
            // if 'startPeriod' / 'endPeriod' is 'custom', we need to display the ...
            //      - for further date selection..


            $( '#stats_t_help' ).html( 'Between ' + startPeriod + ' and ' + endPeriod );

            renderAllStats( me._clientList_Clone, startPeriod, endPeriod );
        });

        var cardCloseTag = me.statisticsFormDiv.find( 'img.btnBack' );

        cardCloseTag.off( 'click' ).click( function()
        { 
            console.log( 'CardClose button clicked' );
            me.allStats = [];
            me.statisticsFormDiv.fadeOut();
            $( '#pageDiv' ).show();
        });
    };


    me.loadStatConfigPage = function( callBack )
    {
        var rawbase = 'https://www.psi-connect.org/connectGitConfig/api/getFile?';
        var jsonloc = 'type=dc_pwa&branch=dev&fileName=dc_pwa@LA@stat1.html';

        var templateURL = rawbase + jsonloc;
        console.log( templateURL );

        WsCallManager.requestGet_Text( templateURL, {}, undefined, function( success, returnData ) {

            //console.log( returnData );

            if ( returnData )
            {
                var statsContentPageTag = $( "#statsContentPage" );

                var dom_parser = new DOMParser(); // parse HTML into DOM document object 
                var doc = dom_parser.parseFromString( returnData , "text/html"); // doc.body.innerHTML = body part 


                // 1. Append HTML Tags
                statsContentPageTag.empty().append( doc.body.innerHTML );


                // 2. Script bring and run - 'mainRunScript'
                [].map.call( doc.getElementsByTagName('script'), function( el ) 
                {
                    try
                    {
                        console.log( el );
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
                        console.log( errMsg );
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
                        console.log( errMsg );
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
                        console.log( errMsg );
                    }
                });

                if ( callBack ) callBack();
            }
        });
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

        console.log( periodOptions );

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
                fetchGroups.push( { "name": newOpt.name, "term": ( newOpt.term ) ? newOpt.term : '', "from": newFrom, "to": newTo } );
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
            var newOpt = $( '<option from="' + periodOptions[ i ].from + '" to="' + periodOptions[ i ].to + '" >' + periodOptions[ i ].name + '</option>' );

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