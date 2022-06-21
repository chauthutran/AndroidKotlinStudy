
// -------------------------------------------
// -- Utility2 Class/Methods
//
//	- Some of the methods are form/class specific.
//		- Move to those class that the method belongs to
//		- Move to formUtil if form related..


function Util2() {};

Util2.getValueFromPattern = function( tagTarget, pattern, commitSEQIncr )
{
	var arrPattern;
	var patternSeparator;
	var removeSeparator = false;
	var arrParms;
	var ret = '';

	if ( pattern.indexOf( ',' ) > 0 )
	{
		arrParms = pattern.split( ',' );
		patternSeparator = ( arrParms[ 1 ] ).trim();
		arrPattern = ( arrParms[ 0 ] ).split( patternSeparator );

		if ( arrParms[ 2 ] != undefined )
		{
			if ( isNaN( arrParms[ 2 ] ) )
			{
				if ( ( arrParms[ 2 ] ).toLowerCase() == 'true' )
				{
					removeSeparator = true;
				}
			}
			else
			{
				removeSeparator = ( parseFloat( arrParms[ 2 ] ) > 0 )
			}
		}
	}
	else
	{
		if ( pattern.indexOf('-') ) patternSeparator = '-';
		if ( pattern.indexOf('_') ) patternSeparator = '_';
		if ( pattern.indexOf(' ') ) patternSeparator = ' ';
		if ( pattern.indexOf('/') ) patternSeparator = '/';
		if ( pattern.indexOf('*') ) patternSeparator = '*';

		arrPattern = pattern.split( patternSeparator );
	}

	for (var i = 0; i < arrPattern.length; i++)
	{
		var returnPart = '';

		if ( isNaN( arrPattern[ i ] ) )
		{
			if ( ( arrPattern[ i ] ).indexOf( 'YYYYMMDD' ) >= 0 && ( arrPattern[ i ] ).toString().length == 8 )
			{
				returnPart = Util2.dateToMyFormat( new Date(), 'YYYYMMDD' );
			}
			else if ( ( arrPattern[ i ] ).indexOf( 'YYMMDD' ) >= 0 && ( arrPattern[ i ] ).toString().length == 6 )
			{
				returnPart = Util2.dateToMyFormat( new Date(), 'YYMMDD' );
			}
			else if ( ( arrPattern[ i ] ).indexOf( 'MMDD' ) >= 0 && ( arrPattern[ i ] ).toString().length == 4 )
			{
				returnPart = Util2.dateToMyFormat( new Date(), 'MMDD' );
			}
			else if ( (( arrPattern[ i ] ).match(new RegExp("X", "g")) || []).length == ( arrPattern[ i ] ).toString().length )
			{
				returnPart = Util2.generateRandomAnything( ( arrPattern[ i ] ).toString().length, "ABCDEFGHIJKLMNOPQRSTUVWXYZ" );
			}
			else if ( ( arrPattern[ i ] ).indexOf( 'SEQ[' ) >= 0 )
			{
				returnPart = Util2.newLocalSequence( arrPattern[ i ], commitSEQIncr );
			}
			else if ( ( arrPattern[ i ] ).indexOf( '.' ) > 0 )
			{
				returnPart = Util2.getLocalStorageObjectValue( arrPattern[ i ] );
			}
			else if ( ( arrPattern[ i ] ).indexOf( 'form:' ) >= 0 )
			{
				returnPart = Util2.getFormInputValuePattern( tagTarget, arrPattern[ i ], patternSeparator );
			}
			else
			{
				returnPart = ( arrPattern[ i ] );
			}

		}
		else
		{
			if ( parseFloat( arrPattern[ i ] ) == 0 )
			{
				returnPart = Util2.paddNumeric( ( Util.generateRandomNumberRange( 0, Math.pow(10, ( arrPattern[ i ] ).toString().length ) -1 ) ).toFixed(0), (arrPattern[ i ]).toString().length );
			}

		}

		if ( returnPart && returnPart.length )
		{
			ret += returnPart + ( removeSeparator ? '' : patternSeparator );
		}
	}

	if ( ret.length )
	{
		return ( removeSeparator ? ret : ret.substring( 0, ret.length -1 ) );
	}
};


Util2.getLocalStorageObjectValue = function( objKeyVal )
{
	var userName = AppInfoLSManager.getUserName();
	var arrKeys;

	if ( ( !userName && !objKeyVal ) || ( objKeyVal && objKeyVal.length == 0) )
	{
		console.log( ' exiting getLocalStorageObjectValue ');
		return;
	}
	else
	{
		if ( userName )
		{
			var localData = SessionManager.sessionData;

			arrKeys = objKeyVal.toString().split( '.' );

			return Util2.recFetchLocalKeyVal( localData[arrKeys[ 0] ], arrKeys, 0 );

		}
	}
};


Util2.newLocalSequence = function( pattern, commitSEQIncr )
{
	var userName = SessionManager.sessionData.login_UserName;
	var passwd = SessionManager.sessionData.login_Password;

	SessionManager.getLoginRespData_IDB( userName, passwd, function( jsonUserData )
	{
		var jsonStorageData = jsonUserData.seqIncr;
		var ret;
	
		if ( jsonStorageData == undefined ) 
		{
			jsonStorageData = { "DD": Util2.dateToMyFormat( new Date(), 'DD' ), "MM": Util2.dateToMyFormat( new Date(), 'MM' ), "YY": Util2.dateToMyFormat( new Date(), 'YY' ), "D": 0, "M": 0, "Y": 0 };
		}
	
		if ( pattern.indexOf('[') > 0 )
		{
			var parms = Util.getParameterInside( pattern, '[]' );
	
			if ( parms.length )
			{
				if ( parms.indexOf(':') )
				{
					var arrParm = parms.split( ':' ); // e.g. DD, 4 = daily incremental sequence, padded with 4 zeroes, e.g. returning 0001
	
					if ( Util2.dateToMyFormat( new Date(), arrParm[0] ) != jsonStorageData[ arrParm[0] ] )
					{
						// current incrementer 'date-determined offset', e.g. DD,4 > TODAY's day number IS DIFFERENT TO LAST TIME USED, THEN RESET TO ZERO
						ret = 1;
						jsonStorageData[ arrParm[0] ] = Util2.dateToMyFormat( new Date(), arrParm[0] );
					}
					else
					{
						var last = jsonStorageData[ (arrParm[0]).slice(1) ];
	
						if ( last )
						{
							ret = ( parseInt( last ) + 1 );
						}
						else
						{
							ret = 1;
						}
	
					}
	
					jsonStorageData[ (arrParm[0]).slice(1) ] = ret;
					jsonUserData.seqIncr = jsonStorageData;
	
					if ( commitSEQIncr != undefined && commitSEQIncr == true )
					{
						SessionManager.setLoginRespData_IDB( userName, passwd, jsonUserData );
					}
	
					return Util2.paddNumeric( ret, arrParm[1] );
	
				}
				else
				{
					console.log( ' ~ no newLocalSequence comma separator');
				}
			}
			else
			{
				console.log( ' ~ no localSequence parms');
			}	
		}
	});
};

Util2.recFetchLocalKeyVal = function ( objJson, objArr, itm )
{
	if ( objArr[ (itm + 1) ] && objJson[ objArr[ (itm + 1) ] ] )
	{
		return Util2.recFetchLocalKeyVal( objJson[ objArr[ ( itm + 1 ) ] ], objArr, (itm+1) );
	}
	else 	
	{
		return objJson.toString();
	}
};

Util2.paddNumeric = function( val, padding )
{
	var ret = '';
	if ( val && padding || val == 0 && padding )
	{
		for (var i = 0; i < ( parseInt( padding ) - val.toString().length ); i++)
		{
			ret += '0';
		}
		ret += val.toString();
		return ret;
	}
	else
	{
		if ( val ) return val.toString();
	}
}

Util2.generateRandomAnything = function( len, possible ) 
{
	var text = "";

	for (var i = 0; i < len; i++)
		text += possible.charAt( Math.floor( Math.random() * possible.length ) );

	return text;
};


// THIS SHOULD BE REPLACED LATER..
Util2.populate_year = function ( el, data, labelText ) {

	var ul = el.getElementsByClassName('optionsSymbol')[0],
		modal = el.getElementsByClassName('modalSymbol')[0],
		container = el.getElementsByClassName('containerSymbol')[0],
		set = el.querySelector('.acceptButton'),
		cancel = el.querySelector('.declineButton'),
		inputTrue = el.querySelector('.dataValue'),
		inputShow = el.querySelector('.displayValue'),
		inputSearch = el.getElementsByClassName('searchSymbol')[0],
		closeSearch = el.querySelector('.closeSearchSymbol');

	function sendFocus(newIndex) {

		if (ul.dataset.index != newIndex) {

			const lastEl = ul.children[ul.dataset.index]

			if (lastEl) {
				//lastEl.style.setProperty('color', 'black')
				lastEl.classList.toggle('focus')
			}

			ul.children[newIndex].classList.toggle('focus')
			//ul.children[newIndex].style.setProperty('color', '#009788')
			ul.dataset.index = newIndex

		}
	}

	function sendChoose(){

		inputTrue.value = ul.children[ul.dataset.index].dataset.value;
		inputShow.value = ul.children[ul.dataset.index].innerText;

		FormUtil.dispatchOnChangeEvent( $( '[name="' + inputTrue.name +'"]') );

	}

	function generateLi( { value, text, parent, index} ){

		const li = document.createElement('li');

		li.dataset.value = value;
		li.dataset.index = index;
		li.innerText = text;

		$(li).click(function(){
			sendFocus(li.dataset.index)
		});

		parent.appendChild(li);

		return li;

	}

	function hidrateUl( data, callBack )
	{
		data.map( (obj,index) => generateLi( { ...obj, index, parent:ul } ));

		if ( callBack ) callBack();
	}

	closeSearch.style.setProperty('display','none');
	inputSearch.style.setProperty('display','none');

	$(set).click( function(e)
	{
		e.preventDefault();
		$( 'div.scrim' ).off( 'click' );
		$( 'div.scrim' ).hide();
		if (!isNaN(parseInt(ul.dataset.index))) {
			sendChoose();
		}
		modal.parentElement.style.setProperty('display', 'none');

	});

	$(cancel).click( function(e)
	{
		e.preventDefault();
		$( 'div.scrim' ).off( 'click' );
		$( 'div.scrim' ).hide();
		modal.parentElement.style.setProperty('display', 'none');
	});

	inputShow.addEventListener('focus', e => {
		e.preventDefault();
		inputShow.blur();
		$( 'div.scrim' ).show();
		$( 'div.scrim' ).off( 'click' );
		$( 'div.scrim' ).click( function(){ $(cancel).click(); } );
		modal.parentElement.style.setProperty('display', 'flex');
		$( '.container--optionsSymbol' ).scrollTop( $( 'ul.optionsSymbol' )[0].scrollHeight );

	})

	$(modal.parentElement).click( function(e)
	{
		e.preventDefault();
		if (e.target === modal.parentElement) {
			modal.parentElement.style.setProperty('display', 'none');
		}
	});

	inputSearch.addEventListener('keyup', e => {

		if (e.target.value == '') {
			closeSearch.style.setProperty('display', 'none');
		} else {
			closeSearch.style.setProperty('display', 'flex');
		}

		var letras = e.target.value;
		var lis = Array.from(ul.children);

		lis.forEach(li => {
			var palabra = li.innerText.toLowerCase();
			if (!palabra.match(`.*${letras.toLowerCase()}.*`)) {
				li.style.setProperty('display', 'none');
			} else {
				li.style.setProperty('display', 'block');
			}
		});

	})

	$(closeSearch).click( function(e)
	{
		e.preventDefault()
		inputSearch.value = ''
		closeSearch.style.setProperty('display', 'none')
		var lis = Array.from(ul.children)
		lis.forEach(li => li.style.setProperty('display', 'block'))
	})

	inputSearch.parentElement.innerHTML = '<label>' + labelText + '</label>'; 

	hidrateUl( data);

};


Util2.dateToMyFormat = function( date, myFormat )
{
	var y = ( date.getFullYear() ).toString();
	var month = ( (myFormat.match(new RegExp("MM", "g")) || []).length ? eval( date.getMonth() ) + 1 : '' );
	var day = ( (myFormat.match(new RegExp("DD", "g")) || []).length ? eval( date.getDate() ) : '' );
	var year = y.toString(); // = ( (myFormat.match(new RegExp("YY", "g")) || []).length ? ( ( (myFormat.match(new RegExp("YY", "g")) || []).length > 1 ) ? y.toString() : y.toString().slice( -2 ) ) : '' );

	if ( ( (myFormat.match(new RegExp("YY", "g")) || []).length == 1 ) ) year = y.toString().slice( -2 );
	if ( month.toString().length ) month = ( parseInt( month ) < 10 ) ? "0" + ( month ).toString() : ( month ).toString();
	if ( day.toString().length ) day = ( parseInt( day ) < 10 ) ? "0" + ( day ).toString() : ( day ).toString();

	if ( myFormat.indexOf('YYMMDD') >= 0 )
	{
		return year.toString() + '' + month.toString() + '' + day.toString();
	}
	else if ( myFormat.indexOf('DDMMYY') >= 0 )
	{
		return day.toString() + '' + month.toString() + '' + year.toString();
	}
	else if ( myFormat.indexOf('DDMM') >= 0 )
	{
		return day.toString() + '' + month.toString();
	}
	else if ( myFormat.indexOf('MMDD') >= 0 )
	{
		return month.toString() + '' + day.toString();
	}
	else if ( myFormat.indexOf('YY') >= 0 )
	{
		return year.toString();
	}
	else if ( myFormat.indexOf('MM') >= 0 )
	{
		return month.toString();
	}
	else if ( myFormat.indexOf('DD') >= 0 )
	{
		return day.toString();
	}
};


// ---------------------------------

Util2.getAgeValueFromPattern = function( tagTarget, pattern )
{
	var formTarg = tagTarget.closest( 'div.formDivSec' );
	var age = '';

	try
	{
		if ( pattern.indexOf( 'form:' ) >= 0 )
		{
			var targFld = pattern.split( 'form:' )[ 1 ];
			var targTag = formTarg.find( "[name='" + targFld + "']" ); //"#" + targFld ); //( "[name='" + targFld + "']" );
	
			if ( targTag )
			{
				var InpVal = targTag.val();
				if ( InpVal && InpVal.length ) age = Util.getAge_ByBirthDate( InpVal );
			}
		}	
	}
	catch ( errMsg ) { console.log( 'ERROR on Util2.getAgeValueFromPattern, ' + errMsg ); }

	return age;
};


Util2.getFormInputValuePattern = function( tagTarget, formInputPattern, patternSeparator )
{
	var formTarg = tagTarget.closest( 'form' ); //div.formDivSec
	var arrPattern;
	var ret = '';

	arrPattern = formInputPattern.split( patternSeparator ); //'+'

	for (var i = 0; i < arrPattern.length; i++)
	{
		var InpVal = '';
		var formInpFld = arrPattern[ i ].replace( 'form:', '' ).split( '[' )[ 0 ];

		if ( formInpFld.length )
		{
			var InpTarg = formTarg.find( "[name='" + formInpFld + "']" );

			if ( InpTarg )
			{
				InpVal = InpTarg.val();

				if ( InpVal && InpVal.length )
				{

					for (var p = 1; p < arrPattern[ i ].replace( 'form:', '' ).split( '[' ).length; p++) 
					{
						var pattEnum = arrPattern[ i ].replace( 'form:', '' ).split( '[' )[ p ].replace( ']', '' );
						var oper = pattEnum.split( ':' );

						if ( oper[ 0 ] == 'RIGHT' )
						{
							InpVal = InpVal.substring( InpVal.length - parseInt( oper[ 1 ] ), InpVal.length )
						}
						else if ( oper[ 0 ] == 'LEFT' )
						{
							InpVal = InpVal.substring( 0, parseInt( oper[ 1 ] ) )
						}
						else if ( oper[ 0 ] == 'SUBSTRING' )
						{
							InpVal = InpVal.substring( parseInt( oper[ 1 ] ), parseInt( oper[ 2 ] ) )
						}
						else if ( oper[ 0 ] == 'PADDNUMERIC' )
						{
							InpVal = Util2.paddNumeric( InpVal, oper[ 1 ] );
						}
					}

					ret += InpVal;
				}

			}
			else
			{
				console.log( ' no corresponding value [' + formInpFld + ']' );
			}
		}
		else
		{
			console.log( ' no corresponding field [' + formInpFld + ']' );
		}
	}

	return ret;
};

Util2.activityListPreviewTable = function( title, arr )
{
	var ret = $( '<table />');
	var tbody = $( '<tbody />');

	if ( arr )
	{
		if ( title )
		{
			var tr = $( '<tr />');
			ret.append( tr );
			tr.append( $( '<td colspan=2 />').html( '<strong>' + title + '</strong>') );	//dataToHTMLtitle
		}
	
		for ( var i = 0; i < arr.length; i++ )
		{
			if ( arr[ i ].type && arr[ i ].type == 'LABEL' )
			{
				var tr = $( '<tr />');
				ret.append( tr );
				tr.append( $( '<td colspan=2 />').html( arr[ i ].name ) );	//dataToHTMLheader
			}
			else
			{
				if ( arr[ i ].value && arr[ i ].value.length > 0 )
				{
					var tr = $( '<tr />');
					ret.append( tr );
					tr.append( $( '<td class="c_left" />').html( arr[ i ].name ) );  //dataToHTMLleft
					tr.append( $( '<td class="c_right" />').html( arr[ i ].value ) ); //dataToHTMLright
				}
			}
		}
	
		var tr = $( '<tr />');
		tr.append( $( '<td colspan=2 />').html( '&nbsp;' ) );

		tbody.append( tr );
		ret.append( tbody );
	}

	return ret;
};



Util2.getLocalStorageSizes = function()
{  
  // provide the size in bytes of the data currently stored
  var runningTotal = 0;
  var dataSize = 0;
  var arrItms = [];

  for ( var i = 0; i <= localStorage.length -1; i++ )
  {
	  key  = localStorage.key(i);  
	  dataSize = Util.lengthInUtf8Bytes( localStorage.getItem( key ) );
	  arrItms.push( { container: 'localStorage', name: key, bytes: dataSize, kb: dataSize / 1024, mb: dataSize / 1024 / 1024 } )
	  runningTotal += dataSize;
  }
  arrItms.push( { container: 'localStorage', name: 'TOTAL SIZE', bytes: runningTotal, kb: runningTotal / 1024, mb: runningTotal / 1024 / 1024 } )
  return arrItms;
};


// pwaEpoch.epoch/epochByStr( param  ) <-- Use this instead...
Util2.epoch = function( pattern, callBack )
{
	//use examples: Util2.epoch( '1000', console.customLog ); Util2.epoch( '1000,36', console.customLog ); 
	var offSetDate; // always randomize
	var precision;
	var base;

	if ( pattern )
	{
	  precision = pattern.split( ',' )[ 0 ];

	  if ( pattern.split( ',' ).length > 1 ) base = pattern.split( ',' )[ 1 ];
	  if ( pattern.split( ',' ).length > 2 ) offSetDate = pattern.split( ',' )[ 2 ];
	}

	var prec = ( precision ) ? precision : 100;

	var newEpochVal = new pwaEpoch( prec, base, offSetDate ).issue();

	if ( callBack ) callBack( newEpochVal );
};


Util2.countClientReached = function()
{
	var clients = ClientDataManager.getClientList();

};


Util2.countClientwTphone = function()
{

};



Util2.countClientwTphoneUsed = function()
{

};
