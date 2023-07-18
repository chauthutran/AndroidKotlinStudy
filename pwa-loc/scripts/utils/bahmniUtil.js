function BahmniUtil () {}

BahmniUtil.KEY_FD_META_DATA = "metadata";

BahmniUtil.KEY_RT_FIELD_REPORT = "fieldReport";
BahmniUtil.KEY_RT_CLIENT_REPORT_OUTCOME = "clientReportOutcome";
BahmniUtil.KEY_RT_DATE_REPORT_BY_CLIENT = "dateReportedByClient";
BahmniUtil.KEY_RT_NEW_DATE = "newDate";

BahmniUtil.KEY_AP_FIELD_REPORT = "fieldReport";
BahmniUtil.KEY_AP_PILL_COUNT_CONT = "pillCountCont";
BahmniUtil.KEY_AP_SUPPLY_DELEVERIED_TO_CLIENT= "supplyDeleveriedToClient";
BahmniUtil.KEY_AP_FORM_RESCHEDULE_IN_CONC = "formRescheduleInConc";
BahmniUtil.KEY_AP_REASON_FORM_MISSED_DELEVERY = "reasonForMissedDelivery";


// ------------------------------------------------------------------------------
// Convert data ( patient, appointment ) to WFA Object

BahmniUtil.generateClientData = function( patientData )
{
    var resolveData =  {};

    const patientId = patientData.uuid;
    resolveData = { _id: patientId, subSourceType: "bahmni", clientDetails : patientData.person, activities: [], date: BahmniUtil.generateJsonDate(), patientId: patientId};
    resolveData.clientDetails.firstName = patientData.person.preferredName.givenName;
    resolveData.clientDetails.lastName = patientData.person.preferredName.familyName;

    const identifiers = patientData.identifiers;
    for( let i=0; i<identifiers.length; i++ )
    {
        const iden = identifiers[i];
        const value =  iden.identifier;
        const key = iden.identifierType.display; // iden.identifierType.uuid
        resolveData.clientDetails[key] = value;
    }

    return resolveData;
};

BahmniUtil.generateActivityAppointment = function( data, options )
{
    if ( !options ) options = {};

    const type = "Appointment";
    let dataValues = { ...data };
    dataValues.startDateTime = UtilDate.dateStr("DT", new Date(dataValues.startDateTime)); // Format the 'startDateTime'
    dataValues.endDateTime = UtilDate.dateStr("DT", new Date(dataValues.endDateTime)); //  Format the 'endDateTime'
    const serviceKeys = Object.keys(data.service);
    for( var i=0; i<serviceKeys.length; i++ )
    {
        const key = serviceKeys[i];
        dataValues["service_" + key] = data.service[key];
    }

    var activity = { id: data.uuid, transactions:[{dataValues, type}], type: type, originalData: data, date: BahmniUtil.generateJsonDate(), patientId: data.patient.uuid };
    if ( options.formData ) activity.formData = options.formData;

    return activity;
};

BahmniUtil.generateActivityFormData = function( formData, type, formNameId )
{
    const patientId = formData.patientUuid;

    var dataValues =  {
        encounterUuid: formData.encounterUuid,
        patientUuid: patientId,
        visitUuid: formData.visitUuid,
        formVersion: formData.formVersion
    };

    var activityId = formData.encounterUuid + "--" + BahmniUtil.getFormMetadata(formData.formName, formData.formVersion, BahmniUtil.KEY_FD_META_DATA, "uuid");
    return { id: activityId, transactions:[{dataValues, type}], type: type, formData: { sch_favId: formNameId, fav_newAct: true }, originalData: formData, date: BahmniUtil.generateJsonDate(), patientId: patientId };
};

BahmniUtil.generateJsonDate = function() {
    var dateStr = UtilDate.dateStr('DT', new Date());

    return { capturedLoc: dateStr,
            capturedUTC: dateStr,
            createdLoc: dateStr,
            createdOnDeviceLoc: dateStr,
            createdOnDeviceUTC: dateStr,
            createdUTC: dateStr,
            updatedLoc: dateStr,
            updatedUTC: dateStr
        };
};

BahmniUtil.resolveNumber = function(number)
{
    return ( number >= 10 ) ? ('' + number) : ('0' + number);
};


BahmniUtil.generateOptionsByConcept = function(concept)
{
    var options = [];

    const answers = concept.answers;
    for( var i=0; i<answers.length; i++ )
    {
        options.push({ "defaultName": answers[i].display, "value": answers[i].uuid });
    }

    return options;
}

BahmniUtil.getFormMetadata = function(formName, formVersion, keyword, propertyName)
{
    var returnVal = 'null';

    // NOTE: CHANGED!!
    try {
        var metadata = INFO.formMetadata[formName][formVersion][keyword];
        var value = (metadata ) ? metadata[propertyName] : undefined ;
        returnVal = ( value ) ? metadata[propertyName] : "null";
    }
    catch( errMsg ) {  console.log( 'ERROR in BahmniUtil.getFormMetadata, ' + errMsg );  }

    return returnVal;
}

BahmniUtil.getActivityInfo = function( activity )
{
    let activityType = INFO.activity.type; 
    let activityFormVersion = ActivityDataManager.getTransDataValue( activity.transactions, 'formVersion' );
    if( activityFormVersion )
    {
        let matadataFormVersion = (INFO.formMetadata[activityType]) ? INFO.formMetadata[activityType][activityFormVersion] : ''; 
        let isSupported =  (matadataFormVersion !== "undefined") ? '' : 'No supported';
        return activity.type + ": " + activityFormVersion + " <span style=\"font-size:10px;font-style:italic;\">" + isSupported + "</span>";
    }

    return activity.type;
}


BahmniUtil.showProgressBar = function (width) {
	if (width) {
		$('#divSubResourceProgressInfo').css('width', width);
		// $('div.determinate').css('width', width);
	}
	$('#divSubResourceProgressBar').css('display', 'block');
	//$( '#divProgressBar' ).css( 'zIndex', '200' );
	$('#divSubResourceProgressBar').show();
}

BahmniUtil.hideProgressBar = function () {
	$('#divSubResourceProgressBar').hide();
	//$( '#divProgressBar' ).css( 'zIndex', '0' );
}