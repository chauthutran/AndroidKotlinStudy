function BahnmiRequestUtil() {};

const BAHNMI_SERVER_BASE_URL = "https://bahmni-stage.psi-mis.org/openmrs/ws/rest/v1/";


// =====================================================================================================
// Get the list of the exeFunc({status: "error", data: error});, appointments, concepts which we need to sync down
BahnmiRequestUtil.syncDown = function(data, exeFunc)
{
    const url = BAHNMI_SERVER_BASE_URL + "wfa/integration/get/syncable?resource=appointment";
    BahnmiRequestUtil.sendPostRequest(url, data, function (response) {
        exeFunc(response);
    });
}

// GET an Appointment details by uuid
BahnmiRequestUtil.retrieveAppointment = function(id, exeFunc)
{
    const url = BAHNMI_SERVER_BASE_URL + "appointment?uuid=" + id;
    BahnmiRequestUtil.sendGetRequest(url, function (response) {
        exeFunc(response);
    });
}

// GET a Patient details by uuid
BahnmiRequestUtil.retrievePatient = function(id, exeFunc)
{
    const url = BAHNMI_SERVER_BASE_URL + "patientprofile/" + id + "?v=full";
    BahnmiRequestUtil.sendPostRequest(url, id, function (response) {
        exeFunc(response);
    });
}

// GET - "Referrals Template Form Data" list
BahnmiRequestUtil.retrieveReferralsFormDataList = function(data, exeFunc)
{
    const url = BAHNMI_SERVER_BASE_URL + "wfa/integration/get/formData?formName=Referrals Template&concept=Referrals Form, Expected visit date&concept=Referrals Form, External Referral&concept=Referrals Form, Date reported by client&concept=Referrals Form, New date&concept=Referrals Form, Client Reported Outcome";
    BahnmiRequestUtil.sendPostRequest(url, data, function (response) {
        exeFunc(response);
    });
}

// GET "Assessment Plan Data" list
BahnmiRequestUtil.retrieveAssessmentPlanDataList = function(data, exeFunc)
{
    const url = BAHNMI_SERVER_BASE_URL + "wfa/integration/get/formData?formName=Assessment and Plan&concept=AP, Next date of medication resupply&concept=AP, Field Report, No of Pill remaining&concept=AP, Field Report, No of Months supply delivered to the client&concept=AP, Field Report, No of HIVST Distribution&concept=AP, Field Report, Reschedule missed delivery in days&concept=AP, Field Report, Reasons for missed delivery&concept=AP, Field Report, Name of 3rd person receiving the delivery&concept=AP, Field Report, Phone number of 3rd person receiving the delivery&concept=AP, Field Report, Location of 3rd person delivery&concept=AP, Field Report, Remarks";
    BahnmiRequestUtil.sendPostRequest(url, data, function (response) {
        exeFunc(response);
    });
}

// =====================================================================================================
// Sync Up

// Update "Appointment Follow-Up"
BahnmiRequestUtil.addFupAppointment = function(data, exeFunc)
{
    const url = BAHNMI_SERVER_BASE_URL + "appointment";
    BahnmiRequestUtil.sendPostRequest(url, data, function (response) {
        exeFunc(response);
    });
}

// Add "Referrals Template Form Data" and "Assessment Plan" form
BahnmiRequestUtil.addFormData = function(data, exeFunc)
{
    const url = BAHNMI_SERVER_BASE_URL + "bahmnicore/bahmniencounter";
    requestUtils.sendPostRequest(url, data, function (response) {
        exeFunc(response);
    });
}



// =================================================================================================================
// 

BahnmiRequestUtil.sendGetRequest = function( url, exeFunc ) {
    console.log(url);
    fetch(url, {
        method:'GET', 
        headers: {'Authorization': 'Basic ' + btoa('superman:Nuchange123')}})
        .then(response => response.json())
        .then((result) => {
            exeFunc({status: "success", data: result});
        }).catch((error) => {
            exeFunc({status: "error", data: error});
        });

    // $.ajax({
    //     url: url,
    //     type: "GET",
    //     headers: {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json;charset=UTF-8', 'Authorization': 'Basic ' + btoa('superman:Nuchange123')},
    //     dataType: "json", 
    //     crossDomain: true,
    //     success: function (response) 
    //     {
    //         exeFunc({status: "success", data: response});
    //     },
    //     error: function ( errMsg ) {
    //         exeFunc({status: "error", data: errMsg});
    //     }
    // });

};


BahnmiRequestUtil.sendPostRequest = function( url, data, exeFunc ) {
    console.log(url);

    console.log(url);
        
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': 'Basic ' + btoa('superman:Nuchange123') },
        body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((result) => {
        if( result.error )
        {
            exeFunc({status: "error", data: result.error.message});
        }
        else {
            exeFunc({status: "success", data: result});
        }
    }).catch((error) => {
        exeFunc({status: "error", data: error});
    });

    // $.ajax({
    //     type : "POST",
    //     headers: {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json;charset=UTF-8', 'Authorization': 'Basic ' + btoa('superman:Nuchange123')},
            
    //     url : url,
    //     data : JSON.stringify(data),
    //     contentType: "application/json",
    //     dataType : "json",
    //     withCredentials: true,
    //     success : function(response) {
    //         if( response.error )
    //         {
    //             exeFunc({status: "error", data: response.error.message});
    //         }
    //         else {
    //             exeFunc({status: "success", data: response});
    //         }
    //     },
    //     error : function(errMsg) {
    //         exeFunc({status: "error", data: errMsg});
    //     }
    // });
    


    // fetch(url, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json", 'Authorization': 'Basic ' + btoa('superman:Nuchange123') },
    //     body: JSON.stringify(data)
    // })
    // .then((response) => response.json())
    // .then((result) => {
    //     if( result.error )
    //     {
    //         exeFunc({status: "error", data: result.error.message});
    //     }
    //     else {
    //         exeFunc({status: "success", data: result});
    //     }
    // }).catch((error) => {
    //     exeFunc({status: "error", data: error});
    // });
};