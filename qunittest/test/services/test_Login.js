
QUnit.asyncTest('Test - Login online', function( assert ){
	expect(1);
  
  WsCallManager.wsTargetUrl ="http://localhost:3020/" + WsCallManager.wsUrlList.stage;
  var login = new Login();
  login.onlineLogin( "LA_TEST_IPC", "1234", $("<div>Loading Task</div>"), function( success, loginData ){
	
    assert.equal( success, true, "Login successfully !!!");
    QUnit.start();
  });

});
