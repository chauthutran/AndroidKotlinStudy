
// -------------------------------------
// -- Static Classes - Message Manager Class

function MsgManager() {}

// --- Messaging ---
MsgManager.divMsgAreaTag;
MsgManager.spanMsgAreaCloseTag;
MsgManager.btnMsgAreaCloseTag;
MsgManager.spanMsgAreaTextTag;
MsgManager.divProgressAreaTag;
MsgManager.progressBar;
MsgManager.countDownNumerator = 0;
MsgManager.countDownDenominator = 0;
MsgManager.progressBarUpdateTimer = 25;
MsgManager.progressCheckCount = 0;
MsgManager._autoHide = true;
MsgManager._autoHideDelay = 5000; //changed to 5 sec by James (2018/12/17)
MsgManager.timer = 0;
MsgManager.clicktimer = 0;
MsgManager.reservedIDs = []; //COMING SOON: collection of predefined COMMON identifiable notification messages (if match exists in this array, do not create)
MsgManager.reservedMsgBlocks = [];

MsgManager.debugMode = false;

MsgManager.initialSetup = function()
{
    MsgManager.divMsgAreaTag = $( '#divMsgArea' );
    MsgManager.spanMsgAreaCloseTag = $( '#spanMsgAreaClose' );
    MsgManager.btnMsgAreaCloseTag = $( '#btnMsgAreaClose' );
    MsgManager.spanMsgAreaTextTag = $( '#spanMsgAreaText' );
    MsgManager.divProgressAreaTag = $( '#divMsgProgress' );

    MsgManager.btnMsgAreaCloseTag.click( function()
    {
        MsgManager.msgAreaClear( 'fast' );
        MsgManager.divProgressAreaTag.empty();
    });
}


MsgManager.msgAreaShow = function( msg, timeoutTime, countDown, ProgressTimerRefresh )
{
    if ( 1==1)
    {
        MsgManager.notificationMessage ( msg, 'notificationDark', undefined, '', 'right', 'top' );
    }
    else    if ( msg )
    {
        if ( !MsgManager._autoHide )
        {
            var dcdConf = JSON.parse( localStorage.getItem( JSON.parse( localStorage.getItem('session') ).user ) );

            if ( dcdConf && dcdConf.dcdConfig && dcdConf.dcdConfig.settings && dcdConf.dcdConfig.settings.message )
            {
                MsgManager._autoHide = dcdConf.dcdConfig.settings.message.autoHide;
                MsgManager._autoHideDelay = dcdConf.dcdConfig.settings.message.autoHideTime;
            }
        }

        MsgManager.spanMsgAreaTextTag.text( msg );
        FormUtil.addTag_TermAttr = function( tags, jsonItem )
        {
            if ( jsonItem.term ) tags.attr( 'term', jsonItem.term );
        };
        

        if ( ! $( '#divMsgArea' ).is( ':visible' ) )
        {
            MsgManager.divMsgAreaTag.show( 'fast' );
        }

        if ( MsgManager.timer > 0 ) clearTimeout ( MsgManager.timer );

        if ( timeoutTime )
        {
            MsgManager.timer = setTimeout( function() {                
                MsgManager.msgAreaClear( 'slow' );
            }, timeoutTime );
        }
        else
        {
            if ( countDown )
            {
                MsgManager.countDownDenominator = countDown;

                if ( ProgressTimerRefresh )
                {
                    MsgManager.progressBarUpdateTimer = ProgressTimerRefresh;
                }
                else
                {
                    MsgManager.progressBarUpdateTimer = 25;
                }

                MsgManager.divProgressAreaTag.append( $('<div style="background-Color:#50555a;width:0;height:10px;"/>') );
                MsgManager.divProgressAreaTag.show();

                MsgManager.progressCheckCount = 0

            }
            else
            {
                if ( MsgManager._autoHide )
                {
                    MsgManager.timer = setTimeout( function() {                
                        MsgManager.msgAreaClear( );
                    }, MsgManager._autoHideDelay );
                }
            }
        }

    }
}

MsgManager.msgAreaClear = function( speed )
{
    if ( speed ) MsgManager.divMsgAreaTag.hide( speed );
    else MsgManager.divMsgAreaTag.hide();
    if ( MsgManager.countDownNumerator ) 
    {
        MsgManager.divProgressAreaTag.empty();
        MsgManager.divProgressAreaTag.hide();
    }
}

MsgManager.notificationMessage = function( bodyMessage, messageType, actionButton, styles, Xpos, Ypos, delayHide, autoClick, addtoCloseClick, ReserveMsgID )
{
    var unqID = Util.generateRandomId();

    if ( ReserveMsgID != undefined )
    {
        if ( MsgManager.reservedIDs.length > 0 ) 
        {
            if ( MsgManager.reservedIDs.indexOf( ReserveMsgID ) >= 0 )  return false;
            else 
            {
                MsgManager.reservedIDs.push ( ReserveMsgID.toString() );
                MsgManager.reservedMsgBlocks.push( { "msgid": ReserveMsgID.toString(), "blockid": unqID } );
            }
        }
        else
        {
            MsgManager.reservedIDs.push ( ReserveMsgID.toString() );
            MsgManager.reservedMsgBlocks.push( { "msgid": ReserveMsgID.toString(), "blockid": unqID } );
        }
    }

    var delayTimer;
    var screenWidth = document.body.clientWidth;
    var screenHeight = document.body.clientHeight;
    var offsetPosition = ( screenWidth < 480 ? '0' : '4%' );
    var optStyle = ( screenWidth < 480 ? 'style="width:100%;height:50px;padding: 6px 0 6px 0;"' : 'style="max-width:93%;"' ); //93% = 97% - 4% (offsetPosition)
    var notifDiv = $( '<div id="notif_' + unqID + '" ' + optStyle + ' class="'+messageType+( screenWidth < 480 ? '' : ' rounded' )+'" >' );

    if ( Xpos )
    {
        notifDiv.css( Xpos, offsetPosition );
    }

    if ( Ypos )
    {
        notifDiv.css( Ypos, offsetPosition );
    }

    if ( styles )
    {
        var arrStyles = styles.split(';')
        for (var i = 0; i < arrStyles.length; i++)
        {
            if ( arrStyles[ i ] )
            {
                var thisStyle = (arrStyles[ i ]).split( ':' );
                notifDiv.css( thisStyle[0], thisStyle[1] );
            }
        }
    }

    var Tbl = $( '<table style="width:100%;padding:6px;">' );
    var tBody = $( '<tbody>' );
    var trBody = $( '<tr>' );
    var tdMessage = $( '<td>' );

    notifDiv.append ( Tbl );
    Tbl.append ( tBody );
    tBody.append ( trBody );
    trBody.append ( tdMessage );
    tdMessage.html( '<span>&nbsp;</span>' + bodyMessage + '<span>&nbsp;</span>' );

    if ( actionButton )
    {
        var tdAction = $( '<td>' );
        trBody.append ( tdAction );
        tdAction.append ( '<span>&nbsp;</span>' );
        tdAction.append ( actionButton );
        tdAction.append ( '<span>&nbsp;</span>' );

        $( tdAction ).click ( () => {

            if ( autoClick && MsgManager.clicktimer )
            {
                clearInterval( MsgManager.clicktimer );
                MsgManager.clicktimer = 0;
            }

            if ( ReserveMsgID != undefined ) MsgManager.clearReservedMessage( ReserveMsgID );

            $( '#notif_' + unqID ).remove();

        });

    }

    var tdClose = $( '<td style="width:24px;">' );
    var notifClose = $( '<img class="round" src="images/close_white.svg" >' );

    $( notifClose ).click ( () => {

        if ( addtoCloseClick != undefined ) addtoCloseClick();

        if ( ReserveMsgID != undefined ) MsgManager.clearReservedMessage( ReserveMsgID );

        $( '#notif_' + unqID ).remove();

    });

    $( 'nav.bg-color-program' ).append( notifDiv )
    trBody.append ( tdClose );
    tdClose.append ( notifClose );

    if ( delayHide != undefined || delayHide == 0 ) delayTimer = delayHide;
    else delayTimer = MsgManager._autoHideDelay;

    if ( actionButton && autoClick )
    {
        var stepCount = 100;
        var notifProgressOpacInitial = 0.5;
        var thresholdFlash = 0.85;
        var dvTmr = $( '<div id="notifClickProgress_' + unqID + '" step=0 steps='+stepCount+' class="notifProgress" >&nbsp;</div>' );

        $( dvTmr ).css( 'background-color', $( actionButton ).css( 'color' ) );
        $( dvTmr ).css( 'top', ( screenWidth < 480 ? '-2px' : '2px' ) );
        $( dvTmr ).css( 'opacity', notifProgressOpacInitial );
        $( dvTmr ).attr( 'hot', 0 );

        /* calculate+set smooth transition for progress expansion */
        $( dvTmr ).css( '-webkit-transition', 'width ' + (delayTimer / (stepCount) * 2) + 'ms' );
        $( dvTmr ).css( 'transition', 'width ' + (delayTimer / (stepCount) * 2) + 'ms' );

        notifDiv.append ( dvTmr );

        $( actionButton ).css( 'text-decoration', 'underline' );
        $( actionButton ).css( 'text-decoration-style', 'dotted' );

        MsgManager.clicktimer = setInterval( function() {

            if ( step > stepCount )
            {
                //do nothing, do not increment width, do not change this line of code
            }
            else
            {
                var step = parseFloat( $( '#notifClickProgress_' + unqID ).attr( 'step') );
                var steps = parseFloat( $( '#notifClickProgress_' + unqID ).attr( 'steps') );

                step += 1;

                $( '#notifClickProgress_' + unqID ).css( 'width', ( ( step / steps ).toFixed(2) * 100) + '%' );
                $( '#notifClickProgress_' + unqID ).attr( 'step', step );

                if ( ( step / steps ).toFixed(2) > notifProgressOpacInitial )
                {
                    if ( ( step / steps ).toFixed(2) > thresholdFlash )
                    {
                        if ( $( '#notifClickProgress_' + unqID ).attr( 'hot' ) > 0 )
                        {
                            $( '#notifClickProgress_' + unqID ).attr( 'hot', 0)
                            $( '#notifClickProgress_' + unqID ).css( 'opacity', notifProgressOpacInitial );
                        }
                        else
                        {
                            $( '#notifClickProgress_' + unqID ).attr( 'hot', 1)
                            $( '#notifClickProgress_' + unqID ).css( 'opacity', ( step / steps ).toFixed(2) );
                        }
                    }
                    else
                    {
                        $( '#notifClickProgress_' + unqID ).css( 'opacity', ( step / steps ).toFixed(2) );
                    }
                }

                if ( step >= stepCount )
                {
                    $( '#notif_' + unqID ).find( 'a.notifBtn' ).click();
                    clearInterval( MsgManager.clicktimer );
                    MsgManager.clicktimer = 0;
                }

            }

        }, (delayTimer / stepCount) );

    }

    if ( delayTimer > 0 )
    {
        setTimeout( function() {

            if ( $( '#notif_' + unqID ).is(':visible') )
            {
              $( '#notif_' + unqID ).fadeOut( 750 );

                setTimeout( function() {
                    
                    if ( ReserveMsgID != undefined ) MsgManager.clearReservedMessage( ReserveMsgID );
                    else $( '#notif_' + unqID ).remove();
                }, 1000 );
            }

          }, delayTimer );
    }

    if ( MsgManager.debugMode ) console.log( 'created messageNotification' );

    if ( FormUtil.PWAlaunchFrom() == "homeScreen" ) 
    {
        playSound("ping");
    }

}

MsgManager.clearReservedMessage = function( reservedID )
{
    if ( reservedID != undefined )
    {
        if ( MsgManager.reservedIDs.length > 0 ) 
        {
            for (var i = 0; i < MsgManager.reservedIDs.length; i++)
            {
                if ( MsgManager.reservedIDs[i] === reservedID )
                {
                    $( '#notif_' + MsgManager.reservedMsgBlocks[ i ].blockid ).remove();
                    MsgManager.reservedMsgBlocks.splice( MsgManager.reservedIDs.indexOf( reservedID ), 1 );
                    MsgManager.reservedIDs.splice( MsgManager.reservedIDs.indexOf( reservedID ), 1 );
                    return true;
                }
            }
        }
    }

}

MsgManager.initialSetup();

// -- End of Message Manager Class
// -------------------------------------
