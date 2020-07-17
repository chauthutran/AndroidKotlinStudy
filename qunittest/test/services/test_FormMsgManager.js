
QUnit.test('Test FormMsgManager - block', function( assert ){
  
    FormMsgManager.block( true, "Testing", FormMsgManager.cssBlock_Body );
    assert.equal( true, true, "the Block method undefined runs successfully !!!" );

    FormMsgManager.block( true, "Testing", FormMsgManager.cssBlock_Body, $("<div></div>") );
    assert.equal( true, true, "the Block method undefined runs successfully !!!" );  
});


QUnit.test('Test FormMsgManager - appBlockTemplate', function( assert ){
  
    FormMsgManager.block( "appLoad" );
    assert.equal( true, true, "appBlockTemplate with appLoad template runs successfully !!!" );  

    FormMsgManager.block( "appLoadProgress" );
    assert.equal( true, true, "appBlockTemplate with appLoadProgress template runs successfully !!!" );
      
    FormMsgManager.block( "appDiagnostic" );
    assert.equal( true, true, "appBlockTemplate with appDiagnostic template runs successfully !!!" );
      
    FormMsgManager.block();
    assert.equal( true, true, "appBlockTemplate with undefined template param runs successfully !!!" );
});


QUnit.test('Test FormMsgManager - appBlock', function( assert ){
  
    FormMsgManager.appBlock();
    assert.equal( true, true, "appBlock runs successfully !!!" );  
});


QUnit.test('Test FormMsgManager - appUnblock', function( assert ){
  
    FormMsgManager.appUnblock();
    assert.equal( true, true, "appUnblock runs successfully !!!" );  
});

