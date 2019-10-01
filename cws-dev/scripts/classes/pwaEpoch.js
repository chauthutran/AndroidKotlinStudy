// -------------------------------------------
// -- pwaEpoch Class/Methods
function pwaEpoch( decimals, base, epochOffset )
{
    var me = this;

    me.incr = 0;
    me.exclusionValid = false;
    me.b35Exclusions = /1|l|i|0|o/; // /1|L|l|I|i|0|O|o/;
    me.decimals = decimals;
    me.returnBase = base;
    me.epochDate = ( epochOffset != undefined) ? epochOffset : '2016-07-22'; // why this date? on 23 Sep 2019 it calculated (base10) values (just) above 1000000000
    me.roundIgnore = true;
    me.validBase10 = false;
    me.quit = false;
    me.randomize = ( epochOffset == undefined);

    me.dayMS = 86400000;
    me.epochDec1000;
    me.epochDec100;
    me.epochDec10;

    /*
        http://extraconversion.com/base-number/base-35
    */

	// -----------------------------
	// ---- Methods ----------------

    me.issue = function( callBack ) 
    {
        var retData;
        if ( me.randomize )
        {
            var start = new Date( ( new Date() - ( ( 11367 + Math.random() ) * me.dayMS  ) ) ); //11367 = 365.25 x 31.12 years //).getFullYear() - 31 , 0, 1);
            var end = new Date( ( new Date() - ( ( 1159 - Math.random() ) * me.dayMS ) ) ); // 1159 = 365.25 x 3.12 years; 86400000 = 1 days in 1/1000th of a second

            me.epochDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            //console.log( 'epochDate ~ ' + Util.formatDateAndTime(me.epochDate) + ' { RND between ' + Util.formatDateAndTime(start) + ' _and_ ' + Util.formatDateAndTime(end) );
        }
        else
        {
            //console.log( 'epochDate ~ ' + me.epochDate  );
        }

        while ( me.quit == false && parseInt( me.incr ) < 20 ) 
        {
            var baseEpochDate    = parseFloat( new Date().getTime() - new Date( me.epochDate ).getTime() );

            var epochDec12b10 = ( parseFloat( baseEpochDate ) / 1 ).toString().split( '.' )[ 0 ];
            var epochDec11b10  = ( parseFloat( baseEpochDate ) / 10 ).toString().split( '.' )[ 0 ];
            var epochDec10b10   = ( parseFloat( baseEpochDate ) / 100 ).toString().split( '.' )[ 0 ];

            var epochDec12prime = { base: 10, seed: epochDec12b10, chars: epochDec12b10.toString().length };
            var epochDec11prime = { base: 10, seed: epochDec11b10, chars: epochDec11b10.toString().length };
            var epochDec10prime = { base: 10, seed: epochDec10b10, chars: epochDec10b10.toString().length };

            var epochDec12bases = [];
            var epochDec11bases = [];
            var epochDec10bases = [];

            for ( var i=2; i< 37; i++ )
            {
                var epochDec12bCalc = Util.getBaseFromBase( parseFloat( epochDec12b10 ), 10, i );
                var epochDec12bJson = { base: i, value: epochDec12bCalc, chars: epochDec12bCalc.toString().length, prime: ( i == 10 ) };

                epochDec12bases.push( epochDec12bJson );

                var epochDec11bCalc = Util.getBaseFromBase( parseFloat( epochDec11b10 ), 10, i );
                var epochDec11bJson = { base: i, value: epochDec11bCalc, chars: epochDec11bCalc.toString().length, prime: ( i == 10 ) };

                epochDec11bases.push( epochDec11bJson );

                var epochDec10bCalc = Util.getBaseFromBase( parseFloat( epochDec10b10 ), 10, i );
                var epochDec10bJson = { base: i, value: epochDec10bCalc, chars: epochDec10bCalc.toString().length, prime: ( i == 10 ) };

                epochDec10bases.push( epochDec10bJson );

            }

            epochDec12prime.bases = epochDec12bases;
            epochDec11prime.bases = epochDec11bases;
            epochDec10prime.bases = epochDec10bases;

            var retJson = { epochDate: me.epochDate, '12': epochDec12prime, '11': epochDec11prime, '10': epochDec10prime };

            /*var qrContainer = $( '#qrTemplate' );

            var myQR = new QRCode( qrContainer[ 0 ] );

            myQR.fetchCode ( epochDec12b10_b35, function( retData1ms ){

                console.log( retData1ms );
                retJson[ '1ms' ].b35QR = retData1ms;

                myQR.fetchCode ( epochDec11b10_b35, function( retData10ms ){

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

            me.validBase10 = me.b35Exclusions.test( epochDec11b10.toString() );

            retJson.valid = me.validBase10;

            if ( me.validBase10 )
            {
                me.quit = true;
            }

        }

        if ( me.decimals )
        {
            var retDec = ( me.decimals == 1000 ) ? 12 : ( ( me.decimals == 100 ) ? 11 : 10 );
            var actJson = retJson[ retDec.toString() ];

            if ( me.returnBase )
            {
                for ( var i=0; i< actJson.bases.length; i++ )
                {
                    if ( actJson.bases[ i ].base == me.returnBase )
                    {
                        retData = actJson.bases[ i ];
                        break;
                    }
                }
            }
            else
            {
                retData = actJson;
            }
        }
        else
        {
            retData = retJson;
        }

        if ( callBack ) 
        {
            callBack( retData );
        }
        else
        {
            console.log( retData );
        }

    }

    me.issueQRfromValue = function( inputVal, callBack)
    {
        var qrContainer = $( '#qrTemplate' );
        var myQR = new QRCode( qrContainer[ 0 ] );

        myQR.fetchCode ( inputVal, function( retData1ms ){

            console.log( retData1ms );
            if ( callBack ) callBack( retData1ms );

        } );
    }

    /*me.isValid = function( val )
    {
        return ( ! me.b35Exclusions.test( val ) );
    }*/

    me.test = function()
    {

        var qrContainer = $( '#qrTemplate' );
        var myQR = new QRCode( qrContainer[ 0 ] );

        myQR.fetchCode ( location.host, function( dataURI ){

            console.log( dataURI );
            
        } );

    }
}