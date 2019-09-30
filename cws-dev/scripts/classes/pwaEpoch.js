// -------------------------------------------
// -- pwaEpoch Class/Methods
function pwaEpoch( optionalEpoch )
{
    var me = this;

    me.incr = 0;
    me.exclusionValid = false;
    me.b35Exclusions = /1|l|i|0|o/; // /1|L|l|I|i|0|O|o/;
    me.epochDate = ( optionalEpoch != undefined) ? optionalEpoch : '2016-07-22'; // why this date? on 23 Sep 2019 it calculated (base10) values (just) above 1000000000
    me.roundIgnore = true;
    me.validBase10 = false;
    me.quit = false;

    me.epochDec1000;
    me.epochDec100;
    me.epochDec10;

    /*

        http://extraconversion.com/base-number/base-35

        Base-2 is equivalent to binary.
        Base-8 is equivalent to octal.
        Base-10 is equivalent to decimal.
        Base-16 is equivalent to hexadecimal.
    */

	// -----------------------------
	// ---- Methods ----------------

    me.issue = function( callBack ) 
    {

        while ( me.quit == false && parseInt( me.incr ) < 20 ) 
        {
            var myBaseEpoch    = parseFloat( new Date().getTime() - new Date( me.epochDate ).getTime() );
            var myEpochDec1000 = ( parseFloat( myBaseEpoch ) / 1 ).toString().split( '.' )[ 0 ];
            var myEpochDec100  = ( parseFloat( myBaseEpoch ) / 10 ).toString().split( '.' )[ 0 ];
            var myEpochDec10   = ( parseFloat( myBaseEpoch ) / 100 ).toString().split( '.' )[ 0 ];

            //var myEpochDec1000b8 = Util.getBaseFromBase( parseFloat( myEpochDec1000 ), 10, 8 );
            //var myEpochDec100b8 = Util.getBaseFromBase( parseFloat( myEpochDec100 ), 10, 8 );
            //var myEpochDec10b8 = Util.getBaseFromBase( parseFloat( myEpochDec10 ), 10, 8 );

            var myEpochDec1000b18 = Util.getBaseFromBase( parseFloat( myEpochDec1000 ), 10, 18 );
            var myEpochDec100b18 = Util.getBaseFromBase( parseFloat( myEpochDec100 ), 10, 18 );
            var myEpochDec10b18 = Util.getBaseFromBase( parseFloat( myEpochDec10 ), 10, 18 );

            var myEpochDec1000b35 = Util.getBaseFromBase( parseFloat( myEpochDec1000 ), 10, 35 );
            var myEpochDec100b35 = Util.getBaseFromBase( parseFloat( myEpochDec100 ), 10, 35 );
            var myEpochDec10b35 = Util.getBaseFromBase( parseFloat( myEpochDec10 ), 10, 35 );

            var subJcalc1000 = { precision: 1000, base10: myEpochDec1000, base18: myEpochDec1000b18, base35: myEpochDec1000b35 };
            var subJcalc100 = { precision: 100, base10: myEpochDec100, base18: myEpochDec100b18, base35: myEpochDec100b35 };
            var subJcalc10 = { precision: 10, base10: myEpochDec10, base18: myEpochDec10b18, base35: myEpochDec10b35 };

            var retJson = { epochDate: me.epochDate, '1ms': subJcalc1000, '10ms': subJcalc100, '100ms': subJcalc10 };

            /*var qrContainer = $( '#qrTemplate' );

            var myQR = new QRCode( qrContainer[ 0 ] );

            myQR.fetchCode ( myEpochDec1000b35, function( retData1ms ){

                console.log( retData1ms );
                retJson[ '1ms' ].b35QR = retData1ms;

                myQR.fetchCode ( myEpochDec100b35, function( retData10ms ){

                    console.log( retData10ms );
                    retJson[ '10ms' ].b35QR = retData10ms;

                    console.log( retJson );

                    if ( callBack )
                    {
                        callBack( retJson )
                    }
                    else
                    {
                        return retJson;
                    }

                });
            } );*/

            me.incr += 1;
            retJson.incr = me.incr;

            me.validBase10 = me.b35Exclusions.test( myEpochDec1000b35.toString() );

            retJson.valid = me.validBase10;

            if ( me.validBase10 )
            {
                me.quit = true;
            }

            console.log( retJson );

        }

        if ( callBack ) 
        {
            callBack( retJson );
        }
        else
        {
            
        }

    }

    /*me.isValid = function( val )
    {
        return ( ! me.b35Exclusions.test( val ) );
    }*/

    me.test = function()
    {

        var qrContainer = $( '#qrTemplate' );
        var myQR = new QRCode( qrContainer[ 0 ] );

        myQR.fetchCode ( 'myInputValue', function( dataURI ){

            console.log( dataURI );
            
        } );

    }
}