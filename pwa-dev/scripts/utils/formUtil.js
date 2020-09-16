// -------------------------------------------
// -- FormUtil Class/Methods

function FormUtil() {}

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

FormUtil.keyCode_Backspace = 8;
FormUtil.keyCode_Delete = 46;
FormUtil.keyCode_Enter = 13;

const PWD_INPUT_PADDING_TOP = 0;
const PWD_INPUT_PADDING_LEFT = 0;
const CHAR_SPACING_WIDTH = 12;

// ==== Methods ======================

// ==========================================
// ====  GET/SET Form Control Tag value ====
FormUtil.getFormCtrlTag = function( formTag, ctrlTagName )
{
	return formTag.find("[name='" + ctrlTagName + "']");
};


FormUtil.getFormCtrlDataValue = function( inputDataValueTag )
{
	return inputDataValueTag.val();
};


FormUtil.setFormCtrlDataValue = function( inputDataValueTag, value )
{
	inputDataValueTag.val( value );
};

// ==============================================

FormUtil.getObjFromDefinition = function( def, definitions )
{
	var objJson = def;  // default is the passed in object/name

	try
	{
		if ( def && definitions )
		{
			if ( typeof def === 'string' )
			{
				// get object from definition
				objJson = definitions[ def ];
			}
		}	
	}
	catch ( errMsg )
	{
		console.customLog( 'ERROR in FormUtil.getObjFromDefinition, id: ' + def + ', errMsg: ' + errMsg );
	}

	return objJson;
};


FormUtil.rotateTag = function( tag, runRotation )
{
	if ( tag )
	{
		if ( runRotation )
		{
			tag.attr( 'rotating', 'true' );
			tag.rotate({ count:999, forceJS: true, startDeg: 0 });
		}
		else
		{
			tag.attr( 'rotating', 'false' );
			tag.stop().rotate( { endDeg:360, duration:0 } );
		}	
	}
};


FormUtil.rotateImgTag = function( tag, runRotation )
{
	if ( tag )
	{
		if ( runRotation )
		{
			tag.attr( 'rotating', 'true' );
			tag.rotate({ count:999, forceJS: true, startDeg: 0 });
		}
		else
		{
			tag.attr( 'rotating', 'false' );
			tag.stop().rotate( { endDeg:360, duration:0 } );
		}	
	}
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


FormUtil.generateLoadingTag = function( btnTag )
{
	var loadingTag;

	if ( btnTag.is( 'div' ) )
	{
		if ( ! btnTag.hasClass( 'button-label' ) && btnTag.find( '.button-label' ) )
		{
			loadingTag = $( '<div class="loadingImg" style="float: right; margin-left: 8px;"><img src="images/loading_small.svg"></div>' );
			btnTag.find( '.button-label' ).append( loadingTag );	
		}
		else
		{
			loadingTag = $( '<div class="loadingImg" style="float: right; margin-left: 8px;"><img src="images/loading_small.svg"></div>' );
			btnTag.append( loadingTag );	
		}
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

// -----------------------------------
// ---- Login And Fetch WS Related ------
// ---------------------------------------------------------

FormUtil.setClickSwitchEvent = function( mainIconTag, subListIconsTag, openCloseClass, cwsRenderObj )
{
	mainIconTag.off( 'click' ); //clear existing click events

	mainIconTag.on('click', function( event )
	{
		event.preventDefault();

		var thisTag = $( this );
		var className_Open = openCloseClass[0];
		var className_Close = openCloseClass[1];

		// ALREADY OPEN 
		if ( thisTag.hasClass( className_Open ) )
		{
			thisTag.removeClass( className_Open );
			thisTag.addClass( className_Close );

			// CLOSE NAVMENU (clicked from navHeader bar)
			if ( thisTag.hasClass( 'Nav__icon' ) )
			{
				thisTag.removeClass( 'active' );

				subListIconsTag.css( 'left', '-' + FormUtil.navDrawerWidthLimit( document.body.clientWidth ) + 'px' );
				subListIconsTag.css( 'width', FormUtil.navDrawerWidthLimit( document.body.clientWidth ) + 'px' );

				setTimeout( function() {
					subListIconsTag.hide(); 
				}, 500 );

				$( 'div.scrim').hide();

				//do not set zIndex for navDrawer (subListIconsTag) > navHeader (.Nav1) shows above closing menu
			}
			else 
			{
				subListIconsTag.fadeOut( 'fast', 'linear' );

				if ( ! $( '#navDrawerDiv' ).is( ':visible' ) )
				{
					$( 'div.scrim').hide();
				}
				else
				{
					subListIconsTag.css( 'opacity', '0' );
				}

				subListIconsTag.css( 'zIndex', 1);

			}

		}
		else 
		{
			thisTag.removeClass( className_Close );
			thisTag.addClass( className_Open );

			$( 'div.scrim').css('zIndex',100);

			thisTag.css('zIndex',199);

			// OPEN/SHOW NAVMENU (clicked from navHeader bar)
			if ( thisTag.hasClass( 'Nav__icon' ) )
			{
				//subListIconsTag.css('zIndex', FormUtil.screenMaxZindex() + 1 );
				subListIconsTag.css('zIndex', parseInt( $( '.Nav1').css('zIndex') ) + 1 );
				subListIconsTag.show();
				subListIconsTag.css( 'width', FormUtil.navDrawerWidthLimit( document.body.clientWidth ) + 'px' );
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

				$( 'div.scrim').off( 'click' ); //clear existing click events

				$( 'div.scrim').on( 'click' , function( event )
				{
					thisTag.css('zIndex',1);

					event.preventDefault();

					thisTag.click();
				});

				if ( $( 'div.scrim').css( 'opacity' ) !== Constants.focusRelegator_MaxOpacity ) $( 'div.scrim').css( 'opacity', Constants.focusRelegator_MaxOpacity );

				$( 'div.scrim').show();

				if ( subListIconsTag ) FormUtil.setStackOrder( subListIconsTag, 'div.scrim' );

			}

		} 
	});	
}

FormUtil.setStackOrderHigherThan = function( targetTag, higherThanTag )
{	//test code added by Greg
	var newZidx = parseInt( $( higherThanTag ).css('zIndex') ) + 1;
	//console.customLog( $( targetTag ).css( 'zIndex' ), targetTag );
	$( targetTag ).css( 'zIndex', newZidx );
}

FormUtil.setStackOrder = function( arrObjTags )
{	//test code added by Greg
	var stackFrom = FormUtil.screenMaxZindex();
	//console.customLog( arrObjTags );
	for ( var i = 0; i < arrObjTags.length; i++ )
	{
		var stackObj = arrObjTags[ i ];

		if ( stackObj )
		{
			stackFrom += 1;
			$( stackObj ).css( 'zIndex', stackFrom );
		}

	}
}

FormUtil.showScreenStackOrder = function( parent )
{	//test code added by Greg

	var parentObj = parent || document.body;
	var children = parentObj.childNodes, length = children.length;
	var arrStacks = [], i = 0;


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
	console.customLog( length );

    while(i<length){
		who = children[i++];
		//console.customLog( who );
        if (who.nodeType != 1) continue; // element nodes only
		//opacity = deepCss(who,"opacity");
		if ( $( who ).is( ':visible' ) )
		{
			if (deepCss(who,"position") !== "static") {
				temp = deepCss(who,"z-index");
				if (temp == "auto") { // positioned and z-index is auto, a new stacking context for opacity < 0. Further When zindex is auto ,it shall be treated as zindex = 0 within stacking context.
					(opacity > 0)? temp = FormUtil.screenMaxZindex(who): temp=0;
				} else {
					temp = parseInt(temp, 10) || 0;
				}
			} else { // non-positioned element, a new stacking context for opacity < 1 and zindex shall be treated as if 0
				(opacity > 0)? temp = FormUtil.screenMaxZindex(who): temp=0;
			}
			console.customLog( who, temp );
		}

    }

}


// THIS IS USED ON LOGIN - ALSO NEED TO BE CHANGED LIKE 'setUpNewUITab'
FormUtil.setUpTabAnchorUI = function( tag, targetOff, eventName )
{

	tag.find( 'li' ).on( 'click', function()
	{
		console.customLog( $( this ) );
		var tab_select = $( this ).attr( 'rel' ); 

		console.customLog( $( this ) );

		if ( FormUtil.orientation() == 'portrait' && $( window ).width() <= 568)
		{
			console.customLog( 'got here' );
			console.customLog( $( this ).find( 'ul' ) );
            if ($( this ).find( 'ul' ).is(':visible')) {
                $( this ).find( 'ul' ).css('display', 'none');
                $( this ).find( 'li' ).css('display', 'none');
                $( this ).next( 'ul' ).toggle();
            } else {
                $( this ).find( 'ul' ).css('display', 'block');
                $( this ).find( 'li' ).css('display', 'block');
                $( this ).next( 'ul' ).toggle();
			}

		}
		else
		{
			tag.find( '.active' ).removeClass( 'active' );  // both 'tabs' and 'tab_Content'

			//tag.siblings().find( '.active' ).empty();
			tag.siblings().find( '.active' ).removeClass( 'active' );  // both 'tabs' and 'tab_Content'
	
			tag.siblings( '.tab_fs__container' ).find( 'div.tab_fs__container-content' ).each( function( index, element ){
				$( element ).hide();
			}); 
	
			$( this ).addClass( 'active' );
	
			var activeTab = tag.siblings( '.tab_fs__container' ).find( "#" + tab_select );
	
			activeTab.addClass( 'active' );
			activeTab.fadeIn(); //show();
		}

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
			$( this ).addClass('expanded');
			$( this ).find( ".expandable-arrow" ).attr('src','./images/arrow_up.svg');
		}

	});
}


FormUtil.setUpEntryTabClick = function( tag, targetOff, eventName )
{	
	// tag at here is 'blockTag' in mainTab.  li is tab buttons.
	tag.find( 'li' ).on( 'click', function( e)
	{
		e.stopPropagation();

		var Primary = $( this ).hasClass( 'primary' );
		var Secondary = $( this ).hasClass( '2ndary' );
		var ulOptionsPopup = $( this ).find( 'ul' );

		if ( FormUtil.orientation() === 'portrait' 
			&& $( window ).width() <= 568 
			&& $( this ).hasClass( 'active' )  ) // class 'active' will always be li.primary
		{
			// On Small Screen Case, Show the dropdown (collapsed tab list)
            if ( ulOptionsPopup.is(':visible') ) {
                ulOptionsPopup.css('display', 'none');
                $( this ).find( 'li' ).css('display', 'none');
            } else {
                ulOptionsPopup.css('display', 'block');
                $( this ).find( 'li' ).not( '.tabHide' ).css('display', 'block');
                $( this ).next( 'ul' ).toggle();
			}
		}
		else
		{
			// On tab (li) selection. (On Small Screen Case, not 'active' )

			tag.find( '.active' ).removeClass( 'active' );  // both 'tabs' and 'tab_Content'
			tag.siblings().find( '.active' ).removeClass( 'active' );  // both 'tabs' and 'tab_Content'

			tag.siblings( '.tab_fs__container' ).find( 'div.tab_fs__container-content' ).hide();

			var tab_select = $( this ).attr( 'rel' );
			var activeTab = tag.siblings( '.tab_fs__container' ).find( '.tab_fs__container-content[tabButtonId="' + tab_select + '"]' );

			if ( Primary )
			{
				if ( ! $( this ).hasClass( 'active' ) ) $( this ).addClass( 'active' );
			}
			else
			{
				ulOptionsPopup.hide();
				$( "ul.2ndary" ).hide();
				$( "li.2ndary" ).hide();

				$( this ).closest( 'li.primary' ).siblings( 'li[rel=' + tab_select + ']' ).addClass( 'active' );
			}

			if ( ! activeTab.hasClass( 'active' ) ) activeTab.addClass( 'active' );
			activeTab.fadeIn(); //show();

		}
	});
};


FormUtil.orientation = function() {

	switch ( window.orientation ) {
		case -90:
			return '';
		case 90:
			return 'landscape';
			break;
		default:
			return 'portrait';
			break;
	}
}

FormUtil.getRedeemPayload = function( id ) {

	var redPay = JSON.parse(sessionStorage.getItem( id ))

	if ( redPay )
	{
		return redPay;
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

			// [REMOVED] CheckBox SET  // if ( FormUtil.checkTag_CheckBox( tag ) )    tag.prop( 'checked', ( val === 'true' || val === true ) ); 
			
			// Special eval key type field - '{ ~~~ }' - HAS SOME DATA MANIPULATION FUNCTIONS PATTERN..
			if ( valType === "string" && ( val.indexOf( '{' ) && val.indexOf( '}' ) ) )
			{
				FormUtil.evalReservedField( tag.closest( 'form' ), tag, val );
			}
			else
			{
				tag.val( val );
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
		console.customLog( 'Error on FormUtil.eval, value: ' + val + ', errMsg: ' + errMsg );
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

FormUtil.evalReservedField = function( form, tagTarget, val, dispatchChangeEvent )
{
	var dispatchChange = ( dispatchChangeEvent === undefined ? false : dispatchChangeEvent );

	if ( val.indexOf( '$${' ) >= 0 )
	{
		// do something ? $${ reserved for other use? Bruno may have examples from existing DCD configs
		dispatchChange = false;
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
	else if ( val.indexOf( 'eval{' ) >= 0 )
	{
		// do something ? $${ reserved for other use? Bruno may have examples from existing DCD configs
		var pattern = Util.getParameterInside( val, '{}' );
		tagTarget.val( FormUtil.tryEval( form, pattern ) );
	}
	else
	{
		tagTarget.val( val );
	}

	if ( dispatchChange ) tagTarget.change();
}

FormUtil.setQRdataURI = function( sourceInput, imgInputTag )
{
	var qrContainer = $( '#qrTemplate' );
	qrContainer.empty();

	var myQR = new QRCode( qrContainer[ 0 ] );
	var inputVal = $( '[name=' + sourceInput +']' ).val();

	myQR.fetchCode ( inputVal, function( dataURI ){

		var previewTag = $( '[name=' + imgInputTag.attr( 'name' ) +']' )
		previewTag.attr( 'src', dataURI );
		imgInputTag.val( dataURI );

	})

}

FormUtil.getTagVal = function( tag )
{
	var val = '';

	if( tag )
	{
		val = tag.val();
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

FormUtil.tryEval = function( form, evalTry )
{	
	// do not remove parameter [form] < required for scope search, e.g. "eval{ form.find( 'name=commonRepeatingFieldNameFoundOnOtherTab]' ).val() }"
	try {
		return eval( evalTry )
	}
	catch( errMsg )
	{
		console.customLog( 'Error on ActivityCard.render, errMsg: ' + errMsg );
		return 'error: ' + evalTry;
	}
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

/* - Not used anymore?
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
*/


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
					//console.customLog( 'skipping cache obj ' + name );
				}
				else
				{
					console.customLog( 'deleting cacheStorage obj: ' + name );
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
				console.customLog( 'deleting cache: ' + name );

				caches.delete(name).then( function( status ) {

					console.customLog( 'Delete Status: ' + status );

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


	var returnList = redList.list.filter( a => a.owner == SessionManager.sessionData.login_UserName );

	var myQueue = returnList.filter( a=>a.status == Constants.status_queued );
	var myFailed = returnList.filter( a=>a.status == Constants.status_failed ); //&& (!a.networkAttempt || a.networkAttempt < Constants.storage_offline_ItemNetworkAttemptLimit) );
	var mySubmit = returnList.filter( a=>a.status == Constants.status_submit );

	FormUtil.records_redeem_submit = mySubmit.length;
	FormUtil.records_redeem_queued = myQueue.length;
	FormUtil.records_redeem_failed = myFailed.length;

	//syncManager.dataQueued = myQueue;
	//syncManager.dataFailed = returnList.filter( a=>a.status == Constants.status_redeem_failed && ( a.networkAttempt && a.networkAttempt < Constants.storage_offline_ItemNetworkAttemptLimit) );;
		
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

FormUtil.getTermAttr = function( jsonItem )
{
	return ( jsonItem.term ) ? 'term="' + jsonItem.term + '"' : '';
};

FormUtil.addTag_TermAttr = function( tags, jsonItem )
{
	if ( jsonItem.term ) tags.attr( 'term', jsonItem.term );
};

FormUtil.appendActivityTypeIcon = function ( iconObj, activityType, statusOpt, cwsRenderObj, iconStyleOverride, activityJson )
{
	//console.customLog( activityType );
	try 
	{
		if ( iconObj && activityType ) //while sync action runs, the current iconObj object may not be rendered on the screen
		{
			// read local SVG xml structure, then replace appropriate content 'holders'
			$.get( activityType.icon.path, function(data) {
	
				var svgObject = ( $(data)[0].documentElement );
				var svgStyle = ( iconStyleOverride ? iconStyleOverride : ConfigManager.getConfigJson().settings.redeemDefs.activityIconSize );
	
				if ( activityType.icon.colors )
				{
					if ( activityType.icon.colors.background )
					{
						$( svgObject ).html( $(svgObject).html().replace(/{icon.bgfill}/g, activityType.icon.colors.background) );
						$( svgObject ).html( $(svgObject).html().replace(/{bgfill}/g, activityType.icon.colors.background) );
						$( svgObject ).attr( 'colors.background', activityType.icon.colors.background );
					}
					if ( activityType.icon.colors.foreground )
					{
						$( svgObject ).html( $(svgObject).html().replace(/{icon.color}/g, activityType.icon.colors.foreground) );
						$( svgObject ).html( $(svgObject).html().replace(/{color}/g, activityType.icon.colors.foreground) );
						$( svgObject ).attr( 'colors.foreground', activityType.icon.colors.foreground );
					}
	
				}
	
				if ( statusOpt && statusOpt.name !== Constants.status_queued ) //&& statusOpt.name !== Constants.status_failed 
				{
					$( svgObject ).css( 'opacity', '1' );
				}
				else
				{
					if ( statusOpt === undefined && activityJson && activityJson.processing && activityJson.processing.status )
					{
						$( svgObject ).css( 'opacity', '1' );
					}
					else
					{
						$( svgObject ).css( 'opacity', '0.4' );
					}
				}
	
				$( iconObj ).empty();
				$( iconObj ).append( svgObject );
	
				if ( ConfigManager.getConfigJson().settings && ConfigManager.getConfigJson().settings && ConfigManager.getConfigJson().settings.redeemDefs && svgStyle && $(iconObj).html() )
				{
					$( svgObject ).attr( 'width', '100%' ); //( iconObj.css( 'width' ) ? iconObj.css( 'width' ) : svgStyle.width )
					$( svgObject ).attr( 'height', '100%' ); //( iconObj.css( 'height' ) ? iconObj.css( 'height' ) : svgStyle.height )
				}

			});
		}
	}
	catch ( errMsg )
	{
		console.customLog( 'Error on FormUtil.appendActivityTypeIcon, errMsg: ' + errMsg );
	}
}

FormUtil.appendStatusIcon = function ( targetObj, statusOpt, skipGet )
{
	if ( ConfigManager.getConfigJson() )
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
							$( svgObject ).html( $(svgObject).html().replace(/{icon.bgfill}/g, statusOpt.icon.colors.background) );
							$( svgObject ).html( $(svgObject).html().replace(/{bgfill}/g, statusOpt.icon.colors.background) );
							$( svgObject ).attr( 'colors.background', statusOpt.icon.colors.background );
						}
						if ( statusOpt.icon.colors.foreground )
						{
							$( svgObject ).html( $(svgObject).html().replace(/{icon.color}/g, statusOpt.icon.colors.foreground) );
							$( svgObject ).html( $(svgObject).html().replace(/{color}/g, statusOpt.icon.colors.foreground) );
							$( svgObject ).attr( 'colors.foreground', statusOpt.icon.colors.foreground );
						}
					}
	
					$( targetObj ).empty();
					$( targetObj ).append( svgObject );

					if ( ConfigManager.getConfigJson().settings && ConfigManager.getConfigJson().settings && ConfigManager.getConfigJson().settings.redeemDefs && ConfigManager.getConfigJson().settings.redeemDefs.statusIconSize )
					{
						$( svgObject ).attr( 'width', ConfigManager.getConfigJson().settings.redeemDefs.statusIconSize.width );
						$( svgObject ).attr( 'height', ConfigManager.getConfigJson().settings.redeemDefs.statusIconSize.height );
		
						//$( targetObj ).html( $(targetObj).html().replace(/{WIDTH}/g, ConfigManager.getConfigJson().settings.redeemDefs.statusIconSize.width ) );
						//$( targetObj ).html( $(targetObj).html().replace(/{HEIGHT}/g, ConfigManager.getConfigJson().settings.redeemDefs.statusIconSize.height ) );
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

		if ( itemData )
		{

			if ( itemData.status === Constants.status_submit )
			{
				imgSyncIconTag.attr ( 'src', 'images/sync-n.svg' );
			}
			else if ( itemData.status === Constants.status_failed )
			{
		
				if ( !itemData.networkAttempt || (itemData.networkAttempt && itemData.networkAttempt < cwsRenderObj.storage_offline_ItemNetworkAttemptLimit ) )
				{
					imgSyncIconTag.attr ( 'src', 'images/sync-banner.svg' ); // should show the 'active' icon: sync-banner.svg
				}
				else
				{
					if ( itemData.networkAttempt && itemData.networkAttempt >= cwsRenderObj.storage_offline_ItemNetworkAttemptLimit )
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
		}

		imgSyncIconTag.css ( 'transform', '' );
	}
	catch ( errMsg )
	{
		console.customLog( 'Error on FormUtil.setStatusOnTag, errMsg: ' + errMsg );
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
		var opts = ConfigManager.getConfigJson().settings.redeemDefs.statusOptions;

		for ( var i=0; i< opts.length; i++ )
		{
			if ( opts[i].name === itemData.status )
			{
				return opts[i];
			}
		}
	}
	catch ( errMsg )
	{
		console.customLog( 'Error on FormUtil.getStatusOpt, errMsg: ' + errMsg );
	}
}

FormUtil.listItemActionUpdate = function( itemID, prop, value )
{
	
}

FormUtil.gAnalyticsEventAction = function( returnFunc )
{
	var dcd = ConfigManager.getConfigJson();
	var ret = '';
	if ( dcd && dcd.orgUnitData )
	{
		//CUSTOMIZE AS REQUIRED
		ret = 'country:'+dcd.orgUnitData.countryOuCode + ';userName:' + SessionManager.sessionData.login_UserName + ';network:' + ConnManagerNew.connStatusStr() + ';appLaunch:' + FormUtil.PWAlaunchFrom();
	}
	else
	{
		ret = 'country:none;userName:' + SessionManager.sessionData.login_UserName + ';network:' + ConnManagerNew.connStatusStr() + ';appLaunch:' + FormUtil.PWAlaunchFrom();
	}

	if ( returnFunc ) returnFunc( ret );

}

FormUtil.gAnalyticsEventLabel = function()
{
	return 'networkOnline: ' + ConnManagerNew.isAppMode_Online () + ', dataServerOnline: ' + ConnManagerNew.statusInfo.serverAvailable;
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
	var retIdx = ConfigManager.getConfigJson().countryCode + sep + ( group ? group : 'ALL' ) + sep;
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
                (opacity > 0)? temp = FormUtil.screenMaxZindex(who): temp=0;
            } else {
                temp = parseInt(temp, 10) || 0;
            }
        } else { // non-positioned element, a new stacking context for opacity < 1 and zindex shall be treated as if 0
            (opacity > 0)? temp = FormUtil.screenMaxZindex(who): temp=0;
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
		var inputTag = $( this );	
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
//REMOVE: no longer used
FormUtil.setPayloadConfig = function( blockObj, payloadConfig, formDefinition )
{
	var formDivSecTag = blockObj.parentTag;
	var inputTags = formDivSecTag.find( 'input,select' ); // << .dataValue??

	inputTags.each( function()
	{		
		var inputTag = $( this );
		var dataTarg = FormUtil.getFormFieldPayloadConfigDataTarget( payloadConfig, inputTag.attr( 'name' ), formDefinition )

		if ( dataTarg )
		{
			if ( dataTarg.dataTargets )
			{
				inputTag.attr( 'dataTargets', escape( JSON.stringify( dataTarg.dataTargets ) ) );
			}

			if ( dataTarg.defaultValue )
			{
				if ( dataTarg.defaultValue.indexOf( '{' ) > 0 )
				{
					var tagTarget = formDivSecTag.find( '[name="' + dataTarg.id + '"]' );

					FormUtil.evalReservedField( tagTarget.closest( 'form' ), tagTarget, dataTarg.defaultValue );
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


// TODO: How does this work?  --> Why would we ever call this multiple times?
FormUtil.setUpLoginInputsEvents = function()
{
	// creates numeric (only) keypad under android > untidy implementation but it works
	// move to login.js?

	var pwdVisibleTag = $( "#pass" );  // visible password tag
	var pwdValueTag = $( "#passReal" );  // actual value holding password tag

	// clear existing events
	pwdValueTag.off( 'keydown' ).off( 'keyup' );
	pwdVisibleTag.off( 'focus' );
	$( "input.loginUserName" ).off( 'focus' );


	// [ ONE TIME SET ]
	// backspace/delete button event (clears pin value)
	pwdValueTag.keydown( function( event ) 
	{
		if ( event.keyCode == FormUtil.keyCode_Backspace || event.keyCode == FormUtil.keyCode_Delete ) 
		{
			pwdValueTag.val( '' );
			pwdVisibleTag.val( '' );
        }
	});


	// [ ONE TIME SET ]
	// updates password value and repositions "blinker" with (now) longer text
	pwdValueTag.keyup( function( event ) 
	{
		var passwordVal = pwdValueTag.val();

		pwdVisibleTag.val( passwordVal );
		pwdValueTag.css( 'left', ( pwdVisibleTag.position().left 
			+ PWD_INPUT_PADDING_LEFT 
			+ ( CHAR_SPACING_WIDTH * ( passwordVal.length ) ) ).toFixed(0) + 'px' );

		
		// Auto Login Click - 'Enter' key.  4 digit auto login not enabled, yet.
		if ( event.keyCode == FormUtil.keyCode_Enter ) $( '.loginBtn' ).click();
		//if ( passwordVal.length >= 4 ) $( '.loginBtn' ).click();

	});


	pwdVisibleTag.focus( function() 
	{
		if ( ! pwdValueTag.is( ':visible') ) pwdValueTag.show();
	
		pwdValueTag.css( 'left', ( pwdVisibleTag.position().left + PWD_INPUT_PADDING_LEFT + ( CHAR_SPACING_WIDTH * ( pwdValueTag.val().length ) ) ).toFixed(0) + 'px' );
		pwdValueTag.css( 'top', pwdVisibleTag.position().top + PWD_INPUT_PADDING_TOP );
		pwdValueTag.focus();
	});

	pwdValueTag.focus( function( event ) {
		pwdValueTag.css( 'height', '20px' );
		pwdValueTag.css( 'top', pwdVisibleTag.position().top + PWD_INPUT_PADDING_TOP );
	});

	pwdValueTag.blur( function( event ) {
		pwdValueTag.css( 'height', '0px' );
	});

	/*$( "input.loginUserName" ).focus( function() {
		$( '#passReal' ).hide();
	});*/
};

FormUtil.setTimedOut_PositionLoginPwdBlinker = function()
{
	// startup position of blinker in relation to login screen layout (will cause problems if page gets resized)
	setTimeout( FormUtil.positionLoginPwdBlinker, 200 );

	setTimeout( FormUtil.positionLoginPwdBlinker, 500 );

	setTimeout( FormUtil.positionLoginPwdBlinker, 1000 );
};


FormUtil.positionLoginPwdBlinker = function()
{
	var pwdVisibleTag = $( "#pass" );  // visible password tag
	var pwdValueTag = $( "#passReal" );  // actual value holding password tag

	pwdValueTag.css( 'top', pwdVisibleTag.position().top + ( PWD_INPUT_PADDING_TOP + (PWD_INPUT_PADDING_TOP / 2) ) );
	pwdValueTag.css( 'left', pwdVisibleTag.position().left + pwdVisibleTag.val().length + 'px' );
};


FormUtil.getCommonDateGroups = function()
{
	var z = [ { name: "Last 24 hours", term: "", hours: 24, created: 0 },
			{ name: "Last 3 days", term: "", hours: 72 , created: 0 },
			{ name: "Last 7 days", term: "", hours: 168, created: 0 },
			{ name: "Last 30 days", term: "", hours: 720, created: 0 },
			{ name: "Last 3 months", term: "", hours: 2160, created: 0 },
			{ name: "Last 6 months", term: "", hours: 4320, created: 0 },
			{ name: "Last 3 years", term: "", hours: 25920, created: 0 } ];
	return z;
};


// REMOVE - not used anywhere
FormUtil.getActivityTypes = function()
{
	// get different 'Areas' or Activity-Types
	// var sessData = localStorage.getItem(Constants.storageName_session);
	var userInfo = AppInfoManager.getUserInfo();
	var retArr = [];

	if ( userInfo )
	{
		// var itms = JSON.parse( localStorage.getItem( userInfo.user ) ).dcdConfig.settings.redeemDefs.activityTypes;
		var itms = ConfigManager.getConfigJson().settings.redeemDefs.activityTypes;

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


FormUtil.getActivityTypeByRef = function( field, val )
{
	// get different 'Areas' or Activity-Types
	// var sessData = localStorage.getItem(Constants.storageName_session);

	var itms = ConfigManager.getConfigJson().settings.redeemDefs.activityTypes;

	if ( itms && itms.length )
	{
		for (var i = 0; i < itms.length; i++)
		{
			if ( itms[ i ][ field ] === val ) return itms[ i ];
		}
	}

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

// ---------------------------------------------

// Util2.arrayPreviewRecord = function( title, arr )

FormUtil.displayData_Array = function( title, arr )
{
	var ret = $( '<table />');

	if ( arr )
	{
		if ( title )
		{
			var tr = $('<tr />');
			var td = $('<td colspan=2 />');
			var dv = $( '<div class="section" />');
			var lbl = $( '<label />');

			lbl.html( title );

			dv.append( lbl );
			td.append( dv );
			tr.append( td );

			ret.append( tr );
		}
	
		for ( var i = 0; i < arr.length; i++ )
		{
			var tr = $('<tr />');
			ret.append( tr );

			if ( arr[ i ].type && arr[ i ].type == 'SECTION' ) // Display GROUP names
			{
				var td = $('<td colspan=2 />');
				var dv = $( '<div class="section" />');
				var lbl = $( '<label />');

				lbl.html( arr[ i ].name );

				dv.append( lbl );
				td.append( dv );
				tr.append( td );
			}
			else
			{
				tr.append( $( '<td class="name" />').html( arr[ i ].name ) );

				tr.append( $( '<td class="value" />').html( Util.outputAsStr( arr[ i ].value ) ) );
			}
		}
	
		ret.append(  $( '<tr />') ); // Add an empty row in the end of table
		tr.append( $( '<td colspan=2 />').html( '&nbsp;' ) );

	}

	return ret;
};
