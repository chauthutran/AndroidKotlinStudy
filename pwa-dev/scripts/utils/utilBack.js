
// -------------------------------------------
// -- Utility Back Class/Methods

function UtilBack() {}


UtilBack.oneTimeActions = {};

UtilBack.delayOnceTimeAction = function( delay, id, action ) {

	// is there already a timer? clear if if there is
	if ( UtilBack.oneTimeActions[id] ) clearTimeout( UtilBack.oneTimeActions[id] );

	// set a new timer to execute delay milliseconds from last call
	UtilBack.oneTimeActions[id] = setTimeout( action, delay );
};


UtilBack.jsonObjToThisArray = function( jsonObj, inputStructure, namedArrStructure )
{
	// planned use: blockList will 'unpack' a complex json payload back into a single array 
	recurseInputArr = function( arrItem, arrObj, itm, callBack )
	{
		if ( arrObj[ (itm + 1) ] )
		{
			recurseInputArr( arrItem[ arrObj[ itm] ], arrObj, (itm + 1), callBack )
		}
		else
		{
			if ( callBack ) callBack( arrItem, arrObj[ itm] )
		}
	}

	var arrInp = inputStructure.split( '.' );
	var itm = 0;
	var thisItem = jsonObj[ arrInp[ itm] ];
	
	console.customLog( jsonObj );
	console.customLog( arrInp[ itm] );

	if ( arrInp[ (itm + 1) ] )
	{
		recurseInputArr( thisItem, arrInp, (itm + 1), function( innerData, innerSpec ){

			console.customLog( innerData );
			console.customLog( innerSpec );

		} )
	}
	else
	{
		console.customLog( thisItem );
		console.customLog( 'stopped here' );
	}
};


UtilBack.setupDatePicker = function( ctrl, onSelectFunc, dateFormat, type )
{
	if ( !Util.checkValue( dateFormat ) )
	{
		dateFormat = _dateFormat_Picker_YYMMDD;
	}

	if ( !Util.checkDefined( onSelectFunc ) )
	{
		onSelectFunc = function() {}
		//{ $( this ).focus(); }
	}

	var maxDate = null;
	var yearRangeStr = "";
	var yearRangeStr = "";
	var currentYear = (new Date()).getFullYear();

	if ( type !== undefined && type == "birthdate" )
	{
		yearRangeStr = '1930:' + currentYear;
		maxDate = 0;
	}
	else if ( type !== undefined && type == "upToToday" )
	{
		yearRangeStr = '' + (currentYear - 15) + ':' + currentYear;
		maxDate = 0;
	}
	else
	{
		yearRangeStr = '' + (currentYear - 15) + ':' + (currentYear + 2);
	}

	// set Datepickers
	ctrl.datepicker( 
	{
		onSelect: onSelectFunc
		/*,beforeShow: function()
		{
			setTimeout( function() 
			{ 
				$( 'select.ui-datepicker-month' ).first().focus(); 

			}, 200 );
		}*/
		,dateFormat: dateFormat 
		,changeMonth: true
		,changeYear: true
		,yearRange: yearRangeStr
		,maxDate: maxDate
	});
};



UtilBack.toggleTarget = function( toggleAnchor, target, expand )
{
	// If 'expand' it is defined, display accordingly.
	// If not, toggle based on current display setting.
	if ( expand !== undefined )
	{
		if ( expand )
		{
			target.show( "fast" );					
			toggleAnchor.text( '[-]' );
		}
		else
		{
			target.hide( "fast" );
			toggleAnchor.text( '[+]' );
		}
	}
	else
	{
		if( toggleAnchor.text() == '[+]' )
		{
			target.show( "fast" );					
			toggleAnchor.text( '[-]' );
		}
		else if( toggleAnchor.text() == '[-]' )
		{
			target.hide( "fast" );
			toggleAnchor.text( '[+]' );
		}
	}
};


UtilBack.toggleTargetButton = function( toggleButtonTag, targetTag, expand, expendFunc, collapseFunc )
{

	var expendText = toggleButtonTag.attr( 'expand' );
	var collapseText = toggleButtonTag.attr( 'collapse' );

	//if ( !Util.checkValue( expendText ) ) expendText = '[+]';
	//if ( !Util.checkValue( collapseText ) ) collapseText = '[-]';

	var show = false;

	// If 'expand' it is defined, display accordingly.
	// If not, toggle based on current display setting.
	if ( expand !== undefined )
	{
		if ( expand ) show = true;
		else show = false;
	}
	else
	{
		if( toggleButtonTag.text() == expendText ) show = true;
		else if( toggleButtonTag.text() == collapseText ) show = false;
	}


	if ( show )
	{
		targetTag.show( "fast" );					
		toggleButtonTag.text( collapseText );
		if ( expendFunc !== undefined ) expendFunc();
	}
	else
	{
		targetTag.hide( "fast" );
		toggleButtonTag.text( expendText );
		if ( collapseFunc !== undefined ) collapseFunc();
	}
};


UtilBack.getValueByCallFieldFromConfig = function ( array, field, [attr, value] )
{	
	return array.filter( item => 
		{
			if ( item[attr].indexOf( field ) >= 0 )
			{ 
				return item[value]
			} 
		} 
	)[0][value];
};


UtilBack.cacheSizeCheckAndRepair = function( callBack )
{

  DataManager2.estimateStorageUse( function( storageJSON ){

	  var quotaDenom = parseFloat( storageJSON.quota ) / 1024 / 1024;
	  var suffix = 'MB';

	  if ( quotaDenom > 1000 )
	  {
		  quotaDenom = ( quotaDenom / 1000 );
		  suffix = 'GB';
	  }

	  var threshold_UsagePercent = 50, threshold_UsageMBsize = 500;

	  console.customLog( parseFloat( storageJSON.usage ) / parseFloat( storageJSON.quota ) );

	  if ( parseFloat( storageJSON.usage ) / parseFloat( storageJSON.quota ) > ( threshold_UsagePercent / 100 ) || ( 5752434934 / 1024 / 1024 ) > threshold_UsageMBsize )
	  {
		  MsgManager.notificationMessage( '1: data usage exceeds 50% of available quota: ' 
		  + Util.numberWithCommas( parseFloat( parseFloat( storageJSON.usage ) / 1024 / 1024 ).toFixed( 1 ) ) + ' ' + 'MB' + ' / ' + Util.numberWithCommas( parseFloat( quotaDenom ).toFixed( 1 ) + ' ' + suffix ), 'notificationRed', undefined,'', 'right', 'top', 10000, false, undefined,'diagnostics' );

		  DataManager2.getData_IDB( Constants.lsFlag_dataMoved_redeemListIDB, function( movedData )
		  {
			  if ( movedData === "Y" )
			  {
				  DataManager2.migrateIndexedDBtoLocalStorage( function( result, msg ){

					  if ( callBack ) callBack( result, msg );

				  } );
			  }

		  });

	  }
	  else
	  {
		  if ( callBack ) callBack( false, 'no need to run clean up' );
	  }

  } );

};


UtilBack.storageEstimateWrapper = function( callBack ) {
	if ('storage' in navigator && 'estimate' in navigator.storage) {
	  return navigator.storage.estimate();
	}
	if ('webkitTemporaryStorage' in navigator &&
		'queryUsageAndQuota' in navigator.webkitTemporaryStorage) {
	  return new Promise(function(resolve, reject) {
		navigator.webkitTemporaryStorage.queryUsageAndQuota(
		  function(usage, quota) {resolve({usage: usage, quota: quota})},
		  reject
		);
	  });
	}
	if ( callBack )
	{
		callBack( Promise.resolve({usage: NaN, quota: NaN}) )
	}
	else
	{
		return Promise.resolve({usage: NaN, quota: NaN});
	}
  };


  
  UtilBack.generateRandomEpoch = function( howMany, base, precision )
  {
	//use examples: Util.generateRandomEpoch(5,36,1000);
	var arrEpochs = [], b = ( base == undefined) ? 10 : base, prec = ( precision == undefined ) ? 100 : precision;
	for ( var i = 0; i < howMany; i++ )
	{
		Util2.epoch( prec + ',' + b, function( data ){
			arrEpochs.push( data.value );
		} )
	}

	arrEpochs.sort();

	console.customLog( arrEpochs.toString() );

	return arrEpochs;
  };






  // ==========================================
  
/* START: Added by Greg: 2018/11/26 */
function SHA256(s){
	/**
	*
	*  Secure Hash Algorithm (SHA256)
	*  http://www.webtoolkit.info/
	*
	*  Original code by Angel Marin, Paul Johnston.
	*
	**/
		var chrsz   = 8;
		var hexcase = 0;
	
		function safe_add (x, y) {
	
			var lsw = (x & 0xFFFF) + (y & 0xFFFF);
			var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	
			return (msw << 16) | (lsw & 0xFFFF);
	
		}
	
		function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
	
		function R (X, n) { return ( X >>> n ); }
	
		function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
	
		function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
	
		function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
	
		function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
	
		function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
	
		function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }
	
		function core_sha256 (m, l) {
	
			var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
			var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
			var W = new Array(64);
			var a, b, c, d, e, f, g, h, i, j;
			var T1, T2;
	
			m[l >> 5] |= 0x80 << (24 - l % 32);
			m[((l + 64 >> 9) << 4) + 15] = l;
	
			for ( var i = 0; i<m.length; i+=16 ) {
				a = HASH[0];
				b = HASH[1];
				c = HASH[2];
				d = HASH[3];
				e = HASH[4];
				f = HASH[5];
				g = HASH[6];
				h = HASH[7];
	
				for ( var j = 0; j<64; j++) {
	
					if (j < 16) W[j] = m[j + i];
	
					else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
	
					T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
					T2 = safe_add(Sigma0256(a), Maj(a, b, c));
	
					h = g;
					g = f;
					f = e;
					e = safe_add(d, T1);
					d = c;
					c = b;
					b = a;
					a = safe_add(T1, T2);
	
				}
	
				HASH[0] = safe_add(a, HASH[0]);
				HASH[1] = safe_add(b, HASH[1]);
				HASH[2] = safe_add(c, HASH[2]);
				HASH[3] = safe_add(d, HASH[3]);
				HASH[4] = safe_add(e, HASH[4]);
				HASH[5] = safe_add(f, HASH[5]);
				HASH[6] = safe_add(g, HASH[6]);
				HASH[7] = safe_add(h, HASH[7]);
	
			}
	
			return HASH;
	
		}
	
		function str2binb (str) {
	
			var bin = Array();
			var mask = (1 << chrsz) - 1;
	
			for(var i = 0; i < str.length * chrsz; i += chrsz) {
	
				bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
	
			}
	
			return bin;
	
		}
	
		function Utf8Encode(string) {
	
			string = string.replace(/\r\n/g,"\n");
	
			var utftext = "";
	
			for (var n = 0; n < string.length; n++) {
	
				var c = string.charCodeAt(n);
	
				if (c < 128) 
				{
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) 
				{
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else 
				{
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	
			}
	
			return utftext;
	
		}
	
		function binb2hex (binarray) {
	
			var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
			var str = "";
	
			for(var i = 0; i < binarray.length * 4; i++) {
				str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
				hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
			}
	
			return str;
	
		}
	
		s = Utf8Encode(s);
	
		return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
	
	}
	