// =========================================
// -------------------------------------------------
//     DevHelper
//          - Methods to help debug for developer
//          - Can run on console.log and can be turned on /off for seeing scheduled task messages..
//
// -------------------------------------------------

function DevHelper() {};

DevHelper.cwsRenderObj;
DevHelper.INFO;

DevHelper.sampleDataList = [{
    "clientDetails": {
        "firstName": "James",
        "lastName": "Chang",
        "phoneNumber": "6543222212",
        "clientId": "",
        "age": "14"
    },
    "activities": [{
        "activityId": "LA_TEST_PROV_20200406_093052500",
        "activityDate": {
            "createdOnMdbUTC": "2020-04-06T09:31:02.488",
            "capturedUTC": "2020-04-06T09:30:50.000",
            "createdOnDeviceUTC": "2020-04-06T09:30:50.000",
            "capturedLoc": "2020-04-06T18:30:50.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "eVoucher",
        "processing": {
            "created": "2020-04-06T18:30:50.000",
            "status": "submit_wMsg",
            "statusRead": false,
            "history": [
                { "status": "submit_wMsg", "dateTime": "2020-04-06T18:30:50.000", "responseCode": 412, "msg": "Client and Voucher were successfully created. We couldn't send the voucher to phone 0777 576 4090.PLease give the voucher code directly to the client. Voucher: 1234" }
            ]
        },
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
    "clientDetails": {
        "firstName": "Greg",
        "lastName": "Chang",
        "phoneNumber": "27732462992",
        "clientId": "",
        "age": "47",
        "hairStyle": "braids"
    },
    "activities": [{
        "activityId": "LA_TEST_PROV_20200405_081636001",
        "activityDate": {
            "createdOnMdbUTC": "2020-04-05T08:17:06.877",
            "capturedUTC": "2020-04-05T08:16:35.000",
            "createdOnDeviceUTC": "2020-04-05T08:16:35.000",
            "capturedLoc": "2020-04-05T17:16:35.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "WalkInA",
        "processing": {
            "created": "2020-04-05T17:16:35.000",
            "status": "queued",
            "history": [
                { "status": "queued", "dateTime": "2020-04-05T17:16:35.000", "msg": "Created in PWA app" }
            ],
            "url": "/PWA.syncUp",
            "searchValues": {}
        },
        "transactions": [{
            "transactionType": "c_reg",
            "dataValues": {
                "firstName": "Greg",
                "lastName": "Chang",
                "phoneNumber": "27732462992",
                "clientId": "",
                "age": "47",
                "hairStyle": "braids"
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "33334444"
            }
        }],
        "dc": {}
    }],
    "_id": "5e86f102f39ff8047ee4f2b2",
    "updated": "2020-04-05T08:18:22.169"
}, {
    "clientDetails": {
        "firstName": "Mary",
        "lastName": "Canary",
        "phoneNumber": "0839891685",
        "clientId": "",
        "age": "23",
        "hairStyle": "bun"
    },
    "activities": [{
        "activityId": "LA_TEST_PROV_20200407_081636003",
        "activityDate": {
            "createdOnMdbUTC": "2020-04-07T08:17:06.877",
            "capturedUTC": "2020-04-07T08:16:31.000",
            "createdOnDeviceUTC": "2020-04-07T08:16:31.000",
            "capturedLoc": "2020-04-07T17:16:31.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "PhoneVoucher",
        "processing": {
            "created": "2020-04-05T17:16:35.000",
            "status": "failed",
            "history": [
                { "status": "queued", "dateTime": "2020-04-05T17:16:35.000", "msg": "Created in PWA app" }
                ,{ "status": "failed", "dateTime": "2020-04-07T17:16:35.000", "responseCode": 401, "msg": "Error msg... - more detail with responseCode" }
            ],
            "url": "/PWA.syncUp",
            "searchValues": {}
        },
        "transactions": [{
            "transactionType": "c_reg",
            "dataValues": {
                "firstName": "Mary",
                "lastName": "Canary",
                "phoneNumber": "0839891685",
                "clientId": "",
                "age": "23",
                "hairStyle": "bun"
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "112233445588"
            }
        }],
        "dc": {}
    }],
    "_id": "5e86f102f39ff8047ee4f2b6",
    "updated": "2020-04-07T08:18:22.169"
}, {
    "clientDetails": {
        "firstName": "Roger",
        "lastName": "Wolf",
        "phoneNumber": "0734471959",
        "clientId": "",
        "age": "32",
        "hairStyle": "bangs"
    },
    "activities": [{
        "activityId": "LA_TEST_PROV_20200406_091636003",
        "activityDate": {
            "createdOnMdbUTC": "2020-04-06T08:17:06.877",
            "capturedUTC": "2020-04-06T08:16:36.000",
            "createdOnDeviceUTC": "2020-04-06T08:16:36.000",
            "capturedLoc": "2020-04-06T17:16:36.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "WalkInB",
        "processing": {
            "created": "2020-04-06T17:16:35.000",
            "status": "submit",
            "history": [
                { "status": "submit", "dateTime": "2020-04-06T17:16:35.000", "responseCode": 200, "msg": "Synced - new add" }
            ],
            "url": "/PWA.syncUp",
            "searchValues": {}
        },
        "transactions": [{
            "transactionType": "c_reg",
            "dataValues": {
                "firstName": "Roger",
                "lastName": "Wolf",
                "phoneNumber": "0734471959",
                "clientId": "",
                "age": "32",
                "hairStyle": "bangs"
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "112233445589"
            }
        }],
        "dc": {}
    }],
    "_id": "5e86f102f39ff8047ee4f2D6",
    "updated": "2020-04-06T09:18:22.169"
}, {
    "clientDetails": {
        "firstName": "Jackson",
        "lastName": "Pollock",
        "phoneNumber": "0798985543",
        "clientId": "",
        "age": "65",
        "hairStyle": "bob"
    },
    "activities": [{
        "activityId": "LA_TEST_PROV_20191230_081706001",
        "activityDate": {
            "createdOnMdbUTC": "2019-12-30T08:17:06.877",
            "capturedUTC": "2019-12-30T08:16:36.000",
            "createdOnDeviceUTC": "2019-12-30T08:16:36.000",
            "capturedLoc": "2019-12-30T17:16:36.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "WalkInB",
        "processing": {
            "created": "2019-12-30T17:16:35.000",
            "status": "submit",
            "history": [
                { "status": "submit", "dateTime": "2020-04-06T17:16:35.000", "responseCode": 200, "msg": "Downloaded" }
            ],
            "url": "/PWA.syncUp",
            "searchValues": {}
        },
        "transactions": [{
            "transactionType": "c_reg",
            "dataValues": {
                "firstName": "Jackson",
                "lastName": "Pollock",
                "phoneNumber": "0798985543",
                "clientId": "",
                "age": "65",
                "hairStyle": "bob"
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "1010101010101"
            }
        }],
        "dc": {}
    }],
    "_id": "5e86f102f39ff8047ee4f2D6",
    "updated": "2019-12-30T08:17:06.876"
}];

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
    console.log( SessionManager.sessionData.dcdConfig.settings.redeemDefs );
};

DevHelper.showINFO = function()
{
    console.log( DevHelper.INFO );
};

DevHelper.setINFO_ForConsoleDisplay = function( INFO )
{
    DevHelper.INFO = INFO;
};

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

        WsCallManager.requestPost( url, payloadJson, loadingTag, function( success, mongoClientsJson ) {

            console.log( success, mongoClientsJson );
        });
    }
    catch( errMsg )
    {
        console.log( 'Error in DevHelper.TestRequestSend - ' + errMsg );
    }
};

DevHelper.testRun = function()
{
    var dest = { 'a1': [ { 'name': 'james' }, { 'name': 'mark' } ],
        'a2': 'james',
        'o1': { 'name': 'james', 'child': { 'age': 12, 'weight': 30 } }
          };
    var obj = { 'a1': [ { 'name': 'james1' }, { 'name': 'mark1' } ],
          'a2': 'mark',
          'a3': 'mark2',
          'o1': { 'name': 'mark', 'child': { 'age': 20, 'height': '23' }, 'hobby': 'fly' }
          };
    Util.mergeDeep( dest, obj );

    console.log( dest );
};

DevHelper.showFullPreview = function()
{
    var TEST_ITEM_ID = 'LA_TEST_PROV_20200407_081636003'; //LA_TEST_PROV_20200407_081636003

    // initialize
    var sheetFull = $( 'div.sheet_full-fs' );
    var screenHeight = document.body.clientHeight;

    console.log( sheetFull );
    console.log( cardCloseTag );

    // set styles
    sheetFull.css( 'z-index', 9999 );
    sheetFull.css( 'position', 'absolute' );
    sheetFull.css( 'left', '0' );
    sheetFull.css( 'top', '0' );
    sheetFull.css( 'width', '100%' );
    sheetFull.css( 'height', screenHeight ); // - 56
    sheetFull.css( 'background-color', '#fff' );


    // clear contents
    sheetFull.empty();


    // populate template
    sheetFull.html( $( Templates.activityCardFullScreen ) );

    // ADD TEST/DUMMY VALUE
    sheetFull.find( '.activity' ).attr( 'itemid', TEST_ITEM_ID )

    // update card content
    var actCard = new ActivityCard( TEST_ITEM_ID, DevHelper.cwsRenderObj, sheetFull ); //activityJson.activityId
    console.log( actCard );
    actCard.render();

    // set other events
    var cardCloseTag = sheetFull.find( 'img.btnBack' );

    cardCloseTag.click( function(){ 
        sheetFull.empty();
        sheetFull.fadeOut();
    });


    // render
    sheetFull.fadeIn();

}

    
DevHelper.configPreviewFull = function()
{
    var retData = {
        "definitionBlocks":{
            "blockDefaultOptionsOnline":{
                "blockType":"mainTab",
                "buttons":[  
                "imgBtn_SearchByVoucherOption",
                "imgBtn_SearchByPhonenumberOption",
                "imgBtn_DetailEnter"
                ],
                "message":{  
                "defaultMessage":"You are Online"
                }
            }
        },
        "definitionButtons": {
            "imgBtn_SearchByVoucherOption":{  
                "defaultLabel":"By voucher",
                "term":"tab_byVoucher",
                "buttonType":"imageButton",
                "imageSrc":"images/voucher.svg",
                "onClick":[
                   {  
                      "actionType":"clearOtherBlocks"
                   },
                   {  
                      "actionType":"openBlock",
                      "blockId":"blockSearchByVoucher",
                      "actionParameters":{  
                         "jsonData":{  
                         }
                      }
                   }
                ]
             }
        }
    }

}