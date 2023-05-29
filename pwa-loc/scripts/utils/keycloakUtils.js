function KeycloakUtils() {};

var keycloak;

// ======================================
// === NEW KEYCLOAK ============

// zw_test_ipc  / 1234

KeycloakUtils.startUp = function() 
{
    keycloak = new Keycloak();
    KeycloakUtils.setUpEvents( keycloak );
};

KeycloakUtils.setUpEvents = function( kcObj ) 
{
    kcObj.onAuthSuccess = () => KeycloakUtils.event('Auth Success');    
    kcObj.onAuthError = (errorData) => KeycloakUtils.event("Auth Error: " + JSON.stringify(errorData) );
    kcObj.onAuthRefreshSuccess = () => KeycloakUtils.event('Auth Refresh Success');    
    kcObj.onAuthRefreshError = () => KeycloakUtils.event('Auth Refresh Error');
    kcObj.onAuthLogout = () => KeycloakUtils.event('Auth Logout');
    kcObj.onTokenExpired = () => KeycloakUtils.event('Access token expired.');
};

KeycloakUtils.keycloakPart = function() 
{
	const accessToken = localStorage.getItem("accessToken");
	const accessTokenParsed = localStorage.getItem("accessTokenParsed");
	const refreshToken = localStorage.getItem("refreshToken");
	const refreshTokenParsed = localStorage.getItem("refreshTokenParsed");
	const idToken = localStorage.getItem("idToken");

	if( ConnManagerNew.isAppMode_Offline()  )
	{
		KeycloakUtils.displayTokensInfo();

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
			})
			.catch(function() {
				var tagStr = '';

				console.log( '[Offline Auth CATCHED]' );

				if( keycloak.isTokenExpired() )
				{
					tagStr = 'The token is expired. Please login again. <br/><input type="button" value="LOGOUT" onclick="KeycloakUtils.tokenLogout()" />';
				}
				else
				{
					// STEP 2A. We come HERE!!
					tagStr = 'Login Success <input type="button" value="Update Token" onclick="KeycloakUtils.tokenRefresh()" /><br><input type="button" value="LOGOUT" onclick="KeycloakUtils.tokenLogout()" />';
					Login.loginInputDisable( false );  // Start Login?
					console.log( '[OFFLINE KEYCLOAK TOKEN]: ', keycloak.tokenParsed );
				}
	
				MsgManager.msgAreaShowOpt( tagStr, { cssClasses: 'notifGray', hideTimeMs: 180000 } );
	
				KeycloakUtils.displayTokensInfo();			
			});
		}
	}
	else
	{
		if( accessToken != null )
		{
			// STEP 3. AFTER KeyCloak Login SUCCESS and a couple app reload, (with token existing ) it comes here - not right away case after keycloak auth (STEP 2)
			keycloak.init({ 
				onLoad: 'login-required', 
				token: accessToken, 
				refreshToken: refreshToken, 
				idToken: idToken, 
				checkLoginIframe: false, 
				scope: 'openid offline_access'
			}).then(function(auth) 
			{
				if (!auth) keycloak.login( { scope: 'openid offline_access' } );
				  
				var tagStr = '';

				if( KeycloakUtils.isExpired(accessTokenParsed) || KeycloakUtils.isExpired(refreshTokenParsed) )
				{
					tagStr = 'The token is expired. Please login again. <br/><input type="button" value="LOGOUT" onclick="KeycloakUtils.tokenLogout()" />';
				}
				else
				{
					// STEP 2A. We come HERE!!
					tagStr = 'Login Success <input type="button" value="Update Token" onclick="KeycloakUtils.tokenRefresh()" /><br><input type="button" value="LOGOUT" onclick="KeycloakUtils.tokenLogout()" />';
					Login.loginInputDisable( false );		
					
					console.log( '[ONLINE KEYCLOAK TOKEN]: ', keycloak.tokenParsed );
				}

				MsgManager.msgAreaShowOpt( tagStr, { cssClasses: 'notifGray', hideTimeMs: 180000 } );

				KeycloakUtils.displayTokensInfo();				
			})
			.catch(function() {
				console.log('failed to initialize with token');
			});
		}
		else
		{
			// STEP 1. KeyCloak Login 1st Time HERE!!
			//		+ STEP 2. After redirect from KeyCloak Auth, we come here.
			keycloak.init({ onLoad: 'login-required', checkLoginIframe: false, scope: 'openid offline_access'}).then( function() 
			{
				localStorage.setItem("accessToken", keycloak.token);
				localStorage.setItem("accessTokenParsed", JSON.stringify(keycloak.tokenParsed));
				localStorage.setItem("refreshToken",keycloak.refreshToken);
				localStorage.setItem("refreshTokenParsed", JSON.stringify(keycloak.refreshTokenParsed));
				localStorage.setItem("idToken", keycloak.idToken);

				KeycloakUtils.displayTokensInfo();

				//document.getElementById("placeholder1").innerHTML = '<input type="button" value="Update Token" onclick="KeycloakUtils.tokenRefresh()" /><br><input type="button" value="LOGOUT" onclick="KeycloakUtils.tokenLogout()" />';
				var tagStr = '<input type="button" value="Update Token" onclick="KeycloakUtils.tokenRefresh()" /><br><input type="button" value="LOGOUT" onclick="KeycloakUtils.tokenLogout()" />';
				MsgManager.msgAreaShowOpt( tagStr, { cssClasses: 'notifGray', hideTimeMs: 180000 } );
				Login.loginInputDisable( false );

				// W_STEP 1. Save the username info..
				var userName = keycloak.tokenParsed.preferred_username;
				if ( userName ) AppInfoLSManager.setUserName( userName.toUpperCase() );

				AppUtil.appReloadWtMsg();
			})
			.catch(function( errMsg ) {
				alert('failed to initialize');
				console( errMsg );
			});
		}
	}
};
 

KeycloakUtils.displayTokensInfo = function()
{
	var infoStr = '';

	var logOutTag = $( '#btnKeyCloakLogOut' );
	logOutTag.hide().off( 'click' );

	const accessToken = localStorage.getItem("accessToken");
	const accessTokenParsed = localStorage.getItem("accessTokenParsed");
	const refreshToken = localStorage.getItem("refreshToken");
	const refreshTokenParsed = localStorage.getItem("refreshTokenParsed");
	const idToken = localStorage.getItem("idToken");

	if ( accessToken ) {
		infoStr += ' [AC_TKN: ' + Util.getStr( accessToken, 4 ) + '] ';
		//console.log( accessToken );
	}
	if ( accessTokenParsed ) {
		infoStr += ' [AC_TKN_P: ' + Util.getStr( accessTokenParsed, 4 ) + '] ';
		console.log( accessTokenParsed );
	}
	if ( refreshToken ) {
		infoStr += ' [RF_TKN: ' + Util.getStr( refreshToken, 4 ) + '] ';
		//console.log( refreshToken );
	}
	if ( refreshTokenParsed ) {
		infoStr += ' [RF_TKN_P: ' + Util.getStr( refreshTokenParsed, 4 ) + '] ';
		console.log( refreshTokenParsed );
	}
	if ( idToken ) {
		infoStr += ' [ID_TKN: ' + Util.getStr( idToken, 4 ) + '] ';
		//console.log( idToken );
	}
	

	$( '#divTokenInfo' ).text( infoStr );

	if ( accessToken ) logOutTag.show().click( () => { KeycloakUtils.tokenLogout(); });
};

// TODO: MOVE THEM TO OTHER PLACE --- CALLED FROM index.html
KeycloakUtils.tokenRefresh = function() {
	// // setTimeout(() => { // // }, 60 * 1000)

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
	}).catch(() => {
		alert('Failed to refresh the token, or the session has expired');
	});
};


// http://127.0.0.1:8887/logout.html
// https://pwa-stage.psi-connect.org/logout.html
KeycloakUtils.tokenLogout = function() {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("accessTokenParsed");
	localStorage.removeItem("refreshToken");
	localStorage.removeItem("refreshTokenParsed");
	localStorage.removeItem("idToken");

	
	KeycloakUtils.displayTokensInfo(); // TODO: Or, after logOut, we can set to reload the app?

	// if( !ConnManagerNew.isAppMode_Offline()  )
	// {
		// keycloak.logout({"redirectUri":"https://pwa-dev.psi-connect.org/logout.html"});
	// }

	keycloak.logout( { "redirectUri": window.location.href } ); // "http://127.0.0.1:8887/" } );
};


KeycloakUtils.event = function(event) {
	// var e = document.getElementById('events').innerHTML;
	// document.getElementById('events').innerHTML = new Date().toLocaleString() + "\t" + event + "\n" + e;
	console.log("========== Keycloak eventLOG");
	console.log(event);
};


// ==================================

KeycloakUtils.isExpired = function( tokenInfo )
{
    const parsedTokenData = JSON.parse( tokenInfo );
    const leftSeconds = parsedTokenData.exp - new Date().getTime() / 1000;
	return (leftSeconds <= 0) // Token Expired
};
