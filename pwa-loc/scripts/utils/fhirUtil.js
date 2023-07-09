// -------------------------------------------
// -- FhirUtil Class/Methods

function FhirUtil() { }

// Map Sepecific Cases: All others are placed under 'dataValues'
FhirUtil.TransType_DataMap = {
	'c_reg': 'clientDetails',
	'c_upd': 'clientDetails',
	'v_iss': 'clientDetails',
	'v_rdx': 'clientDetails',
	's_info': 'dataValues'
};

// ==== Methods ======================

FhirUtil.getClientList_FromResponse = function ( response, option )
{
	var clientList = [];
	if ( !option ) option = {};

	try
	{
		if ( response && response.entry ) FhirUtil.getPatientResourceSet( response ).forEach( rscSet => { clientList.push( FhirUtil.evalClientTemplate( rscSet ) ); } );

		// Merge clients that already exists
		if ( option.mergeWithLocal ) FhirUtil.mergeWithLocalClient( clientList );
	}
	catch( errMsg )
	{
		console.log( 'ERROR in FhirUtil.getClientList_FromResponse, ' + errMsg );
	}

	return clientList;
};


FhirUtil.mergeWithLocalClient = function( dwClientList )
{
	var downloadedData = { clients: [] }; 

	// NEW: if the clientList has matching local client, perform download.
	dwClientList.forEach( client => {
		var localClient = ClientDataManager.getClientById( client._id );
		if ( localClient ) downloadedData.clients.push( client ); 
	});	
	
	var processingInfo = ActivityDataManager.createProcessingInfo_Success(Constants.status_submit, 'Search result download data merged.');
	// ClientDataManager.setActivityDateLocal_clientList(downloadedData.clients);
	
	ClientDataManager.mergeDownloadedClients(downloadedData, processingInfo);	
};


FhirUtil.getPatientResourceSet = function ( response )
{
	var clientList = [];

	var resourceList = [];

	try
	{
		// 1. Get all resource into resourceList..
		response.entry.forEach( item => {
			if ( item.resource ) {
				if ( item.resource.entry ) item.resource.entry.forEach( subItem => {  if ( subItem.resource ) resourceList.push( subItem.resource );  });
				else resourceList.push( item.resource );
			}
		});
	
	
		// 2. Get 'Patient' List - Might need to perform double check for duplicate ones?
		resourceList.forEach( item => {
			if ( item.resourceType === 'Patient' ) clientList.push( { id: item.id, itemList: [ item ] } );
		});
	
	
		// 3. Get other resource from 'Patient'
		resourceList.forEach( item => {
			if ( item.resourceType === 'QuestionnaireResponse' ) 
			{
				try
				{
					var patientId = item.subject.reference.replace( 'Patient/', '' );
					if ( patientId )
					{
						var clientJson = Util.getFromList(clientList, patientId, 'id');
						if ( clientJson ) clientJson.itemList.push( item );	
					}
				}
				catch (errMsg ) { console.log( 'ERROR in QuestionnaireResponse looping on convert.' ); }
			}
		});
	}
	catch (errMsg ) { console.log( 'ERROR in FhirUtil.getPatientResourceSet, ' + errMsg ); }

	return clientList;
};

// ------------------------------


FhirUtil.generateActivities = function ( resourceArr ) 
{
	var actList = [];

	var act_QR = FhirUtil.generateActivities_fmQR( resourceArr.filter( item => item.resourceType === 'QuestionnaireResponse' ) );

	// TODO: Use serviceReq resource for voucher.. rather than relying on the questionnaireReponse?
	// var act_SrvReq = FhirUtil.generateActivities_SrvReq( resourceArr.filter( item => item.resourceType === 'ServiceRequest' ) );
	// Merge the activity..  Look for v_iss ones..  with code..

	// What about simply adding 'voucherCode' in clientDetails by 'serviceReq', not the details..?


	//var act_CommReq = FhirUtil.generateActivities_CommReq( resourceArr.filter( item => item.resourceType === 'CommunicationRequest' ) );

	return actList.concat( act_QR ); //, act_CommReq );
};


FhirUtil.generateActivities_fmQR = function ( questRespArr ) 
{
	var activities = [];

	try
	{
		if ( questRespArr && questRespArr.length > 0 ) questRespArr.forEach( qr => {  activities.push( FhirUtil.convertQR_Activity( qr ) );  });
	}
	catch( errMsg )
	{
		console.log( 'ERROR in FhirUtil.generateActivities_fmQR, ' + errMsg );
	}

	return activities;
};


FhirUtil.generateActivities_SrvReq = function ( srvReqArr ) 
{
	var activities = [];

	try
	{
		if ( srvReqArr && srvReqArr.length > 0 ) srvReqArr.forEach( item => {  activities.push( FhirUtil.convertSrvReq_Activity( item ) );  });
	}
	catch( errMsg )
	{
		console.log( 'ERROR in FhirUtil.generateActivities_SrvReq, ' + errMsg );
	}

	return activities;
};


FhirUtil.generateActivities_CommReq = function ( CommReqArr ) 
{
	var activities = [];

	try
	{
		if ( CommReqArr && CommReqArr.length > 0 ) CommReqArr.forEach( item => {  activities.push( FhirUtil.convertCommReq_Activity( item ) );  });
	}
	catch( errMsg )
	{
		console.log( 'ERROR in FhirUtil.generateActivities_CommReq, ' + errMsg );
	}

	return activities;
};

// What about the 'activeUser'?  <-- store it on extention json?

FhirUtil.convertQR_Activity = function( qr )
{
	var act = {};
	try
	{
		if ( qr )
		{
			var patientId = FhirUtil.getRefPatientId( qr.subject );
			var extJson = FhirUtil.getExtensionVals( qr.extension );
			var idenJson = FhirUtil.getIdentifierVals( qr.identifier ); // QR only allow 1 identifier, not array

			// NOTE: We can either use WFA generated activityId or this one..
			//		- But, because we want to match with existing one, we should replace it?
			act.id = '';
			act.type = '';
			var activeUser = '';
			
			if ( idenJson.activityId ) act.id = idenJson.activityId;

			if ( !act.id ) act.id = ( extJson.activityId ) ? extJson.activityId : 'qr_' + patientId + '_' + qr.id;	
			if ( !act.type ) act.type = ( extJson.activityType ) ? extJson.activityType : '';
			if ( !act.type ) act.type = ( extJson.transType === 'c_reg' ) ? 'IPC_CLIENT_REG' : '';

			if ( extJson.activeUser ) activeUser = extJson.activeUser;
			
			act.activeUser = activeUser;
			act.creditedUsers = [ activeUser ];

			act.date = FhirUtil.getActDateJson( qr.authored ); // need to get this from 'authored'
			//act.transactions = [ FhirUtil.getTransFromItem( qr.item, extJson ) ];
			act.transactions = FhirUtil.getTransArrFromItems( qr.item, extJson );

			act.resource = qr;
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.convertQR_Activity, ' + errMsg ); }

	return act;
};


FhirUtil.convertSrvReq_Activity = function( item )
{
	var act = {};
	try
	{
		if ( item )
		{
			var patientId = FhirUtil.getRefPatientId( item.subject );
			var extJson = FhirUtil.getExtensionVals( item.extension );
			var idenJson = FhirUtil.getIdentifierVals( item.identifier ); // QR only allow 1 identifier, not array
			var codeJson = FhirUtil.getCodeVals( item.code );

			act.id = 'srvReq_' + patientId + '_' + item.id;
			act.type = 'IPC_ISS';	// if ( status is 'active', ISS, -->  or 'completed', create extra ones.. )

			var activeUser = '';
			
			if ( extJson.activeUser ) activeUser = extJson.activeUser;

			act.activeUser = activeUser;
			act.creditedUsers = [ activeUser ];

			act.date = FhirUtil.getActDateJson( item.occurrenceDateTime );

			//act.status = item.status;
			act.voucherCode = codeJson[ 'voucher-code' ];

			act.resource = item;

			act.transactions = [{
				type: 'v_iss',
				dataValues: {
					voucherCode: act.voucherCode,
					patientId: patientId,
					status: item.status,
					occurrenceDateTime: item.occurrenceDateTime
				}
			}];
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.convertSrvReq_Activity, ' + errMsg ); }

	return act;
};


FhirUtil.convertCommReq_Activity = function( item )
{
	var act = {};
	try
	{
		if ( item )
		{
			var patientId = FhirUtil.getRefPatientId( item.subject );
			var extJson = FhirUtil.getExtensionVals( item.extension );
			var idenJson = FhirUtil.getIdentifierVals( item.identifier ); // QR only allow 1 identifier, not array

			var gIdenVoucher = ( item.groupIdentifier && item.groupIdentifier.value ) ? item.groupIdentifier.value: '';

			var actType_Voucher = ( idenJson.voucherCode || gIdenVoucher ) ? true: false;
			var actType_name = ( actType_Voucher ) ? 'Voucher_': '';

			act.id = 'commReq_' + actType_name + patientId + '_' + item.id;
			act.type = ( actType_Voucher ) ? 'Reminder_Voucher': 'Reminder';

			var activeUser = '';
			
			if ( extJson.activeUser ) activeUser = extJson.activeUser;

			act.activeUser = activeUser;
			act.creditedUsers = [ activeUser ];

			act.date = FhirUtil.getActDateJson( item.occurrenceDateTime );

			act.status = item.status;
			act.voucherCode = idenJson.voucherCode;
			if ( !act.voucherCode && gIdenVoucher )  act.voucherCode = gIdenVoucher;

			act.resource = item;

			act.transactions = [{
				type: 's_rem',
				dataValues: {
					voucherCode: act.voucherCode,
					payload: item.payload,
					patientId: patientId,
					status: item.status,
					occurrenceDateTime: item.occurrenceDateTime
				}
			}];
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.convertCommReq_Activity, ' + errMsg ); }

	return act;
};


FhirUtil.getRefPatientId = function( subject )
{
	var patientId;

	try
	{
		if ( subject && subject.reference ) patientId = subject.reference.replace( 'Patient/', '' );
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getRefPatientId, ' + errMsg ); }

	return patientId;
};


FhirUtil.getTransArrFromItems = function( items, extraJson )
{
	var transArr = [];
	var transObj = {};

	try
	{		
		var transDataTarget_default = FhirUtil.getTransDataTarget_Default( transObj, extraJson );

		// Set up transaction object for target
		items.forEach( item => 
		{
			if ( item.answer && item.answer.length > 0 )
			{
				var transDataTarget = FhirUtil.getTransDataTarget_byItemText( transObj, item, transDataTarget_default );

				transDataTarget[ item.linkId ] = FhirUtil.getItemValue( item.answer[0] );	
			}
		});


		// Convert object to array
		for ( var prop in transObj )
		{
			var tObj = { type: prop };
			var tObj_data = transObj[ prop ];
			Util.mergeJson( tObj, tObj_data );

			transArr.push( tObj );
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getTransFromItem, ' + errMsg ); }

	return transArr;
};


FhirUtil.getTransDataTarget_Default = function( transObj, extraJson )
{
	var name_type = 's_info';

	if ( extraJson && extraJson.transType ) name_type = extraJson.transType;

	var name_dataName = FhirUtil.getDataNameByTransType( name_type );	// Could be either 'dataValues', 'clientDetails'

	if ( !transObj[name_type] ) transObj[name_type] = {};
	if ( !transObj[name_type][name_dataName] ) transObj[name_type][name_dataName] = {};	
	
	return transObj[name_type][name_dataName];
};


FhirUtil.getTransDataTarget_byItemText = function( transObj, item, transDataTarget_default )
{
	var transDataTarget = transDataTarget_default;

	if ( item.text )
	{
		var nameArr = item.text.split( '..' );
		if ( nameArr.length === 2 )
		{
			var name_type = nameArr[0];
			var name_dataName = nameArr[1];
	
			if ( name_type && name_dataName )
			{
				if ( !transObj[name_type] ) transObj[name_type] = {};
				if ( !transObj[name_type][name_dataName] ) transObj[name_type][name_dataName] = {};	
				
				transDataTarget = transObj[name_type][name_dataName];
			}
		}
	}
	
	return transDataTarget;
};

// get 'dataValues' or 'clientDetails' by 'c_reg', 'c_upd', 'v_iss', 'v_rdx', etc..
FhirUtil.getDataNameByTransType = function( transType )
{
	var dataName = 'dataValues';

	if ( FhirUtil.TransType_DataMap[ transType ] ) dataName = FhirUtil.TransType_DataMap[ transType ];

	return dataName;
};

FhirUtil.getItemValue = function( item )
{
	var val; 
	
	try
	{
		if ( item )
		{
			for( var prop in item )
			{
				if ( prop.indexOf( 'value' ) === 0 )
				{
					val = item[prop];
					break;
				}
			}	
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getItemValue, ' + errMsg ); }

	return val;
};

FhirUtil.getItemName = function( item, prop )
{
	var name = ''; 
	
	try
	{
		if ( item && item[ prop ] ) name = item[ prop ].replace( 'http://sample.info/', '' );
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getItemName, ' + errMsg ); }

	return name;
};

FhirUtil.getExtensionVals = function( extension )
{
	var extensionJson = { };

	try
	{
		if ( extension && extension.length > 0 )
		{
			extension.forEach( exItem => 
			{
				var val = FhirUtil.getItemValue( exItem );

				if ( exItem.url )
				{
					var name = exItem.url.replace( 'http://sample.info/', '' );
					if ( name ) extensionJson[name] = val;
				}
			});	
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getExtensionVals, ' + errMsg ); }

	return extensionJson;
};


// NOT WORK...  NEED TO DEBUG/WALK THROUGH
FhirUtil.getIdentifierVals = function( idenInput )
{
	var idenJson = { };
	var idenArr = [];

	try
	{
		if ( idenInput )
		{
			if ( Util.isTypeArray( idenInput ) ) idenArr = idenInput;
			else if ( Util.isTypeObject( idenInput ) ) idenArr = [ idenInput ];
	
			idenArr.forEach( item => 
			{
				var name = FhirUtil.getItemName( item, 'system' );
				var val = FhirUtil.getItemValue( item );
	
				if ( name & val ) idenJson[ name ] = val;
			});
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getIdentifierVals, ' + errMsg ); }

	return idenJson;
};


FhirUtil.getCodeVals = function( code )
{
	var codeJson = { };

	try
	{
		if ( code && code.coding )
		{
			code.coding.forEach( item => 
			{
				var name = FhirUtil.getItemName( item, 'system' );

				if ( name & item.code ) codeJson[ name ] = item.code;
			});	
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getCodeVals, ' + errMsg ); }

	return codeJson;
};


FhirUtil.getActDateJson = function( authored )
{
	var date = { };

	try
	{
		var dateObj = new Date( authored );
		var dateLoc = Util.formatDate( dateObj );
		var dateUTC = Util.formatDate( dateObj.toUTCString() );
		
		date.createdLoc = dateLoc;
		date.capturedLoc = dateLoc;
		date.updatedLoc = dateLoc;		// Use resource 'meta' lastUpdated to populate 'updated' date?
		date.syncedLoc = dateLoc;

		date.createdUTC = dateUTC;
		date.capturedUTC = dateUTC;
		date.updatedUTC = dateUTC;
		date.syncedUTC = dateUTC;
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getActDateJson, ' + errMsg ); }

	return date;
};

FhirUtil.getClientDateJson = function( oldestDate, newestDate )
{
	var date = { };

	try
	{
		if ( oldestDate )
		{
			var dateLoc = Util.formatDate( oldestDate );
			var dateUTC = Util.formatDate( oldestDate.toUTCString() );
	
			date.createdLoc = dateLoc;	// Maybe we should set this as oldest date?  or save the initial date?  of questionnaire?
			date.syncedLoc = dateLoc;
			
			date.createdUTC = dateUTC;
			date.syncedUTC = dateUTC;
		}

		if ( newestDate )
		{
			var dateLoc = Util.formatDate( newestDate );
			var dateUTC = Util.formatDate( newestDate.toUTCString() );
	
			date.updatedLoc = dateLoc;
			date.updatedOnMdbLoc = dateLoc;

			date.updatedUTC = dateUTC;
			date.updatedOnMdbUTC = dateUTC;
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getClientDateJson, ' + errMsg ); }

	return date;
};

FhirUtil.getClientDateByQRArr = function( patient, questRespArr )
{
	var dateJson = {};

	try
	{
		if ( patient && questRespArr )
		{
			var oldestDate;
			var newestDate;
			// check 'meta' "lastUpdated": "2023-02-23T09:58:07.070+00:00",
		
			var pDate = new Date( patient.meta.lastUpdated );
			oldestDate = pDate;
			newestDate = pDate;
		
			questRespArr.forEach( qr => {
				var date = new Date( qr.meta.lastUpdated );
				if ( !newestDate || newestDate < date ) newestDate = date;
				if ( !oldestDate || oldestDate > date ) oldestDate = date;		
			});
		
			dateJson = FhirUtil.getClientDateJson( oldestDate, newestDate );
		}	
	}
	catch( errMsg )
	{
		console.log( 'ERROR in FhirUtil.getClientDateByQRArr, ' + errMsg );
	}

	return dateJson;
};

// --------------------------------

FhirUtil.runEvalSample = function()
{
	var fhir = {
		Patient: {
			"id": "30706",
			"resourceType": "Patient",
			"name": [
				{
					"use": "official",
					"given": ["Mark"],
					"family": "Tester"
				}
			],
			"gender": "male",
			"birthDate": "1997-09-08",
			"telecom": [
				{
					"value": "11223344",
					"use": "mobile",
					"system": "phone"
				}
			],
			"address": [
				{
					"line": [
						"214, Diamond Street"
					],
					"city": "Busan",
					"state": "Busan",
					"postalCode": "56883"
				}
			]
		}, 
		QuestionnaireResponses: [
			{
				"resourceType": "QuestionnaireResponse",
				"id": "30705",
				"meta": {
					 "versionId": "1",
					 "lastUpdated": "2023-02-16T02:54:42.285+00:00",
					 "profile": [
						  "a360-KR"
					 ]
				},
				"status": "completed",
				"subject": {
					 "reference": "Patient/30706",
					 "display": "Mark Tester"
				},
				"authored": "2023-02-19T14:15:00-05:00",
				"item": [
					 {
						  "linkId": "firstName",
						  "text": "firstName",
						  "answer": [
								{
									 "valueString": "Mark"
								}
						  ]
					 },
					 {
						  "linkId": "lastName",
						  "text": "lastName",
						  "answer": [
								{
									 "valueString": "Tester"
								}
						  ]
					 }
				],
				"extension": [
					{ "url": "http://sample.info/activeUser", "valueString": "ZW_TEST_IPC" },
					{ "url": "http://sample.info/activityId", "valueString": "ZW_TEST_IP_20230218_010101123" },
					{ "url": "http://sample.info/transType", "valueString": "c_reg" }
				]	
		  }			
		] 
	};

	var clientJson = FhirUtil.evalClientTemplate( fhir );

	console.log( clientJson );

};

// REF From -->  PayloadTemplateHelper.evalPayloads = function( payloadList, INFO, defPayloadTemplates )
FhirUtil.evalClientTemplate = function( fhirResp )
{
	var clientJson = {};

	var defFhirConvert = ConfigManager.getConfigJson().definitionFhirConvert;

	var INFO = InfoDataManager.getINFO();
	INFO.fhirResp = fhirResp;

	if ( defFhirConvert.preEval ) eval( Util.getEvalStr( defFhirConvert.preEval ) );

	// TODO: Optionally, skip the eval error case.
	if ( defFhirConvert && defFhirConvert.clientTemplate ) 
	{
		clientJson = Util.cloneJson(defFhirConvert.clientTemplate);

		Util.traverseEval(clientJson, INFO, 0, 50, { skipError: true } );
	}

	INFO.client = clientJson;

	try
	{
		if ( defFhirConvert.postEval ) eval( Util.getEvalStr( defFhirConvert.postEval ) );
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.evalClientTemplate, postEval, ' + errMsg ); }

	return clientJson;
};

// TODO: add 2nd field for option...
FhirUtil.getQRItemsArray = function( formsJson, option )
{
	var items = [];

	try
	{
		if ( !option ) option = {};
		 
		if ( formsJson )
		{
			for ( var name in formsJson )
			{
				if ( option.exceptions && option.exceptions.indexOf( name ) >= 0 ) { }
				else
				{
					var val = formsJson[name];
					val = Util.valueStringifyEscape( val );
	
					var item = {};
	
					item.linkId = name;  // item.text = name;
					item.answer = [ { valueString: val } ];	// Not always string, right?

					if ( option.text ) item.text = option.text;

					items.push( item );	
				}
			}
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getQRItemsArray, ' + errMsg ); }

	return items;
};


FhirUtil.getExtClientDetail = function( extension, urlName )
{   
	var outputJson = '';

	var extClientDetail = Util.getFromList( extension, urlName, 'url' );

	try
	{
		if ( extClientDetail && extClientDetail.valueString )
		{
			outputJson = JSON.parse( Util.valueUnescape(extClientDetail.valueString) );			
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getExtClientDetail, ' + errMsg ); }

	return outputJson;
};

FhirUtil.mergeClientDetail = function( clientDetails, pExtClientDetail )
{
	if ( pExtClientDetail && clientDetails )
	{
		for( var extProp in pExtClientDetail )
		{
			var propVal = pExtClientDetail[ extProp ];

			if ( propVal && !clientDetails[ extProp ] ) clientDetails[ extProp ] = propVal;
		}	
	}
};

FhirUtil.getTelInfo = function( telecomArr )
{
	var telInfo = {};
	var telPhone = '';
	var telWA = '';	

	if ( telecomArr && telecomArr.length > 0 )
	{
		telecomArr.forEach( telItem => {
			if ( telItem.system === 'phone' ) telPhone = telItem;
			else if ( telItem.system === 'other' && telItem.value && telItem.value.indexOf( 'whatsapp|' ) === 0 ) telWA = telItem;
		});

		telInfo.ownershipOfPhone = 'HER';
		telInfo.sharedNumber = ( ( telPhone && telPhone.use === 'temp' ) || ( telWA && telWA.use === 'temp' ) ) ? 'YES': 'NO';
		telInfo.phoneNumber = ( telPhone ) ? telPhone.value: '';
		telInfo.phoneNumber_whatsApp = ( telWA ) ? telWA.value: '';
		// telInfo.contactConsentService = 'NO'; <-- Filled later by extra?
		// contactConsentService	--> 'NO' / 'YESP' / 'YESPP'	<-- From Consent Resource <-- Need DWS retrieval..

		// preferredLanguage	--> 'en' / 'sw' <-- TODO: where to store this?

		// preferredContactChannel --> WA / CALL / SMS 
		if ( telPhone && telPhone.rank == 1 ) telInfo.preferredContactChannel = 'CALL';
		else if ( telWA && telWA.rank == 1 ) telInfo.preferredContactChannel = 'WA';
	}
	else telInfo.ownershipOfPhone = 'NO';


	return telInfo;
};


FhirUtil.getCommInfo = function( commArr )
{
	var commInfo = { preferredLanguage: '' };

	if ( commArr && commArr.length > 0 )
	{
		commArr.forEach( cItem => {
			if ( cItem.preferred === true ) 
			{
				if ( cItem.language && cItem.language.coding )
				{
					cItem.language.coding.forEach( codingItem => {
						if ( codingItem.code ) commInfo.preferredLanguage = codingItem.code;
					} );
				}
			}
		});
	}

	return commInfo;
};


FhirUtil.getContactConsent = function( consentArr )
{
	var consent = false;
	var settingFhir = ConfigManager.getSettingFHIR();

	if ( settingFhir.consentDocumentReference )
	{
		try 
		{
			if ( consentArr && consentArr.length > 0 )
			{
				consentArr.forEach( csItem => 
				{
					if ( csItem.status === 'active' && csItem.sourceReference && csItem.sourceReference.reference === 'DocumentReference/' + settingFhir.consentDocumentReference ) consent = true;
				});
			}	
		}
		catch ( errMsg ) { console.log( 'ERROR in FhirUtil.getContactConsent, ' + errMsg ); }	
	}

	return consent;
};