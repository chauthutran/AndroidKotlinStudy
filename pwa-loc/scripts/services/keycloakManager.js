function KeycloakManager() {};


KeycloakManager.OFFLINE_TIMEOUT = 3 * 60; // 3 mins, Overwritten by Config 'offlineTimeoutSec'

KeycloakManager.btnKeyCloakLogOutTag;
KeycloakManager.keycloakMsgTag;
KeycloakManager.dialogTag;

KeycloakManager.keycloakObj;
KeycloakManager.timeSkew = 1;
KeycloakManager.accessTokenTimeoutObj;
KeycloakManager.refreshTokenTimeoutObj;
KeycloakManager.offlineExpiredIntervalObj;

// Flag set when user disabled or session expired.  OfflineTimeExpire checks this to not show msg when this is true.
KeycloakManager._AppBlocked = false; 

// =======================================================================================================
// === NEW KEYCLOAK ============

KeycloakManager.isKeyCloakInUse = function () 
{
	var authChoice = KeycloakLSManager.getAuthChoice();
	return ( authChoice && authChoice.indexOf( 'kc_' ) === 0 ) ? true: false;
};


KeycloakManager.clazzInitialSetup = function()
{
	KeycloakManager.btnKeyCloakLogOutTag = $('#btnKeyCloakLogOut');
	KeycloakManager.keycloakMsgTag = $("#keycloakMsg");
	KeycloakManager.dialogTag = $("#keycloackConfirmDialog");
};


KeycloakManager.getStatusSummary = function()
{
	var statusJson = {};

	statusJson.isAppOnline = ConnManagerNew.isAppMode_Online();

	statusJson.isKeycloakAuth = ( KeycloakLSManager.getAccessToken() ) ? true: false;
	if ( statusJson.isKeycloakAuth )
	{
		statusJson.isAccessTokenExpired = KeycloakManager.isAccessTokenExpired();
		statusJson.isRefreshTokenExpired = KeycloakManager.isRefreshTokenExpired();	
	}
	// TODO: More on above
	
	statusJson.processingAction = KeycloakLSManager.getProcessingAction();

	// TODO: More to think about
	statusJson.isOfflineTimeOut = KeycloakManager.isOfflineTimeout();

	statusJson.isLoggedIn = SessionManager.getLoginStatus();

	return statusJson;
};


KeycloakManager.setUpkeycloakPart = function()
{
	var statusJson = KeycloakManager.getStatusSummary();

	if ( statusJson.isAppOnline ) // Online
	{
		KeycloakManager.setUpOnlineMode();
	}
	else // Offline
	{
		KeycloakManager.setUpOfflineMode();
	}
};



// ---------------------------------------------------------------------------------------------------------
// For ONLINE appMode setup

KeycloakManager.setUpOnlineMode = function()
{
	// Enable the "Keyclock logout" button in the bottom & Set "logout" function for click button
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false);
	KeycloakManager.btnKeyCloakLogOutTag.html("AuthOut").show().off("click").click( () => { 
		KeycloakManager.logout();
	});
	
	var statusJson = KeycloakManager.getStatusSummary();
	if( statusJson.processingAction == KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT 
		|| statusJson.processingAction == KeycloakLSManager.KEY_PROCESSING_ACTION_AUTHENTICATED )
	{
		// Remove tokens and information related
		KeycloakLSManager.authOut_DataRemoval_wtTokens();
		// Authenticate Keycloak
		KeycloakManager.authenticate();
	}
	else if ( !statusJson.isKeycloakAuth ) // 	- If Not Authenticated, We can Authenticate..
	{
		KeycloakManager.authenticate();
	}
	else
	{
		if ( statusJson.isRefreshTokenExpired ) 
		{
			KeycloakManager.authenticateExpired();
		}
		else if ( statusJson.isAccessTokenExpired ) 
		{
			KeycloakManager.renewAccessToken();
		}
		else
		{
			// Start service to check the Access Token and Refresh Token if they expire
			KeycloakManager.restartServiceToCheckTokensExpire();
			KeycloakManager.restartServiceToCheckOfflineTimeout();
		}
	}
}

// KeycloakManager.check_And_Authenticate = function()
// {
// 	var statusJson = KeycloakManager.getStatusSummary();

// 	if ( statusJson.isAppOnline ) // Online
// 	{
// 		// 	- If Not Authenticated, We can Authenticate..
// 		if ( !statusJson.isKeycloakAuth ) KeycloakManager.authenticate();
// 		else
// 		{
// 			if ( statusJson.isRefreshTokenExpired ) KeycloakManager.authenticate();
// 			else if ( statusJson.isAccessTokenExpired ) KeycloakManager.renewAccessToken();
// 		}
// 	}
// 	else // Offline
// 	{
		
// 		// 	- If offline KeyCloak Timeout, log out.
// 		if ( statusJson.isOfflineTimeOut ) 
// 		{
// 			// show msg..
// 			alert( 'Offline Usage Timed Out!!' );

// 			if ( statusJson.isLoggedIn ) SessionManager.cwsRenderObj.logOutProcess();
// 		}
// 	}
// };


// ---------------------------------------------------------------------------------------------------------
// For OFFLINE appMode setup

KeycloakManager.setUpOfflineMode = function()
{
	// Disabled the "Logout button"
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', true);

	// Stop the services to check the Access Token timeout / Refresh Token timeout And Offline timeout
	KeycloakManager.stopServiceToCheckTokensExpire();
	
	var statusSummary = KeycloakManager.getStatusSummary();
	if( statusSummary.isOfflineTimeOut )
	{
		// Show message to force the user to logout
		var msg = "Offline Usage Timed Out.";
		KeycloakManager.keycloakMsgTag.html(msg);
		KeycloakManager.showDialog(msg, SessionManager.cwsRenderObj.logOutProcess );
	}
}


// ---------------------------------------------------------------------------------------------------------
// For User Authenticating

KeycloakManager.authenticate = function()
{
	KeycloakManager.keycloakObj = KeycloakManager.createKeycloakObj();
	KeycloakManager.setUpKeycloakObjEvents(KeycloakManager.keycloakObj);

	// Authenticate
	KeycloakManager.keycloakObj.init({ 
		onLoad: 'login-required', // "check-sso", "login-required"
		checkLoginIframe: false, 
		scope: 'openid offline_access',
		adapter: 'default',
		timeSkew: KeycloakManager.timeSkew
	}).then( function(authenticated) {
		if( !authenticated ) {
			KeycloakManager.authenticateFailure();
		} 
		else {
			KeycloakManager.eventMsg('Authenticated.');

			MsgManager.msgAreaShowOpt( "Login with Keycloak success !", { cssClasses: 'notifDark', hideTimeMs: 2000 } );
			
			// Save the username info..
			var userName = KeycloakManager.keycloakObj.tokenParsed.preferred_username.toUpperCase();
			var preLoginUser = AppInfoLSManager.getUserName();
			if ( userName != preLoginUser ) {
				KeycloakManager.eventMsg("User Changed, Deleting previous user data.");
				
				DataManager2.deleteAllStorageData(function () 
				{
					KeycloakManager.eventMsg( 'User Changed, Deleted previous user data.' ); 
					
					// Save the new username
					AppInfoLSManager.setUserName(userName);
					if ( SessionManager.cwsRenderObj ) SessionManager.cwsRenderObj.loadSavedUserName();

					AppUtil.appReloadWtMsg("User Change - Deleteting previous user data ..");		

					KeycloakManager.authenticateSuccess();

					// We need to run KeycloakManager.authenticate to generate the token in the first time.
					// As soon as we have token we need to call "KeycloakManager.renewAccessToken" to get new access token
					// We need to do it because in some cases, if user is disabled Or session expired, the keycloak.init with 
					// "onLoad: 'login-required'" will reload the browser whenever the onAuthLogout, onAuthRefreshError, onAuthError, ...
					// are called.
					// KeycloakManager.renewAccessToken();
				});
			}
			else
			{
				KeycloakManager.authenticateSuccess();
			}
			
		}
	})
	.catch(function( errMsg ) {
		KeycloakManager.authenticateFailure();
	});
};


KeycloakManager.getKeycloakServerUrl = function()
{
	return (WsCallManager.isLocalDevCase) ? "http://localhost:8080/" : "https://keycloak.psidigital.org/";
}

KeycloakManager.createKeycloakObj = function()
{
	// Set the KeycloakServerUrl
	var keycloackServerUrl = KeycloakManager.getKeycloakServerUrl();

	// Get the realmName
	var realmName = KeycloakLSManager.getAuthChoice().replace("kc_", "").toUpperCase();

	// Create Keycloak Object
	keycloakObj = new Keycloak({
		url: keycloackServerUrl,
		realm: realmName,
		clientId: 'pwaapp'
	});

	return keycloakObj;
}

KeycloakManager.setUpKeycloakObjEvents = function( kcObj ) 
{
    kcObj.onAuthSuccess = () => KeycloakManager.eventMsg('Auth Success');    
    kcObj.onAuthError = () => {
		KeycloakManager.eventMsg("Auth Error");
	}
    kcObj.onAuthRefreshSuccess = () => {
		KeycloakManager.eventMsg('Auth Refresh Success');
	} 
    kcObj.onAuthRefreshError = () => {
		KeycloakManager.eventMsg('Auth Refresh Error');
		// // This function called when the refreshToken expires OR when the user is disabled, ....
		// KeycloakManager.authenticateExpired();
	}
    kcObj.onAuthLogout = () => {
		KeycloakManager.eventMsg('Auth Logout');
		// This function called when the refreshToken expires OR when the user is disabled, ....
		KeycloakManager.authenticateExpired();
	}
    kcObj.onTokenExpired = () => {
		KeycloakManager.eventMsg('Access token expired.');
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


KeycloakManager.authenticateSuccess = function()
{
	// Save tokens in Local Storage
	KeycloakLSManager.setKeycloakInfo( KeycloakManager.keycloakObj );

	// Turn on services to check if the Keycloak Access Token and Refresh Token expire
	KeycloakManager.restartServiceToCheckTokensExpire();

	// Turn on services to check Offline timeout
	KeycloakManager.restartServiceToCheckOfflineTimeout();

	// Enable "Logout button" in the bottom
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false);
}

KeycloakManager.authenticateFailure = function()
{
	KeycloakManager.eventMsg('Login with Keycloak failure.');
}


// ---------------------------------------------------------------------------------------------------------
// Services to check if tokens expire

// For Keycloak Tokens service
KeycloakManager.restartServiceToCheckTokensExpire = function()
{
	// Stop the timeout in case it was started before
	KeycloakManager.stopServiceToCheckTokensExpire();

	// Start service to check the Keycloak token timeout
	var accessTokenParsed = KeycloakLSManager.getAccessTokenParsed();
	var accessTokenExpiredSeconds = KeycloakManager.getTokenExpiredInMiniseconds( accessTokenParsed );
	if( accessTokenExpiredSeconds != undefined && accessTokenExpiredSeconds > 0 )
	{
		KeycloakManager.accessTokenTimeoutObj = setTimeout(() => {
			if( KeycloakManager.isRefreshTokenExpired() ) 
			{
				KeycloakManager.stopServiceToCheckTokensExpire();
				KeycloakManager.authenticateExpired();
			}
			else
			{
				// Renew token
				KeycloakManager.renewAccessToken();
			}
		}, accessTokenExpiredSeconds);
	}


	// Start service to check the Keycloak Refresh Token timeout
	var refreshTokenParsed = KeycloakLSManager.getRefreshTokenParsed();
	var refreshTokenExpiredSeconds = KeycloakManager.getTokenExpiredInMiniseconds( refreshTokenParsed );
	if( refreshTokenExpiredSeconds != undefined && refreshTokenExpiredSeconds > 0 )
	{
		KeycloakManager.refreshTokenTimeoutObj = setTimeout(() => {
			KeycloakManager.stopServiceToCheckTokensExpire();
			KeycloakManager.stopServiceToCheckOfflineTimeOut();
			KeycloakManager.authenticateExpired();
		}, refreshTokenExpiredSeconds);
	}
}

KeycloakManager.stopServiceToCheckTokensExpire = function()
{
	clearTimeout(KeycloakManager.accessTokenTimeoutObj);
	clearTimeout(KeycloakManager.refreshTokenTimeoutObj);
}

// For Offline Timeout service
KeycloakManager.restartServiceToCheckOfflineTimeout = function()
{
	// Stop the service to check Offline Timeout if it is started before
	KeycloakManager.stopServiceToCheckOfflineTimeOut();

	// Start service again
	KeycloakManager.offlineExpiredIntervalObj = setInterval(() => {
		var statusSummary = KeycloakManager.getStatusSummary();
		if( statusSummary.isOfflineTimeOut )
		{
			// Stop the service to check Offline Timeout
			KeycloakManager.stopServiceToCheckOfflineTimeOut();
			
			// Show message and force the user logouts ONLY WHEN the refresh Token doesn't expired / User is not disabled.
			if( !KeycloakManager._AppBlocked )
			{
				var msg = "Offline Usage Timed Out.";
				KeycloakManager.keycloakMsgTag.html(msg);
				if( statusSummary.isLoggedIn )
				{
					KeycloakManager.showDialog(msg, SessionManager.cwsRenderObj.logOutProcess ); // Force the user to logout if the user logged
				}
				else
				{
					KeycloakManager.showDialog(msg); // Just need to show the message when the user in the login page
				}
			}
		}
		else if( !statusSummary.isAppOnline ) // For OFFLINE mode only
		{
			var timeInfo = KeycloakManager.formatOfflineTimeRemains();
			KeycloakManager.keycloakMsgTag.html("Offline Usage time will expire in " + timeInfo.hh + ":" + timeInfo.mm + ":" + timeInfo.ss );
		}
	}, Util.MS_SEC);
}


KeycloakManager.stopServiceToCheckOfflineTimeOut = function()
{
	clearTimeout(KeycloakManager.accessTokenTimeoutObj);
	clearTimeout(KeycloakManager.refreshTokenTimeoutObj);
	clearInterval(KeycloakManager.offlineExpiredIntervalObj);
}

// ==============================================================================
// Renew Access Token

KeycloakManager.renewAccessToken = function()
{
	const accessToken = KeycloakLSManager.getAccessToken();
	const refreshToken = KeycloakLSManager.getRefreshToken();
	const idToken = KeycloakLSManager.getIdToken();

	KeycloakManager.keycloakObj = KeycloakManager.createKeycloakObj();
	KeycloakManager.setUpKeycloakObjEvents(KeycloakManager.keycloakObj);

	KeycloakManager.keycloakObj.init({
		onLoad: "check-sso", // "check-sso", "login-required"
		checkLoginIframe: false,
		token: accessToken,
		refreshToken: refreshToken,
		idToken: idToken,
		timeSkew: KeycloakManager.timeSkew
	}).then(function(authenticated) {
		if( !authenticated ) { // Authenticate failure
			KeycloakManager.eventMsg("Failed to create a new access token.");
			// This case happens because the user is disable, refresh token is not active, ...
			// ==> Ask user to do Keyclock authenticate again
			KeycloakManager.authenticateExpired();
		}
		else {
			KeycloakManager.eventMsg("A new access token is created.");
			KeycloakManager.authenticateSuccess();
		}
	})
	.catch(function( errMsg ) {
		KeycloakManager.eventMsg("Failed to create a new access token.");
		KeycloakManager.authenticateFailure();
	});
};


KeycloakManager.authenticateExpired = function()
{
	var statusSummary = KeycloakManager.getStatusSummary();
	if(statusSummary.processingAction != KeycloakLSManager.KEY_PROCESSING_ACTION_AUTHENTICATED)
	{
		KeycloakLSManager.setProcessingAction( KeycloakLSManager.KEY_PROCESSING_ACTION_AUTHENTICATED );

		// Stop services to check the tokens timeout
		KeycloakManager.stopServiceToCheckTokensExpire();
		KeycloakManager.stopServiceToCheckOfflineTimeOut();
	
		// // Set the "logOut" flag in localStorage
		// KeycloakLSManager.setProcessingAction(KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT);
	
		// Disabled the "Keyclock logout" button in the bottom
		KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', true);
	
		// Show dialog to inform the user and force the user to login to Keycloak again.
		KeycloakManager._AppBlocked = true;
		KeycloakManager.showDialog("User needs to authenticate.", KeycloakManager.authenticate);
	}
}


// ==============================================================================
// Logout

KeycloakManager.checkAuthAndLogoutIfAble = function()
{
	var statusSummary = KeycloakManager.getStatusSummary();
	if( statusSummary.isKeycloakAuth ) KeycloakManager.logout();
}

KeycloakManager.logout = function()
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


// ==============================================================================
// Methods - Checking tokens valid

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


// ==============================================================================
// Methods - Checking Offline time out


KeycloakManager.formatOfflineTimeRemains = function()
{
	var diffTimes = KeycloakManager.calculateOfflineTimeRemains()
	diffTimes = Math.abs(diffTimes);

	var hours = Math.floor(diffTimes / 3600); // round (down)
	var minutes = Math.floor((diffTimes - (hours * 3600)) / 60); // round (down)
	var seconds = Math.round(diffTimes - (hours * 3600) - (minutes * 60) ); // round (up)

	if (hours   < 10) {hours   = "0" + hours;}
	if (minutes < 10) {minutes = "0" + minutes;}
	if (seconds < 10) {seconds = "0" + seconds;}

	return { hh: hours, mm: minutes, ss: seconds, diffInSeconds: diffTimes };
}

KeycloakManager.isOfflineTimeout = function()
{
	return ( KeycloakManager.calculateOfflineTimeRemains() <= 0 );
}

KeycloakManager.calculateOfflineTimeRemains = function()
{
	var diffTimes = ( new Date().getTime()  - new Date( KeycloakLSManager.getLastLoginDate() ).getTime() ) / Util.MS_SEC;  // Return seconds
	return KeycloakManager.OFFLINE_TIMEOUT - diffTimes;
}

// ==============================================================================
// Other methods

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

// ==============================================================================
// Supportive methods

KeycloakManager.eventMsg = function(event) {
	console.log(UtilDate.dateStr("DATETIME")+ ": " + event);
};

KeycloakManager.showDialog = function( msg, okExecFunc )
{
	alert(msg);
	if( okExecFunc ) okExecFunc();
	
	// KeycloakManager.setUpDialog(msg, okExecFunc);
	
	// FormUtil.blockPage();
	// KeycloakManager.dialogTag.show();
}