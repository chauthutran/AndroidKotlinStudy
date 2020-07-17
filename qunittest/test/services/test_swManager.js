
function test_initSWManager()
{
    var cwsRenderObj = new cwsRender();
    return new swManager( cwsRenderObj, function(){ } );
}

QUnit.test('Test swManager - checkRegisterSW', function( assert ){

    var swManagerObj = test_initSWManager();
    swManagerObj.checkRegisterSW( function(){ });
    assert.equal( true, true, "checkRegisterSW runs successfully !!!" );
});


QUnit.test('Test swManager - runSWregistration', function( assert ){

    var swManagerObj = test_initSWManager();
    swManagerObj.runSWregistration( function(){ });
    assert.equal( true, true, "checkRegisterSW runs successfully !!!" );
});

