// -------------------------------------------
//      InfoDataManager Class/Methods
//          - Keeps INFO Data updated. (in Memory)
//			TODO: ?: Rename to 'EvalInfoDataManager'?
//			'INFO' object is used when referencing data in 'eval'
//			We put all the data under 'INFO' object - to be used on 'eval' time.
// -------------------------------------------------
function InfoDataManager() {}

InfoDataManager.INFO = {};
// GLOBAL VARIABLE?  Set it on someplace common global class?
var INFO = InfoDataManager.INFO;
InfoDataManager.NAME_activity = 'activity';
InfoDataManager.NAME_client = 'client';

InfoDataManager.NAME_app_version = 'app_version';

InfoDataManager.NAME_login_UserName = 'login_UserName';
InfoDataManager.NAME_login_OrgUnitId = 'login_orgUnitId';
InfoDataManager.NAME_login_CountryOuCode = 'login_CountryOuCode';
InfoDataManager.NAME_login_OrgUnitData = 'login_OrgUnitData';
InfoDataManager.NAME_userRole = 'userRole';

InfoDataManager.NAME_syncLastDownloaded = 'syncLastDownloaded';	// These get changed, thus, need to be updated.
InfoDataManager.NAME_syncLastDownloaded_noZ = 'syncLastDownloaded_noZ';	// These get changed, thus, need to be updated.

InfoDataManager.NAME_fixOperationLast = 'fixOperationLast';
InfoDataManager.NAME_fixOperationLast_noZ = 'fixOperationLast_noZ';

//InfoDataManager.NAME_lastVoucher_overrideVC = 'lastVoucher_overrideVC'; // per client data, set as {} initially

InfoDataManager.NAME_INFO = 'INFO'; // Used for array list 'INFO' name..

// --------------------------------------

InfoDataManager.INFO.deviceMinSpec = { memory: 1, storage: 4 };
InfoDataManager.INFO.deviceInfo = {};

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
		InfoDataManager.setINFOdata( InfoDataManager.NAME_login_OrgUnitId, SessionManager.sessionData.orgUnitData.orgUnitId );
		InfoDataManager.setINFOdata( InfoDataManager.NAME_login_CountryOuCode, SessionManager.sessionData.orgUnitData.countryOuCode );
		InfoDataManager.setINFOdata( InfoDataManager.NAME_login_OrgUnitData, SessionManager.sessionData.orgUnitData );
		InfoDataManager.setINFOdata( InfoDataManager.NAME_userRole, ConfigManager.login_UserRoles );

		//INFO.activityList = ActivityDataManager.getActivityList();
		//INFO.clientList = ActivityDataManager.getClientList();

		// Any other info?	
		InfoDataManager.setINFO_lastDownloaded( AppInfoManager.getSyncLastDownloadInfo() );
		InfoDataManager.setINFO_fixOperationLast( AppInfoManager.getFixOperationLast() );

		// NOTE: But we can access by '_ver' in anywhere.
		InfoDataManager.setINFOdata( InfoDataManager.NAME_app_version, Util.getStr( _ver ) );

		// Set initial empty - will get added/removed as it goes..
		//InfoDataManager.setINFOdata( InfoDataManager.NAME_lastVoucher_overrideVC, { } );
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in InfoDataManager.setDataAfterLogin, errMsg: ' + errMsg );
	}
};

InfoDataManager.setINFOclientByActivity = function( activity )
{
	var clientJson = ClientDataManager.getClientByActivityId( activity.id );

	InfoDataManager.setINFOdata( InfoDataManager.NAME_client, clientJson );
};

// ------------------------------------------------
InfoDataManager.setINFO_lastDownloaded = function( syncLastDownloaded )
{
	if ( syncLastDownloaded )
	{
		InfoDataManager.setINFOdata( InfoDataManager.NAME_syncLastDownloaded, syncLastDownloaded );
		InfoDataManager.setINFOdata( InfoDataManager.NAME_syncLastDownloaded_noZ, syncLastDownloaded.replace( 'Z', '' ) );
	}
};

InfoDataManager.setINFO_fixOperationLast = function( fixOperationLast )
{
	if ( fixOperationLast )
	{
		InfoDataManager.setINFOdata( InfoDataManager.NAME_fixOperationLast, fixOperationLast );
		InfoDataManager.setINFOdata( InfoDataManager.NAME_fixOperationLast_noZ, fixOperationLast.replace( 'Z', '' ) );
	}
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


InfoDataManager.setINFOList_Client = function( clientList )
{
	var newList = [];

	for ( var i = 0; i < clientList.length; i++ )
	{
		var client = clientList[ i ];
		
		// Create Object => { 'INFO': { 'activity': --, 'client': -- } }
		var newObj = {};
		newObj[ InfoDataManager.NAME_INFO ] = { 'client': client };
		newList.push( newObj );
	}

	return newList;
};

// Get Activity List from { 'INFO': { 'activity': --, 'client': -- } }
InfoDataManager.getActivityList_fromINFOList = function( INFOList_activity )
{
	var newActivityList = [];

	INFOList_activity.forEach( item => {
		newActivityList.push( item[ InfoDataManager.NAME_INFO ].activity );
	});

	return newActivityList;
};

InfoDataManager.getClientList_fromINFOList = function( INFOList_client )
{
	var newClientList = [];

	INFOList_client.forEach( item => {
		newClientList.push( item[ InfoDataManager.NAME_INFO ].client );
	});

	return newClientList;
};


InfoDataManager.createObj_ActivityClient = function( activity )
{
	var client = ClientDataManager.getClientByActivityId( activity.id );

	return { 'activity': activity, 'client': client };
};


InfoDataManager.setDeviceInfo_OnStart = function( callBack_storage )
{
	var info = {};

	InfoDataManager.INFO.deviceInfo = info;

	try
	{
		info.UaData = UAParser();

		// 1. Basic Info
		info.browser = info.UaData.browser;
		info.engine = info.UaData.engine;
		info.os = info.UaData.os;
		info.cpu = info.UaData.cpu;
		info.cpu.corCount = navigator.hardwareConcurrency;
		info.memory = navigator.deviceMemory;
		info.device = info.UaData.device;
	
		try
		{
			// Delayed info
			// 2. Battery Info
			navigator.getBattery().then( function( battery ) 
			{
				info.battery = battery;
				//var batteryChargingYN = ( battery.charging ) ? 'Y': 'N';
				//var chargeLvl = ( battery.level * 100 ).toFixed( 0 ) + '%';
				//var batteryInfo = ', Battery Left: ' + chargeLvl + ', Charging(' + batteryChargingYN + ')';
			});
		}
		catch( errMsg )
		{
			console.log( 'ERROR in InfoDataManager.setDeviceInfo_OnStart getBattery, ', errMsg );
		}

	
		// 3. Storage Info
		if ( 'storage' in navigator && 'estimate' in navigator.storage ) 
		{
			navigator.storage.estimate().then( ( { usage, quota } ) => 
			{
				info.storage = { usage: usage, quota: quota };
				callBack_storage( info );
			}).catch( error => {
				console.log( 'ERROR caught on InfoDataManager.getDeviceInfo_storage' );
				callBack_storage( info );
			});
		}
		else callBack_storage( info );
	}
	catch( errMsg )
	{
		console.log( 'ERROR in InfoDataManager.setDeviceInfo_OnStart, ', errMsg );
	}

};
