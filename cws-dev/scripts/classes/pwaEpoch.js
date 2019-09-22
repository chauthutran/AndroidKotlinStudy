// -------------------------------------------
// -- BlockMsg Class/Methods
function pwaEpoch( anything )
{
    var me = this;

    me.incr = 0;
    me.exclusionValid = false;
    me.exclusions = /1|L|l|I|i|0|O|o/;
    //me.precision = 100;
    me.epochDate = '2016-01-01';
    me.roundIgnore = true;
    me.prefix = 'NP';

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

            var myEpochDec1000b2 = Util.getBaseFromBase( parseFloat( myEpochDec1000 ), 10, 2 );
            var myEpochDec100b2 = Util.getBaseFromBase( parseFloat( myEpochDec100 ), 10, 2 );
            var myEpochDec10b2 = Util.getBaseFromBase( parseFloat( myEpochDec10 ), 10, 2 );

            var myEpochDec1000b16 = Util.getBaseFromBase( parseFloat( myEpochDec1000 ), 10, 16 );
            var myEpochDec100b16 = Util.getBaseFromBase( parseFloat( myEpochDec100 ), 10, 16 );
            var myEpochDec10b16 = Util.getBaseFromBase( parseFloat( myEpochDec10 ), 10, 16 );

            var myEpochDec1000b35 = Util.getBaseFromBase( parseFloat( myEpochDec1000 ), 10, 35 );
            var myEpochDec100b35 = Util.getBaseFromBase( parseFloat( myEpochDec100 ), 10, 35 );
            var myEpochDec10b35 = Util.getBaseFromBase( parseFloat( myEpochDec10 ), 10, 35 );

            var subJcalc1000 = { len: myEpochDec1000.toString().length, val: myEpochDec1000, base2: myEpochDec1000b2, base16: myEpochDec1000b16, base35: myEpochDec1000b35 };
            var subJcalc100 = { len: myEpochDec1000.toString().length, val: myEpochDec100, base2: myEpochDec100b2, base16: myEpochDec100b16, base35: myEpochDec100b35 };
            var subJcalc10 = { len: myEpochDec1000.toString().length, val: myEpochDec10, base2: myEpochDec10b2, base16: myEpochDec10b16, base35: myEpochDec10b35 };

            var retJson = { myEpochDec1000: subJcalc1000, myEpochDec100: subJcalc100, myEpochDec10: subJcalc10 };
    


        //    me.validBase10 = true; //me.exclusions.test( me.base35 );
        //}

        return retJson;

    }

    me.isValid = function( val )
    {
        return ( ! me.exclusions.test( val ) );
    }

}