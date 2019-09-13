function readQR( valueTag ){

    var me = this;

    me.targetFrameTag = '#qrVideo';
    me.dataTargetTag = '#qrMessage';
    me.valueTag = valueTag;
    me.qrAttempts = 0;
    me.qrScanLimit = 60;

// QRCODE reader Copyright 2011 Lazar Laszlo
// http://www.webqr.com

    var debugMode = false;
    var gCtx = null;
    var gCanvas = null;
    var c=0;
    var stype=0;
    var gUM=false;
    var webkit=false;
    var moz=false;
    var v=null;

    var qrstream;
    var vStream;
    var qrData;

    var qrBlock = '<div id="qrBlock"></div>';
    var qrVideo = '<video id="qrVideo" autoplay></video>';
    var qrCanvas = '<canvas id="qr-canvas"></canvas>';
    var qrCancel = '<div id="qrCancel"></div>';
    var qrCancelButton = '<img id="qrCancelButton" class="rounded" src="images/qr_cancel.svg" >';
    var qrBusyIcon = '<img id="qrBusyIcon" src="images/Connect.svg" class="rotating" >';
    var qrMessage = '<div id="qrMessage" style="" ></div>';
    var qrBottom = '<div id="qrBottom" style="" ></div>';

    me.initialise = function()
    {
        if ( me.isCanvasSupported() && window.File && window.FileReader ) 
        {
            me.qrAttempts = 0;

            me.createBlocks();
            me.initiseStyles();

            //me.initCanvas(800, 600);
            me.initCanvas( $( document ).width(), $( document ).height() );

            qrcode.callback = me.readContent;
            me.setwebcam();

        }
        else 
        {

            MsgManager.notificationMessage ( 'Browser not supporting canvas', 'notificationDark', undefined, '', 'left', 'top', 5000 )
        }

    }

    me.createBlocks = function()
    {
        if ( $( '#qrBlock' ) ) $( '#qrBlock' ).remove();

        $( 'body' ).append( $( qrBlock ) );

        $( '#qrBlock' ).append( qrVideo );
        $( '#qrBlock' ).append( qrBottom );
        $( '#qrBottom' ).append( qrCancel );
        $( '#qrCancel' ).append( qrCancelButton );
        $( '#qrBlock' ).append( qrMessage );
        $( '#qrBlock' ).append( qrBusyIcon );

        $( '#qrCancel' ).on( 'click', function(){
            me.endQRstream();
            me.hideQR();
        } )

        $( '#qrBlock' ).append( qrCanvas );

        $( '#qrVideo' ).css( 'width', $( document ).width() );
        $( '#qrVideo' ).css( 'height', $( document ).height() );
        $( '#qrVideo' ).attr( 'width', $( document ).width() );
        $( '#qrVideo' ).attr( 'height', $( document ).height() );

    }

    me.initiseStyles = function()
    {

    }

    me.hideQR = function()
    {
        $( me.targetFrameTag ).hide( 'fast' );
        $( '#qrBlock' ).empty();
        me.qrAttempts = 0;
    }

    me.initCanvas = function (w, h) 
    {
        gCanvas = $( '#qr-canvas' );
        gCanvas.css( 'width', w + 'px' );
        gCanvas.css( 'height', h + 'px' );
        gCanvas.attr( 'width', w + 'px' );
        gCanvas.attr( 'height', h + 'px' );

        gCtx = gCanvas[ 0 ].getContext( '2d' );

        gCtx.clearRect(0, 0, w, h);
    }

    me.captureToCanvas = function () 
    {
        if (stype != 1)
            return;

        if (gUM) {
            try {
                me.qrAttempts += 1;
                gCtx.drawImage( v, 0, 0 );
                try {
                    qrcode.decode();
                    if ( debugMode ) console.log('DECODED QR') /* SUCCESSFUL DECODE OF QR CODE */
                    if ( me.valueTag ){
                        me.valueTag.val( qrData );
                    } 
                    else
                    {
                        console.log( qrData );
                    }
                    playSound("beep");
                    me.endQRstream();
                    me.hideQR();
                }
                catch (e) {
                    if ( e ) 
                    {
                        console.log(e);
                        if ( me.qrAttempts <= me.qrScanLimit )
                        {
                            setTimeout( me.captureToCanvas, 500 );
                        }
                        else
                        {
                            playSound("ping");
                            me.endQRstream();
                            me.hideQR();
                        }
                    }
                };
            }
            catch (e) {
                if ( e ) 
                {
                    console.log(e);
                    setTimeout( me.captureToCanvas, 500 );    
                }
            };
        }

    }

    me.htmlEntities = function (str) 
    {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    me.readContent = function (a) 
    {
        var html = "";

        if (a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
        {
            html += "<a target='_blank' href='" + a + "'>open link</a>";
        }

        if ( html.length )
        {
            MsgManager.notificationMessage ( 'URL found', 'notificationDark', $( html ), '', 'left', 'top', 10000 )
        }
        else
        {
            qrData = me.htmlEntities( a );
            $( '#qrMessage' ).html( qrData );
        }


        me.endQRstream();
    }

    me.isCanvasSupported = function () 
    {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }

    success = function (stream) 
    {
        v.srcObject = stream;
        v.play();

        gUM = true;
        qrstream = stream;

        setTimeout( me.captureToCanvas, 500 );
    }

    catchError = function (theError) 
    {
        gUM = false;
        return;
    }

    me.setwebcam = function () {

        var options = true;
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            try {
                navigator.mediaDevices.enumerateDevices()
                    .then(function (devices) {
                        devices.forEach(function (device) {
                            if (device.kind === 'videoinput') {
                                if (device.label.toLowerCase().search("back") > -1)
                                    options = { 'deviceId': { 'exact': device.deviceId }, 'facingMode': 'environment' };
                            }
                            if ( debugMode ) console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
                        });
                        me.setwebcam2(options);
                    });
            }
            catch (e) {
                console.log(e);
            }
        }
        else {
            console.log("no navigator.mediaDevices.enumerateDevices");
            me.setwebcam2(options);
        }

    }

    me.setwebcam2 = function (options) 
    {
        $( '#qrMessage' ).html( "present QR" );

        if (stype == 1) 
        {
            setTimeout( me.captureToCanvas, 500 );
            return;
        }

        var n = navigator;

        v = $( "#qrVideo" )[ 0 ];

        if (n.mediaDevices.getUserMedia) 
        {
            n.mediaDevices.getUserMedia( { video: options, audio: false } ).
                then( function ( stream ) {
                    success(stream);
                }).catch( function (error) {
                    catchError( error )
                });
        }
        else if (n.getUserMedia) {
            webkit = true;
            n.getUserMedia({ video: options, audio: false }, success, error);
        }
        else if (n.webkitGetUserMedia) {
            webkit = true;
            n.webkitGetUserMedia({ video: options, audio: false }, success, error);
        }

        stype = 1;

        setTimeout( me.captureToCanvas, 500 );
    }

    me.endQRstream = function () {
        qrstream.getTracks().forEach(track => track.stop());
        gUM = false;
    }

    me.initialise();

}