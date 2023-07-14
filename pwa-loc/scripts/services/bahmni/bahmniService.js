

function BahmniService() { }



BahmniService.timerID_Interval;
BahmniService.noCheckingConnection = 0;
BahmniService.maxNoCheckingConnection = 5;
BahmniService.interval_syncData = Util.MS_SEC * 2; // 5s
BahmniService.syncDataProcessing = false;

BahmniService.syncDataIconTag = $("#divAppDataSubResourceSyncStatus");
BahmniService.syncImgTag = $("#imgAppDataSubResourceSyncStatus");
BahmniService.syncOne = false;


BahmniService.formMetadata = {};
BahmniService.syncDownProcessingTotal = 0;
BahmniService.syncDownProcessingIdx = 0;
BahmniService.syncDownDataList = {};
BahmniService.syncDownStatus = {status: "success"};


BahmniService.syncUpProcessingTotal = 0;
BahmniService.syncUpProcessingIdx = 0;


// ==============================================================================
// Ping Bahmni service
// ==============================================================================

BahmniService.checkConnection = function()
{
    if( ConfigManager.isBahmniSubSourceType() )
    {
        BahmniService.syncDataIconTag.show();
        BahmniService.connection_StatusPending();

        clearInterval(BahmniService.timerID_Interval);
        BahmniRequestService.resetResponseData();

        
        BahmniService.timerID_Interval = setInterval(() => {
            // BahmniService.syncDataProcessing = true;
    
            // const url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/wfa/integration/get/syncable";
            // BahmniRequestService.sendPostRequest("syncDataRun", url, {},function(response){
            //     if( response.status == "success" )
            //     {
            //         BahmniService.noCheckingConnection ++;
            //         if( BahmniService.noCheckingConnection >= BahmniService.maxNoCheckingConnection )
            //         {
            //             BahmniService.connection_StatusOnline();
            //             if( !BahmniService.syncOne )
            //             {
            //                 BahmniService.syncDataRun();
            //             }
            //         }
            //     }
            //     else
            //     {
            //         BahmniService.connection_StatusOffline();
            //         BahmniService.noCheckingConnection = 0;
            //     }
            // });

            BahmniRequestService.ping(undefined, function(response){
                if( response.status == "success" )
                {
                    BahmniService.noCheckingConnection ++;
                    if( BahmniService.noCheckingConnection >= BahmniService.maxNoCheckingConnection )
                    {
                        BahmniService.connection_StatusOnline();
                        if( !BahmniService.syncOne )
                        {
                            BahmniService.syncDataRun();
                        }
                    }
                }
                else
                {
                    BahmniService.connection_StatusOffline();
                    BahmniService.noCheckingConnection = 0;
                }
            });

        }, BahmniService.interval_syncData );
    }
}

BahmniService.connection_StatusOnline = function()
{
    BahmniService.syncImgTag.attr("src", "images/sync_24.png");
    BahmniMsgManager.SyncMsg_InsertMsg("The connection is available");
}

BahmniService.connection_StatusOffline = function()
{
    BahmniService.syncDataIconTag.attr("src", "images/sync-error_24.png");
    BahmniMsgManager.SyncMsg_InsertMsg("The connection is not available");
}

BahmniService.connection_StatusPending = function()
{
    BahmniService.syncDataIconTag.attr("src", "images/sync_pending_msd-la.png");
    FormUtil.rotateTag(BahmniService.syncDataIconTag, true);
}

BahmniService.update_UI_Status_StartSync = function()
{
    BahmniMsgManager.initializeProgressBar();
    FormUtil.rotateTag(BahmniService.syncDataIconTag, true);
}

BahmniService.update_UI_Status_FinishSyncAll = function()
{
    // sync_error_msd.svg
    BahmniMsgManager.hideProgressBar();
    FormUtil.rotateTag(BahmniService.syncDataIconTag, false);
    BahmniMsgManager.SyncMsg_ShowBottomMsg();
}


BahmniService.setAppTopSyncAllBtnClick = function () {

    // if( ConfigManager.isBahmniSubSourceType() )
    // {
        BahmniService.syncDataIconTag.off('click').click(() => {
            // if already running, just show message..
            // if offline, also, no message in this case about offline...   
            BahmniMsgManager.SyncMsg_ShowBottomMsg();           
            
            // 2. SyncUp All
            if( BahmniService.noCheckingConnection >= BahmniService.maxNoCheckingConnection )
            {
                BahmniService.syncDataRun();
            }
        });
    // }
   
};

// ==============================================================================
// Ping Bahmni service
// ==============================================================================

BahmniService.syncDataRun = function()
{

    if( BahmniService.noCheckingConnection >= BahmniService.maxNoCheckingConnection 
        && !ScheduleManager.syncDownProcessing 
        && !BahmniService.syncDataProcessing )
    {
        BahmniService.syncDataProcessing = true;
        BahmniService.update_UI_Status_StartSync();
        BahmniMsgManager.SyncMsg_InsertMsg('Start Syncing to Bahmni server ...');

        try{
            // Sync Up activity to Bahmni server
            BahmniService.syncUpAll(function(){
                // Sync Down activity to Bahmni server
                BahmniService.syncDown(function(responseBahmniData)
                {
                    var downloadedData = {clients: responseBahmniData.data};
                    var clientDwnLength = downloadedData.clients.length;
                    downloadedData = ConfigManager.downloadedData_UidMapping(downloadedData);

                    // 'download' processing data                
                    var processingInfo = ActivityDataManager.createProcessingInfo_Success(Constants.status_downloaded, 'Downloaded and synced.');

                    BahmniMsgManager.SyncMsg_InsertMsg("Downloaded " + clientDwnLength + " clients");

                    ClientDataManager.setActivityDateLocal_clientList(downloadedData.clients);

                    // 10 min offset with sync time - to make sure it does not miss things.
                    //var syncDownReqStartDTStr = moment().subtract(10, 'minutes').toDate().toISOString();

                    ClientDataManager.mergeDownloadedClients(downloadedData, processingInfo, function (changeOccurred_atMerge, mergedActivities) {
                       

                        if (responseBahmniData.status.status == "success") 
                        {
                            var mergedActivityLength = mergedActivities.length;
                            BahmniMsgManager.SyncMsg_InsertMsg("Merged " + mergedActivityLength + " activities..");
                            BahmniMsgManager.SyncMsg_InsertSummaryMsg("downloaded " + clientDwnLength + " clients, merged " + mergedActivityLength + " activities.");

                            var syncDownReqStartDTStr = moment().subtract(10, 'minutes').toDate().toISOString();
                            AppInfoManager.updateSyncLastDownloadInfo( syncDownReqStartDTStr );

                            
                            // NOTE: If there was a new merge, for now, alert the user to reload the list?
                            if (changeOccurred_atMerge) {
                                // Display the summary of 'syncDown'.  However, this could be a bit confusing
                                //SyncManagerNew.SyncMsg_ShowBottomMsg();
    
                                var btnRefresh = $('<a class="notifBtn" term=""> REFRESH </a>');
    
                                $(btnRefresh).click(() => {
                                    SessionManager.cwsRenderObj.renderArea1st();
                                });
    
                                MsgManager.notificationMessage('SyncDown data found', 'notifBlue', btnRefresh, '', 'right', 'top', 10000, false);
                            }
                        }
                        else
                        {
                            BahmniMsgManager.SyncMsg_InsertSummaryMsg("ERROR:" + responseBahmniData.status.msg);
                        }

                        
                        BahmniService.syncDataProcessing = false;
                        BahmniService.syncOne = true;
                        BahmniService.update_UI_Status_FinishSyncAll();
                    });
                });	
            })

            
        }
        catch( errMsg ) { 

            BahmniMsgManager.SyncMsg_ShowBottomMsg();
            BahmniMsgManager.SyncMsg_InsertMsg("Sync data failed.");

            console.log( 'BahmniService.syncDataRun, ' + errMsg );

            BahmniService.syncDataProcessing = false;
            BahmniService.syncOne = true;
            BahmniService.update_UI_Status_FinishSyncAll();
        }
    }
}

BahmniService.isSyncDataProcessing = function()
{
   return BahmniService.syncDataProcessing;
};


// ==============================================================================
// SyncDown
// ==============================================================================

BahmniService.syncDown = function(exeFunc)
{
    BahmniService.syncDownStatus = {status: "success"};
    BahmniService.syncDownDataList = {};
    
    const configSynDownList = ConfigManager.getSettingsBahmni().syncDownList;
    if( configSynDownList )
    {
        BahmniService.syncDownProcessingTotal = configSynDownList.length;
        BahmniService.syncDownProcessingIdx = 0;
        
        for( var i=0; i<configSynDownList.length; i++ )
        {
            var configSynDownData = JSON.parse(JSON.stringify(configSynDownList[i]));
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
                    appointments = appointments.concat(data.appointments);
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
            BahmniService.retrieveConceptDetails(id, function(response) {
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
        // -------------------------------------------------------------------------------------------------------------
        // Set conceps in AppInfo localStorage
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

        // -------------------------------------------------------------------------------------------------------------
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

BahmniService.retrieveConceptDetails = function( conceptId, exeFunc )
{
    var url = INFO.bahmni_domain + "/openmrs/ws/rest/v1/concept/" + conceptId;
    BahmniRequestService.sendGetRequest(conceptId, url, exeFunc);
};


// ==============================================================================
// SyncUp 
// ==============================================================================


BahmniService.syncUpAll = function(exeFunc)
{
    var clients = ClientDataManager.getClientList();
    var activityList = [];
    for( var i=0; i<clients.length; i++ )
    {
        var clientJson = clients[i];
        if( clientJson.subSourceType == "bahmni" )
        {
            var activities = clientJson.activities;
            for( var j=0; j<activities.length; j++ )
            {
                var activityJson = activities[j];
                if( activityJson.processing.status == Constants.status_queued)
                {
                    activityList.push( activityList );
                }
            }
        }
    }

    if( activityList.length > 0 )
    {
        BahmniService.syncUpProcessingIdx = 0;
        BahmniService.syncUpProcessingTotal = activityList.length;
        for( var i=0; i<activityList.length; i++ )
        {
            BahmniService.syncUp(activityList[i], function(response){
                if( BahmniService.syncUpProcessingIdx == BahmniService.syncUpProcessingTotal )
                {
                    exeFunc();
                }
            });
        }
    }
    else
    {
        exeFunc();
    }
}

BahmniService.syncUp = function(activityJson, exeFunc)
{
    // elseCase: "Follow Up Referrals Template Form" OR "Follow Up Assessment Plan"
    var endpoint = ( activityJson.type == "Follow Up Appointment" ) ? "/openmrs/ws/rest/v1/appointment": "/openmrs/ws/rest/v1/bahmnicore/bahmniencounter";
    
    const url = INFO.bahmni_domain + endpoint;
    BahmniRequestService.sendPostRequest(activityJson.id, url, activityJson.syncUp, exeFunc );
}


