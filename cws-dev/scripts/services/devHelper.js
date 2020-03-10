// =========================================
// -------------------------------------------------
//     DevHelper
//          - Methods to help debug for developer
//          - Can run on console.log and can be turned on /off for seeing scheduled task messages..
//
// -------------------------------------------------

function DevHelper() {};

DevHelper.cwsRenderObj;

DevHelper.sampleData = {
    "list": [{
        "title": "DW - Voucher: ----",
        "created": "2020-01-17T11:32:00.000",
        "owner": "DV_TEST_IPC",
        "activityType": "sp",
        "id": "5349521735217",
        "status": "downloaded",
        "queueStatus": "downloaded",
        "network": false,
        "networkAttempt": 0,
        "history": [],
        "syncActionStarted": 0,
        "data": {
            "payloadJson": {
                "searchValues": {
                    "_id": "5e397b9f24ed1b04adb81137"
                },
                "captureValues": {
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
                }
            }
        },
        "url": "",
        "actionJson": {}
    }, {
        "title": "DW - Voucher: ----",
        "created": "2020-02-01T11:32:00.000",
        "owner": "DV_TEST_IPC",
        "activityType": "sp",
        "id": "5349521735218",
        "status": "downloaded",
        "queueStatus": "downloaded",
        "network": false,
        "networkAttempt": 0,
        "history": [],
        "syncActionStarted": 0,
        "data": {
            "payloadJson": {
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
        },
        "url": "",
        "actionJson": {}
    }, {
        "title": "DW - Voucher: ----",
        "created": "2020-01-01T11:32:00.000",
        "owner": "DV_TEST_IPC",
        "activityType": "sp",
        "id": "1349521735217",
        "status": "downloaded",
        "queueStatus": "downloaded",
        "network": false,
        "networkAttempt": 0,
        "history": [],
        "syncActionStarted": 0,
        "data": {
            "payloadJson": {
                "searchValues": {
                    "_id": "5e49fddad5fe2704d1f21728"
                },
                "captureValues": {
                    "activityId": "1349521735217",
                    "activityDate": {
                        "createdOnMdbUTC": "2020-01-01T12:32:30.000",
                        "capturedUTC": "2020-01-01T12:32:00.000",
                        "createdOnDeviceUTC": "2020-01-01T12:32:30.000",
                        "capturedLoc": "2020-01-01T11:32:00.000"
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
                            "firstName": "Tran",
                            "lastName": "Chaaa",
                            "country": "LA",
                            "phoneNumberCurrent": "+1112223331",
                            "cuic": "FRTrChFSaMh199178",
                            "voucherCodeCurrent": "11145566",
                            "motherFirstName": "Saaa",
                            "gender": "F",
                            "motherLastName": "Mhh",
                            "birthDistrict": "Saig",
                            "birthDate": "1991-08-25"
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
                            "voucherCode": "11145566"
                        }
                    }],
                    "dc": {
                        "app": "pwa-connect",
                        "configVersion": "5",
                        "softwareVersion": "1.3.2"
                    }
                }
            }
        },
        "url": "",
        "actionJson": {}
    }, {
        "title": "DW - Voucher: ----",
        "created": "2020-01-15T11:32:00.000",
        "owner": "DV_TEST_IPC",
        "activityType": "sp",
        "id": "211111735218",
        "status": "downloaded",
        "queueStatus": "downloaded",
        "network": false,
        "networkAttempt": 0,
        "history": [],
        "syncActionStarted": 0,
        "data": {
            "payloadJson": {
                "searchValues": {
                    "_id": "5e49fddad5fe2704d1f21728"
                },
                "captureValues": {
                    "activityId": "211111735218",
                    "activityDate": {
                        "createdOnMdbUTC": "2020-01-15T12:32:30.000",
                        "capturedUTC": "2020-01-15T12:32:00.000",
                        "createdOnDeviceUTC": "2020-01-15T12:32:30.000",
                        "capturedLoc": "2020-01-15T11:32:00.000"
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
                            "voucherCode": "11145566"
                        }
                    }],
                    "dc": {
                        "app": "pwa-connect",
                        "configVersion": "5",
                        "softwareVersion": "1.3.2"
                    }
                }
            }
        },
        "url": "",
        "actionJson": {}
    }, {
        "title": "DW - Voucher: ----",
        "created": "2020-01-21T11:32:00.000",
        "owner": "DV_TEST_IPC",
        "activityType": "sp",
        "id": "6149521735217",
        "status": "downloaded",
        "queueStatus": "downloaded",
        "network": false,
        "networkAttempt": 0,
        "history": [],
        "syncActionStarted": 0,
        "data": {
            "payloadJson": {
                "searchValues": {
                    "_id": "5e49fe59d5fe2704d1f21729"
                },
                "captureValues": {
                    "activityId": "6149521735217",
                    "activityDate": {
                        "createdOnMdbUTC": "2020-01-21T12:32:30.000",
                        "capturedUTC": "2020-01-21T12:32:00.000",
                        "createdOnDeviceUTC": "2020-01-21T12:32:30.000",
                        "capturedLoc": "2020-01-21T11:32:00.000"
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
                            "firstName": "Jameee",
                            "lastName": "Chaa",
                            "country": "LA",
                            "phoneNumberCurrent": "+2234091234",
                            "cuic": "LAJaChFH0Km199078",
                            "voucherCodeCurrent": "22345678",
                            "motherFirstName": "Hou",
                            "gender": "M",
                            "motherLastName": "Kmm",
                            "birthDistrict": "Busan",
                            "birthDate": "1990-08-25"
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
                            "voucherCode": "22345678"
                        }
                    }],
                    "dc": {
                        "app": "pwa-connect",
                        "configVersion": "5",
                        "softwareVersion": "1.3.2"
                    }
                }
            }
        },
        "url": "",
        "actionJson": {}
    }, {
        "title": "DW - Voucher: ----",
        "created": "2020-02-01T11:32:00.000",
        "owner": "DV_TEST_IPC",
        "activityType": "sp",
        "id": "3149521735217",
        "status": "downloaded",
        "queueStatus": "downloaded",
        "network": false,
        "networkAttempt": 0,
        "history": [],
        "syncActionStarted": 0,
        "data": {
            "payloadJson": {
                "searchValues": {
                    "_id": "5e49fe83d5fe2704d1f2172a"
                },
                "captureValues": {
                    "activityId": "3149521735217",
                    "activityDate": {
                        "createdOnMdbUTC": "2020-02-01T12:32:30.000",
                        "capturedUTC": "2020-02-01T12:32:00.000",
                        "createdOnDeviceUTC": "2020-02-01T12:32:30.000",
                        "capturedLoc": "2020-02-01T11:32:00.000"
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
                            "firstName": "J1ameee",
                            "lastName": "C1haa",
                            "country": "LA",
                            "phoneNumberCurrent": "+3234091234",
                            "cuic": "LAJ1C1FH0Km199078",
                            "voucherCodeCurrent": "32345678",
                            "motherFirstName": "Hou",
                            "gender": "M",
                            "motherLastName": "Kmm",
                            "birthDistrict": "Busan",
                            "birthDate": "1990-08-25"
                        }
                    }, {
                        "transactionType": "v_iss",
                        "dataValues": {
                            "voucherCode": "32345678"
                        }
                    }],
                    "dc": {
                        "app": "pwa-connect",
                        "configVersion": "5",
                        "softwareVersion": "1.3.2"
                    }
                }
            }
        },
        "url": "",
        "actionJson": {}
    }, {
        "title": "DW - Voucher: ----",
        "created": "2020-01-17T11:32:00.000",
        "owner": "DV_TEST_IPC",
        "activityType": "sp",
        "id": "5349521735217",
        "status": "downloaded",
        "queueStatus": "downloaded",
        "network": false,
        "networkAttempt": 0,
        "history": [],
        "syncActionStarted": 0,
        "data": {
            "payloadJson": {
                "searchValues": {
                    "_id": "5e4e82643eef63e5d27642fd"
                },
                "captureValues": {
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
                }
            }
        },
        "url": "",
        "actionJson": {}
    }, {
        "title": "DW - Voucher: ----",
        "created": "2020-02-01T11:32:00.000",
        "owner": "DV_TEST_IPC",
        "activityType": "sp",
        "id": "5349521735218",
        "status": "downloaded",
        "queueStatus": "downloaded",
        "network": false,
        "networkAttempt": 0,
        "history": [],
        "syncActionStarted": 0,
        "data": {
            "payloadJson": {
                "searchValues": {
                    "_id": "5e4e82643eef63e5d27642fd"
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
        },
        "url": "",
        "actionJson": {}
    }]
};


// =======================================

DevHelper.setUp = function( cwsRenderObj )
{
    DevHelper.cwsRenderObj = cwsRenderObj;
};

// =======================================

DevHelper.showActivityListData = function()
{
    console.log( DevHelper.cwsRenderObj._activityListData.list );
};

DevHelper.showActivityListStr = function()
{
    console.log( JSON.stringify( DevHelper.cwsRenderObj._activityListData ) );
};

// create load data method..
DevHelper.loadSampleData = function() 
{    
    DevHelper.cwsRenderObj._activityListData.list = DevHelper.sampleData.list;

    // Save to IDB
    DataManager2.saveData_RedeemList( DevHelper.cwsRenderObj._activityListData, function () {
        console.log( 'DevHelper.loadSampleData Done and saved to IndexedDB' );
    });
};


DevHelper.showConfigSettings = function()
{
    console.log( FormUtil.dcdConfig.settings.redeemDefs );
}

// =======================================

// Not yet implemented
DevHelper.setDebugFlag = function() { };

// Not yet implemented
DevHelper.setScheduleMsgFlag = function() { };

