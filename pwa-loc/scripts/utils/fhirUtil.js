// -------------------------------------------
// -- FhirUtil Class/Methods

function FhirUtil() { }

// ==== Methods ======================

FhirUtil.generateActivities_fmQR = function ( questRespArr ) 
{
	var activities = [];

	try
	{
		if ( questRespArr && questRespArr.length > 0 )
		{
			questRespArr.forEach( qr => {
				activities.push( qr );
			});
		}	
	}
	catch( errMsg )
	{
		console.log( 'ERROR in FhirUtil.generateActivities_fmQR, ' + errMsg );
	}

	return activities;
};

FhirUtil.runEvalSample = function()
{
	var fhir = {
		Patient: {
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
			{ test: true }
		] 
	};

	var clientJson = FhirUtil.evalClientTemplate( fhir );

	console.log( clientJson );
};

// REF From -->  PayloadTemplateHelper.evalPayloads = function( payloadList, INFO, defPayloadTemplates )
FhirUtil.evalClientTemplate = function( fhir )
{
	var clientJson;

	var defFhirConvert = ConfigManager.getConfigJson().definitionFhirConvert;

	var INFO = InfoDataManager.getINFO();
	INFO.fhir = fhir;

	eval( Util.getEvalStr( defFhirConvert.preEval ) );

	// TODO: Optionally, skip the eval error case.
	if ( defFhirConvert && defFhirConvert.clientTemplate ) 
	{
		clientJson = Util.cloneJson(defFhirConvert.clientTemplate);

		Util.traverseEval(clientJson, INFO, 0, 50, { skipError: true } );
	}

	return clientJson;
};

