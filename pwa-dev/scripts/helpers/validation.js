
function Validation() {};

Validation._DisableValidation = false;
Validation.COLOR_WARNING = '#f19c9c';
Validation.DATE_FORMAT = 'YYYY-MM-DD';
Validation.TIME_FORMAT = 'HH:mm';

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
};

Validation.checkValidations = function( tag )
{	
    var valid = true;

    if ( !Validation._DisableValidation )
    {
        // If 'forceValid' false case, skip the validation and set it as false..
        var forceValid = tag.attr( 'forceValid' );
        if ( forceValid === 'false' ) valid = false;
        else
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
                Validation.performValidationCheck( tag, 'isTime', divErrorMsgTargetTag );
                Validation.performValidationCheck( tag, 'phoneNumber', divErrorMsgTargetTag );

                Validation.performValidationCheck( tag, 'dateRange', divErrorMsgTargetTag );
                Validation.performValidationCheck( tag, 'pickerDateRange', divErrorMsgTargetTag );
                Validation.performValidationCheck( tag, 'patterns', divErrorMsgTargetTag );

                // Default Universal checks..
                Validation.performValidationCheck( tag, 'doubleQuote', divErrorMsgTargetTag, true );
            }

            // If not valid, set the background color.
            valid = ( tag.attr( 'valid' ) == 'true' );

            if ( valid )
            {
                divFieldBlockTag.css( 'background-color', '' );
            }
            else
            {
                divFieldBlockTag.css( 'background-color', Validation.COLOR_WARNING );
            }            
        }
    }

    return valid;
};


// Force the tag validation - UseCase: call from countryConfig eval forcing invalid
Validation.setTagValidation = function( tag, valid )
{	
    var divFieldBlockTag = tag.closest( '.fieldBlock' );

    if ( valid )
    {
        tag.attr( 'valid', 'true' );
        tag.attr( 'forceValid', 'true' );
        divFieldBlockTag.css( 'background-color', '' );
    }
    else
    {
        tag.attr( 'valid', 'false' );
        tag.attr( 'forceValid', 'false' );
        divFieldBlockTag.css( 'background-color', Validation.COLOR_WARNING );
    }
};


Validation.performValidationCheck = function( tag, type, divTag, alwaysRun )
{
    // check the type of validation (if exists in the tag attribute)
    // , and if not valid, set the tag as '"valid"=false' in the attribute
    var valid = true;
    var validationAttr = tag.attr( type );

    // If the validation attribute is present in the tag and not empty string or set to false
    if ( ( validationAttr && validationAttr !== 'false' ) || alwaysRun )
    {
        var prev_valid = ( tag.attr( 'valid' ) === 'true' );

        if ( type == 'mandatory' ) valid = Validation.checkRequiredValue( tag, divTag, type );
        else if ( type == 'minlength' ) valid = Validation.checkValueLen( tag, divTag, 'min', Number( validationAttr ) );
        else if ( type == 'maxlength' ) valid = Validation.checkValueLen( tag, divTag, 'max', Number( validationAttr ) );
        else if ( type == 'maxvalue' ) valid = Validation.checkValueRange( tag, divTag, 0, Number( validationAttr ) );
        else if ( type == 'exactlength' ) valid = Validation.checkValueLen( tag, divTag, type, Number( validationAttr ) );
        else if ( type == 'isNumber' ) valid = Validation.checkNumberOnly( tag, divTag, type );
        else if ( type == 'isDate' ) valid = Validation.checkValidDate( tag, divTag, type );
        else if ( type == 'isTime' ) valid = Validation.checkValidTime( tag, divTag, type );
        else if ( type == 'phoneNumber' ) valid = Validation.checkPhoneNumberValue( tag, divTag, type );

        else if ( type == 'dateRange' ) valid = Validation.checkDateRange( tag, divTag, type, validationAttr, prev_valid );
        else if ( type == 'pickerDateRange' ) valid = Validation.checkValue_pickerDateRange( tag, divTag, type, prev_valid );
        else if ( type == 'patterns' ) valid = Validation.checkValue_RegxRules( tag, divTag, type );

        else if ( type == 'doubleQuote' ) valid = Validation.checkValue_DoubleQuote( tag, divTag, type );

        if ( !valid ) tag.attr( 'valid', false );
    }
};


// Called by Button click - for checking all fields valication on the form 
Validation.checkFormEntryTagsData = function( formTag, optionStr )
{	
    var allValid = true;

    // If any of the tag is not valid, mark it as invalid.
    //formTag.find( "input,select,checkbox,textarea" ).each( function() {
    formTag.find( ".dataValue" ).each( function() 
    {
        if ( !Validation.checkValidations( $( this ) ) ) allValid = false;
    });


    if ( !allValid )
    {
        // we need to confirm that TranslationManager.translatePage() is being called after loading this
        if ( optionStr === 'showMsg' ) MsgManager.msgAreaShow( '<span term="msgNotif_formValidation">Validation Note: Review input fields.</span>', 'ERROR' );
        //if ( optionStr === 'showMsg' ) MsgManager.msgAreaShow( '<span term="' + ConfigManager.getSettingsTermId( "formValidationMsgTerm" ) + '">Validation Note: Review input fields.</span>', 'ERROR' );
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
        divTag.append( Validation.getErrorSpanTag( message, 'validationMsg_' + type ) );
        valid = false;
    }
    
    return valid;
};


Validation.checkValueLen = function( inputTag, divTag, type, length )
{		
    var valid = true;
    var value = inputTag.val();
    var term = 'validationMsg_' + type;

    if ( value && type == 'min' && value.length < length )
    {
        var message = Validation.getMessage( type, 'Please enter at least ' + length  + ' characters' );
        //message = message.replace("$$length", length);
        divTag.append( Validation.getErrorSpanTag( message, term, function( text ) { return text.replace( "$$length", length ); } ) );

        valid = false;
    }
    else if ( value && type == 'max' && value.length > length )
    {
        var message = Validation.getMessage( type, 'Please enter at most ' + length + ' characters' );
        //message = message.replace("$$length", length);
        divTag.append( Validation.getErrorSpanTag( message, term, function( text ) { return text.replace( "$$length", length ); } ) );
        
        valid = false;
    }
    else if ( value && type == 'exactlength' && value.length != length )
    {
        var message = Validation.getMessage( type, 'Please enter exactly ' + length + ' characters' );
        //message = message.replace("$$length", length);
        divTag.append( Validation.getErrorSpanTag( message, term, function( text ) { return text.replace( "$$length", length ); } ) );
        
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

        divTag.append( Validation.getErrorSpanTag( message, 'validationMsg_' + type, function( text ) { return text.replace("$$value", valTo ); } ) );

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
        divTag.append( Validation.getErrorSpanTag( message, 'validationMsg_' + type ) );
        
        valid = false;
    }
    
    return valid;		
};


// Check with 'YYYY-MM-DD' format (starting..)
Validation.checkValidDate = function( inputTag, divTag, type )
{
    var valid = true;
    var value = inputTag.val();

    try
    {
        if ( value !== '' )  // allow empty value as valid time format.  mandatory should handle validation seperately
        {
            valid = moment( value, Validation.DATE_FORMAT, true ).isValid();

            if ( !valid )
            {
                var message = Validation.getMessage( type, 'Please enter valid date' );
                divTag.append( Validation.getErrorSpanTag( message, 'validationMsg_' + type ) );
            }    
        }
    }
    catch( errMsg )
    {
        console.log( 'ERROR in Validation.checkValidDate(), errMsg: ' + errMsg );
    }

    return valid;	
};


// Check with 'HH:mm' format (starting..)
Validation.checkValidTime = function( inputTag, divTag, type )
{
    var valid = true;
    var value = inputTag.val();

    try
    {
        if ( value !== '' )  // allow empty value as valid time format.  mandatory should handle validation seperately
        {
            valid = moment( value, Validation.TIME_FORMAT, true ).isValid();

            if ( !valid )
            {
                var message = Validation.getMessage( type, 'Please enter valid time' );
                divTag.append( Validation.getErrorSpanTag( message, 'validationMsg_' + type ) );
            }        
        }
    }
    catch( errMsg )
    {
        console.log( 'ERROR in Validation.checkValidTime(), errMsg: ' + errMsg );
    }

    return valid;	
};


Validation.checkPhoneNumberValue = function( inputTag, divTag, type )
{
    var valid = true;
    
    // Check if Phone number is in [ 12, 15 ]
    inputTag.attr( 'altval', '' );

    var validationInfo = Validation.phoneNumberValidation( inputTag.val() );		
    if ( !validationInfo.success ) 
    {
        divTag.append( Validation.getErrorSpanTag( validationInfo.msg, validationInfo.term ) );
        valid = false;			
    }
    else
    {
        // If valid phone number, put the converted phone number as attribute to be used later.
        inputTag.attr( 'altval', validationInfo.phoneNumber );
    }
    
    return valid;
};


// Create a method to handle the 'dateRange' rule value '2020-01-01 ~ 2021-11-15'
Validation.checkDateRange = function( inputTag, divTag, type, attrVal, prev_valid )
{
    var valid = true;
    var value = inputTag.val();
    var valueDate;

    try
    {
        // If previous check were not valid, do not check for this DateRange.  Not valid dates should not check dateRange.
        if ( prev_valid )
        {
            if ( value ) valueDate = new Date( value );
            attrVal = Util.trim( attrVal );
    
            if ( valueDate && attrVal )
            {
                // get From Date
                var dateFromStr = '';
                var dateToStr = '';
                var dateFrom;
                var dateTo;
                var attrValArr = attrVal.split( "~" );
    
                if ( attrValArr.length >= 1 ) dateFromStr = Util.trim( attrValArr[0] );
                if ( attrValArr.length >= 2 ) dateToStr = Util.trim( attrValArr[1] );
    
                if ( dateFromStr ) dateFrom = new Date( dateFromStr );
                if ( dateToStr ) dateTo = new Date( dateToStr );
                
                // Finally, check the date against dateFrom/To.
                if ( dateFrom && valueDate < dateFrom ) valid = false;
                if ( dateTo && valueDate > dateTo ) valid = false;
    
                if ( !valid )
                {
                    var message = Validation.getMessage( type, 'Please enter valid date range: ' + attrVal );
                    divTag.append( Validation.getErrorSpanTag( message, 'validationMsg_' + type ) );
                }    
            }
        }
    }
    catch( errMsg )
    {
        console.log( 'ERROR in Validation.checkDateRange(), errMsg: ' + errMsg );
    }
    
    return valid;		
};


Validation.checkValue_pickerDateRange = function( inputTag, divTag, type, prev_valid )
{
    var valid = true;
    var value = inputTag.val();
    var valueDate;

    try
    {
        if ( prev_valid )
        {
            if ( value ) valueDate = new Date( value );    

            var pickerDateRangeStr = decodeURI( inputTag.attr( "pickerDateRange" ) );

            if ( pickerDateRangeStr && valueDate ) 
            {
                var dRangeJson = JSON.parse( pickerDateRangeStr );                
                var dateFrom;
                var dateTo;

                if ( dRangeJson.dateFrom ) dateFrom = FormUtil.getCustomDate( dRangeJson.dateFrom );
                if ( dRangeJson.dateTo ) dateTo = FormUtil.getCustomDate( dRangeJson.dateTo );
                
                // Finally, check the date against dateFrom/To.
                if ( dateFrom && valueDate < dateFrom ) valid = false;
                if ( dateTo && valueDate > dateTo ) valid = false;

                // If not valid, display error msg.
                if ( !valid ) divTag.append( Validation.getErrorSpanTag( dRangeJson.msg, dRangeJson.term ) );
            }            
        }
    }
    catch( errMsg )
    {
        console.log( 'ERROR in Validation.checkValue_pickerDateRange(), errMsg: ' + errMsg );
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


Validation.checkValue_DoubleQuote = function( inputTag, divTag, type )
{
    var valid = true;
    var value = inputTag.val();

    if ( value && value.indexOf( '"' ) >= 0 )
    {
        var message = Validation.getMessage( type, 'Please do not enter double quote in value' );
        divTag.append( Validation.getErrorSpanTag( message, 'validationMsg_' + type ) );
        
        valid = false;
    }
    
    return valid;		
};


Validation.phoneNumberValidation = function( phoneVal )
{
    var success = false;
    var finalPhoneNumber = '';
    var msg = '';
    var type = '';

    // Trim value
    var value = Util.trim( phoneVal );

    // Starts with '00'
    if ( Util.startsWith( value, "00" ) )
    {
        if ( !( value.length >= 12 && value.length <= 15 ) )
        {
            type = "phone9Len";
            msg += Validation.getMessage( type, 'Number should be 9 digits long (w/o country code' );
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
            type = "phoneStartWith";
            msg += Validation.getMessage( type, "Number should start with '+2588' or '002588'" );
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
        type = "phoneStartWith";
        msg += Validation.getMessage( type, "Number should start with '+2588' or '002588'" );
    }

    
    return { 'success': success, 'phoneNumber': finalPhoneNumber, 'msg': msg, 'term': 'validationMsg_' + type };	
};

	
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


Validation.getErrorSpanTag = function( keyword, term, modifyFunc )
{
    var text = TranslationManager.translateText( keyword, term ); // + optionalStr;

    if ( modifyFunc ) text = modifyFunc( text );
    // optionally modigy below text?

    var dvContainer = $( '<div class="errorMsg" /> ' );
    var errorMsg = $( '<div class="errorMsgText" keyword="' + keyword + '" termRef="' + term + '"> ' + text + ' </div>' );
    //var errorMsg = $( '<div class="errorMsgText" keyword="' + keyword + '" term="' + term + '" > ' + text + ' </div>' );
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

