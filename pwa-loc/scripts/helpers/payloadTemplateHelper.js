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
        var errMsgStr = 'Error: ' + errMsg;
        MsgManager.msgAreaShow( errMsgStr, 'ERROR' );
        throw errMsg;
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
            if ( Util.isTypeString( payloadTemplate ) ) 
            {
                var payloadJson = payloadTemplateDefs[ payloadTemplate ];

                if ( payloadJson ) payloadList.push( Util.cloneJson( payloadJson ) );
            }
            else if ( Util.isTypeArray( payloadTemplate ) ) 
            {
                for ( var i = 0; i < payloadTemplate.length; i++ ) 
                {
                    var payloadTemplateItem = payloadTemplate[ i ];

                    var payloadJson;

                    // Usually, payloadTemplate are array.
                    // If Object, then, it is likely the expression, not definition ones.
                    if ( Util.isTypeString( payloadTemplateItem ) ) payloadJson = payloadTemplateDefs[ payloadTemplateItem ];
                    else if ( Util.isTypeObject( payloadTemplateItem ) ) payloadJson = payloadTemplateItem;

                    if ( payloadJson ) payloadList.push( Util.cloneJson( payloadJson ) );
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

        if ( Util.isTypeString( payloadJson ) && !defPayloadTemplates[ payloadJson ] ) throw '"' + payloadJson + '" does not exist in definitionPayloadTemplate';

        INFO.payloadJson = payloadJson;                 
        Util.trvEval_payload = payloadJson;
        
        // NOTE: 'payloadJson' should have payload in json version (from template).
        // 'defPayloadTemplates' is also passed/used for referencing other templates while evaluating / traversing json..
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


PayloadTemplateHelper.evalPayloadTemplate_fieldOverride = function( formsJson, INFO, payloadTemplate, field )
{
    // Evaluate 'payloadTemplate' and from result, get field under 'searchFields'
    if ( payloadTemplate && field )
    {
        try
        {
            var payloadDefs = ConfigManager.getConfigJson().definitionPayloadTemplates;
            var payloadJson = Util.cloneJson( payloadDefs[ payloadTemplate ] );
    
            // Emulate the 'INFO.payload.formsJson' by formsJson / inputJson.
            INFO.payload = { formsJson: formsJson };
    
            PayloadTemplateHelper.evalPayloads( [ payloadJson ], INFO, payloadDefs );
    
            // Final Override the 'field' <-- evalulated.. { "searchFields": { "birthDate": { "$gte":.. "$lte":.. }  } 
            if ( payloadJson.searchFields && payloadJson.searchFields[ field ] )
            {
                formsJson[ field ] = payloadJson.searchFields[ field ];    
            }
        }
        catch( errMsg )
        {
            console.log( 'ERROR in PayloadTemplateHelper.evalPayloadTemplate, ' + errMsg );
        }
    }
};

