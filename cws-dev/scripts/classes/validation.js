// This could be static class - Need to set it up for 'cwsRenderObj' after cwsRenderObj
function Validation( cwsRenderObj ) //, blockObj, pageTag )
{
	var me = this;

	me.cwsRenderObj = cwsRenderObj;
	//me.blockObj = blockObj;
	//me.pageTag = pageTag;

	me.COLOR_WARNING = "#f19c9c";
	
	// ------------------------------------

    me.setUp_Events = function( formTag )
    {
		// < change to find( '.dataValue' ) ?
        //formTag.find( "input,select,checkbox,textarea" ).each( function() {
		formTag.find( ".dataValue" ).each( function() {
            var inputTag = $( this );
            inputTag.change( function(){ //blur
                me.checkValidations( inputTag );
            });
		});
    };

	// ================================
	// == Tag Validations
	
	me.checkFormEntryTagsData = function( formTag )
	{	
		var allValid = true;

		// If any of the tag is not valid, mark it as invalid.
		//formTag.find( "input,select,checkbox,textarea" ).each( function() {
		formTag.find( ".dataValue" ).each( function() {
			if ( !me.checkValidations( $(this) ) )
			{
				allValid = false;
			}
		});

		return allValid;
	};

	me.checkValidations = function( tag )
	{	
		// Validation Initial Setting Clear
		tag.attr( 'valid', 'true' );

		var divTag = tag.parent(); //.closest( "div" ).parent();  //( "div" );
		var validationTag = ( tag.hasClass( 'displayValue' ) ? tag : tag.parent() );

		divTag.find( "div.errorMsg" ).remove();

		//if ( tag.is( ':visible' ) || tag.hasClass( 'MULTI_CHECKBOX' ) || tag.hasClass( 'RADIO' )  )
		//{
			me.performValidationCheck( tag, 'mandatory', divTag );
			me.performValidationCheck( tag, 'minlength', divTag );
			me.performValidationCheck( tag, 'maxlength', divTag );
			me.performValidationCheck( tag, 'maxvalue', divTag );
			me.performValidationCheck( tag, 'isNumber', divTag );
			me.performValidationCheck( tag, 'isDate', divTag );
			me.performValidationCheck( tag, 'phoneNumber', divTag );
			me.performValidationCheck( tag, 'patterns', divTag );
		//}

		// If not valid, set the background color.
		var valid = ( tag.attr( 'valid' ) == 'true' );

		//tag.css( 'background-color', ( ( valid ) ? '' : me.COLOR_WARNING ) );
		validationTag.css( 'background-color', ( ( valid ) ? '' : me.COLOR_WARNING ) );

		return valid;
	};
	
	me.performValidationCheck = function( tag, type, divTag )
	{		
		// check the type of validation (if exists in the tag attribute)
		// , and if not valid, set the tag as '"valid"=false' in the attribute
		var valid = true;
		var validationAttr = tag.attr( type );

		// If the validation attribute is present in the tag and not empty string or set to false
		if ( validationAttr && validationAttr !== 'false' )
		{
			if ( type == 'mandatory' ) valid = me.checkRequiredValue( tag, divTag, type );
			else if ( type == 'minlength' ) valid = me.checkValueLen( tag, divTag, 'min', Number( validationAttr ) );
			else if ( type == 'maxlength' ) valid = me.checkValueLen( tag, divTag, 'max', Number( validationAttr ) );
			else if ( type == 'maxvalue' ) valid = me.checkValueRange( tag, divTag, 0, Number( validationAttr ) );
			else if ( type == 'exactlength' ) valid = me.checkValueLen( tag, divTag, type, Number( validationAttr ) );
			else if ( type == 'isNumber' ) valid = me.checkNumberOnly( tag, divTag, type );
			else if ( type == 'isDate' ) valid = me.checkValidDate( tag, divTag, type );
			else if ( type == 'phoneNumber' ) valid = me.checkPhoneNumberValue( tag, divTag, type );
			else if ( type == 'patterns' ) valid = me.checkValue_RegxRules( tag, divTag, type );

			if ( !valid ) tag.attr( 'valid', false );
		}
	};
	
	
	me.getMessage = function( type, defaultMessage )
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

	// ------------------------------
	// -- Each type validation

	me.checkRequiredValue = function( inputTag, divTag, type )
	{
		var valid = true;
		var value = inputTag.val();

		if( ! me.checkFalseEvalSpecialCase() && ( ! value || value == "" || value == null ) )
		{
			var message = me.getMessage( type, "This field is required" );
			divTag.append( me.getErrorSpanTag( message ) );
			valid = false;
		}
		
		return valid;
	};
	
	
	me.checkValueLen = function( inputTag, divTag, type, length )
	{		
		var valid = true;
		var value = inputTag.val();
		
		if ( value && type == 'min' && value.length < length )
		{
			var message = me.getMessage( type, 'Please enter at least ' + length  + ' characters' );
			message = message.replace("$$length", length);
			divTag.append( me.getErrorSpanTag( message ) );

			valid = false;
		}
		else if ( value && type == 'max' && value.length > length )
		{
			var message = me.getMessage( type, 'Please enter at most ' + length + ' characters' );
			message = message.replace("$$length", length);
			divTag.append( me.getErrorSpanTag( message ) );
			
			valid = false;
		}
		else if ( value && type == 'exactlength' && value.length != length )
		{
			var message = me.getMessage( type, 'Please enter exactly ' + length + ' characters' );
			message = message.replace("$$length", length);
			divTag.append( me.getErrorSpanTag( message ) );
			
			valid = false;
		}
		

		return valid;
	};


	me.checkValueRange = function( inputTag, divTag, type, valFrom, valTo )
	{
		var valid = true;
		var value = inputTag.val();
		
		if ( value && ( valFrom > value || valTo < value ) )
		{
			var message = me.getMessage( type, 'The value should be less than or equal to ' + valTo );
			message = message.replace("$$length", length);
			divTag.append( me.getErrorSpanTag( message ) );

			valid = false;
		}
		
		return valid;		
	};

	me.checkNumberOnly = function( inputTag, divTag, type )
	{
		var valid = true;
		var value = inputTag.val();
		var reg = new RegExp( /^\d+$/ );

		if ( value && !reg.test( value ) )
		{
			var message = me.getMessage( type, 'Please enter number only' );
			divTag.append( me.getErrorSpanTag( message ) );
			
			valid = false;
		}
		
		return valid;		
	};

	me.checkValidDate = function( inputTag, divTag, type )
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
				  var message = me.getMessage( type, 'Please enter valid date' );
				  divTag.append( me.getErrorSpanTag( message ) );
				  valid = false;
				} else {
				  // date is valid
				}
			  } else {
				// not a date
				var message = me.getMessage( type, 'Please enter valid date' );
				divTag.append( me.getErrorSpanTag( message ) );
				valid = false;
			  }

		}

		return valid;	
	}
	
	me.checkPhoneNumberValue = function( inputTag, divTag, type )
	{
		var valid = true;
		
		// Check if Phone number is in [ 12, 15 ]
		inputTag.attr( 'altval', '' );

		var validationInfo = me.phoneNumberValidation( inputTag.val() );		
		if ( !validationInfo.success ) 
		{
			divTag.append( me.getErrorSpanTag( validationInfo.msg ) );
			valid = false;			
		}
		else
		{
			// If valid phone number, put the converted phone number as attribute to be used later.
			inputTag.attr( 'altval', validationInfo.phoneNumber );
		}
		
		return valid;
	};
	
	me.checkValue_RegxRules = function( inputTag, divTag, type )
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
						divTag.append( me.getErrorSpanTag( startCommaStr + regxRuleJson.msg, regxRuleJson.term ) );
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


	me.phoneNumberValidation = function( phoneVal )
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
				msg += me.getMessage( "phone9Len", 'Number should be 9 digits long (w/o country code' );
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
				msg += me.getMessage( "phoneStartWith", "Number should start with '+2588' or '002588'" );
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
			msg += me.getMessage( "phoneStartWith", "Number should start with '+2588' or '002588'" );
		}

		
		return { 'success': success, 'phoneNumber': finalPhoneNumber, 'msg': msg };	
	}

	// -----------------------------
	// -- Others

	me.getErrorSpanTag = function( keyword, term )
	{
		var text = me.cwsRenderObj.langTermObj.translateText( keyword, term ); // + optionalStr;
		var dvContainer = $( '<div class="errorMsg" /> ' );
		var errorMsg = $( '<div class="errorMsgText" keyword="' + keyword + '" term="' + term + '" > ' + text + ' </div>' );
		var arrow = $( '<div class="errorMsgArrow">&nbsp;</span>' );

		dvContainer.append( errorMsg, arrow );

		return dvContainer;
	};
	
	me.clearTagValidations = function( tags )
	{
		tags.css( "background-color", "" ).val( "" ).attr( "altval", "" );
		
		tags.each( function() {
			$( this ).closest( "div" ).find( "div.errorMsg" ).remove();
		});		
	};	
	
	// Some values like string 'false', 'NaN', '-0' '+0' are evaluated as false.
	me.checkFalseEvalSpecialCase = function( value ) {
		return ( value !== undefined && value != null && value.length > 0 );
	};

}