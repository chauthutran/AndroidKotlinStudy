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

	me.handleClickActions = function( btnTag, btnOnClickActions )
	{		
		var blockDivTag = btnTag.closest( '.block' );
		var formDivSecTag = blockDivTag.find( '.formDivSec' );

		// NOTE: TRAN VALIDATION
		if( me.blockObj.validationObj.checkFormEntryTagsData( formDivSecTag ) )
		{
			var passData = [];

			me.recurrsiveActions( blockDivTag, formDivSecTag, btnTag, btnOnClickActions, 0, passData, undefined, function( finalPassData ) {
			} );
		}
	}

	me.handleItemClickActions = function( btnTag, btnOnClickActions, itemIdx, clickedItemData )
	{		
		var blockDivTag = btnTag.closest( 'div.block' );
		var itemBlockTag = btnTag.closest( '.itemBlock' );

		// NOTE: TRAN VALIDATION
		if( me.blockObj.validationObj.checkFormEntryTagsData( itemBlockTag ) )
		{
			var passData = [];

			me.recurrsiveActions( blockDivTag, itemBlockTag, btnTag, btnOnClickActions, 0, passData, clickedItemData, function( finalPassData ) {
			} );
		}
	}

	me.recurrsiveActions = function( blockDivTag, formDivSecTag, btnTag, actions, actionIndex, passData, clickedItemData, returnFunc )
	{
		// If 'recurr' reached the end, call 'returnFunc' with data accumulated?  or last one package..
		if ( actionIndex >= actions.length )
		{
			returnFunc( passData );
		}
		else
		{			
			var asyncCalled = me.clickActionPerform( actions[actionIndex], blockDivTag, formDivSecTag, btnTag, actions, actionIndex, passData, clickedItemData, returnFunc );

			if ( !asyncCalled )	
			{
				// If not already added, add blank object.
				var existingPassData = passData[actionIndex];
				if ( existingPassData === undefined ) passData.push( {} );
				else 
				{
					console.log( 'already added passData case: ' );
					console.log( existingPassData );
				}

				actionIndex++;
				me.recurrsiveActions( blockDivTag, formDivSecTag, btnTag, actions, actionIndex, passData, clickedItemData, returnFunc );
			}
		}
	}

	me.clickActionPerform = function( actionDef, blockDivTag, formDivSecTag, btnTag, actions, actionIndex, passData, clickedItemData, returnFunc, passedData )
	{
		// TODO: all the blockDivTag related should be done by 'block' class method
		
		var asyncCalled = false;

		var clickActionJson = FormUtil.getObjFromDefinition( actionDef, me.cwsRenderObj.configJson.definitionActions );

		if ( clickActionJson !== undefined )
		{
			if ( clickActionJson.actionType === "clearOtherBlocks" )
			{
				var currBlockId = blockDivTag.attr( 'blockId' );

				me.renderBlockTag.find( 'div.block' ).not( '[blockId="' + currBlockId + '"]' ).remove();
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
			}
			else if ( clickActionJson.actionType === "hideBlock" )
			{
				//blockDivTag.hide();
				me.blockObj.hideBlock();
			}
			else if ( clickActionJson.actionType === "openBlock" )
			{
				if ( clickActionJson.blockId !== undefined )
				{
					var blockJson = FormUtil.getObjFromDefinition( clickActionJson.blockId, me.cwsRenderObj.configJson.definitionBlocks );
				
					if ( passedData === undefined ) passedData = {};
					passedData.showCase = clickActionJson.showCase;
					passedData.hideCase = clickActionJson.hideCase;
					
					// Hide block if action is doing 'openBlock'
					me.blockObj.hideBlock();

					var newBlockObj = new Block( me.cwsRenderObj, blockJson, clickActionJson.blockId, me.blockObj.parentTag, passedData, { 'notClear': true } );	
					//var newBlockObj = new Block( me.cwsRenderObj, blockJson, clickActionJson.blockId, me.renderBlockTag, passedData, { 'notClear': true } );	
					newBlockObj.renderBlock();
				}
			}
			else if ( clickActionJson.actionType === "openArea" )
			{
				console.log( 'openArea: ' );
				console.log( clickActionJson.areaId );
				
				if ( clickActionJson.areaId )
				{					
					me.cwsRenderObj.renderArea( clickActionJson.areaId );
				}
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
			}
			else if ( clickActionJson.actionType === "alertMsg" )
			{
				alert( clickActionJson.message );
			}
			else if ( clickActionJson.actionType === "topNotifyMsg" )
			{
				MsgManager.msgAreaShow( clickActionJson.message );
			}
			else if ( clickActionJson.actionType === "processWSResult" ) 
			{
				// 1. Match the case..
				var passedData_Temp = passData[actionIndex - 1];

				if ( passedData_Temp.resultData !== undefined && clickActionJson.resultCase !== undefined )
				{
					var statusActions = clickActionJson.resultCase[ passedData_Temp.resultData.status ];

					if ( statusActions && statusActions.length > 0 )
					{
						// For now, loop these actions..  rather than recursive calls..
						for ( var i = 0; i < statusActions.length; i++ )
						{
							// NOTE: this should not call 'async' calls?  to webservice?
							me.clickActionPerform( statusActions[i], blockDivTag, formDivSecTag, btnTag, actions, actionIndex, passData, clickedItemData, returnFunc, passedData_Temp );
						}
					}
				}
			}
			else if ( clickActionJson.actionType === "sendToWS" ) 
			{
				var currBlockId = blockDivTag.attr( 'blockId' );

				// generate inputsJson - with value assigned...
				var inputsJson = FormUtil.generateInputJson( formDivSecTag, clickActionJson.payloadBody );

				FormUtil.setLastPayload ( inputsJson )

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


					if ( !ConnManager.getAppConnMode_Online() )
					{
						// Offline Submission Handling..
						if ( clickActionJson.redeemListInsert === "true" )
						{
							me.blockObj.blockListObj.redeemList_Add( submitJson, me.blockObj.blockListObj.status_redeem_queued );
						}

						// PUT IT INSIDE OF ABOVE IF CASE?
						var passedData_Temp = passData[actionIndex - 1];
						
						var returnJson = { 'resultData': { 'status': 'offline' } };					
						passData.push( returnJson );

					}
					else if ( clickActionJson.url !== undefined )
					{					
						// generate url
						var url = FormUtil.generateUrl( inputsJson, clickActionJson );
						
						asyncCalled = true;

						// Loading Tag part..
						var loadingTag = FormUtil.generateLoadingTag( btnTag );

						
						// NOTE: This form data is saved in owner form block
						// TODO: THIS SHOULD BE ADDED TO 'QUEUE' AND LATER CHANGED TO 'SUBMIT'
						if ( clickActionJson.redeemListInsert === "true" )
						{
							me.blockObj.blockListObj.redeemList_Add( submitJson, me.blockObj.blockListObj.status_redeem_submit );
						}

						FormUtil.submitRedeem( url, inputsJson, clickActionJson, loadingTag, function( success, returnJson ) {
							// final call..
							actionIndex++;
							if ( !returnJson ) returnJson = {};

							//console.log( 'FormUtil.submitRedeem returnJson - ' + JSON.stringify( returnJson ) + ", success - " + success );

							if ( success )
							{
								passData.push( returnJson );
								me.recurrsiveActions( blockDivTag, formDivSecTag, btnTag, actions, actionIndex, passData, clickedItemData, returnFunc );	
								//localStorage.setItem( 'lastPayload', '{"data": ' + JSON.stringify( inputsJson ) + ' } ' ); // added by Greg (2018/12/05)
							}
							else
							{
								console.log( returnJson );
								alert( 'Process Failed!!' );
							}
						});
						/*, function() {
							actionIndex++;
							passData.push( {} );
							me.recurrsiveActions( blockDivTag, formDivSecTag, btnTag, actions, actionIndex, passData, clickedItemData, returnFunc );	
						});*/
					}
				}
			}
		}

		return asyncCalled;
	}

	// ========================================================
	

}