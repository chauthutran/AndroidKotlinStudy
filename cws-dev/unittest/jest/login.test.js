


global.window = window;
global.$ = require('../../scripts/libraries/jquery-3.4.0.js');
global.localforage = require("../../scripts/libraries/localforage.min.js");
global.RESTUtil = require("../../scripts/utils/restUtil.js");
global.WsApiManager = require("../../scripts/services/wsApiManager.js");
global.FormUtil = require("../../scripts/utils/formUtil.js");


test('Online Login check', async () => {
      
	WsApiManager.setupWsApiVariables();
	
	FormUtil.submitLogin( "DV_TEST_IPC", "1234", $("<div>Loading Task</div>"), function( loginStatus, returnJson ){
		expect( loginStatus ).toBe( true );
	});

});

