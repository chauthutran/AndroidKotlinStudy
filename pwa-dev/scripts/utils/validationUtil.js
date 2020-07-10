
function ValidationUtil() {};

ValidationUtil._DisableValidation = false;
ValidationUtil.cwsRenderObj;
ValidationUtil.COLOR_WARNING = "#f19c9c";


ValidationUtil.setCWSRenderObj = function( _cwsRenderObj )
{
    ValidationUtil.cwsRenderObj = _cwsRenderObj;
}


ValidationUtil.disableValidation = function( execFunc )
{
	ValidationUtil._DisableValidation = true;

	try
	{
		execFunc();
	}
	catch ( errMsg )
	{
		console.log( 'Error in ValidationUtil.disableValidation execute, errMsg: ' + errMsg );
	}

	ValidationUtil._DisableValidation = false;
};



// -------------------------------------------------------------------------------------------------------------------
// Methods for FORM
// -------------------------------------------------------------------------------------------------------------------


ValidationUtil.setUp_Events = function( formTag ) // setupEventsForForm
{
    // < change to find( '.dataValue' ) ?
    //formTag.find( "input,select,checkbox,textarea" ).each( function() {
        formTag.find( ".dataValue" ).each( function() {
            var inputTag = $( this );
            inputTag.change( function(){ //blur
                ValidationUtil.checkValidations( inputTag );
            });
        }); 
}

ValidationUtil.checkValidations = function( tag )
{	
    var valid = true;

    // TODO: Make 'skipValidation' a static/constant variable somewhere..
    //if ( tag.attr( 'skipValidation' ) !== 'true' )
    if ( !ValidationUtil._DisableValidation )
    {
        // Validation Initial Setting Clear
        tag.attr( 'valid', 'true' );

        var divFieldBlockTag = tag.closest( '.fieldBlock' );
        var divErrorMsgTargetTag = ( divFieldBlockTag.find( '.listWrapper' ).length > 0 ) ? divFieldBlockTag.find( '.listWrapper' ) : tag.parent();

        divFieldBlockTag.find( "div.errorMsg" ).remove();

        if ( divFieldBlockTag.is( ':visible' ) ) 
        {
            ValidationUtil.performValidationCheck( tag, 'mandatory', divErrorMsgTargetTag );
            ValidationUtil.performValidationCheck( tag, 'minlength', divErrorMsgTargetTag );
            ValidationUtil.performValidationCheck( tag, 'maxlength', divErrorMsgTargetTag );
            ValidationUtil.performValidationCheck( tag, 'maxvalue', divErrorMsgTargetTag );
            ValidationUtil.performValidationCheck( tag, 'isNumber', divErrorMsgTargetTag );
            ValidationUtil.performValidationCheck( tag, 'isDate', divErrorMsgTargetTag );
            ValidationUtil.performValidationCheck( tag, 'phoneNumber', divErrorMsgTargetTag );
            ValidationUtil.performValidationCheck( tag, 'patterns', divErrorMsgTargetTag );
        }

        // If not valid, set the background color.
        valid = ( tag.attr( 'valid' ) == 'true' );
        divFieldBlockTag.css( 'background-color', ( valid ) ? 'transparent' : ValidationUtil.COLOR_WARNING );
    }

    return valid;
};


ValidationUtil.performValidationCheck = function( tag, type, divTag )
{
    // check the type of validation (if exists in the tag attribute)
    // , and if not valid, set the tag as '"valid"=false' in the attribute
    var valid = true;
    var validationAttr = tag.attr( type );

    // If the validation attribute is present in the tag and not empty string or set to false
    if ( validationAttr && validationAttr !== 'false' )
    {
        if ( type == 'mandatory' ) valid = ValidationUtil.checkRequiredValue( tag, divTag, type );
        else if ( type == 'minlength' ) valid = ValidationUtil.checkValueLen( tag, divTag, 'min', Number( validationAttr ) );
        else if ( type == 'maxlength' ) valid = ValidationUtil.checkValueLen( tag, divTag, 'max', Number( validationAttr ) );
        else if ( type == 'maxvalue' ) valid = ValidationUtil.checkValueRange( tag, divTag, 0, Number( validationAttr ) );
        else if ( type == 'exactlength' ) valid = ValidationUtil.checkValueLen( tag, divTag, type, Number( validationAttr ) );
        else if ( type == 'isNumber' ) valid = ValidationUtil.checkNumberOnly( tag, divTag, type );
        else if ( type == 'isDate' ) valid = ValidationUtil.checkValidDate( tag, divTag, type );
        else if ( type == 'phoneNumber' ) valid = ValidationUtil.checkPhoneNumberValue( tag, divTag, type );
        else if ( type == 'patterns' ) valid = ValidationUtil.checkValue_RegxRules( tag, divTag, type );

        if ( !valid ) tag.attr( 'valid', false );
    }
};


ValidationUtil.checkFormEntryTagsData = function( formTag )
{	
    var allValid = true;

    // If any of the tag is not valid, mark it as invalid.
    //formTag.find( "input,select,checkbox,textarea" ).each( function() {
    formTag.find( ".dataValue" ).each( function() {
        if ( !ValidationUtil.checkValidations( $(this) ) )
        {
            allValid = false;
        }
    });

    return allValid;
};


// -------------------------------------------------------------------------------------------------------------------
// Methods for checking validation types
// -------------------------------------------------------------------------------------------------------------------

ValidationUtil.checkRequiredValue = function( inputTag, divTag, type )
{
    var valid = true;
    var value = inputTag.val();

    if( ! ValidationUtil.checkFalseEvalSpecialCase() && ( ! value || value == "" || value == null ) )
    {
        var message = ValidationUtil.getMessage( type, "This field is required" );
        divTag.append( ValidationUtil.getErrorSpanTag( message ) );
        valid = false;
    }
    
    return valid;
};


ValidationUtil.checkValueLen = function( inputTag, divTag, type, length )
{		
    var valid = true;
    var value = inputTag.val();
    
    if ( value && type == 'min' && value.length < length )
    {
        var message = ValidationUtil.getMessage( type, 'Please enter at least ' + length  + ' characters' );
        message = message.replace("$$length", length);
        divTag.append( ValidationUtil.getErrorSpanTag( message ) );

        valid = false;
    }
    else if ( value && type == 'max' && value.length > length )
    {
        var message = ValidationUtil.getMessage( type, 'Please enter at most ' + length + ' characters' );
        message = message.replace("$$length", length);
        divTag.append( ValidationUtil.getErrorSpanTag( message ) );
        
        valid = false;
    }
    else if ( value && type == 'exactlength' && value.length != length )
    {
        var message = ValidationUtil.getMessage( type, 'Please enter exactly ' + length + ' characters' );
        message = message.replace("$$length", length);
        divTag.append( ValidationUtil.getErrorSpanTag( message ) );
        
        valid = false;
    }
    

    return valid;
};


ValidationUtil.checkValueRange = function( inputTag, divTag, type, valFrom, valTo )
{
    var valid = true;
    var value = inputTag.val();
    
    if ( value && ( valFrom > value || valTo < value ) )
    {
        var message = ValidationUtil.getMessage( type, 'The value should be less than or equal to ' + valTo );
        message = message.replace("$$length", length);
        divTag.append( ValidationUtil.getErrorSpanTag( message ) );

        valid = false;
    }
    
    return valid;		
};

ValidationUtil.checkNumberOnly = function( inputTag, divTag, type )
{
    var valid = true;
    var value = inputTag.val();
    var reg = new RegExp( /^\d+$/ );

    if ( value && !reg.test( value ) )
    {
        var message = ValidationUtil.getMessage( type, 'Please enter number only' );
        divTag.append( ValidationUtil.getErrorSpanTag( message ) );
        
        valid = false;
    }
    
    return valid;		
};

ValidationUtil.checkValidDate = function( inputTag, divTag, type )
{
    var valid = true;
    var value = inputTag.val();
    var dateFormat = inputTag.attr( 'placeholder' );
    //var reg = new RegExp( /^\d+$/ );
    
    if ( dateFormat && dateFormat.length )
    {
        var dtm = new Date( value );

        if (Object.prototype.toString.call( dtm ) === "[object Date]") {
            // it is a date
            if ( isNaN( dtm.getTime() ) ) {  // d.valueOf() could also work
                // date is not valid
                var message = ValidationUtil.getMessage( type, 'Please enter valid date' );
                divTag.append( ValidationUtil.getErrorSpanTag( message ) );
                valid = false;
            } else {
                // date is valid
            }
            } else {
            // not a date
            var message = ValidationUtil.getMessage( type, 'Please enter valid date' );
            divTag.append( ValidationUtil.getErrorSpanTag( message ) );
            valid = false;
            }

    }

    return valid;	
}

ValidationUtil.checkPhoneNumberValue = function( inputTag, divTag, type )
{
    var valid = true;
    
    // Check if Phone number is in [ 12, 15 ]
    inputTag.attr( 'altval', '' );

    var validationInfo = ValidationUtil.phoneNumberValidation( inputTag.val() );		
    if ( !validationInfo.success ) 
    {
        divTag.append( ValidationUtil.getErrorSpanTag( validationInfo.msg ) );
        valid = false;			
    }
    else
    {
        // If valid phone number, put the converted phone number as attribute to be used later.
        inputTag.attr( 'altval', validationInfo.phoneNumber );
    }
    
    return valid;
};

ValidationUtil.checkValue_RegxRules = function( inputTag, divTag, type )
{
    var valid = true;

    var regxRulesStr = decodeURI( inputTag.attr( "patterns" ) );

    if ( regxRulesStr ) 
    {
        var regxRules = [];			
        regxRules = JSON.parse( regxRulesStr );
        var notFirstErr = false;

        for ( var i = 0; i < regxRules.length; i++ )
        {				
            try
            {
                var regxRuleJson = regxRules[i];

                var regexTest = new RegExp( regxRuleJson.pattern );

                if ( !regexTest.test( inputTag.val() ) )
                {
                    valid = false;
                    var startCommaStr = ( notFirstErr ) ? ", ": "";
                    divTag.append( ValidationUtil.getErrorSpanTag( startCommaStr + regxRuleJson.msg, regxRuleJson.term ) );
                    notFirstErr = true;
                }	
            }
            catch( ex )
            {
                console.log( 'rule regex check failed.. ' + ex );
            }
        }
    }

    return valid;
}


ValidationUtil.phoneNumberValidation = function( phoneVal )
{
    var success = false;
    var finalPhoneNumber = '';
    var msg = '';


    // Trim value
    var value = Util.trim( phoneVal );

    // Starts with '00'
    if ( Util.startsWith( value, "00" ) )
    {
        if ( !( value.length >= 12 && value.length <= 15 ) )
        {
            msg += ValidationUtil.getMessage( "phone9Len", 'Number should be 9 digits long (w/o country code' );
        }
        else
        {
            // convert first 00 to '+'
            finalPhoneNumber = '+' + value.substring( 2 );
            success = true;
        }
    }
    else if ( Util.startsWith( value, "06" ) || Util.startsWith( value, "07" ) )
    {
        if ( value.length != 10 )
        {
            msg += ValidationUtil.getMessage( "phoneStartWith", "Number should start with '+2588' or '002588'" );
        }
        else
        {
            var preVal = '';

            if ( Util.startsWith( value, "06" ) )
            {
                preVal = '+2556';
            }
            else if ( Util.startsWith( value, "07" ) )
            {
                preVal = '+2557';
            }

            finalPhoneNumber = preVal + value.substring( 2 );
            success = true;
        }
    }
    else
    {
        msg += ValidationUtil.getMessage( "phoneStartWith", "Number should start with '+2588' or '002588'" );
    }

    
    return { 'success': success, 'phoneNumber': finalPhoneNumber, 'msg': msg };	
}

	
// -------------------------------------------------------------------------------------------------------------------
// Supportive methods
// -------------------------------------------------------------------------------------------------------------------

ValidationUtil.getMessage = function( type, defaultMessage )
{
    var message = ConfigManager.getConfigJson().definitionMessages[type];
    if( message === undefined )
    {
        message = defaultMessage;
    }
    
    if( message === undefined )
    {
        message = "The value is violated the rule " + type;
    }

    return message;
};


ValidationUtil.getErrorSpanTag = function( keyword, term )
{
    var text = ValidationUtil.cwsRenderObj.langTermObj.translateText( keyword, term ); // + optionalStr;
    var dvContainer = $( '<div class="errorMsg" /> ' );
    var errorMsg = $( '<div class="errorMsgText" keyword="' + keyword + '" term="' + term + '" > ' + text + ' </div>' );
    var arrow = $( '<div class="errorMsgArrow">&nbsp;</span>' );

    dvContainer.append( errorMsg, arrow );

    return dvContainer;
};


ValidationUtil.clearTagValidations = function( tags )
{
    tags.css( "background-color", "" ).val( "" ).attr( "altval", "" );
    
    tags.each( function() {
        $( this ).closest( "div" ).find( "div.errorMsg" ).remove();
    });		
};	


// Some values like string 'false', 'NaN', '-0' '+0' are evaluated as false.
ValidationUtil.checkFalseEvalSpecialCase = function( value ) {
    return ( value !== undefined && value != null && value.length > 0 );
};

