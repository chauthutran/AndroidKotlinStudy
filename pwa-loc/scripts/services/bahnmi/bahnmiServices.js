

function BahmniService() { }


BahmniService.syncDownProcessingTotal = 0;
BahmniService.syncDownProcessingIdx = 0;
BahmniService.allSyncDownResponseData = {};
BahmniService.syncDownDataList = [];
BahmniService.syncDownStatus = {status: "success"};


BahmniService.SERVICE_BASE_URL = "http://localhost:3020/";

BahmniService.composeURL = function( bahmniUrl )
{
    var baseUrlService = ( WsCallManager.checkLocalDevCase( window.location.origin ) ) ? BahmniService.SERVICE_BASE_URL : "";
    return baseUrlService + bahmniUrl;
};
// ==============================================================================
// SyncDown
// ==============================================================================

BahmniService.syncDown = function(exeFunc)
{
    INFO.bahmniResponseData = {};

    BahmniService.appointmentIdxProcessing = 0;
    BahmniService.syncDownStatus = {status: "success"};
    BahmniService.allSyncDownResponseData = {};
    BahmniService.syncDownDataList = [];
    
    const configSynDownList = ConfigManager.getSettingsBahmni().syncDownList;
    if( configSynDownList )
    {
        BahmniService.syncDownProcessingTotal = configSynDownList.length;
        BahmniService.syncDownProcessingIdx = 0;

        for( var i=0; i<configSynDownList.length; i++ )
        {
            var configSynDownData = configSynDownList[i];
            var url = eval( Util.getEvalStr( configSynDownData.urlEval ) );

            if( configSynDownData.method.toUpperCase() == "POST" )
            {
                Util.traverseEval(configSynDownData.payload, InfoDataManager.getINFO(), 0, 50);

                BahmniService.sendPostRequest(configSynDownData.id, url, configSynDownData.payload, function(response) {
                    INFO.respone = response;
                    const responseData = eval( Util.getEvalStr( configSynDownData.responseEval ) );
                    BahmniService.allSyncDownResponseData[responseData.id] = responseData.data;
                    BahmniService.afterSyncDown(exeFunc);
                })
            }
            else if( configSynDownData.method.toUpperCase() == "GET" )
            {
                BahmniService.sendGetRequest(configSynDownData.id, url, function(response) {
                    INFO.respone = response;
                    const responseData = eval( Util.getEvalStr( configSynDownData.responseEval ) );
                    BahmniService.allSyncDownResponseData[responseData.id] = responseData.data;
                    BahmniService.afterSyncDown(exeFunc);
                });
            }
        }
    }
    
};

BahmniService.afterSyncDown = function(exeFunc)
{
    BahmniService.syncDownProcessingIdx++;
    if( BahmniService.syncDownProcessingIdx == BahmniService.syncDownProcessingTotal )
    {
        console.log("===== BahmniService.allSyncDownResponseData");
        console.log(BahmniService.allSyncDownResponseData);
        var allSyncDownData = BahmniService.allSyncDownResponseData;

        var patientIds = [];
        var appointmentIds = [];
        var appointments = [];
        for( var i in allSyncDownData )
        {
            var data = allSyncDownData[i];
            if( data.patientIds )
            {
                patientIds = patientIds.concat( data.patientIds ); 
                patientIds = patientIds.filter((item, pos) => patientIds.indexOf(item) === pos); // Remove duplicated Ids
            }

            if( data.appointmentIds )
            {
                appointmentIds = appointmentIds.concat( data.appointmentIds ); 
                appointmentIds = appointmentIds.filter((item, pos) => appointmentIds.indexOf(item) === pos); // Remove duplicated Ids
            }
            if( data.appointments )
            {
                appointments = appointments.concat( data.appointments );
            }
           
        }

        BahmniService.syncDownDataList = { patientIds, appointmentIds, appointments, patients: [] };
        
        BahmniService.getAppointmentDataList(BahmniService.syncDownDataList.appointmentIds, function() {
            BahmniService.getPatientDataList(BahmniService.syncDownDataList.patientIds, function() {
                exeFunc({status: BahmniService.syncDownStatus, data: BahmniService.syncDownDataList.patients});
            });
        })
    }
}

BahmniService.getAppointmentDataList = function( appointmentIds, exeFunc )
{
    if( appointmentIds.length > 0 )
    {
        BahmniService.appointmentListTotal = appointmentIds.length;
        BahmniService.appointmentIdxProcessing = 0;

        for( var i=0; i<appointmentIds.length; i++ )
        {
            BahmniService.retrieveAppointmentDetails( appointmentIds[i], function(response) {
                BahmniService.appointmentIdxProcessing ++;
                
                const data = response;
                const patientId = data.patient.uuid;
                if( BahmniService.syncDownDataList.patientIds.indexOf( patientId) < 0 )
                {
                    BahmniService.syncDownDataList.patientIds.push( patientId );
                }

                var activity = BahmniService.generateActivityAppointment(data,  { formData: { sch_favId: 'followUp', fav_newAct: true } } )
                BahmniService.syncDownDataList.appointments.push(activity);
    
                
               
                if( BahmniService.appointmentIdxProcessing == BahmniService.syncDownDataList.appointmentIds.length )
                {
                    exeFunc();
                }
            })
        }
    }
    else
    {
        exeFunc();
    }
};


BahmniService.getPatientDataList = function( patientIds, exeFunc )
{
    if( patientIds.length > 0 )
    {
        BahmniService.patientListTotal = patientIds.length;
        BahmniService.patientIdxProcessing = 0;

        for( var i=0; i<patientIds.length; i++ )
        {
            BahmniService.retrievePatientDetails( patientIds[i], function(response) {
                BahmniService.patientIdxProcessing ++;
                BahmniService.syncDownDataList.patients.push( BahmniService.generateClientData(response.patient) );

                if( BahmniService.patientIdxProcessing == BahmniService.syncDownDataList.patientIds.length )
                {
                    exeFunc();
                }
            })
        }
    }
    else
    {
        exeFunc();
    }
};


// ------------------------------------------------------------------------------
// Retrieve data from Bahmni server

BahmniService.retrievePatientDetails = function( patientId, exeFunc )
{
    const url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/patientprofile/" + patientId + "?v=full";
    BahmniService.sendGetRequest(url, exeFunc);
};

BahmniService.retrieveAppointmentDetails = function( appointmentId, exeFunc )
{
    const url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/appointment?uuid=" + appointmentId;
    BahmniService.sendGetRequest(url, exeFunc);
};

// ==============================================================================
// SyncUp 
// ==============================================================================

BahmniService.syncUp = function(activityJson, exeFunc)
{
    // elseCase: "Follow Up Referrals Template Form" OR "Follow Up Assessment Plan"
    var endpoint = ( activityJson.type == "Follow Up Appointment" ) ? "fupAppointment": "addFormData";

    const url = BahmniService.composeURL( endpoint, '?action=' + endpoint );

    BahmniService.sendPostRequest(url, activityJson.syncUp, exeFunc );
}


// ------------------------------------------------------------------------------
// Convert data ( patient, appointment ) to WFA Object

BahmniService.generateClientData = function( patientData )
{
    var resolveData =  {};

    const patientId = patientData.uuid;
    resolveData = { _id: patientId, subSourceType: "bahnmi", clientDetails : patientData.person, activities: [], date: BahmniService.generateJsonDate(BahmniService.lastSyncedDatetime)};
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

    
    // Set activities - Referal Template From Data 
    const refFromDataActivity = BahmniService.syncDownDataList.appointments[patientId];
    if( refFromDataActivity != undefined )
    {
        resolveData.activities.push(refFromDataActivity);  
    }

    // Set activities - "Scheduled" Appointment 
    const appointmentDataList = Util.findAllFromList( BahmniService.syncDownDataList.appointments, patientId, "patientId");
    if( appointmentDataList.length > 0 )
    {
        resolveData.activities = resolveData.activities.concat(appointmentDataList );  
        // for( var j=0; j<appointmentData.length; j++ )
        // {
        //     const data = appointmentData[j];

        //     // const activity = BahmniService.generateActivityAppointment(data, { formData: { sch_favId: 'followUp', fav_newAct: true } } );
        //     resolveData.activities.push(activity);  
        // }
    }
    
    return resolveData;
};

BahmniService.generateActivityAppointment = function( data, options )
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

    var activity = { id: data.uuid, transactions:[{dataValues, type}], type: type, originalData: data, date: BahmniService.generateJsonDate(BahmniService.lastSyncedDatetime), patientId: data.patient.uuid };
    if ( options.formData ) activity.formData = options.formData;

    return activity;
};

BahmniService.generateActivityFormData = function( refDormData, type, formNameId )
{
    const patientId = refDormData.patientUuid;
    // const checkedActivity = BahmniService.llSyncDownResponseData.appointments[patientId]; // Try to get the latest one in case one person has many "Referals Template Form data"
    // if( checkedActivity != undefined && checkedActivity.formVersion > refDormData.formVersion )
    // {
    //     return checkedActivity;
    // }

    var dataValues =  {
        encounterUuid: refDormData.encounterUuid,
        formUuid: BahmniService.REFERALS_FORM_ID,
        patientUuid: patientId,
        visitUuid: refDormData.visitUuid,
        formVersion: refDormData.formVersion
    };

    const activityId = patientId + "_" + (new Date).getMilliseconds();
    return { id: activityId, transactions:[{dataValues, type}], type: type, formData: { sch_favId: formNameId, fav_newAct: true }, originalData: refDormData, date: BahmniService.generateJsonDate(BahmniService.lastSyncedDatetime) };
};

BahmniService.generateJsonDate = function( startDateTime ) {
    var dateObj = new Date( startDateTime );

    var month = BahmniService.resolveNumber(dateObj.getMonth());
    var hours = BahmniService.resolveNumber( dateObj.getHours() );
    var minutes = BahmniService.resolveNumber(dateObj.getMinutes());
    var seconds = BahmniService.resolveNumber(dateObj.getSeconds());

    var dateStr = dateObj.getFullYear() + "-" + month + "-" + dateObj.getDate() + ":" + hours + ":" + minutes + ":" + seconds + ".000";
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

BahmniService.resolveNumber = function(number)
{
    return ( number >= 10 ) ? ('' + number) : ('0' + number);
};


// ------------------------------------------------------------------------------
// Request API Util

BahmniService.sendGetRequest = function(id, url, exeFunc )
{
    $.ajax({
        url: BahmniService.composeURL(url),
        type: "GET",
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': eval(INFO.bahmni_authBasicEval) },
        dataType: "json", 
        success: function (response) 
        {
            INFO.bahmniResponseData[id] = response;
            exeFunc(response);
        },
        error: function ( errMsg ) {
            console.log({ msg: errMsg, status: Constants.status_failed });
        }
    });
}

BahmniService.sendPostRequest = function(id, url, data, exeFunc )
{
    $.ajax({
        url: BahmniService.composeURL(url),
        type: "POST",
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': eval(INFO.bahmni_authBasicEval) },
        dataType: "json", 
        data: JSON.stringify(data),
        async: false,
        success: function (response) 
        {
            INFO.bahmniResponseData[id] = response;
            exeFunc(response);
        },
        error: function ( errMsg ) {
            exeFunc({msg: errMsg, status: Constants.status_failed});
        }
    });
}


