function KeycloakManager() {};

KeycloakManager.startedUp = false;
var OFFLINE_TIMEOUT = 10 * 60; // minutes

var keycloak;
var btnKeyCloakLogOutTag;
var btnKeyCloakLogInInFormTag;
var keycloakMsgTag;
var timeSkew = 1;
var accessTokenTimeoutObj;
var refreshTokenTimeoutObj;
var offlineExpiredInterval;

var processingTask = "";

	
// ======================================
// === NEW KEYCLOAK ============

KeycloakManager.startUp = function(realName) 
{
	btnKeyCloakLogOutTag = $('#btnKeyCloakLogOut');
	btnKeyCloakLogInInFormTag = $("#btnKeyCloakLogInInForm");
	keycloakMsgTag = $("#keycloakMsg");
	clearCheckTokenTimeout();

	realName = (realName) ? realName : AppInfoLSManager.getAuthChoice();
	if( realName )
	{
		var url = (WsCallManager.isLocalDevCase) ? "http://localhost:8080/" : "https://keycloak.psidigital.org/";
		
		realName = realName.replace("kc_", "").toUpperCase();
		
		keycloak =  new Keycloak({
			url: url, //'http://localhost:8080/',
			realm: realName,
			clientId: 'pwaapp'
		});

    	KeycloakManager.setUpEvents( keycloak );

		KeycloakManager.startedUp = true;
	}
};

KeycloakManager.setUpEvents = function( kcObj ) 
{
    kcObj.onAuthSuccess = () => KeycloakManager.eventMsg('Auth Success');    
    kcObj.onAuthError = (errorData) => KeycloakManager.eventMsg("Auth Error: " + JSON.stringify(errorData) );
    kcObj.onAuthRefreshSuccess = () => {
		KeycloakManager.eventMsg('Auth Refresh Success');
		// localStorage.setItem("accessToken", keycloak.token);
		// localStorage.setItem("refreshToken", keycloak.refreshToken);
		// localStorage.setItem("idToken", keycloak.idToken);
		// localStorage.setItem("accessTokenParsed", JSON.stringify(keycloak.tokenParsed)); 
		// localStorage.setItem("realmName", keycloak.realm);
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
		if( processingTask == "initWithToken" )
		{
			KeycloakManager.initWithoutToken();
		}
	}
};

// -------------------------------------------------------------------------------------
// Authenticate keycloak

KeycloakManager.authenticateUser = function()
{
	// Set the LastOnline Date whenever the app is online.

	const accessToken =  KeycloakLSManager.getAccessToken();

	if( accessToken != null )
	{
		KeycloakManager.watchTokenStatus();

		if( KeycloakManager.isTokenValid() )
		{
			// Enable the login form
			$("#loginFormDiv").find(".loginSetPinBtn").on('click').css("background-color", "#F06D24");
			$("#loginFormDiv").find(".loginBtn").on('click').css("background-color", "#F06D24"); 
			Login.loginInputDisable( false ); 

			// Hide Login button in the Login form
			btnKeyCloakLogInInFormTag.hide();

			if( keycloak.token == undefined ) // not authenticate yet
			{
				// Show "Logout button" in the bottom
				btnKeyCloakLogOutTag.html("Logout").show().off("click").click( () => { 
					KeycloakManager.initWithToken( function(auth){
						KeycloakManager.tokenLogout();
						if(successFunc) successFunc(auth);
					});
				});
			}
			else
			{
				// Show "Logout button" in the bottom
				btnKeyCloakLogOutTag.html("Logout").show().off("click").click( () => { 
					KeycloakManager.tokenLogout();
				});
			}
		}
		else
		{
			KeycloakManager.setForm_TokenExpired();
		}
	}
	else
	{
		KeycloakManager.initWithoutToken(function(auth){
			// Show "Logout button" in the bottom
			btnKeyCloakLogOutTag.html("Logout").show().off("click").click( () => { 
				KeycloakManager.tokenLogout();
			});
		});
	}
	
}

KeycloakManager.authenticateWhenAccessTokenExpired = function()
{
	if( keycloak.token == undefined ) // not authenticate yet
	{
		// Show "Login button" in the Login form
		btnKeyCloakLogInInFormTag.css("background-color", "#008000").off("click").click( () => { 
			processingTask = "initWithToken";
			KeycloakManager.initWithToken(function(){KeycloakManager.tokenLogout();});
		});

		// Show "Login button" in the bottom
		btnKeyCloakLogOutTag.html("Login").off("click").click( () => {
			processingTask = "initWithToken"; 
			KeycloakManager.initWithToken(function(){KeycloakManager.tokenLogout();});
		});
	}
	else
	{
		// Show "Login button" in the Login form
		btnKeyCloakLogInInFormTag.css("background-color", "#008000").off("click").click( () => { 
			KeycloakManager.tokenLogout();
		});

		// Show "Login button" in the bottom
		btnKeyCloakLogOutTag.html("Login").off("click").click( () => { 
			KeycloakManager.tokenLogout();
		});
	}

	btnKeyCloakLogInInFormTag.show();
	btnKeyCloakLogOutTag.show();
}

KeycloakManager.authenticateWhenRefreshTokenExpired = function()
{
	// Show "Login button" in the Login form
	btnKeyCloakLogInInFormTag.css("background-color", "#008000").show().off("click").click( () => { 
		KeycloakLSManager.localStorageRemove();
		KeycloakManager.initWithoutToken();
	});

	// Show "Login button" in the bottom
	btnKeyCloakLogOutTag.html("Login").show().off("click").click( () => { 
		KeycloakLSManager.localStorageRemove();
		KeycloakManager.initWithoutToken();
	});
}

KeycloakManager.initWithoutToken = function(successFunc, errorFunc)
{
	keycloak.init({ 
		onLoad: 'login-required', 
		checkLoginIframe: false, 
		scope: 'openid offline_access',
		adapter: 'default',
		timeSkew: timeSkew
	}).then( function(authenticated) {
		if( !authenticated ) {
			KeycloakManager.setForm_InitFail();
		} 
		else {
			// KeycloakLSManager.setLastLoginDate(UtilDate.dateStr( "DATETIME" ));
			// localStorage.setItem("accessToken", keycloak.token);
			// localStorage.setItem("refreshToken", keycloak.refreshToken);
			// localStorage.setItem("idToken", keycloak.idToken);
			// localStorage.setItem("accessTokenParsed", JSON.stringify(keycloak.tokenParsed));
			// localStorage.setItem("refreshTokenParsed", JSON.stringify(keycloak.refreshTokenParsed));
			KeycloakLSManager.setKeycloakInfo( keycloak );
			
			KeycloakManager.setForm_InitSuccess();
		}

		if( successFunc) successFunc( authenticated );
	})
	.catch(function( errMsg ) {
		// This fail because of the "Offline user session not found" ( resfeshToken is expired ).
		// We need to init again without any token in options

		KeycloakManager.setForm_InitFail();
		if(errorFunc) errorFunc( errMsg );
	});
}

KeycloakManager.initWithToken = function(successFunc, errorFunc)
{
	const accessToken = KeycloakLSManager.getAccessToken();
	const refreshToken = KeycloakLSManager.getRefreshToken();
	const idToken = KeycloakLSManager.getIdToken();

	keycloak.init({
		onLoad: "login-required",
		checkLoginIframe: false,
		token: accessToken,
		refreshToken: refreshToken,
		idToken: idToken,
		timeSkew: timeSkew
	}).then(function(authenticated) {
		console.log( 'authenticated: ', authenticated );
		if( !authenticated ) {
			KeycloakManager.setForm_InitFail();
		}
		else {
			KeycloakManager.setForm_InitSuccess();
		}

		if( successFunc) successFunc( authenticated );
	})
	.catch(function( errMsg ) {
		KeycloakManager.setForm_InitFail();
		if(errorFunc) errorFunc( errMsg );
	});
}

// ---------------------------------------------------------------------------
// Keycloak token status

KeycloakManager.watchTokenStatus = function()
{
	if( ConnManagerNew.isAppMode_Online() ) // ONLINE
	{
		const accessTokenParsed = KeycloakLSManager.getAccessTokenParsed();
		// const refreshTokenParsed = KeycloakLSManager.getRefreshTokenParsed();
		if( accessTokenParsed != null )
		{
			var accessTokenExpiredSeconds = getTokenExpiredInMiniseconds( accessTokenParsed );
			if( accessTokenExpiredSeconds > 0 )
			{
				accessTokenTimeoutObj = setTimeout(() => {
					KeycloakManager.setForm_TokenExpired();
				}, accessTokenExpiredSeconds);
			}

			// var refreshTokenExpiredSeconds = getTokenExpiredInMiniseconds( refreshTokenParsed );
			// if( accessTokenExpiredSeconds > 0 )
			// {
			// 	refreshTokenTimeoutObj = setTimeout(() => {
			// 		KeycloakManager.setForm_TokenExpired();
			// 	}, refreshTokenExpiredSeconds);
			// }
		}
	}
	else // OFFLINE
	{
		KeycloakManager.setForm_Offline();
	}
}

KeycloakManager.setForm_TokenExpired = function()
{
	KeycloakManager.eventMsg('Access token expired.');

	// Show/Hide the buttons
	if( ConnManagerNew.isAppMode_Offline() ) 
	{
		// Enable the login form
		$("#loginFormDiv").find(".loginSetPinBtn").on('click').css("background-color", "#F06D24");
		$("#loginFormDiv").find(".loginBtn").on('click').css("background-color", "#F06D24"); 
		Login.loginInputDisable( false ); 

		// Show, but disabled "Keycloak" buttons related 
		btnKeyCloakLogInInFormTag.show().off('click').css("background-color", "#eeeeee");
		btnKeyCloakLogOutTag.show().off('click').css("background-color", "#eeeeee");

		KeycloakManager.eventMsg('Offline login time is expired. The expired time is set in ' + (OFFLINE_TIMEOUT/60) + ' minutes');
		keycloakMsgTag.html("(Offline login time is expired.)");
		MsgManager.msgAreaShowOpt( "Offline login time is expired. Please login again when it is online.", { cssClasses: 'notifDark', hideTimeMs: 180000 } );	
	}
	else
	{
		// Disabled the login form
		$("#loginFormDiv").find(".loginSetPinBtn").off('click').css("background-color", "#eeeeee");
		$("#loginFormDiv").find(".loginBtn").off('click').css("background-color", "#eeeeee"); 
		Login.loginInputDisable( true ); 
		
		// // Show Login and Logout buttons
		if( KeycloakManager.isAccessTokenExpired())
		{
			KeycloakManager.authenticateWhenRefreshTokenExpired();
			KeycloakManager.eventMsg("Access Token is expired.");
		}

		// if( KeycloakManager.isAccessTokenExpired() && !KeycloakManager.isRefreshTokenExpired())
		// {
		// 	KeycloakManager.authenticateWhenAccessTokenExpired();
		// 	KeycloakManager.eventMsg("Access Token is expired.");
		// }
		// else if( KeycloakManager.isAccessTokenExpired() && KeycloakManager.isRefreshTokenExpired())
		// {		
		// 	KeycloakManager.authenticateWhenRefreshTokenExpired();
		// 	KeycloakManager.eventMsg( "RefreshToken is expired. Please login again.");
		// }

		keycloakMsgTag.html("(Token is expired. Please login again.)");
		MsgManager.msgAreaShowOpt( "Token is expired. Please login again.", { cssClasses: 'notifDark', hideTimeMs: 180000 } );
	}
	
}

KeycloakManager.setForm_InitSuccess = function()
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
	

	MsgManager.msgAreaShowOpt( "Login with Keycloak success !", { cssClasses: 'notifDark', hideTimeMs: 180000 } );

	KeycloakManager.watchTokenStatus();
}

KeycloakManager.setForm_InitFail = function()
{
	KeycloakManager.eventMsg('Login with Keycloak failure.');
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
	btnKeyCloakLogInInFormTag.hide();
}

KeycloakManager.setForm_Offline = function()
{	
	clearInterval(offlineExpiredInterval);
	
	const accessToken = KeycloakLSManager.getAccessToken();
	if( accessToken != null )
	{
		var offlineExpiredTimeInfo = KeycloakManager.formatOfflineExpiredTime();
		if( offlineExpiredTimeInfo.isExpired )
		{
			if( !KeycloakManager.isTokenValid())
			{
				KeycloakManager.setForm_TokenExpired();
			}
			else
			{
				// Enable the login form
				$("#loginFormDiv").find(".loginSetPinBtn").on('click').css("background-color", "#F06D24");
				$("#loginFormDiv").find(".loginBtn").on('click').css("background-color", "#F06D24"); 
				Login.loginInputDisable( false ); 

				// Show, but disabled "Keycloak" buttons related 
				btnKeyCloakLogInInFormTag.show().off('click').css("background-color", "#eeeeee");
				btnKeyCloakLogOutTag.show().off('click').css("background-color", "#eeeeee");

				keycloakMsgTag.html("(Offline login time expired)");
			}
		}
		else
		{
			// Enable the login form
			$("#loginFormDiv").find(".loginSetPinBtn").on('click').css("background-color", "#F06D24");
			$("#loginFormDiv").find(".loginBtn").on('click').css("background-color", "#F06D24"); 
			Login.loginInputDisable( false ); 
			
			// Hide "Keycloak" buttons related 
			btnKeyCloakLogInInFormTag.hide();
			btnKeyCloakLogInInFormTag.hide();

			offlineExpiredInterval = setInterval(() => {
				var timeInfo = KeycloakManager.formatOfflineExpiredTime();
				keycloakMsgTag.html("(Offline login time will expired in " + timeInfo.hh + ":" + timeInfo.mm + ":" + timeInfo.ss + ")" );

				KeycloakManager.setForm_Offline();
			}, Util.MS_SEC);

			keycloakMsgTag.html("(Offline login time will expired in " + offlineExpiredTimeInfo.hh + ":" + offlineExpiredTimeInfo.mm + ":" + offlineExpiredTimeInfo.ss + ")" );
		}
	}
	else
	{
		KeycloakManager.setForm_DisabledAll("Please connect internet to login in the first time");
	}
}

// -------------------------------------------------------------------------------------
// The Main Authentication Call

KeycloakManager.keycloakPart = function(execFunc)
{
	keycloakMsgTag.html("");
	
	if(!ConnManagerNew.isAppMode_Offline()) // ONLINE
	{
		KeycloakManager.authenticateUser();
	}
	else // OFFLINE
	{
		KeycloakManager.setForm_Offline();
	}
};

// http://127.0.0.1:8887/logout.html
// https://pwa-stage.psi-connect.org/logout.html
KeycloakManager.tokenLogout = function( callFunc ) 
{
	try
	{
		if( !ConnManagerNew.isAppMode_Offline()  )
		{
			KeycloakLSManager.localStorageRemove();
	
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


KeycloakManager.isTokenValid = function()
{
	return (!KeycloakManager.isAccessTokenExpired());
	// return ( !KeycloakManager.isAccessTokenExpired() && !KeycloakManager.isRefreshTokenExpired() );
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

function checkTokenExpired( tokenParsed ) {
	var expiresIn = getTokenExpiredInMiniseconds( tokenParsed );
	return expiresIn <= 0;
};

function getTokenExpiredInMiniseconds( tokenParsed ) {	
	tokenParsed = JSON.parse( tokenParsed );
	return Math.round((tokenParsed['exp'] - (new Date().getTime() / 1000) + timeSkew)  * 1000 );
};

function clearCheckTokenTimeout()
{
	clearTimeout( accessTokenTimeoutObj );
	// clearTimeout( refreshTokenTimeoutObj );
	clearInterval( offlineExpiredInterval );
}

// =======================================================================================
// Suportive methods

function calculateOfflineExpiredTime()
{
	return ( new Date().getTime()  - new Date( KeycloakLSManager.getLastLoginDate() ).getTime() ) / Util.MS_SEC;  // Return seconds
}

KeycloakManager.formatOfflineExpiredTime = function()
{
	var diffTimes = calculateOfflineExpiredTime() - OFFLINE_TIMEOUT;
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

KeycloakManager.checkTokenAndLogin = function()
{
	KeycloakLSManager.localStorageRemove();
	// var accessToken = localStorage.getItem("accessToken");
	// if( accessToken != null )
	// {
	// 	if( KeycloakManager.isTokenExpired() )
	// 	{
	// 		KeycloakLSManager.localStorageRemove();

	// 		KeycloakManager.startUp();
	// 		KeycloakManager.initWithoutToken();
	// 		KeycloakManager.keycloakPart();
	// 	}
	// 	else
	// 	{
	// 		var realmName = localStorage.getItem("realmName");
	// 		KeycloakManager.startUp(realmName);
	// 		KeycloakManager.initWithToken(function(){
	// 			KeycloakManager.tokenLogout();
	// 		});
	// 	}
	// }
	// else
	// {
	// 	KeycloakManager.startUp();	
	// 	KeycloakManager.initWithoutToken();
	// 	KeycloakManager.keycloakPart();
	// }
}
