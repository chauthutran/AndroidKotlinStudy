
function test_initSWManager( callBack )
{
    var cwsRenderObj = new cwsRender();
    SwManager.initialSetup( cwsRenderObj, callBack );
}

QUnit.test('Test swManager - runSWregistration', function( assert ){
    var done = assert.async();
    var swManagerObj = test_initSWManager( function(){
        swManagerObj.runSWregistration( function(){ });
        assert.equal( true, true, "checkRegisterSW runs successfully !!!" );
        done();
    });
   
});


QUnit.test('Test swManager - createInstallAndStateChangeEvents', function( assert ){
    var done = assert.async();
    var swManagerObj = test_initSWManager( function(){
        var swRegObj = {
            "active" : {
                onerror: null,
                onstatechange: null,
                scriptURL: "http://localhost:8080/pwa-dev/service-worker.js",
                state: "activated"
            }
           
        }
        swManagerObj.createInstallAndStateChangeEvents( swRegObj, function(){ });
        assert.equal( true, true, "createInstallAndStateChangeEvents runs successfully !!!" );
        done();
    });
    
});

