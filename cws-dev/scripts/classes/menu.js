// -------------------------------------------
// -- menu Class/Methods

function Menu() {}

Menu.menuItems_Loaded = []; //varInfo = 'eRefWSDev3'; //'eRefWSDev3';	eRefWSStage		// Need to be dynamically retrieved
Menu.menuJson_Statistics = { id: "statisticsPage", name: "Statistics", term: "", icon: "statistics", group: true, groupHeader: false };
Menu.menuJson_Settings = { id: "settingsPage", name: "Settings", term: "", icon: "settings", group: false, groupHeader: false };
Menu.menuJson_HNQIS = { id: "HNQIS", name: "HNQIS", term: "", icon: "settings", group: false, groupHeader: false };
Menu.menuJson_MyDetails = { id: "myDetails", name: "My Details", term: "", icon: "settings", group: false, groupHeader: false };
Menu.menuJson_About = { id: "aboutPage", name: "About", term: "", icon: "about", group: true, groupHeader: false };
Menu.menuJson_LogOut = { id: "logOut", name: "Log out", term: "menu_logout", icon: "logout", group: true, groupHeader: false };

// ==== Methods ======================

Menu.setInitialLogInMenu = function( cwsRenderObj )
{
    var menuList = [];

    menuList.push( Menu.menuJson_About );

    cwsRenderObj.populateMenuList( menuList );
}

Menu.populateStandardMenuList = function( menuItems )
{
    if (JSON.stringify(menuItems).indexOf('statisticsPage') < 0 )
    {
        menuItems.push ( Menu.menuJson_Statistics );
    }

    if (JSON.stringify(menuItems).indexOf('settingsPage') < 0 )
    {
        menuItems.push ( Menu.menuJson_Settings );
    }
    /*if (JSON.stringify(menuItems).indexOf('hnqisTemplate') < 0 )
    {
        menuItems.push ( Menu.menuJson_HNQIS );
    }*/
    if (JSON.stringify(menuItems).indexOf('detailsFormDiv') < 0 )
    {
        menuItems.push ( Menu.menuJson_MyDetails );
    }
    
    if (JSON.stringify(menuItems).indexOf('aboutPage') < 0 )
    {
        menuItems.push ( Menu.menuJson_About );
    }

    if (JSON.stringify(menuItems).indexOf('logOut') < 0 )
    {
        menuItems.push ( Menu.menuJson_LogOut );
    }

    return menuItems;
}

