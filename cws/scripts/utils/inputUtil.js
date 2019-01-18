// =========================================
// === Message with entire screen blocking
function inputMonitor() 
{
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

    var initialNavDrawerWidth = 0;
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
        initialNavDrawerWidth = document.querySelector( '#navDrawerDiv' ).offsetWidth;

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

        navDrawerVisibleOnMove = $( '#navDrawerDiv' ).is( ':visible' );

        if (Math.abs(diffX) > Math.abs(diffY)) 
        {
            if ( diffX > 0 ) 
            {
                // swiping left
                console.log("swiping left");

                if ( navDrawerVisibleOnStart && ( currentX < initialNavDrawerWidth ) )
                {
                    if ( $( '#navDrawerDiv' ).hasClass( 'navDrawerTransitionSmooth' ) )
                    {
                        $( '#navDrawerDiv' ).removeClass( 'navDrawerTransitionSmooth' );
                        $( '#navDrawerDiv' ).addClass( 'navDrawerTransitionNone' );
                    }

                    $( '#navDrawerDiv' ).css( 'width', currentX + 'px' );

                    if ( !navDrawerVisibleOnMove )
                    {
                        $( '#navDrawerDiv' ).show();
                    }
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
                        if ( $( '#navDrawerDiv' ).hasClass( 'navDrawerTransitionSmooth' ) )
                        {
                            $( '#navDrawerDiv' ).removeClass( 'navDrawerTransitionSmooth' );
                            $( '#navDrawerDiv' ).addClass( 'navDrawerTransitionNone' );
                        }

                        $( '#navDrawerDiv' ).css( 'width', currentX + 'px' );

                        if ( !navDrawerVisibleOnMove )
                        {
                            $( '#navDrawerDiv' ).show();
                        }
                    }
                }

            }
        }
        else
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
        }

        e.preventDefault();

    };

    function touchEnd(e) 
    {

        //if ( !loggedIn || ( diffX == 0 ) )
        if ( !loggedIn || ( trackXtouchDistance == 0) )
        {
            return;
        }

        console.log( getSessionSummary() );

        var autoExpandThreshold = FormUtil.navDrawerExpandThreshold( screenWidth );

        /* MENU HIDDEN/CLOSED > CHECK SWIPE OPEN THRESHOLDS */
        if ( ! navDrawerVisibleOnStart && ( initialX < 50 ) ) // wasn't shown at start of swipe + swipe started within 50px of left part of screen
        {
            /* CHECK SWIPE LEFT-to-RIGHT thresholds to SHOW MENU */
            /* navDrawerVisibleOnStart = false */
            if ( currentX > autoExpandThreshold ) // menu dragged OPEN (LEFT-to-RIGHT) WIDER than minimum width threshold >> SHOW
            {

                $( '#navDrawerDiv' ).css( 'width', FormUtil.navDrawerMaxWidth( screenWidth ) );
                $( '#navDrawerDiv' ).removeClass( 'navDrawerTransitionNone' );
                $( '#navDrawerDiv' ).addClass( 'navDrawerTransitionSmooth' );
                $( '#nav-toggle' ).click();

            }
            else    // menu NOT dragged (LEFT-to-RIGHT) wider than minimum width threshold >> HIDE
            {

                $( '#navDrawerDiv' ).removeClass( 'navDrawerTransitionNone' );
                $( '#navDrawerDiv' ).addClass( 'navDrawerTransitionSmooth' );
                //$( '#navDrawerDiv' ).css( 'width', '0' );
                $( '#navDrawerDiv' ).hide();
                $( '#navDrawerDiv' ).css( 'width', 'auto' );

            }
        }
        else
        {
            /* MENU ALREADY OPEN > CHECK SWIPE CLOSE THRESHOLDS */
            /* navDrawerVisibleOnStart = true */
            if ( currentX < autoExpandThreshold ) // menu dragged open (while visible) LESS than minimum width threshold >> HIDE
            {
                $( '#navDrawerDiv' ).removeClass( 'navDrawerTransitionNone' );
                $( '#navDrawerDiv' ).addClass( 'navDrawerTransitionSmooth' );
                $( '#nav-toggle' ).click();

            }
            else
            {
                $( '#navDrawerDiv' ).removeClass( 'navDrawerTransitionNone' );
                $( '#navDrawerDiv' ).addClass( 'navDrawerTransitionSmooth' );
                $( '#navDrawerDiv' ).css( 'width', FormUtil.navDrawerMaxWidth( screenWidth ) );

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
