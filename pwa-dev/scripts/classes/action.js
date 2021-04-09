// -------------------------------------------
// -- Action Class/Methods
function Action( cwsRenderObj, blockObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	
	//me.pageDivTag = cwsRenderObj.pageDivTag; // NOTE: Should not be used!!!  Replace with me.btnTargetParentTag 
	me.btnTargetParentTag;  // button rendering div's parent tag..  <-- if tab button, target is tab content

	me.className_btnClickInProcess = 'btnClickInProcess';

	// -----------------------------
	// ---- Methods ----------------
	
	me.initialize = function() { }

	// ------------------------------------

	// Same level as 'render' in other type of class
	me.handleClickActions = function( btnTag, btnOnClickActions, btnTargetParentTag, blockDivTag, formDivSecTag, blockPassingData )
	{		
		me.btnTargetParentTag = btnTargetParentTag;

		// if ( formDivSecTag.attr( 'data-fields') != undefined )
		if ( me.blockObj.blockFormObj && blockObj.blockFormObj.formJsonArr )
		{
			me.handleSequenceIncrCommits( formDivSecTag, blockObj.blockFormObj.formJsonArr );
		}

		var dataPass = {};

		if ( !me.btnClickedAlready( btnTag ) )
		{
			me.btnClickMarked( btnTag );

			me.handleActionsInSync( blockDivTag, formDivSecTag, btnTag, btnOnClickActions, 0, dataPass, blockPassingData, function( finalPassData, resultStr ) {
			
				me.clearBtn_ClickedMark( btnTag );
			} );	
		}
		else
		{
			console.customLog( 'Btn already clicked/in process' );
		}
	};


	me.handleItemClickActions = function( btnTag, btnOnClickActions, itemIdx, blockDivTag, itemBlockTag, blockPassingData )
	{		
		me.btnTargetParentTag = me.blockObj.parentTag; 

		var dataPass = {};

		if ( !me.btnClickedAlready( btnTag ) )
		{
			me.btnClickMarked( btnTag );

			me.handleActionsInSync( blockDivTag, itemBlockTag, btnTag, btnOnClickActions, 0, dataPass, blockPassingData, function( finalPassData, resultStr ) {
				me.clearBtn_ClickedMark( btnTag );					
			} );
		}
		else
		{
			console.customLog( 'Btn already clicked/in process' );
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
				if ( bResult )
				{
					actionIndex++;
					me.handleActionsInSync( blockDivTag, formDivSecTag, btnTag, actions, actionIndex, dataPass, blockPassingData, endOfActionsFunc );				
				}
				else
				{
					console.customLog( 'Action Failed.  Actions processing stopped at Index ' + actionIndex );
					if ( moreInfoJson ) console.customLog( moreInfoJson );
					endOfActionsFunc( dataPass, "Failed" );
				}
			});
		}
	};


	// ------------------------------------
	
	// me.clickActionPerform 
	me.actionPerform = function( actionDef, blockDivTag, formDivSecTag, btnTag, dataPass, blockPassingData, afterActionFunc )
	{
		// TODO: all the blockDivTag related should be done by 'block' class method
		try
		{
			var blockId = blockDivTag.attr("blockId");

			var clickActionJson = FormUtil.getObjFromDefinition( actionDef, ConfigManager.getConfigJson().definitionActions );

			// ACTIVITY ADDING
			var activityJson = ActivityUtil.addAsActivity( 'action', clickActionJson, actionDef );
			
			if ( clickActionJson )
			{
				if ( clickActionJson.actionType === "evaluation" )
				{
					//console.customLog( blockPassingData.displayData );
					blockPassingData.displayData = me.actionEvaluateExpression( blockPassingData.displayData, clickActionJson );
					//console.customLog( blockPassingData.displayData );
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "clearOtherBlocks" )
				{
					var currBlockId = blockDivTag.attr( 'blockId' );
	
					me.btnTargetParentTag.find( 'div.block' ).not( '[blockId="' + currBlockId + '"]' ).remove();
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "closeBlock" )
				{
					if( clickActionJson.closeLevel !== undefined )
					{
						// Probably not used...
						var closeLevel = Util.getNum( clickActionJson.closeLevel );
	
						var divBlockTotal = me.btnTargetParentTag.find( 'div.block:visible' ).length;
	
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
						me.btnTargetParentTag.find("[blockid='" + clickActionJson.blockId + "']" ).remove();
					}
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "hideBlock" )
				{
					//blockDivTag.hide();
					me.blockObj.hideBlock();
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "openBlock" )
				{
					var blockJson = FormUtil.getObjFromDefinition( clickActionJson.blockId, ConfigManager.getConfigJson().definitionBlocks );

					if ( blockJson )
					{
						// 'blockPassingData' exists is called from 'processWSResult' actions
						if ( blockPassingData === undefined ) blockPassingData = {}; // passing data to block
						blockPassingData.showCase = clickActionJson.showCase;
						blockPassingData.hideCase = clickActionJson.hideCase;

						// IF THE CURRENT BLOCK TYPE IS MAIN TAB, (and tab button is executing this)
						// set the target div tag as tab content rather than block parent tag..
						//var targetDivTag = ( me.blockObj.blockType === 'mainTab' ) ? '': me.blockObj.parentTag;

						// REMOVED: me.blockObj.hideBlock(); { 'notClear': true }  <--- ??
						var newBlockObj = new Block( me.cwsRenderObj, blockJson, clickActionJson.blockId, me.btnTargetParentTag, blockPassingData, undefined, clickActionJson );
						newBlockObj.render();
					}
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "openArea" )
				{				
					if ( clickActionJson.areaId )
					{
						// If 'back button' is visible (which could a layer over existing), click it to close that.
						// For being able to see..
						var backBtnTags = $( '.btnBack:visible' );
						if ( backBtnTags.length > 0 ) backBtnTags.first().click();
						
						//if ( clickActionJson.areaId == 'list_c-on' ) console.customLog( 'x' );
						me.cwsRenderObj.renderArea( clickActionJson.areaId );
					}
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "filledData" )
				{
					var dataFromDivTag = me.btnTargetParentTag.find("[blockid='" + clickActionJson.fromBlockId + "']" );
					var dataToDivTag = me.btnTargetParentTag.find("[blockid='" + clickActionJson.toBlockId + "']" );
					var dataItems = clickActionJson.dataItems;
	
					for ( var i = 0; i < dataItems.length; i++ )
					{
						var formCtrlTag = FormUtil.getFormCtrlTag( dataFromDivTag, dataItems[i] );
						var dataValue = FormUtil.getFormCtrlDataValue( formCtrlTag );
						var displayValue = FormUtil.getFormCtrlDisplayValue( formCtrlTag );
						var toCtrlTag = FormUtil.getFormCtrlTag( dataToDivTag, dataItems[i] );

						FormUtil.setFormCtrlDataValue( toCtrlTag, dataValue );
						FormUtil.setFormCtrlDisplayValue( toCtrlTag, displayValue );
					}
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "alertMsg" )
				{
					if ( clickActionJson.messageClass )
					{
						MsgManager.notificationMessage ( clickActionJson.message, clickActionJson.messageClass, undefined, '', 'right', 'top' );
					}
					else
					{
						MsgManager.notificationMessage ( clickActionJson.message, 'notifDark', undefined, '', 'right', 'top' );
					}
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "topNotifyMsg" )
				{
					if ( clickActionJson.messageClass )
					{
						MsgManager.notificationMessage ( TranslationManager.translateText( clickActionJson.message, clickActionJson.term ), clickActionJson.messageClass, undefined, '', 'right', 'top' );
					}
					else
					{
						MsgManager.notificationMessage ( TranslationManager.translateText( clickActionJson.message, clickActionJson.term ), 'notifDark', undefined, '', 'right', 'top' );
					}
					// If term exists, translate it before displaying
					//MsgManager.msgAreaShow( TranslationManager.translateText( clickActionJson.message, clickActionJson.term ) );
	
					afterActionFunc( true );
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
								afterActionFunc( true );
							} );
	
						}
					}
	
					// If statusActions did not get started for some reason, return as this action finished
					if ( !statusActionsCalled && afterActionFunc ) afterActionFunc( true );
				}
				// NO NEED FOR THIS... both 'dhis' & 'mongo' version..
				else if ( clickActionJson.actionType === "WSlocalData" )
				{
					var statusActionsCalled = false;
	
					if ( clickActionJson.localResource )
					{
						var wsExchangeData = FormUtil.wsExchangeDataGet( formDivSecTag, clickActionJson.payloadBody, clickActionJson.localResource );
						var statusActions = clickActionJson.resultCase[ wsExchangeData.resultData.status ];
						var dataPass_Status = {};
	
						statusActionsCalled = true;
	
						// 'wsExchangeData' should have 'resultData' & 'displayData' for form population.
						// 'displayData' is the one that gets used..
						wsExchangeData.displayData = blockPassingData;

						me.handleActionsInSync( blockDivTag, formDivSecTag, btnTag, statusActions, 0, dataPass_Status, wsExchangeData, function( finalPassData ) {
							afterActionFunc( true );
						} );
	
					}
					else
					{
						if ( !statusActionsCalled && afterActionFunc ) afterActionFunc( true ); 
					}
	
					// If statusActions did not get started for some reason, return as this action finished
				}
				else if ( clickActionJson.actionType === "sendToWS" && clickActionJson.redeemListInsert !== "true" )
				{
					// NOTE: Most Case - 'Search'

					var actionUrl = me.getActionUrl_Adjusted( clickActionJson );
					
					var formsJson = ActivityUtil.generateFormsJsonData_ByType( clickActionJson, clickActionJson, formDivSecTag );  

					// Immediate Submit to Webservice case - Normally use for 'search' (non-activityPayload gen cases)
					me.submitToWs( actionUrl, formsJson, clickActionJson, btnTag, dataPass, function( bResult, optionJson ) {

						afterActionFunc( bResult, optionJson );
					} );
				}
				else if ( clickActionJson.actionType === "queueActivity" || ( clickActionJson.actionType === "sendToWS" && clickActionJson.redeemListInsert === "true" ) )
				{
					var actionUrl = me.getActionUrl_Adjusted( clickActionJson );					
					//FormUtil.trackPayload( 'sent', inputsJson, 'received', actionDef );	

					ActivityUtil.handlePayloadPreview( clickActionJson.previewPrompt, formDivSecTag, btnTag, function( passed ) 
					{ 
						//var currBlockId = blockDivTag.attr( 'blockId' );
						if ( passed )
						{
							// Generete payload - by template or other structure/format from 'forms'
							var formsJsonActivityPayload = ActivityUtil.generateFormsJson_ActivityPayloadData( clickActionJson, formDivSecTag );

							var editModeActivityId = ActivityDataManager.getEditModeActivityId( blockId );

							var dupVoucherActivityPass = me.checkDuplicate_VoucherTransActivity( formsJsonActivityPayload, editModeActivityId );
							
							if ( dupVoucherActivityPass )
							{
								// Put the composed activity json in list and have 'sync' submit.
								ActivityDataManager.createNewPayloadActivity( actionUrl, blockId, formsJsonActivityPayload, clickActionJson, blockPassingData, function( activityJson )
								{
									dataPass.prevWsReplyData = { 'resultData': { 'status': 'queued ' + ConnManagerNew.statusInfo.appMode.toLowerCase() } };
			
									if ( editModeActivityId ) MsgManager.msgAreaShow( 'Edit activity done.', '', MsgManager.CLNAME_PersistSwitch );

									afterActionFunc( true );
								} );									
							}
							else
							{
								MsgManager.msgAreaShow( 'Same voucherCode operation already exists.', 'ERROR' );
								// MsgManager.msgAreaShow( 'Same type of voucher activity already exists.', 'ERROR' );
								afterActionFunc( false, { 'type': 'dupVoucherAction', 'msg': 'Duplicate voucher action detected' } );								
							}	
						}
						else
						{
							//me.clearBtn_ClickedMark( btnTag );

							console.customLog( "queueActivity -  me.clearBtn_ClickedMark( btnTag ) " );
							afterActionFunc( false, { 'type': 'previewBtn', 'msg': 'preview cancelled' } );
							// throw 'canceled on preview';
						}
					});								
				}
			}
		}
		catch ( errMsg )
		{
			afterActionFunc( false, { 'type': 'actionException', 'msg': errMsg } );
		}
	};


	// ----------------------------------------------
	// ---- Duplicate Voucher Check -----

	// However, if same activityId, it is on edit mode, thus, ignore it..
	me.checkDuplicate_VoucherTransActivity = function( formsJsonActivityPayload, editModeActivityId )
	{
		var dupVoucherActivityPass = true;

		try
		{
			var activityJson = formsJsonActivityPayload.payload.captureValues;
			var formTransList = ActivityDataManager.getTransByTypes( activityJson, [ 'v_iss', 'v_rdx', 'v_exp' ] );

			for ( var i = 0; i < formTransList.length; i++ )
			{
				var formTrans = formTransList[ i ];

				if ( formTrans.clientDetails )
				{
					var voucherCode = formTrans.clientDetails.voucherCode;
					var matchActivities = ActivityDataManager.getActivitiesByVoucherCode( voucherCode, formTrans.type ); //, true );

					if ( matchActivities.length > 0 ) 
					{
						if ( editModeActivityId && matchActivities.length === 1 && matchActivities[0].id === editModeActivityId )
						{
							// If the only one match activity is editMode activity, disregard this.
						} 
						else 
						{				
							dupVoucherActivityPass = false;
							break;	
						}						
					}
				}
			}
		}
		catch( errMsg )
		{
			console.customLog( "ERROR in action.checkDuplicate_VoucherTransActivity, errMsg: " + errMsg );
		}	

		return dupVoucherActivityPass;
	};



	// ----------------------------------------------

	me.getActionUrl_Adjusted = function( actionDefJson )
	{
		return ( actionDefJson.dws && actionDefJson.dws.url ) ? actionDefJson.dws.url : actionDefJson.url;
	};


	me.submitToWs = function( actionUrl, formsJson, actionDefJson, btnTag, dataPass, returnFunc )
	{
		// NOTE: USED FOR IMMEDIATE SEND TO WS (Ex. Search by voucher/phone/detail case..)

		if ( actionUrl )
		{					
			// Loading Tag part..
			var loadingTag = FormUtil.generateLoadingTag( btnTag );

			WsCallManager.wsActionCall( actionUrl, formsJson, loadingTag, function( success, redeemReturnJson ) {

				if ( !redeemReturnJson ) redeemReturnJson = {};

				FormUtil.trackPayload( 'received', redeemReturnJson, undefined, actionDefJson );

				var bResult = true;
				var moreInfoJson;

				if (success && ( redeemReturnJson.status === "success" || redeemReturnJson.status === "pass" ) )
				{
					// Change voucherCodes ==> voucherCode string list..  (should also include the status? --> I think so..)
					// Should have more complicated voucher search..
					// Should be only done for voucher search.. by Provider...
					if ( actionDefJson.searchType === 'voucherSearch' ) me.handleMultipleVouchersSplit(redeemReturnJson, formsJson );
					
					console.log( 'submitToWs' );
					console.log(redeemReturnJson);

					dataPass.prevWsReplyData = redeemReturnJson;
				}
				else
				{
					var errMsg = (redeemReturnJson.report && redeemReturnJson.report.msg) ? ' - ' + redeemReturnJson.report.msg : '';				
					var errMsgFull = 'Request Call Failed' + errMsg;
					// MISSING TRANSLATION
					MsgManager.msgAreaShow(errMsgFull, 'ERROR' );
					// Should we stop at here?  Or continue with subActions?

					bResult = false; // "actionFailed";
					moreInfoJson = { 'type': 'requestFailed', 'msg': errMsgFull };
				}


				if (returnFunc) returnFunc( bResult, moreInfoJson );
			});
		}
		else
		{
			MsgManager.notificationMessage ( 'Failed - No ActionUrl Provided.', 'notifDark', undefined, '', 'right', 'top' );
			// Do not need to returnFunc?  --> 	 if ( afterActionFunc ) afterActionFunc( resultStr );

			throw 'url info missing on actionDef - during submitToWs';
			//if ( afterActionFunc ) afterActionFunc( false, { 'type': '', 'msg': '' } );
		}		
	};

	
    me.actionEvaluateExpression = function( jsonList, actionExpObj )
    {
		// METHOD evaluates a multidimensional array (double set of for loops) because data returned from serch results
		//   is structured like this: records[  [ 1 ], [ 2 ], [ 3 ] ], where records [ 1, 2, 3 ] each contain an array of fields 

		//var INFOmethod = actionExpObj.expressionNew || actionExpObj.expression.indexOf( 'INFO.' ) >= 0; /* old method does inline value replacement */

		if ( actionExpObj.expressionNew ) me.runNewEvaluateExpression( actionExpObj, jsonList );
		else
		{

			//  1 check passes fieldList test ( fieldComparison.containsExpectedFields )
			//  2.1 Y > run value replacement + eval
			//  2.2 N > run defaultValue 

			var myCondTest = actionExpObj.expression;
			var expectedFieldList = me.getUniqueFieldListFromEvaluateExpression( myCondTest );

			for( var i = 0; i < jsonList.length; i++ )
			{
				var fieldComparison = me.compareExpressionFieldList_withDataFieldList( expectedFieldList, jsonList[ i ] );

				if ( fieldComparison.containsExpectedFields )
				{
					var expString = myCondTest;
					var myCondTest = expString.replace( new RegExp( '[$${]', 'g'), "" ).replace( new RegExp( '}', 'g'), "" );

					for( var p = 0; p < jsonList[ i ].length; p++ )
					{
						var regFind = new RegExp(jsonList[ i ][ p ].id, 'g');
						myCondTest = myCondTest.replace(  regFind, jsonList[ i ][ p ].value );
					}

					var result =  Util.evalTryCatch( myCondTest );

					if ( result === undefined && actionExpObj.defaultValue !== undefined )
					{
						result =  Util.evalTryCatch( actionExpObj.defaultValue );
					}

				}
				else
				{
					// assess whether to run a 'defaultValue' evaluation ...
					result =  Util.evalTryCatch( actionExpObj.defaultValue );
				}

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


	me.runNewEvaluateExpression = function( actionExpObj, jsonList )
	{
		//var myCondTest = actionExpObj.expressionNew || actionExpObj.expression;
		var INFO = InfoDataManager.getINFO();

		// jsonList holds list of (search) result json that mostly represent client + voucher tei attributes & others.
		jsonList.forEach( resultJson => 
		{
			try
			{
				INFO.searchResults = {};

				// Convert { 'id': '', 'value': '' } format to ==> { id: value }
				resultJson.forEach( attrJson => {
					INFO.searchResults[ attrJson.id ] = attrJson.value;
				});
	
				// Main Eval method.
				var result =  Util.evalTryCatch( actionExpObj.expressionNew, INFO, 'Action.runNewEvaluationExpression' );
	
				if ( result === undefined )
				{
					result = ( actionExpObj.defaultValue ) ? actionExpObj.defaultValue : '';
				}
				
				resultJson.push ( { "displayName": actionExpObj.attribute.displayName, "id": actionExpObj.attribute.id, "value": result } );	
			}
			catch( errMsg )
			{
				console.customLog( 'ERROR in Action.runNewEvaluateExpression, errMsg: ' + errMsg );
			}
		});
	};


	me.getUniqueFieldListFromEvaluateExpression = function( actionExpObj )
	{
		var arrExprList = actionExpObj.split( '$${' );
		var ret = [];

		for( var i = 1; i < arrExprList.length; i++ )
		{
			var arrField = arrExprList[ i ].split( '}' );
			if ( ! ret.includes( arrField[ 0 ] ) ) ret.push( arrField[ 0 ] );
		}

		return ret;
	};

	me.compareExpressionFieldList_withDataFieldList = function( exprFieldsArray, recordArray )
	{
		var resultJson = { 'found': [], 'missing': [], 'containsExpectedFields': true };

		for( var i = 0; i < exprFieldsArray.length; i++ )
		{
			for( var r = 0; r < recordArray.length; r++ )
			{
				// load 'expected' array if not already containing field
				if ( exprFieldsArray.includes( recordArray[ r ].id ) && ! resultJson.found.includes( recordArray[ r ].id ) ) 
				{
					resultJson.found.push( recordArray[ r ].id );
				}
			}
		}

		for( var i = 0; i < exprFieldsArray.length; i++ )
		{
			if ( ! resultJson.found.includes( exprFieldsArray[ i ] ) )
			{
				resultJson.missing.push( exprFieldsArray[ i ] );
			}
		}

		resultJson.containsExpectedFields = ( resultJson.missing.length === 0 );

		return resultJson;
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
	
	me.handleSequenceIncrCommits = function( formDivSecTag, jData )
	{
		// var jData = JSON.parse( unescape( formDivSecTag.attr( 'data-fields') ) );
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
							console.customLog( ' ~ no Lower/Upper case defined: ' + ta[ i ].id );
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
	};


	// -------------------------------------------------------

	me.handleMultipleVouchersSplit = function( responseJson, formsJson )
	{
		try
		{
			if ( responseJson && responseJson.displayData ) 
			{
				var newList = [];

				var resultList = responseJson.displayData;

				resultList.forEach(clientAttr => 
				{
					var bDataSplited = false;

					if (formsJson.voucherCode) clientAttr.push({ 'id': 'voucherCode', 'value': formsJson.voucherCode });
					else if (formsJson.searchFields && formsJson.searchFields.voucherCode) 
					{
						// If the search is by voucherCode, simply add 'voucherCode' data in search result..
						//searchFields: { voucherCode: "987654321" }
						clientAttr.push({ 'id': 'voucherCode', 'value': formsJson.searchFields.voucherCode });
					}										
					else
					{
						var voucherCodes = Util.getFromList(clientAttr, 'voucherCodes', 'id');

						if (voucherCodes && Util.isTypeArray(voucherCodes.value)) {
							if (voucherCodes.value.length === 0) { }
							else if (voucherCodes.value.length === 1) {
								clientAttr.push({ 'id': 'voucherCode', 'value': voucherCodes.value[0] });
							}
							else if (voucherCodes.value.length > 1) {
								bDataSplited = true;

								var voucherCodeList = Util.cloneJson(voucherCodes.value);

								voucherCodeList.forEach(voucherCodeStr => {

									var clientAttrTemp = Util.cloneJson(clientAttr);

									clientAttrTemp.push({ 'id': 'voucherCode', 'value': voucherCodeStr });

									newList.push(clientAttrTemp);
								});
							}
						}
					}

					if (!bDataSplited) newList.push( clientAttr );
				});

				responseJson.displayData = newList;
			}
		}
		catch ( errMsg )
		{
			console.customLog( 'ERROR in action.handleMultipleVouchersSplit, errMsg: ' + errMsg );
		}
	};



					// TODO: We could handle this by

					// If the search fields has 'voucherCode' --> searchFields: {voucherCode: "987654321"}
					// No need to take care of it. <-- we only accept single client result.  No need to look at voucherCode(s) array to confirm the voucherCode.

					// However, if other searches (by phone, by detail), we need to split the search result by voucherCode list. (if more than one)
					// <-- only happens on Provider?

					// redeemReturnJson = me.handleMultipleVouchersSplit(redeemReturnJson );

					// More DETAIL:
					// "displayData": [ [], [] ] // could have multiple clients as result of search.

					//'oneClient':
/*[ {"id": "firstName", "value": "Fernando"},
	{"id": "lastName", "value": "Gomez"},
	{"id": "clientId", "value": "5ff8c70619130f4150809267"},
	{"id": "phoneNumber", "value": "+50379904490"},
	{"id": "service", "value": "PIL"},
	{"id": "program", "value": "FPL"},
	{"id": "countryType", "value": "LA"},
	{"id": "age", "value": "24"},
	{"id": "users", "value": ["LA_TEST_IPC"]},
	{"id": "voucherCodes", "value": ["12123232", "987654321"]},
	{"id": "clientId", "value": "5ff8c70619130f4150809267"}
]
*/
					// per client, check if there is multiple voucherCode(s).  If so, split them


					// In Backend Dhis version 'displayData', we return everything (including 'voucherCode') as a string..
/*[ {"id": "firstName", "value": "Fernando"},
	{"id": "lastName", "value": "Gomez"},
	{"id": "clientId", "value": "5ff8c70619130f4150809267"},
	{"id": "phoneNumber", "value": "+50379904490"},
	{"id": "service", "value": "PIL"},
	{"id": "program", "value": "FPL"},
	{"id": "countryType", "value": "LA"},
	{"id": "age", "value": "24"},
	{"id": "users", "value": ["LA_TEST_IPC"]},
	{"id": "voucherCode", "value": "12123232"},
	{"id": "clientId", "value": "5ff8c70619130f4150809267"}
],
[ {"id": "firstName", "value": "Fernando"},
	{"id": "lastName", "value": "Gomez"},
	{"id": "clientId", "value": "5ff8c70619130f4150809267"},
	{"id": "phoneNumber", "value": "+50379904490"},
	{"id": "service", "value": "PIL"},
	{"id": "program", "value": "FPL"},
	{"id": "countryType", "value": "LA"},
	{"id": "age", "value": "24"},
	{"id": "users", "value": ["LA_TEST_IPC"]},
	{"id": "voucherCode", "value": "987654321" },
	{"id": "clientId", "value": "5ff8c70619130f4150809267"}
]
*/



}