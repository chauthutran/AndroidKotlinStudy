// -------------------------------------------
// -- localStatistics Class/Methods

function statistics( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
    me.langTermObj = me.cwsRenderObj.langTermObj;
    me.dtmNow = new Date().getTime();

    me.statisticsFormDiv = $( '#statisticsFormDiv' );
    me.localStatsTag = $( '#localStatistics' );

    me.submitDateStats = {};
    me.queueDateStats = {};
    me.dataFailed;
    me.failedDateStats = {};

    me.activityTypes = [];
    me.statusTypes = [];

    me.earliestDate;

    me.dateGroups;
    me.hoursInDay;

    /* = [ 
        { name: "today", hours: 24, group: 'daily' },
        { name: "yesterday", hours: 48, group: 'daily' },
        { name: "last 7 days", hours: 168 , group: 'weekly' },
        { name: "prev 7 days", hours: 336, group: 'weekly' },
        { name: "this Month", hours: 168 , group: 'monthly' },
        { name: "last Month", hours: 336, group: 'monthly' },
    ];*/

	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================

    me.initialize = function() 
    {
        me.setEvents_OnInit();
    }

    
	me.setEvents_OnInit = function()
	{	

        $( 'img.btnStatsBack' ).click( () =>
        {
            me.hideStatsPage();
		});

    }

    me.render = function()
    {
        me.activityTypes = me.getActivityTypes();
        me.statusTypes = me.getStatusTypes();
        me.dateGroups = FormUtil.getCommonDateGroups();
        me.hoursInDay = me.getHoursInDay();

        me.createLocalAnalytics();

        me.showStatsPage()
        me.colorize();
    }

    me.showStatsPage = function()
	{
        if ( $( 'div.mainDiv' ).is( ":visible" ) )
        {
            $( 'div.mainDiv' ).hide();
        }
        if ( $( '#loginFormDiv' ).is( ":visible" ) )
        {
            $( '#loginFormDiv' ).hide();
        }
        if ( $( '#aboutFormDiv' ).is( ":visible" ) )
        {
            $( '#aboutFormDiv' ).hide();
		}

		me.statisticsFormDiv.show( 'fast' );

    }

    me.colorize = function()
    {
        var dataTags = me.localStatsTag.find( 'td.columnData' );

        for (var i = 0; i < dataTags.length; i++)
        {
            if ( $( dataTags[ i ] ).html() == '0' )
            {
                $( dataTags[ i ] ).css( 'color', '#C0C0C0 !important' );
            }
        }


    }

    me.getStatusTypes = function()
    {
        var retArr = [];

        retArr.push( { name: me.cwsRenderObj.status_redeem_submit } );
        retArr.push( { name: me.cwsRenderObj.status_redeem_queued } );
        retArr.push( { name: me.cwsRenderObj.status_redeem_failed } );

        return retArr;
    }

    me.getHoursInDay = function()
    {
        var retArr = [];

        for (var i = 0; i < 24; i++)
        {
            retArr.push( { name: i } );
        }

        return retArr;

    }

    // ==== Methods ======================
    me.getActivityTypes = function()
    {
        // get different 'Areas' or Activity-Types
        var sessData = localStorage.getItem('session');
        var retArr = [];

        if ( sessData )
        {
            var itms = JSON.parse( localStorage.getItem( JSON.parse( sessData ).user ) ).dcdConfig.settings.redeemDefs.activityTypes;

            if ( itms && itms.length )
            {
                for (var i = 0; i < itms.length; i++)
                {
                    retArr.push( { name: itms[ i ].name } );
                }
            }

        }

        return retArr;

    };

    me.createLocalAnalytics = function()
    {

        FormUtil.getMyListData( me.cwsRenderObj.storageName_RedeemList, function( myData ){

            if ( myData )
            {

                for (var s = 0; s < me.statusTypes.length; s++) 
                {
                    me.statusTypes[ s ].data = ( myData.filter( e=>e.status == me.statusTypes[ s ].name ) );
                }

                for (var a = 0; a < me.activityTypes.length; a++) 
                {
                    me.activityTypes[ a ].data = ( myData.filter( e=>e.activityType == me.activityTypes[ a ].name ) );
                }

                for (var d = 0; d < me.dateGroups.length; d++) 
                {
                    me.dateGroups[ d ].data = me.enrichDateCalculations( myData, me.dateGroups[ d ].hours );
                }

                for (var h = 0; h < me.hoursInDay.length; h++) 
                {
                    me.hoursInDay[ h ].data = ( myData.filter( e=>e.hourInDay == me.hoursInDay[ h ].name ) );
                }

                me.earliestDate = me.earliest( myData )

            }

            me.localStatsTag.empty();

            me.localStatsTag.append( me.toRows( me.dateGroups, "all activities" ) );
            me.localStatsTag.append( me.toColumnActivities( me.activityTypes, "activity breakdown" ) );
            me.localStatsTag.append( me.toColumnStatuses( me.statusTypes, "upload status" ) );
            me.localStatsTag.append( me.toColumnsWithChart( me.hoursInDay, "popular hours" ) );

            if ( me.earliestDate )
            {
                me.localStatsTag.append( me.getSpecialNote( me.earliestDate ) );
            }

        });
    }

    me.earliest = function( myArr )
    {
        var min = new Date();

        for (var i = 0; i < myArr.length; i++) 
        {
            if ( new Date( myArr[ i ].created ) < min ) min = new Date( myArr[ i ].created );
        }

        return min;
    }

    me.enrichDateCalculations = function( myArr, hrTo )
    {   //, hrFrom
        var retArr = [];

        if ( myArr && myArr.length )
        {
            for (var i = 0; i < myArr.length; i++) 
            {
                var dtmThis = new Date( myArr[ i ].created );

                myArr[ i ].ageHours = parseFloat( me.dtmNow - dtmThis.getTime() ) / 1000 / 60 / 60;
                myArr[ i ].hourInDay = ( dtmThis.getHours() );

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

    me.toRows = function( arrObj, title )
    {
        //console.log( arrObj );
        var tbl = $( '<table class="tableStatistics row">' );

        var trTitle = $( '<tr>' );
        var tdTitle = $( '<td class="tableTitle">' );

        tdTitle.html( title );

        tbl.append( trTitle );
        trTitle.append( tdTitle );

        for (var i = 0; i < arrObj.length; i++)
        {
            var tr = $( '<tr>' );
            var tdName = $( '<td class="columnLabel">' );
            var tdData = $( '<td class="columnData">' );

            tbl.append( tr );
            tr.append( tdName );
            tr.append( tdData );

            tdName.html( arrObj[ i ].name );

            if ( arrObj[ i ].data && arrObj[ i ].data.length )
            {
                tdData.html( arrObj[ i ].data.length );
            }

        }

        var trFiller = $( '<tr>' );
        var tdFiller = $( '<td class="columnFiller">' );

        tbl.append( trFiller );
        trFiller.append( tdFiller );
        tdFiller.html( '&nbsp;' );

        return tbl;
    }

    me.toColumns = function( arrObj, title )
    {
        //console.log( arrObj );
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

    me.toColumnActivities = function( arrObj, title )
    {
        //console.log( arrObj );
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

            var divIconObj = $( '<div id="activityType_' + i + '"></div>' );
            var divIconText = $( '<div></div>' );

            if ( arrObj[ i ].data && arrObj[ i ].data.length )
            {
                tdData.html( arrObj[ i ].data.length );
            }

            tdName.append( divIconText );
            tdName.append( divIconObj );

            divIconText.html( arrObj[ i ].name );

            FormUtil.appendActivityTypeIcon ( divIconObj, FormUtil.getActivityType( { activityType: arrObj[ i ].name } ), { name: me.cwsRenderObj.status_redeem_submit }, me.cwsRenderObj );

        }

        var trFiller = $( '<tr>' );
        var tdFiller = $( '<td class="columnFiller" colspan="' + arrObj.length + '">' );

        tbl.append( trFiller );
        trFiller.append( tdFiller );
        tdFiller.html( '&nbsp;' );

        return tbl;
    }

    me.toColumnStatuses = function( arrObj, title )
    {
        //console.log( arrObj );
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

            var divIconObj = $( '<div id="status_' + i + '"></div>' );
            var divIconText = $( '<div></div>' );

            if ( arrObj[ i ].data && arrObj[ i ].data.length )
            {
                tdData.html( arrObj[ i ].data.length );
            }

            tdName.append( divIconText );
            tdName.append( divIconObj );

            divIconText.html( arrObj[ i ].name );

            FormUtil.appendStatusIcon ( divIconObj, FormUtil.getStatusOpt ( { "status": arrObj[ i ].name } ), true );

        }

        var trFiller = $( '<tr>' );
        var tdFiller = $( '<td class="columnFiller" colspan="' + arrObj.length + '">' );

        tbl.append( trFiller );
        trFiller.append( tdFiller );
        tdFiller.html( '&nbsp;' );

        return tbl;
    }

    me.toColumnsWithChart = function( arrObj, title )
    {
        var min = 999999999, max = 0;
        var maxHeight = 80;

        for (var i = 0; i < arrObj.length; i++)
        {
            if ( arrObj[ i ].data )
            {
                if ( arrObj[ i ].data.length > max ) max = arrObj[ i ].data.length;
                if ( arrObj[ i ].data.length < min ) min = arrObj[ i ].data.length;    
            }
        }

        if ( max == 0 ) min = 0;

        var tbl = $( '<table class="tableStatistics column">' );

        var trTitle = $( '<tr>' );
        var tdTitle = $( '<td class="tableTitle" colspan="' + arrObj.length + '">' );

        tdTitle.html( title );

        tbl.append( trTitle );
        trTitle.append( tdTitle );

        var trBar  = $( '<tr>' );
        var trData = $( '<tr>' );
        var trName = $( '<tr>' );

        for (var i = 0; i < arrObj.length; i++)
        {
            var tdBar = $( '<td class="columnBar">' );
            var tdData = $( '<td class="columnData">' );
            var tdName = $( '<td class="columnLabel">' );
            var barH = 0;

            if ( arrObj[ i ].data )
            {
                barH = ( arrObj[ i ].data.length > 0 ? ( maxHeight * ( arrObj[ i ].data.length / max ) ) + 'px' : '0' );
            }

            tbl.append( trBar );
            trBar.append( tdBar );

            tbl.append( trData );
            trData.append( tdData );

            tbl.append( trName );
            trName.append( tdName );

            tdBar.html( '<div class="statsBar" style="height:' + barH + '">&nbsp;</div>' );
            tdName.html( arrObj[ i ].name );

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
                $( 'div.mainDiv' ).show( 'fast' );
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

	me.initialize();

}