function BahmniUtil () {}


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

BahmniUtil.generateActivityFormData = function( refDormData, type, formNameId, formId )
{
    const patientId = refDormData.patientUuid;

    var dataValues =  {
        encounterUuid: refDormData.encounterUuid,
        formUuid: formId,
        patientUuid: patientId,
        visitUuid: refDormData.visitUuid,
        formVersion: refDormData.formVersion,
        // fieldReport: refDormData.fieldReport
    };

    var activityId = refDormData.encounterUuid + "--" + formId;
    return { id: activityId, transactions:[{dataValues, type}], type: type, formData: { sch_favId: formNameId, fav_newAct: true }, originalData: refDormData, date: BahmniUtil.generateJsonDate(), patientId: patientId };
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