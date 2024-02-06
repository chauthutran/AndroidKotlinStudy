// -------------------------------------------
// -- AppUtil Class/Methods

function AppUtil() {}

// Browser refresh/reload
// Set this before refreshing, thus, sw state event not display the update message.
AppUtil.appReloading = false;  

AppUtil.MATOMO_URL = 'https://matomo.psi-mis.org';

AppUtil.paramsJson = {}; // Load all params data in here and get them from here.
AppUtil.paramName_keyCloakRemove = 'keyCloakRemove';
AppUtil.paramName_authPage = 'authPage';
AppUtil.paramName_authChoice = 'authChoice';

// ==== Methods ======================

AppUtil.appReloadWtMsg = function( msg, option )
{    
	if ( !msg ) msg = 'App Reloading!!';
	if ( !option ) option = {};
	
	MsgManager.msgAreaShowOpt( msg, { cssClasses: 'notifCBlue', closeOthers: true } );

	AppUtil.appReloading = true;

	window.removeEventListener('popstate', App.popStateCall );

	if ( option.timeout )
	{
		setTimeout( function() {
			window.location = window.location.href.split("?")[0];	
		}, option.timeout );
	}
	else	window.location = window.location.href.split("?")[0];	

};


AppUtil.getDiffSize = function( inputVal, dividNum, endingStr )
{
	var returnVal = '';

	try
	{
		if ( endingStr === undefined ) endingStr = '';

		if ( inputVal )
		{
			returnVal = Number( inputVal / dividNum ).toFixed(1) + endingStr;
		}
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in AppUtil.getDiffSize, ' + errMsg );
	}

	return returnVal;
};

AppUtil.getStorageGBStr = function( storage )
{	
	return AppUtil.getDiffSize( storage, 1000000000 );
};


AppUtil.popStateCall = function(event) 
{
	history.pushState(null, document.title, location.href);

	var backBtnTags = $('.btnBack:visible');

	if (backBtnTags.length > 0) {
		//backBtnTags.click();
		backBtnTags.first().click();
	}
	else {
		MsgManager.msgAreaShow('Back Button Click Blocked!!');
	}
};


// -----------------------------------------
// --- Param Related: Params Saving to LocalStorage, Reading, Handlings..
// NEW:
// 	1. Get url params (into 'paramObj') & store in LocalStorage 'paramsLoad' (with merging existing ones)
// 	2. 


//  OLD, OBSOLETE METHOD
AppUtil.paramsHandler_ReloadApp = function( urlStr, exec_AuthChoicePageCase, func_NormalCase )
{
	var paramsLoadJson = {};

	// If param exists, save it on oneTime storage and reload the app..
	var paramObj = Util.getParamObj( urlStr );


	// CASE 1. If Params exists in url, store in LS, and reload app.
	if ( Object.keys( paramObj ).length > 0 )
	{
		var existingParamJson = LocalStgMng.getJsonData( 'paramsLoad' );
		if ( !existingParamJson ) existingParamJson = {};

		var noReload = ( paramObj[ AppUtil.paramName_keyCloakRemove ] === 'Y' ) ? true: false;

		Util.mergeJson( paramObj, existingParamJson );

		// If 'authChoice' or 'authPage' was passed, delete all storage & reload
		var paramAuthChoice = paramObj[ AppUtil.paramName_authChoice ];
		var paramAuthPage = paramObj[ AppUtil.paramName_authPage ];
		if ( paramAuthChoice || paramAuthPage ) exec_AuthChoicePageCase( paramObj );
		else
		{
			LocalStgMng.saveJsonData( 'paramsLoad', paramObj );
				
			if ( noReload ) console.log( 'url param reload skipped' ); 
			else AppUtil.appReloadWtMsg( 'Reloading For Params Removal From URL..' );
		}
	}


	// CASE 2. If LS has 'paramsLoad', save it on paramsObj
	if ( LocalStgMng.getJsonData( 'paramsLoad' ) )
	{
		paramsLoadJson = LocalStgMng.getJsonData( 'paramsLoad' );

		if ( paramsLoadJson.action === 'clientDirect' && paramsLoadJson.client ) MsgManager.msgAreaShowErrOpt( 'ClientDirect URL Param Used: ' + paramsLoadJson.client, { hideTimeMs: 7000, styles: 'background-color: green;' } );
	}

	func_NormalCase( paramsLoadJson );
	//return paramsLoadJson;
};


AppUtil.saveMerge_LSParamsLoad = function( paramObj )
{
	var hasNewParams = false;
	var keyCloakRemoveCase = false;
	var newParamsJson = {};
	var paramsJson = PersisDataLSManager.getData( PersisDataLSManager.KEY_PARAMS_LOAD );
	if ( !paramsJson ) paramsJson = {};

	// If new params exist, merge with existing param data and save it on local storage.
	if ( Object.keys( paramObj ).length > 0 )
	{
		hasNewParams = true;
		Util.mergeJson( paramsJson, paramObj );
		PersisDataLSManager.updateData( PersisDataLSManager.KEY_PARAMS_LOAD, paramsJson );

		keyCloakRemoveCase = ( paramObj[ AppUtil.paramName_keyCloakRemove ] === 'Y' ) ? true: false;
		if ( keyCloakRemoveCase ) console.log( 'url param reload skipped' );
	}


	// Copy the 'paramsJson' for changes not affecting LS Data (For Other values as well..)
	newParamsJson = Util.cloneJson( paramsJson );

	// If 'NewParams' exists, set 'pageReloadCase' as true.
	//	However, if 'keyCloakRemove' is set to 'Y', override 'pageReloadCase' as false.
	newParamsJson.pageReloadCase = ( hasNewParams && !keyCloakRemoveCase ) ? true: false;
	newParamsJson.AuthPageCase = ( newParamsJson[ AppUtil.paramName_authPage ] ) ? true: false;
	newParamsJson.AuthChoiceCase = ( newParamsJson[ AppUtil.paramName_authChoice ] ) ? true: false;

	return newParamsJson;
};


AppUtil.getParamVal_ByName = function( name, option )
{
	if ( !option ) option = {};
	if ( option.deleteInLS ) AppUtil.delete_ParamsInLS( name );

	return ( AppUtil.paramsJson && AppUtil.paramsJson[ name ] ) ? AppUtil.paramsJson[ name ]: undefined;
};

AppUtil.delete_ParamsInLS = function( propName )
{
	var existingParamJson = PersisDataLSManager.getData( PersisDataLSManager.KEY_PARAMS_LOAD );
	if ( !existingParamJson ) existingParamJson = {};

	if ( existingParamJson[ propName ] )
	{
		delete existingParamJson[ propName ];
		PersisDataLSManager.updateData( PersisDataLSManager.KEY_PARAMS_LOAD, existingParamJson );
	}
};


AppUtil.getClientDirectId = function( actionParamName, clientParamName )
{
	var clientDirectId = '';

   if ( AppUtil.getParamVal_ByName( actionParamName ) === 'clientDirect' )
	{
		clientDirectId = AppUtil.getParamVal_ByName( clientParamName );
	}

	return clientDirectId;
};


AppUtil.param_showMsg = function( paramName_Msg )
{
	var paramMsg = AppUtil.getParamVal_ByName( paramName_Msg, { deleteInLS: true } );
	if ( paramMsg ) MsgManager.msgAreaShowOpt( paramMsg, { hideTimeMs: 4000 } );	
};


// Force to not use KeyCloak anymore.  Even if the session is still alive.
// --> Has issue with session Auth Out, though...
AppUtil.param_keyCloakUsage_ForceRemove = function( paramName_keyCloakRemove )
{
	if ( AppUtil.getParamVal_ByName( paramName_keyCloakRemove, { deleteInLS: true } ) ) 
	{ 
		KeycloakLSManager.removeProperty( KeycloakLSManager.KEY_AUTH_CHOICE );
	}	
};


// AuthChoice/Page Related #2
AppUtil.param_authChiocePage_DataSet = function( paramName_authPage, paramName_authChoice, runFunc )
{
	var paramAuthPage = AppUtil.getParamVal_ByName( paramName_authPage, { deleteInLS: true } );
	var paramAuthChoice = AppUtil.getParamVal_ByName( paramName_authChoice, { deleteInLS: true } );

	if ( paramAuthChoice ) 
	{
		KeycloakLSManager.setAuthChoice( paramAuthChoice );
		PersisDataLSManager.setAuthPageUse( 'Y' );

		if ( runFunc ) runFunc();
	}
	else if ( paramAuthPage === 'Y' ) 
	{
		KeycloakLSManager.removeProperty( KeycloakLSManager.KEY_AUTH_CHOICE );
		PersisDataLSManager.setAuthPageUse( 'Y' );

		if ( runFunc ) runFunc();
	}
};


// -------------------------------------------

AppUtil.checkDeviceMinSpec = function( info )
{
	try
	{
		if ( info.storage )
		{
			var notPass = false;
	
			var minSpec = InfoDataManager.INFO.deviceMinSpec;  // Only test this once...
			//var currSpec = { memory: info.memory, storage: App.getStorageGB() };
			
			if ( info.memory < minSpec.memory ) 
			{
				notPass = true;
			}
	
			if ( info.storage.quota < ( minSpec.storage * 1000000000 ) )
			{
				notPass = true;
			}
	
			if ( notPass )
			{
				// If POTerm exists (in local storage), translate it..
				detectIncognito().then(function(result) 
				{
					if (result.isPrivate) console.log( '-- In Incognito Mode --' );
					else {
						var msg = 'This device is in either Incognito Mode, \n OR does not meet the minimum spec. \n [Min: ' + JSON.stringify( minSpec ) 
						+ ', Curr: { memory: ' + info.memory + ', storage: ' + AppUtil.getStorageGBStr( info.storage.quota ) + ' }]';		
						alert( msg );
					}
				}).catch(function(error) {  console.log(error);  });
			}
		}	
	}
	catch( errMsg )
	{
		console.log( 'ERROR in InfoDataManager.setDeviceInfo_OnStart, ', errMsg );
	}
};

// ----------------------------

AppUtil.runAppChangeDeploy = function( runType )
{
	if ( INFO.AppChangeDeploy )
	{
		INFO.AppChangeDeploy.forEach( item => 
		{
			try
			{
				var itemRunTypeEval = item[ runType ];
	
				if ( itemRunTypeEval ) 
				{
					var currDate = new Date();
					if ( ( !item.startDT_UTC || new Date( item.startDT_UTC ) <= currDate )
						&& ( !item.endDT_UTC || new Date( item.endDT_UTC ) >= currDate ) )
					{
						eval( Util.getEvalStr( itemRunTypeEval ) );
					}
				}	
			}
			catch( errMsg ) {
				console.log( 'ERROR in AppUtil.runAppChangeDeploy, ' + errMsg );
			}		
		});		
	}
};