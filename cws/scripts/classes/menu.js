// -------------------------------------------
// -- menu Class/Methods

function Menu() {}

Menu.menuItems_Loaded = []; //varInfo = 'eRefWSDev3'; //'eRefWSDev3';	eRefWSStage		// Need to be dynamically retrieved

Menu.menuJson_LogOut = { id: "logOut", name: "Log out", term: "", icon: "logout" };
Menu.menuJson_About = { id: "aboutPage", name: "About", term: "", icon: "about" };

// ==== Methods ======================

Menu.setInitialLogInMenu = function( cwsRenderObj )
{
    var menuList = [];

    menuList.push( Menu.menuJson_About );

    cwsRenderObj.populateMenuList( menuList );
}

Menu.populateStandardMenuList = function( menuItems )
{
    if (JSON.stringify(menuItems).indexOf('logOut') < 0 )
    {
        menuItems.push ( Menu.menuJson_LogOut );
    }

    if (JSON.stringify(menuItems).indexOf('aboutPage') < 0 )
    {
        menuItems.push ( Menu.menuJson_About );
    }    

    return menuItems;
}

