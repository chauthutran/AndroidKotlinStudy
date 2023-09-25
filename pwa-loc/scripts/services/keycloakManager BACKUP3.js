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
KeycloakManager.renewingAccessToken = false;

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

	statusJson.authAction = KeycloakLSManager.getAutheticationAction();
	
	statusJson.processingAction = KeycloakLSManager.getProcessingAction();

	// TODO: More to think about
	statusJson.isOfflineTimeOut = KeycloakManager.isOfflineTimeout();

	statusJson.isLoggedIn = SessionManager.getLoginStatus();

	return statusJson;
};


KeycloakManager.setUpkeycloakPart = function()
{
	
	KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.setUpkeycloakPart');

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
	// After login this method run first before the KC Object success run.

	// Enable the "Keyclock logout" button in the bottom & Set "logout" function for click button
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false);
	KeycloakManager.btnKeyCloakLogOutTag.html("AuthOut").show().off("click").click( () => { 
		KeycloakManager.logout();
	});

	var statusJson = KeycloakManager.getStatusSummary();
	
	KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.setUpOnlineMode --- ' + JSON.stringify(statusJson));

	if( KeycloakManager.keycloakObj != undefined )
	{
		
		KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.setUpOnlineMode --- token : ' + KeycloakManager.keycloakObj .token );
	}
	else
	{
		KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.setUpOnlineMode --- NO KC obj' );
	}
	// 	- If Not Authenticated, We can Authenticate..
	if ( !statusJson.isKeycloakAuth 
		|| statusJson.processingAction == KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT) 
	{
		
		KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.setUpOnlineMode --- CALL authenticate' );
		KeycloakManager.check_And_Authenticate();
	}
	else
	{
		
		KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.setUpOnlineMode --- CALL renewAccessToken' );
		KeycloakManager.renewAccessToken();
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
	KeycloakManager.keycloakObj = KeycloakManager.createKeycloakObj();
	KeycloakManager.setUpKeycloakObjEvents(KeycloakManager.keycloakObj);

	// KeycloakLSManager.setProcessingAction( KeycloakLSManager.KEY_PROCESSING_ACTION_AUTHENICATING );
	

	// Authenticate
	KeycloakManager.keycloakObj.init({
		onLoad: 'login-required', // "check-sso", "login-required"
		checkLoginIframe: false,
		scope: 'openid offline_access',
		adapter: 'default',
		timeSkew: KeycloakManager.timeSkew
	}).then( function(authenticated) {
		
		KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.authenticate --- RETURN FUNC' );
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
KeycloakManager.errorTriggerCalled = false;

KeycloakManager.setUpKeycloakObjEvents = function( kcObj ) 
{
	// ----------------------
	// Triggers below will RELOAD the browser

    kcObj.onAuthError = () => {
		KeycloakManager.eventMsg("Auth Error");
		KeycloakLSManager.setLastKeycloakEvent("onAuthError");

		if( !KeycloakManager.errorTriggerCalled )
		{
			KeycloakManager.showDialog("User needs to authenticate." );
			KeycloakManager.errorTriggerCalled = true;
		}
	}
	
	// This function called when the refreshToken expires OR when the user is disabled, ....
    kcObj.onAuthRefreshError = () => {
		KeycloakManager.eventMsg('Auth Refresh Error');
		KeycloakLSManager.setLastKeycloakEvent("onAuthRefreshError");

		if( !KeycloakManager.errorTriggerCalled )
		{
			KeycloakManager.showDialog("User needs to authenticate." );
			KeycloakManager.errorTriggerCalled = true;
		}
	}
    kcObj.onAuthLogout = () => {
		KeycloakManager.eventMsg('Auth Logout');
		KeycloakLSManager.setLastKeycloakEvent("onAuthLogout");
		
		if( !KeycloakManager.errorTriggerCalled )
		{
			KeycloakManager.showDialog("User needs to authenticate." );
			KeycloakManager.errorTriggerCalled = true;
		}
	}


	// ----------------------
	// Triggers below will NOT RELOAD the browser

	kcObj.onAuthSuccess = () => {
		KeycloakManager.eventMsg('Auth Success');
		KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.onAuthSuccess' );
	}
    
    kcObj.onAuthRefreshSuccess = () => {
		KeycloakManager.eventMsg('Auth Refresh Success');
				KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.onAuthRefreshSuccess' );
	} 

    kcObj.onTokenExpired = () => {
		KeycloakManager.eventMsg('Access token expired. Creating a new token ...');
		KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.onTokenExpired' );
		
		KeycloakManager.renewAccessToken();
	}

	kcObj.onActionUpdate = function (status) {
		KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.onActionUpdate --- status : ' + status );
		switch (status) {
			case 'success':
				alert('Action completed successfully'); break;
			case 'cancelled':
				alert('Action cancelled by user'); break;
			case 'error':
				alert('Action failed'); break;
		}
	};
};


KeycloakManager.authenticateSuccess = function()
{
	KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.authenticateSuccess' );

	// Save tokens in Local Storage
	KeycloakLSManager.setKeycloakInfo( KeycloakManager.keycloakObj );
	KeycloakLSManager.setProcessingAction("");

	// Turn on services to check Offline timeout
	KeycloakManager.restartServiceToCheckOfflineTimeout();

	// Enable "Logout button" in the bottom
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false);
}

KeycloakManager.authenticateFailure = function()
{
	KeycloakManager.eventMsg('Login with Keycloak failure.');
	KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.authenticateFailure' );

	// Disable "Logout button" in the bottom
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', true);
}

KeycloakManager.check_And_Authenticate = function()
{
	var statusSummary = KeycloakManager.getStatusSummary();

	statusJson.authAction
	if( statusSummary.authAction != undefined )
	{
		var secondsDiff = KeycloakManager.calculateTimeDiff_UntilCurrentDate( KeycloakLSManager.getLastLoginDate() );
		if( secondsDiff >= 60 ) // After 1', allow to authenticate again
		{
			KeycloakLSManager.setProcessingAction("");
			KeycloakManager.setUpkeycloakPart();
		}
		else{
			alert("Please wait to authenticate after 1'");
		}
	}
	else
	{
		KeycloakManager.setUpkeycloakPart();
	}
	
}

// ---------------------------------------------------------------------------------------------------------
// For renew Token

KeycloakManager.renewAccessToken = function()
{
	
	KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.renewAccessToken' );

	// Need to check the flag "KeycloakManager.renewingAccessToken" so that renewing Access Token will not run many timesat the same time
	if( !KeycloakManager.renewingAccessToken )
	{
		KeycloakManager.renewingAccessToken = true;

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
		}).then(function(auth) {
			KeycloakLSManager.setLastKeycloakEvent('KeycloakManager.renewAccessToken - RETURN FUNC' );
			KeycloakManager.renewingAccessToken = false;
			if(auth)
			{
				KeycloakManager.eventMsg("A new access token is created");
				KeycloakManager.authenticateSuccess();
			}
			else
			{
				KeycloakManager.eventMsg("Failed to create a new access token");
				KeycloakManager.check_And_Authenticate();
			}
		})
		.catch(function( errMsg ) {
			KeycloakManager.renewingAccessToken = false;
			KeycloakManager.eventMsg("Failed to create a new access token.");
			if( returnFunc ) returnFunc(false, errMsg);
		});
	}
	
};

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
	if( statusSummary.isKeycloakAuth ) KeycloakManager.logout();
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
	var diffTimes = KeycloakManager.calculateTimeDiff_UntilCurrentDate( KeycloakLSManager.getLastLoginDate() );
	// var diffTimes = ( new Date().getTime()  - new Date( KeycloakLSManager.getLastLoginDate() ).getTime() ) / Util.MS_SEC;  // Return seconds
	return KeycloakManager.OFFLINE_TIMEOUT - diffTimes;
}

KeycloakManager.calculateTimeDiff_UntilCurrentDate = function(dateTime)
{
	var diffTimes = ( new Date().getTime()  - new Date( dateTime ).getTime() ) / Util.MS_SEC;  // Return seconds
	return diffTimes;
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
	if( okExecFunc ) okExecFunc();
}