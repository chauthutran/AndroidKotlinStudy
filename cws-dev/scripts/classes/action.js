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
		console.log( clickActionJson.actionType );
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
					console.log( clickActionJson );
					console.log( blockPassingData );
					var blockJson = FormUtil.getObjFromDefinition( clickActionJson.blockId, me.cwsRenderObj.configJson.definitionBlocks );

					// 'blockPassingData' exists is called from 'processWSResult' actions
					if ( blockPassingData === undefined ) blockPassingData = {}; // passing data to block
					blockPassingData.showCase = clickActionJson.showCase;
					blockPassingData.hideCase = clickActionJson.hideCase;
					if ( clickActionJson.showCase ) console.log( clickActionJson.showCase );
					if ( clickActionJson.hideCase ) console.log( clickActionJson.hideCase );
					// Hide block if action is doing 'openBlock'
					me.blockObj.hideBlock();

					var newBlockObj = new Block( me.cwsRenderObj, blockJson, clickActionJson.blockId, me.blockObj.parentTag, blockPassingData, { 'notClear': true } );	
					newBlockObj.render();
				}

				if ( afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "openArea" )
			{				
				if ( clickActionJson.areaId )
				{					
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

						// For now, loop these actions..  rather than recursive calls..
						//for ( var i = 0; i < statusActions.length; i++ )
						//{
							// NOTE: These do not support Async calls...  If added, we need to 
						//	me.actionPerform( statusActions[i], blockDivTag, formDivSecTag, btnTag, actions, actionIndex, dataPass, clickedItemData, passedData_Temp );
						//}
					}
				}

				// If statusActions did not get started for some reason, return as this action finished
				if ( !statusActionsCalled && afterActionFunc ) afterActionFunc();
			}
			else if ( clickActionJson.actionType === "sendToWS" )
			{
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

				//FormUtil.setLastPayload( 'sendToWS', inputsJson, 'receivedFromWS' )
				FormUtil.trackPayload( 'sent', inputsJson, 'received', actionDef );

				// Voucher Status add to payload
				if ( clickActionJson.voucherStatus )
				{
					inputsJson.voucherStatus = clickActionJson.voucherStatus;
				}

				// generate url
				var url = FormUtil.generateUrl( inputsJson, clickActionJson );

				if ( url !== undefined )
				{
					var submitJson = {};
					submitJson.payloadJson = inputsJson;
					submitJson.url = url;
					submitJson.actionJson = clickActionJson;	

					// USE OFFLINE 1st STRATEGY FOR REDEEMLIST INSERTS (dataSync manager will ensure records are added via WS)
					if ( clickActionJson.redeemListInsert === "true" )
					{
						// Offline Submission Handling..
						//if ( clickActionJson.redeemListInsert === "true" )
						{
							me.blockObj.blockListObj.redeemList_Add( submitJson, me.blockObj.blockListObj.status_redeem_queued );
						}

						//dataPass.prevWsReplyData = { 'resultData': { 'status': 'offline' } };
						dataPass.prevWsReplyData = { 'resultData': { 'status': 'queued ' + ConnManager.getAppConnMode_Online() } };

						if ( afterActionFunc ) afterActionFunc();
					}
					else if ( clickActionJson.url !== undefined )
					{					
						// generate url
						var url = FormUtil.generateUrl( inputsJson, clickActionJson );

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
								//console.log( redeemReturnJson );
								//alert( 'Process Failed!!' );
								MsgManager.notificationMessage ( 'Process Failed!!', 'notificationDark', undefined, '', 'right', 'top' );
								// Should we stop at here?  Or continue with subActions?

								var resultStr = "actionFailed";
							}

							if ( afterActionFunc ) afterActionFunc( resultStr );

						});
					}
				}
			}
		}
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