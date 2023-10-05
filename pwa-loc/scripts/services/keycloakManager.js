function KeycloakManager() {};

KeycloakManager.OFFLINE_TIMEOUT = 604800; // 7 days: 60 * 60 * 24 * 7, Overwritten by Config 'offlineTimeoutSec'
KeycloakManager.RENEW_ACCESS_TOKEN_BEFORE_EXPIRED_TIME = 5; // seconds

KeycloakManager.btnKeyCloakLogOutTag;
KeycloakManager.keycloakOfflineMsgTag;
KeycloakManager.dialogTag;

KeycloakManager.keycloakObj;
KeycloakManager.timeSkew = 1;
KeycloakManager.accessTokenTimeoutObj;
KeycloakManager.refreshTokenTimeoutObj;
KeycloakManager.offlineExpiredIntervalObj;
KeycloakManager.MAX_fullTimeSEC_SessionToken = 0;

// Flag set when user disabled or session expired.  OfflineTimeExpire checks this to not show msg when this is true.
KeycloakManager._AppBlocked = false; // Obsolete? - since logout process clears the offlineTimeout interval?
KeycloakManager.logoutCalled = false;
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
	KeycloakManager.keycloakOfflineMsgTag = $("#keycloakOfflineMsg");
	KeycloakManager.dialogTag = $("#keycloackConfirmDialog");
};


KeycloakManager.getStatusSummary = function()
{
	var statusJson = {};

	// --- App Status
	statusJson.isAppOnline = ConnManagerNew.isAppMode_Online();
	statusJson.isLoggedIn = SessionManager.getLoginStatus();	

	// --- KeyCloak Status
	statusJson.kcObjCreated = ( KeycloakManager.keycloakObj != undefined );
	statusJson.isLSTokensExisted = ( KeycloakLSManager.getAccessToken() ) ? true: false; // If in process of logout, consider as 'false'

	statusJson.isOfflineTimeOut = KeycloakManager.isOfflineTimeout();

	// keycloak information
	var kc = {
		accessToken: KeycloakLSManager.getAccessToken(),
		accessTokenParsed: KeycloakLSManager.getAccessTokenParsed(),
		accessTokenValidInSeconds: KeycloakManager.calculateTokenExpiredTimeRemains(KeycloakLSManager.getAccessTokenParsed()),

		refreshToken: KeycloakLSManager.getRefreshToken(),
		refreshTokenParsed: KeycloakLSManager.getRefreshTokenParsed(),
		refreshTokenValidInSeconds: KeycloakManager.calculateTokenExpiredTimeRemains(KeycloakLSManager.getRefreshTokenParsed()),

		idToken: KeycloakLSManager.getIdToken(),
		idTokenParsed: KeycloakLSManager.getIdTokenParsed()
	};

	statusJson.kc = kc;

	statusJson.remainTimeSEC_RefreshToken = kc.refreshTokenValidInSeconds;
	statusJson.remainTimeSEC_AccessToken = kc.accessTokenValidInSeconds;
	statusJson.remainTimeSEC_OfflineAccess = KeycloakManager.calculateOfflineTimeRemains();

	statusJson.fullTimeSEC_OfflineAccess = KeycloakManager.OFFLINE_TIMEOUT;
	statusJson.fullTimeSEC_AccessToken = ( kc.accessTokenParsed ) ? kc.accessTokenParsed.exp - kc.accessTokenParsed.iat: 'NA';
	statusJson.fullTimeSEC_SessionToken = ( kc.refreshTokenParsed ) ? kc.refreshTokenParsed.exp - kc.refreshTokenParsed.iat: 'NA';

	if ( statusJson.fullTimeSEC_SessionToken != 'NA' )
	{
		// Due to Session FullTime changing (by accessToken Refresh time?), keep largest value..
		if ( statusJson.fullTimeSEC_SessionToken > KeycloakManager.MAX_fullTimeSEC_SessionToken ) KeycloakManager.MAX_fullTimeSEC_SessionToken = statusJson.fullTimeSEC_SessionToken;
		else statusJson.fullTimeSEC_SessionToken = KeycloakManager.MAX_fullTimeSEC_SessionToken;
	}

	return statusJson;
};


KeycloakManager.setUpkeycloakPart = function()
{
	KeycloakManager.setOfflineTimeOut_FromPersisData();

	var statusJson = KeycloakManager.getStatusSummary();

	if ( statusJson.isAppOnline ) KeycloakManager.onlineAuthCheck();
	else KeycloakManager.offlineAuthCheck();
};


KeycloakManager.setOfflineTimeOut_FromPersisData = function()
{
	try
	{
		var PS_OfflineTimeOut = PersisDataLSManager.getKeyCloakOfflineTimeOut();
		if ( PS_OfflineTimeOut ) KeycloakManager.OFFLINE_TIMEOUT = Number( PS_OfflineTimeOut );	
	}
	catch( errMsg )
	{
		console.log( 'ERROR in KeycloakManager.setOfflineTimeOut_FromPersisData, ' + errMsg );
	}
};

// ---------------------------------------------------------------------------------------------------------
// For ONLINE appMode setup

// 'onlineAuthCheck'?  'authOnlineCheck'?
KeycloakManager.onlineAuthCheck = function()
{
	// Enable the "Keyclock logout" button in the bottom & Set "logout" function for click button
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false).html("AuthOut").show().off("click").click( () => { 
		KeycloakManager.logout();
	});

	// Depending on the status (online), 
	//		If 'kcObjCreated' exists, we assume this went to Offline (& stopped tokenCheckService) & came back to Online.  
	//			Thus, start the token checking service again..
	//		OR perform 'auth' (go to keycloak server page for auth) 
	//		OR 'auth_with existing token'
	//		OR logout <-- last action before page refresh 
	var statusJson = KeycloakManager.getStatusSummary();

	if( statusJson.kcObjCreated ) KeycloakManager.tokenStatusCheckService_Start(); // App mode switchs from OFFLINE to ONLINE
	else
	{
		if ( !statusJson.isLSTokensExisted )
		{
			KeycloakManager.authenticate();
		}
		else 
		{
			KeycloakManager.authenticate_WithToken(function(auth, errMsg) 
			{
				if ( auth ) {
					KeycloakManager.eventMsg('Authenticated and Updated tokens.');
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

// TODO: This need to be called?  logout? <-- This also gets called from network status switch.. as well as App starting point?
// 'offlineAuthCheck'?  'authOfflineCheck'?
KeycloakManager.offlineAuthCheck = function()
{
	// Disabled the "Logout button" - not that important..
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', true);
	
	// Stop service to check offline mode
	KeycloakManager.tokenStatusCheckService_Stop();


	KeycloakManager.offlineTimeOutCheck_Operation();
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
			scope: 'openid', //'openid offline_access',
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

		KeycloakManager.logout( { alertMsg: "User needs to authenticate.", case: "KcEvent_onAuthError" } );
	}

	
    kcObj.onAuthRefreshError = () => {
		KeycloakManager.eventMsg('Auth Refresh Error');
		KeycloakLSManager.setLastKeycloakEvent("onAuthRefreshError");
		
		KeycloakManager.logout( { alertMsg: "User needs to authenticate.", case: "KcEvent_onAuthRefreshError" } );
	}

	// This trigger is called when the user is disabled OR Session is expired (Token is not active), ....
   kcObj.onAuthLogout = () => {
		KeycloakManager.eventMsg('Auth Logout');
		KeycloakLSManager.setLastKeycloakEvent("onAuthLogout");
		
		KeycloakManager.logout( { alertMsg: "User needs to authenticate.", case: "KcEvent_onAuthLogout" } );
	}


	// ----------------------------------------

	kcObj.onAuthSuccess = () => {
		KeycloakManager.eventMsg('Auth Success');  
		KeycloakLSManager.setLastKeycloakEvent("onAuthSuccess");
	}  

	kcObj.onAuthRefreshSuccess = () => {
		//KeycloakManager.eventMsg('Auth Refresh Success - AccessToken Renew');
		KeycloakLSManager.setLastKeycloakEvent("onAuthRefreshSuccess");
	} 
	
   kcObj.onTokenExpired = () => {
		// It happens when the refresh token expired

		KeycloakManager.eventMsg('Access token expired.');
		KeycloakLSManager.setLastKeycloakEvent("onTokenExpired");

		KeycloakManager.logout( { alertMsg: "User needs to authenticate.", case: "KcEvent_onTokenExpired" } );
	}
};


KeycloakManager.authenticateSuccessActions = function()
{
	KeycloakLSManager.setLastKeycloakEvent("KeycloakManager.authenticateSuccessActions");
	// Save tokens in Local Storage
	KeycloakLSManager.setKeycloakInfo( KeycloakManager.keycloakObj );

	// Turn on server to update Access Token
	KeycloakManager.tokenStatusCheckService_Start();

	// Turn on services to check Offline timeout
	KeycloakManager.offlineTimeoutService();

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

KeycloakManager.tokenStatusCheckService_Start = function()
{
	// Stop the service in cases it is started before
	KeycloakManager.tokenStatusCheckService_Stop();

	// ----------------------------------------------------------------------
	// Check and start services
	var statusSummary = KeycloakManager.getStatusSummary();
	var refreshTokenTimeoutSeconds = statusSummary.kc.refreshTokenValidInSeconds;

	// Refresh token is expired ==> Need to logout
	// if( refreshTokenTimeoutSeconds <= 0 ) KeycloakManager.logout( { alertMsg: "User needs to authenticate." } );

	// ?? Above is removed due to conflict with KeyCloak Event & this below TimeOut?
	//		- Need to clearly mention the logic between this timeout & KeyCloak Library Events

	if( refreshTokenTimeoutSeconds > 0 ) 
	{
		// Refresh token service
		KeycloakManager.refreshTokenTimeoutObj = setTimeout(() => {
			KeycloakManager.tokenStatusCheckService_Stop();
			KeycloakManager.logout( { alertMsg: "User needs to authenticate.", case: "AppTimeOut_refreshTokenTimeout" } );
		}, refreshTokenTimeoutSeconds * 1000);
		

		// Access token service
		var accTknTimeoutSeconds = statusSummary.kc.accessTokenValidInSeconds - KeycloakManager.RENEW_ACCESS_TOKEN_BEFORE_EXPIRED_TIME;
		
		if( accTknTimeoutSeconds > 0 )
		{
			KeycloakManager.accessTokenTimeoutObj = setTimeout(() => {
				KeycloakManager.updateToken();
			}, accTknTimeoutSeconds * 1000);
		}
	}

};


KeycloakManager.tokenStatusCheckService_Stop = function()
{
	clearTimeout(KeycloakManager.accessTokenTimeoutObj);
	clearTimeout(KeycloakManager.refreshTokenTimeoutObj);
}

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
			KeycloakManager.tokenStatusCheckService_Start();
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
KeycloakManager.offlineTimeoutService = function()
{
	// Stop the service to check Offline Timeout if it is started before
	KeycloakManager.stopServiceToCheckOfflineTimeOut();

	// Start service again
	KeycloakManager.offlineExpiredIntervalObj = setInterval(() => 
	{
		KeycloakManager.offlineTimeOutCheck_Operation();
	}, Util.MS_SEC * 2 );
};


KeycloakManager.offlineTimeOutCheck_Operation = function()
{
	if ( KeycloakManager.logoutCalled ) console.log( 'logOut Already called case, No need to handle offlineTimeOut operation..' );
	else
	{
		var statusSummary = KeycloakManager.getStatusSummary();
		var timeInfo = KeycloakManager.formatOfflineTimeRemains();
	
		// Set the Offline remaining time on tag & only display it if 'Offline' mode.
		( statusSummary.isAppOnline ) ? KeycloakManager.keycloakOfflineMsgTag.hide() : KeycloakManager.keycloakOfflineMsgTag.show();
		KeycloakManager.keycloakOfflineMsgTag.html( "OFFLINE Expires in " + UtilDate.getTimeStrFormatted( timeInfo.diffInSeconds, { sec: ' second', min: ' minute', hr: ' hour', day: ' day', plural: 's' } ) );
	
		// If offline timed out, Do Action Below:
		//		--> If offline status, show with msg & App LogOut if logged in.
		//		--> If online, do nothing - session would have expired with online check..
		if( statusSummary.isOfflineTimeOut )
		{
			// Stop the service to check Offline Timeout
			KeycloakManager.stopServiceToCheckOfflineTimeOut();
			
			var msg = "Offline Usage Timed Out.";
			KeycloakManager.keycloakOfflineMsgTag.html(msg);
	
			// If 'Online' mode, do nothing.  If 'Offline' mode, show msg & App move to login page.. (logout)
			if ( statusSummary.isAppOnline ) console.log( 'Offline Timed out, but network is online mode.. Do nothing..' );
			else
			{
				KeycloakManager.showDialog( msg );
				if( statusSummary.isLoggedIn ) SessionManager.cwsRenderObj.logOutProcess(); // Force the user to logout if the user logged
			}
		}
	}
};


KeycloakManager.stopServiceToCheckOfflineTimeOut = function()
{
	clearInterval(KeycloakManager.offlineExpiredIntervalObj);
};


// ==============================================================================
// Logout


// TODO: This should be used?
KeycloakManager.checkAuthAndLogoutIfAble = function()
{
	var statusSummary = KeycloakManager.getStatusSummary();
	if( statusSummary.isLSTokensExisted ) KeycloakManager.logout();
}

KeycloakManager.logout = function( option )
{
	var statusSummary = KeycloakManager.getStatusSummary();


	// Only perform this 'Online' mode
	if(statusSummary.isAppOnline )
	{
		if ( !option ) option = {};

		// We shouldn't user the "logout" method what keyclock.js provides
		// --- KeycloakManager.keycloakObj.logout({redirectUri: location.origin}); ---
		// because in some place ( app.js ), we need to logout BUT we don't created Keycloak object 
		if ( option.case ) {
			console.log( option.case );
		}

		
		if ( KeycloakManager.logoutCalled ) console.log( 'logOut Called Already, Preventing Duplicate Calls..' );
		else
		{
			try
			{		
				KeycloakManager.stopServiceToCheckOfflineTimeOut(); // Present Offline Timeout happending while waiting for user to accept the alert msg ..

				KeycloakManager.logoutCalled = true;

				if ( option.alertMsg ) alert( option.alertMsg );		
			
			
				var accesstokenParsed = KeycloakLSManager.getAccessTokenParsed();
			
				if ( accesstokenParsed )
				{ 
			
					var idToken = KeycloakLSManager.getIdToken();
					KeycloakLSManager.authOut_DataRemoval_wtTokens();

					// accesstokenParsed.iss : "http://localhost:8080/realms/SWZ_PSI"
					var logoutUrl = accesstokenParsed.iss + `/protocol/openid-connect/logout?client_id=pwaapp&id_token_hint=${idToken}&post_logout_redirect_uri=${location.origin}`;
					window.location.replace( logoutUrl );
					// window.location.href = 	logoutUrl;
				}
			}
			catch( errMsg ) { console.log( 'ERROR in KeycloakManager.logout, ' + errMsg ); }
		}
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