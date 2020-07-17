var userName = "TestSessionManager_Username";
var password = "TestSessionManager_Password";
var loginData = {
        "dcdConfig" : {
            "configType" : "dataCapture",
            "countryCode" : "TE"
        },
        "loginStatus" : true,
        "orgUnitData" : {},
        "status" : "success",
        "mySession" : {}
    };



QUnit.test('Test SessionManager - saveUserSessionToStorage and updateUserSessionToStorage', function( assert ){
    
    // Save data
    SessionManager.saveUserSessionToStorage( loginData, userName, password );


    // Get data from storage
    var testedData = LocalStgMng.getJsonData( userName );
    assert.equal( testedData.loginStatus, true, "Save data successully !!!" );


    // Update loginData.mySession.lastUpdated 
    SessionManager.updateUserSessionToStorage( loginData, userName );
    testedData = LocalStgMng.getJsonData( userName );
    assert.equal( testedData.mySession.stayLoggedIn , false, "Update 'mySession' data successully !!!" );


    LocalStgMng.deleteData( userName ); // Delete this data so that no gagabage data into database after running testing
});


QUnit.test('Test SessionManager - loadDataInSession and unloadDataInSession', function( assert ){
  
    // Load data
    SessionManager.loadDataInSession( userName, password, loginData );
    assert.equal( ConfigManager.getConfigJson().countryCode, "TE", "Load data successully !!!" );


    // Clear data
    SessionManager.unloadDataInSession() ;
    assert.equal( JSON.stringify( ConfigManager.getConfigJson() ), "{}", "Unload data successully !!!" );
    
});


QUnit.test('Test SessionManager - Save and Get data in localStorage', function( assert ){

    SessionManager.saveLoginDataFromStorage( userName, loginData );

    var testedData = SessionManager.getLoginDataFromStorage( userName );

    assert.equal( testedData.loginStatus, true, "Save and Get data from localStorage successully !!!" );

    LocalStgMng.deleteData( userName ); // Delete this data so that no gagabage data into database after running testing
});


QUnit.test('Test SessionManager - checkLoginData', function( assert ){

    var valid = SessionManager.checkLoginData( loginData );
    assert.equal( valid, true, "checkLoginData runs successully !!!" );
});

