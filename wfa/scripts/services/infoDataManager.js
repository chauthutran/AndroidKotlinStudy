// -------------------------------------------
//      InfoDataManager Class/Methods
//          - Keeps INFO Data updated. (in Memory)
//			TODO: ?: Rename to 'EvalInfoDataManager'?
//			'INFO' object is used when referencing data in 'eval'
//			We put all the data under 'INFO' object - to be used on 'eval' time.
// -------------------------------------------------
function InfoDataManager() {}

InfoDataManager.INFO = {};

InfoDataManager.NAME_activity = 'activity';
InfoDataManager.NAME_client = 'client';
InfoDataManager.NAME_login_UserName = 'login_UserName';
InfoDataManager.NAME_syncLastDownloaded = 'syncLastDownloaded';
InfoDataManager.NAME_syncLastDownloaded_noZ = 'syncLastDownloaded_noZ';

InfoDataManager.NAME_INFO = 'INFO'; // Used for array list 'INFO' name..

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
	try
	{
		InfoDataManager.setINFOdata( InfoDataManager.NAME_login_UserName, SessionManager.sessionData.login_UserName );

		// Any other info?	
		var syncLastDownloaded = AppInfoManager.getSyncLastDownloadInfo();

		if ( syncLastDownloaded )
		{
			InfoDataManager.setINFOdata( InfoDataManager.NAME_syncLastDownloaded, syncLastDownloaded );
			InfoDataManager.setINFOdata( InfoDataManager.NAME_syncLastDownloaded_noZ, syncLastDownloaded.replace( 'Z', '' ) );
		}
	}
	catch ( errMsg )
	{
		console.customLog( 'ERROR in InfoDataManager.setDataAfterLogin, errMsg: ' + errMsg );
	}
};

InfoDataManager.setINFOclientByActivity = function( activity )
{
	var clientJson = ClientDataManager.getClientByActivityId( activity.id );

	InfoDataManager.setINFOdata( InfoDataManager.NAME_client, clientJson );
};

// ------------------------------------------------
// --- Create Array for Activity/Client Object under INFO <-- for sorting
// --- NOT Global 'INFO' object, but used for array of 'INFO' for sorting..

InfoDataManager.setINFOList_Activity = function( activityList )
{
	var newList = [];

	for ( var i = 0; i < activityList.length; i++ )
	{
		var activity = activityList[ i ];
		
		// Create Object => { 'INFO': { 'activity': --, 'client': -- } }
		var newObj = {};
		newObj[ InfoDataManager.NAME_INFO ] = InfoDataManager.createObj_ActivityClient( activity );
		newList.push( newObj );
	}

	return newList;
};

// Get Activity List from { 'INFO': { 'activity': --, 'client': -- } }
InfoDataManager.getActivityList_fromINFOList = function( INFOList_activity )
{
	var newActivityList = [];

	for ( var i = 0; i < INFOList_activity.length; i++ )
	{
		var data = INFOList_activity[ i ];

		newActivityList.push( data[ InfoDataManager.NAME_INFO ].activity );
	}

	return newActivityList;
};


InfoDataManager.createObj_ActivityClient = function( activity )
{
	var client = ClientDataManager.getClientByActivityId( activity.id );

	return { 'activity': activity, 'client': client };
};
