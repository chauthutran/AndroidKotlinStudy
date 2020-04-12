// =========================================
// -------------------------------------------------
//     PayloadTemplateHelper
//          - keeps activity list data & has methods related to that.
//
// -- Pseudo WriteUp:   Create Pseudo Codes with Flow of App (High Level --> to Lower Level)
//
//
// -------------------------------------------------

function PayloadTemplateHelper()  {};


PayloadTemplateHelper.generatePayload = function( dateTimeObj, formsJson, formsJsonGroup, blockInfo, payloadTemplate )
{
    var finalPayload = {};

    try
    {
        var payloadList = PayloadTemplateHelper.getPayloadListFromTemplate( payloadTemplate, SessionManager.sessionData.dcdConfig.definitionPayloadTemplates );
        
        var INFO = PayloadTemplateHelper.getINFO( dateTimeObj, blockInfo );
        DevHelper.setINFO_ForConsoleDisplay( INFO ); 

        PayloadTemplateHelper.evalPayloads( payloadList, formsJson, formsJsonGroup, INFO );

        finalPayload = PayloadTemplateHelper.combinePayloads( payloadList );

    }
    catch( errMsg )
    {
        console.log( 'Error on PayloadTemplateHelper.generatePayload, errMsg: ' + errMsg );
    }

    return finalPayload;
};

PayloadTemplateHelper.getPayloadListFromTemplate = function( payloadTemplate, payloadTemplateDefs )
{
    var payloadList = [];

    if ( payloadTemplateDefs && payloadTemplateDefs.length > 0 )
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

                    console.log( 'payloadTemplateTemp - ' + payloadTemplateTemp );

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

PayloadTemplateHelper.getINFO = function( dateTimeObj, blockInfo )
{
    var INFO = {};
    
    // In config/payloadTemplat, we will use below info
    INFO.date = dateTimeObj;
    Util.mergeJson( INFO, SessionManager.sessionData ); // = { login_UserName: '',
    Util.mergeJson( INFO, blockInfo ); // activityType
    
    return INFO;
};


PayloadTemplateHelper.evalPayloads = function( payloadList, formsJson, formsJsonGroup, INFO )
{    
    for ( var i = 0; i < payloadList.length; i++ ) 
    {
        var payloadJson = payloadList[ i ];

        // Go through each line of config template strings and perform eval to set 
        PayloadTemplateHelper.traverseEval( payloadJson, payloadJson, formsJsonGroup, formsJson, INFO, 0, 30 );
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

PayloadTemplateHelper.traverseEval = function( obj, payloadJson, formsJsonGroup, formsJson, INFO, iDepth, limit )
{
    if ( iDepth === limit )
    {
        console.log( 'Error in PayloadTemplateHelper.traverseEval, Traverse depth limit has reached: ' + iDepth );
    }
    else
    {
        for ( var prop in obj ) 
        {
            var propVal = obj[prop];
    
            if ( typeof( propVal ) === "object" ) 
            {
                //console.log( prop, propVal );
                PayloadTemplateHelper.traverseEval( propVal, payloadJson, formsJsonGroup, formsJson, INFO, iDepth++, limit );
            }
            else if ( typeof( propVal ) === "string" ) 
            {
                //console.log( prop, propVal );
                try
                {
                    obj[prop] = eval( propVal );
                }
                catch( errMsg )
                {
                    console.log( 'Error on Json traverseEval, prop: ' + prop + ', propVal: ' + propVal + ', errMsg: ' + errMsg );
                }
            }
        }
    }
};	
