// -------------------------------------------
// -- BlockForm Class/Methods
//
//  1. render groups + controls
//    1.1 layouts + defaultValues + eventHandlers
//    1.2 load passed dataValues
//  2. handle calculatedFields (inside eventHandlers)
//  3. handle validations

function BlockForm( cwsRenderObj, blockObj, actionJson )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	me.actionJson = actionJson;

	me.payloadConfigSelection;
	me.formJsonArr;
	me.formJsonConfig = {};
	me.formDivSecTag;
	me._childTargetActionDelay = 400;
	me._groupNoneId = 'zzzGroupNone';

	// =============================================
	// === TEMPLATE METHODS ========================
	
	me.initialize = function() 
	{ 
		// if 'actionJson' were passed (by clickAction), and if payloadConfig exists in action, set it.
		if ( me.actionJson ) me.payloadConfigSelection = me.actionJson.payloadConfig;
	}


	// TODO: render() should do - clear previous tags, and create tags newly.
	//	- All the tag html should be placed on top as tagTemplate (See 'blockList.js' as example )
	me.render = function( formDef, blockTag, passedData )
	{
		var formJsonArr = FormUtil.getObjFromDefinition( formDef, ConfigManager.getConfigJson().definitionForms );

		var formGrps = ConfigManager.getConfigJson().definitionFormGroups;

		me.formJsonArr = formJsonArr;

		if ( formJsonArr !== undefined )
		{
			var formDivSecTag = $( '<div class="formDivSec"></div>' );
			var autoComplete = ConfigManager.staticData.autoComplete;
			var formTag = $( '<form autocomplete="' + autoComplete + '"></form>' );

			formDivSecTag.append( formTag );

			blockTag.append( formDivSecTag );

			me.formDivSecTag = formDivSecTag;

			// NOTE: JAMES: STOPPED WORKING AT HERE <--- ADDED 'groupId' on return 'formFieldGroups'
			var formFieldGroups = me.getFormGroupingJson( formJsonArr, formGrps );
			var groupsCreated = [];
			
			formFieldGroups.forEach( formGroup => 
			{
				var groupDivTag = me.createGroupDivTag( formGroup, groupsCreated, formTag );
				var formItemJson = formGroup.item;

				me.formJsonConfig[ formItemJson.id ] = formItemJson;

				var inputFieldTag = me.createInputFieldTag( formItemJson, me.payloadConfigSelection, formTag, passedData, formJsonArr, autoComplete );
				groupDivTag.append( inputFieldTag );

				formTag.append( groupDivTag );
			});
			

			// Translate Page after the rendering..
			TranslationManager.translatePage();

			
			Validation.disableValidation( function() 
			{
				me.populateFormData( passedData, formTag );
				me.evalFormGroupDisplayStatus( formTag );
	
				// NOTE: TRAN VALIDATION
				Validation.setUp_Events( formTag );
	
				//NOTE (Greg): 500ms DELAY SOLVES PROBLEM OF CALCULATED DISPLAY VALUES BASED ON FORM:XXX VALUES
				//NOTE (2020/07/22): added sort logic to underlying calculationEval so that 'complex' formulas run last
				setTimeout( function(){
					me.evalFormInputFunctions( formTag );
				}, 500 );
	
				// Run change event of dataValue tag in case there are some default Values which can required to show/hide some fields in form
				formDivSecTag.find('.dataValue:not(:empty)').change(); // * BUG > only highlights SELECT controls (ignores inputs): https://stackoverflow.com/questions/8639282/notempty-css-selector-is-not-working
			});
		}
	}

	me.createGroupDivTag = function( formFieldGroup, groupsCreated, formTag )
	{
		var groupDivTag = formTag;

		if ( formFieldGroup.group )
		{
			if ( ! groupsCreated.includes( formFieldGroup.group ) )
			{
				groupDivTag = $( '<div class="formGroupSection" name="' + formFieldGroup.group + '"><div class="section"><label term="' + formFieldGroup.groupTerm + '">' + formFieldGroup.group + '</label></div></div>' );
				formTag.append( groupDivTag );
				groupsCreated.push( formFieldGroup.group );
			}
			else
			{
				//do nothing: group already exists
				groupDivTag = $( formTag ).find( 'div[name="' + formFieldGroup.group + '"]' );
			}
		}
		else 
		{
			// JAMES NOTE: THIS NEVER GETS CALLED? (Due to 'noGroup' used..)  <-- ASK GREG TO TEST THIS PART!!!

			// TRAN TODO : NEED TO do something about it
			if ( formFieldGroup.group.length === 0 )
			{
				if ( ! groupsCreated.includes( me._groupNoneId ) )
				{
					groupDivTag = $( '<div style="" class="formGroupSection" name="' + me._groupNoneId + '"></div>' );

					formTag.append( groupDivTag );	
					groupsCreated.push( me._groupNoneId );
				}
				else
				{
					groupDivTag = $( formTag ).find( 'div[name="' + me._groupNoneId + '"]' );
				}
			}
			else
			{
				groupDivTag = formTag;
			}
		}

		return groupDivTag;
	};


	me.evalFormGroupDisplayStatus = function( formDivSecTag )
	{
		var dvGroups = formDivSecTag.find( 'div.formGroupSection' );

		for( var i = 0; i < dvGroups.length; i++ )
		{
			var inpCtls  = $( dvGroups[ i ] ).find("div.fieldBlock");
			var sumDisplay = 0;

			for( var c = 0; c < inpCtls.length; c++ )
			{
				if ( $( inpCtls[ c ]).css( 'display' ) != 'none' )
				{
					sumDisplay += 1;
				}
			}
			if ( sumDisplay == 0 )
			{
				$( dvGroups[ i ] ).css( 'display', 'none' );
			}
		}
	};


	// =============================================
	// Render INPUT fields

	me.createInputFieldTag = function( formItemJson, payloadConfigSelection, formDivSecTag, passedData, formJsonArr, autoComplete )
	{		
		var controlType = formItemJson.controlType;
		var divInputFieldTag;
		
		if ( controlType == "INT" || controlType == "SHORT_TEXT" )
		{
			divInputFieldTag = me.createStandardInputFieldTag( formItemJson, autoComplete );
		}
		else if ( controlType == "DROPDOWN_LIST" )
		{
			divInputFieldTag = me.createDropDownEntryTag( formItemJson );
		}
		else if ( controlType == "LABEL" )
		{
			divInputFieldTag = me.createLabelFieldTag( formItemJson );
		}
		else if( controlType == "IMAGE" )
		{
			divInputFieldTag = me.createImageTag( formItemJson );
		}
		else if( controlType == "YEAR" ) 
		{
			divInputFieldTag = me.createYearFieldTag( formItemJson, autoComplete );
		}
		else if( controlType == "DATE" ) 
		{
			divInputFieldTag = me.createDateFieldTag( formItemJson );
		}
		else if( controlType == "DROPDOWN_AUTOCOMPLETE" ) // "RADIO_DIALOG"
		{
			divInputFieldTag = me.createRadioDialogFieldTag( formItemJson );
		}
		else if( controlType == "RADIO" )
		{
			divInputFieldTag = me.createRadioFieldTag( formItemJson );
		}
		else if( controlType == "CHECKBOX" )
		{
			divInputFieldTag = me.createCheckboxFieldTag( formItemJson );
		}
		else if( controlType == "MULTI_CHECKBOX" ) // "CHECKBOX_DIALOG"
		{
			divInputFieldTag = me.createCheckBoxDialogFieldTag( formItemJson );
		}
		
		
		var entryTag = divInputFieldTag.find( '.dataValue' );

		if ( divInputFieldTag !== undefined && entryTag.length > 0 ) // LABEL don't have "dataValue" clazz
		{
			if ( formItemJson.scanQR != undefined && formItemJson.scanQR )
			{
				me.createScanQR( divInputFieldTag, entryTag );
			}

			// Set defaultValue if any
			FormUtil.setTagVal( entryTag, formItemJson.defaultValue );

			// For payloadConfigSelection, save the selection inside of the config for easier choosing..
			me.setFormItemJson_DefaultValue_PayloadConfigSelection( formItemJson, payloadConfigSelection );

			// Setup events and visibility and rules
			var formFull_IdList = me.getIdList_FormJson( formJsonArr );
			
			// Set change event and rules on input tags
			me.setEventsAndRules( formItemJson, entryTag, divInputFieldTag, formDivSecTag, formFull_IdList );


			// Set InputFieldTag visibility based on: config setting - display 'hiddenVal/none', or hide/show case
			me.setFieldTagVisibility( formItemJson, divInputFieldTag, passedData );  // This method might have to move outside of if case - if not related to 'entry.length'
		}

		return divInputFieldTag;
	};


	me.createScanQR = function( divInputFieldTag, entryTag )
	{
		var QRiconTag = $( '<img src="images/qr.svg" class="qrButton" >');

		QRiconTag.click( function(){
			var qrData = new readQR( entryTag );
		});

		divInputFieldTag.find( '.field__left' ).append( QRiconTag );
		entryTag.addClass( 'qrInput' );

	}

	me.createStandardInputFieldTag = function( formItemJson, autoComplete )
	{
		var divInputFieldTag = me.createInputFieldTag_Standard( formItemJson );

		var entryTag = $( '<input name="' + formItemJson.id + '" uid="' + formItemJson.uid 
				+ '" dataGroup="' + formItemJson.dataGroup + '" type="text" autocomplete="' + autoComplete 
				+ '" class="dataValue displayValue" />' );
		
		divInputFieldTag.find( 'div.field__left' ).append( entryTag );

		return divInputFieldTag;
	}

	me.createInputFieldTag_Standard = function( formItemJson )
	{
		// Create tag
		var divInputFieldTag = $( Templates.inputFieldStandard );

		// Label
		divInputFieldTag.find( 'label.displayName' ).attr( 'term', formItemJson.term ).text( formItemJson.defaultName );
		
		return divInputFieldTag;
	};

	me.createDropDownEntryTag = function( formItemJson )
	{
		// Create tag
		var divInputFieldTag = me.createInputFieldTag_Standard( formItemJson );

		// Remove standard css class "field__left", add "field__selector" class
		divInputFieldTag.find(".field__left").removeClass( 'field__left' ).addClass( 'field__selector' );

		// Get and resolve options
		var optionList = FormUtil.getObjFromDefinition( formItemJson.options, ConfigManager.getConfigJson().definitionOptions );
		Util.decodeURI_ItemList( optionList, "defaultName" );

		// Populate options
		var entryTag = $( '<select name="' + formItemJson.id + '" uid="' + formItemJson.uid 
					+ '" dataGroup="' + formItemJson.dataGroup 
					+ '" class="dataValue displayValue" />' );
 		Util.populateSelect_newOption( entryTag, optionList, { "name": "defaultName", "val": "value" } );

		// When changed/selected, the focus is removed(blured), so that arrow image is switched (defined in css, focus)
		entryTag.on( 'change', function() {
			$( this ).blur();
		});

		divInputFieldTag.find( 'div.field__selector' ).append( entryTag );

		return divInputFieldTag;
	}

	me.createRadioDialogFieldTag = function( formItemJson )
	{
		var divInputFieldTag = $( Templates.inputFieldStandard );
		divInputFieldTag.find( 'label.displayName' ).attr( 'term', formItemJson.term ).text( formItemJson.defaultName );

        // Greg1-radio [review]
		var uniqueId = Util.generateRandomId( 8 );
		divInputFieldTag.attr( 'uniqueID', uniqueId );

		var showEntryForm = $( '<input name="displayValue_' + formItemJson.id + '" uid="displayValue_' + formItemJson.uid + '" type="text"  READONLY class="displayValue" />' ); //	Input for to be shown in the app
		var entryTag = $( '<input name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" type="hidden" class="dataValue" />' );

		divInputFieldTag.find( 'div.field__left' ).append( showEntryForm );
		divInputFieldTag.find( 'div.field__left' ).append( entryTag );

		showEntryForm.on( 'click', function(){
			me.createSearchOptions_Dialog( divInputFieldTag, formItemJson, 'radio' );
		} );

		// Set DEFAULT display value if any
		me.setDefaultValue_DialogFieldTag( divInputFieldTag, formItemJson );

		return divInputFieldTag;
	}
	

	me.createCheckBoxDialogFieldTag = function( formItemJson )
	{
		var divInputFieldTag = $( Templates.inputFieldStandard ); //Templates.inputFieldCheckbox

		divInputFieldTag.find( 'label.displayName' ).attr( 'term', formItemJson.term ).text( formItemJson.defaultName );

		var showEntryForm = $( '<input name="displayValue_' + formItemJson.id + '" uid="displayValue_' + formItemJson.uid + '" type="text"  READONLY class="displayValue" />' ); //	Input for to be shown in the app
		var entryTag = $( '<input name="' + formItemJson.id + '" id="' + formItemJson.id + '" uid="' + formItemJson.uid + '" type="hidden" class="dataValue" />' );

		divInputFieldTag.find( 'div.field__left' ).append( showEntryForm );
		divInputFieldTag.find( 'div.field__left' ).append( entryTag );

		showEntryForm.on( 'click', function(){
			me.createSearchOptions_Dialog( divInputFieldTag, formItemJson, 'checkbox' );
		} );

		// Set DEFAULT display value if any
		me.setDefaultValue_DialogFieldTag( divInputFieldTag, formItemJson );

		return divInputFieldTag;
	}

	me.setDefaultValue_DialogFieldTag = function( divInputFieldTag, formItemJson )
	{
		if( formItemJson.defaultValue != undefined )
		{
			var defaultValueList = formItemJson.defaultValue.split(",");
			var optionList = FormUtil.getObjFromDefinition( formItemJson.options, ConfigManager.getConfigJson().definitionOptions );
			var displayTag = divInputFieldTag.find(".displayValue");
			var displayValues = [];
			
			
			for ( var i = 0; i < optionList.length; i++ )
			{
				var optionConfig = optionList[i];
				if( defaultValueList.includes( optionConfig.value ) )
				{
					var displayValue = TranslationManager.translateText( optionConfig.defaultName, optionConfig.poTerm );
					displayValues.push( displayValue );
				}
			}

			displayTag.val( displayValues.join(",") );
		}		
	};
	

	me.createLabelFieldTag = function( formItemJson )
	{
		var divInputFieldTag = $( Templates.labelField );

		divInputFieldTag.html( formItemJson.defaultName ).attr( 'term', formItemJson.term );

		return divInputFieldTag;
	}

	// TRAN : NEED TO UNDERSTAND HOW THIS FIELD EXPECT TO WORK
	me.createImageTag = function( formItemJson )
	{
		// Create tag
		var divInputFieldTag = me.createInputFieldTag_Standard( formItemJson );

		// Add input to display image if the image has payload
		var inputTag = $( '<input name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" dataGroup="' + formItemJson.dataGroup + '" type="hidden" class="dataValue" />' );
		divInputFieldTag.find( 'div.field__left' ).append( inputTag );

		// IMAGE
		var imgDivTag = $( '<div class="imgQRInput"></div>' );
		var imgDisplay = $( '<img name="' + formItemJson.id + '" style="' + formItemJson.imageSettings + '" src="" class="displayValue">' );
		imgDivTag.append( imgDisplay );

		divInputFieldTag.find( 'div.field__left' ).append( imgDivTag );

		return divInputFieldTag;
	}

	// NEED TO SEE HOW IT WORKS
	me.createYearFieldTag = function( formItemJson, autoComplete )
	{
		var divInputFieldTag = me.createInputFieldTag_Standard( formItemJson );

		var yearFieldTag = $( Templates.inputFieldYear );
		divInputFieldTag.find(".field__left").append( yearFieldTag );

		var yearRange = formItemJson.yearRange;
		if( yearRange == undefined )
		{
			yearRange = { 'from': -100, 'to': 0 };
		}

		var data = []
		var curYear = ( new Date() ).getFullYear();

		for ( var i = yearRange.from; i <= yearRange.to; i++ )
		{
			var year = curYear + i;
			data.push( { value: year, text: year } );
		}


		divInputFieldTag.find( 'input.dataValue' ).attr( 'name', formItemJson.id );
		divInputFieldTag.find( 'input.dataValue' ).attr( 'uid', formItemJson.uid );
		
		// Set DEFAULT for display field if any
		FormUtil.setTagVal( divInputFieldTag.find( 'input.displayValue' ), formItemJson.defaultValue );
		divInputFieldTag.find( 'input.displayValue' ).attr( 'autocomplete', autoComplete );

		Util2.populate_year( yearFieldTag[0], data, TranslationManager.translateText( formItemJson.defaultName, formItemJson.term ) );

		return divInputFieldTag;
	}

	// TRAN TODO : will organize later
	me.createDateFieldTag = function( formItemJson )
	{
		wrapperDad = $('<div class="dateContainer"></div>');
		wrapperInput = $('<div class="dateWrapper"></div>');
		button = $('<button class="dateButton" ></button>');
		icoCalendar = $('<img src="images/i_date.svg" class="imgCalendarInput" />');

		button.append(icoCalendar);

		var formatDate = me.getFormControlRule( formItemJson, "placeholder" );
		var dtmSeparator = Util.getDateSeparator( formatDate );
		var formatMask = formatDate.split( dtmSeparator ).reduce( (acum, item) => 
		{
			let arr="";
			for ( let i = 0; i < item.length; i++ )
			{
				arr += "#";
			}
			acum.push(arr);
			return acum;
		}, [] ).join( dtmSeparator );

		// TODO: JAMES: ASK GREG TO CHECK THE USAGE..
		entryTag = $( '<input class="dataValue displayValue" data-mask="' + formatMask + '" name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" dataGroup="' + formItemJson.dataGroup + '" type="text" placeholder="'+ formatDate +'" size="' + ( formatDate.toString().length > 0 ? formatDate.toString().length : '' ) + '" isDate="true" />' );

		wrapperInput.append( entryTag );
		wrapperDad.append( wrapperInput, button );

		FormUtil.setTagVal( entryTag, formItemJson.defaultValue );


		//function that call datepicker
		Maska.create( entryTag[0] );

		entryTag.click( e => e.preventDefault() );

		var tagOfClick = Util.isMobi() ? button.parent() : button;  // NOTE: TODO: WHY THIS?

		tagOfClick.click( function(e) {
			//FormUtil.mdDateTimePicker( e, entryTag, formatDate, formItemJson.yearRange );
			FormUtil.mdDateTimePicker( e, me.formDivSecTag.find( '[name=' + formItemJson.id + ']' ), formatDate, formItemJson.yearRange );
		});

		var divInputFieldTag = me.createInputFieldTag_Standard( formItemJson );
		divInputFieldTag.find(".field__left").append( wrapperDad );

		return divInputFieldTag;
	};
	

	me.createRadioFieldTag = function( formItemJson )
	{
		var divInputFieldTag = $( Templates.inputFieldRadio );

		var checkLabel = divInputFieldTag.find( '.displayName' );
		checkLabel.html( formItemJson.defaultName ).attr( 'term', formItemJson.term );

		// Create a hidden input tag to save selected option value
		var hiddenTarget = $( Templates.inputFieldHidden );
		hiddenTarget.addClass( "dataValue" );
		hiddenTarget.attr( "name", formItemJson.id );
		divInputFieldTag.append( hiddenTarget );

		// Create Option list
		me.createRadioItemTags( divInputFieldTag, formItemJson, false );

		return divInputFieldTag;
	};

	me.createCheckboxFieldTag = function( formItemJson )
	{
		var divInputFieldTag = $( Templates.inputFieldCheckbox );
		var displayNameTag = divInputFieldTag.find( '.displayName' );
		displayNameTag.html( formItemJson.defaultName ).attr( 'term', formItemJson.term );

		// Create Option list
		me.createCheckboxItemTags( divInputFieldTag, formItemJson, false )

		return divInputFieldTag;
	};

	// =============================================
	// === Supportive for INPUT fields =============

	// For RADIO items
	me.createRadioItemTags = function( divInputFieldTag, formItemJson, onDialog )
	{		
		var optionDivListTag = divInputFieldTag.find(".radiobutton-col");
		var optionList = FormUtil.getObjFromDefinition( formItemJson.options, ConfigManager.getConfigJson().definitionOptions );
		var defaultValueList = ( formItemJson.defaultValue == undefined ) ? [] : formItemJson.defaultValue.split(",");
		var displayTag = divInputFieldTag.find(".displayValue");
		var uniqueId; // Greg1-radio [review]

		if ( onDialog )
		{
			uniqueId = divInputFieldTag.attr( 'uniqueID' );
		}
		else
		{
			uniqueId = Util.generateRandomId( 8 );
			divInputFieldTag.attr( 'uniqueID', uniqueId );				
		}

		for ( var i = 0; i < optionList.length; i++ )
		{
			var optionDivTag = $( Templates.inputFieldRadio_Item );

			//me.setAttributesForInputItem( displayTag, optionDivTag, formItemJson.id, optionList[ i ], defaultValueList.includes( optionList[ i ].value ) );
			me.setAttributesForInputItem( displayTag, optionDivTag, uniqueId, optionList[ i ], defaultValueList.includes( optionList[ i ].value ) );

			optionDivListTag.append( optionDivTag );

			me.setupEvents_RadioItemTags( divInputFieldTag, optionDivTag.find( 'input' ) );

			//if ( ! onDialog ) optionDivTag.find( 'input' ).addClass( 'dataValue' );
			if ( ! onDialog ) optionDivTag.find( 'input' ).addClass( 'displayValue' );
		}
	}

	me.setAttributesForInputItem = function( displayTag, optionDivTag, targetId, optionConfig, isChecked )
	{
		var optionInputTag = optionDivTag.find( 'input' );
		optionInputTag.attr( 'name', 'opt_' + targetId );
		optionInputTag.attr( 'id', 'opt_' + targetId + '_' + optionConfig.value ); // Need for css to make check-mark
		optionInputTag.attr( 'value', optionConfig.value ); // Use to fill the selected option value to input.dataValue
		optionInputTag.prop( "checked", isChecked );

		var labelTag = optionDivTag.find( 'label' );
		var labelTerm = TranslationManager.translateText( optionConfig.defaultName, optionConfig.poTerm );
		labelTag.attr( 'for', 'opt_' + targetId + '_' + optionConfig.value );
		labelTag.text( labelTerm );

		// Set DEFAULT display value if any
		if( isChecked )
		{
			var value = displayTag.val();
			value = ( value == "" ) ? labelTerm : ", " + labelTerm;
			FormUtil.setTagVal( displayTag, value );
		}
	}
	
	me.setupEvents_RadioItemTags = function( divInputFieldTag, optionInputTag )
	{
		optionInputTag.click( function(){
			var targetInputTag = divInputFieldTag.find("input.dataValue");
            // Greg1-radio [review]
			if ( targetInputTag.length )
			{
				targetInputTag.val( $(this).val() );
				FormUtil.dispatchOnChangeEvent( targetInputTag ); // added by Greg (2020-10-12) > change event not dispatching with 'new' value
			}
		});
	}

	// For checkbox items
	me.createCheckboxItemTags = function( divInputFieldTag, formItemJson, onDialog )
	{
		var optionDivListTag = divInputFieldTag.find(".checkbox-col");
		var optionList = FormUtil.getObjFromDefinition( formItemJson.options, ConfigManager.getConfigJson().definitionOptions );
		
		// For TRUE/FALSE case without options defination
		if ( optionList === undefined )
		{
			var optionDivTag = $( Templates.inputFieldCheckbox_SingleItem );
			var uniqueId = Util.generateRandomId( 8 ); // Greg1-radio [review]

			divInputFieldTag.attr( 'uniqueID', uniqueId );

			var optionInputTag = optionDivTag.find( 'input' );
			optionInputTag.attr( 'id', "opt_" + uniqueId + '_' + formItemJson.id );
			optionInputTag.attr( 'name', formItemJson.id );


			optionDivTag.find("label").attr("for", "opt_" + uniqueId + '_' + formItemJson.id );

			optionDivListTag.append( optionDivTag ); 

			me.setupEvents_SingleCheckBoxItemTags( divInputFieldTag, optionDivTag );
		}
		else // Create multiple items
		{
			// Create a hidden input tag to save selected option value
			var hiddenTarget = $( Templates.inputFieldHidden );
			hiddenTarget.addClass( 'dataValue' );
			hiddenTarget.attr( 'name', formItemJson.id );
			divInputFieldTag.append( hiddenTarget );

			
			var defaultValueList = ( formItemJson.defaultValue == undefined ) ? [] : formItemJson.defaultValue.split(",");
			var displayTag = divInputFieldTag.find(".displayValue");

			for ( var i = 0; i < optionList.length; i++ )
			{
				var optionDivTag = $( Templates.inputFieldCheckbox_Item );
				me.setAttributesForInputItem ( displayTag, optionDivTag, formItemJson.id, optionList[ i ], defaultValueList.includes( optionList[ i ].value ) );

				optionDivListTag.append( optionDivTag );

				me.setupEvents_CheckBoxItemsTags( divInputFieldTag, optionDivTag.find("input"), onDialog );
			}
		}

	}

	me.setupEvents_SingleCheckBoxItemTags = function( divInputFieldTag, optionDivTag )
	{
		optionDivTag.change( function(){
			var checkBoxTag = optionDivTag.find("input");
			var value = checkBoxTag.is( ':checked' );
			
			divInputFieldTag.find("input.dataValue").val( value );
		});
	}

	me.setupEvents_CheckBoxItemsTags = function( divInputFieldTag, optionInputTag, onDialog )
	{
		optionInputTag.change( function(){
			var targetInputTag = divInputFieldTag.find("input.dataValue");
			var checkedItems = divInputFieldTag.find("input[name='opt_" + targetInputTag.attr("name") + "']:checked");
			var selectedValues = [];
			for( var i=0; i<checkedItems.length; i++ )
			{
				selectedValues.push( checkedItems[i].value );
			}
			targetInputTag.val( selectedValues.join(",") );
			if ( ! onDialog ) FormUtil.dispatchOnChangeEvent( targetInputTag );
		});
	}

	// For RADIO/CHECKBOX dialog
	me.createSearchOptions_Dialog = function( divInputFieldTag, formItemJson, type )
	{
		var dialogForm = $( Templates.searchOptions_Dialog );
		dialogForm.find(".dialog__text").addClass("checkbox"); 

        // Greg1-radio [review]
		dialogForm.attr( 'uniqueID', divInputFieldTag.attr( 'uniqueID' ) );

		var optsContainer = dialogForm.find( '.optsContainer' );
		dialogForm.find( '.title' ).html( TranslationManager.translateText( formItemJson.defaultName, formItemJson.term ) );

		if( type == 'radio')
		{
			optsContainer.addClass("radiobutton-col");

			// Create Item list
			me.createRadioItemTags( dialogForm, formItemJson, true );
		}
		else
		{
			optsContainer.addClass("checkbox-col");
			optsContainer.addClass("checkbox__wrapper");

			// Create Item list
			me.createCheckboxItemTags( dialogForm, formItemJson, true  );

			// Set list of items as vertical
			optsContainer.find(".horizontal").removeClass("horizontal");
		}


		// Set checked items if any
		var selectedValues = divInputFieldTag.find("input.dataValue").val();
		selectedValues = ( selectedValues != "" ) ? selectedValues : formItemJson.defaultValue;
		if( selectedValues != undefined )
		{
			var selected = selectedValues.split(",");
			for( var i=0; i<selected.length; i++ )
			{
				var value = selected[i];
				optsContainer.find("input[value='" + value + "']").prop("checked", true);
			}
			
		}

		// Display dialog
		me.openDialogForm( dialogForm );

		// Need to so something about this ? Maybe move the main class ???
		$('.scrim').off( 'click' ).on( 'click', function(){
			me.closeDialogForm( dialogForm );
		} );


		// --------------------------------------------------------
		// Setup events

		// Search event 
		dialogForm.find( 'input.searchText' ).on( 'keyup', function( e ){

			var searchFor = $( this ).val().toUpperCase();
			var searchItems = optsContainer.find( 'div' );

			searchItems.each( function( i ) {
				selectedVal = ( $( this ).find("label").html() ).toUpperCase();
				$( this ).css( 'display', ( selectedVal.includes( searchFor ) ? 'block' : 'none' ) );
				dialogForm.height( dialogForm.attr( 'constantHeight' ) );
			});

			// GREG: trying to maintain dialog height when searching
			dialogForm.height( dialogForm.attr( 'constantHeight' ) );

		});

		// Item CLICK event
		optsContainer.find("input").click( function(){
			me.setupEvents_DialogSelectedItemTags( divInputFieldTag, dialogForm, $(this) );
		});

		// Close button event
		dialogForm.find( '#closeBtn' ).on( 'click', function(){

			var targetInputTag = divInputFieldTag.find("input.dataValue");
			FormUtil.dispatchOnChangeEvent( targetInputTag );

			$('.scrim').hide();
			$( '#dialog_searchOptions' ).remove();
		} );

		// Clear button event
		dialogForm.find( '#clearBtn' ).on( 'click', function(){

			optsContainer.find("input").prop("checked", false);

			var targetInputTag = divInputFieldTag.find("input.dataValue");
			var targetDisplayTag = divInputFieldTag.find("input.displayValue");

			targetInputTag.val( "" );
			targetDisplayTag.val( "" );

			FormUtil.dispatchOnChangeEvent( targetInputTag );
		} );

	}

	me.closeDialogForm = function( dialogForm )
	{
		dialogForm.remove();
		$('.scrim').hide();
	};

	me.openDialogForm = function( dialogForm )
	{
		$( 'body' ).append( dialogForm );
		$('.scrim').show();

		dialogForm.show();

	/*	setTimeout( function(){
			// GREG: trying to maintain dialog height when searching
			dialogForm.attr( 'constantHeight', dialogForm.height() );
			dialogForm.attr( 'constantWidth', dialogForm.width() );
		 }, 250 ) */
	}

	me.setupEvents_DialogSelectedItemTags = function( targetDivInputFieldTag, dialogTag, optionInputTag )
	{
		optionInputTag.change( function(){
			var targetInputTag = targetDivInputFieldTag.find("input.dataValue");
			var targetDisplayTag = targetDivInputFieldTag.find("input.displayValue");

			//var checkedItems = dialogTag.find("input[name='opt_" + targetInputTag.attr("name") + "']:checked");
			var checkedItems = dialogTag.find("input[name='opt_" + targetDivInputFieldTag.attr("uniqueID") + "']:checked");
			var selectedValues = [];
			var selectedTexts = [];
			for( var i=0; i<checkedItems.length; i++ )
			{
				var text = $( checkedItems[i] ).closest("div").find("label").html();
				selectedValues.push( checkedItems[i].value );
				selectedTexts.push( text );
			}

			targetInputTag.val( selectedValues.join(",") );
			targetDisplayTag.val( selectedTexts.join(",") );
		});
	}


	// =============================================
	// === OTHER INTERNAL/EXTERNAL METHODS =========

	me.getIdList_FormJson = function( formJsonArr )
	{
		var idList = [];

		for( var i = 0; i < formJsonArr.length; i++ )
		{
			var formItemJson = formJsonArr[i];

			if ( formItemJson.id ) idList.push( formItemJson.id );
		}

		return idList;
	}

	me.getFormGroupingJson = function( formJsonArr, frmGroupJson )
	{
		// There are some hidden data which are put in hidden INPUT tag without any group. 
		// This one need to genrerate first so that data in these fields can be used after that
		var groupNone = me._groupNoneId; 
		var arrWtGroup = [];
		var arrNoGroup = [];

		// 1. copy the array..
		var newArr = Util.getJsonDeepCopy( formJsonArr );

		// 2. loop each form control and create formGroup...  even none ones...
		newArr.forEach( frmCtrl => 
		{
			// NOTE: ISSUES - Currently, definition name is used as id..  but we should have id in it...
			var frmCtrlGroup = FormUtil.getObjFromDefinition( frmCtrl.formGroup, frmGroupJson );
			var formCtrlGroupId = frmCtrl.formGroup;

			if ( frmCtrlGroup )
			{
				// Data with group info
				var dataJson = { 
					'id': frmCtrl.id
					,'group': frmCtrlGroup.defaultName
					,'groupTerm': Util.getStr( frmCtrlGroup.term )
					,'groupId': formCtrlGroupId
					,'item': frmCtrl
					,created: 0
					,display: ( frmCtrl.display == 'hiddenVal' || frmCtrl.display == 'none' ) ? 0 : 1
					,order: frmCtrlGroup.order 
				};

				arrWtGroup.push( dataJson );
			}
			else
			{
				// Data with no group info
				var dataJson = { 
					'id': frmCtrl.id
					,'group': groupNone
					,'groupTerm': ''
					,'groupId': groupNone
					,'item': frmCtrl
					,created: 0
					, display: ( frmCtrl.display == 'hiddenVal' || frmCtrl.display == 'none' ) ? 0 : 1
					, order: 999 
				}; 
				
				arrNoGroup.push( dataJson );
			}
		});


		// SORTING should be inherited from preconfigured 'Group' object sort value
		Util.sortByKey( arrWtGroup, 'order' );
		

		// Combine the 'noGroup' with 'withGroup' array
		var combinedArr = Util.getCombinedArrays( arrNoGroup, arrWtGroup );

		combinedArr.forEach( item => {
			if ( item.group == groupNone ) item.group = '';
		});

		return combinedArr;
	};



	me.getFormUniqueGroups = function( JsonArr )
	{
		var ArrFound = [];

		for( var i = 0; i < JsonArr.length; i++ )
		{
			if ( ! ArrFound.includes( JsonArr[ i ].group ) )
			{
				ArrFound.push( JsonArr[ i ].group );
			}
		}

		return ArrFound;
	}

	me.getFormItemJson_FromId = function( formJsonArr, id )
	{
		return Util.getFromList( formJsonArr, id, "id" );
	}

	me.getFormControlRule = function ( formItemJson, attr )
	{
		var objAttr = formItemJson.rules.filter(obj=>obj.name===attr)[0] 
		return(
			objAttr
			?	objAttr.value
			:	''
		)	
	}

	
	me.setFormItemJson_DefaultValue_PayloadConfigSelection = function( formItemJson, payloadConfigSelection )
	{
		if ( formItemJson 
			&& formItemJson.defaultValue 
			&& formItemJson.defaultValue.payloadConfigEval )
		{
			formItemJson.defaultValue.payloadConfigSelection = payloadConfigSelection;
		}
	};


	me.getEvalFormulas = function()
	{
		var jData = me.formJsonArr;
		var pConf = me.payloadConfigSelection; //FormUtil.block_payloadConfig;
		var retArr = [];

		for( var i = 0; i < jData.length; i++ )
		{
			var formFieldDef = jData[ i ];

			// 1. prioritize existing payloadConfig (if match found)
			if ( pConf && formFieldDef.payload && formFieldDef.payload[ pConf ] && ( formFieldDef.payload[ pConf ].calculatedValue || formFieldDef.payload[ pConf ].defaultValue ) ) //pConf.length && 
			{
				if ( formFieldDef.payload && formFieldDef.payload[ pConf ] && formFieldDef.payload[ pConf ].calculatedValue ) 
				{
					retArr.push( { name: formFieldDef.id, type: 'calculatedValue', formula: formFieldDef.payload[ pConf ].calculatedValue, byConfig: pConf, dependencies: me.getFieldsFromFormula( formFieldDef.payload[ pConf ].calculatedValue ) } );
				}
				if ( formFieldDef.payload && formFieldDef.payload[ pConf ] && formFieldDef.payload[ pConf ].defaultValue ) 
				{
					retArr.push( { name: formFieldDef.id, type: 'defaultValue', formula: formFieldDef.payload[ pConf ].defaultValue, byConfig: pConf, dependencies: me.getFieldsFromFormula( formFieldDef.payload[ pConf ].defaultValue ) } );
				}
			}
			else
			{
				// 2. then prioritize 'default' payloadConfig (if present)
				if ( formFieldDef.payload && formFieldDef.payload.default && ( formFieldDef.payload.default.calculatedValue || formFieldDef.payload.default.defaultValue ) ) //pConf.length && 
				{
					if ( formFieldDef.payload && formFieldDef.payload.default && formFieldDef.payload.default.calculatedValue ) 
					{
						retArr.push( { name: formFieldDef.id, type: 'calculatedValue', formula: formFieldDef.payload.default.calculatedValue, byConfig: 'default', dependencies: me.getFieldsFromFormula( formFieldDef.payload.default.calculatedValue ) } );
					}
					if ( formFieldDef.payload && formFieldDef.payload.default && formFieldDef.payload.default.defaultValue ) 
					{
						retArr.push( { name: formFieldDef.id, type: 'defaultValue', formula: formFieldDef.payload.default.defaultValue, byConfig: 'default', dependencies: me.getFieldsFromFormula( formFieldDef.payload.default.defaultValue ) } );
					}
				}
				else
				{
					// 3. finally prioritize root calculatedValue/defaultValue (if present)
					if ( formFieldDef.calculatedValue ) 
					{
						retArr.push( { name: formFieldDef.id, type: 'calculatedValue', formula: formFieldDef.calculatedValue, byConfig: '', dependencies: me.getFieldsFromFormula( formFieldDef.calculatedValue ) } );
					}
					if ( formFieldDef.defaultValue ) 
					{
						retArr.push( { name: formFieldDef.id, type: 'defaultValue', formula: formFieldDef.defaultValue, byConfig: '', dependencies: me.getFieldsFromFormula( formFieldDef.defaultValue ) } );
					}
				}

			}

		}

		//Util.sortByKey( retArr, 'dependencies' ); // how do we sort by retArr.dependencies.length ?
		retArr.sort( function( a, b ) {
			return ( a.dependencies.length < b.dependencies.length ) ? -1 : ( a.dependencies.length > b.dependencies.length ) ? 1 : 0;
		});

		return retArr;
	};

	me.getFieldsFromFormula = function( evalFormula )
	{

		// accepts formula, e.g. 1: "##{generatePattern(form:walkIn_firstName[LEFT:3]-form:walkIn_motherName[LEFT:3]-form:walkIn_birthDistrict[LEFT:3]-form:walkIn_birthOrder[PADDNUMERIC:2],-,true)}"
		// 						 2: "eval{$('[name=generateVoucher]').val() === 'NO' ? '' : $('[name=voucherCode_ipc_capture]').val()}"
		// returns array,   e.g. 1: [ "walkIn_firstName", "walkIn_motherName", "walkIn_birthDistrict", "walkIn_birthOrder" ]
		// 					     2: [ "generateVoucher", "voucherCode_ipc_capture" ]

		var returnFields = [];
		var formSearch = false, nameSearch = false;

		formSearch = ( evalFormula.indexOf( 'form:' ) >= 0 );
		nameSearch = ( evalFormula.indexOf( 'name=' ) >= 0 );

		if ( ! formSearch && ! nameSearch ) return returnFields;

		var sourceFieldsArr = [], formArr = [], nameArr = [];
		var separatorChars = '';
		
		if ( formSearch ) formArr = evalFormula.split( 'form:' );
		if ( nameSearch ) nameArr = evalFormula.split( 'name=' );

		if ( formArr.length && nameArr.length )
		{
			sourceFieldsArr = formArr.concat( nameArr );
			separatorChars = '[|,|)|+|-|/| |]';
		}
		else
		{
			if ( formArr.length )
			{
				sourceFieldsArr = formArr;
				separatorChars = '[|,|)|+|-|/| ';
			}

			if ( nameArr.length )
			{
				sourceFieldsArr = nameArr;
				separatorChars = ']';
			}
		}

		var separatorArr = separatorChars.split( '|' );

		for( var i = 1; i < sourceFieldsArr.length; i++ ) // from 1 not 0, left side (0) is to be ignored (usually contains reserved '$$function{' part )
		{
			var bFoundCharMatch = false;
			var formulaPart = sourceFieldsArr[ i ];

			for( var s = 0; s < separatorArr.length; s++ )
			{
				if ( ! bFoundCharMatch )
				{
					var sepPart = separatorArr[ s ];

					if ( ( formulaPart ).indexOf( sepPart ) > 0 )
					{
						var fieldName = ( formulaPart ).split( sepPart  )[ 0 ];

						if ( ! returnFields.includes( sepPart ) )
						{
							returnFields.push( fieldName );
							bFoundCharMatch = true;
						}
					}
				}
			}

			bFoundCharMatch = false;
		}

		return returnFields;
	};



	// TODO: Need to review and re-orgnize the code..
	me.evalFormInputFunctions = function( formDivSecTag, thisTag, dispatchChangeEvent )
	{
		// 1. get all evalFunctions (using calculatedValue / defaultValue)
		// 2. determine which evalFunctions + controls have reference to thisTag control
		// 3. only update those controls affected by currentControl value change

		
		//var jData = me.formJsonArr;
		var evalFunctionsToProcess = me.getEvalFormulas();
		var affectedControls;

		// only focus on changing control's value (cascade calculatedValue)
		if ( thisTag )
		{
			affectedControls = evalFunctionsToProcess.filter( function( field ){
				return field.dependencies.includes( thisTag.attr( 'name' ) ) ;
			} );
			/*var evalCalcFunctions = me.getEvalFormulas().filter( function( field ){
				return field.type === 'calculatedValue';
			});
			if ( evalCalcFunctions ) affectedControls.concat( evalCalcFunctions );*/
		}
		else
		{
			affectedControls = evalFunctionsToProcess.filter( function( field ){
				return field.type === 'defaultValue';
			});
		}

		for( var i = 0; i < affectedControls.length; i++ )
		{
			var tagTarget = formDivSecTag.find( '[name="' + affectedControls[ i ].name + '"]' );

			FormUtil.evalReservedField( tagTarget.closest( 'form' ), tagTarget, affectedControls[ i ].formula, dispatchChangeEvent );
		}

	};



	me.setEventsAndRules = function( formItemJson, entryTag, divInputFieldTag, formDivSecTag, formFull_IdList )
	{
		if ( entryTag )
		{
			// Set Event
			entryTag.change( function() 
			{
				var thisTag = $( this );

				if ( thisTag.attr( 'type' ) === 'checkbox' )
				{
					setTimeout( function() {
						me.evalFormInputFunctions( formDivSecTag, thisTag, true ); //.parent()
						me.performEvalActions( thisTag, formItemJson, formDivSecTag, formFull_IdList );		
					}, 100 );
				}
				else
				{
					me.evalFormInputFunctions( formDivSecTag, thisTag, true ); //.parent()
					me.performEvalActions( thisTag, formItemJson, formDivSecTag, formFull_IdList );		
				}
			});
		}

		me.addRuleForField( divInputFieldTag, formItemJson );
		me.addDataTargets( divInputFieldTag, formItemJson ); // added by Greg (9 Apr 19) > dataTargets > for auto-generation of JSON payloads
		me.addStylesForField( divInputFieldTag, formItemJson );
	};



	// ===================================================================



	me.setFieldTagVisibility = function( formItemJson, divInputFieldTag, passedData )
	{		
		// Set Tag Visibility
		if ( formItemJson.display === "hiddenVal" ||  formItemJson.display === "none" )
		{
			divInputFieldTag.hide();
			divInputFieldTag.attr( 'display', 'hiddenVal' );
			//entryTag.attr( 'display', 'hiddenVal' );
		}

		if ( passedData !== undefined 
			&& passedData.hideCase !== undefined 
			&& formItemJson.hideCase !== undefined
			&& formItemJson.hideCase.indexOf( passedData.hideCase ) >= 0 )
		{
			divInputFieldTag.hide(); //divInputFieldTag.find("input,select").remove();
		}

		if ( passedData !== undefined 
			&& passedData.showCase !== undefined 
			&& formItemJson.showCase !== undefined
			&& formItemJson.showCase.indexOf( passedData.showCase ) >= 0 )
		{
			divInputFieldTag.show();
		}
	};


	me.addStylesForField = function( divInputTag, formItemJson )
	{
		var entryTag = divInputTag.find( ".displayValue" ); //select,input

		if( formItemJson.styles !== undefined )
		{
			for ( var i = 0; i < formItemJson.styles.length; i++ )
			{
				var styleDef = formItemJson.styles[i];
				entryTag.css( styleDef.name, styleDef.value );

				/*entryTag.each( function( index, element ){
					$( element ).attr( styleDef.name, styleDef.value );
				});*/
			}
		}

	}

	me.addRuleForField = function( divInputTag, formItemJson )
	{
		var entryTag = divInputTag.find( "select,input" ); // < shouldn't his be .dataValue?
		var regxRules = [];

		if( formItemJson.rules !== undefined )
		{
			for ( var i = 0; i < formItemJson.rules.length; i++ )
			{
				var ruleDef = formItemJson.rules[i];  // could be string name of def or rule object itself.
				var ruleJson = FormUtil.getObjFromDefinition( ruleDef, ConfigManager.getConfigJson().definitionRules );

				if ( ruleJson.name )
				{
					entryTag.attr( ruleJson.name, ruleJson.value );

					if( ruleJson.name === "mandatory" && ruleJson.value === "true" )
					{
						divInputTag.find( 'label' ).first().closest("div").append( $( "<span>*</span>" ) );
					}
				}	
				else if ( ruleJson.pattern )
				{
					var regxRuleJson = {};
					regxRuleJson.pattern = ruleJson.pattern;
					regxRuleJson.msg = ruleJson.msg;

					regxRules.push( regxRuleJson );
				}

				if ( ruleJson.type )
				{
					// all other custom attributes
					entryTag.attr( "type", ruleJson.type );
				}
			}

			if ( regxRules.length > 0 )
			{
				entryTag.attr( "patterns", encodeURI( JSON.stringify( regxRules ) ) );
			} 
		}

	}

	me.addDataTargets = function( divInputTag, formItemJson )
	{
		var entryTag = divInputTag.find( '.dataValue' ); //  ( 'select,input' )
		var pConf = me.payloadConfigSelection;
		var dataTargets;

		// 1. prioritize existing payloadConfig (if match found)
		if ( pConf )
		{
			if ( formItemJson.payload && formItemJson.payload[ pConf ] && formItemJson.payload[ pConf ].dataTargets  )
			{
				dataTargets = formItemJson.payload[ pConf ].dataTargets;
			}
		}

		if ( ! dataTargets )
		{
			// 2. then prioritize 'default' payloadConfig (if present)
			if ( formItemJson.payload && formItemJson.payload.default && formItemJson.payload.default.dataTargets )
			{
				dataTargets = formItemJson.payload.default.dataTargets;
			}
			else
			{
				// 3. finally prioritize root calculatedValue/defaultValue (if present)
				if( formItemJson.dataTargets )
				{
					dataTargets = formItemJson.dataTargets;
				}
			}
		}

		if ( dataTargets )
		{
			entryTag.attr( 'dataTargets', escape( JSON.stringify( dataTargets ) ) );
		}

	}


	// ----------------------------------------------------
	// ---- EVAL Actions Related --------------------------

	me.performEvalActions = function( tag, formItemJson, formDivSecTag, formFull_IdList )
	{
		var tagVal = FormUtil.getTagVal( tag );

		InfoDataManager.setINFOdata( 'thisTag', tag );
		InfoDataManager.setINFOdata( 'formTag', tag.closest( 'form' ) );
		InfoDataManager.setINFOdata( 'formDivSecTag', tag.closest( '.formDivSec' ) );
		InfoDataManager.setINFOdata( 'blockTag', tag.closest( 'div.block' ) );

		if ( tagVal )
		{
			if ( formItemJson.evalActions )
			{
				formItemJson.evalActions.forEach( evalActionJson => {

					me.performEvalAction( evalActionJson, tagVal, formDivSecTag, formFull_IdList );
				});
			}	
		}
	}

	me.performEvalAction = function( evalAction, tagVal, formDivSecTag, formFull_IdList )
	{
		if ( evalAction )
		{
			var conditionPass = false;

			// if condition exists, check to run the conditional case or inverse one..
			if ( evalAction.condition !== undefined )
			{
				if ( me.checkCondition( evalAction.condition, tagVal, formDivSecTag, formFull_IdList ) )
				{
					me.performCondiShowHide( evalAction.shows, formDivSecTag, formFull_IdList, true );
					me.performCondiShowHide( evalAction.hides, formDivSecTag, formFull_IdList, false );
					me.performCondiAction( evalAction.actions, formDivSecTag, false );

					conditionPass = true;
				}
				else if ( evalAction.conditionInverse !== undefined )
				{
					if ( evalAction.conditionInverse.indexOf( "shows" ) >= 0 ) me.performCondiShowHide( evalAction.shows, formDivSecTag, formFull_IdList, false );
					if ( evalAction.conditionInverse.indexOf( "hides" ) >= 0 ) me.performCondiShowHide( evalAction.hides, formDivSecTag, formFull_IdList, true );
					if ( evalAction.conditionInverse.indexOf( "actions" ) >= 0 ) me.performCondiAction( evalAction.actions, formDivSecTag, true );
				}	
			} 

			// If condition does not exists OR condition has passed, run more related things..
			if ( evalAction.condition === undefined || conditionPass )
			{
				// If no condition, simply run the eval..				
				if ( evalAction.runEval ) Util.evalTryCatch( evalAction.runEval, InfoDataManager.getINFO(), 'blockForm.performEvalAction' );
			}
		}
	}

	me.checkCondition = function( evalCondition, tagVal, formDivSecTag, formFull_IdList )
	{
		var result = false;
		var INFO = { 'userRole': ConfigManager.login_UserRoles };

		if ( evalCondition )
		{
			try
			{
				var afterCondStr = me.conditionVarIdToVal( evalCondition, tagVal, formDivSecTag, formFull_IdList )

				result = eval( afterCondStr );	
			}
			catch(ex) 
			{
				console.customLog( 'Failed during condition eval: ' );
				console.customLog( ex );
			}
		}

		return result;
	}

	
	me.conditionVarIdToVal = function( evalCondition, tagVal, formDivSecTag, formFull_IdList )
	{
		// Replace 'this' first.
		evalCondition = Util.replaceAll( evalCondition, '$$(this)', tagVal );

		// Replace other tag val cases.
		for ( var i = 0; i < formFull_IdList.length; i++ )
		{
			var idStr = formFull_IdList[i];
			var matchKeyStr = '$$(' + idStr + ')';

			var tag = me.getMatchingInputTag( formDivSecTag, idStr );

			evalCondition = Util.replaceAll( evalCondition, matchKeyStr, tag.val() );
		}

		return evalCondition;
	}

	me.performCondiAction = function( actions, formDivSecTag, reset )
	{
		if ( actions )
		{
			for ( var i = 0; i < actions.length; i++ )
			{
				var action = actions[i];
					
				if ( action.id )
				{
					var matchingTag = me.getMatchingInputTag( formDivSecTag, action.id );
	
					if ( matchingTag.length > 0 )
					{
						if ( reset ) matchingTag.val( '' );
						else
						{
							if ( action.value ) 
							{
								matchingTag.val( action.value );
								matchingTag.change();
							}
						}	
					}
				}
			}				
		}
	};

	me.performCondiShowHide = function( idList, formDivSecTag, formFull_IdList, visible )
	{
		if ( idList )
		{
			for ( var i = 0; i < idList.length; i++ )
			{
				var idStr = idList[i];
				var targetInputTag = me.getMatchingInputTag( formDivSecTag, idStr );
				var targetInputDivTag = targetInputTag.closest( 'div.fieldBlock');

				if ( visible ) 
				{
					targetInputDivTag.show( 'fast' );

					//console.customLog( 'show by condition: id/name: ' + idStr );

					// target inputs subsequent show/hide
					// Due to parent tag initializing show hide of same target
					// Perform this a bit after time delay
					me.performChildTagEvalActions( idStr, targetInputTag, formDivSecTag, formFull_IdList );
				}
				else 
				{
					targetInputDivTag.hide();
				}  
			}
		}
	};

	me.performChildTagEvalActions = function( idStr, targetInputTag, formDivSecTag, formFull_IdList )
	{
		setTimeout( function() 
		{
			var formItemJson = me.getFormItemJson_FromId( me.formJsonArr, idStr );
			me.performEvalActions( targetInputTag, formItemJson, formDivSecTag, formFull_IdList );
		}, me._childTargetActionDelay );
	};

	me.getMatchingInputTag = function( formDivSecTag, idStr )
	{
		//return formDivSecTag.find( 'input[name="' + idStr + '"],select[name="' + idStr + '"]' );
		return formDivSecTag.find( '[name="' + idStr + '"]' );
	};


	// ---- EVAL Actions Related --------------------------
	// ----------------------------------------------------


	// PopulateFormData by passed in json (Not by config, but by external data)
	me.populateFormData = function( passedData, formDivSecTag )
	{
		if ( passedData !== undefined && passedData.resultData !== undefined )
		{
			// TODO: On WebService side, we should simply create
			//   a list that holds 'id' and 'value' for population...
			//	regardless of type 'tei attribute val', 'dataElement value'
				
			me.populateFormData_Common( formDivSecTag, passedData.resultData );

			// Simpler data population
			if ( passedData.simpleData ) me.populateFormData_ObjByName( formDivSecTag, passedData.simpleData );

			// (Preivously only used for Dhis2 attribute data population) <-- we are assuming this is single list... (could be 2 dimensional array)
			// 
			if ( passedData.displayData ) me.populateFormData_ArrayDataByUid( formDivSecTag, passedData.displayData );
		}
	};


	me.populateFormData_Common = function( formDivSecTag, resultData )
	{
		try 
		{		
			// getProperValue  <-- but 'clientId' and voucherId' could be populated by hidden inputs..
			var clientId = Util.getNotEmpty( resultData.clientId );
			var voucherId = Util.getNotEmpty( resultData.voucherId );

			if ( clientId ) formDivSecTag.find( '[name="clientId"]' ).val( clientId );
			if ( voucherId ) formDivSecTag.find( '[name="voucherId"]' ).val( voucherId );

			clientId = formDivSecTag.find( '[name="clientId"]' ).val();
			voucherId = formDivSecTag.find( '[name="voucherId"]' ).val();
			formDivSecTag.find( '[name="walkInClientCase"]' ).val( me.getWalkInClientCase ( clientId, voucherId ) );
		}
		catch ( errMsg )
		{
			console.customLog( 'Error in blockForm.populateFormData_Common: errMsg: ' + errMsg );
		}		
	};


	me.populateFormData_ObjByName = function( formDivSecTag, jsonData )
	{
		try 
		{
			if ( jsonData && jsonData.clientDetails )
			{
				var clientDetails = jsonData.clientDetails;

				// Need to confirm with Tran/Greg with getting right input control
				var inputTags = formDivSecTag.find( 'input,select' ).filter('.dataValue');

				// Go through each input tags and use 'uid' to match the attribute for data population
				inputTags.each( function( i ) 
				{
					var inputTag = $( this );

					try
					{
						var nameStr = me.removeGroupDotName( inputTag.attr( 'name' ) );
		
						if ( nameStr )
						{
							var data = clientDetails[ nameStr ];

							if ( data && Util.isTypeString( data ) )
							{
								FormUtil.setTagVal( inputTag, data, function() 
								{
									inputTag.change();
								});	
							}
						}	
					}
					catch ( errMsg )
					{
						console.customLog( 'Error in inputTag blockForm.populateFormData_ObjByName: errMsg: ' + errMsg );
					}
				});
			}
		}
		catch ( errMsg )
		{
			console.customLog( 'Error in blockForm.populateFormData_ObjByName: errMsg: ' + errMsg );
		}
	};


	me.populateDisplayValueIfAny = function( divInputFieldTag, formItemJson )
	{
		var dataValue = divInputFieldTag.find(".dataValue").val();
		if( dataValue != "" )
		{	
			var controlType = formItemJson.controlType;

			if( controlType == "YEAR" )
			{
				divInputFieldTag.find(".displayValue").val( dataValue );
			}
			else if( formItemJson.options == undefined && controlType == "CHECKBOX" && dataValue == "true" )
			{
				// For TRUE/FALSE case without options defination
				divInputFieldTag.find("input.displayValue").prop( "checked", true );
			}
			else if( formItemJson.options != undefined )
			{
				var dataValueList = dataValue.split(",");
				var optionList = FormUtil.getObjFromDefinition( formItemJson.options, ConfigManager.getConfigJson().definitionOptions );
				var displayValues = [];

				for ( var i = 0; i < dataValueList.length; i++ )
				{
					var searched = Util.getFromList( optionList, dataValueList[i], "value" );
					if( searched != undefined  && ( controlType == "RADIO" || controlType == "CHECKBOX" ) )
					{
						divInputFieldTag.find("input[id='opt_" + dataValueList[i] + "']").prop( "checked", true );
					}
					else if( controlType == "DROPDOWN_AUTOCOMPLETE" || controlType == "MULTI_CHECKBOX" )
					{	
						var displayValue = ( searched == undefined ) ? dataValueList[i] : TranslationManager.translateText( searched.defaultName, searched.poTerm );
						displayValues.push( displayValue );
					}
				}

				if( displayValues.length > 0 )
				{
					divInputFieldTag.find(".displayValue").val( displayValues.join(",") );
				}
			}
			
		}

	}

	// Populates data (downloaded from web) to form
	me.populateFormData_ArrayDataByUid = function( formDivSecTag, attributes )
	{
		try 
		{
			// If double array, get content array (subArray)
			attributes = me.getContentArr( attributes );

			// NOTE: Since uid are placed in right hidden 'dataValue' class, we do not need to worry about
			// finding the right tag..
			var inputTags = formDivSecTag.find( 'input.dataValue,select.dataValue' );

			// Go through each input tags and use 'uid' to match the attribute for data population
			inputTags.each( function( i ) 
			{
				var inputTag = $( this );

				try 
				{
					var uidStr = inputTag.attr( 'uid' );					
					if ( uidStr == undefined ||  uidStr === "undefined" ) {
						uidStr = inputTag.attr( 'name' ); // If uid='undefined', use 'name' value for data matching id.
					}

					if ( uidStr )
					{
						var attrJson = Util.getFromList( attributes, uidStr, "id" );
						
						if ( attrJson )
						{
							var val = attrJson.value;

							if ( Util.isTypeArray( val ) ) val = val[0];  // if array, like 'voucherCde'/'users', get the 1st val..

							FormUtil.setTagVal( inputTag, val, function() 
							{
								var formItemJson = me.formJsonConfig[inputTag.attr("name")];
								me.populateDisplayValueIfAny( inputTag.closest("div.fieldBlock"), formItemJson );
	
								inputTag.change();
							});	
							//FormUtil.setFormCtrlDataValue( inputTag, attrJson.value );
						}
					}					
				}
				catch ( errMsg )
				{
					console.customLog( 'Error in inputTag blockForm.populateFormData_ArrayDataByUid: errMsg: ' + errMsg );
				}

			});
		}
		catch ( errMsg )
		{
			console.customLog( 'Error in blockForm.populateFormData_ArrayDataByUid: errMsg: ' + errMsg );
		}
	};


	me.getContentArr = function( input )
	{
		var contentArr = input;

		if ( Util.isTypeArray( input ) )
		{
			if ( input.length > 0 && Util.isTypeArray( input[0] ) )
			{
				contentArr = input[0];
			}
		}

		return contentArr;
	};

	me.removeGroupDotName = function( inputNameStr )
	{
		var outputName = '';

		try
		{
			// In case input name has group name with dot (ex. 'clientDetail.phoneNumber' )
			// remove the groupName: 'clientDetail.phoneNumber' --> 'phoneNumber'
			if ( inputNameStr )
			{
				if ( inputNameStr.indexOf( '.' ) > 0 )
				{
					var splitNames = inputNameStr.split( '.' );
					outputName = splitNames[1];
				}
				else
				{
					outputName = inputNameStr;
				}
			}
		}
		catch ( errMsg )
		{
			console.customLog( 'Error in blockForm.removeGroupDotName: errMsg: ' + errMsg );
		}

		return outputName;
	};


	me.getWalkInClientCase = function( clientId, voucherId )
	{
		var walkInClientCase = "";
		var hasClient = ( clientId !== undefined && clientId !== "" );
		var hasVoucherId = ( voucherId !== undefined && voucherId !== "" );
		
		if ( hasClient && hasVoucherId ) 
		{
			walkInClientCase = "1";
		}
		else if ( hasClient && !hasVoucherId )
		{
			walkInClientCase = "2";
		}
		else
		{
			walkInClientCase = "3";
		}

		return walkInClientCase;
	}

	// TRAN TODO 
	me.createListOptions_Items = function( targetTag, formItemJson, type, addClass, targetInputTag, targetDisplayText )
	{
		var optionList = FormUtil.getObjFromDefinition( formItemJson.options, ConfigManager.getConfigJson().definitionOptions );
		var hiddenTarget = $( Templates.inputFieldHidden );

		targetTag.append( hiddenTarget );

		hiddenTarget.attr( 'id', formItemJson.id );
		hiddenTarget.addClass( 'dataValue' );
		
		if ( optionList === undefined )
		{
			// create single item ( on / off ) for checkbox ONLY
			if ( type === 'checkbox' )
			{
				var checkboxTag = $( Templates.inputFieldCheckbox_SingleItem );

				var inputTag = checkboxTag.find( 'input' );
				inputTag.addClass( 'displayValue' );
				inputTag.attr( 'id', 'option_' + formItemJson.id );
				inputTag.attr( 'single', 'true' );
				inputTag.attr( 'updates', formItemJson.id );


				checkboxTag.find( 'label' ).attr( 'for', 'option_' + formItemJson.id );
				// checkboxTag.find( 'label' ).html( '' );

				me.createListOption_UpdateEvent( checkboxTag.find( 'input' ) , targetInputTag, targetDisplayText );

				targetTag.append( checkboxTag ); 
			}
		}
		else
		{
			// create multiple items

			for ( var i = 0; i < optionList.length; i++ )
			{
				var optItem = optionList[ i ];

				if ( type === 'radio' )
				{
					newOpt = $( Templates.inputFieldRadio_Item );
				}
				else if ( type === 'checkbox' )
				{
					newOpt = $( Templates.inputFieldCheckbox_Item );
				}

				var labelTerm = TranslationManager.translateText( optItem.defaultName, optItem.poTerm )

				if ( addClass ) newOpt.addClass( addClass );

				newOpt.first( 'div' ).attr( 'searchText', labelTerm );

				newOpt.find( 'input' ).attr( 'name', 'search_opt_' + formItemJson.id );
				newOpt.find( 'input' ).attr( 'id', 'option_' + optItem.value );
				newOpt.find( 'input' ).attr( 'value', optItem.value );
				newOpt.find( 'input' ).attr( 'targetName', formItemJson.id );
				newOpt.find( 'input' ).attr( 'single', 'false' );
				
				newOpt.find( 'input' ).addClass( 'displayValue' );
				
	
				newOpt.find( 'label' ).attr( 'for', 'option_' + optItem.value );
				newOpt.find( 'label' ).text( labelTerm );

				me.createListOption_UpdateEvent( newOpt.find( 'input' ), targetInputTag, targetDisplayText );
	
				targetTag.append( newOpt );
			}


			if( targetInputTag != undefined )
			{
				// Select options if any
				var selectedIs = targetInputTag.val().split(",");
				for( var i=0; i<selectedIs.length; i++ )
				{
					targetTag.find( '[id="option_' + selectedIs[i] + '"]' ).prop("checked", true );
				}
			}

		}

	}

	me.createListOption_UpdateEvent = function( listOptionTag, targetInputTag, targetDisplayText )
	{
		if ( listOptionTag.attr( 'single' ) === 'true' )
		{
			listOptionTag.on( 'click', function(){

				var inputUpdates = $( '#' + $( this ).attr( 'updates' ) );

				inputUpdates.val( ( $( this ).is( ':checked' ) ? 'true' : 'false' ) );

			} );
		}
		else
		{

			listOptionTag.on( 'click', function(){

				var targUpdates = $( this ).attr( 'updates' );
				// var inputUpdates = $( '#' + targUpdates );
				var listOpts = $( 'input[targetName="' + targUpdates + '"]' );
				var selectedValueList = [];
				var selectedTextList = [];

				listOpts.each(function() {

					if ( $( this ).is( ':checked' ) ) {
						var name = $( this ).val();
						var text = $( this ).closest(  ".radio-group" ).find("label").html();

						selectedValueList.push( name );
						selectedTextList.push( text );
					}
				});

				
				var inputUpdates = $( '#' + targUpdates );
				inputUpdates.val( selectedValueList.join(",") );

				if( targetInputTag != undefined  )
				{
					targetDisplayText.val( selectedTextList.join(",") );
					targetInputTag.val( selectedValueList.join(",") );
				}


			});

		}
	}


	// -------------------------------
	
	me.initialize();
}