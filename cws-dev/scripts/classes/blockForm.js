// -------------------------------------------
// -- BlockForm Class/Methods
function BlockForm( cwsRenderObj, blockObj, validationObj, actionJson )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	me.validationObj = validationObj;
	me.actionJson = actionJson;

	me.payloadConfigSelection;
	me.formJsonArr;
	me._childTargetActionDelay = 400;
	me._groupNoneId = 'zzzEmpty';

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
			var autoComplete = 'autocomplete="' + JSON.parse( localStorage.getItem(Constants.storageName_session) ).autoComplete + '"';
			var formTag = $( '<form ' + autoComplete + '></form>' );

			formDivSecTag.append( formTag )
			blockTag.append( formDivSecTag );

			var formFull_IdList = me.getIdList_FormJson( formJsonArr );
			var formFieldGroups = me.getFormGroupingJson( formJsonArr, formGrps );
			var formUniqueGroups = me.getFormUniqueGroups( formFieldGroups );
			var groupsCreated = [];

			if ( formUniqueGroups.length > 1 ) //minimum of 1 = 'no groups defined'
			{
				//set grid layout
				formDivSecTag.css( 'display', 'grid' );
			}
			else
			{
				//set block layout
				formDivSecTag.css( 'display', 'block' );
			}

			for( var i = 0; i < formFieldGroups.length; i++ )
			{
				var controlGroup = me.createControlsGroup( formFieldGroups[ i ], groupsCreated, formTag, formDivSecTag );

				if ( me.blockObj.blockType === FormUtil.blockType_MainTabContent )
				{
					if ( formJsonArr[ formFieldGroups[ i ].seq ].controlType === 'SHORT_TEXT' || 
						formJsonArr[ formFieldGroups[ i ].seq ].controlType === 'INT' ||
						formJsonArr[ formFieldGroups[ i ].seq ].controlType === 'DROPDOWN_LIST' || 
						formJsonArr[ formFieldGroups[ i ].seq ].controlType === 'DROPDOWN_AUTOCOMPLETE' ||
						formJsonArr[ formFieldGroups[ i ].seq ].controlType === 'MULTI_CHECKBOX' ||
						formJsonArr[ formFieldGroups[ i ].seq ].controlType === 'YEAR' ||
						formJsonArr[ formFieldGroups[ i ].seq ].controlType === 'DATE' ||
						formJsonArr[ formFieldGroups[ i ].seq ].controlType === 'IMAGE'||
						formJsonArr[ formFieldGroups[ i ].seq ].controlType === 'LABEL' )
					{
						me.renderInputFieldControls( formJsonArr[ formFieldGroups[ i ].seq ], controlGroup, formTag, formFull_IdList, passedData, me.payloadConfigSelection );
					}
					else
					{
						me.renderNewUI_InputFieldControls( formJsonArr[ formFieldGroups[ i ].seq ], controlGroup, formTag, formFull_IdList, passedData, me.payloadConfigSelection );
					}
				}
				/*else
				{
					me.renderInput( formJsonArr[ formFieldGroups[ i ].seq ], controlGroup, formTag, formFull_IdList, passedData, me.payloadConfigSelection );
				}*/

			}

			formDivSecTag.attr( 'data-fields', escape( JSON.stringify( formJsonArr ) ) );

			me.populateFormData( passedData, formDivSecTag );
			me.evalFormGroupDisplayStatus( formDivSecTag );

			// NOTE: TRAN VALIDATION
			me.validationObj.setUp_Events( formDivSecTag );

			//NOTE (Greg): 500ms DELAY SOLVES PROBLEM OF CALCULATED DISPLAY VALUES BASED ON FORM:XXX VALUES
			setTimeout( function(){
				me.evalFormInputFunctions( formDivSecTag );
			}, 500 );

		}

	}

	me.createControlsGroup = function( formFieldGroup, groupsCreated, formTag, formDivSecTag )
	{
		if ( ( formFieldGroup.group ).toString().length )
		{
			if ( ! groupsCreated.includes( formFieldGroup.group ) )
			{
				// should we move this into Templates.xxx ?
				var controlGroup = $( '<div style="" class="inputDiv active formGroupSection" name="' + formFieldGroup.group + '"><div class="section"><label class="displayName">' + formFieldGroup.group + '</label></div></div>' );

				formTag.append( controlGroup );
				groupsCreated.push( formFieldGroup.group );
			}
			else
			{
				var controlGroup = $( formDivSecTag ).find( 'div[name="' + formFieldGroup.group + '"]' );
			}
		}
		else 
		{
			if ( ( formFieldGroup.group ).toString().length == 0 )
			{
				if ( ! groupsCreated.includes( me._groupNoneId ) )
				{
					var controlGroup = $( '<div style="" class="active formGroupSection emptyFormGroupSection" name="' + me._groupNoneId + '"></div>' );

					formTag.append( controlGroup );	
					groupsCreated.push( me._groupNoneId );
				}
				else
				{
					var controlGroup = $( formDivSecTag ).find( 'div[name="' + me._groupNoneId + '"]' );
				}
			}
			else
			{
				var controlGroup = formDivSecTag;
			}
		}

		return controlGroup;
	}

	me.evalFormGroupDisplayStatus = function( formDivSecTag )
	{
		var dvGroups = formDivSecTag.find( 'div.formGroupSection' );

		for( var i = 0; i < dvGroups.length; i++ )
		{
			var inpCtls  = $( dvGroups[ i ] ).find("div.inputField");
			var sumDisplay = 0;

			for( var c = 0; c < inpCtls.length; c++ )
			{
				//sumDisplay += ( $( inpCtls[ c ]).is( ':visible' ) ? 1 : 0 );
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
		var newArr = JSON.parse( JSON.stringify( formJsonArr ) );
		var retGrpArr = [];

		for( var i = 0; i < newArr.length; i++ )
		{
			if ( newArr[ i ].formGroup == undefined || newArr[ i ].formGroup == '' )
			{
				retGrpArr.push ( { 'id': newArr[ i ].id, 'group': me._groupNoneId, seq: i, created: 0, display: ( newArr[ i ].display == 'hiddenVal' || newArr[ i ].display == 'none' ) ? 0 : 1, order: 999 } );
			}
			else
			{
				retGrpArr.push ( { 'id': newArr[ i ].id, 'group': frmGroupJson[ newArr[ i ].formGroup ].defaultName, seq: i, created: 0, display: ( newArr[ i ].display == 'hiddenVal' || newArr[ i ].display == 'none' ) ? 0 : 1, order: frmGroupJson[ newArr[ i ].formGroup ].order } );
			}
		}

		// SORTING should be inherited from preconfigured 'Group' object sort value
		Util.sortByKey( retGrpArr, 'order');
		/*retGrpArr.sort(function(a, b)
		{
			if (a.order < b.order) { return -1; }
			if (b.order < a.order) return 1;
			else return 0;
		});*/

		for( var i = 0; i < retGrpArr.length; i++ )
		{
			if ( retGrpArr[ i ].group === me._groupNoneId )
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


	// Old UI Used Method
	me.renderInput = function( formItemJson, formDivSecTag, formTag, formFull_IdList, passedData, payloadConfigSelection )
	{
		var divInputTag = $( '<div class="inputDiv"></div>' );

		var spanTitleTag = $( '<span ' + FormUtil.getTermAttr( formItemJson ) + ' class="titleSpan"></span>' );
		spanTitleTag.text( formItemJson.defaultName );

		var titleDivTag = $( '<div class="titleDiv"></div>' ).append( spanTitleTag );

		divInputTag.append( titleDivTag );

		me.renderInputTag( formItemJson, divInputTag, formTag, formFull_IdList, passedData, payloadConfigSelection );

		formDivSecTag.append( divInputTag );
	}
	
	// New UI Used Method
	me.renderInputFieldControls = function( formItemJson, controlGroupTag, formTag, formFull_IdList, passedData, payloadConfigSelection )
	{
		var fieldContainerTag = $( Templates.inputFieldStandard );
		var divFieldLabelTag = fieldContainerTag.find( 'label.displayName' );
		var divFieldControlLeftTag = fieldContainerTag.find( 'div.field__left' );

		fieldContainerTag.attr( 'inputFieldId', formItemJson.id );

		divFieldLabelTag.text( formItemJson.defaultName );
		FormUtil.addTag_TermAttr ( divFieldLabelTag, formItemJson);

		me.renderInputTag( formItemJson, divFieldControlLeftTag, formTag, formFull_IdList, passedData, payloadConfigSelection, fieldContainerTag );

		controlGroupTag.append( fieldContainerTag );
	}

	me.renderNewUI_InputFieldControls = function( formItemJson, controlGroupTag, formTag, formFull_IdList, passedData, payloadConfigSelection )
	{
		var divInputFieldTag = $( '<div class="inputField newUIfield" inputFieldId="' + formItemJson.id + '" />' ); // ADD NEW UI NESTED CLASS STRUCTURES HERE PER controlType
		var entryTag;

		controlGroupTag.append( divInputFieldTag );

		if ( formItemJson.controlType === "CHECKBOX" ) //|| formItemJson.controlType === "MULTI_CHECKBOX"
		{
			me.renderInputCheckbox( formItemJson, divInputFieldTag, formTag, formFull_IdList, passedData, payloadConfigSelection, divInputFieldTag, ( formItemJson.slider && (formItemJson.slider == "true" || formItemJson.slider == true ) ) );
		}
		else if ( formItemJson.controlType === "RADIO" )
		{
			me.renderInputRadio( formItemJson, divInputFieldTag, formTag, formFull_IdList, passedData, payloadConfigSelection, divInputFieldTag );
		}
		/*else
		{
			entryTag = me.renderInputTag( formItemJson, divInputFieldTag, formTag, formFull_IdList, passedData, payloadConfigSelection, divInputFieldTag );
		}*/

		entryTag = divInputFieldTag.find( '.dataValue' );

		// Setup events and visibility and rules
		me.setEventsAndRules( formItemJson, entryTag, entryTag.parent(), formDivSecTag, formFull_IdList, passedData, divInputFieldTag );

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

	// TODO: JAMES: 'payloadConfig' is passed and 'FormUtil.setTagVal' should be handled...
	me.renderInputTag = function( formItemJson, divInputTag, formDivSecTag, formFull_IdList, passedData, payloadConfigSelection, fieldContainerTag )
	{

		// NB: inline properties use (from quick observation):
		//   uid: 		for passing data values (populateFormData); could/should be replaced by 'id' reference as UID is DHIS2 related (no longer used/relevant)
		// 	 dataGroup: for inputJson (payload) formation (FormUtil.setFormsJsonGroup_Val); should be reviewed/improved?
		//   name:		for reference by eval defaultValue in me.evalFormInputFunctions (even though value loaded into name is 'id' value ?)

		if ( formItemJson )
		{
			// For payloadConfigSelection, save the selection inside of the config for easier choosing..
			me.setFormItemJson_DefaultValue_PayloadConfigSelection( formItemJson, payloadConfigSelection );

			var entryTag;
			var bSkipControlAppend = false;
			var autoComplete = 'autocomplete="' + JSON.parse( localStorage.getItem(Constants.storageName_session) ).autoComplete + '"';

			if ( formItemJson.scanQR != undefined &&  formItemJson.scanQR == true ) bSkipControlAppend = true;
			if ( formItemJson.controlType === "DROPDOWN_LIST" && formItemJson.options === 'boolOption' ) formItemJson.controlType = "CHECKBOX";


			if ( formItemJson.controlType === "INT" || formItemJson.controlType === "SHORT_TEXT" )
			{
				entryTag = $( '<input name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" dataGroup="' + formItemJson.dataGroup + '" type="text" ' + autoComplete + ' class="dataValue displayValue" />' );
				FormUtil.setTagVal( entryTag, formItemJson.defaultValue );

				if ( ! bSkipControlAppend ) divInputTag.append( entryTag );
			}			
			else if ( formItemJson.controlType === "DROPDOWN_LIST" )
			{

				divInputTag.removeClass( 'field__left' );
				divInputTag.addClass( 'field__selector' );

				var optionList = FormUtil.getObjFromDefinition( formItemJson.options, ConfigManager.getConfigJson().definitionOptions );

				Util.decodeURI_ItemList( optionList, "defaultName" );

				entryTag = $( '<select name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" dataGroup="' + formItemJson.dataGroup + '" class="dataValue displayValue" />' );

				Util.populateSelect_newOption( entryTag, optionList, { "name": "defaultName", "val": "value" } );

				FormUtil.setTagVal( entryTag, formItemJson.defaultValue );

				divInputTag.append( entryTag );

			}
			else if ( formItemJson.controlType === "DROPDOWN_AUTOCOMPLETE" ) // rename [DIALOG_RADIO]
			{
				var inputDisplayOnly = $( '<input name="displayValue_' + formItemJson.id + '" uid="displayValue_' + formItemJson.uid + '" type="text"  READONLY class="displayValue" />' ); //	Input for to be shown in the app

				entryTag = $( '<input name="' + formItemJson.id + '" id="' + formItemJson.id + '" uid="' + formItemJson.uid + '" type="hidden" class="dataValue" />' );

				FormUtil.setTagVal( entryTag, formItemJson.defaultValue );

				if ( ! bSkipControlAppend ) divInputTag.append( entryTag );

				inputDisplayOnly.on( 'click', function(){

					me.createSearchOptions_Dialog( formItemJson, entryTag, this, 'radio' );

				} );

				divInputTag.append( inputDisplayOnly, entryTag );

			}
			else if ( formItemJson.controlType === "MULTI_CHECKBOX" ) // rename [DIALOG_CHECKBOX]
			{
				var inputDisplayOnly = $( '<input name="displayValue_' + formItemJson.id + '" uid="displayValue_' + formItemJson.uid + '" type="text"  READONLY class="displayValue" />' ); //	Input for to be shown in the app

				entryTag = $( '<input name="' + formItemJson.id + '" id="' + formItemJson.id + '" uid="' + formItemJson.uid + '" type="hidden" class="dataValue" />' );

				FormUtil.setTagVal( entryTag, formItemJson.defaultValue );

				if ( ! bSkipControlAppend ) divInputTag.append( entryTag );

				inputDisplayOnly.on( 'click', function(){

					me.createSearchOptions_Dialog( formItemJson, entryTag, this, 'checkbox' );

				} );

				divInputTag.append( inputDisplayOnly, entryTag );

			}
			else if( formItemJson.controlType === "YEAR" )
			{
				var data = []
				var today = new Date();
				var year = today.getFullYear();
				var rndID = Util.generateRandomId( 8 );
				var yearRange = ( formItemJson.yearRange ) ? formItemJson.yearRange : { 'from': -100, 'to': 0 };

				for ( var i = yearRange.from; i <= yearRange.to; i++ )
				{
					data.push( { value: moment().add( i, 'years')._d.getFullYear(), text: moment().add( i, 'years')._d.getFullYear() } );
				}

				var yearDialogObj = $( Templates.inputFieldYear );

				yearDialogObj.find( 'input.dataValue' ).attr( 'id', formItemJson.id ); //'input_' + rndID
				yearDialogObj.find( 'input.dataValue' ).attr( 'uid', formItemJson.id );

				yearDialogObj.find( 'input.displayValue' ).attr( 'id', 'display_' + rndID );
				yearDialogObj.find( 'input.displayValue' ).attr( 'autocomplete', JSON.parse( localStorage.getItem('session') ).autoComplete );

				var wrapperTag = $( '<div></div>' );

				entryTag = $( yearDialogObj ).find( '.dataValue' );

				wrapperTag.append( yearDialogObj );
				divInputTag.append( wrapperTag );

				Util2.populate_year( yearDialogObj[0], data, me.cwsRenderObj.langTermObj.translateText( formItemJson.defaultName, formItemJson.term ) );

			}
			else if ( formItemJson.controlType === "DATE" )
			{
				// <- we need to generate from Templates.xxxx
				var wrapperDad = $('<div class="dateContainer"></div>');
				var wrapperInput = $('<div class="dateWrapper"></div>');
				var button = $('<button class="dateButton" ></button>');
				var icoCalendar = $('<img src="images/i_date.svg" class="imgCalendarInput" />');

				button.append( icoCalendar );

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
				entryTag = $( '<input data-mask="' + formatMask + '" name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" dataGroup="' + formItemJson.dataGroup + '" type="text" placeholder="'+ formatDate +'" size="' + ( formatDate.toString().length > 0 ? formatDate.toString().length : '' ) + '" isDate="true" class="dataValue displayValue" />' );

				wrapperInput.append( entryTag );
				wrapperDad.append( wrapperInput, button );

				FormUtil.setTagVal( entryTag, formItemJson.defaultValue );

				divInputTag.append( wrapperDad );

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

			}
			else if ( formItemJson.controlType === "LABEL" )
			{
				divInputTag.css( 'background-color', 'darkgray' );
				divInputTag.find( 'label.titleDiv' ).css( 'color', 'white' );
			}
			else if ( formItemJson.controlType === "IMAGE" ) // rename [QR_IMAGE]
			{
				var divSelectTag = $( '<div class="imgQRInput"></div>' );
				var entryTag = $( '<input name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" dataGroup="' + formItemJson.dataGroup + '" style="display:none" class="dataValue" />' );
				var imgDisplay = $( '<img name="imgPreview_' + formItemJson.id + '" style="' + formItemJson.imageSettings + '" src="" class="displayValue">' );

				divSelectTag.append( entryTag );
				divSelectTag.append( imgDisplay );
				divInputTag.append( divSelectTag );

			}
			/*else
			{
				entryTag = $( '<input name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" type="text" class="dataValue displayValue" />' );
				FormUtil.setTagVal( entryTag, formItemJson.defaultValue );

				console.log( formItemJson,entryTag );

				//if ( ! bSkipControlAppend ) 
				divInputTag.append( entryTag );
			}*/

			// Setup events and visibility and rules
			me.setEventsAndRules( formItemJson, entryTag, divInputTag, formDivSecTag, formFull_IdList, passedData, fieldContainerTag );

			if ( formItemJson.scanQR != undefined )
			{
				if ( formItemJson.scanQR == true )
				{
					var tbl = $( '<table style="width:100%" />' );
					var tR = $( '<tr />' );
					var tdL = $( '<td />' );
					var tdR = $( '<td class="qrIcon" />' );

					tbl.append( tR );
					tR.append( tdL );
					tR.append( tdR );
					divInputTag.append( QRiconTag );

					var QRiconTag = $( '<img src="images/qr.svg" class="qrButton" >')

					tdL.click( function(){
						var qrData = new readQR( entryTag );
					} );

					tdL.append( entryTag );
					tdR.append( QRiconTag );
					entryTag.addClass( 'qrInput' );

					divInputTag.append( tbl );

				}

			}
			
			return entryTag;

		}
	};

	
	me.setFormItemJson_DefaultValue_PayloadConfigSelection = function( formItemJson, payloadConfigSelection )
	{
		if ( formItemJson 
			&& formItemJson.defaultValue 
			&& formItemJson.defaultValue.payloadConfigEval )
		{
			formItemJson.defaultValue.payloadConfigSelection = payloadConfigSelection;
		}
	};


	// NOTE: evaluation the 'defaultValue' expression...  
	//		But, this should have evaluated from source tag value change..
	//		Also, this should be replaced with..
	// 'data-fields' should be replaced.. 
	me.evalFormInputFunctions = function( formDivSecTag )
	{
		if ( formDivSecTag )
		{
			if ( formDivSecTag.attr( 'data-fields') != undefined )
			{
				var jData = JSON.parse( unescape( formDivSecTag.attr( 'data-fields') ) );
				var pConf = FormUtil.block_payloadConfig;

				for( var i = 0; i < jData.length; i++ )
				{
					if ( jData[ i ].defaultValue || jData[ i ].payload )
					{
						var EvalActionString = '';

						if ( jData[ i ].defaultValue ) EvalActionString = jData[ i ].defaultValue;

						if ( jData[ i ].payload && jData[ i ].payload[ pConf ] && jData[ i ].payload[ pConf ].defaultValue ) EvalActionString = jData[ i ].payload[ pConf ].defaultValue;

						if ( EvalActionString.length )
						{
							var tagTarget = formDivSecTag.find( '[name="' + jData[ i ].id + '"]' );

							FormUtil.evalReservedField( tagTarget, EvalActionString );
						}

					}
				}

			}

		}

	}


	me.setEventsAndRules = function( formItemJson, entryTag, divInputTag, formDivSecTag, formFull_IdList, passedData, fieldContainerTag )
	{
		if ( entryTag )
		{
			// Set Event
			entryTag.change( function() 
			{
				// TODO: Fix the on leave issues.. below..y
				// JAMES, disabled for now..
				// IDEA: Rather than using 'defaultValue' concept, we should use 
				//		that changes
				// me.evalFormInputFunctions( formDivSecTag.parent() ); //.parent()


				me.performEvalActions( $(this), formItemJson, formDivSecTag, formFull_IdList );
			});

		}

		me.addRuleForField( divInputTag, formItemJson );


		//  Below... shoudl be moved to other methods/organization?


		me.addDataTargets( divInputTag, formItemJson ); // added by Greg (9 Apr 19) > dataTargets > for auto-generation of JSON payloads
		me.addStylesForField( divInputTag, formItemJson );


		// TODO: PUT BELOW CODE AS separate..

		// Set Tag Visibility
		if ( formItemJson.display === "hiddenVal" ||  formItemJson.display === "none" )
		{
			fieldContainerTag.hide();
		}

		if ( passedData !== undefined 
			&& passedData.hideCase !== undefined 
			&& formItemJson.hideCase !== undefined
			&& formItemJson.hideCase.indexOf( passedData.hideCase ) >= 0 )
		{
			//divInputTag.hide(); 
			fieldContainerTag.hide(); 
		}

		if ( passedData !== undefined 
			&& passedData.showCase !== undefined 
			&& formItemJson.showCase !== undefined
			&& formItemJson.showCase.indexOf( passedData.showCase ) >= 0 )
		{
			//divInputTag.show();
			fieldContainerTag.show();
		}

	}

	me.addStylesForField = function( divInputTag, formItemJson )
	{
		var entryTag = divInputTag.find( "select,input" );

		if( formItemJson.styles !== undefined )
		{
			for ( var i = 0; i < formItemJson.styles.length; i++ )
			{
				var styleDef = formItemJson.styles[i];

				entryTag.each( function( index, element ){
					$( element ).attr( styleDef.name, styleDef.value );
				}); 
			}
		}

	}

	me.addRuleForField = function( divInputTag, formItemJson )
	{
		var entryTag = divInputTag.find( ".dataValue" ); //( "select,input" )
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
						var titleTag = divInputTag.closest( 'div.inputField' ).find( '.fieldLabel' );
						titleTag.append( $( "<span>*</span>" ) );
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
				var targetInputDivTag = targetInputTag.closest( 'div[inputFieldId="' + idStr + '"]'); // < change to [formDivSecTag.find] ..

				if ( visible ) 
				{
					targetInputDivTag.show( 'fast' );

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

			// getProperValue  <-- but 'clientId' and voucherId' could be populated by hidden inputs..
			var clientId = Util.getNotEmpty( passedData.resultData.clientId );
			var voucherId = Util.getNotEmpty( passedData.resultData.voucherId );

			if ( clientId ) formDivSecTag.find( '[name="clientId"]' ).val( clientId );
			if ( voucherId ) formDivSecTag.find( '[name="voucherId"]' ).val( voucherId );

			try 
			{
				// var attributes = passedData.data.relationships[0].relative.attributes;
				var attributes = passedData.displayData;  // <-- we are assuming this is single list...
				var inputTags = formDivSecTag.find( 'input,checkbox,select' );

				// Go through each input tags and use 'uid' to match the attribute for data population
				inputTags.each( function( i ) 
				{
					var inputTag = $( this );
					var uidStr = inputTag.attr( 'uid' ); // <-- WHY USE 'uid' WHEN 'id' WILL WORK? hmmm

					if ( uidStr )
					{
						var attrJson = Util.getFromList( attributes, uidStr, "id" );
						if ( attrJson )
						{
							// ADDED - CheckBox mark by passed in data + perform change event if passed in value are populated.
							FormUtil.setTagVal( inputTag, attrJson.value, function() 
							{
								//console.log( 'populating tag data, name: ' + inputTag.attr( 'name' ) + ', val: ' + attrJson.value );
								inputTag.change();
							});
						}
					}
				});

				clientId = formDivSecTag.find( '[name="clientId"]' ).val();
				voucherId = formDivSecTag.find( '[name="voucherId"]' ).val();
				formDivSecTag.find( '[name="walkInClientCase"]' ).val( me.getWalkInClientCase ( clientId, voucherId ) );

			}
			catch(err) {
				console.log( 'Error Duing "populateFormData".' );
				console.log( err );
			}					
		}
	}
	
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


	me.renderInputCheckbox = function( formItemJson, divInputTag, formDivSecTag, formFull_IdList, passedData, payloadConfigSelection, fieldContainerTag, enableToggle )
	{
		var parentTag = $( Templates.inputFieldCheckbox );
		var checkLabel = parentTag.find( '.displayName' );

		checkLabel.html( formItemJson.defaultName );

		divInputTag.append( parentTag );

		me.createListOptions_Items( parentTag.find( '.optsContainer' ), formItemJson, 'checkbox', false, ( ! enableToggle ? 'horizontal' : '' ), enableToggle );
	}


	me.renderInputRadio = function( formItemJson, divInputTag, formDivSecTag, formFull_IdList, passedData, payloadConfigSelection, fieldContainerTag )
	{
		var parentTag = $( Templates.inputFieldRadio );
		var checkLabel = parentTag.find( '.displayName' );

		checkLabel.html( formItemJson.defaultName );

		divInputTag.append( parentTag );

		me.createListOptions_Items( parentTag.find( '.optsContainer' ), formItemJson, 'radio', false, 'horizontal' );
	}


	me.createSearchOptions_Dialog = function( formItemJson, targetInputTag, targetDisplayText, type )
	{
		var newDialog = $( Templates.searchOptions_Dialog );
		var optsContainer = newDialog.find( '.optsContainer' );

		if ( type === 'radio' )
		{
			optsContainer.addClass( 'radiobutton-col' );
		}
		else if ( type === 'checkbox' )
		{
			optsContainer.addClass( 'checkbox-col' );
		}

		newDialog.find( '.title' ).html( me.cwsRenderObj.langTermObj.translateText( formItemJson.defaultName, formItemJson.term ) );

		me.createListOptions_Items( optsContainer, formItemJson, type, true );

		$( 'body' ).append( newDialog );

		$('.scrim').show();

		$('.scrim').off( 'click' ).on( 'click', function(){
			$( '#dialog_searchOptions' ).remove();
			$('.scrim').hide();
		} );

		newDialog.fadeIn();


		// search event 
		newDialog.find( 'input.searchText' ).on( 'keyup', function( e ){

			var searchFor = $( this ).val().toUpperCase();
			var optContainerTag = $( '#dialog_searchOptions' ).find( '.optsContainer' );
			var searchItems = optContainerTag.find( 'div' );

			searchItems.each( function( i ) {
				selectedVal = ( $( this ).attr( 'searchtext' ) ).toUpperCase();
				$( this ).css( 'display', ( selectedVal.includes( searchFor ) ? 'block' : 'none' ) );
			});
			
		});

		// cancel button event
		newDialog.find( '.cancel' ).on( 'click', function(){

			$('.scrim').hide();
			$( '#dialog_searchOptions' ).remove();

		} );

		// accept button event
		newDialog.find( '.runAction' ).on( 'click', function(){

			var selectedArr = [], displayArr = [];

			$.each( $( "input[name='option_" + formItemJson.id + "']:checked" ), function(){
				selectedArr.push( $( this ).attr( 'value' ) );
				displayArr.push( $( $( this ).siblings()[ 0 ] ).text() );
			});

			$( targetInputTag ).val( selectedArr.join( ',' ) );
			$( targetDisplayText ).val( displayArr.join( ',' ) );

			$('.scrim').hide();
			$( '#dialog_searchOptions' ).remove();
		} );

	}

	me.createListOptions_Items = function( parentTag, formItemJson, type, useDialog, addClass, displaySlider )
	{
		var optionList = FormUtil.getObjFromDefinition( formItemJson.options, ConfigManager.getConfigJson().definitionOptions );
		var inputHiddenTarget = $( Templates.inputFieldHidden );

		if ( optionList === undefined )
		{
			// create single item ( on / off ) for checkbox ONLY
			if ( type === 'checkbox' )
			{
				inputHiddenTarget.attr( 'id', formItemJson.id );
				inputHiddenTarget.addClass( 'dataValue' );

				var checkboxTag = $( Templates.inputFieldCheckbox_SingleItem );
				var checkboxInputTag = checkboxTag.find( 'input' );
				var lblTag = checkboxTag.find( 'label' );

				checkboxInputTag.attr( 'id', 'display_' + formItemJson.id );
				checkboxInputTag.attr( 'updates', formItemJson.id );

				checkboxInputTag.addClass( 'displayValue' );
				checkboxInputTag.addClass( 'singleOption' );

				lblTag.html( '' ); // no need to display label as it exists inside field object
				lblTag.attr( 'for', 'display_' + formItemJson.id );

				if ( formItemJson.defaultValue && formItemJson.defaultValue.toLowerCase() === 'checked' ) checkboxTag.attr( 'checked', 'checked' );

				me.createListOption_UpdateEvent( checkboxInputTag );

				parentTag.append( inputHiddenTarget );
				parentTag.append( checkboxTag );

			}
		}
		else
		{

			var updates;

			if ( useDialog )
			{
				inputHiddenTarget.attr( 'id', 'dialog_' + formItemJson.id );

				updates = 'dialog_' + formItemJson.id;
			}
			else
			{
				inputHiddenTarget.attr( 'id', formItemJson.id );
				inputHiddenTarget.addClass( 'dataValue' );

				updates = formItemJson.id;
			}

			parentTag.append( inputHiddenTarget );

			// create multiple items
			var sourceDataTag = $( '#' + formItemJson.id );
			var dataValues = ( sourceDataTag.val() ? sourceDataTag.val().split( ',' ) : [] );

			for ( var i = 0; i < optionList.length; i++ )
			{
				var optItem = optionList[ i ];
				var newOpt, optTag;

				/*if ( displaySlider === true )
				{
					newOpt = $( Templates.inputFieldToggle_Item );
				}
				else*/
				if ( type === 'radio' )
				{
					newOpt = $( Templates.inputFieldRadio_Item );
				}
				else if ( type === 'checkbox' )
				{
					newOpt = $( Templates.inputFieldCheckbox_Item );
				}

				if ( addClass ) newOpt.addClass( addClass );

				var labelTerm = me.cwsRenderObj.langTermObj.translateText( optItem.defaultName, optItem.poTerm )

				newOpt.first( 'div' ).attr( 'searchText', labelTerm );

				optTag = newOpt.find( 'input' );

				optTag.attr( 'id', 'option_' + optItem.value );
				optTag.attr( 'name', 'option_' + formItemJson.id );
				optTag.attr( 'value', optItem.value );
				optTag.attr( 'updates', updates );

				optTag.addClass( 'displayValue' );

				if ( dataValues.length )
				{
					if ( dataValues.includes( optItem.value ) ) 
					{
						optTag.attr( 'checked', 'checked' );
					}
				}

				newOpt.find( 'label' ).attr( 'for', 'option_' + optItem.value );
				newOpt.find( 'label' ).text( labelTerm );

				me.createListOption_UpdateEvent( optTag );

				parentTag.append( newOpt );
			}
		}

	}

	me.createListOption_UpdateEvent = function( listOptionTag )
	{
		//if ( listOptionTag.attr( 'single' ) === 'true' )
		if ( listOptionTag.hasClass( 'singleOption' ) ) // checkbox is both display + data value
		{
			listOptionTag.on( 'click', function(){

				var inputUpdates = $( '#' + $( this ).attr( 'updates' ) );

				inputUpdates.val( ( $( this ).is( ':checked' ) ? 'true' : 'false' ) );

				FormUtil.dispatchOnChangeEvent( inputUpdates );

			} );
		}
		else
		{

			if ( listOptionTag.hasClass( 'displayValue' ) ) // default should be true
			{
				listOptionTag.on( 'click', function(){

					var targUpdates = $( this ).attr( 'updates' );
					var inputUpdates = $( '#' + targUpdates );
					var listOpts = $( 'input[updates="' + targUpdates + '"]' );
					var selected = [];
	
					listOpts.each(function() {
	
						if ( $( this ).is( ':checked' ) ) 
						{
							selected.push( $( this ).val() );	
						}
	
					});
	
					inputUpdates.val( selected.join(",") );

					// dispatch update-event if not showing in dialogMode
					if ( targUpdates.indexOf( 'dialog_' ) < 0 ) FormUtil.dispatchOnChangeEvent( inputUpdates );
	
				});
	
			}

		}
	}


	// -------------------------------
	
	me.initialize();
}