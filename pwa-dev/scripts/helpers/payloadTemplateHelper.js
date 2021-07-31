// =========================================
// -------------------------------------------------
//     PayloadTemplateHelper
//          - Helper methods for 'payload' generation (New Activity Payload)
//
//      - FEATURES:
//          1. 'generatePayload' - Main method for new activity payload json.
//              - All other methods are supporting methods for this main method.
//
// -------------------------------------------------

function PayloadTemplateHelper()  {};

// ------------------------------------------------------------
// --- Main 'payload' generation method

PayloadTemplateHelper.generatePayload = function( dateTimeObj, formsJson, formsJsonGroup, blockInfo, payloadTemplate, INFO_Var )
{
    var finalPayload = {};

    try
    {
        var defPayloadTemplates = ConfigManager.getConfigJson().definitionPayloadTemplates;
        var payloadList = PayloadTemplateHelper.getPayloadListFromTemplate( payloadTemplate, defPayloadTemplates );
        var INFO = PayloadTemplateHelper.getINFO_wtPayloadSet( dateTimeObj, formsJson, formsJsonGroup, blockInfo, INFO_Var );

        PayloadTemplateHelper.evalPayloads( payloadList, INFO, defPayloadTemplates );
        
        finalPayload = PayloadTemplateHelper.combinePayloads( payloadList );
    }
    catch( errMsg )
    {
        var errMsgStr = 'Error on PayloadTemplateHelper.generatePayload, errMsg: ' + errMsg;
        console.customLog( errMsgStr );
        alert( errMsgStr );
    }

    return finalPayload;
};


// ------------------------------------------------------------

PayloadTemplateHelper.getPayloadListFromTemplate = function( payloadTemplate, payloadTemplateDefs )
{
    var payloadList = [];

    if ( payloadTemplateDefs )
    {
        try
        {
            // If 'payloadTemplate' is a single template name, not array list of template names.
            // put one payloadInfo in 'payloadList'.
            if ( typeof( payloadTemplate ) === "string" ) 
            {
                var payloadJson = payloadTemplateDefs[ payloadTemplate ];

                if ( payloadJson ) payloadList.push( Util.cloneJson( payloadJson ) );
            }
            else if ( typeof( payloadTemplate ) === "object" ) 
            {
                for ( var i = 0; i < payloadTemplate.length; i++ ) 
                {
                    var payloadTemplateTemp = payloadTemplate[ i ];

                    var payloadJson = payloadTemplateDefs[ payloadTemplateTemp ];

                    if ( payloadJson ) payloadList.push( Util.cloneJson( payloadJson ) );
                }
            }
        }
        catch( errMsg )
        {
            console.customLog( 'Error in PayloadTemplateHelper.getPayloadListFromTemplate, errMsg: ' + errMsg );
        }
    }

    return payloadList;
};

PayloadTemplateHelper.getINFO_wtPayloadSet = function( dateTimeObj, formsJson, formsJsonGroup, blockInfo, INFO_Var )
{
    var INFO = InfoDataManager.getINFO();   

    // client, clientId
    if ( blockInfo.clientId ) INFO.clientId = blockInfo.clientId;

    var payload = {};

    payload.date = dateTimeObj;
    payload.formsJson = formsJson;
    payload.formsJsonGroup = formsJsonGroup;

    Util.mergeJson( payload, blockInfo ); // activityType

    INFO.payload = payload;

    // NEW - add 'INFO_Var'  -- but this will accumulate..  Might not that be good?
    if ( INFO_Var ) Util.mergeJson( INFO, INFO_Var );

    return INFO;
};


PayloadTemplateHelper.evalPayloads = function( payloadList, INFO, defPayloadTemplates )
{    
    for ( var i = 0; i < payloadList.length; i++ ) 
    {
        var payloadJson = payloadList[ i ];

        INFO.payloadJson = payloadJson; 
        
        //Util.traverseEval( payloadJson, INFO, 0, 50 );
        Util.trvEval_payload = payloadJson;
        Util.trvEval_INSERT_SUBTEMPLATES( payloadJson, INFO, defPayloadTemplates, 0, 50 );
        Util.trvEval_TEMPLATE( payloadJson, INFO, defPayloadTemplates, 0, 50 );
    }
};


PayloadTemplateHelper.combinePayloads = function( payloadList )
{
    var finalPayload = {};

    for ( var i = 0; i < payloadList.length; i++ ) 
    {
        var payloadJson = payloadList[ i ];

        Util.mergeDeep( finalPayload, payloadJson );
    }

    return finalPayload;
};

// ================================================
