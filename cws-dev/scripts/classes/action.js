// -------------------------------------------
// -- Action Class/Methods
function Action( cwsRenderObj, blockObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	
	me.renderBlockTag = cwsRenderObj.renderBlockTag;

	// -----------------------------
	// ---- Methods ----------------
	
	me.initialize = function() { }

	// ------------------------------------

	// Same level as 'render' in other type of class
	me.handleClickActions = function( btnTag, btnOnClickActions )
	{		
		var blockDivTag = btnTag.closest( '.block' );
		var formDivSecTag = blockDivTag.find( '.formDivSec' );

		if ( formDivSecTag.attr( 'data-fields') != undefined )
		{
			me.handleSequenceIncrCommits( formDivSecTag );
		}

		// NOTE: TRAN VALIDATION
		if( me.blockObj.validationObj.checkFormEntryTagsData( formDivSecTag ) )
		{
			var dataPass = {};

			if ( !me.btnClickedAlready( btnTag ) )
			{
				me.btnClickMarked( btnTag );
				me.handleActionsInSync( blockDivTag, formDivSecTag, btnTag, btnOnClickActions, 0, dataPass, undefined, function( finalPassData ) {
					me.clearBtn_ClickedMark( btnTag );
				} );
			}
			else
			{
				//console.log( 'Btn already clicked/in process' );
			}
		}
	}

	me.handleSequenceIncrCommits = function( formDivSecTag )
	{
		var jData = JSON.parse( unescape( formDivSecTag.attr( 'data-fields') ) );
		var pConf = FormUtil.block_payloadConfig;

		for( var i = 0; i < jData.length; i++ )
		{
			if ( jData[ i ].defaultValue || jData[ i ].payload )
			{
				var payloadPattern = false;
				var pattern = '';

				payloadPattern = ( jData[ i ].defaultValue && jData[ i ].defaultValue.indexOf( 'generatePattern(' ) > 0 );

				if ( payloadPattern )
				{
					pattern = Util.getParameterInside( jData[ i ].defaultValue, '()' );
				}
				else
				{
					payloadPattern = ( jData[ i ].payload && jData[ i ].payload[ pConf ] && jData[ i ].payload[ pConf ].defaultValue && jData[ i ].payload[ pConf ].defaultValue.indexOf( 'generatePattern(' ) > 0 );

					if ( payloadPattern )
					{
						pattern = Util.getParameterInside( jData[ i ].payload[ pConf ].defaultValue, '()' );
					}
				}

				if ( payloadPattern )
				{
					var tagTarget = formDivSecTag.find( '[name="' + jData[ i ].id + '"]' );
					var calcVal = Util.getValueFromPattern( tagTarget, pattern, ( pattern.indexOf( 'SEQ[' ) > 0 ) );

					if ( calcVal != undefined )
					{
						if ( tagTarget.css( 'text-transform' ) != undefined )
						{
							if ( tagTarget.css( 'text-transform' ).toString().toUpperCase() == 'UPPERCASE' )
							{
								calcVal = calcVal.toUpperCase()
							}
							else if ( tagTarget.css( 'text-transform' ).toString().toUpperCase() == 'LOWERCASE' )
							{
								calcVal = calcVal.toLowerCase()
							}
						}
						else
						{
							console.log( ' ~ no Lower/Upper case defined: ' + ta[ i ].id );
						}
					}
					else
					{
						calcVal = '';
					}


					tagTarget.val( calcVal );

				}
			}
		}
	}

	me.handleItemClickActions = function( btnTag, btnOnClickActions, itemIdx )
	{		
		// NOTE: 'clickedItemData' will be passed to block as 'passedData'

		var blockDivTag = btnTag.closest( 'div.block' );
		var itemBlockTag = btnTag.closest( '.itemBlock' );

		// NOTE: TRAN VALIDATION
		if( me.blockObj.validationObj.checkFormEntryTagsData( itemBlockTag ) )
		{
			var dataPass = {};

			if ( !me.btnClickedAlready( btnTag ) )
			{
				me.handleActionsInSync( blockDivTag, itemBlockTag, btnTag, btnOnClickActions, 0, dataPass, undefined, function( finalPassData ) {
					me.clearBtn_ClickedMark( btnTag );					
				} );
			}
			else
			{
				console.log( 'Btn already clicked/in process' );
			}
		}
	}

	// ------------------------------------

	// Create a process to call actions one by one with waiting for each one to finish and proceed to next one
	// me.recurrsiveActions
	me.handleActionsInSync = function( blockDivTag, formDivSecTag, btnTag, actions, actionIndex, dataPass, blockPassingData, endOfActionsFunc )
	{
		if ( actionIndex >= actions.length ) endOfActionsFunc( dataPass );
		else
		{
			// me.clickActionPerform
			me.actionPerform( actions[actionIndex], blockDivTag, formDivSecTag, btnTag, dataPass, blockPassingData, function( resultStr )
			{				
				if ( resultStr !== "actionFailed" )
				{
					actionIndex++;

					me.handleActionsInSync( blockDivTag, formDivSecTag, btnTag, actions, actionIndex, dataPass, blockPassingData, endOfActionsFunc );
				}
				else
				{
					console.log( 'Action Failed.  Actions processing stopped at Index ' + actionIndex );
					endOfActionsFunc( dataPass );
				}

			});
		}
	}


	// me.clickActionPerform 
	me.actionPerform = function( actionDef, blockDivTag, formDivSecTag, btnTag, dataPass, blockPassingData, afterActionFunc )
	{
		// TODO: all the blockDivTag related should be done by 'block' class method

		var clickActionJson = FormUtil.getObjFromDefinition( actionDef, me.cwsRenderObj.configJson.definitionActions );

		// ACTIVITY ADDING
		ActivityUtil.addAsActivity( 'action', clickActionJson, actionDef );

		if ( clickActionJson )
		{
			if ( clickActionJson.actionType === "evaluation" )
			{
				//console.log( blockPassingData.displayData );
				blockPassingData.displayData = me.blockObj.dataListObj.actionEvaluateExpression( blockPassingData.displayData, clickActionJson );
				//console.log( blockPassingData.displayData );

				if ( afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "clearOtherBlocks" )
			{
				var currBlockId = blockDivTag.attr( 'blockId' );

				me.renderBlockTag.find( 'div.block' ).not( '[blockId="' + currBlockId + '"]' ).remove();

				if ( afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "closeBlock" )
			{
				if( clickActionJson.closeLevel !== undefined )
				{
					var closeLevel = Util.getNum( clickActionJson.closeLevel );

					var divBlockTotal = me.renderBlockTag.find( 'div.block:visible' ).length;

					var currBlock = blockDivTag;

					for ( var i = 0; i < divBlockTotal; i++ )
					{
						var tempPrevBlock = currBlock.prev( 'div.block' );

						if ( closeLevel >= i ) 
						{
							currBlock.remove();
						}
						else break;

						currBlock = tempPrevBlock;
					}
				}
				else if( clickActionJson.blockId != undefined )
				{
					me.renderBlockTag.find("[blockid='" + clickActionJson.blockId + "']" ).remove();
				}

				if ( afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "hideBlock" )
			{
				//blockDivTag.hide();
				me.blockObj.hideBlock();

				if ( afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "openBlock" )
			{
				if ( clickActionJson.blockId !== undefined )
				{
					var blockJson = FormUtil.getObjFromDefinition( clickActionJson.blockId, me.cwsRenderObj.configJson.definitionBlocks );

					// 'blockPassingData' exists is called from 'processWSResult' actions
					if ( blockPassingData === undefined ) blockPassingData = {}; // passing data to block
					blockPassingData.showCase = clickActionJson.showCase;
					blockPassingData.hideCase = clickActionJson.hideCase;


					// Hide block if action is doing 'openBlock'
					me.blockObj.hideBlock();

					var newBlockObj = new Block( me.cwsRenderObj, blockJson, clickActionJson.blockId, me.blockObj.parentTag, blockPassingData, { 'notClear': true } );	
					newBlockObj.render();

					if ( clickActionJson.payloadConfig )
					{
						FormUtil.block_payloadConfig = clickActionJson.payloadConfig;
						FormUtil.setPayloadConfig( newBlockObj, clickActionJson.payloadConfig, me.cwsRenderObj.configJson.definitionForms[ blockJson.form ] );
					}
					else
					{
						FormUtil.block_payloadConfig = '';
					}

					

				}

				if ( afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "openArea" )
			{				
				if ( clickActionJson.areaId )
				{
					//if ( clickActionJson.areaId == 'list_c-on' ) console.log( 'x' );
					me.cwsRenderObj.renderArea( clickActionJson.areaId );
				}

				if ( afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "filledData" )
			{
				var dataFromDivTag =  me.renderBlockTag.find("[blockid='" + clickActionJson.fromBlockId + "']" );
				var dataToDivTag =  me.renderBlockTag.find("[blockid='" + clickActionJson.toBlockId + "']" );
				var dataItems = clickActionJson.dataItems;

				for ( var i = 0; i < dataItems.length; i++ )
				{
					var value = dataFromDivTag.find("[name='" + dataItems[i] + "']").val()
					dataToDivTag.find("[name='" + dataItems[i] + "']").val( value );
				}

				if ( afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "alertMsg" )
			{
				if ( clickActionJson.messageClass )
				{
					MsgManager.notificationMessage ( clickActionJson.message, clickActionJson.messageClass, undefined, '', 'right', 'top' );
				}
				else
				{
					MsgManager.notificationMessage ( clickActionJson.message, 'notificationDark', undefined, '', 'right', 'top' );
				}

				if ( afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "topNotifyMsg" )
			{
				if ( clickActionJson.messageClass )
				{
					MsgManager.notificationMessage ( me.cwsRenderObj.langTermObj.translateText( clickActionJson.message, clickActionJson.term ), clickActionJson.messageClass, undefined, '', 'right', 'top' );
				}
				else
				{
					MsgManager.notificationMessage ( me.cwsRenderObj.langTermObj.translateText( clickActionJson.message, clickActionJson.term ), 'notificationDark', undefined, '', 'right', 'top' );
				}
				// If term exists, translate it before displaying
				//MsgManager.msgAreaShow( me.cwsRenderObj.langTermObj.translateText( clickActionJson.message, clickActionJson.term ) );

				if ( afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "processWSResult" ) 
			{
				var statusActionsCalled = false;

				// get previous action ws replied data from 'dataPass' - data retrieved from Async Call (WebService Rest Api)
				var wsReplyData = dataPass.prevWsReplyData;

				if ( wsReplyData && wsReplyData.resultData && clickActionJson.resultCase )
				{
					var statusActions = clickActionJson.resultCase[ wsReplyData.resultData.status ];

					if ( statusActions && statusActions.length > 0 )
					{
						statusActionsCalled = true;
						var dataPass_Status = {};

						// NOTE: Calling 'statusActions' sub action list.  After completing this list, continue with main action list.
						me.handleActionsInSync( blockDivTag, formDivSecTag, btnTag, statusActions, 0, dataPass_Status, wsReplyData, function( finalPassData ) {
							if ( afterActionFunc ) afterActionFunc();
						} );

					}
				}

				// If statusActions did not get started for some reason, return as this action finished
				if ( !statusActionsCalled && afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "WSlocalData" )
			{
				var statusActionsCalled = false;

				if ( clickActionJson.localResource )
				{
					var wsExchangeData = FormUtil.wsExchangeDataGet( formDivSecTag, clickActionJson.payloadBody, clickActionJson.localResource );
					var statusActions = clickActionJson.resultCase[ wsExchangeData.resultData.status ];
					var dataPass_Status = {};

					statusActionsCalled = true;

					me.handleActionsInSync( blockDivTag, formDivSecTag, btnTag, statusActions, 0, dataPass_Status, wsExchangeData, function( finalPassData ) {
						if ( afterActionFunc ) afterActionFunc();
					} );

				}
				else
				{
					if ( !statusActionsCalled && afterActionFunc ) afterActionFunc(); 
				}

				// If statusActions did not get started for some reason, return as this action finished
			}
			else if ( clickActionJson.actionType === "sendToWS" )
			{

				//var blockJson = FormUtil.getObjFromDefinition( clickActionJson.blockId, me.cwsRenderObj.configJson.definitionBlocks );
				//me.cwsRenderObj.configJson.definitionForms[ blockJson.form ]

				me.handlePayloadPreview( undefined, clickActionJson, formDivSecTag, btnTag, function() { 

					var currBlockId = blockDivTag.attr( 'blockId' );
					var inputsJson;

					// generate inputsJson - with value assigned...
					if ( clickActionJson.payloadVersion && clickActionJson.payloadVersion == "2" )
					{
						inputsJson = FormUtil.generateInputTargetPayloadJson( formDivSecTag, clickActionJson.payloadBody );
					}
					else
					{
						inputsJson = FormUtil.generateInputJson( formDivSecTag, clickActionJson.payloadBody );
					}

					var previewJson = FormUtil.generateInputJson( formDivSecTag );

					FormUtil.trackPayload( 'sent', inputsJson, 'received', actionDef );

					// Voucher Status add to payload
					if ( clickActionJson.voucherStatus )
					{
						inputsJson.voucherStatus = clickActionJson.voucherStatus;
					}

					// generate url
					var url = me.generateWsUrl( inputsJson, clickActionJson );
	
					if ( url !== undefined )
					{
						var submitJson = {};
						submitJson.payloadJson = inputsJson;
						submitJson.previewJson = previewJson;
						submitJson.actionJson = clickActionJson;
						submitJson.url = url;
	
						// USE OFFLINE 1st STRATEGY FOR REDEEMLIST INSERTS (dataSync manager will ensure records are added via WS)
						if ( clickActionJson.redeemListInsert === "true" )
						{
							me.blockObj.blockListObj.redeemList_Add( submitJson, me.blockObj.blockListObj.status_redeem_queued, function(){
	
								dataPass.prevWsReplyData = { 'resultData': { 'status': 'queued ' + ConnManager.getAppConnMode_Online() } };
	
								if ( afterActionFunc ) afterActionFunc();
	
							} );
	
						}
						else if ( clickActionJson.url !== undefined )
						{					
							// generate url
							var url = me.generateWsUrl( inputsJson, clickActionJson );
	
							// Loading Tag part..
							var loadingTag = FormUtil.generateLoadingTag( btnTag );
	
							// NOTE: This form data is saved in owner form block
							// TODO: THIS SHOULD BE ADDED TO 'QUEUE' AND LATER CHANGED TO 'SUBMIT'
							if ( clickActionJson.redeemListInsert === "true" )
							{
								me.blockObj.blockListObj.redeemList_Add( submitJson, me.blockObj.blockListObj.status_redeem_submit );
							}
	
							FormUtil.submitRedeem( url, inputsJson, clickActionJson, loadingTag, function( success, redeemReturnJson ) {
								// final call..
								//actionIndex++;
								if ( !redeemReturnJson ) redeemReturnJson = {};
	
								FormUtil.trackPayload( 'received', redeemReturnJson, undefined, actionDef );
	
								var resultStr = "success";
	
								if ( success )
								{
									dataPass.prevWsReplyData = redeemReturnJson;
	
									// This will be picked up by 'processWSResult' action (next action to this one)
	
									//me.recurrsiveActions( blockDivTag, formDivSecTag, btnTag, actions, actionIndex, dataPass, clickedItemData, returnFunc );	
								}
								else
								{
									// MISSING TRANSLATION
									MsgManager.notificationMessage ( 'Process Failed!!', 'notificationDark', undefined, '', 'right', 'top' );
									// Should we stop at here?  Or continue with subActions?
	
									var resultStr = "actionFailed";
								}
	
								if ( afterActionFunc ) afterActionFunc( resultStr );
	
							});
						}
					}

				} )

			}
		}
	}

	me.handlePayloadPreview = function( formDefinition, clickActionJson, formDivSecTag, btnTag, callBack )
	{

		if ( clickActionJson.redeemListInsert === "true" )
		{

			var dataPass = FormUtil.generateInputPreviewJson( formDivSecTag );
			//var dataPass = FormUtil.generateInputTargetPayloadJson( formDivSecTag );

			formDivSecTag.hide();

			if ( clickActionJson.previewPrompt && clickActionJson.previewPrompt === "true" )
			{
				var confirmMessage = 'Please check before Confirm'; // MISSING TRANSLATION

				MsgManager.confirmPayloadPreview ( formDivSecTag.parent(), dataPass, confirmMessage, function( confirmed ){

					formDivSecTag.show();
	
					if ( confirmed )
					{
						if ( callBack ) callBack();
					}
					else
					{
						if ( btnTag ) me.clearBtn_ClickedMark( btnTag );
					}
	
				} );
			}
			else
			{
				if ( callBack ) callBack();
			}

		}
		else
		{
			if ( callBack ) callBack();
		}

	}


	// This has moved from FormUtil
	me.generateWsUrl = function( inputsJson, actionJson )
	{
		var url;

		if ( actionJson.url !== undefined )
		{
			url = WsApiManager.composeWsFullUrl( actionJson.url );

			if ( actionJson.urlParamNames !== undefined 
				&& actionJson.urlParamInputs !== undefined 
				&& actionJson.urlParamNames.length == actionJson.urlParamInputs.length )
			{
				var paramAddedCount = 0;
		
				for ( var i = 0; i < actionJson.urlParamNames.length; i++ )
				{
					var paramName = actionJson.urlParamNames[i];
					var inputName = actionJson.urlParamInputs[i];
		
					if ( inputsJson[ inputName ] !== undefined )
					{
						var value = inputsJson[ inputName ];
		
						url += ( paramAddedCount == 0 ) ? '?': '&';
		
						url += paramName + '=' + value;
					}
		
					paramAddedCount++;
				}
			}
		}
		
		return url;
	}
  
	// ========================================================
	
	me.btnClickedAlready = function( btnTag )
	{
		return btnTag.hasClass( 'clicked' );
	}

	me.btnClickMarked = function( btnTag )
	{
		btnTag.addClass( 'clicked' );
	}

	me.clearBtn_ClickedMark = function( btnTag )
	{
		btnTag.removeClass( 'clicked' );
	}

}