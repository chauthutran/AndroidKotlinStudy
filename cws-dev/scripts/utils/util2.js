
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

	if ( pattern.indexOf( ',' ) )
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
				returnPart = Util.generateRandomAnything( ( arrPattern[ i ] ).toString().length, "ABCDEFGHIJKLMNOPQRSTUVWXYZ" );
			}
			else if ( ( arrPattern[ i ] ).indexOf( 'SEQ[' ) >= 0 )
			{
				returnPart = Util2.newLocalSequence( arrPattern[ i ], commitSEQIncr );
			}
			else if ( ( arrPattern[ i ] ).indexOf( '.' ) > 0 )
			{
				returnPart = Util.getLocalStorageObjectValue( arrPattern[ i ] );
			}
			else if ( ( arrPattern[ i ] ).indexOf( 'form:' ) >= 0 )
			{
				returnPart = Util2.getFormInputValuePattern( tagTarget, arrPattern[ i ] );
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
				returnPart = Util.paddNumeric( ( Util.generateRandomNumberRange( 0, Math.pow(10, ( arrPattern[ i ] ).toString().length ) -1 ) ).toFixed(0), (arrPattern[ i ]).toString().length );
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


// ---------------------------------
// --- Form Related, BlockForm related..

// Util2.createCheckbox = function( { message='', name='', uid='', updates='', value='' } )
// {
// 	var divContainerTag = $( '<div class="inputCheckbox" ></div>' );
// 	var checkboxReal = $( '<input name="' + name + '" uid="' + uid + '" ' + ( updates ? ' updates="' + updates + '" ' : '' ) + '" value="' + value + '" class="inputHidden CHECKBOX" type="checkbox" style="display:none" />' );
// 	var checkboxShow = $( '<div class="checkboxShow" ></div>' );
// 	var text = $( '<span class="checkboxText">' + message + '</span>' )
// 	var check = $( '<span class="checkboxCheck" ></span>' )

// 	divContainerTag.click( function(){

// 		if ( checkboxReal.prop( 'checked' ) )
// 		{
// 			check.css( { borderColor: 'rgba(0,0,0,0)', transform: '' } );
// 			checkboxShow.css( 'background', 'transparent' );
// 			checkboxReal.prop( 'checked', false );
// 		} 
// 		else 
// 		{
// 			check.css( { transform: 'rotate(45deg) translateX(20%) translateY(-25%)',borderColor: 'white' } );
// 			checkboxShow.css( 'background', 'gray' );
// 			checkboxReal.prop( 'checked', true );
// 		}

// 		if ( updates ) Util2.updateMultiCheckboxPayloadValue( updates )

// 	} );

// 	if ( ( value.toString().toLowerCase() == "true" ) || ( value.toString().toLowerCase() == "checked" ) )
// 	{
// 		check.css( { transform: 'rotate(45deg) translateX(20%) translateY(-25%)',borderColor: 'white' } );
// 		checkboxShow.css( 'background', 'gray' );
// 		checkboxReal.prop( 'checked', true );
// 	} 
// 	else 
// 	{
// 		check.css( { borderColor: 'rgba(0,0,0,0)', transform: '' } );
// 		checkboxShow.css( 'background', 'transparent' );
// 		checkboxReal.prop( 'checked', false );
// 	}

// 	checkboxShow.append( check );
// 	divContainerTag.append( checkboxReal,checkboxShow, text );

// 	return { component: divContainerTag, input:checkboxReal };
// };


// Util2.populateDropdown_MultiCheckbox = function ( formItemJson, selectObj, json_Data )
// {
// 	selectObj.empty();

// 	var inputOpts = [];

// 	json_Data.forEach( obj=> {

// 		var { component } = Util2.createCheckbox( {
// 				message:	obj.defaultName,
// 				name:		'checkbox_' + formItemJson.id + '_' + obj.value,
// 				updates:	formItemJson.id,
// 				value: 		obj.value } ),
// 				li = $( '<li></li>' )
// 				li.append( component )
// 				selectObj.append( li );

// 		inputOpts.push( 'checkbox_' + formItemJson.id + '_' + obj.value );

// 	} );
// };


// Util2.updateRadioPayloadValue = function( targetInputTagName )
// {
// 	var vals = '';
// 	var InpTarg = $( "[name='" + targetInputTagName + "']" );

// 	if ( InpTarg )
// 	{
// 		for ( var i = 0; i < InpTarg.length; i++ )
// 		{
// 			var obj = InpTarg[ i ];
// 			if ( obj.checked )
// 			{
// 				$( '[name="' + targetInputTagName + '"]' ).val( obj.value );
// 				// console.log( updates + ' = ' + obj.value, $( '[name="' + updates + '"]' ).val() );

// 				FormUtil.dispatchOnChangeEvent( $( '[name="' + targetInputTagName + '"]' ) );
				
// 			}
// 		}
// 	}
// };


// Util2.updateOtherRadioOptions = function( updates, excludeName )
// {
// 	var vals = '';
// 	var InpTarg = $( "[updates='" + updates + "']" );

// 	if ( InpTarg )
// 	{
// 		for ( var i = 0; i < InpTarg.length; i++ )
// 		{
// 			var obj = InpTarg[ i ];
// 			if ( obj.name != excludeName ) obj.checked = false;
// 		}
// 	}
// };



// Util2.updateMultiCheckboxPayloadValue = function( updates )
// {
// 	var vals = '';
// 	var InpTarg = $( "[updates='" + updates + "']" );

// 	if ( InpTarg )
// 	{
// 		for ( var i = 0; i < InpTarg.length; i++ )
// 		{
// 			var obj = InpTarg[ i ];
// 			if ( obj.checked ) vals += ( vals.length ? ',' : '' ) + obj.value;
// 		}
// 	}

// 	$( '[name="' + updates + '"]' ).val( vals );

// 	FormUtil.dispatchOnChangeEvent( $( '[name="' + updates + '"]' ) );
// };


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
		if (!isNaN(parseInt(ul.dataset.index))) {
			sendChoose();
		}
		modal.parentElement.style.setProperty('display', 'none');

	});

	$(cancel).click( function(e)
	{
		e.preventDefault();
		modal.parentElement.style.setProperty('display', 'none');
	});

	inputShow.addEventListener('focus', e => {
		e.preventDefault();
		inputShow.blur();
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


// Util2.populateRadios = function ( formItemJson, selectObj, json_Data )
// {
// 	selectObj.empty();

// 	json_Data.forEach( obj => {

// 		var content = $( '<div class="radioContent" ></div>' );
// 		var input = $( '<input type="radio" updates="' + formItemJson.id + '" name="radioOpt_' + obj.value + '" value="' + obj.value + '" style="display:none" >' );
// 		var picker = $( '<span class="radioPicker"></span>' );
// 		var pickerOn = $( '<i class="radioPickerOn"></i>' )
// 		var text = $( '<span class="radioText">' + obj.defaultName + '</span>' );

// 		picker.append( pickerOn );
// 		content.append( input, picker, text);

// 		content.click( function(e) {

// 			e.stopPropagation();

// 			if (! input.prop('checked') ){

// 				content[0].parentElement.querySelectorAll('i').forEach(i=>{
// 					$(i).css( 'background', 'transparent' )
// 				});

// 				pickerOn.css( 'background', 'gray' );
// 				input.prop( 'checked', true );

// 				Util2.updateOtherRadioOptions( formItemJson.id, input.prop( 'name' ) );

// 			}

// 			Util2.updateRadioPayloadValue( formItemJson.id );

// 		});

// 		selectObj.append( content );

// 	} );
// };


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


Util2.newLocalSequence = function( pattern, commitSEQIncr )
{
	//var jsonUserData = DataManager.getData( SessionManager.sessionData.login_UserName );
	DataManager.getData( SessionManager.sessionData.login_UserName, function( jsonUserData ){

		var jsonStorageData = jsonUserData[ 'mySession' ] [ 'seqIncr' ];
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
					jsonUserData[ 'mySession' ] [ 'seqIncr' ] = jsonStorageData;
	
					if ( commitSEQIncr != undefined && commitSEQIncr == true )
					{
						DataManager.saveData( SessionManager.sessionData.login_UserName, jsonUserData );
					}
	
					return Util.paddNumeric( ret, arrParm[1] );
	
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
	} );
};


Util2.getAgeValueFromPattern = function( tagTarget, pattern )
{
	var formTarg = tagTarget.closest( 'div.formDivSec' );
	var ret = '';

	if ( pattern.indexOf( 'form:' ) >= 0 )
	{
		var targFld = pattern.split( 'form:' )[ 1 ];
		var targTag = formTarg.find( "#" + targFld ); //( "[name='" + targFld + "']" );

		if ( targTag )
		{
			var InpVal = targTag.val();

			if ( InpVal && InpVal.length )
			{
				var today = new Date();
				var birthDate = new Date( InpVal );
				var age = today.getFullYear() - birthDate.getFullYear();
				var m = today.getMonth() - birthDate.getMonth();

				if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
					age = age - 1;
				}
			
				return age;
			}
			else
			{
				return '';
			}

		}
		else
		{
			return '';
		}

	}
};


Util2.getFormInputValuePattern = function( tagTarget, formInputPattern )
{
	var formTarg = tagTarget.closest( 'div.formDivSec' );
	var arrPattern;
	var ret = '';

	arrPattern = formInputPattern.split( '+' );

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
							InpVal = Util.paddNumeric( InpVal, oper[ 1 ] );
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

Util2.arrayPreviewRecord = function( title, arr )
{
	var ret = $( '<table />');

	if ( arr )
	{
		if ( title )
		{
			var titleTag = $("<h4/>");
			titleTag.html( title );
			titleTag.append( titleTag );

			var td = $('<td colspan=2 />' );
			td.append( titleTag );

			var tr = $('<tr />');
			tr.append( td );

			ret.append( tr );
		}
	
		for ( var i = 0; i < arr.length; i++ )
		{
			var tr = $('<tr />');
			ret.append( tr );
			if ( arr[ i ].type && arr[ i ].type == 'SECTION' ) // Display GROUP names
			{
				var td = $('<td colspan=2 />');
				var groupLabel = $("<h5/>").html( arr[ i ].name );
				td.append( groupLabel );
				tr.append( td );
			}
			else
			{
				tr.append( $( '<td />').html( arr[ i ].name ) );
				tr.append( $( '<td />').html( arr[ i ].value ) );
			}
		}
	
		ret.append(  $( '<tr />') ); // Add an empty row in the end of table
		tr.append( $( '<td colspan=2 />').html( '&nbsp;' ) );

	}

	return ret;

}

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



Util2.epoch = function( pattern, callBack )
{
	//use examples: Util2.epoch( '1000', console.log ); Util2.epoch( '1000,36', console.log ); 
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

	new pwaEpoch( prec, base, offSetDate ).issue( function( newEpoch ){

		if ( callBack ) callBack( newEpoch.value );
	});
};

