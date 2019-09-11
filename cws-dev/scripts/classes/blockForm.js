// -------------------------------------------
// -- BlockForm Class/Methods
function BlockForm( cwsRenderObj, blockObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	me.formJsonArr;
	me._childTargetActionDelay = 400;

	// =============================================
	// === TEMPLATE METHODS ========================
	
	me.initialize = function() { }

	me.render = function( formDef, blockTag, passedData )
	{
		var formJsonArr = FormUtil.getObjFromDefinition( formDef, me.cwsRenderObj.configJson.definitionForms );
		var formGrps = me.cwsRenderObj.configJson.definitionFormGroups;

		me.formJsonArr = formJsonArr;

		if ( formJsonArr !== undefined )
		{
			var formDivSecTag = $( '<div class="formDivSec"></div>' );
			var valor = JSON.parse( localStorage.getItem('session') ).autoComplete;
			var formTag = $( '<form autocomplete="' + valor + '"></form>' );

			formDivSecTag.append( formTag );
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
				if ( ( formFieldGroups[ i ].group ).toString().length )
				{
					if ( ! groupsCreated.includes( formFieldGroups[ i ].group ) )
					{
						var controlGroup = $( '<div style="" class="inputDiv active formGroupSection" name="' + formFieldGroups[ i ].group + '"><div><label class="formGroupSection">' + formFieldGroups[ i ].group + '</label></div></div>' );
						formTag.append( controlGroup );
						groupsCreated.push( formFieldGroups[ i ].group );
					}
					else
					{
						//do nothing: group already exists
					}
				}
				else 
				{
					if ( ( formFieldGroups[ i ].group ).toString().length == 0 )
					{
						if ( ! groupsCreated.includes( "zzzEmpty" ) )
						{
							var controlGroup = $( '<div style="" class="active formGroupSection emptyFormGroupSection" name="zzzEmpty"></div>' );
							formTag.append( controlGroup );	
							groupsCreated.push( "zzzEmpty" );
						}
					}
					else
					{
						var controlGroup = formDivSecTag;
					}
				}

				if ( me.blockObj.blockType === FormUtil.blockType_MainTabContent )
				{
					me.renderInput_TabContent( formJsonArr[ formFieldGroups[ i ].seq ], controlGroup, formFull_IdList, passedData );
				}
				else
				{
					me.renderInput( formJsonArr[ formFieldGroups[ i ].seq ], controlGroup, formFull_IdList, passedData );
				}

			}

			formDivSecTag.attr( 'data-fields', escape( JSON.stringify( formJsonArr ) ) );

			me.populateFormData( passedData, formDivSecTag );
			me.evalFormGroupDisplayStatus( formDivSecTag );

			// NOTE: TRAN VALIDATION
			me.blockObj.validationObj.setUp_Events( formDivSecTag );

			//NOTE (Greg): 500ms DELAY SOLVES PROBLEM OF CALCULATED DISPLAY VALUES BASED ON FORM:XXX VALUES
			setTimeout( function(){
				me.evalFormInputFunctions( formDivSecTag );
			}, 500 );

		}

	}

	me.evalFormGroupDisplayStatus = function( formDivSecTag )
	{
		var dvGroups = formDivSecTag.find( 'div.formGroupSection' );

		for( var i = 0; i < dvGroups.length; i++ )
		{
			var inpCtls  = $( dvGroups[ i ] ).find("div.inputDiv");
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
		var groupNone = 'zzzNone';
		var newArr = JSON.parse( JSON.stringify( formJsonArr ) );
		var retGrpArr = [];

		for( var i = 0; i < newArr.length; i++ )
		{
			if ( newArr[ i ].formGroup == undefined || newArr[ i ].formGroup == '' )
			{
				retGrpArr.push ( { 'id': newArr[ i ].id, 'group': groupNone, seq: i, created: 0, display: ( newArr[ i ].display == 'hiddenVal' || newArr[ i ].display == 'none' ) ? 0 : 1, order: 999 } );
			}
			else
			{
				retGrpArr.push ( { 'id': newArr[ i ].id, 'group': frmGroupJson[ newArr[ i ].formGroup ].defaultName, seq: i, created: 0, display: ( newArr[ i ].display == 'hiddenVal' || newArr[ i ].display == 'none' ) ? 0 : 1, order: frmGroupJson[ newArr[ i ].formGroup ].order } );
			}
		}

		// SORTING should be inherited from preconfigured 'Group' object sort value
		retGrpArr.sort(function(a, b)
		{
			if (a.order < b.order) { return -1; }
			if (b.order < a.order) return 1;
			else return 0;
		});

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


	// Old UI Used Method
	me.renderInput = function( formItemJson, formDivSecTag, formFull_IdList, passedData )
	{
		var divInputTag = $( '<div class="inputDiv"></div>' );

		var spanTitleTag = $( '<span ' + FormUtil.getTermAttr( formItemJson ) + ' class="titleSpan"></span>' );
		spanTitleTag.text( formItemJson.defaultName );

		var titleDivTag = $( '<div class="titleDiv"></div>' ).append( spanTitleTag );

		divInputTag.append( titleDivTag );

		me.renderInputTag( formItemJson, divInputTag, formDivSecTag, formFull_IdList, passedData );

		formDivSecTag.append( divInputTag );
	}
	
	// New UI Used Method
	me.renderInput_TabContent = function( formItemJson, formDivSecTag, formFull_IdList, passedData )
	{

		var divInputTag = $( '<div class="tb-content-d inputDiv"></div>' );

		var spanTitleTag = $( '<label ' + FormUtil.getTermAttr( formItemJson ) + ' class="from-string titleDiv"></label>' );
		spanTitleTag.text( formItemJson.defaultName );
		divInputTag.append( spanTitleTag );

		me.renderInputTag( formItemJson, divInputTag, formDivSecTag, formFull_IdList, passedData );

		formDivSecTag.append( divInputTag );
	}


	me.renderInputTag = function( formItemJson, divInputTag, formDivSecTag, formFull_IdList, passedData )
	{
		if ( formItemJson !== undefined )
		{
			var entryTag;

			// TEMP DROPDOWN --> CHECKBOX
			if ( formItemJson.controlType === "DROPDOWN_LIST" && formItemJson.options === 'boolOption' ) formItemJson.controlType = "CHECKBOX";


			if ( formItemJson.controlType === "INT"
				|| formItemJson.controlType === "SHORT_TEXT" )
			{
				entryTag = $( '<input name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" class="form-type-text" type="text" />' );
				FormUtil.setTagVal( entryTag, formItemJson.defaultValue );

				divInputTag.append( entryTag );
			}			
			else if ( formItemJson.controlType === "DROPDOWN_LIST" )
			{
				var optionList = FormUtil.getObjFromDefinition( formItemJson.options, me.cwsRenderObj.configJson.definitionOptions );

				Util.decodeURI_ItemList( optionList, "defaultName" );

				entryTag = $( '<select class="selector" name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" ></select>' );
				Util.populateSelect_newOption( entryTag, optionList, { "name": "defaultName", "val": "value" } );

				FormUtil.setTagVal( entryTag, formItemJson.defaultValue );

				var divSelectTag = $( '<div class="select"></div>' );
				divSelectTag.append( entryTag );
				divInputTag.append( divSelectTag );
			}
			else if ( formItemJson.controlType === "CHECKBOX" )
			{
				entryTag = $( '<input name="' + formItemJson.id + '" uid="' + formItemJson.uid + '" class="form-type-text" type="checkbox" />' );
				FormUtil.setTagVal( entryTag, formItemJson.defaultValue );

				divInputTag.append( entryTag );
			}
			else if ( formItemJson.controlType === "LABEL" )
			{
				divInputTag.css( 'background-color', 'darkgray' );
				divInputTag.find( 'label.titleDiv' ).css( 'color', 'white' );
			}

			// Setup events and visibility and rules
			me.setEventsAndRules( formItemJson, entryTag, divInputTag, formDivSecTag, formFull_IdList, passedData );
		}
	}

	me.evalFormInputFunctions = function( formDivSecTag )
	{
		if ( formDivSecTag )
		{
			if ( formDivSecTag.attr( 'data-fields') != undefined )
			{
				var jData = JSON.parse( unescape( formDivSecTag.attr( 'data-fields') ) );
		
				for( var i = 0; i < jData.length; i++ )
				{
					if ( jData[ i ].defaultValue )
					{
						if ( jData[ i ].defaultValue.length && jData[ i ].defaultValue.indexOf( 'generatePattern(' ) > 0 && jData[ i ].defaultValue.indexOf( 'form:' ) > 0 )
						{
							var tagTarget = formDivSecTag.find( '[name="' + jData[ i ].id + '"]' );

							if ( tagTarget )
							{
								var pattern = Util.getParameterInside( jData[ i ].defaultValue, '()' );

								tagTarget.val( Util.getValueFromPattern( tagTarget, pattern ) );
							}

						}
						else if ( jData[ i ].defaultValue.length && jData[ i ].defaultValue.indexOf( 'getAge(' ) > 0 && jData[ i ].defaultValue.indexOf( 'form:' ) > 0 )
						{
							var tagTarget = formDivSecTag.find( '[name="' + jData[ i ].id + '"]' );

							if ( tagTarget )
							{
								var pattern = Util.getParameterInside( jData[ i ].defaultValue, '()' );
								var ageCal  = Util.getAgeValueFromPattern( tagTarget, pattern );

								if ( ageCal != undefined && ageCal > 0 )
								{
									tagTarget.val( ageCal );
								}
							}

						}

					}
				}

			}

		}

	}


	me.setEventsAndRules = function( formItemJson, entryTag, divInputTag, formDivSecTag, formFull_IdList, passedData)
	{
		if ( entryTag )
		{
			// Set Event
			entryTag.change( function() 
			{
				me.evalFormInputFunctions( formDivSecTag.parent().parent() )
				me.performEvalActions( $(this), formItemJson, formDivSecTag, formFull_IdList );
			});
		}

		me.addRuleForField( divInputTag, formItemJson );
		me.addDataTargets( divInputTag, formItemJson ); // added by Greg (9 Apr 19) > dataTargets > for auto-generation of JSON payloads
		me.addStylesForField( divInputTag, formItemJson );

		// Set Tag Visibility
		if ( formItemJson.display === "hiddenVal" )
		{
			divInputTag.hide();
			entryTag.attr( 'display', 'hiddenVal' );

			if ( formItemJson.display === "hiddenVal" )
			{

			}
		}
		else if ( formItemJson.display === "none" )
		{
			divInputTag.hide();

		}

		if ( passedData !== undefined 
			&& passedData.hideCase !== undefined 
			&& formItemJson.hideCase !== undefined
			&& formItemJson.hideCase.indexOf( passedData.hideCase ) >= 0 )
		{
			divInputTag.hide(); //divInputTag.find("input,select").remove();
		}

		if ( passedData !== undefined 
			&& passedData.showCase !== undefined 
			&& formItemJson.showCase !== undefined
			&& formItemJson.showCase.indexOf( passedData.showCase ) >= 0 )
		{
			divInputTag.show();
		}

	}

	me.addStylesForField = function( divInputTag, formItemJson )
	{
		var entryTag = divInputTag.find( "select,input" );

		if( formItemJson.styles !== undefined )
		{
			for( var i in formItemJson.styles )
			{
				var styleDef = formItemJson.styles[i];
				entryTag.css( styleDef.name, styleDef.value );
			}
		}

	}

	me.addRuleForField = function( divInputTag, formItemJson )
	{
		var entryTag = divInputTag.find( "select,input" );
		var regxRules = [];

		if( formItemJson.rules !== undefined )
		{
			for( var i in formItemJson.rules )
			{
				var ruleDef = formItemJson.rules[i];  // could be string name of def or rule object itself.
				var ruleJson = FormUtil.getObjFromDefinition( ruleDef, me.cwsRenderObj.configJson.definitionRules );

				if ( ruleJson.name )
				{
					entryTag.attr( ruleJson.name, ruleJson.value );

					if( ruleJson.name === "mandatory" && ruleJson.value === "true" )
					{
						var titleTag = divInputTag.find( ".titleDiv" );
						titleTag.after( $( "<span class='redStar'> * </span>" ) );
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
	};

	
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
				var targetInputDivTag = targetInputTag.closest( 'div.inputDiv');

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
		return formDivSecTag.find( 'input[name="' + idStr + '"],select[name="' + idStr + '"]' );
	};


	// ---- EVAL Actions Related --------------------------
	// ----------------------------------------------------


	me.populateFormData = function( passedData, formDivSecTag )
	{
		//console.log( passedData );

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
				var inputTags = formDivSecTag.find( 'input,select' );

				// Go through each input tags and use 'uid' to match the attribute for data population
				inputTags.each( function( i ) 
				{
					var inputTag = $( this );
					var uidStr = inputTag.attr( 'uid' );

					//console.log( 'inputTag visible, uid: ' + uidStr + ', visible: ' + inputTags.is( ':visible') );

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

	// -------------------------------
	
	me.initialize();
}