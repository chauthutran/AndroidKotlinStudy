function KeycloakManager() {};

var OFFLINE_TIMEOUT = 3 * 60; // 3 minutes

var keycloak;
var btnKeyCloakLogOutTag;
var btnKeyCloakLogInInFormTag;
var timeSkew = 1;

	
// ======================================
// === NEW KEYCLOAK ============

KeycloakManager.startUp = function() 
{
	btnKeyCloakLogOutTag = $('#btnKeyCloakLogOut');
	btnKeyCloakLogInInFormTag = $("#btnKeyCloakLogInInForm");

	var realName = AppInfoLSManager.getAuthChoice();
	if( realName )
	{
		//var url = (WsCallManager.isLocalDevCase) ? "http://localhost:8080/" : "https://keycloak.psidigital.org/";
		
		realName = realName.replace("kc_", "").toUpperCase();
		keycloak =  new Keycloak({
			url: 'https://keycloak.psidigital.org/',
			realm: realName,
			clientId: 'pwaapp'
		});

    	KeycloakManager.setUpEvents( keycloak );
	}
};

KeycloakManager.setUpEvents = function( kcObj ) 
{
    kcObj.onAuthSuccess = () => KeycloakManager.eventMsg('Auth Success');    
    kcObj.onAuthError = (errorData) => KeycloakManager.eventMsg("Auth Error: " + JSON.stringify(errorData) );
    kcObj.onAuthRefreshSuccess = () => KeycloakManager.eventMsg('Auth Refresh Success');    
    kcObj.onAuthRefreshError = (errorData) => {
		var errorData = JSON.parse(errorData);
		KeycloakManager.eventMsg('Error while refreshing token because of ' + errorData.error_description);
	}
    kcObj.onAuthLogout = () => KeycloakManager.eventMsg('Auth Logout');
    kcObj.onTokenExpired = () => KeycloakManager.setForm_TokenExpired();
};


KeycloakManager.isKeyCloakInUse = function() 
{
	return ( AppInfoLSManager.getKeyCloakUse() === 'Y' );
};


KeycloakManager.removeKeyCloakInUse = function() 
{
	AppInfoLSManager.setKeyCloakUse( '' );
};

KeycloakManager.setForm_TokenExpired = function()
{
	KeycloakManager.eventMsg('Access token expired.');

	// Disabled the login form
	$("#loginFormDiv").find(".loginSetPinBtn").off('click').css("background-color", "#eeeeee");
	$("#loginFormDiv").find(".loginBtn").off('click').css("background-color", "#eeeeee"); 
	Login.loginInputDisable( true ); 

	// Show/Hide the buttons
	if( ConnManagerNew.isAppMode_Offline() ){
		
		MsgManager.msgAreaShowOpt( "Token is expired. Please login again when it is online", { cssClasses: 'notifDark', hideTimeMs: 180000 } );
		btnKeyCloakLogOutTag.hide();
	}
	else
	{
		MsgManager.msgAreaShowOpt( "Token is expired. Please login again.", { cssClasses: 'notifDark', hideTimeMs: 180000 } );
		btnKeyCloakLogOutTag.html("Login").show().off("click").click( () => { KeycloakManager.setPendingAction("logoutToken"); });
		btnKeyCloakLogInInFormTag.show().off("click").click( () => { KeycloakManager.setPendingAction("logoutToken"); });
	}
}

KeycloakManager.setForm_InitSuccess = function()
{
	KeycloakManager.eventMsg('Authenticated.');

	KeycloakLSManager.setLastLoginDate(UtilDate.dateStr( "DATETIME" ));
	localStorage.setItem("accessToken", keycloak.token);
	localStorage.setItem("refreshToken", keycloak.refreshToken);
	localStorage.setItem("idToken", keycloak.idToken);
	localStorage.setItem("accessTokenParsed", JSON.stringify(keycloak.tokenParsed));
	

	// Save the username info..
	var userName = keycloak.tokenParsed.preferred_username;
	if ( userName ) AppInfoLSManager.setUserName( userName.toUpperCase() );
	if ( SessionManager.cwsRenderObj ) SessionManager.cwsRenderObj.loadSavedUserName();

	// Enable the login form
	$("#loginFormDiv").find(".loginSetPinBtn").on('click').css("background-color", "#F06D24");
	$("#loginFormDiv").find(".loginBtn").on('click').css("background-color", "#F06D24"); 
	Login.loginInputDisable( false ); 

	// Show/Hide the buttons
	MsgManager.msgAreaShowOpt( "Login with Keycloak success !", { cssClasses: 'notifDark', hideTimeMs: 180000 } );
	if( ConnManagerNew.isAppMode_Offline() ){
		btnKeyCloakLogOutTag.hide();
	}
	else
	{
		btnKeyCloakLogOutTag.html("LogOut").show().off("click").click( () => { KeycloakManager.setPendingAction("logoutToken"); });
	}
}

KeycloakManager.setForm_InitFail = function()
{
	KeycloakManager.eventMsg('Login with Keycloak failure.');

	// Disabled the login form
	$("#loginFormDiv").find(".loginSetPinBtn").off('click').css("background-color", "#eeeeee");
	$("#loginFormDiv").find(".loginBtn").off('click').css("background-color", "#eeeeee");
	Login.loginInputDisable( true ); 

	// Hide the buttons
	MsgManager.msgAreaShowOpt( "Login with Keycloak failure !", { cssClasses: 'notifDark', hideTimeMs: 180000 } );
	btnKeyCloakLogOutTag.hide();
	
}


KeycloakManager.setForm_DisabledAll = function(msg)
{
	// Disabled the login form
	$("#loginFormDiv").find(".loginSetPinBtn").off('click').css("background-color", "#eeeeee");
	$("#loginFormDiv").find(".loginBtn").off('click').css("background-color", "#eeeeee");
	Login.loginInputDisable( true ); 

	// Show/Hide the buttons
	MsgManager.msgAreaShowOpt( msg, { cssClasses: 'notifDark', hideTimeMs: 180000 } );
	btnKeyCloakLogOutTag.hide();
}


// -------------------------------------------------------------------------------------
// INIT keycloak

KeycloakManager.initWithoutToken = function(successFunc, errorFunc)
{
	keycloak.init({ 
		onLoad: 'login-required', 
		checkLoginIframe: false, 
		scope: 'openid offline_access',
		adapter: 'default',
		timeSkew: timeSkew
	}).then( function(authenticated) {
		console.log( 'authenticated: ', authenticated );

		if( !authenticated ) KeycloakManager.setForm_InitFail();
		else  {
			KeycloakManager.setForm_InitSuccess();
		}

		if( successFunc) successFunc( authenticated );
	})
	.catch(function( errMsg ) {
		// This fail because of the "Offline user session not found" ( resfeshToken is expired ).
		// We need to init again without any token in options
		KeycloakManager.initWithoutToken();

		// KeycloakManager.setForm_InitFail();
		// if(errorFunc) errorFunc( errMsg );
	});
}

KeycloakManager.initWithToken = function(successFunc, errorFunc)
{
	const accessToken = localStorage.getItem("accessToken");
	const refreshToken = localStorage.getItem("refreshToken");
	const idToken = localStorage.getItem("idToken");

	keycloak.init({
		promiseType: 'native',
		checkLoginIframe: false,
		token: accessToken,
		refreshToken: refreshToken,
		idToken: idToken,
		timeSkew: timeSkew
	}).then(function(authenticated) {
		console.log( 'authenticated: ', authenticated );
		
		if( !authenticated ) KeycloakManager.setForm_InitFail();
		else KeycloakManager.setForm_InitSuccess();

		if( successFunc) successFunc( authenticated );
	})
	.catch(function( errMsg ) {
		KeycloakManager.setForm_InitFail();
		if(errorFunc) errorFunc( errMsg );
	});
}

// -------------------------------------------------------------------------------------
// The Main Authentication Call

KeycloakManager.keycloakPart = function() 
{
	const accessToken = localStorage.getItem("accessToken");
	const pendingAction = KeycloakManager.getPendingAction();
	
	btnKeyCloakLogInInFormTag.hide();

	if(!ConnManagerNew.isAppMode_Offline()) // ONLINE
	{
		if( pendingAction != undefined)
		{
			if( keycloak.token == undefined && accessToken != undefined ) // Open the PWA app from the second time
			{
				KeycloakManager.initWithToken(function(auth){
					console.log( 'authenticated: ', auth );
					if( auth && pendingAction == "logoutToken")
					{
						KeycloakManager.tokenLogout();
					}
				});
			}
			else if( pendingAction == "logoutToken" ) // For the first time using Keycloak
			{
				KeycloakManager.tokenLogout();
			}
		}
		else if( accessToken != null )
		{
			if( KeycloakManager.isTokenExpired())
			{
				KeycloakManager.setForm_TokenExpired();
				btnKeyCloakLogInInFormTag.show().off("click").click( () => { KeycloakManager.setPendingAction("logoutToken"); });
			}
			else
			{
				KeycloakManager.initWithToken();
			}
		}
		else if( accessToken == null )
		{
			KeycloakManager.initWithoutToken();
		}
	}
	else // OFFLINE
	{
		if( accessToken != null )
		{
			var diffSeconds = timeCalculation( UtilDate.dateStr( "DATETIME" ), KeycloakLSManager.getLastLoginDate() );
			if( diffSeconds > OFFLINE_TIMEOUT ) // Need to check keycloak token expired here
			{
				if( KeycloakManager.isTokenExpired())
				{
					KeycloakManager.setForm_TokenExpired();
				}
				else
				{
					Login.loginInputDisable( false ); 
				}
			}
			else
			{
				Login.loginInputDisable( false ); 
			}
		}
		else
		{
			KeycloakManager.setForm_DisabledAll("Please connect internet to login in the first time");
		}
	}
	 
	// if( pendingAction != undefined && !ConnManagerNew.isAppMode_Offline() )
	// {
	// 	if( keycloak.token == undefined && accessToken != undefined )
	// 	{
	// 		KeycloakManager.initWithToken(function(auth){
	// 			console.log( 'authenticated: ', auth );
	// 			if( auth && pendingAction == "logoutToken")
	// 			{
	// 				KeycloakManager.tokenLogout();
	// 			}
	// 		});
	// 	}
	// 	else if( pendingAction == "logoutToken" )
	// 	{
	// 		KeycloakManager.tokenLogout();
	// 	}
	// }
	// else if( accessToken != null )
	// {
	// 	if( KeycloakManager.isTokenExpired())
	// 	{
	// 		KeycloakManager.setForm_TokenExpired();
	// 	}
	// 	else
	// 	{
	// 		KeycloakManager.initWithToken();
	// 	}
	// }
	// else 
	// {
	// 	if( ConnManagerNew.isAppMode_Offline()  )
	// 	{
	// 		KeycloakManager.setForm_DisabledAll("Please connect internet to login in the first time");
	// 	}
	// 	else // ONLINE MODE
	// 	{
	// 		KeycloakManager.initWithoutToken();
	// 	}
	// }
};


 
KeycloakManager.setPendingAction = function( actionName )
{
	localStorage.setItem('keycloakPendingAction', actionName);
	KeycloakManager.keycloakPart();
}

KeycloakManager.getPendingAction = function()
{
	var pendingAction = localStorage.getItem('keycloakPendingAction');
	return ( pendingAction == null || pendingAction == "" ) ? undefined : pendingAction;
}


// http://127.0.0.1:8887/logout.html
// https://pwa-stage.psi-connect.org/logout.html
KeycloakManager.tokenLogout = function( callFunc ) 
{
	try
	{
		if( !ConnManagerNew.isAppMode_Offline()  )
		{
			KeycloakManager.localStorageRemove();
	
			keycloak.logout({"redirectUri": window.location.href + "logout.html"}).then( (success) => {
				console.log( 'KeyCloak Token LogOut success: ' + success );
				if ( callFunc ) callFunc( true );
			}).catch( (error) => {
				console.log( 'KeyCloak Token LogOut failed: ' );
				console.log( error );
				if ( callFunc ) callFunc( false );
			});
		}
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in KeycloakManager.tokenLogout, ' + errMsg );
	}
};

KeycloakManager.localStorageRemove = function() {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
	localStorage.removeItem("idToken");
	localStorage.removeItem("accessTokenParsed");
	localStorage.removeItem("keycloakPendingAction");
};


KeycloakManager.eventMsg = function(event) {
	console.log(event);
};


KeycloakManager.getUserInfo = function()
{
	var userInfo = { userGroup: [] };

	try
	{
		if ( keycloak )
		{
			var idData = keycloak.idTokenParsed;
			if ( idData && idData.userGroupList ) userInfo.userGroup = idData.userGroupList;
		}	
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in KeycloakManager.getLoginInfo, ' + errMsg );
	}

	return userInfo;
};

// ==================================

// KeycloakManager.isTokenExpired = function( tokenInfo )
// {
//     const parsedTokenData = JSON.parse( tokenInfo );
//     const leftSeconds = parsedTokenData.exp - new Date().getTime() / 1000;
// 	return (leftSeconds <= 0) // Token Expired
// };

KeycloakManager.isTokenExpired = function(minValidity) {
	minValidity = minValidity || 0;
	const tokenParsed = JSON.parse( localStorage.getItem("accessTokenParsed") );

	if (!tokenParsed) {
		throw 'Not authenticated';
	}

	var expiresIn = tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + timeSkew;
	if (minValidity) {
		if (isNaN(minValidity)) {
			throw 'Invalid minValidity';
		}
		expiresIn -= minValidity;
	}
	return expiresIn < 0;
};



// =======================================================================================
// Suportive methods

function timeCalculation( dtmNewer, dtmOlder )
{
	return ( new Date( dtmNewer ).getTime()  - new Date( dtmOlder ).getTime() ) / Util.MS_SEC;
}
