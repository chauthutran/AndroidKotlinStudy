// -------------------------------------------
// -- pwaEpoch Class/Methods
function pwaEpoch( optionalEpoch )
{
    var me = this;

    me.incr = 0;
    me.exclusionValid = false;
    me.exclusions = /1|L|l|I|i|0|O|o/;
    me.epochDate = ( optionalEpoch != undefined) ? optionalEpoch : '2016-07-22'; // why this date? on 23 Sep 2019 it calculated (base10) values (just) above 1000000000
    me.roundIgnore = true;

    /*

        http://extraconversion.com/base-number/base-35

        Base-2 is equivalent to binary.
        Base-8 is equivalent to octal.
        Base-10 is equivalent to decimal.
        Base-16 is equivalent to hexadecimal.
    */

	// -----------------------------
	// ---- Methods ----------------

    me.issue = function() 
    {

        //while ( me.validBase10 == false || parseInt( me.incr ) < 99 ) {
            //me.incr += 1;

            var myBaseEpoch    = parseFloat( new Date().getTime() - new Date( me.epochDate ).getTime() );
            var myEpochDec1000 = ( parseFloat( myBaseEpoch ) / 1 ).toString().split( '.' )[ 0 ];
            var myEpochDec100  = ( parseFloat( myBaseEpoch ) / 10 ).toString().split( '.' )[ 0 ];
            var myEpochDec10   = ( parseFloat( myBaseEpoch ) / 100 ).toString().split( '.' )[ 0 ];

            var myEpochDec1000b8 = Util.getBaseFromBase( parseFloat( myEpochDec1000 ), 10, 8 );
            var myEpochDec100b8 = Util.getBaseFromBase( parseFloat( myEpochDec100 ), 10, 8 );
            var myEpochDec10b8 = Util.getBaseFromBase( parseFloat( myEpochDec10 ), 10, 8 );

            var myEpochDec1000b16 = Util.getBaseFromBase( parseFloat( myEpochDec1000 ), 10, 16 );
            var myEpochDec100b16 = Util.getBaseFromBase( parseFloat( myEpochDec100 ), 10, 16 );
            var myEpochDec10b16 = Util.getBaseFromBase( parseFloat( myEpochDec10 ), 10, 16 );

            var myEpochDec1000b35 = Util.getBaseFromBase( parseFloat( myEpochDec1000 ), 10, 35 );
            var myEpochDec100b35 = Util.getBaseFromBase( parseFloat( myEpochDec100 ), 10, 35 );
            var myEpochDec10b35 = Util.getBaseFromBase( parseFloat( myEpochDec10 ), 10, 35 );

            var subJcalc1000 = { precision: 1000, base10: myEpochDec1000, base8: myEpochDec1000b8, base16: myEpochDec1000b16, base35: myEpochDec1000b35 };
            var subJcalc100 = { precision: 100, base10: myEpochDec100, base8: myEpochDec100b8, base16: myEpochDec100b16, base35: myEpochDec100b35 };
            var subJcalc10 = { precision: 10, base10: myEpochDec10, base8: myEpochDec10b8, base16: myEpochDec10b16, base35: myEpochDec10b35 };

            var retJson = { epochDate: me.epochDate, ms1000: subJcalc1000, ms100: subJcalc100, ms10: subJcalc10 };


            var qrContainer = $( '#qrTemplate' );

            var myQR = new QRCode( qrContainer[ 0 ] );

            myQR.makeCode ( myEpochDec1000b35, function(){
                console.log( $( qrContainer ).find( 'img' ).attr( 'src' ) );
            } );

            

        //    me.validBase10 = true; //me.exclusions.test( me.base35 );
        //}

        return retJson;

    }

    me.isValid = function( val )
    {
        return ( ! me.exclusions.test( val ) );
    }

}