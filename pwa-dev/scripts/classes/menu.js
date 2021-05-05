// -------------------------------------------
// -- menu Class/Methods

function Menu() {}

Menu.menuItems_Loaded = []; //varInfo = 'eRefWSDev3'; //'eRefWSDev3';	eRefWSStage		// Need to be dynamically retrieved
Menu.jobAids = false;

// [JOB_AID]
Menu.menuJson_JobAids = { id: "jobAids", name: "Job Aids", term: "menu_jobAids", icon: "settings", groupBefore: true, groupAfter: false };
Menu.menuJson_Statistics = { id: "statisticsPage", name: "Statistics", term: "menu_statistics", icon: "statistics", groupBefore: true, groupAfter: false };
Menu.menuJson_Settings = { id: "settingsPage", name: "Settings", term: "menu_settings", icon: "settings", groupBefore: true, groupAfter: false };
Menu.menuJson_About = { id: "aboutPage", name: "About", term: "menu_about", icon: "about", groupBefore: false, groupAfter: true };

Menu.menuJson_HNQIS = { id: "HNQIS", name: "HNQIS", term: "", icon: "settings", groupBefore: false, groupAfter: false };
Menu.menuJson_MyDetails = { id: "myDetails", name: "My Details", term: "", icon: "settings", groupBefore: false, groupAfter: false };

Menu.menuJson_LogOut = { id: "logOut", name: "Log out", term: "menu_logout", icon: "logout", groupBefore: false, groupAfter: true };

// ==== Methods ======================

Menu.setInitialLogInMenu = function( cwsRenderObj )
{
    var menuList = [];

    menuList.push( Menu.menuJson_About );
    menuList.push( Menu.menuJson_LogOut );

    cwsRenderObj.populateMenuList( menuList );
}

Menu.populateStandardMenuList = function( menuItems )
{
    // [JOB_AID]
    if ( Menu.jobAids ) menuItems.push ( Menu.menuJson_JobAids );

    menuItems.push ( Menu.menuJson_Statistics );    
    menuItems.push ( Menu.menuJson_Settings );
    menuItems.push ( Menu.menuJson_About );        
    menuItems.push ( Menu.menuJson_LogOut );
    //if (JSON.stringify(menuItems).indexOf('statisticsPage') < 0 )

    return menuItems;
}

