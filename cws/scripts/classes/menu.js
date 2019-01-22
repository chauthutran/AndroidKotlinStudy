// -------------------------------------------
// -- menu Class/Methods

function Menu() {}

Menu.menuItems_Loaded = []; //varInfo = 'eRefWSDev3'; //'eRefWSDev3';	eRefWSStage		// Need to be dynamically retrieved

Menu.menuJson_LogOut = { id: "logOut", name: "Log out", term: "" };
Menu.menuJson_About = { id: "aboutPage", name: "About", term: "" };

// ==== Methods ======================

Menu.setInitialLogInMenu = function( cwsRenderObj )
{
    var menuList = [];
    menuList.push( Menu.menuJson_About );
    cwsRenderObj.populateMenuList( menuList );
}

Menu.populateMenuList = function( menuItems )
{
    // Clear existing list


    // Add new list
}

//Menu.addToMenu = function( menuItems )
//Menu.removeFromMenu = function( menuItems )
