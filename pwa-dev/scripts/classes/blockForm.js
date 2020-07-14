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
			var autoComplete = AppInfoManager.getSessionAutoComplete();
			var formTag = $( '<form autocomplete="' + autoComplete + '"></form>' );

			formDivSecTag.append( formTag );

			blockTag.append( formDivSecTag );

			var formFieldGroups = me.getFormGroupingJson( formJsonArr, formGrps );
			var groupsCreated = [];

			for( var i = 0; i < formFieldGroups.length; i++ )
			{
				var groupDivTag = me.createGroupDivTag( formFieldGroups[ i ], groupsCreated, formTag );

				var formItemJson = formJsonArr[ formFieldGroups[ i ].seq ];

				me.formJsonConfig[formItemJson.id] = formItemJson;

				var inputFieldTag = me.createInputFieldTag( formItemJson, me.payloadConfigSelection, formTag, passedData, formJsonArr, autoComplete );
				groupDivTag.append( inputFieldTag );

				formTag.append( groupDivTag );
			}

			
			ValidationUtil.disableValidation( function() 
			{
				me.populateFormData( passedData, formTag );
				me.evalFormGroupDisplayStatus( formTag );
	
				// NOTE: TRAN VALIDATION
				ValidationUtil.setUp_Events( formTag );
	
				//NOTE (Greg): 500ms DELAY SOLVES PROBLEM OF CALCULATED DISPLAY VALUES BASED ON FORM:XXX VALUES
				setTimeout( function(){
					me.evalFormInputFunctions( formTag );
				}, 500 );
	
				// Run change event of dataValue tag in case there are some default Values which can required to show/hide some fields in form
				formDivSecTag.find(".dataValue:not(:empty)").change();
		
			});
		}
	}

	me.createGroupDivTag = function( formFieldGroup, groupsCreated, formTag )
	{
		var groupDivTag = formTag;

		if ( ( formFieldGroup.group ).toString().length )
		{
			if ( ! groupsCreated.includes( formFieldGroup.group ) )
			{
				groupDivTag = $( '<div class="formGroupSection" name="' + formFieldGroup.group + '"><div class="section"><label>' + formFieldGroup.group + '</label></div></div>' );
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
			// TRAN TODO : NEED TO do something about it
			if ( ( formFieldGroup.group ).toString().length == 0 )
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


		divInputFieldTag.find( 'div.field__selector' ).append( entryTag );

		return divInputFieldTag;
	}

	me.createRadioDialogFieldTag = function( formItemJson )
	{
		var divInputFieldTag = $( Templates.inputFieldStandard );
		divInputFieldTag.find( 'label.displayName' ).attr( 'term', formItemJson.term ).text( formItemJson.defaultName );

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
					var displayValue = me.cwsRenderObj.langTermObj.translateText( optionConfig.defaultName, optionConfig.poTerm );
					displayValues.push( displayValue );
				}
			}

			displayTag.val( displayValues.join(",") );
		}
		
		
	}
	

	me.createLabelFieldTag = function( formItemJson )
	{
		var divInputFieldTag = $( Templates.labelField );

		divInputFieldTag.html( formItemJson.defaultName );

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

		Util2.populate_year( yearFieldTag[0], data, me.cwsRenderObj.langTermObj.translateText( formItemJson.defaultName, formItemJson.term ) );

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
		var formatMask = formatDate.split( dtmSeparator ).reduce( (acum, item) => {
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

		var yearRange = ( formItemJson.yearRange ) ? formItemJson.yearRange : { 'from': -100, 'to': 1 };
		var tagOfClick = Util.isMobi() ? button.parent() : button;

		tagOfClick.click( function(e) {
			if(Util.isMobi()) entryTag.blur()
			var dtmPicker = new mdDateTimePicker.default({
				type: 'date',
				init: ( entryTag[ 0 ].value == '') ? moment() : moment( entryTag[ 0 ].value ),
				past: moment().add( yearRange.from, 'years'), // Date min 
				future: moment().add( yearRange.to, 'years')  // Date max
			} );

			e.preventDefault();
			dtmPicker.toggle();

			var inputDate = entryTag[ 0 ];
			dtmPicker.trigger = inputDate;

			inputDate.addEventListener('onOk', function() {

				var trueFormat = ( formatDate == '' ) ? 'YYYY' : formatDate;
				var inpDate = $( '[name=' + formItemJson.id + ']' );

				inpDate.val( dtmPicker.time.format( trueFormat ) );

				FormUtil.dispatchOnChangeEvent( inpDate );

			});

		});

		var divInputFieldTag = me.createInputFieldTag_Standard( formItemJson );
		divInputFieldTag.find(".field__left").append( wrapperDad );

		return divInputFieldTag;
	}

	me.createRadioFieldTag = function( formItemJson )
	{
		var divInputFieldTag = $( Templates.inputFieldRadio );

		var checkLabel = divInputFieldTag.find( '.displayName' );
		checkLabel.html( formItemJson.defaultName );

		// Create a hidden input tag to save selected option value
		var hiddenTarget = $( Templates.inputFieldHidden );
		hiddenTarget.addClass( "dataValue" );
		hiddenTarget.attr( "name", formItemJson.id );
		divInputFieldTag.append( hiddenTarget );

		// Create Option list
		me.createRadioItemTags( divInputFieldTag, formItemJson );

		return divInputFieldTag;
	}

	me.createCheckboxFieldTag = function( formItemJson )
	{
		var divInputFieldTag = $( Templates.inputFieldCheckbox );
		divInputFieldTag.find( '.displayName' ).html( formItemJson.defaultName );
			

		// Create Option list
		me.createCheckboxItems( divInputFieldTag, formItemJson )

		return divInputFieldTag;
	}

	

	// =============================================
	// === Supportive for INPUT fields =============

	// For RADIO items
	me.createRadioItemTags = function( divInputFieldTag, formItemJson )
	{
		/* 
		<div class="radiobutton-col ">
          <div class="radio-group horizontal">
            <input name="group2" type="radio" id="radioName3">
            <label for="radioName3">1. radio button
            </label>
          </div>
          <div class="radio-group horizontal">
            <input name="group2" type="radio" id="radioName4">
            <label for="radioName4">2. radio button
            </label>
          </div>
		</div>
		*/
		
		var optionDivListTag = divInputFieldTag.find(".radiobutton-col");
		var optionList = FormUtil.getObjFromDefinition( formItemJson.options, ConfigManager.getConfigJson().definitionOptions );
		var defaultValueList = ( formItemJson.defaultValue == undefined ) ? [] : formItemJson.defaultValue.split(",");
		var displayTag = divInputFieldTag.find(".displayValue");
		
		
		for ( var i = 0; i < optionList.length; i++ )
		{
			var optionDivTag = $( Templates.inputFieldRadio_Item );

			me.setAttributesForInputItem( displayTag, optionDivTag, formItemJson.id, optionList[ i ], defaultValueList.includes( optionList[ i ].value ) );

			optionDivListTag.append( optionDivTag );

			me.setupEvents_RadioItemTags( divInputFieldTag, optionDivTag.find( 'input' ) );
		}
	}

	me.setAttributesForInputItem = function( displayTag, optionDivTag, targetId, optionConfig, isChecked )
	{
		var optionInputTag = optionDivTag.find( 'input' );
		optionInputTag.attr( 'name', 'opt_' + targetId );
		optionInputTag.attr( 'id', 'opt_' + optionConfig.value ); // Need for css to make check-mark
		optionInputTag.attr( 'value', optionConfig.value ); // Use to fill the selected option value to input.dataValue
		optionInputTag.prop( "checked", isChecked );

		var labelTag = optionDivTag.find( 'label' );
		var labelTerm = me.cwsRenderObj.langTermObj.translateText( optionConfig.defaultName, optionConfig.poTerm );
		labelTag.attr( 'for', 'opt_' + optionConfig.value );
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
			targetInputTag.val( $(this).val() );
		});
	}

	// For checkbox items
	me.createCheckboxItems = function( divInputFieldTag, formItemJson )
	{
		var optionDivListTag = divInputFieldTag.find(".checkbox-col");
		var optionList = FormUtil.getObjFromDefinition( formItemJson.options, ConfigManager.getConfigJson().definitionOptions );
		
		// For TRUE/FALSE case without options defination
		if ( optionList === undefined )
		{
			var optionDivTag = $( Templates.inputFieldCheckbox_SingleItem );

			var optionInputTag = optionDivTag.find( 'input' );
			optionInputTag.attr( 'id', "opt_" + formItemJson.id );
			optionInputTag.attr( 'name', formItemJson.id );


			optionDivTag.find("label").attr("for", "opt_" + formItemJson.id );

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

				me.setupEvents_CheckBoxItemsTags( divInputFieldTag, optionDivTag.find("input") );
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

	me.setupEvents_CheckBoxItemsTags = function( divInputFieldTag, optionInputTag )
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
		});
	}

	// For RADIO/CHECKBOX dialog
	me.createSearchOptions_Dialog = function( divInputFieldTag, formItemJson, type )
	{
		var dialogForm = $( Templates.searchOptions_Dialog );
		dialogForm.find(".dialog__text").addClass("checkbox"); 

		var optsContainer = dialogForm.find( '.optsContainer' );
		dialogForm.find( '.title' ).html( me.cwsRenderObj.langTermObj.translateText( formItemJson.defaultName, formItemJson.term ) );

		if( type == 'radio')
		{
			optsContainer.addClass("radiobutton-col");

			// Create Item list
			me.createRadioItemTags( dialogForm, formItemJson );
		}
		else
		{
			optsContainer.addClass("checkbox-col");
			optsContainer.addClass("checkbox__wrapper");

			// Create Item list
			me.createCheckboxItems( dialogForm, formItemJson );

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

			targetDisplayTag.val( "" );
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

			var checkedItems = dialogTag.find("input[name='opt_" + targetInputTag.attr("name") + "']:checked");
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

		// TODO:!!!  We are assuming that formGroup is always a string with definition defined!!!!
		//		Need to change this!


		// There are some hidden data which are put in hidden INPUT tag without any group. 
		// This one need to genrerate first so that data in these fields can be used after that
		var groupNone = me._groupNoneId; 
		var nonGroup = [];

		// 1. copy the array..
		var newArr = JSON.parse( JSON.stringify( formJsonArr ) );
		var retGrpArr = [];

		// 2. loop each form control and create formGroup...  even none ones...
		for( var i = 0; i < newArr.length; i++ )
		{
			var frmCtrl = newArr[ i ];

			if ( newArr[ i ].formGroup == undefined || newArr[ i ].formGroup == '' )
			{
				nonGroup.push ( { 'id': newArr[ i ].id, 'group': groupNone, seq: i, created: 0, display: ( newArr[ i ].display == 'hiddenVal' || newArr[ i ].display == 'none' ) ? 0 : 1, order: 999 } );
			}
			else
			{
				retGrpArr.push ( { 'id': newArr[ i ].id, 'group': frmGroupJson[ newArr[ i ].formGroup ].defaultName, seq: i, created: 0, display: ( newArr[ i ].display == 'hiddenVal' || newArr[ i ].display == 'none' ) ? 0 : 1, order: frmGroupJson[ newArr[ i ].formGroup ].order } );
			}
		}

		// SORTING should be inherited from preconfigured 'Group' object sort value
		Util.sortByKey( retGrpArr, 'order' );

		// Add "non group" INPUT fields in beginging of list
		for( var i = 0; i<nonGroup.length; i++ )
		{
			retGrpArr.unshift( nonGroup[i] );
		}

		for( var i = 0; i < retGrpArr.length; i++ )
		{
			if ( retGrpArr[ i ].group == groupNone )
			{
				retGrpArr[ i ].group = '';
			}
		}

		return retGrpArr;
	}

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

	me.evalFormInputFunctionsOLD = function( formDivSecTag )
	{
		if ( formDivSecTag )
		{
			if ( me.formJsonArr != undefined )
			{
				var jData = me.formJsonArr;
				var pConf = FormUtil.block_payloadConfig;

				for( var i = 0; i < jData.length; i++ )
				{
					if( jData[i].controlType !== "LABEL" )
					{
						// if ( jData[ i ].defaultValue || jData[ i ].payload )
						var inputVal = formDivSecTag.find("[name='" + jData[ i ].id + "']").val();
						if ( inputVal || jData[ i ].payload )
						{
							var EvalActionString = '';

							if (inputVal ) EvalActionString = inputVal;

							if ( jData[ i ].payload && jData[ i ].payload[ pConf ] && jData[ i ].payload[ pConf ].defaultValue ) EvalActionString = jData[ i ].payload[ pConf ].defaultValue;

							if ( EvalActionString.length )
							{
								var tagTarget = formDivSecTag.find( '[name="' + jData[ i ].id + '"]' );

								FormUtil.evalReservedField( tagTarget.closest( 'form' ), tagTarget, EvalActionString );
							}

						}
					}

				}

			}

		}

	};


	me.getEvalFormulas = function()
	{
		var jData = me.formJsonArr;
		var pConf = FormUtil.block_payloadConfig;
		var retArr = [];

		for( var i = 0; i < jData.length; i++ )
		{
			// prioritize existing payloadConfig
			if ( pConf.length )
			{
				if ( jData[ i ].payload && jData[ i ].payload[ pConf ] && jData[ i ].payload[ pConf ].calculatedValue ) 
				{
					retArr.push( { name: jData[ i ].id, type: 'calculatedValue', formula: jData[ i ].payload[ pConf ].calculatedValue, byConfig: pConf, dependencies: me.getFieldsFromFormula( jData[ i ].payload[ pConf ].calculatedValue ) } );
				}
				if ( jData[ i ].payload && jData[ i ].payload[ pConf ] && jData[ i ].payload[ pConf ].defaultValue ) 
				{
					retArr.push( { name: jData[ i ].id, type: 'defaultValue', formula: jData[ i ].payload[ pConf ].defaultValue, byConfig: pConf, dependencies: me.getFieldsFromFormula( jData[ i ].payload[ pConf ].defaultValue ) } );
				}
			}
			else
			{
				if ( jData[ i ].calculatedValue ) 
				{
					retArr.push( { name: jData[ i ].id, type: 'calculatedValue', formula: jData[ i ].calculatedValue, byConfig: '', dependencies: me.getFieldsFromFormula( jData[ i ].calculatedValue ) } );
				}
				if ( jData[ i ].defaultValue ) 
				{
					retArr.push( { name: jData[ i ].id, type: 'defaultValue', formula: jData[ i ].defaultValue, byConfig: '', dependencies: me.getFieldsFromFormula( jData[ i ].defaultValue ) } );
				}
			}

		}

		return retArr;
	};

	me.getFieldsFromFormula = function( evalFormula )
	{
		var returnFields = [];

		if ( evalFormula.indexOf( 'form:' ) < 0 )
		{
			return returnFields;
		}

		// accepts formula, e.g. "##{generatePattern(form:walkIn_firstName[LEFT:3]+form:walkIn_motherName[LEFT:3]+form:walkIn_birthDistrict[LEFT:3]-form:walkIn_birthOrder[PADDNUMERIC:2],-,true)}"
		// returns array containing [ "walkIn_firstName", "walkIn_motherName", "walkIn_birthDistrict", "walkIn_birthOrder" ]

		var sourceFieldsArr = evalFormula.split( 'form:' );
		var separatorChars = '[|)|+|-| |,';
		var separatorArr = separatorChars.split( '|' );

		for( var i = 0; i < sourceFieldsArr.length; i++ )
		{
			var bFoundCharMatch = false;

			for( var s = 0; s < separatorArr.length; s++ )
			{
				if ( ! bFoundCharMatch )
				{
					if ( ( sourceFieldsArr[ i ] ).indexOf( separatorArr[ s ] ) > 0 )
					{
						var fieldName = ( sourceFieldsArr[ i ] ).split( separatorArr[ s ]  )[ 0 ];
	
						if ( ! returnFields.includes( separatorArr[ s ] ) )
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


	me.evalFormInputFunctions = function( formDivSecTag, thisTag )
	{
		// 1. get all evalFunctions (using calculatedValue / defaultValue)
		// 2. determine which evalFunctions + controls have reference to thisTag control
		// 3. only update those controls affected by currentControl value change

		
		var jData = me.formJsonArr;

		// only focus on changing control's value (cascade calculatedValue)
		if ( thisTag )
		{
			var evalFunctionsToProcess = me.getEvalFormulas().filter( function( field ){
				return field.type === 'calculatedValue';
			});
			var affectedControls = evalFunctionsToProcess.filter( function( field ){
				return field.dependencies.includes( thisTag.attr( 'name' ) );
			} );

			//console.log( affectedControls );

			for( var i = 0; i < affectedControls.length; i++ )
			{
				var inputVal = thisTag.val();
				var tagTarget = formDivSecTag.find( '[name="' + affectedControls[ i ].name + '"]' );

				FormUtil.evalReservedField( tagTarget.closest( 'form' ), tagTarget, affectedControls[ i ].formula );
			}

		}
		else
		{
			var evalFunctionsToProcess = me.getEvalFormulas().filter( function( field ){
				return field.type === 'defaultValue';
			});
		}

		if ( me.formJsonArr != undefined )
		{
			var jData = me.formJsonArr;
			var pConf = FormUtil.block_payloadConfig;
			var findName = ( thisTag ) ? thisTag.attr( 'name' ) : '';

			for( var i = 0; i < jData.length; i++ )
			{
				var inputVal;
				var EvalActionString = '';

				if ( findName.length && findName === jData[ i ].id )
				{
					inputVal = thisTag.val();
				}
				else
				{
					inputVal = formDivSecTag.find("[name='" + jData[ i ].id + "']").val();
				}

				//if( jData[i].controlType !== "LABEL" )
				if ( inputVal || jData[ i ].payload )
				{
					if (inputVal ) EvalActionString = inputVal;

					if ( jData[ i ].payload && jData[ i ].payload[ pConf ] && jData[ i ].payload[ pConf ].defaultValue ) EvalActionString = jData[ i ].payload[ pConf ].defaultValue;

					if ( EvalActionString.length )
					{
						var tagTarget = formDivSecTag.find( '[name="' + jData[ i ].id + '"]' );

						FormUtil.evalReservedField( tagTarget.closest( 'form' ), tagTarget, EvalActionString );
					}

					// GREG @Tran/@James: added "calculatedValue" but should probably be reorganized
					if ( jData[ i ].payload && jData[ i ].payload[ pConf ] && jData[ i ].payload[ pConf ].calculatedValue )
					{
						var tagTarget = formDivSecTag.find( '[name="' + jData[ i ].id + '"]' );

						FormUtil.evalReservedField( tagTarget.closest( 'form' ), tagTarget, jData[ i ].payload[ pConf ].calculatedValue );
					}

				}

			}

		}
	};

	me.setEventsAndRules = function( formItemJson, entryTag, divInputFieldTag, formDivSecTag, formFull_IdList )
	{
		if ( entryTag )
		{
			// Set Event
			entryTag.change( function() 
			{
				me.evalFormInputFunctions( formDivSecTag, entryTag ); //.parent()
				me.performEvalActions( $(this), formItemJson, formDivSecTag, formFull_IdList );
			});
		}

		me.addRuleForField( divInputFieldTag, formItemJson );
		me.addDataTargets( divInputFieldTag, formItemJson ); // added by Greg (9 Apr 19) > dataTargets > for auto-generation of JSON payloads
		me.addStylesForField( divInputFieldTag, formItemJson );
	};


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
		var entryTag = divInputTag.find( "select,input" );

		if( formItemJson.styles !== undefined )
		{
			for ( var i = 0; i < formItemJson.styles.length; i++ )
			{
				var styleDef = formItemJson.styles[i];
				//entryTag.css( styleDef.name, styleDef.value );

				entryTag.each( function( index, element ){
					$( element ).attr( styleDef.name, styleDef.value );
				}); 
			}
		}

	}

	me.addRuleForField = function( divInputTag, formItemJson )
	{
		var entryTag = divInputTag.find( "select,input" ); 
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
		var entryTag = divInputTag.find( "select,input" );

		if( formItemJson.dataTargets !== undefined )
		{
			entryTag.attr( 'dataTargets', escape( JSON.stringify( formItemJson.dataTargets ) ) );
		}
		else
		{
			if( formItemJson.payload && formItemJson.payload.default && formItemJson.payload.default.dataTargets )
			{
				entryTag.attr( 'dataTargets', escape( JSON.stringify( formItemJson.payload.default.dataTargets ) ) );
			}
		}


	}


	// ----------------------------------------------------
	// ---- EVAL Actions Related --------------------------

	me.performEvalActions = function( tag, formItemJson, formDivSecTag, formFull_IdList )
	{
		var tagVal = FormUtil.getTagVal( tag );

		if ( tagVal )
		{
			if ( formItemJson.evalActions !== undefined )
			{
				for ( var i = 0; i < formItemJson.evalActions.length; i++ )
				{
					me.performEvalAction( formItemJson.evalActions[i], tagVal, formDivSecTag, formFull_IdList );
				}
			}	
		}
	}

	me.performEvalAction = function( evalAction, tagVal, formDivSecTag, formFull_IdList )
	{
		if ( evalAction !== undefined )
		{
			if ( me.checkCondition( evalAction.condition, tagVal, formDivSecTag, formFull_IdList ) )
			{
				me.performCondiShowHide( evalAction.shows, formDivSecTag, formFull_IdList, true );
				me.performCondiShowHide( evalAction.hides, formDivSecTag, formFull_IdList, false );
				me.performCondiAction( evalAction.actions, formDivSecTag, false );
			}
			else
			{
				if ( evalAction.conditionInverse !== undefined )
				{
					if ( evalAction.conditionInverse.indexOf( "shows" ) >= 0 ) me.performCondiShowHide( evalAction.shows, formDivSecTag, formFull_IdList, false );
					if ( evalAction.conditionInverse.indexOf( "hides" ) >= 0 ) me.performCondiShowHide( evalAction.hides, formDivSecTag, formFull_IdList, true );
					if ( evalAction.conditionInverse.indexOf( "actions" ) >= 0 ) me.performCondiAction( evalAction.actions, formDivSecTag, true );
				}
			}			
		}
	}

	me.checkCondition = function( evalCondition, tagVal, formDivSecTag, formFull_IdList )
	{
		var result = false;

		if ( evalCondition )
		{
			try
			{
				var afterCondStr = me.conditionVarIdToVal( evalCondition, tagVal, formDivSecTag, formFull_IdList )

				result = eval( afterCondStr );	
			}
			catch(ex) 
			{
				console.log( 'Failed during condition eval: ' );
				console.log( ex );
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

					//console.log( 'show by condition: id/name: ' + idStr );

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
			console.log( 'Error in blockForm.populateFormData_Common: errMsg: ' + errMsg );
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
						console.log( 'Error in inputTag blockForm.populateFormData_ObjByName: errMsg: ' + errMsg );
					}
				});
			}
		}
		catch ( errMsg )
		{
			console.log( 'Error in blockForm.populateFormData_ObjByName: errMsg: ' + errMsg );
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
						var displayValue = ( searched == undefined ) ? dataValueList[i] : me.cwsRenderObj.langTermObj.translateText( searched.defaultName, searched.poTerm );
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
							inputTag.val(attrJson.value);

							var formItemJson = me.formJsonConfig[inputTag.attr("name")];
							me.populateDisplayValueIfAny( inputTag.closest("div.fieldBlock"), formItemJson );

							inputTag.change();

							// // ADDED - CheckBox mark by passed in data + perform change event if passed in value are populated.
							// FormUtil.setTagVal( inputTag, attrJson.value, function() 
							// {
							// 	var formItemJson = me.formJsonConfig[inputTag.attr("name")];
							// 	me.populateDisplayValueIfAny( inputTag.closest("div.fieldBlock"), formItemJson );

							// 	inputTag.change();
							// });
						}
					}					
				}
				catch ( errMsg )
				{
					console.log( 'Error in inputTag blockForm.populateFormData_ArrayDataByUid: errMsg: ' + errMsg );
				}

			});
		}
		catch ( errMsg )
		{
			console.log( 'Error in blockForm.populateFormData_ArrayDataByUid: errMsg: ' + errMsg );
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
			console.log( 'Error in blockForm.removeGroupDotName: errMsg: ' + errMsg );
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

				var labelTerm = me.cwsRenderObj.langTermObj.translateText( optItem.defaultName, optItem.poTerm )

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