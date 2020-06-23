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
DevHelper.tempCount = 0;

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
                "age": "14",
                "provisionMethod": "Pills"
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
                "hairStyle": "braids",
                "provisionMethod": "Condom"
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
                "hairStyle": "bun",
                "provisionMethod": "Condom"
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
                "hairStyle": "bangs",
                "provisionMethod": "Inject"
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "112233445589"
            }
        }],
        "dc": {}
    },
    {
        "activityId": "LA_TEST_PROV_20200506_091636003",
        "activityDate": {
            "createdOnMdbUTC": "2020-05-06T08:17:06.877",
            "capturedUTC": "2020-05-06T08:16:36.000",
            "createdOnDeviceUTC": "2020-05-06T08:16:36.000",
            "capturedLoc": "2020-05-06T17:16:36.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "WalkInB",
        "processing": {
            "created": "2020-05-06T17:16:35.000",
            "status": "submit",
            "history": [
                { "status": "submit", "dateTime": "2020-05-06T17:16:35.000", "responseCode": 200, "msg": "Synced - new add" }
            ],
            "url": "/PWA.syncUp",
            "searchValues": {}
        },
        "transactions": [{
            "transactionType": "v_rdm",
            "dataValues": {
                "voucherCode": "112233445589"
            }
        }],
        "dc": {}
    }],
    "_id": "5e86f102f39ff8047ee4f2D6",
    "updated": "2020-05-06T09:18:22.169"
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
                "hairStyle": "bob",
                "provisionMethod": "Condom"
            }
        }, {
            "transactionType": "v_iss",
            "dataValues": {
                "voucherCode": "1010101010101"
            }
        }],
        "dc": {}
    },
    {
        "activityId": "LA_TEST_PROV_20200130_081706001",
        "activityDate": {
            "createdOnMdbUTC": "2020-01-30T08:17:06.877",
            "capturedUTC": "2020-01-30T08:16:36.000",
            "createdOnDeviceUTC": "2020-01-30T08:16:36.000",
            "capturedLoc": "2020-01-30T17:16:36.000"
        },
        "activeUser": "qwertyuio3",
        "location": {},
        "program": "fpl",
        "activityType": "WalkInB",
        "processing": {
            "created": "2020-01-30T17:16:35.000",
            "status": "submit",
            "history": [
                { "status": "submit", "dateTime": "2020-04-06T17:16:35.000", "responseCode": 200, "msg": "Downloaded" }
            ],
            "url": "/PWA.syncUp",
            "searchValues": {}
        },
        "transactions": [
        {
            "transactionType": "v_rdm",
            "dataValues": {
                "voucherCode": "1010101010101"
            }
        }],
        "dc": {}
    }],
    "_id": "5e86f102f39ff8047ee4f2D6",
    "updated": "2020-01-30T08:17:06.876"
}];

DevHelper.crossfilterObj;

// =======================================

DevHelper.setUp = function( cwsRenderObj )
{
    DevHelper.cwsRenderObj = cwsRenderObj;
};

// =======================================

DevHelper.getCrossfilterObj = function()
{
    if ( !DevHelper.crossfilterObj ) 
    {
        DevHelper.crossfilterObj = crossfilter( DevHelper.sampleDataList );
    }

    return DevHelper.crossfilterObj;
};

DevHelper.switchConnectMode = function( connModeStr )
{
    if ( connModeStr === "STABLE" )
    {
        ConnManagerNew.efficiency.wsAvailCheck_Immediate = true;
        ConnManagerNew.efficiency.networkConnOnline_Immediate = false;
    }
    else if ( connModeStr === "ACCESSIBLE" )
    {
        ConnManagerNew.efficiency.wsAvailCheck_Immediate = true;
        ConnManagerNew.efficiency.networkConnOnline_Immediate = true;
        // More settings to ...
    }
};


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
    console.log( ConfigManager.getConfigJson().settings.redeemDefs );
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


DevHelper.crossfilter = function( clientAttr )
{    
    // How many issued?  redeemed?
    var dimension = DevHelper.getCrossfilterObj().dimension( function( client ) { 
        return client[ clientAttr ];
    });

    var lastUpdatedDim = DevHelper.getCrossfilterObj().dimension( function( client ) { 
        return client.lastUpdated;  // client.clientDetails.city or age
    });

    //console.log( trans_issued );

    //DevHelper.crossfilter().groupAll().reduceCount().value();


    return dimension;

    // Dimension - a target point value accumulated?  -- dataPoint in DHIS?  
    //  - Expensive to create - Allow only 8 or 16 max dimension on given time...
    //  var paymentsByTotal = payments.dimension(function(d) { return d.total; });

    // FILTER - trim out/filter the 'dimension' values
    //  paymentsByTotal.filter([100, 200]); // selects payments whose total is between 100 and 200
    //  paymentsByTotal.filter(120); // selects payments whose total equals 120
    //  paymentsByTotal.filter(function(d) { return d % 2; }); // selects payments whose total is odd

    // dimention.top() / bottom() / dispose()

    // Group - grouping by dimension value..
    //  var paymentGroupsByTotal = paymentsByTotal.group(function(total) { return Math.floor(total / 100); });


    // Test if child level can be referenced --> dimensioned..
};


DevHelper.cfIssued = function( transactionType )
{    
    return DevHelper.getCrossfilterObj().groupAll().reduceSum( function( client ) { 
        // client -> activities -> transactions -> "transactionType": "v_iss",

        var total_issued = 0;

        for( var i = 0; i < client.activities.length; i++ )
        {
            var activity = client.activities[ i ];
                        
            // transactionType - "v_iss"
            var issTransList = Util.getItemsFromList( activity.transactions, transactionType, "transactionType" );

            total_issued += issTransList.length;
        }

        return total_issued; 
    }).value();
};


DevHelper.cf_Example = function()
{
    // Source - https://blog.rusty.io/2012/09/17/crossfilter-tutorial/

    var livingThings = crossfilter([
        // Fact data.
        { name: 'Rusty',  type: 'human', legs: 2 },
        { name: 'Alex',   type: 'human', legs: 2 },
        { name: 'Lassie', type: 'dog',   legs: 4 },
        { name: 'Spot',   type: 'dog',   legs: 4 },
        { name: 'Polly',  type: 'bird',  legs: 2 },
        { name: 'Fiona',  type: 'plant', legs: 0 }
      ]);

    // How many living things are in my house?
    var n = livingThings.groupAll().reduceCount().value();
    console.log('There are ' + n + ' living things in my house.') // 6

    // How many total legs are in my house?
    var legs = livingThings.groupAll().reduceSum(function(fact) { return fact.legs; }).value()
    console.log('There are ' + legs + ' legs in my house.') // 14

    //dimension is something you want to group or filter by. Here, the dimension is going to be the type .

    // Filter for dogs.
    var typeDimension = livingThings.dimension(function(d) { return d.type; });
    typeDimension.filter('dog')


    // How many living things of each type are in my house?
    var countMeasure = typeDimension.group().reduceCount();
    var a = countMeasure.top(4);
    console.log('There are ' + a[0].value + ' ' + a[0].key + '(s) in my house.');
    console.log('There are ' + a[1].value + ' ' + a[1].key + '(s) in my house.');
    console.log('There are ' + a[2].value + ' ' + a[2].key + '(s) in my house.');
    console.log('There are ' + a[3].value + ' ' + a[3].key + '(s) in my house.');


    // How many legs of each type are in my house?
    var legMeasure = typeDimension.group().reduceSum(function(fact) { return fact.legs; });
    var a = legMeasure.top(4);
};



DevHelper.cf_Example2 = function()
{
    // Source - https://github.com/square/crossfilter/wiki/API-Reference

    var payments = crossfilter([
        {date: "2011-11-14T16:17:54Z", quantity: 2, total: 190, tip: 100, type: "tab"},
        {date: "2011-11-14T16:28:54Z", quantity: 1, total: 300, tip: 200, type: "visa"},
        {date: "2011-11-14T16:30:43Z", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:53:41Z", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:54:06Z", quantity: 1, total: 100, tip: 0, type: "cash"},
        {date: "2011-11-14T17:22:59Z", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T17:25:45Z", quantity: 2, total: 200, tip: 0, type: "cash"},
        {date: "2011-11-14T17:29:52Z", quantity: 1, total: 200, tip: 100, type: "visa"}
      ]);


    // DIMENSION
    var paymentsByTotal = payments.dimension(function(d) { return d.total; });

    // FILTER
    paymentsByTotal.filter([100, 200]); // selects payments whose total is between 100 and 200
    paymentsByTotal.filter(120); // selects payments whose total equals 120
    paymentsByTotal.filter(function(d) { return d % 2; }); // selects payments whose total is odd

    // TOP
    var topPayments = paymentsByTotal.top(4); // the top four payments, by total
    topPayments[0]; // the biggest payment

    // GROUP
    var paymentGroupsByTotal = paymentsByTotal.group(function(total) { return Math.floor(total / 100); });
    

    // EXAMPLE - Group by type and get 'total' on each group.  Get top 1 total sum by type.
    var paymentsByType = payments.dimension(function(d) { return d.type; }),
    paymentVolumeByType = paymentsByType.group().reduceSum(function(d) { return d.total; }),
    topTypes = paymentVolumeByType.top(1);
    topTypes[0].key; // the top payment type (e.g., "tab")

    // EXAMPLE - Return the most record counts by 'type'
    var paymentsByType = payments.dimension(function(d) { return d.type; }),
    paymentCountByType = paymentsByType.group(),
    topTypes = paymentCountByType.top(1);
    topTypes[0].key; // the top payment type (e.g., "tab")
    topTypes[0].value; // the count of payments of that type (e.g., 8)

};



DevHelper.cf_e3 = function()
{
    var cf = crossfilter([
        { Country: "Brazil", Year: 1986, DMFT: 6.7 },
        { Country: "Brazil", Year: 1994, DMFT: 4.9 },
        { Country: "Canada", Year: 1974, DMFT: 4.4 }
    ]);

    var cf_country = cf.dimension(function(d) { return d.Country; });

    DevHelper.totable( cf_country.top(Infinity) );

    // Filter
    DevHelper.totable( cf_country.filter( 'Brazil' ).top(Infinity) );
};


DevHelper.totable = function( json ) 
{
    var html = "";

    json.forEach(function(row) {
        html += "<tr>";
        var dataStr = '';

        for ( key in row ) {
              html += "<td>"+row[key]+"</td>";

              dataStr += row[key] + ', ';
        };

        console.log( dataStr );

        html += "</tr>";
    });

    //return "<table>" + html + "</table>";
}

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

DevHelper.statPeriodOptions = function()
{
	var dateGroups = [ { name: "Last 24 hours", term: "", hours: 24, created: 0 },
			{ name: "Last 3 days", term: "", hours: 72 , created: 0 },
			{ name: "Last 7 days", term: "", hours: 168, created: 0 },
			{ name: "Last 30 days", term: "", hours: 720, created: 0 },
			{ name: "Last 3 months", term: "", hours: 2160, created: 0 },
            { name: "Last 6 months", term: "", hours: 4320, created: 0 } ];

    return dateGroups;

}
