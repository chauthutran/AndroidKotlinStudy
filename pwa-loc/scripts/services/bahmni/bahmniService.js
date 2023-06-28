

function BahmniService() { }

BahmniService.CONCEPT_ID_LIST = [];

BahmniService.syncDownProcessingTotal = 0;
BahmniService.syncDownProcessingIdx = 0;
BahmniService.syncDownDataList = [];
BahmniService.syncDownStatus = {status: "success"};


// ==============================================================================
// SyncDown
// ==============================================================================

BahmniService.syncDown = function(exeFunc)
{
    INFO.bahmniResponseData = {};

    BahmniService.syncDownStatus = {status: "success"};
    BahmniService.syncDownDataList = {};
    
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

                BahmniRequestService.sendPostRequest(configSynDownData.id, url, configSynDownData.payload, function(response) {
                    BahmniService.afterSyncDown(response, exeFunc);
                })
            }
            else if( configSynDownData.method.toUpperCase() == "GET" )
            {
                BahmniRequestService.sendGetRequest(configSynDownData.id, url, function(response) {
                    BahmniService.afterSyncDown(response, exeFunc);
                });
            }
        }
    }
    
};

BahmniService.serResponseErrorIfAny = function(response)
{
    if( response.status == "error" )
    {
        BahmniService.syncDownStatus.status = Constants.status_failed;
        var msg = BahmniService.syncDownStatus.msg;
        if( msg == undefined )
        {
            msg = [];
        }
        msg.push(response.msg);
        BahmniService.syncDownStatus.msg = msg.join("; ");
    }
};

BahmniService.afterSyncDown = function(response, exeFunc)
{
    BahmniService.syncDownProcessingIdx++;
    BahmniService.serResponseErrorIfAny(response);
    
    if( BahmniService.syncDownProcessingIdx == BahmniService.syncDownProcessingTotal )
    {
        var conceptIds = [];
        var patientIds = [];
        var appointmentIds = [];
        var appointments = [];
        const configSynDownList = ConfigManager.getSettingsBahmni().syncDownList;
        for( var i=0; i<configSynDownList.length; i++ )
        {
            const configData = configSynDownList[i];
            const responseData = eval( Util.getEvalStr( configData.responseEval ) );
            if( responseData )
            {
                var data = responseData.data;
                if( data.conceptIds )
                {
                    conceptIds = conceptIds.concat( data.conceptIds ); 
                    conceptIds = conceptIds.filter((item, pos) => conceptIds.indexOf(item) === pos); // Remove duplicated Ids
                }

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
        }

        BahmniService.syncDownDataList = { conceptIds, patientIds, appointmentIds, appointments, patients: [], concepts: [] };

        BahmniService.syncDownProcessingIdx = 0;
        BahmniService.syncDownProcessingTotal = patientIds.length + appointmentIds.length + conceptIds.length;

        BahmniService.getConceptList( conceptIds, function(){
            exeFunc({status: BahmniService.syncDownStatus, data: BahmniService.syncDownDataList.patients});
        } );

        BahmniService.getAppointmentDataList( appointmentIds, function(){
            exeFunc({status: BahmniService.syncDownStatus, data: BahmniService.syncDownDataList.patients});
        } );

        BahmniService.getPatientDataList( patientIds, function(){
            exeFunc({status: BahmniService.syncDownStatus, data: BahmniService.syncDownDataList.patients});
        } );
    }
}

BahmniService.getAppointmentDataList = function( appointmentIds, exeFunc )
{
    if( appointmentIds.length > 0 )
    {
        for( var i=0; i<appointmentIds.length; i++ )
        {
            BahmniService.retrieveAppointmentDetails( appointmentIds[i], function(response) {
                
                if( response.status == "success")
                {
                    const data = response.data;
                    const patientId = data.patient.uuid;
                    // Add patientId in patientId list so that we can retrieve the details later
                    if( BahmniService.syncDownDataList.patientIds.indexOf( patientId) < 0 )
                    {
                        BahmniService.syncDownDataList.patientIds.push( patientId );
                    }

                    // Create an activity for this Appointment
                    var activity = BahmniUtil.generateActivityAppointment(data,  { formData: { sch_favId: 'followUp', fav_newAct: true } } )
                    BahmniService.syncDownDataList.appointments.push(activity);
                }

                BahmniService.afterSyncDownAll(response, exeFunc);
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
        for( var i=0; i<patientIds.length; i++ )
        {
            BahmniService.retrievePatientDetails( patientIds[i], function(response) {
                if( response.status == "success")
                {
                    BahmniService.syncDownDataList.patients.push( BahmniUtil.generateClientData(response.data.patient) );
                }
                
                BahmniService.afterSyncDownAll(response, exeFunc);
            })
        }
    }
    else
    {
        exeFunc();
    }
};

BahmniService.getConceptList = function( conceptIdList, exeFunc)
{
    if( conceptIdList.length > 0 )
    {
        for( var i=0; i<conceptIdList.length; i++ )
        {
            var id = conceptIdList[i];
            var url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/concept/" + id;
            BahmniRequestService.sendGetRequest(id, url, function(response) {
                if( response.status == "success" )
                {
                    BahmniService.syncDownDataList.concepts.push( response.data );
                }

                BahmniService.afterSyncDownAll(response, exeFunc);
            });
        }
    }
    else
    {
        BahmniService.updateOptionsChanges();
        exeFunc();
    }
   
}

BahmniService.afterSyncDownAll = function(response, exeFunc)
{
    BahmniService.syncDownProcessingIdx ++;
    BahmniService.serResponseErrorIfAny(response);

    if( BahmniService.syncDownProcessingIdx == BahmniService.syncDownProcessingTotal )
    {
        // Add all activities for patients based on patienId
        const patientList = BahmniService.syncDownDataList.patients;
        for( var i=0; i<patientList.length; i++ )
        {
            var item = patientList[i];
            var patientId = item.patientId;
            var activities = Util.findAllFromList (BahmniService.syncDownDataList.appointments, patientId, "patientId");
            if( activities != undefined )
            {
                item.activities = activities;
            }
        }

        // Set conceps AppInfo localStorage
        var concepts = BahmniService.syncDownDataList.concepts;
        for( var i=0; i<concepts.length; i++ )
        {
            var concept = concepts[i];
            if( concept && concept.answers && concept.answers.length > 0 )
            {
                AppInfoLSManager.setSelectOptions_Item( concept.uuid, BahmniUtil.generateOptionsByConcept(concept) );
            }
        }

        // Override the options of concepts in "definitionOptions" of the configuration file 
        BahmniService.updateOptionsChanges();

        exeFunc();
    }
};

BahmniService.updateOptionsChanges = function()
{
    const newOptionsChanged = AppInfoLSManager.getSelectOptions();
    let configOptions = ConfigManager.getConfigJson().definitionOptions;
    for( var optionName in newOptionsChanged )
    {
        configOptions[optionName] = newOptionsChanged[optionName];
    }

    AppInfoLSManager.setBahmni_lastSyncedDatetime( UtilDate.getDateTimeStr() );
}


// ------------------------------------------------------------------------------
// Retrieve data from Bahmni server

BahmniService.retrievePatientDetails = function( patientId, exeFunc )
{
    const url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/patientprofile/" + patientId + "?v=full";
    BahmniRequestService.sendGetRequest(patientId, url, exeFunc);
};

BahmniService.retrieveAppointmentDetails = function( appointmentId, exeFunc )
{
    const url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/appointment?uuid=" + appointmentId;
    BahmniRequestService.sendGetRequest(appointmentId, url, exeFunc);
};

// ==============================================================================
// SyncUp 
// ==============================================================================

BahmniService.syncUp = function(activityJson, exeFunc)
{
    // elseCase: "Follow Up Referrals Template Form" OR "Follow Up Assessment Plan"
    var endpoint = ( activityJson.type == "Follow Up Appointment" ) ? "/openmrs/ws/rest/v1/appointment": "/openmrs/ws/rest/v1/bahmnicore/bahmniencounter";
    
    const url = INFO.bahmni_domain + endpoint;
    BahmniRequestService.sendPostRequest(activityJson.id, url, activityJson.syncUp, exeFunc );
}


