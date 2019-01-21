// -------------------------------------------
// -- FormUtil Class/Methods

function FormUtil() {}

FormUtil.staticWSName = 'eRefWSDev3'; //'eRefWSDev3';	eRefWSStage		// Need to be dynamically retrieved
FormUtil.appUrlName = 'cws';			// App name - Part of the url
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
	var objJson = def;  // default is the passed in object/name

	if ( def !== undefined && definitions !== undefined )
	{
		if ( typeof def === 'string' )
		{
			// get object from definition
			objJson = definitions[ def ];
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

FormUtil.isAppsPsiServer = function()
{
	//return true;
	return ( location.host.indexOf( 'apps.psi-mis.org' ) >= 0 );
}

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


FormUtil.generateInputJson = function( formDivSecTag, getValList )
{
	// Input Tag values
	var inputsJson = {};
	var inputTags = formDivSecTag.find( 'input,select' );

	inputTags.each( function()
	{		
		var inputTag = $(this);	
		var attrDisplay = inputTag.attr( 'display' );
		var nameVal = inputTag.attr( 'name' );
		var getVal_visible = false;
		var getVal = false;

		if ( attrDisplay === 'hiddenVal' ) getVal_visible = true;
		else if ( inputTag.is( ':visible' ) ) getVal_visible = true;

		if ( getVal_visible )
		{
			// Check if the submit var list exists (from config).  If so, only items on that list are added.
			if ( getValList === undefined )
			{			
				getVal = true;
			}
			else
			{
				if ( getValList.indexOf( nameVal ) >= 0 ) getVal = true;
			}
		}

		if ( getVal )
		{
			var val = FormUtil.getTagVal( inputTag );
			if ( val === null || val === undefined ) val = '';

			inputsJson[ nameVal ] = val;
		}
	});		

	return inputsJson;
}

// Temp use by 'dataList' for now - might populate it fully for more common use
FormUtil.renderInputTag = function( dataJson, containerDivTag )
{
	var entryTag = $( '<input name="' + dataJson.id + '" uid="' + dataJson.uid + '" class="form-type-text" type="text" />' );
	entryTag.attr( 'display', dataJson.display );

	// If 'defaultValue' exists, set val
	FormUtil.setTagVal( entryTag, dataJson.defaultValue );
	
	// If containerDivTag was passed in, append to it.
	if ( containerDivTag )
	{
		containerDivTag.append( entryTag );

		// Set Tag Visibility
		if ( dataJson.display === "hiddenVal" || dataJson.display === "none" )
		{
			containerDivTag.hide();
		}
	}

	return entryTag;
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
// ---- REST (Retrieval/Submit(POST)) Related ----------

FormUtil.getWsUrl = function( subUrl )
{
	// if 'subUrl' is full url, use it.  Otherwise, add server url in front.
	if ( subUrl.indexOf( 'http' ) === 0 )
	{
		return subUrl;  // THIS WOULD NOT NORMALY WORK DUE TO CORS policy
	} 
	else 
	{
		return FormUtil.getServerUrl() + "/" + FormUtil.staticWSName + subUrl;
	}
}


// POST Request required json prepare
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


// GET Request to Web Service..
FormUtil.wsRetrievalGeneral = function( apiPath, loadingTag, returnFunc )
{		
	var url = FormUtil.getWsUrl( apiPath ); //  queryLoc --> '/api/loginCheck'

	RESTUtil.retrieveJson( url, function( success, returnJson )
	{
		if ( loadingTag ) loadingTag.remove();

		if ( returnFunc ) returnFunc( returnJson );
	});
}

// POST Request to Web Service..
FormUtil.wsSubmitGeneral = function( apiPath, payloadJson, loadingTag, returnFunc )
{	
	var url = FormUtil.getWsUrl( apiPath );
		
	// Send the POST reqesut	
	RESTUtil.performREST( url, FormUtil.getFetchWSJson( payloadJson ), function( success, returnJson ) 
	{
		if ( loadingTag ) loadingTag.remove();

		if ( returnFunc ) returnFunc( success, returnJson );
	});
}

// --- --- --- ---

FormUtil.submitRedeem = function( apiPath, payloadJson, actionJson, loadingTag, returnFunc, asyncCall, syncCall )
{
	FormUtil.wsSubmitGeneral( apiPath, payloadJson, loadingTag, function( success, returnJson )
	{
		if ( returnFunc ) returnFunc( success, returnJson );
		if ( asyncCall ) asyncCall( returnJson );
		if ( syncCall ) syncCall();
	});
}


FormUtil.submitLogin = function( userName, password, loadingTag, returnFunc )
{
	var apiPath = '/api/loginCheck';

	// FormUtil.orgUnitData <-- Reset before?
	var payloadJson = { 'submitLogin': true, 'submitLogin_usr': userName, 'submitLogin_pwd': password, 'dcConfigGet': 'Y' };

	FormUtil.wsSubmitGeneral( apiPath, payloadJson, loadingTag, function( success, returnJson )
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

FormUtil.undoLogin = function()
{
	FormUtil.login_UserName = '';
	FormUtil.login_Password = '';	
}

// ---------------------------------------------------------

FormUtil.setClickSwitchEvent = function( mainIconTag, subListIconsTag, openCloseClass, cwsRenderObj )
{
	mainIconTag.on('click', function( event )
	{
		//console.log( 'mainIconTag Clicked' );
		event.preventDefault();

		var thisTag = $(this);
		var className_Open = openCloseClass[0];
		var className_Close = openCloseClass[1];

		if ( thisTag.hasClass( className_Open ) )
		{
			thisTag.removeClass( className_Open );
			thisTag.addClass( className_Close );

			/* added by Greg (7 Jan 2019)*/
			//if ( thisTag.hasClass( 'floatListMenuIcon' ) ) subListIconsTag.fadeOut( 'fast', 'linear' );
			//else subListIconsTag.hide();

			//Greg: Strange behaviour on hamburger icon, not removing 'active' class when executing #focusRelegator.click() > forcibly removing this class
			if ( thisTag.attr( 'id' ) == 'nav-toggle' ) 
			{
				thisTag.removeClass( 'active' );
				subListIconsTag.hide( 'slide', { direction: 'left' }, 250);
				//subListIconsTag.hide();
			}
			else
			{
				subListIconsTag.fadeOut( 'fast', 'linear' );
			}

			$( '#focusRelegator').hide();

		}
		else 
		{
			thisTag.removeClass( className_Close );
			thisTag.addClass( className_Open );

			$( '#focusRelegator').css('zIndex',100);
			thisTag.css('zIndex',200);
			subListIconsTag.css('zIndex',300);

			/* added by Greg (7 Jan 2019)*/
			//if ( thisTag.hasClass( 'floatListMenuIcon' ) ) subListIconsTag.fadeIn( 'fast', 'linear' );
			//else subListIconsTag.show();

			if ( thisTag.attr( 'id' ) == 'nav-toggle' )
			{
				subListIconsTag.css( 'width', FormUtil.navDrawerWidthLimit( document.body.clientWidth ));
				subListIconsTag.show( 'slide', { direction: 'right' }, 250);
			} 
			else
			{
				subListIconsTag.fadeIn( 'fast', 'linear' );
			}

			$( '#focusRelegator').unbind();

			$( '#focusRelegator').on('click', function( event )
			{
				//console.log( 'focusRelegator Clicked ' );
				event.preventDefault();

				thisTag.click();

			});

			$( '#focusRelegator').show();

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

		tag.find('.active').removeClass('active');  // both 'tabs' and 'tab_Content'
		
		$(this).addClass('active');

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

		/* START > Greg added: 2018/11/23 */
		FormUtil.setUserLastSelectedTab(tabId)
		/* END > Added by Greg: 2018/11/24 */

		tag.find('.active').removeClass('active');
		matchingTabsTag.addClass("active");

		tag.find('.expanded').removeClass('expanded');
		tag.find('.expandable-arrow').attr('src','./img/arrow_down.svg');

		$(this).addClass('expanded');
		$(this).find( ".expandable-arrow" ).attr('src','./img/arrow_up.svg');

	});
}

FormUtil.setUserLastSelectedTab = function(tabId) {

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

}

FormUtil.getUserLastSelectedTab = function() {

	var lastSession = JSON.parse(localStorage.getItem('session'));
	var tabId;

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
						tabId = loginData.dcdConfig.areas.online[i].defaultTab;
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
						tabId = loginData.dcdConfig.areas.offline[i].defaultTab;
					}
				}
			}
			return tabId;
		}
	}

}
/* START > Added by Greg: 2018/11/26 */
FormUtil.getUserSessionAttr = function( usr, attr ) {

	var lastSessionAll = JSON.parse(localStorage.getItem(usr))

	if ( lastSessionAll && lastSessionAll.mySession )
	{
		return lastSessionAll.mySession[ attr ];
	}

}
FormUtil.getRedeemPayload = function( id ) {

	var redPay = JSON.parse(sessionStorage.getItem( id ))

	if ( redPay )
	{
		return redPay;
	}

}
/* END > Added by Greg: 2018/11/26 */

FormUtil.getAppInfo = function( returnFunc )
{	
	var url = FormUtil.getWsUrl( '/api/getPWAInfo' );

	RESTUtil.retrieveJson( url, returnFunc );
}


// ======================================

FormUtil.checkTag_CheckBox = function( tag )
{
	var isType = false;

	if ( tag )
	{
		if ( tag.attr( 'type' ) === 'checkbox' ) isType = true;
	}
	
	return isType;
}

FormUtil.setTagVal = function( tag, val, returnFunc )
{
	if( val !== undefined ) // && val !== '' )
	{
		if ( FormUtil.checkTag_CheckBox( tag ) )
		{
			tag.prop( 'checked', ( val === 'true' || val === true ) ); 
		}
		else
		{
			tag.val( val );
		}

		if ( returnFunc ) returnFunc();
	}
}

FormUtil.getTagVal = function( tag )
{
	var val;

	if( tag )
	{
		if ( FormUtil.checkTag_CheckBox( tag ) )
		{			
			val = tag.is( ":checked" ) ? "true" : "" ;
		}
		else
		{
			val = tag.val();
		}
	}

	return val;
}

/* START > Added by Greg: 2018/12/10 */
FormUtil.getManifest = function()	
{
	$.get( 'manifest.json', function( jsonData, status )
		{
			if ( status == 'success' )
			{
				return jsonData
			}

		}
	);

}
/* END > Added by Greg: 2018/12/10 */

/* START > Added by Greg: 2018/12/103 */

FormUtil.setLastPayload = function( jsonData )
{

	var sessionData = localStorage.getItem('session');

	if ( sessionData )
	{

		var SessionObj = JSON.parse( sessionData );
		//var payload = JSON.stringify( jsonData );

		if ( SessionObj.last && SessionObj.last.payload )
		{
			SessionObj.last.payload = jsonData;
		}
		else
		{
			SessionObj.last = { 'payload': jsonData };
		}

		localStorage.setItem( 'session', JSON.stringify( SessionObj ) );

	}
}

FormUtil.getLastPayload = function()
{
	var sessionData = localStorage.getItem('session');

	if ( sessionData )
	{
		var SessionObj = JSON.parse( sessionData );

		if ( SessionObj.last && SessionObj.last.payload )
		{
			return SessionObj.last.payload;
		}

	}
}
/* END > Added by Greg: 2018/12/13 */

FormUtil.performReget = function( regObj, option )
{		
	if ( ConnManager.isOffline() )
	{
		alert( 'Only re-register service-worker while online, please.' );
	}
	else
	{      
		if ( regObj !== undefined )
		{
			if ( option === "update" )
			{
				FormMsgManager.appBlock( "Service Worker Updating and App restart.." );
				regObj.update().then( function( ){
					location.reload( true );
				});
				FormMsgManager.appUnblock();	
			}
			else
			{
				FormMsgManager.appBlock( "Reget App - restarting..." );

				regObj.unregister().then(function(boolean) {
					//console.log('Service Worker UnRegistered');
					// if boolean = true, unregister is successful
					location.reload( true );
				});
	
				FormMsgManager.appUnblock();	
			}
		}
		else
		{
			alert( 'Reget Failed - service worker not found' );
		}  
	}
}

FormUtil.getMyListData = function( listName )
{
	var redList = {}, returnList = {};

	if ( localStorage.getItem( listName ) )
	{
		redList = JSON.parse( localStorage.getItem( listName ) );

		if ( redList )
		{
			returnList = redList.list.filter(a=>a.owner==FormUtil.login_UserName);
			return returnList;
		}

	}
}

FormUtil.updateProgressWidth = function( W )
{
	//$( '#divProgressBar' ).css( 'display', 'block' );
	//$( '#divProgressBar' ).css( 'zIndex', '100' );
	//$( '#divProgressBar' ).css('width', W );
	$( 'div.indeterminate' ).css('width', W );
	$( 'div.determinate' ).css('width', W );
}

FormUtil.showProgressBar = function( width )
{
	if ( width )
	{
		//$( '#divProgressBar' ).css('width', width );
		$( 'div.indeterminate' ).css('width', width );
		$( 'div.determinate' ).css('width', width );
	}
	$( '#divProgressBar' ).css( 'display', 'block' );
	$( '#divProgressBar' ).show();
	$( '#divProgressBar' ).css( 'zIndex', '100' );
}

FormUtil.hideProgressBar = function()
{
	//$( '#divProgressBar' ).css( 'display', 'none' );
	$( '#divProgressBar' ).hide();
}


FormUtil.navDrawerWidthLimit = function( screenWidth )
{
	/* BASED ON Responsive.css VALUES FOR SCREEN WIDTH  */
	/* NB: IF tests to be ordered in descending order of size  */

	var expectedWidth;

	/* 2B. 2 column input wider than 866px */
	if ( screenWidth >= 866)
	{
		expectedWidth = 400;
	}

	/* 2A. 1 column input less than 866px */
	if ( screenWidth <= 865)
	{
		expectedWidth = 400;
	}

	/* 1B. Tab content mode - hide Anchor */
	/*if ( screenWidth >= 560)
	{
		expectedWidth = 360;
	}*/

	/* 1A. Smallest Anchor Mode 560 */
	if ( screenWidth <= 559)
	{
		expectedWidth = 280;
	}

	return expectedWidth;

};

FormUtil.defaultLanguage = function()
{
	//defaultLanguage (from dcdConfig) ? does it match as a supported language option
	var navLang = (navigator.language).toString().substring(0,2);
	console.log( ' FormUtil.defaultLanguage: ' + navLang)
	return navLang;
}