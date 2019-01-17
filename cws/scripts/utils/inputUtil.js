// =========================================
// === Message with entire screen blocking
function inputMonitor( destObj ) 
{
    var container = document.querySelector( destObj );

    container.addEventListener("touchstart", startTouch, false);
    container.addEventListener("touchmove", moveTouch, false);
    container.addEventListener("touchend", touchEnd, false);
  
    // Swipe Up / Down / Left / Right
    var initialX = null;
    var initialY = null;

    var currentX = null;
    var currentY = null;

    var diffX = null;
    var diffY = null;

    var destObjWidth = container.offsetWidth;
    var destObjHeight = container.offsetHeight;

    function startTouch(e) 
    {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;
    };
    
    function moveTouch(e) 
    {
        if (initialX === null) {
            return;
        }

        if (initialY === null) {
            return;
        }

        var currentX = e.touches[0].clientX;
        var currentY = e.touches[0].clientY;

        var diffX = initialX - currentX;
        var diffY = initialY - currentY;


        if (Math.abs(diffX) > Math.abs(diffY)) 
        {
            // sliding horizontally > changed from ZERO to 10 because any swipe (even 1px) works
            if ( diffX > 10 ) 
            {
                // swiped left
                console.log("swiped left");
                if ( ( destObj == '#focusRelegator' ) || ( destObj == '#navDrawerDiv' ) )
                {
                    $( '#nav-toggle' ).click();
                }
            }
            else
            {
                // swiped right
                console.log("swiped right");
                if ( destObj == '#pageDiv' )
                {
                    $( '#nav-toggle' ).click();
                }
                //alert ('swiped right');
            }
        }
        else
        {
            // sliding vertically
            if (diffY > 0) 
            {
                // swiped up
                console.log("swiped up");
            } 
            else 
            {
                // swiped down
                console.log("swiped down");
            }
        }

        initialX = null;
        initialY = null;

        e.preventDefault();

    };

    function touchEnd(e) 
    {

    };

}
