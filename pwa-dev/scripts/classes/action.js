// -------------------------------------------
// -- Action Class/Methods
function Action( cwsRenderObj, blockObj )
{
    var me = this;

    me.cwsRenderObj = cwsRenderObj;
	me.blockObj = blockObj;
	me.emptyJQueryTag = $( '.emptyJQueryElement' );
	//me.blockParentAreaTag;  // button rendering div's parent tag..  <-- if tab button, target is tab content

	me.className_btnClickInProcess = 'btnClickInProcess';

	// -----------------------------
	// ---- Methods ----------------
	
	me.initialize = function() { }

	// ------------------------------------
	// NOTE: Passed Param Info:
	//		0. btnTag - The button tag that 
	//		1. blockDivTag - The block tag containing the btnTag
	//		2. blockParentAreaTag - The tab or contianer block containing the block. - used to clear all the blocks, etc..
	//		3. formDivSecTag - used to get input tags values when generating payload data.

	// Same level as 'render' in other type of class
	me.handleClickActions = function( btnTag, btnOnClickActions, blockParentAreaTag, blockDivTag, formDivSecTag, blockPassingData )
	{
		// if ( formDivSecTag.attr( 'data-fields') != undefined )
		if ( me.blockObj.blockFormObj && me.blockObj.blockFormObj.formJsonArr )
		{
			me.handleSequenceIncrCommits( formDivSecTag, me.blockObj.blockFormObj.formJsonArr );
		}

		var dataPass = {};

		if ( !me.btnClickedAlready( btnTag ) )
		{
			me.btnClickMarked( btnTag );

			var loadingTag = FormUtil.generateLoadingTag( btnTag );

			me.handleActionsInSync( blockDivTag, blockParentAreaTag, formDivSecTag, btnTag, btnOnClickActions, 0, dataPass, blockPassingData, function( finalPassData, resultStr ) 
			{
				me.clearBtn_ClickedMark( btnTag );
				WsCallManager.loadingTagClear( loadingTag );
			} );	
		}
		else
		{
			MsgManager.msgAreaShow( 'Btn already clicked/in process', 'ERROR' );			
		}
	};


	me.handleClickActionsAlt = function( btnOnClickActions, blockDivTag, blockParentAreaTag, callBack )
	{
		var dataPass = {};

		me.handleActionsInSync( blockDivTag, blockParentAreaTag, undefined, undefined, btnOnClickActions, 0, dataPass, undefined, function( finalPassData, resultStr ) 
		{
			if ( callBack ) callBack( resultStr );  /// Success  /  Failed
		});	
	};


	me.handleItemClickActions = function( btnTag, btnOnClickActions, itemIdx, blockDivTag, itemBlockTag, blockPassingData )
	{		
		var blockParentAreaTag = me.blockObj.parentTag; 

		var dataPass = {};

		if ( !me.btnClickedAlready( btnTag ) )
		{
			me.btnClickMarked( btnTag );

			me.handleActionsInSync( blockDivTag, blockParentAreaTag, itemBlockTag, btnTag, btnOnClickActions, 0, dataPass, blockPassingData, function( finalPassData, resultStr ) {
				me.clearBtn_ClickedMark( btnTag );					
			} );
		}
		else
		{
			MsgManager.msgAreaShow( 'Btn already clicked/in process', 'ERROR' );			
		}
	}

	// ------------------------------------

	// Create a process to call actions one by one with waiting for each one to finish and proceed to next one
	// me.recurrsiveActions
	me.handleActionsInSync = function( blockDivTag, blockParentAreaTag, formDivSecTag, btnTag, actions, actionIndex, dataPass, blockPassingData, endOfActionsFunc )
	{
		if ( actionIndex >= actions.length ) endOfActionsFunc( dataPass, "Success" );
		else
		{
			// me.clickActionPerform
			me.actionPerform( actions[actionIndex], blockDivTag, blockParentAreaTag, formDivSecTag, btnTag, dataPass, blockPassingData, function( bResult, moreInfoJson )
			{			
				if ( bResult )
				{
					if ( dataPass.nextActions ) 
					{
						actions = Util.cloneJson( dataPass.nextActions ); // It is OK to replace original 'actions' array?
						actionIndex = 0;
						dataPass.nextActions = undefined;
					}
					else { actionIndex++; }

					me.handleActionsInSync( blockDivTag, blockParentAreaTag, formDivSecTag, btnTag, actions, actionIndex, dataPass, blockPassingData, endOfActionsFunc );				
				}
				else
				{
					console.customLog( 'Action Failed.  Actions processing stopped at Index ' + actionIndex );					
					
					if ( moreInfoJson ) 
					{
						console.customLog( moreInfoJson );
						if ( moreInfoJson.errMsg ) MsgManager.msgAreaShow( moreInfoJson.errMsg, 'ERROR' );
					} 
					
					endOfActionsFunc( dataPass, "Failed" );
				}
			});
		}
	};


	// ------------------------------------
	
	// me.clickActionPerform 
	me.actionPerform = function( actionDef, blockDivTag, blockParentAreaTag, formDivSecTag, btnTag, dataPass, blockPassingData, afterActionFunc )
	{
		try
		{
			// For undefined tags, create an empty jquery selection for escaping error
			if ( !blockDivTag ) blockDivTag = me.emptyJQueryTag;
			if ( !blockParentAreaTag ) blockParentAreaTag = me.emptyJQueryTag;
			if ( !formDivSecTag ) formDivSecTag = me.emptyJQueryTag;
			if ( !btnTag ) btnTag = me.emptyJQueryTag;


			var blockId = ( blockDivTag ) ? blockDivTag.attr( "blockId" ) : undefined;

			var clickActionJson = FormUtil.getObjFromDefinition( actionDef, ConfigManager.getConfigJson().definitionActions );

			if ( !clickActionJson ) afterActionFunc( false, { 'errMsg': 'Action definition undefined' } );				
			else if ( Util.isTypeString( clickActionJson ) ) afterActionFunc( false, { 'errMsg': 'Bad action definition name: ' + actionDef } );
			else 
			{				
				// ACTIVITY ADDING
				var activityJson = ActivityUtil.addAsActivity( 'action', clickActionJson, actionDef );				

				if ( clickActionJson.actionType === "evaluation" ) // Custom Expression Eval
				{
					blockPassingData.displayData = me.actionEvaluateExpression( blockPassingData.displayData, clickActionJson );
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "evalAction" ) // New Eval - Javascript plain Eval
				{
					if ( clickActionJson.eval )
					{
						try { eval( Util.getEvalStr( clickActionJson.eval ) ); }	// We can even modify 'passData' by this..  or do timeout..
						catch( errMsg ) { console.log( 'Action.evalAction ERROR, ' + errMsg ); }
						
						// If the eval has 'afterActionFunc', let it control the call.						
						if ( clickActionJson.eval.indexOf( 'afterActionFunc' ) === -1 ) afterActionFunc( true ); 
					}
					else
					{
						afterActionFunc( true ); 
					}	
					// Examples: - Run block or buttons.. - Also, can use 'dataPass' to exchange data.
				}
				else if ( clickActionJson.actionType === "clearOtherBlocks" )
				{
					var currBlockId = blockDivTag.attr( 'blockId' );
	
					blockParentAreaTag.find( 'div.block' ).not( '[blockId="' + currBlockId + '"]' ).remove();
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "closeBlock" )
				{
					if( clickActionJson.closeLevel !== undefined )
					{
						// Probably not used...
						var closeLevel = Util.getNum( clickActionJson.closeLevel );
	
						var divBlockTotal = blockParentAreaTag.find( 'div.block:visible' ).length;
	
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
						blockParentAreaTag.find("[blockid='" + clickActionJson.blockId + "']" ).remove();
					}
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "hideBlock" )
				{
					//blockDivTag.hide();
					me.blockObj.hideBlock();
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "openSheetFullL2" )
				{		
					var sheetFullL2Tag = $( Templates.sheetFullL2Frame );	
					$( 'body' ).append( sheetFullL2Tag );
					FormUtil.sheetFullSetup_Show( sheetFullL2Tag );

					blockParentAreaTag = sheetFullL2Tag.find( '.contentBody' );
				}
				else if ( clickActionJson.actionType === "closeSheetFullL2" )
				{				
					$( 'div.sheetFullL2Frame' ).find( 'img.btnBack' ).click();
				}
				else if ( clickActionJson.actionType === "openBlock" )
				{
					// if open sheet full (layover) option is selected, open everything in this + backbutton setup..
					if ( clickActionJson.openInSheetFullL2 )
					{
						var sheetFullL2Tag = $( Templates.sheetFullL2Frame );	
						$( 'body' ).append( sheetFullL2Tag );
						FormUtil.sheetFullSetup_Show( sheetFullL2Tag );

						blockParentAreaTag = sheetFullL2Tag.find( '.contentBody' );
					}

					var blockJson = FormUtil.getObjFromDefinition( clickActionJson.blockId, ConfigManager.getConfigJson().definitionBlocks );

					if ( blockJson )
					{
						// 'blockPassingData' exists is called from 'processWSResult' actions
						if ( dataPass.formsJson )
						{
							blockPassingData = {};
							blockPassingData.formsJson = dataPass.formsJson;
						}
						else if ( blockPassingData === undefined ) 
						{
							if ( dataPass.blockPassingData ) blockPassingData = dataPass.blockPassingData;
							else blockPassingData = {}; 
						}
						
						blockPassingData.showCase = clickActionJson.showCase;
						blockPassingData.hideCase = clickActionJson.hideCase;

						// IF THE CURRENT BLOCK TYPE IS MAIN TAB, (and tab button is executing this)
						// set the target div tag as tab content rather than block parent tag..
						//var targetDivTag = ( me.blockObj.blockType === 'mainTab' ) ? '': me.blockObj.parentTag;

						// // REMOVED: me.blockObj.hideBlock(); { 'notClear': true }  <--- ??
						// var newBlockObj = new Block( me.cwsRenderObj, blockJson, clickActionJson.blockId, me.blockParentAreaTag, blockPassingData, undefined, clickActionJson );
						// newBlockObj.render();

						FormUtil.renderBlockByBlockId( clickActionJson.blockId, me.cwsRenderObj, blockParentAreaTag, blockPassingData, undefined, clickActionJson );
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
					var dataFromDivTag = blockParentAreaTag.find("[blockid='" + clickActionJson.fromBlockId + "']" );
					var dataToDivTag = blockParentAreaTag.find("[blockid='" + clickActionJson.toBlockId + "']" );
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
				else if ( clickActionJson.actionType === "alertMsg" || clickActionJson.actionType === "topNotifyMsg" )
				{
					var msgTransl = TranslationManager.translateText( clickActionJson.message, clickActionJson.term );
					var clsName = ( clickActionJson.messageClass ) ? clickActionJson.messageClass: 'notifDark';

					MsgManager.notificationMessage ( msgTransl, clsName, undefined, '', 'right', 'top' );
	
					afterActionFunc( true );
				}			
				else if ( clickActionJson.actionType === "reloadClientTag" )
				{
					var clientCardTag = blockDivTag.closest( '.client[itemid]' );

					if ( clientCardTag.length > 0 ) 
					{
						console.log( 'Rerender tried' );
						clientCardTag.find( 'div.clientRerender' ).click();
					}
	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "reloadActivityTag" )
				{
					var activityCardTag = blockDivTag.closest( '.activity[itemid]' );

					if ( activityCardTag.length > 0 ) activityCardTag.find( 'div.activityRerender' ).click();	
					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "activitySyncBtnClick" )
				{
					var clientCardTag = blockDivTag.closest( 'div.card[itemid]' );

					if ( clientCardTag.length > 0 ) clientCardTag.find( 'div.activitySyncRun' ).click();

					afterActionFunc( true );
				}
				else if ( clickActionJson.actionType === "syncActivityById" )
				{
					if ( dataPass.activityJson )
					{						
						ActivitySyncUtil.syncUpActivity_IfOnline( dataPass.activityJson.id, function( syncReadyJson, success ) 
						{
							console.log( 'queuedActivitySync' );
							console.log( syncReadyJson );
							console.log( success );
							afterActionFunc( true );

							// alert case?
						});
					}

					// NOTE: TODO: HOW TO make a call back always?
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
					dataPass.prevWsReplyData = undefined;  // CLEAR RELATED DATA
					dataPass.activityJson = undefined;

					var actionUrl = me.getActionUrl_Adjusted( clickActionJson );
					
					var payloadJson = ActivityUtil.generateFormsJsonData_ByType( clickActionJson, clickActionJson, formDivSecTag );  

					// TODO: Simply save blockId, payloadJson..
					SessionManager.saveWSBlockFormsJson( blockId, ActivityUtil.generateFormsJson( formDivSecTag ) );


					// Immediate Submit to Webservice case - Normally use for 'search' (non-activityPayload gen cases)
					me.submitToWs( actionUrl, payloadJson, clickActionJson, btnTag, dataPass, function( bResult, optionJson ) {

						afterActionFunc( bResult, optionJson );
					} );
				}
				else if ( clickActionJson.actionType === "queueActivity" || ( clickActionJson.actionType === "sendToWS" && clickActionJson.redeemListInsert === "true" ) )
				{
					dataPass.prevWsReplyData = undefined;  // CLEAR RELATED DATA
					dataPass.activityJson = undefined;

					var actionUrl = me.getActionUrl_Adjusted( clickActionJson );					
					//FormUtil.trackPayload( 'sent', inputsJson, 'received', actionDef );	

					ActivityUtil.handlePayloadPreview( clickActionJson.previewPrompt, formDivSecTag, btnTag, function( passed ) 
					{ 
						//var currBlockId = blockDivTag.attr( 'blockId' );
						if ( passed )
						{
							// NEW - Create Activity under existing Client json rather than new client.
							if ( ( clickActionJson.underClient || clickActionJson.useCurrentClientId ) && blockDivTag )
							{
								var clientCardTag = blockDivTag.closest( '.client[itemid]' );
								if ( clientCardTag.length > 0 ) clickActionJson.clientId = clientCardTag.attr( 'itemid' );	
							}

							// #1. Generete payload with 'capture/search' structure - by Template & form fields values.
							var formsJsonActivityPayload = ActivityUtil.generateFormsJson_ActivityPayloadData( clickActionJson, formDivSecTag );

							// TODO: Simply save blockId, payloadJson..
							SessionManager.saveWSBlockFormsJson( blockId, ActivityUtil.generateFormsJson( formDivSecTag ) );


							var editModeActivityId = ActivityDataManager.getEditModeActivityId( blockId );

              				// NOTE: If 'voucherCodeReuse' is true (allowed - TZ case), do not need to check for duplicate voucher activity type.
							var dupVoucherActivityPass = ( ConfigManager.getVoucherCodeReuse() || me.checkDuplicate_VoucherTransActivity( formsJsonActivityPayload, editModeActivityId ) );
							
							if ( dupVoucherActivityPass )
							{
								// #2. Use generated 'capture/search' json & place in final activity structure (id, transaction, processing (serachVal under processing) )
								ActivityDataManager.createNewPayloadActivity( actionUrl, blockId, formsJsonActivityPayload, clickActionJson, blockPassingData, function( activityJson )
								{									
									AppInfoManager.addToActivityHistory( activityJson );

									dataPass.prevWsReplyData = { 'resultData': { 'status': 'queued ' + ConnManagerNew.statusInfo.appMode.toLowerCase() } };
									dataPass.activityJson = activityJson;
			
									if ( editModeActivityId ) MsgManager.msgAreaShow( 'Edit activity done.', '', MsgManager.CLNAME_PersistSwitch );

									afterActionFunc( true );
								} );									
							}
							else
							{
								//MsgManager.msgAreaShow( 'ERROR: Existing Activity with same voucherCode & transType exists!', 'ERROR' );
								// MsgManager.msgAreaShow( 'Same type of voucher activity already exists.', 'ERROR' );
								afterActionFunc( false, { 'errMsg': 'ERROR: Existing Activity with same voucherCode & transType exists!' } );
							}	
						}
						else
						{
							//me.clearBtn_ClickedMark( btnTag );
							afterActionFunc( false, { 'type': 'previewBtn', 'msg': 'preview cancelled' } );
							// throw 'canceled on preview';
						}
					});								
				}
				else
				{
					console.log( clickActionJson );
					afterActionFunc( false, { 'errMsg': 'Unhandled action, actionType: ' + clickActionJson.actionType } );
				}
			}
		}
		catch ( errMsg )
		{
			console.log( clickActionJson );
			afterActionFunc( false, { 'errMsg': 'Action Error: ' + errMsg } );
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


	me.submitToWs = function( actionUrl, payloadJson, actionDefJson, btnTag, dataPass, returnFunc )
	{
		// NOTE: USED FOR IMMEDIATE SEND TO WS (Ex. Search by voucher/phone/detail case..)

		if ( actionUrl )
		{					
			// Loading Tag part..
			// var loadingTag = FormUtil.generateLoadingTag( btnTag );

			WsCallManager.wsActionCall( actionUrl, payloadJson, undefined, function( success, redeemReturnJson ) {

				if ( !redeemReturnJson ) redeemReturnJson = {};

				FormUtil.trackPayload( 'received', redeemReturnJson, undefined, actionDefJson );

				var bResult = true;
				var moreInfoJson;

				if (success && ( redeemReturnJson.status === "success" || redeemReturnJson.status === "pass" ) )
				{
					// Change voucherCodes ==> voucherCode string list..  (should also include the status? --> I think so..)
					// Should have more complicated voucher search..
					// Should be only done for voucher search.. by Provider...
					if ( actionDefJson.searchType === 'voucherSearch' ) me.handleMultipleVouchersSplit(redeemReturnJson, payloadJson );
					
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

		// 'expressionNew' is used in 'test' 'dc_pwa@CI@vT.json' & 'ZW2'
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
				// temp disabled compareExpressionFieldList_withDataFieldList() { 'containsExpectedFields': true }; //
				var fieldComparison = { 'containsExpectedFields': true }; //me.compareExpressionFieldList_withDataFieldList( expectedFieldList, jsonList[ i ] );

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
		INFO.searchResultsList = [];

		// jsonList holds list of (search) result json that mostly represent client + voucher tei attributes & others.
		jsonList.forEach( resultJson => 
		{
			try
			{
				INFO.searchResults = {};
				INFO.searchResultsList.push( INFO.searchResults );

				// Convert { 'id': '', 'value': '' } format to ==> { id: value }
				resultJson.forEach( attrJson => {
					INFO.searchResults[ attrJson.id ] = attrJson.value;
				});
	
				// Main Eval method.
				var result =  Util.evalTryCatch( actionExpObj.expressionNew, INFO, 'Action.runNewEvaluationExpression' );
	
				if ( result === undefined )
				{
					if ( actionExpObj.defaultValue !== undefined ) 
					{
						result = Util.evalTryCatch( actionExpObj.defaultValue )
					}
					else
					{
						result = '';
					}
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
		return ( btnTag && btnTag.hasClass( me.className_btnClickInProcess ) );
	};

	me.btnClickMarked = function( btnTag )
	{
		if ( btnTag ) btnTag.addClass( me.className_btnClickInProcess );
	};

	me.clearBtn_ClickedMark = function( btnTag )
	{
		if ( btnTag ) btnTag.removeClass( me.className_btnClickInProcess );
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
	};


	// -------------------------------------------------------

	me.handleMultipleVouchersSplit = function( responseJson, payloadJson )
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

					if (payloadJson.voucherCode) clientAttr.push({ 'id': 'voucherCode', 'value': payloadJson.voucherCode });
					else if (payloadJson.searchFields && payloadJson.searchFields.voucherCode) 
					{
						// If the search is by voucherCode, simply add 'voucherCode' data in search result..
						//searchFields: { voucherCode: "987654321" }
						clientAttr.push({ 'id': 'voucherCode', 'value': payloadJson.searchFields.voucherCode });
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

}

