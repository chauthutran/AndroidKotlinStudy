

QUnit.asyncTest('Online Login check', function( assert ){
	expect(1); // we have one async test to run
  
	WsApiManager.setupWsApiVariables();
	  
	FormUtil.submitLogin( "DV_TEST_IPC", "1234", $("<div>Loading Task</div>"), function( loginStatus, returnJson ){
	
		assert.equal( loginStatus, true, "Login successfully !!!");
		QUnit.start();
	});

});