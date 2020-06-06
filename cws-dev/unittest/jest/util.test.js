


global.window = window;
global.$ = require('../../scripts/libraries/jquery-3.4.0.js');
global.localforage = require("../../scripts/libraries/localforage.min.js");
global.Util = require("../../scripts/utils/util.js");
// global.RESTCallManager = require("../../scripts/utils/restUtil.js");
// global.WsApiManager = require("../../scripts/services/wsApiManager.js");
// global.FormUtil = require("../../scripts/utils/formUtil.js");


test('Util.sortByKey', async () => {
	  
	var jsonData = [{
		"name": "Test 2",
		"created": "2019-01-02"
	},
	{
		"name": "Test 3",
		"created": "2019-01-02"
	},
	{
		"name": "Test 1",
		"created": "2019-01-02"
	}];

	var sortedData = Util.sortByKey( jsonData, 'name', undefined, 'Acending'); 

	expect( sortedData[0].name == "Test 1" && sortedData[1].name == "Test 2" && sortedData[2].name == "Test 3" ).toBe( true );
});


// test('Online Login check', async () => {
      
// 	WsApiManager.setupWsApiVariables();
	
// 	FormUtil.submitLogin( "DV_TEST_IPC", "1234", $("<div>Loading Task</div>"), function( loginStatus, returnJson ){
// 		expect( loginStatus ).toBe( true );
// 	});

// });



