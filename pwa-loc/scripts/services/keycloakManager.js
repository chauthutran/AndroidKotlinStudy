function KeycloakManager() {};

// NOTE: Manual Offline Expire -->  KeycloakManager.setUpForm_Offline_OfflineTimeExpired();

KeycloakManager.REFRESH_TOKEN_SECOND = 30; // 30s
KeycloakManager.OFFLINE_TIMEOUT = 10 * 60; // 10 mins, Overwritten by Config 'offlineTimeoutSec'

KeycloakManager.btnKeyCloakLogOutTag;
KeycloakManager.keycloakMsgTag;
KeycloakManager.dialogTag;

KeycloakManager.keycloakObj;
KeycloakManager.timeSkew = 1;
KeycloakManager.accessTokenTimeoutObj;
KeycloakManager.refreshTokenTimeoutObj;
KeycloakManager.offlineExpiredInterval;


// =======================================================================================================
// === NEW KEYCLOAK ============

KeycloakManager.isKeyCloakInUse = function () 
{
	var authChoice = KeycloakLSManager.getAuthChoice();
	return ( authChoice && authChoice.indexOf( 'kc_' ) === 0 ) ? true: false;
};


KeycloakManager.getKeycloakServerUrl = function()
{
	return (WsCallManager.isLocalDevCase) ? "http://localhost:8080/" : "https://keycloak.psidigital.org/";
}

KeycloakManager.clazzInitialSetup = function()
{
	KeycloakManager.btnKeyCloakLogOutTag = $('#btnKeyCloakLogOut');
	KeycloakManager.keycloakMsgTag = $("#keycloakMsg");
	KeycloakManager.dialogTag = $("#keycloackConfirmDialog");
};

KeycloakManager.setUpEvents = function( kcObj ) 
{
	KeycloakManager.btnKeyCloakLogOutTag.html("AuthOut").show().off("click").click( () => { 
		KeycloakManager.tokenLogout();
	});

	
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

KeycloakManager.getStatus_AppMode_Token_OfflineTime = function()
{
	var isAppOnline = ConnManagerNew.isAppMode_Online();
	var isLoginPage = !SessionManager.getLoginStatus();

	var isKeycloakAuth = ( KeycloakLSManager.getAccessToken() != undefined ) ? true : false;
	var isAccessTokenValid = ( isKeycloakAuth ) ? !KeycloakManager.isAccessTokenExpired() : undefined;
	var isRefreshTokenValid = ( isKeycloakAuth ) ? !KeycloakManager.isRefreshTokenExpired() : undefined;

	var hasProcessingAction =( KeycloakLSManager.getProcessingAction() != undefined );

	var isOfflineTimeValid = !KeycloakManager.formatOfflineExpiredTime().isExpired;
	

	return{ isAppOnline, isLoginPage, isKeycloakAuth, isAccessTokenValid, isRefreshTokenValid, isOfflineTimeValid, hasProcessingAction };
}

KeycloakManager.updateToken = function()
{
	keycloak.updateToken(30).success(function() {
		loadData();
	}).error(function() {
		alert('Failed to refresh token');
});
}


// -------------------------------------------------------------------------------------
// The Main Authentication Call

KeycloakManager.keycloakPart = function()
{
	KeycloakManager.hideDialog();
	KeycloakManager.keycloakMsgTag.html("");
	
	var status = KeycloakManager.getStatus_AppMode_Token_OfflineTime();
	if(status.isAppOnline) // ONLINE
	{
		KeycloakManager.setLoginForm_Online();
	}
	else // OFFLINE
	{
		KeycloakManager.setLoginForm_Offline();
	}
};


// -------------------------------------------------------------------------------------
// Set up form with Token/Refresh Token status

/*
KeycloakManager.checkAccessTokenStatus( (isValid, ---) => {
	if ( -- ) KeycloakManager.setLoginForm( 'acc' )}
	if ( !isValid ) KeycloakManager.authenticate_WithoutToken( );
});
*/


KeycloakManager.setLoginForm_Online = function()
{	
	clearInterval( KeycloakManager.offlineExpiredInterval );

	var appStatus = KeycloakManager.getStatus_AppMode_Token_OfflineTime();

	if( appStatus.hasProcessingAction )
	{
		// Remove tokens and information related
		KeycloakLSManager.authOut_DataRemoval_wtTokens();

		// Authenticate Keycloak
		KeycloakManager.authenticate_WithoutToken();
	}
	else if( !appStatus.isKeycloakAuth )
	{
		KeycloakManager.authenticate_WithoutToken();
	}
	else
	{
		if( appStatus.isAccessTokenValid && appStatus.isRefreshTokenValid )
		{
			KeycloakManager.restartWatchTokenStatusExpired();

			// Enable the "Keyclock logout" button in the bottom
			KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false);
		}
		else if( !appStatus.isAccessTokenValid && appStatus.isRefreshTokenValid )
		{
			// Clear the checking token timeout
			clearInterval( KeycloakManager.accessTokenTimeoutObj);
			clearInterval( KeycloakManager.refreshTokenTimeoutObj);
			// Create a new token
			KeycloakManager.authenticate_WithToken();
		}
		else
		{
			KeycloakManager.stopWatchTokenStatusExpired_SetUpLoginForm();
		}
	}
}

KeycloakManager.setLoginForm_Offline = function()
{	
	clearTimeout( KeycloakManager.accessTokenTimeoutObj );
	clearTimeout( KeycloakManager.refreshTokenTimeoutObj );

	var appStatus = KeycloakManager.getStatus_AppMode_Token_OfflineTime();
	if( appStatus.isKeycloakAuth )
	{
		if( appStatus.isOfflineTimeValid )
		{
			// Disabled the "Logout button"
			KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', true);
		
			// Start interval time to show the offline expired time left.
			// Also check if the oflline time expires
			KeycloakManager.restartWatchOfflineTimeExpired();
		}
		else
		{
			KeycloakManager.setUpForm_Offline_OfflineTimeExpired();
		}
	}
}



KeycloakManager.restartWatchTokenStatusExpired = function()
{
	// Stop the timeout in case it was started before
	clearTimeout(KeycloakManager.accessTokenTimeoutObj);
	clearTimeout(KeycloakManager.refreshTokenTimeoutObj);

	// Start checking the Keycloak token timeout interval now
	var accessTokenParsed = KeycloakLSManager.getAccessTokenParsed();
	var accessTokenExpiredSeconds = KeycloakManager.getTokenExpiredInMiniseconds( accessTokenParsed );
	if( accessTokenExpiredSeconds != undefined && accessTokenExpiredSeconds > 0 )
	{
		KeycloakManager.accessTokenTimeoutObj = setTimeout(() => {
			// KeycloakManager.stopWatchTokenStatusExpired_SetUpLoginForm();

			clearTimeout(KeycloakManager.accessTokenTimeoutObj);
			clearTimeout(KeycloakManager.refreshTokenTimeoutObj);

			if( KeycloakManager.isRefreshTokenExpired() )
			{
				KeycloakManager.stopWatchTokenStatusExpired_SetUpLoginForm();
			}
			else
			{
				// Create a new token
				KeycloakManager.authenticate_WithToken();
			}
		}, accessTokenExpiredSeconds);
	}

	// Start checking the Keycloak Refresh Token timeout interval now
	var refreshTokenParsed = KeycloakLSManager.getRefreshTokenParsed();
	var refreshTokenExpiredSeconds = KeycloakManager.getTokenExpiredInMiniseconds( refreshTokenParsed );
	if( refreshTokenExpiredSeconds != undefined && refreshTokenExpiredSeconds > 0 )
	{
		KeycloakManager.refreshTokenTimeoutObj = setTimeout(() => {
			KeycloakManager.stopWatchTokenStatusExpired_SetUpLoginForm();
		}, refreshTokenExpiredSeconds);
	}
}

KeycloakManager.stopWatchTokenStatusExpired_SetUpLoginForm = function()
{
	// Clear the checking token timeout
	clearTimeout(KeycloakManager.accessTokenTimeoutObj);
	clearTimeout(KeycloakManager.refreshTokenTimeoutObj);

	// Disabled the "Keyclock logout" button in the bottom
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', true);

	// Show dialog to inform use that "The keyclock token expired." to force users to login to Keycloak again.
	KeycloakManager.showDialog("The sesion is expired. Please login again.", KeycloakManager.tokenLogout);
}

KeycloakManager.restartWatchOfflineTimeExpired = function()
{
	clearInterval( KeycloakManager.offlineExpiredInterval );

	KeycloakManager.offlineExpiredInterval = setInterval(() => {
		var timeInfo = KeycloakManager.formatOfflineExpiredTime();
		if( timeInfo.isExpired )
		{
			KeycloakManager.setUpForm_Offline_OfflineTimeExpired();
		}
		else
		{
			KeycloakManager.keycloakMsgTag.html("Offline login time will expired in " + timeInfo.hh + ":" + timeInfo.mm + ":" + timeInfo.ss );
		}
	}, Util.MS_SEC);
}



KeycloakManager.setUpForm_Offline_OfflineTimeExpired = function()
{ 
	clearInterval(KeycloakManager.offlineExpiredInterval);

	// Show, but disabled "Keycloak" buttons related 
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', true);
			
	// Show message
	var appStatus = KeycloakManager.getStatus_AppMode_Token_OfflineTime();
	var msg = ( appStatus.isAccessTokenValid) ? "Offline login time expired" : "The keyclock token expired. Please login again when it is online";
	KeycloakManager.keycloakMsgTag.html(msg);
	MsgManager.msgAreaShowOpt( msg, { cssClasses: 'notifDark', hideTimeMs: 2000 } );
}

// -------------------------------------------------------------------------------------
// Authenticate the keycloak client/Login

KeycloakManager.createKeycloakObj_Events = function()
{
	// Set the KeycloakServerUrl
	var keycloackServerUrl = KeycloakManager.getKeycloakServerUrl();

	// Get the realmName
	var realmName = KeycloakLSManager.getAuthChoice().replace("kc_", "").toUpperCase();

	// Create Keycloak Object
	KeycloakManager.keycloakObj = new Keycloak({
		url: keycloackServerUrl,
		realm: realmName,
		clientId: 'pwaapp'
	});

	// Set up events for Keycloack Object
	KeycloakManager.setUpEvents( KeycloakManager.keycloakObj );
}

KeycloakManager.authenticate_WithoutToken = function(successFunc, errorFunc)
{
	KeycloakManager.createKeycloakObj_Events();

	// Authenticate
	KeycloakManager.keycloakObj.init({ 
		onLoad: 'login-required', 
		checkLoginIframe: false, 
		scope: 'openid offline_access',
		adapter: 'default',
		timeSkew: KeycloakManager.timeSkew
	}).then( function(authenticated) {
		if( !authenticated ) {
			KeycloakManager.authenticateFailure();
		} 
		else {
			KeycloakManager.authenticateSuccess();

			if( successFunc) successFunc( authenticated );
		}

		// if( successFunc) successFunc( authenticated );
	})
	.catch(function( errMsg ) {
		// This fail because of the "Offline user session not found" ( resfeshToken is expired ).
		// We need to init again without any token in options

		KeycloakManager.authenticateFailure();
		if(errorFunc) errorFunc( errMsg );
	});
}

// use this method for creating new new access token while the refresh token is valid
KeycloakManager.authenticate_WithToken = function(successFunc, errorFunc)
{
	const accessToken = KeycloakLSManager.getAccessToken();
	const refreshToken = KeycloakLSManager.getRefreshToken();
	const idToken = KeycloakLSManager.getIdToken();

	KeycloakManager.createKeycloakObj_Events();

	KeycloakManager.keycloakObj.init({
		onLoad: "login-required", // "check-sso"
		checkLoginIframe: false,
		token: accessToken,
		refreshToken: refreshToken,
		idToken: idToken,
		timeSkew: KeycloakManager.timeSkew
	}).then(function(authenticated) {
		if( !authenticated ) { // Authenticate failure
			KeycloakManager.eventMsg("Fail to create a new access token.");
			KeycloakManager.authenticateFailure();
			if(errorFunc) errorFunc( authenticated );
		}
		else {
			KeycloakManager.eventMsg("A new access token is created.");
			KeycloakManager.authenticateSuccess();
			if( successFunc ) successFunc(authenticated);
		}
	})
	.catch(function( errMsg ) {
		KeycloakManager.eventMsg("Fail to create a new access token.");
		KeycloakManager.authenticateFailure();
		if(errorFunc) errorFunc( errMsg );
	});
}


KeycloakManager.authenticateSuccess = function()
{
	KeycloakManager.eventMsg('Authenticated.');

	// Save tokens in Local Storage
	KeycloakLSManager.setKeycloakInfo( KeycloakManager.keycloakObj );
	// Turn on the interval to check the Keycloak access token expired
	KeycloakManager.restartWatchTokenStatusExpired();

	// Save the username info..
	var userName = KeycloakManager.keycloakObj.tokenParsed.preferred_username;
	if ( userName ) AppInfoLSManager.setUserName( userName.toUpperCase() );
	if ( SessionManager.cwsRenderObj ) SessionManager.cwsRenderObj.loadSavedUserName();

	// Show "Logout button" in the bottom
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false);

	MsgManager.msgAreaShowOpt( "Login with Keycloak success !", { cssClasses: 'notifDark', hideTimeMs: 2000 } );
}

KeycloakManager.authenticateFailure = function()
{
	KeycloakManager.eventMsg('Login with Keycloak failure.');
}


// After logout, PWA App is redirected.
// --> The localStorage is removed 
// --> The keycloak is authenticated again.
KeycloakManager.tokenLogout = function() 
{
	var accesstokenParsed = KeycloakLSManager.getAccessTokenParsed();

	if ( accesstokenParsed )
	{
		KeycloakLSManager.setProcessingAction( KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT );

		// accesstokenParsed.iss : "http://localhost:8080/realms/SWZ_PSI"
		var logoutUrl = accesstokenParsed.iss + "/protocol/openid-connect/logout";
		logoutUrl +=  `?client_id=pwaapp&id_token_hint=${KeycloakLSManager.getIdToken()}&post_logout_redirect_uri=${location.origin}`
		window.location.replace(logoutUrl);	
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
	const accessTokenParsed = KeycloakLSManager.getAccessTokenParsed();
	return KeycloakManager.checkTokenExpired(accessTokenParsed);
}


KeycloakManager.isRefreshTokenExpired = function()
{
	const refreshTokenParsed =  KeycloakLSManager.getRefreshTokenParsed();
	return KeycloakManager.checkTokenExpired(refreshTokenParsed);
}


// ====================================================================================================
// Suportive methods - Methods to check the token expires

KeycloakManager.checkTokenExpired = function( tokenParsed ) {
	var expiresIn = KeycloakManager.getTokenExpiredInMiniseconds( tokenParsed );
	return (expiresIn != undefined ) ? expiresIn <= 0 : false;
};

KeycloakManager.getTokenExpiredInMiniseconds = function( tokenParsed ) 
{
	if( tokenParsed['exp'] == undefined )
	{
		return;
	}
	return Math.round((tokenParsed['exp'] - (new Date().getTime() / 1000) + KeycloakManager.timeSkew)  * 1000 );
};

KeycloakManager.clearCheckTokenTimeout = function()
{
	clearTimeout( KeycloakManager.accessTokenTimeoutObj );
	clearTimeout( KeycloakManager.refreshTokenTimeoutObj );
	clearInterval( KeycloakManager.offlineExpiredInterval );
}

KeycloakManager.calculateOfflineExpiredTime = function()
{
	return ( new Date().getTime()  - new Date( KeycloakLSManager.getLastLoginDate() ).getTime() ) / Util.MS_SEC;  // Return seconds
}

KeycloakManager.formatOfflineExpiredTime = function()
{
	var diffTimes = KeycloakManager.calculateOfflineExpiredTime() - KeycloakManager.OFFLINE_TIMEOUT;
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


KeycloakManager.showDialog = function( msg, okExecFunc )
{
	KeycloakManager.setUpDialog(msg, okExecFunc);
	
	FormUtil.blockPage();
	KeycloakManager.dialogTag.show();
}

KeycloakManager.hideDialog = function()
{
	FormUtil.unblockPage()
	KeycloakManager.dialogTag.hide();
}


KeycloakManager.setUpDialog = function(msg, execFunc)
{
	KeycloakManager.dialogTag.find("#keyclockMsg").html( msg );
	var okBtnTag = KeycloakManager.dialogTag.find("#okBtn");

	if( execFunc )
	{
		okBtnTag.show().off("click").click( () => { 
			execFunc();
		});
	}
	else
	{
		okBtnTag.hide();
	}
	
}
