// -------------------------------------------
// -- CwS Render Class/Methods
function testSection()
{
	var me = this;

	me.testData = [];
	
	// Tags
	me.testDivTag = $( '#testDiv' );
	me.testBtnTag = $('#testBtn');
	me.testInputTag = $( '#testInput' );
	me.testFetchInputTag = $( '#testFetchInput' );
	me.testFetchBtnTag = $( '#testFetchBtn' );

	// =============================================
	// ---- initial SetUp --------------
	me.initSetUp = function()
	{	
		me.loadTestData( function( testDataJson ) {
			me.renderTestData( testDataJson );
		});

		me.setUpEvents();
	}

	// ---------------------------

	// NOTE: 
	// List of items are stored in localStorage rather than cache?
	// Only the retrieved json data and matching url is stored in Cache?
	me.loadTestData = function( returnFunc )
	{
		//let testData = localStorage.getItem("testData");
		const testDataStr = localStorage.testData;
		if ( testDataStr ) {
			me.testData = JSON.parse( testDataStr );

			returnFunc( me.testData );
		}
	}

	me.renderTestData = function( testDataJson )
	{		
		testDataJson.forEach( function(jsonData) {        
			me.renderEachTestData( jsonData, me.testDivTag );
		});
	}
	
	me.renderEachTestData = function( jsonData, testDivTag )
	{
		var uid = jsonData.uid;

		var divTag = $( '<div class="testBlock" uid="' + uid + '"></div>' );
		divTag.html( jsonData.label );

		// Add delete click event
		divTag.click( () => {
			// remove the div and data
			if ( uid === undefined )
			{
				// remove all..
				me.deleteTestDataAll( () => {
					$( 'div.testBlock' ).remove();
				});
			}
			else
			{
				me.deleteTestData( uid, () => {
					divTag.remove();
				});
			}

		});

		testDivTag.append( divTag );
	}

	me.saveTestData = function() 
	{
		var testDataStr = JSON.stringify( me.testData );
		localStorage.testData = testDataStr; // Save the array to string version to localStorage..
	};

	me.deleteTestData = function( uidStr, returnFunc ) 
	{
		if ( Util.RemoveFromArray( me.testData, 'uid', uidStr ) !== undefined )
		{
			me.saveTestData();
			if ( returnFunc !== undefined ) returnFunc();
		}
		else console.log( 'Failed to remove the item' );
	};

	me.deleteTestDataAll = function( returnFunc )
	{
		localStorage.removeItem( 'testData' );
		if ( returnFunc !== undefined ) returnFunc();		
	}
	// -----------------------------

	me.setUpEvents = function()
	{
		me.testBtnTag.click( () => {

			// DO NOT NEED THIS LINE - INIT OF 'testData'...
			if ( !me.testData ) { me.testData = []; }
	
			var jsonData = { uid: Util.generateRandomId(), label: me.testInputTag.val() };
	
			me.renderEachTestData( jsonData, me.testDivTag );
	
			me.testData.push( jsonData );
	
			me.saveTestData();
	
			// clear the input box..
			me.testInputTag.val( '' );
		});

		me.testFetchBtnTag.click( () => {

			var queryUrl = Util.trim( me.testFetchInputTag.val() );

			console.log( 'queryUrl' + queryUrl );

			// 1. Check for cache here!!  <-- Make this a util!!
			// If not matches, let it 
			if ('caches' in window) 
			{
				caches.match( queryUrl )
				.then( function( response ) 
				{
					if (response) 
					{
						response.json().then(
							function(jsonData) 
							{
								console.log( '-- cached data' );
								me.renderFetchResult(jsonData);
							}
						);
					}
				});
			}

			// 2. Fetch the network data here!!!
			$.get( queryUrl, function( jsonData, status ) 
			{
				console.log( '-- network data' );
				me.renderFetchResult(jsonData);
			});



			// This still gets catched by 'fetch' event handler on 'service worker'..
			// TODO: We want to have it cached by ...  <-- if network is not available..
			// TODO: 'Network offline/online' check once HOW-TO
			// TODO: 'POST' test as well..  + get it by using username/password + config..
			/*$.get( queryUrl, function( data, status ) {
				console.log( data );
				console.log( status );
				alert( JSON.stringify( data ) );
			});
			*/
			/*
			fetch( queryUrl )
			.then( function( response ) {
				console.log( response );
				return response.json(); 
			} )
			.then( jsonData => {
				console.log( jsonData );
			});
			*/

			

		});
		
	}


	me.renderFetchResult = function( jsonData )
	{
		console.log( jsonData );
		alert( JSON.stringify( jsonData ) );
	}

	// ---------------------------

	// Initial Setup - events handler..
	//me.initSetup();
}