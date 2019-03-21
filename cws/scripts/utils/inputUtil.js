// =========================================
// === Message with entire screen blocking
function inputMonitor( cwsRenderObj ) 
{
    var me = this;
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

    var trackX = 0; //early dev var (to be updated for improved tracking-distance accuracy: right now variables is messy)
    var trackY = 0;

    var currentX = null;
    var currentY = null;

    var diffX = null;
    var diffY = null;

    var dragXoffsetLimit = 0;
    var startTouchTargetTag;
    var startTouchParentTag;
    var startTouchTargetWidth;
    var listItemFillerBlock;

    var listItemDragEnabled = false;
    var startTagRedeemListItem = false;
    var listItemWasExpanded = false;

    function startTouch(e) 
    {
        me.initialiseTouchDefaults( e );

        if ( startTagRedeemListItem )
        {
            me.initialiseListItemVars();
        }
        

        me.detectFocusRelegatorInitialState();

        cwsRenderInputMon.updateNavDrawerHeaderContent();

    };

    function moveTouch(e) 
    {
        if ( !loggedIn || (initialX === null ) || (initialY === null) || ( e.touches[0].clientX == null) )
        {
            return;
        }

        me.updateMoveTouchVars( e );

        if ( startTouchTargetTag && startTagRedeemListItem )
        {
            // redeemList item is target object
            me.moveListItem();
        }
        else
        {
            // navDrawer is target object
            me.moveNavDrawer();
        }

        // IGNORE UP+DOWN INPUT SWIPE FOR NOW (NB: DO NOT REMOVE CODE)
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

    function touchEnd( e ) 
    {

        if ( startTagRedeemListItem )
        {
            me.touchEndListItem( e );
        }
        else
        {
            //console.log( getSessionSummary() );
            me.toucheEndNavDrawer( e );
        }
        

        initialX = null;
        initialY = null;

        trackX = 0;
        trackY = 0;

    };

    me.initialiseTouchDefaults = function( e )
    {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;

        startTouchTargetTag = undefined; 
        startTouchParentTag = undefined;
        listItemFillerBlock = undefined;

        startTouchTargetWidth = 0;
        listItemDragEnabled = false;
        startTagRedeemListItem = false;
        listItemWasExpanded = false;
        navDrawerVisibleOnMove = false;

        loggedIn = FormUtil.checkLogin();
        expectedNavDrawerWidth  = FormUtil.navDrawerWidthLimit( screenWidth );
        navDrawerVisibleOnStart = $( '#navDrawerDiv' ).is( ':visible' );
        thresholdNavDrawerWidth = ( expectedNavDrawerWidth / 2 ).toFixed( 0 );

        // listPage (containing redeemList) is currently visible
        if ( $( 'div.floatListMenuIcon' ).is( ':visible' ) )
        {
            dragXoffsetLimit = $( 'ul.tab__content_act' ).offset().left;

            if ( initialX < dragXoffsetLimit && !navDrawerVisibleOnStart )
            {
                listItemDragEnabled = false;
            }
            else
            {
                listItemDragEnabled = true;
            }
        }
        else
        {
            dragXoffsetLimit = 50;
            listItemDragEnabled = false;
        }

        if ( !listItemDragEnabled && $( 'div.floatListMenuSubIcons' ).is( ':visible' ) )
        {
            $( 'div.floatListMenuIcon' ).css('zIndex',1);
            $( 'div.floatListMenuIcon' ).click();
        }

        if ( listItemDragEnabled && initialX >= dragXoffsetLimit )
        {
            startTagRedeemListItem = $( e.touches[0].target ).hasClass( 'dragSelector' );

            if ( startTagRedeemListItem )
            {
                // console.log( $( e.touches[0].target ).closest( 'a') ) ;
                startTouchTargetTag = $( e.touches[0].target ).closest( 'a');
                startTouchTargetWidth = $( startTouchTargetTag ).width();    
            }

        }

        if ( $( '#navDrawerDiv' ).hasClass( 'transitionSmooth' ) ) 
        {
            $( '#navDrawerDiv' ).removeClass( 'transitionSmooth' );
            $( '#navDrawerDiv' ).addClass( 'transitionRapid' );
        }

    }

    me.detectFocusRelegatorInitialState = function()
    {
        if ( $( '#focusRelegator' ).is( ':visible' ) && $( '#navDrawerDiv' ).css( 'zIndex' ) < $( '#focusRelegator' ).css( 'zIndex' ) )
        {
            $( '#navDrawerDiv' ).css( 'zIndex', $( '#focusRelegator' ).css( 'zIndex' ) );
            $( '#focusRelegator' ).css( 'zIndex', ( $( '#navDrawerDiv' ).css( 'zIndex' ) -1 ) );
        }
    }

    me.initialiseListItemVars = function()
    {
        startTouchParentTag = $( startTouchTargetTag ).parent();
        listItemFillerBlock = $( '<a id="filler_' + startTouchTargetTag.attr( 'itemid' ) + '" class="expandable" style="z-Index: 0;" />' );

        $( listItemFillerBlock ).css( 'height', $( startTouchTargetTag ).innerHeight() );
        $( listItemFillerBlock ).css( 'background-color', 'rgba(0, 0, 0, 0)' );
        $( listItemFillerBlock ).css( 'zIndex', ( $( startTouchTargetTag ).css( 'zIndex' ) -1 ) );

        $( startTouchTargetTag ).attr( 'initBorderBottomColor', $( startTouchTargetTag ).css( 'border-bottom-color' ) );
        $( startTouchTargetTag ).attr( 'initTop', $( startTouchTargetTag ).offset().top );
        $( startTouchTargetTag ).attr( 'initLeft', $( startTouchTargetTag ).offset().left );
        $( startTouchTargetTag ).attr( 'initZindex', $( startTouchTargetTag ).css( 'zIndex' ) );

        $( startTouchTargetTag ).css( 'width', 'fit-content' );
        $( startTouchTargetTag ).css( 'background-color', '#fff' );

        $( startTouchTargetTag ).parent().append( listItemFillerBlock );
        $( listItemFillerBlock ).append( $( '<table class="" style="width:100%;height:100%;padding:10px 0 10px 0;font-size:12px;color:#fff;vertical-align:middle;"><tr><td style="width:60px;text-align:center;" id="filler_message_' + startTouchTargetTag.attr( 'itemid' ) + '"><!-- send to<br>nearby<br>device? --></td><td style="border-left:0px solid #F5F5F5;padding-left:5px;width:40px;" id="dragItem_action_response_' + startTouchTargetTag.attr( 'itemid' ) + '"></td><td style="text-align:left;"><img src="img/entry.svg" id="filler_icon_' + startTouchTargetTag.attr( 'itemid' ) + '" style="width:30px;height:30px;filter: invert(100%);display:none;"></td></tr></table>' ) );

        $( 'body' ).append(  $( startTouchTargetTag ).detach() );

        $( startTouchTargetTag ).css( 'position', 'absolute' );
        $( startTouchTargetTag ).css( 'left', (initialX) + 'px' );
        $( startTouchTargetTag ).css( 'top', $( startTouchTargetTag ).attr( 'initTop' ) + 'px' );


        $( '#listItem_table_' + startTouchTargetTag.attr( 'itemid' ) ).css( 'width', '' );
        //$( startTouchTargetTag ).css( 'width', $( '#listItem_table_' + startTouchTargetTag.attr( 'itemid' ) ).width() + 'px' );
        $( '#listItem_voucher_code_' + startTouchTargetTag.attr( 'itemid' ) ).hide();
        $( '#listItem_action_sync_' + startTouchTargetTag.attr( 'itemid' ) ).hide();
        $( '#listItem_trExpander_' + startTouchTargetTag.attr( 'itemid' ) ).hide();
        
        listItemWasExpanded = ( $( '#listItem_networkResults_' + startTouchTargetTag.attr( 'itemid' ) ).is(':visible') );

        if ( listItemWasExpanded)
        {
            $( '#listItem_networkResults_' + startTouchTargetTag.attr( 'itemid' ) ).hide();
        }

        startTouchTargetTag.find( 'div.whitecarbon' ).css( 'width', '15px' );

        $( startTouchTargetTag ).css( 'width', 'fit-content' );

        if ( ! $( startTouchTargetTag ).hasClass( 'transitionRapid' ) )
        {
            $( startTouchTargetTag ).addClass( 'transitionRapid' );
            $( startTouchTargetTag ).addClass( 'cardShadow' );
            $( startTouchTargetTag ).addClass( 'rounded' );
        }
    }
    
    me.updateMoveTouchVars = function( e )
    {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;

        if ( currentX > initialX )
        {
            diffX = currentX - initialX;
        }
        else
        {
            diffX = ( initialX - currentX ) * -1;
        }
        
        diffY = initialY - currentY;

        trackX += diffX;
        trackY += diffY;

        //console.log( 'initialX: ' + initialX + ', currentX: ' + currentX + ', trackX: ' + trackX);
    }

    function getSessionSummary()
    {
        var msg = 'initialX = ' + parseFloat(initialX).toFixed(0) + 
                ' initialY = '+ parseFloat(initialY).toFixed(0) + 
                ' currentX = ' + parseFloat(currentX).toFixed(0) + 
                ' currentY = ' + parseFloat(currentY).toFixed(0) + 
                ' diffX = ' + parseFloat(diffX).toFixed(0) + 
                ' diffY = ' + parseFloat(diffY).toFixed(0) + 
                ' trackX = ' + parseFloat(trackX).toFixed(0) +
                ' trackY = ' + parseFloat(trackY).toFixed(0) + 
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
        if ( currentX <= ( dragXoffsetLimit + startTouchTargetWidth - $( startTouchTargetTag ).width() ) )
        {
            $( startTouchTargetTag ).css( 'left', (currentX) + 'px' );
        }

        if ( $( startTouchTargetTag ).css( 'top' ) != $( startTouchTargetTag ).attr( 'initTop' ) + 'px' )
        {
            $( startTouchTargetTag ).css( 'top', $( startTouchTargetTag ).attr( 'initTop' ) + 'px' );
        }

        $( listItemFillerBlock ).css( 'background-color', 'rgba(0, 0, 0, ' + ( ( ((currentX - dragXoffsetLimit) / startTouchTargetWidth ) <= 0.5) ? ((currentX - dragXoffsetLimit) / startTouchTargetWidth ) : 0.5 ) + ')' );
        $( listItemFillerBlock ).css( 'border-bottom-color', 'none' );

        if ( currentX > ( dragXoffsetLimit + ( startTouchTargetWidth / 3 ) ) )
        {
            $( '#dragItem_action_response_' + startTouchTargetTag.attr( 'itemid' ) ).html( '<!--Y-->' );
        }
        else
        {
            $( '#dragItem_action_response_' + startTouchTargetTag.attr( 'itemid' ) ).html( '<!--N-->' );
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
                $( '#focusRelegator' ).css( 'opacity', 0.5 * (( ( currentX > expectedNavDrawerWidth) ? expectedNavDrawerWidth : currentX) / expectedNavDrawerWidth) );

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
            //console.log("swiping right");

            /* run navDrawer slide-expand (eval) for right-swipe ONLY if starting Xposition < 50px */
            if ( initialX < dragXoffsetLimit )
            {
                //if ( ! navDrawerVisibleOnStart )
                {

                    if ( ! $( '#focusRelegator').is(':visible') )
                    {
                        $( '#focusRelegator').show();
                        $( '#focusRelegator' ).css( 'zIndex',100 );
                        $( '#navDrawerDiv' ).css('zIndex',200 );
                    }
                    else
                    {
                        if ( $( '#focusRelegator' ).css( 'zIndex' ) != 100 ) $( '#focusRelegator' ).css( 'zIndex',100 );
                        if ( $( '#navDrawerDiv' ).css( 'zIndex' ) != 200 ) $( '#focusRelegator' ).css( 'zIndex',200 );
                    }

                    if ( navDrawerVisibleOnMove )
                    {
                        $( '#focusRelegator' ).css( 'opacity',0.5 * (( ( currentX > expectedNavDrawerWidth) ? expectedNavDrawerWidth : currentX) / expectedNavDrawerWidth) );
                    }

                    if ( currentX > expectedNavDrawerWidth )
                    {
                        if ( ! $( '#navDrawerDiv' ).css( 'left' ) != '0px' ) $( '#navDrawerDiv' ).css( 'left', '0px' );
                        $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                    }
                    else
                    {
                        $( '#navDrawerDiv' ).css( 'left', (currentX - expectedNavDrawerWidth) + 'px' );
                        if ( ! $( '#navDrawerDiv' ).css( 'width' ) != expectedNavDrawerWidth + 'px' ) $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                    }

                    if (! $( '#navDrawerDiv' ).is(':visible') ) $( '#navDrawerDiv' ).show();

                }
            }
            else
            {
                if ( navDrawerVisibleOnStart )
                {
                    $( '#focusRelegator' ).css( 'opacity',0.5 * (( ( currentX > expectedNavDrawerWidth) ? expectedNavDrawerWidth : currentX) / expectedNavDrawerWidth) );

                    if ( currentX > expectedNavDrawerWidth )
                    {
                        if ( ! $( '#navDrawerDiv' ).css( 'left' ) != '0px' ) $( '#navDrawerDiv' ).css( 'left', '0px' );
                        $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                    }
                    else
                    {
                        $( '#navDrawerDiv' ).css( 'left', (currentX - expectedNavDrawerWidth) + 'px' );
                        if ( ! $( '#navDrawerDiv' ).css( 'width' ) != expectedNavDrawerWidth + 'px' ) $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                    }

                }
            }

        }
    }

    me.touchEndListItem = function( e )
    {
        var bArchive = ( currentX > ( dragXoffsetLimit + ( startTouchTargetWidth / 3 ) ) );

        $( listItemFillerBlock ).remove();

        $( startTouchTargetTag ).removeClass( 'transitionRapid' );
        $( startTouchTargetTag ).removeClass( 'cardShadow' );
        $( startTouchTargetTag ).removeClass( 'rounded' );
        $( startTouchTargetTag ).addClass( 'transitionSmooth' );

        //console.log( startTouchParentTag );

        $( startTouchTargetTag ).detach();
        //reset: snap back to left position with other defaults
        $( startTouchParentTag ).append( startTouchTargetTag );          

        $( startTouchTargetTag ).css( 'left', 'auto' );
        $( startTouchTargetTag ).css( 'top', 'initial' );
        $( startTouchTargetTag ).css( 'width', '100%' );
        $( startTouchTargetTag ).css( 'position', 'relative' );
        $( startTouchTargetTag ).css( 'border-bottom-color', $( startTouchTargetTag ).attr( 'initBorderBottomColor' ) );
        $( startTouchTargetTag ).css( 'background-Color', 'initial' );

        startTouchTargetTag.find( 'div.listItem' ).css( 'width', '100%' );


        $( '#listItem_table_' + startTouchTargetTag.attr( 'itemid' ) ).css( 'width', '100%' );
        $( '#listItem_voucher_code_' + startTouchTargetTag.attr( 'itemid' ) ).show();
        $( '#listItem_action_sync_' + startTouchTargetTag.attr( 'itemid' ) ).show();
        $( '#listItem_trExpander_' + startTouchTargetTag.attr( 'itemid' ) ).show();

        if ( listItemWasExpanded)
        {
            $( '#listItem_networkResults_' + startTouchTargetTag.attr( 'itemid' ) ).show();
            $( '#listItem_networkResults_' + startTouchTargetTag.attr( 'itemid' ) ).css( 'display', '' ); // required due to newly created hardcoded display setting 
        }

        FormUtil.listItemActionUpdate( startTouchTargetTag.attr( 'itemid' ), 'archive', bArchive );

        setTimeout( function() {
            $( startTouchTargetTag ).removeClass( 'transitionSmooth' );
        }, 500 );

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

        if ( !loggedIn || ( Math.abs(trackX) <= 2) || ( !navDrawerVisibleOnStart && !navDrawerVisibleOnMove ) )
        {
            trackX = 0;
            return;
        }

        $( '#navDrawerDiv' ).css( 'left', '0px' );
        $( '#focusRelegator').css( 'opacity', 0.5 );

        /* MENU HIDDEN/CLOSED > CHECK SWIPE OPEN THRESHOLDS */
        if ( ! navDrawerVisibleOnStart && ( initialX < dragXoffsetLimit ) ) // wasn't shown at start of swipe + swipe started within 50px of left part of screen
        {
            /* CHECK SWIPE LEFT-to-RIGHT thresholds to SHOW MENU */
            /* navDrawer NOT visible on start */
            if ( currentX > thresholdNavDrawerWidth ) // menu dragged OPEN (LEFT-to-RIGHT) WIDER than minimum width threshold >> SHOW
            {
                // showing menu
                $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                $( '#nav-toggle' ).click();
            }
            else    // menu NOT dragged (LEFT-to-RIGHT) wider than minimum width threshold >> HIDE
            {
                // staying closed
                $( '#navDrawerDiv' ).css( 'left', '-' + expectedNavDrawerWidth + 'px' );
                $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );

                setTimeout( function() {
                    $( '#navDrawerDiv' ).hide();
                }, 500 );

                $( '#focusRelegator').hide();

            }
        }
        else
        {
            /* MENU ALREADY OPEN > CHECK SWIPE CLOSE THRESHOLDS */
            /* navDrawer VISIBLE on start */
            if ( currentX < thresholdNavDrawerWidth ) // menu dragged beyond minimum width threshold >> clicking HIDE
            {
                // closing menu (called click event)
                if ( $( '#focusRelegator').is(':visible') ) $( '#focusRelegator').hide();
                $( '#nav-toggle' ).click(); //clicked to close menu
            }
            else
            {
                // staying open   
                $( '#navDrawerDiv' ).css( 'width', expectedNavDrawerWidth + 'px' );
                $( '#focusRelegator').show();
            }
        }

    }

}
