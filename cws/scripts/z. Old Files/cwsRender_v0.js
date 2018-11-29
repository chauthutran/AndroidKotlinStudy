// -------------------------------------------
// -- CwS Render Class/Methods
function cwsRender()
{
	var me = this;

	// Fixed variables
	me.dsConfigLoc = 'data/dsConfig2.json';

	// Tags
	me.renderBlockTag = $( '.renderBlock' );

	// global variables
	me.configJson;
	me.blocksProps = {};

	me.storageName_Queue = "queueList";
	me._globalMsg = "";
	me._globalJsonData = undefined;

	// =============================================
	// ---- perform Run --------------
	me.performRun = function()
	{
		me.getDsConfigJson( function( configJson ) {
			me.configJson = configJson;
			me.blocksProps = me.getBlocks( configJson );
			var firstBlock = me.getFirstBlock( me.blocksProps );

			me.renderBlock( firstBlock, me.renderBlockTag );
		});
	}

	// ---------------------------

	me.getDsConfigJson = function( returnFunc )
	{
		console.log( 'going for data...' );

		// 1. fetch config json
		fetch( me.dsConfigLoc )
		.then( response => response.json() )
		.then( configJson => {
			// 2. 
			console.log( configJson );

			returnFunc( configJson );
		});
	}

	me.getBlocks = function( configJson )
	{		
		return configJson.redeem_capture.blocks;
	}

	me.getFirstBlock = function( blocksProps )
	{
		var firstBlock;

		if ( blocksProps !== undefined )
		{
			var blocksArr = Util.convertPropListToArray( blocksProps );

			if ( blocksArr.length > 0 ) firstBlock = blocksArr[0];
		}

		return firstBlock;
	}
	
	me.renderBlock = function( blockJson, renderBlockMainTag )
	{
		if ( blockJson !== undefined )
		{			
			var newBlockTag = $( '<div class="block"></div>' );

			//newBlockTag.html( JSON.stringify( blockJson ) );
			me.renderRenderSec( blockJson.section_Render, newBlockTag );

			me.renderBlockTag.append( newBlockTag );
		}			
	}

	me.renderRenderSec = function( jsonData, blockTag )
	{
		if ( jsonData !== undefined )
		{
			console.log( jsonData );
			
			if ( jsonData.renderType === "inputList" )
			{
				console.log( 'rendertype inputList ' + jsonData.renderType );

				me.renderInputList( jsonData.inputs, blockTag );

				me.renderActionsList( jsonData.actions, blockTag );				
			}
			else if ( jsonData.renderType === "iconSelectionList" )
			{
				console.log( 'rendertype iconSelectionList ' + jsonData.renderType );

				me.renderSelectionList( jsonData.selections, blockTag );
			}
			else if ( jsonData.renderType === "queueList" )
			{

				var jsonStorageData = DataManager.getOrCreateData( me.storageName_Queue );

				me.renderQueueList( jsonStorageData.list, blockTag );
				// me.renderQueueList( jsonData.selections, blockTag );

				me.renderActionsList( jsonData.actions, blockTag );					
			}
			else if ( jsonData.renderType === "resultDispaly" )
			{				
				// Result of previous Action..
				// Later, create method for this..
				//if ( jsonData.result !== undefined )
				//{
					
				me.renderResultDisplay( jsonData, blockTag );
				//}
			
				me.renderActionsList( jsonData.actions, blockTag );
			}
		}
	}

	// --------------

	me.renderResultDisplay = function( jsonData, blockTag )
	{
		var divTag = $( '<div class="resultDisplayDiv" style="margin: 7px;"></div>' );

		var spanTitleTag = $( '<span class="titleSpan" style="font-weight: bold;"></span>' );

		if ( me._globalMsg !== undefined ) spanTitleTag.text( me._globalMsg );
		if ( me._globalJsonData !== undefined ) spanTitleTag.append( ' - ' + JSON.stringify( me._globalJsonData ) );

		divTag.append( spanTitleTag );

		blockTag.append( divTag );
	}

	// --------------

	me.renderQueueList = function( queueList, blockTag )
	{
		console.log( queueList );

		if ( queueList !== undefined )
		{
			for( var i = 0; i < queueList.length; i++ )
			{
				me.renderQueueData( queueList[i], blockTag );
			}	
		}
	}

	me.renderQueueData = function( queueData, blockTag )
	{
		var divTag = $( '<div class="queueDiv"></div>' );

		me.setActionTagAttribute( divTag, queueData, 'id' );


		var spanTitleTag = $( '<span class="titleSpan"></span>' );
		spanTitleTag.text( queueData.title );

		divTag.append( spanTitleTag );

		divTag.click( function() {
			me.submitForQueue( queueData, $( this ), blockTag );
		 } );

		blockTag.append( divTag );
	}

	me.submitForQueue = function( queueData, queueTag, blockTag )
	{

		if ( ConnManager.isOffline() )
		{
			queueTag.css( 'background-color', 'orange' );

			setTimeout( function() {
				alert( 'Not Online!!' );

				queueTag.css( 'background-color', '#d6d6e8' );
			}, 200 );
		}
		else
		{
			var url = me.getServerUrl() + "/eRefWSTest/api/submitForQueue";
			
			// TODO: this is part that should be moved to web service..
			queueData.processed = "Processed at " + (new Date() ).toISOString();
			//queueData.id = Util.generateRandomId();
			queueData.status = "processed";					
			var dataId = queueData.id;
			queueTag.css( 'background-color', 'lightGreen' );


			fetch( url, {  
				method: 'POST',  
				//headers: { 'auth': '1234' },  
				body: JSON.stringify( queueData )
			})
			.then( response => response.json() )  
			.then( responseJson => {
	
				console.log( 'Removal Request success: ', responseJson);  

				// This worked..
				DataManager.removeItemFromData( me.storageName_Queue, queueData.id );
							
				// get the tag...
				//var divTag = $( '#' + dataId ); // '<div class="queueDiv"></div>' );
				queueTag.css( 'background-color', 'yellow' ).hide( 500 );

				//me.renderQueueList( responseJson.list, blockTag );

				// Queue refresh, etc..
				alert( 'submitted data: ' + JSON.stringify( queueData ) );

			})  
			.catch(function (error) {  
			console.log('Request failure: ', error);  
			});			
		}	
	}

	// --------------

	// --------------

	me.renderSelectionList = function( selectionList, blockTag )
	{
		console.log( selectionList );

		for( var i = 0; i < selectionList.length; i++ )
		{
			me.renderSelectionData( selectionList[i], blockTag );
		}
	}

	me.renderSelectionData = function( selectionData, blockTag )
	{
		var divTag = $( '<div class="selectionDiv"><img src="' + selectionData.iconSrc + '"></div>' );

		me.setActionTagAttributes( divTag, selectionData );

		divTag.click( me.performBtnClick );

		blockTag.append( divTag );
	}
	// --------------

	me.renderInputList = function( inputList, blockTag )
	{
		for( var i = 0; i < inputList.length; i++ )
		{
			me.renderInputData( inputList[i], blockTag );
		}
	}

	me.renderInputData = function( inputData, blockTag )
	{
		var divInputTag = $( '<div class="inputDiv"></div>' );

		var spanTitleTag = $( '<span class="titleSpan"></span>' );
		spanTitleTag.text( inputData.title );
		var titleDivTag = $( '<div class="titleDiv"></div>' ).append( spanTitleTag );

		divInputTag.append( titleDivTag );

		me.renderDataEntryTag( inputData, divInputTag );

		blockTag.append( divInputTag );
	}

	me.renderDataEntryTag = function( inputData, divInputTag )
	{
		if ( inputData !== undefined )
		{
			var entryTag;

			if ( inputData.type === "textBox" )
			{
				entryTag = $( '<input uid="' + inputData.id + '" />' );
			}
			else if ( inputData.type === "select" )
			{
				entryTag = $( '<select uid="' + inputData.id + '" ></select>' );
				Util.populateSelect( entryTag, inputData.title, inputData.options, "Array" );
			}
			
			var entryDivTag = $( '<div class="entryDiv"></div>' ).append( entryTag );


			divInputTag.append( entryDivTag );
		}
	}

	// ---------------------------

	me.renderActionsList = function( actionList, blockTag )
	{
		if ( actionList !== undefined )
		{
		
			// create one div for actions
			var divActionsTag = $( '<div class="actionsDiv"></div>' );

			for( var i = 0; i < actionList.length; i++ )
			{
				var actionJson = actionList[i];
				if ( actionJson.type === 'button' )
				{
					var btnTag = $( '<button class="actionBtn">' + actionJson.title + '</button>' );
					
					me.setActionTagAttributes( btnTag, actionJson );

					// Perform Btn Click - include action + next block
					btnTag.click( me.performBtnClick );

					divActionsTag.append( btnTag );	
				}
			}

			blockTag.append( divActionsTag );
		}
	}

	me.performBtnClick = function()
	{
		var btnTag = $( this );

		// action
		me.actionPerform( btnTag, function() {

			// render block
			me.redirectBlockRender( btnTag );

		} );
	}

	me.actionPerform = function( btnTag, returnFunc )
	{
		var actionId = btnTag.attr( 'actionId' );

		me._globalMsg = "";
		me._globalJsonData = undefined;

		if ( actionId === 'submitRedeem' )
		{
			// if offline..
			//if ( )
			if ( ConnManager.isOffline() )
			{
				// save to the storage
				console.log( 'offline data asked..' );

				var tempJsonData = {};
				tempJsonData.title = "TestData Queue - " + (new Date() ).toISOString();
				tempJsonData.id = Util.generateRandomId();
				tempJsonData.status = "queued";					

				DataManager.insertData( me.storageName_Queue, tempJsonData );

				returnFunc();
			}
			else
			{
				console.log( 'online submit requested, but not available, yet..' );

				var tempJsonData = {};
				tempJsonData.title = "TestData Submit - " + (new Date() ).toISOString();
				tempJsonData.id = Util.generateRandomId();
				tempJsonData.status = "submitted";	

				me.submitForProcess( tempJsonData, function( returnJson ) {

					console.log( returnJson );

					me._globalMsg = returnJson.msg;
					me._globalJsonData = tempJsonData;
					
					returnFunc();
				} );
			}
		}
		else
		{
			returnFunc();
		}
	}

	me.redirectBlockRender = function( btnTag )
	{
		//var btnTag = $( this );
		var nextBlock = btnTag.attr( 'nextBlock' );
		var nextBlock_Offline = btnTag.attr( 'nextBlock_Offline' );
		var nextBlock_OnOffline = nextBlock;

		// if current status is offline and 'nextBlock_Offline' exists, use that instead of 'nextBlock'
		if ( ConnManager.isOffline() && nextBlock_Offline ) nextBlock_OnOffline = nextBlock_Offline;
		
		if ( nextBlock_OnOffline )
		{
			// Clear the block
			me.renderBlockTag.html( '' );

			console.log( 'nextBlock: ' + nextBlock_OnOffline );
			console.log( me.blocksProps[ nextBlock_OnOffline ] );			

			// Render the redirected Block
			me.renderBlock( me.blocksProps[ nextBlock_OnOffline ], me.renderBlockTag );
		}
	}

	me.setActionTagAttributes = function( actionTag, actionJson )
	{
		// We could set all the attributes, but for now, just below ones.
		me.setActionTagAttribute( actionTag, actionJson, 'actionId' );
		me.setActionTagAttribute( actionTag, actionJson, 'nextBlock' );
		me.setActionTagAttribute( actionTag, actionJson, 'nextBlock_Offline' );
	}

	me.setActionTagAttribute = function( actionTag, actionJson, propName )
	{
		if ( actionJson[ propName ] !== undefined ) actionTag.attr( propName, actionJson[ propName ] );
	}	


	// ---------------------------
	
	me.submitForProcess = function( jsonData, returnFunc ) //, queueTag, blockTag )
	{
		var url = me.getServerUrl() + "/eRefWSTest/api/submitForQueue";

		
		// TODO: this is part that should be moved to web service..
		jsonData.processed = "Processed at " + (new Date() ).toISOString();
		//queueData.id = Util.generateRandomId();
		jsonData.status = "processed";					


		fetch( url, {  
			method: 'POST',  
			//headers: { 'auth': '1234' },  
			body: JSON.stringify( jsonData )
		})
		.then(function (data) {  
			console.log('Request success: ', data);  
			returnFunc( { 'result': 'success', 'msg': 'data processed successfully' } );
		})  
		.catch(function (error) {  
		  console.log('Request failure: ', error);  
		  returnFunc( { 'result': 'fail', 'msg': 'data process failed' } );		
		});				
	}


	// Temporary solution
	me.getServerUrl = function()
	{
		return location.protocol + '//' + location.host;
	};

	// me.clearDivContent

	// Initial Setup - events handler..
	//me.initSetup();
}