
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
MsgManager._autoHideDelay = Util.MS_SEC * 10; // 10 sec - default setting.
MsgManager.timer = 0;
MsgManager.clicktimer = 0;
MsgManager.reservedIDs = []; //collection of predefined COMMON identifiable notification messages (if match exists in this array, do not create)
MsgManager.reservedMsgBlocks = [];

MsgManager.debugMode = false;

// --------------------------

MsgManager.CLNAME_NotifMsg = 'notifMsg';
MsgManager.CLNAME_NotifRed = 'notifRed';
MsgManager.CLNAME_NotifDark = 'notifDark';
MsgManager.CLNAME_PersistSwitch = 'persistSwitch';

// ============================

MsgManager.initialSetup = function()
{
    MsgManager.divMsgAreaTag = $( '#divMsgArea' );
    MsgManager.spanMsgAreaCloseTag = $( '#spanMsgAreaClose' );
    MsgManager.btnMsgAreaCloseTag = $( '#btnMsgAreaClose' );
    MsgManager.spanMsgAreaTextTag = $( '#spanMsgAreaText' );
    MsgManager.divProgressAreaTag = $( '#divMsgProgress' );

    MsgManager.btnMsgAreaCloseTag.click( function()
    {
        MsgManager.msgAreaClear_Alt( 'fast' );
        MsgManager.divProgressAreaTag.empty();
    });

    var dcdConfig = ConfigManager.getConfigJson();
    if ( dcdConfig.settings && dcdConfig.settings.message )
    {
        MsgManager._autoHide = dcdConfig.settings.message.autoHide;
        MsgManager._autoHideDelay = dcdConfig.settings.message.autoHideTime;
    }    
};


MsgManager.msgAreaShow = function( msg, type, optClasses )
{
    var msgTag;

    try
    {
        var colorClass = ( type === 'ERROR' ) ? 'notifRed' : 'notifDark';
        msgTag = MsgManager.notificationMessage( msg, colorClass, undefined, '', 'right', 'top' );
        if ( optClasses ) msgTag.addClass( optClasses ); // Use 'persistSwitch' - for persisting between block button click/area close.    
    }
    catch ( errMsg )
    {
        console.customLog( 'ERROR in MsgManager.msgAreaShow, errMsg: ' + errMsg );
    }

    return msgTag;
};


MsgManager.msgAreaShowErr = function( msg, optClasses )
{
    return MsgManager.msgAreaShow( msg, 'ERROR', optClasses );
};


MsgManager.msgAreaClearAll = function()
{
    $( '.notifMsg' ).not( '.' + MsgManager.CLNAME_PersistSwitch ).remove();
};

MsgManager.msgAreaClear_Alt = function( speed )
{
    if ( speed ) MsgManager.divMsgAreaTag.hide( speed );
    else MsgManager.divMsgAreaTag.hide();

    if ( MsgManager.countDownNumerator ) 
    {
        MsgManager.divProgressAreaTag.empty();
        MsgManager.divProgressAreaTag.hide();
    }
}

MsgManager.notificationMessage = function( bodyMessage, cssClasses, actionButton, styles, Xpos, Ypos, delayHide, autoClick, addtoCloseClick, ReserveMsgID, disableClose, disableAutoWidth )
{
    var unqID = Util.generateRandomId();

    if ( ReserveMsgID != undefined )
    {
        if ( MsgManager.reservedIDs.length > 0 && MsgManager.reservedIDs.indexOf( ReserveMsgID ) >= 0 )  return false;
        else
        {
            MsgManager.reservedIDs.push ( ReserveMsgID.toString() );
            MsgManager.reservedMsgBlocks.push( { "msgid": ReserveMsgID.toString(), "blockid": unqID } );
        }
    }   

    var delayTimer;
    var screenWidth = document.body.clientWidth;
    var screenHeight = document.body.clientHeight;
    var offsetPosition = ( disableAutoWidth != undefined ? ( disableAutoWidth ? '4%' : ( screenWidth < 480 ? '0' : '4%' ) ) : ( screenWidth < 480 ? '0' : '4%' ) );
    var optStyle = ( disableAutoWidth != undefined ? 'style="max-width:93%;"' : ( screenWidth < 480 ? 'style="width:100%;height:55px;padding: 6px 0 6px 0;"' : 'style="max-width:93%;"' ) ); //93% = 97% - 4% (offsetPosition)

    // cssClasses <-- We could accept it as a single string class name or array of class names and apply properly..

    var class_RoundType = ( disableAutoWidth != undefined && disableAutoWidth ) ? 'rounded' : ( ( screenWidth < 480 ) ? '' : 'rounded' );
    var notifDiv = $( '<div id="notif_' + unqID + '" class="notifMsg" ' + optStyle + '>' ); // class="' + notifMsgClass + ' ' + cssClasses + ' ' + class_RoundType + '" >' );
    notifDiv.addClass( [ 'notifBase', cssClasses, class_RoundType ] );


    $( 'body' ).append( notifDiv )

    if ( Xpos ) notifDiv.css( Xpos, offsetPosition );
    if ( Ypos ) notifDiv.css( Ypos, offsetPosition );
    if ( styles ) Util.stylesStrAppy( styles, notifDiv );

    var Tbl = $( '<table style="width:100%;padding:6px 4px;">' );
    var tBody = $( '<tbody>' );
    var trBody = $( '<tr>' );
    var tdMessage = $( '<td style="padding: 0px 5px;">' );

    notifDiv.append ( Tbl );
    Tbl.append ( tBody );
    tBody.append ( trBody );
    trBody.append ( tdMessage );
    tdMessage.append( bodyMessage );


    // TODO: These 'actionButton' need to be redesigned / cleaned...
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


    if ( disableClose == undefined || disableClose === false )
    {
        var tdClose = $( '<td style="width:24px;">' );
        var notifClose = $( '<img class="round" src="images/close_white.svg" style="border-radius:12px;" >' );

        $( notifClose ).click ( () => {

            if ( addtoCloseClick != undefined ) addtoCloseClick();

            if ( ReserveMsgID != undefined ) MsgManager.clearReservedMessage( ReserveMsgID );

            $( '#notif_' + unqID ).remove();

        });

        trBody.append ( tdClose );
        tdClose.append ( notifClose );
    }


    // If 'delayHide' is intentionally set ( with some number or '0' for not hide ), set to 'delayTimer..
    if ( delayHide != undefined || delayHide == 0 ) delayTimer = delayHide;
    else delayTimer = MsgManager._autoHideDelay;


    if ( actionButton && autoClick )
    {
        var stepCount = 100;
        var notifProgressOpacInitial = 0.5;
        var thresholdFlash = 0.85;
        var dvTmr = $( '<div id="notifClickProgress_' + unqID + '" step=0 steps='+stepCount+' class="notifProgress" >&nbsp;</div>' );

        $( dvTmr ).css( 'background-color', $( actionButton ).css( 'color' ) );
        $( dvTmr ).css( 'top', ( screenWidth < 480 ? '1px' : '0' ) ); //GREG: Pay more attention to this styling, looks terrible at times
        $( dvTmr ).css( 'left', ( screenWidth < 480 ? '-2px' : '0' ) ); //GREG: Pay more attention to this styling, looks terrible at times
        $( dvTmr ).css( 'opacity', notifProgressOpacInitial );
        $( dvTmr ).css( 'border-radius', screenWidth < 480 ? '4px 0px 0px 4px' : '' );
        
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
                }, Util.MS_SEC );
            }

          }, delayTimer );
    }

    if ( MsgManager.debugMode ) console.customLog( 'created messageNotification' );

    //if ( FormUtil.PWAlaunchFrom() == "homeScreen" )
    if ( ReserveMsgID & ReserveMsgID != 'geolocation' )
    {
        if ( actionButton && autoClick )
        {
            //playSound("notify");
        }
        else
        {
            //playSound("ping");
        }
    }

    if ( bodyMessage.indexOf( 'term=' ) >=0 ) TranslationManager.translatePage( tdMessage );

    return notifDiv;
};


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
                    // TRAN TODO : WHY DO WE NEED TO SET reservedID as null ????
                    reservedID = null;
                    return true;
                }
            }
        }
    }

    // TRAN TODO : SHOULD WE RETURN SOMETHING HERE ????

}


MsgManager.confirmPayloadPreview = function( parentTag, jsonData, titleTag, callBackSuccess )
{
    if ( jsonData )
    {
        //var dataPreview =  Util.jsonToArray ( jsonData, 'name:value' );
        var unqID = Util.generateRandomId();

        var screenWidth = document.body.clientWidth;
        var screenHeight = document.body.clientHeight;
        var notifDiv = $( '<div id="notif_' + unqID + '" class="previewPayload" >' );

        $( parentTag ).append( notifDiv );
    
        var prevRow = $( '<div class="sheet_preview" />' );
        var btnRow = $( '<div style="height:90px;text-align:center;margin-top:30px;" />' );
        var btnConfirm = $( `<div class="button primary button-full_width">
                                <div class="button__container">
                                    <div class="button-label">Confirm</div>
                                </div>
                            </div>` );
        
        var btnDecline = $( `<div class="button alert button-full_width">
                                <div class="button__container">
                                    <div class="button-label">Cancel</div>
                                </div>
                            </div>` );

        // var btnConfirm = $( '<button term="" class="acceptButton" style="">CONFIRM</button>' );
        // var btnDecline = $( '<button term="" class="declineButton" style="">CANCEL</button>' );

        notifDiv.append( prevRow )
        notifDiv.append( btnRow );

        prevRow.append( FormUtil.displayData_Array( titleTag, jsonData ) );
        //prevRow.find( 'table' ).css( 'max-width', prevRow.css( 'width' ) );

        btnRow.append( btnConfirm )
        btnRow.append( btnDecline )

        btnConfirm.click( function(){

            $( '#notif_' + unqID ).remove();

            if ( callBackSuccess ) callBackSuccess( true );

        } );

        btnDecline.click( function(){

            $( '#notif_' + unqID ).remove();

            if ( callBackSuccess ) callBackSuccess( false );

        } );

        prevRow.css( '--width', parentTag.css( 'width' ) );

        TranslationManager.translatePage();
    }

}

// -- End of Message Manager Class
// -------------------------------------
