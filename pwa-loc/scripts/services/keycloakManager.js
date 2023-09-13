function KeycloakManager() {};

KeycloakManager.KEYCLOAK_SERVER_URL = "";
KeycloakManager.OFFLINE_TIMEOUT = 10 * 60; // minutes

KeycloakManager.btnKeyCloakLogOutTag;
KeycloakManager.keycloakMsgTag;

KeycloakManager.keycloakObj;
KeycloakManager.timeSkew = 1;
KeycloakManager.accessTokenTimeoutObj;
KeycloakManager.offlineExpiredInterval;


// =======================================================================================================
// === NEW KEYCLOAK ============

KeycloakManager.setKeycloakServerUrl = function()
{
	KeycloakManager.KEYCLOAK_SERVER_URL = (WsCallManager.isLocalDevCase) ? "http://localhost:8080/" : "https://keycloak.psidigital.org/";
}

KeycloakManager.clazzInitialSetup = function()
{
	KeycloakManager.btnKeyCloakLogOutTag = $('#btnKeyCloakLogOut');
	KeycloakManager.keycloakMsgTag = $("#keycloakMsg");

	KeycloakManager.setKeycloakServerUrl();
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

// -------------------------------------------------------------------------------------
// Set up form with Token/Refresh Token status

/*
KeycloakManager.checkAccessTokenStatus( (isValid, ---) => {
	if ( -- ) KeycloakManager.setLoginForm( 'acc' )}
	if ( !isValid ) KeycloakManager.authenticate( );
});
*/


KeycloakManager.setForm_Online = function()
{	
	const processingAction = KeycloakLSManager.getProcessingAction();
	if( processingAction == KeycloakLSManager.KEY_PROCESSING_ACTION_LOGOUT )
	{
		KeycloakLSManager.authOut_DataRemoval_wtTokens();
	}

	const accessToken =  KeycloakLSManager.getAccessToken();
	if( accessToken != undefined )
	{
		if( KeycloakManager.isTokenValid() )
		{
			KeycloakManager.watchTokenStatus_Online();

			// Show the "Keyclock logout" button in the bottom
			KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false);
		}
		else
		{
			clearInterval( KeycloakManager.accessTokenTimeoutObj);
			KeycloakManager.showDialog_Online_AccessTokenExpired();
		}
	}
	else
	{
		KeycloakManager.authenticate(function(auth){
			// Turn on the interval to check the Keycloak access token expired
			KeycloakManager.watchTokenStatus_Online();

			// Show "Logout button" in the bottom
			KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', false);
		});
	}
}

KeycloakManager.setForm_Offline = function()
{	
	const accessToken = KeycloakLSManager.getAccessToken();
	if( accessToken != undefined )
	{
		var offlineExpiredTimeInfo = KeycloakManager.formatOfflineExpiredTime();
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
		// KeycloakManager.showDialog_WithoutButton("Please connect internet to login in the first time.");
		alert("Please connect internet to login in the first time.");
	}
}



KeycloakManager.showDialog_Online_AccessTokenExpired = function()
{
	// Show dialog to inform use that "The keyclock token expired." to force users to login to Keycloak again.
	KeycloakManager.showDialog("The Token is expired. Please login again.", KeycloakManager.tokenLogout());
}

KeycloakManager.setUpForm_Offline_OfflineTimeExpired = function()
{
	clearInterval(KeycloakManager.offlineExpiredInterval);

	// Show, but disabled "Keycloak" buttons related 
	KeycloakManager.btnKeyCloakLogOutTag.prop('disabled', true);

	if( KeycloakManager.isTokenValid())
	{
		KeycloakManager.keycloakMsgTag.html("Offline login time expired.");

		KeycloakManager.eventMsg('Offline login time expired. The expired time is set in ' + (KeycloakManager.OFFLINE_TIMEOUT/60) + ' minutes');
		MsgManager.msgAreaShowOpt( "Offline login time expired. Please login again when it is online.", { cssClasses: 'notifDark', hideTimeMs: 180000 } );	
	}
	else
	{
		KeycloakManager.keycloakMsgTag.html("The keyclock token expired. Please login again when it is online");
	}
}

KeycloakManager.setUpForm_Offline_OfflineTimeValid = function()
{
	clearInterval(KeycloakManager.offlineExpiredInterval);

	KeycloakManager.offlineExpiredInterval = setInterval(() => {
		var timeInfo = KeycloakManager.formatOfflineExpiredTime();
		KeycloakManager.keycloakMsgTag.html("Offline login time will expired in " + timeInfo.hh + ":" + timeInfo.mm + ":" + timeInfo.ss );
	}, Util.MS_SEC);

}

KeycloakManager.showDialog = function( msg, okExecFunc )
{
	alert(msg);
	if( okExecFunc ) okExecFunc();
}

// KeycloakManager.showDialog_WithoutButton = function(msg)
// {
// 	$("#keyclockConfirmMsg").html( msg );

// 	$("#keycloackConfirmDialog").dialog({
// 		closeOnEscape: false,
// 		open: function(event, ui) {
// 			$(".ui-dialog-titlebar-close", ui.dialog || ui).hide();
// 		}
// 	});
// }



// -------------------------------------------------------------------------------------
// Authenticate the keycloak client/Login

KeycloakManager.authenticate = function(successFunc, errorFunc)
{
	KeycloakManager.setKeycloakServerUrl();
	var realName = KeycloakLSManager.getAuthChoice().replace("kc_", "").toUpperCase();
		
	KeycloakManager.keycloakObj =  new Keycloak({
		url: KeycloakManager.KEYCLOAK_SERVER_URL,
		realm: realName,
		clientId: 'pwaapp'
	});

	KeycloakManager.setUpEvents( KeycloakManager.keycloakObj );

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
			KeycloakLSManager.setKeycloakInfo( KeycloakManager.keycloakObj );
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
	var userName = KeycloakManager.keycloakObj.tokenParsed.preferred_username;
	if ( userName ) AppInfoLSManager.setUserName( userName.toUpperCase() );
	if ( SessionManager.cwsRenderObj ) SessionManager.cwsRenderObj.loadSavedUserName();

	// Enable the login form
	$("#loginFormDiv").find(".loginSetPinBtn").on('click').css("background-color", "#F06D24");
	$("#loginFormDiv").find(".loginBtn").on('click').css("background-color", "#F06D24"); 
	Login.loginInputDisable( false ); 
	

	MsgManager.msgAreaShowOpt( "Login with Keycloak success !", { cssClasses: 'notifDark', hideTimeMs: 2000 } );

	KeycloakManager.watchTokenStatus_Online();
}

KeycloakManager.authenticateFailure = function()
{
	KeycloakManager.eventMsg('Login with Keycloak failure.');
}

// ---------------------------------------------------------------------------
// Keycloak token status

KeycloakManager.watchTokenStatus_Online = function()
{
	const accessTokenParsed = KeycloakLSManager.getAccessTokenParsed();
	if( accessTokenParsed != null )
	{
		clearTimeout( KeycloakManager.accessTokenTimeoutObj );

		var accessTokenExpiredSeconds = KeycloakManager.getTokenExpiredInMiniseconds( accessTokenParsed );
		if( accessTokenExpiredSeconds != undefined && accessTokenExpiredSeconds > 0 )
		{
			KeycloakManager.accessTokenTimeoutObj = setTimeout(() => {
				// Show dialog to inform use that "The keyclock token expired." to force users to login to Keycloak again.
				KeycloakManager.showDialog("The Token is expired. Please login again.", KeycloakManager.tokenLogout());
			}, accessTokenExpiredSeconds);
		}
	}
}


// KeycloakManager.watchTokenStatus = function()
// {
// 	KeycloakManager.clearCheckTokenTimeout();

// 	if( ConnManagerNew.isAppMode_Online() ) // ONLINE
// 	{
// 		const accessTokenParsed = KeycloakLSManager.getAccessTokenParsed();
// 		if( accessTokenParsed != null )
// 		{
// 			var accessTokenExpiredSeconds = KeycloakManager.getTokenExpiredInMiniseconds( accessTokenParsed );
// 			if( accessTokenExpiredSeconds != undefined && accessTokenExpiredSeconds > 0 )
// 			{
// 				KeycloakManager.accessTokenTimeoutObj = setTimeout(() => {
// 					KeycloakManager.showDialog_Online_AccessTokenExpired();
// 				}, accessTokenExpiredSeconds);
// 			}
// 		}
// 	}
// 	else // OFFLINE
// 	{
// 		KeycloakManager.setForm_Offline();
// 	}
// }


// -------------------------------------------------------------------------------------
// The Main Authentication Call

KeycloakManager.keycloakPart = function()
{
	KeycloakManager.keycloakMsgTag.html("");
	
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
