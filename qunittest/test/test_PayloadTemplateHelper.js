

QUnit.test('Test PayloadTemplateHelper - generatePayload', function( assert ){
  

    ConfigManager.configJson = {
        "definitionPayloadTemplates": {
            "searchJson":{
                "data":"INFO.formsJson"
            }
        }
    }

    var dateTimeObj = new Date();
    var formsJson = { "test1": "testVal1", "test2": "testVal2" };
    var formsJsonGroup = {'testGroup' : formsJson } ;

    var blockInfo = { "activityType" : "" };
    var payloadTemplate = "searchJson";


    var finalPayload = PayloadTemplateHelper.generatePayload ( dateTimeObj, formsJson, formsJsonGroup, blockInfo, payloadTemplate )
    assert.equal( JSON.stringify( finalPayload.data ) == JSON.stringify( formsJson ), true, "generatePayload runs successfully !!!" );
});


QUnit.test('Test PayloadTemplateHelper - setINFO_payload and evalPayloads', function( assert ){
  
    var dateTimeObj = new Date();
    var formsJson = {"payload" : { "test1": "testVal1", "test2": "testVal2" } };
    var formsJsonGroup = {'testGroup' : formsJson } ;
    var blockInfo = { "activityType" : "" };

    
    PayloadTemplateHelper.setINFO_payload( dateTimeObj, formsJson, formsJsonGroup, blockInfo );
    var info = InfoDataManager.getINFO().payload;
    assert.equal( info.date.getMilliseconds() == dateTimeObj.getMilliseconds() 
        && JSON.stringify( info.formsJson ) == JSON.stringify( formsJson )
        && JSON.stringify( info.formsJsonGroup.testGroup ) == JSON.stringify( formsJson )
        , true, "setINFO_payload runs successfully !!!" );



    var payloadList = [{"searchValues":{"payloadData":"INFO.formsJson"}}];
    PayloadTemplateHelper.evalPayloads ( payloadList, info );
    assert.equal( info.payloadJson.searchValues.payloadData.test1 == "testVal1" && info.payloadJson.searchValues.payloadData.test2 == "testVal2"
        , true, "evalPayloads runs successfully !!!" );
  
});

  
QUnit.test('Test PayloadTemplateHelper - combinePayloads', function( assert ){
  
    var payloadList = [ { "payload1": { "test1":"testVal1" } }, { "payload2": { "test2":"testVal2" } } ];

    var finalPayload = PayloadTemplateHelper.combinePayloads( payloadList );

    assert.equal( finalPayload.payload1.test1 == "testVal1" && finalPayload.payload2.test2 == "testVal2", true, "evalPayloads runs successfully !!!" );
  
});
  
  
QUnit.test('Test PayloadTemplateHelper - getPayloadListFromTemplate', function( assert ){
  
    var payloadTemplateDefs = { 
            "payload1": { "test1":"testVal1" }
            , "payload2": { "test2":"testVal2" }
            , "payload3": { "test3":"testVal3" } };

    
    var payloadList = PayloadTemplateHelper.getPayloadListFromTemplate( "payload1", payloadTemplateDefs );
    assert.equal( payloadList.length == 1 && payloadList[0].test1 == "testVal1", true, "getPayloadListFromTemplate by string runs successfully !!!" );
  

    var payloadList = PayloadTemplateHelper.getPayloadListFromTemplate( ["payload1", "payload2"], payloadTemplateDefs );
    assert.equal( payloadList.length == 2 
        && payloadList[0].test1 == "testVal1" && payloadList[1].test2 == "testVal2"
        , true, "getPayloadListFromTemplate by Object runs successfully !!!" );
  
});
