
// -------------------------------------------
// -- Util Date Class/Methods

function UtilDate() {}

UtilDate.dateType1 = "yyyy-MM-ddTHH:mm:ss.SSS";
UtilDate.dateType_DATE = "yyyy-MM-dd";
UtilDate.dateType_DATETIME = "yyyy-MM-ddTHH:mm:ss.SSS";

UtilDate.NAME_Date_Loc = 'Loc';
UtilDate.NAME_Date_UTC = 'UTC';
// --------------------------------------

UtilDate.checkCalendarDateStrFormat = function( inputStr )
{
	if( inputStr.length == 10
		&& inputStr.substring(4, 5) == '/'
		&& inputStr.substring(7, 8) == '/'
		&& Util.checkInteger( inputStr.substring(0, 4) )
		&& Util.checkInteger( inputStr.substring(5, 7) )
		&& Util.checkInteger( inputStr.substring(8, 10) )
		)
	{
		return true;
	}
	else
	{
		return false;
	}
};

UtilDate.isDate = function( date ) {
   return ( (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) ));
};

// Replacement of 'new Date( -- )' - handles no local time when 'YYYY-MM-dd' is used.
UtilDate.getDateObj = function( dateStr ) 
{
	return ( dateStr ) ? new Date( UtilDate.addTimeStr_IfEmpty( dateStr ) ) : new Date();
}
// ----------------------------------
// Date Formatting Related


UtilDate.dateToString = function( date )
{
	var month = eval( date.getMonth() ) + 1;
	month = ( month < 10 ) ? "0" + month : month;
	
	var day = eval( date.getDate() );
	day = ( day < 10 ) ? "0" + day : day;
		
	return date.getFullYear() + "-" + month + "-" + day;
};


UtilDate.dateToStr = function( date, separator )
{
	if ( !separator ) separator = "";

	var month = eval( date.getMonth() ) + 1;
	month = ( month < 10 ) ? "0" + month : month;
	
	var day = eval( date.getDate() );
	day = ( day < 10 ) ? "0" + day : day;
		
	return date.getFullYear() + separator + month + separator + day;
};

// ===============================================


// NEW DATE FORMATTER --> DATE STRING..
UtilDate.dateStr = function( formatType, inputDate )
{
	var date = ( inputDate ) ? inputDate: new Date();
	var formatPattern = UtilDate.dateType1;

	if ( formatType === 'D' || formatType === 'DATE' ) formatPattern = UtilDate.dateType_DATE;
	if ( formatType === 'DT' || formatType === 'DATETIME' ) formatPattern = UtilDate.dateType_DATETIME;

	return $.format.date( date, formatPattern );
};


UtilDate.dateAddStr = function( formatType, addDateNumber )
{
	var date = new Date();

	date.setDate( date.getDate() + addDateNumber );

	return UtilDate.dateStr( formatType, date );
};


UtilDate.getDateTimeStr = function()
{
	return UtilDate.formatDateTime( new Date() );
};

// ===============================================

// NOTE: 'date' could be string or object since $.format.date takes both in
UtilDate.formatDate = function( date, formatPattern )
{
	if ( !date ) date = new Date();
	if ( !formatPattern ) formatPattern = UtilDate.dateType1;

	return $.format.date( date, formatPattern );
};

UtilDate.formatDateTime = function( dateObj, dateType )
{
	return UtilDate.formatDate( dateObj, dateType );
};

UtilDate.formatDateTimeStr = function( dateStr, dateType )
{
	return UtilDate.formatDate( dateStr, dateType );
};

UtilDate.timeCalculation = function( dtmNewer, dtmOlder )
{
	var reSult = { 'hh': 0, 'mm': 0, 'ss': 0 };

	var sec_num = ( new Date( dtmNewer ).getTime()  - new Date( dtmOlder ).getTime() ) / Util.MS_SEC;

    var hours   = Math.floor(sec_num / 3600); // round (down)
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60); // round (down)
    var seconds = Math.round(sec_num - (hours * 3600) - (minutes * 60) ); // round (up)

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}

	reSult.hh = hours;
	reSult.mm = minutes;
	reSult.ss = seconds;

    return reSult;

};

UtilDate.getTimePassedMs = function( fromDtStr )
{
	var timePassedMs = -1;

	try
	{
		var currDt = new Date().getTime();
		var fromDt = UtilDate.getDateObj( fromDtStr ).getTime();

		var timePassedMs = currDt - fromDt;
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in UtilDate.getTimePassedMs, errMsg: ' + errMsg );
	}

	return timePassedMs;
};

UtilDate.dateUTCToLocal = function( dateStr )
{
	var localDateObj;

	try
	{
		if ( dateStr )
		{
			dateStr = UtilDate.addTimeStr_IfEmpty( dateStr );

			// If the input utc date string does not have 'Z' at the end, add it.  <--- but need to be full length?
			if ( dateStr.indexOf( 'Z' ) === -1 ) 
			{
				dateStr += 'Z';
			}

			localDateObj = new Date( dateStr );
		}
		else
		{
			localDateObj = new Date();
		}
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in UtilDate.dateUTCToLocal, errMsg: ' + errMsg );
	}

	return localDateObj;
};

UtilDate.getUTCDateTimeStr = function( dateObj, optionStr )
{
	if ( !dateObj ) dateObj = new Date();

	var dtStr = dateObj.toISOString();
	if ( optionStr === 'noZ' ) dtStr = dtStr.replace( 'Z', '' );

	return dtStr;
};

UtilDate.addTimeStr_IfEmpty = function( dateStr )
{
	return ( dateStr && dateStr.length === 10 ) ? dateStr + 'T00:00:00' : dateStr;
};


// Date Formatting Related
// ----------------------------------

// -----------------------------------------------------------------

// '00:00:00' time string format or object { time, unit }
UtilDate.getTimeMs = function( input, defaultMs ) 
{
	var outputMs = defaultMs;

	if ( input )
	{
		if ( Util.isTypeString( input ) ) 
		{
			outputMs = UtilDate.getTimeMsStr( input );
		}
		else if ( Util.isTypeObject( input ) )
		{
			if ( input.time !== undefined && input.unit )
			{
				var timeNum = Util.getNum( input.time );

				if ( input.unit === "second" ) outputMs = timeNum * Util.MS_SEC;
				else if ( input.unit === "minute" ) outputMs = timeNum * Util.MS_MIN;
				else if ( input.unit === "hour" ) outputMs = timeNum * Util.MS_HR;
			}    
		}
	} 

	return outputMs;
};

// '00:00:00' time format
UtilDate.getTimeMsStr = function( input )
{
	var timeMs = 0;
	var timeStrArr = input.split( ':' );

	var hr = 0;
	var min = 0;
	var sec = 0;

	// Hour exists..
	if ( timeStrArr.length >= 3 )
	{
		hr = Util.getNum( timeStrArr[0] );
		min = Util.getNum( timeStrArr[1] );
		sec = Util.getNum( timeStrArr[2] );
	} 
	else if ( timeStrArr.length == 2 )
	{
		// Minuts exists..
		min = Util.getNum( timeStrArr[0] );
		sec = Util.getNum( timeStrArr[1] );
	} 
	else if ( timeStrArr.length == 1 )
	{
		sec = Util.getNum( timeStrArr[0] );
	} 

	timeMs += hr * Util.MS_HR;
	timeMs += min * Util.MS_MIN;
	timeMs += sec * Util.MS_SEC;

	return timeMs;
};


UtilDate.getTimeFromMs = function( inputMsTime, toTimeName, optionalStr ) 
{	
	var outputVal = 0;
	var msTimeNum = Util.getNum( inputMsTime );

	Util.tryCatchContinue( function() 
	{
		if ( toTimeName === "second" ) outputVal = Math.round( msTimeNum / Util.MS_SEC );
		else if ( toTimeName === "minute" ) outputVal = Math.round( msTimeNum / Util.MS_MIN );
		else if ( toTimeName === "hour" ) outputVal = Math.round( msTimeNum / Util.MS_HR );	
	}, 'UtilDate.getTimeFromMs' );

	return ( optionalStr ) ? outputVal + optionalStr : outputVal;
};


UtilDate.getSecFromMiliSec = function( miliSec ) 
{
	sec = 0;

	try {
		if ( miliSec ) sec = Math.round( miliSec / Util.MS_SEC );
	}
	catch( errMsg )
	{
		console.log( 'ERROR in UtilDate.getSecFromMiliSec, errMsg: ' + errMsg );
	}

	return sec;
};


UtilDate.getDaysSince = function( fromDtStr )
{
	return UtilDate.getTimeSince( fromDtStr, Util.MS_DAY );
};

// UtilDate.getTimeSince( fromDtStr, Util.MS_HR );  <-- for hours since..  takes in Z (ISO) hours as well.
UtilDate.getTimeSince = function( fromDtStr, timeType )
{
	var timeSince = 0;

	if ( fromDtStr )
	{
		try {
			var timeMs = UtilDate.getTimePassedMs( fromDtStr );

			timeSince = Math.floor( timeMs / timeType );	
		}
		catch ( errMsg ) { console.log( 'ERROR in UtilDate.getTimeSince, intput: ' + fromDtStr + ', ' + errMsg ); }
	}

	return timeSince;
};


// ======================================================
// ---- 'date' object UTC to Loc convert, visa versa

UtilDate.setDate_LocToUTC_bySrc = function( dateObj, fieldNameLoc, srcDateStr )
{
   var localDateTimeStr = srcDateStr;

   if ( dateObj && localDateTimeStr ) 
   {
		var fieldNameUTC = Util.strCutEnd( fieldNameLoc, 3 ) + UtilDate.NAME_Date_UTC;
		
		dateObj[ fieldNameLoc ] = Util.formatDateTime( localDateTimeStr );    
      dateObj[ fieldNameUTC ] = Util.getUTCDateTimeStr( UtilDate.getDateObj( localDateTimeStr ), 'noZ' );
   }    
};

UtilDate.setDate_LocToUTC_fields = function( dateObj, fieldNameList )
{
    if ( dateObj )
    {
        if ( fieldNameList === 'ALL' )
        {
            var targetNameArr = [];

            for ( var prop in dateObj ) {  
                if ( Util.endsWith( prop, UtilDate.NAME_Date_Loc ) ) targetNameArr.push( prop );  
            }

            targetNameArr.forEach( targetName => {  UtilDate.setDate_LocToUTC( dateObj, targetName );  } );
        }
        else if ( Util.isTypeArray( fieldNameList ) && fieldNameList.length > 0 )  // [ 'captured', 'created', 'updated' ]
        {
            fieldNameList.forEach( targetName => {  UtilDate.setDate_LocToUTC( dateObj, targetName );  } );
        }    
    }
};

UtilDate.setDate_LocToUTC = function( dateObj, fieldNameLoc )
{
   if ( dateObj && dateObj[ fieldNameLoc ] )
   {
        var fieldNameUTC = Util.strCutEnd( fieldNameLoc, 3 ) + UtilDate.NAME_Date_UTC;
        dateObj[ fieldNameUTC ] = Util.getUTCDateTimeStr( UtilDate.getDateObj( dateObj[ fieldNameLoc ] ), 'noZ' );
	}
};

// ---------------------

UtilDate.setDate_UTCToLoc_fields = function( dateObj, fieldNameList )
{
    if ( dateObj )
    {
        if ( fieldNameList === 'ALL' )
        {
            var targetNameArr = [];

            for ( var prop in dateObj ) {  
                if ( Util.endsWith( prop, UtilDate.NAME_Date_UTC ) ) targetNameArr.push( prop );  
            }

            targetNameArr.forEach( fieldNameUTC => {  UtilDate.setDate_UTCToLoc( dateObj, fieldNameUTC );  } );
        }
        else if ( Util.isTypeArray( fieldNameList ) && fieldNameList.length > 0 )  // [ 'captured', 'created', 'updated' ]
        {
            fieldNameList.forEach( fieldNameUTC => {  UtilDate.setDate_UTCToLoc( dateObj, fieldNameUTC );  } );
        }    
    }
};

UtilDate.setDate_UTCToLoc = function( dateObj, fieldNameUTC )
{
    if ( dateObj && dateObj[ fieldNameUTC ] )
    {
        var fieldNameLoc = Util.strCutEnd( fieldNameUTC, 3 ) + UtilDate.NAME_Date_Loc;
        var localDateTime = Util.dateUTCToLocal( dateObj[ fieldNameUTC ] );
        if ( localDateTime ) dateObj[ fieldNameLoc ] = Util.formatDateTime( localDateTime );    
    }
};

