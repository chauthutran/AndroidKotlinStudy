
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

MsgManager.notificationMessage = function( bodyMessage, messageType, actionButton, styles, Xpos, Ypos, delayHide, autoClick, addtoCloseClick )
{
    var unqID = Util.generateRandomId();
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
            $( '#notif_' + unqID ).remove();
        });

    }

    var tdClose = $( '<td style="width:24px;">' );
    var notifClose = $( '<img class="" src="images/close_white.svg" >' );
    $( notifClose ).click ( () => {
        //console.log( 'removing ' + '#notif_' + unqID  );
        if ( addtoCloseClick ) addtoCloseClick();
        $( '#notif_' + unqID ).remove();
    });

    $( 'nav.bg-color-program' ).append( notifDiv )
    trBody.append ( tdClose );
    tdClose.append ( notifClose );

    if ( delayHide || delayHide == 0 )
    {
        delayTimer = delayHide;
    }
    else
    {
        delayTimer = MsgManager._autoHideDelay;
    }

    if ( actionButton && autoClick )
    {
        var stepCount = 100;

        var dvTmr = $( '<div id="notifClickProgress_' + unqID + '" step=0 steps='+stepCount+' class="notifProgress" >&nbsp;</div>' );
        $( dvTmr ).css( 'background-color', $( actionButton ).css( 'color' ) );
        $( dvTmr ).css( 'top', ( screenWidth < 480 ? '-2px' : '2px' ) );

        /* calculate+set smooth transition for progress */
        $( dvTmr ).css( '-webkit-transition', 'width ' + (delayTimer / (stepCount) * 2) + 'ms' );
        $( dvTmr ).css( 'transition', 'width ' + (delayTimer / (stepCount) * 2) + 'ms' );

        notifDiv.append ( dvTmr );

        $( actionButton ).css( 'text-decoration', 'underline' );
        $( actionButton ).css( 'text-decoration-style', 'dotted' );

        MsgManager.clicktimer = setInterval( function() {

            var step = parseFloat( $( '#notifClickProgress_' + unqID ).attr( 'step') );
            var steps = parseFloat( $( '#notifClickProgress_' + unqID ).attr( 'steps') );

            step += 1;

            $( '#notifClickProgress_' + unqID ).css( 'width', (( step / steps ) * 100) + '%' );
            $( '#notifClickProgress_' + unqID ).attr( 'step', step );

            if ( step >= stepCount )
            {
                $( '#notif_' + unqID ).find( 'a.notifBtn' ).click();
                clearInterval( MsgManager.clicktimer );
                MsgManager.clicktimer = 0;
            }
        }, (delayTimer / stepCount) );

    }

    if ( delayTimer > 0 )
    {
        setTimeout( function() {
            if ( $( '#notif_' + unqID ).is(':visible') )
            {
              $( '#notif_' + unqID ).remove();
            }
          }, delayTimer );
    }


}

MsgManager.initialSetup();

// -- End of Message Manager Class
// -------------------------------------
