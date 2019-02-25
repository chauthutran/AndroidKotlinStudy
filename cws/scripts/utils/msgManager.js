
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

MsgManager.notificationMessage = function( bodyMessage, messageType, actionButton, styles, Xpos, Ypos, delayHide )
{
    var unqID = Util.generateRandomId();
    var notifDiv = $( '<div id="notif_' + unqID + '" class="'+messageType+' rounded" >' );
    var delayTimer;

    if ( Xpos )
    {
        notifDiv.css( Xpos, '4%' );
    }

    if ( Ypos )
    {
        notifDiv.css( Ypos, '4%' );
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

    var Tbl = $( '<table>' );
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
            $( '#notif_' + unqID ).remove();
        });

    }

    var tdClose = $( '<td>' );
    var notifClose = $( '<img class="" src="images/close_white.svg" >' );
    $( notifClose ).click ( () => {
        console.log( 'removing ' + '#notif_' + unqID  );
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
