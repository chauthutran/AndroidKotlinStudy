// -------------------------------------------
// -- BlockMsg Class/Methods
function myDetails(cwsRender) {
    var me = this;

    me.cwsRenderObj = cwsRender;

    me.myDetailsDivTag = $('#detailsFormDiv');
    me.detailsContentDivTag = $( '#detailsContentDiv' );

    // TODO: NEED TO IMPLEMENT
    // =============================================
    // === TEMPLATE METHODS ========================

    me.initialize = function () {

    }

    $( 'img.btnMyDetailsBack' ).click( () =>
        {
            me.hidemyDetailsPage();
        } );

    me.loadFormData = function () 
    {

        me.showmyDetailsPage();

        var myJson = FormUtil.fetchMyDetails().result.msg.response;

        var myDhisName = myJson.outlet[0].dhisName;
        var myAddress = myJson.outlet[0].location.address;
        var myArea = myJson.outlet[0].location.area;
        var myAreaSub = myJson.outlet[0].location.areaSub;
        var myPhoneNumber = myJson.outlet[0].phoneNumber;
        var myHours = (myJson.outlet[0].openingHours);
        var mayProvider = myJson.outlet[0].providers[0].providerName;
        var myServices = myJson.outlet[0].servicesStandard;
        var areaString ='';

        //Name
        if (typeof myDhisName === 'undefined') {
            $('td.searchResultMainName').html('Outlet name undefined');
        } else {
            $('td.searchResultMainName').html(myDhisName);
        }

        //Address
        if (typeof myAddress === 'undefined') {
            $('td.previewCardAddress').html('<b>Address undefined');
        } else {
            var arrayAddress = myAddress.split('|');
            $('td.previewCardAddress').html(arrayAddress[0]+'<br/>'+arrayAddress[1]);
        }

        //Area & AreaSub
        if (typeof myArea === 'undefined') {
            areaString = 'Area undefined';
        } else {
            areaString = myArea;
        }

        if (typeof myAreaSub === 'undefined') {
            $('td.searchResultLocationArea').html(areaString+', SubArea undefined');
        } else {
            $('td.searchResultLocationArea').html(areaString+', '+myAreaSub);
        }

        //Phone
        if (typeof myPhoneNumber === 'undefined') {
            $('td.searchResultSubLocationArea').html('<b>Phone number undefined');
        } else {
            $('td.searchResultPhoneNumber').html('+'+myPhoneNumber);
        }

        //OpeningHours
        if (typeof myHours === 'undefined') {
            $('td.previewCardOperatingHours').html('Opening hours undefined');
        } else {
            var arrayHours = myHours.split(/,|;/);
            var myString = '';
            var endLine = true;
            for (var i = 0; i < arrayHours.length; i++) {
                if (arrayHours[i] == 'Mo-Fr' || arrayHours[i] == 'Mo-Sa' || arrayHours[i] == 'Sa') {
                    myString = myString + '<label><b>' + arrayHours[i] + '</b></label><br/>';
                } else {
                    if (endLine == true) {
                        myString = myString + '<label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + arrayHours[i] + ' - ';
                        endLine = false;
                    } else {
                        myString = myString + arrayHours[i] + '</label><br/>';
                        endLine = true;
                    }
                }
            };
            $('td.previewCardOperatingHours').html(myString);
        }

        //Provider name
        if (typeof mayProvider === 'undefined') {
            $('td.previewCardProviderName').html('<b>Provider: </b> undefined');
        } else {
            $('td.previewCardProviderName').html('<b>Provider: </b>' +mayProvider);
        }

        //Services
        if (typeof myServices === 'undefined') {
            $('td.servicesRow').html('<b>Services: </b>undefined');
        } else {
            $('td.servicesRow').html('<b>Services: </b>' +myServices);
        }

    }
    

    // ------------------------------------
    me.showmyDetailsPage = function()
    {
        /*if ( $( 'div.mainDiv' ).is( ":visible" ) )
        {
            $( 'div.mainDiv' ).hide();
        }*/

        if ( me.cwsRenderObj.pageDivTag.is( ":visible" ) )
        {
            me.cwsRenderObj.pageDivTag.hide();
        }

        if ( $( '#loginFormDiv' ).is( ":visible" ) )
        {
            $( '#loginFormDiv' ).hide();
        }

        me.myDetailsDivTag.show( 'fast' );    
    }

    me.hidemyDetailsPage = function()
    {
        me.myDetailsDivTag.fadeOut( 500 );

        setTimeout( function() {

            if ( SessionManager.getLoginStatus() )
            {
                //$( 'div.mainDiv' ).show( 'fast' );
                me.cwsRenderObj.pageDivTag.show( 'fast' );
            }
            else
            {
                $( '#loginFormDiv' ).show( 'fast' );
            }

            me.myDetailsDivTag.hide();

        }, 250 );

    }
    
    me.initialize();

    
}


/*
FormUtil.getMyDetails = function( callBack )
{
	//https://cws-dhis.psi-mis.org/dws/locator.api/?code=
	//https://pwa.psi-connect.org/ws/dws/locator.api/?code=
	var targetURL = 'https://pwa.psi-connect.org/ws/dws/locator.api/?code=' + SessionManager.sessionData.login_UserName;

	var payload = {
		"action-details": 2,
		"config.action": "https://cws-dhis.psi-mis.org/api/dataStore/Connect_config/dws@locator@api",
		"username": "pwa",
		"password": "529n3KpyjcNcBMsP"
	};

	let request = new Request(targetURL, {
		method: 'POST',
		crossDomain : true,
		headers: {
		  'Content-Type': 'application/json',
		  "Authorization": "Basic " + btoa( payload.username + ":" + payload.password ) 
		},
		body: JSON.stringify(payload)
	});

	fetch(request)
        .then((response) => {
			console.customLog( response );
            if (!response.ok) {
                throw Error(response.statusText);
			}
			if ( callBack )
			{
				callBack( response.json() );
			} 
			else
			{
				return response;
			}
        })
		.then( (response) => { 
			if ( callBack )
			{
				callBack( response.json() );
			} 
			else
			{
				return response.json;
			}
		} );
};


FormUtil.fetchMyDetails = function ( useAPI, returnFunc ) 
{

	if ( useAPI != undefined && useAPI == true )
	{

		var myD_username = 'pwa'; //SessionManager.sessionData.login_UserName;
		var myD_password = '529n3KpyjcNcBMsP'; //SessionManager.sessionData.login_Password;
		var server_url = 'https://replica.psi-mis.org/' + 'locator/api/1?code=NP-OHF-3122';

		if ( 1 == 1)
		{

			let result = $.when($.ajax({
				url: "https://replica.psi-mis.org/locator/api/1?uid=B4b76ISunPi",
				headers: {
					'Authorization': 'Basic Y2hhdGJvdGNob2NvbGF0ZTpOeGgkS1Y2U3FrNndR',
					'Content-Type': 'application/json'
				}
			})).done(function(data) {
				console.customLog("response", data);
				return data;
			})
			console.customLog("testing", result);
			return result;
		}
		else
		{
			fetch( server_url , { method: 'get', headers: { 'Authorization': 'Basic' + btoa(myD_username + ':' + myD_password) } } )
			.then( response => {
				if ( response.ok ) return response.json();
				else if ( response.statusText ) throw Error( response.statusText )
			})
			.then( jsonData => {
				if ( returnFunc ) returnFunc( true, jsonData );
			})
			.catch( error => {
				if ( WsApiManager.isDebugMode )
				{
					console.customLog( 'Failed to retrieve url - ' + server_url );
					console.customLog( error );  
					//alert( 'Failed to load the config file' );
				}
				if ( returnFunc ) returnFunc( false, { "response": error.toString() } );
			});
		}
		
	
	}
	else
	{

		//https://replica.psi-mis.org/locator/api/1?code=NP-OHF-3122
		//https://replica.psi-mis.org/locator/api/1?code=NP_TEST_PROV
		
		return {
			"result": {
				"msg": {
					"response": {
						"returnCode": "200",
						"outlet": [
							{
								"dhisCode": "NP-OHF-8858",
								"dhisId": "X7FJl3bf9KH",
								"servicesStandard": "Family Planning, Maternity, MA, MVA",
								"description": "Description about Me",
								"url": "http://www.testoutlet.com",
								"outletName": "NP Outlet Test",
								"path": "/WFFJSzhyMAO/ACVBeX3Cl0J/bgnqePvj4Oz/X7FJl3bf9KH",
								"phoneNumber": "984123345",
								"postgresId": "798523356",
								"closedDate": "2021-12-31",
								"locatorType": "OUT",
								"dhisName": "NP Outlet Test (OHF-8858)",
								"openingHours": "Mo-Fr,9:00,13:00,15:00,19:00;Sa,9:00,13:30",
								"comment": "Comment about Test outlet",
								"location": {
									"area": "Lagankhel",
									"areaSub": "Bus Stop",
									"address": "Kantipath, Kathmandu",
									"latitude": 27.668306,
									"longitude": 85.31838
								},
								"openingDate": "2019-06-23",
								"email": "testperson@gmail.com",
								"providers": [
									{
										"gender": "F",
										"dhisId": "CRcXVby89hP",
										"providerName": "Prov - 3"
									},
									{
										"gender": "F",
										"dhisId": "DSKZ0IXIarC",
										"providerName": "prov-2"
									},
									{
										"gender": "F",
										"dhisId": "Vwnc7T1CAyh",
										"providerName": "prov - 5"
									},
									{
										"gender": "F",
										"dhisId": "VNX2O8qEIPC",
										"providerName": "Prov - 4"
									},
									{
										"gender": "F",
										"dhisId": "HJ2XC2c07R9",
										"providerName": "prov-1"
									}
								]
							}
						],
						"status": "Showing 1 OrgUnits"
					}
				}
			},
			"actionDetails": [
				{
					"auth": {
						"action": {
							"authorised": true
						},
						"actionDefinition": {
							"eval": [
								"function b2a(r){var t,c,e,h,a,n,A,i,o,l='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',d=0,u=0,C='',f=[];if(!r)return r;do t=r.charCodeAt(d++),c=r.charCodeAt(d++),e=r.charCodeAt(d++),i=t<<16|c<<8|e,h=63&i>>18,a=63&i>>12,n=63&i>>6,A=63&i,f[u++]=l.charAt(h)+l.charAt(a)+l.charAt(n)+l.charAt(A);while(d<r.length);return C=f.join(''),o=r.length%3,(o?C.slice(0,o-3):C)+'==='.slice(o||3)}",
								"function a2b(r){var o,t,a,f={},n=0,h=0,c='',e=String.fromCharCode,g=r.length;for(o=0;64>o;o++)f['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.charAt(o)]=o;for(t=0;g>t;t++)for(o=f[r.charAt(t)],n=(n<<6)+o,h+=6;h>=8;)((a=255&n>>>(h-=8))||g-2>t)&&(c+=e(a));return c}",
								"var auth = {};",
								"auth.authorised = incomingHeader.authorization === 'Basic ' + b2a('pwa:529n3KpyjcNcBMsP');"
							],
							"goTo": " goTo = ( auth.authorised ) ? 'authValid' : 'authInvalid' ; ",
							"id": "auth",
							"requestData": null
						}
					}
				},
				{
					"authValid": {
						"action": {
							"msg": "AUTH SUCCESS"
						},
						"actionDefinition": {
							"eval": "authValid.msg = 'AUTH SUCCESS' ;",
							"goTo": " goTo = 'reading' ;",
							"id": "authValid",
							"requestData": null
						}
					}
				},
				{
					"reading": {
						"action": {
							"code": "NP-OHF-8858"
						},
						"actionDefinition": {
							"eval": [
								"reading = {} ;",
								"reading.code = incomingParams.code[0] ;"
							],
							"goTo": " goTo = 'readingAuthDetails';",
							"id": "reading",
							"requestData": null
						}
					}
				},
				{
					"readingAuthDetails": {
						"action": {},
						"actionDefinition": {
							"eval": [
								"var payload = {};",
								"payload.username = incomingPayload.username;",
								"payload.password = incomingPayload.password;"
							],
							"goTo": " goTo = 'storage' ;",
							"id": "readingAuthDetails",
							"requestData": null
						}
					}
				},
				{
					"storage": {
						"action": {
							"payload": {
								"password": "529n3KpyjcNcBMsP",
								"username": "pwa"
							}
						},
						"actionDefinition": {
							"eval": [
								"var storage = {};",
								"storage.payload = payload;"
							],
							"goTo": " goTo = 'send' ;",
							"id": "storage",
							"requestData": null
						}
					}
				},
				{
					"send": {
						"action": {
							"response": {
								"returnCode": "200",
								"outlet": [
									{
										"dhisCode": "NP-OHF-8858",
										"dhisId": "X7FJl3bf9KH",
										"servicesStandard": "Family Planning, Maternity, MA, MVA",
										"description": "Description about Me",
										"url": "http://www.testoutlet.com",
										"outletName": "NP Outlet Test",
										"path": "/WFFJSzhyMAO/ACVBeX3Cl0J/bgnqePvj4Oz/X7FJl3bf9KH",
										"phoneNumber": "984123345",
										"postgresId": "798523356",
										"closedDate": "2021-12-31",
										"locatorType": "OUT",
										"dhisName": "NP Outlet Test (OHF-8858)",
										"openingHours": "Mo-Fr,9:00,13:00,15:00,19:00;Sa,9:00,13:30",
										"comment": "Comment about Test outlet",
										"location": {
											"area": "Lagankhel",
											"areaSub": "Bus Stop",
											"address": "Kantipath, Kathmandu",
											"latitude": 27.668306,
											"longitude": 85.31838
										},
										"openingDate": "2019-06-23",
										"email": "testperson@gmail.com",
										"providers": [
											{
												"gender": "F",
												"dhisId": "CRcXVby89hP",
												"providerName": "Prov - 3"
											},
											{
												"gender": "F",
												"dhisId": "DSKZ0IXIarC",
												"providerName": "prov-2"
											},
											{
												"gender": "F",
												"dhisId": "Vwnc7T1CAyh",
												"providerName": "prov - 5"
											},
											{
												"gender": "F",
												"dhisId": "VNX2O8qEIPC",
												"providerName": "Prov - 4"
											},
											{
												"gender": "F",
												"dhisId": "HJ2XC2c07R9",
												"providerName": "prov-1"
											}
										]
									}
								],
								"status": "Showing 1 OrgUnits"
							}
						},
						"actionDefinition": {
							"eval": null,
							"goTo": " goTo = 'response' ;",
							"id": "send",
							"requestData": {
								"input": "storage",
								"method": "POST",
								"sourceType": "BASIC_AUTH",
								"URL": "server+'/api/1?code=' + reading.code;"
							}
						}
					}
				},
				{
					"response": {
						"action": {
							"msg": {
								"response": {
									"returnCode": "200",
									"outlet": [
										{
											"dhisCode": "NP-OHF-8858",
											"dhisId": "X7FJl3bf9KH",
											"servicesStandard": "Family Planning, Maternity, MA, MVA",
											"description": "Description about Me",
											"url": "http://www.testoutlet.com",
											"outletName": "NP Outlet Test",
											"path": "/WFFJSzhyMAO/ACVBeX3Cl0J/bgnqePvj4Oz/X7FJl3bf9KH",
											"phoneNumber": "984123345",
											"postgresId": "798523356",
											"closedDate": "2021-12-31",
											"locatorType": "OUT",
											"dhisName": "NP Outlet Test (OHF-8858)",
											"openingHours": "Mo-Fr,9:00,13:00,15:00,19:00;Sa,9:00,13:30",
											"comment": "Comment about Test outlet",
											"location": {
												"area": "Lagankhel",
												"areaSub": "Bus Stop",
												"address": "Kantipath, Kathmandu",
												"latitude": 27.668306,
												"longitude": 85.31838
											},
											"openingDate": "2019-06-23",
											"email": "testperson@gmail.com",
											"providers": [
												{
													"gender": "F",
													"dhisId": "CRcXVby89hP",
													"providerName": "Prov - 3"
												},
												{
													"gender": "F",
													"dhisId": "DSKZ0IXIarC",
													"providerName": "prov-2"
												},
												{
													"gender": "F",
													"dhisId": "Vwnc7T1CAyh",
													"providerName": "prov - 5"
												},
												{
													"gender": "F",
													"dhisId": "VNX2O8qEIPC",
													"providerName": "Prov - 4"
												},
												{
													"gender": "F",
													"dhisId": "HJ2XC2c07R9",
													"providerName": "prov-1"
												}
											]
										}
									],
									"status": "Showing 1 OrgUnits"
								}
							}
						},
						"actionDefinition": {
							"eval": [
								"var response = {};",
								"response.msg = send;"
							],
							"goTo": " goTo = 'FINISH' ;",
							"id": "response",
							"requestData": null
						}
					}
				}
			]
		}
	
	}

};
*/