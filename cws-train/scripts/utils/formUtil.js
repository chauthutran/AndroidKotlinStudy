// -------------------------------------------
// -- FormUtil Class/Methods

function FormUtil() {}

FormUtil.staticWSName = 'eRefWSTrain';			// Need to be dynamically retrieved
FormUtil.appUrlName = 'cws-train';			// App name - Part of the url
FormUtil.login_UserName = '';
FormUtil.login_Password = '';
FormUtil.login_server = '';
FormUtil.orgUnitData;
FormUtil.dcdConfig;

FormUtil.blockType_MainTab = 'mainTab';
FormUtil.blockType_MainTabContent = 'mainTabContent';
FormUtil._serverUrl = location.protocol + '//' + location.host;
// 'https://apps.psi-mis.org';  <-- white listing try

// ==== Methods ======================

FormUtil.getObjFromDefinition = function( def, definitions )
{
	var objJson;

	if ( def !== undefined && definitions !== undefined )
	{
		if ( typeof def === 'string' )
		{
			//console.log( 'get string object: ' + def );
			// get object from definition
			objJson = definitions[ def ];
		}
		else if ( typeof def === 'object' )
		{
			objJson = def;
		}	
	}

	return objJson;
}

FormUtil.getServerUrl = function()
{
	if (FormUtil.login_server)
	{
		return FormUtil.login_server; 
	} 
	else
	{
		return location.protocol + '//' + location.host;
	}
	
};

FormUtil.generateUrl = function( inputsJson, actionJson )
{
	var url;

	if ( actionJson.url !== undefined )
	{
		url = FormUtil.getWsUrl( actionJson.url );

		if ( actionJson.urlParamNames !== undefined 
			&& actionJson.urlParamInputs !== undefined 
			&& actionJson.urlParamNames.length == actionJson.urlParamInputs.length )
		{
			var paramAddedCount = 0;
	
			for ( var i = 0; i < actionJson.urlParamNames.length; i++ )
			{
				var paramName = actionJson.urlParamNames[i];
				var inputName = actionJson.urlParamInputs[i];
	
				if ( inputsJson[ inputName ] !== undefined )
				{
					var value = inputsJson[ inputName ];
	
					url += ( paramAddedCount == 0 ) ? '?': '&';
	
					url += paramName + '=' + value;
				}
	
				paramAddedCount++;
			}
		}
	}
	
	return url;
}


FormUtil.generateInputJson = function( formDivSecTag )
{
	// Input Tag values
	var inputsJson = {};

	var inputTags = formDivSecTag.find( 'input,select' );

	inputTags.each( function()
	{
		var inputTag = $(this);	
		var attrDisplay = inputTag.attr( 'display' );
		var getVal = false;

		if ( attrDisplay === 'hiddenVal' ) getVal = true;
		else if ( inputTag.is( ':visible' ) ) getVal = true;

		if ( getVal )
		{
			var val = inputTag.val();

			if ( val === null || val === undefined ) val = '';

			var nameVal = inputTag.attr( 'name' );
			inputsJson[ nameVal ] = val;
		}
	});		

	return inputsJson;
}

FormUtil.generateLoadingTag = function( btnTag )
{
	var loadingTag;

	if ( btnTag.is( 'div' ) )
	{
		loadingTag = $( '<div class="loadingImg" style="float: right; margin-left: 8px;"><img src="images/loading.gif"></div>' );
		btnTag.append( loadingTag );
	}
	else if ( btnTag.is( 'button' ) )
	{
		loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading.gif"></div>' );
		btnTag.after( loadingTag );
	}

	return loadingTag;
}

FormUtil.convertNamedJsonArr = function( jsonArr, definitionArr )
{
	var newJsonArr = [];

	if ( jsonArr )
	{
		for ( var i = 0; i < jsonArr.length; i++ )
		{
			newJsonArr.push( FormUtil.getObjFromDefinition( jsonArr[i], definitionArr ) );
		}		
	}

	return newJsonArr;
}
// -----------------------------
// ---- Submit Related ----------

FormUtil.submitRedeem = function( url, payloadJson, actionJson, loadingTag, returnFunc, asyncCall, syncCall )
{

	FormUtil.wsSubmitGeneral( url, payloadJson, loadingTag, function( success, returnJson )
	{
		if ( success )
		{			
			if ( actionJson.alertResult === "true" )
			{
				if ( returnJson.resultData )
				{
					if( returnJson.resultData.status === "success")
					{
						alert( "Success!" );
					}
					else if ( returnJson.resultData.status === "fail")
					{
						alert( "Failed!" );
					}	
				}
			}			
			
			if ( returnFunc ) returnFunc( true, returnJson );
			if ( asyncCall ) asyncCall( returnJson );
		}
		else
		{
			if ( returnFunc ) returnFunc( false );
			if ( syncCall ) syncCall();
		}
	});
}


FormUtil.submitLogin = function( userName, password, loadingTag, returnFunc )
{
	var url = FormUtil.getWsUrl( '/api/loginCheck' );

	// FormUtil.orgUnitData <-- Reset before?
	var payloadJson = { 'submitLogin': true, 'submitLogin_usr': userName, 'submitLogin_pwd': password, 'dcConfigGet': 'Y' };

	FormUtil.wsSubmitGeneral( url, payloadJson, loadingTag, function( success, returnJson )
	{
		if ( success )
		{
			// Check the login success message in content.. ..			
			var loginStatus = ( returnJson && returnJson.loginStatus );
			//var orgUnitData = ( returnJson.orgUnitData ) ? returnJson.orgUnitData : undefined;

			if ( loginStatus )
			{		
				FormUtil.login_UserName = userName;
				FormUtil.login_Password = password;
				FormUtil.orgUnitData = returnJson.orgUnitData;
				FormUtil.dcdConfig = returnJson.dcdConfig;
			}

			if ( returnFunc ) returnFunc( loginStatus, returnJson );
		}
	});
}


// -----------------------------------
// ---- Login And Fetch WS Related ------

FormUtil.setLogin = function( userName, password )
{
	FormUtil.login_UserName = userName;
	FormUtil.login_Password = password;	
}

FormUtil.checkLoginSubmitCase = function( payloadJson )
{
	return ( payloadJson && payloadJson.submitLogin );
}

FormUtil.checkLogin = function()
{
	return ( FormUtil.login_UserName && FormUtil.login_Password );
}

FormUtil.getWsUrl = function( subUrl )
{
	return FormUtil.getServerUrl() + "/" + FormUtil.staticWSName + subUrl;
}

FormUtil.getFetchWSJson = function( payloadJson )
{
	var fetchJson = {
		method: 'POST'
		,headers: { 'usr': '', 'pwd': '' }
		,body: '{}'
	};


	if ( FormUtil.checkLoginSubmitCase( payloadJson ) )
	{
		fetchJson.headers.usr = payloadJson.submitLogin_usr;
		fetchJson.headers.pwd = payloadJson.submitLogin_pwd;	
	}
	else
	{
		fetchJson.headers.usr = FormUtil.login_UserName;
		fetchJson.headers.pwd = FormUtil.login_Password;	
	}
		
	if ( payloadJson ) fetchJson.body = JSON.stringify( payloadJson );
	
	return fetchJson;
}

FormUtil.wsSubmitGeneral = function( url, payloadJson, loadingTag, returnFunc )
{	
	// headers info change? or pass as body??
	if ( !FormUtil.checkLoginSubmitCase( payloadJson ) && !FormUtil.checkLogin() )
	{
		if ( loadingTag ) loadingTag.remove();

		alert( 'Not Loggged In!' );
		returnFunc( false );
	}
	else
	{
		// Send the POST reqesut
		fetch( url, FormUtil.getFetchWSJson( payloadJson ) )
		.then( function( response ) 
		{
			if ( response ) 
			{
				if ( response.ok )
				{
					response.json().then(
						function( returnJson ) 
						{
							if ( loadingTag ) loadingTag.remove();
							if ( returnFunc ) returnFunc( true, returnJson );
						}
					);
				}
				else
				{
					alert( 'Response Failed' );
					if ( loadingTag ) loadingTag.remove();
					if ( returnFunc ) returnFunc( false );
				}
			}
			else
			{
				alert( 'Response Not available' );
				if ( loadingTag ) loadingTag.remove();
				if ( returnFunc ) returnFunc( false );
			}
		});
	}
}


FormUtil.setClickSwitchEvent = function( mainIconTag, subListIconsTag, openCloseClass )
{
	mainIconTag.on('click', function( event )
	{
		event.preventDefault();

		var thisTag = $(this);
		var className_Open = openCloseClass[0];
		var className_Close = openCloseClass[1];

		if ( thisTag.hasClass( className_Close ) )
		{
			thisTag.removeClass( className_Close );
			thisTag.addClass( className_Open );
			subListIconsTag.show();
		} 
		else 
		{
			thisTag.removeClass( className_Open );
			thisTag.addClass( className_Close );
			subListIconsTag.hide();
		}
	});	
}


FormUtil.setUpTabAnchorUI = function( tag )
{	
	var clickedTab = tag.find(".tabs > .active");
	var tabWrapper = tag.find(".tab_content");
	var activeTab = tabWrapper.find(".active");
	var activeTabHeight = activeTab.outerHeight();
	//var tab_select;
	var tabContentLiTags = tabWrapper.children( 'li' );

	activeTab.show();
	tabWrapper.height(activeTabHeight);

	
	// Tab view (Larger view) 'ul'/'li' click event handler setup
	tag.find(".tabs > li").on("click", function() 
	{
		var tab_select = $(this).attr('tabId'); 
		
		//console.log( 'tabSelect: ' + tab_select );
		//console.log( 'tabSelectw: ' + $(this).attr('tabid') );

		tag.find('.active').removeClass('active');  // both 'tabs' and 'tab_Content'
		
		$(this).addClass('active');

		console.log( this );
		

		var activeTab = tag.find( ".tab_content > li[tabId='" + tab_select + "']");

		activeTab.addClass("active");
		activeTab.children('.expandable').click();
		activeTabHeight = activeTab.outerHeight();
		

		activeTab.show();
	});

	// Mobile view 'Anchor' class ('.expandable') click event handler setup
	tag.find('.expandable').on('click', function( event )
	{
		event.preventDefault();

		var tab_select = $(this).attr('tabId'); 
		var liTag_Selected = $( this ).parent();
		var tabId = liTag_Selected.attr( 'tabId' );
		var matchingTabsTag = tag.find( ".tabs > li[tabId='" + tabId + "']");

		//console.log( 'tabExpand: ' + tabId );

		/* START > Greg added: 2018/11/23 */
		var lastSession = JSON.parse(localStorage.getItem('session'));

		if (lastSession)
		{
			var loginData = JSON.parse(localStorage.getItem(lastSession.user));

			if (loginData)
			{

				if ( ConnManager.getAppConnMode_Online() )
				{
					// for ONLINE > update dcd config for last menu action (default to this page on refresh)
					for ( var i = 0; i < loginData.dcdConfig.areas.online.length; i++ )
					{
						if ( loginData.dcdConfig.areas.online[i].startArea )
						{
							loginData.dcdConfig.areas.online[i].defaultTab = tabId;
						}
					}
				}
				else
				{
					// for OFFLINE > update dcd config for last menu action (default to this page on refresh)
					for ( var i = 0; i < loginData.dcdConfig.areas.offline.length; i++ )
					{
						if ( loginData.dcdConfig.areas.offline[i].startArea )
						{
							loginData.dcdConfig.areas.offline[i].defaultTab = tabId;
						}
					}
				}
				localStorage[ lastSession.user ] = JSON.stringify( loginData )
			}
		}
		/* END > Added by Greg: 2018/11/24 */
		
		tag.find('.active').removeClass('active');
		matchingTabsTag.addClass("active");

		tag.find('.expanded').removeClass('expanded');
		tag.find('.expandable-arrow').attr('src','./img/arrow_down.svg');

		$(this).addClass('expanded');
		$(this).find( ".expandable-arrow" ).attr('src','./img/arrow_up.svg');

	});
}

FormUtil.getAppInfo = function( returnFunc )
{	
	var url = FormUtil.getWsUrl( '/api/getPWAInfo' );

	RESTUtil.retrieveJson( url, returnFunc );
}
