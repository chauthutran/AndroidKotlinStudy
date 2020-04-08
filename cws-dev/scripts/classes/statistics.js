// -------------------------------------------
// -- BlockMsg Class/Methods
function statisticsOld( cwsRender )
{
    var me = this;

    me.cwsRenderObj = cwsRender;
	me.dataResults;
	me.valueCombination = [];
	me.periodOpts;

	me.ajaxInProcess;
	me.columns = 3;

    me.statisticsFormDiv = $( '#statisticsFormDiv' );
	me.statisticsContentDivTag = $( '#statisticsContentDiv' );
	me.statisticsTableTag = $( 'table.tableStats' );
	//me.localStats;

	// TODO: NEED TO IMPLEMENT
	// =============================================
	// === TEMPLATE METHODS ========================

	me.initialize = function() 
	{

		me.setEvents_OnInit();
    }

	// ------------------

    me.render = function() 
    {
		//me.localStats = new localStatistics( cwsRender );
        me.showStatsPage();
    }

	// ------------------

	me.setEvents_OnInit = function()
	{	

        $( 'img.btnStatsBack' ).click( () =>
        {
            me.hideStatsPage();
		});

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

		me.emptyTable();
		me.statisticsFormDiv.show( 'fast' );

		if ( ConnManager.isOnline() )
		{
			me.getReport();
		}
		else
		{
			me.getOfflineReport();
		}

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

	me.createColumnHeaders = function( periodOpts )
	{
		me.emptyTable();

		var tH = $( '<thead>');
		var tR = $( '<tr>');

		tH.append( tR );

		me.statisticsTableTag.append( tH );

		// empty place holder
		var th = $( '<th>');
		tR.append( th );

		for (var p = 0; p < periodOpts.length; p++)
		{
			var th = $( '<th>');
			th.attr( 'period', 'period' + (p+1) );
			th.html( Util.getPeriodName( periodOpts[p] ) )
			tR.append( th );
		}

	}

	me.emptyTable = function()
	{
		$( 'table.tableStats thead' ).remove();
		$( 'table.tableStats tbody' ).remove();
	}

	me.getReport = function()
	{

		me.cwsRenderObj.pulsatingProgress.show();
		me.cwsRenderObj.pulsatingProgress.css( 'zIndex', 1000 );

		$( '#statsFooterSpecialNote' ).hide();
		$( '#statsFooterLastCalc' ).hide();

		me.periodOpts = me.getMonthlyPeriods(3);

		var apiPath = "/client/reportProv?pe=" + me.periodOpts.join(";");
		var payloadJson = { 'userName': $( 'input.loginUserName' ).val(), 'password': $( 'input.loginUserPin' ).val() };

		WsCallManager.requestPost( apiPath, payloadJson, undefined, function( success, response )
		{

			if ( success )
			{
				me.dataResults = response.data.rows;
				me.createColumnHeaders( me.periodOpts )
				me.createDataPlaceholders( me.periodOpts, response.data )

				$( '#analyticTime' ).html( response.analyticsTime );
				$( '#statsFooterSpecialNote' ).hide();
				$( '#statsFooterLastCalc' ).show();
	
				me.populatePlaceholderData();
				me.updateLocalStatistics( response );
				me.cwsRenderObj.pulsatingProgress.hide();
			}
			else
			{
				// MISSING TRANSLATION
				MsgManager.notificationMessage ( 'Failed to retrieve report > error connecting', 'notificationDark', undefined, '', 'left', 'top' )
				me.cwsRenderObj.pulsatingProgress.hide();
			}

		}); 
	}

	me.getOfflineReport = function()
	{
		var jsonData = DataManager.getUserConfigData();

		if ( jsonData && jsonData.mySession && jsonData.mySession.statistics )
		{
			me.cwsRenderObj.pulsatingProgress.show();
			me.cwsRenderObj.pulsatingProgress.css( 'zIndex', 1000 );
			me.periodOpts = me.getMonthlyPeriods(3);
			me.dataResults = jsonData.mySession.statistics.data.rows;

			me.createColumnHeaders( me.periodOpts )
			me.createDataPlaceholders( me.periodOpts, jsonData.mySession.statistics.data )

			$( '#analyticTime' ).html( '' );
			$( '#statsFooterSpecialNote' ).show();
			$( '#statsFooterLastCalc' ).hide();

			if ( jsonData.mySession.statistics.lastFetch )
			{
				$( '#statsSpecialNoteMessage' ).html( 'WARNING: network offline > last retrieved: ' + jsonData.mySession.statistics.lastFetch );
			}
			else
			{
				$( '#statsSpecialNoteMessage' ).html( 'WARNING: network offline > viewing offline copy' );
			}

			me.populatePlaceholderData();
			me.updateLocalStatistics( jsonData.mySession.statistics.data );

			me.cwsRenderObj.pulsatingProgress.hide();

		}
		else
		{
			$( '#statsFooterLastCalc' ).hide();
			$( '#statsFooterSpecialNote' ).show();
			$( '#statsSpecialNoteMessage' ).html( 'Stats cannot be retrieved while OFFLINE' );
		}

	}
	
	me.createDataPlaceholders = function( periodOpts, jsonData )
	{
		// Populate place holders
		var tbody = me.statisticsTableTag.append( $( "<tbody>" ) );		
		var data = jsonData.rows;
		var dxArr = jsonData.metaData.dimensions.dx;

		for (var d = 0; d < dxArr.length; d++)
		{
			var tR = $( '<tr>');
			tbody.append( tR );

			var td = $( '<td>');
			td.css( 'text-align', 'left' );
			td.attr( 'class', 'roundedLeft' );
			tR.append( td );
			td.html( jsonData.metaData.items[ dxArr[d] ].name )

			for (var p = 0; p < periodOpts.length; p++)
			{
				var tD = $( '<td>');
				tD.attr( 'dataId', dxArr[d] + '-' + periodOpts[p] );

				if ( p == (periodOpts.length-1) )
				{
					tD.attr( 'class', 'roundedRight' );
				}
				tR.append( tD );

				me.valueCombination.push( dxArr[d] + '-' + periodOpts[p] );

			}
		}

	};

	me.updateLocalStatistics = function( data )
	{
		var newSaveObj = DataManager.getUserConfigData();
		var newData = JSON.parse( JSON.stringify( data ) );

		newData.lastFetch = (new Date() ).toISOString();
		newSaveObj.mySession.statistics = newData;

		DataManager.saveData( FormUtil.login_UserName, newSaveObj );
	}

	me.populatePlaceholderData = function()
	{
		for( var i=0; i< me.dataResults.length; i++ )
		{
			var deId = me.dataResults[i][0]
			var periodKey = me.dataResults[i][1];
			var value = eval(me.dataResults[i][2]);
			var checkValue = eval(me.dataResults[i][2]).toFixed(0);

			if( value === checkValue )
			{
				value = checkValue;
			}

			var colTag = $( "td[dataId='" + deId + "-" + periodKey + "']" );
			colTag.html( value );

			// Set the color point for % value
			var isPercent = 0;

			if( isPercent )
			{
				var trafficLightTag = colTag.find("span.trafficLight");
				var color = "";
				if( value < 50){
					color = me.COLOR_RED;
				} 
				else if( value < 100){
					color = me.COLOR_ORGANGE;
				}
				else {
					color = me.COLOR_GREEN;
				}

				trafficLightTag.css( "color", color );
				trafficLightTag.html("&#9679;");
			}

			value = ( isPercent ) ? value + "%" : value;
			
			colTag.find("span.value").html( value );
		}

	}

	me.getMonthlyPeriods = function( iMonths )
	{
		var dtmNow = new Date();
		var peF = dtmNow.getFullYear();
		var mFilter = ( iMonths ? iMonths : 3);
		var sRet = '';

		for (var m = (1 - mFilter); m <= 0; m++){

			if ( ( (dtmNow.getMonth()+1) + m ) <= 0 )
			{
				sRet += (peF - 1) + '' + (12 + ( (dtmNow.getMonth()+1) + m )) + ';';
			}
			else
			{
				sRet += (peF) + '' + ( ( (dtmNow.getMonth()+1) + m ) < 10 ? '0'+( (dtmNow.getMonth()+1) + m ) : ( (dtmNow.getMonth()+1) + m ) ) + ';';
			}

		}

		return sRet.substring(sRet,sRet.length-1).split( ';' );

	}

    me.initialize();

}