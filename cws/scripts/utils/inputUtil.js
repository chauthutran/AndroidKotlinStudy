// =========================================
// === Message with entire screen blocking
function inputMonitor( cwsRenderObj ) 
{
    var cwsRenderInputMon = cwsRenderObj;
    //var container = document.querySelector( destObj );

    document.addEventListener("touchstart", startTouch, false);
    document.addEventListener("touchmove", moveTouch, false);
    document.addEventListener("touchend", touchEnd, false);

    var screenWidth = document.body.clientWidth; //container.offsetWidth;
    var screenHeight = document.body.clientHeight; //container.offsetHeight;

    // Swipe Up / Down / Left / Right
    var initialX = null;
    var initialY = null;

    var navDrawerVisibleOnStart = false;
    var navDrawerVisibleOnMove = false;

    var expectedNavDrawerWidth = 0;
    var thresholdNavDrawerWidth = 0;
    var loggedIn = false;

    var trackXtouchDistance = 0;
    var trackYtouchDistance = 0;

    var currentX = null;
    var currentY = null;

    var diffX = null;
    var diffY = null;


    function startTouch(e) 
    {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;

        navDrawerVisibleOnStart = $( '#navDrawerDiv' ).is( ':visible' );
        expectedNavDrawerWidth  = FormUtil.navDrawerWidthLimit( screenWidth );
        thresholdNavDrawerWidth = ( FormUtil.navDrawerWidthLimit( screenWidth ) / 2 ).toFixed( 0 );

        console.log(screenWidth + ': ' + expectedNavDrawerWidth);

        cwsRenderInputMon.updateNavDrawerHeaderContent();
        loggedIn = FormUtil.checkLogin();
    };
    
    function moveTouch(e) 
    {
        if ( !loggedIn )
        {
            return;
        }

        if (initialX === null) {
            return;
        }

        if (initialY === null) {
            return;
        }

        if ( e.touches[0].clientX == null)
        {
            return;
        }

        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;

        diffX = initialX - currentX;
        diffY = initialY - currentY;

        trackXtouchDistance += diffX;
        trackYtouchDistance += diffY;

        //MsgManager.msgAreaShow( initialX.toFixed(0) + ' ' + ': diffX: ' + diffX.toFixed(0) + ' ' + ' currX: ' + currentX.toFixed(0) + '   ' + initialY.toFixed(0) + ', ' + ': diffY: ' + diffY.toFixed(0) + ', ' + ' currY: ' + currentY.toFixed(0) );
        navDrawerVisibleOnMove = $( '#navDrawerDiv' ).is( ':visible' );

        if ( $( '#navDrawerDiv' ).hasClass( 'navDrawerTransitionSmooth' ) ) 
        {
            $( '#navDrawerDiv' ).removeClass( 'navDrawerTransitionSmooth' );
            $( '#navDrawerDiv' ).addClass( 'navDrawerTransitionNone' );
        }

        //if ( Math.abs(diffX) > Math.abs(diffY) || Math.abs(trackXtouchDistance) > Math.abs(trackYtouchDistance) ) 
        {
            if ( diffX > 0 ) 
            {
                // swiping left
                console.log("swiping left");

                if ( navDrawerVisibleOnStart )
                {
                    //$( '#focusRelegator' ).css( 'opacity',0.5 *  (currentX / expectedNavDrawerWidth) );
                    $( '#focusRelegator' ).css( 'opacity',0.5 * (( ( currentX > expectedNavDrawerWidth) ? expectedNavDrawerWidth : currentX) / expectedNavDrawerWidth) );

                    if ( currentX <= expectedNavDrawerWidth )
                    {
                        $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                        $( '#navDrawerDiv' ).css( 'left', (currentX - expectedNavDrawerWidth) + 'px' );
                    }
                    else
                    {
                        $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                        $( '#navDrawerDiv' ).css( 'left', '0px' );
                    }

                    if ( !navDrawerVisibleOnMove ) $( '#navDrawerDiv' ).show();

                }
            }
            else
            {
                // swiping right
                console.log("swiping right");

                /* run navDrawer slide-expand (eval) for right-swipe ONLY if starting Xposition < 50px */
                if ( initialX < 50 )
                {
                    if ( ! navDrawerVisibleOnStart )
                    {

                        if ( ! $( '#focusRelegator').is(':visible') )
                        {
                            $( '#focusRelegator').show();
                            $( '#focusRelegator' ).css( 'zIndex',100);
                            $( '#navDrawerDiv' ).css('zIndex',200);
                        }

                        $( '#focusRelegator' ).css( 'opacity',0.5 * (( ( currentX > expectedNavDrawerWidth) ? expectedNavDrawerWidth : currentX) / expectedNavDrawerWidth) );

                        if ( currentX > expectedNavDrawerWidth )
                        {
                            $( '#navDrawerDiv' ).css( 'left', '0px' );
                            $( '#navDrawerDiv' ).css( 'width', currentX + 'px' );
                        }
                        else
                        {
                            $( '#navDrawerDiv' ).css( 'left', (currentX - expectedNavDrawerWidth) + 'px' );
                            $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                        }

                        if (! $( '#navDrawerDiv' ).is(':visible') ) $( '#navDrawerDiv' ).show();

                    }
                }
                else
                {
                    if ( navDrawerVisibleOnStart )
                    {
                        $( '#focusRelegator' ).css( 'opacity',0.5 *  (currentX / expectedNavDrawerWidth) );

                        $( '#navDrawerDiv' ).css( 'left', '0px' );
                        $( '#navDrawerDiv' ).css( 'width', currentX + 'px' );
                    }
                }

            }
        }
        // IGNORE UP+DOWN INPUT SWIPE FOR NOW
        /*else
        {
            // sliding vertically
            if (diffY > 0) 
            {
                // swiping up
                console.log("swiping up");
            } 
            else 
            {
                // swiping down
                console.log("swiping down");
            }
        }*/

        //e.preventDefault();

    };

    function touchEnd(e) 
    {

        if ( !loggedIn || ( trackXtouchDistance == 0) || ( !navDrawerVisibleOnStart && !navDrawerVisibleOnMove ) )
        {
            return;
        }

        if ( $( '#navDrawerDiv' ).hasClass( 'navDrawerTransitionNone' ) )
        {
            $( '#navDrawerDiv' ).removeClass( 'navDrawerTransitionNone' );
        } 
        if ( ! $( '#navDrawerDiv' ).hasClass( 'navDrawerTransitionSmooth' ) )
        {
            $( '#navDrawerDiv' ).addClass( 'navDrawerTransitionSmooth' );
        } 

        $( '#navDrawerDiv' ).css( 'left', '0px' );
        $( '#focusRelegator').css( 'opacity', 0.5 );

        /* MENU HIDDEN/CLOSED > CHECK SWIPE OPEN THRESHOLDS */
        if ( ! navDrawerVisibleOnStart && ( initialX < 50 ) ) // wasn't shown at start of swipe + swipe started within 50px of left part of screen
        {

            /* CHECK SWIPE LEFT-to-RIGHT thresholds to SHOW MENU */
            /* navDrawerVisibleOnStart = false */
            if ( currentX > thresholdNavDrawerWidth ) // menu dragged OPEN (LEFT-to-RIGHT) WIDER than minimum width threshold >> SHOW
            {
                console.log ( 'showing menu ' );

                $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );

                $( '#nav-toggle' ).click();

            }
            else    // menu NOT dragged (LEFT-to-RIGHT) wider than minimum width threshold >> HIDE
            {
                console.log ( 'staying closed ' );

                $( '#navDrawerDiv' ).css( 'left', '-' + expectedNavDrawerWidth + 'px' );
                $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );

				setTimeout( function() {
					$( '#navDrawerDiv' ).hide();
				}, 500 );

                if ( $( '#focusRelegator').is(':visible') ) $( '#focusRelegator').hide();

            }
        }
        else
        {
            /* MENU ALREADY OPEN > CHECK SWIPE CLOSE THRESHOLDS */
            /* navDrawerVisibleOnStart = true */
            if ( currentX < thresholdNavDrawerWidth ) // menu dragged beyond minimum width threshold >> clicking HIDE
            {
                console.log ( 'closing menu (called click event) ' );

                if ( $( '#focusRelegator').is(':visible') ) $( '#focusRelegator').hide();

                $( '#nav-toggle' ).click(); //click close
            }
            else
            {
                // stay open
                console.log ( 'staying open ' );

                $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );

                if ( ! $( '#focusRelegator').is(':visible') ) $( '#focusRelegator').show();

            }
        }

        initialX = null;
        initialY = null;

        trackXtouchDistance = 0;
        trackYtouchDistance = 0;

    };

    function getSessionSummary()
    {
        var msg = 'initialX = ' + initialX + 
                ' initialY = '+ initialY + 
                ' currentX = ' + currentX + 
                ' currentY = ' + currentY + 
                ' diffX = ' + diffX + 
                ' diffY = ' + diffY + 
                ' trackXtouchDistance = ' + trackXtouchDistance +
                ' trackYtouchDistance = ' + trackYtouchDistance;

        return msg;
    }
}
