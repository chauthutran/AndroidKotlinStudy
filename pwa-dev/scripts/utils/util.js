
// -------------------------------------------
// -- Utility Class/Methods

function Util() {}

Util.termName_pleaseSelectOne = "common_pleaseSelectOne";
Util.termName_listEmpty = "common_listEmpty";
//Util.termName_confirmed = ""; // 

Util.dateType1 = "yyyy-MM-ddTHH:mm:ss.SSS";
Util.dateType_DATE = "yyyy-MM-dd";
Util.dateType_DATETIME = "yyyy-MM-ddTHH:mm:ss.SSS";


// ---------------------------
// --- Types Check ----

Util.isTypeObject = function( obj )
{
	// Array is also 'object' type, thus, check to make sure this is not array.
	if ( Util.isTypeArray( obj ) ) return false;
	else return ( obj && typeof( obj ) === 'object' );
};

Util.isTypeArray = function( obj )
{
	return ( obj && Array.isArray( obj ) );
};

Util.isTypeString = function( obj )
{
	return ( obj && typeof( obj ) === 'string' );
};
// ------------------------------------


// ----------------------------------
// Check Variable Related

Util.getStr = function( input )
{
	var value = '';

	try
	{
		if ( input )
		{
			if ( Util.isTypeObject( input ) || Util.isTypeArray( input ) ) value = JSON.stringify( input );
			else if ( Util.isTypeString( input ) ) value = input;
			else value = input.toString();
		}
	}
	catch( errMsg )
	{
		console.customLog( 'ERROR in Util.getStr, errMsg: ' + errMsg );
	}

	return value;
};

Util.getJson = function( input )
{
	var value = {};

	try
	{
		if ( input )
		{
			if ( !Util.isObjEmpty( input ) )
			{
				if ( Util.isTypeString( input ) ) value = JSON.parse( input );
				else if ( Util.isTypeObject( input ) || Util.isTypeArray( input ) ) value = JSON.parse( JSON.stringify( input ) );
				else value = JSON.parse( input.toString() );
			}
		}
	}
	catch( errMsg )
	{
		console.customLog( 'ERROR in Util.getJson, errMsg: ' + errMsg );
	}

	return value;
};

// Checks if the json is emtpy
Util.isObjEmpty = function( obj ) 
{
    for ( var key in obj ) {
        if ( obj.hasOwnProperty( key ) )
            return false;
	}
	
    return true;
}

Util.getProperValue = function( val )
{
	Util.getNotEmpty( val );
}

Util.getNotEmpty = function( input ) {

	if ( Util.checkDefined( input ) )
	{
		return input
	}
	else return "";
};

Util.checkDefined = function( input ) {

	if( input !== undefined && input != null ) return true;
	else return false;
};

Util.checkValue = function( input ) {

	if ( Util.checkDefined( input ) && input.length > 0 ) return true;
	else return false;
};

Util.checkDataExists = function( input ) {

	return Util.checkValue( input );
};

Util.checkData_WithPropertyVal = function( arr, propertyName, value ) 
{
	var found = false;

	if ( Util.checkDataExists( arr ) )
	{
		for ( var i = 0; i < arr.length; i++ )
		{
			var arrItem = arr[i];
			if ( Util.checkDefined( arrItem[ propertyName ] ) && arrItem[ propertyName ] == value )
			{
				found = true;
				break;
			}
		}
	}

	return found;
};

Util.isInt = function(n){
    return Number(n) === n && n % 1 === 0;
};

Util.isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

Util.getNum = function( n ) {
	var val = 0;
	
	try { 
		if ( n ) val = Number( n ); 
	}
	catch ( err ) { }
	
	return val;
};

Util.getNumber = function( n ) 
{
	return Util.getNum( n );
};

// Check Variable Related
// ----------------------------------

// ----------------------------------
// JSON Deep Copy Related

// Handles both object and array
Util.getJsonDeepCopy = function( jsonObj )
{
	var newJsonObj;

	if ( jsonObj )
	{
		try
		{
			newJsonObj = JSON.parse( JSON.stringify( jsonObj ) );
		}
		catch( errMsg ) {
			console.customLog( 'ERROR in Util.getJsonDeepCopy, errMsg: ' + errMsg );
		}
	} 

	return newJsonObj;
};

Util.cloneJson = function( jsonObj )
{
	return Util.getJsonDeepCopy( jsonObj );
};
// JSON Deep Copy Related
// ----------------------------------


// ----------------------------------------------------

Util.outputAsStr = function( input )
{	
	var output = '';

	if ( input )
	{	
		if ( Util.isTypeObject( input ) || Util.isTypeArray( input ) )
		{
			try 
			{ 				
				output = JSON.stringify( input );
			} 
			catch ( err ) 
			{ 
				output = 'ErrStringify: ' + input;			
				console.customLog( 'Error in Util.outputAsStr, err: ' + err ); 
			}
		}
		else
		{
			output = input;
		} 	
	}

	return output;
};

// ----------------------------------------------------
// ---- Try Cache / Eval related methods

Util.tryCatchContinue = function( runFunc, optionalMsg )
{
	try
	{
		runFunc();
	}
	catch( errMsg )
	{
		console.customLog( 'ERROR, tryCatchContinue ' + optionalMsg + ', errMsg - ' + errMsg );
	}
};


Util.tryCatchCallBack = function( callBack, runFunc )
{
	try
	{
		runFunc( callBack );
	}
	catch( errMsg )
	{
		console.customLog( 'ERROR, tryCatchCallback, errMsg - ' + errMsg );
		callBack();
	}
};


Util.evalTryCatch = function( inputVal, INFO, optionalTitle )
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
		if ( !optionalTitle ) optionalTitle = '';

		console.customLog( 'ERROR, evalTryCatch ' + optionalTitle + ', errMsg - ' + errMsg + ', inputVal: ' + inputVal );
	}

	return returnVal;
};


Util.traverseEval = function( obj, INFO, iDepth, limit )
{
	if ( iDepth === limit )
	{
		throw 'Error in Util.traverseEval, Traverse depth limit has reached: ' + iDepth;
	}
	else
	{
		Object.keys( obj ).forEach( key => 
		{
			var prop = obj[key];
	
			if ( Util.isTypeArray( prop ) )
			{
				var iDepthArr = iDepth++;

				prop.forEach( ( pArrItem, i ) => 
				{
					if ( Util.isTypeObject( pArrItem ) || Util.isTypeArray( pArrItem ) ) 
					{						
						Util.traverseEval( pArrItem, INFO, iDepthArr, limit );
					}
					else if ( Util.isTypeString( pArrItem ) )
					{		
						try { prop[i] = eval( pArrItem ); } 
						catch ( errMsg ) { throw 'Error in Util.traverseEval, arrayItem str eval: ' + errMsg; }
					}
				});
			}
			else if ( Util.isTypeObject( prop ) )
			{
				Util.traverseEval( prop, INFO, iDepth++, limit );
			}
			else if ( Util.isTypeString( prop ) )
			{				
				try { obj[key] = eval( prop ); } 
				catch ( errMsg ) { throw 'Error in Util.traverseEval, str eval: ' + errMsg; }
			}
		});
	}
};	


// Replace json 'key' names using 'keyListset' ( { 'keys': [], 'keysNew': [] } (same list) )
// Only replace 'key' where the value is string or number/boolean?..
Util.jsonKeysReplace_Ref = function( obj, keyListSet, iDepth, limit )
{
	if ( iDepth === limit )
	{
		var errMsg = 'Error in Util.jsonKeysReplace, Traverse depth limit has reached: ' + iDepth;
		console.customLog( errMsg );
		throw errMsg;
	}
	else
	{
		Object.keys( obj ).forEach( key => 
		{
			var prop = obj[key];	

			if ( Util.isTypeArray( prop ) )
			{
				var iDepthArr = iDepth++;

				prop.forEach( ( pArrItem, i ) => 
				{
					if ( Util.isTypeObject( pArrItem ) || Util.isTypeArray( pArrItem ) ) 
					{						
						Util.jsonKeysReplace_Ref( pArrItem, keyListSet, iDepthArr, limit );
					}
					//else if ( Util.isTypeString( pArrItem ) ) Util.jsonKeyReplace( obj, obj[ i ], keyListSet, 'array' );		
				});
			}
			else if ( Util.isTypeObject( prop ) )
			{
				Util.jsonKeysReplace_Ref( prop, keyListSet, iDepth++, limit );
			}				
			else //if ( Util.isTypeString( prop ) )
			{
				// For now, only do this for string value type keys..
				Util.jsonKeyReplace( obj, key, keyListSet );		
			}
		});
	}
};	

// Only do obj that is key/value one...
Util.jsonKeyReplace = function( obj, key, keyListSet )
{
	var foundIndex = keyListSet.keys.indexOf( key );

	if ( foundIndex >= 0 ) 
	{
		var origVal = obj[ key ]; 
		var keyNew = keyListSet.keysNew[ foundIndex ];

		// get the value/object set from 'key' before deleting the key.
		obj[ keyNew ] = origVal;
		//( Util.isTypeArray( origVal ) || Util.isTypeObject( origVal ) ) ? Util.getJsonDeepCopy( origVal ) : origVal;

		delete obj[ key ];
	}
};


// Return new obj with key replaced. New obj created, thus will loose reference..
//   keyListSet - { "asofiajs": "firstName", "asjfoasdjif": "lastName }
Util.jsonKeysReplace_Str = function( obj, keyListSet )
{
	var newObj = obj;  // set to original data by default if there is issue..

	try
	{
		if ( obj && Util.isTypeObject( obj ) && keyListSet )
		{
			var objInStr = JSON.stringify( obj );
	
			Object.keys( keyListSet ).forEach( key => 
			{
				var keyProp = '"' + key + '":';
	
				if ( objInStr.indexOf( keyProp ) >= 0 )
				{
					var newKey = keyListSet[key];
					var newkeyProp = '"' + newKey + '":';
	
					objInStr = objInStr.replaceAll( keyProp, newkeyProp );
				}	
			});		
	
			newObj = JSON.parse( objInStr );
		}	
	}
	catch ( errMsg )
	{
		console.customLog( 'ERROR in Util.jsonKeysReplace_Str, errMsg: ' + errMsg );
	}

	return newObj;
};


Util.jsonCleanEmptyRunTimes = function( obj, runTime )
{
	for ( var i = 0; i < runTime; i++ )
	{
		Util.jsonCleanEmpty( obj );
	}
};

Util.getJsonCleanEmpty = function( obj )
{
	var jsonNew = Util.cloneJson( obj );

	Util.jsonCleanEmpty( jsonNew );

	return jsonNew;
}

Util.jsonCleanEmpty = function( obj )
{
	Object.keys(obj).forEach( key => 
	{
		var item = obj[key];

		if ( item )
		{
			if ( Util.isTypeArray( item ) )
			{
				if ( item.length == 0 ) delete obj[key];
				else Util.jsonCleanEmpty( item );
			}
			else if ( Util.isTypeObject( item ) )
			{
				if ( Util.isObjEmpty( item ) ) delete obj[key];
				else Util.jsonCleanEmpty( item );	
			}
		}		
		else if ( item === "" || item === undefined || item === null ) delete obj[key];
	});
};


Util.getObjRef_fromList = function( list, prop )
{
	var objRef = {};

	if ( list && prop )
	{
		for ( var i = 0; i < list.length; i++ )
		{
			var obj = list[ i ];

			var objId = obj[ prop ];

			if ( objId ) objRef[ objId ] = obj;
		}
	}

	return objRef;
};

// ----------------------------------------------------

Util.strCombine = function( input )
{	
	var output = '';

	if ( input )
	{
		if ( Util.isTypeArray( input ) )
		{
			output = input.join( ' ' );
		}
		else
		{
			output = input;
		}
	}

	return output;
};


Util.objKeyCount = function( obj )
{
	return ( obj ) ? Object.keys( obj ).length: 0;
};

Util.disableTag = function( tag, isDisable )
{
	tag.prop('disabled', isDisable);
}

// ---------------------------------------

// NOTE: Should be named 'append'?
Util.mergeArrays = function( mainArr, newArr )
{
	for ( var i = 0; i < newArr.length; i++ )
	{
		mainArr.push( newArr[ i ] );
	}
};

Util.appendArray = function( mainArr, newArr )
{
	Util.mergeArrays( mainArr, newArr );
};

Util.getCombinedArrays = function( arr1, arr2 )
{
	var combinedArr = [];

	for ( var i = 0; i < arr1.length; i++ ) combinedArr.push( arr1[ i ] );
	for ( var i = 0; i < arr2.length; i++ ) combinedArr.push( arr2[ i ] );

	return combinedArr;
};

Util.mergeJson = function( destObj, srcObj )
{
	if ( srcObj )
	{
		for( var key in srcObj )
		{
			destObj[key] = srcObj[key];
		}		
	}
};

Util.mergeDeep = function ( dest, obj, option ) 
{
	Object.keys( obj ).forEach( key => {

		var dVal = dest[key];
		var oVal = obj[key];

		if ( Util.isTypeArray( dVal ) && Util.isTypeArray( oVal ) ) 
		{
			if ( option && option.arrOverwrite && oVal.length > 0 ) dest[key] = oVal;
			else Util.mergeArrays( dVal, oVal );			
		} 
		else if ( Util.isTypeObject( dVal ) && Util.isTypeObject( oVal ) ) 
		{
			Util.mergeDeep( dVal, oVal );
		} 
		else 
		{
			dest[key] = oVal;
		}
	});

	//return prev;
};


Util.dotNotation = function ( dest, obj, parentObjName ) 
{
	Object.keys( obj ).forEach( function( key ) {

		var oVal = obj[key];

		if ( Util.isTypeArray( oVal ) )  dest[ parentObjName + '.' + key ] = oVal;
		else if ( typeof oVal === 'object' ) 
		{
			Util.dotNotation( dest, oVal, parentObjName + '.' + key );
		} 
		else 
		{
			dest[ parentObjName + '.' + key ] = oVal;
		}
	});
};

Util.getPathObj = function( obj, pathArr )
{
    var tempObj = Util.getJsonDeepCopy( obj );

    for ( var i = 0; i < pathArr.length; i++ )
    {
        var path = pathArr[i];
        tempObj = tempObj[path];
    }

    return tempObj;
};


// Performs a deep merge of objects and returns new object. Does not modify objects
Util.mergeDeep_v2 = function (...objects) 
{
	const isObject = obj => obj && typeof obj === 'object';

	return objects.reduce( ( prev, obj ) => 
	{
		Object.keys( obj ).forEach( key => {
			const pVal = prev[key];
			const oVal = obj[key];

			if ( Util.isTypeArray( pVal ) && Util.isTypeArray( oVal ) ) 
			{
				prev[key] = pVal.concat(...oVal);
			} 
			else if ( isObject( pVal ) && isObject( oVal ) ) 
			{
				prev[key] = Util.mergeDeep_v2( pVal, oVal );
			} 
			else 
			{
				prev[key] = oVal;
			}
		});

		return prev;
	}, {});
};

Util.getCombinedJson = function( obj1, obj2 )
{
	var combinedObj = {};

	for( var key in obj1 ) combinedObj[key] = obj1[key];
	for( var key in obj2 ) combinedObj[key] = obj2[key];

	return combinedObj;
};

Util.getCombinedJsonInArr = function( objArr )
{
	var combinedObj = {};

	for ( var i = 0; i < objArr.length; i++ ) 
	{
		Util.mergeJson( combinedObj, objArr[i] );
	}

	return combinedObj;
};

// -------------------------------------------

// TODO: We can create Util.sortByKey with 'eval' of 'key' part..

// Sort - by 'Acending' order by default.  1st 2 params (array, key) are required.
Util.sortByKey = function( array, key, noCase, order, emptyStringLast ) 
{
	if ( array.length == 0 || array[0][key] === undefined ) return array;
	else
		{
		return array.sort( function( a, b ) {
		
			var x = a[key]; 
			var y = b[key];

			if ( x === undefined ) x = "";
			if ( y === undefined ) y = "";

			if ( noCase !== undefined && noCase )
			{
				x = x.toLowerCase();
				y = y.toLowerCase();
			}

			if ( emptyStringLast !== undefined && emptyStringLast && ( x == "" || y == "" ) ) 
			{
				if ( x == "" && y == "" ) return 0;
				else if ( x == "" ) return 1;
				else if ( y == "" ) return -1;
			}
			else
			{
				if ( order === undefined )
				{
					return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
				}
				else
				{
					if ( order === "Acending" || order === "asc" ) return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
					else if ( order === "Decending" || order === "desc" ) return ( ( x > y ) ? -1 : ( ( x < y ) ? 1 : 0 ) );
				}
			}
		});
	}
};



// Sort - by 'Acending' order by default.  1st 2 params (array, key) are required.
Util.sortByKey2 = function( array, key, order, options ) 
{
	var noCase;
	var emptyStringLast;

	if ( options )
	{
		noCase = ( options.noCase ) ? options.noCase : undefined;
		emptyStringLast = ( options.emptyStringLast ) ? options.emptyStringLast : undefined;
	}


	if ( array.length == 0 || array[0][key] === undefined ) return array;
	else
	{
		return array.sort( function( a, b ) {
		

			noCase, order, emptyStringLast


			var x = a[key]; 
			var y = b[key];

			if ( x === undefined ) x = "";
			if ( y === undefined ) y = "";

			if ( noCase !== undefined && noCase )
			{
				x = x.toLowerCase();
				y = y.toLowerCase();
			}

			if ( emptyStringLast !== undefined && emptyStringLast && ( x == "" || y == "" ) ) 
			{
				if ( x == "" && y == "" ) return 0;
				else if ( x == "" ) return 1;
				else if ( y == "" ) return -1;
			}
			else
			{
				if ( order === undefined )
				{
					return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
				}
				else
				{
					if ( order === "Acending" || order === "asc" ) return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
					else if ( order == "Decending" || order === "desc" ) return ( ( x > y ) ? -1 : ( ( x < y ) ? 1 : 0 ) );
				}
			}
		});
	}
};



Util.sortByKey_Reverse = function( array, key ) {
	return array.sort( function( b, a ) {
		var x = a[key]; var y = b[key];
		return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
	});
};

// -------------------------------------------

Util.searchByName = function( array, propertyName, value )
{
	for( var i in array ){
		if( array[i][propertyName] == value ){
			return array[i];
		}
	}
	return "";
};

Util.trim = function( input )
{
	return input.replace( /^\s+|\s+$/gm, '' );
};

Util.trimTags = function( tags )
{
	tags.each( function() {
		$( this ).val( Util.trim( $( this ).val() ) );
	});
};

Util.replaceAllRegx = function( fullText, strReplacing, strReplacedWith )
{
	var rePattern = new RegExp( strReplacing, "g" );
	return fullText.replace( rePattern, strReplacedWith );
};

Util.replaceAll = function( fullText, keyStr, replaceStr )
{
	var index = -1;
	do {
		fullText = fullText.replace( keyStr, replaceStr );
		index = fullText.indexOf( keyStr, index + 1 );
	} while( index != -1 );

	return fullText;
};

Util.stringSearch = function( inputString, searchWord )
{
	if( inputString.search( new RegExp( searchWord, 'i' ) ) >= 0 )
	{
		return true;
	}
	else
	{
		return false;
	}
};

Util.upcaseFirstCharacterWord = function( text ){
	var result = text.replace( /([A-Z])/g, " $1" );
	return result.charAt(0).toUpperCase() + result.slice(1); 
};


Util.startsWith = function( input, suffix )
{
    return ( Util.checkValue( input ) && input.substring( 0, suffix.length ) == suffix );
};

Util.endsWith = function( input, suffix ) 
{
    return ( Util.checkValue( input ) && input.indexOf( suffix, input.length - suffix.length ) !== -1 );
};

Util.clearList = function( selector ) {
	selector.children().remove();
};

Util.moveSelectedById = function( fromListId, targetListId ) {
	return !$('#' + fromListId + ' option:selected').remove().appendTo('#' + targetListId ); 
};

Util.selectAllOption = function ( listTag ) {
	listTag.find('option').attr('selected', true);
};

Util.unselectAllOption = function ( listTag ) {
	listTag.find('option').attr('selected', true);
};

Util.valueEscape = function( input )
{
	//input.replaceAll( '\', '\\' );
	//input = input.replace( "'", "\'" );
	input = input.replace( '"', '\"' );

	return input;
};

Util.valueUnescape = function( input )
{
	//input.replaceAll( '\', '\\' );
	//input = input.replace( "\'", "'" );
	input = input.replace( '\"', '"' );

	return input;
};

Util.reverseArray = function( arr )
{
	return arr.reverse();
};

// ----------------------------------
// List / Array Related

Util.arrayReplaceData = function( orig, newData )
{
	orig.splice(0); // Remove all data in array

	newData.forEach( item => {
		orig.push( item );
	});
};


Util.RemoveFromArray = function( list, propertyName, value )
{
	var index;

	$.each( list, function( i, item )
	{
		if ( item[ propertyName ] == value ) 
		{
			index = i;
			return false;
		}
	});

	if ( index !== undefined ) 
	{
		list.splice( index, 1 );
	}

	return index;
};

Util.getFromListByName = function( list, name )
{
	var item;

	for( i = 0; i < list.length; i++ )
	{
		if ( list[i].name === name )
		{
			item = list[i];
			break;
		}
	}

	return item;
};

Util.getFromList = function( list, value, propertyName )
{
	var item;

	if ( list )
	{
		// If propertyName being compare to has not been passed, set it as 'id'.
		if ( propertyName === undefined )
		{
			propertyName = "id";
		}

		for( i = 0; i < list.length; i++ )
		{
			var listItem = list[i];

			if ( listItem[propertyName] && listItem[propertyName] === value )
			{
				item = listItem;
				break;
			}
		}
	}

	return item;
};

Util.getItemFromList = function( list, value, propertyName )
{
	return Util.getFromList( list, value, propertyName );
};

Util.getItemsFromList = function( list, value, propertyName )
{
	var items = [];

	if ( list )
	{
		// If propertyName being compare to has not been passed, set it as 'id'.
		if ( propertyName === undefined )
		{
			propertyName = "id";
		}

		for( i = 0; i < list.length; i++ )
		{
			var listItem = list[i];

			if ( listItem[propertyName] && listItem[propertyName] === value )
			{
				items.push( listItem );
			}
		}
	}

	return items;
};


Util.getMatchData = function( settingData, matchSet )
{
	var returnData = new Array();
	
	$.each( settingData, function( i, item )
	{
		var match = true;

		for ( var propName in matchSet )
		{
			if ( matchSet[ propName ] != item[ propName ] ) 
			{
				match = false;
				break;
			}
		}

		if ( match )
		{
			returnData.push( item );
		}
	});

	return returnData;
};


Util.getFirst = function( inputList ) 
{
	var returnVal;

	if( inputList !== undefined && inputList != null && inputList.length > 0 )
	{
		returnVal = inputList[0];
	}
	
	return returnVal;
};


// $.inArray( item_event.trackedEntityInstance, personList ) == -1

Util.checkExistInList = function( list, value, propertyName )
{
	var item = Util.getFromList( list, value, propertyName );

	if ( item === undefined ) return false;
	else return true;
};


Util.checkEmptyId_FromList = function( list )
{
	return ( Util.getFromList( list, '' ) !== undefined );
};

Util.jsonToArray = function( jsonData, structureConfig )
{
	//parameter structureConfig (optional), e.g. 'name:value', or 'id:val', etc;
	//to do: make recursive in the presence of nested json objects (typeOf obj === "object" )
	var strucConfArr = ( structureConfig ? structureConfig.split( ':' ) : undefined );
	var arrRet = [];
	var fldExcl = 'userName,password,';

	for( var keyName in jsonData )
	{
		if ( fldExcl.indexOf( keyName ) < 0 )
		{
			var obj = jsonData[ keyName ];

			if ( strucConfArr )
			{
				var jDat = { [ strucConfArr[ 0 ] ]: keyName, [ strucConfArr[ 1 ] ]: obj };
			}
			else
			{
				var jDat = { [ keyName ]: obj };
			}
	
			arrRet.push ( jDat );
		}
	}

	return arrRet;
};


Util.recursiveCalls = function( dataObj, i, runMethod, finishCallBack )
{
    if ( dataObj.list.length <= i )
    {
        return finishCallBack();        
    }
    else
    {
        runMethod( dataObj.list[i], function() {
            Util.recursiveCalls( dataObj, i + 1, runMethod, finishCallBack );
        }, finishCallBack );
    }
};

// List / Array Related
// ----------------------------------

Util.getURLParameterByName = function( url, name )
{
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(url);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

Util.getURLParameterByVariables = function( url, name )
{
	var result = [];
	var idx = 0;
	var pairs = url.split("&");
	for( var i=0; i< pairs.length; i++ ){
		var pair = pairs[i].split("=");
		if( pair[0] == name ){
			result[idx] = pair[1];
			idx++;
		}
	}
	return result;
};


Util.getURL_pathname = function( loc )
{
	// '/api/apps/NetworkListing/index.html', loc = 4 by - '', 'api', 'apps', 'NetworkListing'
	var pathName = "";
	var strSplits = window.location.pathname.split( '/' );

	if ( strSplits.length >= loc )
	{
		pathName = strSplits[ loc - 1 ];
	}

	return pathName;
};

Util.setUrlParam = function( url, paramKey, paramVal )
{
    var startChar = ( url.indexOf( '?' ) < 0 ) ? '?' : '&';

	url += startChar + paramKey + '=' + paramVal;

	return url;
}

// --------------------------------------------

Util.copyProperties = function( source, dest )
{
	for ( var key in source )
	{
		dest[ key ] = source[ key ];
	}
};

Util.RemoveFromArray = function( list, propertyName, value )
{
	var index;

	$.each( list, function( i, item )
	{
		if ( item[ propertyName ] == value ) 
		{
			index = i;
			return false;
		}
	});

	if ( index !== undefined ) 
	{
		list.splice( index, 1 );
	}

	return index;
};

Util.getObjPropertyCount = function( list )
{
	var count = 0;

	for ( var prop in list )
	{
		count++;
	}

	return count;
};

// Check Variable or List Related
// -------


// BELOW SHOULD MOVE TO FORM UNIT..
// ----------------------------------
// Seletet Tag Populate, Etc Related
// -- Move to either 'Util2' class, or 'FormUtil' class

Util.populateSelect_ByList = function( selectTag, listData, dataType )
{
	selectTag.empty();

	$.each( listData, function( i, item ) 
	{
		var option = $( '<option ' + FormUtil.getTermAttr( item ) + '></option>' );

		if ( dataType !== undefined && dataType == "Array" )
		{
			option.attr( "value", item ).text( item );
		}
		else
		{
			option.attr( "value", item.id ).text( item.name );
		}
			
		selectTag.append( option );
	});
};

Util.populateSelect_Simple = function( selectObj, json_Data )
{
	selectObj.empty();

	$.each( json_Data, function( i, item ) {	
		if ( Util.isTypeObject( item ) )
		{
			selectObj.append( '<option ' + FormUtil.getTermAttr( item ) + ' value="' + item.id + '">' + item.name + '</option>' );
		}
		else if ( Util.isTypeString( item ) )
		{
			selectObj.append( '<option value="' + item + '">' + item + '</option>' );
		}
	});
};

Util.populateSelectDefault = function( selectObj, selectNoneName, json_Data, inputOption )
{
	selectObj.empty();
	selectObj.append( '<option term="' + Util.termName_pleaseSelectOne + '" value="">' + selectNoneName + '</option>' );

	var valuePropStr = "id";
	var namePropStr = "name";

	if ( inputOption !== undefined )
	{
		valuePropStr = inputOption.val;
		namePropStr = inputOption.name;
	}

	if ( json_Data !== undefined )
	{
		$.each( json_Data, function( i, item ) {

			var optionTag = $( '<option ' + FormUtil.getTermAttr( item ) + '></option>' );

			optionTag.attr( "value", item[ valuePropStr ] ).text( item[ namePropStr ] );

			selectObj.append( optionTag );
		});
	}
};


Util.populateSelect_newOption = function( selectObj, json_Data, inputOption )
{
	selectObj.empty();
	selectObj.append( '<option term="' + Util.termName_pleaseSelectOne + '" selected disabled="disabled">Choose an option</option>' );
	
	var valuePropStr = "id";
	var namePropStr = "name";

	if ( inputOption !== undefined )
	{
		valuePropStr = inputOption.val;
		namePropStr = inputOption.name;
	}

	if ( json_Data !== undefined )
	{
		$.each( json_Data, function( i, item ) {

			var optionTag = $( '<option ' + FormUtil.getTermAttr( item ) + '></option>' );

			optionTag.attr( "value", item[ valuePropStr ] ).text( item[ namePropStr ] );

			selectObj.append( optionTag );
		});
	}
};

Util.populateUl_newOption = function( selectObj, json_Data, eventsOptions )
{
	json_Data.forEach( optionData => {

		let option = document.createElement('option')

		$(option).css({
			'display':'none',
			'width':'100%',
			'list-style':'none',
			'background':'white',
			'padding':'4px 8px',
			'font-size':'14px'
		})

		option.textContent = optionData.defaultName
		option.value = optionData.value

		$(option).click(eventsOptions)

		selectObj.appendChild( option )

	})
};


Util.populateSelect = function( selectObj, selectName, json_Data, dataType )
{
	selectObj.empty();
	selectObj.append( '<option term="' + Util.termName_pleaseSelectOne + '" value="">Select ' + selectName + '</option>' );

	if ( json_Data !== undefined )
	{
		$.each( json_Data, function( i, item ) 
		{
			var option = $( '<option ' + FormUtil.getTermAttr( item ) + '></option>' );

			if ( dataType !== undefined && dataType == "Array" )
			{
				option.attr( "value", item ).text( item );
			}
			else
			{
				option.attr( "value", item.id ).text( item.name );
			}
				
			selectObj.append( option );
		});
	}
};


Util.appendOnSelect = function( selectObj, dataArr, dataType )
{
	if ( dataArr )
	{
		dataArr.forEach( item => 
		{
			var option = $( '<option ' + FormUtil.getTermAttr( item ) + '></option>' );

			if ( dataType === "Array" ) option.attr( "value", item ).text( item );
			else option.attr( "value", item.id ).text( item.name );

			selectObj.append( option );
		});
	}
};


Util.checkItemOnSelect = function( selectObj, itemValue )
{
	return ( selectObj.find( 'option[value="' + itemValue + '"]' ).length > 0 );
};

// -------------------------

Util.decodeURI_ItemList = function( jsonItemList, propName )
{
	if ( jsonItemList )
	{
		$.each( jsonItemList, function( i, item ) 
		{
			if ( item[ propName ] )
			{
				item[ propName ] = decodeURI( item[ propName ] );
			}
		});
	}
};

Util.setSelectDefaultByName = function( ctrlTag, name )
{
	ctrlTag.find( "option:contains(" + name + ")" ).attr( 'selected', 'selected' ); //true
};


Util.getSelectedOptionName = function( ctrlTag )
{
	return ctrlTag.find( "option:selected" ).text();
	// return ctrlTag.options[ ctrlTag.selectedIndex ].text; // Javascript version
};

Util.reset_tagsListData = function( tags, listJson )
{
	tags.each( function() {

		var tag = $( this );
		var tagVal = tag.val();

		tag.find( 'option' ).remove();

		Util.populateSelectDefault( tag, "", listJson );
		
		tag.val( tagVal );
	});
};
// Seletet Tag Populate, Etc Related
// ----------------------------------

Util.checkInteger = function( input )
{
	var intRegex = /^\d+$/;
	return intRegex.test( input );
};

Util.checkCalendarDateStrFormat = function( inputStr )
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

Util.isDate = function(date) {
   return ( (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) ));
};

// ----------------------------------
// Date Formatting Related


Util.addZero = function( i )
{
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};

Util.dateToString = function( date )
{
	var month = eval( date.getMonth() ) + 1;
	month = ( month < 10 ) ? "0" + month : month;
	
	var day = eval( date.getDate() );
	day = ( day < 10 ) ? "0" + day : day;
		
	return date.getFullYear() + "-" + month + "-" + day;
};


Util.dateToStr = function( date, separator )
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
Util.dateStr = function( formatType, inputDate )
{
	var date = ( inputDate ) ? inputDate: new Date();
	var formatPattern = Util.dateType1;

	if ( formatType === 'D' || formatType === 'DATE' ) formatPattern = Util.dateType_DATE;
	if ( formatType === 'DT' || formatType === 'DATETIME' ) formatPattern = Util.dateType_DATETIME;

	return $.format.date( date, formatPattern );
};


Util.dateAddStr = function( formatType, addDateNumber )
{
	var date = new Date();

	date.setDate( date.getDate() + addDateNumber );

	return Util.dateStr( formatType, date );
};


Util.getDateTimeStr = function()
{
	return Util.formatDateTime( new Date() );
};

// ===============================================


Util.formatDate = function( date, formatPattern )
{
	if ( !formatPattern ) formatPattern = Util.dateType1;

	return $.format.date( date, formatPattern );
};

Util.formatDateTime = function( dateObj, dateType )
{
	return Util.formatDateTimeStr( dateObj.toString(), dateType );
};

Util.formatDateTimeStr = function( dateStr, dateType )
{
	if ( !dateType ) dateType = Util.dateType1;

	return $.format.date( dateStr, dateType );
};

Util.timeCalculation = function( dtmNewer, dtmOlder )
{
	var reSult = { 'hh': 0, 'mm': 0, 'ss': 0 };

	var sec_num = ( new Date( dtmNewer ).getTime()  - new Date( dtmOlder ).getTime() ) / 1000;

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

Util.getTimePassedMs = function( fromDtStr )
{
	var timePassedMs = -1;

	try
	{
		var currDt = new Date().getTime();
		var fromDt = new Date( fromDtStr ).getTime();

		var timePassedMs = currDt - fromDt;
	}
	catch ( errMsg )
	{
		console.customLog( 'ERROR in Util.getTimePassedMs, errMsg: ' + errMsg );
	}

	return timePassedMs;
};

Util.dateUTCToLocal = function( dateStr )
{
	var localDateObj;

	try
	{
		if ( dateStr )
		{
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
		console.customLog( 'ERROR in Util.dateUTCToLocal, errMsg: ' + errMsg );
	}

	return localDateObj;
};

Util.getUTCDateTimeStr = function( dateObj, optionStr )
{
	if ( !dateObj ) dateObj = new Date();

	var dtStr = dateObj.toISOString();
	if ( optionStr === 'noZ' ) dtStr = dtStr.replace( 'Z', '' );

	return dtStr;
};

// Date Formatting Related
// ----------------------------------

// ----------------------------------
// Others

Util.getStrLastChar = function( inputVal )
{
	return inputVal.slice( inputVal.length - 1 );
};

Util.generateRandomId = function( len ) 
{
	var id = '';
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var id_size = 12;

	if ( len ) id_size = len;

	for (var i = 1; i <= id_size; i++) 
	{
		var randPos = Math.floor( Math.random() * charSet.length );
		id += charSet[ randPos ];
	}
	
	return id;
};

Util.generateTimedUid = function() 
{
	return ( new Date().getTime() ).toString( 36 );
}

Util.getParameterByName = function( name ) 
{
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

Util.getParameterInside = function( value, openClose )
{
	// intended to be used as follows: Util.getValueInside( '##calculatePattern{AA-BB}', '{}' ) --> returns 'AA-BB'
	if ( value.indexOf( openClose.substring( 0,1 ) ) > -1 )
	{
		var split1 = openClose.substring( 0,1 ), split2 = openClose.substring( 1,2 );
		return ( value.split( split1 ) [ 1 ] ).split( split2 ) [ 0 ];	
	}
	else
	{
		return '';
	}
};


Util.generateRandomNumberRange = function(min_value , max_value) 
{
	return Math.random() * ( max_value - min_value ) + min_value;
}

Util.getRandomWord = function( slist, anythingRandom )
{
	var arrL = slist.split(',');
	var i = Util.generateRandomNumberRange( 0, arrL.length -1 ).toFixed(0);
	return arrL[i];
}


Util.generateRandomNumber = function( len ) 
{
	var text = "";
	var possible = "0123456789";

	for (var i = 0; i < len; i++)
		text += possible.charAt( Math.floor( Math.random() * possible.length ) );

	return text;
}

Util.getServerUrl = function()
{
	return location.protocol + '//' + location.host;
};

Util.getIndexes = function( inputStr, keyStr )
{
	var indexes = [];

	var idx = inputStr.indexOf( keyStr );
	while ( idx != -1 ) {
		indexes.push(idx);
		  idx = inputStr.indexOf( keyStr, idx + 1 );
	}

	return indexes;
};

Util.upNumber_IntArr = function( arr, upNumber )
{
	for ( var i = 0; i < arr.length; i++ )
	{
		arr[i] = arr[i] + upNumber;
	}
};


Util.getBaseFromBase = function ( input, from, to )
{
	return ConvertBase.custom( input, from, to );
};


// Others
// ----------------------------------

Util.encrypt = function (seed,loops) 
{
	let ret = seed;
	
	if ( seed )
	{
		for ( var i = 0; i < loops; i++ )
		{
			ret = btoa(ret); //SHA256(ret)
		}	
	}

	return ret;
};

Util.decrypt = function (garbage,loops) 
{
	let seed = garbage;
	for ( var i = 0; i < loops; i++ )
	{
		seed = atob(seed);
	}
	return seed;
} ;

// --------------------------------------
// Mobile Check Related --------
Util.isMobi = function () {
	return (/Mobi/.test(navigator.userAgent));
};

Util.isAndroid = function () {
	return (/Android/.test(navigator.userAgent));
};

Util.isIOS = function () {
	return (navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)/i) !== null);
};

Util.lengthInUtf8Bytes = function (str) {
	// Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
	var m = encodeURIComponent(str).match(/%[89ABab]/g);
	return str.length + (m ? m.length : 0);
}

Util.getDateSeparator = function (formatDate) {
	var toTry = ['-', '/', ' '];

	for (var i = 0; i <= toTry.length - 1; i++) {
		if (formatDate.indexOf(toTry[i]) > 0) {
			return toTry[i];
		}
	}
};

Util.numberWithCommas = function (x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


Util.cloneArray = function (dataArray, callBack) {
	if (Util.isTypeArray(dataArray)) {
		try {
			var retArr = []; //[...dataArray]

			for (i = 0; i < dataArray.length; i++) {
				retArr.push(dataArray[i]);
			}

			if (callBack) callBack(retArr)
			else return retArr;
		} catch (errMsg) {
			console.customLog('ERROR in Util.cloneArray(): ' + errMsg);
			callBack();
		}
	} else {
		console.customLog('ERROR in Util.cloneArray(): ~ object is not array ');
	}

};

// -----------------------------------------------------------------

Util.getTimeMs = function( input, defaultMs ) 
{
	var outputMs = defaultMs;

	if ( input )
	{
		if ( Util.isTypeString( input ) ) 
		{
			outputMs = Util.getTimeMsStr( input );
		}
		else if ( Util.isTypeObject( input ) )
		{
			if ( input.time !== undefined && input.unit )
			{
				var timeNum = Util.getNum( input.time );

				if ( input.unit === "second" ) outputMs = timeNum * 1000;
				else if ( input.unit === "minute" ) outputMs = timeNum * 1000 * 60;
				else if ( input.unit === "hour" ) outputMs = timeNum * 1000 * 60 * 60;
			}    
		}
	} 

	return outputMs;
};

// '00:00:00' time format
Util.getTimeMsStr = function( input )
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

	timeMs += hr * 1000 * 60 * 60;
	timeMs += min * 1000 * 60;
	timeMs += sec * 1000;

	return timeMs;
};


Util.getTimeFromMs = function( inputMsTime, toTimeName, optionalStr ) 
{	
	var outputVal = 0;
	var msTimeNum = Util.getNum( inputMsTime );

	Util.tryCatchContinue( function() 
	{
		if ( toTimeName === "second" ) outputVal = Math.round( msTimeNum / 1000 );
		else if ( toTimeName === "minute" ) outputVal = Math.round( timeNum / 1000 / 60 );
		else if ( toTimeName === "hour" ) outputVal = Math.round( timeNum / 1000 / 60 / 60 );	
	}, 'Util.getTimeFromMs' );

	return ( optionalStr ) ? outputVal + optionalStr : outputVal;
};

// -----------------------------------------------------------------

Util.stylesStrAppy = function( stylesStr, tag ) 
{
	try {
		stylesStr.split( ';' ).forEach( style => {
			var styleData = style.split( ':' );
			if ( styleData.length >= 2 ) tag.css( styleData[0], styleData[1] );
		});
	}
	catch( errMsg )
	{
		console.customLog( 'ERROR in Util.stylesStrAppy, errMsg: ' + errMsg );
	}
};


Util.getSecFromMiliSec = function( miliSec ) 
{
	sec = 0;

	try {
		if ( miliSec ) sec = Math.round( miliSec / 1000 );
	}
	catch( errMsg )
	{
		console.customLog( 'ERROR in Util.getSecFromMiliSec, errMsg: ' + errMsg );
	}

	return sec;
};
