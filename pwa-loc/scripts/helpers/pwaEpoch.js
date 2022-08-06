// -------------------------------------------
// -- pwaEpoch Class/Methods
//
//      - To generate a unique number
//
//      - Take YY MM DD HH mm ss sss <-- compress as number only or num/char presenation
//          + take some big enough random range, thus, the duplicate encounter is highly unlikely..
//          - But try to make it in as short lengh as possible.
//
//      - Base 10 - just numberic number generate
//      - Base 36 - number + char
//
//      - ##{epoch(1000,36)} --> '1000' 1000th of seconds (using milliseconds (upto) value ), 36 means alpha + numeric.
//      - 
//
//      - Do not use 'me.baseExclusions' /i|l|o/; characters..
//
function pwaEpoch( decimals, base, epochOffsetDate )
{
    var me = this;

    me.incr = 0;
    me.exclusionValid = false;
    me.baseExclusions = /i|l|o/; // /1|l|i|0|o/; // /1|L|l|I|i|0|O|o/;
    me.decimals = decimals;
    me.returnBase = base;
    me.epochDate = ( epochOffsetDate != undefined) ? epochOffsetDate : '2016-07-22'; // why this date? on 23 Sep 2019 it calculated (base10) values (just) above 1000000000
    me.roundIgnore = true;
    me.failValidBase36Test = true;
    me.randomize = ( epochOffsetDate == undefined);
    me.quit = false;

    me.dayMS = 86400000;
    me.epochOffsetLow = 11574.0740726025; // 31.68808781 x 365.25 >> GREG: shift offset by 1 day to cater for random time (of up to 24hours extra > pushing rounding into next higher decimal place)
    me.epochOffsetHigh = 1157.40740726025; // 3.168808781 x 365.25
    me.epochDec1000;
    me.epochDec100;
    me.epochDec10;

    /*
        http://extraconversion.com/base-number/base-35
    */

	// -----------------------------
	// ---- Methods ----------------

    me.issue = function() 
    {
        var value = '';
        var retData = {};
        var retJson = {};

        try
        {

            while ( me.quit == false && parseInt( me.incr ) < 100 ) 
            {
                if ( me.randomize ) //always randomize
                {
                    var start = new Date( ( new Date() - ( ( me.epochOffsetLow + Math.random() ) * me.dayMS ) + me.dayMS ) ); //11367 = 365.25 x 31.12 years //).getFullYear() - 31 , 0, 1);
                    var end = new Date( ( new Date() - ( ( me.epochOffsetHigh - Math.random() ) * me.dayMS ) - me.dayMS ) ); // 1159 = 365.25 x 3.12 years; 86400000 = 1 days in 1/1000th of a second
    
                    me.epochDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
                    //console.log( 'epochDate ~ ' + Util.formatDateAndTime(me.epochDate) + ' { RND between ' + Util.formatDateAndTime(start) + ' _and_ ' + Util.formatDateAndTime(end) );
                }
    
                var baseEpochDate = parseFloat( new Date().getTime() - new Date( me.epochDate ).getTime() );
                var epochDec12b10 = ( parseFloat( baseEpochDate ) / 1 ).toString().split( '.' )[ 0 ];
                var epochDec11b10 = ( parseFloat( baseEpochDate ) / 10 ).toString().split( '.' )[ 0 ];
                var epochDec10b10 = ( parseFloat( baseEpochDate ) / 100 ).toString().split( '.' )[ 0 ];
    
                var epochDec12seed = { base: 10, seed: epochDec12b10, chars: epochDec12b10.toString().length };
                var epochDec11seed = { base: 10, seed: epochDec11b10, chars: epochDec11b10.toString().length };
                var epochDec10seed = { base: 10, seed: epochDec10b10, chars: epochDec10b10.toString().length };
    
                var epochDec12bases = [];
                var epochDec11bases = [];
                var epochDec10bases = [];
    
                for ( var i=10; i< 37; i++ ) //( var i=2; i< 37; i++ )
                {
                    var epochDec12bCalc = Util.getBaseFromBase( parseFloat( epochDec12b10 ), 10, i );
                    var epochDec12bJson = { base: i, value: epochDec12bCalc, chars: epochDec12bCalc.toString().length, seed: ( i == 10 ) };
    
                    epochDec12bases.push( epochDec12bJson );
    
                    var epochDec11bCalc = Util.getBaseFromBase( parseFloat( epochDec11b10 ), 10, i );
                    var epochDec11bJson = { base: i, value: epochDec11bCalc, chars: epochDec11bCalc.toString().length, seed: ( i == 10 ) };
    
                    epochDec11bases.push( epochDec11bJson );
    
                    var epochDec10bCalc = Util.getBaseFromBase( parseFloat( epochDec10b10 ), 10, i );
                    var epochDec10bJson = { base: i, value: epochDec10bCalc, chars: epochDec10bCalc.toString().length, seed: ( i == 10 ) };
    
                    epochDec10bases.push( epochDec10bJson );
    
                    if ( i == 36 )
                    {
                        me.failValidBase36Test = me.baseExclusions.test( epochDec12bCalc.toString() );
                        //console.log( me.baseExclusions + ' > ' + epochDec12bCalc.toString() + ' = ' + me.baseExclusions.test( epochDec12bCalc.toString() )  + ' (' + epochDec12b10 + ')' );
                    }
                }
    
                epochDec12seed.bases = epochDec12bases;
                epochDec11seed.bases = epochDec11bases;
                epochDec10seed.bases = epochDec10bases;
    
                retJson = { epochDate: me.epochDate, '12': epochDec12seed, '11': epochDec11seed, '10': epochDec10seed };
    
                me.incr += 1;
                retJson.incr = me.incr;
                retJson.valid = me.failValidBase36Test;
    
                if ( me.failValidBase36Test == false )
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
                else retData = actJson;
            }
            else retData = retJson;

            value = retData.value;
        }
        catch ( errMsg )
        {
            console.log( 'ERROR in PwaEpoch.issue, ' + errMsg );
        }

        return value;
    };


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
        return ( ! me.baseExclusions.test( val ) );
    }*/

    me.test = function()
    {

        var qrContainer = $( '#qrTemplate' );
        var myQR = new QRCode( qrContainer[ 0 ] );

        myQR.fetchCode ( location.host, function( dataURI ){

            console.log( dataURI );
            
        } );

    }
};

pwaEpoch.epochByStr = function( patternStr )
{
	//use examples: pwaEpoch.epochByStr( '1000' ); pwaEpoch.epochByStr( '1000,36' ); 

    var offSetDate; // always randomize
    var prec;
    var base;

    if ( patternStr )
    {                        
        var patternArr = patternStr.split( ',' );

        prec = patternArr[ 0 ];            
        base = patternArr[ 1 ];
        offSetDate = patternArr[ 2 ];
    }

    return pwaEpoch.epoch( prec, base, offSetDate );
};

pwaEpoch.epoch = function( prec, base, offSetDate )
{
	//use examples: pwaEpoch.epoch( 1000 ); pwaEpoch.epoch( 1000, 36 ); 
    var returnVal = '';

    try
    {
        if ( !prec ) prec = 100;

        returnVal = new pwaEpoch( prec, base, offSetDate ).issue();  
    }
    catch( errMsg )
    {
        console.log( 'ERROR in pwaEpoch.epoch, ' + errMsg );
    }

    return returnVal;
};



