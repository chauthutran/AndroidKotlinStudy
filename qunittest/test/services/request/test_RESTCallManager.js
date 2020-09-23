

QUnit.test('Test RESTCallManager - performREST', function( assert ){
  
    var done = assert.async();
  
    var url = "http://localhost:3020/https://pwa-dev.psi-connect.org/ws/dws-dev/PWA.available?sourceType=notLoggedIn";
    var requestData = {"method":"GET","headers":{"Authorization":"Basic cHdhOjUyOW4zS3B5amNOY0JNc1A="},"timeOut":60000};
    // {"headers":{"Authorization":"Basic cHdhOjUyOW4zS3B5amNOY0JNc1A="},"timeOut":60000}
    RESTCallManager.performREST( url, requestData, function(){
        assert.equal( true, true, "performREST runs successfully !!!");
        done();
    } );

});
  

QUnit.test('Test RESTCallManager - performGet', function( assert ){
  
    var done = assert.async();
  
    var url = "http://localhost:3020/https://pwa-dev.psi-connect.org/ws/dws-dev/PWA.available?sourceType=notLoggedIn";
    var requestData = {"headers":{"Authorization":"Basic cHdhOjUyOW4zS3B5amNOY0JNc1A="},"timeOut":60000}

    RESTCallManager.performGet( url, requestData, function(){
        assert.equal( true, true, "performGet runs successfully !!!");
        done();
    } );

});


QUnit.test('Test RESTCallManager - performGet', function( assert ){
  
    var done = assert.async();
  
    var url = "http://localhost:3020/https://pwa-dev.psi-connect.org/ws/dws-dev/PWA.available?sourceType=notLoggedIn";
    var requestData = {"headers":{"Authorization":"Basic cHdhOjUyOW4zS3B5amNOY0JNc1A="},"timeOut":60000}

    RESTCallManager.performPost( url, requestData, function(){
        assert.equal( true, true, "performGet runs successfully !!!");
        done();
    } );

});

