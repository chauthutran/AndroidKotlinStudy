// -------------------------------------------
// -- ActivityUtil Class/Methods

function ActivityUtil() {}

ActivityUtil.activityList = [];

// ==== Methods ======================

// NOTE: How is this used?  Isn't this obsolete?
ActivityUtil.addAsActivity = function( type, defJson, defId, inputsJson )
{    
    // For some types, clear the activity list <-- to track/collect from 
    if ( type === "area" ) ActivityUtil.clearActivity();

    var activityJson = {};
    activityJson.type = type;
    activityJson.defJson = defJson;
    activityJson.defId = ( typeof defId === 'string' ) ? defId : ""; 
    activityJson.inputsJson = inputsJson;  // Possibility..

    // Add to the activity list.
    ActivityUtil.activityList.push( activityJson );

    return activityJson;
};

// ===========================================================
// ==== Inputs Json generate / Activity Payload Gen related ==

ActivityUtil.generateInputJsonByType = function( clickActionJson, formDivSecTag, formsJsonGroup )
{
    var inputsJson;

    // generate inputsJson - with value assigned...
    if ( clickActionJson.payloadVersion === "2" )
    {
        inputsJson = ActivityUtil.generateInputTargetPayloadJson( formDivSecTag, clickActionJson.payloadBody );
    }
    else
    {
        inputsJson = ActivityUtil.generateInputJson( formDivSecTag, clickActionJson.payloadBody, formsJsonGroup );
    }		

    // Voucher Status add to payload - if ( clickActionJson.voucherStatus ) 
    inputsJson.voucherStatus = clickActionJson.voucherStatus;

    return inputsJson;
};


ActivityUtil.generateInputJson = function( formDivSecTag, getValList, formsJsonGroup )
{
	// Input Tag values
	var inputsJson = {};
	var inputTags = formDivSecTag.find( 'input,checkbox,select' );

	inputTags.each( function()
	{		
		var inputTag = $( this );	
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
			if ( !getValList )
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

			if ( formsJsonGroup )
			{
				// NOTE: If grouping for input data exists (by '.' in name or 'dataGroup' attr)
				// Add to 'formsJsonGroup' object - to be used in payloadTemplate
				// Also, if '.' in name exists, extract 1st one as groupName and use rest of it as nameVal.
				nameVal = ActivityUtil.setFormsJsonGroup_Val( nameVal, val, dataGroup, formsJsonGroup );
			}

			inputsJson[ nameVal ] = val;
		}
	});		

	return inputsJson;
};


ActivityUtil.generateInputJson_ForPreview = function( formDivSecTag )
{
	// Input Tag values
	var inputsJson = {};
	var inputTags = formDivSecTag.find( 'input,checkbox,select' );

	inputTags.each( function()
	{		
		var inputTag = $( this );	
		var nameVal = inputTag.attr( 'name' );

		if ( inputTag.is( ':visible' ) )
		{
			var val = FormUtil.getTagVal( inputTag );

			inputsJson[ nameVal ] = val;
		}
	});		

	return inputsJson;
};


ActivityUtil.setFormsJsonGroup_Val = function( nameVal, val, dataGroup, formsJsonGroup )
{
	// NOTE: If grouping for input data exists (by '.' in name or 'dataGroup' attr)
	// Add to 'formsJsonGroup' object - to be used in payloadTemplate
	// Also, if '.' in name exists, extract 1st one as groupName and use rest of it as nameVal.

	try
	{
		// if '.' has in 'nameVal', mark it as group..
		if ( nameVal.indexOf( '.' ) > 0 )
		{
			var splitNames = nameVal.split( '.' );
			var groupName = splitNames[0];
			nameVal = nameVal.substr( groupName.length + 1 );  // THIS ALSO AFFECTS BELOW inputsJson nameVal as well.

			if ( !formsJsonGroup[ groupName ] ) formsJsonGroup[ groupName ] = {};

			formsJsonGroup[ groupName ][ nameVal ] = val;
		}

		// if dataGroup exists, put it ..
		if ( dataGroup ) 
		{
			if ( !formsJsonGroup[ dataGroup ] ) formsJsonGroup[ dataGroup ] = {};

			formsJsonGroup[ dataGroup ][ nameVal ] = val;
		}
	}
	catch( errMsg )
	{
		console.log( 'Error in ActivityUtil.setFormsJsonGroup_Val, errMsg: ' + errMsg );
	}

	return nameVal;
};



ActivityUtil.generateInputTargetPayloadJson = function( formDivSecTag, getValList )
{
	var inputsJson = {};
	var inputTags = formDivSecTag.find( 'input,checkbox,select' );
	var inputTargets = [];
	var uniqTargs = [];

	if ( inputTags.length )
	{
		inputTags.each( function()
		{		
			var inputTag = $( this );	
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
			ActivityUtil.recursiveJSONbuild( inputsJson, dataTargetHierarchy, 0 );
		}

		// FILL/populate new template payload structure (according to named inputTarget destinations)
		for ( var t = 0; t < inputTargets.length; t++ )
		{
			Object.keys( inputTargets[ t ].dataTargets ).forEach(function( key ) {

				var dataTargetHierarchy = ( key ).toString().split( '.' );

				// initialize with item at position zero [0]
				ActivityUtil.recursiveJSONfill( inputsJson, dataTargetHierarchy, 0, inputTargets[ t ].dataTargets[ key ], inputTargets[ t ].value );

			});

		}

		inputsJson[ 'userName' ] = SessionManager.sessionData.login_UserName;
		inputsJson[ 'password' ] = SessionManager.sessionData.login_Password;


		if ( WsCallManager.isLocalDevCase ) console.log ( inputsJson );			
	}

	return inputsJson;
};


ActivityUtil.recursiveJSONbuild = function( targetDef, dataTargetHierarchy, itm)
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
		ActivityUtil.recursiveJSONbuild( targetDef[ dataTargetHierarchy[ itm ] ], dataTargetHierarchy, parseInt( itm ) + 1 )
	}
	else
	{
		return targetDef;
	}
};


ActivityUtil.recursiveJSONfill = function( targetDef, dataTargetHierarchy, itm, fillKey,fillValue)
{
	// fill/populate the payload
	if ( itm < ( dataTargetHierarchy.length -1) )
	{
		ActivityUtil.recursiveJSONfill( targetDef[ dataTargetHierarchy[ itm ] ], dataTargetHierarchy, parseInt( itm ) + 1, fillKey, fillValue )
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
};


// ===========================================================
// ====== Activity Preview Realted ============


ActivityUtil.handlePayloadPreview = function( previewPrompt, formDivSecTag, btnTag, callBack )
{
	// formDefinition, 
    if ( previewPrompt === "true" )
    {
        var dataPass = ActivityUtil.generateInputPreviewJson( formDivSecTag );
        //var dataPass = FormUtil.generateInputTargetPayloadJson( formDivSecTag );	

        // TODO: Do we have to hide the formDiv Tag?
        formDivSecTag.hide();

        var confirmMessage = 'Please check before Confirm'; // MISSING TRANSLATION

        MsgManager.confirmPayloadPreview ( formDivSecTag.parent(), dataPass, confirmMessage, function( confirmed ){

            formDivSecTag.show();

            if ( confirmed )
            {
                if ( callBack ) callBack( true );
            }
            else
            {
				if ( btnTag ) me.clearBtn_ClickedMark( btnTag );
				if ( callBack ) callBack( false );				
            }

        });
    }
    else
    {
        if ( callBack ) callBack( true );
    }
};


// NEW: NOT USED, NOT YET IMPLEMENTED FULLY
ActivityUtil.handlePayloadPreview_New = function( previewPrompt, formDivSecTag, btnTag, callBack )
{
    if ( previewPrompt === "true" )
    {		
		// Use InputsJson data to populate 'Preview'
		var inputsJson_visible = ActivityUtil.generateInputJson_ForPreview( formDivSecTag );
		// vs ActivityUtil.generateInputPreviewJson = function( formDivSecTag, getValList )

		// Desired: Array of { name: '', type: '', values: [] } per inputField
		var previewData_JsonArr = ActivityUtil.generatePreviewDataArray( inputsJson_visible, formConfig );

		// Change this as well..
        MsgManager.confirmPayloadPreview( dataPass, 'Please check before Confirm', function( confirmed ){

            if ( callBack ) callBack( confirmed );
        });
    }
    else
    {
        if ( callBack ) callBack( true );
    }
};


// NEW: NOT USED, NOT YET IMPLEMENTED FULLY
ActivityUtil.previewActivityJson = function( inputsJson, callBack )
{
	var formConfig = {};  // <-- Get this from 'processing' formConfigId & ConfigService.getConfigJson();

	var previewData_JsonArr = ActivityUtil.generatePreviewDataArray( inputsJson, formConfig );

	MsgManager.confirmPayloadPreview( dataPass, 'Please check before Confirm', function( confirmed ) {

		if ( callBack ) callBack( confirmed );
	});
};


ActivityUtil.generateInputPreviewJson = function( formDivSecTag, getValList )
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
				var inputLabel = ActivityUtil.inputPreviewLabel( inputTag ); //$( inputTag ).closest( 'label' );	
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
};


ActivityUtil.inputPreviewLabel = function( formInput )
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
};


// ===========================================================


// Not yet used..
ActivityUtil.setInputsJson = function( activityJson, inputsJson )
{
    activityJson.inputsJson = inputsJson;
};


ActivityUtil.getActivityList = function()
{
    return ActivityUtil.activityList;
};

ActivityUtil.clearActivity = function()
{
    ActivityUtil.activityList = [];    
};
