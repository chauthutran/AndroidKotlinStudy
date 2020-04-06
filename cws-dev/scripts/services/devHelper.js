// =========================================
// -------------------------------------------------
//     DevHelper
//          - Methods to help debug for developer
//          - Can run on console.log and can be turned on /off for seeing scheduled task messages..
//
// -------------------------------------------------

function DevHelper() {};

DevHelper.cwsRenderObj;

DevHelper.sampleDataList = [{
    "clientDetails": {
        "firstName": "James",
        "lastName": "Chang",
        "phoneNumber": "6543222212",
        "clientId": "",
        "age": "14"
    },
    "activities": [{
        "activityId": "LA_TEST_PROV_20200406_093050000",
        "activityDate": {
            "createdOnMdbUTC": "2020-04-06T09:31:02.488",
            "capturedUTC": "2020-04-06T09:30:50.000",
            "createdOnDeviceUTC": "2020-04-06T09:30:50.000",
            "capturedLoc": "2020-04-06T18:30:50.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "FPL-SP",
        "transactions": [{
            "transactionType": "c_reg",
            "dataValues": {
                "firstName": "James",
                "lastName": "Chang",
                "phoneNumber": "6543222212",
                "clientId": "",
                "age": "14"
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "12345555"
            }
        }],
        "dc": {}
    }],
    "_id": "5e8af6d6f39ff8047ee4f3e5",
    "updated": "2020-04-06T09:31:02.488"
}, {
    "_id": "CommonPayloadClient",
    "clientDetails": {},
    "activities": [{
        "activityId": "LA_TEST_PROV_20200406_093536000",
        "activityDate": {
            "capturedUTC": "2020-04-06T09:35:36.000",
            "createdOnDeviceUTC": "2020-04-06T09:35:36.000",
            "capturedLoc": "2020-04-06T18:35:36.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "FPL-SP",
        "transactions": [{
            "transactionType": "c_reg",
            "dataValues": {
                "firstName": "James",
                "lastName": "Chang",
                "age": "44",
                "phoneNumber": "8888555511",
                "clientId": ""
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "999933333"
            }
        }],
        "dc": {},
        "processing": {
            "status": "queued",
            "history": [],
            "url": "https://api-dev.psi-connect.org/PWA.syncUp",
            "searchValues": {
                "clientDetails.phoneNumber": "8888555511"
            }
        }
    }]
}, {
    "clientDetails": {
        "firstName": "James",
        "lastName": "Chang",
        "phoneNumber": "4444555511",
        "clientId": "",
        "age": "32"
    },
    "activities": [{
        "activityId": "LA_TEST_PROV_20200403_081636000",
        "activityDate": {
            "createdOnMdbUTC": "2020-04-03T08:17:06.877",
            "capturedUTC": "2020-04-03T08:16:36.000",
            "createdOnDeviceUTC": "2020-04-03T08:16:36.000",
            "capturedLoc": "2020-04-03T17:16:36.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "FPL-SP",
        "transactions": [{
            "transactionType": "c_reg",
            "dataValues": {
                "firstName": "James",
                "lastName": "Chang",
                "phoneNumber": "4444555511",
                "clientId": "",
                "age": "32"
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "33334444"
            }
        }],
        "dc": {}
    }, {
        "activityId": "LA_TEST_PROV_20200403_081820000",
        "activityDate": {
            "createdOnMdbUTC": "2020-04-03T08:18:22.169",
            "capturedUTC": "2020-04-03T08:18:20.000",
            "createdOnDeviceUTC": "2020-04-03T08:18:20.000",
            "capturedLoc": "2020-04-03T17:18:20.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "FPL-SP",
        "transactions": [{
            "transactionType": "c_reg",
            "dataValues": {
                "firstName": "James",
                "lastName": "Chang",
                "phoneNumber": "4444555511",
                "clientId": "",
                "age": "32"
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "44445555"
            }
        }],
        "dc": {}
    }],
    "_id": "5e86f102f39ff8047ee4f2b6",
    "updated": "2020-04-03T08:18:22.169"
}];

/*
[
{
    "_id": "5e397b9f24ed1b04adb81137",
    "updated": "2020-01-17T12:32:30.000",

    "clientDetails": {
        "firstName": "james",
        "lastname": "chang"
    },

    "activities": [
    {
        "activityId": "5349521735217",
        "activityDate": {
            "createdOnMdbUTC": "2020-01-17T12:32:30.000",
            "capturedUTC": "2020-01-17T12:32:00.000",
            "createdOnDeviceUTC": "2020-01-17T12:32:30.000",
            "capturedLoc": "2020-01-17T11:32:00.000"
        },
        "activeUser": "qwertyuio1",
        "creditedUsers": ["qwertyuio1"],
        "location": {
            "accuracy": 100,
            "location": {
                "coordinates": [-0.9969609975814819, 33.9327278137207],
                "type:": "Point"
            }
        },
        "program": "fpl",
        "activityType": "sp",
        "ws": {
            "app": "dws",
            "configVersion": "2",
            "softwareVersion": "1.1.0"
        },
        "transactions": [{
            "transactionType": "c_reg",
            "dataValues": {
                "lastName": "Raimbault",
                "country": "DV",
                "phoneNumberCurrent": "+1234091234",
                "cuic": "FRBrRaFSaSm198878",
                "voucherCodeCurrent": "12345678",
                "gender": "F",
                "birthDistrict": "Yvelines (78)",
                "phoneNumberHistory": ["+1234091234"],
                "birthDate": "1988-08-25",
                "firstName": "Bruna",
                "motherFirstName": "Sara",
                "voucherCodeHistory": ["12345678"],
                "motherLastName": "Smith"
            }
        }, {
            "transactionType": "s_ifo",
            "dataValues": {
                "serviceDesired": "IUD",
                "sessionType": "group"
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "12345678"
            }
        }],
        "dc": {
            "app": "pwa-connect",
            "configVersion": "5",
            "softwareVersion": "1.3.2"
        }
    },
    {
        "processing": {
            "created": "2020-01-17T11:32:00.000",
            "status": "queued",
            "url": "",
            "history": []
        },
        "payload": {
            "searchValues": {
                "_id": "5e397b9f24ed1b04adb81137"
            },
            "captureValues": {
                "activityId": "5349521735218",
                "activityDate": {
                    "createdOnMdbUTC": "2020-02-01T12:32:30.000",
                    "capturedUTC": "2020-02-01T12:32:00.000",
                    "createdOnDeviceUTC": "2020-02-01T12:32:30.000",
                    "capturedLoc": "2020-02-01T11:32:00.000"
                },
                "activeUser": "qwertyuio2-pro",
                "creditedUsers": ["qwertyuio2-pro", "qwertyuio1-ipc"],
                "location": {
                    "accuracy": 100,
                    "location": {
                        "coordinates": [-0.9969609975814818, 33.9327278137207],
                        "type:": "Point"
                    }
                },
                "program": "fpl",
                "activityType": "sp",
                "ws": {
                    "app": "dws",
                    "configVersion": "2",
                    "softwareVersion": "1.1.0"
                },
                "transactions": [{
                    "transactionType": "s_pro",
                    "dataValues": {
                        "serviceProvided": "IUD"
                    }
                }, {
                    "transactionType": "v_rdx",
                    "dataValues": {
                        "voucherCode": "12345678"
                    }
                }],
                "dc": {
                    "app": "pwa-connect",
                    "configVersion": "5",
                    "softwareVersion": "1.3.2"
                }
            }
        }
    }]
}];
*/

// =======================================

DevHelper.setUp = function( cwsRenderObj )
{
    DevHelper.cwsRenderObj = cwsRenderObj;
};

// =======================================

DevHelper.showClientListData = function()
{
    console.log( ClientDataManager.getClientList() );
};

DevHelper.showClientListStr = function()
{
    console.log( JSON.stringify( { 'list': ClientDataManager.getClientList() } ) );
};


DevHelper.showActivityListData = function()
{
    console.log( ActivityDataManager.getActivityList() );
};

DevHelper.showActivityListStr = function()
{
    console.log( JSON.stringify( { 'list': ActivityDataManager.getActivityList() } ) );
};

// create load data method..
DevHelper.loadSampleData = function() 
{    
    ClientDataManager.insertClients( DevHelper.sampleDataList );

    console.log( 'DevHelper.loadSampleData Done and saved to IndexedDB' );

    ClientDataManager.saveCurrent_ClientsStore( function() {
        console.log( 'Saved current client data to clientStore IDX' );
    });
};


DevHelper.showActivityCardConfigs = function()
{
    console.log( FormUtil.dcdConfig.settings.redeemDefs );
}

// =======================================

// Not yet implemented
DevHelper.setDebugFlag = function() { };

// Not yet implemented
DevHelper.setScheduleMsgFlag = function() { };


// ======================================
// === TESTING ONES BELOW ================

//DevHelper.TestRequestSend( 'https://client-dev.psi-connect.org/routeWsTest' );
//DevHelper.TestRequestSend( 'https://api-dev.psi-connect.org/PWA.locator?1?n=50&iso2=SV&c=13.6929,-89.2182&d=5000000%27' );

DevHelper.TestRequestSend = function( url )
{
    try
    {
        var payloadJson = {
            "activity": { 
                "activeUser": "james"
            }
        };

        var loadingTag = undefined;

        FormUtil.wsSubmitGeneral( url, payloadJson, loadingTag, function( success, mongoClientsJson ) {

            console.log( success, mongoClientsJson );
        });
    }
    catch( errMsg )
    {
        console.log( 'Error in DevHelper.TestRequestSend - ' + errMsg );
    }
};

