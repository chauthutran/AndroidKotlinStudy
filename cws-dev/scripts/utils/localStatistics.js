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

    me.dateGroups;
    me.hoursInDay;

	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================

    me.initialize = function() 
    {

        if ( $( 'div.listDiv' ).is(':visible') )
        {
            $( 'div.listDiv' ).hide();
            $( 'div.listDiv' ).remove();
        }

        me.localStatsTag.empty();

        $( window ).scrollTop(0);

        me.slideIndex = new Date().getDay();

        me.setEvents_OnInit();

    }

    
	me.setEvents_OnInit = function()
	{	

    }

    me.render = function()
    {
        $( window ).scrollTop(0);

        me.localStatsTag.empty();

        me.hoursInDay = me.getHoursInDay();
        me.activityTypes = FormUtil.getActivityTypes();
        me.dateGroups = FormUtil.getCommonDateGroups();
        me.popularDays = me.getPopularDays();
        //me.statusTypes = me.getStatusTypes();

        me.getConnectionTypes( function( connData ) {

            me.connectionTypes = connData;

            me.createLocalAnalytics( function( dataFound ){

                me.showStatsPage( dataFound )
                me.colorize();

            });

        });


    }

    me.showStatsPage = function( dataFound )
	{

        if ( dataFound )
        {
            me.createSlideShow( me.localStatsTag );

            //me.localStatsTag.append( me.toColumnsWithChart( me.hoursInDay, "popular hours" ) );
            me.localStatsTag.append( me.toRowActivities( me.activityTypes, "activity breakdown" ) );
            me.localStatsTag.append( me.toRows( me.dateGroups, "all activities" ) );

            me.localStatsTag.append( me.networkTypesToChart( me.connectionTypes, "network Quality" ) );

            //me.localStatsTag.append( me.toColumnStatuses( me.statusTypes, "upload status" ) );
    
            if ( me.earliestDate )
            {
                me.localStatsTag.append( me.getSpecialNote( me.earliestDate ) );
            }

            setTimeout( function() {
                $( '.hide' ).hide( 'slow' );
            }, 50 )

        }
        else
        {            
            me.localStatsTag.append( me.networkTypesToChart( me.connectionTypes, "network Quality" ) );
        }
        

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

        //setTimeout( function(){
        //    $( 'div.statsBar' ).show( 'fast' );
        //}, 500);

    }

    me.createSlideShow = function( targetTag )
    {

        var arrObj = me.popularDays[ me.popularDays.length -1 ].hoursInDay;
        var arrHours = [];

        for (var i = 0; i < arrObj.length; i++)
        {
            if ( arrObj[ i ].data.length )
            {
                arrHours.push( i );
            }
        }

        me.hoursFrom = Math.min( ...arrHours );
        me.hoursTo = Math.max( ...arrHours );

        var tbl = $( '<table class="tableStatistics column" style="border:0 !important;margin:0 !important">' );
        var trTitle = $( '<tr>' );
        var tdTitle = $( '<td class="tableTitle" >' ); //arrObj.length

        tdTitle.html( 'Popular hours' );

        tbl.append( trTitle );
        trTitle.append( tdTitle );
        targetTag.append( tbl );

        var tagContainer = $( '<div class="statsSlideShowContainer" />' );

        targetTag.append( tagContainer );

        for (var d = 0; d < me.popularDays.length; d++)
        {
            var tagSlide = $( '<div class="statsSlide" />' );
            var tagSlideLabel = $( '<div class="statsSlideLabel" />' );
            var tagSlideContents = me.toColumnsWithChart( me.popularDays[ d ].hoursInDay, me.popularDays[ d ].name );

            tagSlideLabel.html( ( d + 1 ) + ' / ' + me.popularDays.length );

            tagContainer.append( tagSlide );
            tagSlide.append( tagSlideLabel );
            tagSlide.append( tagSlideContents );
        }

        var tagPrev = $( '<a class="statsSlideShowPrev" >❮</a>' );
        var tagNext = $( '<a class="statsSlideShowNext" >❯</a>' );

        tagContainer.append( tagPrev );
        tagContainer.append( tagNext );

        tagPrev.on( 'click', function(){
            me.showStatSlide( me.slideIndex -=1 );
        } );

        tagNext.on( 'click', function(){
            me.showStatSlide( me.slideIndex +=1 );
        } );

        var tagCarousel = $( '<div class="statsCarouselDotContainer" />' );

        tagContainer.append( tagCarousel );

        for (var d = 0; d < me.popularDays.length; d++)
        {
            var tagDot = $( '<span data-item="' + d + '" class="statsDot ' + ( d == me.slideIndex ? 'StatsDotActive ' : ' ' ) + ( d == (me.popularDays.length-1) ? 'StatsDotAllDays' : '' ) + '" ></span>' );

            tagCarousel.append( tagDot );

            tagDot.on( 'click', function(){
                me.showStatSlide( me.slideIndex = parseFloat( $( this ).attr( 'data-item' ) ) );
            } );

        }

        me.showStatSlide( me.slideIndex )

    }

    me.showStatSlide = function( n ) 
    {
        
        var slides = me.localStatsTag.find( '.statsSlide' );
        var dots = me.localStatsTag.find( '.statsDot' );

        if ( n == slides.length ) me.slideIndex = 0;
        if ( n < 0 ) me.slideIndex = slides.length -1;

        for ( var i = 0; i < slides.length; i++ ) 
        {
            $( slides[i] ).css( 'display', 'none');
            $( dots[i] ).removeClass( 'StatsDotActive' );
        }

        $( slides[ me.slideIndex ] ).css( 'display', 'block');
        $( dots[ me.slideIndex ] ).addClass( 'StatsDotActive' );

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

    /*me.getStatusTypes = function()
    {
        var retArr = [];

        retArr.push( { name: me.cwsRenderObj.status_redeem_submit } );
        retArr.push( { name: me.cwsRenderObj.status_redeem_queued } );
        retArr.push( { name: me.cwsRenderObj.status_redeem_failed } );

        return retArr;
    }*/

    me.getHoursInDay = function()
    {
        var retArr = [];

        for (var i = 0; i < 24; i++)
        {
            retArr.push( { name: i } );
        }

        return retArr;

    }

    
    me.getPopularDays = function()
    {
        var retArr = [];
        var days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

        for (var i = 0; i < 7; i++)
        {
            retArr.push( { day: i, name: days[ i ], term: '', data: [], hoursInDay: [] } );

            for (var h = 0; h < me.hoursInDay.length; h++)
            {
                retArr[ i ].hoursInDay.push ( { name: me.hoursInDay[ h ].name } ) ;
            }
        }

        retArr.push( { day: 8, name: 'All Days', term: '', data: [], hoursInDay: [] } );

        for (var h = 0; h < me.hoursInDay.length; h++)
        {
            retArr[ 7 ].hoursInDay.push ( { name: me.hoursInDay[ h ].name } ) ;
        }

        return retArr;

    }

    me.getConnectionTypes = function( callBack )
    {
        DataManager.getData( 'networkConnectionObs', function( dataObs ) {

            if ( dataObs )
            {
                connTypes = { 'slow-2g': 0, '2g': 0, '3g': 0, '4g': 0, 'offline': 0 };

                for ( var connType in connTypes ) 
                {
                    var typeSum = 0;
                   
                    for ( var key in dataObs.observations[ connType ] ) 
                    {
                        typeSum += parseFloat( dataObs.observations[ connType ][ key ] );
                    }

                    connTypes[ connType ] = typeSum
                }

            }

            if ( callBack )
            {
                callBack( connTypes );
            }
            else
            {
                return connTypes;
            }

        })
    }

    me.createLocalAnalytics = function( callBack )
    {

        FormUtil.getMyListData( me.cwsRenderObj.storageName_RedeemList, function( myData ){

            if ( myData )
            {

                /*for (var s = 0; s < me.statusTypes.length; s++) 
                {
                    me.statusTypes[ s ].data = ( myData.filter( e=>e.status == me.statusTypes[ s ].name ) );
                }*/

                for (var a = 0; a < me.activityTypes.length; a++) 
                {
                    me.activityTypes[ a ].data = ( myData.filter( e=>e.activityType == me.activityTypes[ a ].name ) );
                }

                for (var d = 0; d < me.dateGroups.length; d++) 
                {
                    me.dateGroups[ d ].data = me.enrichDateCalculations( myData, me.dateGroups[ d ].hours );
                }

                /*for (var h = 0; h < me.hoursInDay.length; h++) 
                {
                    me.hoursInDay[ h ].data = ( myData.filter( e=>e.hourInDay == me.hoursInDay[ h ].name ) );
                }*/

                for (var d = 0; d < me.popularDays.length - 1; d++)
                {
                    me.popularDays[ d ].data = ( myData.filter( e=>e.dayInWeek == d ) );

                    for (var h = 0; h < me.hoursInDay.length; h++) 
                    {
                        me.popularDays[ d ].hoursInDay[ h ].data = ( myData.filter( e => e.dayInWeek == d && e.hourInDay == me.hoursInDay[ h ].name ) );
                    }

                }

                me.popularDays[ 7 ].data = ( myData );

                for (var h = 0; h < me.hoursInDay.length; h++) 
                {
                    me.popularDays[ 7 ].hoursInDay[ h ].data = ( myData.filter( e => e.hourInDay == me.hoursInDay[ h ].name ) );
                }

                me.earliestDate = me.earliest( myData )
                me.total = myData.length;

                if ( callBack ) callBack( true );

            }
            else
            {
                me.localStatsTag.append( me.getNoDataMessage() );

                if ( callBack ) callBack( false );

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
    {
        var retArr = [];

        if ( myArr && myArr.length )
        {
            for (var i = 0; i < myArr.length; i++) 
            {
                var dtmThis = new Date( myArr[ i ].created );

                myArr[ i ].ageHours = parseFloat( me.dtmNow - dtmThis.getTime() ) / 1000 / 60 / 60;
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
            var tdName = $( '<td class="columnLabel" style="background-Color:#F5F5F5;width: 150px;">' );
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
        var tdFiller = $( '<td class="columnFiller" >' );

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

            var divIconObj = $( '<div id="activityStatistic_' + i + '"></div>' );
            var divIconText = $( '<div></div>' );

            if ( arrObj[ i ].data && arrObj[ i ].data.length )
            {
                tdData.html( arrObj[ i ].data.length );
            }

            tdName.append( divIconText );
            tdName.append( divIconObj );

            divIconText.html( arrObj[ i ].name );

            FormUtil.appendActivityTypeIcon ( divIconObj, FormUtil.getActivityType( { activityType: arrObj[ i ].name } ), { name: me.cwsRenderObj.status_redeem_submit }, me.cwsRenderObj, { width:38, height: 38 } );

        }

        var trFiller = $( '<tr>' );
        var tdFiller = $( '<td class="columnFiller" colspan="' + arrObj.length + '">' );

        tbl.append( trFiller );
        trFiller.append( tdFiller );
        tdFiller.html( '&nbsp;' );

        return tbl;
    }

    me.toRowActivities = function( arrObj, title )
    {
        //console.log( arrObj );
        var tbl = $( '<table class="tableStatistics column">' );

        var trTitle = $( '<tr>' );
        var tdTitle = $( '<td class="tableTitle" colspan="' + 3 + '">' );

        tdTitle.html( title );

        tbl.append( trTitle );
        trTitle.append( tdTitle );

        for (var i = 0; i < arrObj.length; i++)
        {
            var actType = arrObj[ i ].jsonObj; // FormUtil.getActivityType( { activityType: arrObj[ i ].name } );
            var trRow = $( '<tr>' );
            var tdIcon = $( '<td class="columnIcon">' )
            var tdLabels = $( '<td class="columnLabel">' );
            var tdData = $( '<td class="columnData">' );
            var nameContent = '', dataContent = '';

            tbl.append( trRow );
            trRow.append( tdIcon );
            trRow.append( tdLabels );
            trRow.append( tdData );

            var divIconObj = $( '<div id="activityStatistic_' + i + '"></div>' );
            var divIconText = $( '<div></div>' );

            if ( actType.icon && actType.icon.colors && actType.icon.colors.background )
            {
                tdIcon.css( 'background-color', actType.icon.colors.background + ' !important')
            }
            if ( actType.icon && actType.icon.colors && actType.icon.colors.foreground )
            {
                tdIcon.css( 'color', actType.icon.colors.foreground + ' !important')
            }

            tdIcon.append( divIconObj );

            FormUtil.appendActivityTypeIcon ( divIconObj, actType, { name: me.cwsRenderObj.status_redeem_submit }, me.cwsRenderObj, { width:48, height: 48 } );

            divIconText.html( arrObj[ i ].name );
            tdIcon.append( divIconText );

            nameContent = '<div style="font-size:12px;">' + actType.label + '</div>';

            if ( arrObj[ i ].data && arrObj[ i ].data.length )
            {
                nameContent += '<div style="font-size:10px;padding:4px 0 0 0">Total: </div>';
                nameContent += '<div style="font-size:10px;padding:4px 0 0 0">Frequency: </div>' ;
            }

            tdLabels.html( nameContent );

            dataContent = '<div style="font-size:12px;">&nbsp;</div>';

            if ( arrObj[ i ].data && arrObj[ i ].data.length )
            {
                dataContent += '<div style="font-size:10px;padding:4px 0 0 0">' + arrObj[ i ].data.length + '</div>';
                dataContent += '<div style="font-size:10px;padding:4px 0 0 0">' + parseFloat( parseFloat( arrObj[ i ].data.length ) / parseFloat(  me.total )  * 100 ).toFixed(0) + '%</div>' ;
            }

            tdData.html( dataContent );

        }

        var trFiller = $( '<tr>' );
        var tdFiller = $( '<td class="columnFiller" colspan="3">' );

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

            var divIconObj = $( '<div id="statusStatistic_' + i + '"></div>' );
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
        var maxHeight = 100;

        for (var i = 0; i < arrObj.length; i++)
        {
            if ( arrObj[ i ].data.length )
            {

                if ( arrObj[ i ].data.length > max )
                { 
                    max = arrObj[ i ].data.length;
                }

                if ( arrObj[ i ].data.length < min )
                {
                    min = arrObj[ i ].data.length;
                } 

            }
        }

        if ( max == 0 ) min = 0;

        var tbl = $( '<table class="tableStatsPopularHours column">' );

        var trTitle = $( '<tr>' );
        var tdTitle = $( '<td class="tableTitle" colspan="' + ( me.hoursTo - me.hoursFrom ) + '">' ); //arrObj.length

        tdTitle.html( title );

        tbl.append( trTitle );
        trTitle.append( tdTitle );

        var trFiller = $( '<tr>' );
        var tdFiller = $( '<td class="columnFiller" colspan="' + ( me.hoursTo - me.hoursFrom ) + '">' ); //arrObj.length

        tbl.append( trFiller );
        trFiller.append( tdFiller );
        tdFiller.html( '&nbsp;' );

        var trBar  = $( '<tr style="height:'+(maxHeight+10)+'px">' );
        var trData = $( '<tr>' );
        var trName = $( '<tr>' );

        //for (var i = 0; i < arrObj.length; i++)
        for (var i = me.hoursFrom; i <= me.hoursTo; i++)
        {
            var showHideClass = ( ( me.hoursFrom > i || me.hoursTo < i ) ? 'hide' : '' );
            var barH = 0;

            if ( arrObj[ i ].data )
            {
                barH = ( arrObj[ i ].data.length > 0 ? ( maxHeight * ( arrObj[ i ].data.length / max ) ) + 'px' : '0' );
            }

            var opac = ( ( parseFloat(  arrObj[ i ].data.length / ( max ) ) ) );
            var tdBar = $( '<td class="columnBar ' + showHideClass + '" style="min-height:'+(maxHeight+10)+'px;opacity:' + opac + '">' );
            var tdName = $( '<td class="columnHours ' + showHideClass + '">' );

            tbl.append( trBar );
            trBar.append( tdBar );
            tbl.append( trName );
            trName.append( tdName );

            tdBar.html( '<div class="statsBar" style="height:' + barH + '">&nbsp;</div>' );
            tdName.html( '<div class="statsHour" ><label class="statsHourLabel">' + arrObj[ i ].name + '</label></div>' );

        }

        var trFiller = $( '<tr>' );
        var tdFiller = $( '<td class="columnFiller" colspan="' + ( me.hoursTo - me.hoursFrom ) + '" style="height:40px">' ); //arrObj.length

        tbl.append( trFiller );
        trFiller.append( tdFiller );
        tdFiller.html( '&nbsp;' );

        return tbl;
    }

    me.networkTypesToChart = function( jsonObj, title )
    {
        var min = 999999999, max = 0, sum = 0;
        var maxHeight = 100, typeCount = 0, i = 0;
        var colorBrewer = [ "#E0E080", "#94D6CB", "#1EC802", "#F82827", "#E0E0E0" ];
        var opacityCols = [ 0.5, 0.5, 1, 1, 0.5 ];

        for ( var connType in connTypes )
        {
            if ( connTypes[ connType ] )
            {
                sum += connTypes[ connType ];

                if ( connTypes[ connType ] > max )
                { 
                    max = connTypes[ connType ];
                }

                if ( connTypes[ connType ] < min )
                {
                    min = connTypes[ connType ];
                } 
                typeCount += 1;
            }
        }

        if ( max == 0 ) min = 0;

        var tbl = $( '<table class="tableStatistics tableStatsPopularHours column">' );

        var trTitle = $( '<tr>' );
        var tdTitle = $( '<td class="tableTitle" style="color:#50555a;" colspan="' + ( typeCount ) + '">' ); //arrObj.length

        tdTitle.html( title );

        tbl.append( trTitle );
        trTitle.append( tdTitle );

        var trFiller = $( '<tr>' );
        var tdFiller = $( '<td class="columnFiller" colspan="' + ( typeCount ) + '">' ); //arrObj.length

        tbl.append( trFiller );
        trFiller.append( tdFiller );
        tdFiller.html( '&nbsp;' );

        var trBar  = $( '<tr style="height:'+(maxHeight+30)+'px">' );
        var trData = $( '<tr>' );
        var trName = $( '<tr>' );

        //for (var i = 0; i < arrObj.length; i++)
        //for (var i = me.hoursFrom; i <= me.hoursTo; i++)
        for ( var connType in connTypes )
        {
            var showHideClass = '';
            var barH = 0;

            //if ( arrObj[ i ].data )
            {
                barH = ( connTypes[ connType ] > 0 ? ( maxHeight * ( connTypes[ connType ] / max ) ) + 'px' : '0' );
            }

            var opac = ( ( parseFloat(  connTypes[ connType ] / ( max ) ) ) );
            var tdBar = $( '<td class="columnBar ' + showHideClass + '" style="min-height:'+(maxHeight+30)+'px;">' );
            var tdName = $( '<td class="columnHours ' + showHideClass + '">' );

            tbl.append( trBar );
            trBar.append( tdBar );
            tbl.append( trName );
            trName.append( tdName );

            tdBar.append( $( '<div class="statsNetworkTypeText" >' + ( connTypes[ connType ] > 0 ? ( ( parseFloat( connTypes[ connType ] / sum ) * 100 ).toFixed(1) ).toString().replace('.0','') + '%' : '' ) + '</div>' ) );
            tdBar.append( $( '<div class="statsNetworkTypeBar ' + ( connType == '3g' || connType == '4g' ? 'statsNetworkTypeBarGrid' : '' ) + '" style="height:' + barH + ';opacity:' + opacityCols[ i ] + ';background-Color:' + colorBrewer[ i ] + '">&nbsp;</div>' ) );
            tdName.html( '<div class="statsHour" ><label class="statsHourLabel">' + connType + '</label></div>' );

            i += 1;
        }

        var trFiller = $( '<tr>' );
        var tdFiller = $( '<td class="columnFiller" colspan="' + ( typeCount ) + '" style="height:40px">' ); //arrObj.length

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

    me.getNoDataMessage = function()
    {
        return $( '<div class="" style="font-size: 12px;padding: 8px 4px;line-height:18px"><span term="">no local Statistics available </span></div>')
    }

	me.initialize();

}