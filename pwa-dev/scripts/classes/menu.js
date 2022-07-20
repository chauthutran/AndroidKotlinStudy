// -------------------------------------------
// -- menu Class/Methods

function Menu() {}

Menu.menuItems_Loaded = []; //varInfo = 'eRefWSDev3'; //'eRefWSDev3';	eRefWSStage		// Need to be dynamically retrieved
//Menu.jobAids = false;
//Menu.hnqisRdqa = false;

// [JOB_AID]
Menu.menuJson_JobAids = { id: "jobAids", name: "Job Aids", term: "menu_jobAids", icon: "settings", groupBefore: true, groupAfter: false };
Menu.menuJson_Chat = { id: "chat", name: "Chat", term: "menu_chat", icon: "settings", groupBefore: true, groupAfter: false };
Menu.menuJson_HNQIS_RDQA = { id: "hnqis_rdqaPage", name: "HNQIS", term: "menu_hnqis_rdqa", icon: "statistics", groupBefore: true, groupAfter: false };
Menu.menuJson_Statistics = { id: "statisticsPage", name: "Statistics", term: "menu_statistics", icon: "statistics", groupBefore: true, groupAfter: false };
Menu.menuJson_Settings = { id: "settingsPage", name: "Settings", term: "menu_settings", icon: "settings", groupBefore: true, groupAfter: false };
Menu.menuJson_About = { id: "aboutPage", name: "About", term: "menu_about", icon: "about", groupBefore: false, groupAfter: true };

Menu.menuJson_MyDetails = { id: "myDetails", name: "My Details", term: "", icon: "settings", groupBefore: false, groupAfter: false };

Menu.menuJson_LogOut = { id: "logOut", name: "Log out", term: "menu_logout", icon: "logout", groupBefore: false, groupAfter: true };

Menu.menuOpen_Click_Started = false;

// ==== Methods ======================

Menu.setInitialLogInMenu = function()
{
    var menuList = [];

    menuList.push( Menu.menuJson_About );
    menuList.push( Menu.menuJson_LogOut );

    Menu.populateMenuList( menuList );
}

Menu.populateStandardMenuList = function( menuItems )
{
    // [JOB_AID] / HnqisRdqa
    if ( ConfigManager.getAreas().options )
    {
        if ( ConfigManager.getAreas().options.jobAids ) {
            menuItems.push( Menu.menuJson_JobAids );  
            
            // Obsolete..
            $( '.jobAidFiling' ).show();
            $( '.jobAidFileListing' ).show();
        }

        if ( ConfigManager.getAreas().options.hnqisRdqa ) menuItems.push( Menu.menuJson_HNQIS_RDQA );    
        if ( ConfigManager.getAreas().options.chat ) menuItems.push( Menu.menuJson_Chat );    
    }

    
    menuItems.push ( Menu.menuJson_Statistics );    
    menuItems.push ( Menu.menuJson_Settings );
    menuItems.push ( Menu.menuJson_About );        
    menuItems.push ( Menu.menuJson_LogOut );
    //if (JSON.stringify(menuItems).indexOf('statisticsPage') < 0 )

    return menuItems;
}

// ========================================================
Menu.navDrawerDivTag;
Menu.navDrawerShowIconTag;


Menu.setUpMenu = function()
{
    Menu.navDrawerDivTag = $( '#navDrawerDiv' );
    Menu.navDrawerShowIconTag = $( 'div.Nav__icon' );

    Menu.setNavMenuIconEvents();
};

// =========================================
// === EVENTS ==========

Menu.setNavMenuIconEvents = function()
{
    Menu.navDrawerShowIconTag.click( function() {
        Menu.menuDivShow( Menu.navDrawerDivTag, $( '.navigation__close' ),  FormUtil.getScrimTag() );
    });
};


// Called by each menu..
Menu.setupMenuTagClick = function( menuTag )
{
    menuTag.click( function() 
    {
        var menuLiTag = $( this );
        var anchorTag = menuLiTag.find( 'a' ).first();

        // scrim hide			
        FormUtil.unblockPage();

        var clicked_areaId = menuLiTag.attr( 'areaId' );

        // TODO: RenderFullScreen <---
        SessionManager.cwsRenderObj.setAppTitle( clicked_areaId, anchorTag.text(), anchorTag.attr( 'term' ) ); //$( this ).attr( 'displayName' ) 
        SessionManager.cwsRenderObj.renderArea( clicked_areaId );

        return false;
    });
};


// =========================================

Menu.hideMenuDiv = function() 
{
    $( '.navigation__close' ).click();
};


// TODO: THIS SHOULD BE MOVED TO MENU CLASS  <-- Populate Top Dynamic Menu Items..
Menu.populateMenuList = function( areaList, exeFunc )
{
    var startMenuTag;

    // TODO: NEED TO BE PLACED IN HTML - No need to generate this everytime..
    Menu.navDrawerDivTag.empty();

    var navMenuHead = $( '<div class="navigation__header" />' );
    var navMenuLogo = $( '<div class="navigation__logo" />' );
    var navMenuUser = $( '<div class="navigation__user" />' );
    var navMenuClose = $( '<div class="navigation__close mouseDown" />' );

    Menu.navDrawerDivTag.append ( navMenuHead );
    navMenuHead.append ( navMenuLogo );
    navMenuHead.append ( navMenuUser );
    navMenuHead.append ( navMenuClose );

    // Only this part should be cleared and reGen when needed
    var navMenuItems = $( '<div class="navigation__items" style="height: calc( 100% - 100px);" />');
    var navItemsUL = $( '<ul />');

    navMenuItems.append( navItemsUL );


    // Add the menu rows
    if ( areaList )
    {
        for ( var i = 0; i < areaList.length; i++ )
        {
            var area = areaList[i];

            if ( area && area.groupBefore === true )
            {
                var groupRow = $( '<hr>' );

                navItemsUL.append( groupRow );
            }

            var menuLI = $( '<li class="mouseDown" areaId="' + area.id + '" />' ); // displayName="' + area.name + '"

            menuLI.append( $( '<div class="navigation__items-icon" style="background-image: url(images/' + area.icon + '.svg)" ></div>' ) );
            menuLI.append( $( '<a ' + FormUtil.getTermAttr( area ) + ' class="pointer" >' + area.name + '</a>' ) );

            navItemsUL.append( menuLI );

            Menu.setupMenuTagClick( menuLI );

            if ( area.startArea ) startMenuTag = menuLI;

            if ( area && area.groupAfter === true )
            {
                var groupRow = $( '<hr>' );

                navItemsUL.append( groupRow );
            }
        }	
    }

    Menu.navDrawerDivTag.append( navMenuItems );


    navMenuClose.on( 'click', function(){
        Menu.menuDivHide( Menu.navDrawerDivTag, FormUtil.getScrimTag() );
    });


    var menuUserName = $( '<div>' + SessionManager.sessionData.login_UserName + '</div>' );
    //var menuUserRoles = $( '<div style="color: #F06D24;font-size: 10pt;">[' + ConfigManager.login_UserRoles + ']</div>' );

    navMenuUser.append( menuUserName ); //, menuUserRoles

    if ( exeFunc ) exeFunc( startMenuTag );

};


Menu.refreshMenuItems = function()
{
    ConfigManager.getAreaListByStatus( ConnManagerNew.isAppMode_Online(), function( areaList ){

        if ( areaList )
        {
            var finalAreaList = ( SessionManager.getLoginStatus() ) ? Menu.populateStandardMenuList( areaList ) : Menu.setInitialLogInMenu();

            Menu.populateMenuList( finalAreaList, function( startMenuTag ){
                //if ( startMenuTag && SessionManager.getLoginStatus() ) startMenuTag.click();
            } );
        }
    } );
};


// =====================================================

Menu.menuDivShow = function( menuDivTag, closeBtnTag, scrimTag )
{
    // Set this state for 1 sec - for disabling swipe 
    Menu.menuOpen_Click_Started = true;
    setTimeout( function() {
        Menu.menuOpen_Click_Started = false;
    }, 1000 );


	menuDivTag.show();
	//menuDivTag.css( 'width', FormUtil.navDrawerWidthLimit( document.body.clientWidth ) + 'px' );
	menuDivTag.css( 'left', '0px' );


	scrimTag.show();
	scrimTag.off( 'click' ).click( function( event )
	{
		event.preventDefault();
		closeBtnTag.click();
	});
};


Menu.menuDivHide = function( showDivTag, scrimTag )
{
	showDivTag.css( 'left', '-' + FormUtil.navDrawerWidthLimit( document.body.clientWidth ) + 'px' );
	showDivTag.css( 'width', FormUtil.navDrawerWidthLimit( document.body.clientWidth ) + 'px' );

	setTimeout( function() { showDivTag.hide(); }, 500 );

	scrimTag.hide();
};
