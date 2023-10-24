
const fetch = require("node-fetch");
const { _FHIR_USR, _FHIR_PWD, _FHIR_PROJECT } = require('./../config');


class RESTRequestUtils {

	constructor() {
	
	};

    sendGetRequest = function( url, exeFunc ) {
        console.log(url);

        fetch(url, {
            method:'GET',
            headers: {"Content-Type": "application/json", "project": _FHIR_PROJECT, "Authorization": "Basic " + btoa(_FHIR_USR + ':' + _FHIR_PWD)}})
            .then(response => response.json())
            .then((result) => {
                exeFunc({status: "success", data: result, url: url});
            }).catch((error) => {
                console.log("error: " + error);
                exeFunc({status: "error", data: error, url: url});
            });
	};

    sendPostRequest = function( url, data, exeFunc ) {
        console.log(url);
        
        fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json", "project": _FHIR_PROJECT, "Authorization": "Basic " + btoa(_FHIR_USR + ':' + _FHIR_PWD)},
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
	};

}

module.exports = {
    RESTRequestUtils
};
  