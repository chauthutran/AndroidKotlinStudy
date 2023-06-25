

function BahmniService() { }

BahmniService.lastSyncedDatetime = "2023-05-01T16:56:01.000+0530";
BahmniService.dsdaUUID = "8fa28e5b-caaf-4337-a611-f143a645aba8";
BahmniService.REFERALS_FORM_ID = "8eddd3da-f8a7-49b6-925f-7a54745ca168";

BahmniService.SYNC_DOWN_DATA = {
    "lastSyncedDatetime": BahmniService.lastSyncedDatetime,
    "dsdaUUID": BahmniService.dsdaUUID,
    "relationshipTypeDescription": "DSDA to Client Assignment"
};

BahmniService.SERVICE_BASE_URL = "http://localhost:3020/";

BahmniService.downloadSyncUpList = false;
BahmniService.downloadReferralsTemplateList = false;
BahmniService.downloadAssessmentPlanList = false;
BahmniService.syncDownStatus = {status: "success"};

BahmniService.syncDownData = [];
BahmniService.patientIds = [];
BahmniService.appointmentIds = [];
BahmniService.appointmentDataList = {};
BahmniService.activityList = {};

// -----------------------------

BahmniService.getURL = function( bahmniUrl)
{
    return ( WsCallManager.checkLocalDevCase( window.location.origin ) ) ? BahmniService.SERVICE_BASE_URL + bahmniUrl : bahmniUrl;
};

BahmniService.composeURL = function( localCaseStr, dwsCaseStr )
{
    // var fullUrl = BahmniService.getBaseURL();
    
    // if ( WsCallManager.checkLocalDevCase( window.location.origin ) ) fullUrl += localCaseStr;
    // else fullUrl += dwsCaseStr; // ?action=', false
    
    // return fullUrl;

    var fullUrl = BahmniService.getBaseURL();
    return fullUrl + dwsCaseStr;
};

// ==============================================================================
// SyncDown
// ==============================================================================

BahmniService.syncDown = function(exeFunc)
{
    BahmniService.syncDownData = [];
    BahmniService.patientIds = [];
    BahmniService.appointmentIds = [];
    BahmniService.appointmentDataList = {};
    BahmniService.activityList = {};
    
    BahmniService.appointmentListTotal = 0;
    BahmniService.appointmentIdxProcessing = 0;
    BahmniService.downloadSyncUpList = false;
    BahmniService.downloadReferralsTemplateList = false;
    BahmniService.downloadAssessmentPlanList = false;
    BahmniService.syncDownStatus = {status: "success"};
    
    BahmniService.retrieveSyncDownData( exeFunc );
    BahmniService.getRefTemplateFormDataList( exeFunc );
    BahmniService.getAssessmentPlanDataList( exeFunc );
};


// SyncDown - patient uuids, scheduled appoimemt uuids
BahmniService.retrieveSyncDownData = function( exeFunc )
{
    const url = BahmniService.composeURL( "syncDown", '?action=syncDown' );
    

    BahmniService.sendPostRequest(url, data, function(response) {
        if( response.status == "success" )
        {
            var dataList = response.data;
            
            for( let i=0; i<dataList.length; i++ )
            {
                let item = dataList[i];
                let resourceType = item.resource;
                if( resourceType == "patient" )
                {
                    BahmniService.patientIds.push(item.uuid);
                }
                else if( resourceType == "appointment" )
                {
                    BahmniService.appointmentIds.push(item.uuid);
                }
            }
        }
        else
        {
            BahmniService.syncDownStatus = response;
        }
        BahmniService.downloadSyncUpList = true;
        BahmniService.afterDownloadSyncDownIdList( exeFunc );
        // exeFunc( response );
    } );
};

// SyncDown - Referral Template Forms data
BahmniService.getRefTemplateFormDataList = function(exeFunc)
{
    const url = BahmniService.composeURL( 'getReferalsDataList', '?action=getReferalsDataList' );

    BahmniService.sendPostRequest(url, BahmniService.SYNC_DOWN_DATA, function(refTemplateFormResponse){
        if( refTemplateFormResponse.status == "success" )
        {
            const refTemplateFormList = refTemplateFormResponse.data;
            for( let i=0; i<refTemplateFormList.length; i++ )
            {
                const item = refTemplateFormList[i];
                const patientId = item.patientUuid;
                if( BahmniService.patientIds.indexOf(patientId) <0 )
                {
                    BahmniService.patientIds.push(patientId);
                }

                const activity = BahmniService.generateActivityFormData(item, "Referrals Template", "referralsForm");
                BahmniService.activityList[patientId] = activity;
            }
        }
        else
        {
            BahmniService.syncDownStatus = refTemplateFormResponse;
        }

        BahmniService.downloadReferralsTemplateList = true;
        BahmniService.afterDownloadSyncDownIdList(exeFunc);
        // exeFunc(refTemplateFormResponse);
    });
};

// SyncDown - Assessment Plan data
BahmniService.getAssessmentPlanDataList = function(exeFunc)
{
    const url = BahmniService.composeURL( "getAssessmentPlanDataList", '?action=getAssessmentPlanDataList' );

    BahmniService.sendPostRequest(url, BahmniService.SYNC_DOWN_DATA, function(response){
        if( response.status == "success" )
        {
            const refTemplateFormList = response.data;
            for( let i=0; i<refTemplateFormList.length; i++ )
            {
                const item = refTemplateFormList[i];
                const patientId = item.patientUuid;
                if( BahmniService.patientIds.indexOf(patientId) <0 )
                {
                    BahmniService.patientIds.push(patientId);
                }

                const activity = BahmniService.generateActivityFormData(item, "Assessment Plan", "assessmentPlan");
                BahmniService.activityList[patientId] = activity;
            }
        }
        else
        {
            BahmniService.syncDownStatus = response;
        }

        BahmniService.downloadAssessmentPlanList = true;
        BahmniService.afterDownloadSyncDownIdList(exeFunc);
    });
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


// ==============================================================================
// Supportive methods for SyncDown - Get data details list methods

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
                if( response.status == "error" ) {
                    BahmniService.syncDownStatus = response;
                }
                else
                {
                    const data = response.data;
                    const patientId = data.patient.uuid;
                    if( BahmniService.patientIds.indexOf( patientId) < 0 )
                    {
                        BahmniService.patientIds.push( patientId );
                    }
    
                    if( BahmniService.appointmentDataList[patientId] == undefined )
                    {
                        BahmniService.appointmentDataList[patientId] = [];
                    }
                    BahmniService.appointmentDataList[patientId].push(data);
    
                }
               
                if( BahmniService.appointmentIdxProcessing == BahmniService.appointmentListTotal )
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
    if( patientIds.length >= 0 )
    {
        BahmniService.patientListTotal = patientIds.length;
        BahmniService.patientIdxProcessing = 0;

        for( var i=0; i<patientIds.length; i++ )
        {
            BahmniService.retrievePatientDetails( patientIds[i], function(response) {
                BahmniService.patientIdxProcessing ++;
                BahmniService.syncDownData.push( BahmniService.generateClientData(response.data.patient) );

                if( BahmniService.patientIdxProcessing == BahmniService.patientListTotal )
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
    const url = BahmniService.composeURL( 'patient?id=' + patientId, '?action=patient&id=' + patientId );

    BahmniService.sendGetRequest(url, exeFunc);
};

BahmniService.retrieveAppointmentDetails = function( appointmentId, exeFunc )
{
    const url = BahmniService.composeURL( 'appointment?id=' + appointmentId, '?action=appointment&id=' + appointmentId );

    BahmniService.sendGetRequest(url, exeFunc);
};


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
    const refFromDataActivity = BahmniService.activityList[patientId];
    if( refFromDataActivity != undefined )
    {
        resolveData.activities.push(refFromDataActivity);  
    }

    // Set activities - "Scheduled" Appointment 
    const appointmentData = BahmniService.appointmentDataList[patientId];
    if( appointmentData )
    {
        for( var j=0; j<appointmentData.length; j++ )
        {
            const data = appointmentData[j];

            const activity = BahmniService.generateActivityAppointment(data, { formData: { sch_favId: 'followUp', fav_newAct: true } } );
            resolveData.activities.push(activity);  
        }
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

    var activity = { id: data.uuid, transactions:[{dataValues, type}], type: type, originalData: data, date: BahmniService.generateJsonDate(BahmniService.lastSyncedDatetime) };
    if ( options.formData ) activity.formData = options.formData;

    return activity;
};

BahmniService.generateActivityFormData = function( refDormData, type, formNameId )
{
    const patientId = refDormData.patientUuid;
    const checkedActivity = BahmniService.activityList[patientId]; // Try to get the latest one in case one person has many "Referals Template Form data"
    if( checkedActivity != undefined && checkedActivity.formVersion > refDormData.formVersion )
    {
        return checkedActivity;
    }

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

BahmniService.afterDownloadSyncDownIdList = function(exeFunc)
{
    if( BahmniService.downloadSyncUpList 
        && BahmniService.downloadReferralsTemplateList 
        && BahmniService.downloadAssessmentPlanList )
    {
        BahmniService.getAppointmentDataList( BahmniService.appointmentIds, function() {
            BahmniService.getPatientDataList(BahmniService.patientIds, function() {
                exeFunc({status: BahmniService.syncDownStatus, data: BahmniService.syncDownData});
            });
        })
       
    }
}



// ------------------------------------------------------------------------------
// Request API Util

BahmniService.sendGetRequest = function(url, exeFunc )
{
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json", 
        success: function (response) 
        {
            exeFunc(response);
        },
        error: function ( errMsg ) {
            console.log({ msg: errMsg, status: Constants.status_failed });
        }
    });
}

BahmniService.sendPostRequest = function(url, data, exeFunc )
{
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json", 
        data: JSON.stringify(data),
        success: function (response) 
        {
            exeFunc(response);
        },
        error: function ( errMsg ) {
            exeFunc({msg: errMsg, status: Constants.status_failed});
        }
    });
}


