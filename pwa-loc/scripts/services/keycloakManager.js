function KeycloakManager() {};

KeycloakManager.KEYCLOAK_SERVER_URL = "";
KeycloakManager.isStartedUp = false;
KeycloakManager.OFFLINE_TIMEOUT = 10 * 60; // minutes

var keycloak;
var btnKeyCloakLogOutTag;
var btnKeyCloakLogInInFormTag;
var keycloakMsgTag;
var timeSkew = 1;
var accessTokenTimeoutObj;
var offlineExpiredInterval;

var processingTask = "";

// =======================================================================================================
// === NEW KEYCLOAK ============

KeycloakManager.setKeycloakServerUrl = function()
{
	KeycloakManager.KEYCLOAK_SERVER_URL = (WsCallManager.isLocalDevCase) ? "http://localhost:8080/" : "https://keycloak.psidigital.org/";
}

KeycloakManager.startUp = function(realName) 
{
	KeycloakManager.isStartedUp = false;
	btnKeyCloakLogOutTag = $('#btnKeyCloakLogOut');
	btnKeyCloakLogInInFormTag = $("#btnKeyCloakLogInInForm");
	keycloakMsgTag = $("#keycloakMsg");
	clearCheckTokenTimeout();

	KeycloakManager.setKeycloakServerUrl();
	realName = (realName) ? realName : AppInfoLSManager.getAuthChoice();
	if( realName )
	{
		realName = realName.replace("kc_", "").toUpperCase();
		
		keycloak =  new Keycloak({
			url: KeycloakManager.KEYCLOAK_SERVER_URL,
			realm: realName,
			clientId: 'pwaapp'
		});

    	KeycloakManager.setUpEvents( keycloak );

		KeycloakManager.isStartedUp = true;
	}
};

KeycloakManager.setUpEvents = function( kcObj ) 
{
    kcObj.onAuthSuccess = () => KeycloakManager.eventMsg('Auth Success');    
    kcObj.onAuthError = (errorData) => {
		KeycloakManager.eventMsg("Auth Error: " + JSON.stringify(errorData) );
	}
    kcObj.onAuthRefreshSuccess = () => {
		KeycloakManager.eventMsg('Auth Refresh Success');
	} 
    kcObj.onAuthRefreshError = (errorData) => {
		var errorData = JSON.parse(errorData);
		KeycloakManager.eventMsg('Error while refreshing token because of ' + errorData.error_description);
	}
    kcObj.onAuthLogout = () => {
		KeycloakManager.eventMsg('Auth Logout');
	}
    kcObj.onTokenExpired = () => {
		KeycloakManager.eventMsg('Token is expired.');
	}

	kcObj.onActionUpdate = function (status) {
		switch (status) {
			case 'success':
				KeycloakManager.eventMsg('Action completed successfully'); break;
			case 'cancelled':
				KeycloakManager.eventMsg('Action cancelled by user'); break;
			case 'error':
				KeycloakManager.eventMsg('Action failed'); break;
		}
	};
};

// -------------------------------------------------------------------------------------
// Set up form with Token/Refresh Token status

KeycloakManager.setForm_Online = function()
{	
	const processingAction = KeycloakLSManager.getProcessingAction();
	if( processingAction == KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT )
	{
		KeycloakLSManager.localStorageRemove();
	}

	const accessToken =  KeycloakLSManager.getAccessToken();
	if( accessToken != undefined )
	{
		KeycloakManager.watchTokenStatus();

		if( KeycloakManager.isTokenValid() )
		{
			KeycloakManager.setUpForm_Online_TokenValid();
		}
		else
		{
			KeycloakManager.setUpForm_Online_AccessTokenExpired();
		}
	}
	else
	{
		KeycloakManager.authenticate_WithoutToken(function(auth){
			// Show "Logout button" in the bottom
			btnKeyCloakLogOutTag.html("Logout").show().off("click").click( () => { 
				KeycloakManager.tokenLogout();
			});
		});
	}
}

KeycloakManager.setForm_Offline = function()
{	
	const accessToken = KeycloakLSManager.getAccessToken();
	if( accessToken != undefined )
	{
		var offlineExpiredTimeInfo = formatOfflineExpiredTime();
		if( offlineExpiredTimeInfo.isExpired )
		{
			KeycloakManager.setUpForm_Offline_OfflineTimeExpired();
		}
		else
		{
			KeycloakManager.setUpForm_Offline_OfflineTimeValid();
		}
	}
	else
	{
		KeycloakManager.blockLoginForm("Please connect internet to login in the first time");
	}
}



// This one is used for Access Token and Refresh Token are valid
KeycloakManager.setUpForm_Online_TokenValid = function()
{
	// Enable the Login form
	enableLoginForm();

	// Hide "Keyckoak Login" button in the Login form
	btnKeyCloakLogInInFormTag.hide();

	// Add "logOut" event for "Lgout" button in the bottom
	btnKeyCloakLogOutTag.html("Logout").show().off("click").click( () => { 
		KeycloakManager.tokenLogout();
	});
}

KeycloakManager.setUpForm_Online_AccessTokenExpired = function()
{
	// Enable the Login form
	disableLoginForm();
	
	// // Set up events for "Keycloak Login" buttons
	btnKeyCloakLogInInFormTag.off("click").click( () => { 
		KeycloakManager.tokenLogout();
	});

	btnKeyCloakLogOutTag.html("Login").off("click").click( () => { 
		KeycloakManager.tokenLogout();
	});

	// Show "Keycloak Login" buttons
	btnKeyCloakLogInInFormTag.css("background-color", "#008000").show(); // Set "green" color and show the button
	btnKeyCloakLogOutTag.show();

	keycloakMsgTag.html("(Token is expired. Please login again.)");
	MsgManager.msgAreaShowOpt( "Token is expired. Please login again.", { cssClasses: 'notifDark', hideTimeMs: 2000 } );
}

KeycloakManager.setUpForm_Offline_OfflineTimeExpired = function()
{
	clearInterval(offlineExpiredInterval);

	// Enable the login form
	enableLoginForm();

	// Show, but disabled "Keycloak" buttons related 
	btnKeyCloakLogInInFormTag.show().off('click').css("background-color", "#eeeeee");
	btnKeyCloakLogOutTag.show().off('click').css("background-color", "#eeeeee");

	if( KeycloakManager.isTokenValid())
	{
		KeycloakManager.eventMsg('Offline login time is expired. The expired time is set in ' + (KeycloakManager.OFFLINE_TIMEOUT/60) + ' minutes');
		keycloakMsgTag.html("(Offline login time is expired.)");
		MsgManager.msgAreaShowOpt( "Offline login time is expired. Please login again when it is online.", { cssClasses: 'notifDark', hideTimeMs: 180000 } );	
	}
	else
	{
		keycloakMsgTag.html("(Offline login time expired)");
	}
}

KeycloakManager.setUpForm_Offline_OfflineTimeValid = function()
{
	// Enable the login form
	enableLoginForm()
			
	// Hide "Keycloak" buttons related 
	btnKeyCloakLogInInFormTag.hide();
	btnKeyCloakLogInInFormTag.hide();

	clearInterval(offlineExpiredInterval);
	offlineExpiredInterval = setInterval(() => {
		var timeInfo = formatOfflineExpiredTime();
		keycloakMsgTag.html("(Offline login time will expired in " + timeInfo.hh + ":" + timeInfo.mm + ":" + timeInfo.ss + ")" );
		KeycloakManager.setForm_Offline();
	}, Util.MS_SEC);

	var offlineExpiredTimeInfo = formatOfflineExpiredTime();
	keycloakMsgTag.html("(Offline login time will expired in " + offlineExpiredTimeInfo.hh + ":" + offlineExpiredTimeInfo.mm + ":" + offlineExpiredTimeInfo.ss + ")" );
}



KeycloakManager.blockLoginForm = function(msg)
{
	// Disabled the login form
	disableLoginForm();

	// Show/Hide the buttons
	MsgManager.msgAreaShowOpt( msg, { cssClasses: 'notifDark', hideTimeMs: 180000 } );
	btnKeyCloakLogOutTag.hide();
	btnKeyCloakLogInInFormTag.hide();
}

// -------------------------------------------------------------------------------------
// Authenticate the keycloak client/Login

KeycloakManager.authenticate_WithoutToken = function(successFunc, errorFunc)
{
	keycloak.init({ 
		onLoad: 'login-required', 
		checkLoginIframe: false, 
		scope: 'openid offline_access',
		adapter: 'default',
		timeSkew: timeSkew
	}).then( function(authenticated) {
		if( !authenticated ) {
			KeycloakManager.authenticateFailure();
		} 
		else {
			KeycloakLSManager.setKeycloakInfo( keycloak );
			KeycloakManager.authenticateSuccess();
		}

		if( successFunc) successFunc( authenticated );
	})
	.catch(function( errMsg ) {
		// This fail because of the "Offline user session not found" ( resfeshToken is expired ).
		// We need to init again without any token in options

		KeycloakManager.authenticateFailure();
		if(errorFunc) errorFunc( errMsg );
	});
}

KeycloakManager.authenticateSuccess = function()
{
	KeycloakManager.eventMsg('Authenticated.');

	KeycloakLSManager.setLastLoginDate();

	// Save the username info..
	var userName = keycloak.tokenParsed.preferred_username;
	if ( userName ) AppInfoLSManager.setUserName( userName.toUpperCase() );
	if ( SessionManager.cwsRenderObj ) SessionManager.cwsRenderObj.loadSavedUserName();

	// Enable the login form
	$("#loginFormDiv").find(".loginSetPinBtn").on('click').css("background-color", "#F06D24");
	$("#loginFormDiv").find(".loginBtn").on('click').css("background-color", "#F06D24"); 
	Login.loginInputDisable( false ); 
	

	MsgManager.msgAreaShowOpt( "Login with Keycloak success !", { cssClasses: 'notifDark', hideTimeMs: 2000 } );

	KeycloakManager.watchTokenStatus();
}

KeycloakManager.authenticateFailure = function()
{
	KeycloakManager.eventMsg('Login with Keycloak failure.');
}

// ---------------------------------------------------------------------------
// Keycloak token status

KeycloakManager.watchTokenStatus = function()
{
	if( ConnManagerNew.isAppMode_Online() ) // ONLINE
	{
		const accessTokenParsed = KeycloakLSManager.getAccessTokenParsed();
		if( accessTokenParsed != null )
		{
			var accessTokenExpiredSeconds = getTokenExpiredInMiniseconds( accessTokenParsed );
			if( accessTokenExpiredSeconds != undefined && accessTokenExpiredSeconds > 0 )
			{
				accessTokenTimeoutObj = setTimeout(() => {
					KeycloakManager.setUpForm_Online_AccessTokenExpired();
				}, accessTokenExpiredSeconds);
			}
		}
	}
	else // OFFLINE
	{
		KeycloakManager.setForm_Offline();
	}
}


// -------------------------------------------------------------------------------------
// The Main Authentication Call

KeycloakManager.keycloakPart = function()
{
	keycloakMsgTag.html("");
	
	if(ConnManagerNew.isAppMode_Online()) // ONLINE
	{
		KeycloakManager.setForm_Online();
	}
	else // OFFLINE
	{
		KeycloakManager.setForm_Offline();
	}
};

KeycloakLSManager.removeOldVersionData = function()
{
    var accessToken = localStorage.getItem("accessToken");
	if( accessToken != null )
	{
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("idToken");
		localStorage.removeItem("accessTokenParsed");
		localStorage.removeItem("refreshTokenParsed");

		var accessTokenParsed = KeycloakLSManager.decodeToken(accessToken);

		var logoutUrl = accessTokenParsed.iss + "/protocol/openid-connect/logout";
		logoutUrl +=  `?client_id=pwaapp&id_token_hint=${KeycloakLSManager.getIdToken()}&post_logout_redirect_uri=${location.origin}`
		window.location.replace(logoutUrl);
	}
}

// After logout, PWA App is redirected.
// --> The localStorage is removed 
// --> The keycloak is authenticated again.
KeycloakManager.tokenLogout = function() 
{
	KeycloakLSManager.setProcessingAction( KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT );
	var accesstokenParsed = KeycloakLSManager.getAccessTokenParsed();

	// accesstokenParsed.iss : "http://localhost:8080/realms/SWZ_PSI"
	var logoutUrl = accesstokenParsed.iss + "/protocol/openid-connect/logout";
	logoutUrl +=  `?client_id=pwaapp&id_token_hint=${KeycloakLSManager.getIdToken()}&post_logout_redirect_uri=${location.origin}`
	window.location.replace(logoutUrl);

	// let logoutUrl = `${KeycloakManager.KEYCLOAK_SERVER_URL}realms/${KeycloakLSManager.getRealmName()}/protocol/openid-connect/logout`;
	// logoutUrl +=  `?client_id=pwaapp&id_token_hint=${KeycloakLSManager.getIdToken()}&post_logout_redirect_uri=${location.origin}`
	// window.location.replace(logoutUrl);

	// keycloak.logout().then( function() {
	// 	console.log("logout success");
	// })
	// .catch(function( errMsg ) {
		
	// 	console.log("logout fail");
	// 	console.log(errMsg);
	// });


	// if( KeycloakLSManager.getAccessToken() != undefined )
	// {
	// 	KeycloakManager.setKeycloakServerUrl();

	// 	let logoutUrl = `${KeycloakManager.KEYCLOAK_SERVER_URL}realms/${KeycloakLSManager.getRealmName()}/protocol/openid-connect/logout`;
	// 	let url = WsCallManager.localhostProxyCaseHandle(logoutUrl);
	// 	let formData = `client_id=pwaapp&id_token_hint=${KeycloakLSManager.getIdToken()}&post_logout_redirect_uri=${location.origin}`;
	// 	$.ajax({
	// 		url: url,
	// 		type: "POST",
	// 		headers: {
	// 			client_id: "pwaapp",
	// 			refresh_token: KeycloakLSManager.getRefreshToken(),
    //             scope: "openid offline_access"
	// 		},
	// 		 data: formData,
	// 		success: function (response) 
	// 		{
	// 			KeycloakManager.eventMsg("Keycloak logout success");

	// 			if( callFunc ) {
	// 				KeycloakLSManager.localStorageRemove();
	// 				callFunc(true, response);
	// 			}
	// 		},
	// 		error: function ( errMsg ) {
	// 			KeycloakManager.eventMsg("Keycloak logout error");
	// 			KeycloakManager.eventMsg(errMsg);

	// 			if( callFunc ) ( callFunc(false, {msg: errMsg}));
	// 		}
	// 	});
	// }
	// else if( callFunc )
	// {
	// 	callFunc();
	// }
};

KeycloakManager.eventMsg = function(event) {
	console.log(event);
};

KeycloakManager.getUserInfo = function()
{
	var userInfo = { userGroup: [] };

	try
	{
		var idTokenParsed = KeycloakLSManager.getIdTokenParsed();
		if ( idTokenParsed && idTokenParsed.userGroupList )
		{
			userInfo.userGroup = idTokenParsed.userGroupList;
		}
	}
	catch ( errMsg )
	{
		console.log( 'ERROR in KeycloakManager.getLoginInfo, ' + errMsg );
	}

	return userInfo;
};

KeycloakManager.isTokenValid = function()
{
	return ( !KeycloakManager.isAccessTokenExpired() && !KeycloakManager.isRefreshTokenExpired() );
}

KeycloakManager.isAccessTokenExpired = function()
{
	const accessTokenParsed =  KeycloakLSManager.getAccessTokenParsed();
	return checkTokenExpired(accessTokenParsed);
}


KeycloakManager.isRefreshTokenExpired = function()
{
	const refreshTokenParsed =  KeycloakLSManager.getRefreshTokenParsed();
	return checkTokenExpired(refreshTokenParsed);
}


// ====================================================================================================
// Suportive methods - Methods to check the token expires

function checkTokenExpired( tokenParsed ) {
	var expiresIn = getTokenExpiredInMiniseconds( tokenParsed );
	return (expiresIn != undefined ) ? expiresIn <= 0 : false;
};

function getTokenExpiredInMiniseconds( tokenParsed ) {	
	if( tokenParsed['exp'] == undefined )
	{
		return;
	}
	return Math.round((tokenParsed['exp'] - (new Date().getTime() / 1000) + timeSkew)  * 1000 );
};

function clearCheckTokenTimeout()
{
	clearTimeout( accessTokenTimeoutObj );
	clearInterval( offlineExpiredInterval );
}

function calculateOfflineExpiredTime()
{
	return ( new Date().getTime()  - new Date( KeycloakLSManager.getLastLoginDate() ).getTime() ) / Util.MS_SEC;  // Return seconds
}

function formatOfflineExpiredTime()
{
	var diffTimes = calculateOfflineExpiredTime() - KeycloakManager.OFFLINE_TIMEOUT;
	var isExpired = false;
	if( diffTimes >= 0 )
	{
		isExpired = true;
	}

	diffTimes = Math.abs(diffTimes);

	var hours = Math.floor(diffTimes / 3600); // round (down)
	var minutes = Math.floor((diffTimes - (hours * 3600)) / 60); // round (down)
	var seconds = Math.round(diffTimes - (hours * 3600) - (minutes * 60) ); // round (up)

	if (hours   < 10) {hours   = "0" + hours;}
	if (minutes < 10) {minutes = "0" + minutes;}
	if (seconds < 10) {seconds = "0" + seconds;}

	return { isExpired, hh: hours, mm: minutes, ss: seconds, diffInSeconds: diffTimes };
}

// ====================================================================================================
// Suportive methods - Enable/Disable Login form

function enableLoginForm()
{
	// Enable the login form
	$("#loginFormDiv").find(".loginSetPinBtn").on('click').css("background-color", "#F06D24");
	$("#loginFormDiv").find(".loginBtn").on('click').css("background-color", "#F06D24"); 
	Login.loginInputDisable( false ); 
}

function disableLoginForm()
{
	// Disable the login form
	$("#loginFormDiv").find(".loginSetPinBtn").off('click').css("background-color", "#eeeeee");
	$("#loginFormDiv").find(".loginBtn").off('click').css("background-color", "#eeeeee"); 
	Login.loginInputDisable( true ); 
}
