

function BahnmiService() { }

BahnmiService.lastSyncedDatetime = "2023-05-01T16:56:01.000+0530";
BahnmiService.dsdaUUID = "8fa28e5b-caaf-4337-a611-f143a645aba8";
BahnmiService.REFERALS_FORM_ID = "8eddd3da-f8a7-49b6-925f-7a54745ca168";

BahnmiService.SYNC_DOWN_DATA = {
    "lastSyncedDatetime": BahnmiService.lastSyncedDatetime,
    "dsdaUUID": BahnmiService.dsdaUUID,
    "relationshipTypeDescription": "DSDA to Client Assignment"
};

//BahnmiService.BASE_URL = "http://localhost:3210/"; // Overwritten by BahnmiService.composeURL

BahnmiService.syncDownData = [];
BahnmiService.patientIds = [];
BahnmiService.appointmentIds = [];
BahnmiService.appointmentDataList = {};
BahnmiService.activityList = {};

// -----------------------------

BahnmiService.getBaseURL = function()
{
    return ( WsCallManager.checkLocalDevCase( window.location.origin ) ) ? 'http://localhost:3120/' : WsCallManager.composeDwsWsFullUrl('/PWA.bahmniSrv' );
};

BahnmiService.composeURL = function( localCaseStr, dwsCaseStr )
{
    var fullUrl = BahnmiService.getBaseURL();
    
    if ( WsCallManager.checkLocalDevCase( window.location.origin ) ) fullUrl += localCaseStr;
    else fullUrl += dwsCaseStr; // ?action=', false
    
    return fullUrl;
};

// ==============================================================================
// SyncDown
// ==============================================================================

BahnmiService.syncDown = function(exeFunc)
{
    BahnmiService.syncDownData = [];
    BahnmiService.patientIds = [];
    BahnmiService.appointmentIds = [];
    BahnmiService.appointmentDataList = {};
    BahnmiService.activityList = {};

    BahnmiService.retrieveSyncDownData( function(responseData){

            BahnmiService.getRefTemplateFormDataList(function(refTemplateFormResponse) {
                BahnmiService.getAssessmentPlanDataList(function(assessmentPlanResponse) {
                    BahnmiService.getAssessmentPlanDataList(function(assessmentPlanResponse) {
                        BahnmiService.getAppointmentDataList( BahnmiService.appointmentIds, function() {
                            BahnmiService.getPatientDataList(BahnmiService.patientIds, function() {
                                exeFunc(BahnmiService.syncDownData);
                            })
                        })
                    })
                })
            })

          
        
        // }
    })
};


// SyncDown - Referral Template Forms data
BahnmiService.getRefTemplateFormDataList = function(exeFunc)
{
    const url = BahnmiService.composeURL( 'getReferalsDataList', '?action=getReferalsDataList' );

    BahnmiService.sendPostRequest(url, BahnmiService.SYNC_DOWN_DATA, function(refTemplateFormResponse){
        if( refTemplateFormResponse.status == "success" )
        {
            const refTemplateFormList = refTemplateFormResponse.data;
            for( let i=0; i<refTemplateFormList.length; i++ )
            {
                const item = refTemplateFormList[i];
                const patientId = item.patientUuid;
                if( BahnmiService.patientIds.indexOf(patientId) <0 )
                {
                    BahnmiService.patientIds.push(patientId);
                }

                const activity = BahnmiService.generateActivityFormData(item, "ref_a", "referralsForm");
                BahnmiService.activityList[patientId] = activity;
            }
        }

        exeFunc(refTemplateFormResponse);
    });
};

// SyncDown - Assessment Plan data
BahnmiService.getAssessmentPlanDataList = function(exeFunc)
{
    const url = BahnmiService.composeURL( "getAssessmentPlanDataList", '?action=getAssessmentPlanDataList' );

    BahnmiService.sendPostRequest(url, BahnmiService.SYNC_DOWN_DATA, function(response){
        if( response.status == "success" )
        {
            const refTemplateFormList = response.data;
            for( let i=0; i<refTemplateFormList.length; i++ )
            {
                const item = refTemplateFormList[i];
                const patientId = item.patientUuid;
                if( BahnmiService.patientIds.indexOf(patientId) <0 )
                {
                    BahnmiService.patientIds.push(patientId);
                }

                const activity = BahnmiService.generateActivityFormData(item, "ap_a", "assessmentPlan");
                BahnmiService.activityList[patientId] = activity;
            }
        }

        exeFunc(response);
    });
};




// ==============================================================================
// SyncUp 
// ==============================================================================

BahnmiService.syncUp = function(activityJson, exeFunc)
{
    // elseCase: "ref_fup_a" OR "ap_fup_a"
    var endpoint = ( activityJson.type == "fup_a" ) ? "fupAppointment": "addFormData";

    const url = BahnmiService.composeURL( endpoint, '?action=' + endpoint );

    BahnmiService.sendPostRequest(url, activityJson.syncUp, exeFunc );
}


// ==============================================================================
// Supportive methods for SyncDown - Get data details list methods

BahnmiService.getAppointmentDataList = function( appointmentIds, exeFunc )
{
    if( appointmentIds.length > 0 )
    {
        BahnmiService.appointmentListTotal = appointmentIds.length;
        BahnmiService.appointmentIdxProcessing = 0;

        for( var i=0; i<appointmentIds.length; i++ )
        {
            BahnmiService.retrieveAppointmentDetails( appointmentIds[i], function(response) {
                BahnmiService.appointmentIdxProcessing ++;
                const data = response.data;
                const patientId = data.patient.uuid;
                if( BahnmiService.patientIds.indexOf( patientId) < 0 )
                {
                    BahnmiService.patientIds.push( patientId );
                }

                if( BahnmiService.appointmentDataList[patientId] == undefined )
                {
                    BahnmiService.appointmentDataList[patientId] = [];
                }
                BahnmiService.appointmentDataList[patientId].push(data);

                if( BahnmiService.appointmentIdxProcessing == BahnmiService.appointmentListTotal )
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

BahnmiService.getPatientDataList = function( patientIds, exeFunc )
{
    if( patientIds.length >= 0 )
    {
        BahnmiService.patientListTotal = patientIds.length;
        BahnmiService.patientIdxProcessing = 0;

        for( var i=0; i<patientIds.length; i++ )
        {
            BahnmiService.retrievePatientDetails( patientIds[i], function(response) {
                BahnmiService.patientIdxProcessing ++;
                BahnmiService.syncDownData.push( BahnmiService.generateClientData(response.data.patient) );

                if( BahnmiService.patientIdxProcessing == BahnmiService.patientListTotal )
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
// Retrieve data from Bahnmi server

BahnmiService.retrieveSyncDownData = function( exeFunc )
{
    const url = BahnmiService.composeURL( "syncDown", '?action=syncDown' );
    
    var data = {
        "lastSyncedDatetime": "2023-05-01T16:56:01.000+0530",
        "dsdaUUID": BahnmiService.dsdaUUID,
        "relationshipTypeDescription": "DSDA to Client Assignment",
        
        "conceptUUIDs": [
            "37e8714b-d0ea-11ea-b8e2-6c2b59806788",
            "0af5a830-27b4-42cc-9ba8-3e8ebe83017b",
            "13d527bc-4643-4fb3-ae48-90ab33386e8d",
            "1ddf68a9-f5bc-401e-a97c-5e22d74a6d1b",
            "28be5152-8a49-4d44-8618-4f22bbdebe59",
            "32402436-febd-11ed-be56-0242ac120002",
            "37e8714b-d0ea-11ea-b8e2-6c2b59806788",
            "3a5ae01e-d035-4092-bbb5-3f8901e5a592",
            "3b9e3038-8425-4793-a6c6-f4aedf363ea7",
            "3e2fcd84-4329-40dc-8512-db2afbd104ec",
            "3f2d3fb6-fadb-11ed-be56-0242ac120002",
            "46dc2fc7-0040-4559-9352-5bbaaefaf3a9",
            "48777090-fadc-11ed-be56-0242ac120002",
            "487776f8-fadc-11ed-be56-0242ac120002",
            "48777842-fadc-11ed-be56-0242ac120002",
            "48777978-fadc-11ed-be56-0242ac120002",
            "48777d24-fadc-11ed-be56-0242ac120002",
            "48777e46-fadc-11ed-be56-0242ac120002",
            "4fdc5b5b-ff7a-4bdf-920f-92276ef6c07f",
            "59c8545c-8214-4db3-b392-e3a4af4034cc",
            "64fe9aa4-7161-4cf8-8609-de24937100f2",
            "65237869-febb-4738-887a-e6391041f193",
            "6b495154-f4b2-11ed-a05b-0242ac120003",
            "6b49541a-f4b2-11ed-a05b-0242ac120003",
            "6b495564-f4b2-11ed-a05b-0242ac120003",
            "6b4958b6-f4b2-11ed-a05b-0242ac120003",
            "70da8fed-7b41-45df-b6b9-a85dfe47162f",
            "74474881-d1b1-11ea-8b80-6c2b598065f0",
            "744756c4-d1b1-11ea-8b80-6c2b598065f0",
            "74476602-d1b1-11ea-8b80-6c2b598065f0",
            "7447740d-d1b1-11ea-8b80-6c2b598065f0",
            "744781ff-d1b1-11ea-8b80-6c2b598065f0",
            "74479085-d1b1-11ea-8b80-6c2b598065f0",
            "7f183aca-c617-4843-bfbc-c2697ab802b9",
            "84758f77-664c-4208-8f4d-c8362d555537",
            "8e207e0e-0ea1-4023-9d4c-5de6e12a7648",
            "8e702207-d241-4540-a986-79c216304744",
            "9fc47da4-febd-11ed-be56-0242ac120002",
            "a5945d04-6785-43c3-a9c0-92c18ad17dff",
            "b50c20f4-f878-11ed-b67e-0242ac120002",
            "b81154a0-f4b7-11ed-a05b-0242ac120003",
            "b81158ec-f4b7-11ed-a05b-0242ac120003",
            "c13326fb-f507-4327-81fd-2b56cdd7bee3",
            "d612c6f0-ee2e-4bd1-adb6-af88ac2f961e",
            "db8fea9c-fad2-11ed-be56-0242ac120002",
            "dcda17a3-1e3c-4f3c-9976-af98bed3b0b9",
            "e595ce36-491a-4463-a574-c6478fe83bfc",
            "ee5f815a-c908-4e33-bb67-0659991017d8",
            "fa076264-db78-498d-9d89-6ea4c6e942c5",
            "fdaff043-ae60-49f5-ad11-a4cce88b3e6f",
            "77d8ee60-6e96-4dd4-baff-7d8a3062617e",
            "c41a88ce-1924-4d7f-b7bf-5099afb2a404",
            "4944f8e7-3c06-43fd-90bc-d6412004aee2",
            "ad1c901f-2c1c-4aff-b663-904b0dfb0238",
            "5cab41f0-16ac-4489-a289-52e216a7865b",
            "49d79e4d-af1e-483f-8189-6489f7c9d5d4",
            "9c76e07b-c28e-42c1-98cd-ed55c5d814d9",
            "5e3321a1-1a1b-4046-9811-fda9d0fe371c",
            "36cd754f-73f4-4294-8062-3948409b9c38",
            "548a9f54-8aca-4a15-8bb7-46d7dc8a49db",
            "a766df2b-28d4-417d-bc8b-4306396d60cf",
            "4da67b35-4754-49ee-838a-b19fc52e956f",
            "7b86be42-4025-48c2-9ea1-4cb6d684dc30",
            "81b9baa1-ba6d-40ae-91f7-8a0bd2a28cd8",
            "4e24d8a8-12cd-4e27-9a84-93abee497c80"
        ]
    };

    BahnmiService.sendPostRequest(url, data, function(response) {
        if( response.status == "success" )
        {
            var dataList = response.data;
            
            for( let i=0; i<dataList.length; i++ )
            {
                let item = dataList[i];
                let resourceType = item.resource;
                if( resourceType == "patient" )
                {
                    BahnmiService.patientIds.push(item.uuid);
                }
                else if( resourceType == "appointment" )
                {
                    BahnmiService.appointmentIds.push(item.uuid);
                }
            }
        }

        exeFunc( response );
    } );
};

BahnmiService.retrievePatientDetails = function( patientId, exeFunc )
{
    const url = BahnmiService.composeURL( 'patient?id=' + patientId, '?action=patient&id=' + patientId );

    BahnmiService.sendGetRequest(url, exeFunc);
};

BahnmiService.retrieveAppointmentDetails = function( appointmentId, exeFunc )
{
    const url = BahnmiService.composeURL( 'appointment?id=' + appointmentId, '?action=appointment&id=' + appointmentId );

    BahnmiService.sendGetRequest(url, exeFunc);
};


// ------------------------------------------------------------------------------
// Convert data ( patient, appointment ) to WFA Object

BahnmiService.generateClientData = function( patientData )
{
    var resolveData =  {};

    // const  = patientData.patient;
    const patientId = patientData.uuid;
    resolveData = { _id: patientId, subSourceType: "bahnmi", clientDetails : patientData.person, activities: [], date: BahnmiService.generateJsonDate(BahnmiService.lastSyncedDatetime)};
    // resolveData = { _id: patientId, clientDetails : patientData.person, activities: []};
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
    const refFromDataActivity = BahnmiService.activityList[patientId];
    if( refFromDataActivity != undefined )
    {
        resolveData.activities.push(refFromDataActivity);  
    }

    // Set activities - "Scheduled" Appointment 
    const appointmentData = BahnmiService.appointmentDataList[patientId];
    if( appointmentData )
    {
        for( var j=0; j<appointmentData.length; j++ )
        {
            const data = appointmentData[j];
            // const type = data.status;

            // const activity = { id: data.uuid, transactions:[{dataValues: data.service, type: type}], type: type, originalData: data, date: BahnmiService.generateJsonDate(BahnmiService.lastSyncedDatetime) };
            const activity = BahnmiService.generateActivityAppointment(data, { formData: { sch_favId: 'followUp', fav_newAct: true } } );
            resolveData.activities.push(activity);  
        }
    }
    
    return resolveData;
};

BahnmiService.generateActivityAppointment = function( data, options )
{
    if ( !options ) options = {};

    const type = data.status;
    let dataValues = { ...data };
    dataValues.startDateTime = UtilDate.dateStr("DT", new Date(dataValues.startDateTime)); // Format the 'startDateTime'
    dataValues.endDateTime = UtilDate.dateStr("DT", new Date(dataValues.endDateTime)); //  Format the 'endDateTime'
    const serviceKeys = Object.keys(data.service);
    for( var i=0; i<serviceKeys.length; i++ )
    {
        const key = serviceKeys[i];
        dataValues["service_" + key] = data.service[key];
    }

    var activity = { id: data.uuid, transactions:[{dataValues, type}], type: type, originalData: data, date: BahnmiService.generateJsonDate(BahnmiService.lastSyncedDatetime) };
    if ( options.formData ) activity.formData = options.formData;

    return activity;
};

BahnmiService.generateActivityFormData = function( refDormData, type, formNameId )
{
    const patientId = refDormData.patientUuid;
    const checkedActivity = BahnmiService.activityList[patientId]; // Try to get the latest one in case one person has many "Referals Template Form data"
    if( checkedActivity != undefined && checkedActivity.formVersion > refDormData.formVersion )
    {
        return checkedActivity;
    }

    var dataValues =  {
        encounterUuid: refDormData.encounterUuid,
        formUuid: BahnmiService.REFERALS_FORM_ID,
        patientUuid: patientId,
        visitUuid: refDormData.visitUuid,
        formVersion: refDormData.formVersion
    };

    const activityId = patientId + "_" + (new Date).getMilliseconds();
    return { id: activityId, transactions:[{dataValues, type}], type: type, formData: { sch_favId: formNameId, fav_newAct: true }, originalData: refDormData, date: BahnmiService.generateJsonDate(BahnmiService.lastSyncedDatetime) };
};

BahnmiService.generateJsonDate = function( startDateTime ) {
    var dateObj = new Date( startDateTime );

    var month = BahnmiService.resolveNumber(dateObj.getMonth());
    var hours = BahnmiService.resolveNumber( dateObj.getHours() );
    var minutes = BahnmiService.resolveNumber(dateObj.getMinutes());
    var seconds = BahnmiService.resolveNumber(dateObj.getSeconds());

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

BahnmiService.resolveNumber = function(number)
{
    return ( number >= 10 ) ? ('' + number) : ('0' + number);
};

// BahnmiService.mergeJsonInManyLevelToOneLevel(jsonData, keyStr)
// {
//     // var keys = Object.keys(jsonData);
//     var result = {};
//     for( var key in jsonData )
//     {
//         var value = jsonData[key];
//         if(  typeof(value) == "object" )
//         {
//             var subValueList = BahnmiService.mergeJsonInManyLevelToOneLevel(value, key + "_");
//             result = {...result, ...subValueList};
//         }
//         else
//         {
//             result[keyStr + key] = value;
//         }
//     }
    
//     return result;
// }

// ------------------------------------------------------------------------------
// Request API Util

BahnmiService.sendGetRequest = function(url, exeFunc )
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

BahnmiService.sendPostRequest = function(url, data, exeFunc )
{
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json", 
        data: data,
        success: function (response) 
        {
            exeFunc(response);
        },
        error: function ( errMsg ) {
            exeFunc({msg: errMsg, status: Constants.status_failed});
        }
    });
}


