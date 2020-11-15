
function Validation() {};

Validation._DisableValidation = false;
Validation.COLOR_WARNING = "#f19c9c";


Validation.disableValidation = function( execFunc )
{
	Validation._DisableValidation = true;

	try
	{
		execFunc();
	}
	catch ( errMsg )
	{
		console.customLog( 'Error in Validation.disableValidation execute, errMsg: ' + errMsg );
	}

	Validation._DisableValidation = false;
};



// -------------------------------------------------------------------------------------------------------------------
// Methods for FORM
// -------------------------------------------------------------------------------------------------------------------


Validation.setUp_Events = function( formTag ) // setupEventsForForm
{
    // < change to find( '.dataValue' ) ?
    //formTag.find( "input,select,checkbox,textarea" ).each( function() {
        formTag.find( ".dataValue" ).each( function() {
            var inputTag = $( this );
            inputTag.change( function(){ //blur
                Validation.checkValidations( inputTag );
            });
        }); 
}

Validation.checkValidations = function( tag )
{	
    var valid = true;

    // TODO: Make 'skipValidation' a static/constant variable somewhere..
    //if ( tag.attr( 'skipValidation' ) !== 'true' )
    if ( !Validation._DisableValidation )
    {
        // Validation Initial Setting Clear
        tag.attr( 'valid', 'true' );

        var divFieldBlockTag = tag.closest( '.fieldBlock' );
        var divErrorMsgTargetTag = ( divFieldBlockTag.find( '.listWrapper' ).length > 0 ) ? divFieldBlockTag.find( '.listWrapper' ) : tag.parent();

        divFieldBlockTag.find( "div.errorMsg" ).remove();

        if ( divFieldBlockTag.is( ':visible' ) ) 
        {
            Validation.performValidationCheck( tag, 'mandatory', divErrorMsgTargetTag );
            Validation.performValidationCheck( tag, 'minlength', divErrorMsgTargetTag );
            Validation.performValidationCheck( tag, 'maxlength', divErrorMsgTargetTag );
            Validation.performValidationCheck( tag, 'maxvalue', divErrorMsgTargetTag );
            Validation.performValidationCheck( tag, 'isNumber', divErrorMsgTargetTag );
            Validation.performValidationCheck( tag, 'isDate', divErrorMsgTargetTag );
            Validation.performValidationCheck( tag, 'phoneNumber', divErrorMsgTargetTag );
            Validation.performValidationCheck( tag, 'patterns', divErrorMsgTargetTag );
        }

        // If not valid, set the background color.
        valid = ( tag.attr( 'valid' ) == 'true' );
        divFieldBlockTag.css( 'background-color', ( valid ) ? 'transparent' : Validation.COLOR_WARNING );
    }

    return valid;
};


Validation.performValidationCheck = function( tag, type, divTag )
{
    // check the type of validation (if exists in the tag attribute)
    // , and if not valid, set the tag as '"valid"=false' in the attribute
    var valid = true;
    var validationAttr = tag.attr( type );

    // If the validation attribute is present in the tag and not empty string or set to false
    if ( validationAttr && validationAttr !== 'false' )
    {
        if ( type == 'mandatory' ) valid = Validation.checkRequiredValue( tag, divTag, type );
        else if ( type == 'minlength' ) valid = Validation.checkValueLen( tag, divTag, 'min', Number( validationAttr ) );
        else if ( type == 'maxlength' ) valid = Validation.checkValueLen( tag, divTag, 'max', Number( validationAttr ) );
        else if ( type == 'maxvalue' ) valid = Validation.checkValueRange( tag, divTag, 0, Number( validationAttr ) );
        else if ( type == 'exactlength' ) valid = Validation.checkValueLen( tag, divTag, type, Number( validationAttr ) );
        else if ( type == 'isNumber' ) valid = Validation.checkNumberOnly( tag, divTag, type );
        else if ( type == 'isDate' ) valid = Validation.checkValidDate( tag, divTag, type );
        else if ( type == 'phoneNumber' ) valid = Validation.checkPhoneNumberValue( tag, divTag, type );
        else if ( type == 'patterns' ) valid = Validation.checkValue_RegxRules( tag, divTag, type );

        if ( !valid ) tag.attr( 'valid', false );
    }
};


Validation.checkFormEntryTagsData = function( formTag, optionStr )
{	
    var allValid = true;

    // If any of the tag is not valid, mark it as invalid.
    //formTag.find( "input,select,checkbox,textarea" ).each( function() {
    formTag.find( ".dataValue" ).each( function() 
    {
        if ( !Validation.checkValidations( $(this) ) ) allValid = false;
    });


    if ( !allValid )
    {
        if ( optionStr === 'showMsg' ) MsgManager.msgAreaShow( '<span term="' + ConfigManager.getSettingsTermId( "formValidationMsgTerm" ) + '">Validation Note: Review input fields.</span>', 'ERROR' );
    }

    return allValid;
};


// -------------------------------------------------------------------------------------------------------------------
// Methods for checking validation types
// -------------------------------------------------------------------------------------------------------------------

Validation.checkRequiredValue = function( inputTag, divTag, type )
{
    var valid = true;
    var value = inputTag.val();

    if( ! Validation.checkFalseEvalSpecialCase() && ( ! value || value == "" || value == null ) )
    {
        var message = Validation.getMessage( type, "This field is required" );
        divTag.append( Validation.getErrorSpanTag( message ) );
        valid = false;
    }
    
    return valid;
};


Validation.checkValueLen = function( inputTag, divTag, type, length )
{		
    var valid = true;
    var value = inputTag.val();
    
    if ( value && type == 'min' && value.length < length )
    {
        var message = Validation.getMessage( type, 'Please enter at least ' + length  + ' characters' );
        message = message.replace("$$length", length);
        divTag.append( Validation.getErrorSpanTag( message ) );

        valid = false;
    }
    else if ( value && type == 'max' && value.length > length )
    {
        var message = Validation.getMessage( type, 'Please enter at most ' + length + ' characters' );
        message = message.replace("$$length", length);
        divTag.append( Validation.getErrorSpanTag( message ) );
        
        valid = false;
    }
    else if ( value && type == 'exactlength' && value.length != length )
    {
        var message = Validation.getMessage( type, 'Please enter exactly ' + length + ' characters' );
        message = message.replace("$$length", length);
        divTag.append( Validation.getErrorSpanTag( message ) );
        
        valid = false;
    }
    

    return valid;
};


Validation.checkValueRange = function( inputTag, divTag, type, valFrom, valTo )
{
    var valid = true;
    var value = inputTag.val();
    
    if ( value && ( valFrom > value || valTo < value ) )
    {
        var message = Validation.getMessage( type, 'The value should be less than or equal to ' + valTo );
        message = message.replace("$$length", length);
        divTag.append( Validation.getErrorSpanTag( message ) );

        valid = false;
    }
    
    return valid;		
};

Validation.checkNumberOnly = function( inputTag, divTag, type )
{
    var valid = true;
    var value = inputTag.val();
    var reg = new RegExp( /^\d+$/ );

    if ( value && !reg.test( value ) )
    {
        var message = Validation.getMessage( type, 'Please enter number only' );
        divTag.append( Validation.getErrorSpanTag( message ) );
        
        valid = false;
    }
    
    return valid;		
};

Validation.checkValidDate = function( inputTag, divTag, type )
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
                var message = Validation.getMessage( type, 'Please enter valid date' );
                divTag.append( Validation.getErrorSpanTag( message ) );
                valid = false;
            } else {
                // date is valid
            }
            } else {
            // not a date
            var message = Validation.getMessage( type, 'Please enter valid date' );
            divTag.append( Validation.getErrorSpanTag( message ) );
            valid = false;
            }

    }

    return valid;	
}

Validation.checkPhoneNumberValue = function( inputTag, divTag, type )
{
    var valid = true;
    
    // Check if Phone number is in [ 12, 15 ]
    inputTag.attr( 'altval', '' );

    var validationInfo = Validation.phoneNumberValidation( inputTag.val() );		
    if ( !validationInfo.success ) 
    {
        divTag.append( Validation.getErrorSpanTag( validationInfo.msg ) );
        valid = false;			
    }
    else
    {
        // If valid phone number, put the converted phone number as attribute to be used later.
        inputTag.attr( 'altval', validationInfo.phoneNumber );
    }
    
    return valid;
};

Validation.checkValue_RegxRules = function( inputTag, divTag, type )
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
                    divTag.append( Validation.getErrorSpanTag( startCommaStr + regxRuleJson.msg, regxRuleJson.term ) );
                    notFirstErr = true;
                }	
            }
            catch( ex )
            {
                console.customLog( 'rule regex check failed.. ' + ex );
            }
        }
    }

    return valid;
}


Validation.phoneNumberValidation = function( phoneVal )
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
            msg += Validation.getMessage( "phone9Len", 'Number should be 9 digits long (w/o country code' );
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
            msg += Validation.getMessage( "phoneStartWith", "Number should start with '+2588' or '002588'" );
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
        msg += Validation.getMessage( "phoneStartWith", "Number should start with '+2588' or '002588'" );
    }

    
    return { 'success': success, 'phoneNumber': finalPhoneNumber, 'msg': msg };	
}

	
// -------------------------------------------------------------------------------------------------------------------
// Supportive methods
// -------------------------------------------------------------------------------------------------------------------

Validation.getMessage = function( type, defaultMessage )
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


Validation.getErrorSpanTag = function( keyword, term )
{
    var text = TranslationManager.translateText( keyword, term ); // + optionalStr;
    var dvContainer = $( '<div class="errorMsg" /> ' );
    var errorMsg = $( '<div class="errorMsgText" keyword="' + keyword + '" term="' + term + '" > ' + text + ' </div>' );
    var arrow = $( '<div class="errorMsgArrow">&nbsp;</span>' );

    dvContainer.append( errorMsg, arrow );

    return dvContainer;
};


Validation.clearTagValidations = function( tags )
{
    tags.css( "background-color", "" ).val( "" ).attr( "altval", "" );
    
    tags.each( function() {
        $( this ).closest( "div" ).find( "div.errorMsg" ).remove();
    });		
};	


// Some values like string 'false', 'NaN', '-0' '+0' are evaluated as false.
Validation.checkFalseEvalSpecialCase = function( value ) {
    return ( value !== undefined && value != null && value.length > 0 );
};

