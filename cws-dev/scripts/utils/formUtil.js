// -------------------------------------------
// -- FormUtil Class/Methods

function FormUtil() {}

FormUtil.staticWSName = 'eRefWSDev3'; //'eRefWSDev3';	eRefWSStage		// Need to be dynamically retrieved
FormUtil.appUrlName = 'cws';			// App name - Part of the url

FormUtil.dynamicWS = '';
FormUtil.staticWSpath = '';

FormUtil.login_UserName = '';
FormUtil.login_Password = '';
FormUtil.login_server = '';
FormUtil.orgUnitData;
FormUtil.dcdConfig;

FormUtil.blockType_MainTab = 'mainTab';
FormUtil.blockType_MainTabContent = 'mainTabContent';

FormUtil._serverUrl = 'https://apps.psi-mis.org';  // Apps WebService version
FormUtil._serverUrlOverride = "";
FormUtil._gAnalyticsTrackId = "UA-134670396-1";
FormUtil._getPWAInfo;

FormUtil.geoLocationTrackingEnabled = false;  // --> move to geolocation.js class
FormUtil.geoLocationLatLon;  // --> move to geolocation.js class
FormUtil.geoLocationState;  // --> move to geolocation.js class
FormUtil.geoLocationError;  // --> move to geolocation.js class
FormUtil.geoLocationCoordinates;  // --> move to geolocation.js class

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
	var serverUrl = "";

	if ( FormUtil._serverUrlOverride )
	{
		serverUrl = FormUtil._serverUrlOverride; 
	}
	else
	{
		serverUrl = FormUtil._serverUrl;
	}

	return serverUrl;
};


FormUtil.isAppsPsiServer = function()
{
	//return true;
	return ( location.host.indexOf( 'apps.psi-mis.org' ) >= 0 );
}

FormUtil.isPsiServer = function()
{
	//return true;
	return ( location.host.indexOf( 'psi-mis.org' ) >= 0 );
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

FormUtil.generateInputTargetPayloadJson = function( formDivSecTag, getValList )
{
	//console.log( formDivSecTag );
	var inputsJson = {};
	var inputTags = formDivSecTag.find( 'input,select' );
	var inputTargets = [];
	var uniqTargs = [];

	inputTags.each( function()
	{		
		var inputTag = $(this);	
		var attrDataTargets = inputTag.attr( 'datatargets' );

		if ( attrDataTargets )
		{
			var val = FormUtil.getTagVal( inputTag );

			if ( val != null && val != '' )
			{
				var dataTargs = JSON.parse( unescape( attrDataTargets ) );
				var newPayLoad = { "name": $( inputTag ).attr( 'name' ), "value": val, "dataTargets": dataTargs };
	
				inputTargets.push ( newPayLoad );
	
				Object.keys( dataTargs ).forEach(function( key ) {
	
					if ( ! uniqTargs.includes( key ) )
					{
						uniqTargs.push( key );
					}
	
				});
			}
			

		}

	});

	uniqTargs.sort();
	uniqTargs.reverse();

	// BUILD new template payload structure (based on named target values)
	for ( var t = 0; t < uniqTargs.length; t++ )
	{
		var dataTargetHierarchy = ( uniqTargs[ t ] ).toString().split( '.' );

		// initialize with item at position zero [0]
		FormUtil.recursiveJSONbuild( inputsJson, dataTargetHierarchy, 0 );
	}

	// FILL/populate new template payload structure (according to named inputTarget destinations)
	for ( var t = 0; t < inputTargets.length; t++ )
	{
		Object.keys( inputTargets[ t ].dataTargets ).forEach(function( key ) {

			var dataTargetHierarchy = ( key ).toString().split( '.' );

			// initialize with item at position zero [0]
			FormUtil.recursiveJSONfill( inputsJson, dataTargetHierarchy, 0, inputTargets[ t ].dataTargets[ key ], inputTargets[ t ].value );

		});

	}

	inputsJson[ 'userName' ] = FormUtil.login_UserName;
	inputsJson[ 'password' ] = FormUtil.login_Password;

	console.log ( inputsJson );
	console.log ( JSON.stringify( inputsJson, null, 4) );

	return inputsJson;
}

FormUtil.recursiveJSONbuild = function( targetDef, dataTargetHierarchy, itm)
{
	// construct the payload 'layout'
	if ( dataTargetHierarchy[ itm ] )
	{
		if ( ( dataTargetHierarchy[ itm ] ).length && ! targetDef.hasOwnProperty( dataTargetHierarchy[ itm ] ) ) 
		{
			// check if next item exists > if true then current item is object ELSE it is array (destination array for values)
			if ( dataTargetHierarchy[ itm + 1 ] || ( dataTargetHierarchy[ itm ] ).toString().indexOf('[') < 0 )
			{
				targetDef[ dataTargetHierarchy[ itm ] ] = {}; 
			}
			else
			{
				var arrSpecRaw = ( ( dataTargetHierarchy[ itm ] ).toString().split( '[' ) [ 1 ] ).replace( ']' ,'' );
				targetDef[ ( dataTargetHierarchy[ itm ] ).toString().replace( '['+ arrSpecRaw +']','' ) ] = [];
			}
		}
		FormUtil.recursiveJSONbuild( targetDef[ dataTargetHierarchy[ itm ] ], dataTargetHierarchy, parseInt( itm ) + 1 )
	}
	else
	{
		return targetDef;
	}

}

FormUtil.recursiveJSONfill = function( targetDef, dataTargetHierarchy, itm, fillKey,fillValue)
{
	// fill/populate the payload
	if ( itm < ( dataTargetHierarchy.length -1) )
	{
		FormUtil.recursiveJSONfill( targetDef[ dataTargetHierarchy[ itm ] ], dataTargetHierarchy, parseInt( itm ) + 1, fillKey, fillValue )
	}
	else
	{
		var arrSpecRaw = '';
		var arrSpecArr = [];

		if ( ( dataTargetHierarchy[ itm ] ).toString().indexOf('[') >= 0 )
		{
			arrSpecRaw = ( ( dataTargetHierarchy[ itm ] ).toString().split( '[' ) [ 1 ] ).replace( ']' ,'' );
			arrSpecArr = arrSpecRaw.split( ':' );

			if ( ( arrSpecRaw.indexOf( ':' ) < 0 ) || ( arrSpecRaw.length > 0 && arrSpecArr.length > 2 ) ) arrSpecArr = [];
		}
		
		var dataTargetKeyItem = ( dataTargetHierarchy[ itm ] ).toString().replace('[' + arrSpecRaw + ']','');
		var dataValue = ( ( fillValue.toString().indexOf( '{' ) >= 0 ) && ( fillValue.toString().indexOf( '}' ) >= 0 ) ? JSON.parse( fillValue ) : fillValue );

		if ( ( dataTargetKeyItem ).length && targetDef.hasOwnProperty( dataTargetKeyItem ) ) 
		{
			if ( Array.isArray( targetDef[ dataTargetKeyItem ] ) )
			{
				if ( arrSpecArr.length )
				{
					targetDef[ dataTargetKeyItem ].push ( { [arrSpecArr[ 0 ]]: fillKey, [arrSpecArr[ 1 ]]: dataValue } );
				}
				else
				{
					targetDef[ dataTargetKeyItem ].push ( { [fillKey]: dataValue } );
				}
			}
			else
			{
				targetDef[ dataTargetKeyItem ] [fillKey] = dataValue;
			}
		}
		else if ( ( dataTargetKeyItem ).length == 0 )
		{
			if ( Array.isArray( targetDef[ dataTargetKeyItem ] ) )
			{
				if ( arrSpecArr.length )
				{
					targetDef[ dataTargetKeyItem ].push ( { [arrSpecArr[ 0 ]]: fillKey, [arrSpecArr[ 1 ]]: dataValue } );
				}
				else
				{
					targetDef[ dataTargetKeyItem ].push ( { [fillKey]: dataValue } );
				}
			}
			else
			{
				targetDef[ fillKey ] = dataValue;
			}
			
		}
	}
}

// Temp use by 'dataList' for now - might populate it fully for more common use
FormUtil.renderInputTag = function( dataJson, containerDivTag )
{
	var entryTag = $( '<input name="' + dataJson.id + '" uid="' + dataJson.uid + '" class="form-type-text" type="text" />' );

	if ( dataJson.display ) entryTag.attr( 'display', dataJson.display );

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
FormUtil.getFetchWSJson = function( payloadJson, headerJson )
{	
	var fetchJson = {
		 method: 'POST' //,headers: { 'usr': '', 'pwd': '' }  <-- do not use this due to disabled CORS case not passing headers var.
		,body: '{}'
	};

	if ( FormUtil.checkLoginSubmitCase( payloadJson ) )
	{
		payloadJson.userName = payloadJson.submitLogin_usr;
		payloadJson.password = payloadJson.submitLogin_pwd;	
	}
	else
	{
		payloadJson.userName = FormUtil.login_UserName;
		payloadJson.password = FormUtil.login_Password;
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
	if ( (location.href).indexOf('localhost') >= 0 ) // location.href).substring((location.href).length - 4, (location.href).length) == '/cws' || >> last 4 chars of url
	{
		var payloadJson = { 'submitLogin': true, 'submitLogin_usr': userName, 'submitLogin_pwd': password, 'dcConfigGet': 'Y', pwaStage: "cws-dev" };
	}
	else
	{
		var payloadJson = { 'submitLogin': true, 'submitLogin_usr': userName, 'submitLogin_pwd': password, 'dcConfigGet': 'Y', pwaStage: (location.host).replace('.psi-mis.org','') };
	}

	FormUtil.wsSubmitGeneral( apiPath, payloadJson, loadingTag, function( success, returnJson )
	{
		if ( success )
		{
			// Check the login success message in content.. ..			
			var loginStatus = ( returnJson && returnJson.loginStatus );

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
	return ( FormUtil.login_UserName.toString().length * FormUtil.login_Password.toString().length );
}

FormUtil.undoLogin = function()
{
	FormUtil.login_UserName = '';
	FormUtil.login_Password = '';	
	FormUtil.login_server = '';
	FormUtil.dcdConfig = undefined;
	FormUtil.orgUnitData = undefined;

	$( 'input.loginUserPin' ).val( '' );
	$( 'input.loginUserPinNumeric' ).val( '' );
}

// ---------------------------------------------------------

FormUtil.setClickSwitchEvent = function( mainIconTag, subListIconsTag, openCloseClass, cwsRenderObj )
{
	mainIconTag.on('click', function( event )
	{
		event.preventDefault();

		var thisTag = $(this);
		var className_Open = openCloseClass[0];
		var className_Close = openCloseClass[1];

		if ( thisTag.hasClass( className_Open ) )
		{
			thisTag.removeClass( className_Open );
			thisTag.addClass( className_Close );

			if ( thisTag.attr( 'id' ) == 'nav-toggle' )
			{
				thisTag.removeClass( 'active' );

				subListIconsTag.css( 'left', '-' + FormUtil.navDrawerWidthLimit( document.body.clientWidth ) + 'px' );
				subListIconsTag.css( 'width', FormUtil.navDrawerWidthLimit( document.body.clientWidth ) + 'px' );

				setTimeout( function() {
					subListIconsTag.hide(); 
				}, 500 );

				$( '#focusRelegator').hide();
			}
			else //if ( className_Open.indexOf( 'imggroupBy' ) < 0 )
			{
				subListIconsTag.fadeOut( 'fast', 'linear' );

				if ( ! $( '#navDrawerDiv' ).is( ':visible' ) )
				{
					$( '#focusRelegator').hide();
				}
				else
				{
					subListIconsTag.css( 'opacity', '0' );
				}
			}

			subListIconsTag.css( 'zIndex', 1);

		}
		else 
		{
			thisTag.removeClass( className_Close );
			thisTag.addClass( className_Open );

			$( '#focusRelegator').css('zIndex',100);

			thisTag.css('zIndex',199);

			if ( thisTag.attr( 'id' ) == 'nav-toggle' )
			{
				subListIconsTag.css('zIndex', FormUtil.screenMaxZindex() + 1 );
				subListIconsTag.show();
				subListIconsTag.css( 'width', FormUtil.navDrawerWidthLimit( document.body.clientWidth + 'px' ));
				subListIconsTag.css( 'left', '0px' );

				if ( $( 'div.floatListMenuSubIcons' ).hasClass( className_Open ) )
				{
					$( 'div.floatListMenuIcon' ).css('zIndex',1);
					$( 'div.floatListMenuIcon' ).click();
				}
			} 
			else
			{
				subListIconsTag.css('zIndex',200);
				subListIconsTag.fadeIn( 'fast', 'linear' );
			}

			if ( className_Open.indexOf( 'imggroupBy' ) < 0 )
			{

				$( '#focusRelegator').off( 'click' ); //clear existing click events

				$( '#focusRelegator').on( 'click' , function( event )
				{
					thisTag.css('zIndex',1);
	
					event.preventDefault();
	
					thisTag.click();
				});

				$( '#focusRelegator').show();

			}

		} 
	});	
}

FormUtil.setUpTabAnchorUI = function( tag, targetOff, eventName )
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

	// prevent multiple click events being created when listPage scrolling triggers append of new 'expandable' items
	if ( targetOff && eventName ) 
	{
		tag.find( targetOff ).off( eventName ); 
	}

	// Mobile view 'Anchor' class ('.expandable') click event handler setup
	tag.find('.expandable').on('click', function( event ) //GREG here
	{
		event.preventDefault();

		var liTag_Selected = $( this ).parent();
		var tabId = liTag_Selected.attr( 'tabId' );
		var matchingTabsTag = tag.find( ".tabs > li[tabId='" + tabId + "']");

		/* START > Greg added: 2018/11/23 */
		//FormUtil.setUserLastSelectedTab(tabId) //disabled 2019/07/04 (no longer need to set user to last page visited after refresh > logins always required)
		/* END > Added by Greg: 2018/11/24 */

		var bThisExpanded = $( this ).hasClass( 'expanded' );

		tag.find('.active').removeClass('active');
		matchingTabsTag.addClass("active");

		tag.find('.expanded').removeClass('expanded');
		tag.find('.expandable-arrow').attr('src','./images/arrow_down.svg');

		if ( bThisExpanded )
		{
			//$( this ).removeClass('expanded');
			$( this ).find( ".expandable-arrow" ).attr('src','./images/arrow_down.svg');
		}
		else
		{
			$(this).addClass('expanded');
			$(this).find( ".expandable-arrow" ).attr('src','./images/arrow_up.svg');
		}

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

FormUtil.getConfigInfo = function( returnFunc )
{
	//var url = FormUtil.getServerUrl() + '/pwaConfig.json'; //file resource to be deleted (23 May 2019: Greg + Bruno)
	//RESTUtil.retrieveJson( url, returnFunc );

	var jsonData = {
		"cws": 		 "https://cws.psi-mis.org/ws/eRefWSProd",
		"cws-train": "https://cws-train.psi-mis.org/ws/eRefWSTrain",
		"cws-stage": "https://cws-stage.psi-mis.org/ws/eRefWSStage",
		"cws-dev":   "https://cws-dev.psi-mis.org/ws/eRefWSDev3" //use 'eRefWSDev4' (4) when server issues exist
	};

	returnFunc( true, jsonData );
}

FormUtil.getAppInfo = function( returnFunc )
{	
	var url = FormUtil.getWsUrl( '/api/getPWAInfo' );

	RESTUtil.retrieveJson( url, returnFunc );
}

FormUtil.getDataServerAvailable = function( returnFunc )
{	
	var url = FormUtil.getWsUrl( '/api/available' );

	RESTUtil.retrieveJson( url, returnFunc );
	//returnFunc( true, { "msg": "Server available", "available": false} );
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

			if ( val.toString().length )
			{
				if ( val.indexOf( '{' ) && val.indexOf( '}' ) )
				{
					FormUtil.evalReservedField( tag, val );
				}
				else
				{
					tag.val( val );
				}
			}
			else
			{
				tag.val( val );
			}
			
		}

		if ( returnFunc ) returnFunc();
	}
}

FormUtil.evalReservedField = function( tagTarget, val )
{
	if ( val.indexOf( '$${' ) >= 0 )
	{
		// do something ?
	}
	else if ( val.indexOf( '##{' ) >= 0)
	{
		if ( val.indexOf( 'getCoordinates()' ) >= 0 )
		{
			FormUtil.refreshGeoLocation( function() {
				if ( FormUtil.geoLocationLatLon.length )
				{
					MsgManager.notificationMessage ( '<img src="images/sharp-my_location-24px.svg">', 'notificationGray', undefined, '', 'right', 'top', 1000, false, undefined, undefined, true, true );
				}
				tagTarget.val( FormUtil.geoLocationCoordinates );
			});
		}
		else if ( val.indexOf( 'newDateAndTime()' ) >= 0 )
		{
			tagTarget.val( (new Date() ).toISOString() );
		}
		else if ( val.indexOf( 'generatePattern(' ) >= 0 )
		{
			var pattern = Util.getParameterInside( val, '()' );
			tagTarget.val( Util.getValueFromPattern( tagTarget, pattern, false ) );
		}
		else if ( val.indexOf( 'getAge(' ) >= 0 )
		{
			var pattern = Util.getParameterInside( val, '()' );
			tagTarget.val( Util.getAgeValueFromPattern( tagTarget, pattern ) );
		}
	}
	else
	{
		tagTarget.val( val );
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

FormUtil.trackPayload = function( payloadName, jsonData, optClear, actDefName )
{
	var traceData = sessionStorage.getItem('WSexchange');
	var traceObj;

	if ( !traceData ) traceObj = {};
	else traceObj = JSON.parse( traceData );

	if ( traceData )
	{
		traceObj[ payloadName ] = jsonData;

		if ( optClear)
		{
			traceObj[ optClear ] = '';
		}
	}
	else
	{
		if ( optClear)
		{
			traceObj = { [payloadName]: jsonData, [optClear]: '', history: [] };
		}
		else
		{
			traceObj = { [payloadName]: jsonData, history: [] };
		}
	}

	traceObj.history.push ( { "actionType": payloadName, "actionDef": actDefName, "created": (new Date() ).toISOString(), "data": jsonData } );

	sessionStorage.setItem( 'WSexchange', JSON.stringify( traceObj ) );

}

/* START > Added by Greg: 2018/12/103 */

FormUtil.setLastPayload = function( payloadName, jsonData, optClear )
{
	var sessionData = localStorage.getItem('session');

	if ( sessionData )
	{
		var SessionObj = JSON.parse( sessionData );

		if ( SessionObj.last )
		{
			SessionObj.last[ payloadName ] = jsonData;

			if ( optClear)
			{
				SessionObj.last[ optClear ] = '';
			}
		}
		else
		{
			if ( optClear)
			{
				SessionObj.last = { [payloadName]: jsonData, [optClear]: '' };
			}
			else
			{
				SessionObj.last = { [payloadName]: jsonData };
			}
		}

		localStorage.setItem( 'session', JSON.stringify( SessionObj ) );
	}
}

FormUtil.getLastPayload = function( namedPayload )
{
	var sessionData = sessionStorage.getItem('WSexchange');

	if ( sessionData )
	{
		var SessionObj = JSON.parse( sessionData );

		if ( SessionObj && SessionObj[ namedPayload ] )
		{
			return SessionObj[ namedPayload ];
		}

	}
}
/* END > Added by Greg: 2018/12/13 */

FormUtil.performReget = function( regObj, option )
{		
	if ( ConnManager.isOffline() )
	{
		// MISSING TRANSLATION
		MsgManager.notificationMessage ( 'Cannot re-register service worker when Network Offline', 'notificationDark', undefined, '', 'right', 'top' );
	}
	else
	{
		if ( regObj !== undefined )
		{
			if ( option === "update" )
			{
				FormMsgManager.appBlock( "Service Worker Updating.." );
				regObj.update().then( function( ){
					if ( FormUtil.PWAlaunchFrom == 'homeScreen')
					{
						location.reload(); //forceGet parameter sometimes unpredictible in homeScreen mode?? Greg : test more + verify
					}
					else
					{
						location.reload( true );
					}
				});
				FormMsgManager.appUnblock();	
			}
			else
			{
				FormMsgManager.appBlock( "Updating App..." );

				regObj.unregister().then(function(boolean) {
					//console.log('Service Worker UnRegistered');
					// if boolean = true, unregister is successful
					if ( FormUtil.PWAlaunchFrom == 'homeScreen')
					{
						location.reload(); //forceGet parameter sometimes unpredictible in homeScreen mode?? Greg : test more + verify
					}
					else
					{
						location.reload( true );
					}

				});
	
				FormMsgManager.appUnblock();	
			}
		}
		else
		{
			// MISSING TRANSLATION
			MsgManager.notificationMessage ( 'Service worker not found, reloading app', 'notificationDark', undefined, '', 'right', 'top' );

			if ( FormUtil.PWAlaunchFrom == 'homeScreen')
			{
				location.reload(); //forceGet parameter sometimes unpredictible in homeScreen mode?? Greg : test more + verify
			}
			else
			{
				location.reload( true );
			}
		}  
	}
}

FormUtil.deleteCacheKeys = function( thenFunc )
{
	if ( caches )
	{
		caches.keys().then(function(names) 
		{
			for (let name of names)
			{
				//console.log( 'eval cache obj [' + name + ']');
				if ( name.toString().indexOf( 'google' ) >= 0 || name.toString().indexOf( 'workbox' ) >= 0 )
				{
					//console.log( 'skipping cache obj ' + name );
				}
				else
				{
					console.log( 'deleting cacheStorage obj: ' + name );
					caches.delete(name);
				}
			}

			if ( thenFunc )
			{
				//setTimeout( function() {
					thenFunc();
				//}, 1000 );
			}

		});
	}
}

FormUtil.swCacheReset = function( returnFunc )
{
	if ( caches )
	{
		var cachesCount = 0;
		var deteteLeft = 0;

		caches.keys().then(function(names) {

			cachesCount = names.length;
			deteteLeft = cachesCount;

			for ( let name of names )
			{
				console.log( 'deleting cache: ' + name );

				caches.delete(name).then( function( status ) {

					console.log( 'Delete Status: ' + status );

					cachesCount--;
					if ( status ) deteteLeft--;

					if ( cachesCount <= 0 )
					{
						var allDeleted = ( deteteLeft <= 0 );
						returnFunc( allDeleted );
					} 
				});
			}
		});	
	}
	else
	{
		// Browser not supporting Service Worker Caches
		returnFunc( false );
	}
}

FormUtil.getMyListData = function( listName, retFunc )
{
	var redList = {}, returnList = {};

	DataManager.getData( listName, function( redList ) {

		if ( redList )
		{
			returnList = redList.list.filter(a=>a.owner==FormUtil.login_UserName);
			//return returnList;
			if ( retFunc ) retFunc( returnList );
		}
		else
		{
			if ( retFunc ) retFunc( undefined );
		}

	});
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
		$( 'div.indeterminate' ).css('width', width );
		$( 'div.determinate' ).css('width', width );
	}
	$( '#divProgressBar' ).css( 'display', 'block' );
	$( '#divProgressBar' ).css( 'zIndex', '200' );
	$( '#divProgressBar' ).show();
}

FormUtil.hideProgressBar = function()
{
	$( '#divProgressBar' ).hide();
	$( '#divProgressBar' ).css( 'zIndex', '0' );
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

FormUtil.defaultLanguage = function( exeFunc )
{
	//defaultLanguage (from dcdConfig) ? does it match as a supported language option
	DataManager.getSessionData( function( sessData){

		if ( sessData && sessData.language )
		{
			if ( exeFunc ) exeFunc( sessData.language );
		}
		else
		{
			if ( exeFunc ) exeFunc( (navigator.language).toString().substring(0,2) );
		}
	});

};

FormUtil.getTermAttr = function( jsonItem )
{
	return ( jsonItem.term ) ? 'term="' + jsonItem.term + '"' : '';
};

FormUtil.getTermAttrStr = function( term )
{
	return ( term ) ? 'term="' + term + '"' : '';
};

FormUtil.addTag_TermAttr = function( tags, jsonItem )
{
	if ( jsonItem.term ) tags.attr( 'term', jsonItem.term );
};


FormUtil.appendActivityTypeIcon = function ( iconObj, activityType, statusOpt, cwsRenderObj)
{
	if ( iconObj ) //while sync action runs, the current iconObj object may not be rendered on the screen
	{
		// read local SVG xml structure, then replace appropriate content 'holders'
		$.get( activityType.icon.path, function(data) {

			var svgObject = ( $(data)[0].documentElement );

			if ( activityType.icon.colors )
			{
				if ( activityType.icon.colors.background )
				{
					$( svgObject ).html( $(svgObject).html().replace(/{BGFILL}/g, activityType.icon.colors.background) );
					$( svgObject ).attr( 'colors.background', activityType.icon.colors.background );
				}
				if ( activityType.icon.colors.foreground )
				{
					$( svgObject ).html( $(svgObject).html().replace(/{COLOR}/g, activityType.icon.colors.foreground) );
					$( svgObject ).attr( 'colors.foreground', activityType.icon.colors.foreground );
				}

			}

			if ( statusOpt && statusOpt.name == cwsRenderObj.status_redeem_submit )
			{
				$( svgObject ).css( 'opacity', '1' );
			}
			else
			{
				$( svgObject ).css( 'opacity', '0.4' );
			}

			$( iconObj ).empty();
			$( iconObj ).append( svgObject );

			if ( FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings.redeemDefs && FormUtil.dcdConfig.settings.redeemDefs.activityIconSize && $(iconObj).html() )
			{
				$( iconObj ).html( $(iconObj).html().replace(/{WIDTH}/g, FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width ) );
				$( iconObj ).html( $(iconObj).html().replace(/{HEIGHT}/g, FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.height ) );

			}

			if ( $(iconObj).html() )
			{
				var statusIconObj = $( '<div id="' + iconObj.attr( 'id' ).replace( 'listItem_icon_activityType_','icon_status_' ) + '" style="position:relative;left:' + ( FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width - ( FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.width / 1) ) + 'px;top:-' + (FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.height + 6) + 'px;">&nbsp;</div>' );

				$( '#' + iconObj.attr( 'id' ) ).css( 'width', ( FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width + 4 ) + 'px' )
				$( iconObj ).append( statusIconObj )	

				FormUtil.appendStatusIcon ( statusIconObj, statusOpt )
			}

		});

	}

}

FormUtil.appendStatusIcon = function ( targetObj, statusOpt, skipGet )
{
	if ( FormUtil.dcdConfig )
	{
		if ( skipGet != undefined && skipGet == true )
		{
			var iW, iH, sStyle = 'width:' + 18 + 'px;height:' + 18 + 'px;';

			$( targetObj ).append( $( '<img src="' + statusOpt.icon.path + '" style="' + sStyle + '" />' ) );
		}
		else
		{
		// read local SVG xml structure, then replace appropriate content 'holders'

			$.get( statusOpt.icon.path, function(data) {

				var svgObject = ( $(data)[0].documentElement );

				if ( statusOpt.icon.colors )
				{
					if ( statusOpt.icon.colors.background )
					{
						$( svgObject ).html( $(svgObject).html().replace(/{BGFILL}/g, statusOpt.icon.colors.background) );
						$( svgObject ).attr( 'colors.background', statusOpt.icon.colors.background );
					}
					if ( statusOpt.icon.colors.foreground )
					{
						$( svgObject ).html( $(svgObject).html().replace(/{COLOR}/g, statusOpt.icon.colors.foreground) );
						$( svgObject ).attr( 'colors.foreground', statusOpt.icon.colors.foreground );
					}
				}

				$( targetObj ).empty();
				$( targetObj ).append( svgObject );

				if ( FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings.redeemDefs && FormUtil.dcdConfig.settings.redeemDefs.statusIconSize )
				{
					$( targetObj ).html( $(targetObj).html().replace(/{WIDTH}/g, FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.width ) );
					$( targetObj ).html( $(targetObj).html().replace(/{HEIGHT}/g, FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.height ) );
				}

			});
			
		}

	}

}

FormUtil.setStatusOnTag = function( statusSecDivTag, itemData, cwsRenderObj ) 
{

	var imgSyncIconTag = statusSecDivTag.find( 'small.syncIcon img' );

	if ( itemData.status === cwsRenderObj.status_redeem_submit )
	{
		imgSyncIconTag.attr ( 'src', 'images/sync-n.svg' );
	}
	else if ( itemData.status === cwsRenderObj.status_redeem_failed )
	{

		if ( !itemData.networkAttempt || (itemData.networkAttempt && itemData.networkAttempt < cwsRenderObj.storage_offline_ItemNetworkAttemptLimit ) )
		{
			imgSyncIconTag.attr ( 'src', 'images/sync-banner.svg' ); // should show the 'active' icon: sync-banner.svg
		}
		else
		{
			if ( itemData.networkAttempt >= cwsRenderObj.storage_offline_ItemNetworkAttemptLimit )
			{
				imgSyncIconTag.attr ( 'src', 'images/sync_error.svg' );
			}
			else
			{
				imgSyncIconTag.attr ( 'src', 'images/sync-n.svg' );
			}
		}
	}
	else
	{
		imgSyncIconTag.attr ( 'src', 'images/sync-banner.svg' );
	}

	imgSyncIconTag.css ( 'transform', '' );

}


FormUtil.getActivityType = function( itemData )
{
	var opts = FormUtil.dcdConfig.settings.redeemDefs.activityTypes;

	for ( var i=0; i< opts.length; i++ )
	{
		if ( opts[i].name == itemData.activityType )
		{
			return opts[i];
		}
	}

}

FormUtil.getStatusOpt = function( itemData )
{
	var opts = FormUtil.dcdConfig.settings.redeemDefs.statusOptions;

	for ( var i=0; i< opts.length; i++ )
	{
		if ( opts[i].name == itemData.status )
		{
			return opts[i];
		}
	}

}

FormUtil.listItemActionUpdate = function( itemID, prop, value )
{
	
}

FormUtil.gAnalyticsEventAction = function( returnFunc )
{
	var dcd = DataManager.getUserConfigData();
	var ret = '';
	if ( dcd && dcd.orgUnitData )
	{
		//CUSTOMIZE AS REQUIRED
		ret = 'country:'+dcd.orgUnitData.countryOuCode + ';userName:' + FormUtil.login_UserName + ';network:' + ConnManager.connStatusStr( ConnManager.isOnline() ) + ';appLaunch:' + FormUtil.PWAlaunchFrom();
	}
	else
	{
		ret = 'country:none;userName:' + FormUtil.login_UserName + ';network:' + ConnManager.connStatusStr( ConnManager.isOnline() ) + ';appLaunch:' + FormUtil.PWAlaunchFrom();
	}

	if ( returnFunc ) returnFunc( ret );

}

FormUtil.gAnalyticsEventLabel = function()
{
	return 'networkOnline: ' + ConnManager.isOnline() + ', dataServerOnline: ' + ConnManager.dataServerOnline()
}

FormUtil.PWAlaunchFrom = function()
{
	if ( (matchMedia('(display-mode: standalone)').matches) || ('standalone' in navigator) )
	{
		// Android and iOS 11.3+
		return 'homeScreen';
   	} 
   else
   {
		// useful for iOS < 11.3
		return 'browser';
   }
}


FormUtil.jsonReadFormat = function( jsonData )
{
	if ( jsonData ) return JSON.stringify( jsonData ).toString().replace(/{/g,'').replace(/}/g,'').replace(/":"/g,': ');
	else return '';
}

FormUtil.lookupJsonArr = function( jsonData, fldSearch, fldValue, searchValue )
{
	for ( var i=0; i< jsonData.length; i++ )
	{
		if ( jsonData[ i ][ fldSearch ] == searchValue )
		{
			return jsonData[ i ][ fldValue ];
		}

	}
}

FormUtil.shareApp = function() {
    var text = "See what I've found: an installable Progressive Web App for Connecting with Sara";
    if ('share' in navigator) {
        navigator.share({
            title: 'CwS: Connect App',
            text: text,
            url: location.href,
        })
    } else {
        // Here we use the WhatsApp API as fallback; remember to encode your text for URI
        location.href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text + ' - ') + location.href
    }
}

FormUtil.testNewSWavailable = function()
{
	console.log( 'testing new SW available ');
	window['isUpdateAvailable']
	.then(isAvailable => {
		console.log( ' ~ SW isUpdateAvailable: ' + isAvailable );
	  if (isAvailable) {
  
		var btnUpgrade = $( '<a class="notifBtn" term=""> REFRESH </a>');
  
		// move to cwsRender ?
		$( btnUpgrade ).click ( () => {
		  location.reload( true );
		});
  
		// MISSING TRANSLATION
		MsgManager.notificationMessage ( 'New updates found and applied!', 'notificationDark', btnUpgrade, '', 'left', 'bottom', 5000 );
	  }
	});

}

FormUtil.getGeoLocation = function()
{ // --> move to geolocation.js class
	if ( FormUtil.geoLocationTrackingEnabled ) return FormUtil.geoLocationLatLon;
	else return '';
}

FormUtil.getPositionObjectJSON = function( pos )
{
	var retJSON = {};

	for(var propt in pos.coords)
	{
		retJSON[ propt ] = pos.coords[propt];
	}

	return retJSON;
}

FormUtil.refreshGeoLocation = function( returnFunc )
{ // --> move to geolocation.js class
	var error_PERMISSION_DENIED = 1;

	if ( navigator.geolocation )
	{
		navigator.geolocation.getCurrentPosition( function(position) 
		{
			var myPosition = FormUtil.getPositionObjectJSON( position );
			var lat = myPosition.latitude;
			var lon = myPosition.longitude;
			var userLocation;

			if ( lat == null)
			{
				userLocation = ''; //GPS not activated
				FormUtil.geoLocationError = 'GPS not activated';
			}
			else
			{
				userLocation = parseFloat( lat ).toFixed( 6 ) + ', ' + parseFloat( lon ).toFixed( 6 ); //6 decimals is crazy accurate, don't waste time with more (greg)
				FormUtil.geoLocationError = '';
			}

			FormUtil.geoLocationLatLon = userLocation;
			FormUtil.geoLocationCoordinates = JSON.stringify( myPosition );

			if ( returnFunc ) returnFunc();

		},  function ( error ) 
			{
				FormUtil.geoLocationError = error.code; //Error locating your device

				if (error.code == error.PERMISSION_DENIED)
				{
					FormUtil.geoLocationLatLon = '';
				}
				else
				{
					FormUtil.geoLocationLatLon = '';
				}

				if ( returnFunc ) returnFunc();

			},
			{enableHighAccuracy: false, timeout: 20000 } // enableHighAccuracy set to FALSE by Greg: if 'true' may result in slower response times or increased power consumption
		);
	}
	else
	{
		FormUtil.geoLocationLatLon = '';
		FormUtil.geoLocationError = -1;
		FormUtil.geoLocationCoordinates = '';
	}

}

FormUtil.geolocationAllowed = function()
{
	navigator.permissions.query({
		name: 'geolocation'
	}).then(function(result) {

		FormUtil.geoLocationState = result.state;

		/*if (result.state == 'granted') {
			report(result.state);
			geoBtn.style.display = 'none';
		} else if (result.state == 'prompt') {
			report(result.state);
			geoBtn.style.display = 'none';
			navigator.geolocation.getCurrentPosition(revealPosition, positionDenied, geoSettings);
		} else if (result.state == 'denied') {
			report(result.state);
			geoBtn.style.display = 'inline';
		}*/

		result.onchange = function() {
			FormUtil.geoLocationState = result.state;
		}
	});

}

FormUtil.screenMaxZindex = function(parent, limit)
{

	limit = limit || Infinity;
    parent = parent || document.body;
    var who, temp, max= 1, opacity, i= 0;
    var children = parent.childNodes, length = children.length;

	function deepCss(who, css) {
		var sty, val, dv= document.defaultView || window;
		if (who.nodeType == 1) {
			sty = css.replace(/\-([a-z])/g, function(a, b){
				return b.toUpperCase();
			});
			if ( sty && who && who.style[sty] )
			{
				val = who.style[sty];
				if (!val) {
					if(who.currentStyle) val= who.currentStyle[sty];
					else if (dv.getComputedStyle) {
						val= dv.getComputedStyle(who,"").getPropertyValue(css);
					}
				}
			}
		}
		return val || "";
	}

    while(i<length){
        who = children[i++];
        if (who.nodeType != 1) continue; // element nodes only
        opacity = deepCss(who,"opacity");
        if (deepCss(who,"position") !== "static") {
            temp = deepCss(who,"z-index");
            if (temp == "auto") { // positioned and z-index is auto, a new stacking context for opacity < 0. Further When zindex is auto ,it shall be treated as zindex = 0 within stacking context.
                (opacity < 1)? temp=0:temp = FormUtil.screenMaxZindex(who);
            } else {
                temp = parseInt(temp, 10) || 0;
            }
        } else { // non-positioned element, a new stacking context for opacity < 1 and zindex shall be treated as if 0
            (opacity < 1)? temp=0:temp = FormUtil.screenMaxZindex(who);
        }
        if (temp > max && temp <= limit) max = temp;                
    }
	return max;

}

FormUtil.wsExchangeDataGet = function( formDivSecTag, recordIDlist, localResource )
{
	var inputsJson = {};
	var inputTags = formDivSecTag.find( 'input,select' );
	var arrPayStructure = localResource.split( '.' );
	var WSexchangeData = JSON.parse( sessionStorage.getItem( 'WSexchange' ) );
	var lastPayload = WSexchangeData[ arrPayStructure[ 0 ] ];

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
			if ( recordIDlist === undefined )
			{			
				getVal = true;
			}
			else
			{
				if ( recordIDlist.indexOf( nameVal ) >= 0 ) getVal = true;
			}
		}

		if ( getVal )
		{
			var val = FormUtil.getTagVal( inputTag );
			if ( val === null || val === undefined ) val = '';

			//inputsJson[ FormUtil.getTagValPair( getUIDPairList, nameVal ) ] = val;
			inputsJson[ nameVal ] = val;
		}
	});

	//console.log( WSexchangeData );
	//console.log( lastPayload );

	var retData = FormUtil.recursiveWSexchangeGet( WSexchangeData, arrPayStructure, 0, recordIDlist[ 0 ], inputsJson[ recordIDlist[ 0 ] ] );
	lastPayload[ 'displayData' ] = retData;

	if ( retData && lastPayload[ 'resultData' ] )
	{
		lastPayload[ 'resultData' ][ 'status' ] = "foundOne";
	}

	return lastPayload;

}

FormUtil.getTagValPair = function( getUIDPairList, nameVal )
{
	var ret = nameVal;

	for ( var t=0; t< getUIDPairList.length; t++ )
	{
		var arrPair = getUIDPairList[ t ].toString().split( ':' );

		if ( arrPair[ 0] == nameVal )
		{
			ret = arrPair[ 1 ];
			break;
		}
	}

	return ret;

}

FormUtil.recursiveWSexchangeGet = function( targetDef, dataTargetHierarchy, itm, keyFind, keyValue)
{
	var targetArr;

	if ( dataTargetHierarchy[ itm ] )
	{
		// check if next item exists > if true then current item is object ELSE it is array (destination array for values)
		if ( dataTargetHierarchy[ itm + 1 ] )
		{
			return FormUtil.recursiveWSexchangeGet( targetDef[ dataTargetHierarchy[ itm ] ], dataTargetHierarchy, parseInt( itm ) + 1, keyFind, keyValue )
		}
		else
		{
			var arrSpecRaw = ( dataTargetHierarchy[ itm ] ).toString().replace( '[', '' ).replace( ']' ,'' );
			var targetArr = targetDef[ arrSpecRaw ]; //always returns 2-level array (array of arrays)

			for ( var i=0; i< targetDef[ arrSpecRaw ].length; i++ )
			{

				for ( var t=0; t< targetArr[ i ].length; t++ )
				{

					if ( targetArr[ i ][ t ].id == keyFind && targetArr[ i ][ t ].value == keyValue )
					{
						return targetArr[ i ];
					}

				}

			}

		}

	}


}

FormUtil.setPayloadConfig = function( blockObj, payloadConfig, formDefinition )
{
	var formDivSecTag = blockObj.parentTag;
	var inputTags = formDivSecTag.find( 'input,select' );

	inputTags.each( function()
	{		
		var inputTag = $(this);
		var dataTarg = FormUtil.getFormFieldPayloadConfigDataTarget( payloadConfig, inputTag.attr( 'name' ), formDefinition )

		if ( dataTarg )
		{
			if ( dataTarg.dataTargets )
			{
				inputTag.attr( 'dataTargets', escape( JSON.stringify( dataTarg.dataTargets ) ) );
			}
			if ( dataTarg.defaultValue )
			{
				if ( dataTarg.defaultValue.length && dataTarg.defaultValue.indexOf( 'generatePattern(' ) > 0 && dataTarg.defaultValue.indexOf( 'form:' ) > 0 )
				{
					var tagTarget = formDivSecTag.find( '[name="' + dataTarg.id + '"]' );

					if ( tagTarget )
					{
						var pattern = Util.getParameterInside( dataTarg.defaultValue, '()' );

						inputTag.val( Util.getValueFromPattern( inputTag, pattern ) );
					}

				}
				else
				{
					inputTag.val( dataTarg.defaultValue );
				}
			}
		}

	});

}

FormUtil.getFormFieldPayloadConfigDataTarget = function( payloadConfigName, fldId, formDefArr )
{
	// fetches payloadConfiguration dataTarget for formDefinition's field/control

	for ( var i=0; i< formDefArr.length; i++ )
	{
		if ( formDefArr[ i ].id == fldId )
		{
			if ( formDefArr[ i ].payload && formDefArr[ i ].payload[ payloadConfigName ] )
			{
				return formDefArr[ i ].payload[ payloadConfigName ];
			}
		}
	}

}