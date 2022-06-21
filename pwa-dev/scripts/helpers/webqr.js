function readQR( valueTag ){

    var me = this;

    me.targetFrameTag = '#qrVideo';
    me.dataTargetTag = '#qrMessage';
    me.valueTag = valueTag;
    me.qrAttempts = 0;
    me.qrScanLimit = 60;

    /*
    QR code limits: 
        - minimum size: 115px x 115px (for smart phone reading of each module)
        - border: 4 module width (1 module = 1 block inside QR)
    */

// QRCODE reader Copyright 2011 Lazar Laszlo
// http://www.webqr.com

    var debugMode = true;
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
            me.initCanvas( $( document ).innerWidth(), $( document ).innerHeight() ); //(800, 600);
            me.initiseStyles( $( document ).innerWidth(), $( document ).innerHeight() );

            qrcode.callback = me.readContent;

            $( '#qrBlock' ).show();

            me.setwebcam();

        }
        else 
        {

            MsgManager.notificationMessage ( 'Browser not supporting canvas', 'notifDark', undefined, '', 'left', 'top', 5000 )
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

    }

    me.initiseStyles = function( w, h )
    {
        $( '#qrVideo' ).css( 'width', w );
        $( '#qrVideo' ).css( 'height', h );
        $( '#qrVideo' ).attr( 'width', w );
        $( '#qrVideo' ).attr( 'height', h );
    }

    me.hideQR = function()
    {
        $( me.targetFrameTag ).hide( 'fast' );

        $( '#qrBlock' ).empty();
        $( '#qrBlock' ).hide();

        me.qrAttempts = 0;
    }

    me.initCanvas = function ( w, h ) 
    {
        gCanvas = $( '#qr-canvas' );
        gCanvas.css( 'width', w + 'px' );
        gCanvas.css( 'height', h + 'px' );
        gCanvas.attr( 'width', w + 'px' );
        gCanvas.attr( 'height', h + 'px' );

        gCtx = gCanvas[ 0 ].getContext( '2d' );

        gCtx.clearRect( 0, 0, w, h );
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
            MsgManager.notificationMessage ( 'URL found', 'notifDark', $( html ), '', 'left', 'top', 10000 )
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
        var videolabels = 0;
        var validLabels = 0;
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            try {
                navigator.mediaDevices.enumerateDevices()
                    .then(function (devices) {
                        devices.forEach(function (device) {
                            console.log( device );
                            if (device.kind === 'videoinput') {
                                videolabels += 1;
                                if ( device.label.length ) validLabels += 1;
                                if (device.label.toLowerCase().search("back") > -1)
                                    options = { 'deviceId': { 'exact': device.deviceId }, 'facingMode': 'environment' };
                            }
                            if ( debugMode ) console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
                        });
                        console.log( options );
                        console.log( validLabels + ' / ' + videolabels );
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

    me.evalMediaDevices = function( callBack )
    {
        var videolabels = 0;
        var validLabels = 0;
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            try {
                navigator.mediaDevices.enumerateDevices()
                    .then(function (devices) {
                        devices.forEach(function (device) {
                            console.log( device );
                            if (device.kind === 'videoinput') {
                                videolabels += 1;
                                if ( device.label.length ) validLabels += 1;
                            }
                        });

                        console.log( validLabels + ' / ' + videolabels );

                        if ( callBack ) callBack();

                    });
            }
            catch (e) {
                console.log(e);
                if ( callBack ) callBack();
            }
        }
        else {
            console.log("no navigator.mediaDevices.enumerateDevices");
            if ( callBack ) callBack();
        }
    }

    me.evalMediaDevices( function(){
         me.initialise();
    })
   

}