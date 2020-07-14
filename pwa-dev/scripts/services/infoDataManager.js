// -------------------------------------------
//      InfoDataManager Class/Methods
//          - Keeps INFO Data updated. (in Memory)
// -------------------------------------------------
function InfoDataManager() {}

InfoDataManager.INFO = {};

InfoDataManager.NAME_activity = 'activity';
InfoDataManager.NAME_client = 'client';
InfoDataManager.NAME_login_UserName = 'login_UserName';

// ---------------------------------------

InfoDataManager.setINFOdata = function( name, data )
{
	InfoDataManager.INFO[ name ] = data;
};

InfoDataManager.getINFO = function()
{
	return InfoDataManager.INFO;
};

// Likely never used...
InfoDataManager.clearINFOdata = function()
{
	InfoDataManager.INFO = {};
};

// -------------------------------------

InfoDataManager.setDataAfterLogin = function()
{
	var sessionData = SessionManager.sessionData;

	InfoDataManager.setINFOdata( 'login_UserName', sessionData.login_UserName );

	// Any other info?
};

InfoDataManager.setINFOclientByActivity = function( activity )
{
	var clientJson = ClientDataManager.getClientByActivityId( activity.id );

	InfoDataManager.setINFOdata( 'client', clientJson );
};

