function KeycloakManager() {};


KeycloakManager.OFFLINE_TIMEOUT = 3 * 60; // 3 mins, Overwritten by Config 'offlineTimeoutSec'
KeycloakManager.RENEW_ACCESS_TOKEN_BEFORE_EXPIRED_TIME = 5; // seconds

KeycloakManager.btnKeyCloakLogOutTag;
KeycloakManager.keycloakMsgTag;
KeycloakManager.dialogTag;

KeycloakManager.keycloakObj;
KeycloakManager.timeSkew = 1;
KeycloakManager.accessTokenTimeoutObj;
KeycloakManager.offlineExpiredIntervalObj;

// Flag set when user disabled or session expired.  OfflineTimeExpire checks this to not show msg when this is true.
KeycloakManager._AppBlocked = false; 
KeycloakManager.errorTriggerCalled = false;
KeycloakManager.processingNewAccessToken = false;


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

	var processingAction = KeycloakLSManager.getProcessingAction();
	statusJson.kcObjCreated = ( KeycloakManager.keycloakObj != undefined );
	statusJson.isLSTokensExisted = ( KeycloakLSManager.getAccessToken() && processingAction != KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT ) ? true: false;

	statusJson.processingAction = processingAction;

	statusJson.isAppOnline = ConnManagerNew.isAppMode_Online();


	// TODO: More to think about
	statusJson.isOfflineTimeOut = KeycloakManager.isOfflineTimeout();

	statusJson.isLoggedIn = SessionManager.getLoginStatus();

	// keycloak information
	statusJson.kc = {
		accessToken: KeycloakLSManager.getAccessToken(),
		accessTokenParsed: KeycloakLSManager.getAccessTokenParsed(),
		accessTokenValidInSeconds: KeycloakManager.calculateTokenExpiredTimeRemains(KeycloakLSManager.getAccessTokenParsed()),

		refreshToken: KeycloakLSManager.getRefreshToken(),
		refreshTokenParsed: KeycloakLSManager.getRefreshTokenParsed(),
		refreshTokenValidInSeconds: KeycloakManager.calculateTokenExpiredTimeRemains(KeycloakLSManager.getRefreshTokenParsed()),

		idToken: KeycloakLSManager.getIdToken(),
		idTokenParsed: KeycloakLSManager.getIdTokenParsed()

	};
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
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false).html("AuthOut").show().off("click").click( () => { 
		KeycloakManager.logout();
	});

	var statusJson = KeycloakManager.getStatusSummary();
	if( !statusJson.kcObjCreated )
	{
		if( statusJson.processingAction == KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT )
		{
			KeycloakManager.authenticate();
		}
		else if ( !statusJson.isLSTokensExisted )
		{
			KeycloakManager.authenticate();
		}
		else 
		{
			KeycloakManager.authenticate_WithToken(function(auth, errMsg) 
			{
				if ( auth ) {
					KeycloakManager.eventMsg('Authenticated and Updated the access token.');
					KeycloakManager.authenticateSuccessActions();
				}
				else 
				{
					KeycloakManager.logout(); // CASES: Disabled User, Session/RefreshToken Expired
				}
			});
		}
	}
}

// ---------------------------------------------------------------------------------------------------------
// For OFFLINE appMode setup

KeycloakManager.setUpOfflineMode = function()
{
	// Disabled the "Logout button"
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', true);
	
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
// For Authenticating

KeycloakManager.authenticate = function()
{
	if( KeycloakManager.keycloakObj == undefined )
	{
		KeycloakManager.keycloakObj = KeycloakManager.createKeycloakObj();
		KeycloakManager.setUpKeycloakObjEvents(KeycloakManager.keycloakObj);

		// Authenticate
		KeycloakManager.keycloakObj.init({ 
			checkLoginIframe: false, 
			scope: 'openid offline_access',
			adapter: 'default',
			timeSkew: KeycloakManager.timeSkew
		}).then( function(authenticated) 
		{
			if( !authenticated ) {
				KeycloakManager.authenticateFailureActions();
				KeycloakManager.keycloakObj.login();
			} 
			else {
				KeycloakManager.eventMsg('Authenticated.');

				MsgManager.msgAreaShowOpt( "Login with Keycloak success !", { cssClasses: 'notifDark', hideTimeMs: 2000 } );
				
				// Save the username info..
				var userName = KeycloakManager.keycloakObj.tokenParsed.preferred_username.toUpperCase();
				var preLoginUser = AppInfoLSManager.getUserName();
				
				if ( preLoginUser != undefined && userName != preLoginUser ) 
				{
					KeycloakManager.authenticateSuccessActions();

					DataManager2.deleteAllStorageData(function () 
					{
						KeycloakManager.eventMsg( 'User Changed, Deleted previous user data.' ); 
						
						// Save the new username
						AppInfoLSManager.setUserName(userName);
						if ( SessionManager.cwsRenderObj ) SessionManager.cwsRenderObj.loadSavedUserName();

						AppUtil.appReloadWtMsg("User Change - Deleteting previous user data ..");
					});
				}
				else
				{
					KeycloakManager.authenticateSuccessActions();

					// Save the new username - in case preLoginUser is undefined
					if ( preLoginUser == undefined ){
						AppInfoLSManager.setUserName(userName);
						if ( SessionManager.cwsRenderObj ) SessionManager.cwsRenderObj.loadSavedUserName();
					}
				}
			}
		})
		.catch(function( errMsg ) {
			KeycloakManager.authenticateFailureActions();
		});
	}
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
    kcObj.onAuthError = () => {
		KeycloakManager.eventMsg("Auth Error");
		KeycloakLSManager.setLastKeycloakEvent("onAuthError");

		if( !KeycloakManager.errorTriggerCalled )
		{
			KeycloakManager.showDialog("User needs to authenticate.", KeycloakManager.logout );
			KeycloakManager.errorTriggerCalled = true;
		}
	}

	
    kcObj.onAuthRefreshError = () => {
		KeycloakManager.eventMsg('Auth Refresh Error');
		KeycloakLSManager.setLastKeycloakEvent("onAuthRefreshError");

		if( !KeycloakManager.errorTriggerCalled )
		{
			KeycloakManager.showDialog("User needs to authenticate.", KeycloakManager.logout );
			KeycloakManager.errorTriggerCalled = true;
		}
	}

	// This trigger is called when the user is disabled OR Session is expired (Token is not active), ....
   kcObj.onAuthLogout = () => {
		KeycloakManager.eventMsg('Auth Logout');
		KeycloakLSManager.setLastKeycloakEvent("onAuthLogout");
		
		if( !KeycloakManager.errorTriggerCalled )
		{
			KeycloakManager.showDialog("User needs to authenticate.", KeycloakManager.logout );
			KeycloakManager.errorTriggerCalled = true;
		}
	}


	// ----------------------------------------

	kcObj.onAuthSuccess = () => {
		KeycloakManager.eventMsg('Auth Success');  
		KeycloakLSManager.setLastKeycloakEvent("onAuthSuccess");
	}  

	kcObj.onAuthRefreshSuccess = () => {
		KeycloakManager.eventMsg('Auth Refresh Success');
		KeycloakLSManager.setLastKeycloakEvent("onAuthRefreshSuccess");
	} 
	
   kcObj.onTokenExpired = () => {
		// It happens when the refresh token expired

		KeycloakManager.eventMsg('Access token expired.');
		KeycloakLSManager.setLastKeycloakEvent("onTokenExpired");
		if( !KeycloakManager.errorTriggerCalled )
		{
			KeycloakManager.showDialog("User needs to authenticate.", KeycloakManager.logout );
			KeycloakManager.errorTriggerCalled = true;
		}
	}
};


KeycloakManager.authenticateSuccessActions = function()
{
	KeycloakLSManager.setLastKeycloakEvent("KeycloakManager.authenticateSuccessActions");
	// Save tokens in Local Storage
	KeycloakLSManager.setKeycloakInfo( KeycloakManager.keycloakObj );

	// Turn on server to update Access Token
	KeycloakManager.restartServiceToUpdateAccessToken();

	// Turn on services to check Offline timeout
	KeycloakManager.restartServiceToCheckOfflineTimeout();

	// Enable "Logout button" in the bottom
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false);
}

KeycloakManager.authenticateFailureActions = function()
{
	KeycloakManager.eventMsg('Login with Keycloak failure.');

	// Disable "Logout button" in the bottom
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', true);
}

// ---------------------------------------------------------------------------------------------------------
// For renew Token

// There is some case, the token expired methods called many times
KeycloakManager.authenticate_WithToken = function(returnFunc)
{
	const accessToken = KeycloakLSManager.getAccessToken();
	const refreshToken = KeycloakLSManager.getRefreshToken();
	const idToken = KeycloakLSManager.getIdToken();

	KeycloakManager.keycloakObj = KeycloakManager.createKeycloakObj();
	KeycloakManager.setUpKeycloakObjEvents(KeycloakManager.keycloakObj);

	KeycloakManager.keycloakObj.init({
		checkLoginIframe: false,
		token: accessToken,
		refreshToken: refreshToken,
		idToken: idToken,
		timeSkew: KeycloakManager.timeSkew
	}).then(function(authenticated) {
		if( returnFunc ) returnFunc(authenticated);
	})
	.catch(function( errMsg ) {
		KeycloakManager.eventMsg("Failed to create a new access token.");
		if( returnFunc ) returnFunc(false, errMsg);
	});
};

KeycloakManager.restartServiceToUpdateAccessToken = function()
{
	// Stop the service to check Offline Timeout if it is started before
	clearTimeout(KeycloakManager.accessTokenTimeoutObj);

	// Start service again
	var statusSummary = KeycloakManager.getStatusSummary();
	var timeoutSeconds = statusSummary.kc.accessTokenValidInSeconds - KeycloakManager.RENEW_ACCESS_TOKEN_BEFORE_EXPIRED_TIME;
	
	if( timeoutSeconds > 0 )
	{
		KeycloakManager.accessTokenTimeoutObj = setTimeout(() => {
			KeycloakManager.updateToken();
		}, timeoutSeconds * 1000);
	}
};

KeycloakManager.updateToken = function()
{
	/*** 
	 * When an access token is re-newed, the expired time of the new access token is calculated based on SHORTER TIME between the Refresh Token expired time
	 * and "Access Token Lifespan". So a re-newed access token is never longer than a Refresh Token
	 *  ==> The trigger "onTokenExpired" will be called when the Refresh Token is expired
	***/
	KeycloakManager.keycloakObj.updateToken(-1).then(function(refreshed) {
		if (refreshed) {
			KeycloakLSManager.setKeycloakInfo( KeycloakManager.keycloakObj );
			KeycloakManager.restartServiceToUpdateAccessToken();
			KeycloakManager.eventMsg("Access token is updated.");
		}
		else
		{
			KeycloakManager.eventMsg("Access token is not updated.");
		}
	}).catch(function(err) {
		KeycloakManager.eventMsg('Failed to update access token');
	});
}

KeycloakManager.calculateTokenExpiredTimeRemains = function(tokenParsed)
{
	if( tokenParsed.exp != undefined )
	{
		return Math.round(tokenParsed.exp + KeycloakManager.timeSkew - new Date().getTime() / 1000); // seconds
	}
	return;
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
	clearInterval(KeycloakManager.offlineExpiredIntervalObj);
}


// ==============================================================================
// Logout

KeycloakManager.checkAuthAndLogoutIfAble = function()
{
	var statusSummary = KeycloakManager.getStatusSummary();
	if( statusSummary.isLSTokensExisted ) KeycloakManager.logout();
}

KeycloakManager.logout = function()
{
	// We shouldn't user the "logout" method what keyclock.js provides
	// --- KeycloakManager.keycloakObj.logout({redirectUri: location.origin}); ---
	// because in some place ( app.js ), we need to logout BUT we don't created Keycloak object 

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
	console.log( UtilDate.dateStr("DATETIME")+ ": " + event );
};

KeycloakManager.showDialog = function( msg, okExecFunc )
{
	alert(msg);
	if( okExecFunc ) okExecFunc();
}