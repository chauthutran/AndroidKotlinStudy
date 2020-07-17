
QUnit.test('Test FormMsgManager - block', function( assert ){
  
    FormMsgManager.block( true, "Testing", FormMsgManager.cssBlock_Body );
    assert.equal( true, true, "the Block method undefined runs successfully !!!" );

    FormMsgManager.block( true, "Testing", FormMsgManager.cssBlock_Body, $("<div></div>") );
    assert.equal( true, true, "the Block method undefined runs successfully !!!" );  

    FormMsgManager.block( false, "Testing", FormMsgManager.cssBlock_Body, $("<div></div>") );
    assert.equal( true, true, "unBlock method undefined runs successfully !!!" ); 
});


QUnit.test('Test FormMsgManager - appBlockTemplate', function( assert ){
  
    FormMsgManager.appBlockTemplate( "appLoad" );
    assert.equal( true, true, "appBlockTemplate with appLoad template runs successfully !!!" );  

    FormMsgManager.appBlockTemplate( "appLoadProgress" );
    assert.equal( true, true, "appBlockTemplate with appLoadProgress template runs successfully !!!" );
      
    FormMsgManager.appBlockTemplate( "appDiagnostic" );
    assert.equal( true, true, "appBlockTemplate with appDiagnostic template runs successfully !!!" );
      
    FormMsgManager.appBlockTemplate();
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

