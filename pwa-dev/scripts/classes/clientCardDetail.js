// -------------------------------------------
// -- ClientCardDetail Class/Methods
// 
//      - When clicking on the clientCard body
//          - Create this class (new) and call 'render' of the instance.
//
//      ** This could be static class.  Since always run as

function ClientCardDetail( _clientJsonFormTag, _clientJson, _cwsRenderObj, _blockObj )
{
	var me = this;

    me.clientJsonFormTag = _clientJsonFormTag;
    me.clientJson = _clientJson;
    me.cwsRenderObj = _cwsRenderObj;
    me.blockObj = _blockObj;

    // me.clientJsonFormTag = $( '<div class="tab_fs__container" />');

	// ===============================================
	// === Initialize Related ========================

    me.initialize = function() 
    { 
        // Setup event here?  or on Render?

        me.render( me.clientJsonFormTag, me.clientJson );
    };


    // ----------------------------------------------------

    me.render = function( clientJsonFormTag, clientJson )
    {  
        try
        {
            me.renderForm( clientJsonFormTag, clientJson );
            me.renderButtons( clientJsonFormTag );

            me.disableForm( clientJsonFormTag, true );

            me.setup_Events( clientJsonFormTag );
        }
        catch( errMsg )
        {
            console.customLog( 'Error on ClientCardDetails.render, errMsg: ' + errMsg );
        }

    };


    me.renderForm = function( clientJsonFormTag, clientJson )
    {
        var formTag = $("<form></form>");

        // Create id field
        var fieldTag = $(Templates.inputFieldStandard);
        fieldTag.find(".displayName").html( "id" );
        fieldTag.find(".field__left").append( "<input readonly='readonly' disabled value='" + clientJson._id + "' name='id' class='dataValue displayValue'>" );
        formTag.append( fieldTag );


        // Create details fields
        var clientDetails = clientJson.clientDetails;
        for ( var key in clientDetails ) 
        {
            var fieldName = key;
            var fieldValue = me.getFieldOption_LookupValue( key, clientDetails[ key ] );
        
            // Create field
            var fieldTag = $(Templates.inputFieldStandard);
            fieldTag.find(".displayName").html( fieldName );
            fieldTag.find(".field__left").append( "<input value='" + Util.getJsonStr( fieldValue ) + "' name='" + fieldName + "' class='dataValue displayValue'>" );
    
            formTag.append( fieldTag );

            if( ClientCardDetail.NOT_ALLOW_EDIT_FIELDS.indexOf( fieldName ) >= 0 )
            {
                fieldTag.hide();
            }
        }

        clientJsonFormTag.append( formTag );
    }

    me.renderButtons = function( clientJsonFormTag )
    {
        var buttonsTag = $("<div class='button primary button-full_width textButton'>");

        // Edit button
        buttonsTag.append("<div class='button__container' id='editBtn'><div class='button-label'>Edit</div></div>");
        // Save button
        buttonsTag.append("<div class='button__container' id='saveBtn'><div class='button-label'>Save</div></div>");

        
        clientJsonFormTag.append( buttonsTag );
    }


    me.setup_Events = function( clientJsonFormTag )
    {
        clientJsonFormTag.find("#editBtn").click( function(){
            me.disableForm( me.clientJsonFormTag, false );
        });

        clientJsonFormTag.find("#saveBtn").click( function(){
            // TODO : Generate json and add to activity list of this client
            var actionObj = new Action( me.cwsRenderObj, me.blockObj );

            var actionDef = ConfigManager.getConfigJson().definitionActions["action_ws_clientUpdate"];
            var blockDivTag = $("[blockid='tab_clientDetails']");
            var formDivSecTag = $("[blockid='tab_clientDetails']");
            var btnTag = $(this);
            var dataPass = {};
            var blockPassingData = { "hideCase": undefined, "showCase": undefined };
            actionObj.actionPerform( actionDef, blockDivTag, formDivSecTag, btnTag, dataPass, blockPassingData, function(){

                // Disable form after saving
                me.disableForm( me.clientJsonFormTag, true );

                alert( "Edit successfully !");
            } );

        });
    }

    // ---------------------------------------------------------------------------------------------------------------------
    // Supportive methods

    me.disableForm = function( clientJsonFormTag, isDisable )
    {
        // INPUTs in Form
        clientJsonFormTag.find("form").find("input,select,textarea").each( function(){
            Util.disableTag( $(this), isDisable );
        });
        
        // Buttons
        var editBtnTag = clientJsonFormTag.find("#editBtn");
        var saveBtnTag =  clientJsonFormTag.find("#saveBtn");
        if( isDisable )
        {
            editBtnTag.show();
            saveBtnTag.hide();
        }
        else
        {
            editBtnTag.hide();
            saveBtnTag.show();
        }
        
    }

    
    // TODO: THIS SHOULD BE MOVED TO 'Option' statis class.. part..
    me.getFieldOption_LookupValue = function( key, val )
    {
        var fieldOptions = me.getFieldOptions( key );
        var retValue = val;

        // If the field is in 'definitionFields' & the field def has 'options' name, get the option val.
        try
        {
            if ( fieldOptions )
            {
                var matchingOption = Util.getFromList( fieldOptions, val, "value" );
    
                if ( matchingOption )
                {
                    retValue = ( matchingOption.term ) ? TranslationManager.translateText( matchingOption.defaultName, matchingOption.term ) : matchingOption.defaultName;
                }
            }    
        }
        catch( errMsg )
        {
            console.customLog( 'ERROR in ClientCardDetails.getFieldOption_LookupValue, errMsg: ' + errMsg );
        }

        return retValue;
    };

    me.getFieldOptions = function( fieldId )
    {
        var defFields = ConfigManager.getConfigJson().definitionFields;
        var defOptions = ConfigManager.getConfigJson().definitionOptions;

        var matchingOptions;
        var optionsName;

        // 1. Check if the field is defined in definitionFields & has 'options' field for optionsName used.
        if ( defFields )
        {
            var matchField = Util.getFromList( defFields, fieldId, "id" );

            if ( matchField && matchField.options )
            {
                optionsName =  matchField.options;
            }
        }

        // 2. Get options by name.
        if ( optionsName && defOptions )
        {
            matchingOptions = defOptions[ optionsName ];
        }

        return matchingOptions;
    };

   
    
    // -----------------------------------------------------


    // =============================================
    // === Run initialize - when instantiating this class  ========================
        
    me.initialize();

}

ClientCardDetail.NOT_ALLOW_EDIT_FIELDS = [ "country", "activeUsers", "countryType", "voucherCodes", "creditedUsers", "voucherCode", "clientId" ];