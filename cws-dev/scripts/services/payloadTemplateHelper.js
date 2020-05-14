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

PayloadTemplateHelper.generatePayload = function( dateTimeObj, formsJson, formsJsonGroup, blockInfo, payloadTemplate )
{
    var finalPayload = {};

    try
    {
        var payloadList = PayloadTemplateHelper.getPayloadListFromTemplate( payloadTemplate, ConfigManager.getConfigJson().definitionPayloadTemplates );
                
        var INFO = PayloadTemplateHelper.getINFO( dateTimeObj, formsJson, formsJsonGroup, blockInfo, SessionManager.sessionData );
        //DevHelper.setINFO_ForConsoleDisplay( INFO ); 

        PayloadTemplateHelper.evalPayloads( payloadList, INFO );

        finalPayload = PayloadTemplateHelper.combinePayloads( payloadList );

    }
    catch( errMsg )
    {
        console.log( 'Error on PayloadTemplateHelper.generatePayload, errMsg: ' + errMsg );
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

                if ( payloadJson ) payloadList.push( Util.getJsonDeepCopy( payloadJson ) );
            }
            else if ( typeof( payloadTemplate ) === "object" ) 
            {
                for ( var i = 0; i < payloadTemplate.length; i++ ) 
                {
                    var payloadTemplateTemp = payloadTemplate[ i ];

                    var payloadJson = payloadTemplateDefs[ payloadTemplateTemp ];

                    if ( payloadJson ) payloadList.push( Util.getJsonDeepCopy( payloadJson ) );
                }
            }
        }
        catch( errMsg )
        {
            console.log( 'Error in PayloadTemplateHelper.getPayloadListFromTemplate, errMsg: ' + errMsg );
        }
    }

    return payloadList;
};

PayloadTemplateHelper.getINFO = function( dateTimeObj, formsJson, formsJsonGroup, blockInfo, sessionData )
{
    var INFO = {};
    
    // In config/payloadTemplat, we will use below info
    INFO.date = dateTimeObj;
    Util.mergeJson( INFO, sessionData ); // = { login_UserName: '',
    Util.mergeJson( INFO, blockInfo ); // activityType
    
    INFO.formsJson = formsJson;
    INFO.formsJsonGroup = formsJsonGroup;

    return INFO;
};


PayloadTemplateHelper.evalPayloads = function( payloadList, INFO )
{    
    for ( var i = 0; i < payloadList.length; i++ ) 
    {
        var payloadJson = payloadList[ i ];

        INFO.payloadJson = payloadJson; 
        
        Util.traverseEval( payloadJson, INFO, 0, 15 );
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
