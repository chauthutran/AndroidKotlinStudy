// -------------------------------------------
// -- SessionManager Class/Methods

function SessionManager() {}

SessionManager.sessionData = {
	login_UserName: '',
	login_Password: '',
	orgUnitData: undefined,
	dcdConfig: undefined
};

// ---------------------------------------

SessionManager.updateSessionData = function( jsonData ) 
{
	Util.mergeJson( SessionManager.sessionData, jsonData );
};
