function KeycloakManager() {};

var keycloak;

// ======================================
// === NEW KEYCLOAK ============

KeycloakManager.startUp = function() 
{
    keycloak = new Keycloak();
    KeycloakManager.setUpEvents( keycloak );
};

KeycloakManager.setUpEvents = function( kcObj ) 
{
    kcObj.onAuthSuccess = () => KeycloakManager.eventMsg('Auth Success');    
    kcObj.onAuthError = (errorData) => KeycloakManager.eventMsg("Auth Error: " + JSON.stringify(errorData) );
    kcObj.onAuthRefreshSuccess = () => KeycloakManager.eventMsg('Auth Refresh Success');    
    kcObj.onAuthRefreshError = () => KeycloakManager.eventMsg('Auth Refresh Error');
    kcObj.onAuthLogout = () => KeycloakManager.eventMsg('Auth Logout');
    kcObj.onTokenExpired = () => KeycloakManager.eventMsg('Access token expired.');
};


KeycloakManager.isKeyCloakInUse = function() 
{
	return ( AppInfoLSManager.getKeyCloakUse() === 'Y' );
};

// -----------------------------------------

// The Main Authentication Call
KeycloakManager.keycloakPart = function() 
{
	const accessToken = localStorage.getItem("accessToken");
	//const accessTokenParsed = localStorage.getItem("accessTokenParsed");
	const refreshToken = localStorage.getItem("refreshToken");
	//const refreshTokenParsed = localStorage.getItem("refreshTokenParsed");
	const idToken = localStorage.getItem("idToken");

	if( ConnManagerNew.isAppMode_Offline()  )
	{
		KeycloakManager.displayTokensInfo();

		// the keycloak initilized here is always failed because the init function needs to be internet online to connect Keycloak server.
		// We need to use this function to parese existing accessToken, refreshToken and idToken to readable data

		if( accessToken == null ) alert( "Please connect internet to login in the first time.");
		else
		{
			keycloak.init({
				promiseType: 'native',
				checkLoginIframe: false,
				token: accessToken,
				refreshToken: refreshToken,
				idToken: idToken,
				timeSkew: 0
			}).then(function(authenticated) {
				console.log( 'authenticated: ', authenticated );
				if( exeFunc ) exeFunc(true);
			})
			.catch(function() {
				var tagStr = '';

				console.log( '[Offline Auth CATCHED]' );

				if( keycloak.isTokenExpired() )
				{
					tagStr = 'The token is expired. Please login again. <br/><input type="button" value="LOGOUT" onclick="KeycloakManager.setPendingAction(\'logoutToken\');" />';
				}
				else // Offline mode cannot refresh token
				{
					// STEP 2A. We come HERE!!
					tagStr = 'Login Success !';
					// tagStr = 'Login Success <input type="button" value="Update Token" onclick="KeycloakManager.setPendingAction(\'refreshToken\')" /><br><input type="button" value="LOGOUT" onclick="KeycloakManager.tokenLogout()" />';
					Login.loginInputDisable( false );  // Start Login?
					console.log( '[OFFLINE KEYCLOAK TOKEN]: ', keycloak.tokenParsed );
				}
	
				MsgManager.msgAreaShowOpt( tagStr, { cssClasses: 'notifGray', hideTimeMs: 180000 } );
	
				KeycloakManager.displayTokensInfo();
			});
		}
	}
	else
	{
		// ONLINE MODE
		if( accessToken != null )
		{
			// STEP 3. AFTER KeyCloak Login SUCCESS and a couple app reload, (with token existing ) it comes here - not right away case after keycloak auth (STEP 2)
			keycloak.init({ 
				onLoad: 'login-required', 
				token: accessToken, 
				refreshToken: refreshToken, 
				idToken: idToken, 
				checkLoginIframe: false, 
				scope: 'openid offline_access',
				adapter: 'default'
			}).then(function(auth) 
			{
				if (!auth) keycloak.login( { scope: 'openid offline_access' } );
				  
				var tagStr = '';

				if( keycloak.isTokenExpired())
				{
					tagStr = 'The token is expired. Please login again. <br/><input type="button" value="LOGOUT" onclick="KeycloakManager.setPendingAction(\'logoutToken\');" />';
				}
				else
				{
					// STEP 2A. We come HERE!!
					tagStr = 'Login Success <input type="button" value="Update Token" onclick="KeycloakManager.setPendingAction(\'refreshToken\');" /><br><input type="button" value="LOGOUT" onclick="KeycloakManager.setPendingAction(\'logoutToken\');" />';
					Login.loginInputDisable( false );		
					
					console.log( '[ONLINE KEYCLOAK TOKEN]: ', keycloak.tokenParsed );
				}

				MsgManager.msgAreaShowOpt( tagStr, { cssClasses: 'notifGray', hideTimeMs: 180000 } );

				KeycloakManager.displayTokensInfo();	

				if( KeycloakManager.getPendingAction() == "refreshToken" )
				{
					KeycloakManager.tokenRefresh();
				}
				else if( KeycloakManager.getPendingAction() == "logoutToken" )
				{
					KeycloakManager.tokenLogout();
				}
			})
			.catch(function() {
				console.log('failed to initialize with token');
			});
		}
		else
		{
			// STEP 1. KeyCloak Login 1st Time HERE!!
			//		+ STEP 2. After redirect from KeyCloak Auth, we come here.
			keycloak.init({ 
				onLoad: 'login-required', 
				checkLoginIframe: false, 
				scope: 'openid offline_access',
				adapter: 'default'
			}).then( function() {
				localStorage.setItem("accessToken", keycloak.token);
				//localStorage.setItem("accessTokenParsed", JSON.stringify(keycloak.tokenParsed));
				localStorage.setItem("refreshToken",keycloak.refreshToken);
				//localStorage.setItem("refreshTokenParsed", JSON.stringify(keycloak.refreshTokenParsed));
				localStorage.setItem("idToken", keycloak.idToken);

				KeycloakManager.displayTokensInfo();

				//document.getElementById("placeholder1").innerHTML = '<input type="button" value="Update Token" onclick="KeycloakManager.tokenRefresh()" /><br><input type="button" value="LOGOUT" onclick="KeycloakManager.tokenLogout()" />';
				var tagStr = '<input type="button" value="Update Token" onclick="KeycloakManager.setPendingAction(\'refreshToken\');" /><br><input type="button" value="LOGOUT" onclick="KeycloakManager.setPendingAction(\'logoutToken\');" />';
				MsgManager.msgAreaShowOpt( tagStr, { cssClasses: 'notifGray', hideTimeMs: 180000 } );

				// W_STEP 1. Save the username info..
				var userName = keycloak.tokenParsed.preferred_username;
				if ( userName ) AppInfoLSManager.setUserName( userName.toUpperCase() );
				if ( SessionManager.cwsRenderObj ) SessionManager.cwsRenderObj.loadSavedUserName();
				//AppUtil.appReloadWtMsg();

				Login.loginInputDisable( false );
				

				if( KeycloakManager.getPendingAction() == "refreshToken" )
				{
					KeycloakManager.tokenRefresh();
				}
				else if( KeycloakManager.getPendingAction() == "logoutToken" )
				{
					KeycloakManager.tokenLogout();
				}
			})
			.catch(function( errMsg ) {
				alert('failed to initialize');
				console( errMsg );
			});
		}
	}
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

KeycloakManager.displayTokensInfo = function()
{
	var infoStr = '';

	var logOutTag = $( '#btnKeyCloakLogOut' );
	logOutTag.hide().off( 'click' );

	const accessToken = localStorage.getItem("accessToken");
	const refreshToken = localStorage.getItem("refreshToken");
	const idToken = localStorage.getItem("idToken");

	if ( accessToken ) {
		infoStr += ' [AC_TKN: ' + Util.getStr( accessToken, 4 ) + '] ';
	}
	if ( refreshToken ) {
		infoStr += ' [RF_TKN: ' + Util.getStr( refreshToken, 4 ) + '] ';
	}
	if ( idToken ) {
		infoStr += ' [ID_TKN: ' + Util.getStr( idToken, 4 ) + '] ';
	}
	

	$( '#divTokenInfo' ).text( infoStr );

	if ( accessToken ) logOutTag.show().click( () => { KeycloakManager.setPendingAction("logoutToken"); });
};

// TODO: MOVE THEM TO OTHER PLACE --- CALLED FROM index.html
KeycloakManager.tokenRefresh = function() {
	
	keycloak.updateToken(-1)
	.then(function(refreshed){
		
		if (refreshed) {
			console.debug(`Dashboard access-token refreshed`);
			console.log("========= accessToken : " ); 
			//console.log(keycloak.token); 
			const leftSeconds = keycloak.tokenParsed.exp - new Date().getTime() / 1000;
			console.log("leftSeconds : " + leftSeconds); 

			localStorage.setItem("accessToken", keycloak.token); 
		} else {
			console.log(`Dashboard refresh-token refreshed`);
			console.log("========= refreshToken : " ); 
			//console.log(keycloak.refreshToken); 

			localStorage.setItem("refreshToken", keycloak.refreshToken); 
		}
		
		localStorage.removeItem("keycloakPendingAction");
	}).catch(() => {
		alert('Failed to refresh the token, or the session has expired');
	});

	
};


// http://127.0.0.1:8887/logout.html
// https://pwa-stage.psi-connect.org/logout.html
KeycloakManager.tokenLogout = function() {
	
	// KeycloakManager.displayTokensInfo(); // TODO: Or, after logOut, we can set to reload the app?

	if( !ConnManagerNew.isAppMode_Offline()  )
	{
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("idToken");
		localStorage.removeItem("keycloakPendingAction");
		keycloak.logout({"redirectUri": window.location.href + "logout.html"});
			
	}

	//keycloak.logout( { "redirectUri": window.location.href } ); // "http://127.0.0.1:8887/" } );
};
/*
KeycloakManager.tokenLogout = function() 
{
	if( ConnManagerNew.isAppMode_Offline() ) KeycloakManager.localStorageRemove();
	else
	{
		//keycloak.logout( { redirectUri : window.location.href + "logout.html"});
		keycloak.logout( { redirectUri : window.location.href + '?msg=keycloak_loggedOut' } ).then((success) => 
		{
			// TODO: Otherwise, pass the removal in param
			KeycloakManager.localStorageRemove();

			console.log("--> KeyCloak: logout success ", success );
		}).catch((error) => {
			console.log("--> KeyCloak: logout error ", error );
		});
	}

	//keycloak.logout( { "redirectUri": window.location.href } ); // "http://127.0.0.1:8887/" } );
};
*/


KeycloakManager.localStorageRemove = function() {
	localStorage.removeItem("accessToken");
	//localStorage.removeItem("accessTokenParsed");
	localStorage.removeItem("refreshToken");
	//localStorage.removeItem("refreshTokenParsed");
	localStorage.removeItem("idToken");
	
	KeycloakManager.displayTokensInfo(); // TODO: Or, after logOut, we can set to reload the app?
};


KeycloakManager.eventMsg = function(event) {
	// var e = document.getElementById('events').innerHTML;
	// document.getElementById('events').innerHTML = new Date().toLocaleString() + "\t" + event + "\n" + e;
	console.log(event);
};


// ==================================

KeycloakManager.isExpired = function( tokenInfo )
{
    const parsedTokenData = JSON.parse( tokenInfo );
    const leftSeconds = parsedTokenData.exp - new Date().getTime() / 1000;
	return (leftSeconds <= 0) // Token Expired
};
