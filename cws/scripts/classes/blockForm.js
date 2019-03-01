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
		me.formJsonArr = formJsonArr;

		if ( formJsonArr !== undefined )
		{
			formDivSecTag = $( '<div class="formDivSec"></div>' );
			blockTag.append( formDivSecTag );

			var formFull_IdList = me.getIdList_FormJson( formJsonArr );

			for( var i = 0; i < formJsonArr.length; i++ )
			{
				if ( me.blockObj.blockType === FormUtil.blockType_MainTabContent )
				{					
					me.renderInput_TabContent( formJsonArr[i], formDivSecTag, formFull_IdList, passedData );
				}
				else
				{
					me.renderInput( formJsonArr[i], formDivSecTag, formFull_IdList, passedData );
				}
			}


			me.populateFormData( passedData, formDivSecTag );

			// NOTE: TRAN VALIDATION
			me.blockObj.validationObj.setUp_Events( formDivSecTag );
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
		//console.log( 'adding renderInput_TabContent' );

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

	
	me.setEventsAndRules = function( formItemJson, entryTag, divInputTag, formDivSecTag, formFull_IdList, passedData)
	{
		if ( entryTag )
		{
			// Set Event
			entryTag.change( function() 
			{
				me.performEvalActions( $(this), formItemJson, formDivSecTag, formFull_IdList );
			});
		}

		
		// NOTE: TRAN VALIDATION
		// Add rules for IMPUT fields
		me.addRuleForField( divInputTag, formItemJson );


		// Set Tag Visibility
		if ( formItemJson.display === "hiddenVal" )
		{
			divInputTag.hide();
			entryTag.attr( 'display', 'hiddenVal' );
			//console.log( 'tag.hide() - hiddenVal' );
		}
		else if ( formItemJson.display === "none" )
		{
			divInputTag.hide();
			//console.log( 'tag.hide() - none' );
		}
		

		if ( passedData !== undefined 
			&& passedData.hideCase !== undefined 
			&& formItemJson.hideCase !== undefined
			&& formItemJson.hideCase.indexOf( passedData.hideCase ) >= 0 )
		{
			//console.log( 'hideCase - by passedData' );
			//divInputTag.find("input,select").remove();
			divInputTag.hide();
		}

		if ( passedData !== undefined 
			&& passedData.showCase !== undefined 
			&& formItemJson.showCase !== undefined
			&& formItemJson.showCase.indexOf( passedData.showCase ) >= 0 )
		{
			//console.log( 'showCase - by passedData' );
			divInputTag.show();
		}		
	}


	me.addRuleForField = function( divInputTag, formItemJson )
	{
		//console.log( 'addRuleForField: ' + divInputTag.html() );
		//console.log( formItemJson );
		var entryTag = divInputTag.find( "select,input" );
		var regxRules = [];

		if( formItemJson.rules !== undefined )
		{
			//console.log( formItemJson.rules );
			for( var i in formItemJson.rules )
			{
				var ruleDef = formItemJson.rules[i];  // could be string name of def or rule object itself.
				//console.log( ruleDef );
				var ruleJson = FormUtil.getObjFromDefinition( ruleDef, me.cwsRenderObj.configJson.definitionRules );

				if ( ruleJson.name )
				{
					entryTag.attr( ruleJson.name, ruleJson.value );

					if( ruleJson.name === "mandatory" && ruleJson.value === "true" )
					{
						var titleTag = divInputTag.find( ".titleDiv" );
						titleTag.append("<span style='color:red;'> * </span>")
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
					//var keys = Object.keys( ruleJson );
					//entryTag.attr( keys[ 0 ], ruleJson[ keys[ 0 ] ] );

					entryTag.attr( "type", ruleJson.type );

				}
			}

			if ( regxRules.length > 0 )
			{
				entryTag.attr( "patterns", encodeURI( JSON.stringify( regxRules ) ) );
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
				//console.log( 'performEvalActions, tag: ' + tag.attr( 'name ' ) );

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
				//console.log( 'performEvalAction, tagVal: ' + tagVal );

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
				// var afterCondStr = evalCondition.replace( '$$(this)', tagVal );
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

			// formDivSecTag.find( '#countryType' ).val( "MZ" );
			// formDivSecTag.find( '#cbdCase' ).val( "Y" );
			if ( clientId ) formDivSecTag.find( '[name="clientId"]' ).val( clientId );
			if ( voucherId ) formDivSecTag.find( '[name="voucherId"]' ).val( voucherId );
			// NOTE: But these coudl also be populated by below data..

			// formDivSecTag.find( '#cbdEnrollOuId' ).val( passedData.data.relationships[0].cbdEnrollOu );


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

		console.log( 'set Walk In Clint case: ' + walkInClientCase );
		
		return walkInClientCase;
	}

	// -------------------------------
	
	me.initialize();
}