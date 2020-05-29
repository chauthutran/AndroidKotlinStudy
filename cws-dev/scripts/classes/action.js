// -------------------------------------------
// -- Action Class/Methods
function Action( cwsRenderObj, blockObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	
	me.renderBlockTag = cwsRenderObj.renderBlockTag;

	me.className_btnClickInProcess = 'btnClickInProcess';
	
	// -----------------------------
	// ---- Methods ----------------
	
	me.initialize = function() { }

	// ------------------------------------

	// Same level as 'render' in other type of class
	me.handleClickActions = function( btnTag, btnOnClickActions, blockDivTag, formDivSecTag )
	{		
		if ( formDivSecTag.attr( 'data-fields') != undefined )
		{
			me.handleSequenceIncrCommits( formDivSecTag );
		}

		var dataPass = {};

		if ( !me.btnClickedAlready( btnTag ) )
		{
			me.btnClickMarked( btnTag );

			me.handleActionsInSync( blockDivTag, formDivSecTag, btnTag, btnOnClickActions, 0, dataPass, undefined, function( finalPassData, resultStr ) {
			
				me.clearBtn_ClickedMark( btnTag );
			} );	
		}
		else
		{
			console.log( 'Btn already clicked/in process' );
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
					var calcVal = Util2.getValueFromPattern( tagTarget, pattern, ( pattern.indexOf( 'SEQ[' ) > 0 ) );

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

	me.handleItemClickActions = function( btnTag, btnOnClickActions, itemIdx, blockDivTag, itemBlockTag )
	{		
		var dataPass = {};

		if ( !me.btnClickedAlready( btnTag ) )
		{
			me.btnClickMarked( btnTag );

			me.handleActionsInSync( blockDivTag, itemBlockTag, btnTag, btnOnClickActions, 0, dataPass, undefined, function( finalPassData, resultStr ) {
				me.clearBtn_ClickedMark( btnTag );					
			} );
		}
		else
		{
			console.log( 'Btn already clicked/in process' );
		}
	}

	// ------------------------------------

	// Create a process to call actions one by one with waiting for each one to finish and proceed to next one
	// me.recurrsiveActions
	me.handleActionsInSync = function( blockDivTag, formDivSecTag, btnTag, actions, actionIndex, dataPass, blockPassingData, endOfActionsFunc )
	{
		if ( actionIndex >= actions.length ) endOfActionsFunc( dataPass, "Success" );
		else
		{
			// me.clickActionPerform
			me.actionPerform( actions[actionIndex], blockDivTag, formDivSecTag, btnTag, dataPass, blockPassingData, function( bResult, moreInfoJson )
			{				
				if ( bResult === false )
				{
					console.log( 'Action Failed.  Actions processing stopped at Index ' + actionIndex );
					if ( moreInfoJson ) console.log( moreInfoJson );
					endOfActionsFunc( dataPass, "Failed" );
				}
				else
				{
					actionIndex++;

					me.handleActionsInSync( blockDivTag, formDivSecTag, btnTag, actions, actionIndex, dataPass, blockPassingData, endOfActionsFunc );
				}
			});
		}
	}


	// me.clickActionPerform 
	me.actionPerform = function( actionDef, blockDivTag, formDivSecTag, btnTag, dataPass, blockPassingData, afterActionFunc )
	{
		// TODO: all the blockDivTag related should be done by 'block' class method
		try
		{
			var clickActionJson = FormUtil.getObjFromDefinition( actionDef, ConfigManager.getConfigJson().definitionActions );

			// ACTIVITY ADDING
			var activityJson = ActivityUtil.addAsActivity( 'action', clickActionJson, actionDef );
			
			if ( clickActionJson )
			{
				if ( clickActionJson.actionType === "evaluation" )
				{
					//console.log( blockPassingData.displayData );
					blockPassingData.displayData = me.actionEvaluateExpression( blockPassingData.displayData, clickActionJson );
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
						var blockJson = FormUtil.getObjFromDefinition( clickActionJson.blockId, ConfigManager.getConfigJson().definitionBlocks );
	
						// 'blockPassingData' exists is called from 'processWSResult' actions
						if ( blockPassingData === undefined ) blockPassingData = {}; // passing data to block
						blockPassingData.showCase = clickActionJson.showCase;
						blockPassingData.hideCase = clickActionJson.hideCase;
	
	
						// Hide block if action is doing 'openBlock'
						me.blockObj.hideBlock();
	
						var newBlockObj = new Block( me.cwsRenderObj, blockJson, clickActionJson.blockId, me.blockObj.parentTag, blockPassingData, { 'notClear': true }, clickActionJson );	
						newBlockObj.render();
	
						if ( clickActionJson.payloadConfig )
						{
							// TODO: REMOVE <-- FormUtil.block_payloadConfig  <--- Passed in on new Block( --- clickActionJson )
							FormUtil.block_payloadConfig = clickActionJson.payloadConfig;
							// NOT SURE IF THIS IS PROPER PLACE..
							FormUtil.setPayloadConfig( newBlockObj, clickActionJson.payloadConfig, ConfigManager.getConfigJson().definitionForms[ blockJson.form ] );
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
					// Temporarily move before 'handlePayloadPreview' - since version 1 
					var formsJsonGroup = {};
					var inputsJson = ActivityUtil.generateInputJsonByType( clickActionJson, formDivSecTag, formsJsonGroup );
					var blockInfo = me.getBlockInfo_Attr( formDivSecTag.closest( 'div.block' ) );

					FormUtil.trackPayload( 'sent', inputsJson, 'received', actionDef );	

					// NOTE: 'Activity' payload generate case, we would always use 'redeemListInsert' now..
					if ( clickActionJson.redeemListInsert === "true" )
					{						
						ActivityUtil.handlePayloadPreview( clickActionJson.previewPrompt, formDivSecTag, btnTag, function( passed ) 
						{ 
							//var currBlockId = blockDivTag.attr( 'blockId' );
							if ( passed )
							{
								ActivityDataManager.createNewPayloadActivity( inputsJson, formsJsonGroup, blockInfo, clickActionJson, function( activityJson )
								{
									dataPass.prevWsReplyData = { 'resultData': { 'status': 'queued ' + ConnManagerNew.statusInfo.appMode.toLowerCase() } };
			
									if ( afterActionFunc ) afterActionFunc();
								} );		
							}
							else
							{
								//if ( afterActionFunc ) afterActionFunc( false );
								throw 'canceled on preview';
							}
						});
								
					}
					else
					{
						// Immediate Submit to Webservice case - Normally use for 'search' (non-activityPayload gen cases)
						me.submitToWs( inputsJson, clickActionJson, btnTag, dataPass, function( bResult, optionJson ) {
							if ( afterActionFunc ) afterActionFunc( bResult, optionJson );
						} );
					}
				}
			}
		}
		catch ( errMsg )
		{
			if ( afterActionFunc ) afterActionFunc( false, { 'type': 'actionException', 'msg': errMsg } );
		}
	};


	// ----------------------------------------------

	me.submitToWs = function( formsJson, actionDefJson, btnTag, dataPass, afterActionFunc )
	{
		// get url - if 'dws.url' exists, use it.  otherwise, use normal url.
		var url = ( actionDefJson.dws && actionDefJson.dws.url ) ? actionDefJson.dws.url : actionDefJson.url;

		if ( url )
		{					
			// NOTE: USED FOR IMMEDIATE SEND TO WS (Ex. Search by voucher/phone/detail case..)

			// Loading Tag part..
			var loadingTag = FormUtil.generateLoadingTag( btnTag );

			
			WsCallManager.wsActionCall( url, formsJson, loadingTag, function( success, redeemReturnJson ) {

				if ( !redeemReturnJson ) redeemReturnJson = {};

				FormUtil.trackPayload( 'received', redeemReturnJson, undefined, actionDefJson );

				var bResult = true;
				var moreInfoJson;

				if ( success )
				{
					dataPass.prevWsReplyData = redeemReturnJson;
				}
				else
				{
					// MISSING TRANSLATION
					MsgManager.notificationMessage ( 'Process Failed!!', 'notificationDark', undefined, '', 'right', 'top' );
					// Should we stop at here?  Or continue with subActions?

					bResult = false; // "actionFailed";
					moreInfoJson = { 'type': 'requestFailed', 'msg': 'Request call returned with failure.'}
				}

				if ( afterActionFunc ) afterActionFunc( bResult, moreInfoJson );

			});
		}
		else
		{
			MsgManager.notificationMessage ( 'Process Failed - no url!!', 'notificationDark', undefined, '', 'right', 'top' );
			// Do not need to returnFunc?  --> 	 if ( afterActionFunc ) afterActionFunc( resultStr );

			throw 'url info missing on actionDef - during submitToWs';
			//if ( afterActionFunc ) afterActionFunc( false, { 'type': '', 'msg': '' } );
		}		
	};

	
    me.actionEvaluateExpression = function( jsonList, actionExpObj )
    {
        //for( var a = 0; a < actionTypeObj.length; a++ )
        {
            var expString = actionExpObj.expression;

            for( var i = 0; i < jsonList.length; i++ )
            {
                var myCondTest = expString.replace( new RegExp( '[$${]', 'g'), "" ).replace( new RegExp( '}', 'g'), "" );
    
                for( var p = 0; p < jsonList[ i ].length; p++ )
                {
                    var regFind = new RegExp(jsonList[ i ][ p ].id, 'g');
                    myCondTest = myCondTest.replace(  regFind, jsonList[ i ][ p ].value );
                }

                //console.log( expString );
                //console.log( myCondTest );
    
                var result =  eval( myCondTest );

                if ( actionExpObj.attribute )
                {
                    jsonList[ i ].push ( { "displayName": actionExpObj.attribute.displayName, "id": actionExpObj.attribute.id, "value": result } );
                }
                else
                {
                    jsonList[ i ].push ( { "displayName": "evaluation_" + a, "id": "evaluation_" + a, "value": result } );
                }
    
            }
        }

        return jsonList;
    };

	// ========================================================
	
	me.btnClickedAlready = function( btnTag )
	{
		return btnTag.hasClass( me.className_btnClickInProcess );
	};

	me.btnClickMarked = function( btnTag )
	{
		btnTag.addClass( me.className_btnClickInProcess );
	};

	me.clearBtn_ClickedMark = function( btnTag )
	{
		btnTag.removeClass( me.className_btnClickInProcess );
	};

	// ========================================================
	
	me.getBlockInfo_Attr = function( blockDivTag )
	{
		var blockInfo = { 'activityType': '' };

		if ( blockDivTag )
		{
			var activityType = blockDivTag.attr( 'activityType' );

			if ( activityType )
			{
				blockInfo.activityType = activityType;
			}
		}

		return blockInfo;
	};

}