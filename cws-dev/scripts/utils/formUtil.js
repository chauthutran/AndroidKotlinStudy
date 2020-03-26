// -------------------------------------------
// -- FormUtil Class/Methods

function FormUtil() {}


FormUtil.staticWSpath = '';

FormUtil.login_UserName = '';
FormUtil.login_Password = '';
FormUtil.login_server = '';
FormUtil.login_UserRole = [];
FormUtil.orgUnitData;
FormUtil.dcdConfig;

FormUtil.blockType_MainTab = 'mainTab';
FormUtil.blockType_MainTabContent = 'mainTabContent';
FormUtil.block_payloadConfig = '';

FormUtil._gAnalyticsTrackId = "UA-134670396-1";
FormUtil._getPWAInfo;

FormUtil.geoLocationTrackingEnabled = false;  // --> move to geolocation.js class
FormUtil.geoLocationLatLon;  // --> move to geolocation.js class
FormUtil.geoLocationState;  // --> move to geolocation.js class
FormUtil.geoLocationError;  // --> move to geolocation.js class
FormUtil.geoLocationCoordinates;  // --> move to geolocation.js class

FormUtil.records_redeem_submit = 0;
FormUtil.records_redeem_queued = 0;
FormUtil.records_redeem_failed = 0;
FormUtil.syncRunning = 0;

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
};


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
};


FormUtil.generateInputJson = function( formDivSecTag, getValList, formsJsonGroup )
{
	// Input Tag values
	var inputsJson = {};
	var inputTags = formDivSecTag.find( 'input,checkbox,select' );

	inputTags.each( function()
	{		
		var inputTag = $(this);	
		var attrDisplay = inputTag.attr( 'display' );
		var nameVal = inputTag.attr( 'name' );
		var dataGroup = inputTag.attr( 'dataGroup' );
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

			if ( formsJsonGroup )
			{
				// NOTE: If grouping for input data exists (by '.' in name or 'dataGroup' attr)
				// Add to 'formsJsonGroup' object - to be used in payloadTemplate
				// Also, if '.' in name exists, extract 1st one as groupName and use rest of it as nameVal.
				nameVal = FormUtil.setFormsJsonGroup( nameVal, dataGroup, formsJsonGroup );
			}

			inputsJson[ nameVal ] = val;
		}
	});		

	return inputsJson;
};


FormUtil.setFormsJsonGroup = function( nameVal, dataGroup, formsJsonGroup )
{
	// NOTE: If grouping for input data exists (by '.' in name or 'dataGroup' attr)
	// Add to 'formsJsonGroup' object - to be used in payloadTemplate
	// Also, if '.' in name exists, extract 1st one as groupName and use rest of it as nameVal.

	try
	{
		// if '.' has in 'nameVal', mark it as group..
		// if dataGroup exists, put it ..
		if ( nameVal.indexOf( '.' ) > 0 )
		{
			var splitNames = nameVal.split( '.' );
			var groupName = splitNames[0];
			nameVal = nameVal.substr( groupName.length + 1 );  // THIS ALSO AFFECTS BELOW inputsJson nameVal as well.

			if ( !formsJsonGroup[ groupName ] ) formsJsonGroup[ groupName ] = {};

			formsJsonGroup[ groupName ].nameVal = val;
		}

		if ( dataGroup ) 
		{
			if ( !formsJsonGroup[ dataGroup ] ) formsJsonGroup[ dataGroup ] = {};

			formsJsonGroup[ dataGroup ].nameVal = val;
		}
	}
	catch( errMsg )
	{
		console.log( 'Error in FormUtil.setFormsJsonGroup, errMsg: ' + errMsg );
	}

	return nameVal;
}



FormUtil.inputPreviewLabel = function( formInput )
{
	var lbl;
	var sibs = $( formInput ).siblings();

	sibs.each( function() {

		var tag = $( this );

		if ( tag[ 0 ].nodeName === "LABEL" )
		{
			lbl = tag[ 0 ].innerText;
		}

	})

	if ( lbl == undefined )
	{

		if ( $( formInput ).closest( '.inputDiv' ).find( 'label' ) && $( formInput ).closest( '.inputDiv' ).find( 'label' )[ 0 ] )
		{
			lbl = $( formInput ).closest( '.inputDiv' ).find( 'label' )[ 0 ].innerText;
		}
		else
		{
			console.log( $( formInput ).closest( '.inputDiv' ) ); //.find( 'label' )[ 0 ].innerText;
		}
	}

	return lbl;

}

FormUtil.generateInputPreviewJson = function( formDivSecTag, getValList )
{
	// Input Tag values
	var retDataArray = [];
	var inputsJson;
	var inputTags = formDivSecTag.find( '.formGroupSection,input,checkbox,select' );

	inputTags.each( function()
	{
		var inputTag = $( this );	
		var getVal_visible = inputTag.is(':visible') || inputTag.hasClass( 'MULTI_CHECKBOX' ) || inputTag.hasClass( 'CHECKBOX' ) || inputTag.hasClass( 'RADIO' ) ;

		if ( getVal_visible )
		{
			if ( inputTag[ 0 ].nodeName != "LABEL" && inputTag[ 0 ].nodeName != "DIV" )
			{
				console.log( inputTag[ 0 ].nodeName );
				var inputLabel = FormUtil.inputPreviewLabel( inputTag ); //$( inputTag ).closest( 'label' );	
			}

			if ( inputTag[ 0 ].nodeName === "LABEL" )
			{
				if ( ( inputTag[ 0 ].innerText ).toString().length > 0 )
				{
					inputsJson = { name: inputTag[ 0 ].innerText, type: inputTag[ 0 ].nodeName, value: [] };
				}
			}
			else if ( inputTag[ 0 ].nodeName === "INPUT" )
			{
				if ( ( inputTag[ 0 ].name ).toString().length > 0 && ( ! inputTag.hasClass( 'inputHidden' ) || inputTag.hasClass( 'MULTI_CHECKBOX' ) || inputTag.hasClass( 'RADIO' ) ) || ( inputTag.attr( 'updates' ) == undefined && inputTag.hasClass( 'CHECKBOX' )  ) )
				{
					inputsJson = { name: ( inputLabel ? inputLabel : inputTag[ 0 ].name ), type: inputTag[ 0 ].nodeName, value: FormUtil.getTagVal( inputTag ) };
				}
			}
			else if ( inputTag[ 0 ].nodeName === "SELECT" )
			{
				inputsJson = { name: ( inputLabel ? inputLabel : inputTag[ 0 ].name ), type: inputTag[ 0 ].nodeName, value: FormUtil.getTagVal( inputTag ) };
			}

			if ( inputsJson )
			{
				retDataArray.push( inputsJson );
			}

			inputsJson = undefined;

		}


	});		

	return retDataArray;
}

FormUtil.generateInputTargetPayloadJson = function( formDivSecTag, getValList )
{
	var inputsJson = {};
	var inputTags = formDivSecTag.find( 'input,checkbox,select' );
	var inputTargets = [];
	var uniqTargs = [];

	if ( inputTags.length )
	{
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

	  if ( (location.href).indexOf('localhost') >= 0 || (location.href).indexOf('127.0.0.1:8080') >= 0 )
		{
			console.log ( inputsJson );
			console.log ( JSON.stringify( inputsJson, null, 4) );	
		}
			
	}

	return inputsJson;
}

FormUtil.recursiveJSONbuild = function( targetDef, dataTargetHierarchy, itm)
{
	// construct empty 'shell' of payload design structure
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
					targetDef[ dataTargetKeyItem ].push ( { [ arrSpecArr[ 0 ].trim() ]: fillKey, [ arrSpecArr[ 1 ].trim() ]: dataValue } );
				}
				else
				{
					targetDef[ dataTargetKeyItem ].push ( { [ fillKey.trim() ]: dataValue } );
				}
			}
			else
			{
				targetDef[ dataTargetKeyItem ] [ fillKey ] = dataValue;
			}
		}
		else if ( ( dataTargetKeyItem ).length == 0 )
		{
			if ( Array.isArray( targetDef[ dataTargetKeyItem ] ) )
			{
				if ( arrSpecArr.length )
				{
					targetDef[ dataTargetKeyItem ].push ( { [ arrSpecArr[ 0 ].trim() ]: fillKey, [ arrSpecArr[ 1 ].trim() ]: dataValue } );
				}
				else
				{
					targetDef[ dataTargetKeyItem ].push ( { [ fillKey.trim() ]: dataValue } );
				}
			}
			else
			{
				targetDef[ fillKey ] = dataValue;
			}
			
		}
	}
}


FormUtil.generateLoadingTag = function( btnTag )
{
	var loadingTag;

	if ( btnTag.is( 'div' ) )
	{
		loadingTag = $( '<div class="loadingImg" style="float: right; margin-left: 8px;"><img src="images/loading_small.svg"></div>' );
		btnTag.append( loadingTag );
	}
	else if ( btnTag.is( 'button' ) )
	{
		loadingTag = $( '<div class="loadingImg" style="display: inline-block; margin-left: 8px;"><img src="images/loading_small.svg"></div>' );
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


// POST Request required json prepare
FormUtil.getFetchWSJson = function( payloadJson, headerJson )
{
	if ( WsApiManager.useDWS() )
	{
		var fetchJson = {
			method: 'POST', 
			headers: { 'Authorization': 'Basic cHdhOjUyOW4zS3B5amNOY0JNc1A=' },
		    body: '{}'
	   };
	}
	else
	{
		var fetchJson = {
			method: 'POST' //,headers: { 'usr': '', 'pwd': '' }  <-- do not use this due to disabled CORS case not passing headers var.
		   ,body: '{}'
	   };
	}

	if ( FormUtil.checkLoginSubmitCase( payloadJson ) )
	{
		if ( ! WsApiManager.useDWS() )
		{
			payloadJson.userName = payloadJson.submitLogin_usr;
			payloadJson.password = payloadJson.submitLogin_pwd;	
		}
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
	/*if ( WsApiManager.useDWS() )
	{
		var url = WsApiManager.composeWsFullUrl( apiPath );

		RESTUtil.retrieveDWSJson( url, function( success, returnJson )
		{
			if ( loadingTag ) loadingTag.remove();

			if ( returnFunc ) returnFunc( returnJson );
		});
	}
	else
	{

		var url = WsApiManager.composeWsFullUrl( apiPath ); //  queryLoc --> '/api/loginCheck'

		RESTUtil.retrieveJson( url, function( success, returnJson )
		{
			if ( loadingTag ) loadingTag.remove();

			if ( returnFunc ) returnFunc( returnJson );
		});

	}*/
	
	var url = WsApiManager.composeWsFullUrl( apiPath ); //  queryLoc --> '/api/loginCheck'

	RESTUtil.retrieveJson( url, function( success, returnJson )
	{
		if ( loadingTag ) loadingTag.remove();

		if ( returnFunc ) returnFunc( returnJson );
	});
}

// POST Request to Web Service..
FormUtil.wsSubmitGeneral = function( apiPath, payloadJson, loadingTag, returnFunc )
{	
	var url; 

	//if apiPath already contains correctly formed path, do not change 
	if ( apiPath.indexOf( WsApiManager.domain_psiConnect ) < 0 && apiPath.indexOf( WsApiManager.domain_psiMIS ) < 0 )
	{
		url = WsApiManager.composeWsFullUrl( apiPath );
	}
	else
	{
		url = apiPath;
	}

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
	console.log( userName + ':' + password );
	if ( WsApiManager.useDWS() )
	{
		var apiPath = ( '/PWA.loginCheck' ); //WsApiManager.composeWsFullUrl

		var payloadJson = { 
			'userName': userName,
			'password': password,
			'pwaStage': WsApiManager.stageName()  
		};
		//WsApiManager.getStageName()
	}
	else
	{
		var apiPath = ( '/api/loginCheck' ); //WsApiManager.composeWsFullUrl

		var payloadJson = { 'submitLogin': true
			, 'submitLogin_usr': userName
			, 'submitLogin_pwd': password
			, 'dcConfigGet': 'Y'
			, pwaStage: WsApiManager.getStageName() 
		};

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
	if ( WsApiManager.useDWS() )
	{
		return ( payloadJson && payloadJson.pwaStage );
	}
	else
	{
		return ( payloadJson && payloadJson.submitLogin );
	}
	
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
			else 
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
		var bThisExpanded = $( this ).hasClass( 'expanded' );

		tag.find('.active').removeClass('active');
		matchingTabsTag.addClass("active");

		tag.find('.expanded').removeClass('expanded');
		tag.find('.expandable-arrow').attr('src','./images/arrow_down.svg');

		if ( bThisExpanded )
		{
			$( this ).find( ".expandable-arrow" ).attr('src','./images/arrow_down.svg');
		}
		else
		{
			$(this).addClass('expanded');
			$(this).find( ".expandable-arrow" ).attr('src','./images/arrow_up.svg');
		}

	});
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


FormUtil.getAppInfo = function( returnFunc )
{	
	var url = WsApiManager.composeWsFullUrl( '/api/getPWAInfo' );

	RESTUtil.retrieveJson( url, returnFunc );
}

FormUtil.getDataServerAvailable = function( returnFunc )
{

	if ( WsApiManager.useDWS() )
	{
		var url = WsApiManager.composeWsFullUrl( '/PWA.available' );
		RESTUtil.retrieveDWSJson( url, returnFunc );
	}
	else
	{
		var url = WsApiManager.composeWsFullUrl( '/api/available' );
		
		if ( WsApiManager.isDebugMode ) console.log( '~ 1 : api/available  ' );

		//RESTUtil.retrieveJson( url, returnFunc );
		RESTUtil.retrieveJson( url, function()
		{
			if ( WsApiManager.isDebugMode ) console.log( '~ 2 : api/available  ' );
			RESTUtil.retrieveJson( url, returnFunc );
		} );	
	}

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
	// 'val' could be optionally object.
	//		- If object, then we usually pass val with defaultValue Object..
	//				For further eval the different types of defaults
	//			- 'payloadConfigEval'  <-- object
	//			- 'eval' <-- simple value eval

	if ( val )
	{
		var valType = typeof( val );

		if ( valType === "object" ) 
		{
			// Object type json val set to inputTag
			var valJson = val;
			var finalVal = '';

			// Normally for 'defaultValue' json def object

			// 'paylaodConfigSelection' is added to 'defaultValue' config in blockForm.setFormItemJson_DefaultValue_PayloadConfigSelection();
			if ( valJson.payloadConfigEval && valJson.paylaodConfigSelection )
			{
				finalVal = FormUtil.eval( valJson.payloadConfigEval[ valJson.paylaodConfigSelection ] );
			} 
			else if ( valJson.eval ) 
			{
				finalVal = FormUtil.eval( valJson.eval );
			}

			tag.val( finalVal );
		}
		else
		{
			// Non-Object types value set to inputTag

			// CheckBox 
			if ( FormUtil.checkTag_CheckBox( tag ) )
			{
				tag.prop( 'checked', ( val === 'true' || val === true ) ); 
			}
			else
			{
				// Special eval key type field - '{ ~~~ }'
				if ( valType === "string" && ( val.indexOf( '{' ) && val.indexOf( '}' ) ) )
				{
					FormUtil.evalReservedField( tag, val );
				}
				else
				{
					tag.val( val );
				}				
			}
		}

		if ( returnFunc ) returnFunc();
	}
};


FormUtil.eval = function( val )
{
	var evalVal = '';

	try
	{
		if ( val ) evalVal = eval( val );
	}
	catch( errMsg )
	{
		console.log( 'Error on FormUtil.eval, value: ' + val + ', errMsg: ' + errMsg );
	}	

	return evalVal;
};


FormUtil.dispatchOnChangeEvent = function( targetControl )
{
	if ("createEvent" in document) {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent('change', true, true);
		targetControl[0].dispatchEvent(evt);
	}
	else
	{
		targetControl[0].fireEvent("onchange");
	}
}

FormUtil.evalReservedField = function( tagTarget, val )
{
	if ( val.indexOf( '$${' ) >= 0 )
	{
		// do something ? $${ reserved for other use? Bruno may have examples from existing DCD configs
	}
	else if ( val.indexOf( '##{' ) >= 0)
	{
		if ( val.indexOf( 'getCoordinates()' ) >= 0 )
		{
			if ( tagTarget.val() != FormUtil.geoLocationCoordinates )
			{
				FormUtil.refreshGeoLocation( function() {
					if ( FormUtil.geoLocationLatLon.length )
					{
						MsgManager.notificationMessage ( '<img src="images/sharp-my_location-24px.svg">', 'notificationGray', undefined, '', 'right', 'top', 1000, false, undefined, 'geolocation', true, true );
					}
					tagTarget.val( FormUtil.geoLocationCoordinates );
				});
			}
		}
		else if ( val.indexOf( 'newDateAndTime()' ) >= 0 )
		{
			tagTarget.val( (new Date() ).toISOString() );
		}
		else if ( val.indexOf( 'generatePattern(' ) >= 0 )
		{
			var pattern = Util.getParameterInside( val, '()' );
			tagTarget.val( Util2.getValueFromPattern( tagTarget, pattern, false ) );
		}
		else if ( val.indexOf( 'getAge(' ) >= 0 )
		{
			var pattern = Util.getParameterInside( val, '()' );
			tagTarget.val( Util2.getAgeValueFromPattern( tagTarget, pattern ) );
		}
		else if ( val.indexOf( 'epoch' ) >= 0 )
		{
			var pattern = Util.getParameterInside( val, '()' );
			if ( tagTarget.val().length == 0 ) 
			{
				Util2.epoch( pattern, function( epochVal ){
					tagTarget.val( epochVal );
				} );
			}
		}
		else if ( val.indexOf( 'dataURI' ) >= 0 )
		{
			var sourceInput = Util.getParameterInside( val, '()' );
			FormUtil.setQRdataURI( sourceInput, tagTarget );
		}
	}
	else
	{
		tagTarget.val( val );
	}

}

FormUtil.setQRdataURI = function( sourceInput, imgInputTag )
{
	var qrContainer = $( '#qrTemplate' );
	qrContainer.empty();

	var myQR = new QRCode( qrContainer[ 0 ] );
	var inputVal = $( '[name=' + sourceInput +']' ).val();

	myQR.fetchCode ( inputVal, function( dataURI ){

		var previewTag = $( '[name=imgPreview_' + imgInputTag.attr( 'name' ) +']' )
		previewTag.attr( 'src', dataURI );
		imgInputTag.val( dataURI );

	})

}

FormUtil.getTagVal = function( tag )
{
	var val;

	if( tag )
	{
		if ( FormUtil.checkTag_CheckBox( tag ) )
		{			
			val = tag.is( ":checked" ) ? "true" : "false" ;
		}
		else
		{
			val = tag.val();
		}
	}

	return val;
}

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

FormUtil.setLastPayload = function( payloadName, jsonData, optClear )
{
	var sessionData = localStorage.getItem(Constants.storageName_session);

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

		localStorage.setItem( Constants.storageName_session, JSON.stringify( SessionObj ) );
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

			if ( thenFunc ) thenFunc();

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

//FormUtil.updateSyncListItems = function( redList, retFunc )
FormUtil.updateStat_SyncItems = function( redList, retFunc )
{
	FormUtil.records_redeem_submit = 0;
	FormUtil.records_redeem_queued = 0;
	FormUtil.records_redeem_failed = 0;


	var returnList = redList.list.filter( a => a.owner == FormUtil.login_UserName );

	var myQueue = returnList.filter( a=>a.status == Constants.status_redeem_queued );
	var myFailed = returnList.filter( a=>a.status == Constants.status_redeem_failed ); //&& (!a.networkAttempt || a.networkAttempt < Constants.storage_offline_ItemNetworkAttemptLimit) );
	var mySubmit = returnList.filter( a=>a.status == Constants.status_redeem_submit );

	FormUtil.records_redeem_submit = mySubmit.length;
	FormUtil.records_redeem_queued = myQueue.length;
	FormUtil.records_redeem_failed = myFailed.length;

	syncManager.dataQueued = myQueue;
	syncManager.dataFailed = returnList.filter( a=>a.status == Constants.status_redeem_failed && ( a.networkAttempt && a.networkAttempt < Constants.storage_offline_ItemNetworkAttemptLimit) );;
		
	retFunc( returnList );
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

FormUtil.appendActivityTypeIcon = function ( iconObj, activityType, statusOpt, cwsRenderObj, iconStyleOverride )
{
	try 
	{
		if ( iconObj && activityType ) //while sync action runs, the current iconObj object may not be rendered on the screen
		{
			// read local SVG xml structure, then replace appropriate content 'holders'
			$.get( activityType.icon.path, function(data) {
	
				var svgObject = ( $(data)[0].documentElement );
				var svgStyle = ( iconStyleOverride ? iconStyleOverride : FormUtil.dcdConfig.settings.redeemDefs.activityIconSize );
	
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
	
				if ( statusOpt && statusOpt.name !== Constants.status_redeem_queued && statusOpt.name !== Constants.status_redeem_failed )
				{
					$( svgObject ).css( 'opacity', '1' );
				}
				else
				{
					$( svgObject ).css( 'opacity', '0.4' );
				}
	
				$( iconObj ).empty();
				$( iconObj ).append( svgObject );
	
				if ( FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings && FormUtil.dcdConfig.settings.redeemDefs && svgStyle && $(iconObj).html() )
				{
					$( svgObject ).attr( 'width', svgStyle.width );
					$( svgObject ).attr( 'height', svgStyle.height );
				}
	
				if ( $( iconObj ).html() && statusOpt && statusOpt.icon && statusOpt.icon.path )
				{
					var iconActivityWidth = FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width;
					var iconStatusWidth = FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.width;
					var iconStatusHeight = FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.height;
	
					var statusIconObj = $( '<div class="syncStatusIcon" style="vertical-align:top;position:relative;left:' + ( iconActivityWidth - ( iconStatusWidth / 1) ) + 'px;top:-' + (iconStatusHeight + 6) + 'px;">&nbsp;</div>' );
	
					//$( '#' + iconObj.attr( 'id' ) ).css( 'width', ( FormUtil.dcdConfig.settings.redeemDefs.activityIconSize.width + 4 ) + 'px' )
					$( iconObj ).append( statusIconObj );
	
					FormUtil.appendStatusIcon ( statusIconObj, statusOpt )
				}
	
			});
		}
	}
	catch ( errMsg )
	{
		console.log( 'Error on FormUtil.appendActivityTypeIcon, errMsg: ' + errMsg );
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
			if ( statusOpt && statusOpt.icon && statusOpt.icon.path )
			{
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
						$( svgObject ).attr( 'width', FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.width );
						$( svgObject ).attr( 'height', FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.height );
		
						//$( targetObj ).html( $(targetObj).html().replace(/{WIDTH}/g, FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.width ) );
						//$( targetObj ).html( $(targetObj).html().replace(/{HEIGHT}/g, FormUtil.dcdConfig.settings.redeemDefs.statusIconSize.height ) );
					}
	
				});
	
			}			
		}

	}

}

FormUtil.setStatusOnTag = function( statusSecDivTag, itemData, cwsRenderObj ) 
{
	try
	{
		var imgSyncIconTag = statusSecDivTag.find( 'small.syncIcon img' );

		if ( itemData.status === Constants.status_redeem_submit )
		{
			imgSyncIconTag.attr ( 'src', 'images/sync-n.svg' );
		}
		else if ( itemData.status === Constants.status_redeem_failed )
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
	catch ( errMsg )
	{
		console.log( 'Error on FormUtil.setStatusOnTag, errMsg: ' + errMsg );
	}
}


FormUtil.getActivityType = function( itemData )
{
	var returnOpt;
	try
	{
		var opts = FormUtil.dcdConfig.settings.redeemDefs.activityTypes;

		for ( var i=0; i< opts.length; i++ )
		{
			if ( opts[i].name == itemData.activityType )
			{
				returnOpt = opts[i];
				break;
			}
		}

		if ( returnOpt )
		{
			return ( returnOpt );
		}
		else
		{
			return ( FormUtil.getActivityTypeComposition( itemData ) )
		}
	}
	catch ( errMsg )
	{
		console.log( 'Error on FormUtil.getActivityType, errMsg: ' + errMsg );
	}
}

FormUtil.getActivityTypeComposition = function( itemData )
{
	var returnOpt;
	try
	{
		var opts = FormUtil.dcdConfig.settings.redeemDefs.activityTypes;

		if ( itemData.data && 
				itemData.data.payloadJson && 
				itemData.data.payloadJson.captureValues &&
				itemData.data.payloadJson.captureValues.program &&
				itemData.data.payloadJson.captureValues.activityType )
		{
			var optActTypeMatch = ( itemData.data.payloadJson.captureValues.program + '-' + 
									itemData.data.payloadJson.captureValues.activityType ).toLocaleUpperCase();

			// i.e. both program + activityType contain some value
			if ( ( optActTypeMatch ).length > 2 )
			{
				for ( var i=0; i< opts.length; i++ )
				{
					if ( opts[i].name == optActTypeMatch )
					{
						returnOpt = opts[i];
						break;
					}
				}

				if ( returnOpt )
				{
					return ( returnOpt );
				}
				else
				{
					//Greg: make one up? N/A ?
					return undefined; //( FormUtil.getActivityTypeNA( itemData ) );
				}
			}
		}
		else
		{
			//Greg: make one up? N/A ?
			return undefined; //( FormUtil.getActivityTypeNA( itemData ) );
		}
	}
	catch ( errMsg )
	{
		console.log( 'Error on FormUtil.getActivityTypeComposition, errMsg: ' + errMsg );
	}
}

FormUtil.getActivityTypeNA = function( itemData )
{
	var retObj = { previewData: [], name: 'Unknown', icon: { path: 'images/na.svg' }, term: '', label: '' };

	if ( itemData.data && itemData.data.previewData )
	{
		for ( var i=0; i< itemData.data.previewData.length; i++ )
		{
			retObj.previewData.push( itemData.data.previewData[ i ] );
		}
	}

	return retObj;
}

FormUtil.getStatusOpt = function( itemData )
{
	try
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
	catch ( errMsg )
	{
		console.log( 'Error on FormUtil.getStatusOpt, errMsg: ' + errMsg );
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

FormUtil.shareDataURI = function( title, dataURI ) {
    //var text = "See what I've found: an installable Progressive Web App for Connecting with Sara";
    if ('share' in navigator) {
        navigator.share({
            title: 'CwS: Connect App',
            text: title,
            url: dataURI,
        })
    } else {
        // Here we use the WhatsApp API as fallback; remember to encode your text for URI
        location.href = 'https://api.whatsapp.com/send?text=' + dataURI
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
{ // --> move to new geolocation.js class
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
{ // --> move to new geolocation.js class
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

				if (error.code == error_PERMISSION_DENIED)
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

FormUtil.getGeoLocationIndex = function( separator, group )
{
	// idea is to provide a 'complex' or 'cluster' set of keys for quick reference when running searches for services
	// current format is: COUNTRYCODE + '_' + GROUP (IPC/PROV/ALL) + '_' + YYYYMMDD + '_' + LAT + '_' + LONG
	// numberic prefix is accuracy down to metres (THIS SHOULD CHANGE TO SOMETHING MORE MEANINGFUL )

	var sep = ( separator ? separator : '_')
	var retIdx = FormUtil.dcdConfig.countryCode + sep + ( group ? group : 'ALL' ) + sep;
	var dtmNow = $.format.date( new Date(), "yyyymmdd" );
	var ArrCoords = FormUtil.geoLocationLatLon.split( ',' );

	retIdx += dtmNow + sep;

	var ret = { '111000': retIdx + parseFloat( ArrCoords[ 0 ] ).toFixed( 0 ) + sep + parseFloat( ArrCoords[ 1 ] ).toFixed( 0 ), 
				'11100': retIdx + parseFloat( ArrCoords[ 0 ] ).toFixed( 1 ) + sep + parseFloat( ArrCoords[ 1 ] ).toFixed( 1 ), 
				'1110': retIdx + parseFloat( ArrCoords[ 0 ] ).toFixed( 2 ) + sep + parseFloat( ArrCoords[ 1 ] ).toFixed( 2 ), 
				'111': retIdx + parseFloat( ArrCoords[ 0 ] ).toFixed( 3 ) + sep + parseFloat( ArrCoords[ 1 ] ).toFixed( 3 ), 
				'11': retIdx + parseFloat( ArrCoords[ 0 ] ).toFixed( 4 ) + sep + parseFloat( ArrCoords[ 1 ] ).toFixed( 4 ) 
	}

	return ret;
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
	var inputTags = formDivSecTag.find( 'input,checkbox,select' );
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

			inputsJson[ nameVal ] = val;
		}

	});

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
	var inputTags = formDivSecTag.find( 'input,checkbox,select' );

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
				if ( dataTarg.defaultValue.indexOf( '##{' ) > 0 )
				{
					var tagTarget = formDivSecTag.find( '[name="' + dataTarg.id + '"]' );

					FormUtil.evalReservedField( tagTarget, dataTarg.defaultValue );
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
	// fetch payloadConfiguration dataTarget for formDefinition's field/control

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

FormUtil.createNumberLoginPinPad = function()
{
	// create numeric input keypad > untidy implementation but it works
	$( "#passReal" ).keydown( function( event ) {
        if ( event.keyCode == 8 || event.keyCode == 46 ) {
          $( "#passReal" ).val( '' );
          $( "#pass" ).val( '' );
        }
	});

	const PWD_INPUT_PADDING_LEFT = 10;
	const CHAR_SPACING_WIDTH = 5;

	$( "#passReal" ).keyup( function( event ) {
		$('#pass').val( $('#passReal').val() );
		$('#passReal').css( 'left', ( $('#pass').position().left + PWD_INPUT_PADDING_LEFT + ( CHAR_SPACING_WIDTH * ( $('#passReal').val().length ) ) ).toFixed(0) + 'px' );
	});

	$( "#pass" ).focus( function() {
		$('#passReal').focus();
		$('#passReal').css( 'left', ( $('#pass').position().left + PWD_INPUT_PADDING_LEFT + ( CHAR_SPACING_WIDTH * ( $('#passReal').val().length ) ) ).toFixed(0) + 'px' );
		$('#passReal').css( 'top', $('#pass').position().top + 8 );
	});

	setTimeout( function() {
		$('#passReal').css( 'top', $('#pass').position().top + 12 );
		$('#passReal').css( 'left', $('#pass').position().left + PWD_INPUT_PADDING_LEFT + 'px' );
	}, 500 );

};


FormUtil.getCommonDateGroups = function()
{
	var z = [ { name: "Last 24 hours", term: "", hours: 24, created: 0 },
			{ name: "Last 3 days", term: "", hours: 72 , created: 0 },
			{ name: "Last 7 days", term: "", hours: 168, created: 0 },
			{ name: "Last 30 days", term: "", hours: 720, created: 0 },
			{ name: "Last 3 months", term: "", hours: 2160, created: 0 },
			{ name: "Last 6 months", term: "", hours: 4320, created: 0 } ];
	return z;
};


FormUtil.getActivityTypes = function()
{
	// get different 'Areas' or Activity-Types
	var sessData = localStorage.getItem(Constants.storageName_session);
	var retArr = [];

	if ( sessData )
	{
		var itms = JSON.parse( localStorage.getItem( JSON.parse( sessData ).user ) ).dcdConfig.settings.redeemDefs.activityTypes;

		if ( itms && itms.length )
		{
			for (var i = 0; i < itms.length; i++)
			{
				retArr.push( { name: itms[ i ].name, jsonObj: itms[ i ] } );
			}
		}

	}

	return retArr;
};


FormUtil.loaderEllipsis = function()
{
	return '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>';
};


FormUtil.loaderRing = function()
{
	return '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
	//return '<div class="loadingImg" style=""><img src="images/loading_small.svg"></div>';
};


FormUtil.getMyDetails = function( callBack )
{
	//https://cws-dhis.psi-mis.org/dws/locator.api/?code=
	//https://pwa.psi-connect.org/ws/dws/locator.api/?code=
	var targetURL = 'https://pwa.psi-connect.org/ws/dws/locator.api/?code=' + FormUtil.login_UserName;

	var payload = {
		"action-details": 2,
		"config.action": "https://cws-dhis.psi-mis.org/api/dataStore/Connect_config/dws@locator@api",
		"username": "pwa",
		"password": "529n3KpyjcNcBMsP"
	};

	let request = new Request(targetURL, {
		method: 'POST',
		crossDomain : true,
		headers: {
		  'Content-Type': 'application/json',
		  "Authorization": "Basic " + btoa( payload.username + ":" + payload.password ) 
		},
		body: JSON.stringify(payload)
	});

	fetch(request)
        .then((response) => {
			console.log( response );
            if (!response.ok) {
                throw Error(response.statusText);
			}
			if ( callBack )
			{
				callBack( response.json() );
			} 
			else
			{
				return response;
			}
        })
		.then( (response) => { 
			if ( callBack )
			{
				callBack( response.json() );
			} 
			else
			{
				return response.json;
			}
		} );
};


FormUtil.fetchMyDetails = function ( useAPI, returnFunc ) 
{

	if ( useAPI != undefined && useAPI == true )
	{

		var myD_username = 'pwa'; //FormUtil.login_UserName;
		var myD_password = '529n3KpyjcNcBMsP'; //FormUtil.login_Password;
		var server_url = 'https://replica.psi-mis.org/' + 'locator/api/1?code=NP-OHF-3122';

		if ( 1 == 1)
		{

			let result = $.when($.ajax({
				url: "https://replica.psi-mis.org/locator/api/1?uid=B4b76ISunPi",
				headers: {
					'Authorization': 'Basic Y2hhdGJvdGNob2NvbGF0ZTpOeGgkS1Y2U3FrNndR',
					'Content-Type': 'application/json'
				}
			})).done(function(data) {
				console.log("response", data);
				return data;
			})
			console.log("testing", result);
			return result;
		}
		else
		{
			fetch( server_url , { method: 'get', headers: { 'Authorization': 'Basic' + btoa(myD_username + ':' + myD_password) } } )
			.then( response => {
				if ( response.ok ) return response.json();
				else if ( response.statusText ) throw Error( response.statusText )
			})
			.then( jsonData => {
				if ( returnFunc ) returnFunc( true, jsonData );
			})
			.catch( error => {
				if ( WsApiManager.isDebugMode )
				{
					console.log( 'Failed to retrieve url - ' + server_url );
					console.log( error );  
					//alert( 'Failed to load the config file' );
				}
				if ( returnFunc ) returnFunc( false, { "response": error.toString() } );
			});
		}
		
	
	}
	else
	{

		//https://replica.psi-mis.org/locator/api/1?code=NP-OHF-3122
		//https://replica.psi-mis.org/locator/api/1?code=NP_TEST_PROV
		
		return {
			"result": {
				"msg": {
					"response": {
						"returnCode": "200",
						"outlet": [
							{
								"dhisCode": "NP-OHF-8858",
								"dhisId": "X7FJl3bf9KH",
								"servicesStandard": "Family Planning, Maternity, MA, MVA",
								"description": "Description about Me",
								"url": "http://www.testoutlet.com",
								"outletName": "NP Outlet Test",
								"path": "/WFFJSzhyMAO/ACVBeX3Cl0J/bgnqePvj4Oz/X7FJl3bf9KH",
								"phoneNumber": "984123345",
								"postgresId": "798523356",
								"closedDate": "2021-12-31",
								"locatorType": "OUT",
								"dhisName": "NP Outlet Test (OHF-8858)",
								"openingHours": "Mo-Fr,9:00,13:00,15:00,19:00;Sa,9:00,13:30",
								"comment": "Comment about Test outlet",
								"location": {
									"area": "Lagankhel",
									"areaSub": "Bus Stop",
									"address": "Kantipath, Kathmandu",
									"latitude": 27.668306,
									"longitude": 85.31838
								},
								"openingDate": "2019-06-23",
								"email": "testperson@gmail.com",
								"providers": [
									{
										"gender": "F",
										"dhisId": "CRcXVby89hP",
										"providerName": "Prov - 3"
									},
									{
										"gender": "F",
										"dhisId": "DSKZ0IXIarC",
										"providerName": "prov-2"
									},
									{
										"gender": "F",
										"dhisId": "Vwnc7T1CAyh",
										"providerName": "prov - 5"
									},
									{
										"gender": "F",
										"dhisId": "VNX2O8qEIPC",
										"providerName": "Prov - 4"
									},
									{
										"gender": "F",
										"dhisId": "HJ2XC2c07R9",
										"providerName": "prov-1"
									}
								]
							}
						],
						"status": "Showing 1 OrgUnits"
					}
				}
			},
			"actionDetails": [
				{
					"auth": {
						"action": {
							"authorised": true
						},
						"actionDefinition": {
							"eval": [
								"function b2a(r){var t,c,e,h,a,n,A,i,o,l='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',d=0,u=0,C='',f=[];if(!r)return r;do t=r.charCodeAt(d++),c=r.charCodeAt(d++),e=r.charCodeAt(d++),i=t<<16|c<<8|e,h=63&i>>18,a=63&i>>12,n=63&i>>6,A=63&i,f[u++]=l.charAt(h)+l.charAt(a)+l.charAt(n)+l.charAt(A);while(d<r.length);return C=f.join(''),o=r.length%3,(o?C.slice(0,o-3):C)+'==='.slice(o||3)}",
								"function a2b(r){var o,t,a,f={},n=0,h=0,c='',e=String.fromCharCode,g=r.length;for(o=0;64>o;o++)f['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.charAt(o)]=o;for(t=0;g>t;t++)for(o=f[r.charAt(t)],n=(n<<6)+o,h+=6;h>=8;)((a=255&n>>>(h-=8))||g-2>t)&&(c+=e(a));return c}",
								"var auth = {};",
								"auth.authorised = incomingHeader.authorization === 'Basic ' + b2a('pwa:529n3KpyjcNcBMsP');"
							],
							"goTo": " goTo = ( auth.authorised ) ? 'authValid' : 'authInvalid' ; ",
							"id": "auth",
							"requestData": null
						}
					}
				},
				{
					"authValid": {
						"action": {
							"msg": "AUTH SUCCESS"
						},
						"actionDefinition": {
							"eval": "authValid.msg = 'AUTH SUCCESS' ;",
							"goTo": " goTo = 'reading' ;",
							"id": "authValid",
							"requestData": null
						}
					}
				},
				{
					"reading": {
						"action": {
							"code": "NP-OHF-8858"
						},
						"actionDefinition": {
							"eval": [
								"reading = {} ;",
								"reading.code = incomingParams.code[0] ;"
							],
							"goTo": " goTo = 'readingAuthDetails';",
							"id": "reading",
							"requestData": null
						}
					}
				},
				{
					"readingAuthDetails": {
						"action": {},
						"actionDefinition": {
							"eval": [
								"var payload = {};",
								"payload.username = incomingPayload.username;",
								"payload.password = incomingPayload.password;"
							],
							"goTo": " goTo = 'storage' ;",
							"id": "readingAuthDetails",
							"requestData": null
						}
					}
				},
				{
					"storage": {
						"action": {
							"payload": {
								"password": "529n3KpyjcNcBMsP",
								"username": "pwa"
							}
						},
						"actionDefinition": {
							"eval": [
								"var storage = {};",
								"storage.payload = payload;"
							],
							"goTo": " goTo = 'send' ;",
							"id": "storage",
							"requestData": null
						}
					}
				},
				{
					"send": {
						"action": {
							"response": {
								"returnCode": "200",
								"outlet": [
									{
										"dhisCode": "NP-OHF-8858",
										"dhisId": "X7FJl3bf9KH",
										"servicesStandard": "Family Planning, Maternity, MA, MVA",
										"description": "Description about Me",
										"url": "http://www.testoutlet.com",
										"outletName": "NP Outlet Test",
										"path": "/WFFJSzhyMAO/ACVBeX3Cl0J/bgnqePvj4Oz/X7FJl3bf9KH",
										"phoneNumber": "984123345",
										"postgresId": "798523356",
										"closedDate": "2021-12-31",
										"locatorType": "OUT",
										"dhisName": "NP Outlet Test (OHF-8858)",
										"openingHours": "Mo-Fr,9:00,13:00,15:00,19:00;Sa,9:00,13:30",
										"comment": "Comment about Test outlet",
										"location": {
											"area": "Lagankhel",
											"areaSub": "Bus Stop",
											"address": "Kantipath, Kathmandu",
											"latitude": 27.668306,
											"longitude": 85.31838
										},
										"openingDate": "2019-06-23",
										"email": "testperson@gmail.com",
										"providers": [
											{
												"gender": "F",
												"dhisId": "CRcXVby89hP",
												"providerName": "Prov - 3"
											},
											{
												"gender": "F",
												"dhisId": "DSKZ0IXIarC",
												"providerName": "prov-2"
											},
											{
												"gender": "F",
												"dhisId": "Vwnc7T1CAyh",
												"providerName": "prov - 5"
											},
											{
												"gender": "F",
												"dhisId": "VNX2O8qEIPC",
												"providerName": "Prov - 4"
											},
											{
												"gender": "F",
												"dhisId": "HJ2XC2c07R9",
												"providerName": "prov-1"
											}
										]
									}
								],
								"status": "Showing 1 OrgUnits"
							}
						},
						"actionDefinition": {
							"eval": null,
							"goTo": " goTo = 'response' ;",
							"id": "send",
							"requestData": {
								"input": "storage",
								"method": "POST",
								"sourceType": "BASIC_AUTH",
								"URL": "server+'/api/1?code=' + reading.code;"
							}
						}
					}
				},
				{
					"response": {
						"action": {
							"msg": {
								"response": {
									"returnCode": "200",
									"outlet": [
										{
											"dhisCode": "NP-OHF-8858",
											"dhisId": "X7FJl3bf9KH",
											"servicesStandard": "Family Planning, Maternity, MA, MVA",
											"description": "Description about Me",
											"url": "http://www.testoutlet.com",
											"outletName": "NP Outlet Test",
											"path": "/WFFJSzhyMAO/ACVBeX3Cl0J/bgnqePvj4Oz/X7FJl3bf9KH",
											"phoneNumber": "984123345",
											"postgresId": "798523356",
											"closedDate": "2021-12-31",
											"locatorType": "OUT",
											"dhisName": "NP Outlet Test (OHF-8858)",
											"openingHours": "Mo-Fr,9:00,13:00,15:00,19:00;Sa,9:00,13:30",
											"comment": "Comment about Test outlet",
											"location": {
												"area": "Lagankhel",
												"areaSub": "Bus Stop",
												"address": "Kantipath, Kathmandu",
												"latitude": 27.668306,
												"longitude": 85.31838
											},
											"openingDate": "2019-06-23",
											"email": "testperson@gmail.com",
											"providers": [
												{
													"gender": "F",
													"dhisId": "CRcXVby89hP",
													"providerName": "Prov - 3"
												},
												{
													"gender": "F",
													"dhisId": "DSKZ0IXIarC",
													"providerName": "prov-2"
												},
												{
													"gender": "F",
													"dhisId": "Vwnc7T1CAyh",
													"providerName": "prov - 5"
												},
												{
													"gender": "F",
													"dhisId": "VNX2O8qEIPC",
													"providerName": "Prov - 4"
												},
												{
													"gender": "F",
													"dhisId": "HJ2XC2c07R9",
													"providerName": "prov-1"
												}
											]
										}
									],
									"status": "Showing 1 OrgUnits"
								}
							}
						},
						"actionDefinition": {
							"eval": [
								"var response = {};",
								"response.msg = send;"
							],
							"goTo": " goTo = 'FINISH' ;",
							"id": "response",
							"requestData": null
						}
					}
				}
			]
		}
	
	}

}


try {
    module.exports = FormUtil;
} catch (error) { }