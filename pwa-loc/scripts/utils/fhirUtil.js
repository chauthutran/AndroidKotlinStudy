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

FhirUtil.getClientList_FromResponse = function ( response )
{
	var clientList = [];

	try
	{
		if ( response && response.entry ) FhirUtil.getPatientResourceSet( response ).forEach( rscSet => { clientList.push( FhirUtil.evalClientTemplate( rscSet ) ); } );
	}
	catch( errMsg )
	{
		console.log( 'ERROR in FhirUtil.getClientList_FromResponse, ' + errMsg );
	}

	return clientList;
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

FhirUtil.generateActivities_fmQR = function ( questRespArr ) 
{
	var activities = [];

	try
	{
		if ( questRespArr && questRespArr.length > 0 )
		{
			questRespArr.forEach( qr => {
				activities.push( FhirUtil.convertQR_Activity( qr ) );
			});
		}	
	}
	catch( errMsg )
	{
		console.log( 'ERROR in FhirUtil.generateActivities_fmQR, ' + errMsg );
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
			var patientId = FhirUtil.getQrPatientId( qr.subject );
			var extJson = FhirUtil.getExtensionVals( qr.extension );

			// NOTE: We can either use WFA generated activityId or this one..
			//		- But, because we want to match with existing one, we should replace it?
			act.id = ( extJson.activityId ) ? extJson.activityId: 'qr_' + patientId + '_' + qr.id;	

			act.activeUser = extJson.activeUser;
			act.creditedUsers = [ extJson.activeUser ];

			act.date = FhirUtil.getActDateJson( qr.authored ); // need to get this from 'authored'

			act.transactions = [ FhirUtil.getTransFromItem( qr.item, extJson ) ];
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.convertQR_Activity, ' + errMsg ); }

	return act;
};

FhirUtil.getQrPatientId = function( subject )
{
	var patientId;

	try
	{
		if ( subject && subject.reference ) patientId = subject.reference.replace( 'Patient/', '' );
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getQrPatientId, ' + errMsg ); }

	return patientId;
};


FhirUtil.getTransFromItem = function( items, extJson )
{
	var trans = { type: 's_info' };

	try
	{
		if ( extJson.transType ) trans.type = extJson.transType;
		var dataName = FhirUtil.getDataNameByTransType( trans.type );	// Could be either 'dataValues', 'clientDetails'
		trans[dataName] = {};
		var transData = trans[dataName];

		items.forEach( item => 
		{
			if ( item.answer && item.answer.length > 0 )
			{
				var answerObj = item.answer[0];
				transData[ item.linkId ] = FhirUtil.getItemValue( answerObj );	
			}
		});
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getTransFromItem, ' + errMsg ); }

	return trans;
};

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
		for( var name in item )
		{
			if ( name.indexOf( 'value' ) >= 0 )
			{
				val = item[name];
				break;
			}
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getItemValue, ' + errMsg ); }

	return val;
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

	return FhirUtil.getClientDateJson( oldestDate, newestDate );
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

	if ( defFhirConvert.postEval ) eval( Util.getEvalStr( defFhirConvert.postEval ) );

	return clientJson;
};


FhirUtil.getQRItemsArray = function( formsJson )
{
	var items = [];

	try
	{
		if ( formsJson )
		{
			for ( var name in formsJson )
			{
				var val = formsJson[name];

				var item = {};

				item.linkId = name;  // item.text = name;
				item.answer = [ { valueString: val } ];	// Not always string, right?

				items.push( item );
			}
		}
	}
	catch( errMsg ) { console.log( 'ERROR in FhirUtil.getQRItemsArray, ' + errMsg ); }

	return items;
};