// =========================================
// === device "touch" input manager

/*
    1. initiate touchstart ( touchStart() )
     1.1 determine object with touch-focus ( based on loggedIn status )
     1.2 set values/defaults based on 1.1

    2. do something with object being "touchmove" ( touchMove() )

    3. do something with interface/object at end of touchend ( touchEnd() )
*/

function inputMonitor( cwsRenderObj ) 
{
    var me = this;
    me.inputMonLogoutTimer;

    if ( Util.isMobi() )
    {
        document.addEventListener("touchstart", touchStart, false);
        document.addEventListener("touchmove", touchMove, false);
        document.addEventListener("touchend", touchEnd, false);
    }
    else
    {
        document.addEventListener("click", updateLogoutTimer, false);
    }


    var screenWidth = document.body.clientWidth; //container.offsetWidth;
    var screenHeight = document.body.clientHeight; //container.offsetHeight;

    // Swipe Up / Down / Left / Right
    var initialX = null;
    //var initialY = null;

    var navDrawerVisibleOnStart = false;
    var navDrawerVisibleOnMove = false;

    var expectedNavDrawerWidth = 0;
    var thresholdNavDrawerWidth = 0;
    var loggedIn = false;

    var trackX = 0; //early dev var (to be updated for improved tracking-distance accuracy: right now variables is messy)
    //var trackY = 0;

    var currentX = null;
    //var currentY = null;

    var diffX = null;
    //var diffY = null;

    var dragXoffsetLimit = 0;
    var touchStartTargetTag;
    var touchStartParentTag;
    var touchStartTargetWidth;
    var listItemFillerBlock;

    var listItemDragEnabled = false;
    var startTagRedeemListItem = false;
    var listItemWasExpanded = false;

    function touchStart(e) 
    {
        //console.log( $( e.touches[0].target ) );
        me.initialiseTouchDefaults( e );

        me.setFocusRelegatorInitialState();

        updateLogoutTimer();
    };

    function updateLogoutTimer()
    {
        if ( me.inputMonLogoutTimer ) clearInterval( me.inputMonLogoutTimer );

        if ( SessionManager.getLoginStatus() )
        {
            var logOutDelayMin = ConfigManager.staticData.logoutDelay;
            var logOutDelayMs = Number( logOutDelayMin ) * Util.MS_MIN;
            
            me.inputMonLogoutTimer = setTimeout( function() 
            {
                if ( SessionManager.getLoginStatus() ) {
                    console.log( 'Auto LogOut performed due to inactivity of ' + logOutDelayMin + ' minutes.' );
                    SessionManager.cwsRenderObj.logOutProcess();
                }
            }, logOutDelayMs ); 
        }
    }

    function touchMove(e) 
    {

        if ( !loggedIn 
            || Menu.menuOpen_Click_Started
            || (initialX === null ) 
            //|| (initialY === null) 
            || ( e.touches[0].clientX == null) )
        {
            return;
        }

        me.updatetouchMoveVars( e );

        if ( touchStartTargetTag && startTagRedeemListItem )
        {
            //DO NOT REMOVE: temp disabled (2019/06/13)
            //me.moveListItem(); // redeemList item is target object
        }
        else
        {
            me.moveNavDrawer(); // navDrawer is target object
        }
        /*else  // IGNORE UP+DOWN INPUT SWIPE FOR NOW (NB: DO NOT REMOVE CODE)
        {
            if (diffY > 0)  // sliding vertically
            {
                console.log("swiping up");  // swiping up
            } 
            else 
            {
                console.log("swiping down"); // swiping down
            }
        }*/

        //e.preventDefault();

    };

    function touchEnd( e ) 
    {

        if ( startTagRedeemListItem )
        {
            //DO NOT REMOVE: temp disabled (2019/06/13)
            //me.touchEndListItem( e );
        }
        else
        {
            me.toucheEndNavDrawer( e );
        }
        

        initialX = null;
        //initialY = null;

        trackX = 0;
        trackY = 0;

    };

    me.initialiseTouchDefaults = function( e )
    {
        initialX = e.touches[0].clientX;
        //initialY = e.touches[0].clientY;

        touchStartTargetTag = undefined; 
        touchStartParentTag = undefined;
        listItemFillerBlock = undefined;

        touchStartTargetWidth = 0;
        listItemDragEnabled = false;
        startTagRedeemListItem = false;
        listItemWasExpanded = false;
        navDrawerVisibleOnMove = false;

        loggedIn = SessionManager.getLoginStatus();
        expectedNavDrawerWidth  = FormUtil.navDrawerWidthLimit( screenWidth );
        navDrawerVisibleOnStart = $( '#navDrawerDiv' ).is( ':visible' );
        thresholdNavDrawerWidth = ( expectedNavDrawerWidth / 2 ).toFixed( 0 );
        dragXoffsetLimit = 50; // touch zone (up to left 50px for start of menu-open swipe)
        //console.log( $( e.touches[0].target ) );

        // listPage (containing redeemList) is currently visible
        if ( $( 'div.listDiv' ).is( ':visible' ) ) //div.floatListMenuSubIcons
        {
        }
        else
        {
            listItemDragEnabled = false;
        }

        /*
        if ( !listItemDragEnabled && $( 'div.floatListMenuSubIcons' ).is( ':visible' ) ) //div.floatListMenuSubIcons
        {
            $( 'div.floatListMenuIcon' ).css('zIndex',1);

            if ( ! $( e.touches[0].target ).hasClass( 'floatListMenuIcon' ) )
            {
                $( 'div.floatListMenuIcon' ).click();
            }
            else
            {
                e.stopPropagation();
            }

        }
        */

        if ( listItemDragEnabled && initialX >= dragXoffsetLimit )
        {
            startTagRedeemListItem = $( e.touches[0].target ).hasClass( 'dragSelector' ) || ( $( e.touches[0].target ).is( 'HTML') && $( e.touches[0].target ).hasClass( 'bg-color' ) ) ;

            if ( startTagRedeemListItem )
            {
                touchStartTargetTag = $( e.touches[0].target ).closest( 'a');
                touchStartTargetWidth = $( touchStartTargetTag ).width();    
            }

        }

        if ( $( '#navDrawerDiv' ).hasClass( 'transitionSmooth' ) ) 
        {
            $( '#navDrawerDiv' ).removeClass( 'transitionSmooth' );
            $( '#navDrawerDiv' ).addClass( 'transitionRapid' );
        }

    }

    me.setFocusRelegatorInitialState = function()
    {
        if ( $( 'div.scrim' ).is( ':visible' ) )
        {
            if ( $( '#navDrawerDiv' ).css( 'zIndex' ) < $( 'div.scrim' ).css( 'zIndex' ) )
            {
                //$( '#navDrawerDiv' ).css( 'zIndex', $( 'div.scrim' ).css( 'zIndex' ) );
                $( '#navDrawerDiv' ).css( 'zIndex', FormUtil.screenMaxZindex() +1 );
                $( 'div.scrim' ).css( 'zIndex', ( $( '#navDrawerDiv' ).css( 'zIndex' ) -1 ) );
            }
        }
        /*else
        {
            $( 'div.scrim' ).css( 'opacity', 0);
        }*/
    }

    me.initialiseListItemVars = function()
    {
        touchStartParentTag = $( touchStartTargetTag ).parent();
        listItemFillerBlock = $( '<a id="filler_' + touchStartTargetTag.attr( 'itemid' ) + '" class="expandable" style="z-Index: 0;" />' );

       // $( listItemFillerBlock ).css( 'height', $( touchStartTargetTag ).innerHeight() );
        $( listItemFillerBlock ).css( 'background-color', 'rgba(0, 0, 0, 0)' );
        $( listItemFillerBlock ).css( 'zIndex', ( $( touchStartTargetTag ).css( 'zIndex' ) -1 ) );

        $( touchStartTargetTag ).attr( 'initBorderBottomColor', $( touchStartTargetTag ).css( 'border-bottom-color' ) );
        $( touchStartTargetTag ).attr( 'initTop', $( touchStartTargetTag ).offset().top );
        $( touchStartTargetTag ).attr( 'initLeft', $( touchStartTargetTag ).offset().left );
        $( touchStartTargetTag ).attr( 'initZindex', $( touchStartTargetTag ).css( 'zIndex' ) );

        $( touchStartTargetTag ).css( 'width', 'fit-content' );
        $( touchStartTargetTag ).css( 'background-color', '#fff' );

        $( touchStartTargetTag ).parent().append( listItemFillerBlock );
        $( listItemFillerBlock ).append( $( '<table class="" style="width:100%;height:100%;padding:10px 0 10px 0;font-size:12px;color:#fff;vertical-align:middle;"><tr><td style="width:60px;text-align:center;" id="filler_message_' + touchStartTargetTag.attr( 'itemid' ) + '"><!-- send to<br>nearby<br>device? --></td><td style="border-left:0px solid #F5F5F5;padding-left:5px;width:40px;" id="dragItem_action_response_' + touchStartTargetTag.attr( 'itemid' ) + '"></td><td style="text-align:left;"><img src="images/entry.svg" id="filler_icon_' + touchStartTargetTag.attr( 'itemid' ) + '" style="width:30px;height:30px;filter: invert(100%);display:none;"></td></tr></table>' ) );

        $( 'body' ).append(  $( touchStartTargetTag ).detach() );

        $( touchStartTargetTag ).css( 'position', 'absolute' );
        $( touchStartTargetTag ).css( 'left', (initialX) + 'px' );
        $( touchStartTargetTag ).css( 'top', $( touchStartTargetTag ).attr( 'initTop' ) + 'px' );


        $( '#listItem_table_' + touchStartTargetTag.attr( 'itemid' ) ).css( 'width', '' );
        //$( touchStartTargetTag ).css( 'width', $( '#listItem_table_' + touchStartTargetTag.attr( 'itemid' ) ).width() + 'px' );
        $( '#listItem_voucher_status_' + touchStartTargetTag.attr( 'itemid' ) ).hide();
        $( '#listItem_action_sync_' + touchStartTargetTag.attr( 'itemid' ) ).hide();
        $( '#listItem_trExpander_' + touchStartTargetTag.attr( 'itemid' ) ).hide();
        
        listItemWasExpanded = ( $( '#listItem_networkResults_' + touchStartTargetTag.attr( 'itemid' ) ).is(':visible') );

        if ( listItemWasExpanded)
        {
            $( '#listItem_networkResults_' + touchStartTargetTag.attr( 'itemid' ) ).hide();
        }

        touchStartTargetTag.find( 'div.whitecarbon' ).css( 'width', '15px' );

        $( touchStartTargetTag ).css( 'width', 'fit-content' );

        if ( ! $( touchStartTargetTag ).hasClass( 'transitionRapid' ) )
        {
            $( touchStartTargetTag ).addClass( 'transitionRapid' );
            $( touchStartTargetTag ).addClass( 'cardShadow' );
            $( touchStartTargetTag ).addClass( 'rounded' );
        }
    }
    
    me.updatetouchMoveVars = function( e )
    {
        currentX = e.touches[0].clientX;
        //currentY = e.touches[0].clientY;

        if ( currentX > initialX )
        {
            diffX = currentX - initialX;
        }
        else
        {
            diffX = ( initialX - currentX ) * -1;
        }
        
        //diffY = initialY - currentY;

        trackX += diffX;
        //trackY += diffY;

        // for debugging
        //console.log( 'initialX: ' + initialX + ', currentX: ' + currentX + ', trackX: ' + trackX);
    }

    function getSessionSummary()
    {
        var msg = 'initialX = ' + parseFloat(initialX).toFixed(0) + 
                //' initialY = '+ parseFloat(initialY).toFixed(0) + 
                ' currentX = ' + parseFloat(currentX).toFixed(0) + 
                //' currentY = ' + parseFloat(currentY).toFixed(0) + 
                ' diffX = ' + parseFloat(diffX).toFixed(0) + 
                //' diffY = ' + parseFloat(diffY).toFixed(0) + 
                ' trackX = ' + parseFloat(trackX).toFixed(0) +
                //' trackY = ' + parseFloat(trackY).toFixed(0) + 
                ' navDrawerVisibleOnStart: ' + navDrawerVisibleOnStart + 
                ' navDrawerVisibleOnMove: ' + navDrawerVisibleOnMove + 
                ' navDrawerLeft: ' + $( '#navDrawerDiv' ).css( 'left' ) + 
                ' navDrawerWidth: ' + $( '#navDrawerDiv' ).css( 'width' ) + 
                ' dragXoffsetLimit: ' + dragXoffsetLimit + 
                ' listItemDragEnabled: ' + listItemDragEnabled +
                ' startTagRedeemListItem: ' + startTagRedeemListItem
                ' listItemWasExpanded: ' + listItemWasExpanded;
        return msg;
    }

    me.moveListItem = function()
    {
        if ( currentX <= ( dragXoffsetLimit + touchStartTargetWidth - $( touchStartTargetTag ).width() ) )
        {
            $( touchStartTargetTag ).css( 'left', (currentX) + 'px' );
        }

        if ( $( touchStartTargetTag ).css( 'top' ) != $( touchStartTargetTag ).attr( 'initTop' ) + 'px' )
        {
            $( touchStartTargetTag ).css( 'top', $( touchStartTargetTag ).attr( 'initTop' ) + 'px' );
        }

        $( listItemFillerBlock ).css( 'background-color', 'rgba(0, 0, 0, ' + ( ( ((currentX - dragXoffsetLimit) / touchStartTargetWidth ) <= 0.5) ? ((currentX - dragXoffsetLimit) / touchStartTargetWidth ) : 0.5 ) + ')' );
        $( listItemFillerBlock ).css( 'border-bottom-color', 'none' );

        if ( currentX > ( dragXoffsetLimit + ( touchStartTargetWidth / 3 ) ) )
        {
            $( '#dragItem_action_response_' + touchStartTargetTag.attr( 'itemid' ) ).html( '<!--Y-->' );
        }
        else
        {
            $( '#dragItem_action_response_' + touchStartTargetTag.attr( 'itemid' ) ).html( '<!--N-->' );
        }
    }


    me.moveNavDrawer = function()
    {
        navDrawerVisibleOnMove = $( '#navDrawerDiv' ).is( ':visible' );

        if ( diffX < 0 ) 
        {
            // swiping left
            //console.log("swiping left");

            if ( navDrawerVisibleOnStart )
            {
                $( 'div.scrim' ).css( 'opacity', Constants.focusRelegator_MaxOpacity * (( ( currentX > expectedNavDrawerWidth) ? expectedNavDrawerWidth : currentX) / expectedNavDrawerWidth) );

                if ( currentX <= expectedNavDrawerWidth )
                {
                    if ( $( '#navDrawerDiv' ).css( 'width') !== expectedNavDrawerWidth + 'px' ) $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                    if ( $( '#navDrawerDiv' ).css( 'left') !== (currentX - expectedNavDrawerWidth) + 'px' ) $( '#navDrawerDiv' ).css( 'left', (currentX - expectedNavDrawerWidth) + 'px' );
                }
                else
                {
                    if ( $( '#navDrawerDiv' ).css( 'width' ) !== expectedNavDrawerWidth + 'px' ) $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                    if ( $( '#navDrawerDiv' ).css( 'left' ) !== '0px' ) $( '#navDrawerDiv' ).css( 'left', '0px' );
                }

                if ( !navDrawerVisibleOnMove ) $( '#navDrawerDiv' ).show();

            }
        }
        else
        {
            // swiping right
            //console.log("swiping right");

            /* run navDrawer slide-expand (eval) for right-swipe ONLY if starting Xposition < 50px */
            if ( initialX < dragXoffsetLimit )
            {
                if ( navDrawerVisibleOnMove )
                {
                    $( 'div.scrim' ).css( 'opacity',Constants.focusRelegator_MaxOpacity * (( ( currentX > expectedNavDrawerWidth) ? expectedNavDrawerWidth : currentX) / expectedNavDrawerWidth) );
                }

                if ( ! $( 'div.scrim').is(':visible') )
                {
                    $( 'div.scrim').show();
                    //$( 'div.scrim').css( 'display', 'block' );
                }

                if ( $( 'div.scrim' ).css( 'zIndex') !== 100 ) $( 'div.scrim' ).css( 'zIndex', 100 );
                if ( $( '#navDrawerDiv' ).css( 'zIndex') !== 1501 ) $( '#navDrawerDiv' ).css('zIndex', 1501 ); //200

                if ( currentX > expectedNavDrawerWidth )
                {
                    if ( ! $( '#navDrawerDiv' ).css( 'left' ) != '0px' ) $( '#navDrawerDiv' ).css( 'left', '0px' );
                    if ( $( '#navDrawerDiv' ).css( 'width' ) !== expectedNavDrawerWidth + 'px' ) $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                }
                else
                {
                    if ( $( '#navDrawerDiv' ).css( 'left' ) !== (currentX - expectedNavDrawerWidth) + 'px' ) $( '#navDrawerDiv' ).css( 'left', (currentX - expectedNavDrawerWidth) + 'px' );
                    if ( ! $( '#navDrawerDiv' ).css( 'width' ) != expectedNavDrawerWidth + 'px' ) $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                }

                if (! $( '#navDrawerDiv' ).is(':visible') ) $( '#navDrawerDiv' ).show();

            }
            else
            {
                if ( navDrawerVisibleOnStart )
                {
                    $( 'div.scrim' ).css( 'opacity',Constants.focusRelegator_MaxOpacity * (( ( currentX > expectedNavDrawerWidth) ? expectedNavDrawerWidth : currentX) / expectedNavDrawerWidth) );

                    if ( currentX > expectedNavDrawerWidth )
                    {
                        if ( ! $( '#navDrawerDiv' ).css( 'left' ) != '0px' ) $( '#navDrawerDiv' ).css( 'left', '0px' );
                        if ( $( '#navDrawerDiv' ).css( 'width' ) !== expectedNavDrawerWidth + 'px' ) $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                    }
                    else
                    {
                        if ( $( '#navDrawerDiv' ).css( 'left' ) !== (currentX - expectedNavDrawerWidth) + 'px' ) $( '#navDrawerDiv' ).css( 'left', (currentX - expectedNavDrawerWidth) + 'px' );
                        if ( ! $( '#navDrawerDiv' ).css( 'width' ) != expectedNavDrawerWidth + 'px' ) $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                    }

                }
            }

        }
    }


    me.toucheEndNavDrawer = function( e )
    {

        if ( $( '#navDrawerDiv' ).hasClass( 'transitionRapid' ) )
        {
            $( '#navDrawerDiv' ).removeClass( 'transitionRapid' );
        } 
        if ( ! $( '#navDrawerDiv' ).hasClass( 'transitionSmooth' ) )
        {
            $( '#navDrawerDiv' ).addClass( 'transitionSmooth' );
        } 

        if ( !loggedIn 
            || Menu.menuOpen_Click_Started
            || ( Math.abs(trackX) <= 2) 
            || ( !navDrawerVisibleOnStart && !navDrawerVisibleOnMove ) )
        {
            trackX = 0;
            return;
        }

        $( '#navDrawerDiv' ).css( 'left', '0px' );
        $( 'div.scrim').css( 'opacity', Constants.focusRelegator_MaxOpacity );

        /* MENU HIDDEN/CLOSED > CHECK SWIPE OPEN THRESHOLDS */
        if ( ! navDrawerVisibleOnStart && ( initialX < dragXoffsetLimit ) ) // wasn't shown at start of swipe + swipe started within 50px of left part of screen
        {
            /* CHECK SWIPE LEFT-to-RIGHT thresholds to SHOW MENU */
            /* navDrawer NOT visible on start */
            if ( currentX > thresholdNavDrawerWidth ) // menu dragged OPEN (LEFT-to-RIGHT) WIDER than minimum width threshold >> SHOW
            {
                // showing menu
                $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                $( 'div.Nav__icon' ).click();
            }
            else    // menu NOT dragged (LEFT-to-RIGHT) wider than minimum width threshold >> HIDE
            {
                // staying closed
                $( '#navDrawerDiv' ).css( 'left', '-' + expectedNavDrawerWidth + 'px' );
                $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );

                setTimeout( function() {
                    $( '#navDrawerDiv' ).hide();
                }, 500 );

                $( 'div.scrim').hide();
                //$( 'div.scrim').css( 'display', 'none' );

            }
        }
        else
        {
            /* MENU ALREADY OPEN > CHECK SWIPE CLOSE THRESHOLDS */
            /* navDrawer VISIBLE on start */
            if ( currentX < thresholdNavDrawerWidth ) // menu dragged beyond minimum width threshold >> clicking HIDE
            {
                // closing menu (called click event)
                if ( $( 'div.scrim').is(':visible') ) $( 'div.scrim').hide();
                $( 'div.Nav__icon' ).click(); //clicked to close menu
            }
            else
            {
                // staying open   
                $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                $( 'div.scrim').show();
                //$( 'div.scrim').css( 'display', 'block' );
            }
        }

    }
}
